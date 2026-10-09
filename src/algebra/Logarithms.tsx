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
import { MathText, Tex } from '~/MathText';

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
    problem: 'Киселинността се мери с $\\mathrm{pH} = -\\lg [\\mathrm{H}^+]$, където $[\\mathrm{H}^+]$ е концентрацията на водородни йони (в mol/l). Каква е pH на разтвор с $[\\mathrm{H}^+] = 0{,}001\\ \\mathrm{mol/l}$?',
    solution: ['$0{,}001 = 10^{-3}$', '$\\lg 10^{-3} = -3$', '$\\mathrm{pH} = -(-3) = 3$ (кисел разтвор – като оцет)'],
    answer: '$\\mathrm{pH} = 3$',
    check: [3],
    ask: ['pH'],
  },
  {
    title: '🔊 Децибели',
    problem: 'Силата на звука в децибели е $L = 10 \\cdot \\lg \\left(\\frac{I}{I_0}\\right)$. С колко децибела се увеличава тя, ако интензитетът на звука нарасне 1000 пъти?',
    solution: ['$\\Delta L = 10 \\cdot \\lg 1000$', '$\\lg 1000 = 3$', '$\\Delta L = 30\\ \\mathrm{dB}$'],
    answer: 'С 30 dB',
    check: [30],
    ask: ['увеличение, dB'],
  },
  {
    title: '⭐ Звездни величини',
    problem: 'В астрономията разлика от 5 звездни величини отговаря на 100 пъти разлика в яркостта. Колко пъти звезда от 1-ва величина е по-ярка от звезда от 6-та?',
    solution: ['Разликата е $6 - 1 = 5$ величини.', 'Отношението на яркостите е $100^{5/5} = 100$.', 'Обратно: $m_1 - m_2 = -2{,}5 \\cdot \\lg \\left(\\frac{E_1}{E_2}\\right)$ – логаритмична скала.'],
    answer: '100 пъти',
    check: [100],
    ask: ['пъти'],
  },
  {
    title: '🏦 Удвояване на вложение',
    problem: 'След колко години вложение при 7% годишна сложна лихва ще се удвои? (Решете $1{,}07^t = 2$.)',
    solution: ['Логаритмуваме: $t \\cdot \\lg 1{,}07 = \\lg 2$', '$t = \\frac{\\lg 2}{\\lg 1{,}07} \\approx \\frac{0{,}3010}{0{,}02938}$', '$t \\approx 10{,}24$ години (т.е. на 11-ата година)'],
    answer: '$\\approx 10{,}24$ години',
    check: [10.24],
    ask: ['години'],
  },
  {
    title: '🌋 Земетресения',
    problem: 'По скалата на Рихтер всяка единица отговаря на 10 пъти по-голяма амплитуда на трептенията. Колко пъти е по-голяма амплитудата при земетресение 7 спрямо земетресение 5?',
    solution: ['Разликата е 2 единици.', '$10^2 = 100$', 'Освободената енергия расте още по-бързо – приблизително 1000 пъти.'],
    answer: '100 пъти',
    check: [100],
    ask: ['пъти'],
  },
  {
    title: '🔢 Колко цифри?',
    problem: 'Колко цифри има числото $2^{100}$? ($\\lg 2 \\approx 0{,}30103$)',
    solution: ['Число $N$ има $k$ цифри, когато $10^{k-1} \\le N < 10^k$, т.е. $k - 1 \\le \\lg N < k$.', '$\\lg 2^{100} = 100 \\cdot \\lg 2 \\approx 30{,}103$', 'Значи $2^{100}$ има 31 цифри.'],
    answer: '31 цифри',
    check: [31],
    ask: ['цифри'],
  },
];

// ---------- Тест ----------

