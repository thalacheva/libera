import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import { Point } from '~/geometry/diagramMath';
import { num, point, polynomial } from './functionMath';
import { Curve, Plot, PlotDot, PlotHandle, PlotLabel, PlotLine, Slider, Sliders } from './plot';

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Δy/Δx като несъкратима дроб: „4/3“, „−2“, „0“. */
function fraction(dy: number, dx: number) {
  const sign = dy * dx < 0 ? '−' : '';
  const g = gcd(dy, dx) || 1;
  const p = Math.abs(dy / g);
  const q = Math.abs(dx / g);
  return q === 1 ? `${sign}${p}` : `${sign}${p}/${q}`;
}

const presets: { label: string; A: Point; B: Point }[] = [
  { label: 'Растяща', A: { x: -2, y: -3 }, B: { x: 2, y: 3 } },
  { label: 'Намаляваща', A: { x: -3, y: 2 }, B: { x: 1, y: -2 } },
  { label: 'Константна', A: { x: -3, y: 2 }, B: { x: 3, y: 2 } },
  { label: 'През началото', A: { x: 0, y: 0 }, B: { x: 3, y: 2 } },
];

/** Права през две точки, които се влачат – с правоъгълния триъгълник на наклона. */
export function InteractiveLinearGrapher() {
  const [A, setA] = useState<Point>({ x: -2, y: -1 });
  const [B, setB] = useState<Point>({ x: 2, y: 5 });

  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const a = dy / dx;
  const b = A.y - a * A.x;
  const f = (x: number) => a * x + b;
  const root = a !== 0 ? -b / a : null;

  // Двете точки не бива да лежат на една вертикала – тогава няма функция
  const moveA = (p: Point) => p.x !== B.x && setA(p);
  const moveB = (p: Point) => p.x !== A.x && setB(p);

  const corner = { x: B.x, y: A.y };

  return (
    <Plot
      hint="Влачи точките A и B. Правата през тях е графиката на функцията. Наклонът a показва с колко се променя y, когато x нарасне с 1."
      readout={
        <>
          <Readout
            items={[
              { label: 'Δx =', value: num(dx), tone: 'amber' },
              { label: 'Δy =', value: num(dy), tone: 'violet' },
              { label: 'a = Δy/Δx =', value: fraction(dy, dx), tone: 'blue' },
              { label: 'b =', value: num(b), tone: 'emerald' },
            ]}
          />
          <Formula>f(x) = {polynomial([a, b])}</Formula>
          <Note tone={a > 0 ? 'emerald' : a < 0 ? 'rose' : 'gray'}>
            {a > 0 && '↗ a > 0 – функцията е растяща'}
            {a < 0 && '↘ a < 0 – функцията е намаляваща'}
            {a === 0 && '→ a = 0 – функцията е константна, графиката е успоредна на оста Ox'}
          </Note>
          <Buttons>
            {presets.map(p => (
              <DiagramButton
                key={p.label}
                onClick={() => {
                  setA(p.A);
                  setB(p.B);
                }}
              >
                {p.label}
              </DiagramButton>
            ))}
          </Buttons>
        </>
      }
    >
      <Curve f={f} />

      {/* Триъгълник на наклона: Δx хоризонтално, Δy вертикално */}
      {dy !== 0 && (
        <>
          <PlotLine p={A} q={corner} tone="amber" width={2.5} dashed />
          <PlotLine p={corner} q={B} tone="violet" width={2.5} dashed />
          <PlotLabel p={{ x: (A.x + B.x) / 2, y: A.y }} dy={dy > 0 ? 14 : -14} tone="amber">
            Δx = {num(dx)}
          </PlotLabel>
          <PlotLabel p={{ x: B.x, y: (A.y + B.y) / 2 }} dx={dx > 0 ? 10 : -10} anchor={dx > 0 ? 'start' : 'end'} tone="violet">
            Δy = {num(dy)}
          </PlotLabel>
        </>
      )}

      <PlotDot p={{ x: 0, y: b }} tone="emerald" />
      <PlotLabel p={{ x: 0, y: b }} dx={-10} dy={a > 0 ? -12 : 12} anchor="end" tone="emerald">
        (0; {num(b)})
      </PlotLabel>
      {root !== null && (
        <>
          <PlotDot p={{ x: root, y: 0 }} tone="rose" />
          <PlotLabel p={{ x: root, y: 0 }} dx={a > 0 ? 10 : -10} dy={14} anchor={a > 0 ? 'start' : 'end'} tone="rose">
            ({num(root)}; 0)
          </PlotLabel>
        </>
      )}

      <PlotLabel p={A} dx={-12} dy={-14} tone="ink">A</PlotLabel>
      <PlotLabel p={B} dx={-12} dy={-14} tone="ink">B</PlotLabel>
      <PlotHandle p={A} onMove={moveA} name="A" />
      <PlotHandle p={B} onMove={moveB} name="B" />
    </Plot>
  );
}

type Line = { a: number; b: number };

const pairs: { label: string; second: Line }[] = [
  { label: 'Пресичащи се', second: { a: -1, b: 2 } },
  { label: 'Успоредни', second: { a: 0.5, b: -2 } },
  { label: 'Съвпадащи', second: { a: 0.5, b: 1 } },
  { label: 'Перпендикулярни', second: { a: -2, b: -1 } },
];

/** Взаимно положение на две прави y = a₁x + b₁ и y = a₂x + b₂. */
export function TwoLines() {
  const first: Line = { a: 0.5, b: 1 };
  const [second, setSecond] = useState<Line>({ a: -1, b: 2 });

  const same = second.a === first.a;
  const coincide = same && second.b === first.b;
  const perpendicular = first.a * second.a === -1;
  const meet: Point | null = same
    ? null
    : (() => {
        const x = (second.b - first.b) / (first.a - second.a);
        return { x, y: first.a * x + first.b };
      })();

  return (
    <Plot
      hint="Променяй a₂ и b₂ и наблюдавай кога правите се пресичат, кога са успоредни и кога съвпадат."
      readout={
        <>
          <Formula>
            <span className="text-blue-700 dark:text-blue-300">y = {polynomial([first.a, first.b])}</span>
            {'   ·   '}
            <span className="text-rose-600 dark:text-rose-400">y = {polynomial([second.a, second.b])}</span>
          </Formula>
          <Note tone={coincide ? 'violet' : same ? 'amber' : 'emerald'}>
            {coincide && 'a₁ = a₂ и b₁ = b₂ – правите съвпадат'}
            {same && !coincide && 'a₁ = a₂, b₁ ≠ b₂ – правите са успоредни и нямат обща точка'}
            {meet && `a₁ ≠ a₂ – правите се пресичат в точката ${point(meet)}`}
            {perpendicular && ' и са перпендикулярни (a₁ · a₂ = −1)'}
          </Note>
          <Sliders>
            <Slider label="a₂" value={second.a} onChange={a => setSecond({ ...second, a })} min={-3} max={3} tone="rose" />
            <Slider label="b₂" value={second.b} onChange={b => setSecond({ ...second, b })} min={-5} max={5} tone="rose" />
          </Sliders>
          <Buttons>
            {pairs.map(p => (
              <DiagramButton key={p.label} onClick={() => setSecond(p.second)} active={p.second.a === second.a && p.second.b === second.b}>
                {p.label}
              </DiagramButton>
            ))}
          </Buttons>
        </>
      }
    >
      <Curve f={x => first.a * x + first.b} tone="blue" />
      <Curve f={x => second.a * x + second.b} tone="rose" dashed={coincide} />
      {meet && <PlotDot p={meet} tone="emerald" r={6} />}
    </Plot>
  );
}
