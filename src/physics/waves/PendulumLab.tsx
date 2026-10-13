import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const PLANETS = [
  { name: 'Земята', g: 9.81 },
  { name: 'Луната', g: 1.62 },
  { name: 'Марс', g: 3.71 },
];

type Swing = { th: number; om: number };

/** Една стъпка по метода на Рунге–Кута за θ″ = −(g/l)·sin θ – точно уравнение, без приближението за малки ъгли. */
function rk4(s: Swing, dt: number, q: number): Swing {
  const f = (th: number, om: number) => [om, -q * Math.sin(th)];
  const [a1, b1] = f(s.th, s.om);
  const [a2, b2] = f(s.th + (dt / 2) * a1, s.om + (dt / 2) * b1);
  const [a3, b3] = f(s.th + (dt / 2) * a2, s.om + (dt / 2) * b2);
  const [a4, b4] = f(s.th + dt * a3, s.om + dt * b3);
  return { th: s.th + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4), om: s.om + (dt / 6) * (b1 + 2 * b2 + 2 * b3 + b4) };
}

/** Точен период: T = 4√(l/g)·K(sin(θ₀/2)); пълният елиптичен интеграл K се смята със средно аритметично-геометрично. */
function exactPeriod(l: number, g: number, th0: number) {
  let a = 1;
  let b = Math.cos(th0 / 2);
  for (let i = 0; i < 20; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return (2 * Math.PI * Math.sqrt(l / g)) / a;
}

const PIVOT = { x: 160, y: 122 };
const G = { left: 316, right: 470, top: 30, h: 180 };

/** Математическо махало: периодът зависи от l и g, а при големи ъгли – и от амплитудата. */
export default function PendulumLab() {
  const [l, setL] = useState(1);
  const [deg, setDeg] = useState(20);
  const [p, setP] = useState(0);
  const g = PLANETS[p].g;
  const th0 = (deg * Math.PI) / 180;
  const q = g / l;
  const T0 = 2 * Math.PI * Math.sqrt(l / g);
  const T = exactPeriod(l, g, th0);

  const sim = useSimulation<Swing>(() => ({ th: th0, om: 0 }), (s, dt) => rk4(s, dt, q), { dt: 1 / 500 });
  const restart = () => sim.reset({ th: th0, om: 0 });
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    sim.reset({ th: (set === setDeg ? n : deg) * (Math.PI / 180), om: 0 });
  };

  // Графиката θ(t) за два истински периода – със същия метод, предварително
  const span = 2 * T;
  const path = useMemo(() => {
    const pts: string[] = [];
    let s: Swing = { th: th0, om: 0 };
    const n = 400;
    const dt = span / n / 10;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * span;
      const x = G.left + (tt / span) * (G.right - G.left);
      const y = G.top + G.h / 2 - (s.th / th0) * (G.h / 2 - 6);
      pts.push(`${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      for (let j = 0; j < 10; j++) s = rk4(s, dt, q);
    }
    return pts.join(' ');
  }, [th0, q, span]);
  // Приближението за малки ъгли: θ₀·cos(2πt/T₀)
  const approx = Array.from({ length: 201 }, (_, i) => {
    const tt = (i / 200) * span;
    const x = G.left + (tt / span) * (G.right - G.left);
    const y = G.top + G.h / 2 - Math.cos((2 * Math.PI * tt) / T0) * (G.h / 2 - 6);
    return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const R = 52 * l;
  const bob = { x: PIVOT.x + R * Math.sin(sim.state.th), y: PIVOT.y + R * Math.cos(sim.state.th) };
  const tw = sim.time % span;
  const err = (T / T0 - 1) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PLANETS.map((pl, i) => (
          <DiagramButton
            key={pl.name}
            active={i === p}
            onClick={() => {
              setP(i);
              restart();
            }}
          >
            {pl.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 240">
        <line x1={PIVOT.x - 40} y1={PIVOT.y} x2={PIVOT.x + 40} y2={PIVOT.y} className="stroke-gray-500" strokeWidth="4" />
        <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y + R + 14} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <line x1={PIVOT.x} y1={PIVOT.y} x2={bob.x} y2={bob.y} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" />
        <circle cx={bob.x} cy={bob.y} r={11} className="fill-blue-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />

        {/* θ(t): точно решение и приближение за малки ъгли */}
        <rect x={G.left} y={G.top} width={G.right - G.left} height={G.h} className="fill-gray-50 dark:fill-gray-900/40" />
        <line x1={G.left} y1={G.top + G.h / 2} x2={G.right} y2={G.top + G.h / 2} className="stroke-gray-400 dark:stroke-gray-500" />
        <path d={approx} fill="none" className="stroke-amber-500" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={path} fill="none" className="stroke-blue-500" strokeWidth="2.5" />
        <line x1={G.left + (tw / span) * (G.right - G.left)} y1={G.top} x2={G.left + (tw / span) * (G.right - G.left)} y2={G.top + G.h} className="stroke-gray-400" />
        <Label p={{ x: G.left + 4, y: G.top - 12 }} size={11} anchor="start" tone="blue">
          θ(t) – точно
        </Label>
        <Label p={{ x: G.right, y: G.top + G.h + 14 }} size={11} anchor="end" tone="amber">
          малки ъгли
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={sim.time} />
      <Sliders>
        <Slider label="l, m" value={l} onChange={change(setL)} min={0.25} max={2} step={0.05} tone="blue" />
        <Slider label="θ₀, °" value={deg} onChange={change(setDeg)} min={5} max={150} step={5} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: '2π√(l/g) =', value: `${fmtNum(T0, 3)} s`, tone: 'amber' },
            { label: 'истински T =', value: `${fmtNum(T, 3)} s`, tone: 'blue' },
            { label: 'разлика', value: `${fmtNum(err, 1)}%` },
          ]}
        />
      </div>
      <Note tone={err < 1 ? 'emerald' : 'rose'}>
        {err < 1
          ? 'При малки ъгли формулата T = 2π√(l/g) е много точна.'
          : `При ${deg}° истинският период е с ${fmtNum(err, 1)}% по-дълъг – формулата за малки ъгли вече греши.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Махалото е пресметнато с пълното уравнение θ″ = −(g/l)·sin θ, без приближението sin θ ≈ θ. Синята крива е истинското движение,
        оранжевият пунктир – законът за малки ъгли. Пробвай 90° и 150°, а после Луната: там същото махало трепти около 2,5 пъти по-бавно.
      </p>
    </div>
  );
}
