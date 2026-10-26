import { useMemo, useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';
import { DEG, fromJulianDay, julianDay, lunarEclipseNear, moonEcliptic, moonPhases } from '~/tonight/ephemeris';

const W = 640;
const H = 280;
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
const INCLINATION = 5.145; // наклон на лунната орбита към еклиптиката, °
/** Затъмнение е възможно, ако пълнолунието е на по-малко от ~17° от възел (виж текста). */
const NODE_LIMIT = 17;
// Типични ъглови радиуси на разстоянието на Луната: сянка ~0,70°, полусянка ~1,27°, Луната ~0,26°
const UMBRA_ZONE = 0.96;
const PENUMBRA_ZONE = 1.53;

const KIND = {
  total: { name: 'пълно', color: '#ef4444', text: 'text-red-600 dark:text-red-400' },
  partial: { name: 'частично', color: '#fb923c', text: 'text-orange-600 dark:text-orange-400' },
  penumbral: { name: 'полусянково', color: '#fde68a', text: '' },
} as const;
const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];

// Графиката: дните на годината по хоризонтала, еклиптичната ширина на Луната β (−6°…+6°) по вертикала
const GX0 = 46;
const GX1 = 624;
const GY0 = 20;
const GY1 = 236;
const yOf = (b: number) => GY0 + ((6 - b) / 12) * (GY1 - GY0);

/** Средната еклиптична дължина на Слънцето и на възходящия възел на лунната орбита (°), n – дни от J2000. */
function sunAndNode(jd: number) {
  const n = jd - 2451545;
  const g = (357.528 + 0.9856003 * n) * DEG;
  const sun = 280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  const node = 125.0445 - 0.0529538 * n; // възлите обикалят назад за 18,6 години
  return { sun, node };
}

/** На колко градуса от най-близкия възел е точката, противоположна на Слънцето (там е пълнолунието). */
function fromNode(jd: number) {
  const { sun, node } = sunAndNode(jd);
  const d = (((sun + 180 - node) % 180) + 180) % 180;
  return Math.min(d, 180 - d);
}

const sofiaDate = (jd: number) =>
  fromJulianDay(jd).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', timeZone: 'Europe/Sofia' });

function yearData(year: number) {
  const jd0 = julianDay(new Date(Date.UTC(year, 0, 1)));
  const jd1 = julianDay(new Date(Date.UTC(year + 1, 0, 1)));
  const fullMoons = moonPhases(jd0, jd1)
    .filter(e => e.phase === 2)
    .map(e => ({ jd: e.jd, lat: moonEcliptic(e.jd).lat, eclipse: lunarEclipseNear(e.jd) }));
  // Ширината, която би имала Луната при пълнолуние във всеки ден: β = i · sin(разстояние от възходящия възел)
  const wave = Array.from({ length: 183 }, (_, i) => {
    const jd = jd0 + ((jd1 - jd0) * i) / 182;
    const { sun, node } = sunAndNode(jd);
    return { jd, lat: Math.asin(Math.sin(INCLINATION * DEG) * Math.sin((sun + 180 - node) * DEG)) / DEG };
  });
  // Сезоните на затъмненията – дните, в които пълнолуние би било близо до възел
  const seasons: { from: number; to: number }[] = [];
  for (let jd = jd0; jd < jd1; jd += 1) {
    if (fromNode(jd) >= NODE_LIMIT) continue;
    const last = seasons[seasons.length - 1];
    if (last && jd - last.to <= 1.5) last.to = jd + 1;
    else seasons.push({ from: jd, to: jd + 1 });
  }
  return { jd0, jd1, fullMoons, wave, seasons };
}

