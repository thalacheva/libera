import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';

export type Question = {
  question: string;
  answers: string[];
  correctAnswer: string;
};

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];

/** Детерминирано разбъркване – нов ред при всеки нов опит. */
function shuffle<T>(items: T[], seed: number) {
  const out = items.slice();
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function verdict(score: number, total: number) {
  const r = score / total;
  if (r === 1) return { stars: 3, text: 'Перфектно! Владееш материала отлично.' };
  if (r >= 0.7) return { stars: 2, text: 'Много добре! Прегледай пропуснатото и ще е перфектно.' };
  if (r >= 0.4) return { stars: 1, text: 'Добро начало. Върни се към лабораториите и опитай пак.' };
  return { stars: 0, text: 'Прочети лекцията още веднъж – после ще се справиш по-добре.' };
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [attempt, setAttempt] = useState(0);
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<(string | null)[]>(() => questions.map(() => null));
  const [finished, setFinished] = useState(false);

  // При първия опит въпросите са в авторския ред; при следващите – разбъркани
  const order = useMemo(() => (attempt === 0 ? questions.map((_, i) => i) : shuffle(questions.map((_, i) => i), attempt)), [questions, attempt]);
  const answerOrder = useMemo(() => questions.map((q, i) => shuffle(q.answers, attempt * 31 + i + 1)), [questions, attempt]);

  const total = questions.length;
  const qi = order[current];
  const q = questions[qi];
  const answers = answerOrder[qi];
  const picked = chosen[qi];
  const answered = picked !== null;
  const isRight = (i: number) => chosen[i] === questions[i].correctAnswer;
  const score = questions.reduce((s, _, i) => s + (isRight(i) ? 1 : 0), 0);
  const done = chosen.filter(c => c !== null).length;

  // Поредни верни отговори (по реда на въпросите в този опит)
  let streak = 0;
  for (let k = current; k >= 0; k--) {
    const i = order[k];
    if (chosen[i] === null) continue;
    if (!isRight(i)) break;
    streak++;
  }

  const pick = (ans: string) => {
    if (answered) return;
    setChosen(prev => prev.map((c, i) => (i === qi ? ans : c)));
  };
  const next = () => {
    if (current < total - 1) setCurrent(current + 1);
    else if (done === total) setFinished(true);
  };
  const restart = () => {
    setAttempt(a => a + 1);
    setCurrent(0);
    setChosen(questions.map(() => null));
    setFinished(false);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (finished) return;
    const n = Number(e.key);
    if (n >= 1 && n <= answers.length) {
      pick(answers[n - 1]);
      e.preventDefault();
    } else if ((e.key === 'Enter' || e.key === 'ArrowRight') && answered) {
      next();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && current > 0) {
      setCurrent(current - 1);
      e.preventDefault();
    }
  };

  if (finished) {
    const v = verdict(score, total);
    const missed = order.filter(i => !isRight(i));
    return (
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">
                {score} / {total}
              </p>
              <p className="text-xl tracking-wider" aria-label={`${v.stars} от 3 звезди`}>
                {[0, 1, 2].map(i => (
                  <span key={i} className={i < v.stars ? '' : 'opacity-25 grayscale'}>
                    ⭐
                  </span>
                ))}
              </p>
            </div>
          </div>
          <p className="flex-1 text-base sm:text-lg text-amber-900 dark:text-amber-100">{v.text}</p>
          <button onClick={restart} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm">
            <RotateCcw size={16} /> Опитай отново
          </button>
        </div>
        {missed.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Правилните отговори на пропуснатите въпроси:</p>
            {missed.map(i => (
              <div key={i} className="text-sm bg-white/80 dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-amber-200/60 dark:border-amber-500/20">
                <p className="text-gray-600 dark:text-gray-400">{questions[i].question}</p>
                <p className="mt-1 font-medium text-green-700 dark:text-green-400">✓ {questions[i].correctAnswer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-4 sm:p-5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {/* Прогрес */}
      <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm">
        <span className="font-semibold text-amber-900 dark:text-amber-200 whitespace-nowrap">
          {current + 1} / {total}
        </span>
        <div className="flex-1 flex gap-1">
          {order.map((i, k) => (
            <button
              key={i}
              onClick={() => setCurrent(k)}
              aria-label={`Въпрос ${k + 1}`}
              className={`h-2 flex-1 rounded-full transition-all ${
                chosen[i] === null ? 'bg-amber-200 dark:bg-amber-500/25' : isRight(i) ? 'bg-green-500' : 'bg-red-500'
              } ${k === current ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-amber-50 dark:ring-offset-gray-900' : ''}`}
            />
          ))}
        </div>
        <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">
          ✓ {score}
          {streak >= 3 && <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">🔥 {streak}</span>}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100 mb-3">{q.question}</h3>

      <div className={`grid gap-2 ${answers.every(a => a.length < 45) ? 'sm:grid-cols-2' : ''}`}>
        {answers.map((ans, i) => {
          const correct = ans === q.correctAnswer;
          const state = !answered ? 'idle' : correct ? 'right' : ans === picked ? 'wrong' : 'dim';
          return (
            <button
              key={ans}
              onClick={() => pick(ans)}
              disabled={answered}
              className={`flex items-start gap-3 text-left px-3 py-2.5 rounded-xl border text-sm sm:text-base transition-all ${
                state === 'idle'
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-amber-400 hover:-translate-y-0.5 hover:shadow-sm dark:hover:border-amber-600 text-gray-700 dark:text-gray-200'
                  : state === 'right'
                    ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 font-medium'
                    : state === 'wrong'
                      ? 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100'
                      : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'
              }`}
            >
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                  state === 'right' ? 'bg-green-600 text-white' : state === 'wrong' ? 'bg-red-600 text-white' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                }`}
              >
                {state === 'right' ? '✓' : state === 'wrong' ? '✗' : LETTERS[i]}
              </span>
              <span className="pt-px">{ans}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-3 min-h-9">
        <button
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0}
          aria-label="Предишен въпрос"
          className="p-1.5 rounded-lg text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-sm font-semibold">
          {answered ? (
            picked === q.correctAnswer ? (
              <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400">
                <CheckCircle2 size={18} /> {streak >= 3 ? `Браво! ${streak} поредни верни!` : 'Правилно!'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400">
                <XCircle size={18} /> Не съвсем – верният отговор е маркиран в зелено.
              </span>
            )
          ) : (
            <span className="font-normal text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Избери отговор (или натисни 1–{answers.length})</span>
          )}
        </div>
        {answered &&
          (current < total - 1 ? (
            <button onClick={next} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">
              Следващ <ChevronRight size={16} />
            </button>
          ) : done === total ? (
            <button onClick={next} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">
              <Trophy size={16} /> Резултат
            </button>
          ) : (
            <button
              onClick={() => setCurrent(order.findIndex(i => chosen[i] === null))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
            >
              Към пропуснатите <ChevronRight size={16} />
            </button>
          ))}
      </div>
    </div>
  );
}
