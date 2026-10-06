import { CheckCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';

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

const wordProblems = [
  {
    title: '⚽ Топка',
    problem: 'Хвърляме топка нагоре. Височината ѝ след t секунди е h = 20t − 5t² метра. Кога топката е на височина 15 m?',
    solution: [
      '20t − 5t² = 15',
      '5t² − 20t + 15 = 0  | : 5',
      't² − 4t + 3 = 0',
      'D = 16 − 12 = 4',
      't₁ = (4 − 2)/2 = 1,  t₂ = (4 + 2)/2 = 3',
    ],
    answer: 'Два пъти: след 1 s (на път нагоре) и след 3 s (на път надолу)',
  },
  {
    title: '🌻 Градина',
    problem: 'Правоъгълна градина има периметър 26 m и лице 40 m². Какви са размерите ѝ?',
    solution: [
      'Едната страна е x, другата е 13 − x (полупериметърът е 13).',
      'x(13 − x) = 40',
      'x² − 13x + 40 = 0',
      'D = 169 − 160 = 9',
      'x₁ = (13 − 3)/2 = 5,  x₂ = (13 + 3)/2 = 8',
    ],
    answer: '5 m × 8 m',
  },
  {
    title: '🤝 Ръкостискания',
    problem: 'След състезание всеки участник се ръкува с всеки друг точно веднъж. Имало е 45 ръкостискания. Колко са участниците?',
    solution: [
      'Всеки от n участници стиска ръка на n − 1 души, но така броим всяко ръкостискане два пъти.',
      'n(n − 1)/2 = 45',
      'n² − n − 90 = 0',
      'D = 1 + 360 = 361,  √D = 19',
      'n₁ = (1 + 19)/2 = 10,  n₂ = (1 − 19)/2 = −9 (отпада)',
    ],
    answer: '10 участници',
  },
];

// ---------- Тест ----------

const quadraticEquationsQuiz: Question[] = [
  {
    question: 'Реши уравнението: x² - 7x + 12 = 0',
    answers: [
      'x₁ = 3, x₂ = 4',
      'x₁ = 2, x₂ = 6',
      'x₁ = 1, x₂ = 12',
      'x₁ = -3, x₂ = -4',
    ],
    correctAnswer: 'x₁ = 3, x₂ = 4',
  },
  {
    question: 'Реши уравнението: 2x² - 8x + 6 = 0',
    answers: [
      'x₁ = 1, x₂ = 3',
      'x₁ = 2, x₂ = 4',
      'x₁ = -1, x₂ = -3',
      'x₁ = 0, x₂ = 2',
    ],
    correctAnswer: 'x₁ = 1, x₂ = 3',
  },
  {
    question: 'Реши уравнението: x² + 6x + 9 = 0',
    answers: [
      'x₁ = 3, x₂ = 3 (двоен корен)',
      'x₁ = -3, x₂ = -3 (двоен корен)',
      'x₁ = 3, x₂ = -3',
      'Няма реални корени',
    ],
    correctAnswer: 'x₁ = -3, x₂ = -3 (двоен корен)',
  },
  {
    question: 'Реши уравнението: x² - 16 = 0',
    answers: ['x = 4', 'x = 8', 'x₁ = -4, x₂ = 4', 'Няма реални корени'],
    correctAnswer: 'x₁ = -4, x₂ = 4',
  },
  {
    question: 'Реши уравнението: 5x² - 15x = 0',
    answers: ['x = 3', 'x₁ = 0, x₂ = 3', 'x₁ = 0, x₂ = -3', 'x₁ = 3, x₂ = 5'],
    correctAnswer: 'x₁ = 0, x₂ = 3',
  },
  {
    question: 'Колко е дискриминантата на 2x² + 3x - 2 = 0?',
    answers: ['D = -7', 'D = 25', 'D = 17', 'D = 1'],
    correctAnswer: 'D = 25',
  },
  {
    question: 'Без да решаваш: на колко е равна сумата на корените на x² - 7x + 10 = 0?',
    answers: ['-7', '10', '7', '-10'],
    correctAnswer: '7',
  },
  {
    question: 'Колко реални корена има x² + 2x + 5 = 0?',
    answers: ['Два', 'Един (двоен)', 'Нито един', 'Безброй много'],
    correctAnswer: 'Нито един',
  },
];

// ---------- Страница ----------

export function QuadraticEquations() {
  const [openProblems, setOpenProblems] = useState<{ [key: number]: boolean }>({});

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Решаване на квадратни уравнения
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Квадратна стая има лице 36 m². Колко е дълга стената?
              Лесно – 6 m. А ако стаята е с 5 m по-дълга, отколкото е широка, и лицето ѝ е 36 m²?
              Тогава x(x + 5) = 36, т.е. <span className="font-mono">x² + 5x − 36 = 0</span>.
              Отговорът (4 m × 9 m) вече не се вижда толкова лесно – затова ни трябват инструментите
              от този урок.
            </p>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Квадратно уравнение
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Квадратното уравнение е алгебрично уравнение от вида:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-mono text-center break-all text-gray-800 dark:text-gray-100">
              ax² + bx + c = 0, където a ≠ 0
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Коефициентите <strong>a</strong>, <strong>b</strong> и{' '}
            <strong>c</strong> са реални числа, като <strong>a</strong> се нарича
            главен коефициент, а <strong>c</strong> – свободен член. Графиката на
            y = ax² + bx + c е <strong>парабола</strong>, а корените на уравнението са
            точките, в които тя пресича оста Ox.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Непълни квадратни уравнения
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Когато b или c е 0, уравнението се решава бързо и без формула:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400 font-mono">b = 0: ax² + c = 0</p>
              <p className="mb-2">Изразяваме x² и коренуваме – не забравяй ±!</p>
              <p className="font-mono text-sm">2x² − 18 = 0</p>
              <p className="font-mono text-sm">x² = 9</p>
              <p className="font-mono text-sm">x₁ = −3, x₂ = 3</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400 font-mono">c = 0: ax² + bx = 0</p>
              <p className="mb-2">Изнасяме x пред скоби – единият корен винаги е 0.</p>
              <p className="font-mono text-sm">3x² − 12x = 0</p>
              <p className="font-mono text-sm">3x(x − 4) = 0</p>
              <p className="font-mono text-sm">x₁ = 0, x₂ = 4</p>
            </div>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Откъде идва формулата? Допълване до точен квадрат
          </h2>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Преди 1200 години, без отрицателни числа и без буквени означения, ал-Хорезми е решавал
            квадратни уравнения с... рисунки. Натисни бутона и виж как една фигура се превръща в
            точен квадрат.
          </p>
          <CompletingTheSquare />
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Ако направим същото с общото уравнение ax² + bx + c = 0, ще получим
            (x + b/2a)² = (b² − 4ac) / 4a². Изразът b² − 4ac е толкова важен, че си има собствено име.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Дискриминанта
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Дискриминантата е израз, който определя броя и вида на корените на
            квадратното уравнение:
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
              D = b² - 4ac
            </p>
          </div>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Промени коефициентите и наблюдавай как знакът на D решава съдбата на параболата:
          </p>
          <ParabolaExplorer />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Формула за корените
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Когато D ≥ 0, корените на квадратното уравнение се намират по
            формулата:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-mono text-center mb-2 break-all text-gray-800 dark:text-gray-100">
              x₁,₂ = (-b ± √D) / (2a)
            </p>
            <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              или
            </p>
            <p className="text-base sm:text-lg font-mono text-center mt-2 break-all text-gray-800 dark:text-gray-100">
              x₁,₂ = (-b ± √(b² - 4ac)) / (2a)
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            където знакът ± означава, че <span className="font-mono">x₁</span> се
            получава с +, а <span className="font-mono">x₂</span> се получава с -.
            Числото −b/2a (без ±) е точно абсцисата на върха на параболата – корените са
            симетрично разположени около него.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Формули на Виет (Viète)
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Формулите на Виет свързват корените на квадратното уравнение с
            неговите коефициенти:
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Сума на корените:
                </p>
                <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
                  x₁ + x₂ = -b/a
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Произведение на корените:
                </p>
                <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
                  x₁ · x₂ = c/a
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded">
            <p className="font-semibold mb-2 text-sm sm:text-base text-blue-900 dark:text-blue-300">
              💡 Трик за устно решаване:
            </p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              При a = 1 търсим две числа със сума −b и произведение c. За x² − 7x + 12 = 0
              питаме: кои две числа дават сума 7 и произведение 12? Това са 3 и 4 – готово, без
              дискриминанта! Формулите на Виет са полезни и за проверка на намерените корени.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <Example
            description="Да решим уравнението: x² - 5x + 6 = 0"
            steps={[
              'Идентифицираме коефициентите: a = 1, b = -5, c = 6',
              'Намираме дискриминантата: D = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1',
              'Тъй като D > 0, има два различни реални корена',
              'x₁ = (-b + √D) / (2a) = (5 + 1) / 2 = 3',
              'x₂ = (-b - √D) / (2a) = (5 - 1) / 2 = 2',
              'Проверка с Виет: x₁ + x₂ = 3 + 2 = 5 = -(-5)/1 ✓',
              'Проверка с Виет: x₁ · x₂ = 3 · 2 = 6 = 6/1 ✓',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            ⚠️ Чести грешки
          </h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Изгубен корен при коренуване', 'x² = 9 → x = 3', 'x = ±3'],
              ['Делене на x (губим корена 0)', 'x² = 5x → x = 5', 'x² − 5x = 0 → x(x − 5) = 0 → x₁ = 0, x₂ = 5'],
              ['Знакът на −b при отрицателно b', 'x² − 5x + 6 = 0 → x = (−5 ± 1)/2', 'x = (5 ± 1)/2'],
              ['Квадрат на отрицателно число', 'b = −4 → b² = −16', 'b² = (−4)² = 16'],
              ['2a дели само корена', 'x = −b ± √D / 2a', 'x = (−b ± √D) / 2a – дели се целият числител'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">{title}</p>
                <p className="font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Задачи от живота
          </h2>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Квадратните уравнения се появяват навсякъде, където има лица, падане на предмети
            или броене на двойки. Внимавай – понякога единият корен няма смисъл в задачата!
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {wordProblems.map((p, i) => (
              <div key={p.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col">
                <p className="font-semibold mb-2">{p.title}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex-1">{p.problem}</p>
                <button
                  onClick={() => setOpenProblems(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm text-left"
                >
                  {openProblems[i] ? '▼ Скрий решението' : '▶ Покажи решението'}
                </button>
                {openProblems[i] && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    {p.solution.map(line => (
                      <p key={line} className="font-mono">{line}</p>
                    ))}
                    <p className="mt-2 font-semibold">Отговор: {p.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles size={20} className="text-sky-500" /> Тренажор
          </h2>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Безкраен брой уравнения! Някои имат два корена, някои – двоен, а някои – нито един.
          </p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Упражнения
          </h2>
          <Quiz questions={quadraticEquationsQuiz} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Вавилонските писари са решавали квадратни уравнения преди близо 4000 години –
              задачите им са запазени върху глинени плочки. Формулата във вида, в който я
              използваме днес, с букви за коефициентите, става възможна едва около 1600 г.,
              когато френският математик Франсоа Виет въвежда буквените означения в алгебрата.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
