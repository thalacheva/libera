import { useState } from 'react';
import { project, synodicRate, toRad } from './sunMath';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const CX = 175;
const CY = 160;
const R = 135;

// Петна по цялата обиколка, за да има винаги видими
const SPOTS = [
  { lat: 12, lon: -70, size: 11 },
  { lat: 9, lon: -55, size: 6 },
  { lat: -18, lon: -20, size: 9 },
  { lat: 25, lon: 15, size: 7 },
  { lat: -8, lon: 50, size: 5 },
  { lat: -22, lon: 110, size: 10 },
  { lat: 15, lon: 160, size: 8 },
  { lat: 18, lon: 170, size: 5 },
  { lat: -12, lon: -150, size: 7 },
  { lat: 30, lon: -110, size: 6 },
];

// Маркерна линия по меридиан – показва диференциалното въртене
const TRACER_LON = -50;

const fmt = (v: number, d = 1) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });

export default function SunspotRotation() {
  const [day, setDay] = useState(0);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt =>
    setDay(d => {
      const next = d + dt * 2.5;
      if (next >= 30) {
        setPlaying(false);
        return 30;
      }
      return next;
    })
  );

  const tracer: string[] = [];
  for (let lat = -80; lat <= 80; lat += 2) {
    const p = project(lat, TRACER_LON + synodicRate(lat) * day);
    if (p.visible) tracer.push(`${CX + p.x * R},${CY + p.y * R}`);
  }

  const periods = [0, 30, 60].map(lat => ({ lat, P: 360 / (synodicRate(lat) + 0.9856), Psyn: 360 / synodicRate(lat) }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Въртящото се Слънце</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Проследете петната ден по ден – така Галилей разбира през 1612 г., че Слънцето се върти. Пунктирът е въображаема линия по
        меридиан: Слънцето не е твърдо тяло и екваторът му изпреварва полюсите.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          {/* Потъмняване към ръба */}
          <radialGradient id="spot-sun">
            <stop offset="0" stopColor="#fff1c1" />
            <stop offset="0.6" stopColor="#fdba3b" />
            <stop offset="0.9" stopColor="#f08a1c" />
            <stop offset="1" stopColor="#c2410c" />
          </radialGradient>
          <clipPath id="spot-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill="url(#spot-sun)" />
        <g clipPath="url(#spot-clip)">
          {/* Екватор и ширини ±30°, ±60° */}
          {[-60, -30, 0, 30, 60].map(lat => (
            <line
              key={lat}
              x1={CX - R}
              x2={CX + R}
              y1={CY - Math.sin(toRad(lat)) * R}
              y2={CY - Math.sin(toRad(lat)) * R}
              stroke="#7c2d12"
              strokeOpacity={lat === 0 ? 0.35 : 0.18}
              strokeDasharray={lat === 0 ? undefined : '3 4'}
            />
          ))}
          <polyline points={tracer.join(' ')} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray="6 4" />

          {SPOTS.map((s, i) => {
            const p = project(s.lat, s.lon + synodicRate(s.lat) * day);
            if (!p.visible) return null;
            const x = CX + p.x * R;
            const y = CY + p.y * R;
            // Към ръба петното се вижда „отстрани“ и се скъсява хоризонтално
            const squash = Math.max(0.15, p.mu / Math.cos(toRad(s.lat)));
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={s.size * squash} ry={s.size} fill="#7c2d12" fillOpacity="0.75" />
                <ellipse cx={x} cy={y} rx={s.size * 0.5 * squash} ry={s.size * 0.5} fill="#1c0a02" />
              </g>
            );
          })}
        </g>
        <text x={CX} y={CY + R + 18} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          ден {fmt(day, 0)}
        </text>
        <text x={CX - R - 4} y={CY - R + 6} fontSize="10" fill="white" fillOpacity="0.6">
          N
        </text>

        {/* Схема на петно вдясно */}
        <g transform="translate(470 120)">
          <circle r={70} fill="#f59e0b" fillOpacity="0.25" />
          <circle r={52} fill="#9a3412" />
          <circle r={24} fill="#1c0a02" />
          <text y={-80} fontSize="12" textAnchor="middle" fill="white" fontWeight="600">
            Петно отблизо
          </text>
          <line x1={10} y1={5} x2={95} y2={70} stroke="white" strokeOpacity="0.5" />
          <text x={98} y={78} fontSize="10" fill="white">
            сянка (umbra)
          </text>
          <text x={98} y={91} fontSize="10" fill="white" fillOpacity="0.7">
            ~3800 K
          </text>
          <line x1={40} y1={-20} x2={95} y2={-40} stroke="white" strokeOpacity="0.5" />
          <text x={98} y={-38} fontSize="10" fill="white">
            полусянка
          </text>
          <text x={98} y={-25} fontSize="10" fill="white" fillOpacity="0.7">
            ~5000 K
          </text>
          <text x={0} y={110} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
            фотосфера ~5800 K
          </text>
        </g>
      </svg>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => {
            if (day >= 30) setDay(0);
            setPlaying(!playing);
          }}
          className="px-3 py-1 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
        >
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <input type="range" min={0} max={30} step={0.1} value={day} onChange={e => setDay(Number(e.target.value))} className="flex-1" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
        {periods.map(p => (
          <div key={p.lat} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Период на ширина {p.lat}°</div>
            <div className="font-mono font-bold">{fmt(p.P)} дни</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">от Земята: {fmt(p.Psyn)} дни</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        Петното изглежда тъмно само в сравнение с околната фотосфера. По закона на Стефан–Болцман сянката с 3800 K излъчва (3800 /
        5800)⁴ ≈ 0,18 от светлината на същата площ от фотосферата. И все пак тя свети ослепително – десетки хиляди пъти по-ярко от
        повърхността на пълната Луна.
      </p>
    </div>
  );
}
