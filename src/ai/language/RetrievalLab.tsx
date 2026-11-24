import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { approxTokens, DOCS, MIN_SCORE, QUERIES, retrieve, scores } from './chatTools';

const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Търсене в документи: близост по общи думи, най-добрите k документа се добавят в контекста преди въпроса. */
export default function RetrievalLab() {
  const [q, setQ] = useState(0);
  const [k, setK] = useState(1);

  const query = QUERIES[q];
  const sc = scores(query.text);
  const top = retrieve(query.text, k);
  const max = Math.max(MIN_SCORE * 2, ...sc.map(s => s.score));
  const found = query.expected !== null && top.includes(query.expected);
  const context = [...top.map(i => `Документ „${DOCS[i].title}“: ${DOCS[i].text}`), `Въпрос: ${query.text}`];
  const tokens = context.reduce((s, t) => s + approxTokens(t), 0);
  const all = DOCS.reduce((s, d) => s + approxTokens(d.text), 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">Въпрос към асистента на едно училище:</p>
      <Buttons>
        {QUERIES.map((x, i) => (
          <DiagramButton key={x.text} active={q === i} onClick={() => setQ(i)}>
            {x.text}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Документите и близостта им до въпроса</p>
          <div className="space-y-1.5">
            {DOCS.map((d, i) => (
              <div key={d.title} className={`p-1.5 rounded border text-xs ${top.includes(i) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-28 shrink-0 font-semibold text-gray-800 dark:text-gray-100">{d.title}</span>
                  <div className="flex-1 h-3 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full ${sc[i].score >= MIN_SCORE ? 'bg-emerald-500' : 'bg-gray-400'}`} style={{ width: `${(sc[i].score / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-700 dark:text-gray-200">{dec(sc[i].score)}</span>
                </div>
                <p className="mt-0.5 text-gray-600 dark:text-gray-300">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Какво получава моделът в контекста</p>
          <div className="font-mono text-[11px] sm:text-xs leading-relaxed p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100 break-words space-y-1">
            {context.map((t, i) => (
              <p key={i} className={i < top.length ? 'text-emerald-800 dark:text-emerald-300' : 'font-bold'}>
                {t}
              </p>
            ))}
          </div>
          <p className="text-xs font-semibold mt-3 mb-1 text-gray-600 dark:text-gray-300">Какво може да отговори</p>
          <div className={`p-2 rounded-xl text-sm border-2 ${found ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'} text-gray-900 dark:text-gray-100`}>{found ? query.answer : 'В контекста няма нужното. Честният отговор е „не знам“ – всичко друго би било измислица.'}</div>
        </div>
      </div>
      <Sliders>
        <Slider label="колко документа да се добавят" value={k} onChange={setK} min={0} max={3} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'добавени документи', value: top.length, tone: 'violet' },
            { label: 'контекст', value: `≈ ${tokens} токена` },
            { label: 'ако добавим всички документи', value: `≈ ${all + approxTokens(query.text)} токена` },
          ]}
        />
      </div>
      <Note tone={found ? 'emerald' : 'rose'}>
        {found
          ? 'Нужният документ е в контекста и отговорът може просто да се прочете от него.'
          : k === 0
            ? 'Без търсене моделът получава само въпроса. Правилникът на това училище го няма в обучаващите му данни – отговорът няма откъде да дойде.'
            : query.expected === null
              ? 'В нито един документ не пише това. Търсенето не може да намери нещо, което го няма.'
              : top.length === 0
                ? 'Отговорът го има в документ „Столова“, но въпросът и документът нямат нито една обща дума. Търсене по смисъл, с вграждания, би свързало „хапна“ и „обяд“.'
                : 'Двата документа имат еднаква близост до въпроса и първият по ред не е този с отговора. Добави още един документ.'}{' '}
        Близостта тук е сбор от теглата на общите думи (редките думи тежат повече) – най-простото възможно търсене.
      </Note>
    </div>
  );
}
