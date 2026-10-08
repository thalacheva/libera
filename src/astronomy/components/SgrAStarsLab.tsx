import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 340;
const CX = 200;
const CY = 170;
const AU_PER_ARCSEC = 8277; // при разстояние 8,28 kpc
const M_BH = 4.3e6;

type Orbit = { name: string; a: number; e: number; i: number; Om: number; w: number; P: number; Tp: number; color: string };

// Приблизителни орбитални елементи (Гилесен и др., 2017)
const STARS: Orbit[] = [
  { name: 'S2', a: 0.1255, e: 0.884, i: 134.2, Om: 226.9, w: 65.5, P: 16.05, Tp: 2018.38, color: '#fde68a' },
  { name: 'S38', a: 0.1416, e: 0.818, i: 171.1, Om: 101.1, w: 17.1, P: 19.2, Tp: 2003.2, color: '#93c5fd' },
  { name: 'S55', a: 0.1078, e: 0.721, i: 150.1, Om: 325.5, w: 331.5, P: 12.8, Tp: 2009.3, color: '#f9a8d4' },
  { name: 'S1', a: 0.595, e: 0.556, i: 119.1, Om: 342.0, w: 122.3, P: 166, Tp: 2001.8, color: '#86efac' },
];

const rad = (d: number) => (d * Math.PI) / 180;

/** Положение на небето (″): x – на изток, y – на север; r – истинското разстояние до черната дупка (″). */
function position(o: Orbit, year: number) {
  const M = (2 * Math.PI * (year - o.Tp)) / o.P;
  let E = M;
  for (let k = 0; k < 20; k++) E -= (E - o.e * Math.sin(E) - M) / (1 - o.e * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + o.e) * Math.sin(E / 2), Math.sqrt(1 - o.e) * Math.cos(E / 2));
  const r = o.a * (1 - o.e * Math.cos(E));
  const u = rad(o.w) + nu;
  const north = r * (Math.cos(rad(o.Om)) * Math.cos(u) - Math.sin(rad(o.Om)) * Math.sin(u) * Math.cos(rad(o.i)));
  const east = r * (Math.sin(rad(o.Om)) * Math.cos(u) + Math.cos(rad(o.Om)) * Math.sin(u) * Math.cos(rad(o.i)));
  return { east, north, r };
}

