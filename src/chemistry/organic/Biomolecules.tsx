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
import DnaLab from './DnaLab';
import FoodEnergyLab from './FoodEnergyLab';
import GlucoseForms from './GlucoseForms';
import PeptideLab from './PeptideLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');

/** Аминокиселини с моларните им маси (C 12, H 1, N 14, O 16, S 32). */
const AMINO: [string, string, number][] = [
  ['Gly', 'глицин', 75],
  ['Ala', 'аланин', 89],
  ['Ser', 'серин', 105],
  ['Cys', 'цистеин', 121],
  ['Val', 'валин', 117],
  ['Leu', 'левцин', 131],
  ['Phe', 'фенилаланин', 165],
  ['Lys', 'лизин', 146],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const n = randInt(2, 3);
    const chain = Array.from({ length: n }, () => pick(AMINO));
    const sum = chain.reduce((s, a) => s + a[2], 0);
    const M = sum - 18 * (n - 1);
    return {
      tex: `\\text{${chain.map(a => a[0]).join('–')}}`,
      ask: `Моларна маса на пептида в g/mol? (${chain.map(a => `M(${a[0]}) = ${a[2]}`).join(', ')})`,
      num: M,
      den: 1,
      steps: [`Пептидните връзки са $${n - 1}$ – отделят се $${n - 1}$ молекули вода.`, `$M = ${chain.map(a => a[2]).join(' + ')} - ${n - 1} \\cdot 18 = ${M}\\ \\mathrm{g/mol}$`],
    };
  }
  if (kind === 1) {
    const A = pick([15, 18, 20, 22, 25, 28, 30, 32, 35]);
    return {
      tex: `\\%\\mathrm{A} = ${A}\\%\\ \\text{(двойна ДНК)}`,
      ask: 'Колко процента от нуклеотидите са с гуанин?',
      num: 50 - A,
      den: 1,
      steps: [`По правилото на Чаргаф $\\%\\mathrm{T} = \\%\\mathrm{A} = ${A}\\%$.`, `$\\%\\mathrm{G} = \\%\\mathrm{C} = \\frac{100 - 2 \\cdot ${A}}{2} = ${50 - A}\\%$`],
    };
  }
  if (kind === 2) {
    const x = randInt(5, 40);
    const y = randInt(5, 40);
    return {
      tex: `${x}\\ \\text{двойки A–T},\\ ${y}\\ \\text{двойки G–C}`,
      ask: 'Колко водородни връзки има между двете вериги?',
      num: 2 * x + 3 * y,
      den: 1,
      steps: [`A–T: по 2 връзки, G–C: по 3 връзки.`, `$${x} \\cdot 2 + ${y} \\cdot 3 = ${2 * x + 3 * y}$`],
    };
  }
  if (kind === 3) {
    const c = randInt(5, 60);
    const f = randInt(1, 30);
    const p = randInt(2, 25);
    const E = 17 * c + 37 * f + 17 * p;
    return {
      tex: `${c}\\ \\mathrm{g},\\ ${f}\\ \\mathrm{g},\\ ${p}\\ \\mathrm{g}`,
      ask: `Храна съдържа ${c} g въглехидрати, ${f} g мазнини и ${p} g белтъци. Колко kJ енергия дава?`,
      num: E,
      den: 1,
      steps: [`$E = 17 \\cdot ${c} + 37 \\cdot ${f} + 17 \\cdot ${p} = ${E}\\ \\mathrm{kJ}$`],
    };
  }
  if (kind === 4) {
    const n100 = pick([25, 50, 100, 200, 300]);
    const n = n100 / 100;
    return {
      tex: `m(\\mathrm{CO_2}) = ${dec(264 * n)}\\ \\mathrm{g}`,
      ask: 'Колко грама глюкоза се образуват при фотосинтезата?',
      num: 180 * n100,
      den: 100,
      steps: [
        '$\\mathrm{6CO_2 + 6H_2O \\to C_6H_{12}O_6 + 6O_2}$',
        `$n(\\mathrm{CO_2}) = \\frac{${dec(264 * n)}}{44} = ${dec(6 * n)}\\ \\mathrm{mol}$, $n(\\text{глюкоза}) = \\frac{${dec(6 * n)}}{6} = ${dec(n)}\\ \\mathrm{mol}$`,
        `$m = ${dec(n)} \\cdot 180 = ${dec(180 * n)}\\ \\mathrm{g}$`,
      ],
    };
  }
  const n100 = pick([10, 20, 50, 100, 200]);
  const n = n100 / 100;
  return {
    tex: `m(\\text{тристеарин}) = ${dec(890 * n)}\\ \\mathrm{g}`,
    ask: 'Колко грама натриев стеарат (сапун) се получават при осапуняването? (M = 890 и 306 g/mol)',
    num: 918 * n100,
    den: 100,
    steps: [`$n = \\frac{${dec(890 * n)}}{890} = ${dec(n)}\\ \\mathrm{mol}$; от 1 mol мазнина се получават 3 mol сапун.`, `$m = 3 \\cdot ${dec(n)} \\cdot 306 = ${dec(918 * n)}\\ \\mathrm{g}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🍞 От нишесте до глюкоза',
    problem: 'При храносмилането нишестето се разгражда до глюкоза: (C₆H₁₀O₅)ₙ + nH₂O → nC₆H₁₂O₆. Колко грама глюкоза се получават от 100 g нишесте?',
    solution: ['На всяко звено $\\mathrm{C_6H_{10}O_5}$ ($162\\ \\mathrm{g/mol}$) се получава една молекула глюкоза ($180\\ \\mathrm{g/mol}$).', '$m = 100 \\cdot \\frac{180}{162} \\approx 111{,}1\\ \\mathrm{g}$ – масата расте заради присъединената вода.'],
    answer: '$\\approx 111{,}1\\ \\mathrm{g}$',
    check: [111.1],
    ask: ['глюкоза, g'],
  },
  {
    title: '🍇 Гроздова мъст',
    problem: 'Литър гроздова мъст съдържа 180 g захар (смятайте я за глюкоза), която ферментира напълно: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. Колко грама етанол се получават и какъв е обемът му (ρ = 0,79 g/mL)?',
    solution: ['$n(\\text{глюкоза}) = \\frac{180}{180} = 1\\ \\mathrm{mol}$, $n(\\mathrm{C_2H_5OH}) = 2\\ \\mathrm{mol}$', '$m = 2 \\cdot 46 = 92\\ \\mathrm{g}$, $V = \\frac{92}{0{,}79} \\approx 116{,}5\\ \\mathrm{mL}$', 'Това е около 11–12 обемни процента – типично за сухо вино. В действителност част от захарта остава или отива за дрождите.'],
    answer: '$92\\ \\mathrm{g}$, $\\approx 116{,}5\\ \\mathrm{mL}$',
    check: [92, 116.5],
    ask: ['етанол, g', 'етанол, mL'],
  },
  {
    title: '🧼 Сапунена фабрика',
    problem: 'Фабрика осапунява 445 kg тристеарин (M = 890 g/mol) с натриева основа. Колко килограма натриев стеарат (M = 306 g/mol) и колко килограма глицерол (M = 92 g/mol) се получават?',
    solution: ['$n = \\frac{445}{890} = 0{,}5\\ \\mathrm{kmol}$', 'Сапун: $3 \\cdot 0{,}5 \\cdot 306 = 459\\ \\mathrm{kg}$', 'Глицерол: $0{,}5 \\cdot 92 = 46\\ \\mathrm{kg}$ – ценен страничен продукт за козметиката.'],
    answer: '$459\\ \\mathrm{kg}$ сапун, $46\\ \\mathrm{kg}$ глицерол',
    check: [459, 46],
    ask: ['сапун, kg', 'глицерол, kg'],
  },
  {
    title: '🍫 Едно шоколадче',
    problem: 'В 100 g млечен шоколад има около 57 g въглехидрати, 30 g мазнини и 7,5 g белтъци. Колко kJ и колко kcal дава блокче от 25 g? (17 kJ и 4 kcal за грам въглехидрати и белтъци, 37 kJ и 9 kcal за грам мазнини)',
    solution: ['На 100 g: $17 \\cdot 57 + 37 \\cdot 30 + 17 \\cdot 7{,}5 = 2206{,}5\\ \\mathrm{kJ}$', 'Блокчето е четвърт от това: $\\approx 551{,}6\\ \\mathrm{kJ}$', 'В kcal: $\\frac{4 \\cdot 57 + 9 \\cdot 30 + 4 \\cdot 7{,}5}{4} = 132\\ \\mathrm{kcal}$ – повече от половината идват от мазнините.'],
    answer: '$\\approx 551{,}6\\ \\mathrm{kJ}$, $132\\ \\mathrm{kcal}$',
    check: [551.6, 132],
    ask: ['енергия, kJ', 'енергия, kcal'],
  },
  {
    title: '🧬 Колко е дълга ДНК в една клетка',
    problem: 'В ядрото на една човешка клетка има около 6,4 милиарда двойки бази, а на всяка двойка се падат около 0,34 nm дължина на двойната спирала. Каква е общата дължина на ДНК в метри?',
    solution: ['$L = 6{,}4 \\cdot 10^{9} \\cdot 0{,}34 \\cdot 10^{-9}\\ \\mathrm{m} \\approx 2{,}18\\ \\mathrm{m}$', 'Около два метра ДНК са навити в ядро с диаметър няколко микрометра – благодарение на белтъци, около които нишката се навива.'],
    answer: '$\\approx 2{,}18\\ \\mathrm{m}$',
    check: [2.18],
    ask: ['дължина, m'],
  },
  {
    title: '🏃 Кислород за една закуска',
    problem: 'Колко литра кислород (при нормални условия) са нужни, за да се „изгорят“ в клетките 90 g глюкоза: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O?',
    solution: ['$n(\\text{глюкоза}) = \\frac{90}{180} = 0{,}5\\ \\mathrm{mol}$, $n(\\mathrm{O_2}) = 6 \\cdot 0{,}5 = 3\\ \\mathrm{mol}$', '$V = 3 \\cdot 22{,}4 = 67{,}2\\ \\mathrm{L}$ – толкова кислород има в около 320 L въздух.'],
    answer: '$67{,}2\\ \\mathrm{L}$',
    check: [67.2],
    ask: ['кислород, L'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'От какъв мономер са изградени нишестето и целулозата?',
    answers: ['глюкоза', 'фруктоза', 'захароза', 'глицерол'],
    correctAnswer: 'глюкоза',
  },
  {
    question: 'Кое от тези вещества НЕ е полимер?',
    answers: ['мазнините', 'нишестето', 'белтъците', 'ДНК'],
    correctAnswer: 'мазнините',
  },
  {
    question: 'С колко водородни връзки се свързват гуанинът и цитозинът?',
    answers: ['$3$', '$2$', '$1$', '$4$'],
    correctAnswer: '$3$',
  },
  {
    question: 'Как изглежда пептидната връзка?',
    answers: ['$\\mathrm{-CO-NH-}$', '$\\mathrm{-COO-}$', '$\\mathrm{-O-}$', '$\\mathrm{-S-S-}$'],
    correctAnswer: '$\\mathrm{-CO-NH-}$',
  },
  {
    question: 'Какво представляват сапуните?',
    answers: ['натриеви или калиеви соли на висши мастни киселини', 'естери на глицерола и мастни киселини', 'аминокиселини с дълга верига', 'полизахариди'],
    correctAnswer: 'натриеви или калиеви соли на висши мастни киселини',
  },
  {
    question: 'Коя аминокиселина няма хирален въглероден атом?',
    answers: ['глицин', 'аланин', 'серин', 'валин'],
    correctAnswer: 'глицин',
  },
  {
    question: 'С коя база се свързва аденинът в двойната спирала на ДНК?',
    answers: ['тимин', 'гуанин', 'цитозин', 'урацил'],
    correctAnswer: 'тимин',
  },
  {
    question: 'Колко енергия дават 10 g мазнина според етикетите в ЕС?',
    answers: ['$370\\ \\mathrm{kJ}$', '$170\\ \\mathrm{kJ}$', '$37\\ \\mathrm{kJ}$', '$3700\\ \\mathrm{kJ}$'],
    correctAnswer: '$370\\ \\mathrm{kJ}$',
  },
  {
    question: 'Защо човекът не може да смила целулозата?',
    answers: ['глюкозните звена в нея са свързани с β-връзки', 'тя не съдържа глюкоза', 'тя е неорганично вещество', 'молекулите ѝ са твърде малки'],
    correctAnswer: 'глюкозните звена в нея са свързани с β-връзки',
  },
];

// ---------- Страница ----------

const MACRO: [string, string, string, string][] = [
  ['въглехидрати', 'монозахариди (глюкоза, фруктоза)', 'нишесте, гликоген, целулоза', 'енергия, строителен материал на растенията'],
  ['белтъци', '20 аминокиселини', 'полипептидни вериги', 'ензими, мускули, антитела, транспорт'],
  ['нуклеинови киселини', '4 нуклеотида', 'ДНК, РНК', 'съхраняване и предаване на наследствената информация'],
  ['мазнини', 'глицерол + мастни киселини', '– (не са полимери)', 'запас от енергия, клетъчни мембрани'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';
const figure = 'flex flex-col items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-2';
const caption = 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center';

export function Biomolecules() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Химия на живота</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧬 На 25 април 1953 г. списание Nature публикува статия от една страница. В нея Джеймс Уотсън и Франсис Крик предлагат модел на
            ДНК – <strong>двойна спирала</strong>, в която аденинът винаги стои срещу тимина, а гуанинът – срещу цитозина. Моделът им почива
            на чужди данни: рентгеновите снимки на Розалинд Франклин и правилото на Ервин Чаргаф, че в ДНК аденинът е колкото тимина. Авторите
            добавят скромно, че сдвояването „веднага подсказва възможен механизъм за копиране на генетичния материал“. Така химията на
            четири малки молекули обяснява наследствеността.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Молекулите на живота</h2>
          <p className={text}>
            Живите организми са изградени главно от четири елемента – въглерод, водород, кислород и азот (заедно с малко фосфор и сяра).
            Повечето биологични молекули са <strong>макромолекули</strong>: дълги вериги от повтарящи се малки звена, както <Term id="polymer">полимерите</Term> от
            урока{' '}
            <Link to="/chemistry/organic/polymers" className={link}>
              Полимери
            </Link>
            . <Term id="functional-group">Функционалните групи</Term> в тях – хидроксилни, карбонилни, карбоксилни и аминогрупи – вече познаваме от урока{' '}
            <Link to="/chemistry/organic/functional-groups" className={link}>
              Функционални групи
            </Link>
            .
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Клас</th>
                  <th className={th}>Звена</th>
                  <th className={th}><Term id="macromolecule">Макромолекули</Term></th>
                  <th className={th}>Роля</th>
                </tr>
              </thead>
              <tbody>
                {MACRO.map(([name, unit, macro, role]) => (
                  <tr key={name}>
                    <td className={`${td} font-semibold`}>{name}</td>
                    <td className={td}>{unit}</td>
                    <td className={td}>{macro}</td>
                    <td className={td}>{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Въглехидрати: глюкоза и фруктоза</h2>
          <Theorem
            type="definition"
            title="Въглехидрати"
            description="Въглехидратите (захари) са полихидроксиалдехиди или полихидроксикетони и веществата, които се разграждат до тях при хидролиза. Много от тях имат обща формула $\mathrm{C}_n(\mathrm{H_2O})_m$ – откъдето идва и името. Монозахаридите (глюкоза, фруктоза) не се хидролизират; дизахаридите дават две, а полизахаридите – много монозахаридни молекули."
          />
          <p className={text}>
            Глюкозата <Tex>{'\\mathrm{C_6H_{12}O_6}'}</Tex> е <Term id="aldehyde">алдехид</Term> с пет хидроксилни групи. В <Term id="solution">разтвор</Term> обаче почти всички молекули са
            затворени в шестатомен пръстен: хидроксилната група при петия въглероден атом се присъединява към алдехидната група. Така се
            появява нов хидроксил при първия атом и той може да сочи надолу (α-глюкоза) или нагоре (β-глюкоза).
          </p>
          <GlucoseForms />
          <p className={text}>
            Фруктозата има същата формула <Tex>{'\\mathrm{C_6H_{12}O_6}'}</Tex>, но е <Term id="ketone">кетон</Term> – двете захари са <Term id="isomer">изомери</Term>. Глюкозата, благодарение
            на отворената си форма, дава реакциите на алдехидите: „<Term id="silver-mirror-reaction">сребърно огледало</Term>“ с реактива на Толенс и червена <Term id="precipitate">утайка</Term> с Фелинговия
            реактив (виж{' '}
            <Link to="/chemistry/organic/functional-groups" className={link}>
              Функционални групи
            </Link>
            ). Затова се нарича редуцираща захар.
          </p>
          <Theorem
            title="Фотосинтеза и дишане"
            description="Растенията изграждат глюкоза от въглероден диоксид и вода с енергията на светлината: $\mathrm{6CO_2 + 6H_2O \to C_6H_{12}O_6 + 6O_2}$, $\Delta H \approx +2800\ \mathrm{kJ/mol}$. При дишането в клетките протича обратният процес и същата енергия се освобождава – на стъпки, чрез ензими, а не изведнъж като при горене."
          />
          <Example
            description="При алкохолна ферментация дрождите превръщат глюкозата в етанол: $\mathrm{C_6H_{12}O_6 \to 2C_2H_5OH + 2CO_2}$. Колко грама етанол и колко литра CO₂ (н.у.) се получават от 360 g глюкоза?"
            steps={[
              '$n(\\text{глюкоза}) = \\frac{360}{180} = 2\\ \\mathrm{mol}$',
              '$n(\\mathrm{C_2H_5OH}) = n(\\mathrm{CO_2}) = 4\\ \\mathrm{mol}$',
              '$m(\\mathrm{C_2H_5OH}) = 4 \\cdot 46 = 184\\ \\mathrm{g}$, $V(\\mathrm{CO_2}) = 4 \\cdot 22{,}4 = 89{,}6\\ \\mathrm{L}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Дизахариди и полизахариди</h2>
          <p className={text}>
            Захарозата (обикновената захар) <Tex>{'\\mathrm{C_{12}H_{22}O_{11}}'}</Tex> е съставена от глюкоза и фруктоза, свързани с отделяне
            на вода. Двата пръстена са свързани точно чрез групите, които дават редуциращите свойства, затова захарозата{' '}
            <strong>не</strong> дава реакцията на Фелинг. Тя се <Term id="hydrolysis">хидролизира</Term> в кисела среда или от <Term id="enzyme">ензими</Term>:{' '}
            <Tex>{'\\mathrm{C_{12}H_{22}O_{11} + H_2O \\to C_6H_{12}O_6 + C_6H_{12}O_6}'}</Tex>. Малтозата и лактозата (млечната захар) също са
            дизахариди.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th} />
                  <th className={th}>Нишесте</th>
                  <th className={th}>Целулоза</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`${td} font-semibold`}>звена</td>
                  <td className={td}>α-глюкоза</td>
                  <td className={td}>β-глюкоза</td>
                </tr>
                <tr>
                  <td className={`${td} font-semibold`}>верига</td>
                  <td className={td}>спирала, при амилопектина – разклонена</td>
                  <td className={td}>права, веригите са свързани с водородни връзки във влакна</td>
                </tr>
                <tr>
                  <td className={`${td} font-semibold`}>роля</td>
                  <td className={td}>запас от енергия в растенията</td>
                  <td className={td}>стени на растителните клетки (дърво, памук)</td>
                </tr>
                <tr>
                  <td className={`${td} font-semibold`}>смила ли се от човека</td>
                  <td className={td}>да</td>
                  <td className={td}>не – нямаме ензим за β-връзките</td>
                </tr>
                <tr>
                  <td className={`${td} font-semibold`}>с йод</td>
                  <td className={td}>синьо оцветяване</td>
                  <td className={td}>без синьо оцветяване</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Example
            description="Колко килограма глюкоза могат да се получат при пълната хидролиза на 162 kg нишесте?"
            steps={[
              '$\\mathrm{(C_6H_{10}O_5)_n + nH_2O \\to nC_6H_{12}O_6}$',
              'Звеното $\\mathrm{C_6H_{10}O_5}$ е $162\\ \\mathrm{g/mol}$, значи 162 kg нишесте съдържат 1 kmol звена.',
              '$m(\\text{глюкоза}) = 1 \\cdot 180 = 180\\ \\mathrm{kg}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Мазнини и сапуни</h2>
          <Theorem
            type="definition"
            title="Мазнини (триглицериди)"
            description="Мазнините са естери на тривалентния алкохол глицерол и три висши мастни киселини. Наситените мастни киселини (палмитинова $\mathrm{C_{15}H_{31}COOH}$, стеаринова $\mathrm{C_{17}H_{35}COOH}$) правят мазнината твърда при стайна температура, а ненаситените (олеинова $\mathrm{C_{17}H_{33}COOH}$ с една двойна връзка) – течна, като олиото и зехтина."
          />
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <figure className={figure}>
              <Molecule smiles="OCC(O)CO" mode="semi" title="глицерол" />
              <figcaption className={caption}>глицерол</figcaption>
            </figure>
            <figure className={figure}>
              <Molecule smiles="CCCCCCCCCCCCCCCCCC(=O)[O-].[Na+]" bond={26} title="натриев стеарат" />
              <figcaption className={caption}>натриев стеарат – сапун: дълга неполярна „опашка“ и полярна „глава“</figcaption>
            </figure>
          </div>
          <p className={text}>
            Двойните връзки в течните масла могат да се наситят с водород върху никелов <Term id="catalyst">катализатор</Term> – така се получава твърда мазнина
            (хидрогениране, по този начин се правят някои маргарини). При непълно хидрогениране се образуват и т. нар. транс-мазнини, чието
            количество в храните днес е ограничено.
          </p>
          <Theorem
            title="Осапуняване"
            description="При нагряване с основа мазнините се хидролизират до глицерол и соли на мастните киселини – сапуни: $\text{мазнина} + 3\mathrm{NaOH} \to \text{глицерол} + 3\,\mathrm{RCOONa}$. Натриевите сапуни са твърди, калиевите – течни."
          />
          <Example
            description="Колко грама сапун и колко грама глицерол се получават при осапуняване на 890 g тристеарин $\mathrm{(C_{17}H_{35}COO)_3C_3H_5}$ с натриева основа?"
            steps={[
              '$M(\\text{тристеарин}) = 890\\ \\mathrm{g/mol}$, значи $n = 1\\ \\mathrm{mol}$',
              'Сапун: $3\\ \\mathrm{mol}\\ \\mathrm{C_{17}H_{35}COONa}$, $m = 3 \\cdot 306 = 918\\ \\mathrm{g}$',
              'Глицерол: $1 \\cdot 92 = 92\\ \\mathrm{g}$. Проверка: $890 + 3 \\cdot 40 = 918 + 92 = 1010\\ \\mathrm{g}$ – масата се запазва.',
            ]}
          />
          <p className={text}>
            Как мие сапунът? Неполярните опашки се „скриват“ в капката мазнина, а полярните глави остават към водата. Капката се обвива в
            сапунени <Term id="anion">аниони</Term> и става <strong>мицела</strong>, която водата отнася. В <Term id="water-hardness">твърда вода</Term> обаче <Term id="ion">йоните</Term>{' '}
            <Tex>{'\\mathrm{Ca^{2+}}'}</Tex> и <Tex>{'\\mathrm{Mg^{2+}}'}</Tex> утаяват сапуна като неразтворими соли – затова в синтетичните
            перилни препарати (детергенти) се използват вещества, чиито калциеви соли са разтворими.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Аминокиселини</h2>
          <Theorem
            type="definition"
            title="α-Аминокиселини"
            description="Аминокиселините в белтъците имат обща формула $\mathrm{H_2N{-}CH(R){-}COOH}$: аминогрупа и карбоксилна група при един и същ въглероден атом, а R е страничната верига. В белтъците на организмите се срещат 20 такива аминокиселини, от които 9 човешкият организъм не може да синтезира – те са незаменими и трябва да идват с храната."
          />
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <figure className={figure}>
              <Molecule smiles="NCC(=O)O" mode="semi" title="глицин" />
              <figcaption className={caption}>глицин (R = H)</figcaption>
            </figure>
            <figure className={figure}>
              <Molecule smiles="NC(C)C(=O)O" mode="semi" title="аланин" />
              <figcaption className={caption}>аланин (R = CH₃)</figcaption>
            </figure>
            <figure className={figure}>
              <Molecule smiles="[NH3+]CC(=O)[O-]" mode="semi" title="глицин като диполарен йон" />
              <figcaption className={caption}>глицинът в кристала и във вода – диполарен йон</figcaption>
            </figure>
          </div>
          <p className={text}>
            Аминокиселините са <Term id="amphoterism">амфотерни</Term>: аминогрупата е основа, а карбоксилната група – <Term id="acid">киселина</Term>. Затова <Term id="proton">протонът</Term> „прескача“ вътре в самата
            молекула и тя съществува като <strong>диполарен йон</strong> (цвитерйон) <Tex>{'\\mathrm{H_3N^+{-}CH(R){-}COO^-}'}</Tex>. Това
            обяснява защо аминокиселините са твърди кристални вещества с висока температура на топене, разтворими във вода – като солите.
          </p>
          <p className={text}>
            Освен при глицина, централният въглероден атом е свързан с четири различни групи (H, NH₂, COOH и R) и е{' '}
            <strong>хирален</strong>: молекулата има огледален образ, който не може да се наложи върху нея, както лявата и дясната ръка.
            В белтъците на живите организми почти всички аминокиселини са само от едната форма – L.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Пептиди и белтъци</h2>
          <Theorem
            type="definition"
            title="Пептидна връзка"
            description="Карбоксилната група на една аминокиселина реагира с аминогрупата на друга и се отделя вода. Получената амидна група $\mathrm{-CO-NH-}$ се нарича пептидна връзка. Две аминокиселини дават дипептид, много – полипептид. Моларната маса на пептид от $n$ аминокиселини е $M = \sum M_i - (n - 1) \cdot 18$."
          />
          <PeptideLab />
          <p className={text}>Белтъците са полипептиди с десетки до хиляди аминокиселини. Структурата им се описва на четири нива:</p>
          <ul className="list-disc pl-6 mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-1">
            <li>
              <strong>първична</strong> – редът на аминокиселините във веригата;
            </li>
            <li>
              <strong>вторична</strong> – α-спирали и β-слоеве, задържани от <Term id="hydrogen-bond">водородни връзки</Term> между групите{' '}
              <Tex>{'\\mathrm{C{=}O}'}</Tex> и <Tex>{'\\mathrm{N{-}H}'}</Tex>;
            </li>
            <li>
              <strong>третична</strong> – пространственото нагъване на цялата верига (дисулфидни мостове, йонни и хидрофобни взаимодействия);
            </li>
            <li>
              <strong>четвъртична</strong> – свързване на няколко вериги, например четирите вериги на <Term id="hemoglobin">хемоглобина</Term>.
            </li>
          </ul>
          <p className={text}>
            При нагряване, в силно кисела или основна среда, със соли на тежки метали или с <Term id="alcohol">алкохол</Term> белтъците се{' '}
            <strong>денатурират</strong>: пространствената им структура се разрушава, но пептидните връзки остават. Така се „сварява“
            яйчният белтък. Белтъците се откриват с <strong>биуретовата реакция</strong> – с меден(II) сулфат в основна среда дават
            виолетово оцветяване. Повечето ензими са белтъци – биологични катализатори, които ускоряват реакциите милиони пъти (виж{' '}
            <Link to="/chemistry/reactions/kinetics" className={link}>
              Скорост на реакцията
            </Link>
            ).
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Нуклеинови киселини</h2>
          <p className={text}>
            ДНК и РНК са полимери от <strong>нуклеотиди</strong>. Всеки нуклеотид има три части: азотна база, захар (дезоксирибоза в ДНК,
            рибоза в РНК) и остатък от фосфорна киселина. Захарите и фосфатите образуват „гръбнака“ на веригата, а базите стърчат встрани.
            В ДНК базите са четири: аденин (A), гуанин (G), цитозин (C) и тимин (T); в РНК вместо тимин има урацил (U).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              ['аденин (A)', 'NC1=NC=NC2=C1N=CN2'],
              ['гуанин (G)', 'NC1=NC2=C(N=CN2)C(=O)N1'],
              ['цитозин (C)', 'NC1=NC(=O)NC=C1'],
              ['тимин (T)', 'CC1=CNC(=O)NC1=O'],
            ].map(([name, smiles]) => (
              <figure key={name} className={figure}>
                <Molecule smiles={smiles} bond={28} title={name} />
                <figcaption className={caption}>{name}</figcaption>
              </figure>
            ))}
          </div>
          <Theorem
            title="Комплементарност и правило на Чаргаф"
            description="Двете вериги на ДНК са свързани с водородни връзки между базите: аденинът винаги се свързва с тимина (две връзки), а гуанинът – с цитозина (три връзки). Затова в двойната спирала $\%\mathrm{A} = \%\mathrm{T}$, $\%\mathrm{G} = \%\mathrm{C}$ и $\%\mathrm{A} + \%\mathrm{G} = 50\%$."
          />
          <DnaLab />
          <Example
            description="В двойноверижна ДНК 30% от нуклеотидите са с аденин. Какъв процент са с гуанин, цитозин и тимин?"
            steps={['$\\%\\mathrm{T} = \\%\\mathrm{A} = 30\\%$', '$\\%\\mathrm{G} = \\%\\mathrm{C} = \\frac{100 - 60}{2} = 20\\%$', 'Около толкова е съставът на човешката ДНК.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Енергия от храната</h2>
          <p className={text}>
            В клетките въглехидратите, мазнините и белтъците се окисляват до въглероден диоксид и вода (белтъците – и до <Term id="urea">урея</Term>), а енергията
            се запазва в молекулите на <Term id="atp">АТФ</Term>. Колко енергия дава храната, показва нейната{' '}
            <Link to="/chemistry/reactions/energy" className={link}>
              калоричност
            </Link>
            .
          </p>
          <Theorem
            title="Енергийна стойност на храната"
            description="На етикетите в ЕС енергията се смята с усреднени коефициенти: $17\ \mathrm{kJ}$ ($4\ \mathrm{kcal}$) на грам въглехидрати и белтъци и $37\ \mathrm{kJ}$ ($9\ \mathrm{kcal}$) на грам мазнини: $E = 17\,m_{\text{въгл}} + 37\,m_{\text{мазн}} + 17\,m_{\text{белт}}$ (в kJ, масите в грамове)."
          />
          <FoodEnergyLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Маса на пептид, <Term id="chargaff-rule">правило на Чаргаф</Term>, водородни връзки в ДНК, енергия на храна, фотосинтеза и осапуняване. Десетичните отговори въвеждай като 91,8.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Химията в нас и около нас</h2>
          <p className={text}>Хляб, вино, сапун, шоколад и собствената ни ДНК – биохимията е навсякъде.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Мазнините като полимери', 'Мазнините са полимери на мастните киселини.', 'Триглицеридите са естери на глицерола и три мастни киселини – малки молекули, не полимери.'],
              ['Захарозата и Фелинг', 'Захарозата дава червена утайка с Фелинговия реактив.', 'Не дава – глюкозата и фруктозата в нея са свързани чрез редуциращите си групи.'],
              ['Маса на пептид', '$M(\\text{Gly–Ala}) = 75 + 89 = 164\\ \\mathrm{g/mol}$', 'При пептидната връзка се отделя вода: $164 - 18 = 146\\ \\mathrm{g/mol}$.'],
              ['Чаргаф за една верига', 'Във всяка верига на ДНК %A = %T.', 'Равенството важи за двойната спирала; в една верига процентите са произволни.'],
              ['Денатурация и хидролиза', 'При варене пептидните връзки се разкъсват.', 'Денатурацията разрушава пространствената структура; първичната структура остава.'],
              ['Нишесте и целулоза', 'Нишестето и целулозата са от различни мономери.', 'И двете са от глюкоза – разликата е в α- и β-връзките между звената.'],
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
              <Task id="a1" number={1} color="border-green-500" question="Каква е моларната маса на трипептида Gly–Ala–Ser? ($M$ = 75, 89 и 105 g/mol)" check={[233]} ask={['$M$, g/mol']}>
                <p>Пептидните връзки са две – отделят се две молекули вода.</p>
                <p><Tex>{'M = 75 + 89 + 105 - 2 \\cdot 18 = 233\\ \\mathrm{g/mol}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="В двойноверижна ДНК 18% от нуклеотидите са с тимин. Колко процента са с гуанин?" check={[32]} ask={['%G']}>
                <p><Tex>{'\\%\\mathrm{A} = \\%\\mathrm{T} = 18\\%'}</Tex></p>
                <p><Tex>{'\\%\\mathrm{G} = \\%\\mathrm{C} = \\frac{100 - 36}{2} = 32\\%'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко грама глюкоза се образуват при фотосинтезата от 132 g CO₂ и колко литра кислород (н.у.) се отделят?" check={[90, 67.2]} ask={['глюкоза, g', '$\\mathrm{O_2}$, L']}>
                <p><Tex>{'\\mathrm{6CO_2 + 6H_2O \\to C_6H_{12}O_6 + 6O_2}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{CO_2}) = \\frac{132}{44} = 3\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\text{глюкоза}) = 0{,}5\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 90\\ \\mathrm{g}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{O_2}) = 3\\ \\mathrm{mol}'}</Tex>, <Tex>{'V = 3 \\cdot 22{,}4 = 67{,}2\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Колко грама етанол се получават при ферментацията на 450 g глюкоза, ако добивът е 80%?" check={[184]} ask={['етанол, g']}>
                <p><Tex>{'n(\\text{глюкоза}) = \\frac{450}{180} = 2{,}5\\ \\mathrm{mol}'}</Tex>, теоретично <Tex>{'n(\\mathrm{C_2H_5OH}) = 5\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m = 5 \\cdot 46 \\cdot 0{,}8 = 184\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Колко грама натриева основа са нужни за осапуняването на 89 g тристеарин ($M = 890$ g/mol) и колко грама сапун ($M = 306$ g/mol) се получават?" check={[12, 91.8]} ask={['NaOH, g', 'сапун, g']}>
                <p><Tex>{'n(\\text{мазнина}) = \\frac{89}{890} = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{NaOH}) = 0{,}3\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{NaOH}) = 0{,}3 \\cdot 40 = 12\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\text{сапун}) = 0{,}3 \\cdot 306 = 91{,}8\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Триолеинът ($M = 884$ g/mol) съдържа три двойни връзки C=C. Колко литра водород (н.у.) са нужни за пълното хидрогениране на 442 g триолеин и колко грама тристеарин се получават?" check={[33.6, 445]} ask={['$\\mathrm{H_2}$, L', 'тристеарин, g']}>
                <p><Tex>{'n = \\frac{442}{884} = 0{,}5\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{H_2}) = 3 \\cdot 0{,}5 = 1{,}5\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'V = 1{,}5 \\cdot 22{,}4 = 33{,}6\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'m = 0{,}5 \\cdot 890 = 445\\ \\mathrm{g}'}</Tex> (масата расте с <Tex>{'3\\ \\mathrm{g}'}</Tex> – масата на водорода).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Двойноверижен участък от ДНК има 1000 двойки бази и 2600 водородни връзки между веригите. Колко са двойките G–C и какъв процент от всички нуклеотиди са с аденин?" check={[600, 20]} ask={['двойки G–C', '%A']}>
                <p>Нека двойките A–T са <Tex>{'x'}</Tex>, а G–C – <Tex>{'y'}</Tex>: <Tex>{'x + y = 1000'}</Tex>, <Tex>{'2x + 3y = 2600'}</Tex>.</p>
                <p><Tex>{'y = 2600 - 2000 = 600'}</Tex>, <Tex>{'x = 400'}</Tex>.</p>
                <p>Нуклеотидите са 2000, от тях с аденин – 400: <Tex>{'\\%\\mathrm{A} = 20\\%'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="При хидролизата на дипептид с моларна маса 146 g/mol се получават глицин ($M = 75$ g/mol) и още една аминокиселина. Каква е моларната ѝ маса и коя е тя, ако страничната ѝ верига е въглеводородна?" check={[89]} ask={['$M$, g/mol']}>
                <p>При хидролизата се присъединява вода: <Tex>{'146 + 18 = 75 + M'}</Tex>.</p>
                <p><Tex>{'M = 89\\ \\mathrm{g/mol}'}</Tex> – това е аланинът <Tex>{'\\mathrm{H_2N{-}CH(CH_3){-}COOH}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Човек приема около 9000 kJ на ден. Ако мазнините трябва да дават не повече от 35% от енергията, а добавените захари – не повече от 10%, колко грама са най-много мазнините и захарите на ден?" check={[85.1, 52.9]} ask={['мазнини, g', 'захари, g']}>
                <p>Мазнини: <Tex>{'\\frac{0{,}35 \\cdot 9000}{37} \\approx 85{,}1\\ \\mathrm{g}'}</Tex></p>
                <p>Захари: <Tex>{'\\frac{0{,}10 \\cdot 9000}{17} \\approx 52{,}9\\ \\mathrm{g}'}</Tex> – около 13 чаени лъжички захар. Една кутия газирана напитка (330 mL) съдържа често около 35 g.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Глюкозата <Tex>{'\\mathrm{C_6H_{12}O_6}'}</Tex> е алдехид; в разтвор е главно пръстен (α и β); фруктозата е неин изомер – кетон</li>
              <li>✓ Фотосинтеза: <Tex>{'\\mathrm{6CO_2 + 6H_2O \\to C_6H_{12}O_6 + 6O_2}'}</Tex>; дишането е обратният процес</li>
              <li>✓ Нишестето (α-глюкоза) и целулозата (β-глюкоза) са полизахариди; нишестето се оцветява синьо с йод</li>
              <li>✓ Мазнините са <Term id="ester">естери</Term> на глицерола; при осапуняване дават глицерол и сапуни</li>
              <li>✓ Аминокиселините <Tex>{'\\mathrm{H_2N{-}CH(R){-}COOH}'}</Tex> са амфотерни и (без глицина) хирални; пептидната връзка е <Tex>{'\\mathrm{-CO-NH-}'}</Tex></li>
              <li>✓ Маса на пептид: <Tex>{'M = \\sum M_i - (n - 1) \\cdot 18'}</Tex></li>
              <li>✓ В ДНК: A–T (две водородни връзки), G–C (три); %A = %T, %G = %C</li>
              <li>✓ Енергия на храната: 17 kJ/g въглехидрати и белтъци, 37 kJ/g мазнини</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Хиралните молекули и техните огледални образи имат еднакви температури на кипене и плътност, но рецепторите в носа ни ги
              различават. Карвонът в едната си форма мирише на джоджен, а в огледалната – на кимион. Същото важи и за лекарствата: често
              само едната форма действа както трябва – затова днес много лекарства се произвеждат като чиста хирална форма.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
