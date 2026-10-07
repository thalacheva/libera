import { useId } from 'react';
import { type Line, wavelengthToRGB } from './light';

export const STRIP_MIN = 380;
export const STRIP_MAX = 720;

type Kind = 'continuous' | 'emission' | 'absorption';

/**
 * Спектър като в спектроскоп: дъга от цветове с ярки (емисионни)
 * или тъмни (абсорбционни) линии. Рисува се вътре в <svg>.
 */
export function SpectrumStrip({
  x,
  y,
  width,
  height,
  kind,
  lines = [],
  min = STRIP_MIN,
  max = STRIP_MAX,
  ticks = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: Kind;
  lines?: Line[];
  min?: number;
  max?: number;
  ticks?: boolean;
}) {
  const id = useId();
  const sx = (nm: number) => x + ((nm - min) / (max - min)) * width;
  const stops = [];
  for (let nm = min; nm <= max; nm += 10) {
    stops.push(<stop key={nm} offset={(nm - min) / (max - min)} stopColor={wavelengthToRGB(nm)} />);
  }
  const visible = lines.filter(l => l.nm >= min && l.nm <= max);

  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          {stops}
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={x} y={y} width={width} height={height} rx="3" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x} y={y} width={width} height={height} fill={kind === 'emission' ? '#05060a' : `url(#${id})`} />
        {visible.map(l => (
          <rect
            key={l.nm}
            x={sx(l.nm) - 1.5}
            y={y}
            width={3}
            height={height}
            fill={kind === 'emission' ? wavelengthToRGB(l.nm, 0.5) : '#05060a'}
            opacity={kind === 'emission' ? 0.35 + 0.65 * l.strength : 0.45 + 0.55 * l.strength}
          />
        ))}
      </g>
      <rect x={x} y={y} width={width} height={height} rx="3" fill="none" stroke="white" strokeOpacity="0.25" />
      {ticks &&
        [400, 450, 500, 550, 600, 650, 700].filter(nm => nm >= min && nm <= max).map(nm => (
          <g key={nm}>
            <line x1={sx(nm)} x2={sx(nm)} y1={y + height} y2={y + height + 4} stroke="white" strokeOpacity="0.5" />
            <text x={sx(nm)} y={y + height + 15} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {nm}
            </text>
          </g>
        ))}
    </g>
  );
}
