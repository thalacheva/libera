import { useState } from 'react';
import { gcd } from '~/drill';
import { Curve, Plot, PlotDot, Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

const X: [number, number] = [-10, 10];
const Y: [number, number] = [-7, 7];

/** Целите точки върху правата ax + by = c – решенията на линейното диофантово уравнение. */
export default function LatticeLineLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(4);
  const d = gcd(a, b);

  const points: Point[] = [];
  for (let x = Math.ceil(X[0]); x <= X[1]; x++) {
    if ((c - a * x) % b === 0) {
      const y = (c - a * x) / b;
      if (y > Y[0] && y < Y[1]) points.push({ x, y });
    }
  }
  const solvable = c % d === 0;
  const minus = (v: number) => String(v).replace('-', '−');
  const sign = (v: number) => (v < 0 ? `− ${-v}` : `+ ${v}`);

  return (
    <Plot
      x={X}
      y={Y}
      hint="Правата ax + by = c минава през цели точки само когато НОД(a, b) дели c. Тогава точките са на равни разстояния: всяка следваща е с b/d надясно и a/d надолу."
      readout={
        <>
          <Sliders>
            <Slider label="a" value={a} onChange={setA} min={1} max={9} step={1} tone="blue" />
            <Slider label="b" value={b} onChange={setB} min={1} max={9} step={1} tone="blue" />
            <Slider label="c" value={c} onChange={setC} min={-12} max={12} step={1} tone="rose" />
          </Sliders>
          <p className="mt-3 text-center font-mono text-base sm:text-lg text-gray-800 dark:text-gray-100">
            {a}x + {b}y = {String(c).replace('-', '−')}
          </p>
          <div className="mt-2">
            <Readout
              items={[
                { label: 'НОД(a, b) =', value: d, tone: 'blue' },
                { label: 'цели точки на чертежа:', value: points.length, tone: 'rose' },
              ]}
            />
          </div>
          <Note tone={solvable ? 'emerald' : 'rose'}>
            {solvable
              ? points.length > 0
                ? `Например x = ${minus(points[0].x)}, y = ${minus(points[0].y)}. Всички решения: x = ${minus(points[0].x)} ${sign(b / d)}t, y = ${minus(points[0].y)} ${sign(-a / d)}t.`
                : 'Решения има, но извън чертежа.'
              : `${d} не дели ${minus(c)} – уравнението няма цели решения.`}
          </Note>
        </>
      }
    >
      <Curve f={x => (c - a * x) / b} tone="blue" width={2.5} />
      {points.map(p => (
        <PlotDot key={p.x} p={p} tone="rose" r={6} />
      ))}
    </Plot>
  );
}
