import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { countPairs, mergePair, totalTokens, toWords } from './tokens';

const TEXTS = [
  { label: 'баба и баницата', text: 'баба меси баница, баба пече баница, баба реже баница' },
  { label: 'шест шапки', text: 'шест шапки, шест шала, шест шишета и шест шейни' },
];

const chip = 'inline-block font-mono text-sm px-1.5 py-0.5 rounded border';

/** Сливане на най-честите двойки стъпка по стъпка върху кратък текст: токените, новите думи в речника и броят им. */
export default function BpeLab() {
  const [which, setWhich] = useState(0);
  const [steps, setSteps] = useState(0);

  // Повтаряме сливанията отначало – текстът е кратък и това е мигновено
  let words = toWords(TEXTS[which].text);
  const start = totalTokens(words);
  const base = new Set(words.flat()).size;
  const made: { token: string; count: number }[] = [];
  for (let s = 0; s < steps; s++) {
    const best = countPairs(words)[0];
    if (!best || best.count < 2) break;
    words = mergePair(words, best.a, best.b);
    made.push({ token: best.a + best.b, count: best.count });
  }
  const next = countPairs(words)[0];
  const done = !next || next.count < 2;
  const now = totalTokens(words);
  const choose = (i: number) => {
    setWhich(i);
    setSteps(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center mb-3">
        {words.map((w, i) => (
          <span key={i} className="inline-flex gap-0.5">
            {w.map((t, j) => (
              <span
                key={j}
                className={`${chip} ${
                  Array.from(t).length > 1
                    ? 'border-fuchsia-400 bg-fuchsia-50 text-fuchsia-900 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-500/60'
                    : 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-600'
                }`}
              >
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
      <p className="text-center text-sm text-gray-700 dark:text-gray-200 min-h-[1.5rem]">
        {done ? (
          'Никоя двойка съседни токени вече не се среща поне два пъти.'
        ) : (
          <>
            Най-честата двойка сега: <span className={`${chip} border-amber-400 bg-amber-50 dark:bg-amber-500/15 dark:border-amber-500/60`}>{next.a}</span> +{' '}
            <span className={`${chip} border-amber-400 bg-amber-50 dark:bg-amber-500/15 dark:border-amber-500/60`}>{next.b}</span> – {next.count} пъти
          </>
        )}
      </p>
      <Buttons>
        <DiagramButton onClick={() => !done && setSteps(made.length + 1)}>слей най-честата двойка</DiagramButton>
        <DiagramButton onClick={() => setSteps(0)}>отначало</DiagramButton>
      </Buttons>
      <Buttons>
        {TEXTS.map((t, i) => (
          <DiagramButton key={t.label} active={which === i} onClick={() => choose(i)}>
            {t.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'сливания', value: made.length, tone: 'violet' },
            { label: 'токени в текста', value: `${start} → ${now}`, tone: 'emerald' },
            { label: 'речник', value: `${base} + ${made.length} = ${base + made.length}`, tone: 'amber' },
          ]}
        />
      </div>
      {made.length > 0 && (
        <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
          Нови токени в речника:{' '}
          {made.map((m, i) => (
            <span key={i} className={`${chip} border-fuchsia-300 dark:border-fuchsia-500/60 mx-0.5 my-0.5`}>
              {m.token}
            </span>
          ))}
        </p>
      )}
      <Note tone={done ? 'emerald' : 'gray'}>
        {done
          ? `От ${start} токена текстът стана ${now}, а речникът порасна с ${made.length}. Честите думи са вече по един токен, редките останаха на парчета.`
          : 'Знакът ␣ е интервалът пред думата – той е част от токена. Сивите токени са отделни знаци, розовите са получени чрез сливане.'}
      </Note>
    </div>
  );
}
