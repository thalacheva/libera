import { useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';

const W = 600;
const H = 320;
const X0 = 40;
const Y0 = 290; // земята
const S = 60; // px на метър
const G = 9.81;
const H0 = 2; // височина на изхвърляне, m
const RIM = 3.05; // височина на коша, m

const fmt = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('bg-BG');
const sgn = (v: number, d = 2) => (v < 0 ? ` − ${fmt(-v, d)}` : ` + ${fmt(v, d)}`);

const SHOTS = [
  { name: 'наказателен (4,2 m)', d: 4.2 },
  { name: 'тройка (6,75 m)', d: 6.75 },
  { name: 'от центъра (8,5 m)', d: 8.5 },
];

export function ThrowLab() {
  const [v, setV] = useState(8);
  const [deg, setDeg] = useState(50);
  const [si, setSi] = useState(0);
  const [t, setT] = useState<number | null>(null);
  const dist = SHOTS[si].d;

  const th = (deg * Math.PI) / 180;
  const vx = v * Math.cos(th);
  // y(x) = a x² + b x + c
  const a = -G / (2 * vx * vx);
  const b = Math.tan(th);
  const c = H0;
  const y = (x: number) => a * x * x + b * x + c;
  const xv = -b / (2 * a);
  const yv = y(xv);
  const yAtRim = y(dist);
  const slope = 2 * a * dist + b;
  const hit = Math.abs(yAtRim - RIM) < 0.12 && slope < 0;
  const xLand = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

  const tEnd = xLand / vx;
  useAnimationFrame(t !== null && t < tEnd, dt => setT(p => Math.min((p ?? 0) + dt, tEnd)));
  const xBall = t === null ? 0 : vx * t;

  const px = (x: number) => X0 + x * S;
  const py = (yy: number) => Y0 - yy * S;
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = (i / 120) * Math.min(xLand, 9.3);
    return `${px(x)},${py(Math.max(y(x), 0))}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🏀 Вкарай коша!</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Топката лети по парабола. Избери скорост и ъгъл така, че параболата да мине през коша – отгоре надолу.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        {/* Мрежа на всеки метър */}
        {Array.from({ length: 10 }, (_, i) => i).map(m => (
          <g key={m}>
            <line x1={px(m)} x2={px(m)} y1={py(4.6)} y2={Y0} stroke="currentColor" opacity="0.06" />
            <text x={px(m)} y={Y0 + 14} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.55">
              {m}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map(m => (
          <g key={m}>
            <line x1={X0} x2={W - 10} y1={py(m)} y2={py(m)} stroke="currentColor" opacity="0.06" />
            <text x={X0 - 6} y={py(m) + 3} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.55">
              {m}
            </text>
          </g>
        ))}
        <line x1={0} x2={W} y1={Y0} y2={Y0} stroke="currentColor" strokeWidth="2" />
        <text x={W - 10} y={Y0 + 14} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.6">
          x, m
        </text>
        {/* Играчът */}
        <circle cx={px(0)} cy={py(1.75)} r={7} fill="currentColor" opacity="0.5" />
        <line x1={px(0)} x2={px(0)} y1={py(1.65)} y2={py(0.9)} stroke="currentColor" strokeWidth="5" opacity="0.5" strokeLinecap="round" />
        <line x1={px(0)} x2={px(-0.15)} y1={py(0.9)} y2={Y0} stroke="currentColor" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        <line x1={px(0)} x2={px(0.15)} y1={py(0.9)} y2={Y0} stroke="currentColor" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        {/* Кошът */}
        <line x1={px(dist + 0.4)} x2={px(dist + 0.4)} y1={py(RIM - 0.15)} y2={py(RIM + 1.05)} stroke="currentColor" strokeWidth="4" />
        <line x1={px(dist + 0.55)} x2={px(dist + 0.55)} y1={py(RIM + 0.9)} y2={Y0} stroke="currentColor" strokeWidth="3" opacity="0.4" />
        <line x1={px(dist - 0.23)} x2={px(dist + 0.23)} y1={py(RIM)} y2={py(RIM)} stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
        <path d={`M ${px(dist - 0.2)} ${py(RIM)} L ${px(dist - 0.12)} ${py(RIM - 0.4)} L ${px(dist + 0.12)} ${py(RIM - 0.4)} L ${px(dist + 0.2)} ${py(RIM)}`} fill="none" stroke="currentColor" opacity="0.4" />
        {/* Траектория и връх */}
        <polyline points={pts} fill="none" stroke={hit ? '#16a34a' : '#ea580c'} strokeWidth="2.5" strokeDasharray={t === null ? '6 5' : undefined} />
        {xv > 0 && xv < 9.3 && yv < 5 && (
          <g>
            <circle cx={px(xv)} cy={py(yv)} r={4} fill="#7c3aed" />
            <text x={px(xv)} y={py(yv) - 8} fontSize="10" textAnchor="middle" fill="#7c3aed" fontWeight="700">
              връх ({fmt(xv, 1)}; {fmt(yv, 1)})
            </text>
          </g>
        )}
        <circle cx={px(xBall)} cy={py(Math.max(y(xBall), 0.12))} r={7} fill="#f97316" stroke="#7c2d12" strokeWidth="1" />
        {hit && t !== null && t >= dist / vx && (
          <text x={W / 2} y={30} fontSize="20" textAnchor="middle" fill="#16a34a" fontWeight="700">
            Кош! 🎉
          </text>
        )}
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-2">
        <label className="text-sm font-semibold">
          скорост v = {fmt(v, 1)} m/s
          <input
            type="range"
            min="5"
            max="13"
            step="0.1"
            value={v}
            onChange={e => {
              setV(Number(e.target.value));
              setT(null);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm font-semibold">
          ъгъл θ = {deg}°
          <input
            type="range"
            min="20"
            max="75"
            step="1"
            value={deg}
            onChange={e => {
              setDeg(Number(e.target.value));
              setT(null);
            }}
            className="w-full"
          />
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button onClick={() => setT(0)} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm">
          🏀 Хвърли
        </button>
        {SHOTS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => {
              setSi(i);
              setT(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              i === si ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 space-y-1">
        <p className="font-mono">
          y(x) = −{fmt(-a, 3)}x²{sgn(b, 2)}x + {fmt(c, 1)}
        </p>
        <p>
          Над коша (x = {fmt(dist, 2)} m) топката е на височина <strong>{fmt(yAtRim, 2)} m</strong>; рингът е на {fmt(RIM, 2)} m.{' '}
          {hit ? (
            <span className="text-green-700 dark:text-green-400 font-semibold">Влиза! ✓</span>
          ) : slope >= 0 && Math.abs(yAtRim - RIM) < 0.12 ? (
            <span className="text-red-700 dark:text-red-400">Топката още се изкачва – удря ринга отдолу.</span>
          ) : yAtRim > RIM ? (
            <span className="text-red-700 dark:text-red-400">Твърде високо – намали силата или ъгъла.</span>
          ) : (
            <span className="text-red-700 dark:text-red-400">Твърде ниско – увеличи силата.</span>
          )}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          a = −g / (2v²cos²θ) зависи от скоростта и ъгъла, b = tg θ е наклонът при изхвърлянето, а c = 2 m е височината на ръцете. Без
          въздушно съпротивление.
        </p>
      </div>
    </div>
  );
}
