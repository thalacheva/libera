// Общи части за детските уроци по аритметика (1.–4. клас): карта на игра, нива, голяма цифрова клавиатура,
// звезди, похвали и финалното „Предизвикателство“.
// Случайните задачи се правят само при натискане на бутон – първото рисуване е еднакво с HTML-а от prerender.

import { Delete, RotateCcw, Star } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { currentPath, saveQuizResult } from '~/progress';
import { fmt, praise, starsFor } from './kidsMath';

// ---------- Оформление ----------

const CARD_TONES = {
  amber: 'from-amber-400 to-orange-500',
  sky: 'from-sky-400 to-blue-500',
  emerald: 'from-emerald-400 to-teal-500',
  pink: 'from-pink-400 to-rose-500',
  violet: 'from-violet-400 to-purple-500',
} as const;
export type CardTone = keyof typeof CARD_TONES;

/** Карта на една игра: цветна лента със заглавие, кратко „как се играе“ и самата игра. */
export function GameCard({
  emoji,
  title,
  goal,
  tone = 'amber',
  children,
}: {
  emoji: string;
  title: string;
  goal: ReactNode;
  tone?: CardTone;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 rounded-3xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <div className={`bg-gradient-to-r ${CARD_TONES[tone]} px-4 sm:px-6 py-3 text-white`}>
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl" aria-hidden>
            {emoji}
          </span>
          {title}
        </h2>
        <p className="text-sm sm:text-base text-white/95 mt-0.5">{goal}</p>
      </div>
      <div className="p-3 sm:p-6">{children}</div>
    </section>
  );
}

/** Бутоните за ниво: „до 10“, „до 20“, … */
export function LevelPicker<T extends string>({
  levels,
  value,
  onChange,
}: {
  levels: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4" role="group" aria-label="Ниво">
      {levels.map(l => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          aria-pressed={l.id === value}
          className={`px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold border-2 transition-colors ${
            l.id === value
              ? 'bg-amber-400 border-amber-500 text-amber-950'
              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-amber-400'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Голям цветен бутон за деца. */
export function BigButton({
  onClick,
  children,
  tone = 'amber',
  disabled,
  small,
}: {
  onClick: () => void;
  children: ReactNode;
  tone?: 'amber' | 'sky' | 'emerald' | 'gray' | 'pink' | 'violet';
  disabled?: boolean;
  small?: boolean;
}) {
  const tones = {
    amber: 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-600',
    sky: 'bg-sky-500 hover:bg-sky-400 text-white border-sky-700',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700',
    pink: 'bg-pink-500 hover:bg-pink-400 text-white border-pink-700',
    violet: 'bg-violet-500 hover:bg-violet-400 text-white border-violet-700',
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-900',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${small ? 'px-3 py-1.5 text-base' : 'px-5 py-2.5 text-lg'} rounded-2xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40 disabled:pointer-events-none ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/** Звезди 0–3. */
export function Stars({ count, max = 3, size = 28 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${count} от ${max} звезди`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < count ? 'fill-amber-400 text-amber-500 motion-safe:animate-pop' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </span>
  );
}

/** Ред с похвала/подсказка под играта. */
export function Bubble({ tone, children }: { tone: 'good' | 'bad' | 'info'; children: ReactNode }) {
  const cls = {
    good: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700',
    bad: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700',
    info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-700',
  }[tone];
  return (
    <p className={`mt-3 mx-auto max-w-xl text-center rounded-2xl border-2 px-4 py-2 text-base sm:text-lg font-semibold ${cls} ${tone === 'bad' ? 'motion-safe:animate-shake' : ''}`} role="status">
      {children}
    </p>
  );
}

/** Брояч на рунда: „Задача 3 от 8 · грешки 1“. */
export function RoundBar({ done, total, mistakes }: { done: number; total: number; mistakes: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-3" aria-label={`Задача ${Math.min(done + 1, total)} от ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full ${i < done ? 'bg-emerald-500' : i === done ? 'bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-700' : 'bg-gray-200 dark:bg-gray-600'}`}
        />
      ))}
      {mistakes > 0 && <span className="ml-2 text-sm text-rose-600 dark:text-rose-400">грешки: {mistakes}</span>}
    </div>
  );
}

