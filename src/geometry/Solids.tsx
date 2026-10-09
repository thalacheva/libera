import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { ArchimedesLab } from './ArchimedesLab';
import { CubeScaleLab } from './CubeScaleLab';
import { SolidViewerLab } from './SolidViewerLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор: обеми ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

type Drill = { text: string; answer: number; withPi: boolean; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const [a, b, c] = [randInt(2, 9), randInt(2, 9), randInt(2, 12)];
    return { text: `Обем на правоъгълен паралелепипед с ръбове ${a}, ${b} и ${c}.`, answer: a * b * c, withPi: false, steps: [`V = a · b · c = ${a} · ${b} · ${c} = ${a * b * c}`] };
  }
  if (kind === 1) {
    const [r, h] = [randInt(1, 6), randInt(2, 10)];
    return { text: `Обем на цилиндър с радиус ${r} и височина ${h}.`, answer: r * r * h, withPi: true, steps: [`V = πr²h = π · ${r * r} · ${h} = ${r * r * h}π`] };
  }
  if (kind === 2) {
    const r = randInt(1, 6);
    const h = 3 * randInt(1, 4);
    return { text: `Обем на конус с радиус ${r} и височина ${h}.`, answer: (r * r * h) / 3, withPi: true, steps: [`V = ⅓πr²h = ⅓ · π · ${r * r} · ${h} = ${(r * r * h) / 3}π`] };
  }
  if (kind === 3) {
    const r = 3 * randInt(1, 3);
    return { text: `Обем на кълбо с радиус ${r}.`, answer: (4 * r ** 3) / 3, withPi: true, steps: [`V = ⁴⁄₃πr³ = ⁴⁄₃ · π · ${r ** 3} = ${(4 * r ** 3) / 3}π`] };
  }
  const [a, h] = [randInt(2, 9), 3 * randInt(1, 4)];
  return {
    text: `Обем на правилна четириъгълна пирамида с основен ръб ${a} и височина ${h}.`,
    answer: (a * a * h) / 3,
    withPi: false,
    steps: [`B = ${a}² = ${a * a}`, `V = ⅓ · B · h = ⅓ · ${a * a} · ${h} = ${(a * a * h) / 3}`],
  };
};

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const v = Number(input.trim().replace(',', '.').replace('π', ''));
    if (input.trim() === '' || Number.isNaN(v)) return;
    if (Math.abs(v - task.answer) < 1e-9) {
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
    setInput('');
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>
      <p className="text-center text-base sm:text-lg mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>
      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-lg">V =</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Обем"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-24 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
        {task.withPi && <span className="font-mono text-lg">π</span>}
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
          {result === 'correct' ? (streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : 'Браво! 🎉') : 'Не съвсем. Провери формулата – има ли ⅓?'}
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
    title: '🐠 Аквариум',
    problem: 'Аквариум има форма на правоъгълен паралелепипед с размери $60\\ \\mathrm{cm} \\times 30\\ \\mathrm{cm} \\times 40\\ \\mathrm{cm}$. Колко литра вода събира?',
    solution: ['$V = 60 \\cdot 30 \\cdot 40 = 72\\,000\\ \\mathrm{cm}^3$', '$1\\ \\mathrm{l} = 1\\ \\mathrm{dm}^3 = 1000\\ \\mathrm{cm}^3$', '$72\\,000 : 1000 = 72\\ \\mathrm{l}$'],
    answer: '72 l',
    check: [72],
    ask: ['литри'],
  },
  {
    title: '🫙 Буркан',
    problem: 'Цилиндричен буркан има радиус 4 cm и височина 10 cm. Колко кубически сантиметра събира?',
    solution: ['$V = \\pi r^2h = \\pi \\cdot 16 \\cdot 10 = 160\\pi$', '$\\approx 502{,}65\\ \\mathrm{cm}^3$ (около половин литър)'],
    answer: '$\\approx 502{,}65\\ \\mathrm{cm}^3$',
    check: [502.65],
    ask: ['обем, cm³'],
  },
  {
    title: '🍦 Фунийка',
    problem: 'Фунийка за сладолед е конус с радиус 3 cm и височина 10 cm. Колко сладолед побира (без „топката“ отгоре)?',
    solution: ['$V = \\tfrac{1}{3}\\pi r^2h = \\tfrac{1}{3} \\cdot \\pi \\cdot 9 \\cdot 10 = 30\\pi$', '$\\approx 94{,}25\\ \\mathrm{cm}^3$'],
    answer: '$\\approx 94{,}25\\ \\mathrm{cm}^3$',
    check: [94.25],
    ask: ['обем, cm³'],
  },
  {
    title: '🌍 Повърхността на Земята',
    problem: 'Приемаме, че Земята е кълбо с радиус $6371\\ \\mathrm{km}$. Колко е лицето на повърхността ѝ (в милиони $\\mathrm{km}^2$)?',
    solution: ['$S = 4\\pi R^2 = 4\\pi \\cdot 6371^2$', '$\\approx 4 \\cdot 3{,}1416 \\cdot 40\\,589\\,641 \\approx 510\\,064\\,000\\ \\mathrm{km}^2$', '$\\approx 510$ милиона $\\mathrm{km}^2$ (от тях около 71% е вода)'],
    answer: '$\\approx 510$ милиона $\\mathrm{km}^2$',
    check: [510],
    ask: ['милиона km²'],
  },
  {
    title: '🔺 Пирамидата на Хеопс',
    problem: 'Великата пирамида първоначално е имала квадратна основа със страна около $230\\ \\mathrm{m}$ и височина около $146{,}6\\ \\mathrm{m}$. Какъв е бил обемът ѝ (в милиони $\\mathrm{m}^3$)?',
    solution: ['$V = \\tfrac{1}{3} \\cdot B \\cdot h = \\tfrac{1}{3} \\cdot 230^2 \\cdot 146{,}6$', '$= \\tfrac{1}{3} \\cdot 52\\,900 \\cdot 146{,}6 \\approx 2\\,585\\,000\\ \\mathrm{m}^3$', '$\\approx 2{,}59$ милиона $\\mathrm{m}^3$'],
    answer: '$\\approx 2{,}59$ милиона $\\mathrm{m}^3$',
    check: [2.59],
    ask: ['милиона m³'],
  },
  {
    title: '📦 Кутия и пръчка',
    problem: 'Кашон е с вътрешни размери $30\\ \\mathrm{cm} \\times 40\\ \\mathrm{cm} \\times 120\\ \\mathrm{cm}$. Каква е най-дългата права пръчка, която може да се събере в него?',
    solution: ['Най-дългата отсечка е пространственият диагонал: $d = \\sqrt{a^2 + b^2 + c^2}$', '$d = \\sqrt{900 + 1600 + 14\\,400} = \\sqrt{16\\,900}$', '$d = 130\\ \\mathrm{cm}$'],
    answer: '130 cm',
    check: [130],
    ask: ['дължина, cm'],
  },
];

