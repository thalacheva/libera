import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotDot, PlotHandle, PlotLabel, PlotLine } from '~/functions/plot';
import { Formula, Note, Readout } from '~/geometry/diagram';
import { type Point } from '~/geometry/diagramMath';

const O = { x: 0, y: 0 };
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

/** Коши–Буняковски за два вектора: (u₁v₁ + u₂v₂)² ≤ (u₁² + u₂²)(v₁² + v₂²); равенство при успоредни вектори. */
export function CauchySchwarzLab() {
  const [u, setU] = useState<Point>({ x: 4, y: 1 });
  const [v, setV] = useState<Point>({ x: 2, y: 3 });

  const dot = u.x * v.x + u.y * v.y;
  const uu = u.x * u.x + u.y * u.y;
  const vv = v.x * v.x + v.y * v.y;
  const ok = uu > 0 && vv > 0;
  const cross = u.x * v.y - u.y * v.x;
  const parallel = ok && cross === 0;
  // Проекцията на v върху правата на u
  const t = ok ? dot / uu : 0;
  const P = { x: t * u.x, y: t * u.y };

  return (
    <Plot
      x={[-8, 8]}
      y={[-6, 6]}
      hint="Влачи краищата на векторите. Лявата страна е квадратът на скаларното произведение, дясната – произведението на квадратите на дължините. Разликата им е точно (u₁v₂ − u₂v₁)² – квадратът на лицето на успоредника, построен върху векторите. Затова равенство има само когато векторите лежат на една права."
      readout={
        ok ? (
          <>
            <Readout
              items={[
                { label: 'u =', value: `(${num(u.x)}; ${num(u.y)})`, tone: 'blue' },
                { label: 'v =', value: `(${num(v.x)}; ${num(v.y)})`, tone: 'rose' },
                { label: '(u·v)² =', value: num(dot * dot), tone: 'amber' },
                { label: '|u|²·|v|² =', value: num(uu * vv), tone: 'violet' },
              ]}
            />
            <Formula>
              ({num(u.x)} · {par(v.x)} + {par(u.y)} · {par(v.y)})² = {num(dot * dot)} ≤ ({num(u.x * u.x)} + {num(u.y * u.y)}) · ({num(v.x * v.x)} +{' '}
              {num(v.y * v.y)}) = {num(uu * vv)}
            </Formula>
            <Note tone={parallel ? 'emerald' : 'blue'}>
              {parallel
                ? 'Векторите са успоредни – имаме равенство!'
                : `Разлика ${num(uu * vv - dot * dot)} = (${num(u.x)} · ${par(v.y)} − ${par(u.y)} · ${par(v.x)})² = ${num(cross)}²`}
            </Note>
          </>
        ) : (
          <Note tone="gray">Нулевият вектор дава 0 ≤ 0 – тривиално равенство.</Note>
        )
      }
    >
      {ok && (
        <>
          <PlotLine p={{ x: -8 * u.x, y: -8 * u.y }} q={{ x: 8 * u.x, y: 8 * u.y }} tone="gray" width={1} dashed />
          <PlotLine p={v} q={P} tone="gray" width={1.5} dashed />
          {/* Успоредникът върху u и v – лицето му е |u₁v₂ − u₂v₁| */}
          <PlotLine p={u} q={{ x: u.x + v.x, y: u.y + v.y }} tone="violet" width={1} dashed />
          <PlotLine p={v} q={{ x: u.x + v.x, y: u.y + v.y }} tone="violet" width={1} dashed />
        </>
      )}
      <PlotArrow p={O} q={u} tone="blue" width={3.5} />
      <PlotArrow p={O} q={v} tone="rose" width={3.5} />
      {ok && (
        <>
          <PlotLine p={O} q={P} tone="amber" width={5} />
          <PlotDot p={P} tone="amber" r={4} />
        </>
      )}
      <PlotLabel p={u} dx={10} dy={-10} anchor="start" tone="blue" size={15}>
        u
      </PlotLabel>
      <PlotLabel p={v} dx={10} dy={-10} anchor="start" tone="rose" size={15}>
        v
      </PlotLabel>
      <PlotHandle p={u} onMove={setU} name="край на u" tone="blue" />
      <PlotHandle p={v} onMove={setV} name="край на v" tone="rose" />
    </Plot>
  );
}
