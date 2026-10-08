import { useState } from 'react';
import { temperatureToRGB } from './light';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const SCX = 150;
const SCY = 140;
const SR = 100; // радиус на звездата в px
const R_SUN_EARTH = 109.1;
const U = 0.6; // потъмняване към ръба
// Графика
const GX0 = 320;
const GX1 = 620;
const GY0 = 50;
const GY1 = 220;
const XMAX = 1.6; // хоризонтален обхват в звездни радиуси

const PRESETS = [
  { name: 'Земята и Слънцето', rp: 1, rs: 1, ms: 1, T: 5772, P: 365.25 },
  { name: 'Юпитер и Слънцето', rp: 11.2, rs: 1, ms: 1, T: 5772, P: 4333 },
  { name: 'Горещ юпитер HD 209458 b', rp: 15.3, rs: 1.2, ms: 1.12, T: 6070, P: 3.52 },
  { name: 'TRAPPIST-1 e', rp: 0.92, rs: 0.119, ms: 0.09, T: 2566, P: 6.1 },
];

/** Площ на сечението на кръг с радиус 1 и кръг с радиус k на разстояние d. */
function overlap(d: number, k: number) {
  if (d >= 1 + k) return 0;
  if (d <= 1 - k) return Math.PI * k * k;
  if (d <= k - 1) return Math.PI;
  const a1 = Math.acos((d * d + 1 - k * k) / (2 * d));
  const a2 = Math.acos((d * d + k * k - 1) / (2 * d * k));
  return a1 + k * k * a2 - 0.5 * Math.sqrt((-d + 1 + k) * (d + 1 - k) * (d - 1 + k) * (d + 1 + k));
}

/** Относителна загуба на светлина при планета с k = Rp/Rs на разстояние d от центъра. */
function dip(d: number, k: number) {
  const A = overlap(d, k);
  if (A === 0) return 0;
  const r = Math.min(d, 1);
  const mu = Math.sqrt(Math.max(1 - r * r, 0));
  const I = 1 - U * (1 - mu);
  return (A * I) / (Math.PI * (1 - U / 3));
}

