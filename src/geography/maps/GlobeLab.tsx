import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { CITIES } from '../cities';
import { EARTH_R, OBLIQUITY, clock, fmt, globePolyline, landPathGlobe, latText, lonText, orthographic, rad, type LatLon } from '../geo';

const CX = 165;
const CY = 165;
const R = 150;
const KM_PER_DEG = (2 * Math.PI * EARTH_R) / 360;

const meridian = (lon: number): LatLon[] => Array.from({ length: 61 }, (_, i) => ({ lat: -90 + i * 3, lon }));
const parallel = (lat: number): LatLon[] => Array.from({ length: 121 }, (_, i) => ({ lat, lon: -180 + i * 3 }));

const SPECIAL = [
  { lat: 0, name: 'екватор', cls: 'stroke-red-500', dash: undefined },
  { lat: OBLIQUITY, name: 'Северен тропик', cls: 'stroke-amber-500', dash: '5 4' },
  { lat: -OBLIQUITY, name: 'Южен тропик', cls: 'stroke-amber-500', dash: '5 4' },
  { lat: 90 - OBLIQUITY, name: 'Северен полярен кръг', cls: 'stroke-sky-500', dash: '5 4' },
  { lat: -(90 - OBLIQUITY), name: 'Южен полярен кръг', cls: 'stroke-sky-500', dash: '5 4' },
];

const SHOWN = ['София', 'Лондон', 'Рейкявик', 'Токио', 'Сидни', 'Рио де Жанейро'];

