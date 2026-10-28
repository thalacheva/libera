import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Опростен модел: CO₂ по приблизителните пътеки на сценариите на IPCC, въздействие 5,35·ln(C/280), умножено по 1,1
// за останалите фактори (другите парникови газове минус аерозолите), и два слоя океан – горен и дълбок.
const OTHER = 1.1;
const F2X = 5.35 * Math.log(2);
const C_UP = 8; // W·год./(m²·K) – горният слой на океана и сушата
const C_DEEP = 100; // дълбокият океан
const GAMMA = 0.7; // топлообмен между двата слоя, W/(m²·K)

const histCO2 = (y: number) => 280 + 133 * Math.exp((y - 2020) / 55);

const SCENARIOS = [
  {
    id: 'SSP1-2.6',
    name: 'SSP1-2.6 – бързо намаляване',
    pts: [[2020, 413], [2040, 450], [2060, 470], [2080, 460], [2100, 446]] as [number, number][],
    cls: 'stroke-emerald-600 dark:stroke-emerald-400',
  },
  {
    id: 'SSP2-4.5',
    name: 'SSP2-4.5 – средният път',
    pts: [[2020, 413], [2050, 509], [2100, 603]] as [number, number][],
    cls: 'stroke-amber-500 dark:stroke-amber-400',
  },
  {
    id: 'SSP5-8.5',
    name: 'SSP5-8.5 – много високи емисии',
    pts: [[2020, 413], [2050, 563], [2100, 1135]] as [number, number][],
    cls: 'stroke-rose-600 dark:stroke-rose-400',
  },
];

function co2(sc: number, y: number) {
  if (y <= 2020) return histCO2(y);
  const pts = SCENARIOS[sc].pts;
  for (let i = 1; i < pts.length; i++) {
    const [a, ca] = pts[i - 1];
    const [b, cb] = pts[i];
    if (y <= b) return ca + ((cb - ca) * (y - a)) / (b - a);
  }
  return pts[pts.length - 1][1];
}
const forcing = (c: number) => OTHER * 5.35 * Math.log(c / 280);

/** Температурата спрямо 1850 г. през всяка година до 2100 г. */
function run(sc: number, ecs: number) {
  const lambda = F2X / ecs;
  let t = 0;
  let td = 0;
  const out: { y: number; c: number; f: number; t: number }[] = [];
  const dt = 0.25;
  for (let y = 1850; y <= 2100 + 1e-9; y += dt) {
    const c = co2(sc, y);
    const f = forcing(c);
    const dT = (f - lambda * t - GAMMA * (t - td)) / C_UP;
    const dTd = (GAMMA * (t - td)) / C_DEEP;
    if (Math.abs(y - Math.round(y)) < 1e-9) out.push({ y: Math.round(y), c, f, t });
    t += dT * dt;
    td += dTd * dt;
  }
  return out;
}

const PX = 54;
const PW = 420;
const CY = 14;
const CH = 80;
const TY = 116;
const TH = 170;
const xOf = (y: number) => PX + ((y - 1850) / 250) * PW;
const cyOf = (c: number) => CY + CH - (Math.log(c / 250) / Math.log(1200 / 250)) * CH;
const tyOf = (t: number) => TY + TH - (t / 6) * TH;

