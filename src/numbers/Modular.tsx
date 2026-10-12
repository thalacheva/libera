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
import BarcodeLab from './BarcodeLab';
import ClockLab from './ClockLab';
import PowerTableLab from './PowerTableLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const DAYS = ['понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота', 'неделя'];

/** Остатъците на a, a², a³, … по модул m до първото повторение: [редица, период]. */
function powerCycle(a: number, m: number) {
  const seq: number[] = [];
  let v = a % m;
  while (!seq.includes(v)) {
    seq.push(v);
    v = (v * a) % m;
  }
  return { seq, start: seq.indexOf(v) };
}

/** aⁿ mod m по цикъла на степените – със стъпки за решението. */
function powerDrill(a: number, n: number, m: number, what: string): Drill {
  const { seq, start } = powerCycle(a, m);
  const period = seq.length - start;
  // Степента n отговаря на позиция start + ((n − 1 − start) mod period) в редицата (броим от a¹)
  const idx = n - 1 < start ? n - 1 : start + ((n - 1 - start) % period);
  const shown = seq.map((r, i) => `${a}^{${i + 1}} \\equiv ${r}`).join(',\\ ');
  return {
    tex: `${a}^{${n}}`,
    ask: what,
    num: seq[idx],
    den: 1,
    steps: [
      `Степените по модул ${m}: $${shown}$, после се повтарят с период ${period}.`,
      period === 1 && start === 0
        ? `Всяка степен на ${a} дава остатък ${seq[0]}: $${a}^{${n}} \\equiv ${seq[0]} \\pmod{${m}}$`
        : start === 0
        ? `$${n} = ${period} \\cdot ${Math.floor((n - 1) / period)} + ${((n - 1) % period) + 1}$, значи $${a}^{${n}} \\equiv ${a}^{${((n - 1) % period) + 1}} \\equiv ${seq[idx]} \\pmod{${m}}$`
        : `Повтарянето започва от $${a}^{${start + 1}}$; на степен ${n} отговаря $${a}^{${idx + 1}} \\equiv ${seq[idx]} \\pmod{${m}}$`,
    ],
  };
}

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const m = pick([3, 5, 7, 9, 11, 13]);
    let a = 0;
    while (a === 0 || gcd(a, m) !== 1) a = randInt(2, 9);
    return powerDrill(a, randInt(20, 200), m, `Какъв е остатъкът при деление на ${m}?`);
  }
  if (kind === 1) {
    return powerDrill(randInt(2, 9), randInt(10, 2026), 10, 'Каква е последната цифра?');
  }
  if (kind === 2) {
    const [today, n] = [randInt(0, 6), randInt(10, 400)];
    const day = (today + n) % 7;
    return {
      tex: `\\text{днес е ${DAYS[today]}}`,
      ask: `Кой ден ще е след ${n} дни? Въведи номера му (1 – понеделник, …, 7 – неделя).`,
      num: day + 1,
      den: 1,
      steps: [`$${n} = 7 \\cdot ${Math.floor(n / 7)} + ${n % 7}$ – цели седмици не променят деня.`, `${n % 7} ${n % 7 === 1 ? 'ден' : 'дни'} след ${DAYS[today]} е ${DAYS[day]} (№ ${day + 1}).`],
    };
  }
  if (kind === 3) {
    const p = pick([5, 7, 11, 13]);
    const [a, b] = [randInt(2, p - 1), randInt(1, p - 1)];
    let inv = 1;
    while ((a * inv) % p !== 1) inv++;
    const x = (b * inv) % p;
    return {
      tex: `${a}x \\equiv ${b} \\pmod{${p}}`,
      ask: `Намери $x$ от $0$ до $${p - 1}$.`,
      num: x,
      den: 1,
      steps: [`Обратното на ${a} по модул ${p} е ${inv}: $${a} \\cdot ${inv} = ${a * inv} \\equiv 1$`, `Умножаваме по ${inv}: $x \\equiv ${b} \\cdot ${inv} = ${b * inv} \\equiv ${x} \\pmod{${p}}$`],
    };
  }
  const [u, v] = [randInt(1000, 9999), randInt(1000, 9999)];
  const ds = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);
  const digits = (n: number) => (ds(n) === n % 9 ? `${ds(n)}` : `${ds(n)} \\equiv ${n % 9}`);
  return {
    tex: `${u} \\cdot ${v}`,
    ask: 'Какъв е остатъкът при деление на 9?',
    num: (u * v) % 9,
    den: 1,
    steps: [`Всяко число е сравнимо със сбора от цифрите си по модул 9: $${u} \\equiv ${digits(u)}$, $${v} \\equiv ${digits(v)}$`, `$${u % 9} \\cdot ${v % 9} = ${(u % 9) * (v % 9)} \\equiv ${(u * v) % 9} \\pmod 9$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '📅 След 100 дни',
    problem: '12 октомври 2026 г. е понеделник. Кой ден от седмицата ще е 100 дни по-късно? Въведете номера му (1 – понеделник, …, 7 – неделя).',
    solution: ['$100 = 7 \\cdot 14 + 2$, т.е. $100 \\equiv 2 \\pmod 7$', '14 цели седмици не променят деня; остават 2 дни.', 'Понеделник + 2 дни = сряда (20 януари 2027 г.).'],
    answer: 'Сряда (3)',
    check: [3],
    ask: ['№ на деня'],
  },
  {
    title: '🕘 Часовникът',
    problem: 'Сега е 9 ч. Колко ще е часът след 100 часа (в 24-часов формат)?',
    solution: ['$9 + 100 = 109$', '$109 = 24 \\cdot 4 + 13$, т.е. $109 \\equiv 13 \\pmod{24}$', 'Ще е 13 ч. (след 4 денонощия и 4 часа).'],
    answer: '13 ч.',
    check: [13],
    ask: ['час'],
  },
  {
    title: '🛒 Баркод',
    problem: 'Баркодът на български продукт започва с 380123456789. Каква е контролната (13-а) цифра? Цифрите се умножават последователно по 1 и 3, а контролната цифра допълва сбора до кратно на 10.',
    solution: ['$3 \\cdot 1 + 8 \\cdot 3 + 0 \\cdot 1 + 1 \\cdot 3 + 2 + 3 \\cdot 3 + 4 + 5 \\cdot 3 + 6 + 7 \\cdot 3 + 8 + 9 \\cdot 3 = 122$', '$122 \\equiv 2 \\pmod{10}$ – до кратно на 10 липсват 8.', 'Контролната цифра е 8: баркодът е 3801234567898.'],
    answer: '8',
    check: [8],
    ask: ['цифра'],
  },
  {
    title: '🏯 Задачата на Сун Дзъ',
    problem: 'В древнокитайски трактат (между III и V век) се пита: има неизвестен брой предмети. Ако ги броим по 3, остават 2; по 5 – остават 3; по 7 – остават 2. Колко е най-малкият възможен брой?',
    solution: ['Търсим $x \\equiv 2 \\pmod 3$, $x \\equiv 3 \\pmod 5$, $x \\equiv 2 \\pmod 7$.', 'От първото и третото: $x \\equiv 2 \\pmod{21}$, т.е. $x = 2, 23, 44, \\ldots$', '$23 \\equiv 3 \\pmod 5$ ✓ – отговорът е 23 (и всички $23 + 105k$).'],
    answer: '23',
    check: [23],
    ask: ['брой'],
  },
  {
    title: '🔁 Последната цифра',
    problem: 'Каква е последната цифра на $3^{2026}$?',
    solution: ['Последните цифри на $3^1, 3^2, 3^3, 3^4$ са 3, 9, 7, 1 и после се повтарят.', '$2026 = 4 \\cdot 506 + 2 \\Rightarrow 3^{2026} \\equiv 3^2 = 9 \\pmod{10}$'],
    answer: '9',
    check: [9],
    ask: ['цифра'],
  },
  {
    title: '🎹 Квинтовият кръг',
    problem: 'Октавата има 12 полутона, а квинтата е 7 полутона. Ако тръгнем от „до“ и се изкачваме с квинти, след колко квинти ще стигнем отново до „до“ (в някоя по-висока октава)?',
    solution: ['Търсим най-малкото $k$ с $7k \\equiv 0 \\pmod{12}$.', '$\\text{НОД}(7,\\ 12) = 1$, затова $12 \\mid k$ – най-малкото е $k = 12$.', 'По пътя минаваме през всичките 12 тона – това е квинтовият кръг на музикантите.'],
    answer: '12 квинти',
    check: [12],
    ask: ['квинти'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какъв е остатъкът при деление на 17 на 5?',
    answers: ['$2$', '$3$', '$5$', '$12$'],
    correctAnswer: '$2$',
  },
  {
    question: 'С кое число е сравнимо 38 по модул 7?',
    answers: ['$3$', '$5$', '$1$', '$4$'],
    correctAnswer: '$3$',
  },
  {
    question: 'Каква е последната цифра на $2^{10}$?',
    answers: ['$4$', '$2$', '$8$', '$6$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Кое число от 0 до 6 е сравнимо с $-1$ по модул 7?',
    answers: ['$6$', '$1$', '$0$', '$-1$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Кое сравнение е вярно?',
    answers: ['$25 \\equiv 4 \\pmod 7$', '$25 \\equiv 4 \\pmod 6$', '$25 \\equiv 5 \\pmod 7$', '$25 \\equiv 1 \\pmod 7$'],
    correctAnswer: '$25 \\equiv 4 \\pmod 7$',
  },
  {
    question: 'Какъв е остатъкът на $3^{12}$ при деление на 13?',
    answers: ['$1$', '$3$', '$12$', '$0$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Защо признакът за делимост на 9 използва сбора от цифрите?',
    answers: ['защото $10 \\equiv 1 \\pmod 9$', 'защото 9 е нечетно', 'защото $9 = 3^2$', 'защото $10 \\equiv 0 \\pmod 9$'],
    correctAnswer: 'защото $10 \\equiv 1 \\pmod 9$',
  },
  {
    question: 'Днес е събота. Кой ден ще е след 30 дни?',
    answers: ['понеделник', 'неделя', 'събота', 'вторник'],
    correctAnswer: 'понеделник',
  },
  {
    question: 'Кое е обратното число на 3 по модул 7 (т.е. $3x \\equiv 1$)?',
    answers: ['$5$', '$3$', '$2$', '$4$'],
    correctAnswer: '$5$',
  },
];

// ---------- Страница ----------

export function Modular() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Остатъци и сравнения по модул</h1>

        <div className="bg-gradient-to-br from-teal-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🕰️ През 1801 г. 24-годишният Карл Фридрих Гаус публикува „Аритметични изследвания“ – книгата, с която теорията на числата
            става отделна наука. На първите ѝ страници той въвежда нов знак: <Tex>{'a \\equiv b \\pmod{m}'}</Tex>, „<Tex>{'a'}</Tex> е сравнимо с{' '}
            <Tex>{'b'}</Tex> по модул <Tex>{'m'}</Tex>“. Идеята е позната на всеки, който гледа часовник: 10 часа плюс 5 часа не е 15, а 3
            часа. Броим в кръг – и изведнъж огромни сметки стават лесни. Днес с тази „часовникова аритметика“ се шифроват съобщенията в
            интернет и се проверяват баркодовете в магазина.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Сравнения по модул</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Каква е последната цифра на <Tex>{'7^{2026}'}</Tex>? Числото има над 1700 цифри и никой калкулатор
              няма да го покаже – но отговорът се намира за минута, на ум.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Сравнение по модул"
            description="Казваме, че $a$ е сравнимо с $b$ по модул $m$, и пишем $a \equiv b \pmod{m}$, ако $m \mid a - b$, т.е. ако $a$ и $b$ дават еднакъв остатък при деление на $m$. Например $38 \equiv 3 \pmod 7$, $-1 \equiv 6 \pmod 7$ и $100 \equiv 0 \pmod{10}$."
          />
          <p className={text}>
            По модул <Tex>{'m'}</Tex> всяко цяло число е „същото“ като остатъка си – едно от числата <Tex>{'0, 1, \\ldots, m - 1'}</Tex>. Те са
            като деленията на часовник с <Tex>{'m'}</Tex> часа: при <Tex>{'m = 12'}</Tex> това е обикновеният часовник, при <Tex>{'m = 7'}</Tex> – дните от
            седмицата.
          </p>
          <ClockLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Действия със сравнения</h2>
          <Theorem
            title="Свойства"
            description="Ако $a \equiv b$ и $c \equiv d \pmod{m}$, то $a + c \equiv b + d$, $a - c \equiv b - d$, $ac \equiv bd$ и $a^n \equiv b^n \pmod{m}$. С други думи – можем да заменяме числата с остатъците им във всеки сбор, разлика, произведение и степен. Делението е опасно: може да делим на $k$ само ако $\text{НОД}(k,\ m) = 1$."
          />
          <Example
            description="Последната цифра на $7^{2026}$ – отговорът на загадката."
            steps={[
              'Последната цифра е остатъкът по модул 10. $7^1 \\equiv 7$, $7^2 = 49 \\equiv 9$, $7^3 \\equiv 9 \\cdot 7 = 63 \\equiv 3$, $7^4 \\equiv 3 \\cdot 7 = 21 \\equiv 1$',
              'Щом $7^4 \\equiv 1$, степените се повтарят през 4: $2026 = 4 \\cdot 506 + 2$',
              '$7^{2026} = (7^4)^{506} \\cdot 7^2 \\equiv 1 \\cdot 49 \\equiv 9 \\pmod{10}$ – последната цифра е 9.',
            ]}
          />
          <p className={text}>
            Така се обясняват и признаците за делимост от урока{' '}
            <Link to="/numbers/divisibility" className={link}>
              Делимост и прости числа
            </Link>
            : понеже <Tex>{'10 \\equiv 1 \\pmod 9'}</Tex>, всяка степен на 10 е <Tex>{'\\equiv 1'}</Tex> и числото е сравнимо със сбора от цифрите си. А
            понеже <Tex>{'10 \\equiv -1 \\pmod{11}'}</Tex>, степените на 10 са последователно <Tex>{'+1'}</Tex> и <Tex>{'-1'}</Tex> – оттам идва знакопроменливият сбор.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Контролни цифри</h2>
          <p className={text}>
            Баркодовете, номерата на банковите сметки (IBAN), ISBN на книгите и ЕГН завършват с контролна цифра, пресметната по модул. Ако
            касиерът сбърка една цифра при ръчно въвеждане, сравнението „не излиза“ и системата веднага го забелязва.
          </p>
          <BarcodeLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Малката теорема на Ферма</h2>
          <Theorem
            title="Малка теорема на Ферма"
            description="Ако $p$ е просто число и $p \nmid a$, то $a^{p-1} \equiv 1 \pmod{p}$. Следствие: $a^p \equiv a \pmod{p}$ за всяко цяло $a$."
          />
          <PowerTableLab />
          <Example
            description="Да намерим остатъка на $2^{100}$ при деление на 7."
            steps={['По Ферма $2^6 \\equiv 1 \\pmod 7$ (всъщност дори $2^3 = 8 \\equiv 1$).', '$100 = 6 \\cdot 16 + 4 \\Rightarrow 2^{100} \\equiv 2^4 = 16 \\equiv 2 \\pmod 7$']}
          />
          <p className={text}>
            Пиер дьо Ферма формулира теоремата в писмо през 1640 г., без доказателство („бих ви изпратил доказателството, ако не се
            опасявах, че е твърде дълго“). Първото публикувано доказателство е на Ойлер, близо век по-късно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Уравнения по модул</h2>
          <Theorem
            title="Линейно сравнение"
            description="Ако $\text{НОД}(a,\ m) = 1$, сравнението $ax \equiv b \pmod{m}$ има единствено решение по модул $m$. Намираме обратното число $a^{-1}$ (с $a \cdot a^{-1} \equiv 1$) и умножаваме: $x \equiv a^{-1} b$."
          />
          <Example
            description="Да решим $3x \equiv 4 \pmod 7$."
            steps={['Обратното на 3 по модул 7 е 5: $3 \\cdot 5 = 15 \\equiv 1$.', '$x \\equiv 5 \\cdot 4 = 20 \\equiv 6 \\pmod 7$', 'Проверка: $3 \\cdot 6 = 18 = 2 \\cdot 7 + 4$ ✓']}
          />
          <Theorem
            title="Китайска теорема за остатъците"
            description="Ако модулите $m_1, m_2, \ldots, m_k$ са два по два взаимно прости, системата $x \equiv r_i \pmod{m_i}$ има единствено решение по модул $m_1 m_2 \cdots m_k$."
          />
          <p className={text}>
            Обратното число по модул се намира и с разширения алгоритъм на Евклид (виж{' '}
            <Link to="/numbers/gcd" className={link}>
              НОД и НОК
            </Link>
            ): от <Tex>{'ax + my = 1'}</Tex> следва <Tex>{'ax \\equiv 1 \\pmod{m}'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Остатъци на степени, последни цифри, дни от седмицата и сравнения.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Замени числата с остатъците им и търси кога степените започват да се повтарят." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Модулната аритметика около нас</h2>
          <p className={text}>
            Календарът, часовникът, музикалните тонове и контролните цифри са модулна аритметика. Тя движи и компютрите: процесорът смята
            по модул <Tex>{'2^{32}'}</Tex> или <Tex>{'2^{64}'}</Tex>, а шифрирането в интернет степенува огромни числа по модул.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Деление на сравнение', '$6 \\equiv 16 \\pmod{10} \\Rightarrow 3 \\equiv 8 \\pmod{10}$', 'делим на 2, но $\\text{НОД}(2,\\ 10) \\ne 1$: вярно е само $3 \\equiv 8 \\pmod 5$'],
              ['Отрицателен остатък', '$-7$ дава остатък $-1$ при деление на 3', 'остатъкът е 2: $-7 = 3 \\cdot (-3) + 2$'],
              ['Степенният показател по модул', '$7^{2026} \\equiv 7^{6} \\pmod{10}$, защото $2026 \\equiv 6$', 'показателят се намалява по периода на степените (4), не по модула'],
              ['Ферма без просто число', '$2^8 \\equiv 1 \\pmod 9$', '$2^8 = 256 \\equiv 4 \\pmod 9$ – теоремата е за прости модули'],
              ['Сравнение в показателя', '$1 \\equiv 4 \\pmod 3 \\Rightarrow 2^1 \\equiv 2^4 \\pmod 3$', '$2 \\not\\equiv 16 \\equiv 1 \\pmod 3$'],
              ['Последна цифра на сбор', 'последната цифра на $17 + 28$ е $7 + 8 = 15$', 'вземаме и нея по модул 10: цифрата е 5'],
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
              <Task id="a1" number={1} color="border-green-500" question="Намерете остатъка на 2026 и на $2026^2$ при деление на 7.">
                <p><Tex>{'2026 = 7 \\cdot 289 + 3 \\Rightarrow 2026 \\equiv 3 \\pmod 7'}</Tex></p>
                <p><Tex>{'2026^2 \\equiv 3^2 = 9 \\equiv 2 \\pmod 7'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Каква е последната цифра на $7^{2026}$?">
                <p>Последните цифри на степените на 7: 7, 9, 3, 1, 7, … – период 4.</p>
                <p><Tex>{'2026 \\equiv 2 \\pmod 4 \\Rightarrow 7^{2026} \\equiv 7^2 \\equiv 9 \\pmod{10}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Докажете, че квадратът на всяко цяло число дава остатък 0 или 1 при деление на 4.">
                <p>Ако <Tex>{'n = 2k'}</Tex>: <Tex>{'n^2 = 4k^2 \\equiv 0 \\pmod 4'}</Tex>.</p>
                <p>Ако <Tex>{'n = 2k + 1'}</Tex>: <Tex>{'n^2 = 4k^2 + 4k + 1 \\equiv 1 \\pmod 4'}</Tex>.</p>
                <p>Затова например 2027 (<Tex>{'\\equiv 3 \\pmod 4'}</Tex>) не е точен квадрат.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете остатъка на $2^{100}$ при деление на 7.">
                <p><Tex>{'2^3 = 8 \\equiv 1 \\pmod 7'}</Tex></p>
                <p><Tex>{'2^{100} = (2^3)^{33} \\cdot 2 \\equiv 1 \\cdot 2 = 2 \\pmod 7'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Решете сравнението $3x \equiv 4 \pmod 7$.">
                <p>Обратното на 3 е 5 (<Tex>{'3 \\cdot 5 = 15 \\equiv 1'}</Tex>).</p>
                <p><Tex>{'x \\equiv 5 \\cdot 4 = 20 \\equiv 6 \\pmod 7'}</Tex>, т.е. <Tex>{'x = 6 + 7k'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Докажете, че $2^{3n} - 1$ се дели на 7 за всяко естествено $n$.">
                <p><Tex>{'2^{3n} = 8^n'}</Tex> и <Tex>{'8 \\equiv 1 \\pmod 7'}</Tex>.</p>
                <p><Tex>{'8^n \\equiv 1^n = 1 \\pmod 7 \\Rightarrow 7 \\mid 8^n - 1'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намерете най-малкото естествено $x$, за което $x \equiv 2 \pmod 3$, $x \equiv 3 \pmod 5$, $x \equiv 2 \pmod 7$.">
                <p>От <Tex>{'x \\equiv 2'}</Tex> по модул 3 и 7 (взаимно прости): <Tex>{'x \\equiv 2 \\pmod{21}'}</Tex>, т.е. <Tex>{'x \\in \\{2, 23, 44, 65, 86\\}'}</Tex> до 105.</p>
                <p>Остатъци по модул 5: 2, 3, 4, 0, 1 – подходящо е само 23.</p>
                <p><Tex>{'x = 23'}</Tex>; всички решения са <Tex>{'23 + 105k'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че $n^5 - n$ се дели на 30 за всяко цяло $n$.">
                <p><Tex>{'30 = 2 \\cdot 3 \\cdot 5'}</Tex> – достатъчно е делимост на всяко от трите прости числа.</p>
                <p>По Ферма <Tex>{'n^5 \\equiv n \\pmod 5'}</Tex>; също <Tex>{'n^3 \\equiv n \\pmod 3 \\Rightarrow n^5 = n^3 \\cdot n^2 \\equiv n^3 \\equiv n'}</Tex>; и <Tex>{'n^2 \\equiv n \\pmod 2 \\Rightarrow n^5 \\equiv n'}</Tex>.</p>
                <p>Значи 2, 3 и 5 делят <Tex>{'n^5 - n'}</Tex>, а са взаимно прости ⇒ <Tex>{'30 \\mid n^5 - n'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кои са последните две цифри на $3^{2026}$?">
                <p>Търсим остатъка по модул 100. <Tex>{'3^{10} = 59\\,049 \\equiv 49'}</Tex>, <Tex>{'3^{20} \\equiv 49^2 = 2401 \\equiv 1 \\pmod{100}'}</Tex>.</p>
                <p><Tex>{'2026 = 20 \\cdot 101 + 6 \\Rightarrow 3^{2026} \\equiv 3^6 = 729 \\equiv 29 \\pmod{100}'}</Tex>.</p>
                <p>Последните две цифри са 29.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'a \\equiv b \\pmod{m} \\iff m \\mid a - b'}</Tex> – еднакви остатъци</li>
              <li>✓ Сравненията се събират, изваждат, умножават и степенуват; делим само на числа, взаимно прости с модула</li>
              <li>✓ Степените по модул се повтарят периодично – така намираме последни цифри и остатъци на огромни степени</li>
              <li>✓ Ферма: <Tex>{'a^{p-1} \\equiv 1 \\pmod p'}</Tex> за просто <Tex>{'p \\nmid a'}</Tex></li>
              <li>✓ <Tex>{'ax \\equiv b \\pmod m'}</Tex> при <Tex>{'\\text{НОД}(a,\\ m) = 1'}</Tex>: умножаваме по обратното число</li>
              <li>✓ Китайска теорема: системи с взаимно прости модули имат единствено решение по модул произведението</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Шифърът RSA (1977 г., Ривест, Шамир и Ейдълман) се основава на обобщението на теоремата на Ферма от Ойлер: съобщението се
              повдига на огромна степен по модул произведение на две големи прости числа. Да шифроваш е лесно, а да дешифрираш без ключа
              изисква разлагане на модула – задача, за която не е известен бърз начин. По-късно се разбира, че британският криптограф
              Клифърд Кокс открива същата идея още през 1973 г., но работата му остава секретна до 1997 г.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
