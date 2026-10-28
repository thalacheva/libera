import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { OBLIQUITY, deg, fmt, rad } from '../geo';

const S0 = 1361;

const DATES = [
  { name: '21 март', dec: 0 },
  { name: '21 юни', dec: OBLIQUITY },
  { name: '23 септ.', dec: 0 },
  { name: '21 дек.', dec: -OBLIQUITY },
];

/** Височина на Слънцето при ширина φ, деклинация δ и местно слънчево време t (часове). */
const altitude = (lat: number, dec: number, t: number) => {
  const c = Math.sin(rad(lat)) * Math.sin(rad(dec)) + Math.cos(rad(lat)) * Math.cos(rad(dec)) * Math.cos(rad(15 * (t - 12)));
  return deg(Math.asin(Math.max(-1, Math.min(1, c))));
};

/** Средна за денонощието мощност над атмосферата, W/m² (без промяната на разстоянието до Слънцето). */
const dailyInsolation = (lat: number, dec: number) => {
  const p = rad(lat);
  const d = rad(dec);
  const x = -Math.tan(p) * Math.tan(d);
  if (x >= 1) return 0;
  const H0 = x <= -1 ? Math.PI : Math.acos(x);
  return (S0 / Math.PI) * (H0 * Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.sin(H0));
};

/** Пряка слънчева радиация на земята при ясно небе – емпирично приближение (Мейнел): 0,7^(m^0,678). */
const groundDirect = (h: number) => (h <= 0 ? 0 : S0 * 0.7 ** ((1 / Math.sin(rad(Math.max(h, 1)))) ** 0.678));

// Ляв чертеж: сноп лъчи върху земята
const GX = 155;
const GY = 250;
const ATM = 60;
const BEAM = 46;

// Десен чертеж: средна мощност по ширини
const PX = 360;
const PW = 260;
const PY = 30;
const PH = 210;
const xOfLat = (lat: number) => PX + ((lat + 90) / 180) * PW;
const yOfQ = (q: number) => PY + PH - (q / 560) * PH;

const curvePath = (dec: number) =>
  Array.from({ length: 181 }, (_, i) => {
    const lat = -90 + i;
    return `${i ? 'L' : 'M'}${xOfLat(lat).toFixed(1)} ${yOfQ(dailyInsolation(lat, dec)).toFixed(1)}`;
  }).join('');

