import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText } from '../formula';

type Gas = { f: string; k: number };
const REACTIONS: { eq: string; reactants: [Gas, Gas]; products: Gas[]; note?: string }[] = [
  { eq: '2H₂ + O₂ → 2H₂O', reactants: [{ f: 'H2', k: 2 }, { f: 'O2', k: 1 }], products: [{ f: 'H2O', k: 2 }] },
  { eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', reactants: [{ f: 'CH4', k: 1 }, { f: 'O2', k: 2 }], products: [{ f: 'CO2', k: 1 }, { f: 'H2O', k: 2 }] },
  { eq: '2CO + O₂ → 2CO₂', reactants: [{ f: 'CO', k: 2 }, { f: 'O2', k: 1 }], products: [{ f: 'CO2', k: 2 }] },
  {
    eq: 'N₂ + 3H₂ → 2NH₃',
    reactants: [{ f: 'N2', k: 1 }, { f: 'H2', k: 3 }],
    products: [{ f: 'NH3', k: 2 }],
    note: 'В действителност тази реакция е обратима и не протича докрай (ще я разгледаме в „Химично равновесие“). Тук приемаме, че протича напълно.',
  },
];

const FILL: Record<string, string> = {
  H2: 'fill-sky-300',
  O2: 'fill-rose-300',
  N2: 'fill-gray-300',
  CH4: 'fill-amber-300',
  CO: 'fill-orange-300',
  CO2: 'fill-emerald-300',
  NH3: 'fill-violet-300',
  H2O: 'fill-blue-200',
};

const X0 = 60;
const PX = 1.8; // пиксела на mL; 200 mL = 360 px
const fmt = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');

/** Спринцовка със сместа: отсечките са обемите на газовете. */
function Syringe({ y, parts, label }: { y: number; parts: { f: string; V: number }[]; label: string }) {
  let x = X0;
  const total = parts.reduce((s, p) => s + p.V, 0);
  return (
    <g>
      <text x={X0} y={y - 8} fontSize="12" fontWeight="600" fill="currentColor">
        {label}: {fmt(total)} mL
      </text>
      {parts.map(p => {
        const w = p.V * PX;
        const seg = (
          <g key={p.f}>
            <rect x={x} y={y} width={w} height={34} className={FILL[p.f]} />
            {w >= 34 && (
              <text x={x + w / 2} y={y + 22} fontSize="12" fontWeight="700" textAnchor="middle" className="fill-gray-900">
                {formulaText(p.f)}
              </text>
            )}
          </g>
        );
        x += w;
        return seg;
      })}
      {/* стените и буталото */}
      <path d={`M ${X0} ${y} L ${X0 + 360 + 10} ${y} M ${X0} ${y + 34} L ${X0 + 360 + 10} ${y + 34} M ${X0} ${y - 2} L ${X0} ${y + 36}`} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />
      <rect x={X0 + total * PX} y={y - 3} width={7} height={40} className="fill-gray-500" />
      <line x1={X0 + total * PX + 7} x2={X0 + total * PX + 40} y1={y + 17} y2={y + 17} className="stroke-gray-500" strokeWidth="4" />
    </g>
  );
}

/** Реакция между газове в спринцовка: обемите реагират в отношението на коефициентите. */
export default function GasReactionLab() {
  const [ri, setRi] = useState(0);
  const [v1, setV1] = useState(60);
  const [v2, setV2] = useState(40);
  const [hot, setHot] = useState(false);
  const r = REACTIONS[ri];
  const [a, b] = r.reactants;

  // Колко „пъти“ протича реакцията – ограничава реагентът в недостиг
  const xi = Math.min(v1 / a.k, v2 / b.k);
  const left1 = v1 - a.k * xi;
  const left2 = v2 - b.k * xi;
  const products = r.products.map(p => ({ f: p.f, V: p.k * xi }));
  const gasProducts = products.filter(p => hot || p.f !== 'H2O');
  const liquidWater = !hot && products.some(p => p.f === 'H2O' && p.V > 0);
  const after = [
    ...(left1 > 1e-9 ? [{ f: a.f, V: left1 }] : []),
    ...(left2 > 1e-9 ? [{ f: b.f, V: left2 }] : []),
    ...gasProducts.filter(p => p.V > 1e-9),
  ];
  const excess = left1 > 1e-9 ? a : left2 > 1e-9 ? b : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {REACTIONS.map((x, i) => (
          <DiagramButton key={x.eq} active={i === ri} onClick={() => setRi(i)}>
            {x.eq}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 200" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Syringe y={36} parts={[{ f: a.f, V: v1 }, { f: b.f, V: v2 }].filter(p => p.V > 0)} label="преди" />
        <text x={240} y={100} fontSize="16" textAnchor="middle" className="fill-gray-500">
          ↓ искра
        </text>
        <Syringe y={134} parts={after} label="след" />
        {liquidWater && (
          <text x={X0} y={190} fontSize="11" className="fill-blue-700 dark:fill-blue-300">
            + капки течна вода (обемът им е пренебрежимо малък)
          </text>
        )}
      </LabSvg>

      <Sliders>
        <Slider label={`${formulaText(a.f)}, mL`} value={v1} onChange={setV1} min={0} max={100} step={5} tone="blue" />
        <Slider label={`${formulaText(b.f)}, mL`} value={v2} onChange={setV2} min={0} max={100} step={5} tone="rose" />
      </Sliders>
      {r.products.some(p => p.f === 'H2O') && (
        <Buttons>
          <DiagramButton active={!hot} onClick={() => setHot(false)}>
            стайна температура – водата е течна
          </DiagramButton>
          <DiagramButton active={hot} onClick={() => setHot(true)}>
            над 100 °C – водата е пара
          </DiagramButton>
        </Buttons>
      )}
      <div className="mt-3">
        <Readout
          items={[
            { label: 'реагират:', value: `${fmt(a.k * xi)} mL ${formulaText(a.f)} + ${fmt(b.k * xi)} mL ${formulaText(b.f)}`, tone: 'blue' },
            { label: 'получават се:', value: products.map(p => (p.f === 'H2O' && !hot ? `течна вода (като пара – ${fmt(p.V)} mL)` : `${fmt(p.V)} mL ${formulaText(p.f)}`)).join(' + ') },
          ]}
        />
      </div>
      <Note tone={excess ? 'amber' : 'emerald'}>
        {v1 === 0 || v2 === 0
          ? 'Сложи и от двата газа.'
          : excess
            ? `В излишък е ${formulaText(excess.f)} – остават ${fmt(excess === a ? left1 : left2)} mL. Обемите реагират в отношение ${a.k} : ${b.k}.`
            : `Газовете са взети точно в отношение ${a.k} : ${b.k} и реагират напълно.`}
      </Note>
      {r.note && <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{r.note}</p>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всички обеми са измерени при едни и същи температура и налягане. Тогава обемите на газовете в реакцията се отнасят като
        коефициентите в уравнението (закон на Гей-Люсак за обемните отношения). Обемът след реакцията може да е по-малък – молекулите
        стават по-малко.
      </p>
    </div>
  );
}
