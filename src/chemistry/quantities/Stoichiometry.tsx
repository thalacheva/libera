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
import BalancerLab from './BalancerLab';
import LimitingReagentLab from './LimitingReagentLab';
import ReactionYieldLab from './ReactionYieldLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');
/** Десетично число като текст: 0.45 → 0,45. */
const decText = (v: number) => dec(v).replace('{,}', ',');

type Term2 = [number, string];
type Eq = { left: Term2[]; right: Term2[] };

const EQUATIONS: Eq[] = [
  { left: [[2, 'H2'], [1, 'O2']], right: [[2, 'H2O']] },
  { left: [[1, 'CH4'], [2, 'O2']], right: [[1, 'CO2'], [2, 'H2O']] },
  { left: [[4, 'Fe'], [3, 'O2']], right: [[2, 'Fe2O3']] },
  { left: [[2, 'Al'], [6, 'HCl']], right: [[2, 'AlCl3'], [3, 'H2']] },
  { left: [[1, 'C3H8'], [5, 'O2']], right: [[3, 'CO2'], [4, 'H2O']] },
  { left: [[4, 'NH3'], [5, 'O2']], right: [[4, 'NO'], [6, 'H2O']] },
  { left: [[2, 'KClO3']], right: [[2, 'KCl'], [3, 'O2']] },
  { left: [[2, 'Na'], [2, 'H2O']], right: [[2, 'NaOH'], [1, 'H2']] },
  { left: [[1, 'N2'], [3, 'H2']], right: [[2, 'NH3']] },
  { left: [[4, 'Al'], [3, 'O2']], right: [[2, 'Al2O3']] },
  { left: [[1, 'Fe2O3'], [3, 'CO']], right: [[2, 'Fe'], [3, 'CO2']] },
  { left: [[1, 'Zn'], [2, 'HCl']], right: [[1, 'ZnCl2'], [1, 'H2']] },
  { left: [[2, 'Mg'], [1, 'O2']], right: [[2, 'MgO']] },
  { left: [[1, 'CaCO3']], right: [[1, 'CaO'], [1, 'CO2']] },
];

/** Уравнението в LaTeX; коефициентът на мястото hide се заменя с „?“. */
function eqTex(eq: Eq, hide = -1) {
  const term = ([c, f]: Term2, i: number) => `${i === hide ? '\\boxed{?}\\,' : c > 1 ? c : ''}${formulaTex(f)}`;
  const l = eq.left.map((t, i) => term(t, i)).join(' + ');
  const r = eq.right.map((t, i) => term(t, eq.left.length + i)).join(' + ');
  return `${l} \\to ${r}`;
}

