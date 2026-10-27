import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt, greatCircleKm } from '../geo';
import { LAND } from '../worldLand';

/** Острови и подводни планини от Хавайско-Императорската верига; възрасти – приблизителни, млн. години. */
const CHAIN = [
  { name: 'Килауеа', lat: 19.4, lon: -155.3, age: 0 },
  { name: 'Мауи', lat: 20.8, lon: -156.6, age: 1.3 },
  { name: 'Оаху', lat: 21.4, lon: -158.1, age: 3.0 },
  { name: 'Кауаи', lat: 22.1, lon: -159.5, age: 5.1 },
  { name: 'Нихоа', lat: 23.06, lon: -161.92, age: 7.2 },
  { name: 'Некер', lat: 23.58, lon: -164.7, age: 10.3 },
  { name: 'Лайсан', lat: 25.77, lon: -171.73, age: 19.9 },
  { name: 'Мидуей', lat: 28.2, lon: -177.37, age: 27.7 },
  { name: 'Дайкакуджи', lat: 32.1, lon: 172.3, age: 47 },
  { name: 'Коко', lat: 35.25, lon: 171.6, age: 48.1 },
  { name: 'Оджин', lat: 38.0, lon: 170.5, age: 55.2 },
  { name: 'Нинтоку', lat: 41.1, lon: 170.6, age: 56.2 },
  { name: 'Суйко', lat: 44.6, lon: 170.3, age: 64.7 },
  { name: 'Детройт', lat: 51.2, lon: 167.7, age: 76 },
];
// Разстояние по веригата от Килауеа, km
let acc = 0;
const POINTS = CHAIN.map((c, i) => ({ ...c, km: i ? (acc += greatCircleKm(CHAIN[i - 1], c)) : 0 }));

type Seg = 'hawaii' | 'emperor';
const SEGS: Record<Seg, { name: string; pick: (age: number) => boolean; cls: string }> = {
  hawaii: { name: 'Хавайска верига (0–28 млн. г.)', pick: a => a < 30, cls: 'stroke-rose-600' },
  emperor: { name: 'Императорска верига (47–76 млн. г.)', pick: a => a >= 47, cls: 'stroke-violet-600' },
};

/** Права по метода на най-малките квадрати: km = a + b · възраст. */
function fit(seg: Seg) {
  const p = POINTS.filter(q => SEGS[seg].pick(q.age));
  const n = p.length;
  const mx = p.reduce((s, q) => s + q.age, 0) / n;
  const my = p.reduce((s, q) => s + q.km, 0) / n;
  const b = p.reduce((s, q) => s + (q.age - mx) * (q.km - my), 0) / p.reduce((s, q) => s + (q.age - mx) ** 2, 0);
  return { a: my - b * mx, b, from: Math.min(...p.map(q => q.age)), to: Math.max(...p.map(q => q.age)) };
}
const FITS = { hawaii: fit('hawaii'), emperor: fit('emperor') };

// Карта на северната част на Тихия океан (дължини 150° – 215° и.д.)
const MX = 8;
const MY = 8;
const MW = 330;
const MH = 290;
const LON0 = 150;
const LON1 = 215;
const LAT0 = 10;
const LAT1 = 58;
const east = (lon: number) => (lon < 0 ? lon + 360 : lon);
const mapX = (lon: number) => MX + ((lon - LON0) / (LON1 - LON0)) * MW;
const mapY = (lat: number) => MY + ((LAT1 - lat) / (LAT1 - LAT0)) * MH;

const LAND_PATH = [0, 360]
  .map(shift =>
    LAND.map(ring => {
      let d = '';
      for (let i = 0; i < ring.length; i += 2) d += `${i ? 'L' : 'M'}${mapX(ring[i] / 10 + shift).toFixed(1)} ${mapY(ring[i + 1] / 10).toFixed(1)}`;
      return d + 'Z';
    }).join(''),
  )
  .join('');

// Графиката: възраст → разстояние
const GX = 410;
const GY = 30;
const GW = 210;
const GH = 230;
const gx = (age: number) => GX + (age / 80) * GW;
const gy = (km: number) => GY + GH - (km / 6000) * GH;

