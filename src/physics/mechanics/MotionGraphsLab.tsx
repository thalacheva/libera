import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { type Tone, tones } from '~/geometry/diagramMath';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const T_END = 6;
const X_MAX = 100;

type Car = { t: number; x: number; v: number };

const PRESETS = [
  { name: 'равномерно', v0: 6, a: 0 },
  { name: 'потегляне', v0: 0, a: 2 },
  { name: 'спиране', v0: 8, a: -2 },
  { name: 'обръщане', v0: 6, a: -2 },
];

// Графиките: ляв край, десен край и височина на всяка
const G = { left: 52, right: 462, h: 78 };
const gx = (t: number) => G.left + (t / T_END) * (G.right - G.left);
// Пистата: от −100 до 100 m
const tx = (x: number) => 30 + ((x + X_MAX) / (2 * X_MAX)) * 420;

/** Една графика на величина от времето: f(t) в диапазона ±range, проследена до момента tNow. */
function Graph({ top, range, f, tNow, tone, name, unit }: { top: number; range: number; f: (t: number) => number; tNow: number; tone: Tone; name: string; unit: string }) {
  const mid = top + G.h / 2;
  const gy = (v: number) => mid - (Math.max(-range, Math.min(range, v)) / range) * (G.h / 2);
  const path = (to: number) =>
    Array.from({ length: 121 }, (_, i) => (i / 120) * to)
      .map((t, i) => `${i ? 'L' : 'M'} ${gx(t).toFixed(1)} ${gy(f(t)).toFixed(1)}`)
      .join(' ');
  return (
    <g>
      <rect x={G.left} y={top} width={G.right - G.left} height={G.h} className="fill-gray-50 dark:fill-gray-900/40" />
      {[1, 2, 3, 4, 5].map(t => (
        <line key={t} x1={gx(t)} y1={top} x2={gx(t)} y2={top + G.h} className="stroke-gray-100 dark:stroke-gray-700/50" />
      ))}
      <line x1={G.left} y1={mid} x2={G.right} y2={mid} className="stroke-gray-400 dark:stroke-gray-500" />
      <Label p={{ x: G.left - 6, y: top + 8 }} size={10} anchor="end">
        {fmtNum(range)}
      </Label>
      <Label p={{ x: G.left - 6, y: top + G.h - 8 }} size={10} anchor="end">
        {fmtNum(-range)}
      </Label>
      <Label p={{ x: G.left - 6, y: mid }} size={13} anchor="end" tone={tone}>
        {name}
      </Label>
      <Label p={{ x: G.left + 6, y: top + 10 }} size={10} anchor="start">
        {unit}
      </Label>
      <path d={path(T_END)} fill="none" className={tones[tone].stroke} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.5} />
      {tNow > 0 && <path d={path(tNow)} fill="none" className={tones[tone].stroke} strokeWidth="3" />}
      <circle cx={gx(tNow)} cy={gy(f(tNow))} r={5} className={tones[tone].fill} />
    </g>
  );
}

