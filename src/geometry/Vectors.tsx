import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Proof from '~/Proof';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { DecomposeLab } from './DecomposeLab';
import { DotProductLab } from './DotProductLab';
import { VectorAddLab } from './VectorAddLab';
import { MathText, Tex } from '~/MathText';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор: действия с координати ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randNonZero = (min: number, max: number) => {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
};
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
const vec = (x: number, y: number) => `(${num(x)};\\ ${num(y)})`;

type Drill = { text: string; x: number; y: number; steps: string[] };

const newDrill = (): Drill => {
  const [ax, ay, bx, by] = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)];
  const k = randNonZero(-3, 3);
  const m = randNonZero(-3, 3);
  const ka = (k === 1 ? '' : k === -1 ? '-' : num(k)) + '\\vec{a}';
  const mb = (Math.abs(m) === 1 ? '' : num(Math.abs(m))) + '\\vec{b}';
  return {
    text: `$\\vec{a} = ${vec(ax, ay)}$, $\\vec{b} = ${vec(bx, by)}$. Намери $${ka} ${m < 0 ? '-' : '+'} ${mb}$.`,
    x: k * ax + m * bx,
    y: k * ay + m * by,
    steps: [
      `$${num(k)} \\cdot \\vec{a} = ${vec(k * ax, k * ay)}$`,
      `$${num(m)} \\cdot \\vec{b} = ${vec(m * bx, m * by)}$`,
      `Събираме съответните координати: $(${num(k * ax)} + ${par(m * bx)};\\ ${num(k * ay)} + ${par(m * by)}) = ${vec(k * ax + m * bx, k * ay + m * by)}$`,
    ],
  };
};

const parse = (s: string) => {
  const v = Number(s.trim().replace('−', '-').replace(',', '.'));
  return s.trim() === '' || Number.isNaN(v) ? null : v;
};

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [inX, setInX] = useState('');
  const [inY, setInY] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const x = parse(inX);
    const y = parse(inY);
    if (x === null || y === null) return;
    if (x === task.x && y === task.y) {
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
    setInX('');
    setInY('');
    setResult(null);
    setShowSteps(false);
  };

  const input = (label: string, value: string, set: (s: string) => void) => (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={e => {
        set(e.target.value);
        if (result === 'wrong') setResult(null);
      }}
      onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
      disabled={result === 'correct'}
      className="w-16 px-2 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
    />
  );

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center text-lg sm:text-xl mb-4 text-gray-800 dark:text-gray-100">
        <MathText>{task.text}</MathText>
      </p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-xl">(</span>
        {input('първа координата', inX, setInX)}
        <span className="font-mono text-xl">;</span>
        {input('втора координата', inY, setInY)}
        <span className="font-mono text-xl">)</span>
        {result === 'correct' ? (
          <button onClick={next} className="ml-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следваща →
          </button>
        ) : (
          <button onClick={check} className="ml-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
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
            : 'Не съвсем. Пресметни всяка координата поотделно.'}
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
        <ol className="list-decimal ml-8 mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {task.steps.map(s => (
            <li key={s}>
              <MathText>{s}</MathText>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '✈️ Самолет и вятър',
    problem: 'Самолет лети спрямо въздуха на север със скорост $200\\ \\mathrm{km/h}$, а вятърът духа на изток с $50\\ \\mathrm{km/h}$. С каква скорост се движи самолетът спрямо земята?',
    solution: [
      'Скоростта спрямо земята е сборът на векторите: $\\vec{v} = (0;\\ 200) + (50;\\ 0) = (50;\\ 200)$.',
      '$|\\vec{v}| = \\sqrt{50^2 + 200^2} = \\sqrt{42\\,500}$',
      '$|\\vec{v}| \\approx 206{,}2\\ \\mathrm{km/h}$ (а курсът се отклонява на около 14° към изток)',
    ],
    answer: '$\\approx 206{,}2\\ \\mathrm{km/h}$',
    check: [206.2],
    ask: ['скорост, km/h'],
  },
  {
    title: '🚣 Лодка през река',
    problem: 'Лодка се движи перпендикулярно на брега с $4\\ \\mathrm{m/s}$ спрямо водата, а течението е $3\\ \\mathrm{m/s}$. Реката е широка $100\\ \\mathrm{m}$. За колко време лодката ще стигне другия бряг и на колко метра надолу по течението ще я отнесе?',
    solution: ['Двете скорости са перпендикулярни и действат независимо.', 'Време: $100 : 4 = 25\\ \\mathrm{s}$', 'Отнасяне: $3 \\cdot 25 = 75\\ \\mathrm{m}$ (а скоростта спрямо брега е $\\sqrt{4^2 + 3^2} = 5\\ \\mathrm{m/s}$)'],
    answer: '25 s; 75 m',
    check: [25, 75],
    ask: ['време, s', 'отнасяне, m'],
  },
  {
    title: '🪢 Две сили',
    problem: 'Две момчета дърпат шейна с въжета под прав ъгъл едно спрямо друго – с 30 N и 40 N. Каква е големината на равнодействащата сила?',
    solution: ['Равнодействащата е сборът на векторите на силите.', 'Те са перпендикулярни: $|\\vec{F}| = \\sqrt{30^2 + 40^2} = \\sqrt{2500}$', '$|\\vec{F}| = 50\\ \\mathrm{N}$'],
    answer: '50 N',
    check: [50],
    ask: ['сила, N'],
  },
  {
    title: '🛷 Работа',
    problem: 'Шейна се тегли 20 m по хоризонтален път с въже под ъгъл 60° спрямо пътя и сила 50 N. Каква работа извършва силата? (Работата е скаларното произведение на силата и преместването.)',
    solution: ['$A = \\vec{F} \\cdot \\vec{s} = |\\vec{F}| \\cdot |\\vec{s}| \\cdot \\cos \\varphi$', '$A = 50 \\cdot 20 \\cdot \\cos 60^\\circ = 1000 \\cdot 0{,}5$', '$A = 500\\ \\mathrm{J}$'],
    answer: '500 J',
    check: [500],
    ask: ['работа, J'],
  },
  {
    title: '🥾 Разходка',
    problem: 'Туристка върви 3 km на изток, после 4 km на север и накрая 1 km на запад. На какво разстояние (по права линия) е от началната точка?',
    solution: ['Преместванията като вектори: $(3;\\ 0) + (0;\\ 4) + (-1;\\ 0) = (2;\\ 4)$', 'Разстояние: $\\sqrt{2^2 + 4^2} = \\sqrt{20}$', '$\\sqrt{20} \\approx 4{,}47$'],
    answer: '$\\approx 4{,}47\\ \\mathrm{km}$',
    check: [4.47],
    ask: ['разстояние, km'],
  },
  {
    title: '⚓ Котва',
    problem: 'Две въжета държат котва със сили по 10 N, които сключват ъгъл 60°. Колко е големината на общата сила?',
    solution: ['$|\\vec{F}_1 + \\vec{F}_2|^2 = |\\vec{F}_1|^2 + |\\vec{F}_2|^2 + 2 \\cdot \\vec{F}_1 \\cdot \\vec{F}_2 = 100 + 100 + 2 \\cdot 10 \\cdot 10 \\cdot \\cos 60^\\circ$', '$= 200 + 100 = 300$', '$|\\vec{F}| = \\sqrt{300} \\approx 17{,}32\\ \\mathrm{N}$'],
    answer: '$\\approx 17{,}32\\ \\mathrm{N}$',
    check: [17.32],
    ask: ['сила, N'],
  },
];

