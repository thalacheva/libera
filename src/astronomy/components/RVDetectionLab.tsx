import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const GX0 = 50;
const GX1 = 620;
const GY0 = 30;
const GY1 = 230;
const OMEGA = 1; // аргумент на периастъра, rad

const PRESETS = [
  { name: '51 Пегас b', m: 0.47, P: 4.23, ms: 1.11, e: 0.01, text: 'Първата планета около звезда като Слънцето (Майор и Келос, 1995 г., Нобелова награда 2019 г.). Горещ юпитер с период 4,2 дни – никой не очакваше гигант толкова близо до звездата.' },
  { name: 'аналог на Юпитер', m: 1, P: 4333, ms: 1, e: 0.05, text: 'Юпитер люлее Слънцето с 12,5 m/s за 11,9 години. За да го видим, трябва да наблюдаваме звездата повече от десетилетие.' },
  { name: 'Проксима b', m: 0.0034, P: 11.19, ms: 0.122, e: 0.02, text: 'Най-близката екзопланета (2016 г.) – около малкото червено джудже Проксима Кентавър. Леката звезда се люлее по-силно, затова и планета колкото Земята дава 1,4 m/s.' },
  { name: 'аналог на Земята', m: 0.00315, P: 365.25, ms: 1, e: 0.02, text: 'Земята люлее Слънцето само с 9 cm/s – по-бавно от охлюв. Дори най-добрите спектрографи още не могат да видят това – пречат и „шумовете“ на самата звезда (петна, гранулация).' },
];

const INSTRUMENTS = [
  { name: '1990-те (ELODIE)', sigma: 13 },
  { name: 'HARPS (2003)', sigma: 1 },
  { name: 'ESPRESSO (2018)', sigma: 0.3 },
];

function rnd(n: number) {
  const x = Math.sin(n * 91.345 + 7.77) * 43758.5453;
  return x - Math.floor(x);
}
const gauss = (n: number) => Math.sqrt(-2 * Math.log(rnd(n) + 1e-9)) * Math.cos(2 * Math.PI * rnd(n + 501));

