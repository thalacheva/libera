import { CheckCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import AbsValueLab from './AbsValueLab';
import MeetingLab from './MeetingLab';
import ParameterLab from './ParameterLab';
import { MathText, Tex } from '~/MathText';

// ---------- Помощни функции за форматиране ----------

const num = (n: number) => (n < 0 ? `−${-n}` : `${n}`);

// Записва ax + b (без излишни 1, 0 и знаци)
const fmtLin = (a: number, b: number) => {
  let s = '';
  if (a !== 0) s = a === 1 ? 'x' : a === -1 ? '−x' : `${num(a)}x`;
  if (s === '') return num(b);
  if (b > 0) s += ` + ${b}`;
  if (b < 0) s += ` − ${-b}`;
  return s;
};

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};

// ---------- Везна ----------

type Balance = { a: number; b: number; x: number; c: number };

const newBalance = (): Balance => {
  for (;;) {
    const a = randInt(2, 3);
    const x = randInt(1, 4);
    const b = randInt(1, 5);
    const c = a * x + b;
    if (c <= 15) return { a, b, x, c };
  }
};

type Item = { kind: 'x' | 'one'; faded: boolean };

const items = (kind: Item['kind'], count: number, faded = false): Item[] =>
  Array.from({ length: count }, () => ({ kind, faded }));

