import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLine, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const FUNCS = [
  { id: 'sq', name: 'y = x²/10', f: (x: number) => (x * x) / 10, convex: true },
  { id: 'inv', name: 'y = 6/x', f: (x: number) => 6 / x, convex: true },
  { id: 'sqrt', name: 'y = 2√x', f: (x: number) => 2 * Math.sqrt(x), convex: false },
] as const;

/** Хорда и неравенство на Йенсен: f(w·x₁ + (1 − w)·x₂) спрямо w·f(x₁) + (1 − w)·f(x₂). */
export function ConvexityLab() {
  const [fi, setFi] = useState(0);
  const [x1, setX1] = useState(1.5);
  const [x2, setX2] = useState(7);
  const [w, setW] = useState(0.5);
  const { f, convex } = FUNCS[fi];

  const xm = w * x1 + (1 - w) * x2;
  const onGraph = f(xm);
  const onChord = w * f(x1) + (1 - w) * f(x2);
  const P1 = { x: x1, y: f(x1) };
  const P2 = { x: x2, y: f(x2) };
  const same = Math.abs(onGraph - onChord) < 1e-9;

  return (
    <div className="mb-6">
      <Buttons>
        {FUNCS.map((g, i) => (
          <DiagramButton key={g.id} active={i === fi} onClick={() => setFi(i)}>
            {g.name} – {g.convex ? 'изпъкнала' : 'вдлъбната'}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Plot
          x={[-1, 9]}
          y={[-1, 7]}
          hint="Изпъкнала (convex) функция: всяка хорда лежи над графиката, затова стойността в средно претеглената точка е най-много средно претеглената стойност. При вдлъбнатата е обратно. Това е неравенството на Йенсен за две точки; за повече точки е същото."
          readout={
            <>
              <Readout
                items={[
                  { label: 'x =', value: `${num(w, 2)}·${num(x1)} + ${num(1 - w, 2)}·${num(x2)} = ${num(xm, 2)}`, tone: 'violet' },
                  { label: 'f(x) =', value: num(onGraph, 3), tone: 'blue' },
                  { label: 'w·f(x₁) + (1 − w)·f(x₂) =', value: num(onChord, 3), tone: 'rose' },
                ]}
              />
              <Note tone={same ? 'emerald' : convex ? 'blue' : 'amber'}>
                {same
                  ? 'Двете стойности съвпадат – когато x₁ = x₂ или теглото е 0 или 1.'
                  : convex
                    ? `${num(onGraph, 3)} ≤ ${num(onChord, 3)}: точката от графиката е под хордата.`
                    : `${num(onGraph, 3)} ≥ ${num(onChord, 3)}: при вдлъбната функция графиката е над хордата.`}
              </Note>
              <Sliders>
                <Slider label="x₁" value={x1} onChange={setX1} min={0.5} max={8.5} step={0.5} tone="gray" />
                <Slider label="x₂" value={x2} onChange={setX2} min={0.5} max={8.5} step={0.5} tone="gray" />
                <Slider label="w" value={w} onChange={setW} min={0} max={1} step={0.05} tone="violet" />
              </Sliders>
            </>
          }
        >
          <Curve f={f} tone="blue" from={0.3} to={9} />
          <PlotLine p={P1} q={P2} tone="rose" width={2} />
          <PlotLine p={{ x: xm, y: 0 }} q={{ x: xm, y: Math.max(onGraph, onChord) }} tone="gray" width={1} dashed />
          <PlotDot p={P1} tone="gray" />
          <PlotDot p={P2} tone="gray" />
          <PlotDot p={{ x: xm, y: onChord }} tone="rose" r={6} />
          <PlotDot p={{ x: xm, y: onGraph }} tone="blue" r={6} />
        </Plot>
      </div>
    </div>
  );
}
