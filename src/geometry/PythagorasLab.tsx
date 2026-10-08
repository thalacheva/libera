import { useState } from 'react';
import { angleAt, add, dist, fmt, Point, polygonArea, scale, snap, sub, tones, Tone, UNIT, units } from './diagramMath';
import { Buttons, Diagram, DiagramButton, Formula, Handle, Label, Note, Readout, VertexLabel } from './diagram';

/** Квадрат върху страната PQ, построен навън от триъгълника. */
function squareOn(P: Point, Q: Point, center: Point) {
  const d = sub(Q, P);
  let n = { x: -d.y, y: d.x };
  const m = scale(add(P, Q), 0.5);
  if ((m.x - center.x) * n.x + (m.y - center.y) * n.y < 0) n = scale(n, -1);
  return [P, Q, add(Q, n), add(P, n)];
}

export function PythagorasLab() {
  const [A, setA] = useState<Point>({ x: 180, y: 180 });
  const [B, setB] = useState<Point>({ x: 300, y: 180 });
  const [C, setC] = useState<Point>({ x: 220, y: 120 });

  const tryMove = (set: (p: Point) => void, others: Point[], p: Point) => {
    const q = snap(p);
    if (polygonArea([q, ...others]) < UNIT * UNIT) return;
    set(q);
  };

  const center = scale(add(add(A, B), C), 1 / 3);
  const a = units(dist(B, C));
  const b = units(dist(C, A));
  const c = units(dist(A, B));
  const gamma = angleAt(C, A, B);
  const a2 = a * a;
  const b2 = b * b;
  const c2 = c * c;
  const diff = c2 - (a2 + b2);
  const right = Math.abs(diff) < 0.05;

  const sq = (P: Point, Q: Point, tone: Tone, label: string, value: number) => {
    const pts = squareOn(P, Q, center);
    const mc = scale(pts.reduce((s, p) => add(s, p), { x: 0, y: 0 }), 1 / 4);
    return (
      <g>
        <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')} className={`${tones[tone].soft} ${tones[tone].stroke}`} strokeWidth="1.5" />
        <Label p={mc} tone={tone} size={14}>
          {label} = {fmt(value)}
        </Label>
      </g>
    );
  };

  return (
    <Diagram
      grid
      hint="Влачи върховете. Върху всяка страна е построен квадрат. Сравни лицето на квадрата върху c с общото лице на другите два."
      readout={
        <>
          <Readout
            items={[
              { label: 'a² =', value: fmt(a2), tone: 'rose' },
              { label: 'b² =', value: fmt(b2), tone: 'emerald' },
              { label: 'c² =', value: fmt(c2), tone: 'violet' },
              { label: 'γ =', value: `${fmt(gamma, 0)}°`, tone: 'amber' },
            ]}
          />
          <Formula>
            a² + b² = {fmt(a2 + b2)} {right ? '=' : diff < 0 ? '>' : '<'} c² = {fmt(c2)}
          </Formula>
          <Note tone={right ? 'emerald' : diff < 0 ? 'blue' : 'rose'}>
            {right ? '✓ c² = a² + b² – триъгълникът е правоъгълен (γ = 90°). Питагорова теорема!' : diff < 0 ? 'c² < a² + b² – ъгълът γ е остър.' : 'c² > a² + b² – ъгълът γ е тъп.'}
          </Note>
          <Buttons>
            <DiagramButton
              onClick={() => {
                setA({ x: 180, y: 190 });
                setB({ x: 280, y: 190 });
                setC({ x: 216, y: 142 });
              }}
            >
              3 – 4 – 5
            </DiagramButton>
            <DiagramButton
              onClick={() => {
                setA({ x: 180, y: 190 });
                setB({ x: 300, y: 190 });
                setC({ x: 240, y: 130 });
              }}
            >
              прав ъгъл (Талес)
            </DiagramButton>
          </Buttons>
        </>
      }
    >
      {sq(B, C, 'rose', 'a²', a2)}
      {sq(C, A, 'emerald', 'b²', b2)}
      {sq(A, B, 'violet', 'c²', c2)}
      <polygon points={[A, B, C].map(v => `${v.x},${v.y}`).join(' ')} className={`fill-white dark:fill-gray-800 ${tones.blue.stroke}`} strokeWidth="2.5" />
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={C} center={center} name="C" />
      <Handle p={A} name="A" onMove={p => tryMove(setA, [B, C], p)} />
      <Handle p={B} name="B" onMove={p => tryMove(setB, [A, C], p)} />
      <Handle p={C} name="C" onMove={p => tryMove(setC, [A, B], p)} />
    </Diagram>
  );
}
