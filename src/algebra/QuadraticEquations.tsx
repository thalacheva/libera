import { CheckCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import BiquadraticLab from './BiquadraticLab';
import RootsParameterLab from './RootsParameterLab';
import VietaLab from './VietaLab';
import { MathText, Tex } from '~/MathText';

// ---------- Помощни функции ----------

const num = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const round = (n: number) => num(Math.round(n * 100) / 100);

// Записва ax² + bx + c (без излишни 1, 0 и знаци)
const fmtQuad = (a: number, b: number, c: number) => {
  const terms: [number, string][] = [[a, 'x²'], [b, 'x'], [c, '']];
  let s = '';
  for (const [k, v] of terms) {
    if (k === 0) continue;
    const abs = Math.abs(k);
    const body = v && abs === 1 ? v : `${abs}${v}`;
    s += s === '' ? (k < 0 ? `−${body}` : body) : k < 0 ? ` − ${body}` : ` + ${body}`;
  }
  return s || '0';
};

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

// ---------- Изследване на параболата ----------

function ParabolaExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);

  const X = (x: number) => 200 + x * 18;
  const Y = (y: number) => 150 - y * 12;
  const f = (x: number) => a * x * x + b * x + c;

  const D = b * b - 4 * a * c;
  const isQuadratic = a !== 0;
  const roots =
    !isQuadratic ? (b !== 0 ? [-c / b] : [])
    : D > 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q)
    : D === 0 ? [-b / (2 * a)]
    : [];
  const vx = isQuadratic ? -b / (2 * a) : 0;
  const vy = isQuadratic ? -D / (4 * a) : 0;

  // Етикетите на корените – от страната, където няма парабола; при близки корени – на два реда
  const rootLabelY = (i: number) => {
    const above = roots.length === 1 ? a < 0 : a > 0;
    const close = roots.length === 2 && (roots[1] - roots[0]) * 18 < 80;
    const extra = close && i === 1 ? 14 : 0;
    return above ? Y(0) - 10 - extra : Y(0) + 22 + extra;
  };

  const path = Array.from({ length: 221 }, (_, i) => {
    const x = -11 + i * 0.1;
    const y = Math.max(-30, Math.min(30, f(x)));
    return `${i === 0 ? 'M' : 'L'} ${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
  }).join(' ');

  const cases = [
    { active: isQuadratic && D > 0, title: 'D > 0', text: 'Два различни реални корена – параболата пресича оста Ox в две точки', color: 'green' },
    { active: isQuadratic && D === 0, title: 'D = 0', text: 'Един двоен корен – параболата само докосва оста Ox с върха си', color: 'yellow' },
    { active: isQuadratic && D < 0, title: 'D < 0', text: 'Няма реални корени – параболата изобщо не достига оста Ox', color: 'red' },
  ];
  const caseStyles: { [key: string]: string } = {
    green: 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <p className="text-center font-mono text-lg sm:text-xl mb-1 text-gray-800 dark:text-gray-100">
        {fmtQuad(a, b, c)} = 0
      </p>
      <p className="text-center font-mono text-sm sm:text-base mb-2 text-gray-600 dark:text-gray-400">
        {isQuadratic
          ? `D = (${num(b)})² − 4·(${num(a)})·(${num(c)}) = ${round(D)}`
          : 'a = 0 – уравнението вече не е квадратно, а линейно!'}
      </p>

      <svg viewBox="0 0 400 300" className="w-full h-auto max-w-lg mx-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="parabolaArea">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        {/* Мрежа */}
        {Array.from({ length: 23 }, (_, i) => i - 11).map(i => (
          <line key={`v${i}`} x1={X(i)} y1={0} x2={X(i)} y2={300} stroke="currentColor" opacity="0.08" />
        ))}
        {Array.from({ length: 25 }, (_, i) => i - 12).map(i => (
          <line key={`h${i}`} x1={0} y1={Y(i)} x2={400} y2={Y(i)} stroke="currentColor" opacity="0.08" />
        ))}
        {/* Оси */}
        <line x1={0} y1={Y(0)} x2={400} y2={Y(0)} stroke="currentColor" strokeWidth="1.5" />
        <line x1={X(0)} y1={0} x2={X(0)} y2={300} stroke="currentColor" strokeWidth="1.5" />
        <text x={392} y={Y(0) - 6} fontSize="12" fill="currentColor" textAnchor="end">x</text>
        <text x={X(0) + 6} y={12} fontSize="12" fill="currentColor">y</text>
        {[-10, -5, 5, 10].map(t => (
          <text key={t} x={X(t)} y={Y(0) + 14} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.6">{t}</text>
        ))}

        {/* Ос на симетрия и връх */}
        {isQuadratic && (
          <>
            <line x1={X(vx)} y1={0} x2={X(vx)} y2={300} stroke="rgb(168, 85, 247)" strokeDasharray="4,4" opacity="0.6" />
            <circle cx={X(vx)} cy={Y(vy)} r="5" fill="rgb(168, 85, 247)" clipPath="url(#parabolaArea)" />
            {Math.abs(vy) < 12 && D !== 0 && (
              <text
                x={X(vx) + 8}
                y={a > 0 ? Y(vy) + 16 : Y(vy) - 8}
                fontSize="10"
                fill="rgb(168, 85, 247)"
              >
                връх ({round(vx)}; {round(vy)})
              </text>
            )}
          </>
        )}

        {/* Графика */}
        <path d={path} fill="none" stroke="rgb(34, 197, 94)" strokeWidth="3" clipPath="url(#parabolaArea)" />

        {/* Корени */}
        {roots.filter(r => Math.abs(r) <= 11).map((r, i) => (
          <g key={i}>
            <circle cx={X(r)} cy={Y(0)} r="6" fill="rgb(239, 68, 68)" />
            <text
              x={X(r)}
              y={rootLabelY(i)}
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fill="rgb(239, 68, 68)"
            >
              {roots.length === 1 && isQuadratic ? `x₁ = x₂ = ${round(r)}` : roots.length === 1 ? `x = ${round(r)}` : `x${i === 0 ? '₁' : '₂'} = ${round(r)}`}
            </text>
          </g>
        ))}
      </svg>

      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <label className="text-sm font-semibold">
          a = {num(a)}
          <input type="range" min="-3" max="3" step="0.5" value={a} onChange={e => setA(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm font-semibold">
          b = {num(b)}
          <input type="range" min="-10" max="10" step="1" value={b} onChange={e => setB(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm font-semibold">
          c = {num(c)}
          <input type="range" min="-10" max="10" step="1" value={c} onChange={e => setC(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 sm:gap-3 mt-4 text-sm">
        {cases.map(k => (
          <div
            key={k.title}
            className={`p-3 rounded-lg border-2 transition-all ${k.active ? `${caseStyles[k.color]} scale-[1.03] shadow-md` : 'border-gray-200 dark:border-gray-700 opacity-50'}`}
          >
            <p className="font-semibold font-mono">{k.title}</p>
            <p>{k.text}</p>
          </div>
        ))}
      </div>
      <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400 mt-3">
        Опитай: какво става с параболата, когато a е отрицателно? А когато увеличаваш c?
      </p>
    </div>
  );
}

// ---------- Допълване до точен квадрат (геометрично) ----------

function CompletingTheSquare() {
  const [step, setStep] = useState(0);

  // Мащаб: x = 3 → 90 px, 5 → 150 px
  const u = 30;
  const ox = 50;
  const oy = 30;
  const xs = 3 * u;
  const fs = 5 * u;

  const equations = [
    'x² + 10x = 39',
    'x² + 10x + 25 = 39 + 25',
    '(x + 5)² = 64   →   x + 5 = 8   →   x = 3',
  ];
  const explanations = [
    'x² е квадрат със страна x. Членът 10x разделяме на два правоъгълника 5 × x и ги долепяме отдясно и отдолу. Получаваме фигура с лице 39.',
    'Фигурата е почти квадрат – липсва ъгълчето 5 × 5 = 25. Добавяме го и към двете страни на уравнението.',
    'Сега имаме цял квадрат със страна x + 5 и лице 64. Значи x + 5 = 8 и x = 3. (Ал-Хорезми не е признавал отрицателния корен x = −13.)',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-2 text-center text-gray-800 dark:text-gray-100">
        📐 Задачата на ал-Хорезми (IX век)
      </h3>
      <p className="text-center font-mono text-lg sm:text-xl mb-2 text-orange-700 dark:text-orange-300 whitespace-pre-wrap">
        {equations[step]}
      </p>

      <svg viewBox="0 0 320 300" className="w-full h-auto max-w-sm mx-auto text-gray-700 dark:text-gray-300">
        {/* x² */}
        <rect x={ox} y={oy} width={xs} height={xs} fill="rgb(59, 130, 246)" opacity="0.8" />
        <text x={ox + xs / 2} y={oy + xs / 2 + 6} fontSize="18" fontWeight="bold" textAnchor="middle" fill="white">x²</text>
        {/* 5x отдясно и отдолу */}
        <rect x={ox + xs} y={oy} width={fs} height={xs} fill="rgb(34, 197, 94)" opacity="0.7" stroke="white" strokeWidth="2" />
        <text x={ox + xs + fs / 2} y={oy + xs / 2 + 6} fontSize="16" fontWeight="bold" textAnchor="middle" fill="white">5x</text>
        <rect x={ox} y={oy + xs} width={xs} height={fs} fill="rgb(34, 197, 94)" opacity="0.7" stroke="white" strokeWidth="2" />
        <text x={ox + xs / 2} y={oy + xs + fs / 2 + 6} fontSize="16" fontWeight="bold" textAnchor="middle" fill="white">5x</text>
        {/* Липсващият ъгъл 5 × 5 */}
        <rect
          x={ox + xs}
          y={oy + xs}
          width={fs}
          height={fs}
          fill={step >= 1 ? 'rgb(251, 191, 36)' : 'none'}
          opacity={step >= 1 ? 0.85 : 1}
          stroke={step >= 1 ? 'white' : 'currentColor'}
          strokeWidth="2"
          strokeDasharray={step >= 1 ? undefined : '6,6'}
          style={{ transition: 'fill 0.5s' }}
        />
        <text x={ox + xs + fs / 2} y={oy + xs + fs / 2 + 6} fontSize="16" fontWeight="bold" textAnchor="middle" fill={step >= 1 ? 'rgb(120, 53, 15)' : 'currentColor'} opacity={step >= 1 ? 1 : 0.5}>
          {step >= 1 ? '25' : '?'}
        </text>

        {/* Размери отгоре и отляво */}
        <text x={ox + xs / 2} y={oy - 8} fontSize="13" textAnchor="middle" fill="currentColor">x</text>
        <text x={ox + xs + fs / 2} y={oy - 8} fontSize="13" textAnchor="middle" fill="currentColor">5</text>
        <text x={ox - 10} y={oy + xs / 2 + 4} fontSize="13" textAnchor="end" fill="currentColor">x</text>
        <text x={ox - 10} y={oy + xs + fs / 2 + 4} fontSize="13" textAnchor="end" fill="currentColor">5</text>

        {/* Целият квадрат */}
        {step === 2 && (
          <>
            <rect x={ox} y={oy} width={xs + fs} height={xs + fs} fill="none" stroke="rgb(239, 68, 68)" strokeWidth="4" />
            <text x={ox + (xs + fs) / 2} y={oy + xs + fs + 22} fontSize="14" fontWeight="bold" textAnchor="middle" fill="rgb(239, 68, 68)">
              страна x + 5 = 8
            </text>
          </>
        )}
      </svg>

      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center min-h-[3rem] mt-2">
        {explanations[step]}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {step < 2 && (
          <button
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
          >
            {step === 0 ? 'Допълни до квадрат' : 'Намери страната'}
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep(0)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition"
          >
            <RotateCcw size={16} /> Отначало
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Тренажор ----------

type Task = { a: number; b: number; c: number; roots: number[] };

const newTask = (): Task => {
  // Понякога – уравнение без реални корени
  if (Math.random() < 0.15) {
    const b = 2 * randInt(-4, 4);
    const c = (b * b) / 4 + randInt(1, 9);
    return { a: 1, b, c, roots: [] };
  }
  const a = [1, 1, 1, 2, -1][randInt(0, 4)];
  const r1 = randInt(-9, 9);
  const r2 = Math.random() < 0.15 ? r1 : randInt(-9, 9);
  return { a, b: -a * (r1 + r2), c: a * r1 * r2, roots: [r1, r2].sort((p, q) => p - q) };
};

const parse = (s: string) => Number(s.trim().replace('−', '-').replace(',', '.'));

function Trainer() {
  const [task, setTask] = useState<Task>(newTask);
  const [x1, setX1] = useState('');
  const [x2, setX2] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const { a, b, c, roots } = task;
  const D = b * b - 4 * a * c;

  const grade = (correct: boolean) => {
    setResult(correct ? 'correct' : 'wrong');
    if (correct) {
      setSolved(solved + 1);
      setStreak(streak + 1);
      setBest(Math.max(best, streak + 1));
    } else {
      setStreak(0);
    }
  };

  const check = () => {
    const values = [x1, x2].filter(s => s.trim() !== '').map(parse);
    if (values.length === 0 || values.some(Number.isNaN)) return;
    // При двоен корен е достатъчно да се въведе веднъж
    const answer = values.length === 1 ? [values[0], values[0]] : values.sort((p, q) => p - q);
    grade(roots.length === 2 && answer[0] === roots[0] && answer[1] === roots[1]);
  };

  const next = () => {
    setTask(newTask());
    setX1('');
    setX2('');
    setResult(null);
    setShowSteps(false);
  };

  const inputClass = 'w-20 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg';
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (result === 'correct') next();
      else check();
    }
  };
  const onEdit = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (result === 'wrong') setResult(null);
  };

  const steps =
    roots.length === 0
      ? [
          `a = ${num(a)}, b = ${num(b)}, c = ${num(c)}`,
          `D = (${num(b)})² − 4·(${num(a)})·(${num(c)}) = ${num(D)}`,
          'D < 0 → няма реални корени',
        ]
      : [
          `a = ${num(a)}, b = ${num(b)}, c = ${num(c)}`,
          `D = (${num(b)})² − 4·(${num(a)})·(${num(c)}) = ${num(D)},  √D = ${Math.sqrt(D)}`,
          `x₁,₂ = (${num(-b)} ± ${Math.sqrt(D)}) / ${num(2 * a)}`,
          D === 0 ? `x₁ = x₂ = ${num(roots[0])}` : `x₁ = ${num(roots[0])},  x₂ = ${num(roots[1])}`,
          `Проверка с Виет: x₁ + x₂ = ${num(roots[0] + roots[1])} = −b/a,  x₁·x₂ = ${num(roots[0] * roots[1])} = c/a ✓`,
        ];

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center font-mono text-xl sm:text-2xl mb-4 text-gray-800 dark:text-gray-100">
        {fmtQuad(a, b, c)} = 0
      </p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-lg">x₁ =</span>
        <input type="text" inputMode="numeric" value={x1} onChange={onEdit(setX1)} onKeyDown={onKey} disabled={result === 'correct'} className={inputClass} />
        <span className="font-mono text-lg ml-2">x₂ =</span>
        <input type="text" inputMode="numeric" value={x2} onChange={onEdit(setX2)} onKeyDown={onKey} disabled={result === 'correct'} className={inputClass} />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следващо →
          </button>
        ) : (
          <>
            <button onClick={check} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
              Провери
            </button>
            <button
              onClick={() => grade(roots.length === 0)}
              className="px-4 py-2 rounded-lg border-2 border-sky-600 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition"
            >
              Няма реални корени
            </button>
          </>
        )}
      </div>

      {result && (
        <div
          className={`flex items-center justify-center gap-2 mt-4 font-semibold ${result === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {result === 'correct' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {result === 'correct'
            ? streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : 'Браво! 🎉'
            : 'Не съвсем. Опитай пак или виж решението.'}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-4 text-sm">
        <button onClick={() => setShowSteps(!showSteps)} className="text-blue-600 dark:text-blue-400 hover:underline">
          {showSteps ? '▼ Скрий решението' : '▶ Покажи решението'}
        </button>
        {result !== 'correct' && (
          <button onClick={next} className="text-gray-500 hover:underline">
            Пропусни
          </button>
        )}
      </div>

      {showSteps && (
        <ol className="list-decimal ml-8 mt-3 space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
          {steps.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
        Подсказка: при двоен корен е достатъчно да попълниш едното поле. Опитай първо да познаеш корените с формулите на Виет!
      </p>
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '⚽ Топка',
    problem: 'Хвърляме топка нагоре. Височината ѝ след $t$ секунди е $h = 20t - 5t^2$ метра. Кога топката е на височина $15\\ \\mathrm{m}$?',
    solution: [
      '$20t - 5t^2 = 15$',
      '$5t^2 - 20t + 15 = 0 \\quad | : 5$',
      '$t^2 - 4t + 3 = 0$',
      '$D = 16 - 12 = 4$',
      '$t_1 = \\frac{4 - 2}{2} = 1,\\ t_2 = \\frac{4 + 2}{2} = 3$',
    ],
    answer: 'Два пъти: след 1 s (на път нагоре) и след 3 s (на път надолу)',
    check: [1, 3],
    ask: ['първи момент, s', 'втори момент, s'],
  },
  {
    title: '🌻 Градина',
    problem: 'Правоъгълна градина има периметър $26\\ \\mathrm{m}$ и лице $40\\ \\mathrm{m}^2$. Какви са размерите ѝ?',
    solution: [
      'Едната страна е $x$, другата е $13 - x$ (полупериметърът е 13).',
      '$x(13 - x) = 40$',
      '$x^2 - 13x + 40 = 0$',
      '$D = 169 - 160 = 9$',
      '$x_1 = \\frac{13 - 3}{2} = 5,\\ x_2 = \\frac{13 + 3}{2} = 8$',
    ],
    answer: '$5\\ \\mathrm{m} \\times 8\\ \\mathrm{m}$',
    check: [5, 8],
    ask: ['едната страна, m', 'другата страна, m'],
  },
  {
    title: '🤝 Ръкостискания',
    problem: 'След състезание всеки участник се ръкува с всеки друг точно веднъж. Имало е 45 ръкостискания. Колко са участниците?',
    solution: [
      'Всеки от $n$ участници стиска ръка на $n - 1$ души, но така броим всяко ръкостискане два пъти.',
      '$\\frac{n(n - 1)}{2} = 45$',
      '$n^2 - n - 90 = 0$',
      '$D = 1 + 360 = 361,\\ \\sqrt{D} = 19$',
      '$n_1 = \\frac{1 + 19}{2} = 10,\\ n_2 = \\frac{1 - 19}{2} = -9$ (отпада)',
    ],
    answer: '10 участници',
    check: [10],
    ask: ['участници'],
  },
  {
    title: '🖼️ Рамка',
    problem: 'Снимка $20\\ \\mathrm{cm} \\times 30\\ \\mathrm{cm}$ е поставена в рамка с еднаква ширина от всички страни. Заедно с рамката лицето е $1200\\ \\mathrm{cm}^2$. Колко е широка рамката?',
    solution: ['Нека рамката е широка $x\\ \\mathrm{cm}$. Размерите с рамката са $(20 + 2x)$ и $(30 + 2x)$.', '$(20 + 2x)(30 + 2x) = 1200$', '$4x^2 + 100x - 600 = 0 \\quad | : 4$', '$x^2 + 25x - 150 = 0,\\ D = 625 + 600 = 1225$', '$x_1 = \\frac{-25 + 35}{2} = 5,\\ x_2 = -30$ (отпада)'],
    answer: '5 cm',
    check: [5],
    ask: ['ширина на рамката, cm'],
  },
  {
    title: '🚆 Влакът',
    problem: 'Влак изминава $120\\ \\mathrm{km}$. Ако скоростта му беше с $20\\ \\mathrm{km/h}$ по-голяма, щеше да пристигне 1 час по-рано. Каква е скоростта му?',
    solution: ['Нека скоростта е $v$. Времената са $\\frac{120}{v}$ и $\\frac{120}{v + 20}$.', '$\\frac{120}{v} - \\frac{120}{v + 20} = 1$', '$120(v + 20) - 120v = v(v + 20)$', '$v^2 + 20v - 2400 = 0,\\ D = 400 + 9600 = 10\\,000$', '$v_1 = \\frac{-20 + 100}{2} = 40,\\ v_2 = -60$ (отпада)'],
    answer: '$40\\ \\mathrm{km/h}$',
    check: [40],
    ask: ['скорост, km/h'],
  },
];

// ---------- Тест ----------

const quadraticEquationsQuiz: Question[] = [
  {
    question: 'Реши уравнението: $x^2 - 7x + 12 = 0$',
    answers: [
      '$x_1 = 3,\\ x_2 = 4$',
      '$x_1 = 2,\\ x_2 = 6$',
      '$x_1 = 1,\\ x_2 = 12$',
      '$x_1 = -3,\\ x_2 = -4$',
    ],
    correctAnswer: '$x_1 = 3,\\ x_2 = 4$',
  },
  {
    question: 'Реши уравнението: $x^2 + 6x + 9 = 0$',
    answers: [
      '$x_1 = 3,\\ x_2 = 3$ (двоен корен)',
      '$x_1 = -3,\\ x_2 = -3$ (двоен корен)',
      '$x_1 = 3,\\ x_2 = -3$',
      'Няма реални корени',
    ],
    correctAnswer: '$x_1 = -3,\\ x_2 = -3$ (двоен корен)',
  },
  {
    question: 'Реши уравнението: $x^2 - 16 = 0$',
    answers: ['$x = 4$', '$x = 8$', '$x_1 = -4,\\ x_2 = 4$', 'Няма реални корени'],
    correctAnswer: '$x_1 = -4,\\ x_2 = 4$',
  },
  {
    question: 'Реши уравнението: $5x^2 - 15x = 0$',
    answers: ['$x = 3$', '$x_1 = 0,\\ x_2 = 3$', '$x_1 = 0,\\ x_2 = -3$', '$x_1 = 3,\\ x_2 = 5$'],
    correctAnswer: '$x_1 = 0,\\ x_2 = 3$',
  },
  {
    question: 'Колко е дискриминантата на $2x^2 + 3x - 2 = 0$?',
    answers: ['$D = -7$', '$D = 25$', '$D = 17$', '$D = 1$'],
    correctAnswer: '$D = 25$',
  },
  {
    question: 'Без да решаваш: на колко е равна сумата на корените на $x^2 - 7x + 10 = 0$?',
    answers: ['$-7$', '$10$', '$7$', '$-10$'],
    correctAnswer: '$7$',
  },
  {
    question: 'Колко реални корена има $x^2 + 2x + 5 = 0$?',
    answers: ['Два', 'Един (двоен)', 'Нито един', 'Безброй много'],
    correctAnswer: 'Нито един',
  },
  {
    question: 'Как се разлага $x^2 - 9x + 20$?',
    answers: ['$(x - 4)(x - 5)$', '$(x + 4)(x + 5)$', '$(x - 2)(x - 10)$', '$(x - 4)(x + 5)$'],
    correctAnswer: '$(x - 4)(x - 5)$',
  },
  {
    question: 'Колко реални корена има $x^4 - 5x^2 + 4 = 0$?',
    answers: ['Нито един', 'Два', 'Три', 'Четири'],
    correctAnswer: 'Четири',
  },
];

// ---------- Страница ----------

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

export function QuadraticEquations() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Квадратни уравнения</h1>

        <div className="bg-gradient-to-br from-indigo-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏺 В Британския музей се пази глинена плочка от Вавилон, написана преди близо 4000 години (BM 13901). Първата задача върху нея
            гласи: „Събрах лицето и страната на моя квадрат и получих <Tex>{'\\frac{3}{4}'}</Tex>. Колко е страната?“ Днес бихме написали <Tex>{'x^2 + x = \\frac{3}{4}'}</Tex>. Писарят не
            знае нито буквите, нито отрицателните числа – но описва стъпка по стъпка точно метода, който ще видим в т. 3: допълване до точен
            квадрат. И получава верния отговор: <Tex>{'\\frac{1}{2}'}</Tex>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е квадратно уравнение?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Квадратна стая има лице <Tex>{'36\\ \\mathrm{m}^2'}</Tex>. Колко е дълга стената? Лесно – <Tex>{'6\\ \\mathrm{m}'}</Tex>. А ако стаята е с <Tex>{'5\\ \\mathrm{m}'}</Tex> по-дълга,
              отколкото е широка, и лицето ѝ е <Tex>{'36\\ \\mathrm{m}^2'}</Tex>? Тогава <Tex>{'x(x + 5) = 36'}</Tex>, т.е. <Tex>{'x^2 + 5x - 36 = 0'}</Tex>. Отговорът
              (<Tex>{'4\\ \\mathrm{m} \\times 9\\ \\mathrm{m}'}</Tex>) вече не се вижда толкова лесно – затова ни трябват инструментите от този урок.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Квадратно уравнение"
            description="Уравнение от вида $ax^2 + bx + c = 0$, където $a$, $b$, $c$ са числа и $a \ne 0$. Числото $a$ е главният коефициент, $b$ – коефициентът пред $x$, $c$ – свободният член. Графиката на $y = ax^2 + bx + c$ е парабола, а корените на уравнението са точките, в които тя пресича оста $Ox$."
          />
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Непълни квадратни уравнения</h3>
          <p className={text}>Когато <Tex>{'b'}</Tex> или <Tex>{'c'}</Tex> е 0, уравнението се решава бързо и без формула:</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400 font-mono"><Tex>{'b = 0'}</Tex>: <Tex>{'ax^2 + c = 0'}</Tex></p>
              <p className="mb-2">Изразяваме <Tex>{'x^2'}</Tex> и коренуваме – не забравяй ±!</p>
              <p className="font-mono text-sm"><Tex>{'2x^2 - 18 = 0'}</Tex></p>
              <p className="font-mono text-sm"><Tex>{'x^2 = 9'}</Tex></p>
              <p className="font-mono text-sm"><Tex>{'x_1 = -3,\\ x_2 = 3'}</Tex></p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400 font-mono"><Tex>{'c = 0'}</Tex>: <Tex>{'ax^2 + bx = 0'}</Tex></p>
              <p className="mb-2">Изнасяме <Tex>{'x'}</Tex> пред скоби – единият корен винаги е 0.</p>
              <p className="font-mono text-sm"><Tex>{'3x^2 - 12x = 0'}</Tex></p>
              <p className="font-mono text-sm"><Tex>{'3x(x - 4) = 0'}</Tex></p>
              <p className="font-mono text-sm"><Tex>{'x_1 = 0,\\ x_2 = 4'}</Tex></p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Допълване до точен квадрат</h2>
          <p className={text}>
            Преди 1200 години, без отрицателни числа и без буквени означения, ал-Хорезми е решавал квадратни уравнения с... рисунки. Натисни
            бутона и виж как една фигура се превръща в точен квадрат.
          </p>
          <CompletingTheSquare />
          <p className={text}>
            Ако направим същото с общото уравнение <Tex>{'ax^2 + bx + c = 0'}</Tex>, ще получим <Tex>{'\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}'}</Tex>. Изразът <Tex>{'b^2 - 4ac'}</Tex> е толкова
            важен, че си има собствено име.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Дискриминанта и формула за корените</h2>
          <Theorem
            title="Формула за корените"
            description="Дискриминантата на $ax^2 + bx + c = 0$ е $D = b^2 - 4ac$. Ако $D > 0$, уравнението има два различни корена $x_{1,2} = \frac{-b \pm \sqrt{D}}{2a}$; ако $D = 0$ – един двоен корен $x = -\frac{b}{2a}$; ако $D < 0$ – няма реални корени. Когато $b$ е четно ($b = 2k$), е удобна съкратената формула $x_{1,2} = \frac{-k \pm \sqrt{k^2 - ac}}{a}$."
          />
          <p className={text}>Промени коефициентите и наблюдавай как знакът на <Tex>{'D'}</Tex> решава съдбата на параболата:</p>
          <ParabolaExplorer />
          <p className={text}>
            Числото <Tex>{'-\\frac{b}{2a}'}</Tex> (без ±) е абсцисата на върха на параболата – корените са симетрично разположени около него.
          </p>
          <Example
            description="Да решим уравнението $x^2 - 5x + 6 = 0$"
            steps={[
              'Коефициентите: $a = 1,\\ b = -5,\\ c = 6$',
              '$D = b^2 - 4ac = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1 > 0$ – два корена',
              '$x_1 = \\frac{5 + 1}{2} = 3,\\ x_2 = \\frac{5 - 1}{2} = 2$',
              'Проверка: $3^2 - 5 \\cdot 3 + 6 = 0$ ✓ и $2^2 - 5 \\cdot 2 + 6 = 0$ ✓',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Формули на Виет и разлагане</h2>
          <Theorem
            title="Теорема на Виет"
            description="Ако $x_1$ и $x_2$ са корените на $ax^2 + bx + c = 0$, то $x_1 + x_2 = -\frac{b}{a}$ и $x_1 \cdot x_2 = \frac{c}{a}$. Обратно: числата $x_1$ и $x_2$ са корени на $x^2 - (x_1 + x_2)x + x_1x_2 = 0$. Следствие (разлагане на квадратния тричлен): $ax^2 + bx + c = a(x - x_1)(x - x_2)$."
          />
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded mb-4">
            <p className="font-semibold mb-2 text-sm sm:text-base text-blue-900 dark:text-blue-300">💡 Трик за устно решаване:</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              При <Tex>{'a = 1'}</Tex> търсим две числа със сума <Tex>{'-b'}</Tex> и произведение <Tex>{'c'}</Tex>. За <Tex>{'x^2 - 7x + 12 = 0'}</Tex> питаме: кои две числа дават сума 7 и произведение
              12? Това са 3 и 4 – готово, без дискриминанта!
            </p>
          </div>
          <VietaLab />
          <Example
            description="Без да решаваш уравнението $x^2 - 5x + 3 = 0$, намери $x_1^2 + x_2^2$."
            steps={[
              'По Виет: $x_1 + x_2 = 5,\\ x_1x_2 = 3$',
              '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$',
              '$= 25 - 6 = 19$',
              'Корените са ирационални ($\\frac{5 \\pm \\sqrt{13}}{2}$), но сборът от квадратите им е цяло число!',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Уравнения, които се свеждат до квадратни</h2>
          <p className={text}>
            Уравнение от вида <Tex>{'ax^4 + bx^2 + c = 0'}</Tex> се нарича <strong>биквадратно</strong>. Със смяната <Tex>{'t = x^2'}</Tex> то става квадратно: <Tex>{'at^2 + bt + c = 0'}</Tex>. Същата идея работи винаги, когато един израз се повтаря – например <Tex>{'(x^2 + x)^2 - 8(x^2 + x) + 12 = 0'}</Tex> със смяна <Tex>{'t = x^2 + x'}</Tex>.
          </p>
          <BiquadraticLab />
          <Example
            description="Да решим $x^4 - 10x^2 + 9 = 0$"
            steps={['Смяна $t = x^2$ ($t \\ge 0$): $t^2 - 10t + 9 = 0$', '$t_1 = 1,\\ t_2 = 9$ (по Виет: сбор 10, произведение 9)', '$x^2 = 1 \\Rightarrow x = \\pm 1$; $x^2 = 9 \\Rightarrow x = \\pm 3$', 'Отговор: четири корена $-3,\\ -1,\\ 1,\\ 3$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Квадратни уравнения с параметър</h2>
          <p className={text}>
            Броят на корените зависи от знака на <Tex>{'D'}</Tex>, а знаците им – от Виет: ако <Tex>{'\\frac{c}{a} < 0'}</Tex>, корените са с различни знаци; ако <Tex>{'\\frac{c}{a} > 0'}</Tex> – с
            еднакви, и тогава знакът на сбора <Tex>{'-\\frac{b}{a}'}</Tex> казва дали са положителни или отрицателни. Не забравяй случая <Tex>{'a = 0'}</Tex> – тогава уравнението не е
            квадратно!
          </p>
          <Example
            description="За кои стойности на $m$ уравнението $x^2 - 6x + m = 0$ има два различни корена?"
            steps={['$D = 36 - 4m$', 'Два различни корена $\\iff D > 0 \\iff 36 - 4m > 0$', '$m < 9$', 'При $m = 9$ – двоен корен $x = 3$; при $m > 9$ – няма реални корени']}
          />
          <RootsParameterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Изгубен корен при коренуване', '$x^2 = 9 \\to x = 3$', '$x = \\pm 3$'],
              ['Делене на $x$ (губим корена 0)', '$x^2 = 5x \\to x = 5$', '$x^2 - 5x = 0 \\to x(x - 5) = 0 \\to x_1 = 0,\\ x_2 = 5$'],
              ['Знакът на $-b$ при отрицателно $b$', '$x^2 - 5x + 6 = 0 \\to x = \\frac{-5 \\pm 1}{2}$', '$x = \\frac{5 \\pm 1}{2}$'],
              ['Квадрат на отрицателно число', '$b = -4 \\to b^2 = -16$', '$b^2 = (-4)^2 = 16$'],
              ['$2a$ дели само корена', '$x = -b \\pm \\sqrt{D} / 2a$', '$x = \\frac{-b \\pm \\sqrt{D}}{2a}$ – дели се целият числител'],
              ['Отрицателно $t$ при смяна $t = x^2$', '$t = -4 \\to x = \\pm 2$', '$t = -4 \\to x^2 = -4$ няма решение'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1"><MathText displayStyle>{title}</MathText></p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ <MathText displayStyle>{wrong}</MathText></p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ <MathText displayStyle>{right}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <p className={text}>
            Квадратните уравнения се появяват навсякъде, където има лица, падане на предмети или броене на двойки. Внимавай – понякога единият
            корен няма смисъл в задачата!
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Безкраен брой уравнения! Някои имат два корена, някои – двоен, а някои – нито един.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={quadraticEquationsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Реши уравнението $3x^2 - 12 = 0$.">
                <p><Tex>{'3x^2 = 12 \\Rightarrow x^2 = 4'}</Tex></p>
                <p><Tex>{'x_1 = -2,\\ x_2 = 2'}</Tex> (не забравяй и отрицателния корен!)</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Реши уравнението $x^2 - 2x - 15 = 0$.">
                <p><Tex>{'D = 4 + 60 = 64,\\ \\sqrt{D} = 8'}</Tex></p>
                <p><Tex>{'x_1 = \\frac{2 - 8}{2} = -3,\\ x_2 = \\frac{2 + 8}{2} = 5'}</Tex></p>
                <p>Проверка по Виет: <Tex>{'-3 + 5 = 2'}</Tex> ✓, <Tex>{'(-3) \\cdot 5 = -15'}</Tex> ✓</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Разложи на множители $x^2 - x - 6$.">
                <p>Търсим две числа със сбор 1 и произведение −6: това са 3 и −2.</p>
                <p><Tex>{'x^2 - x - 6 = (x - 3)(x + 2)'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Реши уравнението $x^4 - 13x^2 + 36 = 0$.">
                <p>Смяна <Tex>{'t = x^2 \\ge 0'}</Tex>: <Tex>{'t^2 - 13t + 36 = 0'}</Tex></p>
                <p><Tex>{'t_1 = 4,\\ t_2 = 9'}</Tex> (сбор 13, произведение 36)</p>
                <p><Tex>{'x^2 = 4 \\Rightarrow x = \\pm 2'}</Tex>; <Tex>{'x^2 = 9 \\Rightarrow x = \\pm 3'}</Tex>. Четири корена: <Tex>{'-3,\\ -2,\\ 2,\\ 3'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Корените на $x^2 - 5x + 3 = 0$ са $x_1$ и $x_2$. Без да ги намираш, пресметни $\frac{1}{x_1} + \frac{1}{x_2}$ и $x_1^2x_2 + x_1x_2^2$.">
                <p>По Виет: <Tex>{'x_1 + x_2 = 5,\\ x_1x_2 = 3'}</Tex></p>
                <p><Tex>{'\\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{x_1 + x_2}{x_1x_2} = \\frac{5}{3}'}</Tex></p>
                <p><Tex>{'x_1^2x_2 + x_1x_2^2 = x_1x_2(x_1 + x_2) = 3 \\cdot 5 = 15'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="За кои стойности на $m$ уравнението $x^2 + mx + 9 = 0$ има двоен корен? Намери го.">
                <p>Двоен корен <Tex>{'\\iff D = 0'}</Tex>: <Tex>{'m^2 - 36 = 0 \\Rightarrow m = \\pm 6'}</Tex></p>
                <p>При <Tex>{'m = 6'}</Tex>: <Tex>{'x = -\\frac{m}{2} = -3'}</Tex>; при <Tex>{'m = -6'}</Tex>: <Tex>{'x = 3'}</Tex>.</p>
                <p>Наистина <Tex>{'x^2 + 6x + 9 = (x + 3)^2'}</Tex> и <Tex>{'x^2 - 6x + 9 = (x - 3)^2'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="За кои стойности на $m$ двата корена на $x^2 - 2(m + 1)x + m^2 + 3 = 0$ са реални и положителни?">
                <p>Реални: <Tex>{'\\frac{D}{4} = (m + 1)^2 - (m^2 + 3) = 2m - 2 \\ge 0 \\Rightarrow m \\ge 1'}</Tex></p>
                <p>Положителни: произведение <Tex>{'m^2 + 3 > 0'}</Tex> винаги; сбор <Tex>{'2(m + 1) > 0 \\Rightarrow m > -1'}</Tex></p>
                <p>Отговор: <Tex>{'m \\ge 1'}</Tex> (при <Tex>{'m = 1'}</Tex> коренът е двоен – <Tex>{'x = 2'}</Tex>).</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Реши уравнението $(x^2 + x)^2 - 8(x^2 + x) + 12 = 0$.">
                <p>Смяна <Tex>{'t = x^2 + x'}</Tex>: <Tex>{'t^2 - 8t + 12 = 0 \\Rightarrow t_1 = 2,\\ t_2 = 6'}</Tex></p>
                <p><Tex>{'x^2 + x = 2 \\Rightarrow x^2 + x - 2 = 0 \\Rightarrow x = 1'}</Tex> или <Tex>{'x = -2'}</Tex></p>
                <p><Tex>{'x^2 + x = 6 \\Rightarrow x^2 + x - 6 = 0 \\Rightarrow x = 2'}</Tex> или <Tex>{'x = -3'}</Tex></p>
                <p>Отговор: <Tex>{'-3,\\ -2,\\ 1,\\ 2'}</Tex>. (Без смяната щяхме да имаме уравнение от четвърта степен!)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Правоъгълник има това свойство: ако отрежем от него квадрат със страна, равна на по-малката му страна, остава правоъгълник, подобен на първия. Колко е отношението на страните му?">
                <p>Нека страните са <Tex>{'x'}</Tex> и 1 (<Tex>{'x > 1'}</Tex>). След отрязване на квадрат <Tex>{'1 \\times 1'}</Tex> остава правоъгълник <Tex>{'1 \\times (x - 1)'}</Tex>.</p>
                <p>Подобие: <Tex>{'\\frac{x}{1} = \\frac{1}{x - 1} \\Rightarrow x(x - 1) = 1 \\Rightarrow x^2 - x - 1 = 0'}</Tex></p>
                <p><Tex>{'x = \\frac{1 + \\sqrt{5}}{2} \\approx 1{,}618'}</Tex> (отрицателният корен отпада)</p>
                <p>Това е „златното сечение“ <Tex>{'\\varphi'}</Tex> – среща се в изкуството, архитектурата и в числата на Фибоначи.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'ax^2 + bx + c = 0,\\ a \\ne 0'}</Tex>; непълните (<Tex>{'b = 0'}</Tex> или <Tex>{'c = 0'}</Tex>) се решават без формула</li>
              <li>✓ <Tex>{'D = b^2 - 4ac'}</Tex>: <Tex>{'D > 0'}</Tex> – два корена, <Tex>{'D = 0'}</Tex> – двоен, <Tex>{'D < 0'}</Tex> – няма реални</li>
              <li>✓ <Tex>{'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}'}</Tex>; върхът на параболата е при <Tex>{'x = -\\frac{b}{2a}'}</Tex></li>
              <li>✓ Виет: <Tex>{'x_1 + x_2 = -\\frac{b}{a},\\ x_1x_2 = \\frac{c}{a}'}</Tex>; <Tex>{'ax^2 + bx + c = a(x - x_1)(x - x_2)'}</Tex></li>
              <li>✓ Биквадратни и други уравнения – смяна на повтарящия се израз; <Tex>{'t = x^2'}</Tex> не може да е отрицателно</li>
              <li>✓ Параметър: знак на <Tex>{'D'}</Tex> за броя на корените, Виет за знаците им, отделно случая <Tex>{'a = 0'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Формула за корените има и за уравненията от трета и четвърта степен – италианците Тарталя, Кардано и Ферари я намират през XVI
              век, след истински математически дуели. Но за пета степен двеста години никой не успява. През 1824 г. норвежецът Нилс Абел доказва
              защо: обща формула с корени за уравненията от пета степен не съществува. Скоро след това Еварист Галоа, загинал на 20 години в
              дуел, обяснява кои уравнения все пак могат да се решат така.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
