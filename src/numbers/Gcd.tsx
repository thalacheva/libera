import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Drill, gcd, pick, randInt } from '~/drill';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import EuclidLab from './EuclidLab';
import JugsLab from './JugsLab';
import LatticeLineLab from './LatticeLineLab';
import { factorize } from './numberMath';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const canonicalTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\cdot ');

/** Двойка различни взаимно прости числа от интервала. */
function coprimePair(min: number, max: number) {
  let [m, n] = [0, 0];
  while (m === n || gcd(m, n) !== 1) [m, n] = [randInt(min, max), randInt(min, max)];
  return [m, n];
}

/** Стъпките на алгоритъма на Евклид като редове „a = q · b + r“. */
function euclidSteps(a: number, b: number) {
  const rows: string[] = [];
  while (b > 0) {
    rows.push(`${a} = ${Math.floor(a / b)} \\cdot ${b} + ${a % b}`);
    [a, b] = [b, a % b];
  }
  return rows;
}

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const g = randInt(2, 30);
    const [m, n] = coprimePair(2, 15);
    const [a, b] = [g * Math.max(m, n), g * Math.min(m, n)];
    return {
      tex: `\\text{НОД}(${a},\\ ${b})`,
      ask: '= ?',
      num: g,
      den: 1,
      steps: ['Алгоритъм на Евклид:', ...euclidSteps(a, b).map(r => `$${r}$`), `Последният ненулев остатък е ${g}.`],
    };
  }
  if (kind === 1) {
    let [a, b] = [0, 0];
    while (a === b) [a, b] = [randInt(4, 40), randInt(4, 40)];
    const l = (a * b) / gcd(a, b);
    return {
      tex: `\\text{НОК}(${a},\\ ${b})`,
      ask: '= ?',
      num: l,
      den: 1,
      steps: [`$${a} = ${canonicalTex(a)}$, $${b} = ${canonicalTex(b)}$`, `Вземаме всяко просто число с по-големия показател: $\\text{НОК} = ${canonicalTex(l)} = ${l}$`],
    };
  }
  if (kind === 2) {
    const g = randInt(2, 12);
    const [m, n] = coprimePair(2, 9);
    const [a, b, l] = [g * m, g * n, g * m * n];
    return {
      tex: `\\text{НОД}(${a},\\ b) = ${g}, \\quad \\text{НОК}(${a},\\ b) = ${l}`,
      ask: 'Колко е $b$?',
      num: b,
      den: 1,
      steps: [`$\\text{НОД}(a,\\ b) \\cdot \\text{НОК}(a,\\ b) = a \\cdot b$`, `$b = \\frac{${g} \\cdot ${l}}{${a}} = ${b}$`],
    };
  }
  if (kind === 3) {
    const [a, b] = coprimePair(2, 9);
    const c = randInt(20, 70);
    const sols: [number, number][] = [];
    for (let x = 1; a * x < c; x++) if ((c - a * x) % b === 0) sols.push([x, (c - a * x) / b]);
    return {
      tex: `${a}x + ${b}y = ${c}`,
      ask: 'Колко решения има в естествени числа?',
      num: sols.length,
      den: 1,
      steps: [
        `Пробваме $x = 1, 2, \\ldots$, докато $${a}x < ${c}$, и проверяваме дали $${c} - ${a}x$ се дели на ${b}.`,
        sols.length ? `Решения: ${sols.map(([x, y]) => `$(${x};\\ ${y})$`).join(', ')}` : 'Няма решения в естествени числа.',
        ...(sols.length > 1 ? [`Съседните решения се различават с $${b}$ по $x$ и с $${a}$ по $y$.`] : []),
      ],
    };
  }
  const g = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
  let ks = [0, 0, 0];
  while (new Set(ks).size < 3 || gcd(gcd(ks[0], ks[1]), ks[2]) !== 1) ks = [randInt(2, 12), randInt(2, 12), randInt(2, 12)];
  const [a, b, c] = ks.map(k => k * g);
  return {
    tex: `\\text{НОД}(${a},\\ ${b},\\ ${c})`,
    ask: '= ?',
    num: g,
    den: 1,
    steps: [`$\\text{НОД}(a,\\ b,\\ c) = \\text{НОД}(\\text{НОД}(a,\\ b),\\ c)$`, `$\\text{НОД}(${a},\\ ${b}) = ${gcd(a, b)}$, $\\text{НОД}(${gcd(a, b)},\\ ${c}) = ${g}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🍫 Еднакви пакети',
    problem: 'Учителка има 84 шоколада и 126 бонбона и иска да ги раздели в еднакви пакети, без да остане нищо. Най-много колко пакета може да направи и колко шоколада и бонбона ще има във всеки?',
    solution: ['Броят на пакетите дели и 84, и 126 – търсим $\\text{НОД}(84,\\ 126)$.', '$126 = 1 \\cdot 84 + 42$, $84 = 2 \\cdot 42$ ⇒ НОД = 42', 'Във всеки пакет: $84 : 42 = 2$ шоколада и $126 : 42 = 3$ бонбона.'],
    answer: '42 пакета по 2 шоколада и 3 бонбона',
    check: [42, 2, 3],
    ask: ['пакета', 'шоколада', 'бонбона'],
  },
  {
    title: '🚌 Два автобуса',
    problem: 'Автобус 94 тръгва от спирката на всеки 12 минути, а автобус 280 – на всеки 18 минути. В 8:00 тръгват заедно. След колко минути отново ще тръгнат заедно?',
    solution: ['Търсим най-малкото общо кратно на 12 и 18.', '$12 = 2^2 \\cdot 3$, $18 = 2 \\cdot 3^2$ ⇒ $\\text{НОК} = 2^2 \\cdot 3^2 = 36$', 'Заедно отново в 8:36.'],
    answer: 'След 36 минути (в 8:36)',
    check: [36],
    ask: ['минути'],
  },
  {
    title: '🧱 Плочки за пода',
    problem: 'Под с размери 360 × 240 cm трябва да се покрие с еднакви квадратни плочки, без да се режат. Каква е най-голямата възможна страна на плочката и колко плочки ще трябват?',
    solution: ['Страната дели и 360, и 240: $\\text{НОД}(360,\\ 240) = 120$ cm.', 'По дължина: $360 : 120 = 3$, по ширина: $240 : 120 = 2$.', 'Трябват $3 \\cdot 2 = 6$ плочки.'],
    answer: '120 cm, 6 плочки',
    check: [120, 6],
    ask: ['страна, cm', 'плочки'],
  },
  {
    title: '⚙️ Зъбни колела',
    problem: 'Две зъбни колела са захванати: малкото има 24 зъба, голямото – 36. След колко пълни оборота на малкото колело двете ще застанат отново в началното положение? А голямото колко оборота ще е направило?',
    solution: ['Двете колела „изминават“ еднакъв брой зъби. Търсим $\\text{НОК}(24,\\ 36) = 72$ зъба.', 'Малкото: $72 : 24 = 3$ оборота; голямото: $72 : 36 = 2$ оборота.'],
    answer: '3 оборота на малкото, 2 на голямото',
    check: [3, 2],
    ask: ['малкото', 'голямото'],
  },
  {
    title: '🪣 Кани от 6 и 9 литра',
    problem: 'С кани от 6 и 9 литра (без деления) и неограничено количество вода кое е най-малкото количество, което може да се отмери точно?',
    solution: ['Всяко отмерено количество е от вида $6x + 9y$ с цели $x$ и $y$.', 'Такива числа са точно кратните на $\\text{НОД}(6,\\ 9) = 3$.', 'Най-малкото е 3 литра: напълваме 9-литровата и преливаме в 6-литровата.'],
    answer: '3 литра',
    check: [3],
    ask: ['литра'],
  },
  {
    title: '💶 Банкноти и монети',
    problem: 'Трябва да платите точно 23 € само с банкноти по 5 € и монети по 2 € (без ресто). По колко начина може да стане?',
    solution: ['Решаваме $2x + 5y = 23$ в цели неотрицателни числа.', '$23 - 5y$ трябва да е четно ⇒ $y$ е нечетно: $y = 1 \\Rightarrow x = 9$; $y = 3 \\Rightarrow x = 4$; $y = 5$ е твърде много.', 'Два начина: 9 монети и 1 банкнота или 4 монети и 3 банкноти.'],
    answer: '2 начина',
    check: [2],
    ask: ['начина'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'На колко е равно $\\text{НОД}(12,\\ 18)$?',
    answers: ['$6$', '$3$', '$36$', '$2$'],
    correctAnswer: '$6$',
  },
  {
    question: 'На колко е равно $\\text{НОК}(4,\\ 6)$?',
    answers: ['$12$', '$24$', '$2$', '$10$'],
    correctAnswer: '$12$',
  },
  {
    question: 'На колко е равно $\\text{НОД}(a,\\ b) \\cdot \\text{НОК}(a,\\ b)$?',
    answers: ['$a \\cdot b$', '$a + b$', '$\\text{НОК}(a,\\ b)^2$', '$1$'],
    correctAnswer: '$a \\cdot b$',
  },
  {
    question: 'Кои числа са взаимно прости?',
    answers: ['$8$ и $15$', '$6$ и $15$', '$12$ и $18$', '$14$ и $21$'],
    correctAnswer: '$8$ и $15$',
  },
  {
    question: 'На колко е равно $\\text{НОД}(17,\\ 51)$?',
    answers: ['$17$', '$1$', '$3$', '$51$'],
    correctAnswer: '$17$',
  },
  {
    question: 'Има ли уравнението $6x + 9y = 4$ цели решения?',
    answers: ['не, защото 3 не дели 4', 'да, безброй много', 'да, точно едно', 'да, но само отрицателни'],
    correctAnswer: 'не, защото 3 не дели 4',
  },
  {
    question: 'На кое равенство се основава алгоритъмът на Евклид ($r$ е остатъкът при деление на $a$ на $b$)?',
    answers: ['$\\text{НОД}(a,\\ b) = \\text{НОД}(b,\\ r)$', '$\\text{НОД}(a,\\ b) = \\text{НОД}(a,\\ r)$', '$\\text{НОД}(a,\\ b) = r$', '$\\text{НОД}(a,\\ b) = a - b$'],
    correctAnswer: '$\\text{НОД}(a,\\ b) = \\text{НОД}(b,\\ r)$',
  },
  {
    question: 'На колко е равно $\\text{НОД}(2^3 \\cdot 3^2 \\cdot 5,\\ 2^2 \\cdot 3^4 \\cdot 7)$?',
    answers: ['$36$', '$72$', '$12$', '$1$'],
    correctAnswer: '$36$',
  },
  {
    question: 'Кое е най-малкото число, което се дели на всяко от числата 1, 2, …, 10?',
    answers: ['$2520$', '$3628800$', '$5040$', '$1260$'],
    correctAnswer: '$2520$',
  },
];

// ---------- Страница ----------

export function Gcd() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">НОД и НОК</h1>

        <div className="bg-gradient-to-br from-sky-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚙️ В книга VII на „Елементи“ (около 300 г. пр.н.е.) Евклид описва как да намерим най-големия общ делител на две числа:
            изваждай по-малкото от по-голямото, докато двете не станат равни. Повече от две хиляди години по-късно Доналд Кнут – един от
            основателите на компютърните науки – го нарича „най-стария нетривиален алгоритъм, оцелял до наши дни“. И той наистина е
            оцелял: днес твоят телефон го изпълнява милиони пъти, когато се свързва защитено с банка или изпраща шифровано съобщение.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Най-голям общ делител и най-малко общо кратно</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Имаш две пръчки – 21 cm и 15 cm. Каква е най-дългата линийка без деления, с която можеш да
              измериш точно и двете? Отговорът е 3 cm – и има начин да го намериш, без да разлагаш числата на множители.
            </p>
          </div>
          <Theorem
            type="definition"
            title="НОД и НОК"
            description="Най-големият общ делител $\text{НОД}(a,\ b)$ е най-голямото число, което дели и $a$, и $b$. Най-малкото общо кратно $\text{НОК}(a,\ b)$ е най-малкото естествено число, което се дели и на $a$, и на $b$. Числа с $\text{НОД} = 1$ се наричат взаимно прости – например 8 и 15, макар нито едно от тях да не е просто."
          />
          <Theorem
            title="С разлагане на прости множители"
            description="НОД е произведението на общите прости множители с по-малкия показател, а НОК – на всички прости множители с по-големия показател. Например $72 = 2^3 \cdot 3^2$ и $60 = 2^2 \cdot 3 \cdot 5$: $\text{НОД} = 2^2 \cdot 3 = 12$, $\text{НОК} = 2^3 \cdot 3^2 \cdot 5 = 360$. Винаги $\text{НОД}(a,\ b) \cdot \text{НОК}(a,\ b) = a \cdot b$."
          />
          <p className={text}>
            Разлагането е обяснено в урока{' '}
            <Link to="/numbers/divisibility" className={link}>
              Делимост и прости числа
            </Link>
            . С НОК намираме и общ знаменател на дроби (виж{' '}
            <Link to="/algebra/fractions" className={link}>
              Дроби и проценти
            </Link>
            ), а с НОД ги съкращаваме.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Алгоритъм на Евклид</h2>
          <p className={text}>
            Разлагането на големи числа е трудно. Евклид забелязва, че всеки общ делител на <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> дели и
            разликата им – а значи и остатъка при деление. Така задачата за големите числа се свежда до същата задача за по-малки.
          </p>
          <Theorem
            title="Алгоритъм на Евклид"
            description="Ако $a = bq + r$, $0 \le r < b$, то $\text{НОД}(a,\ b) = \text{НОД}(b,\ r)$. Повтаряме деленията с остатък, докато остатъкът стане 0; последният ненулев остатък е НОД."
          />
          <EuclidLab />
          <Example
            description="Да намерим $\text{НОД}(1071,\ 462)$ – примерът, с който Евклид често се илюстрира в учебниците."
            steps={['$1071 = 2 \\cdot 462 + 147$', '$462 = 3 \\cdot 147 + 21$', '$147 = 7 \\cdot 21 + 0$', 'Последният ненулев остатък е 21: $\\text{НОД}(1071,\\ 462) = 21$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Тъждество на Безу</h2>
          <Theorem
            title="Тъждество на Безу"
            description="За всеки цели $a$ и $b$ (не и двете нули) има цели $x$ и $y$, за които $ax + by = \text{НОД}(a,\ b)$. Нещо повече – числата от вида $ax + by$ са точно кратните на НОД."
          />
          <p className={text}>
            Числата <Tex>{'x'}</Tex> и <Tex>{'y'}</Tex> се намират, като „развием“ алгоритъма на Евклид отзад напред – това е
            разширеният алгоритъм на Евклид. Тъждеството обяснява и прочутата задача с каните: всяко количество, което можем да отмерим с кани{' '}
            <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> литра, е от вида <Tex>{'ax + by'}</Tex>.
          </p>
          <Example
            description="Да намерим цели $x$ и $y$ с $7x + 12y = 1$."
            steps={[
              'Евклид: $12 = 1 \\cdot 7 + 5$, $7 = 1 \\cdot 5 + 2$, $5 = 2 \\cdot 2 + 1$',
              'Отзад напред: $1 = 5 - 2 \\cdot 2 = 5 - 2(7 - 5) = 3 \\cdot 5 - 2 \\cdot 7$',
              '$= 3(12 - 7) - 2 \\cdot 7 = 3 \\cdot 12 - 5 \\cdot 7$ ⇒ $x = -5$, $y = 3$ (проверка: $-35 + 36 = 1$ ✓)',
            ]}
          />
          <JugsLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Линейни диофантови уравнения</h2>
          <Theorem
            title="Уравнението $ax + by = c$ в цели числа"
            description="Нека $d = \text{НОД}(a,\ b)$. Уравнението има цели решения точно когато $d \mid c$. Ако $(x_0;\ y_0)$ е едно решение, всички решения са $x = x_0 + \frac{b}{d}t$, $y = y_0 - \frac{a}{d}t$, $t \in \mathbb{Z}$."
          />
          <LatticeLineLab />
          <Example
            description="Да решим $3x + 5y = 47$ в естествени числа."
            steps={[
              'Едно решение: $x = 14$, $y = 1$ ($42 + 5 = 47$).',
              'Всички цели решения: $x = 14 - 5t$, $y = 1 + 3t$.',
              'И двете са положителни при $t = 0, 1, 2$: $(14;\\ 1)$, $(9;\\ 4)$, $(4;\\ 7)$ – три решения.',
            ]}
          />
          <p className={text}>
            Уравнения, в които търсим само цели решения, се наричат <strong>диофантови</strong> – по името на Диофант от Александрия
            (III век), който пръв ги изучава систематично.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 5. Тренажор
          </h2>
          <p className={text}>НОД, НОК и диофантови уравнения – с алгоритъма на Евклид или с разлагане.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Пробвай с алгоритъма на Евклид или с разлагане на прости множители." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. НОД и НОК около нас</h2>
          <p className={text}>
            НОД отговаря на въпроса „на колко еднакви части можем да разделим“, а НОК – „кога нещата отново ще съвпаднат“: разписания,
            зъбни колела, музикални ритми, повтарящи се затъмнения (виж{' '}
            <Link to="/astronomy/lecture05" className={link}>
              Слънчеви затъмнения
            </Link>
            ).
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['НОК като произведение', '$\\text{НОК}(4,\\ 6) = 24$', '$\\text{НОК}(4,\\ 6) = 12$; произведението е НОК само за взаимно прости числа'],
              ['Показателите', 'НОД с по-големите показатели', 'НОД – по-малките, НОК – по-големите показатели'],
              ['Взаимно прости', '8 и 9 не са взаимно прости, защото не са прости', '$\\text{НОД}(8,\\ 9) = 1$ – взаимно прости са'],
              ['Евклид с грешна двойка', '$\\text{НОД}(a,\\ b) = \\text{НОД}(a,\\ r)$', '$\\text{НОД}(a,\\ b) = \\text{НОД}(b,\\ r)$'],
              ['Уравнение без решение', '$4x + 6y = 5$ има цели решения', '$\\text{НОД}(4,\\ 6) = 2$ не дели 5 – няма'],
              ['Само едно решение', '$3x + 5y = 47$ има решение $(14;\\ 1)$ и толкова', 'решенията са безброй: $(14 - 5t;\\ 1 + 3t)$'],
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
          <h2 className={h2}>8. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намерете НОД и НОК на 252 и 198." check={[18, 2772]} ask={['НОД', 'НОК']}>
                <p><Tex>{'252 = 2^2 \\cdot 3^2 \\cdot 7'}</Tex>, <Tex>{'198 = 2 \\cdot 3^2 \\cdot 11'}</Tex></p>
                <p><Tex>{'\\text{НОД} = 2 \\cdot 3^2 = 18'}</Tex>, <Tex>{'\\text{НОК} = 2^2 \\cdot 3^2 \\cdot 7 \\cdot 11 = 2772'}</Tex></p>
                <p>Проверка: <Tex>{'18 \\cdot 2772 = 49\\,896 = 252 \\cdot 198'}</Tex> ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намерете $\text{НОД}(1071,\ 462)$ с алгоритъма на Евклид." check={[21]} ask={['НОД']}>
                <p><Tex>{'1071 = 2 \\cdot 462 + 147'}</Tex>; <Tex>{'462 = 3 \\cdot 147 + 21'}</Tex>; <Tex>{'147 = 7 \\cdot 21'}</Tex></p>
                <p><Tex>{'\\text{НОД} = 21'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Съкратете дробта $\frac{391}{667}$." check={[17, 29]} ask={['числител', 'знаменател']}>
                <p>Евклид: <Tex>{'667 = 1 \\cdot 391 + 276'}</Tex>, <Tex>{'391 = 1 \\cdot 276 + 115'}</Tex>, <Tex>{'276 = 2 \\cdot 115 + 46'}</Tex>, <Tex>{'115 = 2 \\cdot 46 + 23'}</Tex>, <Tex>{'46 = 2 \\cdot 23'}</Tex>.</p>
                <p><Tex>{'\\text{НОД} = 23'}</Tex> ⇒ <Tex>{'\\frac{391}{667} = \\frac{17}{29}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете всички цели решения на $7x + 12y = 1$.">
                <p>С разширения алгоритъм на Евклид: <Tex>{'x_0 = -5,\\ y_0 = 3'}</Tex>.</p>
                <p>Всички решения: <Tex>{'x = -5 + 12t'}</Tex>, <Tex>{'y = 3 - 7t'}</Tex>, <Tex>{'t \\in \\mathbb{Z}'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Докажете, че $\text{НОД}(2n + 3,\ 3n + 4) = 1$ за всяко естествено $n$.">
                <p>Всеки общ делител <Tex>{'d'}</Tex> дели и <Tex>{'3(2n + 3) - 2(3n + 4) = 1'}</Tex>.</p>
                <p>Значи <Tex>{'d = 1'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Сборът на две естествени числа е 168, а НОД им е 24. Намерете числата.">
                <p><Tex>{'a = 24m,\\ b = 24n'}</Tex> с <Tex>{'\\text{НОД}(m,\\ n) = 1'}</Tex> и <Tex>{'m + n = 7'}</Tex>.</p>
                <p>Взаимно прости двойки: <Tex>{'(1;\\ 6),\\ (2;\\ 5),\\ (3;\\ 4)'}</Tex>.</p>
                <p>Числата са 24 и 144, 48 и 120 или 72 и 96.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че дробта $\frac{21n + 4}{14n + 3}$ е несъкратима за всяко естествено $n$. (Международна олимпиада, 1959 г.)">
                <p>Нека <Tex>{'d'}</Tex> дели числителя и знаменателя.</p>
                <p>Тогава <Tex>{'d \\mid 3(14n + 3) - 2(21n + 4) = 42n + 9 - 42n - 8 = 1'}</Tex>.</p>
                <p><Tex>{'d = 1'}</Tex> – дробта е несъкратима.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Кое е най-голямото цяло количество, което не може да се плати точно с монети от 3 и 5 стотинки?" check={[7]} ask={['сума, ст.']}>
                <p>Платимите суми са <Tex>{'3x + 5y'}</Tex> с <Tex>{'x,\\ y \\ge 0'}</Tex>: 3, 5, 6, 8, 9, 10, 11, …</p>
                <p>8, 9 и 10 се плащат (<Tex>{'3 + 5'}</Tex>, <Tex>{'3 \\cdot 3'}</Tex>, <Tex>{'5 \\cdot 2'}</Tex>), а всяка по-голяма сума е някоя от тях плюс няколко монети от 3.</p>
                <p>7 не може – отговорът е 7. (Изобщо за взаимно прости <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> това е <Tex>{'ab - a - b'}</Tex>.)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажете, че $\text{НОД}(F_{n+1},\ F_n) = 1$ за числата на Фибоначи $1, 1, 2, 3, 5, 8, \ldots$">
                <p>От <Tex>{'F_{n+1} = F_n + F_{n-1}'}</Tex> следва <Tex>{'\\text{НОД}(F_{n+1},\\ F_n) = \\text{НОД}(F_n,\\ F_{n-1})'}</Tex>.</p>
                <p>Повтаряме, докато стигнем <Tex>{'\\text{НОД}(F_2,\\ F_1) = \\text{НОД}(1,\\ 1) = 1'}</Tex>.</p>
                <p>При поредни числа на Фибоначи всяко деление дава частно 1 – затова алгоритъмът на Евклид работи най-бавно точно за тях.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ НОД – общите прости множители с по-малкия показател; НОК – всички с по-големия</li>
              <li>✓ <Tex>{'\\text{НОД}(a,\\ b) \\cdot \\text{НОК}(a,\\ b) = ab'}</Tex>; взаимно прости: <Tex>{'\\text{НОД} = 1'}</Tex></li>
              <li>✓ Евклид: <Tex>{'\\text{НОД}(a,\\ b) = \\text{НОД}(b,\\ r)'}</Tex>, докато остатъкът стане 0</li>
              <li>✓ Безу: <Tex>{'ax + by = \\text{НОД}(a,\\ b)'}</Tex> има цели решения</li>
              <li>✓ <Tex>{'ax + by = c'}</Tex> има цели решения ⇔ <Tex>{'d \\mid c'}</Tex>; всички: <Tex>{'x_0 + \\frac{b}{d}t,\\ y_0 - \\frac{a}{d}t'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Колко бърз е алгоритъмът на Евклид? През 1844 г. Габриел Ламе доказва, че броят на деленията никога не надвишава пет пъти
              броя на цифрите на по-малкото число. Най-лошият случай са поредните числа на Фибоначи. Това е едно от първите строги изследвания
              на това колко „струва“ един алгоритъм – идея, която век по-късно става основа на компютърните науки.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
