import { Pause, Play, RotateCcw } from 'lucide-react';
import { type Point, type Tone, tones } from '~/geometry/diagramMath';
import { fmtNum } from './sim';

// Части за лабораториите по физика: бутони за симулацията и стрелки за сили и скорости.

/** Бутони „Пусни/Спри“ и „Отначало“, по желание с часовник. */
export function SimControls({
  running,
  onToggle,
  onReset,
  time,
}: {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  time?: number;
}) {
  const button =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 transition-colors';
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
      <button onClick={onToggle} className={button}>
        {running ? <Pause size={16} /> : <Play size={16} />}
        {running ? 'Спри' : 'Пусни'}
      </button>
      <button onClick={onReset} className={button}>
        <RotateCcw size={16} /> Отначало
      </button>
      {time !== undefined && <span className="font-mono text-sm text-gray-600 dark:text-gray-300 w-20 text-right">t = {fmtNum(time, 1)} s</span>}
    </div>
  );
}

/** Стрелка в координатите на SVG – за сили, скорости и ускорения. */
export function Arrow({ from, to, tone = 'blue', width = 3, label }: { from: Point; to: Point; tone?: Tone; width?: number; label?: string }) {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  if (len < 1) return null;
  const u = { x: (to.x - from.x) / len, y: (to.y - from.y) / len };
  const head = Math.min(12, len * 0.6);
  const base = { x: to.x - u.x * head, y: to.y - u.y * head };
  const side = { x: -u.y * head * 0.45, y: u.x * head * 0.45 };
  return (
    <g>
      <line x1={from.x} y1={from.y} x2={base.x} y2={base.y} className={tones[tone].stroke} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${to.x},${to.y} ${base.x + side.x},${base.y + side.y} ${base.x - side.x},${base.y - side.y}`} className={tones[tone].fill} />
      {label && (
        <text
          x={to.x + u.x * 12}
          y={to.y + u.y * 12}
          fontSize={14}
          fontWeight={600}
          fontStyle="italic"
          textAnchor="middle"
          dominantBaseline="central"
          className={tones[tone].label}
        >
          {label}
        </text>
      )}
    </g>
  );
}
