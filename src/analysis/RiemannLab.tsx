import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotPolygon, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const FUNCTIONS = [
  { name: 'x²', f: (x: number) => x * x, a: 0, b: 2, exact: 8 / 3, exactText: '8/3 ≈ 2,667', x: [-0.5, 3] as [number, number], y: [-0.5, 4.5] as [number, number] },
  { name: 'sin x', f: Math.sin, a: 0, b: Math.PI, exact: 2, exactText: '2', x: [-0.5, 3.7] as [number, number], y: [-0.5, 1.5] as [number, number] },
  { name: '√x', f: Math.sqrt, a: 0, b: 4, exact: 16 / 3, exactText: '16/3 ≈ 5,333', x: [-0.5, 4.5] as [number, number], y: [-0.5, 2.5] as [number, number] },
];

const MODES = [
  { id: 'left', name: 'леви краища', at: 0 },
  { id: 'mid', name: 'среди', at: 0.5 },
  { id: 'right', name: 'десни краища', at: 1 },
];

/** Лицето под кривата като сбор от правоъгълници – с повече правоъгълници сборът клони към интеграла. */
export default function RiemannLab() {
  const [k, setK] = useState(0);
  const [n, setN] = useState(4);
  const [m, setM] = useState(0);
  const F = FUNCTIONS[k];
  const dx = (F.b - F.a) / n;
  const rects = Array.from({ length: n }, (_, i) => {
    const x0 = F.a + i * dx;
    return { x0, h: F.f(x0 + MODES[m].at * dx) };
  });
  const sum = rects.reduce((s, r) => s + r.h * dx, 0);

  return (
    <Plot
      x={F.x}
      y={F.y}
      hint="Увеличавай броя на правоъгълниците n. Сборът от лицата им се приближава до точното лице под кривата – това е определеният интеграл."
      readout={
        <>
          <Buttons>
            {FUNCTIONS.map((g, i) => (
              <DiagramButton key={g.name} active={i === k} onClick={() => setK(i)}>
                f(x) = {g.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Buttons>
            {MODES.map((mode, i) => (
              <DiagramButton key={mode.id} active={i === m} onClick={() => setM(i)}>
                {mode.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="n" value={n} onChange={setN} min={1} max={40} step={1} tone="blue" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'сбор =', value: num(sum, 3), tone: 'blue' },
                { label: 'точно =', value: F.exactText, tone: 'emerald' },
                { label: 'грешка', value: num(Math.abs(sum - F.exact), 3) },
              ]}
            />
          </div>
          <Note tone={Math.abs(sum - F.exact) < 0.01 ? 'emerald' : 'gray'}>
            {Math.abs(sum - F.exact) < 0.01
              ? 'Грешката е под 0,01 – правоъгълниците почти запълват лицето.'
              : `Ширина на всеки правоъгълник: Δx = ${num(dx, 3)}`}
          </Note>
        </>
      }
    >
      {rects.map(r => (
        <PlotPolygon
          key={r.x0}
          points={[
            { x: r.x0, y: 0 },
            { x: r.x0, y: r.h },
            { x: r.x0 + dx, y: r.h },
            { x: r.x0 + dx, y: 0 },
          ]}
          tone="blue"
        />
      ))}
      <Curve f={F.f} tone="emerald" />
    </Plot>
  );
}