// ---------- Тест ----------

const solidsQuiz: Question[] = [
  { question: 'Колко е обемът на куб с ръб $3\\ \\mathrm{cm}$?', answers: ['$9\\ \\mathrm{cm}^3$', '$18\\ \\mathrm{cm}^3$', '$27\\ \\mathrm{cm}^3$', '$54\\ \\mathrm{cm}^3$'], correctAnswer: '$27\\ \\mathrm{cm}^3$' },
  { question: 'На колко е равно $V - E + F$ за всеки изпъкнал многостен?', answers: ['0', '1', '2', 'зависи от многостена'], correctAnswer: '2' },
  { question: 'Колко правилни (Платонови) многостена има?', answers: ['4', '5', '6', 'безброй'], correctAnswer: '5' },
  {
    question: 'Каква част от обема на цилиндъра е обемът на конус със същата основа и височина?',
    answers: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{2}{3}$', '$\\frac{1}{4}$'],
    correctAnswer: '$\\frac{1}{3}$',
  },
  { question: 'Колко е лицето на сфера с радиус $r$?', answers: ['$\\pi r^2$', '$2\\pi r^2$', '$4\\pi r^2$', '$\\tfrac{4}{3}\\pi r^3$'], correctAnswer: '$4\\pi r^2$' },
  { question: 'Ако удвоим ръба на куб, колко пъти се увеличава обемът му?', answers: ['2', '4', '6', '8'], correctAnswer: '8' },
  { question: 'Колко е диагоналът на куб с ръб $a$?', answers: ['$a\\sqrt{2}$', '$a\\sqrt{3}$', '$2a$', '$3a$'], correctAnswer: '$a\\sqrt{3}$' },
  { question: 'Кое е обемът на пирамида с лице на основата $B$ и височина $h$?', answers: ['$B \\cdot h$', '$\\tfrac{1}{2} \\cdot B \\cdot h$', '$\\tfrac{1}{3} \\cdot B \\cdot h$', '$\\tfrac{1}{4} \\cdot B \\cdot h$'], correctAnswer: '$\\tfrac{1}{3} \\cdot B \\cdot h$' },
  {
    question: 'Кълбо е вписано в цилиндър (височината на цилиндъра е равна на диаметъра). Каква част от обема на цилиндъра заема кълбото?',
    answers: ['$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{3}{4}$', '$\\frac{\\pi}{4}$'],
    correctAnswer: '$\\frac{2}{3}$',
  },
];

