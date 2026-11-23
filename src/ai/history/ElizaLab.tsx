import { useEffect, useRef, useState } from 'react';
import { Readout } from '~/geometry/diagram';

// ---------- Правилата на „Елиза“ ----------

type Rule = {
  /** Как изглежда правилото за ученика: „… съм X“ */
  shape: string;
  pattern: RegExp;
  /** Отговори – редуват се; {1} е уловената част от изречението */
  replies: string[];
};

/** Начало и край на дума – \b не работи с кирилица (без lookbehind, заради по-старите браузъри). */
const END = '(?![а-яё])';
const START = '(?:^|[^а-яё])';

const RULES: Rule[] = [
  { shape: 'здравей / здрасти', pattern: new RegExp(`${START}(здравей|здрасти|добър ден|привет)${END}`), replies: ['Здравей! Какво те води при мен?', 'Здравей. За какво искаш да поговорим?'] },
  { shape: 'ти си X', pattern: new RegExp(`${START}ти си (.+)`), replies: ['Защо мислиш, че съм {1}?', 'Нека говорим за теб, а не за мен.'] },
  { shape: '… машина / компютър / робот', pattern: new RegExp(`${START}(машина|машини|компютър|компютри|робот|програма)${END}`), replies: ['Притесняват ли те машините?', 'Какво общо имат машините с твоя въпрос?'] },
  { shape: 'чувствам се X', pattern: new RegExp(`${START}чувствам се (.+)`), replies: ['Защо се чувстваш {1}?', 'Откога се чувстваш {1}?'] },
  { shape: '… съм X', pattern: new RegExp(`${START}съм (.+)`), replies: ['Откога си {1}?', 'Защо мислиш, че си {1}?'] },
  { shape: 'не мога X', pattern: new RegExp(`${START}не мога (.+)`), replies: ['Какво ти пречи? Каза: „не мога {1}“.', 'Какво би станало, ако все пак опиташ?'] },
  { shape: 'искам X', pattern: new RegExp(`${START}искам (.+)`), replies: ['Какво ще се промени, ако желанието ти се сбъдне?', 'Защо това е важно за теб?'] },
  { shape: 'мисля, че X', pattern: new RegExp(`${START}мисля,? че (.+)`), replies: ['Наистина ли мислиш, че {1}?', 'Какво те кара да мислиш така?'] },
  { shape: '… майка / баща / брат / сестра', pattern: new RegExp(`${START}(майка|баща|брат|сестра|родител|семейство)`), replies: ['Разкажи ми повече за семейството си.', 'Как се разбирате у дома?'] },
  { shape: '… училище / контролно / оценка', pattern: new RegExp(`${START}(училище|контролно|оценка|оценки|учител|изпит)`), replies: ['Как се чувстваш в училище?', 'Това често ли те тревожи?'] },
  { shape: '… винаги / никога / всички', pattern: new RegExp(`${START}(винаги|никога|всички|никой)${END}`), replies: ['Можеш ли да дадеш конкретен пример?', 'Наистина ли е така всеки път?'] },
  { shape: '… защото X', pattern: new RegExp(`${START}защото (.+)`), replies: ['Това ли е истинската причина?', 'Има ли и други причини?'] },
  { shape: 'да / не', pattern: /^(да|не)$/, replies: ['Звучиш доста уверено. Разкажи повече.', 'Разбирам. Продължавай.'] },
  { shape: '…?', pattern: /\?$/, replies: ['Защо питаш?', 'А ти как мислиш?'] },
];

/** Ако никое правило не пасне. */
const FALLBACK = ['Разкажи ми повече.', 'Продължавай, слушам те.', 'Какво означава това за теб?', 'Интересно. А после?'];

/** Първо лице → второ лице в уловената част: „моята сестра“ → „твоята сестра“. */
const REFLECT: Record<string, string> = {
  аз: 'ти',
  съм: 'си',
  ми: 'ти',
  ме: 'те',
  мен: 'теб',
  мой: 'твой',
  моя: 'твоя',
  моят: 'твоят',
  моята: 'твоята',
  моето: 'твоето',
  моите: 'твоите',
  мога: 'можеш',
  искам: 'искаш',
  имам: 'имаш',
  нямам: 'нямаш',
  знам: 'знаеш',
  обичам: 'обичаш',
};

const reflect = (s: string) =>
  s
    .split(' ')
    .map(w => REFLECT[w] ?? w)
    .join(' ');

