import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { choices, softmax, topK, topP } from './generation';

/** Кандидатите за следващ токен след „Сутрин пия чаша …“ с оценките, които моделът им дава (измислени за примера). */
const CANDIDATES: [string, number][] = [
  ['кафе', 4],
  ['чай', 3.2],
  ['вода', 2.6],
  ['мляко', 2.2],
  ['сок', 1.8],
  ['какао', 1],
  ['айрян', 0.4],
  ['вино', -0.2],
  ['лимонада', -0.6],
  ['бензин', -3],
];
const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** От оценки към вероятности: температура, „първите k“ и „ядро p“ върху десет кандидата за следващия токен. */
export default function TemperatureLab() {
  const [T, setT] = useState(1);
  const [k, setK] = useState(10);
  const [p, setP] = useState(1);

  const logits = CANDIDATES.map(c => c[1]);
  const raw = softmax(logits, T);
  const final = topP(topK(raw, k), p);
  const left = final.filter(v => v > 0).length;
  const scale = Math.max(...final);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-3">
        „Сутрин пия чаша <span className="inline-block w-10 border-b-2 border-fuchsia-500 align-baseline" />“
      </p>
      <div className="max-w-xl mx-auto space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="w-20 shrink-0">токен</span>
          <span className="w-10 shrink-0 text-right">оценка</span>
          <span className="flex-1">вероятност</span>
        </div>
        {CANDIDATES.map(([word, logit], i) => {
          const out = final[i] === 0;
          return (
            <div key={word} className={`flex items-center gap-2 text-sm ${out ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
              <span className={`w-20 shrink-0 font-medium ${out ? 'line-through' : ''}`}>{word}</span>
              <span className="w-10 shrink-0 text-right font-mono text-xs">{dec(logit)}</span>
              <div className="flex-1 h-5 rounded bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
                <div className={`h-full rounded ${out ? 'bg-gray-300 dark:bg-gray-600' : 'bg-fuchsia-500'}`} style={{ width: `${((out ? raw[i] : final[i]) / scale) * 100}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-xs">{out ? '—' : pct(final[i])}</span>
            </div>
          );
        })}
      </div>
      <Sliders>
        <Slider label="температура T" value={T} onChange={setT} min={0.1} max={2} step={0.1} tone="amber" />
        <Slider label="първите k" value={k} onChange={setK} min={1} max={10} step={1} tone="violet" />
        <Slider label="ядро p" value={p} onChange={setP} min={0.5} max={1} step={0.05} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'останали кандидати', value: `${left} от 10`, tone: 'violet' },
            { label: 'най-вероятният', value: pct(Math.max(...final)), tone: 'rose' },
            { label: 'колебае се между около', value: `${dec(choices(final))} варианта`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={left === 1 ? 'rose' : T >= 1.6 && left === 10 ? 'amber' : 'gray'}>
        {left === 1
          ? 'Остана един-единствен кандидат: изборът вече не е случаен и моделът винаги ще каже „кафе“.'
          : T >= 1.6 && left === 10
            ? 'При висока температура разликите се заличават – дори „бензин“ получава забележим шанс.'
            : 'Сивите, зачеркнати кандидати са изключени от избора; вероятностите на останалите са преизчислени така, че сборът им пак да е 100%.'}
      </Note>
    </div>
  );
}
