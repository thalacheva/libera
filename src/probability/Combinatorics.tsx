import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import LatticePathLab from './LatticePathLab';
import PascalLab from './PascalLab';
import TreeLab from './TreeLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const V = (n: number, k: number) => fact(n) / fact(n - k);
const C = (n: number, k: number) => V(n, k) / fact(k);

type Drill = { text: string; answer: number; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const n = randInt(3, 7);
    return {
      text: `По колко начина ${n} приятели могат да се наредят на опашка?`,
      answer: fact(n),
      steps: ['Редът има значение, всички участват ⇒ пермутации', `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' · ')} = ${fact(n)}`],
    };
  }
  if (kind === 1) {
    const n = randInt(5, 12);
    const k = randInt(2, 3);
    const roles = k === 2 ? 'капитан и заместник' : 'председател, секретар и касиер';
    return {
      text: `От ${n} ученици избираме ${roles}. По колко начина?`,
      answer: V(n, k),
      steps: ['Редът (ролята) има значение, без повторение ⇒ вариации', `${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = ${V(n, k)}`],
    };
  }
  if (kind === 2) {
    const n = randInt(5, 12);
    const k = randInt(2, 4);
    return {
      text: `По колко начина можем да изберем ${k} книги от ${n} за ваканцията?`,
      answer: C(n, k),
      steps: ['Редът няма значение ⇒ комбинации', `C(${n}, ${k}) = ${Array.from({ length: k }, (_, i) => n - i).join(' · ')} / ${k}! = ${V(n, k)} / ${fact(k)} = ${C(n, k)}`],
    };
  }
  if (kind === 3) {
    const n = randInt(4, 15);
    return {
      text: `На среща ${n} души се ръкуват всеки с всеки по веднъж. Колко ръкостискания има?`,
      answer: C(n, 2),
      steps: ['Всяко ръкостискане е двойка хора, редът няма значение', `C(${n}, 2) = ${n} · ${n - 1} / 2 = ${C(n, 2)}`],
    };
  }
  const base = [2, 3, 10][randInt(0, 2)];
  const k = base === 10 ? randInt(2, 4) : randInt(3, 6);
  const what = base === 2 ? `двоични низа (от 0 и 1) с дължина ${k}` : base === 3 ? `думи с дължина ${k} от буквите А, Б и В` : `кода от ${k} цифри`;
  return {
    text: `Колко различни ${what} има?`,
    answer: base ** k,
    steps: ['На всяка позиция – по ' + base + ' възможности, повторенията са разрешени', `${base}^${k} = ${base ** k}`],
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
    const v = Number(input.trim().replace(/\s/g, ''));
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
          className="w-32 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
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
            : 'Не съвсем. Има ли значение редът? Разрешени ли са повторения?'}
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
    title: '👕 Гардероб',
    problem: 'Имаш 4 тениски, 3 панталона и 2 чифта обувки. Колко различни тоалета можеш да съставиш?',
    solution: ['Изборите са последователни и независими ⇒ правило за умножение.', '4 · 3 · 2 = 24'],
    answer: '24 тоалета',
    check: [24],
    ask: ['тоалети'],
  },
  {
    title: '🔐 ПИН код',
    problem: 'Колко различни 4-цифрени ПИН кода има (цифрите могат да се повтарят, може да започва с 0)? А колко са те, ако всички цифри са различни?',
    solution: ['С повторения: на всяка позиция по 10 цифри ⇒ 10⁴ = 10 000', 'Без повторения: 10 · 9 · 8 · 7 = 5040'],
    answer: '10 000 и 5040',
    check: [10000, 5040],
    ask: ['с повторения', 'без повторения'],
  },
  {
    title: '🏅 Подиум',
    problem: 'Във финал бягат 8 атлети. По колко различни начина може да се разпредели подиумът (злато, сребро, бронз)?',
    solution: ['Редът има значение, без повторение ⇒ вариации', '8 · 7 · 6 = 336'],
    answer: '336',
    check: [336],
    ask: ['начина'],
  },
  {
    title: '🎱 Тото 6 от 49',
    problem: 'В играта „6 от 49“ се теглят 6 различни числа от 1 до 49 (редът няма значение). Колко различни фиша има?',
    solution: ['Комбинации: C(49, 6) = 49 · 48 · 47 · 46 · 45 · 44 / 6!', '= 10 068 347 520 / 720', '= 13 983 816'],
    answer: '13 983 816 – шансът за джакпот с един фиш е около 1 към 14 милиона',
    check: [13983816],
    ask: ['комбинации'],
  },
  {
    title: '🤝 Ръкостискания',
    problem: 'На среща 10 души се ръкуват всеки с всеки точно по веднъж. Колко са ръкостисканията?',
    solution: ['Всеки от 10-те се ръкува с 9 души: 10 · 9 = 90 – но така всяко ръкостискане е броено два пъти.', '90 : 2 = 45 = C(10, 2)'],
    answer: '45',
    check: [45],
    ask: ['ръкостискания'],
  },
  {
    title: '🍕 Пица по избор',
    problem: 'Пицарията предлага 8 добавки. Можеш да избереш точно 3 различни. Колко различни пици можеш да поръчаш?',
    solution: ['Редът на добавките няма значение ⇒ комбинации', 'C(8, 3) = 8 · 7 · 6 / 6 = 56'],
    answer: '56',
    check: [56],
    ask: ['пици'],
  },
];

