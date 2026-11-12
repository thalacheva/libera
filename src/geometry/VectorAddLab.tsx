import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotHandle, PlotLabel, PlotLine } from '~/functions/plot';
import { MathText, Tex } from '~/MathText';
import { Buttons, DiagramButton, Formula, Note } from './diagram';
import { Point } from './diagramMath';

type Mode = 'triangle' | 'parallelogram' | 'difference';
const O = { x: 0, y: 0 };
const add = (p: Point, q: Point) => ({ x: p.x + q.x, y: p.y + q.y });
const sub = (p: Point, q: Point) => ({ x: p.x - q.x, y: p.y - q.y });
const vec = (v: Point) => `(${num(v.x)};\\ ${num(v.y)})`;

/** Събиране и изваждане на вектори – правило на триъгълника и на успоредника. */
export function VectorAddLab() {
  const [a, setA] = useState<Point>({ x: 4, y: 1 });
  const [b, setB] = useState<Point>({ x: 1, y: 3 });
  const [mode, setMode] = useState<Mode>('triangle');
  const s = add(a, b);
  const d = sub(a, b);

  return (
    <Plot
      x={[-8, 8]}
      y={[-6, 6]}
      hint="Влачи краищата на векторите $\vec{a}$ и $\vec{b}$. Координатите на сбора са сборовете на координатите: събирането „поставя“ $\vec{b}$ в края на $\vec{a}$."
      readout={
        <>
          <Buttons>
            <DiagramButton active={mode === 'triangle'} onClick={() => setMode('triangle')}>
              правило на триъгълника
            </DiagramButton>
            <DiagramButton active={mode === 'parallelogram'} onClick={() => setMode('parallelogram')}>
              правило на успоредника
            </DiagramButton>
            <DiagramButton active={mode === 'difference'} onClick={() => setMode('difference')}>
              разлика <Tex>{'\\vec{a} - \\vec{b}'}</Tex>
            </DiagramButton>
          </Buttons>
          {mode === 'difference' ? (
            <>
              <Formula>
                <Tex>{`\\vec{a} - \\vec{b} = ${vec(a)} - ${vec(b)} = ${vec(d)}`}</Tex>
              </Formula>
              <Note tone="amber">
                <MathText>{'$\\vec{a} - \\vec{b}$ е векторът от края на $\\vec{b}$ до края на $\\vec{a}$: $\\vec{b} + (\\vec{a} - \\vec{b}) = \\vec{a}$.'}</MathText>
              </Note>
            </>
          ) : (
            <>
              <Formula>
                <Tex>{`\\vec{a} + \\vec{b} = ${vec(a)} + ${vec(b)} = ${vec(s)}`}</Tex>
              </Formula>
              <Note tone="emerald">
                <MathText>
                  {mode === 'triangle'
                    ? 'Слагаме началото на $\\vec{b}$ в края на $\\vec{a}$; сборът е от началото на $\\vec{a}$ до края на $\\vec{b}$.'
                    : 'Двата вектора от обща точка са страни на успоредник; сборът е неговият диагонал.'}
                </MathText>
              </Note>
            </>
          )}
          <Formula>
            <Tex>
              {`|\\vec{a}| = ${num(Math.hypot(a.x, a.y))},\\ |\\vec{b}| = ${num(Math.hypot(b.x, b.y))},\\ |\\vec{a} ${mode === 'difference' ? '-' : '+'} \\vec{b}| = ${num(
                mode === 'difference' ? Math.hypot(d.x, d.y) : Math.hypot(s.x, s.y),
              )}`}
            </Tex>
          </Formula>
        </>
      }
    >
      {mode === 'triangle' && (
        <>
          <PlotArrow p={a} q={s} tone="rose" dashed />
          <PlotArrow p={O} q={s} tone="emerald" width={3.5} />
          <PlotLabel p={s} dx={12} dy={-8} anchor="start" tone="emerald" size={14} vec>
            a + b
          </PlotLabel>
        </>
      )}
      {mode === 'parallelogram' && (
        <>
          <PlotLine p={a} q={s} tone="gray" dashed />
          <PlotLine p={b} q={s} tone="gray" dashed />
          <PlotArrow p={O} q={s} tone="emerald" width={3.5} />
          <PlotLabel p={s} dx={12} dy={-8} anchor="start" tone="emerald" size={14} vec>
            a + b
          </PlotLabel>
        </>
      )}
      {mode === 'difference' && (
        <>
          <PlotArrow p={b} q={a} tone="amber" width={3.5} />
          <PlotLabel p={{ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }} dx={10} dy={-8} anchor="start" tone="amber" size={14} vec>
            a − b
          </PlotLabel>
        </>
      )}
      <PlotArrow p={O} q={a} tone="blue" />
      <PlotArrow p={O} q={b} tone="rose" />
      <PlotLabel p={{ x: a.x / 2, y: a.y / 2 }} dx={8} dy={16} anchor="start" tone="blue" size={15} vec>
        a
      </PlotLabel>
      <PlotLabel p={{ x: b.x / 2, y: b.y / 2 }} dx={-10} dy={-4} anchor="end" tone="rose" size={15} vec>
        b
      </PlotLabel>
      <PlotHandle p={a} onMove={setA} name="край на a" tone="blue" />
      <PlotHandle p={b} onMove={setB} name="край на b" tone="rose" />
    </Plot>
  );
}
