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
import { MathText, Tex } from '~/MathText';

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
    solution: ['За 3 часа = 180 минути има $180 : 20 = 9$ деления.', 'При всяко деление броят се удвоява: $2^9$', '$2^9 = 512$'],
    answer: '512 бактерии',
    check: [512],
    ask: ['брой'],
  },
  {
    title: '☀️ Светлината от Слънцето',
    problem: 'Разстоянието от Земята до Слънцето е около $1{,}5 \\cdot 10^{11}\\ \\mathrm{m}$, а скоростта на светлината – около $3 \\cdot 10^8\\ \\mathrm{m/s}$. За колко секунди светлината стига до нас?',
    solution: ['$t = s : v = (1{,}5 \\cdot 10^{11}) : (3 \\cdot 10^8)$', '$= (1{,}5 : 3) \\cdot 10^{11-8} = 0{,}5 \\cdot 10^3$', '$= 500\\ \\mathrm{s}$ (около 8 минути и 20 секунди)'],
    answer: '500 s',
    check: [500],
    ask: ['време, s'],
  },
  {
    title: '🏠 Квадратна стая',
    problem: 'Квадратна стая има лице $30{,}25\\ \\mathrm{m}^2$. Колко е дължината на стената?',
    solution: ['Страната е $\\sqrt{30{,}25}$.', '$5{,}5^2 = 30{,}25$', 'Страната е 5,5 m'],
    answer: '5,5 m',
    check: [5.5],
    ask: ['страна, m'],
  },
  {
    title: '🪨 Падащ камък',
    problem: 'Времето за свободно падане от височина $h$ е $t = \\sqrt{\\frac{2h}{g}}$. За колко секунди камък пада от $45\\ \\mathrm{m}$ ($g \\approx 10\\ \\mathrm{m/s^2}$)?',
    solution: ['$t = \\sqrt{\\frac{2 \\cdot 45}{10}}$', '$= \\sqrt{9}$', '$= 3\\ \\mathrm{s}$'],
    answer: '3 s',
    check: [3],
    ask: ['време, s'],
  },
  {
    title: '☢️ Радиоактивен йод',
    problem: 'Периодът на полуразпад на йод-131 е около 8 дни – за толкова време количеството му намалява наполовина. Колко милиграма ще останат от 80 mg след 24 дни?',
    solution: ['24 дни са 3 периода на полуразпад.', 'Количеството се умножава по $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$.', '$80 \\cdot \\frac{1}{8} = 10$'],
    answer: '10 mg',
    check: [10],
    ask: ['остатък, mg'],
  },
  {
    title: '📺 Диагонал на телевизор',
    problem: 'Екран е широк 1,6 m и висок 0,9 m. Колко е диагоналът му?',
    solution: ['По Питагоровата теорема: $d = \\sqrt{1{,}6^2 + 0{,}9^2}$', '$= \\sqrt{2{,}56 + 0{,}81} = \\sqrt{3{,}37}$', '$\\approx 1{,}84\\ \\mathrm{m}$ (около 72 инча)'],
    answer: '$\\approx 1{,}84\\ \\mathrm{m}$',
    check: [1.84],
    ask: ['диагонал, m'],
  },
];

// ---------- Тест ----------

