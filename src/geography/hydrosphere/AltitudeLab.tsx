import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Природните зони от екватора към полюса – по температурата, без сухите (пустини и степи)
const ZONE_STRIP = [
  { name: 'ледени пустини', color: '#e5edf5' },
  { name: 'тундра', color: '#9fb3c8' },
  { name: 'тайга', color: '#3e7a5a' },
  { name: 'широколистни гори', color: '#62a35e' },
  { name: 'субтропични гори', color: '#48a07c' },
  { name: 'савани', color: '#c7a43e' },
  { name: 'тропични гори', color: '#2e7a3e' },
];

type Belt = {
  name: string;
  from: number;
  to: number;
  color: string;
  zone: number;
};
type Mountain = {
  name: string;
  where: string;
  lat: string;
  t0: number;
  top: number;
  belts: Belt[];
};

// Приблизителни граници на поясите (m); в различните източници се различават с няколкостотин метра
const MOUNTAINS: Mountain[] = [
  {
    name: 'Рила',
    where: 'Мусала',
    lat: '42° с.ш.',
    t0: 13.5,
    top: 2925,
    belts: [
      { name: 'дъбови гори', from: 0, to: 1000, color: '#8fb35a', zone: 3 },
      { name: 'букови гори', from: 1000, to: 1500, color: '#62a35e', zone: 3 },
      {
        name: 'иглолистни гори (смърч, мура, ела)',
        from: 1500,
        to: 2100,
        color: '#3e7a5a',
        zone: 2,
      },
      {
        name: 'клек и хвойна (субалпийски пояс)',
        from: 2100,
        to: 2500,
        color: '#7f9a6a',
        zone: 1,
      },
      {
        name: 'алпийски ливади и скали',
        from: 2500,
        to: 2925,
        color: '#b9c7a0',
        zone: 1,
      },
    ],
  },
  {
    name: 'Алпи',
    where: 'Монблан',
    lat: '46° с.ш.',
    t0: 11,
    top: 4808,
    belts: [
      {
        name: 'широколистни гори, лозя и ниви',
        from: 0,
        to: 800,
        color: '#8fb35a',
        zone: 3,
      },
      {
        name: 'бук и ела (планински пояс)',
        from: 800,
        to: 1500,
        color: '#62a35e',
        zone: 3,
      },
      {
        name: 'смърч, лиственица и бор (субалпийски пояс)',
        from: 1500,
        to: 2100,
        color: '#3e7a5a',
        zone: 2,
      },
      {
        name: 'алпийски ливади',
        from: 2100,
        to: 2900,
        color: '#b9c7a0',
        zone: 1,
      },
      {
        name: 'вечни снегове и ледници',
        from: 2900,
        to: 4808,
        color: '#e5edf5',
        zone: 0,
      },
    ],
  },
  {
    name: 'Килиманджаро',
    where: 'Ухуру',
    lat: '3° ю.ш.',
    t0: 26,
    top: 5895,
    belts: [
      {
        name: 'савана и обработваеми земи',
        from: 0,
        to: 1800,
        color: '#c7a43e',
        zone: 5,
      },
      {
        name: 'планинска тропична гора',
        from: 1800,
        to: 2800,
        color: '#2e7a3e',
        zone: 4,
      },
      {
        name: 'вресища и храсталаци',
        from: 2800,
        to: 4000,
        color: '#8a9a5a',
        zone: 1,
      },
      {
        name: 'алпийска пустиня',
        from: 4000,
        to: 5000,
        color: '#cbbfa8',
        zone: 1,
      },
      { name: 'лед и скали', from: 5000, to: 5895, color: '#e5edf5', zone: 0 },
    ],
  },
  {
    name: 'Андите',
    where: 'Чимборасо, Еквадор',
    lat: '1° ю.ш.',
    t0: 26,
    top: 6263,
    belts: [
      {
        name: 'влажна тропична гора („гореща земя“)',
        from: 0,
        to: 1000,
        color: '#2e7a3e',
        zone: 6,
      },
      {
        name: 'планински гори („умерена земя“)',
        from: 1000,
        to: 2000,
        color: '#48a07c',
        zone: 4,
      },
      {
        name: 'облачни гори и ниви („студена земя“)',
        from: 2000,
        to: 3300,
        color: '#62a35e',
        zone: 3,
      },
      {
        name: 'парамо – треви и храсти',
        from: 3300,
        to: 4800,
        color: '#9fb3c8',
        zone: 1,
      },
      {
        name: 'вечни снегове',
        from: 4800,
        to: 6263,
        color: '#e5edf5',
        zone: 0,
      },
    ],
  },
];

const HMAX = 6500;
const BASE = 320;
const TOPY = 24;
const yOf = (h: number) => BASE - (h / HMAX) * (BASE - TOPY);
const MX0 = 70;
const MX1 = 380;
const LAPSE = 0.6; // °C на 100 m

