import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { InteractiveFunctionGrapher } from './InteractiveFunctionGrapher';
import { ReadGraphLab } from './ReadGraphLab';
import { StretchLab } from './StretchLab';
import { BasicFunctions, TransformExplorer } from './Transformations';
import { VerticalLineLab } from './VerticalLineLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const rules = [
  ['$y = f(x) + k$', 'нагоре с $k$ (надолу при $k < 0$)'],
  ['$y = f(x - h)$', 'надясно с $h$ (наляво при $h < 0$)'],
  ['$y = -f(x)$', 'отразяване спрямо оста Ox'],
  ['$y = f(-x)$', 'отразяване спрямо оста Oy'],
  ['$y = a \\cdot f(x)$', 'разтягане по вертикала (свиване при $|a| < 1$)'],
  ['$y = f(b \\cdot x)$', 'свиване по хоризонтала $b$ пъти (разтягане при $|b| < 1$)'],
];

const questions: Question[] = [
  {
    question: 'Как се получава графиката на $y = x^2 + 3$ от графиката на $y = x^2$?',
    answers: ['Наляво с 3', 'Надясно с 3', 'Нагоре с 3', 'Надолу с 3'],
    correctAnswer: 'Нагоре с 3',
  },
  {
    question: 'Как се получава графиката на $y = |x + 2|$ от графиката на $y = |x|$?',
    answers: ['Надясно с 2', 'Наляво с 2', 'Нагоре с 2', 'Надолу с 2'],
    correctAnswer: 'Наляво с 2',
  },
  {
    question: 'Коя е дефиниционната област на $y = \\sqrt{x - 1}$?',
    answers: ['$x \\ge 0$', '$x \\ge 1$', '$x \\ne 1$', 'всички реални числа'],
    correctAnswer: '$x \\ge 1$',
  },
  {
    question: 'Коя от линиите НЕ може да бъде графика на функция?',
    answers: ['Права $y = 5$', 'Парабола $y = x^2$', 'Окръжност $x^2 + y^2 = 1$', 'Хипербола $y = \\frac{1}{x}$'],
    correctAnswer: 'Окръжност $x^2 + y^2 = 1$',
  },
  {
    question: 'Как се различава графиката на $y = 3x^2$ от графиката на $y = x^2$?',
    answers: ['По-широка е', 'По-тясна е – разтегната 3 пъти по вертикала', 'Преместена нагоре с 3', 'Отразена'],
    correctAnswer: 'По-тясна е – разтегната 3 пъти по вертикала',
  },
  {
    question: 'Коя функция е четна?',
    answers: ['$y = x^3$', '$y = x^2 + 1$', '$y = x + 1$', '$y = \\sqrt{x}$'],
    correctAnswer: '$y = x^2 + 1$',
  },
  {
    question: 'Графиките на $y = x^2$ и $y = x + 2$ се пресичат при $x = -1$ и $x = 2$. Какво означава това?',
    answers: ['$x^2 + x + 2 = 0$ има корени −1 и 2', '$x^2 = x + 2$ има корени −1 и 2', 'Функциите са равни навсякъде', 'Нищо особено'],
    correctAnswer: '$x^2 = x + 2$ има корени −1 и 2',
  },
];

