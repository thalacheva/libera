import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Модел на кривата на Кийлинг: квадратичен тренд по годишните средни на Мауна Лоа (NOAA, 1959–2024, отклонение до ~1,5 ppm)
// плюс сезонен ход. Това не са истинските измервания, а формула, която ги наподобява.
const trend = (y: number) => {
  const x = y - 2000;
  return 370.63 + 1.8918 * x + 0.013674 * x * x;
};
const growth = (y: number) => 1.8918 + 2 * 0.013674 * (y - 2000);
/** Gt CO₂ в атмосферата на 1 ppm */
const GT_PER_PPM = 7.77;

const STATIONS = [
  { name: 'Уткиагвик, Аляска (71° с.ш.)', short: 'Аляска', amp: 16, peak: 0.35 },
  { name: 'Мауна Лоа, Хаваи (20° с.ш.)', short: 'Мауна Лоа', amp: 6.5, peak: 0.37 },
  { name: 'Южен полюс (90° ю.ш.)', short: 'Южен полюс', amp: 1.2, peak: 0.75 },
];

/** Сезонен ход с размах 1: бавно натрупване през зимата и бързо поглъщане през лятото. */
const shape = (f: number) => Math.cos(2 * Math.PI * f) + 0.3 * Math.cos(4 * Math.PI * f - 1.6);
const SHAPE = Array.from({ length: 400 }, (_, i) => shape(i / 400));
const SHAPE_PP = Math.max(...SHAPE) - Math.min(...SHAPE);
const SHAPE_PEAK = SHAPE.indexOf(Math.max(...SHAPE)) / 400;
/** peak – частта от годината, в която е максимумът (0,37 ≈ средата на май) */
const seasonal = (y: number, amp: number, peak: number) => (amp / SHAPE_PP) * shape(y - Math.floor(y) - peak + SHAPE_PEAK);

const PX = 56;
const PW = 560;
const PY = 16;
const PH = 250;
const Y0 = 1958;
const Y1 = 2025;

/** Кривата на Кийлинг: тренд, сезонен ход и разлики между станциите. */
export default function KeelingLab() {
  const [st, setSt] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [year, setYear] = useState(2024);
  const s = STATIONS[st];
  const c = (y: number) => trend(y) + seasonal(y, s.amp, s.peak);

  const [ya, yb] = zoom ? [year - 1, year + 2] : [Y0, Y1];
  const vals = Array.from({ length: 121 }, (_, i) => c(ya + ((yb - ya) * i) / 120));
  const [ca, cb] = zoom ? [Math.floor(Math.min(...vals) - 2), Math.ceil(Math.max(...vals) + 2)] : [300, 440];
  const xOf = (y: number) => PX + ((y - ya) / (yb - ya)) * PW;
  const yOf = (v: number) => PY + PH - ((v - ca) / (cb - ca)) * PH;

  const n = zoom ? 360 : 1600;
  const curve = Array.from({ length: n + 1 }, (_, i) => {
    const y = ya + ((yb - ya) * i) / n;
    return `${i ? 'L' : 'M'}${xOf(y).toFixed(1)} ${yOf(c(y)).toFixed(1)}`;
  }).join('');
  const trendPath = Array.from({ length: 61 }, (_, i) => {
    const y = ya + ((yb - ya) * i) / 60;
    return `${i ? 'L' : 'M'}${xOf(y).toFixed(1)} ${yOf(trend(y)).toFixed(1)}`;
  }).join('');

  const xTicks = zoom ? [ya, ya + 1, ya + 2, ya + 3] : [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const yStep = zoom ? (cb - ca > 20 ? 5 : 2) : 20;
  const yTicks: number[] = [];
  for (let v = Math.ceil(ca / yStep) * yStep; v <= cb; v += yStep) yTicks.push(v);

  const months = zoom ? Array.from({ length: 36 }, (_, i) => ya + (i + 0.5) / 12) : [];
  const g = growth(year);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="kl-plot">
            <rect x={PX} y={PY} width={PW} height={PH} />
          </clipPath>
        </defs>
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-sky-50 dark:fill-slate-900" />
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PX} y1={yOf(v)} x2={PX + PW} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        {xTicks.map(v => (
          <g key={v}>
            <line x1={xOf(v)} y1={PY + PH} x2={xOf(v)} y2={PY + PH + 5} className="stroke-gray-500" />
            <text x={xOf(v)} y={PY + PH + 17} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        <g clipPath="url(#kl-plot)">
          {!zoom && <rect x={xOf(year - 1)} y={PY} width={xOf(year + 2) - xOf(year - 1)} height={PH} className="fill-fuchsia-200/50 dark:fill-fuchsia-900/40" />}
          <path d={curve} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth={zoom ? 2 : 1} />
          <path d={trendPath} fill="none" className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="1.5" strokeDasharray="6 4" />
          {months.map(m => (
            <circle key={m} cx={xOf(m)} cy={yOf(c(m))} r={2.5} className="fill-rose-700 dark:fill-rose-300" />
          ))}
        </g>
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-400" />
        <text x={14} y={PY + PH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${PY + PH / 2})`}>
          CO₂, ppm
        </text>
        <text x={PX + PW / 2} y={PY + PH + 32} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          година{zoom ? ' (точките са средните за месеца)' : ''}
        </text>
        <g transform={`translate(${PX + 12} ${PY + 18})`}>
          <line x1={0} y1={0} x2={24} y2={0} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2" />
          <text x={30} y={4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            {s.short} (модел)
          </text>
          <line x1={0} y1={18} x2={24} y2={18} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x={30} y={22} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            тренд (средно за годината)
          </text>
        </g>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Кривата е модел – тренд по годишните средни от Мауна Лоа и сезонен ход с размах, близък до измерения на станцията.
      </p>
      <Buttons>
        {STATIONS.map((x, i) => (
          <DiagramButton key={x.name} active={st === i} onClick={() => setSt(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!zoom} onClick={() => setZoom(false)}>
          1958–2025
        </DiagramButton>
        <DiagramButton active={zoom} onClick={() => setZoom(true)}>
          три години отблизо
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="година" value={year} onChange={setYear} min={1960} max={2024} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `средно ${year} г.`, value: `${fmt(trend(year + 0.5), 1)} ppm` },
            { label: 'прираст', value: `${fmt(g, 2)} ppm/год.`, tone: 'rose' },
            { label: 'във въздуха', value: `+${fmt(g * GT_PER_PPM, 1)} Gt CO₂/год.`, tone: 'rose' },
            { label: 'сезонен размах', value: `${fmt(s.amp, 1)} ppm`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={st === 2 ? 'blue' : 'emerald'}>
        {st === 2
          ? 'В южното полукълбо сушата и горите са малко – сезонният ход почти изчезва, но трендът е същият.'
          : 'Максимумът е през май, минимумът – в края на лятото: през лятото горите на северните континенти поглъщат CO₂, а през зимата гниенето го връща.'}
      </Note>
    </div>
  );
}
