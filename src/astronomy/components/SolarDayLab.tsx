import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const SUN = { x: 230, y: 160 };
const A = 130; // голяма полуос в пиксели
const PLANET_R = 16;

type Mode = {
  id: string;
  label: string;
  year: number; // дни
  rotation: number; // сидеричен период в дни, отрицателен при обратно въртене
  e: number;
  speed: number; // дни в секунда
  text: string;
};

const MODES: Mode[] = [
  {
    id: 'mercury',
    label: 'Меркурий (3 : 2)',
    year: 87.97,
    rotation: 58.65,
    e: 0.206,
    speed: 18,
    text: 'За 2 обиколки около Слънцето Меркурий се завърта точно 3 пъти около оста си – резонанс 3 : 2. Затова едно слънчево денонощие трае 176 земни дни, колкото две негови години. Около перихелия орбиталното движение е по-бързо от въртенето и Слънцето за кратко тръгва назад по небето.',
  },
  {
    id: 'locked',
    label: 'Ако беше синхронен (1 : 1)',
    year: 87.97,
    rotation: 87.97,
    e: 0.206,
    speed: 18,
    text: 'До 1965 г. астрономите смятали, че Меркурий винаги е обърнат с една страна към Слънцето, както Луната към Земята. Радарни измервания от обсерваторията Аресибо показват, че периодът е 59, а не 88 дни. Забележете, че дори при синхронно въртене Слънцето се люлее напред-назад (либрация) – заради издължената орбита.',
  },
  {
    id: 'venus',
    label: 'Венера (обратно)',
    year: 224.7,
    rotation: -243.0,
    e: 0.007,
    speed: 30,
    text: 'Венера се върти обратно на обикалянето си и много бавно – 243 дни, по-дълго от годината ѝ (225 дни). Двете движения се събират и слънчевото денонощие става 117 дни. Там Слънцето изгрява на запад и залязва на изток – ако изобщо можеше да се види през облаците.',
  },
];

/** Положение по елипсата в момент t (от перихелий): решаваме уравнението на Кеплер. */
function orbit(t: number, year: number, e: number) {
  const M = (2 * Math.PI * (t % year)) / year;
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const x = A * (Math.cos(E) - e);
  const y = A * Math.sqrt(1 - e * e) * Math.sin(E);
  let nu = Math.atan2(y, x);
  if (nu < 0) nu += 2 * Math.PI;
  // Непрекъснат ъгъл – с броя на пълните обиколки
  return { x, y, nu: nu + 2 * Math.PI * Math.floor(t / year) };
}

export default function SolarDayLab() {
  const [modeIndex, setModeIndex] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mode = MODES[modeIndex];

  useAnimationFrame(playing, dt => setT(v => v + dt * mode.speed));

  const p = orbit(t, mode.year, mode.e);
  const px = SUN.x + p.x;
  const py = SUN.y - p.y; // y на екрана е надолу

  // Ъгъл на въртене (математически, обратно на часовниковата стрелка). В t = 0 флагчето сочи към Слънцето.
  const spin = (2 * Math.PI * t) / mode.rotation;
  const flag = Math.PI + spin;
  // Местно слънчево време: ъгъл между флагчето и посоката към Слънцето
  const local = flag - (p.nu + Math.PI);
  const solarDays = Math.abs(local) / (2 * Math.PI);
  const wrapped = Math.atan2(Math.sin(local), Math.cos(local));
  const noon = Math.abs(wrapped) < 0.12;

  const toSunDeg = (Math.atan2(SUN.y - py, SUN.x - px) * 180) / Math.PI;

  // Орбитата
  const b = A * Math.sqrt(1 - mode.e ** 2);
  const cx = SUN.x - A * mode.e;

  const choose = (i: number) => {
    setModeIndex(i);
    setT(0);
    setPlaying(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-stone-300 dark:border-stone-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко е дълъг денят?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Флагчето е забито в повърхността. Когато сочи към Слънцето, там е пладне. Сравнете колко пъти планетата се завърта спрямо
        звездите и колко пъти – спрямо Слънцето.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="sd-sun">
            <stop offset="0" stopColor="#fff7d6" />
            <stop offset="0.7" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" />
          </radialGradient>
        </defs>

        <ellipse cx={cx} cy={SUN.y} rx={A} ry={b} fill="none" stroke="white" strokeOpacity="0.25" strokeDasharray="4 4" />
        <circle cx={SUN.x} cy={SUN.y} r={18} fill="url(#sd-sun)" />
        <text x={SUN.x + A * (1 - mode.e) + 4} y={SUN.y + 32} fontSize="10" fill="white" fillOpacity="0.5">
          перихелий
        </text>
        <line x1={SUN.x} y1={SUN.y} x2={px} y2={py} stroke="#fde047" strokeOpacity="0.25" />

        {/* Планетата: тъмна, с осветена половина към Слънцето */}
        <circle cx={px} cy={py} r={PLANET_R} fill="#292524" stroke="#57534e" />
        <path
          d={`M ${px} ${py - PLANET_R} A ${PLANET_R} ${PLANET_R} 0 0 1 ${px} ${py + PLANET_R} Z`}
          fill={mode.id === 'venus' ? '#fcd34d' : '#a8a29e'}
          transform={`rotate(${toSunDeg} ${px} ${py})`}
        />
        {/* Флагчето */}
        <line
          x1={px}
          y1={py}
          x2={px + (PLANET_R + 12) * Math.cos(flag)}
          y2={py - (PLANET_R + 12) * Math.sin(flag)}
          stroke={noon ? '#4ade80' : '#f43f5e'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={px + (PLANET_R + 12) * Math.cos(flag)} cy={py - (PLANET_R + 12) * Math.sin(flag)} r="4" fill={noon ? '#4ade80' : '#f43f5e'} />
        {noon && (
          <text x={px} y={py - PLANET_R - 20} fontSize="12" textAnchor="middle" fill="#4ade80" fontWeight="700">
            пладне
          </text>
        )}

        {/* Броячи */}
        <g transform="translate(430, 50)" fontSize="13" fill="white">
          <text y={0} fillOpacity="0.6" fontSize="11">
            изминали земни дни
          </text>
          <text y={20} fontFamily="monospace" fontSize="18" fontWeight="700">
            {fmt(t, 0)}
          </text>
          <text y={55} fillOpacity="0.6" fontSize="11">
            обиколки около Слънцето
          </text>
          <text y={75} fontFamily="monospace" fontSize="18" fontWeight="700" fill="#93c5fd">
            {fmt(t / mode.year, 2)}
          </text>
          <text y={110} fillOpacity="0.6" fontSize="11">
            завъртания спрямо звездите
          </text>
          <text y={130} fontFamily="monospace" fontSize="18" fontWeight="700" fill="#f9a8d4">
            {fmt(Math.abs(t / mode.rotation), 2)}
          </text>
          <text y={165} fillOpacity="0.6" fontSize="11">
            слънчеви денонощия
          </text>
          <text y={185} fontFamily="monospace" fontSize="18" fontWeight="700" fill="#4ade80">
            {fmt(solarDays, 2)}
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            onClick={() => choose(i)}
            className={`px-3 py-1 rounded text-sm border ${
              i === modeIndex
                ? 'border-stone-500 bg-stone-100 text-stone-800 dark:bg-stone-500/20 dark:text-stone-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-2">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button
          onClick={() => {
            setT(0);
            setPlaying(false);
          }}
          className="px-4 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ↺ Отначало
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{mode.text}</p>
    </div>
  );
}
