import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import EliminationLab from './EliminationLab';
import LineCurveLab from './LineCurveLab';
import SystemGraphLab from './SystemGraphLab';
import { dets, fmtEq, type Eq } from './systemMath';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};

/** Отрицателните числа в средата на израз – в скоби. */
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

type Drill = { e1: Eq; e2: Eq; x: number; y: number; steps: string[] };

const newDrill = (): Drill => {
  for (;;) {
    const x = randInt(-6, 6);
    const y = randInt(-6, 6);
    const [a1, b1, a2, b2] = [randNonZero(-5, 5), randNonZero(-5, 5), randNonZero(-5, 5), randNonZero(-5, 5)];
    const e1 = { a: a1, b: b1, c: a1 * x + b1 * y };
    const e2 = { a: a2, b: b2, c: a2 * x + b2 * y };
    const { D, Dx } = dets(e1, e2);
    if (D === 0) continue;
    return {
      e1,
      e2,
      x,
      y,
      steps: [
        `Умножаваме първото уравнение по ${par(b2)}, второто – по ${par(b1)} и ги изваждаме – y изчезва: ${fmtEq({ a: D, b: 0, c: Dx })}`,
        `x = ${num(Dx)} : ${par(D)} = ${num(x)}`,
        `Заместваме x = ${num(x)} в първото: ${fmtEq({ a: 0, b: b1, c: e1.c - a1 * x })}${b1 === 1 ? '' : ` ⇒ y = ${num(y)}`}`,
        `Отговор: (x; y) = (${num(x)}; ${num(y)})`,
      ],
    };
  }
};

const parse = (s: string) => {
  const v = Number(s.trim().replace('−', '-').replace(',', '.'));
  return s.trim() === '' || Number.isNaN(v) ? null : v;
};

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [inX, setInX] = useState('');
  const [inY, setInY] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const x = parse(inX);
    const y = parse(inY);
    if (x === null || y === null) return;
    if (x === task.x && y === task.y) {
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
    setInX('');
    setInY('');
    setResult(null);
    setShowSteps(false);
  };

  const input = (label: string, value: string, set: (s: string) => void) => (
    <label className="flex items-center gap-2">
      <span className="font-mono text-lg">{label} =</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => {
          set(e.target.value);
          if (result === 'wrong') setResult(null);
        }}
        onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
        disabled={result === 'correct'}
        className="w-20 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
      />
    </label>
  );

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <div className="flex justify-center mb-4">
        <div className="flex items-stretch gap-2 font-mono text-lg sm:text-2xl text-gray-800 dark:text-gray-100">
          <span className="text-4xl sm:text-5xl font-light leading-none self-center">{'{'}</span>
          <div className="flex flex-col justify-center gap-1">
            <span>{fmtEq(task.e1)}</span>
            <span>{fmtEq(task.e2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3">
        {input('x', inX, setInX)}
        {input('y', inY, setInY)}
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следваща →
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
            : 'Не съвсем. Провери двойката във всяко уравнение или виж решението.'}
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
    title: '🎬 Кино',
    problem: 'Билет за възрастен струва 12 €, а за дете – 7 €. Семейство с приятели купува 9 билета и плаща 83 €. Колко възрастни и колко деца има в групата?',
    solution: ['Нека x са възрастните, y – децата.', 'x + y = 9 и 12x + 7y = 83', 'y = 9 − x ⇒ 12x + 63 − 7x = 83', '5x = 20 ⇒ x = 4, y = 5'],
    answer: '4 възрастни и 5 деца',
    check: [4, 5],
    ask: ['възрастни', 'деца'],
  },
  {
    title: '🚤 Лодка по река',
    problem: 'Лодка изминава 36 km по течението на реката за 2 часа, а обратно, срещу течението – за 3 часа. Каква е скоростта на лодката в спокойна вода и каква – на течението?',
    solution: [
      'Нека v е скоростта на лодката, u – на течението (km/h).',
      'По течението: v + u = 36 : 2 = 18; срещу течението: v − u = 36 : 3 = 12',
      'Събираме: 2v = 30 ⇒ v = 15; u = 18 − 15 = 3',
    ],
    answer: 'Лодката – 15 km/h, течението – 3 km/h',
    check: [15, 3],
    ask: ['лодка, km/h', 'течение, km/h'],
  },
  {
    title: '🧪 Смесване на разтвори',
    problem: 'Колко грама 30% и колко грама 70% солен разтвор трябва да смесим, за да получим 200 g 40% разтвор?',
    solution: [
      'Нека x g са от 30%-ния, y g – от 70%-ния разтвор.',
      'Масата: x + y = 200. Солта: 0,3x + 0,7y = 0,4 · 200 = 80',
      'x = 200 − y ⇒ 60 − 0,3y + 0,7y = 80 ⇒ 0,4y = 20 ⇒ y = 50',
      'x = 150',
    ],
    answer: '150 g от 30%-ния и 50 g от 70%-ния разтвор',
    check: [150, 50],
    ask: ['30%-ен, g', '70%-ен, g'],
  },
  {
    title: '🪙 Касичка',
    problem: 'В касичка има 20 монети – само по 1 € и по 2 €, общо 31 €. Колко монети от всеки вид има?',
    solution: ['Нека x са монетите по 1 €, y – по 2 €.', 'x + y = 20 и x + 2y = 31', 'Изваждаме първото от второто: y = 11', 'x = 20 − 11 = 9'],
    answer: '9 монети по 1 € и 11 монети по 2 €',
    check: [9, 11],
    ask: ['по 1 €', 'по 2 €'],
  },
  {
    title: '🔢 Двуцифрено число',
    problem: 'Сборът на цифрите на двуцифрено число е 9. Ако разменим цифрите, числото се увеличава с 27. Кое е числото?',
    solution: [
      'Нека a е цифрата на десетиците, b – на единиците. Числото е 10a + b.',
      'a + b = 9 и (10b + a) − (10a + b) = 27 ⇒ 9b − 9a = 27 ⇒ b − a = 3',
      'Събираме: 2b = 12 ⇒ b = 6, a = 3',
    ],
    answer: '36 (обърнато е 63 = 36 + 27)',
    check: [36],
    ask: ['числото'],
  },
  {
    title: '🏡 Градина',
    problem: 'Правоъгълна градина има периметър 34 m и лице 60 m². Какви са размерите ѝ?',
    solution: ['Нека x и y са страните. 2(x + y) = 34 ⇒ x + y = 17; xy = 60', 'x и y са корени на t² − 17t + 60 = 0', 'D = 289 − 240 = 49 ⇒ t = (17 ± 7)/2 = 12 или 5'],
    answer: '12 m × 5 m',
    check: [12, 5],
    ask: ['дължина, m', 'ширина, m'],
  },
];

