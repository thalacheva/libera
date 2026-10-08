import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const VIEW_X = 210;
const VIEW_Y = 150;
const SPACING = 30;
const N = 7; // мрежа N × N

function rnd(n: number) {
  const x = Math.sin(n * 41.33 + 5.51) * 43758.5453;
  return x - Math.floor(x);
}

const GALAXIES = Array.from({ length: N * N }, (_, k) => {
  const i = k % N;
  const j = Math.floor(k / N);
  return { id: k, x: (i - (N - 1) / 2 + (rnd(k) - 0.5) * 0.5) * SPACING, y: (j - (N - 1) / 2 + (rnd(k + 99) - 0.5) * 0.5) * SPACING, hue: rnd(k + 200) };
});

export default function ExpansionGridLab() {
  const [a, setA] = useState(1);
  const [home, setHome] = useState(24);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt =>
    setA(v => {
      const next = v * (1 + dt * 0.25);
      return next > 2.2 ? 1 : next;
    })
  );

  const h = GALAXIES[home];
  // Наблюдателят е в центъра на картината: всички положения са спрямо „дома“
  const pos = (g: (typeof GALAXIES)[number], scale: number) => ({ x: VIEW_X + (g.x - h.x) * scale, y: VIEW_Y + (g.y - h.y) * scale });

  // Графика v–d за избрания наблюдател
  const GX0 = 430;
  const GX1 = 620;
  const GY0 = 40;
  const GY1 = 240;
  const dMax = 260;
  const pts = GALAXIES.filter(g => g.id !== home).map(g => {
    const d = Math.hypot(g.x - h.x, g.y - h.y);
    return { d, v: d }; // скоростта е пропорционална на разстоянието (H = const)
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Къде е центърът на разширяването?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Галактиките са като стафиди в тесто, което втасва. Щракнете върху произволна галактика, за да „живеете“ на нея: от всяка
        галактика всички останали се отдалечават – и толкова по-бързо, колкото са по-далеч.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="eg-view">
            <rect x={10} y={10} width={400} height={280} rx="8" />
          </clipPath>
          <marker id="eg-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fca5a5" />
          </marker>
        </defs>
        <rect x={10} y={10} width={400} height={280} rx="8" fill="#020617" />
        <g clipPath="url(#eg-view)">
          {GALAXIES.map(g => {
            const p0 = pos(g, 1);
            const p = pos(g, a);
            const isHome = g.id === home;
            return (
              <g key={g.id} className="cursor-pointer" onClick={() => setHome(g.id)}>
                {!isHome && a > 1.02 && <line x1={p0.x} y1={p0.y} x2={p.x} y2={p.y} stroke="#fca5a5" strokeOpacity="0.6" markerEnd="url(#eg-arrow)" />}
                {!isHome && <circle cx={p0.x} cy={p0.y} r="1.5" fill="white" fillOpacity="0.2" />}
                <ellipse cx={p.x} cy={p.y} rx={isHome ? 7 : 5} ry={isHome ? 4 : 3} fill={isHome ? '#fde68a' : g.hue < 0.5 ? '#93c5fd' : '#fdba74'} transform={`rotate(${g.hue * 180} ${p.x} ${p.y})`} />
              </g>
            );
          })}
        </g>
        <text x={VIEW_X} y={VIEW_Y + 20} fontSize="9" textAnchor="middle" fill="#fde68a">
          вие сте тук
        </text>

        {/* v–d */}
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        {pts.map((p, i) => (
          <circle key={i} cx={GX0 + (p.d / dMax) * (GX1 - GX0)} cy={GY1 - (p.v / dMax) * (GY1 - GY0)} r="2.5" fill="#fca5a5" />
        ))}
        <text x={GX0} y={GY0 - 8} fontSize="10" fill="white" fillOpacity="0.7">
          скорост ↑ спрямо вас
        </text>
        <text x={GX1} y={GY1 + 14} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.7">
          разстояние →
        </text>
        <text x={GX0} y={GY1 + 34} fontSize="10" fill="#4ade80">
          v ∝ d от всяка галактика
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-orange-600 text-white text-sm hover:bg-orange-700">
          {playing ? '⏸ Пауза' : '▶ Разширявай'}
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">мащабен фактор a = {fmt(a, 2)}</span>
      </div>
      <input type="range" min="1" max="2.2" step="0.01" value={a} onChange={e => setA(Number(e.target.value))} className="w-full mt-2" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Когато всички разстояния нарастват с един и същ множител a, галактика на двойно разстояние се отдалечава с двойна скорост.
        Това е точно законът на Хъбъл. Всеки наблюдател вижда същото – затова Вселената няма център. Галактиките не летят през
        пространството: разтяга се самото пространство между тях, а те стоят на „местата“ си.
      </p>
    </div>
  );
}
