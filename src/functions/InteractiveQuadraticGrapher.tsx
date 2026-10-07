import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import { Point } from '~/geometry/diagramMath';
import { num, point, polynomial, roots } from './functionMath';
import { Curve, Plot, PlotDot, PlotHandle, PlotLabel, Slider, Sliders, VLine } from './plot';

/** a(x − x₀)² + y₀ с правилните знаци. */
function vertexForm(a: number, V: Point) {
  const lead = a === 1 ? '' : a === -1 ? '−' : num(a);
  const inner = V.x === 0 ? 'x' : `(x ${V.x > 0 ? '−' : '+'} ${num(Math.abs(V.x))})`;
  const tail = V.y === 0 ? '' : ` ${V.y > 0 ? '+' : '−'} ${num(Math.abs(V.y))}`;
  return `${lead}${inner}²${tail}`;
}

const presets: { label: string; a: number; V: Point }[] = [
  { label: 'y = x²', a: 1, V: { x: 0, y: 0 } },
  { label: 'Тясна', a: 3, V: { x: 0, y: -4 } },
  { label: 'Широка', a: 0.25, V: { x: 0, y: -4 } },
  { label: 'Обърната', a: -1, V: { x: 1, y: 4 } },
];

/** Парабола, чийто връх се влачи, а коефициентът a се сменя с плъзгач. */
export function InteractiveQuadraticGrapher() {
  const [a, setA] = useState(1);
  const [V, setV] = useState<Point>({ x: 1, y: -4 });

  const b = -2 * a * V.x;
  const c = a * V.x * V.x + V.y;
  const D = b * b - 4 * a * c;
  const f = (x: number) => a * (x - V.x) ** 2 + V.y;
  const zeros = roots(a, b, c);

  return (
    <Plot
      hint="Влачи върха V – параболата се премества, без да променя формата си. С плъзгача промени a: знакът му обръща параболата, а големината – колко е тясна."
      readout={
        <>
          <Readout
            items={[
              { label: 'връх V =', value: point(V), tone: 'violet' },
              { label: 'ос x =', value: num(V.x), tone: 'gray' },
              { label: 'D =', value: num(D), tone: 'amber' },
              { label: 'c =', value: num(c), tone: 'emerald' },
            ]}
          />
          <Formula>
            y = {vertexForm(a, V)} = {polynomial([a, b, c])}
          </Formula>
          <Note tone={D > 0 ? 'emerald' : D === 0 ? 'amber' : 'rose'}>
            {D > 0 && `D > 0 – два корена: x₁ = ${num(zeros[0])}, x₂ = ${num(zeros[1])}`}
            {D === 0 && `D = 0 – един (двоен) корен x = ${num(zeros[0])}; върхът лежи на оста Ox`}
            {D < 0 && 'D < 0 – няма реални корени; параболата не пресича оста Ox'}
          </Note>
          <Sliders>
            <Slider
              label="a"
              value={a}
              // a = 0 не дава квадратна функция, затова прескачаме нулата
              onChange={v => setA(v === 0 ? (a > 0 ? -0.25 : 0.25) : v)}
              min={-3}
              max={3}
              step={0.25}
              tone="blue"
            />
          </Sliders>
          <Buttons>
            {presets.map(p => (
              <DiagramButton
                key={p.label}
                onClick={() => {
                  setA(p.a);
                  setV(p.V);
                }}
                active={p.a === a && p.V.x === V.x && p.V.y === V.y}
              >
                {p.label}
              </DiagramButton>
            ))}
          </Buttons>
        </>
      }
    >
      <VLine x={V.x} tone="violet" />
      <Curve f={f} />

      {zeros.map(x => (
        <PlotDot key={x} p={{ x, y: 0 }} tone="rose" />
      ))}
      {V.x !== 0 && <PlotDot p={{ x: 0, y: c }} tone="emerald" />}

      <PlotLabel p={V} dx={14} dy={a > 0 ? 16 : -16} anchor="start" tone="violet">
        V{point(V)}
      </PlotLabel>
      <PlotHandle p={V} onMove={setV} name="V" tone="violet" />
    </Plot>
  );
}

const cases: { title: string; text: string; a: number; b: number; c: number; tone: 'emerald' | 'amber' | 'rose' }[] = [
  { title: 'D > 0', text: 'два различни корена – параболата пресича Ox в две точки', a: 1, b: -2, c: -3, tone: 'emerald' },
  { title: 'D = 0', text: 'един двоен корен – върхът се допира до Ox', a: 1, b: -2, c: 1, tone: 'amber' },
  { title: 'D < 0', text: 'няма корени – параболата е изцяло над (или под) Ox', a: 1, b: -2, c: 3, tone: 'rose' },
];

/** Трите случая за броя на нулите на квадратната функция. */
export function DiscriminantCases() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cases.map(({ title, text, a, b, c, tone }) => (
        <div key={title} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <Plot x={[-3, 5]} y={[-4.5, 5]} compact>
            <Curve f={x => a * x * x + b * x + c} tone={tone} width={4} />
            {roots(a, b, c).map(x => (
              <PlotDot key={x} p={{ x, y: 0 }} tone={tone} r={7} />
            ))}
          </Plot>
          <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">{title}</p>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1">y = {polynomial([a, b, c])}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        </div>
      ))}
    </div>
  );
}

/** Построяване на графика точка по точка от таблица със стойности. */
export function PointByPoint({ f, xs, formula }: { f: (x: number) => number; xs: number[]; formula: string }) {
  const [shown, setShown] = useState(0);
  const done = shown === xs.length;

  return (
    <Plot
      hint="Попълни таблицата стъпка по стъпка – всяка двойка (x; y) е точка от графиката. Когато точките са достатъчно, ги свързваме с плавна линия."
      readout={
        <>
          <div className="overflow-x-auto">
            <table className="mx-auto font-mono text-sm border-collapse">
              <tbody>
                <tr>
                  <th className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-normal">x</th>
                  {xs.map(x => (
                    <td key={x} className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-center text-gray-900 dark:text-gray-100">
                      {num(x)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-normal">y</th>
                  {xs.map((x, i) => (
                    <td
                      key={x}
                      className={`px-2 py-1 border border-gray-200 dark:border-gray-700 text-center ${
                        i < shown ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-transparent'
                      }`}
                    >
                      {num(f(x))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {shown > 0 && !done && (
            <Formula>
              y({num(xs[shown - 1])}) = {num(f(xs[shown - 1]))}
            </Formula>
          )}
          {done && <Formula>y = {formula}</Formula>}
          <Buttons>
            <DiagramButton onClick={() => setShown(Math.min(xs.length, shown + 1))}>
              {done ? 'Готово ✓' : 'Следваща точка'}
            </DiagramButton>
            <DiagramButton onClick={() => setShown(xs.length)}>Всички</DiagramButton>
            <DiagramButton onClick={() => setShown(0)}>Отначало</DiagramButton>
          </Buttons>
        </>
      }
    >
      {done && <Curve f={f} />}
      {xs.slice(0, shown).map(x => (
        <PlotDot key={x} p={{ x, y: f(x) }} tone="blue" r={6} />
      ))}
    </Plot>
  );
}
