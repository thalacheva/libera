import { N } from './vision';

/** Картинка 12 × 12 в сиви тонове (0 – бяло, 1 – черно), нарисувана в SVG с горен ляв ъгъл (x, y). */
export function Pixels({ x, y, cell, values, title }: { x: number; y: number; cell: number; values: number[]; title: string }) {
  return (
    <g>
      <text x={x + (N * cell) / 2} y={y - 8} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {title}
      </text>
      {values.map((v, i) => {
        const g = Math.round(255 * (1 - Math.min(1, Math.max(0, v))));
        return <rect key={i} x={x + (i % N) * cell} y={y + Math.floor(i / N) * cell} width={cell + 0.4} height={cell + 0.4} fill={`rgb(${g},${g},${g})`} />;
      })}
      <rect x={x} y={y} width={N * cell} height={N * cell} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
    </g>
  );
}

/** Карта 12 × 12 със знак: червено – положително, синьо – отрицателно; наситеността е |v| / max. */
export function SignedMap({ x, y, cell, values, max, title }: { x: number; y: number; cell: number; values: number[]; max: number; title: string }) {
  return (
    <g>
      <text x={x + (N * cell) / 2} y={y - 8} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {title}
      </text>
      <rect x={x} y={y} width={N * cell} height={N * cell} fill="white" />
      {values.map((v, i) => (
        <rect key={i} x={x + (i % N) * cell} y={y + Math.floor(i / N) * cell} width={cell + 0.4} height={cell + 0.4} fill={v >= 0 ? '#e11d48' : '#2563eb'} opacity={Math.min(1, Math.abs(v) / max)} />
      ))}
      <rect x={x} y={y} width={N * cell} height={N * cell} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
    </g>
  );
}
