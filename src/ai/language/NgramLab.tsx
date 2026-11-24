import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { buildNgram, chars, CORPUS, generate, nextDist } from './tokens';

const START = 'в ';
const show = (ch: string) => (ch === ' ' ? '␣' : ch);
const pct = (p: number) => `${(p * 100).toLocaleString('bg-BG', { maximumFractionDigits: p < 0.1 ? 1 : 0 })}%`;

/** Модел по броене: следващият знак се тегли според това колко пъти е следвал последните n − 1 знака в учебния текст. */
export default function NgramLab() {
  const [order, setOrder] = useState(2);
  const [seed, setSeed] = useState(1);
  const [length, setLength] = useState(0);

  const model = useMemo(() => buildNgram(CORPUS, order), [order]);
  const text = useMemo(() => generate(model, START, length, seed), [model, length, seed]);
  const { context, next } = nextDist(model, text);
  const possible = model.alphabet.length ** (order - 1);
  const top = next.slice(0, 8);
  const rest = next.slice(8).reduce((s, n) => s + n.p, 0);
  const copied = order >= 4 && length >= 30;

  const pickOrder = (o: number) => {
    setOrder(o);
    setLength(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {[1, 2, 3, 4, 5].map(o => (
          <DiagramButton key={o} active={order === o} onClick={() => pickOrder(o)}>
            {o === 1 ? 'без контекст' : `${o - 1} ${o === 2 ? 'знак' : 'знака'} назад`}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-3 min-h-[5.5rem] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
        {chars(text)
          .slice(0, chars(text).length - chars(context).length)
          .join('')}
        <span className="bg-amber-200 dark:bg-amber-500/40 rounded-sm">{context}</span>
        <span className="text-fuchsia-600 dark:text-fuchsia-400">▌</span>
      </p>
      <div className="mt-3 max-w-md mx-auto space-y-1">
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          {order === 1 ? 'Колко често се среща всеки знак в учебния текст:' : `Какво е следвало „${context.replace(/ /g, '␣')}“ в учебния текст:`}
        </p>
        {top.map(n => (
          <div key={n.ch} className="flex items-center gap-2 text-sm font-mono">
            <span className="w-5 text-center text-gray-900 dark:text-gray-100">{show(n.ch)}</span>
            <span className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <span className="block h-full bg-fuchsia-500" style={{ width: `${n.p * 100}%` }} />
            </span>
            <span className="w-24 text-right text-gray-600 dark:text-gray-300">
              {n.count} · {pct(n.p)}
            </span>
          </div>
        ))}
        {rest > 0 && <p className="text-xs text-center text-gray-500 dark:text-gray-400">още {next.length - 8} знака с общо {pct(rest)}</p>}
      </div>
      <Buttons>
        <DiagramButton onClick={() => setLength(length + 1)}>следващ знак</DiagramButton>
        <DiagramButton onClick={() => setLength(length + 40)}>още 40 знака</DiagramButton>
        <DiagramButton
          onClick={() => {
            setSeed(seed + 1);
            setLength(0);
          }}
        >
          нов опит
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'възможни контексти', value: possible.toLocaleString('bg-BG'), tone: 'amber' },
            { label: 'срещнати в текста', value: model.table.size.toLocaleString('bg-BG'), tone: 'emerald' },
            { label: 'продължения сега', value: next.length, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={copied ? 'amber' : 'gray'}>
        {order === 1
          ? 'Без контекст моделът знае само кои знаци са чести. Получава се каша, в която интервалите и гласните са колкото трябва.'
          : copied
            ? 'Изглежда като български – но виж колко често има само едно възможно продължение. Моделът не съчинява, а преписва парчета от учебния текст.'
            : 'Жълтото са знаците, по които моделът решава. Следващият знак се тегли на случаен принцип, но по-честите продължения излизат по-често.'}
      </Note>
    </div>
  );
}
