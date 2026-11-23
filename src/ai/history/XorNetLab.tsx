import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const W = 640;
const H = 320;
const LO = -0.35;
const HI = 1.35;

// Лявото поле – входовете (x₁, x₂); дясното – скритият слой (h₁, h₂)
const LEFT = { x: 46, y: 34, size: 250 };
const RIGHT = { x: 372, y: 34, size: 250 };
const px = (box: typeof LEFT, v: number) => box.x + ((v - LO) / (HI - LO)) * box.size;
const py = (box: typeof LEFT, v: number) => box.y + box.size - ((v - LO) / (HI - LO)) * box.size;

const INPUTS = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
const xor = (a: number, b: number) => a ^ b;

/** Отсечката x₁ + x₂ = t вътре в квадрата [LO, HI]². */
function lineIn(box: typeof LEFT, t: number) {
  const pts: [number, number][] = [];
  for (const [x, y] of [
    [LO, t - LO],
    [HI, t - HI],
    [t - LO, LO],
    [t - HI, HI],
  ]) {
    if (x >= LO - 1e-9 && x <= HI + 1e-9 && y >= LO - 1e-9 && y <= HI + 1e-9) pts.push([x, y]);
  }
  if (pts.length < 2) return null;
  return { x1: px(box, pts[0][0]), y1: py(box, pts[0][1]), x2: px(box, pts[1][0]), y2: py(box, pts[1][1]) };
}

/** Ивицата t₁ < x₁ + x₂ ≤ t₂, отрязана в квадрата – там мрежата дава 1. */
function band(box: typeof LEFT, t1: number, t2: number) {
  if (t2 <= t1) return '';
  const pts: [number, number][] = [];
  const corners: [number, number][] = [
    [LO, LO],
    [HI, LO],
    [HI, HI],
    [LO, HI],
  ];
  const inside = ([x, y]: [number, number]) => x + y > t1 && x + y <= t2;
  for (let i = 0; i < 4; i++) {
    const p = corners[i];
    const q = corners[(i + 1) % 4];
    if (inside(p)) pts.push(p);
    // Пресечните точки на страната с двете прави, подредени по посока на обхождането
    const cuts: [number, [number, number]][] = [];
    for (const t of [t1, t2]) {
      const sp = p[0] + p[1] - t;
      const sq = q[0] + q[1] - t;
      if (sp > 0 !== sq > 0) {
        const k = sp / (sp - sq);
        cuts.push([k, [p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]]);
      }
    }
    cuts.sort((a, b) => a[0] - b[0]);
    for (const [, c] of cuts) pts.push(c);
  }
  return pts.map(([x, y]) => `${px(box, x)},${py(box, y)}`).join(' ');
}

const num = (v: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: 1 }).replace('-', '−');

