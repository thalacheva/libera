import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { type Terrain, contours, hypsoColor, levelsOf, sample } from '../terrain';

const N = 60;
/** Картата е 8 × 8 km, както в лабораторията за профила. */
const SIDE_KM = 8;
const CELL_KM = SIDE_KM / N;
const M0 = 10;
const MS = 300;
// Надлъжният профил
const PX = 372;
const PW = 250;
const PY = 30;
const PH = 220;

/** Измислена планинска област: билото е на север, а главната долина се спуска на юг и излиза от картата. */
const LAND: Terrain = (x, y) => {
  const valley = Math.abs(x - 0.5 - 0.07 * Math.sin(5 * y + 1));
  // по дъното на главната долина неравностите са по-малки – иначе се получават затворени понижения
  const rough = 0.3 + 0.7 * Math.min(1, valley / 0.18);
  return (
    240 +
    1300 * (1 - y) ** 1.8 * (0.75 + 0.25 * Math.cos(4 * x - 2)) +
    300 * (1 - y) +
    900 * valley ** 1.15 * (1 - 0.45 * y) +
    rough *
      (110 * (Math.sin(13 * x + 2 * y) + Math.sin(11 * y - 7 * x + 1)) * (1 - 0.5 * y) + 55 * Math.sin(23 * x + 17 * y) + 35 * Math.cos(31 * x - 19 * y + 2))
  );
};

const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

type Net = {
  /** Височините със запълнени затворени понижения – по тях тече водата. */
  z: Float64Array;
  /** Накъде се оттича всяка клетка (-1 – извън картата). */
  down: Int32Array;
  /** Колко клетки се оттичат през всяка (заедно със самата нея). */
  acc: Int32Array;
  /** Клетките от най-високата към най-ниската (по запълнения релеф). */
  order: number[];
  up: number[][];
};

/** Мрежа на оттока: запълваме затворените понижения (priority-flood), всяка клетка се оттича към най-стръмния от 8-те съседа. */
function buildNet(): Net {
  const z = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) z[j * N + i] = LAND((i + 0.5) / N, (j + 0.5) / N);
  const filled = Float64Array.from(z);
  const seen = new Uint8Array(N * N);
  // проста двоична пирамида по височина
  const heap: number[] = [];
  const push = (c: number) => {
    heap.push(c);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (filled[heap[p]] <= filled[heap[k]]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < heap.length && filled[heap[l]] < filled[heap[m]]) m = l;
        if (r < heap.length && filled[heap[r]] < filled[heap[m]]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++)
      if (i === 0 || j === 0 || i === N - 1 || j === N - 1) {
        seen[j * N + i] = 1;
        push(j * N + i);
      }
  while (heap.length) {
    const c = pop();
    const ci = c % N;
    const cj = Math.floor(c / N);
    for (const [di, dj] of DIRS) {
      const i = ci + di;
      const j = cj + dj;
      if (i < 0 || j < 0 || i >= N || j >= N) continue;
      const n = j * N + i;
      if (seen[n]) continue;
      seen[n] = 1;
      filled[n] = Math.max(filled[n], filled[c] + 0.01);
      push(n);
    }
  }

  const down = new Int32Array(N * N).fill(-1);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const c = j * N + i;
      let best = 0;
      for (const [di, dj] of DIRS) {
        const ii = i + di;
        const jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
        const s = (filled[c] - filled[jj * N + ii]) / Math.hypot(di, dj);
        if (s > best) {
          best = s;
          down[c] = jj * N + ii;
        }
      }
    }
  const order = Array.from({ length: N * N }, (_, c) => c).sort((a, b) => filled[b] - filled[a]);
  const acc = new Int32Array(N * N).fill(1);
  const up: number[][] = Array.from({ length: N * N }, () => []);
  for (const c of order)
    if (down[c] >= 0) {
      acc[down[c]] += acc[c];
      up[down[c]].push(c);
    }
  return { z: filled, down, acc, order, up };
}

const center = (c: number) => ({
  x: M0 + ((c % N) + 0.5) * (MS / N),
  y: M0 + (Math.floor(c / N) + 0.5) * (MS / N),
});
const dist = (a: number, b: number) => Math.hypot((a % N) - (b % N), Math.floor(a / N) - Math.floor(b / N)) * CELL_KM;

