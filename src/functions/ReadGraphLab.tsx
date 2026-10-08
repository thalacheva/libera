import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { num } from './functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from './plot';

// Температура през денонощието: минимум −4 °C в 4 ч, максимум 10 °C в 16 ч
const T = (t: number) => 3 - 7 * Math.cos((2 * Math.PI * (t - 4)) / 24);
const T_MIN = 4;
const T_MAX = 16;
// Нули: cos(...) = 3/7
const phi = Math.acos(3 / 7);
const ZEROS = [4 + (24 * phi) / (2 * Math.PI), 4 + 24 - (24 * phi) / (2 * Math.PI)];

type Show = 'zeros' | 'up' | 'down' | 'pos' | 'extr';
const OPTIONS: { k: Show; name: string }[] = [
  { k: 'zeros', name: 'нули' },
  { k: 'pos', name: 'T > 0' },
  { k: 'up', name: 'растене' },
  { k: 'down', name: 'намаляване' },
  { k: 'extr', name: 'най-голяма / най-малка' },
];

const hm = (t: number) => {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${m === 60 ? h + 1 : h}:${String(m === 60 ? 0 : m).padStart(2, '0')}`;
};

/** Четене на свойствата на функция от графиката ѝ. */
export function ReadGraphLab() {
  const [t, setT] = useState(10);
  const [show, setShow] = useState<Show>('zeros');
  const rising = t > T_MIN && t < T_MAX;

  return (
    <Plot
      x={[-1, 25]}
      y={[-7, 13]}
      hint="Графиката показва температурата през едно денонощие (x – часът, y – °C). Избери свойство и виж къде се вижда на графиката."
      readout={
        <>
          <Buttons>
            {OPTIONS.map(o => (
              <DiagramButton key={o.k} active={o.k === show} onClick={() => setShow(o.k)}>
                {o.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="час" value={t} onChange={setT} min={0} max={24} step={0.25} tone="rose" />
          </Sliders>
          <Readout
            items={[
              { label: 'в', value: hm(t), tone: 'rose' },
              { label: 'T =', value: `${num(T(t), 1)} °C`, tone: 'blue' },
              { label: 'в момента', value: rising ? 'затопля се ↗' : 'захладнява ↘', tone: rising ? 'emerald' : 'violet' },
            ]}
          />
          <Note tone="blue">
            {show === 'zeros' && `Нулите са моментите, в които T = 0 °C: около ${hm(ZEROS[0])} и ${hm(ZEROS[1])} – там графиката пресича оста.`}
            {show === 'pos' && `Функцията е положителна (над оста) от ${hm(ZEROS[0])} до ${hm(ZEROS[1])} и отрицателна през останалото време.`}
            {show === 'up' && `Функцията расте от 4:00 до 16:00 – колкото по-късно, толкова по-топло.`}
            {show === 'down' && 'Функцията намалява от 0:00 до 4:00 и от 16:00 до 24:00.'}
            {show === 'extr' && 'Най-малката стойност е −4 °C (в 4:00), най-голямата – 10 °C (в 16:00).'}
          </Note>
        </>
      }
    >
      {show === 'pos' && <PlotLine p={{ x: ZEROS[0], y: 0 }} q={{ x: ZEROS[1], y: 0 }} tone="emerald" width={7} />}
      {show === 'up' && <PlotLine p={{ x: T_MIN, y: 0 }} q={{ x: T_MAX, y: 0 }} tone="emerald" width={7} />}
      {show === 'down' && (
        <>
          <PlotLine p={{ x: 0, y: 0 }} q={{ x: T_MIN, y: 0 }} tone="violet" width={7} />
          <PlotLine p={{ x: T_MAX, y: 0 }} q={{ x: 24, y: 0 }} tone="violet" width={7} />
        </>
      )}
      <Curve f={T} tone="blue" from={0} to={24} />
      {show === 'up' && <Curve f={T} tone="emerald" from={T_MIN} to={T_MAX} width={5} />}
      {show === 'down' && (
        <>
          <Curve f={T} tone="violet" from={0} to={T_MIN} width={5} />
          <Curve f={T} tone="violet" from={T_MAX} to={24} width={5} />
        </>
      )}
      {show === 'zeros' &&
        ZEROS.map(z => (
          <g key={z}>
            <PlotDot p={{ x: z, y: 0 }} tone="emerald" r={6} />
            <PlotLabel p={{ x: z, y: 0 }} dy={18} tone="emerald" size={12}>
              {hm(z)}
            </PlotLabel>
          </g>
        ))}
      {show === 'extr' && (
        <>
          <PlotDot p={{ x: T_MIN, y: T(T_MIN) }} tone="violet" r={6} />
          <PlotLabel p={{ x: T_MIN, y: T(T_MIN) }} dy={18} tone="violet" size={12}>
            min −4 °C
          </PlotLabel>
          <PlotDot p={{ x: T_MAX, y: T(T_MAX) }} tone="rose" r={6} />
          <PlotLabel p={{ x: T_MAX, y: T(T_MAX) }} dy={-12} tone="rose" size={12}>
            max 10 °C
          </PlotLabel>
        </>
      )}
      <PlotLine p={{ x: t, y: 0 }} q={{ x: t, y: T(t) }} tone="rose" width={1.5} dashed />
      <PlotDot p={{ x: t, y: T(t) }} tone="rose" />
    </Plot>
  );
}
