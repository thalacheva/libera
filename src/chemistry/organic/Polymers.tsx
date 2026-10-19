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
import { molecularFormula } from '../smiles';
import { Molecule } from '../StructuralFormula';
import AdditionPolymerLab from './AdditionPolymerLab';
import CondensationLab from './CondensationLab';
import PlasticSortLab from './PlasticSortLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45; хилядите – с тънък интервал. */
const dec = (v: number) => {
  const s = v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false });
  const [int, frac] = s.split('.');
  const grouped = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : int;
  return frac ? `${grouped}{,}${frac}` : grouped;
};

/** Мономерите на присъединителните полимери: SMILES и име. */
const ADDITION: [string, string, string][] = [
  ['PE', 'C=C', 'етен'],
  ['PP', 'C=CC', 'пропен'],
  ['PVC', 'C=CCl', 'винилхлорид'],
  ['PS', 'C=Cc1ccccc1', 'стирен'],
  ['PTFE', 'FC(F)=C(F)F', 'тетрафлуороетен'],
  ['PMMA', 'C=C(C)C(=O)OC', 'метилметакрилат'],
];
// Масови части с крайни десетични дроби
const FRACTIONS: [string, string, string, number][] = [
  ['PVC', 'C=CCl', 'Cl', 56.8],
  ['PVC', 'C=CCl', 'C', 38.4],
  ['PTFE', 'FC(F)=C(F)F', 'F', 76],
  ['PTFE', 'FC(F)=C(F)F', 'C', 24],
  ['PMMA', 'C=C(C)C(=O)OC', 'C', 60],
  ['PMMA', 'C=C(C)C(=O)OC', 'O', 32],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0 || kind === 1) {
    const [short, smiles, name] = pick(ADDITION);
    const f = molecularFormula(smiles);
    const M = molarMass(f);
    const n = pick([200, 500, 800, 1000, 1500, 2000, 2500, 4000]);
    return kind === 0
      ? {
          tex: `\\text{${short}}:\\ M = ${dec(n * M)}\\ \\mathrm{g/mol}`,
          ask: `Каква е степента на полимеризация? (мономер – ${name})`,
          num: n,
          den: 1,
          steps: [`$M(${formulaTex(f)}) = ${dec(M)}\\ \\mathrm{g/mol}$`, `$n = \\frac{${dec(n * M)}}{${dec(M)}} = ${n}$`],
        }
      : {
          tex: `\\text{${short}}:\\ n = ${dec(n)}`,
          ask: `Каква е моларната маса на полимера в g/mol? (мономер – ${name})`,
          num: n * M * 10,
          den: 10,
          steps: [`$M(${formulaTex(f)}) = ${dec(M)}\\ \\mathrm{g/mol}$`, `$M = n \\cdot M_{\\text{звено}} = ${n} \\cdot ${dec(M)} = ${dec(n * M)}\\ \\mathrm{g/mol}$`],
        };
  }
  if (kind === 2) {
    const [short, smiles, el, w] = pick(FRACTIONS);
    const f = molecularFormula(smiles);
    return {
      tex: `\\text{${short}}:\\ \\left[${formulaTex(f)}\\right]_n`,
      ask: `Каква е масовата част на ${el} в полимера (в %)?`,
      num: w * 10,
      den: 10,
      steps: [
        `Масовата част в полимера е същата като в звеното $${formulaTex(f)}$ ($M = ${dec(molarMass(f))}\\ \\mathrm{g/mol}$).`,
        `$w(\\mathrm{${el}}) = ${dec((w * molarMass(f)) / 100)} : ${dec(molarMass(f))} = ${dec(w)}\\%$`,
      ],
    };
  }
  if (kind === 3) {
    // Поликондензация на млечна киселина: на всяко звено се отделя една молекула вода
    const m = pick([90, 180, 450, 900, 45, 270]);
    return {
      tex: `n\\,\\mathrm{CH_3CH(OH)COOH} \\to \\mathrm{H\\!-\\![O\\!-\\!CH(CH_3)\\!-\\!CO]_n\\!-\\!OH} + (n-1)\\,\\mathrm{H_2O}`,
      ask: `Колко грама вода се отделят от ${m} g млечна киселина при много дълга верига (n − 1 ≈ n)?`,
      num: m,
      den: 5,
      steps: [`$n = \\frac{${m}}{90} = ${dec(m / 90)}\\ \\mathrm{mol}$; толкова мола вода`, `$m(\\mathrm{H_2O}) = ${dec(m / 90)} \\cdot 18 = ${dec(m / 5)}\\ \\mathrm{g}$`],
    };
  }
  // Среднобройна моларна маса на смес от вериги
  const total = pick([2, 4, 5, 10]);
  const n1 = randInt(1, total - 1);
  const [M1, M2] = pick([
    [10000, 50000],
    [20000, 60000],
    [10000, 30000],
    [40000, 100000],
  ]);
  const Mn = (n1 * M1 + (total - n1) * M2) / total;
  return {
    tex: `${n1}\\ \\mathrm{mol}\\ (M = ${dec(M1)}) + ${total - n1}\\ \\mathrm{mol}\\ (M = ${dec(M2)})`,
    ask: 'Каква е среднобройната моларна маса Mₙ в g/mol?',
    num: Mn,
    den: 1,
    steps: [`$M_n = \\frac{${n1} \\cdot ${dec(M1)} + ${total - n1} \\cdot ${dec(M2)}}{${total}} = ${dec(Mn)}\\ \\mathrm{g/mol}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🛍️ Найлонова торбичка',
    problem: 'Торбичка от полиетилен тежи 5 g. Колко мола етен са били нужни, за да се получи? Колко молекули етен е това?',
    solution: [
      'При присъединителната полимеризация не се отделя нищо – масата на полимера е равна на масата на мономера.',
      '$n(\\mathrm{C_2H_4}) = \\frac{5}{28} \\approx 0{,}179\\ \\mathrm{mol}$',
      '$N = 0{,}179 \\cdot 6{,}02 \\cdot 10^{23} \\approx 1{,}08 \\cdot 10^{23}$ молекули – и всички те са свързани в няколко хиляди дълги вериги.',
    ],
    answer: '$\\approx 0{,}179\\ \\mathrm{mol}$',
    check: [0.179],
    ask: ['етен, mol'],
  },
  {
    title: '🧴 Бутилка от PET',
    problem: 'Бутилка от PET тежи 25 g. Звеното на PET е $\\mathrm{C_{10}H_8O_4}$ (192 g/mol) и се получава от терефталова киселина и етиленгликол $\\mathrm{C_2H_6O_2}$ с отделяне на 2 молекули вода. Колко грама етиленгликол и колко грама вода участват?',
    solution: [
      '$n(\\text{звена}) = \\frac{25}{192} \\approx 0{,}130\\ \\mathrm{mol}$; толкова мола етиленгликол',
      '$m(\\mathrm{C_2H_6O_2}) = 0{,}130 \\cdot 62 \\approx 8{,}07\\ \\mathrm{g}$',
      'Водата: $2 \\cdot 0{,}130 \\cdot 18 \\approx 4{,}69\\ \\mathrm{g}$. Проверка: $21{,}6\\ \\mathrm{g}$ киселина $+ 8{,}07\\ \\mathrm{g}$ гликол $- 4{,}69\\ \\mathrm{g}$ вода $\\approx 25\\ \\mathrm{g}$.',
    ],
    answer: '$\\approx 8{,}07\\ \\mathrm{g}$ и $\\approx 4{,}69\\ \\mathrm{g}$',
    check: [8.07, 4.69],
    ask: ['етиленгликол, g', 'вода, g'],
  },
  {
    title: '🔥 Защо PVC не се гори',
    problem: 'При изгаряне целият хлор от поливинилхлорида преминава в хлороводород HCl. Колко грама HCl се получават от 1 kg PVC?',
    solution: [
      'Звеното $\\mathrm{C_2H_3Cl}$ е 62,5 g/mol: $n = \\frac{1000}{62{,}5} = 16\\ \\mathrm{mol}$ звена и толкова мола Cl.',
      '$m(\\mathrm{HCl}) = 16 \\cdot 36{,}5 = 584\\ \\mathrm{g}$ – повече от половин килограм разяждащ газ, който с влагата дава солна киселина. При непълно горене може да се образуват и други отровни хлорирани вещества.',
    ],
    answer: '$584\\ \\mathrm{g}$',
    check: [584],
    ask: ['HCl, g'],
  },
  {
    title: '🍳 Тефлоновият тиган',
    problem: 'Средната моларна маса на тефлона (PTFE) в едно покритие е $1{,}0 \\cdot 10^6\\ \\mathrm{g/mol}$. Каква е средната степен на полимеризация?',
    solution: ['Звеното $\\mathrm{C_2F_4}$: $M = 2 \\cdot 12 + 4 \\cdot 19 = 100\\ \\mathrm{g/mol}$', '$n = \\frac{1{,}0 \\cdot 10^6}{100} = 10\\,000$ звена във веригата'],
    answer: '$10\\,000$',
    check: [10000],
    ask: ['n'],
  },
  {
    title: '🌽 Чаша от PLA',
    problem: 'Чаша от полимлечна киселина (PLA) тежи 10 g. Звеното е $\\mathrm{C_3H_4O_2}$ (72 g/mol), а мономерът – млечна киселина $\\mathrm{C_3H_6O_3}$ (90 g/mol). Колко грама млечна киселина са нужни при пълно превръщане?',
    solution: ['$n = \\frac{10}{72}\\ \\mathrm{mol}$ звена; толкова мола млечна киселина', '$m = \\frac{10}{72} \\cdot 90 = 12{,}5\\ \\mathrm{g}$; разликата от $2{,}5\\ \\mathrm{g}$ е отделената вода.'],
    answer: '$12{,}5\\ \\mathrm{g}$',
    check: [12.5],
    ask: ['млечна киселина, g'],
  },
  {
    title: '⚖️ Две партиди полиетилен',
    problem: 'Смесват равни маси полиетилен с $M = 20\\,000$ и с $M = 80\\,000\\ \\mathrm{g/mol}$. Каква е среднобройната $M_n$ и средномасовата $M_w$ моларна маса на сместа?',
    solution: [
      'Нека масите са по $m$. Моловете вериги са $\\frac{m}{20\\,000}$ и $\\frac{m}{80\\,000}$ – леките вериги са 4 пъти повече.',
      '$M_n = \\frac{2m}{m/20\\,000 + m/80\\,000} = 32\\,000\\ \\mathrm{g/mol}$',
      '$M_w = \\frac{m \\cdot 20\\,000 + m \\cdot 80\\,000}{2m} = 50\\,000\\ \\mathrm{g/mol}$; дисперсност $\\text{Đ} = \\frac{50\\,000}{32\\,000} \\approx 1{,}56$',
    ],
    answer: '$M_n = 32\\,000$, $M_w = 50\\,000\\ \\mathrm{g/mol}$',
    check: [32000, 50000],
    ask: ['Mₙ, g/mol', 'Mw, g/mol'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой мономер дава поливинилхлорид?',
    answers: ['$\\mathrm{CH_2{=}CHCl}$', '$\\mathrm{CH_2{=}CH_2}$', '$\\mathrm{CH_3CH_2Cl}$', '$\\mathrm{CCl_4}$'],
    correctAnswer: '$\\mathrm{CH_2{=}CHCl}$',
  },
  {
    question: 'Какво е общото между мономерите на присъединителната полимеризация?',
    answers: ['имат двойна връзка C=C', 'имат две функционални групи', 'съдържат хлор', 'са твърди вещества'],
    correctAnswer: 'имат двойна връзка C=C',
  },
  {
    question: 'Кое вещество се отделя при получаването на найлон-6,6 и PET?',
    answers: ['вода', 'водород', 'въглероден диоксид', 'нищо не се отделя'],
    correctAnswer: 'вода',
  },
  {
    question: 'Полистиренът има $M = 52\\,000\\ \\mathrm{g/mol}$, а звеното му – $104\\ \\mathrm{g/mol}$. Каква е степента на полимеризация?',
    answers: ['$500$', '$5000$', '$50$', '$104$'],
    correctAnswer: '$500$',
  },
  {
    question: 'Кой полимер е реактопласт – при нагряване не се размеква, а се разлага?',
    answers: ['бакелит', 'полиетилен', 'полипропилен', 'PVC'],
    correctAnswer: 'бакелит',
  },
  {
    question: 'Какво става при вулканизацията на каучука?',
    answers: ['веригите се свързват със серни мостове', 'веригите се разкъсват на мономери', 'каучукът се стопява', 'от каучука се отделя сяра'],
    correctAnswer: 'веригите се свързват със серни мостове',
  },
  {
    question: 'Кои пластмаси плуват във вода?',
    answers: ['полиетилен и полипропилен', 'PET и PVC', 'всички', 'никоя'],
    correctAnswer: 'полиетилен и полипропилен',
  },
  {
    question: 'Кой природен полимер изгражда клетъчните стени на растенията?',
    answers: ['целулоза', 'нишесте', 'каучук', 'белтък'],
    correctAnswer: 'целулоза',
  },
  {
    question: 'Какво показва $\\text{Đ} = M_w / M_n$?',
    answers: ['колко различни по дължина са веригите', 'колко звена има веригата', 'плътността на полимера', 'температурата на топене'],
    correctAnswer: 'колко различни по дължина са веригите',
  },
];

// ---------- Страница ----------

const POLYMERS: [string, string, string, string, string][] = [
  ['полиетилен (PE)', 'етен', 'C=C', '*CC*', 'торбички, фолио, бутилки'],
  ['полипропилен (PP)', 'пропен', 'C=CC', '*CC(C)*', 'капачки, кутии, влакна'],
  ['поливинилхлорид (PVC)', 'винилхлорид', 'C=CCl', '*CC(Cl)*', 'тръби, дограма, кабели'],
  ['полистирен (PS)', 'стирен', 'C=Cc1ccccc1', '*CC(c1ccccc1)*', 'чашки, стиропор'],
  ['тефлон (PTFE)', 'тетрафлуороетен', 'FC(F)=C(F)F', '*C(F)(F)C(F)(F)*', 'тигани, уплътнения'],
  ['плексиглас (PMMA)', 'метилметакрилат', 'C=C(C)C(=O)OC', '*CC(C)(C(=O)OC)*', 'прозрачни прегради, лещи'],
];

const CODES: [string, string, string, string][] = [
  ['1', 'PET', 'полиетилентерефталат', 'бутилки за напитки'],
  ['2', 'HDPE', 'полиетилен с висока плътност', 'шишета за мляко и препарати'],
  ['3', 'PVC', 'поливинилхлорид', 'тръби, дограма'],
  ['4', 'LDPE', 'полиетилен с ниска плътност', 'торбички, фолио'],
  ['5', 'PP', 'полипропилен', 'капачки, кутии за храна'],
  ['6', 'PS', 'полистирен', 'чашки, стиропор'],
  ['7', 'O (други)', 'всички останали и смеси', 'поликарбонат, PLA, многослойни опаковки'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 align-middle';
const mol = 'text-gray-800 dark:text-gray-100';

export function Polymers() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Полимери</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧵 През 1920 г. германският химик Херман Щаудингер твърди, че каучукът, целулозата и нишестето са изградени от{' '}
            <strong>гигантски молекули</strong> – вериги от хиляди атоми, свързани с обикновени <Term id="covalent-bond">ковалентни връзки</Term>. Повечето колеги смятат, че това
            са просто купчинки от малки молекули, слепени от слаби сили. Разказват, че един от тях го съветвал: „Откажете се от идеята за
            големите молекули!“. Щаудингер не се отказва – и през 1953 г. получава Нобелова награда. Днес светът произвежда стотици милиони
            тонове от неговите макромолекули всяка година.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Мономери и полимери</h2>
          <Theorem
            type="definition"
            title="Полимер, мономер, звено"
            description="Полимерът е вещество от макромолекули – много дълги молекули, изградени от повтарящи се еднакви части. Малката молекула, от която се получава полимерът, е мономер. Частта, която се повтаря във веригата, е повтарящо се (структурно) звено, а броят на звената $n$ е степента на полимеризация: $n = \frac{M(\text{полимер})}{M(\text{звено})}$."
          />
          <p className={text}>
            Полимерът се записва със звеното в скоби и индекс <Tex>{'n'}</Tex>. Например от етена се получава полиетилен:
          </p>
          <div className={`flex flex-wrap items-center justify-center gap-3 mb-4 ${mol}`}>
            <span className="font-semibold">n</span>
            <Molecule smiles="C=C" mode="semi" title="етен" />
            <span className="text-amber-600 dark:text-amber-400 text-xl">→</span>
            <span className="text-2xl font-light">[</span>
            <Molecule smiles="*CC*" mode="semi" title="звено на полиетилена" />
            <span className="text-2xl font-light">
              ]<sub className="text-sm font-semibold">n</sub>
            </span>
          </div>
          <p className={text}>
            Истинските вериги имат от стотици до стотици хиляди звена. Краищата им са други групи, но при толкова дълга верига те почти не
            влияят на масата и състава. Затова масовите части на елементите в полимера са същите като в звеното, а{' '}
            <Term id="molar-mass">моларната маса</Term> е <Tex>{'M = n \\cdot M_{\\text{звено}}'}</Tex>.
          </p>
          <Example
            description="Поливинилхлоридът в една тръба има средна моларна маса 125 000 g/mol. Каква е степента на полимеризация?"
            steps={['Звеното е $\\mathrm{C_2H_3Cl}$: $M = 2 \\cdot 12 + 3 \\cdot 1 + 35{,}5 = 62{,}5\\ \\mathrm{g/mol}$', '$n = \\frac{125\\,000}{62{,}5} = 2000$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Присъединителна полимеризация</h2>
          <Theorem
            title="Полимеризация (присъединяване)"
            description="Мономери с двойна връзка $\mathrm{C{=}C}$ се свързват един за друг: във всеки мономер едната от двете връзки се „отваря“ и образува връзка със съседа. Друго вещество не се отделя, затова звеното има същия състав като мономера: $n\,\mathrm{CH_2{=}CHX} \to [\mathrm{-CH_2{-}CHX-}]_n$."
          />
          <p className={text}>
            Всички мономери в таблицата приличат на етен, в който водородни атоми са заменени с други – различават се само по заместителя <Tex>{'\\mathrm{X}'}</Tex>. Затова и
            свойствата на полимерите са различни: хлорът прави PVC твърд и трудно запалим, флуорът прави тефлона химически почти неуязвим, а
            бензеновият пръстен – полистирена твърд и чуплив. Повече за <Term id="alkene">алкените</Term> има в урока{' '}
            <Link to="/chemistry/organic/hydrocarbons" className={link}>
              Въглеводороди
            </Link>
            , а как точно растат веригите (чрез радикали) – в{' '}
            <Link to="/chemistry/organic/mechanisms" className={link}>
              Механизми на органичните реакции
            </Link>
            .
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Полимер</th>
                  <th className={th}>Мономер</th>
                  <th className={th}>Звено</th>
                  <th className={th}>Употреба</th>
                </tr>
              </thead>
              <tbody>
                {POLYMERS.map(([name, mono, smiles, unit, use]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={`${td} ${mol}`}>
                      <Molecule smiles={smiles} bond={20} title={mono} />
                      <div className="text-xs text-gray-500 dark:text-gray-400">{mono}</div>
                    </td>
                    <td className={`${td} ${mol}`}>
                      <Molecule smiles={unit} bond={20} title={`звено на ${name}`} />
                    </td>
                    <td className={td}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Таблицата е със скелетни формули: всеки връх е въглероден атом, а водородите при него не се пишат. Двете линии, които излизат
            извън звеното, са връзките към съседните звена.
          </p>
          <AdditionPolymerLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Поликондензация</h2>
          <Theorem
            title="Поликондензация"
            description="Мономери с по две функционални групи (например $-\mathrm{COOH}$, $-\mathrm{OH}$, $-\mathrm{NH_2}$) реагират помежду си и при всяка нова връзка се отделя малка молекула – най-често вода. Затова звеното е по-леко от сбора на мономерите. Връзките във веригата са естерни ($-\mathrm{CO{-}O}-$, полиестери) или амидни ($-\mathrm{CO{-}NH}-$, полиамиди)."
          />
          <p className={text}>
            Така се получават найлонът (1935 г., Уолъс Каротърс) и PET – от него са бутилките за вода и полиестерните влакна. Реакциите са
            същите като образуването на <Term id="ester">естер</Term> и <Term id="amide">амид</Term> от урока{' '}
            <Link to="/chemistry/organic/functional-groups" className={link}>
              Функционални групи
            </Link>
            , само че повторени хиляди пъти: всеки мономер има по две „ръце“ и веригата може да расте и от двата края.
          </p>
          <div className={`flex flex-col items-center gap-1 mb-4 ${mol}`}>
            <Molecule smiles="*OCCOC(=O)c1ccc(cc1)C(=O)*" bond={22} title="звено на PET" highlightAtoms={[0, 3]} highlightClass="fill-sky-300/60 stroke-sky-300/60" />
            <span className="text-xs text-gray-500 dark:text-gray-400">звеното на PET – естерните кислородни атоми са оцветени</span>
          </div>
          <Example
            description="Колко молекули вода се отделят при образуването на една верига найлон-6,6 от 500 звена?"
            steps={[
              'Всяко звено съдържа една молекула диамин и една молекула киселина – общо 1000 мономера в редица.',
              'Между 1000 мономера има 999 връзки – по една отделена молекула вода на връзка: $2n - 1 = 999$.',
            ]}
          />
          <CondensationLab />
          <p className={text}>
            Ако мономерът има три <Term id="functional-group">функционални групи</Term>, веригите се свързват помежду си в пространствена мрежа. Така е получен първият изцяло
            синтетичен пластмасов материал – <strong>бакелитът</strong> (1907 г.) от <Term id="phenol">фенол</Term> и формалдехид, от който са правели телефони и
            електрически ключове.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Средна моларна маса</h2>
          <p className={text}>
            В една проба полимер веригите никога не са еднакво дълги – растат и спират на случаен принцип. Затова моларната маса на полимера
            е <strong>средна</strong> стойност, а начините за осредняване са два.
          </p>
          <Theorem
            type="definition"
            title="Среднобройна и средномасова моларна маса"
            description="Ако пробата съдържа $n_i$ мола вериги с моларна маса $M_i$: среднобройната е $M_n = \frac{\sum n_i M_i}{\sum n_i}$ (обикновената средна стойност), а средномасовата – $M_w = \frac{\sum n_i M_i^2}{\sum n_i M_i}$ (по-тежко тежат дългите вериги). Винаги $M_w \ge M_n$, а $\text{Đ} = \frac{M_w}{M_n}$ (дисперсност) показва колко различни са веригите; при еднакви вериги $\text{Đ} = 1$."
          />
          <Example
            description="Проба съдържа 1 mol вериги с M = 10 000 и 1 mol вериги с M = 30 000 g/mol. Намерете $M_n$, $M_w$ и $\text{Đ}$."
            steps={[
              '$M_n = \\frac{10\\,000 + 30\\,000}{2} = 20\\,000\\ \\mathrm{g/mol}$',
              '$M_w = \\frac{10\\,000^2 + 30\\,000^2}{10\\,000 + 30\\,000} = 25\\,000\\ \\mathrm{g/mol}$',
              '$\\text{Đ} = \\frac{25\\,000}{20\\,000} = 1{,}25$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Строеж и свойства</h2>
          <p className={text}>
            Свойствата на полимера зависят не само от звеното, а и от това как са подредени веригите. Полиетиленът с ниска плътност (LDPE)
            има много разклонения – веригите не могат да се подредят плътно и материалът е мек (торбички, фолио). Полиетиленът с висока
            плътност (HDPE) е почти неразклонен – веригите се подреждат в кристални области и той е по-твърд и по-плътен (шишета, щайги).
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <p className="font-semibold mb-1">Термопласти</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Линейни или разклонени вериги, държани от <Term id="intermolecular-forces">междумолекулни сили</Term>. При нагряване се размекват и могат да се претопяват и
                формоват отново: PE, PP, PVC, PS, PET.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <p className="font-semibold mb-1">Реактопласти</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Веригите са свързани с ковалентни връзки в пространствена мрежа. При нагряване не се размекват, а се разлагат: бакелит,
                епоксидни смоли, втвърдени лакове.
              </p>
            </div>
          </div>
          <Theorem
            type="definition"
            title="Каучук и вулканизация"
            description="Естественият каучук е полиизопрен $[\mathrm{-CH_2{-}C(CH_3){=}CH{-}CH_2-}]_n$ – мек и лепкав, на студено става чуплив. При вулканизация го нагряват със сяра (няколко процента): между веригите се образуват серни мостове $-\mathrm{S_x}-$ и се получава еластична гума. С много сяра (около 30%) мрежата става гъста и се получава твърд ебонит."
          />
          <div className={`flex justify-center mb-4 ${mol}`}>
            <Molecule smiles="*CC(C)=CC*" mode="semi" title="звено на полиизопрена" />
          </div>
          <p className={text}>
            Чарлз Гудиър открива вулканизацията през 1839 г. – по собствения му разказ, след като смес от каучук и сяра попада върху горещата
            печка. Почти всички гуми днес са вулканизирани.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Природни полимери</h2>
          <p className={text}>
            Природата прави полимери много преди химиците. <strong>Нишестето</strong> и <strong>целулозата</strong> са вериги от глюкоза – и
            двете с формула <Tex>{'(\\mathrm{C_6H_{10}O_5})_n'}</Tex>, но с различно свързване: нишестето е запас от храна, а целулозата е
            здравият материал на растенията (памук, дърво, хартия). <strong>Белтъците</strong> са полиамиди от <Term id="amino-acid">аминокиселини</Term>, а ДНК е полимер
            от <Term id="nucleotide">нуклеотиди</Term>. Повече – в урока{' '}
            <Link to="/chemistry/organic/biomolecules" className={link}>
              Химия на живота
            </Link>
            .
          </p>
          <div className={`flex flex-wrap justify-center items-end gap-6 mb-4 ${mol}`}>
            <figure className="text-center">
              <Molecule smiles="OC1C(O)C(O)C(CO)OC1O" bond={24} title="глюкоза" />
              <figcaption className="text-xs text-gray-500 dark:text-gray-400">глюкоза – мономерът на нишестето и целулозата</figcaption>
            </figure>
            <figure className="text-center">
              <Molecule smiles="NCC(=O)O" mode="semi" title="глицин" />
              <figcaption className="text-xs text-gray-500 dark:text-gray-400">глицин – най-простата аминокиселина</figcaption>
            </figure>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Пластмасите и околната среда</h2>
          <p className={text}>
            Повечето пластмаси не се разлагат в природата с десетилетия. На опаковките има триъгълник от стрелки с цифра – кодът показва от
            какъв полимер е изделието и помага при разделянето за рециклиране.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Код</th>
                  <th className={th}>Означение</th>
                  <th className={th}>Полимер</th>
                  <th className={th}>Примери</th>
                </tr>
              </thead>
              <tbody>
                {CODES.map(([code, short, name, use]) => (
                  <tr key={code}>
                    <td className={`${td} font-bold`}>{code}</td>
                    <td className={td}>{short}</td>
                    <td className={td}>{name}</td>
                    <td className={td}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Смлените пластмаси се разделят по <Term id="density">плътност</Term> – едни плуват, други потъват. Опитай сам:
          </p>
          <PlasticSortLab />
          <p className={text}>
            Пластмасата, която попада в природата, се раздробява от слънцето и вълните на все по-малки частици. Частиците под 5 mm наричат{' '}
            <strong>микропластмаса</strong>; откриват ги в моретата, почвата и дори във въздуха. Доколко вредят на организмите, още се
            изследва. Полимлечната <Term id="acid">киселина</Term> (PLA) се получава от царевично нишесте и се смята за биоразградима – но бързо се разгражда главно
            в промишлени компостиращи инсталации при около 60 °C, а не в градинския компост или в морето.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 8. Тренажор
          </h2>
          <p className={text}>
            Степен на полимеризация, моларна маса на полимер, <Term id="mass-fraction">масова част</Term> на елемент, вода при
            поликондензация и среднобройна моларна маса. Десетичните отговори въвеждай като 5,6.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Полимерите около нас</h2>
          <p className={text}>Торбички, бутилки, тигани и чаши – сметките с полимери са навсякъде около нас.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Мономер с единична връзка', 'Етанът $\\mathrm{C_2H_6}$ полимеризира като етена.', 'За присъединяване е нужна двойна връзка $\\mathrm{C{=}C}$; етанът няма такава.'],
              ['Звеното при поликондензация', 'Звеното на PET е сбор от двата мономера.', 'От звеното са излезли 2 молекули вода: $166 + 62 - 36 = 192\\ \\mathrm{g/mol}$.'],
              ['Двойната връзка в полимера', 'В полиетилена има двойни връзки $\\mathrm{C{=}C}$.', 'Двойните връзки се „отварят“ – полиетиленът е наситен, като дълъг алкан.'],
              ['Моларна маса на полимер', 'Полимерът има точна моларна маса.', 'Веригите са различни по дължина – дава се средна стойност ($M_n$ или $M_w$).'],
              ['Биоразградим = изчезва навсякъде', 'Чаша от PLA изгнива в морето за месец.', 'PLA се разгражда бързо главно при промишлено компостиране, около 60 °C.'],
              ['Термопласт и реактопласт', 'Всички пластмаси могат да се претопят.', 'Реактопластите (бакелит, епоксиди) имат мрежа от ковалентни връзки и се разлагат при нагряване.'],
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
          <h2 className={h2}>11. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Поливинилхлорид има средна моларна маса 125 000 g/mol. Каква е степента на полимеризация?" check={[2000]} ask={['$n$']}>
                <p><Tex>{'M(\\mathrm{C_2H_3Cl}) = 62{,}5\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'n = \\frac{125\\,000}{62{,}5} = 2000'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Кой е мономерът на полипропилена? Каква е моларната маса на полипропилен със степен на полимеризация 3000?" check={[126000]} ask={['$M$, g/mol']}>
                <p>Мономерът е пропен <Tex>{'\\mathrm{CH_2{=}CH{-}CH_3}'}</Tex>, <Tex>{'M = 42\\ \\mathrm{g/mol}'}</Tex>.</p>
                <p><Tex>{'M = 3000 \\cdot 42 = 126\\,000\\ \\mathrm{g/mol}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Каква е масовата част на хлора в поливинилхлорида (в %)?" check={[56.8]} ask={['$w(\\mathrm{Cl})$, %']}>
                <p>Масовата част в полимера е същата като в звеното <Tex>{'\\mathrm{C_2H_3Cl}'}</Tex>.</p>
                <p><Tex>{'w(\\mathrm{Cl}) = \\frac{35{,}5}{62{,}5} = 0{,}568 = 56{,}8\\%'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Бутилка от PET тежи 24 g. Колко мола звена $\mathrm{C_{10}H_8O_4}$ съдържа и колко грама етиленгликол $\mathrm{C_2H_6O_2}$ са нужни за получаването ѝ?" check={[0.125, 7.75]} ask={['звена, mol', 'етиленгликол, g']}>
                <p><Tex>{'M(\\mathrm{C_{10}H_8O_4}) = 192\\ \\mathrm{g/mol}'}</Tex>, <Tex>{'n = \\frac{24}{192} = 0{,}125\\ \\mathrm{mol}'}</Tex>.</p>
                <p>Всяко звено съдържа една частица етиленгликол: <Tex>{'m = 0{,}125 \\cdot 62 = 7{,}75\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Верига от найлон-6,6 (звено $\mathrm{C_{12}H_{22}N_2O_2}$) има моларна маса около 113 000 g/mol. Колко звена има тя и колко молекули вода са се отделили при образуването ѝ?" check={[500, 999]} ask={['$n$', 'молекули вода']}>
                <p><Tex>{'M(\\text{звено}) = 12 \\cdot 12 + 22 + 2 \\cdot 14 + 2 \\cdot 16 = 226\\ \\mathrm{g/mol}'}</Tex>, <Tex>{'n = \\frac{113\\,000}{226} = 500'}</Tex>.</p>
                <p>Веригата е от 1000 мономера (500 диамина и 500 киселини), свързани с 999 амидни връзки – и при всяка се отделя молекула вода.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Проба полимер съдържа 1 mol вериги с M = 10 000 g/mol и 1 mol вериги с M = 30 000 g/mol. Намерете $M_n$ и $M_w$." check={[20000, 25000]} ask={['$M_n$, g/mol', '$M_w$, g/mol']}>
                <p><Tex>{'M_n = \\frac{10\\,000 + 30\\,000}{2} = 20\\,000\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'M_w = \\frac{10\\,000^2 + 30\\,000^2}{40\\,000} = 25\\,000\\ \\mathrm{g/mol}'}</Tex>, а <Tex>{'\\text{Đ} = 1{,}25'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Изгарят напълно 1 kg PVC: $\mathrm{2C_2H_3Cl} + \mathrm{5O_2} \to \mathrm{4CO_2} + \mathrm{2H_2O} + \mathrm{2HCl}$. Колко литра HCl и колко литра $\mathrm{CO_2}$ (при н.у.) се отделят?" check={[358.4, 716.8]} ask={['HCl, L', '$\\mathrm{CO_2}$, L']}>
                <p><Tex>{'n(\\text{звена}) = \\frac{1000}{62{,}5} = 16\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{HCl}) = 16\\ \\mathrm{mol}'}</Tex>, <Tex>{'V = 16 \\cdot 22{,}4 = 358{,}4\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{CO_2}) = 32\\ \\mathrm{mol}'}</Tex>, <Tex>{'V = 32 \\cdot 22{,}4 = 716{,}8\\ \\mathrm{L}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Гума съдържа 3% сяра по маса, а останалото е полиизопрен (звено $\mathrm{C_5H_8}$). Колко звена изопрен се падат средно на един серен атом?" check={[15.2]} ask={['звена на атом S']}>
                <p>В 100 g гума: <Tex>{'n(\\mathrm{C_5H_8}) = \\frac{97}{68} \\approx 1{,}426\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{S}) = \\frac{3}{32} = 0{,}09375\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'\\frac{1{,}426}{0{,}09375} \\approx 15{,}2'}</Tex> звена на атом сяра. Мостовете са от по няколко серни атома, така че между веригите има по един мост на няколко десетки звена.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Присъединителен полимер съдържа 38,4% C, 4,8% H и 56,8% Cl по маса. Намерете емпиричната формула на звеното и степента на полимеризация, ако M = 50 000 g/mol." check={[800]} ask={['$n$']}>
                <p><Tex>{'\\mathrm{C} : \\mathrm{H} : \\mathrm{Cl} = \\frac{38{,}4}{12} : \\frac{4{,}8}{1} : \\frac{56{,}8}{35{,}5} = 3{,}2 : 4{,}8 : 1{,}6 = 2 : 3 : 1'}</Tex></p>
                <p>Звеното е <Tex>{'\\mathrm{C_2H_3Cl}'}</Tex> – това е PVC (при присъединяване звеното е самият мономер, а мономерът трябва да има двойна връзка: <Tex>{'\\mathrm{CH_2{=}CHCl}'}</Tex>).</p>
                <p><Tex>{'n = \\frac{50\\,000}{62{,}5} = 800'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Полимерът е изграден от макромолекули с повтарящи се звена; степента на полимеризация е <Tex>{'n = M(\\text{полимер})/M(\\text{звено})'}</Tex></li>
              <li>✓ Присъединителна полимеризация: мономери с <Tex>{'\\mathrm{C{=}C}'}</Tex>, без странични продукти – PE, PP, PVC, PS, PTFE</li>
              <li>✓ Поликондензация: мономери с по две функционални групи, отделя се вода – полиестери (PET) и полиамиди (найлон)</li>
              <li>✓ Моларната маса на полимера е средна: <Tex>{'M_n'}</Tex>, <Tex>{'M_w \\ge M_n'}</Tex>, дисперсност <Tex>{'\\text{Đ} = M_w/M_n'}</Tex></li>
              <li>✓ Термопластите се размекват при нагряване; реактопластите и вулканизираният каучук имат мрежа от ковалентни връзки</li>
              <li>✓ Нишестето, целулозата и <Term id="protein">белтъците</Term> са природни полимери</li>
              <li>✓ Кодовете 1–7 показват вида на пластмасата; PE и PP плуват във вода, PET и PVC потъват</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Тефлонът е открит случайно. През 1938 г. Рой Планкет от DuPont отваря бутилка с газ тетрафлуороетен, но от нея не излиза нищо –
              а бутилката тежи колкото пълна. Когато я разрязват, вътре намират бял хлъзгав прах: газът сам е полимеризирал. Новото вещество не
              реагира почти с нищо и нищо не залепва за него.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
