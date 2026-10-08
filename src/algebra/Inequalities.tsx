import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { num, polynomial } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import AbsIneqLab from './AbsIneqLab';
import IntervalMethodLab from './IntervalMethodLab';
import { flip, RELS, type Rel } from './intervals';
import LinearIneqLab from './LinearIneqLab';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

type Drill = { text: string; rel: Rel; k: number; steps: string[] };

const newDrill = (): Drill => {
  const a = randNonZero(-6, 6);
  let c = randNonZero(-6, 6);
  while (c === a) c = randNonZero(-6, 6);
  const k = randInt(-8, 8);
  const b = randInt(-12, 12);
  const d = (a - c) * k + b;
  const rel = RELS[randInt(0, 3)];
  const m = a - c;
  const rel2 = m < 0 ? flip(rel) : rel;
  return {
    text: `${polynomial([a, b])} ${rel} ${polynomial([c, d])}`,
    rel: rel2,
    k,
    steps: [
      `Събираме x-овете отляво, числата отдясно: ${polynomial([m, 0])} ${rel} ${num(d - b)}`,
      m < 0
        ? `Делим на ${par(m)} < 0 – знакът се обръща: x ${rel2} ${num(k)}`
        : `Делим на ${num(m)} > 0 – знакът се запазва: x ${rel2} ${num(k)}`,
    ],
  };
};

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [rel, setRel] = useState<Rel | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const v = Number(input.trim().replace('−', '-').replace(',', '.'));
    if (rel === null || input.trim() === '' || Number.isNaN(v)) return;
    if (rel === task.rel && v === task.k) {
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
    setRel(null);
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

      <p className="text-center font-mono text-xl sm:text-2xl mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-lg">x</span>
        {RELS.map(r => (
          <button
            key={r}
            disabled={result === 'correct'}
            onClick={() => {
              setRel(r);
              if (result === 'wrong') setResult(null);
            }}
            className={`w-10 h-10 rounded-lg border-2 font-mono text-lg ${
              r === rel ? 'border-sky-500 bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            {r}
          </button>
        ))}
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          aria-label="Граница"
          className="w-20 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следващо →
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
            : 'Не съвсем. Провери знака – обърна ли го, ако делиш на отрицателно число?'}
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
    title: '📱 Мобилен план',
    problem:
      'План А струва 10 € на месец плюс 0,05 € за всяка минута разговор. План Б струва 25 € на месец с неограничени минути. Под колко минути на месец план А е по-изгоден?',
    solution: ['Нека x е броят минути. А е по-изгоден, когато струва по-малко:', '10 + 0,05x < 25', '0,05x < 15', 'x < 300'],
    answer: 'Под 300 минути (при точно 300 минути двата плана струват еднакво)',
    check: [300],
    ask: ['граница, минути'],
  },
  {
    title: '📚 Срок',
    problem: 'Имаш оценки 5, 6 и 5. Предстои още една. Каква най-малко трябва да е тя, за да имаш среден успех поне 5,50?',
    solution: ['Нека x е четвъртата оценка.', '(5 + 6 + 5 + x)/4 ≥ 5,5', '16 + x ≥ 22', 'x ≥ 6'],
    answer: 'Отличен 6 – с по-ниска оценка средното ще е под 5,50',
    check: [6],
    ask: ['най-ниска оценка'],
  },
  {
    title: '🛗 Асансьор',
    problem: 'Товароносимостта на асансьор е 630 kg. В него вече има количка със 120 kg товар. Колко души по 75 kg най-много могат да се качат?',
    solution: ['Нека n е броят на хората.', '75n + 120 ≤ 630', '75n ≤ 510 ⇒ n ≤ 6,8', 'n е цяло число ⇒ n ≤ 6'],
    answer: 'Най-много 6 души',
    check: [6],
    ask: ['брой хора'],
  },
  {
    title: '🎤 Училищен концерт',
    problem: 'Наемът на залата е 240 €. Всеки билет се продава за 4 €, а отпечатването му струва 0,50 €. Колко билета най-малко трябва да се продадат, за да има печалба?',
    solution: ['Нека x е броят продадени билети. Печалба от един билет: 4 − 0,5 = 3,5 €.', '3,5x > 240', 'x > 68,57…', 'x е цяло ⇒ x ≥ 69'],
    answer: 'Поне 69 билета',
    check: [69],
    ask: ['брой билети'],
  },
  {
    title: '🏡 Ограда',
    problem: 'С 40 m ограда искаме да оградим правоъгълна леха с лице поне 96 m². В какви граници може да бъде едната страна?',
    solution: [
      'Нека едната страна е x, тогава другата е 20 − x.',
      'x(20 − x) ≥ 96 ⇒ x² − 20x + 96 ≤ 0',
      'Корени: 8 и 12; параболата е под оста между тях',
      '8 ≤ x ≤ 12',
    ],
    answer: 'Между 8 m и 12 m',
    check: [8, 12],
    ask: ['най-малко, m', 'най-много, m'],
  },
  {
    title: '💊 Лекарство',
    problem: 'Лекарство се съхранява при температура от 15 °C до 25 °C. Американски термометър показва °F, като F = 1,8C + 32. В какви граници трябва да е показанието му?',
    solution: ['15 ≤ C ≤ 25', 'Умножаваме по 1,8 > 0 (знаците се запазват): 27 ≤ 1,8C ≤ 45', 'Прибавяме 32: 59 ≤ F ≤ 77'],
    answer: 'От 59 °F до 77 °F',
    check: [59, 77],
    ask: ['от, °F', 'до, °F'],
  },
];

// ---------- Тест ----------

const inequalitiesQuiz: Question[] = [
  {
    question: 'Реши неравенството −2x < 6',
    answers: ['x < −3', 'x > −3', 'x < 3', 'x > 3'],
    correctAnswer: 'x > −3',
  },
  {
    question: 'Как се записва като интервал −1 < x ≤ 4?',
    answers: ['[−1; 4]', '(−1; 4)', '(−1; 4]', '[−1; 4)'],
    correctAnswer: '(−1; 4]',
  },
  {
    question: 'Кое е решението на системата x > 2, x ≤ 5?',
    answers: ['(2; 5]', '[2; 5)', '(−∞; 5]', '(2; +∞)'],
    correctAnswer: '(2; 5]',
  },
  {
    question: 'Кое е решението на системата x > 3, x < 1?',
    answers: ['(1; 3)', 'x < 1 или x > 3', 'Няма решение', 'Всяко x'],
    correctAnswer: 'Няма решение',
  },
  {
    question: 'Реши неравенството |x − 2| < 3',
    answers: ['−1 < x < 5', 'x < 5', '−5 < x < 1', 'x < −1 или x > 5'],
    correctAnswer: '−1 < x < 5',
  },
  {
    question: 'Реши неравенството |x| ≥ 4',
    answers: ['−4 ≤ x ≤ 4', 'x ≥ 4', 'x ≤ −4 или x ≥ 4', 'x ≥ ±4'],
    correctAnswer: 'x ≤ −4 или x ≥ 4',
  },
  {
    question: 'Реши неравенството (x − 1)/(x + 2) ≤ 0',
    answers: ['[−2; 1]', '(−2; 1]', '[−2; 1)', '(−∞; −2) ∪ [1; +∞)'],
    correctAnswer: '(−2; 1]',
  },
  {
    question: 'Реши неравенството x² < 9',
    answers: ['x < 3', 'x < ±3', '−3 < x < 3', 'x < −3 или x > 3'],
    correctAnswer: '−3 < x < 3',
  },
  {
    question: 'Кое е вярно за всяко положително число a?',
    answers: ['a + 1/a ≥ 2', 'a + 1/a ≤ 2', 'a + 1/a > 2', 'a + 1/a < 2'],
    correctAnswer: 'a + 1/a ≥ 2',
  },
];

// ---------- Страница ----------

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

export function Inequalities() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Неравенства</h1>

        <div className="bg-gradient-to-br from-violet-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🚕 Две таксиметрови фирми: първата взима 2 € за качване и 1,20 € на километър, втората – 4 € за качване и 0,90 € на километър. Коя
            е по-изгодна? Отговорът „зависи“ е верен, но не е достатъчен. Математиката казва точно от кое разстояние нататък се променя той – с
            едно <strong>неравенство</strong>. В живота рядко търсим „точно равно“; много по-често питаме „колко най-много“, „поне колко“ и
            „кога е по-евтино“.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Неравенства и интервали</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> На табела пише „Деца под 12 години – безплатно“. Има ли право на безплатен билет дете, което днес
              навършва 12? А дете на 11 години и 364 дни? Разликата между <span className="font-mono">x &lt; 12</span> и{' '}
              <span className="font-mono">x ≤ 12</span> е точно една точка – но понякога точно тя е важна.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Неравенство и решение"
            description="Неравенство с едно неизвестно е запис от вида A(x) < B(x) (или с ≤, >, ≥). Негово решение е всяко число, което превръща неравенството във вярно числово неравенство. За разлика от уравненията, решенията обикновено са безброй много и образуват интервали от числовата ос."
          />
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded shadow-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2 sm:p-3">Неравенство</th>
                  <th className="p-2 sm:p-3">Интервал</th>
                  <th className="p-2 sm:p-3">На оста</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ['2 < x < 5', '(2; 5)', 'двата края – празни точки'],
                  ['2 ≤ x ≤ 5', '[2; 5]', 'двата края – плътни точки'],
                  ['2 ≤ x < 5', '[2; 5)', 'плътна при 2, празна при 5'],
                  ['x > 2', '(2; +∞)', 'лъч надясно'],
                  ['x ≤ 5', '(−∞; 5]', 'лъч наляво'],
                ].map(([ineq, interval, axis]) => (
                  <tr key={ineq} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-2 sm:p-3">{ineq}</td>
                    <td className="p-2 sm:p-3">{interval}</td>
                    <td className="p-2 sm:p-3 font-sans text-xs sm:text-sm">{axis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Кръглата скоба означава, че краят <em>не</em> принадлежи на интервала, квадратната – че принадлежи. При ∞ скобата винаги е
            кръгла: безкрайността не е число.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Свойства на неравенствата</h2>
          <p className={text}>
            С неравенствата работим почти като с уравненията – с една важна разлика. Например 2 &lt; 5, но след умножение по −1 получаваме
            −2 и −5, а −2 &gt; −5: числата си размениха местата на оста, защото умножението по −1 е огледално отражение спрямо нулата.
          </p>
          <Theorem
            title="Равносилни преобразувания на неравенства"
            description="Неравенството не променя решенията си, ако: 1) към двете страни прибавим (или извадим) едно и също число или израз; 2) умножим (или разделим) двете страни на едно и също положително число; 3) умножим (или разделим) двете страни на едно и също отрицателно число и обърнем знака на неравенството (< става >, ≤ става ≥)."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Линейни неравенства</h2>
          <p className={text}>
            Алгоритъмът е същият като при линейните уравнения – скоби, знаменатели, прехвърляне, привеждане. Внимаваме само на последната
            стъпка: ако делим на отрицателно число, обръщаме знака.
          </p>
          <Example
            description="Таксито от началото: кога първата фирма е по-изгодна? Нека x е разстоянието в km."
            steps={[
              'Цената при първата фирма: 2 + 1,2x; при втората: 4 + 0,9x',
              'Търсим кога първата е по-евтина: 2 + 1,2x < 4 + 0,9x',
              'Прехвърляме: 1,2x − 0,9x < 4 − 2 ⇒ 0,3x < 2',
              'Делим на 0,3 > 0 (знакът се запазва): x < 6,67 (по-точно x < 20/3)',
              'Отговор: за пътувания под около 6,7 km е по-изгодна първата фирма, за по-дълги – втората',
            ]}
          />
          <Example
            description="Да решим неравенството 3 − 2(x + 1) ≥ x − 8"
            steps={[
              'Разкриваме скобите: 3 − 2x − 2 ≥ x − 8',
              'Привеждаме: 1 − 2x ≥ x − 8',
              'Прехвърляме: −2x − x ≥ −8 − 1 ⇒ −3x ≥ −9',
              'Делим на −3 < 0 и обръщаме знака: x ≤ 3',
              'Отговор: x ∈ (−∞; 3]',
            ]}
          />
          <LinearIneqLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Системи и двойни неравенства</h2>
          <p className={text}>
            Система от неравенства изисква всички да са изпълнени едновременно – решението е <strong>сечението</strong> на решенията им (общата
            част на оста). Двойното неравенство a &lt; f(x) &lt; b е съкратен запис на системата f(x) &gt; a и f(x) &lt; b.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-green-600 dark:text-green-400">Обща част – интервал</p>
              <p className="font-mono text-sm">x &gt; 1 и x ≤ 4 → (1; 4]</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400">Едното съдържа другото</p>
              <p className="font-mono text-sm">x &gt; 1 и x &gt; 4 → (4; +∞)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold text-red-600 dark:text-red-400">Нямат обща част</p>
              <p className="font-mono text-sm">x &lt; 1 и x &gt; 4 → няма решение</p>
            </div>
          </div>
          <Example
            description="Да решим двойното неравенство −3 ≤ 2x + 1 < 7"
            steps={[
              'Изваждаме 1 от трите части: −4 ≤ 2x < 6',
              'Делим трите части на 2 > 0: −2 ≤ x < 3',
              'Отговор: x ∈ [−2; 3); целите решения са −2, −1, 0, 1, 2',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Метод на интервалите</h2>
          <p className={text}>
            Как да решим (x + 2)(x − 1)(x − 3) &gt; 0? Не бива да „делим на множителите“ – не знаем знака им. Вместо това следим знака на
            целия израз. Квадратните неравенства вече решавахме с парабола в урока{' '}
            <Link to="/functions/quadratic" className={link}>
              Квадратни функции
            </Link>
            ; методът на интервалите е обобщението за произведения и частни с много множители.
          </p>
          <Theorem
            title="Метод на интервалите"
            description="1) Прехвърляме всичко от едната страна, за да сравняваме с 0. 2) Разлагаме на множители от вида (x − r) и намираме нулите на числителя и знаменателя. 3) Те делят оста на интервали, във всеки от които знакът е постоянен. 4) Определяме знака в най-десния интервал и вървим наляво: при преминаване през точка с нечетна степен знакът се сменя, с четна – не. 5) Избираме интервалите с нужния знак; нулите на числителя включваме при ≤ и ≥, нулите на знаменателя – никога."
          />
          <Example
            description="Да решим неравенството (x + 1)/(x − 2) ≥ 2"
            steps={[
              'Сравняваме с 0: (x + 1)/(x − 2) − 2 ≥ 0 ⇒ (x + 1 − 2x + 4)/(x − 2) ≥ 0 ⇒ (5 − x)/(x − 2) ≥ 0',
              'Умножаваме по −1 и обръщаме знака: (x − 5)/(x − 2) ≤ 0',
              'Критични точки: 2 (знаменател) и 5 (числител). Знаци: + за x > 5, − между 2 и 5, + за x < 2',
              'Търсим ≤ 0: средният интервал, с 5 (нула на числителя), но без 2 (нула на знаменателя)',
              'Отговор: x ∈ (2; 5]',
            ]}
          />
          <IntervalMethodLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Неравенства с модул</h2>
          <Theorem
            title="Модулът като разстояние"
            description="За r > 0: |x − a| < r ⇔ a − r < x < a + r (точките по-близо от r до a); |x − a| > r ⇔ x < a − r или x > a + r (точките по-далеч от r). При ≤ и ≥ краищата се включват. Ако r < 0, |x − a| < r няма решение, а |x − a| > r е вярно за всяко x."
          />
          <AbsIneqLab />
          <Example
            description="Да решим неравенството |2x − 3| ≤ 5"
            steps={['Записваме като двойно неравенство: −5 ≤ 2x − 3 ≤ 5', 'Прибавяме 3: −2 ≤ 2x ≤ 8', 'Делим на 2: −1 ≤ x ≤ 4', 'Отговор: x ∈ [−1; 4]']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Доказване на неравенства</h2>
          <p className={text}>
            На олимпиадите често не решаваме неравенство, а <strong>доказваме</strong>, че то е вярно за всички допустими стойности. Основният
            инструмент е простият факт, че квадратът на число никога не е отрицателен: (a − b)² ≥ 0.
          </p>
          <Theorem
            title="Неравенство между средно аритметично и средно геометрично"
            description="За неотрицателни числа a и b: (a + b)/2 ≥ √(ab), като равенство има само при a = b. Доказателство: (√a − √b)² ≥ 0 ⇒ a − 2√(ab) + b ≥ 0 ⇒ a + b ≥ 2√(ab)."
          />
          <Example
            description="Да докажем, че a + 1/a ≥ 2 за всяко a > 0. Кога има равенство?"
            steps={[
              'Прилагаме неравенството за числата a и 1/a: (a + 1/a)/2 ≥ √(a · 1/a) = 1',
              'Умножаваме по 2: a + 1/a ≥ 2',
              'Равенство има при a = 1/a, т.е. a = 1',
              'Следствие: от всички правоъгълници с лице 1 най-малък периметър има квадратът',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <p className={text}>
            Внимавай с отговора: ако неизвестното е брой хора или билети, то е цяло число – и „x &gt; 68,57“ означава „поне 69“.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Необърнат знак', '−3x < 6 → x < −2', '−3x < 6 → x > −2'],
              ['Умножение по израз с неизвестен знак', '(x + 1)/(x − 2) > 1 → x + 1 > x − 2', '3/(x − 2) > 0 ⇒ x > 2'],
              ['Включена нула на знаменателя', '(x − 1)/(x + 2) ≤ 0 → [−2; 1]', '(−2; 1]'],
              ['„Корен“ от неравенство', 'x² > 4 → x > ±2', 'x < −2 или x > 2'],
              ['Обединение вместо сечение', 'x > 1 и x < 5 → всяко x', '1 < x < 5'],
              ['Модул, по-голям от число', '|x| > 3 → −3 < x < 3', 'x < −3 или x > 3'],
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
            <Sparkles size={22} className="text-sky-500" /> 10. Тренажор
          </h2>
          <p className={text}>Реши неравенството и запиши отговора във вида „x &lt; число“: избери знака и въведи границата.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 🎯 Бърз тест</h2>
          <Quiz questions={inequalitiesQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Реши неравенството 3(x − 2) − 2(x + 1) ≤ 4.">
                <p>Разкриваме скобите: 3x − 6 − 2x − 2 ≤ 4</p>
                <p>Привеждаме: x − 8 ≤ 4</p>
                <p>x ≤ 12, т.е. x ∈ (−∞; 12]</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Реши неравенството (2x − 1)/3 − (x + 1)/2 > 1.">
                <p>Умножаваме по 6 &gt; 0 (знакът се запазва): 2(2x − 1) − 3(x + 1) &gt; 6</p>
                <p>4x − 2 − 3x − 3 &gt; 6 ⇒ x − 5 &gt; 6</p>
                <p>x &gt; 11, т.е. x ∈ (11; +∞)</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намери целите решения на системата 2x − 3 > 1, 3x + 2 ≤ 17.">
                <p>От първото: 2x &gt; 4 ⇒ x &gt; 2</p>
                <p>От второто: 3x ≤ 15 ⇒ x ≤ 5</p>
                <p>Сечението е (2; 5]; целите числа в него са 3, 4 и 5.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Реши неравенството (x + 3)(x − 1)(x − 4) < 0.">
                <p>Критични точки: −3, 1, 4 – всички с нечетна степен.</p>
                <p>Знаци отдясно наляво: + за x &gt; 4, − в (1; 4), + в (−3; 1), − за x &lt; −3</p>
                <p>Отговор: x ∈ (−∞; −3) ∪ (1; 4)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Реши неравенството (x² − 4)/(x − 1) ≥ 0.">
                <p>Разлагаме: (x − 2)(x + 2)/(x − 1) ≥ 0. Критични точки: −2 и 2 (числител), 1 (знаменател).</p>
                <p>Знаци: + за x &gt; 2, − в (1; 2), + в (−2; 1), − за x &lt; −2</p>
                <p>Включваме −2 и 2, но не и 1: x ∈ [−2; 1) ∪ [2; +∞)</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Реши неравенството |x + 1| + |x − 2| ≤ 5.">
                <p>Нулите на модулите −1 и 2 делят оста на три части.</p>
                <p>x &lt; −1: −(x + 1) − (x − 2) = 1 − 2x ≤ 5 ⇒ x ≥ −2, т.е. −2 ≤ x &lt; −1</p>
                <p>−1 ≤ x ≤ 2: (x + 1) − (x − 2) = 3 ≤ 5 – винаги вярно</p>
                <p>x &gt; 2: 2x − 1 ≤ 5 ⇒ x ≤ 3, т.е. 2 &lt; x ≤ 3</p>
                <p>Отговор: x ∈ [−2; 3]. Геометрично: сборът от разстоянията до −1 и до 2 е най-много 5.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="За кои стойности на параметъра a неравенството x² − 2ax + a + 2 > 0 е вярно за всяко x?">
                <p>Параболата е „чаша“ (коефициентът пред x² е 1 &gt; 0). Тя е изцяло над оста ⇔ няма нули ⇔ D &lt; 0.</p>
                <p>D = 4a² − 4(a + 2) &lt; 0 ⇒ a² − a − 2 &lt; 0 ⇒ (a − 2)(a + 1) &lt; 0</p>
                <p>Отговор: −1 &lt; a &lt; 2</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажи, че за всеки положителни числа a, b, c е вярно (a + b)(b + c)(c + a) ≥ 8abc.">
                <p>По неравенството между средните: a + b ≥ 2√(ab), b + c ≥ 2√(bc), c + a ≥ 2√(ca).</p>
                <p>Трите неравенства са с положителни страни, затова можем да ги умножим:</p>
                <p>(a + b)(b + c)(c + a) ≥ 8√(a²b²c²) = 8abc</p>
                <p>Равенство има само при a = b = c.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажи, че a² + b² + c² ≥ ab + bc + ca за всички реални a, b, c.">
                <p>Умножаваме по 2 и прехвърляме: 2a² + 2b² + 2c² − 2ab − 2bc − 2ca ≥ 0</p>
                <p>Лявата страна се групира като (a − b)² + (b − c)² + (c − a)²</p>
                <p>Сбор от квадрати е ≥ 0, следователно неравенството е вярно.</p>
                <p>Равенство има само при a = b = c.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. Обобщение</h2>
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Решенията на неравенство обикновено образуват интервали; ( ) – без края, [ ] – с края</li>
              <li>✓ При умножение или делене на отрицателно число знакът се обръща</li>
              <li>✓ Система неравенства → сечение на решенията; двойно неравенство → действия с трите части</li>
              <li>✓ Метод на интервалите: нули → знаци → избор; нулите на знаменателя не влизат в отговора</li>
              <li>✓ |x − a| &lt; r – точки близо до a (един интервал); |x − a| &gt; r – далеч от a (два лъча)</li>
              <li>✓ (a + b)/2 ≥ √(ab) при a, b ≥ 0; равенство само при a = b</li>
              <li>✓ В текстовите задачи проверяваме дали отговорът трябва да е цяло число</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Знаците &lt; и &gt; се появяват в печат в книгата на английския математик Томас Хариът „Artis Analyticae Praxis“, издадена през
              1631 г., десет години след смъртта му. Знаците за „по-малко или равно“ и „по-голямо или равно“ се приписват на френския учен
              Пиер Бугер (1734 г.), макар че тогава са изглеждали малко по-различно – с две черти отдолу.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