export default function EclipseSeasonsLab() {
  const [year, setYear] = useState(2026);
  const { jd0, jd1, fullMoons, wave, seasons } = useMemo(() => yearData(year), [year]);
  const xOf = (jd: number) => GX0 + ((jd - jd0) / (jd1 - jd0)) * (GX1 - GX0);
  const eclipses = fullMoons.filter(f => f.eclipse);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Сезони на затъмненията</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всички пълнолуния през годината и на колко градуса над или под еклиптиката е Луната при всяко от тях. Затъмнение има
        само когато Луната попадне в земната сянка.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Сезоните на затъмненията */}
        {seasons.map(s => (
          <g key={s.from}>
            <rect x={xOf(s.from)} y={GY0} width={xOf(s.to) - xOf(s.from)} height={GY1 - GY0} fill="#a855f7" fillOpacity="0.16" />
            <text x={(xOf(s.from) + xOf(s.to)) / 2} y={GY0 + 12} fontSize="9" textAnchor="middle" fill="#d8b4fe">
              сезон
            </text>
          </g>
        ))}

        {/* Сянката и полусянката около еклиптиката */}
        <rect x={GX0} y={yOf(PENUMBRA_ZONE)} width={GX1 - GX0} height={yOf(-PENUMBRA_ZONE) - yOf(PENUMBRA_ZONE)} fill="#94a3b8" fillOpacity="0.14" />
        <rect x={GX0} y={yOf(UMBRA_ZONE)} width={GX1 - GX0} height={yOf(-UMBRA_ZONE) - yOf(UMBRA_ZONE)} fill="#94a3b8" fillOpacity="0.22" />
        <line x1={GX0} x2={GX1} y1={yOf(0)} y2={yOf(0)} stroke="#fbbf24" strokeOpacity="0.7" />
        <text x={GX1 - 4} y={yOf(0) - 4} fontSize="9" textAnchor="end" fill="#fbbf24">
          еклиптика (центърът на сянката)
        </text>

        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="none" stroke="white" strokeOpacity="0.2" />
        {[-5, 5].map(b => (
          <g key={b}>
            <line x1={GX0} x2={GX1} y1={yOf(b)} y2={yOf(b)} stroke="white" strokeOpacity="0.1" strokeDasharray="3 4" />
            <text x={GX0 - 6} y={yOf(b) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
              {b > 0 ? '+5°' : '−5°'}
            </text>
          </g>
        ))}
        <text x={GX0 - 6} y={yOf(0) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
          0°
        </text>
        {MONTHS.map((m, i) => {
          const x = xOf(julianDay(new Date(Date.UTC(year, i, 15))));
          return (
            <text key={m} x={x} y={GY1 + 16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
              {m}
            </text>
          );
        })}

        {/* Ширината при пълнолуние за всеки ден – вълна с период 346,6 дни */}
        <polyline
          points={wave.map(p => `${xOf(p.jd).toFixed(1)},${yOf(p.lat).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#c4b5fd"
          strokeOpacity="0.45"
          strokeDasharray="4 4"
        />

        {/* Пълнолунията */}
        {fullMoons.map(f => {
          const kind = f.eclipse ? KIND[f.eclipse.kind] : null;
          return (
            <g key={f.jd}>
              <circle cx={xOf(f.jd)} cy={yOf(f.lat)} r={kind ? 7 : 5} fill={kind ? kind.color : '#e5e7eb'} stroke="#0f172a" strokeWidth="1.5" />
              {kind && (
                <text x={xOf(f.jd)} y={yOf(f.lat) + (f.lat > 0 ? -12 : 20)} fontSize="10" textAnchor="middle" fill={kind.color}>
                  {kind.name}
                </text>
              )}
            </g>
          );
        })}

        <g fontSize="10" transform={`translate(${GX0}, ${H - 14})`} fill="white" fillOpacity="0.7">
          <circle cx={4} cy={-4} r={4} fill="#e5e7eb" />
          <text x={12} y={0}>пълнолуние</text>
          <rect x={92} y={-9} width={14} height={10} fill="#94a3b8" fillOpacity="0.4" />
          <text x={112} y={0}>сянка и полусянка на Земята</text>
          <rect x={272} y={-9} width={14} height={10} fill="#a855f7" fillOpacity="0.35" />
          <text x={292} y={0}>Слънцето е близо до възел</text>
        </g>
      </LabSvg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {YEARS.map(y => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-3 py-1 rounded text-sm border ${
              y === year
                ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        През {year} г. има {fullMoons.length} пълнолуния, но лунните затъмнения са само {eclipses.length}:{' '}
        {eclipses.map((f, i) => (
          <span key={f.jd}>
            {i > 0 && (i === eclipses.length - 1 ? ' и ' : ', ')}
            <strong className={KIND[f.eclipse!.kind].text}>
              {sofiaDate(f.eclipse!.max)}
            </strong>{' '}
            ({KIND[f.eclipse!.kind].name}
            {f.eclipse!.kind !== 'penumbral' && `, фаза ${fmt(f.eclipse!.umbralMagnitude, 2)}`})
          </span>
        ))}
        . Вълната показва къде би била Луната при пълнолуние във всеки ден. Тя минава през нулата два пъти на 346,6 дни
        (затъмнителната година) – затова сезоните са два и всяка година идват с около 19 дни по-рано.
      </p>
    </div>
  );
}
