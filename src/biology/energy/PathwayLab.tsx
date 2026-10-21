import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { MathText } from '~/MathText';

type Mode = 'aerobic' | 'lactic' | 'alcoholic';

type Tally = { atpS: number; atpOx: number; nadh: number; fadh: number; co2: number; o2: number };

/** Стъпките за една молекула глюкоза. Числата са в съвременния модел (НАДН → 2,5 АТФ, ФАДН₂ → 1,5 АТФ). */
const AEROBIC: { name: string; place: string; tally: Tally; note: string }[] = [
  {
    name: 'Глюкоза',
    place: 'цитоплазма',
    tally: { atpS: 0, atpOx: 0, nadh: 0, fadh: 0, co2: 0, o2: 0 },
    note: 'Една молекула глюкоза ($\\mathrm{C_6H_{12}O_6}$) – 6 въглеродни атома. Натисни „Напред“ и следи къде отиват.',
  },
  {
    name: 'Гликолиза',
    place: 'цитоплазма',
    tally: { atpS: 2, atpOx: 0, nadh: 2, fadh: 0, co2: 0, o2: 0 },
    note: 'Глюкозата се разцепва на 2 пирувата (по 3 C). Изразходват се 2 АТФ, получават се 4 – печалба 2 АТФ и 2 НАДН. Кислород не е нужен.',
  },
  {
    name: 'Окисление на пирувата',
    place: 'матрикс на митохондрията',
    tally: { atpS: 2, atpOx: 0, nadh: 4, fadh: 0, co2: 2, o2: 0 },
    note: 'Всеки пируват влиза в митохондрията, губи един C като $\\mathrm{CO_2}$ и става ацетил-КоА (2 C). Още 2 НАДН.',
  },
  {
    name: 'Цикъл на Кребс',
    place: 'матрикс на митохондрията',
    tally: { atpS: 4, atpOx: 0, nadh: 10, fadh: 2, co2: 6, o2: 0 },
    note: 'Всеки ацетил се свързва с оксалоацетат (4 C) до цитрат (6 C), а цикълът отделя 2 $\\mathrm{CO_2}$ и възстановява оксалоацетата. За двата оборота: 2 АТФ, 6 НАДН, 2 ФАДН₂, 4 $\\mathrm{CO_2}$. Въглеродът на глюкозата вече е изцяло в $\\mathrm{CO_2}$.',
  },
  {
    name: 'Дихателна верига',
    place: 'вътрешна мембрана',
    tally: { atpS: 4, atpOx: 28, nadh: 0, fadh: 0, co2: 6, o2: 6 },
    note: 'НАДН и ФАДН₂ дават електроните си на веригата; накрая те се приемат от кислорода и се получава вода. Енергията изпомпва H⁺, а АТФ синтазата прави около 28 АТФ. Общо ≈ 32 АТФ.',
  },
];

const FERMENT: Record<'lactic' | 'alcoholic', { name: string; tally: Tally; product: string; note: string }> = {
  lactic: {
    name: 'Млечнокисела ферментация',
    tally: { atpS: 2, atpOx: 0, nadh: 0, fadh: 0, co2: 0, o2: 0 },
    product: '2 лактат',
    note: 'Без кислород дихателната верига спира и НАД⁺ свършва. В мускула пируватът приема водорода от НАДН и става лактат (млечна киселина) – НАД⁺ се освобождава и гликолизата продължава. Печалба: само 2 АТФ.',
  },
  alcoholic: {
    name: 'Алкохолна ферментация',
    tally: { atpS: 2, atpOx: 0, nadh: 0, fadh: 0, co2: 2, o2: 0 },
    product: '2 етанол',
    note: 'Дрождите отцепват $\\mathrm{CO_2}$ от пирувата, а полученият ацеталдехид приема водорода от НАДН и става етанол. И тук целта е да се върне НАД⁺; печалбата е 2 АТФ.',
  },
};

const C_GLU = '#e11d48';
const C_CO2 = '#64748b';

/** Въглеродните атоми като точки: група от n точки с център (x, y). */
function Carbons({ n, x, y, color = C_GLU }: { n: number; x: number; y: number; color?: string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + (i - (n - 1) / 2) * 11} cy={y} r={4.5} fill={color} />
      ))}
    </g>
  );
}

