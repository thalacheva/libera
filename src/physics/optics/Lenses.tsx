import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, pick, randInt } from '~/drill';
import Trainer from '~/Trainer';
import EyeLab from './EyeLab';
import LensRayLab from './LensRayLab';
import MicroscopeLab from './MicroscopeLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 2.5 → 2{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');
const par = (v: number) => (v < 0 ? `(${dec(v)})` : dec(v));

// Двойки (f, d) в cm, при които d′ и увеличението са крайни десетични дроби
const CONV: [number, number][] = [
  [10, 15],
  [10, 30],
  [10, 20],
  [20, 30],
  [20, 60],
  [12, 20],
  [15, 20],
  [6, 10],
  [10, 5],
  [12, 8],
  [20, 10],
];
const DIV: [number, number][] = [
  [-10, 10],
  [-10, 30],
  [-20, 20],
  [-20, 30],
  [-30, 20],
  [-30, 60],
  [-20, 60],
  [-10, 40],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const f = pick([10, 20, 25, 40, 50, -20, -25, -50]);
    return {
      tex: `f = ${f}\\ \\mathrm{cm}`,
      ask: 'Оптична сила: $D = ?\\ \\mathrm{dpt}$',
      num: 100,
      den: f,
      steps: [`Фокусното разстояние е в метри: $f = ${dec(f / 100)}\\ \\mathrm{m}$`, `$D = \\frac{1}{f} = \\frac{1}{${par(f / 100)}} = ${dec(100 / f)}\\ \\mathrm{dpt}$`],
    };
  }
  if (kind === 1 || kind === 2) {
    const [f, d] = pick(CONV);
    const di = (f * d) / (d - f);
    if (kind === 1) {
      return {
        tex: `f = ${f}\\ \\mathrm{cm}, \\quad d = ${d}\\ \\mathrm{cm}`,
        ask: "Къде е образът: $d' = ?\\ \\mathrm{cm}$",
        num: f * d,
        den: d - f,
        steps: [
          `$\\frac{1}{d'} = \\frac{1}{f} - \\frac{1}{d} = \\frac{1}{${f}} - \\frac{1}{${d}} = \\frac{${d - f}}{${f * d}}$`,
          `$d' = ${dec(di)}\\ \\mathrm{cm}$ – ${di > 0 ? 'реален образ (зад лещата)' : 'въображаем образ (от страната на предмета)'}`,
        ],
      };
    }
    return {
      tex: `f = ${f}\\ \\mathrm{cm}, \\quad d = ${d}\\ \\mathrm{cm}`,
      ask: 'Увеличение: $\\Gamma = ?$',
      num: f,
      den: Math.abs(d - f),
      steps: [`$d' = \\frac{fd}{d - f} = \\frac{${f} \\cdot ${d}}{${d - f}} = ${dec(di)}\\ \\mathrm{cm}$`, `$\\Gamma = \\frac{|d'|}{d} = \\frac{${dec(Math.abs(di))}}{${d}} = ${dec(Math.abs(di) / d)}$`],
    };
  }
  if (kind === 3) {
    const [f, d] = pick(DIV);
    const di = (f * d) / (d - f);
    return {
      tex: `f = ${f}\\ \\mathrm{cm}, \\quad d = ${d}\\ \\mathrm{cm}`,
      ask: "Разсейвателна леща: $d' = ?\\ \\mathrm{cm}$",
      num: f * d,
      den: d - f,
      steps: [`$\\frac{1}{d'} = \\frac{1}{f} - \\frac{1}{d} = -\\frac{1}{${-f}} - \\frac{1}{${d}}$`, `$d' = ${dec(di)}\\ \\mathrm{cm}$ – отрицателно: образът е въображаем`],
    };
  }
  if (kind === 4) {
    const [d1, d2] = [pick([2, 3, 4, 5, 10]), pick([-1, -2, -3, 1, 2])];
    return {
      tex: `D_1 = ${d1}\\ \\mathrm{dpt}, \\quad D_2 = ${d2}\\ \\mathrm{dpt}`,
      ask: 'Долепени лещи: $D = ?\\ \\mathrm{dpt}$',
      num: d1 + d2,
      den: 1,
      steps: [`Оптичните сили на долепени лещи се събират: $D = D_1 + D_2 = ${d1} ${d2 < 0 ? '-' : '+'} ${Math.abs(d2)} = ${d1 + d2}\\ \\mathrm{dpt}$`],
    };
  }
  if (kind === 5) {
    const a = pick([25, 40, 50, 100, 200]);
    return {
      tex: `\\text{далечна точка: } ${a}\\ \\mathrm{cm}`,
      ask: 'Късоглед – очила: $D = ?\\ \\mathrm{dpt}$',
      num: -100,
      den: a,
      steps: [`Очилата трябва да дадат образ на далечни предмети в далечната точка: $f = -${dec(a / 100)}\\ \\mathrm{m}$`, `$D = \\frac{1}{f} = ${dec(-100 / a)}\\ \\mathrm{dpt}$`],
    };
  }
  const f10 = pick([50, 100, 25, 125]);
  return {
    tex: `f = ${dec(f10 / 10)}\\ \\mathrm{cm}`,
    ask: 'Лупа (образ в безкрайност): $\\Gamma = ?$',
    num: 250,
    den: f10,
    steps: [`$\\Gamma \\approx \\frac{25\\ \\mathrm{cm}}{f} = \\frac{25}{${dec(f10 / 10)}} = ${dec(250 / f10)}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '📷 Фотоапарат',
    problem: 'Обектив с фокусно разстояние 50 mm снима човек на 2 m. На какво разстояние от обектива трябва да е сензорът?',
    solution: ["$\\frac{1}{d'} = \\frac{1}{50} - \\frac{1}{2000} = \\frac{39}{2000}$", "$d' \\approx 51{,}3\\ \\mathrm{mm}$ – с 1,3 mm по-далеч, отколкото при снимка на далечен пейзаж. Така фокусира фотоапаратът: мести обектива."],
    answer: '$\\approx 51{,}3\\ \\mathrm{mm}$',
    check: [51.3],
    ask: ['разстояние, mm'],
  },
  {
    title: '📽️ Проектор',
    problem: 'Проектор с леща f = 10 cm дава рязък образ на екран на 3 m от лещата. На какво разстояние от лещата е картината и колко пъти е увеличена?',
    solution: ['$\\frac{1}{d} = \\frac{1}{10} - \\frac{1}{300} = \\frac{29}{300} \\Rightarrow d \\approx 10{,}3\\ \\mathrm{cm}$', "$\\Gamma = \\frac{d'}{d} = \\frac{300}{10{,}34} \\approx 29$ – картината е малко зад фокуса, а образът е реален и обърнат (затова слайдовете се слагат наобратно)."],
    answer: '$d \\approx 10{,}3\\ \\mathrm{cm}$, $\\Gamma \\approx 29$',
    check: [10.3, 29],
    ask: ['d, cm', 'увеличение'],
  },
  {
    title: '👓 Очила за късоглед',
    problem: 'Късоглед ученик вижда ясно само до 40 cm. Какви очила (в диоптри) му трябват, за да вижда ясно далечни предмети? (Очилата смятаме долепени до окото.)',
    solution: ['Очилата трябва да дават образ на безкрайно далечния предмет в далечната точка – на 40 cm пред окото: това е разсейвателна леща с $f = -0{,}4\\ \\mathrm{m}$.', '$D = \\frac{1}{-0{,}4} = -2{,}5\\ \\mathrm{dpt}$'],
    answer: '$-2{,}5\\ \\mathrm{dpt}$',
    check: [-2.5],
    ask: ['D, dpt'],
  },
  {
    title: '📖 Очила за четене',
    problem: 'Възрастен човек вижда ясно най-близо от 1 m. Колко диоптъра трябва да са очилата му, за да чете от 25 cm?',
    solution: ["Книгата е на $d = 25\\ \\mathrm{cm}$, а образът ѝ трябва да е на 1 m от същата страна (въображаем): $d' = -100\\ \\mathrm{cm}$.", '$D = \\frac{1}{0{,}25} + \\frac{1}{-1} = 4 - 1 = 3\\ \\mathrm{dpt}$ – събирателни очила.'],
    answer: '$+3\\ \\mathrm{dpt}$',
    check: [3],
    ask: ['D, dpt'],
  },
  {
    title: '🔍 Лупа',
    problem: 'Лупа има фокусно разстояние 5 cm. Колко пъти увеличава, ако окото гледа образа отпуснато (образът е в безкрайност)?',
    solution: ['$\\Gamma \\approx \\frac{25\\ \\mathrm{cm}}{f} = \\frac{25}{5} = 5$ пъти'],
    answer: '5 пъти',
    check: [5],
    ask: ['увеличение'],
  },
  {
    title: '🔬 Училищен микроскоп',
    problem: 'Микроскоп има обектив с f = 4 mm, окуляр с f = 25 mm и оптична дължина на тубуса 160 mm. Около колко пъти увеличава?',
    solution: ['Обективът: $\\frac{L}{f_{\\text{об}}} = \\frac{160}{4} = 40$ пъти', 'Окулярът като лупа: $\\frac{250}{25} = 10$ пъти', 'Общо $40 \\cdot 10 = 400$ пъти – обикновено на окуляра пише „10×“, а на обектива „40×“.'],
    answer: '400 пъти',
    check: [400],
    ask: ['увеличение'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Каква е оптичната сила на леща с фокусно разстояние 50 cm?',
    answers: ['$2\\ \\mathrm{dpt}$', '$50\\ \\mathrm{dpt}$', '$0{,}02\\ \\mathrm{dpt}$', '$0{,}5\\ \\mathrm{dpt}$'],
    correctAnswer: '$2\\ \\mathrm{dpt}$',
  },
  {
    question: 'Какъв е образът на предмет, даден от разсейвателна леща?',
    answers: ['винаги въображаем, прав и умален', 'винаги реален и обърнат', 'винаги увеличен', 'зависи от разстоянието – може да е реален'],
    correctAnswer: 'винаги въображаем, прав и умален',
  },
  {
    question: 'Предмет е на разстояние $2f$ от събирателна леща. Какъв е образът?',
    answers: ['реален, обърнат, със същия размер', 'въображаем и увеличен', 'реален, умален, във фокуса', 'няма образ'],
    correctAnswer: 'реален, обърнат, със същия размер',
  },
  {
    question: 'С каква леща се коригира късогледството?',
    answers: ['разсейвателна', 'събирателна', 'цилиндрична', 'не се коригира с лещи'],
    correctAnswer: 'разсейвателна',
  },
  {
    question: 'Коя е формулата на тънката леща?',
    answers: ["$\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$", "$f = d + d'$", "$\\frac{1}{f} = \\frac{1}{d} - \\frac{1}{d'}$", "$f = \\frac{d}{d'}$"],
    correctAnswer: "$\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$",
  },
  {
    question: 'Какво става, ако предметът е точно във фокуса на събирателна леща?',
    answers: ['лъчите излизат успоредни – образ няма', 'образът е във фокуса от другата страна', 'образът е със същия размер', 'образът е въображаем и умален'],
    correctAnswer: 'лъчите излизат успоредни – образ няма',
  },
  {
    question: 'Около колко пъти увеличава лупа с фокусно разстояние 10 cm (образ в безкрайност)?',
    answers: ['$2{,}5$', '$10$', '$0{,}4$', '$25$'],
    correctAnswer: '$2{,}5$',
  },
  {
    question: 'Две долепени лещи имат оптична сила $+3$ и $+2\\ \\mathrm{dpt}$. Каква е общата им оптична сила?',
    answers: ['$5\\ \\mathrm{dpt}$', '$6\\ \\mathrm{dpt}$', '$1{,}2\\ \\mathrm{dpt}$', '$1\\ \\mathrm{dpt}$'],
    correctAnswer: '$5\\ \\mathrm{dpt}$',
  },
  {
    question: 'Фотоапаратът се фокусира от далечен пейзаж към близък човек. Какво трябва да направи обективът?',
    answers: ['да се отдалечи от сензора', 'да се приближи до сензора', 'да остане на място', 'да се обърне'],
    correctAnswer: 'да се отдалечи от сензора',
  },
];

// ---------- Страница ----------

const CASES: [string, string, string][] = [
  ['$d > 2f$', "$f < d' < 2f$", 'реален, обърнат, умален – фотоапарат, око'],
  ['$d = 2f$', "$d' = 2f$", 'реален, обърнат, със същия размер'],
  ['$f < d < 2f$', "$d' > 2f$", 'реален, обърнат, увеличен – проектор'],
  ['$d = f$', '—', 'образ няма – лъчите излизат успоредни (прожектор)'],
  ['$d < f$', "$d' < 0$", 'въображаем, прав, увеличен – лупа'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Lenses() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Лещи и оптични уреди</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔬 През 70-те години на XVII век холандският търговец на платове Антони ван Льовенхук шлифова мънички лещи, колкото глава на
            карфица, и ги монтира в метални плочки. С най-добрите си микроскопи – само с една леща – той вероятно е постигал увеличение от
            около 200–270 пъти. В капка вода от езеро вижда множество движещи се „животинчета“ и описва първите наблюдавани бактерии и
            едноклетъчни в писма до Лондонското кралско дружество (от 1676 г. нататък). Цял невидим свят се появява благодарение на едно късче
            извито стъкло. Как една <strong>леща</strong> събира светлината и защо дава образи?
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Видове лещи</h2>
          <p className={text}>
            Лещата е прозрачно тяло, ограничено от две сферични (или една сферична и една плоска) повърхности. Тя работи заради <Term id="refraction">пречупването</Term>
            на светлината по границите стъкло–въздух (виж{' '}
            <Link to="/physics/optics/reflection-refraction" className={link}>
              Отражение и пречупване
            </Link>
            ). Лещите, които са по-дебели в средата, са <strong>събирателни</strong>: успоредните лъчи след тях се събират в точка. По-тънките
            в средата са <strong>разсейвателни</strong>: успоредните лъчи след тях се разпръскват, сякаш излизат от точка пред лещата.
          </p>
          <Theorem
            type="definition"
            title="Фокус и оптична сила"
            description="Правата през центровете на повърхностите е главната оптична ос. Лъчите, успоредни на нея, след събирателна леща минават през главния фокус $F'$; разстоянието от лещата до него е фокусното разстояние $f$. Оптичната сила е $D = \frac{1}{f}$ и се измерва в диоптри: $1\ \mathrm{dpt} = 1\ \mathrm{m}^{-1}$. За разсейвателни лещи $f$ и $D$ са отрицателни."
          />
          <Example
            description="Колко е оптичната сила на леща с $f = 25\ \mathrm{cm}$ и на разсейвателна леща с $f = -50\ \mathrm{cm}$?"
            steps={['$D_1 = \\frac{1}{0{,}25\\ \\mathrm{m}} = 4\\ \\mathrm{dpt}$', '$D_2 = \\frac{1}{-0{,}5\\ \\mathrm{m}} = -2\\ \\mathrm{dpt}$', 'Ако ги долепим, оптичните сили се събират: $D = 4 - 2 = 2\\ \\mathrm{dpt}$, т.е. $f = 50\\ \\mathrm{cm}$.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Построяване на образи</h2>
          <p className={text}>
            От всяка точка на предмета излизат безброй лъчи, но за да намерим образа ѝ, стигат два от трите <strong>характерни лъча</strong>,
            чийто път след лещата знаем предварително:
          </p>
          <Theorem
            title="Характерни лъчи (тънка леща)"
            description="1) Лъч, успореден на главната оптична ос, след лещата минава през фокуса $F'$ (при разсейвателна леща – продължението му назад минава през фокуса). 2) Лъч през оптичния център не се пречупва. 3) Лъч, който минава през предния фокус $F$ (или е насочен към него), след лещата е успореден на оста. Където се пресекат лъчите – там е образът; ако се пресичат само продълженията им – образът е въображаем."
          />
          <LensRayLab />
          <p className={text}>Местейки предмета към събирателната леща, получаваме всички случаи:</p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Предмет</th>
                  <th className={th}>Образ</th>
                  <th className={th}>Вид на образа</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map(([a, b, c]) => (
                  <tr key={a}>
                    <td className={td}>
                      <MathText>{a}</MathText>
                    </td>
                    <td className={td}>
                      <MathText>{b}</MathText>
                    </td>
                    <td className={td}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Формула на лещата и увеличение</h2>
          <Theorem
            title="Формула на тънката леща"
            description="$\frac{1}{f} = \frac{1}{d} + \frac{1}{d'}$, където $d$ е разстоянието от предмета до лещата, а $d'$ – от образа до лещата. Правило за знаците: $d > 0$ за реален предмет; $d' > 0$ за реален образ (от другата страна на лещата), $d' < 0$ за въображаем образ (от страната на предмета); $f > 0$ за събирателна, $f < 0$ за разсейвателна леща. Увеличението е $\Gamma = \frac{h'}{h} = \frac{|d'|}{d}$; реалният образ е обърнат, въображаемият – прав."
          />
          <Example
            description="Предмет е на 30 cm от събирателна леща с $f = 10\ \mathrm{cm}$. Къде е образът и какъв е?"
            steps={["$\\frac{1}{d'} = \\frac{1}{10} - \\frac{1}{30} = \\frac{2}{30} \\Rightarrow d' = 15\\ \\mathrm{cm}$", "$\\Gamma = \\frac{15}{30} = 0{,}5$ – реален, обърнат, два пъти умален (случаят $d > 2f$)."]}
          />
          <Example
            description="Същата леща, но предметът е на 5 cm от нея."
            steps={["$\\frac{1}{d'} = \\frac{1}{10} - \\frac{1}{5} = -\\frac{1}{10} \\Rightarrow d' = -10\\ \\mathrm{cm}$", '$\\Gamma = \\frac{10}{5} = 2$ – образът е въображаем, прав и двойно увеличен: така работи лупата.']}
          />
          <Example
            description="Предмет е на 20 cm от разсейвателна леща с $f = -10\ \mathrm{cm}$."
            steps={["$\\frac{1}{d'} = -\\frac{1}{10} - \\frac{1}{20} = -\\frac{3}{20} \\Rightarrow d' \\approx -6{,}67\\ \\mathrm{cm}$", '$\\Gamma = \\frac{6{,}67}{20} \\approx 0{,}33$ – въображаем, прав, умален. Така изглежда светът през шпионката на вратата.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Окото и очилата</h2>
          <p className={text}>
            Окото е естествен фотоапарат: роговицата и лещата заедно (около 60 dpt) дават реален, обърнат и умален образ върху ретината.
            Разстоянието до ретината не се мени, затова при гледане на близки предмети мускулите правят лещата по-изпъкнала – това е{' '}
            <strong>акомодация</strong>. Нормалното око вижда ясно от безкрайност (далечна точка) до около 25 cm (близка точка) – разстоянието
            на най-добро виждане.
          </p>
          <Theorem
            title="Недостатъци на зрението"
            description="Късогледо око: образът на далечните предмети се получава пред ретината, далечната точка е на крайно разстояние $a$. Коригира се с разсейвателна леща с $D = -\frac{1}{a}$. Далекогледо око: образът се получава зад ретината, близката точка е далеч. Коригира се със събирателна леща. С възрастта лещата губи еластичност и близката точка се отдалечава (старческо далекогледство) – затова на 45–50 години мнозина започват да ползват очила за четене."
          />
          <EyeLab />
          <Example
            description="Близката точка на далекогледо око е на 50 cm. Какви очила му трябват, за да чете от 25 cm?"
            steps={["Книгата ($d = 25\\ \\mathrm{cm}$) трябва да има въображаем образ в близката точка: $d' = -50\\ \\mathrm{cm}$.", '$D = \\frac{1}{0{,}25} + \\frac{1}{-0{,}5} = 4 - 2 = +2\\ \\mathrm{dpt}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Оптични уреди</h2>
          <p className={text}>
            <strong>Фотоапаратът</strong> дава реален умален образ върху сензора; за да фокусира по-близки предмети, той отдалечава обектива
            от сензора. <strong>Проекторът</strong> поставя картината малко зад фокуса и дава реален, силно увеличен образ на екрана.{' '}
            <strong>Лупата</strong> е събирателна леща, към която доближаваме предмета по-близо от фокуса.
          </p>
          <Theorem
            title="Лупа и микроскоп"
            description="Лупата увеличава ъгъла, под който виждаме предмета, около $\Gamma \approx \frac{25\ \mathrm{cm}}{f}$ пъти (образ в безкрайност) или $1 + \frac{25\ \mathrm{cm}}{f}$ (образ на 25 cm). Микроскопът има две лещи: обективът дава реален увеличен междинен образ, а окулярът го разглежда като лупа. Общото увеличение е приблизително $M \approx \frac{L}{f_{\text{об}}} \cdot \frac{25\ \mathrm{cm}}{f_{\text{ок}}}$, където $L$ е оптичната дължина на тубуса."
          />
          <MicroscopeLab />
          <p className={text}>
            Телескопите също комбинират обектив и окуляр, но там предметът е безкрайно далеч – подробно в лекцията{' '}
            <Link to="/astronomy/lecture10" className={link}>
              Телескопи
            </Link>
            . Колкото и да увеличаваме, светлинният микроскоп не различава детайли, по-малки от около половин <Term id="wavelength">дължина на вълната</Term> –
            заради <Term id="diffraction">дифракцията</Term> (виж{' '}
            <Link to="/physics/optics/wave-optics" className={link}>
              Вълнова оптика
            </Link>
            ).
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 2,5, а отрицателните – с минус.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Лещите около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Диоптри от сантиметри', '$f = 20\\ \\mathrm{cm} \\Rightarrow D = \\frac{1}{20} = 0{,}05\\ \\mathrm{dpt}$', '$f = 0{,}2\\ \\mathrm{m} \\Rightarrow D = 5\\ \\mathrm{dpt}$'],
              ['Знак на въображаемия образ', "въображаемият образ има $d' > 0$", "$d' < 0$ – образът е от страната на предмета"],
              ['Разсейвателна леща', 'фокусното разстояние е положително', '$f < 0$ и $D < 0$'],
              ['Очила за късоглед', 'късогледите носят събирателни очила', 'разсейвателни: окото им събира лъчите твърде силно'],
              ['Половин закрита леща', 'ще се види половин образ', 'вижда се целият образ, но по-тъмен – всяка част от лещата дава целия образ'],
              ['Лупа', 'предметът се поставя зад фокуса', 'между лещата и фокуса – само тогава образът е прав и увеличен'],
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
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намерете оптичната сила на леща с $f = 20\ \mathrm{cm}$ и фокусното разстояние (в cm) на разсейвателна леща с $D = -4\ \mathrm{dpt}$." check={[5, -25]} ask={['$D$, dpt', '$f$, cm']}>
                <p><Tex>{'D = \\frac{1}{0{,}2} = 5\\ \\mathrm{dpt}'}</Tex></p>
                <p><Tex>{'f = \\frac{1}{-4} = -0{,}25\\ \\mathrm{m} = -25\\ \\mathrm{cm}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Предмет е на 30 cm от събирателна леща с $f = 10\ \mathrm{cm}$. Намерете разстоянието до образа и увеличението." check={[15, 0.5]} ask={["$d'$, cm", '$\\Gamma$']}>
                <p><Tex>{"\\frac{1}{d'} = \\frac{1}{10} - \\frac{1}{30} = \\frac{1}{15} \\Rightarrow d' = 15\\ \\mathrm{cm}"}</Tex></p>
                <p><Tex>{'\\Gamma = \\frac{15}{30} = 0{,}5'}</Tex> – образът е реален, обърнат и два пъти умален.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Долепваме събирателна леща от $+5\ \mathrm{dpt}$ и разсейвателна от $-2\ \mathrm{dpt}$. Каква е общата оптична сила и фокусното разстояние (в cm)?" check={[3, 33.3]} ask={['$D$, dpt', '$f$, cm']}>
                <p><Tex>{'D = 5 + (-2) = 3\\ \\mathrm{dpt}'}</Tex></p>
                <p><Tex>{'f = \\frac{1}{3}\\ \\mathrm{m} \\approx 33{,}3\\ \\mathrm{cm}'}</Tex> – системата е събирателна.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Монета е на 8 cm от лупа с $f = 12\ \mathrm{cm}$. Къде е образът и колко пъти е увеличен?" check={[-24, 3]} ask={["$d'$, cm", '$\\Gamma$']}>
                <p><Tex>{"\\frac{1}{d'} = \\frac{1}{12} - \\frac{1}{8} = -\\frac{1}{24} \\Rightarrow d' = -24\\ \\mathrm{cm}"}</Tex></p>
                <p><Tex>{'\\Gamma = \\frac{24}{8} = 3'}</Tex> – образът е въображаем, прав, три пъти увеличен, на 24 cm от лещата откъм монетата.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Предмет е на 30 cm от разсейвателна леща с $f = -15\ \mathrm{cm}$. Намерете $d'$ и увеличението." check={[-10, 0.333]} ask={["$d'$, cm", '$\\Gamma$']}>
                <p><Tex>{"\\frac{1}{d'} = -\\frac{1}{15} - \\frac{1}{30} = -\\frac{3}{30} = -\\frac{1}{10} \\Rightarrow d' = -10\\ \\mathrm{cm}"}</Tex></p>
                <p><Tex>{'\\Gamma = \\frac{10}{30} \\approx 0{,}333'}</Tex> – въображаем, прав, три пъти умален.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="С леща получаваме върху екран образ, три пъти по-голям от предмета. Разстоянието от предмета до екрана е 80 cm. Какво е фокусното разстояние?" check={[15]} ask={['$f$, cm']}>
                <p>Образът е реален: <Tex>{"d' = 3d"}</Tex> и <Tex>{"d + d' = 80"}</Tex>, откъдето <Tex>{"d = 20\\ \\mathrm{cm}"}</Tex>, <Tex>{"d' = 60\\ \\mathrm{cm}"}</Tex>.</p>
                <p><Tex>{'\\frac{1}{f} = \\frac{1}{20} + \\frac{1}{60} = \\frac{4}{60} \\Rightarrow f = 15\\ \\mathrm{cm}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Предмет и екран са на 90 cm един от друг. Между тях местим леща с $f = 20\ \mathrm{cm}$. При кои разстояния от предмета до лещата върху екрана се вижда рязък образ?" check={[30, 60]} ask={['по-близко положение, cm', 'по-далечно положение, cm']}>
                <p><Tex>{"d + d' = 90"}</Tex> и <Tex>{"\\frac{1}{d} + \\frac{1}{90 - d} = \\frac{1}{20}"}</Tex>, т.е. <Tex>{'d(90 - d) = 20 \\cdot 90'}</Tex>.</p>
                <p><Tex>{'d^2 - 90d + 1800 = 0 \\Rightarrow d = \\frac{90 \\pm 30}{2}'}</Tex>, т.е. <Tex>{'d = 30\\ \\mathrm{cm}'}</Tex> или <Tex>{'d = 60\\ \\mathrm{cm}'}</Tex>.</p>
                <p>Двете положения са симетрични – при едното образът е увеличен, при другото умален. Така (метод на Бесел) се мери фокусното разстояние: <Tex>{'f = \\frac{L^2 - a^2}{4L} = \\frac{8100 - 900}{360} = 20\\ \\mathrm{cm}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Късоглед човек има далечна точка на 50 cm и близка точка на 12 cm. Той носи очила от $-2\ \mathrm{dpt}$ (смятаме ги долепени до окото). Колко е близката му точка с очилата?" check={[15.8]} ask={['близка точка, cm']}>
                <p>С очилата виждаме предмета, ако лещата дава негов въображаем образ в близката точка: <Tex>{"d' = -12\\ \\mathrm{cm}"}</Tex>, <Tex>{'f = -50\\ \\mathrm{cm}'}</Tex>.</p>
                <p><Tex>{"\\frac{1}{d} = \\frac{1}{f} - \\frac{1}{d'} = -\\frac{1}{50} + \\frac{1}{12} = \\frac{19}{300}"}</Tex></p>
                <p><Tex>{'d = \\frac{300}{19} \\approx 15{,}8\\ \\mathrm{cm}'}</Tex> – очилата малко отдалечават близката точка, но тя остава удобна за четене.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Микроскоп има обектив с $f_1 = 5\ \mathrm{mm}$ и окуляр с $f_2 = 20\ \mathrm{mm}$ на 180 mm един от друг. Крайният образ е на 250 mm пред окуляра. На какво разстояние от обектива е предметът и колко е увеличението?" check={[5.16, 422]} ask={['разстояние, mm', 'увеличение']}>
                <p>Окулярът: <Tex>{"\\frac{1}{d_2} = \\frac{1}{20} + \\frac{1}{250} = \\frac{27}{500} \\Rightarrow d_2 \\approx 18{,}52\\ \\mathrm{mm}"}</Tex> – там е междинният образ.</p>
                <p>За обектива: <Tex>{"d_1' = 180 - 18{,}52 = 161{,}48\\ \\mathrm{mm}"}</Tex>, <Tex>{"\\frac{1}{d_1} = \\frac{1}{5} - \\frac{1}{161{,}48} \\Rightarrow d_1 \\approx 5{,}16\\ \\mathrm{mm}"}</Tex>.</p>
                <p><Tex>{'M = \\frac{161{,}48}{5{,}16} \\cdot \\frac{250}{18{,}52} \\approx 31{,}3 \\cdot 13{,}5 \\approx 422'}</Tex></p>
                <p>Приближената формула <Tex>{'\\frac{L}{f_1} \\cdot \\frac{250}{f_2} = \\frac{155}{5} \\cdot \\frac{250}{20} \\approx 388'}</Tex> дава същия порядък (тук <Tex>{'L = 180 - 5 - 20 = 155\\ \\mathrm{mm}'}</Tex>).</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Събирателните лещи са по-дебели в средата (<Tex>{'f > 0'}</Tex>), разсейвателните – по-тънки (<Tex>{'f < 0'}</Tex>)</li>
              <li>✓ Оптична сила <Tex>{'D = \\frac{1}{f}'}</Tex> в диоптри (f в метри); за долепени лещи <Tex>{'D = D_1 + D_2'}</Tex></li>
              <li>✓ <Tex>{"\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}"}</Tex>; <Tex>{"d' > 0"}</Tex> – реален обърнат образ, <Tex>{"d' < 0"}</Tex> – въображаем прав образ; <Tex>{"\\Gamma = \\frac{|d'|}{d}"}</Tex></li>
              <li>✓ Образът се построява с два от трите характерни лъча</li>
              <li>✓ Късогледство – разсейвателни очила <Tex>{'D = -\\frac{1}{a}'}</Tex>; далекогледство и старческо око – събирателни</li>
              <li>✓ Лупа <Tex>{'\\Gamma \\approx \\frac{25\\ \\mathrm{cm}}{f}'}</Tex>; микроскоп <Tex>{'M \\approx \\frac{L}{f_{\\text{об}}} \\cdot \\frac{25\\ \\mathrm{cm}}{f_{\\text{ок}}}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Около две трети от оптичната сила на окото (около 40 от 60 диоптъра) се дължат не на лещата, а на роговицата – границата
              въздух–око. Под вода роговицата почти престава да пречупва, защото водата има почти същия <Term id="refractive-index">показател на пречупване</Term> като окото.
              Затова без маска под водата виждаме всичко размазано, като силно далекогледи. Маската връща въздушния слой пред окото – и светът
              отново става рязък. Първите очила за четене, според повечето историци, се появяват в Италия около 80-те години на XIII век.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
