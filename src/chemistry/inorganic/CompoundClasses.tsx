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
import ClassSorterLab from './ClassSorterLab';
import ReactionMatrixLab from './ReactionMatrixLab';
import SaltBuilderLab from './SaltBuilderLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
/** Точен отговор с до три знака след запетаята. */
const exact = (v: number) => ({ num: Math.round(v * 1000), den: 1000 });

const NAMED: [string, string][] = [
  ['натриев сулфат', 'Na2SO4'],
  ['калциев хидрогенкарбонат', 'Ca(HCO3)2'],
  ['железен(III) хлорид', 'FeCl3'],
  ['алуминиев нитрат', 'Al(NO3)3'],
  ['амониев сулфат', '(NH4)2SO4'],
  ['калиев дихидрогенфосфат', 'KH2PO4'],
  ['магнезиев хидроксид', 'Mg(OH)2'],
  ['бариев сулфат', 'BaSO4'],
  ['меден(II) нитрат', 'Cu(NO3)2'],
  ['натриев хидрогенсулфат', 'NaHSO4'],
  ['калциев фосфат', 'Ca3(PO4)2'],
  ['железен(II) сулфат', 'FeSO4'],
  ['алуминиев оксид', 'Al2O3'],
  ['серен триоксид', 'SO3'],
  ['калиев карбонат', 'K2CO3'],
  ['железен(III) хидроксид', 'Fe(OH)3'],
];

const ACIDS: [string, number][] = [
  ['HCl', 1],
  ['HNO3', 1],
  ['H2SO4', 2],
  ['H2SO3', 2],
  ['H3PO4', 3],
];

// [основа, сол, моловете сол на мол основа като p/q, уравнение]
const NEUTRALIZATIONS: [string, string, number, number, string][] = [
  ['NaOH', 'NaCl', 1, 1, '\\mathrm{NaOH} + \\mathrm{HCl} \\to \\mathrm{NaCl} + \\mathrm{H_2O}'],
  ['NaOH', 'Na2SO4', 1, 2, '\\mathrm{2NaOH} + \\mathrm{H_2SO_4} \\to \\mathrm{Na_2SO_4} + \\mathrm{2H_2O}'],
  ['KOH', 'KNO3', 1, 1, '\\mathrm{KOH} + \\mathrm{HNO_3} \\to \\mathrm{KNO_3} + \\mathrm{H_2O}'],
  ['Ca(OH)2', 'CaCl2', 1, 1, '\\mathrm{Ca(OH)_2} + \\mathrm{2HCl} \\to \\mathrm{CaCl_2} + \\mathrm{2H_2O}'],
  ['NaOH', 'Na3PO4', 1, 3, '\\mathrm{3NaOH} + \\mathrm{H_3PO_4} \\to \\mathrm{Na_3PO_4} + \\mathrm{3H_2O}'],
];

