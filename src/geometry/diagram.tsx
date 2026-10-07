import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { add, dist, fmt, H, mid, Point, scale, sub, toDeg, Tone, tones, UNIT, units, W } from './diagramMath';

// ---------- Рамка ----------

/**
 * На тесен екран целият чертеж се смалява и надписите стават нечетливи.
 * Затова увеличаваме текста и точките обратно пропорционално на ширината.
 */
const ZoomContext = createContext(1);
const useZoom = () => useContext(ZoomContext);

/** SVG, който увеличава надписите и точките си, когато е показан на тесен екран. */
export function ZoomingSvg({ viewBox, children }: { viewBox: string; children: React.ReactNode }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setZoom(Math.min(1.6, Math.max(1, 400 / width)));
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-auto max-w-xl mx-auto block rounded-md text-gray-800 dark:text-gray-100 select-none"
    >
      <ZoomContext.Provider value={zoom}>{children}</ZoomContext.Provider>
    </svg>
  );
}

export function Diagram({
  children,
  hint,
  readout,
  grid = true,
}: {
  children: React.ReactNode;
  hint: string;
  readout?: React.ReactNode;
  grid?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        {grid && <Grid />}
        {children}
      </ZoomingSvg>
      {readout && <div className="mt-3">{readout}</div>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">💡 {hint}</p>
    </div>
  );
}

function Grid() {
  const lines = [];
  for (let x = UNIT; x < W; x += UNIT) {
    lines.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} />);
  }
  for (let y = UNIT; y < H; y += UNIT) {
    lines.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} />);
  }
  return (
    <g className="stroke-gray-100 dark:stroke-gray-700/50" strokeWidth="1">
      {lines}
    </g>
  );
}

// ---------- Елементи на чертежа ----------

/** Точка, която може да се влачи с мишка, пръст или стрелките на клавиатурата. */
export function Handle({
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
  const [active, setActive] = useState(false);
  const zoom = useZoom();

  const toSvg = (e: React.PointerEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  };

  const keys: Record<string, Point> = {
    ArrowLeft: { x: -UNIT, y: 0 },
    ArrowRight: { x: UNIT, y: 0 },
    ArrowUp: { x: 0, y: -UNIT },
    ArrowDown: { x: 0, y: UNIT },
  };

  return (
    <g
      tabIndex={0}
      role="slider"
      aria-label={`Точка ${name}`}
      aria-valuetext={`${fmt(units(p.x))}, ${fmt(units(p.y))}`}
      className={`group outline-none touch-none ${active ? 'cursor-grabbing' : 'cursor-grab'}`}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
      }}
      onPointerMove={e => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const q = toSvg(e);
        if (q) onMove(q);
      }}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
      onKeyDown={e => {
        const d = keys[e.key];
        if (!d) return;
        e.preventDefault();
        onMove(add(p, d));
      }}
    >
      <circle cx={p.x} cy={p.y} r={18 * zoom} className="fill-transparent" />
      <circle
        cx={p.x}
        cy={p.y}
        r={(active ? 10 : 8) * zoom}
        className="fill-none stroke-blue-500/0 group-focus-visible:stroke-blue-500/60"
        strokeWidth="6"
      />
      <circle
        cx={p.x}
        cy={p.y}
        r={(active ? 8 : 6.5) * zoom}
        className={`${tones[tone].fill} stroke-white dark:stroke-gray-800 transition-[r]`}
        strokeWidth="2.5"
      />
    </g>
  );
}

/** Неподвижна точка. */
export function Dot({ p, tone = 'gray', r = 4 }: { p: Point; tone?: Tone; r?: number }) {
  return <circle cx={p.x} cy={p.y} r={r} className={tones[tone].fill} />;
}

export function Segment({
  p,
  q,
  tone = 'blue',
  width = 2.5,
  dashed = false,
}: {
  p: Point;
  q: Point;
  tone?: Tone;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <line
      x1={p.x}
      y1={p.y}
      x2={q.x}
      y2={q.y}
      className={tones[tone].stroke}
      strokeWidth={width}
      strokeDasharray={dashed ? '6 5' : undefined}
      strokeLinecap="round"
    />
  );
}

/** Текст с „ореол“ в цвета на фона, за да се чете върху линиите. */
export function Label({
  p,
  children,
  tone = 'gray',
  size = 16,
  anchor = 'middle',
  weight = 600,
}: {
  p: Point;
  children: React.ReactNode;
  tone?: Tone | 'ink';
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
}) {
  const zoom = useZoom();
  return (
    <text
      x={p.x}
      y={p.y}
      fontSize={size * zoom}
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="central"
      paintOrder="stroke"
      strokeWidth={5 * zoom}
      strokeLinejoin="round"
      className={`${tone === 'ink' ? 'fill-current' : tones[tone].label} stroke-white dark:stroke-gray-800`}
    >
      {children}
    </text>
  );
}

/** Етикет на връх, изместен навън от центъра на фигурата. */
export function VertexLabel({ p, center, name }: { p: Point; center: Point; name: string }) {
  const zoom = useZoom();
  const d = sub(p, center);
  const len = Math.hypot(d.x, d.y) || 1;
  return (
    <Label p={add(p, scale(d, (20 * zoom) / len))} tone="ink" size={17} weight={700}>
      {name}
    </Label>
  );
}

