import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { chars, CORPUS, encode, trainBpe, utf8Bytes, vocabulary } from './tokens';

const PRESETS = [
  { label: 'позната тема', text: 'реката тече към полето' },
  { label: 'друга тема', text: 'котката спи на дивана' },
  { label: 'дълга рядка дума', text: 'електроенцефалография' },
  { label: 'английски', text: 'the river runs to the field' },
  { label: 'главна буква и 🙂', text: 'Здравей, свят! 🙂' },
];

const chip = 'inline-block font-mono text-sm px-1.5 py-0.5 rounded border';

/** Един и същ текст като знаци, като байтове и като токени – с речник, обучен върху малкия учебен текст за селото и реката. */
export default function TokenLab() {
  const [text, setText] = useState(PRESETS[0].text);
  const [size, setSize] = useState(150);
  // Всички сливания се научават веднъж; плъзгачът взима първите `size` от тях
  const all = useMemo(() => trainBpe(CORPUS, 1000), []);
  const merges = useMemo(() => all.slice(0, size), [all, size]);
  const vocab = useMemo(() => vocabulary(CORPUS, merges), [merges]);
  const ids = useMemo(() => new Map(vocab.map((t, i) => [t, i])), [vocab]);

  const tokens = encode(text, merges);
  const n = chars(text).length;
  const bytes = utf8Bytes(text).length;
  const unknown = tokens.filter(t => !ids.has(t)).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, 120))}
        rows={2}
        aria-label="Текст за нарязване"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base text-gray-900 dark:text-gray-100"
      />
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.label} active={text === p.text} onClick={() => setText(p.text)}>
            {p.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="flex flex-wrap gap-1 justify-center mt-4">
        {tokens.map((t, i) => {
          const id = ids.get(t);
          return (
            <span key={i} className="inline-flex flex-col items-center">
              <span
                className={`${chip} ${
                  id === undefined
                    ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/60'
                    : Array.from(t).length > 1
                      ? 'border-fuchsia-400 bg-fuchsia-50 text-fuchsia-900 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-500/60'
                      : 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-600'
                }`}
              >
                {t}
              </span>
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">{id ?? '?'}</span>
            </span>
          );
        })}
      </div>
      <Sliders>
        <Slider label="речник" value={size} onChange={setSize} min={0} max={all.length} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'знаци', value: n },
            { label: 'байтове UTF-8', value: bytes, tone: 'blue' },
            { label: 'токени', value: tokens.length, tone: 'violet' },
            { label: 'думи в речника', value: vocab.length, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={unknown ? 'amber' : 'gray'}>
        {unknown
          ? `${unknown} от знаците (в жълто) изобщо ги няма в учебния текст, затова нямат номер в този речник. Истинските речници се пазят от това, като за краен случай имат по един токен за всеки байт.`
          : 'Под всеки токен е номерът му в речника. Речникът е обучен върху кратък текст за едно село край река – думите от него стават цели токени, а всичко останало се разпада на парчета.'}
      </Note>
    </div>
  );
}
