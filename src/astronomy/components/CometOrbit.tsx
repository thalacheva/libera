import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 340;
const CY = 165;
const V_EARTH = 29.78; // km/s – орбитална скорост на Земята, v = 29,78 · √(2/r − 1/a) за r, a в AU
const ACTIVE_R = 3; // AU – на това разстояние водният лед започва да се изпарява

type Comet = { id: string; name: string; a: number; e: number; text: string };

const COMETS: Comet[] = [
  { id: 'halley', name: '1P/Халей', a: 17.83, e: 0.967, text: 'Най-известната периодична комета. Обикаля Слънцето обратно на планетите. Връща се на всеки 75–76 години – последно през 1986 г., следващия път през лятото на 2061 г. Активна е само около година от всяка обиколка; през останалото време е тъмна ледена буца, далеч отвъд Сатурн.' },
  { id: 'encke', name: '2P/Енке', a: 2.215, e: 0.848, text: 'Една от кометите с най-къс период – 3,3 години. Афелият ѝ е вътре в орбитата на Юпитер. Минала е край Слънцето стотици пъти и е изгубила голяма част от леда си – затова е слаба. Отломките ѝ създават метеорния поток Тауриди.' },
  { id: '67p', name: '67P/Чурюмов–Герасименко', a: 3.46, e: 0.641, text: 'Кометата на сондата Rosetta. Ядро като гумено пате, дълго 4 km, с плътност колкото на дървото. Комета от семейството на Юпитер: през 1959 г. минава близо до него и той скъсява перихелия ѝ от 2,7 на 1,3 AU – тогава тя става активна.' },
  { id: 'swift', name: '109P/Суифт–Тътъл', a: 26.1, e: 0.963, text: 'Ядро с диаметър ~26 km – най-голямото известно тяло, което редовно пресича орбитата на Земята. Отломките ѝ са Персеидите. Следващото ѝ завръщане е през 2126 г.' },
  { id: 'halebopp', name: 'C/1995 O1 Хейл–Боп', a: 183, e: 0.995, text: 'Видима с просто око цели 18 месеца през 1996–1997 г. – рекорд. Ядрото е ~60 km, много по-голямо от това на Халей. Предишното ѝ преминаване е било преди ~4200 години, а следващото – след ~2400 години, защото Юпитер промени орбитата ѝ.' },
];

/** Положение по орбитата: E – ексцентрична аномалия. Перихелият е вляво от Слънцето. */
function onOrbit(c: Comet, E: number) {
  const b = c.a * Math.sqrt(1 - c.e * c.e);
  return { x: c.a * (Math.cos(E) - c.e), y: b * Math.sin(E), r: c.a * (1 - c.e * Math.cos(E)) };
}

