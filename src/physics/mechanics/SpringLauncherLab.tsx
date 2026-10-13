import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;

/** Кръгла горна граница за скалата на височината: 1, 2, 5, 10, 20, 50 m. */
const niceCeil = (h: number) => [1, 2, 5, 10, 20, 50].find(n => h <= n) ?? 100;

// Графиката F(x): x до 0,2 m, F до 200 N
const GX = { left: 270, right: 460, top: 30, bottom: 200 };
const gx = (x: number) => GX.left + (x / 0.2) * (GX.right - GX.left);
const gy = (F: number) => GX.bottom - (F / 200) * (GX.bottom - GX.top);

/** Пружинно оръдие: енергията kx²/2 на свитата пружина става кинетична, а после потенциална енергия на топчето. */
export default function SpringLauncherLab() {
  const [k, setK] = useState(400);
  const [cm, setCm] = useState(10);
  const [grams, setGrams] = useState(100);
  const x = cm / 100;
  const m = grams / 1000;
  const E = (k * x * x) / 2;
  const v = Math.sqrt((2 * E) / m);
  const h = E / (m * G);
  const scale = niceCeil(h);

  // Топчето лети нагоре и пада обратно: y = vt − gt²/2
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), s => s, { dt: 1 / 200 });
  const flight = (2 * v) / G;
  const t = Math.min(sim.time, flight);
  const y = Math.max(0, v * t - (G * t * t) / 2);
  const reset = () => sim.reset();
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    reset();
  };

  const base = 220;
  const colTop = 30;
  const hy = (hh: number) => base - (hh / scale) * (base - colTop);
  // Свитата пружина: колкото по-свита, толкова по-къса
  const springTop = sim.time > 0 ? base - 40 : base - 40 + cm * 1.5;
  const coils = Array.from({ length: 9 }, (_, i) => {
    const yy = base - ((base - springTop) * i) / 8;
    return `${i ? 'L' : 'M'} ${i % 2 ? 108 : 92} ${yy.toFixed(1)}`;
  }).join(' ');
  const ballY = sim.time > 0 ? hy(y) - 10 : springTop - 10;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 250">
        {/* Колона с височината */}
        <line x1={50} y1={base} x2={50} y2={colTop} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={46} y1={hy(f * scale)} x2={200} y2={hy(f * scale)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: 42, y: hy(f * scale) }} size={10} anchor="end">
              {fmtNum(f * scale, 2)}
            </Label>
          </g>
        ))}
        <Label p={{ x: 54, y: colTop - 14 }} size={10} anchor="start">
          h, m
        </Label>
        <line x1={70} y1={hy(h)} x2={190} y2={hy(h)} className="stroke-violet-500" strokeDasharray="5 4" strokeWidth="1.5" />
        <Label p={{ x: 190, y: hy(h) - 10 }} size={11} anchor="end" tone="violet">
          {`h = ${fmtNum(h, 2)} m`}
        </Label>
        <rect x={80} y={base} width={40} height={8} className="fill-gray-500" />
        <path d={coils} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />
        <circle cx={100} cy={ballY} r={10} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />

        {/* Графика F(x): лицето на триъгълника е енергията на пружината */}
        <polygon points={`${gx(0)},${gy(0)} ${gx(x)},${gy(0)} ${gx(x)},${gy(k * x)}`} className="fill-amber-400/50" />
        <line x1={gx(0)} y1={gy(0)} x2={gx(0.2)} y2={gy(k * 0.2)} className="stroke-blue-500" strokeWidth="2.5" />
        <line x1={GX.left} y1={GX.bottom} x2={GX.right} y2={GX.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={GX.left} y1={GX.bottom} x2={GX.left} y2={GX.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[0.05, 0.1, 0.15, 0.2].map(xx => (
          <Label key={xx} p={{ x: gx(xx), y: GX.bottom + 12 }} size={10} weight={500}>
            {fmtNum(xx, 2)}
          </Label>
        ))}
        {[50, 100, 150, 200].map(F => (
          <Label key={F} p={{ x: GX.left - 6, y: gy(F) }} size={10} anchor="end" weight={500}>
            {String(F)}
          </Label>
        ))}
        <Label p={{ x: GX.right, y: GX.bottom + 26 }} size={10} anchor="end">
          x, m
        </Label>
        <Label p={{ x: GX.left + 6, y: GX.top - 10 }} size={10} anchor="start">
          F, N
        </Label>
        <Label p={{ x: gx(x) - 4, y: gy(k * x / 3) }} size={11} tone="amber" anchor="end">
          {`${fmtNum(E, 2)} J`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={reset} time={t} />
      <Sliders>
        <Slider label="k, N/m" value={k} onChange={change(setK)} min={100} max={1000} step={50} tone="blue" />
        <Slider label="x, cm" value={cm} onChange={change(setCm)} min={2} max={20} step={1} tone="amber" />
        <Slider label="m, g" value={grams} onChange={change(setGrams)} min={50} max={500} step={10} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'E = kx²/2 =', value: `${fmtNum(E, 2)} J`, tone: 'amber' },
            { label: 'v =', value: `${fmtNum(v, 1)} m/s`, tone: 'rose' },
            { label: 'h =', value: `${fmtNum(h, 2)} m`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone="gray">Двойно по-силно свиване дава 4 пъти повече енергия – и 4 пъти по-голяма височина.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Силата на пружината расте с деформацията (F = kx), затова работата ѝ е лицето на триъгълника под графиката – kx²/2. Тази енергия
        става кинетична (mv²/2), а после потенциална (mgh). Пренебрегваме съпротивлението на въздуха и малката височина, с която топчето се
        издига, докато пружината се разпуска.
      </p>
    </div>
  );
}
