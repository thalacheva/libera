import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Отделите на храносмилателната система: pH на съдържанието и колко време прекарва храната в тях (приблизително). */
const STAGES = [
  { name: 'уста', ph: 6.8, time: 'до 1 min' },
  { name: 'хранопровод', ph: 7, time: '5–10 s' },
  { name: 'стомах', ph: 2, time: '2–4 h' },
  { name: 'дванадесетопръстник', short: '12-пръстник', ph: 6.5, time: 'минути' },
  { name: 'тънко черво', ph: 7.4, time: '3–5 h' },
  { name: 'дебело черво', ph: 6.5, time: '1–2 дни' },
];

type Enzyme = { name: string; from: number; to: number; opt: number; width?: number; pancreas?: boolean; acts: string };
/** Ензимите: в кои отдели (from…to) действат и при какво pH работят най-добре. */
const ENZYMES: Enzyme[] = [
  { name: 'слюнчена амилаза', from: 0, to: 2, opt: 6.8, acts: 'нишесте → малтоза' },
  { name: 'пепсин', from: 2, to: 2, opt: 2, acts: 'белтъци → пептиди' },
  { name: 'стомашна липаза', from: 2, to: 3, opt: 4.5, width: 2.5, acts: 'мазнини → мастни киселини' },
  { name: 'панкреатична амилаза', from: 3, to: 4, opt: 7, pancreas: true, acts: 'нишесте → малтоза' },
  { name: 'трипсин', from: 3, to: 4, opt: 8, pancreas: true, acts: 'белтъци и пептиди → по-къси пептиди' },
  { name: 'панкреатична липаза', from: 3, to: 4, opt: 8, pancreas: true, acts: 'мазнини → мастни киселини + моноглицериди' },
  { name: 'малтаза, пептидази', from: 4, to: 4, opt: 7, acts: 'малтоза → глюкоза, пептиди → аминокиселини' },
];

/** Активност на ензима при дадено pH: камбана около оптимума. */
const activity = (ph: number, opt: number, width = 1.3) => Math.exp(-(((ph - opt) / width) ** 2));

const MEALS = {
  bread: { name: 'филия хляб', starch: 1, protein: 0.25, fat: 0.1 },
  meat: { name: 'кюфте', starch: 0, protein: 1, fat: 0.8 },
  butter: { name: 'масло', starch: 0, protein: 0.02, fat: 1 },
  sandwich: { name: 'сандвич', starch: 0.8, protein: 0.6, fat: 0.5 },
};
type MealKey = keyof typeof MEALS;

/** Състояние на едно вещество: [неразградено, междинно, всмукано] като части от 1. */
type State = [number, number, number];

/** Проследява храната до края на отдел `upTo`. */
function simulate(upTo: number, bile: boolean, pancreas: boolean) {
  const starch: State = [1, 0, 0];
  const protein: State = [1, 0, 0];
  const fat: State = [1, 0, 0];
  const cut = (s: State, k: number) => {
    const d = s[0] * k;
    s[0] -= d;
    s[1] += d;
  };
  const absorb = (s: State, k: number) => {
    const d = s[1] * k;
    s[1] -= d;
    s[2] += d;
  };
  for (let i = 0; i <= upTo; i++) {
    if (i === 0) cut(starch, 0.05);
    if (i === 2) {
      // амилазата работи още малко вътре в хапката, докато киселината я достигне
      cut(starch, 0.1);
      cut(protein, 0.15);
      cut(fat, 0.1);
    }
    if (i === 3 || i === 4) {
      if (pancreas) {
        cut(starch, 0.85);
        cut(protein, 0.8);
        // липазата работи по повърхността на капките – без жлъчка тя е малка
        cut(fat, bile ? 0.75 : 0.15);
      }
    }
    if (i === 4) {
      absorb(starch, 0.97);
      absorb(protein, 0.95);
      // мастните киселини се пренасят до стената в мицели от жлъчни соли
      absorb(fat, bile ? 0.95 : 0.5);
    }
  }
  return { starch, protein, fat };
}

const pct = (v: number) => `${Math.round(v * 100)} %`;
const fmtPh = (v: number) => v.toFixed(1).replace('.', ',');

