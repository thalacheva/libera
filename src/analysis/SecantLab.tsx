import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLabel, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const FUNCTIONS = [
  { name: 'x²', f: (x: number) => x * x, df: (x: number) => 2 * x, x: [-3, 4] as [number, number], y: [-1.5, 6] as [number, number], x0: 1 },
  { name: 'x³ − 3x', f: (x: number) => x ** 3 - 3 * x, df: (x: number) => 3 * x * x - 3, x: [-3, 3] as [number, number], y: [-3, 3] as [number, number], x0: -1.5 },
  { name: '√x', f: (x: number) => (x >= 0 ? Math.sqrt(x) : NaN), df: (x: number) => 1 / (2 * Math.sqrt(x)), x: [-1, 7] as [number, number], y: [-1, 3.5] as [number, number], x0: 1 },
];

/** Секущата през P и Q се превръща в допирателна, когато Q се приближи до P (h → 0). */
export default function SecantLab() {
  const [k, setK] = useState(0);
  const [x0, setX0] = useState(FUNCTIONS[0].x0);
  const [h, setH] = useState(1);
  const F = FUNCTIONS[k];
  const P = { x: x0, y: F.f(x0) };
  const Q = { x: x0 + h, y: F.f(x0 + h) };
  const secant = (Q.y - P.y) / h;
  const tangent = F.df(x0);
  // √x не е дефиниран за x < 0 – тогава Q не съществува
  const qValid = Number.isFinite(Q.y);

  return (
    <Plot
      x={F.x}
      y={F.y}
      hint="Плъзгай h към нула: точката Q се приближава до P, а секущата (синята права) – до допирателната (пунктир). Наклонът на секущата Δy/Δx клони към производната f′(x₀)."
      readout={
        <>
          <Buttons>
            {FUNCTIONS.map((g, i) => (
              <DiagramButton
                key={g.name}
                active={i === k}
                onClick={() => {
                  setK(i);
                  setX0(g.x0);
                  setH(1);
                }}
              >
                f(x) = {g.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="x₀" value={x0} onChange={setX0} min={k === 2 ? 0.5 : F.x[0] + 1} max={F.x[1] - 1} step={0.25} tone="rose" />
            <Slider label="h" value={h} onChange={v => setH(v === 0 ? 0.05 : v)} min={-2} max={2} step={0.05} tone="blue" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'Δy/Δx =', value: qValid ? num(secant, 3) : '—', tone: 'blue' },
                { label: "f′(x₀) =", value: num(tangent, 3), tone: 'rose' },
                { label: 'разлика', value: qValid ? num(Math.abs(secant - tangent), 3) : '—' },
              ]}
            />
          </div>
          <Note tone={Math.abs(h) <= 0.1 ? 'emerald' : 'gray'}>
            {Math.abs(h) <= 0.1
              ? 'При малко h секущата почти съвпада с допирателната.'
              : 'Наклонът на секущата е средната скорост на изменение между P и Q.'}
          </Note>
        </>
      }
    >
      <Curve f={F.f} tone="gray" />
      <Curve f={x => P.y + tangent * (x - x0)} tone="rose" dashed width={2} />
      {qValid && <Curve f={x => P.y + secant * (x - x0)} tone="blue" width={2} />}
      <PlotDot p={P} tone="rose" r={6} />
      {qValid && <PlotDot p={Q} tone="blue" r={6} />}
      <PlotLabel p={P} dx={-10} dy={-12} anchor="end" tone="rose" size={13}>
        P
      </PlotLabel>
      {qValid && (
        <PlotLabel p={Q} dx={10} dy={14} anchor="start" tone="blue" size={13}>
          Q
        </PlotLabel>
      )}
    </Plot>
  );
}
