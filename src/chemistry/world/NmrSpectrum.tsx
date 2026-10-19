import LabSvg from '~/LabSvg';

/** Сигнал: химично отместване (ppm), брой линии (n + 1), брой H, група и описание на мултиплета. */
export type NmrSignal = { ppm: number; lines: number; h: number; group: string; split: string };

const X0 = 30;
const X1 = 460;
const Y1 = 105;
const PPM_MAX = 11;

/** Pascal: относителни височини на линиите в мултиплет. */
const pascal = (n: number) => {
  let row = [1];
  for (let i = 1; i < n; i++) row = [1, ...row.slice(1).map((v, k) => v + row[k]), 1];
  return row;
};

/** Схематичен ¹H ЯМР спектър: оста е обърната (от 11 към 0 ppm), височината на групата линии ∝ броя H. */
export default function NmrSpectrum({ title, signals }: { title: string; signals: NmrSignal[] }) {
  const X = (ppm: number) => X0 + ((PPM_MAX - ppm) / PPM_MAX) * (X1 - X0);
  const maxH = Math.max(...signals.map(s => s.h));
  return (
    <LabSvg viewBox="0 0 480 150" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
      <text x={X0} y={14} fontSize="11" fontWeight={600} className="fill-current">{title}</text>
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} className="stroke-gray-400" />
      {Array.from({ length: PPM_MAX + 1 }, (_, i) => PPM_MAX - i).map(p => (
        <g key={p}>
          <line x1={X(p)} y1={Y1} x2={X(p)} y2={Y1 + 4} className="stroke-gray-400" />
          <text x={X(p)} y={Y1 + 14} fontSize="9" textAnchor="middle" className="fill-gray-500">{p}</text>
        </g>
      ))}
      <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" className="fill-gray-500">химично отместване δ, ppm</text>
      {signals.map(s => {
        const heights = pascal(s.lines);
        const top = Math.max(...heights);
        const total = 62 * (s.h / maxH);
        return (
          <g key={s.ppm}>
            {heights.map((v, k) => {
              const x = X(s.ppm) + (k - (s.lines - 1) / 2) * 3.2;
              return <line key={k} x1={x} y1={Y1} x2={x} y2={Y1 - (total * v) / top} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={1.4} />;
            })}
            <text x={X(s.ppm)} y={Y1 - total - 18} fontSize="10" fontWeight={600} textAnchor="middle" className="fill-current">{s.group}</text>
            <text x={X(s.ppm)} y={Y1 - total - 6} fontSize="9" textAnchor="middle" className="fill-gray-500">
              {s.h}H, {s.split}
            </text>
          </g>
        );
      })}
    </LabSvg>
  );
}
