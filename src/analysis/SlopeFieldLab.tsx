import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotDot, PlotLine, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

type Eq = { name: string; f: (x: number, y: number) => number; note: string };

const EQUATIONS: Eq[] = [
  { name: "y′ = x", f: x => x, note: 'Решенията са параболите y = x²/2 + C – една и съща крива, преместена нагоре или надолу.' },
  { name: "y′ = y", f: (_, y) => y, note: 'Решенията са y = C·eˣ: колкото по-голямо е y, толкова по-бързо расте. При y = 0 решението остава 0.' },
  { name: "y′ = x − y", f: (x, y) => x - y, note: 'Всички решения се „залепват“ за правата y = x − 1 – тя също е решение.' },
  { name: "y′ = y(3 − y)/3", f: (_, y) => (y * (3 - y)) / 3, note: 'Логистичен растеж: решенията се приближават към y = 3 – „капацитета на средата“.' },
];

const X: [number, number] = [-4, 4];
const Y: [number, number] = [-3, 4];

/** Решение през (x₀; y₀) по метода на Рунге–Кута, напред и назад, докато не излезе от графиката. */
function solve(f: Eq['f'], x0: number, y0: number, dir: 1 | -1): Point[] {
  const h = 0.02 * dir;
  const pts: Point[] = [{ x: x0, y: y0 }];
  let [x, y] = [x0, y0];
  while (x > X[0] - 0.1 && x < X[1] + 0.1 && y > Y[0] - 1 && y < Y[1] + 1) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h / 2) * k1);
    const k3 = f(x + h / 2, y + (h / 2) * k2);
    const k4 = f(x + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;
    pts.push({ x, y });
  }
  return pts;
}

/** Полето от направления на y′ = f(x, y) и решението през избрана начална точка. */
export default function SlopeFieldLab() {
  const [k, setK] = useState(0);
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const E = EQUATIONS[k];

  const field: { p: Point; q: Point }[] = [];
  for (let x = X[0] + 0.5; x < X[1]; x += 0.5) {
    for (let y = Y[0] + 0.5; y < Y[1]; y += 0.5) {
      const s = E.f(x, y);
      const d = 0.17 / Math.sqrt(1 + s * s);
      field.push({ p: { x: x - d, y: y - s * d }, q: { x: x + d, y: y + s * d } });
    }
  }
  const curve = [...solve(E.f, x0, y0, -1).reverse(), ...solve(E.f, x0, y0, 1)];

  return (
    <Plot
      x={X}
      y={Y}
      hint="Всяка чертичка показва наклона y′ в тази точка. Решението на уравнението е крива, която във всяка своя точка следва чертичките. Премести началната точка – получаваш друго решение от същото семейство."
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
            <Slider label="x₀" value={x0} onChange={setX0} min={-3.5} max={3.5} step={0.25} tone="rose" />
            <Slider label="y₀" value={y0} onChange={setY0} min={-2.5} max={3.5} step={0.25} tone="rose" />
          </Sliders>
          <p className="mt-3 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
            начално условие y({num(x0)}) = {num(y0)} · наклон там {num(E.f(x0, y0))}
          </p>
          <Note tone="blue">{E.note}</Note>
        </>
      }
    >
      {field.map(({ p, q }) => (
        <PlotLine key={`${p.x},${p.y}`} p={p} q={q} tone="gray" width={1.5} />
      ))}
      <PlotPolyline points={curve} tone="blue" />
      <PlotDot p={{ x: x0, y: y0 }} tone="rose" r={6} />
    </Plot>
  );
}
