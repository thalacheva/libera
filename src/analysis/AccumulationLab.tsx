import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLine, PlotPolygon, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

const FUNCTIONS = [
  { name: 't − 1', aname: 'x²/2 − x', f: (t: number) => t - 1, A: (x: number) => (x * x) / 2 - x, x: [-0.5, 4.5] as [number, number], y: [-1.5, 4.5] as [number, number], max: 4 },
  { name: 't²', aname: 'x³/3', f: (t: number) => t * t, A: (x: number) => x ** 3 / 3, x: [-0.5, 2.5] as [number, number], y: [-0.5, 4.5] as [number, number], max: 2.2 },
  { name: 'cos t', aname: 'sin x', f: Math.cos, A: Math.sin, x: [-0.5, 6.5] as [number, number], y: [-2, 2] as [number, number], max: 6.2 },
];

// Двете графики една под друга – по-тесни, за да се виждат заедно
const box = 'max-w-sm mx-auto';

/** Областта под f от 0 до x, разделена на положителна и отрицателна част. */
function area(f: (t: number) => number, x: number, sign: 1 | -1): Point[] {
  const steps = 120;
  const pts: Point[] = [{ x: 0, y: 0 }];
  for (let i = 0; i <= steps; i++) {
    const t = (x * i) / steps;
    const v = f(t);
    pts.push({ x: t, y: sign > 0 ? Math.max(v, 0) : Math.min(v, 0) });
  }
  pts.push({ x, y: 0 });
  return pts;
}

/** Функцията на лицето A(x) = ∫₀ˣ f(t) dt: скоростта, с която расте лицето, е f(x). */
export default function AccumulationLab() {
  const [k, setK] = useState(0);
  const F = FUNCTIONS[k];
  const [x, setX] = useState(1.5);
  const fx = F.f(x);
  const Ax = F.A(x);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">f(t) = {F.name}</p>
      <div className={box}>
        <Plot x={F.x} y={F.y}>
          {x > 0 && <PlotPolygon points={area(F.f, x, 1)} tone="emerald" />}
          {x > 0 && <PlotPolygon points={area(F.f, x, -1)} tone="rose" />}
          <Curve f={F.f} tone="blue" />
          <PlotLine p={{ x, y: 0 }} q={{ x, y: fx }} tone="amber" width={3} />
        </Plot>
      </div>
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1 mb-1">A(x) = {F.aname}</p>
      <div className={box}>
        <Plot x={F.x} y={F.y}>
          <Curve f={F.A} tone="violet" from={0} to={x} />
          <PlotDot p={{ x, y: Ax }} tone="violet" r={6} />
        </Plot>
      </div>

      <Sliders>
        <Slider label="x" value={x} onChange={setX} min={0} max={F.max} step={0.05} tone="amber" />
      </Sliders>
      <p className="mt-3 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
        A({num(x)}) = {num(Ax)} &nbsp;·&nbsp; f({num(x)}) = {num(fx)}
      </p>
      <Note tone={Math.abs(fx) < 0.05 ? 'amber' : fx > 0 ? 'emerald' : 'rose'}>
        {Math.abs(fx) < 0.05
          ? 'f(x) = 0: лицето спира да се мени – A(x) има връх или дъно.'
          : fx > 0
            ? 'f(x) > 0: добавяме лице над оста – A(x) расте със скорост f(x).'
            : 'f(x) < 0: лицето под оста се брои с минус – A(x) намалява.'}
      </Note>
      <Buttons>
        {FUNCTIONS.map((g, i) => (
          <DiagramButton
            key={g.name}
            active={i === k}
            onClick={() => {
              setK(i);
              setX(Math.min(x, g.max));
            }}
          >
            f(t) = {g.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 A(x) е лицето под f от 0 до x (под оста – с минус). Жълтата отсечка е височината f(x) – с нея лицето расте при всяка малка стъпка. Затова A′(x) = f(x).
      </p>
    </div>
  );
}
