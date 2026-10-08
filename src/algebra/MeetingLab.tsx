import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';

const W = 600;
const X0 = 50;
const X1 = 550;
const ROAD_Y = 110;

type Mode = 'toward' | 'chase';

const r2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => r2(v).toLocaleString('bg-BG');

const exact = (t: number) => Number.isInteger(Math.round(t * 1e6) / 1e6);

function hm(t: number) {
  const h = Math.floor(t + 1e-9);
  const m = Math.round((t - h) * 60);
  return m === 60 ? `${h + 1} ч` : m === 0 ? `${h} ч` : h === 0 ? `${m} мин` : `${h} ч ${m} мин`;
}

export default function MeetingLab() {
  const [mode, setMode] = useState<Mode>('toward');
  const [d, setD] = useState(60);
  const [v1, setV1] = useState(20);
  const [v2, setV2] = useState(10);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Време на срещата
  const rel = mode === 'toward' ? v1 + v2 : v1 - v2;
  const tMeet = rel > 0 ? d / rel : null;
  const tMax = tMeet ? Math.min(tMeet * 1.25, 12) : 6;
  useAnimationFrame(playing, dt =>
    setT(v => {
      const n = v + dt * (tMax / 6);
      if (n >= tMax) {
        setPlaying(false);
        return tMax;
      }
      return n;
    }),
  );

  // Положения (km от A)
  const p1 = v1 * t;
  const p2 = mode === 'toward' ? d - v2 * t : d + v2 * t;
  const span = mode === 'toward' ? d : Math.max(d + v2 * tMax, v1 * tMax, d * 1.2);
  const px = (km: number) => X0 + (Math.min(Math.max(km, 0), span) / span) * (X1 - X0);
  const met = tMeet !== null && t >= tMeet - 1e-6;
  const meetKm = tMeet !== null ? v1 * tMeet : null;

  const reset = () => {
    setT(0);
    setPlaying(false);
  };
  const slider = (label: string, value: number, set: (v: number) => void, min: number, max: number, step: number, unit: string) => (
    <label className="text-sm font-semibold">
      {label} = {value} {unit}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          set(Number(e.target.value));
          reset();
        }}
        className="w-full"
      />
    </label>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🚴 Задачи за движение</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Двама велосипедисти тръгват едновременно. Кога ще се срещнат? Пусни движението и виж как уравнението „предсказва“ срещата.
      </p>

      <div className="flex justify-center gap-2 mb-3">
        {(['toward', 'chase'] as const).map(m => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              m === mode ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'toward' ? '→ ← един срещу друг' : '→ → единият гони другия'}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} 190`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <rect x={X0 - 10} y={ROAD_Y - 14} width={X1 - X0 + 20} height={28} rx={6} fill="currentColor" opacity="0.08" />
        <line x1={X0} x2={X1} y1={ROAD_Y} y2={ROAD_Y} stroke="currentColor" strokeOpacity="0.3" strokeDasharray="10 8" />
        {/* Градовете */}
        <g>
          <line x1={px(0)} x2={px(0)} y1={ROAD_Y - 30} y2={ROAD_Y + 20} stroke="currentColor" strokeOpacity="0.5" />
          <text x={px(0)} y={ROAD_Y - 36} fontSize="13" fontWeight="700" textAnchor="middle" fill="currentColor">
            A
          </text>
          <line x1={px(d)} x2={px(d)} y1={ROAD_Y - 30} y2={ROAD_Y + 20} stroke="currentColor" strokeOpacity="0.5" />
          <text x={px(d)} y={ROAD_Y - 36} fontSize="13" fontWeight="700" textAnchor="middle" fill="currentColor">
            B
          </text>
          <text x={(px(0) + px(d)) / 2} y={ROAD_Y + 38} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.6">
            AB = {d} km
          </text>
        </g>
        {/* Мястото на срещата */}
        {meetKm !== null && meetKm <= span && (
          <g opacity={met ? 1 : 0.35}>
            <line x1={px(meetKm)} x2={px(meetKm)} y1={ROAD_Y - 20} y2={ROAD_Y + 52} stroke="#ef4444" strokeDasharray="3 3" />
            <text x={px(meetKm)} y={ROAD_Y + 66} fontSize="11" textAnchor="middle" fill="#ef4444" fontWeight="700">
              среща: {fmt(meetKm)} km от A
            </text>
          </g>
        )}
        {/* Велосипедистите */}
        <g transform={`translate(${px(p1)} ${ROAD_Y - 6})`}>
          <circle r={9} fill="#2563eb" />
          <text y={4} fontSize="10" textAnchor="middle" fill="white" fontWeight="700">
            1
          </text>
        </g>
        <g transform={`translate(${px(p2)} ${ROAD_Y + 6})`}>
          <circle r={9} fill="#f59e0b" />
          <text y={4} fontSize="10" textAnchor="middle" fill="white" fontWeight="700">
            2
          </text>
        </g>
        <text x={X0} y={22} fontSize="13" fill="currentColor">
          t = {hm(t)}
        </text>
        <text x={X1} y={22} fontSize="12" textAnchor="end" fill="currentColor" opacity="0.7">
          изминали: {fmt(p1)} km и {fmt(v2 * t)} km
        </text>
        {met && (
          <text x={W / 2} y={22} fontSize="14" textAnchor="middle" fill="#ef4444" fontWeight="700">
            Срещнаха се! 🎉
          </text>
        )}
      </svg>

      <div className="grid sm:grid-cols-3 gap-4 mt-2">
        {slider('AB', d, setD, 10, 120, 5, 'km')}
        {slider('v₁', v1, setV1, 5, 40, 1, 'km/h')}
        {slider('v₂', v2, setV2, 5, 40, 1, 'km/h')}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => {
            if (t >= tMax) setT(0);
            setPlaying(p => !p);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? 'Пауза' : 'Тръгвайте!'}
        </button>
        <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <RotateCcw size={16} /> Отначало
        </button>
      </div>

      <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100 space-y-1">
        {mode === 'toward' ? (
          <>
            <p>Двамата заедно изминават цялото разстояние:</p>
            <p>
              {v1}t + {v2}t = {d}
            </p>
            <p>
              {v1 + v2}t = {d} ⇒ t = {d}/{v1 + v2} = {fmt(d / (v1 + v2))} ч{exact(d / (v1 + v2)) ? '' : ` ≈ ${hm(d / (v1 + v2))}`}
            </p>
          </>
        ) : (
          <>
            <p>Когато първият настигне втория, е изминал {d} km повече:</p>
            <p>
              {v1}t = {d} + {v2}t
            </p>
            {rel > 0 ? (
              <p>
                {rel}t = {d} ⇒ t = {d}/{rel} = {fmt(d / rel)} ч{exact(d / rel) ? '' : ` ≈ ${hm(d / rel)}`}
              </p>
            ) : (
              <p className="text-red-600 dark:text-red-400">
                {rel === 0 ? '0 · t' : `${rel}t`} = {d} ⇒ {rel === 0 ? 'няма решение' : 't < 0'} – първият никога няма да настигне втория!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
