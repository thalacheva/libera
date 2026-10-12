import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const END = 6;

const EQUATIONS = [
  {
    name: "y′ = −y/2, y(0) = 4",
    f: (_: number, y: number) => -y / 2,
    exact: (x: number) => 4 * Math.exp(-x / 2),
    y0: 4,
    note: 'Разпад: при твърде голяма стъпка Ойлер „прескача“ под нулата.',
  },
  {
    name: "y′ = y(4 − y)/4, y(0) = 0,5",
    f: (_: number, y: number) => (y * (4 - y)) / 4,
    // Логистичната крива K / (1 + A·e^(−x)) с K = 4 и A = 7
    exact: (x: number) => 4 / (1 + 7 * Math.exp(-x)),
    y0: 0.5,
    note: 'Логистичен растеж: при голяма стъпка Ойлер надминава границата 4.',
  },
];

/** Методът на Ойлер: вървим на малки стъпки по допирателната. Колкото по-малка е стъпката, толкова по-точно. */
export default function EulerLab() {
  const [k, setK] = useState(0);
  const [n, setN] = useState(2);
  const E = EQUATIONS[k];
  const h = END / n;

  const pts = [{ x: 0, y: E.y0 }];
  for (let i = 0; i < n; i++) {
    const { x, y } = pts[i];
    pts.push({ x: x + h, y: y + h * E.f(x, y) });
  }
  const approx = pts[n].y;
  const exact = E.exact(END);

  return (
    <Plot
      x={[-0.5, 6.5]}
      y={[-2.5, 4.8]}
      hint="От началната точка тръгваме по допирателната (наклонът е y′ от уравнението), правим стъпка h, пресмятаме новия наклон и пак. Така работят и компютрите – само че с много малки стъпки и по-хитри формули."
      readout={
        <>
          <Buttons>
            {EQUATIONS.map((e, i) => (
              <DiagramButton key={e.name} active={i === k} onClick={() => setK(i)}>
                {e.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="стъпки" value={n} onChange={setN} min={1} max={40} step={1} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'h =', value: num(h, 3), tone: 'rose' },
                { label: 'Ойлер y(6) ≈', value: num(approx, 3), tone: 'rose' },
                { label: 'точно y(6) =', value: num(exact, 3), tone: 'blue' },
                { label: 'грешка', value: num(Math.abs(approx - exact), 3) },
              ]}
            />
          </div>
          <Note tone={h <= 0.25 ? 'emerald' : 'amber'}>{h <= 0.25 ? 'Малка стъпка – начупената линия почти съвпада с решението.' : E.note}</Note>
        </>
      }
    >
      <Curve f={E.exact} tone="blue" from={0} to={END} />
      <PlotPolyline points={pts} tone="rose" width={2.5} />
      {n <= 12 && pts.map(p => <PlotDot key={p.x} p={p} tone="rose" r={4} />)}
    </Plot>
  );
}