function kepler(M: number, e: number) {
  let E = M;
  for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/** Радиална скорост в единици K при фаза φ ∈ [0, 1). */
function rvShape(phi: number, e: number) {
  const E = kepler(2 * Math.PI * phi, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  return Math.cos(nu + OMEGA) + e * Math.cos(OMEGA);
}

function formatTime(d: number) {
  return d < 700 ? `${fmt(d, 0)} дни` : `${fmt(d / 365.25, 1)} г.`;
}

export default function RVDetectionLab() {
  const [pi, setPi] = useState(0);
  const [ii, setIi] = useState(1);
  const [n, setN] = useState(40);
  const [e, setE] = useState(PRESETS[0].e);
  const [folded, setFolded] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const p = PRESETS[pi];
  const sigma = INSTRUMENTS[ii].sigma;

  const K = (28.43 * p.m) / (p.ms ** (2 / 3) * (p.P / 365.25) ** (1 / 3) * Math.sqrt(1 - e * e));
  const baseline = p.P * 2.6;
  const obs = Array.from({ length: n }, (_, i) => {
    const t = rnd(i + 1) * baseline;
    const phi = (t / p.P) % 1;
    return { t, phi, v: K * rvShape(phi, e) + sigma * gauss(i + 3) };
  });
  const snr = (K / sigma) * Math.sqrt(n / 2);
  const yMax = Math.max(K * (1 + e) * 1.25, 3 * sigma);

  const gx = (u: number) => GX0 + u * (GX1 - GX0);
  const gy = (v: number) => (GY0 + GY1) / 2 - (v / yMax) * ((GY1 - GY0) / 2);
  const model = Array.from({ length: 401 }, (_, i) => {
    const u = i / 400;
    const phi = folded ? u : ((u * baseline) / p.P) % 1;
    return `${gx(u)},${gy(K * rvShape(phi, e))}`;
  }).join(' ');

  const verdict = snr >= 7 ? 'ясно откриване ✓' : snr >= 3 ? 'съмнителен сигнал – нужни са още наблюдения' : 'сигналът се губи в шума ✗';
  const yTick = yMax >= 10 ? Math.round(yMax / 2 / 5) * 5 || 5 : yMax >= 1 ? Math.round(yMax / 2) || 1 : Math.round((yMax / 2) * 10) / 10 || 0.1;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Лов на планети с радиални скорости</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Планетата и звездата обикалят общ център на масите. Спектрографът мери как звездата се приближава и отдалечава. Но всяко
        измерване има грешка – виждате ли сигнала в шума?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="rv-clip">
            <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} />
          </clipPath>
        </defs>
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <line x1={GX0} x2={GX1} y1={gy(0)} y2={gy(0)} stroke="white" strokeOpacity="0.25" strokeDasharray="3 3" />
        {[-yTick, yTick].map(v => (
          <g key={v}>
            <line x1={GX0} x2={GX1} y1={gy(v)} y2={gy(v)} stroke="white" strokeOpacity="0.07" />
            <text x={GX0 - 4} y={gy(v) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
              {v > 0 ? '+' : '−'}
              {fmt(Math.abs(v), 1)}
            </text>
          </g>
        ))}
        <text x={GX0 - 4} y={gy(0) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          0
        </text>
        <text x={GX0 + 6} y={GY0 + 13} fontSize="9" fill="white" fillOpacity="0.6">
          радиална скорост, m/s
        </text>
        <g clipPath="url(#rv-clip)">
          {showModel && <polyline points={model} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.85" />}
          {obs.map((o, i) => {
            const cx = gx(folded ? o.phi : o.t / baseline);
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={gy(o.v - sigma)} y2={gy(o.v + sigma)} stroke="#7dd3fc" strokeOpacity="0.5" />
                <circle cx={cx} cy={gy(o.v)} r={2.6} fill="#7dd3fc" />
              </g>
            );
          })}
        </g>
        <text x={GX0} y={GY1 + 14} fontSize="9" fill="white" fillOpacity="0.55">
          0
        </text>
        <text x={GX1} y={GY1 + 14} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          {folded ? 'фаза 1' : formatTime(baseline)}
        </text>
        <text x={(GX0 + GX1) / 2} y={GY1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          {folded ? `сгънато с периода P = ${formatTime(p.P)}` : 'време на наблюдение'}
        </text>
        <g fontSize="11" fill="white" transform={`translate(${GX0}, ${GY1 + 36})`}>
          <text x={0} y={0} fill="#fde68a" fontWeight="700">
            K = {K >= 1 ? `${fmt(K, 1)} m/s` : `${fmt(K * 100, 0)} cm/s`}
          </text>
          <text x={130} y={0} fillOpacity="0.8">
            грешка σ = {fmt(sigma, 1)} m/s · сигнал/шум ≈ {fmt(snr, snr < 10 ? 1 : 0)}
          </text>
          <text x={0} y={20} fill={snr >= 7 ? '#86efac' : snr >= 3 ? '#fde68a' : '#fca5a5'} fontWeight="700">
            {verdict}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Брой измервания: {n}</label>
          <input type="range" min="8" max="200" step="1" value={n} onChange={ev => setN(Number(ev.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Ексцентрицитет e = {fmt(e, 2)}</label>
          <input type="range" min="0" max="0.8" step="0.01" value={e} onChange={ev => setE(Number(ev.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {PRESETS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => {
              setPi(i);
              setE(q.e);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-2">
        {INSTRUMENTS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => setIi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === ii ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}: ±{fmt(q.sigma, 1)} m/s
          </button>
        ))}
        <button onClick={() => setFolded(v => !v)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          {folded ? '↺ по време' : '⤵ сгъни с периода'}
        </button>
        <button onClick={() => setShowModel(v => !v)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          {showModel ? 'скрий модела' : 'покажи модела'}
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {p.text} Амплитудата е K ≈ 28,4 m/s · (m sin i / M_Юп) · (M★/M☉)^(−2/3) · (P / 1 г.)^(−1/3). Методът дава само m sin i –
        долна граница за масата, защото не знаем наклона на орбитата.
      </p>
    </div>
  );
}
