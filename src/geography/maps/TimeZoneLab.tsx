import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { CITIES, cityByName } from '../cities';
import { clock, equirect, fmt, landPathEquirect, nightPathEquirect, subsolarPoint, sunAltitude, wrapLon } from '../geo';

const W = 640;
const TOP = 26;
const H = 320;
const proj = equirect(0, TOP, W, H);
const LAND_PATH = landPathEquirect(0, TOP, W, H);
const xOf = (lon: number) => proj({ lat: 0, lon }).x;

const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Ден от (невисокосната) година → „21 юни“. */
function dateText(dayOfYear: number) {
  let d = ((dayOfYear - 1 + 365) % 365) + 1;
  let m = 0;
  while (d > MONTH_DAYS[m]) d -= MONTH_DAYS[m++];
  return `${d} ${MONTHS[m]}`;
}

const DATES = [
  { day: 79, label: '20 март' },
  { day: 172, label: '21 юни' },
  { day: 266, label: '23 септември' },
  { day: 355, label: '21 декември' },
];

const offsetText = (h: number) => {
  const sign = h >= 0 ? '+' : '−';
  const a = Math.abs(h);
  return `UTC${sign}${Math.floor(a)}${a % 1 ? `:${String(Math.round((a % 1) * 60)).padStart(2, '0')}` : ''}`;
};

const select =
  'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

/** Денят и нощта на картата, часовите пояси и линията на смяна на датата. */
export default function TimeZoneLab() {
  const [utc, setUtc] = useState(10);
  const [day, setDay] = useState(172);
  const [name, setName] = useState('София');
  const city = cityByName(name);

  const sun = subsolarPoint(day, utc);
  const sunXY = proj(sun);
  // Меридианът, където е полунощ по местно слънчево време; на изток от него до 180° вече е новата дата
  const midnightLon = wrapLon(-15 * utc);
  const xMid = xOf(midnightLon);
  const westDate = utc < 12 ? dateText(day - 1) : dateText(day);
  const eastDate = utc < 12 ? dateText(day) : dateText(day + 1);

  const zoneHours = utc + city.utc;
  const zoneDay = day + Math.floor(zoneHours / 24);
  const solar = utc + city.lon / 15;
  const diffMin = Math.round((solar - zoneHours) * 60);
  const alt = sunAltitude(city, sun);

  const clip = useId();

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${TOP + H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Идеалните часови пояси – по 15° около меридианите, кратни на 15° */}
        {Array.from({ length: 25 }, (_, i) => i - 12).map(k => {
          const x1 = Math.max(0, xOf(k * 15 - 7.5));
          const x2 = Math.min(W, xOf(k * 15 + 7.5));
          return (
            <g key={k}>
              <rect x={x1} y={0} width={x2 - x1} height={TOP - 4} className={k % 2 ? 'fill-gray-100 dark:fill-gray-700/60' : 'fill-gray-200 dark:fill-gray-600/60'} />
              {Math.abs(k) < 12 && (
                <text x={(x1 + x2) / 2} y={TOP - 9} fontSize="10" textAnchor="middle" className={k === Math.round(city.lon / 15) ? 'fill-fuchsia-700 dark:fill-fuchsia-300 font-bold' : 'fill-gray-600 dark:fill-gray-300'}>
                  {k > 0 ? `+${k}` : k < 0 ? `−${-k}` : '0'}
                </text>
              )}
            </g>
          );
        })}
        <rect x={0} y={TOP} width={W} height={H} className="fill-sky-100 dark:fill-slate-800" />
        <clipPath id={clip}>
          <rect x={0} y={TOP} width={W} height={H} />
        </clipPath>
        <path d={LAND_PATH} clipPath={`url(#${clip})`} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/80 dark:stroke-emerald-600/50" strokeWidth="0.6" />
        {Array.from({ length: 23 }, (_, i) => -165 + i * 15).map(lon => (
          <line key={lon} x1={xOf(lon)} y1={TOP} x2={xOf(lon)} y2={TOP + H} className={lon === 0 ? 'stroke-blue-500/70' : 'stroke-gray-400/30'} strokeWidth={lon === 0 ? 1.2 : 0.6} />
        ))}
        <path d={nightPathEquirect(sun, 0, TOP, W, H)} className="fill-slate-900/45 dark:fill-black/55" />
        {/* Линията на смяна на датата (опростено – по 180-ия меридиан) и полунощният меридиан */}
        <line x1={W - 1} y1={TOP} x2={W - 1} y2={TOP + H} className="stroke-red-600 dark:stroke-red-400" strokeWidth="2.5" />
        <line x1={1} y1={TOP} x2={1} y2={TOP + H} className="stroke-red-600 dark:stroke-red-400" strokeWidth="2.5" />
        <line x1={xMid} y1={TOP} x2={xMid} y2={TOP + H} className="stroke-violet-700 dark:stroke-violet-300" strokeWidth="2" strokeDasharray="6 4" />
        <text x={Math.min(Math.max(xMid, 40), W - 40)} y={TOP + H - 8} fontSize="11" textAnchor="middle" className="fill-violet-800 dark:fill-violet-200 font-semibold">
          полунощ
        </text>
        {/* Датите от двете страни на полунощния меридиан */}
        {xMid > 70 && (
          <text x={xMid / 2} y={TOP + 16} fontSize="12" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100 font-semibold">
            {westDate}
          </text>
        )}
        {xMid < W - 70 && (
          <text x={(xMid + W) / 2} y={TOP + 16} fontSize="12" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100 font-semibold">
            {eastDate}
          </text>
        )}
        <circle cx={sunXY.x} cy={sunXY.y} r={8} className="fill-yellow-400 stroke-amber-600" strokeWidth="1.5" />
        {CITIES.map(c => {
          const q = proj(c);
          const on = c.name === name;
          return (
            <g key={c.name}>
              <circle cx={q.x} cy={q.y} r={on ? 5.5 : 3} className={on ? 'fill-fuchsia-600 stroke-white dark:fill-fuchsia-400 dark:stroke-gray-900' : 'fill-gray-700 dark:fill-gray-200'} strokeWidth="1.5" />
              {on && (
                <text x={q.x + (q.x > W - 100 ? -8 : 8)} y={q.y - 7} fontSize="13" fontWeight="bold" textAnchor={q.x > W - 100 ? 'end' : 'start'} className="fill-gray-900 dark:fill-white">
                  {c.name}
                </text>
              )}
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="UTC, h" value={utc} onChange={setUtc} min={0} max={23.75} step={0.25} tone="violet" />
      </Sliders>
      <Buttons>
        {DATES.map(d => (
          <DiagramButton key={d.day} active={day === d.day} onClick={() => setDay(d.day)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
        <label className="flex items-center gap-1.5">
          град
          <select className={select} value={name} onChange={e => setName(e.target.value)}>
            {CITIES.map(c => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'UTC', value: `${clock(utc)}, ${dateText(day)}` },
            { label: `поясно (${offsetText(city.utc)})`, value: `${clock(zoneHours)}, ${dateText(zoneDay)}`, tone: 'rose' },
            { label: 'местно слънчево', value: clock(solar), tone: 'amber' },
            { label: 'разлика', value: `${diffMin > 0 ? '+' : diffMin < 0 ? '−' : ''}${Math.abs(diffMin)} min` },
            { label: 'Слънцето', value: alt > 0 ? `${fmt(alt)}° над хоризонта` : 'под хоризонта' },
          ]}
        />
      </div>
    </div>
  );
}
