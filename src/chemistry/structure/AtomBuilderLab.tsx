import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { byZ } from '../elements';

const MAX_Z = 20;

// Стабилните изотопи за Z = 1…20 (масови числа)
const STABLE: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [6, 7],
  4: [9],
  5: [10, 11],
  6: [12, 13],
  7: [14, 15],
  8: [16, 17, 18],
  9: [19],
  10: [20, 21, 22],
  11: [23],
  12: [24, 25, 26],
  13: [27],
  14: [28, 29, 30],
  15: [31],
  16: [32, 33, 34, 36],
  17: [35, 37],
  18: [36, 38, 40],
  19: [39, 41],
  20: [40, 42, 43, 44, 46],
};

// Някои известни радиоактивни изотопи и периодите им на полуразпад
const RADIOACTIVE: Record<string, string> = {
  '1-3': 'радиоактивен (тритий), период на полуразпад около 12,3 години',
  '4-7': 'радиоактивен, период на полуразпад около 53 дни',
  '4-10': 'радиоактивен, период на полуразпад около 1,4 милиона години',
  '6-11': 'радиоактивен, период на полуразпад около 20 минути – използва се в медицината (PET)',
  '6-14': 'радиоактивен (радиовъглерод), период на полуразпад около 5700 години – по него се датират древни находки',
  '7-13': 'радиоактивен, период на полуразпад около 10 минути',
  '8-15': 'радиоактивен, период на полуразпад около 2 минути',
  '9-18': 'радиоактивен, период на полуразпад около 110 минути – използва се в медицината (PET)',
  '11-22': 'радиоактивен, период на полуразпад около 2,6 години',
  '11-24': 'радиоактивен, период на полуразпад около 15 часа',
  '12-28': 'радиоактивен, период на полуразпад около 21 часа',
  '13-26': 'радиоактивен, период на полуразпад около 720 000 години',
  '14-32': 'радиоактивен, период на полуразпад около 160 години',
  '15-32': 'радиоактивен, период на полуразпад около 14 дни',
  '16-35': 'радиоактивен, период на полуразпад около 87 дни',
  '17-36': 'радиоактивен, период на полуразпад около 300 000 години',
  '18-39': 'радиоактивен, период на полуразпад около 270 години',
  '19-40': 'радиоактивен, но с период на полуразпад около 1,25 милиарда години – затова се среща в природата (и в бананите)',
  '20-41': 'радиоактивен, период на полуразпад около 100 000 години',
  '20-48': 'формално радиоактивен, но с период на полуразпад около 10¹⁹ години – практически стабилен и се среща в природата',
};

const ISOTOPE_NAME: Record<string, string> = { '1-1': 'протий', '1-2': 'деутерий', '1-3': 'тритий' };

const PRESETS: { label: string; p: number; n: number; e: number }[] = [
  { label: 'водород', p: 1, n: 0, e: 1 },
  { label: 'деутерий', p: 1, n: 1, e: 1 },
  { label: 'въглерод-14', p: 6, n: 8, e: 6 },
  { label: 'Na⁺', p: 11, n: 12, e: 10 },
  { label: 'Cl⁻', p: 17, n: 18, e: 18 },
];

/** Простият модел на слоевете за Z ≤ 20: 2, 8, 8 и останалите в четвърти слой. */
function shells(e: number) {
  const out: number[] = [];
  for (const cap of [2, 8, 8, 18]) {
    if (e <= 0) break;
    out.push(Math.min(cap, e));
    e -= cap;
  }
  return out;
}

const superscript = (s: string) => s.replace(/[0-9+−-]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? (c === '+' ? '⁺' : '⁻'));

const stepper = 'w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-lg leading-none text-gray-700 dark:text-gray-200 disabled:opacity-40';

