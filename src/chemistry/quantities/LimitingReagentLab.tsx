import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';
import { formulaText, molarMass } from '../formula';

type Species = { f: string; nu: number };
type Reaction = { a: Species & { max: number; start: number }; b: Species & { max: number; start: number }; products: Species[] };

const REACTIONS: Reaction[] = [
  { a: { f: 'H2', nu: 1, max: 10, start: 4 }, b: { f: 'Cl2', nu: 1, max: 10, start: 6 }, products: [{ f: 'HCl', nu: 2 }] },
  { a: { f: 'H2', nu: 2, max: 12, start: 8 }, b: { f: 'O2', nu: 1, max: 8, start: 3 }, products: [{ f: 'H2O', nu: 2 }] },
  { a: { f: 'N2', nu: 1, max: 6, start: 4 }, b: { f: 'H2', nu: 3, max: 15, start: 9 }, products: [{ f: 'NH3', nu: 2 }] },
  { a: { f: 'CH4', nu: 1, max: 6, start: 3 }, b: { f: 'O2', nu: 2, max: 12, start: 4 }, products: [{ f: 'CO2', nu: 1 }, { f: 'H2O', nu: 2 }] },
];

// Атомите: цвят и радиус; молекулите – отместванията на атомите от центъра
const ATOM: Record<string, { r: number; cls: string }> = {
  H: { r: 4.5, cls: 'fill-gray-100 stroke-gray-400' },
  O: { r: 6.5, cls: 'fill-rose-500 stroke-rose-700' },
  N: { r: 6.5, cls: 'fill-blue-500 stroke-blue-700' },
  Cl: { r: 7, cls: 'fill-emerald-500 stroke-emerald-700' },
  C: { r: 6.5, cls: 'fill-gray-700 stroke-gray-900' },
};
const SHAPE: Record<string, [string, number, number][]> = {
  H2: [['H', -4, 0], ['H', 4, 0]],
  Cl2: [['Cl', -6, 0], ['Cl', 6, 0]],
  O2: [['O', -5, 0], ['O', 5, 0]],
  N2: [['N', -5, 0], ['N', 5, 0]],
  HCl: [['Cl', -3, 0], ['H', 7, 0]],
  H2O: [['O', 0, -2], ['H', -7, 4], ['H', 7, 4]],
  NH3: [['N', 0, -1], ['H', -8, 4], ['H', 8, 4], ['H', 0, 8]],
  CH4: [['C', 0, 0], ['H', -7, -6], ['H', 7, -6], ['H', -7, 6], ['H', 7, 6]],
  CO2: [['O', -10, 0], ['C', 0, 0], ['O', 10, 0]],
};

