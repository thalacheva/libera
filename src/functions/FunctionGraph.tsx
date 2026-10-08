import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { InteractiveFunctionGrapher } from './InteractiveFunctionGrapher';
import { ReadGraphLab } from './ReadGraphLab';
import { StretchLab } from './StretchLab';
import { BasicFunctions, TransformExplorer } from './Transformations';
import { VerticalLineLab } from './VerticalLineLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const rules = [
  ['y = f(x) + k', 'нагоре с k (надолу при k < 0)'],
  ['y = f(x − h)', 'надясно с h (наляво при h < 0)'],
  ['y = −f(x)', 'отразяване спрямо оста Ox'],
  ['y = f(−x)', 'отразяване спрямо оста Oy'],
  ['y = a · f(x)', 'разтягане по вертикала (свиване при |a| < 1)'],
  ['y = f(b · x)', 'свиване по хоризонтала b пъти (разтягане при |b| < 1)'],
];

const questions: Question[] = [
  {
    question: 'Как се получава графиката на y = x² + 3 от графиката на y = x²?',
    answers: ['Наляво с 3', 'Надясно с 3', 'Нагоре с 3', 'Надолу с 3'],
    correctAnswer: 'Нагоре с 3',
  },
  {
    question: 'Как се получава графиката на y = |x + 2| от графиката на y = |x|?',
    answers: ['Надясно с 2', 'Наляво с 2', 'Нагоре с 2', 'Надолу с 2'],
    correctAnswer: 'Наляво с 2',
  },
  {
    question: 'Коя е дефиниционната област на y = √(x − 1)?',
    answers: ['x ≥ 0', 'x ≥ 1', 'x ≠ 1', 'всички реални числа'],
    correctAnswer: 'x ≥ 1',
  },
  {
    question: 'Коя от линиите НЕ може да бъде графика на функция?',
    answers: ['Права y = 5', 'Парабола y = x²', 'Окръжност', 'Хипербола y = 1/x'],
    correctAnswer: 'Окръжност',
  },
  {
    question: 'Как се различава графиката на y = 3x² от графиката на y = x²?',
    answers: ['По-широка е', 'По-тясна е – разтегната 3 пъти по вертикала', 'Преместена нагоре с 3', 'Отразена'],
    correctAnswer: 'По-тясна е – разтегната 3 пъти по вертикала',
  },
  {
    question: 'Коя функция е четна?',
    answers: ['y = x³', 'y = x² + 1', 'y = x + 1', 'y = √x'],
    correctAnswer: 'y = x² + 1',
  },
  {
    question: 'Графиките на y = x² и y = x + 2 се пресичат при x = −1 и x = 2. Какво означава това?',
    answers: ['x² + x + 2 = 0 има корени −1 и 2', 'x² = x + 2 има корени −1 и 2', 'Функциите са равни навсякъде', 'Нищо особено'],
    correctAnswer: 'x² = x + 2 има корени −1 и 2',
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
            description="Графиката на функцията y = f(x) е множеството от всички точки (x; f(x)) в координатната система, където x е от дефиниционната област. Дефиниционната област D са допустимите стойности на x (например под корен не може да има отрицателно число, а знаменател не може да е 0), а множеството от стойности са всички y, които функцията приема."
          />
          <p className={`${text} mb-4`}>
            Как само с един поглед да разбереш дали дадена крива е графика на функция? Прекарай мислено вертикална линия и я плъзни отляво
            надясно. Ако някъде тя пресече кривата в две или повече точки, на едно x съответстват няколко y – значи това <em>не е</em>{' '}
            функция.
          </p>
          <VerticalLineLab />
          <Example
            description="Намери дефиниционната област на y = √(x − 2) и на y = 1/(x + 3)."
            steps={['Под корена: x − 2 ≥ 0 ⇒ x ≥ 2, т.е. D = [2; +∞)', 'Знаменателят: x + 3 ≠ 0 ⇒ x ≠ −3, т.е. D = (−∞; −3) ∪ (−3; +∞)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Четене на графика</h2>
          <p className={`${text} mb-4`}>От графиката се четат основните свойства на функцията:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {[
              ['Нули', 'абсцисите на точките, в които графиката пресича оста Ox (f(x) = 0)'],
              ['Знак', 'f(x) > 0 там, където графиката е над оста Ox, и f(x) < 0 – под нея'],
              ['Растене и намаляване', 'растяща – графиката „се изкачва“ отляво надясно; намаляваща – „слиза“'],
              ['Най-голяма и най-малка стойност', 'най-високата и най-ниската точка на графиката'],
            ].map(([name, desc]) => (
              <div key={name} className={card}>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
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
                <p className="font-mono text-blue-700 dark:text-blue-300">{formula}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right">{effect}</p>
              </div>
            ))}
          </div>
          <Theorem
            title="Защо „x − h“ мести надясно?"
            description="Графиката на y = f(x − h) стига до дадена височина точно h единици по-късно от графиката на f: за да е x − h = 0, трябва x = h. Затова минусът в скобите мести графиката надясно, а плюсът – наляво. Промяната извън функцията (+ k) действа направо върху y и мести графиката нагоре или надолу."
            graphic={<TransformExplorer />}
          />
          <Example
            description="Как се получава графиката на y = (x − 2)² − 3 от графиката на y = x²?"
            steps={[
              'Изходната функция е f(x) = x², а търсената е f(x − 2) − 3.',
              '„x − 2“ в скобите мести параболата надясно с 2.',
              '„− 3“ накрая я мести надолу с 3.',
              'Върхът отива от (0; 0) в (2; −3), формата не се променя.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Разтягане, свиване и симетрия</h2>
          <p className={`${text} mb-4`}>
            Освен да местим графиката, можем да я разтягаме. Множител пред функцията действа върху y, а множител пред x – върху x, но
            „наобратно“.
          </p>
          <Theorem
            type="definition"
            title="Четни и нечетни функции"
            description="Функцията f е четна, ако f(−x) = f(x) за всяко x от дефиниционната област – графиката ѝ е симетрична спрямо оста Oy (x², |x|, cos x). Функцията е нечетна, ако f(−x) = −f(x) – графиката е симетрична спрямо началото (x, x³, 1/x, sin x). Дефиниционната област трябва да е симетрична спрямо 0."
          />
          <StretchLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Графично решаване на уравнения</h2>
          <p className={`${text} mb-4`}>
            Решенията на уравнението f(x) = g(x) са абсцисите на пресечните точки на двете графики. Понякога така се вижда отговорът, който
            алгебрично е трудно да намерим – а винаги се вижда <strong>колко</strong> са решенията.
          </p>
          <Example
            description="Колко решения има уравнението |x| = 2 − x²?"
            steps={['Чертаем y = |x| („V“) и y = 2 − x² (парабола „шапка“ с връх (0; 2)).', 'Графиките се пресичат в две точки, симетрични спрямо Oy.', 'При x ≥ 0: x = 2 − x² ⇒ x² + x − 2 = 0 ⇒ x = 1. Симетрично: x = −1.', 'Отговор: две решения, x = ±1.']}
          />
          <p className={`${text} mb-4`}>
            Начертай няколко функции едновременно и сравни графиките им. Опитай например с x² и x + 2 – пресечните точки са решенията на x² =
            x + 2.
          </p>
          <InteractiveFunctionGrapher />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Посоката при f(x − h)', 'y = (x + 3)² е преместена надясно с 3', 'наляво с 3: x + 3 = x − (−3)'],
              ['Множителят пред x', 'y = sin(2x) е разтегната 2 пъти', 'свита 2 пъти – периодът става два пъти по-къс'],
              ['Забравена дефиниционна област', 'y = √(x − 1) е дефинирана за всяко x', 'само за x ≥ 1'],
              ['„Всяка крива е функция“', 'окръжността е графика на функция', 'вертикалата я пресича в две точки – не е'],
            ].map(([title, wrong, right]) => (
              <div key={title} className={card}>
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
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
              <Task id="a1" number={1} color="border-green-500" question="Намери дефиниционната област на y = √(4 − x) и на y = 1/(x − 3).">
                <p>√(4 − x): 4 − x ≥ 0 ⇒ x ≤ 4, D = (−∞; 4]</p>
                <p>1/(x − 3): x ≠ 3, D = (−∞; 3) ∪ (3; +∞)</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Лежат ли точките A(2; 5) и B(−1; 0) на графиката на y = x² + 1?">
                <p>A: 2² + 1 = 5 ✓ – лежи.</p>
                <p>B: (−1)² + 1 = 2 ≠ 0 – не лежи.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Как се получава графиката на y = |x − 1| + 2 от графиката на y = |x|? Коя е най-малката стойност на функцията?">
                <p>Надясно с 1 и нагоре с 2 – върхът на „V“-то отива от (0; 0) в (1; 2).</p>
                <p>Най-малката стойност е 2 (при x = 1).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Кои от функциите са четни и кои нечетни: f(x) = x³ − x, g(x) = x⁴ + x², h(x) = x² + x?">
                <p>f(−x) = −x³ + x = −f(x) ⇒ нечетна</p>
                <p>g(−x) = x⁴ + x² = g(x) ⇒ четна</p>
                <p>h(−x) = x² − x – нито h(x), нито −h(x) ⇒ нито четна, нито нечетна</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Реши графично уравнението x² = x + 2 и провери алгебрично.">
                <p>Параболата y = x² и правата y = x + 2 се пресичат в точките (−1; 1) и (2; 4).</p>
                <p>Алгебрично: x² − x − 2 = 0 ⇒ x₁ = −1, x₂ = 2 ✓</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Опиши как се получава графиката на y = 2(x + 1)² − 3 от графиката на y = x². Къде е върхът?">
                <p>1) Разтягане 2 пъти по вертикала: y = 2x² (по-тясна парабола).</p>
                <p>2) Наляво с 1: y = 2(x + 1)².</p>
                <p>3) Надолу с 3: y = 2(x + 1)² − 3. Върхът е (−1; −3).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Начертай графиката на y = |x² − 4|. Колко решения има уравнението |x² − 4| = a в зависимост от a?">
                <p>Начертаваме y = x² − 4 и отразяваме нагоре частта под оста (между −2 и 2). Получава се „W“ с „гърбица“ (0; 4).</p>
                <p>Пресичаме с хоризонталата y = a:</p>
                <p>a &lt; 0 – 0 решения; a = 0 – 2 (x = ±2); 0 &lt; a &lt; 4 – 4 решения; a = 4 – 3 решения (x = 0, ±2√2); a &gt; 4 – 2 решения.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Дадена е f(x) = 1/(x − 2) + 1. Намери дефиниционната област, множеството от стойности и пресечните точки с осите. Как се получава от y = 1/x?">
                <p>От y = 1/x: надясно с 2 и нагоре с 1. Асимптотите (правите, към които клоновете се приближават) стават x = 2 и y = 1.</p>
                <p>D: x ≠ 2; множество от стойности: y ≠ 1.</p>
                <p>С Ox: 1/(x − 2) = −1 ⇒ x = 1 ⇒ (1; 0). С Oy: f(0) = −1/2 + 1 = 1/2 ⇒ (0; 1/2).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Функцията f е такава, че f(x) + 2f(−x) = x² + 3x за всяко x. Намери f(x).">
                <p>Заместваме x с −x: f(−x) + 2f(x) = x² − 3x.</p>
                <p>Нека A = f(x), B = f(−x): A + 2B = x² + 3x и 2A + B = x² − 3x.</p>
                <p>Удвояваме второто и изваждаме първото: 3A = x² − 9x ⇒ f(x) = (x² − 9x)/3.</p>
                <p>Проверка: (x² − 9x)/3 + 2(x² + 9x)/3 = (3x² + 9x)/3 = x² + 3x ✓</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Графиката е множеството от точки (x; f(x)); вертикалата я пресича най-много в една точка</li>
              <li>✓ Дефиниционна област: под корен ≥ 0, знаменател ≠ 0</li>
              <li>✓ От графиката четем нули, знак, растене/намаляване, най-голяма и най-малка стойност</li>
              <li>✓ f(x − h) + k – преместване; −f(x), f(−x) – отразяване; a·f(x), f(bx) – разтягане и свиване</li>
              <li>✓ Четна: f(−x) = f(x), симетрия спрямо Oy; нечетна: f(−x) = −f(x), симетрия спрямо началото</li>
              <li>✓ Решенията на f(x) = g(x) са абсцисите на пресечните точки на графиките</li>
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
