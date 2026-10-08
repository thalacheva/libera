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
    problem: 'Аквариум има форма на правоъгълен паралелепипед с размери 60 cm × 30 cm × 40 cm. Колко литра вода събира?',
    solution: ['V = 60 · 30 · 40 = 72 000 cm³', '1 l = 1 dm³ = 1000 cm³', '72 000 : 1000 = 72 l'],
    answer: '72 l',
    check: [72],
    ask: ['литри'],
  },
  {
    title: '🫙 Буркан',
    problem: 'Цилиндричен буркан има радиус 4 cm и височина 10 cm. Колко кубически сантиметра събира?',
    solution: ['V = πr²h = π · 16 · 10 = 160π', '≈ 502,65 cm³ (около половин литър)'],
    answer: '≈ 502,65 cm³',
    check: [502.65],
    ask: ['обем, cm³'],
  },
  {
    title: '🍦 Фунийка',
    problem: 'Фунийка за сладолед е конус с радиус 3 cm и височина 10 cm. Колко сладолед побира (без „топката“ отгоре)?',
    solution: ['V = ⅓πr²h = ⅓ · π · 9 · 10 = 30π', '≈ 94,25 cm³'],
    answer: '≈ 94,25 cm³',
    check: [94.25],
    ask: ['обем, cm³'],
  },
  {
    title: '🌍 Повърхността на Земята',
    problem: 'Приемаме, че Земята е кълбо с радиус 6371 km. Колко е лицето на повърхността ѝ (в милиони km²)?',
    solution: ['S = 4πR² = 4π · 6371²', '≈ 4 · 3,1416 · 40 589 641 ≈ 510 064 000 km²', '≈ 510 милиона km² (от тях около 71% е вода)'],
    answer: '≈ 510 милиона km²',
    check: [510],
    ask: ['милиона km²'],
  },
  {
    title: '🔺 Пирамидата на Хеопс',
    problem: 'Великата пирамида първоначално е имала квадратна основа със страна около 230 m и височина около 146,6 m. Какъв е бил обемът ѝ (в милиони m³)?',
    solution: ['V = ⅓ · B · h = ⅓ · 230² · 146,6', '= ⅓ · 52 900 · 146,6 ≈ 2 585 000 m³', '≈ 2,59 милиона m³'],
    answer: '≈ 2,59 милиона m³',
    check: [2.59],
    ask: ['милиона m³'],
  },
  {
    title: '📦 Кутия и пръчка',
    problem: 'Кашон е с вътрешни размери 30 cm × 40 cm × 120 cm. Каква е най-дългата права пръчка, която може да се събере в него?',
    solution: ['Най-дългата отсечка е пространственият диагонал: d = √(a² + b² + c²)', 'd = √(900 + 1600 + 14 400) = √16 900', 'd = 130 cm'],
    answer: '130 cm',
    check: [130],
    ask: ['дължина, cm'],
  },
];

// ---------- Тест ----------