const X0 = 20;
const SEG_W = 100;

/** Храната минава през отделите; виждаме кои ензими работят там и колко от всяко вещество е разградено и всмукано. */
export default function DigestiveTractLab() {
  const [meal, setMeal] = useState<MealKey>('sandwich');
  const [stage, setStage] = useState(0);
  const [bile, setBile] = useState(true);
  const [pancreas, setPancreas] = useState(true);

  const m = MEALS[meal];
  const st = STAGES[stage];
  const r = simulate(stage, bile, pancreas);
  const rows = [
    { name: 'нишесте', amount: m.starch, s: r.starch, mid: 'малтоза', end: 'глюкоза', color: '#f59e0b' },
    { name: 'белтъци', amount: m.protein, s: r.protein, mid: 'пептиди', end: 'аминокиселини', color: '#e11d48' },
    { name: 'мазнини', amount: m.fat, s: r.fat, mid: 'мастни к-ни', end: 'в лимфата', color: '#0ea5e9' },
  ].filter(x => x.amount > 0.05);

  const present = ENZYMES.filter(e => e.from <= stage && stage <= e.to && !(e.pancreas && !pancreas));
  const leftover = stage === 5 ? rows.filter(x => x.s[0] + x.s[1] > 0.2).map(x => x.name) : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {(Object.keys(MEALS) as MealKey[]).map(k => (
          <DiagramButton key={k} active={meal === k} onClick={() => setMeal(k)}>
            {MEALS[k].name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 640 300" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* тръбата */}
        {STAGES.map((s, i) => {
          const x = X0 + i * SEG_W;
          const acid = s.ph < 4;
          return (
            <g key={s.name} onClick={() => setStage(i)} className="cursor-pointer">
              <rect
                x={x}
                y={30}
                width={SEG_W - 6}
                height={50}
                rx={14}
                fill={acid ? '#fda4af' : '#fecdd3'}
                stroke={i === stage ? '#e11d48' : '#fb7185'}
                strokeWidth={i === stage ? 3 : 1}
                opacity={i <= stage ? 1 : 0.5}
              />
              <text x={x + (SEG_W - 6) / 2} y={22} fontSize="11" textAnchor="middle" fill="currentColor" fontWeight={i === stage ? 700 : 400}>
                {s.short ?? s.name}
              </text>
              <text x={x + (SEG_W - 6) / 2} y={98} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                pH {fmtPh(s.ph)}
              </text>
            </g>
          );
        })}
        {/* хапката */}
        <circle cx={X0 + stage * SEG_W + (SEG_W - 6) / 2} cy={55} r={13} fill="#a16207" stroke="#78350f" strokeWidth={2} />
        {/* жлъчка и панкреас влизат в дванадесетопръстника */}
        <path d={`M ${X0 + 3 * SEG_W + 20} 112 l 0 -30`} stroke={bile ? '#65a30d' : '#d4d4d4'} strokeWidth={3} />
        <text x={X0 + 3 * SEG_W + 14} y={124} fontSize="10" textAnchor="end" fill={bile ? '#65a30d' : '#a3a3a3'}>
          жлъчка
        </text>
        <path d={`M ${X0 + 3 * SEG_W + 70} 112 l 0 -30`} stroke={pancreas ? '#7c3aed' : '#d4d4d4'} strokeWidth={3} />
        <text x={X0 + 3 * SEG_W + 76} y={124} fontSize="10" fill={pancreas ? '#7c3aed' : '#a3a3a3'}>
          панкреас
        </text>

        {/* веществата */}
        <text x={20} y={152} fontSize="12" fontWeight="700" fill="currentColor">
          Какво е станало с храната досега
        </text>
        {rows.map((row, k) => {
          const y = 166 + k * 38;
          const [a, b, c] = row.s;
          const bx = 110;
          const bw = 400;
          return (
            <g key={row.name}>
              <text x={bx - 8} y={y + 16} fontSize="12" textAnchor="end" fill="currentColor">
                {row.name}
              </text>
              <rect x={bx} y={y} width={bw * a} height={22} fill={row.color} opacity={0.9} />
              <rect x={bx + bw * a} y={y} width={bw * b} height={22} fill={row.color} opacity={0.45} />
              <rect x={bx + bw * (a + b)} y={y} width={bw * c} height={22} fill="#10b981" opacity={0.85} />
              <rect x={bx} y={y} width={bw} height={22} fill="none" className="stroke-gray-300 dark:stroke-gray-600" />
              <text x={bx + bw + 8} y={y + 11} fontSize="10" fill="currentColor">
                {row.mid}: {pct(b)}
              </text>
              <text x={bx + bw + 8} y={y + 23} fontSize="10" fill="#059669">
                {row.end}: {pct(c)}
              </text>
            </g>
          );
        })}
        <text x={110} y={290} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          плътно – неразградено · бледо – частично разградено · зелено – всмукано
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={() => setStage(s => Math.max(0, s - 1))}>← назад</DiagramButton>
        <DiagramButton onClick={() => setStage(s => Math.min(5, s + 1))}>напред →</DiagramButton>
        <DiagramButton active={bile} onClick={() => setBile(v => !v)}>
          жлъчка {bile ? '✓' : '✗'}
        </DiagramButton>
        <DiagramButton active={pancreas} onClick={() => setPancreas(v => !v)}>
          панкреас {pancreas ? '✓' : '✗'}
        </DiagramButton>
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'отдел', value: st.name, tone: 'rose' },
            { label: 'pH', value: fmtPh(st.ph), tone: 'amber' },
            { label: 'време', value: st.time, tone: 'blue' },
          ]}
        />
      </div>

      <div className="max-w-xl mx-auto mt-3 space-y-1">
        {present.length === 0 && <p className="text-sm text-center text-gray-500 dark:text-gray-400">Тук не се отделят храносмилателни ензими.</p>}
        {present.map(e => {
          const a = activity(st.ph, e.opt, e.width);
          return (
            <div key={e.name} title={e.acts} className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-32 sm:w-44 flex-shrink-0 text-gray-700 dark:text-gray-200">{e.name}</span>
              <span className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <span className="block h-full bg-rose-500" style={{ width: `${Math.round(a * 100)}%` }} />
              </span>
              <span className="w-24 sm:w-28 flex-shrink-0 text-gray-500 dark:text-gray-400">опт. pH {fmtPh(e.opt)}</span>
            </div>
          );
        })}
      </div>

      <Note tone="rose">
        {stage === 0
          ? 'В устата слюнчената амилаза започва да разгражда нишестето – но храната стои там само секунди.'
          : stage === 1
            ? 'Хранопроводът само пренася хапката с перисталтика; ензими тук не се отделят.'
            : stage === 2
              ? 'Солната киселина сваля pH до около 2: пепсинът работи, а слюнчената амилаза спира, щом киселината проникне в хапката.'
              : stage === 3
                ? !pancreas
                  ? 'Без панкреатичен сок в червото почти нищо не се разгражда – нишестето, белтъците и мазнините продължават неразградени.'
                  : !bile
                    ? 'Без жлъчка мазнините остават в едри капки и липазата има малко повърхност за работа.'
                    : 'Бикарбонатът от панкреаса неутрализира киселината; панкреатичните ензими разграждат и трите вида вещества.'
                : stage === 4
                  ? 'Ензимите по мембраната на въсинките довършват работата, а глюкозата, аминокиселините и мастните киселини се всмукват.'
                  : leftover.length
                    ? `В дебелото черво стигат много неразградени ${leftover.length > 1 ? `${leftover.slice(0, -1).join(', ')} и ${leftover[leftover.length - 1]}` : leftover[0]} – това води до разстройство и загуба на хранителни вещества.`
                    : 'В дебелото черво стигат главно фибри и вода; тук се всмуква водата, а бактериите разграждат част от фибрите.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Числата са опростен модел, а не измервания. Лентите показват каква част от всяко вещество е останала неразградена, каква е разградена до
        междинни продукти и каква е всмукана. Активността на ензимите е камбана около оптималното им pH. Изключи жлъчката или панкреаса и
        проследи храната до дебелото черво.
      </p>
    </div>
  );
}
