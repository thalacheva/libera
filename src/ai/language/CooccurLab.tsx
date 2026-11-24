import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { cooccurrence, CORPUS, nearest, TARGETS, tokenize, topContexts } from './wordVectors';

const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cell = 'px-2 py-1 border-b border-gray-100 dark:border-gray-700 text-center';

/** Малък корпус → таблица на съвместните срещания → най-близките думи по косинус. */
export default function CooccurLab() {
  const [word, setWord] = useState('чай');
  const [window, setWindow] = useState(2);
  const [dropStop, setDropStop] = useState(true);
  const [showCorpus, setShowCorpus] = useState(false);

  const counts = useMemo(() => cooccurrence(CORPUS, window, dropStop), [window, dropStop]);
  const ranked = nearest(counts, word, TARGETS);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const contexts = topContexts(counts, word, 7).map(c => c[0]);
  const rows = [word, best.word, worst.word];
  const examples = CORPUS.filter(s => tokenize(s).includes(word)).slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">избери дума</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {TARGETS.map(t => (
          <button
            key={t}
            onClick={() => setWord(t)}
            aria-pressed={t === word}
            className={`px-2.5 py-1 rounded-lg border text-sm transition-colors ${
              t === word
                ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        от корпуса: {examples.map(s => `„${s}“`).join(' ')}
      </p>

      <p className="mt-4 mb-1 text-center text-sm font-medium text-gray-700 dark:text-gray-200">колко пъти всяка дума е до тези съседи</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs sm:text-sm border-collapse font-mono">
          <thead>
            <tr>
              <th className={`${cell} text-left bg-gray-50 dark:bg-gray-900/50`}>дума</th>
              {contexts.map(c => (
                <th key={c} className={`${cell} font-normal bg-gray-50 dark:bg-gray-900/50`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r}${i}`}>
                <td className={`${cell} text-left font-semibold ${i === 0 ? 'text-fuchsia-700 dark:text-fuchsia-300' : i === 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{r}</td>
                {contexts.map(c => {
                  const v = counts.get(r)?.get(c) ?? 0;
                  return (
                    <td key={c} className={`${cell} ${v ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600'}`}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 mb-1 text-center text-sm font-medium text-gray-700 dark:text-gray-200">косинусова близост до „{word}“</p>
      <div className="max-w-md mx-auto space-y-1">
        {ranked.map(r => (
          <div key={r.word} className="flex items-center gap-2 text-xs sm:text-sm font-mono">
            <span className="w-24 text-right text-gray-700 dark:text-gray-200">{r.word}</span>
            <span className="flex-1 h-3 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <span className="block h-full bg-fuchsia-500" style={{ width: `${Math.max(0, r.cos) * 100}%` }} />
            </span>
            <span className="w-10 text-gray-900 dark:text-gray-100">{dec(r.cos)}</span>
          </div>
        ))}
      </div>

      <Sliders>
        <Slider label="прозорец" value={window} onChange={setWindow} min={1} max={4} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={dropStop} onClick={() => setDropStop(true)}>
          без служебните думи
        </DiagramButton>
        <DiagramButton active={!dropStop} onClick={() => setDropStop(false)}>
          с „в“, „на“, „с“, „и“…
        </DiagramButton>
        <DiagramButton active={showCorpus} onClick={() => setShowCorpus(!showCorpus)}>
          {showCorpus ? 'скрий корпуса' : 'покажи целия корпус'}
        </DiagramButton>
      </Buttons>
      {showCorpus && <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{CORPUS.join(' ')}</p>}
      <Note tone="gray">
        Най-близо до „{word}“ е „{best.word}“ ({dec(best.cos)}), най-далеч – „{worst.word}“ ({dec(worst.cos)}). Никой не е казвал на таблицата какво значат думите – тя само е броила съседи в {CORPUS.length} изречения.
      </Note>
    </div>
  );
}
