import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import BoxLab from './BoxLab';
import { type Drill, fracTex, nonZero, paren, pick, polyTex, randInt } from '~/drill';
import DerivativeGraphLab from './DerivativeGraphLab';
import SecantLab from './SecantLab';
import Trainer from '~/Trainer';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const [a, b, c, x0] = [nonZero(-4, 5), randInt(-6, 6), randInt(-5, 5), randInt(-3, 3)];
    const v = 2 * a * x0 + b;
    return {
      tex: `f(x) = ${polyTex([[a, 2], [b, 1], [c, 0]])}`,
      ask: `f'(${x0}) = ?`,
      num: v,
      den: 1,
      steps: [`$f'(x) = ${polyTex([[2 * a, 1], [b, 0]])}$`, `$f'(${x0}) = ${2 * a} \\cdot ${paren(x0)}${b < 0 ? ` - ${-b}` : b > 0 ? ` + ${b}` : ''} = ${v}$`],
    };
  }
  if (kind === 1) {
    const [a, b, x0] = [nonZero(-2, 3), randInt(-6, 6), nonZero(-2, 2)];
    const v = 3 * a * x0 * x0 + b;
    return {
      tex: `f(x) = ${polyTex([[a, 3], [b, 1]])}`,
      ask: `f'(${x0}) = ?`,
      num: v,
      den: 1,
      steps: [`$f'(x) = ${polyTex([[3 * a, 2], [b, 0]])}$`, `$f'(${x0}) = ${3 * a} \\cdot ${paren(x0)}^2${b < 0 ? ` - ${-b}` : b > 0 ? ` + ${b}` : ''} = ${v}$`],
    };
  }
  if (kind === 2) {
    const a = pick([1, 2, 3, 4, 6, 8]);
    const r = randInt(1, 5);
    return {
      tex: `f(x) = ${a === 1 ? '' : a}\\sqrt{x}`,
      ask: `f'(${r * r}) = ?`,
      num: a,
      den: 2 * r,
      steps: [`$(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}} \\Rightarrow f'(x) = \\frac{${a}}{2\\sqrt{x}}$`, `$f'(${r * r}) = \\frac{${a}}{2 \\cdot ${r}} = ${fracTex(a, 2 * r)}$`],
    };
  }
  if (kind === 3) {
    const [b, c] = [nonZero(-8, 8), randInt(-5, 5)];
    return {
      tex: `f(x) = ${polyTex([[1, 2], [b, 1], [c, 0]])}`,
      ask: 'При кое $x$ допирателната е хоризонтална?',
      num: -b,
      den: 2,
      steps: [`$f'(x) = ${polyTex([[2, 1], [b, 0]])}$`, `$f'(x) = 0 \\Rightarrow x = ${fracTex(-b, 2)}$ (върхът на параболата)`],
    };
  }
  const [p, q, x0] = [pick([2, 3, -2]), nonZero(-3, 3), randInt(-2, 2)];
  const inner = p * x0 + q;
  const v = 2 * p * inner;
  return {
    tex: `f(x) = (${polyTex([[p, 1], [q, 0]])})^2`,
    ask: `f'(${x0}) = ?`,
    num: v,
    den: 1,
    steps: [
      `Верижно правило: $f'(x) = 2(${polyTex([[p, 1], [q, 0]])}) \\cdot ${paren(p)}$`,
      `$f'(${x0}) = 2 \\cdot ${paren(inner)} \\cdot ${paren(p)} = ${v}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🪨 Свободно падане',
    problem: 'Камък пада свободно и за $t$ секунди изминава $s(t) = 4{,}9t^2$ метра. Каква е скоростта му в момента $t = 3\\ \\mathrm{s}$?',
    solution: ["Скоростта е производната на пътя: $v(t) = s'(t) = 9{,}8t$", '$v(3) = 9{,}8 \\cdot 3 = 29{,}4\\ \\mathrm{m/s}$', 'Това е около $106\\ \\mathrm{km/h}$ (без съпротивлението на въздуха).'],
    answer: '$29{,}4\\ \\mathrm{m/s}$',
    check: [29.4],
    ask: ['скорост, m/s'],
  },
  {
    title: '🏀 Най-високата точка',
    problem: 'Топка е хвърлена нагоре и височината ѝ е $h(t) = 1{,}8 + 12t - 5t^2$ метра. Колко е най-голямата височина?',
    solution: ["$h'(t) = 12 - 10t = 0 \\Rightarrow t = 1{,}2\\ \\mathrm{s}$", '$h(1{,}2) = 1{,}8 + 14{,}4 - 7{,}2 = 9\\ \\mathrm{m}$', "В най-високата точка скоростта $h'$ е нула – топката за миг „спира“."],
    answer: '$9\\ \\mathrm{m}$',
    check: [9],
    ask: ['височина, m'],
  },
  {
    title: '🌾 Ограда до реката',
    problem: 'Фермер има 40 m мрежа и иска да огради правоъгълна ливада до права река (откъм реката не трябва ограда). Колко е най-голямото лице, което може да огради?',
    solution: ['Нека страните, перпендикулярни на реката, са $x$. Тогава третата е $40 - 2x$.', "$S(x) = x(40 - 2x) = 40x - 2x^2$; $S'(x) = 40 - 4x = 0 \\Rightarrow x = 10$", '$S(10) = 10 \\cdot 20 = 200\\ \\mathrm{m}^2$'],
    answer: '$200\\ \\mathrm{m}^2$',
    check: [200],
    ask: ['лице, m²'],
  },
  {
    title: '🥫 Кутия за сок',
    problem: 'Цилиндрична кутия трябва да побира $1\\ \\mathrm{l} = 1000\\ \\mathrm{cm}^3$. При какъв радиус ламарината за нея (повърхнината) е най-малко?',
    solution: [
      'От $\\pi r^2 h = 1000$ следва $h = \\frac{1000}{\\pi r^2}$, а повърхнината е $S = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + \\frac{2000}{r}$.',
      "$S'(r) = 4\\pi r - \\frac{2000}{r^2} = 0 \\Rightarrow r^3 = \\frac{500}{\\pi}$",
      '$r \\approx 5{,}42\\ \\mathrm{cm}$, а тогава $h = 2r \\approx 10{,}84\\ \\mathrm{cm}$ – височината е равна на диаметъра.',
    ],
    answer: '$r \\approx 5{,}42\\ \\mathrm{cm}$',
    check: [5.42],
    ask: ['радиус, cm'],
  },
  {
    title: '💶 Най-голяма печалба',
    problem: 'Малка фирма изчислила, че при $x$ продадени броя на ден печалбата ѝ е $P(x) = -0{,}5x^2 + 40x - 300$ евро. Колко броя да продава и каква ще е печалбата?',
    solution: ["$P'(x) = -x + 40 = 0 \\Rightarrow x = 40$", '$P(40) = -800 + 1600 - 300 = 500$ €', "При $x < 40$ $P' > 0$, а при $x > 40$ $P' < 0$ – значи това е максимум."],
    answer: '40 броя, 500 €',
    check: [40, 500],
    ask: ['броя', 'печалба, €'],
  },
  {
    title: '📏 Наклон на пътя',
    problem: 'Профилът на хълм е $y = 0{,}02x^2$ (в метри), за $x$ от 0 до 20 m. Какъв е наклонът на пътя при $x = 15\\ \\mathrm{m}$ в проценти?',
    solution: ["$y' = 0{,}04x$", "$y'(15) = 0{,}6$ – на 1 m хоризонтално пътят се изкачва 0,6 m", 'Наклонът е $60\\%$ – за пешеходци това е много стръмно.'],
    answer: '$60\\%$',
    check: [60],
    ask: ['наклон, %'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: "На колко е равно $(x^5)'$?",
    answers: ['$5x^4$', '$x^4$', '$5x^5$', '$\\frac{x^6}{6}$'],
    correctAnswer: '$5x^4$',
  },
  {
    question: 'Каква е производната на константа, например $f(x) = 7$?',
    answers: ['$0$', '$1$', '$7$', '$7x$'],
    correctAnswer: '$0$',
  },
  {
    question: "На колко е равно $(\\sin x)'$?",
    answers: ['$\\cos x$', '$-\\cos x$', '$-\\sin x$', '$\\tg x$'],
    correctAnswer: '$\\cos x$',
  },
  {
    question: "Ако $f(x) = x^2$, на колко е равно $f'(3)$?",
    answers: ['$6$', '$9$', '$3$', '$2$'],
    correctAnswer: '$6$',
  },
  {
    question: "Ако $f'(x) > 0$ за всяко $x$ от даден интервал, то в него $f$ е:",
    answers: ['растяща', 'намаляваща', 'постоянна', 'положителна'],
    correctAnswer: 'растяща',
  },
  {
    question: "На колко е равно $(e^{3x})'$?",
    answers: ['$3e^{3x}$', '$e^{3x}$', '$3xe^{3x - 1}$', '$e^3$'],
    correctAnswer: '$3e^{3x}$',
  },
  {
    question: 'Какъв е наклонът на допирателната към $y = x^3$ в точката с абсциса $x = 1$?',
    answers: ['$3$', '$1$', '$0$', '$\\frac{1}{4}$'],
    correctAnswer: '$3$',
  },
  {
    question: "Какво означава $f'(x_0) = 0$?",
    answers: ['допирателната в $x_0$ е хоризонтална', 'в $x_0$ винаги има максимум', 'в $x_0$ е изпълнено $f(x_0) = 0$', 'в $x_0$ функцията не е дефинирана'],
    correctAnswer: 'допирателната в $x_0$ е хоризонтална',
  },
  {
    question: "На колко е равно $(\\ln x)'$?",
    answers: ['$\\frac{1}{x}$', '$\\ln x$', '$e^x$', '$x \\ln x$'],
    correctAnswer: '$\\frac{1}{x}$',
  },
];

// ---------- Таблица ----------

const TABLE: [string, string][] = [
  ['c', '0'],
  ['x^n', 'n x^{n-1}'],
  ['\\sqrt{x}', '\\frac{1}{2\\sqrt{x}}'],
  ['\\frac{1}{x}', '-\\frac{1}{x^2}'],
  ['\\sin x', '\\cos x'],
  ['\\cos x', '-\\sin x'],
  ['e^x', 'e^x'],
  ['a^x', 'a^x \\ln a'],
  ['\\ln x', '\\frac{1}{x}'],
];

// ---------- Страница ----------

export function Derivatives() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Производни</h1>

        <div className="bg-gradient-to-br from-rose-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍎 През 1665–1666 г. университетът в Кеймбридж е затворен заради чумата и младият Исак Нютон се прибира в селото си. Там
            измисля „метода на флуксиите“ – начин да пресметне скоростта, с която се променя всяка величина. Почти по същото време, независимо
            от него, Готфрид Лайбниц в Германия стига до същите идеи и пръв ги публикува – през 1684 г. Последвал един от най-ожесточените
            спорове в историята на науката: кой е първи? Кралското общество в Лондон отсъдило в полза на Нютон – но докладът бил написан до
            голяма степен от самия Нютон. Днес историците смятат, че двамата са открили анализа независимо, а ние пишем производните с
            означенията на Лайбниц.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. От средна към моментна скорост</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Изминал си 120 km за 2 часа – средната ти скорост е 60 km/h. Но скоростомерът показва друго число
              във всеки момент. Как да пресметнем скоростта <em>точно сега</em>, щом за един миг не изминаваме никакъв път?
            </p>
          </div>
          <p className={text}>
            Средната скорост на изменение на функция <Tex>{'f'}</Tex> между <Tex>{'x_0'}</Tex> и <Tex>{'x_0 + h'}</Tex> е{' '}
            <Tex>{'\\frac{\\Delta y}{\\Delta x} = \\frac{f(x_0 + h) - f(x_0)}{h}'}</Tex>. На графиката това е наклонът на <strong>секущата</strong> –
            правата през двете точки. Идеята на Нютон и Лайбниц е да намаляваме <Tex>{'h'}</Tex>, докато втората точка почти съвпадне с първата.
          </p>
          <Theorem
            type="definition"
            title="Производна"
            description="Производна на функцията $f$ в точката $x_0$ е границата $f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}$, ако тя съществува. Означаваме я още $\frac{dy}{dx}$ (Лайбниц). Ако $f$ има производна във всяка точка от интервал, получаваме нова функция $f'(x)$."
          />
          <SecantLab />
          <Example
            description="Да намерим производната на $f(x) = x^2$ по определение."
            steps={[
              '$\\frac{f(x + h) - f(x)}{h} = \\frac{(x + h)^2 - x^2}{h} = \\frac{2xh + h^2}{h} = 2x + h$',
              "При $h \\to 0$ получаваме $f'(x) = 2x$.",
              "Например $f'(1) = 2$ – точно числото, към което клони наклонът на секущата в лабораторията.",
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Производна и допирателна</h2>
          <Theorem
            title="Уравнение на допирателната"
            description="Числото $f'(x_0)$ е ъгловият коефициент (наклонът) на допирателната към графиката в точката $(x_0;\ f(x_0))$. Уравнението на допирателната е $y = f(x_0) + f'(x_0)(x - x_0)$."
          />
          <Example
            description="Да напишем уравнението на допирателната към $y = x^2$ в точката с абсциса $x_0 = 3$."
            steps={["$f(3) = 9$, $f'(x) = 2x \\Rightarrow f'(3) = 6$", '$y = 9 + 6(x - 3)$', '$y = 6x - 9$']}
          />
          <p className={text}>
            Не всяка функция има производна навсякъде. Графиката на <Tex>{'y = |x|'}</Tex> има „чупка“ в нулата: отляво наклонът е{' '}
            <Tex>{'-1'}</Tex>, отдясно <Tex>{'+1'}</Tex>, и допирателна там няма. Затова казваме, че производна има там, където графиката е „гладка“.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Таблица и правила за диференциране</h2>
          <p className={text}>
            Намирането на производна се нарича <strong>диференциране</strong>. Не е нужно всеки път да търсим граница – достатъчни са таблицата
            на основните производни и няколко правила.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="mx-auto text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left font-semibold">функция</th>
                  <th className="px-4 py-2 text-left font-semibold">производна</th>
                </tr>
              </thead>
              <tbody>
                {TABLE.map(([f, df]) => (
                  <tr key={f} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-1.5">
                      <Tex>{f}</Tex>
                    </td>
                    <td className="px-4 py-1.5">
                      <Tex>{df}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Theorem
            title="Правила за диференциране"
            description="$(u \pm v)' = u' \pm v'$; $(c \cdot u)' = c \cdot u'$; $(u \cdot v)' = u'v + uv'$; $\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}$ при $v \ne 0$."
          />
          <Example
            description="Да намерим производната на $f(x) = 4x^3 - 5x^2 + 2x - 7$."
            steps={["$(4x^3)' = 12x^2$, $(5x^2)' = 10x$, $(2x)' = 2$, $(7)' = 0$", "$f'(x) = 12x^2 - 10x + 2$"]}
          />
          <Example
            description="Да намерим производната на $f(x) = x^2 \sin x$ и на $g(x) = \frac{x}{x + 1}$."
            steps={[
              "$f'(x) = (x^2)' \\sin x + x^2 (\\sin x)' = 2x \\sin x + x^2 \\cos x$",
              "$g'(x) = \\frac{1 \\cdot (x + 1) - x \\cdot 1}{(x + 1)^2} = \\frac{1}{(x + 1)^2}$",
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Производна на сложна функция</h2>
          <Theorem
            title="Верижно правило"
            description="Ако $y = f(g(x))$, то $y' = f'(g(x)) \cdot g'(x)$ – производната на „външната“ функция, пресметната във „вътрешната“, по производната на вътрешната."
          />
          <Example
            description="Да намерим производните на $(3x + 1)^5$, $\sin 2x$ и $e^{x^2}$."
            steps={[
              "$\\left((3x + 1)^5\\right)' = 5(3x + 1)^4 \\cdot 3 = 15(3x + 1)^4$",
              "$(\\sin 2x)' = \\cos 2x \\cdot 2 = 2\\cos 2x$",
              "$\\left(e^{x^2}\\right)' = e^{x^2} \\cdot 2x = 2x e^{x^2}$",
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Растене, намаляване и екстремуми</h2>
          <Theorem
            title="Монотонност"
            description="Ако $f'(x) > 0$ за всяко $x$ от интервал, функцията $f$ е растяща в него; ако $f'(x) < 0$ – намаляваща."
          />
          <Theorem
            title="Екстремуми (Ферма)"
            description="Ако $f$ има най-голяма или най-малка стойност в околност на вътрешната точка $x_0$ (локален екстремум) и има производна там, то $f'(x_0) = 0$. Обратното не е вярно: при $f(x) = x^3$ имаме $f'(0) = 0$, но екстремум няма. Достатъчно е $f'$ да смени знака: от $+$ на $-$ – максимум, от $-$ на $+$ – минимум."
          />
          <DerivativeGraphLab />
          <Example
            description="Да намерим интервалите на растене и намаляване и екстремумите на $f(x) = x^3 - 3x$."
            steps={[
              "$f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$; $f'(x) = 0$ при $x = \\pm 1$",
              "$f' > 0$ при $x < -1$ и при $x > 1$ – там $f$ расте; $f' < 0$ при $-1 < x < 1$ – там намалява",
              'Максимум при $x = -1$: $f(-1) = 2$; минимум при $x = 1$: $f(1) = -2$',
            ]}
          />
          <p className={text}>
            Познат пример: върхът на параболата <Tex>{'y = ax^2 + bx + c'}</Tex> е при <Tex>{'x = -\\frac{b}{2a}'}</Tex> – точно там, където{' '}
            <Tex>{"y' = 2ax + b"}</Tex> става нула (виж{' '}
            <Link to="/functions/quadratic" className={link}>
              Квадратни функции
            </Link>
            ).
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Задачи за най-голяма и най-малка стойност</h2>
          <p className={text}>
            Производните намират оптимума: най-голямото лице, най-малкия разход, най-голямата печалба. Схемата е винаги една: изразяваме
            величината като функция на една променлива, намираме къде производната е нула и проверяваме, че е максимум (или минимум), а
            също и стойностите в краищата на допустимия интервал.
          </p>
          <Example
            description="С 60 m мрежа ограждаме правоъгълник до стена (откъм стената ограда не трябва). При какви размери лицето е най-голямо?"
            steps={[
              'Страните до стената са $x$, третата е $60 - 2x$, при $0 < x < 30$.',
              "$S(x) = x(60 - 2x) = 60x - 2x^2$; $S'(x) = 60 - 4x = 0 \\Rightarrow x = 15$",
              "$S'$ сменя знака от $+$ на $-$ ⇒ максимум: $15 \\times 30$ m, $S = 450\\ \\mathrm{m}^2$",
            ]}
          />
          <BoxLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Намери производната и замести. Дробните отговори въвеждай като 3/2.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Намери първо f′(x) по таблицата, после замести." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Производните около нас</h2>
          <p className={text}>
            Скоростта е производна на пътя, а ускорението – на скоростта. Наклонът на пътя, растежът на население, пределната печалба в
            икономиката – всички те са производни. Със същата математика Нютон обяснява движението на планетите (виж{' '}
            <Link to="/astronomy/lecture06" className={link}>
              лекцията за гравитацията
            </Link>
            ).
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Производна на произведение', "$(uv)' = u'v'$", "$(uv)' = u'v + uv'$"],
              ['Степента не се намалява', "$(x^3)' = 3x^3$", "$(x^3)' = 3x^2$"],
              ['Забравено верижно правило', "$(\\sin 2x)' = \\cos 2x$", "$(\\sin 2x)' = 2\\cos 2x$"],
              ['Показателна като степенна', "$(5^x)' = x \\cdot 5^{x-1}$", "$(5^x)' = 5^x \\ln 5$"],
              ["$f'(x_0) = 0$ значи екстремум", '$x^3$ има екстремум в 0', "$f'$ трябва и да смени знака"],
              ['Производна на $\\frac{1}{x}$', "$\\left(\\frac{1}{x}\\right)' = \\ln x$", "$\\left(\\frac{1}{x}\\right)' = -\\frac{1}{x^2}$"],
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
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намерете производната на $f(x) = x^4 - 3x^2 + 7x - 2$.">
                <p><Tex>{"f'(x) = 4x^3 - 6x + 7"}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $f'(4)$ за $f(x) = \sqrt{x}$ и $g'(4)$ за $g(x) = \frac{1}{x}$." check={[1 / 4, -1 / 16]} ask={["$f'(4)$", "$g'(4)$"]}>
                <p><Tex>{"f'(x) = \\frac{1}{2\\sqrt{x}} \\Rightarrow f'(4) = \\frac{1}{4}"}</Tex></p>
                <p><Tex>{"g'(x) = -\\frac{1}{x^2} \\Rightarrow g'(4) = -\\frac{1}{16}"}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Напишете уравнението на допирателната към $y = x^2 - 4x$ в точката с абсциса $x_0 = 1$.">
                <p><Tex>{'f(1) = 1 - 4 = -3'}</Tex></p>
                <p><Tex>{"f'(x) = 2x - 4 \\Rightarrow f'(1) = -2"}</Tex></p>
                <p><Tex>{'y = -3 - 2(x - 1) = -2x - 1'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете производната на $f(x) = (x^2 + 1)(x - 3)$ по два начина.">
                <p>По правилото за произведение: <Tex>{"f'(x) = 2x(x - 3) + (x^2 + 1) \\cdot 1 = 3x^2 - 6x + 1"}</Tex>.</p>
                <p>Като разкрием скобите: <Tex>{'f(x) = x^3 - 3x^2 + x - 3'}</Tex>, <Tex>{"f'(x) = 3x^2 - 6x + 1"}</Tex> – същото.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете интервалите на монотонност и екстремумите на $f(x) = x^3 - 6x^2 + 9x + 1$." check={[1, 5, 3, 1]} ask={['$x_{\\max}$', '$f_{\\max}$', '$x_{\\min}$', '$f_{\\min}$']}>
                <p><Tex>{"f'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3)"}</Tex></p>
                <p>Расте при <Tex>{'x < 1'}</Tex> и <Tex>{'x > 3'}</Tex>, намалява при <Tex>{'1 < x < 3'}</Tex>.</p>
                <p>Максимум <Tex>{'f(1) = 5'}</Tex>, минимум <Tex>{'f(3) = 1'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намерете производните на $\sin 3x$, $e^{x^2}$ и $\ln(x^2 + 1)$.">
                <p><Tex>{"(\\sin 3x)' = 3\\cos 3x"}</Tex></p>
                <p><Tex>{"\\left(e^{x^2}\\right)' = 2x e^{x^2}"}</Tex></p>
                <p><Tex>{"\\left(\\ln(x^2 + 1)\\right)' = \\frac{2x}{x^2 + 1}"}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="От правоъгълен лист $16 \times 10$ cm изрязваме в ъглите квадратчета със страна $x$ и сгъваме кутия без капак. При какво $x$ обемът е най-голям и колко е той?" check={[2, 144]} ask={['$x$, cm', 'обем, cm³']}>
                <p><Tex>{'V(x) = x(16 - 2x)(10 - 2x) = 4x^3 - 52x^2 + 160x'}</Tex>, при <Tex>{'0 < x < 5'}</Tex>.</p>
                <p><Tex>{"V'(x) = 12x^2 - 104x + 160 = 0 \\iff 3x^2 - 26x + 40 = 0 \\Rightarrow x = 2"}</Tex> или <Tex>{'x = \\frac{20}{3}'}</Tex> (не е допустимо).</p>
                <p><Tex>{"V'"}</Tex> сменя знака от <Tex>{'+'}</Tex> на <Tex>{'-'}</Tex> при <Tex>{'x = 2'}</Tex> ⇒ максимум <Tex>{'V(2) = 2 \\cdot 12 \\cdot 6 = 144\\ \\mathrm{cm}^3'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че $e^x \ge 1 + x$ за всяко реално $x$.">
                <p>Нека <Tex>{'g(x) = e^x - 1 - x'}</Tex>. Тогава <Tex>{"g'(x) = e^x - 1"}</Tex>.</p>
                <p><Tex>{"g' < 0"}</Tex> при <Tex>{'x < 0'}</Tex> и <Tex>{"g' > 0"}</Tex> при <Tex>{'x > 0'}</Tex> ⇒ най-малката стойност на <Tex>{'g'}</Tex> е <Tex>{'g(0) = 0'}</Tex>.</p>
                <p>Значи <Tex>{'g(x) \\ge 0'}</Tex>, т.е. <Tex>{'e^x \\ge 1 + x'}</Tex>, с равенство само при <Tex>{'x = 0'}</Tex>. Правата <Tex>{'y = 1 + x'}</Tex> е допирателната в <Tex>{'(0;\\ 1)'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При коя стойност на $a$ правата $y = ax$ е допирателна към графиката на $y = e^x$?" check={[2.71828]} ask={['$a$ (приближено)']}>
                <p>В допирната точка <Tex>{'x_0'}</Tex> трябва стойностите и наклоните да съвпадат: <Tex>{'e^{x_0} = a x_0'}</Tex> и <Tex>{'e^{x_0} = a'}</Tex>.</p>
                <p>Тогава <Tex>{'a x_0 = a \\Rightarrow x_0 = 1'}</Tex> (защото <Tex>{'a = e^{x_0} \\ne 0'}</Tex>).</p>
                <p><Tex>{'a = e \\approx 2{,}718'}</Tex>; допирната точка е <Tex>{'(1;\\ e)'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{"f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}"}</Tex> – моментната скорост на изменение</li>
              <li>✓ <Tex>{"f'(x_0)"}</Tex> е наклонът на допирателната: <Tex>{"y = f(x_0) + f'(x_0)(x - x_0)"}</Tex></li>
              <li>✓ <Tex>{"(x^n)' = nx^{n-1}"}</Tex>, <Tex>{"(\\sin x)' = \\cos x"}</Tex>, <Tex>{"(e^x)' = e^x"}</Tex>, <Tex>{"(\\ln x)' = \\frac{1}{x}"}</Tex></li>
              <li>✓ <Tex>{"(uv)' = u'v + uv'"}</Tex>; <Tex>{"\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}"}</Tex>; <Tex>{"(f(g(x)))' = f'(g(x)) \\cdot g'(x)"}</Tex></li>
              <li>✓ <Tex>{"f' > 0"}</Tex> – расте, <Tex>{"f' < 0"}</Tex> – намалява; в екстремум <Tex>{"f' = 0"}</Tex> и сменя знака</li>
              <li>✓ Оптимизация: функция на една променлива → <Tex>{"f' = 0"}</Tex> → проверка за максимум/минимум и краищата</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Днес производната се пише по три начина – и всеки е от различен математик. <Tex>{'\\frac{dy}{dx}'}</Tex> е на Лайбниц, точката
              отгоре (<Tex>{'\\dot{x}'}</Tex>) – на Нютон и още се използва във физиката за производна по времето, а щрихът <Tex>{"f'(x)"}</Tex> –
              на Лагранж, който в края на XVIII век нарича новата функция „производна“ (на френски <em>dérivée</em>).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
