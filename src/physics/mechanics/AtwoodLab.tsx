import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const PULLEY = { x: 240, y: 48, r: 40 };
const REST = 160; // височина на горния край на телата в началото
const PX = 90; // пиксела на метър
const LIMIT = 1; // докъде се движат, m
const K = 1; // пиксела на нютон

type State = { y: number; v: number };

/** Машина на Атууд: две тела, свързани с въже през макара. */
export default function AtwoodLab() {
  const [m1, setM1] = useState(3);
  const [m2, setM2] = useState(2);
  const a = ((m1 - m2) * G) / (m1 + m2);
  const T = (2 * m1 * m2 * G) / (m1 + m2);

  // y – колко е слязло лявото тяло (дясното се е качило със същото)
  const step = (s: State, dt: number): State => (Math.abs(s.y) >= LIMIT ? s : { y: s.y + s.v * dt + (a * dt * dt) / 2, v: s.v + a * dt });
  const sim = useSimulation<State>(() => ({ y: 0, v: 0 }), step);
  const restart = () => sim.reset({ y: 0, v: 0 });
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    restart();
  };

  const bodies = [
    { m: m1, x: PULLEY.x - PULLEY.r, top: REST + sim.state.y * PX, side: -1, tone: 'blue' as const, name: 'm₁' },
    { m: m2, x: PULLEY.x + PULLEY.r, top: REST - sim.state.y * PX, side: 1, tone: 'rose' as const, name: 'm₂' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 330">
        <line x1={PULLEY.x - 60} y1={6} x2={PULLEY.x + 60} y2={6} className="stroke-gray-500" strokeWidth="4" />
        <line x1={PULLEY.x} y1={6} x2={PULLEY.x} y2={PULLEY.y} className="stroke-gray-500" strokeWidth="3" />
        <path d={`M ${PULLEY.x - PULLEY.r} ${PULLEY.y} A ${PULLEY.r} ${PULLEY.r} 0 0 1 ${PULLEY.x + PULLEY.r} ${PULLEY.y}`} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" />
        <circle cx={PULLEY.x} cy={PULLEY.y} r={PULLEY.r - 4} className="fill-gray-200 stroke-gray-500 dark:fill-gray-700" strokeWidth="2" />
        <circle cx={PULLEY.x} cy={PULLEY.y} r={4} className="fill-gray-500" />
        {bodies.map(b => {
          const side = 22 + 6 * Math.sqrt(b.m);
          const c = { x: b.x, y: b.top + side / 2 };
          const ax = b.x + b.side * (side / 2 + 14);
          return (
            <g key={b.name}>
              <line x1={b.x} y1={PULLEY.y} x2={b.x} y2={b.top} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" />
              <rect x={b.x - side / 2} y={b.top} width={side} height={side} rx={3} className={b.tone === 'blue' ? 'fill-blue-200 stroke-blue-600 dark:fill-blue-900' : 'fill-rose-200 stroke-rose-600 dark:fill-rose-900'} strokeWidth="1.5" />
              <Label p={c} size={12} tone={b.tone}>
                {b.name}
              </Label>
              <Arrow from={{ x: ax, y: c.y }} to={{ x: ax, y: c.y - T * K }} tone="emerald" width={2.5} label="T" />
              <Arrow from={{ x: ax, y: c.y }} to={{ x: ax, y: c.y + b.m * G * K }} tone="violet" width={2.5} label={b.side < 0 ? 'm₁g' : 'm₂g'} />
            </g>
          );
        })}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={sim.time} />
      <Sliders>
        <Slider label="m₁, kg" value={m1} onChange={change(setM1)} min={0.5} max={5} step={0.1} tone="blue" />
        <Slider label="m₂, kg" value={m2} onChange={change(setM2)} min={0.5} max={5} step={0.1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'a =', value: `${fmtNum(Math.abs(a), 2)} m/s²` },
            { label: 'T =', value: `${fmtNum(T, 1)} N`, tone: 'emerald' },
            { label: 'm₁g =', value: `${fmtNum(m1 * G, 1)} N`, tone: 'blue' },
            { label: 'm₂g =', value: `${fmtNum(m2 * G, 1)} N`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        {Math.abs(m1 - m2) < 1e-9
          ? 'Равни маси: силите се уравновесяват и телата не се ускоряват – ако ги побутнеш, се движат равномерно.'
          : `Опънът е между двете тегла: ${fmtNum(Math.min(m1, m2) * G, 1)} N < T < ${fmtNum(Math.max(m1, m2) * G, 1)} N. Ускорението е g · (m₁ − m₂)/(m₁ + m₂) – много по-малко от g.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Въжето и макарата са леки, а триенето пренебрегваме. Джордж Атууд построява такава машина през 1784 г., за да „забави“ падането и да
        може да го измери – идеята е същата като наклона на Галилей.
      </p>
    </div>
  );
}
