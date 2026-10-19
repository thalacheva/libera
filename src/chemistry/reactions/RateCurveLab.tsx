import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// Три кинетични уравнения v = k·cⁿ. Константите са избрани така, че при c₀ = 1 mol/L
// първият период на полуразпадане и при трите да е 10 s.
const ORDERS = [
  { n: 0, k: 0.05, name: 'нулев ред', law: 'v = k', unit: 'mol/(L·s)' },
  { n: 1, k: Math.LN2 / 10, name: 'първи ред', law: 'v = k·c', unit: 's⁻¹' },
  { n: 2, k: 0.1, name: 'втори ред', law: 'v = k·c²', unit: 'L/(mol·s)' },
];

/** Концентрацията на реагента в момента t (интегрираните кинетични уравнения). */
function conc(n: number, k: number, c0: number, t: number) {
  if (n === 0) return Math.max(0, c0 - k * t);
  if (n === 1) return c0 * Math.exp(-k * t);
  return 1 / (1 / c0 + k * t);
}

/** Мигновената скорост v = k·cⁿ (при нулев ред – докато има реагент). */
const rate = (n: number, k: number, c: number) => (c <= 0 ? 0 : k * c ** n);

/** Моментите, в които концентрацията пада до c₀/2, c₀/4, c₀/8… */
function halvings(n: number, k: number, c0: number, tMax: number) {
  const ts: number[] = [];
  for (let j = 1; j <= 4; j++) {
    const t = n === 0 ? (c0 - c0 / 2 ** j) / k : n === 1 ? (j * Math.LN2) / k : (2 ** j - 1) / (k * c0);
    if (t > tMax) break;
    ts.push(t);
  }
  return ts;
}

// Графиката: t от 0 до 60 s, c от 0 до 2 mol/L
const L = 52;
const R = 456;
const TOP = 14;
const BOTTOM = 214;
const T_MAX = 60;
const C_MAX = 2;
const xAt = (t: number) => L + (t / T_MAX) * (R - L);
const yAt = (c: number) => BOTTOM - (c / C_MAX) * (BOTTOM - TOP);

