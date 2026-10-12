import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotPolygon, Slider, Sliders, VLine } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

const FUNCTIONS = [
  { name: 'x³ − 3x', f: (x: number) => x ** 3 - 3 * x, x: [-2.5, 2.5] as [number, number], y: [-2.5, 2.5] as [number, number], a: -1.5, b: 1.5 },
  { name: 'sin x', f: Math.sin, x: [-1, 7] as [number, number], y: [-1.6, 1.6] as [number, number], a: 0, b: 6 },
];

const STEPS = 400;

function region(f: (x: number) => number, a: number, b: number, sign: 1 | -1): Point[] {
  const pts: Point[] = [{ x: a, y: 0 }];
  for (let i = 0; i <= STEPS; i++) {
    const t = a + ((b - a) * i) / STEPS;
    const v = f(t);
    pts.push({ x: t, y: sign > 0 ? Math.max(v, 0) : Math.min(v, 0) });
  }
  pts.push({ x: b, y: 0 });
  return pts;
}

/** Интегралът брои лицето под оста с минус; лицето на фигурата е сборът на двете части. */
export default function SignedAreaLab() {
  const [k, setK] = useState(0);
  const F = FUNCTIONS[k];
  const [a, setA] = useState(F.a);
  const [b, setB] = useState(F.b);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);

  let pos = 0;
  let neg = 0;
  const dx = (hi - lo) / STEPS;
  for (let i = 0; i < STEPS; i++) {
    const v = F.f(lo + (i + 0.5) * dx) * dx;
    if (v > 0) pos += v;
    else neg -= v;
  }
  const integral = (pos - neg) * (b >= a ? 1 : -1);
  const cancels = pos > 0.05 && neg > 0.05;

  return (
    <Plot
      x={F.x}
      y={F.y}
      hint="Премести границите a и b. Зелената част се брои с плюс, червената – с минус. Интегралът може да е нула, а фигурата пак да има лице."
      readout={
        <>
          <Buttons>
            {FUNCTIONS.map((g, i) => (
              <DiagramButton
                key={g.name}
                active={i === k}
                onClick={() => {
                  setK(i);
                  setA(g.a);
                  setB(g.b);
                }}
              >
                f(x) = {g.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="a" value={a} onChange={setA} min={F.x[0] + 0.5} max={F.x[1] - 0.5} step={0.1} tone="violet" />
            <Slider label="b" value={b} onChange={setB} min={F.x[0] + 0.5} max={F.x[1] - 0.5} step={0.1} tone="violet" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'над оста', value: num(pos, 3), tone: 'emerald' },
                { label: 'под оста', value: num(neg, 3), tone: 'rose' },
                { label: '∫ₐᵇ f(x) dx =', value: num(integral, 3), tone: 'blue' },
                { label: 'лице =', value: num(pos + neg, 3) },
              ]}
            />
          </div>
          <Note tone={cancels ? 'amber' : 'gray'}>
            {cancels
              ? 'Двете части се изваждат: интегралът е по-малък от лицето на фигурата.'
              : 'Цялата фигура е от едната страна на оста: |интеграл| = лице.'}
          </Note>
        </>
      }
    >
      <PlotPolygon points={region(F.f, lo, hi, 1)} tone="emerald" />
      <PlotPolygon points={region(F.f, lo, hi, -1)} tone="rose" />
      <Curve f={F.f} tone="blue" />
      <VLine x={a} tone="violet" />
      <VLine x={b} tone="violet" />
    </Plot>
  );
}