// ---------- Тест ----------

const combQuiz: Question[] = [
  {
    question: 'На колко е равно 5!?',
    answers: ['15', '25', '120', '720'],
    correctAnswer: '120',
  },
  {
    question: 'По колко начина 3 души могат да седнат на 3 стола в редица?',
    answers: ['3', '6', '9', '27'],
    correctAnswer: '6',
  },
  {
    question: 'На колко е равно C(6, 2)?',
    answers: ['12', '15', '30', '36'],
    correctAnswer: '15',
  },
  {
    question: 'Колко различни „думи“ (анаграми) могат да се получат от буквите на МАМА?',
    answers: ['4', '6', '12', '24'],
    correctAnswer: '6',
  },
  {
    question: 'Колко различни низа от 0 и 1 с дължина 5 има?',
    answers: ['10', '25', '32', '120'],
    correctAnswer: '32',
  },
  {
    question: 'Кое е равно на C(10, 3)?',
    answers: ['C(10, 7)', 'C(7, 3)', '10 · 3', '10!/3!'],
    correctAnswer: 'C(10, 7)',
  },
  {
    question: 'Колко са пътищата от A до B в мрежа 3 × 2, ако вървим само надясно и нагоре?',
    answers: ['5', '6', '10', '12'],
    correctAnswer: '10',
  },
  {
    question: 'На колко е равен сборът на числата в n-тия ред на триъгълника на Паскал?',
    answers: ['n', 'n²', '2ⁿ', 'n!'],
    correctAnswer: '2ⁿ',
  },
  {
    question: 'Колко диагонала има шестоъгълник?',
    answers: ['6', '9', '12', '15'],
    correctAnswer: '9',
  },
];

// ---------- Страница ----------

