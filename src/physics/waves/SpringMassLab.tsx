import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const PX = 400; // пиксела на метър
const EQ = 240; // равновесното положение
const TRACK = 200; // линията на масата
const CIRCLE = { x: EQ, y: 95 };
const WINDOW = 8; // секунди на графиката
const G = { left: 40, right: 466, top: 236, h: 90 };

/** Зигзаг на пружина от x1 до x2 на височина y. */
function springPath(x1: number, x2: number, y: number) {
  const n = 14;
  const lead = 10;
  const step = (x2 - x1 - 2 * lead) / n;
  let d = `M ${x1} ${y} L ${x1 + lead} ${y}`;
  for (let i = 0; i < n; i++) d += ` L ${x1 + lead + (i + 0.5) * step} ${y + (i % 2 ? 9 : -9)}`;
  return `${d} L ${x2 - lead} ${y} L ${x2} ${y}`;
}

/** Тяло на пружина: x = A·cos ωt, графика x(t), енергии и връзка с движението по окръжност. */
export default function SpringMassLab() {
  const [m, setM] = useState(0.5);
  const [k, setK] = useState(20);
  const [A, setA] = useState(0.15);
  const [circle, setCircle] = useState(true);
  const w = Math.sqrt(k / m);
  const T = (2 * Math.PI) / w;

  // Движението е известно точно, затова симулацията пази само времето
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 240 });
  const t = sim.state.t;
  const x = A * Math.cos(w * t);
  const v = -A * w * Math.sin(w * t);
  const Ek = (m * v * v) / 2;
  const Ep = (k * x * x) / 2;
  const E = (k * A * A) / 2;
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    sim.reset();
  };

  const bx = EQ + x * PX;
  const phase = w * t;
  const dot = { x: CIRCLE.x + A * PX * Math.cos(phase), y: CIRCLE.y - A * PX * Math.sin(phase) };

  const gx = (s: number) => G.left + (s / WINDOW) * (G.right - G.left);
  const gy = (u: number) => G.top + G.h / 2 - (u / 0.2) * (G.h / 2);
  const tw = t % WINDOW;
  const curve = (to: number) =>
    Array.from({ length: 401 }, (_, i) => (i / 400) * to)
      .map((s, i) => `${i ? 'L' : 'M'} ${gx(s).toFixed(1)} ${gy(A * Math.cos(w * (t - tw + s))).toFixed(1)}`)
      .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={circle} onClick={() => setCircle(true)}>
          с окръжност
        </DiagramButton>
        <DiagramButton active={!circle} onClick={() => setCircle(false)}>
          само пружина
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 336">
        {circle && (
          <g>
            <circle cx={CIRCLE.x} cy={CIRCLE.y} r={A * PX} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
            <line x1={CIRCLE.x} y1={CIRCLE.y} x2={dot.x} y2={dot.y} className="stroke-gray-400" />
            <line x1={dot.x} y1={dot.y} x2={dot.x} y2={TRACK - 16} className="stroke-violet-400" strokeDasharray="3 3" />
            <circle cx={dot.x} cy={dot.y} r={6} className="fill-violet-500" />
            <Label p={{ x: CIRCLE.x + A * PX + 6, y: CIRCLE.y - 10 }} size={11} anchor="start" tone="violet">
              ωt
            </Label>
          </g>
        )}
        {/* Енергии */}
        {[
          ['Eₖ', Ek, 'fill-blue-500'],
          ['Eₚ', Ep, 'fill-amber-500'],
        ].map(([name, val, cls], i) => (
          <g key={name as string}>
            <rect x={400 + i * 34} y={30} width={22} height={110} className="fill-gray-100 dark:fill-gray-700" />
            <rect x={400 + i * 34} y={140 - ((val as number) / E) * 110} width={22} height={((val as number) / E) * 110} className={cls as string} />
            <Label p={{ x: 411 + i * 34, y: 154 }} size={12}>
              {name as string}
            </Label>
          </g>
        ))}

        {/* Пружината и тялото */}
        <rect x={20} y={TRACK - 34} width={10} height={50} className="fill-gray-400 dark:fill-gray-500" />
        <line x1={30} y1={TRACK + 16} x2={470} y2={TRACK + 16} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <path d={springPath(30, bx - 20, TRACK)} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />
        <rect x={bx - 20} y={TRACK - 16} width={40} height={32} rx={4} className="fill-sky-400 stroke-sky-700" strokeWidth="1.5" />
        <line x1={EQ} y1={TRACK + 12} x2={EQ} y2={TRACK + 22} className="stroke-gray-500" strokeWidth="2" />
        <Label p={{ x: EQ, y: TRACK + 30 }} size={10}>
          0
        </Label>

        {/* Графика x(t) */}
        <line x1={G.left} y1={G.top + G.h / 2} x2={G.right} y2={G.top + G.h / 2} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={G.left} y1={G.top} x2={G.left} y2={G.top + G.h} className="stroke-gray-400 dark:stroke-gray-500" />
        <Label p={{ x: G.left - 6, y: G.top + 6 }} size={10} anchor="end">
          x
        </Label>
        <Label p={{ x: G.right, y: G.top + G.h / 2 + 12 }} size={10} anchor="end">
          t
        </Label>
        <path d={curve(WINDOW)} fill="none" className="stroke-sky-500" strokeWidth="1.5" strokeDasharray="4 4" opacity={0.5} />
        {tw > 0 && <path d={curve(tw)} fill="none" className="stroke-sky-600" strokeWidth="2.5" />}
        <circle cx={gx(tw)} cy={gy(x)} r={4} className="fill-sky-600" />
        {T <= WINDOW && (
          <g>
            <line x1={gx(0)} y1={G.top + 4} x2={gx(T)} y2={G.top + 4} className="stroke-rose-500" strokeWidth="2" />
            <Label p={{ x: gx(T / 2), y: G.top - 6 }} size={11} tone="rose">
              T
            </Label>
          </g>
        )}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} time={t} />
      <Sliders>
        <Slider label="m, kg" value={m} onChange={change(setM)} min={0.2} max={2} step={0.1} tone="blue" />
        <Slider label="k, N/m" value={k} onChange={change(setK)} min={5} max={50} step={1} tone="amber" />
        <Slider label="A, cm" value={A * 100} onChange={change(n => setA(n / 100))} min={5} max={20} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'T =', value: `${fmtNum(T, 2)} s`, tone: 'rose' },
            { label: 'f =', value: `${fmtNum(1 / T, 2)} Hz` },
            { label: 'vₘₐₓ = Aω =', value: `${fmtNum(A * w, 2)} m/s`, tone: 'blue' },
            { label: 'E =', value: `${fmtNum(E, 3)} J`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">Амплитудата не влияе на периода – промени A и виж, че T остава същият.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Тялото се движи като сянката (проекцията) на точка, която обикаля окръжност с ъглова скорост ω. Затова x = A·cos ωt. В крайните
        положения цялата енергия е в пружината, а в средата – в движението; сборът им не се мени.
      </p>
    </div>
  );
}
