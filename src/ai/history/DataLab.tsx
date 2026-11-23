import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from './rollouts';

const SIZES = [5, 10, 20, 50, 100, 200, 500, 1000];
const COLS = 48;
const ROWS = 30;

/** Истинската граница между двата класа – машината не я знае, вижда само примери. */
const truth = (x: number, y: number) => (y > 0.5 + 0.22 * Math.sin(2 * Math.PI * 1.5 * x) ? 1 : 0);

type P = { x: number; y: number; c: number };

function samples(seed: number): P[] {
  const random = mulberry32(seed);
  return Array.from({ length: SIZES[SIZES.length - 1] }, () => {
    const x = random();
    const y = random();
    return { x, y, c: truth(x, y) };
  });
}

/** Класът на най-близкия обучаващ пример. */
function nearest(points: P[], n: number, x: number, y: number) {
  let best = Infinity;
  let c = 0;
  for (let i = 0; i < n; i++) {
    const d = (points[i].x - x) ** 2 + (points[i].y - y) ** 2;
    if (d < best) {
      best = d;
      c = points[i].c;
    }
  }
  return c;
}

/** Предсказанията върху мрежа от клетки и делът на грешните. */
function evaluate(points: P[], n: number) {
  const cells: number[] = [];
  let wrong = 0;
  for (let r = 0; r < ROWS; r++)
    for (let q = 0; q < COLS; q++) {
      const x = (q + 0.5) / COLS;
      const y = 1 - (r + 0.5) / ROWS;
      const c = nearest(points, n, x, y);
      cells.push(c);
      if (c !== truth(x, y)) wrong++;
    }
  return { cells, error: wrong / (ROWS * COLS) };
}

const W = 640;
const H = 290;
const MAP = { x: 10, y: 10, w: 400, h: 250 };
const CHART = { x: 462, y: 30, w: 168, h: 200 };

const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;

/** Колкото повече примери, толкова по-точно: класификатор „най-близък съсед“ с 5 до 1000 примера. */
export default function DataLab() {
  const [k, setK] = useState(1);
  const [seed, setSeed] = useState(3);

  const points = useMemo(() => samples(seed), [seed]);
  const all = useMemo(() => SIZES.map(n => evaluate(points, n)), [points]);
  const n = SIZES[k];
  const { cells, error } = all[k];
  const cw = MAP.w / COLS;
  const ch = MAP.h / ROWS;
  const maxError = Math.max(0.3, ...all.map(a => a.error));

  // Истинската граница като начупена линия
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = i / 80;
    const y = 0.5 + 0.22 * Math.sin(2 * Math.PI * 1.5 * x);
    return `${MAP.x + x * MAP.w},${MAP.y + (1 - y) * MAP.h}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {cells.map((c, i) => (
          <rect
            key={i}
            x={MAP.x + (i % COLS) * cw}
            y={MAP.y + Math.floor(i / COLS) * ch}
            width={cw + 0.5}
            height={ch + 0.5}
            className={c === 1 ? 'fill-rose-200 dark:fill-rose-900/60' : 'fill-blue-100 dark:fill-blue-950/60'}
          />
        ))}
        <polyline points={curve} fill="none" className="stroke-gray-900 dark:stroke-white" strokeWidth="2" strokeDasharray="6 4" />
        {points.slice(0, n).map((p, i) => (
          <circle
            key={i}
            cx={MAP.x + p.x * MAP.w}
            cy={MAP.y + (1 - p.y) * MAP.h}
            r={n > 200 ? 2 : n > 50 ? 3 : 4.5}
            className={p.c === 1 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'}
            stroke="white"
            strokeWidth={n > 200 ? 0.4 : 1}
          />
        ))}
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
        <text x={MAP.x} y={H - 8} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          пунктир – истинската граница; цветните зони – какво предсказва машината
        </text>

        {/* Грешка според броя на примерите */}
        <text x={CHART.x + CHART.w / 2} y={18} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
          грешка според примерите
        </text>
        <line x1={CHART.x} y1={CHART.y + CHART.h} x2={CHART.x + CHART.w} y2={CHART.y + CHART.h} className="stroke-gray-400" />
        {all.map((a, i) => {
          const bw = CHART.w / SIZES.length;
          const bh = (a.error / maxError) * CHART.h;
          return (
            <g key={i} onClick={() => setK(i)} className="cursor-pointer">
              <rect x={CHART.x + i * bw + 2} y={CHART.y + CHART.h - bh} width={bw - 4} height={bh} className={i === k ? 'fill-fuchsia-600 dark:fill-fuchsia-400' : 'fill-gray-300 dark:fill-gray-600'} />
              <text x={CHART.x + i * bw + bw / 2} y={CHART.y + CHART.h + 15} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {SIZES[i] >= 1000 ? '1k' : SIZES[i]}
              </text>
            </g>
          );
        })}
        <text x={CHART.x + CHART.w / 2} y={CHART.y + CHART.h + 34} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          брой примери
        </text>
      </LabSvg>

      <Sliders>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-16 flex-shrink-0 font-mono text-violet-700 dark:text-violet-400">примери</span>
          <input type="range" min={0} max={SIZES.length - 1} step={1} value={k} onChange={e => setK(Number(e.target.value))} className="flex-1 min-w-0 accent-violet-500 cursor-pointer" aria-label="Брой обучаващи примери" />
          <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{n}</span>
        </label>
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setSeed(s => s + 1)}>други примери</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'обучаващи примери', value: n, tone: 'violet' },
            { label: 'грешка', value: pct(error), tone: 'rose' },
            { label: 'вярно', value: pct(1 - error), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="gray">
        Програмата е една и съща при всички положения на плъзгача: „отговори като най-близкия познат пример“. Променя се само броят на
        примерите.
      </Note>
    </div>
  );
}
