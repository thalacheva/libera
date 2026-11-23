import { type Scale } from '../models/Chart';
import { heat, loss, type Params } from './landscape';

const COLS = 46;
const ROWS = 24;

/** Релефът на загубата над правоъгълник от стойности на w и b, нарисуван с цвят. */
export default function Relief({ s, w, b, data, lo, hi }: { s: Scale; w: [number, number]; b: [number, number]; data: [number, number][]; lo: number; hi: number }) {
  const cw = (s.x1 - s.x0) / COLS;
  const ch = (s.y0 - s.y1) / ROWS;
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let q = 0; q < COLS; q++) {
      const p: Params = { w: w[0] + ((q + 0.5) / COLS) * (w[1] - w[0]), b: b[1] - ((r + 0.5) / ROWS) * (b[1] - b[0]) };
      cells.push(<rect key={r * COLS + q} x={s.x0 + q * cw} y={s.y1 + r * ch} width={cw + 0.6} height={ch + 0.6} fill={heat(loss(p, data), lo, hi)} />);
    }
  return <>{cells}</>;
}
