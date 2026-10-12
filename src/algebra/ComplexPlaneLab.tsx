import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotDot, PlotHandle, PlotLine } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { complexText } from './complexMath';

const OPS = [
  { id: 'add', name: 'z + w' },
  { id: 'sub', name: 'z − w' },
  { id: 'mul', name: 'z · w' },
  { id: 'conj', name: 'z̄' },
] as const;

const modulus = (p: Point) => Math.hypot(p.x, p.y);
const argDeg = (p: Point) => ((Math.atan2(p.y, p.x) * 180) / Math.PI + 360) % 360;

/** Комплексните числа като точки и вектори: сборът е събиране на вектори, произведението – завъртане и разтягане. */
export default function ComplexPlaneLab() {
  const [z, setZ] = useState<Point>({ x: 2, y: 1 });
  const [w, setW] = useState<Point>({ x: 1, y: 2 });
  const [op, setOp] = useState<(typeof OPS)[number]['id']>('add');

  const result: Point =
    op === 'add'
      ? { x: z.x + w.x, y: z.y + w.y }
      : op === 'sub'
        ? { x: z.x - w.x, y: z.y - w.y }
        : op === 'mul'
          ? { x: z.x * w.x - z.y * w.y, y: z.x * w.y + z.y * w.x }
          : { x: z.x, y: -z.y };
  const inside = Math.abs(result.x) < 8 && Math.abs(result.y) < 6;
  const usesW = op !== 'conj';
  const O = { x: 0, y: 0 };

  return (
    <Plot
      hint="Влачи точките z и w. Реалната част е по хоризонталната ос (x), имагинерната – по вертикалната (y). Сборът е като при векторите (успоредник), а при умножение модулите се умножават и ъглите се събират."
      readout={
        <>
          <Buttons>
            {OPS.map(o => (
              <DiagramButton key={o.id} active={o.id === op} onClick={() => setOp(o.id)}>
                {o.name}
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'z =', value: complexText(z), tone: 'blue' },
                ...(usesW ? [{ label: 'w =', value: complexText(w), tone: 'emerald' as const }] : []),
                { label: `${OPS.find(o => o.id === op)!.name} =`, value: complexText(result), tone: 'rose' },
              ]}
            />
          </div>
          {op === 'mul' ? (
            <Note tone="violet">
              |z| · |w| = {num(modulus(z))} · {num(modulus(w))} = {num(modulus(z) * modulus(w))}; ъгли: {num(argDeg(z), 0)}° + {num(argDeg(w), 0)}° ={' '}
              {num(argDeg(result), 0)}°{argDeg(z) + argDeg(w) >= 360 ? ' (+360°)' : ''}
            </Note>
          ) : op === 'conj' ? (
            <Note tone="violet">Спрегнатото число е огледалният образ спрямо реалната ос: z · z̄ = |z|² = {num(modulus(z) ** 2)}.</Note>
          ) : (
            <Note tone="violet">|z| = {num(modulus(z))} – разстоянието от z до 0.</Note>
          )}
          {!inside && <Note tone="amber">Резултатът е извън чертежа – приближи z и w до нулата.</Note>}
        </>
      }
    >
      {(op === 'add' || op === 'sub') && inside && (
        <>
          <PlotLine p={z} q={result} tone="gray" dashed width={1.5} />
          <PlotLine p={op === 'add' ? w : { x: -w.x, y: -w.y }} q={result} tone="gray" dashed width={1.5} />
        </>
      )}
      {op === 'sub' && <PlotArrow p={O} q={{ x: -w.x, y: -w.y }} tone="emerald" width={2} dashed />}
      {op === 'conj' && <PlotLine p={z} q={result} tone="gray" dashed width={1.5} />}
      {inside && <PlotArrow p={O} q={result} tone="rose" />}
      <PlotArrow p={O} q={z} tone="blue" />
      {usesW && <PlotArrow p={O} q={w} tone="emerald" />}
      {inside && <PlotDot p={result} tone="rose" r={6} />}
      <PlotHandle p={z} onMove={setZ} name="z" tone="blue" />
      {usesW && <PlotHandle p={w} onMove={setW} name="w" tone="emerald" />}
    </Plot>
  );
}