function Pan({ cx, content }: { cx: number; content: Item[] }) {
  const panY = 190;
  return (
    <g>
      {/* Въжета и блюдо */}
      <line x1={cx - 90} y1={60} x2={cx - 90} y2={panY} stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1={cx + 90} y1={60} x2={cx + 90} y2={panY} stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d={`M ${cx - 95},${panY} Q ${cx},${panY + 25} ${cx + 95},${panY}`} fill="rgb(148, 163, 184)" opacity="0.6" />
      <line x1={cx - 95} y1={panY} x2={cx + 95} y2={panY} stroke="rgb(100, 116, 139)" strokeWidth="3" />

      {content.map((item, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = cx - 56 + col * 28;
        const y = panY - 15 - row * 28;
        return (
          <g key={i} opacity={item.faded ? 0.15 : 1} style={{ transition: 'opacity 0.5s' }}>
            {item.kind === 'x' ? (
              <>
                <rect x={x - 12} y={y - 12} width="24" height="24" rx="4" fill="rgb(59, 130, 246)" />
                <text x={x} y={y + 5} fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">x</text>
              </>
            ) : (
              <>
                <circle cx={x} cy={y} r="11" fill="rgb(251, 191, 36)" />
                <text x={x} y={y + 4} fontSize="11" fontWeight="bold" textAnchor="middle" fill="rgb(120, 53, 15)">1</text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function BalanceScale() {
  const [eq, setEq] = useState<Balance>(newBalance);
  const [step, setStep] = useState(0);
  const { a, b, x, c } = eq;

  const left =
    step === 0 ? [...items('x', a), ...items('one', b)]
    : step === 1 ? [...items('x', a), ...items('one', b, true)]
    : [...items('x', 1), ...items('x', a - 1, true)];
  const right =
    step === 0 ? items('one', c)
    : step === 1 ? [...items('one', c - b), ...items('one', b, true)]
    : [...items('one', x), ...items('one', c - b - x, true)];

  const equations = [
    `${a}x + ${b} = ${c}`,
    `${a}x + ${b} − ${b} = ${c} − ${b}   →   ${a}x = ${c - b}`,
    `${a}x : ${a} = ${c - b} : ${a}   →   x = ${x}`,
  ];
  const explanations = [
    'Синьото кутийче е неизвестното x, а жълтите монети тежат по 1. Везната е в равновесие – двете страни са равни.',
    `Махаме по ${b} монети от двете блюда. Везната остава в равновесие!`,
    `На лявото блюдо има ${a} еднакви кутийчета, затова разделяме двете страни на ${a} равни части. Едно кутийче тежи колкото ${x} монети.`,
  ];

  const next = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setEq(newBalance());
      setStep(0);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-2 text-center text-gray-800 dark:text-gray-100">
        ⚖️ Уравнението е като везна
      </h3>
      <p className="text-center font-mono text-lg sm:text-xl mb-2 text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
        {equations[step]}
      </p>

      <svg viewBox="0 0 500 250" className="w-full h-auto max-w-xl mx-auto text-gray-700 dark:text-gray-300">
        {/* Стойка */}
        <polygon points="250,52 230,235 270,235" fill="rgb(100, 116, 139)" />
        <rect x="190" y="232" width="120" height="10" rx="3" fill="rgb(71, 85, 105)" />
        {/* Рамо */}
        <rect x="30" y="56" width="440" height="8" rx="4" fill="rgb(71, 85, 105)" />
        <circle cx="250" cy="60" r="7" fill="rgb(251, 191, 36)" />

        <Pan cx={130} content={left} />
        <Pan cx={370} content={right} />
      </svg>

      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center min-h-[3rem] mt-2">
        {explanations[step]}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={next}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          {step === 0 && `Извади ${b} от двете страни`}
          {step === 1 && `Раздели двете страни на ${a}`}
          {step === 2 && 'Ново уравнение'}
        </button>
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

// ---------- Графика ----------

function GraphExplorer() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-4);

  const unit = 13;
  const X = (x: number) => 200 + x * unit;
  const Y = (y: number) => 140 - y * unit;
  const root = a !== 0 ? -b / a : null;
  const fmt = (n: number) => num(Math.round(n * 100) / 100);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <p className="text-center font-mono text-lg sm:text-xl mb-2 text-purple-700 dark:text-purple-300">
        {fmtLin(a, b)} = 0
      </p>

      <svg viewBox="0 0 400 280" className="w-full h-auto max-w-lg mx-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="graphArea">
            <rect x="0" y="0" width="400" height="280" />
          </clipPath>
        </defs>
        {/* Мрежа */}
        {Array.from({ length: 29 }, (_, i) => i - 14).map(i => (
          <line key={`v${i}`} x1={X(i)} y1={0} x2={X(i)} y2={280} stroke="currentColor" opacity="0.08" />
        ))}
        {Array.from({ length: 21 }, (_, i) => i - 10).map(i => (
          <line key={`h${i}`} x1={0} y1={Y(i)} x2={400} y2={Y(i)} stroke="currentColor" opacity="0.08" />
        ))}
        {/* Оси */}
        <line x1={0} y1={Y(0)} x2={400} y2={Y(0)} stroke="currentColor" strokeWidth="1.5" />
        <line x1={X(0)} y1={0} x2={X(0)} y2={280} stroke="currentColor" strokeWidth="1.5" />
        <text x={392} y={Y(0) - 6} fontSize="12" fill="currentColor" textAnchor="end">x</text>
        <text x={X(0) + 6} y={12} fontSize="12" fill="currentColor">y</text>
        {[-10, -5, 5, 10].map(t => (
          <text key={t} x={X(t)} y={Y(0) + 14} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.6">{t}</text>
        ))}

        {/* Права y = ax + b */}
        <line
          x1={X(-16)}
          y1={Y(a * -16 + b)}
          x2={X(16)}
          y2={Y(a * 16 + b)}
          stroke="rgb(168, 85, 247)"
          strokeWidth="3"
          clipPath="url(#graphArea)"
        />

        {/* Корен */}
        {root !== null && Math.abs(root) <= 14 && (
          <g>
            <circle cx={X(root)} cy={Y(0)} r="7" fill="rgb(239, 68, 68)" />
            <text
              x={X(root)}
              y={a > 0 ? Y(0) + 24 : Y(0) - 14}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="rgb(239, 68, 68)"
            >
              x = {fmt(root)}
            </text>
          </g>
        )}
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <label className="text-sm font-semibold">
          a = {num(a)}
          <input type="range" min="-5" max="5" step="0.5" value={a} onChange={e => setA(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm font-semibold">
          b = {num(b)}
          <input type="range" min="-10" max="10" step="1" value={b} onChange={e => setB(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center mt-3">
        {root !== null && `Правата пресича оста Ox в точката x = −b/a = ${fmt(root)}. Това е решението!`}
        {a === 0 && b === 0 && 'Правата съвпада с оста Ox – всяко x е решение (безброй решения).'}
        {a === 0 && b !== 0 && 'Правата е успоредна на оста Ox и никога не я пресича – уравнението няма решение.'}
      </p>
    </div>
  );
}

// ---------- Тренажор ----------

type Task = { text: string; answer: number; steps: string[] };

const newTask = (): Task => {
  const x = randInt(-9, 9);
  const type = randInt(1, 3);

  if (type === 1) {
    const a = randNonZero(-9, 9);
    const b = randNonZero(-15, 15);
    const c = a * x + b;
    return {
      text: `${fmtLin(a, b)} = ${num(c)}`,
      answer: x,
      steps: [
        `Прехвърляме ${num(b)} отдясно със сменен знак: ${fmtLin(a, 0)} = ${num(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)}`,
        `${fmtLin(a, 0)} = ${num(c - b)}`,
        `Делим на ${num(a)}: x = ${num(x)}`,
      ],
    };
  }

  if (type === 2) {
    const a = randNonZero(-9, 9);
    let c = randNonZero(-9, 9);
    while (c === a) c = randNonZero(-9, 9);
    const b = randInt(-15, 15);
    const d = (a - c) * x + b;
    return {
      text: `${fmtLin(a, b)} = ${fmtLin(c, d)}`,
      answer: x,
      steps: [
        `Събираме x-овете отляво, числата отдясно: ${fmtLin(a, 0)} ${c > 0 ? '−' : '+'} ${fmtLin(Math.abs(c), 0)} = ${num(d)}${b === 0 ? '' : ` ${b > 0 ? '−' : '+'} ${Math.abs(b)}`}`,
        `${fmtLin(a - c, 0)} = ${num(d - b)}`,
        `Делим на ${num(a - c)}: x = ${num(x)}`,
      ],
    };
  }

  const a = randNonZero(-6, 6);
  const b = randNonZero(-9, 9);
  const c = a * (x + b);
  return {
    text: `${num(a)}(${fmtLin(1, b)}) = ${num(c)}`,
    answer: x,
    steps: [
      `Делим двете страни на ${num(a)}: ${fmtLin(1, b)} = ${num(x + b)}`,
      `Прехвърляме ${num(b)}: x = ${num(x + b)} ${b > 0 ? '−' : '+'} ${Math.abs(b)}`,
      `x = ${num(x)}`,
    ],
  };
};

function Trainer() {
  const [task, setTask] = useState<Task>(newTask);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const value = Number(input.trim().replace('−', '-').replace(',', '.'));
    if (input.trim() === '' || Number.isNaN(value)) return;
    if (value === task.answer) {
      setResult('correct');
      setSolved(solved + 1);
      setStreak(streak + 1);
      setBest(Math.max(best, streak + 1));
    } else {
      setResult('wrong');
      setStreak(0);
    }
  };

  const next = () => {
    setTask(newTask());
    setInput('');
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center font-mono text-xl sm:text-2xl mb-4 text-gray-800 dark:text-gray-100">
        {task.text}
      </p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-lg">x =</span>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-24 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следващо →
          </button>
        ) : (
          <button onClick={check} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
            Провери
          </button>
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
          {task.steps.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🚕 Такси',
    problem: 'Таксито взима 3 € за качване и 1,50 € на километър. Платили сме 18 €. Колко километра сме пътували?',
    solution: [
      'Нека $x$ е броят километри.',
      '$3 + 1{,}5x = 18$',
      '$1{,}5x = 15$',
      '$x = 10$',
    ],
    answer: '10 km',
    check: [10],
    ask: ['километри'],
  },
  {
    title: '👩‍👧 Възрасти',
    problem: 'Майка е на 38 години, а дъщеря ѝ – на 10. След колко години майката ще бъде точно два пъти по-голяма от дъщеря си?',
    solution: [
      'След $x$ години: майката е на $38 + x$, дъщерята – на $10 + x$.',
      '$38 + x = 2(10 + x)$',
      '$38 + x = 20 + 2x$',
      '$18 = x$',
    ],
    answer: 'След 18 години (майката ще е на 56, а дъщерята – на 28)',
    check: [18],
    ask: ['след колко години'],
  },
  {
    title: '🌡️ Температура',
    problem: 'Градусите по Фаренхайт се пресмятат с $F = 1{,}8C + 32$. При каква температура двата термометъра показват едно и също число?',
    solution: [
      'Търсим $x$, за което $F = C = x$.',
      '$x = 1{,}8x + 32$',
      '$-0{,}8x = 32$',
      '$x = -40$',
    ],
    answer: '$-40^\\circ$ ($-40\\ ^\\circ\\mathrm{C} = -40\\ ^\\circ\\mathrm{F}$)',
    check: [-40],
    ask: ['температура, °'],
  },
  {
    title: '🏷️ Намаление',
    problem: 'След намаление с 20% якето струва 36 €. Колко е струвало преди намалението?',
    solution: ['Нека $x$ е старата цена. Намалението е $0{,}2x$.', '$x - 0{,}2x = 36$', '$0{,}8x = 36$', '$x = 36 : 0{,}8 = 45$'],
    answer: '45 €',
    check: [45],
    ask: ['стара цена, €'],
  },
  {
    title: '🍎 Пазар',
    problem: '2 kg ябълки и 3 kg круши струват 13,50 €. Килограм круши е с 0,50 € по-скъп от килограм ябълки. Колко струва килограм ябълки?',
    solution: ['Нека $x$ е цената на ябълките, тогава крушите са $x + 0{,}5$.', '$2x + 3(x + 0{,}5) = 13{,}5$', '$5x + 1{,}5 = 13{,}5$', '$5x = 12 \\Rightarrow x = 2{,}4$'],
    answer: '2,40 € (крушите – 2,90 €)',
    check: [2.4],
    ask: ['ябълки, €/kg'],
  },
];

// ---------- Тест ----------

const linearEquationsQuiz: Question[] = [
  {
    question: 'Реши уравнението: $3x + 5 = 14$',
    answers: ['$x = 3$', '$x = 4$', '$x = 5$', '$x = 6$'],
    correctAnswer: '$x = 3$',
  },
  {
    question: 'Реши уравнението: $5x - 7 = 2x + 8$',
    answers: ['$x = \\frac{1}{3}$', '$x = 3$', '$x = 5$', '$x = 15$'],
    correctAnswer: '$x = 5$',
  },
  {
    question: 'Реши уравнението: $2(x - 3) = 4x + 2$',
    answers: ['$x = 4$', '$x = -4$', '$x = -2$', '$x = 2$'],
    correctAnswer: '$x = -4$',
  },
  {
    question: 'Реши уравнението: $\\frac{x}{3} + 2 = 5$',
    answers: ['$x = 1$', '$x = 9$', '$x = 21$', '$x = 3$'],
    correctAnswer: '$x = 9$',
  },
  {
    question: 'Колко решения има уравнението $4x + 1 = 4x - 3$?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Нито едно',
  },
  {
    question: 'Колко решения има уравнението $3(x + 2) = 3x + 6$?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Безброй много',
  },
  {
    question: 'Колко са решенията на $|x - 2| = 5$?',
    answers: ['Само $x = 7$', '$x = 7$ и $x = -3$', '$x = 3$ и $x = -7$', 'Няма решение'],
    correctAnswer: '$x = 7$ и $x = -3$',
  },
  {
    question: 'При кое $a$ уравнението $(a - 1)x = 3$ няма решение?',
    answers: ['$a = 0$', '$a = 1$', '$a = 3$', '$a = -1$'],
    correctAnswer: '$a = 1$',
  },
];

// ---------- Страница ----------

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

export function LinearEquations() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Линейни уравнения</h1>

        <div className="bg-gradient-to-br from-blue-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏛️ Върху гроба на Диофант Александрийски, „бащата на алгебрата“ (III век), според легендата е издълбана загадка: „Шестата част
            от живота му беше детство, една дванадесета – юношество, а след още една седма той се ожени. Пет години по-късно му се роди син,
            който живя наполовина колкото баща си. Четири години след сина си Диофант почина.“ На колко години е починал? Днес всеки
            седмокласник може да реши тази загадка за две минути – с едно линейно уравнение. Ще го направиш в задача 6.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е линейно уравнение?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Намислих число. Умножих го по 3, добавих 7 и получих 31. Кое е числото? Ако си отговорил „8“, ти
              току-що реши линейно уравнение: <span className="font-mono"><Tex>{'3x + 7 = 31'}</Tex></span>.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Линейно уравнение"
            description="Уравнение с едно неизвестно, което след опростяване може да се запише във вида $ax + b = 0$ ($a$ и $b$ са числа). Ако $a \ne 0$, то има единствено решение $x = -\frac{b}{a}$. Наричаме го „линейно“, защото неизвестното е само на първа степен – няма $x^2$, $\sqrt{x}$ или $\frac{1}{x}$."
          />
          <p className={text}>
            Да решим уравнението означава да намерим онова число, което превръща равенството във вярно твърдение. Две уравнения са
            <strong> равносилни</strong>, ако имат едни и същи решения – а решаването е верига от равносилни уравнения, всяко по-просто от
            предишното.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Златното правило</h2>
          <p className={text}>
            Уравнението е като везна в равновесие. Можем да добавяме, изваждаме, умножаваме или делим, стига да правим{' '}
            <strong>едно и също с двете страни</strong> – тогава равновесието се запазва. Натисни бутона и виж как се решава уравнението стъпка
            по стъпка.
          </p>
          <Theorem
            title="Равносилни преобразувания"
            description="Уравнението не променя решенията си, ако: 1) към двете му страни прибавим (или извадим) едно и също число или израз; 2) умножим (или разделим) двете страни на едно и също число, различно от 0. Следствие: член може да се прехвърли от едната страна в другата с обратен знак."
          />
          <BalanceScale />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Алгоритъм за решаване</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
            {[
              ['1', 'Разкриваме скобите', '$3(x - 2) \\to 3x - 6$'],
              ['2', 'Освобождаваме се от знаменателите', 'умножаваме двете страни по общия знаменател'],
              ['3', 'Прехвърляме', 'членовете с $x$ – отляво, числата – отдясно (със сменен знак!)'],
              ['4', 'Привеждаме подобните', '$5x - 2x = 3x$; $8 + 4 = 12$'],
              ['5', 'Делим на коефициента пред $x$', '$3x = 12 \\to x = 4$'],
              ['6', 'Проверка', 'заместваме $x$ в началното уравнение'],
            ].map(([n, title, hint]) => (
              <div key={n} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm"><MathText>{n}</MathText></span>
                <div>
                  <p className="font-semibold"><MathText>{title}</MathText></p>
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-xs sm:text-sm"><MathText>{hint}</MathText></p>
                </div>
              </div>
            ))}
          </div>
          <Example
            description="Да решим уравнението $2(x + 3) - 5 = 4x - 7$"
            steps={[
              'Разкриваме скобите: $2x + 6 - 5 = 4x - 7$',
              'Привеждаме подобните: $2x + 1 = 4x - 7$',
              'Прехвърляме: $2x - 4x = -7 - 1$',
              'Привеждаме: $-2x = -8$',
              'Делим на −2: $x = 4$',
              'Проверка: $2(4 + 3) - 5 = 9$ и $4\\cdot 4 - 7 = 9$ ✓',
            ]}
          />
          <Example
            description="Да решим уравнението с дроби $\frac{x - 1}{2} + \frac{x}{3} = 3$"
            steps={[
              'Общият знаменател е 6. Умножаваме двете страни по 6: $3(x - 1) + 2x = 18$',
              'Разкриваме скобите: $3x - 3 + 2x = 18$',
              'Привеждаме: $5x - 3 = 18$',
              'Прехвърляме: $5x = 21$',
              'Делим на 5: $x = \\frac{21}{5} = 4{,}2$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Колко решения може да има?</h2>
          <p className={text}>Понякога <Tex>{'x'}</Tex> „изчезва“ при опростяването и остава уравнение от вида <Tex>{'0 \\cdot x = b'}</Tex>:</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-green-600 dark:text-green-400"><Tex>{'a \\ne 0 \\to'}</Tex> едно решение</p>
              <p className="font-mono text-sm"><Tex>{'2x + 1 = 7 \\to x = 3'}</Tex></p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-red-600 dark:text-red-400"><Tex>{'0 \\cdot x = b,\\ b \\ne 0 \\to'}</Tex> няма решение</p>
              <p className="font-mono text-sm"><Tex>{'2x + 1 = 2x + 5 \\to 0 \\cdot x = 4'}</Tex> ✗</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400"><Tex>{'0 \\cdot x = 0 \\to'}</Tex> безброй решения</p>
              <p className="font-mono text-sm"><Tex>{'2(x + 1) = 2x + 2 \\to 0 \\cdot x = 0'}</Tex> ✓</p>
            </div>
          </div>
          <p className={text}>
            Изразът <Tex>{'ax + b'}</Tex> описва права линия <Tex>{'y = ax + b'}</Tex>. Решението на <Tex>{'ax + b = 0'}</Tex> е точката, в която правата пресича оста Ox. Промени <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> и
            наблюдавай как се мести решението.
          </p>
          <GraphExplorer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Уравнения с параметър</h2>
          <p className={text}>
            Често в уравнението освен <Tex>{'x'}</Tex> има и друга буква – <strong>параметър</strong>. „Да решим уравнението“ тогава означава да кажем какво е
            решението <em>за всяка</em> стойност на параметъра. Ключът е коефициентът пред <Tex>{'x'}</Tex>: щом той може да стане 0, трябва да разгледаме този
            случай отделно.
          </p>
          <Example
            description="Да решим уравнението $(a - 2)x = a^2 - 4$ за всяка стойност на $a$."
            steps={[
              'Коефициентът пред $x$ е $a - 2$. Той е 0 при $a = 2$.',
              'Ако $a \\ne 2$: делим на $a - 2$ и получаваме $x = \\frac{(a - 2)(a + 2)}{a - 2} = a + 2$.',
              'Ако $a = 2$: уравнението става $0 \\cdot x = 0$ – всяко $x$ е решение.',
              'Отговор: при $a \\ne 2$ – едно решение $x = a + 2$; при $a = 2$ – безброй решения.',
            ]}
          />
          <ParameterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Уравнения с модул</h2>
          <Theorem
            title="Уравнението $|x - a| = b$"
            description="Модулът $|x - a|$ е разстоянието между числата $x$ и $a$ на числовата ос. Затова: при $b > 0$ има две решения, $x = a - b$ и $x = a + b$; при $b = 0$ – едно решение, $x = a$; при $b < 0$ – няма решение. Алгебрично: $|E| = b\ (b \ge 0) \iff E = b$ или $E = -b$."
          />
          <AbsValueLab />
          <Example
            description="Да решим уравнението $|2x - 3| = 7$"
            steps={['Изразът в модула е 7 или −7:', '$2x - 3 = 7 \\Rightarrow 2x = 10 \\Rightarrow x = 5$', '$2x - 3 = -7 \\Rightarrow 2x = -4 \\Rightarrow x = -2$', 'Отговор: $x = 5$ или $x = -2$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. От текст към уравнение</h2>
          <p className={text}>
            Най-трудната част е да превърнем текста в уравнение. Избери кое е неизвестното, означи го с <Tex>{'x'}</Tex> и запиши условието като равенство. В
            задачите за движение използваме <span className="font-mono">път = скорост · време</span>.
          </p>
          <MeetingLab />
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Забравен знак при прехвърляне', '$3x + 5 = 2 \\to 3x = 2 + 5$', '$3x = 2 - 5 = -3$'],
              ['Делене само на част от страната', '$2x + 6 = 10 \\to x + 6 = 5$', '$x + 3 = 5$ (делим всеки член)'],
              ['Скоба с минус пред нея', '$5 - (x - 2) = 1 \\to 5 - x - 2 = 1$', '$5 - x + 2 = 1$'],
              ['Делене на коефициента обърнато', '$4x = 2 \\to x = \\frac{4}{2} = 2$', '$x = \\frac{2}{4} = 0{,}5$'],
              ['Делене на израз, който може да е 0', '$(a - 1)x = a - 1 \\to x = 1$ за всяко $a$', 'при $a = 1$ всяко $x$ е решение'],
              ['Модул равен на отрицателно число', '$|x + 1| = -3 \\to x = -4$ или $x = 2$', 'няма решение – модулът е $\\ge 0$'],
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
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Безкраен брой уравнения! Колко поредни верни отговора можеш да постигнеш?</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={linearEquationsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Реши уравнението $5(x - 2) - 3(x + 1) = 7$.">
                <p>Разкриваме скобите: <Tex>{'5x - 10 - 3x - 3 = 7'}</Tex></p>
                <p>Привеждаме: <Tex>{'2x - 13 = 7 \\Rightarrow 2x = 20'}</Tex></p>
                <p><Tex>{'x = 10'}</Tex>. Проверка: <Tex>{'5 \\cdot 8 - 3 \\cdot 11 = 40 - 33 = 7'}</Tex> ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Реши уравнението $\frac{2x - 1}{3} - \frac{x + 2}{4} = 1$.">
                <p>Умножаваме по общия знаменател 12: <Tex>{'4(2x - 1) - 3(x + 2) = 12'}</Tex></p>
                <p><Tex>{'8x - 4 - 3x - 6 = 12 \\Rightarrow 5x - 10 = 12'}</Tex></p>
                <p><Tex>{'5x = 22 \\Rightarrow x = 4{,}4'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Сборът на три последователни естествени числа е 87. Кои са числата?">
                <p>Нека най-малкото е <Tex>{'n'}</Tex>. Тогава числата са <Tex>{'n,\\ n + 1,\\ n + 2'}</Tex>.</p>
                <p><Tex>{'n + (n + 1) + (n + 2) = 87 \\Rightarrow 3n + 3 = 87 \\Rightarrow 3n = 84 \\Rightarrow n = 28'}</Tex></p>
                <p>Числата са 28, 29 и 30. (По-кратко: средното е <Tex>{'87 : 3 = 29'}</Tex>.)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Реши уравнението $|3 - 2x| = 9$.">
                <p><Tex>{'3 - 2x = 9'}</Tex> или <Tex>{'3 - 2x = -9'}</Tex></p>
                <p><Tex>{'-2x = 6 \\Rightarrow x = -3'}</Tex>; <Tex>{'-2x = -12 \\Rightarrow x = 6'}</Tex></p>
                <p>Отговор: <Tex>{'x = -3'}</Tex> или <Tex>{'x = 6'}</Tex>. (Геометрично: <Tex>{'|x - 1{,}5| = 4{,}5'}</Tex> – точките на разстояние 4,5 от 1,5.)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="От два града на разстояние $300\ \mathrm{km}$ един срещу друг тръгват две коли – първата със $70\ \mathrm{km/h}$, а втората половин час по-късно с $80\ \mathrm{km/h}$. Кога и къде ще се срещнат?">
                <p>Нека <Tex>{'t'}</Tex> е времето на първата кола (в часове). Втората е пътувала <Tex>{'t - 0{,}5'}</Tex> часа.</p>
                <p><Tex>{'70t + 80(t - 0{,}5) = 300 \\Rightarrow 150t - 40 = 300 \\Rightarrow t = \\frac{340}{150} \\approx 2{,}27\\ \\mathrm{h}'}</Tex></p>
                <p><Tex>{'t \\approx 2'}</Tex> ч 16 мин след тръгването на първата кола, на <Tex>{'70 \\cdot 2{,}27 \\approx 158{,}7\\ \\mathrm{km}'}</Tex> от нейния град.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Реши загадката на Диофант от началото на урока: $\frac{x}{6} + \frac{x}{12} + \frac{x}{7} + 5 + \frac{x}{2} + 4 = x$.">
                <p>Общият знаменател на 6, 12, 7 и 2 е 84. Умножаваме по 84:</p>
                <p><Tex>{'14x + 7x + 12x + 420 + 42x + 336 = 84x'}</Tex></p>
                <p><Tex>{'75x + 756 = 84x \\Rightarrow 9x = 756 \\Rightarrow x = 84'}</Tex></p>
                <p>Диофант е починал на 84 години, синът му е живял 42 години.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Реши уравнението $a(x - 1) = 2x + 3$ в зависимост от параметъра $a$. За кои цели стойности на $a$ решението е цяло число?">
                <p><Tex>{'ax - a = 2x + 3 \\Rightarrow (a - 2)x = a + 3'}</Tex></p>
                <p>При <Tex>{'a = 2'}</Tex>: <Tex>{'0 \\cdot x = 5'}</Tex> – няма решение. При <Tex>{'a \\ne 2'}</Tex>: <Tex>{'x = \\frac{a + 3}{a - 2}'}</Tex>.</p>
                <p>Отделяме цяла част: <Tex>{'x = 1 + \\frac{5}{a - 2}'}</Tex>. Цяло е <Tex>{'\\iff a - 2 \\mid 5 \\iff a - 2 \\in \\{\\pm 1, \\pm 5\\}'}</Tex>.</p>
                <p><Tex>{'a \\in \\{-3, 1, 3, 7\\}'}</Tex>, съответно <Tex>{'x = 0,\\ -4,\\ 6,\\ 2'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Реши уравнението $|x - 1| + |x - 3| = 4$.">
                <p>Нулите на модулите 1 и 3 разделят оста на три интервала.</p>
                <p><Tex>{'x < 1'}</Tex>: <Tex>{'(1 - x) + (3 - x) = 4 \\Rightarrow 4 - 2x = 4 \\Rightarrow x = 0'}</Tex> ✓</p>
                <p><Tex>{'1 \\le x \\le 3'}</Tex>: <Tex>{'(x - 1) + (3 - x) = 2 \\ne 4'}</Tex> – няма решение в този интервал.</p>
                <p><Tex>{'x > 3'}</Tex>: <Tex>{'(x - 1) + (x - 3) = 4 \\Rightarrow 2x = 8 \\Rightarrow x = 4'}</Tex> ✓</p>
                <p>Отговор: <Tex>{'x = 0'}</Tex> или <Tex>{'x = 4'}</Tex>. Геометрично: сборът от разстоянията до 1 и до 3 е 4 – а между тях винаги е 2.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Точно в 12:00 часовата и минутната стрелка на часовника се застъпват. След колко минути ще се застъпят отново за първи път?">
                <p>Минутната стрелка се върти с <Tex>{'360^\\circ'}</Tex> за 60 мин = <Tex>{'6^\\circ'}</Tex> в минута, часовата – с <Tex>{'30^\\circ'}</Tex> за 60 мин = <Tex>{'0{,}5^\\circ'}</Tex> в минута.</p>
                <p>Минутната трябва да „настигне“ часовата с цяла обиколка: <Tex>{'6t = 360 + 0{,}5t'}</Tex></p>
                <p><Tex>{'5{,}5t = 360 \\Rightarrow t = \\frac{720}{11} = 65\\tfrac{5}{11}'}</Tex> мин</p>
                <p>Около 1:05:27 ч. Това е задача за движение – „гонене“ по окръжност!</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Линейно уравнение: <Tex>{'ax + b = 0'}</Tex>; при <Tex>{'a \\ne 0'}</Tex> решението е <Tex>{'x = -\\frac{b}{a}'}</Tex></li>
              <li>✓ Равносилни преобразувания: едно и също действие с двете страни (делим само на число <Tex>{'\\ne 0'}</Tex>)</li>
              <li>✓ Алгоритъм: скоби → знаменатели → прехвърляне → привеждане → делене → проверка</li>
              <li>✓ <Tex>{'0 \\cdot x = b'}</Tex>: няма решение при <Tex>{'b \\ne 0'}</Tex>, безброй решения при <Tex>{'b = 0'}</Tex></li>
              <li>✓ Параметър: разглеждаме отделно стойностите, при които коефициентът пред <Tex>{'x'}</Tex> е 0</li>
              <li>✓ <Tex>{'|x - a| = b'}</Tex> – точките на разстояние <Tex>{'b'}</Tex> от <Tex>{'a'}</Tex>: <Tex>{'x = a \\pm b'}</Tex> при <Tex>{'b > 0'}</Tex></li>
              <li>✓ Текстови задачи: неизвестно → уравнение → решение → проверка на смисъла</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „алгебра“ идва от книгата на персийския математик ал-Хорезми (IX век) „Китаб ал-джабр ва-л-мукабала“. „Ал-джабр“
              означава „възстановяване“ – точно прехвърлянето на член от едната страна на другата, което правим при решаване на уравнения. А от
              името на самия ал-Хорезми идва думата „алгоритъм“!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
