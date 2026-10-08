import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { fracText } from './fractionMath';
import LogGraphLab from './LogGraphLab';
import LogRulerLab from './LogRulerLab';
import SlideRuleLab from './SlideRuleLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: T[]) => xs[randInt(0, xs.length - 1)];
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const logName = (a: number) => (a === 10 ? 'lg' : `log${String(a).split('').map(d => SUB[Number(d)]).join('')}`);
/** aᵏ като число или дроб: 2⁻³ → 1/8. */
const powText = (a: number, k: number) => (k >= 0 ? String(a ** k).replace('.', ',') : `1/${a ** -k}`);

type Drill = { text: string; num: number; den: number; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = pick([2, 3, 5, 10]);
    const k = randInt(a === 10 ? -3 : -3, a === 2 ? 6 : a === 10 ? 4 : 4);
    return {
      text: `${logName(a)} ${powText(a, k)} = ?`,
      num: k,
      den: 1,
      steps: [`${powText(a, k)} = ${a}^${k}`.replace('-', '−'), `${logName(a)} ${a}^${k} = ${k}`.replace(/-/g, '−')],
    };
  }
  if (kind === 1) {
    // log_{b^m} b^k = k/m
    const [b, m] = pick([
      [2, 2],
      [2, 3],
      [3, 2],
    ] as const);
    const base = b ** m;
    const k = pick([1, 2, 3, 4, 5].filter(v => v % m !== 0));
    return {
      text: `${logName(base)} ${b ** k} = ?`,
      num: k,
      den: m,
      steps: [`${base} = ${b}^${m} и ${b ** k} = ${b}^${k}`, `(${b}^${m})^x = ${b}^${k} ⇒ ${m}x = ${k} ⇒ x = ${fracText(k, m)}`],
    };
  }
  const [a, x, y, op] = pick([
    [10, 4, 25, '+'],
    [10, 2, 50, '+'],
    [10, 5, 20, '+'],
    [2, 12, 3, '−'],
    [2, 40, 5, '−'],
    [3, 18, 2, '−'],
    [6, 4, 9, '+'],
    [5, 50, 2, '−'],
  ] as const);
  const v = op === '+' ? Math.round(Math.log(x * y) / Math.log(a)) : Math.round(Math.log(x / y) / Math.log(a));
  return {
    text: `${logName(a)} ${x} ${op} ${logName(a)} ${y} = ?`,
    num: v,
    den: 1,
    steps: [
      op === '+' ? `= ${logName(a)} (${x} · ${y}) = ${logName(a)} ${x * y}` : `= ${logName(a)} (${x} : ${y}) = ${logName(a)} ${x / y}`,
      `= ${v}, защото ${a}^${v} = ${a ** v}`,
    ],
  };
};

