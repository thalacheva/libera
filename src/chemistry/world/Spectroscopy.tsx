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
import { Molecule } from '../StructuralFormula';
import BeerLambertLab from './BeerLambertLab';
import IrSpectrumLab from './IrSpectrumLab';
import MassSpecLab from './MassSpecLab';
import NmrSpectrum, { type NmrSignal } from './NmrSpectrum';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');

const NMR_COUNTS: [string, string, number, string][] = [
  ['етанол', 'CH_3CH_2OH', 3, 'CH₃, CH₂ и OH – три вида водородни атоми.'],
  ['диметилов етер', 'CH_3OCH_3', 1, 'Двете метилови групи са еднакви – всички 6 H са еквивалентни.'],
  ['пропанон', 'CH_3COCH_3', 1, 'Двете метилови групи са симетрични спрямо C=O.'],
  ['пропанал', 'CH_3CH_2CHO', 3, 'CH₃, CH₂ и CHO.'],
  ['пропан-1-ол', 'CH_3CH_2CH_2OH', 4, 'CH₃, двете различни CH₂ и OH.'],
  ['пропан-2-ол', '(CH_3)_2CHOH', 3, 'Двете CH₃ са еднакви; плюс CH и OH.'],
  ['метилов етаноат', 'CH_3COOCH_3', 2, 'Двете CH₃ са в различно обкръжение – до C=O и до O.'],
  ['бензен', 'C_6H_6', 1, 'Всичките шест H на пръстена са еквивалентни.'],
  ['2-хлоропропан', 'CH_3CHClCH_3', 2, 'Двете CH₃ са еднакви; плюс CH.'],
];
const ISOTOPES: [string, number, number, number, number][] = [
  ['Cl', 35, 37, 75, 25],
  ['Br', 79, 81, 51, 49],
  ['B', 10, 11, 20, 80],
  ['Li', 6, 7, 8, 92],
  ['Ga', 69, 71, 60, 40],
  ['Cu', 63, 65, 69, 31],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const A = randInt(1, 3);
    return Math.random() < 0.5
      ? {
          tex: `T = ${dec(100 / 10 ** A)}\\%`,
          ask: 'Каква е абсорбцията A?',
          num: A,
          den: 1,
          steps: [`$A = -\\lg T = -\\lg ${dec(10 ** -A)} = ${A}$`],
        }
      : {
          tex: `A = ${A}`,
          ask: 'Колко процента от светлината пропуска разтворът?',
          num: 100,
          den: 10 ** A,
          steps: [`$T = 10^{-A} = 10^{-${A}} = ${dec(10 ** -A)}$, т.е. $${dec(100 / 10 ** A)}\\%$`],
        };
  }
  if (kind === 1 || kind === 2) {
    const eps = pick([100, 200, 250, 400, 500, 1000, 2000, 2500]);
    const l2 = pick([1, 2, 4]); // дължина на кюветата в половин сантиметри
    const l = l2 / 2;
    const k = randInt(1, 9); // c = k · 10⁻⁴ mol/L
    const A = (eps * l2 * k) / 20000;
    return kind === 1
      ? {
          tex: `\\varepsilon = ${eps}\\ \\mathrm{L/(mol \\cdot cm)},\\ l = ${dec(l)}\\ \\mathrm{cm},\\ c = ${dec(k / 10)}\\ \\mathrm{mmol/L}`,
          ask: 'Каква е абсорбцията A?',
          num: eps * l2 * k,
          den: 20000,
          steps: [`$c = ${dec(k / 10)}\\ \\mathrm{mmol/L} = ${dec(k / 10000)}\\ \\mathrm{mol/L}$`, `$A = \\varepsilon l c = ${eps} \\cdot ${dec(l)} \\cdot ${dec(k / 10000)} = ${dec(A)}$`],
        }
      : {
          tex: `A = ${dec(A)},\\ \\varepsilon = ${eps}\\ \\mathrm{L/(mol \\cdot cm)},\\ l = ${dec(l)}\\ \\mathrm{cm}`,
          ask: 'Каква е концентрацията в mmol/L?',
          num: k,
          den: 10,
          steps: [`$c = \\frac{A}{\\varepsilon l} = \\frac{${dec(A)}}{${eps} \\cdot ${dec(l)}} = ${dec(k / 10000)}\\ \\mathrm{mol/L} = ${dec(k / 10)}\\ \\mathrm{mmol/L}$`],
        };
  }
  if (kind === 3) {
    const lam = pick([2, 2.5, 4, 5, 8, 10, 12.5, 16, 20]);
    const nu = 10000 / lam;
    return Math.random() < 0.5
      ? {
          tex: `\\lambda = ${dec(lam)}\\ \\mathrm{\\mu m}`,
          ask: 'Какво е вълновото число в cm⁻¹?',
          num: nu,
          den: 1,
          steps: [`$\\lambda = ${dec(lam)}\\ \\mathrm{\\mu m} = ${dec(lam / 10000)}\\ \\mathrm{cm}$`, `$\\tilde{\\nu} = \\frac{1}{\\lambda} = ${dec(nu)}\\ \\mathrm{cm^{-1}}$`],
        }
      : {
          tex: `\\tilde{\\nu} = ${dec(nu)}\\ \\mathrm{cm^{-1}}`,
          ask: 'Каква е дължината на вълната в µm?',
          num: lam * 10,
          den: 10,
          steps: [`$\\lambda = \\frac{1}{\\tilde{\\nu}} = \\frac{1}{${dec(nu)}}\\ \\mathrm{cm} = ${dec(lam / 10000)}\\ \\mathrm{cm} = ${dec(lam)}\\ \\mathrm{\\mu m}$`],
        };
  }
  if (kind === 4) {
    const [what, ratio, steps] = pick<[string, [number, number], string]>([
      ['един атом Cl', [3, 1], '³⁵Cl : ³⁷Cl ≈ 3 : 1, затова M : (M+2) ≈ 3 : 1.'],
      ['един атом Br', [1, 1], '⁷⁹Br : ⁸¹Br ≈ 1 : 1, затова двата пика са почти еднакви.'],
      ['два атома Cl', [9, 6], 'С два атома Cl: M : (M+2) : (M+4) ≈ 9 : 6 : 1.'],
    ]);
    const k = randInt(2, 12);
    const hM = ratio[0] * k;
    return {
      tex: `\\text{${what}},\\ \\text{височина на M} = ${hM}`,
      ask: 'Каква е височината на пика M+2?',
      num: ratio[1] * k,
      den: 1,
      steps: [steps, `$${hM} \\cdot \\frac{${ratio[1]}}{${ratio[0]}} = ${ratio[1] * k}$`],
    };
  }
  if (kind === 5) {
    const [el, m1, m2, p1, p2] = pick(ISOTOPES);
    return {
      tex: `\\text{пикове } ${m1} : ${m2} = ${p1}\\% : ${p2}\\%\\ (\\mathrm{${el}})`,
      ask: 'Каква е относителната атомна маса (с цели масови числа)?',
      num: m1 * p1 + m2 * p2,
      den: 100,
      steps: [`$A_r = ${dec(p1 / 100)} \\cdot ${m1} + ${dec(p2 / 100)} \\cdot ${m2} = ${dec((m1 * p1 + m2 * p2) / 100)}$`],
    };
  }
  const [name, f, n, why] = pick(NMR_COUNTS);
  return {
    tex: `\\text{${name}}\\ \\mathrm{${f}}`,
    ask: 'Колко сигнала има в ¹H ЯМР спектъра?',
    num: n,
    den: 1,
    steps: [why],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '💧 Желязо в кладенеца',
    problem:
      'Желязото във вода се определя фотометрично: с подходящ реактив то дава оранжевочервен комплекс. Стандартен разтвор с 2,0 mg/L желязо дава абсорбция 0,40, а пробата от кладенеца – 0,26 (същата кювета и дължина на вълната). Колко mg/L желязо има в пробата?',
    solution: ['По закона на Бер–Ламберт абсорбцията е пропорционална на концентрацията.', '$c = 2{,}0 \\cdot \\frac{0{,}26}{0{,}40} = 1{,}3\\ \\mathrm{mg/L}$', 'Това е много повече от ориентира за питейна вода от 0,2 mg/L – водата ще има метален вкус и ще оставя ръждиви петна.'],
    answer: '$1{,}3\\ \\mathrm{mg/L}$',
    check: [1.3],
    ask: ['желязо, mg/L'],
  },
  {
    title: '🚗 Дрегер с инфрачервена светлина',
    problem:
      'Някои анализатори на алкохол в издишания въздух мерят поглъщането на инфрачервена светлина с дължина на вълната около 3,4 µm и 9,5 µm. Пресметнете вълновите числа. Кои връзки в етанола поглъщат там?',
    solution: ['$\\tilde{\\nu} = \\frac{1}{\\lambda}$: $3{,}4\\ \\mathrm{\\mu m} = 3{,}4 \\cdot 10^{-4}\\ \\mathrm{cm} \\Rightarrow \\tilde{\\nu} \\approx 2941\\ \\mathrm{cm^{-1}}$', '$9{,}5\\ \\mathrm{\\mu m} \\Rightarrow \\tilde{\\nu} \\approx 1053\\ \\mathrm{cm^{-1}}$', 'Около 2940 cm⁻¹ поглъщат връзките C–H, а около 1050 cm⁻¹ – връзката C–O на етанола. Мерването при две дължини на вълната помага да се различи етанолът от други вещества в дъха.'],
    answer: '$\\approx 2941$ и $\\approx 1053\\ \\mathrm{cm^{-1}}$',
    check: [2941, 1053],
    ask: ['при 3,4 µm, cm⁻¹', 'при 9,5 µm, cm⁻¹'],
  },
  {
    title: '🧪 Твърде тъмен разтвор',
    problem:
      'Разтвор на KMnO₄ е толкова тъмен, че фотометърът не може да го измери. Затова 10 mL от него се разреждат до 100 mL. Разреденият разтвор в кювета 1 cm има A = 0,24. Каква е концентрацията на изходния разтвор в mmol/L? (ε ≈ 2400 L/(mol·cm))',
    solution: ['$c_{\\text{разр}} = \\frac{A}{\\varepsilon l} = \\frac{0{,}24}{2400 \\cdot 1} = 1{,}0 \\cdot 10^{-4}\\ \\mathrm{mol/L}$', 'Разреждането е 10 пъти: $c = 1{,}0 \\cdot 10^{-3}\\ \\mathrm{mol/L} = 1{,}0\\ \\mathrm{mmol/L}$', 'Без разреждане абсорбцията щеше да е около 2,4 – до детектора стига под 0,5% от светлината и измерването е ненадеждно.'],
    answer: '$1{,}0\\ \\mathrm{mmol/L}$',
    check: [1.0],
    ask: ['c, mmol/L'],
  },
  {
    title: '🔎 Следа от разтворител',
    problem:
      'Криминалисти анализират следа от течност с масспектрометър. Молекулният йон дава два почти еднакво високи пика при m/z 156 и 158. Какъв халоген съдържа молекулата и колко е масата на останалата част (ако халогенът е с по-лекия изотоп)? Каква група може да е това?',
    solution: ['Два пика на разстояние 2 с височини 1 : 1 – един атом бром (⁷⁹Br и ⁸¹Br).', 'Останалата част: $156 - 79 = 77$', '77 е масата на $\\mathrm{C_6H_5}$ (фенил): $6 \\cdot 12 + 5 = 77$. Веществото вероятно е бромобензен $\\mathrm{C_6H_5Br}$.'],
    answer: 'бром; $77$ ($\\mathrm{C_6H_5}$)',
    check: [77],
    ask: ['маса без брома'],
  },
  {
    title: '🍇 Метанол в ракията',
    problem:
      'При газова хроматография на домашна ракия пикът на етанола има площ 1800, а на метанола – 200 (в условни единици). Ако детекторът е еднакво чувствителен към двата алкохола (по маса), какъв процент от алкохолите е метанол?',
    solution: ['Площта на пика е пропорционална на количеството вещество, което е минало през детектора.', '$w = \\frac{200}{1800 + 200} \\cdot 100\\% = 10\\%$', 'Метанолът е отровен, затова такъв анализ има смисъл. В истинска лаборатория се прави калибриране със стандарти, защото чувствителността към различните вещества не е еднаква.'],
    answer: '$10\\%$',
    check: [10],
    ask: ['метанол, %'],
  },
  {
    title: '☄️ Бор от метеорит',
    problem:
      'В масспектъра на бор от проба се виждат два пика при m/z 10 и 11 с височини в отношение 20 : 80. Каква е относителната атомна маса на бора в пробата (с цели масови числа)?',
    solution: ['Височините на пиковете се отнасят като броя на атомите от всеки изотоп: 20% ¹⁰B и 80% ¹¹B.', '$A_r = 0{,}20 \\cdot 10 + 0{,}80 \\cdot 11 = 10{,}8$', 'Точно такава е стойността в периодичната система – така масспектрометрията е дала днешните атомни маси.'],
    answer: '$10{,}8$',
    check: [10.8],
    ask: ['относителна атомна маса'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Коя област на спектъра кара химичните връзки да трептят?',
    answers: ['инфрачервената', 'видимата', 'рентгеновата', 'радиовълните'],
    correctAnswer: 'инфрачервената',
  },
  {
    question: 'Разтвор изглежда син. Каква светлина поглъща най-силно?',
    answers: ['оранжева', 'синя', 'виолетова', 'зелена'],
    correctAnswer: 'оранжева',
  },
  {
    question: 'Абсорбцията на разтвор е $A = 1$. Каква част от светлината пропуска?',
    answers: ['$10\\%$', '$1\\%$', '$90\\%$', '$50\\%$'],
    correctAnswer: '$10\\%$',
  },
  {
    question: 'Как се променя абсорбцията, ако вземем кювета два пъти по-дълга?',
    answers: ['удвоява се', 'намалява наполовина', 'не се променя', 'учетворява се'],
    correctAnswer: 'удвоява се',
  },
  {
    question: 'В ИЧ спектъра има широка ивица около $3300\\ \\mathrm{cm^{-1}}$ и няма ивица около $1700\\ \\mathrm{cm^{-1}}$. Какво е веществото най-вероятно?',
    answers: ['алкохол', 'кетон', 'алкан', 'естер'],
    correctAnswer: 'алкохол',
  },
  {
    question: 'Молекулният йон дава два пика, отдалечени на 2 единици, с еднаква височина. Какво има в молекулата?',
    answers: ['един атом бром', 'един атом хлор', 'два атома хлор', 'един атом азот'],
    correctAnswer: 'един атом бром',
  },
  {
    question: 'Какво показва броят на сигналите в ¹H ЯМР спектъра?',
    answers: ['колко вида нееквивалентни водородни атоми има', 'колко водородни атома има общо', 'колко въглеродни атома има', 'моларната маса'],
    correctAnswer: 'колко вида нееквивалентни водородни атоми има',
  },
  {
    question: 'Сигналът на $\\mathrm{CH_3}$ група, свързана с $\\mathrm{CH_2}$, по правилото $n + 1$ е:',
    answers: ['триплет', 'дублет', 'квартет', 'синглет'],
    correctAnswer: 'триплет',
  },
  {
    question: 'Кое от тези вещества има един-единствен сигнал в ¹H ЯМР спектъра?',
    answers: ['пропанон', 'пропанал', 'етанол', 'пропан-2-ол'],
    correctAnswer: 'пропанон',
  },
];

