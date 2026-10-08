import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Rule = 'product' | 'quotient' | 'power';

const sup = (n: number) =>
  String(n)
    .split('')
    .map(ch => ({ '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' })[ch] ?? ch)
    .join('');

function Chip({ a, tone, struck = false }: { a: number; tone: 'blue' | 'rose' | 'gray'; struck?: boolean }) {
  const cls = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40',
    rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40',
    gray: 'bg-gray-100 text-gray-400 border-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600',
  }[tone];
  return (
    <span className={`inline-flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-lg border font-mono font-bold ${cls} ${struck ? 'line-through' : ''}`}>
      {a}
    </span>
  );
}

/** Правилата за степени като броене на множители. */
export default function PowerRulesLab() {
  const [rule, setRule] = useState<Rule>('product');
  const [a, setA] = useState(2);
  const [m, setM] = useState(3);
  const [n, setN] = useState(2);

  const chips = (count: number, tone: 'blue' | 'rose', key: string) => Array.from({ length: count }, (_, i) => <Chip key={`${key}${i}`} a={a} tone={tone} />);
  const row = (children: React.ReactNode) => <div className="flex flex-wrap justify-center items-center gap-1.5 my-2">{children}</div>;
  const op = (s: string) => <span className="mx-1 font-mono text-lg text-gray-500">{s}</span>;

  let picture: React.ReactNode;
  let result = 0;
  let formula = '';
  if (rule === 'product') {
    result = m + n;
    formula = `${a}${sup(m)} · ${a}${sup(n)} = ${a}^(${m} + ${n}) = ${a}${sup(result)}`;
    picture = row(
      <>
        {chips(m, 'blue', 'm')}
        {op('·')}
        {chips(n, 'rose', 'n')}
      </>,
    );
  } else if (rule === 'quotient') {
    result = m - n;
    formula = `${a}${sup(m)} : ${a}${sup(n)} = ${a}^(${m} − ${n}) = ${a}${sup(result)}`;
    const cancel = Math.min(m, n);
    picture = (
      <>
        {row(
          <>
            {Array.from({ length: m }, (_, i) => (
              <Chip key={`t${i}`} a={a} tone={i < cancel ? 'gray' : 'blue'} struck={i < cancel} />
            ))}
          </>,
        )}
        <div className="max-w-md mx-auto border-t-2 border-gray-400 dark:border-gray-500" />
        {row(
          <>
            {Array.from({ length: n }, (_, i) => (
              <Chip key={`b${i}`} a={a} tone={i < cancel ? 'gray' : 'rose'} struck={i < cancel} />
            ))}
          </>,
        )}
      </>
    );
  } else {
    result = m * n;
    formula = `(${a}${sup(m)})${sup(n)} = ${a}^(${m} · ${n}) = ${a}${sup(result)}`;
    picture = row(
      <>
        {Array.from({ length: n }, (_, j) => (
          <span key={j} className="inline-flex items-center gap-1 px-1.5 py-1 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-500/50">
            {chips(m, j % 2 ? 'rose' : 'blue', `p${j}`)}
          </span>
        ))}
      </>,
    );
  }

  const value = a ** result;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🧮 Броим множителите</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Степента aⁿ е n еднакви множителя a. Всяко правило за степени е просто преброяване на множителите.
      </p>
      <Buttons>
        <DiagramButton active={rule === 'product'} onClick={() => setRule('product')}>
          aᵐ · aⁿ
        </DiagramButton>
        <DiagramButton active={rule === 'quotient'} onClick={() => setRule('quotient')}>
          aᵐ : aⁿ
        </DiagramButton>
        <DiagramButton active={rule === 'power'} onClick={() => setRule('power')}>
          (aᵐ)ⁿ
        </DiagramButton>
      </Buttons>

      <div className="mt-3">{picture}</div>

      <Sliders>
        <Slider label="a" value={a} onChange={setA} min={2} max={5} step={1} tone="gray" />
        <Slider label="m" value={m} onChange={setM} min={1} max={rule === 'power' ? 4 : 7} step={1} tone="blue" />
        <Slider label="n" value={n} onChange={setN} min={1} max={rule === 'power' ? 4 : 7} step={1} tone="rose" />
      </Sliders>

      <Formula>
        <span className="text-lg">{formula}</span> = {result < 0 ? `1/${a ** -result}` : value.toLocaleString('bg-BG')}
      </Formula>
      {rule === 'quotient' && result === 0 && <Note tone="emerald">Всички множители се съкратиха: aᵐ : aᵐ = 1, затова a⁰ = 1.</Note>}
      {rule === 'quotient' && result < 0 && (
        <Note tone="amber">
          В знаменателя остават {-result} множителя: {a}
          {sup(result)} = 1/{a}
          {sup(-result)} – ето защо отрицателният показател означава „1 върху“.
        </Note>
      )}
    </div>
  );
}
