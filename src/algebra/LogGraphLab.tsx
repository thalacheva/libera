import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';

/** Долен индекс: 0,25 → ₀,₂₅. */
const sub = (s: string) => s.replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);

/** y = aˣ и y = log_a x са симетрични спрямо правата y = x. */
export default function LogGraphLab() {
  const [a, setA] = useState(2);
  const [t, setT] = useState(1.5);
  const P = { x: t, y: a ** t };
  const Q = { x: a ** t, y: t };

  return (
    <Plot
      x={[-3, 6]}
      y={[-3, 6]}
      hint="Точката P(t; aᵗ) е на показателната функция, а огледалната ѝ Q(aᵗ; t) – на логаритмичната. Двете функции са обратни една на друга: всяка „отменя“ другата."
      readout={
        <>
          <Sliders>
            <Slider label="a" value={a} onChange={v => setA(v === 1 ? 1.25 : v)} min={0.25} max={4} step={0.25} tone="blue" />
            <Slider label="t" value={t} onChange={setT} min={-2} max={2} step={0.25} tone="gray" />
          </Sliders>
          <p className="mt-3 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100">
            {num(a)}^{num(t)} = {num(a ** t, 3)} &nbsp; ⇔ &nbsp; log<sub>{num(a)}</sub> {num(a ** t, 3)} = {num(t)}
          </p>
          <Note tone={a > 1 ? 'blue' : 'rose'}>
            {a > 1
              ? 'a > 1: и двете функции растат; логаритъмът расте много бавно.'
              : '0 < a < 1: и двете функции намаляват.'}{' '}
            Логаритмичната графика винаги минава през (1; 0) и е дефинирана само за x &gt; 0.
          </Note>
        </>
      }
    >
      <Curve f={x => x} tone="gray" dashed width={1.5} />
      <Curve f={x => a ** x} tone="blue" />
      <Curve f={x => (x > 0 ? Math.log(x) / Math.log(a) : NaN)} tone="emerald" from={0.001} />
      <PlotLine p={P} q={Q} tone="amber" dashed width={1.5} />
      <PlotDot p={P} tone="blue" r={6} />
      <PlotDot p={Q} tone="emerald" r={6} />
      <PlotLabel p={P} dx={-10} dy={-12} anchor="end" tone="blue" size={13}>
        P
      </PlotLabel>
      <PlotLabel p={Q} dx={10} dy={14} anchor="start" tone="emerald" size={13}>
        Q
      </PlotLabel>
      <PlotLabel p={{ x: -2.7, y: 5.4 }} anchor="start" tone="blue" size={13}>
        {`y = ${num(a)}ˣ`}
      </PlotLabel>
      <PlotLabel p={{ x: -2.7, y: 4.8 }} anchor="start" tone="emerald" size={13}>
        {`y = log${sub(num(a))} x`}
      </PlotLabel>
      <PlotLabel p={{ x: 5.2, y: 5.6 }} anchor="end" tone="gray" size={12}>
        y = x
      </PlotLabel>
    </Plot>
  );
}
