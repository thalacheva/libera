import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const NX = 64;
const NY = 44;
const PX = 4.2;
const IX = 18;
const IY = 22;
const PIX_ARCSEC = 0.5;
const FWHM = 1.5; // seeing, ″
const SKY_MAG = 21.5; // яркост на нощното небе, mag/″²
const READ = 5; // шум при отчитане, e⁻
const QE = 0.5; // общ коефициент на полезно действие
const NPIX = 16; // пиксели в апертурата на звездата

const SCOPES = [
  { name: 'любителски 20 cm', D: 0.2 },
  { name: '2 m Рожен', D: 2 },
  { name: '8 m VLT', D: 8.2 },
];

const STARS = [
  { x: 12, y: 12, m: 16 },
  { x: 50, y: 9, m: 18 },
  { x: 30, y: 33, m: 20 },
  { x: 54, y: 30, m: 22 },
  { x: 8, y: 34, m: 24 },
  { x: 40, y: 16, m: 26 },
];
const GAL = { x: 22, y: 20, m: 21, r: 3.2 };

function rnd(n: number) {
  const x = Math.sin(n * 39.346 + 11.135) * 43758.5453;
  return x - Math.floor(x);
}
const gauss = (n: number) => Math.sqrt(-2 * Math.log(rnd(n) + 1e-9)) * Math.cos(2 * Math.PI * rnd(n + 0.5));

function formatTime(s: number) {
  if (s < 60) return `${fmt(s, s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${fmt(s / 60, 1)} min`;
  return `${fmt(s / 3600, 1)} h`;
}

export default function CCDNoiseLab() {
  const [si, setSi] = useState(1);
  const [logT, setLogT] = useState(1.5);
  const t = 10 ** logT;
  const D = SCOPES[si].D;

  // Фотони за секунда при V = 0 (видима лента, ~880 Å) за площта на огледалото
  const area = Math.PI * (D * 50) ** 2; // cm²
  const f0 = 8.8e5 * area * QE;
  const flux = (m: number) => f0 * 10 ** (-0.4 * m);
  const skyPix = flux(SKY_MAG) * PIX_ARCSEC ** 2 * t;
  const sigmaSky = Math.sqrt(skyPix + READ * READ);
  const sPsf = FWHM / 2.355 / PIX_ARCSEC;
  const snr = (m: number) => {
    const s = flux(m) * t;
    return s / Math.sqrt(s + NPIX * (skyPix + READ * READ));
  };
  // Гранична звездна величина при S/N = 5 (решение на квадратно уравнение)
  const noise2 = NPIX * (skyPix + READ * READ);
  const sLim = (25 + Math.sqrt(625 + 4 * 25 * noise2)) / 2;
  const mLim = -2.5 * Math.log10(sLim / t / f0);

  const seed = Math.round(logT * 40) * 9973 + si * 31;
  const cells: { k: number; c: string }[] = [];
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let sig = 0;
      for (const s of STARS) {
        const r2 = (i - s.x) ** 2 + (j - s.y) ** 2;
        if (r2 < 60) sig += (flux(s.m) * t * Math.exp(-r2 / (2 * sPsf * sPsf))) / (2 * Math.PI * sPsf * sPsf);
      }
      const rg = Math.hypot((i - GAL.x) / 1.6, j - GAL.y);
      sig += (flux(GAL.m) * t * Math.exp(-rg / GAL.r)) / (2 * Math.PI * GAL.r * GAL.r * 1.6);
      const k = j * NX + i;
      const v = sig + Math.sqrt(sig + skyPix + READ * READ) * gauss(seed + k * 1.37);
      const z = v / sigmaSky;
      const b = Math.max(0, Math.min(1, Math.asinh(z / 2) / Math.asinh(150)));
      const c = Math.round(255 * Math.max(b, 0.02 + 0.06 * (0.5 + 0.5 * Math.tanh(z))));
      cells.push({ k, c: `rgb(${c}, ${c}, ${c})` });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Фотони, шум и експозиция</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        ПЗС-матрицата брои фотоелектрони. Сигналът расте пропорционално на времето, а шумът – само като корен квадратен от него. Колко
        дълго трябва да снимаме, за да изплуват слабите звезди?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {cells.map(c => (
          <rect key={c.k} x={IX + (c.k % NX) * PX} y={IY + Math.floor(c.k / NX) * PX} width={PX + 0.2} height={PX + 0.2} fill={c.c} />
        ))}
        {STARS.map(s => (
          <text key={s.m} x={IX + s.x * PX + 9} y={IY + s.y * PX - 7} fontSize="8" fill="#fde68a" fillOpacity="0.85">
            {s.m}
          </text>
        ))}
        <text x={IX + GAL.x * PX + 15} y={IY + GAL.y * PX + 18} fontSize="8" fill="#93c5fd" fillOpacity="0.85">
          галактика 21
        </text>
        <text x={IX} y={IY + NY * PX + 14} fontSize="9" fill="white" fillOpacity="0.55">
          числата – звездни величини V · пиксел {fmt(PIX_ARCSEC, 1)}″ · seeing {fmt(FWHM, 1)}″
        </text>

        <g fontSize="10" fill="white" transform="translate(305, 30)">
          <text x={0} y={0} fontSize="11" fontWeight="700" fillOpacity="0.9">
            S/N = N★ / √(N★ + n_пикс · (N_небе + R²))
          </text>
          {STARS.map((s, i) => {
            const q = snr(s.m);
            return (
              <g key={s.m} transform={`translate(0, ${20 + i * 17})`}>
                <text x={0} y={0} fillOpacity="0.8">
                  V = {s.m}:
                </text>
                <rect x={42} y={-8} width={Math.min(200, Math.max(1, Math.log10(1 + q) * 50))} height={9} fill={q >= 5 ? '#86efac' : q >= 3 ? '#fde68a' : '#f87171'} fillOpacity="0.8" />
                <text x={250} y={0} fillOpacity="0.85">
                  S/N {q >= 100 ? fmt(q, 0) : fmt(q, 1)}
                </text>
              </g>
            );
          })}
          <text x={0} y={140} fillOpacity="0.8">
            фотони от небето: {fmt(skyPix, 0)} на пиксел
          </text>
          <text x={0} y={158} fillOpacity="0.8">
            звезда V = 20: {fmt(flux(20) * t, 0)} фотоелектрона
          </text>
          <text x={0} y={182} fontSize="12" fontWeight="700" fill="#86efac">
            гранична величина (S/N = 5): V ≈ {fmt(mLim, 1)}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Експозиция: {formatTime(t)}</label>
      <input type="range" min="-1" max="4.3" step="0.025" value={logT} onChange={e => setLogT(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {SCOPES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === si ? 'border-slate-500 bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        При кратки експозиции доминира шумът при отчитане (R = {READ} e⁻), при дълги – светлината на самото нощно небе. Тогава S/N расте
        като √t: за да слезете с 1 звездна величина по-слабо, трябва ~6 пъти по-дълга експозиция (2,5² = 6,3). По-голямото огледало
        събира повече фотони и от звездата, и от небето – затова печели и тъмното място, далеч от градските светлини. Най-големият
        български телескоп е 2-метровият в НАО Рожен.
      </p>
    </div>
  );
}
