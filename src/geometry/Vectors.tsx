import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { DecomposeLab } from './DecomposeLab';
import { DotProductLab } from './DotProductLab';
import { VectorAddLab } from './VectorAddLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор: действия с координати ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
const vec = (x: number, y: number) => `(${num(x)}; ${num(y)})`;

type Drill = { text: string; x: number; y: number; steps: string[] };

const newDrill = (): Drill => {
  const [ax, ay, bx, by] = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)];
  const k = randNonZero(-3, 3);
  const m = randNonZero(-3, 3);
  const ka = (k === 1 ? '' : k === -1 ? '−' : num(k)) + 'a';
  const mb = (Math.abs(m) === 1 ? '' : num(Math.abs(m))) + 'b';
  return {
    text: `a = ${vec(ax, ay)}, b = ${vec(bx, by)}. Намери ${ka} ${m < 0 ? '−' : '+'} ${mb}.`,
    x: k * ax + m * bx,
    y: k * ay + m * by,
    steps: [
      `${num(k)} · a = ${vec(k * ax, k * ay)}`,
      `${num(m)} · b = ${vec(m * bx, m * by)}`,
      `Събираме съответните координати: (${num(k * ax)} + ${par(m * bx)}; ${num(k * ay)} + ${par(m * by)}) = ${vec(k * ax + m * bx, k * ay + m * by)}`,
    ],
  };
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
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={e => {
        set(e.target.value);
        if (result === 'wrong') setResult(null);
      }}
      onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
      disabled={result === 'correct'}
      className="w-16 px-2 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
    />
  );

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center font-mono text-lg sm:text-xl mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-xl">(</span>
        {input('първа координата', inX, setInX)}
        <span className="font-mono text-xl">;</span>
        {input('втора координата', inY, setInY)}
        <span className="font-mono text-xl">)</span>
        {result === 'correct' ? (
          <button onClick={next} className="ml-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следваща →
          </button>
        ) : (
          <button onClick={check} className="ml-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
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
            : 'Не съвсем. Пресметни всяка координата поотделно.'}
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
    title: '✈️ Самолет и вятър',
    problem: 'Самолет лети спрямо въздуха на север със скорост 200 km/h, а вятърът духа на изток с 50 km/h. С каква скорост се движи самолетът спрямо земята?',
    solution: [
      'Скоростта спрямо земята е сборът на векторите: v = (0; 200) + (50; 0) = (50; 200).',
      '|v| = √(50² + 200²) = √42 500',
      '|v| ≈ 206,2 km/h (а курсът се отклонява на около 14° към изток)',
    ],
    answer: '≈ 206,2 km/h',
    check: [206.2],
    ask: ['скорост, km/h'],
  },
  {
    title: '🚣 Лодка през река',
    problem: 'Лодка се движи перпендикулярно на брега с 4 m/s спрямо водата, а течението е 3 m/s. Реката е широка 100 m. За колко време лодката ще стигне другия бряг и на колко метра надолу по течението ще я отнесе?',
    solution: ['Двете скорости са перпендикулярни и действат независимо.', 'Време: 100 : 4 = 25 s', 'Отнасяне: 3 · 25 = 75 m (а скоростта спрямо брега е √(4² + 3²) = 5 m/s)'],
    answer: '25 s; 75 m',
    check: [25, 75],
    ask: ['време, s', 'отнасяне, m'],
  },
  {
    title: '🪢 Две сили',
    problem: 'Две момчета дърпат шейна с въжета под прав ъгъл едно спрямо друго – с 30 N и 40 N. Каква е големината на равнодействащата сила?',
    solution: ['Равнодействащата е сборът на векторите на силите.', 'Те са перпендикулярни: |F| = √(30² + 40²) = √2500', '|F| = 50 N'],
    answer: '50 N',
    check: [50],
    ask: ['сила, N'],
  },
  {
    title: '🛷 Работа',
    problem: 'Шейна се тегли 20 m по хоризонтален път с въже под ъгъл 60° спрямо пътя и сила 50 N. Каква работа извършва силата? (Работата е скаларното произведение на силата и преместването.)',
    solution: ['A = F · s = |F| · |s| · cos φ', 'A = 50 · 20 · cos 60° = 1000 · 0,5', 'A = 500 J'],
    answer: '500 J',
    check: [500],
    ask: ['работа, J'],
  },
  {
    title: '🥾 Разходка',
    problem: 'Туристка върви 3 km на изток, после 4 km на север и накрая 1 km на запад. На какво разстояние (по права линия) е от началната точка?',
    solution: ['Преместванията като вектори: (3; 0) + (0; 4) + (−1; 0) = (2; 4)', 'Разстояние: √(2² + 4²) = √20', '√20 ≈ 4,47'],
    answer: '≈ 4,47 km',
    check: [4.47],
    ask: ['разстояние, km'],
  },
  {
    title: '⚓ Котва',
    problem: 'Две въжета държат котва със сили по 10 N, които сключват ъгъл 60°. Колко е големината на общата сила?',
    solution: ['|F₁ + F₂|² = |F₁|² + |F₂|² + 2 · F₁ · F₂ = 100 + 100 + 2 · 10 · 10 · cos 60°', '= 200 + 100 = 300', '|F| = √300 ≈ 17,32 N'],
    answer: '≈ 17,32 N',
    check: [17.32],
    ask: ['сила, N'],
  },
];