const clean = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!…]+$/g, '')
    .trim();

type Reply = { text: string; rule: string | null; caught?: string };

/** Отговорът на „Елиза“: първото правило, което пасва. `turn` редува вариантите. */
function elizaReply(input: string, turn: number): Reply {
  const s = clean(input);
  for (const r of RULES) {
    const m = s.match(r.pattern);
    if (!m) continue;
    const caught = m[1] && r.pattern.source.includes('(.+)') ? reflect(m[1].replace(/[?,;:]+$/g, '').trim()) : undefined;
    const usable = r.replies.filter(t => caught !== undefined || !t.includes('{1}'));
    const template = usable[turn % usable.length];
    return { text: template.replace('{1}', caught ?? ''), rule: r.shape, caught };
  }
  return { text: FALLBACK[turn % FALLBACK.length], rule: null };
}

// ---------- Лаборатория ----------

type Line = { who: 'me' | 'eliza'; text: string; rule?: string | null };

const START_LINES: Line[] = [{ who: 'eliza', text: 'Здравей. Аз съм Елиза. Какво те тревожи?' }];

const SUGGESTIONS = ['Чувствам се уморен', 'Утре имам контролно', 'Мисля, че никой не ме разбира', 'Ти си машина', 'Колко е 2 + 2?', 'Вчера валя сняг'];

/** Разговор с програма по образец на ELIZA (1966 г.): под всеки отговор се вижда правилото, което го е породило. */
export default function ElizaLab() {
  const [lines, setLines] = useState<Line[]>(START_LINES);
  const [draft, setDraft] = useState('');
  const [showRules, setShowRules] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  const say = (textIn: string) => {
    const t = textIn.trim();
    if (!t) return;
    setLines(prev => {
      const r = elizaReply(t, prev.filter(l => l.who === 'me').length);
      return [...prev, { who: 'me', text: t }, { who: 'eliza', text: r.text, rule: r.rule }];
    });
    setDraft('');
  };

  const answers = lines.filter(l => l.who === 'eliza' && l.rule !== undefined);
  const byRule = answers.filter(l => l.rule !== null).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div ref={boxRef} className="h-72 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 dark:border-gray-700 dark:bg-gray-900/50">
        {lines.map((l, i) => (
          <div key={i} className={`flex ${l.who === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              <div
                className={`rounded-2xl px-3 py-2 text-sm sm:text-base ${
                  l.who === 'me' ? 'bg-fuchsia-600 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
                }`}
              >
                {l.text}
              </div>
              {showRules && l.who === 'eliza' && l.rule !== undefined && (
                <p className="mt-0.5 ml-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                  {l.rule === null ? 'няма подходящо правило → обща фраза' : `правило: „${l.rule}“`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          say(draft);
        }}
      >
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Напиши нещо на Елиза…"
          aria-label="Съобщение до Елиза"
          maxLength={120}
          className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:text-base text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        <button type="submit" className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700">
          Изпрати
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => say(s)}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showRules} onChange={e => setShowRules(e.target.checked)} className="accent-fuchsia-600" />
          покажи правилото под всеки отговор
        </label>
        <button type="button" onClick={() => setLines(START_LINES)} className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white">
          нов разговор
        </button>
      </div>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'отговори', value: answers.length },
            { label: 'по правило', value: byRule, tone: 'violet' },
            { label: 'с обща фраза', value: answers.length - byRule, tone: 'amber' },
          ]}
        />
      </div>

      <details className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-medium">Виж всичките {RULES.length} правила на тази Елиза</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold px-2 py-1 border-b border-gray-200 dark:border-gray-700">Ако в изречението има…</th>
                <th className="text-left font-semibold px-2 py-1 border-b border-gray-200 dark:border-gray-700">…отговори с</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map(r => (
                <tr key={r.shape}>
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 font-mono whitespace-nowrap">{r.shape}</td>
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">{r.replies.map(t => t.replace('{1}', 'X')).join(' / ')}</td>
                </tr>
              ))}
              <tr>
                <td className="px-2 py-1 font-mono">нищо от горните</td>
                <td className="px-2 py-1">{FALLBACK.join(' / ')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2">Правилата се проверяват отгоре надолу и печели първото, което пасне. Програмата не знае какво значат думите – тя само ги разпознава и пренарежда.</p>
      </details>
    </div>
  );
}