/** Етикет на страна – в средата ѝ, изместен навън от фигурата. */
export function SideLabel({
  p,
  q,
  center,
  children,
  tone = 'gray',
  offset = 16,
  width = 0,
}: {
  p: Point;
  q: Point;
  center: Point;
  children: React.ReactNode;
  tone?: Tone;
  offset?: number;
  /** Приблизителна ширина на надписа – колкото по-стръмна е страната, толкова повече го отместваме. */
  width?: number;
}) {
  const zoom = useZoom();
  const m = mid(p, q);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  let n = { x: -dy / len, y: dx / len };
  if ((m.x - center.x) * n.x + (m.y - center.y) * n.y < 0) n = scale(n, -1);
  return (
    <Label p={add(m, scale(n, (offset + (Math.abs(n.x) * width) / 2) * zoom))} tone={tone} size={15}>
      {children}
    </Label>
  );
}

/**
 * Дъга, отбелязваща ъгъла при V между лъчите към P и Q.
 * Правият ъгъл се отбелязва с квадратче.
 */
export function AngleMark({
  v,
  p,
  q,
  tone = 'rose',
  r = 26,
  fill = true,
  label,
  labelDistance,
}: {
  v: Point;
  p: Point;
  q: Point;
  tone?: Tone;
  r?: number;
  fill?: boolean;
  label?: React.ReactNode;
  labelDistance?: number;
}) {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  let a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let diff = a2 - a1;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  a2 = a1 + diff;
  const deg = Math.abs(toDeg(diff));

  // Не позволяваме дъгата да е по-голяма от късата страна
  const rr = Math.min(r, dist(v, p) * 0.45, dist(v, q) * 0.45);
  const at = (a: number, rad: number) => ({ x: v.x + rad * Math.cos(a), y: v.y + rad * Math.sin(a) });
  const bis = a1 + diff / 2;

  let shape: React.ReactNode;
  if (Math.abs(deg - 90) < 0.5) {
    const s = rr * 0.6;
    const u1 = at(a1, s);
    const u2 = at(a2, s);
    const corner = { x: u1.x + u2.x - v.x, y: u1.y + u2.y - v.y };
    shape = (
      <path
        d={`M ${u1.x} ${u1.y} L ${corner.x} ${corner.y} L ${u2.x} ${u2.y}`}
        className={`${tones[tone].stroke} ${fill ? tones[tone].soft : 'fill-none'}`}
        strokeWidth="2"
      />
    );
  } else {
    const s = at(a1, rr);
    const e = at(a2, rr);
    const sweep = diff > 0 ? 1 : 0;
    shape = (
      <path
        d={`M ${v.x} ${v.y} L ${s.x} ${s.y} A ${rr} ${rr} 0 0 ${sweep} ${e.x} ${e.y} Z`}
        className={`${fill ? tones[tone].soft : 'fill-none'} stroke-none`}
      />
    );
    shape = (
      <>
        {shape}
        <path
          d={`M ${s.x} ${s.y} A ${rr} ${rr} 0 0 ${sweep} ${e.x} ${e.y}`}
          className={`fill-none ${tones[tone].stroke}`}
          strokeWidth="2"
        />
      </>
    );
  }

  return (
    <g>
      {shape}
      {label !== undefined && (
        <Label p={at(bis, labelDistance ?? rr + 16)} tone={tone} size={14}>
          {label}
        </Label>
      )}
    </g>
  );
}

/** Малки чертички, които показват, че отсечките са равни. */
export function TickMark({ p, q, count = 1, tone = 'gray' }: { p: Point; q: Point; count?: number; tone?: Tone }) {
  const m = mid(p, q);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const u = { x: dx / len, y: dy / len };
  const n = { x: -u.y, y: u.x };
  return (
    <g className={tones[tone].stroke} strokeWidth="2" strokeLinecap="round">
      {Array.from({ length: count }, (_, i) => {
        const c = add(m, scale(u, (i - (count - 1) / 2) * 5));
        return <line key={i} x1={c.x - n.x * 6} y1={c.y - n.y * 6} x2={c.x + n.x * 6} y2={c.y + n.y * 6} />;
      })}
    </g>
  );
}

// ---------- Отчитане под чертежа ----------

export function Readout({ items }: { items: { label: React.ReactNode; value: React.ReactNode; tone?: Tone }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-baseline gap-1.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 px-2.5 py-1 font-mono text-sm"
        >
          <span className={item.tone ? tones[item.tone].text : 'text-gray-500 dark:text-gray-400'}>{item.label}</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

/** Формула с поставени стойности, напр. S = a · h = 6 · 4 = 24. */
export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
      {children}
    </p>
  );
}

export function Note({ children, tone = 'emerald' }: { children: React.ReactNode; tone?: Tone }) {
  return <p className={`mt-2 text-center text-sm font-medium ${tones[tone].text}`}>{children}</p>;
}

export function Buttons({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-2 mt-3">{children}</div>;
}

export function DiagramButton({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
