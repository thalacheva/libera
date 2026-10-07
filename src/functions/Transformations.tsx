import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { num } from './functionMath';
import { Curve, Plot, Slider, Sliders } from './plot';

type Basic = {
  name: string;
  formula: string;
  f: (x: number) => number;
  domain: string;
  note: string;
};

const basics: Basic[] = [
  { name: 'Линейна', formula: 'x', f: x => x, domain: 'ℝ', note: 'права през началото' },
  { name: 'Квадратна', formula: 'x²', f: x => x * x, domain: 'ℝ', note: 'парабола, симетрична спрямо Oy' },
  { name: 'Кубична', formula: 'x³', f: x => x ** 3, domain: 'ℝ', note: 'симетрична спрямо началото' },
  { name: 'Модул', formula: '|x|', f: Math.abs, domain: 'ℝ', note: '„V“ с връх в началото' },
  { name: 'Корен', formula: '√x', f: Math.sqrt, domain: 'x ≥ 0', note: 'съществува само за x ≥ 0' },
  { name: 'Хипербола', formula: '1/x', f: x => 1 / x, domain: 'x ≠ 0', note: 'два клона, не пресича осите' },
];

/** Галерия с основните функции. */
export function BasicFunctions() {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
      {basics.map(b => (
        <div key={b.name} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <Plot x={[-4, 4]} y={[-3, 3]} compact>
            <Curve f={b.f} width={4} />
          </Plot>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{b.name}</p>
            <p className="font-mono text-sm text-blue-700 dark:text-blue-300">y = {b.formula}</p>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono">D: {b.domain}</span> · {b.note}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Записва f(x − h) + k по-човешки: напр. (x − 2)² + 1, |x + 3| − 2. */
function shifted(base: Basic, h: number, k: number, flip: boolean) {
  const inner = h === 0 ? 'x' : `x ${h > 0 ? '−' : '+'} ${num(Math.abs(h))}`;
  const wrap: Record<string, string> = {
    x: inner,
    'x²': h === 0 ? 'x²' : `(${inner})²`,
    'x³': h === 0 ? 'x³' : `(${inner})³`,
    '|x|': `|${inner}|`,
    '√x': h === 0 ? '√x' : `√(${inner})`,
    '1/x': h === 0 ? '1/x' : `1/(${inner})`,
  };
  const body = wrap[base.formula];
  const tail = k === 0 ? '' : ` ${k > 0 ? '+' : '−'} ${num(Math.abs(k))}`;
  if (!flip) return `${body}${tail}`;
  // −(x − 2)² се чете като −((x − 2)²), но при правата без скоби −x − 2 би било грешно
  return `−${base.formula === 'x' && h !== 0 ? `(${body})` : body}${tail}`;
}

/** Преместване и отразяване на графика: y = ±f(x − h) + k. */
export function TransformExplorer() {
  const [index, setIndex] = useState(1);
  const [h, setH] = useState(2);
  const [k, setK] = useState(-1);
  const [flip, setFlip] = useState(false);

  const base = basics[index];
  const g = (x: number) => (flip ? -1 : 1) * base.f(x - h) + k;

  const moves = [
    h !== 0 && `${h > 0 ? 'надясно' : 'наляво'} с ${num(Math.abs(h))}`,
    k !== 0 && `${k > 0 ? 'нагоре' : 'надолу'} с ${num(Math.abs(k))}`,
  ].filter(Boolean);

  return (
    <Plot
      hint="Сивата пунктирна графика е изходната функция, синята – преобразуваната. Забележи: „x − h“ мести графиката надясно, макар че вътре има минус."
      readout={
        <>
          <Formula>y = {shifted(base, h, k, flip)}</Formula>
          <Note tone="violet">
            {flip && 'Отразяване спрямо Ox'}
            {flip && moves.length > 0 && ', след това '}
            {moves.length > 0 ? `преместване ${moves.join(' и ')}` : !flip && 'Без промяна'}
          </Note>
          <Sliders>
            <Slider label="h" value={h} onChange={setH} min={-5} max={5} tone="amber" />
            <Slider label="k" value={k} onChange={setK} min={-4} max={4} tone="emerald" />
          </Sliders>
          <Buttons>
            {basics.map((b, i) => (
              <DiagramButton key={b.name} onClick={() => setIndex(i)} active={i === index}>
                <span className="font-mono">{b.formula}</span>
              </DiagramButton>
            ))}
            <DiagramButton onClick={() => setFlip(!flip)} active={flip}>
              Отрази (−f)
            </DiagramButton>
          </Buttons>
        </>
      }
    >
      <Curve f={base.f} tone="gray" width={2} dashed />
      <Curve f={g} />
    </Plot>
  );
}
