import { useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';
import { DEG, julianDay, sunPosition } from '~/tonight/ephemeris';

const W = 640;
const H = 300;
const YEAR = 2026;
const EPS = 23.44; // наклон на еклиптиката, °
const SOFIA = 42.7;
/** Изгрев и залез на Слънцето: горният му край на хоризонта, с рефракцията. */
const H0_SUN = -0.833;

const MONTH_NAMES = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
const EVENTS = [
  { day: 79, name: 'Пролетно равноденствие' },
  { day: 172, name: 'Лятно слънцестоене' },
  { day: 266, name: 'Есенно равноденствие' },
  { day: 355, name: 'Зимно слънцестоене' },
];

// Картата: ректасцензия 0ʰ–24ʰ по хоризонтала, деклинация от +30° до −30° по вертикала
const MX0 = 40;
const MX1 = 620;
const MY0 = 24;
const MY1 = 176;
const xOf = (raHours: number) => MX0 + (raHours / 24) * (MX1 - MX0);
const yOf = (dec: number) => MY0 + ((30 - dec) / 60) * (MY1 - MY0);

/** Обед (10:00 UTC ≈ пладне в България) на дадения ден от годината, 1–365. */
const dateOf = (day: number) => new Date(Date.UTC(YEAR, 0, day, 10));

function sunOn(day: number) {
  const { ra, dec } = sunPosition(julianDay(dateOf(day)));
  // Еклиптичната дължина от α и δ: tg λ = (sin α cos ε + tg δ sin ε) / cos α
  const lon = ((Math.atan2(Math.sin(ra * DEG) * Math.cos(EPS * DEG) + Math.tan(dec * DEG) * Math.sin(EPS * DEG), Math.cos(ra * DEG)) / DEG) + 360) % 360;
  return { ra: ra / 15, dec, lon };
}

const raText = (h: number) => {
  const m = Math.round(h * 60) % (24 * 60);
  return `${Math.floor(m / 60)}ʰ ${String(m % 60).padStart(2, '0')}ᵐ`;
};
const durationText = (h: number) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)} ч ${m % 60} мин`;
};
const signed = (x: number) => `${x < -0.05 ? '−' : '+'}${fmt(Math.abs(x), 1)}°`;

/** Продължителност на деня: cos t₀ = (sin h₀ − sin φ sin δ) / (cos φ cos δ), денят е 2t₀ (слънчеви часове). */
function dayLength(dec: number) {
  const c = (Math.sin(H0_SUN * DEG) - Math.sin(SOFIA * DEG) * Math.sin(dec * DEG)) / (Math.cos(SOFIA * DEG) * Math.cos(dec * DEG));
  return (2 * Math.acos(Math.max(-1, Math.min(1, c)))) / DEG / 15;
}

// Еклиптиката като крива: за всяка дължина λ – α и δ
const ECLIPTIC = Array.from({ length: 145 }, (_, i) => {
  const l = i * 2.5 * DEG;
  const dec = Math.asin(Math.sin(EPS * DEG) * Math.sin(l)) / DEG;
  const ra = ((Math.atan2(Math.cos(EPS * DEG) * Math.sin(l), Math.cos(l)) / DEG + 360) % 360) / 15;
  return { ra: i === 144 ? 24 : ra, dec };
});

const MONTH_MARKS = MONTHS.map((name, m) => {
  const day = Math.round((Date.UTC(YEAR, m, 1) - Date.UTC(YEAR, 0, 1)) / 86400000) + 1;
  return { name, ...sunOn(day) };
});

export default function SunEclipticLab() {
  const [day, setDay] = useState(172);
  const sun = sunOn(day);
  const date = dateOf(day);
  const noon = 90 - SOFIA + sun.dec;
  const length = dayLength(sun.dec);
  const event = EVENTS.find(e => e.day === day);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Слънцето по еклиптиката</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        За една година Слънцето обикаля еклиптиката. Тя е наклонена към екватора, затова деклинацията на Слънцето се мени
        – а с нея и обедната височина и дължината на деня.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Мрежа на картата */}
        <rect x={MX0} y={MY0} width={MX1 - MX0} height={MY1 - MY0} fill="none" stroke="white" strokeOpacity="0.2" />
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
          <g key={h}>
            <line x1={xOf(h)} x2={xOf(h)} y1={MY0} y2={MY1} stroke="white" strokeOpacity="0.08" />
            <text x={xOf(h)} y={MY1 + 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
              {h}ʰ
            </text>
          </g>
        ))}
        {[-20, -10, 10, 20].map(d => (
          <text key={d} x={MX0 - 5} y={yOf(d) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.5">
            {d > 0 ? `+${d}` : `−${-d}`}°
          </text>
        ))}
        <text x={(MX0 + MX1) / 2} y={MY1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
          ректасцензия α
        </text>

        <line x1={MX0} x2={MX1} y1={yOf(0)} y2={yOf(0)} stroke="#60a5fa" strokeWidth="1.5" />
        <polyline
          points={ECLIPTIC.map(p => `${xOf(p.ra).toFixed(1)},${yOf(p.dec).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
        {/* Легенда – в ъгъла, където еклиптиката е под екватора */}
        <g fontSize="10" transform={`translate(${MX1 - 112}, ${MY0 + 14})`}>
          <line x1={0} x2={16} y1={-3} y2={-3} stroke="#60a5fa" strokeWidth="1.5" />
          <text x={22} y={0} fill="#60a5fa">
            небесен екватор
          </text>
          <line x1={0} x2={16} y1={13} y2={13} stroke="#fbbf24" strokeWidth="1.5" />
          <text x={22} y={16} fill="#fbbf24">
            еклиптика
          </text>
        </g>
        {[
          { ra: 0, dec: 0, label: '♈' },
          { ra: 12, dec: 0, label: '♎' },
        ].map(p => (
          <text key={p.label} x={xOf(p.ra) + (p.ra === 0 ? 8 : 0)} y={yOf(p.dec) + 16} fontSize="12" textAnchor="middle" fill="#93c5fd">
            {p.label}
          </text>
        ))}

        {/* Началото на всеки месец */}
        {MONTH_MARKS.map(m => (
          <g key={m.name}>
            <circle cx={xOf(m.ra)} cy={yOf(m.dec)} r={2} fill="white" fillOpacity="0.6" />
            <text x={xOf(m.ra)} y={yOf(m.dec) + (m.dec > 0 ? -6 : 12)} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {m.name}
            </text>
          </g>
        ))}

        {/* Слънцето */}
        <line x1={xOf(sun.ra)} x2={xOf(sun.ra)} y1={yOf(0)} y2={yOf(sun.dec)} stroke="#fde68a" strokeDasharray="3 3" />
        <circle cx={xOf(sun.ra)} cy={yOf(sun.dec)} r={8} fill="#fcd34d" />

        {/* Числата */}
        <g fontSize="12" fill="white" transform="translate(40, 228)">
          <text x={0} y={0} fontWeight="700" fill="#fde68a">
            {date.getUTCDate()} {MONTH_NAMES[date.getUTCMonth()]}{event ? ` – ${event.name}` : ''}
          </text>
          <text x={0} y={22} fillOpacity="0.9">
            λ = {fmt(sun.lon, 1)}°   α = {raText(sun.ra)}   δ = {signed(sun.dec)}
          </text>
          <text x={0} y={44} fillOpacity="0.9">
            В София (φ = 42,7°): по обед h = 90° − φ + δ = {fmt(noon, 1)}°, денят е {durationText(length)}
          </text>
        </g>
      </LabSvg>

      <label className="block text-sm font-semibold mt-4 mb-1">Ден от годината: {day}</label>
      <input type="range" min={1} max={365} step={1} value={day} onChange={e => setDay(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {EVENTS.map(e => (
          <button
            key={e.day}
            onClick={() => setDay(e.day)}
            className={`px-2 py-1 rounded text-xs border ${
              e.day === day
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Еклиптичната дължина <i>λ</i> расте почти равномерно – с около 1° на ден (малко по-бързо през януари, когато Земята е най-близо до Слънцето). Деклинацията обаче се мени най-бързо около
        равноденствията (тогава денят расте или намалява с 2–3 минути на ден) и почти спира около слънцестоенията. Летният
        и зимният ден в София се различават с над 6 часа, а обедната височина – с 47° (два пъти по 23,44°).
      </p>
    </div>
  );
}
