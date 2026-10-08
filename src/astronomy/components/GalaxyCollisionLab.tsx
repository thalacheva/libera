import { useRef, useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 360;
const SCALE = 20; // px за единица дължина (10 kpc)
const EPS2 = 0.04; // омекотяване на силата
const DT = 0.01;
const MYR_PER_UNIT = 47; // 1 единица време ≈ 47 млн. години (при 10 kpc и 10¹¹ M☉)
const R0 = 8; // начално разстояние между галактиките (80 kpc)

type Body = { x: number; y: number; vx: number; vy: number; m: number };
type Star = { x: number; y: number; vx: number; vy: number; host: 0 | 1 };
type Sim = { gal: [Body, Body]; stars: Star[]; t: number };

/** Начални условия: параболична среща с перицентър rp; spin = ±1 – посока на въртене на дисковете. */
function makeSim(q: number, rp: number, spin1: number, spin2: number): Sim {
  const M = 1 + q;
  const p = 2 * rp;
  const nu = -Math.acos(p / R0 - 1); // приближаваме се
  const r = p / (1 + Math.cos(nu));
  const h = Math.sqrt(M / p);
  const rel = { x: r * Math.cos(nu), y: r * Math.sin(nu), vx: -h * Math.sin(nu), vy: h * (1 + Math.cos(nu)) };
  const f1 = q / M;
  const f2 = 1 / M;
  const gal: [Body, Body] = [
    { x: -f1 * rel.x, y: -f1 * rel.y, vx: -f1 * rel.vx, vy: -f1 * rel.vy, m: 1 },
    { x: f2 * rel.x, y: f2 * rel.y, vx: f2 * rel.vx, vy: f2 * rel.vy, m: q },
  ];
  const stars: Star[] = [];
  const addDisk = (host: 0 | 1, spin: number, rings: number[], perRing: number) => {
    const g = gal[host];
    rings.forEach((rr, ri) => {
      const n = Math.round(perRing * (rr / rings[rings.length - 1]) + 8);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * 2 * Math.PI + ri * 0.4;
        const v = Math.sqrt((g.m * rr * rr) / (rr * rr + EPS2) ** 1.5);
        stars.push({
          x: g.x + rr * Math.cos(a),
          y: g.y + rr * Math.sin(a),
          vx: g.vx - spin * v * Math.sin(a),
          vy: g.vy + spin * v * Math.cos(a),
          host,
        });
      }
    });
  };
  addDisk(0, spin1, [0.6, 1.0, 1.4, 1.8, 2.2, 2.6], 46);
  addDisk(1, spin2, [0.6, 1.0, 1.4, 1.8].map(x => x * Math.sqrt(q)), 34);
  return { gal, stars, t: 0 };
}

function accel(x: number, y: number, gal: [Body, Body], skip = -1) {
  let ax = 0;
  let ay = 0;
  gal.forEach((g, i) => {
    if (i === skip) return;
    const dx = g.x - x;
    const dy = g.y - y;
    const r2 = dx * dx + dy * dy + EPS2;
    const f = g.m / (r2 * Math.sqrt(r2));
    ax += f * dx;
    ay += f * dy;
  });
  return { ax, ay };
}

/** Една стъпка „скок-жаба“ (leapfrog). */
function step(sim: Sim) {
  const kick = (dt: number) => {
    const acc = sim.gal.map((g, i) => accel(g.x, g.y, sim.gal, i));
    sim.gal.forEach((g, i) => {
      g.vx += acc[i].ax * dt;
      g.vy += acc[i].ay * dt;
    });
    for (const s of sim.stars) {
      const a = accel(s.x, s.y, sim.gal);
      s.vx += a.ax * dt;
      s.vy += a.ay * dt;
    }
  };
  kick(DT / 2);
  for (const g of sim.gal) {
    g.x += g.vx * DT;
    g.y += g.vy * DT;
  }
  for (const s of sim.stars) {
    s.x += s.vx * DT;
    s.y += s.vy * DT;
  }
  kick(DT / 2);
  sim.t += DT;
}

