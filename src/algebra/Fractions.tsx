import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import FractionAddLab from './FractionAddLab';
import FractionLab from './FractionLab';
import PercentLab from './PercentLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

// ---------- Тренажор: задачи с проценти ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: T[]) => xs[randInt(0, xs.length - 1)];
const PERCENTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75];

type Drill = { text: string; answer: number; unit: string; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  const p = pick(PERCENTS);
  const base = 20 * randInt(2, 25); // кратно на 20 – за цели отговори
  if (kind === 0) {
    const a = (p * base) / 100;
    return {
      text: `Колко е ${p}% от ${base}?`,
      answer: a,
      unit: '',
      steps: [`${p}% = ${p}/100 = ${num(p / 100)}`, `${num(p / 100)} · ${base} = ${num(a)}`],
    };
  }
  if (kind === 1) {
    const a = (p * base) / 100;
    return {
      text: `Колко процента е ${num(a)} от ${base}?`,
      answer: p,
      unit: '%',
      steps: [`${num(a)} : ${base} = ${num(p / 100)}`, `${num(p / 100)} · 100% = ${p}%`],
    };
  }
  if (kind === 2) {
    const q = Math.min(p, 50);
    const c = (base * (100 - q)) / 100;
    return {
      text: `След намаление с ${q}% якето струва ${num(c)} €. Колко е струвало преди това?`,
      answer: base,
      unit: '€',
      steps: [`Новата цена е ${100 - q}% от старата: x · ${num((100 - q) / 100)} = ${num(c)}`, `x = ${num(c)} : ${num((100 - q) / 100)} = ${base}`],
    };
  }
  const c = (base * (100 + p)) / 100;
  return {
    text: `След поскъпване с ${p}% билетът струва ${num(c)} €. Колко е струвал преди това?`,
    answer: base,
    unit: '€',
    steps: [`Новата цена е ${100 + p}% от старата: x · ${num((100 + p) / 100)} = ${num(c)}`, `x = ${num(c)} : ${num((100 + p) / 100)} = ${base}`],
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
    const v = Number(input.trim().replace('−', '-').replace(',', '.').replace('%', '').replace('€', ''));
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

      <p className="text-center text-lg sm:text-xl mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
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
        {task.unit && <span className="font-mono text-lg">{task.unit}</span>}
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
            : 'Не съвсем. От коя стойност се смятат процентите?'}
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
    title: '🏷️ Разпродажба',
    problem: 'Обувки струват 80 €. В разпродажба са намалени с 25%. Колко струват сега?',
    solution: ['Намалението е $25\\%\\ \\text{от}\\ 80 = 0{,}25 \\cdot 80 = 20$ €.', '$80 - 20 = 60$', 'По-кратко: $80 \\cdot 0{,}75 = 60$'],
    answer: '60 €',
    check: [60],
    ask: ['нова цена, €'],
  },
  {
    title: '🧾 ДДС',
    problem: 'Цената на книга с включен ДДС 20% е 36 €. Колко е цената без ДДС?',
    solution: ['Цената с ДДС е 120% от цената без ДДС: $x \\cdot 1{,}2 = 36$', '$x = 36 : 1{,}2 = 30$', 'ДДС е 6 € – това е 20% от 30, а не от 36!'],
    answer: '30 €',
    check: [30],
    ask: ['цена без ДДС, €'],
  },
  {
    title: '🏦 Спестявания',
    problem: 'Внасяш 1000 € в банка при 3% годишна лихва, която всяка година се прибавя към сумата (сложна лихва). Колко ще имаш след 5 години?',
    solution: ['Всяка година сумата се умножава по 1,03.', '$1000 \\cdot 1{,}03^5$', '$\\approx 1000 \\cdot 1{,}15927 \\approx 1159{,}27$'],
    answer: '$\\approx 1159{,}27$ € (при проста лихва биха били 1150 €)',
    check: [1159.27],
    ask: ['сума, €'],
  },
  {
    title: '🍪 Рецепта',
    problem: 'За 12 бисквити са нужни $\\frac{3}{4}$ чаша захар. Колко чаши захар трябват за 20 бисквити?',
    solution: ['За една бисквита: $\\frac{3}{4} : 12 = \\frac{3}{48} = \\frac{1}{16}$ чаша.', 'За 20: $20 \\cdot \\frac{1}{16} = \\frac{20}{16} = \\frac{5}{4}$', '$\\frac{5}{4} = 1\\frac{1}{4} = 1{,}25$ чаши'],
    answer: '$1\\frac{1}{4}$ чаши',
    check: [1.25],
    ask: ['чаши'],
  },
  {
    title: '🗳️ Избирателна активност',
    problem: 'В малък град има 6000 души с право на глас, от които са гласували 2400. Каква е избирателната активност?',
    solution: ['$2400 : 6000 = 0{,}4$', '$0{,}4 \\cdot 100\\% = 40\\%$'],
    answer: '40%',
    check: [40],
    ask: ['активност, %'],
  },
  {
    title: '💼 Заплата',
    problem: 'Заплата от 1500 € е увеличена с 10%, а на следващата година – намалена с 10%. Каква е заплатата накрая?',
    solution: ['$1500 \\cdot 1{,}1 = 1650$', '$1650 \\cdot 0{,}9 = 1485$', 'Общо: $1500 \\cdot 1{,}1 \\cdot 0{,}9 = 1500 \\cdot 0{,}99$ – с 1% по-малко от началото!'],
    answer: '1485 €',
    check: [1485],
    ask: ['заплата, €'],
  },
];

