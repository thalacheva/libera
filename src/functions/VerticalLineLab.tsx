import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { Point } from '~/geometry/diagramMath';
import { num } from './functionMath';
import { Plot, PlotDot, PlotLine, PlotPolyline, Slider, Sliders } from './plot';

type Shape = { name: string; x: (t: number) => number; y: (t: number) => number; t: [number, number]; pieces?: [number, number][] };

const SHAPES: Shape[] = [
  { name: 'парабола', x: t => t, y: t => (t * t) / 2 - 3, t: [-6, 6] },
  { name: 'окръжност', x: t => 3 * Math.cos(t), y: t => 3 * Math.sin(t), t: [0, 2 * Math.PI] },
  { name: '„легнала“ парабола', x: t => (t * t) / 2 - 3, y: t => t, t: [-5, 5] },
  { name: 'синусоида', x: t => t, y: t => 2 * Math.sin(t), t: [-6, 6] },
  { name: 'S-крива', x: t => (t * t * t) / 3 - 2.5 * t, y: t => t, t: [-4.3, 4.3] },
  { name: 'хипербола', x: t => t, y: t => 3 / t, t: [-6, 6], pieces: [[-6, -0.45], [0.45, 6]] },
];

const sample = (s: Shape, [a, b]: [number, number], n = 400): Point[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = a + ((b - a) * i) / n;
    return { x: s.x(t), y: s.y(t) };
  });

/** Пресечни точки на кривата с вертикалната права x = c. */
function crossings(s: Shape, c: number) {
  const out: Point[] = [];
  for (const piece of s.pieces ?? [s.t]) {
    const pts = sample(s, piece, 800);
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      if ((p.x - c) * (q.x - c) <= 0 && p.x !== q.x) {
        const k = (c - p.x) / (q.x - p.x || 1);
        const y = p.y + k * (q.y - p.y);
        if (!out.some(o => Math.abs(o.y - y) < 0.05)) out.push({ x: c, y });
      }
    }
  }
  return out;
}

export function VerticalLineLab() {
  const [si, setSi] = useState(1);
  const [c, setC] = useState(1);
  const s = SHAPES[si];
  const hits = crossings(s, c);
  // Има ли изобщо вертикала с две или повече пресечни точки?
  const isFunction = !Array.from({ length: 121 }, (_, i) => -6 + i * 0.1).some(v => crossings(s, v).length > 1);

  return (
    <Plot
      x={[-6, 6]}
      y={[-5, 5]}
      hint="Плъзгай вертикалната права. Ако поне веднъж тя пресече кривата в две или повече точки, на едно x отговарят няколко y – кривата не е графика на функция."
      readout={
        <>
          <Buttons>
            {SHAPES.map((sh, i) => (
              <DiagramButton key={sh.name} active={i === si} onClick={() => setSi(i)}>
                {sh.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="x =" value={c} onChange={setC} min={-5.5} max={5.5} step={0.1} tone="rose" />
          </Sliders>
          <Note tone={hits.length > 1 ? 'rose' : 'emerald'}>
            При x = {num(c)}: {hits.length === 0 ? 'няма точка от кривата' : hits.length === 1 ? `една точка, y = ${num(hits[0].y)}` : `${hits.length} точки – y = ${hits.map(h => num(h.y)).join('; ')}`}
          </Note>
          <Note tone={isFunction ? 'emerald' : 'rose'}>{isFunction ? '✓ Това е графика на функция.' : '✗ Това НЕ е графика на функция.'}</Note>
        </>
      }
    >
      {(s.pieces ?? [s.t]).map((piece, i) => (
        <PlotPolyline key={i} points={sample(s, piece)} tone="blue" />
      ))}
      <PlotLine p={{ x: c, y: -5 }} q={{ x: c, y: 5 }} tone="rose" width={2} dashed />
      {hits.map((h, i) => (
        <PlotDot key={i} p={h} tone={hits.length > 1 ? 'rose' : 'emerald'} r={6} />
      ))}
    </Plot>
  );
}