const PRESETS = [
  { name: 'Еднакви, в посоката на орбитата', q: 1, rp: 2.5, spin1: 1, spin2: 1, text: 'Когато дисковете се въртят в същата посока, в която галактиките минават една покрай друга, звездите от външните им части дълго „яздят“ заедно с приливната сила и се изтеглят в дълги опашки и мост между галактиките – като в Антените (NGC 4038/4039).' },
  { name: 'Обратно въртене', q: 1, rp: 2.5, spin1: -1, spin2: -1, text: 'При обратно въртене звездите минават бързо покрай приливната сила и тя не успява да ги изтегли. Дисковете остават почти непокътнати. Това откриват Алар и Юри Тоомре през 1972 г. с една от първите компютърни симулации.' },
  { name: 'Голяма и малка (M51)', q: 0.3, rp: 3, spin1: 1, spin2: 1, text: 'Малка галактика минава край голяма спирална и ѝ „нарисува“ ярки спирални ръкави – така вероятно е станало с Водовъртежа (M51) и спътника ѝ NGC 5195.' },
  { name: 'Близка среща', q: 1, rp: 1.2, spin1: 1, spin2: -1, text: 'При близка среща дисковете се разкъсват силно. В симулацията ядрата са точки и не губят енергия, затова се разминават. В истинските галактики масивните тъмни ореоли се „триват“ един в друг (динамично триене) и след няколко обиколки галактиките се сливат – така от спирални се раждат елиптични.' },
];

export default function GalaxyCollisionLab() {
  const [pi, setPi] = useState(0);
  const preset = PRESETS[pi];
  const simRef = useRef<Sim>(makeSim(preset.q, preset.rp, preset.spin1, preset.spin2));
  const [, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => {
    const steps = Math.min(12, Math.round(dt * 400));
    for (let i = 0; i < steps; i++) step(simRef.current);
    setTick(v => v + 1);
    if (simRef.current.t > 30) setPlaying(false);
  });

  const reset = (i: number) => {
    const p = PRESETS[i];
    simRef.current = makeSim(p.q, p.rp, p.spin1, p.spin2);
    setPi(i);
    setPlaying(false);
    setTick(v => v + 1);
  };

  const sim = simRef.current;
  const toX = (x: number) => W / 2 + x * SCALE;
  const toY = (y: number) => H / 2 - y * SCALE;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Сблъсък на галактики</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Две галактики минават една покрай друга. Всяка точка е звезда, която усеща привличането на двете ядра. Звездите почти никога не
        се удрят – разстоянията между тях са огромни, – но гравитацията пренарежда цели галактики.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {sim.stars.map((s, i) => {
          const x = toX(s.x);
          const y = toY(s.y);
          if (x < -5 || x > W + 5 || y < -5 || y > H + 5) return null;
          return <circle key={i} cx={x} cy={y} r="1.4" fill={s.host === 0 ? '#93c5fd' : '#fdba74'} fillOpacity="0.85" />;
        })}
        {sim.gal.map((g, i) => (
          <circle key={i} cx={toX(g.x)} cy={toY(g.y)} r={i === 0 ? 5 : 3 + 2 * Math.sqrt(g.m)} fill="#fef9c3" />
        ))}
        <text x={12} y={20} fontSize="11" fill="white">
          t = {fmt(sim.t * MYR_PER_UNIT, 0)} млн. години
        </text>
        <text x={W - 12} y={20} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.55">
          10 kpc = {SCALE} px
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button
          onClick={() => {
            if (simRef.current.t > 30) reset(pi);
            setPlaying(v => !v);
          }}
          className="px-4 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700"
        >
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button onClick={() => reset(pi)} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          ↺ Отначало
        </button>
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => reset(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === pi ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{preset.text}</p>
    </div>
  );
}
