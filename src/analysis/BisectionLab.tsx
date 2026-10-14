import { useId, useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';

type Fn = { name: string; f: (x: number) => number; a: number; b: number; root: number; rootText: string; x: [number, number]; y: [number, number] };

const FUNCTIONS: Fn[] = [
  { name: 'x³ − x − 1', f: x => x ** 3 - x - 1, a: 1, b: 2, root: 1.3247179572, rootText: '1,32472', x: [0.6, 2.2], y: [-2, 4] },
  { name: 'x² − 2', f: x => x * x - 2, a: 0, b: 2, root: Math.SQRT2, rootText: '√2 ≈ 1,41421', x: [-0.3, 2.3], y: [-2.5, 2.5] },
  { name: 'cos x − x', f: x => Math.cos(x) - x, a: 0, b: 1, root: 0.7390851332, rootText: '0,73909', x: [-0.2, 1.3], y: [-0.8, 1.2] },
];

const PX0 = 30;
const PX1 = 466;
const PY0 = 14;
const PY1 = 250;
const MAX_STEPS = 20;

/** Една стъпка на метода: оставяме тази половина, в която функцията сменя знака. */
function halve(F: Fn, [a, b]: [number, number]): [number, number] {
  const c = (a + b) / 2;
  return F.f(a) * F.f(c) <= 0 ? [a, c] : [c, b];
}

/** Метод на разполовяването: интервалът, в който функцията сменя знака, се свива наполовина на всяка стъпка. */
export default function BisectionLab() {
  const clipId = useId();
  const [k, setK] = useState(0);
  const [steps, setSteps] = useState(0);
  const F = FUNCTIONS[k];

  let I: [number, number] = [F.a, F.b];
  for (let i = 0; i < steps; i++) I = halve(F, I);
  const [a, b] = I;
  const c = (a + b) / 2;

  const sx = (x: number) => PX0 + ((PX1 - PX0) * (x - F.x[0])) / (F.x[1] - F.x[0]);
  const sy = (y: number) => PY1 - ((PY1 - PY0) * (y - F.y[0])) / (F.y[1] - F.y[0]);
  const zeroY = sy(0);

  const path = Array.from({ length: 301 }, (_, i) => {
    const x = F.x[0] + ((F.x[1] - F.x[0]) * i) / 300;
    return `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${sy(F.f(x)).toFixed(1)}`;
  }).join(' ');

  const ticks: number[] = [];
  for (let t = Math.ceil(F.x[0] * 2) / 2; t <= F.x[1]; t += 0.5) if (Math.abs(t) > 1e-9) ticks.push(t);

  const select = (i: number) => {
    setK(i);
    setSteps(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 272">
        <defs>
          <clipPath id={clipId}>
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} />
          </clipPath>
        </defs>
        {/* Текущият интервал */}
        <rect x={sx(a)} y={PY0} width={Math.max(sx(b) - sx(a), 1)} height={PY1 - PY0} className="fill-amber-500/15" />
        {/* Ос x */}
        <line x1={PX0} y1={zeroY} x2={PX1} y2={zeroY} className="stroke-gray-400" strokeWidth={1.5} />
        {ticks.map(t => (
          <g key={t}>
            <line x1={sx(t)} y1={zeroY - 3} x2={sx(t)} y2={zeroY + 3} className="stroke-gray-400" />
            <Label p={{ x: sx(t), y: zeroY + 14 }} size={11} weight={500}>
              {num(t)}
            </Label>
          </g>
        ))}
        <Label p={{ x: PX1 + 6, y: zeroY - 12 }} size={13} anchor="end" tone="ink" weight={700}>
          x
        </Label>
        <path d={path} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth={2.5} clipPath={`url(#${clipId})`} />
        {/* Краищата и средата */}
        {[a, b].map((x, i) => (
          <g key={i}>
            <line x1={sx(x)} y1={zeroY} x2={sx(x)} y2={Math.min(PY1, Math.max(PY0, sy(F.f(x))))} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
            <circle cx={sx(x)} cy={zeroY} r={5} className={F.f(x) < 0 ? 'fill-blue-500' : 'fill-rose-500'} stroke="white" strokeWidth={1.5} />
          </g>
        ))}
        <line x1={sx(c)} y1={zeroY - 10} x2={sx(c)} y2={zeroY + 10} className="stroke-violet-600" strokeWidth={2} />
        {steps < 4 && (
          <>
            <Label p={{ x: sx(a), y: zeroY - 14 }} size={12} tone="ink">
              a
            </Label>
            <Label p={{ x: sx(b), y: zeroY - 14 }} size={12} tone="ink">
              b
            </Label>
          </>
        )}
      </ZoomingSvg>

      <Buttons>
        {FUNCTIONS.map((g, i) => (
          <DiagramButton key={g.name} active={i === k} onClick={() => select(i)}>
            f(x) = {g.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setSteps(Math.min(MAX_STEPS, steps + 1))}>✂️ Раздели наполовина</DiagramButton>
        <DiagramButton onClick={() => setSteps(0)}>↺ Отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпка', value: String(steps) },
            { label: 'интервал', value: `[${num(a, 5)}; ${num(b, 5)}]`, tone: 'amber' },
            { label: 'среда c =', value: num(c, 5), tone: 'violet' },
            { label: 'f(c) =', value: num(F.f(c), 4) },
          ]}
        />
      </div>
      <Note tone={b - a < 0.001 ? 'emerald' : 'gray'}>
        Дължината на интервала е {num(b - a, 6)} – коренът е в него. {b - a < 0.001 ? `Точният корен е ${F.rootText}.` : 'Всяка стъпка я намалява два пъти.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В краищата на жълтия интервал функцията има различни знаци (синьо – отрицателна, червено – положителна). Щом е непрекъсната, тя
        минава през нула някъде между тях. Пресмятаме f в средата c и запазваме тази половина, в чиито краища знаците пак са различни. След 10
        стъпки интервалът е над 1000 пъти по-къс.
      </p>
    </div>
  );
}