/** Пътят на една глюкоза: гликолиза → окисление на пирувата → цикъл на Кребс → дихателна верига, или ферментация без кислород. */
export default function PathwayLab() {
  const [mode, setMode] = useState<Mode>('aerobic');
  const [step, setStep] = useState(0);

  const last = mode === 'aerobic' ? AEROBIC.length - 1 : 2;
  const fer = mode === 'aerobic' ? null : FERMENT[mode];
  const stageName = fer && step === 2 ? fer.name : AEROBIC[step].name;
  const tally = fer && step === 2 ? fer.tally : AEROBIC[step].tally;
  const note = fer && step === 2 ? fer.note : AEROBIC[step].note;
  const total = tally.atpS + tally.atpOx;

  const choose = (m: Mode) => {
    setMode(m);
    setStep(s => Math.min(s, m === 'aerobic' ? AEROBIC.length - 1 : 2));
  };

  // Къде е въглеродът на всяка стъпка
  const lit = (i: number) => (fer ? (i === 1 && step === 1) || (i === 5 && step === 2) : step === i);
  const box = (i: number) => (lit(i) ? 'fill-rose-100 stroke-rose-500 dark:fill-rose-500/25' : 'fill-white stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 260" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Клетката и митохондрията */}
        <rect x={4} y={4} width={632} height={252} rx={18} className="fill-amber-50 stroke-amber-300 dark:fill-amber-500/10 dark:stroke-amber-700" />
        <text x={18} y={24} fontSize="12" className="fill-amber-700 dark:fill-amber-300">
          цитоплазма
        </text>
        {!fer && (
          <>
            <rect x={232} y={30} width={396} height={214} rx={60} className="fill-orange-100 stroke-orange-400 dark:fill-orange-500/15 dark:stroke-orange-600" strokeWidth={2} />
            <rect x={244} y={42} width={372} height={190} rx={50} className="fill-orange-50 stroke-orange-300 dark:fill-orange-500/10 dark:stroke-orange-700" strokeDasharray="5 4" />
            <text x={430} y={60} fontSize="12" textAnchor="middle" className="fill-orange-700 dark:fill-orange-300">
              митохондрия (матрикс)
            </text>
          </>
        )}

        {/* 1. Гликолиза */}
        <rect x={20} y={40} width={190} height={90} rx={10} className={box(1)} strokeWidth={1.5} />
        <text x={115} y={58} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">
          Гликолиза
        </text>
        <text x={115} y={80} fontSize="11" textAnchor="middle" fill="currentColor">
          глюкоза (6 C)
        </text>
        <Carbons n={6} x={115} y={92} color={step === 0 ? C_GLU : '#fda4af'} />
        <text x={115} y={116} fontSize="11" textAnchor="middle" fill="currentColor">
          → 2 пируват (3 C)
        </text>

        {/* Пируватите */}
        {step >= 1 && !(fer && step === 2) && (
          <g>
            <Carbons n={3} x={70} y={160} color={step === 1 ? C_GLU : '#fda4af'} />
            <Carbons n={3} x={160} y={160} color={step === 1 ? C_GLU : '#fda4af'} />
            <text x={115} y={182} fontSize="11" textAnchor="middle" fill="currentColor">
              2 × пируват
            </text>
          </g>
        )}

        {fer ? (
          // 5. Ферментацията – в цитоплазмата
          <g>
            <rect x={250} y={120} width={250} height={100} rx={10} className={box(5)} strokeWidth={1.5} />
            <text x={375} y={140} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">
              {fer.name}
            </text>
            <text x={375} y={160} fontSize="11" textAnchor="middle" fill="currentColor">
              пируват + НАДН → {fer.product}
            </text>
            {step === 2 && (
              <g>
                {mode === 'lactic' ? (
                  <>
                    <Carbons n={3} x={330} y={188} />
                    <Carbons n={3} x={420} y={188} />
                  </>
                ) : (
                  <>
                    <Carbons n={2} x={320} y={188} />
                    <Carbons n={2} x={400} y={188} />
                    <Carbons n={1} x={350} y={208} color={C_CO2} />
                    <Carbons n={1} x={430} y={208} color={C_CO2} />
                  </>
                )}
                <text x={375} y={232} fontSize="10.5" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                  НАД⁺ се връща в гликолизата ↺
                </text>
              </g>
            )}
            <text x={560} y={150} fontSize="30" textAnchor="middle">
              🚫
            </text>
            <text x={560} y={176} fontSize="11" textAnchor="middle" fill="currentColor">
              няма O₂
            </text>
          </g>
        ) : (
          <g>
            {/* 2. Окисление на пирувата */}
            <rect x={262} y={74} width={130} height={62} rx={10} className={box(2)} strokeWidth={1.5} />
            <text x={327} y={92} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              Окисление
            </text>
            <text x={327} y={106} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              на пирувата
            </text>
            {step === 2 && (
              <>
                <Carbons n={2} x={304} y={124} />
                <Carbons n={2} x={352} y={124} />
              </>
            )}

            {/* 3. Цикъл на Кребс */}
            <circle cx={470} cy={128} r={52} className={box(3)} strokeWidth={1.5} />
            <path d="M 470 76 A 52 52 0 1 1 418 128" fill="none" className="stroke-rose-400" strokeWidth={2} markerEnd="url(#pw-arrow)" />
            <text x={470} y={124} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              Цикъл
            </text>
            <text x={470} y={138} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              на Кребс
            </text>
            {step === 3 && <Carbons n={4} x={470} y={156} color="#fb923c" />}

            {/* 4. Дихателната верига на вътрешната мембрана */}
            <rect x={262} y={196} width={300} height={30} rx={8} className={box(4)} strokeWidth={1.5} />
            <text x={412} y={215} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              Дихателна верига + АТФ синтаза
            </text>
            {step === 4 && (
              <text x={580} y={186} fontSize="11" textAnchor="middle" className="fill-sky-700 dark:fill-sky-300">
                O₂ → H₂O
              </text>
            )}
          </g>
        )}

        {/* Отделен CO₂ */}
        {tally.co2 > 0 && (
          <g>
            <text x={fer ? 560 : 590} y={fer ? 214 : 90} fontSize="11" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
              CO₂ × {tally.co2}
            </text>
          </g>
        )}

        <defs>
          <marker id="pw-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-rose-400" />
          </marker>
        </defs>
      </LabSvg>

      <Buttons>
        <DiagramButton active={mode === 'aerobic'} onClick={() => choose('aerobic')}>
          има O₂
        </DiagramButton>
        <DiagramButton active={mode === 'lactic'} onClick={() => choose('lactic')}>
          без O₂: мускул
        </DiagramButton>
        <DiagramButton active={mode === 'alcoholic'} onClick={() => choose('alcoholic')}>
          без O₂: дрожди
        </DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setStep(s => Math.max(0, s - 1))}>← Назад</DiagramButton>
        <DiagramButton onClick={() => setStep(s => Math.min(last, s + 1))}>Напред →</DiagramButton>
        <DiagramButton onClick={() => setStep(0)}>Отначало</DiagramButton>
      </Buttons>

      <p className="text-center font-semibold mt-3 text-gray-800 dark:text-gray-100">
        Стъпка {step} от {last}: {stageName}
      </p>
      <Readout
        items={[
          { label: 'АТФ (субстратно)', value: tally.atpS, tone: 'rose' },
          { label: 'АТФ (окислително)', value: tally.atpOx, tone: 'rose' },
          { label: 'НАДН', value: tally.nadh, tone: 'violet' },
          { label: 'ФАДН₂', value: tally.fadh, tone: 'violet' },
          { label: 'CO₂', value: tally.co2, tone: 'gray' },
          { label: 'O₂', value: tally.o2, tone: 'blue' },
          { label: 'общо АТФ', value: total, tone: 'emerald' },
        ]}
      />
      <Note tone="violet">
        <MathText>{note}</MathText>
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Числата са за една молекула глюкоза. Добивът от дихателната верига е приблизителен: в съвременния модел НАДН дава около 2,5
        АТФ, ФАДН₂ – около 1,5, и общо се получават около 30–32 АТФ (по-старите учебници пишат 36–38).
      </p>
    </div>
  );
}