// ---------- Страница ----------

const REGIONS: [string, string, string, string][] = [
  ['ултравиолетова и видима', '200–800 nm', 'преходи на електрони между нива', 'UV-Vis спектроскопия, фотометрия'],
  ['инфрачервена', '2,5–25 µm (4000–400 cm⁻¹)', 'трептения на връзките', 'ИЧ спектроскопия'],
  ['микровълни', 'mm–cm', 'въртене на молекулите', 'ротационна спектроскопия (газове)'],
  ['радиовълни (в магнитно поле)', 'm', 'ориентация на ядрените спинове', 'ЯМР'],
];

const COLORS: [string, string, string][] = [
  ['400–435', 'виолетова', 'жълтозелен'],
  ['435–490', 'синя', 'жълт'],
  ['490–560', 'зелена', 'виолетов (пурпурен)'],
  ['560–590', 'жълта', 'син'],
  ['590–620', 'оранжева', 'зеленикавосин'],
  ['620–750', 'червена', 'синьозелен'],
];

const IR_BANDS: [string, string, string][] = [
  ['O–H в алкохоли', '3200–3550', 'широка, силна'],
  ['O–H в карбоксилни киселини', '2500–3300', 'много широка'],
  ['N–H в амини', '3300–3500', 'средна; две ивици при –NH₂'],
  ['C–H (алкани)', '2850–3000', 'силна'],
  ['C≡N', '2210–2260', 'средна, остра'],
  ['C=O', '1680–1750', 'много силна, остра'],
  ['C=C', '1620–1680', 'слаба до средна'],
  ['C–O', '1000–1300', 'силна'],
];

