import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { RightTrigLab } from './RightTrigLab';
import { TriangleLawsLab } from './TriangleLawsLab';
import { UnitCircleLab } from './UnitCircleLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор: таблични стойности ----------

const NONE = 'не съществува';
const CHOICES = ['0', '1/2', '√2/2', '√3/2', '1', '√3/3', '√3', '−1/2', '−√2/2', '−√3/2', '−1', '−√3/3', '−√3', NONE];

// [функция, ъгъл, стойност] – ъгли от 0° до 180°
const TABLE: [string, number, string][] = [];
const VALUES: Record<number, [string, string, string]> = {
  0: ['0', '1', '0'],
  30: ['1/2', '√3/2', '√3/3'],
  45: ['√2/2', '√2/2', '1'],
  60: ['√3/2', '1/2', '√3'],
  90: ['1', '0', NONE],
  120: ['√3/2', '−1/2', '−√3'],
  135: ['√2/2', '−√2/2', '−1'],
  150: ['1/2', '−√3/2', '−√3/3'],
  180: ['0', '−1', '0'],
};
Object.entries(VALUES).forEach(([deg, [s, c, t]]) => {
  TABLE.push(['sin', Number(deg), s], ['cos', Number(deg), c], ['tg', Number(deg), t]);
});

/** Случаен въпрос, различен от предишния. */
const pick = (prev?: number) => {
  let i: number;
  do i = Math.floor(Math.random() * TABLE.length);
  while (i === prev);
  return i;
};

