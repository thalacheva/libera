import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 280;
const T_CMB = 2.725;
// Спектър
const SX0 = 40;
const SX1 = 300;
const SY0 = 30;
const SY1 = 220;
const NU_MAX = 22; // cm⁻¹
// Карта
const MX = 470;
const MY = 125;
const RX = 145;
const RY = 75;
const NX = 64;
const NY = 32;

function rnd(n: number) {
  const x = Math.sin(n * 78.233 + 1.931) * 43758.5453;
  return x - Math.floor(x);
}

/** Яркост на черно тяло (относителни единици) при вълново число σ (cm⁻¹): ∝ σ³ / (e^{hcσ/kT} − 1). */
const planck = (sigma: number, T: number) => sigma ** 3 / Math.expm1((1.4388 * sigma) / T);
const B_MAX = planck(5.3, T_CMB);

const DATA = Array.from({ length: 34 }, (_, i) => {
  const s = 2 + i * 0.57;
  return { s, b: planck(s, T_CMB) };
});

// Случайни вълни за анизотропиите
const WAVES = Array.from({ length: 50 }, (_, i) => {
  const k = 4 + rnd(i) * 10;
  const th = Math.acos(2 * rnd(i + 100) - 1);
  const ph = rnd(i + 200) * 2 * Math.PI;
  return { kx: k * Math.sin(th) * Math.cos(ph), ky: k * Math.sin(th) * Math.sin(ph), kz: k * Math.cos(th), p: rnd(i + 300) * 2 * Math.PI, a: 1 / Math.sqrt(k) };
});

const STAGES = [
  { name: '1. Сурова карта', range: 3, unit: 'K', text: 'Небето във всички посоки има една и съща температура: 2,725 K. Толкова гладко, че отначало изглежда съвършено еднакво – с точност по-добра от 0,1%.' },
  { name: '2. Контраст ×1000: диполът', range: 3.36e-3, unit: 'mK', text: 'Увеличаваме контраста хиляда пъти. Едната половина на небето е малко по-топла, другата – по-студена: ефект на Доплер от движението ни спрямо реликтовото излъчване с ~370 km/s, в посока към съзвездието Лъв.' },
  { name: '3. Без дипола: Млечният път', range: 3e-4, unit: 'µK', text: 'След като извадим дипола и увеличим контраста още, по екватора на картата се вижда излъчването на нашата Галактика – прах, газ и електрони.' },
  { name: '4. Без Галактиката: семената', range: 1e-4, unit: 'µK', text: 'Остават мънички колебания – около ±0,0001 K, едно на 100 000. Това са зоните с малко по-голяма и малко по-малка плътност 380 000 години след Големия взрив. От тях израстват всички галактики. Първо ги измерва COBE (1992), после WMAP и Planck.' },
];

function skyValue(stage: number, lon: number, lat: number) {
  const nx = Math.cos(lat) * Math.cos(lon);
  const ny = Math.cos(lat) * Math.sin(lon);
  const nz = Math.sin(lat);
  if (stage === 0) return 0;
  // Апексът на движението ни (схематично): lon = 0,8, lat = 0,8
  const ax = Math.cos(0.8) * Math.cos(0.8);
  const ay = Math.cos(0.8) * Math.sin(0.8);
  const az = Math.sin(0.8);
  const dipole = 3.36e-3 * (nx * ax + ny * ay + nz * az);
  let aniso = 0;
  for (const w of WAVES) aniso += w.a * Math.cos(w.kx * nx + w.ky * ny + w.kz * nz + w.p);
  aniso *= 2.2e-5;
  const galaxy = 2.5e-4 * Math.exp(-((lat / 0.12) ** 2)) * (0.6 + 0.4 * Math.cos(lon)) + 0.6e-4 * Math.exp(-((lat / 0.35) ** 2));
  if (stage === 1) return dipole + galaxy * 0.2 + aniso * 0.2;
  if (stage === 2) return galaxy + aniso;
  return aniso;
}

function color(v: number) {
  const c = Math.max(-1, Math.min(1, v));
  if (c >= 0) return `rgb(${255}, ${Math.round(255 - 170 * c)}, ${Math.round(255 - 230 * c)})`;
  return `rgb(${Math.round(255 + 220 * c)}, ${Math.round(255 + 120 * c)}, 255)`;
}