// ---------- Тест ----------

const fractionsQuiz: Question[] = [
  {
    question: 'Колко е $\\frac{3}{4} + \\frac{1}{6}$?',
    answers: ['$\\frac{4}{10}$', '$\\frac{11}{12}$', '$\\frac{4}{24}$', '$1$'],
    correctAnswer: '$\\frac{11}{12}$',
  },
  {
    question: 'Колко е $\\frac{2}{3} : \\frac{4}{9}$?',
    answers: ['$\\frac{8}{27}$', '$\\frac{3}{2}$', '$\\frac{2}{3}$', '$\\frac{6}{12}$'],
    correctAnswer: '$\\frac{3}{2}$',
  },
  {
    question: 'Съкратете дробта $\\frac{18}{24}$.',
    answers: ['$\\frac{9}{12}$', '$\\frac{3}{4}$', '$\\frac{2}{3}$', '$\\frac{6}{8}$'],
    correctAnswer: '$\\frac{3}{4}$',
  },
  {
    question: 'Кое е най-голямото число?',
    answers: ['$\\frac{3}{5}$', '$\\frac{5}{8}$', '$0{,}6$', '$61\\%$'],
    correctAnswer: '$\\frac{5}{8}$',
  },
  {
    question: 'Как се записва като обикновена дроб $0{,}(6) = 0{,}666\\ldots$?',
    answers: ['$\\frac{6}{10}$', '$\\frac{3}{5}$', '$\\frac{2}{3}$', '$\\frac{66}{100}$'],
    correctAnswer: '$\\frac{2}{3}$',
  },
  {
    question: 'Колко е 15% от 80?',
    answers: ['$8$', '$12$', '$15$', '$65$'],
    correctAnswer: '$12$',
  },
  {
    question: '30 е 25% от кое число?',
    answers: ['$7{,}5$', '$55$', '$120$', '$750$'],
    correctAnswer: '$120$',
  },
  {
    question: 'Цена е увеличена с 20%, а после намалена с 20%. Как се е променила спрямо началото?',
    answers: ['Не се е променила', 'Намаляла е с 4%', 'Увеличила се е с 4%', 'Намаляла е с 2%'],
    correctAnswer: 'Намаляла е с 4%',
  },
  {
    question: 'Лихвата по кредит се вдига от 4% на 5%. С колко процента е нараснала?',
    answers: ['С 1%', 'С 5%', 'С 20%', 'С 25%'],
    correctAnswer: 'С 25%',
  },
];

// ---------- Страница ----------

