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
import BufferLab from './BufferLab';
import PhScaleLab from './PhScaleLab';
import TitrationLab from './TitrationLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const M = (v: number) => `${dec(v)}\\ \\mathrm{mol/L}`;

// Концентрациите са степени на 10 (или 5 · 10⁻ⁿ за H₂SO₄) – така pH е цяло число и отговорът е точен
const newDrill = (): Drill => {
  const kind = randInt(0, 7);
  if (kind === 0) {
    const n = randInt(1, 5);
    return {
      tex: `c(\\mathrm{HCl}) = ${M(10 ** -n)}`,
      ask: 'Какво е pH на разтвора?',
      num: n,
      den: 1,
      steps: [`HCl е силна киселина и дисоциира напълно: $[\\mathrm{H^+}] = ${M(10 ** -n)} = 10^{-${n}}\\ \\mathrm{mol/L}$`, `$\\mathrm{pH} = -\\lg 10^{-${n}} = ${n}$`],
    };
  }
  if (kind === 1) {
    const n = randInt(1, 4);
    return {
      tex: `c(\\mathrm{NaOH}) = ${M(10 ** -n)}`,
      ask: 'Какво е pH на разтвора?',
      num: 14 - n,
      den: 1,
      steps: [`$[\\mathrm{OH^-}] = 10^{-${n}}\\ \\mathrm{mol/L}$, значи $\\mathrm{pOH} = ${n}$`, `$\\mathrm{pH} = 14 - ${n} = ${14 - n}$`],
    };
  }
  if (kind === 2) {
    const p10 = randInt(10, 130);
    return {
      tex: `\\mathrm{pH} = ${dec(p10 / 10)}`,
      ask: 'Колко е pOH (при 25 °C)?',
      num: 140 - p10,
      den: 10,
      steps: [`$\\mathrm{pH} + \\mathrm{pOH} = 14$`, `$\\mathrm{pOH} = 14 - ${dec(p10 / 10)} = ${dec((140 - p10) / 10)}$`],
    };
  }
  if (kind === 3) {
    const n = randInt(1, 5);
    return {
      tex: `\\mathrm{pH} = ${n}`,
      ask: 'Каква е концентрацията на H⁺ в mol/L? (като десетична дроб)',
      num: 1,
      den: 10 ** n,
      steps: [`$[\\mathrm{H^+}] = 10^{-\\mathrm{pH}} = 10^{-${n}} = ${M(10 ** -n)}$`],
    };
  }
  if (kind === 4) {
    const a = randInt(1, 3);
    const k = randInt(1, 2);
    return {
      tex: `\\mathrm{HCl},\\ \\mathrm{pH} = ${a}`,
      ask: `Разтворът се разрежда ${10 ** k} пъти с вода. Какво става pH?`,
      num: a + k,
      den: 1,
      steps: [`$[\\mathrm{H^+}]$ намалява ${10 ** k} пъти: от $10^{-${a}}$ на $10^{-${a + k}}\\ \\mathrm{mol/L}$`, `$\\mathrm{pH} = ${a + k}$ – всяко разреждане 10 пъти вдига pH на силна киселина с единица.`],
    };
  }
  if (kind === 5) {
    const pKa = pick([3, 4, 5, 6]);
    const n = randInt(0, 2);
    return {
      tex: `K_a = 10^{-${pKa}},\\quad c = ${M(10 ** -n)}`,
      ask: 'Какво е pH на слабата киселина (приближено)?',
      num: pKa + n,
      den: 2,
      steps: [
        `$[\\mathrm{H^+}] \\approx \\sqrt{K_a c} = \\sqrt{10^{-${pKa}} \\cdot 10^{-${n}}} = 10^{-${dec((pKa + n) / 2)}}$`,
        `$\\mathrm{pH} \\approx \\frac{\\mathrm{p}K_a - \\lg c}{2} = \\frac{${pKa} + ${n}}{2} = ${dec((pKa + n) / 2)}$`,
      ],
    };
  }
  if (kind === 6) {
    // концентрациите в хилядни от mol/L
    const ca = pick([50, 100, 200]);
    const cb = pick([100, 200, 250, 500]);
    const Va = pick([10, 20, 25, 50]);
    return {
      tex: `${Va}\\ \\mathrm{mL\\ HCl},\\ c = ${M(ca / 1000)};\\quad c(\\mathrm{NaOH}) = ${M(cb / 1000)}`,
      ask: 'Колко mL NaOH неутрализират киселината?',
      num: ca * Va,
      den: cb,
      steps: [
        `$\\mathrm{HCl + NaOH \\to NaCl + H_2O}$ – реагират 1 : 1, значи $c_a V_a = c_b V_b$`,
        `$V_b = \\frac{${dec(ca / 1000)} \\cdot ${Va}}{${dec(cb / 1000)}} = ${dec((ca * Va) / cb)}\\ \\mathrm{mL}$`,
      ],
    };
  }
  const n = randInt(2, 4);
  return {
    tex: `c(\\mathrm{H_2SO_4}) = ${M(5 * 10 ** -(n + 1))}`,
    ask: 'Какво е pH, ако киселината дисоциира напълно по двете степени?',
    num: n,
    den: 1,
    steps: [`$\\mathrm{H_2SO_4 \\to 2H^+ + SO_4^{2-}}$: $[\\mathrm{H^+}] = 2 \\cdot ${dec(5 * 10 ** -(n + 1))} = ${M(10 ** -n)}$`, `$\\mathrm{pH} = ${n}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '💊 Таблетка против киселини',
    problem: 'Таблетка съдържа 400 mg магнезиев хидроксид $\\mathrm{Mg(OH)_2}$. Колко милимола HCl неутрализира тя и колко милилитра стомашен сок с концентрация на HCl 0,1 mol/L отговаря това?',
    solution: [
      '$\\mathrm{Mg(OH)_2 + 2HCl \\to MgCl_2 + 2H_2O}$',
      '$M(\\mathrm{Mg(OH)_2}) = 24 + 2 \\cdot 17 = 58\\ \\mathrm{g/mol}$, $n = \\frac{0{,}4}{58} \\approx 6{,}90\\ \\mathrm{mmol}$',
      '$n(\\mathrm{HCl}) = 2 \\cdot 6{,}90 \\approx 13{,}8\\ \\mathrm{mmol}$; $V = \\frac{13{,}8}{0{,}1} \\approx 138\\ \\mathrm{mL}$',
      'Една таблетка не неутрализира целия стомах – тя само намалява киселинността. Стомахът постоянно отделя нова киселина.',
    ],
    answer: '$\\approx 13{,}8\\ \\mathrm{mmol}$, $\\approx 138\\ \\mathrm{mL}$',
    check: [13.8, 138],
    ask: ['HCl, mmol', 'стомашен сок, mL'],
  },
  {
    title: '🫙 Колко е силен оцетът',
    problem: 'За титруването на 10,0 mL оцет с фенолфталеин са изразходвани 15,0 mL разтвор на NaOH с концентрация 0,5 mol/L. Каква е моларната концентрация на оцетната киселина и колко грама от нея има в литър оцет?',
    solution: [
      '$\\mathrm{CH_3COOH + NaOH \\to CH_3COONa + H_2O}$ – реагират 1 : 1',
      '$n = 0{,}5 \\cdot 15{,}0 = 7{,}5\\ \\mathrm{mmol}$ в 10 mL, значи $c = \\frac{7{,}5}{10} = 0{,}75\\ \\mathrm{mol/L}$',
      '$M(\\mathrm{CH_3COOH}) = 60\\ \\mathrm{g/mol}$: $0{,}75 \\cdot 60 = 45\\ \\mathrm{g/L}$ – около 4,5%, колкото е обикновеният трапезен оцет.',
    ],
    answer: '$0{,}75\\ \\mathrm{mol/L}$, $45\\ \\mathrm{g}$',
    check: [0.75, 45],
    ask: ['c, mol/L', 'оцетна киселина, g/L'],
  },
  {
    title: '🏞️ Вкиселено езеро',
    problem: 'Заради киселинни дъждове pH на планинско езеро е спаднало от 6,5 на 5,0. Колко пъти се е увеличила концентрацията на водородните йони?',
    solution: [
      '$\\frac{[\\mathrm{H^+}]_2}{[\\mathrm{H^+}]_1} = \\frac{10^{-5{,}0}}{10^{-6{,}5}} = 10^{1{,}5}$',
      '$10^{1{,}5} \\approx 31{,}6$ – „само“ 1,5 единици pH означават над 30 пъти повече киселина. Под pH около 5 много видове риби и земноводни не могат да се размножават.',
    ],
    answer: '$\\approx 31{,}6$ пъти',
    check: [31.6],
    ask: ['пъти'],
  },
  {
    title: '🍋 Лимон и кафе',
    problem: 'Лимоновият сок има pH около 2,3, а кафето – около 5,0. Каква е концентрацията на H⁺ в лимоновия сок (в mmol/L) и колко пъти е по-голяма от тази в кафето?',
    solution: [
      '$[\\mathrm{H^+}] = 10^{-2{,}3} \\approx 5{,}0 \\cdot 10^{-3}\\ \\mathrm{mol/L} = 5{,}0\\ \\mathrm{mmol/L}$',
      '$\\frac{10^{-2{,}3}}{10^{-5{,}0}} = 10^{2{,}7} \\approx 501$ – около 500 пъти.',
    ],
    answer: '$\\approx 5{,}0\\ \\mathrm{mmol/L}$, $\\approx 500$ пъти',
    check: [5.0, 501],
    ask: ['[H⁺], mmol/L', 'пъти'],
  },
  {
    title: '🩸 Буферът в кръвта',
    problem: 'pH на кръвта се поддържа около 7,4 главно от двойката $\\mathrm{CO_2/HCO_3^-}$. При телесна температура за нея се използва $\\mathrm{p}K_a \\approx 6{,}1$. Какво е отношението $[\\mathrm{HCO_3^-}] : [\\mathrm{CO_2}]$ в кръвта?',
    solution: [
      'По уравнението на Хендерсън–Хаселбалх: $7{,}4 = 6{,}1 + \\lg\\frac{[\\mathrm{HCO_3^-}]}{[\\mathrm{CO_2}]}$',
      '$\\frac{[\\mathrm{HCO_3^-}]}{[\\mathrm{CO_2}]} = 10^{1{,}3} \\approx 20$',
      'Буферът е „настроен“ срещу киселини – а тъкмо те се получават при обмяната на веществата. Излишният $\\mathrm{CO_2}$ се издишва, така че дробовете също помагат за pH.',
    ],
    answer: '$\\approx 20 : 1$',
    check: [20],
    ask: ['отношение'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво е киселина според теорията на Брьонстед и Лоури?',
    answers: ['донор на протони (H⁺)', 'акцептор на протони', 'вещество, което отделя OH⁻ във вода', 'вещество с вкус на лимон'],
    correctAnswer: 'донор на протони (H⁺)',
  },
  {
    question: 'Какво е pH на разтвор на HCl с концентрация 0,01 mol/L?',
    answers: ['$2$', '$1$', '$0{,}01$', '$12$'],
    correctAnswer: '$2$',
  },
  {
    question: 'pH на разтвор намалява от 6 на 4. Как се променя концентрацията на H⁺?',
    answers: ['расте 100 пъти', 'расте 2 пъти', 'намалява 100 пъти', 'расте 20 пъти'],
    correctAnswer: 'расте 100 пъти',
  },
  {
    question: 'Коя е спрегнатата основа на амониевия йон $\\mathrm{NH_4^+}$?',
    answers: ['$\\mathrm{NH_3}$', '$\\mathrm{NH_2^-}$', '$\\mathrm{OH^-}$', '$\\mathrm{H_3O^+}$'],
    correctAnswer: '$\\mathrm{NH_3}$',
  },
  {
    question: 'Колко е $[\\mathrm{OH^-}]$ в разтвор с pH 3 при 25 °C?',
    answers: ['$10^{-11}\\ \\mathrm{mol/L}$', '$10^{-3}\\ \\mathrm{mol/L}$', '$10^{-7}\\ \\mathrm{mol/L}$', '$10^{-14}\\ \\mathrm{mol/L}$'],
    correctAnswer: '$10^{-11}\\ \\mathrm{mol/L}$',
  },
  {
    question: 'Какво означава, че оцетната киселина е слаба?',
    answers: ['във вода дисоциира само малка част от молекулите ѝ', 'разтворът ѝ винаги е разреден', 'не реагира с основи', 'има pH над 7'],
    correctAnswer: 'във вода дисоциира само малка част от молекулите ѝ',
  },
  {
    question: 'Кой индикатор е подходящ за титруване на оцетна киселина с NaOH?',
    answers: ['фенолфталеин', 'метилоранж', 'метилчервено', 'всеки от тях'],
    correctAnswer: 'фенолфталеин',
  },
  {
    question: 'Каква е средата на воден разтвор на натриев ацетат $\\mathrm{CH_3COONa}$?',
    answers: ['слабо основна', 'неутрална', 'слабо кисела', 'силно кисела'],
    correctAnswer: 'слабо основна',
  },
  {
    question: 'Буфер съдържа равни концентрации на слаба киселина и нейната сол. На какво е равно pH?',
    answers: ['$\\mathrm{p}K_a$', '$7$', '$\\mathrm{p}K_a / 2$', '$14 - \\mathrm{p}K_a$'],
    correctAnswer: '$\\mathrm{p}K_a$',
  },
];

// ---------- Страница ----------

const ACIDS: [string, string, string][] = [
  ['флуороводородна', '\\mathrm{HF}', '3{,}17'],
  ['мравчена', '\\mathrm{HCOOH}', '3{,}75'],
  ['оцетна', '\\mathrm{CH_3COOH}', '4{,}76'],
  ['въглеродна (I степен)', '\\mathrm{H_2CO_3}', '6{,}35'],
  ['хипохлориста', '\\mathrm{HClO}', '7{,}53'],
  ['циановодородна', '\\mathrm{HCN}', '9{,}21'],
  ['амониев йон', '\\mathrm{NH_4^+}', '9{,}25'],
];

const INDICATORS: [string, string, string, string][] = [
  ['метилоранж', '3{,}1 – 4{,}4', 'червен', 'жълт'],
  ['метилчервено', '4{,}4 – 6{,}2', 'червен', 'жълт'],
  ['лакмус', '4{,}5 – 8{,}3', 'червен', 'син'],
  ['бромтимолово синьо', '6{,}0 – 7{,}6', 'жълт', 'син'],
  ['фенолфталеин', '8{,}2 – 10{,}0', 'безцветен', 'малиновочервен'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function AcidsBases() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Киселини, основи и pH</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍺 През 1909 г. датският химик Сьорен Сьоренсен работи в лабораторията на пивоварната „Карлсберг“ в Копенхаген и изучава <Term id="enzyme">ензимите</Term>.
            Оказва се, че те са изключително чувствителни към киселинността – но концентрациите на водородните йони са числа като
            0,0000001 mol/L, с които е неудобно да се работи. Сьоренсен предлага прост трик: вместо самата концентрация да се записва
            показателят на степента ѝ, с обратен знак. Така се ражда <strong>pH</strong> – една от най-използваните величини в науката. Какво точно
            означава буквата „p“, и до днес се спори.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Киселини и основи по Арениус</h2>
          <p className={text}>
            Киселините имат кисел вкус, оцветяват лакмуса в червено и разтварят някои метали с отделяне на водород. Основите са сапунени на
            пипане, оцветяват лакмуса в синьо и неутрализират киселините. Първото обяснение на тези свойства дава Сванте Арениус през 1884 г.:
            във вода тези вещества се разпадат на <Term id="ion">йони</Term>.
          </p>
          <Theorem
            type="definition"
            title="Киселина и основа по Арениус"
            description="Киселина е вещество, което във воден разтвор отделя водородни йони $\mathrm{H^+}$: $\mathrm{HCl \to H^+ + Cl^-}$. Основа е вещество, което във воден разтвор отделя хидроксидни йони $\mathrm{OH^-}$: $\mathrm{NaOH \to Na^+ + OH^-}$."
          />
          <p className={text}>
            Свободен <Term id="proton">протон</Term> във вода всъщност не съществува – той веднага се свързва с молекула вода и образува хидроксониев йон{' '}
            <Tex>{'\\mathrm{H_3O^+}'}</Tex>. За краткост пишем <Tex>{'\\mathrm{H^+}'}</Tex>, но трябва да помним, че имаме предвид{' '}
            <Tex>{'\\mathrm{H_3O^+}'}</Tex>. Теорията на Арениус обаче не обяснява защо амонякът <Tex>{'\\mathrm{NH_3}'}</Tex> е основа – в
            молекулата му няма <Tex>{'\\mathrm{OH}'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Теорията на Брьонстед и Лоури</h2>
          <Theorem
            type="definition"
            title="Киселина и основа по Брьонстед–Лоури"
            description="Киселина е донор на протони (отдава $\mathrm{H^+}$), а основа е акцептор на протони (приема $\mathrm{H^+}$). Киселинно-основната реакция е пренос на протон от киселината към основата."
          />
          <p className={text}>
            Тази идея предлагат независимо един от друг Йоханес Брьонстед и Томас Лоури през 1923 г. Щом киселината отдаде протон, остава
            частица, която може да го приеме обратно – <strong>спрегнатата ѝ основа</strong>. Двете образуват спрегната двойка, която се
            различава точно с един протон:
          </p>
          <Tex block className="mb-4 overflow-x-auto overflow-y-hidden py-1">{'\\underset{\\text{основа}}{\\mathrm{NH_3}} + \\underset{\\text{киселина}}{\\mathrm{H_2O}} \\rightleftharpoons \\underset{\\text{спрегната киселина}}{\\mathrm{NH_4^+}} + \\underset{\\text{спрегната основа}}{\\mathrm{OH^-}}'}</Tex>
          <p className={text}>
            Тук водата е киселина, а в <Tex>{'\\mathrm{HCl + H_2O \\to H_3O^+ + Cl^-}'}</Tex> – основа. Вещества, които могат да бъдат и
            едното, и другото, се наричат <strong>амфотерни</strong>. Колкото по-силна е киселината, толкова по-слаба е спрегнатата ѝ основа:{' '}
            <Tex>{'\\mathrm{Cl^-}'}</Tex> практически не приема протони, а ацетатният йон <Tex>{'\\mathrm{CH_3COO^-}'}</Tex> ги приема охотно.
          </p>
          <Example
            description="Намерете спрегнатите двойки в реакцията $\mathrm{CH_3COOH + H_2O \rightleftharpoons CH_3COO^- + H_3O^+}$."
            steps={[
              '$\\mathrm{CH_3COOH}$ отдава протон – тя е киселината, а $\\mathrm{CH_3COO^-}$ е спрегнатата ѝ основа.',
              '$\\mathrm{H_2O}$ приема протон – тя е основата, а $\\mathrm{H_3O^+}$ е спрегнатата ѝ киселина.',
              'Двойките са $\\mathrm{CH_3COOH/CH_3COO^-}$ и $\\mathrm{H_3O^+/H_2O}$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Йонното произведение на водата и pH</h2>
          <p className={text}>
            Дори най-чистата вода провежда слабо ток: малка част от молекулите ѝ си разменят протони,{' '}
            <Tex>{'\\mathrm{H_2O + H_2O \\rightleftharpoons H_3O^+ + OH^-}'}</Tex>. При 25 °C това са около две молекули на всеки милиард.
          </p>
          <Theorem
            title="Йонно произведение на водата"
            description="Във всеки воден разтвор при 25 °C $K_w = [\mathrm{H^+}] \cdot [\mathrm{OH^-}] = 1{,}0 \cdot 10^{-14}$. В чиста вода $[\mathrm{H^+}] = [\mathrm{OH^-}] = 10^{-7}\ \mathrm{mol/L}$. Ако добавим киселина, $[\mathrm{H^+}]$ расте, а $[\mathrm{OH^-}]$ намалява така, че произведението остава същото."
          />
          <Theorem
            type="definition"
            title="pH и pOH"
            description="$\mathrm{pH} = -\lg[\mathrm{H^+}]$, $\mathrm{pOH} = -\lg[\mathrm{OH^-}]$, а при 25 °C $\mathrm{pH} + \mathrm{pOH} = 14$. Среда с $\mathrm{pH} < 7$ е кисела, с $\mathrm{pH} = 7$ – неутрална, с $\mathrm{pH} > 7$ – основна. Обратно: $[\mathrm{H^+}] = 10^{-\mathrm{pH}}$."
          />
          <p className={text}>
            Понеже pH е <Term id="common-logarithm">десетичен логаритъм</Term>, всяка единица pH означава десет пъти различна концентрация:{' '}
            <Term id="solution">разтвор</Term> с pH 3 е 10 пъти по-кисел от разтвор с pH 4 и 1000 пъти по-кисел от разтвор с pH 6. Константата <Tex>{'K_w'}</Tex> зависи от
            температурата – при 100 °C неутралната вода има pH около 6,1, без да е кисела.
          </p>
          <Example
            description="Какво е pH на разтвор на NaOH с концентрация 0,001 mol/L?"
            steps={[
              'NaOH е силна основа: $[\\mathrm{OH^-}] = 10^{-3}\\ \\mathrm{mol/L}$, $\\mathrm{pOH} = 3$',
              '$\\mathrm{pH} = 14 - 3 = 11$',
              'Същото и през $K_w$: $[\\mathrm{H^+}] = \\frac{10^{-14}}{10^{-3}} = 10^{-11}\\ \\mathrm{mol/L}$.',
            ]}
          />
          <PhScaleLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Силни и слаби киселини</h2>
          <p className={text}>
            <strong>Силните киселини</strong> – <Tex>{'\\mathrm{HCl}'}</Tex>, <Tex>{'\\mathrm{HBr}'}</Tex>, <Tex>{'\\mathrm{HI}'}</Tex>,{' '}
            <Tex>{'\\mathrm{HNO_3}'}</Tex>, <Tex>{'\\mathrm{HClO_4}'}</Tex> и <Tex>{'\\mathrm{H_2SO_4}'}</Tex> (по първата степен) – в разреден
            разтвор дисоциират практически напълно, затова <Tex>{'[\\mathrm{H^+}] = c'}</Tex>. Силни основи са <Term id="hydroxide">хидроксидите</Term> на <Term id="alkali-metals">алкалните
            метали</Term> и на Ca, Sr, Ba. <strong>Слабите киселини</strong> дисоциират само частично и в разтвора се установява{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              химично равновесие
            </Link>
            . Силата им се мери с константата на равновесието:
          </p>
          <Theorem
            type="definition"
            title="Константа на дисоциация на киселина"
            description="За $\mathrm{HA \rightleftharpoons H^+ + A^-}$: $K_a = \frac{[\mathrm{H^+}][\mathrm{A^-}]}{[\mathrm{HA}]}$ и $\mathrm{p}K_a = -\lg K_a$. Колкото по-малко е $\mathrm{p}K_a$, толкова по-силна е киселината. Степента на дисоциация $\alpha$ е частта от молекулите, които са се разпаднали на йони."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Киселина</th>
                  <th className={th}>Формула</th>
                  <th className={th}>
                    <Tex>{'\\mathrm{p}K_a'}</Tex> (25 °C)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACIDS.map(([name, f, pKa]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{f}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{pKa}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Стойностите в различните справочници се разминават с няколко стотни. Ако киселината е слаба и не много разредена, дисоциира
            малка част от нея и <Tex>{'[\\mathrm{HA}] \\approx c'}</Tex>. Тогава от <Tex>{'K_a'}</Tex> следва прост извод:
          </p>
          <Theorem
            title="Закон за разреждането на Оствалд"
            description="За слаба киселина с концентрация $c$: $\alpha \approx \sqrt{\frac{K_a}{c}}$, $[\mathrm{H^+}] = \alpha c \approx \sqrt{K_a c}$, $\mathrm{pH} \approx \frac{\mathrm{p}K_a - \lg c}{2}$. При разреждане степента на дисоциация расте. Приближението е добро, докато $\alpha$ е под около 5%."
          />
          <Example
            description="Каква е степента на дисоциация и pH на оцетна киселина с концентрация 0,1 mol/L ($K_a \approx 1{,}8 \cdot 10^{-5}$)?"
            steps={[
              '$\\alpha \\approx \\sqrt{\\frac{1{,}8 \\cdot 10^{-5}}{0{,}1}} = \\sqrt{1{,}8 \\cdot 10^{-4}} \\approx 0{,}0134$ – само 1,34% от молекулите',
              '$[\\mathrm{H^+}] = 0{,}0134 \\cdot 0{,}1 = 1{,}34 \\cdot 10^{-3}\\ \\mathrm{mol/L}$, $\\mathrm{pH} \\approx 2{,}87$',
              'Солна киселина със същата концентрация има pH 1 – около 75 пъти повече $\\mathrm{H^+}$.',
            ]}
          />
          <p className={text}>
            По същия начин силата на слабите основи се мери с <Tex>{'K_b'}</Tex>. За спрегната двойка{' '}
            <Tex>{'K_a \\cdot K_b = K_w'}</Tex>: колкото по-слаба е киселината, толкова по-силна е спрегнатата ѝ основа.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Неутрализация и титруване</h2>
          <p className={text}>
            При реакцията между киселина и основа се получават сол и вода. Същността ѝ в разреден разтвор е една и съща за всички силни
            киселини и основи: <Tex>{'\\mathrm{H^+ + OH^- \\to H_2O}'}</Tex>. Затова неизвестна концентрация на киселина може да се намери,
            като към нея се добавя основа с известна концентрация, докато се неутрализира. Това е <strong>титруването</strong>.
          </p>
          <Theorem
            title="Еквивалентна точка"
            description="В еквивалентната точка основата е добавена точно в количеството по уравнението. За едноосновна киселина и едновалентна основа $n(\mathrm{HA}) = n(\mathrm{OH^-})$, т.е. $c_a V_a = c_b V_b$. При силна киселина и силна основа тук $\mathrm{pH} = 7$; при слаба киселина и силна основа $\mathrm{pH} > 7$, защото получената сол хидролизира: $\mathrm{CH_3COO^- + H_2O \rightleftharpoons CH_3COOH + OH^-}$."
          />
          <p className={text}>
            Краят на титруването се вижда по <strong>индикатор</strong> – слаба органична киселина, чиято спрегната основа има друг цвят.
            Индикаторът сменя цвета си в интервал от около две единици pH около своето <Tex>{'\\mathrm{p}K_a'}</Tex>. Подходящ е този, чийто
            интервал попада в стръмния скок на кривата на титруване.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Индикатор</th>
                  <th className={th}>Интервал на прехода (pH)</th>
                  <th className={th}>Кисела форма</th>
                  <th className={th}>Основна форма</th>
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map(([name, range, acid, base]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{range}</Tex>
                    </td>
                    <td className={td}>{acid}</td>
                    <td className={td}>{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="За неутрализацията на 20,0 mL солна киселина са изразходвани 16,0 mL NaOH с концентрация 0,100 mol/L. Каква е концентрацията на киселината?"
            steps={[
              '$n(\\mathrm{NaOH}) = 0{,}100 \\cdot 16{,}0 = 1{,}60\\ \\mathrm{mmol} = n(\\mathrm{HCl})$',
              '$c(\\mathrm{HCl}) = \\frac{1{,}60}{20{,}0} = 0{,}0800\\ \\mathrm{mol/L}$',
            ]}
          />
          <TitrationLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Буферни разтвори</h2>
          <Theorem
            type="definition"
            title="Буферен разтвор"
            description="Буферът е разтвор на слаба киселина и нейната спрегната основа (например $\mathrm{CH_3COOH}$ и $\mathrm{CH_3COONa}$) в сравними количества. Той запазва pH почти постоянно при добавяне на малко киселина или основа и при разреждане."
          />
          <p className={text}>
            Как работи? Добавените <Tex>{'\\mathrm{H^+}'}</Tex> се свързват от основата:{' '}
            <Tex>{'\\mathrm{CH_3COO^- + H^+ \\to CH_3COOH}'}</Tex>, а добавените <Tex>{'\\mathrm{OH^-}'}</Tex> – от киселината:{' '}
            <Tex>{'\\mathrm{CH_3COOH + OH^- \\to CH_3COO^- + H_2O}'}</Tex>. Силната киселина или основа се превръща в слаба и pH едва се
            помръдва – докато не се изчерпи единият от компонентите.
          </p>
          <Theorem
            title="Уравнение на Хендерсън–Хаселбалх (за напреднали)"
            description="$\mathrm{pH} = \mathrm{p}K_a + \lg\frac{[\mathrm{A^-}]}{[\mathrm{HA}]}$. При равни концентрации на киселината и солта $\mathrm{pH} = \mathrm{p}K_a$; буферът действа добре в интервала $\mathrm{p}K_a \pm 1$."
          />
          <Example
            description="Какво е pH на разтвор, съдържащ 0,1 mol/L оцетна киселина и 0,2 mol/L натриев ацетат ($\mathrm{p}K_a = 4{,}76$)?"
            steps={['$\\mathrm{pH} = 4{,}76 + \\lg\\frac{0{,}2}{0{,}1} = 4{,}76 + 0{,}30 = 5{,}06$']}
          />
          <BufferLab />
          <p className={text}>
            Буфери има навсякъде около нас: в кръвта (<Tex>{'\\mathrm{CO_2/HCO_3^-}'}</Tex> и фосфатите поддържат pH 7,35–7,45), в морската вода,
            в почвата, в шампоаните и лекарствата. В лабораторията с буфери се калибрират pH-метрите.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>pH на силни киселини и основи, pOH, концентрация на H⁺, разреждане, слаби киселини и неутрализация. Десетичните отговори въвеждай като 3,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Киселини и основи в живота</h2>
          <p className={text}>Таблетки за <Term id="stomach">стомах</Term>, оцет, езера, лимони и собствената ни кръв – навсякъде pH има значение.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['pH е линейна скала', 'pH 3 е два пъти по-кисело от pH 6.', 'Разликата е 3 единици – $10^3 = 1000$ пъти повече $\\mathrm{H^+}$.'],
              ['Разреждане до основна среда', 'Ако разредим киселина 10⁹ пъти, pH става 10.', 'pH на разредена киселина се доближава до 7, но не го надминава – остава водата.'],
              ['Слаба = разредена', 'Оцетната киселина е слаба, значи разтворът ѝ е разреден.', '„Слаба“ означава малка степен на дисоциация; ледената оцетна киселина е концентрирана, но слаба.'],
              ['$[\\mathrm{H^+}] = c$ за всяка киселина', 'pH на 0,1 M оцетна киселина е 1.', 'Това важи само за силни киселини; за оцетната $\\mathrm{pH} \\approx 2{,}9$.'],
              ['Неутрално в еквивалентната точка', 'При титруване pH в еквивалентната точка винаги е 7.', 'Само при силна киселина и силна основа; със слаба киселина е над 7.'],
              ['Знакът в pH', '$\\mathrm{pH} = \\lg[\\mathrm{H^+}]$', '$\\mathrm{pH} = -\\lg[\\mathrm{H^+}]$ – иначе pH би било отрицателно.'],
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
              <Task id="a1" number={1} color="border-green-500" question="Какво е pH на разтвор на HCl с концентрация 0,01 mol/L и на разтвор на NaOH със същата концентрация?" check={[2, 12]} ask={['pH на HCl', 'pH на NaOH']}>
                <p><Tex>{'[\\mathrm{H^+}] = 10^{-2}\\ \\mathrm{mol/L} \\Rightarrow \\mathrm{pH} = 2'}</Tex></p>
                <p><Tex>{'[\\mathrm{OH^-}] = 10^{-2}\\ \\mathrm{mol/L} \\Rightarrow \\mathrm{pOH} = 2,\\ \\mathrm{pH} = 12'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Разтвор има pH 3. Каква е концентрацията на $\mathrm{H^+}$ и колко е pOH?" check={[0.001, 11]} ask={['$[\\mathrm{H^+}]$, mol/L', 'pOH']}>
                <p><Tex>{'[\\mathrm{H^+}] = 10^{-3} = 0{,}001\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'\\mathrm{pOH} = 14 - 3 = 11'}</Tex>, т.е. <Tex>{'[\\mathrm{OH^-}] = 10^{-11}\\ \\mathrm{mol/L}'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко милилитра NaOH с концентрация 0,1 mol/L са нужни за неутрализацията на 20 mL HCl с концентрация 0,15 mol/L? Колко грама NaCl се получават?" check={[30, 0.176]} ask={['NaOH, mL', 'NaCl, g']}>
                <p><Tex>{'n(\\mathrm{HCl}) = 0{,}15 \\cdot 20 = 3\\ \\mathrm{mmol}'}</Tex>; реагират 1 : 1.</p>
                <p><Tex>{'V(\\mathrm{NaOH}) = \\frac{3}{0{,}1} = 30\\ \\mathrm{mL}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{NaCl}) = 0{,}003 \\cdot 58{,}5 \\approx 0{,}176\\ \\mathrm{g}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Каква е степента на дисоциация (в %) и pH на оцетна киселина с концентрация 0,1 mol/L ($K_a = 1{,}8 \cdot 10^{-5}$)?" check={[1.34, 2.87]} ask={['$\\alpha$, %', 'pH']}>
                <p><Tex>{'\\alpha \\approx \\sqrt{\\frac{K_a}{c}} = \\sqrt{1{,}8 \\cdot 10^{-4}} \\approx 0{,}0134 = 1{,}34\\%'}</Tex></p>
                <p><Tex>{'[\\mathrm{H^+}] = \\alpha c \\approx 1{,}34 \\cdot 10^{-3}\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'\\mathrm{pH} \\approx 2{,}87'}</Tex></p>
                <p>Точното решение на квадратното уравнение дава pH 2,88 – приближението е много добро.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Смесват 50 mL HCl с концентрация 0,2 mol/L и 50 mL NaOH с концентрация 0,1 mol/L. Какво е pH на получения разтвор?" check={[1.3]} ask={['pH']}>
                <p><Tex>{'n(\\mathrm{H^+}) = 10\\ \\mathrm{mmol}'}</Tex>, <Tex>{'n(\\mathrm{OH^-}) = 5\\ \\mathrm{mmol}'}</Tex> – остават 5 mmol <Tex>{'\\mathrm{H^+}'}</Tex>.</p>
                <p>Общият обем е 100 mL: <Tex>{'[\\mathrm{H^+}] = \\frac{5}{100} = 0{,}05\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'\\mathrm{pH} = -\\lg 0{,}05 \\approx 1{,}30'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко пъти трябва да се разреди солна киселина, за да се промени pH от 1 на 3? Може ли с разреждане да се стигне до pH 8?" check={[100]} ask={['пъти']}>
                <p><Tex>{'[\\mathrm{H^+}]'}</Tex> трябва да намалее от <Tex>{'10^{-1}'}</Tex> на <Tex>{'10^{-3}'}</Tex> – 100 пъти.</p>
                <p>Не: при много силно разреждане <Tex>{'\\mathrm{H^+}'}</Tex> от самата вода (<Tex>{'10^{-7}\\ \\mathrm{mol/L}'}</Tex>) стават повече от тези от киселината и pH само се доближава до 7.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Буферен разтвор съдържа по 0,1 mol/L оцетна киселина и натриев ацетат ($\mathrm{p}K_a = 4{,}76$). Какво е pH? Какво става pH, ако в 1 L от него се добавят 0,01 mol HCl (обемът не се променя)?" check={[4.76, 4.67]} ask={['pH преди', 'pH след']}>
                <p>При равни концентрации <Tex>{'\\mathrm{pH} = \\mathrm{p}K_a = 4{,}76'}</Tex>.</p>
                <p><Tex>{'\\mathrm{CH_3COO^- + H^+ \\to CH_3COOH}'}</Tex>: ацетатът става 0,09 mol, киселината – 0,11 mol.</p>
                <p><Tex>{'\\mathrm{pH} = 4{,}76 + \\lg\\frac{0{,}09}{0{,}11} \\approx 4{,}67'}</Tex>. В 1 L чиста вода същото количество HCl би дало pH 2 – промяна с 5 единици.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="25 mL оцетна киселина с концентрация 0,1 mol/L ($\mathrm{p}K_a = 4{,}76$) се титруват с NaOH 0,1 mol/L. Какво е pH при добавени 12,5 mL и в еквивалентната точка?" check={[4.76, 8.73]} ask={['pH при 12,5 mL', 'pH в екв. точка']}>
                <p>При 12,5 mL половината киселина е превърната в ацетат: <Tex>{'[\\mathrm{A^-}] = [\\mathrm{HA}]'}</Tex>, значи <Tex>{'\\mathrm{pH} = \\mathrm{p}K_a = 4{,}76'}</Tex>.</p>
                <p>В еквивалентната точка има само ацетат: 2,5 mmol в 50 mL, <Tex>{'c = 0{,}05\\ \\mathrm{mol/L}'}</Tex>. За него <Tex>{'\\mathrm{p}K_b = 14 - 4{,}76 = 9{,}24'}</Tex>.</p>
                <p><Tex>{'\\mathrm{pOH} \\approx \\frac{9{,}24 - \\lg 0{,}05}{2} = \\frac{9{,}24 + 1{,}30}{2} \\approx 5{,}27'}</Tex>, <Tex>{'\\mathrm{pH} \\approx 8{,}73'}</Tex> – затова се ползва фенолфталеин.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Разтвор на слаба киселина HA с концентрация 0,05 mol/L има pH 3,0. Каква е степента на дисоциация (в %) и $\mathrm{p}K_a$?" check={[2, 4.69]} ask={['$\\alpha$, %', '$\\mathrm{p}K_a$']}>
                <p><Tex>{'[\\mathrm{H^+}] = [\\mathrm{A^-}] = 10^{-3}\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'\\alpha = \\frac{10^{-3}}{0{,}05} = 0{,}02 = 2\\%'}</Tex></p>
                <p><Tex>{'K_a = \\frac{(10^{-3})^2}{0{,}05 - 0{,}001} = \\frac{10^{-6}}{0{,}049} \\approx 2{,}04 \\cdot 10^{-5}'}</Tex></p>
                <p><Tex>{'\\mathrm{p}K_a = -\\lg(2{,}04 \\cdot 10^{-5}) \\approx 4{,}69'}</Tex> – близо до оцетната киселина.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ По Арениус киселините отделят <Tex>{'\\mathrm{H^+}'}</Tex>, а основите – <Tex>{'\\mathrm{OH^-}'}</Tex>; по Брьонстед–Лоури киселината е донор, а основата – акцептор на протони</li>
              <li>✓ Спрегнатите двойки (<Tex>{'\\mathrm{HA/A^-}'}</Tex>) се различават с един протон</li>
              <li>✓ <Tex>{'K_w = [\\mathrm{H^+}][\\mathrm{OH^-}] = 10^{-14}'}</Tex> при 25 °C; <Tex>{'\\mathrm{pH} = -\\lg[\\mathrm{H^+}]'}</Tex>, <Tex>{'\\mathrm{pH} + \\mathrm{pOH} = 14'}</Tex></li>
              <li>✓ Силните киселини дисоциират напълно; за слабите <Tex>{'K_a'}</Tex>, <Tex>{'\\alpha \\approx \\sqrt{K_a/c}'}</Tex> и <Tex>{'[\\mathrm{H^+}] \\approx \\sqrt{K_a c}'}</Tex></li>
              <li>✓ При неутрализация <Tex>{'\\mathrm{H^+ + OH^- \\to H_2O}'}</Tex>; в еквивалентната точка <Tex>{'c_a V_a = c_b V_b'}</Tex>; индикаторът трябва да сменя цвета си в скока на pH</li>
              <li>✓ Буферът (слаба киселина + спрегнатата ѝ основа) задържа pH: <Tex>{'\\mathrm{pH} = \\mathrm{p}K_a + \\lg\\frac{[\\mathrm{A^-}]}{[\\mathrm{HA}]}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Индикатор можеш да направиш и вкъщи: свари нарязано червено зеле и прецеди отварата. Багрилата в нея (антоцианите) са червени в
              кисела среда, лилави – в близка до неутралната, и синьо-зелени до жълти в силно основна. Капни от отварата в оцет, в разтвор на
              сода бикарбонат и в сапунена вода – ще получиш цяла дъга от цветове.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
