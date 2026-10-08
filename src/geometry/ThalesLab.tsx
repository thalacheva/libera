import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Diagram, Formula, Handle, Note, Readout, Segment, VertexLabel } from './diagram';
import { add, dist, fmt, Point, scale, snap, sub, tones, units } from './diagramMath';

const along = (p: Point, q: Point, t: number) => add(p, scale(sub(q, p), t));

/** Теорема на Талес: успоредна на страна права отсича пропорционални отсечки. */
export function ThalesLab() {
  const [A, setA] = useState<Point>({ x: 200, y: 40 });
  const [B, setB] = useState<Point>({ x: 60, y: 280 });
  const [C, setC] = useState<Point>({ x: 420, y: 280 });
  const [t, setT] = useState(0.4);

  const M = along(A, B, t);
  const N = along(A, C, t);
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const u = (p: Point, q: Point) => units(dist(p, q));
  const [AM, MB, AN, NC, MN, BC] = [u(A, M), u(M, B), u(A, N), u(N, C), u(M, N), u(B, C)];

  return (
    <Diagram
      hint="Влачи върховете и местѝ правата MN. Докато MN ∥ BC, трите отношения AM/AB, AN/AC и MN/BC остават равни – а триъгълникът AMN е умалено копие на ABC."
      readout={
        <>
          <Sliders>
            <Slider label="AM/AB" value={t} onChange={setT} min={0.1} max={0.9} step={0.05} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'AM =', value: fmt(AM), tone: 'rose' },
                { label: 'MB =', value: fmt(MB) },
                { label: 'AN =', value: fmt(AN), tone: 'rose' },
                { label: 'NC =', value: fmt(NC) },
                { label: 'MN =', value: fmt(MN), tone: 'emerald' },
                { label: 'BC =', value: fmt(BC), tone: 'blue' },
              ]}
            />
          </div>
          <Formula>
            AM/AB = {fmt(AM / (AM + MB), 2)} &nbsp; AN/AC = {fmt(AN / (AN + NC), 2)} &nbsp; MN/BC = {fmt(MN / BC, 2)}
          </Formula>
          <Formula>
            AM/MB = {fmt(AM / MB, 2)} = AN/NC = {fmt(AN / NC, 2)}
          </Formula>
          <Note>Внимание: MN/BC е равно на AM/AB, а не на AM/MB!</Note>
        </>
      }
    >
      <polygon points={[A, B, C].map(p => `${p.x},${p.y}`).join(' ')} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      <polygon points={[A, M, N].map(p => `${p.x},${p.y}`).join(' ')} className={tones.rose.soft} />
      <Segment p={M} q={N} tone="emerald" width={3} />
      <Segment p={B} q={C} tone="blue" width={3} />
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={C} center={center} name="C" />
      <VertexLabel p={M} center={N} name="M" />
      <VertexLabel p={N} center={M} name="N" />
      <Handle p={A} onMove={p => setA(snap(p))} name="A" />
      <Handle p={B} onMove={p => setB(snap(p))} name="B" />
      <Handle p={C} onMove={p => setC(snap(p))} name="C" />
    </Diagram>
  );
}
