import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import GaussSumLab from './GaussSumLab';
import GeometricSeriesLab from './GeometricSeriesLab';
import SequenceLab from './SequenceLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

type Drill = { text: string; answer: number; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  if (kind <= 1) {
    const a1 = randInt(-10, 10);
    const d = randNonZero(-5, 5);
    const n = randInt(5, 20);
    const an = a1 + (n - 1) * d;
    const first = [0, 1, 2].map(i => num(a1 + i * d)).join('; ');
    if (kind === 0)
      return {
        text: `Аритметична прогресия: ${first}; … Намери a${n}.`,
        answer: an,
        steps: [`d = ${num(d)}`, `a${n} = a₁ + ${n - 1} · d = ${num(a1)} + ${n - 1} · ${par(d)} = ${num(an)}`],
      };
    const S = (n * (a1 + an)) / 2;
    return {
      text: `Аритметична прогресия: ${first}; … Намери сбора на първите ${n} члена.`,
      answer: S,
      steps: [`d = ${num(d)}; a${n} = ${num(a1)} + ${n - 1} · ${par(d)} = ${num(an)}`, `S${n} = ${n} · (${num(a1)} + ${par(an)})/2 = ${num(S)}`],
    };
  }
  const a1 = randNonZero(-3, 3);
  const q = [2, 3, -2][randInt(0, 2)];
  const n = randInt(4, q === 3 ? 6 : 8);
  const an = a1 * q ** (n - 1);
  const first = [0, 1, 2].map(i => num(a1 * q ** i)).join('; ');
  if (kind === 2)
    return {
      text: `Геометрична прогресия: ${first}; … Намери a${n}.`,
      answer: an,
      steps: [`q = ${num(q)}`, `a${n} = a₁ · q^${n - 1} = ${num(a1)} · ${par(q)}^${n - 1} = ${num(an)}`],
    };
  const S = (a1 * (q ** n - 1)) / (q - 1);
  return {
    text: `Геометрична прогресия: ${first}; … Намери сбора на първите ${n} члена.`,
    answer: S,
    steps: [`q = ${num(q)}`, `S${n} = a₁(q^${n} − 1)/(q − 1) = ${num(a1)} · (${num(q ** n)} − 1)/(${num(q)} − 1) = ${num(S)}`],
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
    const v = Number(input.trim().replace('−', '-').replace(',', '.'));
    if (input.trim() === '' || Number.isNaN(v)) return;
    if (v === task.answer) {
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
        <input
          type="text"
          inputMode="numeric"
          aria-label="Отговор"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-28 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
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
            : 'Не съвсем. Провери n − 1 в показателя или множителя.'}
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
    title: '🎭 Амфитеатър',
    problem: 'Първият ред на амфитеатър има 20 места, а всеки следващ – с 2 повече. Колко места има общо в 25 реда?',
    solution: ['Аритметична прогресия: a₁ = 20, d = 2, n = 25.', 'a₂₅ = 20 + 24 · 2 = 68', 'S₂₅ = 25 · (20 + 68)/2 = 1100'],
    answer: '1100 места',
    check: [1100],
    ask: ['места'],
  },
  {
    title: '🪨 Свободно падане',
    problem: 'Тяло, пуснато да пада свободно, изминава 5 m през първата секунда, а през всяка следваща – с 10 m повече. Колко метра изминава за 6 секунди?',
    solution: ['a₁ = 5, d = 10, n = 6 ⇒ a₆ = 5 + 50 = 55', 'S₆ = 6 · (5 + 55)/2 = 180', '(Същото дава и физиката: gt²/2 = 10 · 36/2 = 180.)'],
    answer: '180 m',
    check: [180],
    ask: ['път, m'],
  },
  {
    title: '🐷 Касичка',
    problem: 'През януари слагаш в касичката 10 €, а всеки следващ месец – с 5 € повече от предишния. Колко ще събереш за една година?',
    solution: ['a₁ = 10, d = 5, n = 12 ⇒ a₁₂ = 10 + 55 = 65', 'S₁₂ = 12 · (10 + 65)/2 = 450'],
    answer: '450 €',
    check: [450],
    ask: ['сума, €'],
  },
  {
    title: '⚽ Отскачаща топка',
    problem: 'Топка, пусната от 4 m, след всеки удар в земята отскача до 3/4 от предишната височина. До каква височина се издига след третия удар?',
    solution: ['Височините са геометрична прогресия: 4, 4 · 3/4, 4 · (3/4)², …', 'След третия удар: 4 · (3/4)³ = 4 · 27/64', '= 1,6875 m'],
    answer: '≈ 1,69 m',
    check: [1.69],
    ask: ['височина, m'],
  },
  {
    title: '📣 Слух',
    problem: 'Един човек разказва новина на трима души. На следващия ден всеки от тях я разказва на трима нови и т.н. Колко души общо знаят новината след 5 дни (заедно с първия)?',
    solution: ['Новите хора всеки ден: 3, 9, 27, 81, 243', 'Общо с първия: 1 + 3 + 9 + 27 + 81 + 243', 'S = (3⁶ − 1)/(3 − 1) = 728/2 = 364'],
    answer: '364 души',
    check: [364],
    ask: ['брой хора'],
  },
  {
    title: '⚽ Целият път на топката',
    problem: 'Същата топка (пусната от 4 m, отскачаща до 3/4 от височината) подскача безкрайно много пъти. Какъв път изминава общо?',
    solution: [
      'Надолу първо 4 m. След това всеки отскок е нагоре и надолу: 2 · (3 + 2,25 + 1,6875 + …)',
      'Безкрайна геометрична прогресия с a₁ = 3 и q = 3/4: сбор 3/(1 − 3/4) = 12',
      'Общо: 4 + 2 · 12 = 28',
    ],
    answer: '28 m',
    check: [28],
    ask: ['път, m'],
  },
];