export function FunctionGraph() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Графики на функции</h1>

        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            📈 Около 1350 г. френският учен и епископ Никола Орем има странна идея: да нарисува как се променя скоростта на тяло с времето.
            Хоризонтално нанася времето, вертикално – скоростта, и получава фигура, чието лице е изминатият път. Това е една от първите графики
            в историята – три века преди Декарт и координатната система. Днес графиките са навсякъде: температурата за седмицата, курсът на
            валутата, пулсът на кардиомонитора. Който умее да ги чете, вижда с един поглед това, което таблицата крие.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е графика на функция?</h2>
          <Theorem
            type="definition"
            title="Графика на функция"
            description="Графиката на функцията $y = f(x)$ е множеството от всички точки $(x; f(x))$ в координатната система, където $x$ е от дефиниционната област. Дефиниционната област $D$ са допустимите стойности на $x$ (например под корен не може да има отрицателно число, а знаменател не може да е 0), а множеството от стойности са всички $y$, които функцията приема."
          />
          <p className={`${text} mb-4`}>
            Как само с един поглед да разбереш дали дадена крива е графика на функция? Прекарай мислено вертикална линия и я плъзни отляво
            надясно. Ако някъде тя пресече кривата в две или повече точки, на едно <Tex>{'x'}</Tex> съответстват няколко <Tex>{'y'}</Tex> – значи това <em>не е</em>{' '}
            функция.
          </p>
          <VerticalLineLab />
          <Example
            description="Намери дефиниционната област на $y = \sqrt{x - 2}$ и на $y = \frac{1}{x + 3}$."
            steps={['Под корена: $x - 2 \\ge 0 \\Rightarrow x \\ge 2$, т.е. $D = [2;\\ +\\infty)$', 'Знаменателят: $x + 3 \\ne 0 \\Rightarrow x \\ne -3$, т.е. $D = (-\\infty ;\\ -3) \\cup (-3;\\ +\\infty)$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Четене на графика</h2>
          <p className={`${text} mb-4`}>От графиката се четат основните свойства на функцията:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {[
              ['Нули', 'абсцисите на точките, в които графиката пресича оста Ox ($f(x) = 0$)'],
              ['Знак', '$f(x) > 0$ там, където графиката е над оста Ox, и $f(x) < 0$ – под нея'],
              ['Растене и намаляване', 'растяща – графиката „се изкачва“ отляво надясно; намаляваща – „слиза“'],
              ['Най-голяма и най-малка стойност', 'най-високата и най-ниската точка на графиката'],
            ].map(([name, desc]) => (
              <div key={name} className={card}>
                <p className="font-semibold text-gray-800 dark:text-gray-100"><MathText>{name}</MathText></p>
                <p className="text-sm text-gray-600 dark:text-gray-400"><MathText>{desc}</MathText></p>
              </div>
            ))}
          </div>
          <ReadGraphLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Основни функции</h2>
          <p className={`${text} mb-4`}>
            Тези шест графики са „азбуката“ – повечето функции, които ще срещнеш, се получават от тях с преместване, отразяване или разтягане.
            Струва си да ги разпознаваш от пръв поглед.
          </p>
          <BasicFunctions />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Преместване и отразяване</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {rules.map(([formula, effect]) => (
              <div key={formula} className={`${card} flex items-baseline justify-between gap-3`}>
                <p className="font-mono text-blue-700 dark:text-blue-300"><MathText>{formula}</MathText></p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right"><MathText>{effect}</MathText></p>
              </div>
            ))}
          </div>
          <Theorem
            title="Защо „$x - h$“ мести надясно?"
            description="Графиката на $y = f(x - h)$ стига до дадена височина точно $h$ единици по-късно от графиката на $f$: за да е $x - h = 0$, трябва $x = h$. Затова минусът в скобите мести графиката надясно, а плюсът – наляво. Промяната извън функцията ($+ k$) действа направо върху $y$ и мести графиката нагоре или надолу."
            graphic={<TransformExplorer />}
          />
          <Example
            description="Как се получава графиката на $y = (x - 2)^2 - 3$ от графиката на $y = x^2$?"
            steps={[
              'Изходната функция е $f(x) = x^2$, а търсената е $f(x - 2) - 3$.',
              '„$x - 2$“ в скобите мести параболата надясно с 2.',
              '„$- 3$“ накрая я мести надолу с 3.',
              'Върхът отива от $(0; 0)$ в $(2; -3)$, формата не се променя.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Разтягане, свиване и симетрия</h2>
          <p className={`${text} mb-4`}>
            Освен да местим графиката, можем да я разтягаме. Множител пред функцията действа върху <Tex>{'y'}</Tex>, а множител пред <Tex>{'x'}</Tex> – върху <Tex>{'x'}</Tex>, но
            „наобратно“.
          </p>
          <Theorem
            type="definition"
            title="Четни и нечетни функции"
            description="Функцията $f$ е четна, ако $f(-x) = f(x)$ за всяко $x$ от дефиниционната област – графиката ѝ е симетрична спрямо оста Oy ($x^2$, $|x|$, $\cos x$). Функцията е нечетна, ако $f(-x) = -f(x)$ – графиката е симетрична спрямо началото ($x$, $x^3$, $\frac{1}{x}$, $\sin x$). Дефиниционната област трябва да е симетрична спрямо 0."
          />
          <StretchLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Графично решаване на уравнения</h2>
          <p className={`${text} mb-4`}>
            Решенията на уравнението <Tex>{'f(x) = g(x)'}</Tex> са абсцисите на пресечните точки на двете графики. Понякога така се вижда отговорът, който
            алгебрично е трудно да намерим – а винаги се вижда <strong>колко</strong> са решенията.
          </p>
          <Example
            description="Колко решения има уравнението $|x| = 2 - x^2$?"
            steps={['Чертаем $y = |x|$ („V“) и $y = 2 - x^2$ (парабола „шапка“ с връх $(0; 2)$).', 'Графиките се пресичат в две точки, симетрични спрямо Oy.', 'При $x \\ge 0$: $x = 2 - x^2 \\Rightarrow x^2 + x - 2 = 0 \\Rightarrow x = 1$. Симетрично: $x = -1$.', 'Отговор: две решения, $x = \\pm 1$.']}
          />
          <p className={`${text} mb-4`}>
            Начертай няколко функции едновременно и сравни графиките им. Опитай например с <Tex>{'x^2'}</Tex> и <Tex>{'x + 2'}</Tex> – пресечните точки са решенията на <Tex>{'x^2 = x + 2'}</Tex>.
          </p>
          <InteractiveFunctionGrapher />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Посоката при $f(x - h)$', '$y = (x + 3)^2$ е преместена надясно с 3', 'наляво с 3: $x + 3 = x - (-3)$'],
              ['Множителят пред $x$', '$y = \\sin (2x)$ е разтегната 2 пъти', 'свита 2 пъти – периодът става два пъти по-къс'],
              ['Забравена дефиниционна област', '$y = \\sqrt{x - 1}$ е дефинирана за всяко $x$', 'само за $x \\ge 1$'],
              ['„Всяка крива е функция“', 'окръжността е графика на функция', 'вертикалата я пресича в две точки – не е'],
            ].map(([title, wrong, right]) => (
              <div key={title} className={card}>
                <p className="font-semibold mb-1"><MathText displayStyle>{title}</MathText></p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ <MathText displayStyle>{wrong}</MathText></p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ <MathText displayStyle>{right}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. 🎯 Бърз тест</h2>
          <Quiz questions={questions} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намери дефиниционната област на $y = \sqrt{4 - x}$ и на $y = \frac{1}{x - 3}$.">
                <p><Tex>{'\\sqrt{4 - x}'}</Tex>: <Tex>{'4 - x \\ge 0 \\Rightarrow x \\le 4'}</Tex>, <Tex>{'D = (-\\infty ;\\ 4]'}</Tex></p>
                <p><Tex>{'\\frac{1}{x - 3}'}</Tex>: <Tex>{'x \\ne 3'}</Tex>, <Tex>{'D = (-\\infty ;\\ 3) \\cup (3;\\ +\\infty)'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Лежат ли точките $A(2;\ 5)$ и $B(-1;\ 0)$ на графиката на $y = x^2 + 1$?">
                <p><Tex>{'A'}</Tex>: <Tex>{'2^2 + 1 = 5'}</Tex> ✓ – лежи.</p>
                <p><Tex>{'B'}</Tex>: <Tex>{'(-1)^2 + 1 = 2 \\ne 0'}</Tex> – не лежи.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Как се получава графиката на $y = |x - 1| + 2$ от графиката на $y = |x|$? Коя е най-малката стойност на функцията?">
                <p>Надясно с 1 и нагоре с 2 – върхът на „V“-то отива от <Tex>{'(0; 0)'}</Tex> в <Tex>{'(1; 2)'}</Tex>.</p>
                <p>Най-малката стойност е 2 (при <Tex>{'x = 1'}</Tex>).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Кои от функциите са четни и кои нечетни: $f(x) = x^3 - x,\ g(x) = x^4 + x^2,\ h(x) = x^2 + x$?">
                <p><Tex>{'f(-x) = -x^3 + x = -f(x) \\Rightarrow'}</Tex> нечетна</p>
                <p><Tex>{'g(-x) = x^4 + x^2 = g(x) \\Rightarrow'}</Tex> четна</p>
                <p><Tex>{'h(-x) = x^2 - x'}</Tex> – нито <Tex>{'h(x)'}</Tex>, нито <Tex>{'-h(x) \\Rightarrow'}</Tex> нито четна, нито нечетна</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Реши графично уравнението $x^2 = x + 2$ и провери алгебрично.">
                <p>Параболата <Tex>{'y = x^2'}</Tex> и правата <Tex>{'y = x + 2'}</Tex> се пресичат в точките <Tex>{'(-1;\\ 1)'}</Tex> и <Tex>{'(2;\\ 4)'}</Tex>.</p>
                <p>Алгебрично: <Tex>{'x^2 - x - 2 = 0 \\Rightarrow x_1 = -1,\\ x_2 = 2'}</Tex> ✓</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Опиши как се получава графиката на $y = 2(x + 1)^2 - 3$ от графиката на $y = x^2$. Къде е върхът?">
                <p>1) Разтягане 2 пъти по вертикала: <Tex>{'y = 2x^2'}</Tex> (по-тясна парабола).</p>
                <p>2) Наляво с 1: <Tex>{'y = 2(x + 1)^2'}</Tex>.</p>
                <p>3) Надолу с 3: <Tex>{'y = 2(x + 1)^2 - 3'}</Tex>. Върхът е <Tex>{'(-1; -3)'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Начертай графиката на $y = |x^2 - 4|$. Колко решения има уравнението $|x^2 - 4| = a$ в зависимост от $a$?">
                <p>Начертаваме <Tex>{'y = x^2 - 4'}</Tex> и отразяваме нагоре частта под оста (между −2 и 2). Получава се „W“ с „гърбица“ <Tex>{'(0; 4)'}</Tex>.</p>
                <p>Пресичаме с хоризонталата <Tex>{'y = a'}</Tex>:</p>
                <p><Tex>{'a < 0'}</Tex> – 0 решения; <Tex>{'a = 0'}</Tex> – 2 (<Tex>{'x = \\pm 2'}</Tex>); <Tex>{'0 < a < 4'}</Tex> – 4 решения; <Tex>{'a = 4'}</Tex> – 3 решения (<Tex>{'x = 0,\\ \\pm 2\\sqrt{2}'}</Tex>); <Tex>{'a > 4'}</Tex> – 2 решения.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Дадена е $f(x) = \frac{1}{x - 2} + 1$. Намери дефиниционната област, множеството от стойности и пресечните точки с осите. Как се получава от $y = \frac{1}{x}$?">
                <p>От <Tex>{'y = \\frac{1}{x}'}</Tex>: надясно с 2 и нагоре с 1. Асимптотите (правите, към които клоновете се приближават) стават <Tex>{'x = 2'}</Tex> и <Tex>{'y = 1'}</Tex>.</p>
                <p><Tex>{'D'}</Tex>: <Tex>{'x \\ne 2'}</Tex>; множество от стойности: <Tex>{'y \\ne 1'}</Tex>.</p>
                <p>С Ox: <Tex>{'\\frac{1}{x - 2} = -1 \\Rightarrow x = 1 \\Rightarrow (1;\\ 0)'}</Tex>. С Oy: <Tex>{'f(0) = -\\frac{1}{2} + 1 = \\frac{1}{2} \\Rightarrow \\left(0; \\frac{1}{2}\\right)'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Функцията $f$ е такава, че $f(x) + 2f(-x) = x^2 + 3x$ за всяко $x$. Намери $f(x)$.">
                <p>Заместваме <Tex>{'x'}</Tex> с <Tex>{'-x'}</Tex>: <Tex>{'f(-x) + 2f(x) = x^2 - 3x'}</Tex>.</p>
                <p>Нека <Tex>{'A = f(x),\\ B = f(-x)'}</Tex>: <Tex>{'A + 2B = x^2 + 3x'}</Tex> и <Tex>{'2A + B = x^2 - 3x'}</Tex>.</p>
                <p>Удвояваме второто и изваждаме първото: <Tex>{'3A = x^2 - 9x \\Rightarrow f(x) = \\frac{x^2 - 9x}{3}'}</Tex>.</p>
                <p>Проверка: <Tex>{'\\frac{x^2 - 9x}{3} + \\frac{2(x^2 + 9x)}{3} = \\frac{3x^2 + 9x}{3} = x^2 + 3x'}</Tex> ✓</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Графиката е множеството от точки (x; f(x)); вертикалата я пресича най-много в една точка</li>
              <li>✓ Дефиниционна област: под корен <Tex>{'\\ge 0'}</Tex>, знаменател <Tex>{'\\ne 0'}</Tex></li>
              <li>✓ От графиката четем нули, знак, растене/намаляване, най-голяма и най-малка стойност</li>
              <li>✓ <Tex>{'f(x - h) + k'}</Tex> – преместване; <Tex>{'-f(x),\\ f(-x)'}</Tex> – отразяване; <Tex>{'a\\cdot f(x),\\ f(bx)'}</Tex> – разтягане и свиване</li>
              <li>✓ Четна: <Tex>{'f(-x) = f(x)'}</Tex>, симетрия спрямо Oy; нечетна: <Tex>{'f(-x) = -f(x)'}</Tex>, симетрия спрямо началото</li>
              <li>✓ Решенията на <Tex>{'f(x) = g(x)'}</Tex> са абсцисите на пресечните точки на графиките</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Една от най-известните графики в историята е картата на Шарл Жозеф Минар (1869 г.) за похода на Наполеон към Москва през 1812 г.
              Дебелината на лентата показва броя на войниците – от 422 000 при тръгването до около 10 000 при завръщането, а под нея е
              графиката на температурата при отстъплението, падаща до −30 градуса по скалата на Реомюр (около −37 °C). Само с една рисунка Минар разказва цялата трагедия – затова тя и
              днес се показва като пример за това колко силна може да бъде една графика.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
