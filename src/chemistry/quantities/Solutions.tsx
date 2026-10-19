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
import { formulaTex, molarMass } from '../formula';
import DilutionLab from './DilutionLab';
import PrepareSolutionLab from './PrepareSolutionLab';
import SolubilityCurveLab from './SolubilityCurveLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');
const u = (unit: string) => `\\ \\mathrm{${unit}}`;

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    // c = n / V; обемите имат само множители 2 и 5 – отговорът е крайна десетична дроб
    const mmol = pick([50, 100, 200, 250, 500]);
    const V = pick([100, 200, 250, 500, 1000]);
    return {
      tex: `n = ${dec(mmol / 1000)}${u('mol')},\\ V = ${V}${u('mL')}`,
      ask: 'Каква е моларната концентрация, mol/L?',
      num: mmol,
      den: V,
      steps: [`$V = ${V}\\ \\mathrm{mL} = ${dec(V / 1000)}\\ \\mathrm{L}$`, `$c = \\frac{n}{V} = \\frac{${dec(mmol / 1000)}}{${dec(V / 1000)}} = ${dec(mmol / V)}\\ \\mathrm{mol/L}$`],
    };
  }
  if (kind === 1) {
    // Колко грама да претеглим: m = c · V · M
    const f = pick(['NaCl', 'NaOH', 'KCl', 'C6H12O6', 'KNO3']);
    const M = molarMass(f);
    const c10 = pick([1, 2, 5, 10]);
    const V = pick([100, 200, 250, 500, 1000]);
    const m = (c10 / 10) * (V / 1000) * M;
    return {
      tex: `${dec(c10 / 10)}${u('mol/L')}\\ ${formulaTex(f)},\\ ${V}${u('mL')}`,
      ask: 'Колко грама вещество трябва да се претеглят?',
      num: Math.round(c10 * V * M * 10),
      den: 100000,
      steps: [
        `$n = c \\cdot V = ${dec(c10 / 10)} \\cdot ${dec(V / 1000)} = ${dec((c10 * V) / 10000)}\\ \\mathrm{mol}$`,
        `$M(${formulaTex(f)}) = ${dec(M)}\\ \\mathrm{g/mol}$`,
        `$m = n \\cdot M = ${dec((c10 * V) / 10000)} \\cdot ${dec(M)} = ${dec(m)}\\ \\mathrm{g}$`,
      ],
    };
  }
  if (kind === 2) {
    // Разреждане: c₂ = c₁V₁ / V₂
    const c1 = pick([0.5, 1, 2, 4]);
    const V1 = pick([10, 20, 25, 50]);
    const V2 = pick([100, 200, 250, 500]);
    return {
      tex: `${dec(c1)}${u('mol/L')}:\\ ${V1}${u('mL')} \\to ${V2}${u('mL')}`,
      ask: 'Разтворът се разрежда с вода. Каква е новата концентрация, mol/L?',
      num: c1 * 10 * V1,
      den: 10 * V2,
      steps: [`Количеството вещество не се променя: $c_1 V_1 = c_2 V_2$`, `$c_2 = \\frac{${dec(c1)} \\cdot ${V1}}{${V2}} = ${dec((c1 * V1) / V2)}\\ \\mathrm{mol/L}$`],
    };
  }
  if (kind === 3) {
    // Колко mL от изходния разтвор са нужни
    const c1 = pick([1, 2, 5]);
    const c2 = pick([0.1, 0.2, 0.5]);
    const V2 = pick([100, 250, 500, 1000]);
    return {
      tex: `${dec(c2)}${u('mol/L')},\\ ${V2}${u('mL')} \\leftarrow ${c1}${u('mol/L')}`,
      ask: 'Колко mL от изходния разтвор трябва да се вземат?',
      num: Math.round(c2 * 10) * V2,
      den: 10 * c1,
      steps: [`$V_1 = \\frac{c_2 V_2}{c_1} = \\frac{${dec(c2)} \\cdot ${V2}}{${c1}} = ${dec((c2 * V2) / c1)}\\ \\mathrm{mL}$`, 'Взимаме ги с пипета и допълваме с вода до чертата на колбата.'],
    };
  }
  if (kind === 4) {
    // ppm: милиграми на килограм
    const mg = pick([2, 5, 15, 50, 120]);
    const kg = pick([2, 4, 5, 10, 20]);
    return {
      tex: `${mg}${u('mg')}\\ \\text{в}\\ ${kg}${u('kg')}\\ \\text{вода}`,
      ask: 'Колко е концентрацията в ppm?',
      num: mg,
      den: kg,
      steps: ['$1\\ \\mathrm{ppm}$ е една милионна част: $1\\ \\mathrm{mg}$ на $1\\ \\mathrm{kg}$.', `$\\frac{${mg}\\ \\mathrm{mg}}{${kg}\\ \\mathrm{kg}} = ${dec(mg / kg)}\\ \\mathrm{ppm}$`],
    };
  }
  // Разтворимост: колко сол има в наситен разтвор с дадена маса вода
  const [salt, t, S] = pick([
    ['KNO_3', 20, 31.6],
    ['KNO_3', 60, 110],
    ['KNO_3', 80, 169],
    ['NaCl', 20, 35.9],
    ['KCl', 40, 40.1],
  ] as [string, number, number][]);
  const water = pick([50, 200, 250, 500]);
  const name = salt === 'KNO_3' ? 'KNO₃' : salt;
  return {
    tex: `S = ${dec(S)}\\ \\mathrm{g}/100\\ \\mathrm{g}\\ \\text{вода}`,
    ask: `Това е разтворимостта на ${name} при ${t} °C. Колко грама сол има в наситен разтвор с ${water} g вода?`,
    num: Math.round(S * 10) * water,
    den: 1000,
    steps: [`На 100 g вода се падат $${dec(S)}\\ \\mathrm{g}$ сол, а масата на солта е пропорционална на масата на водата.`, `$m = ${dec(S)} \\cdot \\frac{${water}}{100} = ${dec((S * water) / 100)}\\ \\mathrm{g}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🩸 Кръвна захар',
    problem: 'Нормалната концентрация на глюкоза в кръвта на гладно е около 5,0 mmol/L. Ако приемем, че тя е еднаква в целия обем от около 5 L кръв, колко грама глюкоза ($\\mathrm{C_6H_{12}O_6}$, $M = 180\\ \\mathrm{g/mol}$) има в кръвта?',
    solution: ['$n = c \\cdot V = 0{,}0050 \\cdot 5 = 0{,}025\\ \\mathrm{mol}$', '$m = n \\cdot M = 0{,}025 \\cdot 180 = 4{,}5\\ \\mathrm{g}$ – по-малко от едно пакетче захар.'],
    answer: '$4{,}5\\ \\mathrm{g}$',
    check: [4.5],
    ask: ['глюкоза, g'],
  },
  {
    title: '👃 Капки за нос',
    problem: 'Физиологичният разтвор е 0,9% разтвор на NaCl с плътност около 1,005 g/mL. Каква е моларната му концентрация?',
    solution: ['В 1 L има $1005\\ \\mathrm{g}$ разтвор и $0{,}009 \\cdot 1005 \\approx 9{,}05\\ \\mathrm{g}$ NaCl.', '$c = \\frac{9{,}05\\ \\mathrm{g}}{58{,}5\\ \\mathrm{g/mol} \\cdot 1\\ \\mathrm{L}} \\approx 0{,}155\\ \\mathrm{mol/L}$'],
    answer: '$\\approx 0{,}155\\ \\mathrm{mol/L}$',
    check: [0.155],
    ask: ['c, mol/L'],
  },
  {
    title: '🥗 Оцет',
    problem: 'Трапезният оцет е около 5% разтвор на оцетна киселина ($M = 60\\ \\mathrm{g/mol}$) с плътност около 1,01 g/mL. Каква е моларната концентрация?',
    solution: ['$c = \\frac{1000 \\cdot \\rho \\cdot w}{M} = \\frac{1000 \\cdot 1{,}01 \\cdot 0{,}05}{60} \\approx 0{,}842\\ \\mathrm{mol/L}$'],
    answer: '$\\approx 0{,}842\\ \\mathrm{mol/L}$',
    check: [0.842],
    ask: ['c, mol/L'],
  },
  {
    title: '🚗 Акумулаторна киселина',
    problem: 'Електролитът в оловния акумулатор е около 37% сярна киселина с плътност около 1,28 g/mL. Каква е моларната концентрация на $\\mathrm{H_2SO_4}$ ($M = 98\\ \\mathrm{g/mol}$)?',
    solution: ['$c = \\frac{1000 \\cdot 1{,}28 \\cdot 0{,}37}{98} \\approx 4{,}83\\ \\mathrm{mol/L}$', 'При разреждане на акумулатора киселината се изразходва и плътността пада – затова зарядът може да се провери с ареометър.'],
    answer: '$\\approx 4{,}83\\ \\mathrm{mol/L}$',
    check: [4.83],
    ask: ['c, mol/L'],
  },
  {
    title: '🪥 Флуор в пастата за зъби',
    problem: 'На много пасти за зъби пише „1450 ppm F“. Колко милиграма флуор има в туба от 100 g?',
    solution: ['$1450\\ \\mathrm{ppm}$ означава $1450\\ \\mathrm{mg}$ на $1\\ \\mathrm{kg}$.', '$100\\ \\mathrm{g} = 0{,}1\\ \\mathrm{kg}$, значи $1450 \\cdot 0{,}1 = 145\\ \\mathrm{mg}$ флуор (под формата на флуориди).'],
    answer: '$145\\ \\mathrm{mg}$',
    check: [145],
    ask: ['флуор, mg'],
  },
  {
    title: '🐟 Аквариумът през лятото',
    problem: 'Вода, наситена с въздух, съдържа около 11,3 mg/L кислород при 10 °C и около 8,3 mg/L при 25 °C. Колко милиграма кислород „излизат“ от 100-литров аквариум, ако водата се затопли от 10 до 25 °C?',
    solution: ['$(11{,}3 - 8{,}3) \\cdot 100 = 300\\ \\mathrm{mg}$', 'Разтворимостта на газовете намалява при затопляне – затова в горещо лято рибите в плитки езера може да се задушат.'],
    answer: '$300\\ \\mathrm{mg}$',
    check: [300],
    ask: ['кислород, mg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'В каква единица се измерва моларната концентрация?',
    answers: ['mol/L', 'g/mol', 'mol', 'g/L·mol'],
    correctAnswer: 'mol/L',
  },
  {
    question: 'Какво означава, че разтворът е наситен?',
    answers: ['при тази температура не може да се разтвори повече от веществото', 'съдържа много разтворено вещество', 'разтворителят е изпарен', 'не съдържа вода'],
    correctAnswer: 'при тази температура не може да се разтвори повече от веществото',
  },
  {
    question: 'Как се променя разтворимостта на кислорода във водата при затопляне?',
    answers: ['намалява', 'расте', 'не се променя', 'първо расте, после намалява'],
    correctAnswer: 'намалява',
  },
  {
    question: 'В 250 mL разтвор има 0,5 mol NaCl. Каква е моларната концентрация?',
    answers: ['$2\\ \\mathrm{mol/L}$', '$0{,}125\\ \\mathrm{mol/L}$', '$0{,}5\\ \\mathrm{mol/L}$', '$125\\ \\mathrm{mol/L}$'],
    correctAnswer: '$2\\ \\mathrm{mol/L}$',
  },
  {
    question: '10 mL от 1 mol/L разтвор се разреждат с вода до 100 mL. Каква е новата концентрация?',
    answers: ['$0{,}1\\ \\mathrm{mol/L}$', '$10\\ \\mathrm{mol/L}$', '$0{,}01\\ \\mathrm{mol/L}$', '$1\\ \\mathrm{mol/L}$'],
    correctAnswer: '$0{,}1\\ \\mathrm{mol/L}$',
  },
  {
    question: 'Коя величина НЕ се променя при разреждане на разтвор с вода?',
    answers: ['количеството разтворено вещество', 'моларната концентрация', 'масовата част', 'обемът на разтвора'],
    correctAnswer: 'количеството разтворено вещество',
  },
  {
    question: 'Как правилно се разрежда концентрирана сярна киселина?',
    answers: ['киселината се налива бавно във водата при разбъркване', 'водата се налива бързо в киселината', 'двете се смесват наведнъж', 'киселината първо се загрява'],
    correctAnswer: 'киселината се налива бавно във водата при разбъркване',
  },
  {
    question: 'Какво означава 1 ppm във воден разтвор?',
    answers: ['около 1 mg вещество в 1 kg разтвор', '1 g в 1 kg', '1 mol в 1 L', '1% от масата'],
    correctAnswer: 'около 1 mg вещество в 1 kg разтвор',
  },
  {
    question: 'При разтваряне на амониев нитрат $\\mathrm{NH_4NO_3}$ във вода разтворът…',
    answers: ['изстива', 'се затопля', 'кипва', 'не променя температурата си'],
    correctAnswer: 'изстива',
  },
];

// ---------- Страница ----------

export function Solutions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Разтвори и концентрации</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧤 Зимна разходка, премръзнали пръсти – и в джоба ти има пластмасово пликче с прозрачна течност и малко метално дискче. Огъваш
            дискчето, щрак! – и за секунди течността побелява, втвърдява се и става топла, около 50 °C. Вътре няма батерия, нито огън: това е
            <strong> пренаситен разтвор</strong> на натриев ацетат. Във водата е разтворено много повече вещество, отколкото тя може да „удържи“, и
            сместа само чака повод да кристализира – а при <Term id="crystallization">кристализацията</Term> се отделя топлина. После пликчето се вари във вода, кристалите отново се
            разтварят и грейката е готова за нова употреба.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Разтвор, разтворител и разтворено вещество</h2>
          <p className={text}>
            В урока{' '}
            <Link to="/chemistry/structure/substances" className={link}>
              Вещества, смеси и разделяне
            </Link>{' '}
            видяхме, че разтворите са <Term id="homogeneous-mixture">хомогенни смеси</Term>, и пресмятахме <Term id="mass-fraction">масовата част</Term> на солта в тях. Сега ще разберем какво става при разтварянето,
            колко вещество може да се разтвори и как химиците описват състава на разтвора в молове.
          </p>
          <Theorem
            type="definition"
            title="Разтвор"
            description="Разтворът е хомогенна смес от разтворител и едно или повече разтворени вещества. Разтворителят обикновено е компонентът, който е в най-голямо количество (най-често вода), а разтвореното вещество може да е твърдо (сол, захар), течно (спирт) или газ (кислород, въглероден диоксид в газираните напитки)."
          />
          <p className={text}>
            Защо солта се разтваря във водата, а олиото – не, обяснихме в{' '}
            <Link to="/chemistry/structure/molecules" className={link}>
              Форма на молекулите и междумолекулни сили
            </Link>
            : подобното се разтваря в подобно. При разтварянето на йонно вещество полярните водни молекули обграждат <Term id="ion">йоните</Term> и ги „откъсват“ от
            кристала. Това обграждане се нарича <strong>хидратация</strong>.
          </p>
          <p className={text}>
            Разтварянето е съпроводено с топлинен ефект. Разрушаването на кристала поглъща енергия, а хидратацията на йоните отделя – и според
            това кое надделява, разтворът се затопля или изстива. Натриевата основа <Tex>{'\\mathrm{NaOH}'}</Tex> силно затопля водата, а амониевият нитрат
            изстудява – на това работят еднократните „студени компреси“ от аптеката.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <strong>⚠️ Безопасност:</strong> при разреждане на концентрирана сярна <Term id="acid">киселина</Term> се отделя толкова топлина, че водата може да кипне и да
            изпръска киселина. Затова винаги се налива <strong>киселината във водата</strong> – бавно, на тънка струя и при разбъркване, никога
            обратно.
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Разтворимост и криви на разтворимост</h2>
          <Theorem
            type="definition"
            title="Разтворимост и наситен разтвор"
            description="Разтворимостта $S$ е най-голямата маса вещество, която се разтваря в 100 g разтворител при дадена температура. Разтвор, в който при тази температура не може да се разтвори повече, е наситен; разтвор с по-малко вещество е ненаситен. Пренаситеният разтвор съдържа повече вещество от разтворимостта – той е неустойчив и при най-малък повод (кристалче, драскотина, удар) излишъкът кристализира."
          />
          <p className={text}>
            Разтворимостта на повечето твърди вещества расте с температурата – при някои силно (калиева селитра <Tex>{'\\mathrm{KNO_3}'}</Tex>), при други едва
            забележимо (готварска сол). Разтворимостта на газовете, обратно, <strong>намалява</strong> при затопляне: топлата газирана напитка
            „изпуска“ газа си по-бързо, а в топла вода има по-малко кислород за рибите. Стойностите в лабораторията са таблични данни от химичните
            справочници, закръглени.
          </p>
          <Example
            description="Колко е масовата част на наситен разтвор на NaCl при 20 °C ($S = 35{,}9\ \mathrm{g}$ на 100 g вода)?"
            steps={[
              'В наситения разтвор на 100 g вода се падат 35,9 g сол – общо 135,9 g разтвор.',
              '$w = \\frac{35{,}9}{135{,}9} \\approx 0{,}264 = 26{,}4\\%$',
              'Разтворимост 35,9 g не значи масова част 35,9%: делим на масата на разтвора, а не на водата.',
            ]}
          />
          <SolubilityCurveLab />
          <p className={text}>
            Прекристализацията на селитрата, която решавахме в първия урок, е точно движение по такава крива: нагряваме, разтваряме повече,
            охлаждаме – и излишъкът над кривата кристализира.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Моларна концентрация</h2>
          <p className={text}>
            Масовата част е удобна при претегляне, но <Term id="chemical-reaction">химичните реакции</Term> „броят“ частици, т.е. молове (виж{' '}
            <Link to="/chemistry/quantities/mole" className={link}>
              Мол и моларна маса
            </Link>
            ). Затова в лабораторията концентрацията най-често се дава в молове на литър.
          </p>
          <Theorem
            title="Моларна концентрация"
            description="$c = \frac{n}{V}$, където $n$ е количеството разтворено вещество в молове, а $V$ – обемът на целия разтвор в литри. Единицата е $\mathrm{mol/L}$; пише се и $\mathrm{mol \cdot dm^{-3}}$ или съкратено M („моларен“): 0,1 M NaCl означава 0,1 mol/L. Масата, която трябва да се претегли, е $m = c \cdot V \cdot M$."
          />
          <Example
            description="Каква е концентрацията на разтвор, в който 4,0 g NaOH са разтворени до 250 mL?"
            steps={[
              '$n = \\frac{m}{M} = \\frac{4{,}0}{40} = 0{,}10\\ \\mathrm{mol}$',
              '$c = \\frac{n}{V} = \\frac{0{,}10}{0{,}250} = 0{,}40\\ \\mathrm{mol/L}$',
              'Обемът е на разтвора, а не на добавената вода – затова разтворът се приготвя в мерителна колба.',
            ]}
          />
          <Theorem
            title="Връзка между масовата част и моларната концентрация"
            description="Ако разтворът има плътност $\rho$ (в g/mL) и масова част $w$, то един литър от него тежи $1000\rho$ грама и съдържа $1000\rho w$ грама вещество: $c = \frac{1000 \cdot \rho \cdot w}{M}$."
          />
          <Example
            description="Концентрираната солна киселина е около 37% HCl с плътност 1,19 g/mL. Каква е моларната ѝ концентрация?"
            steps={['$c = \\frac{1000 \\cdot 1{,}19 \\cdot 0{,}37}{36{,}5} \\approx 12{,}1\\ \\mathrm{mol/L}$', 'Затова в лабораториите я наричат „дванадесетмоларна“.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Разреждане и смесване</h2>
          <Theorem
            title="Разреждане"
            description="При добавяне на вода количеството разтворено вещество не се променя: $n = c_1 V_1 = c_2 V_2$. Обемите могат да са в милилитри и от двете страни. При смесване на два разтвора на едно и също вещество (ако обемите се събират) $c = \frac{c_1 V_1 + c_2 V_2}{V_1 + V_2}$."
          />
          <Example
            description="Колко mL 2,0 M HCl трябват за 500 mL 0,10 M HCl?"
            steps={['$V_1 = \\frac{c_2 V_2}{c_1} = \\frac{0{,}10 \\cdot 500}{2{,}0} = 25\\ \\mathrm{mL}$', 'Отмерваме 25 mL с пипета в мерителна колба от 500 mL, в която вече има вода, и допълваме до чертата.']}
          />
          <p className={text}>
            На практика обемите при смесване не се събират точно – 50 mL спирт и 50 mL вода дават по-малко от 100 mL. За разредени водни
            разтвори разликата е малка и в задачите я пренебрегваме.
          </p>
          <DilutionLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Как се приготвя разтвор</h2>
          <p className={text}>
            Точни разтвори се приготвят в <strong>мерителна колба</strong> – колба с тясно гърло и черта, до която обемът е точно 100, 250, 500 mL.
            Веществото се претегля, разтваря се в малко вода, разтворът се прелива в колбата и тя се допълва с вода до чертата. Ако веществото е{' '}
            <Term id="crystal-hydrate">кристалохидрат</Term> (например синият камък <Tex>{'\\mathrm{CuSO_4 \\cdot 5H_2O}'}</Tex>), в <Term id="molar-mass">моларната маса</Term> влиза и водата в кристалите.
          </p>
          <Example
            description="Колко грама $\mathrm{CuSO_4 \cdot 5H_2O}$ трябват за 250 mL 0,20 M разтвор на $\mathrm{CuSO_4}$?"
            steps={[
              '$n = 0{,}20 \\cdot 0{,}250 = 0{,}050\\ \\mathrm{mol}$; 1 mol кристалохидрат дава 1 mol $\\mathrm{CuSO_4}$.',
              '$M(\\mathrm{CuSO_4 \\cdot 5H_2O}) = 159{,}5 + 5 \\cdot 18 = 249{,}5\\ \\mathrm{g/mol}$',
              '$m = 0{,}050 \\cdot 249{,}5 \\approx 12{,}5\\ \\mathrm{g}$. Ако бяхме сметнали с безводния $\\mathrm{CuSO_4}$ – само 7,98 g, и разтворът щеше да е с около 36% по-разреден.',
            ]}
          />
          <PrepareSolutionLab />
          <p className={text}>
            Много малки концентрации се дават в <strong>ppm</strong> (части на милион, <Tex>{'1\\ \\mathrm{mg/kg}'}</Tex>) и <strong>ppb</strong> (части на
            милиард, <Tex>{'1\\ \\mathrm{\\mu g/kg}'}</Tex>). За разредени водни разтвори 1 ppm е практически <Tex>{'1\\ \\mathrm{mg/L}'}</Tex>. Така се дават например
            нормите за питейна вода: в ЕС пределната стойност за нитратите е 50 mg/L, а за арсена – 10 µg/L.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>
            Пресметни моларната концентрация, масата за претегляне, разреждане, ppm или масата сол в наситен разтвор. Десетичните отговори въвеждай като 0,25.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Разтворите около нас</h2>
          <p className={text}>Концентрациите са по етикетите на лекарствата, в лабораторните резултати и в нормите за питейна вода.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Обем в mL', '$c = \\frac{0{,}1\\ \\mathrm{mol}}{250\\ \\mathrm{mL}} = 0{,}0004\\ \\mathrm{mol/L}$', '$c = \\frac{0{,}1\\ \\mathrm{mol}}{0{,}250\\ \\mathrm{L}} = 0{,}4\\ \\mathrm{mol/L}$'],
              ['Обем на разтвора', '1 L разтвор = 1 L вода + солта', 'Солта се разтваря и се допълва до 1 L разтвор в мерителна колба'],
              ['Разтворимост и масова част', '$S = 35{,}9\\ \\mathrm{g} \\Rightarrow w = 35{,}9\\%$', '$w = \\frac{35{,}9}{135{,}9} \\approx 26{,}4\\%$'],
              ['Кристалохидрат', '$M(\\mathrm{CuSO_4 \\cdot 5H_2O}) = 159{,}5\\ \\mathrm{g/mol}$', '$M = 159{,}5 + 5 \\cdot 18 = 249{,}5\\ \\mathrm{g/mol}$'],
              ['Газове и температура', 'В топла вода се разтваря повече кислород.', 'Разтворимостта на газовете намалява при затопляне.'],
              ['Разреждане на киселина', 'Налива се вода в концентрираната киселина.', 'Киселината се налива бавно във водата.'],
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
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="4,0 g NaOH се разтварят във вода и разтворът се допълва до 250 mL. Каква е моларната концентрация?" check={[0.4]} ask={['c, mol/L']}>
                <p><Tex>{'n = \\frac{4{,}0}{40} = 0{,}10\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'c = \\frac{0{,}10}{0{,}250} = 0{,}4\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Разтворимостта на $\mathrm{KNO_3}$ е 110 g/100 g вода при 60 °C и 31,6 g/100 g вода при 20 °C. Колко грама селитра се разтварят в 50 g вода при 60 °C? Колко грама от 40 g селитра остават неразтворени в 50 g вода при 20 °C?" check={[55, 24.2]} ask={['разтварят се при 60 °C, g', 'неразтворени при 20 °C, g']}>
                <p>При 60 °C: <Tex>{'110 \\cdot \\frac{50}{100} = 55\\ \\mathrm{g}'}</Tex>.</p>
                <p>При 20 °C в 50 g вода се разтварят <Tex>{'31{,}6 \\cdot \\frac{50}{100} = 15{,}8\\ \\mathrm{g}'}</Tex>, остават <Tex>{'40 - 15{,}8 = 24{,}2\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="20 mL 2,0 M солна киселина се разреждат с вода до 500 mL. Каква е новата концентрация?" check={[0.08]} ask={['c, mol/L']}>
                <p><Tex>{'c_2 = \\frac{c_1 V_1}{V_2} = \\frac{2{,}0 \\cdot 20}{500} = 0{,}08\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Концентрираната сярна киселина е 98% $\mathrm{H_2SO_4}$ с плътност 1,84 g/mL. Каква е моларната ѝ концентрация? Колко mL от нея са нужни за 1,00 L 0,50 M разтвор?" check={[18.4, 27.2]} ask={['c, mol/L', 'V, mL']}>
                <p><Tex>{'c = \\frac{1000 \\cdot 1{,}84 \\cdot 0{,}98}{98} = 18{,}4\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'V_1 = \\frac{0{,}50 \\cdot 1000}{18{,}4} \\approx 27{,}2\\ \\mathrm{mL}'}</Tex></p>
                <p>Отмерената киселина се налива бавно в колба, в която вече има около половин литър вода, и след охлаждане се допълва до чертата.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Смесват се 200 mL 0,30 M и 300 mL 0,80 M разтвор на NaCl. Каква е концентрацията на получения разтвор (обемите се събират)?" check={[0.6]} ask={['c, mol/L']}>
                <p><Tex>{'n = 0{,}30 \\cdot 0{,}200 + 0{,}80 \\cdot 0{,}300 = 0{,}06 + 0{,}24 = 0{,}30\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'c = \\frac{0{,}30}{0{,}500} = 0{,}6\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко грама син камък $\mathrm{CuSO_4 \cdot 5H_2O}$ трябва да се претеглят за 250 mL 0,20 M разтвор на $\mathrm{CuSO_4}$?" check={[12.5]} ask={['маса, g']}>
                <p><Tex>{'n = 0{,}20 \\cdot 0{,}250 = 0{,}050\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'M = 63{,}5 + 32 + 4 \\cdot 16 + 5 \\cdot 18 = 249{,}5\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'m = 0{,}050 \\cdot 249{,}5 = 12{,}475 \\approx 12{,}5\\ \\mathrm{g}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="100 g наситен при 80 °C разтвор на $\mathrm{KNO_3}$ се охлаждат до 20 °C. Разтворимостта е 169 g/100 g вода при 80 °C и 31,6 g/100 g вода при 20 °C. Колко грама кристали се отделят? (Внимание: дадена е масата на разтвора, не на водата.)" check={[51.1]} ask={['кристали, g']}>
                <p>При 80 °C 269 g наситен разтвор съдържат 169 g сол. В 100 g: <Tex>{'m_{\\text{сол}} = \\frac{169}{269} \\cdot 100 \\approx 62{,}83\\ \\mathrm{g}'}</Tex>, вода <Tex>{'\\approx 37{,}17\\ \\mathrm{g}'}</Tex>.</p>
                <p>При 20 °C в тази вода остават разтворени <Tex>{'31{,}6 \\cdot 0{,}3717 \\approx 11{,}75\\ \\mathrm{g}'}</Tex>.</p>
                <p>Кристализират <Tex>{'62{,}83 - 11{,}75 \\approx 51{,}1\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="25,0 mL разтвор на NaOH с неизвестна концентрация се титруват с 0,100 M HCl; до неутрализация се изразходват 18,6 mL. Реакцията е $\mathrm{NaOH + HCl \to NaCl + H_2O}$. Каква е концентрацията на основата и колко грама NaOH има в 250 mL от този разтвор?" check={[0.0744, 0.744]} ask={['c(NaOH), mol/L', 'NaOH в 250 mL, g']}>
                <p>По уравнението NaOH и HCl реагират 1 : 1 (виж <Link to="/chemistry/quantities/stoichiometry" className={link}>стехиометрия</Link>).</p>
                <p><Tex>{'n(\\mathrm{HCl}) = 0{,}100 \\cdot 0{,}0186 = 1{,}86 \\cdot 10^{-3}\\ \\mathrm{mol} = n(\\mathrm{NaOH})'}</Tex></p>
                <p><Tex>{'c = \\frac{1{,}86 \\cdot 10^{-3}}{0{,}0250} = 0{,}0744\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'m = 0{,}0744 \\cdot 0{,}250 \\cdot 40 = 0{,}744\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Пределната стойност за арсен в питейната вода в ЕС е 10 µg/L. Колко ppb е това и каква е моларната концентрация на арсена ($A_r = 75$), изразена в $10^{-7}\ \mathrm{mol/L}$?" check={[10, 1.33]} ask={['ppb', 'c, 10⁻⁷ mol/L']}>
                <p>1 L вода има маса около 1 kg, а 1 ppb е 1 µg/kg: <Tex>{'10\\ \\mathrm{\\mu g/L} \\approx 10\\ \\mathrm{ppb}'}</Tex>.</p>
                <p><Tex>{'c = \\frac{10 \\cdot 10^{-6}\\ \\mathrm{g}}{75\\ \\mathrm{g/mol} \\cdot 1\\ \\mathrm{L}} \\approx 1{,}33 \\cdot 10^{-7}\\ \\mathrm{mol/L}'}</Tex></p>
                <p>Толкова малки концентрации се измерват с чувствителни методи като атомната спектрометрия.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Разтворът е хомогенна смес от разтворител и разтворено вещество; разтварянето може да затопля или да изстудява</li>
              <li>✓ Разтворимостта е масата вещество в наситен разтвор на 100 g вода; при твърдите вещества обикновено расте с температурата, при газовете – намалява</li>
              <li>✓ Моларна концентрация <Tex>{'c = \\frac{n}{V}'}</Tex> в mol/L; масата за претегляне <Tex>{'m = c \\cdot V \\cdot M'}</Tex></li>
              <li>✓ Връзка с масовата част: <Tex>{'c = \\frac{1000 \\rho w}{M}'}</Tex></li>
              <li>✓ При разреждане <Tex>{'c_1 V_1 = c_2 V_2'}</Tex> – <Term id="amount-of-substance">количеството вещество</Term> не се променя</li>
              <li>✓ Точни разтвори се приготвят в мерителна колба; при кристалохидратите водата влиза в моларната маса; много малки концентрации – в ppm и ppb</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Медът е естествен пренаситен разтвор: около четири пети от него са захари (главно фруктоза и глюкоза), а водата е под една пета.
              Глюкозата е повече, отколкото тази вода може да задържи разтворена, затова с времето медът „захаросва“ – глюкозата кристализира.
              Това не значи, че медът е развален или подправен. Ако бурканът постои в топла вода (не по-гореща от около 40 °C), кристалите отново се
              разтварят – точно както в кривите на разтворимост.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
