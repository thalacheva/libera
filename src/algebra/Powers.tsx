import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import ExpGraphLab from './ExpGraphLab';
import PowerRulesLab from './PowerRulesLab';
import SqrtLab from './SqrtLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

// ---------- Тренажор: правила за степени ----------

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number) => String(n).split('').map(ch => SUP[ch] ?? ch).join('');
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};
const par = (n: number) => (n < 0 ? `(${n})` : `${n}`).replace('-', '−');

type Drill = { text: string; answer: number; steps: string[] };

const newDrill = (): Drill => {
  const b = ['2', '3', '5', 'a', 'x'][randInt(0, 4)];
  const kind = randInt(0, 3);
  const m = randNonZero(-5, 7);
  const n = randNonZero(-5, 7);
  if (kind === 0)
    return { text: `${b}${sup(m)} · ${b}${sup(n)}`, answer: m + n, steps: [`Събираме показателите: ${par(m)} + ${par(n)} = ${m + n}`.replace(/-/g, '−')] };
  if (kind === 1)
    return { text: `${b}${sup(m)} : ${b}${sup(n)}`, answer: m - n, steps: [`Изваждаме показателите: ${par(m)} − ${par(n)} = ${m - n}`.replace(/-/g, '−')] };
  if (kind === 2) {
    const k = randNonZero(-3, 3);
    return { text: `(${b}${sup(m)})${sup(k)}`, answer: m * k, steps: [`Умножаваме показателите: ${par(m)} · ${par(k)} = ${m * k}`.replace(/-/g, '−')] };
  }
  const k = randNonZero(-4, 6);
  return {
    text: `${b}${sup(m)} · ${b}${sup(n)} : ${b}${sup(k)}`,
    answer: m + n - k,
    steps: [`${par(m)} + ${par(n)} − ${par(k)} = ${m + n - k}`.replace(/-/g, '−')],
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
    const v = Number(input.trim().replace('−', '-'));
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

  const base = task.text.charAt(task.text.startsWith('(') ? 1 : 0);

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2 font-mono text-2xl sm:text-3xl text-gray-800 dark:text-gray-100">
        <span>{task.text} =</span>
        <span>{base}</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Показател"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-16 -mt-6 px-2 py-1 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-base"
        />
      </div>
      <div className="flex justify-center mt-4">
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
            : 'Не съвсем. Внимавай със знаците на показателите.'}
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
          <li>
            Отговор: {base}
            {sup(task.answer)}
          </li>
        </ol>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🦠 Бактерии',
    problem: 'Една бактерия се дели на две на всеки 20 минути. Колко бактерии ще има след 3 часа, ако в началото е била една?',
    solution: ['За 3 часа = 180 минути има 180 : 20 = 9 деления.', 'При всяко деление броят се удвоява: 2⁹', '2⁹ = 512'],
    answer: '512 бактерии',
    check: [512],
    ask: ['брой'],
  },
  {
    title: '☀️ Светлината от Слънцето',
    problem: 'Разстоянието от Земята до Слънцето е около 1,5 · 10¹¹ m, а скоростта на светлината – около 3 · 10⁸ m/s. За колко секунди светлината стига до нас?',
    solution: ['t = s : v = (1,5 · 10¹¹) : (3 · 10⁸)', '= (1,5 : 3) · 10¹¹⁻⁸ = 0,5 · 10³', '= 500 s (около 8 минути и 20 секунди)'],
    answer: '500 s',
    check: [500],
    ask: ['време, s'],
  },
  {
    title: '🏠 Квадратна стая',
    problem: 'Квадратна стая има лице 30,25 m². Колко е дължината на стената?',
    solution: ['Страната е √30,25.', '5,5² = 30,25', 'Страната е 5,5 m'],
    answer: '5,5 m',
    check: [5.5],
    ask: ['страна, m'],
  },
  {
    title: '🪨 Падащ камък',
    problem: 'Времето за свободно падане от височина h е t = √(2h/g). За колко секунди камък пада от 45 m (g ≈ 10 m/s²)?',
    solution: ['t = √(2 · 45 / 10)', '= √9', '= 3 s'],
    answer: '3 s',
    check: [3],
    ask: ['време, s'],
  },
  {
    title: '☢️ Радиоактивен йод',
    problem: 'Периодът на полуразпад на йод-131 е около 8 дни – за толкова време количеството му намалява наполовина. Колко милиграма ще останат от 80 mg след 24 дни?',
    solution: ['24 дни са 3 периода на полуразпад.', 'Количеството се умножава по (1/2)³ = 1/8.', '80 · 1/8 = 10'],
    answer: '10 mg',
    check: [10],
    ask: ['остатък, mg'],
  },
  {
    title: '📺 Диагонал на телевизор',
    problem: 'Екран е широк 1,6 m и висок 0,9 m. Колко е диагоналът му?',
    solution: ['По Питагоровата теорема: d = √(1,6² + 0,9²)', '= √(2,56 + 0,81) = √3,37', '≈ 1,84 m (около 72 инча)'],
    answer: '≈ 1,84 m',
    check: [1.84],
    ask: ['диагонал, m'],
  },
];

