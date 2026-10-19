// Знаците в механизмите: извити стрелки (двойка или един електрон), несвързани електронни двойки и радикалови точки.

type P = { x: number; y: number };

/**
 * Извита стрелка от from към to. bend > 0 извива наляво от посоката на движение (в SVG – нагоре при движение надясно).
 * half – „въдица“ с една кукичка: премества се един електрон (радикалови реакции).
 */
export function CurlyArrow({ from, to, bend = 1, half = false, startGap = 3, endGap = 9, className = 'stroke-rose-600 dark:stroke-rose-400' }: { from: P; to: P; bend?: number; half?: boolean; startGap?: number; endGap?: number; className?: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / d, dy / d];
  const a = { x: from.x + ux * startGap, y: from.y + uy * startGap };
  const b = { x: to.x - ux * endGap, y: to.y - uy * endGap };
  const c = { x: (a.x + b.x) / 2 + uy * bend * d * 0.45, y: (a.y + b.y) / 2 - ux * bend * d * 0.45 };
  // Посоката на стрелката в края – по допирателната
  const tx = b.x - c.x;
  const ty = b.y - c.y;
  const tl = Math.hypot(tx, ty) || 1;
  const [vx, vy] = [tx / tl, ty / tl];
  const s = 7;
  const left = { x: b.x - vx * s + vy * s * 0.5, y: b.y - vy * s - vx * s * 0.5 };
  const right = { x: b.x - vx * s - vy * s * 0.5, y: b.y - vy * s + vx * s * 0.5 };
  // Кукичката на „въдицата“ е от външната страна на дъгата
  const barb = bend >= 0 ? left : right;
  return (
    <g className={className} fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`} />
      {half ? <path d={`M ${b.x} ${b.y} L ${barb.x} ${barb.y}`} /> : <path d={`M ${left.x} ${left.y} L ${b.x} ${b.y} L ${right.x} ${right.y} Z`} className={className.replace(/stroke-/g, 'fill-')} />}
    </g>
  );
}

/** Несвързана електронна двойка на разстояние r от центъра на атома в посока angle (градуси, 0 – надясно, 90 – надолу). */
export function LonePair({ at, angle, r = 11 }: { at: P; angle: number; r?: number }) {
  const t = (angle * Math.PI) / 180;
  const [cx, cy] = [at.x + r * Math.cos(t), at.y + r * Math.sin(t)];
  const [px, py] = [-Math.sin(t) * 2.6, Math.cos(t) * 2.6];
  return (
    <g className="fill-current">
      <circle cx={cx + px} cy={cy + py} r={1.6} />
      <circle cx={cx - px} cy={cy - py} r={1.6} />
    </g>
  );
}

/** Несдвоен електрон (радикал). */
export function RadicalDot({ at, angle = 0, r = 12 }: { at: P; angle?: number; r?: number }) {
  const t = (angle * Math.PI) / 180;
  return <circle cx={at.x + r * Math.cos(t)} cy={at.y + r * Math.sin(t)} r={2.2} className="fill-current" />;
}