export default function SgrAStarsLab() {
  const [year, setYear] = useState(2018.38);
  const [playing, setPlaying] = useState(false);
  const [sel, setSel] = useState('S2');
  const [wide, setWide] = useState(false);
  const star = STARS.find(s => s.name === sel)!;

  useAnimationFrame(playing, dt => setYear(y => (y + dt * 2 > 2040 ? 1995 : y + dt * 2)));

  const half = wide ? 1.0 : 0.3; // ″
  const scale = 150 / half;
  const toX = (east: number) => CX - east * scale; // изтокът е наляво, както на небето
  const toY = (north: number) => CY - north * scale;

  const p = position(star, year);
  const rAU = p.r * AU_PER_ARCSEC;
  const aAU = star.a * AU_PER_ARCSEC;
  const v = 29.78 * Math.sqrt(M_BH * (2 / rAU - 1 / aAU));
  const lightHours = (rAU * 499) / 3600;
  const mass = aAU ** 3 / star.P ** 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-400 dark:border-slate-500 mb-6">
      <h3 className="font-semibold mb-1 text-center">Звездите около Стрелец A*</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Орбитите на звезди в самия център на Галактиката, както се виждат на небето (север нагоре, изток наляво). Тези звезди се следят от 1992 г. в
        инфрачервено – през праха. Пуснете годините.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={CX - 160} y={CY - 160} width={320} height={320} fill="#020617" stroke="white" strokeOpacity="0.15" rx="6" />
        <defs>
          <clipPath id="sgr-clip">
            <rect x={CX - 160} y={CY - 160} width={320} height={320} rx="6" />
          </clipPath>
        </defs>
        <g clipPath="url(#sgr-clip)">
          {STARS.map(o => {
            const pts = Array.from({ length: 241 }, (_, k) => {
              const q = position(o, o.Tp + (k / 240) * o.P);
              return `${toX(q.east)},${toY(q.north)}`;
            }).join(' ');
            const now = position(o, year);
            const x = toX(now.east);
            const y = toY(now.north);
            const inside = Math.abs(x - CX) < 160 && Math.abs(y - CY) < 160;
            return (
              <g key={o.name} className="cursor-pointer" onClick={() => setSel(o.name)}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={o.color}
                  strokeOpacity={o.name === sel ? 0.8 : 0.3}
                  strokeWidth={o.name === sel ? 1.6 : 1}
                />
                {inside && <circle cx={x} cy={y} r={o.name === sel ? 5 : 3.5} fill={o.color} />}
                {inside && (
                  <text x={x + 7} y={y + 3} fontSize="10" fill={o.color}>
                    {o.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        <path d={`M ${CX - 6} ${CY} h 12 M ${CX} ${CY - 6} v 12`} stroke="white" strokeWidth="1.5" />
        <text x={CX + 8} y={CY - 6} fontSize="9" fill="white" fillOpacity="0.8">
          Sgr A*
        </text>
        <line x1={CX - 150} x2={CX - 150 + 0.1 * scale} y1={CY + 150} y2={CY + 150} stroke="#93c5fd" strokeWidth="2" />
        <text x={CX - 150} y={CY + 144} fontSize="9" fill="#93c5fd">
          0,1″ = {fmt(0.1 * AU_PER_ARCSEC, 0)} AU
        </text>

        <g fontSize="11" fill="white" transform="translate(390, 40)">
          <text x={0} y={0} fontSize="16" fontWeight="700">
            {fmt(year, 1)} г.
          </text>
          <text x={0} y={28} fontSize="13" fontWeight="700" fill={star.color}>
            {star.name}
          </text>
          <text x={0} y={48} fillOpacity="0.85">
            период: {fmt(star.P, star.P < 100 ? 2 : 0)} години, e = {fmt(star.e, 3)}
          </text>
          <text x={0} y={66} fillOpacity="0.85">
            голяма полуос: {fmt(star.a, 3)}″ = {fmt(aAU, 0)} AU
          </text>
          <text x={0} y={92} fillOpacity="0.85">
            разстояние до дупката: {fmt(rAU, 0)} AU
          </text>
          <text x={0} y={108} fontSize="10" fillOpacity="0.6">
            = {fmt(lightHours, 0)} светлинни часа
          </text>
          <text x={0} y={128} fill="#fde68a">
            скорост: {fmt(v, 0)} km/s = {fmt((v / 299792) * 100, 2)}% c
          </text>
          <text x={0} y={156} fillOpacity="0.85">
            M = a³ / P² = {sci(mass, 2)} M☉
          </text>
          <text x={0} y={180} fontSize="10" fillOpacity="0.6">
            Всички звезди дават една и съща маса –
          </text>
          <text x={0} y={194} fontSize="10" fillOpacity="0.6">
            значи обикалят около едно и също тяло.
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v2 => !v2)} className="px-4 py-1 rounded bg-slate-600 text-white text-sm hover:bg-slate-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {STARS.map(s => (
          <button
            key={s.name}
            onClick={() => setSel(s.name)}
            className={`px-3 py-1 rounded text-sm border ${
              s.name === sel
                ? 'border-slate-500 bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
        <label className="text-sm flex items-center gap-1 ml-2">
          <input type="checkbox" checked={wide} onChange={e => setWide(e.target.checked)} />
          по-широк изглед
        </label>
      </div>
      <input type="range" min="1995" max="2040" step="0.01" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full mt-3" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        През май 2018 г. S2 мина през перицентъра си на ~120 AU от черната дупка със скорост ~7700 km/s. Инструментът GRAVITY измери гравитационното
        червено отместване на светлината ѝ (2018) и бавното завъртане на орбитата ѝ (2020) – точно колкото предсказва общата теория на
        относителността. Следващото преминаване е през 2034 г.
      </p>
    </div>
  );
}
