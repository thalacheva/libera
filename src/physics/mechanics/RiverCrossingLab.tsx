import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const WIDTH = 60; // ширина на реката, m
const TOP = 40;
const BOTTOM = 220;
const PX = (BOTTOM - TOP) / WIDTH; // пиксела на метър
const START_X = 150;

/** Лодка пресича река: скоростта спрямо брега е сбор от скоростта спрямо водата и скоростта на течението. */
export default function RiverCrossingLab() {
  const [u, setU] = useState(3);
  const [w, setW] = useState(1.5);
  const [deg, setDeg] = useState(0);
  const theta = (deg * Math.PI) / 180;

  // Ос x – по течението, ос y – към отсрещния бряг. Ъгъл θ > 0 – лодката е насочена срещу течението
  const vx = w - u * Math.sin(theta);
  const vy = u * Math.cos(theta);
  const T = WIDTH / vy;
  const drift = vx * T;
  const speed = Math.hypot(vx, vy);
  const straight = w < u ? (Math.asin(w / u) * 180) / Math.PI : null;

  const step = (s: { t: number }, dt: number) => ({ t: Math.min(s.t + dt, T) });
  const sim = useSimulation(() => ({ t: 0 }), step, { dt: 1 / 120, speed: 4 });
  const t = Math.min(sim.state.t, T);
  const boat = { x: START_X + vx * t * PX, y: BOTTOM - vy * t * PX };
  const restart = () => sim.reset({ t: 0 });
  const set = (f: (n: number) => void) => (n: number) => {
    f(n);
    restart();
  };

  // Векторен триъгълник в началото: 1 m/s = 18 px
  const V = 18;
  const o = { x: START_X, y: BOTTOM };
  const uEnd = { x: o.x - u * Math.sin(theta) * V, y: o.y - u * Math.cos(theta) * V };
  const end = { x: o.x + vx * V, y: o.y - vy * V };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={deg === 0} onClick={() => {
            setDeg(0);
            restart();
          }}>
          най-бързо
        </DiagramButton>
        <DiagramButton active={straight !== null && deg === Math.round(straight)} onClick={() => {
            if (straight === null) return;
            setDeg(Math.round(straight));
            restart();
          }}>
          най-кратко
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 260">
        <rect x={0} y={TOP} width={480} height={BOTTOM - TOP} className="fill-sky-100 dark:fill-sky-900/40" />
        <rect x={0} y={TOP - 14} width={480} height={14} className="fill-emerald-200 dark:fill-emerald-900/50" />
        <rect x={0} y={BOTTOM} width={480} height={14} className="fill-emerald-200 dark:fill-emerald-900/50" />
        {[70, 130, 190].map(y =>
          [40, 200, 360].map(x => (
            <path key={`${x}-${y}`} d={`M ${x} ${y} q 10 -6 20 0 t 20 0`} fill="none" className="stroke-sky-400/70" strokeWidth="1.5" />
          )),
        )}
        <Label p={{ x: 470, y: TOP + 12 }} size={11} anchor="end" tone="amber">
          течение →
        </Label>
        <line x1={START_X} y1={BOTTOM} x2={START_X} y2={TOP} className="stroke-gray-400" strokeDasharray="4 4" />
        <circle cx={START_X} cy={TOP} r={4} className="fill-gray-500" />
        <g>
          <line x1={START_X} y1={BOTTOM} x2={START_X + drift * PX} y2={TOP} className="stroke-violet-500" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx={START_X + drift * PX} cy={TOP} r={5} className="fill-violet-500" />
        </g>
        <Arrow from={o} to={uEnd} tone="blue" width={3} label="u" />
        <Arrow from={uEnd} to={end} tone="amber" width={3} label="w" />
        <Arrow from={o} to={end} tone="violet" width={3} label="v" />
        <text x={boat.x} y={boat.y} fontSize={22} textAnchor="middle" dominantBaseline="central">
          🚣
        </text>
        <Label p={{ x: 12, y: (TOP + BOTTOM) / 2 }} size={11} anchor="start">
          {`${WIDTH} m`}
        </Label>
        {Math.abs(drift) > 0.5 && (
          <Label p={{ x: Math.max(30, Math.min(450, START_X + (drift * PX) / 2)), y: TOP - 22 }} size={11} tone="violet">
            {`отнасяне ${fmtNum(Math.abs(drift), 1)} m ${drift > 0 ? 'надолу' : 'нагоре'} по течението`}
          </Label>
        )}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={t} />
      <Sliders>
        <Slider label="u, m/s" value={u} onChange={set(setU)} min={1} max={6} step={0.5} tone="blue" />
        <Slider label="w, m/s" value={w} onChange={set(setW)} min={0} max={4} step={0.5} tone="amber" />
        <Slider label="θ, °" value={deg} onChange={set(setDeg)} min={-60} max={75} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'v =', value: `${fmtNum(speed, 2)} m/s`, tone: 'violet' },
            { label: 'време', value: `${fmtNum(T, 1)} s` },
            { label: 'отнасяне', value: `${fmtNum(drift, 1)} m` },
          ]}
        />
      </div>
      <Note tone="gray">
        {straight === null
          ? 'Течението е по-бързо от лодката – тя не може да стигне точно отсреща, както и да се насочи.'
          : `Най-бързо: насочи лодката право към брега (θ = 0°). Точно отсреща: θ ≈ ${fmtNum(straight, 1)}° срещу течението – тогава пътуването е по-дълго.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Синята стрелка u е скоростта на лодката спрямо водата (θ е ъгълът ѝ от перпендикуляра, положителен – срещу течението), жълтата w е
        скоростта на течението, а лилавата v = u + w – скоростта спрямо брега. Времето за пресичане зависи само от компонентата на v към
        отсрещния бряг. Анимацията е ускорена 4 пъти.
      </p>
    </div>
  );
}
