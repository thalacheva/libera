import { type Scale } from './Chart';
import { type Pt } from './classify';

const COLS = 44;
const ROWS = 26;

/** Оцветява полето [0; 10]² според вероятността за клас 1: червено над 0,5, синьо под; по-наситено – по-сигурно. */
export function Regions({ s, prob, soft = false }: { s: Scale; prob: (x: number, y: number) => number; soft?: boolean }) {
  const cw = (s.x1 - s.x0) / COLS;
  const ch = (s.y0 - s.y1) / ROWS;
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let q = 0; q < COLS; q++) {
      const p = prob(((q + 0.5) / COLS) * 10, (1 - (r + 0.5) / ROWS) * 10);
      const sure = soft ? 0.15 + 0.85 * Math.abs(p - 0.5) * 2 : 1;
      cells.push(
        <rect key={r * COLS + q} x={s.x0 + q * cw} y={s.y1 + r * ch} width={cw + 0.5} height={ch + 0.5} opacity={0.55 * sure} className={p > 0.5 ? 'fill-rose-300 dark:fill-rose-800' : p < 0.5 ? 'fill-blue-300 dark:fill-blue-800' : 'fill-gray-300 dark:fill-gray-600'} />
      );
    }
  return <>{cells}</>;
}

/** Точките на набора; сгрешените (според `prob`) са с черен контур. */
export function Points({ s, data, prob, r = 5 }: { s: Scale; data: Pt[]; prob?: (x: number, y: number) => number; r?: number }) {
  return (
    <>
      {data.map((p, i) => {
        const wrong = prob ? (prob(p.x, p.y) > 0.5 ? 1 : 0) !== p.c : false;
        return <circle key={i} cx={s.sx(p.x)} cy={s.sy(p.y)} r={r} className={p.c ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'} stroke={wrong ? 'black' : 'white'} strokeWidth={wrong ? 2.2 : 1.1} />;
      })}
    </>
  );
}