// ---------- Тест ----------

const vectorsQuiz: Question[] = [
  {
    question: 'На колко е равно AB + BC?',
    answers: ['AC', 'CA', 'BA + CB', 'нулевия вектор'],
    correctAnswer: 'AC',
  },
  {
    question: 'a = (2; 3), b = (−1; 4). Колко е a + b?',
    answers: ['(1; 7)', '(3; −1)', '(1; −1)', '(−2; 12)'],
    correctAnswer: '(1; 7)',
  },
  {
    question: 'Колко е дължината на вектора a = (3; −4)?',
    answers: ['1', '5', '7', '25'],
    correctAnswer: '5',
  },
  {
    question: 'a = (1; 2), b = (3; −1). Колко е 2a − b?',
    answers: ['(−1; 5)', '(5; 3)', '(−1; 3)', '(2; 5)'],
    correctAnswer: '(−1; 5)',
  },
  {
    question: 'При кое k векторите (2; k) и (3; 6) са колинеарни?',
    answers: ['k = 3', 'k = 4', 'k = 6', 'k = 9'],
    correctAnswer: 'k = 4',
  },
  {
    question: 'a = (1; 2), b = (3; −1). Колко е скаларното произведение a · b?',
    answers: ['1', '5', '(3; −2)', '−1'],
    correctAnswer: '1',
  },
  {
    question: 'Ненулевите вектори a и b са перпендикулярни точно когато:',
    answers: ['a · b = 0', 'a · b = 1', '|a| = |b|', 'a + b = 0'],
    correctAnswer: 'a · b = 0',
  },
  {
    question: 'M е средата на отсечката AB, а O е произволна точка. Кое е вярно?',
    answers: ['OM = (OA + OB)/2', 'OM = OA + OB', 'OM = (OB − OA)/2', 'OM = OA − OB'],
    correctAnswer: 'OM = (OA + OB)/2',
  },
  {
    question: 'G е медицентърът на триъгълник ABC. На колко е равно GA + GB + GC?',
    answers: ['нулевия вектор', 'AB', '3 · GA', 'зависи от триъгълника'],
    correctAnswer: 'нулевия вектор',
  },
];

// ---------- Страница ----------

