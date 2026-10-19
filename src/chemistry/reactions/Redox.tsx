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
import { formulaTex, formulaText } from '../formula';
import ElectronBalanceLab from './ElectronBalanceLab';
import GalvanicCellLab from './GalvanicCellLab';
import OxidationLadderLab from './OxidationLadderLab';
import { BALANCE, FAMILIES, METALS, signed, solveOxidation } from './redoxData';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
/** Число със знак в LaTeX: −0,76 → -0{,}76, 0,34 → +0{,}34. */
const sgn = (v: number) => (v > 0 ? `+${dec(v)}` : dec(v));

// Частици с цяла степен на окисление и поне един известен елемент
const DRILL_SPECIES = FAMILIES.flatMap(f => f.species).filter(s => {
  const r = solveOxidation(s);
  return Number.isInteger(r.ox) && r.parts.length > 0 && !s.note;
});

const speciesTex = (s: (typeof DRILL_SPECIES)[number]) => {
  const special: Record<string, string> = { NH4: '\\mathrm{NH_4^+}', CH4O: '\\mathrm{CH_3OH}', CH2O: '\\mathrm{HCHO}', CH2O2: '\\mathrm{HCOOH}' };
  return special[s.f] ?? formulaTex(s.f);
};

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind <= 1) {
    const s = pick(DRILL_SPECIES);
    const r = solveOxidation(s);
    const known = r.parts.map(p => `${p.count > 1 ? `${p.count} \\cdot ` : ''}(${signed(p.ox).replace('−', '-')})`).join(' + ');
    return {
      tex: speciesTex(s),
      ask: `Каква е степента на окисление на ${s.el}?`,
      num: r.ox,
      den: 1,
      steps: [
        `Известни: ${r.parts.map(p => `${p.el} е ${signed(p.ox)}`).join(', ')}. Сборът е равен на заряда ${r.charge === 0 ? '(0 за молекула)' : `(${signed(r.charge)})`}.`,
        `$${known} + ${r.n > 1 ? `${r.n}x` : 'x'} = ${r.charge} \\Rightarrow x = ${r.ox}$`,
      ],
    };
  }
  if (kind === 2) {
    const i = randInt(0, METALS.length - 2);
    const j = randInt(i + 1, METALS.length - 1);
    const [an, ca] = [METALS[i], METALS[j]];
    const e100 = Math.round(ca.E * 100) - Math.round(an.E * 100);
    return {
      tex: `\\mathrm{${an.s}} \\,|\\, \\mathrm{${an.s}^{${an.z > 1 ? an.z : ''}+}} \\,\\|\\, \\mathrm{${ca.s}^{${ca.z > 1 ? ca.z : ''}+}} \\,|\\, \\mathrm{${ca.s}}`,
      ask: 'Какво е стандартното напрежение на елемента (във волтове)?',
      num: e100,
      den: 100,
      steps: [
        `$E^\\circ(\\mathrm{${an.s}}) = ${sgn(an.E)}\\ \\mathrm{V}$, $E^\\circ(\\mathrm{${ca.s}}) = ${sgn(ca.E)}\\ \\mathrm{V}$ – анод е ${an.s} (по-нисък потенциал).`,
        `$E = E^\\circ_{\\text{катод}} - E^\\circ_{\\text{анод}} = ${sgn(ca.E)} - (${sgn(an.E)}) = ${dec(e100 / 100)}\\ \\mathrm{V}$`,
      ],
    };
  }
  if (kind === 3) {
    const m = pick(METALS.filter(x => ['Cu', 'Ag', 'Zn', 'Ni', 'Al'].includes(x.s)));
    const ne10 = m.z === 3 ? pick([3, 6, 9, 12]) : pick([1, 2, 4, 5, 10]);
    return {
      tex: `n(e^-) = ${dec(ne10 / 10)}\\ \\mathrm{mol}`,
      ask: `Колко грама ${m.name} се отделят на катода при електролиза на разтвор (или стопилка) с йони ${m.ion}?`,
      num: ne10 * m.M,
      den: 10 * m.z,
      steps: [
        `$\\mathrm{${m.s}^{${m.z > 1 ? m.z : ''}+}} + ${m.z > 1 ? m.z : ''}e^- \\to \\mathrm{${m.s}}$: на 1 mol метал трябват ${m.z} mol електрони.`,
        `$n(\\mathrm{${m.s}}) = \\frac{${dec(ne10 / 10)}}{${m.z}}$, $m = n \\cdot M = \\frac{${dec(ne10 / 10)}}{${m.z}} \\cdot ${dec(m.M)} = ${dec((ne10 * m.M) / (10 * m.z))}\\ \\mathrm{g}$`,
      ],
    };
  }
  const r = pick(BALANCE);
  const [f, k] = pick(Object.entries(r.coefs));
  return {
    tex: r.tex,
    ask: `Изравни с електронен баланс. Какъв е коефициентът пред ${formulaText(f)}?`,
    num: k,
    den: 1,
    steps: [`Окисление: ${r.oxidation.text}; редукция: ${r.reduction.text}.`, `Изравнено: ${r.final}`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '💍 Посребряване на лъжичка',
    problem: 'Лъжичка е катод в разтвор на сребърна сол. През разтвора протича ток 0,5 A в продължение на 30 минути. Колко грама сребро се отлагат върху нея? ($F = 96\\,485\\ \\mathrm{C/mol}$)',
    solution: ['$Q = It = 0{,}5 \\cdot 1800 = 900\\ \\mathrm{C}$', '$\\mathrm{Ag^+ + e^- \\to Ag}$: $n(\\mathrm{Ag}) = \\frac{Q}{F} = \\frac{900}{96\\,485} \\approx 0{,}00933\\ \\mathrm{mol}$', '$m = 0{,}00933 \\cdot 108 \\approx 1{,}01\\ \\mathrm{g}$ – слой от около грам сребро.'],
    answer: '$\\approx 1{,}01\\ \\mathrm{g}$',
    check: [1.01],
    ask: ['сребро, g'],
  },
  {
    title: '🥫 Енергия за кутийка алуминий',
    problem: 'Алуминият се получава чрез електролиза на стопен $\\mathrm{Al_2O_3}$ (разтворен в криолит). Колко заряд (в мегакулона) е нужен за 1 kg алуминий? Колко kWh електроенергия са нужни при напрежение 4 V?',
    solution: ['$n(\\mathrm{Al}) = \\frac{1000}{27} \\approx 37{,}0\\ \\mathrm{mol}$; $\\mathrm{Al^{3+} + 3e^- \\to Al}$', '$Q = 3nF = 3 \\cdot 37{,}0 \\cdot 96\\,485 \\approx 1{,}07 \\cdot 10^7\\ \\mathrm{C} = 10{,}7\\ \\mathrm{MC}$', '$W = QU \\approx 4{,}29 \\cdot 10^7\\ \\mathrm{J} \\approx 11{,}9\\ \\mathrm{kWh}$. В истинските заводи разходът е от същия порядък – затова рециклирането на алуминий спестява толкова много енергия.'],
    answer: '$\\approx 10{,}7\\ \\mathrm{MC}$, $\\approx 11{,}9\\ \\mathrm{kWh}$',
    check: [10.7, 11.9],
    ask: ['заряд, MC', 'енергия, kWh'],
  },
  {
    title: '🔋 Колко цинк изяжда батерията',
    problem: 'В цинковите батерии анодът е от цинк: $\\mathrm{Zn - 2e^- \\to Zn^{2+}}$. Батерия е отдала заряд 2000 mAh. Колко грама цинк са се окислили?',
    solution: ['$Q = 2\\ \\mathrm{A} \\cdot 3600\\ \\mathrm{s} = 7200\\ \\mathrm{C}$ (2000 mAh = 2 Ah)', '$n(e^-) = \\frac{7200}{96\\,485} \\approx 0{,}0746\\ \\mathrm{mol}$, $n(\\mathrm{Zn}) \\approx 0{,}0373\\ \\mathrm{mol}$', '$m \\approx 0{,}0373 \\cdot 65 \\approx 2{,}43\\ \\mathrm{g}$'],
    answer: '$\\approx 2{,}43\\ \\mathrm{g}$',
    check: [2.43],
    ask: ['цинк, g'],
  },
  {
    title: '🔩 Пирон в меден разтвор',
    problem: 'Железен пирон е потопен в разтвор на $\\mathrm{CuSO_4}$: $\\mathrm{Fe + CuSO_4 \\to FeSO_4 + Cu}$. Медта се отлага върху пирона и масата му нараства с 0,4 g. Колко грама мед са се отложили?',
    solution: ['На всеки мол реакция се разтварят 56 g желязо и се отлагат 63,5 g мед: масата нараства със 7,5 g.', '$n = \\frac{0{,}4}{7{,}5} \\approx 0{,}0533\\ \\mathrm{mol}$', '$m(\\mathrm{Cu}) = 0{,}0533 \\cdot 63{,}5 \\approx 3{,}39\\ \\mathrm{g}$'],
    answer: '$\\approx 3{,}39\\ \\mathrm{g}$',
    check: [3.39],
    ask: ['мед, g'],
  },
  {
    title: '🚲 Ръждясалият велосипед',
    problem: 'Приемете, че ръждата е $\\mathrm{Fe_2O_3}$: $\\mathrm{4Fe + 3O_2 \\to 2Fe_2O_3}$. Колко грама кислород поемат 1000 g желязо, ако ръждясат напълно, и колко грама ръжда се получават?',
    solution: ['$n(\\mathrm{Fe}) = \\frac{1000}{56} \\approx 17{,}86\\ \\mathrm{mol}$', '$n(\\mathrm{O_2}) = \\frac{3}{4} \\cdot 17{,}86 \\approx 13{,}39\\ \\mathrm{mol}$, $m \\approx 429\\ \\mathrm{g}$', 'Ръжда: $1000 + 429 \\approx 1429\\ \\mathrm{g}$ – с почти половин килограм повече. Истинската ръжда съдържа и вода, затова е още по-тежка и рохкава.'],
    answer: '$\\approx 429\\ \\mathrm{g}$, $\\approx 1429\\ \\mathrm{g}$',
    check: [429, 1429],
    ask: ['кислород, g', 'ръжда, g'],
  },
  {
    title: '💧 Водород от вода',
    problem: 'При електролиза на подкиселена вода протича ток 2 A в продължение на 1 час. Колко литра водород и колко литра кислород (при нормални условия) се отделят?',
    solution: ['$Q = 2 \\cdot 3600 = 7200\\ \\mathrm{C}$, $n(e^-) = \\frac{7200}{96\\,485} \\approx 0{,}0746\\ \\mathrm{mol}$', 'Катод: $\\mathrm{2H^+ + 2e^- \\to H_2}$ – $n(\\mathrm{H_2}) \\approx 0{,}0373\\ \\mathrm{mol}$, $V \\approx 0{,}836\\ \\mathrm{L}$', 'Анод: $\\mathrm{2H_2O - 4e^- \\to O_2 + 4H^+}$ – наполовина по-малко: $V(\\mathrm{O_2}) \\approx 0{,}418\\ \\mathrm{L}$'],
    answer: '$\\approx 0{,}836\\ \\mathrm{L}$ и $\\approx 0{,}418\\ \\mathrm{L}$',
    check: [0.836, 0.418],
    ask: ['водород, L', 'кислород, L'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Каква е степента на окисление на мангана в $\\mathrm{KMnO_4}$?',
    answers: ['$+7$', '$+4$', '$+2$', '$+6$'],
    correctAnswer: '$+7$',
  },
  {
    question: 'Какво е окисление?',
    answers: ['отдаване на електрони', 'приемане на електрони', 'приемане на протони', 'свързване само с кислород'],
    correctAnswer: 'отдаване на електрони',
  },
  {
    question: 'В реакцията $\\mathrm{Zn + CuSO_4 \\to ZnSO_4 + Cu}$ окислител е:',
    answers: ['$\\mathrm{Cu^{2+}}$', '$\\mathrm{Zn}$', '$\\mathrm{SO_4^{2-}}$', '$\\mathrm{Cu}$'],
    correctAnswer: '$\\mathrm{Cu^{2+}}$',
  },
  {
    question: 'Кой метал изтласква водород от разредена солна киселина?',
    answers: ['$\\mathrm{Zn}$', '$\\mathrm{Cu}$', '$\\mathrm{Ag}$', '$\\mathrm{Au}$'],
    correctAnswer: '$\\mathrm{Zn}$',
  },
  {
    question: 'Какво е стандартното напрежение на елемента на Даниел (Zn и Cu)?',
    answers: ['$1{,}10\\ \\mathrm{V}$', '$0{,}42\\ \\mathrm{V}$', '$-1{,}10\\ \\mathrm{V}$', '$0{,}34\\ \\mathrm{V}$'],
    correctAnswer: '$1{,}10\\ \\mathrm{V}$',
  },
  {
    question: 'В галваничния елемент анодът е:',
    answers: ['електродът, на който протича окисление', 'винаги положителният електрод', 'електродът, на който се отлага метал', 'солевият мост'],
    correctAnswer: 'електродът, на който протича окисление',
  },
  {
    question: 'Какво се отделя на катода при електролиза на воден разтвор на NaCl?',
    answers: ['водород', 'натрий', 'хлор', 'кислород'],
    correctAnswer: 'водород',
  },
  {
    question: 'Колко мола електрони са нужни, за да се отложи 1 mol алуминий?',
    answers: ['$3\\ \\mathrm{mol}$', '$1\\ \\mathrm{mol}$', '$2\\ \\mathrm{mol}$', '$6\\ \\mathrm{mol}$'],
    correctAnswer: '$3\\ \\mathrm{mol}$',
  },
  {
    question: 'Защо поцинкованата ламарина не ръждясва, дори когато цинковият слой е одраскан?',
    answers: ['цинкът е по-активен и се окислява вместо желязото', 'цинкът не провежда ток', 'желязото е по-активно от цинка', 'цинкът поглъща кислорода от въздуха'],
    correctAnswer: 'цинкът е по-активен и се окислява вместо желязото',
  },
];

// ---------- Страница ----------

const SERIES: [string, number][] = [
  ['Li', -3.04],
  ['K', -2.93],
  ['Ca', -2.87],
  ['Na', -2.71],
  ['Mg', -2.37],
  ['Al', -1.66],
  ['Zn', -0.76],
  ['Fe', -0.44],
  ['Ni', -0.26],
  ['Sn', -0.14],
  ['Pb', -0.13],
  ['H₂', 0],
  ['Cu', 0.34],
  ['Ag', 0.8],
  ['Hg', 0.85],
  ['Au', 1.5],
];

const ELECTROLYSIS: [string, string, string, string][] = [
  ['стопилка NaCl', '\\mathrm{Na^+ + e^- \\to Na}', '\\mathrm{2Cl^- - 2e^- \\to Cl_2}', 'натрий и хлор'],
  ['разтвор на NaCl', '\\mathrm{2H_2O + 2e^- \\to H_2 + 2OH^-}', '\\mathrm{2Cl^- - 2e^- \\to Cl_2}', 'водород, хлор; в разтвора остава NaOH'],
  ['разтвор на CuSO₄', '\\mathrm{Cu^{2+} + 2e^- \\to Cu}', '\\mathrm{2H_2O - 4e^- \\to O_2 + 4H^+}', 'мед, кислород; остава H₂SO₄'],
  ['разтвор на CuSO₄, меден анод', '\\mathrm{Cu^{2+} + 2e^- \\to Cu}', '\\mathrm{Cu - 2e^- \\to Cu^{2+}}', 'медта се пренася от анода на катода'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Redox() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Окисление-редукция и електрохимия</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚡ През 1807 г. в Лондон Хъмфри Дейви свързва в огромна батерия стотици медни и цинкови пластини и пуска <Term id="electric-current">тока</Term> през парче леко
            навлажнен поташ (калиев <Term id="hydroxide">хидроксид</Term>). На отрицателния електрод се появяват сребристи капчици, които избухват в пламък, щом докоснат въздуха. Според
            разказа на неговия асистент Дейви танцувал от радост из лабораторията – току-що бил получил <strong>калий</strong>, метал, който
            никой преди не бил виждал. Няколко дни по-късно получава натрий, а през следващата година – калций, магнезий, барий и стронций. Токът е
            принудил елементите да приемат електрони – това е електролиза, обратната страна на батерията.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Степен на окисление</h2>
          <p className={text}>
            В реакциите електроните преминават от един атом към друг. За да следим къде са отишли, на всеки атом приписваме{' '}
            <strong>степен на окисление</strong> – <Term id="electric-charge">заряда</Term>, който той би имал, ако всички негови връзки бяха йонни, а общите електрони
            отидеха при по-<Term id="electronegativity">електроотрицателния</Term> атом (виж{' '}
            <Link to="/chemistry/structure/bonding" className={link}>
              Химична връзка
            </Link>
            ). Записва се със знака отпред: <Tex>{'\\mathrm{Mn^{+7}}'}</Tex>, за разлика от заряда на <Term id="ion">йона</Term> <Tex>{'\\mathrm{Mn^{2+}}'}</Tex>.
          </p>
          <Theorem
            type="definition"
            title="Правила за степените на окисление"
            description="1) В простите вещества ($\mathrm{Fe}$, $\mathrm{O_2}$, $\mathrm{Cl_2}$) степента е 0. 2) Сборът от степените на всички атоми е равен на заряда на частицата – 0 за молекула. 3) Флуорът е винаги $-1$; алкалните метали са $+1$, алкалоземните $+2$, алуминият $+3$. 4) Водородът обикновено е $+1$ (в хидридите на металите, напр. $\mathrm{NaH}$, е $-1$). 5) Кислородът обикновено е $-2$ (в пероксидите, напр. $\mathrm{H_2O_2}$, е $-1$, а в $\mathrm{OF_2}$ е $+2$)."
          />
          <Example
            description="Каква е степента на окисление на хрома в калиевия дихромат $\mathrm{K_2Cr_2O_7}$ и в дихроматния йон $\mathrm{Cr_2O_7^{2-}}$?"
            steps={[
              '$\\mathrm{K_2Cr_2O_7}$: $2 \\cdot (+1) + 2x + 7 \\cdot (-2) = 0 \\Rightarrow 2x = 12 \\Rightarrow x = +6$',
              '$\\mathrm{Cr_2O_7^{2-}}$: $2x + 7 \\cdot (-2) = -2 \\Rightarrow x = +6$ – същото, защото калият е просто $\\mathrm{K^+}$ до йона.',
            ]}
          />
          <OxidationLadderLab />
          <p className={text}>
            Степента на окисление е удобна сметка, а не истински заряд: в <Tex>{'\\mathrm{CH_4}'}</Tex> въглеродът е −4, но върху него няма
            четири електрона в повече. Дробните стойности (като <Tex>{'+\\tfrac{8}{3}'}</Tex> в <Tex>{'\\mathrm{Fe_3O_4}'}</Tex>) са средни за
            няколко различни атома.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Окисление и редукция</h2>
          <Theorem
            type="definition"
            title="Окисление, редукция, окислител, редуктор"
            description="Окисление е отдаването на електрони – степента на окисление расте. Редукция е приемането на електрони – степента намалява. Двата процеса протичат винаги заедно: колкото електрона отдава едната частица, толкова приема другата. Окислител е частицата, която приема електрони (тя се редуцира); редуктор е частицата, която отдава електрони (тя се окислява)."
          />
          <Example
            description="Цинкова пластинка в разтвор на меден сулфат се покрива с червеникава мед: $\mathrm{Zn + CuSO_4 \to ZnSO_4 + Cu}$. Кое се окислява и кое се редуцира?"
            steps={[
              'Йонът $\\mathrm{SO_4^{2-}}$ не се променя – съкратено: $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\to \\mathrm{Zn^{2+}} + \\mathrm{Cu}$.',
              '$\\mathrm{Zn^0 - 2e^- \\to Zn^{+2}}$ – окисление; цинкът е редуктор.',
              '$\\mathrm{Cu^{+2} + 2e^- \\to Cu^0}$ – редукция; медните йони са окислител.',
            ]}
          />
          <p className={text}>
            Типични окислители са веществата с елемент във висока степен на окисление или с голяма електроотрицателност:{' '}
            <Tex>{'\\mathrm{O_2}'}</Tex>, <Tex>{'\\mathrm{Cl_2}'}</Tex>, <Tex>{'\\mathrm{KMnO_4}'}</Tex>, <Tex>{'\\mathrm{K_2Cr_2O_7}'}</Tex>,{' '}
            <Tex>{'\\mathrm{HNO_3}'}</Tex>, концентрираната <Tex>{'\\mathrm{H_2SO_4}'}</Tex>. Типични редуктори са металите, водородът,
            въглеродът, <Tex>{'\\mathrm{CO}'}</Tex>, <Tex>{'\\mathrm{H_2S}'}</Tex>, йодидите. Горенето, дишането, ръждясването, <Term id="photosynthesis">фотосинтезата</Term>{' '}
            и работата на всяка батерия са окислително-редукционни процеси.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Изравняване с електронен баланс</h2>
          <Theorem
            title="Метод на електронния баланс"
            description="1) Определи степените на окисление и намери елементите, които ги променят. 2) Запиши полуреакциите на окисление и на редукция с броя на електроните. 3) Умножи ги така, че отдадените електрони да са равни на приетите (най-малкото общо кратно). 4) Сложи получените множители като коефициенти пред окислителя и редуктора и техните продукти. 5) Изравни останалите атоми – накрая водорода и кислорода (чрез водата)."
          />
          <Example
            description="Изравнете $\mathrm{Cu} + \mathrm{HNO_3}\ \text{(разр.)} \to \mathrm{Cu(NO_3)_2} + \mathrm{NO} + \mathrm{H_2O}$."
            steps={[
              'Менят се медта ($0 \\to +2$) и азотът ($+5 \\to +2$).',
              '$\\mathrm{Cu^0 - 2e^- \\to Cu^{+2}}$ $\\;|\\times 3$; $\\quad\\mathrm{N^{+5} + 3e^- \\to N^{+2}}$ $\\;|\\times 2$ – по 6 електрона.',
              '$\\mathrm{3Cu} + \\mathrm{2HNO_3} \\to \\mathrm{3Cu(NO_3)_2} + \\mathrm{2NO}$ – но в солта има още 6 нитрата, които не са се редуцирали.',
              'Общо $2 + 6 = 8$ молекули $\\mathrm{HNO_3}$; 8 водородни атома дават $\\mathrm{4H_2O}$: $\\mathrm{3Cu} + \\mathrm{8HNO_3} \\to \\mathrm{3Cu(NO_3)_2} + \\mathrm{2NO} + \\mathrm{4H_2O}$.',
            ]}
          />
          <ElectronBalanceLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Йонно-електронен метод (полуреакции)</h2>
          <p className={text}>
            Във водни разтвори е по-точно да пишем полуреакциите с реалните частици – йони и молекули. Кислородът и водородът се изравняват
            с това, което има в средата: в кисела – с <Tex>{'\\mathrm{H^+}'}</Tex> и <Tex>{'\\mathrm{H_2O}'}</Tex>, в основна – с{' '}
            <Tex>{'\\mathrm{OH^-}'}</Tex> и <Tex>{'\\mathrm{H_2O}'}</Tex>. Накрая електроните се изравняват с <Term id="lcm">най-малкото общо кратно</Term> и се
            проверява и зарядът.
          </p>
          <Example
            description="Изравнете реакцията на перманганат с железни(II) йони в кисела среда: $\mathrm{MnO_4^-} + \mathrm{Fe^{2+}} + \mathrm{H^+} \to \mathrm{Mn^{2+}} + \mathrm{Fe^{3+}} + \mathrm{H_2O}$."
            steps={[
              'Редукция: $\\mathrm{MnO_4^-} + \\mathrm{8H^+} + \\mathrm{5e^-} \\to \\mathrm{Mn^{2+}} + \\mathrm{4H_2O}$ – 4 кислородни атома стават 4 молекули вода, за тях са нужни 8 $\\mathrm{H^+}$; зарядът отляво е $-1 + 8 - 5 = +2$, както отдясно.',
              'Окисление: $\\mathrm{Fe^{2+} - e^- \\to Fe^{3+}}$ $\\;|\\times 5$',
              '$\\mathrm{MnO_4^-} + \\mathrm{5Fe^{2+}} + \\mathrm{8H^+} \\to \\mathrm{Mn^{2+}} + \\mathrm{5Fe^{3+}} + \\mathrm{4H_2O}$; заряд: $-1 + 10 + 8 = +17$ и $+2 + 15 = +17$ ✓',
              'Виолетовият перманганат се обезцветява – по това се вижда краят на титруването. Така се определя желязото (перманганатометрия).',
            ]}
          />
          <Theorem
            title="Перманганатът в различна среда"
            description="Продуктът на редукцията зависи от средата: в кисела $\mathrm{MnO_4^- \to Mn^{2+}}$ (приема $5e^-$, разтворът се обезцветява), в неутрална $\mathrm{MnO_4^- \to MnO_2}$ ($3e^-$, кафява утайка), в силно основна $\mathrm{MnO_4^- \to MnO_4^{2-}}$ ($1e^-$, зелен разтвор)."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Ред на активност и електродни потенциали</h2>
          <p className={text}>
            Колко лесно металът отдава електрони във воден <Term id="solution">разтвор</Term>, се измерва със <strong>стандартния електроден потенциал</strong>{' '}
            <Tex>{'E^\\circ'}</Tex> – <Term id="voltage">напрежението</Term> между метала в разтвор на своите йони (1 mol/L, 25 °C) и стандартния водороден електрод,
            чийто <Term id="electric-potential">потенциал</Term> е приет за нула. Колкото по-отрицателен е <Tex>{'E^\\circ'}</Tex>, толкова по-активен е металът.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <tbody>
                <tr>
                  <th className={th}>метал</th>
                  {SERIES.map(([s]) => (
                    <td key={s} className={`${td} text-center font-semibold`}>
                      {s}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className={th}>
                    <Tex>{'E^\\circ,\\ \\mathrm{V}'}</Tex>
                  </th>
                  {SERIES.map(([s, E]) => (
                    <td key={s} className={`${td} text-center whitespace-nowrap`}>
                      <Tex>{E > 0 ? `+${dec(E)}` : dec(E)}</Tex>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <Theorem
            title="Какво следва от реда на активност"
            description="1) Металите преди водорода (с $E^\circ < 0$) изтласкват водород от разредени киселини като $\mathrm{HCl}$ и $\mathrm{H_2SO_4}$; медта, среброто и златото – не. 2) По-активният метал изтласква по-малко активния от разтворите на солите му: $\mathrm{Fe + CuSO_4 \to FeSO_4 + Cu}$, но $\mathrm{Cu + FeSO_4}$ не реагира. 3) Най-активните метали (K, Na, Ca) реагират направо с водата."
          />
          <p className={text}>
            Внимание: потенциалът казва дали реакцията е възможна, а не колко бързо протича. Литият има най-отрицателния потенциал, но с
            водата реагира по-спокойно от натрия и калия, а алуминият е защитен от тънък оксиден слой.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Галваничен елемент</h2>
          <p className={text}>
            Ако цинкът и медните йони са в отделни чаши, електроните не могат да прескочат направо – те минават по <Term id="conductor">проводник</Term> и вършат
            работа. Това е <strong>галваничният елемент</strong>: химична енергия се превръща в електрична. Неговото{' '}
            <Term id="emf">електродвижещо напрежение</Term> и вътрешното му <Term id="resistance">съпротивление</Term> разглеждаме във физиката, в урока{' '}
            <Link to="/physics/electricity/direct-current" className={link}>
              Постоянен ток
            </Link>
            .
          </p>
          <Theorem
            type="definition"
            title="Анод, катод и напрежение на елемента"
            description="Анод е електродът, на който протича окисление; катод – електродът, на който протича редукция. В галваничния елемент анодът е по-активният метал и е отрицателен полюс, а катодът е положителен. Електроните текат по външната верига от анода към катода, а солевият мост затваря веригата с йони. Стандартното напрежение е $E^\circ = E^\circ_{\text{катод}} - E^\circ_{\text{анод}}$."
          />
          <Example
            description="Елементът на Даниел: цинк в разтвор на $\mathrm{ZnSO_4}$ и мед в разтвор на $\mathrm{CuSO_4}$. Кой е анодът и какво е напрежението?"
            steps={[
              '$E^\\circ(\\mathrm{Zn}) = -0{,}76\\ \\mathrm{V} < E^\\circ(\\mathrm{Cu}) = +0{,}34\\ \\mathrm{V}$ – цинкът е анод (−), медта е катод (+).',
              'Анод: $\\mathrm{Zn - 2e^- \\to Zn^{2+}}$; катод: $\\mathrm{Cu^{2+} + 2e^- \\to Cu}$',
              '$E^\\circ = 0{,}34 - (-0{,}76) = 1{,}10\\ \\mathrm{V}$. С времето цинковата пластинка изтънява, а медната расте.',
            ]}
          />
          <GalvanicCellLab />
          <Theorem
            title="Уравнение на Нернст (за напреднали)"
            description="При концентрации, различни от 1 mol/L, напрежението се променя: $E = E^\circ - \frac{0{,}0592}{n}\lg Q$ при 25 °C, където $n$ е броят на пренесените електрони, а $Q$ е отношението на концентрациите на продуктите и изходните йони (за елемента на Даниел $Q = \frac{[\mathrm{Zn^{2+}}]}{[\mathrm{Cu^{2+}}]}$). Свързано е и с енергията на Гибс: $\Delta G^\circ = -nFE^\circ$ – положително напрежение означава, че реакцията протича сама."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Електролиза</h2>
          <p className={text}>
            При електролизата е обратно: външен източник на ток принуждава да протече реакция, която сама не би протекла. Катодът е свързан
            с минуса на източника и на него <Term id="cation">катионите</Term> приемат електрони (редукция); анодът е свързан с плюса и на
            него <Term id="anion">анионите</Term> или водата отдават електрони (окисление).
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Електролизира се</th>
                  <th className={th}>Катод (−)</th>
                  <th className={th}>Анод (+)</th>
                  <th className={th}>Продукти</th>
                </tr>
              </thead>
              <tbody>
                {ELECTROLYSIS.map(([what, cat, an, prod]) => (
                  <tr key={what}>
                    <td className={td}>{what}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      <Tex>{cat}</Tex>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <Tex>{an}</Tex>
                    </td>
                    <td className={td}>{prod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Theorem
            title="Какво се отделя при електролиза на воден разтвор"
            description="На катода: йоните на металите след водорода в реда на активност (Cu, Ag) се редуцират до метал; при най-активните (до Al) вместо тях се редуцира водата и се отделя водород; при металите между тях (Zn, Fe, Ni) често се отделят и двете. На инертен анод: $\mathrm{Cl^-}$, $\mathrm{Br^-}$, $\mathrm{I^-}$ се окисляват до халоген; при кислородсъдържащи аниони ($\mathrm{SO_4^{2-}}$, $\mathrm{NO_3^-}$) се окислява водата и се отделя кислород."
          />
          <Theorem
            title="Закон на Фарадей за електролизата"
            description="Масата на веществото, отделено на електрод, е пропорционална на преминалия заряд $Q = It$: $m = \frac{M\,I\,t}{z\,F}$, където $z$ е броят на електроните за една частица, а $F = 96\,485\ \mathrm{C/mol}$ (константата на Фарадей) е зарядът на един мол електрони, $F = N_A e$."
          />
          <Example
            description="През разтвор на $\mathrm{CuSO_4}$ протича ток 2 A в продължение на 1 час. Колко мед се отлага на катода?"
            steps={[
              '$Q = It = 2 \\cdot 3600 = 7200\\ \\mathrm{C}$; $n(e^-) = \\frac{7200}{96\\,485} \\approx 0{,}0746\\ \\mathrm{mol}$',
              '$\\mathrm{Cu^{2+} + 2e^- \\to Cu}$: $n(\\mathrm{Cu}) \\approx 0{,}0373\\ \\mathrm{mol}$',
              '$m \\approx 0{,}0373 \\cdot 63{,}5 \\approx 2{,}37\\ \\mathrm{g}$',
            ]}
          />
          <p className={text}>
            С електролиза се получават алуминият, натрият, хлорът и натриевата основа, пречиства се медта (меден анод се разтваря, а чиста
            мед се отлага на катода) и се нанасят покрития – хромиране, никелиране, позлатяване.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Корозия</h2>
          <p className={text}>
            Корозията е самопроизволното окисление на металите от околната среда. Желязото ръждясва, когато има едновременно вода и
            кислород: по повърхността му се образуват малки галванични елементи, в които желязото е анод. Солта (например по пътищата
            през зимата) ускорява процеса, защото разтворът провежда ток по-добре.
          </p>
          <Theorem
            title="Защита от корозия"
            description="1) Покритие, което спира водата и кислорода – боя, масло, емайл. 2) Поцинковане: цинкът е по-активен от желязото и при драскотина се окислява той, а не желязото. 3) Протекторна защита: към корпуса на кораба или бойлера се закрепва блок от по-активен метал (Mg, Zn), който се „жертва“. 4) Калайдисване (консервени кутии) пази само докато е цяло: калаят е по-малко активен от желязото и при драскотина желязото ръждясва дори по-бързо."
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>
            Степени на окисление, напрежение на галваничен елемент, маса по закона на Фарадей и коефициенти по електронен баланс. Отрицателните
            числа въвеждай с минус (−3), десетичните – като 1,1.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Електрохимия около нас</h2>
          <p className={text}>Батерии, бижута, алуминиеви кутийки и ръждясали велосипеди – навсякъде електроните се местят.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Окислителят се окислява', 'Окислителят отдава електрони.', 'Окислителят приема електрони и сам се редуцира; редукторът се окислява.'],
              ['Степен и заряд', '$\\mathrm{Mn^{2+}}$ и $\\mathrm{Mn^{+2}}$ са едно и също записано.', 'Знакът отзад е заряд на йона, отпред – степен на окисление; в $\\mathrm{KMnO_4}$ няма йон $\\mathrm{Mn^{7+}}$.'],
              ['Кислородът винаги −2', 'В $\\mathrm{H_2O_2}$ кислородът е $-2$, водородът $+2$.', 'В пероксидите кислородът е $-1$; водородът е $+1$.'],
              ['Цялата HNO₃ е окислител', '$\\mathrm{3Cu + 2HNO_3}$ – по баланса.', 'Част от киселината остава в солта: $\\mathrm{3Cu + 8HNO_3}$.'],
              ['Знакът на анода', 'Анодът винаги е минус.', 'Анодът е там, където е окислението: в батерията е −, при електролиза е +.'],
              ['Натрий от разтвор', 'При електролиза на разтвор на NaCl на катода се отделя натрий.', 'Натрий се получава само от стопилка; от разтвора се отделя водород.'],
              ['Напрежението се умножава', 'За $\\mathrm{2Ag^+ + 2e^-}$ потенциалът е $2 \\cdot 0{,}80$.', '$E^\\circ$ не зависи от коефициентите: остава $0{,}80\\ \\mathrm{V}$.'],
              ['z в закона на Фарадей', 'За $\\mathrm{Al}$: $m = \\frac{MIt}{F}$', 'За $\\mathrm{Al^{3+}}$ трябват 3 електрона: $m = \\frac{MIt}{3F}$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Определете степента на окисление на хрома в $\mathrm{K_2Cr_2O_7}$ и в $\mathrm{Cr_2(SO_4)_3}$." check={[6, 3]} ask={['в $\\mathrm{K_2Cr_2O_7}$', 'в $\\mathrm{Cr_2(SO_4)_3}$']}>
                <p><Tex>{'2 \\cdot (+1) + 2x + 7 \\cdot (-2) = 0 \\Rightarrow x = +6'}</Tex></p>
                <p>Сулфатният йон е <Tex>{'\\mathrm{SO_4^{2-}}'}</Tex>: <Tex>{'2x + 3 \\cdot (-2) = 0 \\Rightarrow x = +3'}</Tex>.</p>
                <p>Оранжевият дихромат се редуцира до зелени соли на <Tex>{'\\mathrm{Cr^{3+}}'}</Tex> – така работели старите дрегери за алкохол.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="13 g цинк реагират напълно с разтвор на $\mathrm{CuSO_4}$. Кое вещество е окислител и колко грама мед се отлагат?" check={[12.7]} ask={['мед, g']}>
                <p><Tex>{'\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\to \\mathrm{Zn^{2+}} + \\mathrm{Cu}'}</Tex>: окислител са медните йони (от <Tex>{'\\mathrm{CuSO_4}'}</Tex>), редуктор е цинкът.</p>
                <p><Tex>{'n(\\mathrm{Zn}) = \\frac{13}{65} = 0{,}2\\ \\mathrm{mol} = n(\\mathrm{Cu})'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Cu}) = 0{,}2 \\cdot 63{,}5 = 12{,}7\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="През разтвор на $\mathrm{AgNO_3}$ с инертни електроди преминават 0,3 mol електрони. Колко грама сребро се отлагат на катода и колко литра кислород (н.у.) се отделят на анода?" check={[32.4, 1.68]} ask={['сребро, g', 'кислород, L']}>
                <p>Катод: <Tex>{'\\mathrm{Ag^+ + e^- \\to Ag}'}</Tex> – <Tex>{'0{,}3\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}3 \\cdot 108 = 32{,}4\\ \\mathrm{g}'}</Tex>.</p>
                <p>Анод: <Tex>{'\\mathrm{2H_2O - 4e^- \\to O_2 + 4H^+}'}</Tex> – <Tex>{'n(\\mathrm{O_2}) = \\frac{0{,}3}{4} = 0{,}075\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'V = 0{,}075 \\cdot 22{,}4 = 1{,}68\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Изравнете с електронен баланс: $\mathrm{Cu} + \mathrm{HNO_3}\ \text{(конц.)} \to \mathrm{Cu(NO_3)_2} + \mathrm{NO_2} + \mathrm{H_2O}$. Какви са коефициентите пред $\mathrm{HNO_3}$ и $\mathrm{NO_2}$?" check={[4, 2]} ask={['$\\mathrm{HNO_3}$', '$\\mathrm{NO_2}$']}>
                <p><Tex>{'\\mathrm{Cu^0 - 2e^- \\to Cu^{+2}}\\ |\\times 1'}</Tex>, <Tex>{'\\mathrm{N^{+5} + e^- \\to N^{+4}}\\ |\\times 2'}</Tex></p>
                <p>2 молекули <Tex>{'\\mathrm{HNO_3}'}</Tex> са окислител и още 2 остават в солта – общо 4.</p>
                <p><Tex>{'\\mathrm{Cu} + \\mathrm{4HNO_3} \\to \\mathrm{Cu(NO_3)_2} + \\mathrm{2NO_2} + \\mathrm{2H_2O}'}</Tex> – отделя се кафявият <Tex>{'\\mathrm{NO_2}'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Галваничен елемент е съставен от цинков и сребърен електрод в разтвори на солите им (1 mol/L). Какво е стандартното му напрежение? Колко грама сребро се отлагат, докато се разтворят 6,5 g цинк?" check={[1.56, 21.6]} ask={['$E^\\circ$, V', 'сребро, g']}>
                <p><Tex>{'E^\\circ = 0{,}80 - (-0{,}76) = 1{,}56\\ \\mathrm{V}'}</Tex>; цинкът е анод.</p>
                <p><Tex>{'\\mathrm{Zn + 2Ag^+ \\to Zn^{2+} + 2Ag}'}</Tex>: <Tex>{'n(\\mathrm{Zn}) = 0{,}1\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{Ag}) = 0{,}2\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'m(\\mathrm{Ag}) = 0{,}2 \\cdot 108 = 21{,}6\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Концентриран разтвор на NaCl се електролизира с ток 5 A в продължение на 1930 s. Колко литра водород (н.у.) се отделят на катода и колко грама NaOH се образуват? ($F = 96\,485\ \mathrm{C/mol}$)" check={[1.12, 4]} ask={['водород, L', 'NaOH, g']}>
                <p><Tex>{'Q = 5 \\cdot 1930 = 9650\\ \\mathrm{C}'}</Tex>, <Tex>{'n(e^-) = \\frac{9650}{96\\,485} \\approx 0{,}100\\ \\mathrm{mol}'}</Tex></p>
                <p>Катод: <Tex>{'\\mathrm{2H_2O + 2e^- \\to H_2 + 2OH^-}'}</Tex> – <Tex>{'0{,}05\\ \\mathrm{mol}\\ \\mathrm{H_2}'}</Tex>, <Tex>{'V = 1{,}12\\ \\mathrm{L}'}</Tex>; толкова и хлор на анода.</p>
                <p>Образуват се <Tex>{'0{,}1\\ \\mathrm{mol}\\ \\mathrm{OH^-}'}</Tex>, т.е. <Tex>{'0{,}1 \\cdot 40 = 4\\ \\mathrm{g}\\ \\mathrm{NaOH}'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Изравнете по йонно-електронния метод: $\mathrm{KMnO_4} + \mathrm{Na_2SO_3} + \mathrm{H_2SO_4} \to \mathrm{MnSO_4} + \mathrm{Na_2SO_4} + \mathrm{K_2SO_4} + \mathrm{H_2O}$. Какви са коефициентите пред $\mathrm{Na_2SO_3}$ и $\mathrm{H_2SO_4}$?" check={[5, 3]} ask={['$\\mathrm{Na_2SO_3}$', '$\\mathrm{H_2SO_4}$']}>
                <p>Редукция: <Tex>{'\\mathrm{MnO_4^-} + \\mathrm{8H^+} + \\mathrm{5e^-} \\to \\mathrm{Mn^{2+}} + \\mathrm{4H_2O}\\ |\\times 2'}</Tex></p>
                <p>Окисление: <Tex>{'\\mathrm{SO_3^{2-}} + \\mathrm{H_2O - 2e^-} \\to \\mathrm{SO_4^{2-}} + \\mathrm{2H^+}\\ |\\times 5'}</Tex></p>
                <p>Сбор: <Tex>{'\\mathrm{2MnO_4^-} + \\mathrm{5SO_3^{2-}} + \\mathrm{6H^+} \\to \\mathrm{2Mn^{2+}} + \\mathrm{5SO_4^{2-}} + \\mathrm{3H_2O}'}</Tex> (16 − 10 = 6 йона <Tex>{'\\mathrm{H^+}'}</Tex>, 8 − 5 = 3 молекули вода).</p>
                <p><Tex>{'\\mathrm{2KMnO_4} + \\mathrm{5Na_2SO_3} + \\mathrm{3H_2SO_4} \\to \\mathrm{2MnSO_4} + \\mathrm{5Na_2SO_4} + \\mathrm{K_2SO_4} + \\mathrm{3H_2O}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="25,0 mL разтвор на $\mathrm{FeSO_4}$ (подкиселен) се титрува с 0,0200 mol/L $\mathrm{KMnO_4}$; до трайно розово оцветяване са изразходвани 20,0 mL. Каква е концентрацията на $\mathrm{Fe^{2+}}$ и колко грама желязо има в пробата?" check={[0.08, 0.112]} ask={['$c(\\mathrm{Fe^{2+}})$, mol/L', 'желязо, g']}>
                <p><Tex>{'\\mathrm{MnO_4^-} + \\mathrm{5Fe^{2+}} + \\mathrm{8H^+} \\to \\mathrm{Mn^{2+}} + \\mathrm{5Fe^{3+}} + \\mathrm{4H_2O}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{MnO_4^-}) = 0{,}0200 \\cdot 0{,}0200 = 4{,}00 \\cdot 10^{-4}\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{Fe^{2+}}) = 5 \\cdot 4{,}00 \\cdot 10^{-4} = 2{,}00 \\cdot 10^{-3}\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'c = \\frac{2{,}00 \\cdot 10^{-3}}{0{,}0250} = 0{,}0800\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'m = 2{,}00 \\cdot 10^{-3} \\cdot 56 = 0{,}112\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="В елемент на Даниел $[\mathrm{Zn^{2+}}] = 1{,}0\ \mathrm{mol/L}$, а $[\mathrm{Cu^{2+}}] = 0{,}010\ \mathrm{mol/L}$. Какво е напрежението при 25 °C? Колко е $\Delta G^\circ$ на реакцията (в kJ/mol) при стандартни условия?" check={[1.04, -212]} ask={['$E$, V', '$\\Delta G^\\circ$, kJ/mol']}>
                <p><Tex>{'Q = \\frac{[\\mathrm{Zn^{2+}}]}{[\\mathrm{Cu^{2+}}]} = \\frac{1{,}0}{0{,}010} = 100'}</Tex>, <Tex>{'n = 2'}</Tex></p>
                <p><Tex>{'E = 1{,}10 - \\frac{0{,}0592}{2}\\lg 100 = 1{,}10 - 0{,}0592 \\approx 1{,}04\\ \\mathrm{V}'}</Tex> – по-малко медни йони, по-малко напрежение.</p>
                <p><Tex>{'\\Delta G^\\circ = -nFE^\\circ = -2 \\cdot 96\\,485 \\cdot 1{,}10 \\approx -212\\,000\\ \\mathrm{J/mol} = -212\\ \\mathrm{kJ/mol}'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Степента на окисление е условният заряд на атома; сборът в частицата е равен на заряда ѝ</li>
              <li>✓ Окисление – отдаване на електрони; редукция – приемане. Окислителят се редуцира, редукторът се окислява</li>
              <li>✓ Електронен баланс: отдадените електрони = приетите; в разтвори – полуреакции с <Tex>{'\\mathrm{H^+}'}</Tex>, <Tex>{'\\mathrm{OH^-}'}</Tex> и вода</li>
              <li>✓ По-отрицателен <Tex>{'E^\\circ'}</Tex> – по-активен метал; той изтласква по-малко активните от солите им</li>
              <li>✓ Галваничен елемент: анод (−) е по-активният метал, <Tex>{'E^\\circ = E^\\circ_{\\text{катод}} - E^\\circ_{\\text{анод}}'}</Tex></li>
              <li>✓ Електролиза: на катода – редукция, на анода – окисление; <Tex>{'m = \\frac{MIt}{zF}'}</Tex>, <Tex>{'F = 96\\,485\\ \\mathrm{C/mol}'}</Tex></li>
              <li>✓ Корозията е окисление на метала; пази се с покрития, поцинковане и протектори</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Статуята на свободата е огромен галваничен елемент, който едва не я разрушава. Медната ѝ обвивка е закрепена за железен скелет, а
              между тях е имало изолация от напоен с шеллак азбест. С годините изолацията се разпада, морският въздух с неговата сол става{' '}
              <Term id="electrolyte">електролит</Term> и желязото – по-активният метал – корозира бързо. При реставрацията през 80-те години на XX век железните ленти са
              сменени с неръждаема <Term id="steel">стомана</Term>. А зеленият цвят на статуята е патина – слой от медни соли, който всъщност пази медта под себе си.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
