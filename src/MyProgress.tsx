import { BookOpen, ListChecks, RotateCcw, Target, Trash2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Quiz, { type Question } from '~/Quiz';
import { clearProgress, hasActivity, lessonProgress, removeMistake, type LessonProgress } from '~/progress';
import { astronomyTopics, mathTopics } from '~/topics';

type Lesson = { path: string; name: string };
type Group = { name: string; lessons: Lesson[] };

const GROUPS: Group[] = [
  ...mathTopics.map(t => ({ name: t.name, lessons: t.subtopics.map(s => ({ path: t.path + s.path, name: s.name })) })),
  ...astronomyTopics.map(t => ({ name: t.name, lessons: t.subtopics.map((s, i) => ({ path: t.path + s.path, name: `${i + 1}. ${s.name}` })) })),
];
const LESSONS = GROUPS.flatMap(g => g.lessons);

type Data = Record<string, LessonProgress>;
const loadAll = (): Data => Object.fromEntries(LESSONS.map(l => [l.path, lessonProgress(l.path)]));

/** Сгрешените въпроси от всички уроци, с пътя до урока. */
const mistakesOf = (data: Data) => LESSONS.flatMap(l => (data[l.path].quiz?.missed ?? []).map(q => ({ ...q, path: l.path, lesson: l.name })));

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct(value, total)}%` }} />
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {note && <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
  );
}

function LessonRow({ lesson, p }: { lesson: Lesson; p: LessonProgress }) {
  const active = hasActivity(p);
  return (
    <li className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr] gap-x-4 gap-y-1.5 py-2.5 border-t border-gray-100 dark:border-gray-800 first:border-t-0 text-sm">
      <Link to={lesson.path} className={`font-medium hover:underline ${active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {lesson.name}
      </Link>
      {!active ? (
        <span className="sm:col-span-3 text-xs text-gray-400 dark:text-gray-500 sm:self-center">не е започнат</span>
      ) : (
        <>
          <Cell label="задачи" value={p.tasksSolved} total={p.tasksTotal} color="bg-blue-500" />
          <Cell label="от живота" value={p.problemsSolved} total={p.problemsTotal} color="bg-emerald-500" />
          {p.quiz ? (
            <Cell label="тест (най-добър)" value={p.quiz.best} total={p.quiz.total} color="bg-amber-500" />
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 sm:self-center">тест – не е правен</span>
          )}
        </>
      )}
    </li>
  );
}

function Cell({ label, value, total, color }: { label: string; value: number; total: number | null; color: string }) {
  if (total === null && value === 0) return <span className="hidden sm:block" />;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{label}</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {value}
            {total !== null && ` / ${total}`}
          </span>
        </div>
        {total !== null && <Bar value={value} total={total} color={color} />}
      </div>
    </div>
  );
}

