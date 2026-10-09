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
import { MathText, Tex } from '~/MathText';

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
    solution: ['Аритметична прогресия: $a_1 = 20,\\ d = 2,\\ n = 25$.', '$a_{25} = 20 + 24 \\cdot 2 = 68$', '$S_{25} = 25 \\cdot \\frac{20 + 68}{2} = 1100$'],
    answer: '1100 места',
    check: [1100],
    ask: ['места'],
  },
  {
    title: '🪨 Свободно падане',
    problem: 'Тяло, пуснато да пада свободно, изминава 5 m през първата секунда, а през всяка следваща – с 10 m повече. Колко метра изминава за 6 секунди?',
    solution: ['$a_1 = 5,\\ d = 10,\\ n = 6 \\Rightarrow a_6 = 5 + 50 = 55$', '$S_6 = 6 \\cdot \\frac{5 + 55}{2} = 180$', '(Същото дава и физиката: $\\frac{gt^2}{2} = 10 \\cdot \\frac{36}{2} = 180$.)'],
    answer: '180 m',
    check: [180],
    ask: ['път, m'],
  },
  {
    title: '🐷 Касичка',
    problem: 'През януари слагаш в касичката 10 €, а всеки следващ месец – с 5 € повече от предишния. Колко ще събереш за една година?',
    solution: ['$a_1 = 10,\\ d = 5,\\ n = 12 \\Rightarrow a_{12} = 10 + 55 = 65$', '$S_{12} = 12 \\cdot \\frac{10 + 65}{2} = 450$'],
    answer: '450 €',
    check: [450],
    ask: ['сума, €'],
  },
  {
    title: '⚽ Отскачаща топка',
    problem: 'Топка, пусната от 4 m, след всеки удар в земята отскача до $\\frac{3}{4}$ от предишната височина. До каква височина се издига след третия удар?',
    solution: ['Височините са геометрична прогресия: $4,\\ 4 \\cdot \\frac{3}{4},\\ 4 \\cdot \\left(\\frac{3}{4}\\right)^2,\\ \\ldots$', 'След третия удар: $4 \\cdot \\left(\\frac{3}{4}\\right)^3 = 4 \\cdot \\frac{27}{64}$', '$= 1{,}6875\\ \\mathrm{m}$'],
    answer: '$\\approx 1{,}69\\ \\mathrm{m}$',
    check: [1.69],
    ask: ['височина, m'],
  },
  {
    title: '📣 Слух',
    problem: 'Един човек разказва новина на трима души. На следващия ден всеки от тях я разказва на трима нови и т.н. Колко души общо знаят новината след 5 дни (заедно с първия)?',
    solution: ['Новите хора всеки ден: 3, 9, 27, 81, 243', 'Общо с първия: $1 + 3 + 9 + 27 + 81 + 243$', '$S = \\frac{3^6 - 1}{3 - 1} = \\frac{728}{2} = 364$'],
    answer: '364 души',
    check: [364],
    ask: ['брой хора'],
  },
  {
    title: '⚽ Целият път на топката',
    problem: 'Същата топка (пусната от 4 m, отскачаща до $\\frac{3}{4}$ от височината) подскача безкрайно много пъти. Какъв път изминава общо?',
    solution: [
      'Надолу първо 4 m. След това всеки отскок е нагоре и надолу: $2 \\cdot (3 + 2{,}25 + 1{,}6875 + \\ldots)$',
      'Безкрайна геометрична прогресия с $a_1 = 3$ и $q = \\frac{3}{4}$: сбор $\\frac{3}{1 - \\frac{3}{4}} = 12$',
      'Общо: $4 + 2 \\cdot 12 = 28$',
    ],
    answer: '28 m',
    check: [28],
    ask: ['път, m'],
  },
];

// ---------- Тест ----------