// [оксид, продукт, мола продукт на мол оксид, уравнение]
const HYDRATIONS: [string, string, number, string][] = [
  ['CaO', 'Ca(OH)2', 1, '\\mathrm{CaO} + \\mathrm{H_2O} \\to \\mathrm{Ca(OH)_2}'],
  ['Na2O', 'NaOH', 2, '\\mathrm{Na_2O} + \\mathrm{H_2O} \\to \\mathrm{2NaOH}'],
  ['SO3', 'H2SO4', 1, '\\mathrm{SO_3} + \\mathrm{H_2O} \\to \\mathrm{H_2SO_4}'],
  ['P2O5', 'H3PO4', 2, '\\mathrm{P_2O_5} + \\mathrm{3H_2O} \\to \\mathrm{2H_3PO_4}'],
  ['K2O', 'KOH', 2, '\\mathrm{K_2O} + \\mathrm{H_2O} \\to \\mathrm{2KOH}'],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0 || kind === 1) {
    const [name, f] = pick(NAMED);
    if (kind === 0) {
      const M = molarMass(f);
      const parts = [...parseFormula(f)].map(([el, n]) => (n === 1 ? dec(atomicMass(el)) : `${n} \\cdot ${dec(atomicMass(el))}`));
      return {
        tex: `\\text{${name}}`,
        ask: 'Каква е моларната маса на веществото (g/mol)?',
        ...exact(M),
        steps: [`Формулата е $${formulaTex(f)}$.`, `$M = ${parts.join(' + ')} = ${dec(M)}\\ \\mathrm{g/mol}$ (атомни маси: ${[...parseFormula(f)].map(([el]) => `${el} – ${dec(atomicMass(el)).replace('{,}', ',')}`).join(', ')})`],
      };
    }
    const counts = [...parseFormula(f)];
    const total = counts.reduce((s, [, n]) => s + n, 0);
    return {
      tex: `\\text{${name}}`,
      ask: 'Колко атома общо има във формулната единица?',
      num: total,
      den: 1,
      steps: [`Формулата е $${formulaTex(f)}$.`, `${counts.map(([el, n]) => `${el}: ${n}`).join(', ')} – общо ${total}.`],
    };
  }
  if (kind === 2) {
    const [acid, basicity] = pick(ACIDS);
    const n = pick([0.1, 0.2, 0.25, 0.5, 1.5]);
    return {
      tex: `n(${formulaTex(acid)}) = ${dec(n)}\\ \\mathrm{mol}`,
      ask: 'Колко мола NaOH са нужни за пълна неутрализация (до нормална сол)?',
      ...exact(n * basicity),
      steps: [
        `Киселината е ${basicity === 1 ? 'едноосновна' : basicity === 2 ? 'двуосновна' : 'триосновна'} – на всеки мол трябват ${basicity} mol NaOH.`,
        `$n(\\mathrm{NaOH}) = ${basicity} \\cdot ${dec(n)} = ${dec(n * basicity)}\\ \\mathrm{mol}$`,
      ],
    };
  }
  if (kind === 3) {
    const [base, salt, p, q, eq] = pick(NEUTRALIZATIONS);
    const nSalt = pick([0.05, 0.1, 0.2, 0.5]);
    const nBase = (nSalt * q) / p;
    const mBase = nBase * molarMass(base);
    const mSalt = nSalt * molarMass(salt);
    return {
      tex: `m(${formulaTex(base)}) = ${dec(mBase)}\\ \\mathrm{g}`,
      ask: `$${eq}$. Колко грама сол се получават (киселината е в излишък)?`,
      ...exact(mSalt),
      steps: [
        `$n(${formulaTex(base)}) = \\frac{${dec(mBase)}}{${dec(molarMass(base))}} = ${dec(nBase)}\\ \\mathrm{mol}$`,
        q === 1 ? `По уравнението солта е също $${dec(nSalt)}\\ \\mathrm{mol}$.` : `По уравнението солта е $${q}$ пъти по-малко: $${dec(nSalt)}\\ \\mathrm{mol}$.`,
        `$m = ${dec(nSalt)} \\cdot ${dec(molarMass(salt))} = ${dec(mSalt)}\\ \\mathrm{g}$`,
      ],
    };
  }
  const [oxide, product, ratio, eq] = pick(HYDRATIONS);
  const n = pick([0.1, 0.2, 0.25, 0.5]);
  const mOx = n * molarMass(oxide);
  const mProd = n * ratio * molarMass(product);
  return {
    tex: `m(${formulaTex(oxide)}) = ${dec(mOx)}\\ \\mathrm{g}`,
    ask: `$${eq}$. Колко грама ${product.includes('OH') ? 'основа' : 'киселина'} се получават?`,
    ...exact(mProd),
    steps: [
      `$n(${formulaTex(oxide)}) = \\frac{${dec(mOx)}}{${dec(molarMass(oxide))}} = ${dec(n)}\\ \\mathrm{mol}$`,
      ratio === 1 ? `По уравнението продуктът е също $${dec(n)}\\ \\mathrm{mol}$.` : `По уравнението от 1 mol оксид се получават ${ratio} mol: $${dec(n * ratio)}\\ \\mathrm{mol}$.`,
      `$m = ${dec(n * ratio)} \\cdot ${dec(molarMass(product))} = ${dec(mProd)}\\ \\mathrm{g}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🍞 Сода за хляба',
    problem: 'При печене содата бикарбонат се разлага: 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂. Колко литра CO₂ (при нормални условия) отделят 8,4 g сода и колко грама натриев карбонат остават в тестото?',
    solution: ['$M(\\mathrm{NaHCO_3}) = 84\\ \\mathrm{g/mol}$, $n = 0{,}1\\ \\mathrm{mol}$', 'По уравнението: $n(\\mathrm{CO_2}) = n(\\mathrm{Na_2CO_3}) = 0{,}05\\ \\mathrm{mol}$', '$V = 0{,}05 \\cdot 22{,}4 = 1{,}12\\ \\mathrm{L}$; $m(\\mathrm{Na_2CO_3}) = 0{,}05 \\cdot 106 = 5{,}3\\ \\mathrm{g}$', 'Остатъкът $\\mathrm{Na_2CO_3}$ дава сапунения вкус, ако содата е много – затова в бакпулвера я смесват с киселина.'],
    answer: '$1{,}12\\ \\mathrm{L}$, $5{,}3\\ \\mathrm{g}$',
    check: [1.12, 5.3],
    ask: ['CO₂, L', 'Na₂CO₃, g'],
  },
  {
    title: '🧱 Гасене на вар',
    problem: 'Строителите гасят негасена вар CaO с вода: CaO + H₂O → Ca(OH)₂. Колко килограма гасена вар се получават от 1 kg CaO и колко килограма вода се свързват химично?',
    solution: ['$n(\\mathrm{CaO}) = \\frac{1000}{56} \\approx 17{,}86\\ \\mathrm{mol}$', '$m(\\mathrm{Ca(OH)_2}) = 17{,}86 \\cdot 74 \\approx 1321\\ \\mathrm{g} \\approx 1{,}32\\ \\mathrm{kg}$', '$m(\\mathrm{H_2O}) = 17{,}86 \\cdot 18 \\approx 321\\ \\mathrm{g} \\approx 0{,}321\\ \\mathrm{kg}$', 'На практика се налива много повече вода – част се изпарява от отделената топлина, а варта се използва като тесто.'],
    answer: '$\\approx 1{,}32\\ \\mathrm{kg}$, $\\approx 0{,}321\\ \\mathrm{kg}$',
    check: [1.32, 0.321],
    ask: ['Ca(OH)₂, kg', 'вода, kg'],
  },
  {
    title: '💊 Таблетка срещу киселини',
    problem: 'Таблетка антиацид съдържа 0,29 g магнезиев хидроксид Mg(OH)₂. Колко грама HCl може да неутрализира тя? Ако приемем, че стомашният сок съдържа HCl с концентрация 0,1 mol/L, на колко милилитра сок отговаря това?',
    solution: ['$\\mathrm{Mg(OH)_2} + \\mathrm{2HCl} \\to \\mathrm{MgCl_2} + \\mathrm{2H_2O}$', '$n(\\mathrm{Mg(OH)_2}) = \\frac{0{,}29}{58} = 0{,}005\\ \\mathrm{mol}$, значи $n(\\mathrm{HCl}) = 0{,}01\\ \\mathrm{mol}$', '$m(\\mathrm{HCl}) = 0{,}01 \\cdot 36{,}5 = 0{,}365\\ \\mathrm{g}$; $V = \\frac{0{,}01}{0{,}1} = 0{,}1\\ \\mathrm{L} = 100\\ \\mathrm{mL}$'],
    answer: '$0{,}365\\ \\mathrm{g}$, $100\\ \\mathrm{mL}$',
    check: [0.365, 100],
    ask: ['HCl, g', 'стомашен сок, mL'],
  },
  {
    title: '🌱 Колко фосфор има в тора',
    problem: 'Съдържанието на фосфор в торовете по традиция се дава като масова част на P₂O₅. Каква е тя за чист калциев дихидрогенфосфат Ca(H₂PO₄)₂ – главната съставка на суперфосфата?',
    solution: ['$M(\\mathrm{Ca(H_2PO_4)_2}) = 40 + 2 \\cdot (2 + 31 + 64) = 234\\ \\mathrm{g/mol}$', 'В един мол има 2 mol P – колкото в 1 mol $\\mathrm{P_2O_5}$ ($142\\ \\mathrm{g}$).', '$w = \\frac{142}{234} \\approx 60{,}7\\%$. Истинският суперфосфат съдържа и гипс, затова на опаковката пише много по-малко – около 16–20%.'],
    answer: '$\\approx 60{,}7\\%$',
    check: [60.7],
    ask: ['P₂O₅, %'],
  },
  {
    title: '🏛️ Киселинен дъжд и мрамор',
    problem: 'Сярната киселина в киселинния дъжд разяжда мраморните статуи: CaCO₃ + H₂SO₄ → CaSO₄ + H₂O + CO₂. Колко грама мрамор се разтварят от 9,8 g H₂SO₄ и колко грама гипс (безводен CaSO₄) се образуват?',
    solution: ['$n(\\mathrm{H_2SO_4}) = \\frac{9{,}8}{98} = 0{,}1\\ \\mathrm{mol}$', '$m(\\mathrm{CaCO_3}) = 0{,}1 \\cdot 100 = 10\\ \\mathrm{g}$, $m(\\mathrm{CaSO_4}) = 0{,}1 \\cdot 136 = 13{,}6\\ \\mathrm{g}$', 'Гипсът е по-рохкав и по-разтворим от мрамора – повърхността на статуята се рони и детайлите изчезват.'],
    answer: '$10\\ \\mathrm{g}$, $13{,}6\\ \\mathrm{g}$',
    check: [10, 13.6],
    ask: ['CaCO₃, g', 'CaSO₄, g'],
  },
  {
    title: '🍇 Син камък за лозето',
    problem: 'За пръскане на лозе трябва 1 kg разтвор с 2% CuSO₄. Колко грама син камък CuSO₄·5H₂O трябва да се разтворят? Каква е масовата част на кристализационната вода в синия камък?',
    solution: ['$m(\\mathrm{CuSO_4}) = 0{,}02 \\cdot 1000 = 20\\ \\mathrm{g}$; $n = \\frac{20}{159{,}5} \\approx 0{,}1254\\ \\mathrm{mol}$', '$M(\\mathrm{CuSO_4 \\cdot 5H_2O}) = 249{,}5\\ \\mathrm{g/mol}$, $m = 0{,}1254 \\cdot 249{,}5 \\approx 31{,}3\\ \\mathrm{g}$', '$w(\\mathrm{H_2O}) = \\frac{5 \\cdot 18}{249{,}5} \\approx 36{,}1\\%$ – повече от една трета от синия камък е вода.'],
    answer: '$\\approx 31{,}3\\ \\mathrm{g}$, $\\approx 36{,}1\\%$',
    check: [31.3, 36.1],
    ask: ['син камък, g', 'вода, %'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой от тези оксиди е киселинен?',
    answers: ['$\\mathrm{SO_3}$', '$\\mathrm{CaO}$', '$\\mathrm{Na_2O}$', '$\\mathrm{MgO}$'],
    correctAnswer: '$\\mathrm{SO_3}$',
  },
  {
    question: 'Как се казва $\\mathrm{NaHCO_3}$?',
    answers: ['натриев хидрогенкарбонат', 'натриев карбонат', 'натриев хидроксид', 'натриев хидрогенсулфат'],
    correctAnswer: 'натриев хидрогенкарбонат',
  },
  {
    question: 'Колко основна е фосфорната киселина $\\mathrm{H_3PO_4}$?',
    answers: ['триосновна', 'едноосновна', 'двуосновна', 'четириосновна'],
    correctAnswer: 'триосновна',
  },
  {
    question: 'Кой хидроксид е амфотерен?',
    answers: ['$\\mathrm{Zn(OH)_2}$', '$\\mathrm{NaOH}$', '$\\mathrm{Ca(OH)_2}$', '$\\mathrm{KOH}$'],
    correctAnswer: '$\\mathrm{Zn(OH)_2}$',
  },
  {
    question: 'Какво се получава, когато въглероден диоксид се пропуска през варна вода $\\mathrm{Ca(OH)_2}$?',
    answers: ['$\\mathrm{CaCO_3} + \\mathrm{H_2O}$', '$\\mathrm{CaO} + \\mathrm{H_2CO_3}$', '$\\mathrm{Ca} + \\mathrm{H_2O} + \\mathrm{CO}$', '$\\mathrm{CaC_2} + \\mathrm{H_2O}$'],
    correctAnswer: '$\\mathrm{CaCO_3} + \\mathrm{H_2O}$',
  },
  {
    question: 'Кое от тези вещества НЕ реагира със солна киселина?',
    answers: ['$\\mathrm{CO_2}$', '$\\mathrm{CaO}$', '$\\mathrm{NaOH}$', '$\\mathrm{Na_2CO_3}$'],
    correctAnswer: '$\\mathrm{CO_2}$',
  },
  {
    question: 'Анхидридът на сярната киселина $\\mathrm{H_2SO_4}$ е:',
    answers: ['$\\mathrm{SO_3}$', '$\\mathrm{SO_2}$', '$\\mathrm{H_2S}$', '$\\mathrm{S}$'],
    correctAnswer: '$\\mathrm{SO_3}$',
  },
  {
    question: 'Малахитът $\\mathrm{Cu_2(OH)_2CO_3}$ е:',
    answers: ['основна сол', 'кисела сол', 'основа', 'двойна сол'],
    correctAnswer: 'основна сол',
  },
  {
    question: 'Каква е формулата на железен(III) сулфат?',
    answers: ['$\\mathrm{Fe_2(SO_4)_3}$', '$\\mathrm{FeSO_4}$', '$\\mathrm{Fe_3(SO_4)_2}$', '$\\mathrm{Fe_2SO_4}$'],
    correctAnswer: '$\\mathrm{Fe_2(SO_4)_3}$',
  },
];

// ---------- Страница ----------

const ACID_TABLE: [string, string, string, string][] = [
  ['HCl', 'солна (хлороводородна)', 'Cl', 'хлорид'],
  ['H_2S', 'сероводородна', 'S', 'сулфид'],
  ['HNO_3', 'азотна', 'NO_3', 'нитрат'],
  ['HNO_2', 'азотиста', 'NO_2', 'нитрит'],
  ['H_2SO_4', 'сярна', 'SO_4', 'сулфат'],
  ['H_2SO_3', 'сериста', 'SO_3', 'сулфит'],
  ['H_2CO_3', 'въглена', 'CO_3', 'карбонат'],
  ['H_2SiO_3', 'силициева', 'SiO_3', 'силикат'],
  ['H_3PO_4', 'фосфорна', 'PO_4', 'фосфат'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function CompoundClasses() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Класове неорганични съединения</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧪 Лавоазие бил толкова сигурен, че всяка <Term id="acid">киселина</Term> съдържа кислород, че кръстил елемента „оксиген“ – на гръцки „раждащ
            киселини“. Името остава и до днес, но идеята не издържа. През 1810 г. Хъмфри Дейви показва, че в солната киселина няма
            кислород, а жълто-зеленият газ, който Шееле получава от нея още през 1774 г., е нов елемент – хлорът. Химиците разбират, че киселината се определя от водорода, който може да се
            замести с метал, а не от кислорода. Оттам тръгва подредбата на неорганичните вещества в четири големи класа: <strong>оксиди,
            основи, киселини и соли</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Четирите класа</h2>
          <p className={text}>
            Сложните неорганични вещества се разпознават по формулата. Повечето от тях попадат в един от четирите класа – и всеки клас има
            свои типични реакции. Затова, щом познаем класа, можем да предскажем как ще се държи веществото.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Клас</th>
                  <th className={th}>Състав</th>
                  <th className={th}>Примери</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>оксиди</td>
                  <td className={td}>два елемента, единият е кислород (със <Term id="oxidation-state">степен на окисление</Term> −2)</td>
                  <td className={td}><Tex>{'\\mathrm{CaO,\\ CO_2,\\ Fe_2O_3}'}</Tex></td>
                </tr>
                <tr>
                  <td className={td}>основи</td>
                  <td className={td}>метал и хидроксидни групи OH</td>
                  <td className={td}><Tex>{'\\mathrm{NaOH,\\ Ca(OH)_2,\\ Fe(OH)_3}'}</Tex></td>
                </tr>
                <tr>
                  <td className={td}>киселини</td>
                  <td className={td}>водород, който може да се замести с метал, и киселинен остатък</td>
                  <td className={td}><Tex>{'\\mathrm{HCl,\\ H_2SO_4,\\ H_3PO_4}'}</Tex></td>
                </tr>
                <tr>
                  <td className={td}>соли</td>
                  <td className={td}>метал (или <Tex>{'\\mathrm{NH_4^+}'}</Tex>) и киселинен остатък</td>
                  <td className={td}><Tex>{'\\mathrm{NaCl,\\ CaCO_3,\\ CuSO_4}'}</Tex></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={text}>
            Как точно се държат киселините и основите във вода – дисоциация, <Term id="ph">pH</Term>, силни и слаби – разгледахме в урока{' '}
            <Link to="/chemistry/reactions/acids-bases" className={link}>
              Киселини, основи и pH
            </Link>
            . Тук ни интересуват съставът, имената и реакциите между класовете. Опитай да подредиш веществата:
          </p>
          <ClassSorterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Оксиди</h2>
          <Theorem
            type="definition"
            title="Оксид"
            description="Оксидите са съединения на елемент с кислород, в които кислородът има степен на окисление $-2$. Името се образува от прилагателното на елемента + „оксид“, а при няколко възможни валентности – с римска цифра или с гръцки представки: $\mathrm{FeO}$ – железен(II) оксид, $\mathrm{Fe_2O_3}$ – железен(III) оксид, $\mathrm{CO}$ – въглероден оксид, $\mathrm{CO_2}$ – въглероден диоксид, $\mathrm{SO_3}$ – серен триоксид."
          />
          <p className={text}>Според това с какво реагират, оксидите са четири вида:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              <strong>основни</strong> – обикновено оксидите на металите със степен на окисление +1 и +2: <Tex>{'\\mathrm{Na_2O,\\ CaO,\\ CuO}'}</Tex>. Реагират с киселини; на
              алкалните и <Term id="alkaline-earth-metals">алкалоземните метали</Term> – и с вода, като дават основа;
            </li>
            <li>
              <strong>киселинни</strong> – оксидите на <Term id="nonmetals">неметалите</Term> и на металите с висока степен на окисление: <Tex>{'\\mathrm{CO_2,\\ SO_3,\\ P_2O_5,\\ Mn_2O_7}'}</Tex>. Реагират с основи,
              а повечето – и с вода, като дават киселина. Затова се наричат още <strong>анхидриди</strong> („без вода“) на съответните
              киселини;
            </li>
            <li>
              <strong>амфотерни</strong> – реагират и с киселини, и с основи: <Tex>{'\\mathrm{ZnO,\\ Al_2O_3}'}</Tex>, <Tex>{'\\mathrm{Cr_2O_3}'}</Tex>;
            </li>
            <li>
              <strong>несолеобразуващи (неутрални)</strong> – не дават соли: <Tex>{'\\mathrm{CO,\\ NO,\\ N_2O}'}</Tex>.
            </li>
          </ul>
          <Example
            description="Напишете уравненията на реакциите на калциев оксид със солна киселина и на серен триоксид с натриева основа."
            steps={[
              'Основен оксид + киселина → сол + вода: $\\mathrm{CaO} + \\mathrm{2HCl} \\to \\mathrm{CaCl_2} + \\mathrm{H_2O}$',
              'Киселинен оксид + основа → сол + вода: $\\mathrm{SO_3} + \\mathrm{2NaOH} \\to \\mathrm{Na_2SO_4} + \\mathrm{H_2O}$',
              'Солта съдържа метала от основния оксид (или основата) и киселинния остатък, който отговаря на киселинния оксид: $\\mathrm{SO_3} \\to \\mathrm{H_2SO_4} \\to \\mathrm{SO_4^{2-}}$.',
            ]}
          />
          <p className={text}>
            Как да намерим анхидрида на киселина? Изваждаме от формулата ѝ вода: <Tex>{'\\mathrm{H_2SO_4 - H_2O = SO_3}'}</Tex>,{' '}
            <Tex>{'\\mathrm{H_2CO_3 - H_2O = CO_2}'}</Tex>. При нечетен брой водородни атоми удвояваме:{' '}
            <Tex>{'\\mathrm{2H_3PO_4 - 3H_2O = P_2O_5}'}</Tex>, <Tex>{'\\mathrm{2HNO_3 - H_2O = N_2O_5}'}</Tex>. Степента на окисление на
            неметала в киселината и в анхидрида е една и съща.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Основи</h2>
          <Theorem
            type="definition"
            title="Основа"
            description="Основите са съединения на метал с една или повече хидроксидни групи $\mathrm{OH}$. Броят на групите е равен на заряда на металния йон: $\mathrm{NaOH}$, $\mathrm{Ca(OH)_2}$, $\mathrm{Fe(OH)_3}$. Името е прилагателното на метала + „хидроксид“: калциев хидроксид, железен(III) хидроксид."
          />
          <p className={text}>
            Разтворимите във вода основи се наричат <strong>алкални основи</strong> (хидроксидите на <Term id="alkali-metals">алкалните метали</Term> и на
            калция, стронция и бария – <Tex>{'\\mathrm{NaOH,\\ KOH,\\ Ca(OH)_2,\\ Ba(OH)_2}'}</Tex>). Те са разяждащи – натриевата основа се
            нарича и сода каустик. Повечето други основи са <strong>неразтворими</strong>: синият <Tex>{'\\mathrm{Cu(OH)_2}'}</Tex>,
            кафявият <Tex>{'\\mathrm{Fe(OH)_3}'}</Tex>, белият <Tex>{'\\mathrm{Mg(OH)_2}'}</Tex>.
          </p>
          <Theorem
            title="Типични реакции на основите"
            description="1) с киселини – неутрализация: основа + киселина → сол + вода; 2) алкалните основи – с киселинни оксиди: $\mathrm{2NaOH} + \mathrm{CO_2} \to \mathrm{Na_2CO_3} + \mathrm{H_2O}$; 3) алкалните основи – със соли, ако се получава утайка: $\mathrm{2NaOH} + \mathrm{CuSO_4} \to \mathrm{Cu(OH)_2\downarrow} + \mathrm{Na_2SO_4}$; 4) неразтворимите основи се разлагат при нагряване: $\mathrm{Cu(OH)_2 \xrightarrow{t} CuO} + \mathrm{H_2O}$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Киселини</h2>
          <Theorem
            type="definition"
            title="Киселина"
            description="Киселините са съединения на водород с киселинен остатък; водородните атоми могат да се заместят с метал. Според броя на тези атоми киселините са едноосновни ($\mathrm{HCl}$, $\mathrm{HNO_3}$), двуосновни ($\mathrm{H_2SO_4}$, $\mathrm{H_2CO_3}$) и триосновни ($\mathrm{H_3PO_4}$). Според състава на остатъка са безкислородни ($\mathrm{HCl}$, $\mathrm{H_2S}$) и кислородни ($\mathrm{H_2SO_4}$, $\mathrm{HNO_3}$)."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Киселина</th>
                  <th className={th}>Име</th>
                  <th className={th}>Остатък</th>
                  <th className={th}>Име на солта</th>
                </tr>
              </thead>
              <tbody>
                {ACID_TABLE.map(([f, name, r, salt]) => (
                  <tr key={f}>
                    <td className={td}>
                      <Tex>{`\\mathrm{${f}}`}</Tex>
                    </td>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{`\\mathrm{${r}}`}</Tex>
                    </td>
                    <td className={td}>{salt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Забележи правилото: кислородната киселина с по-висока степен на окисление на неметала дава соли с наставка <strong>-ат</strong>{' '}
            (сулфат, нитрат), с по-ниска – с <strong>-ит</strong> (сулфит, нитрит), а безкислородната – с <strong>-ид</strong> (хлорид,
            сулфид).
          </p>
          <Theorem
            title="Типични реакции на киселините"
            description="1) с основи и основни оксиди → сол + вода; 2) с метали, които стоят преди водорода в реда на активност → сол + водород: $\mathrm{Zn} + \mathrm{2HCl} \to \mathrm{ZnCl_2} + \mathrm{H_2\uparrow}$ (азотната и концентрираната сярна киселина реагират по друг начин); 3) със соли на по-слаби или летливи киселини: $\mathrm{CaCO_3} + \mathrm{2HCl} \to \mathrm{CaCl_2} + \mathrm{H_2O} + \mathrm{CO_2\uparrow}$."
          />
          <p className={text}>
            Защо едни метали изместват водорода, а други не, обяснява <Term id="activity-series">редът на активност</Term> в урока{' '}
            <Link to="/chemistry/reactions/redox" className={link}>
              Окисление-редукция и електрохимия
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Соли</h2>
          <Theorem
            type="definition"
            title="Сол"
            description="Солите са съединения на метал (или амониев йон $\mathrm{NH_4^+}$) с киселинен остатък. Името е прилагателното на метала + името на остатъка: $\mathrm{Na_2SO_4}$ – натриев сулфат, $\mathrm{FeCl_3}$ – железен(III) хлорид, $\mathrm{(NH_4)_2CO_3}$ – амониев карбонат. Индексите се подбират така, че сборът от зарядите да е нула."
          />
          <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              <strong>нормални соли</strong> – всички водородни атоми на киселината са заместени: <Tex>{'\\mathrm{Na_2CO_3,\\ Ca_3(PO_4)_2}'}</Tex>;
            </li>
            <li>
              <strong>кисели соли</strong> – заместена е само част от водорода; в името има „хидроген“: <Tex>{'\\mathrm{NaHCO_3}'}</Tex> – натриев
              хидрогенкарбонат, <Tex>{'\\mathrm{Ca(H_2PO_4)_2}'}</Tex> – калциев дихидрогенфосфат. Получават се само от многоосновни
              киселини;
            </li>
            <li>
              <strong>основни соли</strong> – освен остатъка съдържат и OH групи: <Tex>{'\\mathrm{Cu_2(OH)_2CO_3}'}</Tex> – основен
              меден(II) карбонат (малахит);
            </li>
            <li>
              <strong>двойни соли</strong> – с два различни <Term id="cation">катиона</Term>: <Tex>{'\\mathrm{KAl(SO_4)_2 \\cdot 12H_2O}'}</Tex> – стипца;
            </li>
            <li>
              много соли кристализират с вода – това са <Term id="crystal-hydrate">кристалохидратите</Term>, например синият камък{' '}
              <Tex>{'\\mathrm{CuSO_4 \\cdot 5H_2O}'}</Tex>.
            </li>
          </ul>
          <Example
            description="Каква сол се получава, когато 1 mol фосфорна киселина реагира с 2 mol натриева основа?"
            steps={[
              'На всяка молекула $\\mathrm{H_3PO_4}$ се падат 2 молекули $\\mathrm{NaOH}$ – заместват се 2 от 3-те водородни атома.',
              'Остава анионът $\\mathrm{HPO_4^{2-}}$; с два йона $\\mathrm{Na^+}$ зарядите се изравняват.',
              '$\\mathrm{H_3PO_4} + \\mathrm{2NaOH} \\to \\mathrm{Na_2HPO_4} + \\mathrm{2H_2O}$ – натриев хидрогенфосфат, кисела сол.',
            ]}
          />
          <SaltBuilderLab />
          <Theorem
            title="Типични реакции на солите"
            description="1) с метали – по-активният метал измества по-малко активния от разтвора на солта: $\mathrm{Fe} + \mathrm{CuSO_4} \to \mathrm{FeSO_4} + \mathrm{Cu}$; 2) с киселини; 3) с алкални основи; 4) с други соли. Реакциите 2–4 в разтвор протичат докрай, само ако се получава утайка, газ или слабо дисоциирано вещество (например вода): $\mathrm{BaCl_2} + \mathrm{Na_2SO_4} \to \mathrm{BaSO_4\downarrow} + \mathrm{2NaCl}$."
          />
          <p className={text}>
            Кои соли са разтворими и как се записват тези реакции с <Term id="ion">йони</Term>, ще видим в урока{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Амфотерност</h2>
          <p className={text}>
            Някои оксиди и хидроксиди не са нито чисто основни, нито чисто киселинни – реагират и с киселини, и с алкални основи. Най-известни
            са съединенията на цинка и алуминия. Белият пихтиест <Tex>{'\\mathrm{Al(OH)_3}'}</Tex> се разтваря и в солна киселина, и в
            натриева основа.
          </p>
          <Theorem
            title="Амфотерни хидроксиди"
            description="С киселина се държат като основа: $\mathrm{Zn(OH)_2} + \mathrm{2HCl} \to \mathrm{ZnCl_2} + \mathrm{2H_2O}$. С алкална основа – като киселина; във воден разтвор се образуват хидроксокомплекси: $\mathrm{Zn(OH)_2} + \mathrm{2NaOH} \to \mathrm{Na_2[Zn(OH)_4]}$, $\mathrm{Al(OH)_3} + \mathrm{NaOH} \to \mathrm{Na[Al(OH)_4]}$. При стопяване със сухи основи се получават цинкати и алуминати, например $\mathrm{Na_2ZnO_2}$."
          />
          <Example
            description="Към разтвор на алуминиев хлорид капе натриева основа. Какво се наблюдава?"
            steps={[
              'Първо пада бяла утайка: $\\mathrm{AlCl_3} + \\mathrm{3NaOH} \\to \\mathrm{Al(OH)_3\\downarrow} + \\mathrm{3NaCl}$',
              'При излишък на основа утайката се разтваря: $\\mathrm{Al(OH)_3} + \\mathrm{NaOH} \\to \\mathrm{Na[Al(OH)_4]}$',
              'Така алуминиевите соли се различават от магнезиевите – $\\mathrm{Mg(OH)_2}$ не се разтваря в излишък на основа.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Генетична връзка между класовете</h2>
          <p className={text}>
            Класовете не са отделни „кутии“ – от едно вещество можем да стигнем до друго. Веригата започва от <Term id="simple-substance">просто вещество</Term> и води до сол:
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3 text-center space-y-2">
            <MathText>{'метал → основен оксид → основа → сол: $\\mathrm{Ca} \\to \\mathrm{CaO} \\to \\mathrm{Ca(OH)_2} \\to \\mathrm{CaCO_3}$'}</MathText>
            <br />
            <MathText>{'неметал → киселинен оксид → киселина → сол: $\\mathrm{P} \\to \\mathrm{P_2O_5} \\to \\mathrm{H_3PO_4} \\to \\mathrm{Na_3PO_4}$'}</MathText>
          </div>
          <Example
            description="Напишете уравненията за веригата $\mathrm{S} \to \mathrm{SO_2} \to \mathrm{SO_3} \to \mathrm{H_2SO_4} \to \mathrm{BaSO_4}$."
            steps={[
              '$\\mathrm{S} + \\mathrm{O_2} \\to \\mathrm{SO_2}$',
              '$\\mathrm{2SO_2} + \\mathrm{O_2} \\rightleftharpoons \\mathrm{2SO_3}$ (с катализатор, при нагряване)',
              '$\\mathrm{SO_3} + \\mathrm{H_2O} \\to \\mathrm{H_2SO_4}$',
              '$\\mathrm{H_2SO_4} + \\mathrm{BaCl_2} \\to \\mathrm{BaSO_4\\downarrow} + \\mathrm{2HCl}$',
            ]}
          />
          <p className={text}>
            Двете вериги се срещат в солта: тя съдържа метала от първата и киселинния остатък от втората. Затова сол се получава по много
            начини – метал + неметал, основен + киселинен оксид, основа + киселина, метал + киселина и т.н. Провери в таблицата кое с кое
            реагира:
          </p>
          <ReactionMatrixLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 8. Тренажор
          </h2>
          <p className={text}>
            <Term id="molar-mass">Моларна маса</Term> и брой атоми по името на веществото, молове основа за <Term id="neutralization">неутрализация</Term>, маса на солта и на продукта от оксид и вода.
            Десетичните отговори въвеждай като 5,85.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Класовете около нас</h2>
          <p className={text}>Сода, вар, антиациди, торове, мрамор и син камък – всичко това са оксиди, основи, киселини и соли.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Всеки водород е киселинен', '$\\mathrm{CH_4}$ е киселина, защото има водород.', 'Киселина е вещество, в което водородът може да се замести с метал; в $\\mathrm{CH_4}$ не може.'],
              ['Основност на киселината', '$\\mathrm{H_3PO_4}$ е едноосновна, защото е една молекула.', 'Основността е броят на заместимите водородни атоми – $\\mathrm{H_3PO_4}$ е триосновна.'],
              ['Индексите на солта', 'Железен(III) сулфат е $\\mathrm{FeSO_4}$.', '$\\mathrm{Fe^{3+}}$ и $\\mathrm{SO_4^{2-}}$: $2 \\cdot 3 = 3 \\cdot 2$, значи $\\mathrm{Fe_2(SO_4)_3}$.'],
              ['Скобите', '$\\mathrm{CaOH_2}$', '$\\mathrm{Ca(OH)_2}$ – двете OH групи се записват в скоби.'],
              ['Всеки оксид с вода', '$\\mathrm{CuO} + \\mathrm{H_2O} \\to \\mathrm{Cu(OH)_2}$', 'С вода реагират само оксидите на алкалните и алкалоземните метали; $\\mathrm{Cu(OH)_2}$ се получава от сол и алкална основа.'],
              ['Сол + сол винаги реагират', '$\\mathrm{NaCl} + \\mathrm{KNO_3} \\to \\mathrm{NaNO_3} + \\mathrm{KCl}$', 'В разтвор всички йони остават свободни – няма утайка, газ или вода, значи няма реакция.'],
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
              <Task id="a1" number={1} color="border-green-500" question="Напишете формулата на алуминиев сулфат и пресметнете моларната му маса." check={[342]} ask={['$M$, g/mol']}>
                <p><Tex>{'\\mathrm{Al^{3+}}'}</Tex> и <Tex>{'\\mathrm{SO_4^{2-}}'}</Tex>: НОК на 3 и 2 е 6, значи <Tex>{'\\mathrm{Al_2(SO_4)_3}'}</Tex>.</p>
                <p><Tex>{'M = 2 \\cdot 27 + 3 \\cdot (32 + 4 \\cdot 16) = 54 + 288 = 342\\ \\mathrm{g/mol}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко грама натриева основа са нужни за пълната неутрализация на 9,8 g сярна киселина? Колко грама сол се получават?" check={[8, 14.2]} ask={['NaOH, g', 'сол, g']}>
                <p><Tex>{'\\mathrm{H_2SO_4} + \\mathrm{2NaOH} \\to \\mathrm{Na_2SO_4} + \\mathrm{2H_2O}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{H_2SO_4}) = \\frac{9{,}8}{98} = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{NaOH}) = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}2 \\cdot 40 = 8\\ \\mathrm{g}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Na_2SO_4}) = 0{,}1 \\cdot 142 = 14{,}2\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко грама калциев хидроксид се получават при гасенето на 11,2 g калциев оксид?" check={[14.8]} ask={['$\\mathrm{Ca(OH)_2}$, g']}>
                <p><Tex>{'\\mathrm{CaO} + \\mathrm{H_2O} \\to \\mathrm{Ca(OH)_2}'}</Tex></p>
                <p><Tex>{'n = \\frac{11{,}2}{56} = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}2 \\cdot 74 = 14{,}8\\ \\mathrm{g}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Разтвор, съдържащ 9,8 g фосфорна киселина, реагира с разтвор на 8 g натриева основа. Коя сол се получава и каква е масата ѝ?" check={[14.2]} ask={['сол, g']}>
                <p><Tex>{'n(\\mathrm{H_3PO_4}) = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{NaOH}) = \\frac{8}{40} = 0{,}2\\ \\mathrm{mol}'}</Tex> – отношение 1 : 2.</p>
                <p>Заместват се два водородни атома: <Tex>{'\\mathrm{H_3PO_4} + \\mathrm{2NaOH} \\to \\mathrm{Na_2HPO_4} + \\mathrm{2H_2O}'}</Tex> – натриев хидрогенфосфат.</p>
                <p><Tex>{'m = 0{,}1 \\cdot 142 = 14{,}2\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Цинковият хидроксид е амфотерен. Колко грама NaOH са нужни, за да се разтворят 9,9 g $\mathrm{Zn(OH)_2}$ (до $\mathrm{Na_2[Zn(OH)_4]}$), и колко грама HCl – за същото количество?" check={[8, 7.3]} ask={['NaOH, g', 'HCl, g']}>
                <p><Tex>{'n(\\mathrm{Zn(OH)_2}) = \\frac{9{,}9}{99} = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'\\mathrm{Zn(OH)_2} + \\mathrm{2NaOH} \\to \\mathrm{Na_2[Zn(OH)_4]}'}</Tex>: <Tex>{'0{,}2 \\cdot 40 = 8\\ \\mathrm{g}'}</Tex></p>
                <p><Tex>{'\\mathrm{Zn(OH)_2} + \\mathrm{2HCl} \\to \\mathrm{ZnCl_2} + \\mathrm{2H_2O}'}</Tex>: <Tex>{'0{,}2 \\cdot 36{,}5 = 7{,}3\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Калцият се превръща по веригата $\mathrm{Ca} \to \mathrm{CaO} \to \mathrm{Ca(OH)_2} \to \mathrm{CaCO_3}$. Колко грама калциев карбонат се получават от 4 g калций, ако всяка реакция протича напълно?" check={[10]} ask={['$\\mathrm{CaCO_3}$, g']}>
                <p><Tex>{'\\mathrm{2Ca} + \\mathrm{O_2} \\to \\mathrm{2CaO}'}</Tex>, <Tex>{'\\mathrm{CaO} + \\mathrm{H_2O} \\to \\mathrm{Ca(OH)_2}'}</Tex>, <Tex>{'\\mathrm{Ca(OH)_2} + \\mathrm{CO_2} \\to \\mathrm{CaCO_3} + \\mathrm{H_2O}'}</Tex></p>
                <p>Калциевите атоми се запазват: <Tex>{'n(\\mathrm{CaCO_3}) = n(\\mathrm{Ca}) = \\frac{4}{40} = 0{,}1\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'m = 0{,}1 \\cdot 100 = 10\\ \\mathrm{g}'}</Tex> – не е нужно да смятаме междинните вещества.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="През разтвор, съдържащ 12 g NaOH, се пропускат 4,48 L $\mathrm{CO_2}$ (н.у.). Кои соли се получават и какви са масите им?" check={[10.6, 8.4]} ask={['$\\mathrm{Na_2CO_3}$, g', '$\\mathrm{NaHCO_3}$, g']}>
                <p><Tex>{'n(\\mathrm{NaOH}) = 0{,}3\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{CO_2}) = 0{,}2\\ \\mathrm{mol}'}</Tex>. Отношението 1,5 : 1 е между 2 : 1 (нормална сол) и 1 : 1 (кисела сол) – получават се и двете.</p>
                <p>Нека <Tex>{'x'}</Tex> mol <Tex>{'\\mathrm{Na_2CO_3}'}</Tex> и <Tex>{'y'}</Tex> mol <Tex>{'\\mathrm{NaHCO_3}'}</Tex>. По въглерода: <Tex>{'x + y = 0{,}2'}</Tex>; по натрия: <Tex>{'2x + y = 0{,}3'}</Tex>.</p>
                <p><Tex>{'x = 0{,}1,\\ y = 0{,}1'}</Tex>: <Tex>{'m(\\mathrm{Na_2CO_3}) = 10{,}6\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\mathrm{NaHCO_3}) = 8{,}4\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="При нагряване малахитът се разлага: $\mathrm{Cu_2(OH)_2CO_3} \to \mathrm{2CuO} + \mathrm{H_2O} + \mathrm{CO_2}$. Колко грама меден(II) оксид остават от 22,1 g малахит и с колко грама намалява масата?" check={[15.9, 6.2]} ask={['CuO, g', 'загуба на маса, g']}>
                <p><Tex>{'M = 2 \\cdot 63{,}5 + 2 \\cdot 17 + 60 = 221\\ \\mathrm{g/mol}'}</Tex>, <Tex>{'n = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{CuO}) = 0{,}2 \\cdot 79{,}5 = 15{,}9\\ \\mathrm{g}'}</Tex></p>
                <p>Отделят се вода и <Tex>{'\\mathrm{CO_2}'}</Tex>: <Tex>{'0{,}1 \\cdot (18 + 44) = 6{,}2\\ \\mathrm{g}'}</Tex> – проверка: <Tex>{'15{,}9 + 6{,}2 = 22{,}1'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При нагряване на 28,7 g кристалохидрат на цинков сулфат $\mathrm{ZnSO_4 \cdot xH_2O}$ се отделят 12,6 g вода. Намерете $x$." check={[7]} ask={['$x$']}>
                <p>Безводна сол: <Tex>{'28{,}7 - 12{,}6 = 16{,}1\\ \\mathrm{g}'}</Tex>; <Tex>{'n(\\mathrm{ZnSO_4}) = \\frac{16{,}1}{161} = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{H_2O}) = \\frac{12{,}6}{18} = 0{,}7\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'x = \\frac{0{,}7}{0{,}1} = 7'}</Tex> – това е цинковият витриол <Tex>{'\\mathrm{ZnSO_4 \\cdot 7H_2O}'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Четири класа: оксиди (елемент + O), основи (метал + OH), киселини (H + киселинен остатък), соли (метал + киселинен остатък)</li>
              <li>✓ Оксидите са основни, киселинни (анхидриди), амфотерни и несолеобразуващи</li>
              <li>✓ Основите са алкални (разтворими) и неразтворими; неразтворимите се разлагат при нагряване до оксид и вода</li>
              <li>✓ Киселините са безкислородни и кислородни, едно-, дву- и триосновни; солите им са -иди, -ати и -ити</li>
              <li>✓ Соли: нормални, кисели („хидроген“ в името), основни (с OH групи), двойни; много от тях са кристалохидрати</li>
              <li>✓ Амфотерните <Tex>{'\\mathrm{Zn(OH)_2}'}</Tex> и <Tex>{'\\mathrm{Al(OH)_3}'}</Tex> реагират и с киселини, и с основи</li>
              <li>✓ Реагират вещества с противоположен характер; в <Term id="solution">разтвор</Term> обменните реакции вървят докрай при <Term id="precipitate">утайка</Term>, газ или вода</li>
              <li>✓ Генетична връзка: метал → основен оксид → основа → сол ← киселина ← киселинен оксид ← неметал</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Емайлът на зъбите е почти изцяло от сол – хидроксиапатит <Tex>{'\\mathrm{Ca_5(PO_4)_3OH}'}</Tex>, основен калциев фосфат.
              Киселините от <Term id="bacterium">бактериите</Term> в устата реагират с хидроксидните групи и бавно го разтварят. Флуоридът в пастата за зъби може да
              замести част от OH групите и се смята, че така получената сол е по-устойчива на киселини – затова пастите с флуор
              намаляват кариеса.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