/** Мрежа с един скрит слой от два перцептрона: двете прави заедно решават XOR. */
export default function XorNetLab() {
  const [t1, setT1] = useState(0.5);
  const [t2, setT2] = useState(2.5);

  const rows = INPUTS.map(([a, b]) => {
    const h1 = a + b > t1 ? 1 : 0;
    const h2 = a + b > t2 ? 1 : 0;
    const y = h1 - h2 > 0.5 ? 1 : 0;
    return { a, b, h1, h2, y, target: xor(a, b) };
  });
  const correct = rows.filter(r => r.y === r.target).length;
  const l1 = lineIn(LEFT, t1);
  const l2 = lineIn(LEFT, t2);

  const frame = (box: typeof LEFT, xl: string, yl: string, title: string) => (
    <g>
      <rect x={box.x} y={box.y} width={box.size} height={box.size} className="fill-blue-50 stroke-gray-300 dark:fill-blue-950/40 dark:stroke-gray-600" />
      <text x={box.x + box.size / 2} y={box.y - 12} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
        {title}
      </text>
      {[0, 1].map(v => (
        <g key={v}>
          <text x={px(box, v)} y={box.y + box.size + 15} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
          <text x={box.x - 7} y={py(box, v) + 4} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
        </g>
      ))}
      <text x={box.x + box.size / 2} y={box.y + box.size + 30} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {xl}
      </text>
      <text x={box.x - 24} y={box.y + box.size / 2 + 4} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {yl}
      </text>
    </g>
  );

  const dot = (cx: number, cy: number, r: (typeof rows)[number], label: string, key: string) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={9} className={r.target === 1 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'} stroke={r.y === r.target ? 'white' : 'black'} strokeWidth={r.y === r.target ? 1.5 : 3} />
      <text x={cx + 13} y={cy - 10} fontSize="12" className="fill-gray-900 dark:fill-gray-100">
        {label}
        {r.y === r.target ? '' : ' ✗'}
      </text>
    </g>
  );

  // Точките в скрития слой: няколко входа може да попаднат на едно място
  const hidden = new Map<string, typeof rows>();
  for (const r of rows) hidden.set(`${r.h1}${r.h2}`, [...(hidden.get(`${r.h1}${r.h2}`) ?? []), r]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {frame(LEFT, 'x₁', 'x₂', 'Входовете: две прави')}
        <polygon points={band(LEFT, t1, t2)} className="fill-rose-200/80 dark:fill-rose-900/50" />
        {l1 && <line {...l1} className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="2.5" />}
        {l2 && <line {...l2} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.5" />}
        {rows.map(r => dot(px(LEFT, r.a), py(LEFT, r.b), r, `(${r.a};${r.b})`, `i${r.a}${r.b}`))}

        <text x={(LEFT.x + LEFT.size + RIGHT.x) / 2 - 8} y={H / 2 - 6} fontSize="22" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          →
        </text>

        {frame(RIGHT, 'h₁', 'h₂', 'Скритият слой: една права')}
        {/* Изходният перцептрон: h₁ − h₂ = 0,5 */}
        <polygon
          points={[
            [LO + 0.5, LO],
            [HI, LO],
            [HI, HI - 0.5],
          ]
            .map(([x, y]) => `${px(RIGHT, x)},${py(RIGHT, y)}`)
            .join(' ')}
          className="fill-rose-200/80 dark:fill-rose-900/50"
        />
        <line x1={px(RIGHT, 0.5 + LO)} y1={py(RIGHT, LO)} x2={px(RIGHT, HI)} y2={py(RIGHT, HI - 0.5)} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" />
        {[...hidden].map(([key, list]) =>
          dot(px(RIGHT, list[0].h1), py(RIGHT, list[0].h2), list.find(r => r.y !== r.target) ?? list[0], list.map(r => `(${r.a};${r.b})`).join(' '), `h${key}`)
        )}
      </LabSvg>

      <Sliders>
        <Slider label="праг 1" value={t1} onChange={setT1} min={-0.5} max={2.5} step={0.1} tone="violet" />
        <Slider label="праг 2" value={t2} onChange={setT2} min={-0.5} max={2.5} step={0.1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton
          onClick={() => {
            setT1(0.5);
            setT2(2.5);
          }}
        >
          отначало
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'h₁ = 1, ако x₁ + x₂ >', value: num(t1), tone: 'violet' },
            { label: 'h₂ = 1, ако x₁ + x₂ >', value: num(t2), tone: 'amber' },
            { label: 'изход 1, ако', value: 'h₁ − h₂ > 0,5' },
            { label: 'верни', value: `${correct} от 4`, tone: correct === 4 ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={correct === 4 ? 'emerald' : 'gray'}>
        {correct === 4
          ? 'Готово: двете прави затварят ивица, в която са само единиците. В скрития слой четирите точки вече се делят с една права.'
          : 'Всеки скрит перцептрон чертае една права. Премести втория праг така, че точката (1;1) да остане извън червената ивица.'}
      </Note>
    </div>
  );
}