// ---------- Тест ----------

const powersQuiz: Question[] = [
  {
    question: 'На колко е равно 2³ · 2⁴?',
    answers: ['2⁷', '2¹²', '4⁷', '4¹²'],
    correctAnswer: '2⁷',
  },
  {
    question: 'На колко е равно (3²)³?',
    answers: ['3⁵', '3⁶', '3⁸', '9⁵'],
    correctAnswer: '3⁶',
  },
  {
    question: 'На колко е равно 5⁰?',
    answers: ['0', '1', '5', 'не е определено'],
    correctAnswer: '1',
  },
  {
    question: 'На колко е равно 2⁻³?',
    answers: ['−8', '−6', '1/8', '1/6'],
    correctAnswer: '1/8',
  },
  {
    question: 'Изнесете множител пред корена: √50 = ?',
    answers: ['25√2', '5√2', '2√5', '10√5'],
    correctAnswer: '5√2',
  },
  {
    question: 'На колко е равно √((−3)²)?',
    answers: ['−3', '3', '±3', '9'],
    correctAnswer: '3',
  },
  {
    question: 'На колко е равно 8^(2/3)?',
    answers: ['4', '16/3', '2', '64'],
    correctAnswer: '4',
  },
  {
    question: 'Как се записва 0,00042 в стандартен вид?',
    answers: ['4,2 · 10⁻⁴', '4,2 · 10⁻³', '42 · 10⁻⁵', '4,2 · 10⁴'],
    correctAnswer: '4,2 · 10⁻⁴',
  },
  {
    question: 'Рационализирайте знаменателя: 1/√3 = ?',
    answers: ['√3', '√3/3', '3/√3', '1/3'],
    correctAnswer: '√3/3',
  },
];

// ---------- Страница ----------