function solveKepler(M: number, e: number) {
  let E = M;
  for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/** Каква част от обиколката кометата прекарва по-близо от r0 до Слънцето. */
function fractionInside(c: Comet, r0: number) {
  const q = c.a * (1 - c.e);
  const Q = c.a * (1 + c.e);
  if (q >= r0) return 0;
  if (Q <= r0) return 1;
  const E = Math.acos((1 - r0 / c.a) / c.e);
  return (E - c.e * Math.sin(E)) / Math.PI;
}

export default function CometOrbit() {
  const [cometId, setCometId] = useState('halley');
  const [t, setT] = useState(-0.15); // години от перихелия
  const [playing, setPlaying] = useState(false);
  const [speedLog, setSpeedLog] = useState(-1); // log₁₀ (години в секунда)
  const [inner, setInner] = useState(true);
  const comet = COMETS.find(c => c.id === cometId)!;
  const period = comet.a ** 1.5;
  const speed = 10 ** speedLog;

  useAnimationFrame(playing, dt => setT(v => v + dt * speed));

  const M = (2 * Math.PI * (((t % period) + period) % period)) / period;
  const E = solveKepler(M, comet.e);
  const pos = onOrbit(comet, E);
  const v = V_EARTH * Math.sqrt(2 / pos.r - 1 / comet.a);

  // Мащаб и положение на Слънцето
  const q = comet.a * (1 - comet.e);
  const Q = comet.a * (1 + comet.e);
  const scale = inner ? 28 : (W - 60) / (q + Q);
  const sunX = inner ? W / 2 : 30 + q * scale;
  const toScreen = (x: number, y: number) => ({ x: sunX - x * scale, y: CY - y * scale });

  const P = toScreen(pos.x, pos.y);
  const orbitPath = Array.from({ length: 361 }, (_, i) => {
    const o = onOrbit(comet, (i / 360) * 2 * Math.PI);
    const s = toScreen(o.x, o.y);
    return `${s.x},${s.y}`;
  }).join(' ');

  // Опашките: йонната сочи точно от Слънцето, праховата изостава назад по орбитата
  const activity = pos.r < ACTIVE_R ? 1 : Math.exp(-(pos.r - ACTIVE_R) * 1.5);
  const tailAU = Math.min(1.6, 1.0 / (pos.r * pos.r)) * activity;
  const anti = { x: (P.x - sunX) / Math.hypot(P.x - sunX, P.y - CY), y: (P.y - CY) / Math.hypot(P.x - sunX, P.y - CY) };
  const b = comet.a * Math.sqrt(1 - comet.e ** 2);
  const velRaw = { x: comet.a * Math.sin(E), y: -b * Math.cos(E) }; // посока на движението на екрана
  const vl = Math.hypot(velRaw.x, velRaw.y);
  const vel = { x: velRaw.x / vl, y: velRaw.y / vl };
  const L = Math.max(tailAU * scale, 0);
  const ionEnd = { x: P.x + anti.x * L * 1.4, y: P.y + anti.y * L * 1.4 };
  const dustCtrl = { x: P.x + anti.x * L * 0.6, y: P.y + anti.y * L * 0.6 };
  const dustEnd = { x: P.x + anti.x * L * 0.8 - vel.x * L * 0.5, y: P.y + anti.y * L * 0.8 - vel.y * L * 0.5 };
  const comaR = Math.min(10, (2.5 * activity) / Math.sqrt(pos.r)) * (inner ? 1 : 0.6) + 1.5;

  const tYears = ((t % period) + period) % period;
  const sincePeri = tYears > period / 2 ? tYears - period : tYears;
  const timeText = Math.abs(sincePeri) < 1 ? `${fmt(sincePeri * 365.25, 0)} дни` : `${fmt(sincePeri, 1)} г.`;
  const activeFrac = fractionInside(comet, ACTIVE_R);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Комета по орбитата си</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Пуснете кометата. Вътре в ~3 AU ледът започва да се изпарява и тя „оживява“. Синята йонна опашка винаги сочи от Слънцето, а
        жълтата прахова се извива назад по орбитата.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Планетни орбити за ориентир */}
        {[
          { r: 1, name: 'Земя', color: '#3b82f6' },
          { r: 5.2, name: 'Юпитер', color: '#d6a46c' },
          { r: 9.54, name: 'Сатурн', color: '#e9d18f' },
          { r: 30.1, name: 'Нептун', color: '#4f7fe0' },
        ].map(p => (
          <g key={p.name}>
            <circle cx={sunX} cy={CY} r={p.r * scale} fill="none" stroke={p.color} strokeOpacity="0.35" />
            {p.r * scale > 14 && p.r * scale < 300 && (
              <text x={sunX} y={CY - p.r * scale - 3} fontSize="9" textAnchor="middle" fill={p.color} fillOpacity="0.8">
                {p.name}
              </text>
            )}
          </g>
        ))}
        {inner && (
          <circle cx={sunX} cy={CY} r={ACTIVE_R * scale} fill="#38bdf8" fillOpacity="0.04" stroke="#38bdf8" strokeOpacity="0.4" strokeDasharray="4 4" />
        )}
        {inner && (
          <text x={sunX + ACTIVE_R * scale * 0.7 + 4} y={CY + ACTIVE_R * scale * 0.7 + 12} fontSize="9" fill="#7dd3fc">
            ~3 AU: ледът се изпарява
          </text>
        )}

        <polyline points={orbitPath} fill="none" stroke="white" strokeOpacity="0.3" strokeDasharray="3 3" />
        <circle cx={sunX} cy={CY} r={inner ? 7 : 5} fill="#fbbf24" />

        {/* Опашки и кома */}
        {L > 1 && (
          <g>
            <path d={`M ${P.x} ${P.y} Q ${dustCtrl.x} ${dustCtrl.y} ${dustEnd.x} ${dustEnd.y}`} fill="none" stroke="#fde68a" strokeOpacity="0.55" strokeWidth={Math.min(9, 2 + L / 15)} strokeLinecap="round" />
            <line x1={P.x} y1={P.y} x2={ionEnd.x} y2={ionEnd.y} stroke="#7dd3fc" strokeOpacity="0.8" strokeWidth="2" />
          </g>
        )}
        <circle cx={P.x} cy={P.y} r={comaR} fill="#e0f2fe" fillOpacity={0.15 + 0.4 * activity} />
        <circle cx={P.x} cy={P.y} r="1.8" fill="white" />

        {/* Данни */}
        <g fontSize="11" fill="white">
          <text x={12} y={20} fontWeight="700">
            {comet.name}
          </text>
          <text x={12} y={38} fillOpacity="0.8">
            r = {fmt(pos.r, 2)} AU, v = {fmt(v, 1)} km/s
          </text>
          <text x={12} y={54} fillOpacity="0.8">
            {sincePeri >= 0 ? 'след' : 'преди'} перихелия: {timeText.replace('-', '')}
          </text>
          <text x={12} y={70} fill={activity > 0.5 ? '#7dd3fc' : '#94a3b8'}>
            {activity > 0.5 ? 'активна' : activity > 0.05 ? 'събужда се' : 'спяща'}
          </text>
          <text x={W - 12} y={20} textAnchor="end" fillOpacity="0.8">
            период {fmt(period, period < 10 ? 2 : 0)} г.
          </text>
          <text x={W - 12} y={36} textAnchor="end" fillOpacity="0.8">
            q = {fmt(q, 2)} AU, Q = {fmt(Q, 1)} AU
          </text>
          <text x={W - 12} y={52} textAnchor="end" fill="#7dd3fc">
            по-близо от 3 AU: {fmt(activeFrac * 100, activeFrac < 0.1 ? 1 : 0)}% от времето
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {COMETS.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setCometId(c.id);
              setT(-0.15);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              c.id === cometId
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button
          onClick={() => setT(0)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ↺ перихелий
        </button>
        <button
          onClick={() => setInner(v => !v)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {inner ? '🔭 Цялата орбита' : '🔍 Близо до Слънцето'}
        </button>
      </div>
      <label className="block text-sm font-semibold mt-3 mb-1">
        Скорост: {speed < 1 ? `${fmt(speed * 365.25, 0)} дни` : `${fmt(speed, 1)} г.`} в секунда
      </label>
      <input type="range" min="-2" max="2" step="0.05" value={speedLog} onChange={e => setSpeedLog(Number(e.target.value))} className="w-full" />

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{comet.text}</p>
    </div>
  );
}
