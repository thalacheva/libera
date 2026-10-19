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
import AlcoholOxidationLab from './AlcoholOxidationLab';
import EsterLab from './EsterLab';
import FunctionalGroupLab from './FunctionalGroupLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const M = (smiles: string) => molarMass(molecularFormula(smiles));
const fTex = (smiles: string) => formulaTex(molecularFormula(smiles));

const NAMED: [string, string][] = [
  ['метанол', 'CO'],
  ['етанол', 'CCO'],
  ['пропан-1-ол', 'CCCO'],
  ['глицерол', 'OCC(O)CO'],
  ['фенол', 'Oc1ccccc1'],
  ['етанал', 'CC=O'],
  ['пропанон', 'CC(=O)C'],
  ['етанова киселина', 'CC(=O)O'],
  ['бутанова киселина', 'CCCC(=O)O'],
  ['етилов етаноат', 'CC(=O)OCC'],
  ['метиламин', 'CN'],
  ['хлорометан', 'CCl'],
];
const ALCOHOLS: [string, string, number][] = [
  ['метанол', 'CH3OH', 1],
  ['етанол', 'C2H5OH', 2],
  ['пропанол', 'C3H7OH', 3],
  ['бутанол', 'C4H9OH', 4],
];
const ESTERS: [string, string, string, string][] = [
  ['етанова киселина', 'CC(=O)O', 'етилов етаноат', 'CC(=O)OCC'],
  ['етанова киселина', 'CC(=O)O', 'метилов етаноат', 'CC(=O)OC'],
  ['бутанова киселина', 'CCCC(=O)O', 'етилов бутаноат', 'CCCC(=O)OCC'],
  ['метанова киселина', 'OC=O', 'етилов метаноат', 'C(=O)OCC'],
];
const ALDEHYDES: [string, string][] = [
  ['етанал', 'CC=O'],
  ['пропанал', 'CCC=O'],
  ['бутанал', 'CCCC=O'],
];
const POLYOLS: [string, string, number][] = [
  ['етанол', 'C2H5OH', 1],
  ['етан-1,2-диол (етиленгликол)', 'C2H4(OH)2', 2],
  ['глицерол', 'C3H5(OH)3', 3],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const [name, s] = pick(NAMED);
    const m = M(s);
    return {
      tex: `\\text{${name}}`,
      ask: 'Каква е моларната маса на веществото в g/mol?',
      num: Math.round(m * 10),
      den: 10,
      steps: [`Молекулната формула е $${fTex(s)}$.`, `$M = ${dec(m)}\\ \\mathrm{g/mol}$`],
    };
  }
  if (kind === 1) {
    const [name, f, k] = pick(ALCOHOLS);
    const n100 = pick([10, 20, 25, 50]);
    const n = n100 / 100;
    return {
      tex: `n(${formulaTex(f)}) = ${dec(n)}\\ \\mathrm{mol}`,
      ask: `Колко литра CO₂ (н.у.) се получават при пълното изгаряне на ${name}?`,
      num: n100 * k * 224,
      den: 1000,
      steps: [`Всеки мол ${name} съдържа ${k} mol въглеродни атоми, значи дава ${k} mol CO₂: $n(\\mathrm{CO_2}) = ${dec(n * k)}\\ \\mathrm{mol}$`, `$V = ${dec(n * k)} \\cdot 22{,}4 = ${dec((n100 * k * 224) / 1000)}\\ \\mathrm{L}$`],
    };
  }
  if (kind === 2) {
    const [acid, sa, ester, se] = pick(ESTERS);
    const n2 = pick([1, 2, 4]); // n = 0,5; 1; 2 mol
    const n = n2 / 2;
    const eta = pick([50, 60, 75, 80]);
    const Ma = M(sa);
    const Me = M(se);
    return {
      tex: `m(\\text{киселина}) = ${dec(n * Ma)}\\ \\mathrm{g},\\ \\eta = ${eta}\\%`,
      ask: `Колко грама ${ester} се получават от ${acid} с излишък алкохол?`,
      num: n2 * Me * eta,
      den: 200,
      steps: [`$n = \\frac{${dec(n * Ma)}}{${dec(Ma)}} = ${dec(n)}\\ \\mathrm{mol}$; толкова е и теоретичното количество естер`, `$m = ${dec(n)} \\cdot ${dec(Me)} \\cdot ${dec(eta / 100)} = ${dec((n2 * Me * eta) / 200)}\\ \\mathrm{g}$`],
    };
  }
  if (kind === 3) {
    const [name, s] = pick(ALDEHYDES);
    const n100 = pick([5, 10, 20, 25]);
    const n = n100 / 100;
    const m = M(s);
    return {
      tex: `m(\\text{${name}}) = ${dec(n * m)}\\ \\mathrm{g}`,
      ask: 'Колко грама сребро се отлагат при реакцията на сребърното огледало?',
      num: n100 * 216,
      den: 100,
      steps: [`$n = \\frac{${dec(n * m)}}{${dec(m)}} = ${dec(n)}\\ \\mathrm{mol}$`, `Всеки мол алдехид дава 2 mol сребро: $m(\\mathrm{Ag}) = 2 \\cdot ${dec(n)} \\cdot 108 = ${dec((n100 * 216) / 100)}\\ \\mathrm{g}$`],
    };
  }
  const [name, f, c] = pick(POLYOLS);
  const n100 = pick([10, 20, 50, 100]);
  const n = n100 / 100;
  return {
    tex: `n(${formulaTex(f)}) = ${dec(n)}\\ \\mathrm{mol}`,
    ask: `Колко литра водород (н.у.) отделя ${name} с излишък натрий?`,
    num: n100 * c * 112,
    den: 1000,
    steps: [`Всяка OH група дава половин молекула $\\mathrm{H_2}$; групите са ${c}: $n(\\mathrm{H_2}) = ${dec(n)} \\cdot \\frac{${c}}{2} = ${dec((n * c) / 2)}\\ \\mathrm{mol}$`, `$V = ${dec((n * c) / 2)} \\cdot 22{,}4 = ${dec((n100 * c * 112) / 1000)}\\ \\mathrm{L}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🥗 Оцет за салатата',
    problem: 'Трапезният оцет е 9% разтвор на етанова киселина. Колко грама киселина и колко мола има в 500 g оцет?',
    solution: ['$m = 0{,}09 \\cdot 500 = 45\\ \\mathrm{g}$', '$M(\\mathrm{CH_3COOH}) = 60\\ \\mathrm{g/mol}$, $n = \\frac{45}{60} = 0{,}75\\ \\mathrm{mol}$'],
    answer: '$45\\ \\mathrm{g}$, $0{,}75\\ \\mathrm{mol}$',
    check: [45, 0.75],
    ask: ['киселина, g', 'n, mol'],
  },
  {
    title: '🍷 Колко спирт има в бутилка вино',
    problem: 'Бутилка вино е 750 mL с алкохолно съдържание 12% об. Колко милилитра и колко грама етанол има в нея? (Плътността на етанола е 0,789 g/mL.)',
    solution: ['$V = 0{,}12 \\cdot 750 = 90\\ \\mathrm{mL}$', '$m = 90 \\cdot 0{,}789 \\approx 71{,}0\\ \\mathrm{g}$ – около 1,5 mol етанол.'],
    answer: '$90\\ \\mathrm{mL}$, $\\approx 71{,}0\\ \\mathrm{g}$',
    check: [90, 71.0],
    ask: ['етанол, mL', 'етанол, g'],
  },
  {
    title: '🍌 Аромат на банан',
    problem: 'Ароматът на банан се дължи главно на 3-метилбутилов етаноат $\\mathrm{C_7H_{14}O_2}$. Колко грама естер се получават от 13,2 g 3-метилбутан-1-ол $\\mathrm{C_5H_{11}OH}$ и излишък етанова киселина, ако добивът е 65%?',
    solution: ['$M(\\mathrm{C_5H_{11}OH}) = 88\\ \\mathrm{g/mol}$, $n = \\frac{13{,}2}{88} = 0{,}15\\ \\mathrm{mol}$', '$M(\\mathrm{C_7H_{14}O_2}) = 130\\ \\mathrm{g/mol}$', '$m = 0{,}15 \\cdot 130 \\cdot 0{,}65 \\approx 12{,}7\\ \\mathrm{g}$'],
    answer: '$\\approx 12{,}7\\ \\mathrm{g}$',
    check: [12.7],
    ask: ['естер, g'],
  },
  {
    title: '🪞 Сребърно огледало',
    problem: 'Някога огледалата са посребрявали с реакцията на алдехиди с амонячен разтвор на сребърен оксид. Колко грама сребро се отлагат от 2,2 g етанал?',
    solution: ['$n(\\mathrm{CH_3CHO}) = \\frac{2{,}2}{44} = 0{,}05\\ \\mathrm{mol}$', 'Всеки мол алдехид дава 2 mol сребро: $n(\\mathrm{Ag}) = 0{,}1\\ \\mathrm{mol}$', '$m = 0{,}1 \\cdot 108 = 10{,}8\\ \\mathrm{g}$'],
    answer: '$10{,}8\\ \\mathrm{g}$',
    check: [10.8],
    ask: ['сребро, g'],
  },
  {
    title: '🧪 Формалин',
    problem: 'Формалинът е воден разтвор с около 37% метанал $\\mathrm{HCHO}$. Колко грама и колко мола метанал има в 250 g формалин?',
    solution: ['$m = 0{,}37 \\cdot 250 = 92{,}5\\ \\mathrm{g}$', '$n = \\frac{92{,}5}{30} \\approx 3{,}08\\ \\mathrm{mol}$'],
    answer: '$92{,}5\\ \\mathrm{g}$, $\\approx 3{,}08\\ \\mathrm{mol}$',
    check: [92.5, 3.08],
    ask: ['метанал, g', 'n, mol'],
  },
  {
    title: '🚔 Старият дрегер',
    problem: 'В старите дрегери етанолът от издишания въздух се окислява от оранжевия калиев дихромат до етанова киселина, а дихроматът става зелен: 3C₂H₅OH + 2K₂Cr₂O₇ + 8H₂SO₄ → 3CH₃COOH + 2Cr₂(SO₄)₃ + 2K₂SO₄ + 11H₂O. Колко милиграма K₂Cr₂O₇ реагират с 0,46 mg етанол?',
    solution: ['$n(\\mathrm{C_2H_5OH}) = \\frac{0{,}46}{46} = 0{,}01\\ \\mathrm{mmol}$', '$n(\\mathrm{K_2Cr_2O_7}) = \\frac{2}{3} \\cdot 0{,}01\\ \\mathrm{mmol}$', '$M(\\mathrm{K_2Cr_2O_7}) = 294\\ \\mathrm{g/mol}$, $m = \\frac{2}{3} \\cdot 0{,}01 \\cdot 294 = 1{,}96\\ \\mathrm{mg}$'],
    answer: '$1{,}96\\ \\mathrm{mg}$',
    check: [1.96],
    ask: ['K₂Cr₂O₇, mg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Коя група е характерна за алдехидите?',
    answers: ['$-\\mathrm{CHO}$', '$-\\mathrm{OH}$', '$-\\mathrm{COOH}$', '$-\\mathrm{NH_2}$'],
    correctAnswer: '$-\\mathrm{CHO}$',
  },
  {
    question: 'Какво се получава при окисление на пропан-2-ол?',
    answers: ['пропанон (кетон)', 'пропанал (алдехид)', 'пропанова киселина', 'не се окислява'],
    correctAnswer: 'пропанон (кетон)',
  },
  {
    question: 'Защо етанолът кипи при 78 °C, а диметиловият етер със същата формула $\\mathrm{C_2H_6O}$ – при −24 °C?',
    answers: ['молекулите на етанола образуват водородни връзки', 'етанолът има по-голяма моларна маса', 'етерът е йонно съединение', 'етанолът е ароматен'],
    correctAnswer: 'молекулите на етанола образуват водородни връзки',
  },
  {
    question: 'С кое вещество етановата киселина реагира с отделяне на газ?',
    answers: ['$\\mathrm{NaHCO_3}$', '$\\mathrm{NaCl}$', '$\\mathrm{Na_2SO_4}$', '$\\mathrm{C_2H_5OH}$'],
    correctAnswer: '$\\mathrm{NaHCO_3}$',
  },
  {
    question: 'Как се казва естерът от етанова киселина и метанол?',
    answers: ['метилов етаноат', 'етилов метаноат', 'етилов етаноат', 'метилов метаноат'],
    correctAnswer: 'метилов етаноат',
  },
  {
    question: 'Кое вещество дава реакцията на сребърното огледало?',
    answers: ['етанал', 'етанол', 'пропанон', 'етанова киселина'],
    correctAnswer: 'етанал',
  },
  {
    question: 'Какъв е алкохолът 2-метилпропан-2-ол?',
    answers: ['третичен', 'първичен', 'вторичен', 'многовалентен'],
    correctAnswer: 'третичен',
  },
  {
    question: 'Кое от веществата е най-силна киселина?',
    answers: ['етанова киселина', 'фенол', 'етанол', 'вода'],
    correctAnswer: 'етанова киселина',
  },
  {
    question: 'Защо водните разтвори на амините имат основна реакция?',
    answers: ['азотът свързва протон със свободната си електронна двойка', 'амините съдържат OH група', 'амините се разпадат на $\\mathrm{OH^-}$ и катион на метал', 'амините са соли'],
    correctAnswer: 'азотът свързва протон със свободната си електронна двойка',
  },
];

// ---------- Страница ----------

const CLASSES: { cls: string; group: string; ending: string; name: string; smiles: string; atoms: number[] }[] = [
  { cls: 'халогенопроизводни', group: '−F, −Cl, −Br, −I', ending: 'представка хлоро-, бромо-…', name: 'хлороетан', smiles: 'CCCl', atoms: [2] },
  { cls: 'алкохоли', group: '−OH', ending: '-ол', name: 'етанол', smiles: 'CCO', atoms: [2] },
  { cls: 'феноли', group: '−OH при бензеновия пръстен', ending: '-ол', name: 'фенол', smiles: 'Oc1ccccc1', atoms: [0] },
  { cls: 'етери', group: '−O−', ending: '… етер', name: 'диетилов етер', smiles: 'CCOCC', atoms: [2] },
  { cls: 'алдехиди', group: '−CHO', ending: '-ал', name: 'етанал', smiles: 'CC=O', atoms: [1, 2] },
  { cls: 'кетони', group: '>C=O', ending: '-он', name: 'пропанон', smiles: 'CC(=O)C', atoms: [1, 2] },
  { cls: 'карбоксилни киселини', group: '−COOH', ending: '-ова киселина', name: 'етанова киселина', smiles: 'CC(=O)O', atoms: [1, 2, 3] },
  { cls: 'естери', group: '−COO−', ending: '-илов …-оат', name: 'метилов етаноат', smiles: 'CC(=O)OC', atoms: [1, 2, 3] },
  { cls: 'амини', group: '−NH₂', ending: '-амин', name: 'метиламин', smiles: 'CN', atoms: [1] },
  { cls: 'амиди', group: '−CONH₂', ending: '-амид', name: 'етанамид', smiles: 'CC(N)=O', atoms: [1, 2, 3] },
];

// Въглеродът с OH групата и самата група са оцветени
const ALCOHOL_KINDS: [string, string, number[]][] = [
  ['първичен: пропан-1-ол', 'CCCO', [2, 3]],
  ['вторичен: пропан-2-ол', 'CC(O)C', [1, 2]],
  ['третичен: 2-метилпропан-2-ол', 'CC(C)(C)O', [1, 4]],
];

// Температури на кипене при 101,3 kPa (закръглени), вещества с близки моларни маси
const BOILING: [string, string, number, string][] = [
  ['бутан', 'C4H10', 58, '−1'],
  ['пропанал', 'C3H6O', 58, '48'],
  ['пропанон', 'C3H6O', 58, '56'],
  ['пропан-1-ол', 'C3H8O', 60, '97'],
  ['метилов метаноат', 'C2H4O2', 60, '32'],
  ['етанова киселина', 'C2H4O2', 60, '118'],
];

const TESTS: [string, string, string][] = [
  ['натрий', 'алкохоли, феноли, киселини', 'отделя се водород'],
  ['$\\mathrm{NaHCO_3}$ или $\\mathrm{Na_2CO_3}$', 'карбоксилни киселини', 'отделя се $\\mathrm{CO_2}$ (феноли и алкохоли – не)'],
  ['$\\mathrm{FeCl_3}$', 'феноли', 'виолетово оцветяване'],
  ['бромна вода', 'феноли (и ненаситени съединения)', 'обезцветяване; при фенола – бяла утайка'],
  ['амонячен разтвор на $\\mathrm{Ag_2O}$', 'алдехиди', 'сребърно огледало'],
  ['$\\mathrm{Cu(OH)_2}$ при загряване', 'алдехиди', 'тухлено-червена утайка от $\\mathrm{Cu_2O}$'],
  ['$\\mathrm{K_2Cr_2O_7}$ / $\\mathrm{H^+}$', 'първични и вторични алкохоли, алдехиди', 'оранжево → зелено'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function FunctionalGroups() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Функционални групи</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍷 Две вещества имат една и съща формула – <Tex>{'\\mathrm{C_2H_6O}'}</Tex>: по два въглеродни, шест водородни и един кислороден
            атом. Първото е етанолът – течността във виното, която кипи при 78 °C и се смесва с вода в каквото и да е отношение. Второто е
            диметиловият етер – газ, който кипи при −24 °C и се използва като пропелант в спрейовете. Цялата разлика е къде е кислородът:
            в етанола той е в групата <strong>−OH</strong>, а в етера е „затворен“ между два въглеродни атома. Малката група атоми, която
            определя характера на цялата молекула, се нарича <strong>функционална група</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е функционална група</h2>
          <Theorem
            type="definition"
            title="Функционална група"
            description="Функционалната група е атом или група атоми в органичната молекула, които определят характерните ѝ химични свойства. Съединенията с еднаква функционална група образуват клас и реагират по сходен начин, независимо от дължината на въглеводородния остатък R."
          />
          <p className={text}>
            Въглеводородният скелет (вериги и пръстени от{' '}
            <Link to="/chemistry/organic/hydrocarbons" className={link}>
              урока за въглеводородите
            </Link>
            ) е сравнително инертен. Реакциите почти винаги протичат при функционалната група – затова, ако знаем как реагира етанолът,
            знаем и как реагира пропанолът. Името на съединението също се строи от скелета (мет-, ет-, проп-, бут-…) и окончание или
            представка за групата.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {CLASSES.map(c => (
              <div key={c.cls} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center gap-2 shadow-sm">
                <div className="flex justify-center items-center min-h-[72px]">
                  <Molecule smiles={c.smiles} mode="semi" bond={36} title={c.name} highlightAtoms={c.atoms} />
                </div>
                <div className="text-sm text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{c.cls}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    група {c.group} · {c.ending}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">пример: {c.name}</p>
                </div>
              </div>
            ))}
          </div>
          <Example
            description="Именувайте $\mathrm{CH_3CH_2CH_2OH}$ и $\mathrm{CH_3CH_2CHO}$."
            steps={[
              'И двете молекули имат по три въглеродни атома – основата на името е „пропан“.',
              'В първата има група $-\\mathrm{OH}$ в края на веригата: пропан-1-ол (цифрата показва при кой въглерод е групата).',
              'Във втората има група $-\\mathrm{CHO}$: пропанал. При алдехидите не пишем цифра – групата винаги е в края.',
            ]}
          />
          <FunctionalGroupLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Халогенопроизводни</h2>
          <p className={text}>
            Ако във <Term id="hydrocarbon">въглеводород</Term> заменим водороден атом с <Term id="halogens">халоген</Term>, получаваме халогенопроизводно: хлорометан{' '}
            <Tex>{'\\mathrm{CH_3Cl}'}</Tex>, дихлорометан <Tex>{'\\mathrm{CH_2Cl_2}'}</Tex>, трихлорометан (хлороформ){' '}
            <Tex>{'\\mathrm{CHCl_3}'}</Tex>. Халогенът се означава с представка и номер: 2-бромопропан. Връзката C−Hal е полярна, а
            халогенът лесно се заменя с други групи – затова халогенопроизводните са важни междинни вещества в синтеза. Как точно става
            заместването, ще видим в{' '}
            <Link to="/chemistry/organic/mechanisms" className={link}>
              Механизми на органичните реакции
            </Link>
            .
          </p>
          <p className={text}>
            Някои халогенопроизводни имат лоша слава: <Term id="cfc">фреоните</Term> (хлорофлуоровъглеводороди) са били идеални хладилни агенти – неотровни и
            негорливи, но в стратосферата се разпадат от ултравиолетовата светлина и хлорът им разрушава <Term id="ozone-layer">озоновия слой</Term>. <Term id="montreal-protocol">Монреалският
            протокол</Term> от 1987 г. постепенно ги забранява.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Алкохоли</h2>
          <Theorem
            type="definition"
            title="Алкохоли"
            description="Алкохолите съдържат хидроксилна група $-\mathrm{OH}$, свързана с наситен въглероден атом. Наситените едновалентни алкохоли имат обща формула $\mathrm{C_nH_{2n+1}OH}$. Според броя на въглеродните атоми, свързани с въглерода на OH групата, алкохолът е първичен (един), вторичен (два) или третичен (три)."
          />
          <div className="flex flex-wrap justify-center items-start gap-4 mb-4">
            {ALCOHOL_KINDS.map(([name, s, atoms]) => (
              <figure key={name} className="bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col items-center shadow-sm">
                <Molecule smiles={s} mode="semi" bond={34} title={name} highlightAtoms={atoms} />
                <figcaption className="text-xs sm:text-sm mt-1">{name}</figcaption>
              </figure>
            ))}
          </div>
          <p className={text}>
            Групата −OH прави алкохолите много по-различни от въглеводородите. Между молекулите им се образуват{' '}
            <Term id="hydrogen-bond">водородни връзки</Term> (виж{' '}
            <Link to="/chemistry/structure/molecules" className={link}>
              Форма на молекулите и междумолекулни сили
            </Link>
            ), затова алкохолите кипят много по-високо от въглеводородите с близка маса, а първите от тях се смесват с вода без ограничение.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Вещество</th>
                  <th className={th}>Формула</th>
                  <th className={th}>
                    <Tex>{'M,\\ \\mathrm{g/mol}'}</Tex>
                  </th>
                  <th className={th}>
                    <Tex>{'t_{\\text{кип}},\\ ^\\circ\\mathrm{C}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {BOILING.map(([name, f, m, t]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{formulaTex(f)}</Tex>
                    </td>
                    <td className={td}>{m}</td>
                    <td className={td}>{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Таблицата показва вещества с почти еднаква <Term id="molar-mass">моларна маса</Term>. Без водородни връзки (бутанът, естерът) кипенето е ниско; полярната
            група C=O го повишава (алдехид, кетон); група OH – още повече; а карбоксилните киселини образуват двойки молекули (димери),
            свързани с две водородни връзки, и кипят най-високо.
          </p>
          <Theorem
            title="Химични свойства на алкохолите"
            description="Изгарят: $\mathrm{C_2H_5OH + 3O_2 \to 2CO_2 + 3H_2O}$. С натрий отделят водород: $\mathrm{2C_2H_5OH} + \mathrm{2Na} \to \mathrm{2C_2H_5ONa} + \mathrm{H_2\uparrow}$. При загряване с концентрирана сярна киселина губят вода (дехидратация) и дават алкен: $\mathrm{C_2H_5OH \to C_2H_4 + H_2O}$. С карбоксилни киселини образуват естери, а при окисление – алдехиди, кетони или киселини."
          />
          <p className={text}>
            Метанолът е много отровен – няколко грама могат да причинят слепота, а около 30 mL (според различни източници – и по-малко)
            могат да убият. Етанолът също е отрова, но много по-слаба. Многовалентни алкохоли са етан-1,2-диолът (етиленгликол – в
            антифриза) и пропан-1,2,3-триолът (глицерол – в кремовете и мазнините). Многовалентните алкохоли с OH групи при съседни
            въглеродни атоми разтварят прясно утаения <Tex>{'\\mathrm{Cu(OH)_2}'}</Tex> до тъмносин <Term id="solution">разтвор</Term> – така ги различаваме от
            едновалентните.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Феноли</h2>
          <p className={text}>
            Ако групата −OH е свързана направо с бензеновия пръстен, веществото е фенол. Пръстенът „дърпа“ електронна плътност от кислорода
            и връзката O−H се къса по-лесно. Затова фенолът е по-силна <Term id="acid">киселина</Term> от алкохолите (<Tex>{'\\mathrm{p}K_a \\approx 10'}</Tex>{' '}
            срещу около 16 за етанола) и за разлика от тях реагира с основи:
          </p>
          <p className="text-center mb-4">
            <Tex>{'\\mathrm{C_6H_5OH + NaOH \\to C_6H_5ONa + H_2O}'}</Tex>
          </p>
          <p className={text}>
            Фенолът е обаче по-слаба киселина от въглената и не отделя <Tex>{'\\mathrm{CO_2}'}</Tex> от карбонатите. С железен(III)
            хлорид дава виолетово оцветяване, а с бромна вода – бяла <Term id="precipitate">утайка</Term> от 2,4,6-трибромофенол. Под името „карболова киселина“ Джоузеф
            Листър го използва през 1867 г. за първите антисептични операции.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Алдехиди и кетони</h2>
          <Theorem
            type="definition"
            title="Карбонилни съединения"
            description="Алдехидите и кетоните съдържат карбонилна група ${>}\mathrm{C{=}O}$. При алдехидите тя е в края на веригата и въглеродът ѝ носи водороден атом ($-\mathrm{CHO}$, окончание -ал); при кетоните е свързана с два въглеродни атома (окончание -он). Наситените алдехиди и кетони имат обща формула $\mathrm{C_nH_{2n}O}$."
          />
          <p className={text}>
            Алдехидите се окисляват лесно до карбоксилни киселини – това ги различава от кетоните. На него се основават двете класически
            проби: с амонячен разтвор на сребърен <Term id="oxide">оксид</Term> по стените на епруветката се отлага сребро („сребърно огледало“), а с меден(II){' '}
            <Term id="hydroxide">хидроксид</Term> при загряване се образува тухлено-червена утайка от <Tex>{'\\mathrm{Cu_2O}'}</Tex>. Опростено:
          </p>
          <p className="text-center mb-4">
            <Tex>{'\\mathrm{RCHO + Ag_2O \\to RCOOH + 2Ag\\downarrow}'}</Tex>
          </p>
          <p className={text}>
            Метаналът (формалдехидът) е газ с остра миризма; разтворът му във вода (формалин) консервира биологични препарати. Пропанонът
            (ацетонът) е <Term id="solvent">разтворител</Term> – в лаковете за нокти и в лабораторията. Алдехиди и кетони има и в природата: ароматът на канелата
            се дължи главно на канелалдехида, а на ванилията – на ванилина.
          </p>
          <Example
            description="Как с химична реакция да различим пропанал от пропанон? И двете вещества имат формула $\mathrm{C_3H_6O}$."
            steps={['Добавяме амонячен разтвор на сребърен оксид и затопляме.', 'Пропаналът (алдехид) дава сребърно огледало; пропанонът (кетон) – не.']}
          />
          <AlcoholOxidationLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Карбоксилни киселини</h2>
          <Theorem
            type="definition"
            title="Карбоксилни киселини"
            description="Карбоксилните киселини съдържат карбоксилна група $-\mathrm{COOH}$. Наситените едноосновни киселини имат обща формула $\mathrm{C_nH_{2n+1}COOH}$ (или $\mathrm{C_nH_{2n}O_2}$). Имената им завършват на -ова киселина: метанова (мравчена) $\mathrm{HCOOH}$, етанова (оцетна) $\mathrm{CH_3COOH}$, бутанова (маслена) $\mathrm{C_3H_7COOH}$."
          />
          <p className={text}>
            Карбоксилните киселини са <Term id="weak-acid">слаби киселини</Term>: в 0,1 mol/L разтвор на оцетна киселина се дисоциира само
            около 1,3% от молекулите (за константите на дисоциация и <Term id="ph">pH</Term> виж{' '}
            <Link to="/chemistry/reactions/acids-bases" className={link}>
              Киселини, основи и pH
            </Link>
            ). Все пак те са по-силни от въглената киселина и от фенола и имат всички общи свойства на киселините:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              с активни метали: <Tex>{'\\mathrm{2CH_3COOH} + \\mathrm{Mg} \\to \\mathrm{(CH_3COO)_2Mg} + \\mathrm{H_2\\uparrow}'}</Tex>
            </li>
            <li>
              с основи: <Tex>{'\\mathrm{CH_3COOH + NaOH \\to CH_3COONa + H_2O}'}</Tex>
            </li>
            <li>
              с карбонати: <Tex>{'\\mathrm{2CH_3COOH} + \\mathrm{Na_2CO_3} \\to \\mathrm{2CH_3COONa} + \\mathrm{H_2O} + \\mathrm{CO_2\\uparrow}'}</Tex> – „шуменето“ при
              гасене на сода бикарбонат с оцет
            </li>
          </ul>
          <p className={text}>
            Метановата киселина е изключение – тя има и алдехидна група (<Tex>{'\\mathrm{H{-}CO{-}OH}'}</Tex>) и дава сребърно огледало.
            Тя е в отровата на мравките и в космите на копривата. Висшите киселини с 16–18 въглеродни атома (палмитинова, стеаринова,
            олеинова) влизат в състава на мазнините – за тях е урокът{' '}
            <Link to="/chemistry/organic/biomolecules" className={link}>
              Химия на живота
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Естери</h2>
          <Theorem
            title="Естерификация"
            description="Карбоксилна киселина и алкохол образуват естер и вода: $\mathrm{RCOOH + R'OH \rightleftharpoons RCOOR' + H_2O}$. Реакцията е бавна и обратима; катализира се от концентрирана сярна киселина, която свързва и водата. Обратната реакция – хидролизата на естера – в основна среда протича докрай: $\mathrm{RCOOR'} + \mathrm{NaOH} \to \mathrm{RCOONa} + \mathrm{R'OH}$."
          />
          <p className={text}>
            Името на естера има две думи: първата идва от алкохола (метилов, етилов…), втората – от киселината (метаноат, етаноат…).
            Естерът от етанова киселина и етанол е етилов етаноат <Tex>{'\\mathrm{CH_3COOC_2H_5}'}</Tex>. Понеже реакцията е обратима,
            в равновесие остават и изходни вещества. За нея{' '}
            <Term id="equilibrium-constant">константата на равновесие</Term> е около 4 (виж{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              Химично равновесие
            </Link>
            ).
          </p>
          <Example
            description="Смесват 1 mol етанова киселина и 1 mol етанол. Колко естер има в равновесие, ако $K = 4$?"
            steps={[
              'Нека се образуват $x$ mol естер и $x$ mol вода; остават $1 - x$ mol киселина и $1 - x$ mol алкохол.',
              '$\\frac{x^2}{(1 - x)^2} = 4 \\Rightarrow \\frac{x}{1 - x} = 2 \\Rightarrow x = \\frac{2}{3}$',
              'Получават се $\\frac{2}{3}\\ \\mathrm{mol}$, т.е. $\\frac{2}{3} \\cdot 88 \\approx 58{,}7\\ \\mathrm{g}$ естер – добивът е около 67%.',
            ]}
          />
          <p className={text}>
            Нисшите естери са летливи течности с приятен плодов мирис – от тях са голяма част от ароматите на плодовете и цветята и
            изкуствените ароматизатори. Мазнините и восъците също са естери, а <Term id="polyester">полиестерите</Term> – <Term id="polymer">полимери</Term> (виж{' '}
            <Link to="/chemistry/organic/polymers" className={link}>
              Полимери
            </Link>
            ).
          </p>
          <EsterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Етери, амини и амиди</h2>
          <p className={text}>
            <strong>Етерите</strong> <Tex>{'\\mathrm{R{-}O{-}R\'}'}</Tex> нямат водород при кислорода и не образуват водородни връзки
            помежду си – затова кипят ниско. Диетиловият етер е бил една от първите упойки (1846 г.), но е силно запалим.
          </p>
          <p className={text}>
            <strong>Амините</strong> са производни на амоняка, в които водородните атоми са заменени с въглеводородни остатъци: метиламин{' '}
            <Tex>{'\\mathrm{CH_3NH_2}'}</Tex>, диметиламин <Tex>{'\\mathrm{(CH_3)_2NH}'}</Tex>. Като амоняка те са основи – азотът свързва{' '}
            <Term id="proton">протон</Term> със свободната си електронна двойка: <Tex>{'\\mathrm{CH_3NH_2 + HCl \\to CH_3NH_3Cl}'}</Tex>. Нисшите амини миришат на
            риба или амоняк; неприятната миризма на развалена риба е главно от триметиламин.
          </p>
          <p className={text}>
            <strong>Амидите</strong> съдържат група <Tex>{'-\\mathrm{CONH_2}'}</Tex> (или <Tex>{'-\\mathrm{CO{-}NH{-}}'}</Tex>). За разлика
            от амините те почти нямат основни свойства. Амидната връзка свързва <Term id="amino-acid">аминокиселините</Term> в <Term id="protein">белтъците</Term> (там я наричат пептидна) и{' '}
            <Term id="monomer">мономерите</Term> в найлона.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Как да разпознаем функционалната група</h2>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Реактив</th>
                  <th className={th}>Реагират</th>
                  <th className={th}>Признак</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map(([r, who, sign]) => (
                  <tr key={r}>
                    <td className={td}>
                      <MathText>{r}</MathText>
                    </td>
                    <td className={td}>{who}</td>
                    <td className={td}>
                      <MathText>{sign}</MathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Theorem
            title="Генетична връзка"
            description="Функционалните групи преминават една в друга: алкан → халогенопроизводно → алкохол → алдехид → карбоксилна киселина → естер. Окислението върви надясно (алкохол → алдехид → киселина), редукцията – наляво. Например $\mathrm{CH_3CH_2Cl} \to \mathrm{CH_3CH_2OH} \to \mathrm{CH_3CHO} \to \mathrm{CH_3COOH} \to \mathrm{CH_3COOC_2H_5}$."
          />
          <p className={text}>
            Разпознаването на неизвестни вещества с проби е обичайна задача в олимпиадите – подобна на шишетата без етикети в урока{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            . Днес в лабораториите строежът се определя главно със спектроскопия.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 10. Тренажор
          </h2>
          <p className={text}>Моларни маси, изгаряне на алкохоли, водород от реакция с натрий, сребърно огледало и маса на естер. Десетичните отговори въвеждай като 5,6.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Функционалните групи около нас</h2>
          <p className={text}>Оцет, вино, ароматизатори, огледала и дрегери – органичните класове са навсякъде.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Алкохолите като основи', 'Групата OH в етанола го прави основа, като NaOH.', 'Алкохолите не се дисоциират на $\\mathrm{OH^-}$; водните им разтвори са неутрални.'],
              ['Фенолът е алкохол', 'Фенолът $\\mathrm{C_6H_5OH}$ е ароматен алкохол.', 'OH при ароматния пръстен прави отделен клас – фенолите са по-кисели и реагират с NaOH.'],
              ['Окисление на всеки алкохол', 'Всеки алкохол се окислява до киселина.', 'Първичните – до алдехид и киселина, вторичните – до кетон, третичните не се окисляват.'],
              ['Името на естера', '$\\mathrm{CH_3COOC_2H_5}$ е метилов етаноат.', 'Алкохолът е етанол, киселината – етанова: етилов етаноат.'],
              ['Естерификацията докрай', '1 mol киселина и 1 mol алкохол дават 1 mol естер.', 'Реакцията е обратима: при $K \\approx 4$ се получават около 2/3 mol.'],
              ['Алдехид и кетон', 'Пропанонът дава сребърно огледало.', 'Пробата е за алдехиди; кетоните не се окисляват лесно.'],
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
          <h2 className={h2}>13. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Каква е моларната маса на пропан-1-ол $\mathrm{C_3H_7OH}$ и каква е масовата част на кислорода в него?" check={[60, 26.7]} ask={['$M$, g/mol', '$w(\\mathrm{O})$, %']}>
                <p><Tex>{'M = 3 \\cdot 12 + 8 \\cdot 1 + 16 = 60\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'w(\\mathrm{O}) = \\frac{16}{60} \\approx 26{,}7\\%'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Смесват 1 mol етанова киселина и 1 mol етанол. В равновесие са се превърнали 2/3 от киселината. Колко грама етилов етаноат са се получили?" check={[58.7]} ask={['естер, g']}>
                <p><Tex>{'n(\\text{естер}) = \\frac{2}{3}\\ \\mathrm{mol}'}</Tex>, <Tex>{'M(\\mathrm{CH_3COOC_2H_5}) = 88\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'m = \\frac{2}{3} \\cdot 88 \\approx 58{,}7\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко литра $\mathrm{CO_2}$ се получават и колко литра кислород се изразходват при пълното изгаряне на 0,5 mol етанол? (н.у.)" check={[22.4, 33.6]} ask={['$\\mathrm{CO_2}$, L', '$\\mathrm{O_2}$, L']}>
                <p><Tex>{'\\mathrm{C_2H_5OH + 3O_2 \\to 2CO_2 + 3H_2O}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{CO_2}) = 1\\ \\mathrm{mol} \\Rightarrow V = 22{,}4\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{O_2}) = 1{,}5\\ \\mathrm{mol} \\Rightarrow V = 33{,}6\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Наситен едновалентен алкохол съдържа 21,6% кислород. Намерете моларната му маса. Колко изомерни алкохола отговарят на тази формула?" check={[74, 4]} ask={['$M$, g/mol', 'брой изомерни алкохоли']}>
                <p><Tex>{'M = \\frac{16}{0{,}216} \\approx 74\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'\\mathrm{C_nH_{2n+1}OH}: 14n + 18 = 74 \\Rightarrow n = 4'}</Tex> – бутанол <Tex>{'\\mathrm{C_4H_9OH}'}</Tex>.</p>
                <p>Изомерните алкохоли са 4: бутан-1-ол, бутан-2-ол, 2-метилпропан-1-ол и 2-метилпропан-2-ол. (С тази формула има и три етера, но те не са алкохоли.)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Смесват 1 mol етанова киселина и 3 mol етанол. Каква част от киселината се естерифицира и колко грама естер се получават? ($K = 4$)" check={[90.3, 79.4]} ask={['превърната киселина, %', 'естер, g']}>
                <p><Tex>{'\\frac{x^2}{(1 - x)(3 - x)} = 4 \\Rightarrow 3x^2 - 16x + 12 = 0'}</Tex></p>
                <p><Tex>{'x = \\frac{16 - \\sqrt{112}}{6} \\approx 0{,}903'}</Tex> (другият корен е по-голям от 1).</p>
                <p><Tex>{'m = 0{,}903 \\cdot 88 \\approx 79{,}4\\ \\mathrm{g}'}</Tex> – излишъкът от алкохол вдига добива от 67% на 90%.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="5,8 g наситен алдехид $\mathrm{C_nH_{2n}O}$ отлагат 21,6 g сребро при реакцията на сребърното огледало. Каква е моларната маса на алдехида и колко въглеродни атома има той?" check={[58, 3]} ask={['$M$, g/mol', 'брой C атоми']}>
                <p><Tex>{'n(\\mathrm{Ag}) = \\frac{21{,}6}{108} = 0{,}2\\ \\mathrm{mol} \\Rightarrow n(\\text{алдехид}) = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'M = \\frac{5{,}8}{0{,}1} = 58\\ \\mathrm{g/mol}'}</Tex>; <Tex>{'14n + 16 = 58 \\Rightarrow n = 3'}</Tex></p>
                <p>Това е пропанал <Tex>{'\\mathrm{CH_3CH_2CHO}'}</Tex>. (Метаналът не е възможен – той дава 4 mol сребро на мол.)</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Смес от етанол и фенол реагира с излишък натрий и отделя 3,36 L водород (н.у.). Същото количество смес реагира с 40 g 10% разтвор на NaOH. Колко грама от всяко вещество има в сместа?" check={[9.4, 9.2]} ask={['фенол, g', 'етанол, g']}>
                <p>С NaOH реагира само фенолът: <Tex>{'n(\\mathrm{NaOH}) = \\frac{0{,}1 \\cdot 40}{40} = 0{,}1\\ \\mathrm{mol} = n(\\mathrm{C_6H_5OH})'}</Tex>, т.е. <Tex>{'0{,}1 \\cdot 94 = 9{,}4\\ \\mathrm{g}'}</Tex>.</p>
                <p>С натрий реагират и двете: <Tex>{'n(\\mathrm{H_2}) = 0{,}15\\ \\mathrm{mol}'}</Tex>, значи общо <Tex>{'0{,}3\\ \\mathrm{mol}'}</Tex> OH групи.</p>
                <p><Tex>{'n(\\mathrm{C_2H_5OH}) = 0{,}3 - 0{,}1 = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}2 \\cdot 46 = 9{,}2\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Естер $\mathrm{C_4H_8O_2}$ се хидролизира до киселина и алкохол, като при окисление алкохолът дава същата киселина. Кой е естерът? Колко грама натриева сол се получават при хидролизата на 8,8 g от него с NaOH?" check={[88, 8.2]} ask={['$M$(естер), g/mol', 'сол, g']}>
                <p>Щом алкохолът се окислява до същата киселина, двете части имат еднакъв брой въглеродни атоми: по 2. Естерът е етилов етаноат <Tex>{'\\mathrm{CH_3COOC_2H_5}'}</Tex>, <Tex>{'M = 88\\ \\mathrm{g/mol}'}</Tex>.</p>
                <p><Tex>{'\\mathrm{CH_3COOC_2H_5} + \\mathrm{NaOH} \\to \\mathrm{CH_3COONa} + \\mathrm{C_2H_5OH}'}</Tex></p>
                <p><Tex>{'n = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'m(\\mathrm{CH_3COONa}) = 0{,}1 \\cdot 82 = 8{,}2\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При изгарянето на 2,3 g органично вещество се получават 4,4 g $\mathrm{CO_2}$ и 2,7 g вода. Плътността на парите му спрямо водорода е 23. Веществото реагира с натрий. Намерете моларната му маса и броя на въглеродните атоми. Кое е веществото?" check={[46, 2]} ask={['$M$, g/mol', 'брой C атоми']}>
                <p><Tex>{'n(\\mathrm{C}) = \\frac{4{,}4}{44} = 0{,}1\\ \\mathrm{mol}\\ (1{,}2\\ \\mathrm{g})'}</Tex>, <Tex>{'n(\\mathrm{H}) = 2 \\cdot \\frac{2{,}7}{18} = 0{,}3\\ \\mathrm{mol}\\ (0{,}3\\ \\mathrm{g})'}</Tex></p>
                <p>Кислород: <Tex>{'2{,}3 - 1{,}2 - 0{,}3 = 0{,}8\\ \\mathrm{g} = 0{,}05\\ \\mathrm{mol}'}</Tex>. Отношението <Tex>{'\\mathrm{C : H : O} = 2 : 6 : 1'}</Tex>.</p>
                <p><Tex>{'M = 23 \\cdot 2 = 46\\ \\mathrm{g/mol}'}</Tex> – формулата е <Tex>{'\\mathrm{C_2H_6O}'}</Tex>.</p>
                <p>Изомерите са етанол и диметилов етер; с натрий реагира етанолът.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>15. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Функционалната група определя свойствата и класа на органичното съединение</li>
              <li>✓ Алкохоли −OH (-ол): първични → алдехиди → киселини, вторични → кетони, третичните не се окисляват</li>
              <li>✓ Водородните връзки обясняват високите температури на кипене на алкохолите и киселините</li>
              <li>✓ Фенолите са по-кисели от алкохолите и реагират с NaOH; проба – <Tex>{'\\mathrm{FeCl_3}'}</Tex></li>
              <li>✓ Алдехиди −CHO (-ал) дават сребърно огледало; кетони &gt;C=O (-он) – не</li>
              <li>✓ Карбоксилни киселини −COOH са слаби киселини, но изместват <Tex>{'\\mathrm{CO_2}'}</Tex> от карбонатите</li>
              <li>✓ Киселина + алкохол ⇌ естер + вода; естерите се именуват „-илов …-оат“</li>
              <li>✓ Амините са основи; амидната връзка −CO−NH− е в белтъците и найлона</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              3-метилбутиловият етаноат – естерът, който мирише на банан, – е и сигнал за тревога при пчелите. Когато пчела ужили, тя
              отделя смес от вещества, сред които основно е този естер, и привлича други пчели към мястото. Затова пчеларите съветват да не
              се яде банан точно преди работа с кошерите – макар че доколко това наистина ядосва пчелите, не е съвсем ясно.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
