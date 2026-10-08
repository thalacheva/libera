import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
// Изглед отгоре
const SUN = { x: 140, y: 200 };
const ORBIT = 70;
// Изглед на небето
const SKY = { x: 470, y: 150, half: 120 };
const YEARS = 3; // колко години показваме следата

const INSTRUMENTS = [
  { name: 'просто око', sigma: 60000 }, // в mas
  { name: 'наземен телескоп (XIX в.)', sigma: 50 },
  { name: 'Hipparcos (1989–1993)', sigma: 1 },
  { name: 'Gaia (2013–2025)', sigma: 0.02 },
];

const PRESETS = [
  { name: 'Проксима Кентавър', d: 1.302, beta: -44.8, mu: 3850 },
  { name: '61 Лебед', d: 3.5, beta: 51.5, mu: 5280 },
  { name: 'Вега', d: 7.68, beta: 61.7, mu: 350 },
  { name: 'Бетелгейзе', d: 168, beta: -16, mu: 29 },
  { name: 'Център на Галактиката', d: 8200, beta: -5.6, mu: 0 },
];

function formatAngle(mas: number) {
  if (mas >= 1000) return `${fmt(mas / 1000, 3)}″`;
  if (mas >= 1) return `${fmt(mas, 2)} mas`;
  return `${fmt(mas * 1000, 1)} µas`;
}

