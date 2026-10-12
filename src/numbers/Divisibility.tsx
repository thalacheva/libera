import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Drill, pick, randInt } from '~/drill';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import DivisibilityLab from './DivisibilityLab';
import FactorLab from './FactorLab';
import { factorize } from './numberMath';
import SieveLab from './SieveLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const canonicalTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\cdot ');
/** Число с разделени хиляди за LaTeX: 1234567 → 1\,234\,567. */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const n = randInt(1_000_000, 9_999_999);
    const s = String(n)
      .split('')
      .reduce((a, d) => a + Number(d), 0);
    return {
      tex: big(n),
      ask: 'Какъв е остатъкът при деление на 9?',
      num: s % 9,
      den: 1,
      steps: [`Сборът от цифрите е $${String(n).split('').join(' + ')} = ${s}$`, `Числото и сборът от цифрите му дават еднакъв остатък при деление на 9: $${s} = 9 \\cdot ${Math.floor(s / 9)} + ${s % 9}$`],
    };
  }
  if (kind === 1) {
    let n = 1;
    let exps: number[] = [];
    while (n < 12 || n > 5000) {
      exps = [randInt(0, 5), randInt(0, 3), randInt(0, 2), randInt(0, 1)];
      n = 2 ** exps[0] * 3 ** exps[1] * 5 ** exps[2] * 7 ** exps[3];
    }
    const count = exps.reduce((c, e) => c * (e + 1), 1);
    return {
      tex: String(n),
      ask: 'Колко делителя има числото?',
      num: count,
      den: 1,
      steps: [`$${n} = ${canonicalTex(n)}$`, `Брой делители: $${factorize(n).map(([, e]) => `(${e} + 1)`).join(' \\cdot ')} = ${count}$`],
    };
  }
  if (kind === 2) {
    let n = 0;
    let ps: number[] = [];
    while (n < 30 || n > 3000) {
      ps = Array.from({ length: randInt(2, 3) }, () => pick(SMALL_PRIMES));
      n = ps.reduce((a, b) => a * b, 1);
    }
    const largest = Math.max(...ps);
    return {
      tex: String(n),
      ask: 'Кой е най-големият прост делител?',
      num: largest,
      den: 1,
      steps: ['Делим последователно на най-малкия прост делител.', `$${n} = ${canonicalTex(n)}$ – най-големият е ${largest}`],
    };
  }
  if (kind === 3) {
    const n = randInt(10_000, 999_999);
    const digits = String(n).split('').map(Number);
    const alt = digits.reduceRight((s, x, i) => s + ((digits.length - 1 - i) % 2 === 0 ? x : -x), 0);
    const r = ((alt % 11) + 11) % 11;
    const sumTex = [...digits].reverse().map((x, i) => (i === 0 ? `${x}` : `${i % 2 === 0 ? '+' : '-'} ${x}`)).join(' ');
    return {
      tex: big(n),
      ask: 'Какъв е остатъкът при деление на 11?',
      num: r,
      den: 1,
      steps: [`Знакопроменлив сбор отдясно наляво: $${sumTex} = ${alt}$`, `$${alt}$ дава остатък ${r} при деление на 11 – същия като числото${alt < 0 ? ` (към отрицателното число добавяме 11: $${alt} + ${11 * Math.ceil(-alt / 11)} = ${r}$)` : ''}`],
    };
  }
  const n = randInt(10, 130);
  const z = Math.floor(n / 5) + Math.floor(n / 25) + Math.floor(n / 125);
  return {
    tex: `${n}!`,
    ask: 'С колко нули завършва числото?',
    num: z,
    den: 1,
    steps: [
      'Всяка нула в края е множител $10 = 2 \\cdot 5$; двойките са повече, затова броим петиците.',
      `Кратни на 5: $\\left[\\frac{${n}}{5}\\right] = ${Math.floor(n / 5)}$; кратни на 25 дават още една петица: $\\left[\\frac{${n}}{25}\\right] = ${Math.floor(n / 25)}$${n >= 125 ? `; на 125 – още една: $1$` : ''}`,
      `Общо ${z} нули`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🔐 Ключ за шифър',
    problem: 'Шифърът RSA, който пази банковите плащания в интернет, използва произведение на две прости числа. Учебен пример е $n = 3233$. Намерете по-голямото от двете прости числа.',
    solution: ['Пробваме простите делители до $\\sqrt{3233} \\approx 56{,}9$.', 'Първият, който дели, е 53: $3233 = 53 \\cdot 61$.', 'При истинския RSA простите числа имат стотици цифри – и никой компютър не може да ги намери в разумно време.'],
    answer: '61',
    check: [61],
    ask: ['просто число'],
  },
  {
    title: '🦗 Цикадите',
    problem: 'В Северна Америка има цикади, които излизат от земята веднъж на 13 години, и други – веднъж на 17 години. Ако двата вида излязат заедно тази година, след колко години това ще се случи отново?',
    solution: ['13 и 17 са прости числа, така че нямат общ делител, по-голям от 1.', 'Следващата обща година е след $13 \\cdot 17 = 221$ години.', 'Една хипотеза е, че простите периоди помагат на цикадите да не съвпадат често с цикъла на хищниците си.'],
    answer: 'След 221 години',
    check: [221],
    ask: ['години'],
  },
  {
    title: '🪑 Столове в зала',
    problem: 'В зала трябва да се подредят 36 стола в правоъгълник – еднакъв брой редове с еднакъв брой столове, поне 2 реда и поне 2 стола на ред. По колко начина може да стане (6 реда по 6 се брои веднъж, 4 по 9 и 9 по 4 – като два начина)?',
    solution: ['Броят на редовете е делител на 36: $36 = 2^2 \\cdot 3^2$ има $(2 + 1)(2 + 1) = 9$ делителя.', 'Махаме 1 и 36 (един ред или един стол на ред).', 'Остават 7 начина: 2, 3, 4, 6, 9, 12 или 18 реда.'],
    answer: '7 начина',
    check: [7],
    ask: ['начина'],
  },
  {
    title: '🔢 Нулите на 100!',
    problem: 'С колко нули завършва произведението $100! = 1 \\cdot 2 \\cdot 3 \\cdot \\ldots \\cdot 100$?',
    solution: ['Броим множителите 5 (множителите 2 са повече).', 'Кратни на 5 до 100: 20; кратни на 25 дават по още една петица: 4.', '$20 + 4 = 24$ нули'],
    answer: '24 нули',
    check: [24],
    ask: ['нули'],
  },
  {
    title: '🪄 Фокус с шестцифрено число',
    problem: 'Помолете приятел да напише трицифрено число два пъти подред, например 456456. Разделете го на 7, после на 11, после на 13 – винаги ще се получи първоначалното число! Какво се получава за 456456?',
    solution: ['$\\overline{abcabc} = \\overline{abc} \\cdot 1000 + \\overline{abc} = \\overline{abc} \\cdot 1001$', '$1001 = 7 \\cdot 11 \\cdot 13$', 'Затова $456456 : 7 : 11 : 13 = 456$.'],
    answer: '456',
    check: [456],
    ask: ['резултат'],
  },
  {
    title: '💻 Числа на Мерсен',
    problem: 'Числата от вида $2^p - 1$ се наричат числа на Мерсен. При $p = 2, 3, 5, 7$ те са прости. Проверете $2^{11} - 1 = 2047$ – намерете най-малкия му прост делител.',
    solution: ['$\\sqrt{2047} \\approx 45{,}2$ – пробваме простите числа до 43.', 'Не се дели на 2, 3, 5, 7, 11, 13, 17, 19.', '$2047 = 23 \\cdot 89$ – значи не е просто, макар 11 да е просто.'],
    answer: '23',
    check: [23],
    ask: ['делител'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кое от числата е просто?',
    answers: ['$53$', '$51$', '$1$', '$91$'],
    correctAnswer: '$53$',
  },
  {
    question: 'Колко четни прости числа има?',
    answers: ['едно', 'нито едно', 'две', 'безброй много'],
    correctAnswer: 'едно',
  },
  {
    question: 'Едно число се дели на 9 точно когато:',
    answers: ['сборът от цифрите му се дели на 9', 'последната му цифра е 9', 'последните две цифри се делят на 9', 'се дели на 3'],
    correctAnswer: 'сборът от цифрите му се дели на 9',
  },
  {
    question: 'Кое е разлагането на 360 на прости множители?',
    answers: ['$2^3 \\cdot 3^2 \\cdot 5$', '$2^2 \\cdot 3^2 \\cdot 10$', '$2^3 \\cdot 3 \\cdot 15$', '$6^2 \\cdot 10$'],
    correctAnswer: '$2^3 \\cdot 3^2 \\cdot 5$',
  },
  {
    question: 'Колко делителя има числото 12?',
    answers: ['$6$', '$4$', '$3$', '$12$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Какъв е остатъкът при деление на 1000 на 7?',
    answers: ['$6$', '$0$', '$1$', '$3$'],
    correctAnswer: '$6$',
  },
  {
    question: 'На кое от числата се дели 123 456?',
    answers: ['$4$', '$5$', '$9$', '$10$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Кое от числата се дели на 11?',
    answers: ['$2024$', '$2025$', '$2026$', '$2027$'],
    correctAnswer: '$2024$',
  },
  {
    question: 'Какво е доказал Евклид за простите числа?',
    answers: ['че са безброй много', 'че всички са нечетни', 'че между тях винаги има разлика 2', 'че най-голямото е 997'],
    correctAnswer: 'че са безброй много',
  },
];

// ---------- Страница ----------

export function Divisibility() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Делимост и прости числа</h1>

        <div className="bg-gradient-to-br from-indigo-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏛️ Около 300 г. пр.н.е. Евклид записва в „Елементи“ едно от най-красивите доказателства в историята: простите числа са безброй
            много. Да предположим, че са краен брой. Умножаваме ги всичките и добавяме 1. Новото число не се дели на нито едно от тях –
            остатъкът винаги е 1. Значи или то самото е просто, или има прост делител, който липсва в списъка. Противоречие! Повече от две
            хиляди години по-късно простите числа пазят тайните ни: на тях е изграден шифърът, с който плащаме с карта в интернет.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Делимост и деление с остатък</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Без да делиш, можеш ли да кажеш дали 987 654 321 се дели на 9? А на 11? Отговорът е в цифрите
              – и до края на урока ще знаеш защо.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Делимост"
            description="Цялото число $a$ се дели на естественото $b$ (записваме $b \mid a$), ако $a = b \cdot q$ за някое цяло $q$. Тогава $b$ е делител на $a$, а $a$ – кратно на $b$. Например $6 \mid 42$, защото $42 = 6 \cdot 7$."
          />
          <Theorem
            title="Деление с остатък"
            description="За всяко цяло $a$ и естествено $b$ има единствени цели $q$ и $r$, за които $a = b \cdot q + r$ и $0 \le r < b$. Числото $r$ е остатъкът; $b \mid a$ точно когато $r = 0$. Ако $b \mid a$ и $b \mid c$, то $b \mid (a + c)$ и $b \mid (a - c)$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Признаци за делимост</h2>
          <p className={text}>
            Признаците идват от десетичния запис. Например <Tex>{'\\overline{abc} = 100a + 10b + c = 99a + 9b + (a + b + c)'}</Tex>. Първите две
            събираеми се делят на 9, затова числото и сборът от цифрите му дават еднакъв остатък при деление на 9 (и на 3). А понеже{' '}
            <Tex>{'100 = 4 \\cdot 25'}</Tex>, за делимостта на 4 са важни само последните две цифри.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="mx-auto text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-semibold">на</th>
                  <th className="px-3 py-2 text-left font-semibold">числото се дели, ако…</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2, 5, 10', 'последната цифра се дели на 2, 5 или 10'],
                  ['4 (25)', 'числото от последните две цифри се дели на 4 (25)'],
                  ['8 (125)', 'числото от последните три цифри се дели на 8 (125)'],
                  ['3, 9', 'сборът от цифрите се дели на 3 или 9'],
                  ['6', 'се дели и на 2, и на 3'],
                  ['11', 'знакопроменливият сбор на цифрите (отдясно наляво: + − + …) се дели на 11'],
                ].map(([d, rule]) => (
                  <tr key={d} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-1.5 font-semibold whitespace-nowrap">{d}</td>
                    <td className="px-3 py-1.5">{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DivisibilityLab />
          <Example
            description="Дели ли се 987 654 321 на 9 и на 11?"
            steps={[
              'Сборът от цифрите е $9 + 8 + \\ldots + 1 = 45$, а $9 \\mid 45$ – числото се дели на 9.',
              'Знакопроменлив сбор отдясно: $1 - 2 + 3 - 4 + 5 - 6 + 7 - 8 + 9 = 5$ – не се дели на 11 (остатъкът е 5).',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Прости и съставни числа</h2>
          <Theorem
            type="definition"
            title="Просто число"
            description="Естествено число $p > 1$ е просто, ако има точно два делителя: 1 и самото $p$. Числата, по-големи от 1, които не са прости, се наричат съставни. Числото 1 не е нито просто, нито съставно. Простите числа до 30 са 2, 3, 5, 7, 11, 13, 17, 19, 23 и 29; 2 е единственото четно просто число."
          />
          <p className={text}>
            За да проверим дали <Tex>{'n'}</Tex> е просто, е достатъчно да пробваме простите делители до <Tex>{'\\sqrt{n}'}</Tex>: ако{' '}
            <Tex>{'n = a \\cdot b'}</Tex> и двата множителя са по-големи от <Tex>{'\\sqrt{n}'}</Tex>, произведението им би било по-голямо от{' '}
            <Tex>{'n'}</Tex>. На тази идея се основава <strong>решетото на Ератостен</strong> (III век пр.н.е.).
          </p>
          <SieveLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Разлагане на прости множители</h2>
          <Theorem
            title="Основна теорема на аритметиката"
            description="Всяко естествено число $n > 1$ се записва като произведение на прости числа, и то по единствен начин (без значение от реда на множителите): $n = p_1^{a_1} \cdot p_2^{a_2} \cdot \ldots \cdot p_k^{a_k}$. Това е каноничният вид на $n$."
          />
          <Theorem
            title="Брой делители"
            description="Ако $n = p_1^{a_1} \cdot p_2^{a_2} \cdot \ldots \cdot p_k^{a_k}$, то $n$ има $(a_1 + 1)(a_2 + 1) \cdots (a_k + 1)$ делителя: всеки делител е $p_1^{b_1} \cdots p_k^{b_k}$ с $0 \le b_i \le a_i$ (виж правилото за умножение в Комбинаториката)."
          />
          <FactorLab />
          <Example
            description="Колко делителя има 360 и колко от тях са четни?"
            steps={['$360 = 2^3 \\cdot 3^2 \\cdot 5$', 'Брой делители: $(3 + 1)(2 + 1)(1 + 1) = 24$', 'Четните съдържат поне едно 2: показателят на 2 е 1, 2 или 3 – $3 \\cdot 3 \\cdot 2 = 18$ четни делителя.']}
          />
          <p className={text}>
            Броенето на делители е чиста комбинаторика (виж{' '}
            <Link to="/probability/combinatorics" className={link}>
              Комбинаторика
            </Link>
            ): избираме независимо по една степен за всяко просто число.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Колко са простите числа?</h2>
          <Theorem title="Теорема на Евклид" description="Простите числа са безброй много." />
          <p className={text}>
            <strong>Доказателство (по Евклид).</strong> Да допуснем, че простите числа са краен брой: <Tex>{'p_1, p_2, \\ldots, p_k'}</Tex>.
          </p>
          <ol className="list-decimal ml-8 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              Разглеждаме <Tex>{'N = p_1 \\cdot p_2 \\cdots p_k + 1'}</Tex>.
            </li>
            <li>
              При деление на всяко <Tex>{'p_i'}</Tex> числото <Tex>{'N'}</Tex> дава остатък 1, т.е. не се дели на никое от тях.
            </li>
            <li>
              <Tex>{'N > 1'}</Tex> има поне един прост делител – и той не е в списъка. Противоречие, значи простите числа са безброй.
            </li>
          </ol>
          <p className={text}>
            В същото време между простите числа има произволно дълги „пустини“: числата <Tex>{'n! + 2,\\ n! + 3,\\ \\ldots,\\ n! + n'}</Tex> са{' '}
            <Tex>{'n - 1'}</Tex> поредни съставни числа (<Tex>{'n! + k'}</Tex> се дели на <Tex>{'k'}</Tex>). А дали има безброй много
            „близнаци“ – прости числа с разлика 2, като 11 и 13 или 41 и 43 – и до днес никой не знае.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Остатъци, делители и прости множители – без калкулатор.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Използвай признаците за делимост или разлагането на прости множители." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Простите числа около нас</h2>
          <p className={text}>
            Простите числа са „атомите“ на числата – всяко друго се сглобява от тях. Затова са в основата на криптографията, на проверките
            за грешки в баркодовете и номерата на банковите сметки, а дори и в природата.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Числото 1', '1 е просто число', '1 не е нито просто, нито съставно'],
              ['Признак за 4', '$1234$ се дели на 4, защото $4 \\mid 4$', 'гледаме последните две цифри: $4 \\nmid 34$'],
              ['Делимост на произведение', '$4 \\mid n$ и $6 \\mid n \\Rightarrow 24 \\mid n$', 'само $12 \\mid n$ (напр. $n = 12$); правилото важи за взаимно прости делители'],
              ['Брой делители', '$2^3 \\cdot 3^2$ има $3 \\cdot 2 = 6$ делителя', '$(3 + 1)(2 + 1) = 12$ делителя'],
              ['„Формула за прости числа“', '$n^2 + n + 41$ е просто за всяко $n$', 'при $n = 40$ се получава $41^2$'],
              ['Делител на произведение', '$6 \\mid 4 \\cdot 9 \\Rightarrow 6 \\mid 4$ или $6 \\mid 9$', 'това важи само за прости делители'],
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
              <Task id="a1" number={1} color="border-green-500" question="Разложете 1260 на прости множители.">
                <p><Tex>{'1260 = 2 \\cdot 630 = 2^2 \\cdot 315 = 2^2 \\cdot 3^2 \\cdot 35'}</Tex></p>
                <p><Tex>{'1260 = 2^2 \\cdot 3^2 \\cdot 5 \\cdot 7'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="На кои от числата 2, 3, 4, 5, 9 и 11 се дели 7920?">
                <p>Последната цифра е 0 ⇒ дели се на 2 и 5; последните две цифри 20 ⇒ на 4.</p>
                <p>Сборът от цифрите е 18 ⇒ на 3 и 9; знакопроменливият сбор <Tex>{'0 - 2 + 9 - 7 = 0'}</Tex> ⇒ на 11.</p>
                <p>Дели се на всички: <Tex>{'7920 = 2^4 \\cdot 3^2 \\cdot 5 \\cdot 11'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Коя цифра трябва да е $x$, за да се дели числото $\overline{37x4}$ на 9?" check={[4]} ask={['$x$']}>
                <p>Сборът от цифрите <Tex>{'3 + 7 + x + 4 = 14 + x'}</Tex> трябва да се дели на 9.</p>
                <p>Единствената цифра е <Tex>{'x = 4'}</Tex>: <Tex>{'3744 = 9 \\cdot 416'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Колко делителя има числото 720? Колко от тях са точни квадрати?" check={[30, 6]} ask={['брой делители', 'точни квадрати']}>
                <p><Tex>{'720 = 2^4 \\cdot 3^2 \\cdot 5'}</Tex> ⇒ <Tex>{'(4 + 1)(2 + 1)(1 + 1) = 30'}</Tex> делителя.</p>
                <p>Точен квадрат е делител с четни показатели: за 2 – 0, 2 или 4; за 3 – 0 или 2; за 5 – само 0.</p>
                <p><Tex>{'3 \\cdot 2 \\cdot 1 = 6'}</Tex> квадрата: 1, 4, 9, 16, 36, 144.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Докажете, че $n^3 - n$ се дели на 6 за всяко естествено $n$.">
                <p><Tex>{'n^3 - n = (n - 1)n(n + 1)'}</Tex> – произведение на три поредни числа.</p>
                <p>Сред тях поне едно е четно и точно едно се дели на 3.</p>
                <p>Значи произведението се дели на 2 и на 3, т.е. на 6.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="С колко нули завършва числото $100!$? А $2026!$?" check={[24, 505]} ask={['нули в $100!$', 'нули в $2026!$']}>
                <p><Tex>{'100!'}</Tex>: <Tex>{'\\left[\\frac{100}{5}\\right] + \\left[\\frac{100}{25}\\right] = 20 + 4 = 24'}</Tex>.</p>
                <p><Tex>{'2026!'}</Tex>: <Tex>{'405 + 81 + 16 + 3 = 505'}</Tex> (делим на 5, 25, 125 и 625).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намерете всички прости числа $p$, за които $p + 10$ и $p + 14$ също са прости." check={[3]} ask={['$p$']}>
                <p>Разглеждаме остатъка на <Tex>{'p'}</Tex> при деление на 3.</p>
                <p>Ако <Tex>{'p = 3k + 1'}</Tex>, то <Tex>{'p + 14 = 3(k + 5)'}</Tex> се дели на 3; ако <Tex>{'p = 3k + 2'}</Tex>, то <Tex>{'p + 10 = 3(k + 4)'}</Tex> се дели на 3 – и не е просто.</p>
                <p>Остава <Tex>{'p = 3'}</Tex>: 3, 13 и 17 са прости. Отговор: <Tex>{'p = 3'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че $p^2 - 1$ се дели на 24 за всяко просто $p > 3$.">
                <p><Tex>{'p^2 - 1 = (p - 1)(p + 1)'}</Tex>. Числото <Tex>{'p'}</Tex> е нечетно, затова <Tex>{'p - 1'}</Tex> и <Tex>{'p + 1'}</Tex> са поредни четни числа – едното се дели на 4 ⇒ произведението се дели на 8.</p>
                <p>От трите поредни числа <Tex>{'p - 1,\\ p,\\ p + 1'}</Tex> едно се дели на 3, и това не е <Tex>{'p'}</Tex> ⇒ произведението се дели на 3.</p>
                <p>8 и 3 са взаимно прости ⇒ <Tex>{'24 \\mid p^2 - 1'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кое е най-малкото естествено число с точно 10 делителя?" check={[48]}>
                <p><Tex>{'10 = 10'}</Tex> или <Tex>{'10 = 5 \\cdot 2'}</Tex>, така че <Tex>{'n = p^9'}</Tex> или <Tex>{'n = p^4 q'}</Tex>.</p>
                <p>Най-малките такива са <Tex>{'2^9 = 512'}</Tex> и <Tex>{'2^4 \\cdot 3 = 48'}</Tex>.</p>
                <p>Отговор: 48 (делители 1, 2, 3, 4, 6, 8, 12, 16, 24, 48).</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'b \\mid a \\iff a = bq'}</Tex>; деление с остатък: <Tex>{'a = bq + r,\\ 0 \\le r < b'}</Tex></li>
              <li>✓ Признаци: последни цифри за 2, 4, 5, 8, 10; сбор от цифрите за 3 и 9; знакопроменлив сбор за 11</li>
              <li>✓ Просто число има точно два делителя; 1 не е просто; проверяваме делителите до <Tex>{'\\sqrt{n}'}</Tex></li>
              <li>✓ Всяко <Tex>{'n > 1'}</Tex> се разлага по единствен начин: <Tex>{'n = p_1^{a_1} \\cdots p_k^{a_k}'}</Tex></li>
              <li>✓ Брой делители: <Tex>{'(a_1 + 1)(a_2 + 1) \\cdots (a_k + 1)'}</Tex></li>
              <li>✓ Простите числа са безброй много (Евклид)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Най-големите известни прости числа са числа на Мерсен <Tex>{'2^p - 1'}</Tex> – за тях има особено бърз тест. Търсят ги доброволци
              по целия свят в проекта GIMPS, като оставят компютрите си да смятат. През октомври 2024 г. е открито просто число с над 41 милиона цифри –
              отпечатано, то би запълнило няколко десетки дебели книги. Дали има безброй много прости числа на Мерсен, още не е известно.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
