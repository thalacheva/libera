import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, pick } from '~/drill';
import Trainer from '~/Trainer';
import ACLab from './ACLab';
import EMWaveLab from './EMWaveLab';
import LCCircuitLab from './LCCircuitLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 2.5 → 2{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6]);
  if (kind === 0) {
    const U = pick([6, 12, 20, 50, 110, 230]);
    return {
      tex: `U_m = ${U}\\sqrt{2}\\ \\mathrm{V}`,
      ask: 'Ефективно напрежение: $U = ?\\ \\mathrm{V}$',
      num: U,
      den: 1,
      steps: ['$U = \\frac{U_m}{\\sqrt{2}}$', `$U = \\frac{${U}\\sqrt{2}}{\\sqrt{2}} = ${U}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 1) {
    const R = pick([23, 46, 115, 230, 529]);
    return {
      tex: `U = 230\\ \\mathrm{V}, \\quad R = ${R}\\ \\Omega`,
      ask: 'Средна мощност: $P = ?\\ \\mathrm{W}$',
      num: 52900,
      den: R,
      steps: ['С ефективното напрежение формулите са като при постоянен ток: $P = \\frac{U^2}{R}$', `$P = \\frac{230^2}{${R}} = \\frac{52\\,900}{${R}} = ${dec(52900 / R)}\\ \\mathrm{W}$`],
    };
  }
  if (kind === 2) {
    const P = pick([460, 690, 1150, 2300]);
    return {
      tex: `P = ${P}\\ \\mathrm{W}, \\quad U = 230\\ \\mathrm{V}`,
      ask: 'Ефективна сила на тока: $I = ?\\ \\mathrm{A}$',
      num: P,
      den: 230,
      steps: ['$P = UI \\Rightarrow I = \\frac{P}{U}$', `$I = \\frac{${P}}{230} = ${dec(P / 230)}\\ \\mathrm{A}$`],
    };
  }
  if (kind === 3) {
    const f = pick([50, 100, 200, 250, 400, 500, 1000]);
    return {
      tex: `f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Период: $T = ?\\ \\mathrm{ms}$',
      num: 1000,
      den: f,
      steps: ['$T = \\frac{1}{f}$', `$T = \\frac{1}{${f}}\\ \\mathrm{s} = ${dec(1000 / f)}\\ \\mathrm{ms}$`],
    };
  }
  if (kind === 4) {
    const f = pick([1, 50, 100, 150, 300, 600]);
    return {
      tex: `f = ${f}\\ \\mathrm{MHz}, \\quad c = 3 \\cdot 10^8\\ \\mathrm{m/s}`,
      ask: 'Дължина на вълната: $\\lambda = ?\\ \\mathrm{m}$',
      num: 300,
      den: f,
      steps: ['$\\lambda = \\frac{c}{f}$', `$\\lambda = \\frac{3 \\cdot 10^8}{${f} \\cdot 10^6} = \\frac{300}{${f}} = ${dec(300 / f)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 5) {
    const l = pick([3, 6, 10, 12, 30]);
    return {
      tex: `\\lambda = ${l}\\ \\mathrm{cm}, \\quad c = 3 \\cdot 10^8\\ \\mathrm{m/s}`,
      ask: 'Честота: $f = ?\\ \\mathrm{GHz}$',
      num: 30,
      den: l,
      steps: ['$f = \\frac{c}{\\lambda}$', `$f = \\frac{3 \\cdot 10^8}{${dec(l / 100)}} = ${dec(30 / l)} \\cdot 10^9\\ \\mathrm{Hz} = ${dec(30 / l)}\\ \\mathrm{GHz}$`],
    };
  }
  const [a, b] = pick([
    [2, 8],
    [4, 1],
    [9, 1],
    [2, 2],
    [3, 12],
    [1, 16],
  ]);
  const k = Math.sqrt(a * b);
  return {
    tex: `L \\to ${a}L, \\quad C \\to ${b}C`,
    ask: 'Колко пъти се увеличава периодът на LC кръга? $T_2 : T_1 = ?$',
    num: k,
    den: 1,
    steps: ['$T = 2\\pi\\sqrt{LC}$, затова периодът расте като корен от произведението $LC$', `$\\frac{T_2}{T_1} = \\sqrt{${a} \\cdot ${b}} = \\sqrt{${a * b}} = ${k}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '☕ Електрическа кана',
    problem: 'Кана с мощност 2000 W е включена в контакт с 230 V. Каква е ефективната сила на тока и каква е най-голямата ѝ стойност?',
    solution: ['$I = \\frac{P}{U} = \\frac{2000}{230} \\approx 8{,}70\\ \\mathrm{A}$', '$I_m = \\sqrt{2}\\,I \\approx 1{,}414 \\cdot 8{,}70 \\approx 12{,}3\\ \\mathrm{A}$', 'Предпазителят на кръга обикновено е 16 A – затова две такива уреди на един контакт са рисковани.'],
    answer: '$\\approx 8{,}70\\ \\mathrm{A}$ и $\\approx 12{,}3\\ \\mathrm{A}$',
    check: [8.7, 12.3],
    ask: ['I, A', 'Iₘ, A'],
  },
  {
    title: '💡 Крушка с нажежаема жичка',
    problem: 'Крушка е надписана „60 W, 230 V“. Какво е съпротивлението на жичката, докато свети?',
    solution: ['$P = \\frac{U^2}{R} \\Rightarrow R = \\frac{U^2}{P}$', '$R = \\frac{230^2}{60} = \\frac{52\\,900}{60} \\approx 882\\ \\Omega$', 'Студената жичка има много по-малко съпротивление – затова крушките изгарят най-често при включване.'],
    answer: '$\\approx 882\\ \\Omega$',
    check: [882],
    ask: ['R, Ω'],
  },
  {
    title: '📻 FM антена',
    problem: 'Радиостанция излъчва на 100 MHz. Каква е дължината на вълната? Проста антена е с дължина около четвърт от нея – колко е тя?',
    solution: ['$\\lambda = \\frac{c}{f} = \\frac{3 \\cdot 10^8}{10^8} = 3\\ \\mathrm{m}$', '$\\frac{\\lambda}{4} = 0{,}75\\ \\mathrm{m}$ – приблизително колкото телескопична антена на радио.'],
    answer: '$3\\ \\mathrm{m}$ и $0{,}75\\ \\mathrm{m}$',
    check: [3, 0.75],
    ask: ['λ, m', 'антена, m'],
  },
  {
    title: '🍲 Микровълнова фурна',
    problem: 'Микровълновите фурни работят на около 2,45 GHz. Каква е дължината на вълната в сантиметри? ($c = 3{,}00 \\cdot 10^8\\ \\mathrm{m/s}$)',
    solution: ['$\\lambda = \\frac{c}{f} = \\frac{3{,}00 \\cdot 10^8}{2{,}45 \\cdot 10^9} \\approx 0{,}122\\ \\mathrm{m} = 12{,}2\\ \\mathrm{cm}$', 'Във фурната се получават стоящи вълни – затова чинията се върти, иначе храната се топли на петна.'],
    answer: '$\\approx 12{,}2\\ \\mathrm{cm}$',
    check: [12.2],
    ask: ['λ, cm'],
  },
  {
    title: '💶 Печка през зимата',
    problem: 'Електрическа печка от 2 kW работи по 3 часа на ден в продължение на 30 дни. Колко kWh изразходва и колко струва това при цена 0,14 € за kWh?',
    solution: ['$E = Pt = 2\\ \\mathrm{kW} \\cdot 3\\ \\mathrm{h} \\cdot 30 = 180\\ \\mathrm{kWh}$', '$180 \\cdot 0{,}14 = 25{,}2$ €'],
    answer: '180 kWh и 25,2 €',
    check: [180, 25.2],
    ask: ['енергия, kWh', 'цена, €'],
  },
  {
    title: '🌙 Сигнал до Луната',
    problem: 'Радиосигнал се изпраща до апаратура на Луната и отговорът идва веднага. След колко секунди го получаваме? Разстоянието е 3,844 · 10⁸ m, $c = 3{,}00 \\cdot 10^8\\ \\mathrm{m/s}$.',
    solution: ['Сигналът изминава разстоянието два пъти: $2 \\cdot 3{,}844 \\cdot 10^8 = 7{,}688 \\cdot 10^8\\ \\mathrm{m}$', '$t = \\frac{7{,}688 \\cdot 10^8}{3{,}00 \\cdot 10^8} \\approx 2{,}56\\ \\mathrm{s}$ – затова разговорите с астронавтите на Луната имаха забележимо закъснение.'],
    answer: '$\\approx 2{,}56\\ \\mathrm{s}$',
    check: [2.56],
    ask: ['време, s'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво е ефективното напрежение в контактите у нас?',
    answers: ['$230\\ \\mathrm{V}$', '$325\\ \\mathrm{V}$', '$110\\ \\mathrm{V}$', '$400\\ \\mathrm{V}$'],
    correctAnswer: '$230\\ \\mathrm{V}$',
  },
  {
    question: 'Каква е честотата на електрическата мрежа в Европа?',
    answers: ['$50\\ \\mathrm{Hz}$', '$60\\ \\mathrm{Hz}$', '$100\\ \\mathrm{Hz}$', '$230\\ \\mathrm{Hz}$'],
    correctAnswer: '$50\\ \\mathrm{Hz}$',
  },
  {
    question: 'Ефективното напрежение е 230 V. Около колко е най-голямата стойност на напрежението?',
    answers: ['$325\\ \\mathrm{V}$', '$230\\ \\mathrm{V}$', '$460\\ \\mathrm{V}$', '$163\\ \\mathrm{V}$'],
    correctAnswer: '$325\\ \\mathrm{V}$',
  },
  {
    question: 'Какво става с капацитивното съпротивление $X_C$, когато честотата расте?',
    answers: ['намалява', 'расте', 'не се променя', 'става отрицателно'],
    correctAnswer: 'намалява',
  },
  {
    question: 'Какво става с индуктивното съпротивление $X_L$, когато честотата расте?',
    answers: ['расте', 'намалява', 'не се променя', 'става нула'],
    correctAnswer: 'расте',
  },
  {
    question: 'Капацитетът в трептящ LC кръг се увеличава 4 пъти. Как се променя честотата?',
    answers: ['намалява 2 пъти', 'намалява 4 пъти', 'расте 2 пъти', 'не се променя'],
    correctAnswer: 'намалява 2 пъти',
  },
  {
    question: 'Как са насочени векторите $\\vec{E}$ и $\\vec{B}$ в електромагнитна вълна?',
    answers: ['перпендикулярно един на друг и на посоката на движение', 'успоредно на посоката на движение', 'успоредно един на друг', 'в произволни посоки'],
    correctAnswer: 'перпендикулярно един на друг и на посоката на движение',
  },
  {
    question: 'Кои електромагнитни вълни имат най-малка дължина на вълната?',
    answers: ['гама лъчите', 'радиовълните', 'видимата светлина', 'микровълните'],
    correctAnswer: 'гама лъчите',
  },
  {
    question: 'Каква е дължината на вълната на радиостанция, която излъчва на 100 MHz?',
    answers: ['$3\\ \\mathrm{m}$', '$30\\ \\mathrm{m}$', '$0{,}3\\ \\mathrm{m}$', '$300\\ \\mathrm{m}$'],
    correctAnswer: '$3\\ \\mathrm{m}$',
  },
];

// ---------- Страница ----------

const SPECTRUM: [string, string, string][] = [
  ['радиовълни', 'над 1 m', 'радио, телевизия, връзка с космически сонди'],
  ['микровълни', '1 mm – 1 m', 'мобилни мрежи, Wi-Fi, радари, микровълнови фурни'],
  ['инфрачервени', '700 nm – 1 mm', 'топлинно излъчване, дистанционни управления, термокамери'],
  ['видима светлина', '400 – 700 nm', 'зрение, фотосинтеза'],
  ['ултравиолетови', '10 – 400 nm', 'слънчев загар, дезинфекция, флуоресценция'],
  ['рентгенови', '0,01 – 10 nm', 'медицински снимки, проверка на багаж'],
  ['гама лъчи', 'под 0,01 nm', 'радиоактивен разпад, лъчетерапия'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function AcEmWaves() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Променлив ток и електромагнитни вълни</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            📡 През 1886–1888 г. в Карлсруе Хайнрих Херц предизвиква искра в една верига – и в метален пръстен на няколко метра от нея
            прескача мъничка искра, без между тях да има проводник. Херц доказва, че електромагнитните вълни, предсказани от Джеймс Кларк
            Максуел, наистина съществуват. Според често цитиран разказ на въпроса за какво ще послужи откритието той отговаря, че не вижда
            никаква практическа полза. Само след десетина години Гулиелмо Маркони предава сигнали по радиото, а през 1901 г. – през Атлантическия
            океан. Днес същите вълни носят телефонните ни разговори, Wi-Fi и сигналите от сондите отвъд Плутон.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Променлив ток</h2>
          <p className={text}>
            Генераторите в електроцентралите въртят намотки в магнитно поле и индуцираното напрежение се мени като синус (виж{' '}
            <Link to="/physics/electricity/induction" className={link}>
              Електромагнитна индукция
            </Link>
            ). Токът, който то предизвиква, сменя посоката си много пъти в секунда – затова се нарича <strong>променлив</strong>.
          </p>
          <Theorem
            type="definition"
            title="Синусоидален променлив ток"
            description="Напрежението се мени по закона $u = U_m \sin \omega t$, където $U_m$ е амплитудата (най-голямата стойност), а $\omega = 2\pi f = \frac{2\pi}{T}$. В Европа, включително в България, честотата на мрежата е $f = 50\ \mathrm{Hz}$ ($T = 20\ \mathrm{ms}$), а в Северна Америка – $60\ \mathrm{Hz}$."
          />
          <p className={text}>
            Защо променлив, а не постоянен? Променливото напрежение лесно се повишава и понижава с трансформатори, а по далекопроводите е изгодно
            да се пренася при високо напрежение и малък ток – така загубите за нагряване на жиците са малки. В края на XIX век в САЩ се води т.нар.
            „война на токовете“: Томас Едисон защитава постоянния ток, а Никола Тесла и Джордж Уестингхаус – променливия. Променливият ток
            побеждава в мрежите, макар че днес за някои много дълги линии отново се използва постоянен ток с високо напрежение.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Ефективни стойности и мощност</h2>
          <Theorem
            type="definition"
            title="Ефективна стойност"
            description="Ефективното напрежение $U$ е постоянното напрежение, което в същия резистор отделя същата средна топлина. За синусоидален ток $U = \frac{U_m}{\sqrt{2}} \approx 0{,}707\,U_m$ и $I = \frac{I_m}{\sqrt{2}}$. Уредите показват и по табелките се пишат ефективни стойности: „230 V“ означава $U_m = 230\sqrt{2} \approx 325\ \mathrm{V}$."
          />
          <Theorem
            title="Мощност в резистор"
            description="С ефективните стойности формулите са същите като при постоянен ток: $P = UI = I^2 R = \frac{U^2}{R}$. Моментната мощност $p = ui$ пулсира с двойна честота (100 пъти в секунда), а $P$ е нейната средна стойност – половината от най-голямата."
          />
          <ACLab />
          <Example
            description="Електрическа кана „2000 W, 230 V“. Колко са ефективната и най-голямата сила на тока и съпротивлението на нагревателя?"
            steps={['$I = \\frac{P}{U} = \\frac{2000}{230} \\approx 8{,}70\\ \\mathrm{A}$', '$I_m = \\sqrt{2}\\,I \\approx 12{,}3\\ \\mathrm{A}$', '$R = \\frac{U^2}{P} = \\frac{52\\,900}{2000} \\approx 26{,}5\\ \\Omega$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Кондензатор и бобина в променлива верига</h2>
          <p className={text}>
            Постоянен ток не минава през кондензатор (виж{' '}
            <Link to="/physics/electricity/capacitors" className={link}>
              Кондензатори
            </Link>
            ), но променлив – „минава“: кондензаторът непрекъснато се зарежда и разрежда. Бобината пък се противопоставя на промяната на тока
            заради самоиндукцията. И двете оказват на променливия ток съпротивление, което зависи от честотата.
          </p>
          <Theorem
            title="Капацитивно и индуктивно съпротивление"
            description="$X_C = \frac{1}{\omega C}$ – намалява с честотата (високите честоти минават лесно през кондензатор). $X_L = \omega L$ – расте с честотата. В кондензатора токът изпреварва напрежението с четвърт период, а в бобината изостава с четвърт период."
          />
          <Example
            description="Колко е съпротивлението на кондензатор 10 µF и на бобина 0,5 H при 50 Hz?"
            steps={['$\\omega = 2\\pi \\cdot 50 \\approx 314\\ \\mathrm{s^{-1}}$', '$X_C = \\frac{1}{314 \\cdot 10^{-5}} \\approx 318\\ \\Omega$', '$X_L = 314 \\cdot 0{,}5 \\approx 157\\ \\Omega$. При 100 Hz първото става два пъти по-малко, а второто – два пъти по-голямо.']}
          />
          <Theorem
            title="Резонанс в последователна RLC верига"
            description="Пълното съпротивление (импеданс) е $Z = \sqrt{R^2 + (X_L - X_C)^2}$. Когато $X_L = X_C$, остава само $R$ и токът е най-голям. Това става при резонансната честота $f_0 = \frac{1}{2\pi\sqrt{LC}}$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Трептящ кръг</h2>
          <p className={text}>
            Да заредим кондензатор и да го свържем с бобина. Кондензаторът се разрежда през бобината, токът расте и в бобината се натрупва
            енергия на магнитното поле. Когато кондензаторът се разреди, бобината „не пуска“ тока да спре – той зарежда кондензатора наобратно.
            Енергията прелива между електричното и магнитното поле, точно както при тяло на пружина тя прелива между потенциална и кинетична (виж{' '}
            <Link to="/physics/waves/oscillations" className={link}>
              Трептения
            </Link>
            ).
          </p>
          <Theorem
            title="Формула на Томсън"
            description="Собственият период на трептящия кръг е $T = 2\pi\sqrt{LC}$, а честотата му е $f_0 = \frac{1}{2\pi\sqrt{LC}}$. Енергията $\frac{q^2}{2C} + \frac{Li^2}{2}$ се запазва, ако няма съпротивление. Аналогия: заряд $q$ ↔ отклонение $x$, ток $i$ ↔ скорост $v$, $L$ ↔ маса $m$, $\frac{1}{C}$ ↔ коефициент $k$."
          />
          <LCCircuitLab />
          <Example
            description="Трептящ кръг с $L = 10\ \mathrm{mH}$ и $C = 1\ \mathrm{\mu F}$. Какви са периодът и честотата?"
            steps={['$T = 2\\pi\\sqrt{10^{-2} \\cdot 10^{-6}} = 2\\pi \\cdot 10^{-4} \\approx 6{,}28 \\cdot 10^{-4}\\ \\mathrm{s} = 0{,}628\\ \\mathrm{ms}$', '$f = \\frac{1}{T} \\approx 1590\\ \\mathrm{Hz}$ – тон, който бихме чули, ако свържем кръга с говорител.']}
          />
          <Example
            description="Радиоприемник има бобина $0{,}1\ \mathrm{\mu H}$. Какъв капацитет трябва да има кондензаторът, за да хване станция на 100 MHz?"
            steps={['$f_0 = \\frac{1}{2\\pi\\sqrt{LC}} \\Rightarrow C = \\frac{1}{(2\\pi f_0)^2 L}$', '$C = \\frac{1}{(2\\pi \\cdot 10^8)^2 \\cdot 10^{-7}} \\approx 2{,}53 \\cdot 10^{-11}\\ \\mathrm{F} = 25{,}3\\ \\mathrm{pF}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Електромагнитни вълни</h2>
          <p className={text}>
            Около 1865 г. Максуел обединява законите на електричеството и магнетизма и открива, че променливо електрично поле създава магнитно, а
            променливо магнитно – електрично. Така двете полета могат да се „носят“ едно друго през празното пространство. От уравненията му
            следва и скоростта на тези вълни – и тя се оказва равна на измерената скорост на светлината. Максуел заключава, че светлината е
            електромагнитна вълна.
          </p>
          <Theorem
            title="Електромагнитна вълна"
            description="Векторите $\vec{E}$ и $\vec{B}$ трептят в една фаза, перпендикулярно един на друг и на посоката на разпространение – вълната е напречна. Във вакуум всички електромагнитни вълни се движат със скорост $c = \frac{1}{\sqrt{\varepsilon_0 \mu_0}} \approx 3{,}00 \cdot 10^8\ \mathrm{m/s}$ и $c = \lambda f$. За разлика от звука те не се нуждаят от среда."
          />
          <EMWaveLab />
          <Example
            description="Каква е дължината на вълната на FM радио (100 MHz) и на Wi-Fi (2,4 GHz)?"
            steps={['$\\lambda_{FM} = \\frac{3 \\cdot 10^8}{10^8} = 3\\ \\mathrm{m}$', '$\\lambda_{Wi\\text{-}Fi} = \\frac{3 \\cdot 10^8}{2{,}4 \\cdot 10^9} = 0{,}125\\ \\mathrm{m} = 12{,}5\\ \\mathrm{cm}$']}
          />
          <p className={text}>
            Общите свойства на вълните – отражение, интерференция, дифракция – са разгледани в урока{' '}
            <Link to="/physics/waves/waves" className={link}>
              Вълни
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Спектърът на електромагнитните вълни</h2>
          <p className={text}>
            Радиовълните, светлината и рентгеновите лъчи са един и същ вид вълни – различават се само по честотата и дължината на вълната.
            Границите между областите са условни.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Област</th>
                  <th className={th}>Дължина на вълната</th>
                  <th className={th}>Къде ги срещаме</th>
                </tr>
              </thead>
              <tbody>
                {SPECTRUM.map(([name, range, use]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{range}</td>
                    <td className={td}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Вълните носят енергия, а интензитетът на точков източник намалява с квадрата на разстоянието: <Tex>{'I = \\frac{P}{4\\pi r^2}'}</Tex>.
            Радиовълните, микровълните, инфрачервените лъчи и видимата светлина са <strong>нейонизиращи</strong> – доказаното им действие при
            силно облъчване е нагряване, затова нормите за телефони и антени се определят с голям запас. Ултравиолетовите (особено по-късите),
            рентгеновите и гама лъчите са <strong>йонизиращи</strong>: могат да разкъсват молекули, включително ДНК – затова пазим кожата от
            слънцето, а рентгеновите снимки се правят само при нужда. Как астрономите наблюдават Вселената в различни дължини на вълната и как
            звездите излъчват – виж{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>{' '}
            и{' '}
            <Link to="/astronomy/lecture32" className={link}>
              Методи за наблюдение
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 2,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Токът и вълните около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Кое е „230 V“?', '230 V е най-голямото напрежение в контакта', '230 V е ефективното; най-голямото е около 325 V'],
              ['Ефективна стойност', '$U = \\frac{U_m}{2}$', '$U = \\frac{U_m}{\\sqrt{2}}$ за синусоидален ток'],
              ['Средна мощност', '$P = U_m I_m$', '$P = UI = \\frac{U_m I_m}{2}$'],
              ['Кондензатор и честота', '$X_C$ расте с честотата', '$X_C = \\frac{1}{\\omega C}$ намалява; расте $X_L = \\omega L$'],
              ['Радио и звук', 'радиовълните са звук', 'радиовълните са електромагнитни и не се нуждаят от среда; звукът е механична вълна'],
              ['Дължина на вълната', '$\\lambda = \\frac{f}{c}$', '$\\lambda = \\frac{c}{f}$ – по-висока честота, по-къса вълна'],
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
              <Task id="a1" number={1} color="border-green-500" question="Напрежението се мени по закона $u = 311\sin(100\pi t)$ (в SI). Намерете амплитудата, честотата и ефективното напрежение." check={[311, 50, 220]} ask={['$U_m$, V', '$f$, Hz', '$U$, V']}>
                <p>Сравняваме с <Tex>{'u = U_m \\sin \\omega t'}</Tex>: <Tex>{'U_m = 311\\ \\mathrm{V}'}</Tex>, <Tex>{'\\omega = 100\\pi'}</Tex>.</p>
                <p><Tex>{'f = \\frac{\\omega}{2\\pi} = \\frac{100\\pi}{2\\pi} = 50\\ \\mathrm{Hz}'}</Tex></p>
                <p><Tex>{'U = \\frac{311}{\\sqrt{2}} \\approx 220\\ \\mathrm{V}'}</Tex> – стандартът на мрежата у нас преди 230 V.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Сешоар „1800 W, 230 V“. Намерете ефективната сила на тока и съпротивлението на нагревателя." check={[7.83, 29.4]} ask={['$I$, A', '$R$, Ω']}>
                <p><Tex>{'I = \\frac{P}{U} = \\frac{1800}{230} \\approx 7{,}83\\ \\mathrm{A}'}</Tex></p>
                <p><Tex>{'R = \\frac{U}{I} = \\frac{U^2}{P} = \\frac{52\\,900}{1800} \\approx 29{,}4\\ \\Omega'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Сателитите на GPS излъчват на честота 1575,42 MHz. Каква е дължината на вълната в сантиметри? ($c = 2{,}998 \cdot 10^8\ \mathrm{m/s}$)" check={[19.0]} ask={['$\\lambda$, cm']}>
                <p><Tex>{'\\lambda = \\frac{c}{f} = \\frac{2{,}998 \\cdot 10^8}{1{,}57542 \\cdot 10^9} \\approx 0{,}190\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\lambda \\approx 19{,}0\\ \\mathrm{cm}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Колко е капацитивното съпротивление на кондензатор 10 µF при 50 Hz и при 100 Hz?" check={[318, 159]} ask={['$X_C$ при 50 Hz, Ω', '$X_C$ при 100 Hz, Ω']}>
                <p><Tex>{'X_C = \\frac{1}{2\\pi f C} = \\frac{1}{2\\pi \\cdot 50 \\cdot 10^{-5}} \\approx 318\\ \\Omega'}</Tex></p>
                <p>При двойно по-висока честота съпротивлението е два пъти по-малко: <Tex>{'\\approx 159\\ \\Omega'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Трептящ кръг има $L = 10\ \mathrm{mH}$ и $C = 1\ \mathrm{\mu F}$. Намерете периода в милисекунди и честотата в килохерци." check={[0.628, 1.59]} ask={['$T$, ms', '$f$, kHz']}>
                <p><Tex>{'T = 2\\pi\\sqrt{LC} = 2\\pi\\sqrt{10^{-2} \\cdot 10^{-6}} = 2\\pi \\cdot 10^{-4}\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'T \\approx 0{,}628\\ \\mathrm{ms}'}</Tex>, <Tex>{'f = \\frac{1}{T} \\approx 1590\\ \\mathrm{Hz} = 1{,}59\\ \\mathrm{kHz}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Радиоприемник с бобина $L = 0{,}1\ \mathrm{\mu H}$ е настроен на 100 MHz. Какъв е капацитетът на кондензатора (в pF) и какъв трябва да стане, за да се хване станция на 90 MHz?" check={[25.3, 31.3]} ask={['$C$ при 100 MHz, pF', '$C$ при 90 MHz, pF']}>
                <p><Tex>{'C = \\frac{1}{(2\\pi f)^2 L} = \\frac{1}{(2\\pi \\cdot 10^8)^2 \\cdot 10^{-7}} \\approx 25{,}3\\ \\mathrm{pF}'}</Tex></p>
                <p>Капацитетът е обратно пропорционален на <Tex>{'f^2'}</Tex>: <Tex>{'C_2 = 25{,}3 \\cdot \\left(\\frac{100}{90}\\right)^2 \\approx 31{,}3\\ \\mathrm{pF}'}</Tex>.</p>
                <p>За по-ниска честота е нужен по-голям капацитет – затова при въртене на копчето пластините на кондензатора се застъпват повече.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Кондензатор $C = 2\ \mathrm{\mu F}$, зареден до 10 V, се свързва с бобина $L = 5\ \mathrm{mH}$. Намерете пълната енергия (в mJ), най-голямата сила на тока и напрежението на кондензатора в момента, в който енергията е разделена поравно между кондензатора и бобината." check={[0.1, 0.2, 7.07]} ask={['$W$, mJ', '$I_m$, A', '$u_C$, V']}>
                <p><Tex>{'W = \\frac{CU^2}{2} = \\frac{2 \\cdot 10^{-6} \\cdot 100}{2} = 10^{-4}\\ \\mathrm{J} = 0{,}1\\ \\mathrm{mJ}'}</Tex></p>
                <p>Когато кондензаторът е разреден, цялата енергия е в бобината: <Tex>{'\\frac{LI_m^2}{2} = W \\Rightarrow I_m = \\sqrt{\\frac{2 \\cdot 10^{-4}}{5 \\cdot 10^{-3}}} = 0{,}2\\ \\mathrm{A}'}</Tex></p>
                <p>При равни енергии <Tex>{'\\frac{Cu_C^2}{2} = \\frac{W}{2} \\Rightarrow u_C = \\frac{U}{\\sqrt{2}} \\approx 7{,}07\\ \\mathrm{V}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Последователна верига има $R = 10\ \Omega$, $L = 0{,}1\ \mathrm{H}$ и $C = 10\ \mathrm{\mu F}$ и е включена към променливо напрежение 230 V. Намерете резонансната честота, тока при резонанс и тока при 50 Hz." check={[159, 23, 0.801]} ask={['$f_0$, Hz', '$I$ при резонанс, A', '$I$ при 50 Hz, A']}>
                <p><Tex>{'f_0 = \\frac{1}{2\\pi\\sqrt{0{,}1 \\cdot 10^{-5}}} \\approx 159\\ \\mathrm{Hz}'}</Tex>; тогава <Tex>{'Z = R'}</Tex> и <Tex>{'I = \\frac{230}{10} = 23\\ \\mathrm{A}'}</Tex>.</p>
                <p>При 50 Hz: <Tex>{'X_L = 2\\pi \\cdot 50 \\cdot 0{,}1 \\approx 31{,}4\\ \\Omega'}</Tex>, <Tex>{'X_C \\approx 318{,}3\\ \\Omega'}</Tex>.</p>
                <p><Tex>{'Z = \\sqrt{10^2 + (31{,}4 - 318{,}3)^2} \\approx 287\\ \\Omega'}</Tex>, <Tex>{'I = \\frac{230}{287} \\approx 0{,}801\\ \\mathrm{A}'}</Tex> – почти 30 пъти по-малко.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Wi-Fi рутер излъчва около 0,1 W еднакво във всички посоки. Какъв е интензитетът на 2 m от него (в mW/m²) и колко пъти е по-малък от интензитета на слънчевата светлина на земята (около 1000 W/m²)?" check={[1.99, 503000]} ask={['$I$, mW/m²', 'пъти']}>
                <p>Енергията се разпределя по сфера: <Tex>{'I = \\frac{P}{4\\pi r^2} = \\frac{0{,}1}{4\\pi \\cdot 4} \\approx 1{,}99 \\cdot 10^{-3}\\ \\mathrm{W/m^2} = 1{,}99\\ \\mathrm{mW/m^2}'}</Tex></p>
                <p><Tex>{'\\frac{1000}{1{,}99 \\cdot 10^{-3}} \\approx 503\\,000'}</Tex> пъти.</p>
                <p>При два пъти по-голямо разстояние интензитетът намалява 4 пъти.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'u = U_m \\sin \\omega t'}</Tex>, <Tex>{'\\omega = 2\\pi f'}</Tex>; мрежата у нас: 230 V, 50 Hz</li>
              <li>✓ Ефективни стойности <Tex>{'U = \\frac{U_m}{\\sqrt{2}}'}</Tex>, <Tex>{'I = \\frac{I_m}{\\sqrt{2}}'}</Tex>; мощност <Tex>{'P = UI'}</Tex></li>
              <li>✓ <Tex>{'X_C = \\frac{1}{\\omega C}'}</Tex> намалява, <Tex>{'X_L = \\omega L'}</Tex> расте с честотата; резонанс при <Tex>{'X_L = X_C'}</Tex></li>
              <li>✓ Трептящ кръг: <Tex>{'T = 2\\pi\\sqrt{LC}'}</Tex>; енергията прелива между C и L</li>
              <li>✓ Електромагнитната вълна е напречна: <Tex>{'\\vec{E} \\perp \\vec{B} \\perp \\vec{v}'}</Tex>, <Tex>{'c = \\lambda f \\approx 3 \\cdot 10^8\\ \\mathrm{m/s}'}</Tex></li>
              <li>✓ Спектър: радио, микровълни, инфрачервени, видима, ултравиолетови, рентгенови, гама – по намаляваща дължина на вълната</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Честотата на мрежата не е точно 50 Hz – тя леко се колебае с няколко стотни от херца според това колко ток се потребява в момента. Почти
              всеки запис, направен близо до електрически уреди, улавя слабо бръмчене с тази честота. Тъй като колебанията се записват от
              енергийните системи, в някои страни експертите сравняват бръмченето в аудио- или видеозапис с архива на мрежата и така проверяват
              кога е направен записът и дали не е редактиран.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
