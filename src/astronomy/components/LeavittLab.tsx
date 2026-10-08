import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const X0 = 60;
const X1 = 430;
const Y0 = 20;
const Y1 = 260;

/** Зависимост период–светимост за класическите цефеиди (V): M_V = −2,43 (lg P − 1) − 4,05. */
const cepheidMV = (P: number) => -2.43 * (Math.log10(P) - 1) - 4.05;

function rnd(n: number) {
  const x = Math.sin(n * 63.7264 + 10.873) * 43758.5453;
  return x - Math.floor(x);
}

/** Форма на кривата на блясъка на цефеида: бързо покачване, бавно спадане (+ = по-ярко). */
function cepheidShape(phi: number) {
  const coef = [1, 0.45, 0.2, 0.08];
  return coef.reduce((v, c, k) => v + c * Math.sin(2 * Math.PI * (k + 1) * phi), 0) / 1.3;
}

// Режим 1: цефеидите в Малкия Магеланов облак (като в таблицата на Левит)
const MU_SMC = 18.96;
const SMC = Array.from({ length: 28 }, (_, i) => {
  const lgP = 0.25 + rnd(i) * 1.8;
  return { lgP, m: cepheidMV(10 ** lgP) + MU_SMC + 0.1 + (rnd(i + 50) - 0.5) * 0.45 };
});

// Режим 2: наблюденията на V1 в Андромеда
const P_TRUE = 31.4;
const M_MEAN = 19.4;
const A_V = 0.25; // поглъщане от праха
const OBS = Array.from({ length: 45 }, (_, i) => {
  const t = rnd(i + 200) * 400; // отделни нощи за ~400 дни
  return { t, m: M_MEAN - 0.55 * cepheidShape((t / P_TRUE) % 1) + (rnd(i + 300) - 0.5) * 0.08 };
});

