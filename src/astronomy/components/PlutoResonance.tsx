import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const SUN = { x: 175, y: 160 };
const SCALE = 135 / 49.4; // пиксела на AU – афелият на Плутон е на 135 px
const START_YEAR = 1989.7; // перихелий на Плутон

const NEPTUNE = { a: 30.07, period: 164.8, lon0: (282 * Math.PI) / 180 };
const PLUTO = { a: 39.48, e: 0.2488, peri: (224 * Math.PI) / 180 };

const MODES = [
  { id: 'res', label: 'Резонанс 3 : 2 (истинският)', ratio: 1.5 },
  { id: 'off', label: 'Ако нямаше резонанс', ratio: 1.43 },
];

/** Положение на Плутон (AU) t години след перихелия: решаваме уравнението на Кеплер. */
function pluto(t: number, period: number) {
  const M = (2 * Math.PI * t) / period;
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - PLUTO.e * Math.sin(E) - M) / (1 - PLUTO.e * Math.cos(E));
  const x = PLUTO.a * (Math.cos(E) - PLUTO.e);
  const y = PLUTO.a * Math.sqrt(1 - PLUTO.e ** 2) * Math.sin(E);
  const r = Math.hypot(x, y);
  const lon = Math.atan2(y, x) + PLUTO.peri;
  return { x: r * Math.cos(lon), y: r * Math.sin(lon), r };
}

const neptuneLon = (t: number) => NEPTUNE.lon0 + (2 * Math.PI * t) / NEPTUNE.period;

/** Най-малкото разстояние Плутон–Нептун за 10 000 години. */
const MIN_DIST = MODES.map(m => {
  let min = Infinity;
  for (let t = 0; t < 10000; t += 0.5) {
    const p = pluto(t, NEPTUNE.period * m.ratio);
    const l = neptuneLon(t);
    min = Math.min(min, Math.hypot(p.x - NEPTUNE.a * Math.cos(l), p.y - NEPTUNE.a * Math.sin(l)));
  }
  return min;
});

