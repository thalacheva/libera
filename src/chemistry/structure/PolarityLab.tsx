import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';

type V3 = [number, number, number];

// Електроотрицателност по Полинг
const EN: Record<string, number> = { H: 2.2, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, S: 2.58, Cl: 3.16 };

const rad = (deg: number) => (deg * Math.PI) / 180;
/** Две посоки надолу под ъгъл theta една спрямо друга (ъглова молекула в равнината xy). */
const bent = (theta: number): V3[] => [
  [Math.sin(rad(theta / 2)), -Math.cos(rad(theta / 2)), 0],
  [-Math.sin(rad(theta / 2)), -Math.cos(rad(theta / 2)), 0],
];
/** Три посоки надолу, всеки две под ъгъл theta (пирамида с ос y). */
const pyramid = (theta: number): V3[] => {
  const h = Math.sqrt((Math.cos(rad(theta)) + 0.5) / 1.5);
  const r = Math.sqrt(1 - h * h);
  return [90, 210, 330].map(phi => [r * Math.cos(rad(phi)), -h, r * Math.sin(rad(phi))] as V3);
};
const TETRA: V3[] = [[0, 1, 0], ...pyramid(109.47)];

type Molecule = { name: string; center: string; ligands: [string, V3][]; mu: number };
const MOLECULES: Molecule[] = [
  { name: 'CO₂', center: 'C', ligands: [['O', [1, 0, 0]], ['O', [-1, 0, 0]]], mu: 0 },
  { name: 'H₂O', center: 'O', ligands: bent(104.5).map(d => ['H', d]), mu: 1.85 },
  { name: 'BF₃', center: 'B', ligands: [0, 120, 240].map(a => ['F', [Math.sin(rad(a)), Math.cos(rad(a)), 0] as V3]), mu: 0 },
  { name: 'SO₂', center: 'S', ligands: bent(119).map(d => ['O', d]), mu: 1.63 },
  { name: 'NH₃', center: 'N', ligands: pyramid(107).map(d => ['H', d]), mu: 1.47 },
  { name: 'CH₄', center: 'C', ligands: TETRA.map(d => ['H', d]), mu: 0 },
  { name: 'CCl₄', center: 'C', ligands: TETRA.map(d => ['Cl', d]), mu: 0 },
  { name: 'CHCl₃', center: 'C', ligands: TETRA.map((d, i) => [i === 0 ? 'H' : 'Cl', d]), mu: 1.04 },
  { name: 'CH₂Cl₂', center: 'C', ligands: TETRA.map((d, i) => [i < 2 ? 'H' : 'Cl', d]), mu: 1.6 },
  { name: 'HCl', center: 'Cl', ligands: [['H', [-1, 0, 0]]], mu: 1.11 },
  { name: 'HCN', center: 'C', ligands: [['H', [-1, 0, 0]], ['N', [1, 0, 0]]], mu: 2.98 },
];

const COLOR: Record<string, string> = {
  H: 'fill-gray-100 stroke-gray-400',
  C: 'fill-gray-700 stroke-gray-900',
  N: 'fill-blue-500 stroke-blue-700',
  O: 'fill-red-500 stroke-red-700',
  F: 'fill-lime-400 stroke-lime-600',
  Cl: 'fill-green-500 stroke-green-700',
  S: 'fill-yellow-400 stroke-yellow-600',
  B: 'fill-pink-300 stroke-pink-500',
};
const DARK_TEXT = new Set(['H', 'F', 'S', 'B']);

const CX = 240;
const CY = 125;
const BOND = 90;
/** Пиксели за единица разлика в електроотрицателността. */
const K = 55;
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

