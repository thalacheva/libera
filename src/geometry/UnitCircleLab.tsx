import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotDot, PlotLabel, PlotLine, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from './diagram';

// Точните стойности за ъглите, кратни на 30° и 45°
const EXACT: Record<number, [string, string]> = {
  0: ['0', '1'],
  30: ['1/2', '√3/2'],
  45: ['√2/2', '√2/2'],
  60: ['√3/2', '1/2'],
  90: ['1', '0'],
};

/** Точните sin и cos на специален ъгъл в кой да е квадрант (или null). */
function exact(deg: number): [string, string] | null {
  const d = ((deg % 360) + 360) % 360;
  const q = Math.floor(d / 90);
  const r = d - 90 * q;
  if (!(r in EXACT)) return null;
  const [s, c] = EXACT[r];
  // Завъртане на 90° · q: (cos, sin) → (−sin, cos)
  const neg = (v: string) => (v === '0' ? '0' : v.startsWith('−') ? v.slice(1) : `−${v}`);
  let sin = s;
  let cos = c;
  for (let i = 0; i < q; i++) [sin, cos] = [cos, neg(sin)];
  return [sin, cos];
}

const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 270, 330];
const CIRCLE = Array.from({ length: 121 }, (_, i) => ({ x: Math.cos((i / 120) * 2 * Math.PI), y: Math.sin((i / 120) * 2 * Math.PI) }));

/** Единичната окръжност: cos α и sin α са координатите на точката. */
export function UnitCircleLab() {
  const [deg, setDeg] = useState(30);
  const [mirror, setMirror] = useState(false);

  const t = (deg * Math.PI) / 180;
  const P = { x: Math.cos(t), y: Math.sin(t) };
  const M = { x: -P.x, y: P.y }; // точката на ъгъла 180° − α
  const ex = exact(deg);
  const tgUndefined = Math.abs(P.x) < 1e-9;
  const arc = Array.from({ length: 41 }, (_, i) => ({ x: 0.22 * Math.cos((t * i) / 40), y: 0.22 * Math.sin((t * i) / 40) }));

  return (
    <Plot
      x={[-1.6, 1.6]}
      y={[-1.25, 1.25]}
      hint="Точката P е на окръжност с радиус 1 и център началото. Ъгълът α се отчита от положителната част на оста Ox обратно на часовниковата стрелка. Тогава cos α е абсцисата на P, а sin α – ординатата ѝ."
      readout={
        <>
          <Sliders>
            <Slider label="α, °" value={deg} onChange={setDeg} min={0} max={360} step={1} tone="amber" />
          </Sliders>
          <Buttons>
            {SPECIAL.map(s => (
              <DiagramButton key={s} active={s === deg} onClick={() => setDeg(s)}>
                {s}°
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'sin α =', value: ex ? `${ex[0]} ≈ ${num(P.y, 3)}` : num(P.y, 3), tone: 'rose' },
                { label: 'cos α =', value: ex ? `${ex[1]} ≈ ${num(P.x, 3)}` : num(P.x, 3), tone: 'blue' },
                { label: 'tg α =', value: tgUndefined ? 'не съществува' : num(P.y / P.x, 3), tone: 'violet' },
              ]}
            />
          </div>
          <label className="flex justify-center items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} className="accent-emerald-500" />
            покажи и ъгъла 180° − α
          </label>
          {mirror && (
            <Note tone="emerald">
              Точките са симетрични спрямо Oy: sin(180° − α) = sin α, а cos(180° − α) = −cos α.
            </Note>
          )}
        </>
      }
    >
      <PlotPolyline points={CIRCLE} tone="gray" width={2} />
      <PlotPolyline points={arc} tone="amber" width={2.5} />
      <PlotLine p={{ x: P.x, y: 0 }} q={P} tone="rose" width={3.5} />
      <PlotLine p={{ x: 0, y: 0 }} q={{ x: P.x, y: 0 }} tone="blue" width={3.5} />
      <PlotLine p={{ x: 0, y: 0 }} q={P} tone="gray" width={2} />
      {mirror && (
        <>
          <PlotLine p={{ x: 0, y: 0 }} q={M} tone="emerald" width={2} dashed />
          <PlotLine p={P} q={M} tone="emerald" width={1.5} dashed />
          <PlotDot p={M} tone="emerald" r={6} />
          <PlotLabel p={M} dx={M.x > 0 ? 12 : -12} dy={-12} anchor={M.x > 0 ? 'start' : 'end'} tone="emerald" size={13}>
            {`${180 - deg}°`}
          </PlotLabel>
        </>
      )}
      <PlotDot p={P} tone="amber" r={7} />
      <PlotLabel p={P} dx={P.x >= 0 ? 12 : -12} dy={P.y >= 0 ? -12 : 14} anchor={P.x >= 0 ? 'start' : 'end'} tone="ink" size={14}>
        P
      </PlotLabel>
      <PlotLabel p={{ x: P.x / 2, y: 0 }} dy={P.y >= 0 ? 14 : -14} tone="blue" size={13}>
        cos α
      </PlotLabel>
      <PlotLabel p={{ x: P.x, y: P.y / 2 }} dx={P.x >= 0 ? 8 : -8} anchor={P.x >= 0 ? 'start' : 'end'} tone="rose" size={13}>
        sin α
      </PlotLabel>
    </Plot>
  );
}
