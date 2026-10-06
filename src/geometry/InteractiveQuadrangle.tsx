import { useState } from 'react';
import {
  AngleMark,
  Diagram,
  Dot,
  Formula,
  Handle,
  Label,
  Note,
  Readout,
  Segment,
  SideLabel,
  TickMark,
  VertexLabel,
} from './diagram';
import {
  dist,
  fmt,
  H,
  mid,
  Point,
  snap,
  tones,
  units,
  UNIT,
  W,
} from './diagramMath';

interface InteractiveQuadrangleProps {
  type: 'rectangle' | 'square' | 'parallelogram' | 'rhombus' | 'trapezoid';
}

// Върховете винаги са A (долу вляво), B, C, D – обратно на часовниковата стрелка.
const NAMES = ['A', 'B', 'C', 'D'];
const MIN = 2 * UNIT;

const inside = (p: Point) => p.x >= UNIT && p.x <= W - UNIT && p.y >= UNIT && p.y <= H - UNIT;

function Shape({
  vertices,
  handles,
  children,
}: {
  vertices: Point[];
  handles: ((p: Point) => void)[];
  children?: React.ReactNode;
}) {
  const center = centerOf(vertices);
  return (
    <>
      <polygon
        points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
        className={`${tones.blue.soft} ${tones.blue.stroke}`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {children}
      {vertices.map((v, i) => (
        <g key={NAMES[i]}>
          <VertexLabel p={v} center={center} name={NAMES[i]} />
          <Handle p={v} name={NAMES[i]} onMove={handles[i]} />
        </g>
      ))}
    </>
  );
}

const centerOf = (vs: Point[]) => ({
  x: vs.reduce((s, v) => s + v.x, 0) / vs.length,
  y: vs.reduce((s, v) => s + v.y, 0) / vs.length,
});

// ---------- Правоъгълник ----------

function Rectangle() {
  const [r, setR] = useState({ left: 120, right: 360, top: 100, bottom: 240 });

  const update = (next: typeof r) => {
    if (next.right - next.left < MIN || next.bottom - next.top < MIN) return;
    setR(next);
  };

  const A = { x: r.left, y: r.bottom };
  const B = { x: r.right, y: r.bottom };
  const C = { x: r.right, y: r.top };
  const D = { x: r.left, y: r.top };
  const vs = [A, B, C, D];
  const a = units(r.right - r.left);
  const b = units(r.bottom - r.top);
  const d = Math.hypot(a, b);

  return (
    <Diagram
      hint="Влачи който и да е връх – ъглите остават прави, а диагоналите винаги са равни."
      readout={
        <>
          <Readout
            items={[
              { label: 'a =', value: fmt(a) },
              { label: 'b =', value: fmt(b) },
              { label: 'AC = BD =', value: fmt(d, 2), tone: 'violet' },
            ]}
          />
          <Formula>S = a · b = {fmt(a)} · {fmt(b)} = {fmt(a * b)}</Formula>
          <Formula>P = 2(a + b) = 2({fmt(a)} + {fmt(b)}) = {fmt(2 * (a + b))}</Formula>
          {a === b && <Note>a = b – това е квадрат!</Note>}
        </>
      }
    >
      <Shape
        vertices={vs}
        handles={[
          p => { const q = snap(p); update({ ...r, left: q.x, bottom: q.y }); },
          p => { const q = snap(p); update({ ...r, right: q.x, bottom: q.y }); },
          p => { const q = snap(p); update({ ...r, right: q.x, top: q.y }); },
          p => { const q = snap(p); update({ ...r, left: q.x, top: q.y }); },
        ]}
      >
        <Segment p={A} q={C} tone="violet" dashed width={2} />
        <Segment p={B} q={D} tone="violet" dashed width={2} />
        <AngleMark v={A} p={B} q={D} tone="gray" fill={false} r={20} />
        <SideLabel p={A} q={B} center={centerOf(vs)}>a</SideLabel>
        <SideLabel p={B} q={C} center={centerOf(vs)}>b</SideLabel>
      </Shape>
    </Diagram>
  );
}

// ---------- Квадрат ----------

function Square() {
  const [s, setS] = useState({ left: 160, bottom: 260, size: 160 });

  const A = { x: s.left, y: s.bottom };
  const B = { x: s.left + s.size, y: s.bottom };
  const C = { x: s.left + s.size, y: s.bottom - s.size };
  const D = { x: s.left, y: s.bottom - s.size };
  const vs = [A, B, C, D];

  // Влаченият връх се движи, а срещуположният остава на място
  const drag = (i: number) => (p: Point) => {
    const opposite = vs[(i + 2) % 4];
    const q = snap(p);
    const size = Math.max(Math.abs(q.x - opposite.x), Math.abs(q.y - opposite.y));
    if (size < MIN) return;
    const left = i === 0 || i === 3 ? opposite.x - size : opposite.x;
    const bottom = i === 0 || i === 1 ? opposite.y + size : opposite.y;
    const next = { left, bottom, size };
    if (!inside({ x: left, y: bottom }) || !inside({ x: left + size, y: bottom - size })) return;
    setS(next);
  };

  const a = units(s.size);

  return (
    <Diagram
      hint="Влачи връх, за да промениш размера. Диагоналите са равни, перпендикулярни и се разполовяват."
      readout={
        <>
          <Readout
            items={[
              { label: 'a =', value: fmt(a) },
              { label: 'd = a√2 ≈', value: fmt(a * Math.SQRT2, 2), tone: 'violet' },
            ]}
          />
          <Formula>S = a² = {fmt(a)}² = {fmt(a * a)}</Formula>
          <Formula>P = 4a = 4 · {fmt(a)} = {fmt(4 * a)}</Formula>
        </>
      }
    >
      <Shape vertices={vs} handles={[0, 1, 2, 3].map(drag)}>
        <Segment p={A} q={C} tone="violet" dashed width={2} />
        <Segment p={B} q={D} tone="violet" dashed width={2} />
        <AngleMark v={mid(A, C)} p={C} q={D} tone="violet" r={18} />
        {[[A, B], [B, C], [C, D], [D, A]].map(([p, q], i) => (
          <TickMark key={i} p={p} q={q} />
        ))}
        <SideLabel p={A} q={B} center={centerOf(vs)}>a</SideLabel>
      </Shape>
    </Diagram>
  );
}

// ---------- Успоредник ----------

function Parallelogram() {
  const [g, setG] = useState({ A: { x: 100, y: 240 }, base: 220, D: { x: 160, y: 100 } });

  const update = (next: typeof g) => {
    const B = { x: next.A.x + next.base, y: next.A.y };
    const C = { x: next.D.x + next.base, y: next.D.y };
    if (next.base < MIN || next.A.y - next.D.y < MIN) return;
    if (![next.A, B, C, next.D].every(inside)) return;
    setG(next);
  };

  const { A, D, base } = g;
  const B = { x: A.x + base, y: A.y };
  const C = { x: D.x + base, y: D.y };
  const vs = [A, B, C, D];
  const O = mid(A, C);
  const foot = { x: D.x, y: A.y };

  const a = units(base);
  const b = units(dist(A, D));
  const h = units(A.y - D.y);
  const isRectangle = D.x === A.x;

  return (
    <Diagram
      hint="Влачи върховете. Срещуположните страни остават успоредни, а диагоналите винаги се разполовяват."
      readout={
        <>
          <Readout
            items={[
              { label: 'a =', value: fmt(a) },
              { label: 'b =', value: fmt(b) },
              { label: 'h =', value: fmt(h), tone: 'rose' },
            ]}
          />
          <Formula>S = a · h = {fmt(a)} · {fmt(h)} = {fmt(a * h)}</Formula>
          <Formula>P = 2(a + b) = 2({fmt(a)} + {fmt(b)}) = {fmt(2 * (a + b))}</Formula>
          {isRectangle && <Note>Прав ъгъл – това е правоъгълник!</Note>}
        </>
      }
    >
      <Shape
        vertices={vs}
        handles={[
          p => { const q = snap(p); update({ ...g, A: q, D: { x: D.x + q.x - A.x, y: D.y + q.y - A.y } }); },
          p => { const q = snap(p); update({ ...g, base: q.x - A.x }); },
          p => { const q = snap(p); update({ ...g, D: { x: q.x - base, y: q.y } }); },
          p => update({ ...g, D: snap(p) }),
        ]}
      >
        {/* Продължение на основата, ако петата на височината е извън нея */}
        {(foot.x < A.x || foot.x > B.x) && (
          <Segment p={foot.x < A.x ? foot : B} q={foot.x < A.x ? A : foot} tone="gray" dashed width={1.5} />
        )}
        <Segment p={A} q={C} tone="gray" dashed width={1.5} />
        <Segment p={B} q={D} tone="gray" dashed width={1.5} />
        <TickMark p={A} q={O} />
        <TickMark p={O} q={C} />
        <TickMark p={B} q={O} count={2} />
        <TickMark p={O} q={D} count={2} />
        <Dot p={O} />
        {!isRectangle && (
          <>
            <Segment p={D} q={foot} tone="rose" dashed width={2} />
            <AngleMark v={foot} p={D} q={{ x: foot.x + (foot.x < B.x ? 1 : -1) * UNIT, y: foot.y }} tone="rose" r={18} />
            <Label p={{ x: D.x + (D.x <= A.x ? -14 : 14), y: (D.y + foot.y) / 2 }} tone="rose" size={15}>h</Label>
          </>
        )}
        <SideLabel p={A} q={B} center={centerOf(vs)}>a</SideLabel>
        <SideLabel p={D} q={A} center={centerOf(vs)}>b</SideLabel>
      </Shape>
    </Diagram>
  );
}

// ---------- Ромб ----------

function Rhombus() {
  const O = { x: 240, y: 160 };
  const [d, setD] = useState({ p: 100, q: 120 });

  const update = (p: number, q: number) => {
    if (p < UNIT || q < UNIT || p > 9 * UNIT || q > 7 * UNIT) return;
    setD({ p, q });
  };

  const A = { x: O.x - d.p, y: O.y };
  const B = { x: O.x, y: O.y + d.q };
  const C = { x: O.x + d.p, y: O.y };
  const D = { x: O.x, y: O.y - d.q };
  const vs = [A, B, C, D];

  const d1 = units(2 * d.p);
  const d2 = units(2 * d.q);
  const a = Math.hypot(d1 / 2, d2 / 2);

  return (
    <Diagram
      hint="Влачи върховете, за да промениш диагоналите. Те винаги са перпендикулярни и се разполовяват."
      readout={
        <>
          <Readout
            items={[
              { label: 'd₁ = AC =', value: fmt(d1), tone: 'violet' },
              { label: 'd₂ = BD =', value: fmt(d2), tone: 'emerald' },
              { label: 'a ≈', value: fmt(a, 2) },
            ]}
          />
          <Formula>S = d₁ · d₂ / 2 = {fmt(d1)} · {fmt(d2)} / 2 = {fmt((d1 * d2) / 2)}</Formula>
          <Formula>a = √((d₁/2)² + (d₂/2)²) ≈ {fmt(a, 2)}</Formula>
          {d1 === d2 && <Note>Равни диагонали – това е квадрат!</Note>}
        </>
      }
    >
      <Shape
        vertices={vs}
        handles={[
          p => update(O.x - snap(p).x, d.q),
          p => update(d.p, snap(p).y - O.y),
          p => update(snap(p).x - O.x, d.q),
          p => update(d.p, O.y - snap(p).y),
        ]}
      >
        <Segment p={A} q={C} tone="violet" dashed width={2} />
        <Segment p={B} q={D} tone="emerald" dashed width={2} />
        <AngleMark v={O} p={C} q={D} tone="gray" r={16} />
        <Dot p={O} />
        {[[A, B], [B, C], [C, D], [D, A]].map(([p, q], i) => (
          <TickMark key={i} p={p} q={q} />
        ))}
        <Label p={{ x: O.x + d.p / 2, y: O.y + 14 }} tone="violet" size={14}>d₁/2</Label>
        <Label p={{ x: O.x - 22, y: O.y - d.q / 2 }} tone="emerald" size={14}>d₂/2</Label>
      </Shape>
    </Diagram>
  );
}

// ---------- Трапец ----------

function Trapezoid() {
  const [t, setT] = useState({ bottom: 260, top: 100, xA: 80, xB: 400, xD: 160, xC: 300 });

  const update = (next: typeof t) => {
    if (next.xB - next.xA < MIN || next.xC - next.xD < UNIT || next.bottom - next.top < MIN) return;
    setT(next);
  };

  const A = { x: t.xA, y: t.bottom };
  const B = { x: t.xB, y: t.bottom };
  const C = { x: t.xC, y: t.top };
  const D = { x: t.xD, y: t.top };
  const vs = [A, B, C, D];
  const M1 = mid(A, D);
  const M2 = mid(B, C);
  const foot = { x: D.x, y: A.y };

  const a = units(t.xB - t.xA);
  const c = units(t.xC - t.xD);
  const h = units(t.bottom - t.top);
  const m = (a + c) / 2;
  const isosceles = Math.abs(dist(A, D) - dist(B, C)) < 0.01;

  return (
    <Diagram
      hint="Влачи върховете. Основите AB и CD остават успоредни. Средната основа m свързва средите на бедрата."
      readout={
        <>
          <Readout
            items={[
              { label: 'a =', value: fmt(a) },
              { label: 'c =', value: fmt(c) },
              { label: 'h =', value: fmt(h), tone: 'rose' },
              { label: 'm =', value: fmt(m), tone: 'amber' },
            ]}
          />
          <Formula>m = (a + c) / 2 = ({fmt(a)} + {fmt(c)}) / 2 = {fmt(m)}</Formula>
          <Formula>S = m · h = {fmt(m)} · {fmt(h)} = {fmt(m * h)}</Formula>
          {a === c ? (
            <Note tone="amber">Основите са равни – това вече е успоредник, а не трапец!</Note>
          ) : (
            isosceles && <Note>Бедрата са равни – това е равнобедрен трапец.</Note>
          )}
        </>
      }
    >
      <Shape
        vertices={vs}
        handles={[
          p => { const q = snap(p); update({ ...t, xA: q.x, bottom: q.y }); },
          p => { const q = snap(p); update({ ...t, xB: q.x, bottom: q.y }); },
          p => { const q = snap(p); update({ ...t, xC: q.x, top: q.y }); },
          p => { const q = snap(p); update({ ...t, xD: q.x, top: q.y }); },
        ]}
      >
        {(foot.x < A.x || foot.x > B.x) && (
          <Segment p={foot.x < A.x ? foot : B} q={foot.x < A.x ? A : foot} tone="gray" dashed width={1.5} />
        )}
        <Segment p={M1} q={M2} tone="amber" dashed width={2.5} />
        <Label p={{ x: (M1.x + M2.x) / 2, y: M1.y - 12 }} tone="amber" size={15}>m</Label>
        <Segment p={D} q={foot} tone="rose" dashed width={2} />
        <AngleMark v={foot} p={D} q={{ x: foot.x + (foot.x < B.x ? 1 : -1) * UNIT, y: foot.y }} tone="rose" r={18} />
        <Label p={{ x: D.x + (D.x <= A.x ? -14 : 14), y: (D.y + foot.y) / 2 + 20 }} tone="rose" size={15}>h</Label>
        <SideLabel p={A} q={B} center={centerOf(vs)}>a</SideLabel>
        <SideLabel p={B} q={C} center={centerOf(vs)}>b</SideLabel>
        <SideLabel p={C} q={D} center={centerOf(vs)}>c</SideLabel>
        <SideLabel p={D} q={A} center={centerOf(vs)}>d</SideLabel>
      </Shape>
    </Diagram>
  );
}

export function InteractiveQuadrangle({ type }: InteractiveQuadrangleProps) {
  switch (type) {
    case 'rectangle':
      return <Rectangle />;
    case 'square':
      return <Square />;
    case 'parallelogram':
      return <Parallelogram />;
    case 'rhombus':
      return <Rhombus />;
    case 'trapezoid':
      return <Trapezoid />;
  }
}
