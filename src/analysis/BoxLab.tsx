import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';

const SIDE = 12;
const volume = (x: number) => x * (SIDE - 2 * x) ** 2;

// Лист 12 × 12 вляво, графика на V(x) вдясно
const S = 200 / SIDE;
const SHEET = { x: 20, y: 24 };
const CHART = { left: 270, right: 460, top: 30, bottom: 224, vMax: 140 };
const cx = (x: number) => CHART.left + (x / 6) * (CHART.right - CHART.left);
const cy = (v: number) => CHART.bottom - (v / CHART.vMax) * (CHART.bottom - CHART.top);

/** От квадратен лист изрязваме квадратчета в ъглите и сгъваме кутия. Кое x дава най-голям обем? */
export default function BoxLab() {
  const [x, setX] = useState(1);
  const v = volume(x);
  const best = Math.abs(x - 2) < 0.01;

  const curve = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 6;
    return `${i ? 'L' : 'M'} ${cx(t).toFixed(1)} ${cy(volume(t)).toFixed(1)}`;
  }).join(' ');

  const corner = x * S;
  const inner = (SIDE - 2 * x) * S;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 250">
        {/* лист */}
        <rect x={SHEET.x} y={SHEET.y} width={200} height={200} className="fill-amber-100 stroke-amber-500 dark:fill-amber-900/40" strokeWidth="1.5" />
        <rect x={SHEET.x + corner} y={SHEET.y + corner} width={inner} height={inner} className="fill-amber-200/70 dark:fill-amber-700/40" />
        {[
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ].map(([i, j]) => (
          <rect
            key={`${i}${j}`}
            x={SHEET.x + i * (200 - corner)}
            y={SHEET.y + j * (200 - corner)}
            width={corner}
            height={corner}
            className="fill-white stroke-rose-500 dark:fill-gray-800"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        ))}
        <Label p={{ x: SHEET.x + 100, y: SHEET.y + 100 }} size={13} weight={600}>
          {`дъно ${num(SIDE - 2 * x)} × ${num(SIDE - 2 * x)}`}
        </Label>
        <Label p={{ x: SHEET.x + corner / 2, y: SHEET.y - 10 }} tone="rose" size={12} weight={600}>
          x
        </Label>
        <Label p={{ x: SHEET.x + 100, y: SHEET.y + 214 }} size={11}>
          лист 12 × 12
        </Label>

        {/* графика на обема */}
        <g className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5">
          <line x1={CHART.left} y1={CHART.bottom} x2={CHART.right} y2={CHART.bottom} />
          <line x1={CHART.left} y1={CHART.bottom} x2={CHART.left} y2={CHART.top - 6} />
        </g>
        {[0, 1, 2, 3, 4, 5, 6].map(t => (
          <Label key={t} p={{ x: cx(t), y: CHART.bottom + 13 }} size={10}>
            {String(t)}
          </Label>
        ))}
        {[50, 100].map(t => (
          <Label key={t} p={{ x: CHART.left - 6, y: cy(t) }} size={10} anchor="end">
            {String(t)}
          </Label>
        ))}
        <line x1={CHART.left} y1={cy(128)} x2={cx(2)} y2={cy(128)} className="stroke-emerald-500" strokeDasharray="4 3" strokeWidth="1.2" />
        <path d={curve} fill="none" className="stroke-blue-500" strokeWidth="2.5" />
        <circle cx={cx(x)} cy={cy(v)} r={6} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        <Label p={{ x: CHART.left + 8, y: CHART.top - 6 }} size={12} weight={600} anchor="start">
          V(x)
        </Label>
        <Label p={{ x: CHART.right - 4, y: CHART.bottom - 10 }} size={12} weight={600} anchor="end">
          x
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="x" value={x} onChange={setX} min={0} max={6} step={0.25} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'V = x(12 − 2x)² =', value: num(v), tone: 'blue' },
            { label: "V′ = 12x² − 96x + 144 =", value: num(12 * x * x - 96 * x + 144), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={best ? 'emerald' : 'gray'}>
        {best
          ? 'V′(2) = 0 – това е най-големият възможен обем: 128.'
          : x < 2
            ? 'V′ > 0: ако изрежеш малко повече, обемът ще порасне.'
            : 'V′ < 0: изрязваш твърде много – обемът намалява.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 От квадратен лист 12 × 12 изрязваме квадратчета със страна x в ъглите и сгъваме стените нагоре. При малко x кутията е плоска, при голямо – тясна.
      </p>
    </div>
  );
}