/** Глобус с градусна мрежа: географската ширина и дължина като ъгли. */
export default function GlobeLab() {
  const [lat, setLat] = useState(42.7);
  const [lon, setLon] = useState(23.32);

  // Глобусът се обръща към точката; наклонът е наполовина, за да личат и полюсите
  const proj = orthographic(lat / 2, lon, CX, CY, R);
  const p = proj({ lat, lon });
  const northPole = proj({ lat: 90, lon: 0 });
  const southPole = proj({ lat: -90, lon: 0 });

  // Вложка 1: разрез по меридиана – ширината е ъгъл от екватора
  const [ax, ay, ar] = [418, 110, 58];
  const phx = ax + ar * Math.cos(rad(lat));
  const phy = ay - ar * Math.sin(rad(lat));
  const arcR = 24;
  const arc1 = `M${ax + arcR} ${ay} A${arcR} ${arcR} 0 0 ${lat >= 0 ? 0 : 1} ${ax + arcR * Math.cos(rad(lat))} ${ay - arcR * Math.sin(rad(lat))}`;

  // Вложка 2: изглед отгоре над Северния полюс – дължината е ъгъл от Гринуич (надолу), на изток – обратно на часовниковата стрелка
  const [bx, by, br] = [570, 110, 58];
  const lx = bx + br * Math.sin(rad(lon));
  const ly = by + br * Math.cos(rad(lon));
  const arc2 = `M${bx} ${by + arcR} A${arcR} ${arcR} 0 ${Math.abs(lon) > 180 ? 1 : 0} ${lon >= 0 ? 0 : 1} ${bx + arcR * Math.sin(rad(lon))} ${by + arcR * Math.cos(rad(lon))}`;

  const noonUtc = 12 - lon / 15;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <circle cx={CX} cy={CY} r={R} className="fill-sky-100 dark:fill-slate-900" />
        <path d={landPathGlobe(lat / 2, lon, CX, CY, R)} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/70 dark:stroke-emerald-600/50" strokeWidth="0.6" />
        {Array.from({ length: 24 }, (_, i) => -180 + i * 15).map(m => (
          <path key={`m${m}`} d={globePolyline(meridian(m), proj)} fill="none" className={m === 0 ? 'stroke-blue-600 dark:stroke-blue-400' : 'stroke-gray-400/60 dark:stroke-gray-500/50'} strokeWidth={m === 0 ? 2 : 0.7} />
        ))}
        {[-75, -60, -45, -30, -15, 15, 30, 45, 60, 75].map(l => (
          <path key={`p${l}`} d={globePolyline(parallel(l), proj)} fill="none" className="stroke-gray-400/60 dark:stroke-gray-500/50" strokeWidth="0.7" />
        ))}
        {SPECIAL.map(s => (
          <path key={s.name} d={globePolyline(parallel(s.lat), proj)} fill="none" className={s.cls} strokeWidth={s.lat === 0 ? 2 : 1.4} strokeDasharray={s.dash} />
        ))}
        {/* Меридианът и паралелът през точката */}
        <path d={globePolyline(meridian(lon), proj)} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="1.6" />
        <path d={globePolyline(parallel(lat), proj)} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="1.6" strokeDasharray="6 3" />
        <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1.5" />
        {northPole.visible && (
          <text x={northPole.x} y={northPole.y - 5} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
            С
          </text>
        )}
        {southPole.visible && (
          <text x={southPole.x} y={southPole.y + 15} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
            Ю
          </text>
        )}
        {p.visible && <circle cx={p.x} cy={p.y} r={6} className="fill-fuchsia-600 stroke-white dark:fill-fuchsia-400 dark:stroke-gray-900" strokeWidth="2" />}

        {/* Вложка 1 */}
        <text x={ax} y={18} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          <tspan x={ax}>ширина: разрез</tspan>
          <tspan x={ax} dy="14">по меридиана</tspan>
        </text>
        <circle cx={ax} cy={ay} r={ar} className="fill-sky-50 stroke-gray-400 dark:fill-slate-900 dark:stroke-gray-500" strokeWidth="1.2" />
        <line x1={ax - ar - 6} y1={ay} x2={ax + ar + 6} y2={ay} className="stroke-red-500" strokeWidth="1.5" />
        <line x1={ax} y1={ay - ar - 6} x2={ax} y2={ay + ar + 6} className="stroke-gray-400 dark:stroke-gray-500" strokeDasharray="3 3" />
        <line x1={ax} y1={ay} x2={phx} y2={phy} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" />
        <path d={arc1} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="1.5" />
        <circle cx={phx} cy={phy} r={4.5} className="fill-fuchsia-600 dark:fill-fuchsia-400" />
        <text x={ax + 30} y={lat >= 0 ? ay - 6 : ay + 15} fontSize="13" fontStyle="italic" className="fill-fuchsia-700 dark:fill-fuchsia-300">
          φ
        </text>
        <text x={ax} y={ay - ar - 9} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          С
        </text>
        <text x={ax - ar - 8} y={ay - 5} fontSize="10" textAnchor="end" className="fill-red-600 dark:fill-red-400">
          екв.
        </text>

        {/* Вложка 2 */}
        <text x={bx} y={18} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          <tspan x={bx}>дължина: отгоре</tspan>
          <tspan x={bx} dy="14">над Сев. полюс</tspan>
        </text>
        <circle cx={bx} cy={by} r={br} className="fill-sky-50 stroke-red-500 dark:fill-slate-900" strokeWidth="1.5" />
        <line x1={bx} y1={by} x2={bx} y2={by + br + 6} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
        <line x1={bx} y1={by} x2={lx} y2={ly} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" />
        {Math.abs(lon) > 0.4 && <path d={arc2} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="1.5" />}
        <circle cx={lx} cy={ly} r={4.5} className="fill-fuchsia-600 dark:fill-fuchsia-400" />
        <circle cx={bx} cy={by} r={2.5} className="fill-gray-500" />
        <text x={bx} y={by + br + 18} fontSize="11" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          Гринуич 0°
        </text>
        <text x={bx + br + 3} y={by + 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          И
        </text>
        <text x={bx - br - 3} y={by + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          З
        </text>
        <text x={bx + 26 * Math.sin(rad(lon / 2)) + (lon >= 0 ? 6 : -12)} y={by + 30 * Math.cos(rad(lon / 2)) + 4} fontSize="13" fontStyle="italic" className="fill-fuchsia-700 dark:fill-fuchsia-300">
          λ
        </text>

        {/* Легенда */}
        {[
          ['екватор', 'stroke-red-500', undefined],
          ['начален меридиан', 'stroke-blue-600 dark:stroke-blue-400', undefined],
          ['тропици', 'stroke-amber-500', '5 4'],
          ['полярни кръгове', 'stroke-sky-500', '5 4'],
        ].map(([name, cls, dash], i) => (
          <g key={name} transform={`translate(${352 + (i % 2) * 140} ${222 + Math.floor(i / 2) * 20})`}>
            <line x1={0} y1={-4} x2={22} y2={-4} className={cls} strokeWidth="2" strokeDasharray={dash} />
            <text x={28} y={0} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
              {name}
            </text>
          </g>
        ))}
        <text x={352} y={278} fontSize="13" className="fill-gray-800 dark:fill-gray-100">
          <tspan fontStyle="italic">φ</tspan> = {latText(lat)}
        </text>
        <text x={352} y={300} fontSize="13" className="fill-gray-800 dark:fill-gray-100">
          <tspan fontStyle="italic">λ</tspan> = {lonText(lon)}
        </text>
      </LabSvg>

      <Buttons>
        {CITIES.filter(c => SHOWN.includes(c.name)).map(c => (
          <DiagramButton
            key={c.name}
            active={Math.abs(c.lat - lat) < 0.01 && Math.abs(c.lon - lon) < 0.01}
            onClick={() => {
              setLat(c.lat);
              setLon(c.lon);
            }}
          >
            {c.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={-90} max={90} step={0.5} />
        <Slider label="λ, °" value={lon} onChange={setLon} min={-180} max={180} step={0.5} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'до екватора', value: `${fmt(Math.abs(lat) * KM_PER_DEG)} km` },
            { label: 'дължина на паралела', value: `${fmt(2 * Math.PI * EARTH_R * Math.cos(rad(lat)))} km` },
            { label: '1° по паралела', value: `${fmt(KM_PER_DEG * Math.cos(rad(lat)), 1)} km` },
            { label: 'местно пладне', value: `${clock(noonUtc)} UTC` },
          ]}
        />
      </div>
    </div>
  );
}