function Arrow({ x1, y1, x2, y2, className, width }: { x1: number; y1: number; x2: number; y2: number; className: string; width: number }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const head = Math.min(10 + width, len * 0.6);
  const base = { x: x2 - ux * head, y: y2 - uy * head };
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={base.x} y2={base.y} strokeWidth={width} className="stroke-current" strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${base.x - uy * head * 0.45},${base.y + ux * head * 0.45} ${base.x + uy * head * 0.45},${base.y - ux * head * 0.45}`} className="fill-current" />
    </g>
  );
}

/** Полярни и неполярни молекули: диполите на връзките и тяхната векторна сума. */
export default function PolarityLab() {
  const [mi, setMi] = useState(1);
  const [yaw, setYaw] = useState(20);
  const m = MOLECULES[mi];

  const [cy, sy] = [Math.cos(rad(yaw)), Math.sin(rad(yaw))];
  const [cp, sp] = [Math.cos(rad(15)), Math.sin(rad(15))];
  // Завъртане около вертикалната ос (y) и лек наклон към зрителя
  const project = ([x, y, z]: V3) => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    return { x: x1, y: y * cp - z1 * sp, depth: z1 * cp + y * sp };
  };

  // Диполът на връзката сочи към по-електроотрицателния атом; дължината е пропорционална на ΔEN
  const bonds = m.ligands.map(([el, d]) => {
    const diff = EN[el] - EN[m.center];
    return { el, d, diff: Math.abs(diff), dipole: d.map(c => c * diff) as V3 };
  });
  const sum = bonds.reduce<V3>((s, b) => [s[0] + b.dipole[0], s[1] + b.dipole[1], s[2] + b.dipole[2]], [0, 0, 0]);
  const total = Math.hypot(...sum);
  const polar = total > 0.02;

  const items = bonds.map(b => ({ ...b, p: project(b.d), dp: project(b.dipole) })).sort((a, b) => a.p.depth - b.p.depth);
  const sp2 = project(sum);

  const atom = (el: string, x: number, y: number, r: number, key: string) => (
    <g key={key}>
      <circle cx={x} cy={y} r={r} className={COLOR[el]} strokeWidth="1.5" />
      <text x={x} y={y + 4.5} fontSize="13" fontWeight="700" textAnchor="middle" className={DARK_TEXT.has(el) ? 'fill-gray-800' : 'fill-white'}>
        {el}
      </text>
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MOLECULES.map((x, i) => (
          <DiagramButton key={x.name} active={i === mi} onClick={() => setMi(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        {items.map((b, i) => {
          const tip = { x: CX + b.p.x * BOND, y: CY - b.p.y * BOND };
          return <line key={`l${i}`} x1={CX} y1={CY} x2={tip.x} y2={tip.y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="5" strokeLinecap="round" />;
        })}
        {items
          .filter(b => b.p.depth > 0.05)
          .map((b, i) => atom(b.el, CX + b.p.x * BOND, CY - b.p.y * BOND, b.el === 'H' ? 13 : 17, `back${i}`))}
        {atom(m.center, CX, CY, 21, 'center')}
        {items
          .filter(b => b.p.depth <= 0.05)
          .map((b, i) => atom(b.el, CX + b.p.x * BOND, CY - b.p.y * BOND, b.el === 'H' ? 13 : 17, `front${i}`))}

        {/* Диполите на връзките – до самата връзка */}
        {items.map((b, i) => {
          const len = Math.hypot(b.p.x, b.p.y);
          if (len < 0.15 || b.diff < 0.01) return null;
          const mid = { x: CX + b.p.x * BOND * 0.55, y: CY - b.p.y * BOND * 0.55 };
          const n = { x: b.p.y / len, y: b.p.x / len };
          const v = { x: b.dp.x * K, y: -b.dp.y * K };
          const o = 15;
          return <Arrow key={`d${i}`} x1={mid.x + n.x * o - v.x / 2} y1={mid.y + n.y * o - v.y / 2} x2={mid.x + n.x * o + v.x / 2} y2={mid.y + n.y * o + v.y / 2} className="text-sky-600 dark:text-sky-400" width={2} />;
        })}

        {/* Сумата */}
        {polar && <Arrow x1={CX + (sp2.x / Math.hypot(sp2.x, sp2.y)) * 21} y1={CY - (sp2.y / Math.hypot(sp2.x, sp2.y)) * 21} x2={CX + sp2.x * K + (sp2.x / Math.hypot(sp2.x, sp2.y)) * 21} y2={CY - sp2.y * K - (sp2.y / Math.hypot(sp2.x, sp2.y)) * 21} className="text-rose-600 dark:text-rose-400" width={4} />}
        <text x={10} y={242} fontSize="12" className="fill-sky-700 dark:fill-sky-400">
          → дипол на връзка (към по-електроотрицателния атом)
        </text>
        <text x={470} y={242} fontSize="12" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          {polar ? '→ сума' : 'сума = 0'}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="завърт." value={yaw} onChange={setYaw} min={0} max={360} step={5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ΔEN на връзките:', value: [...new Set(bonds.map(b => `${m.center}–${b.el}: ${fmt(b.diff)}`))].join(', '), tone: 'blue' },
            { label: 'сума (модел):', value: fmt(total), tone: 'rose' },
            { label: 'измерено:', value: `${fmt(m.mu)} D` },
          ]}
        />
      </div>
      <Note tone={polar ? 'rose' : 'emerald'}>
        {polar
          ? `${m.name} е полярна молекула – диполите на връзките не се компенсират.`
          : bonds.some(b => b.diff > 0.01)
            ? `${m.name} е неполярна: връзките са полярни, но диполите им се компенсират заради симетрията.`
            : `${m.name} е неполярна.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Тук диполът на всяка връзка е вектор с дължина ΔEN, насочен към по-електроотрицателния атом. Моделът казва правилно{' '}
        <strong>дали</strong> молекулата е полярна, но не и точно колко: реалният диполен момент (в дебаи, D) зависи и от неподелените
        двойки и от дължините на връзките. Завърти молекулата – сумата не зависи от това как я гледаме.
      </p>
    </div>
  );
}