function Stepper({ label, value, set, min, max, tone }: { label: string; value: number; set: (v: number) => void; min: number; max: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-24 text-sm font-medium ${tone}`}>{label}</span>
      <button className={stepper} onClick={() => set(value - 1)} disabled={value <= min} aria-label={`${label} −1`}>
        −
      </button>
      <span className="w-8 text-center font-mono text-gray-900 dark:text-gray-100">{value}</span>
      <button className={stepper} onClick={() => set(value + 1)} disabled={value >= max} aria-label={`${label} +1`}>
        +
      </button>
    </div>
  );
}

const C = { x: 120, y: 120 };
const SHELL_R = [46, 66, 86, 106];

/** Построй атом: протоните определят елемента, неутроните – изотопа, електроните – заряда. */
export default function AtomBuilderLab() {
  const [p, setP] = useState(6);
  const [n, setN] = useState(6);
  const [e, setE] = useState(6);

  const el = byZ(p);
  const A = p + n;
  const charge = p - e;
  const chargeText = charge === 0 ? '' : `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
  const key = `${p}-${A}`;
  const stable = STABLE[p]?.includes(A);
  const isotope = ISOTOPE_NAME[key] ?? `${el.name.toLowerCase()}-${A}`;
  const status = stable ? 'стабилен изотоп – среща се в природата' : (RADIOACTIVE[key] ?? 'не е стабилен – разпада се бързо или изобщо не съществува; в природата не се среща');

  // Нуклоните – протони и неутрони, разбъркани равномерно, подредени в спирала
  const nucleons = Array.from({ length: A }, (_, i) => (Math.floor(((i + 1) * p) / A) > Math.floor((i * p) / A) ? 'p' : 'n'));
  const layers = shells(e);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Слоевете и електроните */}
        {layers.map((count, k) => (
          <g key={k}>
            <circle cx={C.x} cy={C.y} r={SHELL_R[k]} className="fill-none stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" />
            {Array.from({ length: count }, (_, i) => {
              const a = (2 * Math.PI * i) / count - Math.PI / 2 + k * 0.3;
              return <circle key={i} cx={C.x + SHELL_R[k] * Math.cos(a)} cy={C.y + SHELL_R[k] * Math.sin(a)} r={5} className="fill-sky-500" />;
            })}
          </g>
        ))}
        {/* Ядрото */}
        {nucleons.map((kind, i) => {
          const r = 3.4 * Math.sqrt(i);
          const a = i * 2.39996;
          return <circle key={i} cx={C.x + r * Math.cos(a)} cy={C.y + r * Math.sin(a)} r={4.5} className={kind === 'p' ? 'fill-rose-500 stroke-white dark:stroke-gray-800' : 'fill-gray-400 stroke-white dark:stroke-gray-800'} strokeWidth="1" />;
        })}

        {/* Означението на нуклида */}
        <text x={330} y={70} fontSize="22" textAnchor="end" fill="currentColor">
          {A}
        </text>
        <text x={330} y={150} fontSize="22" textAnchor="end" fill="currentColor">
          {p}
        </text>
        <text x={336} y={136} fontSize="72" fontWeight="700" className="fill-amber-700 dark:fill-amber-400">
          {el.symbol}
        </text>
        {chargeText && (
          <text x={340 + 44 * el.symbol.length} y={70} fontSize="24" className={charge > 0 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-sky-600 dark:fill-sky-400'}>
            {chargeText}
          </text>
        )}
        <text x={360} y={180} fontSize="16" fontWeight="600" textAnchor="middle" fill="currentColor">
          {el.name}
        </text>
        <text x={360} y={202} fontSize="13" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {charge === 0 ? 'неутрален атом' : charge > 0 ? `катион, заряд ${superscript(chargeText)}` : `анион, заряд ${superscript(chargeText)}`}
        </text>
        <text x={360} y={224} fontSize="13" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {layers.length ? `слоеве: ${layers.join(', ')}` : 'няма електрони'}
        </text>
      </LabSvg>

      <div className="flex flex-col items-center gap-2 mt-3">
        <Stepper label="протони p⁺" value={p} set={setP} min={1} max={MAX_Z} tone="text-rose-600 dark:text-rose-400" />
        <Stepper label="неутрони n⁰" value={n} set={setN} min={0} max={30} tone="text-gray-600 dark:text-gray-300" />
        <Stepper label="електрони e⁻" value={e} set={setE} min={0} max={MAX_Z + 3} tone="text-sky-600 dark:text-sky-400" />
      </div>
      <Buttons>
        {PRESETS.map(s => (
          <DiagramButton
            key={s.label}
            active={s.p === p && s.n === n && s.e === e}
            onClick={() => {
              setP(s.p);
              setN(s.n);
              setE(s.e);
            }}
          >
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Z =', value: p, tone: 'rose' },
            { label: 'N =', value: n },
            { label: 'A = Z + N =', value: A, tone: 'amber' },
            { label: 'изотоп:', value: isotope },
          ]}
        />
      </div>
      <Note tone={stable ? 'emerald' : 'rose'}>{`${isotope[0].toUpperCase()}${isotope.slice(1)}: ${status}.`}</Note>
      {Math.abs(charge) > 3 && <Note tone="amber">Толкова голям заряд почти не се среща при обикновени химични условия – атомите рядко губят или приемат повече от 3 електрона.</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Смени броя на протоните – и елементът става друг. Смени неутроните – елементът остава същият, сменя се изотопът. Смени електроните
        – получаваш йон. Слоевете са по простия модел (2, 8, 8, …), който е точен до калция (Z = 20).
      </p>
    </div>
  );
}
