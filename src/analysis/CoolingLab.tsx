import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';

const DRINK = 60;
const T_MAX = 60;
const C = { left: 44, right: 464, top: 16, bottom: 214 };
const cx = (t: number) => C.left + (t / T_MAX) * (C.right - C.left);
const cy = (T: number) => C.bottom - (T / 100) * (C.bottom - C.top);

/** Законът на Нютон за изстиването: T′ = −k(T − Tₛ) ⇒ T(t) = Tₛ + (T₀ − Tₛ)·e^(−kt). */
export default function CoolingLab() {
  const [T0, setT0] = useState(90);
  const [room, setRoom] = useState(20);
  const [k, setK] = useState(0.05);
  const T = (t: number) => room + (T0 - room) * Math.exp(-k * t);
  // Кога кафето стига 60 °C – само ако стаята е по-хладна
  const tDrink = T0 > DRINK && room < DRINK ? Math.log((T0 - room) / (DRINK - room)) / k : null;

  const path = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * T_MAX;
    return `${i ? 'L' : 'M'} ${cx(t).toFixed(1)} ${cy(T(t)).toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 250">
        {[0, 20, 40, 60, 80, 100].map(v => (
          <g key={v}>
            <line x1={C.left} y1={cy(v)} x2={C.right} y2={cy(v)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: C.left - 6, y: cy(v) }} size={10} anchor="end">
              {`${v}°`}
            </Label>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50, 60].map(t => (
          <Label key={t} p={{ x: cx(t), y: C.bottom + 13 }} size={10}>
            {String(t)}
          </Label>
        ))}
        <Label p={{ x: C.right, y: C.bottom + 26 }} size={11} anchor="end">
          минути
        </Label>
        <g className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5">
          <line x1={C.left} y1={C.bottom} x2={C.right} y2={C.bottom} />
          <line x1={C.left} y1={C.bottom} x2={C.left} y2={C.top} />
        </g>
        <line x1={C.left} y1={cy(room)} x2={C.right} y2={cy(room)} className="stroke-sky-500" strokeDasharray="6 4" strokeWidth="1.5" />
        <Label p={{ x: C.left + 8, y: cy(room) + (room > 8 ? 11 : -9) }} tone="blue" size={11} anchor="start">
          {`стая ${num(room)}°`}
        </Label>
        <line x1={C.left} y1={cy(DRINK)} x2={C.right} y2={cy(DRINK)} className="stroke-amber-500" strokeDasharray="3 4" strokeWidth="1.2" />
        <path d={path} fill="none" className="stroke-rose-500" strokeWidth="3" />
        {tDrink !== null && tDrink <= T_MAX && (
          <>
            <line x1={cx(tDrink)} y1={cy(DRINK)} x2={cx(tDrink)} y2={C.bottom} className="stroke-amber-500" strokeDasharray="3 4" strokeWidth="1.2" />
            <circle cx={cx(tDrink)} cy={cy(DRINK)} r={6} className="fill-amber-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
          </>
        )}
      </ZoomingSvg>

      <Sliders>
        <Slider label="T₀" value={T0} onChange={setT0} min={40} max={100} step={1} tone="rose" />
        <Slider label="Tₛ" value={room} onChange={setRoom} min={0} max={35} step={1} tone="blue" />
        <Slider label="k" value={k} onChange={setK} min={0.01} max={0.2} step={0.01} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'T(10) =', value: `${num(T(10), 1)}°`, tone: 'rose' },
            { label: "T′(0) =", value: `${num(-k * (T0 - room), 1)}° за минута` },
            { label: 'до 60°:', value: tDrink === null ? '—' : `${num(tDrink, 1)} мин`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">
        {tDrink === null
          ? T0 <= DRINK
            ? 'Кафето вече е под 60°.'
            : 'Стаята е по-топла от 60° – кафето никога няма да изстине дотам.'
          : 'Колкото по-голяма е разликата със стаята, толкова по-бързо изстива – затова кривата е стръмна в началото.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 T₀ – началната температура, Tₛ – температурата на стаята, k – колко бързо изстива (зависи от чашата). Температурата клони към тази на стаята, но никога не я достига точно.
      </p>
    </div>
  );
}
