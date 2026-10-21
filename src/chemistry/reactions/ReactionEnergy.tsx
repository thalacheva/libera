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
import CalorimeterLab from './CalorimeterLab';
import EnergyProfileLab from './EnergyProfileLab';
import HessLab from './HessLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: −0.45 → -0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');
/** Със знак: +179,2 или −110,5. */
const sgn = (v: number) => (v > 0 ? `+${dec(v)}` : dec(v));
const kJ = (v: number) => `${sgn(v)}\\ \\mathrm{kJ}`;

// Горива: формула, коефициент пред горивото е 1, ΔH в десети от kJ (вода – течна)
const FUELS: [string, number, string][] = [
  ['CH4', -8903, '\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O(l)}'],
  ['C', -3935, '\\mathrm{C + O_2 \\to CO_2}'],
  ['H2', -2858, '\\mathrm{H_2 + \\tfrac{1}{2}O_2 \\to H_2O(l)}'],
  ['C2H5OH', -13667, '\\mathrm{C_2H_5OH + 3O_2 \\to 2CO_2 + 3H_2O(l)}'],
  ['C3H8', -22199, '\\mathrm{C_3H_8 + 5O_2 \\to 3CO_2 + 4H_2O(l)}'],
];

// Енергии на връзките: [уравнение, скъсани връзки, образувани връзки, сума скъсани, сума образувани]
const BONDS: [string, string, string, number, number][] = [
  ['\\mathrm{H_2 + Cl_2 \\to 2HCl}', '436 + 243', '2 \\cdot 432', 679, 864],
  ['\\mathrm{2H_2 + O_2 \\to 2H_2O(g)}', '2 \\cdot 436 + 498', '4 \\cdot 463', 1370, 1852],
  ['\\mathrm{N_2 + 3H_2 \\to 2NH_3}', '945 + 3 \\cdot 436', '6 \\cdot 391', 2253, 2346],
  ['\\mathrm{H_2 + Br_2 \\to 2HBr}', '436 + 193', '2 \\cdot 366', 629, 732],
  ['\\mathrm{CH_4 + Cl_2 \\to CH_3Cl + HCl}', '413 + 243', '328 + 432', 656, 760],
  ['\\mathrm{C_2H_4 + H_2 \\to C_2H_6}', '614 + 436', '348 + 2 \\cdot 413', 1050, 1174],
];

// Енталпии на образуване: [уравнение, данни ΔfH, изчисление, ΔH в десети от kJ]
const FORMATION: [string, string, string, number][] = [
  ['\\mathrm{CaCO_3 \\to CaO + CO_2}', '\\mathrm{CaCO_3}: -1207{,}6;\\ \\mathrm{CaO}: -634{,}9;\\ \\mathrm{CO_2}: -393{,}5', '(-634{,}9) + (-393{,}5) - (-1207{,}6)', 1792],
  ['\\mathrm{2CO + O_2 \\to 2CO_2}', '\\mathrm{CO}: -110{,}5;\\ \\mathrm{CO_2}: -393{,}5', '2 \\cdot (-393{,}5) - 2 \\cdot (-110{,}5)', -5660],
  ['\\mathrm{2SO_2 + O_2 \\to 2SO_3}', '\\mathrm{SO_2}: -296{,}8;\\ \\mathrm{SO_3}: -395{,}7', '2 \\cdot (-395{,}7) - 2 \\cdot (-296{,}8)', -1978],
  ['\\mathrm{Fe_2O_3 + 3CO \\to 2Fe + 3CO_2}', '\\mathrm{Fe_2O_3}: -824{,}2;\\ \\mathrm{CO}: -110{,}5;\\ \\mathrm{CO_2}: -393{,}5', '3 \\cdot (-393{,}5) - (-824{,}2) - 3 \\cdot (-110{,}5)', -248],
  ['\\mathrm{C_2H_4 + H_2 \\to C_2H_6}', '\\mathrm{C_2H_4}: +52{,}4;\\ \\mathrm{C_2H_6}: -84{,}0', '(-84{,}0) - 52{,}4', -1364],
  ['\\mathrm{Fe_2O_3 + 2Al \\to Al_2O_3 + 2Fe}', '\\mathrm{Fe_2O_3}: -824{,}2;\\ \\mathrm{Al_2O_3}: -1675{,}7', '(-1675{,}7) - (-824{,}2)', -8515],
];

