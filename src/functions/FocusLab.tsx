import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { num } from './functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from './plot';

const RAYS = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
const TOP = 9;

/** Фокусът на параболата: лъчите, успоредни на оста, се отразяват към една точка. */
export function FocusLab() {
  const [p, setP] = useState(1.5);
  const [mode, setMode] = useState<'dish' | 'lamp'>('dish');
  const a = 1 / (4 * p);
  const f = (x: number) => a * x * x;
  const F = { x: 0, y: p };

  return (
    <Plot
      x={[-6, 6]}
      y={[-1, TOP]}
      hint="Мести фокусното разстояние. Всеки лъч, успореден на оста, след отразяване минава през фокуса F – независимо къде удря параболата."
      readout={
        <>
          <Buttons>
            <DiagramButton active={mode === 'dish'} onClick={() => setMode('dish')}>
              📡 сателитна чиния
            </DiagramButton>
            <DiagramButton active={mode === 'lamp'} onClick={() => setMode('lamp')}>
              🔦 фар на кола
            </DiagramButton>
          </Buttons>
          <Sliders>
            <Slider label="p" value={p} onChange={setP} min={0.5} max={4} step={0.25} tone="rose" />
          </Sliders>
          <Formula>
            y = x² / (4p) = {num(a, 3)}x², фокус F(0; {num(p)})
          </Formula>
          <Note tone="rose">
            {mode === 'dish'
              ? 'Сигналът от далечния спътник идва в успоредни лъчи и се събира във фокуса, където е приемникът.'
              : 'Лампата е във фокуса: отразените лъчи излизат успоредно – силен сноп, който не се разсейва.'}
          </Note>
        </>
      }
    >
      <Curve f={f} tone="blue" />
      {RAYS.map(x => {
        const P = { x, y: f(x) };
        if (P.y > TOP) return null;
        return (
          <g key={x}>
            <PlotLine p={{ x, y: TOP }} q={P} tone="amber" width={1.5} dashed={mode === 'lamp'} />
            <PlotLine p={P} q={F} tone="amber" width={1.5} dashed={mode === 'dish'} />
          </g>
        );
      })}
      <PlotLine p={{ x: 0, y: -1 }} q={{ x: 0, y: TOP }} tone="gray" width={1} dashed />
      <PlotDot p={F} tone="rose" r={6} />
      <PlotLabel p={F} dx={10} dy={-8} anchor="start" tone="rose">
        F
      </PlotLabel>
    </Plot>
  );
}
