import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 280;
const TAU = 879.4; // s – среден живот на неутрона
const X_FREEZE = 1 / 6; // отношение n/p при „замразяването“ (~1 s)
const Y_OBS = 0.245;
const DH_OBS = 2.53e-5;
const ETA_BEST = 6.1e-10;
const H_HUBBLE = 0.674;

// Панел A: n/p(t)
const AX0 = 40;
const AX1 = 300;
const AY0 = 30;
const AY1 = 220;
const T_MIN = 1;
const T_MAX = 3000;
const ax = (t: number) => AX0 + (Math.log10(t / T_MIN) / Math.log10(T_MAX / T_MIN)) * (AX1 - AX0);
const ay = (x: number) => AY1 - (x / 0.18) * (AY1 - AY0);
// Панел B: D/H(η)
const BX0 = 370;
const BX1 = 620;
const BY0 = 30;
const BY1 = 220;
const ETA_MIN = 1e-10;
const ETA_MAX = 1e-9;
const DH_MIN = 5e-6;
const DH_MAX = 3e-4;
const bx = (eta: number) => BX0 + (Math.log10(eta / ETA_MIN) / Math.log10(ETA_MAX / ETA_MIN)) * (BX1 - BX0);
const by = (dh: number) => BY1 - (Math.log10(dh / DH_MIN) / Math.log10(DH_MAX / DH_MIN)) * (BY1 - BY0);

const npRatio = (t: number) => X_FREEZE * Math.exp(-t / TAU);
const helium = (x: number) => (2 * x) / (1 + x);
const deuterium = (eta: number) => 2.55e-5 * (eta / ETA_BEST) ** -1.6;

export default function BBNLab() {
  const [tNuc, setTNuc] = useState(400);
  const [logEta, setLogEta] = useState(Math.log10(3e-10));
  const x = npRatio(tNuc);
  const Y = helium(x);
  const eta = 10 ** logEta;
  const dh = deuterium(eta);
  const omegaB = eta / 2.74e-8 / H_HUBBLE ** 2;
  const yOk = Math.abs(Y - Y_OBS) < 0.006;
  const dOk = Math.abs(dh - DH_OBS) / DH_OBS < 0.08;

  const npCurve = Array.from({ length: 101 }, (_, i) => {
    const t = T_MIN * (T_MAX / T_MIN) ** (i / 100);
    return `${ax(t)},${ay(npRatio(t))}`;
  }).join(' ');
  const dhCurve = Array.from({ length: 101 }, (_, i) => {
    const e = ETA_MIN * (ETA_MAX / ETA_MIN) ** (i / 100);
    return `${bx(e)},${by(deuterium(e))}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Първите три минути</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вляво: след първата секунда на всеки 6 протона има 1 неутрон, а свободните неутрони се разпадат. Колкото по-късно започне
        синтезът, толкова по-малко хелий. Вдясно: колкото повече обикновено вещество има, толкова по-пълно деутерият „изгаря“ в хелий.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Панел A */}
        <rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={npCurve} fill="none" stroke="#fbbf24" strokeWidth="2" />
        <line x1={ax(tNuc)} x2={ax(tNuc)} y1={AY0} y2={AY1} stroke="#f472b6" strokeDasharray="4 3" />
        <circle cx={ax(tNuc)} cy={ay(x)} r="4" fill="#f472b6" />
        {[1, 10, 100, 1000].map(t => (
          <text key={t} x={ax(t)} y={AY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {t} s
          </text>
        ))}
        {[0.05, 0.1, 0.15].map(v => (
          <text key={v} x={AX0 - 4} y={ay(v) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {fmt(v, 2)}
          </text>
        ))}
        <text x={AX0 + 4} y={AY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          неутрони / протони
        </text>
        <text x={AX0} y={H - 18} fontSize="11" fill={yOk ? '#4ade80' : '#fde68a'} fontWeight="700">
          хелий по маса: Y = 2x / (1 + x) = {fmt(Y * 100, 1)}%
        </text>
        <text x={AX0} y={H - 4} fontSize="9" fill="white" fillOpacity="0.6">
          наблюдавано в най-старите звезди и мъглявини: 24,5%
        </text>

        {/* Панел B */}
        <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <rect x={BX0} y={by(DH_OBS * 1.04)} width={BX1 - BX0} height={by(DH_OBS * 0.96) - by(DH_OBS * 1.04)} fill="#4ade80" fillOpacity="0.25" />
        <defs>
          <clipPath id="bbn-b">
            <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} />
          </clipPath>
        </defs>
        <polyline points={dhCurve} fill="none" stroke="#93c5fd" strokeWidth="2" clipPath="url(#bbn-b)" />
        <line x1={bx(eta)} x2={bx(eta)} y1={BY0} y2={BY1} stroke="#f472b6" strokeDasharray="4 3" />
        <circle cx={bx(eta)} cy={by(dh)} r="4" fill="#f472b6" />
        {[1e-10, 3e-10, 1e-9].map(e => (
          <text key={e} x={bx(e)} y={BY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {sci(e, 0)}
          </text>
        ))}
        {[1e-5, 1e-4].map(v => (
          <text key={v} x={BX0 - 4} y={by(v) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {sci(v, 0)}
          </text>
        ))}
        <text x={BX0 + 4} y={BY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          деутерий / водород
        </text>
        <text x={BX1 - 4} y={by(DH_OBS) - 4} fontSize="8" textAnchor="end" fill="#86efac">
          наблюдавано в далечни газови облаци
        </text>
        <text x={BX0} y={H - 18} fontSize="11" fill={dOk ? '#4ade80' : '#fde68a'} fontWeight="700">
          η = {sci(eta, 2)} бариона на фотон
        </text>
        <text x={BX0} y={H - 4} fontSize="9" fill="white" fillOpacity="0.7">
          ⇒ обикновено вещество: {fmt(omegaB * 100, 1)}% от критичната плътност
        </text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Синтезът започва при t = {fmt(tNuc, 0)} s</label>
          <input type="range" min="20" max="1500" step="1" value={tNuc} onChange={e => setTNuc(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Бариони на фотон η = {sci(eta, 2)}</label>
          <input type="range" min={-10} max={-9} step="0.005" value={logEta} onChange={e => setLogEta(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {yOk && dOk
          ? 'Точно така! Синтезът започва след ~2,5 минути, когато деутерият вече не се разбива от горещите фотони, и почти всички оцелели неутрони влизат в хелий. А количеството деутерий показва, че обикновеното вещество е само ~5% от критичната плътност – останалото са тъмна материя и тъмна енергия (Лекция 29).'
          : 'Нагласете двата плъзгача така, че предсказаните количества хелий и деутерий да съвпаднат с наблюдаваните. Тези няколко числа, пресметнати от физиката на първите минути, са едно от най-силните доказателства за горещия Голям взрив.'}
      </p>
    </div>
  );
}