/** Водосборен басейн: щракни по реката и виж откъде идва водата ѝ. */
export default function CatchmentLab() {
  const net = useMemo(buildNet, []);
  const { bg, lines } = useMemo(() => {
    const grid = sample(LAND, 70);
    const n = 40;
    return {
      lines: contours(grid, levelsOf(grid, 100)),
      bg: Array.from({ length: n * n }, (_, c) => ({
        i: c % n,
        j: Math.floor(c / n),
        n,
        fill: hypsoColor(LAND(((c % n) + 0.5) / n, (Math.floor(c / n) + 0.5) / n)),
      })),
    };
  }, []);
  const [minArea, setMinArea] = useState(0.5);
  const threshold = Math.max(2, Math.round(minArea / CELL_KM ** 2));

  // Устието по подразбиране: реката с най-голям водосбор, преди да излезе от картата
  const defaultOutlet = useMemo(() => {
    let best = 0;
    for (let c = 0; c < N * N; c++) if (net.down[c] < 0 && net.acc[c] > net.acc[best]) best = c;
    return net.up[best].reduce((a, b) => (net.acc[b] > net.acc[a] ? b : a), net.up[best][0] ?? best);
  }, [net]);
  const [outlet, setOutlet] = useState<number | null>(null);
  const out = outlet ?? defaultOutlet;

  // Ред по Щралер за реките (клетки с водосбор над прага)
  const strahler = useMemo(() => {
    const s = new Int32Array(N * N);
    for (const c of net.order) {
      if (net.acc[c] < threshold) continue;
      const ins = net.up[c].filter(u => net.acc[u] >= threshold).map(u => s[u]);
      if (!ins.length) s[c] = 1;
      else {
        const m = Math.max(...ins);
        s[c] = ins.filter(v => v === m).length > 1 ? m + 1 : m;
      }
    }
    return s;
  }, [net, threshold]);

  const basin = useMemo(() => {
    const inB = new Uint8Array(N * N);
    const stack = [out];
    while (stack.length) {
      const c = stack.pop()!;
      inB[c] = 1;
      stack.push(...net.up[c]);
    }
    return inB;
  }, [net, out]);

  // Вододелът: страните на клетките от басейна, зад които започва друг басейн
  const divide = useMemo(() => {
    const k = MS / N;
    let d = '';
    for (let c = 0; c < N * N; c++) {
      if (!basin[c]) continue;
      const i = c % N;
      const j = Math.floor(c / N);
      const x = M0 + i * k;
      const y = M0 + j * k;
      if (j === 0 || !basin[c - N]) d += `M${x} ${y}h${k}`;
      if (j === N - 1 || !basin[c + N]) d += `M${x} ${y + k}h${k}`;
      if (i === 0 || !basin[c - 1]) d += `M${x} ${y}v${k}`;
      if (i === N - 1 || !basin[c + 1]) d += `M${x + k} ${y}v${k}`;
    }
    return d;
  }, [basin]);
  const basinFill = useMemo(() => {
    const k = MS / N;
    let d = '';
    for (let c = 0; c < N * N; c++) if (basin[c]) d += `M${M0 + (c % N) * k} ${M0 + Math.floor(c / N) * k}h${k}v${k}h${-k}Z`;
    return d;
  }, [basin]);

  // Главната река: от устието нагоре по най-пълноводния приток чак до вододела
  const main = useMemo(() => {
    const path = [out];
    let c = out;
    while (net.up[c].length) {
      c = net.up[c].reduce((a, b) => (net.acc[b] > net.acc[a] ? b : a));
      path.push(c);
    }
    return path.reverse();
  }, [net, out]);
  const along = [0];
  for (let i = 1; i < main.length; i++) along.push(along[i - 1] + dist(main[i - 1], main[i]));
  const lenKm = along[along.length - 1];
  const zs = main.map(c => net.z[c]);
  const zSrc = zs[0];
  const zOut = zs[zs.length - 1];
  const fall = zSrc - zOut;
  const areaKm2 = basin.reduce((s, v) => s + v, 0) * CELL_KM ** 2;
  let zMax = 0;
  for (let c = 0; c < N * N; c++) if (basin[c]) zMax = Math.max(zMax, net.z[c]);
  const gradient = lenKm > 0 ? fall / lenKm : 0; // m/km = ‰
  // наклонът в горната и долната третина
  const third = (from: number, to: number) => {
    const a = along.findIndex(s => s >= from * lenKm);
    const b = along.findIndex(s => s >= to * lenKm - 1e-9);
    return along[b] - along[a] > 0 ? (zs[a] - zs[b]) / (along[b] - along[a]) : 0;
  };
  const upper = third(0, 1 / 3);
  const lower = third(2 / 3, 1);

  // Профилът
  const zLo = Math.floor(zOut / 100) * 100 - 50;
  const zHi = Math.ceil(zSrc / 100) * 100 + 50;
  const ppx = (s: number) => PX + (lenKm > 0 ? (s / lenKm) * PW : 0);
  const ppy = (h: number) => PY + PH - ((h - zLo) / (zHi - zLo)) * PH;
  const profile = zs.map((h, i) => `${i ? 'L' : 'M'}${ppx(along[i]).toFixed(1)} ${ppy(h).toFixed(1)}`).join('');
  const levels: number[] = [];
  const step = zHi - zLo > 1200 ? 500 : 200;
  for (let h = Math.ceil(zLo / step) * step; h <= zHi; h += step) levels.push(h);

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const i = Math.floor(((p.x - M0) / MS) * N);
    const j = Math.floor(((p.y - M0) / MS) * N);
    if (i < 0 || j < 0 || i >= N || j >= N) return;
    // прилепва към най-пълноводната река наблизо
    let best = -1;
    for (let dj = -3; dj <= 3; dj++)
      for (let di = -3; di <= 3; di++) {
        const ii = i + di;
        const jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= N || jj >= N || Math.hypot(di, dj) > 3.2) continue;
        const c = jj * N + ii;
        if (net.acc[c] >= threshold && (best < 0 || net.acc[c] > net.acc[best])) best = c;
      }
    setOutlet(best >= 0 ? best : j * N + i);
  };

  const o = center(out);
  const order = strahler[out];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100" onPointerDown={pick}>
        {bg.map(c => (
          <rect
            key={`${c.i}/${c.j}`}
            x={M0 + (c.i * MS) / c.n}
            y={M0 + (c.j * MS) / c.n}
            width={MS / c.n + 0.5}
            height={MS / c.n + 0.5}
            fill={c.fill}
            opacity={0.75}
          />
        ))}
        <g transform={`translate(${M0} ${M0}) scale(${MS})`}>
          {lines.map(l => (
            <path
              key={l.level}
              d={l.d}
              fill="none"
              vectorEffect="non-scaling-stroke"
              className="stroke-amber-900/50"
              strokeWidth={l.level % 500 === 0 ? 1.2 : 0.5}
            />
          ))}
        </g>
        <path d={basinFill} className="fill-sky-400/30" />
        {Array.from({ length: N * N }, (_, c) => c)
          .filter(c => net.acc[c] >= threshold && net.down[c] >= 0)
          .map(c => {
            const a = center(c);
            const b = center(net.down[c]);
            return (
              <line
                key={c}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={basin[c] ? 'stroke-blue-700' : 'stroke-blue-500/70'}
                strokeWidth={0.6 + 0.9 * strahler[c]}
                strokeLinecap="round"
              />
            );
          })}
        <path d={divide} fill="none" className="stroke-rose-600" strokeWidth="2" strokeDasharray="5 3" />
        <rect x={M0} y={M0} width={MS} height={MS} fill="none" className="stroke-gray-500" />
        <circle cx={o.x} cy={o.y} r={6} className="fill-white stroke-rose-700" strokeWidth="2.5" />
        {/* Мащабна линийка 2 km */}
        <g transform={`translate(${M0 + 8} ${M0 + MS - 12})`}>
          <rect x={-4} y={-14} width={(2 / SIDE_KM) * MS + 8} height={20} rx={4} className="fill-white/80" />
          <line x1={0} y1={0} x2={(2 / SIDE_KM) * MS} y2={0} className="stroke-gray-800" strokeWidth="3" />
          <text x={(1 / SIDE_KM) * MS} y={-4} fontSize="10" textAnchor="middle" className="fill-gray-800">
            2 km
          </text>
        </g>

        {/* Надлъжният профил на главната река */}
        <text x={PX + PW / 2} y={16} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          Надлъжен профил на главната река
        </text>
        {levels.map(h => (
          <g key={h}>
            <line x1={PX} y1={ppy(h)} x2={PX + PW} y2={ppy(h)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 4} y={ppy(h) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {h}
            </text>
          </g>
        ))}
        <path d={`${profile}L${ppx(lenKm)} ${PY + PH}L${PX} ${PY + PH}Z`} className="fill-amber-100 dark:fill-amber-900/40" />
        <path d={profile} fill="none" className="stroke-blue-700 dark:stroke-blue-400" strokeWidth="2.5" />
        <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} className="stroke-gray-500" />
        <text x={PX} y={PY + PH + 16} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          извор (вододел)
        </text>
        <text x={PX + PW} y={PY + PH + 16} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          устие · {fmt(lenKm, 1)} km
        </text>
        <text x={PX + PW - 4} y={PY + 14} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          горе {fmt(upper)} ‰ · долу {fmt(lower)} ‰
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни по някоя река – точката става устие (затваряща точка). Синьо – басейнът, червен пунктир – вододелът, по-дебелите реки са от по-висок ред по
        Щралер. Плъзгачът задава от каква площ на водосбора нагоре започва постоянна река (km²).
      </p>
      <Sliders>
        <Slider label="A, km²" value={minArea} onChange={setMinArea} min={0.1} max={2} step={0.1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            {
              label: 'водосборна площ',
              value: `${fmt(areaKm2, 1)} km²`,
              tone: 'blue',
            },
            { label: 'дължина', value: `${fmt(lenKm, 1)} km` },
            { label: 'пад', value: `${fmt(fall)} m` },
            {
              label: 'среден наклон',
              value: `${fmt(gradient)} ‰`,
              tone: 'amber',
            },
            {
              label: 'ред по Щралер',
              value: order ? fmt(order) : '–',
              tone: 'violet',
            },
            { label: 'най-висока точка', value: `${fmt(zMax)} m` },
          ]}
        />
      </div>
      <Note tone="blue">
        {upper > 1.5 * lower
          ? `Цялата вода, паднала в синята площ, минава през устието. Горе наклонът е ${fmt(upper)} ‰, а долу – само ${fmt(lower)} ‰: надлъжният профил на реката е вдлъбнат.`
          : 'Цялата вода, паднала в синята площ, минава през устието. Избери устие по-надолу по главната река, за да видиш как наклонът намалява към устието.'}
      </Note>
    </div>
  );
}
