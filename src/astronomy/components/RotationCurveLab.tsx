import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const G = 4.3e-6; // kpc · (km/s)² / M☉
// Графиката
const GX0 = 300;
const GX1 = 620;
const GY0 = 30;
const GY1 = 250;
const R_MAX = 30; // kpc
const V_MAX = 320; // km/s
const gx = (r: number) => GX0 + (r / R_MAX) * (GX1 - GX0);
const gy = (v: number) => GY1 - (v / V_MAX) * (GY1 - GY0);
// Изглед отгоре
const DX = 145;
const DY = 150;
const DPX = 4.2; // px на kpc

const M_DISK = 5e10;
const H_DISK = 2.6;
const M_BULGE = 1.2e10;
const A_BULGE = 0.6;
const V_HALO = 175;
const R_CORE = 4;

const vVisible = (r: number) => {
  const x = r / H_DISK;
  const mDisk = M_DISK * (1 - Math.exp(-x) * (1 + x));
  const mBulge = (M_BULGE * r * r) / (r + A_BULGE) ** 2;
  return Math.sqrt((G * (mDisk + mBulge)) / Math.max(r, 0.05));
};
const vHalo = (r: number, k: number) => k * V_HALO * Math.sqrt(Math.max(0, 1 - (R_CORE / r) * Math.atan(r / R_CORE)));
const vTotal = (r: number, k: number) => Math.sqrt(vVisible(r) ** 2 + vHalo(r, k) ** 2);

function rnd(n: number) {
  const x = Math.sin(n * 45.164 + 8.21) * 43758.5453;
  return x - Math.floor(x);
}

// „Наблюдавани“ точки – с истинския ореол (k = 1)
const DATA = Array.from({ length: 22 }, (_, i) => {
  const r = 1 + i * 1.25;
  return { r, v: vTotal(r, 1) + (rnd(i) - 0.5) * 16 };
});
const STARS = Array.from({ length: 90 }, (_, i) => ({ r: 1.5 + rnd(i + 40) * 28, a0: rnd(i + 80) * 2 * Math.PI }));

export default function RotationCurveLab() {
  const [k, setK] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rProbe, setRProbe] = useState(20);

  useAnimationFrame(playing, dt => setT(v => v + dt));

  const curve = (f: (r: number) => number) =>
    Array.from({ length: 121 }, (_, i) => {
      const r = 0.1 + (i / 120) * (R_MAX - 0.1);
      return `${gx(r)},${gy(f(r))}`;
    }).join(' ');

  const v = vTotal(rProbe, k);
  const mDyn = (v * v * rProbe) / G;
  const vVis = vVisible(rProbe);
  const mVis = (vVis * vVis * rProbe) / G;
  const chi = DATA.reduce((s, d) => s + ((d.v - vTotal(d.r, k)) / 8) ** 2, 0) / DATA.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Кривата на въртене – следа от невидима маса</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Точките са измерените скорости на газа в галактика като Млечния път. Червената линия е какво би трябвало да очакваме само от
        видимите звезди и газ. Добавете тъмен ореол, докато моделът пасне.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Изглед отгоре – звездите обикалят със скоростта от модела */}
        {k > 0 && <circle cx={DX} cy={DY} r={30 * DPX} fill="#7c3aed" fillOpacity={0.05 + 0.1 * k} />}
        <circle cx={DX} cy={DY} r={14} fill="#fde68a" fillOpacity="0.5" />
        {STARS.map((s, i) => {
          const omega = vTotal(s.r, k) / s.r; // km/s/kpc – ъглова скорост, мащабирана за анимацията
          const a = s.a0 + omega * t * 0.02;
          return <circle key={i} cx={DX + s.r * DPX * Math.cos(a)} cy={DY + s.r * DPX * Math.sin(a)} r={1.6} fill={s.r > 15 ? '#93c5fd' : '#fef3c7'} />;
        })}
        <circle cx={DX} cy={DY} r={rProbe * DPX} fill="none" stroke="#f472b6" strokeDasharray="3 3" />
        <text x={DX} y={H - 8} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          {k > 0 ? 'лилаво – тъмният ореол' : 'само видимата материя'}
        </text>

        {/* Графиката */}
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={curve(vVisible)} fill="none" stroke="#f87171" strokeWidth="1.8" strokeDasharray="5 3" />
        {k > 0 && <polyline points={curve(r => vHalo(r, k))} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="2 3" />}
        <polyline points={curve(r => vTotal(r, k))} fill="none" stroke="#4ade80" strokeWidth="2.2" />
        {DATA.map((d, i) => (
          <circle key={i} cx={gx(d.r)} cy={gy(d.v)} r="3" fill="#fde68a" />
        ))}
        <line x1={gx(rProbe)} x2={gx(rProbe)} y1={GY0} y2={GY1} stroke="#f472b6" strokeOpacity="0.6" />
        {[0, 10, 20, 30].map(r => (
          <text key={r} x={gx(r)} y={GY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {r} kpc
          </text>
        ))}
        {[100, 200, 300].map(vv => (
          <text key={vv} x={GX0 - 4} y={gy(vv) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {vv}
          </text>
        ))}
        <text x={GX0 + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          v, km/s
        </text>
        <text x={GX1 - 4} y={GY0 + 12} fontSize="9" textAnchor="end" fill="#f87171">
          само видимото
        </text>
        <text x={GX1 - 4} y={GY0 + 24} fontSize="9" textAnchor="end" fill="#4ade80">
          модел
        </text>
        <text x={GX1 - 4} y={GY0 + 36} fontSize="9" textAnchor="end" fill="#fde68a">
          наблюдения
        </text>
        <text x={GX0} y={H - 10} fontSize="10" fill={chi < 1.5 ? '#4ade80' : '#f87171'} fontWeight="700">
          {chi < 1.5 ? '✓ моделът пасва на наблюденията' : 'моделът не пасва – скоростите навън са твърде малки'}
        </text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Тъмен ореол: {fmt(k * 100, 0)}% от нужния</label>
          <input type="range" min="0" max="1.6" step="0.01" value={k} onChange={e => setK(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Радиус за масата: {fmt(rProbe, 1)} kpc</label>
          <input type="range" min="2" max="30" step="0.5" value={rProbe} onChange={e => setRProbe(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-violet-600 text-white text-sm hover:bg-violet-700">
          {playing ? '⏸ Пауза' : '▶ Завърти галактиката'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
        {[
          { label: `v при ${fmt(rProbe, 0)} kpc`, value: `${fmt(v, 0)} km/s` },
          { label: 'Маса в този радиус: v²r / G', value: `${sci(mDyn, 1)} M☉` },
          { label: 'От тях видима', value: `${fmt((mVis / mDyn) * 100, 0)}%` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Ако почти цялата маса беше в ярката централна част, скоростите навън щяха да намаляват като 1/√r – както при планетите
        (червената линия). Вместо това кривата остава плоска чак до края на видимия диск. Значи масата продължава да расте с радиуса –
        галактиката е потопена в огромен ореол от тъмна материя, който е 5–10 пъти по-масивен от всичко видимо (Лекция 29).
      </p>
    </div>
  );
}
