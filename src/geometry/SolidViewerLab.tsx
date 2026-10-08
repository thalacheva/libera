import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from './diagram';

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;
const signs = [1, -1];
const all3 = (f: (a: number, b: number, c: number) => V3[]) => signs.flatMap(a => signs.flatMap(b => signs.flatMap(c => f(a, b, c))));

const SOLIDS: { name: string; faces: number; faceName: string; vertices: V3[] }[] = [
  {
    name: 'тетраедър',
    faces: 4,
    faceName: '4 триъгълника',
    vertices: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ],
  },
  { name: 'куб', faces: 6, faceName: '6 квадрата', vertices: all3((a, b, c) => [[a, b, c]]) },
  {
    name: 'октаедър',
    faces: 8,
    faceName: '8 триъгълника',
    vertices: signs.flatMap(s => [[s, 0, 0], [0, s, 0], [0, 0, s]] as V3[]),
  },
  {
    name: 'додекаедър',
    faces: 12,
    faceName: '12 петоъгълника',
    vertices: [
      ...all3((a, b, c) => [[a, b, c]]),
      ...signs.flatMap(a => signs.flatMap(b => [[0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]] as V3[])),
    ],
  },
  {
    name: 'икосаедър',
    faces: 20,
    faceName: '20 триъгълника',
    vertices: signs.flatMap(a => signs.flatMap(b => [[0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]] as V3[])),
  },
  {
    name: 'тристенна призма',
    faces: 5,
    faceName: '2 триъгълника и 3 квадрата',
    vertices: [0, 1, 2].flatMap(i => {
      const t = (2 * Math.PI * i) / 3;
      const r = 2 / Math.sqrt(3);
      return signs.map(z => [r * Math.cos(t), r * Math.sin(t), z] as V3);
    }),
  },
  {
    name: 'четириъгълна пирамида',
    faces: 5,
    faceName: 'квадрат и 4 триъгълника',
    vertices: [...signs.flatMap(a => signs.map(b => [a, b, -Math.SQRT2 / 2] as V3)), [0, 0, Math.SQRT2 / 2]],
  },
];

/** Ръбовете са двойките върхове на най-малко разстояние (всички ръбове на тези тела са равни). */
function edgesOf(v: V3[]) {
  const d = (p: V3, q: V3) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  let min = Infinity;
  v.forEach((p, i) => v.slice(i + 1).forEach(q => (min = Math.min(min, d(p, q)))));
  const e: [number, number][] = [];
  v.forEach((p, i) => v.forEach((q, j) => j > i && Math.abs(d(p, q) - min) < 1e-6 * min && e.push([i, j])));
  return e;
}

/** Въртящи се многостени и формулата на Ойлер V − E + F = 2. */
export function SolidViewerLab() {
  const [si, setSi] = useState(1);
  const [yaw, setYaw] = useState(30);
  const [pitch, setPitch] = useState(20);
  const [spin, setSpin] = useState(true);
  useAnimationFrame(spin, dt => setYaw(y => (y + dt * 30) % 360));

  const solid = SOLIDS[si];
  const v = solid.vertices;
  const edges = edgesOf(v);
  const scale = 110 / Math.max(...v.map(p => Math.hypot(...p)));

  const [cy, sy, cp, sp] = [Math.cos((yaw * Math.PI) / 180), Math.sin((yaw * Math.PI) / 180), Math.cos((pitch * Math.PI) / 180), Math.sin((pitch * Math.PI) / 180)];
  // Завъртане около вертикалната ос (z), после накланяне към зрителя
  const proj = v.map(([x, y, z]) => {
    const x1 = x * cy - y * sy;
    const y1 = x * sy + y * cy;
    const depth = y1 * cp - z * sp;
    const up = y1 * sp + z * cp;
    return { x: 160 + x1 * scale, y: 150 - up * scale, depth: depth * scale };
  });
  const maxD = Math.max(...proj.map(p => Math.abs(p.depth))) || 1;
  const sorted = [...edges].sort((a, b) => proj[b[0]].depth + proj[b[1]].depth - proj[a[0]].depth - proj[a[1]].depth);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
      <Buttons>
        {SOLIDS.map((s, i) => (
          <DiagramButton key={s.name} active={i === si} onClick={() => setSi(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <svg viewBox="0 0 320 300" className="w-full max-w-sm mx-auto h-auto block mt-2">
        {sorted.map(([a, b]) => {
          // По-далечните ръбове са по-бледи и пунктирани
          const d = (proj[a].depth + proj[b].depth) / 2 / maxD;
          const back = d > 0.15;
          return (
            <line
              key={`${a}-${b}`}
              x1={proj[a].x}
              y1={proj[a].y}
              x2={proj[b].x}
              y2={proj[b].y}
              className="stroke-blue-600 dark:stroke-blue-400"
              strokeWidth={back ? 1.5 : 2.8}
              strokeOpacity={back ? 0.35 : 1}
              strokeDasharray={back ? '5 4' : undefined}
              strokeLinecap="round"
            />
          );
        })}
        {proj.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} className="fill-rose-500" opacity={p.depth / maxD > 0.15 ? 0.4 : 1} />
        ))}
      </svg>
      <div className="flex justify-center mt-1">
        <button
          onClick={() => setSpin(s => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        >
          {spin ? <Pause size={14} /> : <Play size={14} />} {spin ? 'спри' : 'върти'}
        </button>
      </div>
      <Sliders>
        <Slider label="завърт." value={Math.round(yaw)} onChange={v => { setSpin(false); setYaw(v); }} min={0} max={360} step={1} tone="blue" />
        <Slider label="наклон" value={pitch} onChange={setPitch} min={-60} max={60} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'върхове V =', value: v.length, tone: 'rose' },
            { label: 'ръбове E =', value: edges.length, tone: 'blue' },
            { label: 'стени F =', value: solid.faces, tone: 'emerald' },
          ]}
        />
      </div>
      <Formula>
        V − E + F = {v.length} − {edges.length} + {solid.faces} = {v.length - edges.length + solid.faces}
      </Formula>
      <Note tone="gray">Стени: {solid.faceName}.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Формулата на Ойлер V − E + F = 2 важи за всеки изпъкнал многостен. Първите пет тела са правилните (Платонови) многостени – други няма.
      </p>
    </div>
  );
}
