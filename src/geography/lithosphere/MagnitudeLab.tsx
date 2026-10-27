import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Енергия на земетресение, J: lg E = 1,5 M + 4,8. */
const energy = (m: number) => 10 ** (1.5 * m + 4.8);
/** Тон тротил, J. */
const TNT = 4.184e9;

/** Известни земетресения – магнитудите са приблизителни (особено за старите). */
const FAMOUS: { name: string; m: number }[] = [
  { name: 'Пловдив, 1928', m: 7.0 },
  { name: 'Кресна, 1904', m: 7.2 },
  { name: 'Вранча, 1977', m: 7.4 },
  { name: 'Суматра, 2004', m: 9.1 },
  { name: 'Япония, 2011', m: 9.1 },
  { name: 'Чили, 1960', m: 9.5 },
];

/** Средно годишно в света (приблизителни оценки на Геоложката служба на САЩ). */
const PER_YEAR: [string, string][] = [
  ['8 и повече', '≈ 1'],
  ['7 – 7,9', '≈ 15'],
  ['6 – 6,9', '≈ 130'],
  ['5 – 5,9', '≈ 1300'],
];

function tntText(j: number) {
  const t = j / TNT;
  if (t < 1) return `${fmt(t * 1000)} kg тротил`;
  if (t < 1000) return `${fmt(t)} t тротил`;
  if (t < 1e6) return `${fmt(t / 1000, 1)} хил. t тротил`;
  if (t < 1e9) return `${fmt(t / 1e6, 1)} млн. t тротил`;
  return `${fmt(t / 1e9, 1)} млрд. t тротил`;
}

/** Колко по-силно е едно земетресение от друго: амплитуда ×10, енергия ×≈32 на единица магнитуд. */
export default function MagnitudeLab() {
  const [m1, setM1] = useState(5);
  const [m2, setM2] = useState(7);
  const dm = m2 - m1;
  const ampRatio = 10 ** dm;
  const eRatio = 10 ** (1.5 * dm);

  // Кръговете: лицето е пропорционално на енергията (по-слабото е с радиус поне 1,5 px)
  const big = Math.max(m1, m2);
  const rBig = 70;
  const rOf = (m: number) => Math.max(1.5, rBig * Math.sqrt(energy(m) / energy(big)));

  // Логаритмичната скала
  const SX = 40;
  const SW = 560;
  const sx = (m: number) => SX + ((m - 2) / 8) * SW;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Кръгове с площ ∝ енергията */}
        {[
          { m: m1, cx: 140, cls: 'fill-sky-500/60 stroke-sky-700' },
          { m: m2, cx: 330, cls: 'fill-rose-500/60 stroke-rose-700' },
        ].map(({ m, cx, cls }, i) => (
          <g key={i}>
            <circle cx={cx} cy={95} r={rOf(m)} className={cls} strokeWidth="1.5" />
            <text x={cx} y={186} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
              M = {fmt(m, 1)}
            </text>
            <text x={cx} y={202} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {tntText(energy(m))}
            </text>
          </g>
        ))}
        <text x={235} y={18} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          площта на кръга е пропорционална на енергията
        </text>
        {/* Колко на година */}
        <text x={455} y={34} fontSize="12" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
          В света за година
        </text>
        {PER_YEAR.map(([m, n], k) => (
          <g key={m} transform={`translate(455 ${56 + k * 22})`}>
            <text x={0} y={0} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
              M {m}
            </text>
            <text x={170} y={0} fontSize="12" fontWeight="bold" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
              {n}
            </text>
          </g>
        ))}
        {/* Скалата на магнитуда */}
        <line x1={SX} y1={250} x2={SX + SW} y2={250} className="stroke-gray-500" strokeWidth="1.5" />
        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
          <g key={m}>
            <line x1={sx(m)} y1={245} x2={sx(m)} y2={255} className="stroke-gray-500" />
            <text x={sx(m)} y={270} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {m}
            </text>
          </g>
        ))}
        {FAMOUS.map((f, k) => (
          <g key={f.name}>
            <circle cx={sx(f.m)} cy={250} r={3.5} className="fill-gray-800 dark:fill-gray-100" />
            <text x={sx(f.m)} y={238 - (k % 3) * 13} fontSize="10" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
              {f.name}
            </text>
          </g>
        ))}
        <circle cx={sx(m1)} cy={250} r={6} className="fill-sky-500 stroke-white" strokeWidth="1.5" />
        <circle cx={sx(m2)} cy={250} r={6} className="fill-rose-500 stroke-white" strokeWidth="1.5" />
        <text x={SX + SW / 2} y={292} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          магнитуд (всяко деление: амплитуда ×10, енергия ×≈32)
        </text>
      </LabSvg>
      <Sliders>
        <Slider label="M₁" value={m1} onChange={setM1} min={2} max={9.5} step={0.1} tone="blue" />
        <Slider label="M₂" value={m2} onChange={setM2} min={2} max={9.5} step={0.1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'разлика', value: fmt(dm, 1) },
            { label: 'амплитуда', value: `×${ampRatio >= 100 ? fmt(ampRatio) : fmt(ampRatio, 2)}` },
            { label: 'енергия', value: `×${eRatio >= 100 ? fmt(eRatio) : fmt(eRatio, 2)}`, tone: 'rose' },
            { label: `колко с M = ${fmt(m1, 1)} правят едно с M = ${fmt(m2, 1)}`, value: eRatio >= 1 ? fmt(eRatio) : '–' },
          ]}
        />
      </div>
    </div>
  );
}