/** Кола по права: положението, скоростта и ускорението се рисуват едновременно като графики от времето. */
export default function MotionGraphsLab() {
  const [x0, setX0] = useState(-40);
  const [v0, setV0] = useState(6);
  const [a, setA] = useState(-2);

  // При постоянно ускорение тази стъпка е точна
  const step = (s: Car, dt: number): Car => (s.t >= T_END ? s : { t: s.t + dt, x: s.x + s.v * dt + (a * dt * dt) / 2, v: s.v + a * dt });
  const sim = useSimulation<Car>(() => ({ t: 0, x: x0, v: v0 }), step, { dt: 1 / 200 });
  const { t, x, v } = sim.state;

  const restart = (nx = x0, nv = v0) => sim.reset({ t: 0, x: nx, v: nv });
  const change = (set: (n: number) => void, which: 'x' | 'v' | 'a') => (n: number) => {
    set(n);
    if (which === 'x') restart(n, v0);
    else if (which === 'v') restart(x0, n);
    else restart();
  };
  const preset = (p: (typeof PRESETS)[number]) => {
    setV0(p.v0);
    setA(p.a);
    setX0(-40);
    sim.reset({ t: 0, x: -40, v: p.v0 });
  };

  const X = (s: number) => x0 + v0 * s + (a * s * s) / 2;
  // Мащаб на графиката x(t) – най-малкият от 20, 50 и 100 m, в който се побира движението
  const xMax = Math.max(...Array.from({ length: 61 }, (_, i) => Math.abs(X(i / 10))));
  const xRange = [20, 50].find(r => xMax <= r) ?? X_MAX;
  const turn = a !== 0 && -v0 / a > 0 && -v0 / a < T_END ? -v0 / a : null;
  const carX = tx(Math.max(-X_MAX - 10, Math.min(X_MAX + 10, x)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={p.v0 === v0 && p.a === a} onClick={() => preset(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 400">
        {/* Пистата */}
        <line x1={tx(-X_MAX)} y1={62} x2={tx(X_MAX)} y2={62} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />
        {[-100, -50, 0, 50, 100].map(m => (
          <g key={m}>
            <line x1={tx(m)} y1={58} x2={tx(m)} y2={66} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: tx(m), y: 78 }} size={10} weight={500}>
              {fmtNum(m)}
            </Label>
          </g>
        ))}
        <Label p={{ x: tx(X_MAX), y: 92 }} size={10} anchor="end">
          x, m
        </Label>
        {/* Емоджито на колата гледа наляво – обръщаме го при движение надясно */}
        <text x={carX} y={44} fontSize={26} textAnchor="middle" dominantBaseline="central" transform={v >= 0 ? `translate(${2 * carX} 0) scale(-1 1)` : undefined}>
          🚗
        </text>
        <Arrow from={{ x: carX, y: 18 }} to={{ x: carX + v * 6, y: 18 }} tone="blue" label={Math.abs(v) > 1.5 ? 'v' : undefined} />
        {a !== 0 && <Arrow from={{ x: carX, y: 8 }} to={{ x: carX + a * 14, y: 8 }} tone="rose" width={2} />}

        <Graph top={108} range={xRange} f={X} tNow={t} tone="violet" name="x" unit="m" />
        <Graph top={204} range={10} f={s => v0 + a * s} tNow={t} tone="blue" name="v" unit="m/s" />
        <Graph top={300} range={3} f={() => a} tNow={t} tone="rose" name="a" unit="m/s²" />
        {[0, 1, 2, 3, 4, 5].map(s => (
          <Label key={s} p={{ x: gx(s), y: 390 }} size={10} weight={500}>
            {String(s)}
          </Label>
        ))}
        <Label p={{ x: G.right, y: 390 }} size={10} anchor="end">
          t, s
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => restart()} time={t} />
      <Sliders>
        <Slider label="x₀" value={x0} onChange={change(setX0, 'x')} min={-80} max={80} step={10} tone="violet" />
        <Slider label="v₀" value={v0} onChange={change(setV0, 'v')} min={-8} max={8} step={1} tone="blue" />
        <Slider label="a" value={a} onChange={change(setA, 'a')} min={-3} max={3} step={0.5} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'x =', value: `${fmtNum(x, 1)} m`, tone: 'violet' },
            { label: 'v =', value: `${fmtNum(v, 1)} m/s`, tone: 'blue' },
            { label: 'a =', value: `${fmtNum(a, 1)} m/s²`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        {turn !== null
          ? `При t = ${fmtNum(turn, 2)} s скоростта е 0 – колата спира за миг и тръгва обратно. Там графиката на x има връх.`
          : a === 0
            ? 'Без ускорение графиката на x е права линия, а на v – хоризонтална.'
            : 'Наклонът на x(t) е скоростта, а наклонът на v(t) – ускорението.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пунктирът показва цялото движение, а плътната линия – изминалото до момента. Синята стрелка е скоростта, червената – ускорението:
        когато сочат в различни посоки, колата се забавя.
      </p>
    </div>
  );
}
