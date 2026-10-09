import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { PickLab } from './PickLab';
import { PolygonAngleLab } from './PolygonAngleLab';
import { TilingLab } from './TilingLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
// Броеве страни, при които вътрешният и външният ъгъл са цели
const NICE = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];

type Drill = { text: string; answer: number; unit: string; steps: string[] };

const newDrill = (): Drill => {
  const n = NICE[randInt(0, NICE.length - 1)];
  const kind = randInt(0, 3);
  const sum = (n - 2) * 180;
  if (kind === 0)
    return { text: `Колко е сборът на вътрешните ъгли на ${n}-ъгълник?`, answer: sum, unit: '°', steps: [`(n − 2) · 180° = ${n - 2} · 180° = ${sum}°`] };
  if (kind === 1)
    return {
      text: `Колко градуса е всеки вътрешен ъгъл на правилен ${n}-ъгълник?`,
      answer: sum / n,
      unit: '°',
      steps: [`Сбор: ${sum}°`, `${sum}° : ${n} = ${sum / n}° (или 180° − 360°/${n} = ${180 - 360 / n}°)`],
    };
  if (kind === 2)
    return {
      text: `Вътрешният ъгъл на правилен многоъгълник е ${180 - 360 / n}°. Колко страни има той?`,
      answer: n,
      unit: '',
      steps: [`Външният ъгъл е 180° − ${180 - 360 / n}° = ${360 / n}°`, `Сборът на външните ъгли е 360° ⇒ n = 360 : ${360 / n} = ${n}`],
    };
  return {
    text: `Колко диагонала има ${n}-ъгълник?`,
    answer: (n * (n - 3)) / 2,
    unit: '',
    steps: [`n(n − 3)/2 = ${n} · ${n - 3} / 2 = ${(n * (n - 3)) / 2}`],
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
    const v = Number(input.trim().replace('°', '').replace(',', '.'));
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
          {result === 'correct' ? (streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : 'Браво! 🎉') : 'Не съвсем. Помисли за (n − 2) · 180° и за 360° на външните ъгли.'}
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
    title: '🛑 Знак STOP',
    problem: 'Знакът „STOP“ е правилен осмоъгълник. Колко е сборът на вътрешните му ъгли и колко градуса е всеки от тях?',
    solution: ['Сбор: $(8 - 2) \\cdot 180^\\circ = 1080^\\circ$', 'Всеки ъгъл: $1080^\\circ : 8 = 135^\\circ$'],
    answer: '1080° и 135°',
    check: [1080, 135],
    ask: ['сбор, °', 'ъгъл, °'],
  },
  {
    title: '⚽ Футболна топка',
    problem: 'Класическата футболна топка е съшита от 12 петоъгълника и 20 шестоъгълника. Колко шева (ръба) има тя?',
    solution: ['Всички страни на парчетата: $12 \\cdot 5 + 20 \\cdot 6 = 60 + 120 = 180$', 'Всеки шев свързва две страни $\\Rightarrow 180 : 2 = 90$'],
    answer: '90 шева',
    check: [90],
    ask: ['шевове'],
  },
  {
    title: '🏡 Беседка',
    problem: 'Подът на беседка е правилен шестоъгълник със страна 2 m. Колко квадратни метра е той?',
    solution: ['Шестоъгълникът се разрязва на 6 равностранни триъгълника със страна 2.', 'Лице на един: $\\frac{\\sqrt{3}}{4} \\cdot 2^2 = \\sqrt{3}$', 'Общо: $6\\sqrt{3} \\approx 10{,}39\\ \\mathrm{m}^2$'],
    answer: '$\\approx 10{,}39\\ \\mathrm{m}^2$',
    check: [10.39],
    ask: ['лице, m²'],
  },
  {
    title: '🗺️ Парцел по координати',
    problem: 'Върховете на парцел (в метри, по кадастралната карта) са (0; 0), (40; 0), (40; 30) и (10; 50). Колко е лицето му?',
    solution: [
      'Формула на Гаус: $S = \\tfrac{1}{2} |x_1y_2 - x_2y_1 + x_2y_3 - x_3y_2 + \\ldots |$',
      '$= \\tfrac{1}{2} |0 \\cdot 0 - 40 \\cdot 0 + 40 \\cdot 30 - 40 \\cdot 0 + 40 \\cdot 50 - 10 \\cdot 30 + 10 \\cdot 0 - 0 \\cdot 50|$',
      '$= \\tfrac{1}{2} |0 + 1200 + 1700 + 0| = 1450$',
    ],
    answer: '$1450\\ \\mathrm{m}^2$',
    check: [1450],
    ask: ['лице, m²'],
  },
  {
    title: '📐 Карирана скица',
    problem: 'Парцел е начертан върху карирана хартия с върхове във възлите; всяко квадратче е $10 \\times 10\\ \\mathrm{m}$. Вътре в него има 7 възела, а по контура – 10. Колко е лицето му?',
    solution: ['Пик: $S = I + \\frac{B}{2} - 1 = 7 + 5 - 1 = 11$ квадратчета', 'Едно квадратче е $100\\ \\mathrm{m}^2 \\Rightarrow 11 \\cdot 100 = 1100\\ \\mathrm{m}^2$'],
    answer: '$1100\\ \\mathrm{m}^2$',
    check: [1100],
    ask: ['лице, m²'],
  },
  {
    title: '🥧 Архимед и π',
    problem: 'Архимед приближава окръжност с диаметър 1 чрез вписани правилни многоъгълници. Обиколката на вписания правилен 12-ъгълник е $12 \\cdot \\sin 15^\\circ$. На колко е равна тя (до стотни)?',
    solution: ['Страната на 12-ъгълника е $\\sin 15^\\circ \\approx 0{,}2588$ (хорда към централен ъгъл 30° при радиус $\\frac{1}{2}$).', '$12 \\cdot 0{,}2588 \\approx 3{,}106$', 'При 96-ъгълник Архимед получава $3 \\frac{10}{71} < \\pi < 3 \\frac{1}{7}$.'],
    answer: '$\\approx 3{,}11$',
    check: [3.11],
    ask: ['обиколка'],
  },
];

