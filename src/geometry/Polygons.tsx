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
    solution: ['Сбор: (8 − 2) · 180° = 1080°', 'Всеки ъгъл: 1080° : 8 = 135°'],
    answer: '1080° и 135°',
    check: [1080, 135],
    ask: ['сбор, °', 'ъгъл, °'],
  },
  {
    title: '⚽ Футболна топка',
    problem: 'Класическата футболна топка е съшита от 12 петоъгълника и 20 шестоъгълника. Колко шева (ръба) има тя?',
    solution: ['Всички страни на парчетата: 12 · 5 + 20 · 6 = 60 + 120 = 180', 'Всеки шев свързва две страни ⇒ 180 : 2 = 90'],
    answer: '90 шева',
    check: [90],
    ask: ['шевове'],
  },
  {
    title: '🏡 Беседка',
    problem: 'Подът на беседка е правилен шестоъгълник със страна 2 m. Колко квадратни метра е той?',
    solution: ['Шестоъгълникът се разрязва на 6 равностранни триъгълника със страна 2.', 'Лице на един: √3/4 · 2² = √3', 'Общо: 6√3 ≈ 10,39 m²'],
    answer: '≈ 10,39 m²',
    check: [10.39],
    ask: ['лице, m²'],
  },
  {
    title: '🗺️ Парцел по координати',
    problem: 'Върховете на парцел (в метри, по кадастралната карта) са (0; 0), (40; 0), (40; 30) и (10; 50). Колко е лицето му?',
    solution: [
      'Формула на Гаус: S = ½ |x₁y₂ − x₂y₁ + x₂y₃ − x₃y₂ + …|',
      '= ½ |0 · 0 − 40 · 0 + 40 · 30 − 40 · 0 + 40 · 50 − 10 · 30 + 10 · 0 − 0 · 50|',
      '= ½ |0 + 1200 + 1700 + 0| = 1450',
    ],
    answer: '1450 m²',
    check: [1450],
    ask: ['лице, m²'],
  },
  {
    title: '📐 Карирана скица',
    problem: 'Парцел е начертан върху карирана хартия с върхове във възлите; всяко квадратче е 10 × 10 m. Вътре в него има 7 възела, а по контура – 10. Колко е лицето му?',
    solution: ['Пик: S = I + B/2 − 1 = 7 + 5 − 1 = 11 квадратчета', 'Едно квадратче е 100 m² ⇒ 11 · 100 = 1100 m²'],
    answer: '1100 m²',
    check: [1100],
    ask: ['лице, m²'],
  },
  {
    title: '🥧 Архимед и π',
    problem: 'Архимед приближава окръжност с диаметър 1 чрез вписани правилни многоъгълници. Обиколката на вписания правилен 12-ъгълник е 12 · sin 15°. На колко е равна тя (до стотни)?',
    solution: ['Страната на 12-ъгълника е sin 15° ≈ 0,2588 (хорда към централен ъгъл 30° при радиус 1/2).', '12 · 0,2588 ≈ 3,106', 'При 96-ъгълник Архимед получава 3 10/71 < π < 3 1/7.'],
    answer: '≈ 3,11',
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
    question: 'Колко е сборът на външните ъгли (по един при всеки връх) на изпъкнал n-ъгълник?',
    answers: ['(n − 2) · 180°', '360°', '180°', 'n · 180°'],
    correctAnswer: '360°',
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
    question: 'Колко е лицето на правилен шестоъгълник със страна a?',
    answers: ['3√3 a²/2', '√3 a²/4', '6a²', '3a²'],
    correctAnswer: '3√3 a²/2',
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
              върха тръгват 97 диагонала, но всеки е броен два пъти: 100 · 97 / 2 = 4850.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Многоъгълник"
            description="Многоъгълник е затворена начупена линия без самопресичане заедно с частта от равнината, която огражда. Изпъкнал е, ако лежи от едната страна на правата през всяка своя страна. Правилен е, ако всичките му страни и всичките му ъгли са равни. Диагонал е отсечка, свързваща два несъседни върха; n-ъгълникът има n(n − 3)/2 диагонала."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Сбор на ъглите</h2>
          <Theorem
            title="Сбор на вътрешните и външните ъгли"
            description="Сборът на вътрешните ъгли на изпъкнал n-ъгълник е (n − 2) · 180°. Сборът на външните ъгли (по един при всеки връх) е винаги 360°. При правилен n-ъгълник всеки вътрешен ъгъл е (n − 2) · 180°/n, а всеки външен – 360°/n."
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
            description="Правилният n-ъгълник има вписана и описана окръжност с общ център. Отсечките от центъра до върховете го разрязват на n равнобедрени триъгълника с височина r (радиуса на вписаната окръжност, наричан апотема). Затова S = ½ · P · r, където P е обиколката. За правилен шестоъгълник със страна a: S = 6 · √3a²/4 = 3√3a²/2."
          />
          <Example
            description="Правилен шестоъгълник има страна 4 cm. Да намерим лицето и апотемата му."
            steps={['Разрязваме на 6 равностранни триъгълника със страна 4', 'Лице на един: √3 · 16/4 = 4√3', 'S = 6 · 4√3 = 24√3 ≈ 41,57 cm²', 'Апотемата е височината на триъгълника: r = 4 · √3/2 = 2√3 ≈ 3,46 cm']}
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
            description="Ако върховете на многоъгълника, обходени поред, са (x₁; y₁), (x₂; y₂), …, (xₙ; yₙ), то S = ½ |x₁y₂ − x₂y₁ + x₂y₃ − x₃y₂ + … + xₙy₁ − x₁yₙ|. Името идва от кръстосаното умножение, което прилича на връзки на обувки."
          />
          <Theorem
            title="Формула на Пик"
            description="Ако върховете на многоъгълник (без самопресичане) са във възлите на квадратна мрежа с клетка 1, то S = I + B/2 − 1, където I е броят на възлите вътре, а B – броят на възлите по контура. Формулата е публикувана от австрийския математик Георг Пик през 1899 г."
          />
          <PickLab />
          <Example
            description="Да намерим лицето на четириъгълника с върхове (1; 1), (5; 2), (4; 6), (0; 4)."
            steps={['Кръстосаните произведения: 1 · 2 − 5 · 1 = −3; 5 · 6 − 4 · 2 = 22; 4 · 4 − 0 · 6 = 16; 0 · 1 − 1 · 4 = −4', 'Сбор: −3 + 22 + 16 − 4 = 31', 'S = 31/2 = 15,5']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Паркети</h2>
          <p className={text}>
            Паркет (покритие на равнината) от еднакви правилни многоъгълници е възможен, само ако вътрешният ъгъл дели 360°. Ъглите 60°, 90° и
            120° го правят; петоъгълникът (108°) – не, а при n ≥ 7 ъгълът е между 120° и 180° и не може да се „побере“ цяло число пъти. С
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
              ['Сбор на ъглите', 'шестоъгълник: 6 · 180° = 1080°', '(6 − 2) · 180° = 720°'],
              ['Диагоналите и страните', 'диагонали на n-ъгълник: n(n − 1)/2', 'n(n − 1)/2 включва и страните ⇒ n(n − 3)/2'],
              ['Вътрешен и външен ъгъл', 'правилен петоъгълник: 360°/5 = 72°', '72° е външният; вътрешният е 108°'],
              ['Пик: B са само върховете', 'B = 4 за квадрат със страна 3', 'по контура има 12 възела ⇒ B = 12'],
              ['Гаус без модул', 'S = ½(…) = −15,5', 'знакът зависи от посоката на обхождане ⇒ |−15,5| = 15,5'],
              ['Лицето расте като обиколката', 'двойна страна ⇒ двойно лице', 'двойна страна ⇒ 4 пъти по-голямо лице'],
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
          <Quiz questions={polygonsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намерете сбора на вътрешните ъгли на 12-ъгълник и вътрешния ъгъл на правилен 12-ъгълник.">
                <p>(12 − 2) · 180° = 1800°</p>
                <p>1800° : 12 = 150°</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко страни има многоъгълник с 27 диагонала?">
                <p>n(n − 3)/2 = 27 ⇒ n² − 3n − 54 = 0</p>
                <p>n = (3 + √(9 + 216))/2 = (3 + 15)/2 = 9</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Намерете лицето на правилен шестоъгълник със страна 4 cm.">
                <p>S = 3√3 · a²/2 = 3√3 · 16/2 = 24√3</p>
                <p>≈ 41,57 cm²</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете лицето на четириъгълника с върхове (1; 1), (5; 2), (4; 6), (0; 4).">
                <p>Формула на Гаус: ½ |(1·2 − 5·1) + (5·6 − 4·2) + (4·4 − 0·6) + (0·1 − 1·4)|</p>
                <p>= ½ |−3 + 22 + 16 − 4| = ½ · 31</p>
                <p>= 15,5</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="От квадрат със страна 10 cm изрязваме четирите ъгъла (равнобедрени правоъгълни триъгълници), така че да остане правилен осмоъгълник. Колко е страната му?">
                <p>Нека страната на осмоъгълника е x. Катетите на изрязаните триъгълници са x/√2.</p>
                <p>Страната на квадрата: x/√2 + x + x/√2 = 10 ⇒ x(1 + √2) = 10</p>
                <p>x = 10/(1 + √2) = 10(√2 − 1) ≈ 4,14 cm</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Външният ъгъл на правилен многоъгълник е 24°. Колко страни и колко диагонала има той?">
                <p>n = 360° : 24° = 15</p>
                <p>Диагонали: 15 · 12 / 2 = 90</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажете, че изпъкнал многоъгълник има най-много 3 остри вътрешни ъгъла.">
                <p>При остър вътрешен ъгъл съответният външен е по-голям от 90°.</p>
                <p>Ако острите ъгли бяха 4 или повече, сборът на външните ъгли би бил над 4 · 90° = 360°.</p>
                <p>Но той е точно 360° – противоречие.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че няма равностранен триъгълник с върхове във възлите на квадратна мрежа.">
                <p>По формулата на Пик (или на Гаус) лицето на такъв триъгълник е рационално число.</p>
                <p>Страната a е разстояние между възли ⇒ a² = Δx² + Δy² е цяло число.</p>
                <p>Тогава S = √3 · a²/4 е ирационално (защото √3 е ирационално) – противоречие.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Покажете, че около точка могат да се съберат правилен триъгълник и два правилни 12-ъгълника, и намерете друга такава тройка с два еднакви многоъгълника.">
                <p>60° + 150° + 150° = 360° ✓</p>
                <p>Квадрат и два правилни осмоъгълника: 90° + 135° + 135° = 360° ✓</p>
                <p>Внимание: петоъгълник и два 10-ъгълника изглеждат подобно, но 108° + 144° + 144° = 396° ≠ 360° – винаги проверявайте сбора.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Диагонали: n(n − 3)/2</li>
              <li>✓ Сбор на вътрешните ъгли: (n − 2) · 180°; на външните – 360°</li>
              <li>✓ Правилен n-ъгълник: вътрешен ъгъл 180° − 360°/n; S = ½ · P · r</li>
              <li>✓ Правилен шестоъгълник: S = 3√3a²/2</li>
              <li>✓ Гаус: S = ½ |Σ (xᵢyᵢ₊₁ − xᵢ₊₁yᵢ)|; Пик: S = I + B/2 − 1</li>
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