const solidsQuiz: Question[] = [
  { question: 'Колко е обемът на куб с ръб 3 cm?', answers: ['9 cm³', '18 cm³', '27 cm³', '54 cm³'], correctAnswer: '27 cm³' },
  { question: 'На колко е равно V − E + F за всеки изпъкнал многостен?', answers: ['0', '1', '2', 'зависи от многостена'], correctAnswer: '2' },
  { question: 'Колко правилни (Платонови) многостена има?', answers: ['4', '5', '6', 'безброй'], correctAnswer: '5' },
  {
    question: 'Каква част от обема на цилиндъра е обемът на конус със същата основа и височина?',
    answers: ['1/2', '1/3', '2/3', '1/4'],
    correctAnswer: '1/3',
  },
  { question: 'Колко е лицето на сфера с радиус r?', answers: ['πr²', '2πr²', '4πr²', '⁴⁄₃πr³'], correctAnswer: '4πr²' },
  { question: 'Ако удвоим ръба на куб, колко пъти се увеличава обемът му?', answers: ['2', '4', '6', '8'], correctAnswer: '8' },
  { question: 'Колко е диагоналът на куб с ръб a?', answers: ['a√2', 'a√3', '2a', '3a'], correctAnswer: 'a√3' },
  { question: 'Кое е обемът на пирамида с лице на основата B и височина h?', answers: ['B · h', '½ · B · h', '⅓ · B · h', '¼ · B · h'], correctAnswer: '⅓ · B · h' },
  {
    question: 'Кълбо е вписано в цилиндър (височината на цилиндъра е равна на диаметъра). Каква част от обема на цилиндъра заема кълбото?',
    answers: ['1/2', '2/3', '3/4', 'π/4'],
    correctAnswer: '2/3',
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
              5. Пресметни V − E + F и за двете. Случайност ли е, че получаваш едно и също число?
            </p>
          </div>
          <Theorem
            type="definition"
            title="Многостен"
            description="Многостен е тяло, ограничено от краен брой многоъгълници – стени. Страните им са ръбове, а върховете им – върхове на многостена. Призмата има две еднакви успоредни основи и околни стени-успоредници; пирамидата има основа многоъгълник и околни стени-триъгълници с общ връх. Правилен многостен е изпъкнал многостен, на който всички стени са еднакви правилни многоъгълници и във всеки връх се събират еднакъв брой стени."
          />
          <Theorem title="Формула на Ойлер" description="За всеки изпъкнал многостен с V върха, E ръба и F стени е изпълнено V − E + F = 2." />
          <SolidViewerLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Призма и пирамида</h2>
          <Theorem
            title="Лица и обеми"
            description="Правоъгълен паралелепипед с ръбове a, b, c: V = abc, S = 2(ab + bc + ca), диагонал d = √(a² + b² + c²); при куб с ръб a: V = a³, S = 6a², d = a√3. Права призма: V = B · h (B – лице на основата). Пирамида: V = ⅓ · B · h. Повърхнината на многостен е сборът от лицата на всичките му стени."
          />
          <Example
            description="Правилна четириъгълна пирамида има основен ръб 6 cm и височина 4 cm. Да намерим обема и повърхнината ѝ."
            steps={[
              'B = 6² = 36 cm²; V = ⅓ · 36 · 4 = 48 cm³',
              'Апотема (височина на околна стена): k = √(4² + 3²) = 5 cm (3 е половината от основния ръб)',
              'Околна повърхнина: 4 · ½ · 6 · 5 = 60 cm²',
              'S = 36 + 60 = 96 cm²',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Цилиндър, конус, кълбо</h2>
          <Theorem
            title="Ротационни тела"
            description="Цилиндър: V = πr²h, S = 2πr² + 2πrh. Конус (l – образувателна): V = ⅓πr²h, S = πr² + πrl. Кълбо: V = ⁴⁄₃πr³; сфера (повърхнината му): S = 4πr²."
          />
          <ArchimedesLab />
          <Example
            description="Конус има радиус 6 cm и образувателна 10 cm. Да намерим височината, обема и повърхнината."
            steps={['h = √(10² − 6²) = 8 cm', 'V = ⅓ · π · 36 · 8 = 96π ≈ 301,6 cm³', 'S = π · 6 · (6 + 10) = 96π ≈ 301,6 cm²']}
          />
          <p className={text}>
            Защо конусът е точно ⅓ от цилиндъра? Ако срежем двете тела с хоризонтални равнини, сеченията на конуса са кръгове, които намаляват
            равномерно. <strong>Принципът на Кавалиери</strong> казва: тела с равни лица на сеченията на всяка височина имат равни обеми – а с него и
            малко алгебра се стига до ⅓. Връзката между лицето на кръга и π е в урока{' '}
            <Link to="/geometry/circle" className={link}>
              Окръжност и кръг
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Подобни тела: k, k², k³</h2>
          <Theorem
            title="Подобни тела"
            description="Ако всички размери на тяло се умножат по k, всички лица (повърхнината) се умножават по k², а обемът – по k³. Например модел в мащаб 1 : 10 има 100 пъти по-малка повърхнина и 1000 пъти по-малък обем."
          />
          <CubeScaleLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 5. Тренажор
          </h2>
          <p className={text}>Пресметни обема. Ако отговорът съдържа π, въведи само числото пред него.</p>
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
              ['Забравена ⅓', 'пирамида: V = B · h', 'V = ⅓ · B · h (също и при конус)'],
              ['Височина и образувателна', 'конус r = 6, l = 10: V = ⅓π · 36 · 10', 'h = 8 ⇒ V = ⅓π · 36 · 8'],
              ['Мерни единици', '1 m³ = 100 dm³', '1 m³ = 10³ dm³ = 1000 dm³ = 1000 l'],
              ['Удвояване на размерите', 'двоен ръб ⇒ двоен обем', 'двоен ръб ⇒ 2³ = 8 пъти обема'],
              ['Повърхнина на цилиндъра', 'S = 2πrh', '2πrh е само околната; S = 2πrh + 2πr²'],
              ['Сфера и кълбо', 'обем на сфера 4πr²', '4πr² е лице; обемът на кълбото е ⁴⁄₃πr³'],
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
          <h2 className={h2}>8. 🎯 Бърз тест</h2>
          <Quiz questions={solidsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Правоъгълен паралелепипед има ръбове 3, 4 и 12 cm. Намерете обема, повърхнината и диагонала му.">
                <p>V = 3 · 4 · 12 = 144 cm³</p>
                <p>S = 2(12 + 48 + 36) = 192 cm²</p>
                <p>d = √(9 + 16 + 144) = √169 = 13 cm</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Цилиндър има радиус 5 cm и височина 8 cm. Намерете обема и пълната му повърхнина.">
                <p>V = π · 25 · 8 = 200π ≈ 628,3 cm³</p>
                <p>S = 2π · 5 · 8 + 2π · 25 = 80π + 50π = 130π ≈ 408,4 cm²</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете обема на кълбо и лицето на сфера с радиус 6 cm.">
                <p>V = ⁴⁄₃ · π · 216 = 288π ≈ 904,8 cm³</p>
                <p>S = 4 · π · 36 = 144π ≈ 452,4 cm²</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Правилна четириъгълна пирамида има основен ръб 6 cm и височина 4 cm. Намерете обема и повърхнината ѝ.">
                <p>V = ⅓ · 36 · 4 = 48 cm³</p>
                <p>Апотема: √(4² + 3²) = 5 cm; околна повърхнина 4 · ½ · 6 · 5 = 60 cm²</p>
                <p>S = 36 + 60 = 96 cm²</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Конус има радиус 6 cm и образувателна 10 cm. Намерете обема и пълната му повърхнина.">
                <p>h = √(100 − 36) = 8 cm</p>
                <p>V = ⅓π · 36 · 8 = 96π cm³</p>
                <p>S = π · 6 · (6 + 10) = 96π cm²</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Куб 5 × 5 × 5, сглобен от единични кубчета, е боядисан отвън и разглобен. Колко кубчета имат 3, 2, 1 и 0 боядисани стени?">
                <p>3 стени – върховете: 8.</p>
                <p>2 стени – по ръбовете без върховете: 12 · 3 = 36. 1 стена – вътрешността на стените: 6 · 3² = 54.</p>
                <p>0 стени – вътрешният куб 3 × 3 × 3 = 27. Проверка: 8 + 36 + 54 + 27 = 125 ✓</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че правилните многостени са най-много 5 вида.">
                <p>Във всеки връх се събират поне 3 стени и сборът на ъглите им трябва да е по-малък от 360° (иначе няма „връх“).</p>
                <p>Триъгълници (60°): 3, 4 или 5 във връх (180°, 240°, 300°) – тетраедър, октаедър, икосаедър. Квадрати (90°): само 3 – куб.</p>
                <p>Петоъгълници (108°): само 3 (324°) – додекаедър. При шестоъгълници 3 · 120° = 360° – вече няма връх.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Намерете обема на правилен тетраедър с ръб a = 6.">
                <p>Основата е равностранен триъгълник с лице √3 · 36/4 = 9√3.</p>
                <p>Центърът на основата е на разстояние a/√3 = 2√3 от върха ѝ ⇒ h = √(36 − 12) = √24 = 2√6.</p>
                <p>V = ⅓ · 9√3 · 2√6 = 6√18 = 18√2 ≈ 25,46 (общо: V = a³√2/12).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="В куб е вписано кълбо и около него е описано кълбо. Колко пъти обемът на описаното е по-голям от обема на вписаното?">
                <p>Вписаното кълбо има радиус r = a/2; описаното – R = d/2 = a√3/2.</p>
                <p>R : r = √3 ⇒ обемите се отнасят като (√3)³ = 3√3.</p>
                <p>≈ 5,2 пъти.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Ойлер: V − E + F = 2; правилните многостени са 5</li>
              <li>✓ Паралелепипед: V = abc, d = √(a² + b² + c²); куб: V = a³, d = a√3</li>
              <li>✓ Призма: V = B · h; пирамида: V = ⅓ · B · h</li>
              <li>✓ Цилиндър: V = πr²h; конус: V = ⅓πr²h; кълбо: V = ⁴⁄₃πr³; сфера: S = 4πr²</li>
              <li>✓ Конус : кълбо : цилиндър (h = 2r) = 1 : 2 : 3</li>
              <li>✓ Подобие с коефициент k: лица × k², обеми × k³</li>
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