export default function PlutoResonance() {
  const [t, setT] = useState(0); // години след 1989,7
  const [playing, setPlaying] = useState(false);
  const [modeIndex, setModeIndex] = useState(0);
  const [rotating, setRotating] = useState(false);
  const mode = MODES[modeIndex];
  const plutoPeriod = NEPTUNE.period * mode.ratio;

  useAnimationFrame(playing, dt => setT(v => v + dt * 25));

  // Във въртящата се система Нептун стои неподвижно вдясно
  const frame = (x: number, y: number, time: number) => {
    const rot = rotating ? -neptuneLon(time) : 0;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    return { x: SUN.x + (x * c - y * s) * SCALE, y: SUN.y - (x * s + y * c) * SCALE };
  };

  const p = pluto(t, plutoPeriod);
  const ln = neptuneLon(t);
  const nx = NEPTUNE.a * Math.cos(ln);
  const ny = NEPTUNE.a * Math.sin(ln);
  const P = frame(p.x, p.y, t);
  const N = frame(nx, ny, t);
  const dist = Math.hypot(p.x - nx, p.y - ny);

  // Следата на Плутон за последните ~500 години
  const trail = Array.from({ length: 240 }, (_, i) => {
    const tt = t - (240 - i) * 2.06;
    const q = pluto(tt, plutoPeriod);
    const f = rotating ? frame(q.x, q.y, tt) : frame(q.x, q.y, t);
    return `${f.x},${f.y}`;
  }).join(' ');

  // Орбитата на Плутон в неподвижната система
  const orbit = Array.from({ length: 181 }, (_, i) => {
    const q = pluto((i / 180) * plutoPeriod, plutoPeriod);
    const f = frame(q.x, q.y, 0);
    return `${f.x},${f.y}`;
  }).join(' ');

  const year = START_YEAR + t;
  const closerThanNeptune = p.r < NEPTUNE.a;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Защо Плутон не се удря в Нептун</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Орбитата на Плутон пресича тази на Нептун, но двете тела никога не се срещат. Пуснете времето (1 s = 25 години) и опитайте
        въртящата се система, в която Нептун стои на едно място.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Орбита на Нептун */}
        <circle cx={SUN.x} cy={SUN.y} r={NEPTUNE.a * SCALE} fill="none" stroke="#4f7fe0" strokeOpacity="0.5" />
        {!rotating && <polyline points={orbit} fill="none" stroke="#d6b48a" strokeOpacity="0.35" strokeDasharray="3 3" />}
        <polyline points={trail} fill="none" stroke="#d6b48a" strokeOpacity={rotating ? 0.7 : 0.25} strokeWidth="1.5" />

        <circle cx={SUN.x} cy={SUN.y} r="6" fill="#fbbf24" />
        <line x1={P.x} y1={P.y} x2={N.x} y2={N.y} stroke="white" strokeOpacity="0.25" strokeDasharray="2 3" />
        <circle cx={N.x} cy={N.y} r="6" fill="#4f7fe0" />
        <text x={N.x} y={N.y - 10} fontSize="10" textAnchor="middle" fill="#93c5fd">
          Нептун
        </text>
        <circle cx={P.x} cy={P.y} r="4" fill="#d6b48a" />
        <text x={P.x} y={P.y - 8} fontSize="10" textAnchor="middle" fill="#fde68a">
          Плутон
        </text>

        {/* Данни */}
        <g transform="translate(380, 36)" fontSize="11" fill="white">
          <text x={0} y={0} fontSize="16" fontWeight="700">
            {fmt(year, 0)} г.
          </text>
          <text x={0} y={26} fillOpacity="0.8">
            Плутон – Слънце: {fmt(p.r, 1)} AU
          </text>
          <text x={0} y={44} fillOpacity="0.8">
            Плутон – Нептун: {fmt(dist, 1)} AU
          </text>
          <text x={0} y={62} fill="#fbbf24">
            най-близо за 10 000 г.: {fmt(MIN_DIST[modeIndex], 1)} AU
          </text>
          <text x={0} y={88} fillOpacity="0.8">
            обиколки на Нептун: {fmt(Math.max(0, Math.floor(t / NEPTUNE.period)), 0)}
          </text>
          <text x={0} y={106} fillOpacity="0.8">
            обиколки на Плутон: {fmt(Math.max(0, Math.floor(t / plutoPeriod)), 0)}
          </text>
          <text x={0} y={124} fillOpacity="0.6" fontSize="10">
            T_Плутон / T_Нептун = {fmt(mode.ratio, 2)}
          </text>
          {closerThanNeptune && (
            <text x={0} y={152} fill="#4ade80" fontSize="10">
              Сега Плутон е по-близо до Слънцето от Нептун!
            </text>
          )}
          <text x={0} y={178} fillOpacity="0.55" fontSize="10">
            {rotating ? 'Въртяща се система: Нептун е неподвижен.' : 'Неподвижна система (изглед отгоре).'}
          </text>
          <text x={0} y={194} fillOpacity="0.55" fontSize="10">
            Наклонът на орбитата на Плутон (17°)
          </text>
          <text x={0} y={208} fillOpacity="0.55" fontSize="10">
            е пренебрегнат.
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button
          onClick={() => {
            setT(0);
            setPlaying(false);
          }}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ↺ 1989 г.
        </button>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={rotating} onChange={e => setRotating(e.target.checked)} />
          въртяща се система
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setModeIndex(i)}
            className={`px-3 py-1 rounded text-sm border ${
              i === modeIndex
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {modeIndex === 0
          ? 'За всеки 3 обиколки на Нептун Плутон прави точно 2. Когато Плутон е в перихелий и пресича орбитата на Нептун, Нептун винаги е далеч – на около четвърт обиколка. Във въртящата се система следата на Плутон е затворена примка, която никога не стига до Нептун. Двете тела не се приближават на по-малко от ~17 AU – Плутон минава по-близо до Уран, отколкото до Нептун!'
          : 'При отношение 1,43 срещите се изместват при всяка обиколка и рано или късно Плутон минава през перихелий точно когато Нептун е наблизо. Тогава Нептун би изхвърлил Плутон от орбитата му. Резонансът е причината Плутон да оцелее 4,5 млрд. години – и вероятно Нептун сам го е „хванал“ в него, докато бавно се е отдалечавал от Слънцето.'}
      </p>
    </div>
  );
}
