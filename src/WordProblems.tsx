import { CheckCircle2, Lightbulb, ListChecks, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { MathText } from './MathText';

export type WordProblem = {
  title: string;
  problem: string;
  solution: string[];
  answer: string;
  /** Очаквани числени отговори (в реда на полетата в `ask`). */
  check?: number[];
  /** Какво да въведе ученикът във всяко поле, напр. „височина, m“. */
  ask?: string[];
};

type Status = 'solved' | 'shown';

const storageKey = () => `libera-problems:${typeof window === 'undefined' ? '' : window.location.pathname}`;
function loadStatus(): Record<string, Status> {
  try {
    const raw = window.localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const parseNum = (s: string) => {
  const v = Number(s.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'));
  return s.trim() === '' || Number.isNaN(v) ? null : v;
};
const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.011, Math.abs(b) * 0.006);

/** Всички стойности съвпадат – в произволен ред. */
function matches(values: (number | null)[], expected: number[]) {
  if (values.some(v => v === null)) return false;
  const left = expected.slice();
  for (const v of values as number[]) {
    const k = left.findIndex(e => close(v, e));
    if (k < 0) return false;
    left.splice(k, 1);
  }
  return true;
}

function Problem({ p, status, setStatus }: { p: WordProblem; status?: Status; setStatus: (s: Status | null) => void }) {
  const fields = p.check?.length ? (p.ask ?? p.check.map(() => 'отговор')) : [];
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''));
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [revealed, setRevealed] = useState(0);
  const solved = status === 'solved';
  const steps = p.solution.length + 1; // последната стъпка е отговорът
  const allShown = revealed >= steps;

  const submit = () => {
    if (!p.check) return;
    const ok = matches(values.map(parseNum), p.check);
    setFeedback(ok ? 'right' : 'wrong');
    if (ok) setStatus('solved');
    else setWrong(w => w + 1);
  };
  const reveal = (n: number) => {
    setRevealed(n);
    if (n >= steps && !solved) setStatus('shown');
  };

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col shadow-sm transition-colors ${
        solved ? 'border-green-300 bg-green-50/70 dark:border-green-700/60 dark:bg-green-900/15' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <p className="font-semibold mb-2 flex items-start gap-2">
        <span className="flex-1">{p.title}</span>
        {solved && <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex-1"><MathText>{p.problem}</MathText></p>

      {fields.length > 0 && !solved && (
        <form
          onSubmit={e => {
            e.preventDefault();
            submit();
          }}
          className="mb-2"
        >
          <div className="flex flex-wrap gap-2">
            {fields.map((label, i) => (
              <label key={label + i} className="flex-1 min-w-[7rem]">
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</span>
                <input
                  inputMode="decimal"
                  value={values[i]}
                  onChange={e => {
                    const v = e.target.value;
                    setValues(prev => prev.map((x, k) => (k === i ? v : x)));
                    setFeedback(null);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-sm font-mono bg-white dark:bg-gray-900 ${
                    feedback === 'wrong' ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-2 w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
            Провери
          </button>
        </form>
      )}

      {feedback === 'wrong' && !solved && (
        <p className="mb-2 flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
          <XCircle size={16} /> {wrong >= 2 ? 'Пак не е. Виж подсказка!' : 'Не е вярно – опитай пак.'}
        </p>
      )}
      {solved && (
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
          <CheckCircle2 size={16} /> {feedback === 'right' ? 'Вярно! Браво!' : 'Решена'} · <MathText>{p.answer}</MathText>
        </p>
      )}

      {revealed > 0 && (
        <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm space-y-1">
          {p.solution.slice(0, revealed).map((line, i) => (
            <p key={line} className="flex gap-2">
              <span className="text-blue-400 dark:text-blue-500 select-none">{i + 1}.</span>
              <span><MathText>{line}</MathText></span>
            </p>
          ))}
          {allShown && <p className="pt-1 font-semibold">Отговор: <MathText>{p.answer}</MathText></p>}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 text-sm">
        {!allShown && (
          <button
            onClick={() => reveal(revealed + 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:hover:bg-amber-500/30"
          >
            <Lightbulb size={14} />
            {revealed === 0 ? 'Подсказка' : revealed === steps - 1 ? 'Покажи отговора' : `Стъпка ${revealed + 1}/${steps}`}
          </button>
        )}
        {!allShown && revealed < steps - 1 && (
          <button onClick={() => reveal(steps)} className="px-2.5 py-1 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
            Цялото решение
          </button>
        )}
        {revealed > 0 && (
          <button onClick={() => setRevealed(0)} className="px-2.5 py-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            Скрий
          </button>
        )}
        {fields.length === 0 && !solved && (
          <button onClick={() => setStatus('solved')} className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700">
            <CheckCircle2 size={14} /> Реших я
          </button>
        )}
      </div>
    </div>
  );
}

/** Текстови задачи с проверка на отговора, подсказки стъпка по стъпка и запомнен прогрес. */
export function WordProblems({ problems }: { problems: WordProblem[] }) {
  const [status, setStatusMap] = useState<Record<string, Status>>(loadStatus);
  const setStatus = (title: string, s: Status | null) =>
    setStatusMap(prev => {
      const next = { ...prev };
      if (s) next[title] = s;
      else delete next[title];
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(next));
      } catch {
        // без запомняне – няма проблем
      }
      return next;
    });
  const solved = problems.filter(p => status[p.title] === 'solved').length;
  const [round, setRound] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
          <ListChecks size={16} className="text-blue-600 dark:text-blue-400" />
          {solved} / {problems.length}
        </span>
        <div className="flex-1 flex gap-1">
          {problems.map(p => (
            <span
              key={p.title}
              className={`h-2 flex-1 rounded-full ${status[p.title] === 'solved' ? 'bg-green-500' : status[p.title] === 'shown' ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        {solved === problems.length && <span>🏆</span>}
        {Object.keys(status).length > 0 && (
          <button
            onClick={() => {
              problems.forEach(p => setStatus(p.title, null));
              setRound(r => r + 1);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={13} /> отначало
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map(p => (
          <Problem key={`${p.title}-${round}`} p={p} status={status[p.title]} setStatus={s => setStatus(p.title, s)} />
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Зелено – решена сам(а), жълто – с решението. Десетичните числа може да пишеш със запетая.
      </p>
    </div>
  );
}
