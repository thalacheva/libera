import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const R_MAX = 20;
// Графиката P(R)
const G = { l: 262, r: 466, t: 24, b: 190 };

/** Батерия с ЕДН ℰ и вътрешно съпротивление r: напрежение на клемите, ток и мощност във външния товар. */
export default function BatteryLab() {
  const [emf, setEmf] = useState(9);
  const [r, setR0] = useState(2);
  const [R, setR] = useState(6);
  const I = emf / (R + r);
  const U = emf - I * r;
  const P = I * I * R;
  const pMax = (emf * emf) / (4 * r);
  const eta = R / (R + r);

  const gx = (x: number) => G.l + (x / R_MAX) * (G.r - G.l);
  const gy = (p: number) => G.b - (p / (pMax * 1.15)) * (G.b - G.t);
  const curve = Array.from({ length: 161 }, (_, n) => (n / 160) * R_MAX)
    .map((x, n) => {
      const i = emf / (x + r);
      return `${n ? 'L' : 'M'} ${gx(x).toFixed(1)} ${gy(i * i * x).toFixed(1)}`;
    })
    .join(' ');

  const short = R < 0.15;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 220">
        {/* Верига: батерия (ℰ и r в пунктирна кутия) и външен товар R */}
        <polyline points="40,40 200,40 200,190 40,190 40,40" fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        <rect x={16} y={70} width={48} height={92} rx={6} className="fill-white stroke-gray-400 dark:fill-gray-800" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M 40 70 V 86 M 40 97 V 115 M 40 149 V 162" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        <line x1={26} y1={86} x2={54} y2={86} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" />
        <line x1={33} y1={97} x2={47} y2={97} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="5" />
        <rect x={30} y={115} width={20} height={34} className="fill-gray-200 stroke-gray-600 dark:fill-gray-700" strokeWidth="1.5" />
        <Label p={{ x: 76, y: 92 }} size={12} anchor="start">
          ℰ
        </Label>
        <Label p={{ x: 76, y: 132 }} size={12} anchor="start">
          r
        </Label>
        {/* Товар */}
        <rect x={190} y={92} width={20} height={46} className={short ? 'fill-rose-200 stroke-rose-600' : 'fill-amber-100 stroke-amber-600 dark:fill-amber-900/60'} strokeWidth="2" />
        <Label p={{ x: 180, y: 115 }} size={12} anchor="end">
          R
        </Label>
        {/* Волтметър върху клемите */}
        <circle cx={120} cy={115} r={17} className="fill-white stroke-gray-600 dark:fill-gray-800" strokeWidth="2" />
        <Label p={{ x: 120, y: 115 }} size={13}>
          V
        </Label>
        <Label p={{ x: 120, y: 148 }} size={11} tone="violet">
          {`${fmtNum(U, 2)} V`}
        </Label>
        <line x1={64} y1={115} x2={103} y2={115} className="stroke-gray-400" strokeDasharray="3 3" />
        <line x1={137} y1={115} x2={190} y2={115} className="stroke-gray-400" strokeDasharray="3 3" />
        <Label p={{ x: 120, y: 208 }} size={11} tone="blue">
          {`I = ${fmtNum(I, 2)} A`}
        </Label>

        {/* P(R) */}
        <line x1={G.l} y1={G.b} x2={G.r} y2={G.b} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.l} y1={G.b} x2={G.l} y2={G.t} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={gx(r)} y1={gy(pMax)} x2={gx(r)} y2={G.b} className="stroke-emerald-500" strokeDasharray="4 3" />
        <Label p={{ x: gx(r) + 4, y: gy(pMax) - 10 }} size={10} tone="emerald" anchor={r > 12 ? 'end' : 'start'}>
          {`R = r: P = ${fmtNum(pMax, 1)} W`}
        </Label>
        <path d={curve} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
        <circle cx={gx(R)} cy={gy(P)} r={5} className="fill-rose-500" />
        <Label p={{ x: G.l + 6, y: G.t - 10 }} size={11} anchor="start">
          P във товара, W
        </Label>
        {[0, 5, 10, 15, 20].map(x => (
          <Label key={x} p={{ x: gx(x), y: G.b + 12 }} size={10} weight={500}>
            {String(x)}
          </Label>
        ))}
        <Label p={{ x: G.r, y: G.b + 26 }} size={11} anchor="end">
          R, Ω
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="ℰ, V" value={emf} onChange={setEmf} min={1.5} max={12} step={0.5} tone="violet" />
        <Slider label="r, Ω" value={r} onChange={setR0} min={0.1} max={5} step={0.1} tone="gray" />
        <Slider label="R, Ω" value={R} onChange={setR} min={0} max={R_MAX} step={0.1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'I = ℰ/(R + r) =', value: `${fmtNum(I, 2)} A`, tone: 'blue' },
            { label: 'U = ℰ − Ir =', value: `${fmtNum(U, 2)} V`, tone: 'violet' },
            { label: 'P =', value: `${fmtNum(P, 1)} W`, tone: 'rose' },
            { label: 'η =', value: `${fmtNum(eta * 100, 0)}%`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={short ? 'rose' : 'gray'}>
        {short
          ? `Късо съединение! Токът е ограничен само от r: I = ℰ/r = ${fmtNum(emf / r, 1)} A, а цялата мощност загрява батерията.`
          : Math.abs(R - r) < 0.05
            ? 'R = r: товарът получава най-голямата възможна мощност, но половината енергия се губи в батерията (η = 50%).'
            : R < r
              ? 'Товарът е „лек“ (R < r): токът е голям, но повечето мощност се губи вътре в батерията.'
              : 'Колкото по-голямо е R, толкова по-близо е U до ℰ и по-висок КПД, но мощността в товара намалява.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Волтметърът показва напрежението на клемите U = ℰ − Ir. Без ток (R → ∞) то е равно на ЕДН; при късо съединение (R = 0) пада до нула. Зелената линия отбелязва максимума на мощността при R = r.
      </p>
    </div>
  );
}
