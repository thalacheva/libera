import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { useState } from 'react';
import { litPath } from './earthMath';
import { DEG } from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

const CX = 300;
const CY = 175;
const ORBIT_R = 120;
const EARTH_R = 20;
const ARROW = 46;
const SPEED = 0.3; // звездни денонощия в секунда

const REAL_YEAR = 366.2564; // звездни денонощия за една година

export default function SiderealSolarDay() {
  const [tau, setTau] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [exaggerated, setExaggerated] = useState(true);

  // В увеличения режим „годината“ е само 12 денонощия
  const year = exaggerated ? 12 : REAL_YEAR;
  const solarDay = year / (year - 1);

  useAnimationFrame(playing || target !== null, dt => {
    const next = tau + dt * SPEED;
    if (target !== null && next >= target) {
      setTau(target);
      setTarget(null);
      setPlaying(false);
    } else {
      setTau(next);
    }
  });

  const orbitAngle = (2 * Math.PI * tau) / year;
  const ex = CX + ORBIT_R * Math.cos(orbitAngle);
  const ey = CY - ORBIT_R * Math.sin(orbitAngle);
  const spin = Math.PI + 2 * Math.PI * tau;
  const sunAngle = orbitAngle + Math.PI;
  const arrow = {
    x: ex + ARROW * Math.cos(spin),
    y: ey - ARROW * Math.sin(spin),
  };
  const surface = {
    x: ex + EARTH_R * Math.cos(spin),
    y: ey - EARTH_R * Math.sin(spin),
  };

  // Ъгъл между меридиана на наблюдателя и посоката към Слънцето
  const lag = ((((sunAngle - spin) / DEG) % 360) + 360) % 360;
  const starAligned = Math.abs(tau - Math.round(tau)) < 0.002 && tau > 0.01;
  const sunAligned =
    Math.abs(tau / solarDay - Math.round(tau / solarDay)) < 0.002 && tau > 0.01;

  const goTo = (value: number) => {
    setPlaying(false);
    if (value <= tau + 1e-6) return;
    setTarget(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Звездно срещу слънчево денонощие
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Червената стрелка е меридианът на наблюдател – пладне е, когато сочи към
        Слънцето.
      </p>

      <svg viewBox="0 0 600 350" className="w-full h-auto">
        <circle
          cx={CX}
          cy={CY}
          r={ORBIT_R}
          fill="none"
          stroke="rgb(148, 163, 184)"
          strokeDasharray="4,4"
        />
        <circle cx={CX} cy={CY} r="24" fill="rgb(251, 191, 36)" />
        <text
          x={CX}
          y={CY + 42}
          fontSize="12"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Слънце
        </text>

        {/* Далечна звезда – лъчите ѝ са успоредни */}
        <text x="14" y={ey + 6} fontSize="20" fill="rgb(99, 102, 241)">
          ★
        </text>
        <text x="8" y={ey - 14} fontSize="11" fill="rgb(99, 102, 241)">
          далечна звезда
        </text>
        <line
          x1="36"
          y1={ey}
          x2={ex}
          y2={ey}
          stroke="rgb(99, 102, 241)"
          strokeDasharray="6,5"
          opacity={starAligned ? 1 : 0.4}
          strokeWidth={starAligned ? 2.5 : 1.5}
        />
        <line
          x1={ex}
          y1={ey}
          x2={CX}
          y2={CY}
          stroke="rgb(251, 191, 36)"
          strokeDasharray="3,4"
          opacity={sunAligned ? 1 : 0.5}
          strokeWidth={sunAligned ? 2.5 : 1.5}
        />

        {/* Земята */}
        <circle cx={ex} cy={ey} r={EARTH_R} fill="rgb(30, 41, 59)" />
        <path
          d={litPath(
            ex,
            ey,
            EARTH_R,
            Math.cos(sunAngle),
            Math.sin(sunAngle),
            0
          )}
          fill="rgb(59, 130, 246)"
        />
        <line
          x1={ex}
          y1={ey}
          x2={arrow.x}
          y2={arrow.y}
          stroke="rgb(239, 68, 68)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={surface.x} cy={surface.y} r="4" fill="rgb(239, 68, 68)" />

        <path
          d={`M ${CX + ORBIT_R + 22},${CY + 40} A ${ORBIT_R + 22},${ORBIT_R + 22} 0 0,0 ${CX + ORBIT_R + 22},${CY - 40}`}
          fill="none"
          stroke="rgb(148, 163, 184)"
          strokeWidth="1.5"
          markerEnd="url(#orbit-arrow)"
        />
        <defs>
          <marker
            id="orbit-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(148, 163, 184)" />
          </marker>
        </defs>

        {(starAligned || sunAligned) && (
          <text
            x={CX}
            y="335"
            fontSize="15"
            fontWeight="bold"
            textAnchor="middle"
            fill={sunAligned ? 'rgb(217, 119, 6)' : 'rgb(99, 102, 241)'}
          >
            {sunAligned
              ? '☀️ Пладне! Изтече едно слънчево денонощие'
              : '★ Звездата е отново в меридиана – едно звездно денонощие'}
          </text>
        )}
      </svg>

      <div className="flex flex-wrap gap-2 justify-center mt-2">
        <button
          onClick={() => {
            setTarget(null);
            setPlaying(p => !p);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 text-sm"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Пауза' : 'Пусни'}
        </button>
        <button
          onClick={() => goTo(Math.floor(tau + 1e-6) + 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-indigo-400 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700"
        >
          <SkipForward size={14} /> До следващото звездно денонощие
        </button>
        <button
          onClick={() =>
            goTo((Math.floor(tau / solarDay + 1e-6) + 1) * solarDay)
          }
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-amber-400 text-sm hover:bg-amber-50 dark:hover:bg-gray-700"
        >
          <SkipForward size={14} /> До следващото пладне
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setTarget(null);
            setTau(0);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RotateCcw size={14} /> Начало
        </button>
      </div>

      <label className="flex items-center justify-center gap-2 text-sm mt-3">
        <input
          type="checkbox"
          checked={exaggerated}
          onChange={e => {
            setExaggerated(e.target.checked);
            setTau(0);
            setTarget(null);
            setPlaying(false);
          }}
        />
        Увеличено орбитално движение (година = 12 денонощия), за да се вижда
        ефектът
      </label>

      <div className="grid sm:grid-cols-3 gap-2 mt-4 text-center text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Завъртане спрямо звездите
          </div>
          <div className="font-mono font-bold">{(tau * 360).toFixed(0)}°</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Изминат път по орбитата
          </div>
          <div className="font-mono font-bold">
            {((tau * 360) / year).toFixed(1)}°
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Остава до пладне
          </div>
          <div className="font-mono font-bold">
            {lag < 0.05 || lag > 359.95 ? '0°' : `${lag.toFixed(1)}°`}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
        След един пълен оборот (360°) звездата отново е в меридиана, но Земята
        междувременно се е преместила по орбитата и Слънцето „изостава“. В
        действителност за едно денонощие Земята изминава ~1° от орбитата си, а
        за да се завърти с още 1°, ѝ трябват ~4 минути. Затова слънчевото
        денонощие (24h) е по-дълго от звездното (23h 56m 04s).
      </p>
    </div>
  );
}