// ---------- Тест ----------

const systemsQuiz: Question[] = [
  {
    question: 'Коя двойка е решение на системата x + y = 7, x − y = 1?',
    answers: ['(3; 4)', '(4; 3)', '(5; 2)', '(6; 1)'],
    correctAnswer: '(4; 3)',
  },
  {
    question: 'Коя двойка е решение на уравнението 2x + y = 5?',
    answers: ['(2; 3)', '(3; 1)', '(1; 3)', '(0; 4)'],
    correctAnswer: '(1; 3)',
  },
  {
    question: 'Колко решения има системата x + 2y = 3, 2x + 4y = 6?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Безброй много',
  },
  {
    question: 'Колко решения има системата x + 2y = 3, 2x + 4y = 5?',
    answers: ['Едно', 'Две', 'Нито едно', 'Безброй много'],
    correctAnswer: 'Нито едно',
  },
  {
    question: 'Какво е графично решението на система от две линейни уравнения с две неизвестни?',
    answers: ['Пресечната точка на двете прави', 'Пресечните точки на правите с оста Ox', 'Наклоните на двете прави', 'Средата между двете прави'],
    correctAnswer: 'Пресечната точка на двете прави',
  },
  {
    question: 'На колко е равна детерминантата D на системата 3x − 2y = 1, 4x + y = 5?',
    answers: ['11', '−5', '5', '−11'],
    correctAnswer: '11',
  },
  {
    question: 'При кое a системата ax + 2y = 1, 2x + y = 3 няма решение?',
    answers: ['a = 1', 'a = 2', 'a = 4', 'a = −4'],
    correctAnswer: 'a = 4',
  },
  {
    question: 'Кои са решенията на системата x + y = 5, xy = 4?',
    answers: ['(1; 4) и (4; 1)', '(2; 2)', '(−1; −4) и (−4; −1)', 'Няма решение'],
    correctAnswer: '(1; 4) и (4; 1)',
  },
  {
    question: 'Колко общи точки имат параболата y = x² и правата y = 2x − 1?',
    answers: ['Нито една', 'Една – правата се допира до параболата', 'Две', 'Безброй много'],
    correctAnswer: 'Една – правата се допира до параболата',
  },
];

