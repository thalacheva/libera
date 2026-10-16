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
import Term from '~/Term';
import { formulaTex, molarMass } from '../formula';
import GasDensityLab from './GasDensityLab';
import GasReactionLab from './GasReactionLab';
import MolarVolumeLab from './MolarVolumeLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const L = (v: number) => `${dec(v)}\\ \\mathrm{L}`;
const GASES = ['H2', 'He', 'N2', 'O2', 'CO2', 'CH4', 'NH3', 'Cl2'];
// Количества вещество в стотни от мола – така 22,4 · n е крайна десетична дроб
const AMOUNTS = [10, 20, 25, 50, 150, 200, 300];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0 || kind === 1) {
    const g = pick(GASES);
    const n100 = pick(AMOUNTS);
    const n = n100 / 100;
    const V = (224 * n100) / 1000;
    return kind === 0
      ? {
          tex: `n(${formulaTex(g)}) = ${dec(n)}\\ \\mathrm{mol}`,
          ask: 'Какъв обем заема при нормални условия? (в литри)',
          num: 224 * n100,
          den: 1000,
          steps: [`$V = n \\cdot V_m = ${dec(n)} \\cdot 22{,}4 = ${L(V)}$`],
        }
      : {
          tex: `V(${formulaTex(g)}) = ${L(V)}\\ \\text{(н.у.)}`,
          ask: 'Колко грама е газът?',
          num: n100 * molarMass(g),
          den: 100,
          steps: [`$n = \\frac{V}{V_m} = \\frac{${dec(V)}}{22{,}4} = ${dec(n)}\\ \\mathrm{mol}$`, `$m = n \\cdot M = ${dec(n)} \\cdot ${molarMass(g)} = ${dec(n * molarMass(g))}\\ \\mathrm{g}$`],
        };
  }
  if (kind === 2) {
    const D = pick([8, 14, 16, 17, 22, 35.5, 13, 15]);
    return {
      tex: `D_{\\mathrm{H_2}} = ${dec(D)}`,
      ask: 'Каква е моларната маса на газа в g/mol?',
      num: D * 2,
      den: 1,
      steps: [`$M = D_{\\mathrm{H_2}} \\cdot M(\\mathrm{H_2}) = ${dec(D)} \\cdot 2 = ${dec(2 * D)}\\ \\mathrm{g/mol}$`],
    };
  }
  if (kind === 3) {
    const [fuel, ratio, eq] = pick<[string, number, string]>([
      ['CH4', 2, '\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}'],
      ['H2', 0.5, '\\mathrm{2H_2 + O_2 \\to 2H_2O}'],
      ['CO', 0.5, '\\mathrm{2CO + O_2 \\to 2CO_2}'],
      ['C3H8', 5, '\\mathrm{C_3H_8 + 5O_2 \\to 3CO_2 + 4H_2O}'],
      ['C2H6', 3.5, '\\mathrm{2C_2H_6 + 7O_2 \\to 4CO_2 + 6H_2O}'],
    ]);
    const V = pick([4, 6, 10, 20, 50]);
    return {
      tex: eq,
      ask: `Колко литра кислород са нужни за изгарянето на ${V} L ${fuel.replace(/(\d)/g, (d: string) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])}? (при еднакви условия)`,
      num: V * ratio * 2,
      den: 2,
      steps: [`Обемите на газовете се отнасят като коефициентите: на 1 L ${fuel.replace(/(\d)/g, (d: string) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])} се падат ${dec(ratio)} L кислород.`, `$V(\\mathrm{O_2}) = ${V} \\cdot ${dec(ratio)} = ${L(V * ratio)}$`],
    };
  }
  // Средна моларна маса на смес от два газа по обемните части
  const [g1, g2] = pick([
    ['H2', 'O2'],
    ['CO2', 'N2'],
    ['He', 'O2'],
    ['CH4', 'CO2'],
    ['N2', 'O2'],
  ]);
  const phi = pick([20, 25, 40, 50, 75]);
  const [M1, M2] = [molarMass(g1), molarMass(g2)];
  return {
    tex: `${phi}\\%\\ ${formulaTex(g1)} + ${100 - phi}\\%\\ ${formulaTex(g2)}`,
    ask: 'Средна моларна маса на сместа (обемни части), g/mol?',
    num: phi * M1 + (100 - phi) * M2,
    den: 100,
    steps: [`$\\bar{M} = \\varphi_1 M_1 + \\varphi_2 M_2 = ${dec(phi / 100)} \\cdot ${M1} + ${dec(1 - phi / 100)} \\cdot ${M2} = ${dec((phi * M1 + (100 - phi) * M2) / 100)}\\ \\mathrm{g/mol}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🎈 Балон с хелий',
    problem: 'Балон съдържа 11,2 L хелий (обемът е приведен към нормални условия). Колко грама е хелият и колко грама е въздухът със същия обем? С колко грама балонът е по-лек от изместения въздух?',
    solution: ['$n = \\frac{11{,}2}{22{,}4} = 0{,}5\\ \\mathrm{mol}$; $m(\\mathrm{He}) = 0{,}5 \\cdot 4 = 2\\ \\mathrm{g}$', 'Въздух: $0{,}5 \\cdot 29 = 14{,}5\\ \\mathrm{g}$', 'Разликата е $12{,}5\\ \\mathrm{g}$ – балонът може да вдигне гумата и връвта си, ако те са по-леки от това.'],
    answer: '$2\\ \\mathrm{g}$, $12{,}5\\ \\mathrm{g}$',
    check: [2, 12.5],
    ask: ['хелий, g', 'разлика, g'],
  },
  {
    title: '🚗 Въздушна възглавница',
    problem: 'В по-старите въздушни възглавници при удар се разлага натриев азид: 2NaN₃ → 2Na + 3N₂. Какъв обем азот дават 65 g NaN₃ при 25 °C и 101,3 kPa?',
    solution: ['$M(\\mathrm{NaN_3}) = 23 + 3 \\cdot 14 = 65\\ \\mathrm{g/mol}$, значи $n = 1\\ \\mathrm{mol}$', 'По уравнението: $n(\\mathrm{N_2}) = \\frac{3}{2} \\cdot 1 = 1{,}5\\ \\mathrm{mol}$', '$V = \\frac{nRT}{p} = \\frac{1{,}5 \\cdot 8{,}314 \\cdot 298}{101{,}3} \\approx 36{,}7\\ \\mathrm{L}$ – колкото голяма възглавница. Получилият се натрий се обезврежда с други добавки в патрона.'],
    answer: '$\\approx 36{,}7\\ \\mathrm{L}$',
    check: [36.7],
    ask: ['азот, L'],
  },
  {
    title: '🔥 Пропан за котлона',
    problem: 'Пропанът гори по уравнението C₃H₈ + 5O₂ → 3CO₂ + 4H₂O. Колко литра въздух (21% кислород по обем) са нужни, за да изгорят 2 L пропан при същите условия?',
    solution: ['$V(\\mathrm{O_2}) = 5 \\cdot 2 = 10\\ \\mathrm{L}$', '$V_{\\text{въздух}} = \\frac{10}{0{,}21} \\approx 47{,}6\\ \\mathrm{L}$ – почти 24 пъти повече от горивото. Затова печките и котлоните се нуждаят от добро проветряване.'],
    answer: '$\\approx 47{,}6\\ \\mathrm{L}$',
    check: [47.6],
    ask: ['въздух, L'],
  },
  {
    title: '🫁 Колко CO₂ издишваме',
    problem: 'В покой вдишваме около 0,5 L въздух 15 пъти в минута, а издишаният въздух съдържа около 4% CO₂ по обем. Колко грама CO₂ издишваме за час? (Приемете, че обемите са при нормални условия.)',
    solution: ['За час: $0{,}5 \\cdot 15 \\cdot 60 = 450\\ \\mathrm{L}$ въздух, от които $0{,}04 \\cdot 450 = 18\\ \\mathrm{L}$ CO₂', '$n = \\frac{18}{22{,}4} \\approx 0{,}804\\ \\mathrm{mol}$, $m = 0{,}804 \\cdot 44 \\approx 35{,}4\\ \\mathrm{g}$', 'За денонощие това е около 850 g – оценката е груба, но порядъкът е верен: човек издишва около килограм CO₂ на ден.'],
    answer: '$\\approx 35{,}4\\ \\mathrm{g}$',
    check: [35.4],
    ask: ['CO₂, g'],
  },
  {
    title: '🏭 Кислородна бутилка',
    problem: 'Стоманена бутилка с вместимост 40 L съдържа кислород под налягане 15 MPa при 20 °C. Колко кубични метра кислород ще се получат при нормални условия? (Пресметнете като за идеален газ.)',
    solution: ['$n = \\frac{pV}{RT} = \\frac{15 \\cdot 10^6 \\cdot 0{,}040}{8{,}314 \\cdot 293} \\approx 246\\ \\mathrm{mol}$', '$V_0 = n \\cdot V_m \\approx 246 \\cdot 22{,}4 \\approx 5510\\ \\mathrm{L} \\approx 5{,}51\\ \\mathrm{m^3}$', 'При такова високо налягане реалният газ се отклонява малко от идеалния, затова резултатът е приблизителен.'],
    answer: '$\\approx 5{,}51\\ \\mathrm{m^3}$',
    check: [5.51],
    ask: ['кислород, m³'],
  },
  {
    title: '🌍 Колко „тежи“ мол въздух',
    problem: 'Сухият въздух съдържа около 78% азот, 21% кислород и 1% аргон по обем. Каква е средната му моларна маса?',
    solution: ['Обемните части на газовете са равни на моловите им части.', '$\\bar{M} = 0{,}78 \\cdot 28 + 0{,}21 \\cdot 32 + 0{,}01 \\cdot 40 = 21{,}84 + 6{,}72 + 0{,}40 = 28{,}96\\ \\mathrm{g/mol}$', 'Затова в задачите се използва $M_{\\text{въздух}} \\approx 29\\ \\mathrm{g/mol}$.'],
    answer: '$\\approx 29{,}0\\ \\mathrm{g/mol}$',
    check: [28.96],
    ask: ['средна моларна маса, g/mol'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какъв обем заема 1 mol от който и да е газ при нормални условия?',
    answers: ['$22{,}4\\ \\mathrm{L}$', '$1\\ \\mathrm{L}$', '$2{,}24\\ \\mathrm{L}$', '$6{,}02 \\cdot 10^{23}\\ \\mathrm{L}$'],
    correctAnswer: '$22{,}4\\ \\mathrm{L}$',
  },
  {
    question: 'В два еднакви балона при еднакви условия има водород и въглероден диоксид. Какво е еднакво?',
    answers: ['броят на молекулите', 'масата на газа', 'плътността на газа', 'нищо'],
    correctAnswer: 'броят на молекулите',
  },
  {
    question: 'Кой от тези газове е по-лек от въздуха?',
    answers: ['$\\mathrm{NH_3}$', '$\\mathrm{CO_2}$', '$\\mathrm{Cl_2}$', '$\\mathrm{O_2}$'],
    correctAnswer: '$\\mathrm{NH_3}$',
  },
  {
    question: 'Относителната плътност на газ спрямо водорода е 16. Каква е моларната му маса?',
    answers: ['$32\\ \\mathrm{g/mol}$', '$16\\ \\mathrm{g/mol}$', '$8\\ \\mathrm{g/mol}$', '$64\\ \\mathrm{g/mol}$'],
    correctAnswer: '$32\\ \\mathrm{g/mol}$',
  },
  {
    question: 'По уравнението $\\mathrm{2H_2 + O_2 \\to 2H_2O}$ с колко литра кислород реагират 10 L водород (при еднакви условия)?',
    answers: ['$5\\ \\mathrm{L}$', '$10\\ \\mathrm{L}$', '$20\\ \\mathrm{L}$', '$2{,}5\\ \\mathrm{L}$'],
    correctAnswer: '$5\\ \\mathrm{L}$',
  },
  {
    question: 'Колко мола са 4,48 L въглероден диоксид при нормални условия?',
    answers: ['$0{,}2\\ \\mathrm{mol}$', '$0{,}1\\ \\mathrm{mol}$', '$2\\ \\mathrm{mol}$', '$4{,}48\\ \\mathrm{mol}$'],
    correctAnswer: '$0{,}2\\ \\mathrm{mol}$',
  },
  {
    question: 'Каква е приблизително обемната част на кислорода във въздуха?',
    answers: ['$21\\%$', '$78\\%$', '$50\\%$', '$1\\%$'],
    correctAnswer: '$21\\%$',
  },
  {
    question: 'Каква е средната моларна маса на смес от равни обеми водород и кислород?',
    answers: ['$17\\ \\mathrm{g/mol}$', '$34\\ \\mathrm{g/mol}$', '$16\\ \\mathrm{g/mol}$', '$30\\ \\mathrm{g/mol}$'],
    correctAnswer: '$17\\ \\mathrm{g/mol}$',
  },
  {
    question: 'Какво означава „нормални условия“ в училищните задачи по химия?',
    answers: ['$0\\ ^\\circ\\mathrm{C}$ и $101{,}3\\ \\mathrm{kPa}$', '$25\\ ^\\circ\\mathrm{C}$ и $100\\ \\mathrm{kPa}$', '$20\\ ^\\circ\\mathrm{C}$ и $101{,}3\\ \\mathrm{kPa}$', '$100\\ ^\\circ\\mathrm{C}$ и $101{,}3\\ \\mathrm{kPa}$'],
    correctAnswer: '$0\\ ^\\circ\\mathrm{C}$ и $101{,}3\\ \\mathrm{kPa}$',
  },
];

// ---------- Страница ----------

const CONDITIONS: [string, string, string, string][] = [
  ['нормални условия (в училищните задачи)', '0', '101{,}325', '22{,}4'],
  ['стандартни условия по IUPAC (от 1982 г.)', '0', '100', '22{,}7'],
  ['стайна температура', '25', '101{,}325', '24{,}5'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Gases() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Газове в химията</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            💨 През 1808 г. Жозеф Луи Гей-Люсак забелязва нещо странно: газовете реагират в прости обемни отношения. Два обема водород и един
            обем кислород дават два обема водна пара – не три! Три години по-късно Амедео Авогадро предлага смело обяснение: при еднакви
            условия еднакви обеми газове съдържат <strong>еднакъв брой молекули</strong>, а молекулите на водорода и кислорода са от по два
            атома. Почти никой не му обръща внимание. Едва през 1860 г., след смъртта на Авогадро, Станислао Каницаро убеждава химиците на
            конгреса в Карлсруе, че идеята е вярна – и тя става основата на атомните маси и на моларния обем.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Законът на Авогадро</h2>
          <Theorem
            title="Закон на Авогадро"
            description="При еднакви температура и налягане равни обеми от различни газове съдържат еднакъв брой молекули. Следователно при еднакви условия обемите на газовете се отнасят като техните количества вещество: $\frac{V_1}{V_2} = \frac{n_1}{n_2}$."
          />
          <p className={text}>
            Защо това важи за всички газове? В газа молекулите са далеч една от друга – собственият им размер е малка част от обема, а
            налягането зависи само от броя и скоростта им. Физиката изразява това с{' '}
            <Term id="ideal-gas-law">уравнението на състоянието</Term> <Tex>{'pV = nRT'}</Tex> – подробно в урока{' '}
            <Link to="/physics/heat/ideal-gas" className={link}>
              Идеален газ
            </Link>
            . В него няма нищо, което зависи от вида на газа. С течностите и твърдите вещества е друго: <Term id="mole">мол</Term> вода заема 18 mL, а мол желязо –
            около 7 mL.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Моларен обем</h2>
          <Theorem
            type="definition"
            title="Моларен обем"
            description="Моларният обем е обемът на един мол газ: $V_m = \frac{V}{n}$. При нормални условия ($0\ ^\circ\mathrm{C}$ и $101{,}325\ \mathrm{kPa}$) той е еднакъв за всички газове и е $V_m \approx 22{,}4\ \mathrm{L/mol}$. Оттук $n = \frac{V}{V_m}$."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Условия</th>
                  <th className={th}>
                    <Tex>{'t,\\ ^\\circ\\mathrm{C}'}</Tex>
                  </th>
                  <th className={th}>
                    <Tex>{'p,\\ \\mathrm{kPa}'}</Tex>
                  </th>
                  <th className={th}>
                    <Tex>{'V_m,\\ \\mathrm{L/mol}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONDITIONS.map(([name, t, p, vm]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{t}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{p}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{vm}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            В задачите винаги проверявай при какви условия е даден обемът. Ако нищо не е казано, в училищните задачи обикновено се приема, че
            той е при нормални условия (н.у.) и <Tex>{'V_m = 22{,}4\\ \\mathrm{L/mol}'}</Tex>.
          </p>
          <Example
            description="Колко мола, колко грама и колко молекули са 5,6 L кислород при нормални условия?"
            steps={[
              '$n = \\frac{V}{V_m} = \\frac{5{,}6}{22{,}4} = 0{,}25\\ \\mathrm{mol}$',
              '$m = n \\cdot M = 0{,}25 \\cdot 32 = 8\\ \\mathrm{g}$',
              '$N = n \\cdot N_A = 0{,}25 \\cdot 6{,}02 \\cdot 10^{23} \\approx 1{,}51 \\cdot 10^{23}$ молекули',
            ]}
          />
          <MolarVolumeLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Плътност и относителна плътност на газ</h2>
          <p className={text}>
            Един мол газ има маса <Tex>{'M'}</Tex> и при нормални условия заема 22,4 L. Значи плътността му е{' '}
            <Tex>{'\\rho = \\frac{M}{V_m}'}</Tex>: за въздуха около 1,29 g/L, за водорода – само 0,089 g/L.
          </p>
          <Theorem
            type="definition"
            title="Относителна плътност"
            description="Относителната плътност на газа X спрямо газа Y показва колко пъти X е по-плътен от Y при еднакви условия. Тя е равна на отношението на моларните им маси: $D_{\mathrm{Y}}(\mathrm{X}) = \frac{\rho(\mathrm{X})}{\rho(\mathrm{Y})} = \frac{M(\mathrm{X})}{M(\mathrm{Y})}$. Най-често се дава спрямо водорода ($M = 2\ \mathrm{g/mol}$) или спрямо въздуха ($\bar{M} \approx 29\ \mathrm{g/mol}$)."
          />
          <Example
            description="Плътността на газ спрямо водорода е 22. Каква е моларната му маса и кой може да е газът?"
            steps={[
              '$M = 22 \\cdot 2 = 44\\ \\mathrm{g/mol}$',
              'Такава моларна маса имат и $\\mathrm{CO_2}$, и $\\mathrm{N_2O}$, и пропанът $\\mathrm{C_3H_8}$! Само по плътността не можем да ги различим – трябват и други данни (например състав по маса).',
            ]}
          />
          <GasDensityLab />
          <p className={text}>
            Газове, по-тежки от въздуха, се събират ниско – в мазета, кладенци и ями. Така въглеродният диоксид може да се натрупа в стари
            кладенци и винарски изби, а пропан-бутанът от теч в газова уредба се стича към пода.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Газови смеси</h2>
          <Theorem
            type="definition"
            title="Обемна част и средна моларна маса"
            description="Обемната част на газа X в сместа е $\varphi(\mathrm{X}) = \frac{V(\mathrm{X})}{V_{\text{смес}}}$. По закона на Авогадро тя е равна и на моловата му част: $\varphi(\mathrm{X}) = \frac{n(\mathrm{X})}{n_{\text{смес}}}$. Средната моларна маса на сместа е $\bar{M} = \varphi_1 M_1 + \varphi_2 M_2 + \ldots$"
          />
          <Example
            description="Смес от въглероден оксид CO и въглероден диоксид CO₂ има средна моларна маса 36 g/mol. Каква е обемната част на всеки газ?"
            steps={[
              'Нека $\\varphi(\\mathrm{CO_2}) = x$. Тогава $\\varphi(\\mathrm{CO}) = 1 - x$.',
              '$44x + 28(1 - x) = 36 \\Rightarrow 16x = 8 \\Rightarrow x = 0{,}5$',
              'Газовете са по 50% от обема. Внимание: по маса $\\mathrm{CO_2}$ е повече – $\\frac{0{,}5 \\cdot 44}{36} \\approx 61\\%$.',
            ]}
          />
          <Theorem
            title="Закон на Далтон (за напреднали)"
            description="Всеки газ в сместа създава свое парциално налягане – налягането, което би имал, ако сам заемаше целия съд. Общото налягане е сборът им: $p = p_1 + p_2 + \ldots$, а $p_i = \varphi_i \cdot p$. Например в атмосферата при $101\ \mathrm{kPa}$ парциалното налягане на кислорода е около $21\ \mathrm{kPa}$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Обемни отношения в реакциите</h2>
          <Theorem
            title="Закон на Гей-Люсак за обемните отношения"
            description="Обемите на реагиращите и получените газове, измерени при едни и същи условия, се отнасят като малки цели числа – коефициентите пред тях в уравнението. Например в $\mathrm{N_2 + 3H_2 \to 2NH_3}$ на 1 L азот се падат 3 L водород и се получават 2 L амоняк."
          />
          <p className={text}>
            Това е пряко следствие от закона на Авогадро: коефициентите показват отношението на моловете (виж{' '}
            <Link to="/chemistry/quantities/stoichiometry" className={link}>
              Химични уравнения и стехиометрия
            </Link>
            ), а за газове моловете се отнасят като обемите. Затова при задачи само с газове можем да смятаме направо с литри, без да минаваме
            през молове.
          </p>
          <Example
            description="Колко литра кислород и колко литра въздух са нужни за изгарянето на 10 L метан? Колко литра CO₂ се получават? (Всички обеми – при еднакви условия, водата се кондензира.)"
            steps={[
              '$\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}$',
              '$V(\\mathrm{O_2}) = 2 \\cdot 10 = 20\\ \\mathrm{L}$, $V(\\mathrm{CO_2}) = 10\\ \\mathrm{L}$',
              'Въздух: $\\frac{20}{0{,}21} \\approx 95{,}2\\ \\mathrm{L}$',
              'Водата при стайна температура е течност и обемът ѝ практически не се брои – затова общият обем на газовете намалява.',
            ]}
          />
          <GasReactionLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Газове при други условия</h2>
          <p className={text}>
            Ако газът не е при нормални условия, <Term id="amount-of-substance">количеството вещество</Term> намираме от уравнението на Клапейрон–Менделеев. В химията е удобно
            налягането да е в kPa, а обемът – в литри: тогава <Tex>{'R = 8{,}314\\ \\mathrm{kPa \\cdot L/(mol \\cdot K)}'}</Tex> (същото число, защото{' '}
            <Tex>{'1\\ \\mathrm{kPa \\cdot L} = 1\\ \\mathrm{J}'}</Tex>).
          </p>
          <Theorem
            title="Количество газ при произволни условия"
            description="$n = \frac{pV}{RT}$, като температурата винаги е в келвини: $T = t + 273$. Друг начин: да приведем обема към нормални условия с $\frac{p V}{T} = \frac{p_0 V_0}{T_0}$ и после $n = \frac{V_0}{22{,}4}$."
          />
          <Example
            description="Колко литра въглероден диоксид при 25 °C и 101,3 kPa се отделят при действието на солна киселина на 50 g калциев карбонат? ($\mathrm{CaCO_3 + 2HCl \to CaCl_2 + H_2O + CO_2}$)"
            steps={[
              `$M(\\mathrm{CaCO_3}) = ${molarMass('CaCO3')}\\ \\mathrm{g/mol}$, $n = \\frac{50}{100} = 0{,}5\\ \\mathrm{mol}$; толкова мола $\\mathrm{CO_2}$`,
              '$V = \\frac{nRT}{p} = \\frac{0{,}5 \\cdot 8{,}314 \\cdot 298}{101{,}3} \\approx 12{,}2\\ \\mathrm{L}$',
              'При нормални условия щяха да са $0{,}5 \\cdot 22{,}4 = 11{,}2\\ \\mathrm{L}$ – при по-висока температура газът заема повече място.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Обем при нормални условия, маса, <Term id="molar-mass">моларна маса</Term> от относителна плътност, обеми по уравнение и средна моларна маса. Десетичните отговори въвеждай като 5,6.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Газовете около нас</h2>
          <p className={text}>Балони, въздушни възглавници, газови котлони и собственото ни дишане – навсякъде има газови изчисления.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['22,4 L винаги', '1 mol газ при 25 °C заема 22,4 L.', '22,4 L е само при 0 °C и 101,3 kPa; при 25 °C е около 24,5 L.'],
              ['Моларен обем на течност', '1 mol вода заема 22,4 L.', 'Моларният обем 22,4 L е само за газове; мол течна вода е 18 mL.'],
              ['Температура в градуси', '$n = \\frac{pV}{R \\cdot 25}$ при 25 °C', '$T = 25 + 273 = 298\\ \\mathrm{K}$ – винаги в келвини'],
              ['Обемна и масова част', 'Щом $\\varphi = 50\\%$, и масите са равни.', 'Обемната част е моловата част; по маса по-тежкият газ е повече.'],
              ['Водата като газ', 'След изгаряне на водород в спринцовката остава водна пара.', 'При стайна температура водата се кондензира – обемът ѝ не се брои.'],
              ['Обемите по уравнението', '$\\mathrm{2H_2 + O_2}$: 10 L водород реагират с 10 L кислород.', 'Обемите се отнасят като коефициентите: 10 L водород – 5 L кислород.'],
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
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко мола и колко грама са 8,96 L метан $\mathrm{CH_4}$ при нормални условия?" check={[0.4, 6.4]} ask={['$n$, mol', '$m$, g']}>
                <p><Tex>{'n = \\frac{8{,}96}{22{,}4} = 0{,}4\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m = 0{,}4 \\cdot 16 = 6{,}4\\ \\mathrm{g}'}</Tex></p>
                <p>Броят на молекулите е <Tex>{'0{,}4 \\cdot 6{,}02 \\cdot 10^{23} \\approx 2{,}41 \\cdot 10^{23}'}</Tex>.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Относителната плътност на газ спрямо въздуха е 1,52. Каква е моларната му маса? Посочете поне два газа с такава моларна маса." check={[44.1]} ask={['$M$, g/mol']}>
                <p><Tex>{'M = 1{,}52 \\cdot 29 \\approx 44{,}1\\ \\mathrm{g/mol}'}</Tex></p>
                <p>Моларна маса около 44 g/mol имат <Tex>{'\\mathrm{CO_2}'}</Tex>, <Tex>{'\\mathrm{N_2O}'}</Tex> и пропанът <Tex>{'\\mathrm{C_3H_8}'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко литра кислород са нужни за изгарянето на 15 L метан и колко литра $\mathrm{CO_2}$ се получават? (Обемите са при еднакви условия.)" check={[30, 15]} ask={['$\\mathrm{O_2}$, L', '$\\mathrm{CO_2}$, L']}>
                <p><Tex>{'\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}'}</Tex></p>
                <p><Tex>{'V(\\mathrm{O_2}) = 2 \\cdot 15 = 30\\ \\mathrm{L}'}</Tex>, <Tex>{'V(\\mathrm{CO_2}) = 15\\ \\mathrm{L}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Смес от CO и $\mathrm{CO_2}$ има средна моларна маса 32 g/mol. Каква е обемната част на $\mathrm{CO_2}$ в сместа?" check={[25]} ask={['$\\varphi(\\mathrm{CO_2})$, %']}>
                <p><Tex>{'44x + 28(1 - x) = 32 \\Rightarrow 16x = 4 \\Rightarrow x = 0{,}25'}</Tex></p>
                <p><Tex>{'\\varphi(\\mathrm{CO_2}) = 25\\%'}</Tex>, а <Tex>{'\\varphi(\\mathrm{CO}) = 75\\%'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В еудиометър (стъклена тръба за газове) смесват 20 mL водород и 20 mL кислород и ги взривяват с искра. Сместа се охлажда до стайна температура. Какъв газ и колко милилитра остават?" check={[10]} ask={['останал газ, mL']}>
                <p><Tex>{'\\mathrm{2H_2 + O_2 \\to 2H_2O}'}</Tex>: 20 mL водород реагират с 10 mL кислород.</p>
                <p>Остават <Tex>{'20 - 10 = 10\\ \\mathrm{mL}'}</Tex> кислород, а водата се кондензира.</p>
                <p>Обемът намалява от 40 mL на 10 mL – с три четвърти.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко литра $\mathrm{CO_2}$ при 25 °C и 101,3 kPa се отделят при действието на солна киселина на 50 g $\mathrm{CaCO_3}$?" check={[12.2]} ask={['$V$, L']}>
                <p><Tex>{'n(\\mathrm{CO_2}) = n(\\mathrm{CaCO_3}) = \\frac{50}{100} = 0{,}5\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'V = \\frac{nRT}{p} = \\frac{0{,}5 \\cdot 8{,}314 \\cdot 298}{101{,}3} \\approx 12{,}2\\ \\mathrm{L}'}</Tex></p>
                <p>Същият отговор дава <Tex>{'V = n \\cdot V_m'}</Tex> с <Tex>{'V_m = 24{,}5\\ \\mathrm{L/mol}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="20 mL смес от метан $\mathrm{CH_4}$ и етан $\mathrm{C_2H_6}$ изгаря в излишък кислород. Получават се 30 mL $\mathrm{CO_2}$ (всички обеми – при еднакви условия, водата е кондензирана). Каква е обемната част на метана и колко милилитра кислород са изразходвани?" check={[50, 55]} ask={['$\\varphi(\\mathrm{CH_4})$, %', '$\\mathrm{O_2}$, mL']}>
                <p>Нека метанът е <Tex>{'x'}</Tex> mL, а етанът – <Tex>{'y'}</Tex> mL. От всеки мол метан се получава 1 mol <Tex>{'\\mathrm{CO_2}'}</Tex>, от етан – 2 mol.</p>
                <p><Tex>{'x + y = 20,\\quad x + 2y = 30 \\Rightarrow y = 10,\\ x = 10'}</Tex> – по 50%.</p>
                <p><Tex>{'\\mathrm{CH_4 + 2O_2}'}</Tex> и <Tex>{'\\mathrm{2C_2H_6 + 7O_2}'}</Tex>: <Tex>{'V(\\mathrm{O_2}) = 2 \\cdot 10 + 3{,}5 \\cdot 10 = 55\\ \\mathrm{mL}'}</Tex>.</p>
                <p>Така в миналото са определяли състава на природния газ – с еудиометър, само чрез измерване на обеми.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Въглеводород има относителна плътност спрямо водорода 21, а масовата част на въглерода в него е 85,7%. Намерете моларната му маса и броя на въглеродните атоми в молекулата. Каква е формулата?" check={[42, 3]} ask={['$M$, g/mol', 'брой C атоми']}>
                <p><Tex>{'M = 21 \\cdot 2 = 42\\ \\mathrm{g/mol}'}</Tex></p>
                <p>Маса на въглерода в мол: <Tex>{'0{,}857 \\cdot 42 \\approx 36\\ \\mathrm{g}'}</Tex>, т.е. <Tex>{'36 : 12 = 3'}</Tex> атома C.</p>
                <p>Водородът е <Tex>{'42 - 36 = 6\\ \\mathrm{g}'}</Tex> – 6 атома. Формулата е <Tex>{'\\mathrm{C_3H_6}'}</Tex> (пропен или циклопропан).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="В стоманен съд с обем 10 L при 25 °C има 8 g кислород и 14 g азот. Какво е общото налягане и какво е парциалното налягане на кислорода (в kPa)?" check={[186, 62]} ask={['$p$, kPa', '$p(\\mathrm{O_2})$, kPa']}>
                <p><Tex>{'n(\\mathrm{O_2}) = \\frac{8}{32} = 0{,}25\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{N_2}) = \\frac{14}{28} = 0{,}5\\ \\mathrm{mol}'}</Tex>, общо <Tex>{'0{,}75\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'p = \\frac{nRT}{V} = \\frac{0{,}75 \\cdot 8{,}314 \\cdot 298}{10} \\approx 186\\ \\mathrm{kPa}'}</Tex></p>
                <p><Tex>{'p(\\mathrm{O_2}) = \\varphi(\\mathrm{O_2}) \\cdot p = \\frac{0{,}25}{0{,}75} \\cdot 186 \\approx 62{,}0\\ \\mathrm{kPa}'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Закон на Авогадро: при еднакви условия равни обеми газове съдържат еднакъв брой молекули</li>
              <li>✓ Моларен обем <Tex>{'V_m = V/n'}</Tex>; при нормални условия (0 °C, 101,3 kPa) <Tex>{'V_m = 22{,}4\\ \\mathrm{L/mol}'}</Tex>, при 25 °C – около 24,5 L/mol</li>
              <li>✓ Плътност на газ <Tex>{'\\rho = M/V_m'}</Tex>; относителна плътност <Tex>{'D = M_1/M_2'}</Tex>, спрямо водорода <Tex>{'M = 2D'}</Tex>, спрямо въздуха <Tex>{'M = 29D'}</Tex></li>
              <li>✓ В газова смес обемната част е равна на моловата; <Tex>{'\\bar{M} = \\sum \\varphi_i M_i'}</Tex></li>
              <li>✓ Обемите на газовете в реакция (при еднакви условия) се отнасят като коефициентите</li>
              <li>✓ При други условия: <Tex>{'n = \\frac{pV}{RT}'}</Tex> с <Tex>{'T'}</Tex> в келвини</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Серен хексафлуорид <Tex>{'\\mathrm{SF_6}'}</Tex> е около 5 пъти по-плътен от въздуха (<Tex>{'M = 146\\ \\mathrm{g/mol}'}</Tex>). В
              аквариум, пълен с него, лодка от алуминиево фолио плава „във въздуха“, а ако го вдишаш, гласът ти става плътен и нисък – обратното
              на хелия. Опитът не е безопасен за повторение: тежкият газ може да остане в дробовете и да измести кислорода.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