/** Кинетична крива: средна скорост (секуща), мигновена скорост (допирателна) и периоди на полуразпадане. */
export default function RateCurveLab() {
  const clip = useId();
  const [oi, setOi] = useState(1);
  const [c0, setC0] = useState(1);
  const [t, setT] = useState(10);
  const [dt, setDt] = useState(20);
  const { n, k, name, unit } = ORDERS[oi];

  const c = conc(n, k, c0, t);
  const t2 = Math.min(T_MAX, t + dt);
  const cB = conc(n, k, c0, t2);
  const vAvg = t2 > t ? (c - cB) / (t2 - t) : 0;
  const v = rate(n, k, c);
  const halves = halvings(n, k, c0, T_MAX);

  const curve = Array.from({ length: 241 }, (_, i) => {
    const tt = (i / 240) * T_MAX;
    return `${xAt(tt)},${yAt(conc(n, k, c0, tt))}`;
  }).join(' ');
  // Допирателната: права с наклон −v през точката (t; c), начертана на ±15 s
  const tangent = [t - 15, t + 15].map(tt => ({ x: xAt(tt), y: yAt(c - v * (tt - t)) }));

  const gaps = halves.map((h, i) => h - (i === 0 ? 0 : halves[i - 1]));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ORDERS.map((o, i) => (
          <DiagramButton key={o.name} active={i === oi} onClick={() => setOi(i)}>
            {o.name}: {o.law}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 252" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        <defs>
          <clipPath id={clip}>
            <rect x={L} y={TOP} width={R - L} height={BOTTOM - TOP} />
          </clipPath>
        </defs>
        {[0, 0.5, 1, 1.5, 2].map(v => (
          <g key={v}>
            <line x1={L} x2={R} y1={yAt(v)} y2={yAt(v)} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={L - 6} y={yAt(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {fmtNum(v, 1)}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50, 60].map(v => (
          <g key={v}>
            <line x1={xAt(v)} x2={xAt(v)} y1={TOP} y2={BOTTOM} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={xAt(v)} y={BOTTOM + 16} fontSize="11" textAnchor="middle" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        <line x1={L} x2={R} y1={BOTTOM} y2={BOTTOM} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={L} x2={L} y1={TOP} y2={BOTTOM} className="stroke-gray-400" strokeWidth="1.5" />
        <text x={(L + R) / 2} y={BOTTOM + 34} fontSize="12" textAnchor="middle" fill="currentColor">
          време t, s
        </text>
        <text x={10} y={TOP + 4} fontSize="11" fill="currentColor" transform={`rotate(-90 10 ${TOP + 4})`} textAnchor="end">
          концентрация c, mol/L
        </text>

        <g clipPath={`url(#${clip})`}>
          {/* Периодите на полуразпадане: c₀/2, c₀/4, … */}
          {halves.map(h => (
            <g key={h}>
              <line x1={xAt(h)} x2={xAt(h)} y1={yAt(conc(n, k, c0, h))} y2={BOTTOM} className="stroke-violet-400" strokeDasharray="3 3" />
              <circle cx={xAt(h)} cy={yAt(conc(n, k, c0, h))} r={4} className="fill-violet-500" />
            </g>
          ))}
          <polyline points={curve} fill="none" className="stroke-blue-500" strokeWidth="3" />
          {/* Секущата – средна скорост за [t; t + Δt] */}
          {t2 > t && <line x1={xAt(t)} y1={yAt(c)} x2={xAt(t2)} y2={yAt(cB)} className="stroke-amber-500" strokeWidth="2.5" strokeDasharray="6 4" />}
          {/* Допирателната – мигновена скорост в момента t */}
          <line x1={tangent[0].x} y1={tangent[0].y} x2={tangent[1].x} y2={tangent[1].y} className="stroke-rose-500" strokeWidth="2.5" />
          {t2 > t && <circle cx={xAt(t2)} cy={yAt(cB)} r={5} className="fill-amber-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />}
          <circle cx={xAt(t)} cy={yAt(c)} r={6} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        </g>
      </LabSvg>

      <Sliders>
        <Slider label="c₀" value={c0} onChange={setC0} min={0.5} max={2} step={0.1} tone="blue" />
        <Slider label="t, s" value={t} onChange={setT} min={0} max={50} step={1} tone="rose" />
        <Slider label="Δt, s" value={dt} onChange={setDt} min={1} max={40} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `c(${t} s) =`, value: `${fmtNum(c, 3)} mol/L`, tone: 'blue' },
            { label: 'средна скорост:', value: `${fmtNum(vAvg, 4)} mol/(L·s)`, tone: 'amber' },
            { label: 'мигновена скорост:', value: `${fmtNum(v, 4)} mol/(L·s)`, tone: 'rose' },
            { label: 'k =', value: `${fmtNum(k, 4)} ${unit}` },
          ]}
        />
      </div>
      <Note tone="violet">
        {halves.length === 0
          ? 'Концентрацията не стига до половината за 60 s.'
          : `Концентрацията се разполовява за: ${gaps.map(g => `${fmtNum(g, 1)} s`).join(', ')}. ${
              n === 0
                ? 'При нулев ред всеки следващ период е два пъти по-кратък.'
                : n === 1
                  ? 'При първи ред периодът на полуразпадане е постоянен и не зависи от c₀.'
                  : 'При втори ред всеки следващ период е два пъти по-дълъг.'
            }`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Синята крива е концентрацията на реагента. Жълтата пунктирна права (секуща) дава средната скорост за интервала [t; t + Δt], а
        червената (допирателна) – мигновената скорост в момента t. Намаляй Δt – секущата се доближава до допирателната и средната скорост –
        до мигновената. Виолетовите точки отбелязват моментите, в които остава половината, четвъртината, осмината… от началното количество.
        Промени c₀ и виж кои периоди се променят – при {name} константата е k = {fmtNum(k, 4)} {unit}.
      </p>
    </div>
  );
}
