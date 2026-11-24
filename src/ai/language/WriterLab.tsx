import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { choiceProbs, END, loops, nextToken, perplexity, type Strategy, tokenProbs, TOP_K, VOCAB, write } from './generation';

const MAX = 28;
const STRATEGIES: { id: Strategy; label: string }[] = [
  { id: 'greedy', label: 'винаги най-вероятният' },
  { id: 'sample', label: 'случаен избор' },
  { id: 'topk', label: `първите ${TOP_K}` },
  { id: 'topp', label: 'ядро 0,9' },
];
const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: v < 0.1 ? 1 : 0 })}%`;
const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (v: number) => {
  if (v >= 0.001) return pct(v);
  const e = Math.floor(Math.log10(v));
  return `${dec(v / 10 ** e)}·10^${e}`.replace('-', '−');
};

/** Малък модел пише изречение дума по дума: вижда се от какво избира на всяка стъпка и какво става при различните стратегии. */
export default function WriterLab() {
  const [text, setText] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<Strategy>('greedy');
  const [T, setT] = useState(1);
  const [seed, setSeed] = useState(1);

  const done = text[text.length - 1] === END || text.length >= MAX;
  const probs = choiceProbs(text, strategy, T);
  const top = probs
    .map((v, i) => ({ word: VOCAB[i], v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);
  const given = tokenProbs(text);
  const total = given.reduce((a, b) => a * b, 1);
  const looping = loops(text);
  const pickStrategy = (s: Strategy) => {
    setStrategy(s);
    setText([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="min-h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 flex flex-wrap content-start gap-1.5">
        {text.length === 0 && <span className="text-sm text-gray-500 dark:text-gray-400">Текстът е празен. Натисни „следваща дума“.</span>}
        {text.map((w, i) => (
          <span key={i} className={`px-2 py-0.5 rounded text-sm sm:text-base ${w === END ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/40 dark:text-fuchsia-100'}`} title={pct(given[i])}>
            {w === END ? 'край' : w}
          </span>
        ))}
      </div>
      {!done && (
        <div className="max-w-md mx-auto mt-3 space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">от какво избира моделът сега (първите пет)</p>
          {top.map(({ word, v }) => (
            <div key={word} className={`flex items-center gap-2 text-sm ${v === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
              <span className="w-24 shrink-0 font-medium">{word === END ? 'край' : word}</span>
              <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
                <div className="h-full rounded bg-fuchsia-500" style={{ width: `${v * 100}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs">{v === 0 ? '—' : pct(v)}</span>
            </div>
          ))}
        </div>
      )}
      <Buttons>
        {STRATEGIES.map(s => (
          <DiagramButton key={s.id} active={strategy === s.id} onClick={() => pickStrategy(s.id)}>
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      {strategy !== 'greedy' && (
        <Sliders>
          <Slider label="температура T" value={T} onChange={setT} min={0.2} max={2} step={0.1} tone="amber" />
        </Sliders>
      )}
      <Buttons>
        <DiagramButton onClick={() => !done && setText([...text, nextToken(text, strategy, T, seed)])}>следваща дума</DiagramButton>
        <DiagramButton onClick={() => setText(write(done ? [] : text, strategy, T, seed, MAX))}>напиши до края</DiagramButton>
        <DiagramButton onClick={() => setText([])}>изтрий</DiagramButton>
        <DiagramButton
          onClick={() => {
            setSeed(seed + 1);
            setText([]);
          }}
        >
          ново семе
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'семе', value: seed },
            { label: 'думи', value: text.length, tone: 'violet' },
            { label: 'вероятност на текста', value: text.length ? sci(total) : '—', tone: 'rose' },
            { label: 'перплексия', value: text.length ? dec(perplexity(given)) : '—', tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={looping ? 'rose' : done && text[text.length - 1] === END ? 'emerald' : 'gray'}>
        {looping
          ? 'Моделът зацикли: стигна до дума, след която най-вероятното продължение го връща на същото място. Без случайност няма как да излезе.'
          : done && text[text.length - 1] === END
            ? strategy === 'greedy'
              ? 'Моделът избра знака за край. Същият старт ще даде същия текст всеки път – няма нищо случайно.'
              : 'Моделът избра знака за край. Натисни „ново семе“ за друг текст или пак „напиши до края“ за съвсем същия.'
            : 'Моделът е честно прост: обучен е върху 47 кратки изречения и гледа само последната дума. Истинските модели гледат хиляди токени назад, но цикълът е същият.'}
      </Note>
    </div>
  );
}
