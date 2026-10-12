import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import AccumulationLab from './AccumulationLab';
import { type Drill, fracTex, nonZero, paren, pick, polyTex, randInt } from '~/drill';
import RiemannLab from './RiemannLab';
import SignedAreaLab from './SignedAreaLab';
import Trainer from '~/Trainer';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Две различни цели числа a < b от интервала. */
function bounds(min: number, max: number) {
  const a = randInt(min, max - 1);
  return [a, randInt(a + 1, max)];
}

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    // ∫ (px + q) dx с четно p – примитивната е с цели коефициенти
    const [p, q] = [pick([-4, -2, 2, 4, 6]), randInt(-5, 5)];
    const [a, b] = bounds(-2, 4);
    const F = (x: number) => (p / 2) * x * x + q * x;
    const v = F(b) - F(a);
    return {
      tex: `\\int_{${a}}^{${b}} (${polyTex([[p, 1], [q, 0]])})\\,dx`,
      ask: '= ?',
      num: v,
      den: 1,
      steps: [`Примитивна: $F(x) = ${polyTex([[p / 2, 2], [q, 1]])}$`, `$F(${b}) - F(${a}) = ${F(b)} - ${paren(F(a))} = ${v}$`],
    };
  }
  if (kind === 1) {
    const b = randInt(1, 5);
    return {
      tex: `\\int_0^{${b}} x^2\\,dx`,
      ask: '= ?',
      num: b ** 3,
      den: 3,
      steps: ['Примитивна: $F(x) = \\frac{x^3}{3}$', `$F(${b}) - F(0) = \\frac{${b ** 3}}{3} - 0 = ${fracTex(b ** 3, 3)}$`],
    };
  }
  if (kind === 2) {
    const [a, b] = bounds(-2, 3);
    const v = b ** 3 - a ** 3;
    return {
      tex: `\\int_{${a}}^{${b}} 3x^2\\,dx`,
      ask: '= ?',
      num: v,
      den: 1,
      steps: ['Примитивна: $F(x) = x^3$', `$F(${b}) - F(${a}) = ${b ** 3} - ${paren(a ** 3)} = ${v}$`],
    };
  }
  if (kind === 3) {
    const b = randInt(2, 6);
    return {
      tex: `\\int_1^{${b}} \\frac{1}{x^2}\\,dx`,
      ask: '= ?',
      num: b - 1,
      den: b,
      steps: ['$\\frac{1}{x^2} = x^{-2}$, примитивна: $F(x) = \\frac{x^{-1}}{-1} = -\\frac{1}{x}$', `$F(${b}) - F(1) = -\\frac{1}{${b}} + 1 = ${fracTex(b - 1, b)}$`],
    };
  }
  const [c, m] = [randInt(1, 3), nonZero(-4, 4)];
  return {
    tex: `\\int_{-${c}}^{${c}} (${polyTex([[1, 3], [m, 0]])})\\,dx`,
    ask: '= ?',
    num: 2 * c * m,
    den: 1,
    steps: [
      `$x^3$ е нечетна функция – лицата отляво и отдясно на нулата се унищожават: $\\int_{-${c}}^{${c}} x^3\\,dx = 0$`,
      `$\\int_{-${c}}^{${c}} ${paren(m)}\\,dx = ${m} \\cdot ${2 * c} = ${2 * c * m}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🚗 Път от скоростта',
    problem: 'Кола тръгва от място и скоростта ѝ нараства по закона $v(t) = 3t$ (в m/s). Какъв път изминава за първите 8 секунди?',
    solution: ['Пътят е интегралът от скоростта: $s = \\int_0^8 3t\\,dt$', '$= \\left[\\frac{3t^2}{2}\\right]_0^8 = \\frac{3 \\cdot 64}{2} = 96\\ \\mathrm{m}$', 'Това е лицето на триъгълника под графиката на $v(t)$: $\\frac{8 \\cdot 24}{2} = 96$.'],
    answer: '$96\\ \\mathrm{m}$',
    check: [96],
    ask: ['път, m'],
  },
  {
    title: '🛢️ Изтичане от резервоар',
    problem: 'От резервоар изтича вода със скорост $r(t) = 20 - 2t$ литра в минута, докато спре (след 10 минути). Колко литра са изтекли?',
    solution: ['$V = \\int_0^{10} (20 - 2t)\\,dt = \\left[20t - t^2\\right]_0^{10}$', '$= 200 - 100 = 100$ литра'],
    answer: '100 l',
    check: [100],
    ask: ['литра'],
  },
  {
    title: '🍦 Обем на фунийка',
    problem: 'Конусът се получава при въртене на отсечката $y = \\frac{3}{4}x$, $0 \\le x \\le 4$ около оста $Ox$. Пресметнете обема му с интеграл (в cm³).',
    solution: ['$V = \\pi \\int_0^4 \\left(\\frac{3}{4}x\\right)^2 dx = \\pi \\cdot \\frac{9}{16} \\cdot \\left[\\frac{x^3}{3}\\right]_0^4$', '$= \\pi \\cdot \\frac{9}{16} \\cdot \\frac{64}{3} = 12\\pi \\approx 37{,}70\\ \\mathrm{cm}^3$', 'Същото дава и формулата $V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\cdot 9 \\cdot 4$.'],
    answer: '$12\\pi \\approx 37{,}70\\ \\mathrm{cm}^3$',
    check: [37.7],
    ask: ['обем, cm³'],
  },
  {
    title: '🌉 Арка на мост',
    problem: 'Отворът под арка е ограничен от параболата $y = 4 - \\frac{x^2}{4}$ и оста $Ox$ (в метри). Колко квадратни метра е лицето на отвора?',
    solution: ['Параболата пресича оста при $x = \\pm 4$.', '$S = \\int_{-4}^{4} \\left(4 - \\frac{x^2}{4}\\right) dx = \\left[4x - \\frac{x^3}{12}\\right]_{-4}^{4}$', '$= \\left(16 - \\frac{16}{3}\\right) \\cdot 2 = \\frac{64}{3} \\approx 21{,}33\\ \\mathrm{m}^2$ – точно $\\frac{2}{3}$ от правоъгълника $8 \\times 4$.'],
    answer: '$\\approx 21{,}33\\ \\mathrm{m}^2$',
    check: [21.33],
    ask: ['лице, m²'],
  },
  {
    title: '🏹 Опъване на пружина',
    problem: 'За да разтегнем пружина на $x$ метра, е нужна сила $F = 200x$ нютона. Каква работа извършваме, като я разтегнем с 10 cm?',
    solution: ['Работата при променлива сила е интеграл: $A = \\int_0^{0{,}1} 200x\\,dx$', '$= \\left[100x^2\\right]_0^{0{,}1} = 100 \\cdot 0{,}01 = 1\\ \\mathrm{J}$'],
    answer: '$1\\ \\mathrm{J}$',
    check: [1],
    ask: ['работа, J'],
  },
  {
    title: '⏱️ Средна скорост',
    problem: 'Скоростта на тяло е $v(t) = t^2$ m/s. Каква е средната му скорост за първите 3 секунди?',
    solution: ['Пътят е $s = \\int_0^3 t^2\\,dt = \\frac{27}{3} = 9\\ \\mathrm{m}$.', 'Средната скорост е $\\frac{s}{t} = \\frac{9}{3} = 3\\ \\mathrm{m/s}$.', 'Изобщо средната стойност на $f$ върху $[a;\\ b]$ е $\\frac{1}{b - a}\\int_a^b f(x)\\,dx$.'],
    answer: '$3\\ \\mathrm{m/s}$',
    check: [3],
    ask: ['скорост, m/s'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'На колко е равно $\\int x^3\\,dx$?',
    answers: ['$\\frac{x^4}{4} + C$', '$3x^2 + C$', '$\\frac{x^4}{3} + C$', '$x^4 + C$'],
    correctAnswer: '$\\frac{x^4}{4} + C$',
  },
  {
    question: 'На колко е равно $\\int_0^1 x\\,dx$?',
    answers: ['$\\frac{1}{2}$', '$1$', '$0$', '$2$'],
    correctAnswer: '$\\frac{1}{2}$',
  },
  {
    question: 'На колко е равно $\\int \\cos x\\,dx$?',
    answers: ['$\\sin x + C$', '$-\\sin x + C$', '$-\\cos x + C$', '$\\cos x + C$'],
    correctAnswer: '$\\sin x + C$',
  },
  {
    question: "Ако $F'(x) = f(x)$, на колко е равно $\\int_a^b f(x)\\,dx$?",
    answers: ['$F(b) - F(a)$', '$F(a) - F(b)$', '$f(b) - f(a)$', '$F(b) + F(a)$'],
    correctAnswer: '$F(b) - F(a)$',
  },
  {
    question: 'На колко е равно $\\int \\frac{1}{x}\\,dx$ (при $x \\ne 0$)?',
    answers: ['$\\ln |x| + C$', '$\\frac{x^0}{0} + C$', '$-\\frac{1}{x^2} + C$', '$e^x + C$'],
    correctAnswer: '$\\ln |x| + C$',
  },
  {
    question: 'На колко е равно $\\int_{-1}^{1} x^3\\,dx$?',
    answers: ['$0$', '$\\frac{1}{2}$', '$\\frac{1}{4}$', '$2$'],
    correctAnswer: '$0$',
  },
  {
    question: 'На колко е равно $\\int_0^2 3\\,dx$?',
    answers: ['$6$', '$3$', '$0$', '$9$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Ако $f(x) < 0$ за всяко $x$ от $[a;\\ b]$, то $\\int_a^b f(x)\\,dx$ е:',
    answers: ['отрицателно число', 'положително число', 'нула', 'не съществува'],
    correctAnswer: 'отрицателно число',
  },
  {
    question: 'Коя функция е примитивна на $f(x) = e^x$?',
    answers: ['$e^x + 5$', '$xe^{x-1}$', '$\\frac{e^{x+1}}{x+1}$', '$\\ln x$'],
    correctAnswer: '$e^x + 5$',
  },
];

// ---------- Таблица ----------

const TABLE: [string, string][] = [
  ['x^n\\ (n \\ne -1)', '\\frac{x^{n+1}}{n+1} + C'],
  ['\\frac{1}{x}', '\\ln |x| + C'],
  ['e^x', 'e^x + C'],
  ['a^x', '\\frac{a^x}{\\ln a} + C'],
  ['\\sin x', '-\\cos x + C'],
  ['\\cos x', '\\sin x + C'],
  ['\\frac{1}{\\cos^2 x}', '\\tg x + C'],
];

// ---------- Страница ----------

export function Integrals() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Интеграли</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏛️ Около 250 г. пр.н.е. Архимед иска да намери лицето на фигура, ограничена от парабола и права. Формула няма, затова той
            запълва фигурата с триъгълници – един голям, после два по-малки, после четири още по-малки… – и доказва, че лицето е точно{' '}
            <Tex>{'\\frac{4}{3}'}</Tex> от лицето на първия триъгълник. Почти две хиляди години по-късно Нютон и Лайбниц откриват, че такива
            „безкрайни сборове“ се пресмятат лесно с обратното действие на производната. Лайбниц ги означава със знака <Tex>{'\\int'}</Tex> –
            разтеглено S, от латинското <em>summa</em>, сбор.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Лицето под крива</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Лицето на правоъгълник е дължина по ширина, на триъгълник – половината от основата по височината.
              А колко е лицето под параболата <Tex>{'y = x^2'}</Tex> от 0 до 2? Тя е крива и никоя от познатите формули не става.
            </p>
          </div>
          <p className={text}>
            Идеята е да разделим интервала <Tex>{'[a;\\ b]'}</Tex> на <Tex>{'n'}</Tex> тесни ивици с ширина <Tex>{'\\Delta x = \\frac{b - a}{n}'}</Tex> и
            всяка да заменим с правоъгълник с височина стойността на функцията в някоя точка <Tex>{'x_i'}</Tex> от ивицата. Сборът{' '}
            <Tex>{'f(x_1)\\Delta x + f(x_2)\\Delta x + \\ldots + f(x_n)\\Delta x'}</Tex> (сума на Риман) е приближение на лицето – толкова по-добро,
            колкото по-тесни са ивиците.
          </p>
          <RiemannLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Определен интеграл</h2>
          <Theorem
            type="definition"
            title="Определен интеграл"
            description="Границата на сумите на Риман при $n \to \infty$ (ширината на ивиците клони към 0) се нарича определен интеграл на $f$ от $a$ до $b$: $\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i)\,\Delta x$. За непрекъсната функция тази граница съществува и не зависи от това как избираме точките $x_i$."
          />
          <p className={text}>
            Когато <Tex>{'f(x) \\ge 0'}</Tex>, интегралът е лицето под графиката. Записът е взет директно от сумата: <Tex>{'\\sum'}</Tex> става{' '}
            <Tex>{'\\int'}</Tex>, а <Tex>{'\\Delta x'}</Tex> – <Tex>{'dx'}</Tex>, „безкрайно тясна“ ивица.
          </p>
          <Theorem
            title="Свойства"
            description="$\int_a^b (f + g)\,dx = \int_a^b f\,dx + \int_a^b g\,dx$; $\int_a^b c f\,dx = c\int_a^b f\,dx$; $\int_a^b f\,dx + \int_b^c f\,dx = \int_a^c f\,dx$; $\int_a^a f\,dx = 0$; $\int_b^a f\,dx = -\int_a^b f\,dx$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Примитивна функция</h2>
          <Theorem
            type="definition"
            title="Примитивна функция и неопределен интеграл"
            description="Функцията $F$ е примитивна на $f$, ако $F'(x) = f(x)$. Например $x^2$ е примитивна на $2x$ – но такива са и $x^2 + 1$, $x^2 - 7$… Всички примитивни се различават с константа и ги записваме като неопределен интеграл: $\int f(x)\,dx = F(x) + C$."
          />
          <p className={text}>
            Интегрирането е обратно на диференцирането, затова таблицата се получава, като прочетем наобратно таблицата на производните (виж{' '}
            <Link to="/analysis/derivatives" className={link}>
              Производни
            </Link>
            ). Всеки резултат можем да проверим, като го диференцираме.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="mx-auto text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left font-semibold">функция</th>
                  <th className="px-4 py-2 text-left font-semibold">неопределен интеграл</th>
                </tr>
              </thead>
              <tbody>
                {TABLE.map(([f, F]) => (
                  <tr key={f} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-1.5">
                      <Tex>{f}</Tex>
                    </td>
                    <td className="px-4 py-1.5">
                      <Tex>{F}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Да намерим $\int (6x^2 - 4x + 3)\,dx$."
            steps={['Интегрираме всяко събираемо: $\\int 6x^2\\,dx = 2x^3$, $\\int 4x\\,dx = 2x^2$, $\\int 3\\,dx = 3x$', '$\\int (6x^2 - 4x + 3)\\,dx = 2x^3 - 2x^2 + 3x + C$', "Проверка: $(2x^3 - 2x^2 + 3x + C)' = 6x^2 - 4x + 3$ ✓"]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Формула на Нютон–Лайбниц</h2>
          <p className={text}>
            Да означим с <Tex>{'A(x)'}</Tex> лицето под <Tex>{'f'}</Tex> от фиксирана точка до <Tex>{'x'}</Tex>. Когато преместим <Tex>{'x'}</Tex> с малко{' '}
            <Tex>{'h'}</Tex>, лицето нараства с ивица, почти правоъгълник с височина <Tex>{'f(x)'}</Tex>: <Tex>{'A(x + h) - A(x) \\approx f(x) \\cdot h'}</Tex>.
            Делим на <Tex>{'h'}</Tex> и при <Tex>{'h \\to 0'}</Tex> получаваме <Tex>{"A'(x) = f(x)"}</Tex> – лицето е примитивна функция!
          </p>
          <AccumulationLab />
          <Theorem
            title="Основна теорема на анализа"
            description="Ако $f$ е непрекъсната в $[a;\ b]$ и $F$ е нейна примитивна, то $\int_a^b f(x)\,dx = F(b) - F(a)$. Записваме кратко $\left[F(x)\right]_a^b$."
          />
          <Example
            description="Да пресметнем лицето под $y = x^2$ от 0 до 2 – отговора на загадката."
            steps={['Примитивна: $F(x) = \\frac{x^3}{3}$', '$\\int_0^2 x^2\\,dx = \\frac{8}{3} - 0 = \\frac{8}{3} \\approx 2{,}67$', 'Точно към това число клонят сумите в първата лаборатория.']}
          />
          <Example
            description="Да пресметнем $\int_0^{\pi} \sin x\,dx$."
            steps={['$\\int_0^{\\pi} \\sin x\\,dx = \\left[-\\cos x\\right]_0^{\\pi}$', '$= -\\cos \\pi + \\cos 0 = 1 + 1 = 2$', 'Една „арка“ на синусоидата има лице точно 2.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Лица на фигури</h2>
          <p className={text}>
            Интегралът брои лицето под оста <Tex>{'Ox'}</Tex> с минус. Затова, за да намерим лицето на фигура, разделяме интервала там, където
            функцията сменя знака, и събираме абсолютните стойности. Лицето между две криви, при <Tex>{'f(x) \\ge g(x)'}</Tex>, е{' '}
            <Tex>{'\\int_a^b \\left(f(x) - g(x)\\right) dx'}</Tex>.
          </p>
          <SignedAreaLab />
          <Example
            description="Да намерим лицето между $y = x$ и $y = x^2$."
            steps={['Пресечни точки: $x = x^2 \\Rightarrow x = 0$ или $x = 1$; между тях $x \\ge x^2$', '$S = \\int_0^1 (x - x^2)\\,dx = \\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$']}
          />
          <Example
            description="Да проверим резултата на Архимед за параболата $y = 4 - x^2$ и оста $Ox$."
            steps={['Пресечни точки: $x = \\pm 2$; $S = \\int_{-2}^{2} (4 - x^2)\\,dx = \\left[4x - \\frac{x^3}{3}\\right]_{-2}^{2} = \\frac{32}{3}$', 'Вписаният триъгълник с върхове $(-2;\\ 0)$, $(2;\\ 0)$ и $(0;\\ 4)$ има лице $\\frac{4 \\cdot 4}{2} = 8$', '$\\frac{32}{3} : 8 = \\frac{4}{3}$ – точно както е доказал Архимед ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Обеми на ротационни тела</h2>
          <Theorem
            title="Обем на ротационно тяло"
            description="Когато графиката на $y = f(x)$, $a \le x \le b$, се завърти около оста $Ox$, всеки тесен слой е цилиндър с радиус $f(x)$ и височина $dx$. Сборът от обемите им дава $V = \pi \int_a^b f(x)^2\,dx$."
          />
          <Example
            description="Да изведем обема на кълбо с радиус $R$ – въртим полуокръжността $y = \sqrt{R^2 - x^2}$."
            steps={['$V = \\pi \\int_{-R}^{R} (R^2 - x^2)\\,dx = \\pi \\left[R^2 x - \\frac{x^3}{3}\\right]_{-R}^{R}$', '$= \\pi \\left(\\frac{2R^3}{3} + \\frac{2R^3}{3}\\right) = \\frac{4}{3}\\pi R^3$']}
          />
          <p className={text}>
            Така се получават всички формули за обем от{' '}
            <Link to="/geometry/solids" className={link}>
              Стереометрия
            </Link>{' '}
            – Архимед е намерил обема на кълбото по сходен начин, с „нарязване“ на тънки слоеве.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Намери примитивната и пресметни интеграла. Дробните отговори въвеждай като 8/3.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Намери примитивна F и пресметни F(b) − F(a)." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Интегралите около нас</h2>
          <p className={text}>
            Щом знаем скоростта, с която нещо се променя, интегралът дава колко се е променило общо: пътят от скоростта, количеството вода от
            дебита, работата от силата. Със същата идея астрономите пресмятат масата на звезда или галактика, като „събират“ тънки слоеве.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Забравена константа', '$\\int 2x\\,dx = x^2$', '$\\int 2x\\,dx = x^2 + C$'],
              ['Делим на старата степен', '$\\int x^3\\,dx = \\frac{x^4}{3} + C$', '$\\int x^3\\,dx = \\frac{x^4}{4} + C$'],
              ['Интеграл от $\\frac{1}{x}$', '$\\int \\frac{1}{x}\\,dx = \\frac{x^0}{0} + C$', '$\\int \\frac{1}{x}\\,dx = \\ln |x| + C$'],
              ['Интеграл от произведение', '$\\int fg\\,dx = \\int f\\,dx \\cdot \\int g\\,dx$', 'няма такова правило – разкриваме скобите или търсим друг метод'],
              ['Обърнати граници', '$\\int_a^b f\\,dx = F(a) - F(b)$', '$\\int_a^b f\\,dx = F(b) - F(a)$'],
              ['Интеграл вместо лице', 'лицето под $x^3$ от $-1$ до $1$ е $0$', 'лицето е $\\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$, интегралът е $0$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Намерете $\int (3x^2 - 4x + 5)\,dx$.">
                <p><Tex>{'\\int (3x^2 - 4x + 5)\\,dx = x^3 - 2x^2 + 5x + C'}</Tex></p>
                <p>Проверка: <Tex>{"(x^3 - 2x^2 + 5x + C)' = 3x^2 - 4x + 5"}</Tex> ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $\int_1^2 x^3\,dx$.">
                <p><Tex>{'\\left[\\frac{x^4}{4}\\right]_1^2 = \\frac{16}{4} - \\frac{1}{4}'}</Tex></p>
                <p><Tex>{'= \\frac{15}{4} = 3{,}75'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете $\int_1^e \frac{1}{x}\,dx$.">
                <p><Tex>{'\\left[\\ln x\\right]_1^e = \\ln e - \\ln 1'}</Tex></p>
                <p><Tex>{'= 1 - 0 = 1'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете лицето на фигурата между $y = x^2$ и $y = 2x$.">
                <p>Пресечни точки: <Tex>{'x^2 = 2x \\Rightarrow x = 0'}</Tex> или <Tex>{'x = 2'}</Tex>; между тях <Tex>{'2x \\ge x^2'}</Tex>.</p>
                <p><Tex>{'S = \\int_0^2 (2x - x^2)\\,dx = \\left[x^2 - \\frac{x^3}{3}\\right]_0^2 = 4 - \\frac{8}{3}'}</Tex></p>
                <p><Tex>{'S = \\frac{4}{3}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете лицето на фигурата между графиката на $y = x^3 - x$ и оста $Ox$.">
                <p>Нули: <Tex>{'x^3 - x = x(x - 1)(x + 1) = 0 \\Rightarrow x = -1,\\ 0,\\ 1'}</Tex>.</p>
                <p>При <Tex>{'-1 < x < 0'}</Tex> функцията е положителна, при <Tex>{'0 < x < 1'}</Tex> – отрицателна.</p>
                <p><Tex>{'\\int_{-1}^{0} (x^3 - x)\\,dx = \\left[\\frac{x^4}{4} - \\frac{x^2}{2}\\right]_{-1}^{0} = \\frac{1}{4}'}</Tex>, а от 0 до 1 интегралът е <Tex>{'-\\frac{1}{4}'}</Tex>.</p>
                <p><Tex>{'S = \\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}'}</Tex> (а интегралът от <Tex>{'-1'}</Tex> до <Tex>{'1'}</Tex> е 0).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Пресметнете обема на тялото, получено при въртене на $y = \sqrt{x}$, $0 \le x \le 4$, около $Ox$.">
                <p><Tex>{'V = \\pi \\int_0^4 (\\sqrt{x})^2\\,dx = \\pi \\int_0^4 x\\,dx'}</Tex></p>
                <p><Tex>{'= \\pi \\left[\\frac{x^2}{2}\\right]_0^4 = 8\\pi \\approx 25{,}13'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Пресметнете $\int_0^{\pi/2} \sin x \cos x\,dx$.">
                <p>Полагаме <Tex>{'u = \\sin x'}</Tex>; тогава <Tex>{'du = \\cos x\\,dx'}</Tex>, а границите стават от <Tex>{'u = 0'}</Tex> до <Tex>{'u = 1'}</Tex>.</p>
                <p><Tex>{'\\int_0^1 u\\,du = \\left[\\frac{u^2}{2}\\right]_0^1 = \\frac{1}{2}'}</Tex></p>
                <p>(Друг начин: <Tex>{'\\sin x \\cos x = \\frac{1}{2}\\sin 2x'}</Tex>.)</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Намерете границата $\lim_{n \to \infty} \frac{1^2 + 2^2 + \ldots + n^2}{n^3}$, като я представите като интеграл.">
                <p><Tex>{'\\frac{1^2 + 2^2 + \\ldots + n^2}{n^3} = \\sum_{i=1}^{n} \\left(\\frac{i}{n}\\right)^2 \\cdot \\frac{1}{n}'}</Tex></p>
                <p>Това е сума на Риман за <Tex>{'f(x) = x^2'}</Tex> върху <Tex>{'[0;\\ 1]'}</Tex> с <Tex>{'n'}</Tex> ивици с ширина <Tex>{'\\frac{1}{n}'}</Tex> (десни краища).</p>
                <p>Границата е <Tex>{'\\int_0^1 x^2\\,dx = \\frac{1}{3}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При коя стойност на $a > 0$ лицето на фигурата между параболата $y = x^2$ и правата $y = a$ е 36?">
                <p>Пресечни точки: <Tex>{'x = \\pm\\sqrt{a}'}</Tex>.</p>
                <p><Tex>{'S = \\int_{-\\sqrt{a}}^{\\sqrt{a}} (a - x^2)\\,dx = 2\\left(a\\sqrt{a} - \\frac{a\\sqrt{a}}{3}\\right) = \\frac{4}{3}a\\sqrt{a}'}</Tex></p>
                <p><Tex>{'\\frac{4}{3}a^{3/2} = 36 \\Rightarrow a^{3/2} = 27 \\Rightarrow a = 9'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Определеният интеграл е граница на сумите на Риман: <Tex>{'\\int_a^b f(x)\\,dx = \\lim \\sum f(x_i)\\,\\Delta x'}</Tex></li>
              <li>✓ <Tex>{"F' = f \\Rightarrow \\int f(x)\\,dx = F(x) + C"}</Tex></li>
              <li>✓ <Tex>{'\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C'}</Tex>, <Tex>{'\\int \\frac{1}{x}\\,dx = \\ln |x| + C'}</Tex>, <Tex>{'\\int e^x\\,dx = e^x + C'}</Tex></li>
              <li>✓ Нютон–Лайбниц: <Tex>{'\\int_a^b f(x)\\,dx = F(b) - F(a)'}</Tex></li>
              <li>✓ Под оста интегралът е отрицателен – за лице събираме абсолютните стойности на частите</li>
              <li>✓ Лице между криви: <Tex>{'\\int_a^b (f - g)\\,dx'}</Tex>; обем на ротационно тяло: <Tex>{'\\pi \\int_a^b f^2\\,dx'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Съчинението на Архимед „Методът“, в което той обяснява как „нарязва“ фигурите на безкрайно тънки ивици, е смятано за изгубено
              векове наред. През 1906 г. датският филолог Йохан Хайберг го открива в Константинопол – под текста на средновековен молитвеник:
              през XIII век пергаментът е изстърган и използван наново. Този палимпсест е продаден на търг през 1998 г. за над 2 милиона
              долара.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