// Обръщане и умножаване: [уравнение, ΔH в десети от kJ, [ново уравнение, множител]]
const HESS: [string, number, [string, number][]][] = [
  ['\\mathrm{N_2 + 3H_2 \\to 2NH_3}', -918, [['\\mathrm{NH_3 \\to \\tfrac{1}{2}N_2 + \\tfrac{3}{2}H_2}', -0.5], ['\\mathrm{4NH_3 \\to 2N_2 + 6H_2}', -2], ['\\mathrm{\\tfrac{1}{2}N_2 + \\tfrac{3}{2}H_2 \\to NH_3}', 0.5]]],
  ['\\mathrm{2H_2 + O_2 \\to 2H_2O(l)}', -5716, [['\\mathrm{H_2O(l) \\to H_2 + \\tfrac{1}{2}O_2}', -0.5], ['\\mathrm{4H_2 + 2O_2 \\to 4H_2O(l)}', 2], ['\\mathrm{2H_2O(l) \\to 2H_2 + O_2}', -1]]],
  ['\\mathrm{CaCO_3 \\to CaO + CO_2}', 1792, [['\\mathrm{CaO + CO_2 \\to CaCO_3}', -1], ['\\mathrm{2CaCO_3 \\to 2CaO + 2CO_2}', 2], ['\\mathrm{3CaO + 3CO_2 \\to 3CaCO_3}', -3]]],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const m = pick([50, 100, 150, 200, 250]);
    const dT = pick([2, 4, 5, 8, 10]);
    return {
      tex: `m = ${m}\\ \\mathrm{g}\\ \\text{вода},\\quad \\Delta T = ${dT}\\ \\mathrm{K}`,
      ask: 'Колко kJ топлина е получила водата? (c = 4,18 J/(g·K))',
      num: m * 418 * dT,
      den: 100000,
      steps: [`$q = m c \\Delta T = ${m} \\cdot 4{,}18 \\cdot ${dT} = ${dec(m * 4.18 * dT)}\\ \\mathrm{J} = ${dec((m * 418 * dT) / 100000)}\\ \\mathrm{kJ}$`],
    };
  }
  if (kind === 1) {
    const [f, dH10, eq] = pick(FUELS);
    const n10 = pick([5, 10, 15, 20, 30]);
    const M = molarMass(f);
    const m = (n10 * M) / 10;
    return {
      tex: `${eq};\\quad \\Delta H = ${dec(dH10 / 10)}\\ \\mathrm{kJ}`,
      ask: `Колко kJ топлина се отделят при изгарянето на ${dec(m).replace('{,}', ',')} g от горивото?`,
      num: (n10 * -dH10) / 10,
      den: 10,
      steps: [`$n(${formulaTex(f)}) = \\frac{${dec(m)}}{${M}} = ${dec(n10 / 10)}\\ \\mathrm{mol}$`, `$Q = ${dec(n10 / 10)} \\cdot ${dec(-dH10 / 10)} = ${dec((n10 * -dH10) / 100)}\\ \\mathrm{kJ}$`],
    };
  }
  if (kind === 2) {
    const [eq, broken, formed, b, f] = pick(BONDS);
    return {
      tex: eq,
      ask: 'Оценете ΔH в kJ по средните енергии на връзките от таблицата.',
      num: b - f,
      den: 1,
      steps: [`Скъсват се: $${broken} = ${b}\\ \\mathrm{kJ}$`, `Образуват се: $${formed} = ${f}\\ \\mathrm{kJ}$`, `$\\Delta H \\approx ${b} - ${f} = ${kJ(b - f)}$`],
    };
  }
  if (kind === 3) {
    const [eq, data, calc, dH10] = pick(FORMATION);
    return {
      tex: `${eq}\\quad (\\Delta_f H^\\circ\\ \\text{в kJ/mol: } ${data})`,
      ask: 'Пресметнете ΔH на реакцията в kJ.',
      num: dH10,
      den: 10,
      steps: [`$\\Delta H = \\sum \\Delta_f H^\\circ(\\text{продукти}) - \\sum \\Delta_f H^\\circ(\\text{реагенти})$ (за простите вещества $\\Delta_f H^\\circ = 0$)`, `$\\Delta H = ${calc} = ${kJ(dH10 / 10)}$`],
    };
  }
  const [eq, dH10, variants] = pick(HESS);
  const [eq2, k] = pick(variants);
  return {
    tex: `${eq};\\ \\Delta H = ${kJ(dH10 / 10)}`,
    ask: `Каква е ΔH (в kJ) на реакцията по-долу?`,
    num: dH10 * k * 2,
    den: 20,
    steps: [`Търсим $${eq2}$ – това е даденото уравнение, умножено по $${dec(k)}$.`, `$\\Delta H = ${dec(k)} \\cdot (${dec(dH10 / 10)}) = ${kJ((dH10 * k) / 10)}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🍳 Чайник на газов котлон',
    problem:
      'Искаме да загреем 2 L вода от 20 °C до кипене (100 °C) на котлон с природен газ (метан). Само 60% от топлината отива във водата. Колко грама метан изгарят и какъв е обемът му при нормални условия? (CH₄ + 2O₂ → CO₂ + 2H₂O, ΔH = −890,3 kJ)',
    solution: [
      '$q = m c \\Delta T = 2000 \\cdot 4{,}18 \\cdot 80 = 668\\,800\\ \\mathrm{J} \\approx 668{,}8\\ \\mathrm{kJ}$',
      'Нужно е да изгори газ за $\\frac{668{,}8}{0{,}6} \\approx 1114{,}7\\ \\mathrm{kJ}$',
      '$n = \\frac{1114{,}7}{890{,}3} \\approx 1{,}252\\ \\mathrm{mol}$; $m \\approx 1{,}252 \\cdot 16 \\approx 20{,}0\\ \\mathrm{g}$; $V \\approx 1{,}252 \\cdot 22{,}4 \\approx 28{,}0\\ \\mathrm{L}$',
    ],
    answer: '$\\approx 20{,}0\\ \\mathrm{g}$, $\\approx 28{,}0\\ \\mathrm{L}$',
    check: [20.0, 28.0],
    ask: ['метан, g', 'метан, L'],
  },
  {
    title: '🍫 Шоколад и стълби',
    problem:
      'Блокче шоколад от 100 g съдържа около 2300 kJ (≈ 550 kcal). Мускулите превръщат в механична работа около 25% от енергията на храната. На каква височина може да се изкачи човек с маса 60 kg с тази енергия? (g = 9,8 m/s²)',
    solution: [
      'Полезна работа: $0{,}25 \\cdot 2{,}3 \\cdot 10^6 = 5{,}75 \\cdot 10^5\\ \\mathrm{J}$',
      '$h = \\frac{A}{mg} = \\frac{5{,}75 \\cdot 10^5}{60 \\cdot 9{,}8} \\approx 978\\ \\mathrm{m}$',
      'Почти километър нагоре! Останалите 75% се превръщат в топлина – затова при изкачване се сгорещяваме.',
    ],
    answer: '$\\approx 978\\ \\mathrm{m}$',
    check: [978],
    ask: ['височина, m'],
  },
  {
    title: '🧊 Студен компрес',
    problem:
      'Студеният компрес за травми съдържа 40 g амониев нитрат NH₄NO₃ и 160 g вода в отделни пликчета. При удар пликчето с водата се скъсва и солта се разтваря (ΔH = +25,7 kJ/mol). До каква температура се охлажда компресът, ако в началото е 22 °C? (Пренебрегнете загубите; c = 4,18 J/(g·K) за целия разтвор.)',
    solution: [
      '$n = \\frac{40}{80} = 0{,}5\\ \\mathrm{mol}$; погълната топлина $0{,}5 \\cdot 25{,}7 = 12{,}85\\ \\mathrm{kJ}$',
      '$\\Delta T = \\frac{12\\,850}{200 \\cdot 4{,}18} \\approx 15{,}4\\ \\mathrm{K}$',
      '$t \\approx 22 - 15{,}4 \\approx 6{,}6\\ ^\\circ\\mathrm{C}$',
    ],
    answer: '$\\approx 6{,}6\\ ^\\circ\\mathrm{C}$',
    check: [6.6],
    ask: ['температура, °C'],
  },
  {
    title: '🚀 Водородът като гориво',
    problem:
      'H₂ + ½O₂ → H₂O(l), ΔH = −285,8 kJ. Колко мегаджаула се отделят при изгарянето на 1 kg водород? Колко пъти повече е това от топлината при изгарянето на 1 kg бензин (около 46 MJ)?',
    solution: [
      '$n = \\frac{1000}{2} = 500\\ \\mathrm{mol}$; $Q = 500 \\cdot 285{,}8 = 142\\,900\\ \\mathrm{kJ} \\approx 142{,}9\\ \\mathrm{MJ}$',
      '$\\frac{142{,}9}{46} \\approx 3{,}1$ пъти',
      'На килограм водородът е най-калоричното гориво, но на литър е много по-слаб: газът е изключително лек и трябва да се държи под високо налягане или втечнен при −253 °C.',
    ],
    answer: '$\\approx 142{,}9\\ \\mathrm{MJ}$, $\\approx 3{,}1$ пъти',
    check: [142.9, 3.1],
    ask: ['топлина, MJ', 'пъти'],
  },
  {
    title: '🛤️ Термитно заваряване на релси',
    problem:
      'Релсите се заваряват с термит – смес от алуминий и железен(III) оксид в стехиометрично отношение: Fe₂O₃ + 2Al → Al₂O₃ + 2Fe, ΔH = −851,5 kJ. Колко kJ отделят 100 g от сместа?',
    solution: [
      'Маса на сместа по уравнението: $160 + 2 \\cdot 27 = 214\\ \\mathrm{g}$ на $851{,}5\\ \\mathrm{kJ}$',
      '$Q = \\frac{100}{214} \\cdot 851{,}5 \\approx 398\\ \\mathrm{kJ}$',
      'Това не е много повече от горенето на захар, но се отделя за секунди в малък обем – температурата надхвърля 2000 °C и желязото се получава разтопено.',
    ],
    answer: '$\\approx 398\\ \\mathrm{kJ}$',
    check: [398],
    ask: ['топлина, kJ'],
  },
  {
    title: '🏭 Варова пещ',
    problem:
      'Негасената вар CaO се получава при печене на варовик: CaCO₃ → CaO + CO₂, ΔH = +179,2 kJ. Колко топлина (в GJ) е нужна за 1 t CaO и колко килограма метан трябва да изгорят за нея, ако цялата топлина отива в реакцията (ΔH на горене = −890,3 kJ/mol)?',
    solution: [
      '$n(\\mathrm{CaO}) = \\frac{10^6}{56} \\approx 17\\,857\\ \\mathrm{mol}$; $Q = 17\\,857 \\cdot 179{,}2 \\approx 3{,}2 \\cdot 10^6\\ \\mathrm{kJ} = 3{,}2\\ \\mathrm{GJ}$',
      '$n(\\mathrm{CH_4}) = \\frac{3{,}2 \\cdot 10^6}{890{,}3} \\approx 3594\\ \\mathrm{mol}$; $m \\approx 3594 \\cdot 16 \\approx 57{,}5\\ \\mathrm{kg}$',
      'В истинската пещ трябва и загряване на камъка, а част от топлината се губи – горивото е повече.',
    ],
    answer: '$3{,}2\\ \\mathrm{GJ}$, $\\approx 57{,}5\\ \\mathrm{kg}$',
    check: [3.2, 57.5],
    ask: ['топлина, GJ', 'метан, kg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Реакция има $\\Delta H = -92\\ \\mathrm{kJ}$. Каква е тя?',
    answers: ['екзотермична – отделя топлина', 'ендотермична – поглъща топлина', 'нито едното, нито другото', 'зависи от катализатора'],
    correctAnswer: 'екзотермична – отделя топлина',
  },
  {
    question: '$\\mathrm{2H_2 + O_2 \\to 2H_2O(l)}$, $\\Delta H = -571{,}6\\ \\mathrm{kJ}$. Каква е $\\Delta H$ на $\\mathrm{H_2O(l) \\to H_2 + \\frac{1}{2}O_2}$?',
    answers: ['$+285{,}8\\ \\mathrm{kJ}$', '$-285{,}8\\ \\mathrm{kJ}$', '$+571{,}6\\ \\mathrm{kJ}$', '$-571{,}6\\ \\mathrm{kJ}$'],
    correctAnswer: '$+285{,}8\\ \\mathrm{kJ}$',
  },
  {
    question: 'Защо при изгарянето на водород до течна вода се отделя повече топлина, отколкото до водна пара?',
    answers: ['при кондензацията на парата се отделя още топлина', 'течната вода има по-голяма моларна маса', 'реакцията до течна вода е по-бърза', 'не е вярно – топлината е еднаква'],
    correctAnswer: 'при кондензацията на парата се отделя още топлина',
  },
  {
    question: 'Колко е стандартната енталпия на образуване на $\\mathrm{O_2(g)}$?',
    answers: ['$0$', '$-498\\ \\mathrm{kJ/mol}$', '$+498\\ \\mathrm{kJ/mol}$', '$-285{,}8\\ \\mathrm{kJ/mol}$'],
    correctAnswer: '$0$',
  },
  {
    question: 'Какво прави катализаторът с енергийния профил на реакцията?',
    answers: ['намалява енергията на активиране, без да променя ΔH', 'намалява ΔH', 'прави ендотермичната реакция екзотермична', 'увеличава енергията на продуктите'],
    correctAnswer: 'намалява енергията на активиране, без да променя ΔH',
  },
  {
    question: 'Скъсването на химична връзка е процес, който…',
    answers: ['винаги поглъща енергия', 'винаги отделя енергия', 'понякога отделя, понякога поглъща енергия', 'не е свързан с енергия'],
    correctAnswer: 'винаги поглъща енергия',
  },
  {
    question: 'При разтварянето на амониев нитрат във вода чашата изстива. Каква е $\\Delta H$ на разтварянето?',
    answers: ['$\\Delta H > 0$', '$\\Delta H < 0$', '$\\Delta H = 0$', 'не може да се каже'],
    correctAnswer: '$\\Delta H > 0$',
  },
  {
    question: 'Какво твърди законът на Хес?',
    answers: ['ΔH зависи само от началното и крайното състояние, не от пътя', 'реакциите протичат през възможно най-много стъпки', 'всички реакции са екзотермични', 'ΔH е пропорционална на скоростта'],
    correctAnswer: 'ΔH зависи само от началното и крайното състояние, не от пътя',
  },
  {
    question: '50 g вода се затоплят с 10 K. Колко топлина са получили? ($c = 4{,}18\\ \\mathrm{J/(g \\cdot K)}$)',
    answers: ['$2090\\ \\mathrm{J}$', '$209\\ \\mathrm{J}$', '$500\\ \\mathrm{J}$', '$41{,}8\\ \\mathrm{J}$'],
    correctAnswer: '$2090\\ \\mathrm{J}$',
  },
];

// ---------- Таблици ----------

const BOND_TABLE: [string, string][] = [
  ['H–H', '436'],
  ['C–H', '413'],
  ['C–C', '348'],
  ['C=C', '614'],
  ['C=O (в CO₂)', '799'],
  ['O=O', '498'],
  ['O–H', '463'],
  ['N≡N', '945'],
  ['N–H', '391'],
  ['Cl–Cl', '243'],
  ['H–Cl', '432'],
  ['C–Cl', '328'],
];

const FORMATION_TABLE: [string, string][] = [
  ['H2O(l)', '-285{,}8'],
  ['H2O(g)', '-241{,}8'],
  ['CO2', '-393{,}5'],
  ['CO', '-110{,}5'],
  ['CH4', '-74{,}8'],
  ['C2H5OH(l)', '-277{,}7'],
  ['NH3', '-45{,}9'],
  ['NO', '+91{,}3'],
  ['C2H2', '+227{,}4'],
  ['CaCO3', '-1207{,}6'],
  ['CaO', '-634{,}9'],
  ['C6H12O6', '-1273{,}3'],
];

const FUEL_TABLE: [string, string][] = [
  ['водород', '142'],
  ['метан (природен газ)', '55,6'],
  ['пропан-бутан', 'около 50'],
  ['бензин, дизел', 'около 45–46'],
  ['етанол', '29,7'],
  ['каменни въглища', 'около 25–30'],
  ['сухи дърва', 'около 15–19'],
  ['мазнини (в храната)', 'около 37'],
  ['въглехидрати, белтъци (в храната)', 'около 17'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';
const box = 'overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900';

/** Формула с агрегатно състояние: „H2O(l)“ → \mathrm{H_2O(l)}. */
const withState = (f: string) => {
  const m = /^(.+?)(\([a-z]+\))?$/.exec(f)!;
  return `${formulaTex(m[1])}${m[2] ? `\\mathrm{${m[2]}}` : ''}`;
};

// ---------- Страница ----------

export function ReactionEnergy() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Енергия на реакциите</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🐹 През зимата на 1782–1783 г. Антоан Лавоазие и Пиер-Симон Лаплас слагат морско свинчето в метален съд, обграден с лед, и
            мерят колко лед се стопява за 10 часа. После изгарят въглен в същия уред. Сравняват топлината с количеството издишан въглероден
            диоксид и стигат до смел извод: <strong>дишането е бавно горене</strong>. Животното „гори“ храната си, както пещта гори
            въглища – само по-бавно и без пламък. Така се ражда калориметрията, а с нея и въпросът: откъде идва енергията на <Term id="chemical-reaction">химичните
            реакции</Term>?
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Екзотермични и ендотермични реакции</h2>
          <p className={text}>
            Всяка реакция къса едни <Term id="chemical-bond">химични връзки</Term> и създава други. Скъсването на връзка винаги изисква енергия, а образуването ѝ – отделя
            енергия. Коя от двете е по-голяма, решава дали реакцията ще стопли, или ще охлади околната среда. Енергията на веществата е
            тяхната <Term id="internal-energy">вътрешна енергия</Term>; общите закони за топлината и работата са в урока{' '}
            <Link to="/physics/heat/thermodynamics" className={link}>
              Термодинамика
            </Link>
            , а тук гледаме химичната им страна.
          </p>
          <Theorem
            type="definition"
            title="Екзотермични и ендотермични реакции"
            description="Екзотермичните реакции отделят топлина в околната среда (горене, неутрализация, ръждясване). Ендотермичните реакции поглъщат топлина от околната среда (разлагане на варовик, фотосинтеза, разтваряне на амониев нитрат)."
          />
          <p className={text}>
            „Система“ наричаме веществата, които реагират, а „околна среда“ – всичко останало: колбата, водата, въздуха. Когато
            реакцията е екзотермична, системата губи енергия и околната среда се затопля. Енергийната диаграма показва това нагледно:
            продуктите стоят по-ниско от <Term id="reactant">реагентите</Term>. Между тях обаче има „хълм“ – <Term id="activation-energy">енергия на активиране</Term>, която трябва да се преодолее, за
            да започне реакцията. Затова кибритът не се запалва сам, макар горенето да е силно екзотермично.
          </p>
          <EnergyProfileLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Енталпия и термохимични уравнения</h2>
          <Theorem
            type="definition"
            title="Енталпия на реакцията"
            description="Топлината, която реакцията отделя или поглъща при постоянно налягане, се нарича енталпия на реакцията и се означава с $\Delta H$. Знакът е от гледна точка на системата: при екзотермична реакция $\Delta H < 0$ (системата губи енергия), при ендотермична $\Delta H > 0$. Мерна единица – kJ (на уравнението) или kJ/mol."
          />
          <p className={text}>
            Термохимичното уравнение е <Term id="chemical-equation">химично уравнение</Term> с посочена <Tex>{'\\Delta H'}</Tex> и с агрегатните състояния на веществата: (s)
            – твърдо, (l) – течно, (g) – газ, (aq) – във воден <Term id="solution">разтвор</Term>. Състоянията са важни, защото преходите между тях също имат
            топлинен ефект.
          </p>
          <Example
            description="Сравнете: $\mathrm{2H_2(g) + O_2(g) \to 2H_2O(l)}$, $\Delta H = -571{,}6\ \mathrm{kJ}$ и $\mathrm{2H_2(g) + O_2(g) \to 2H_2O(g)}$, $\Delta H = -483{,}6\ \mathrm{kJ}$. Откъде идва разликата?"
            steps={[
              'Разликата е $571{,}6 - 483{,}6 = 88{,}0\\ \\mathrm{kJ}$ за 2 mol вода, т.е. $44{,}0\\ \\mathrm{kJ}$ на мол.',
              'Точно толкова топлина се отделя при кондензацията на мол водна пара при 25 °C. Когато водата излиза като пара, тази енергия „отлита“ с нея.',
            ]}
          />
          <Theorem
            title="Правила за термохимичните уравнения"
            description="1) $\Delta H$ е пропорционална на количеството вещество: ако умножим уравнението по $k$, умножаваме и $\Delta H$ по $k$. 2) Обратната реакция има същата по големина $\Delta H$, но с обратен знак. 3) Затова в термохимичните уравнения са позволени дробни коефициенти: $\mathrm{H_2 + \tfrac{1}{2}O_2 \to H_2O(l)}$, $\Delta H = -285{,}8\ \mathrm{kJ}$."
          />
          <Example
            description="$\mathrm{CH_4 + 2O_2 \to CO_2 + 2H_2O(l)}$, $\Delta H = -890{,}3\ \mathrm{kJ}$. Колко топлина се отделя при изгарянето на 4 g метан?"
            steps={[
              `$n = \\frac{4}{${molarMass('CH4')}} = 0{,}25\\ \\mathrm{mol}$`,
              '$Q = 0{,}25 \\cdot 890{,}3 \\approx 222{,}6\\ \\mathrm{kJ}$ (отделени, т.е. $\\Delta H \\approx -222{,}6\\ \\mathrm{kJ}$)',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Калориметрия: как се мери ΔH</h2>
          <p className={text}>
            Топлинният ефект се мери с калориметър – съд, изолиран от околната среда. Реакцията протича в известно количество вода и
            топлината, която отделя или поглъща, променя температурата на водата. Ако знаем масата <Tex>{'m'}</Tex> и{' '}
            <Term id="specific-heat">специфичния топлинен капацитет</Term> <Tex>{'c'}</Tex>, намираме топлината.
          </p>
          <Theorem
            title="Калориметрично уравнение"
            description="Топлината, получена от разтвора, е $q = m c \Delta T$ (за вода $c = 4{,}18\ \mathrm{J/(g \cdot K)}$). Ако калориметърът не губи топлина, тя е отдадена от реакцията: $\Delta H = -\frac{q}{n}$, където $n$ е количеството вещество, за което искаме $\Delta H$."
          />
          <Example
            description="В калориметър смесват 50 mL разтвор на HCl с концентрация 1 mol/L и 50 mL разтвор на NaOH със същата концентрация. Температурата се покачва от 21,0 °C на 27,7 °C. Каква е енталпията на неутрализация? (Плътността на разтворите е 1 g/mL.)"
            steps={[
              '$q = m c \\Delta T = 100 \\cdot 4{,}18 \\cdot 6{,}7 \\approx 2801\\ \\mathrm{J} \\approx 2{,}80\\ \\mathrm{kJ}$',
              '$n(\\mathrm{H_2O}) = 0{,}050 \\cdot 1 = 0{,}050\\ \\mathrm{mol}$',
              '$\\Delta H = -\\frac{2{,}80}{0{,}050} \\approx -56\\ \\mathrm{kJ/mol}$ – почти еднаква за всички силни киселини и основи, защото реакцията всъщност е една: $\\mathrm{H^+ + OH^- \\to H_2O}$.',
            ]}
          />
          <CalorimeterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Законът на Хес</h2>
          <Theorem
            title="Закон на Хес (1840 г.)"
            description="Топлинният ефект на реакцията зависи само от началното и крайното състояние на веществата, а не от пътя (броя и вида на междинните стъпки). Следователно ако едно уравнение е сбор от други, неговата $\Delta H$ е сборът от техните $\Delta H$."
          />
          <p className={text}>
            Законът е следствие от <Term id="energy-conservation">запазването на енергията</Term>: ако два пътя между едни и същи вещества имаха различни топлинни ефекти, бихме
            могли да вървим напред по единия и назад по другия и да печелим енергия от нищото. Ползата е огромна: можем да намерим
            <Tex>{'\\ \\Delta H'}</Tex> на реакции, които не можем да проведем чисто в калориметър.
          </p>
          <Example
            description="Намерете $\Delta H$ на $\mathrm{C + \tfrac{1}{2}O_2 \to CO}$, ако (1) $\mathrm{C + O_2 \to CO_2}$, $\Delta H_1 = -393{,}5\ \mathrm{kJ}$ и (2) $\mathrm{CO + \tfrac{1}{2}O_2 \to CO_2}$, $\Delta H_2 = -283{,}0\ \mathrm{kJ}$."
            steps={[
              'Взимаме (1) както е и обръщаме (2): $\\mathrm{CO_2 \\to CO + \\tfrac{1}{2}O_2}$, $+283{,}0\\ \\mathrm{kJ}$.',
              'Събираме: $\\mathrm{C + O_2 + CO_2 \\to CO_2 + CO + \\tfrac{1}{2}O_2}$; съкращаваме $\\mathrm{CO_2}$ и $\\tfrac{1}{2}\\mathrm{O_2}$.',
              '$\\Delta H = -393{,}5 + 283{,}0 = -110{,}5\\ \\mathrm{kJ}$',
            ]}
          />
          <HessLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Енергии на връзките</h2>
          <p className={text}>
            Най-нагледният начин да оценим <Tex>{'\\Delta H'}</Tex> е да „разглобим“ реагентите на атоми и да ги сглобим в продукти. За
            разкъсването плащаме <Term id="chemical-bond-energy">енергията на връзките</Term>, а при образуването на новите връзки я
            получаваме обратно.
          </p>
          <Theorem
            title="ΔH от енергиите на връзките"
            description="$\Delta H \approx \sum E(\text{скъсани връзки}) - \sum E(\text{образувани връзки})$. Ако новите връзки са по-здрави от старите, реакцията е екзотермична. Методът е приблизителен, защото таблиците дават средни енергии (връзката C–H в метана не е съвсем същата като в етанола) и важи за вещества в газово състояние."
          />
          <div className={box}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Връзка</th>
                  <th className={th}>
                    <Tex>{'E,\\ \\mathrm{kJ/mol}'}</Tex>
                  </th>
                  <th className={th}>Връзка</th>
                  <th className={th}>
                    <Tex>{'E,\\ \\mathrm{kJ/mol}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {BOND_TABLE.slice(0, 6).map(([b, e], i) => (
                  <tr key={b}>
                    <td className={td}>{b}</td>
                    <td className={td}>{e}</td>
                    <td className={td}>{BOND_TABLE[i + 6][0]}</td>
                    <td className={td}>{BOND_TABLE[i + 6][1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Оценете $\Delta H$ на горенето на метан до водна пара: $\mathrm{CH_4 + 2O_2 \to CO_2 + 2H_2O(g)}$."
            steps={[
              'Скъсват се: 4 връзки C–H и 2 връзки O=O: $4 \\cdot 413 + 2 \\cdot 498 = 2648\\ \\mathrm{kJ}$',
              'Образуват се: 2 връзки C=O и 4 връзки O–H: $2 \\cdot 799 + 4 \\cdot 463 = 3450\\ \\mathrm{kJ}$',
              '$\\Delta H \\approx 2648 - 3450 = -802\\ \\mathrm{kJ}$ – съвсем близо до измерените $-802{,}3\\ \\mathrm{kJ}$. Обикновено съвпадението е по-слабо, в рамките на няколко процента.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Енталпия на образуване</h2>
          <Theorem
            type="definition"
            title="Стандартна енталпия на образуване"
            description="Стандартната енталпия на образуване $\Delta_f H^\circ$ е топлинният ефект при получаването на 1 mol от веществото от простите вещества в най-устойчивото им състояние при стандартни условия (100 kPa, обикновено 25 °C). За простите вещества ($\mathrm{O_2}$, $\mathrm{H_2}$, графит, $\mathrm{Fe}$…) тя е нула по определение."
          />
          <Theorem
            title="ΔH от енталпиите на образуване"
            description="$\Delta H = \sum \nu\, \Delta_f H^\circ(\text{продукти}) - \sum \nu\, \Delta_f H^\circ(\text{реагенти})$, където $\nu$ са коефициентите в уравнението. Това е законът на Хес: мислено разлагаме реагентите до прости вещества и от тях сглобяваме продуктите."
          />
          <div className={box}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Вещество</th>
                  <th className={th}>
                    <Tex>{'\\Delta_f H^\\circ,\\ \\mathrm{kJ/mol}'}</Tex>
                  </th>
                  <th className={th}>Вещество</th>
                  <th className={th}>
                    <Tex>{'\\Delta_f H^\\circ,\\ \\mathrm{kJ/mol}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMATION_TABLE.slice(0, 6).map(([f, h], i) => (
                  <tr key={f}>
                    <td className={td}>
                      <Tex>{withState(f)}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{h}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{withState(FORMATION_TABLE[i + 6][0])}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{FORMATION_TABLE[i + 6][1]}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Пресметнете $\Delta H$ на горенето на етанол: $\mathrm{C_2H_5OH(l) + 3O_2 \to 2CO_2 + 3H_2O(l)}$."
            steps={[
              'Продукти: $2 \\cdot (-393{,}5) + 3 \\cdot (-285{,}8) = -1644{,}4\\ \\mathrm{kJ}$',
              'Реагенти: $-277{,}7 + 3 \\cdot 0 = -277{,}7\\ \\mathrm{kJ}$',
              '$\\Delta H = -1644{,}4 - (-277{,}7) = -1366{,}7\\ \\mathrm{kJ}$',
            ]}
          />
          <p className={text}>
            Някои вещества имат положителна енталпия на образуване – например ацетиленът (<Tex>{'+227{,}4\\ \\mathrm{kJ/mol}'}</Tex>) и
            азотният <Term id="oxide">оксид</Term> NO. Те са „енергийно богати“: ацетиленът гори с изключително горещ пламък (до около 3100 °C с чист кислород) и
            затова се използва за заваряване и рязане на метали.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Горива и храна</h2>
          <p className={text}>
            За горивата и храната е по-удобно да се даде топлината на единица маса – калоричност (топлина на изгаряне), в kJ/g или MJ/kg.
            Тя се получава от <Tex>{'\\Delta H'}</Tex> на горене, разделена на <Term id="molar-mass">моларната маса</Term>: за метана{' '}
            <Tex>{'890{,}3 / 16 \\approx 55{,}6\\ \\mathrm{kJ/g}'}</Tex>. В храненето все още се използва и старата единица килокалория:{' '}
            <Tex>{'1\\ \\mathrm{kcal} = 4{,}184\\ \\mathrm{kJ}'}</Tex>.
          </p>
          <div className={box}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Гориво или хранително вещество</th>
                  <th className={th}>Калоричност, kJ/g</th>
                </tr>
              </thead>
              <tbody>
                {FUEL_TABLE.map(([name, v]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Стойностите са за горене до течна вода (т.нар. горна топлина на изгаряне); за реалните горива и храни те зависят от състава и
            са приблизителни. Тялото „изгаря“ глюкозата до същите продукти като пламъка, затова по закона на Хес топлината е същата:{' '}
            <Tex>{'\\mathrm{C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O}'}</Tex>, <Tex>{'\\Delta H \\approx -2803\\ \\mathrm{kJ}'}</Tex>, около
            15,6 kJ на грам. Разликата е, че клетката отделя енергията на малки порции и я съхранява в молекули <Term id="atp">АТФ</Term>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. За напреднали: цикъл на Борн–Хабер и енергия на Гибс</h2>
          <p className={text}>
            Законът на Хес позволява да намерим величини, които не могат да се измерят пряко. Пример е енергията на кристалната решетка на
            NaCl – топлината при образуването на кристала от газообразни <Term id="ion">йони</Term>. Стъпките са: изпаряване на натрия, неговата{' '}
            <Term id="ionization-energy">йонизационна енергия</Term>, разкъсване на половин <Term id="mole">мол</Term> <Tex>{'\\mathrm{Cl_2}'}</Tex>, присъединяване
            на електрона към хлора и накрая образуване на решетката.
          </p>
          <Example
            description="Намерете енергията на решетката на NaCl по данните (kJ/mol): $\Delta_f H^\circ(\mathrm{NaCl}) = -411{,}2$; сублимация на Na: $+107{,}3$; йонизация на Na: $+495{,}8$; $\tfrac{1}{2}$ дисоциация на $\mathrm{Cl_2}$: $+121{,}7$; присъединяване на електрон към Cl: $-348{,}6$."
            steps={[
              'Сборът от всички стъпки трябва да е равен на $\\Delta_f H^\\circ$: $107{,}3 + 495{,}8 + 121{,}7 - 348{,}6 + \\Delta H_{\\text{реш}} = -411{,}2$',
              '$\\Delta H_{\\text{реш}} = -411{,}2 - 376{,}2 = -787{,}4\\ \\mathrm{kJ/mol}$',
              'Огромната енергия на решетката е причината йонните кристали да са твърди и с висока температура на топене.',
            ]}
          />
          <Theorem
            title="Енергия на Гибс (кратко въведение)"
            description="Отрицателната $\Delta H$ сама по себе си не гарантира, че реакцията протича самопроизволно – важна е и промяната на безпорядъка, ентропията $\Delta S$. При постоянни температура и налягане решава енергията на Гибс: $\Delta G = \Delta H - T\Delta S$. Реакцията може да протече самопроизволно, ако $\Delta G < 0$. Нищо не се казва за скоростта: $\Delta G < 0$ значи „възможна“, не „бърза“."
          />
          <p className={text}>
            Пример е разлагането на варовика: <Tex>{'\\Delta H = +179{,}2\\ \\mathrm{kJ}'}</Tex>, но се получава газ и{' '}
            <Term id="entropy">ентропията</Term> расте с около <Tex>{'160\\ \\mathrm{J/K}'}</Tex>. При стайна температура{' '}
            <Tex>{'\\Delta G > 0'}</Tex>, но над около <Tex>{'\\frac{179\\,200}{160} \\approx 1120\\ \\mathrm{K}'}</Tex> (около 850 °C) членът{' '}
            <Tex>{'T\\Delta S'}</Tex> надделява. Оценката е груба, защото <Tex>{'\\Delta H'}</Tex> и <Tex>{'\\Delta S'}</Tex> също зависят
            малко от температурата, но варовите пещи наистина работят при около 900 °C.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>
            Калориметрия, топлина по термохимично уравнение, енергии на връзките (от таблицата в т. 5), енталпии на образуване и обръщане
            на уравнения. Отрицателните отговори въвеждай със знак минус, десетичните – със запетая.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Провери знака и виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Енергията около нас</h2>
          <p className={text}>Котлони, храна, студени компреси, ракети и заваряване на релси – навсякъде химичната енергия става топлина.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Знакът на ΔH', 'Горенето отделя топлина, значи $\\Delta H > 0$.', 'Знакът е от гледна точка на системата: отделя топлина → $\\Delta H < 0$.'],
              ['Скъсването на връзки', 'При скъсване на връзка се отделя енергия.', 'Скъсването винаги поглъща енергия; отделя се при образуването на нови връзки.'],
              ['Ред при енергиите на връзките', '$\\Delta H = \\sum E(\\text{образувани}) - \\sum E(\\text{скъсани})$', '$\\Delta H \\approx \\sum E(\\text{скъсани}) - \\sum E(\\text{образувани})$ – обратно на формулата с $\\Delta_f H^\\circ$!'],
              ['Простите вещества', '$\\Delta_f H^\\circ(\\mathrm{O_2}) = -498\\ \\mathrm{kJ/mol}$', '$\\Delta_f H^\\circ$ на простите вещества в стандартно състояние е 0.'],
              ['Забравените коефициенти', '$\\mathrm{2CO + O_2 \\to 2CO_2}$: $\\Delta H = -393{,}5 + 110{,}5$', '$\\Delta H = 2 \\cdot (-393{,}5) - 2 \\cdot (-110{,}5) = -566\\ \\mathrm{kJ}$ – всяка стойност по коефициента.'],
              ['Масата в калориметъра', '$q = m c \\Delta T$ с масата на солта', 'В $q = m c \\Delta T$ влиза масата на разтвора (водата), който се затопля.'],
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
          <h2 className={h2}>12. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко топлина (в kJ) е нужна, за да се загреят 200 g вода от 15 °C до 35 °C? ($c = 4{,}18\ \mathrm{J/(g \cdot K)}$)" check={[16.72]} ask={['$q$, kJ']}>
                <p><Tex>{'q = m c \\Delta T = 200 \\cdot 4{,}18 \\cdot 20 = 16\\,720\\ \\mathrm{J} = 16{,}72\\ \\mathrm{kJ}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="$\mathrm{C + O_2 \to CO_2}$, $\Delta H = -393{,}5\ \mathrm{kJ}$. Колко топлина отделят 60 g въглерод? Колко грама въглерод трябва да изгорят за 787 kJ?" check={[1967.5, 24]} ask={['$Q$, kJ', '$m$, g']}>
                <p><Tex>{'n = \\frac{60}{12} = 5\\ \\mathrm{mol}'}</Tex>, <Tex>{'Q = 5 \\cdot 393{,}5 = 1967{,}5\\ \\mathrm{kJ}'}</Tex></p>
                <p><Tex>{'n = \\frac{787}{393{,}5} = 2\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 2 \\cdot 12 = 24\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="$\mathrm{2H_2 + O_2 \to 2H_2O(l)}$, $\Delta H = -571{,}6\ \mathrm{kJ}$. Каква е $\Delta H$ на разлагането $\mathrm{2H_2O(l) \to 2H_2 + O_2}$? Колко енергия трябва да погълнат 9 g вода, за да се разложат?" check={[571.6, 142.9]} ask={['$\\Delta H$, kJ', 'енергия, kJ']}>
                <p>Обратната реакция има обратен знак: <Tex>{'\\Delta H = +571{,}6\\ \\mathrm{kJ}'}</Tex> – тя е ендотермична.</p>
                <p><Tex>{'n(\\mathrm{H_2O}) = \\frac{9}{18} = 0{,}5\\ \\mathrm{mol}'}</Tex>, <Tex>{'Q = 0{,}5 \\cdot \\frac{571{,}6}{2} = 142{,}9\\ \\mathrm{kJ}'}</Tex></p>
                <p>Затова електролизата на водата изисква много електрическа енергия.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Оценете $\Delta H$ на горенето $\mathrm{CH_4 + 2O_2 \to CO_2 + 2H_2O(g)}$ по енергиите на връзките от т. 5." check={[-802]} ask={['$\\Delta H$, kJ']}>
                <p>Скъсват се: <Tex>{'4 \\cdot 413 + 2 \\cdot 498 = 2648\\ \\mathrm{kJ}'}</Tex></p>
                <p>Образуват се: <Tex>{'2 \\cdot 799 + 4 \\cdot 463 = 3450\\ \\mathrm{kJ}'}</Tex></p>
                <p><Tex>{'\\Delta H \\approx 2648 - 3450 = -802\\ \\mathrm{kJ}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Пресметнете $\Delta H$ на горенето на пропан $\mathrm{C_3H_8 + 5O_2 \to 3CO_2 + 4H_2O(l)}$, ако $\Delta_f H^\circ(\mathrm{C_3H_8}) = -103{,}8\ \mathrm{kJ/mol}$ (другите данни – от таблицата в т. 6). Каква е калоричността на пропана в kJ/g?" check={[-2219.9, 50.5]} ask={['$\\Delta H$, kJ', 'kJ/g']}>
                <p><Tex>{'\\Delta H = 3 \\cdot (-393{,}5) + 4 \\cdot (-285{,}8) - (-103{,}8) = -1180{,}5 - 1143{,}2 + 103{,}8 = -2219{,}9\\ \\mathrm{kJ}'}</Tex></p>
                <p><Tex>{'\\frac{2219{,}9}{44} \\approx 50{,}5\\ \\mathrm{kJ/g}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Дадени са (1) $\mathrm{S + O_2 \to SO_2}$, $\Delta H_1 = -296{,}8\ \mathrm{kJ}$ и (2) $\mathrm{2SO_2 + O_2 \to 2SO_3}$, $\Delta H_2 = -197{,}8\ \mathrm{kJ}$. Намерете $\Delta H$ на $\mathrm{S + \tfrac{3}{2}O_2 \to SO_3}$." check={[-395.7]} ask={['$\\Delta H$, kJ']}>
                <p>Търсеното уравнение е (1) + ½·(2).</p>
                <p><Tex>{'\\Delta H = -296{,}8 + \\tfrac{1}{2} \\cdot (-197{,}8) = -296{,}8 - 98{,}9 = -395{,}7\\ \\mathrm{kJ}'}</Tex></p>
                <p>Това е и стандартната енталпия на образуване на <Tex>{'\\mathrm{SO_3(g)}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="С цикъла на Борн–Хабер намерете енергията на решетката на NaCl (kJ/mol), ако: $\Delta_f H^\circ(\mathrm{NaCl}) = -411{,}2$; сублимация на Na $+107{,}3$; първа йонизационна енергия на Na $+495{,}8$; енергия на връзката Cl–Cl $243{,}4$; присъединяване на електрон към Cl $-348{,}6$." check={[-787.4]} ask={['$\\Delta H_{\\text{реш}}$, kJ/mol']}>
                <p>За 1 mol NaCl трябва половин мол <Tex>{'\\mathrm{Cl_2}'}</Tex>: <Tex>{'\\tfrac{1}{2} \\cdot 243{,}4 = 121{,}7\\ \\mathrm{kJ}'}</Tex>.</p>
                <p><Tex>{'107{,}3 + 495{,}8 + 121{,}7 - 348{,}6 + \\Delta H_{\\text{реш}} = -411{,}2'}</Tex></p>
                <p><Tex>{'\\Delta H_{\\text{реш}} = -411{,}2 - 376{,}2 = -787{,}4\\ \\mathrm{kJ/mol}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="За $\mathrm{CaCO_3 \to CaO + CO_2}$: $\Delta H = +179{,}2\ \mathrm{kJ}$, $\Delta S = +160{,}2\ \mathrm{J/K}$. Пресметнете $\Delta G$ при 298 K и оценете над каква температура (K) разлагането става самопроизволно, като приемете, че $\Delta H$ и $\Delta S$ не зависят от температурата." check={[131.5, 1119]} ask={['$\\Delta G$, kJ', '$T$, K']}>
                <p><Tex>{'\\Delta G = 179{,}2 - 298 \\cdot 0{,}1602 \\approx 179{,}2 - 47{,}7 = 131{,}5\\ \\mathrm{kJ} > 0'}</Tex> – при стайна температура варовикът е устойчив.</p>
                <p><Tex>{'\\Delta G < 0 \\iff T > \\frac{\\Delta H}{\\Delta S} = \\frac{179\\,200}{160{,}2} \\approx 1119\\ \\mathrm{K}'}</Tex> (около 846 °C).</p>
                <p>Внимавай с единиците: <Tex>{'\\Delta H'}</Tex> е в kJ, а <Tex>{'\\Delta S'}</Tex> – в J/K.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="10 L (н.у.) смес от метан и етан изгарят напълно до $\mathrm{CO_2}$ и течна вода и отделят 500 kJ. Енталпиите на горене са $-890{,}3\ \mathrm{kJ/mol}$ за метана и $-1560{,}4\ \mathrm{kJ/mol}$ за етана. Каква е обемната част на етана в сместа?" check={[34.3]} ask={['$\\varphi(\\mathrm{C_2H_6})$, %']}>
                <p><Tex>{'n = \\frac{10}{22{,}4} \\approx 0{,}4464\\ \\mathrm{mol}'}</Tex>. Нека етанът е <Tex>{'y'}</Tex> mol, метанът – <Tex>{'0{,}4464 - y'}</Tex>.</p>
                <p><Tex>{'890{,}3(0{,}4464 - y) + 1560{,}4\\,y = 500 \\Rightarrow 670{,}1\\,y = 102{,}5 \\Rightarrow y \\approx 0{,}153\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'\\varphi(\\mathrm{C_2H_6}) = \\frac{0{,}153}{0{,}4464} \\approx 34{,}3\\%'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Екзотермичните реакции отделят топлина (<Tex>{'\\Delta H < 0'}</Tex>), ендотермичните поглъщат (<Tex>{'\\Delta H > 0'}</Tex>)</li>
              <li>✓ <Tex>{'\\Delta H'}</Tex> е пропорционална на <Term id="amount-of-substance">количеството вещество</Term>; обратната реакция има обратен знак; агрегатните състояния са важни</li>
              <li>✓ Калориметрия: <Tex>{'q = mc\\Delta T'}</Tex>, <Tex>{'\\Delta H = -q/n'}</Tex></li>
              <li>✓ Закон на Хес: <Tex>{'\\Delta H'}</Tex> не зависи от пътя – уравненията и топлинните им ефекти се събират</li>
              <li>✓ <Tex>{'\\Delta H \\approx \\sum E_{\\text{скъсани}} - \\sum E_{\\text{образувани}}'}</Tex>; <Tex>{'\\Delta H = \\sum \\Delta_f H^\\circ_{\\text{прод}} - \\sum \\Delta_f H^\\circ_{\\text{реаг}}'}</Tex></li>
              <li>✓ Енергията на активиране е бариерата по пътя; <Term id="catalyst">катализаторът</Term> я понижава, но не променя <Tex>{'\\Delta H'}</Tex></li>
              <li>✓ Самопроизволността се определя от <Tex>{'\\Delta G = \\Delta H - T\\Delta S < 0'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Има консерви, които се самозагряват: в двойното им дъно има негасена вар и вода. При натискане водата се смесва с варта и
              реакцията <Tex>{'\\mathrm{CaO + H_2O \\to Ca(OH)_2}'}</Tex> отделя около 65 kJ на мол – достатъчно, за да стопли супата за
              няколко минути без огън. Същата реакция кара гасената вар в строителството да кипи и да пуши.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