/** Силует на планината: по-стръмен към върха. */
function ridge(top: number) {
  const mid = (MX0 + MX1) / 2;
  const half = (MX1 - MX0) / 2;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = -1 + (2 * i) / 60;
    const h = top * (1 - Math.abs(u) ** 0.8) * (1 + 0.04 * Math.sin(9 * u));
    pts.push(`${(mid + u * half).toFixed(1)},${yOf(Math.max(0, h)).toFixed(1)}`);
  }
  return `M${MX0},${BASE} L${pts.join(' L')} L${MX1},${BASE} Z`;
}

const SX = 470;
const SW = 140;
const SH = (BASE - TOPY) / ZONE_STRIP.length;

/** Височинни пояси в четири планини и зоните по ширина, на които отговарят. */
export default function AltitudeLab() {
  const [mi, setMi] = useState(0);
  const [h, setH] = useState(1800);
  const m = MOUNTAINS[mi];
  const hh = Math.min(h, m.top);
  const belt = m.belts.find(b => hh >= b.from && hh <= b.to) ?? m.belts[m.belts.length - 1];
  const t = m.t0 - (LAPSE * hh) / 100;
  const clip = `alt-clip-${mi}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 350" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id={clip}>
            <path d={ridge(m.top)} />
          </clipPath>
        </defs>
        {[0, 1000, 2000, 3000, 4000, 5000, 6000].map(v => (
          <g key={v}>
            <line x1={MX0 - 6} y1={yOf(v)} x2={MX1 + 10} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={MX0 - 10} y={yOf(v) + 4} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {fmt(v)}
            </text>
          </g>
        ))}
        <text x={MX0 - 10} y={TOPY - 8} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          h, m
        </text>
        <g clipPath={`url(#${clip})`}>
          {m.belts.map(b => (
            <rect key={b.name} x={MX0} y={yOf(b.to)} width={MX1 - MX0} height={yOf(b.from) - yOf(b.to)} fill={b.color} />
          ))}
        </g>
        <path d={ridge(m.top)} fill="none" className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="1.5" />
        <text x={(MX0 + MX1) / 2} y={yOf(m.top) - 8} fontSize="12" textAnchor="middle" fontWeight="600" className="fill-gray-800 dark:fill-gray-100">
          {m.where} {fmt(m.top)} m
        </text>
        {/* Границите на поясите */}
        {m.belts.slice(1).map(b => (
          <g key={b.name}>
            <line x1={MX0} y1={yOf(b.from)} x2={MX1} y2={yOf(b.from)} className="stroke-gray-700/40 dark:stroke-gray-200/40" strokeDasharray="3 3" />
            <text x={MX1 + 4} y={yOf(b.from) + 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              {fmt(b.from)}
            </text>
          </g>
        ))}
        {/* Катерачът */}
        <line x1={MX0 - 6} y1={yOf(hh)} x2={MX1 + 40} y2={yOf(hh)} className="stroke-rose-600" strokeWidth="1.5" />
        <circle cx={MX1 + 40} cy={yOf(hh)} r={5} className="fill-rose-600" />

        {/* Зоните по ширина */}
        <text x={SX + SW / 2} y={TOPY - 8} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          зоните по ширина
        </text>
        {ZONE_STRIP.map((z, i) => {
          const y = TOPY + i * SH;
          const on = belt.zone === i;
          return (
            <g key={z.name}>
              <rect
                x={SX}
                y={y}
                width={SW}
                height={SH - 2}
                rx={4}
                fill={z.color}
                opacity={on ? 1 : 0.35}
                className={on ? 'stroke-rose-600' : ''}
                strokeWidth={on ? 3 : 0}
              />
              <text x={SX + SW / 2} y={y + SH / 2 + 3} fontSize="11" textAnchor="middle" fontWeight={on ? 700 : 400} className="fill-gray-900">
                {z.name}
              </text>
            </g>
          );
        })}
        <text x={SX + SW / 2} y={BASE + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          ↑ към полюса
        </text>
        <path
          d={`M${MX1 + 46} ${yOf(hh)} C ${MX1 + 70} ${yOf(hh)}, ${SX - 30} ${TOPY + (belt.zone + 0.5) * SH}, ${SX - 2} ${TOPY + (belt.zone + 0.5) * SH}`}
          fill="none"
          className="stroke-rose-600"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
      </LabSvg>
      <Buttons>
        {MOUNTAINS.map((x, i) => (
          <DiagramButton key={x.name} active={i === mi} onClick={() => setMi(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="h, m" value={h} onChange={setH} min={0} max={6200} step={50} tone="rose" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        h – височината, до която си се изкачил. Границите на поясите са приблизителни, а температурата е оценена с 0,6 °C на 100 m от средната годишна
        температура в подножието.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'планина', value: `${m.name} (${m.lat})`, tone: 'gray' },
            { label: 'височина', value: `${fmt(hh)} m`, tone: 'rose' },
            { label: 't год.', value: `≈ ${fmt(t, 1)} °C`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="emerald">
        {h > m.top ? `Над върха няма планина – показан е най-горният пояс. ` : ''}
        Пояс: {belt.name} – като зоната „{ZONE_STRIP[belt.zone].name}“
      </Note>
    </div>
  );
}
