import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const CX = 180;
const CY = 150;
const R0 = 115;
const K_B = 1.381e-23;
const G = 6.674e-11;
const M_H = 1.673e-27;
const MU = 2.33; // средна маса на частица в молекулен облак (H₂ + He)
const M_SUN = 1.989e30;
const YEAR = 3.156e7;

/** Детерминирано псевдослучайно число в [0, 1). */
function rnd(n: number) {
  const x = Math.sin(n * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const FRAGMENTS = Array.from({ length: 60 }, (_, i) => {
  const a = rnd(i) * 2 * Math.PI;
  const r = Math.sqrt(rnd(i + 100)) * 0.85;
  return { x: r * Math.cos(a), y: r * Math.sin(a) * 0.8, m: 0.3 + 1.7 * rnd(i + 200) };
});

const BLOB = Array.from({ length: 48 }, (_, i) => 1 + 0.12 * Math.sin(i * 1.7) + 0.08 * Math.cos(i * 3.1));

export default function JeansLab() {
  const [T, setT] = useState(10);
  const [logN, setLogN] = useState(4); // cm⁻³
  const [logMass, setLogMass] = useState(3); // M☉
  const [tau, setTau] = useState(0); // време в единици t_ff
  const [playing, setPlaying] = useState(false);

  const n = 10 ** logN * 1e6; // m⁻³
  const rho = n * MU * M_H;
  const mJ = ((5 * K_B * T) / (G * MU * M_H)) ** 1.5 * Math.sqrt(3 / (4 * Math.PI * rho)) / M_SUN;
  const tff = Math.sqrt((3 * Math.PI) / (32 * G * rho)) / YEAR;
  const mCloud = 10 ** logMass;
  const collapses = mCloud > mJ;
  const nFrag = collapses ? Math.min(60, Math.max(1, Math.floor(mCloud / mJ))) : 0;

  useAnimationFrame(playing && tau < 1.25, dt => setTau(v => Math.min(v + dt * 0.25, 1.25)));

  const shrink = collapses ? Math.max(0.12, (1 - Math.min(tau, 1) ** 2) ** (2 / 3)) : 1 + 0.03 * Math.sin(tau * 12);
  const R = R0 * shrink;
  const blob = BLOB.map((k, i) => {
    const a = (i / BLOB.length) * 2 * Math.PI;
    return `${CX + R * k * Math.cos(a)},${CY + R * k * Math.sin(a) * 0.8}`;
  }).join(' ');
  const fragVisible = collapses && tau > 0.4;
  const born = collapses && tau >= 1;

  const restart = () => {
    setTau(0);
    setPlaying(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Кога облакът се свива?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Топлинното движение на молекулите се опитва да разпръсне облака, а гравитацията – да го свие. Ако масата на облака надвиши
        масата на Джинс, гравитацията печели и облакът се разпада на сгъстявания, които стават звезди.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <radialGradient id="jl-cloud" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#7c3aed" stopOpacity={0.35 + 0.4 * (1 - shrink)} />
            <stop offset="0.7" stopColor="#334155" stopOpacity="0.4" />
            <stop offset="1" stopColor="#1e293b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points={blob} fill="url(#jl-cloud)" />
        {fragVisible &&
          FRAGMENTS.slice(0, nFrag).map((f, i) => {
            const k = Math.min(1, (tau - 0.4) / 0.6);
            const x = CX + f.x * R;
            const y = CY + f.y * R;
            return born ? (
              <g key={i}>
                <circle cx={x} cy={y} r={2 + 2.2 * f.m} fill="#fde68a" fillOpacity="0.25" />
                <circle cx={x} cy={y} r={1 + f.m} fill="#fff7ed" />
              </g>
            ) : (
              <circle key={i} cx={x} cy={y} r={6 - 3 * k} fill="#c4b5fd" fillOpacity={0.3 + 0.5 * k} />
            );
          })}
        <text x={CX} y={H - 12} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
          {born ? `родени са ~${nFrag} звезди` : collapses ? `свиване: t = ${fmt(tau, 2)} · t_ff` : 'облакът е устойчив'}
        </text>

        <g fontSize="11" fill="white" transform="translate(360, 40)">
          <text x={0} y={0} fontSize="13" fontWeight="700">
            Маса на Джинс:
          </text>
          <text x={0} y={20} fill="#c4b5fd" fontWeight="700" fontSize="15">
            M_J ≈ {mJ < 1000 ? fmt(mJ, mJ < 10 ? 1 : 0) : sci(mJ, 1)} M☉
          </text>
          <text x={0} y={46} fillOpacity="0.85">
            маса на облака: {mCloud < 1000 ? fmt(mCloud, 0) : sci(mCloud, 1)} M☉
          </text>
          <text x={0} y={66} fill={collapses ? '#4ade80' : '#f87171'} fontWeight="700">
            {collapses ? `M > M_J – гравитацията печели` : 'M < M_J – налягането печели'}
          </text>
          <text x={0} y={96} fillOpacity="0.85">
            време за свободно падане:
          </text>
          <text x={0} y={114} fill="#fde68a" fontWeight="700">
            t_ff ≈ {tff < 1e6 ? `${fmt(tff / 1000, 0)} хил. години` : `${fmt(tff / 1e6, 1)} млн. години`}
          </text>
          <text x={0} y={140} fontSize="10" fillOpacity="0.6">
            плътност: {sci(rho, 1)} kg/m³
          </text>
          <text x={0} y={156} fontSize="10" fillOpacity="0.6">
            (колкото добър лабораторен вакуум)
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Температура: {T} K</label>
          <input type="range" min="5" max="100" value={T} onChange={e => setT(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Концентрация: {sci(10 ** logN, 0)} молекули/cm³</label>
          <input type="range" min="1" max="6" step="0.05" value={logN} onChange={e => setLogN(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Маса на облака: {mCloud < 1000 ? fmt(mCloud, 0) : sci(mCloud, 1)} M☉</label>
          <input type="range" min="0" max="5" step="0.05" value={logMass} onChange={e => setLogMass(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex justify-center mt-3">
        <button onClick={restart} className="px-4 py-1 rounded bg-violet-600 text-white text-sm hover:bg-violet-700">
          ▶ Пусни гравитацията
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Студените и плътни облаци имат малка маса на Джинс и лесно се разпадат на много звезди. Затова звездите се раждат на
        групи – в купове. Когато облакът се свива, плътността расте и масата на Джинс намалява: всяко сгъстяване отново се дели
        (фрагментация), докато газът стане толкова плътен, че вече не може да изстива.
      </p>
    </div>
  );
}
