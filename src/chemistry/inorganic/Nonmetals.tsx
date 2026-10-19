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
import { atomicMass, formulaTex, molarMass, parseFormula } from '../formula';
import GasCollectionLab from './GasCollectionLab';
import HalogenDisplacementLab from './HalogenDisplacementLab';
import IndustrialProcessLab from './IndustrialProcessLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');

// Реагент → газ: формула, маса × 10 (цели числа), моларна маса × 10, отношение на моловете газ : реагент, уравнение
const GAS_PREPS: { r: string; gas: string; masses10: number[]; M10: number; ratio: [number, number]; eq: string }[] = [
  { r: 'Zn', gas: 'H2', masses10: [65, 130, 325], M10: 650, ratio: [1, 1], eq: '\\mathrm{Zn + 2HCl \\to ZnCl_2 + H_2}' },
  { r: 'CaCO3', gas: 'CO2', masses10: [100, 250, 500], M10: 1000, ratio: [1, 1], eq: '\\mathrm{CaCO_3 + 2HCl \\to CaCl_2 + H_2O + CO_2}' },
  { r: 'MnO2', gas: 'Cl2', masses10: [87, 174, 435], M10: 870, ratio: [1, 1], eq: '\\mathrm{MnO_2 + 4HCl \\to MnCl_2 + Cl_2 + 2H_2O}' },
  { r: 'KMnO4', gas: 'O2', masses10: [316, 632], M10: 1580, ratio: [1, 2], eq: '\\mathrm{2KMnO_4 \\to K_2MnO_4 + MnO_2 + O_2}' },
  { r: 'NH4Cl', gas: 'NH3', masses10: [107, 214, 535], M10: 535, ratio: [1, 1], eq: '\\mathrm{2NH_4Cl + Ca(OH)_2 \\to CaCl_2 + 2NH_3 + 2H_2O}' },
  { r: 'H2O2', gas: 'O2', masses10: [34, 68, 170], M10: 340, ratio: [1, 2], eq: '\\mathrm{2H_2O_2 \\to 2H_2O + O_2}' },
];

// Съединения, в които масовата част на елемента е крайна десетична дроб
const FRACTIONS: [string, string][] = [
  ['NH4NO3', 'N'],
  ['SO3', 'S'],
  ['SO2', 'S'],
  ['Ca3(PO4)2', 'P'],
  ['CaCO3', 'C'],
  ['NH4NO3', 'O'],
  ['SO3', 'O'],
];

