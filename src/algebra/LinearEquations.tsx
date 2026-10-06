import { CheckCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';

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

const wordProblems = [
  {
    title: '🚕 Такси',
    problem: 'Таксито взима 3 лв. за качване и 1.50 лв. на километър. Платили сме 18 лв. Колко километра сме пътували?',
    solution: [
      'Нека x е броят километри.',
      '3 + 1.5x = 18',
      '1.5x = 15',
      'x = 10',
    ],
    answer: '10 km',
  },
  {
    title: '👩‍👧 Възрасти',
    problem: 'Майка е на 38 години, а дъщеря ѝ – на 10. След колко години майката ще бъде точно два пъти по-голяма от дъщеря си?',
    solution: [
      'След x години: майката е на 38 + x, дъщерята – на 10 + x.',
      '38 + x = 2(10 + x)',
      '38 + x = 20 + 2x',
      '18 = x',
    ],
    answer: 'След 18 години (майката ще е на 56, а дъщерята – на 28)',
  },
  {
    title: '🌡️ Температура',
    problem: 'Градусите по Фаренхайт се пресмятат с F = 1.8C + 32. При каква температура двата термометъра показват едно и също число?',
    solution: [
      'Търсим x, за което F = C = x.',
      'x = 1.8x + 32',
      '−0.8x = 32',
      'x = −40',
    ],
    answer: '−40° (−40 °C = −40 °F)',
  },
];

// ---------- Тест ----------

const linearEquationsQuiz: Question[] = [
  {
    question: 'Реши уравнението: 3x + 5 = 14',
    answers: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correctAnswer: 'x = 3',
  },
  {
    question: 'Реши уравнението: 5x − 7 = 2x + 8',
    answers: ['x = 1/3', 'x = 3', 'x = 5', 'x = 15'],
    correctAnswer: 'x = 5',
  },
  {
    question: 'Реши уравнението: 2(x − 3) = 4x + 2',
    answers: ['x = 4', 'x = −4', 'x = −2', 'x = 2'],
    correctAnswer: 'x = −4',
  },
  {
    question: 'Реши уравнението: x/3 + 2 = 5',
    answers: ['x = 1', 'x = 9', 'x = 21', 'x = 3'],
    correctAnswer: 'x = 9',
  },
  {
    question: 'Колко решения има уравнението 4x + 1 = 4x − 3?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Нито едно',
  },
  {
    question: 'Колко решения има уравнението 3(x + 2) = 3x + 6?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Безброй много',
  },
];

// ---------- Страница ----------

export function LinearEquations() {
  const [openProblems, setOpenProblems] = useState<{ [key: number]: boolean }>({});

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Решаване на линейни уравнения
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Намислих число. Умножих го по 3, добавих 7 и получих 31.
              Кое е числото? Ако си отговорил „8“, ти току-що реши линейно уравнение:{' '}
              <span className="font-mono">3x + 7 = 31</span>.
            </p>
          </div>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Линейно уравнение с едно неизвестно е уравнение, което след опростяване може да се
            запише във вида:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4">
            <p className="text-base sm:text-lg font-mono text-center text-gray-800 dark:text-gray-100">
              ax + b = 0, където a ≠ 0
            </p>
            <p className="text-base sm:text-lg font-mono text-center mt-2 text-gray-800 dark:text-gray-100">
              Решение: x = −b / a
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Наричаме го „линейно“, защото неизвестното x е само на първа степен – няма x², √x
            или 1/x. Да решим уравнението означава да намерим онова число, което превръща
            равенството във вярно твърдение.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Златното правило
          </h2>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Уравнението е като везна в равновесие. Можем да добавяме, изваждаме, умножаваме или
            делим, стига да правим <strong>едно и също с двете страни</strong> – тогава
            равновесието се запазва. Натисни бутона и виж как се решава уравнението стъпка по стъпка.
          </p>
          <BalanceScale />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Алгоритъм за решаване
          </h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['1', 'Разкриваме скобите', '3(x − 2) → 3x − 6'],
              ['2', 'Освобождаваме се от знаменателите', 'умножаваме двете страни по общия знаменател'],
              ['3', 'Прехвърляме', 'членовете с x – отляво, числата – отдясно (със сменен знак!)'],
              ['4', 'Привеждаме подобните', '5x − 2x = 3x;  8 + 4 = 12'],
              ['5', 'Делим на коефициента пред x', '3x = 12 → x = 4'],
              ['6', 'Проверка', 'заместваме x в началното уравнение'],
            ].map(([n, title, hint]) => (
              <div key={n} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {n}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-xs sm:text-sm">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <Example
            description="Да решим уравнението 2(x + 3) − 5 = 4x − 7"
            steps={[
              'Разкриваме скобите: 2x + 6 − 5 = 4x − 7',
              'Привеждаме подобните: 2x + 1 = 4x − 7',
              'Прехвърляме: 2x − 4x = −7 − 1',
              'Привеждаме: −2x = −8',
              'Делим на −2: x = 4',
              'Проверка: 2(4 + 3) − 5 = 9 и 4·4 − 7 = 9 ✓',
            ]}
          />
          <Example
            description="Да решим уравнението с дроби (x − 1)/2 + x/3 = 3"
            steps={[
              'Общият знаменател е 6. Умножаваме двете страни по 6: 3(x − 1) + 2x = 18',
              'Разкриваме скобите: 3x − 3 + 2x = 18',
              'Привеждаме: 5x − 3 = 18',
              'Прехвърляме: 5x = 21',
              'Делим на 5: x = 21/5 = 4.2',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Колко решения може да има?
          </h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Понякога x „изчезва“ при опростяването и остава уравнение от вида 0 · x = b:
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-green-600 dark:text-green-400">a ≠ 0 → едно решение</p>
              <p className="font-mono text-sm">2x + 1 = 7 → x = 3</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-red-600 dark:text-red-400">0 · x = b, b ≠ 0 → няма решение</p>
              <p className="font-mono text-sm">2x + 1 = 2x + 5 → 0 · x = 4 ✗</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">0 · x = 0 → безброй решения</p>
              <p className="font-mono text-sm">2(x + 1) = 2x + 2 → 0 · x = 0 ✓ за всяко x</p>
            </div>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            Как изглежда на графика?
          </h2>
          <p className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Изразът ax + b описва права линия y = ax + b. Решението на ax + b = 0 е точката, в
            която правата пресича оста Ox. Промени a и b и наблюдавай как се мести решението.
          </p>
          <GraphExplorer />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
            ⚠️ Чести грешки
          </h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Забравен знак при прехвърляне', '3x + 5 = 2 → 3x = 2 + 5', '3x = 2 − 5 = −3'],
              ['Делене само на част от страната', '2x + 6 = 10 → x + 6 = 5', 'x + 3 = 5 (делим всеки член)'],
              ['Скоба с минус пред нея', '5 − (x − 2) = 1 → 5 − x − 2 = 1', '5 − x + 2 = 1'],
              ['Делене на коефициента обърнато', '4x = 2 → x = 4/2 = 2', 'x = 2/4 = 0.5'],
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
            Най-трудната част е да превърнем текста в уравнение. Избери кое е неизвестното,
            означи го с x и запиши условието като равенство.
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
            Безкраен брой уравнения! Колко поредни верни отговора можеш да постигнеш?
          </p>
          <Trainer />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Упражнения
          </h2>
          <Quiz questions={linearEquationsQuiz} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „алгебра“ идва от книгата на персийския математик ал-Хорезми (IX век)
              „Китаб ал-джабр ва-л-мукабала“. „Ал-джабр“ означава „възстановяване“ – точно
              прехвърлянето на член от едната страна на другата, което правим при решаване на
              уравнения. А от името на самия ал-Хорезми идва думата „алгоритъм“!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
