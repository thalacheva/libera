import { useState } from 'react';
import { num, point } from '~/functions/functionMath';
import { Plot, PlotDot, PlotLabel, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import { tones } from '~/geometry/diagramMath';
import { EqLine } from './EqLine';
import { dets, fmtEq, type Eq } from './systemMath';

const PRESETS: { name: string; e1: Eq; e2: Eq }[] = [
  { name: 'Пресичат се', e1: { a: 1, b: 1, c: 5 }, e2: { a: 1, b: -1, c: 1 } },
  { name: 'Успоредни', e1: { a: 1, b: -2, c: -2 }, e2: { a: -2, b: 4, c: -4 } },
  { name: 'Съвпадат', e1: { a: 1, b: -2, c: -2 }, e2: { a: -2, b: 4, c: 4 } },
];

const X: [number, number] = [-8, 8];
const Y: [number, number] = [-6, 6];

/** Две прави, детерминантите и трите възможни случая. */
export default function SystemGraphLab() {
  const [e1, setE1] = useState<Eq>(PRESETS[0].e1);
  const [e2, setE2] = useState<Eq>(PRESETS[0].e2);
  const { D, Dx, Dy } = dets(e1, e2);

  const degenerate = (e: Eq) => e.a === 0 && e.b === 0;
  const kind = degenerate(e1) || degenerate(e2) ? 'degenerate' : D !== 0 ? 'one' : Dx === 0 && Dy === 0 ? 'all' : 'none';
  const sol = kind === 'one' ? { x: Dx / D, y: Dy / D } : null;
  const den = D < 0 ? `(${num(D)})` : num(D);
  const inView = sol && sol.x > X[0] && sol.x < X[1] && sol.y > Y[0] && sol.y < Y[1];

  const slider = (eq: Eq, set: (e: Eq) => void, key: keyof Eq, label: string, tone: 'blue' | 'rose') => (
    <Slider label={label} value={eq[key]} onChange={v => set({ ...eq, [key]: v })} min={-5} max={5} step={1} tone={tone} />
  );

  return (
    <Plot
      x={X}
      y={Y}
      hint="Решението на системата е общата точка на двете прави. D = a₁b₂ − a₂b₁ показва дали правите имат различен наклон: D ≠ 0 ⇔ пресичат се в една точка."
      readout={
        <>
          <Buttons>
            {PRESETS.map(p => (
              <DiagramButton
                key={p.name}
                onClick={() => {
                  setE1(p.e1);
                  setE2(p.e2);
                }}
              >
                {p.name}
              </DiagramButton>
            ))}
          </Buttons>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <div>
              <p className={`text-center font-mono text-sm mt-3 ${tones.blue.text}`}>{fmtEq(e1)}</p>
              <Sliders>
                {slider(e1, setE1, 'a', 'a₁', 'blue')}
                {slider(e1, setE1, 'b', 'b₁', 'blue')}
                {slider(e1, setE1, 'c', 'c₁', 'blue')}
              </Sliders>
            </div>
            <div>
              <p className={`text-center font-mono text-sm mt-3 ${tones.rose.text}`}>{fmtEq(e2)}</p>
              <Sliders>
                {slider(e2, setE2, 'a', 'a₂', 'rose')}
                {slider(e2, setE2, 'b', 'b₂', 'rose')}
                {slider(e2, setE2, 'c', 'c₂', 'rose')}
              </Sliders>
            </div>
          </div>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'D =', value: num(D), tone: 'violet' },
                { label: 'Dₓ =', value: num(Dx) },
                { label: 'Dᵧ =', value: num(Dy) },
              ]}
            />
          </div>
          {kind === 'one' && (
            <>
              <Formula>
                x = Dₓ/D = {num(Dx)}/{den} = {num(sol!.x)}; &nbsp; y = Dᵧ/D = {num(Dy)}/{den} = {num(sol!.y)}
              </Formula>
              <Note tone="emerald">D ≠ 0 – правите се пресичат: единствено решение {point(sol!)}{inView ? '' : ' (извън чертежа)'}</Note>
            </>
          )}
          {kind === 'none' && <Note tone="rose">D = 0, но Dₓ или Dᵧ ≠ 0 – правите са успоредни: системата няма решение.</Note>}
          {kind === 'all' && <Note tone="amber">D = Dₓ = Dᵧ = 0 – правите съвпадат: безброй много решения.</Note>}
          {kind === 'degenerate' && <Note tone="gray">При a = b = 0 уравнението няма x и y – това вече не е права. Промени коефициентите.</Note>}
        </>
      }
    >
      <EqLine eq={e1} tone="blue" />
      <EqLine eq={e2} tone="rose" dashed={kind === 'all'} />
      {sol && inView && (
        <>
          <PlotDot p={sol} tone="emerald" r={6} />
          <PlotLabel p={sol} dx={10} dy={-14} anchor="start" tone="ink" size={13}>
            {point(sol)}
          </PlotLabel>
        </>
      )}
    </Plot>
  );
}