/** Колко енергия получава 1 m² земя според ширината, датата и часа. */
export default function InsolationLab() {
  const [lat, setLat] = useState(43);
  const [date, setDate] = useState(1);
  const [hour, setHour] = useState(12);
  const dec = DATES[date].dec;
  const h = altitude(lat, dec, hour);
  const day = h > 0;
  const sinh = Math.sin(rad(Math.max(h, 0)));
  const q = dailyInsolation(lat, dec);
  const noon = 90 - Math.abs(lat - dec);

  // Сноп с ширина BEAM, който пада под ъгъл h и се разлива по земята
  const hh = Math.max(h, 3);
  const c = Math.cos(rad(hh));
  const s = Math.sin(rad(hh));
  const foot = BEAM / s;
  const far = 400;
  const xa = GX - foot / 2;
  const xb = GX + foot / 2;
  const beam = `M${xa} ${GY}L${xb} ${GY}L${xb - c * far} ${GY - s * far}L${xa - c * far} ${GY - s * far}Z`;
  const sun = { x: GX - c * 150, y: GY - s * 150 };
  const atmTop = { x: GX - (ATM / s) * c, y: GY - ATM };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="ins-left">
            <rect x={10} y={10} width={290} height={GY - 10} />
          </clipPath>
        </defs>
        {/* Ляво: сноп лъчи */}
        <rect x={10} y={10} width={290} height={GY - 10} className={day ? 'fill-sky-100 dark:fill-slate-800' : 'fill-slate-300 dark:fill-slate-950'} />
        <rect x={10} y={GY - ATM} width={290} height={ATM} className="fill-sky-300/50 dark:fill-sky-900/50" />
        <text x={292} y={GY - ATM + 13} fontSize="10" textAnchor="end" className="fill-sky-800 dark:fill-sky-200">
          атмосфера
        </text>
        {day && (
          <g clipPath="url(#ins-left)">
            <path d={beam} className="fill-amber-300/60 dark:fill-amber-400/40 stroke-amber-500" strokeWidth="1" />
            <line x1={GX} y1={GY} x2={atmTop.x} y2={atmTop.y} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="3" />
            <circle cx={sun.x} cy={sun.y} r={13} className="fill-amber-400 stroke-amber-600" strokeWidth="1.5" />
          </g>
        )}
        <rect x={10} y={GY} width={290} height={14} className="fill-lime-700/70 dark:fill-lime-900" />
        {day && (
          <>
            <line x1={Math.max(10, xa)} y1={GY + 7} x2={Math.min(300, xb)} y2={GY + 7} className="stroke-amber-300" strokeWidth="4" />
            <path d={`M${GX - 30} ${GY}A30 30 0 0 1 ${GX - 30 * c} ${GY - 30 * s}`} fill="none" className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="1.5" />
            <text x={GX - 38 - 10 * Math.cos(rad(hh / 2))} y={GY - 6 - 10 * Math.sin(rad(hh / 2))} fontSize="11" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
              h
            </text>
          </>
        )}
        <text x={20} y={GY + 30} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          {day ? `Снопът от 1 m² огрява ${fmt(1 / sinh, 2)} m² земя` : 'Слънцето е под хоризонта'}
        </text>
        <text x={20} y={28} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          {day ? `h = ${fmt(h, 1)}°` : 'нощ'}
        </text>
        {day && (
          <text x={20} y={44} fontSize="10" className="fill-rose-700 dark:fill-rose-300">
            път през въздуха × {fmt(1 / sinh, 2)}
          </text>
        )}

        {/* Дясно: средна мощност по ширини */}
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-gray-50 dark:fill-slate-900" />
        {[0, 100, 200, 300, 400, 500].map(v => (
          <g key={v}>
            <line x1={PX} y1={yOfQ(v)} x2={PX + PW} y2={yOfQ(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 5} y={yOfQ(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        {[-90, -60, -30, 0, 30, 60, 90].map(v => (
          <text key={v} x={xOfLat(v)} y={PY + PH + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {v}°
          </text>
        ))}
        {[3, 1, 0].map(i => (
          <path key={i} d={curvePath(DATES[i].dec)} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.2" />
        ))}
        <path d={curvePath(dec)} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.5" />
        <line x1={xOfLat(lat)} y1={PY} x2={xOfLat(lat)} y2={PY + PH} className="stroke-sky-600" strokeDasharray="4 3" />
        <circle cx={xOfLat(lat)} cy={yOfQ(q)} r={5} className="fill-sky-600 stroke-white" strokeWidth="1.5" />
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-400" />
        <text x={PX + PW / 2} y={PY - 10} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          средно за денонощието над атмосферата, W/m²
        </text>
        <text x={PX + PW / 2} y={PY + PH + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          географска ширина (юг ← → север)
        </text>
      </LabSvg>
      <Buttons>
        {DATES.map((d, i) => (
          <DiagramButton key={d.name} active={i === date} onClick={() => setDate(i)}>
            {d.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={-90} max={90} step={1} tone="blue" />
        <Slider label="час" value={hour} onChange={setHour} min={0} max={24} step={0.5} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">φ – географска ширина (южната е с минус); час – местно слънчево време.</p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'h по пладне', value: `${fmt(Math.max(noon, 0), 1)}°` },
            { label: 'над атмосферата', value: `${fmt(S0 * sinh)} W/m²`, tone: 'amber' },
            { label: 'на земята (ясно)', value: `≈ ${fmt(groundDirect(h))} W/m²`, tone: 'rose' },
            { label: 'средно за денонощието', value: `${fmt(q)} W/m²`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={day ? 'amber' : 'gray'}>
        {!day
          ? 'Нощ – 1 m² не получава слънчева енергия.'
          : h < 20
            ? 'Слънцето е ниско: снопът се разлива върху голяма площ и минава през дебел слой въздух.'
            : h > 70
              ? 'Слънцето е високо: снопът пада почти отвесно и грее най-силно.'
              : 'Колкото по-ниско е Слънцето, толкова по-малко енергия пада на 1 m²: I = S · sin h.'}
      </Note>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Мощността на земята е за пряката радиация при чисто небе (приблизително). Сивите криви – останалите дати.
      </p>
    </div>
  );
}
