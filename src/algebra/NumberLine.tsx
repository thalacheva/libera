import { num } from '~/functions/functionMath';
import { type Piece } from './intervals';

// Числова ос с отбелязани интервали – решенията на неравенства.

export type Mark = { x: number; label: string; tone?: 'rose' | 'violet' | 'gray' };

const W = 600;
const PAD = 24;
const AXIS_Y = 44;

const markColor = {
  rose: 'fill-rose-600 dark:fill-rose-400',
  violet: 'fill-violet-600 dark:fill-violet-400',
  gray: 'fill-gray-600 dark:fill-gray-300',
};

export function NumberLine({
  pieces,
  range = [-8, 8],
  marks = [],
  probe,
  children,
}: {
  pieces: Piece[];
  range?: [number, number];
  marks?: Mark[];
  /** Пробна точка: зелена, ако е решение, червена – ако не е. */
  probe?: { x: number; ok: boolean };
  /** Допълнителни елементи, които получават функцията за мащаба. */
  children?: (X: (v: number) => number) => React.ReactNode;
}) {
  const [lo, hi] = range;
  const X = (v: number) => PAD + ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (W - 2 * PAD);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const every = hi - lo > 12 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} 80`} className="w-full h-auto text-gray-700 dark:text-gray-300">
      {children?.(X)}
      <line x1={PAD - 12} x2={W - PAD + 6} y1={AXIS_Y} y2={AXIS_Y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
      <path d={`M ${W - PAD + 14} ${AXIS_Y} l -9 -4.5 v 9 z`} className="fill-gray-400 dark:fill-gray-500" />
      {ticks.map(t => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={AXIS_Y - 4} y2={AXIS_Y + 4} className="stroke-gray-400 dark:stroke-gray-500" />
          {t % every === 0 && (
            <text x={X(t)} y={AXIS_Y + 22} fontSize="13" textAnchor="middle" fill="currentColor" opacity="0.7">
              {num(t)}
            </text>
          )}
        </g>
      ))}

      {pieces.map((p, i) => {
        const x1 = X(p.from);
        const x2 = X(p.to);
        return (
          <g key={i}>
            {p.from !== p.to && <line x1={x1} x2={x2} y1={AXIS_Y} y2={AXIS_Y} className="stroke-emerald-500" strokeWidth="7" strokeLinecap="butt" />}
            {p.from === -Infinity && <path d={`M ${x1 - 10} ${AXIS_Y} l 10 -7 v 14 z`} className="fill-emerald-500" />}
            {p.to === Infinity && <path d={`M ${x2 + 10} ${AXIS_Y} l -10 -7 v 14 z`} className="fill-emerald-500" />}
            {Number.isFinite(p.from) && <End x={x1} closed={p.fromClosed} />}
            {Number.isFinite(p.to) && p.to !== p.from && <End x={x2} closed={p.toClosed} />}
          </g>
        );
      })}

      {marks.map(m => (
        <text key={m.label + m.x} x={X(m.x)} y={AXIS_Y - 14} fontSize="13" fontWeight="700" textAnchor="middle" className={markColor[m.tone ?? 'gray']}>
          {m.label}
        </text>
      ))}

      {probe && (
        <path
          d={`M ${X(probe.x)} ${AXIS_Y - 9} l -7 -12 h 14 z`}
          className={probe.ok ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-red-500'}
        />
      )}
    </svg>
  );
}

function End({ x, closed }: { x: number; closed: boolean }) {
  return (
    <circle
      cx={x}
      cy={AXIS_Y}
      r={6.5}
      className={closed ? 'fill-emerald-600 stroke-emerald-600' : 'fill-white dark:fill-gray-800 stroke-emerald-600'}
      strokeWidth="2.5"
    />
  );
}