const SHIFTS: [string, string][] = [
  ['R–CH₃, R–CH₂–R (алкилови)', '0,9–1,7'],
  ['H до C=O (CH₃–CO–)', '2,0–2,7'],
  ['H до O (CH₃–O–, –CH₂–OH)', '3,3–4,0'],
  ['H при C=C (алкени)', '4,5–6,5'],
  ['H в бензеновия пръстен', '6,5–8,0'],
  ['H в алдехидната група –CHO', '9–10'],
  ['H в –COOH', '10–12'],
];

const ETHANOL_NMR: NmrSignal[] = [
  { ppm: 3.7, lines: 4, h: 2, group: 'CH₂', split: 'квартет' },
  { ppm: 2.6, lines: 1, h: 1, group: 'OH', split: 'синглет' },
  { ppm: 1.2, lines: 3, h: 3, group: 'CH₃', split: 'триплет' },
];
const ETHER_NMR: NmrSignal[] = [{ ppm: 3.3, lines: 1, h: 6, group: '2 × CH₃', split: 'синглет' }];
const PROPANAL_NMR: NmrSignal[] = [
  { ppm: 9.8, lines: 3, h: 1, group: 'CHO', split: 'триплет' },
  { ppm: 2.5, lines: 4, h: 2, group: 'CH₂', split: 'мултиплет' },
  { ppm: 1.1, lines: 3, h: 3, group: 'CH₃', split: 'триплет' },
];
const PROPANONE_NMR: NmrSignal[] = [{ ppm: 2.2, lines: 1, h: 6, group: '2 × CH₃', split: 'синглет' }];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';
const tableBox = 'overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900';
const figure = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-4';