// Двойки „дадено вещество → търсено вещество“: [уравнение, индекс на даденото, индекс на търсеното] (индексите са в left ++ right)
const MASS_PAIRS: [number, number, number][] = [
  [0, 0, 2],
  [0, 1, 2],
  [1, 0, 2],
  [1, 0, 3],
  [6, 0, 2],
  [10, 0, 2],
  [11, 0, 3],
  [11, 0, 2],
  [9, 0, 2],
  [12, 0, 2],
  [13, 0, 1],
  [8, 0, 2],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  if (kind === 0) {
    // Липсващ коефициент
    const eq = pick(EQUATIONS);
    const all = [...eq.left, ...eq.right];
    const hide = randInt(0, all.length - 1);
    const [c, f] = all[hide];
    return {
      tex: eqTex(eq, hide),
      ask: 'Кой коефициент стои на мястото на въпросителния знак?',
      num: c,
      den: 1,
      steps: [
        `Броим атомите на всеки елемент от двете страни – те трябва да са равни.`,
        `Пред $${formulaTex(f)}$ стои ${c}${c === 1 ? ' (единицата не се пише)' : ''}: $${eqTex(eq)}$`,
      ],
    };
  }
  if (kind === 1) {
    // Маса на продукт (или реагент) по уравнение; n = q/4 mol дава крайни десетични дроби
    const [ei, gi, ti] = pick(MASS_PAIRS);
    const eq = EQUATIONS[ei];
    const all = [...eq.left, ...eq.right];
    const [nuG, fG] = all[gi];
    const [nuT, fT] = all[ti];
    const q = pick([1, 2, 4, 6, 8, 10, 12]);
    const n = q / 4;
    const MG = molarMass(fG);
    const MT = molarMass(fT);
    const m = n * MG;
    const nT = (n * nuT) / nuG;
    return {
      tex: `m(${formulaTex(fG)}) = ${dec(m)}\\ \\mathrm{g}`,
      ask: `По уравнението $${eqTex(eq)}$ – колко грама $${formulaTex(fT)}$ се получават?`,
      num: q * nuT * Math.round(MT * 2),
      den: 4 * nuG * 2,
      steps: [
        `$n(${formulaTex(fG)}) = \\frac{${dec(m)}}{${dec(MG)}} = ${dec(n)}\\ \\mathrm{mol}$`,
        `$n(${formulaTex(fT)}) = ${dec(n)} \\cdot \\frac{${nuT}}{${nuG}} = ${dec(nT)}\\ \\mathrm{mol}$`,
        `$m(${formulaTex(fT)}) = ${dec(nT)} \\cdot ${dec(MT)} = ${dec(nT * MT)}\\ \\mathrm{g}$`,
      ],
    };
  }
  if (kind === 2) {
    // Добив в проценти
    const theor = pick([40, 50, 80, 120, 200, 250]);
    const pct = pick([60, 64, 75, 80, 85, 90, 95]);
    const prac = (theor * pct) / 100;
    return {
      tex: '\\eta = ?\\ \\%',
      ask: `Теоретично трябва да се получат ${theor} g продукт, а на практика се получават ${decText(prac)} g. Какъв е добивът в проценти?`,
      num: pct,
      den: 1,
      steps: [`$\\eta = \\frac{m_{\\text{практ}}}{m_{\\text{теор}}} \\cdot 100\\% = \\frac{${dec(prac)}}{${theor}} \\cdot 100\\% = ${pct}\\%$`],
    };
  }
  // Вещество в недостиг: колко мола продукт
  const [eq, a, b, p] = pick<[Eq, number, number, number]>([
    [EQUATIONS[8], 0, 1, 2],
    [EQUATIONS[0], 0, 1, 2],
    [EQUATIONS[12], 0, 1, 2],
    [EQUATIONS[1], 0, 1, 3],
  ]);
  const all = [...eq.left, ...eq.right];
  const [nuA, fA] = all[a];
  const [nuB, fB] = all[b];
  const [nuP, fP] = all[p];
  const nA = nuA * pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const nB = nuB * pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const xi = Math.min(nA / nuA, nB / nuB);
  return {
    tex: `n(${formulaTex(fA)}) = ${dec(nA)}\\ \\mathrm{mol},\\ n(${formulaTex(fB)}) = ${dec(nB)}\\ \\mathrm{mol}`,
    ask: `По уравнението $${eqTex(eq)}$ – колко мола $${formulaTex(fP)}$ се получават най-много?`,
    num: Math.round(nuP * xi * 2),
    den: 2,
    steps: [
      `Сравняваме $n/\\nu$: за $${formulaTex(fA)}$ – $\\frac{${dec(nA)}}{${nuA}} = ${dec(nA / nuA)}$, за $${formulaTex(fB)}$ – $\\frac{${dec(nB)}}{${nuB}} = ${dec(nB / nuB)}$.`,
      nA / nuA === nB / nuB
        ? 'Двете вещества са точно в стехиометрично отношение.'
        : `В недостиг е $${formulaTex(nA / nuA < nB / nuB ? fA : fB)}$ – по него смятаме.`,
      `$n(${formulaTex(fP)}) = ${nuP} \\cdot ${dec(xi)} = ${dec(nuP * xi)}\\ \\mathrm{mol}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🔥 Газовата печка',
    problem: 'Природният газ е почти чист метан, който гори по уравнението CH₄ + 2O₂ → CO₂ + 2H₂O. Колко килограма въглероден диоксид се отделят при изгарянето на 1 kg метан?',
    solution: [
      '$n(\\mathrm{CH_4}) = \\frac{1000\\ \\mathrm{g}}{16\\ \\mathrm{g/mol}} = 62{,}5\\ \\mathrm{mol}$',
      'По уравнението $n(\\mathrm{CO_2}) = n(\\mathrm{CH_4}) = 62{,}5\\ \\mathrm{mol}$',
      '$m(\\mathrm{CO_2}) = 62{,}5 \\cdot 44 = 2750\\ \\mathrm{g} = 2{,}75\\ \\mathrm{kg}$ – почти три пъти повече от масата на газа, защото към всеки въглероден атом се прибавят два кислородни от въздуха.',
    ],
    answer: '$2{,}75\\ \\mathrm{kg}$',
    check: [2.75],
    ask: ['CO₂, kg'],
  },
  {
    title: '🚗 Резервоарът на колата',
    problem: 'Приемете, че бензинът е октан: 2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O. Колко килограма CO₂ се получават от 1 kg октан?',
    solution: [
      '$M(\\mathrm{C_8H_{18}}) = 8 \\cdot 12 + 18 = 114\\ \\mathrm{g/mol}$, $n = \\frac{1000}{114} \\approx 8{,}77\\ \\mathrm{mol}$',
      'От 2 mol октан – 16 mol $\\mathrm{CO_2}$, т.е. 8 пъти повече: $n(\\mathrm{CO_2}) \\approx 70{,}2\\ \\mathrm{mol}$',
      '$m(\\mathrm{CO_2}) \\approx 70{,}2 \\cdot 44 \\approx 3090\\ \\mathrm{g} \\approx 3{,}09\\ \\mathrm{kg}$. Литър бензин тежи около 0,74 kg, така че от него излизат около 2,3 kg $\\mathrm{CO_2}$.',
    ],
    answer: '$\\approx 3{,}09\\ \\mathrm{kg}$',
    check: [3.09],
    ask: ['CO₂, kg'],
  },
  {
    title: '🧁 Содата за хляб',
    problem: 'При нагряване содата бикарбонат се разлага: 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂. Колко грама CO₂ (газа, който подува тестото) се отделят, ако се разложат напълно 8,4 g сода?',
    solution: [
      '$M(\\mathrm{NaHCO_3}) = 23 + 1 + 12 + 48 = 84\\ \\mathrm{g/mol}$, $n = \\frac{8{,}4}{84} = 0{,}1\\ \\mathrm{mol}$',
      'От 2 mol сода – 1 mol $\\mathrm{CO_2}$: $n(\\mathrm{CO_2}) = 0{,}05\\ \\mathrm{mol}$',
      '$m(\\mathrm{CO_2}) = 0{,}05 \\cdot 44 = 2{,}2\\ \\mathrm{g}$. В тестото с кисела съставка (кисело мляко, лимон) содата отделя газ още по-бързо – с киселината.',
    ],
    answer: '$2{,}2\\ \\mathrm{g}$',
    check: [2.2],
    ask: ['CO₂, g'],
  },
  {
    title: '🏗️ Варницата',
    problem: 'Във варница се пече чист варовик: CaCO₃ → CaO + CO₂. Колко килограма негасена вар и колко килограма CO₂ се получават от 1 тон CaCO₃?',
    solution: [
      '$n(\\mathrm{CaCO_3}) = \\frac{10^6\\ \\mathrm{g}}{100\\ \\mathrm{g/mol}} = 10^4\\ \\mathrm{mol}$',
      '$m(\\mathrm{CaO}) = 10^4 \\cdot 56 = 560\\,000\\ \\mathrm{g} = 560\\ \\mathrm{kg}$',
      '$m(\\mathrm{CO_2}) = 10^4 \\cdot 44\\ \\mathrm{g} = 440\\ \\mathrm{kg}$. Проверка: $560 + 440 = 1000\\ \\mathrm{kg}$ – масата се запазва.',
    ],
    answer: '$560\\ \\mathrm{kg}$ CaO и $440\\ \\mathrm{kg}$ CO₂',
    check: [560, 440],
    ask: ['CaO, kg', 'CO₂, kg'],
  },
  {
    title: '🚀 Водород и кислород',
    problem: 'Някои ракетни двигатели горят водород с кислород: 2H₂ + O₂ → 2H₂O. Колко тона кислород са нужни за пълното изгаряне на 1 тон водород?',
    solution: [
      'По уравнението 2 mol $\\mathrm{H_2}$ (4 g) реагират с 1 mol $\\mathrm{O_2}$ (32 g) – масово отношение $4 : 32 = 1 : 8$.',
      'За 1 t водород – 8 t кислород.',
      'Реалните двигатели обикновено работят с излишък на водород (масово отношение кислород : водород около 6 : 1): така газовете са по-леки и излитат по-бързо.',
    ],
    answer: '$8\\ \\mathrm{t}$',
    check: [8],
    ask: ['O₂, t'],
  },
  {
    title: '💊 Аспиринът в лабораторията',
    problem: 'Ученици получават аспирин (C₉H₈O₄, M = 180 g/mol) от 13,8 g салицилова киселина (C₇H₆O₃, M = 138 g/mol); от 1 mol киселина се получава 1 mol аспирин. След пречистване имат 14,4 g аспирин. Колко е теоретичният добив и какъв е добивът в проценти?',
    solution: [
      '$n = \\frac{13{,}8}{138} = 0{,}1\\ \\mathrm{mol}$, теоретично $m = 0{,}1 \\cdot 180 = 18{,}0\\ \\mathrm{g}$',
      '$\\eta = \\frac{14{,}4}{18{,}0} \\cdot 100\\% = 80\\%$ – добър резултат за ученическа лаборатория.',
    ],
    answer: '$18{,}0\\ \\mathrm{g}$, $80\\%$',
    check: [18, 80],
    ask: ['теоретично, g', 'добив, %'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво гласи законът за запазване на масата?',
    answers: [
      'масата на веществата преди реакцията е равна на масата на веществата след нея',
      'масата на продуктите винаги е по-голяма от тази на реагентите',
      'при реакция се запазва броят на молекулите',
      'масата на всяко вещество остава същата',
    ],
    correctAnswer: 'масата на веществата преди реакцията е равна на масата на веществата след нея',
  },
  {
    question: 'Колко кислородни атома има в $3\\mathrm{H_2SO_4}$?',
    answers: ['$12$', '$4$', '$7$', '$3$'],
    correctAnswer: '$12$',
  },
  {
    question: 'Кои са коефициентите в изравненото уравнение $\\mathrm{Fe} + \\mathrm{O_2} \\to \\mathrm{Fe_2O_3}$?',
    answers: ['$4,\\ 3,\\ 2$', '$2,\\ 3,\\ 1$', '$4,\\ 3,\\ 4$', '$2,\\ 1,\\ 1$'],
    correctAnswer: '$4,\\ 3,\\ 2$',
  },
  {
    question: 'Кое е забранено при изравняване на уравнение?',
    answers: ['да променяме индексите във формулите', 'да поставяме коефициент пред формула', 'да умножим всички коефициенти по 2', 'временно да използваме дробен коефициент'],
    correctAnswer: 'да променяме индексите във формулите',
  },
  {
    question: 'По уравнението $2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}$ колко мола вода се получават от 3 mol кислород (с достатъчно водород)?',
    answers: ['$6\\ \\mathrm{mol}$', '$3\\ \\mathrm{mol}$', '$1{,}5\\ \\mathrm{mol}$', '$2\\ \\mathrm{mol}$'],
    correctAnswer: '$6\\ \\mathrm{mol}$',
  },
  {
    question: 'Смесват се 2 mol $\\mathrm{H_2}$ и 2 mol $\\mathrm{O_2}$ ($2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}$). Кое вещество е в недостиг?',
    answers: ['водородът', 'кислородът', 'нито едно', 'и двете'],
    correctAnswer: 'водородът',
  },
  {
    question: 'Теоретично трябва да се получат 50 g продукт, а се получават 40 g. Какъв е добивът?',
    answers: ['$80\\%$', '$125\\%$', '$40\\%$', '$90\\%$'],
    correctAnswer: '$80\\%$',
  },
  {
    question: 'Какво показват коефициентите в химичното уравнение?',
    answers: ['отношението на количествата вещество (броя частици)', 'отношението на масите', 'отношението на плътностите', 'броя на атомите в една молекула'],
    correctAnswer: 'отношението на количествата вещество (броя частици)',
  },
  {
    question: 'Желязо ръждясва в отворен съд. Какво става с масата на твърдото вещество?',
    answers: ['увеличава се – желязото се свързва с кислород от въздуха', 'намалява – част от желязото изчезва', 'не се променя', 'увеличава се – получава се маса от нищото'],
    correctAnswer: 'увеличава се – желязото се свързва с кислород от въздуха',
  },
];

// ---------- Страница ----------

export function Stoichiometry() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Химични уравнения и стехиометрия</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚖️ През 1774 г. Антоан Лавоазие запечатва парче калай в стъклен съд и го претегля. После дълго го нагрява: металът се покрива с
            белезникав прах. Претегля отново – масата на затворения съд е същата. Едва когато отваря съда, въздухът нахлува и масата се
            увеличава – с колкото е натежал металът. Около век по-рано Робърт Бойл прави подобни опити, но претегля отворени съдове и решава, че
            металът поглъща „частици огън“. Лавоазие стига до друг извод: металът се свързва с част от въздуха, а{' '}
            <strong>в реакцията нищо не изчезва и нищо не се създава</strong>. На този закон стъпва всяко химично изчисление.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Химична реакция и химично уравнение</h2>
          <p className={text}>
            При <Term id="chemical-reaction">химичната реакция</Term> атомите не се появяват и не изчезват – те само се прегрупират в нови
            вещества. Веществата, които влизат в реакцията, са <strong>реагенти</strong>, а новите – <strong>продукти</strong>.
          </p>
          <Theorem
            type="definition"
            title="Химично уравнение"
            description="Химичното уравнение е кратък запис на реакцията с формули: реагентите отляво, продуктите отдясно, между тях стрелка. Коефициентите пред формулите показват в какво отношение реагират и се получават веществата. Понякога над стрелката се пишат условията ($t^\circ$ – нагряване, кат. – катализатор), а след формулата – ↑ за отделен газ и ↓ за утайка."
          />
          <Example
            description="Да запишем с уравнение: „Магнезият гори във въздуха с ярък пламък и се получава магнезиев оксид.“"
            steps={[
              'Реагенти: магнезий $\\mathrm{Mg}$ и кислород $\\mathrm{O_2}$ (кислородът като просто вещество е от двуатомни молекули). Продукт: $\\mathrm{MgO}$.',
              'Схема: $\\mathrm{Mg} + \\mathrm{O_2} \\to \\mathrm{MgO}$ – отляво има 2 атома кислород, отдясно 1.',
              'Изравняваме: $2\\mathrm{Mg} + \\mathrm{O_2} \\to 2\\mathrm{MgO}$ – сега има по 2 атома Mg и O от двете страни.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Закон за запазване на масата</h2>
          <Theorem
            title="Закон за запазване на масата"
            description="Масата на веществата, които са влезли в реакция, е равна на масата на веществата, които са се получили: $\sum m_{\text{реагенти}} = \sum m_{\text{продукти}}$. Причината е, че атомите се запазват – само се свързват по нов начин."
          />
          <p className={text}>
            Ако масата сякаш се променя, значи някой участник е избягал или е дошъл отвън: при горенето на дърва „изчезват“ газовете
            въглероден диоксид и водна пара, а ръждясващият пирон натежава, защото към желязото се прибавя кислород от въздуха. Подобни опити
            със затворени съдове прави и Михаил Ломоносов (1756), но неговите резултати остават почти непознати извън Русия.
          </p>
          <Theorem
            title="Закон за постоянство на състава"
            description="Всяко химично съединение, получено по какъвто и да е начин, има един и същ състав: водата винаги съдържа водород и кислород в масово отношение $1 : 8$. Законът е формулиран от Жозеф Пруст в края на XVIII век."
          />
          <Example
            description="4 g водород изгарят напълно в 32 g кислород. Колко грама вода се получават?"
            steps={['Според закона за запазване на масата: $m(\\mathrm{H_2O}) = 4 + 32 = 36\\ \\mathrm{g}$.', 'Отношението $4 : 32 = 1 : 8$ е точно масовото отношение на водорода и кислорода във водата.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Изравняване на уравнения</h2>
          <p className={text}>
            Щом атомите се запазват, от всеки елемент трябва да има <strong>еднакъв брой атоми</strong> отляво и отдясно. Постигаме го с
            коефициенти. Коефициентът умножава цялата формула: в <Tex>{'3\\mathrm{H_2O}'}</Tex> има <Tex>{'3 \\cdot 2 = 6'}</Tex> атома водород и
            3 атома кислород.
          </p>
          <Theorem
            title="Как се изравнява уравнение"
            description="1) Пишем верните формули – индексите в тях после не се пипат, иначе получаваме друго вещество ($\mathrm{H_2O_2}$ е водороден пероксид, а не вода). 2) Започваме с елемента, който се среща в най-малко вещества; водорода и кислорода оставяме за накрая. 3) Поставяме коефициенти, докато всички елементи се изравнят. 4) Проверяваме и съкращаваме до най-малките цели числа."
          />
          <Example
            description="Да изравним горенето на пропан: $\mathrm{C_3H_8} + \mathrm{O_2} \to \mathrm{CO_2} + \mathrm{H_2O}$."
            steps={[
              'Въглерод: отляво 3 → пишем $3\\mathrm{CO_2}$.',
              'Водород: отляво 8 → пишем $4\\mathrm{H_2O}$.',
              'Кислород: отдясно $3 \\cdot 2 + 4 = 10$ атома → отляво $5\\mathrm{O_2}$.',
              '$\\mathrm{C_3H_8} + 5\\mathrm{O_2} \\to 3\\mathrm{CO_2} + 4\\mathrm{H_2O}$ – проверка: C 3 = 3, H 8 = 8, O 10 = 10 ✓',
            ]}
          />
          <Example
            description="Трикът с дробния коефициент: $\mathrm{C_2H_6} + \mathrm{O_2} \to \mathrm{CO_2} + \mathrm{H_2O}$."
            steps={[
              'C и H: $\\mathrm{C_2H_6} + \\mathrm{O_2} \\to 2\\mathrm{CO_2} + 3\\mathrm{H_2O}$ – отдясно има $4 + 3 = 7$ атома кислород.',
              'Временно пишем $\\frac{7}{2}\\mathrm{O_2}$ – така отляво също стават 7.',
              'Умножаваме всичко по 2: $2\\mathrm{C_2H_6} + 7\\mathrm{O_2} \\to 4\\mathrm{CO_2} + 6\\mathrm{H_2O}$.',
            ]}
          />
          <BalancerLab />
          <p className={text}>
            Уравненията на окислително-редукционните реакции (например на метал с азотна <Term id="acid">киселина</Term>) по-лесно се изравняват с <Term id="electron-balance">електронен баланс</Term> –
            той е в отделен урок. Пробният метод по-горе работи за повечето уравнения в този урок.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Какво показват коефициентите</h2>
          <p className={text}>
            Уравнението <Tex>{'2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}'}</Tex> може да се прочете на три нива: 2 молекули водород и 1
            молекула кислород дават 2 молекули вода; 2 <Term id="mole">мола</Term> водород и 1 мол кислород дават 2 мола вода; 4 g водород и 32
            g кислород дават 36 g вода. Коефициентите са отношение на <strong>количествата вещество</strong>, а не на масите. Как се минава от
            маса към <Term id="amount-of-substance">количество вещество</Term>, видяхме в урока{' '}
            <Link to="/chemistry/quantities/mole" className={link}>
              Мол и моларна маса
            </Link>
            .
          </p>
          <Theorem
            title="Стехиометрично отношение"
            description="За всеки две вещества A и B в реакцията с коефициенти $\nu_A$ и $\nu_B$: $\frac{n(\mathrm{A})}{\nu_A} = \frac{n(\mathrm{B})}{\nu_B}$. Пресмятане по уравнение: маса на A → $n(\mathrm{A}) = \frac{m}{M}$ → $n(\mathrm{B}) = n(\mathrm{A}) \cdot \frac{\nu_B}{\nu_A}$ → маса на B $= n(\mathrm{B}) \cdot M(\mathrm{B})$."
          />
          <Example
            description="Колко грама негасена вар CaO се получават при разлагането на 50 g CaCO₃ ($\mathrm{CaCO_3} \to \mathrm{CaO} + \mathrm{CO_2}$)?"
            steps={[
              '$M(\\mathrm{CaCO_3}) = 40 + 12 + 3 \\cdot 16 = 100\\ \\mathrm{g/mol}$, $n = \\frac{50}{100} = 0{,}5\\ \\mathrm{mol}$',
              'Коефициентите са 1 : 1 → $n(\\mathrm{CaO}) = 0{,}5\\ \\mathrm{mol}$',
              '$m(\\mathrm{CaO}) = 0{,}5 \\cdot 56 = 28\\ \\mathrm{g}$; останалите 22 g са въглероден диоксид.',
            ]}
          />
          <p className={text}>
            Ако едно от веществата е газ, по-удобно е да смятаме с обема му – как, ще видим в урока{' '}
            <Link to="/chemistry/quantities/gases" className={link}>
              Газове в химията
            </Link>
            ; за реакции в разтвори – в{' '}
            <Link to="/chemistry/quantities/solutions" className={link}>
              Разтвори и концентрации
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Вещество в недостиг и в излишък</h2>
          <p className={text}>
            Имаш 10 филийки хляб и 3 парчета кашкавал. Колко сандвича (2 филийки + 1 кашкавал) ще направиш? Три – кашкавалът свършва първи,
            а 4 филийки остават. Същото е и с реакциите: обикновено едното вещество свършва първо и спира реакцията.
          </p>
          <Theorem
            type="definition"
            title="Вещество в недостиг"
            description="Веществото в недостиг се изразходва напълно и определя колко продукт ще се получи. Намираме го, като сравним $\frac{n}{\nu}$ на реагентите: в недостиг е това с по-малко $\frac{n}{\nu}$. Останалите реагенти са в излишък – част от тях остава."
          />
          <Example
            description="Смесват се 10 g водород и 64 g кислород и сместа се взривява ($2\mathrm{H_2} + \mathrm{O_2} \to 2\mathrm{H_2O}$). Колко вода се получава и какво остава?"
            steps={[
              '$n(\\mathrm{H_2}) = \\frac{10}{2} = 5\\ \\mathrm{mol}$, $n(\\mathrm{O_2}) = \\frac{64}{32} = 2\\ \\mathrm{mol}$',
              '$\\frac{n}{\\nu}$: за водорода $\\frac{5}{2} = 2{,}5$, за кислорода $\\frac{2}{1} = 2$ → кислородът е в недостиг.',
              '2 mol $\\mathrm{O_2}$ реагират с 4 mol $\\mathrm{H_2}$ и дават 4 mol вода: $4 \\cdot 18 = 72\\ \\mathrm{g}$.',
              'Остава 1 mol = 2 g водород. Проверка: $10 + 64 = 72 + 2$ ✓',
            ]}
          />
          <LimitingReagentLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Добив и чистота</h2>
          <p className={text}>
            Масата, която пресмятаме по уравнението, е <strong>теоретичният добив</strong> – толкова би се получило, ако всичко реагира
            идеално. В действителност част от реагентите не реагират, протичат странични реакции, а при <Term id="filtration">филтруване</Term> и пречистване се губи
            продукт.
          </p>
          <Theorem
            title="Добив и чистота"
            description="Добивът е $\eta = \frac{m_{\text{практ}}}{m_{\text{теор}}} \cdot 100\%$. Суровините често съдържат примеси; по уравнението смятаме само чистото вещество: $m_{\text{чисто}} = w \cdot m_{\text{проба}}$, където $w$ е масовата му част."
          />
          <Example
            description="От 1 t варовик с 90% CaCO₃ се получава негасена вар с добив 85%. Колко килограма CaO се получават?"
            steps={[
              'Чист $\\mathrm{CaCO_3}$: $0{,}90 \\cdot 1000 = 900\\ \\mathrm{kg}$, т.е. $9\\ \\mathrm{kmol}$',
              'Теоретично: $9 \\cdot 56 = 504\\ \\mathrm{kg}$ CaO',
              'Практически: $504 \\cdot 0{,}85 = 428{,}4\\ \\mathrm{kg}$',
            ]}
          />
          <ReactionYieldLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Намери липсващия коефициент, масата или количеството на продукта, или добива. Десетичните отговори въвеждай като 2,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Уравненията около нас</h2>
          <p className={text}>С изчисленията по уравнение се планира производството във всеки завод – и се пресмятат емисиите на CO₂.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Промяна на индекс', '$\\mathrm{H_2} + \\mathrm{O_2} \\to \\mathrm{H_2O_2}$ – „изравнено“', '$2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}$ – променят се само коефициентите'],
              ['Коефициент и индекс', 'В $3\\mathrm{H_2O}$ има 6 атома H и 1 атом O.', 'В $3\\mathrm{H_2O}$ има 6 атома H и 3 атома O – коефициентът умножава цялата формула.'],
              ['Отношение на масите', '$2\\mathrm{H_2} + \\mathrm{O_2}$: 2 g водород реагират с 1 g кислород.', '2 mol (4 g) водород реагират с 1 mol (32 g) кислород.'],
              ['Недостиг по маса', 'В недостиг е веществото с по-малка маса.', 'Сравняваме $\\frac{n}{\\nu}$, не масите.'],
              ['Примесите', 'Смятаме по масата на цялата руда.', 'Първо намираме масата на чистото вещество: $m = w \\cdot m_{\\text{проба}}$.'],
              ['Добив', 'Нужната суровина е $m_{\\text{теор}} \\cdot \\eta$.', 'При добив под 100% суровината е повече: делим на $\\eta$.'],
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
              <Task id="a1" number={1} color="border-green-500" question="Изравнете уравнението $\mathrm{Al} + \mathrm{O_2} \to \mathrm{Al_2O_3}$." check={[4, 3, 2]} ask={['пред $\\mathrm{Al}$', 'пред $\\mathrm{O_2}$', 'пред $\\mathrm{Al_2O_3}$']}>
                <p>Кислородът е 2 отляво и 3 отдясно – най-малкото общо кратно е 6: <Tex>{'3\\mathrm{O_2}'}</Tex> и <Tex>{'2\\mathrm{Al_2O_3}'}</Tex>.</p>
                <p>Отдясно вече има 4 атома алуминий: <Tex>{'4\\mathrm{Al} + 3\\mathrm{O_2} \\to 2\\mathrm{Al_2O_3}'}</Tex>.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко грама магнезиев оксид се получават при изгарянето на 12 g магнезий ($2\mathrm{Mg} + \mathrm{O_2} \to 2\mathrm{MgO}$)?" check={[20]} ask={['MgO, g']}>
                <p><Tex>{'n(\\mathrm{Mg}) = \\frac{12}{24} = 0{,}5\\ \\mathrm{mol}'}</Tex>; коефициентите на Mg и MgO са равни → <Tex>{'n(\\mathrm{MgO}) = 0{,}5\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'m(\\mathrm{MgO}) = 0{,}5 \\cdot 40 = 20\\ \\mathrm{g}'}</Tex> – с 8 g повече от магнезия: толкова кислород се е свързал.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Въглерод с маса 6 g изгаря напълно: $\mathrm{C} + \mathrm{O_2} \to \mathrm{CO_2}$. Колко грама кислород реагират и колко грама CO₂ се получават?" check={[16, 22]} ask={['O₂, g', 'CO₂, g']}>
                <p><Tex>{'n(\\mathrm{C}) = \\frac{6}{12} = 0{,}5\\ \\mathrm{mol}'}</Tex> → <Tex>{'n(\\mathrm{O_2}) = n(\\mathrm{CO_2}) = 0{,}5\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{O_2}) = 0{,}5 \\cdot 32 = 16\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\mathrm{CO_2}) = 0{,}5 \\cdot 44 = 22\\ \\mathrm{g}'}</Tex></p>
                <p>Проверка: <Tex>{'6 + 16 = 22'}</Tex> ✓</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Смесват се 6 g водород и 64 g кислород и сместа се взривява. Колко грама вода се получават и колко грама от кое вещество остават?" check={[54, 16]} ask={['вода, g', 'остатък, g']}>
                <p><Tex>{'n(\\mathrm{H_2}) = 3\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{O_2}) = 2\\ \\mathrm{mol}'}</Tex>; <Tex>{'\\frac{n}{\\nu}'}</Tex>: <Tex>{'\\frac{3}{2} = 1{,}5'}</Tex> за водорода и 2 за кислорода → водородът е в недостиг.</p>
                <p>3 mol водород дават 3 mol вода: <Tex>{'3 \\cdot 18 = 54\\ \\mathrm{g}'}</Tex>, и изразходват 1,5 mol кислород.</p>
                <p>Остават <Tex>{'0{,}5\\ \\mathrm{mol} \\cdot 32 = 16\\ \\mathrm{g}'}</Tex> кислород. Проверка: <Tex>{'6 + 64 = 54 + 16'}</Tex> ✓</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Към 6,5 g цинк се прибавят 36,5 g 10% солна киселина ($\mathrm{Zn} + 2\mathrm{HCl} \to \mathrm{ZnCl_2} + \mathrm{H_2}$). Колко грама водород се отделят и колко грама цинк остават?" check={[0.1, 3.25]} ask={['H₂, g', 'Zn, g']}>
                <p><Tex>{'n(\\mathrm{Zn}) = \\frac{6{,}5}{65} = 0{,}1\\ \\mathrm{mol}'}</Tex>; <Tex>{'m(\\mathrm{HCl}) = 0{,}1 \\cdot 36{,}5 = 3{,}65\\ \\mathrm{g}'}</Tex>, <Tex>{'n(\\mathrm{HCl}) = 0{,}1\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'\\frac{n}{\\nu}'}</Tex>: 0,1 за цинка и <Tex>{'\\frac{0{,}1}{2} = 0{,}05'}</Tex> за киселината → киселината е в недостиг.</p>
                <p><Tex>{'n(\\mathrm{H_2}) = 0{,}05\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}05 \\cdot 2 = 0{,}1\\ \\mathrm{g}'}</Tex>; реагират 0,05 mol цинк, остават <Tex>{'0{,}05 \\cdot 65 = 3{,}25\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="От 250 kg варовик с 80% CaCO₃ са получени 95,2 kg CaO. Колко е теоретичният добив на CaO и какъв е добивът в проценти?" check={[112, 85]} ask={['теоретично, kg', 'добив, %']}>
                <p>Чист <Tex>{'\\mathrm{CaCO_3}'}</Tex>: <Tex>{'0{,}80 \\cdot 250 = 200\\ \\mathrm{kg}'}</Tex> = 2 kmol.</p>
                <p>Теоретично: <Tex>{'2 \\cdot 56 = 112\\ \\mathrm{kg}'}</Tex> CaO.</p>
                <p><Tex>{'\\eta = \\frac{95{,}2}{112} \\cdot 100\\% = 85\\%'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Сярна киселина се получава от пирит на три етапа: $4\mathrm{FeS_2} + 11\mathrm{O_2} \to 2\mathrm{Fe_2O_3} + 8\mathrm{SO_2}$, $2\mathrm{SO_2} + \mathrm{O_2} \to 2\mathrm{SO_3}$, $\mathrm{SO_3} + \mathrm{H_2O} \to \mathrm{H_2SO_4}$. Колко тона $\mathrm{H_2SO_4}$ се получават от 1 t пирит с 90% $\mathrm{FeS_2}$, ако общият добив е 80%?" check={[1.18]} ask={['H₂SO₄, t']}>
                <p>Не е нужно да смятаме всеки етап: сярата се запазва, а всеки атом S от пирита стига до една молекула киселина: <Tex>{'\\mathrm{FeS_2} \\to 2\\mathrm{H_2SO_4}'}</Tex>.</p>
                <p><Tex>{'m(\\mathrm{FeS_2}) = 900\\ \\mathrm{kg}'}</Tex>, <Tex>{'M = 56 + 64 = 120'}</Tex>, <Tex>{'n = 7{,}5\\ \\mathrm{kmol}'}</Tex> → теоретично 15 kmol киселина.</p>
                <p><Tex>{'m = 15 \\cdot 98 \\cdot 0{,}80 = 1176\\ \\mathrm{kg} \\approx 1{,}18\\ \\mathrm{t}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Смес от магнезий и цинк с маса 10,0 g реагира с излишък солна киселина и отделя 0,400 g водород. И двата метала реагират като $\mathrm{M} + 2\mathrm{HCl} \to \mathrm{MCl_2} + \mathrm{H_2}$. Колко грама магнезий има в сместа и каква е масовата му част?" check={[1.76, 17.6]} ask={['Mg, g', '$w$(Mg), %']}>
                <p><Tex>{'n(\\mathrm{H_2}) = \\frac{0{,}400}{2} = 0{,}200\\ \\mathrm{mol}'}</Tex> = общото количество на металите.</p>
                <p>Нека <Tex>{'m(\\mathrm{Mg}) = x'}</Tex>: <Tex>{'\\frac{x}{24} + \\frac{10{,}0 - x}{65} = 0{,}200'}</Tex>.</p>
                <p><Tex>{'x\\left(\\frac{1}{24} - \\frac{1}{65}\\right) = 0{,}200 - 0{,}1538'}</Tex>, откъдето <Tex>{'x \\approx 1{,}76\\ \\mathrm{g}'}</Tex>, <Tex>{'w \\approx 17{,}6\\%'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Смес от $\mathrm{KClO_3}$ и $\mathrm{KCl}$ с маса 20,0 g се нагрява до пълно разлагане на хлората ($2\mathrm{KClO_3} \to 2\mathrm{KCl} + 3\mathrm{O_2}$). Твърдият остатък тежи 15,2 g. Колко грама $\mathrm{KClO_3}$ е имало и каква е масовата му част?" check={[12.3, 61.3]} ask={['KClO₃, g', '$w$, %']}>
                <p>Масата намалява само заради отделения кислород: <Tex>{'m(\\mathrm{O_2}) = 20{,}0 - 15{,}2 = 4{,}8\\ \\mathrm{g}'}</Tex> = 0,15 mol.</p>
                <p>По уравнението <Tex>{'n(\\mathrm{KClO_3}) = \\frac{2}{3} \\cdot 0{,}15 = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}1 \\cdot 122{,}5 = 12{,}25 \\approx 12{,}3\\ \\mathrm{g}'}</Tex>.</p>
                <p><Tex>{'w = \\frac{12{,}25}{20{,}0} = 61{,}25\\% \\approx 61{,}3\\%'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ При реакция атомите се запазват, затова масата на реагентите е равна на масата на продуктите</li>
              <li>✓ Уравненията се изравняват само с коефициенти; индексите във формулите не се променят</li>
              <li>✓ Коефициентите са отношение на количествата вещество: <Tex>{'\\frac{n(\\mathrm{A})}{\\nu_A} = \\frac{n(\\mathrm{B})}{\\nu_B}'}</Tex></li>
              <li>✓ Пресмятане по уравнение: маса → mol → mol → маса</li>
              <li>✓ Веществото с по-малко <Tex>{'\\frac{n}{\\nu}'}</Tex> е в недостиг и определя количеството продукт</li>
              <li>✓ Добив <Tex>{'\\eta = \\frac{m_{\\text{практ}}}{m_{\\text{теор}}}'}</Tex>; по уравнението се смята само <Term id="pure-substance">чистото вещество</Term></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Лавоазие е бил не само химик, но и съдружник в компанията, която събирала данъци за краля. По време на Френската революция това
              му струва живота: гилотиниран е на 8 май 1794 г. Разказват, че математикът Лагранж казал: „Трябваше им само миг, за да отсекат
              тази глава, а може и сто години да не се роди друга като нея.“ Лавоазие оставя и един от първите списъци на <Term id="chemical-element">химичните елементи</Term> и името на
              кислорода.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
