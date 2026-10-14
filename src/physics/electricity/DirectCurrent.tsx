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
import BatteryLab from './BatteryLab';
import BulbCircuitLab from './BulbCircuitLab';
import OhmLab from './OhmLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 2.5 → 2{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [I, R] = [pick([0.5, 1, 1.5, 2, 3]), pick([2, 4, 6, 8, 10, 12])];
    const U = I * R;
    return {
      tex: `U = ${dec(U)}\\ \\mathrm{V}, \\quad R = ${R}\\ \\Omega`,
      ask: 'Сила на тока: $I = ?\\ \\mathrm{A}$',
      num: U,
      den: R,
      steps: [`Закон на Ом: $I = \\frac{U}{R}$`, `$I = \\frac{${dec(U)}}{${R}} = ${dec(I)}\\ \\mathrm{A}$`],
    };
  }
  if (kind === 1) {
    const [R1, R2, I] = [randInt(1, 10), randInt(1, 10), randInt(1, 3)];
    const U = I * (R1 + R2);
    return {
      tex: `R_1 = ${R1}\\ \\Omega, \\quad R_2 = ${R2}\\ \\Omega, \\quad U = ${U}\\ \\mathrm{V}`,
      ask: 'Последователно свързани. Напрежение върху $R_2$: $U_2 = ?\\ \\mathrm{V}$',
      num: I * R2,
      den: 1,
      steps: [`$R = R_1 + R_2 = ${R1 + R2}\\ \\Omega$, $I = \\frac{U}{R} = \\frac{${U}}{${R1 + R2}} = ${I}\\ \\mathrm{A}$`, `$U_2 = IR_2 = ${I} \\cdot ${R2} = ${I * R2}\\ \\mathrm{V}$`],
    };
  }
  if (kind === 2) {
    const [R1, R2] = pick([
      [2, 2],
      [3, 6],
      [4, 12],
      [6, 12],
      [10, 10],
      [20, 30],
      [12, 24],
    ]);
    const R = (R1 * R2) / (R1 + R2);
    return {
      tex: `R_1 = ${R1}\\ \\Omega, \\quad R_2 = ${R2}\\ \\Omega`,
      ask: 'Успоредно свързани: $R = ?\\ \\Omega$',
      num: R1 * R2,
      den: R1 + R2,
      steps: [`$\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} \\Rightarrow R = \\frac{R_1 R_2}{R_1 + R_2}$`, `$R = \\frac{${R1} \\cdot ${R2}}{${R1} + ${R2}} = \\frac{${R1 * R2}}{${R1 + R2}} = ${dec(R)}\\ \\Omega$ – по-малко от най-малкото`],
    };
  }
  if (kind === 3) {
    const [U, R] = [pick([6, 12, 24]), pick([2, 3, 4, 6, 8, 12])];
    return {
      tex: `U = ${U}\\ \\mathrm{V}, \\quad R = ${R}\\ \\Omega`,
      ask: 'Мощност: $P = ?\\ \\mathrm{W}$',
      num: U * U,
      den: R,
      steps: [`$P = UI = \\frac{U^2}{R}$`, `$P = \\frac{${U}^2}{${R}} = \\frac{${U * U}}{${R}} = ${dec((U * U) / R)}\\ \\mathrm{W}$`],
    };
  }
  if (kind === 4) {
    const [P, t] = [pick([100, 1000, 2000]), pick([2, 5, 10])];
    const kwh = (P * t) / 1000;
    return {
      tex: `P = ${P}\\ \\mathrm{W}, \\quad t = ${t}\\ \\mathrm{h}`,
      ask: 'Цена при 0,15 €/kWh, в евро: $C = ?$',
      num: P * t * 15,
      den: 100000,
      steps: [`$W = Pt = ${dec(P / 1000)}\\ \\mathrm{kW} \\cdot ${t}\\ \\mathrm{h} = ${dec(kwh)}\\ \\mathrm{kWh}$`, `$${dec(kwh)} \\cdot 0{,}15 = ${dec(kwh * 0.15)}$ €`],
    };
  }
  if (kind === 5) {
    const [l, S100] = [pick([1, 2, 5, 10]), pick([10, 50, 100])];
    const S = S100 / 100;
    return {
      tex: `\\rho = 1{,}1 \\cdot 10^{-6}\\ \\Omega \\cdot \\mathrm{m}, \\quad l = ${l}\\ \\mathrm{m}, \\quad S = ${dec(S)}\\ \\mathrm{mm^2}`,
      ask: 'Нихромов проводник: $R = ?\\ \\Omega$',
      num: 110 * l,
      den: S100,
      steps: [`$R = \\rho\\frac{l}{S}$, като $S = ${dec(S)}\\ \\mathrm{mm^2} = ${dec(S)} \\cdot 10^{-6}\\ \\mathrm{m^2}$`, `$R = \\frac{1{,}1 \\cdot 10^{-6} \\cdot ${l}}{${dec(S)} \\cdot 10^{-6}} = ${dec((1.1 * l) / S)}\\ \\Omega$`],
    };
  }
  const [R, r] = pick([
    [5, 1],
    [3.5, 0.5],
    [10, 2],
    [2, 1],
    [5.5, 0.5],
  ]);
  const I = 12 / (R + r);
  return {
    tex: `\\mathcal{E} = 12\\ \\mathrm{V}, \\quad r = ${dec(r)}\\ \\Omega, \\quad R = ${dec(R)}\\ \\Omega`,
    ask: 'Напрежение на клемите: $U = ?\\ \\mathrm{V}$',
    num: 12 - I * r,
    den: 1,
    steps: [`$I = \\frac{\\mathcal{E}}{R + r} = \\frac{12}{${dec(R + r)}} = ${dec(I)}\\ \\mathrm{A}$`, `$U = \\mathcal{E} - Ir = 12 - ${dec(I)} \\cdot ${dec(r)} = ${dec(12 - I * r)}\\ \\mathrm{V}$ (или $U = IR$)`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🫖 Електрическа кана',
    problem: 'Кана с мощност 2000 W е включена в мрежата 230 V. Какъв ток тече през нея и какво е съпротивлението на нагревателя ѝ?',
    solution: ['$I = \\frac{P}{U} = \\frac{2000}{230} \\approx 8{,}70\\ \\mathrm{A}$', '$R = \\frac{U^2}{P} = \\frac{230^2}{2000} \\approx 26{,}5\\ \\Omega$'],
    answer: '$\\approx 8{,}70\\ \\mathrm{A}$ и $\\approx 26{,}5\\ \\Omega$',
    check: [8.7, 26.5],
    ask: ['ток, A', 'съпротивление, Ω'],
  },
  {
    title: '💡 LED вместо обикновена крушка',
    problem: 'Крушка с нажежаема жичка 60 W свети по 5 часа на ден. Колко евро на месец (30 дни) спестяваме, ако я сменим с LED лампа 10 W, която свети също толкова? Цена на тока 0,15 €/kWh.',
    solution: ['Разликата в мощността е $60 - 10 = 50\\ \\mathrm{W} = 0{,}05\\ \\mathrm{kW}$.', 'За месец: $0{,}05 \\cdot 5 \\cdot 30 = 7{,}5\\ \\mathrm{kWh}$', '$7{,}5 \\cdot 0{,}15 = 1{,}125 \\approx 1{,}13$ € на месец – само от една лампа.'],
    answer: '$\\approx 1{,}13$ €',
    check: [1.125],
    ask: ['спестени €'],
  },
  {
    title: '🔌 Разклонител',
    problem: 'На разклонител пише „макс. 16 A, 230 V“. Каква е най-голямата обща мощност на уредите, които можем да включим в него? Може ли едновременно кана 2000 W и радиатор 2000 W?',
    solution: ['$P_{\\max} = UI = 230 \\cdot 16 = 3680\\ \\mathrm{W}$', 'Кана и радиатор заедно теглят 4000 W > 3680 W – не бива: разклонителят прегрява.'],
    answer: '$3680\\ \\mathrm{W}$',
    check: [3680],
    ask: ['мощност, W'],
  },
  {
    title: '📱 Батерия на телефон',
    problem: 'На батерия на телефон пише 4000 mAh и 3,85 V. Колко ватчаса енергия събира тя?',
    solution: ['$4000\\ \\mathrm{mAh} = 4\\ \\mathrm{Ah}$ – това е заряд: $q = It$.', 'Енергията е $W = Uq = 3{,}85 \\cdot 4 = 15{,}4\\ \\mathrm{Wh}$ (около 55 kJ).', 'Пълното зареждане струва под половин евроцент.'],
    answer: '$15{,}4\\ \\mathrm{Wh}$',
    check: [15.4],
    ask: ['енергия, Wh'],
  },
  {
    title: '🚗 Палене на кола',
    problem: 'Акумулатор на кола има ЕДН 12,6 V и вътрешно съпротивление 0,01 Ω. При палене стартерът тегли 150 A. Какво напрежение остава на клемите?',
    solution: ['$U = \\mathcal{E} - Ir = 12{,}6 - 150 \\cdot 0{,}01 = 12{,}6 - 1{,}5 = 11{,}1\\ \\mathrm{V}$', 'Затова фаровете леко помръкват, докато въртим стартера.'],
    answer: '$11{,}1\\ \\mathrm{V}$',
    check: [11.1],
    ask: ['напрежение, V'],
  },
  {
    title: '🐌 Колко бавни са електроните?',
    problem: 'През меден проводник със сечение 1 mm² тече ток 1 A. В 1 m³ мед има около 8,5 · 10²⁸ свободни електрона, а зарядът на електрона е 1,602 · 10⁻¹⁹ C. За колко часа електрон изминава 1 m?',
    solution: ['$I = nevS \\Rightarrow v = \\frac{I}{neS} = \\frac{1}{8{,}5 \\cdot 10^{28} \\cdot 1{,}602 \\cdot 10^{-19} \\cdot 10^{-6}} \\approx 7{,}34 \\cdot 10^{-5}\\ \\mathrm{m/s}$', '$t = \\frac{1}{7{,}34 \\cdot 10^{-5}} \\approx 13\\,600\\ \\mathrm{s} \\approx 3{,}78$ часа', 'Лампата все пак светва веднага: електрическото поле в проводника се установява почти със скоростта на светлината и тласка всички електрони едновременно.'],
    answer: '$\\approx 3{,}78$ часа',
    check: [3.78],
    ask: ['часа'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'В какви единици се измерва електричното съпротивление?',
    answers: ['ом', 'ампер', 'волт', 'ват'],
    correctAnswer: 'ом',
  },
  {
    question: 'Как се свързва амперметър, за да измерим тока през лампа?',
    answers: ['последователно на лампата', 'успоредно на лампата', 'направо към батерията', 'все едно е'],
    correctAnswer: 'последователно на лампата',
  },
  {
    question: 'Два резистора по 10 Ω са свързани успоредно. Колко е общото съпротивление?',
    answers: ['$5\\ \\Omega$', '$20\\ \\Omega$', '$10\\ \\Omega$', '$100\\ \\Omega$'],
    correctAnswer: '$5\\ \\Omega$',
  },
  {
    question: 'Напрежението върху резистор се удвоява. Какво става с тока през него?',
    answers: ['удвоява се', 'намалява наполовина', 'не се променя', 'става 4 пъти по-голям'],
    correctAnswer: 'удвоява се',
  },
  {
    question: 'Уред работи на 230 V и тегли ток 2 A. Каква е мощността му?',
    answers: ['$460\\ \\mathrm{W}$', '$115\\ \\mathrm{W}$', '$232\\ \\mathrm{W}$', '$920\\ \\mathrm{W}$'],
    correctAnswer: '$460\\ \\mathrm{W}$',
  },
  {
    question: 'На колко джаула е равен 1 kWh?',
    answers: ['$3{,}6 \\cdot 10^6\\ \\mathrm{J}$', '$1000\\ \\mathrm{J}$', '$3600\\ \\mathrm{J}$', '$3{,}6 \\cdot 10^3\\ \\mathrm{J}$'],
    correctAnswer: '$3{,}6 \\cdot 10^6\\ \\mathrm{J}$',
  },
  {
    question: 'Проводник е два пъти по-дълъг и с два пъти по-голямо сечение от друг от същия метал. Как се отнасят съпротивленията им?',
    answers: ['равни са', 'първото е 2 пъти по-голямо', 'първото е 4 пъти по-голямо', 'първото е 2 пъти по-малко'],
    correctAnswer: 'равни са',
  },
  {
    question: 'При какво външно съпротивление батерия с вътрешно съпротивление $r$ дава най-голяма мощност на товара?',
    answers: ['$R = r$', '$R = 0$', '$R = 2r$', '$R \\to \\infty$'],
    correctAnswer: '$R = r$',
  },
  {
    question: 'Две лампи са свързани последователно. Едната изгаря. Какво става с другата?',
    answers: ['угасва', 'свети по-силно', 'свети както преди', 'свети по-слабо'],
    correctAnswer: 'угасва',
  },
];

// ---------- Страница ----------

const RESISTIVITY: [string, string][] = [
  ['сребро', '1{,}6 \\cdot 10^{-8}'],
  ['мед', '1{,}7 \\cdot 10^{-8}'],
  ['алуминий', '2{,}8 \\cdot 10^{-8}'],
  ['желязо', '1{,}0 \\cdot 10^{-7}'],
  ['нихром', '1{,}1 \\cdot 10^{-6}'],
];

export function DirectCurrent() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Постоянен ток</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔋 През 1800 г. италианецът Алесандро Волта описва в писмо до Лондонското кралско дружество странна колона: редуващи се дискове от
            цинк и мед (или сребро), разделени с картон, напоен със солена вода. Ако докоснеш двата ѝ края, усещаш лек удар – и той не изчезва
            като искрата от лейденска стъкленица, а продължава. Това е първата <strong>батерия</strong> – първият източник на непрекъснат
            електричен ток. Само за няколко години с нея разлагат водата на водород и кислород и откриват нови химични елементи. А единицата
            за <Term id="voltage">напрежение</Term> носи неговото име – волт.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Електричен ток</h2>
          <p className={text}>
            В металите има <strong>свободни електрони</strong>, които се движат хаотично. Когато в <Term id="conductor">проводника</Term> има <Term id="electric-field">електрично поле</Term> (виж{' '}
            <Link to="/physics/electricity/electrostatics" className={link}>
              Електростатика
            </Link>
            ), върху хаотичното движение се наслагва бавно насочено „дрейфово“ движение – това е електричният ток.
          </p>
          <Theorem
            type="definition"
            title="Сила на тока"
            description="Силата на тока е зарядът, който минава през напречното сечение на проводника за единица време: $I = \frac{q}{t}$. Единицата е ампер: $1\ \mathrm{A} = 1\ \mathrm{C/s}$. За посока на тока по договорка се приема посоката на движение на положителните заряди – от + към − по външната верига. Електроните се движат в обратна посока."
          />
          <p className={text}>
            Електроните в проводника се придвижват изненадващо бавно – обикновено под милиметър в секунда. Лампата обаче светва веднага,
            защото полето, което ги тласка, се разпространява по проводника почти със скоростта на светлината и всички електрони тръгват
            едновременно – като вода в пълен маркуч.
          </p>
          <Example
            description="През лампа минава ток 0,5 A. Какъв заряд минава през нея за 1 минута и колко електрона са това?"
            steps={['$q = It = 0{,}5 \\cdot 60 = 30\\ \\mathrm{C}$', '$N = \\frac{q}{e} = \\frac{30}{1{,}602 \\cdot 10^{-19}} \\approx 1{,}87 \\cdot 10^{20}$ електрона']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Напрежение, съпротивление и закон на Ом</h2>
          <p className={text}>
            <strong>Напрежението</strong> <Tex>{'U'}</Tex> между две точки показва каква работа извършва полето, за да премести единица <Term id="electric-charge">заряд</Term>:{' '}
            <Tex>{'U = \\frac{A}{q}'}</Tex>, <Tex>{'1\\ \\mathrm{V} = 1\\ \\mathrm{J/C}'}</Tex>. Батерия от 9 V дава на всеки кулон заряд 9 J
            енергия.
          </p>
          <Theorem
            title="Закон на Ом за участък от верига"
            description="Силата на тока през проводник е правопропорционална на напрежението между краищата му: $I = \frac{U}{R}$. Коефициентът $R$ е съпротивлението на проводника; единицата е ом: $1\ \Omega = 1\ \mathrm{V/A}$."
          />
          <Theorem
            title="Съпротивление на проводник"
            description="$R = \rho\frac{l}{S}$, където $l$ е дължината, $S$ – напречното сечение, а $\rho$ – специфичното съпротивление на материала (в $\Omega \cdot \mathrm{m}$). При металите съпротивлението расте с температурата."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="w-full text-sm sm:text-base border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">Материал</th>
                  <th className="text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                    <Tex>{'\\rho,\\ \\Omega \\cdot \\mathrm{m}'}</Tex> (при 20 °C)
                  </th>
                </tr>
              </thead>
              <tbody>
                {RESISTIVITY.map(([name, value]) => (
                  <tr key={name}>
                    <td className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">{name}</td>
                    <td className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <Tex>{value}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Колко е съпротивлението на меден проводник с дължина 100 m и сечение 1,5 mm²?"
            steps={['$S = 1{,}5\\ \\mathrm{mm^2} = 1{,}5 \\cdot 10^{-6}\\ \\mathrm{m^2}$', '$R = 1{,}7 \\cdot 10^{-8} \\cdot \\frac{100}{1{,}5 \\cdot 10^{-6}} \\approx 1{,}13\\ \\Omega$ – затова медта е добър материал за кабели, а нихромът – за нагреватели.']}
          />
          <p className={text}>
            Законът на Ом не важи за всички елементи. При лампата жичката се нагорещява и съпротивлението ѝ расте, а диодът пропуска ток почти
            само в едната посока. Зависимостта <Tex>{'I(U)'}</Tex> се нарича <strong>волт-амперна характеристика</strong> – при резистора тя е
            права линия.
          </p>
          <OhmLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Последователно и успоредно свързване</h2>
          <Theorem
            title="Последователно свързване"
            description="През всички елементи тече един и същ ток, а напреженията се събират: $U = U_1 + U_2$. Общото съпротивление е $R = R_1 + R_2$. Ако един елемент прекъсне веригата, токът спира навсякъде."
          />
          <Theorem
            title="Успоредно свързване"
            description="Всички елементи са под едно и също напрежение, а токовете се събират: $I = I_1 + I_2$. Общото съпротивление се намира от $\frac{1}{R} = \frac{1}{R_1} + \frac{1}{R_2}$ и е по-малко от най-малкото съпротивление. Затова уредите вкъщи са свързани успоредно."
          />
          <p className={text}>
            Амперметърът се свързва <strong>последователно</strong> на елемента (и има много малко съпротивление), а волтметърът –{' '}
            <strong>успоредно</strong> (и има много голямо съпротивление), за да не променят тока във веригата.
          </p>
          <Example
            description="Делител на напрежение: резистори 2 kΩ и 4 kΩ са свързани последователно към 9 V. Какво напрежение има върху всеки?"
            steps={['$I = \\frac{9}{6000} = 1{,}5 \\cdot 10^{-3}\\ \\mathrm{A} = 1{,}5\\ \\mathrm{mA}$', '$U_1 = IR_1 = 3\\ \\mathrm{V}$, $U_2 = IR_2 = 6\\ \\mathrm{V}$', 'Напрежението се дели в отношението на съпротивленията – така работят много датчици.']}
          />
          <BulbCircuitLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Правила на Кирхоф</h2>
          <p className={text}>Сложните вериги с няколко източника не се свеждат до последователни и успоредни части. За тях Густав Кирхоф формулира две правила (1845 г.).</p>
          <Theorem
            title="Правила на Кирхоф"
            description="1) Във всеки възел сумата на влизащите токове е равна на сумата на излизащите – зарядът не се натрупва. 2) По всеки затворен контур сумата от ЕДН е равна на сумата от напреженията $IR$ върху съпротивленията (със знаци според избраната посока на обхождане)."
          />
          <Example
            description="Две батерии $\mathcal{E}_1 = 10\ \mathrm{V}$ (с $R_1 = 1\ \Omega$ в клона си) и $\mathcal{E}_2 = 8\ \mathrm{V}$ (с $R_2 = 2\ \Omega$) захранват заедно общ резистор $R_3 = 2\ \Omega$. Плюсовете им гледат към един и същ възел. Намерете токовете."
            steps={[
              'Възел: $I_3 = I_1 + I_2$',
              'Контур 1: $10 = 1 \\cdot I_1 + 2I_3$; контур 2: $8 = 2I_2 + 2I_3$',
              'От тях $I_1 = 10 - 2I_3$ и $I_2 = 4 - I_3$, т.е. $I_3 = 14 - 3I_3 \\Rightarrow I_3 = 3{,}5\\ \\mathrm{A}$',
              '$I_1 = 3\\ \\mathrm{A}$, $I_2 = 0{,}5\\ \\mathrm{A}$. Проверка: $1 \\cdot 3 + 2 \\cdot 3{,}5 = 10$ ✓',
            ]}
          />
          <p className={text}>Ако някой ток излезе отрицателен, просто тече обратно на посоката, която сме предположили.</p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Работа и мощност на тока</h2>
          <Theorem
            title="Работа и мощност"
            description="За време $t$ токът извършва работа $W = UIt$. Мощността е $P = UI = I^2R = \frac{U^2}{R}$. Във всеки резистор тази енергия се превръща в топлина (закон на Джаул–Ленц: $Q = I^2Rt$). Електроенергията се мери в киловатчасове: $1\ \mathrm{kWh} = 3{,}6 \cdot 10^6\ \mathrm{J}$."
          />
          <p className={text}>
            Отделянето на топлина е полезно в котлони и бойлери (виж{' '}
            <Link to="/physics/heat/temperature" className={link}>
              Температура и топлина
            </Link>
            ), но вредно в кабелите. Твърде голям ток прегрява проводниците – затова във всяко жилище има предпазители, които прекъсват
            веригата при претоварване или късо съединение. <Term id="power">Мощността</Term> е същото понятие като в механиката (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ).
          </p>
          <Example
            description="Радиатор от 2000 W работи по 3 часа на ден. Колко струва това за ден и за месец (30 дни) при 0,15 €/kWh?"
            steps={['$W = 2\\ \\mathrm{kW} \\cdot 3\\ \\mathrm{h} = 6\\ \\mathrm{kWh}$ на ден', '$6 \\cdot 0{,}15 = 0{,}90$ € на ден, т.е. $27$ € за 30 дни']}
          />
          <p className={text}>
            ⚠️ Мрежовото напрежение от 230 V е опасно за живота. Колко ток ще мине през тялото, зависи от много неща (влажна кожа, път през
            тялото), но още токове от десетки милиампера могат да бъдат опасни. Никога не пипай оголени проводници и не използвай уреди с
            повреден кабел или близо до вода.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. ЕДН и вътрешно съпротивление</h2>
          <Theorem
            title="Закон на Ом за цялата верига"
            description="Източникът има електродвижещо напрежение (ЕДН) $\mathcal{E}$ – работата на външните (например химичните) сили за единица заряд – и вътрешно съпротивление $r$. Токът е $I = \frac{\mathcal{E}}{R + r}$, а напрежението на клемите е $U = \mathcal{E} - Ir$. При късо съединение ($R = 0$) токът е най-голям: $I = \frac{\mathcal{E}}{r}$."
          />
          <Example
            description="Акумулатор с $\mathcal{E} = 12\ \mathrm{V}$ и $r = 0{,}5\ \Omega$ захранва лампа с $R = 5{,}5\ \Omega$. Намерете тока, напрежението на клемите и мощността на лампата."
            steps={['$I = \\frac{12}{5{,}5 + 0{,}5} = 2\\ \\mathrm{A}$', '$U = 12 - 2 \\cdot 0{,}5 = 11\\ \\mathrm{V}$', '$P = UI = 22\\ \\mathrm{W}$, а $I^2r = 2\\ \\mathrm{W}$ загрява самия акумулатор.']}
          />
          <p className={text}>
            Мощността в товара <Tex>{'P = \\frac{\\mathcal{E}^2 R}{(R + r)^2}'}</Tex> е най-голяма при <Tex>{'R = r'}</Tex> и тогава е{' '}
            <Tex>{'\\frac{\\mathcal{E}^2}{4r}'}</Tex>. Но точно тогава половината енергия се губи в източника – <Term id="efficiency">КПД</Term> е 50%. Затова в
            електроцентралите се стремят към <Tex>{'R \\gg r'}</Tex>.
          </p>
          <BatteryLab />
          <p className={text}>
            Как се трупа заряд и енергия в електричното поле, ще видим в урока{' '}
            <Link to="/physics/electricity/capacitors" className={link}>
              Кондензатори
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
          <h2 className={h2}>8. Токът около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Успоредно свързване', '$R = R_1 + R_2$ и при успоредно', '$\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$ – общото е по-малко от всяко'],
              ['„Изразходва се ток“', 'лампата изразходва тока и след нея той е по-малък', 'токът е еднакъв преди и след лампата; изразходва се енергия'],
              ['Амперметър успоредно', 'амперметърът се включва успоредно на лампата', 'последователно – иначе почти целият ток минава през него'],
              ['Сечение в mm²', '$R = \\rho\\frac{l}{S}$ със $S = 1{,}5$', 'първо $S = 1{,}5 \\cdot 10^{-6}\\ \\mathrm{m^2}$'],
              ['kW и kWh', 'каната „харчи“ 2 kW на час', 'kW е мощност; енергията е $\\mathrm{kWh} = \\mathrm{kW} \\cdot \\mathrm{h}$'],
              ['ЕДН и напрежение', 'на клемите винаги има $\\mathcal{E}$', '$U = \\mathcal{E} - Ir$ – при голям ток напрежението пада'],
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
              <Task id="a1" number={1} color="border-green-500" question="Меден проводник ($\rho = 1{,}7 \cdot 10^{-8}\ \Omega \cdot \mathrm{m}$) е дълъг 50 m и има сечение 2,5 mm². Какво е съпротивлението му?" check={[0.34]} ask={['$R$, Ω']}>
                <p><Tex>{'S = 2{,}5 \\cdot 10^{-6}\\ \\mathrm{m^2}'}</Tex></p>
                <p><Tex>{'R = \\rho\\frac{l}{S} = 1{,}7 \\cdot 10^{-8} \\cdot \\frac{50}{2{,}5 \\cdot 10^{-6}} = 0{,}34\\ \\Omega'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Резистори 6 Ω и 12 Ω са свързани последователно към 9 V. Какъв е токът? А какво би било общото им съпротивление, ако ги свържем успоредно?" check={[0.5, 4]} ask={['ток при последователно, A', 'съпротивление при успоредно, Ω']}>
                <p>Последователно: <Tex>{'R = 18\\ \\Omega'}</Tex>, <Tex>{'I = \\frac{9}{18} = 0{,}5\\ \\mathrm{A}'}</Tex>.</p>
                <p>Успоредно: <Tex>{'R = \\frac{6 \\cdot 12}{6 + 12} = 4\\ \\Omega'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="На крушка пише 230 V, 60 W. Какъв ток тече през нея и какво е съпротивлението ѝ в работен режим?" check={[0.261, 882]} ask={['ток, A', 'съпротивление, Ω']}>
                <p><Tex>{'I = \\frac{P}{U} = \\frac{60}{230} \\approx 0{,}261\\ \\mathrm{A}'}</Tex></p>
                <p><Tex>{'R = \\frac{U^2}{P} = \\frac{230^2}{60} \\approx 882\\ \\Omega'}</Tex> – когато е изстинала, съпротивлението ѝ е много по-малко.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Батерия с ЕДН 4,5 V и вътрешно съпротивление 0,5 Ω е свързана с резистор 4 Ω. Намерете тока, напрежението на клемите и тока при късо съединение." check={[1, 4, 9]} ask={['ток, A', 'напрежение на клемите, V', 'ток на късо съединение, A']}>
                <p><Tex>{'I = \\frac{\\mathcal{E}}{R + r} = \\frac{4{,}5}{4{,}5} = 1\\ \\mathrm{A}'}</Tex></p>
                <p><Tex>{'U = \\mathcal{E} - Ir = 4{,}5 - 0{,}5 = 4\\ \\mathrm{V}'}</Tex></p>
                <p><Tex>{'I_{\\text{к.с.}} = \\frac{\\mathcal{E}}{r} = \\frac{4{,}5}{0{,}5} = 9\\ \\mathrm{A}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Две батерии $\mathcal{E}_1 = 12\ \mathrm{V}$ (с $R_1 = 2\ \Omega$ в клона си) и $\mathcal{E}_2 = 6\ \mathrm{V}$ (с $R_2 = 4\ \Omega$) са свързани с плюсовете към един възел и захранват общ резистор $R_3 = 4\ \Omega$. Намерете $I_1$, $I_2$ и $I_3$ (положителни – към общия възел през батериите, $I_3$ – през $R_3$)." check={[2.25, -0.375, 1.875]} ask={['$I_1$, A', '$I_2$, A', '$I_3$, A']}>
                <p>Възел: <Tex>{'I_3 = I_1 + I_2'}</Tex>. Контури: <Tex>{'12 = 2I_1 + 4I_3'}</Tex> и <Tex>{'6 = 4I_2 + 4I_3'}</Tex>.</p>
                <p><Tex>{'I_1 = 6 - 2I_3'}</Tex>, <Tex>{'I_2 = 1{,}5 - I_3'}</Tex>, значи <Tex>{'I_3 = 7{,}5 - 3I_3 \\Rightarrow I_3 = 1{,}875\\ \\mathrm{A}'}</Tex>.</p>
                <p><Tex>{'I_1 = 2{,}25\\ \\mathrm{A}'}</Tex>, <Tex>{'I_2 = -0{,}375\\ \\mathrm{A}'}</Tex>.</p>
                <p>Минусът значи, че през втората батерия токът тече обратно – по-силната батерия я „зарежда“.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Крушки 230 V / 100 W и 230 V / 25 W са свързани последователно към 230 V. Каква мощност отделя всяка? (Приемете, че съпротивленията не се менят.)" check={[4, 16]} ask={['$P$ на 100-ватовата, W', '$P$ на 25-ватовата, W']}>
                <p><Tex>{'R_{100} = \\frac{230^2}{100} = 529\\ \\Omega'}</Tex>, <Tex>{'R_{25} = \\frac{230^2}{25} = 2116\\ \\Omega'}</Tex></p>
                <p><Tex>{'I = \\frac{230}{529 + 2116} \\approx 0{,}0870\\ \\mathrm{A}'}</Tex></p>
                <p><Tex>{'P_{100} = I^2 \\cdot 529 \\approx 4\\ \\mathrm{W}'}</Tex>, <Tex>{'P_{25} = I^2 \\cdot 2116 \\approx 16\\ \\mathrm{W}'}</Tex> – по-слабата крушка свети по-силно!</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Източник с $\mathcal{E} = 12\ \mathrm{V}$ и $r = 2\ \Omega$ захранва резистор $R$. Колко е най-голямата мощност, която може да получи резисторът? При кои две стойности на $R$ мощността е 16 W?" check={[18, 1, 4]} ask={['$P_{\\max}$, W', 'по-малкото $R$, Ω', 'по-голямото $R$, Ω']}>
                <p><Tex>{'P = \\frac{\\mathcal{E}^2 R}{(R + r)^2}'}</Tex> е най-голяма при <Tex>{'R = r = 2\\ \\Omega'}</Tex>: <Tex>{'P_{\\max} = \\frac{144}{8} = 18\\ \\mathrm{W}'}</Tex>.</p>
                <p><Tex>{'16(R + 2)^2 = 144R \\Rightarrow (R + 2)^2 = 9R \\Rightarrow R^2 - 5R + 4 = 0'}</Tex></p>
                <p><Tex>{'R = 1\\ \\Omega'}</Tex> или <Tex>{'R = 4\\ \\Omega'}</Tex> – произведението им е <Tex>{'r^2 = 4'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Безкрайна „стълба“ е изградена от резистори по 1 Ω: всяко стъпало е един резистор надлъжно и един напречно. Колко е съпротивлението между входните клеми?" check={[1.62]} ask={['$R$, Ω']}>
                <p>Ако отрежем първото стъпало, остава същата безкрайна стълба със съпротивление <Tex>{'R'}</Tex>.</p>
                <p>Значи <Tex>{'R = 1 + \\frac{1 \\cdot R}{1 + R}'}</Tex>, т.е. <Tex>{'R^2 - R - 1 = 0'}</Tex>.</p>
                <p><Tex>{'R = \\frac{1 + \\sqrt{5}}{2} \\approx 1{,}62\\ \\Omega'}</Tex> – златното сечение!</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Ръбовете на куб са резистори по 6 Ω. Колко е съпротивлението между два срещуположни върха на куба?" check={[5]} ask={['$R$, Ω']}>
                <p>От симетрия трите върха, съседни на входа, са с еднакъв потенциал; същото важи за трите върха, съседни на изхода. Можем да ги съединим.</p>
                <p>Получаваме три последователни групи: 3 резистора успоредно (<Tex>{'\\frac{R}{3}'}</Tex>), 6 успоредно (<Tex>{'\\frac{R}{6}'}</Tex>) и пак 3 успоредно (<Tex>{'\\frac{R}{3}'}</Tex>).</p>
                <p><Tex>{'R_{\\text{общо}} = \\frac{R}{3} + \\frac{R}{6} + \\frac{R}{3} = \\frac{5R}{6} = 5\\ \\Omega'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'I = \\frac{q}{t}'}</Tex>; условната посока на тока е от + към − по външната верига</li>
              <li>✓ Закон на Ом: <Tex>{'I = \\frac{U}{R}'}</Tex>; <Tex>{'R = \\rho\\frac{l}{S}'}</Tex></li>
              <li>✓ Последователно: <Tex>{'R = R_1 + R_2'}</Tex>, общ ток; успоредно: <Tex>{'\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}'}</Tex>, общо напрежение</li>
              <li>✓ Кирхоф: токовете във възел се запазват; по контур сумата от ЕДН е равна на сумата от <Tex>{'IR'}</Tex></li>
              <li>✓ <Tex>{'P = UI = I^2R = \\frac{U^2}{R}'}</Tex>; <Tex>{'1\\ \\mathrm{kWh} = 3{,}6\\ \\mathrm{MJ}'}</Tex></li>
              <li>✓ <Tex>{'I = \\frac{\\mathcal{E}}{R + r}'}</Tex>, <Tex>{'U = \\mathcal{E} - Ir'}</Tex>; най-голяма мощност в товара при <Tex>{'R = r'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 1911 г. в Лайден Хайке Камерлинг Онес охлажда живак с течен хелий и открива, че около 4,2 K съпротивлението му изведнъж
              изчезва – явлението <strong>свръхпроводимост</strong>. В свръхпроводящ пръстен токът може да тече години наред без батерия. Днес
              свръхпроводящи <Term id="solenoid">бобини</Term> създават силните <Term id="magnetic-field">магнитни полета</Term> в болничните ЯМР апарати и в ускорителите на частици.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