export function Combinatorics() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Комбинаторика</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🃏 Разбъркай добре тесте от 52 карти. Почти сигурно е, че точно тази подредба не е съществувала никога досега в историята. Броят
            на всички възможни подредби е 52! = 52 · 51 · 50 · … · 1 ≈ 8 · 10⁶⁷. Дори всички хора на Земята да разбъркват по едно тесте в
            секунда от Големия взрив насам, ще са опитали нищожна част от тях. <strong>Комбинаториката</strong> е изкуството да броим, без да
            изброяваме – и да получаваме такива невъзможни за изброяване числа за секунди.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Правила за събиране и умножение</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> В менюто има 3 супи и 4 основни ястия. Колко са възможностите за обяд, ако взимаш <em>или</em> супа,{' '}
              <em>или</em> основно? А ако взимаш супа <em>и</em> основно? В първия случай 3 + 4 = 7, във втория 3 · 4 = 12. „Или“ събира,
              „и“ умножава.
            </p>
          </div>
          <Theorem
            title="Правило за събиране и правило за умножение"
            description="Събиране: ако обект може да се избере от една група по m начина или от друга (несвързана) група по n начина, изборът е по m + n начина. Умножение: ако първият избор е по m начина и след всеки от тях вторият е по n начина, двата заедно са по m · n начина (и аналогично за повече стъпки)."
          />
          <TreeLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Пермутации и вариации</h2>
          <Theorem
            type="definition"
            title="Пермутации"
            description="Пермутация на n различни елемента е тяхно подреждане. Броят им е n! = 1 · 2 · … · n („n факториел“); по определение 0! = 1. Ако сред елементите има еднакви – k₁ от един вид, k₂ от друг и т.н., различните подредби са n!/(k₁! · k₂! · …)."
          />
          <Theorem
            type="definition"
            title="Вариации"
            description="Вариация от n елемента k-ти клас е наредена k-торка от различни елементи (редът има значение). Броят им е V(n, k) = n · (n − 1) · … · (n − k + 1) = n!/(n − k)!. Ако елементите могат да се повтарят – nᵏ."
          />
          <Example
            description="Колко различни анаграми има думата МАТЕМАТИКА?"
            steps={['Букви: 10, от тях М – 2, А – 3, Т – 2, Е, И, К – по 1', 'Ако всички бяха различни: 10! = 3 628 800', 'Еднаквите букви не дават нови думи: 10!/(2! · 3! · 2!) = 3 628 800/24 = 151 200']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Комбинации и триъгълникът на Паскал</h2>
          <Theorem
            type="definition"
            title="Комбинации"
            description="Комбинация от n елемента k-ти клас е избор на k различни елемента, при който редът няма значение. Броят им е C(n, k) = n!/(k! · (n − k)!) = V(n, k)/k!. Свойства: C(n, k) = C(n, n − k); C(n, k) = C(n − 1, k − 1) + C(n − 1, k)."
          />
          <PascalLab />
          <Theorem
            title="Бином на Нютон"
            description="(a + b)ⁿ = C(n, 0)aⁿ + C(n, 1)aⁿ⁻¹b + … + C(n, k)aⁿ⁻ᵏbᵏ + … + C(n, n)bⁿ. Коефициентите са числата от n-тия ред на триъгълника на Паскал. Например (a + b)³ = a³ + 3a²b + 3ab² + b³."
          />
          <Example
            description="Какъв е коефициентът пред x² в (x + 2)⁴?"
            steps={['Общият член е C(4, k) · x⁴⁻ᵏ · 2ᵏ', 'x² ⇒ 4 − k = 2 ⇒ k = 2', 'C(4, 2) · 2² = 6 · 4 = 24']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Пътища в мрежа</h2>
          <p className={text}>
            Колко различни пътя има в мрежа от m стъпки надясно и n нагоре? Всеки път е низ от m стрелки „→“ и n стрелки „↑“ – значи е
            достатъчно да изберем кои m от всичките m + n стъпки са „→“.
          </p>
          <LatticePathLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Принцип на Дирихле</h2>
          <Theorem
            title="Принцип на чекмеджетата"
            description="Ако n + 1 предмета са разпределени в n чекмеджета, в поне едно чекмедже има поне два предмета. По-общо: ако kn + 1 предмета са в n чекмеджета, в някое има поне k + 1."
          />
          <Example
            description="Да докажем, че сред 13 души поне двама са родени в един и същ месец."
            steps={['„Чекмеджетата“ са 12-те месеца, „предметите“ – 13-те души', '13 > 12 ⇒ в някой месец има поне двама рождени дни']}
          />
          <p className={text}>
            Принципът изглежда очевиден, но е мощно оръжие в олимпиадните задачи – виж задача 7 по-долу. А връзката с вероятностите е в урока{' '}
            <Link to="/probability/basics" className={link}>
              Вероятности и статистика
            </Link>
            : вероятността е отношение на два броя, а комбинаториката ни казва как да ги преброим.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Преди да смяташ, си отговори: има ли значение редът? Разрешени ли са повторения?</p>
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
              ['Има ли значение редът?', 'отбор от 3 от 10 души: 10 · 9 · 8 = 720', 'C(10, 3) = 720 : 3! = 120'],
              ['Двойно броене', '10 души, ръкостискания: 10 · 9 = 90', '10 · 9 : 2 = 45'],
              ['„Или“ се умножава', '3 супи или 4 ястия ⇒ 12', '„или“ ⇒ 3 + 4 = 7; „и“ ⇒ 12'],
              ['Повторения', 'ПИН от 4 цифри: 10 · 9 · 8 · 7', 'с повторения: 10⁴ = 10 000'],
              ['Формулата за комбинации', 'C(n, k) = n!/k!', 'C(n, k) = n!/(k! (n − k)!)'],
              ['Нула факториел', '0! = 0', '0! = 1 (едно празно подреждане)'],
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
          <Quiz questions={combQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко трицифрени числа имат три различни цифри?">
                <p>Стотиците: 9 възможности (без 0).</p>
                <p>Десетиците: 9 (вече може 0, но не цифрата на стотиците).</p>
                <p>Единиците: 8. Общо 9 · 9 · 8 = 648.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="От 12 ученици избираме председател и секретар. По колко начина?">
                <p>Ролите са различни – редът има значение.</p>
                <p>V(12, 2) = 12 · 11 = 132</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко подмножества има множество с 5 елемента?">
                <p>За всеки елемент решаваме „вътре“ или „вън“ – по 2 възможности.</p>
                <p>2⁵ = 32 (включително празното и цялото множество).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Колко различни анаграми има думата МАТЕМАТИКА?">
                <p>10 букви: М – 2, А – 3, Т – 2, Е, И, К – по 1.</p>
                <p>10!/(2! · 3! · 2!) = 3 628 800/24</p>
                <p>= 151 200</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В клас има 6 момичета и 5 момчета. По колко начина можем да съставим група от 3 момичета и 2 момчета?">
                <p>Момичета: C(6, 3) = 20; момчета: C(5, 2) = 10.</p>
                <p>Правило за умножение: 20 · 10 = 200.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намерете коефициента пред a³b² в (a + b)⁵ и пред x² в (x + 2)⁴.">
                <p>(a + b)⁵: C(5, 2) = 10.</p>
                <p>(x + 2)⁴: C(4, 2) · 2² = 6 · 4 = 24.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="В квадрат със страна 2 са дадени 5 точки. Докажете, че има две от тях на разстояние не повече от √2.">
                <p>Разделяме квадрата на 4 квадратчета със страна 1 („чекмеджета“).</p>
                <p>5 точки в 4 квадратчета ⇒ две са в едно и също квадратче (принцип на Дирихле).</p>
                <p>Най-голямото разстояние в квадратче със страна 1 е диагоналът √2.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Колко са пътищата в мрежа 4 × 4 от (0; 0) до (4; 4) (само надясно и нагоре), които НЕ минават през точката (2; 2)?">
                <p>Всички пътища: C(8, 4) = 70.</p>
                <p>През (2; 2): C(4, 2) · C(4, 2) = 6 · 6 = 36.</p>
                <p>Търсените: 70 − 36 = 34.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Колко решения в цели неотрицателни числа има уравнението x + y + z = 10?">
                <p>Представяме решението като 10 „звездички“ и 2 „черти“, които ги делят на три групи: ★★★|★★★★★|★★ ↔ (3; 5; 2).</p>
                <p>Всяка подредба на 12 символа, от които 2 са черти, дава едно решение и обратно.</p>
                <p>C(12, 2) = 66.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ „Или“ – събираме; „и“ (последователни избори) – умножаваме</li>
              <li>✓ Пермутации: n!; с повтарящи се елементи: n!/(k₁! k₂! …)</li>
              <li>✓ Вариации (редът има значение): n!/(n − k)!; с повторение: nᵏ</li>
              <li>✓ Комбинации (редът няма значение): C(n, k) = n!/(k!(n − k)!)</li>
              <li>✓ Триъгълник на Паскал: C(n, k) = C(n − 1, k − 1) + C(n − 1, k); бином на Нютон</li>
              <li>✓ Пътища в мрежа: C(m + n, m); принцип на Дирихле</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              „Триъгълникът на Паскал“ е много по-стар от Паскал (XVII век). Той се среща при индийски, персийски и китайски математици –
              например в книга на Ян Хуей от 1261 г., затова в Китай го наричат „триъгълника на Ян Хуей“, а в Италия – „триъгълника на
              Тарталя“. Паскал обаче пръв систематично изследва свойствата му и го свързва с вероятностите.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
