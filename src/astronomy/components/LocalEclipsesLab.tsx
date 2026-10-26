import { useMemo, useState } from 'react';
import { fmt } from './terrestrialData';
import { visibleSolarEclipses } from './localEclipses';
import LabSvg from '~/LabSvg';
import { fromJulianDay, julianDay } from '~/tonight/ephemeris';

const W = 640;
const H = 300;
const FROM = 2026;
const TO = 2045;
const TICKS = [2026, 2030, 2035, 2040, 2045];

const CITIES = [
  { name: 'София', lat: 42.698, lon: 23.322, tz: 'Europe/Sofia' },
  { name: 'Варна', lat: 43.214, lon: 27.914, tz: 'Europe/Sofia' },
  { name: 'Валенсия', lat: 39.47, lon: -0.376, tz: 'Europe/Madrid' },
  { name: 'Луксор', lat: 25.687, lon: 32.639, tz: 'Africa/Cairo' },
  { name: 'Рейкявик', lat: 64.146, lon: -21.942, tz: 'Atlantic/Reykjavik' },
];

const KIND = {
  total: { name: 'пълно', color: '#ef4444', text: 'text-red-600 dark:text-red-400' },
  annular: { name: 'пръстеновидно', color: '#fb923c', text: 'text-orange-600 dark:text-orange-400' },
  partial: { name: 'частично', color: '#fde68a', text: '' },
} as const;

// Времевата ос: години по хоризонтала, фазата (0…1) по вертикала
const TX0 = 40;
const TX1 = 620;
const TY0 = 116; // фаза 1
const TY1 = 266; // фаза 0
const JD0 = julianDay(new Date(Date.UTC(FROM, 0, 1)));
const JD1 = julianDay(new Date(Date.UTC(TO + 1, 0, 1)));
const xOf = (jd: number) => TX0 + ((jd - JD0) / (JD1 - JD0)) * (TX1 - TX0);
const yOf = (m: number) => TY1 - Math.min(m, 1.05) * (TY1 - TY0);

export default function LocalEclipsesLab() {
  const [cityIndex, setCityIndex] = useState(0);
  const city = CITIES[cityIndex];
  const eclipses = useMemo(() => visibleSolarEclipses(JD0, JD1, city), [city]);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = eclipses.find(e => e.jd === picked) ?? eclipses[0];

  const localTime = (jd: number) =>
    fromJulianDay(jd).toLocaleString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: city.tz,
    });
  const central = eclipses.filter(e => e.kind !== 'partial');

  // Слънцето и Луната в максимума: d = R + r − 2R·фаза
  const R = 36;
  const r = selected ? R * (selected.kind === 'total' ? 1.04 : selected.kind === 'annular' ? 0.94 : 1) : R;
  const d = selected ? Math.max(0, R + r - 2 * R * Math.min(selected.magnitude, 1)) : 2 * R + 10;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Затъмненията, видими от моя град</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всички слънчеви затъмнения от {FROM} до {TO} г., които се виждат от избрания град. Височината на стълбчето е фазата –
        каква част от диаметъра на Слънцето закрива Луната.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Избраното затъмнение */}
        {selected ? (
          <>
            <g fontSize="12" fill="white" transform="translate(40, 30)">
              <text x={0} y={0} fontWeight="700" fill={KIND[selected.kind].color}>
                {localTime(selected.jd)} ч.
              </text>
              <text x={0} y={22} fillOpacity="0.9">
                {KIND[selected.kind].name[0].toUpperCase() + KIND[selected.kind].name.slice(1)} затъмнение, фаза {fmt(selected.magnitude, 2)}
              </text>
              <text x={0} y={44} fillOpacity="0.65" fontSize="11">
                {selected.atHorizon ? 'Слънцето изгрява или залязва по време на затъмнението.' : 'Цялото затъмнение е над хоризонта.'}
              </text>
            </g>
            <defs>
              <clipPath id="local-eclipse-sun">
                <circle cx={560} cy={58} r={R} />
              </clipPath>
            </defs>
            {selected.kind === 'total' && <circle cx={560} cy={58} r={R * 1.5} fill="#e0e7ff" fillOpacity="0.15" />}
            <circle cx={560} cy={58} r={R} fill="#fcd34d" />
            <circle cx={560 - d * 0.94} cy={58 - d * 0.34} r={r} fill="#0f172a" clipPath={selected.kind === 'total' ? undefined : 'url(#local-eclipse-sun)'} />
          </>
        ) : (
          <text x={W / 2} y={60} fontSize="13" textAnchor="middle" fill="white" fillOpacity="0.8">
            Няма затъмнения, видими от {city.name}, в тези години.
          </text>
        )}

        {/* Времевата ос */}
        <line x1={TX0} x2={TX1} y1={TY1} y2={TY1} stroke="white" strokeOpacity="0.4" />
        <line x1={TX0} x2={TX1} y1={yOf(1)} y2={yOf(1)} stroke="white" strokeOpacity="0.15" strokeDasharray="3 4" />
        <text x={TX0 - 6} y={yOf(1) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
          1
        </text>
        <text x={TX0 - 6} y={yOf(0.5) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
          0,5
        </text>
        {TICKS.map(y => {
          const x = xOf(julianDay(new Date(Date.UTC(y, 0, 1))));
          return (
            <g key={y}>
              <line x1={x} x2={x} y1={TY1} y2={TY1 + 4} stroke="white" strokeOpacity="0.4" />
              <text x={x} y={TY1 + 16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
                {y}
              </text>
            </g>
          );
        })}

        {eclipses.map(e => (
          <g key={e.jd} onClick={() => setPicked(e.jd)} className="cursor-pointer">
            <rect x={xOf(e.jd) - 8} y={TY0 - 14} width={16} height={TY1 - TY0 + 14} fill="transparent" />
            <rect
              x={xOf(e.jd) - 4}
              y={yOf(e.magnitude)}
              width={8}
              height={TY1 - yOf(e.magnitude)}
              rx={2}
              fill={KIND[e.kind].color}
              fillOpacity={e === selected ? 1 : 0.6}
              stroke={e === selected ? 'white' : 'none'}
            />
          </g>
        ))}
      </LabSvg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {CITIES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => {
              setCityIndex(i);
              setPicked(null);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              i === cityIndex
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {eclipses.map(e => (
          <button
            key={e.jd}
            onClick={() => setPicked(e.jd)}
            className={`px-2 py-0.5 rounded text-xs border ${
              e === selected
                ? 'border-gray-500 bg-gray-100 dark:bg-gray-700'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${KIND[e.kind].text}`}
          >
            {fromJulianDay(e.jd).toLocaleDateString('bg-BG', { month: 'short', year: 'numeric', timeZone: city.tz })}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        За {TO - FROM + 1} години от {city.name} се виждат {eclipses.length} слънчеви затъмнения,{' '}
        {central.length === 0
          ? 'но всички са частични – пълната сянка на Луната не минава оттук.'
          : `от които ${central.map(e => `${KIND[e.kind].name} (${fromJulianDay(e.jd).getUTCFullYear()} г.)`).join(' и ')}.`}{' '}
        Ивицата на пълното затъмнение е широка само до ~270 km, затова на едно място то се случва средно веднъж на няколко
        века, а частични има на всеки няколко години.
      </p>
    </div>
  );
}