export function Spectroscopy() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Спектроскопия и анализ</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔬 Отровата стрихнин е изолирана през 1818 г. Химиците я разграждат, синтезират части от нея и спорят за строежа ѝ повече от век –
            едва през 1946 г. Робърт Робинсън публикува вярната формула. Днес студент с <Term id="mass-spectrometer">масспектрометър</Term>, инфрачервен спектрометър и ЯМР
            апарат определя строежа на непознато вещество за един следобед, като използва милиграми от него. Молекулите сами „разказват“ за
            себе си – стига да ги попиташ със светлина с подходяща <Term id="wavelength">дължина на вълната</Term>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Светлина и вещество</h2>
          <p className={text}>
            Молекулата поглъща <Term id="photon">фотон</Term> само ако енергията му <Tex>{'E = h\\nu = \\frac{hc}{\\lambda}'}</Tex> е точно
            разликата между две нейни <Term id="energy-level">енергетични нива</Term>. Различните области на <Term id="spectrum">спектъра</Term> „питат“ за различни неща: видимата светлина премества
            електрони, инфрачервената разклаща връзките, а <Term id="em-wave">радиовълните</Term> в силно <Term id="magnetic-field">магнитно поле</Term> обръщат ядрените <Term id="spin">спинове</Term>. Енергията на фотона и
            линейчатите спектри на атомите са разгледани в уроците{' '}
            <Link to="/physics/modern/photons" className={link}>
              Фотони и фотоефект
            </Link>
            ,{' '}
            <Link to="/physics/modern/atom" className={link}>
              Атомът
            </Link>{' '}
            и{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>
            , а <Term id="flame-test">оцветяването на пламъка</Term> – в{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            .
          </p>
          <div className={tableBox}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Област</th>
                  <th className={th}>Дължина на вълната</th>
                  <th className={th}>Какво се променя в молекулата</th>
                  <th className={th}>Метод</th>
                </tr>
              </thead>
              <tbody>
                {REGIONS.map(r => (
                  <tr key={r[0]}>
                    {r.map(c => (
                      <td key={c} className={td}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Масспектрометрията е друго: там молекулите не поглъщат светлина, а се йонизират и се разделят по масата си. Затова се казва
            „спектрометрия“, а методите заедно – <strong>спектрални методи за анализ</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Цвят и поглъщане на светлина</h2>
          <p className={text}>
            Цветен <Term id="solution">разтвор</Term> поглъща част от видимата светлина. Окото вижда останалата светлина – затова виждаме цвета, <strong>допълнителен</strong>{' '}
            на погълнатия. Разтворът на калиев перманганат поглъща зелената светлина (около 525 nm) и изглежда виолетов; медният амонячен
            комплекс поглъща оранжевата и изглежда наситено син.
          </p>
          <div className={tableBox}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Погълната λ, nm</th>
                  <th className={th}>Погълнат цвят</th>
                  <th className={th}>Виждаме цвят</th>
                </tr>
              </thead>
              <tbody>
                {COLORS.map(r => (
                  <tr key={r[0]}>
                    {r.map(c => (
                      <td key={c} className={td}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Границите между цветовете са условни – таблицата е ориентировъчна. Спектрофотометърът мери за всяка дължина на вълната каква част
            от светлината минава през пробата и дава <strong>спектър на поглъщане</strong>: най-силно поглъщане има при{' '}
            <Tex>{'\\lambda_{\\max}'}</Tex>, и там се правят измерванията.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Законът на Бер–Ламберт</h2>
          <Theorem
            type="definition"
            title="Пропускане и абсорбция"
            description="Ако на пробата пада светлина с интензитет $I_0$, а излиза $I$, пропускането е $T = \frac{I}{I_0}$ (често в %), а абсорбцията (оптичната плътност) е $A = \lg \frac{I_0}{I} = -\lg T$. При $A = 1$ минава 10% от светлината, при $A = 2$ – 1%."
          />
          <Theorem
            title="Закон на Бер–Ламберт"
            description="За разреден разтвор абсорбцията е право пропорционална на концентрацията и на дебелината на слоя: $A = \varepsilon l c$, където $c$ е в mol/L, $l$ – дължината на кюветата в cm, а $\varepsilon$ – моларният коефициент на поглъщане в L/(mol·cm), който зависи от веществото и от дължината на вълната."
          />
          <p className={text}>
            <Term id="logarithm">Логаритъмът</Term> идва оттук, че всеки тънък слой поглъща една и съща <em>част</em> от падащата светлина: два еднакви слоя, всеки
            пропускащ 50%, пропускат общо 25%, а абсорбциите им се събират. Затова удвояването на концентрацията или на дължината на кюветата
            удвоява <Tex>{'A'}</Tex>, но не удвоява погълнатата светлина.
          </p>
          <Example
            description="Разтвор на KMnO₄ в кювета 1 cm има абсорбция 0,60 при 525 nm (ε ≈ 2400 L/(mol·cm)). Каква е концентрацията? Каква част от светлината минава?"
            steps={[
              '$c = \\frac{A}{\\varepsilon l} = \\frac{0{,}60}{2400 \\cdot 1} = 2{,}5 \\cdot 10^{-4}\\ \\mathrm{mol/L} = 0{,}25\\ \\mathrm{mmol/L}$',
              '$T = 10^{-0{,}60} \\approx 0{,}25$ – минава около 25% от светлината.',
            ]}
          />
          <p className={text}>
            На практика не се разчита на ε от таблица. Приготвят се няколко <strong>стандартни разтвора</strong> с известна{' '}
            <Term id="molar-concentration">концентрация</Term>, измерва се абсорбцията им и се строи <strong>калибровъчна права</strong>. По нея
            се отчита концентрацията на пробата. Ако пробата е твърде тъмна (<Tex>{'A > 1{,}5'}</Tex>), тя се{' '}
            <Term id="dilution">разрежда</Term> – при много малко пропусната светлина измерването е неточно, а в концентрирани разтвори законът
            вече не е точен.
          </p>
          <BeerLambertLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Инфрачервена спектроскопия</h2>
          <p className={text}>
            <Term id="chemical-bond">Химичните връзки</Term> не са твърди пръчки – те трептят като пружини с определена <Term id="frequency">честота</Term>. Връзка между леки атоми (O–H, C–H) или по-здрава
            връзка (C=O, C≡N) трепти по-бързо и поглъща инфрачервена светлина с по-голяма енергия. В ИЧ спектроскопията вместо дължина на
            вълната се използва <strong>вълновото число</strong>.
          </p>
          <Theorem
            type="definition"
            title="Вълново число"
            description="Вълновото число е броят на дължините на вълната в един сантиметър: $\tilde{\nu} = \frac{1}{\lambda}$, в $\mathrm{cm^{-1}}$. То е пропорционално на енергията на фотона. Например $\lambda = 5\ \mathrm{\mu m} = 5 \cdot 10^{-4}\ \mathrm{cm}$ дава $\tilde{\nu} = 2000\ \mathrm{cm^{-1}}$."
          />
          <div className={tableBox}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Връзка</th>
                  <th className={th}>
                    <Tex>{'\\tilde{\\nu},\\ \\mathrm{cm^{-1}}'}</Tex>
                  </th>
                  <th className={th}>Вид на ивицата</th>
                </tr>
              </thead>
              <tbody>
                {IR_BANDS.map(r => (
                  <tr key={r[0]}>
                    {r.map(c => (
                      <td key={c} className={td}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Над 1500 cm⁻¹ всяка ивица издава определена <Term id="functional-group">функционална група</Term> (виж{' '}
            <Link to="/chemistry/organic/functional-groups" className={link}>
              Функционални групи
            </Link>
            ). Под 1500 cm⁻¹ е <strong>областта на отпечатъка</strong>: там има много ивици, които заедно са уникални за всяко вещество – по тях
            веществото се разпознава, като спектърът се сравни с библиотека от спектри.
          </p>
          <Example
            description="Веществата етанол и диметилов етер имат една и съща формула C₂H₆O. Как ги различава ИЧ спектърът?"
            steps={[
              'Етанолът $\\mathrm{CH_3CH_2OH}$ има група O–H – широка силна ивица около 3200–3550 cm⁻¹.',
              'Диметиловият етер $\\mathrm{CH_3OCH_3}$ няма O–H; има само C–H (около 2800–3000 cm⁻¹) и C–O (около 1100 cm⁻¹).',
              'Достатъчно е да погледнем областта около 3300 cm⁻¹.',
            ]}
          />
          <IrSpectrumLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Масспектрометрия</h2>
          <p className={text}>
            В масспектрометъра молекулите се йонизират (най-често с поток електрони) и се получава <strong>молекулен йон</strong>{' '}
            <Tex>{'\\mathrm{M^+}'}</Tex>. Част от молекулните йони се разпадат на <strong>фрагменти</strong>. Електрично и магнитно поле или
            времето на прелитане разделят <Term id="ion">йоните</Term> по отношението маса към <Term id="electric-charge">заряд</Term> <Tex>{'m/z'}</Tex>. Спектърът е поредица от пикове: най-високият
            се нарича <strong>основен пик</strong> и се приема за 100%.
          </p>
          <Theorem
            title="Какво се чете от масспектъра"
            description="Най-тежкият пик (без малките изотопни пикове до него) е молекулният йон – той дава моларната маса. Разликите между пиковете показват какво се е откъснало: $M - 15$ е загуба на $\mathrm{CH_3}$, $M - 17$ – на $\mathrm{OH}$, $M - 29$ – на $\mathrm{C_2H_5}$ или $\mathrm{CHO}$. Изотопите дават групи пикове: един атом Cl – пикове M и M+2 в отношение около $3 : 1$, един атом Br – около $1 : 1$, два атома Cl – $9 : 6 : 1$."
          />
          <p className={text}>
            Масспектрометрията е и начинът, по който са определени <Term id="isotope">изотопите</Term> на елементите и техните дялове – а оттам и{' '}
            <Term id="relative-atomic-mass">относителните атомни маси</Term> (виж{' '}
            <Link to="/chemistry/structure/atoms" className={link}>
              Атоми, изотопи и периодичната система
            </Link>
            ). Малкият пик M+1 идва от изотопа ¹³C: около 1,1% на всеки въглероден атом. Ако M+1 е 4,4% от M, в молекулата има около 4 атома C.
          </p>
          <Example
            description="В масспектъра на хлора Cl₂ има пикове при 70, 72 и 74. Защо са три и в какво отношение са?"
            steps={[
              'Всеки атом е ³⁵Cl (около 75,8%) или ³⁷Cl (около 24,2%). Молекулата може да е ³⁵Cl–³⁵Cl (70), ³⁵Cl–³⁷Cl (72) или ³⁷Cl–³⁷Cl (74).',
              '$P(70) = 0{,}758^2 \\approx 0{,}574$; $P(72) = 2 \\cdot 0{,}758 \\cdot 0{,}242 \\approx 0{,}367$; $P(74) = 0{,}242^2 \\approx 0{,}059$',
              'Отношението е около $100 : 64 : 10$, т.е. приблизително $9 : 6 : 1$ – като $(3 + 1)^2$ при отношение $3 : 1$ за един атом.',
            ]}
          />
          <MassSpecLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Ядрен магнитен резонанс (за напреднали)</h2>
          <p className={text}>
            Ядрото на водородния атом (<Term id="proton">протонът</Term>) се държи като малък магнит. В силно магнитно поле то поглъща радиовълни с честота, която
            зависи от <strong>обкръжението</strong> му: електроните наоколо го „екранират“ от полето. Затова водородните атоми в различни групи
            дават сигнали на различни места. Положението на сигнала се дава като <strong>химично отместване</strong> δ в милионни части (ppm)
            спрямо еталон.
          </p>
          <Theorem
            title="Как се чете ¹H ЯМР спектър"
            description="1) Броят на сигналите е броят на видовете нееквивалентни водородни атоми. 2) Площта под сигнала (интеграцията) е пропорционална на броя на водородните атоми от този вид. 3) Химичното отместване показва обкръжението: колкото по-близо е електроотрицателен атом или C=O, толкова по-голямо е δ. 4) Правило $n + 1$: сигналът на H, които имат $n$ еквивалентни съседни H (на съседния въглероден атом), се разцепва на $n + 1$ линии."
          />
          <div className={tableBox}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Вид водороден атом</th>
                  <th className={th}>δ, ppm (приблизително)</th>
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map(r => (
                  <tr key={r[0]}>
                    <td className={td}>{r[0]}</td>
                    <td className={td}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={figure}>
            <div className="flex flex-wrap justify-center gap-6 mb-2">
              <Molecule smiles="CCO" mode="semi" title="етанол" />
              <Molecule smiles="COC" mode="semi" title="диметилов етер" />
            </div>
            <NmrSpectrum title="етанол CH₃CH₂OH" signals={ETHANOL_NMR} />
            <NmrSpectrum title="диметилов етер CH₃OCH₃" signals={ETHER_NMR} />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Схематични спектри. Сигналът на OH в етанола обикновено е синглет и мястото му зависи от концентрацията и <Term id="solvent">разтворителя</Term>.
            </p>
          </div>
          <p className={text}>
            При етанола CH₃ има два съседни H (от CH₂) – триплет; CH₂ има три съседни H – квартет. Отношението на площите е 3 : 2 : 1. При
            диметиловия етер всичките шест H са еднакви – един синглет. Същата физика стои зад медицинския ЯМР томограф: там се „снимат“
            протоните на водата в <Term id="tissue">тъканите</Term>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Хроматографията в анализа</h2>
          <p className={text}>
            Смесите първо се разделят. Идеята на <Term id="chromatography">хроматографията</Term> е описана в урока{' '}
            <Link to="/chemistry/structure/substances" className={link}>
              Вещества, смеси и разделяне
            </Link>
            : веществата се движат с различна скорост, защото различно се задържат от неподвижната фаза. В <strong>газовата хроматография</strong>{' '}
            пробата се изпарява и газ-носител я прекарва през дълга тънка колона; в <strong>течната хроматография (HPLC)</strong> разтворът се
            изтласква под високо налягане през колона с фини частици.
          </p>
          <p className={text}>
            Всяко вещество излиза от колоната след свое <strong>време на задържане</strong> – по него се разпознава, а площта на пика показва
            количеството. Най-мощна е комбинацията <strong>GC–MS</strong>: хроматографът разделя сместа, а масспектрометърът определя всяко
            вещество поотделно. Така работят допинг лабораториите, криминалистите и контролът на храните.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Как се определя непознато вещество</h2>
          <p className={text}>Методите се допълват. Обичайният ред при олимпиадни задачи и в истинска лаборатория е:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li><Term id="molecular-formula">Молекулна формула</Term> – от елементен анализ и <Term id="molar-mass">моларната маса</Term> (молекулния йон в масспектъра).</li>
            <li>
              <Term id="degree-of-unsaturation">Степен на ненаситеност</Term> – колко пръстена и π-връзки има (виж{' '}
              <Link to="/chemistry/organic/hydrocarbons" className={link}>
                Въглеводороди
              </Link>
              ).
            </li>
            <li>ИЧ спектър – кои функционални групи има.</li>
            <li>¹H ЯМР – как са подредени въглеродните и водородните атоми.</li>
            <li>Проверка: дава ли предложената формула всички наблюдавани пикове и сигнали.</li>
          </ol>
          <Example
            description="Течност C₃H₆O има силна ИЧ ивица при 1715 cm⁻¹ и няма ивици около 2720 cm⁻¹. В ¹H ЯМР спектъра има един синглет при 2,2 ppm. Кое е веществото?"
            steps={[
              'Степен на ненаситеност: $\\frac{2 \\cdot 3 + 2 - 6}{2} = 1$ – една двойна връзка или пръстен.',
              'Ивицата при 1715 cm⁻¹ е C=O. Липсата на ивици около 2720 cm⁻¹ говори против алдехид.',
              'Един синглет за 6 H – две еднакви CH₃ групи до C=O (δ ≈ 2,2). Веществото е пропанон (ацетон) $\\mathrm{CH_3COCH_3}$.',
              'Изомерът пропанал $\\mathrm{CH_3CH_2CHO}$ би дал три сигнала, единият около 9,8 ppm.',
            ]}
          />
          <div className={figure}>
            <div className="flex flex-wrap justify-center gap-6 mb-2">
              <Molecule smiles="CCC=O" mode="semi" title="пропанал" highlightAtoms={[3]} />
              <Molecule smiles="CC(C)=O" mode="semi" title="пропанон" highlightAtoms={[3]} />
            </div>
            <NmrSpectrum title="пропанал CH₃CH₂CHO" signals={PROPANAL_NMR} />
            <NmrSpectrum title="пропанон CH₃COCH₃" signals={PROPANONE_NMR} />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Схематични спектри. Сигналът на CH₂ в пропанала се разцепва и от CH₃, и от CHO, затова е по-сложен мултиплет.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>
            Абсорбция и пропускане, закон на Бер–Ламберт, вълнови числа, изотопни пикове, относителна атомна маса и брой сигнали в ЯМР.
            Десетичните отговори въвеждай като 0,5.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Анализът около нас</h2>
          <p className={text}>Водата от кладенеца, дрегерът на пътя, криминалистиката и домашната ракия – навсякъде работят спектрални методи.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Абсорбция и процент', '$A = 0{,}5$ значи, че се поглъща 50%.', '$T = 10^{-0{,}5} \\approx 32\\%$ – поглъщат се около 68%.'],
              ['Цветът на разтвора', 'Синият разтвор поглъща синя светлина.', 'Поглъща оранжева; виждаме допълнителния цвят.'],
              ['Бер–Ламберт без граници', '$A$ расте право пропорционално на $c$ при всяка концентрация.', 'Законът важи за разредени разтвори; при $A > 1{,}5$ се разрежда.'],
              ['Единици на вълновото число', '$\\lambda = 5\\ \\mathrm{\\mu m} \\Rightarrow \\tilde{\\nu} = \\frac{1}{5 \\cdot 10^{-6}}\\ \\mathrm{cm^{-1}}$', '$\\lambda$ се превръща в cm: $5 \\cdot 10^{-4}\\ \\mathrm{cm} \\Rightarrow 2000\\ \\mathrm{cm^{-1}}$'],
              ['Основен и молекулен пик', 'Най-високият пик е молекулният йон.', 'Най-високият е основният пик; молекулният е най-тежкият (без изотопните).'],
              ['Сигнали в ЯМР', 'Етанолът има 6 сигнала – по един за всеки H.', 'Има 3 сигнала – три вида H; броят H показва площта.'],
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
          <h2 className={h2}>12. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Разтвор пропуска 10% от светлината. Каква е абсорбцията му? А ако пропуска 1%?" check={[1, 2]} ask={['$A$ при 10%', '$A$ при 1%']}>
                <p><Tex>{'A = -\\lg T = -\\lg 0{,}1 = 1'}</Tex></p>
                <p><Tex>{'A = -\\lg 0{,}01 = 2'}</Tex> – всяка единица абсорбция намалява пропуснатата светлина 10 пъти.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Разтвор на $\mathrm{KMnO_4}$ ($\varepsilon \approx 2400\ \mathrm{L/(mol \cdot cm)}$) в кювета 1 cm има абсорбция 0,48. Каква е концентрацията му в mmol/L?" check={[0.2]} ask={['$c$, mmol/L']}>
                <p><Tex>{'c = \\frac{A}{\\varepsilon l} = \\frac{0{,}48}{2400 \\cdot 1} = 2{,}0 \\cdot 10^{-4}\\ \\mathrm{mol/L}'}</Tex></p>
                <p>Това са 0,20 mmol/L.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="В масспектъра на халогеналкан молекулният йон дава пикове при m/z 78 и 80 с височини около 3 : 1. Какъв халоген има? Колко е m/z на M⁺ с по-лекия изотоп и каква е масата на останалата част без халогена?" check={[78, 43]} ask={['m/z на M⁺', 'маса без халогена']}>
                <p>Отношение 3 : 1 на разстояние 2 – един атом хлор.</p>
                <p>M⁺ с ³⁵Cl е при 78; без хлора остават <Tex>{'78 - 35 = 43'}</Tex>.</p>
                <p>43 е <Tex>{'\\mathrm{C_3H_7}'}</Tex> (<Tex>{'3 \\cdot 12 + 7'}</Tex>) – веществото е хлоропропан <Tex>{'\\mathrm{C_3H_7Cl}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Стандартни разтвори с 2, 4, 6 и 8 mg/L дават абсорбции 0,24; 0,48; 0,72 и 0,96. Проба, разредена 5 пъти, има A = 0,54. Колко mg/L има в разредената проба и колко в изходната?" check={[4.5, 22.5]} ask={['разредена, mg/L', 'изходна, mg/L']}>
                <p>Калибровъчната права е <Tex>{'A = 0{,}12 \\cdot c'}</Tex> (c в mg/L).</p>
                <p><Tex>{'c = \\frac{0{,}54}{0{,}12} = 4{,}5\\ \\mathrm{mg/L}'}</Tex></p>
                <p>Изходната проба: <Tex>{'4{,}5 \\cdot 5 = 22{,}5\\ \\mathrm{mg/L}'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В ИЧ спектъра на вещество има силни ивици при дължини на вълната 5,8 µm и 3,0 µm. Пресметнете вълновите числа. Какви групи може да има веществото?" check={[1724, 3333]} ask={['при 5,8 µm, cm⁻¹', 'при 3,0 µm, cm⁻¹']}>
                <p><Tex>{'\\tilde{\\nu} = \\frac{1}{5{,}8 \\cdot 10^{-4}\\ \\mathrm{cm}} \\approx 1724\\ \\mathrm{cm^{-1}}'}</Tex> – C=O.</p>
                <p><Tex>{'\\tilde{\\nu} = \\frac{1}{3{,}0 \\cdot 10^{-4}\\ \\mathrm{cm}} \\approx 3333\\ \\mathrm{cm^{-1}}'}</Tex> – O–H или N–H.</p>
                <p>Ако ивицата около 3300 е много широка и стига до 2500 cm⁻¹, най-вероятно е карбоксилна киселина.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко сигнала има в ¹H ЯМР спектъра на пропан-1-ол $\mathrm{CH_3CH_2CH_2OH}$ и на пропан-2-ол $\mathrm{(CH_3)_2CHOH}$? Как би ги различил?" check={[4, 3]} ask={['пропан-1-ол', 'пропан-2-ол']}>
                <p>Пропан-1-ол: CH₃, CH₂ до CH₃, CH₂ до OH и OH – 4 вида H.</p>
                <p>Пропан-2-ол: двете CH₃ са еднакви, плюс CH и OH – 3 вида H.</p>
                <p>При пропан-2-ол има голям дублет за 6 H (двете CH₃ до един H), а при пропан-1-ол – триплет за 3 H.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Смес от две оцветени вещества X и Y се мери в кювета 1 cm при две дължини на вълната. При $\lambda_1$: $\varepsilon_X = 1000$, $\varepsilon_Y = 300$; при $\lambda_2$: $\varepsilon_X = 200$, $\varepsilon_Y = 1500$ (в L/(mol·cm)). Измерено е $A_1 = 0{,}32$ и $A_2 = 0{,}64$. Намерете концентрациите в mmol/L (абсорбциите се събират)." check={[0.2, 0.4]} ask={['$c_X$, mmol/L', '$c_Y$, mmol/L']}>
                <p><Tex>{'1000\\,c_X + 300\\,c_Y = 0{,}32'}</Tex>, <Tex>{'200\\,c_X + 1500\\,c_Y = 0{,}64'}</Tex></p>
                <p>Умножаваме първото по 5 и изваждаме второто: <Tex>{'4800\\,c_X = 0{,}96 \\Rightarrow c_X = 2{,}0 \\cdot 10^{-4}\\ \\mathrm{mol/L}'}</Tex>.</p>
                <p><Tex>{'c_Y = \\frac{0{,}32 - 0{,}20}{300} = 4{,}0 \\cdot 10^{-4}\\ \\mathrm{mol/L}'}</Tex>, т.е. 0,2 и 0,4 mmol/L.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Природният хлор е 75,76% ³⁵Cl и 24,24% ³⁷Cl. Пресметнете относителните височини на пиковете на $\mathrm{Cl_2}$ при m/z 72 и 74, ако пикът при 70 е 100%." check={[64.0, 10.2]} ask={['пик 72, %', 'пик 74, %']}>
                <p>Вероятностите: <Tex>{'p_{70} = 0{,}7576^2'}</Tex>, <Tex>{'p_{72} = 2 \\cdot 0{,}7576 \\cdot 0{,}2424'}</Tex>, <Tex>{'p_{74} = 0{,}2424^2'}</Tex>.</p>
                <p><Tex>{'\\frac{p_{72}}{p_{70}} = \\frac{2 \\cdot 0{,}2424}{0{,}7576} \\approx 0{,}640'}</Tex> – 64,0%</p>
                <p><Tex>{'\\frac{p_{74}}{p_{70}} = \\left(\\frac{0{,}2424}{0{,}7576}\\right)^2 \\approx 0{,}102'}</Tex> – 10,2%.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Вещество съдържа C, H и Br. Молекулният йон дава два еднакво високи пика при 122 и 124; пикът при 123 е 3,3% от пика при 122. В ¹H ЯМР има дублет за 6 H при 1,7 ppm и септет за 1 H при 4,2 ppm. Колко C и колко H атома има молекулата? Кое е веществото?" check={[3, 7]} ask={['брой C', 'брой H']}>
                <p>Пикове 1 : 1 на разстояние 2 – един атом Br. Без него: <Tex>{'122 - 79 = 43'}</Tex>.</p>
                <p>M+1 е 3,3% – около <Tex>{'3{,}3 : 1{,}1 = 3'}</Tex> атома C. Тогава H: <Tex>{'43 - 36 = 7'}</Tex>. Формулата е <Tex>{'\\mathrm{C_3H_7Br}'}</Tex>.</p>
                <p>Дублет за 6 H – две еднакви CH₃ до един H; септет (6 + 1 линии) за този H до шест H. Веществото е 2-бромопропан <Tex>{'\\mathrm{(CH_3)_2CHBr}'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Видимата и UV светлина възбуждат електрони, инфрачервената – трептения на връзките, радиовълните (в магнитно поле) – ядрените спинове</li>
              <li>✓ Цветът на разтвора е допълнителен на погълнатия</li>
              <li>✓ <Tex>{'A = -\\lg T = \\varepsilon l c'}</Tex>; концентрацията се отчита по калибровъчна права</li>
              <li>✓ ИЧ: <Tex>{'\\tilde{\\nu} = 1/\\lambda'}</Tex>; O–H около 3300, C–H 2850–3000, C≡N около 2250, C=O около 1700 cm⁻¹</li>
              <li>✓ Масспектър: молекулен йон → M; изотопни групи – Cl 3 : 1, Br 1 : 1; фрагменти M − 15, M − 29…</li>
              <li>✓ ¹H ЯМР: брой сигнали = видове H, площ ∝ брой H, правило n + 1 за разцепването</li>
              <li>✓ Хроматографията разделя сместа, а спектрите определят всяко вещество (GC–MS)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Медицинският ЯМР томограф (MRI) използва точно ядрения магнитен резонанс на водородните атоми във водата и мазнините на тялото. В
              началото методът се е наричал „ЯМР изобразяване“, но думата „ядрен“ постепенно отпада от името – според често разказвана
              история, отчасти за да не плаши пациентите, макар в него да няма нищо <Term id="radioactivity">радиоактивно</Term>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
