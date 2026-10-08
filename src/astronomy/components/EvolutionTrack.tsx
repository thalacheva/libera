import { useState } from 'react';
import { TRACKS, trackAt } from './evolutionData';
import { hrAxes, msLuminosity, msTemperature } from './hrData';
import { temperatureToRGB } from './light';
import { T_SUN } from './starData';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 330;
const X0 = 50;
const X1 = 400;
const Y0 = 24;
const Y1 = 290;
const { x: hx, y: hy } = hrAxes(X0, X1, Y0, Y1);

const MS = Array.from({ length: 50 }, (_, i) => {
  const M = 0.1 * 600 ** (i / 49);
  return `${hx(Math.min(45000, msTemperature(M)))},${hy(msLuminosity(M))}`;
}).join(' ');

function formatAge(t: number) {
  if (t < 1e6) return `${fmt(t / 1000, 0)} хил. години`;
  if (t < 1e9) return `${fmt(t / 1e6, t < 1e7 ? 2 : 1)} млн. години`;
  return `${fmt(t / 1e9, 3)} млрд. години`;
}

export default function EvolutionTrack() {
  const [trackId, setTrackId] = useState('sun');
  const [p, setP] = useState(1);
  const [playing, setPlaying] = useState(false);
  const track = TRACKS.find(t => t.id === trackId)!;
  const n = track.points.length;

  useAnimationFrame(playing && p < n - 1, dt => setP(v => Math.min(n - 1, v + dt * 0.6)));

  const now = trackAt(track, p);
  const R = Math.sqrt(now.L) * (T_SUN / now.T) ** 2;
  const starPx = Math.min(75, Math.max(1.5, 8 * R ** 0.4));
  const isNebula = now.point.phase.includes('мъглявина') || now.point.phase.includes('оголва');
  const isSN = now.point.phase.includes('свръхнова');

  // Пътят като начупена линия с междинни точки
  const path = Array.from({ length: (n - 1) * 12 + 1 }, (_, i) => {
    const q = trackAt(track, i / 12);
    return `${hx(q.T)},${hy(q.L)}`;
  }).join(' ');

  // Времева лента: дял на всяка фаза от целия живот
  const total = track.points[n - 1].t;
  const segments = track.points.slice(0, -1).map((pt, i) => ({ pt, dt: track.points[i + 1].t - pt.t }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пътят на звездата в диаграмата на Херцшпрунг–Ръсел</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете маса и проследете живота на звездата. Обърнете внимание на лентата отдолу: почти целият живот минава на главната
        последователност, а всичко останало е кратък финал.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.25" />
        <defs>
          <clipPath id="et-plot">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <g clipPath="url(#et-plot)">
          <polyline points={MS} fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
          <polyline points={path} fill="none" stroke="#fb923c" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 3" />
          {track.points.map((pt, i) => (
            <circle
              key={i}
              cx={hx(pt.T)}
              cy={hy(pt.L)}
              r="3"
              fill={i <= now.index ? '#fb923c' : '#475569'}
              className="cursor-pointer"
              onClick={() => {
                setP(i);
                setPlaying(false);
              }}
            />
          ))}
          <circle cx={hx(now.T)} cy={hy(now.L)} r="6" fill={temperatureToRGB(now.T)} stroke="white" strokeWidth="1.5" />
        </g>
        {[30000, 10000, 5000, 3000].map(T => (
          <text key={T} x={hx(T)} y={Y1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(T, 0)} K
          </text>
        ))}
        {[
          [-2, '10⁻²'],
          [0, '1'],
          [2, '10²'],
          [4, '10⁴'],
          [6, '10⁶'],
        ].map(([q, label]) => (
          <text key={q} x={X0 - 4} y={hy(10 ** Number(q)) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {label}
          </text>
        ))}
        <text x={X0 + 4} y={Y0 + 12} fontSize="9" fill="white" fillOpacity="0.5">
          L / L☉
        </text>

        {/* Звездата отблизо */}
        <g>
          {isNebula && (
            <g>
              <ellipse cx={515} cy={110} rx={70} ry={55} fill="none" stroke="#22d3ee" strokeOpacity="0.6" strokeWidth="6" />
              <ellipse cx={515} cy={110} rx={58} ry={45} fill="#a78bfa" fillOpacity="0.12" />
            </g>
          )}
          {isSN && <circle cx={515} cy={110} r={85} fill="#fef08a" fillOpacity="0.35" />}
          <circle cx={515} cy={110} r={starPx} fill={temperatureToRGB(now.T)} />
          <circle cx={515} cy={110} r={Math.min(75, 8)} fill="none" stroke={temperatureToRGB(T_SUN)} strokeDasharray="3 3" strokeOpacity="0.6" />
        </g>
        <g fontSize="11" fill="white" transform="translate(420, 210)">
          <text x={0} y={0} fontWeight="700" fontSize="12" fill="#fdba74">
            {now.point.phase}
          </text>
          <text x={0} y={18} fillOpacity="0.85">
            възраст: {formatAge(now.t)}
          </text>
          <text x={0} y={34} fillOpacity="0.85">
            T ≈ {fmt(Math.round(now.T / 10) * 10, 0)} K, L ≈ {now.L >= 1000 ? sci(now.L, 1) : fmt(now.L, now.L < 1 ? 3 : 1)} L☉
          </text>
          <text x={0} y={50} fillOpacity="0.85">
            R ≈ {R < 0.1 ? fmt(R, 3) : fmt(R, R < 10 ? 2 : 0)} R☉
          </text>
          <text x={0} y={68} fontSize="9" fillOpacity="0.5">
            пунктирът е Слънцето днес
          </text>
        </g>
      </svg>

      {/* Времева лента */}
      <div className="flex h-5 rounded overflow-hidden mt-3 text-[10px] leading-5 text-center">
        {segments.map(({ pt, dt }, i) => (
          <div
            key={i}
            title={`${pt.phase}: ${formatAge(dt)}`}
            className="cursor-pointer"
            style={{ width: `${Math.max(0.6, (dt / total) * 100)}%`, background: i <= now.index - 1 ? '#fb923c' : i % 2 ? '#64748b' : '#94a3b8' }}
            onClick={() => setP(i)}
          >
            {dt / total > 0.15 ? pt.phase : ''}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Дял на всяка фаза от целия живот (до последната точка)</p>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {TRACKS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setTrackId(t.id);
              setP(0);
              setPlaying(false);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              t.id === trackId
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {t.name}
          </button>
        ))}
        <button
          onClick={() => {
            if (p >= n - 1) setP(0);
            setPlaying(v => !v);
          }}
          className="ml-2 px-4 py-1 rounded bg-orange-600 text-white text-sm hover:bg-orange-700"
        >
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
      </div>
      <input type="range" min="0" max={n - 1} step="0.01" value={p} onChange={e => setP(Number(e.target.value))} className="w-full mt-3" />

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {now.point.text} <span className="text-gray-500 dark:text-gray-400">Краят: {track.end}.</span>
      </p>
    </div>
  );
}
