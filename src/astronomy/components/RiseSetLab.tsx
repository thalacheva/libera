import { useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 300;
const DEG = Math.PI / 180;
/** Височината на звезда при изгрев и залез: рефракцията я повдига с ~34′. */
const H0 = -0.567;

const PLACES = [
  { name: 'София', lat: 42.7 },
  { name: 'Осло', lat: 59.9 },
  { name: 'Мурманск', lat: 69.0 },
  { name: 'Екватора', lat: 0 },
  { name: 'Сидни', lat: -33.9 },
  { name: 'Северния полюс', lat: 90 },
];

const STARS = [
  { name: 'Полярната', dec: 89.26 },
  { name: 'Капела', dec: 46.0 },
  { name: 'Вега', dec: 38.78 },
  { name: 'Сириус', dec: -16.72 },
  { name: 'Антарес', dec: -26.43 },
  { name: 'Канопус', dec: -52.7 },
  { name: 'Алфа Кентавър', dec: -60.83 },
];

// Графиката: часов ъгъл от −12ʰ до +12ʰ по хоризонтала, височина от −90° до +90° по вертикала
const GX0 = 46;
const GX1 = 396;
const GY0 = 26;
const GY1 = 270;
const xOf = (t: number) => GX0 + ((t + 12) / 24) * (GX1 - GX0);
const yOf = (h: number) => GY0 + ((90 - h) / 180) * (GY1 - GY0);

/** Височина при часов ъгъл t (часове): sin h = sin φ sin δ + cos φ cos δ cos t. */
const altitude = (lat: number, dec: number, t: number) =>
  Math.asin(
    Math.max(-1, Math.min(1, Math.sin(lat * DEG) * Math.sin(dec * DEG) + Math.cos(lat * DEG) * Math.cos(dec * DEG) * Math.cos(t * 15 * DEG)))
  ) / DEG;

const signed = (x: number) => `${x < 0 ? '−' : '+'}${fmt(Math.abs(x), 1)}°`;
const hoursText = (h: number) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}ʰ ${String(m % 60).padStart(2, '0')}ᵐ`;
};

export default function RiseSetLab() {
  const [lat, setLat] = useState(42.7);
  const [dec, setDec] = useState(38.78);

  const upper = 90 - Math.abs(lat - dec);
  const lower = Math.abs(lat + dec) - 90;
  const status = lower > H0 ? 'circumpolar' : upper < H0 ? 'never' : 'rises';
  // Часовият ъгъл на изгрева и залеза: cos t₀ = (sin h₀ − sin φ sin δ) / (cos φ cos δ)
  const cosT0 = (Math.sin(H0 * DEG) - Math.sin(lat * DEG) * Math.sin(dec * DEG)) / (Math.cos(lat * DEG) * Math.cos(dec * DEG));
  const t0 = status === 'rises' ? Math.acos(Math.max(-1, Math.min(1, cosT0))) / DEG / 15 : 0;

  const points = Array.from({ length: 97 }, (_, i) => {
    const t = -12 + i / 4;
    return `${xOf(t).toFixed(1)},${yOf(altitude(lat, dec, t)).toFixed(1)}`;
  }).join(' ');

  const place = PLACES.find(p => Math.abs(p.lat - lat) < 0.05);
  const star = STARS.find(s => Math.abs(s.dec - dec) < 0.005);
  const where = place ? `в ${place.name}` : `при φ = ${signed(lat)}`;
  const who = star ? star.name : 'Звездата';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Изгрява ли звездата?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Височината на звездата през едно денонощие според географската ширина <i>φ</i> и деклинацията ѝ <i>δ</i>.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Под хоризонта */}
        <rect x={GX0} y={yOf(0)} width={GX1 - GX0} height={GY1 - yOf(0)} fill="#14532d" fillOpacity="0.35" />
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="none" stroke="white" strokeOpacity="0.2" />
        {[-60, -30, 30, 60].map(h => (
          <g key={h}>
            <line x1={GX0} x2={GX1} y1={yOf(h)} y2={yOf(h)} stroke="white" strokeOpacity="0.08" />
            <text x={GX0 - 6} y={yOf(h) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.5">
              {h > 0 ? h : `−${-h}`}°
            </text>
          </g>
        ))}
        <line x1={GX0} x2={GX1} y1={yOf(0)} y2={yOf(0)} stroke="#4ade80" strokeWidth="1.5" />
        <text x={GX1 - 4} y={yOf(0) - 5} fontSize="10" textAnchor="end" fill="#4ade80">
          хоризонт
        </text>
        {[-12, -6, 0, 6, 12].map(t => (
          <g key={t}>
            <line x1={xOf(t)} x2={xOf(t)} y1={GY0} y2={GY1} stroke="white" strokeOpacity={t === 0 ? 0.25 : 0.08} strokeDasharray={t === 0 ? '4 4' : undefined} />
            <text x={xOf(t)} y={GY1 + 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {t > 0 ? `+${t}` : t < 0 ? `−${-t}` : 0}ʰ
            </text>
          </g>
        ))}
        <text x={xOf(0)} y={GY0 - 8} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          горна кулминация (t = 0ʰ)
        </text>
        <text x={xOf(-12) + 2} y={GY0 - 8} fontSize="10" fill="white" fillOpacity="0.5">
          долна
        </text>
        <text x={xOf(12) - 2} y={GY0 - 8} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.5">
          долна
        </text>

        {/* Пътят на звездата; над хоризонта е ярък */}
        <defs>
          <clipPath id="rise-set-above">
            <rect x={GX0} y={GY0} width={GX1 - GX0} height={yOf(H0) - GY0} />
          </clipPath>
        </defs>
        <polyline points={points} fill="none" stroke="#fde68a" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="3 4" />
        <polyline points={points} fill="none" stroke="#fde68a" strokeWidth="2.5" clipPath="url(#rise-set-above)" />
        <circle cx={xOf(0)} cy={yOf(upper)} r={4.5} fill="#fde68a" />
        {status === 'rises' && (
          <>
            <circle cx={xOf(-t0)} cy={yOf(H0)} r={4} fill="#fb923c" />
            <circle cx={xOf(t0)} cy={yOf(H0)} r={4} fill="#f87171" />
            <text x={xOf(-t0)} y={yOf(H0) + 16} fontSize="10" textAnchor="middle" fill="#fb923c">
              изгрев
            </text>
            <text x={xOf(t0)} y={yOf(H0) + 16} fontSize="10" textAnchor="middle" fill="#f87171">
              залез
            </text>
          </>
        )}

        {/* Числата */}
        <g fontSize="12" fill="white" transform="translate(414, 44)">
          <text x={0} y={0} fontWeight="700" fill={status === 'rises' ? '#fde68a' : status === 'circumpolar' ? '#86efac' : '#fca5a5'}>
            {status === 'circumpolar' ? 'Незалязваща' : status === 'never' ? 'Никога не изгрява' : 'Изгрява и залязва'}
          </text>
          <text x={0} y={28} fillOpacity="0.9">
            φ = {signed(lat)}, δ = {signed(dec)}
          </text>
          <text x={0} y={56} fillOpacity="0.85">
            Горна кулминация:
          </text>
          <text x={0} y={74} fill="#fde68a">
            h = 90° − |φ − δ| = {signed(upper)}
          </text>
          <text x={0} y={100} fillOpacity="0.85">
            Долна кулминация:
          </text>
          <text x={0} y={118} fill="#fde68a">
            h = |φ + δ| − 90° = {signed(lower)}
          </text>
          <text x={0} y={146} fillOpacity="0.85">
            Над хоризонта:
          </text>
          <text x={0} y={164} fill="#fde68a">
            {status === 'circumpolar' ? 'цялото денонощие' : status === 'never' ? 'никога' : `${hoursText(2 * t0)} от 24ʰ`}
          </text>
          <text x={0} y={200} fontSize="10" fillOpacity="0.5">
            Часовете са звездно време; изгрев и
          </text>
          <text x={0} y={214} fontSize="10" fillOpacity="0.5">
            залез – с рефракцията (h = −0,57°).
          </text>
        </g>
      </LabSvg>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Географска ширина φ = {signed(lat)}</label>
          <input type="range" min={-90} max={90} step={0.1} value={lat} onChange={e => setLat(Number(e.target.value))} className="w-full" />
          <div className="flex flex-wrap gap-1 mt-2">
            {PLACES.map(p => (
              <button
                key={p.name}
                onClick={() => setLat(p.lat)}
                className={`px-2 py-1 rounded text-xs border ${
                  place?.name === p.name
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Деклинация δ = {signed(dec)}</label>
          <input type="range" min={-90} max={90} step={0.01} value={dec} onChange={e => setDec(Number(e.target.value))} className="w-full" />
          <div className="flex flex-wrap gap-1 mt-2">
            {STARS.map(s => (
              <button
                key={s.name}
                onClick={() => setDec(s.dec)}
                className={`px-2 py-1 rounded text-xs border ${
                  star?.name === s.name
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {status === 'circumpolar'
          ? `${who} ${where} е незалязваща: дори в долна кулминация тя е над хоризонта. Това става, когато |φ + δ| > 90°, т.е. в северното полукълбо при δ > 90° − φ.`
          : status === 'never'
            ? `${who} ${where} никога не изгрява: дори в горна кулминация тя е под хоризонта. Това става, когато |φ − δ| > 90°, т.е. в северното полукълбо при δ < −(90° − φ). За да я видите, трябва да отидете по на юг.`
            : `${who} ${where} изгрява и залязва. Над хоризонта е ${hoursText(2 * t0)} от денонощието${
                dec * lat > 0 ? ' – повече от половината, защото е в същото полукълбо като наблюдателя' : dec * lat < 0 ? ' – по-малко от половината, защото е в другото полукълбо' : ''
              }.`}
      </p>
    </div>
  );
}
