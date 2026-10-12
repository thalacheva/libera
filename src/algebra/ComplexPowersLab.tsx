import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotDot, PlotLabel, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { complexText } from './complexMath';

const circle = (r: number): Point[] => Array.from({ length: 121 }, (_, i) => ({ x: r * Math.cos((i / 60) * Math.PI), y: r * Math.sin((i / 60) * Math.PI) }));

/** Формула на Моавър: zⁿ има модул rⁿ и ъгъл nφ – степените се въртят по спирала. */
export default function ComplexPowersLab() {
  const [r, setR] = useState(1.1);
  const [phi, setPhi] = useState(30);
  const [n, setN] = useState(6);
  const rad = (phi * Math.PI) / 180;
  const powers: Point[] = Array.from({ length: n + 1 }, (_, k) => ({ x: r ** k * Math.cos(k * rad), y: r ** k * Math.sin(k * rad) }));
  const zn = powers[n];
  const round = (p: Point) => ({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 });

  return (
    <Plot
      x={[-3.5, 3.5]}
      y={[-3, 3]}
      hint="Всяко умножение по z завърта с ъгъл φ и разтяга r пъти. При r = 1 степените обикалят по единичната окръжност, при r > 1 се отдалечават по спирала, при r < 1 – се навиват към нулата."
      readout={
        <>
          <Sliders>
            <Slider label="r = |z|" value={r} onChange={setR} min={0.8} max={1.25} step={0.05} tone="blue" />
            <Slider label="φ, °" value={phi} onChange={setPhi} min={0} max={180} step={5} tone="violet" />
            <Slider label="n" value={n} onChange={setN} min={1} max={12} step={1} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'z =', value: complexText(round(powers[1])), tone: 'blue' },
                { label: `|z${n === 1 ? '' : toSup(n)}| = rⁿ =`, value: num(r ** n, 3), tone: 'rose' },
                { label: 'ъгъл nφ =', value: `${n * phi}°`, tone: 'violet' },
              ]}
            />
          </div>
          <Note tone={Math.abs(r - 1) < 1e-9 && (n * phi) % 360 === 0 ? 'emerald' : 'gray'}>
            {Math.abs(r - 1) < 1e-9 && (n * phi) % 360 === 0
              ? `zⁿ = 1: z е корен ${n}-ти от единицата.`
              : `zⁿ = ${num(r ** n, 2)}(cos ${n * phi}° + i sin ${n * phi}°) ≈ ${complexText(round(zn))}`}
          </Note>
        </>
      }
    >
      <PlotPolyline points={circle(1)} tone="gray" width={1.5} />
      <PlotPolyline points={powers} tone="violet" width={1.5} />
      {powers.slice(1).map((p, k) => (
        <PlotDot key={k} p={p} tone={k + 1 === n ? 'rose' : 'violet'} r={k + 1 === n ? 6 : 4} />
      ))}
      <PlotArrow p={{ x: 0, y: 0 }} q={powers[1]} tone="blue" width={2.5} />
      <PlotLabel p={powers[1]} dx={10} dy={-10} anchor="start" tone="blue" size={13}>
        z
      </PlotLabel>
      {n > 1 && (
        <PlotLabel p={zn} dx={10} dy={14} anchor="start" tone="rose" size={13}>
          {`z${toSup(n)}`}
        </PlotLabel>
      )}
    </Plot>
  );
}

function toSup(n: number) {
  return String(n)
    .split('')
    .map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
    .join('');
}
