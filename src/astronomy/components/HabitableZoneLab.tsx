import { useState } from 'react';
import { temperatureToRGB } from './light';
import { equilibriumT, fmt } from './terrestrialData';

const W = 640;
const H = 280;
const X0 = 40;
const X1 = 620;
const SY = 105; // ос на орбитите
// Граници на обитаемата зона (ефективен поток спрямо Земята)
const S_IN = 1.107; // избягал парников ефект
const S_OUT = 0.356; // максимален парников ефект
const S_IN_OPT = 1.776; // „скорошна Венера“
const S_OUT_OPT = 0.32; // „ранен Марс“

type Planet = { name: string; d: number };
const STARS: { name: string; L: number; T: number; planets: Planet[]; text: string }[] = [
  {
    name: 'Слънцето',
    L: 1,
    T: 5772,
    planets: [
      { name: 'Венера', d: 0.723 },
      { name: 'Земя', d: 1 },
      { name: 'Марс', d: 1.524 },
      { name: 'Юпитер', d: 5.2 },
    ],
    text: 'Земята е в зоната, Марс – на външния ѝ край, Венера – твърде близо: там парниковият ефект е излязъл извън контрол.',
  },
  {
    name: 'Kepler-452',
    L: 1.2,
    T: 5757,
    planets: [{ name: 'Kepler-452 b', d: 1.046 }],
    text: '„Братовчедката на Земята“: звезда като Слънцето, период 385 дни. Но планетата е ~1,6 пъти по-голяма от Земята – може да е скалиста, а може и да е мини-Нептун.',
  },
  {
    name: 'Kepler-186',
    L: 0.055,
    T: 3755,
    planets: [
      { name: 'b', d: 0.038 },
      { name: 'c', d: 0.057 },
      { name: 'd', d: 0.086 },
      { name: 'e', d: 0.122 },
      { name: 'f', d: 0.432 },
    ],
    text: 'Kepler-186 f (2014) е първата планета с размер почти колкото Земята, открита в обитаемата зона на друга звезда.',
  },
  {
    name: 'Проксима Кентавър',
    L: 0.00155,
    T: 3042,
    planets: [{ name: 'Проксима b', d: 0.0485 }],
    text: 'Най-близката звезда до нас има планета в зоната. Но тя е 8 пъти по-близо до звездата си от Меркурий до Слънцето, вероятно е приливно заключена и често е „облъчвана“ от силни изригвания.',
  },
  {
    name: 'TRAPPIST-1',
    L: 0.000553,
    T: 2566,
    planets: [
      { name: 'b', d: 0.0115 },
      { name: 'c', d: 0.0158 },
      { name: 'd', d: 0.0223 },
      { name: 'e', d: 0.0293 },
      { name: 'f', d: 0.0385 },
      { name: 'g', d: 0.0469 },
      { name: 'h', d: 0.0619 },
    ],
    text: 'Седем планети с размер близък до земния – всички по-близо до звездата, отколкото Меркурий до Слънцето. Три-четири от тях (d–g) са в обитаемата зона. JWST показа, че b и c вероятно нямат плътни атмосфери.',
  },
];