/** Край на рунда: звезди и бутон за нов рунд. */
export function RoundDone({
  mistakes,
  onAgain,
  children,
  stars = starsFor(mistakes),
  text,
}: {
  mistakes: number;
  onAgain: () => void;
  children?: ReactNode;
  /** Свои звезди и текст – напр. в „Мемори“, където звездите са по броя опити. */
  stars?: number;
  text?: string;
}) {
  return (
    <div className="text-center py-4 motion-safe:animate-pop">
      <div className="text-5xl mb-2" aria-hidden>
        {stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👍'}
      </div>
      <Stars count={stars} size={36} />
      <p className="text-lg font-semibold mt-2 text-gray-800 dark:text-gray-100">
        {text ?? (mistakes === 0 ? 'Без нито една грешка!' : `Готово! Грешки: ${mistakes}.`)}
      </p>
      {children}
      <div className="mt-4">
        <BigButton onClick={onAgain} tone="emerald">
          <RotateCcw className="inline mr-1 -mt-1" size={20} />
          Още веднъж
        </BigButton>
      </div>
    </div>
  );
}

/** Голямата задача в средата: „7 + 5 = ?“. */
export function Problem({ children }: { children: ReactNode }) {
  return <div className="text-center text-4xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white my-3 tabular-nums">{children}</div>;
}

/** Поле за отговора – показва написаното с клавиатурата. */
export function AnswerBox({ value, state }: { value: string; state?: 'good' | 'bad' }) {
  const cls =
    state === 'good'
      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
      : state === 'bad'
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 motion-safe:animate-shake'
        : 'border-amber-400 bg-amber-50 dark:bg-gray-900';
  return (
    <span className={`inline-block min-w-[2.2em] px-2 rounded-xl border-4 border-dashed text-center ${cls}`} aria-live="polite">
      {value || '?'}
    </span>
  );
}

// ---------- Цифрова клавиатура ----------

/**
 * Голяма клавиатура 0–9, ⌫ и ✓. Работи и с клавиатурата на компютъра – натисканията
 * се хващат от обвиващия елемент, затова след първото щракване в играта може да се пише направо.
 */
export function NumPad({
  value,
  onChange,
  onSubmit,
  maxLength = 4,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  disabled?: boolean;
}) {
  const press = (d: string) => {
    if (disabled) return;
    if (value.length < maxLength) onChange(value === '0' ? d : value + d);
  };
  const key = 'h-12 sm:h-14 rounded-2xl text-2xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40';
  const digit = `${key} bg-white hover:bg-amber-50 text-gray-800 border-gray-300 shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-900`;
  return (
    <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto mt-3 select-none">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(d => (
        <button key={d} className={digit} onClick={() => press(d)} disabled={disabled} aria-label={d}>
          {d}
        </button>
      ))}
      <button
        className={`${key} col-span-2 bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-900`}
        onClick={() => onChange(value.slice(0, -1))}
        disabled={disabled || value === ''}
        aria-label="Изтрий"
      >
        <Delete className="inline" />
      </button>
      <button
        className={`${key} col-span-3 bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700`}
        onClick={onSubmit}
        disabled={disabled || value === ''}
      >
        Провери ✓
      </button>
    </div>
  );
}

/** Обвивка, която хваща цифрите, Backspace и Enter от физическата клавиатура. */
export function KeyCatcher({
  value,
  onChange,
  onSubmit,
  maxLength = 4,
  enabled = true,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  enabled?: boolean;
  children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      if (value.length < maxLength) onChange(value === '0' ? e.key : value + e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(value.slice(0, -1));
    } else if (e.key === 'Enter' && value !== '') {
      e.preventDefault();
      onSubmit();
    }
  };
  return (
    <div onKeyDown={onKeyDown} tabIndex={-1} className="outline-none">
      {children}
    </div>
  );
}

// ---------- Предизвикателство ----------

export type ChallengeItem = { text: string; answer: number };

/**
 * Финалът на урока: 10 задачи от избраното ниво, отговор с клавиатурата.
 * Резултатът се записва като бърз тест – вижда се в „Моят напредък“, а грешките влизат в преговора.
 */
