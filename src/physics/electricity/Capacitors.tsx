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
import CapacitorNetworkLab from './CapacitorNetworkLab';
import PlateCapacitorLab from './PlateCapacitorLab';
import RCLab from './RCLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 1.2 → 1{,}2. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6]);
  if (kind === 0) {
    const [C, U] = [pick([2, 5, 10, 47, 100]), pick([3, 6, 9, 12])];
    return {
      tex: `C = ${C}\\ \\mathrm{\\mu F}, \\quad U = ${U}\\ \\mathrm{V}`,
      ask: 'Заряд: $q = ?\\ \\mathrm{\\mu C}$',
      num: C * U,
      den: 1,
      steps: ['$q = CU$', `$q = ${C} \\cdot ${U} = ${C * U}\\ \\mathrm{\\mu C}$ (микрофаради по волтове дават микрокулони)`],
    };
  }
  if (kind === 1) {
    const [C, U] = [pick([10, 20, 100]), pick([10, 20, 50])];
    return {
      tex: `C = ${C}\\ \\mathrm{\\mu F}, \\quad U = ${U}\\ \\mathrm{V}`,
      ask: 'Енергия: $W = ?\\ \\mathrm{mJ}$',
      num: C * U * U,
      den: 2000,
      steps: [`$W = \\frac{CU^2}{2} = \\frac{${C} \\cdot 10^{-6} \\cdot ${U}^2}{2}\\ \\mathrm{J}$`, `$W = ${dec((C * U * U) / 2)}\\ \\mathrm{\\mu J} = ${dec((C * U * U) / 2000)}\\ \\mathrm{mJ}$`],
    };
  }
  if (kind === 2) {
    const [a, b] = [pick([1, 2, 4, 10, 22]), pick([3, 5, 6, 47])];
    return {
      tex: `C_1 = ${a}\\ \\mathrm{\\mu F}, \\quad C_2 = ${b}\\ \\mathrm{\\mu F}`,
      ask: 'Успоредно свързани: $C = ?\\ \\mathrm{\\mu F}$',
      num: a + b,
      den: 1,
      steps: ['При успоредно свързване капацитетите се събират: $C = C_1 + C_2$', `$C = ${a} + ${b} = ${a + b}\\ \\mathrm{\\mu F}$`],
    };
  }
  if (kind === 3) {
    const [a, b] = pick([
      [2, 2],
      [3, 6],
      [4, 12],
      [2, 3],
      [10, 15],
      [4, 4],
    ]);
    return {
      tex: `C_1 = ${a}\\ \\mathrm{\\mu F}, \\quad C_2 = ${b}\\ \\mathrm{\\mu F}`,
      ask: 'Последователно свързани: $C = ?\\ \\mathrm{\\mu F}$',
      num: a * b,
      den: a + b,
      steps: ['$\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2} \\Rightarrow C = \\frac{C_1 C_2}{C_1 + C_2}$', `$C = \\frac{${a} \\cdot ${b}}{${a} + ${b}} = \\frac{${a * b}}{${a + b}} = ${dec((a * b) / (a + b))}\\ \\mathrm{\\mu F}$`],
    };
  }
  if (kind === 4) {
    const [R, C] = [pick([1, 2, 10, 47]), pick([10, 100, 220])];
    return {
      tex: `R = ${R}\\ \\mathrm{k\\Omega}, \\quad C = ${C}\\ \\mathrm{\\mu F}`,
      ask: 'Времеконстанта: $\\tau = ?\\ \\mathrm{ms}$',
      num: R * C,
      den: 1,
      steps: ['$\\tau = RC$', `$\\tau = ${R} \\cdot 10^3 \\cdot ${C} \\cdot 10^{-6} = ${dec((R * C) / 1000)}\\ \\mathrm{s} = ${R * C}\\ \\mathrm{ms}$`],
    };
  }
  if (kind === 5) {
    const [S, d] = [pick([50, 100, 200]), pick([5, 10, 20])];
    return {
      tex: `S = ${S}\\ \\mathrm{cm^2}, \\quad d = ${dec(d / 10)}\\ \\mathrm{mm}, \\quad \\varepsilon = 1`,
      ask: 'С $\\varepsilon_0 = 8{,}85 \\cdot 10^{-12}\\ \\mathrm{F/m}$: $C = ?\\ \\mathrm{pF}$',
      num: 885 * S,
      den: 100 * d,
      steps: [
        `$S = ${S} \\cdot 10^{-4}\\ \\mathrm{m^2}$, $d = ${dec(d / 10)} \\cdot 10^{-3}\\ \\mathrm{m}$`,
        `$C = \\frac{\\varepsilon_0 S}{d} = \\frac{8{,}85 \\cdot 10^{-12} \\cdot ${S} \\cdot 10^{-4}}{${dec(d / 10)} \\cdot 10^{-3}} = ${dec((8.85 * S) / d)}\\ \\mathrm{pF}$`,
      ],
    };
  }
  const [U, d] = [pick([100, 200, 300]), pick([1, 2, 5])];
  return {
    tex: `U = ${U}\\ \\mathrm{V}, \\quad d = ${d}\\ \\mathrm{mm}`,
    ask: 'Поле между плочите: $E = ?\\ \\mathrm{kV/m}$',
    num: U,
    den: d,
    steps: ['Полето в плосък кондензатор е еднородно: $E = \\frac{U}{d}$', `$E = \\frac{${U}\\ \\mathrm{V}}{${d} \\cdot 10^{-3}\\ \\mathrm{m}} = ${dec(U / d)}\\ \\mathrm{kV/m}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '📸 Светкавица',
    problem: 'Кондензаторът на фотосветкавица има капацитет 200 µF и се зарежда до 300 V. Колко джаула енергия отдава при едно светване?',
    solution: ['$W = \\frac{CU^2}{2} = \\frac{200 \\cdot 10^{-6} \\cdot 300^2}{2}$', '$W = 9\\ \\mathrm{J}$ – освободени за около милисекунда, затова светкавицата е толкова ярка.'],
    answer: '$9\\ \\mathrm{J}$',
    check: [9],
    ask: ['енергия, J'],
  },
  {
    title: '❤️ Дефибрилатор',
    problem: 'Дефибрилатор трябва да подаде импулс с енергия 200 J от кондензатор с капацитет 100 µF. До какво напрежение трябва да се зареди кондензаторът?',
    solution: ['$W = \\frac{CU^2}{2} \\Rightarrow U = \\sqrt{\\frac{2W}{C}}$', '$U = \\sqrt{\\frac{2 \\cdot 200}{100 \\cdot 10^{-6}}} = \\sqrt{4 \\cdot 10^6} = 2000\\ \\mathrm{V}$'],
    answer: '$2000\\ \\mathrm{V}$',
    check: [2000],
    ask: ['напрежение, V'],
  },
  {
    title: '⌨️ Клавиш на клавиатура',
    problem: 'Под клавиш има две пластинки с лице 1 cm², на 3 mm една от друга (въздух). При натискане разстоянието става 1 mm. Какъв е капацитетът преди и след натискането в pF? ($\\varepsilon_0 = 8{,}85 \\cdot 10^{-12}\\ \\mathrm{F/m}$)',
    solution: ['$C = \\frac{\\varepsilon_0 S}{d}$, $S = 10^{-4}\\ \\mathrm{m^2}$', 'Преди: $C_1 = \\frac{8{,}85 \\cdot 10^{-12} \\cdot 10^{-4}}{3 \\cdot 10^{-3}} \\approx 0{,}295\\ \\mathrm{pF}$', 'След: $C_2 = \\frac{8{,}85 \\cdot 10^{-12} \\cdot 10^{-4}}{10^{-3}} \\approx 0{,}885\\ \\mathrm{pF}$ – три пъти повече; електрониката отчита промяната.'],
    answer: '0,295 pF и 0,885 pF',
    check: [0.295, 0.885],
    ask: ['преди, pF', 'след, pF'],
  },
  {
    title: '🔋 Суперкондензатор',
    problem: 'Суперкондензатор има капацитет 3000 F и работно напрежение 2,7 V. Колко килоджаула енергия може да натрупа?',
    solution: ['$W = \\frac{CU^2}{2} = \\frac{3000 \\cdot 2{,}7^2}{2}$', '$W \\approx 10\\,900\\ \\mathrm{J} \\approx 10{,}9\\ \\mathrm{kJ}$ – а може да ги отдаде за секунди, много по-бързо от батерия.'],
    answer: '$\\approx 10{,}9\\ \\mathrm{kJ}$',
    check: [10.9],
    ask: ['енергия, kJ'],
  },
  {
    title: '⏱ Закъснение с RC',
    problem: 'В схема за закъснение (например лампичка, която угасва бавно) има резистор 47 kΩ и кондензатор 22 µF. Колко е времеконстантата τ в секунди?',
    solution: ['$\\tau = RC = 47 \\cdot 10^3 \\cdot 22 \\cdot 10^{-6}$', '$\\tau \\approx 1{,}03\\ \\mathrm{s}$; за около 5τ ≈ 5 s процесът практически свършва.'],
    answer: '$\\approx 1{,}03\\ \\mathrm{s}$',
    check: [1.03],
    ask: ['τ, s'],
  },
  {
    title: '🔌 Филтър в захранване',
    problem: 'В захранване два кондензатора по 470 µF са свързани успоредно и са заредени до 12 V. Какъв е общият им заряд в миликулони?',
    solution: ['Успоредно: $C = 470 + 470 = 940\\ \\mathrm{\\mu F}$', '$q = CU = 940 \\cdot 10^{-6} \\cdot 12 \\approx 0{,}0113\\ \\mathrm{C} = 11{,}3\\ \\mathrm{mC}$'],
    answer: '$\\approx 11{,}3\\ \\mathrm{mC}$',
    check: [11.3],
    ask: ['заряд, mC'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Каква е единицата за капацитет в SI?',
    answers: ['фарад', 'кулон', 'волт', 'хенри'],
    correctAnswer: 'фарад',
  },
  {
    question: 'Как се променя капацитетът на плосък кондензатор, ако разстоянието между плочите се удвои?',
    answers: ['намалява 2 пъти', 'нараства 2 пъти', 'не се променя', 'намалява 4 пъти'],
    correctAnswer: 'намалява 2 пъти',
  },
  {
    question: 'Два еднакви кондензатора с капацитет $C$ са свързани последователно. Какъв е общият капацитет?',
    answers: ['$\\frac{C}{2}$', '$2C$', '$C$', '$\\frac{C}{4}$'],
    correctAnswer: '$\\frac{C}{2}$',
  },
  {
    question: 'Колко пъти нараства енергията на кондензатор, ако напрежението му се удвои?',
    answers: ['$4$', '$2$', '$8$', '$\\sqrt{2}$'],
    correctAnswer: '$4$',
  },
  {
    question: 'До каква част от напрежението на батерията се зарежда кондензатор през резистор за време $\\tau = RC$?',
    answers: ['$63\\%$', '$50\\%$', '$100\\%$', '$37\\%$'],
    correctAnswer: '$63\\%$',
  },
  {
    question: 'Колко е времеконстантата при $R = 1\\ \\mathrm{k\\Omega}$ и $C = 1\\ \\mathrm{mF}$?',
    answers: ['$1\\ \\mathrm{s}$', '$1\\ \\mathrm{ms}$', '$1000\\ \\mathrm{s}$', '$10^{-6}\\ \\mathrm{s}$'],
    correctAnswer: '$1\\ \\mathrm{s}$',
  },
  {
    question: 'Кондензатор е свързан към батерия. Между плочите му вкарваме диелектрик. Какво става?',
    answers: ['капацитетът и зарядът нарастват', 'капацитетът нараства, а зарядът намалява', 'напрежението нараства', 'нищо не се променя'],
    correctAnswer: 'капацитетът и зарядът нарастват',
  },
  {
    question: 'Плосък кондензатор е под напрежение 100 V, а плочите са на 2 mm. Колко е полето между тях?',
    answers: ['$5 \\cdot 10^4\\ \\mathrm{V/m}$', '$200\\ \\mathrm{V/m}$', '$50\\ \\mathrm{V/m}$', '$2 \\cdot 10^5\\ \\mathrm{V/m}$'],
    correctAnswer: '$5 \\cdot 10^4\\ \\mathrm{V/m}$',
  },
  {
    question: 'Кое от тези устройства отчита докосване чрез промяна на капацитет?',
    answers: ['сензорният екран на телефона', 'крушката с нажежаема жичка', 'магнитът на хладилника', 'живачният термометър'],
    correctAnswer: 'сензорният екран на телефона',
  },
];

// ---------- Страница ----------

export function Capacitors() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Кондензатори</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚡ През 1745–1746 г. двама изследователи независимо един от друг – Евалд фон Клайст в Померания и Питер ван Мушенбрук в Лайден –
            „наливат“ електричество в стъкленица с вода. Когато Мушенбрук докосва едновременно стъкленицата и жицата в нея, го удря такъв ток,
            че според често цитираното му писмо не би повторил опита „дори за цялото френско кралство“. Така се ражда{' '}
            <strong>Лайденската стъкленица</strong> – първият кондензатор. Скоро след това, според разказите, абат Жан-Антоан Ноле пуска разряд през
            верига от около 180 гвардейци, хванати за ръце, пред френския крал – и всички подскачат едновременно.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е кондензатор?</h2>
          <p className={text}>
            Кондензаторът е два проводника (обикновено плочи), разделени от изолатор. Когато го свържем към батерия, тя „изпомпва“ електрони
            от едната плоча към другата: едната се зарежда положително (<Tex>{'+q'}</Tex>), другата – отрицателно (<Tex>{'-q'}</Tex>). Между
            плочите възниква електрично поле, в което е натрупана енергия (виж{' '}
            <Link to="/physics/electricity/electrostatics" className={link}>
              Електростатика
            </Link>
            ). Ток през изолатора не тече – кондензаторът само се зарежда и разрежда.
          </p>
          <Theorem
            type="definition"
            title="Капацитет"
            description="Капацитетът показва колко заряд побира кондензаторът за всеки волт напрежение: $C = \frac{q}{U}$. Единицата е фарад: $1\ \mathrm{F} = 1\ \mathrm{C/V}$. Фарадът е огромен – на практика се използват $\mathrm{\mu F}$ ($10^{-6}$), $\mathrm{nF}$ ($10^{-9}$) и $\mathrm{pF}$ ($10^{-12}$). Капацитетът зависи от формата и материала, а не от напрежението."
          />
          <Example
            description="Кондензатор с капацитет 47 µF е свързан към батерия 9 V. Какъв заряд има на плочите му?"
            steps={['$q = CU = 47 \\cdot 10^{-6} \\cdot 9$', '$q \\approx 4{,}23 \\cdot 10^{-4}\\ \\mathrm{C} = 423\\ \\mathrm{\\mu C}$ на всяка плоча (с противоположни знаци)']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Плосък кондензатор и диелектрик</h2>
          <Theorem
            title="Капацитет на плосък кондензатор"
            description="За две успоредни плочи с лице $S$ на разстояние $d$: $C = \frac{\varepsilon_0 \varepsilon S}{d}$, където $\varepsilon_0 \approx 8{,}85 \cdot 10^{-12}\ \mathrm{F/m}$, а $\varepsilon$ е диелектричната проницаемост на веществото между плочите ($\varepsilon = 1$ за вакуум и почти толкова за въздух). Полето между плочите е еднородно: $E = \frac{U}{d}$."
          />
          <p className={text}>
            Защо диелектрикът увеличава капацитета? Молекулите му се <strong>поляризират</strong>: зарядите в тях леко се изместват и създават
            поле, обратно на външното. Полето отслабва ε пъти, затова при същото напрежение плочите побират ε пъти повече заряд. Така
            кондензаторите с тънко фолио и подходящ диелектрик стават малки, но с голям капацитет.
          </p>
          <Example
            description="Плочи 10 cm × 10 cm са на 1 mm една от друга (въздух). Какъв е капацитетът? Какъв заряд и енергия има при 100 V?"
            steps={[
              '$C = \\frac{8{,}85 \\cdot 10^{-12} \\cdot 0{,}01}{10^{-3}} \\approx 8{,}85 \\cdot 10^{-11}\\ \\mathrm{F} = 88{,}5\\ \\mathrm{pF}$',
              '$q = CU \\approx 8{,}85 \\cdot 10^{-9}\\ \\mathrm{C}$; $E = \\frac{U}{d} = 10^5\\ \\mathrm{V/m}$',
              '$W = \\frac{CU^2}{2} \\approx 4{,}43 \\cdot 10^{-7}\\ \\mathrm{J}$ – съвсем малко. Големи капацитети се получават с огромна площ и много малко разстояние.',
            ]}
          />
          <PlateCapacitorLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Енергия на кондензатора</h2>
          <Theorem
            title="Енергия на зареден кондензатор"
            description="$W = \frac{CU^2}{2} = \frac{qU}{2} = \frac{q^2}{2C}$. Множителят $\frac{1}{2}$ идва от това, че при зареждането напрежението расте от 0 до $U$ – средно е $\frac{U}{2}$. Енергията е натрупана в електричното поле между плочите."
          />
          <p className={text}>
            Кондензаторът натрупва малко енергия в сравнение с батерия, но може да я отдаде почти мигновено. Затова е незаменим в
            светкавиците, в дефибрилаторите (обикновено от порядъка на 150–360 J) и в импулсните лазери. В захранванията кондензаторите
            „изглаждат“ напрежението – отдават заряд, когато то спадне, и се презареждат, когато се вдигне.
          </p>
          <Example
            description="Дефибрилатор с кондензатор 100 µF трябва да подаде 200 J. До какво напрежение се зарежда?"
            steps={['$U = \\sqrt{\\frac{2W}{C}} = \\sqrt{\\frac{400}{10^{-4}}}$', '$U = 2000\\ \\mathrm{V}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Свързване на кондензатори</h2>
          <Theorem
            title="Успоредно и последователно свързване"
            description="Успоредно: напрежението на всички е едно и също, зарядите се събират, $C = C_1 + C_2 + \ldots$ Последователно: зарядът на всички е един и същ, напреженията се събират, $\frac{1}{C} = \frac{1}{C_1} + \frac{1}{C_2} + \ldots$ Правилата са обратни на тези за резисторите."
          />
          <p className={text}>
            Успоредното свързване е като да увеличим площта на плочите – капацитетът расте. Последователното е като да раздалечим плочите –
            капацитетът намалява и е по-малък и от най-малкия, но групата издържа по-голямо напрежение.
          </p>
          <CapacitorNetworkLab />
          <Example
            description="Кондензатор 2 µF е свързан последователно с група от 3 µF и 1 µF, свързани успоредно. Цялата верига е на 12 V. Намерете общия капацитет и напрежението на първия кондензатор."
            steps={['Групата: $3 + 1 = 4\\ \\mathrm{\\mu F}$', 'Общо: $C = \\frac{2 \\cdot 4}{2 + 4} = \\frac{4}{3} \\approx 1{,}33\\ \\mathrm{\\mu F}$', '$q = CU = 16\\ \\mathrm{\\mu C}$, $U_1 = \\frac{q}{C_1} = 8\\ \\mathrm{V}$, а на групата остават $4\\ \\mathrm{V}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Зареждане и разреждане през резистор</h2>
          <p className={text}>
            Ако кондензатор се зарежда от батерия с ЕДН <Tex>{'\\mathcal{E}'}</Tex> през резистор <Tex>{'R'}</Tex> (виж{' '}
            <Link to="/physics/electricity/direct-current" className={link}>
              Постоянен ток
            </Link>
            ), в началото токът е най-голям: <Tex>{'I_0 = \\frac{\\mathcal{E}}{R}'}</Tex>. С натрупването на заряд напрежението на кондензатора
            расте, разликата <Tex>{'\\mathcal{E} - U_C'}</Tex> намалява и токът спада. Получава се диференциално уравнение, чието решение е
            експонента (виж{' '}
            <Link to="/analysis/differential-equations" className={link}>
              Диференциални уравнения
            </Link>
            ).
          </p>
          <Theorem
            title="Времеконстанта τ = RC"
            description="При зареждане $U_C = \mathcal{E}\left(1 - e^{-t/\tau}\right)$, при разреждане $U_C = U_0 e^{-t/\tau}$, където $\tau = RC$. За време $\tau$ кондензаторът се зарежда до около 63% (или се разрежда до около 37%), а след около $5\tau$ процесът практически е завършил."
          />
          <RCLab />
          <Example
            description="Кондензатор 100 µF, зареден до 10 V, се разрежда през резистор 20 kΩ. Какво е напрежението след 4 s и кога пада наполовина?"
            steps={[
              '$\\tau = RC = 20 \\cdot 10^3 \\cdot 100 \\cdot 10^{-6} = 2\\ \\mathrm{s}$',
              '$U(4) = 10 \\cdot e^{-4/2} = 10e^{-2} \\approx 1{,}35\\ \\mathrm{V}$',
              'Наполовина: $e^{-t/\\tau} = \\frac{1}{2} \\Rightarrow t = \\tau \\ln 2 \\approx 1{,}39\\ \\mathrm{s}$',
            ]}
          />
          <p className={text}>
            Логаритъмът тук е естествен – прегледай урока{' '}
            <Link to="/algebra/logarithms" className={link}>
              Логаритми
            </Link>
            . RC вериги задават закъснения, мигащи светлини и честоти в електрониката.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 1,2.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Кондензаторите около нас</h2>
          <p className={text}>
            Кондензатори има във всеки електронен уред. Сензорният екран на телефона усеща пръста ти, защото той променя капацитета между
            мрежа от прозрачни електроди. Клавишите на много клавиатури също са мънички кондензатори.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Свързване', 'последователно: $C = C_1 + C_2$', 'успоредно $C = C_1 + C_2$, последователно $\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2}$'],
              ['Капацитет и напрежение', 'при по-голямо $U$ капацитетът е по-голям', '$C$ зависи само от формата и диелектрика; с $U$ расте зарядът $q = CU$'],
              ['Енергия', '$W = CU$', '$W = \\frac{CU^2}{2}$ – напрежението е на квадрат'],
              ['Ток през кондензатора', 'кондензаторът пропуска постоянен ток', 'ток тече само докато се зарежда или разрежда'],
              ['Време за зареждане', 'за време $\\tau$ кондензаторът се зарежда напълно', 'за $\\tau$ – до около 63%, за $5\\tau$ – над 99%'],
              ['Представки', '$C = 100\\ \\mathrm{\\mu F} = 0{,}1\\ \\mathrm{F}$', '$100\\ \\mathrm{\\mu F} = 10^{-4}\\ \\mathrm{F}$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Кондензатор, свързан към 12 V, има заряд 6 µC. Какъв е капацитетът му в µF?" check={[0.5]} ask={['$C$, µF']}>
                <p><Tex>{'C = \\frac{q}{U} = \\frac{6\\ \\mathrm{\\mu C}}{12\\ \\mathrm{V}}'}</Tex></p>
                <p><Tex>{'C = 0{,}5\\ \\mathrm{\\mu F}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Кондензатори 2 µF и 3 µF са свързани веднъж успоредно, веднъж последователно. Намерете общия капацитет в двата случая." check={[5, 1.2]} ask={['успоредно, µF', 'последователно, µF']}>
                <p>Успоредно: <Tex>{'C = 2 + 3 = 5\\ \\mathrm{\\mu F}'}</Tex></p>
                <p>Последователно: <Tex>{'C = \\frac{2 \\cdot 3}{2 + 3} = 1{,}2\\ \\mathrm{\\mu F}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Каква енергия има кондензатор с капацитет 10 µF, зареден до 100 V?" check={[0.05]} ask={['$W$, J']}>
                <p><Tex>{'W = \\frac{CU^2}{2} = \\frac{10 \\cdot 10^{-6} \\cdot 100^2}{2}'}</Tex></p>
                <p><Tex>{'W = 0{,}05\\ \\mathrm{J}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Плосък кондензатор има плочи с лице 200 cm² на 0,5 mm една от друга, а между тях има диелектрик с $\varepsilon = 4$. Намерете капацитета (в nF) и заряда при 50 V (в nC). ($\varepsilon_0 = 8{,}85 \cdot 10^{-12}\ \mathrm{F/m}$)" check={[1.42, 70.8]} ask={['$C$, nF', '$q$, nC']}>
                <p><Tex>{'C = \\frac{\\varepsilon_0 \\varepsilon S}{d} = \\frac{8{,}85 \\cdot 10^{-12} \\cdot 4 \\cdot 0{,}02}{5 \\cdot 10^{-4}}'}</Tex></p>
                <p><Tex>{'C \\approx 1{,}42 \\cdot 10^{-9}\\ \\mathrm{F} = 1{,}42\\ \\mathrm{nF}'}</Tex></p>
                <p><Tex>{'q = CU \\approx 1{,}42 \\cdot 10^{-9} \\cdot 50 \\approx 70{,}8\\ \\mathrm{nC}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Кондензатор 10 µF е зареден до 20 V и откачен от батерията. После разстоянието между плочите му се удвоява. Какво става напрежението (в V) и енергията (в mJ)?" check={[40, 4]} ask={['$U$, V', '$W$, mJ']}>
                <p>Откачен е, затова зарядът се запазва: <Tex>{'q = CU = 200\\ \\mathrm{\\mu C}'}</Tex>.</p>
                <p>При двойно разстояние <Tex>{'C = 5\\ \\mathrm{\\mu F}'}</Tex>, значи <Tex>{'U = \\frac{q}{C} = 40\\ \\mathrm{V}'}</Tex>.</p>
                <p><Tex>{'W = \\frac{qU}{2} = \\frac{200 \\cdot 10^{-6} \\cdot 40}{2} = 4\\ \\mathrm{mJ}'}</Tex> – двойно повече от началните 2 mJ.</p>
                <p>Разликата е работата, която вършим, за да раздалечим привличащите се плочи.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Кондензатор 100 µF, зареден до 10 V, се разрежда през 20 kΩ. Какво е напрежението му след 4 s и за колко секунди пада до 5 V?" check={[1.35, 1.39]} ask={['$U$ след 4 s, V', 'време до 5 V, s']}>
                <p><Tex>{'\\tau = RC = 2\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'U(4) = 10e^{-2} \\approx 1{,}35\\ \\mathrm{V}'}</Tex></p>
                <p><Tex>{'10e^{-t/2} = 5 \\Rightarrow t = 2\\ln 2 \\approx 1{,}39\\ \\mathrm{s}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Кондензатор 10 µF е зареден до 100 V. Свързваме го с еднакъв незареден кондензатор. Какво е общото напрежение след това и какъв процент от енергията се губи?" check={[50, 50]} ask={['$U$, V', 'загуба, %']}>
                <p>Зарядът <Tex>{'q = 1\\ \\mathrm{mC}'}</Tex> се разпределя поравно (успоредно свързване, <Tex>{'C = 20\\ \\mathrm{\\mu F}'}</Tex>).</p>
                <p><Tex>{'U = \\frac{q}{C} = \\frac{10^{-3}}{2 \\cdot 10^{-5}} = 50\\ \\mathrm{V}'}</Tex></p>
                <p>Преди: <Tex>{'W_1 = \\frac{10^{-5} \\cdot 100^2}{2} = 0{,}05\\ \\mathrm{J}'}</Tex>; след: <Tex>{'W_2 = \\frac{2 \\cdot 10^{-5} \\cdot 50^2}{2} = 0{,}025\\ \\mathrm{J}'}</Tex>.</p>
                <p>Губи се 50% – превръща се в топлина в проводниците и в излъчване, колкото и малко да е съпротивлението им.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Празен плосък кондензатор има капацитет 10 pF. Колко става капацитетът, ако (а) половината от дебелината на пролуката се запълни с пластина с $\varepsilon = 3$ (успоредна на плочите); (б) половината от площта се запълни с такъв диелектрик по цялата дебелина?" check={[15, 20]} ask={['(а), pF', '(б), pF']}>
                <p>(а) Получават се два кондензатора последователно, всеки с разстояние <Tex>{'\\frac{d}{2}'}</Tex>: <Tex>{'C_1 = 2C_0 = 20\\ \\mathrm{pF}'}</Tex> и <Tex>{'C_2 = 3 \\cdot 2C_0 = 60\\ \\mathrm{pF}'}</Tex>.</p>
                <p><Tex>{'C = \\frac{20 \\cdot 60}{20 + 60} = 15\\ \\mathrm{pF}'}</Tex></p>
                <p>(б) Два кондензатора успоредно с половин площ: <Tex>{'C = \\frac{C_0}{2} + \\frac{3C_0}{2} = 2C_0 = 20\\ \\mathrm{pF}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Кондензатор $C_1 = 2\ \mathrm{\mu F}$ е свързан последователно с група от $C_2 = 3\ \mathrm{\mu F}$ и $C_3 = 1\ \mathrm{\mu F}$ (успоредно). Веригата е на 12 V. Намерете общия капацитет, напрежението на $C_1$ и заряда на $C_2$." check={[1.33, 8, 12]} ask={['$C$, µF', '$U_1$, V', '$q_2$, µC']}>
                <p>Групата: <Tex>{'C_{23} = 4\\ \\mathrm{\\mu F}'}</Tex>; общо <Tex>{'C = \\frac{2 \\cdot 4}{6} \\approx 1{,}33\\ \\mathrm{\\mu F}'}</Tex>.</p>
                <p><Tex>{'q = CU = 16\\ \\mathrm{\\mu C}'}</Tex>, затова <Tex>{'U_1 = \\frac{16}{2} = 8\\ \\mathrm{V}'}</Tex>.</p>
                <p>На групата: <Tex>{'U_{23} = 12 - 8 = 4\\ \\mathrm{V}'}</Tex>, <Tex>{'q_2 = C_2 U_{23} = 12\\ \\mathrm{\\mu C}'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Капацитет <Tex>{'C = \\frac{q}{U}'}</Tex>, единица фарад; на практика µF, nF, pF</li>
              <li>✓ Плосък кондензатор: <Tex>{'C = \\frac{\\varepsilon_0 \\varepsilon S}{d}'}</Tex>, полето вътре <Tex>{'E = \\frac{U}{d}'}</Tex>; диелектрикът увеличава C ε пъти</li>
              <li>✓ Енергия <Tex>{'W = \\frac{CU^2}{2} = \\frac{qU}{2} = \\frac{q^2}{2C}'}</Tex></li>
              <li>✓ Успоредно <Tex>{'C = C_1 + C_2'}</Tex>; последователно <Tex>{'\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2}'}</Tex></li>
              <li>✓ RC верига: <Tex>{'\\tau = RC'}</Tex>; за τ – около 63%, за 5τ – практически напълно</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Оперативната памет (DRAM) на компютъра пази всеки бит като заряд в мъничък кондензатор – с капацитет от порядъка на десетки
              фемтофарада (<Tex>{'10^{-15}\\ \\mathrm{F}'}</Tex>). Модул от 16 GB съдържа около 137 милиарда такива кондензатора. Те бавно губят
              заряда си, затова паметта ги „опреснява“ – обикновено всеки ред поне веднъж на 64 милисекунди. Ако спре токът, данните изчезват
              за части от секундата до секунди.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