export function Vectors() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Вектори</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ✈️ Пилот насочва самолета точно на север и лети с 200 km/h спрямо въздуха. Но вятърът духа на изток с 50 km/h. Къде ще бъде след
            един час? Не на 200 km на север и не на 250 km „някъде“. Двете скорости се събират не като числа, а като стрелки – и самолетът
            лети по диагонала, малко по-бързо и отклонен на изток. Величините, които имат и големина, и посока – скорост, сила, преместване –
            се описват с <strong>вектори</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е вектор?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> „Отидох 5 km и се върнах 5 km. Колко съм изминал?“ – 10 km. „А на какво разстояние съм от
              началото?“ – 0 km. Изминатият път е число, а преместването е вектор: двете премествания са равни по дължина, но противоположни по
              посока, и се унищожават.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Вектор"
            description="Вектор е насочена отсечка – отсечка, за която е казано коя точка е начало и коя край. Записваме AB (A е начало, B е край) или с една малка буква, a. Дължината на вектора се бележи |AB|. Два вектора са равни, ако имат еднаква дължина и еднаква посока – тогава единият се получава от другия чрез успоредно пренасяне. Нулевият вектор има начало и край в една точка."
          />
          <p className={text}>
            Векторите AB и BA имат еднаква дължина, но противоположни посоки: BA = −AB. Ненулеви вектори, които лежат на успоредни прави (или на
            една права), се наричат <strong>колинеарни</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Събиране и изваждане</h2>
          <Theorem
            title="Правило на триъгълника и на успоредника"
            description="Правило на триъгълника: AB + BC = AC – краят на първия вектор е начало на втория. Правило на успоредника: ако a = AB и b = AD са страни на успоредника ABCD, то a + b = AC (диагоналът), а b − a = BD. Събирането е разместително и съдружително; a − b = a + (−b)."
          />
          <VectorAddLab />
          <Example
            description="ABCD е успоредник, AB = a, AD = b. Да изразим AC, BD и CA чрез a и b."
            steps={['AC = AB + BC = a + b (BC = AD, защото са равни и еднопосочни)', 'BD = BA + AD = −a + b = b − a', 'CA = −AC = −a − b']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Умножение с число</h2>
          <Theorem
            type="definition"
            title="Произведение на вектор с число"
            description="k · a е вектор, колинеарен на a, с дължина |k| · |a|; при k > 0 е еднопосочен с a, при k < 0 – противопосочен. Обратно: ако a ≠ 0 и b е колинеарен на a, то b = k · a за някое число k."
          />
          <p className={text}>
            Това дава удобен запис на познати факти. Ако M е средата на AB, то за всяка точка O: <span className="font-mono">OM = (OA + OB)/2</span>.
            Средната отсечка MN в триъгълник ABC удовлетворява <span className="font-mono">MN = ½ BC</span> – едновременно казва, че е успоредна и
            два пъти по-къса. Нещо повече: всеки вектор в равнината се изразява по единствен начин чрез два неколинеарни вектора.
          </p>
          <Theorem
            title="Разлагане на вектор"
            description="Ако a и b са неколинеарни, всеки вектор c от равнината може да се запише по единствен начин като c = x · a + y · b. Числата x и y се намират от система от две линейни уравнения."
          />
          <DecomposeLab />
          <p className={text}>
            Обърни внимание: намирането на x и y е точно{' '}
            <Link to="/algebra/systems" className={link}>
              система уравнения
            </Link>
            , а условието a и b да не са колинеарни е условието детерминантата ѝ да не е 0.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Координати на вектор</h2>
          <Theorem
            title="Действия в координати"
            description="Ако A(x₁; y₁) и B(x₂; y₂), то AB = (x₂ − x₁; y₂ − y₁) – „край минус начало“. За a = (a₁; a₂) и b = (b₁; b₂): a + b = (a₁ + b₁; a₂ + b₂), k · a = (k · a₁; k · a₂), |a| = √(a₁² + a₂²). Средата на AB е M((x₁ + x₂)/2; (y₁ + y₂)/2)."
          />
          <Example
            description="A(1; 2) и B(4; 6). Да намерим AB, дължината му и средата M на AB."
            steps={['AB = (4 − 1; 6 − 2) = (3; 4)', '|AB| = √(3² + 4²) = √25 = 5', 'M((1 + 4)/2; (2 + 6)/2) = M(2,5; 4)']}
          />
          <Example
            description="При кое k векторите a = (2; k) и b = (3; 6) са колинеарни?"
            steps={['Колинеарни ⇔ координатите са пропорционални: 2/3 = k/6', 'k = 4 (тогава b = 1,5 · a)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Скаларно произведение</h2>
          <Theorem
            type="definition"
            title="Скаларно произведение"
            description="Скаларното произведение на векторите a и b е числото a · b = |a| · |b| · cos φ, където φ е ъгълът между тях. В координати: a · b = a₁b₁ + a₂b₂. Следствия: a · a = |a|²; a ⊥ b ⇔ a · b = 0; cos φ = a · b / (|a| · |b|)."
          />
          <DotProductLab />
          <Example
            description="Да намерим ъгъла между a = (1; 2) и b = (3; 1)."
            steps={['a · b = 1 · 3 + 2 · 1 = 5', '|a| = √5, |b| = √10', 'cos φ = 5/(√5 · √10) = 5/√50 = 1/√2 = √2/2', 'φ = 45°']}
          />
          <p className={text}>
            Двете формули за скаларното произведение свързват координатите с{' '}
            <Link to="/geometry/trigonometry" className={link}>
              тригонометрията
            </Link>
            . Например от |a − b|² = |a|² + |b|² − 2 a · b веднага следва косинусовата теорема.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни координатите на линейната комбинация.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Задачи от живота</h2>
          <p className={text}>Във физиката почти всичко е вектор: скорост, сила, преместване, ускорение. Те се събират по правилото на успоредника.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Начало минус край', 'A(1; 2), B(4; 6) ⇒ AB = (−3; −4)', 'AB = B − A = (3; 4)'],
              ['Дължината на сбора', '|a + b| = |a| + |b|', 'само при еднопосочни вектори; иначе |a + b| < |a| + |b|'],
              ['Скаларното произведение е вектор', '(1; 2) · (3; −1) = (3; −2)', '(1; 2) · (3; −1) = 3 − 2 = 1 (число!)'],
              ['Неверен ред на буквите', 'AB + CB = AC', 'AB + BC = AC; CB = −BC'],
              ['Колинеарност по една координата', '(2; 4) и (2; 5) – колинеарни, защото 2 = 2', '2/2 ≠ 4/5 ⇒ не са колинеарни'],
              ['Квадрат на сбор', '|a + b|² = |a|² + |b|²', '|a + b|² = |a|² + 2 a · b + |b|²'],
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
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={vectorsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Дадени са A(1; 2) и B(4; 6). Намерете координатите на AB, дължината му и средата на AB.">
                <p>AB = (4 − 1; 6 − 2) = (3; 4)</p>
                <p>|AB| = √(9 + 16) = 5</p>
                <p>Средата е M(2,5; 4).</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="a = (2; −1), b = (−3; 4). Намерете 3a + 2b и дължината му.">
                <p>3a = (6; −3), 2b = (−6; 8)</p>
                <p>3a + 2b = (0; 5)</p>
                <p>|3a + 2b| = 5</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="ABCD е успоредник, AB = a и AD = b. Изразете чрез a и b векторите AC, BD и DB.">
                <p>AC = a + b (правило на успоредника)</p>
                <p>BD = AD − AB = b − a</p>
                <p>DB = −BD = a − b</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="A(1; 1), B(5; 2) и C(2; 5) са три върха на успоредника ABCD. Намерете D.">
                <p>В успоредник AD = BC.</p>
                <p>BC = (2 − 5; 5 − 2) = (−3; 3)</p>
                <p>D = A + BC = (1 − 3; 1 + 3) = (−2; 4)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете ъгъла между векторите a = (1; 2) и b = (3; 1).">
                <p>a · b = 3 + 2 = 5; |a| = √5; |b| = √10</p>
                <p>cos φ = 5/√50 = √2/2</p>
                <p>φ = 45°</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="При кое k векторите a = (k; 2) и b = (3; −6) са перпендикулярни?">
                <p>a ⊥ b ⇔ a · b = 0</p>
                <p>3k − 12 = 0</p>
                <p>k = 4</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Нека G е точката, за която GA + GB + GC = 0. Докажи, че G лежи на медианата от A и я дели в отношение 2 : 1 (така G е медицентърът).">
                <p>Нека M е средата на BC. Тогава GB + GC = 2 · GM.</p>
                <p>Условието става GA + 2 · GM = 0, т.е. GA = −2 · GM.</p>
                <p>Значи A, G и M са на една права (векторите са колинеарни), G е между A и M и AG = 2 · GM.</p>
                <p>Същото важи за другите две медиани ⇒ трите минават през G – това доказва, че медианите се пресичат в една точка.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В триъгълник ABC точката M е върху BC и BM : MC = 1 : 2. Изразете AM чрез AB и AC.">
                <p>BM = ⅓ BC = ⅓ (AC − AB)</p>
                <p>AM = AB + BM = AB + ⅓ AC − ⅓ AB</p>
                <p>AM = ⅔ AB + ⅓ AC (коефициентите са „наопаки“ на отношението и сборът им е 1)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажи, че в успоредник сборът от квадратите на диагоналите е равен на сбора от квадратите на четирите страни.">
                <p>Нека страните са a и b; диагоналите са a + b и a − b.</p>
                <p>|a + b|² = |a|² + 2 a · b + |b|²; |a − b|² = |a|² − 2 a · b + |b|²</p>
                <p>Събираме: |a + b|² + |a − b|² = 2|a|² + 2|b|² – точно сборът от квадратите на четирите страни.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Векторът има големина и посока; равни вектори – еднаква дължина и посока</li>
              <li>✓ AB + BC = AC; при успоредник сборът е диагоналът</li>
              <li>✓ k · a е колинеарен на a; всеки вектор се разлага по два неколинеарни: c = xa + yb</li>
              <li>✓ AB = (x₂ − x₁; y₂ − y₁); |a| = √(a₁² + a₂²); средата на AB: OM = (OA + OB)/2</li>
              <li>✓ a · b = |a||b| cos φ = a₁b₁ + a₂b₂; a ⊥ b ⇔ a · b = 0</li>
              <li>✓ Медицентър: GA + GB + GC = 0</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „вектор“ идва от латинското <em>vehere</em> – „нося, возя“; vector е „носител“. В математиката я въвежда ирландецът
              Уилям Роуън Хамилтън. На 16 октомври 1843 г., докато се разхожда покрай канал в Дъблин, той открива как да умножава
              „тримерни числа“ (кватерниони) и издълбава формулата i² = j² = k² = ijk = −1 в камъка на мост. Надписът отдавна не се вижда, но
              на моста днес има паметна плоча, а математици всяка година повтарят разходката му.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