// ---------- Тест ----------

const polygonsQuiz: Question[] = [
  { question: 'Колко е сборът на вътрешните ъгли на петоъгълник?', answers: ['360°', '540°', '720°', '900°'], correctAnswer: '540°' },
  { question: 'Колко градуса е вътрешният ъгъл на правилен шестоъгълник?', answers: ['60°', '108°', '120°', '135°'], correctAnswer: '120°' },
  { question: 'Колко диагонала има осмоъгълник?', answers: ['16', '20', '28', '40'], correctAnswer: '20' },
  {
    question: 'Колко е сборът на външните ъгли (по един при всеки връх) на изпъкнал $n$-ъгълник?',
    answers: ['$(n - 2) \\cdot 180^\\circ$', '$360^\\circ$', '$180^\\circ$', '$n \\cdot 180^\\circ$'],
    correctAnswer: '$360^\\circ$',
  },
  { question: 'Вътрешният ъгъл на правилен многоъгълник е 140°. Колко страни има той?', answers: ['7', '8', '9', '10'], correctAnswer: '9' },
  {
    question: 'Кои правилни многоъгълници (само от един вид) покриват равнината без празнини?',
    answers: ['триъгълници, квадрати и шестоъгълници', 'всички', 'само квадрати', 'квадрати, петоъгълници и шестоъгълници'],
    correctAnswer: 'триъгълници, квадрати и шестоъгълници',
  },
  { question: 'Многоъгълник с върхове във възли има 4 възела вътре и 6 по контура. Колко е лицето му?', answers: ['6', '7', '9', '10'], correctAnswer: '6' },
  { question: 'Колко е лицето на триъгълника с върхове (0; 0), (4; 0) и (0; 3)?', answers: ['6', '7', '12', '5'], correctAnswer: '6' },
  {
    question: 'Колко е лицето на правилен шестоъгълник със страна $a$?',
    answers: ['$\\frac{3\\sqrt{3}\\,a^2}{2}$', '$\\frac{\\sqrt{3}\\,a^2}{4}$', '$6a^2$', '$3a^2$'],
    correctAnswer: '$\\frac{3\\sqrt{3}\\,a^2}{2}$',
  },
];

// ---------- Страница ----------

