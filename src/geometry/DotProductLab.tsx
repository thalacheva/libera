import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotDot, PlotHandle, PlotLabel, PlotLine, PlotPolyline } from '~/functions/plot';
import { Formula, Note, Readout } from './diagram';
import { Point } from './diagramMath';

const O = { x: 0, y: 0 };
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

/** Скаларно произведение: в координати и чрез ъгъла; проекция на b върху a. */
export function DotProductLab() {
  const [a, setA] = useState<Point>({ x: 5, y: 1 });
  const [b, setB] = useState<Point>({ x: 2, y: 4 });

  const dot = a.x * b.x + a.y * b.y;
  const la = Math.hypot(a.x, a.y);
  const lb = Math.hypot(b.x, b.y);
  const ok = la > 0 && lb > 0;
  const cos = ok ? dot / (la * lb) : 0;
  const phi = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  // Проекцията на края на b върху правата на a
  const t = ok ? dot / (la * la) : 0;
  const P = { x: t * a.x, y: t * a.y };

  // Дъга за ъгъла между векторите
  const t1 = Math.atan2(a.y, a.x);
  let t2 = Math.atan2(b.y, b.x);
  if (t2 - t1 > Math.PI) t2 -= 2 * Math.PI;
  if (t1 - t2 > Math.PI) t2 += 2 * Math.PI;
  const arc = Array.from({ length: 31 }, (_, i) => {
    const th = t1 + ((t2 - t1) * i) / 30;
    return { x: 0.8 * Math.cos(th), y: 0.8 * Math.sin(th) };
  });

  const kind = dot === 0 ? 'right' : dot > 0 ? 'acute' : 'obtuse';

  return (
    <Plot
      x={[-8, 8]}
      y={[-6, 6]}
      hint="Скаларното произведение е число, а не вектор. То е |a| по проекцията на b върху a (със знак) – положително при остър ъгъл, нула при прав и отрицателно при тъп."
      readout={
        ok ? (
          <>
            <Readout
              items={[
                { label: 'a =', value: `(${num(a.x)}; ${num(a.y)})`, tone: 'blue' },
                { label: 'b =', value: `(${num(b.x)}; ${num(b.y)})`, tone: 'rose' },
                { label: 'φ ≈', value: `${num(phi, 1)}°`, tone: 'amber' },
              ]}
            />
            <Formula>
              a · b = {num(a.x)} · {par(b.x)} + {par(a.y)} · {par(b.y)} = <span className="font-bold">{num(dot)}</span>
            </Formula>
            <Formula>
              |a| · |b| · cos φ = {num(la)} · {num(lb)} · {num(cos, 3)} = {num(la * lb * cos)}
            </Formula>
            <Note tone={kind === 'right' ? 'emerald' : kind === 'acute' ? 'blue' : 'rose'}>
              {kind === 'right' ? 'a · b = 0 ⇒ векторите са перпендикулярни!' : kind === 'acute' ? 'a · b > 0 ⇒ ъгълът е остър' : 'a · b < 0 ⇒ ъгълът е тъп'}
            </Note>
          </>
        ) : (
          <Note tone="gray">Нулевият вектор няма посока – ъгълът не е определен.</Note>
        )
      }
    >
      {ok && (
        <>
          <PlotLine p={{ x: -8 * a.x, y: -8 * a.y }} q={{ x: 8 * a.x, y: 8 * a.y }} tone="gray" width={1} dashed />
          <PlotLine p={b} q={P} tone="gray" width={1.5} dashed />
          <PlotPolyline points={arc} tone="amber" width={2} />
        </>
      )}
      <PlotArrow p={O} q={a} tone="blue" width={3.5} />
      <PlotArrow p={O} q={b} tone="rose" width={3.5} />
      {/* Проекцията на b върху a – над стрелките, за да се вижда */}
      {ok && (
        <>
          <PlotLine p={O} q={P} tone="amber" width={5} />
          <PlotDot p={P} tone="amber" r={4} />
        </>
      )}
      <PlotLabel p={a} dx={10} dy={-10} anchor="start" tone="blue" size={15}>
        a
      </PlotLabel>
      <PlotLabel p={b} dx={10} dy={-10} anchor="start" tone="rose" size={15}>
        b
      </PlotLabel>
      <PlotHandle p={a} onMove={setA} name="край на a" tone="blue" />
      <PlotHandle p={b} onMove={setB} name="край на b" tone="rose" />
    </Plot>
  );
}