function parseNum(s: string) {
  const t = s.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (t === '') return null;
  if (t.includes('/')) {
    const [p, q] = t.split('/').map(Number);
    return Number.isNaN(p) || Number.isNaN(q) || q === 0 ? null : p / q;
  }
  const v = Number(t);
  return Number.isNaN(v) ? null : v;
}

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const v = parseNum(input);
    if (v === null) return;
    if (Math.abs(v - task.num / task.den) < 1e-9) {
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
    setTask(newDrill());
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

      <p className="text-center font-mono text-2xl sm:text-3xl mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <input
          type="text"
          aria-label="Отговор"
          placeholder="напр. 3/2"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-28 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следващ →
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
            : 'Не съвсем. На каква степен трябва да повдигнем основата?'}
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
    title: '🧪 pH',
    problem: 'Киселинността се мери с pH = −lg[H⁺], където [H⁺] е концентрацията на водородни йони (в mol/l). Каква е pH на разтвор с [H⁺] = 0,001 mol/l?',
    solution: ['0,001 = 10⁻³', 'lg 10⁻³ = −3', 'pH = −(−3) = 3 (кисел разтвор – като оцет)'],
    answer: 'pH = 3',
    check: [3],
    ask: ['pH'],
  },
  {
    title: '🔊 Децибели',
    problem: 'Силата на звука в децибели е L = 10 · lg(I/I₀). С колко децибела се увеличава тя, ако интензитетът на звука нарасне 1000 пъти?',
    solution: ['ΔL = 10 · lg 1000', 'lg 1000 = 3', 'ΔL = 30 dB'],
    answer: 'С 30 dB',
    check: [30],
    ask: ['увеличение, dB'],
  },
  {
    title: '⭐ Звездни величини',
    problem: 'В астрономията разлика от 5 звездни величини отговаря на 100 пъти разлика в яркостта. Колко пъти звезда от 1-ва величина е по-ярка от звезда от 6-та?',
    solution: ['Разликата е 6 − 1 = 5 величини.', 'Отношението на яркостите е 100^(5/5) = 100.', 'Обратно: m₁ − m₂ = −2,5 · lg(E₁/E₂) – логаритмична скала.'],
    answer: '100 пъти',
    check: [100],
    ask: ['пъти'],
  },
  {
    title: '🏦 Удвояване на вложение',
    problem: 'След колко години вложение при 7% годишна сложна лихва ще се удвои? (Решете 1,07ᵗ = 2.)',
    solution: ['Логаритмуваме: t · lg 1,07 = lg 2', 't = lg 2 / lg 1,07 ≈ 0,3010 / 0,02938', 't ≈ 10,24 години (т.е. на 11-ата година)'],
    answer: '≈ 10,24 години',
    check: [10.24],
    ask: ['години'],
  },
  {
    title: '🌋 Земетресения',
    problem: 'По скалата на Рихтер всяка единица отговаря на 10 пъти по-голяма амплитуда на трептенията. Колко пъти е по-голяма амплитудата при земетресение 7 спрямо земетресение 5?',
    solution: ['Разликата е 2 единици.', '10² = 100', 'Освободената енергия расте още по-бързо – приблизително 1000 пъти.'],
    answer: '100 пъти',
    check: [100],
    ask: ['пъти'],
  },
  {
    title: '🔢 Колко цифри?',
    problem: 'Колко цифри има числото 2¹⁰⁰? (lg 2 ≈ 0,30103)',
    solution: ['Число N има k цифри, когато 10ᵏ⁻¹ ≤ N < 10ᵏ, т.е. k − 1 ≤ lg N < k.', 'lg 2¹⁰⁰ = 100 · lg 2 ≈ 30,103', 'Значи 2¹⁰⁰ има 31 цифри.'],
    answer: '31 цифри',
    check: [31],
    ask: ['цифри'],
  },
];

// ---------- Тест ----------

const logQuiz: Question[] = [
  {
    question: 'На колко е равно log₂ 8?',
    answers: ['3', '4', '6', '16'],
    correctAnswer: '3',
  },
  {
    question: 'На колко е равно lg 0,01?',
    answers: ['2', '−2', '0,2', '−0,01'],
    correctAnswer: '−2',
  },
  {
    question: 'На колко е равно log₅ 1?',
    answers: ['0', '1', '5', 'не е дефинирано'],
    correctAnswer: '0',
  },
  {
    question: 'На колко е равно lg 2 + lg 5?',
    answers: ['lg 7', '1', '10', 'lg 2 · lg 5'],
    correctAnswer: '1',
  },
  {
    question: 'Ако log₂ x = 5, колко е x?',
    answers: ['10', '25', '32', '2,5'],
    correctAnswer: '32',
  },
  {
    question: 'Решението на уравнението 2ˣ = 10 е:',
    answers: ['x = 5', 'x = log₂ 10', 'x = log₁₀ 2', 'x = 10/2'],
    correctAnswer: 'x = log₂ 10',
  },
  {
    question: 'На колко е равно ln e?',
    answers: ['0', '1', 'e', '10'],
    correctAnswer: '1',
  },
  {
    question: 'На колко е равно log₄ 8?',
    answers: ['2', '1/2', '3/2', '2/3'],
    correctAnswer: '3/2',
  },
  {
    question: 'Кога е дефиниран log_a b?',
    answers: ['при a > 0, a ≠ 1, b > 0', 'при всяко a и b', 'при a > 0 и b ≥ 0', 'при a ≠ 0 и b ≠ 0'],
    correctAnswer: 'при a > 0, a ≠ 1, b > 0',
  },
];

// ---------- Страница ----------