function Trainer() {
  const [task, setTask] = useState(() => pick());
  const [chosen, setChosen] = useState<string | null>(null);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fn, deg, answer] = TABLE[task];
  const right = chosen === answer;

  const choose = (v: string) => {
    if (chosen !== null) return;
    setChosen(v);
    if (v === answer) {
      setSolved(solved + 1);
      setStreak(streak + 1);
      setBest(Math.max(best, streak + 1));
    } else setStreak(0);
  };

  const next = () => {
    setTask(pick(task));
    setChosen(null);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center font-mono text-2xl sm:text-3xl mb-4 text-gray-800 dark:text-gray-100">
        {fn} {deg}° = ?
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
        {CHOICES.map(v => (
          <button
            key={v}
            onClick={() => choose(v)}
            disabled={chosen !== null}
            className={`px-3 py-2 rounded-lg border-2 font-mono text-sm sm:text-base min-w-[3.5rem] transition ${
              chosen !== null && v === answer
                ? 'border-green-500 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                : v === chosen
                  ? 'border-red-500 bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-sky-400'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {chosen !== null && (
        <div className="mt-4 text-center">
          <p className={`flex items-center justify-center gap-2 font-semibold ${right ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {right ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {right ? (streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : 'Браво! 🎉') : `Не съвсем: ${fn} ${deg}° = ${answer}`}
          </p>
          {!right && deg > 90 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Подсказка: {fn === 'sin' ? `sin ${deg}° = sin ${180 - deg}°` : `${fn} ${deg}° = −${fn} ${180 - deg}°`}
            </p>
          )}
          <button onClick={next} className="mt-3 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
            Следващ →
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🪜 Стълба',
    problem: 'Стълба с дължина 5 m е опряна на стена и сключва със земята ъгъл 70°. На каква височина достига горният ѝ край?',
    solution: ['Стълбата е хипотенуза, височината е катетът срещу ъгъла 70°.', '$h = 5 \\cdot \\sin 70^\\circ \\approx 5 \\cdot 0{,}940$', '$h \\approx 4{,}70$'],
    answer: '$\\approx 4{,}70\\ \\mathrm{m}$',
    check: [4.7],
    ask: ['височина, m'],
  },
  {
    title: '⛰️ Пътен знак',
    problem: 'Знакът „Стръмен наклон 10%“ означава, че пътят се изкачва с 10 m на всеки 100 m по хоризонтала. Какъв ъгъл сключва пътят с хоризонталата?',
    solution: ['Наклонът в проценти е $\\tg$ на ъгъла: $\\tg \\alpha = \\frac{10}{100} = 0{,}1$', '$\\alpha = \\arctg 0{,}1 \\approx 5{,}71^\\circ$'],
    answer: '$\\approx 5{,}7^\\circ$ – много по-малко, отколкото изглежда!',
    check: [5.71],
    ask: ['ъгъл, °'],
  },
  {
    title: '🏢 Сграда',
    problem: 'Стоиш на 30 m от сграда и виждаш върха ѝ под ъгъл 40° спрямо хоризонталата. Очите ти са на 1,6 m над земята. Колко е висока сградата?',
    solution: ['Над нивото на очите: $x = 30 \\cdot \\tg 40^\\circ \\approx 30 \\cdot 0{,}839 \\approx 25{,}17\\ \\mathrm{m}$', 'Добавяме височината на очите: $h \\approx 25{,}17 + 1{,}6 \\approx 26{,}8\\ \\mathrm{m}$'],
    answer: '$\\approx 26{,}8\\ \\mathrm{m}$',
    check: [26.8],
    ask: ['височина, m'],
  },
  {
    title: '🪁 Хвърчило',
    problem: 'Конецът на хвърчило е опънат и дълъг 50 m, а ъгълът му с хоризонталата е 35°. На каква височина над ръката е хвърчилото?',
    solution: ['$h = 50 \\cdot \\sin 35^\\circ$', '$\\sin 35^\\circ \\approx 0{,}574$', '$h \\approx 28{,}7$'],
    answer: '$\\approx 28{,}7\\ \\mathrm{m}$',
    check: [28.7],
    ask: ['височина, m'],
  },
  {
    title: '🌊 Ширина на езеро',
    problem:
      'Не можем да измерим директно разстоянието между точките $A$ и $B$ на двата бряга на езеро. От точка $C$ на сушата измерваме $CA = 300\\ \\mathrm{m},\\ CB = 400\\ \\mathrm{m}$ и $\\angle ACB = 60^\\circ$. Колко е $AB$?',
    solution: ['Косинусова теорема: $AB^2 = 300^2 + 400^2 - 2 \\cdot 300 \\cdot 400 \\cdot \\cos 60^\\circ$', '$AB^2 = 90\\,000 + 160\\,000 - 120\\,000 = 130\\,000$', '$AB = \\sqrt{130\\,000} \\approx 360{,}6$'],
    answer: '$\\approx 360{,}6\\ \\mathrm{m}$',
    check: [360.6],
    ask: ['разстояние, m'],
  },
  {
    title: '🌾 Нива',
    problem: 'Триъгълна нива има две страни 40 m и 50 m, които сключват ъгъл 30°. Колко квадратни метра е тя?',
    solution: ['$S = \\tfrac{1}{2} \\cdot a \\cdot b \\cdot \\sin \\gamma$', '$S = \\tfrac{1}{2} \\cdot 40 \\cdot 50 \\cdot \\sin 30^\\circ = \\tfrac{1}{2} \\cdot 40 \\cdot 50 \\cdot \\tfrac{1}{2}$', '$S = 500$'],
    answer: '$500\\ \\mathrm{m}^2$',
    check: [500],
    ask: ['лице, m²'],
  },
];

// ---------- Тест ----------

const trigQuiz: Question[] = [
  {
    question: 'В правоъгълен триъгълник $\\sin \\alpha$ е отношението на:',
    answers: ['противолежащия катет към хипотенузата', 'прилежащия катет към хипотенузата', 'противолежащия към прилежащия катет', 'хипотенузата към противолежащия катет'],
    correctAnswer: 'противолежащия катет към хипотенузата',
  },
  {
    question: 'На колко е равно $\\sin 30^\\circ$?',
    answers: ['$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{\\sqrt{3}}{3}$'],
    correctAnswer: '$\\frac{1}{2}$',
  },
  {
    question: 'На колко е равно $\\tg 45^\\circ$?',
    answers: ['$0$', '$\\frac{1}{2}$', '$1$', '$\\sqrt{3}$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Ъгълът $\\alpha$ е остър и $\\sin \\alpha = 0{,}6$. На колко е равно $\\cos \\alpha$?',
    answers: ['$0{,}4$', '$0{,}8$', '$0{,}36$', '$0{,}64$'],
    correctAnswer: '$0{,}8$',
  },
  {
    question: 'На колко е равно $\\sin 150^\\circ$?',
    answers: ['$-\\frac{1}{2}$', '$\\frac{1}{2}$', '$-\\frac{\\sqrt{3}}{2}$', '$\\frac{\\sqrt{3}}{2}$'],
    correctAnswer: '$\\frac{1}{2}$',
  },
  {
    question: 'На колко е равно $\\cos 120^\\circ$?',
    answers: ['$\\frac{1}{2}$', '$-\\frac{1}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$-\\frac{\\sqrt{3}}{2}$'],
    correctAnswer: '$-\\frac{1}{2}$',
  },
  {
    question: 'Коя е косинусовата теорема за страната $c$ срещу ъгъла $\\gamma$?',
    answers: ['$c^2 = a^2 + b^2 - 2ab \\cdot \\cos \\gamma$', '$c^2 = a^2 + b^2 + 2ab \\cdot \\cos \\gamma$', '$c = a \\cdot \\cos \\beta + b \\cdot \\cos \\alpha \\cdot \\sin \\gamma$', '$c^2 = a^2 + b^2 - 2ab \\cdot \\sin \\gamma$'],
    correctAnswer: '$c^2 = a^2 + b^2 - 2ab \\cdot \\cos \\gamma$',
  },
  {
    question: 'В триъгълник $a = 10$ и $\\alpha = 30^\\circ$. Колко е радиусът $R$ на описаната окръжност?',
    answers: ['$5$', '$10$', '$20$', '$5\\sqrt{3}$'],
    correctAnswer: '$10$',
  },
  {
    question: 'Две страни на триъгълник са 6 и 8, а ъгълът между тях е 30°. Колко е лицето му?',
    answers: ['$12$', '$24$', '$48$', '$12\\sqrt{3}$'],
    correctAnswer: '$12$',
  },
];

// ---------- Страница ----------

export function Trigonometry() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Тригонометрия</h1>

        <div className="bg-gradient-to-br from-sky-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏔️ През XIX век британските геодезисти в Индия мерят един връх, наречен просто „Пик XV“, от точки на повече от 100 km разстояние. Не
            могат да се качат на него – дори не могат да влязат в Непал. Имат само теодолит (уред за мерене на ъгли), измерени разстояния
            между наблюдателните точки и тригонометрия. През 1856 г. обявяват височина 29 002 фута (около 8840 m) – най-високия връх на света,
            по-късно наречен Еверест. Днешното измерване от 2020 г. е 8848,86 m: разлика под 0,1%, постигната с ъгли и синуси.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Синус, косинус и тангенс на остър ъгъл</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Два правоъгълни триъгълника – единият малък, начертан в тетрадка, другият огромен, образуван от
              сянката на кула – имат еднакъв остър ъгъл 35°. Какво общо има между тях? Всички техни отношения на страни са равни – защото са{' '}
              <Link to="/geometry/similar" className={link}>
                подобни
              </Link>
              . Затова тези отношения можем да пресметнем веднъж и да ги „закачим“ за самия ъгъл.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Тригонометрични функции на остър ъгъл"
            description="В правоъгълен триъгълник с остър ъгъл $\alpha$, хипотенуза $c$, противолежащ катет $a$ и прилежащ катет $b$: $\sin \alpha = \frac{a}{c},\ \cos \alpha = \frac{b}{c},\ \tg \alpha = \frac{a}{b},\ \cotg \alpha = \frac{b}{a}$. Те зависят само от ъгъла $\alpha$, не от размера на триъгълника."
          />
          <RightTrigLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Стойности за 30°, 45° и 60°</h2>
          <p className={text}>
            Тези стойности се извеждат от две фигури. Диагоналът дели квадрата на два равнобедрени правоъгълни триъгълника с ъгли 45° и катети
            1 и 1, а хипотенуза <Tex>{'\\sqrt{2}'}</Tex>. Височината дели равностранния триъгълник със страна 2 на два триъгълника с ъгли 30° и 60°, катети 1 и <Tex>{'\\sqrt{3}'}</Tex> и
            хипотенуза 2.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base text-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded shadow-sm font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2 sm:p-3 text-left font-sans"><Tex>{'\\alpha'}</Tex></th>
                  {['0°', '30°', '45°', '60°', '90°'].map(d => (
                    <th key={d} className="p-2 sm:p-3">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['$\\sin \\alpha$', '$0$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$1$'],
                  ['$\\cos \\alpha$', '$1$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$\\frac{1}{2}$', '$0$'],
                  ['$\\tg \\alpha$', '$0$', '$\\frac{\\sqrt{3}}{3}$', '$1$', '$\\sqrt{3}$', '—'],
                  ['$\\cotg \\alpha$', '—', '$\\sqrt{3}$', '$1$', '$\\frac{\\sqrt{3}}{3}$', '$0$'],
                ].map(([name, ...vals]) => (
                  <tr key={name} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-2 sm:p-3 text-left"><MathText>{name}</MathText></td>
                    {vals.map((v, i) => (
                      <td key={i} className="p-2 sm:p-3">
                        <MathText displayStyle>{v}</MathText>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Лесно за запомняне: <Tex>{'\\sin'}</Tex> за 0°, 30°, 45°, 60°, 90° е <Tex>{'\\frac{\\sqrt{0}}{2},\\ \\frac{\\sqrt{1}}{2},\\ \\frac{\\sqrt{2}}{2},\\ \\frac{\\sqrt{3}}{2},\\ \\frac{\\sqrt{4}}{2}'}</Tex> – а <Tex>{'\\cos'}</Tex> е същият ред, обърнат.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Основни тъждества</h2>
          <Theorem
            title="Връзки между функциите на един ъгъл"
            description="$\sin^2 \alpha + \cos^2 \alpha = 1$ (Питагоровата теорема, разделена на $c^2$); $\tg \alpha = \sin \alpha / \cos \alpha$; $\cotg \alpha = \cos \alpha / \sin \alpha$; $\tg \alpha \cdot \cotg \alpha = 1$. За допълнителни ъгли: $\sin (90^\circ - \alpha) = \cos \alpha$ и $\cos (90^\circ - \alpha) = \sin \alpha$ – двата остри ъгъла в правоъгълен триъгълник си разменят катетите."
          />
          <Example
            description="Ъгълът $\alpha$ е остър и $\cos \alpha = \frac{5}{13}$. Да намерим $\sin \alpha$ и $\tg \alpha$."
            steps={['$\\sin^2 \\alpha = 1 - \\cos^2 \\alpha = 1 - \\frac{25}{169} = \\frac{144}{169}$', '$\\alpha$ е остър $\\Rightarrow \\sin \\alpha > 0 \\Rightarrow \\sin \\alpha = \\frac{12}{13}$', '$\\tg \\alpha = \\sin \\alpha / \\cos \\alpha = \\frac{12}{13} : \\frac{5}{13} = \\frac{12}{5}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Решаване на правоъгълен триъгълник</h2>
          <p className={text}>
            „Да решим триъгълник“ значи да намерим всичките му страни и ъгли. В правоъгълния триъгълник са достатъчни два елемента (освен
            правия ъгъл), поне единият от които е страна.
          </p>
          <Example
            description="Хипотенузата е $c = 10$, а острият ъгъл $\alpha = 30^\circ$. Да намерим катетите и другия ъгъл."
            steps={['$\\beta = 90^\\circ - 30^\\circ = 60^\\circ$', '$a = c \\cdot \\sin \\alpha = 10 \\cdot \\frac{1}{2} = 5$', '$b = c \\cdot \\cos \\alpha = 10 \\cdot \\frac{\\sqrt{3}}{2} = 5\\sqrt{3} \\approx 8{,}66$']}
          />
          <Example
            description="Катетите са $a = 7$ и $b = 24$. Да намерим хипотенузата и ъглите."
            steps={['$c = \\sqrt{49 + 576} = \\sqrt{625} = 25$', '$\\tg \\alpha = \\frac{7}{24} \\approx 0{,}292 \\Rightarrow \\alpha \\approx 16{,}3^\\circ$ (с калкулатор: $\\tan^{-1}$)', '$\\beta = 90^\\circ - \\alpha \\approx 73{,}7^\\circ$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Ъгли до 180° и единичната окръжност</h2>
          <p className={text}>
            В правоъгълен триъгълник ъгълът е винаги остър. За тъпи ъгли (а и за ъгли над 180°) имаме нужда от нова дефиниция. Нанасяме ъгъла
            в единична окръжност и казваме: <Tex>{'\\cos \\alpha'}</Tex> е абсцисата, а <Tex>{'\\sin \\alpha'}</Tex> – ординатата на точката. За острите ъгли тя съвпада със старата.
          </p>
          <Theorem
            title="Формули за $180^\circ - \alpha$"
            description="$\sin (180^\circ - \alpha) = \sin \alpha$; $\cos (180^\circ - \alpha) = -\cos \alpha$; $\tg (180^\circ - \alpha) = -\tg \alpha$. Следствие: за тъпите ъгли синусът е положителен, а косинусът и тангенсът – отрицателни. Например $\sin 150^\circ = \sin 30^\circ = \frac{1}{2},\ \cos 120^\circ = -\cos 60^\circ = -\frac{1}{2}$."
          />
          <UnitCircleLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Синусова и косинусова теорема</h2>
          <p className={text}>Тези две теореми решават произволен триъгълник – не само правоъгълен.</p>
          <Theorem
            title="Синусова теорема"
            description="Във всеки триъгълник $\frac{a}{\sin \alpha} = \frac{b}{\sin \beta} = \frac{c}{\sin \gamma} = 2R$, където $R$ е радиусът на описаната окръжност. Използваме я, когато знаем страна и срещулежащия ѝ ъгъл."
          />
          <Theorem
            title="Косинусова теорема"
            description="Във всеки триъгълник $c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma$ (и аналогично за другите страни). При $\gamma = 90^\circ$ тя е Питагоровата теорема. Използваме я, когато знаем две страни и ъгъла между тях или трите страни."
          />
          <Theorem
            title="Лице чрез синус"
            description="$S = \tfrac{1}{2} \cdot a \cdot b \cdot \sin \gamma$ – половината от произведението на две страни и синуса на ъгъла между тях. Като заместим $\sin \gamma = \frac{c}{2R}$, получаваме и $S = \frac{abc}{4R}$."
          />
          <TriangleLawsLab />
          <Example
            description="Страните на триъгълник са $a = 7,\ b = 8$ и $c = 13$. Да намерим най-големия ъгъл."
            steps={['Най-големият ъгъл е срещу най-голямата страна – $\\gamma$ срещу $c = 13$', '$\\cos \\gamma = \\frac{a^2 + b^2 - c^2}{2ab} = \\frac{49 + 64 - 169}{112} = -\\frac{56}{112} = -\\frac{1}{2}$', '$\\gamma = 120^\\circ$ (тъп ъгъл – косинусът е отрицателен)']}
          />
          <Example
            description="В триъгълник $a = 6,\ \alpha = 30^\circ$ и $\beta = 45^\circ$. Да намерим $b$ и $R$."
            steps={['Синусова теорема: $b = a \\cdot \\sin \\beta / \\sin \\alpha = 6 \\cdot \\frac{\\sqrt{2}}{2} : \\frac{1}{2} = 6\\sqrt{2} \\approx 8{,}49$', '$2R = a / \\sin \\alpha = 6 : \\frac{1}{2} = 12 \\Rightarrow R = 6$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор: таблични стойности
          </h2>
          <p className={text}>Олимпиадните задачи очакват точните стойности наизуст. Колко поредни верни отговора можеш да постигнеш?</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <p className={text}>
            За ъгли, които не са в таблицата, използвай калкулатор – но първо провери, че е в режим <strong>DEG</strong> (градуси)!
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Калкулатор в радиани', '$\\sin 30 = -0{,}988$', 'режим DEG: $\\sin 30^\\circ = 0{,}5$'],
              ['Объркани отношения', '$\\sin \\alpha =$ противолежащ / прилежащ', 'това е $\\tg \\alpha$; $\\sin \\alpha =$ противолежащ / хипотенуза'],
              ['„Изваждане“ на числото пред ъгъла', '$\\sin 60^\\circ = 2 \\cdot \\sin 30^\\circ = 1$', '$\\sin 60^\\circ = \\frac{\\sqrt{3}}{2} \\approx 0{,}866$'],
              ['Знак при тъп ъгъл', '$\\cos 120^\\circ = \\frac{1}{2}$', '$\\cos 120^\\circ = -\\cos 60^\\circ = -\\frac{1}{2}$'],
              ['Ъгъл по синус – изгубено решение', '$\\sin \\beta = \\frac{1}{2} \\Rightarrow \\beta = 30^\\circ$', '$\\beta = 30^\\circ$ или $\\beta = 150^\\circ$ (ако е възможно)'],
              ['Косинусова теорема с грешен ъгъл', '$c^2 = a^2 + b^2 - 2ab \\cdot \\cos \\alpha$', 'ъгълът е срещу $c$, т.е. между $a$ и $b$: $\\gamma$'],
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
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={trigQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Катетите на правоъгълен триъгълник са 3 и 4. Намерете $\sin$, $\cos$ и $\tg$ на ъгъла $\alpha$ срещу катета 3.">
                <p>Хипотенузата е <Tex>{'\\sqrt{9 + 16} = 5'}</Tex>.</p>
                <p><Tex>{'\\sin \\alpha = \\frac{3}{5} = 0{,}6'}</Tex>; <Tex>{'\\cos \\alpha = \\frac{4}{5} = 0{,}8'}</Tex>; <Tex>{'\\tg \\alpha = \\frac{3}{4} = 0{,}75'}</Tex></p>
                <p>Проверка: <Tex>{'0{,}6^2 + 0{,}8^2 = 0{,}36 + 0{,}64 = 1'}</Tex> ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Хипотенузата на правоъгълен триъгълник е 10, а единият му ъгъл е 30°. Намерете катетите.">
                <p>Катетът срещу 30° е <Tex>{'a = 10 \\cdot \\sin 30^\\circ = 5'}</Tex> (половината от хипотенузата).</p>
                <p>Другият катет е <Tex>{'b = 10 \\cdot \\cos 30^\\circ = 5\\sqrt{3} \\approx 8{,}66'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете $\sin^2 30^\circ + \cos^2 60^\circ + \tg 45^\circ$.">
                <p><Tex>{'\\sin 30^\\circ = \\frac{1}{2} \\Rightarrow \\sin^2 30^\\circ = \\frac{1}{4}'}</Tex></p>
                <p><Tex>{'\\cos 60^\\circ = \\frac{1}{2} \\Rightarrow \\cos^2 60^\\circ = \\frac{1}{4}'}</Tex></p>
                <p><Tex>{'\\frac{1}{4} + \\frac{1}{4} + 1 = 1{,}5'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Ъгълът $\alpha$ е остър и $\tg \alpha = 2$. Намерете $\sin \alpha$ и $\cos \alpha$.">
                <p>Нека <Tex>{'a = 2'}</Tex> и <Tex>{'b = 1'}</Tex> (катети с отношение 2). Хипотенузата е <Tex>{'\\sqrt{5}'}</Tex>.</p>
                <p><Tex>{'\\sin \\alpha = \\frac{2}{\\sqrt{5}} = \\frac{2\\sqrt{5}}{5} \\approx 0{,}894'}</Tex></p>
                <p><Tex>{'\\cos \\alpha = \\frac{1}{\\sqrt{5}} = \\frac{\\sqrt{5}}{5} \\approx 0{,}447'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Страните на триъгълник са 7, 8 и 13. Намерете най-големия му ъгъл.">
                <p>Той е срещу страната 13: <Tex>{'\\cos \\gamma = \\frac{7^2 + 8^2 - 13^2}{2 \\cdot 7 \\cdot 8} = \\frac{49 + 64 - 169}{112}'}</Tex></p>
                <p><Tex>{'\\cos \\gamma = -\\frac{56}{112} = -\\frac{1}{2}'}</Tex></p>
                <p><Tex>{'\\gamma = 120^\\circ'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="В триъгълник $a = 6,\ \alpha = 30^\circ$ и $\beta = 45^\circ$. Намерете $b$ и радиуса на описаната окръжност.">
                <p><Tex>{'\\frac{a}{\\sin \\alpha} = 6 : \\frac{1}{2} = 12 = 2R \\Rightarrow R = 6'}</Tex></p>
                <p><Tex>{'b = 2R \\cdot \\sin \\beta = 12 \\cdot \\frac{\\sqrt{2}}{2} = 6\\sqrt{2} \\approx 8{,}49'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажи, че за всеки триъгълник $S = \frac{abc}{4R}$.">
                <p>Лицето е <Tex>{'S = \\tfrac{1}{2} \\cdot a \\cdot b \\cdot \\sin \\gamma'}</Tex>.</p>
                <p>От синусовата теорема <Tex>{'c = 2R \\cdot \\sin \\gamma'}</Tex>, т.е. <Tex>{'\\sin \\gamma = \\frac{c}{2R}'}</Tex>.</p>
                <p><Tex>{'S = \\tfrac{1}{2} \\cdot a \\cdot b \\cdot \\frac{c}{2R} = \\frac{abc}{4R}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Изведи формулата за медианата $m_c = \tfrac{1}{2}\sqrt{2a^2 + 2b^2 - c^2}$ и я приложи за страни $a = 5,\ b = 6,\ c = 7$.">
                <p>Нека <Tex>{'M'}</Tex> е средата на <Tex>{'AB'}</Tex>, <Tex>{'\\angle AMC = \\varphi'}</Tex>, <Tex>{'\\angle BMC = 180^\\circ - \\varphi'}</Tex>. Косинусова теорема в двата триъгълника:</p>
                <p><Tex>{'b^2 = m^2 + \\frac{c^2}{4} - m \\cdot c \\cdot \\cos \\varphi'}</Tex> и <Tex>{'a^2 = m^2 + \\frac{c^2}{4} + m \\cdot c \\cdot \\cos \\varphi'}</Tex> (защото <Tex>{'\\cos (180^\\circ - \\varphi) = -\\cos \\varphi'}</Tex>).</p>
                <p>Събираме: <Tex>{'a^2 + b^2 = 2m^2 + \\frac{c^2}{2} \\Rightarrow m^2 = \\frac{2a^2 + 2b^2 - c^2}{4}'}</Tex>.</p>
                <p>За 5, 6, 7: <Tex>{'m^2 = \\frac{50 + 72 - 49}{4} = \\frac{73}{4} \\Rightarrow m = \\frac{\\sqrt{73}}{2} \\approx 4{,}27'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Страните на триъгълник са 5, 6 и 7. Намерете лицето му и радиуса на описаната окръжност.">
                <p><Tex>{'\\cos \\gamma'}</Tex> (срещу 7) <Tex>{'= \\frac{25 + 36 - 49}{60} = \\frac{1}{5} \\Rightarrow \\sin \\gamma = \\sqrt{1 - \\frac{1}{25}} = \\frac{2\\sqrt{6}}{5}'}</Tex></p>
                <p><Tex>{'S = \\tfrac{1}{2} \\cdot 5 \\cdot 6 \\cdot \\frac{2\\sqrt{6}}{5} = 6\\sqrt{6} \\approx 14{,}70'}</Tex></p>
                <p><Tex>{'R = \\frac{abc}{4S} = \\frac{210}{24\\sqrt{6}} = \\frac{35\\sqrt{6}}{24} \\approx 3{,}57'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\sin \\alpha = \\frac{a}{c},\\ \\cos \\alpha = \\frac{b}{c},\\ \\tg \\alpha = \\frac{a}{b}'}</Tex> – зависят само от ъгъла (подобни триъгълници)</li>
              <li>✓ 30°, 45°, 60°: <Tex>{'\\sin = \\frac{1}{2},\\ \\frac{\\sqrt{2}}{2},\\ \\frac{\\sqrt{3}}{2}'}</Tex>; <Tex>{'\\cos'}</Tex> – в обратен ред</li>
              <li>✓ <Tex>{'\\sin^2 \\alpha + \\cos^2 \\alpha = 1'}</Tex>; <Tex>{'\\tg \\alpha = \\sin \\alpha / \\cos \\alpha'}</Tex>; <Tex>{'\\sin (90^\\circ - \\alpha) = \\cos \\alpha'}</Tex></li>
              <li>✓ Единична окръжност: <Tex>{'\\cos \\alpha = x,\\ \\sin \\alpha = y'}</Tex>; <Tex>{'\\sin (180^\\circ - \\alpha) = \\sin \\alpha,\\ \\cos (180^\\circ - \\alpha) = -\\cos \\alpha'}</Tex></li>
              <li>✓ Синусова теорема: <Tex>{'\\frac{a}{\\sin \\alpha} = \\frac{b}{\\sin \\beta} = \\frac{c}{\\sin \\gamma} = 2R'}</Tex></li>
              <li>✓ Косинусова теорема: <Tex>{'c^2 = a^2 + b^2 - 2ab \\cdot \\cos \\gamma'}</Tex></li>
              <li>✓ Лице: <Tex>{'S = \\tfrac{1}{2}ab \\cdot \\sin \\gamma = \\frac{abc}{4R}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „синус“ има странна история. Индийските астрономи наричали половин хорда „джива“ – тетива на лък. Арабските учени
              заимствали думата като „джиба“, която се пише с едни и същи съгласни като „джайб“ – „пазва, гънка“. При превода на латински през
              XII век тя е предадена като <em>sinus</em> – „гънка, извивка“. Така, според най-разпространеното обяснение, тетивата на лъка се
              превърнала в „гънка“ заради една двусмислена дума.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