/** Горещата точка под Хаваите и следата ѝ: по възрастта на островите се намира скоростта на плочата. */
export default function HotspotLab() {
  const [sel, setSel] = useState(3);
  const [seg, setSeg] = useState<Seg>('hawaii');
  const clip = useId();
  const p = POINTS[sel];
  const f = FITS[seg];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <clipPath id={clip}>
          <rect x={MX} y={MY} width={MW} height={MH} />
        </clipPath>
        <rect x={MX} y={MY} width={MW} height={MH} className="fill-sky-100 dark:fill-slate-900" />
        <path d={LAND_PATH} clipPath={`url(#${clip})`} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/70" strokeWidth="0.6" />
        <path d={POINTS.map((q, i) => `${i ? 'L' : 'M'}${mapX(east(q.lon)).toFixed(1)} ${mapY(q.lat).toFixed(1)}`).join('')} fill="none" className="stroke-gray-500" strokeWidth="1" strokeDasharray="3 3" />
        {POINTS.map((q, i) => (
          <circle
            key={q.name}
            cx={mapX(east(q.lon))}
            cy={mapY(q.lat)}
            r={i === sel ? 7 : 4.5}
            className={`${q.age < 30 ? 'fill-rose-500' : 'fill-violet-500'} stroke-white cursor-pointer`}
            strokeWidth="1.5"
            onClick={() => setSel(i)}
          />
        ))}
        <text x={mapX(east(p.lon)) + 10} y={mapY(p.lat) + 4} fontSize="12" fontWeight="bold" className="fill-gray-900 dark:fill-white">
          {p.name}
        </text>
        <circle cx={mapX(east(-155.3))} cy={mapY(19.4)} r={12} fill="none" className="stroke-red-600" strokeWidth="2" strokeDasharray="3 2" />
        <text x={mapX(east(-155.3)) - 4} y={mapY(19.4) + 26} fontSize="11" textAnchor="end" className="fill-red-700 dark:fill-red-300">
          гореща точка
        </text>
        <text x={MX + 6} y={MY + MH - 8} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          Тихи океан
        </text>
        {[20, 30, 40, 50].map(la => (
          <text key={la} x={MX + MW - 4} y={mapY(la) - 2} fontSize="9" textAnchor="end" className="fill-gray-400">
            {la}° с.ш.
          </text>
        ))}

        {/* Графика възраст – разстояние */}
        <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} className="stroke-gray-500" />
        <line x1={GX} y1={GY} x2={GX} y2={GY + GH} className="stroke-gray-500" />
        {[0, 20, 40, 60, 80].map(a => (
          <text key={a} x={gx(a)} y={GY + GH + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {a}
          </text>
        ))}
        {[0, 2000, 4000, 6000].map(km => (
          <text key={km} x={GX - 4} y={gy(km) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {km}
          </text>
        ))}
        <text x={GX + GW / 2} y={GY + GH + 28} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          възраст, млн. години
        </text>
        <text x={GX - 4} y={GY - 10} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          km
        </text>
        <line x1={gx(f.from)} y1={gy(f.a + f.b * f.from)} x2={gx(f.to)} y2={gy(f.a + f.b * f.to)} className={SEGS[seg].cls} strokeWidth="2.5" />
        {POINTS.map((q, i) => (
          <circle key={q.name} cx={gx(q.age)} cy={gy(q.km)} r={i === sel ? 6 : 4} className={`${q.age < 30 ? 'fill-rose-500' : 'fill-violet-500'} stroke-white cursor-pointer`} strokeWidth="1.2" onClick={() => setSel(i)} />
        ))}
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Щракни върху остров или подводна планина на картата или на графиката.</p>
      <Buttons>
        {(Object.keys(SEGS) as Seg[]).map(s => (
          <DiagramButton key={s} active={seg === s} onClick={() => setSeg(s)}>
            {SEGS[s].name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: p.name, value: `${fmt(p.age, 1)} млн. г.` },
            { label: 'по веригата от Килауеа', value: `${fmt(p.km)} km` },
            { label: 'средна скорост до тук', value: p.age ? `${fmt(p.km / (p.age * 10), 1)} cm/год` : '—' },
            { label: 'наклон на правата', value: `${fmt(f.b / 10, 1)} cm/год`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
}