const logQuiz: Question[] = [
  {
    question: 'На колко е равно $\\log _2 8$?',
    answers: ['$3$', '$4$', '$6$', '$16$'],
    correctAnswer: '$3$',
  },
  {
    question: 'На колко е равно $\\lg 0{,}01$?',
    answers: ['$2$', '$-2$', '$0{,}2$', '$-0{,}01$'],
    correctAnswer: '$-2$',
  },
  {
    question: 'На колко е равно $\\log _5 1$?',
    answers: ['$0$', '$1$', '$5$', 'не е дефинирано'],
    correctAnswer: '$0$',
  },
  {
    question: 'На колко е равно $\\lg 2 + \\lg 5$?',
    answers: ['$\\lg 7$', '$1$', '$10$', '$\\lg 2 \\cdot \\lg 5$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Ако $\\log _2 x = 5$, колко е $x$?',
    answers: ['$10$', '$25$', '$32$', '$2{,}5$'],
    correctAnswer: '$32$',
  },
  {
    question: 'Решението на уравнението $2^x = 10$ е:',
    answers: ['$x = 5$', '$x = \\log _2 10$', '$x = \\log _{10} 2$', '$x = \\frac{10}{2}$'],
    correctAnswer: '$x = \\log _2 10$',
  },
  {
    question: 'На колко е равно $\\ln e$?',
    answers: ['$0$', '$1$', '$e$', '$10$'],
    correctAnswer: '$1$',
  },
  {
    question: 'На колко е равно $\\log _4 8$?',
    answers: ['$2$', '$\\frac{1}{2}$', '$\\frac{3}{2}$', '$\\frac{2}{3}$'],
    correctAnswer: '$\\frac{3}{2}$',
  },
  {
    question: 'Кога е дефиниран $\\log _a b$?',
    answers: ['при $a > 0,\\ a \\ne 1,\\ b > 0$', 'при всяко $a$ и $b$', 'при $a > 0$ и $b \\ge 0$', 'при $a \\ne 0$ и $b \\ne 0$'],
    correctAnswer: 'при $a > 0,\\ a \\ne 1,\\ b > 0$',
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
              4 – но точно колко? Отговорът има име: <Tex>{'\\log _2 10 \\approx 3{,}32'}</Tex>. Логаритъмът е <em>неизвестният показател</em>.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Логаритъм"
            description="Логаритъм от числото $b$ при основа $a$ ($a > 0,\ a \ne 1,\ b > 0$) е показателят, на който трябва да повдигнем $a$, за да получим $b$: $\log _a b = c \iff a^c = b$. Например $\log _2 8 = 3$, защото $2^3 = 8$; $\log _3 \left(\frac{1}{9}\right) = -2$, защото $3^{-2} = \frac{1}{9}$. Основно тъждество: $a^{\log _a b} = b$."
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
            description="За $a > 0,\ a \ne 1$ и $x,\ y > 0$: $\log _a (xy) = \log _a x + \log _a y$; $\log _a \left(\frac{x}{y}\right) = \log _a x - \log _a y$; $\log _a (x^n) = n \cdot \log _a x$; $\log _a 1 = 0$; $\log _a a = 1$. Смяна на основата: $\log _a b = \frac{\log _c b}{\log _c a}$ (за всяко $c > 0,\ c \ne 1$). Те следват директно от правилата за степени: $a^m \cdot a^n = a^{m+n}$."
          />
          <SlideRuleLab />
          <Example
            description="Да пресметнем $\lg 4 + \lg 25$ и $\log _2 12 - \log _2 3$."
            steps={['$\\lg 4 + \\lg 25 = \\lg (4 \\cdot 25) = \\lg 100 = 2$', '$\\log _2 12 - \\log _2 3 = \\log _2 (12 : 3) = \\log _2 4 = 2$']}
          />
          <Example
            description="Да пресметнем $\log _4 8$."
            steps={['Смяна на основата: $\\log _4 8 = \\log _2 8 / \\log _2 4 = \\frac{3}{2}$', 'Проверка: $4^{3/2} = (\\sqrt{4})^3 = 2^3 = 8$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Десетичен и натурален логаритъм</h2>
          <p className={text}>
            Два логаритъма имат специални означения. <strong>Десетичният</strong> <Tex>{'\\lg x = \\log _{10} x'}</Tex> е удобен, защото системата ни е десетична:
            {' '}<Tex>{'\\lg 1000 = 3'}</Tex>, а броят на цифрите на число <Tex>{'N'}</Tex> е цялата част на <Tex>{'\\lg N'}</Tex> плюс 1. <strong>Натуралният</strong> <Tex>{'\\ln x = \\log _e x'}</Tex> има за основа
            числото <Tex>{'e \\approx 2{,}71828'}</Tex> – то се появява навсякъде, където нещо расте „непрекъснато“: в сложната лихва, в разпада на радиоактивни
            вещества, в растежа на популации. На калкулатора са бутоните <span className="font-mono">log</span> и{' '}
            <span className="font-mono">ln</span>; всеки друг логаритъм се пресмята със смяна на основата: <Tex>{'\\log _2 10 = \\lg 10 / \\lg 2 \\approx 3{,}32'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Логаритмичната функция</h2>
          <Theorem
            title="Свойства на $y = \log _a x$"
            description="Дефинирана е за $x > 0$, приема всички реални стойности и графиката ѝ минава през $(1; 0)$. При $a > 1$ е растяща, при $0 < a < 1$ – намаляваща. Тя е обратна на показателната функция $y = a^x$, затова графиките им са симетрични спрямо правата $y = x$."
          />
          <LogGraphLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Показателни и логаритмични уравнения</h2>
          <Example
            description="Да решим уравнението $3^x = 20$."
            steps={['Логаритмуваме двете страни: $x \\cdot \\lg 3 = \\lg 20$', '$x = \\lg 20 / \\lg 3 \\approx 1{,}3010 / 0{,}4771$', '$x \\approx 2{,}727$ (проверка: $3^{2{,}727} \\approx 20$ ✓)']}
          />
          <Example
            description="Да решим уравнението $\log _2 (x - 1) + \log _2 (x + 1) = 3$."
            steps={[
              'Допустими стойности: $x - 1 > 0$ и $x + 1 > 0 \\Rightarrow x > 1$',
              '$\\log _2 ((x - 1)(x + 1)) = 3 \\Rightarrow x^2 - 1 = 2^3 = 8$',
              '$x^2 = 9 \\Rightarrow x = 3$ или $x = -3$',
              '$x = -3$ не е допустимо ⇒ отговор $x = 3$',
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
              ['Логаритъм от сбор', '$\\lg (2 + 5) = \\lg 2 + \\lg 5$', '$\\lg 2 + \\lg 5 = \\lg (2 \\cdot 5) = 1$'],
              ['Логаритъм от произведение', '$\\log (xy) = \\log x \\cdot \\log y$', '$\\log (xy) = \\log x + \\log y$'],
              ['Квадрат на логаритъм', '$(\\lg x)^2 = 2 \\lg x$', '$\\lg (x^2) = 2 \\lg x$, а $(\\lg x)^2$ е друго'],
              ['Частно на логаритми', '$\\lg 8 / \\lg 2 = \\lg 4$', '$\\lg 8 / \\lg 2 = \\log _2 8 = 3$'],
              ['Логаритъм от неположително число', '$\\lg (-10) = -1$', 'не е дефиниран – трябва $b > 0$'],
              ['Без проверка на допустимите стойности', '$\\log _2(x - 1) + \\log _2(x + 1) = 3 \\Rightarrow x = \\pm 3$', '$x = -3$ отпада ⇒ само $x = 3$'],
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
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={logQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете $\log _2 64$, $\log _3 \left(\frac{1}{27}\right)$ и $\lg 0{,}001$.">
                <p><Tex>{'64 = 2^6 \\Rightarrow \\log _2 64 = 6'}</Tex></p>
                <p><Tex>{'\\frac{1}{27} = 3^{-3} \\Rightarrow \\log _3 \\left(\\frac{1}{27}\\right) = -3'}</Tex></p>
                <p><Tex>{'0{,}001 = 10^{-3} \\Rightarrow \\lg 0{,}001 = -3'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $\lg 4 + \lg 25$.">
                <p><Tex>{'\\lg 4 + \\lg 25 = \\lg (4 \\cdot 25) = \\lg 100'}</Tex></p>
                <p><Tex>{'= 2'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете $x$, ако $\log _x 49 = 2$.">
                <p>По определение <Tex>{'x^2 = 49,\\ x > 0,\\ x \\ne 1'}</Tex>.</p>
                <p><Tex>{'x = 7'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Решете уравнението $3^x = 20$ ($\lg 3 \approx 0{,}4771$, $\lg 20 \approx 1{,}3010$).">
                <p><Tex>{'x \\cdot \\lg 3 = \\lg 20'}</Tex></p>
                <p><Tex>{'x = 1{,}3010 / 0{,}4771 \\approx 2{,}727'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Решете уравнението $\log _2 (x - 1) + \log _2 (x + 1) = 3$.">
                <p>Допустими: <Tex>{'x > 1'}</Tex>.</p>
                <p><Tex>{'\\log _2 (x^2 - 1) = 3 \\Rightarrow x^2 - 1 = 8 \\Rightarrow x = \\pm 3'}</Tex></p>
                <p>Отговор: <Tex>{'x = 3'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Пресметнете $\log _4 8$ и $\log _{27} 9$.">
                <p><Tex>{'\\log _4 8 = \\log _2 8 / \\log _2 4 = \\frac{3}{2}'}</Tex></p>
                <p><Tex>{'\\log _{27} 9 = \\log _3 9 / \\log _3 27 = \\frac{2}{3}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че $\log _a b \cdot \log _b a = 1$, и пресметнете $\log _2 3 \cdot \log _3 4 \cdot \log _4 5 \cdot \log _5 6 \cdot \log _6 7 \cdot \log _7 8$.">
                <p>Смяна на основата: <Tex>{'\\log _a b = \\lg b / \\lg a'}</Tex> и <Tex>{'\\log _b a = \\lg a / \\lg b \\Rightarrow'}</Tex> произведението е 1.</p>
                <p>Аналогично произведението става <Tex>{'\\left(\\frac{\\lg 3}{\\lg 2}\\right) \\cdot \\left(\\frac{\\lg 4}{\\lg 3}\\right) \\cdot \\ldots \\cdot \\left(\\frac{\\lg 8}{\\lg 7}\\right)'}</Tex> – съкращава се „верижно“.</p>
                <p>Остава <Tex>{'\\lg 8 / \\lg 2 = \\log _2 8 = 3'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Колко цифри има числото $3^{50}$? ($\lg 3 \approx 0{,}4771$)">
                <p><Tex>{'\\lg 3^{50} = 50 \\cdot \\lg 3 \\approx 23{,}86'}</Tex></p>
                <p><Tex>{'10^{23} \\le 3^{50} < 10^{24}'}</Tex></p>
                <p>Числото има 24 цифри.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кое е по-голямо: $\log _2 3$ или $\log _3 5$? (Без калкулатор.)">
                <p>Сравняваме с <Tex>{'\\frac{3}{2}'}</Tex>: <Tex>{'3^2 = 9 > 8 = 2^3 \\Rightarrow 3 > 2^{3/2} \\Rightarrow \\log _2 3 > \\frac{3}{2}'}</Tex>.</p>
                <p><Tex>{'5^2 = 25 < 27 = 3^3 \\Rightarrow 5 < 3^{3/2} \\Rightarrow \\log _3 5 < \\frac{3}{2}'}</Tex>.</p>
                <p>Значи <Tex>{'\\log _2 3 > \\frac{3}{2} > \\log _3 5'}</Tex>. (Наистина: <Tex>{'\\approx 1{,}585'}</Tex> и <Tex>{'\\approx 1{,}465'}</Tex>.)</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\log _a b = c \\iff a^c = b'}</Tex> (<Tex>{'a > 0,\\ a \\ne 1,\\ b > 0'}</Tex>)</li>
              <li>✓ <Tex>{'\\log (xy) = \\log x + \\log y'}</Tex>; <Tex>{'\\log \\left(\\frac{x}{y}\\right) = \\log x - \\log y'}</Tex>; <Tex>{'\\log x^n = n \\log x'}</Tex></li>
              <li>✓ Смяна на основата: <Tex>{'\\log _a b = \\lg b / \\lg a'}</Tex></li>
              <li>✓ lg – основа 10, ln – основа <Tex>{'e \\approx 2{,}718'}</Tex></li>
              <li>✓ <Tex>{'y = \\log _a x'}</Tex> е обратна на <Tex>{'y = a^x'}</Tex>; графиките са симетрични спрямо <Tex>{'y = x'}</Tex></li>
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