const DENSITY_GASES = ['Cl2', 'SO2', 'NH3', 'CO2', 'O3', 'HCl', 'H2S', 'NO2'];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const m = pick([8, 16, 32, 48, 64, 96, 160]);
    const eta = pick([75, 80, 90, 95]);
    const theory = (m * 98) / 32;
    return {
      tex: `m(\\mathrm{S}) = ${m}\\ \\mathrm{t},\\quad \\eta = ${eta}\\%`,
      ask: 'Колко тона H₂SO₄ се получават по контактния метод?',
      num: m * 98 * eta,
      den: 32 * 100,
      steps: [
        `От 1 mol S се получава 1 mol $\\mathrm{H_2SO_4}$: от 32 t сяра – 98 t киселина.`,
        `$m_{\\text{теор}} = ${m} \\cdot \\frac{98}{32} = ${dec(theory)}\\ \\mathrm{t}$`,
        `$m = ${dec(theory)} \\cdot ${dec(eta / 100)} = ${dec((theory * eta) / 100)}\\ \\mathrm{t}$`,
      ],
    };
  }
  if (kind === 1) {
    const g = pick(GAS_PREPS);
    const m10 = pick(g.masses10);
    const [rn, rd] = g.ratio;
    const n = m10 / g.M10;
    const nGas = (n * rn) / rd;
    return {
      tex: `m(${formulaTex(g.r)}) = ${dec(m10 / 10)}\\ \\mathrm{g}`,
      ask: `Колко литра ${g.gas.replace(/(\d)/g, (d: string) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])} (н.у.) се получават от това количество?`,
      num: m10 * rn * 224,
      den: g.M10 * rd * 10,
      steps: [
        // На две части, за да се пренася на тесен екран
        `$\\mathrm{${g.eq.slice(8, -1).split(' \\to ')[0]} \\to}$ $\\mathrm{${g.eq.slice(8, -1).split(' \\to ')[1]}}$`,
        `$n(${formulaTex(g.r)}) = \\frac{${dec(m10 / 10)}}{${dec(g.M10 / 10)}} = ${dec(n)}\\ \\mathrm{mol}$`,
        rn === rd ? `По уравнението $n(${formulaTex(g.gas)}) = ${dec(nGas)}\\ \\mathrm{mol}$` : `По уравнението газът е половината: $n(${formulaTex(g.gas)}) = ${dec(nGas)}\\ \\mathrm{mol}$`,
        `$V = ${dec(nGas)} \\cdot 22{,}4 = ${dec(nGas * 22.4)}\\ \\mathrm{L}$`,
      ],
    };
  }
  if (kind === 2) {
    const V100 = pick([112, 224, 448, 1120]);
    const [salt, x2, M2] = pick<[string, string, number]>([
      ['KBr', 'Br2', 160],
      ['KI', 'I2', 254],
      ['NaBr', 'Br2', 160],
    ]);
    const n = V100 / 2240;
    return {
      tex: `\\mathrm{Cl_2} + 2${formulaTex(salt)} \\to 2${formulaTex(salt.replace(/Br|I/, 'Cl'))} + ${formulaTex(x2)}`,
      ask: `През излишък от разтвор на ${salt} пропускат ${dec(V100 / 100).replace('{,}', ',')} L хлор (н.у.). Колко грама ${x2.replace('2', '₂')} се отделят?`,
      num: V100 * M2,
      den: 2240,
      steps: [`$n(\\mathrm{Cl_2}) = \\frac{${dec(V100 / 100)}}{22{,}4} = ${dec(n)}\\ \\mathrm{mol} = n(${formulaTex(x2)})$`, `$m = ${dec(n)} \\cdot ${M2} = ${dec(n * M2)}\\ \\mathrm{g}$`],
    };
  }
  if (kind === 3) {
    const [f, el] = pick(FRACTIONS);
    const M = molarMass(f);
    const k = (parseFormula(f).get(el) ?? 0) * atomicMass(el);
    return {
      tex: `\\omega(\\mathrm{${el}})\\ \\text{в}\\ ${formulaTex(f)}`,
      ask: 'Каква е масовата част на елемента (в %)?',
      num: 100 * k,
      den: M,
      steps: [`$M(${formulaTex(f)}) = ${M}\\ \\mathrm{g/mol}$, в него има $${k}\\ \\mathrm{g}$ ${el === 'O' ? 'кислород' : el === 'N' ? 'азот' : el === 'S' ? 'сяра' : el === 'P' ? 'фосфор' : 'въглерод'}`, `$\\omega = \\frac{${k}}{${M}} \\cdot 100\\% = ${dec((100 * k) / M)}\\%$`],
    };
  }
  const g = pick(DENSITY_GASES);
  const M = molarMass(g);
  return {
    tex: `D_{\\mathrm{H_2}}(${formulaTex(g)})`,
    ask: 'Каква е относителната плътност на газа спрямо водорода?',
    num: M,
    den: 2,
    steps: [`$M(${formulaTex(g)}) = ${dec(M)}\\ \\mathrm{g/mol}$`, `$D_{\\mathrm{H_2}} = \\frac{${dec(M)}}{2} = ${dec(M / 2)}$ – газът е ${dec(M / 2).replace('{,}', ',')} пъти по-тежък от водорода${M > 29 ? ' и по-тежък от въздуха' : ', но по-лек от въздуха'}.`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🏊 Хлориране на вода',
    problem: 'Водата в резервоар с обем 1000 m³ се обеззаразява с хлор в доза 2 mg на литър. Колко литра хлор (н.у.) са нужни?',
    solution: ['$1000\\ \\mathrm{m^3} = 10^6\\ \\mathrm{L}$; $m(\\mathrm{Cl_2}) = 10^6 \\cdot 2\\ \\mathrm{mg} = 2\\ \\mathrm{kg}$', '$n = \\frac{2000}{71} \\approx 28{,}2\\ \\mathrm{mol}$', '$V = 28{,}2 \\cdot 22{,}4 \\approx 631\\ \\mathrm{L}$ – по-малко от кубичен метър газ за цял резервоар.'],
    answer: '$\\approx 631\\ \\mathrm{L}$',
    check: [631],
    ask: ['хлор, L'],
  },
  {
    title: '⛏️ Сярна киселина от пирит',
    problem: 'Руда съдържа 60% пирит $\\mathrm{FeS_2}$. Колко килограма $\\mathrm{H_2SO_4}$ се получават от 1 тон руда, ако общият добив е 90%?',
    solution: ['$m(\\mathrm{FeS_2}) = 600\\ \\mathrm{kg}$, $n = \\frac{600}{120} = 5\\ \\mathrm{kmol}$', 'Всеки мол $\\mathrm{FeS_2}$ съдържа 2 мола сяра, значи $n(\\mathrm{H_2SO_4}) = 10\\ \\mathrm{kmol}$', '$m = 10 \\cdot 98 \\cdot 0{,}9 = 882\\ \\mathrm{kg}$'],
    answer: '$882\\ \\mathrm{kg}$',
    check: [882],
    ask: ['H₂SO₄, kg'],
  },
  {
    title: '🌾 Тор за нивата',
    problem: 'За нива от 2 ha са нужни по 120 kg азот на хектар. Колко килограма амониева селитра $\\mathrm{NH_4NO_3}$ трябва да се внесат?',
    solution: ['Нужен азот: $2 \\cdot 120 = 240\\ \\mathrm{kg}$', '$\\omega(\\mathrm{N}) = \\frac{28}{80} = 35\\%$', '$m = \\frac{240}{0{,}35} \\approx 686\\ \\mathrm{kg}$ селитра.'],
    answer: '$\\approx 686\\ \\mathrm{kg}$',
    check: [686],
    ask: ['селитра, kg'],
  },
  {
    title: '🌍 Колко е озонът',
    problem: 'Ако целият озон над дадено място се събере в слой при нормални условия, дебелината му обикновено е около 3 mm. Колко молекули озон има над 1 cm² от повърхността? (Отговорът – в $10^{18}$ молекули.)',
    solution: ['Обемът на стълба над 1 cm²: $0{,}3\\ \\mathrm{cm} \\cdot 1\\ \\mathrm{cm^2} = 0{,}3\\ \\mathrm{cm^3} = 3 \\cdot 10^{-4}\\ \\mathrm{L}$', '$n = \\frac{3 \\cdot 10^{-4}}{22{,}4} \\approx 1{,}34 \\cdot 10^{-5}\\ \\mathrm{mol}$', '$N = 1{,}34 \\cdot 10^{-5} \\cdot 6{,}02 \\cdot 10^{23} \\approx 8{,}07 \\cdot 10^{18}$ молекули. Този тънък слой спира по-голямата част от опасното ултравиолетово лъчение.'],
    answer: '$\\approx 8{,}07 \\cdot 10^{18}$',
    check: [8.07],
    ask: ['молекули, ×10¹⁸'],
  },
  {
    title: '🧯 Пожарогасител с CO₂',
    problem: 'Пожарогасител съдържа 5 kg въглероден диоксид. Какъв обем ще заеме газът при 20 °C и 101,3 kPa (в m³)?',
    solution: ['$n = \\frac{5000}{44} \\approx 113{,}6\\ \\mathrm{mol}$', '$V = \\frac{nRT}{p} = \\frac{113{,}6 \\cdot 8{,}314 \\cdot 293}{101{,}3} \\approx 2730\\ \\mathrm{L} \\approx 2{,}73\\ \\mathrm{m^3}$', 'Газът е по-тежък от въздуха, покрива огъня и изтласква кислорода от него.'],
    answer: '$\\approx 2{,}73\\ \\mathrm{m^3}$',
    check: [2.73],
    ask: ['CO₂, m³'],
  },
  {
    title: '🪟 Пясък за стъклото',
    problem: 'Обикновеното прозоречно стъкло има приблизителен състав $\\mathrm{Na_2O \\cdot CaO \\cdot 6SiO_2}$. Колко килограма $\\mathrm{SiO_2}$ (пясък) има в 1 тон такова стъкло?',
    solution: ['$M = 62 + 56 + 6 \\cdot 60 = 478\\ \\mathrm{g/mol}$', '$\\omega(\\mathrm{SiO_2}) = \\frac{360}{478} \\approx 0{,}753$', '$m = 0{,}753 \\cdot 1000 \\approx 753\\ \\mathrm{kg}$ – стъклото е три четвърти пясък.'],
    answer: '$\\approx 753\\ \\mathrm{kg}$',
    check: [753],
    ask: ['SiO₂, kg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой халоген измества брома от разтвор на калиев бромид?',
    answers: ['$\\mathrm{Cl_2}$', '$\\mathrm{I_2}$', '$\\mathrm{Br_2}$', 'нито един'],
    correctAnswer: '$\\mathrm{Cl_2}$',
  },
  {
    question: 'Как се събира амонякът в лабораторията?',
    answers: ['в обърнат съд', 'в съд с отвора нагоре', 'над вода', 'над разтвор на сол'],
    correctAnswer: 'в обърнат съд',
  },
  {
    question: 'Кое от тези вещества НЕ е алотропна форма на въглерода?',
    answers: ['въглероден диоксид', 'диамант', 'графит', 'фулерен'],
    correctAnswer: 'въглероден диоксид',
  },
  {
    question: 'Как се доказва въглеродният диоксид?',
    answers: ['варната вода помътнява', 'тлееща треска се разпалва', 'гасне горяща треска', 'лакмусът посинява'],
    correctAnswer: 'варната вода помътнява',
  },
  {
    question: 'Кой е катализаторът при окислението на $\\mathrm{SO_2}$ до $\\mathrm{SO_3}$ в контактния метод?',
    answers: ['$\\mathrm{V_2O_5}$', '$\\mathrm{Fe}$', '$\\mathrm{MnO_2}$', '$\\mathrm{Ni}$'],
    correctAnswer: '$\\mathrm{V_2O_5}$',
  },
  {
    question: 'Как се разрежда концентрирана сярна киселина?',
    answers: ['киселината се налива на тънка струя във водата', 'водата се налива в киселината', 'все едно е', 'смесват се наведнъж'],
    correctAnswer: 'киселината се налива на тънка струя във водата',
  },
  {
    question: 'Кой елемент има най-голяма електроотрицателност?',
    answers: ['$\\mathrm{F}$', '$\\mathrm{O}$', '$\\mathrm{Cl}$', '$\\mathrm{N}$'],
    correctAnswer: '$\\mathrm{F}$',
  },
  {
    question: 'Каква е относителната плътност на хлора спрямо водорода?',
    answers: ['$35{,}5$', '$71$', '$2{,}45$', '$17{,}75$'],
    correctAnswer: '$35{,}5$',
  },
  {
    question: 'Кой газ може да се събере над вода?',
    answers: ['$\\mathrm{O_2}$', '$\\mathrm{NH_3}$', '$\\mathrm{HCl}$', '$\\mathrm{SO_2}$'],
    correctAnswer: '$\\mathrm{O_2}$',
  },
];

// ---------- Страница ----------

const ALLOTROPES: [string, string, string][] = [
  ['диамант', 'всеки атом C е свързан с 4 други в тетраедрична пространствена мрежа', 'най-твърдото природно вещество, не провежда ток, $\\rho \\approx 3{,}5\\ \\mathrm{g/cm^3}$'],
  ['графит', 'слоеве от шестоъгълници, слабо свързани помежду си', 'мек (оставя следа – молив), провежда ток, $\\rho \\approx 2{,}2\\ \\mathrm{g/cm^3}$'],
  ['фулерен $\\mathrm{C_{60}}$', 'молекула от 60 атома с форма на футболна топка', 'открит през 1985 г.; разтваря се в някои органични разтворители'],
  ['кислород $\\mathrm{O_2}$', 'двуатомни молекули', 'без цвят и мирис, кипи при $-183\\ ^\\circ\\mathrm{C}$'],
  ['озон $\\mathrm{O_3}$', 'триатомни молекули', 'синкав газ с остра миризма, кипи при $-112\\ ^\\circ\\mathrm{C}$, много по-силен окислител'],
  ['бял фосфор $\\mathrm{P_4}$', 'отделни тетраедрични молекули', 'свети в тъмното, самозапалва се на въздуха, пази се под вода, силно отровен'],
  ['червен фосфор', 'дълги вериги (полимер)', 'устойчив, неотровен; намазан е отстрани на кибритената кутийка'],
];

const GAS_TABLE: [string, string, string, string][] = [
  ['$\\mathrm{H_2}$', '2', 'над вода или в обърнат съд', 'изгърмява с „лай“ при пламък'],
  ['$\\mathrm{O_2}$', '32', 'над вода или в съд с отвора нагоре', 'тлееща треска се разпалва'],
  ['$\\mathrm{CO_2}$', '44', 'в съд с отвора нагоре', 'варната вода помътнява'],
  ['$\\mathrm{NH_3}$', '17', 'в обърнат съд (не над вода!)', 'влажен червен лакмус посинява'],
  ['$\\mathrm{Cl_2}$', '71', 'в съд с отвора нагоре, в камина', 'жълтозелен цвят, обезцветява влажен лакмус'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 align-top';

export function Nonmetals() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Неметали</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔦 През 1669 г. хамбургският алхимик Хенинг Бранд търси философския камък – вещество, което превръща металите в злато. Той
            изпарява голямо количество урина, нагрява остатъка силно и получава восъчна бяла маса, която <strong>свети в тъмното</strong>.
            Злато не намира, но открива нов елемент – фосфора („носител на светлина“ на гръцки). Бранд е първият известен по име човек,
            открил <Term id="chemical-element">химичен елемент</Term>. Днес знаем, че светенето идва от бавното <Term id="oxidation">окисление</Term> на белия фосфор от кислорода във въздуха.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Неметалите в периодичната система</h2>
          <p className={text}>
            Неметалите са в горния десен ъгъл на <Term id="periodic-table">периодичната система</Term> – над диагонала B–Si–As–Te, където са полуметалите. Те са малко
            (около двадесет елемента, ако броим и благородните газове), но изграждат въздуха, водата, скалите и живите организми. Водородът е
            неметал, макар да стои в група 1. Повече за мястото на елементите в таблицата – в урока{' '}
            <Link to="/chemistry/structure/atoms" className={link}>
              Атоми, изотопи и периодичната система
            </Link>
            .
          </p>
          <Theorem
            type="definition"
            title="Общи свойства на неметалите"
            description="Атомите на неметалите имат много електрони на външния слой (4–8) и висока електроотрицателност. В реакции с метали те приемат електрони и образуват аниони ($\mathrm{Cl^-}$, $\mathrm{O^{2-}}$, $\mathrm{S^{2-}}$) – държат се като окислители. Помежду си се свързват с ковалентни връзки. Простите им вещества не провеждат ток (с изключение на графита), нямат метален блясък и при стайна температура често са газове."
          />
          <p className={text}>
            Колкото по-голяма е <Term id="electronegativity">електроотрицателността</Term>, толкова по-силен <Term id="oxidizing-agent">окислител</Term> е неметалът.
            Флуорът (3,98) е най-силният – той само приема електрони. Кислородът (3,44) и хлорът (3,16) също са силни окислители. Сярата,
            въглеродът, фосфорът и водородът могат да бъдат и окислители, и <Term id="reducing-agent">редуктори</Term>: в <Tex>{'\\mathrm{SO_2}'}</Tex> сярата е отдала
            електрони на кислорода, а в <Tex>{'\\mathrm{H_2S}'}</Tex> – е приела от водорода.
          </p>
          <p className={text}>
            При стайна температура единадесет неметала са газове (<Tex>{'\\mathrm{H_2}'}</Tex>, <Tex>{'\\mathrm{N_2}'}</Tex>,{' '}
            <Tex>{'\\mathrm{O_2}'}</Tex>, <Tex>{'\\mathrm{F_2}'}</Tex>, <Tex>{'\\mathrm{Cl_2}'}</Tex> и шестте благородни газа), бромът е
            течност, а въглеродът, фосфорът, сярата, селенът и йодът са твърди вещества.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Водород</h2>
          <p className={text}>
            Водородът е най-лекият газ – около 14,5 пъти по-лек от въздуха. Без цвят и мирис е и почти не се разтваря във вода. Гори с
            бледосин пламък до вода, а смес от два обема водород и един обем кислород („гърмящ газ“) избухва при запалване:
          </p>
          <Tex block>{'\\mathrm{2H_2 + O_2 \\to 2H_2O}'}</Tex>
          <p className={text}>
            С активните метали водородът е окислител (<Tex>{'\\mathrm{2Na + H_2 \\to 2NaH}'}</Tex>, хидрид с <Tex>{'\\mathrm{H^-}'}</Tex>), но
            най-често е редуктор: отнема кислорода от металните <Term id="oxide">оксиди</Term>, например <Tex>{'\\mathrm{CuO + H_2 \\to Cu + H_2O}'}</Tex>. В
            лабораторията се получава от цинк и разредена <Term id="acid">киселина</Term>, а в промишлеността – най-вече от природен газ и водна пара:
          </p>
          <Tex block>{'\\mathrm{CH_4 + H_2O \\xrightarrow{t,\\ Ni} CO + 3H_2}'}</Tex>
          <Example
            description="Колко кубични метра водород се получават от 100 m³ метан по горното уравнение? (Обемите са при еднакви условия.)"
            steps={['Обемите на газовете се отнасят като коефициентите: на 1 обем метан – 3 обема водород.', '$V(\\mathrm{H_2}) = 3 \\cdot 100 = 300\\ \\mathrm{m^3}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Халогени</h2>
          <p className={text}>
            <Term id="halogens">Халогените</Term> (група 17) имат по 7 външни електрона и лесно приемат още един. Простите им вещества са
            двуатомни молекули: флуорът е бледожълт газ, хлорът – жълтозелен газ, бромът – червенокафява течност, а йодът – тъмновиолетови
            кристали, които при нагряване направо се превръщат в лилави пари (сублимират). Всички са отровни.
          </p>
          <Theorem
            title="Ред на активност на халогените"
            description="Окислителната сила на халогените намалява надолу в групата: $\mathrm{F_2 > Cl_2 > Br_2 > I_2}$. По-активният халоген измества по-слабия от разтворите на неговите соли: $\mathrm{Cl_2 + 2KBr \to 2KCl + Br_2}$, $\mathrm{Br_2 + 2KI \to 2KBr + I_2}$. Обратното не става."
          />
          <p className={text}>
            Причината е в размера на атома: надолу в групата външният слой е по-далеч от ядрото и новият електрон се привлича по-слабо. Това
            е пряко свързано с <Link to="/chemistry/reactions/redox" className={link}>електродните потенциали</Link>: за{' '}
            <Tex>{'\\mathrm{Cl_2/Cl^-}'}</Tex> той е <Tex>{'+1{,}36\\ \\mathrm{V}'}</Tex>, за <Tex>{'\\mathrm{I_2/I^-}'}</Tex> – само{' '}
            <Tex>{'+0{,}54\\ \\mathrm{V}'}</Tex>.
          </p>
          <HalogenDisplacementLab />
          <p className={text}>
            Хлороводородът <Tex>{'\\mathrm{HCl}'}</Tex> е газ, който се разтваря много добре във вода и дава солна киселина. Такава
            киселина има и в стомашния сок. Хлорът обеззаразява водата: с нея той образува хипохлориста киселина{' '}
            <Tex>{'\\mathrm{HClO}'}</Tex>, която убива микробите (<Tex>{'\\mathrm{Cl_2 + H_2O \\rightleftharpoons HCl + HClO}'}</Tex>).
          </p>
          <Example
            description="Колко грама бром се отделят, ако през разтвор на калиев бромид се пропуснат 1,12 L хлор (н.у.)?"
            steps={['$n(\\mathrm{Cl_2}) = \\frac{1{,}12}{22{,}4} = 0{,}05\\ \\mathrm{mol}$', 'По уравнението $\\mathrm{Cl_2 + 2KBr \\to 2KCl + Br_2}$: $n(\\mathrm{Br_2}) = 0{,}05\\ \\mathrm{mol}$', '$m = 0{,}05 \\cdot 160 = 8\\ \\mathrm{g}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Кислород, озон и алотропия</h2>
          <p className={text}>
            Кислородът е най-разпространеният елемент в земната кора и около 21% от обема на въздуха. Поддържа горенето и дишането. С почти
            всички елементи образува оксиди. Но кислородът съществува и като друго <Term id="simple-substance">просто вещество</Term> – озон.
          </p>
          <Theorem
            type="definition"
            title="Алотропия"
            description="Алотропията е съществуването на един химичен елемент като няколко прости вещества с различен строеж и свойства. Тези вещества са алотропни форми (модификации) на елемента. Например кислородът $\mathrm{O_2}$ и озонът $\mathrm{O_3}$, диамантът и графитът, белият и червеният фосфор."
          />
          <p className={text}>
            Озонът се образува от кислорода при електрични разряди (мирисът след гръмотевична буря) и под действие на ултравиолетова
            светлина: <Tex>{'\\mathrm{3O_2 \\to 2O_3}'}</Tex>. Високо в атмосферата, приблизително на 15–35 km височина, той образува
            озоновия слой, който поглъща голяма част от опасното ултравиолетово лъчение на Слънцето. Близо до земята обаче озонът е
            замърсител – дразни дробовете.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Алотропна форма</th>
                  <th className={th}>Строеж</th>
                  <th className={th}>Свойства</th>
                </tr>
              </thead>
              <tbody>
                {ALLOTROPES.map(([name, structure, props]) => (
                  <tr key={name}>
                    <td className={`${td} font-medium`}>
                      <MathText>{name}</MathText>
                    </td>
                    <td className={td}>{structure}</td>
                    <td className={td}>
                      <MathText>{props}</MathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Сяра и сярна киселина</h2>
          <p className={text}>
            Сярата е жълто твърдо вещество от молекули <Tex>{'\\mathrm{S_8}'}</Tex>. Гори със син пламък до серен диоксид{' '}
            <Tex>{'\\mathrm{SO_2}'}</Tex> – газ с остра задушлива миризма, причина за <Term id="acid-rain">киселинните дъждове</Term>. Сероводородът{' '}
            <Tex>{'\\mathrm{H_2S}'}</Tex> мирише на развалени яйца и е отровен.
          </p>
          <p className={text}>
            Сярната киселина е най-произвежданото химично вещество в света – от нея се правят торове, бои, перилни препарати и акумулатори.
            Получава се по <strong>контактния метод</strong>:
          </p>
          <Theorem
            title="Контактен метод за сярна киселина"
            description="1) Изгаряне на сяра или пирит: $\mathrm{S + O_2 \to SO_2}$. 2) Каталитично окисление при около $450\ ^\circ\mathrm{C}$ с катализатор $\mathrm{V_2O_5}$: $\mathrm{2SO_2 + O_2 \rightleftharpoons 2SO_3}$. 3) Абсорбция: $\mathrm{SO_3}$ се поглъща от концентрирана $\mathrm{H_2SO_4}$ (а не от вода, защото с нея образува гъста мъгла) и полученият олеум се разрежда до нужната концентрация."
          />
          <p className={text}>
            Вторият етап е обратима <Term id="exothermic-reaction">екзотермична реакция</Term> – условията ѝ са подбрани по <Term id="le-chatelier-principle">принципа на Льо Шателие</Term> (виж{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              Химично равновесие
            </Link>
            ), а <Term id="catalyst">катализаторът</Term> я ускорява.
          </p>
          <p className={text}>
            Концентрираната сярна киселина (около 98%, плътност 1,84 g/cm³) е опасна. Тя е силно <strong>водоотнемащо</strong> вещество:
            овъглява захарта (<Tex>{'\\mathrm{C_{12}H_{22}O_{11} \\to 12C + 11H_2O}'}</Tex>), хартията и кожата. Тя е и окислител – реагира
            дори с медта, като се отделя <Tex>{'\\mathrm{SO_2}'}</Tex>, а не водород:
          </p>
          <Tex block>{'\\mathrm{Cu + 2H_2SO_4\\,\\text{(конц.)} \\to CuSO_4 + SO_2 + 2H_2O}'}</Tex>
          <p className={text}>
            Желязото и алуминият на студено се покриват със защитен слой и не реагират с нея (<Term id="passivation">пасивират</Term> се) – затова концентрираната
            киселина се превозва в стоманени цистерни. При разреждане се отделя много топлина, затова правилото е:{' '}
            <strong>киселината се налива във водата</strong> на тънка струя, а не обратното.
          </p>
          <Example
            description="Колко грама вода трябва да се добавят към 100 g 98% сярна киселина, за да се получи 20% разтвор?"
            steps={['Масата на киселината не се променя: $m(\\mathrm{H_2SO_4}) = 98\\ \\mathrm{g}$', '$m_{\\text{разтвор}} = \\frac{98}{0{,}20} = 490\\ \\mathrm{g}$', 'Вода: $490 - 100 = 390\\ \\mathrm{g}$ – и киселината се налива в тях, не обратното.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Азот, фосфор и торовете</h2>
          <p className={text}>
            Азотът е 78% от обема на въздуха, но е много инертен: двата атома в <Tex>{'\\mathrm{N_2}'}</Tex> са свързани с тройна връзка с
            енергия около 945 kJ/mol. Затова растенията не могат да го използват пряко. Синтезът на амоняк{' '}
            <Tex>{'\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}'}</Tex> по <Term id="haber-bosch-process">метода на Хабер–Бош</Term> разгледахме в урока{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              Химично равновесие
            </Link>
            . От амоняка пък се получава азотната киселина:
          </p>
          <Theorem
            title="Метод на Оствалд за азотна киселина"
            description="1) Каталитично окисление на амоняка върху мрежа от платина и родий при около $900\ ^\circ\mathrm{C}$: $\mathrm{4NH_3 + 5O_2 \to 4NO + 6H_2O}$. 2) Окисление с въздух: $\mathrm{2NO + O_2 \to 2NO_2}$. 3) Поглъщане във вода в присъствие на кислород: $\mathrm{4NO_2 + O_2 + 2H_2O \to 4HNO_3}$. От всеки мол $\mathrm{NH_3}$ се получава (теоретично) мол $\mathrm{HNO_3}$."
          />
          <IndustrialProcessLab />
          <p className={text}>
            Азотната киселина е силен окислител. С металите тя обикновено не отделя водород, а азотни оксиди: концентрираната дава кафявия
            <Tex>{'\\ \\mathrm{NO_2}'}</Tex>, разредената – безцветния <Tex>{'\\mathrm{NO}'}</Tex>:
          </p>
          <Tex block>{'\\mathrm{Cu + 4HNO_3\\,\\text{(конц.)} \\to Cu(NO_3)_2 + 2NO_2 + 2H_2O}'}</Tex>
          <p className={text}>
            Фосфорът е в костите и зъбите (калциев фосфат), в ДНК и в АТФ – молекулата, която пренася енергия в клетката. Растенията се
            нуждаят най-много от три елемента – азот, фосфор и калий (торовете NPK). Азотни торове са амониевата селитра{' '}
            <Tex>{'\\mathrm{NH_4NO_3}'}</Tex> и карбамидът <Tex>{'\\mathrm{CO(NH_2)_2}'}</Tex>, а фосфорен – суперфосфатът (основно{' '}
            <Tex>{'\\mathrm{Ca(H_2PO_4)_2}'}</Tex>).
          </p>
          <Example
            description="Кой тор съдържа повече азот по маса – амониевата селитра $\mathrm{NH_4NO_3}$ или карбамидът $\mathrm{CO(NH_2)_2}$?"
            steps={[
              `$\\omega(\\mathrm{N})$ в селитрата: $\\frac{28}{${molarMass('NH4NO3')}} = 35\\%$`,
              `В карбамида: $\\frac{28}{${molarMass('CO(NH2)2')}} \\approx 46{,}7\\%$`,
              'Карбамидът е по-богат на азот – затова е най-използваният азотен тор в света.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Въглерод и силиций</h2>
          <p className={text}>
            Въглеродът има най-много алотропни форми – диамант, графит, фулерени, графен (един слой графит, получен за първи път през 2004
            г.). Неговите съединения са предмет на цялата органична химия. От неорганичните най-важни са двата оксида:
          </p>
          <ul className={`${text} list-disc pl-6 space-y-1`}>
            <li>
              <strong>въглероден оксид</strong> <Tex>{'\\mathrm{CO}'}</Tex> – отровен газ без цвят и мирис. Образува се при непълно
              изгаряне (лошо проветрена печка) и се свързва с хемоглобина над 200 пъти по-здраво от кислорода;
            </li>
            <li>
              <strong>въглероден диоксид</strong> <Tex>{'\\mathrm{CO_2}'}</Tex> – продукт на пълното изгаряне и на дишането. По-тежък е от
              въздуха и не поддържа горенето. С вода дава слабата въглена киселина, а с <Term id="limewater">варна вода</Term> – <Term id="precipitate">утайка</Term> от{' '}
              <Tex>{'\\mathrm{CaCO_3}'}</Tex>.
            </li>
          </ul>
          <p className={text}>
            Карбонатите (варовик, мрамор, креда – все <Tex>{'\\mathrm{CaCO_3}'}</Tex>) реагират с киселините и отделят{' '}
            <Tex>{'\\mathrm{CO_2}'}</Tex>. Така се доказват – повече в урока{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            .
          </p>
          <Example
            description="Колко литра $\mathrm{CO_2}$ (н.у.) се отделят от 25 g варовик при действие на солна киселина?"
            steps={['$\\mathrm{CaCO_3 + 2HCl \\to}$ $\\mathrm{CaCl_2 + H_2O + CO_2}$', '$n = \\frac{25}{100} = 0{,}25\\ \\mathrm{mol}$', '$V = 0{,}25 \\cdot 22{,}4 = 5{,}6\\ \\mathrm{L}$']}
          />
          <p className={text}>
            Силицият е вторият по разпространение елемент в земната кора (около 28% от масата ѝ) след кислорода. Той е полуметал и{' '}
            <strong>полупроводник</strong> – от него се правят компютърните чипове и слънчевите батерии. Силициевият диоксид{' '}
            <Tex>{'\\mathrm{SiO_2}'}</Tex> е пясъкът и кварцът, а солите на силициевите киселини – <strong>силикатите</strong> – изграждат
            повечето скали, глината и стъклото. Обикновеното стъкло се получава, като се стопяват при около 1500 °C пясък, сода{' '}
            <Tex>{'\\mathrm{Na_2CO_3}'}</Tex> и варовик.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Благородни газове</h2>
          <p className={text}>
            <Term id="noble-gases">Благородните газове</Term> (група 18) имат пълен външен слой и почти не реагират. Използват се точно
            затова: хелият пълни балони и охлажда свръхпроводящите магнити в медицинските скенери, неонът свети в червено в рекламните
            тръби, а аргонът (около 0,93% от въздуха) пази нажежената жичка на лампите и метала при заваряване. Дълго време са ги смятали
            за напълно инертни – до 1962 г. (виж интересния факт в края).
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Получаване и събиране на газове в лабораторията</h2>
          <p className={text}>
            Как се събира газът, зависи от две неща: дали е по-лек или по-тежък от въздуха (<Term id="average-molar-mass">средна моларна маса</Term> около 29 g/mol – виж{' '}
            <Link to="/chemistry/quantities/gases" className={link}>
              Газове в химията
            </Link>
            ) и дали се разтваря във вода.
          </p>
          <Theorem
            title="Правило за събиране на газове"
            description="Слабо разтворимите във вода газове ($\mathrm{H_2}$, $\mathrm{O_2}$, $\mathrm{N_2}$) се събират над вода. Газ с $M > 29\ \mathrm{g/mol}$ се събира в съд с отвора нагоре, газ с $M < 29\ \mathrm{g/mol}$ – в обърнат съд (с отвора надолу). Добре разтворимите газове ($\mathrm{NH_3}$, $\mathrm{HCl}$) не се събират над вода."
          />
          <GasCollectionLab />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Газ</th>
                  <th className={th}>
                    <Tex>{'M,\\ \\mathrm{g/mol}'}</Tex>
                  </th>
                  <th className={th}>Събиране</th>
                  <th className={th}>Доказване</th>
                </tr>
              </thead>
              <tbody>
                {GAS_TABLE.map(([f, M, how, test]) => (
                  <tr key={f}>
                    <td className={td}>
                      <MathText>{f}</MathText>
                    </td>
                    <td className={td}>
                      <Tex>{M}</Tex>
                    </td>
                    <td className={td}>{how}</td>
                    <td className={td}>{test}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 10. Тренажор
          </h2>
          <p className={text}>
            Сярна киселина по контактния метод, обем на получен газ, изместване на халогените, <Term id="mass-fraction">масова част</Term> на елемент и <Term id="relative-density">относителна
            плътност</Term>. Десетичните отговори въвеждай като 4,48.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Неметалите около нас</h2>
          <p className={text}>Чиста вода, торове, стъкло, пожарогасители и озоновият слой – навсякъде има неметали.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Вода в киселината', 'Наливам вода в концентрираната сярна киселина.', 'Обратно: киселината – на тънка струя във водата, иначе водата кипва и пръска киселина.'],
              ['Йодът измества хлора', '$\\mathrm{I_2 + 2KCl \\to 2KI + Cl_2}$', 'Не протича: по-слабият окислител $\\mathrm{I_2}$ не измества хлора. Обратната реакция $\\mathrm{Cl_2 + 2KI}$ протича.'],
              ['Диамантът и графитът', 'Това са различни елементи.', 'Това е един и същ елемент – въглерод; различни са строежът и свойствата (алотропия).'],
              ['Амоняк над вода', 'Събирам амоняка над вода.', 'Амонякът се разтваря много добре във вода; събира се в обърнат съд, защото е по-лек от въздуха.'],
              ['Доказване на CO₂', 'Щом горящата треска гасне, газът е $\\mathrm{CO_2}$.', 'И азотът гаси треската. Сигурното доказателство е помътняването на варната вода.'],
              ['Метал + киселина = водород', '$\\mathrm{Cu + 2H_2SO_4}$ (конц.) отделя $\\mathrm{H_2}$.', 'Концентрираната $\\mathrm{H_2SO_4}$ и $\\mathrm{HNO_3}$ са окислители: отделят се $\\mathrm{SO_2}$, $\\mathrm{NO_2}$ или $\\mathrm{NO}$.'],
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
          <h2 className={h2}>13. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко литра водород (н.у.) и колко грама цинков хлорид се получават при реакцията на 13 g цинк с излишък от солна киселина?" check={[4.48, 27.2]} ask={['$\\mathrm{H_2}$, L', '$\\mathrm{ZnCl_2}$, g']}>
                <p><Tex>{'\\mathrm{Zn + 2HCl \\to ZnCl_2 + H_2}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{Zn}) = \\frac{13}{65} = 0{,}2\\ \\mathrm{mol}'}</Tex> – толкова мола водород и цинков хлорид.</p>
                <p><Tex>{'V = 0{,}2 \\cdot 22{,}4 = 4{,}48\\ \\mathrm{L}'}</Tex>, <Tex>{'m(\\mathrm{ZnCl_2}) = 0{,}2 \\cdot 136 = 27{,}2\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете относителната плътност спрямо въздуха на амоняка и на хлора. В какъв съд се събира всеки от тях?" check={[0.586, 2.45]} ask={['$D(\\mathrm{NH_3})$', '$D(\\mathrm{Cl_2})$']}>
                <p><Tex>{'D(\\mathrm{NH_3}) = \\frac{17}{29} \\approx 0{,}586'}</Tex> – по-лек от въздуха, събира се в обърнат съд.</p>
                <p><Tex>{'D(\\mathrm{Cl_2}) = \\frac{71}{29} \\approx 2{,}45'}</Tex> – по-тежък, събира се в съд с отвора нагоре.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Каква е масовата част на азота в амониевата селитра $\mathrm{NH_4NO_3}$ и в карбамида $\mathrm{CO(NH_2)_2}$ (в %)?" check={[35, 46.7]} ask={['селитра, %', 'карбамид, %']}>
                <p><Tex>{'\\omega = \\frac{2 \\cdot 14}{80} = 35\\%'}</Tex></p>
                <p><Tex>{'\\omega = \\frac{2 \\cdot 14}{60} \\approx 46{,}7\\%'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="През излишък от разтвор на калиев йодид се пропускат 2,24 L хлор (н.у.). Колко грама йод и колко грама калиев хлорид се получават?" check={[25.4, 14.9]} ask={['$\\mathrm{I_2}$, g', '$\\mathrm{KCl}$, g']}>
                <p><Tex>{'\\mathrm{Cl_2 + 2KI \\to 2KCl + I_2}'}</Tex>, <Tex>{'n(\\mathrm{Cl_2}) = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{I_2}) = 0{,}1 \\cdot 254 = 25{,}4\\ \\mathrm{g}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{KCl}) = 0{,}2 \\cdot 74{,}5 = 14{,}9\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В завод изгарят 1 тон сяра. Добивът на трите етапа на контактния метод е 98%, 96% и 99%. Колко тона $\mathrm{H_2SO_4}$ се получават?" check={[2.85]} ask={['$\\mathrm{H_2SO_4}$, t']}>
                <p>Теоретично: <Tex>{'1 \\cdot \\frac{98}{32} = 3{,}0625\\ \\mathrm{t}'}</Tex></p>
                <p>Общ добив: <Tex>{'0{,}98 \\cdot 0{,}96 \\cdot 0{,}99 \\approx 0{,}931'}</Tex></p>
                <p><Tex>{'m \\approx 3{,}0625 \\cdot 0{,}931 \\approx 2{,}85\\ \\mathrm{t}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="12,7 g мед се разтварят в концентрирана сярна киселина. Колко литра $\mathrm{SO_2}$ (н.у.) се отделят и колко грама $\mathrm{H_2SO_4}$ се изразходват?" check={[4.48, 39.2]} ask={['$\\mathrm{SO_2}$, L', '$\\mathrm{H_2SO_4}$, g']}>
                <p><Tex>{'\\mathrm{Cu + 2H_2SO_4 \\to}'}</Tex> <Tex>{'\\mathrm{CuSO_4 + SO_2 + 2H_2O}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{Cu}) = \\frac{12{,}7}{63{,}5} = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'V(\\mathrm{SO_2}) = 0{,}2 \\cdot 22{,}4 = 4{,}48\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{H_2SO_4}) = 0{,}4 \\cdot 98 = 39{,}2\\ \\mathrm{g}'}</Tex> – половината киселина отива за окисляване на медта, другата половина – за солта.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="От 1 тон амоняк по метода на Оствалд се получава азотна киселина. Добивът на окислението на $\mathrm{NH_3}$ е 96%, а на поглъщането – 98% (окислението на NO е пълно). Колко тона 100% $\mathrm{HNO_3}$ се получават и колко тона 60% разтвор може да се приготви от тях?" check={[3.49, 5.81]} ask={['$\\mathrm{HNO_3}$, t', '60% разтвор, t']}>
                <p>От 1 mol <Tex>{'\\mathrm{NH_3}'}</Tex> – 1 mol <Tex>{'\\mathrm{HNO_3}'}</Tex>: теоретично <Tex>{'1 \\cdot \\frac{63}{17} \\approx 3{,}706\\ \\mathrm{t}'}</Tex>.</p>
                <p><Tex>{'m = 3{,}706 \\cdot 0{,}96 \\cdot 0{,}98 \\approx 3{,}49\\ \\mathrm{t}'}</Tex></p>
                <p>60% разтвор: <Tex>{'\\frac{3{,}49}{0{,}6} \\approx 5{,}81\\ \\mathrm{t}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="През озонатор се пропускат 10 L кислород. След него обемът на газа е 9,5 L (при същите условия). Колко литра озон са се образували и каква е обемната му част в сместа (в %)?" check={[1, 10.5]} ask={['$\\mathrm{O_3}$, L', '$\\varphi(\\mathrm{O_3})$, %']}>
                <p><Tex>{'\\mathrm{3O_2 \\to 2O_3}'}</Tex>: от 3 обема стават 2 – намалението е 1 обем на всеки 2 обема озон.</p>
                <p>Намалението е <Tex>{'0{,}5\\ \\mathrm{L}'}</Tex>, значи <Tex>{'V(\\mathrm{O_3}) = 2 \\cdot 0{,}5 = 1\\ \\mathrm{L}'}</Tex>.</p>
                <p><Tex>{'\\varphi(\\mathrm{O_3}) = \\frac{1}{9{,}5} \\approx 10{,}5\\%'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="20 g смес от NaCl и NaI се разтварят във вода и през разтвора се пропуска излишък от хлор. След изпаряване и накаляване остават 10,85 g сух остатък. Каква е масовата част на NaI в сместа (в %)?" check={[75]} ask={['$\\omega(\\mathrm{NaI})$, %']}>
                <p><Tex>{'\\mathrm{2NaI + Cl_2 \\to 2NaCl + I_2}'}</Tex>; при накаляване йодът се изпарява и остава само NaCl.</p>
                <p>Всеки мол NaI (150 g) става мол NaCl (58,5 g) – масата намалява с 91,5 g.</p>
                <p>Намалението е <Tex>{'20 - 10{,}85 = 9{,}15\\ \\mathrm{g}'}</Tex>, значи <Tex>{'n(\\mathrm{NaI}) = 0{,}1\\ \\mathrm{mol}'}</Tex> и <Tex>{'m = 15\\ \\mathrm{g}'}</Tex>.</p>
                <p><Tex>{'\\omega(\\mathrm{NaI}) = \\frac{15}{20} = 75\\%'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>15. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Неметалите са горе вдясно в таблицата; имат висока електроотрицателност и обикновено са окислители</li>
              <li>✓ Окислителната сила на халогените намалява надолу: <Tex>{'\\mathrm{F_2 > Cl_2 > Br_2 > I_2}'}</Tex>; по-активният измества по-слабия от солите му</li>
              <li>✓ Алотропия – един елемент, няколко прости вещества: <Tex>{'\\mathrm{O_2}'}</Tex> и <Tex>{'\\mathrm{O_3}'}</Tex>, диамант и графит, бял и червен фосфор</li>
              <li>✓ Сярна киселина – контактен метод (<Tex>{'\\mathrm{S \\to SO_2 \\to SO_3 \\to H_2SO_4}'}</Tex>, катализатор <Tex>{'\\mathrm{V_2O_5}'}</Tex>); киселината се налива във водата</li>
              <li>✓ Азотна киселина – метод на Оствалд (<Tex>{'\\mathrm{NH_3 \\to NO \\to NO_2 \\to HNO_3}'}</Tex>); концентрираните <Tex>{'\\mathrm{H_2SO_4}'}</Tex> и <Tex>{'\\mathrm{HNO_3}'}</Tex> окисляват и медта</li>
              <li>✓ Общият добив на многоетапен процес е произведение от добивите на етапите</li>
              <li>✓ Газ с <Tex>{'M > 29'}</Tex> – в съд с отвора нагоре, с <Tex>{'M < 29'}</Tex> – в обърнат съд; над вода – само слабо разтворимите</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              До 1962 г. учебниците твърдят, че благородните газове не образуват съединения. Тогава Нийл Бартлет забелязва, че силният
              окислител <Tex>{'\\mathrm{PtF_6}'}</Tex> може да откъсне електрон дори от молекулата на кислорода. Ксенонът се йонизира почти
              толкова лесно – и Бартлет получава оранжевожълто твърдо вещество, първото съединение на благороден газ. Днес са известни
              десетки съединения на ксенона, например <Tex>{'\\mathrm{XeF_2}'}</Tex> и <Tex>{'\\mathrm{XeF_4}'}</Tex>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