export function MyProgress() {
  // Прогресът е само в браузъра – чете се след зареждане (при build страницата е празна)
  const [data, setData] = useState<Data | null>(null);
  const [review, setReview] = useState<(Question & { path: string })[] | null>(null);
  const [round, setRound] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => setData(loadAll()), []);

  if (!data) {
    return (
      <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Моят напредък</h1>
          <p className="text-gray-500 dark:text-gray-400">Зареждане…</p>
        </div>
      </main>
    );
  }

  const all = LESSONS.map(l => data[l.path]);
  const started = all.filter(hasActivity).length;
  const tasks = all.reduce((s, p) => s + p.tasksSolved + p.problemsSolved, 0);
  const quizzes = all.filter(p => p.quiz);
  const quizAvg = quizzes.length ? Math.round(quizzes.reduce((s, p) => s + pct(p.quiz!.best, p.quiz!.total), 0) / quizzes.length) : 0;
  const mistakes = mistakesOf(data);

  const startReview = () => {
    setReview(mistakes);
    setRound(r => r + 1);
  };
  const endReview = () => {
    setReview(null);
    setData(loadAll());
  };

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">Моят напредък</h1>
        <p className="mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Решените задачи и резултатите от тестовете се пазят само в този браузър – без регистрация. На друго устройство напредъкът няма да се вижда.
        </p>

        <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={<BookOpen size={16} />} label="Започнати уроци" value={`${started} / ${LESSONS.length}`} />
          <Stat icon={<ListChecks size={16} />} label="Решени задачи" value={String(tasks)} note="за упражнение и от живота" />
          <Stat icon={<Trophy size={16} />} label="Направени тестове" value={String(quizzes.length)} note={quizzes.length ? `среден най-добър резултат ${quizAvg}%` : undefined} />
          <Stat icon={<Target size={16} />} label="Грешки за преговор" value={String(mistakes.length)} />
        </section>

        {started === 0 ? (
          <section className="mb-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Още няма напредък</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Отвори урок, реши задача или направи бързия тест накрая – и тук ще се появят резултатите ти. Добро начало са{' '}
              <Link to="/algebra/fractions" className="text-blue-600 dark:text-blue-400 hover:underline">
                Дроби и проценти
              </Link>{' '}
              или{' '}
              <Link to="/astronomy/lecture01" className="text-blue-600 dark:text-blue-400 hover:underline">
                Небесната сфера
              </Link>
              .
            </p>
          </section>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">🔁 Преговори грешките</h2>
              {review ? (
                <>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Въпросите, на които отговориш вярно, излизат от списъка с грешки.</p>
                  <Quiz
                    key={round}
                    questions={review}
                    record={false}
                    onAnswer={(q, ok) => {
                      if (ok) removeMistake((q as Question & { path: string }).path, q.question);
                    }}
                  />
                  <button onClick={endReview} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    ← Край на преговора
                  </button>
                </>
              ) : mistakes.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {quizzes.length ? '🎉 Няма сгрешени въпроси за преговор.' : 'Сгрешените въпроси от бързите тестове ще се събират тук.'}
                </p>
              ) : (
                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-4 sm:p-5">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
                    Имаш <strong>{mistakes.length}</strong> {mistakes.length === 1 ? 'сгрешен въпрос' : 'сгрешени въпроса'} от последните опити на тестовете в{' '}
                    {new Set(mistakes.map(m => m.path)).size === 1 ? '1 урок' : `${new Set(mistakes.map(m => m.path)).size} урока`}:{' '}
                    {[...new Set(mistakes.map(m => m.lesson))].join(', ')}.
                  </p>
                  <button
                    onClick={startReview}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm"
                  >
                    <RotateCcw size={16} /> Започни преговора
                  </button>
                </div>
              )}
            </section>

            <section className="mb-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">По уроци</h2>
                <button onClick={() => setShowAll(v => !v)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {showAll ? 'само започнатите' : 'покажи всички уроци'}
                </button>
              </div>
              <div className="space-y-4">
                {GROUPS.map(g => {
                  const lessons = showAll ? g.lessons : g.lessons.filter(l => hasActivity(data[l.path]));
                  if (!lessons.length) return null;
                  return (
                    <div key={g.name} className="rounded-xl border border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
                      <h3 className="pt-2 pb-1 font-semibold text-gray-800 dark:text-gray-100">{g.name}</h3>
                      <ul>
                        {lessons.map(l => (
                          <LessonRow key={l.path} lesson={l} p={data[l.path]} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mb-8 text-sm">
              {confirmClear ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-700 dark:text-gray-300">Целият напредък ще бъде изтрит. Сигурен ли си?</span>
                  <button
                    onClick={() => {
                      clearProgress();
                      setConfirmClear(false);
                      setData(loadAll());
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    Да, изтрий
                  </button>
                  <button onClick={() => setConfirmClear(false)} className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Отказ
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)} className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                  <Trash2 size={15} /> Изтрий целия напредък
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
