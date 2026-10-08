import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 320;
const OX = 60; // Земята (x = 0)
const OY = 290; // t = 0
const MAXW = 230;
const MAXH = 260;

const TARGETS = [
  { name: 'Проксима Кентавър', d: 4.24 },
  { name: 'Сириус', d: 8.6 },
  { name: 'Вега', d: 25 },
];

export default function TwinParadoxLab() {
  const [beta, setBeta] = useState(0.8);
  const [d, setD] = useState(4.24);
  const [signals, setSignals] = useState(true);
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const T = (2 * d) / beta; // години на Земята
  const tau = T / gamma; // години за пътешественика
  const s = Math.min(MAXH / T, MAXW / d);
  const px = (x: number) => OX + x * s;
  const py = (t: number) => OY - t * s;

  // Годишни сигнали от Земята: кога ги получава пътешественикът
  const sig: { te: number; tr: number; xr: number }[] = [];
  for (let te = 1; te < T; te++) {
    let tr = te / (1 - beta);
    let xr = beta * tr;
    if (tr > T / 2) {
      tr = (d + te + (beta * T) / 2) / (1 + beta);
      xr = d - beta * (tr - T / 2);
    }
    if (tr <= T) sig.push({ te, tr, xr });
  }
  const outCount = sig.filter(q => q.tr <= T / 2).length;
  const inCount = sig.length - outCount;
  // Тиковете на пътешественика – на всяка собствена година
  const ticks: { x: number; t: number }[] = [];
  for (let k = 1; k < tau; k++) {
    const tc = k * gamma;
    ticks.push({ x: tc <= T / 2 ? beta * tc : d - beta * (tc - T / 2), t: tc });
  }
  const dense = T > 60;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Парадоксът на близнаците</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Единият близнак лети до звезда и се връща. Диаграмата на Минковски: хоризонтално е разстоянието, вертикално – времето на Земята.
        Светлината се движи по линии под 45°.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="tw-clip">
            <rect x={OX - 10} y={OY - MAXH - 5} width={MAXW + 20} height={MAXH + 10} />
          </clipPath>
        </defs>
        <line x1={OX} x2={OX + MAXW + 10} y1={OY} y2={OY} stroke="white" strokeOpacity="0.4" />
        <text x={OX + MAXW + 10} y={OY + 14} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          разстояние, св. г.
        </text>
        <text x={OX - 6} y={OY - MAXH} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          t, г.
        </text>
        <line x1={px(d)} x2={px(d)} y1={OY} y2={py(T)} stroke="#fde68a" strokeOpacity="0.25" strokeDasharray="3 3" />
        <text x={px(d)} y={OY + 14} fontSize="9" textAnchor="middle" fill="#fde68a">
          звезда, {fmt(d, 1)} св. г.
        </text>
        <g clipPath="url(#tw-clip)">
          {signals &&
            sig.map(q => (
              <line key={q.te} x1={px(0)} y1={py(q.te)} x2={px(q.xr)} y2={py(q.tr)} stroke={q.tr <= T / 2 ? '#93c5fd' : '#fca5a5'} strokeOpacity={dense ? 0.25 : 0.55} strokeWidth="1" />
            ))}
        </g>
        {/* Земята */}
        <line x1={px(0)} x2={px(0)} y1={OY} y2={py(T)} stroke="#86efac" strokeWidth="3" />
        {!dense &&
          Array.from({ length: Math.floor(T) }, (_, k) => (
            <circle key={k} cx={px(0)} cy={py(k + 1)} r={2} fill="#86efac" />
          ))}
        {/* Пътешественикът */}
        <polyline points={`${px(0)},${py(0)} ${px(d)},${py(T / 2)} ${px(0)},${py(T)}`} fill="none" stroke="#f0abfc" strokeWidth="3" />
        {!dense && ticks.map((k, i) => <circle key={i} cx={px(k.x)} cy={py(k.t)} r={2.5} fill="#f0abfc" />)}
        <text x={px(0) - 6} y={py(T) + 4} fontSize="10" textAnchor="end" fill="#86efac">
          {fmt(T, 1)} г.
        </text>

        <g fontSize="11" fill="white" transform="translate(330, 40)">
          <text x={0} y={0} fontSize="13" fontWeight="700" fill="#f0abfc">
            v = {fmt(beta, 3)}c · γ = {fmt(gamma, 2)}
          </text>
          <text x={0} y={26} fill="#86efac">
            Близнакът на Земята остарява с {fmt(T, 1)} г.
          </text>
          <text x={0} y={46} fill="#f0abfc">
            Пътешественикът остарява с {fmt(tau, 1)} г.
          </text>
          <text x={0} y={66} fillOpacity="0.85">
            разлика: {fmt(T - tau, 1)} г.
          </text>
          <text x={0} y={92} fontSize="10" fillOpacity="0.7">
            За пътешественика разстоянието е свито до {fmt(d / gamma, 2)} св. г.
          </text>
          {signals && (
            <>
              <text x={0} y={122} fontSize="10" fill="#93c5fd">
                на отиване получава {outCount} годишни сигнала от Земята
              </text>
              <text x={0} y={138} fontSize="10" fill="#fca5a5">
                на връщане – останалите {inCount}
              </text>
              <text x={0} y={154} fontSize="10" fillOpacity="0.6">
                (на отиване – по-рядко, на връщане – по-често: Доплер)
              </text>
            </>
          )}
          <text x={0} y={190} fontSize="10" fillOpacity="0.6">
            Точките са годините по часовника на всеки близнак.
          </text>
          <text x={0} y={206} fontSize="10" fillOpacity="0.6">
            Пътешественикът сменя отправната си система при
          </text>
          <text x={0} y={222} fontSize="10" fillOpacity="0.6">
            обръщането – затова ситуацията не е симетрична.
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Скорост: v = {fmt(beta, 3)}c</label>
          <input type="range" min="0.1" max="0.995" step="0.005" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Разстояние до звездата: {fmt(d, 1)} св. г.</label>
          <input type="range" min="1" max="30" step="0.1" value={d} onChange={e => setD(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {TARGETS.map(q => (
          <button key={q.name} onClick={() => setD(q.d)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            {q.name} ({fmt(q.d, 1)} св. г.)
          </button>
        ))}
        <button onClick={() => setSignals(v => !v)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          {signals ? 'скрий сигналите' : 'покажи сигналите'}
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Всеки близнак вижда часовника на другия да върви бавно, докато се движат равномерно. Но само пътешественикът спира и обръща –
        затова той наистина е по-млад при срещата. Ефектът е измерен с атомни часовници в самолети (Хафеле и Кийтинг, 1971 г.).
      </p>
    </div>
  );
}
