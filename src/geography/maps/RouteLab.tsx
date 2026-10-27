import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Readout } from '~/geometry/diagram';
import { CITIES, cityByName } from '../cities';
import { equirect, fmt, greatCircleKm, greatCirclePoints, initialBearing, landPathEquirect, mapPolyline, rhumbKm, rhumbPoints } from '../geo';

const W = 640;
const H = 320;
const proj = equirect(0, 0, W, H);
const LAND_PATH = landPathEquirect(0, 0, W, H);
const SPEED = 850; // km/h – крейсерска скорост на пътнически самолет

const COMPASS = ['С', 'СИ', 'И', 'ЮИ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
const compass = (b: number) => COMPASS[Math.round(b / 45) % 8];

const select =
  'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

/** Най-краткият път (ортодромия) и пътят с постоянен курс (локсодромия) между два града. */
export default function RouteLab() {
  const [from, setFrom] = useState('София');
  const [to, setTo] = useState('Токио');
  const a = cityByName(from);
  const b = cityByName(to);
  const gc = greatCircleKm(a, b);
  const rh = rhumbKm(a, b);
  const bearing = initialBearing(a, b);
  const same = from === to;

  const clip = useId();

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={W} height={H} className="fill-sky-100 dark:fill-slate-900" />
        <clipPath id={clip}>
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
        <path d={LAND_PATH} clipPath={`url(#${clip})`} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/70 dark:stroke-emerald-600/50" strokeWidth="0.6" />
        {Array.from({ length: 11 }, (_, i) => -150 + i * 30).map(lon => (
          <line key={lon} x1={proj({ lat: 0, lon }).x} y1={0} x2={proj({ lat: 0, lon }).x} y2={H} className={lon === 0 ? 'stroke-blue-500/70' : 'stroke-gray-400/40'} strokeWidth={lon === 0 ? 1.2 : 0.6} />
        ))}
        {[-60, -30, 0, 30, 60].map(lat => (
          <line key={lat} x1={0} y1={proj({ lat, lon: 0 }).y} x2={W} y2={proj({ lat, lon: 0 }).y} className={lat === 0 ? 'stroke-red-500/70' : 'stroke-gray-400/40'} strokeWidth={lat === 0 ? 1.2 : 0.6} />
        ))}
        {!same && (
          <>
            <path d={mapPolyline(rhumbPoints(a, b), proj)} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.2" strokeDasharray="7 4" />
            <path d={mapPolyline(greatCirclePoints(a, b), proj)} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.6" />
          </>
        )}
        {CITIES.map(c => {
          const q = proj(c);
          const on = c.name === from || c.name === to;
          return (
            <g key={c.name}>
              <circle cx={q.x} cy={q.y} r={on ? 5 : 3} className={on ? 'fill-fuchsia-700 stroke-white dark:fill-fuchsia-300 dark:stroke-gray-900' : 'fill-gray-600 dark:fill-gray-300'} strokeWidth="1.5" />
              {on && (
                <text x={q.x + (q.x > W - 90 ? -8 : 8)} y={q.y - 7} fontSize="13" fontWeight="bold" textAnchor={q.x > W - 90 ? 'end' : 'start'} className="fill-gray-900 dark:fill-white">
                  {c.name}
                </text>
              )}
            </g>
          );
        })}
        <g transform={`translate(10 ${H - 34})`}>
          <rect x={-4} y={-14} width={210} height={44} rx={6} className="fill-white/85 dark:fill-gray-900/85" />
          <line x1={0} y1={-4} x2={26} y2={-4} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.6" />
          <text x={32} y={0} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
            ортодромия (голям кръг)
          </text>
          <line x1={0} y1={16} x2={26} y2={16} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.2" strokeDasharray="7 4" />
          <text x={32} y={20} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
            локсодромия (постоянен курс)
          </text>
        </g>
      </LabSvg>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
        <label className="flex items-center gap-1.5">
          от
          <select className={select} value={from} onChange={e => setFrom(e.target.value)}>
            {CITIES.map(c => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          до
          <select className={select} value={to} onChange={e => setTo(e.target.value)}>
            {CITIES.map(c => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        {same ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Избери два различни града.</p>
        ) : (
          <Readout
            items={[
              { label: 'ортодромия', value: `${fmt(gc)} km`, tone: 'rose' },
              { label: 'локсодромия', value: `${fmt(rh)} km`, tone: 'amber' },
              { label: 'по-дълга с', value: `${fmt(((rh - gc) / gc) * 100, 1)}%` },
              { label: 'начален курс', value: `${fmt(bearing)}° (${compass(bearing)})` },
              { label: `полет при ${SPEED} km/h`, value: `${fmt(gc / SPEED, 1)} h` },
            ]}
          />
        )}
      </div>
    </div>
  );
}
