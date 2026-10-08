import { useState } from 'react';
import { fmtEq } from '~/algebra/systemMath';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotHandle, PlotLabel, PlotLine } from '~/functions/plot';
import { Formula, Note } from './diagram';
import { Point } from './diagramMath';

const O = { x: 0, y: 0 };
const vec = (v: Point) => `(${num(v.x)}; ${num(v.y)})`;

/** x·a + y·b без нулеви членове и излишни единици. */
function combo(x: number, y: number) {
  const r = (k: number) => Math.round(k * 100) / 100;
  let s = '';
  for (const [k, name] of [[r(x), 'a'], [r(y), 'b']] as const) {
    if (k === 0) continue;
    const abs = Math.abs(k);
    const body = `${abs === 1 ? '' : num(abs)}${name}`;
    s += s === '' ? (k < 0 ? `−${body}` : body) : k < 0 ? ` − ${body}` : ` + ${body}`;
  }
  return s || '0';
}

/** Разлагане на вектор c по два неколинеарни вектора: c = x·a + y·b. */
export function DecomposeLab() {
  const [a, setA] = useState<Point>({ x: 2, y: 1 });
  const [b, setB] = useState<Point>({ x: -1, y: 2 });
  const [c, setC] = useState<Point>({ x: 3, y: 4 });

  // x·a + y·b = c – система с две неизвестни, решена по Крамер
  const D = a.x * b.y - b.x * a.y;
  const x = D !== 0 ? (c.x * b.y - b.x * c.y) / D : NaN;
  const y = D !== 0 ? (a.x * c.y - c.x * a.y) / D : NaN;
  const xa = { x: x * a.x, y: x * a.y };
  const yb = { x: y * b.x, y: y * b.y };

  return (
    <Plot
      x={[-8, 8]}
      y={[-6, 6]}
      hint="Влачи c (зелено), а също a и b. През края на c прекарваме прави, успоредни на a и b – така се получава успоредник, чиито страни са x·a и y·b."
      readout={
        D === 0 ? (
          <Note tone="rose">a и b са колинеарни – с тях можем да получим само вектори по една права. Раздели ги!</Note>
        ) : (
          <>
            <Formula>
              {vec(c)} = x · {vec(a)} + y · {vec(b)}
            </Formula>
            <Formula>
              {fmtEq({ a: a.x, b: b.x, c: c.x })}; &nbsp; {fmtEq({ a: a.y, b: b.y, c: c.y })}
            </Formula>
            <Note tone="emerald">
              x = {num(x)}, y = {num(y)} ⇒ c = {combo(x, y)}
            </Note>
          </>
        )
      }
    >
      {D !== 0 && (
        <>
          <PlotLine p={O} q={yb} tone="gray" dashed width={1.5} />
          <PlotLine p={yb} q={c} tone="gray" dashed width={1.5} />
          <PlotArrow p={O} q={xa} tone="blue" width={2} dashed />
          <PlotArrow p={xa} q={c} tone="rose" width={2} dashed />
          <PlotLabel p={xa} dx={8} dy={16} anchor="start" tone="blue" size={13}>
            {`${num(x)}·a`}
          </PlotLabel>
          <PlotLabel p={{ x: (xa.x + c.x) / 2, y: (xa.y + c.y) / 2 }} dx={10} anchor="start" tone="rose" size={13}>
            {`${num(y)}·b`}
          </PlotLabel>
        </>
      )}
      <PlotArrow p={O} q={a} tone="blue" width={3.5} />
      <PlotArrow p={O} q={b} tone="rose" width={3.5} />
      <PlotArrow p={O} q={c} tone="emerald" width={3.5} />
      <PlotLabel p={a} dx={10} dy={-10} anchor="start" tone="blue" size={15}>
        a
      </PlotLabel>
      <PlotLabel p={b} dx={-10} dy={-10} anchor="end" tone="rose" size={15}>
        b
      </PlotLabel>
      <PlotLabel p={c} dx={10} dy={-10} anchor="start" tone="emerald" size={15}>
        c
      </PlotLabel>
      <PlotHandle p={a} onMove={setA} name="край на a" tone="blue" />
      <PlotHandle p={b} onMove={setB} name="край на b" tone="rose" />
      <PlotHandle p={c} onMove={setC} name="край на c" tone="emerald" />
    </Plot>
  );
}