const powersQuiz: Question[] = [
  {
    question: 'На колко е равно $2^3 \\cdot 2^4$?',
    answers: ['$2^7$', '$2^{12}$', '$4^7$', '$4^{12}$'],
    correctAnswer: '$2^7$',
  },
  {
    question: 'На колко е равно $(3^2)^3$?',
    answers: ['$3^5$', '$3^6$', '$3^8$', '$9^5$'],
    correctAnswer: '$3^6$',
  },
  {
    question: 'На колко е равно $5^0$?',
    answers: ['$0$', '$1$', '$5$', 'не е определено'],
    correctAnswer: '$1$',
  },
  {
    question: 'На колко е равно $2^{-3}$?',
    answers: ['$-8$', '$-6$', '$\\frac{1}{8}$', '$\\frac{1}{6}$'],
    correctAnswer: '$\\frac{1}{8}$',
  },
  {
    question: 'Изнесете множител пред корена: $\\sqrt{50} =$ ?',
    answers: ['$25\\sqrt{2}$', '$5\\sqrt{2}$', '$2\\sqrt{5}$', '$10\\sqrt{5}$'],
    correctAnswer: '$5\\sqrt{2}$',
  },
  {
    question: 'На колко е равно $\\sqrt{(-3)^2}$?',
    answers: ['$-3$', '$3$', '$\\pm 3$', '$9$'],
    correctAnswer: '$3$',
  },
  {
    question: 'На колко е равно $8^{2/3}$?',
    answers: ['$4$', '$\\frac{16}{3}$', '$2$', '$64$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Как се записва 0,00042 в стандартен вид?',
    answers: ['$4{,}2 \\cdot 10^{-4}$', '$4{,}2 \\cdot 10^{-3}$', '$42 \\cdot 10^{-5}$', '$4{,}2 \\cdot 10^4$'],
    correctAnswer: '$4{,}2 \\cdot 10^{-4}$',
  },
  {
    question: 'Рационализирайте знаменателя: $\\frac{1}{\\sqrt{3}} =$ ?',
    answers: ['$\\sqrt{3}$', '$\\frac{\\sqrt{3}}{3}$', '$\\frac{3}{\\sqrt{3}}$', '$\\frac{1}{3}$'],
    correctAnswer: '$\\frac{\\sqrt{3}}{3}$',
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
            четири на третото – всеки път двойно повече – до 64-тото поле. Владетелят се засмял… докато не пресметнали. Общо това са <Tex>{'2^{64} - 1 = 18\\,446\\,744\\,073\\,709\\,551\\,615'}</Tex> зърна. При около 0,05 g на зърно това са над 900 милиарда тона – повече от хиляда години днешна
            световна реколта от пшеница. Така изглежда <strong>степента</strong>: малки числа, които растат невъобразимо бързо.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Степен с естествен показател</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Кое е по-голямо: <Tex>{'(-2)^4'}</Tex> или <Tex>{'-2^4'}</Tex>? Изглеждат еднакво, но първото е <Tex>{'(-2)\\cdot (-2)\\cdot (-2)\\cdot (-2) = 16'}</Tex>, а второто
              е <Tex>{'-(2\\cdot 2\\cdot 2\\cdot 2) = -16'}</Tex>. Скобите решават всичко.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Степен"
            description="За естествено число $n$ степента $a^n$ е произведението на $n$ множителя, равни на $a$: $a^n = a \cdot a \cdot \ldots \cdot a$. Числото $a$ е основа, а $n$ – показател. Отрицателно число на четна степен е положително, а на нечетна – отрицателно."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Свойства на степените</h2>
          <Theorem
            title="Действия със степени"
            description="$a^m \cdot a^n = a^{m+n}$; $a^m : a^n = a^{m-n}$ ($a \ne 0$); $(a^m)^n = a^{mn}$; $(ab)^n = a^nb^n$; $\left(\frac{a}{b}\right)^n = \frac{a^n}{b^n}$. За да важат правилата и при $m = n$, и при $m < n$, дефинираме $a^0 = 1$ и $a^{-n} = \frac{1}{a^n}$ ($a \ne 0$)."
          />
          <PowerRulesLab />
          <Example
            description="Да опростим $(2^5 \cdot 2^3) : 2^6$."
            steps={['$2^5 \\cdot 2^3 = 2^8$', '$2^8 : 2^6 = 2^2$', '$= 4$']}
          />
          <p className={text}>
            Много големите и много малките числа записваме в <strong>стандартен вид</strong> <Tex>{'a \\cdot 10^n'}</Tex>, където <Tex>{'1 \\le a < 10'}</Tex>: скоростта на
            светлината е <Tex>{'3 \\cdot 10^8\\ \\mathrm{m/s}'}</Tex>, а диаметърът на атом – около <Tex>{'10^{-10}\\ \\mathrm{m}'}</Tex>. Умножаването тогава е лесно: множим числата и събираме
            показателите.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Квадратен корен</h2>
          <Theorem
            type="definition"
            title="Квадратен корен"
            description="Квадратен корен от неотрицателното число $a$ е неотрицателното число $\sqrt{a}$, чийто квадрат е $a$: $(\sqrt{a})^2 = a$ и $\sqrt{a} \ge 0$. Например $\sqrt{49} = 7$ (а не −7, въпреки че $(-7)^2 = 49$). От отрицателно число квадратен корен в реалните числа няма. За всяко $x$: $\sqrt{x^2} = |x|$."
          />
          <SqrtLab />
          <Theorem
            title="Свойства на корените"
            description="$\sqrt{ab} = \sqrt{a} \cdot \sqrt{b}$ и $\sqrt{\frac{a}{b}} = \frac{\sqrt{a}}{\sqrt{b}}$ ($a \ge 0$, $b > 0$). Изнасяне пред корена: $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2}$. Внасяне под корена: $3\sqrt{2} = \sqrt{18}$. Рационализиране на знаменателя: $\frac{1}{\sqrt{2}} = \frac{\sqrt{2}}{2}$; $\frac{1}{\sqrt{a} - \sqrt{b}} = \frac{\sqrt{a} + \sqrt{b}}{a - b}$. Внимание: $\sqrt{a + b} \ne \sqrt{a} + \sqrt{b}$."
          />
          <Example
            description="Да опростим $\sqrt{12} + \sqrt{27} - \sqrt{48}$."
            steps={['$\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$', '$\\sqrt{27} = \\sqrt{9 \\cdot 3} = 3\\sqrt{3}$', '$\\sqrt{48} = \\sqrt{16 \\cdot 3} = 4\\sqrt{3}$', '$2\\sqrt{3} + 3\\sqrt{3} - 4\\sqrt{3} = \\sqrt{3}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Корен n-ти и рационален показател</h2>
          <Theorem
            type="definition"
            title="Корен n-ти и степен с дробен показател"
            description="$\sqrt[n]{a}$ е числото, чиято $n$-та степен е $a$ (при четно $n$ искаме $a \ge 0$ и $\sqrt[n]{a} \ge 0$): $\sqrt[3]{8} = 2$, $\sqrt[3]{-27} = -3$, $\sqrt[4]{81} = 3$. За $a > 0$ дефинираме $a^{m/n} = \sqrt[n]{a^m} = (\sqrt[n]{a})^m$. Например $8^{2/3} = (\sqrt[3]{8})^2 = 4$, а $a^{1/2} = \sqrt{a}$. Всички правила за степени остават в сила."
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
              ['Умножени показатели при произведение', '$2^3 \\cdot 2^4 = 2^{12}$', '$2^3 \\cdot 2^4 = 2^7$'],
              ['Скобите и минусът', '$-2^4 = 16$', '$-2^4 = -16$, но $(-2)^4 = 16$'],
              ['Корен от сбор', '$\\sqrt{9 + 16} = 3 + 4 = 7$', '$\\sqrt{25} = 5$'],
              ['Корен от квадрат', '$\\sqrt{x^2} = x$', '$\\sqrt{x^2} = |x|$; при $x = -3$ е 3'],
              ['Отрицателен показател', '$2^{-3} = -8$', '$2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$'],
              ['Различни основи', '$2^3 \\cdot 3^2 = 6^5$', '$8 \\cdot 9 = 72$ – правилата са за еднакви основи'],
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
          <Quiz questions={powersQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете $(2^5 \cdot 2^3) : 2^6$.">
                <p><Tex>{'2^5 \\cdot 2^3 = 2^8'}</Tex></p>
                <p><Tex>{'2^8 : 2^6 = 2^2 = 4'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Опростете $\sqrt{12} + \sqrt{27} - \sqrt{48}$.">
                <p><Tex>{'\\sqrt{12} = 2\\sqrt{3}'}</Tex>; <Tex>{'\\sqrt{27} = 3\\sqrt{3}'}</Tex>; <Tex>{'\\sqrt{48} = 4\\sqrt{3}'}</Tex></p>
                <p><Tex>{'2\\sqrt{3} + 3\\sqrt{3} - 4\\sqrt{3} = \\sqrt{3}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете $0{,}0005 \cdot 4 \cdot 10^6$ и запишете резултата в стандартен вид.">
                <p><Tex>{'0{,}0005 = 5 \\cdot 10^{-4}'}</Tex></p>
                <p><Tex>{'5 \\cdot 10^{-4} \\cdot 4 \\cdot 10^6 = 20 \\cdot 10^2 = 2 \\cdot 10^3'}</Tex></p>
                <p><Tex>{'= 2000'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Рационализирайте знаменателя: $\frac{6}{\sqrt{5} - \sqrt{2}}$.">
                <p>Умножаваме числителя и знаменателя по спрегнатия израз <Tex>{'\\sqrt{5} + \\sqrt{2}'}</Tex>.</p>
                <p>Знаменател: <Tex>{'(\\sqrt{5} - \\sqrt{2})(\\sqrt{5} + \\sqrt{2}) = 5 - 2 = 3'}</Tex></p>
                <p><Tex>{'\\frac{6(\\sqrt{5} + \\sqrt{2})}{3} = 2(\\sqrt{5} + \\sqrt{2}) = 2\\sqrt{5} + 2\\sqrt{2}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Кое е по-голямо: $\sqrt{2} + \sqrt{3}$ или $\sqrt{10}$?">
                <p>И двете са положителни, затова сравняваме квадратите им.</p>
                <p><Tex>{'(\\sqrt{2} + \\sqrt{3})^2 = 5 + 2\\sqrt{6}'}</Tex>; <Tex>{'(\\sqrt{10})^2 = 10'}</Tex></p>
                <p><Tex>{'2\\sqrt{6} = \\sqrt{24} < \\sqrt{25} = 5 \\Rightarrow 5 + 2\\sqrt{6} < 10 \\Rightarrow \\sqrt{10}'}</Tex> е по-голямото.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Решете уравненията $2^{x+1} = 32$ и $9^x = 27$.">
                <p><Tex>{'32 = 2^5 \\Rightarrow x + 1 = 5 \\Rightarrow x = 4'}</Tex></p>
                <p><Tex>{'9^x = 3^{2x}'}</Tex> и <Tex>{'27 = 3^3 \\Rightarrow 2x = 3 \\Rightarrow x = 1{,}5'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че $\sqrt{2}$ не е рационално число.">
                <p>Да допуснем, че <Tex>{'\\sqrt{2} = \\frac{p}{q}'}</Tex>, несъкратима дроб. Тогава <Tex>{'p^2 = 2q^2 \\Rightarrow p^2'}</Tex> е четно <Tex>{'\\Rightarrow p'}</Tex> е четно, <Tex>{'p = 2k'}</Tex>.</p>
                <p><Tex>{'4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2 \\Rightarrow'}</Tex> и <Tex>{'q'}</Tex> е четно.</p>
                <p>Тогава <Tex>{'p'}</Tex> и <Tex>{'q'}</Tex> имат общ делител 2 – противоречие с несъкратимостта. Значи <Tex>{'\\sqrt{2}'}</Tex> е ирационално.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Опростете $\sqrt{7 + 4\sqrt{3}}$.">
                <p>Търсим <Tex>{'(a + b\\sqrt{3})^2 = a^2 + 3b^2 + 2ab\\sqrt{3} = 7 + 4\\sqrt{3}'}</Tex>.</p>
                <p><Tex>{'2ab = 4'}</Tex> и <Tex>{'a^2 + 3b^2 = 7 \\Rightarrow a = 2,\\ b = 1'}</Tex>.</p>
                <p><Tex>{'\\sqrt{7 + 4\\sqrt{3}} = 2 + \\sqrt{3}'}</Tex> (положително, значи знакът е верен).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кое е по-голямо: $2^{300}$ или $3^{200}$?">
                <p><Tex>{'2^{300} = (2^3)^{100} = 8^{100}'}</Tex></p>
                <p><Tex>{'3^{200} = (3^2)^{100} = 9^{100}'}</Tex></p>
                <p><Tex>{'8^{100} < 9^{100} \\Rightarrow 3^{200}'}</Tex> е по-голямото.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'a^m \\cdot a^n = a^{m+n}'}</Tex>; <Tex>{'a^m : a^n = a^{m-n}'}</Tex>; <Tex>{'(a^m)^n = a^{mn}'}</Tex></li>
              <li>✓ <Tex>{'a^0 = 1'}</Tex>; <Tex>{'a^{-n} = \\frac{1}{a^n}'}</Tex>; стандартен вид <Tex>{'a \\cdot 10^n'}</Tex>, <Tex>{'1 \\le a < 10'}</Tex></li>
              <li>✓ <Tex>{'\\sqrt{a} \\ge 0'}</Tex> и <Tex>{'(\\sqrt{a})^2 = a'}</Tex>; <Tex>{'\\sqrt{x^2} = |x|'}</Tex></li>
              <li>✓ <Tex>{'\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}'}</Tex>, но <Tex>{'\\sqrt{a + b} \\ne \\sqrt{a} + \\sqrt{b}'}</Tex></li>
              <li>✓ Изнасяне пред корена: <Tex>{'\\sqrt{50} = 5\\sqrt{2}'}</Tex>; рационализиране: <Tex>{'\\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}'}</Tex></li>
              <li>✓ <Tex>{'a^{m/n} = \\sqrt[n]{a^m}'}</Tex>; <Tex>{'a^{1/2} = \\sqrt{a}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Лист хартия е дебел около 0,1 mm. Ако можехме да го сгънем на две 42 пъти, дебелината му щеше да е <Tex>{'0{,}1\\ \\mathrm{mm} \\cdot 2^{42} \\approx 440\\,000\\ \\mathrm{km}'}</Tex> –
              повече от разстоянието до Луната (около 384 000 km). На практика обикновен лист трудно се сгъва повече от 7–8 пъти, защото всяко
              сгъване удвоява дебелината. Рекордът е 12 сгъвания – постигнат през 2002 г. с лента хартия, дълга над километър.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
