import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLine, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// t – докъде се движи точката, за да не излиза от графиката
const FUNCTIONS = [
  { name: 'x² − 2x', dname: '2x − 2', f: (x: number) => x * x - 2 * x, df: (x: number) => 2 * x - 2, x: [-2, 4] as [number, number], y: [-3, 3] as [number, number], t: [-1, 3] },
  { name: 'x³ − 3x', dname: '3x² − 3', f: (x: number) => x ** 3 - 3 * x, df: (x: number) => 3 * x * x - 3, x: [-3, 3] as [number, number], y: [-3, 3] as [number, number], t: [-2, 2] },
  { name: 'sin x', dname: 'cos x', f: Math.sin, df: Math.cos, x: [-5, 5] as [number, number], y: [-2, 2] as [number, number], t: [-4.5, 4.5] },
];

// Двете графики една под друга – по-тесни, за да се виждат заедно
const box = 'max-w-sm mx-auto';

/** Докато точката върви по f, наклонът на допирателната чертае графиката на f′. */
export default function DerivativeGraphLab() {
  const [k, setK] = useState(1);
  const F = FUNCTIONS[k];
  const [x0, setX0] = useState(F.t[0]);
  const [showAll, setShowAll] = useState(false);
  const y0 = F.f(x0);
  const slope = F.df(x0);
  // Допирателна с еднаква дължина при всякакъв наклон
  const half = 1.2 / Math.sqrt(1 + slope * slope);
  const flat = Math.abs(slope) < 0.08;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">f(x) = {F.name}</p>
      <div className={box}>
        <Plot x={F.x} y={F.y}>
          <Curve f={F.f} tone="blue" />
          <PlotLine
            p={{ x: x0 - half, y: y0 - slope * half }}
            q={{ x: x0 + half, y: y0 + slope * half }}
            tone={flat ? 'amber' : slope > 0 ? 'emerald' : 'rose'}
            width={3}
          />
          <PlotDot p={{ x: x0, y: y0 }} tone="blue" r={6} />
        </Plot>
      </div>
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1 mb-1">f′(x) = {F.dname}</p>
      <div className={box}>
        <Plot x={F.x} y={F.y}>
          <Curve f={F.df} tone="violet" from={F.x[0]} to={showAll ? F.x[1] : x0} />
          <PlotLine p={{ x: x0, y: 0 }} q={{ x: x0, y: slope }} tone="gray" dashed width={1.5} />
          <PlotDot p={{ x: x0, y: slope }} tone="violet" r={6} />
        </Plot>
      </div>

      <Sliders>
        <Slider label="x₀" value={x0} onChange={setX0} min={F.t[0]} max={F.t[1]} step={0.05} tone="blue" />
      </Sliders>
      <p className="mt-3 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
        наклон на допирателната = f′({num(x0)}) = {num(slope)}
      </p>
      <Note tone={flat ? 'amber' : slope > 0 ? 'emerald' : 'rose'}>
        {flat
          ? 'Допирателната е хоризонтална: f′ = 0. Тук може да има връх или дъно.'
          : slope > 0
            ? 'f′ > 0 – функцията расте, графиката на f′ е над оста x.'
            : 'f′ < 0 – функцията намалява, графиката на f′ е под оста x.'}
      </Note>
      <Buttons>
        {FUNCTIONS.map((g, i) => (
          <DiagramButton
            key={g.name}
            active={i === k}
            onClick={() => {
              setK(i);
              setX0(g.t[0]);
            }}
          >
            {g.name}
          </DiagramButton>
        ))}
        <DiagramButton active={showAll} onClick={() => setShowAll(!showAll)}>
          цялата f′
        </DiagramButton>
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Премести точката отляво надясно и гледай как се чертае f′. Къде f има връх или дъно, f′ пресича оста x.
      </p>
    </div>
  );
}
