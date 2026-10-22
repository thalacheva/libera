import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import CoolingLab from './CoolingLab';
import { type Drill, nonZero, paren, pick, polyTex, randInt } from '~/drill';
import EulerLab from './EulerLab';
import SlopeFieldLab from './SlopeFieldLab';
import Trainer from '~/Trainer';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.5 → 0{,}5. */
const dec = (v: number) => String(v).replace('.', '{,}');
/** Коефициент пред множител: 1 · x → x. */
const times = (c: number, rest: string) => (c === 1 ? rest : `${c} \\cdot ${rest}`);

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  if (kind === 0) {
    // y′ = px + q, y(0) = c ⇒ y = (p/2)x² + qx + c
    const [p, q, c, x1] = [pick([-4, -2, 2, 4, 6]), randInt(-4, 4), randInt(-5, 5), nonZero(-3, 3)];
    const v = (p / 2) * x1 * x1 + q * x1 + c;
    return {
      tex: `y' = ${polyTex([[p, 1], [q, 0]])}, \\quad y(0) = ${c}`,
      ask: `y(${x1}) = ?`,
      num: v,
      den: 1,
      steps: [
        `Интегрираме: $y = ${polyTex([[p / 2, 2], [q, 1]])} + C$`,
        `От $y(0) = ${c}$ следва $C = ${c}$`,
        `$y(${x1}) = ${p / 2 === -1 ? '-' : ''}${times(Math.abs(p / 2) === 1 ? 1 : p / 2, `${paren(x1)}^2`)}${q ? ` ${q < 0 ? '-' : '+'} ${times(Math.abs(q), paren(x1))}` : ''}${c ? ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}` : ''} = ${v}$`,
      ],
    };
  }
  if (kind === 1) {
    const [T, m] = [pick([2, 3, 5, 10]), randInt(2, 4)];
    if (randInt(0, 1) === 0) {
      const y0 = pick([50, 100, 200, 300, 500]);
      return {
        tex: `y' = ky, \\quad y(0) = ${y0}`,
        ask: `Количеството се удвоява на всеки ${T} часа. Колко е $y(${T * m})$?`,
        num: y0 * 2 ** m,
        den: 1,
        steps: [`Решението е $y = ${y0} \\cdot 2^{t/${T}}$`, `$t = ${T * m}$ са ${m} удвоявания: $${y0} \\cdot 2^{${m}} = ${y0 * 2 ** m}$`],
      };
    }
    const y0 = pick([1, 3, 5, 10]) * 2 ** m * 10;
    return {
      tex: `y' = -ky, \\quad y(0) = ${y0}`,
      ask: `Периодът на полуразпад е ${T} години. Колко е $y(${T * m})$?`,
      num: y0 / 2 ** m,
      den: 1,
      steps: [`Решението е $y = ${y0} \\cdot \\left(\\frac{1}{2}\\right)^{t/${T}}$`, `$t = ${T * m}$ са ${m} периода: $${y0} : 2^{${m}} = ${y0 / 2 ** m}$`],
    };
  }
  if (kind === 2) {
    const a = pick([1, 2, -1]);
    // при a = −1 и h = 1 първата стъпка дава 0 – безинтересно
    const [h, b] = [a === -1 ? 0.5 : pick([0.5, 1]), pick([1, 2, 4])];
    const y1 = b * (1 + a * h);
    const y2 = y1 * (1 + a * h);
    const ay = (y: number) => (a === 1 ? dec(y) : a === -1 ? `(-${dec(y)})` : `${a} \\cdot ${dec(y)}`);
    return {
      tex: `y' = ${a === 1 ? '' : a === -1 ? '-' : a}y, \\quad y(0) = ${b}`,
      ask: `Две стъпки по Ойлер с $h = ${dec(h)}$: $y(${dec(2 * h)}) \\approx ?$`,
      num: y2,
      den: 1,
      steps: [`$y_1 = ${b} + ${dec(h)} \\cdot ${ay(b)} = ${dec(y1)}$`, `$y_2 = ${dec(y1)} + ${dec(h)} \\cdot ${ay(y1)} = ${dec(y2)}$`],
    };
  }
  // y″ − (r₁ + r₂)y′ + r₁r₂y = 0 има решения e^(r₁x) и e^(r₂x)
  let [r1, r2] = [randInt(-3, 4), randInt(-3, 4)];
  while (r1 === r2) r2 = randInt(-3, 4);
  if (r1 > r2) [r1, r2] = [r2, r1];
  const [s, p] = [r1 + r2, r1 * r2];
  const eq = `y''${s === 0 ? '' : s > 0 ? ` - ${s === 1 ? '' : s}y'` : ` + ${s === -1 ? '' : -s}y'`}${p === 0 ? '' : p > 0 ? ` + ${p}y` : ` - ${-p}y`} = 0`;
  return {
    tex: eq,
    ask: 'При кое по-голямо $k$ функцията $y = e^{kx}$ е решение?',
    num: r2,
    den: 1,
    steps: [`Заместваме $y = e^{kx}$: $y' = ke^{kx}$, $y'' = k^2 e^{kx}$ и делим на $e^{kx} \\ne 0$`, `$${polyTex([[1, 2], [-s, 1], [p, 0]]).replace(/x/g, 'k')} = 0 \\Rightarrow k = ${r1}$ или $k = ${r2}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🦴 Радиовъглеродно датиране',
    problem: 'Въглерод-14 се разпада с период на полуразпад около 5730 години. В дървен предмет е останал 25% от въглерод-14 в сравнение с живо дърво. На колко години е приблизително предметът?',
    solution: ['Количеството удовлетворява $N\' = -kN$, т.е. $N = N_0 \\cdot \\left(\\frac{1}{2}\\right)^{t/5730}$.', '$25\\% = \\frac{1}{4} = \\left(\\frac{1}{2}\\right)^2$ – изминали са два периода.', '$t = 2 \\cdot 5730 = 11\\,460$ години'],
    answer: '$\\approx 11\\,460$ години',
    check: [11460],
    ask: ['години'],
  },
  {
    title: '☕ Кафе на бюрото',
    problem: 'Кафе с температура 90 °C е оставено в стая с 20 °C. След 5 минути то е 80 °C. След колко минути (от началото) ще стане 50 °C? Изстиването следва закона на Нютон.',
    solution: ['$T = 20 + 70e^{-kt}$; от $T(5) = 80$: $e^{-5k} = \\frac{60}{70} \\Rightarrow k = \\frac{1}{5}\\ln \\frac{7}{6} \\approx 0{,}0308$', '$50 = 20 + 70e^{-kt} \\Rightarrow e^{-kt} = \\frac{3}{7}$', '$t = \\frac{\\ln (7/3)}{k} \\approx \\frac{0{,}847}{0{,}0308} \\approx 27{,}5$ минути'],
    answer: '$\\approx 27{,}5$ минути',
    check: [27.5],
    ask: ['минути'],
  },
  {
    title: '🦠 Бактерии',
    problem: 'Броят на бактериите в хранителна среда се удвоява на всеки 20 минути. Колко бактерии ще има след 3 часа, ако в началото са 1000?',
    solution: ['$N\' = kN \\Rightarrow N = 1000 \\cdot 2^{t/20}$ (t в минути)', '3 часа = 180 минути = 9 удвоявания', '$N = 1000 \\cdot 2^9 = 512\\,000$'],
    answer: '512 000',
    check: [512000],
    ask: ['бактерии'],
  },
  {
    title: '💶 Непрекъсната лихва',
    problem: 'Влог от 1000 € расте със скорост, пропорционална на сумата: $y\' = 0{,}05y$ (5% годишно, олихвявани непрекъснато). Колко ще бъде влогът след 10 години?',
    solution: ['Решението е $y = 1000e^{0{,}05t}$', '$y(10) = 1000e^{0{,}5} \\approx 1000 \\cdot 1{,}6487$', '$\\approx 1648{,}72$ €'],
    answer: '$\\approx 1648{,}72$ €',
    check: [1648.72],
    ask: ['€'],
  },
  {
    title: '🪂 Пределна скорост',
    problem: 'При падане със съпротивление на въздуха скоростта удовлетворява $v\' = 9{,}8 - 0{,}2v$ (в m/s). До каква скорост се доближава тялото?',
    solution: ['Скоростта спира да расте, когато $v\' = 0$.', '$9{,}8 - 0{,}2v = 0 \\Rightarrow v = 49\\ \\mathrm{m/s}$', 'Решението е $v = 49(1 - e^{-0{,}2t})$ – клони към 49, но никога не я надминава.'],
    answer: '$49\\ \\mathrm{m/s}$',
    check: [49],
    ask: ['скорост, m/s'],
  },
  {
    title: '💊 Лекарство в кръвта',
    problem: 'Организмът изхвърля лекарство така, че количеството му намалява наполовина на всеки 4 часа. Колко mg остават 12 часа след доза от 200 mg?',
    solution: ['12 часа = 3 периода на полуразпад', '$200 \\cdot \\left(\\frac{1}{2}\\right)^3 = 25\\ \\mathrm{mg}$'],
    answer: '$25\\ \\mathrm{mg}$',
    check: [25],
    ask: ['mg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: "Коя функция е решение на $y' = y$?",
    answers: ['$e^x$', '$x^2$', '$\\ln x$', '$\\sin x$'],
    correctAnswer: '$e^x$',
  },
  {
    question: "Кое е общото решение на $y' = 2x$?",
    answers: ['$y = x^2 + C$', '$y = x^2$', '$y = 2$', '$y = 2x^2 + C$'],
    correctAnswer: '$y = x^2 + C$',
  },
  {
    question: "Кое е общото решение на $y' = -3y$?",
    answers: ['$y = Ce^{-3x}$', '$y = e^{-3x} + C$', '$y = -3x + C$', '$y = Ce^{3x}$'],
    correctAnswer: '$y = Ce^{-3x}$',
  },
  {
    question: 'Периодът на полуразпад на вещество е 10 години. Каква част от него остава след 30 години?',
    answers: ['$\\frac{1}{8}$', '$\\frac{1}{3}$', '$\\frac{1}{6}$', '$0$'],
    correctAnswer: '$\\frac{1}{8}$',
  },
  {
    question: "Коя функция е решение на $y'' = -4y$?",
    answers: ['$\\sin 2x$', '$e^{2x}$', '$\\sin 4x$', '$x^2$'],
    correctAnswer: '$\\sin 2x$',
  },
  {
    question: "Колко начални условия са нужни, за да определим едно решение на уравнение от вида $y' = f(x, y)$?",
    answers: ['едно', 'нито едно', 'две', 'безброй много'],
    correctAnswer: 'едно',
  },
  {
    question: 'При изстиване по закона на Нютон температурата на тялото клони към:',
    answers: ['температурата на околната среда', '0 °C', 'началната си стойност', 'безкрайност'],
    correctAnswer: 'температурата на околната среда',
  },
  {
    question: "При логистичния растеж $y' = ry\\left(1 - \\frac{y}{K}\\right)$ растежът е най-бърз при:",
    answers: ['$y = \\frac{K}{2}$', '$y = K$', '$y = 0$', '$y = 2K$'],
    correctAnswer: '$y = \\frac{K}{2}$',
  },
  {
    question: 'Какво става с грешката на метода на Ойлер, когато намалим стъпката?',
    answers: ['намалява', 'расте', 'не се променя', 'става точно нула'],
    correctAnswer: 'намалява',
  },
];

// ---------- Страница ----------

export function DifferentialEquations() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Диференциални уравнения</h1>

        <div className="bg-gradient-to-br from-violet-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🪐 Още в началото на XIX век астрономите забелязват, че Уран не се движи точно така, както предсказват уравненията на Нютон.
            През 1846 г. французинът Урбен Льоверие решава, че го „дърпа“ непозната планета, и само с хартия и молив пресмята къде трябва да
            е тя. На 23 септември 1846 г. Йохан Гале в
            Берлинската обсерватория насочва телескопа натам и още първата нощ открива Нептун – на около градус от предсказаното място.
            Казват, че Нептун е открит „на върха на перото“. Уравненията, които Льоверие решава, са <strong>диференциални</strong>: в тях
            неизвестното е цяла функция – движението на планетата във времето.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е диференциално уравнение?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Коя функция е равна на собствената си <Term id="derivative">производна</Term>? Константата 0 – да. А друга? Отговорът е{' '}
              <Tex>{'e^x'}</Tex>, и всъщност всяка функция <Tex>{'Ce^x'}</Tex>. Току-що решихме първото си диференциално уравнение:{' '}
              <Tex>{"y' = y"}</Tex>.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Диференциално уравнение"
            description="Уравнение, в което неизвестното е функция $y(x)$ и участват нейни производни, се нарича диференциално. Редът му е най-високата производна в него: $y' = 2x$ е от първи ред, $y'' = -y$ – от втори. Решение е всяка функция, която го превръща в тъждество."
          />
          <p className={text}>
            Обикновено уравнението има безброй решения – цяло <strong>семейство</strong>. Например <Tex>{"y' = 2x"}</Tex> се решава с
            интегриране (виж{' '}
            <Link to="/analysis/integrals" className={link}>
              Интеграли
            </Link>
            ): <Tex>{'y = x^2 + C'}</Tex>. За да изберем едно решение, ни трябва <strong>начално условие</strong>, например{' '}
            <Tex>{'y(0) = 3'}</Tex>, откъдето <Tex>{'C = 3'}</Tex>.
          </p>
          <Theorem
            title="Поле от направления"
            description="Уравнението $y' = f(x, y)$ казва какъв е наклонът на решението във всяка точка $(x;\ y)$. Ако начертаем малка чертичка с този наклон в много точки, получаваме „карта“, по която решенията текат. При добри условия през всяка точка минава точно едно решение."
          />
          <SlopeFieldLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Уравнения с разделящи се променливи</h2>
          <p className={text}>
            Ако уравнението има вида <Tex>{'\\frac{dy}{dx} = g(x) \\cdot h(y)'}</Tex>, можем да „разделим“ променливите – всичко с{' '}
            <Tex>{'y'}</Tex> отляво, всичко с <Tex>{'x'}</Tex> отдясно – и да интегрираме двете страни:{' '}
            <Tex>{'\\int \\frac{dy}{h(y)} = \\int g(x)\\,dx'}</Tex>. Тук записът на Лайбниц <Tex>{'\\frac{dy}{dx}'}</Tex> наистина се държи като дроб.
          </p>
          <Example
            description="Да решим $y' = ky$ (скоростта на изменение е пропорционална на количеството)."
            steps={[
              '$\\frac{dy}{y} = k\\,dx \\Rightarrow \\int \\frac{dy}{y} = \\int k\\,dx$',
              '$\\ln |y| = kx + C_1 \\Rightarrow |y| = e^{C_1} e^{kx}$',
              'Общо решение: $y = Ce^{kx}$; при $x = 0$ имаме $y(0) = C$ – началното количество.',
            ]}
          />
          <Example
            description="Да решим $y' = xy$ с начално условие $y(0) = 2$."
            steps={['$\\frac{dy}{y} = x\\,dx \\Rightarrow \\ln |y| = \\frac{x^2}{2} + C_1$', '$y = Ce^{x^2/2}$', 'От $y(0) = C = 2$: $y = 2e^{x^2/2}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Растеж, разпад и изстиване</h2>
          <Theorem
            title="Експоненциален растеж и разпад"
            description="Решението на $y' = ky$ е $y = y_0 e^{kt}$. При $k > 0$ количеството се удвоява за едно и също време $T_2 = \frac{\ln 2}{k}$; при $k < 0$ намалява наполовина за време $T_{1/2} = \frac{\ln 2}{|k|}$ – периода на полуразпад. Затова $y = y_0 \cdot 2^{t/T_2}$ и $y = y_0 \cdot \left(\frac{1}{2}\right)^{t/T_{1/2}}$."
          />
          <p className={text}>
            Така се размножават <Term id="bacterium">бактериите</Term>, така расте влог при непрекъсната лихва и така се разпадат радиоактивните ядра – и на това
            се основава <Term id="radiocarbon-dating">радиовъглеродното датиране</Term>. Друг класически пример е <strong>законът на Нютон за изстиването</strong>: скоростта,
            с която тялото изстива, е пропорционална на разликата между неговата температура и тази на околната среда.
          </p>
          <Theorem
            title="Закон на Нютон за изстиването"
            description="$T' = -k(T - T_s)$, където $T_s$ е температурата на околната среда. Полагаме $u = T - T_s$: $u' = -ku$, значи $u = u_0 e^{-kt}$ и $T(t) = T_s + (T_0 - T_s)e^{-kt}$."
          />
          <CoolingLab />
          <p className={text}>
            Растежът не може да е експоненциален вечно – храната и мястото свършват. По-реалистичен е <strong>логистичният</strong> модел{' '}
            <Tex>{"y' = ry\\left(1 - \\frac{y}{K}\\right)"}</Tex>: докато <Tex>{'y'}</Tex> е малко, расте почти експоненциално, а близо до
            капацитета <Tex>{'K'}</Tex> растежът спира. Пробвай го в полето от направления по-горе.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Трептения: уравнение от втори ред</h2>
          <p className={text}>
            По <Term id="hookes-law">закона на Хук</Term> пружината дърпа тежестта обратно със сила, пропорционална на отклонението: <Tex>{'F = -cx'}</Tex>. От <Term id="newton-second-law">втория
            закон на Нютон</Term> <Tex>{"F = mx''"}</Tex> получаваме <Tex>{"x'' = -\\frac{c}{m}x"}</Tex> – уравнение, в което участва втората производна
            (<Term id="acceleration">ускорението</Term>).
          </p>
          <Theorem
            title="Хармонично трептене"
            description="Решенията на $x'' = -\omega^2 x$ са $x(t) = A\cos(\omega t + \varphi)$ – трептене с амплитуда $A$ и период $T = \frac{2\pi}{\omega}$. Двете константи $A$ и $\varphi$ се определят от две начални условия: положението $x(0)$ и скоростта $x'(0)$."
          />
          <Example
            description="Да проверим, че $x = \sin 3t$ е решение на $x'' + 9x = 0$, и да намерим периода."
            steps={["$x' = 3\\cos 3t$, $x'' = -9\\sin 3t$", "$x'' + 9x = -9\\sin 3t + 9\\sin 3t = 0$ ✓", 'Тук $\\omega = 3$, така че $T = \\frac{2\\pi}{3} \\approx 2{,}09$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Когато формула няма: метод на Ойлер</h2>
          <p className={text}>
            Повечето диференциални уравнения нямат решение, което да се запише с формула. Тогава ги решаваме числено. Най-простият метод е
            на Леонард Ойлер (1768): от точката <Tex>{'(x_n;\\ y_n)'}</Tex> правим малка стъпка <Tex>{'h'}</Tex> по допирателната:{' '}
            <Tex>{'y_{n+1} = y_n + h \\cdot f(x_n, y_n)'}</Tex>.
          </p>
          <EulerLab />
          <Example
            description="Да пресметнем приближено $y(1)$ за $y' = y$, $y(0) = 1$ (точно: $e \approx 2{,}718$)."
            steps={['С $h = 1$ (една стъпка): $y_1 = 1 + 1 \\cdot 1 = 2$', 'С $h = 0{,}5$: $y_1 = 1{,}5$, $y_2 = 1{,}5 + 0{,}5 \\cdot 1{,}5 = 2{,}25$', 'С $h = 0{,}1$ (10 стъпки): $1{,}1^{10} \\approx 2{,}594$ – все по-близо до $e$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Реши уравнението или направи стъпките на Ойлер. Десетичните отговори въвеждай като 2,25.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Диференциалните уравнения около нас</h2>
          <p className={text}>
            Законите на физиката почти винаги са диференциални уравнения: движението на планетите (виж{' '}
            <Link to="/astronomy/lecture07" className={link}>
              Закони на Кеплер
            </Link>
            ), разпространението на топлина, <Term id="electric-current">токът</Term> в електрическа верига. С тях се моделират и епидемии, популации, лекарства в кръвта и
            цените на финансовите пазари.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Едно решение вместо семейство', "$y' = 2x \\Rightarrow y = x^2$", "$y = x^2 + C$ – константата се намира от началното условие"],
              ['Константа на грешното място', "$y' = ky \\Rightarrow y = e^{kx} + C$", "$y = Ce^{kx}$ – константата е множител"],
              ['Две полуразпадания', 'след два периода не остава нищо', 'остава $\\frac{1}{4}$ – всеки период намалява наполовина'],
              ['Период на трептене', "$x'' = -\\omega^2 x \\Rightarrow T = 2\\pi\\omega$", '$T = \\frac{2\\pi}{\\omega}$'],
              ['Изстиване до нула', '$T(t) = T_0 e^{-kt}$', '$T(t) = T_s + (T_0 - T_s)e^{-kt}$ – клони към стайната температура'],
              ['Ойлер е точен', 'методът на Ойлер дава решението', 'дава приближение; грешката намалява с по-малка стъпка'],
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
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Решете $y' = 3x^2 - 2$ с начално условие $y(0) = 1$.">
                <p>Интегрираме: <Tex>{'y = x^3 - 2x + C'}</Tex>.</p>
                <p>От <Tex>{'y(0) = C = 1'}</Tex>: <Tex>{'y = x^3 - 2x + 1'}</Tex>.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Проверете, че $y = Ce^{-2x}$ е решение на $y' + 2y = 0$, и намерете $C$, ако $y(0) = 5$." check={[5]} ask={['$C$']}>
                <p><Tex>{"y' = -2Ce^{-2x} \\Rightarrow y' + 2y = -2Ce^{-2x} + 2Ce^{-2x} = 0"}</Tex> ✓</p>
                <p><Tex>{'y(0) = C = 5'}</Tex>, т.е. <Tex>{'y = 5e^{-2x}'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Йод-131 има период на полуразпад около 8 дни. Колко mg остават от 80 mg след 24 дни?" check={[10]} ask={['остават, mg']}>
                <p>24 дни са 3 периода.</p>
                <p><Tex>{'80 \\cdot \\left(\\frac{1}{2}\\right)^3 = 10\\ \\mathrm{mg}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Решете $y' = \frac{x}{y}$ с начално условие $y(0) = 2$ ($y > 0$).">
                <p>Разделяме: <Tex>{'y\\,dy = x\\,dx \\Rightarrow \\frac{y^2}{2} = \\frac{x^2}{2} + C_1'}</Tex>, т.е. <Tex>{'y^2 = x^2 + C'}</Tex>.</p>
                <p>От <Tex>{'y(0) = 2'}</Tex>: <Tex>{'C = 4'}</Tex>.</p>
                <p><Tex>{'y = \\sqrt{x^2 + 4}'}</Tex> (клон на хипербола).</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Кафе с 90 °C е в стая с 20 °C. След 10 минути то е 55 °C. Каква е температурата му след 20 минути?" check={[37.5]} ask={['температура, °C']}>
                <p><Tex>{'T = 20 + 70e^{-kt}'}</Tex>; от <Tex>{'T(10) = 55'}</Tex>: <Tex>{'70e^{-10k} = 35 \\Rightarrow e^{-10k} = \\frac{1}{2}'}</Tex>.</p>
                <p><Tex>{'e^{-20k} = \\left(e^{-10k}\\right)^2 = \\frac{1}{4}'}</Tex></p>
                <p><Tex>{'T(20) = 20 + 70 \\cdot \\frac{1}{4} = 37{,}5\\ ^{\\circ}\\mathrm{C}'}</Tex> – разликата със стаята се разполовява на всеки 10 минути.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Решете $x'' + 9x = 0$ с начални условия $x(0) = 2$, $x'(0) = 0$. Какъв е периодът?">
                <p>Общото решение е <Tex>{'x = A\\cos 3t + B\\sin 3t'}</Tex>.</p>
                <p><Tex>{'x(0) = A = 2'}</Tex>; <Tex>{"x'(0) = 3B = 0 \\Rightarrow B = 0"}</Tex>.</p>
                <p><Tex>{'x = 2\\cos 3t'}</Tex>, период <Tex>{'T = \\frac{2\\pi}{3}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Решете $y' = y^2$ с начално условие $y(0) = 1$. Какво се случва при $x \to 1$?">
                <p>Разделяме: <Tex>{'\\frac{dy}{y^2} = dx \\Rightarrow -\\frac{1}{y} = x + C'}</Tex>.</p>
                <p>От <Tex>{'y(0) = 1'}</Tex>: <Tex>{'C = -1'}</Tex>, значи <Tex>{'y = \\frac{1}{1 - x}'}</Tex>.</p>
                <p>При <Tex>{'x \\to 1'}</Tex> решението клони към безкрайност – „взривява се“ за крайно време, макар уравнението да изглежда безобидно.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="За логистичното уравнение $y' = ry\left(1 - \frac{y}{K}\right)$ намерете при какво $y$ растежът е най-бърз и колко е той.">
                <p>Като функция на <Tex>{'y'}</Tex>, <Tex>{"y' = ry - \\frac{r}{K}y^2"}</Tex> е парабола с върх при <Tex>{'y = \\frac{K}{2}'}</Tex>.</p>
                <p>Най-големият растеж е <Tex>{'r \\cdot \\frac{K}{2} \\cdot \\frac{1}{2} = \\frac{rK}{4}'}</Tex>.</p>
                <p>Затова популациите (и продажбите на нов продукт) растат най-бързо, когато са на половината от капацитета си.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Решете $y'' - 5y' + 6y = 0$ с начални условия $y(0) = 2$, $y'(0) = 5$.">
                <p>Търсим решения <Tex>{'e^{kx}'}</Tex>: <Tex>{'k^2 - 5k + 6 = 0 \\Rightarrow k = 2'}</Tex> или <Tex>{'k = 3'}</Tex>.</p>
                <p>Общо решение: <Tex>{'y = Ae^{2x} + Be^{3x}'}</Tex>; <Tex>{'A + B = 2'}</Tex> и <Tex>{'2A + 3B = 5'}</Tex>.</p>
                <p><Tex>{'B = 1,\\ A = 1'}</Tex>, т.е. <Tex>{'y = e^{2x} + e^{3x}'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Диференциалното уравнение свързва неизвестна функция с нейните производни; решенията образуват семейство</li>
              <li>✓ Началното условие избира едно решение; полето от направления показва как текат решенията</li>
              <li>✓ Разделяне на променливите: <Tex>{'\\int \\frac{dy}{h(y)} = \\int g(x)\\,dx'}</Tex></li>
              <li>✓ <Tex>{"y' = ky \\Rightarrow y = y_0 e^{kt}"}</Tex>; време за удвояване или полуразпад <Tex>{'\\frac{\\ln 2}{|k|}'}</Tex></li>
              <li>✓ Изстиване: <Tex>{'T = T_s + (T_0 - T_s)e^{-kt}'}</Tex>; трептене: <Tex>{"x'' = -\\omega^2 x \\Rightarrow x = A\\cos(\\omega t + \\varphi)"}</Tex></li>
              <li>✓ Метод на Ойлер: <Tex>{'y_{n+1} = y_n + h \\cdot f(x_n, y_n)'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Прогнозата за времето е решение на огромна система диференциални уравнения за въздуха. Първият опит да се пресметне ръчно е на
              Луис Фрай Ричардсън по време на Първата световна война – той пресмята прогноза за 6 часа напред, а резултатът е силно грешен.
              Ричардсън мечтае за „фабрика за прогнози“ с 64 000 души, които смятат едновременно. Мечтата му се сбъдва с компютрите: през
              1950 г. ENIAC пресмята първата успешна числена прогноза.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
