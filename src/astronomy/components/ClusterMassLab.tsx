import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const CX = 150;
const CY = 150;
const R_PX = 110;
const G_MPC = 4.3e-9; // Mpc · (km/s)² / M☉

const CLUSTERS = [
  { name: 'Куп Кома', sigma: 1000, R: 3, mStars: 4e13, text: 'Тук Фриц Цвики през 1933 г. за пръв път пише за „тъмна материя“ (dunkle Materie): галактиките се движат толкова бързо, че видимото вещество не би ги задържало.' },
  { name: 'Куп Дева', sigma: 750, R: 2.2, mStars: 1.5e13, text: 'Най-близкият голям куп – на 16,5 Mpc. В центъра му е гигантската елиптична галактика M87 с прочутата черна дупка.' },
  { name: 'Местната група', sigma: 70, R: 1.2, mStars: 1.5e11, text: 'Нашата група: Млечният път, Андромеда и десетки малки галактики. Скоростите са малки, но и тук масата е много повече от звездите.' },
];

function rnd(n: number) {
  const x = Math.sin(n * 27.913 + 3.31) * 43758.5453;
  return x - Math.floor(x);
}
const gauss = (n: number) => Math.sqrt(-2 * Math.log(rnd(n) + 1e-9)) * Math.cos(2 * Math.PI * rnd(n + 777));

const GAL = Array.from({ length: 70 }, (_, i) => {
  const r = Math.sqrt(rnd(i + 10)) * 0.95;
  const a = rnd(i + 20) * 2 * Math.PI;
  return { x: r * Math.cos(a), y: r * Math.sin(a), vx: gauss(i + 30), vy: gauss(i + 40), vr: gauss(i + 50), ph: rnd(i + 60) * 6.28, om: 0.6 + rnd(i + 70) };
});

export default function ClusterMassLab() {
  const [ci, setCi] = useState(0);
  const [dark, setDark] = useState(true);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cl = CLUSTERS[ci];

  useAnimationFrame(playing, dt => setT(v => v + dt));

  const vrs = GAL.map(g => g.vr * cl.sigma);
  const sigma = Math.sqrt(vrs.reduce((s, v) => s + v * v, 0) / vrs.length);
  const mVir = (5 * sigma * sigma * cl.R) / G_MPC;
  const fStars = cl.mStars / mVir;

  // Хистограма на радиалните скорости
  const bins = Array.from({ length: 13 }, () => 0);
  vrs.forEach(v => {
    const b = Math.floor((v / cl.sigma + 3.25) / 0.5);
    if (b >= 0 && b < bins.length) bins[b]++;
  });
  const bMax = Math.max(...bins);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко тежи купът галактики?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Спектроскопът дава радиалните скорости на галактиките. Колкото по-широко е разпределението им, толкова повече маса трябва, за да
        ги задържи заедно. Изключете тъмната материя и вижте какво става.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <circle cx={CX} cy={CY} r={R_PX} fill={dark ? '#7c3aed' : '#0f172a'} fillOpacity={dark ? 0.12 : 0} stroke="white" strokeOpacity="0.15" strokeDasharray="4 4" />
        <circle cx={CX} cy={CY} r={R_PX * 0.6} fill="#f472b6" fillOpacity="0.06" />
        {GAL.map((g, i) => {
          // В свързан куп галактиките „кръжат“ в купа; без тъмна материя – отлитат по прави
          const x = dark ? g.x * Math.cos(g.om * t * 0.5 + g.ph) + g.vx * 0.08 * Math.sin(g.om * t * 0.5) : g.x + g.vx * t * 0.25;
          const y = dark ? g.y * Math.cos(g.om * t * 0.4 + g.ph) + g.vy * 0.08 * Math.sin(g.om * t * 0.4) : g.y + g.vy * t * 0.25;
          const px = CX + x * R_PX;
          const py = CY + y * R_PX;
          if (Math.abs(px - CX) > 145 || Math.abs(py - CY) > 145) return null;
          const v = g.vr;
          return <ellipse key={i} cx={px} cy={py} rx="4" ry="2.6" fill={v > 0 ? '#fca5a5' : '#93c5fd'} transform={`rotate(${g.ph * 30} ${px} ${py})`} />;
        })}
        <text x={CX} y={H - 8} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          червено – отдалечава се, синьо – приближава се (спрямо купа)
        </text>

        {/* Хистограма */}
        <g transform="translate(330, 30)">
          <text x={0} y={-8} fontSize="10" fill="white" fillOpacity="0.7">
            радиални скорости спрямо купа
          </text>
          {bins.map((b, i) => (
            <rect key={i} x={i * 18} y={110 - (b / bMax) * 100} width={16} height={(b / bMax) * 100} fill={i < 6 ? '#93c5fd' : i > 6 ? '#fca5a5' : '#e2e8f0'} fillOpacity="0.8" />
          ))}
          <line x1={0} x2={13 * 18} y1={110} y2={110} stroke="white" strokeOpacity="0.4" />
          <text x={0} y={124} fontSize="9" fill="white" fillOpacity="0.55">
            −{fmt(3 * cl.sigma, 0)}
          </text>
          <text x={13 * 18} y={124} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            +{fmt(3 * cl.sigma, 0)} km/s
          </text>
        </g>
        <g fontSize="11" fill="white" transform="translate(330, 180)">
          <text x={0} y={0} fillOpacity="0.85">
            σ ≈ {fmt(sigma, 0)} km/s, R ≈ {fmt(cl.R, 1)} Mpc
          </text>
          <text x={0} y={20} fill="#c4b5fd" fontWeight="700">
            M ≈ 5σ²R / G ≈ {sci(mVir, 1)} M☉
          </text>
          <text x={0} y={40} fillOpacity="0.85">
            звезди: {fmt(fStars * 100, 1)}% · горещ газ: ~13% · тъмна материя: ~{fmt(100 - 13 - fStars * 100, 0)}%
          </text>
        </g>
        {/* Лента със състава */}
        <g transform="translate(330, 238)">
          <rect x={0} y={0} width={290 * fStars} height={14} fill="#fde68a" />
          <rect x={290 * fStars} y={0} width={290 * 0.13} height={14} fill="#f472b6" />
          <rect x={290 * (fStars + 0.13)} y={0} width={290 * (1 - fStars - 0.13)} height={14} fill="#7c3aed" />
        </g>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-violet-600 text-white text-sm hover:bg-violet-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button
          onClick={() => {
            setT(0);
            setDark(d => !d);
          }}
          className={`px-3 py-1 rounded text-sm border ${dark ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300'}`}
        >
          {dark ? 'с тъмна материя' : 'само видимото вещество'}
        </button>
        {CLUSTERS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setCi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === ci ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {dark
          ? `${cl.text} Звездите са само ${fmt(fStars * 100, 1)}% от масата; горещият рентгенов газ между галактиките – ~13%; останалото е тъмна материя.`
          : 'Без тъмна материя гравитацията на звездите и газа е ~6 пъти по-слаба от нужното. Галактиките биха се разлетели за около милиард години – а куповете съществуват милиарди години.'}
      </p>
    </div>
  );
}
