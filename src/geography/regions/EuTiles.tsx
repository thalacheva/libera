import { type Country } from './euData';

const TILE = 46;
const GAP = 3;
const tileXY = (c: Country, x0: number, y0: number) => ({ x: x0 + c.c * (TILE + GAP), y: y0 + c.r * (TILE + GAP) });

/** Схематична карта на Европа: всяка страна е квадратче на приблизителното си място (без мащаб и форма). */
export default function EuTiles({
  countries,
  x0,
  y0,
  fill,
  sub,
  onClick,
}: {
  countries: Country[];
  x0: number;
  y0: number;
  /** клас за цвета на квадратчето */
  fill: (c: Country) => string;
  /** малък надпис под кода */
  sub?: (c: Country) => string;
  onClick?: (c: Country) => void;
}) {
  return (
    <g>
      {countries.map(c => {
        const { x, y } = tileXY(c, x0, y0);
        return (
          <g key={c.code} className={onClick ? 'cursor-pointer' : undefined} onClick={onClick ? () => onClick(c) : undefined}>
            <title>{c.name}</title>
            <rect x={x} y={y} width={TILE} height={TILE} rx={6} className={fill(c)} strokeWidth="1" />
            <text x={x + TILE / 2} y={y + (sub ? 20 : 28)} fontSize="13" textAnchor="middle" className="fill-gray-900 dark:fill-gray-50 font-semibold pointer-events-none">
              {c.code}
            </text>
            {sub && (
              <text x={x + TILE / 2} y={y + 36} fontSize="9.5" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200 pointer-events-none">
                {sub(c)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
