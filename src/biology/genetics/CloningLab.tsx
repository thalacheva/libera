import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

type Enzymes = 'same' | 'mismatch' | 'directional';
type Medium = 'lb' | 'amp' | 'ampx';

const ENZYMES: { id: Enzymes; name: string; left: string; right: string; plasmid: string[] }[] = [
  { id: 'same', name: 'EcoRI за двете', left: 'EcoRI', right: 'EcoRI', plasmid: ['EcoRI'] },
  { id: 'mismatch', name: 'плазмид: EcoRI, ген: BamHI', left: 'BamHI', right: 'BamHI', plasmid: ['EcoRI'] },
  { id: 'directional', name: 'EcoRI + BamHI за двете', left: 'EcoRI', right: 'BamHI', plasmid: ['EcoRI', 'BamHI'] },
];

const MEDIA: { id: Medium; name: string }[] = [
  { id: 'lb', name: 'хранителна среда' },
  { id: 'amp', name: '+ ампицилин' },
  { id: 'ampx', name: '+ ампицилин + X-gal' },
];

const ENDS: Record<string, string> = { EcoRI: 'Г↓ААТТЦ', BamHI: 'Г↓ГАТЦЦ' };

/** Колко колонии с плазмид (сини – без вмъкнат ген, бели – с вмъкнат ген) дава един опит. */
function outcome(enz: Enzymes, ligase: boolean) {
  if (!ligase) return { white: 0, blue: 6, note: 'Без лигаза парчетата не се зашиват. Линейната ДНК почти не влиза в бактериите и не се запазва – растат само няколко колонии от плазмиди, които ензимът не е успял да разреже.' };
  if (enz === 'same')
    return { white: 60, blue: 110, note: 'Краищата си пасват, но плазмидът може да се затвори и сам – затова има много сини колонии. Белите носят гена; при един и същ ензим той влиза в едната или в другата посока, наполовина.' };
  if (enz === 'mismatch')
    return { white: 0, blue: 150, note: 'Лепливите краища на EcoRI (ААТТ) и BamHI (ГАТЦ) не са комплементарни – генът не може да се зашие в плазмида. Всички колонии са от плазмида, затворен сам.' };
  return { white: 120, blue: 6, note: 'Двата края на плазмида са различни и не пасват един на друг – той не може да се затвори сам. Генът влиза само в една посока. Почти всички колонии са бели.' };
}