function Molecule({ f, x, y, faded }: { f: string; x: number; y: number; faded?: boolean }) {
  return (
    <g opacity={faded ? 0.45 : 1}>
      {SHAPE[f].map(([el, dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={ATOM[el].r} className={ATOM[el].cls} strokeWidth="1" />
      ))}
    </g>
  );
}

const CELL = 34;
const COLS = 6;
const TOP = 46;
/** Подрежда молекулите в мрежа 6 × 4 в панел, започващ от x0. */
const place = (list: { f: string; faded?: boolean }[], x0: number) =>
  list.map((m, i) => ({ ...m, x: x0 + CELL / 2 + (i % COLS) * CELL, y: TOP + Math.floor(i / COLS) * CELL }));

const equationText = (r: Reaction) => {
  const t = (s: Species) => `${s.nu > 1 ? s.nu : ''}${formulaText(s.f)}`;
  return `${t(r.a)} + ${t(r.b)} → ${r.products.map(t).join(' + ')}`;
};
const fmt = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');

/** Вещество в недостиг: кое свършва първо и колко остава от другото. */
export default function LimitingReagentLab() {
  const [ri, setRi] = useState(0);
  const r = REACTIONS[ri];
  const [nA, setNA] = useState(r.a.start);
  const [nB, setNB] = useState(r.b.start);

  const choose = (i: number) => {
    setRi(i);
    setNA(REACTIONS[i].a.start);
    setNB(REACTIONS[i].b.start);
  };

  // Колко „пъти“ протича реакцията – определя го веществото, което свършва първо
  const xi = Math.min(nA / r.a.nu, nB / r.b.nu);
  const leftA = nA - r.a.nu * xi;
  const leftB = nB - r.b.nu * xi;
  const limiting = leftA === 0 && leftB === 0 ? null : leftA === 0 ? r.a : r.b;
  const excess = limiting === r.a ? { s: r.b, n: leftB } : limiting === r.b ? { s: r.a, n: leftA } : null;

  const before = place([...Array.from({ length: nA }, () => ({ f: r.a.f })), ...Array.from({ length: nB }, () => ({ f: r.b.f }))], 8);
  const after = place(
    [
      ...r.products.flatMap(p => Array.from({ length: p.nu * xi }, () => ({ f: p.f }))),
      ...Array.from({ length: leftA }, () => ({ f: r.a.f, faded: true })),
      ...Array.from({ length: leftB }, () => ({ f: r.b.f, faded: true })),
    ],
    252,
  );

  const massBefore = nA * molarMass(r.a.f) + nB * molarMass(r.b.f);
  const massAfter = r.products.reduce((s, p) => s + p.nu * xi * molarMass(p.f), 0) + leftA * molarMass(r.a.f) + leftB * molarMass(r.b.f);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {REACTIONS.map((x, i) => (
          <DiagramButton key={i} active={i === ri} onClick={() => choose(i)}>
            {equationText(x)}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 214" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <rect x={4} y={22} width={212} height={150} rx="10" className="fill-sky-50 stroke-sky-200 dark:fill-sky-900/20 dark:stroke-sky-800" />
        <rect x={248} y={22} width={212} height={150} rx="10" className="fill-amber-50 stroke-amber-200 dark:fill-amber-900/20 dark:stroke-amber-800" />
        <text x={110} y={14} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          преди реакцията
        </text>
        <text x={354} y={14} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          след реакцията
        </text>
        <text x={232} y={104} fontSize="22" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          →
        </text>
        {before.map((m, i) => (
          <Molecule key={`b${i}`} f={m.f} x={m.x} y={m.y} />
        ))}
        {after.map((m, i) => (
          <Molecule key={`a${i}`} f={m.f} x={m.x} y={m.y} faded={m.faded} />
        ))}
        <text x={110} y={192} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {`${nA} ${formulaText(r.a.f)} + ${nB} ${formulaText(r.b.f)}`}
        </text>
        <text x={354} y={192} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {[...r.products.map(p => `${p.nu * xi} ${formulaText(p.f)}`), ...(excess && excess.n > 0 ? [`${excess.n} ${formulaText(excess.s.f)} (излишък)`] : [])].join(' + ')}
        </text>
        <text x={240} y={210} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          бледите молекули не са реагирали
        </text>
      </LabSvg>

      <Sliders>
        <Slider label={formulaText(r.a.f)} value={nA} onChange={setNA} min={0} max={r.a.max} step={r.a.nu} tone="blue" />
        <Slider label={formulaText(r.b.f)} value={nB} onChange={setNB} min={0} max={r.b.max} step={r.b.nu} tone="emerald" />
      </Sliders>
      <div className="mt-3 space-y-2">
        <Readout
          items={[
            { label: 'в недостиг:', value: limiting ? formulaText(limiting.f) : 'нито едно', tone: 'rose' },
            ...(excess ? [{ label: 'остава:', value: `${excess.n} mol ${formulaText(excess.s.f)} = ${fmt(excess.n * molarMass(excess.s.f))} g` }] : []),
          ]}
        />
        <Readout
          items={r.products.map(p => ({ label: `${formulaText(p.f)}:`, value: `${p.nu * xi} mol = ${fmt(p.nu * xi * molarMass(p.f))} g`, tone: 'amber' as const }))}
        />
        <Readout items={[{ label: 'маса преди:', value: `${fmt(massBefore)} g` }, { label: 'маса след:', value: `${fmt(massAfter)} g`, tone: 'emerald' }]} />
      </div>
      {(nA === 0 || nB === 0) && <Note tone="rose">Без едното вещество реакцията не протича.</Note>}
      {nA > 0 && nB > 0 && !limiting && <Note tone="emerald">Веществата са точно в стехиометрично отношение – и двете се изразходват напълно.</Note>}
      {nA > 0 && nB > 0 && limiting && (
        <Note tone="blue">
          {`${formulaText(limiting.f)} свършва първо: n/ν = ${limiting === r.a ? nA : nB}/${limiting.nu} е по-малко, отколкото за другото вещество. То определя колко продукт ще се получи.`}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Нека всяка нарисувана молекула означава 1 mol. Плъзгачът се мести през коефициента в уравнението, за да не остане „половин
        молекула“. Сравнявай не количествата, а отношенията n/ν – веществото с по-малко n/ν е в недостиг. Масата преди и след реакцията е
        една и съща.
      </p>
    </div>
  );
}