export function Fractions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Дроби и проценти</h1>

        <div className="bg-gradient-to-br from-rose-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🛍️ Табела в магазин: „−50%, а на касата – още −20%!“. Значи общо −70%? Не: якето за 100 € ще струва <Tex>{'100 \\cdot 0{,}5 \\cdot 0{,}8 = 40'}</Tex> €, т.е.
            отстъпката е 60%. Друг магазин вдига цените с 20%, а после ги „намалява“ с 20% – и клиентите плащат с 4% повече, отколкото в
            началото. Процентите са навсякъде – в цените, лихвите, заплатите, новините – и е полезно да не ни подвеждат. А зад всеки процент
            стои обикновена дроб.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Обикновени дроби</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Кое е повече – <Tex>{'\\frac{3}{8}'}</Tex> от една пица или <Tex>{'\\frac{2}{5}'}</Tex> от същата пица? Трудно е да се каже „на око“. Ако нарежем
              пицата на 40 парчета, <Tex>{'\\frac{3}{8}'}</Tex> са 15 парчета, а <Tex>{'\\frac{2}{5}'}</Tex> са 16. Общият знаменател превръща сравнението в броене.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Обикновена дроб и основно свойство"
            description="Дробта $\frac{a}{b}$ ($b \ne 0$) означава $a$ части от цяло, разделено на $b$ равни части; тя е и резултатът от делението $a : b$. Основно свойство: ако умножим или разделим числителя и знаменателя на едно и също число, различно от 0, получаваме равна дроб. Разширяване: $\frac{3}{4} = \frac{6}{8}$; съкращаване: $\frac{6}{8} = \frac{3}{4}$. Дроб е несъкратима, ако $\text{НОД}(a, b) = 1$."
          />
          <FractionLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Действия с дроби</h2>
          <Theorem
            title="Правила"
            description="Събиране и изваждане: привеждаме към общ знаменател (най-удобно – НОК на знаменателите) и събираме числителите: $\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}$. Умножение: числител по числител, знаменател по знаменател: $\frac{a}{b} \cdot \frac{c}{d} = \frac{ac}{bd}$. Деление: умножаваме по обратната дроб: $\frac{a}{b} : \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c}$."
          />
          <FractionAddLab />
          <Example
            description="Да пресметнем $\frac{2}{3} + \frac{3}{4} - \frac{5}{6}$."
            steps={['НОК(3, 4, 6) = 12', '$\\frac{2}{3} = \\frac{8}{12}$; $\\frac{3}{4} = \\frac{9}{12}$; $\\frac{5}{6} = \\frac{10}{12}$', '$\\frac{8 + 9 - 10}{12} = \\frac{7}{12}$']}
          />
          <Example
            description="Да пресметнем $\left(1\frac{1}{2} - \frac{2}{3}\right) \cdot \frac{6}{5}$."
            steps={['$1\\frac{1}{2} = \\frac{3}{2}$', '$\\frac{3}{2} - \\frac{2}{3} = \\frac{9}{6} - \\frac{4}{6} = \\frac{5}{6}$', '$\\frac{5}{6} \\cdot \\frac{6}{5} = \\frac{30}{30} = 1$ (съкращаваме преди да умножим: 5 и 5, 6 и 6)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Десетични дроби</h2>
          <p className={text}>
            Дроб със знаменател 10, 100, 1000… се записва като десетична: <Tex>{'\\frac{3}{4} = \\frac{75}{100} = 0{,}75'}</Tex>. Всяка обикновена дроб се превръща в десетична
            чрез деление. Резултатът е <strong>краен</strong>, ако знаменателят на несъкратимата дроб има само прости делители 2 и 5 (<Tex>{'\\frac{1}{8} = 0{,}125'}</Tex>), и <strong>безкраен периодичен</strong> в противен случай (<Tex>{'\\frac{1}{3} = 0{,}333\\ldots = 0{,}(3)'}</Tex>; <Tex>{'\\frac{1}{6} = 0{,}1(6)'}</Tex>).
          </p>
          <Example
            description="Да запишем $0{,}(36) = 0{,}363636\ldots$ като обикновена дроб."
            steps={['Нека $x = 0{,}3636\\ldots$; периодът има 2 цифри, затова умножаваме по 100', '$100x = 36{,}3636\\ldots$', 'Изваждаме: $100x - x = 36 \\Rightarrow 99x = 36$', '$x = \\frac{36}{99} = \\frac{4}{11}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Проценти</h2>
          <Theorem
            type="definition"
            title="Процент"
            description="Един процент (1%) е една стотна: $1\% = \frac{1}{100} = 0{,}01$. Затова $p\%$ от числото $A$ е $\frac{p}{100} \cdot A$. Например $20\% = \frac{1}{5}$, $25\% = \frac{1}{4}$, $50\% = \frac{1}{2}$, $75\% = \frac{3}{4}$."
          />
          <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Част от число', '$15\\%\\ \\text{от}\\ 80 = 0{,}15 \\cdot 80 = 12$', 'умножаваме'],
              ['Число по дадена част', '$30$ е $25\\%$ от $x \\Rightarrow x = 30 : 0{,}25 = 120$', 'делим'],
              ['Колко процента', '$12$ от $80 \\Rightarrow 12 : 80 = 0{,}15 = 15\\%$', 'делим и $\\cdot 100\\%$'],
            ].map(([title, ex, how]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold text-rose-700 dark:text-rose-400"><MathText>{title}</MathText></p>
                <p className="font-mono text-sm my-1"><MathText>{ex}</MathText></p>
                <p className="text-xs text-gray-500 dark:text-gray-400"><MathText>{how}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Промяна с проценти</h2>
          <Theorem
            title="Множител на промяната"
            description="Увеличение с $p\%$ означава умножение по $\left(1 + \frac{p}{100}\right)$, намаление с $p\%$ – умножение по $\left(1 - \frac{p}{100}\right)$. При няколко последователни промени множителите се умножават: +20% и после −20% дават $1{,}2 \cdot 0{,}8 = 0{,}96$, т.е. −4%. Сложна лихва: при $r\%$ годишно сумата след $n$ години е $S = S_0 \cdot \left(1 + \frac{r}{100}\right)^n$."
          />
          <PercentLab />
          <p className={text}>
            Внимавай и с <strong>процентните пунктове</strong>: ако лихвата се вдигне от 4% на 5%, тя е нараснала с 1 процентен пункт, но с 25%
            (защото 1 е 25% от 4). Новините често бъркат двете.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Трите основни задачи с проценти и „обратните“ задачи за цена преди промяната.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Задачи от живота</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Събиране на числители и знаменатели', '$\\frac{1}{2} + \\frac{1}{3} = \\frac{2}{5}$', '$\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$'],
              ['Съкращаване на събираеми', '$\\frac{2 + 3}{2 \\cdot 5} = \\frac{3}{5}$', '$\\frac{5}{10} = \\frac{1}{2}$ – съкращаваме само множители'],
              ['Деление без обръщане', '$\\frac{2}{3} : \\frac{4}{5} = \\frac{8}{15}$', '$\\frac{2}{3} \\cdot \\frac{5}{4} = \\frac{10}{12} = \\frac{5}{6}$'],
              ['+20% и −20% се унищожават', '100 → 120 → 100', '100 → 120 → 96'],
              ['Процент от грешната основа', 'с ДДС 120 € ⇒ ДДС $= 20\\%\\ \\text{от}\\ 120 = 24$ €', '$120 : 1{,}2 = 100 \\Rightarrow$ ДДС $= 20$ €'],
              ['Проценти и процентни пунктове', '4% → 5% е ръст с 1%', 'ръст с 1 пункт, т.е. с 25%'],
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
          <Quiz questions={fractionsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Пресметнете $\frac{2}{3} + \frac{3}{4} - \frac{5}{6}$.">
                <p>Общ знаменател 12: <Tex>{'\\frac{8}{12} + \\frac{9}{12} - \\frac{10}{12}'}</Tex></p>
                <p><Tex>{'= \\frac{7}{12}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $\left(1\frac{1}{2} - \frac{2}{3}\right) \cdot \frac{6}{5}$.">
                <p><Tex>{'1\\frac{1}{2} - \\frac{2}{3} = \\frac{3}{2} - \\frac{2}{3} = \\frac{9}{6} - \\frac{4}{6} = \\frac{5}{6}'}</Tex></p>
                <p><Tex>{'\\frac{5}{6} \\cdot \\frac{6}{5} = 1'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Цената на велосипед е намалена от 250 € на 200 €. С колко процента е намалена?">
                <p>Намалението е 50 €.</p>
                <p><Tex>{'50 : 250 = 0{,}2 = 20\\%'}</Tex> (процентът се смята от старата цена!)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Запишете $0{,}1(6) = 0{,}1666\ldots$ като обикновена дроб.">
                <p><Tex>{'x = 0{,}1666\\ldots'}</Tex>; <Tex>{'10x = 1{,}666\\ldots'}</Tex>; <Tex>{'100x = 16{,}666\\ldots'}</Tex></p>
                <p><Tex>{'100x - 10x = 15 \\Rightarrow 90x = 15'}</Tex></p>
                <p><Tex>{'x = \\frac{15}{90} = \\frac{1}{6}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Цена е увеличена с 25%. С колко процента трябва да се намали новата цена, за да се върне към старата?">
                <p>Новата цена е 1,25 пъти старата. Трябва да я умножим по <Tex>{'1 : 1{,}25 = 0{,}8'}</Tex>.</p>
                <p>Множител 0,8 означава намаление с 20% (а не с 25%).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Имаме 200 g 10% солен разтвор. Колко грама вода трябва да изпарим, за да стане 25%?">
                <p>Солта е <Tex>{'10\\%\\ \\text{от}\\ 200 = 20\\ \\mathrm{g}'}</Tex> и при изпаряването не се променя.</p>
                <p>Новият разтвор: <Tex>{'20\\ \\mathrm{g}'}</Tex> са <Tex>{'25\\%'}</Tex> ⇒ масата му е <Tex>{'20 : 0{,}25 = 80\\ \\mathrm{g}'}</Tex>.</p>
                <p>Изпаряваме <Tex>{'200 - 80 = 120\\ \\mathrm{g}'}</Tex> вода.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че $\frac{1}{n(n + 1)} = \frac{1}{n} - \frac{1}{n + 1}$, и пресметнете $\frac{1}{1\cdot 2} + \frac{1}{2\cdot 3} + \ldots + \frac{1}{99\cdot 100}$.">
                <p><Tex>{'\\frac{1}{n} - \\frac{1}{n + 1} = \\frac{n + 1 - n}{n(n + 1)} = \\frac{1}{n(n + 1)}'}</Tex> ✓</p>
                <p>Сборът става <Tex>{'\\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\ldots + \\left(\\frac{1}{99} - \\frac{1}{100}\\right)'}</Tex>.</p>
                <p>Всичко в средата се съкращава („телескопичен сбор“): остава <Tex>{'1 - \\frac{1}{100} = \\frac{99}{100}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Древните египтяни записвали дробите като сбор от различни дроби с числител 1. Представете така $\frac{5}{6}$ и $\frac{7}{15}$.">
                <p><Tex>{'\\frac{5}{6}'}</Tex>: най-голямата такава дроб, която не надминава <Tex>{'\\frac{5}{6}'}</Tex>, е <Tex>{'\\frac{1}{2}'}</Tex>; <Tex>{'\\frac{5}{6} - \\frac{1}{2} = \\frac{1}{3} \\Rightarrow \\frac{5}{6} = \\frac{1}{2} + \\frac{1}{3}'}</Tex>.</p>
                <p><Tex>{'\\frac{7}{15}'}</Tex>: взимаме <Tex>{'\\frac{1}{3}'}</Tex>; <Tex>{'\\frac{7}{15} - \\frac{1}{3} = \\frac{2}{15}'}</Tex>. После <Tex>{'\\frac{1}{8}'}</Tex> (защото <Tex>{'\\frac{1}{7} > \\frac{2}{15}'}</Tex>): <Tex>{'\\frac{2}{15} - \\frac{1}{8} = \\frac{1}{120}'}</Tex>.</p>
                <p><Tex>{'\\frac{7}{15} = \\frac{1}{3} + \\frac{1}{8} + \\frac{1}{120}'}</Tex>. Този „алчен“ метод е описан от Фибоначи и винаги завършва.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="След колко години сума при 7% годишна сложна лихва за първи път ще се удвои? Сравнете с „правилото на 72“.">
                <p>Търсим най-малкото <Tex>{'n'}</Tex> с <Tex>{'1{,}07^n \\ge 2'}</Tex>.</p>
                <p><Tex>{'1{,}07^{10} \\approx 1{,}967 < 2'}</Tex>, а <Tex>{'1{,}07^{11} \\approx 2{,}105 \\ge 2 \\Rightarrow n = 11'}</Tex> години.</p>
                <p>Правилото на 72: <Tex>{'72 : 7 \\approx 10{,}3'}</Tex> години – добра бърза оценка.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\frac{a}{b}'}</Tex> – <Tex>{'a'}</Tex> части от <Tex>{'b'}</Tex> равни; разширяване и съкращаване не променят стойността</li>
              <li>✓ Събиране – общ знаменател; умножение – „право“; деление – по обратната дроб</li>
              <li>✓ Периодична дроб → обикновена: умножаваме по 10, 100… и изваждаме</li>
              <li>✓ <Tex>{'p\\%\\ \\text{от}\\ A = \\frac{p}{100} \\cdot A'}</Tex>; „<Tex>{'A'}</Tex> е колко % от <Tex>{'B'}</Tex>“ <Tex>{'= A : B \\cdot 100\\%'}</Tex></li>
              <li>✓ Промяна с <Tex>{'p\\%'}</Tex> = умножение по <Tex>{'\\left(1 \\pm \\frac{p}{100}\\right)'}</Tex>; последователните промени се умножават</li>
              <li>✓ Сложна лихва: <Tex>{'S_0 \\cdot \\left(1 + \\frac{r}{100}\\right)^n'}</Tex>; процентни пунктове ≠ проценти</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Папирусът на Ринд (Египет, около 1550 г. пр.н.е.) съдържа таблица, в която дроби като <Tex>{'\\frac{2}{5}'}</Tex> са записани като сбор от различни
              дроби с числител 1: <Tex>{'\\frac{2}{5} = \\frac{1}{3} + \\frac{1}{15}'}</Tex>. Египтяните почти не използвали други дроби (с изключение на <Tex>{'\\frac{2}{3}'}</Tex>). А знакът % се смята, че
              произлиза от италианското <em>per cento</em> – „на сто“, което търговците съкращавали при писане, докато накрая се превърнало в
              кръгче, черта и още едно кръгче.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