// ---------- Страница ----------

export function Solids() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Стереометрия</h1>

        <div className="bg-gradient-to-br from-sky-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏛️ Архимед (III век пр.н.е.) смятал за свое най-голямо откритие не лоста и не закона за плаването, а това, че кълбо, вписано в
            цилиндър, заема точно две трети от обема му – и има две трети от неговата повърхнина. Пожелал на гроба му да изобразят кълбо в
            цилиндър. Според Цицерон, който пише за това, през 75 г. пр.н.е. той открил забравения гроб в Сиракуза именно по тази рисунка.
            Добре дошли в <strong>стереометрията</strong> – геометрията на пространството.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Многостени</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Преброй върховете, ръбовете и стените на куб: 8, 12 и 6. А на пирамида с квадратна основа: 5, 8 и
              5. Пресметни <Tex>{'V - E + F'}</Tex> и за двете. Случайност ли е, че получаваш едно и също число?
            </p>
          </div>
          <Theorem
            type="definition"
            title="Многостен"
            description="Многостен е тяло, ограничено от краен брой многоъгълници – стени. Страните им са ръбове, а върховете им – върхове на многостена. Призмата има две еднакви успоредни основи и околни стени-успоредници; пирамидата има основа многоъгълник и околни стени-триъгълници с общ връх. Правилен многостен е изпъкнал многостен, на който всички стени са еднакви правилни многоъгълници и във всеки връх се събират еднакъв брой стени."
          />
          <Theorem title="Формула на Ойлер" description="За всеки изпъкнал многостен с $V$ върха, $E$ ръба и $F$ стени е изпълнено $V - E + F = 2$." />
          <SolidViewerLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Призма и пирамида</h2>
          <Theorem
            title="Лица и обеми"
            description="Правоъгълен паралелепипед с ръбове $a$, $b$, $c$: $V = abc,\ S = 2(ab + bc + ca)$, диагонал $d = \sqrt{a^2 + b^2 + c^2}$; при куб с ръб $a$: $V = a^3,\ S = 6a^2,\ d = a\sqrt{3}$. Права призма: $V = B \cdot h$ ($B$ – лице на основата). Пирамида: $V = \tfrac{1}{3} \cdot B \cdot h$. Повърхнината на многостен е сборът от лицата на всичките му стени."
          />
          <Example
            description="Правилна четириъгълна пирамида има основен ръб 6 cm и височина 4 cm. Да намерим обема и повърхнината ѝ."
            steps={[
              '$B = 6^2 = 36\\ \\mathrm{cm}^2$; $V = \\tfrac{1}{3} \\cdot 36 \\cdot 4 = 48\\ \\mathrm{cm}^3$',
              'Апотема (височина на околна стена): $k = \\sqrt{4^2 + 3^2} = 5\\ \\mathrm{cm}$ (3 е половината от основния ръб)',
              'Околна повърхнина: $4 \\cdot \\tfrac{1}{2} \\cdot 6 \\cdot 5 = 60\\ \\mathrm{cm}^2$',
              '$S = 36 + 60 = 96\\ \\mathrm{cm}^2$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Цилиндър, конус, кълбо</h2>
          <Theorem
            title="Ротационни тела"
            description="Цилиндър: $V = \pi r^2h,\ S = 2\pi r^2 + 2\pi rh$. Конус ($l$ – образувателна): $V = \tfrac{1}{3}\pi r^2h,\ S = \pi r^2 + \pi rl$. Кълбо: $V = \tfrac{4}{3}\pi r^3$; сфера (повърхнината му): $S = 4\pi r^2$."
          />
          <ArchimedesLab />
          <Example
            description="Конус има радиус 6 cm и образувателна 10 cm. Да намерим височината, обема и повърхнината."
            steps={['$h = \\sqrt{10^2 - 6^2} = 8\\ \\mathrm{cm}$', '$V = \\tfrac{1}{3} \\cdot \\pi \\cdot 36 \\cdot 8 = 96\\pi \\approx 301{,}6\\ \\mathrm{cm}^3$', '$S = \\pi \\cdot 6 \\cdot (6 + 10) = 96\\pi \\approx 301{,}6\\ \\mathrm{cm}^2$']}
          />
          <p className={text}>
            Защо конусът е точно <Tex>{'\\tfrac{1}{3}'}</Tex> от цилиндъра? Ако срежем двете тела с хоризонтални равнини, сеченията на конуса са кръгове, които намаляват
            равномерно. <strong>Принципът на Кавалиери</strong> казва: тела с равни лица на сеченията на всяка височина имат равни обеми – а с него и
            малко алгебра се стига до <Tex>{'\\tfrac{1}{3}'}</Tex>. Връзката между лицето на кръга и <Tex>{'\\pi'}</Tex> е в урока{' '}
            <Link to="/geometry/circle" className={link}>
              Окръжност и кръг
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Подобни тела: <Tex>{'k,\\ k^2,\\ k^3'}</Tex></h2>
          <Theorem
            title="Подобни тела"
            description="Ако всички размери на тяло се умножат по $k$, всички лица (повърхнината) се умножават по $k^2$, а обемът – по $k^3$. Например модел в мащаб $1 : 10$ има 100 пъти по-малка повърхнина и 1000 пъти по-малък обем."
          />
          <CubeScaleLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 5. Тренажор
          </h2>
          <p className={text}>Пресметни обема. Ако отговорът съдържа <Tex>{'\\pi'}</Tex>, въведи само числото пред него.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Задачи от живота</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Забравена $\\tfrac{1}{3}$', 'пирамида: $V = B \\cdot h$', '$V = \\tfrac{1}{3} \\cdot B \\cdot h$ (също и при конус)'],
              ['Височина и образувателна', 'конус $r = 6,\\ l = 10$: $V = \\tfrac{1}{3}\\pi \\cdot 36 \\cdot 10$', '$h = 8 \\Rightarrow V = \\tfrac{1}{3}\\pi \\cdot 36 \\cdot 8$'],
              ['Мерни единици', '$1\\ \\mathrm{m}^3 = 100\\ \\mathrm{dm}^3$', '$1\\ \\mathrm{m}^3 = 10^3\\ \\mathrm{dm}^3 = 1000\\ \\mathrm{dm}^3 = 1000\\ \\mathrm{l}$'],
              ['Удвояване на размерите', 'двоен ръб $\\Rightarrow$ двоен обем', 'двоен ръб $\\Rightarrow 2^3 = 8$ пъти обема'],
              ['Повърхнина на цилиндъра', '$S = 2\\pi rh$', '$2\\pi rh$ е само околната; $S = 2\\pi rh + 2\\pi r^2$'],
              ['Сфера и кълбо', 'обем на сфера $4\\pi r^2$', '$4\\pi r^2$ е лице; обемът на кълбото е $\\tfrac{4}{3}\\pi r^3$'],
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
          <Quiz questions={solidsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Правоъгълен паралелепипед има ръбове 3, 4 и 12 cm. Намерете обема, повърхнината и диагонала му.">
                <p><Tex>{'V = 3 \\cdot 4 \\cdot 12 = 144\\ \\mathrm{cm}^3'}</Tex></p>
                <p><Tex>{'S = 2(12 + 48 + 36) = 192\\ \\mathrm{cm}^2'}</Tex></p>
                <p><Tex>{'d = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13\\ \\mathrm{cm}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Цилиндър има радиус 5 cm и височина 8 cm. Намерете обема и пълната му повърхнина.">
                <p><Tex>{'V = \\pi \\cdot 25 \\cdot 8 = 200\\pi \\approx 628{,}3\\ \\mathrm{cm}^3'}</Tex></p>
                <p><Tex>{'S = 2\\pi \\cdot 5 \\cdot 8 + 2\\pi \\cdot 25 = 80\\pi + 50\\pi = 130\\pi \\approx 408{,}4\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете обема на кълбо и лицето на сфера с радиус 6 cm.">
                <p><Tex>{'V = \\tfrac{4}{3} \\cdot \\pi \\cdot 216 = 288\\pi \\approx 904{,}8\\ \\mathrm{cm}^3'}</Tex></p>
                <p><Tex>{'S = 4 \\cdot \\pi \\cdot 36 = 144\\pi \\approx 452{,}4\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Правилна четириъгълна пирамида има основен ръб 6 cm и височина 4 cm. Намерете обема и повърхнината ѝ.">
                <p><Tex>{'V = \\tfrac{1}{3} \\cdot 36 \\cdot 4 = 48\\ \\mathrm{cm}^3'}</Tex></p>
                <p>Апотема: <Tex>{'\\sqrt{4^2 + 3^2} = 5\\ \\mathrm{cm}'}</Tex>; околна повърхнина <Tex>{'4 \\cdot \\tfrac{1}{2} \\cdot 6 \\cdot 5 = 60\\ \\mathrm{cm}^2'}</Tex></p>
                <p><Tex>{'S = 36 + 60 = 96\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Конус има радиус 6 cm и образувателна 10 cm. Намерете обема и пълната му повърхнина.">
                <p><Tex>{'h = \\sqrt{100 - 36} = 8\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'V = \\tfrac{1}{3}\\pi \\cdot 36 \\cdot 8 = 96\\pi\\ \\mathrm{cm}^3'}</Tex></p>
                <p><Tex>{'S = \\pi \\cdot 6 \\cdot (6 + 10) = 96\\pi\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Куб $5 \times 5 \times 5$, сглобен от единични кубчета, е боядисан отвън и разглобен. Колко кубчета имат 3, 2, 1 и 0 боядисани стени?">
                <p>3 стени – върховете: 8.</p>
                <p>2 стени – по ръбовете без върховете: <Tex>{'12 \\cdot 3 = 36'}</Tex>. 1 стена – вътрешността на стените: <Tex>{'6 \\cdot 3^2 = 54'}</Tex>.</p>
                <p>0 стени – вътрешният куб <Tex>{'3 \\times 3 \\times 3 = 27'}</Tex>. Проверка: <Tex>{'8 + 36 + 54 + 27 = 125'}</Tex> ✓</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че правилните многостени са най-много 5 вида.">
                <p>Във всеки връх се събират поне 3 стени и сборът на ъглите им трябва да е по-малък от 360° (иначе няма „връх“).</p>
                <p>Триъгълници (60°): 3, 4 или 5 във връх (180°, 240°, 300°) – тетраедър, октаедър, икосаедър. Квадрати (90°): само 3 – куб.</p>
                <p>Петоъгълници (108°): само 3 (324°) – додекаедър. При шестоъгълници <Tex>{'3 \\cdot 120^\\circ = 360^\\circ'}</Tex> – вече няма връх.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Намерете обема на правилен тетраедър с ръб $a = 6$.">
                <p>Основата е равностранен триъгълник с лице <Tex>{'\\sqrt{3} \\cdot \\frac{36}{4} = 9\\sqrt{3}'}</Tex>.</p>
                <p>Центърът на основата е на разстояние <Tex>{'\\frac{a}{\\sqrt{3}} = 2\\sqrt{3}'}</Tex> от върха ѝ <Tex>{'\\Rightarrow h = \\sqrt{36 - 12} = \\sqrt{24} = 2\\sqrt{6}'}</Tex>.</p>
                <p><Tex>{'V = \\tfrac{1}{3} \\cdot 9\\sqrt{3} \\cdot 2\\sqrt{6} = 6\\sqrt{18} = 18\\sqrt{2} \\approx 25{,}46'}</Tex> (общо: <Tex>{'V = \\frac{a^3\\sqrt{2}}{12}'}</Tex>).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="В куб е вписано кълбо и около него е описано кълбо. Колко пъти обемът на описаното е по-голям от обема на вписаното?">
                <p>Вписаното кълбо има радиус <Tex>{'r = \\frac{a}{2}'}</Tex>; описаното – <Tex>{'R = \\frac{d}{2} = \\frac{a\\sqrt{3}}{2}'}</Tex>.</p>
                <p><Tex>{'R : r = \\sqrt{3} \\Rightarrow'}</Tex> обемите се отнасят като <Tex>{'(\\sqrt{3})^3 = 3\\sqrt{3}'}</Tex>.</p>
                <p><Tex>{'\\approx 5{,}2'}</Tex> пъти.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Ойлер: <Tex>{'V - E + F = 2'}</Tex>; правилните многостени са 5</li>
              <li>✓ Паралелепипед: <Tex>{'V = abc,\\ d = \\sqrt{a^2 + b^2 + c^2}'}</Tex>; куб: <Tex>{'V = a^3,\\ d = a\\sqrt{3}'}</Tex></li>
              <li>✓ Призма: <Tex>{'V = B \\cdot h'}</Tex>; пирамида: <Tex>{'V = \\tfrac{1}{3} \\cdot B \\cdot h'}</Tex></li>
              <li>✓ Цилиндър: <Tex>{'V = \\pi r^2h'}</Tex>; конус: <Tex>{'V = \\tfrac{1}{3}\\pi r^2h'}</Tex>; кълбо: <Tex>{'V = \\tfrac{4}{3}\\pi r^3'}</Tex>; сфера: <Tex>{'S = 4\\pi r^2'}</Tex></li>
              <li>✓ Конус : кълбо : цилиндър (<Tex>{'h = 2r'}</Tex>) <Tex>{'= 1 : 2 : 3'}</Tex></li>
              <li>✓ Подобие с коефициент <Tex>{'k'}</Tex>: лица <Tex>{'\\times k^2'}</Tex>, обеми <Tex>{'\\times k^3'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Платон (IV век пр.н.е.) свързва четири от правилните многостени с „елементите“ – огън (тетраедър), земя (куб), въздух
              (октаедър) и вода (икосаедър), а додекаедъра – с цялата Вселена. Две хилядолетия по-късно младият Кеплер се опитва да обясни
              разстоянията между планетите с петте многостена, вложени един в друг. Идеята се оказва грешна – но търсенето го довежда до
              истинските закони за движението на планетите.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
