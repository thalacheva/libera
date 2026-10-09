import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { num } from '~/functions/functionMath';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { DecomposeLab } from './DecomposeLab';
import { DotProductLab } from './DotProductLab';
import { VectorAddLab } from './VectorAddLab';
import { MathText, Tex } from '~/MathText';

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
const vec = (x: number, y: number) => `(${num(x)}; ${num(y)})`;

type Drill = { text: string; x: number; y: number; steps: string[] };

const newDrill = (): Drill => {
  const [ax, ay, bx, by] = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)];
  const k = randNonZero(-3, 3);
  const m = randNonZero(-3, 3);
  const ka = (k === 1 ? '' : k === -1 ? '−' : num(k)) + 'a';
  const mb = (Math.abs(m) === 1 ? '' : num(Math.abs(m))) + 'b';
  return {
    text: `a = ${vec(ax, ay)}, b = ${vec(bx, by)}. Намери ${ka} ${m < 0 ? '−' : '+'} ${mb}.`,
    x: k * ax + m * bx,
    y: k * ay + m * by,
    steps: [
      `${num(k)} · a = ${vec(k * ax, k * ay)}`,
      `${num(m)} · b = ${vec(m * bx, m * by)}`,
      `Събираме съответните координати: (${num(k * ax)} + ${par(m * bx)}; ${num(k * ay)} + ${par(m * by)}) = ${vec(k * ax + m * bx, k * ay + m * by)}`,
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

      <p className="text-center font-mono text-lg sm:text-xl mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

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
    title: '✈️ Самолет и вятър',
    problem: 'Самолет лети спрямо въздуха на север със скорост $200\\ \\mathrm{km/h}$, а вятърът духа на изток с $50\\ \\mathrm{km/h}$. С каква скорост се движи самолетът спрямо земята?',
    solution: [
      'Скоростта спрямо земята е сборът на векторите: $v = (0;\\ 200) + (50;\\ 0) = (50;\\ 200)$.',
      '$|v| = \\sqrt{50^2 + 200^2} = \\sqrt{42\\,500}$',
      '$|v| \\approx 206{,}2\\ \\mathrm{km/h}$ (а курсът се отклонява на около 14° към изток)',
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
    solution: ['Равнодействащата е сборът на векторите на силите.', 'Те са перпендикулярни: $|F| = \\sqrt{30^2 + 40^2} = \\sqrt{2500}$', '$|F| = 50\\ \\mathrm{N}$'],
    answer: '50 N',
    check: [50],
    ask: ['сила, N'],
  },
  {
    title: '🛷 Работа',
    problem: 'Шейна се тегли 20 m по хоризонтален път с въже под ъгъл 60° спрямо пътя и сила 50 N. Каква работа извършва силата? (Работата е скаларното произведение на силата и преместването.)',
    solution: ['$A = F \\cdot s = |F| \\cdot |s| \\cdot \\cos \\varphi$', '$A = 50 \\cdot 20 \\cdot \\cos 60^\\circ = 1000 \\cdot 0{,}5$', '$A = 500\\ \\mathrm{J}$'],
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
    solution: ['$|F_1 + F_2|^2 = |F_1|^2 + |F_2|^2 + 2 \\cdot F_1 \\cdot F_2 = 100 + 100 + 2 \\cdot 10 \\cdot 10 \\cdot \\cos 60^\\circ$', '$= 200 + 100 = 300$', '$|F| = \\sqrt{300} \\approx 17{,}32\\ \\mathrm{N}$'],
    answer: '$\\approx 17{,}32\\ \\mathrm{N}$',
    check: [17.32],
    ask: ['сила, N'],
  },
];

// ---------- Тест ----------

const vectorsQuiz: Question[] = [
  {
    question: 'На колко е равно $AB + BC$?',
    answers: ['$AC$', '$CA$', '$BA + CB$', 'нулевия вектор'],
    correctAnswer: '$AC$',
  },
  {
    question: '$a = (2;\\ 3)$, $b = (-1;\\ 4)$. Колко е $a + b$?',
    answers: ['$(1;\\ 7)$', '$(3;\\ -1)$', '$(1;\\ -1)$', '$(-2;\\ 12)$'],
    correctAnswer: '$(1;\\ 7)$',
  },
  {
    question: 'Колко е дължината на вектора $a = (3;\\ -4)$?',
    answers: ['$1$', '$5$', '$7$', '$25$'],
    correctAnswer: '$5$',
  },
  {
    question: '$a = (1;\\ 2)$, $b = (3;\\ -1)$. Колко е $2a - b$?',
    answers: ['$(-1;\\ 5)$', '$(5;\\ 3)$', '$(-1;\\ 3)$', '$(2;\\ 5)$'],
    correctAnswer: '$(-1;\\ 5)$',
  },
  {
    question: 'При кое $k$ векторите $(2;\\ k)$ и $(3;\\ 6)$ са колинеарни?',
    answers: ['$k = 3$', '$k = 4$', '$k = 6$', '$k = 9$'],
    correctAnswer: '$k = 4$',
  },
  {
    question: '$a = (1;\\ 2)$, $b = (3;\\ -1)$. Колко е скаларното произведение $a \\cdot b$?',
    answers: ['$1$', '$5$', '$(3;\\ -2)$', '$-1$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Ненулевите вектори $a$ и $b$ са перпендикулярни точно когато:',
    answers: ['$a \\cdot b = 0$', '$a \\cdot b = 1$', '$|a| = |b|$', '$a + b = 0$'],
    correctAnswer: '$a \\cdot b = 0$',
  },
  {
    question: '$M$ е средата на отсечката $AB$, а $O$ е произволна точка. Кое е вярно?',
    answers: ['$OM = \\frac{OA + OB}{2}$', '$OM = OA + OB$', '$OM = \\frac{OB - OA}{2}$', '$OM = OA - OB$'],
    correctAnswer: '$OM = \\frac{OA + OB}{2}$',
  },
  {
    question: '$G$ е медицентърът на триъгълник $ABC$. На колко е равно $GA + GB + GC$?',
    answers: ['нулевия вектор', '$AB$', '$3 \\cdot GA$', 'зависи от триъгълника'],
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
            description="Вектор е насочена отсечка – отсечка, за която е казано коя точка е начало и коя край. Записваме $AB$ ($A$ е начало, $B$ е край) или с една малка буква, $a$. Дължината на вектора се бележи $|AB|$. Два вектора са равни, ако имат еднаква дължина и еднаква посока – тогава единият се получава от другия чрез успоредно пренасяне. Нулевият вектор има начало и край в една точка."
          />
          <p className={text}>
            Векторите <Tex>{'AB'}</Tex> и <Tex>{'BA'}</Tex> имат еднаква дължина, но противоположни посоки: <Tex>{'BA = -AB'}</Tex>. Ненулеви вектори, които лежат на успоредни прави (или на
            една права), се наричат <strong>колинеарни</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Събиране и изваждане</h2>
          <Theorem
            title="Правило на триъгълника и на успоредника"
            description="Правило на триъгълника: $AB + BC = AC$ – краят на първия вектор е начало на втория. Правило на успоредника: ако $a = AB$ и $b = AD$ са страни на успоредника $ABCD$, то $a + b = AC$ (диагоналът), а $b - a = BD$. Събирането е разместително и съдружително; $a - b = a + (-b)$."
          />
          <VectorAddLab />
          <Example
            description="$ABCD$ е успоредник, $AB = a$, $AD = b$. Да изразим $AC$, $BD$ и $CA$ чрез $a$ и $b$."
            steps={['$AC = AB + BC = a + b$ ($BC = AD$, защото са равни и еднопосочни)', '$BD = BA + AD = -a + b = b - a$', '$CA = -AC = -a - b$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Умножение с число</h2>
          <Theorem
            type="definition"
            title="Произведение на вектор с число"
            description="$k \cdot a$ е вектор, колинеарен на $a$, с дължина $|k| \cdot |a|$; при $k > 0$ е еднопосочен с $a$, при $k < 0$ – противопосочен. Обратно: ако $a \ne 0$ и $b$ е колинеарен на $a$, то $b = k \cdot a$ за някое число $k$."
          />
          <p className={text}>
            Това дава удобен запис на познати факти. Ако <Tex>{'M'}</Tex> е средата на <Tex>{'AB'}</Tex>, то за всяка точка <Tex>{'O'}</Tex>: <Tex>{'OM = \\frac{OA + OB}{2}'}</Tex>.
            Средната отсечка <Tex>{'MN'}</Tex> в триъгълник <Tex>{'ABC'}</Tex> удовлетворява <Tex>{'MN = \\tfrac{1}{2} BC'}</Tex> – едновременно казва, че е успоредна и
            два пъти по-къса. Нещо повече: всеки вектор в равнината се изразява по единствен начин чрез два неколинеарни вектора.
          </p>
          <Theorem
            title="Разлагане на вектор"
            description="Ако $a$ и $b$ са неколинеарни, всеки вектор $c$ от равнината може да се запише по единствен начин като $c = x \cdot a + y \cdot b$. Числата $x$ и $y$ се намират от система от две линейни уравнения."
          />
          <DecomposeLab />
          <p className={text}>
            Обърни внимание: намирането на <Tex>{'x'}</Tex> и <Tex>{'y'}</Tex> е точно{' '}
            <Link to="/algebra/systems" className={link}>
              система уравнения
            </Link>
            , а условието <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> да не са колинеарни е условието детерминантата ѝ да не е 0.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Координати на вектор</h2>
          <Theorem
            title="Действия в координати"
            description="Ако $A(x_1;\ y_1)$ и $B(x_2;\ y_2)$, то $AB = (x_2 - x_1;\ y_2 - y_1)$ – „край минус начало“. За $a = (a_1;\ a_2)$ и $b = (b_1;\ b_2)$: $a + b = (a_1 + b_1;\ a_2 + b_2)$, $k \cdot a = (k \cdot a_1;\ k \cdot a_2)$, $|a| = \sqrt{a_1^2 + a_2^2}$. Средата на $AB$ е $M(\frac{x_1 + x_2}{2};\ \frac{y_1 + y_2}{2})$."
          />
          <Example
            description="$A(1;\ 2)$ и $B(4;\ 6)$. Да намерим $AB$, дължината му и средата $M$ на $AB$."
            steps={['$AB = (4 - 1;\\ 6 - 2) = (3;\\ 4)$', '$|AB| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$', '$M(\\frac{1 + 4}{2};\\ \\frac{2 + 6}{2}) = M(2{,}5;\\ 4)$']}
          />
          <Example
            description="При кое $k$ векторите $a = (2;\ k)$ и $b = (3;\ 6)$ са колинеарни?"
            steps={['Колинеарни ⇔ координатите са пропорционални: $\\frac{2}{3} = \\frac{k}{6}$', '$k = 4$ (тогава $b = 1{,}5 \\cdot a$)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Скаларно произведение</h2>
          <Theorem
            type="definition"
            title="Скаларно произведение"
            description="Скаларното произведение на векторите $a$ и $b$ е числото $a \cdot b = |a| \cdot |b| \cdot \cos \varphi$, където $\varphi$ е ъгълът между тях. В координати: $a \cdot b = a_1b_1 + a_2b_2$. Следствия: $a \cdot a = |a|^2$; $a \perp b \iff a \cdot b = 0$; $\cos \varphi = \frac{a \cdot b}{|a| \cdot |b|}$."
          />
          <DotProductLab />
          <Example
            description="Да намерим ъгъла между $a = (1;\ 2)$ и $b = (3;\ 1)$."
            steps={['$a \\cdot b = 1 \\cdot 3 + 2 \\cdot 1 = 5$', '$|a| = \\sqrt{5},\\ |b| = \\sqrt{10}$', '$\\cos \\varphi = \\frac{5}{\\sqrt{5} \\cdot \\sqrt{10}} = \\frac{5}{\\sqrt{50}} = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$', '$\\varphi = 45^\\circ$']}
          />
          <p className={text}>
            Двете формули за скаларното произведение свързват координатите с{' '}
            <Link to="/geometry/trigonometry" className={link}>
              тригонометрията
            </Link>
            . Например от <Tex>{'|a - b|^2 = |a|^2 + |b|^2 - 2 a \\cdot b'}</Tex> веднага следва косинусовата теорема.
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
          <p className={text}>Във физиката почти всичко е вектор: скорост, сила, преместване, ускорение. Те се събират по правилото на успоредника.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Начало минус край', '$A(1;\\ 2),\\ B(4;\\ 6) \\Rightarrow AB = (-3;\\ -4)$', '$AB = B - A = (3;\\ 4)$'],
              ['Дължината на сбора', '$|a + b| = |a| + |b|$', 'само при еднопосочни вектори; иначе $|a + b| < |a| + |b|$'],
              ['Скаларното произведение е вектор', '$(1;\\ 2) \\cdot (3;\\ -1) = (3;\\ -2)$', '$(1;\\ 2) \\cdot (3;\\ -1) = 3 - 2 = 1$ (число!)'],
              ['Неверен ред на буквите', '$AB + CB = AC$', '$AB + BC = AC$; $CB = -BC$'],
              ['Колинеарност по една координата', '$(2;\\ 4)$ и $(2;\\ 5)$ – колинеарни, защото $2 = 2$', '$\\frac{2}{2} \\ne \\frac{4}{5} \\Rightarrow$ не са колинеарни'],
              ['Квадрат на сбор', '$|a + b|^2 = |a|^2 + |b|^2$', '$|a + b|^2 = |a|^2 + 2 a \\cdot b + |b|^2$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Дадени са $A(1;\ 2)$ и $B(4;\ 6)$. Намерете координатите на $AB$, дължината му и средата на $AB$.">
                <p><Tex>{'AB = (4 - 1;\\ 6 - 2) = (3;\\ 4)'}</Tex></p>
                <p><Tex>{'|AB| = \\sqrt{9 + 16} = 5'}</Tex></p>
                <p>Средата е M(2,5; 4).</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="$a = (2;\ -1)$, $b = (-3;\ 4)$. Намерете $3a + 2b$ и дължината му.">
                <p><Tex>{'3a = (6;\\ -3),\\ 2b = (-6;\\ 8)'}</Tex></p>
                <p><Tex>{'3a + 2b = (0;\\ 5)'}</Tex></p>
                <p><Tex>{'|3a + 2b| = 5'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="$ABCD$ е успоредник, $AB = a$ и $AD = b$. Изразете чрез $a$ и $b$ векторите $AC$, $BD$ и $DB$.">
                <p><Tex>{'AC = a + b'}</Tex> (правило на успоредника)</p>
                <p><Tex>{'BD = AD - AB = b - a'}</Tex></p>
                <p><Tex>{'DB = -BD = a - b'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="$A(1;\ 1)$, $B(5;\ 2)$ и $C(2;\ 5)$ са три върха на успоредника $ABCD$. Намерете $D$.">
                <p>В успоредник <Tex>{'AD = BC'}</Tex>.</p>
                <p><Tex>{'BC = (2 - 5;\\ 5 - 2) = (-3;\\ 3)'}</Tex></p>
                <p><Tex>{'D = A + BC = (1 - 3;\\ 1 + 3) = (-2;\\ 4)'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете ъгъла между векторите $a = (1;\ 2)$ и $b = (3;\ 1)$.">
                <p><Tex>{'a \\cdot b = 3 + 2 = 5'}</Tex>; <Tex>{'|a| = \\sqrt{5}'}</Tex>; <Tex>{'|b| = \\sqrt{10}'}</Tex></p>
                <p><Tex>{'\\cos \\varphi = \\frac{5}{\\sqrt{50}} = \\frac{\\sqrt{2}}{2}'}</Tex></p>
                <p><Tex>{'\\varphi = 45^\\circ'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="При кое $k$ векторите $a = (k;\ 2)$ и $b = (3;\ -6)$ са перпендикулярни?">
                <p><Tex>{'a \\perp b \\iff a \\cdot b = 0'}</Tex></p>
                <p><Tex>{'3k - 12 = 0'}</Tex></p>
                <p><Tex>{'k = 4'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Нека $G$ е точката, за която $GA + GB + GC = 0$. Докажи, че $G$ лежи на медианата от $A$ и я дели в отношение $2 : 1$ (така $G$ е медицентърът).">
                <p>Нека <Tex>{'M'}</Tex> е средата на <Tex>{'BC'}</Tex>. Тогава <Tex>{'GB + GC = 2 \\cdot GM'}</Tex>.</p>
                <p>Условието става <Tex>{'GA + 2 \\cdot GM = 0'}</Tex>, т.е. <Tex>{'GA = -2 \\cdot GM'}</Tex>.</p>
                <p>Значи <Tex>{'A'}</Tex>, <Tex>{'G'}</Tex> и <Tex>{'M'}</Tex> са на една права (векторите са колинеарни), <Tex>{'G'}</Tex> е между <Tex>{'A'}</Tex> и <Tex>{'M'}</Tex> и <Tex>{'AG = 2 \\cdot GM'}</Tex>.</p>
                <p>Същото важи за другите две медиани ⇒ трите минават през <Tex>{'G'}</Tex> – това доказва, че медианите се пресичат в една точка.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В триъгълник $ABC$ точката $M$ е върху $BC$ и $BM : MC = 1 : 2$. Изразете $AM$ чрез $AB$ и $AC$.">
                <p><Tex>{'BM = \\tfrac{1}{3} BC = \\tfrac{1}{3} (AC - AB)'}</Tex></p>
                <p><Tex>{'AM = AB + BM = AB + \\tfrac{1}{3} AC - \\tfrac{1}{3} AB'}</Tex></p>
                <p><Tex>{'AM = \\tfrac{2}{3} AB + \\tfrac{1}{3} AC'}</Tex> (коефициентите са „наопаки“ на отношението и сборът им е 1)</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажи, че в успоредник сборът от квадратите на диагоналите е равен на сбора от квадратите на четирите страни.">
                <p>Нека страните са <Tex>{'a'}</Tex> и <Tex>{'b'}</Tex>; диагоналите са <Tex>{'a + b'}</Tex> и <Tex>{'a - b'}</Tex>.</p>
                <p><Tex>{'|a + b|^2 = |a|^2 + 2 a \\cdot b + |b|^2'}</Tex>; <Tex>{'|a - b|^2 = |a|^2 - 2 a \\cdot b + |b|^2'}</Tex></p>
                <p>Събираме: <Tex>{'|a + b|^2 + |a - b|^2 = 2|a|^2 + 2|b|^2'}</Tex> – точно сборът от квадратите на четирите страни.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Векторът има големина и посока; равни вектори – еднаква дължина и посока</li>
              <li>✓ <Tex>{'AB + BC = AC'}</Tex>; при успоредник сборът е диагоналът</li>
              <li>✓ <Tex>{'k \\cdot a'}</Tex> е колинеарен на <Tex>{'a'}</Tex>; всеки вектор се разлага по два неколинеарни: <Tex>{'c = xa + yb'}</Tex></li>
              <li>✓ <Tex>{'AB = (x_2 - x_1;\\ y_2 - y_1)'}</Tex>; <Tex>{'|a| = \\sqrt{a_1^2 + a_2^2}'}</Tex>; средата на <Tex>{'AB'}</Tex>: <Tex>{'OM = \\frac{OA + OB}{2}'}</Tex></li>
              <li>✓ <Tex>{'a \\cdot b = |a||b| \\cos \\varphi = a_1b_1 + a_2b_2'}</Tex>; <Tex>{'a \\perp b \\iff a \\cdot b = 0'}</Tex></li>
              <li>✓ Медицентър: <Tex>{'GA + GB + GC = 0'}</Tex></li>
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