export default function HabitableZoneLab() {
  const [si, setSi] = useState(0);
  const [logD, setLogD] = useState(0);
  const [albedo, setAlbedo] = useState(0.3);
  const s = STARS[si];
  const sq = Math.sqrt(s.L);
  const hzIn = sq / Math.sqrt(S_IN);
  const hzOut = sq / Math.sqrt(S_OUT);
  const optIn = sq / Math.sqrt(S_IN_OPT);
  const optOut = sq / Math.sqrt(S_OUT_OPT);
  const lMin = Math.log10(optIn / 8);
  const lMax = Math.log10(optOut * 6);
  const gx = (d: number) => X0 + ((Math.log10(d) - lMin) / (lMax - lMin)) * (X1 - X0);

  const d = sq * 10 ** logD;
  const S = s.L / (d * d);
  const T = equilibriumT(d / sq, albedo); // T_eq зависи само от потока
  const zone = d < optIn ? 'hot' : d < hzIn ? 'edgeIn' : d <= hzOut ? 'hz' : d <= optOut ? 'edgeOut' : 'cold';
  const zoneText = {
    hot: 'Твърде горещо: водата се изпарява и водородът ѝ избягва в космоса – като на Венера.',
    edgeIn: 'Вътрешният край на зоната: може би е имало вода в миналото, като на младата Венера.',
    hz: 'В обитаемата зона! С атмосфера като земната тук може да има течна вода на повърхността.',
    edgeOut: 'Външният край: нужен е много силен парников ефект – като на древния Марс.',
    cold: 'Твърде студено: водата е замръзнала (но под ледена кора може да има океан – като при Европа и Енцелад).',
  }[zone];

  // Тиклета по разстояние
  const ticks = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100].filter(t => Math.log10(t) >= lMin && Math.log10(t) <= lMax);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Обитаемата зона</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Зоната, в която планета със земна атмосфера може да има течна вода, зависи от светимостта на звездата: разстоянието расте
        като √L. Изберете звезда и преместете своята планета.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <linearGradient id="hz-star" x1="0" x2="1">
            <stop offset="0%" stopColor={temperatureToRGB(s.T)} stopOpacity="0.9" />
            <stop offset="100%" stopColor={temperatureToRGB(s.T)} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={20} width={60} height={170} fill="url(#hz-star)" />
        {/* Зони */}
        <rect x={X0} y={40} width={gx(optIn) - X0} height={130} fill="#ef4444" fillOpacity="0.12" />
        <rect x={gx(optIn)} y={40} width={gx(hzIn) - gx(optIn)} height={130} fill="#22c55e" fillOpacity="0.12" />
        <rect x={gx(hzIn)} y={40} width={gx(hzOut) - gx(hzIn)} height={130} fill="#22c55e" fillOpacity="0.32" />
        <rect x={gx(hzOut)} y={40} width={gx(optOut) - gx(hzOut)} height={130} fill="#22c55e" fillOpacity="0.12" />
        <rect x={gx(optOut)} y={40} width={X1 - gx(optOut)} height={130} fill="#3b82f6" fillOpacity="0.12" />
        <text x={(gx(hzIn) + gx(hzOut)) / 2} y={55} fontSize="10" textAnchor="middle" fill="#86efac" fontWeight="700">
          обитаема зона
        </text>
        <text x={(X0 + gx(optIn)) / 2 + 10} y={55} fontSize="10" textAnchor="middle" fill="#fca5a5">
          твърде горещо
        </text>
        <text x={(gx(optOut) + X1) / 2} y={55} fontSize="10" textAnchor="middle" fill="#93c5fd">
          твърде студено
        </text>
        <line x1={X0} x2={X1} y1={SY} y2={SY} stroke="white" strokeOpacity="0.2" />
        {/* Планети */}
        {s.planets.map((pl, i) => {
          const x = gx(pl.d);
          const up = s.planets.length > 3 && i % 2 === 1;
          return (
            <g key={pl.name}>
              <circle cx={x} cy={SY} r={5} fill="#e2e8f0" />
              <text x={x} y={up ? SY - 12 : SY + 18} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.85">
                {pl.name}
              </text>
            </g>
          );
        })}
        {/* Вашата планета */}
        <line x1={gx(d)} x2={gx(d)} y1={120} y2={160} stroke="#fbbf24" strokeOpacity="0.6" />
        <circle cx={gx(d)} cy={145} r={6} fill="#fbbf24" />
        <text x={Math.min(Math.max(gx(d), 90), X1 - 50)} y={168} fontSize="9" textAnchor="middle" fill="#fde68a">
          вашата планета
        </text>
        {/* Скала */}
        <line x1={X0} x2={X1} y1={185} y2={185} stroke="white" strokeOpacity="0.3" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={gx(t)} x2={gx(t)} y1={182} y2={188} stroke="white" strokeOpacity="0.4" />
            <text x={gx(t)} y={199} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {fmt(t, 3)}
            </text>
          </g>
        ))}
        <text x={X1} y={212} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          разстояние до звездата, AU (лог. скала)
        </text>
        <g fontSize="11" fill="white" transform="translate(40, 236)">
          <text x={0} y={0} fillOpacity="0.85">
            {s.name}: L = {fmt(s.L, s.L < 0.01 ? 5 : 3)} L☉ · обитаема зона {fmt(hzIn, hzIn < 0.1 ? 3 : 2)}–{fmt(hzOut, hzOut < 0.1 ? 3 : 2)} AU
          </text>
          <text x={0} y={20} fill="#fde68a" fontWeight="700">
            d = {fmt(d, d < 0.1 ? 4 : 2)} AU · поток {fmt(S, S < 0.1 ? 3 : 2)} × земния · T_равн ≈ {fmt(T, 0)} K ({fmt(T - 273, 0)} °C)
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Разстояние на вашата планета: {fmt(d, d < 0.1 ? 4 : 2)} AU</label>
          <input type="range" min={Math.log10(optIn / 6 / sq)} max={Math.log10((optOut * 5) / sq)} step="0.005" value={logD} onChange={ev => setLogD(Number(ev.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Албедо: {fmt(albedo, 2)}</label>
          <input type="range" min="0" max="0.8" step="0.01" value={albedo} onChange={ev => setAlbedo(Number(ev.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {STARS.map((q, i) => (
          <button
            key={q.name}
            onClick={() => setSi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === si ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {q.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {zoneText} {s.text} Равновесната температура не включва парниковия ефект: за Земята тя е −18 °C, а истинската средна е +15 °C.
      </p>
    </div>
  );
}