/** Детерминиран генератор на случайни числа – колониите да не скачат при всяко пречертаване. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DISH = { x: 485, y: 168, r: 125 };

function colonies(n: number, seed: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const a = r() * 2 * Math.PI;
    const d = Math.sqrt(r()) * (DISH.r - 12);
    return { x: DISH.x + d * Math.cos(a), y: DISH.y + d * Math.sin(a), s: 3.2 + r() * 2 };
  });
}

// Плазмидът: център и радиус; ъглите са по часовника от върха
const P = { x: 95, y: 150, r: 58 };
const arc = (from: number, to: number, r: number) => {
  const pt = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(P.x + r * Math.cos(a)).toFixed(1)},${(P.y + r * Math.sin(a)).toFixed(1)}`;
  };
  return `M${pt(from)} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${pt(to)}`;
};

/** Клониране на ген: рязане, зашиване с лигаза, трансформация и подбор на колониите (синьо-бял тест). */
export default function CloningLab() {
  const [enz, setEnz] = useState<Enzymes>('same');
  const [ligase, setLigase] = useState(true);
  const [medium, setMedium] = useState<Medium>('ampx');
  const [plated, setPlated] = useState(false);

  const e = ENZYMES.find(x => x.id === enz)!;
  const res = outcome(enz, ligase);
  const seed = ENZYMES.indexOf(e) * 7 + (ligase ? 1 : 0) * 3 + 11;
  const blue = colonies(res.blue, seed);
  const white = colonies(res.white, seed + 101);
  const total = res.blue + res.white;

  const change = (f: () => void) => {
    f();
    setPlated(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Плазмидът */}
        <text x={20} y={24} fontSize="12" fontWeight="700" fill="currentColor">
          Плазмид (вектор)
        </text>
        <circle cx={P.x} cy={P.y} r={P.r} fill="none" className="stroke-gray-400" strokeWidth={6} />
        <path d={arc(150, 250, P.r)} fill="none" stroke="#f59e0b" strokeWidth={9} />
        <path d={arc(-40, 60, P.r)} fill="none" stroke="#3b82f6" strokeWidth={9} />
        <path d={arc(270, 300, P.r)} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth={9} />
        <text x={P.x - 2} y={P.y + 88} fontSize="10.5" textAnchor="middle" fill="#d97706" fontWeight="700">
          ампицилин-R
        </text>
        <text x={P.x + 74} y={P.y - 36} fontSize="10.5" fill="#2563eb" fontWeight="700">
          lacZ
        </text>
        <text x={P.x - 76} y={P.y - 34} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ori
        </text>
        <line x1={P.x - 64} x2={P.x - 55} y1={P.y - 36} y2={P.y - 31} className="stroke-gray-400" />
        {/* Местата за рязане в lacZ */}
        {e.plasmid.map((name, i) => {
          const deg = 5 + i * 18;
          const a = ((deg - 90) * Math.PI) / 180;
          return (
            <g key={name}>
              <line x1={P.x + 50 * Math.cos(a)} y1={P.y + 50 * Math.sin(a)} x2={P.x + 70 * Math.cos(a)} y2={P.y + 70 * Math.sin(a)} stroke="#e11d48" strokeWidth={2.5} />
              <text
                x={P.x + 78 * Math.cos(a) + (e.plasmid.length > 1 ? (i === 0 ? -4 : 4) : 0)}
                y={P.y + 78 * Math.sin(a) - 4}
                fontSize="10"
                textAnchor={e.plasmid.length > 1 ? (i === 0 ? 'end' : 'start') : 'middle'}
                fill="#e11d48"
                fontWeight="700"
              >
                {name}
              </text>
            </g>
          );
        })}
        <text x={P.x} y={P.y + 4} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          4000 bp
        </text>

        {/* Генът */}
        <text x={218} y={24} fontSize="12" fontWeight="700" fill="currentColor">
          Генът
        </text>
        <rect x={232} y={92} width={92} height={14} rx={3} fill="#10b981" />
        <text x={278} y={84} fontSize="10" textAnchor="middle" fill="#059669" fontWeight="700">
          ген за инсулин
        </text>
        <text x={232} y={124} fontSize="10" textAnchor="middle" fill="#e11d48" fontWeight="700">
          {e.left}
        </text>
        <text x={324} y={124} fontSize="10" textAnchor="middle" fill="#e11d48" fontWeight="700">
          {e.right}
        </text>
        <text x={232} y={137} fontSize="9.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {ENDS[e.left]}
        </text>
        <text x={324} y={137} fontSize="9.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {ENDS[e.right]}
        </text>
        <text x={278} y={176} fontSize="11" textAnchor="middle" fill={ligase ? '#7c3aed' : '#9ca3af'} fontWeight="700">
          {ligase ? '+ ДНК лигаза' : 'без лигаза'}
        </text>
        <text x={278} y={206} fontSize="22" textAnchor="middle" className="fill-gray-400">
          →
        </text>
        <text x={278} y={228} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          трансформация
        </text>
        <text x={278} y={241} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          на E. coli
        </text>

        {/* Петрито */}
        <circle cx={DISH.x} cy={DISH.y} r={DISH.r + 6} className="fill-gray-100 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-600" strokeWidth={2} />
        <circle cx={DISH.x} cy={DISH.y} r={DISH.r} className={medium === 'ampx' ? 'fill-amber-50 dark:fill-amber-950' : 'fill-yellow-50 dark:fill-yellow-950'} />
        {plated && medium === 'lb' && <circle cx={DISH.x} cy={DISH.y} r={DISH.r - 4} className="fill-amber-200/80 dark:fill-amber-700/60" />}
        {plated &&
          medium !== 'lb' &&
          [...blue.map(c => ({ ...c, b: true })), ...white.map(c => ({ ...c, b: false }))].map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={c.s}
              fill={medium === 'ampx' ? (c.b ? '#2563eb' : '#f8fafc') : '#fde68a'}
              stroke={medium === 'ampx' ? (c.b ? '#1e40af' : '#94a3b8') : '#d97706'}
              strokeWidth={0.8}
            />
          ))}
        {!plated && (
          <text x={DISH.x} y={DISH.y + 4} fontSize="11" textAnchor="middle" className="fill-gray-400">
            натисни „Посей“
          </text>
        )}
        <text x={DISH.x} y={20} fontSize="11" textAnchor="middle" fill="currentColor" fontWeight="700">
          {MEDIA.find(m => m.id === medium)!.name}
        </text>
      </LabSvg>

      <Buttons>
        {ENZYMES.map(x => (
          <DiagramButton key={x.id} active={enz === x.id} onClick={() => change(() => setEnz(x.id))}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={ligase} onClick={() => change(() => setLigase(v => !v))}>
          {ligase ? '✓ лигаза' : 'без лигаза'}
        </DiagramButton>
        {MEDIA.map(m => (
          <DiagramButton key={m.id} active={medium === m.id} onClick={() => change(() => setMedium(m.id))}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={plated} onClick={() => setPlated(true)}>
          🧫 Посей и инкубирай
        </DiagramButton>
      </Buttons>

      {plated &&
        (medium === 'lb' ? (
          <Formula>Без антибиотик растат всички бактерии – и тези без плазмид. Получава се сплошен слой и не може да се избере нищо.</Formula>
        ) : (
          <>
            <Readout
              items={
                medium === 'ampx'
                  ? [
                      { label: 'бели (с гена)', value: res.white, tone: 'emerald' },
                      { label: 'сини (без гена)', value: res.blue, tone: 'blue' },
                      { label: 'бели', value: total ? `${Math.round((res.white / total) * 100)} %` : '–', tone: 'violet' },
                    ]
                  : [{ label: 'колонии', value: total, tone: 'amber' }]
              }
            />
            {medium === 'amp' && (
              <Formula>Ампицилинът оставя само бактериите с плазмид, но без X-gal не личи кои от тях носят гена.</Formula>
            )}
            {medium === 'ampx' && <Note tone="violet">{res.note}</Note>}
          </>
        ))}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Плазмидът носи ген за устойчивост на ампицилин и гена lacZ за ензима β-галактозидаза. Местата за рязане са вътре в lacZ. Ако
        генът се вмъкне там, lacZ се „разваля“ и колонията остава бяла; ако плазмидът се затвори без гена, ензимът разгражда X-gal до синьо
        багрило. Числата са примерни – показват отношението между случаите.
      </p>
    </div>
  );
}