const sequencesQuiz: Question[] = [
  {
    question: 'Каква е разликата $d$ на прогресията 3, 7, 11, 15, …?',
    answers: ['$3$', '$4$', '$7$', '$11$'],
    correctAnswer: '$4$',
  },
  {
    question: 'В аритметична прогресия $a_1 = 2$ и $d = 3$. Колко е $a_{10}$?',
    answers: ['$29$', '$30$', '$32$', '$23$'],
    correctAnswer: '$29$',
  },
  {
    question: 'Колко е сборът $1 + 2 + 3 + \\ldots + 100$?',
    answers: ['$5000$', '$5050$', '$5100$', '$10\\,100$'],
    correctAnswer: '$5050$',
  },
  {
    question: 'Колко е петият член на геометричната прогресия 2, 6, 18, …?',
    answers: ['$54$', '$162$', '$486$', '$30$'],
    correctAnswer: '$162$',
  },
  {
    question: 'Колко е частното $q$ на прогресията 81, 27, 9, …?',
    answers: ['$3$', '$-3$', '$\\frac{1}{3}$', '$-54$'],
    correctAnswer: '$\\frac{1}{3}$',
  },
  {
    question: 'Колко е сборът $1 + 2 + 4 + 8 + 16$?',
    answers: ['$30$', '$31$', '$32$', '$15$'],
    correctAnswer: '$31$',
  },
  {
    question: 'Колко е безкрайният сбор $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\ldots$?',
    answers: ['$1$', '$2$', '$\\frac{3}{2}$', 'безкрайност'],
    correctAnswer: '$2$',
  },
  {
    question: 'Числата $a$, $b$, $c$ образуват аритметична прогресия. Кое е вярно?',
    answers: ['$b = \\frac{a + c}{2}$', '$b^2 = ac$', '$b = a + c$', '$c = 2a$'],
    correctAnswer: '$b = \\frac{a + c}{2}$',
  },
  {
    question: 'На колко е равно $0{,}999\\ldots = 0{,}(9)$?',
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
            минута малкият Карл Фридрих Гаус донесъл плочката си с един-единствен отговор: 5050. Той забелязал, че <Tex>{'1 + 100,\\ 2 + 99,\\ 3 + 98\\ldots'}</Tex>{' '}
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
            description="Числова редица е безкрайна наредена последователност от числа $a_1, a_2, a_3, \ldots$; $a_n$ се нарича $n$-ти член. Редицата може да е зададена с формула за общия член (например $a_n = 2n + 1$) или рекурентно – чрез предишните членове (например $a_1 = 1,\ a_{n+1} = 2a_n$)."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Аритметична прогресия</h2>
          <Theorem
            type="definition"
            title="Аритметична прогресия"
            description="Редица, в която всеки член (от втория нататък) се получава от предишния чрез прибавяне на едно и също число $d$ (разлика): $a_{n+1} = a_n + d$. Общ член: $a_n = a_1 + (n - 1)d$. Всеки член е средно аритметично на съседите си: $a_n = \frac{a_{n-1} + a_{n+1}}{2}$."
          />
          <SequenceLab />
          <Theorem title="Сбор на първите $n$ члена" description="$S_n = \frac{n(a_1 + a_n)}{2} = \frac{n(2a_1 + (n - 1)d)}{2}$. Частен случай: $1 + 2 + \ldots + n = \frac{n(n + 1)}{2}$." />
          <GaussSumLab />
          <Example
            description="В аритметична прогресия $a_3 = 7$ и $a_8 = 22$. Намерете $a_1$, $d$ и $S_{10}$."
            steps={['$a_8 - a_3 = 5d \\Rightarrow 22 - 7 = 5d \\Rightarrow d = 3$', '$a_1 = a_3 - 2d = 7 - 6 = 1$', '$a_{10} = 1 + 9 \\cdot 3 = 28$', '$S_{10} = 10 \\cdot \\frac{1 + 28}{2} = 145$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Геометрична прогресия</h2>
          <Theorem
            type="definition"
            title="Геометрична прогресия"
            description="Редица с ненулеви членове, в която всеки член (от втория нататък) се получава от предишния чрез умножение по едно и също число $q \ne 0$ (частно): $a_{n+1} = a_n \cdot q$. Общ член: $a_n = a_1 \cdot q^{n-1}$. При положителни членове всеки е средно геометрично на съседите си: $a_n^2 = a_{n-1} \cdot a_{n+1}$."
          />
          <Theorem title="Сбор на първите $n$ члена" description="При $q \ne 1$: $S_n = \frac{a_1(q^n - 1)}{q - 1}$. При $q = 1$ всички членове са равни и $S_n = n \cdot a_1$." />
          <Example
            description="Да изведем формулата за сбора: $S = a_1 + a_1q + \ldots + a_1q^{n-1}$."
            steps={['Умножаваме по $q$: $qS = a_1q + a_1q^2 + \\ldots + a_1q^n$', 'Изваждаме: $qS - S = a_1q^n - a_1$ (всички други членове се унищожават)', '$S(q - 1) = a_1(q^n - 1) \\Rightarrow S = \\frac{a_1(q^n - 1)}{q - 1}$']}
          />
          <p className={text}>
            Сложната лихва от урока{' '}
            <Link to="/algebra/fractions" className={link}>
              Дроби и проценти
            </Link>{' '}
            е геометрична прогресия с <Tex>{'q = 1 + \\frac{r}{100}'}</Tex>, а удвояването на бактериите и разпадът на радиоактивни вещества – също.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Безкрайна намаляваща геометрична прогресия</h2>
          <Theorem
            title="Сбор на безкрайна геометрична прогресия"
            description="Ако $|q| < 1$, частичните сборове $S_n$ се приближават неограничено до числото $S = \frac{a_1}{1 - q}$ – наричаме го сбор на безкрайната прогресия. При $|q| \ge 1$ такъв сбор няма."
          />
          <GeometricSeriesLab />
          <Example
            description="Парадоксът на Зенон: Ахил тича 10 пъти по-бързо от костенурката, която е 100 m пред него. Докато той стигне мястото ѝ, тя е изминала още 10 m; докато измине и тях – още 1 m… Ще я настигне ли?"
            steps={['Пътят на Ахил до срещата е $100 + 10 + 1 + 0{,}1 + \\ldots$ – безкрайна геометрична прогресия с $a_1 = 100,\\ q = \\frac{1}{10}$', '$S = \\frac{100}{1 - \\frac{1}{10}} = \\frac{1000}{9} \\approx 111{,}1\\ \\mathrm{m}$', 'Безкрайно много етапа, но краен път – Ахил настига костенурката след около 111 m']}
          />
          <Example
            description="Да запишем $0{,}(27) = 0{,}272727\ldots$ като обикновена дроб."
            steps={['$0{,}(27) = 0{,}27 + 0{,}0027 + 0{,}000027 + \\ldots$ – прогресия с $a_1 = \\frac{27}{100}$ и $q = \\frac{1}{100}$', '$S = \\frac{\\frac{27}{100}}{1 - \\frac{1}{100}} = \\frac{\\frac{27}{100}}{\\frac{99}{100}} = \\frac{27}{99}$', '$= \\frac{3}{11}$']}
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
              ['$n$ вместо $n - 1$', '$a_n = a_1 + n \\cdot d$', '$a_n = a_1 + (n - 1)d$'],
              ['Брой на членовете', 'числата от 10 до 20 са 10', 'те са $20 - 10 + 1 = 11$'],
              ['Знак на частното', '$2,\\ -6,\\ 18,\\ \\ldots \\Rightarrow q = 3$', '$q = -6 : 2 = -3$'],
              ['Безкраен сбор при $|q| \\ge 1$', '$1 + 2 + 4 + \\ldots = \\frac{1}{1 - 2} = -1$', 'сборът не съществува – членовете растат'],
              ['Показател в общия член', '$a_n = a_1 \\cdot q^n$', '$a_n = a_1 \\cdot q^{n-1}$'],
              ['0,(9) е по-малко от 1', '$0{,}999\\ldots < 1$', '$0{,}(9) = \\frac{0{,}9}{1 - 0{,}1} = 1$'],
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
          <Quiz questions={sequencesQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="В аритметична прогресия $a_1 = 5$ и $d = -2$. Намерете $a_{20}$ и $S_{20}$.">
                <p><Tex>{'a_{20} = 5 + 19 \\cdot (-2) = -33'}</Tex></p>
                <p><Tex>{'S_{20} = 20 \\cdot \\frac{5 + (-33)}{2} = 10 \\cdot (-28) = -280'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="В геометрична прогресия $a_1 = 3$ и $q = 2$. Намерете $a_6$ и $S_6$.">
                <p><Tex>{'a_6 = 3 \\cdot 2^5 = 96'}</Tex></p>
                <p><Tex>{'S_6 = 3 \\cdot \\frac{2^6 - 1}{2 - 1} = 3 \\cdot 63 = 189'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете $1 + 3 + 5 + \ldots + 99$.">
                <p>Аритметична прогресия: <Tex>{'a_1 = 1,\\ d = 2,\\ a_n = 99 \\Rightarrow n = \\frac{99 - 1}{2} + 1 = 50'}</Tex>.</p>
                <p><Tex>{'S = 50 \\cdot \\frac{1 + 99}{2} = 2500 = 50^2'}</Tex>. (Сборът на първите <Tex>{'n'}</Tex> нечетни числа винаги е <Tex>{'n^2'}</Tex>.)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="В аритметична прогресия $a_3 = 7$ и $a_8 = 22$. Намерете $S_{10}$.">
                <p><Tex>{'5d = 22 - 7 = 15 \\Rightarrow d = 3'}</Tex>; <Tex>{'a_1 = 7 - 2 \\cdot 3 = 1'}</Tex></p>
                <p><Tex>{'a_{10} = 1 + 27 = 28'}</Tex></p>
                <p><Tex>{'S_{10} = 10 \\cdot \\frac{1 + 28}{2} = 145'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В геометрична прогресия $a_2 = 6$ и $a_5 = 162$. Намерете $q$, $a_1$ и $S_5$.">
                <p><Tex>{'a_5 : a_2 = q^3 = 27 \\Rightarrow q = 3'}</Tex></p>
                <p><Tex>{'a_1 = 6 : 3 = 2'}</Tex></p>
                <p><Tex>{'S_5 = 2 \\cdot \\frac{3^5 - 1}{2} = 242'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="За кои $x$ числата $2, x, 18$ образуват геометрична прогресия? А аритметична?">
                <p>Геометрична: <Tex>{'x^2 = 2 \\cdot 18 = 36 \\Rightarrow x = 6'}</Tex> или <Tex>{'x = -6'}</Tex> (<Tex>{'q = 3'}</Tex> или <Tex>{'q = -3'}</Tex>).</p>
                <p>Аритметична: <Tex>{'x = \\frac{2 + 18}{2} = 10'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намерете сбора на всички числа от 1 до 1000, които не се делят на 3.">
                <p>Сборът на всички: <Tex>{'1000 \\cdot \\frac{1001}{2} = 500\\,500'}</Tex>.</p>
                <p>Делящите се на 3: <Tex>{'3 + 6 + \\ldots + 999 = 3 \\cdot (1 + 2 + \\ldots + 333) = 3 \\cdot 333 \\cdot \\frac{334}{2} = 166\\,833'}</Tex>.</p>
                <p>Търсеният сбор: <Tex>{'500\\,500 - 166\\,833 = 333\\,667'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Запишете 0,(27) като обикновена дроб, като използвате безкрайна геометрична прогресия.">
                <p><Tex>{'0{,}(27) = \\frac{27}{100} + \\frac{27}{100^2} + \\frac{27}{100^3} + \\ldots'}</Tex></p>
                <p><Tex>{'a_1 = \\frac{27}{100},\\ q = \\frac{1}{100} \\Rightarrow S = \\frac{\\frac{27}{100}}{\\frac{99}{100}} = \\frac{27}{99}'}</Tex></p>
                <p><Tex>{'= \\frac{3}{11}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Снежинката на Кох: започваме с равностранен триъгълник с лице $A$; на всяка стъпка върху средната третина на всяка страна навън се построява равностранен триъгълник. Докажете, че периметърът расте неограничено, а лицето клони към $\frac{8A}{5}$.">
                <p>Всяка стъпка заменя всяка отсечка с 4 отсечки, 3 пъти по-къси ⇒ периметърът се умножава по <Tex>{'\\frac{4}{3}'}</Tex> и расте неограничено.</p>
                <p>На стъпка <Tex>{'k'}</Tex> се добавят <Tex>{'3 \\cdot 4^{k-1}'}</Tex> триъгълника, всеки с лице <Tex>{'\\frac{A}{9^k}'}</Tex>. Общо добавено: <Tex>{'\\frac{A}{3} \\cdot \\left(1 + \\frac{4}{9} + \\left(\\frac{4}{9}\\right)^2 + \\ldots\\right)'}</Tex>.</p>
                <p>Прогресия с <Tex>{'q = \\frac{4}{9}'}</Tex>: сборът е <Tex>{'\\frac{A}{3} \\cdot \\frac{1}{1 - \\frac{4}{9}} = \\frac{A}{3} \\cdot \\frac{9}{5} = \\frac{3A}{5}'}</Tex>.</p>
                <p>Лицето клони към <Tex>{'A + \\frac{3A}{5} = \\frac{8A}{5}'}</Tex> – крайна площ с безкраен периметър!</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Аритметична: <Tex>{'a_n = a_1 + (n - 1)d'}</Tex>; <Tex>{'S_n = \\frac{n(a_1 + a_n)}{2}'}</Tex></li>
              <li>✓ Геометрична: <Tex>{'a_n = a_1q^{n-1}'}</Tex>; <Tex>{'S_n = \\frac{a_1(q^n - 1)}{q - 1}'}</Tex></li>
              <li>✓ Средно аритметично / геометрично на съседите</li>
              <li>✓ Безкрайна при <Tex>{'|q| < 1'}</Tex>: <Tex>{'S = \\frac{a_1}{1 - q}'}</Tex></li>
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
