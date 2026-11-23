import { type ComponentProps, type ReactNode, useId } from 'react';
import LabSvg from '~/LabSvg';

export type Scale = { sx: (v: number) => number; sy: (v: number) => number; x0: number; x1: number; y0: number; y1: number; /** clipPath на полето на графиката: clipPath={s.clip} */ clip: string };

const W = 640;

/**
 * Графика с две оси с различен мащаб (за разлика от Plot, където мащабът е еднакъв).
 * Съдържанието се рисува от функция, която получава преобразуванията sx и sy.
 */
export default function Chart({
  x,
  y,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  height = 320,
  tick = v => String(v).replace('.', ','),
  yTick,
  children,
  ...svgProps
}: {
  x: [number, number];
  y: [number, number];
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  height?: number;
  tick?: (v: number) => string;
  /** Отделен формат за надписите по вертикалната ос (по подразбиране – като tick). */
  yTick?: (v: number) => string;
  children: (s: Scale) => ReactNode;
} & Omit<ComponentProps<'svg'>, 'children' | 'x' | 'y' | 'height'>) {
  const pad = { l: 56, r: 14, t: 12, b: 44 };
  const clipId = useId();
  const scale: Scale = {
    clip: `url(#${clipId})`,
    x0: pad.l,
    x1: W - pad.r,
    y0: height - pad.b,
    y1: pad.t,
    sx: v => pad.l + ((v - x[0]) / (x[1] - x[0])) * (W - pad.l - pad.r),
    sy: v => height - pad.b - ((v - y[0]) / (y[1] - y[0])) * (height - pad.t - pad.b),
  };
  const { sx, sy } = scale;
  return (
    <LabSvg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100" {...svgProps}>
      <rect x={scale.x0} y={scale.y1} width={scale.x1 - scale.x0} height={scale.y0 - scale.y1} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" />
      {xTicks.map(v => (
        <g key={`x${v}`}>
          <line x1={sx(v)} y1={scale.y0} x2={sx(v)} y2={scale.y1} className="stroke-gray-300/70 dark:stroke-gray-600/70" />
          <text x={sx(v)} y={scale.y0 + 16} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {tick(v)}
          </text>
        </g>
      ))}
      {yTicks.map(v => (
        <g key={`y${v}`}>
          <line x1={scale.x0} y1={sy(v)} x2={scale.x1} y2={sy(v)} className="stroke-gray-300/70 dark:stroke-gray-600/70" />
          <text x={scale.x0 - 7} y={sy(v) + 4} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
            {(yTick ?? tick)(v)}
          </text>
        </g>
      ))}
      <text x={(scale.x0 + scale.x1) / 2} y={height - 8} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {xLabel}
      </text>
      <text x={15} y={(scale.y0 + scale.y1) / 2} fontSize="13" textAnchor="middle" transform={`rotate(-90 15 ${(scale.y0 + scale.y1) / 2})`} className="fill-gray-700 dark:fill-gray-200">
        {yLabel}
      </text>
      <clipPath id={clipId}>
        <rect x={scale.x0} y={scale.y1} width={scale.x1 - scale.x0} height={scale.y0 - scale.y1} />
      </clipPath>
      {children(scale)}
    </LabSvg>
  );
}

/** Отсечката от правата y = w·x + b между x = a и x = c. */
export function LineSegment({ s, w, b, from, to, className, dashed = false, width = 2.5 }: { s: Scale; w: number; b: number; from: number; to: number; className: string; dashed?: boolean; width?: number }) {
  return <line x1={s.sx(from)} y1={s.sy(w * from + b)} x2={s.sx(to)} y2={s.sy(w * to + b)} className={className} strokeWidth={width} strokeDasharray={dashed ? '7 5' : undefined} clipPath={s.clip} />;
}