export default function CMBLab() {
  const [T, setT] = useState(3.2);
  const [stage, setStage] = useState(0);
  const st = STAGES[stage];
  const fitOk = Math.abs(T - T_CMB) < 0.02;
  const peakSigma = 1.96 * T; // максимум по честота: ν_max ≈ 58,8 GHz · T/K ⇒ σ ≈ 1,96 · T cm⁻¹

  const sx = (s: number) => SX0 + (s / NU_MAX) * (SX1 - SX0);
  const sy = (b: number) => SY1 - (b / (B_MAX * 2.4)) * (SY1 - SY0);
  const model = Array.from({ length: 121 }, (_, i) => {
    const s = 0.2 + (i / 120) * (NU_MAX - 0.2);
    return `${sx(s)},${sy(planck(s, T))}`;
  }).join(' ');

  const cells: { x: number; y: number; w: number; h: number; c: string }[] = [];
  for (let j = 0; j < NY; j++) {
    const lat = (Math.PI / 2) * (1 - (2 * (j + 0.5)) / NY);
    const halfW = RX * Math.sqrt(Math.max(0, 1 - (lat / (Math.PI / 2)) ** 2));
    for (let i = 0; i < NX; i++) {
      const lon = Math.PI * ((2 * (i + 0.5)) / NX - 1);
      const v = skyValue(stage, lon, lat);
      const x = MX + (lon / Math.PI) * halfW;
      const y = MY - (lat / (Math.PI / 2)) * RY;
      const c = stage === 0 ? '#fca5a5' : color(v / st.range);
      cells.push({ x: x - halfW / NX - 0.4, y: y - RY / NY - 0.4, w: (2 * halfW) / NX + 0.8, h: (2 * RY) / NY + 0.8, c });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Реликтовото излъчване</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вляво: спектърът, измерен от сателита COBE (1990), и черно тяло с температурата, която изберете. Вдясно: картата на цялото
        небе стъпка по стъпка, както я „разлистват“ космолозите.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Спектър */}
        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <defs>
          <clipPath id="cmb-spec">
            <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} />
          </clipPath>
        </defs>
        <polyline points={model} fill="none" stroke={fitOk ? '#4ade80' : '#fbbf24'} strokeWidth="2" clipPath="url(#cmb-spec)" />
        {DATA.map((d, i) => (
          <circle key={i} cx={sx(d.s)} cy={sy(d.b)} r="2.6" fill="#f87171" />
        ))}
        {[5, 10, 15, 20].map(s => (
          <text key={s} x={sx(s)} y={SY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {s}
          </text>
        ))}
        <text x={(SX0 + SX1) / 2} y={SY1 + 26} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          вълново число, cm⁻¹ (≈ 30 GHz)
        </text>
        <text x={SX0 + 4} y={SY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          яркост
        </text>
        <text x={SX1 - 4} y={SY0 + 12} fontSize="10" textAnchor="end" fill={fitOk ? '#4ade80' : '#fde68a'} fontWeight="700">
          T = {fmt(T, 3)} K
        </text>
        <text x={SX1 - 4} y={SY0 + 26} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          максимум (по честота) при λ ≈ {fmt(10 / peakSigma, 1)} mm
        </text>
        <text x={SX0} y={H - 10} fontSize="10" fill={fitOk ? '#4ade80' : '#94a3b8'}>
          {fitOk ? '✓ съвършено черно тяло – грешките са по-малки от дебелината на линията' : 'точки – COBE/FIRAS; нагласете T'}
        </text>

        {/* Карта */}
        <g>
          {cells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.c} />
          ))}
          <ellipse cx={MX} cy={MY} rx={RX} ry={RY} fill="none" stroke="white" strokeOpacity="0.3" />
          <text x={MX} y={MY + RY + 18} fontSize="11" textAnchor="middle" fill="white" fontWeight="700">
            {st.name}
          </text>
          <text x={MX} y={MY + RY + 34} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
            {stage === 0 ? 'цялото небе: 2,725 K навсякъде' : `скала: ±${st.unit === 'mK' ? `${fmt(st.range * 1000, 1)} mK` : `${fmt(st.range * 1e6, 0)} µK`}`}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Температура на черното тяло: {fmt(T, 3)} K</label>
          <input type="range" min="2" max="3.5" step="0.005" value={T} onChange={e => setT(Number(e.target.value))} className="w-full" />
        </div>
        <div className="flex flex-wrap justify-center items-end gap-1 mt-3">
          {STAGES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setStage(i)}
              className={`px-2 py-1 rounded text-xs border ${
                i === stage ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{st.text}</p>
    </div>
  );
}
