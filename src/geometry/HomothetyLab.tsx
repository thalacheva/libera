import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Diagram, Formula, Handle, Label, Note, Readout, Segment, VertexLabel } from './diagram';
import { add, dist, fmt, Point, polygonArea, scale, snap, sub, tones, UNIT, units } from './diagramMath';

const sq = (v: number) => v * v;

/** Хомотетия: подобен триъгълник с коефициент k; периметрите се отнасят като k, лицата – като k². */
export function HomothetyLab() {
  const [O, setO] = useState<Point>({ x: 40, y: 160 });
  const [A, setA] = useState<Point>({ x: 120, y: 120 });
  const [B, setB] = useState<Point>({ x: 100, y: 200 });
  const [C, setC] = useState<Point>({ x: 160, y: 180 });
  const [k, setK] = useState(2);

  const img = (p: Point) => add(O, scale(sub(p, O), k));
  const [A1, B1, C1] = [img(A), img(B), img(C)];
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const center1 = img(center);

  const sides = (p: Point, q: Point, r: Point) => [units(dist(q, r)), units(dist(r, p)), units(dist(p, q))];
  const [a, b, c] = sides(A, B, C);
  const P = a + b + c;
  const S = polygonArea([A, B, C]) / sq(UNIT);
  const P1 = Math.abs(k) * P;
  const S1 = polygonArea([A1, B1, C1]) / sq(UNIT);
  const poly = (pts: Point[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Diagram
      hint="Всяка точка P се изпраща в P′ върху правата OP, като OP′ = |k| · OP. Влачи центъра O и върховете; промени k (при k < 0 копието е от другата страна на O, „обърнато“)."
      readout={
        <>
          <Sliders>
            <Slider label="k" value={k} onChange={v => setK(v === 0 ? 0.25 : v)} min={-1.5} max={2.5} step={0.25} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'a, b, c =', value: `${fmt(a)}; ${fmt(b)}; ${fmt(c)}`, tone: 'blue' },
                { label: 'a′, b′, c′ =', value: `${fmt(Math.abs(k) * a)}; ${fmt(Math.abs(k) * b)}; ${fmt(Math.abs(k) * c)}`, tone: 'rose' },
              ]}
            />
          </div>
          <Formula>
            P′ : P = {fmt(P1)} : {fmt(P)} = {fmt(Math.abs(k), 2)} = |k|
          </Formula>
          <Formula>
            S′ : S = {fmt(S1)} : {fmt(S)} = {S > 0 ? fmt(S1 / S, 2) : '—'} = k²
          </Formula>
          {Math.abs(k) === 1 && <Note tone="amber">При |k| = 1 триъгълниците са еднакви – еднаквостта е частен случай на подобието.</Note>}
        </>
      }
    >
      {/* Лъчите от O: при k > 0 стигат до по-далечния връх, при k < 0 – до двата */}
      {[A, B, C].map((p, i) => {
        const p1 = [A1, B1, C1][i];
        const ends = k < 0 ? [p, p1] : [k >= 1 ? p1 : p];
        return ends.map((q, j) => <Segment key={`${i}${j}`} p={O} q={q} tone="gray" width={1.2} dashed />);
      })}
      <polygon points={poly([A1, B1, C1])} className={`${tones.rose.soft} ${tones.rose.stroke}`} strokeWidth="2.5" />
      <polygon points={poly([A, B, C])} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      <VertexLabel p={A1} center={center1} name="A′" />
      <VertexLabel p={B1} center={center1} name="B′" />
      <VertexLabel p={C1} center={center1} name="C′" />
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={C} center={center} name="C" />
      <Label p={{ x: O.x - 14, y: O.y - 14 }} tone="ink" size={17} weight={700}>
        O
      </Label>
      <Handle p={O} onMove={p => setO(snap(p))} name="O" tone="gray" />
      <Handle p={A} onMove={p => setA(snap(p))} name="A" />
      <Handle p={B} onMove={p => setB(snap(p))} name="B" />
      <Handle p={C} onMove={p => setC(snap(p))} name="C" />
    </Diagram>
  );
}