// ---------- Тест ----------

const sequencesQuiz: Question[] = [
  {
    question: 'Каква е разликата d на прогресията 3, 7, 11, 15, …?',
    answers: ['3', '4', '7', '11'],
    correctAnswer: '4',
  },
  {
    question: 'В аритметична прогресия a₁ = 2 и d = 3. Колко е a₁₀?',
    answers: ['29', '30', '32', '23'],
    correctAnswer: '29',
  },
  {
    question: 'Колко е сборът 1 + 2 + 3 + … + 100?',
    answers: ['5000', '5050', '5100', '10 100'],
    correctAnswer: '5050',
  },
  {
    question: 'Колко е петият член на геометричната прогресия 2, 6, 18, …?',
    answers: ['54', '162', '486', '30'],
    correctAnswer: '162',
  },
  {
    question: 'Колко е частното q на прогресията 81, 27, 9, …?',
    answers: ['3', '−3', '1/3', '−54'],
    correctAnswer: '1/3',
  },
  {
    question: 'Колко е сборът 1 + 2 + 4 + 8 + 16?',
    answers: ['30', '31', '32', '15'],
    correctAnswer: '31',
  },
  {
    question: 'Колко е безкрайният сбор 1 + 1/2 + 1/4 + 1/8 + …?',
    answers: ['1', '2', '3/2', 'безкрайност'],
    correctAnswer: '2',
  },
  {
    question: 'Числата a, b, c образуват аритметична прогресия. Кое е вярно?',
    answers: ['b = (a + c)/2', 'b² = ac', 'b = a + c', 'c = 2a'],
    correctAnswer: 'b = (a + c)/2',
  },
  {
    question: 'На колко е равно 0,999… = 0,(9)?',
    answers: ['малко по-малко от 1', 'точно 1', '0,9', 'не е число'],
    correctAnswer: 'точно 1',
  },
];

// ---------- Страница ----------

