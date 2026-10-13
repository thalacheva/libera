import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const C = { x: 240, y: 135 };
const SCALE = 55; // пиксела на метър

type Ball = { attached: boolean; th: number; x: number; y: number; vx: number; vy: number };

const start = (): Ball => ({ attached: true, th: 0, x: 0, y: 0, vx: 0, vy: 0 });

/** Топче на връв върху гладка маса (поглед отгоре): скоростта е по допирателната, ускорението – към центъра. */
export default function CircularMotionLab() {
  const [r, setR] = useState(1.5);
  const [v, setV] = useState(3);
  const [m, setM] = useState(0.5);

  // Докато е вързано, топчето се върти с ω = v/r; след пускане се движи праволинейно и равномерно
  const step = (s: Ball, dt: number): Ball =>
    s.attached ? { ...s, th: s.th + (v / r) * dt } : Math.hypot(s.x, s.y) > 6 ? s : { ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt };
  const sim = useSimulation<Ball>(start, step);
  const b = sim.state;

  const omega = v / r;
  const a = (v * v) / r;
  const T = (2 * Math.PI) / omega;
  const F = m * a;

  // Положение и скорост в метри (y нагоре; въртим обратно на часовниковата стрелка)
  const pos = b.attached ? { x: r * Math.cos(b.th), y: r * Math.sin(b.th) } : { x: b.x, y: b.y };
  const vel = b.attached ? { x: -v * Math.sin(b.th), y: v * Math.cos(b.th) } : { x: b.vx, y: b.vy };
  const P = { x: C.x + pos.x * SCALE, y: C.y - pos.y * SCALE };
  const vLen = 9 * v;
  const aLen = Math.min(70, 12 * Math.sqrt(a));

  const release = () => {
    if (!b.attached) return;
    sim.reset({ attached: false, th: b.th, x: pos.x, y: pos.y, vx: vel.x, vy: vel.y });
    sim.play();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 270">
        <rect x={10} y={10} width={460} height={250} rx={12} className="fill-sky-50 dark:fill-sky-950/30" />
        <circle cx={C.x} cy={C.y} r={r * SCALE} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="5 5" />
        <circle cx={C.x} cy={C.y} r={5} className="fill-gray-600 dark:fill-gray-300" />
        {b.attached ? (
          <line x1={C.x} y1={C.y} x2={P.x} y2={P.y} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" />
        ) : (
          <line
            x1={C.x + r * Math.cos(b.th) * SCALE}
            y1={C.y - r * Math.sin(b.th) * SCALE}
            x2={C.x + (r * Math.cos(b.th) - 6 * Math.sin(b.th)) * SCALE}
            y2={C.y - (r * Math.sin(b.th) + 6 * Math.cos(b.th)) * SCALE}
            className="stroke-blue-400"
            strokeDasharray="4 4"
          />
        )}
        <Arrow from={P} to={{ x: P.x + (vel.x / v) * vLen, y: P.y - (vel.y / v) * vLen }} tone="blue" label="v" />
        {b.attached && <Arrow from={P} to={{ x: P.x - (pos.x / r) * aLen, y: P.y + (pos.y / r) * aLen }} tone="rose" label="a" />}
        <circle cx={P.x} cy={P.y} r={7 + 8 * m} className="fill-amber-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        <Label p={{ x: 24, y: 26 }} size={11} anchor="start">
          поглед отгоре, гладка маса
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <div className="flex justify-center mt-2">
        <button
          onClick={release}
          disabled={!b.attached}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition disabled:opacity-50"
        >
          ✂️ Пусни връвта
        </button>
      </div>
      <Sliders>
        <Slider label="r, m" value={r} onChange={setR} min={0.5} max={2} step={0.1} tone="gray" />
        <Slider label="v, m/s" value={v} onChange={setV} min={1} max={8} step={0.5} tone="blue" />
        <Slider label="m, kg" value={m} onChange={setM} min={0.1} max={1} step={0.1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'T =', value: `${fmtNum(T, 2)} s` },
            { label: 'ω =', value: `${fmtNum(omega, 2)} rad/s` },
            { label: 'a =', value: `${fmtNum(a, 1)} m/s²`, tone: 'rose' },
            { label: 'F =', value: `${fmtNum(F, 1)} N`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={b.attached ? 'gray' : 'blue'}>
        {b.attached
          ? 'Връвта дърпа топчето към центъра – това е центростремителната сила F = mv²/r.'
          : 'Без връвта няма сила – топчето продължава по допирателната с постоянна скорост, а не „навън“ по радиуса.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Синята стрелка е скоростта (винаги по допирателната), червената – ускорението (винаги към центъра). Удвои скоростта: силата става 4
        пъти по-голяма. Удвои радиуса при същата скорост: силата намалява наполовина. Дължините на стрелките не са в мащаб.
      </p>
    </div>
  );
}