export function Challenge<T extends string>({
  levels,
  make,
  count = 10,
}: {
  levels: readonly { id: T; label: string }[];
  make: (level: T) => ChallengeItem;
  count?: number;
}) {
  const [level, setLevel] = useState<T>(levels[0].id);
  const [items, setItems] = useState<ChallengeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [answers, setAnswers] = useState<number[]>([]);
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const playing = items.length > 0 && answers.length < items.length;
  const finished = items.length > 0 && answers.length === items.length;

  const start = (lv: T = level) => {
    const seen = new Set<string>();
    const list: ChallengeItem[] = [];
    for (let guard = 0; list.length < count && guard < 500; guard++) {
      const it = make(lv);
      if (seen.has(it.text) && guard < 400) continue;
      seen.add(it.text);
      list.push(it);
    }
    setItems(list);
    setIndex(0);
    setAnswers([]);
    setValue('');
    setState(undefined);
    setStartedAt(Date.now());
  };

  const submit = () => {
    if (!playing || value === '' || state) return;
    const given = Number(value);
    const ok = given === items[index].answer;
    setState(ok ? 'good' : 'bad');
    setMsg(praise());
    const next = [...answers, given];
    timer.current = window.setTimeout(
      () => {
        setAnswers(next);
        setValue('');
        setState(undefined);
        setIndex(i => i + 1);
        if (next.length === items.length) {
          const score = next.filter((a, i) => a === items[i].answer).length;
          setSeconds(Math.round((Date.now() - startedAt) / 1000));
          const missed = items
            .filter((it, i) => next[i] !== it.answer)
            .map(it => {
              const near = [it.answer - 1, it.answer + 1, it.answer + 10].filter(x => x >= 0 && x !== it.answer);
              return { question: `${it.text} = ?`, answers: [String(it.answer), ...near.slice(0, 2).map(String)], correctAnswer: String(it.answer) };
            });
          saveQuizResult(currentPath(), score, items.length, missed);
        }
      },
      ok ? 600 : 1400,
    );
  };

  const score = answers.filter((a, i) => a === items[i]?.answer).length;
  const stars = finished ? (score === items.length ? 3 : score >= items.length * 0.7 ? 2 : score >= items.length * 0.4 ? 1 : 0) : 0;

  return (
    <GameCard emoji="🏁" title="Предизвикателство" tone="violet" goal={`${count} задачи подред. Избери ниво и натисни „Старт“. Резултатът се пази в „Моят напредък“.`}>
      <LevelPicker
        levels={levels}
        value={level}
        onChange={id => {
          setLevel(id);
          if (items.length) start(id);
        }}
      />
      {items.length === 0 && (
        <div className="text-center py-6">
          <div className="text-6xl mb-3" aria-hidden>
            🚀
          </div>
          <BigButton onClick={() => start()} tone="violet">
            Старт!
          </BigButton>
        </div>
      )}
      {playing && (
        <KeyCatcher value={value} onChange={setValue} onSubmit={submit} enabled={!state}>
          <RoundBar done={answers.length} total={items.length} mistakes={answers.filter((a, i) => a !== items[i].answer).length} />
          <Problem>
            {items[index].text} = <AnswerBox value={value} state={state} />
          </Problem>
          {state === 'bad' && <Bubble tone="bad">Верният отговор е {fmt(items[index].answer)}.</Bubble>}
          {state === 'good' && <Bubble tone="good">{msg}</Bubble>}
          <NumPad value={value} onChange={setValue} onSubmit={submit} maxLength={5} disabled={!!state} />
        </KeyCatcher>
      )}
      {finished && (
        <div className="text-center py-2 motion-safe:animate-pop">
          <div className="text-5xl mb-2" aria-hidden>
            {stars === 3 ? '🏆' : stars >= 2 ? '🎉' : '💪'}
          </div>
          <Stars count={stars} size={40} />
          <p className="text-xl font-bold mt-2 text-gray-900 dark:text-white">
            {score} от {items.length} верни
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">за {seconds} секунди</p>
          {score < items.length && (
            <div className="mt-4 inline-block text-left bg-rose-50 dark:bg-rose-900/20 rounded-2xl px-5 py-3">
              <p className="font-semibold mb-1 text-rose-800 dark:text-rose-200">Да ги видим пак:</p>
              <ul className="space-y-0.5 tabular-nums">
                {items.map((it, i) =>
                  answers[i] === it.answer ? null : (
                    <li key={i}>
                      {it.text} = <b className="text-emerald-700 dark:text-emerald-300">{fmt(it.answer)}</b>{' '}
                      <span className="text-rose-600 dark:text-rose-400 line-through">{fmt(answers[i])}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
          <div className="mt-4">
            <BigButton onClick={() => start()} tone="violet">
              <RotateCcw className="inline mr-1 -mt-1" size={20} />
              Нови задачи
            </BigButton>
          </div>
        </div>
      )}
    </GameCard>
  );
}

// ---------- Текст около игрите ----------

/** Цветното начало на урока – кратка история. */
export function StoryHero({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 text-white p-5 sm:p-6 rounded-3xl mb-8 shadow-lg flex gap-4 items-start">
      <span className="text-5xl sm:text-6xl leading-none" aria-hidden>
        {emoji}
      </span>
      <div className="text-lg sm:text-xl leading-relaxed font-medium [&>p+p]:mt-2">{children}</div>
    </div>
  );
}

/** Малка „шпаргалка“ между игрите: как да мислим. */
export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="mb-10 -mt-4 mx-auto max-w-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl px-4 py-3 text-base sm:text-lg text-gray-800 dark:text-gray-100">
      <span className="mr-1" aria-hidden>
        💡
      </span>
      {children}
    </div>
  );
}

/** Кутия за възрастните накрая на урока. */
export function ForParents({ children }: { children: ReactNode }) {
  return (
    <details className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 group">
      <summary className="cursor-pointer font-semibold text-gray-800 dark:text-gray-100">👨‍👩‍👧 За родители и учители</summary>
      <div className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">{children}</div>
    </details>
  );
}
