import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, fracTex, nonZero, paren, polyTex, randInt } from '~/drill';
import Trainer from '~/Trainer';
import BisectionLab from './BisectionLab';
import LimitEpsilonLab from './LimitEpsilonLab';
import LimitPointLab from './LimitPointLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** x − a в LaTeX: x − 3, x + 2, x. */
const lin = (a: number) => polyTex([[1, 1], [-a, 0]]);

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    // (x − a)(x − b) / (x − a) → a − b
    const a = nonZero(-4, 4);
    let b = randInt(-5, 5);
    if (b === a) b = a + 1;
    const num = polyTex([[1, 2], [-(a + b), 1], [a * b, 0]]);
    return {
      tex: `\\lim_{x \\to ${a}} \\frac{${num}}{${lin(a)}}`,
      ask: '$= ?$',
      num: a - b,
      den: 1,
      steps: [
        `Замесваме $x = ${a}$: получаваме $\\frac{0}{0}$ – трябва да разложим.`,
        `$${num} = (${lin(a)})(${lin(b)})$`,
        `Съкращаваме $(${lin(a)})$: $\\lim_{x \\to ${a}} (${lin(b)}) = ${a} ${b < 0 ? '+' : '-'} ${Math.abs(b)} = ${a - b}$`,
      ],
    };
  }
  if (kind === 1) {
    // Рационална функция при x → ∞
    const p = nonZero(-5, 6);
    const s = randInt(1, 5);
    const [q, r, t] = [randInt(-6, 6), randInt(-9, 9), nonZero(-7, 7)];
    const higher = randInt(0, 3) === 0;
    const numer = polyTex([[p, 2], [q, 1], [r, 0]]);
    const denom = higher ? polyTex([[s, 3], [t, 0]]) : polyTex([[s, 2], [t, 0]]);
    return {
      tex: `\\lim_{x \\to \\infty} \\frac{${numer}}{${denom}}`,
      ask: '$= ?$',
      num: higher ? 0 : p,
      den: higher ? 1 : s,
      steps: higher
        ? [
            'При $x \\to \\infty$ решават членовете с най-висока степен.',
            `$\\frac{${polyTex([[p, 2]])}}{${polyTex([[s, 3]])}} = \\frac{${p}}{${s === 1 ? '' : s}x} \\to 0$ – степента на знаменателя е по-голяма.`,
          ]
        : [
            'Делим числителя и знаменателя на $x^2$ – всички членове с $\\frac{1}{x}$ и $\\frac{1}{x^2}$ клонят към 0.',
            `Остава отношението на старшите коефициенти: $\\frac{${p}}{${s}} = ${fracTex(p, s)}$`,
          ],
    };
  }
  if (kind === 2) {
    // sin kx / (mx) → k/m
    const k = randInt(2, 9);
    const m = randInt(1, 6);
    return {
      tex: `\\lim_{x \\to 0} \\frac{\\sin ${k}x}{${m === 1 ? '' : m}x}`,
      ask: '$= ?$',
      num: k,
      den: m,
      steps: [
        `$\\frac{\\sin ${k}x}{${m === 1 ? '' : m}x} = \\frac{${k}}{${m}} \\cdot \\frac{\\sin ${k}x}{${k}x}$`,
        `При $x \\to 0$ и $${k}x \\to 0$, затова $\\frac{\\sin ${k}x}{${k}x} \\to 1$.`,
        `Границата е $${fracTex(k, m)}$`,
      ],
    };
  }
  if (kind === 3) {
    // (√(x + c) − d) / (x − a), където a + c = d²  →  1/(2d)
    const d = randInt(1, 5);
    const a = randInt(-3, 6);
    const c = d * d - a;
    const inner = polyTex([[1, 1], [c, 0]]);
    return {
      tex: `\\lim_{x \\to ${a}} \\frac{\\sqrt{${inner}} - ${d}}{${lin(a)}}`,
      ask: '$= ?$',
      num: 1,
      den: 2 * d,
      steps: [
        `Получаваме $\\frac{0}{0}$. Умножаваме числителя и знаменателя по $\\sqrt{${inner}} + ${d}$.`,
        `Числителят става $(${inner}) - ${d * d} = ${lin(a)}$ и се съкращава: остава $\\frac{1}{\\sqrt{${inner}} + ${d}}$`,
        `$\\frac{1}{${d} + ${d}} = ${fracTex(1, 2 * d)}$`,
      ],
    };
  }
  if (kind === 4) {
    // Асимптоти на (px + q)/(sx + t)
    const s = randInt(1, 4);
    const t = nonZero(-8, 8);
    const p = nonZero(-6, 6);
    let q = randInt(-9, 9);
    if (q * s === p * t) q += 1;
    const horizontal = randInt(0, 1) === 0;
    const tex = `y = \\frac{${polyTex([[p, 1], [q, 0]])}}{${polyTex([[s, 1], [t, 0]])}}`;
    return horizontal
      ? {
          tex,
          ask: 'Хоризонтална асимптота: $y = ?$',
          num: p,
          den: s,
          steps: [
            'При $x \\to \\pm\\infty$ решават членовете с $x$: $\\frac{' + polyTex([[p, 1]]) + '}{' + polyTex([[s, 1]]) + '}$',
            `Асимптотата е $y = ${fracTex(p, s)}$`,
          ],
        }
      : {
          tex,
          ask: 'Вертикална асимптота: $x = ?$',
          num: -t,
          den: s,
          steps: [
            `Знаменателят е нула при $${polyTex([[s, 1], [t, 0]])} = 0$, т.е. $x = ${fracTex(-t, s)}$`,
            `Там числителят не е нула, затова $y \\to \\pm\\infty$ – правата $x = ${fracTex(-t, s)}$ е вертикална асимптота.`,
          ],
        };
  }
  // Непрекъснатост на функция, зададена с две формули
  const b = nonZero(-3, 3);
  const k = nonZero(-4, 4);
  const a = k * b - b * b;
  return {
    tex: `f(x) = \\begin{cases} x^2 + a, & x < ${b} \\\\ ${polyTex([[k, 1]])}, & x \\ge ${b} \\end{cases}`,
    ask: 'При кое $a$ функцията е непрекъсната?',
    num: a,
    den: 1,
    steps: [
      `Граница отляво: $\\lim_{x \\to ${b}^-} (x^2 + a) = ${b * b} + a$`,
      `Граница отдясно и стойност: $f(${b}) = ${k} \\cdot ${paren(b)} = ${k * b}$`,
      `$${b * b} + a = ${k * b} \\Rightarrow a = ${a}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🏭 Средна цена на брой',
    problem:
      'Работилница плаща 2000 € за машина и по 5 € материали за всеки брой. Колко струва средно един брой при 100 броя? Към какво клони средната цена при много голямо производство?',
    solution: [
      'Средната цена при $n$ броя е $c(n) = \\frac{2000 + 5n}{n} = \\frac{2000}{n} + 5$.',
      '$c(100) = 20 + 5 = 25$ €',
      '$\\lim_{n \\to \\infty} c(n) = 5$ € – цената на машината се „разпределя“ на все повече бройки и остават само материалите.',
    ],
    answer: '25 €; клони към 5 €',
    check: [25, 5],
    ask: ['при 100 броя, €', 'граница, €'],
  },
  {
    title: '💶 Сложна лихва',
    problem:
      'Банка дава 6% годишна лихва. Колко ще имаш след една година от 1000 €, ако лихвата се начислява веднъж годишно, всеки месец и „непрекъснато“ (на все по-малки части)?',
    solution: [
      'Веднъж: $1000 \\cdot 1{,}06 = 1060$ €',
      'Месечно: $1000 \\cdot \\left(1 + \\frac{0{,}06}{12}\\right)^{12} \\approx 1061{,}68$ €',
      'Непрекъснато: $\\lim_{n \\to \\infty} 1000\\left(1 + \\frac{0{,}06}{n}\\right)^n = 1000e^{0{,}06} \\approx 1061{,}84$ € – по-често начисляване помага, но съвсем малко.',
    ],
    answer: '1060 €; ≈ 1061,68 €; ≈ 1061,84 €',
    check: [1060, 1061.68, 1061.84],
    ask: ['веднъж, €', 'месечно, €', 'непрекъснато, €'],
  },
  {
    title: '💊 Концентрация на лекарство',
    problem:
      'При продължително вливане концентрацията на лекарство в кръвта е $C(t) = \\frac{8t}{t + 2}$ mg/l, където $t$ е в часове. Каква концентрация се установява след дълго време? След колко часа тя е 6 mg/l?',
    solution: [
      '$\\lim_{t \\to \\infty} \\frac{8t}{t + 2} = 8$ mg/l – хоризонталната асимптота на графиката.',
      '$\\frac{8t}{t + 2} = 6 \\Rightarrow 8t = 6t + 12 \\Rightarrow t = 6$ часа.',
    ],
    answer: '8 mg/l; след 6 часа',
    check: [8, 6],
    ask: ['граница, mg/l', 'време, h'],
  },
  {
    title: '☕ Изстиващ чай',
    problem:
      'Температурата на чай в стая е $T(t) = 20 + 70 \\cdot 0{,}9^t$ градуса, където $t$ е в минути. Колко е била в началото и към каква температура клони?',
    solution: [
      '$T(0) = 20 + 70 = 90$ °C',
      'При $t \\to \\infty$ $0{,}9^t \\to 0$ (геометрична прогресия с $q = 0{,}9$), затова $T(t) \\to 20$ °C – температурата на стаята.',
    ],
    answer: '90 °C; клони към 20 °C',
    check: [90, 20],
    ask: ['начална, °C', 'граница, °C'],
  },
  {
    title: '🔎 Колко стъпки на разполовяване?',
    problem:
      'Корен на уравнение е в интервала $[1;\\ 2]$. Колко стъпки на метода на разполовяването са нужни, за да намерим интервал с дължина не повече от 0,001?',
    solution: ['След $n$ стъпки дължината е $\\frac{1}{2^n}$.', '$2^{9} = 512 < 1000$, а $2^{10} = 1024 \\ge 1000$', 'Нужни са 10 стъпки.'],
    answer: '10 стъпки',
    check: [10],
    ask: ['брой стъпки'],
  },
  {
    title: '🎯 Колко близо?',
    problem: 'Редицата $a_n = \\frac{2n + 1}{n}$ клони към 2. От кой номер нататък членовете ѝ се различават от 2 с по-малко от 0,01?',
    solution: ['$|a_n - 2| = \\left|\\frac{2n + 1}{n} - 2\\right| = \\frac{1}{n}$', '$\\frac{1}{n} < 0{,}01 \\iff n > 100$', 'От $N = 101$ нататък.'],
    answer: '$N = 101$',
    check: [101],
    ask: ['N'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'На колко е равно $\\lim_{n \\to \\infty} \\frac{1}{n}$?',
    answers: ['$0$', '$1$', '$\\infty$', '$\\frac{1}{2}$'],
    correctAnswer: '$0$',
  },
  {
    question: 'На колко е равно $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$?',
    answers: ['$6$', '$0$', '$3$', '$9$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Кой от изразите е неопределеност?',
    answers: ['$\\frac{0}{0}$', '$\\frac{5}{\\infty}$', '$\\infty + \\infty$', '$0 \\cdot 5$'],
    correctAnswer: '$\\frac{0}{0}$',
  },
  {
    question: 'На колко е равно $\\lim_{x \\to \\infty} \\frac{3x^2 + 1}{x^2 - 4}$?',
    answers: ['$3$', '$1$', '$0$', '$-\\frac{1}{4}$'],
    correctAnswer: '$3$',
  },
  {
    question: 'На колко е равно $\\lim_{x \\to 0} \\frac{\\sin x}{x}$, когато $x$ е в радиани?',
    answers: ['$1$', '$0$', '$\\frac{\\pi}{180}$', '$\\infty$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Към какво клони $\\left(1 + \\frac{1}{n}\\right)^n$ при $n \\to \\infty$?',
    answers: ['$e \\approx 2{,}718$', '$1$', '$2$', '$\\infty$'],
    correctAnswer: '$e \\approx 2{,}718$',
  },
  {
    question: 'Коя права е вертикална асимптота на $y = \\frac{1}{x + 4}$?',
    answers: ['$x = -4$', '$x = 4$', '$y = 0$', '$y = -4$'],
    correctAnswer: '$x = -4$',
  },
  {
    question: 'Функцията $f$ е непрекъсната в точката $a$, ако:',
    answers: [
      '$\\lim_{x \\to a} f(x)$ съществува и е равна на $f(a)$',
      '$f(a)$ съществува',
      '$\\lim_{x \\to a} f(x)$ съществува',
      '$f$ е растяща около $a$',
    ],
    correctAnswer: '$\\lim_{x \\to a} f(x)$ съществува и е равна на $f(a)$',
  },
  {
    question: 'Функцията $f$ е непрекъсната в $[1;\\ 3]$, $f(1) = -2$ и $f(3) = 5$. Какво следва със сигурност?',
    answers: [
      '$f(x) = 0$ има корен в $(1;\\ 3)$',
      '$f(2) = 1{,}5$',
      '$f$ е растяща в $[1;\\ 3]$',
      '$f(x) = 0$ има точно един корен',
    ],
    correctAnswer: '$f(x) = 0$ има корен в $(1;\\ 3)$',
  },
];

// ---------- Таблица ----------

const E_TABLE: [string, string][] = [
  ['1', '2'],
  ['2', '2{,}25'],
  ['10', '2{,}5937…'],
  ['100', '2{,}7048…'],
  ['1000', '2{,}7169…'],
  ['10^6', '2{,}718280…'],
];

// ---------- Страница ----------

export function Limits() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Граници и непрекъснатост</h1>

        <div className="bg-gradient-to-br from-indigo-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            👻 През 1734 г. ирландският епископ Джордж Бъркли издава книгата „Анализаторът“ – нападка срещу новия анализ на Нютон и Лайбниц.
            Математиците делят на „безкрайно малки“ величини, а после ги изхвърлят като нула. Как може едно и също число веднъж да не е нула, а
            веднага след това да е? Бъркли ги нарича подигравателно „призраци на изчезнали величини“. Изчисленията са верни, но никой не може
            да обясни защо. Отговорът идва чак през XIX век: Огюстен Коши (1821 г.), а после Карл Вайерщрас заменят „безкрайно малките“ с
            точното понятие <strong>граница</strong>. С него анализът най-сетне стъпва на здрава основа.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Граница на редица</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Членовете на <Term id="sequence">редицата</Term> <Tex>{'0{,}9;\\ 0{,}99;\\ 0{,}999;\\ \\ldots'}</Tex> никога не стават равни на 1.
              Защо тогава казваме, че <Tex>{'0{,}999\\ldots = 1'}</Tex>?
            </p>
          </div>
          <p className={text}>
            Членовете на <Tex>{'a_n = \\frac{1}{n}'}</Tex> намаляват: <Tex>{'1;\\ \\frac{1}{2};\\ \\frac{1}{3};\\ \\ldots'}</Tex> Никой не е нула, но
            се приближават до нулата колкото искаме. Същото видяхме при{' '}
            <Link to="/algebra/sequences" className={link}>
              безкрайната намаляваща геометрична прогресия
            </Link>
            : <Tex>{'q^n \\to 0'}</Tex> при <Tex>{'|q| < 1'}</Tex>, а сборът ѝ е крайно число. Как да кажем точно какво значи „приближават се колкото
            искаме“? Отговорът е с две гръцки букви – <Tex>{'\\varepsilon'}</Tex> (епсилон) за точността и номер <Tex>{'N'}</Tex>, от който нататък тя е
            постигната.
          </p>
          <Theorem
            type="definition"
            title="Граница на редица"
            description="Числото $L$ е граница на редицата $a_n$, ако за всяко $\varepsilon > 0$ съществува номер $N$, такъв че $|a_n - L| < \varepsilon$ за всяко $n \ge N$. Пишем $\lim_{n \to \infty} a_n = L$ или $a_n \to L$ и казваме, че редицата е сходяща. Редица, която няма граница, е разходяща."
          />
          <p className={text}>
            С думи: каквато и тясна ивица <Tex>{'(L - \\varepsilon;\\ L + \\varepsilon)'}</Tex> да начертаем около <Tex>{'L'}</Tex>, от някой номер
            нататък всички членове са в нея. Първите членове може да са далеч – важно е какво става „накрая“.
          </p>
          <LimitEpsilonLab />
          <Example
            description="Да докажем, че $\lim_{n \to \infty} \frac{n + 1}{n} = 1$, и да намерим $N$ при $\varepsilon = 0{,}05$."
            steps={[
              '$\\left|\\frac{n + 1}{n} - 1\\right| = \\frac{1}{n}$',
              '$\\frac{1}{n} < \\varepsilon \\iff n > \\frac{1}{\\varepsilon}$. Така за всяко $\\varepsilon$ има подходящо $N$ – границата е 1.',
              'При $\\varepsilon = 0{,}05$: $n > 20$, т.е. $N = 21$.',
            ]}
          />
          <p className={text}>
            Сега загадката: <Tex>{'0{,}999\\ldots'}</Tex> не е член на редицата, а нейната граница. Разликата <Tex>{'1 - 0{,}99\\ldots9 = 10^{-n}'}</Tex>{' '}
            клони към 0, затова безкрайната десетична дроб <Tex>{'0{,}999\\ldots'}</Tex> е точно 1.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Граница на функция</h2>
          <p className={text}>
            При функциите питаме: към какво клонят стойностите <Tex>{'f(x)'}</Tex>, когато <Tex>{'x'}</Tex> се приближава до числото{' '}
            <Tex>{'a'}</Tex>? Самата стойност <Tex>{'f(a)'}</Tex> не ни интересува – тя може да е друга или изобщо да не съществува.
          </p>
          <Theorem
            type="definition"
            title="Граница на функция"
            description="Числото $L$ е граница на $f(x)$ при $x \to a$, ако за всяко $\varepsilon > 0$ има $\delta > 0$, такова че $|f(x) - L| < \varepsilon$ за всяко $x \ne a$ от дефиниционната област с $|x - a| < \delta$. Пишем $\lim_{x \to a} f(x) = L$."
          />
          <p className={text}>
            Понякога отляво и отдясно картината е различна. <strong>Граница отляво</strong> <Tex>{'\\lim_{x \\to a^-} f(x)'}</Tex> гледа само{' '}
            <Tex>{'x < a'}</Tex>, а <strong>граница отдясно</strong> <Tex>{'\\lim_{x \\to a^+} f(x)'}</Tex> – само <Tex>{'x > a'}</Tex>. Граница при{' '}
            <Tex>{'x \\to a'}</Tex> има точно когато двете едностранни граници съществуват и са равни.
          </p>
          <LimitPointLab />
          <p className={text}>
            Можем да питаме и какво става при <Tex>{'x \\to +\\infty'}</Tex> или <Tex>{'x \\to -\\infty'}</Tex>: например{' '}
            <Tex>{'\\lim_{x \\to \\infty} \\frac{1}{x} = 0'}</Tex>. А когато стойностите растат неограничено, пишем{' '}
            <Tex>{'\\lim_{x \\to 0^+} \\frac{1}{x} = +\\infty'}</Tex> – това не е число, а кратък запис, че граница (като число) няма, но
            стойностите надминават всяко число.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Пресмятане на граници</h2>
          <Theorem
            title="Аритметика на границите"
            description="Ако $\lim_{x \to a} f(x) = A$ и $\lim_{x \to a} g(x) = B$ (крайни числа), то $\lim (f \pm g) = A \pm B$, $\lim (f \cdot g) = A \cdot B$ и $\lim \frac{f}{g} = \frac{A}{B}$ при $B \ne 0$. Същото важи за редици и при $x \to \infty$."
          />
          <p className={text}>
            Затова при многочлените и повечето познати функции границата се намира просто със заместване:{' '}
            <Tex>{'\\lim_{x \\to 2} (x^2 + 3x) = 4 + 6 = 10'}</Tex>. Трудното започва, когато заместването дава израз без смисъл – една от{' '}
            <strong>неопределеностите</strong> <Tex>{'\\frac{0}{0}'}</Tex>, <Tex>{'\\frac{\\infty}{\\infty}'}</Tex>, <Tex>{'\\infty - \\infty'}</Tex>,{' '}
            <Tex>{'0 \\cdot \\infty'}</Tex>, <Tex>{'1^\\infty'}</Tex>. Те могат да имат всякаква стойност – трябва да преобразуваме израза.
          </p>
          <Example
            description="Разлагане: $\lim_{x \to 2} \frac{x^2 - 5x + 6}{x - 2}$."
            steps={[
              'Заместването дава $\\frac{0}{0}$.',
              '$x^2 - 5x + 6 = (x - 2)(x - 3)$; съкращаваме с $x - 2$ (при $x \\ne 2$ то не е нула).',
              '$\\lim_{x \\to 2} (x - 3) = -1$',
            ]}
          />
          <Example
            description="Спрегнат израз: $\lim_{x \to 0} \frac{\sqrt{x + 4} - 2}{x}$."
            steps={[
              'Умножаваме числителя и знаменателя по $\\sqrt{x + 4} + 2$:',
              '$\\frac{(x + 4) - 4}{x(\\sqrt{x + 4} + 2)} = \\frac{1}{\\sqrt{x + 4} + 2}$',
              'При $x \\to 0$ получаваме $\\frac{1}{2 + 2} = \\frac{1}{4}$.',
            ]}
          />
          <Theorem
            title="Рационална функция при x → ∞"
            description="При $x \to \infty$ решават старшите членове. Ако степените на числителя и знаменателя са равни, границата е отношението на старшите коефициенти; ако степента на знаменателя е по-голяма – границата е 0; ако е по-малка – стойностите растат неограничено."
          />
          <Example
            description="$\lim_{x \to \infty} \frac{4x^2 - x + 7}{2x^2 + 5}$"
            steps={[
              'Делим на $x^2$: $\\frac{4 - \\frac{1}{x} + \\frac{7}{x^2}}{2 + \\frac{5}{x^2}}$',
              'Дробите с $x$ в знаменателя клонят към 0, остава $\\frac{4}{2} = 2$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Две забележителни граници</h2>
          <Theorem
            title="Теорема за „двамата полицаи“"
            description="Ако $g(x) \le f(x) \le h(x)$ около $a$ и $\lim g = \lim h = L$, то и $\lim f = L$. Функцията $f$ е „притисната“ между двете и няма къде да избяга."
          />
          <Theorem
            title="Първа забележителна граница"
            description="$\lim_{x \to 0} \frac{\sin x}{x} = 1$, когато $x$ е в радиани. Затова при малки ъгли $\sin x \approx x$."
          />
          <p className={text}>
            Защо? За <Tex>{'0 < x < \\frac{\\pi}{2}'}</Tex> от единичната окръжност се вижда, че <Tex>{'\\sin x < x < \\operatorname{tg} x'}</Tex>{' '}
            (<Term id="leg">катет</Term>, дъга, допирателна). Делим на <Tex>{'\\sin x'}</Tex> и обръщаме: <Tex>{'\\cos x < \\frac{\\sin x}{x} < 1'}</Tex>. При{' '}
            <Tex>{'x \\to 0'}</Tex> имаме <Tex>{'\\cos x \\to 1'}</Tex> и „полицаите“ довършват работата. Ако ъгълът е в градуси, границата е{' '}
            <Tex>{'\\frac{\\pi}{180}'}</Tex> – една от причините математиците да предпочитат радианите.
          </p>
          <Theorem
            title="Втора забележителна граница"
            description="Редицата $\left(1 + \frac{1}{n}\right)^n$ е растяща и ограничена (всичките ѝ членове са по-малки от 3), затова има граница. Тази граница е числото $e \approx 2{,}71828$: $\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e$."
          />
          <div className="overflow-x-auto mb-4">
            <table className="mx-auto text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left font-semibold">
                    <Tex>{'n'}</Tex>
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    <Tex>{'\\left(1 + \\frac{1}{n}\\right)^n'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {E_TABLE.map(([n, v]) => (
                  <tr key={n} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-1.5">
                      <Tex>{n}</Tex>
                    </td>
                    <td className="px-4 py-1.5">
                      <Tex>{v}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Тук се крие неопределеността <Tex>{'1^\\infty'}</Tex>: основата клони към 1, но степента расте. Резултатът не е 1, а{' '}
            <Tex>{'e'}</Tex>. През 1683 г. Якоб Бернули стига до тази граница, като пита колко пари носи лихва, начислявана все по-често (виж
            задачата за <Term id="compound-interest">сложната лихва</Term> по-долу). По-общо <Tex>{'\\left(1 + \\frac{k}{n}\\right)^n \\to e^k'}</Tex>. Числото <Tex>{'e'}</Tex> е
            основата на{' '}
            <Link to="/algebra/logarithms" className={link}>
              натуралния логаритъм
            </Link>
            .
          </p>
          <Example
            description="$\lim_{x \to 0} \frac{\sin 3x}{x}$"
            steps={['$\\frac{\\sin 3x}{x} = 3 \\cdot \\frac{\\sin 3x}{3x}$', 'При $x \\to 0$ и $3x \\to 0$, затова границата е $3 \\cdot 1 = 3$.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Асимптоти</h2>
          <p className={text}>
            С границите описваме и как изглежда графиката „далеч“ и около точките, където функцията не е дефинирана. <Term id="asymptote">Асимптотите</Term> вече срещнахме в{' '}
            <Link to="/functions/grapher" className={link}>
              графиките на функции
            </Link>
            ; сега можем да ги намираме точно.
          </p>
          <Theorem
            type="definition"
            title="Видове асимптоти"
            description="Правата $x = a$ е вертикална асимптота, ако $f(x) \to \pm\infty$ при $x \to a^-$ или $x \to a^+$. Правата $y = b$ е хоризонтална асимптота, ако $\lim_{x \to \pm\infty} f(x) = b$. Правата $y = kx + n$ е наклонена асимптота, ако $f(x) - (kx + n) \to 0$ при $x \to \pm\infty$."
          />
          <Example
            description="Да намерим асимптотите на $y = \frac{2x + 1}{x - 3}$."
            steps={[
              'Знаменателят е 0 при $x = 3$, а числителят там е $7 \\ne 0$ – вертикална асимптота $x = 3$.',
              'При $x \\to \\pm\\infty$: $\\frac{2x + 1}{x - 3} \\to \\frac{2}{1} = 2$ – хоризонтална асимптота $y = 2$.',
            ]}
          />
          <Example
            description="Наклонена асимптота на $y = \frac{x^2 + 1}{x}$."
            steps={[
              '$\\frac{x^2 + 1}{x} = x + \\frac{1}{x}$',
              'При $x \\to \\pm\\infty$ $\\frac{1}{x} \\to 0$, т.е. графиката се доближава до правата $y = x$.',
              'Когато степента на числителя е с единица по-голяма, делим многочлените – цялата част е наклонената асимптота.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Непрекъснатост</h2>
          <p className={text}>
            Интуитивно функцията е непрекъсната, ако графиката ѝ може да се начертае, без да вдигаме молива. Точно го казваме с граница.
          </p>
          <Theorem
            type="definition"
            title="Непрекъсната функция"
            description="Функцията $f$ е непрекъсната в точката $a$, ако $f(a)$ е дефинирана и $\lim_{x \to a} f(x) = f(a)$. Тя е непрекъсната в интервал, ако е непрекъсната във всяка негова точка."
          />
          <p className={text}>
            Многочлените, <Tex>{'\\sin x'}</Tex>, <Tex>{'\\cos x'}</Tex>, <Tex>{'e^x'}</Tex>, <Tex>{'\\ln x'}</Tex>, <Tex>{'\\sqrt{x}'}</Tex> и
            частните на непрекъснати функции (където <Term id="denominator">знаменателят</Term> не е нула) са непрекъснати в дефиниционните си области. Точка, в която
            условието не е изпълнено, е <strong>точка на прекъсване</strong>. В лабораторията видя трите основни вида:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              <strong>отстранимо прекъсване</strong> – границата съществува, но <Tex>{'f(a)'}</Tex> е друго число или не е дефинирано (например{' '}
              <Tex>{'\\frac{x^2 - 4}{x - 2}'}</Tex> при <Tex>{'x = 2'}</Tex>);
            </li>
            <li>
              <strong>скок</strong> – двете едностранни граници са крайни, но различни;
            </li>
            <li>
              <strong>безкрайно прекъсване</strong> – поне едната едностранна граница е <Tex>{'\\pm\\infty'}</Tex> (вертикална асимптота).
            </li>
          </ul>
          <Example
            description="При кое $a$ функцията $f(x) = \begin{cases} x^2 + a, & x < 1 \\ 3x - 1, & x \ge 1 \end{cases}$ е непрекъсната?"
            steps={[
              'Всяка от двете формули е непрекъсната; остава точката $x = 1$.',
              'Отляво: $\\lim_{x \\to 1^-} (x^2 + a) = 1 + a$; отдясно и $f(1) = 3 - 1 = 2$.',
              '$1 + a = 2 \\Rightarrow a = 1$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Теорема за междинните стойности</h2>
          <Theorem
            title="Теорема на Болцано"
            description="Ако $f$ е непрекъсната в затворения интервал $[a;\ b]$ и $f(a)$ и $f(b)$ имат различни знаци, то има поне едно $c \in (a;\ b)$, за което $f(c) = 0$. По-общо: непрекъснатата функция приема всяка стойност между $f(a)$ и $f(b)$."
          />
          <p className={text}>
            Бернард Болцано доказва теоремата през 1817 г. Тя изглежда очевидна – за да стигнеш от под водата над водата, трябва да минеш през
            повърхността. Но без непрекъснатост не е вярна: <Tex>{'\\frac{1}{x}'}</Tex> е <Tex>{'-1'}</Tex> при <Tex>{'x = -1'}</Tex> и{' '}
            <Tex>{'1'}</Tex> при <Tex>{'x = 1'}</Tex>, а нула не става никъде. Теоремата дава и прост начин за намиране на корени –{' '}
            <strong>метода на разполовяването</strong>.
          </p>
          <BisectionLab />
          <Example
            description="Да докажем, че $x^3 - 3x + 1 = 0$ има три реални корена."
            steps={[
              '$f(x) = x^3 - 3x + 1$ е непрекъсната; $f(-2) = -1$, $f(0) = 1$, $f(1) = -1$, $f(2) = 3$.',
              'Знакът се сменя в $(-2;\\ 0)$, $(0;\\ 1)$ и $(1;\\ 2)$ – във всеки от тях има корен.',
              'Уравнение от трета степен има най-много 3 корена, значи са точно три (приближено $-1{,}88$; $0{,}347$; $1{,}53$).',
            ]}
          />
          <p className={text}>
            Следващата стъпка е{' '}
            <Link to="/analysis/derivatives" className={link}>
              производната
            </Link>{' '}
            – тя също е граница: на наклона на <Term id="secant-line">секущата</Term>, когато двете точки се слеят.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 8. Тренажор
          </h2>
          <p className={text}>
            Намери границата, асимптотата или параметъра. Дробните отговори въвеждай като 3/2.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Ако заместването дава 0/0, разложи или умножи по спрегнатия израз – виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Границите около нас</h2>
          <p className={text}>
            Границата отговаря на въпроса „какво става в дългосрочен план“ – към каква температура изстива чаят, каква цена се установява при
            масово производство, колко най-много може да донесе лихвата. А методът на разполовяването работи в калкулаторите и компютрите, когато
            уравнението не може да се реши с формула.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['$\\frac{0}{0}$ е 0 или 1', '$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 1$', 'неопределеност: разложи – границата е $4$'],
              ['$\\infty - \\infty = 0$', '$\\sqrt{n^2 + n} - n \\to 0$', 'спрегнат израз: $\\to \\frac{1}{2}$'],
              ['$1^\\infty = 1$', '$\\left(1 + \\frac{1}{n}\\right)^n \\to 1$', '$\\left(1 + \\frac{1}{n}\\right)^n \\to e$'],
              ['Границата е стойността', '$\\lim_{x \\to a} f(x) = f(a)$ винаги', 'само ако $f$ е непрекъсната в $a$'],
              ['Ъгли в градуси', '$\\frac{\\sin x}{x} \\to 1$ за $x$ в градуси', 'само за радиани'],
              ['Старшите членове', '$\\frac{3x^2 + 1}{x^3} \\to 3$', 'знаменателят е от по-висока степен: $\\to 0$'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">
                  <MathText displayStyle>{title}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                  ✗ <MathText displayStyle>{wrong}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  ✓ <MathText displayStyle>{right}</MathText>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете $\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$." check={[4]} ask={['граница']}>
                <p>Заместването дава <Tex>{'\\frac{0}{0}'}</Tex>.</p>
                <p>
                  <Tex>{'\\frac{x^2 - 4}{x - 2} = \\frac{(x - 2)(x + 2)}{x - 2} = x + 2'}</Tex> при <Tex>{'x \\ne 2'}</Tex>.
                </p>
                <p>
                  <Tex>{'\\lim_{x \\to 2} (x + 2) = 4'}</Tex>
                </p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $\lim_{n \to \infty} \frac{3n^2 - n}{n^2 + 5}$." check={[3]} ask={['граница']}>
                <p>
                  Делим на <Tex>{'n^2'}</Tex>: <Tex>{'\\frac{3 - \\frac{1}{n}}{1 + \\frac{5}{n^2}}'}</Tex>.
                </p>
                <p>
                  <Tex>{'\\frac{1}{n} \\to 0'}</Tex> и <Tex>{'\\frac{5}{n^2} \\to 0'}</Tex>, затова границата е <Tex>{'\\frac{3}{1} = 3'}</Tex>.
                </p>
              </Task>
              <Task
                id="a3"
                number={3}
                color="border-green-500"
                question="Намерете вертикалната и хоризонталната асимптота на $y = \frac{2x + 1}{x - 3}$."
                check={[3, 2]}
                ask={['вертикална: $x$', 'хоризонтална: $y$']}
              >
                <p>
                  Знаменателят е 0 при <Tex>{'x = 3'}</Tex>, а числителят там е <Tex>{'7 \\ne 0'}</Tex> – вертикална асимптота <Tex>{'x = 3'}</Tex>.
                </p>
                <p>
                  <Tex>{'\\lim_{x \\to \\pm\\infty} \\frac{2x + 1}{x - 3} = 2'}</Tex> – хоризонтална асимптота <Tex>{'y = 2'}</Tex>.
                </p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Пресметнете $\lim_{x \to 0} \frac{\sqrt{x + 9} - 3}{x}$." check={[1 / 6]} ask={['граница']}>
                <p>
                  Умножаваме по <Tex>{'\\sqrt{x + 9} + 3'}</Tex>: <Tex>{'\\frac{(x + 9) - 9}{x(\\sqrt{x + 9} + 3)} = \\frac{1}{\\sqrt{x + 9} + 3}'}</Tex>.
                </p>
                <p>
                  При <Tex>{'x \\to 0'}</Tex>: <Tex>{'\\frac{1}{3 + 3} = \\frac{1}{6}'}</Tex>.
                </p>
              </Task>
              <Task
                id="b2"
                number={5}
                color="border-yellow-500"
                question="Пресметнете $\lim_{x \to 0} \frac{\sin 5x}{x}$ и $\lim_{x \to 0} \frac{\sin 3x}{\sin 7x}$."
                check={[5, 3 / 7]}
                ask={['първата', 'втората']}
              >
                <p>
                  <Tex>{'\\frac{\\sin 5x}{x} = 5 \\cdot \\frac{\\sin 5x}{5x} \\to 5'}</Tex>.
                </p>
                <p>
                  <Tex>{'\\frac{\\sin 3x}{\\sin 7x} = \\frac{3}{7} \\cdot \\frac{\\sin 3x}{3x} \\cdot \\frac{7x}{\\sin 7x} \\to \\frac{3}{7} \\cdot 1 \\cdot 1 = \\frac{3}{7}'}</Tex>.
                </p>
              </Task>
              <Task
                id="b3"
                number={6}
                color="border-yellow-500"
                question="При кое $a$ функцията $f(x) = \begin{cases} ax + 3, & x < 2 \\ x^2 + a, & x \ge 2 \end{cases}$ е непрекъсната?"
                check={[1]}
                ask={['$a$']}
              >
                <p>Двете формули са непрекъснати; проверяваме точката <Tex>{'x = 2'}</Tex>.</p>
                <p>
                  Отляво: <Tex>{'\\lim_{x \\to 2^-} (ax + 3) = 2a + 3'}</Tex>; отдясно и <Tex>{'f(2) = 4 + a'}</Tex>.
                </p>
                <p>
                  <Tex>{'2a + 3 = 4 + a \\Rightarrow a = 1'}</Tex>.
                </p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task
                id="c1"
                number={7}
                color="border-red-500"
                question="Пресметнете $\lim_{n \to \infty} \left(\sqrt{n^2 + n} - n\right)$ и $\lim_{n \to \infty} \left(1 + \frac{2}{n}\right)^n$."
                check={[1 / 2, 7.39]}
                ask={['първата', 'втората (приближено)']}
              >
                <p>
                  Неопределеност <Tex>{'\\infty - \\infty'}</Tex>. Умножаваме и делим на <Tex>{'\\sqrt{n^2 + n} + n'}</Tex>:{' '}
                  <Tex>{'\\frac{n}{\\sqrt{n^2 + n} + n} = \\frac{1}{\\sqrt{1 + \\frac{1}{n}} + 1} \\to \\frac{1}{2}'}</Tex>.
                </p>
                <p>
                  Нека <Tex>{'m = \\frac{n}{2}'}</Tex>: <Tex>{'\\left(1 + \\frac{2}{n}\\right)^n = \\left(\\left(1 + \\frac{1}{m}\\right)^m\\right)^2 \\to e^2'}</Tex>.
                </p>
                <p>
                  <Tex>{'e^2 \\approx 7{,}39'}</Tex>.
                </p>
              </Task>
              <Task
                id="c2"
                number={8}
                color="border-red-500"
                question="Намерете наклонената асимптота $y = kx + n$ на графиката на $y = \frac{x^2 + 3x}{x - 1}$."
                check={[1, 4]}
                ask={['$k$', '$n$']}
              >
                <p>
                  Делим многочлените: <Tex>{'x^2 + 3x = (x - 1)(x + 4) + 4'}</Tex>, т.е. <Tex>{'\\frac{x^2 + 3x}{x - 1} = x + 4 + \\frac{4}{x - 1}'}</Tex>.
                </p>
                <p>
                  При <Tex>{'x \\to \\pm\\infty'}</Tex> <Tex>{'\\frac{4}{x - 1} \\to 0'}</Tex>, значи асимптотата е <Tex>{'y = x + 4'}</Tex>:{' '}
                  <Tex>{'k = 1'}</Tex>, <Tex>{'n = 4'}</Tex>.
                </p>
                <p>
                  Има и вертикална асимптота <Tex>{'x = 1'}</Tex>.
                </p>
              </Task>
              <Task
                id="c3"
                number={9}
                color="border-red-500"
                question="Монах тръгва в 6:00 сутринта от подножието на планина и привечер стига до манастира на върха. На другия ден в 6:00 тръгва обратно по същата пътека и привечер е долу. Докажете, че има място на пътеката, през което той минава в един и същ час и в двата дни."
              >
                <p>
                  Нека <Tex>{'u(t)'}</Tex> е разстоянието по пътеката от подножието в момента <Tex>{'t'}</Tex> при изкачването, а <Tex>{'d(t)'}</Tex> – при
                  слизането (<Tex>{'t'}</Tex> е часът в деня). И двете са непрекъснати – монахът не „прескача“.
                </p>
                <p>
                  Разглеждаме <Tex>{'g(t) = u(t) - d(t)'}</Tex>. В 6:00 <Tex>{'u = 0'}</Tex>, а <Tex>{'d'}</Tex> е дължината на пътеката, т.е.{' '}
                  <Tex>{'g < 0'}</Tex>. Вечерта, когато и двамата „монаси“ са пристигнали, <Tex>{'u'}</Tex> е дължината, а <Tex>{'d = 0'}</Tex>, т.е.{' '}
                  <Tex>{'g > 0'}</Tex>.
                </p>
                <p>
                  По теоремата на Болцано има момент <Tex>{'t_0'}</Tex> с <Tex>{'g(t_0) = 0'}</Tex>, т.е. <Tex>{'u(t_0) = d(t_0)'}</Tex> – в този час
                  монахът е на едно и също място и в двата дни. Нагледно: ако двата дни се случат едновременно, двамата монаси непременно се срещат.
                </p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                ✓ <Tex>{'a_n \\to L'}</Tex>: за всяко <Tex>{'\\varepsilon > 0'}</Tex> от някой номер <Tex>{'N'}</Tex> нататък{' '}
                <Tex>{'|a_n - L| < \\varepsilon'}</Tex>
              </li>
              <li>
                ✓ <Tex>{'\\lim_{x \\to a} f(x)'}</Tex> не зависи от <Tex>{'f(a)'}</Tex>; съществува, когато лявата и дясната граница са равни
              </li>
              <li>
                ✓ Неопределености <Tex>{'\\frac{0}{0}'}</Tex>, <Tex>{'\\frac{\\infty}{\\infty}'}</Tex>, <Tex>{'\\infty - \\infty'}</Tex>,{' '}
                <Tex>{'1^\\infty'}</Tex>: разлагане, спрегнат израз, деление на старшата степен
              </li>
              <li>
                ✓ <Tex>{'\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1'}</Tex> (<Term id="radian">радиани</Term>), <Tex>{'\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e'}</Tex>
              </li>
              <li>✓ Асимптоти: вертикална (знаменателят е 0), хоризонтална (граница при <Tex>{'x \\to \\pm\\infty'}</Tex>), наклонена (деление на многочлени)</li>
              <li>
                ✓ Непрекъснатост: <Tex>{'\\lim_{x \\to a} f(x) = f(a)'}</Tex>; прекъсвания – отстранимо, скок, безкрайно
              </li>
              <li>✓ Болцано: непрекъсната функция с различни знаци в краищата има корен – намираме го с разполовяване</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Дълго време математиците смятали, че всяка непрекъсната функция има <Term id="derivative">производна</Term> поне в повечето точки – графиката ѝ трябва да е
              „гладка“ почти навсякъде. През 1872 г. Карл Вайерщрас представя функция, която е непрекъсната навсякъде, но няма производна в нито
              една точка: графиката ѝ е „назъбена“ при всяко увеличение, като брегова линия. Мнозина я смятали за чудовище, а днес подобни
              криви описват фракталите, движението на прашинки във вода и колебанията на борсата.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
