import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { END, nextLogits, perplexity, randomAt, softmax, tokenProbs, VOCAB } from './generation';

const MAX = 14;
const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: v < 0.1 ? 1 : 0 })}%`;
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Четирите най-вероятни продължения и две от малко вероятните – едни и същи при всяко показване на същия текст. */
function options(text: string[]) {
  const p = softmax(nextLogits(text));
  const order = p.map((v, i) => ({ word: VOCAB[i], v })).sort((a, b) => b.v - a.v);
  const rest = order.slice(4).filter(o => o.word !== END);
  const a = Math.floor(randomAt(text.length + 3, text.length) * rest.length);
  const b = (a + 1 + Math.floor(randomAt(text.length + 11, text.length + 5) * (rest.length - 1))) % rest.length;
  return [...order.slice(0, 4), rest[a], rest[b]];
}

/** Ти пишеш, моделът оценява: колко „изненадан“ е от всяка избрана дума и каква е перплексията на изречението. */
export default function ChooseLab() {
  const [text, setText] = useState<string[]>([]);
  const done = text[text.length - 1] === END || text.length >= MAX;
  const given = tokenProbs(text);
  const surprise = given.map(v => -Math.log(v));
  const sum = surprise.reduce((a, b) => a + b, 0);
  const ppl = perplexity(given);
  const top = Math.max(4, ...surprise);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="min-h-28 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 flex flex-wrap items-end content-start gap-2">
        {text.length === 0 && <span className="text-sm text-gray-500 dark:text-gray-400 self-start">Избери първата дума от бутоните долу.</span>}
        {text.map((w, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-14 w-6 flex items-end">
              <div className={`w-full rounded-t ${surprise[i] > 3 ? 'bg-rose-500' : surprise[i] > 1.2 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ height: `${Math.max(4, (surprise[i] / top) * 100)}%` }} />
            </div>
            <span className="text-[11px] font-mono text-gray-600 dark:text-gray-300">{dec(surprise[i], 1)}</span>
            <span className={`px-1.5 py-0.5 rounded text-sm ${w === END ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/40 dark:text-fuchsia-100'}`}>{w === END ? 'край' : w}</span>
          </div>
        ))}
      </div>
      {!done && (
        <Buttons>
          {options(text).map(o => (
            <DiagramButton key={o.word} onClick={() => setText([...text, o.word])}>
              {o.word === END ? 'край' : o.word} <span className="font-mono text-xs opacity-70">{pct(o.v)}</span>
            </DiagramButton>
          ))}
        </Buttons>
      )}
      <Buttons>
        <DiagramButton onClick={() => setText(text.slice(0, -1))}>върни една дума</DiagramButton>
        <DiagramButton onClick={() => setText([])}>започни отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'думи', value: text.length, tone: 'violet' },
            { label: 'сбор от изненадите', value: text.length ? dec(sum) : '—', tone: 'rose' },
            { label: 'средно на дума', value: text.length ? dec(sum / text.length) : '—' },
            { label: 'перплексия', value: text.length ? dec(ppl, 1) : '—', tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={text.length === 0 ? 'gray' : ppl < 3 ? 'emerald' : ppl > 15 ? 'rose' : 'amber'}>
        {text.length === 0
          ? 'Стълбчето над всяка дума е изненадата на модела, −ln p: ниско и зелено за очаквана дума, високо и червено за неочаквана.'
          : ppl < 3
            ? 'Този текст е „по вкуса“ на модела: на всяка стъпка той се колебае средно между по-малко от три варианта.'
            : ppl > 15
              ? 'За модела този текст е много странен – все едно на всяка стъпка е трябвало да познае една от над 15 равновероятни думи.'
              : 'Перплексията е exp от средната изненада. Опитай да я свалиш под 3 – или да я вдигнеш над 15.'}
      </Note>
    </div>
  );
}
