import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';

/** y = aˣ: какво означават a⁰, a⁻¹ и a^(1/2) върху графиката. */
export default function ExpGraphLab() {
  const [a, setA] = useState(2);
  const [x, setX] = useState(1.5);
  const y = a ** x;

  const marks = [
    { x: -1, label: 'a⁻¹ = 1/a', tone: 'amber' as const, dx: -8, dy: -12, anchor: 'end' as const },
    { x: 0, label: 'a⁰ = 1', tone: 'emerald' as const, dx: -10, dy: -14, anchor: 'end' as const },
    { x: 0.5, label: 'a^(1/2) = √a', tone: 'violet' as const, dx: 12, dy: 14, anchor: 'start' as const },
    { x: 1, label: 'a¹ = a', tone: 'rose' as const, dx: 10, dy: -12, anchor: 'start' as const },
  ];

  return (
    <Plot
      x={[-4, 4]}
      y={[-1, 7]}
      hint="Графиката на y = aˣ минава през (0; 1) за всяко a > 0. Точките за отрицателни и дробни показатели лежат на същата гладка крива – затова дефинициите a⁻ⁿ = 1/aⁿ и a^(1/n) = ⁿ√a са „естествените“."
      readout={
        <>
          <Sliders>
            <Slider label="a" value={a} onChange={setA} min={0.25} max={3} step={0.25} tone="blue" />
            <Slider label="x" value={x} onChange={setX} min={-3} max={3} step={0.25} tone="gray" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'a⁻¹ =', value: num(1 / a, 3), tone: 'amber' },
                { label: 'a⁰ =', value: '1', tone: 'emerald' },
                { label: '√a =', value: num(Math.sqrt(a), 3), tone: 'violet' },
                { label: `a^${num(x)} =`, value: num(y, 3), tone: 'blue' },
              ]}
            />
          </div>
          {a === 1 ? (
            <Note tone="gray">При a = 1 всички степени са 1 – графиката е хоризонтална права.</Note>
          ) : (
            <Note tone={a > 1 ? 'blue' : 'rose'}>
              {a > 1 ? 'a > 1: функцията расте – експоненциален растеж (удвояване, сложна лихва).' : '0 < a < 1: функцията намалява – експоненциално затихване (радиоактивен разпад).'}
            </Note>
          )}
        </>
      }
    >
      <Curve f={t => a ** t} tone="blue" />
      <PlotLine p={{ x, y: 0 }} q={{ x, y }} tone="gray" dashed width={1.5} />
      {marks.map(m => (
        <g key={m.x}>
          <PlotDot p={{ x: m.x, y: a ** m.x }} tone={m.tone} r={5.5} />
          <PlotLabel p={{ x: m.x, y: a ** m.x }} dx={m.dx} dy={m.dy} anchor={m.anchor} tone={m.tone} size={12}>
            {m.label}
          </PlotLabel>
        </g>
      ))}
      <PlotDot p={{ x, y }} tone="blue" r={7} />
    </Plot>
  );
}
