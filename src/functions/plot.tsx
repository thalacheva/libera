import { createContext, useContext, useId } from 'react';
import { Handle, Label, ZoomingSvg } from '~/geometry/diagram';
import { Point, Tone, tones } from '~/geometry/diagramMath';
import { num } from './functionMath';

// Координатна система за графики на функции.
// Работим в „математически“ координати (x надясно, y нагоре);
// Plot ги превръща в координати на viewBox.

type Range = [number, number];

type Frame = {
  x: Range;
  y: Range;
  /** Математическа точка → точка от viewBox. */
  toSvg: (p: Point) => Point;
  /** Точка от viewBox → математическа точка. */
  toMath: (p: Point) => Point;
};

const FrameContext = createContext<Frame | null>(null);

function useFrame() {
  const frame = useContext(FrameContext);
  if (!frame) throw new Error('Елементите на графиката трябва да са вътре в <Plot>.');
  return frame;
}

const WIDTH = 480;

/** Стъпка на надписите по осите – така, че да не се застъпват. */
function labelStep(span: number) {
  if (span <= 12) return 1;
  if (span <= 24) return 2;
  if (span <= 50) return 5;
  return 10;
}

export function Plot({
  x = [-8, 8],
  y = [-6, 6],
  children,
  hint,
  readout,
  compact = false,
}: {
  x?: Range;
  y?: Range;
  children: React.ReactNode;
  hint?: string;
  readout?: React.ReactNode;
  /** Малка графика без рамка – за галерии и карти. */
  compact?: boolean;
}) {
  const clipId = useId();
  const ppu = WIDTH / (x[1] - x[0]);
  const height = (y[1] - y[0]) * ppu;

  const frame: Frame = {
    x,
    y,
    toSvg: p => ({ x: (p.x - x[0]) * ppu, y: (y[1] - p.y) * ppu }),
    toMath: p => ({ x: x[0] + p.x / ppu, y: y[1] - p.y / ppu }),
  };

  const svg = (
    <ZoomingSvg viewBox={`0 0 ${WIDTH} ${height}`}>
      <FrameContext.Provider value={frame}>
        <defs>
          <clipPath id={clipId}>
            <rect width={WIDTH} height={height} />
          </clipPath>
        </defs>
        <Axes compact={compact} />
        <g clipPath={`url(#${clipId})`}>{children}</g>
      </FrameContext.Provider>
    </ZoomingSvg>
  );

  if (compact) return svg;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
      {svg}
      {readout && <div className="mt-3">{readout}</div>}
      {hint && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">💡 {hint}</p>}
    </div>
  );
}

function Axes({ compact }: { compact: boolean }) {
  const { x, y, toSvg } = useFrame();
  const o = toSvg({ x: 0, y: 0 });
  const topLeft = toSvg({ x: x[0], y: y[1] });
  const bottomRight = toSvg({ x: x[1], y: y[0] });

  const step = labelStep(x[1] - x[0]);
  // При едър мащаб мрежата следва надписите, иначе става твърде гъста
  const gridStep = step >= 5 ? step : 1;
  const integers = (r: Range, every = 1) => {
    const values = [];
    for (let v = Math.ceil(r[0] / every) * every; v <= r[1]; v += every) values.push(v);
    return values;
  };
  // Без надписи в самите краища – там ги застъпват стрелките или се изрязват
  const labelled = (r: Range) => (v: number) => v !== 0 && v % step === 0 && v > r[0] + 0.5 && v < r[1] - 0.5;

  // Надписите стоят до осите, но не излизат извън графиката
  const xLabelY = Math.min(Math.max(o.y + 13, 10), bottomRight.y - 10);
  const yLabelX = Math.min(Math.max(o.x - 8, 18), bottomRight.x - 4);

  return (
    <g>
      <g className="stroke-gray-100 dark:stroke-gray-700/50" strokeWidth="1">
        {integers(x, gridStep).map(v => (
          <line key={`gx${v}`} x1={toSvg({ x: v, y: 0 }).x} y1={topLeft.y} x2={toSvg({ x: v, y: 0 }).x} y2={bottomRight.y} />
        ))}
        {integers(y, gridStep).map(v => (
          <line key={`gy${v}`} x1={topLeft.x} y1={toSvg({ x: 0, y: v }).y} x2={bottomRight.x} y2={toSvg({ x: 0, y: v }).y} />
        ))}
      </g>

      <g className="stroke-gray-400 dark:stroke-gray-500 fill-gray-400 dark:fill-gray-500" strokeWidth="1.5">
        <line x1={topLeft.x} y1={o.y} x2={bottomRight.x - 2} y2={o.y} />
        <line x1={o.x} y1={bottomRight.y} x2={o.x} y2={topLeft.y + 2} />
        <path d={`M ${bottomRight.x} ${o.y} l -9 -4.5 v 9 z`} stroke="none" />
        <path d={`M ${o.x} ${topLeft.y} l -4.5 9 h 9 z`} stroke="none" />
      </g>

      {!compact && (
        <>
          {integers(x).filter(labelled(x)).map(v => (
            <Label key={`lx${v}`} p={{ x: toSvg({ x: v, y: 0 }).x, y: xLabelY }} size={11} weight={500}>
              {num(v)}
            </Label>
          ))}
          {integers(y).filter(labelled(y)).map(v => (
            <Label key={`ly${v}`} p={{ x: yLabelX, y: toSvg({ x: 0, y: v }).y }} size={11} weight={500} anchor="end">
              {num(v)}
            </Label>
          ))}
          <Label p={{ x: o.x - 8, y: o.y + 13 }} size={11} weight={500} anchor="end">
            0
          </Label>
        </>
      )}
      <Label p={{ x: bottomRight.x - 8, y: o.y - 14 }} tone="ink" size={14} weight={700}>
        x
      </Label>
      <Label p={{ x: o.x + 13, y: topLeft.y + 9 }} tone="ink" size={14} weight={700}>
        y
      </Label>
    </g>
  );
}