export function Sequences() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Прогресии</h1>

        <div className="bg-gradient-to-br from-indigo-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧒 Разказва се, че учител в Германия искал да заеме класа за дълго и поръчал да съберат всички числа от 1 до 100. След
            минута малкият Карл Фридрих Гаус донесъл плочката си с един-единствен отговор: 5050. Той забелязал, че 1 + 100, 2 + 99, 3 + 98…
            винаги дават 101, а такива двойки са 50. Историята е разказвана в много варианти и вероятно е украсена, но идеята е съвсем
            истинска – и работи за всяка <strong>аритметична прогресия</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Редици</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Кое е следващото число: 2, 5, 8, 11, …? А в 2, 6, 18, 54, …? В първата редица прибавяме по 3 (→
              14), във втората умножаваме по 3 (→ 162). Двата най-прости начина да „продължим“ редица – и двата вида прогресии.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Числова редица"
            description="Числова редица е безкрайна наредена последователност от числа a₁, a₂, a₃, …; aₙ се нарича n-ти член. Редицата може да е зададена с формула за общия член (например aₙ = 2n + 1) или рекурентно – чрез предишните членове (например a₁ = 1, aₙ₊₁ = 2aₙ)."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Аритметична прогресия</h2>
          <Theorem
            type="definition"
            title="Аритметична прогресия"
            description="Редица, в която всеки член (от втория нататък) се получава от предишния чрез прибавяне на едно и също число d (разлика): aₙ₊₁ = aₙ + d. Общ член: aₙ = a₁ + (n − 1)d. Всеки член е средно аритметично на съседите си: aₙ = (aₙ₋₁ + aₙ₊₁)/2."
          />
          <SequenceLab />
          <Theorem title="Сбор на първите n члена" description="Sₙ = n(a₁ + aₙ)/2 = n(2a₁ + (n − 1)d)/2. Частен случай: 1 + 2 + … + n = n(n + 1)/2." />
          <GaussSumLab />
          <Example
            description="В аритметична прогресия a₃ = 7 и a₈ = 22. Намерете a₁, d и S₁₀."
            steps={['a₈ − a₃ = 5d ⇒ 22 − 7 = 5d ⇒ d = 3', 'a₁ = a₃ − 2d = 7 − 6 = 1', 'a₁₀ = 1 + 9 · 3 = 28', 'S₁₀ = 10 · (1 + 28)/2 = 145']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Геометрична прогресия</h2>
          <Theorem
            type="definition"
            title="Геометрична прогресия"
            description="Редица с ненулеви членове, в която всеки член (от втория нататък) се получава от предишния чрез умножение по едно и също число q ≠ 0 (частно): aₙ₊₁ = aₙ · q. Общ член: aₙ = a₁ · qⁿ⁻¹. При положителни членове всеки е средно геометрично на съседите си: aₙ² = aₙ₋₁ · aₙ₊₁."
          />
          <Theorem title="Сбор на първите n члена" description="При q ≠ 1: Sₙ = a₁(qⁿ − 1)/(q − 1). При q = 1 всички членове са равни и Sₙ = n · a₁." />
          <Example
            description="Да изведем формулата за сбора: S = a₁ + a₁q + … + a₁qⁿ⁻¹."
            steps={['Умножаваме по q: qS = a₁q + a₁q² + … + a₁qⁿ', 'Изваждаме: qS − S = a₁qⁿ − a₁ (всички други членове се унищожават)', 'S(q − 1) = a₁(qⁿ − 1) ⇒ S = a₁(qⁿ − 1)/(q − 1)']}
          />
          <p className={text}>
            Сложната лихва от урока{' '}
            <Link to="/algebra/fractions" className={link}>
              Дроби и проценти
            </Link>{' '}
            е геометрична прогресия с q = 1 + r/100, а удвояването на бактериите и разпадът на радиоактивни вещества – също.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Безкрайна намаляваща геометрична прогресия</h2>
          <Theorem
            title="Сбор на безкрайна геометрична прогресия"
            description="Ако |q| < 1, частичните сборове Sₙ се приближават неограничено до числото S = a₁/(1 − q) – наричаме го сбор на безкрайната прогресия. При |q| ≥ 1 такъв сбор няма."
          />
          <GeometricSeriesLab />
          <Example
            description="Парадоксът на Зенон: Ахил тича 10 пъти по-бързо от костенурката, която е 100 m пред него. Докато той стигне мястото ѝ, тя е изминала още 10 m; докато измине и тях – още 1 m… Ще я настигне ли?"
            steps={['Пътят на Ахил до срещата е 100 + 10 + 1 + 0,1 + … – безкрайна геометрична прогресия с a₁ = 100, q = 1/10', 'S = 100/(1 − 1/10) = 1000/9 ≈ 111,1 m', 'Безкрайно много етапа, но краен път – Ахил настига костенурката след около 111 m']}
          />
          <Example
            description="Да запишем 0,(27) = 0,272727… като обикновена дроб."
            steps={['0,(27) = 0,27 + 0,0027 + 0,000027 + … – прогресия с a₁ = 27/100 и q = 1/100', 'S = (27/100)/(1 − 1/100) = (27/100)/(99/100) = 27/99', '= 3/11']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 5. Тренажор
          </h2>
          <p className={text}>Определи вида на прогресията от първите три члена и пресметни.</p>
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
              ['n вместо n − 1', 'aₙ = a₁ + n · d', 'aₙ = a₁ + (n − 1)d'],
              ['Брой на членовете', 'числата от 10 до 20 са 10', 'те са 20 − 10 + 1 = 11'],
              ['Знак на частното', '2, −6, 18, … ⇒ q = 3', 'q = −6 : 2 = −3'],
              ['Безкраен сбор при |q| ≥ 1', '1 + 2 + 4 + … = 1/(1 − 2) = −1', 'сборът не съществува – членовете растат'],
              ['Показател в общия член', 'aₙ = a₁ · qⁿ', 'aₙ = a₁ · qⁿ⁻¹'],
              ['0,(9) е по-малко от 1', '0,999… < 1', '0,(9) = 0,9/(1 − 0,1) = 1'],
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
          <Quiz questions={sequencesQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="В аритметична прогресия a₁ = 5 и d = −2. Намерете a₂₀ и S₂₀.">
                <p>a₂₀ = 5 + 19 · (−2) = −33</p>
                <p>S₂₀ = 20 · (5 + (−33))/2 = 10 · (−28) = −280</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="В геометрична прогресия a₁ = 3 и q = 2. Намерете a₆ и S₆.">
                <p>a₆ = 3 · 2⁵ = 96</p>
                <p>S₆ = 3 · (2⁶ − 1)/(2 − 1) = 3 · 63 = 189</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете 1 + 3 + 5 + … + 99.">
                <p>Аритметична прогресия: a₁ = 1, d = 2, aₙ = 99 ⇒ n = (99 − 1)/2 + 1 = 50.</p>
                <p>S = 50 · (1 + 99)/2 = 2500 = 50². (Сборът на първите n нечетни числа винаги е n².)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="В аритметична прогресия a₃ = 7 и a₈ = 22. Намерете S₁₀.">
                <p>5d = 22 − 7 = 15 ⇒ d = 3; a₁ = 7 − 2 · 3 = 1</p>
                <p>a₁₀ = 1 + 27 = 28</p>
                <p>S₁₀ = 10 · (1 + 28)/2 = 145</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В геометрична прогресия a₂ = 6 и a₅ = 162. Намерете q, a₁ и S₅.">
                <p>a₅ : a₂ = q³ = 27 ⇒ q = 3</p>
                <p>a₁ = 6 : 3 = 2</p>
                <p>S₅ = 2 · (3⁵ − 1)/2 = 242</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="За кои x числата 2, x, 18 образуват геометрична прогресия? А аритметична?">
                <p>Геометрична: x² = 2 · 18 = 36 ⇒ x = 6 или x = −6 (q = 3 или q = −3).</p>
                <p>Аритметична: x = (2 + 18)/2 = 10.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намерете сбора на всички числа от 1 до 1000, които не се делят на 3.">
                <p>Сборът на всички: 1000 · 1001/2 = 500 500.</p>
                <p>Делящите се на 3: 3 + 6 + … + 999 = 3 · (1 + 2 + … + 333) = 3 · 333 · 334/2 = 166 833.</p>
                <p>Търсеният сбор: 500 500 − 166 833 = 333 667.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Запишете 0,(27) като обикновена дроб, като използвате безкрайна геометрична прогресия.">
                <p>0,(27) = 27/100 + 27/100² + 27/100³ + …</p>
                <p>a₁ = 27/100, q = 1/100 ⇒ S = (27/100)/(99/100) = 27/99</p>
                <p>= 3/11</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Снежинката на Кох: започваме с равностранен триъгълник с лице A; на всяка стъпка върху средната третина на всяка страна навън се построява равностранен триъгълник. Докажете, че периметърът расте неограничено, а лицето клони към 8A/5.">
                <p>Всяка стъпка заменя всяка отсечка с 4 отсечки, 3 пъти по-къси ⇒ периметърът се умножава по 4/3 и расте неограничено.</p>
                <p>На стъпка k се добавят 3 · 4ᵏ⁻¹ триъгълника, всеки с лице A/9ᵏ. Общо добавено: (A/3) · (1 + 4/9 + (4/9)² + …).</p>
                <p>Прогресия с q = 4/9: сборът е (A/3) · 1/(1 − 4/9) = (A/3) · 9/5 = 3A/5.</p>
                <p>Лицето клони към A + 3A/5 = 8A/5 – крайна площ с безкраен периметър!</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Аритметична: aₙ = a₁ + (n − 1)d; Sₙ = n(a₁ + aₙ)/2</li>
              <li>✓ Геометрична: aₙ = a₁qⁿ⁻¹; Sₙ = a₁(qⁿ − 1)/(q − 1)</li>
              <li>✓ Средно аритметично / геометрично на съседите</li>
              <li>✓ Безкрайна при |q| &lt; 1: S = a₁/(1 − q)</li>
              <li>✓ Сложна лихва, удвояване и разпад са геометрични прогресии</li>
              <li>✓ Периодичните дроби са сборове на безкрайни геометрични прогресии</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Парадоксите на Зенон от Елея (V век пр.н.е.) – за Ахил и костенурката, за стрелата, която „никога не стига целта“ – озадачавали
              философите повече от две хиляди години. Математическият отговор се изяснява напълно едва с понятието граница (XVII–XIX век):
              безкрайно много все по-малки разстояния могат да имат краен сбор.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