export function Powers() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Степени и корени</h1>

        <div className="bg-gradient-to-br from-indigo-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ♟️ Според легендата изобретателят на шаха поискал от владетеля скромна награда: едно житно зърно на първото поле, две на второто,
            четири на третото – всеки път двойно повече – до 64-тото поле. Владетелят се засмял… докато не пресметнали. Общо това са 2⁶⁴ − 1 =
            18 446 744 073 709 551 615 зърна. При около 0,05 g на зърно това са над 900 милиарда тона – повече от хиляда години днешна
            световна реколта от пшеница. Така изглежда <strong>степента</strong>: малки числа, които растат невъобразимо бързо.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Степен с естествен показател</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Кое е по-голямо: (−2)⁴ или −2⁴? Изглеждат еднакво, но първото е (−2)·(−2)·(−2)·(−2) = 16, а второто
              е −(2·2·2·2) = −16. Скобите решават всичко.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Степен"
            description="За естествено число n степента aⁿ е произведението на n множителя, равни на a: aⁿ = a · a · … · a. Числото a е основа, а n – показател. Отрицателно число на четна степен е положително, а на нечетна – отрицателно."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Свойства на степените</h2>
          <Theorem
            title="Действия със степени"
            description="aᵐ · aⁿ = aᵐ⁺ⁿ; aᵐ : aⁿ = aᵐ⁻ⁿ (a ≠ 0); (aᵐ)ⁿ = aᵐⁿ; (ab)ⁿ = aⁿbⁿ; (a/b)ⁿ = aⁿ/bⁿ. За да важат правилата и при m = n, и при m < n, дефинираме a⁰ = 1 и a⁻ⁿ = 1/aⁿ (a ≠ 0)."
          />
          <PowerRulesLab />
          <Example
            description="Да опростим (2⁵ · 2³) : 2⁶."
            steps={['2⁵ · 2³ = 2⁸', '2⁸ : 2⁶ = 2²', '= 4']}
          />
          <p className={text}>
            Много големите и много малките числа записваме в <strong>стандартен вид</strong> a · 10ⁿ, където 1 ≤ a &lt; 10: скоростта на
            светлината е 3 · 10⁸ m/s, а диаметърът на атом – около 10⁻¹⁰ m. Умножаването тогава е лесно: множим числата и събираме
            показателите.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Квадратен корен</h2>
          <Theorem
            type="definition"
            title="Квадратен корен"
            description="Квадратен корен от неотрицателното число a е неотрицателното число √a, чийто квадрат е a: (√a)² = a и √a ≥ 0. Например √49 = 7 (а не −7, въпреки че (−7)² = 49). От отрицателно число квадратен корен в реалните числа няма. За всяко x: √(x²) = |x|."
          />
          <SqrtLab />
          <Theorem
            title="Свойства на корените"
            description="√(ab) = √a · √b и √(a/b) = √a / √b (a ≥ 0, b > 0). Изнасяне пред корена: √50 = √(25 · 2) = 5√2. Внасяне под корена: 3√2 = √18. Рационализиране на знаменателя: 1/√2 = √2/2; 1/(√a − √b) = (√a + √b)/(a − b). Внимание: √(a + b) ≠ √a + √b."
          />
          <Example
            description="Да опростим √12 + √27 − √48."
            steps={['√12 = √(4 · 3) = 2√3', '√27 = √(9 · 3) = 3√3', '√48 = √(16 · 3) = 4√3', '2√3 + 3√3 − 4√3 = √3']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Корен n-ти и рационален показател</h2>
          <Theorem
            type="definition"
            title="Корен n-ти и степен с дробен показател"
            description="ⁿ√a е числото, чиято n-та степен е a (при четно n искаме a ≥ 0 и ⁿ√a ≥ 0): ³√8 = 2, ³√(−27) = −3, ⁴√81 = 3. За a > 0 дефинираме a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ. Например 8^(2/3) = (³√8)² = 4, а a^(1/2) = √a. Всички правила за степени остават в сила."
          />
          <ExpGraphLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 5. Тренажор
          </h2>
          <p className={text}>Въведи показателя на резултата. Отрицателните показатели също се броят!</p>
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
              ['Умножени показатели при произведение', '2³ · 2⁴ = 2¹²', '2³ · 2⁴ = 2⁷'],
              ['Скобите и минусът', '−2⁴ = 16', '−2⁴ = −16, но (−2)⁴ = 16'],
              ['Корен от сбор', '√(9 + 16) = 3 + 4 = 7', '√25 = 5'],
              ['Корен от квадрат', '√(x²) = x', '√(x²) = |x|; при x = −3 е 3'],
              ['Отрицателен показател', '2⁻³ = −8', '2⁻³ = 1/2³ = 1/8'],
              ['Различни основи', '2³ · 3² = 6⁵', '8 · 9 = 72 – правилата са за еднакви основи'],
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
          <Quiz questions={powersQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете (2⁵ · 2³) : 2⁶.">
                <p>2⁵ · 2³ = 2⁸</p>
                <p>2⁸ : 2⁶ = 2² = 4</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Опростете √12 + √27 − √48.">
                <p>√12 = 2√3; √27 = 3√3; √48 = 4√3</p>
                <p>2√3 + 3√3 − 4√3 = √3</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете 0,0005 · 4 · 10⁶ и запишете резултата в стандартен вид.">
                <p>0,0005 = 5 · 10⁻⁴</p>
                <p>5 · 10⁻⁴ · 4 · 10⁶ = 20 · 10² = 2 · 10³</p>
                <p>= 2000</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Рационализирайте знаменателя: 6/(√5 − √2).">
                <p>Умножаваме числителя и знаменателя по спрегнатия израз √5 + √2.</p>
                <p>Знаменател: (√5 − √2)(√5 + √2) = 5 − 2 = 3</p>
                <p>6(√5 + √2)/3 = 2(√5 + √2) = 2√5 + 2√2</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Кое е по-голямо: √2 + √3 или √10?">
                <p>И двете са положителни, затова сравняваме квадратите им.</p>
                <p>(√2 + √3)² = 5 + 2√6; (√10)² = 10</p>
                <p>2√6 = √24 &lt; √25 = 5 ⇒ 5 + 2√6 &lt; 10 ⇒ √10 е по-голямото.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Решете уравненията 2ˣ⁺¹ = 32 и 9ˣ = 27.">
                <p>32 = 2⁵ ⇒ x + 1 = 5 ⇒ x = 4</p>
                <p>9ˣ = 3²ˣ и 27 = 3³ ⇒ 2x = 3 ⇒ x = 1,5</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че √2 не е рационално число.">
                <p>Да допуснем, че √2 = p/q, несъкратима дроб. Тогава p² = 2q² ⇒ p² е четно ⇒ p е четно, p = 2k.</p>
                <p>4k² = 2q² ⇒ q² = 2k² ⇒ и q е четно.</p>
                <p>Тогава p и q имат общ делител 2 – противоречие с несъкратимостта. Значи √2 е ирационално.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Опростете √(7 + 4√3).">
                <p>Търсим (a + b√3)² = a² + 3b² + 2ab√3 = 7 + 4√3.</p>
                <p>2ab = 4 и a² + 3b² = 7 ⇒ a = 2, b = 1.</p>
                <p>√(7 + 4√3) = 2 + √3 (положително, значи знакът е верен).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кое е по-голямо: 2³⁰⁰ или 3²⁰⁰?">
                <p>2³⁰⁰ = (2³)¹⁰⁰ = 8¹⁰⁰</p>
                <p>3²⁰⁰ = (3²)¹⁰⁰ = 9¹⁰⁰</p>
                <p>8¹⁰⁰ &lt; 9¹⁰⁰ ⇒ 3²⁰⁰ е по-голямото.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ aᵐ · aⁿ = aᵐ⁺ⁿ; aᵐ : aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ</li>
              <li>✓ a⁰ = 1; a⁻ⁿ = 1/aⁿ; стандартен вид a · 10ⁿ, 1 ≤ a &lt; 10</li>
              <li>✓ √a ≥ 0 и (√a)² = a; √(x²) = |x|</li>
              <li>✓ √(ab) = √a · √b, но √(a + b) ≠ √a + √b</li>
              <li>✓ Изнасяне пред корена: √50 = 5√2; рационализиране: 1/√2 = √2/2</li>
              <li>✓ a^(m/n) = ⁿ√(aᵐ); a^(1/2) = √a</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Лист хартия е дебел около 0,1 mm. Ако можехме да го сгънем на две 42 пъти, дебелината му щеше да е 0,1 mm · 2⁴² ≈ 440 000 km –
              повече от разстоянието до Луната (около 384 000 km). На практика обикновен лист трудно се сгъва повече от 7–8 пъти, защото всяко
              сгъване удвоява дебелината. Рекордът е 12 сгъвания – постигнат през 2002 г. с лента хартия, дълга над километър.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