// ---------- Тест ----------

const vectorsQuiz: Question[] = [
  {
    question: 'На колко е равно $\\overrightarrow{AB} + \\overrightarrow{BC}$?',
    answers: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{BA} + \\overrightarrow{CB}$', 'нулевия вектор'],
    correctAnswer: '$\\overrightarrow{AC}$',
  },
  {
    question: '$\\vec{a} = (2;\\ 3)$, $\\vec{b} = (-1;\\ 4)$. Колко е $\\vec{a} + \\vec{b}$?',
    answers: ['$(1;\\ 7)$', '$(3;\\ -1)$', '$(1;\\ -1)$', '$(-2;\\ 12)$'],
    correctAnswer: '$(1;\\ 7)$',
  },
  {
    question: 'Колко е дължината на вектора $\\vec{a} = (3;\\ -4)$?',
    answers: ['$1$', '$5$', '$7$', '$25$'],
    correctAnswer: '$5$',
  },
  {
    question: '$\\vec{a} = (1;\\ 2)$, $\\vec{b} = (3;\\ -1)$. Колко е $2\\vec{a} - \\vec{b}$?',
    answers: ['$(-1;\\ 5)$', '$(5;\\ 3)$', '$(-1;\\ 3)$', '$(2;\\ 5)$'],
    correctAnswer: '$(-1;\\ 5)$',
  },
  {
    question: 'При кое $k$ векторите $(2;\\ k)$ и $(3;\\ 6)$ са колинеарни?',
    answers: ['$k = 3$', '$k = 4$', '$k = 6$', '$k = 9$'],
    correctAnswer: '$k = 4$',
  },
  {
    question: '$\\vec{a} = (1;\\ 2)$, $\\vec{b} = (3;\\ -1)$. Колко е скаларното произведение $\\vec{a} \\cdot \\vec{b}$?',
    answers: ['$1$', '$5$', '$(3;\\ -2)$', '$-1$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Ненулевите вектори $\\vec{a}$ и $\\vec{b}$ са перпендикулярни точно когато:',
    answers: ['$\\vec{a} \\cdot \\vec{b} = 0$', '$\\vec{a} \\cdot \\vec{b} = 1$', '$|\\vec{a}| = |\\vec{b}|$', '$\\vec{a} + \\vec{b} = \\vec{0}$'],
    correctAnswer: '$\\vec{a} \\cdot \\vec{b} = 0$',
  },
  {
    question: '$M$ е средата на отсечката $AB$, а $O$ е произволна точка. Кое е вярно?',
    answers: ['$\\overrightarrow{OM} = \\frac{\\overrightarrow{OA} + \\overrightarrow{OB}}{2}$', '$\\overrightarrow{OM} = \\overrightarrow{OA} + \\overrightarrow{OB}$', '$\\overrightarrow{OM} = \\frac{\\overrightarrow{OB} - \\overrightarrow{OA}}{2}$', '$\\overrightarrow{OM} = \\overrightarrow{OA} - \\overrightarrow{OB}$'],
    correctAnswer: '$\\overrightarrow{OM} = \\frac{\\overrightarrow{OA} + \\overrightarrow{OB}}{2}$',
  },
  {
    question: '$G$ е медицентърът на триъгълник $ABC$. На колко е равно $\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC}$?',
    answers: ['нулевия вектор', '$\\overrightarrow{AB}$', '$3 \\cdot \\overrightarrow{GA}$', 'зависи от триъгълника'],
    correctAnswer: 'нулевия вектор',
  },
];

// ---------- Страница ----------

export function Vectors() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Вектори</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ✈️ Пилот насочва самолета точно на север и лети с <Tex>{'200\\ \\mathrm{km/h}'}</Tex> спрямо въздуха. Но вятърът духа на изток с <Tex>{'50\\ \\mathrm{km/h}'}</Tex>. Къде ще бъде след
            един час? Не на 200 km на север и не на 250 km „някъде“. Двете скорости се събират не като числа, а като стрелки – и самолетът
            лети по диагонала, малко по-бързо и отклонен на изток. Величините, които имат и големина, и посока – скорост, сила, преместване –
            се описват с <strong>вектори</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е вектор?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> „Отидох 5 km и се върнах 5 km. Колко съм изминал?“ – 10 km. „А на какво разстояние съм от
              началото?“ – 0 km. Изминатият път е число, а преместването е вектор: двете премествания са равни по дължина, но противоположни по
              посока, и се унищожават.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Вектор"
            description="Вектор е насочена отсечка – отсечка, за която е казано коя точка е начало и коя край. Записваме $\overrightarrow{AB}$ ($A$ е начало, $B$ е край) или с една малка буква, $\vec{a}$. Дължината на вектора се бележи $|\overrightarrow{AB}|$. Два вектора са равни, ако имат еднаква дължина и еднаква посока – тогава единият се получава от другия чрез успоредно пренасяне. Нулевият вектор има начало и край в една точка."
          />
          <p className={text}>
            Векторите <Tex>{'\\overrightarrow{AB}'}</Tex> и <Tex>{'\\overrightarrow{BA}'}</Tex> имат еднаква дължина, но противоположни посоки: <Tex>{'\\overrightarrow{BA} = -\\overrightarrow{AB}'}</Tex>. Ненулеви вектори, които лежат на успоредни прави (или на
            една права), се наричат <strong>колинеарни</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Събиране и изваждане</h2>
          <Theorem
            title="Правило на триъгълника и на успоредника"
            description="Правило на триъгълника: $\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}$ – краят на първия вектор е начало на втория. Правило на успоредника: ако $\vec{a} = \overrightarrow{AB}$ и $\vec{b} = \overrightarrow{AD}$ са страни на успоредника $ABCD$, то $\vec{a} + \vec{b} = \overrightarrow{AC}$ (диагоналът), а $\vec{b} - \vec{a} = \overrightarrow{BD}$. Събирането е разместително и съдружително; $\vec{a} - \vec{b} = \vec{a} + (-\vec{b})$."
          />
          <Proof
            title="Доказателство"
            steps={[
              'Правилото на триъгълника е самото определение на сбора: първо се преместваме от $A$ до $B$, после от $B$ до $C$ – общото преместване е от $A$ до $C$.',
              'Успоредник: в $ABCD$ срещуположните страни $AD$ и $BC$ са равни и успоредни, и векторите $\\overrightarrow{AD}$ и $\\overrightarrow{BC}$ са еднопосочни – значи са равни. Тогава $\\vec{a} + \\vec{b} = \\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$.',
              'Разлика: от правилото на триъгълника $\\overrightarrow{AB} + \\overrightarrow{BD} = \\overrightarrow{AD}$, затова $\\overrightarrow{BD} = \\overrightarrow{AD} - \\overrightarrow{AB} = \\vec{b} - \\vec{a}$.',
              'Разместителност: $\\vec{a} + \\vec{b} = \\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$, а $\\vec{b} + \\vec{a} = \\overrightarrow{AD} + \\overrightarrow{DC} = \\overrightarrow{AC}$ (защото $\\overrightarrow{AD} = \\overrightarrow{BC} = \\vec{b}$ и $\\overrightarrow{DC} = \\overrightarrow{AB} = \\vec{a}$). Съдружителност: $(\\overrightarrow{AB} + \\overrightarrow{BC}) + \\overrightarrow{CD} = \\overrightarrow{AC} + \\overrightarrow{CD} = \\overrightarrow{AD}$ и $\\overrightarrow{AB} + (\\overrightarrow{BC} + \\overrightarrow{CD}) = \\overrightarrow{AB} + \\overrightarrow{BD} = \\overrightarrow{AD}$.',
            ]}
          />
          <VectorAddLab />
          <Example
            description="$ABCD$ е успоредник, $\overrightarrow{AB} = \vec{a}$, $\overrightarrow{AD} = \vec{b}$. Да изразим $\overrightarrow{AC}$, $\overrightarrow{BD}$ и $\overrightarrow{CA}$ чрез $\vec{a}$ и $\vec{b}$."
            steps={['$\\overrightarrow{AC} = \\overrightarrow{AB} + \\overrightarrow{BC} = \\vec{a} + \\vec{b}$ ($\\overrightarrow{BC} = \\overrightarrow{AD}$, защото са равни и еднопосочни)', '$\\overrightarrow{BD} = \\overrightarrow{BA} + \\overrightarrow{AD} = -\\vec{a} + \\vec{b} = \\vec{b} - \\vec{a}$', '$\\overrightarrow{CA} = -\\overrightarrow{AC} = -\\vec{a} - \\vec{b}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Умножение с число</h2>
          <Theorem
            type="definition"
            title="Произведение на вектор с число"
            description="$k \cdot \vec{a}$ е вектор, колинеарен на $\vec{a}$, с дължина $|k| \cdot |\vec{a}|$; при $k > 0$ е еднопосочен с $\vec{a}$, при $k < 0$ – противопосочен. Обратно: ако $\vec{a} \ne \vec{0}$ и $\vec{b}$ е колинеарен на $\vec{a}$, то $\vec{b} = k \cdot \vec{a}$ за някое число $k$."
          />
          <p className={text}>
            Това дава удобен запис на познати факти. Ако <Tex>{'M'}</Tex> е средата на <Tex>{'AB'}</Tex>, то за всяка точка <Tex>{'O'}</Tex>: <Tex>{'\\overrightarrow{OM} = \\frac{\\overrightarrow{OA} + \\overrightarrow{OB}}{2}'}</Tex>.{' '}
            <Term id="midsegment">Средната отсечка</Term> <Tex>{'MN'}</Tex> в триъгълник <Tex>{'ABC'}</Tex> удовлетворява <Tex>{'\\overrightarrow{MN} = \\tfrac{1}{2} \\overrightarrow{BC}'}</Tex> – едновременно казва, че е успоредна и
            два пъти по-къса. Нещо повече: всеки вектор в равнината се изразява по единствен начин чрез два неколинеарни вектора.
          </p>
          <Theorem
            title="Разлагане на вектор"
            description="Ако $\vec{a}$ и $\vec{b}$ са неколинеарни, всеки вектор $\vec{c}$ от равнината може да се запише по единствен начин като $\vec{c} = x \cdot \vec{a} + y \cdot \vec{b}$. Числата $x$ и $y$ се намират от система от две линейни уравнения."
          />
          <Proof
            title="Доказателство на разлагането"
            steps={[
              'Съществуване: нанасяме $\\vec{a}$, $\\vec{b}$ и $\\vec{c}$ с общо начало $O$, като $\\vec{c} = \\overrightarrow{OC}$. През $C$ прекарваме прави, успоредни на $\\vec{a}$ и на $\\vec{b}$; те пресичат правите на $\\vec{b}$ и на $\\vec{a}$ в точките $B_1$ и $A_1$. Получаваме успоредник $OA_1CB_1$ и $\\vec{c} = \\overrightarrow{OA_1} + \\overrightarrow{OB_1}$.',
              '$\\overrightarrow{OA_1}$ лежи на правата на $\\vec{a}$, значи е колинеарен с $\\vec{a}$ (или е нулев) и $\\overrightarrow{OA_1} = x \\cdot \\vec{a}$ за някое число $x$. По същия начин $\\overrightarrow{OB_1} = y \\cdot \\vec{b}$. Следователно $\\vec{c} = x \\cdot \\vec{a} + y \\cdot \\vec{b}$. (Ако $\\vec{c}$ е колинеарен с $\\vec{a}$, просто $y = 0$.)',
              'Единственост: ако $x \\cdot \\vec{a} + y \\cdot \\vec{b} = x_1 \\cdot \\vec{a} + y_1 \\cdot \\vec{b}$, то $(x - x_1) \\cdot \\vec{a} = (y_1 - y) \\cdot \\vec{b}$. Ако $x \\ne x_1$, бихме получили $\\vec{a} = \\frac{y_1 - y}{x - x_1} \\cdot \\vec{b}$, т.е. $\\vec{a}$ и $\\vec{b}$ колинеарни – противоречие. Значи $x = x_1$, а оттам и $y = y_1$.',
            ]}
          />
          <DecomposeLab />
          <p className={text}>
            Обърни внимание: намирането на <Tex>{'x'}</Tex> и <Tex>{'y'}</Tex> е точно{' '}
            <Link to="/algebra/systems" className={link}>
              система уравнения
            </Link>
            , а условието <Tex>{'\\vec{a}'}</Tex> и <Tex>{'\\vec{b}'}</Tex> да не са колинеарни е условието <Term id="determinant">детерминантата</Term> ѝ да не е 0.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Координати на вектор</h2>
          <Theorem
            title="Действия в координати"
            description="Ако $A(x_1;\ y_1)$ и $B(x_2;\ y_2)$, то $\overrightarrow{AB} = (x_2 - x_1;\ y_2 - y_1)$ – „край минус начало“. За $\vec{a} = (a_1;\ a_2)$ и $\vec{b} = (b_1;\ b_2)$: $\vec{a} + \vec{b} = (a_1 + b_1;\ a_2 + b_2)$, $k \cdot \vec{a} = (k \cdot a_1;\ k \cdot a_2)$, $|\vec{a}| = \sqrt{a_1^2 + a_2^2}$. Средата на $AB$ е $M(\frac{x_1 + x_2}{2};\ \frac{y_1 + y_2}{2})$."
          />
          <Proof
            title="Доказателство"
            steps={[
              'Нека $\\vec{i}$ и $\\vec{j}$ са единичните вектори по осите. Координатите $(a_1;\\ a_2)$ на вектора $\\vec{a}$ означават точно разлагането $\\vec{a} = a_1 \\cdot \\vec{i} + a_2 \\cdot \\vec{j}$ – то е единствено по теоремата за разлагане.',
              'Сбор и умножение с число: $\\vec{a} + \\vec{b} = (a_1 + b_1) \\cdot \\vec{i} + (a_2 + b_2) \\cdot \\vec{j}$ – просто групираме събираемите пред $\\vec{i}$ и пред $\\vec{j}$. Аналогично $k \\cdot \\vec{a} = (ka_1) \\cdot \\vec{i} + (ka_2) \\cdot \\vec{j}$.',
              '„Край минус начало“: $\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA}$, а координатите на $\\overrightarrow{OA}$ и $\\overrightarrow{OB}$ са координатите на точките $A$ и $B$.',
              'Дължина: $\\vec{a}$ е хипотенуза на правоъгълен триъгълник с катети $|a_1|$ и $|a_2|$, затова по Питагоровата теорема $|\\vec{a}| = \\sqrt{a_1^2 + a_2^2}$.',
              'Среда: $\\overrightarrow{OM} = \\overrightarrow{OA} + \\overrightarrow{AM} = \\overrightarrow{OA} + \\frac{1}{2}\\overrightarrow{AB} = \\overrightarrow{OA} + \\frac{1}{2}(\\overrightarrow{OB} - \\overrightarrow{OA}) = \\frac{\\overrightarrow{OA} + \\overrightarrow{OB}}{2}$; в координати това е $M\\left(\\frac{x_1 + x_2}{2};\\ \\frac{y_1 + y_2}{2}\\right)$.',
            ]}
          />
          <Example
            description="$A(1;\ 2)$ и $B(4;\ 6)$. Да намерим $\overrightarrow{AB}$, дължината му и средата $M$ на $AB$."
            steps={['$\\overrightarrow{AB} = (4 - 1;\\ 6 - 2) = (3;\\ 4)$', '$|\\overrightarrow{AB}| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$', '$M(\\frac{1 + 4}{2};\\ \\frac{2 + 6}{2}) = M(2{,}5;\\ 4)$']}
          />
          <Example
            description="При кое $k$ векторите $\vec{a} = (2;\ k)$ и $\vec{b} = (3;\ 6)$ са колинеарни?"
            steps={['Колинеарни ⇔ координатите са пропорционални: $\\frac{2}{3} = \\frac{k}{6}$', '$k = 4$ (тогава $\\vec{b} = 1{,}5 \\cdot \\vec{a}$)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Скаларно произведение</h2>
          <Theorem
            type="definition"
            title="Скаларно произведение"
            description="Скаларното произведение на векторите $\vec{a}$ и $\vec{b}$ е числото $\vec{a} \cdot \vec{b} = |\vec{a}| \cdot |\vec{b}| \cdot \cos \varphi$, където $\varphi$ е ъгълът между тях. В координати: $\vec{a} \cdot \vec{b} = a_1b_1 + a_2b_2$. Следствия: $\vec{a} \cdot \vec{a} = |\vec{a}|^2$; $\vec{a} \perp \vec{b} \iff \vec{a} \cdot \vec{b} = 0$; $\cos \varphi = \frac{\vec{a} \cdot \vec{b}}{|\vec{a}| \cdot |\vec{b}|}$."
          />
          <Proof
            title="Доказателство на формулата в координати"
            steps={[
              'Нанасяме $\\vec{a}$ и $\\vec{b}$ от обща точка $O$: $\\vec{a} = \\overrightarrow{OA}$, $\\vec{b} = \\overrightarrow{OB}$. Тогава $\\vec{a} - \\vec{b} = \\overrightarrow{BA}$ и в триъгълника $OAB$ ъгълът при $O$ е $\\varphi$. По косинусовата теорема $$|\\vec{a} - \\vec{b}|^2 = |\\vec{a}|^2 + |\\vec{b}|^2 - 2|\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos \\varphi$$',
              'Същото в координати: $$|\\vec{a} - \\vec{b}|^2 = (a_1 - b_1)^2 + (a_2 - b_2)^2$$ $$= (a_1^2 + a_2^2) + (b_1^2 + b_2^2) - 2(a_1b_1 + a_2b_2)$$ $$= |\\vec{a}|^2 + |\\vec{b}|^2 - 2(a_1b_1 + a_2b_2)$$',
              'Сравняваме двата израза и получаваме $|\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos \\varphi = a_1b_1 + a_2b_2$. (Ако $\\vec{a}$ и $\\vec{b}$ са колинеарни, триъгълник няма, но равенството се проверява направо.)',
              'Следствия: $\\vec{a} \\cdot \\vec{a} = |\\vec{a}|^2 \\cos 0^\\circ = |\\vec{a}|^2$. За ненулеви вектори $\\vec{a} \\cdot \\vec{b} = 0 \\iff \\cos \\varphi = 0 \\iff \\varphi = 90^\\circ$.',
              'Абзацът по-долу върви в обратна посока: ако приемем формулата в координати за известна, от нея следва косинусовата теорема. Двата факта са равносилни.',
            ]}
          />
          <DotProductLab />
          <Example
            description="Да намерим ъгъла между $\vec{a} = (1;\ 2)$ и $\vec{b} = (3;\ 1)$."
            steps={['$\\vec{a} \\cdot \\vec{b} = 1 \\cdot 3 + 2 \\cdot 1 = 5$', '$|\\vec{a}| = \\sqrt{5},\\ |\\vec{b}| = \\sqrt{10}$', '$\\cos \\varphi = \\frac{5}{\\sqrt{5} \\cdot \\sqrt{10}} = \\frac{5}{\\sqrt{50}} = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$', '$\\varphi = 45^\\circ$']}
          />
          <p className={text}>
            Двете формули за скаларното произведение свързват координатите с{' '}
            <Link to="/geometry/trigonometry" className={link}>
              тригонометрията
            </Link>
            . Например от <Tex>{'|\\vec{a} - \\vec{b}|^2 = |\\vec{a}|^2 + |\\vec{b}|^2 - 2 \\vec{a} \\cdot \\vec{b}'}</Tex> веднага следва <Term id="law-of-cosines">косинусовата теорема</Term>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни координатите на линейната комбинация.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Задачи от живота</h2>
          <p className={text}>Във физиката почти всичко е вектор: скорост, сила, преместване, <Term id="acceleration">ускорение</Term>. Те се събират по правилото на успоредника.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Начало минус край', '$A(1;\\ 2),\\ B(4;\\ 6) \\Rightarrow \\overrightarrow{AB} = (-3;\\ -4)$', '$\\overrightarrow{AB} = B - A = (3;\\ 4)$'],
              ['Дължината на сбора', '$|\\vec{a} + \\vec{b}| = |\\vec{a}| + |\\vec{b}|$', 'само при еднопосочни вектори; иначе $|\\vec{a} + \\vec{b}| < |\\vec{a}| + |\\vec{b}|$'],
              ['Скаларното произведение е вектор', '$(1;\\ 2) \\cdot (3;\\ -1) = (3;\\ -2)$', '$(1;\\ 2) \\cdot (3;\\ -1) = 3 - 2 = 1$ (число!)'],
              ['Неверен ред на буквите', '$\\overrightarrow{AB} + \\overrightarrow{CB} = \\overrightarrow{AC}$', '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$; $\\overrightarrow{CB} = -\\overrightarrow{BC}$'],
              ['Колинеарност по една координата', '$(2;\\ 4)$ и $(2;\\ 5)$ – колинеарни, защото $2 = 2$', '$\\frac{2}{2} \\ne \\frac{4}{5} \\Rightarrow$ не са колинеарни'],
              ['Квадрат на сбор', '$|\\vec{a} + \\vec{b}|^2 = |\\vec{a}|^2 + |\\vec{b}|^2$', '$|\\vec{a} + \\vec{b}|^2 = |\\vec{a}|^2 + 2 \\vec{a} \\cdot \\vec{b} + |\\vec{b}|^2$'],
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
          <Quiz questions={vectorsQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Дадени са $A(1;\ 2)$ и $B(4;\ 6)$. Намерете координатите на $\overrightarrow{AB}$, дължината му и средата на $AB$.">
                <p><Tex>{'\\overrightarrow{AB} = (4 - 1;\\ 6 - 2) = (3;\\ 4)'}</Tex></p>
                <p><Tex>{'|\\overrightarrow{AB}| = \\sqrt{9 + 16} = 5'}</Tex></p>
                <p>Средата е M(2,5; 4).</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="$\vec{a} = (2;\ -1)$, $\vec{b} = (-3;\ 4)$. Намерете $3\vec{a} + 2\vec{b}$ и дължината му." check={[0, 5, 5]} ask={['$x$-координата на $3\\vec{a} + 2\\vec{b}$', '$y$-координата на $3\\vec{a} + 2\\vec{b}$', 'дължина']}>
                <p><Tex>{'3\\vec{a} = (6;\\ -3),\\ 2\\vec{b} = (-6;\\ 8)'}</Tex></p>
                <p><Tex>{'3\\vec{a} + 2\\vec{b} = (0;\\ 5)'}</Tex></p>
                <p><Tex>{'|3\\vec{a} + 2\\vec{b}| = 5'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="$ABCD$ е успоредник, $\overrightarrow{AB} = \vec{a}$ и $\overrightarrow{AD} = \vec{b}$. Изразете чрез $\vec{a}$ и $\vec{b}$ векторите $\overrightarrow{AC}$, $\overrightarrow{BD}$ и $\overrightarrow{DB}$.">
                <p><Tex>{'\\overrightarrow{AC} = \\vec{a} + \\vec{b}'}</Tex> (правило на успоредника)</p>
                <p><Tex>{'\\overrightarrow{BD} = \\overrightarrow{AD} - \\overrightarrow{AB} = \\vec{b} - \\vec{a}'}</Tex></p>
                <p><Tex>{'\\overrightarrow{DB} = -\\overrightarrow{BD} = \\vec{a} - \\vec{b}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="$A(1;\ 1)$, $B(5;\ 2)$ и $C(2;\ 5)$ са три върха на успоредника $ABCD$. Намерете $D$." check={[-2, 4]} ask={['$x_D$', '$y_D$']}>
                <p>В успоредник <Tex>{'\\overrightarrow{AD} = \\overrightarrow{BC}'}</Tex>.</p>
                <p><Tex>{'\\overrightarrow{BC} = (2 - 5;\\ 5 - 2) = (-3;\\ 3)'}</Tex></p>
                <p><Tex>{'D = A + \\overrightarrow{BC} = (1 - 3;\\ 1 + 3) = (-2;\\ 4)'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете ъгъла между векторите $\vec{a} = (1;\ 2)$ и $\vec{b} = (3;\ 1)$." check={[45]} ask={['ъгъл, °']}>
                <p><Tex>{'\\vec{a} \\cdot \\vec{b} = 3 + 2 = 5'}</Tex>; <Tex>{'|\\vec{a}| = \\sqrt{5}'}</Tex>; <Tex>{'|\\vec{b}| = \\sqrt{10}'}</Tex></p>
                <p><Tex>{'\\cos \\varphi = \\frac{5}{\\sqrt{50}} = \\frac{\\sqrt{2}}{2}'}</Tex></p>
                <p><Tex>{'\\varphi = 45^\\circ'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="При кое $k$ векторите $\vec{a} = (k;\ 2)$ и $\vec{b} = (3;\ -6)$ са перпендикулярни?" check={[4]} ask={['$k$']}>
                <p><Tex>{'\\vec{a} \\perp \\vec{b} \\iff \\vec{a} \\cdot \\vec{b} = 0'}</Tex></p>
                <p><Tex>{'3k - 12 = 0'}</Tex></p>
                <p><Tex>{'k = 4'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Нека $G$ е точката, за която $\overrightarrow{GA} + \overrightarrow{GB} + \overrightarrow{GC} = \vec{0}$. Докажи, че $G$ лежи на медианата от $A$ и я дели в отношение $2 : 1$ (така $G$ е медицентърът).">
                <p>Нека <Tex>{'M'}</Tex> е средата на <Tex>{'BC'}</Tex>. Тогава <Tex>{'\\overrightarrow{GB} + \\overrightarrow{GC} = 2 \\cdot \\overrightarrow{GM}'}</Tex>.</p>
                <p>Условието става <Tex>{'\\overrightarrow{GA} + 2 \\cdot \\overrightarrow{GM} = \\vec{0}'}</Tex>, т.е. <Tex>{'\\overrightarrow{GA} = -2 \\cdot \\overrightarrow{GM}'}</Tex>.</p>
                <p>Значи <Tex>{'A'}</Tex>, <Tex>{'G'}</Tex> и <Tex>{'M'}</Tex> са на една права (векторите са колинеарни), <Tex>{'G'}</Tex> е между <Tex>{'A'}</Tex> и <Tex>{'M'}</Tex> и <Tex>{'\\overrightarrow{AG} = 2 \\cdot \\overrightarrow{GM}'}</Tex>.</p>
                <p>Същото важи за другите две медиани ⇒ трите минават през <Tex>{'G'}</Tex> – това доказва, че медианите се пресичат в една точка.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В триъгълник $ABC$ точката $M$ е върху $BC$ и $BM : MC = 1 : 2$. Изразете $\overrightarrow{AM}$ чрез $\overrightarrow{AB}$ и $\overrightarrow{AC}$.">
                <p><Tex>{'\\overrightarrow{BM} = \\tfrac{1}{3} \\overrightarrow{BC} = \\tfrac{1}{3} (\\overrightarrow{AC} - \\overrightarrow{AB})'}</Tex></p>
                <p><Tex>{'\\overrightarrow{AM} = \\overrightarrow{AB} + \\overrightarrow{BM} = \\overrightarrow{AB} + \\tfrac{1}{3} \\overrightarrow{AC} - \\tfrac{1}{3} \\overrightarrow{AB}'}</Tex></p>
                <p><Tex>{'\\overrightarrow{AM} = \\tfrac{2}{3} \\overrightarrow{AB} + \\tfrac{1}{3} \\overrightarrow{AC}'}</Tex> (коефициентите са „наопаки“ на отношението и сборът им е 1)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажи, че в успоредник сборът от квадратите на диагоналите е равен на сбора от квадратите на четирите страни.">
                <p>Нека страните са <Tex>{'\\vec{a}'}</Tex> и <Tex>{'\\vec{b}'}</Tex>; диагоналите са <Tex>{'\\vec{a} + \\vec{b}'}</Tex> и <Tex>{'\\vec{a} - \\vec{b}'}</Tex>.</p>
                <p><Tex>{'|\\vec{a} + \\vec{b}|^2 = |\\vec{a}|^2 + 2 \\vec{a} \\cdot \\vec{b} + |\\vec{b}|^2'}</Tex>; <Tex>{'|\\vec{a} - \\vec{b}|^2 = |\\vec{a}|^2 - 2 \\vec{a} \\cdot \\vec{b} + |\\vec{b}|^2'}</Tex></p>
                <p>Събираме: <Tex>{'|\\vec{a} + \\vec{b}|^2 + |\\vec{a} - \\vec{b}|^2 = 2|\\vec{a}|^2 + 2|\\vec{b}|^2'}</Tex> – точно сборът от квадратите на четирите страни.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Векторът има големина и посока; равни вектори – еднаква дължина и посока</li>
              <li>✓ <Tex>{'\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}'}</Tex>; при успоредник сборът е диагоналът</li>
              <li>✓ <Tex>{'k \\cdot \\vec{a}'}</Tex> е колинеарен на <Tex>{'\\vec{a}'}</Tex>; всеки вектор се разлага по два неколинеарни: <Tex>{'\\vec{c} = x\\vec{a} + y\\vec{b}'}</Tex></li>
              <li>✓ <Tex>{'\\overrightarrow{AB} = (x_2 - x_1;\\ y_2 - y_1)'}</Tex>; <Tex>{'|\\vec{a}| = \\sqrt{a_1^2 + a_2^2}'}</Tex>; средата на <Tex>{'AB'}</Tex>: <Tex>{'\\overrightarrow{OM} = \\frac{\\overrightarrow{OA} + \\overrightarrow{OB}}{2}'}</Tex></li>
              <li>✓ <Tex>{'\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}| \\cos \\varphi = a_1b_1 + a_2b_2'}</Tex>; <Tex>{'\\vec{a} \\perp \\vec{b} \\iff \\vec{a} \\cdot \\vec{b} = 0'}</Tex></li>
              <li>✓ Разлагането се доказва с успоредник; координатите са коефициентите пред <Tex>{'\\vec{i}'}</Tex> и <Tex>{'\\vec{j}'}</Tex>; скаларното произведение в координати – от косинусовата теорема</li>
              <li>✓ <Term id="centroid">Медицентър</Term>: <Tex>{'\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC} = \\vec{0}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „вектор“ идва от латинското <em>vehere</em> – „нося, возя“; vector е „носител“. В математиката я въвежда ирландецът
              Уилям Роуън Хамилтън. На 16 октомври 1843 г., докато се разхожда покрай канал в Дъблин, той открива как да умножава
              „тримерни числа“ (кватерниони) и издълбава формулата <Tex>{'i^2 = j^2 = k^2 = ijk = -1'}</Tex> в камъка на мост. Надписът отдавна не се вижда, но
              на моста днес има паметна плоча, а математици всяка година повтарят разходката му.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