export default function LeavittLab() {
  const [mode, setMode] = useState<'smc' | 'm31'>('smc');
  const [mu, setMu] = useState(15);
  const [pTry, setPTry] = useState(24);

  // ---- Режим 1 ----
  const gx = (lgP: number) => X0 + ((lgP - 0) / 2.2) * (X1 - X0);
  const gy = (m: number) => Y0 + ((m - 11) / (18 - 11)) * (Y1 - Y0);
  const resid = SMC.map(s => s.m - (cepheidMV(10 ** s.lgP) + mu));
  const meanRes = resid.reduce((a, b) => a + b, 0) / resid.length;
  const fitOk = Math.abs(meanRes) < 0.15;
  const dSMC = 10 ** (mu / 5 + 1);

  // ---- Режим 2: сгъване по фаза ----
  const folded = OBS.map(o => ({ phi: (o.t / pTry) % 1, m: o.m }));
  const mMean = OBS.reduce((a, o) => a + o.m, 0) / OBS.length;
  // Минимизация на дисперсията по фаза: разсейването в 10 фазови интервала спрямо общото
  const bins: number[][] = Array.from({ length: 10 }, () => []);
  folded.forEach(o => bins[Math.floor(o.phi * 10)].push(o.m));
  let within = 0;
  let dof = 0;
  bins.forEach(b => {
    if (b.length < 2) return;
    const mu = b.reduce((a, x) => a + x, 0) / b.length;
    within += b.reduce((a, x) => a + (x - mu) ** 2, 0);
    dof += b.length - 1;
  });
  const total = OBS.reduce((a, o) => a + (o.m - mMean) ** 2, 0) / OBS.length;
  const theta = within / dof / total;
  const sharp = theta < 0.15;
  const MV = cepheidMV(pTry);
  const dM31 = 10 ** ((mMean - MV - A_V) / 5 + 1);
  const fx = (phi: number) => X0 + phi * 0.5 * (X1 - X0);
  const fy = (m: number) => Y0 + ((m - 18.6) / (20.2 - 18.6)) * (Y1 - Y0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Измерете разстоянието с цефеиди</h3>
      <div className="flex flex-wrap justify-center gap-1 mb-3">
        {[
          { id: 'smc' as const, label: '1. Плотът на Левит (Малкия Магеланов облак)' },
          { id: 'm31' as const, label: '2. Цефеида V1 в Андромеда' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded text-sm border ${
              m.id === mode ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        {mode === 'smc'
          ? 'Всички цефеиди в облака са на почти едно разстояние – затова по-бавните изглеждат по-ярки. Изместете калибрираната зависимост (в абсолютни величини), докато пасне на точките: отместването е модулът на разстоянието.'
          : 'Хъбъл има само отделни снимки, направени в случайни нощи. Опитайте периоди: когато уцелите правилния, „сгънатите“ по фаза измервания се подреждат в гладка крива.'}
      </p>

      {mode === 'smc' ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
          <defs>
            <clipPath id="lv-clip">
              <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
            </clipPath>
          </defs>
          <g clipPath="url(#lv-clip)">
            <line x1={gx(0)} y1={gy(cepheidMV(1) + mu)} x2={gx(2.2)} y2={gy(cepheidMV(10 ** 2.2) + mu)} stroke={fitOk ? '#4ade80' : '#fde68a'} strokeWidth="2.5" />
            {SMC.map((s, i) => (
              <circle key={i} cx={gx(s.lgP)} cy={gy(s.m)} r="3.5" fill="#fbbf24" />
            ))}
          </g>
          {[0, 0.5, 1, 1.5, 2].map(v => (
            <text key={v} x={gx(v)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {fmt(10 ** v, v < 1 ? 1 : 0)} д
            </text>
          ))}
          {[12, 14, 16, 18].map(m => (
            <text key={m} x={X0 - 5} y={gy(m) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
              {m}
            </text>
          ))}
          <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
            период (логаритмична скала)
          </text>
          <text x={14} y={(Y0 + Y1) / 2} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
            видима величина (по-ярки ↑)
          </text>
          <g fontSize="11" fill="white" transform="translate(450, 50)">
            <text x={0} y={0} fontWeight="700">
              m − M = {fmt(mu, 2)}
            </text>
            <text x={0} y={22} fill={fitOk ? '#4ade80' : '#fde68a'} fontWeight="700" fontSize="14">
              d ≈ {dSMC < 1e4 ? `${fmt(dSMC, 0)} pc` : `${fmt(dSMC / 1000, 0)} kpc`}
            </text>
            <text x={0} y={44} fill={fitOk ? '#4ade80' : '#94a3b8'}>
              {fitOk ? '✓ пасва' : meanRes > 0 ? 'местете надолу (по-далеч)' : 'местете нагоре (по-близо)'}
            </text>
            <text x={0} y={74} fontSize="10" fillOpacity="0.6">
              Без поправка за праха.
            </text>
            <text x={0} y={88} fontSize="10" fillOpacity="0.6">
              Истински: ~62 kpc.
            </text>
          </g>
        </svg>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
          <line x1={fx(1)} x2={fx(1)} y1={Y0} y2={Y1} stroke="white" strokeOpacity="0.1" />
          {folded.flatMap((o, i) => [
            <circle key={`a${i}`} cx={fx(o.phi)} cy={fy(o.m)} r="3" fill={sharp ? '#4ade80' : '#fbbf24'} />,
            <circle key={`b${i}`} cx={fx(o.phi + 1)} cy={fy(o.m)} r="3" fill={sharp ? '#4ade80' : '#fbbf24'} fillOpacity="0.5" />,
          ])}
          {[0, 0.5, 1, 1.5, 2].map(v => (
            <text key={v} x={fx(v)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {fmt(v, 1)}
            </text>
          ))}
          {[18.8, 19.2, 19.6, 20.0].map(m => (
            <text key={m} x={X0 - 5} y={fy(m) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
              {fmt(m, 1)}
            </text>
          ))}
          <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
            фаза = (време / P) – цялата част (показани са два цикъла)
          </text>
          <g fontSize="11" fill="white" transform="translate(450, 40)">
            <text x={0} y={0} fontWeight="700">
              P = {fmt(pTry, 2)} дни
            </text>
            <text x={0} y={18} fill={sharp ? '#4ade80' : '#94a3b8'}>
              {sharp ? '✓ кривата е гладка!' : 'точките са разпилени'} (θ = {fmt(theta, 2)})
            </text>
            <text x={0} y={44} fillOpacity="0.85">
              M_V = −2,43(lg P − 1) − 4,05
            </text>
            <text x={0} y={60} fillOpacity="0.85">
              = {fmt(MV, 2)}
            </text>
            <text x={0} y={80} fillOpacity="0.85">
              средно m = {fmt(mMean, 2)}
            </text>
            <text x={0} y={96} fillOpacity="0.85">
              прах: A_V ≈ {fmt(A_V, 2)}
            </text>
            <text x={0} y={120} fill={sharp ? '#4ade80' : '#fde68a'} fontWeight="700" fontSize="14">
              d ≈ {fmt(dM31 / 1000, 0)} kpc
            </text>
            <text x={0} y={138} fontSize="10" fillOpacity="0.6">
              = {fmt((dM31 * 3.26) / 1e6, 2)} млн. светлинни години
            </text>
            <text x={0} y={166} fontSize="10" fillOpacity="0.6">
              Хъбъл (1925): ~285 kpc
            </text>
            <text x={0} y={180} fontSize="10" fillOpacity="0.6">
              Днес: ~765 kpc
            </text>
          </g>
        </svg>
      )}

      {mode === 'smc' ? (
        <>
          <label className="block text-sm font-semibold mt-4 mb-1">Модул на разстоянието m − M = {fmt(mu, 2)}</label>
          <input type="range" min="10" max="24" step="0.01" value={mu} onChange={e => setMu(Number(e.target.value))} className="w-full" />
        </>
      ) : (
        <>
          <label className="block text-sm font-semibold mt-4 mb-1">Пробен период: {fmt(pTry, 2)} дни</label>
          <input type="range" min="15" max="45" step="0.05" value={pTry} onChange={e => setPTry(Number(e.target.value))} className="w-full" />
        </>
      )}
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {mode === 'smc'
          ? 'Левит знае само видимите величини – не и разстоянието до облака. Затова нейната зависимост е относителна. За да я превърнем в „линийка“, трябва поне една цефеида с измерено разстояние. Днес калибровката е от паралаксите на Gaia и Хъбъл.'
          : sharp
            ? 'Точно така: периодът на V1 е ~31,4 дни. От него зависимостта период–светимост дава абсолютната величина, а сравнението ѝ с видимата – разстоянието. Андромеда е много по-далеч от края на Млечния път – тя е отделна галактика!'
            : 'Плъзнете бавно: при грешен период фазите на измерванията се разбъркват. Методът се нарича сгъване по фаза и се използва за всички периодични звезди – и за екзопланетите.'}
      </p>
    </div>
  );
}