export function Polygons() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Многоъгълници и лица</h1>

        <div className="bg-gradient-to-br from-amber-600 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🐝 Защо пчелите строят шестоъгълни килийки, а не кръгли или квадратни? Още Пап Александрийски (IV век) предполага, че
            шестоъгълниците разделят равнината на равни части с най-малко „стени“ – значи с най-малко восък. Тази „хипотеза за пчелната пита“
            е доказана строго едва през 1999 г. от Томас Хейлс. Ъглите, лицата и паркетите от многоъгълници крият изненадващо много
            математика.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Многоъгълник и диагонали</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Колко диагонала има стоъгълник? Да ги чертаем – безнадеждно. Да ги преброим – лесно: от всеки от 100-те
              върха тръгват 97 диагонала, но всеки е броен два пъти: <Tex>{'100 \\cdot 97 / 2 = 4850'}</Tex>.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Многоъгълник"
            description="Многоъгълник е затворена начупена линия без самопресичане заедно с частта от равнината, която огражда. Изпъкнал е, ако лежи от едната страна на правата през всяка своя страна. Правилен е, ако всичките му страни и всичките му ъгли са равни. Диагонал е отсечка, свързваща два несъседни върха; $n$-ъгълникът има $\frac{n(n - 3)}{2}$ диагонала."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Сбор на ъглите</h2>
          <Theorem
            title="Сбор на вътрешните и външните ъгли"
            description="Сборът на вътрешните ъгли на изпъкнал $n$-ъгълник е $(n - 2) \cdot 180^\circ$. Сборът на външните ъгли (по един при всеки връх) е винаги 360°. При правилен $n$-ъгълник всеки вътрешен ъгъл е $\frac{(n - 2) \cdot 180^\circ}{n}$, а всеки външен – $\frac{360^\circ}{n}$."
          />
          <PolygonAngleLab />
          <p className={text}>
            Ако обиколиш многоъгълник, при всеки връх завиваш с външния ъгъл, а накрая си се завъртял точно веднъж – на 360°. Това е най-краткото
            доказателство на втората формула.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Правилни многоъгълници и техните лица</h2>
          <Theorem
            title="Лице на правилен многоъгълник"
            description="Правилният $n$-ъгълник има вписана и описана окръжност с общ център. Отсечките от центъра до върховете го разрязват на $n$ равнобедрени триъгълника с височина $r$ (радиуса на вписаната окръжност, наричан апотема). Затова $S = \tfrac{1}{2} \cdot P \cdot r$, където $P$ е обиколката. За правилен шестоъгълник със страна $a$: $S = 6 \cdot \frac{\sqrt{3}\,a^2}{4} = \frac{3\sqrt{3}\,a^2}{2}$."
          />
          <Example
            description="Правилен шестоъгълник има страна 4 cm. Да намерим лицето и апотемата му."
            steps={['Разрязваме на 6 равностранни триъгълника със страна 4', 'Лице на един: $\\sqrt{3} \\cdot \\frac{16}{4} = 4\\sqrt{3}$', '$S = 6 \\cdot 4\\sqrt{3} = 24\\sqrt{3} \\approx 41{,}57\\ \\mathrm{cm}^2$', 'Апотемата е височината на триъгълника: $r = 4 \\cdot \\frac{\\sqrt{3}}{2} = 2\\sqrt{3} \\approx 3{,}46\\ \\mathrm{cm}$']}
          />
          <p className={text}>
            За лицата на триъгълника, успоредника и трапеца виж уроците{' '}
            <Link to="/geometry/triangle" className={link}>
              Триъгълник
            </Link>{' '}
            и{' '}
            <Link to="/geometry/quadrilateral" className={link}>
              Четириъгълник
            </Link>
            . Произволен многоъгълник можем да разрежем на такива фигури – или да използваме формулите по-долу.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Лице по координати: Гаус и Пик</h2>
          <Theorem
            title="Формула на Гаус (за връзките на обувките)"
            description="Ако върховете на многоъгълника, обходени поред, са $(x_1;\ y_1),\ (x_2;\ y_2),\ \ldots ,\ (x_n;\ y_n)$, то $S = \tfrac{1}{2} |x_1y_2 - x_2y_1 + x_2y_3 - x_3y_2 + \ldots + x_ny_1 - x_1y_n|$. Името идва от кръстосаното умножение, което прилича на връзки на обувки."
          />
          <Theorem
            title="Формула на Пик"
            description="Ако върховете на многоъгълник (без самопресичане) са във възлите на квадратна мрежа с клетка 1, то $S = I + \frac{B}{2} - 1$, където $I$ е броят на възлите вътре, а $B$ – броят на възлите по контура. Формулата е публикувана от австрийския математик Георг Пик през 1899 г."
          />
          <PickLab />
          <Example
            description="Да намерим лицето на четириъгълника с върхове (1; 1), (5; 2), (4; 6), (0; 4)."
            steps={['Кръстосаните произведения: $1 \\cdot 2 - 5 \\cdot 1 = -3$; $5 \\cdot 6 - 4 \\cdot 2 = 22$; $4 \\cdot 4 - 0 \\cdot 6 = 16$; $0 \\cdot 1 - 1 \\cdot 4 = -4$', 'Сбор: $-3 + 22 + 16 - 4 = 31$', '$S = \\frac{31}{2} = 15{,}5$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Паркети</h2>
          <p className={text}>
            Паркет (покритие на равнината) от еднакви правилни многоъгълници е възможен, само ако вътрешният ъгъл дели 360°. Ъглите 60°, 90° и
            120° го правят; петоъгълникът (108°) – не, а при <Tex>{'n \\ge 7'}</Tex> ъгълът е между 120° и 180° и не може да се „побере“ цяло число пъти. С
            различни правилни многоъгълници обаче има още красиви паркети.
          </p>
          <TilingLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Ъгли и диагонали на многоъгълници – без чертеж.</p>
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
              ['Сбор на ъглите', 'шестоъгълник: $6 \\cdot 180^\\circ = 1080^\\circ$', '$(6 - 2) \\cdot 180^\\circ = 720^\\circ$'],
              ['Диагоналите и страните', 'диагонали на $n$-ъгълник: $\\frac{n(n - 1)}{2}$', '$\\frac{n(n - 1)}{2}$ включва и страните $\\Rightarrow \\frac{n(n - 3)}{2}$'],
              ['Вътрешен и външен ъгъл', 'правилен петоъгълник: $\\frac{360^\\circ}{5} = 72^\\circ$', '72° е външният; вътрешният е 108°'],
              ['Пик: $B$ са само върховете', '$B = 4$ за квадрат със страна 3', 'по контура има 12 възела $\\Rightarrow B = 12$'],
              ['Гаус без модул', '$S = \\tfrac{1}{2}(\\ldots) = -15{,}5$', 'знакът зависи от посоката на обхождане $\\Rightarrow |-15{,}5| = 15{,}5$'],
              ['Лицето расте като обиколката', 'двойна страна $\\Rightarrow$ двойно лице', 'двойна страна $\\Rightarrow$ 4 пъти по-голямо лице'],
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
          <Quiz questions={polygonsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намерете сбора на вътрешните ъгли на 12-ъгълник и вътрешния ъгъл на правилен 12-ъгълник.">
                <p><Tex>{'(12 - 2) \\cdot 180^\\circ = 1800^\\circ'}</Tex></p>
                <p><Tex>{'1800^\\circ : 12 = 150^\\circ'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко страни има многоъгълник с 27 диагонала?">
                <p><Tex>{'\\frac{n(n - 3)}{2} = 27 \\Rightarrow n^2 - 3n - 54 = 0'}</Tex></p>
                <p><Tex>{'n = \\frac{3 + \\sqrt{9 + 216}}{2} = \\frac{3 + 15}{2} = 9'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете лицето на правилен шестоъгълник със страна 4 cm.">
                <p><Tex>{'S = \\frac{3\\sqrt{3}\\,a^2}{2} = \\frac{3\\sqrt{3} \\cdot 16}{2} = 24\\sqrt{3}'}</Tex></p>
                <p><Tex>{'\\approx 41{,}57\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете лицето на четириъгълника с върхове (1; 1), (5; 2), (4; 6), (0; 4).">
                <p>Формула на Гаус: <Tex>{'\\tfrac{1}{2} |(1\\cdot 2 - 5\\cdot 1) + (5\\cdot 6 - 4\\cdot 2) + (4\\cdot 4 - 0\\cdot 6) + (0\\cdot 1 - 1\\cdot 4)|'}</Tex></p>
                <p><Tex>{'= \\tfrac{1}{2} |-3 + 22 + 16 - 4| = \\tfrac{1}{2} \\cdot 31'}</Tex></p>
                <p><Tex>{'= 15{,}5'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="От квадрат със страна 10 cm изрязваме четирите ъгъла (равнобедрени правоъгълни триъгълници), така че да остане правилен осмоъгълник. Колко е страната му?">
                <p>Нека страната на осмоъгълника е <Tex>{'x'}</Tex>. Катетите на изрязаните триъгълници са <Tex>{'\\frac{x}{\\sqrt{2}}'}</Tex>.</p>
                <p>Страната на квадрата: <Tex>{'\\frac{x}{\\sqrt{2}} + x + \\frac{x}{\\sqrt{2}} = 10 \\Rightarrow x(1 + \\sqrt{2}) = 10'}</Tex></p>
                <p><Tex>{'x = \\frac{10}{1 + \\sqrt{2}} = 10(\\sqrt{2} - 1) \\approx 4{,}14\\ \\mathrm{cm}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Външният ъгъл на правилен многоъгълник е 24°. Колко страни и колко диагонала има той?">
                <p><Tex>{'n = 360^\\circ : 24^\\circ = 15'}</Tex></p>
                <p>Диагонали: <Tex>{'15 \\cdot 12 / 2 = 90'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че изпъкнал многоъгълник има най-много 3 остри вътрешни ъгъла.">
                <p>При остър вътрешен ъгъл съответният външен е по-голям от 90°.</p>
                <p>Ако острите ъгли бяха 4 или повече, сборът на външните ъгли би бил над <Tex>{'4 \\cdot 90^\\circ = 360^\\circ'}</Tex>.</p>
                <p>Но той е точно 360° – противоречие.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че няма равностранен триъгълник с върхове във възлите на квадратна мрежа.">
                <p>По формулата на Пик (или на Гаус) лицето на такъв триъгълник е рационално число.</p>
                <p>Страната <Tex>{'a'}</Tex> е разстояние между възли <Tex>{'\\Rightarrow a^2 = \\Delta x^2 + \\Delta y^2'}</Tex> е цяло число.</p>
                <p>Тогава <Tex>{'S = \\frac{\\sqrt{3}\\,a^2}{4}'}</Tex> е ирационално (защото <Tex>{'\\sqrt{3}'}</Tex> е ирационално) – противоречие.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Покажете, че около точка могат да се съберат правилен триъгълник и два правилни 12-ъгълника, и намерете друга такава тройка с два еднакви многоъгълника.">
                <p><Tex>{'60^\\circ + 150^\\circ + 150^\\circ = 360^\\circ'}</Tex> ✓</p>
                <p>Квадрат и два правилни осмоъгълника: <Tex>{'90^\\circ + 135^\\circ + 135^\\circ = 360^\\circ'}</Tex> ✓</p>
                <p>Внимание: петоъгълник и два 10-ъгълника изглеждат подобно, но <Tex>{'108^\\circ + 144^\\circ + 144^\\circ = 396^\\circ \\ne 360^\\circ'}</Tex> – винаги проверявайте сбора.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Диагонали: <Tex>{'\\frac{n(n - 3)}{2}'}</Tex></li>
              <li>✓ Сбор на вътрешните ъгли: <Tex>{'(n - 2) \\cdot 180^\\circ'}</Tex>; на външните – 360°</li>
              <li>✓ Правилен <Tex>{'n'}</Tex>-ъгълник: вътрешен ъгъл <Tex>{'180^\\circ - \\frac{360^\\circ}{n}'}</Tex>; <Tex>{'S = \\tfrac{1}{2} \\cdot P \\cdot r'}</Tex></li>
              <li>✓ Правилен шестоъгълник: <Tex>{'S = \\frac{3\\sqrt{3}\\,a^2}{2}'}</Tex></li>
              <li>✓ Гаус: <Tex>{'S = \\tfrac{1}{2} \\left|\\sum (x_iy_{i+1} - x_{i+1}y_i)\\right|'}</Tex>; Пик: <Tex>{'S = I + \\frac{B}{2} - 1'}</Tex></li>
              <li>✓ Паркети от един вид правилни многоъгълници: само 3, 4 и 6 страни</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Дълго се е смятало, че паркетите с „петорна“ симетрия са невъзможни. През 70-те години Роджър Пенроуз открива паркети от две
              фигури, които покриват равнината без никога да се повтарят периодично. През 2023 г. пък е открита „шапката“ – една-единствена
              плочка, която покрива равнината само непериодично.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