export default function TransitLab() {
  const [pi, setPi] = useState(2);
  const [logRp, setLogRp] = useState(Math.log10(PRESETS[2].rp));
  const [b, setB] = useState(0.3);
  const [x, setX] = useState(-1.4);
  const [playing, setPlaying] = useState(false);
  const p = PRESETS[pi];
  const rp = 10 ** logRp;
  const k = rp / (p.rs * R_SUN_EARTH);

  useAnimationFrame(playing, dt => setX(v => (v + dt * 0.5 > XMAX ? -XMAX : v + dt * 0.5)));

  const depthMax = Math.max(...Array.from({ length: 81 }, (_, i) => dip(Math.hypot(-XMAX + (i / 40) * XMAX, b), k)));
  const yScale = Math.max(depthMax * 1.3, 1e-4);
  const curve = Array.from({ length: 241 }, (_, i) => {
    const xx = -XMAX + (i / 120) * XMAX;
    const f = dip(Math.hypot(xx, b), k);
    return `${GX0 + ((xx + XMAX) / (2 * XMAX)) * (GX1 - GX0)},${GY0 + (f / yScale) * (GY1 - GY0)}`;
  }).join(' ');
  const fNow = dip(Math.hypot(x, b), k);

  // Продължителност на транзита (кръгова орбита)
  const aAU = Math.cbrt(p.ms * (p.P / 365.25) ** 2);
  const aRs = (aAU * 215.03) / p.rs;
  const chord = (1 + k) ** 2 - b * b;
  const durH = chord > 0 ? ((p.P * 24) / Math.PI) * Math.asin(Math.min(Math.sqrt(chord) / aRs, 1)) : 0;
  const prob = (1 / aRs) * 100;

  const starColor = temperatureToRGB(p.T);
  const depthText = depthMax >= 0.001 ? `${fmt(depthMax * 100, 2)}%` : `${fmt(depthMax * 1e6, 0)} ppm`;
  const pxPlanet = Math.max(k * SR, 0.8);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Транзитният метод</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Когато планетата мине пред звездата, тя закрива малка част от диска ѝ. Колкото по-голяма е планетата спрямо звездата, толкова
        по-дълбок е спадът в блясъка.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <radialGradient id="tr-limb">
            <stop offset="0%" stopColor={starColor} />
            <stop offset="70%" stopColor={starColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={starColor} stopOpacity="0.45" />
          </radialGradient>
          <clipPath id="tr-clip">
            <rect x={GX0} y={GY0 - 10} width={GX1 - GX0} height={GY1 - GY0 + 20} />
          </clipPath>
        </defs>
        <circle cx={SCX} cy={SCY} r={SR} fill="url(#tr-limb)" />
        <line x1={SCX - XMAX * SR} x2={SCX + XMAX * SR} y1={SCY + b * SR} y2={SCY + b * SR} stroke="white" strokeOpacity="0.15" strokeDasharray="3 3" />
        <circle cx={SCX + x * SR} cy={SCY + b * SR} r={pxPlanet} fill="#0f172a" stroke={k * SR < 3 ? '#f87171' : 'none'} strokeWidth="1" />
        {k * SR < 3 && (
          <circle cx={SCX + x * SR} cy={SCY + b * SR} r={6} fill="none" stroke="#f87171" strokeOpacity="0.8" />
        )}
        <text x={SCX} y={H - 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
          Rп = {fmt(rp, 1)} R⊕ = {fmt(k * 100, 2)}% от радиуса на звездата
        </text>

        <text x={GX0} y={GY0 - 22} fontSize="10" fill="white" fillOpacity="0.7">
          блясък на звездата (светлинна крива)
        </text>
        <line x1={GX0} x2={GX1} y1={GY0} y2={GY0} stroke="white" strokeOpacity="0.25" />
        <line x1={GX0} x2={GX0} y1={GY0 - 6} y2={GY1} stroke="white" strokeOpacity="0.25" />
        <text x={GX0 - 4} y={GY0 + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          100%
        </text>
        <g clipPath="url(#tr-clip)">
          <polyline points={curve} fill="none" stroke="#fbbf24" strokeWidth="2" />
          <circle cx={GX0 + ((x + XMAX) / (2 * XMAX)) * (GX1 - GX0)} cy={GY0 + (fNow / yScale) * (GY1 - GY0)} r={4} fill="white" />
        </g>
        <text x={GX1} y={GY1 + 14} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          време →
        </text>
        <g fontSize="11" fill="white" transform={`translate(${GX0}, ${GY1 + 34})`}>
          <text x={0} y={0} fill="#fde68a" fontWeight="700">
            дълбочина ≈ (Rп/R★)² ≈ {depthText}
          </text>
          <text x={0} y={18} fillOpacity="0.8">
            {durH > 0 ? `продължителност ≈ ${fmt(durH, 1)} ч · вероятност за транзит ≈ ${fmt(prob, prob < 1 ? 2 : 1)}%` : 'планетата не минава пред звездата'}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Радиус на планетата: {fmt(rp, 2)} R⊕</label>
          <input type="range" min={Math.log10(0.4)} max={Math.log10(22)} step="0.005" value={logRp} onChange={e => setLogRp(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Прицелен параметър b = {fmt(b, 2)} R★</label>
          <input type="range" min="0" max="1.3" step="0.01" value={b} onChange={e => setB(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {PRESETS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => {
              setPi(i);
              setLogRp(Math.log10(q.rp));
            }}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}
          </button>
        ))}
      </div>
      <input type="range" min={-XMAX} max={XMAX} step="0.005" value={x} onChange={e => setX(Number(e.target.value))} className="w-full mt-3" aria-label="Положение на планетата" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Земята пред Слънцето отнема само 84 милионни от светлината му (84 ppm) – все едно комар да прелети пред фар. Телескопът Kepler
        (2009–2018) следи 150 000 звезди с такава точност и открива над 2600 планети. Около малко червено джудже като
        TRAPPIST-1 същата земеподобна планета закрива ~0,5% – 60 пъти повече, затова там е много по-лесно. Краищата на звездата са
        по-тъмни, затова спадът има заоблено дъно.
      </p>
    </div>
  );
}
