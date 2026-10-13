import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
// Съпротивление ∝ v²: k = ρ·C·S / (2m) – приблизително като за футболна топка
const K_DRAG = 0.013;
const SAMPLE = 0.01;

type Pt = { x: number; y: number; vx: number; vy: number };

/** Полет със съпротивление на въздуха – числено, с малка стъпка; точка на всеки SAMPLE секунди. */
function dragPath(v0: number, alpha: number, h0: number) {
  const pts: Pt[] = [];
  let [x, y, vx, vy] = [0, h0, v0 * Math.cos(alpha), v0 * Math.sin(alpha)];
  const dt = SAMPLE / 10;
  for (let i = 0; i < 200000; i++) {
    if (i % 10 === 0) pts.push({ x, y, vx, vy });
    if (y < 0 && i > 0) break;
    const v = Math.hypot(vx, vy);
    vx += -K_DRAG * v * vx * dt;
    vy += (-G - K_DRAG * v * vy) * dt;
    x += vx * dt;
    y += vy * dt;
  }
  return pts;
}

const L = 40;
const R = 470;
const BOTTOM = 232;
const TOP = 14;

/** Хвърляне под ъгъл: траектория, стробоскопски точки и компонентите на скоростта. */
export default function ProjectileLab() {
  const [v0, setV0] = useState(20);
  const [deg, setDeg] = useState(45);
  const [h0, setH0] = useState(0);
  const [air, setAir] = useState(false);
  const alpha = (deg * Math.PI) / 180;
  const [vx0, vy0] = [v0 * Math.cos(alpha), v0 * Math.sin(alpha)];

  // Без въздух: време на полета от h0 до земята, максимална височина и обхват
  const T = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
  const H = h0 + (vy0 * vy0) / (2 * G);
  const range = vx0 * T;
  const vac = (t: number): Pt => ({ x: vx0 * t, y: h0 + vy0 * t - (G * t * t) / 2, vx: vx0, vy: vy0 - G * t });

  const drag = useMemo(() => (air ? dragPath(v0, alpha, h0) : []), [air, v0, alpha, h0]);
  const tAir = drag.length ? (drag.length - 1) * SAMPLE : T;
  const at = (t: number): Pt => (air ? drag[Math.min(drag.length - 1, Math.round(t / SAMPLE))] : vac(t));
  const tEnd = air ? tAir : T;

  const step = (s: { t: number }, dt: number) => ({ t: Math.min(s.t + dt, tEnd) });
  const sim = useSimulation(() => ({ t: 0 }), step, { dt: 1 / 240 });
  const t = Math.min(sim.state.t, tEnd);

  // Общ мащаб по двете оси, за да не се изкривява параболата
  const xMax = Math.max(range, 10) * 1.06;
  const yMax = Math.max(H, 5) * 1.12;
  const k = Math.min((R - L) / xMax, (BOTTOM - TOP) / yMax);
  const sx = (x: number) => L + x * k;
  const sy = (y: number) => BOTTOM - y * k;
  const tickStep = [2, 5, 10, 20, 50].find(s => xMax / s <= 8) ?? 100;

  const curve = (f: (t: number) => Pt, tMax: number) =>
    Array.from({ length: 121 }, (_, i) => f((i / 120) * tMax))
      .map((p, i) => `${i ? 'L' : 'M'} ${sx(p.x).toFixed(1)} ${sy(Math.max(p.y, -1)).toFixed(1)}`)
      .join(' ');

  // Стробоскоп: точки през равни интервали – хоризонтално равни разстояния
  const dtStrobe = [0.1, 0.2, 0.25, 0.5, 1].find(d => tEnd / d <= 18) ?? 2;
  const strobe = Array.from({ length: Math.floor(tEnd / dtStrobe) + 1 }, (_, i) => at(i * dtStrobe));

  const p = at(t);
  const ball = { x: sx(p.x), y: sy(Math.max(p.y, 0)) };
  const arrowK = 2.2;
  const restart = () => sim.reset({ t: 0 });
  const set = (f: (n: number) => void) => (n: number) => {
    f(n);
    restart();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!air} onClick={() => {
            setAir(false);
            restart();
          }}>
          без въздух
        </DiagramButton>
        <DiagramButton active={air} onClick={() => {
            setAir(true);
            restart();
          }}>
          със съпротивление на въздуха
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 260">
        {Array.from({ length: Math.floor(xMax / tickStep) + 1 }, (_, i) => i * tickStep).map(x => (
          <g key={x}>
            <line x1={sx(x)} y1={BOTTOM} x2={sx(x)} y2={BOTTOM + 5} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: sx(x), y: BOTTOM + 15 }} size={10} weight={500}>
              {String(x)}
            </Label>
          </g>
        ))}
        <line x1={L} y1={BOTTOM} x2={R} y2={BOTTOM} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <Label p={{ x: R, y: BOTTOM + 24 }} size={10} anchor="end">
          x, m
        </Label>
        {h0 > 0 && <rect x={L - 14} y={sy(h0)} width={14} height={BOTTOM - sy(h0)} className="fill-gray-300 dark:fill-gray-600" />}
        {h0 > 0 && (
          <Label p={{ x: L - 18, y: sy(h0) }} size={10} anchor="end">
            {`${h0} m`}
          </Label>
        )}

        <path d={curve(vac, T)} fill="none" className="stroke-blue-500" strokeWidth={air ? 1.5 : 2.5} strokeDasharray={air ? '5 4' : undefined} />
        {air && <path d={curve(at, tAir)} fill="none" className="stroke-rose-500" strokeWidth="2.5" />}
        {!air && (
          <>
            <line x1={sx(vx0 * (vy0 / G))} y1={sy(H)} x2={sx(vx0 * (vy0 / G))} y2={BOTTOM} className="stroke-gray-400" strokeDasharray="3 3" />
            <Label p={{ x: sx(vx0 * (vy0 / G)), y: sy(H) - 10 }} size={11}>
              {`H = ${fmtNum(H, 1)} m`}
            </Label>
          </>
        )}
        {strobe.map((q, i) => (
          <circle key={i} cx={sx(q.x)} cy={sy(Math.max(q.y, 0))} r={3} className={air ? 'fill-rose-400/60' : 'fill-blue-400/60'} />
        ))}

        <Arrow from={ball} to={{ x: ball.x + p.vx * arrowK, y: ball.y }} tone="emerald" width={2.5} />
        <Arrow from={ball} to={{ x: ball.x, y: ball.y - p.vy * arrowK }} tone="amber" width={2.5} />
        <Arrow from={ball} to={{ x: ball.x + p.vx * arrowK, y: ball.y - p.vy * arrowK }} tone="violet" width={2} />
        <circle cx={ball.x} cy={ball.y} r={7} className="fill-gray-800 dark:fill-gray-100" />
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={t} />
      <Sliders>
        <Slider label="v₀, m/s" value={v0} onChange={set(setV0)} min={5} max={30} step={1} tone="violet" />
        <Slider label="α, °" value={deg} onChange={set(setDeg)} min={0} max={90} step={1} tone="blue" />
        <Slider label="h₀, m" value={h0} onChange={set(setH0)} min={0} max={30} step={1} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: <>v<sub>x</sub> =</>, value: `${fmtNum(p.vx, 1)} m/s`, tone: 'emerald' },
            { label: <>v<sub>y</sub> =</>, value: `${fmtNum(p.vy, 1)} m/s`, tone: 'amber' },
            { label: 'време', value: `${fmtNum(T, 2)} s`, tone: 'blue' },
            { label: 'H =', value: `${fmtNum(H, 1)} m`, tone: 'blue' },
            { label: 'обхват', value: `${fmtNum(range, 1)} m`, tone: 'blue' },
            ...(air ? [{ label: 'с въздух', value: `${fmtNum(drag[drag.length - 1].x, 1)} m`, tone: 'rose' as const }] : []),
          ]}
        />
      </div>
      <Note tone="gray">
        {air
          ? 'Въздухът „изяжда“ хоризонталната скорост: траекторията вече не е парабола, а пада по-стръмно.'
          : h0 === 0 && deg > 0 && deg < 90 && deg !== 45
            ? `Същия обхват дава и ъгъл ${90 - deg}° – двата ъгъла се допълват до 90°.`
            : 'Хоризонталната скорост (зелената стрелка) не се мени, а вертикалната намалява с g всяка секунда.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Зелената стрелка е хоризонталната компонента на скоростта, жълтата – вертикалната, а лилавата – самата скорост. Точките показват положението през равни интервали време: по хоризонтала разстоянията между тях са равни (равномерно движение), а по
        вертикала – като при хвърляне нагоре. Съпротивлението е изчислено приблизително за футболна топка.
      </p>
    </div>
  );
}
