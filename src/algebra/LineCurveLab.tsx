import { useState } from 'react';
import { num, point, polynomial } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Mode = 'parabola' | 'circle';
const R = 4;

const CIRCLE = Array.from({ length: 121 }, (_, i) => {
  const t = (i / 120) * 2 * Math.PI;
  return { x: R * Math.cos(t), y: R * Math.sin(t) };
});

/** Права и парабола (или окръжност): заместване и дискриминанта. */
export default function LineCurveLab() {
  const [mode, setMode] = useState<Mode>('parabola');
  const [k, setK] = useState(1);
  const [m, setM] = useState(2);

  const line = (x: number) => k * x + m;
  const lineText = `y = ${polynomial([k, m])}`;
  // След заместване на y = kx + m: Ax² + Bx + C = 0
  const [A, B, C] = mode === 'parabola' ? [1, -k, -m] : [1 + k * k, 2 * k * m, m * m - R * R];
  const D = B * B - 4 * A * C;
  const tangent = Math.abs(D) < 1e-9;
  const xs = tangent ? [-B / (2 * A)] : D > 0 ? [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)] : [];
  const pts = xs.map(x => ({ x, y: line(x) }));

  const range = mode === 'parabola' ? { x: [-6, 6] as [number, number], y: [-3, 9] as [number, number] } : { x: [-8, 8] as [number, number], y: [-6, 6] as [number, number] };

  return (
    <Plot
      x={range.x}
      y={range.y}
      hint="Заместваме y от линейното уравнение в нелинейното и получаваме квадратно уравнение за x. Неговата дискриминанта казва колко общи точки имат правата и кривата."
      readout={
        <>
          <Buttons>
            <DiagramButton active={mode === 'parabola'} onClick={() => setMode('parabola')}>
              парабола y = x²
            </DiagramButton>
            <DiagramButton active={mode === 'circle'} onClick={() => setMode('circle')}>
              окръжност x² + y² = 16
            </DiagramButton>
          </Buttons>
          <Sliders>
            <Slider label="k" value={k} onChange={setK} min={-3} max={3} step={0.25} tone="rose" />
            <Slider label="m" value={m} onChange={setM} min={-6} max={6} step={0.5} tone="rose" />
          </Sliders>
          <Formula>
            {mode === 'parabola' ? `x² = ${polynomial([k, m])}` : `x² + (${polynomial([k, m])})² = 16`} ⇒ {polynomial([A, B, C])} = 0
          </Formula>
          <Formula>D = {num(tangent ? 0 : D)}</Formula>
          {pts.length === 2 && (
            <Note tone="emerald">
              D &gt; 0 – две общи точки: {point(pts[0])} и {point(pts[1])}
            </Note>
          )}
          {pts.length === 1 && <Note tone="amber">D = 0 – правата се допира до кривата в точката {point(pts[0])}</Note>}
          {pts.length === 0 && <Note tone="rose">D &lt; 0 – правата не пресича кривата: системата няма решение</Note>}
        </>
      }
    >
      {mode === 'parabola' ? <Curve f={x => x * x} tone="blue" /> : <PlotPolyline points={CIRCLE} tone="blue" />}
      <Curve f={line} tone="rose" />
      {pts.map((p, i) => (
        <g key={i}>
          <PlotDot p={p} tone={tangent ? 'amber' : 'emerald'} r={6} />
          <PlotLabel p={p} dx={i === 0 && pts.length === 2 ? -10 : 10} dy={-14} anchor={i === 0 && pts.length === 2 ? 'end' : 'start'} tone="ink" size={12}>
            {point(p)}
          </PlotLabel>
        </g>
      ))}
      <PlotLabel p={{ x: range.x[0], y: range.y[1] }} dx={8} dy={18} anchor="start" tone="rose" size={13}>
        {lineText}
      </PlotLabel>
    </Plot>
  );
}
