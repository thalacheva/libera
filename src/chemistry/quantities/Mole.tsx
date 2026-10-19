import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, pick } from '~/drill';
import Trainer from '~/Trainer';
import { formulaTex, molarMass, parseFormula } from '../formula';
import CountingByWeighingLab from './CountingByWeighingLab';
import EmpiricalFormulaLab from './EmpiricalFormulaLab';
import MolarMassLab from './MolarMassLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const tex = (f: string) => formulaTex(f);

// Съединения с цяла моларна маса (при закръглените атомни маси)
const WHOLE = ['H2O', 'CO2', 'H2SO4', 'CaCO3', 'NaOH', 'HNO3', 'NH3', 'CH4', 'MgO', 'SO2', 'SO3', 'Fe2O3', 'O2', 'N2', 'C6H12O6', 'Ca(OH)2'];
const ANY = [...WHOLE, 'NaCl', 'HCl', 'CuSO4', 'Al2O3', 'KMnO4', 'NH4NO3', 'Na2CO3'];
// Масови части с крайни десетични дроби
const FRACTIONS: [string, string][] = [
  ['Fe2O3', 'Fe'],
  ['CaCO3', 'Ca'],
  ['CaCO3', 'O'],
  ['MgO', 'Mg'],
  ['SO2', 'S'],
  ['SO3', 'O'],
  ['NaOH', 'Na'],
  ['NaOH', 'H'],
  ['CH4', 'C'],
  ['CH4', 'H'],
  ['NH4NO3', 'N'],
  ['NH4NO3', 'O'],
];
const SCHOOL_A: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, S: 32, Ca: 40, Fe: 56 };

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5]);
  if (kind === 0) {
    const f = pick(ANY);
    const M = molarMass(f);
    const parts = [...parseFormula(f)];
    return {
      tex: `M(${tex(f)}) = ?`,
      ask: 'Моларната маса в g/mol?',
      num: Math.round(M * 10),
      den: 10,
      steps: [
        `Събираме атомните маси: $${parts.map(([el, n]) => `${n > 1 ? `${n} \\cdot ` : ''}A_r(\\mathrm{${el}})`).join(' + ')}$`,
        `$M = ${dec(M)}\\ \\mathrm{g/mol}$`,
      ],
    };
  }
  if (kind === 1 || kind === 2) {
    const f = pick(WHOLE);
    const M = molarMass(f);
    const n = pick([0.1, 0.2, 0.25, 0.5, 1.5, 2, 3]);
    const m = n * M;
    return kind === 1
      ? {
          tex: `m = ${dec(m)}\\ \\mathrm{g}\\ ${tex(f)}`,
          ask: 'Колко мола е това?',
          num: Math.round(n * 100),
          den: 100,
          steps: [`$M(${tex(f)}) = ${M}\\ \\mathrm{g/mol}$`, `$n = \\frac{m}{M} = \\frac{${dec(m)}}{${M}} = ${dec(n)}\\ \\mathrm{mol}$`],
        }
      : {
          tex: `n = ${dec(n)}\\ \\mathrm{mol}\\ ${tex(f)}`,
          ask: 'Каква е масата в грамове?',
          num: Math.round(m * 100),
          den: 100,
          steps: [`$M(${tex(f)}) = ${M}\\ \\mathrm{g/mol}$`, `$m = n \\cdot M = ${dec(n)} \\cdot ${M} = ${dec(m)}\\ \\mathrm{g}$`],
        };
  }
  if (kind === 3) {
    const n = pick([0.25, 0.5, 1.5, 2, 3, 5]);
    return {
      tex: `n = ${dec(n)}\\ \\mathrm{mol},\\ N_A \\approx 6{,}02 \\cdot 10^{23}`,
      ask: 'Колко частици? Отговори с числото пред 10²³.',
      num: Math.round(n * 4 * 602),
      den: 400,
      steps: [`$N = n \\cdot N_A = ${dec(n)} \\cdot 6{,}02 \\cdot 10^{23} = ${dec(n * 6.02)} \\cdot 10^{23}$`],
    };
  }
  if (kind === 4) {
    const [f, el] = pick(FRACTIONS);
    const count = parseFormula(f).get(el)!;
    const part = count * SCHOOL_A[el];
    const M = molarMass(f);
    return {
      tex: `w(\\mathrm{${el}})\\ \\text{в}\\ ${tex(f)}`,
      ask: 'Масовата част в проценти?',
      num: part * 100,
      den: M,
      steps: [`$M(${tex(f)}) = ${M}\\ \\mathrm{g/mol}$`, `$w = \\frac{${count > 1 ? `${count} \\cdot ` : ''}${SCHOOL_A[el]}}{${M}} \\cdot 100\\% = ${dec((part * 100) / M)}\\%$`],
    };
  }
  // Брой молове атоми от даден елемент в съединението
  const [f, el] = pick<[string, string]>([
    ['H2SO4', 'O'],
    ['H2SO4', 'H'],
    ['C6H12O6', 'C'],
    ['C6H12O6', 'H'],
    ['Ca(OH)2', 'O'],
    ['Fe2O3', 'Fe'],
    ['NH3', 'H'],
    ['CaCO3', 'O'],
  ]);
  const n = pick([0.5, 1.5, 2, 3, 0.25]);
  const count = parseFormula(f).get(el)!;
  return {
    tex: `${dec(n)}\\ \\mathrm{mol}\\ ${tex(f)}`,
    ask: `Колко мола атоми ${el} има в тях?`,
    num: Math.round(n * count * 100),
    den: 100,
    steps: [`Във всяка формулна единица $${tex(f)}$ има ${count} ${count === 1 ? 'атом' : 'атома'} ${el}.`, `$n(\\mathrm{${el}}) = ${count} \\cdot ${dec(n)} = ${dec(n * count)}\\ \\mathrm{mol}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🧂 Пакет сол',
    problem: 'В пакет има 1 kg готварска сол NaCl. Колко мола сол има в него?',
    solution: ['$M(\\mathrm{NaCl}) = 23 + 35{,}5 = 58{,}5\\ \\mathrm{g/mol}$', '$n = \\frac{1000}{58{,}5} \\approx 17{,}1\\ \\mathrm{mol}$'],
    answer: '$\\approx 17{,}1\\ \\mathrm{mol}$',
    check: [17.1],
    ask: ['n, mol'],
  },
  {
    title: '💧 Една капка вода',
    problem: 'Една капка вода има маса около 0,05 g. Колко молекули вода има в нея?',
    solution: ['$n = \\frac{0{,}05}{18} \\approx 2{,}78 \\cdot 10^{-3}\\ \\mathrm{mol}$', '$N = n \\cdot N_A \\approx 2{,}78 \\cdot 10^{-3} \\cdot 6{,}022 \\cdot 10^{23} \\approx 1{,}67 \\cdot 10^{21}$ молекули – около 200 пъти повече от броя на хората на Земята, умножен по милиард.'],
    answer: '$\\approx 1{,}67 \\cdot 10^{21}$',
    check: [1.67],
    ask: ['N, ·10²¹'],
  },
  {
    title: '💍 Златен пръстен',
    problem: 'Златен пръстен съдържа 4,0 g чисто злато ($A_r = 197$). Колко мола и колко атома злато има в него?',
    solution: ['$n = \\frac{4{,}0}{197} \\approx 0{,}0203\\ \\mathrm{mol}$', '$N = 0{,}0203 \\cdot 6{,}022 \\cdot 10^{23} \\approx 1{,}22 \\cdot 10^{22}$ атома'],
    answer: '$0{,}0203\\ \\mathrm{mol}$, $1{,}22 \\cdot 10^{22}$ атома',
    check: [0.0203, 1.22],
    ask: ['n, mol', 'N, ·10²²'],
  },
  {
    title: '☕ Захар в кафето',
    problem: 'В кафето са сложени 2 бучки захар по 5 g. Захарта е захароза $\\mathrm{C_{12}H_{22}O_{11}}$. Колко мола и колко молекули захароза има в кафето?',
    solution: ['$M = 12 \\cdot 12 + 22 \\cdot 1 + 11 \\cdot 16 = 342\\ \\mathrm{g/mol}$', '$n = \\frac{10}{342} \\approx 0{,}0292\\ \\mathrm{mol}$', '$N \\approx 0{,}0292 \\cdot 6{,}022 \\cdot 10^{23} \\approx 1{,}76 \\cdot 10^{22}$ молекули'],
    answer: '$0{,}0292\\ \\mathrm{mol}$, $1{,}76 \\cdot 10^{22}$',
    check: [0.0292, 1.76],
    ask: ['n, mol', 'N, ·10²²'],
  },
  {
    title: '⛏️ Желязна руда',
    problem: 'Хематитът е руда, която съдържа главно $\\mathrm{Fe_2O_3}$. Колко килограма желязо съдържа 1 тон чист $\\mathrm{Fe_2O_3}$?',
    solution: ['$M(\\mathrm{Fe_2O_3}) = 2 \\cdot 56 + 3 \\cdot 16 = 160\\ \\mathrm{g/mol}$', '$w(\\mathrm{Fe}) = \\frac{112}{160} = 0{,}70$', '$m(\\mathrm{Fe}) = 0{,}70 \\cdot 1000\\ \\mathrm{kg} = 700\\ \\mathrm{kg}$. Истинската руда съдържа и примеси, затова желязото в нея е по-малко.'],
    answer: '$700\\ \\mathrm{kg}$',
    check: [700],
    ask: ['желязо, kg'],
  },
  {
    title: '💊 Таблетка аспирин',
    problem: 'Таблетка съдържа 500 mg ацетилсалицилова киселина $\\mathrm{C_9H_8O_4}$. Колко милимола е това?',
    solution: ['$M = 9 \\cdot 12 + 8 \\cdot 1 + 4 \\cdot 16 = 180\\ \\mathrm{g/mol}$', '$n = \\frac{0{,}500\\ \\mathrm{g}}{180\\ \\mathrm{g/mol}} \\approx 2{,}78 \\cdot 10^{-3}\\ \\mathrm{mol} = 2{,}78\\ \\mathrm{mmol}$'],
    answer: '$\\approx 2{,}78\\ \\mathrm{mmol}$',
    check: [2.78],
    ask: ['n, mmol'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Колко частици има в 1 mol вещество?',
    answers: ['$6{,}02 \\cdot 10^{23}$', '$6{,}02 \\cdot 10^{-23}$', '$1000$', '$22{,}4$'],
    correctAnswer: '$6{,}02 \\cdot 10^{23}$',
  },
  {
    question: 'Колко е моларната маса на $\\mathrm{CO_2}$?',
    answers: ['$44\\ \\mathrm{g/mol}$', '$28\\ \\mathrm{g/mol}$', '$32\\ \\mathrm{g/mol}$', '$60\\ \\mathrm{g/mol}$'],
    correctAnswer: '$44\\ \\mathrm{g/mol}$',
  },
  {
    question: 'Колко мола са 36 g вода?',
    answers: ['$2\\ \\mathrm{mol}$', '$0{,}5\\ \\mathrm{mol}$', '$36\\ \\mathrm{mol}$', '$648\\ \\mathrm{mol}$'],
    correctAnswer: '$2\\ \\mathrm{mol}$',
  },
  {
    question: 'В кое от тези вещества (по 12 g от всяко) има най-много атоми?',
    answers: ['въглерод', 'магнезий', 'сяра', 'желязо'],
    correctAnswer: 'въглерод',
  },
  {
    question: 'Каква е масовата част на кислорода в $\\mathrm{MgO}$?',
    answers: ['$40\\%$', '$50\\%$', '$60\\%$', '$16\\%$'],
    correctAnswer: '$40\\%$',
  },
  {
    question: 'Кое е вярно за 1 mol $\\mathrm{O_2}$ и 1 mol $\\mathrm{H_2}$?',
    answers: ['съдържат еднакъв брой молекули', 'имат еднаква маса', 'кислородът съдържа 16 пъти повече молекули', 'водородът съдържа повече молекули'],
    correctAnswer: 'съдържат еднакъв брой молекули',
  },
  {
    question: 'Коя е най-простата (емпирична) формула на глюкозата $\\mathrm{C_6H_{12}O_6}$?',
    answers: ['$\\mathrm{CH_2O}$', '$\\mathrm{C_6H_{12}O_6}$', '$\\mathrm{C_3H_6O_3}$', '$\\mathrm{CHO}$'],
    correctAnswer: '$\\mathrm{CH_2O}$',
  },
  {
    question: 'Колко атома общо има в 1 mol вода?',
    answers: ['$\\approx 1{,}8 \\cdot 10^{24}$', '$\\approx 6{,}0 \\cdot 10^{23}$', '$3$', '$18$'],
    correctAnswer: '$\\approx 1{,}8 \\cdot 10^{24}$',
  },
  {
    question: 'Мол е единица за коя величина?',
    answers: ['количество вещество', 'маса', 'обем', 'плътност'],
    correctAnswer: 'количество вещество',
  },
];

// ---------- Страница ----------

export function Mole() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Мол и моларна маса</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍚 Колко е <strong>един мол</strong>? Представи си толкова оризови зърна: 602 214 076 000 000 000 000 000. Ако едно зърно тежи около
            25 mg, а светът прибира около 800 милиона тона ориз годишно, за да съберем един <Term id="mole">мол</Term> зърна, ще трябват около{' '}
            <strong>19 милиона години</strong> реколта. А в една лъжица вода има почти един мол молекули. Атомите са толкова малки, че не
            можем да ги броим един по един – затова химиците ги <strong>броят, като ги претеглят</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Защо химиците броят частици</h2>
          <p className={text}>
            <Term id="chemical-reaction">Химичните реакции</Term> стават между отделни атоми и молекули. Когато водородът гори, две молекули водород се свързват с една молекула
            кислород: <Tex>{'2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}'}</Tex>. Ако искаме реакцията да мине без излишък, трябва да
            вземем частиците в отношение 2 : 1 – по <strong>брой</strong>, не по маса. Две грама водород и един грам кислород не стават!
          </p>
          <p className={text}>
            Решението е като в магазина за винтчета: ако знаем масата на едно, броим ги чрез претегляне. Атомите на различните елементи имат
            различна маса – това е <strong>относителната атомна маса</strong> от урока{' '}
            <Link to="/chemistry/structure/atoms" className={link}>
              Атоми, изотопи и периодичната система
            </Link>
            . Нужна ни е само една голяма „опаковка“ с удобен брой частици – молът.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Мол и числото на Авогадро</h2>
          <Theorem
            type="definition"
            title="Мол"
            description="Молът е единицата за количество вещество $n$ в SI. Един мол съдържа точно $N_A = 6{,}022\,140\,76 \cdot 10^{23}$ частици – атоми, молекули, йони или други, които трябва да се посочат. $N_A$ е константата (числото) на Авогадро. Връзката между броя частици и количеството вещество е $N = n \cdot N_A$."
          />
          <p className={text}>
            До 2019 г. молът се определяше като броя атоми в точно 12 g въглерод-12. От 20 май 2019 г. числото на Авогадро е фиксирано точно,
            а 12 g въглерод-12 съдържат един мол атоми с много голяма, но вече не абсолютна точност. В задачите обикновено използваме{' '}
            <Tex>{'N_A \\approx 6{,}02 \\cdot 10^{23}\\ \\mathrm{mol^{-1}}'}</Tex>.
          </p>
          <p className={text}>
            Винаги казваме <strong>мол от какво</strong>: в 1 mol вода има <Tex>{'6{,}02 \\cdot 10^{23}'}</Tex> молекули, но три пъти повече
            атоми – два мола атоми водород и един мол атоми кислород.
          </p>
          <Example
            description="Колко атома има в 0,5 mol метан $\mathrm{CH_4}$?"
            steps={[
              'Молекулите: $N = 0{,}5 \\cdot 6{,}02 \\cdot 10^{23} = 3{,}01 \\cdot 10^{23}$',
              'Всяка молекула има $1 + 4 = 5$ атома: $5 \\cdot 3{,}01 \\cdot 10^{23} \\approx 1{,}51 \\cdot 10^{24}$ атома.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Моларна маса</h2>
          <Theorem
            type="definition"
            title="Моларна маса"
            description="Моларната маса $M$ е масата на един мол вещество: $M = \frac{m}{n}$, в $\mathrm{g/mol}$. Числено тя е равна на относителната атомна маса $A_r$ (за атомите) или на относителната молекулна маса $M_r$ – сбора от относителните атомни маси на всички атоми във формулата. Например $M_r(\mathrm{H_2O}) = 2 \cdot 1 + 16 = 18$, значи $M(\mathrm{H_2O}) = 18\ \mathrm{g/mol}$."
          />
          <Theorem
            title="Основните връзки"
            description="$n = \frac{m}{M} \qquad N = n \cdot N_A \qquad m_0 = \frac{M}{N_A}$, където $m_0$ е масата на една частица. Атомът на въглерода-12 има маса точно $12\ \mathrm{u}$, а един мол от тези атоми – $12\ \mathrm{g}$: единицата за атомна маса и числото на Авогадро са подбрани така, че да си пасват."
          />
          <p className={text}>
            В задачите използваме закръглени атомни маси: <Term id="integer">цели числа</Term> (H = 1, C = 12, O = 16, Na = 23, Fe = 56…), а за хлора 35,5 и за медта
            63,5. Точните стойности от таблицата дават разлика обикновено под 0,5%.
          </p>
          <Example
            description="Колко молекули има в 9 g вода и каква е масата на една молекула?"
            steps={[
              '$n = \\frac{m}{M} = \\frac{9}{18} = 0{,}5\\ \\mathrm{mol}$',
              '$N = 0{,}5 \\cdot 6{,}02 \\cdot 10^{23} = 3{,}01 \\cdot 10^{23}$ молекули',
              '$m_0 = \\frac{18\\ \\mathrm{g/mol}}{6{,}02 \\cdot 10^{23}\\ \\mathrm{mol^{-1}}} \\approx 2{,}99 \\cdot 10^{-23}\\ \\mathrm{g}$',
            ]}
          />
          <CountingByWeighingLab />
          <Example
            description="Да намерим моларната маса на сярната киселина $\mathrm{H_2SO_4}$ и колко мола са 49 g от нея."
            steps={['$M = 2 \\cdot 1 + 32 + 4 \\cdot 16 = 98\\ \\mathrm{g/mol}$', '$n = \\frac{49}{98} = 0{,}5\\ \\mathrm{mol}$']}
          />
          <MolarMassLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Масови части на елементите в съединение</h2>
          <p className={text}>
            В урока{' '}
            <Link to="/chemistry/structure/substances" className={link}>
              Вещества, смеси и разделяне
            </Link>{' '}
            <Term id="mass-fraction">масовата част</Term> описваше смес. Същото понятие казва колко от масата на едно съединение се пада на всеки елемент. Разликата е, че при
            съединението тя е постоянна – следва от формулата.
          </p>
          <Theorem
            title="Масова част на елемент"
            description="Ако във формулата има $a$ атома от елемента X, то $w(\mathrm{X}) = \frac{a \cdot A_r(\mathrm{X})}{M_r}$. Сборът от масовите части на всички елементи е 1 (100%)."
          />
          <Example
            description="Коя руда е по-богата на желязо: хематит $\mathrm{Fe_2O_3}$, магнетит $\mathrm{Fe_3O_4}$ или сидерит $\mathrm{FeCO_3}$ (ако са чисти)?"
            steps={[
              '$w(\\mathrm{Fe})$ в $\\mathrm{Fe_2O_3}$: $\\frac{2 \\cdot 56}{160} = 70{,}0\\%$',
              '$w(\\mathrm{Fe})$ в $\\mathrm{Fe_3O_4}$: $\\frac{3 \\cdot 56}{232} \\approx 72{,}4\\%$',
              '$w(\\mathrm{Fe})$ в $\\mathrm{FeCO_3}$: $\\frac{56}{116} \\approx 48{,}3\\%$',
              'Най-богат е магнетитът. В истинските руди има и скала, затова съдържанието на желязо е по-малко.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Формула по състав</h2>
          <p className={text}>
            Обратната задача е по-интересна: химикът е получил ново вещество и анализът показва масовите части на елементите. Каква е формулата
            му? Отговорът идва на две стъпки.
          </p>
          <Theorem
            type="definition"
            title="Най-проста и молекулна формула"
            description="Най-простата (емпиричната) формула показва най-малкото цяло отношение между броя на атомите, например $\mathrm{CH_2O}$. Молекулната формула показва истинския брой атоми в молекулата и е цяло кратно на най-простата: глюкозата $\mathrm{C_6H_{12}O_6} = (\mathrm{CH_2O})_6$. За да намерим молекулната формула, е нужна и моларната маса."
          />
          <Theorem
            title="Как се намира формулата"
            description="1) Приемаме, че имаме 100 g вещество – масовите части в проценти стават маси в грамове. 2) Делим всяка маса на атомната маса – получаваме броя молове атоми. 3) Делим всички числа на най-малкото. 4) Ако не са цели (например 1,5 или 1,33), умножаваме всички по 2, 3… 5) Молекулната формула: $k = \frac{M}{M_{\text{най-проста}}}$ и умножаваме индексите по $k$."
          />
          <Example
            description="Вещество съдържа 40,0% C, 6,7% H и 53,3% O, а моларната му маса е 180 g/mol. Каква е формулата му?"
            steps={[
              '$n(\\mathrm{C}) = \\frac{40{,}0}{12} = 3{,}33$; $n(\\mathrm{H}) = \\frac{6{,}7}{1} = 6{,}7$; $n(\\mathrm{O}) = \\frac{53{,}3}{16} = 3{,}33$',
              'Делим на 3,33: $\\mathrm{C} : \\mathrm{H} : \\mathrm{O} = 1 : 2 : 1$ – най-простата формула е $\\mathrm{CH_2O}$ ($M = 30\\ \\mathrm{g/mol}$).',
              '$k = \\frac{180}{30} = 6$, значи молекулната формула е $\\mathrm{C_6H_{12}O_6}$ – глюкоза или фруктоза (двете имат една и съща формула).',
            ]}
          />
          <EmpiricalFormulaLab />
          <p className={text}>
            Органичните вещества често се анализират чрез <strong>изгаряне</strong>: целият въглерод преминава във въглероден диоксид, а
            целият водород – във вода. От масите им намираме колко въглерод и водород е имало: <Tex>{'m(\\mathrm{C}) = m(\\mathrm{CO_2}) \\cdot \\frac{12}{44}'}</Tex>,{' '}
            <Tex>{'m(\\mathrm{H}) = m(\\mathrm{H_2O}) \\cdot \\frac{2}{18}'}</Tex>, а кислородът е остатъкът до масата на пробата. Как се
            пишат и изравняват уравненията на такива реакции, ще видим в урока{' '}
            <Link to="/chemistry/quantities/stoichiometry" className={link}>
              Химични уравнения и стехиометрия
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Кристалохидрати</h2>
          <p className={text}>
            Някои соли кристализират заедно с точно определен брой водни молекули. Синият камък (меден сулфат пентахидрат) има формула <Tex>{'\\mathrm{CuSO_4 \\cdot 5H_2O}'}</Tex>: на всяка формулна единица меден сулфат се падат пет молекули
            вода. При нагряване водата се отделя и сините кристали стават бял прах – безводен <Tex>{'\\mathrm{CuSO_4}'}</Tex>.
          </p>
          <Example
            description="Колко е масовата част на водата в синия камък $\mathrm{CuSO_4 \cdot 5H_2O}$?"
            steps={[
              '$M = 63{,}5 + 32 + 4 \\cdot 16 + 5 \\cdot 18 = 159{,}5 + 90 = 249{,}5\\ \\mathrm{g/mol}$',
              '$w(\\mathrm{H_2O}) = \\frac{90}{249{,}5} \\approx 36{,}1\\%$ – повече от една трета от масата на кристалите е вода.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>
            Намери <Term id="molar-mass">моларната маса</Term>, количеството вещество, масата, броя на частиците или масовата част. Атомните маси са закръглени (Cl = 35,5).
            Десетичните отговори въвеждай като 0,25.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Моловете около нас</h2>
          <p className={text}>Количеството вещество стои зад всяка рецепта, лекарство и <Term id="ore">руда</Term>.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Мол и маса', '1 mol е 1 g вещество.', '1 mol е брой частици ($6{,}02 \\cdot 10^{23}$); масата му зависи от веществото.'],
              ['Мол от какво?', 'В 1 mol $\\mathrm{H_2O}$ има $6{,}02 \\cdot 10^{23}$ атома.', 'Има $6{,}02 \\cdot 10^{23}$ молекули, а атомите са 3 пъти повече.'],
              ['Индекс и коефициент', '$M(\\mathrm{2H_2O}) = 36\\ \\mathrm{g/mol}$', 'Моларната маса е на формулата: $M(\\mathrm{H_2O}) = 18\\ \\mathrm{g/mol}$; $2\\mathrm{H_2O}$ означава 2 mol.'],
              ['Скоби във формулата', '$M(\\mathrm{Ca(OH)_2}) = 40 + 16 + 1 \\cdot 2 = 58$', 'Индексът след скобата се отнася за цялата група: $40 + 2 \\cdot (16 + 1) = 74$'],
              ['Деление обратно', '$n = \\frac{M}{m}$', '$n = \\frac{m}{M}$ – грамове делено на грамове на мол дава молове'],
              ['Закръгляне на отношението', '$\\mathrm{Fe} : \\mathrm{O} = 1 : 1{,}5 \\approx 1 : 2$', 'Умножаваме по 2: $2 : 3$, т.е. $\\mathrm{Fe_2O_3}$'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">
                  <MathText displayStyle>{title}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                  ✗ <MathText displayStyle>{wrong}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  ✓ <MathText displayStyle>{right}</MathText>
                </p>
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
              <Task id="a1" number={1} color="border-green-500" question="Колко мола и колко молекули има в 88 g въглероден диоксид $\mathrm{CO_2}$?" check={[2, 1.2]} ask={['$n$, mol', '$N$, ·10²⁴']}>
                <p><Tex>{'M(\\mathrm{CO_2}) = 12 + 2 \\cdot 16 = 44\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'n = \\frac{88}{44} = 2\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'N = 2 \\cdot 6{,}02 \\cdot 10^{23} \\approx 1{,}20 \\cdot 10^{24}'}</Tex> молекули.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намерете масовите части на калция, въглерода и кислорода в калциевия карбонат $\mathrm{CaCO_3}$." check={[40, 12, 48]} ask={['$w(\\mathrm{Ca})$, %', '$w(\\mathrm{C})$, %', '$w(\\mathrm{O})$, %']}>
                <p><Tex>{'M(\\mathrm{CaCO_3}) = 40 + 12 + 3 \\cdot 16 = 100\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'w(\\mathrm{Ca}) = \\frac{40}{100} = 40\\%'}</Tex>, <Tex>{'w(\\mathrm{C}) = \\frac{12}{100} = 12\\%'}</Tex>, <Tex>{'w(\\mathrm{O}) = \\frac{48}{100} = 48\\%'}</Tex></p>
                <p>Проверка: <Tex>{'40 + 12 + 48 = 100\\%'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Каква е масата на 0,25 mol сярна киселина $\mathrm{H_2SO_4}$ и колко атома кислород има в това количество?" check={[24.5, 6.02]} ask={['$m$, g', 'атоми O, ·10²³']}>
                <p><Tex>{'m = n \\cdot M = 0{,}25 \\cdot 98 = 24{,}5\\ \\mathrm{g}'}</Tex></p>
                <p>Атомите кислород: <Tex>{'n(\\mathrm{O}) = 4 \\cdot 0{,}25 = 1\\ \\mathrm{mol}'}</Tex>, т.е. <Tex>{'6{,}02 \\cdot 10^{23}'}</Tex> атома.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Въглеводород съдържа 85,7% въглерод и 14,3% водород. Моларната му маса е 56 g/mol. Намерете молекулната му формула." check={[4, 8]} ask={['брой атоми C', 'брой атоми H']}>
                <p>В 100 g: <Tex>{'n(\\mathrm{C}) = \\frac{85{,}7}{12} \\approx 7{,}14'}</Tex>, <Tex>{'n(\\mathrm{H}) = \\frac{14{,}3}{1} = 14{,}3'}</Tex>.</p>
                <p>Отношението е <Tex>{'1 : 2{,}00'}</Tex> – най-простата формула е <Tex>{'\\mathrm{CH_2}'}</Tex> с <Tex>{'M = 14\\ \\mathrm{g/mol}'}</Tex>.</p>
                <p><Tex>{'k = \\frac{56}{14} = 4'}</Tex>, значи формулата е <Tex>{'\\mathrm{C_4H_8}'}</Tex> (бутен или циклобутан – формулата не казва как са свързани атомите).</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Намерете масовата част на желязото в магнетита $\mathrm{Fe_3O_4}$ и в хематита $\mathrm{Fe_2O_3}$. От коя руда (ако са чисти) се получава повече желязо от тон?" check={[72.4, 70]} ask={['$\\mathrm{Fe_3O_4}$, %', '$\\mathrm{Fe_2O_3}$, %']}>
                <p><Tex>{'w(\\mathrm{Fe}) = \\frac{3 \\cdot 56}{232} \\approx 72{,}4\\%'}</Tex> в магнетита.</p>
                <p><Tex>{'w(\\mathrm{Fe}) = \\frac{2 \\cdot 56}{160} = 70{,}0\\%'}</Tex> в хематита.</p>
                <p>Магнетитът дава малко повече желязо: около 724 kg срещу 700 kg от тон.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Нагряват се 25,0 g син камък $\mathrm{CuSO_4 \cdot 5H_2O}$, докато се отдели цялата вода. Колко грама безводен $\mathrm{CuSO_4}$ остават и колко грама вода се отделят?" check={[16, 9.02]} ask={['$\\mathrm{CuSO_4}$, g', 'вода, g']}>
                <p><Tex>{'M(\\mathrm{CuSO_4 \\cdot 5H_2O}) = 249{,}5\\ \\mathrm{g/mol}'}</Tex>, <Tex>{'M(\\mathrm{CuSO_4}) = 159{,}5\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'n = \\frac{25{,}0}{249{,}5} \\approx 0{,}1002\\ \\mathrm{mol}'}</Tex> – толкова е и безводната сол.</p>
                <p><Tex>{'m(\\mathrm{CuSO_4}) = 0{,}1002 \\cdot 159{,}5 \\approx 15{,}98 \\approx 16{,}0\\ \\mathrm{g}'}</Tex></p>
                <p>Водата: <Tex>{'25{,}0 - 15{,}98 \\approx 9{,}02\\ \\mathrm{g}'}</Tex> – т.е. около 36% от масата на кристалите.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="При изгарянето на 2,30 g органично вещество, съставено от C, H и O, се получават 4,40 g $\mathrm{CO_2}$ и 2,70 g $\mathrm{H_2O}$. Моларната маса на веществото е 46 g/mol. Намерете молекулната му формула." check={[2, 6, 1]} ask={['атоми C', 'атоми H', 'атоми O']}>
                <p><Tex>{'m(\\mathrm{C}) = 4{,}40 \\cdot \\frac{12}{44} = 1{,}20\\ \\mathrm{g}'}</Tex>, т.е. <Tex>{'0{,}100\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{H}) = 2{,}70 \\cdot \\frac{2}{18} = 0{,}300\\ \\mathrm{g}'}</Tex>, т.е. <Tex>{'0{,}300\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{O}) = 2{,}30 - 1{,}20 - 0{,}300 = 0{,}800\\ \\mathrm{g}'}</Tex>, т.е. <Tex>{'0{,}0500\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'\\mathrm{C} : \\mathrm{H} : \\mathrm{O} = 0{,}1 : 0{,}3 : 0{,}05 = 2 : 6 : 1'}</Tex> – най-простата формула <Tex>{'\\mathrm{C_2H_6O}'}</Tex> има <Tex>{'M = 46'}</Tex>, така че тя е и молекулната. Това може да е етанол или диметилов етер.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="При нагряване на 14,3 g кристална сода $\mathrm{Na_2CO_3 \cdot xH_2O}$ остават 5,30 g безводен $\mathrm{Na_2CO_3}$. Намерете $x$." check={[10]} ask={['$x$']}>
                <p><Tex>{'n(\\mathrm{Na_2CO_3}) = \\frac{5{,}30}{106} = 0{,}0500\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{H_2O}) = 14{,}3 - 5{,}30 = 9{,}00\\ \\mathrm{g}'}</Tex>, <Tex>{'n(\\mathrm{H_2O}) = \\frac{9{,}00}{18} = 0{,}500\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'x = \\frac{0{,}500}{0{,}0500} = 10'}</Tex>, т.е. <Tex>{'\\mathrm{Na_2CO_3 \\cdot 10H_2O}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Изливаме чаша вода (250 g) в океана и я оставяме да се размеси равномерно с цялата вода в Световния океан (около $1{,}4 \cdot 10^{21}\ \mathrm{kg}$). После загребваме 250 g вода от океана. Колко молекули от „нашата“ вода ще има средно в чашата?" check={[1490]} ask={['брой молекули']}>
                <p>В чашата има <Tex>{'N = \\frac{250}{18} \\cdot 6{,}022 \\cdot 10^{23} \\approx 8{,}36 \\cdot 10^{24}'}</Tex> молекули.</p>
                <p>Чашата е частта <Tex>{'\\frac{250\\ \\mathrm{g}}{1{,}4 \\cdot 10^{24}\\ \\mathrm{g}} \\approx 1{,}79 \\cdot 10^{-22}'}</Tex> от океана.</p>
                <p>От нашите молекули във втората чаша ще попаднат средно <Tex>{'8{,}36 \\cdot 10^{24} \\cdot 1{,}79 \\cdot 10^{-22} \\approx 1490'}</Tex>.</p>
                <p>Около хиляда и петстотин! Молекулите са толкова много, че дори една чаша, разредена в целия океан, „се усеща“ във всяка друга чаша.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Молът е единицата за количество вещество; 1 mol съдържа <Tex>{'N_A = 6{,}022\\,140\\,76 \\cdot 10^{23}'}</Tex> частици (точно, от 2019 г.)</li>
              <li>✓ Моларната маса <Tex>{'M'}</Tex> в g/mol е числено равна на <Tex>{'A_r'}</Tex> или <Tex>{'M_r'}</Tex> – сбора от атомните маси във формулата</li>
              <li>✓ <Tex>{'n = \\frac{m}{M}'}</Tex>, <Tex>{'N = n \\cdot N_A'}</Tex>, масата на една частица <Tex>{'m_0 = \\frac{M}{N_A}'}</Tex></li>
              <li>✓ Масова част на елемент: <Tex>{'w(\\mathrm{X}) = \\frac{a \\cdot A_r(\\mathrm{X})}{M_r}'}</Tex></li>
              <li>✓ Формула по състав: делим на <Tex>{'A_r'}</Tex>, на най-малкото, довеждаме до цели числа; молекулната формула е кратна на най-простата</li>
              <li>✓ Кристалохидратите съдържат вода в точно отношение, например <Tex>{'\\mathrm{CuSO_4 \\cdot 5H_2O}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Амедео Авогадро никога не е знаел „своето“ число. През 1811 г. той предполага, че равни обеми газове при еднакви условия съдържат
              еднакъв брой молекули, но колко са те, не може да каже никой. Едно от първите измервания на броя молекули прави Йозеф Лошмит през
              1865 г. Жан Перен през 1909 г. предлага константата да носи името на Авогадро, а неговите опити с брауновото движение, които
              потвърждават реалността на атомите, му носят Нобеловата награда за физика през 1926 г.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
