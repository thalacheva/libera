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
import FaradayLab from './FaradayLab';
import GeneratorLab from './GeneratorLab';
import TransformerLab from './TransformerLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.045 → 0{,}045. */
const dec = (v: number) => String(Number(v.toFixed(6))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6]);
  if (kind === 0) {
    // Φ = BS cos α
    const [b, s] = [pick([2, 4, 5]), pick([1, 2, 5])];
    const [deg, cn, cd] = pick([
      [0, 1, 1],
      [60, 1, 2],
      [90, 0, 1],
    ] as [number, number, number][]);
    const phi = (b * s * cn) / (1000 * cd);
    return {
      tex: `B = ${dec(b / 10)}\\ \\mathrm{T}, \\quad S = ${dec(s / 100)}\\ \\mathrm{m^2}`,
      ask: `Нормалата сключва $\\alpha = ${deg}^\\circ$ с $\\vec{B}$. Магнитен поток: $\\Phi = ?\\ \\mathrm{Wb}$`,
      num: b * s * cn,
      den: 1000 * cd,
      steps: [`$\\Phi = BS\\cos\\alpha$, където $\\alpha$ е ъгълът между $\\vec{B}$ и нормалата`, `$\\Phi = ${dec(b / 10)} \\cdot ${dec(s / 100)} \\cdot ${deg === 60 ? '0{,}5' : deg === 0 ? '1' : '0'} = ${dec(phi)}\\ \\mathrm{Wb}$`],
    };
  }
  if (kind === 1) {
    // ℰ = NΔΦ/Δt
    const [N, dphi, k] = [pick([100, 200, 500]), pick([1, 2, 5]), pick([1, 5, 10])];
    const emf = (N * dphi * 100) / (1000 * k);
    return {
      tex: `N = ${N}, \\quad \\Delta\\Phi = ${dphi}\\ \\mathrm{mWb}`,
      ask: `Промяната става за $\\Delta t = ${dec(k / 100)}\\ \\mathrm{s}$. Индуцирано ЕДН: $\\mathcal{E} = ?\\ \\mathrm{V}$`,
      num: N * dphi * 100,
      den: 1000 * k,
      steps: [`$\\mathcal{E} = N\\frac{\\Delta\\Phi}{\\Delta t}$ (по големина), $\\Delta\\Phi = ${dec(dphi / 1000)}\\ \\mathrm{Wb}$`, `$\\mathcal{E} = ${N} \\cdot \\frac{${dec(dphi / 1000)}}{${dec(k / 100)}} = ${dec(emf)}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 2) {
    // ℰ = Blv
    const [b, l, v] = [pick([1, 2, 5]), pick([2, 5, 10]), pick([2, 4, 10])];
    const emf = (b * l * v) / 100;
    return {
      tex: `B = ${dec(b / 10)}\\ \\mathrm{T}, \\quad l = ${dec(l / 10)}\\ \\mathrm{m}`,
      ask: `Проводникът се движи с $v = ${v}\\ \\mathrm{m/s}$ перпендикулярно на линиите: $\\mathcal{E} = ?\\ \\mathrm{V}$`,
      num: b * l * v,
      den: 100,
      steps: ['$\\mathcal{E} = Blv$ – проводникът „реже“ линиите на полето', `$\\mathcal{E} = ${dec(b / 10)} \\cdot ${dec(l / 10)} \\cdot ${v} = ${dec(emf)}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 3) {
    // Трансформатор
    const [n1, n2] = pick([
      [1000, 50],
      [2000, 100],
      [500, 25],
      [100, 2000],
      [200, 1000],
      [1150, 60],
    ] as [number, number][]);
    const u1 = n1 === 1150 ? 230 : pick([12, 24, 230]);
    const u2 = (u1 * n2) / n1;
    return {
      tex: `N_1 = ${n1}, \\quad N_2 = ${n2}`,
      ask: `При $U_1 = ${u1}\\ \\mathrm{V}$ напрежението на вторичната намотка е $U_2 = ?\\ \\mathrm{V}$`,
      num: u1 * n2,
      den: n1,
      steps: ['$\\frac{U_2}{U_1} = \\frac{N_2}{N_1}$', `$U_2 = ${u1} \\cdot \\frac{${n2}}{${n1}} = ${dec(u2)}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 4) {
    // ℰₘₐₓ = NBSω
    const [N, b, s, w] = [pick([50, 100, 200]), pick([1, 2, 5]), pick([1, 2, 4]), pick([100, 200])];
    const emf = (N * b * s * w) / 1000;
    return {
      tex: `N = ${N}, \\quad B = ${dec(b / 10)}\\ \\mathrm{T}`,
      ask: `Рамка с лице $S = ${dec(s / 100)}\\ \\mathrm{m^2}$ се върти с $\\omega = ${w}\\ \\mathrm{rad/s}$: $\\mathcal{E}_{\\max} = ?\\ \\mathrm{V}$`,
      num: N * b * s * w,
      den: 1000,
      steps: ['$\\mathcal{E}_{\\max} = NBS\\omega$', `$\\mathcal{E}_{\\max} = ${N} \\cdot ${dec(b / 10)} \\cdot ${dec(s / 100)} \\cdot ${w} = ${dec(emf)}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 5) {
    // Самоиндукция
    const [l, dI, k] = [pick([1, 2, 5]), pick([1, 2, 4]), pick([1, 2, 10])];
    const emf = (l * dI * 100) / (10 * k);
    return {
      tex: `L = ${dec(l / 10)}\\ \\mathrm{H}, \\quad \\Delta I = ${dI}\\ \\mathrm{A}`,
      ask: `Токът се мени за $\\Delta t = ${dec(k / 100)}\\ \\mathrm{s}$. ЕДН на самоиндукция: $\\mathcal{E} = ?\\ \\mathrm{V}$`,
      num: l * dI * 100,
      den: 10 * k,
      steps: ['$\\mathcal{E} = L\\frac{\\Delta I}{\\Delta t}$ (по големина)', `$\\mathcal{E} = ${dec(l / 10)} \\cdot \\frac{${dI}}{${dec(k / 100)}} = ${dec(emf)}\\ \\mathrm{V}$`],
    };
  }
  // Загуби в далекопровод
  const [P, R, U] = [pick([1, 2, 5]), pick([5, 10]), pick([10, 20, 50])];
  const lossKW = (1000 * P * P * R) / (U * U);
  return {
    tex: `P = ${P}\\ \\mathrm{MW}, \\quad U = ${U}\\ \\mathrm{kV}`,
    ask: `Линията е със съпротивление $R = ${R}\\ \\Omega$. Загуби: $P_{\\text{заг}} = ?\\ \\mathrm{kW}$`,
    num: 1000 * P * P * R,
    den: U * U,
    steps: [`$I = \\frac{P}{U} = \\frac{${P} \\cdot 10^6}{${U} \\cdot 10^3} = ${dec((1000 * P) / U)}\\ \\mathrm{A}$`, `$P_{\\text{заг}} = I^2 R = ${dec((1000 * P) / U)}^2 \\cdot ${R} = ${dec(lossKW * 1000)}\\ \\mathrm{W} = ${dec(lossKW)}\\ \\mathrm{kW}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🔌 Зарядно устройство',
    problem: 'Трансформаторът в старо зарядно понижава 230 V от контакта до 12 V. Първичната му намотка има 2300 навивки. Колко навивки има вторичната?',
    solution: ['$\\frac{N_2}{N_1} = \\frac{U_2}{U_1} = \\frac{12}{230}$', '$N_2 = 2300 \\cdot \\frac{12}{230} = 120$ навивки'],
    answer: '120 навивки',
    check: [120],
    ask: ['навивки'],
  },
  {
    title: '🔋 Ток от контакта',
    problem: 'Същото зарядно дава на изхода 12 V и 2 A. Какъв ток тече в първичната намотка, ако трансформаторът е идеален?',
    solution: ['Изходната мощност е $P = 12 \\cdot 2 = 24\\ \\mathrm{W}$; в идеалния трансформатор входната е същата.', '$I_1 = \\frac{24}{230} \\approx 0{,}104\\ \\mathrm{A}$ – около 20 пъти по-малък ток.'],
    answer: '$\\approx 0{,}104\\ \\mathrm{A}$',
    check: [0.104],
    ask: ['ток, A'],
  },
  {
    title: '⚡ Далекопровод',
    problem: 'Електроцентрала праща 1 MW по линия със съпротивление 10 Ω. Колко киловата се губят в проводниците при напрежение 10 kV и колко при 110 kV?',
    solution: ['При 10 kV: $I = \\frac{10^6}{10^4} = 100\\ \\mathrm{A}$, $P_{\\text{заг}} = 100^2 \\cdot 10 = 100\\ \\mathrm{kW}$ – 10%.', 'При 110 kV: $I \\approx 9{,}09\\ \\mathrm{A}$, $P_{\\text{заг}} \\approx 826\\ \\mathrm{W} = 0{,}826\\ \\mathrm{kW}$ – под 0,1%.'],
    answer: '100 kW и около 0,826 kW',
    check: [100, 0.826],
    ask: ['при 10 kV, kW', 'при 110 kV, kW'],
  },
  {
    title: '✈️ ЕДН в крилата на самолет',
    problem: 'Самолет с размах на крилата 60 m лети хоризонтално с 250 m/s. Вертикалната съставяща на земното магнитно поле е около 5 · 10⁻⁵ T. Какво напрежение се индуцира между краищата на крилата?',
    solution: ['Крилата са проводник, който „реже“ вертикалните линии: $\\mathcal{E} = Blv$', '$\\mathcal{E} = 5 \\cdot 10^{-5} \\cdot 60 \\cdot 250 = 0{,}75\\ \\mathrm{V}$ – съвсем безопасно.'],
    answer: '$0{,}75\\ \\mathrm{V}$',
    check: [0.75],
    ask: ['напрежение, V'],
  },
  {
    title: '🧲 Магнит и бобина',
    problem: 'Магнит се вкарва за 0,1 s в бобина с 200 навивки и потокът през всяка навивка нараства от 0 до 3 mWb. Какво е средното индуцирано ЕДН?',
    solution: ['$\\mathcal{E} = N\\frac{\\Delta\\Phi}{\\Delta t} = 200 \\cdot \\frac{0{,}003}{0{,}1}$', '$\\mathcal{E} = 6\\ \\mathrm{V}$'],
    answer: '$6\\ \\mathrm{V}$',
    check: [6],
    ask: ['ЕДН, V'],
  },
  {
    title: '🔄 Велосипедно динамо',
    problem: 'Рамка със 100 навивки и лице 0,01 m² се върти в поле 0,2 T с честота 50 Hz. Какво е най-голямото ЕДН?',
    solution: ['$\\omega = 2\\pi f = 100\\pi \\approx 314\\ \\mathrm{rad/s}$', '$\\mathcal{E}_{\\max} = NBS\\omega = 100 \\cdot 0{,}2 \\cdot 0{,}01 \\cdot 314 \\approx 62{,}8\\ \\mathrm{V}$'],
    answer: '$\\approx 62{,}8\\ \\mathrm{V}$',
    check: [62.8],
    ask: ['ЕДН, V'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'В каква единица се измерва магнитният поток?',
    answers: ['вебер', 'тесла', 'хенри', 'волт'],
    correctAnswer: 'вебер',
  },
  {
    question: 'Кога в затворена бобина тече индуциран ток?',
    answers: ['когато магнитният поток през нея се мени', 'когато в нея има силен магнит', 'винаги, когато е близо до магнит', 'само ако е от желязо'],
    correctAnswer: 'когато магнитният поток през нея се мени',
  },
  {
    question: 'Какво казва правилото на Ленц за индуцирания ток?',
    answers: ['противодейства на промяната, която го е предизвикала', 'усилва промяната на потока', 'винаги тече по часовниковата стрелка', 'не зависи от посоката на движение'],
    correctAnswer: 'противодейства на промяната, която го е предизвикала',
  },
  {
    question: 'Трансформатор има $N_1 = 100$ и $N_2 = 1000$ навивки. Какво е изходното напрежение при $U_1 = 12\\ \\mathrm{V}$?',
    answers: ['$120\\ \\mathrm{V}$', '$1{,}2\\ \\mathrm{V}$', '$12\\ \\mathrm{V}$', '$1200\\ \\mathrm{V}$'],
    correctAnswer: '$120\\ \\mathrm{V}$',
  },
  {
    question: 'С какъв ток работи трансформаторът?',
    answers: ['само с променлив', 'само с постоянен', 'и с двата еднакво', 'само с ток от батерия'],
    correctAnswer: 'само с променлив',
  },
  {
    question: 'Защо електроенергията се пренася при високо напрежение?',
    answers: ['за да е малък токът и загубите I²R', 'защото така е по-безопасно', 'за да е по-голям токът', 'защото проводниците са по-къси'],
    correctAnswer: 'за да е малък токът и загубите I²R',
  },
  {
    question: 'Магнит се вкарва в бобина два пъти по-бързо. Как се променя индуцираното ЕДН?',
    answers: ['удвоява се', 'не се променя', 'намалява наполовина', 'учетворява се'],
    correctAnswer: 'удвоява се',
  },
  {
    question: 'Кога ЕДН на генератор с въртяща се рамка е най-голямо?',
    answers: ['когато линиите на полето лежат в равнината на рамката', 'когато линиите на полето са перпендикулярни на рамката', 'когато потокът е най-голям', 'когато рамката е спряла'],
    correctAnswer: 'когато линиите на полето лежат в равнината на рамката',
  },
  {
    question: 'Силен магнит пада във вертикална медна тръба. Какво наблюдаваме?',
    answers: ['пада много по-бавно, отколкото в пластмасова тръба', 'пада по-бързо от свободно падане', 'залепва за медта', 'пада точно като в пластмасова тръба'],
    correctAnswer: 'пада много по-бавно, отколкото в пластмасова тръба',
  },
];

// ---------- Страница ----------

export function Induction() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Електромагнитна индукция</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧲 Ерстед вече е показал, че <Term id="electric-current">токът</Term> създава <Term id="magnetic-field">магнитно поле</Term>. Майкъл Фарадей години наред търси обратното – ток от магнетизъм. На 29
            август 1831 г. той навива две <Term id="solenoid">бобини</Term> върху железен пръстен и свързва едната с батерия, а другата – със стрелка за ток. Стрелката
            трепва само в мига, в който включва или изключва батерията, и остава неподвижна, докато токът тече постоянно. Фарадей разбира: ток
            се индуцира не от магнитното поле, а от <strong>промяната</strong> му. Почти по същото време същото открива и американецът Джоузеф
            Хенри. На това откритие се дължат всички генератори и трансформатори днес.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Магнитен поток</h2>
          <p className={text}>
            Колко „силно“ магнитно поле минава през една рамка, зависи от три неща: индукцията на полето <Tex>{'B'}</Tex>, лицето на рамката{' '}
            <Tex>{'S'}</Tex> и ъгъла, под който линиите я пронизват (за самото поле виж{' '}
            <Link to="/physics/electricity/magnetic-field" className={link}>
              Магнитно поле
            </Link>
            ).
          </p>
          <Theorem
            type="definition"
            title="Магнитен поток"
            description="$\Phi = BS\cos\alpha$, където $\alpha$ е ъгълът между $\vec{B}$ и нормалата към рамката. Единицата е вебер: $1\ \mathrm{Wb} = 1\ \mathrm{T \cdot m^2}$. Потокът е най-голям, когато линиите пронизват рамката перпендикулярно ($\alpha = 0$), и е нула, когато лежат в равнината ѝ ($\alpha = 90^\circ$)."
          />
          <Example
            description="Рамка с лице 0,04 m² е в поле 0,5 T, като нормалата ѝ сключва 60° с линиите. Какъв е потокът?"
            steps={['$\\Phi = BS\\cos\\alpha = 0{,}5 \\cdot 0{,}04 \\cdot \\cos 60^\\circ$', '$\\Phi = 0{,}5 \\cdot 0{,}04 \\cdot 0{,}5 = 0{,}01\\ \\mathrm{Wb}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Закон на Фарадей и правило на Ленц</h2>
          <Theorem
            title="Закон на Фарадей"
            description="Когато магнитният поток през затворен контур се мени, в него се индуцира ЕДН: $\mathcal{E} = -N\frac{\Delta\Phi}{\Delta t}$, където $N$ е броят навивки. Колкото по-бързо се мени потокът, толкова по-голямо е ЕДН. Постоянният поток, колкото и голям да е, не индуцира нищо."
          />
          <Theorem
            title="Правило на Ленц"
            description="Индуцираният ток има такава посока, че неговото магнитно поле противодейства на промяната на потока, която го е предизвикала. Това е минусът в закона на Фарадей. Ако беше обратно, токът щеше да усилва сам себе си и да създава енергия от нищо – правилото на Ленц е следствие от закона за запазване на енергията."
          />
          <p className={text}>
            Когато приближаваш северния полюс на магнит към бобина, обърнатият към него край на бобината също става северен полюс и го отблъсква
            – трябва да извършиш работа, за да го вкараш. Тази работа се превръща в електрична енергия (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ). Пробвай в лабораторията.
          </p>
          <FaradayLab />
          <Example
            description="Бобина с 500 навивки е в поле, чийто поток през всяка навивка намалява с 2 mWb за 0,05 s. Какво е ЕДН?"
            steps={['$\\mathcal{E} = N\\frac{\\Delta\\Phi}{\\Delta t} = 500 \\cdot \\frac{0{,}002}{0{,}05}$', '$\\mathcal{E} = 20\\ \\mathrm{V}$ (по големина; посоката на тока определяме по правилото на Ленц)']}
          />
          <p className={text}>
            Правилото на Ленц обяснява и <strong>вихровите токове</strong>: в масивен метал, който се движи в магнитно поле, се индуцират кръгови
            токове, които го спират. Силен магнит пада бавно в медна тръба, влаковете и камионите имат вихрови спирачки, а индукционният котлон
            загрява само металния съд – в дъното му се индуцират вихрови токове.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. ЕДН в движещ се проводник</h2>
          <Theorem
            title="ЕДН при движение в магнитно поле"
            description="Проводник с дължина $l$, който се движи със скорост $v$ перпендикулярно на линиите на полето $B$, има между краищата си ЕДН $\mathcal{E} = Blv$. Причината е силата на Лоренц, която избутва свободните електрони към единия край. Ако проводникът е част от затворена верига, по нея тече ток."
          />
          <Example
            description="Метален прът с дължина 0,5 m се плъзга по релси със скорост 4 m/s в поле 0,3 T. Релсите са свързани с резистор 2 Ω. Намерете ЕДН, тока и силата, с която полето спира пръта."
            steps={[
              '$\\mathcal{E} = Blv = 0{,}3 \\cdot 0{,}5 \\cdot 4 = 0{,}6\\ \\mathrm{V}$, $I = \\frac{\\mathcal{E}}{R} = 0{,}3\\ \\mathrm{A}$',
              'На тока в пръта действа сила на Ампер $F = BIl = 0{,}3 \\cdot 0{,}3 \\cdot 0{,}5 = 0{,}045\\ \\mathrm{N}$, насочена срещу движението (Ленц).',
              'За да държим скоростта постоянна, бутаме с мощност $Fv = 0{,}18\\ \\mathrm{W}$ – точно колкото се отделя в резистора: $I^2R = 0{,}09 \\cdot 2 = 0{,}18\\ \\mathrm{W}$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Генератор</h2>
          <p className={text}>
            Най-удобният начин да менем потока непрекъснато е да въртим рамка в магнитно поле. Ако ъгълът между нормалата и полето е{' '}
            <Tex>{'\\theta = \\omega t'}</Tex>, потокът е <Tex>{'\\Phi = NBS\\cos\\omega t'}</Tex>, а <Term id="emf">ЕДН</Term> се мени синусоидално.
          </p>
          <Theorem
            title="ЕДН на генератор"
            description="Рамка с $N$ навивки и лице $S$, която се върти с ъглова скорост $\omega$ в поле $B$, има ЕДН $\mathcal{E} = NBS\omega\sin\omega t$. Максималната му стойност е $\mathcal{E}_{\max} = NBS\omega$. Посоката на тока се сменя два пъти на оборот – получава се променлив ток."
          />
          <GeneratorLab />
          <p className={text}>
            Генераторите в електроцентралите въртят турбини с пара, вода или вятър. В Европа мрежата е с <Term id="frequency">честота</Term> 50 Hz: двуполюсен генератор
            прави 3000 оборота в минута. Как се описва <Term id="alternating-current">променливият ток</Term> и какво значи „230 V“ за него – в урока{' '}
            <Link to="/physics/electricity/ac-em-waves" className={link}>
              Променлив ток и ЕМ вълни
            </Link>
            .
          </p>
          <Example
            description="Генератор има рамка с 200 навивки и лице 0,02 m², която се върти с 3000 оборота в минута в поле 0,1 T. Какво е най-голямото ЕДН?"
            steps={['$f = \\frac{3000}{60} = 50\\ \\mathrm{Hz}$, $\\omega = 2\\pi f \\approx 314\\ \\mathrm{rad/s}$', '$\\mathcal{E}_{\\max} = NBS\\omega = 200 \\cdot 0{,}1 \\cdot 0{,}02 \\cdot 314 \\approx 126\\ \\mathrm{V}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Самоиндукция</h2>
          <p className={text}>
            Бобината сама създава магнитен поток, когато през нея тече ток. Ако токът се мени, мени се и този поток – и в самата бобина се
            индуцира ЕДН, което се противопоставя на промяната. Затова бобината „не обича“ промени на тока: забавя нарастването му при включване
            и го поддържа за миг при изключване – тогава между контактите може да прескочи искра.
          </p>
          <Theorem
            title="Самоиндукция"
            description="ЕДН на самоиндукция е $\mathcal{E} = -L\frac{\Delta I}{\Delta t}$, където $L$ е индуктивността на бобината, единица хенри ($\mathrm{H}$). Енергията на магнитното поле в бобина с ток $I$ е $W = \frac{LI^2}{2}$ – аналогично на кинетичната енергия, а $L$ играе ролята на „инертност“ на тока."
          />
          <Example
            description="Ток 2 A в бобина с индуктивност 0,2 H спада до нула за 0,01 s. Какво ЕДН се индуцира и каква енергия е имало полето?"
            steps={['$\\mathcal{E} = L\\frac{\\Delta I}{\\Delta t} = 0{,}2 \\cdot \\frac{2}{0{,}01} = 40\\ \\mathrm{V}$ – много повече от напрежението на батерия.', '$W = \\frac{LI^2}{2} = \\frac{0{,}2 \\cdot 4}{2} = 0{,}4\\ \\mathrm{J}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Трансформатор и пренос на енергия</h2>
          <Theorem
            title="Трансформатор"
            description="Две намотки са на общо желязно ядро. Променливият ток в първичната създава променлив поток, който минава и през вторичната. В идеален трансформатор $\frac{U_2}{U_1} = \frac{N_2}{N_1}$ и мощността се запазва: $U_1 I_1 = U_2 I_2$. Каквото печелим от напрежение, губим от ток."
          />
          <p className={text}>
            Загубите в <Term id="conductor">проводниците</Term> са <Tex>{'I^2R'}</Tex> (виж{' '}
            <Link to="/physics/electricity/direct-current" className={link}>
              Постоянен ток
            </Link>
            ). При една и съща <Term id="power">мощност</Term> <Tex>{'P = UI'}</Tex>: десет пъти по-високо <Term id="voltage">напрежение</Term> означава десет пъти по-малък ток и сто пъти по-малки
            загуби. Затова центровете повишават напрежението до стотици киловолта, а подстанциите и трансформаторите по улиците го понижават до
            230 V.
          </p>
          <TransformerLab />
          <Example
            description="За село трябва да се пренесат 100 kW по линия със съпротивление 5 Ω. При какво най-малко напрежение загубите са не повече от 1%?"
            steps={['$P_{\\text{заг}} = I^2R = \\left(\\frac{P}{U}\\right)^2 R \\le 0{,}01P$', '$U^2 \\ge \\frac{PR}{0{,}01} = \\frac{10^5 \\cdot 5}{0{,}01} = 5 \\cdot 10^7 \\Rightarrow U \\ge 7071\\ \\mathrm{V} \\approx 7{,}07\\ \\mathrm{kV}$']}
          />
          <p className={text}>
            Индукцията работи около нас навсякъде: динамичният микрофон превръща трептенията на мембрана с бобина в ток, безжичното зарядно
            предава енергия от бобина в бобина, металотърсачът „усеща“ вихровите токове в метала, а електрическата китара – трептенията на
            стоманените струни над малки магнити с бобини.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 0,045.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Индукцията около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Поле или промяна', 'силен магнит в бобина създава ток', 'ток има само докато потокът се мени'],
              ['Ъгълът в потока', '$\\Phi = BS\\sin\\alpha$ с ъгъла до рамката', '$\\Phi = BS\\cos\\alpha$, $\\alpha$ – ъгълът между $\\vec{B}$ и нормалата'],
              ['Правилото на Ленц', 'индуцираният ток усилва промяната', 'противодейства на промяната – иначе енергия от нищо'],
              ['Брой навивки', '$\\mathcal{E} = \\frac{\\Delta\\Phi}{\\Delta t}$ за бобина', '$\\mathcal{E} = N\\frac{\\Delta\\Phi}{\\Delta t}$ – всяка навивка дава своя дял'],
              ['Трансформатор и постоянен ток', 'трансформаторът понижава и напрежението на батерия', 'при постоянен ток потокът не се мени и няма индукция'],
              ['Трансформаторът „печели“ енергия', 'повишава напрежението и мощността', '$U_1I_1 = U_2I_2$: по-високо напрежение – по-малък ток'],
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
              <Task id="a1" number={1} color="border-green-500" question="Рамка с лице 0,04 m² е в магнитно поле 0,5 T. Нормалата ѝ сключва ъгъл 60° с линиите на полето. Намерете магнитния поток." check={[0.01]} ask={['$\\Phi$, Wb']}>
                <p><Tex>{'\\Phi = BS\\cos\\alpha = 0{,}5 \\cdot 0{,}04 \\cdot 0{,}5'}</Tex></p>
                <p><Tex>{'\\Phi = 0{,}01\\ \\mathrm{Wb}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Магнитният поток през всяка от 500 навивки на бобина се променя с 2 mWb за 0,05 s. Какво е индуцираното ЕДН?" check={[20]} ask={['$\\mathcal{E}$, V']}>
                <p><Tex>{'\\mathcal{E} = N\\frac{\\Delta\\Phi}{\\Delta t} = 500 \\cdot \\frac{0{,}002}{0{,}05}'}</Tex></p>
                <p><Tex>{'\\mathcal{E} = 20\\ \\mathrm{V}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Понижаващ трансформатор има 1000 навивки в първичната и 50 във вторичната намотка. Какво е изходното напрежение при 230 V на входа?" check={[11.5]} ask={['$U_2$, V']}>
                <p><Tex>{'U_2 = U_1\\frac{N_2}{N_1} = 230 \\cdot \\frac{50}{1000}'}</Tex></p>
                <p><Tex>{'U_2 = 11{,}5\\ \\mathrm{V}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Прът с дължина 0,5 m се плъзга с 4 m/s по релси в поле 0,3 T, перпендикулярно на линиите. Релсите са свързани с резистор 2 Ω. Намерете ЕДН, тока и спиращата сила." check={[0.6, 0.3, 0.045]} ask={['$\\mathcal{E}$, V', '$I$, A', '$F$, N']}>
                <p><Tex>{'\\mathcal{E} = Blv = 0{,}3 \\cdot 0{,}5 \\cdot 4 = 0{,}6\\ \\mathrm{V}'}</Tex></p>
                <p><Tex>{'I = \\frac{\\mathcal{E}}{R} = \\frac{0{,}6}{2} = 0{,}3\\ \\mathrm{A}'}</Tex></p>
                <p><Tex>{'F = BIl = 0{,}3 \\cdot 0{,}3 \\cdot 0{,}5 = 0{,}045\\ \\mathrm{N}'}</Tex>, насочена срещу движението.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Рамка с 200 навивки и лице 0,02 m² се върти с 3000 оборота в минута в поле 0,1 T. Намерете най-голямото ЕДН." check={[126]} ask={['$\\mathcal{E}_{\\max}$, V']}>
                <p><Tex>{'\\omega = 2\\pi \\cdot \\frac{3000}{60} = 100\\pi \\approx 314\\ \\mathrm{rad/s}'}</Tex></p>
                <p><Tex>{'\\mathcal{E}_{\\max} = NBS\\omega = 200 \\cdot 0{,}1 \\cdot 0{,}02 \\cdot 314 \\approx 126\\ \\mathrm{V}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Ток 2 A в бобина с индуктивност 0,2 H се прекъсва и спада до нула за 0,01 s. Намерете ЕДН на самоиндукция и енергията на магнитното поле преди прекъсването." check={[40, 0.4]} ask={['$\\mathcal{E}$, V', '$W$, J']}>
                <p><Tex>{'\\mathcal{E} = L\\frac{\\Delta I}{\\Delta t} = 0{,}2 \\cdot \\frac{2}{0{,}01} = 40\\ \\mathrm{V}'}</Tex></p>
                <p><Tex>{'W = \\frac{LI^2}{2} = \\frac{0{,}2 \\cdot 2^2}{2} = 0{,}4\\ \\mathrm{J}'}</Tex></p>
                <p>Тази енергия се отделя в искрата между контактите на ключа.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Към село трябва да се пренасят 100 kW по линия със съпротивление 5 Ω. При какво най-малко напрежение (в kV) загубите в линията са не повече от 1% от пренасяната мощност?" check={[7.07]} ask={['$U$, kV']}>
                <p>Токът е <Tex>{'I = \\frac{P}{U}'}</Tex>, а загубите – <Tex>{'I^2R = \\frac{P^2R}{U^2}'}</Tex>.</p>
                <p><Tex>{'\\frac{P^2R}{U^2} \\le 0{,}01P \\Rightarrow U^2 \\ge \\frac{PR}{0{,}01} = 5 \\cdot 10^7\\ \\mathrm{V^2}'}</Tex></p>
                <p><Tex>{'U \\ge \\sqrt{5 \\cdot 10^7} \\approx 7071\\ \\mathrm{V} \\approx 7{,}07\\ \\mathrm{kV}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Метален прът с маса 10 g и дължина 0,2 m се плъзга без триене надолу по две вертикални релси, свързани в горния край с резистор 0,5 Ω. Хоризонталното поле е 0,5 T, перпендикулярно на релсите. До каква пределна скорост ще достигне прътът? ($g = 9{,}8\ \mathrm{m/s^2}$, съпротивлението на пръта и релсите пренебрегваме.)" check={[4.9]} ask={['скорост, m/s']}>
                <p>При скорост <Tex>{'v'}</Tex>: <Tex>{'\\mathcal{E} = Blv'}</Tex>, <Tex>{'I = \\frac{Blv}{R}'}</Tex>, а спиращата сила е <Tex>{'F = BIl = \\frac{B^2l^2v}{R}'}</Tex>.</p>
                <p>Скоростта спира да расте, когато <Tex>{'F = mg'}</Tex>: <Tex>{'v = \\frac{mgR}{B^2l^2}'}</Tex>.</p>
                <p><Tex>{'v = \\frac{0{,}01 \\cdot 9{,}8 \\cdot 0{,}5}{0{,}25 \\cdot 0{,}04} = 4{,}9\\ \\mathrm{m/s}'}</Tex></p>
                <p>Тогава цялата намаляваща потенциална енергия се превръща в топлина в резистора – както при магнита в медната тръба.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Квадратна рамка със страна 0,1 m и съпротивление 0,1 Ω е изцяло в поле 0,5 T, перпендикулярно на рамката. Изтегляме я извън полето с постоянна скорост 2 m/s. Какъв заряд протича през рамката и колко топлина се отделя?" check={[0.05, 0.005]} ask={['заряд, C', 'топлина, J']}>
                <p>Докато рамката излиза, страната ѝ в полето има <Tex>{'\\mathcal{E} = Bav = 0{,}5 \\cdot 0{,}1 \\cdot 2 = 0{,}1\\ \\mathrm{V}'}</Tex>, токът е <Tex>{'I = 1\\ \\mathrm{A}'}</Tex> и тече <Tex>{'t = \\frac{a}{v} = 0{,}05\\ \\mathrm{s}'}</Tex>.</p>
                <p>Заряд: <Tex>{'q = It = 0{,}05\\ \\mathrm{C}'}</Tex>. Същото дава и <Tex>{'q = \\frac{\\Delta\\Phi}{R} = \\frac{Ba^2}{R} = \\frac{0{,}5 \\cdot 0{,}01}{0{,}1} = 0{,}05\\ \\mathrm{C}'}</Tex> – зарядът не зависи от скоростта!</p>
                <p>Топлина: <Tex>{'Q = I^2Rt = 1 \\cdot 0{,}1 \\cdot 0{,}05 = 0{,}005\\ \\mathrm{J}'}</Tex>. При по-бързо изтегляне топлината расте пропорционално на скоростта.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Магнитен поток <Tex>{'\\Phi = BS\\cos\\alpha'}</Tex>, единица вебер</li>
              <li>✓ Закон на Фарадей <Tex>{'\\mathcal{E} = -N\\frac{\\Delta\\Phi}{\\Delta t}'}</Tex>: ЕДН има само докато потокът се мени</li>
              <li>✓ Правило на Ленц: индуцираният ток противодейства на промяната – следствие от <Term id="energy-conservation">запазването на енергията</Term></li>
              <li>✓ Движещ се проводник: <Tex>{'\\mathcal{E} = Blv'}</Tex>; генератор: <Tex>{'\\mathcal{E} = NBS\\omega\\sin\\omega t'}</Tex></li>
              <li>✓ Самоиндукция <Tex>{'\\mathcal{E} = -L\\frac{\\Delta I}{\\Delta t}'}</Tex>, енергия на бобина <Tex>{'\\frac{LI^2}{2}'}</Tex></li>
              <li>✓ Трансформатор <Tex>{'\\frac{U_2}{U_1} = \\frac{N_2}{N_1}'}</Tex>; пренос при високо напрежение – малък ток и малки загуби <Tex>{'I^2R'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 1996 г. совалката „Колумбия“ развива от орбита проводящо въже, дълго близо 20 km, със спътник в края му. Въжето пресича
              линиите на земното магнитно поле със скорост около 7,5 km/s и по формулата <Tex>{'\\mathcal{E} = Blv'}</Tex> в него се индуцират
              хиляди волтове – измерени са около 3500 V. Малко преди да бъде развито докрай, въжето се скъсва, но опитът показва, че от движението
              в магнитното поле на Земята може да се получава ток. Разказва се също, че на въпроса на политик „за какво е полезно това?“ Фарадей
              отговорил „Скоро ще можете да го облагате с данъци“ – но тази история най-вероятно е измислена по-късно.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