// ---------- Страница ----------

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

/** Система, записана с фигурна скоба. */
function Sys({ rows }: { rows: string[] }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-stretch gap-2 font-mono text-base sm:text-lg text-gray-800 dark:text-gray-100">
        <span className="text-4xl font-light leading-none self-center">{'{'}</span>
        <div className="flex flex-col justify-center">
          {rows.map(r => (
            <span key={r}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SystemsOfEquations() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Системи уравнения</h1>

        <div className="bg-gradient-to-br from-teal-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🐇 В старинния китайски сборник „Сунцзъ суан цзин“ (създаден някъде между III и V век) има задача, която и днес се решава в
            училище: „В клетка има фазани и зайци. Отгоре се виждат 35 глави, а отдолу – 94 крака. Колко са фазаните и колко са зайците?“
            Неизвестните са две, условията – също две. Едно уравнение не стига, но две уравнения заедно – <strong>система</strong> – дават
            точния отговор. Ще я решим още в първия раздел.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е система уравнения?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Намислих две числа. Сборът им е 10, а разликата им е 4. Кои са? Едното условие само не стига –
              сбор 10 имат и 1 и 9, и 5 и 5. Но само <span className="font-mono">7 и 3</span> изпълняват и двете условия едновременно.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Система уравнения"
            description="Няколко уравнения, които трябва да са изпълнени едновременно, образуват система; записваме ги едно под друго с фигурна скоба. Решение на система с две неизвестни е наредена двойка (x; y), която превръща всяко от уравненията във вярно равенство. Да решим системата означава да намерим всички такива двойки (или да покажем, че няма)."
          />
          <p className={text}>
            Уравнението x + y = 10 само по себе си има безброй решения: (1; 9), (2; 8), (2,5; 7,5)… Второто условие „отсява“ от тях само
            онези, които пасват и на него. Затова за две неизвестни обикновено са нужни две уравнения. Ето задачата за фазаните и зайците:
          </p>
          <Sys rows={['x + y = 35', '2x + 4y = 94']} />
          <Example
            description="Нека x е броят на фазаните (с по 2 крака), а y – на зайците (с по 4 крака). Да решим системата."
            steps={[
              'От първото уравнение: x = 35 − y',
              'Заместваме във второто: 2(35 − y) + 4y = 94',
              '70 − 2y + 4y = 94 ⇒ 2y = 24 ⇒ y = 12',
              'x = 35 − 12 = 23',
              'Проверка: 23 + 12 = 35 глави ✓; 2 · 23 + 4 · 12 = 46 + 48 = 94 крака ✓',
              'Отговор: 23 фазана и 12 зайци',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Метод на заместването</h2>
          <p className={text}>
            Точно това направихме с фазаните: изразихме едното неизвестно чрез другото и го <strong>заместихме</strong> във второто уравнение.
            Така от две уравнения с две неизвестни получаваме едно уравнение с едно неизвестно – а него вече знаем как да решим.
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
            {[
              ['1', 'Изразяваме', 'от по-удобното уравнение едното неизвестно чрез другото (търсим коефициент 1 или −1)'],
              ['2', 'Заместваме', 'полученият израз във второто уравнение – остава едно неизвестно'],
              ['3', 'Решаваме', 'линейното уравнение с едно неизвестно'],
              ['4', 'Връщаме се', 'и намираме второто неизвестно от израза в стъпка 1'],
              ['5', 'Проверка', 'двойката трябва да удовлетворява и двете уравнения'],
            ].map(([n, title, hint]) => (
              <div key={n} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">{n}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{hint}</p>
                </div>
              </div>
            ))}
          </div>
          <Example
            description="Да решим системата x + 2y = 7, 3x − y = 7"
            steps={[
              'В първото уравнение x е с коефициент 1: x = 7 − 2y',
              'Заместваме във второто: 3(7 − 2y) − y = 7',
              '21 − 6y − y = 7 ⇒ −7y = −14 ⇒ y = 2',
              'x = 7 − 2 · 2 = 3',
              'Проверка: 3 + 4 = 7 ✓; 9 − 2 = 7 ✓. Отговор: (3; 2)',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Метод на събирането</h2>
          <p className={text}>
            Когато никой коефициент не е 1, заместването води до дроби. Тогава умножаваме уравненията по подходящи числа, така че пред едно от
            неизвестните да се получат <strong>противоположни коефициенти</strong>, и ги събираме – това неизвестно изчезва.
          </p>
          <Theorem
            title="Защо можем да събираме уравнения?"
            description="Ако двойката (x; y) удовлетворява двете уравнения, тя удовлетворява и всяка тяхна комбинация k₁ · (първото) + k₂ · (второто). Затова, ако заменим едно от уравненията на системата с такава комбинация (при k₁ ≠ 0, когато заменяме първото), получаваме равносилна система – със същите решения."
          />
          <Example
            description="Да решим системата 3x + 2y = 12, 5x − 3y = 1"
            steps={[
              'Искаме пред y да стои 6 и −6: умножаваме първото уравнение по 3, второто – по 2',
              '9x + 6y = 36 и 10x − 6y = 2',
              'Събираме: 19x = 38 ⇒ x = 2',
              'Заместваме в първото: 6 + 2y = 12 ⇒ y = 3',
              'Отговор: (2; 3)',
            ]}
          />
          <p className={text}>
            Опитай сам: подбери множителите k₁ и k₂ така, че y (или x) да изчезне. Наблюдавай жълтата пунктирна права – това е новото
            уравнение. Тя винаги минава през решението!
          </p>
          <EliminationLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Графичен смисъл. Колко решения има?</h2>
          <p className={text}>
            Графиката на уравнението ax + by = c (ако a и b не са едновременно 0) е права. Решението на системата е точка, която лежи и на
            двете прави – тяхната <strong>пресечна точка</strong>. Две прави в равнината могат да бъдат разположени само по три начина:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-green-600 dark:text-green-400">Пресичат се → едно решение</p>
              <p className="font-mono text-sm">x + y = 5; x − y = 1 → (3; 2)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-red-600 dark:text-red-400">Успоредни → няма решение</p>
              <p className="font-mono text-sm">x + y = 5; x + y = 2 → 0 = 3 ✗</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">Съвпадат → безброй решения</p>
              <p className="font-mono text-sm">x + y = 5; 2x + 2y = 10 → 0 = 0</p>
            </div>
          </div>
          <p className={text}>
            Дали правите се пресичат, зависи само от коефициентите пред x и y. Ако умножим първото уравнение по b₂, второто по b₁ и извадим,
            остава (a₁b₂ − a₂b₁)x = c₁b₂ − c₂b₁. Числото пред x е толкова важно, че има име.
          </p>
          <Theorem
            title="Правило на Крамер"
            description="За системата a₁x + b₁y = c₁, a₂x + b₂y = c₂ въвеждаме детерминантите D = a₁b₂ − a₂b₁, Dₓ = c₁b₂ − c₂b₁ и Dᵧ = a₁c₂ − a₂c₁. Ако D ≠ 0, системата има единствено решение x = Dₓ/D, y = Dᵧ/D. Ако D = 0, а Dₓ ≠ 0 или Dᵧ ≠ 0 – няма решение. Ако D = Dₓ = Dᵧ = 0 (и във всяко уравнение поне един коефициент пред x или y е различен от 0) – решенията са безброй много."
          />
          <SystemGraphLab />
          <Example
            description="Да решим системата 3x − 2y = 1, 4x + y = 5 с детерминанти."
            steps={[
              'D = 3 · 1 − 4 · (−2) = 3 + 8 = 11 ≠ 0 – има единствено решение',
              'Dₓ = 1 · 1 − 5 · (−2) = 11 ⇒ x = 11/11 = 1',
              'Dᵧ = 3 · 5 − 4 · 1 = 11 ⇒ y = 11/11 = 1',
              'Отговор: (1; 1). Проверка: 3 − 2 = 1 ✓; 4 + 1 = 5 ✓',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Системи с параметър</h2>
          <p className={text}>
            Когато в коефициентите има параметър, детерминантите са най-краткият път: първо намираме стойностите, при които D = 0 – там
            правите са успоредни или съвпадат – и ги разглеждаме отделно.
          </p>
          <Example
            description="Да изследваме системата ax + y = 1, x + ay = 1 за всяка стойност на a."
            steps={[
              'D = a · a − 1 · 1 = a² − 1 = (a − 1)(a + 1); Dₓ = 1 · a − 1 · 1 = a − 1; Dᵧ = a · 1 − 1 · 1 = a − 1',
              'a ≠ ±1: D ≠ 0 ⇒ x = y = (a − 1)/((a − 1)(a + 1)) = 1/(a + 1) – единствено решение',
              'a = 1: двете уравнения са x + y = 1 – правите съвпадат, решенията са безброй много',
              'a = −1: −x + y = 1 и x − y = 1, т.е. y = x + 1 и y = x − 1 – успоредни прави, няма решение',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Нелинейни системи</h2>
          <p className={text}>
            Ако едното уравнение е линейно, а другото – квадратно (например x² + y² = 25 или xy = 6), пак работи заместването: изразяваме
            неизвестно от линейното уравнение и получаваме квадратно уравнение. Затова решенията може да са две, едно или нито едно.
          </p>
          <Example
            description="Да решим системата x² + y² = 25, x − y = 1"
            steps={[
              'От второто уравнение: x = y + 1',
              'Заместваме: (y + 1)² + y² = 25 ⇒ 2y² + 2y − 24 = 0 ⇒ y² + y − 12 = 0',
              'y = 3 или y = −4; съответно x = 4 или x = −3',
              'Отговор: (4; 3) и (−3; −4) – правата пресича окръжността в две точки',
            ]}
          />
          <Theorem
            title="Симетрични системи и формулите на Виет"
            description="Ако x + y = s и xy = p, то x и y са корените на квадратното уравнение t² − st + p = 0. Ако корените са t₁ и t₂, решенията на системата са (t₁; t₂) и (t₂; t₁). Полезни тъждества: x² + y² = s² − 2p и x³ + y³ = s³ − 3ps."
          />
          <Example
            description="Да решим системата x + y = 5, xy = 6"
            steps={['x и y са корените на t² − 5t + 6 = 0', 't₁ = 2, t₂ = 3', 'Отговор: (2; 3) и (3; 2) – не забравяй и двете наредени двойки!']}
          />
          <LineCurveLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. От текст към система</h2>
          <p className={text}>
            При текстовите задачи системата често е по-естествена от едно уравнение: всяко условие в текста става отделно уравнение. Означи
            двете неизвестни, запиши по едно уравнение за всяко условие, реши и провери дали отговорът има смисъл (брой хора не може да е
            дробен или отрицателен).
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Умножена е само лявата страна', '(2x + y = 5) · 3 → 6x + 3y = 5', '6x + 3y = 15'],
              ['Знак при изваждане на уравнения', '(3x + 2y = 12) − (3x − 4y = 6) → −2y = 6', '2y − (−4y) = 6y ⇒ 6y = 6'],
              ['Отговорът е само едно число', 'намерихме x = 3 → „отговор: 3“', 'отговор: двойката (3; 2)'],
              ['Изгубено решение при симетрична система', 'x + y = 5, xy = 6 → само (2; 3)', '(2; 3) и (3; 2)'],
              ['Проверка само в едното уравнение', '(1; 3) пасва на x + y = 4 → решение', 'проверяваме и в двете уравнения'],
              ['Делене на D, без да проверим D ≠ 0', 'x = (a − 1)/(a² − 1) за всяко a', 'при a = ±1 отделно изследване'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">{title}</p>
                <p className="font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Безкраен брой системи с цели решения. Избери метод, реши и въведи x и y.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={systemsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Реши системата 2x + 3y = 13, x − y = −1.">
                <p>От второто уравнение: x = y − 1</p>
                <p>Заместваме: 2(y − 1) + 3y = 13 ⇒ 5y − 2 = 13 ⇒ y = 3</p>
                <p>x = 3 − 1 = 2. Отговор: (2; 3)</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Реши системата 4x − 3y = 2, 6x + 5y = 41.">
                <p>Изравняваме коефициентите пред x: първото по 3, второто по 2.</p>
                <p>12x − 9y = 6 и 12x + 10y = 82</p>
                <p>Изваждаме първото от второто: 19y = 76 ⇒ y = 4</p>
                <p>4x − 12 = 2 ⇒ x = 3,5. Отговор: (3,5; 4)</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="В клас има 28 ученици, а момичетата са с 4 повече от момчетата. Колко са момичетата и колко момчетата?">
                <p>Нека m са момичетата, b – момчетата: m + b = 28 и m − b = 4</p>
                <p>Събираме: 2m = 32 ⇒ m = 16</p>
                <p>b = 28 − 16 = 12. Отговор: 16 момичета и 12 момчета</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Реши системата x/3 + y/4 = 3, x/2 − y/4 = 2.">
                <p>Коефициентите пред y вече са противоположни – събираме уравненията:</p>
                <p>x/3 + x/2 = 5 ⇒ 5x/6 = 5 ⇒ x = 6</p>
                <p>6/3 + y/4 = 3 ⇒ y/4 = 1 ⇒ y = 4. Отговор: (6; 4)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Изследвай системата x + ay = 2, ax + 4y = 4 в зависимост от параметъра a.">
                <p>D = 1 · 4 − a · a = 4 − a²; Dₓ = 2 · 4 − 4 · a = 4(2 − a); Dᵧ = 1 · 4 − a · 2 = 2(2 − a)</p>
                <p>a ≠ ±2: x = 4(2 − a)/((2 − a)(2 + a)) = 4/(a + 2), y = 2/(a + 2) – единствено решение.</p>
                <p>a = 2: x + 2y = 2 и 2x + 4y = 4 – едно и също уравнение, безброй решения (x = 2 − 2y, y – произволно).</p>
                <p>a = −2: x − 2y = 2 и −2x + 4y = 4, т.е. x − 2y = −2 – успоредни прави, няма решение.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Реши системата x² + y² = 13, x + y = 5.">
                <p>x² + y² = (x + y)² − 2xy ⇒ 13 = 25 − 2xy ⇒ xy = 6</p>
                <p>x и y са корените на t² − 5t + 6 = 0 ⇒ t = 2 или t = 3</p>
                <p>Отговор: (2; 3) и (3; 2)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Реши системата с три неизвестни: x + y + z = 6, x − y + 2z = 5, 2x + y − z = 1.">
                <p>Събираме първото и второто: 2x + 3z = 11. Събираме второто и третото: 3x + z = 6.</p>
                <p>Получихме система с две неизвестни. От второто: z = 6 − 3x.</p>
                <p>2x + 3(6 − 3x) = 11 ⇒ 18 − 7x = 11 ⇒ x = 1, z = 3</p>
                <p>y = 6 − x − z = 2. Отговор: (1; 2; 3)</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Реши системата x³ + y³ = 35, x + y = 5.">
                <p>Нека s = x + y = 5 и p = xy. Тогава x³ + y³ = (x + y)³ − 3xy(x + y) = s³ − 3ps.</p>
                <p>125 − 15p = 35 ⇒ p = 6</p>
                <p>x и y са корените на t² − 5t + 6 = 0 ⇒ 2 и 3</p>
                <p>Отговор: (2; 3) и (3; 2)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="За кои стойности на a системата x² + y² = 1, y = x + a има единствено решение? Обясни геометрично.">
                <p>Заместваме: x² + (x + a)² = 1 ⇒ 2x² + 2ax + a² − 1 = 0</p>
                <p>Единствено решение ⇔ D/4 = a² − 2(a² − 1) = 2 − a² = 0 ⇔ a = ±√2</p>
                <p>Тогава x = −a/2 и решенията са (−√2/2; √2/2) при a = √2 и (√2/2; −√2/2) при a = −√2.</p>
                <p>Геометрично: правата се допира до единичната окръжност – разстоянието от центъра до нея |a|/√2 е равно на радиуса 1.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Решение на система с две неизвестни е наредена двойка (x; y), която удовлетворява всяко уравнение</li>
              <li>✓ Заместване: изразяваме едното неизвестно и го заместваме в другото уравнение</li>
              <li>✓ Събиране: умножаваме уравненията така, че едно неизвестно да изчезне при събирането им</li>
              <li>✓ Графично: решението е пресечната точка на правите – пресичат се, успоредни са или съвпадат</li>
              <li>✓ Крамер: D = a₁b₂ − a₂b₁; при D ≠ 0 – x = Dₓ/D, y = Dᵧ/D</li>
              <li>✓ Параметър: първо разглеждаме стойностите, при които D = 0</li>
              <li>✓ Нелинейни системи: заместване → квадратно уравнение; симетрични – чрез x + y = s, xy = p</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Методът на събирането е много стар. В осмата глава на китайския трактат „Девет глави за математическото изкуство“ (окончателно
              оформен около I–II век) системите се записват като таблици от числа и се решават, като от един ред се изважда кратно на друг – по
              същество методът, който в Европа днес носи името на Гаус (XIX век). А формулите с детерминанти Габриел Крамер публикува през
              1750 г., макар че Колин Маклорен ги е познавал малко по-рано.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
