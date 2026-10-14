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
import GasBoxLab from './GasBoxLab';
import GasLawsLab from './GasLawsLab';
import SpeedDistributionLab from './SpeedDistributionLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 33.6 → 33{,}6. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');
const deg = (t: number) => `${t}\\ ^{\\circ}\\mathrm{C}`;

const SUBSTANCES = [
  { tex: '\\mathrm{H_2}', M: 2 },
  { tex: '\\mathrm{He}', M: 4 },
  { tex: '\\mathrm{H_2O}', M: 18 },
  { tex: '\\mathrm{O_2}', M: 32 },
  { tex: '\\mathrm{CO_2}', M: 44 },
];

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [s, k] = [pick(SUBSTANCES), randInt(1, 8)];
    const m = (s.M * k) / 2;
    return {
      tex: `m = ${m}\\ \\mathrm{g}\\ ${s.tex}, \\quad M = ${s.M}\\ \\mathrm{g/mol}`,
      ask: 'Количество вещество: $n = ?\\ \\mathrm{mol}$',
      num: k,
      den: 2,
      steps: [`$n = \\frac{m}{M} = \\frac{${m}}{${s.M}} = ${dec(k / 2)}\\ \\mathrm{mol}$`],
    };
  }
  if (kind === 1) {
    const V2 = pick([2, 3, 4, 6, 8]);
    return {
      tex: `p_1 = 100\\ \\mathrm{kPa}, \\quad V_1 = 12\\ \\mathrm{L}, \\quad V_2 = ${V2}\\ \\mathrm{L}`,
      ask: 'При постоянна температура: $p_2 = ?\\ \\mathrm{kPa}$',
      num: 1200,
      den: V2,
      steps: ['Закон на Бойл–Мариот: $p_1 V_1 = p_2 V_2$', `$p_2 = \\frac{100 \\cdot 12}{${V2}} = ${dec(1200 / V2)}\\ \\mathrm{kPa}$`],
    };
  }
  if (kind === 2) {
    const [V1, T2] = [pick([2, 4, 6]), pick([150, 450, 600, 900])];
    return {
      tex: `V_1 = ${V1}\\ \\mathrm{L}, \\quad T_1 = 300\\ \\mathrm{K}, \\quad T_2 = ${T2}\\ \\mathrm{K}`,
      ask: 'При постоянно налягане: $V_2 = ?\\ \\mathrm{L}$',
      num: V1 * T2,
      den: 300,
      steps: ['Закон на Гей-Люсак: $\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$', `$V_2 = ${V1} \\cdot \\frac{${T2}}{300} = ${dec((V1 * T2) / 300)}\\ \\mathrm{L}$`],
    };
  }
  if (kind === 3) {
    const t2 = pick([57, 87, 177, 327]);
    return {
      tex: `t_1 = ${deg(27)}, \\quad t_2 = ${deg(t2)}`,
      ask: 'Газ при постоянен обем има $p_1 = 200\\ \\mathrm{kPa}$ при $t_1$. $p_2 = ?\\ \\mathrm{kPa}$',
      num: 200 * (t2 + 273),
      den: 300,
      steps: [`Абсолютни температури: $T_1 = 300\\ \\mathrm{K}$, $T_2 = ${t2 + 273}\\ \\mathrm{K}$`, `Закон на Шарл: $p_2 = p_1 \\frac{T_2}{T_1} = 200 \\cdot \\frac{${t2 + 273}}{300} = ${dec((200 * (t2 + 273)) / 300)}\\ \\mathrm{kPa}$`],
    };
  }
  if (kind === 4) {
    const k = pick([1, 2, 3, 4, 6, 10]);
    return {
      tex: `n = ${dec(k / 2)}\\ \\mathrm{mol}, \\quad ${deg(0)}, \\quad 101\\ \\mathrm{kPa}`,
      ask: 'Обем на газа: $V = ?\\ \\mathrm{L}$',
      num: 112 * k,
      den: 10,
      steps: ['При нормални условия 1 mol от всеки газ заема $22{,}4\\ \\mathrm{L}$.', `$V = ${dec(k / 2)} \\cdot 22{,}4 = ${dec(11.2 * k)}\\ \\mathrm{L}$`],
    };
  }
  if (kind === 5) {
    const t = pick([-173, -73, 0, 27, 100, 127, 227]);
    return {
      tex: `t = ${deg(t)}`,
      ask: 'Абсолютна температура (приеми $0\\ ^{\\circ}\\mathrm{C} = 273\\ \\mathrm{K}$): $T = ?\\ \\mathrm{K}$',
      num: t + 273,
      den: 1,
      steps: [`$T = t + 273 = ${t + 273}\\ \\mathrm{K}$ (по-точно се добавя 273,15)`],
    };
  }
  const T2 = pick([75, 1200, 2700, 4800]);
  const r = Math.sqrt(T2 / 300);
  return {
    tex: `v_1 = 500\\ \\mathrm{m/s}, \\quad T_1 = 300\\ \\mathrm{K}, \\quad T_2 = ${T2}\\ \\mathrm{K}`,
    ask: 'Средна квадратична скорост: $v_2 = ?\\ \\mathrm{m/s}$',
    num: 500 * r,
    den: 1,
    steps: ['$v_{\\text{ск}} = \\sqrt{\\frac{3RT}{M}} \\propto \\sqrt{T}$', `$v_2 = 500 \\cdot \\sqrt{\\frac{${T2}}{300}} = 500 \\cdot ${dec(r)} = ${dec(500 * r)}\\ \\mathrm{m/s}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🎈 Балон с хелий',
    problem: 'Балон за празник съдържа 10 L хелий при 20 °C и налягане 101 kPa. Колко мола и колко грама хелий има в него? ($M = 4{,}00\\ \\mathrm{g/mol}$)',
    solution: ['$n = \\frac{pV}{RT} = \\frac{101\\,000 \\cdot 0{,}010}{8{,}314 \\cdot 293{,}15} \\approx 0{,}414\\ \\mathrm{mol}$', '$m = nM = 0{,}414 \\cdot 4{,}00 \\approx 1{,}66\\ \\mathrm{g}$ – около 7 пъти по-леко от същия обем въздух.'],
    answer: '$\\approx 0{,}414\\ \\mathrm{mol}$ и $1{,}66\\ \\mathrm{g}$',
    check: [0.414, 1.66],
    ask: ['mol', 'грама'],
  },
  {
    title: '🚗 Гумите след магистрала',
    problem: 'Абсолютното налягане в гума е 320 kPa сутрин при 10 °C. След дълго шофиране въздухът в гумата се загрява до 40 °C, а обемът почти не се променя. Какво е налягането?',
    solution: ['Обемът е постоянен: $\\frac{p_1}{T_1} = \\frac{p_2}{T_2}$', '$p_2 = 320 \\cdot \\frac{313{,}15}{283{,}15} \\approx 354\\ \\mathrm{kPa}$', 'Затова налягането в гумите се проверява, докато са студени.'],
    answer: '$\\approx 354\\ \\mathrm{kPa}$',
    check: [354],
    ask: ['налягане, kPa'],
  },
  {
    title: '🫁 Един вдъх',
    problem: 'При вдишване в белите дробове влизат около 0,5 L въздух. Колко мола са те при 37 °C и 101 kPa?',
    solution: ['$n = \\frac{pV}{RT} = \\frac{101\\,000 \\cdot 0{,}0005}{8{,}314 \\cdot 310} \\approx 0{,}0196\\ \\mathrm{mol}$', 'Това са $N = nN_A \\approx 1{,}18 \\cdot 10^{22}$ молекули.'],
    answer: '$\\approx 0{,}0196\\ \\mathrm{mol}$',
    check: [0.0196],
    ask: ['mol'],
  },
  {
    title: '🤿 Мехурче от водолаз',
    problem: 'Водолаз на дълбочина 20 m издишва мехурче с обем 2 cm³. Какъв е обемът му на повърхността, ако температурата не се променя? Атмосферното налягане е 101 kPa, а всеки метър вода добавя 9,8 kPa.',
    solution: ['На 20 m: $p_1 = 101 + 20 \\cdot 9{,}8 = 297\\ \\mathrm{kPa}$', '$V_2 = V_1 \\frac{p_1}{p_2} = 2 \\cdot \\frac{297}{101} \\approx 5{,}88\\ \\mathrm{cm^3}$', 'Затова водолазите не бива да задържат дъха си при изплуване – въздухът в белите дробове се разширява.'],
    answer: '$\\approx 5{,}88\\ \\mathrm{cm^3}$',
    check: [5.88],
    ask: ['обем, cm³'],
  },
  {
    title: '💨 Колко бързи са молекулите в стаята',
    problem: 'Каква е средната квадратична скорост на молекулите на кислорода в стая при 20 °C? ($M = 0{,}032\\ \\mathrm{kg/mol}$)',
    solution: ['$v_{\\text{ск}} = \\sqrt{\\frac{3RT}{M}} = \\sqrt{\\frac{3 \\cdot 8{,}314 \\cdot 293}{0{,}032}} \\approx 478\\ \\mathrm{m/s}$', 'По-бързо от куршума на много пистолети – но всяка молекула се удря в друга милиарди пъти в секунда и не стига далеч.'],
    answer: '$\\approx 478\\ \\mathrm{m/s}$',
    check: [478],
    ask: ['скорост, m/s'],
  },
  {
    title: '🧊 Бутилка в хладилника',
    problem: 'Затваряш празна пластмасова бутилка при 25 °C и 101 kPa и я слагаш в хладилник при 5 °C. Какво става налягането вътре, ако обемът не се промени?',
    solution: ['$p_2 = p_1 \\frac{T_2}{T_1} = 101 \\cdot \\frac{278{,}15}{298{,}15} \\approx 94{,}2\\ \\mathrm{kPa}$', 'Отвън налягането е 101 kPa, затова бутилката леко се смачква.'],
    answer: '$\\approx 94{,}2\\ \\mathrm{kPa}$',
    check: [94.2],
    ask: ['налягане, kPa'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Колко частици има в 1 mol вещество?',
    answers: ['$6{,}02 \\cdot 10^{23}$', '$22{,}4$', '$8{,}31$', '$1000$'],
    correctAnswer: '$6{,}02 \\cdot 10^{23}$',
  },
  {
    question: 'На колко келвина отговарят 27 °C?',
    answers: ['$300\\ \\mathrm{K}$', '$246\\ \\mathrm{K}$', '$27\\ \\mathrm{K}$', '$-246\\ \\mathrm{K}$'],
    correctAnswer: '$300\\ \\mathrm{K}$',
  },
  {
    question: 'При постоянна температура обемът на газ се намалява 3 пъти. Какво става с налягането?',
    answers: ['расте 3 пъти', 'намалява 3 пъти', 'не се променя', 'расте 9 пъти'],
    correctAnswer: 'расте 3 пъти',
  },
  {
    question: 'При постоянен обем газ се нагрява от 100 K до 400 K. Какво става с налягането?',
    answers: ['расте 4 пъти', 'расте 2 пъти', 'не се променя', 'расте 16 пъти'],
    correctAnswer: 'расте 4 пъти',
  },
  {
    question: 'От какво зависи средната кинетична енергия на молекулите на идеален газ?',
    answers: ['само от абсолютната температура', 'само от налягането', 'от обема на съда', 'от масата на целия газ'],
    correctAnswer: 'само от абсолютната температура',
  },
  {
    question: 'При една и съща температура молекулите на кой газ имат най-голяма средна скорост?',
    answers: ['водород', 'кислород', 'азот', 'въглероден диоксид'],
    correctAnswer: 'водород',
  },
  {
    question: 'Абсолютната температура на газ нараства 4 пъти. Колко пъти нараства средната квадратична скорост на молекулите?',
    answers: ['$2$', '$4$', '$16$', '$\\sqrt{2}$'],
    correctAnswer: '$2$',
  },
  {
    question: 'Какъв обем заема 1 mol идеален газ при 0 °C и 101,3 kPa?',
    answers: ['$22{,}4\\ \\mathrm{L}$', '$1\\ \\mathrm{L}$', '$2{,}24\\ \\mathrm{L}$', '$6{,}02\\ \\mathrm{L}$'],
    correctAnswer: '$22{,}4\\ \\mathrm{L}$',
  },
  {
    question: 'Какво доказва брауновото движение?',
    answers: ['че веществото е изградено от молекули в непрекъснато движение', 'че прашинките във водата са живи', 'че водата е непрекъсната среда', 'че топлината е невидима течност'],
    correctAnswer: 'че веществото е изградено от молекули в непрекъснато движение',
  },
];

// ---------- Страница ----------

export function IdealGas() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Идеален газ</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔬 През 1827 г. шотландският ботаник Робърт Браун разглежда под <Term id="microscope">микроскоп</Term> дребни частици от цветен прашец във вода и вижда, че те
            непрестанно подскачат насам-натам. Отначало помисля, че са живи, но същото правят и прашинки от неживи вещества. Почти 80 години
            никой не може да го обясни. През 1905 г. Алберт Айнщайн предлага отговор: частиците се блъскат от невидимите молекули на водата, а
            ударите от различните страни не се уравновесяват точно. Той пресмята колко далеч трябва да се отместват частиците, а около 1908 г.
            Жан Перен го проверява с опити и намира броя на молекулите в един мол. След това и учените, които се съмнявали, приемат, че{' '}
            <strong>атомите съществуват</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Атоми, молекули и мол</h2>
          <p className={text}>
            Всяко вещество е изградено от молекули (или атоми), които се движат непрекъснато. В газа те са далеч една от друга и летят
            свободно, докато се ударят в друга молекула или в стената. Молекулите са толкова малки, че ги броим на огромни „пакети“ – молове.
          </p>
          <Theorem
            type="definition"
            title="Количество вещество и число на Авогадро"
            description="Един мол съдържа $N_A = 6{,}022 \cdot 10^{23}$ частици (числото на Авогадро). Количеството вещество е $n = \frac{N}{N_A} = \frac{m}{M}$, където $M$ е моларната маса. В g/mol тя е равна на относителната молекулна маса: за водата $M = 18\ \mathrm{g/mol}$, за кислорода $\mathrm{O_2}$ – $32\ \mathrm{g/mol}$."
          />
          <Example
            description="Колко молекули има в чаша вода (250 g)?"
            steps={['$n = \\frac{m}{M} = \\frac{250}{18} \\approx 13{,}9\\ \\mathrm{mol}$', '$N = nN_A \\approx 13{,}9 \\cdot 6{,}02 \\cdot 10^{23} \\approx 8{,}36 \\cdot 10^{24}$', 'Ако ги наредим една до друга (по около 0,3 nm), редицата ще е дълга около $2{,}5 \\cdot 10^{15}\\ \\mathrm{m}$ – около 0,3 светлинни години.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Налягането на газа</h2>
          <Theorem
            type="definition"
            title="Модел на идеален газ"
            description="Молекулите са точки с маса, движат се хаотично по всички посоки и се удрят еластично в стените и една в друга. Между ударите не си въздействат. Реалните газове при обикновени условия се държат почти така."
          />
          <p className={text}>
            Всяка молекула, която се удря в стената, ѝ предава <Term id="momentum">импулс</Term> (виж{' '}
            <Link to="/physics/mechanics/momentum" className={link}>
              Импулс и удари
            </Link>
            ). Ударите са толкова много – милиарди милиарди всяка секунда върху всеки квадратен сантиметър, – че усещаме постоянна сила. Силата
            на единица площ е налягането <Tex>{'p = \\frac{F}{S}'}</Tex> (виж{' '}
            <Link to="/physics/mechanics/statics-fluids" className={link}>
              Статика и флуиди
            </Link>
            ). Повече молекули, по-бързи молекули или по-малък съд – повече удари и по-голямо налягане.
          </p>
          <GasBoxLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Газови закони</h2>
          <Theorem
            title="Закони на идеалния газ (за дадено количество газ)"
            description="Изотермен процес ($T$ = const): $pV = \text{const}$ – закон на Бойл–Мариот. Изобарен процес ($p$ = const): $\frac{V}{T} = \text{const}$ – закон на Гей-Люсак. Изохорен процес ($V$ = const): $\frac{p}{T} = \text{const}$ – закон на Шарл. Тук $T$ е абсолютната температура: $T = t + 273{,}15$."
          />
          <p className={text}>
            Трите закона са части от едно общо правило: <Tex>{'\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}'}</Tex>. (В някои учебници имената на
            закона на Шарл и закона на Гей-Люсак са разменени – важни са формулите.) Ако продължим правите <Tex>{'V(T)'}</Tex> и{' '}
            <Tex>{'p(T)'}</Tex> назад, те стигат нула при <Tex>{'-273{,}15\\ ^{\\circ}\\mathrm{C}'}</Tex> – <strong>абсолютната нула</strong>,
            под която температурата не може да падне (виж{' '}
            <Link to="/physics/heat/temperature" className={link}>
              Температура и топлина
            </Link>
            ).
          </p>
          <GasLawsLab />
          <Example
            description="Спринцовка съдържа 20 cm³ въздух при атмосферно налягане 100 kPa. Запушваме отвора и бавно натискаме буталото до 5 cm³. Какво е налягането?"
            steps={['Бавно свиване – температурата остава като на околната среда: $p_1 V_1 = p_2 V_2$', '$p_2 = 100 \\cdot \\frac{20}{5} = 400\\ \\mathrm{kPa}$ – четири пъти повече; затова буталото „натиска“ обратно.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Уравнение на състоянието</h2>
          <Theorem
            title="Уравнение на Клапейрон–Менделеев"
            description="$pV = nRT = NkT$, където $R = 8{,}314\ \mathrm{J/(mol \cdot K)}$ е универсалната газова константа, а $k = \frac{R}{N_A} = 1{,}381 \cdot 10^{-23}\ \mathrm{J/K}$ – константата на Болцман. При $0\ ^{\circ}\mathrm{C}$ и $101{,}3\ \mathrm{kPa}$ един мол от всеки газ заема $V_m = 22{,}4\ \mathrm{L}$."
          />
          <p className={text}>
            Забележително е, че уравнението не зависи от вида на газа: мол водород и мол въглероден диоксид при еднакви условия заемат един и
            същ обем. Различна е само масата им. В уравнението всичко е в SI: налягането в Pa, обемът в m³, температурата в K.
          </p>
          <Example
            description="Колко въздух има в стая с размери 5 m × 4 m × 2,5 m при 20 °C и 101 kPa? ($M_{\text{въздух}} = 29\ \mathrm{g/mol}$)"
            steps={[
              '$V = 50\\ \\mathrm{m^3}$, $T = 293\\ \\mathrm{K}$',
              '$n = \\frac{pV}{RT} = \\frac{101\\,325 \\cdot 50}{8{,}314 \\cdot 293} \\approx 2080\\ \\mathrm{mol}$',
              '$m = nM \\approx 2080 \\cdot 0{,}029 \\approx 60\\ \\mathrm{kg}$ – колкото тежи един възрастен човек!',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Молекулно-кинетична теория</h2>
          <Theorem
            title="Налягане и температура според движението на молекулите"
            description="Налягането на идеален газ е $p = \frac{1}{3}\rho\,\overline{v^2}$, където $\rho$ е плътността. Като сравним с $pV = NkT$, получаваме, че средната кинетична енергия на една молекула е $\overline{E_k} = \frac{3}{2}kT$. Средната квадратична скорост е $v_{\text{ск}} = \sqrt{\overline{v^2}} = \sqrt{\frac{3kT}{m_0}} = \sqrt{\frac{3RT}{M}}$."
          />
          <p className={text}>
            Така температурата получава ясен смисъл: тя е мярка за средната енергия на хаотичното движение на молекулите. При една и съща
            температура леките молекули са по-бързи – енергията им е същата, но масата е по-малка.
          </p>
          <Example
            description="Колко бързо се движат молекулите на азота (основната част от въздуха) при 27 °C? А на водорода?"
            steps={[
              '$v_{\\text{ск}} = \\sqrt{\\frac{3 \\cdot 8{,}314 \\cdot 300}{0{,}028}} \\approx 517\\ \\mathrm{m/s}$ – по-бързо от звука във въздуха.',
              'Водородът е 14 пъти по-лек: $v_{\\text{ск}} = 517 \\cdot \\sqrt{14} \\approx 1930\\ \\mathrm{m/s}$',
            ]}
          />
          <p className={text}>
            Молекулите нямат еднакви скорости: някои са бавни, други много бързи. Разпределението им е изведено от Джеймс Клерк Максуел.
            Най-бързите молекули от „опашката“ могат да избягат от планетата – затова Земята е изгубила свободния водород и хелий, а Луната
            почти няма атмосфера (подробно в лекцията{' '}
            <Link to="/astronomy/lecture13" className={link}>
              Планети от земен тип
            </Link>
            ).
          </p>
          <SpeedDistributionLab />
          <p className={text}>
            <strong>Кога газът не е идеален?</strong> При високо налягане молекулите са близо една до друга и собственият им обем вече има
            значение, а при ниска температура започват да се привличат. Тогава газът се отклонява от <Tex>{'pV = nRT'}</Tex> и накрая се втечнява.
            Как се разменя енергия между газа и околната среда, ще видим в урока{' '}
            <Link to="/physics/heat/thermodynamics" className={link}>
              Термодинамика
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 33,6.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Газът около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Градуси вместо келвини', '$pV = nRT$ с $T = 20$', '$T = 20 + 273 = 293\\ \\mathrm{K}$ – газовите закони са само с абсолютна температура'],
              ['Двойно по-топло?', 'от 20 °C до 40 °C обемът се удвоява', '$\\frac{V_2}{V_1} = \\frac{313}{293} \\approx 1{,}07$ – само със 7%'],
              ['Литри в SI формула', '$V = 10$ в $pV = nRT$ за 10 L', '$10\\ \\mathrm{L} = 0{,}010\\ \\mathrm{m^3}$'],
              ['Моларна маса в грамове', '$v = \\sqrt{\\frac{3RT}{32}}$ за кислород', '$M = 0{,}032\\ \\mathrm{kg/mol}$'],
              ['Скорост и температура', 'двойно $T$ – двойна скорост', '$v_{\\text{ск}} \\propto \\sqrt{T}$: двойно $T$ – $\\sqrt{2} \\approx 1{,}41$ пъти'],
              ['Налягане в гумата', 'манометърът показва 2,2 bar – това е $p$', 'показва свръхналягането; абсолютното е около $3{,}2\\ \\mathrm{bar}$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Колко мола и колко молекули има в 88 g въглероден диоксид ($M = 44\ \mathrm{g/mol}$)?" check={[2]} ask={['$n$, mol']}>
                <p><Tex>{'n = \\frac{m}{M} = \\frac{88}{44} = 2\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'N = nN_A = 2 \\cdot 6{,}02 \\cdot 10^{23} \\approx 1{,}20 \\cdot 10^{24}'}</Tex> молекули.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Газ в цилиндър заема 6 L при 100 kPa. Свиваме го бавно при постоянна температура до 1,5 L. Какво е налягането?" check={[400]} ask={['налягане, kPa']}>
                <p>Изотермен процес: <Tex>{'p_1 V_1 = p_2 V_2'}</Tex>.</p>
                <p><Tex>{'p_2 = 100 \\cdot \\frac{6}{1{,}5} = 400\\ \\mathrm{kPa}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Един мол газ заема 22,4 L при 0 °C. Какъв обем заема при 100 °C и същото налягане?" check={[30.6]} ask={['обем, L']}>
                <p>Изобарен процес: <Tex>{'\\frac{V_1}{T_1} = \\frac{V_2}{T_2}'}</Tex>, с <Tex>{'T_1 = 273{,}15\\ \\mathrm{K}'}</Tex> и <Tex>{'T_2 = 373{,}15\\ \\mathrm{K}'}</Tex>.</p>
                <p><Tex>{'V_2 = 22{,}4 \\cdot \\frac{373{,}15}{273{,}15} \\approx 30{,}6\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Намерете плътността на въздуха при 20 °C и 101,3 kPa ($M = 29\ \mathrm{g/mol}$)." check={[1.21]} ask={['плътност, kg/m³']}>
                <p>От <Tex>{'pV = \\frac{m}{M}RT'}</Tex> следва <Tex>{'\\rho = \\frac{m}{V} = \\frac{pM}{RT}'}</Tex>.</p>
                <p><Tex>{'\\rho = \\frac{101\\,300 \\cdot 0{,}029}{8{,}314 \\cdot 293{,}15} \\approx 1{,}21\\ \\mathrm{kg/m^3}'}</Tex></p>
                <p>Около 800 пъти по-малко от водата.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Балон с горещ въздух има обем 2500 m³. Отвън въздухът е 10 °C, а вътре е загрят до 100 °C; налягането и в двата случая е 101 kPa. Каква най-голяма маса (обвивка, кош и хора) може да вдигне балонът? ($M = 29\ \mathrm{g/mol}$)" check={[750]} ask={['маса, kg']}>
                <p>Плътностите: <Tex>{'\\rho_{\\text{отвън}} = \\frac{pM}{RT_1} = \\frac{101\\,000 \\cdot 0{,}029}{8{,}314 \\cdot 283{,}15} \\approx 1{,}244\\ \\mathrm{kg/m^3}'}</Tex>, <Tex>{'\\rho_{\\text{вътре}} \\approx 0{,}944\\ \\mathrm{kg/m^3}'}</Tex>.</p>
                <p>Архимедовата сила е теглото на изместения студен въздух, а вътре има по-лек горещ въздух. Разликата е <Tex>{'(1{,}244 - 0{,}944) \\cdot 2500 \\approx 750\\ \\mathrm{kg}'}</Tex>.</p>
                <p>Балонът може да вдигне около 750 kg общо – затова въздухът вътре се загрява силно.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Каква е средната квадратична скорост на молекулите на азота ($M = 0{,}028\ \mathrm{kg/mol}$) при 27 °C? При каква абсолютна температура тя ще е два пъти по-голяма?" check={[517, 1200]} ask={['скорост, m/s', 'температура, K']}>
                <p><Tex>{'v_{\\text{ск}} = \\sqrt{\\frac{3 \\cdot 8{,}314 \\cdot 300}{0{,}028}} \\approx 517\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'v_{\\text{ск}} \\propto \\sqrt{T}'}</Tex>: за двойна скорост температурата трябва да е 4 пъти по-висока.</p>
                <p><Tex>{'T = 4 \\cdot 300 = 1200\\ \\mathrm{K}'}</Tex> (около 927 °C).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Без да знаете температурата и вида на газа, намерете средната квадратична скорост на молекулите на въздуха, ако налягането е 101,3 kPa, а плътността – 1,20 kg/m³." check={[503]} ask={['скорост, m/s']}>
                <p>От <Tex>{'p = \\frac{1}{3}\\rho\\,\\overline{v^2}'}</Tex>: <Tex>{'v_{\\text{ск}} = \\sqrt{\\frac{3p}{\\rho}}'}</Tex>.</p>
                <p><Tex>{'v_{\\text{ск}} = \\sqrt{\\frac{3 \\cdot 101\\,300}{1{,}20}} \\approx 503\\ \\mathrm{m/s}'}</Tex></p>
                <p>Скоростта на звука (343 m/s) е от същия порядък – звукът се пренася именно от ударите на молекулите.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Два съда са свързани с тръбичка с кран. В първия (2 L) има газ при 300 kPa, а във втория (3 L) – същият газ при 100 kPa и същата температура. Какво ще е налягането, след като отворим крана и температурата се изравни с първоначалната?" check={[180]} ask={['налягане, kPa']}>
                <p>При постоянна температура броят на молекулите е пропорционален на <Tex>{'pV'}</Tex>, а той се запазва.</p>
                <p><Tex>{'p(V_1 + V_2) = p_1 V_1 + p_2 V_2 = 300 \\cdot 2 + 100 \\cdot 3 = 900\\ \\mathrm{kPa \\cdot L}'}</Tex></p>
                <p><Tex>{'p = \\frac{900}{5} = 180\\ \\mathrm{kPa}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Оценете средното разстояние между молекулите на въздуха при 0 °C и 101,3 kPa (в нанометри). Сравнете с размера на молекулата – около 0,3 nm." check={[3.34]} ask={['разстояние, nm']}>
                <p>Броят молекули в единица обем: <Tex>{'n_0 = \\frac{N}{V} = \\frac{p}{kT} = \\frac{101\\,325}{1{,}381 \\cdot 10^{-23} \\cdot 273{,}15} \\approx 2{,}69 \\cdot 10^{25}\\ \\mathrm{m^{-3}}'}</Tex>.</p>
                <p>На всяка молекула се пада кубче с обем <Tex>{'\\frac{1}{n_0}'}</Tex>, а ръбът му е <Tex>{'d = n_0^{-1/3} \\approx 3{,}34 \\cdot 10^{-9}\\ \\mathrm{m} = 3{,}34\\ \\mathrm{nm}'}</Tex>.</p>
                <p>Това е около 10 пъти повече от размера на молекулата – затова в газа собственият обем на молекулите почти не се усеща и моделът на идеалния газ работи.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'n = \\frac{N}{N_A} = \\frac{m}{M}'}</Tex>, <Tex>{'N_A = 6{,}022 \\cdot 10^{23}\\ \\mathrm{mol^{-1}}'}</Tex>; брауновото движение доказва, че молекулите съществуват и се движат</li>
              <li>✓ Налягането на газа е резултат от ударите на молекулите в стените</li>
              <li>✓ <Tex>{'pV = \\text{const}'}</Tex> (T = const), <Tex>{'\\frac{V}{T} = \\text{const}'}</Tex> (p = const), <Tex>{'\\frac{p}{T} = \\text{const}'}</Tex> (V = const), с <Tex>{'T = t + 273{,}15'}</Tex></li>
              <li>✓ <Tex>{'pV = nRT = NkT'}</Tex>; при 0 °C и 101,3 kPa един мол от всеки газ заема 22,4 L</li>
              <li>✓ <Tex>{'\\overline{E_k} = \\frac{3}{2}kT'}</Tex> – температурата е мярка за енергията на хаотичното движение</li>
              <li>✓ <Tex>{'v_{\\text{ск}} = \\sqrt{\\frac{3RT}{M}}'}</Tex>: леките молекули са по-бързи; скоростите са разпределени по Максуел</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              В цялата атмосфера на Земята има около <Tex>{'10^{44}'}</Tex> молекули, а в един вдъх – около <Tex>{'10^{22}'}</Tex>. Значи един
              вдъх е около <Tex>{'10^{-22}'}</Tex> от атмосферата. Ако молекулите от последния дъх на Юлий Цезар са се разпръснали равномерно за
              двете хилядолетия оттогава (и не са влезли в химични реакции), във всеки твой вдъх средно има около{' '}
              <strong>една молекула</strong> от него. Това е класическа <Term id="fermi-estimate">оценка по Ферми</Term> – грубо, но показва колко невъобразимо много са
              молекулите.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