export function Logarithms() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Логаритми</h1>

        <div className="bg-gradient-to-br from-teal-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔭 В началото на XVII век астрономите прекарват месеци в умножаване на огромни числа на ръка – за да пресметнат орбитите на
            планетите. През 1614 г. шотландецът Джон Непер публикува таблици на нов вид числа – <strong>логаритми</strong>, – с които
            умножението се превръща в събиране, а делението – в изваждане. Кеплер ги използва веднага при съставянето на своите таблици за
            движението на планетите. На Лаплас се приписва думата, че логаритмите, съкращавайки труда, „удвоили живота на астрономите“.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е логаритъм?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> На каква степен трябва да повдигнем 2, за да получим 8? Лесно – на 3. А за да получим 10? Между 3 и
              4 – но точно колко? Отговорът има име: log₂ 10 ≈ 3,32. Логаритъмът е <em>неизвестният показател</em>.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Логаритъм"
            description="Логаритъм от числото b при основа a (a > 0, a ≠ 1, b > 0) е показателят, на който трябва да повдигнем a, за да получим b: log_a b = c ⇔ aᶜ = b. Например log₂ 8 = 3, защото 2³ = 8; log₃ (1/9) = −2, защото 3⁻² = 1/9. Основно тъждество: a^(log_a b) = b."
          />
          <LogRulerLab />
          <p className={text}>
            Логаритмуването е обратното действие на степенуването – както изваждането е обратно на събирането. Ако степените ти трябва да
            се припомнят, виж урока{' '}
            <Link to="/algebra/powers" className={link}>
              Степени и корени
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Свойства на логаритмите</h2>
          <Theorem
            title="Основни свойства"
            description="За a > 0, a ≠ 1 и x, y > 0: log_a (xy) = log_a x + log_a y; log_a (x/y) = log_a x − log_a y; log_a (xⁿ) = n · log_a x; log_a 1 = 0; log_a a = 1. Смяна на основата: log_a b = log_c b / log_c a (за всяко c > 0, c ≠ 1). Те следват директно от правилата за степени: aᵐ · aⁿ = aᵐ⁺ⁿ."
          />
          <SlideRuleLab />
          <Example
            description="Да пресметнем lg 4 + lg 25 и log₂ 12 − log₂ 3."
            steps={['lg 4 + lg 25 = lg (4 · 25) = lg 100 = 2', 'log₂ 12 − log₂ 3 = log₂ (12 : 3) = log₂ 4 = 2']}
          />
          <Example
            description="Да пресметнем log₄ 8."
            steps={['Смяна на основата: log₄ 8 = log₂ 8 / log₂ 4 = 3/2', 'Проверка: 4^(3/2) = (√4)³ = 2³ = 8 ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Десетичен и натурален логаритъм</h2>
          <p className={text}>
            Два логаритъма имат специални означения. <strong>Десетичният</strong> lg x = log₁₀ x е удобен, защото системата ни е десетична:
            lg 1000 = 3, а броят на цифрите на число N е цялата част на lg N плюс 1. <strong>Натуралният</strong> ln x = logₑ x има за основа
            числото e ≈ 2,71828 – то се появява навсякъде, където нещо расте „непрекъснато“: в сложната лихва, в разпада на радиоактивни
            вещества, в растежа на популации. На калкулатора са бутоните <span className="font-mono">log</span> и{' '}
            <span className="font-mono">ln</span>; всеки друг логаритъм се пресмята със смяна на основата: log₂ 10 = lg 10 / lg 2 ≈ 3,32.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Логаритмичната функция</h2>
          <Theorem
            title="Свойства на y = log_a x"
            description="Дефинирана е за x > 0, приема всички реални стойности и графиката ѝ минава през (1; 0). При a > 1 е растяща, при 0 < a < 1 – намаляваща. Тя е обратна на показателната функция y = aˣ, затова графиките им са симетрични спрямо правата y = x."
          />
          <LogGraphLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Показателни и логаритмични уравнения</h2>
          <Example
            description="Да решим уравнението 3ˣ = 20."
            steps={['Логаритмуваме двете страни: x · lg 3 = lg 20', 'x = lg 20 / lg 3 ≈ 1,3010 / 0,4771', 'x ≈ 2,727 (проверка: 3²·⁷²⁷ ≈ 20 ✓)']}
          />
          <Example
            description="Да решим уравнението log₂ (x − 1) + log₂ (x + 1) = 3."
            steps={[
              'Допустими стойности: x − 1 > 0 и x + 1 > 0 ⇒ x > 1',
              'log₂ ((x − 1)(x + 1)) = 3 ⇒ x² − 1 = 2³ = 8',
              'x² = 9 ⇒ x = 3 или x = −3',
              'x = −3 не е допустимо ⇒ отговор x = 3',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни логаритъма без калкулатор. Дробните отговори въвеждай като 3/2.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Логаритмите около нас</h2>
          <p className={text}>
            Логаритмичните скали „свиват“ огромни диапазони в удобни числа: киселинността (pH), силата на звука (децибели), земетресенията
            (скалата на Рихтер) и яркостта на звездите (звездни величини – виж{' '}
            <Link to="/astronomy/lecture18" className={link}>
              лекцията за звездите
            </Link>
            ). Всяка стъпка по такава скала означава умножение, не събиране.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Логаритъм от сбор', 'lg (2 + 5) = lg 2 + lg 5', 'lg 2 + lg 5 = lg (2 · 5) = 1'],
              ['Логаритъм от произведение', 'log (xy) = log x · log y', 'log (xy) = log x + log y'],
              ['Квадрат на логаритъм', '(lg x)² = 2 lg x', 'lg (x²) = 2 lg x, а (lg x)² е друго'],
              ['Частно на логаритми', 'lg 8 / lg 2 = lg 4', 'lg 8 / lg 2 = log₂ 8 = 3'],
              ['Логаритъм от неположително число', 'lg (−10) = −1', 'не е дефиниран – трябва b > 0'],
              ['Без проверка на допустимите стойности', 'log₂(x − 1) + log₂(x + 1) = 3 ⇒ x = ±3', 'x = −3 отпада ⇒ само x = 3'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">{title}</p>
                <p className="font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={logQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете log₂ 64, log₃ (1/27) и lg 0,001.">
                <p>64 = 2⁶ ⇒ log₂ 64 = 6</p>
                <p>1/27 = 3⁻³ ⇒ log₃ (1/27) = −3</p>
                <p>0,001 = 10⁻³ ⇒ lg 0,001 = −3</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете lg 4 + lg 25.">
                <p>lg 4 + lg 25 = lg (4 · 25) = lg 100</p>
                <p>= 2</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете x, ако logₓ 49 = 2.">
                <p>По определение x² = 49, x &gt; 0, x ≠ 1.</p>
                <p>x = 7</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Решете уравнението 3ˣ = 20 (lg 3 ≈ 0,4771, lg 20 ≈ 1,3010).">
                <p>x · lg 3 = lg 20</p>
                <p>x = 1,3010 / 0,4771 ≈ 2,727</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Решете уравнението log₂ (x − 1) + log₂ (x + 1) = 3.">
                <p>Допустими: x &gt; 1.</p>
                <p>log₂ (x² − 1) = 3 ⇒ x² − 1 = 8 ⇒ x = ±3</p>
                <p>Отговор: x = 3.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Пресметнете log₄ 8 и log₂₇ 9.">
                <p>log₄ 8 = log₂ 8 / log₂ 4 = 3/2</p>
                <p>log₂₇ 9 = log₃ 9 / log₃ 27 = 2/3</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че log_a b · log_b a = 1, и пресметнете log₂ 3 · log₃ 4 · log₄ 5 · log₅ 6 · log₆ 7 · log₇ 8.">
                <p>Смяна на основата: log_a b = lg b / lg a и log_b a = lg a / lg b ⇒ произведението е 1.</p>
                <p>Аналогично произведението става (lg 3/lg 2) · (lg 4/lg 3) · … · (lg 8/lg 7) – съкращава се „верижно“.</p>
                <p>Остава lg 8 / lg 2 = log₂ 8 = 3.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Колко цифри има числото 3⁵⁰? (lg 3 ≈ 0,4771)">
                <p>lg 3⁵⁰ = 50 · lg 3 ≈ 23,86</p>
                <p>10²³ ≤ 3⁵⁰ &lt; 10²⁴</p>
                <p>Числото има 24 цифри.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кое е по-голямо: log₂ 3 или log₃ 5? (Без калкулатор.)">
                <p>Сравняваме с 3/2: 3² = 9 &gt; 8 = 2³ ⇒ 3 &gt; 2^(3/2) ⇒ log₂ 3 &gt; 3/2.</p>
                <p>5² = 25 &lt; 27 = 3³ ⇒ 5 &lt; 3^(3/2) ⇒ log₃ 5 &lt; 3/2.</p>
                <p>Значи log₂ 3 &gt; 3/2 &gt; log₃ 5. (Наистина: ≈ 1,585 и ≈ 1,465.)</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ log_a b = c ⇔ aᶜ = b (a &gt; 0, a ≠ 1, b &gt; 0)</li>
              <li>✓ log (xy) = log x + log y; log (x/y) = log x − log y; log xⁿ = n log x</li>
              <li>✓ Смяна на основата: log_a b = lg b / lg a</li>
              <li>✓ lg – основа 10, ln – основа e ≈ 2,718</li>
              <li>✓ y = log_a x е обратна на y = aˣ; графиките са симетрични спрямо y = x</li>
              <li>✓ В уравненията проверяваме допустимите стойности</li>
              <li>✓ Логаритмичните скали: pH, децибели, Рихтер, звездни величини</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Логаритмичната линийка, изобретена малко след таблиците на Непер (около 1620–1630 г.), е била основният инструмент на
              инженерите повече от три века. С нея са проектирани мостове, самолети и ракети – включително по програмата „Аполо“. Изместват я
              джобните калкулатори едва през 70-те години на XX век.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
