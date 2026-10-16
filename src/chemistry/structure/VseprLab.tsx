import { Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';

type V3 = [number, number, number];

const S3 = Math.sqrt(3) / 2;
const T = 1 / Math.sqrt(3);
/** Посоките на електронните области при 2–6 области (идеална геометрия). */
const DIRECTIONS: Record<number, V3[]> = {
  2: [
    [1, 0, 0],
    [-1, 0, 0],
  ],
  3: [
    [1, 0, 0],
    [-0.5, S3, 0],
    [-0.5, -S3, 0],
  ],
  4: [
    [T, T, T],
    [T, -T, -T],
    [-T, T, -T],
    [-T, -T, T],
  ],
  // Тристенна бипирамида: първо трите екваториални, после двете аксиални
  5: [
    [1, 0, 0],
    [-0.5, S3, 0],
    [-0.5, -S3, 0],
    [0, 0, 1],
    [0, 0, -1],
  ],
  // Октаедър: противоположните посоки са съседни в списъка (0–1, 2–3, 4–5)
  6: [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ],
};

/**
 * Кои от посоките заемат неподелените двойки. При 5 области те са в екваториалната равнина
 * (там имат повече място), а при 6 – една срещу друга.
 */
const LONE: Record<string, number[]> = {
  '2-1': [2],
  '3-1': [3],
  '2-2': [2, 3],
  '4-1': [0],
  '3-2': [0, 1],
  '2-3': [0, 1, 2],
  '5-1': [5],
  '4-2': [4, 5],
};

type Shape = { name: string; angle: string };
const SHAPES: Record<string, Shape> = {
  '2-0': { name: 'линейна', angle: '180°' },
  '3-0': { name: 'плоска триъгълна', angle: '120°' },
  '2-1': { name: 'ъглова', angle: 'малко под 120°' },
  '4-0': { name: 'тетраедрична', angle: '109,5°' },
  '3-1': { name: 'тристенна пирамида', angle: 'под 109,5°' },
  '2-2': { name: 'ъглова', angle: 'под 109,5°' },
  '5-0': { name: 'тристенна бипирамида', angle: '90° и 120°' },
  '4-1': { name: '„люлка“', angle: 'около 90° и 120°' },
  '3-2': { name: 'Т-образна', angle: 'около 90°' },
  '2-3': { name: 'линейна', angle: '180°' },
  '6-0': { name: 'октаедрична', angle: '90°' },
  '5-1': { name: 'квадратна пирамида', angle: 'около 90°' },
  '4-2': { name: 'квадратна плоска', angle: '90°' },
};

type Molecule = { tex: string; center: string; ligand: string; bonds: number; lone: number; order?: number; real?: string };
const MOLECULES: Molecule[] = [
  { tex: 'CO₂', center: 'C', ligand: 'O', bonds: 2, lone: 0, order: 2, real: '180°' },
  { tex: 'BF₃', center: 'B', ligand: 'F', bonds: 3, lone: 0, real: '120°' },
  { tex: 'SO₂', center: 'S', ligand: 'O', bonds: 2, lone: 1, order: 2, real: '≈ 119°' },
  { tex: 'CH₄', center: 'C', ligand: 'H', bonds: 4, lone: 0, real: '109,5°' },
  { tex: 'NH₃', center: 'N', ligand: 'H', bonds: 3, lone: 1, real: '≈ 107°' },
  { tex: 'H₂O', center: 'O', ligand: 'H', bonds: 2, lone: 2, real: '≈ 104,5°' },
  { tex: 'PCl₅', center: 'P', ligand: 'Cl', bonds: 5, lone: 0, real: '90° и 120°' },
  { tex: 'SF₄', center: 'S', ligand: 'F', bonds: 4, lone: 1 },
  { tex: 'ClF₃', center: 'Cl', ligand: 'F', bonds: 3, lone: 2 },
  { tex: 'XeF₂', center: 'Xe', ligand: 'F', bonds: 2, lone: 3, real: '180°' },
  { tex: 'SF₆', center: 'S', ligand: 'F', bonds: 6, lone: 0, real: '90°' },
  { tex: 'XeF₄', center: 'Xe', ligand: 'F', bonds: 4, lone: 2, real: '90°' },
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
  P: 'fill-orange-400 stroke-orange-600',
  Xe: 'fill-cyan-400 stroke-cyan-600',
  A: 'fill-violet-400 stroke-violet-600',
  X: 'fill-sky-300 stroke-sky-500',
};
const DARK_TEXT = new Set(['H', 'F', 'S', 'B', 'X']);

const CX = 240;
const CY = 135;
const BOND = 95;

/** 3D модел „топчета и пръчици“: формата на молекулата по VSEPR. Влачи, за да въртиш. */
export default function VseprLab() {
  const [mol, setMol] = useState<number | null>(3);
  const [bonds, setBonds] = useState(4);
  const [lone, setLone] = useState(0);
  const [yaw, setYaw] = useState(25);
  const [pitch, setPitch] = useState(20);
  const [spin, setSpin] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);
  useAnimationFrame(spin, dt => setYaw(y => (y + dt * 25) % 360));

  const m = mol === null ? null : MOLECULES[mol];
  const key = `${bonds}-${lone}`;
  const shape = SHAPES[key];
  const total = bonds + lone;
  const dirs = DIRECTIONS[total];
  const lonePos = LONE[key] ?? [];
  const center = m?.center ?? 'A';
  const ligand = m?.ligand ?? 'X';

  const choose = (i: number) => {
    setMol(i);
    setBonds(MOLECULES[i].bonds);
    setLone(MOLECULES[i].lone);
  };
  const setCounts = (b: number, l: number) => {
    setMol(null);
    setBonds(b);
    setLone(l);
  };

  const [cy, sy, cp, sp] = [Math.cos((yaw * Math.PI) / 180), Math.sin((yaw * Math.PI) / 180), Math.cos((pitch * Math.PI) / 180), Math.sin((pitch * Math.PI) / 180)];
  const project = ([x, y, z]: V3) => {
    const x1 = x * cy - y * sy;
    const y1 = x * sy + y * cy;
    return { x: x1, y: y1 * sp + z * cp, depth: y1 * cp - z * sp };
  };

  // Всичко се рисува отзад напред: по-далечните части първо
  const items = dirs
    .map((d, i) => ({ ...project(d), lone: lonePos.includes(i) }))
    .sort((a, b) => b.depth - a.depth);
  const front = items.filter(it => it.depth <= 0);
  const back = items.filter(it => it.depth > 0);

  const draw = (it: (typeof items)[number], i: number) => {
    const tip = { x: CX + it.x * BOND, y: CY - it.y * BOND };
    const shade = 1 - Math.max(0, it.depth) * 0.35;
    if (it.lone) {
      const mid = { x: CX + it.x * BOND * 0.55, y: CY - it.y * BOND * 0.55 };
      const angle = (Math.atan2(-(it.y), it.x) * 180) / Math.PI;
      const len = Math.hypot(it.x, it.y);
      return (
        <g key={`l${i}`} opacity={shade}>
          <ellipse cx={mid.x} cy={mid.y} rx={8 + 26 * len} ry={17} transform={`rotate(${angle} ${mid.x} ${mid.y})`} className="fill-violet-400/25 stroke-violet-400" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx={mid.x + 5 * Math.sin((angle * Math.PI) / 180)} cy={mid.y - 5 * Math.cos((angle * Math.PI) / 180)} r={3} className="fill-violet-600" />
          <circle cx={mid.x - 5 * Math.sin((angle * Math.PI) / 180)} cy={mid.y + 5 * Math.cos((angle * Math.PI) / 180)} r={3} className="fill-violet-600" />
        </g>
      );
    }
    const order = m?.order ?? 1;
    const len = Math.hypot(tip.x - CX, tip.y - CY) || 1;
    const n = { x: -(tip.y - CY) / len, y: (tip.x - CX) / len };
    const offsets = order === 2 ? [-3.5, 3.5] : [0];
    return (
      <g key={`b${i}`} opacity={shade}>
        {offsets.map(o => (
          <line key={o} x1={CX + ((tip.x - CX) / len) * 24 + n.x * o} y1={CY + ((tip.y - CY) / len) * 24 + n.y * o} x2={tip.x + n.x * o} y2={tip.y + n.y * o} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth={order === 2 ? 3 : 6} strokeLinecap="round" />
        ))}
        <circle cx={tip.x} cy={tip.y} r={ligand === 'H' ? 15 : 19} className={COLOR[ligand] ?? COLOR.X} strokeWidth="1.5" />
        <text x={tip.x} y={tip.y + 4.5} fontSize="13" fontWeight="700" textAnchor="middle" className={DARK_TEXT.has(ligand) ? 'fill-gray-800' : 'fill-white'}>
          {ligand}
        </text>
      </g>
    );
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY };
    setSpin(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setYaw(y => (y + dx * 0.6 + 360) % 360);
    setPitch(p => Math.max(-85, Math.min(85, p + dy * 0.6)));
  };
  const onUp = () => (drag.current = null);

  const validLone = [0, 1, 2, 3].filter(l => SHAPES[`${bonds}-${l}`]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MOLECULES.map((x, i) => (
          <DiagramButton key={x.tex} active={i === mol} onClick={() => choose(i)}>
            {x.tex}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg
        viewBox="0 0 480 270"
        className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2 cursor-grab"
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {back.map(draw)}
        <circle cx={CX} cy={CY} r={24} className={COLOR[center] ?? COLOR.A} strokeWidth="1.5" />
        <text x={CX} y={CY + 5} fontSize="15" fontWeight="700" textAnchor="middle" className={DARK_TEXT.has(center) ? 'fill-gray-800' : 'fill-white'}>
          {center}
        </text>
        {front.map(draw)}
        <text x={10} y={262} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
          влачи, за да завъртиш
        </text>
      </LabSvg>

      <div className="flex justify-center mt-1">
        <button
          onClick={() => setSpin(s => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        >
          {spin ? <Pause size={14} /> : <Play size={14} />} {spin ? 'спри' : 'върти'}
        </button>
      </div>

      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">Или сглоби молекула AXₙEₘ сам:</p>
      <Buttons>
        <span className="self-center text-sm text-gray-600 dark:text-gray-400">свързани атоми:</span>
        {[2, 3, 4, 5, 6].map(b => (
          <DiagramButton key={b} active={mol === null && b === bonds} onClick={() => setCounts(b, SHAPES[`${b}-${lone}`] ? lone : 0)}>
            {b}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <span className="self-center text-sm text-gray-600 dark:text-gray-400">неподелени двойки:</span>
        {validLone.map(l => (
          <DiagramButton key={l} active={mol === null && l === lone} onClick={() => setCounts(bonds, l)}>
            {l}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'електронни области:', value: total, tone: 'blue' },
            { label: 'неподелени двойки:', value: lone, tone: 'violet' },
            { label: 'форма:', value: shape.name, tone: 'emerald' },
            { label: 'ъгъл:', value: m?.real ?? shape.angle },
          ]}
        />
      </div>
      {lone > 0 && (
        <Note tone="violet">
          Моделът е с идеалните посоки. Неподелените двойки (виолетово) отблъскват по-силно и в действителност сближават връзките.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Формата на молекулата е разположението на <strong>атомите</strong>. Неподелените двойки определят посоките, но не се „виждат“ във
        формата: и CH₄, и NH₃, и H₂O имат по 4 електронни области, но са съответно тетраедър, пирамида и ъглова молекула. Двойната връзка
        (CO₂, SO₂) се брои за една област.
      </p>
    </div>
  );
}
