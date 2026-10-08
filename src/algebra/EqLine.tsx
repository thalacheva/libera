import { Curve, PlotLine } from '~/functions/plot';
import { type Tone } from '~/geometry/diagramMath';
import { type Eq } from './systemMath';

/** Правата ax + by = c в <Plot>; вертикалните прави (b = 0) също се чертаят. */
export function EqLine({ eq, tone, dashed = false, width = 3 }: { eq: Eq; tone: Tone; dashed?: boolean; width?: number }) {
  const { a, b, c } = eq;
  if (b !== 0) return <Curve f={x => (c - a * x) / b} tone={tone} dashed={dashed} width={width} />;
  if (a === 0) return null;
  const x = c / a;
  return <PlotLine p={{ x, y: -100 }} q={{ x, y: 100 }} tone={tone} dashed={dashed} width={width} />;
}