/** Сценарии за бъдещето: CO₂ → радиационно въздействие → затопляне, с океан, който забавя отговора. */
export default function ScenarioLab() {
  const [sc, setSc] = useState(1);
  const [ecs, setEcs] = useState(3);
  const all = useMemo(() => SCENARIOS.map((_, i) => run(i, ecs)), [ecs]);
  const data = all[sc];
  const at = (y: number) => data[y - 1850];
  const end = at(2100);
  const eq = end.f / (F2X / ecs);

  const path = (d: { y: number; c: number; t: number }[], v: (p: { c: number; t: number }) => number) =>
    d
      .filter(p => p.y % 2 === 0)
      .map((p, i) => `${i ? 'L' : 'M'}${xOf(p.y).toFixed(1)} ${v(p).toFixed(1)}`)
      .join('');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* CO₂ */}
        <rect x={PX} y={CY} width={PW} height={CH} className="fill-gray-50 dark:fill-slate-900" />
        {[280, 400, 600, 1000].map(c => (
          <g key={c}>
            <line x1={PX} y1={cyOf(c)} x2={PX + PW} y2={cyOf(c)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 6} y={cyOf(c) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {c}
            </text>
          </g>
        ))}
        {all.map((d, i) => (
          <path key={i} d={path(d, p => cyOf(p.c))} fill="none" className={SCENARIOS[i].cls} strokeWidth={i === sc ? 2.4 : 1} opacity={i === sc ? 1 : 0.4} />
        ))}
        <rect x={PX} y={CY} width={PW} height={CH} fill="none" className="stroke-gray-400" />
        <text x={PX + 6} y={CY + 13} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          CO₂, ppm (логаритмична скала)
        </text>

        {/* Температура */}
        <rect x={PX} y={TY} width={PW} height={TH} className="fill-sky-50 dark:fill-slate-900" />
        {[0, 1, 2, 3, 4, 5, 6].map(t => (
          <g key={t}>
            <line x1={PX} y1={tyOf(t)} x2={PX + PW} y2={tyOf(t)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 6} y={tyOf(t) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {t}
            </text>
          </g>
        ))}
        {[1.5, 2].map(t => (
          <g key={t}>
            <line x1={PX} y1={tyOf(t)} x2={PX + PW} y2={tyOf(t)} className="stroke-gray-500" strokeDasharray="5 4" />
            <text x={PX + 4} y={tyOf(t) - 3} fontSize="9" className="fill-gray-500 dark:fill-gray-400">
              {t === 2 ? '2 °C' : '1,5 °C'}
            </text>
          </g>
        ))}
        {all.map((d, i) => (
          <path key={i} d={path(d, p => tyOf(Math.min(6.2, p.t)))} fill="none" className={SCENARIOS[i].cls} strokeWidth={i === sc ? 2.6 : 1} opacity={i === sc ? 1 : 0.4} />
        ))}
        <line x1={xOf(2100)} y1={tyOf(Math.min(6, eq))} x2={xOf(2100) + 10} y2={tyOf(Math.min(6, eq))} className="stroke-fuchsia-600" strokeWidth="2.5" />
        <rect x={PX} y={TY} width={PW} height={TH} fill="none" className="stroke-gray-400" />
        <text x={PX + 6} y={TY + 13} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          затопляне спрямо 1850–1900 г., °C
        </text>
        {[1850, 1900, 1950, 2000, 2050, 2100].map(y => (
          <g key={y}>
            <line x1={xOf(y)} y1={TY + TH} x2={xOf(y)} y2={TY + TH + 5} className="stroke-gray-500" />
            <text x={xOf(y)} y={TY + TH + 17} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {y}
            </text>
          </g>
        ))}
        <line x1={xOf(2020)} y1={CY} x2={xOf(2020)} y2={TY + TH} className="stroke-gray-400" strokeDasharray="2 3" />

        {/* Пояснение вдясно */}
        <g transform="translate(492 120)">
          <text fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            <tspan x={0}>Розовата чертичка</tspan>
            <tspan x={0} dy="14">при 2100 г. е</tspan>
            <tspan x={0} dy="14">равновесното</tspan>
            <tspan x={0} dy="14">затопляне за</tspan>
            <tspan x={0} dy="14">въздействието</tspan>
            <tspan x={0} dy="14">в 2100 г.</tspan>
            <tspan x={0} dy="24">Океанът го</tspan>
            <tspan x={0} dy="14">достига едва</tspan>
            <tspan x={0} dy="14">след векове.</tspan>
          </text>
        </g>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Опростен модел с два слоя (горен и дълбок океан). Концентрациите следват приблизително сценариите на IPCC; ΔT₂ₓ е затоплянето в
        равновесие при удвояване на CO₂.
      </p>
      <Buttons>
        {SCENARIOS.map((s, i) => (
          <DiagramButton key={s.id} active={sc === i} onClick={() => setSc(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="ΔT₂ₓ" value={ecs} onChange={setEcs} min={1.5} max={6} step={0.5} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'CO₂ 2100', value: `${fmt(end.c)} ppm` },
            { label: 'ΔF 2100', value: `${fmt(end.f, 1)} W/m²`, tone: 'amber' },
            { label: 'ΔT 2020', value: `${fmt(at(2020).t, 1)} °C` },
            { label: 'ΔT 2100', value: `${fmt(end.t, 1)} °C`, tone: 'rose' },
            { label: 'в равновесие', value: `${fmt(eq, 1)} °C`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={end.t < 2 ? 'emerald' : end.t < 3 ? 'amber' : 'rose'}>
        {ecs < 2.5 || ecs > 4
          ? `ΔT₂ₓ = ${fmt(ecs, 1)} °C е извън вероятния интервал на IPCC (2,5–4 °C) – а затоплянето до 2020 г. става ${fmt(at(2020).t, 1)} °C вместо наблюдаваните около 1,2 °C.`
          : `До 2100 г. – около ${fmt(end.t, 1)} °C, но океанът още не е „догонил“: в равновесие биха се стигнали ${fmt(eq, 1)} °C.`}
      </Note>
    </div>
  );
}