/**
 * Графика на функция. Там, където функцията не е дефинирана или „изхвърча“
 * (например 1/x около нулата), линията се прекъсва.
 */
export function Curve({
  f,
  tone = 'blue',
  color,
  width = 3,
  dashed = false,
  from,
  to,
}: {
  f: (x: number) => number;
  tone?: Tone;
  /** Произволен цвят вместо тон – за свободния чертож с много функции. */
  color?: string;
  width?: number;
  dashed?: boolean;
  from?: number;
  to?: number;
}) {
  const { x, y, toSvg } = useFrame();
  const start = from ?? x[0];
  const end = to ?? x[1];
  const span = y[1] - y[0];
  const steps = 600;

  let d = '';
  let penDown = false;
  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    const v = f(t);
    if (!Number.isFinite(v) || v < y[0] - span || v > y[1] + span) {
      penDown = false;
      continue;
    }
    const p = toSvg({ x: t, y: v });
    d += `${penDown ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    penDown = true;
  }

  return (
    <path
      d={d}
      fill="none"
      className={color ? undefined : tones[tone].stroke}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? '7 6' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function PlotLine({ p, q, tone = 'gray', width = 2, dashed = false }: { p: Point; q: Point; tone?: Tone; width?: number; dashed?: boolean }) {
  const { toSvg } = useFrame();
  const a = toSvg(p);
  const b = toSvg(q);
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      className={tones[tone].stroke}
      strokeWidth={width}
      strokeDasharray={dashed ? '6 5' : undefined}
      strokeLinecap="round"
    />
  );
}

/** Запълнен многоъгълник по върхове в математически координати. */
export function PlotPolygon({ points, tone = 'blue' }: { points: Point[]; tone?: Tone }) {
  const { toSvg } = useFrame();
  const d = points.map(p => toSvg(p)).map(q => `${q.x},${q.y}`).join(' ');
  return <polygon points={d} className={`${tones[tone].soft} ${tones[tone].stroke}`} strokeWidth="1.5" />;
}

/** Начупена линия (напр. параметрична крива) по точки в математически координати. */
export function PlotPolyline({ points, tone = 'blue', width = 3 }: { points: Point[]; tone?: Tone; width?: number }) {
  const { toSvg } = useFrame();
  const d = points.map(p => toSvg(p)).map(q => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' ');
  return <polyline points={d} fill="none" className={tones[tone].stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

/** Вертикална права x = c през цялата графика (напр. ос на симетрия). */
export function VLine({ x: c, tone = 'gray', dashed = true }: { x: number; tone?: Tone; dashed?: boolean }) {
  const { y } = useFrame();
  return <PlotLine p={{ x: c, y: y[0] }} q={{ x: c, y: y[1] }} tone={tone} dashed={dashed} width={1.5} />;
}

export function PlotDot({ p, tone = 'gray', r = 5 }: { p: Point; tone?: Tone; r?: number }) {
  const { toSvg } = useFrame();
  const q = toSvg(p);
  return <circle cx={q.x} cy={q.y} r={r} className={`${tones[tone].fill} stroke-white dark:stroke-gray-800`} strokeWidth="2" />;
}

export function PlotLabel({
  p,
  children,
  tone = 'gray',
  dx = 0,
  dy = 0,
  anchor = 'middle',
  size = 14,
}: {
  p: Point;
  children: React.ReactNode;
  tone?: Tone | 'ink';
  /** Отместване в пиксели (надясно и надолу). */
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}) {
  const { toSvg } = useFrame();
  const q = toSvg(p);
  return (
    <Label p={{ x: q.x + dx, y: q.y + dy }} tone={tone} size={size} anchor={anchor}>
      {children}
    </Label>
  );
}

/** Точка, която се влачи по целочислените възли на мрежата. */
export function PlotHandle({
  p,
  onMove,
  name,
  tone = 'blue',
}: {
  p: Point;
  onMove: (p: Point) => void;
  name: string;
  tone?: Tone;
}) {
  const { x, y, toSvg, toMath } = useFrame();
  const clamp = (v: number, r: Range) => Math.min(r[1] - 1, Math.max(r[0] + 1, Math.round(v)));
  return (
    <Handle
      p={toSvg(p)}
      name={name}
      tone={tone}
      onMove={q => {
        const m = toMath(q);
        const next = { x: clamp(m.x, x), y: clamp(m.y, y) };
        if (next.x !== p.x || next.y !== p.y) onMove(next);
      }}
    />
  );
}

// ---------- Контроли под графиката ----------

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.5,
  tone = 'blue',
}: {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  tone?: Tone;
}) {
  const accent: Record<Tone, string> = {
    blue: 'accent-blue-500',
    rose: 'accent-rose-500',
    emerald: 'accent-emerald-500',
    violet: 'accent-violet-500',
    amber: 'accent-amber-500',
    gray: 'accent-gray-500',
  };
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className={`w-16 flex-shrink-0 font-mono ${tones[tone].text}`}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`flex-1 min-w-0 ${accent[tone]} cursor-pointer`}
      />
      <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{num(value)}</span>
    </label>
  );
}

export function Sliders({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md mx-auto space-y-2 mt-3">{children}</div>;
}