export default function ParallaxLab() {
  const [logD, setLogD] = useState(Math.log10(3.5));
  const [beta, setBeta] = useState(51.5);
  const [mu, setMu] = useState(0);
  const [t, setT] = useState(0.15); // години
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => setT(v => (v + dt * 0.25) % YEARS));

  const d = 10 ** logD;
  const p = 1000 / d; // mas
  const b = (beta * Math.PI) / 180;
  const theta = 2 * Math.PI * t;

  // Паралактична елипса + собствено движение (по оста x)
  const offset = (tt: number) => {
    const th = 2 * Math.PI * tt;
    return { x: p * Math.sin(th) + mu * (tt - YEARS / 2), y: p * Math.sin(b) * Math.cos(th) };
  };
  const span = Math.max(p * 1.2, (mu * YEARS) / 2 + p * 1.1, 1e-9);
  const scale = SKY.half / span; // px на mas
  const trail = Array.from({ length: 241 }, (_, i) => {
    const tt = (i / 240) * t;
    const o = offset(tt);
    return `${SKY.x + o.x * scale},${SKY.y - o.y * scale}`;
  }).join(' ');
  const now = offset(t);

  // Скала: подбираме кръгло число
  const bar = (() => {
    const target = span / 2;
    const pow = 10 ** Math.floor(Math.log10(target));
    const nice = [1, 2, 5, 10].map(k => k * pow).filter(v => v <= target).pop() ?? pow;
    return nice;
  })();

  const earth = { x: SUN.x + ORBIT * Math.cos(theta), y: SUN.y - ORBIT * Math.sin(theta) * 0.45 };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Паралаксът: звездата описва малка елипса</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Докато Земята обикаля Слънцето, близката звезда сякаш се люшка на фона на далечните. За една година тя описва елипса с голяма
        полуос p – паралакса. Ако звездата се движи и сама, елипсата се „разтегля“ във вълнообразна линия.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Изглед отгоре */}
        <ellipse cx={SUN.x} cy={SUN.y} rx={ORBIT} ry={ORBIT * 0.45} fill="none" stroke="#3b82f6" strokeOpacity="0.5" />
        <circle cx={SUN.x} cy={SUN.y} r="8" fill="#fbbf24" />
        <circle cx={earth.x} cy={earth.y} r="5" fill="#3b82f6" />
        <circle cx={SUN.x} cy={30} r="5" fill="#fde68a" />
        <text x={SUN.x + 9} y={33} fontSize="10" fill="#fde68a">
          близка звезда (не в мащаб!)
        </text>
        <line x1={earth.x} y1={earth.y} x2={SUN.x} y2={30} stroke="#fde68a" strokeOpacity="0.6" strokeDasharray="3 3" />
        <line x1={SUN.x - ORBIT} y1={SUN.y} x2={SUN.x} y2={30} stroke="white" strokeOpacity="0.15" />
        <line x1={SUN.x + ORBIT} y1={SUN.y} x2={SUN.x} y2={30} stroke="white" strokeOpacity="0.15" />
        <text x={SUN.x} y={SUN.y + 50} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
          орбита на Земята (1 AU)
        </text>
        <text x={14} y={20} fontSize="10" fill="white" fillOpacity="0.55">
          изглед отгоре
        </text>

        {/* Небето */}
        <rect x={SKY.x - SKY.half - 10} y={SKY.y - SKY.half - 10} width={2 * SKY.half + 20} height={2 * SKY.half + 20} fill="#020617" stroke="white" strokeOpacity="0.2" rx="6" />
        <line x1={SKY.x - SKY.half} x2={SKY.x + SKY.half} y1={SKY.y} y2={SKY.y} stroke="white" strokeOpacity="0.08" />
        <line x1={SKY.x} x2={SKY.x} y1={SKY.y - SKY.half} y2={SKY.y + SKY.half} stroke="white" strokeOpacity="0.08" />
        <polyline points={trail} fill="none" stroke="#fde68a" strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx={SKY.x + now.x * scale} cy={SKY.y - now.y * scale} r="5" fill="#fde68a" />
        {/* Далечни звезди на фона – неподвижни */}
        {[
          [-90, -70],
          [60, -95],
          [100, 40],
          [-60, 85],
          [20, 60],
          [-105, 10],
        ].map(([x, y], i) => (
          <circle key={i} cx={SKY.x + x} cy={SKY.y + y} r="1.6" fill="white" fillOpacity="0.7" />
        ))}
        <line x1={SKY.x - SKY.half + 6} x2={SKY.x - SKY.half + 6 + bar * scale} y1={SKY.y + SKY.half - 4} y2={SKY.y + SKY.half - 4} stroke="#93c5fd" strokeWidth="2" />
        <text x={SKY.x - SKY.half + 6} y={SKY.y + SKY.half - 10} fontSize="9" fill="#93c5fd">
          {formatAngle(bar)}
        </text>
        <text x={SKY.x - SKY.half} y={SKY.y - SKY.half + 6} fontSize="10" fill="white" fillOpacity="0.55">
          небето около звездата
        </text>
        <text x={SKY.x + SKY.half} y={SKY.y - SKY.half + 6} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
          {fmt(t, 2)} г.
        </text>
      </svg>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Разстояние: {d < 100 ? fmt(d, 2) : fmt(d, 0)} pc</label>
          <input type="range" min="0" max="4" step="0.01" value={logD} onChange={e => setLogD(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Еклиптична ширина: {fmt(beta, 0)}°</label>
          <input type="range" min="-90" max="90" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Собствено движение: {fmt(mu, 0)} mas/год.</label>
          <input type="range" min="0" max="6000" step="10" value={mu} onChange={e => setMu(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
          {playing ? '⏸ Пауза' : '▶ Пусни годините'}
        </button>
        {PRESETS.map(pr => (
          <button
            key={pr.name}
            onClick={() => {
              setLogD(Math.log10(pr.d));
              setBeta(pr.beta);
              setMu(pr.mu);
            }}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {pr.name}
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-sm sm:text-base">
        <p className="mb-2">
          <strong>p = 1 / d = {formatAngle(p)}</strong> · d = {d < 100 ? fmt(d, 2) : fmt(d, 0)} pc = {fmt(d * 3.26, d < 10 ? 1 : 0)} светлинни години
        </p>
        <div className="grid sm:grid-cols-2 gap-1 text-sm">
          {INSTRUMENTS.map(ins => {
            const rel = ins.sigma / p;
            return (
              <div key={ins.name}>
                {rel < 0.1 ? '✅' : rel < 1 ? '⚠️' : '❌'} {ins.name}: точност {formatAngle(ins.sigma)} →{' '}
                {rel < 1 ? `грешка в разстоянието ~${fmt(rel * 100, rel < 0.01 ? 2 : 0)}%` : 'не се измерва'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
