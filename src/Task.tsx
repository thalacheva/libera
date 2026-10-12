import { CheckCircle2, ChevronDown, Eye, EyeOff, Lightbulb, ListChecks, RotateCcw, XCircle } from 'lucide-react';
import { Children, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { matches, matchesInOrder, parseNum } from './answerCheck';
import { MathText } from './MathText';
import { currentPath, saveTasksTotal } from './progress';

type Level = 'A' | 'B' | 'C';
type Status = 'solved' | 'retry';

const LEVELS: Record<Level, { name: string; round: string; dot: string; text: string; badge: string; ring: string; bar: string }> = {
  A: {
    name: 'Ниво А',
    round: 'Областен кръг',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    ring: 'border-green-500',
    bar: 'bg-green-500',
  },
  B: {
    name: 'Ниво В',
    round: 'Национален кръг',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    ring: 'border-yellow-500',
    bar: 'bg-yellow-500',
  },
  C: {
    name: 'Ниво С',
    round: 'Международна олимпиада',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    ring: 'border-red-500',
    bar: 'bg-red-500',
  },
};

const levelFromColor = (color: string): Level => (color.includes('red') ? 'C' : color.includes('yellow') ? 'B' : 'A');

type Entry = { id: string; number: number; level: Level };
type Board = {
  status: Record<string, Status>;
  setStatus: (id: string, s: Status | null) => void;
  register: (e: Entry) => void;
  filter: Level | null;
  hideSolved: boolean;
  entries: Entry[];
};
const BoardContext = createContext<Board | null>(null);

const storageKey = () => `libera-tasks:${typeof window === 'undefined' ? '' : window.location.pathname}`;
function loadStatus(): Record<string, Status> {
  try {
    const raw = window.localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Обвивка на раздела със задачи: прогрес, филтър по ниво и запомняне на решените. */
export function TaskBoard({ children }: { children: ReactNode }) {
  const [status, setStatusMap] = useState<Record<string, Status>>(loadStatus);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<Level | null>(null);
  const [hideSolved, setHideSolved] = useState(false);

  const register = useCallback((e: Entry) => {
    setEntries(prev => (prev.some(p => p.id === e.id) ? prev : [...prev, e].sort((a, b) => a.number - b.number)));
  }, []);
  const setStatus = useCallback((id: string, s: Status | null) => {
    setStatusMap(prev => {
      const next = { ...prev };
      if (s) next[id] = s;
      else delete next[id];
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(next));
      } catch {
        // без запомняне – няма проблем
      }
      return next;
    });
  }, []);
  const ctx = useMemo(() => ({ status, setStatus, register, filter, hideSolved, entries }), [status, setStatus, register, filter, hideSolved, entries]);

  // Общият брой задачи – за страницата „Моят напредък“
  useEffect(() => {
    if (entries.length) saveTasksTotal(currentPath(), entries.length);
  }, [entries.length]);

  const solved = entries.filter(e => status[e.id] === 'solved').length;
  const reset = () => entries.forEach(e => setStatus(e.id, null));

  return (
    <BoardContext.Provider value={ctx}>
      <div className="lg:sticky lg:top-0 z-10 -mx-1 px-1 pt-1 pb-3 mb-3 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
              <ListChecks size={16} className="text-blue-600 dark:text-blue-400" />
              {solved} / {entries.length}
            </span>
            <div className="flex-1 flex gap-1">
              {entries.map(e => (
                <button
                  key={e.id}
                  onClick={() => document.getElementById(`task-${e.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  aria-label={`Задача ${e.number}`}
                  title={`Задача ${e.number}`}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    status[e.id] === 'solved' ? LEVELS[e.level].bar : status[e.id] === 'retry' ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            {solved === entries.length && entries.length > 0 && <span className="whitespace-nowrap">🏆</span>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <button
              onClick={() => setFilter(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${filter === null ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Всички
            </button>
            {(['A', 'B', 'C'] as const).map(l => {
              const inLevel = entries.filter(e => e.level === l);
              if (!inLevel.length) return null;
              const d = inLevel.filter(e => status[e.id] === 'solved').length;
              return (
                <button
                  key={l}
                  onClick={() => setFilter(f => (f === l ? null : l))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${filter === l ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${LEVELS[l].dot}`} />
                  {LEVELS[l].name}
                  <span className="text-gray-500 dark:text-gray-400">
                    {d}/{inLevel.length}
                  </span>
                </button>
              );
            })}
            <span className="flex-1" />
            <button onClick={() => setHideSolved(v => !v)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              {hideSolved ? <Eye size={14} /> : <EyeOff size={14} />}
              {hideSolved ? 'покажи решените' : 'скрий решените'}
            </button>
            {solved > 0 && (
              <button onClick={reset} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <RotateCcw size={14} /> отначало
              </button>
            )}
          </div>
        </div>
      </div>
      {children}
    </BoardContext.Provider>
  );
}

/** Заглавие на ниво задачи. */
export function TaskLevel({ level }: { level: Level }) {
  const board = useContext(BoardContext);
  const L = LEVELS[level];
  if (board?.filter && board.filter !== level) return null;
  const inLevel = board?.entries.filter(e => e.level === level) ?? [];
  const d = inLevel.filter(e => board?.status[e.id] === 'solved').length;
  return (
    <h3 className={`flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 mt-1 ${L.text}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${L.dot}`} />
      {L.name}
      <span className="font-normal text-sm text-gray-500 dark:text-gray-400">· {L.round}</span>
      {inLevel.length > 0 && (
        <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">
          {d}/{inLevel.length} решени
        </span>
      )}
    </h3>
  );
}

/**
 * Задача с поетапно решение. Ако има числов отговор (`check`), ученикът го въвежда и задачата
 * се отбелязва като решена при верен отговор; иначе (доказателства, формули) – с „Реших я“.
 */
export default function Task({
  id,
  number,
  color,
  question,
  check,
  ask,
  anyOrder = false,
  children,
}: {
  id: string;
  number: number;
  color: string;
  question: ReactNode;
  /** Очакваните числени отговори – поред, освен ако `anyOrder`. */
  check?: number[];
  /** Какво да се въведе във всяко поле, напр. „x“ или „брой делители“. */
  ask?: string[];
  /** Отговорите може да са в произволен ред (напр. корените на уравнение). */
  anyOrder?: boolean;
  children: ReactNode;
}) {
  const board = useContext(BoardContext);
  const level = levelFromColor(color);
  const L = LEVELS[level];
  const steps = Children.toArray(children);
  const [revealed, setRevealed] = useState(0);
  const [open, setOpen] = useState(false);
  const fields = check?.length ? (ask ?? check.map(() => 'отговор')) : [];
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''));
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [wrong, setWrong] = useState(0);
  const register = board?.register;
  useEffect(() => register?.({ id, number, level }), [register, id, number, level]);

  const status = board?.status[id];
  const solved = status === 'solved';
  if (board?.filter && board.filter !== level) return null;
  if (board?.hideSolved && solved) return null;

  const collapsed = solved && !open;
  const allShown = revealed >= steps.length;

  const submit = () => {
    if (!check || !board) return;
    const nums = values.map(parseNum);
    if (anyOrder ? matches(nums, check) : matchesInOrder(nums, check)) {
      setFeedback('right');
      board.setStatus(id, 'solved');
      // остава отворена, за да се види „Вярно!“
      setOpen(true);
    } else {
      setFeedback('wrong');
      setWrong(w => w + 1);
    }
  };

  return (
    <div
      id={`task-${id}`}
      className={`scroll-mt-40 rounded-xl mb-3 border border-l-4 transition-colors ${L.ring} ${
        solved ? 'bg-green-50/60 dark:bg-green-900/10 border-y-green-200 border-r-green-200 dark:border-y-green-800/50 dark:border-r-green-800/50' : 'bg-white dark:bg-gray-800 border-y-gray-200 border-r-gray-200 dark:border-y-gray-700 dark:border-r-gray-700'
      }`}
    >
      <button onClick={() => solved && setOpen(o => !o)} className={`w-full flex items-start gap-3 text-left p-3 sm:p-4 ${solved ? 'cursor-pointer' : 'cursor-default'}`}>
        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${solved ? 'bg-green-600 text-white' : L.badge}`}>
          {solved ? <CheckCircle2 size={16} /> : number}
        </span>
        <span className={`flex-1 font-semibold ${collapsed ? 'text-gray-500 dark:text-gray-400 line-clamp-1' : ''}`}>{typeof question === 'string' ? <MathText>{question}</MathText> : question}</span>
        {solved && <ChevronDown size={18} className={`flex-shrink-0 mt-1 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {!collapsed && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 -mt-1">
          {fields.length > 0 && !solved && board && (
            <form
              onSubmit={e => {
                e.preventDefault();
                submit();
              }}
              className="mb-3"
            >
              <div className="flex flex-wrap items-end gap-2">
                {fields.map((label, i) => (
                  <label key={label + i} className="w-full sm:w-auto sm:min-w-[8rem] sm:flex-1 sm:max-w-[14rem]">
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      <MathText>{label}</MathText>
                    </span>
                    <input
                      inputMode="decimal"
                      aria-label={label}
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
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                  Провери
                </button>
              </div>
              {feedback === 'wrong' ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
                  <XCircle size={16} /> {wrong >= 2 ? 'Пак не е. Виж подсказката!' : 'Не е вярно – опитай пак.'}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Дробите – като 3/2, десетичните – със запетая{anyOrder && fields.length > 1 ? '; отговорите – в произволен ред' : ''}.
                </p>
              )}
            </form>
          )}
          {feedback === 'right' && solved && (
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
              <CheckCircle2 size={16} /> Вярно! Браво!
            </p>
          )}
          {revealed > 0 && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
              {steps.slice(0, revealed).map((s, i) => (
                <div key={i} className="flex gap-2">
                  {steps.length > 1 && <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center justify-center">{i + 1}</span>}
                  <div className="flex-1 min-w-0 space-y-2">{s}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {!allShown && (
              <>
                <button
                  onClick={() => setRevealed(r => r + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:hover:bg-amber-500/30"
                >
                  <Lightbulb size={15} />
                  {revealed === 0 ? (steps.length > 1 ? 'Подсказка' : 'Покажи отговора') : `Следваща стъпка (${revealed + 1}/${steps.length})`}
                </button>
                {steps.length > 1 && (
                  <button onClick={() => setRevealed(steps.length)} className="px-3 py-1.5 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    Цялото решение
                  </button>
                )}
              </>
            )}
            {revealed > 0 && (
              <button onClick={() => setRevealed(0)} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                Скрий
              </button>
            )}
            {board && (
              <span className="ml-auto inline-flex gap-1.5">
                {solved ? (
                  <button onClick={() => board.setStatus(id, null)} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Отбележи като нерешена
                  </button>
                ) : (
                  <>
                    {revealed > 0 && status !== 'retry' && (
                      <button onClick={() => board.setStatus(id, 'retry')} className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        ↺ Ще опитам пак
                      </button>
                    )}
                    {fields.length === 0 && (
                      <button
                        onClick={() => {
                          board.setStatus(id, 'solved');
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle2 size={15} /> Реших я
                      </button>
                    )}
                  </>
                )}
              </span>
            )}
          </div>
          {status === 'retry' && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Отбелязана за повторение – опитай отново, без да гледаш решението.</p>}
        </div>
      )}
    </div>
  );
}
