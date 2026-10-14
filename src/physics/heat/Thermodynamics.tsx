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
import HeatEngineLab from './HeatEngineLab';
import HeatPumpLab from './HeatPumpLab';
import PVCycleLab from './PVCycleLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 12.5 → 12{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [Q, W] = [randInt(1, 9) * 100, randInt(1, 10) * 50];
    return {
      tex: `Q = ${Q}\\ \\mathrm{J}, \\quad W = ${W}\\ \\mathrm{J}`,
      ask: 'Газът получава топлина и се разширява. $\\Delta U = ?\\ \\mathrm{J}$',
      num: Q - W,
      den: 1,
      steps: [`Първи принцип: $Q = \\Delta U + W$, т.е. $\\Delta U = Q - W$`, `$\\Delta U = ${Q} - ${W} = ${Q - W}\\ \\mathrm{J}$`],
    };
  }
  if (kind === 1) {
    const [A, q] = [randInt(2, 8) * 50, randInt(1, 6) * 50];
    return {
      tex: `Q = -${q}\\ \\mathrm{J}, \\quad W = -${A}\\ \\mathrm{J}`,
      ask: 'Газът е свит и отдава топлина. $\\Delta U = ?\\ \\mathrm{J}$',
      num: A - q,
      den: 1,
      steps: [
        `При свиване газът извършва отрицателна работа: $W = -${A}\\ \\mathrm{J}$; отдадената топлина също е със знак минус.`,
        `$\\Delta U = Q - W = -${q} - (-${A}) = ${A - q}\\ \\mathrm{J}$`,
      ],
    };
  }
  if (kind === 2) {
    const [p, V] = [pick([1, 2, 3, 5]), pick([2, 4, 5, 10])];
    return {
      tex: `p = ${p} \\cdot 10^5\\ \\mathrm{Pa}, \\quad \\Delta V = ${V}\\ \\mathrm{L}`,
      ask: 'Изобарно разширение. $W = ?\\ \\mathrm{J}$',
      num: 100 * p * V,
      den: 1,
      steps: [`$\\Delta V = ${V}\\ \\mathrm{L} = ${V} \\cdot 10^{-3}\\ \\mathrm{m^3}$`, `$W = p\\Delta V = ${p} \\cdot 10^5 \\cdot ${V} \\cdot 10^{-3} = ${100 * p * V}\\ \\mathrm{J}$`],
    };
  }
  if (kind === 3) {
    const [T1, T2] = pick([
      [400, 300],
      [500, 300],
      [600, 300],
      [800, 400],
      [1000, 300],
      [500, 400],
      [600, 450],
    ]);
    const eta = Math.round((1 - T2 / T1) * 100);
    return {
      tex: `t_1 = ${T1 - 273}\\ ^{\\circ}\\mathrm{C}, \\quad t_2 = ${T2 - 273}\\ ^{\\circ}\\mathrm{C}`,
      ask: 'Двигател на Карно. $\\eta_{\\max} = ?\\ \\%$',
      num: eta,
      den: 1,
      steps: [`В келвини: $T_1 = ${T1}\\ \\mathrm{K}$, $T_2 = ${T2}\\ \\mathrm{K}$`, `$\\eta_{\\max} = 1 - \\frac{T_2}{T_1} = 1 - \\frac{${T2}}{${T1}} = ${dec(eta / 100)} = ${eta}\\%$`],
    };
  }
  if (kind === 4) {
    const [Q1, eta] = [pick([1000, 2000, 4000]), pick([20, 25, 30, 40, 50])];
    const W = (Q1 * eta) / 100;
    return {
      tex: `W = ${W}\\ \\mathrm{J}, \\quad Q_2 = ${Q1 - W}\\ \\mathrm{J}`,
      ask: 'Топлинен двигател. $\\eta = ?\\ \\%$',
      num: eta,
      den: 1,
      steps: [`Получената топлина е $Q_1 = W + Q_2 = ${Q1}\\ \\mathrm{J}$`, `$\\eta = \\frac{W}{Q_1} = \\frac{${W}}{${Q1}} = ${dec(eta / 100)} = ${eta}\\%$`],
    };
  }
  if (kind === 5) {
    const t2 = pick([-3, 7, 12, 17]);
    const T2 = t2 + 273;
    return {
      tex: `t_1 = 27\\ ^{\\circ}\\mathrm{C}, \\quad t_2 = ${t2}\\ ^{\\circ}\\mathrm{C}`,
      ask: 'Идеална термопомпа. $\\mathrm{COP} = ?$',
      num: 300,
      den: 300 - T2,
      steps: [`$T_1 = 300\\ \\mathrm{K}$, $T_2 = ${T2}\\ \\mathrm{K}$`, `$\\mathrm{COP} = \\frac{T_1}{T_1 - T_2} = \\frac{300}{${300 - T2}} = ${300 / (300 - T2)}$`],
    };
  }
  const [n, dT] = [pick([1, 2, 4]), pick([10, 20, 100])];
  return {
    tex: `n = ${n}\\ \\mathrm{mol}, \\quad \\Delta T = ${dT}\\ \\mathrm{K}, \\quad R = 8{,}31`,
    ask: 'Едноатомен газ. $\\Delta U = ?\\ \\mathrm{J}$',
    num: 3 * 831 * n * dT,
    den: 200,
    steps: [`$\\Delta U = \\frac{3}{2}nR\\Delta T = 1{,}5 \\cdot ${n} \\cdot 8{,}31 \\cdot ${dT}$`, `$= ${dec((3 * 831 * n * dT) / 200)}\\ \\mathrm{J}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🚲 Помпа за велосипед',
    problem:
      'При едно бързо натискане правиш 60 J работа върху въздуха в помпата, а топлообменът със стените е пренебрежим. С колко се увеличава вътрешната енергия на въздуха? С колко градуса се затопля, ако в помпата има 0,02 mol въздух ($U = \\frac{5}{2}nRT$ за двуатомен газ, $R = 8{,}31$)?',
    solution: [
      'Процесът е почти адиабатен: $Q = 0$, а работата на газа е $W = -60\\ \\mathrm{J}$.',
      '$\\Delta U = Q - W = 60\\ \\mathrm{J}$',
      '$\\Delta T = \\frac{\\Delta U}{\\frac{5}{2}nR} = \\frac{60}{2{,}5 \\cdot 0{,}02 \\cdot 8{,}31} \\approx 144\\ \\mathrm{K}$ – в действителност по-малко, защото част от топлината отива в стените. Но помпата наистина се затопля!',
    ],
    answer: '$60\\ \\mathrm{J}$ и около $144\\ \\mathrm{K}$',
    check: [60, 144],
    ask: ['ΔU, J', 'ΔT, K'],
  },
  {
    title: '🚗 Мощност на двигателя',
    problem:
      'Кола харчи 6 L бензин на 100 km при скорост 90 km/h. При изгарянето на 1 L бензин се отделят около 32 MJ, а КПД на двигателя е 30%. Каква механична мощност развива двигателят?',
    solution: [
      '100 km при 90 km/h се изминават за $\\frac{100}{90} \\approx 1{,}11\\ \\mathrm{h}$, значи разходът е $6 : 1{,}11 = 5{,}4$ L на час.',
      'Топлина за час: $5{,}4 \\cdot 32 = 172{,}8\\ \\mathrm{MJ}$, т.е. $\\frac{172{,}8 \\cdot 10^6}{3600} = 48\\ \\mathrm{kW}$.',
      'Механична мощност: $0{,}30 \\cdot 48 = 14{,}4\\ \\mathrm{kW}$. Останалите 33,6 kW отиват в радиатора и ауспуха.',
    ],
    answer: '$14{,}4\\ \\mathrm{kW}$',
    check: [14.4],
    ask: ['мощност, kW'],
  },
  {
    title: '🏭 Електроцентрала',
    problem: 'Топлоелектрическа централа дава 1000 MW електрическа мощност при КПД 40%. Колко топлина за секунда отдава на околната среда (на охладителните кули или на реката)?',
    solution: ['$Q_1 = \\frac{P}{\\eta} = \\frac{1000}{0{,}40} = 2500\\ \\mathrm{MW}$', '$Q_2 = Q_1 - P = 2500 - 1000 = 1500\\ \\mathrm{MW}$ – повече, отколкото централата дава като ток.'],
    answer: '$1500\\ \\mathrm{MW}$',
    check: [1500],
    ask: ['мощност, MW'],
  },
  {
    title: '🏠 Термопомпа или печка',
    problem:
      'Къща има нужда от 10 kW топлина в продължение на 10 часа. Колко струва токът за това с термопомпа с COP = 4 и с електрическа печка, ако 1 kWh струва 0,25 €?',
    solution: ['Нужна топлина: $10\\ \\mathrm{kW} \\cdot 10\\ \\mathrm{h} = 100\\ \\mathrm{kWh}$.', 'Термопомпа: $\\frac{100}{4} = 25\\ \\mathrm{kWh}$, т.е. $25 \\cdot 0{,}25 = 6{,}25$ €.', 'Печка (COP = 1): $100\\ \\mathrm{kWh} \\cdot 0{,}25 = 25$ € – четири пъти повече.'],
    answer: '6,25 € и 25 €',
    check: [6.25, 25],
    ask: ['термопомпа, €', 'печка, €'],
  },
  {
    title: '🧊 Хладилник',
    problem: 'За всеки 100 J електрическа работа хладилникът изнася 300 J топлина от камерата. Колко топлина отдава в кухнята? Колко е хладилният му коефициент $\\frac{Q_2}{W}$?',
    solution: ['$Q_1 = Q_2 + W = 300 + 100 = 400\\ \\mathrm{J}$ – кухнята се затопля!', '$\\frac{Q_2}{W} = \\frac{300}{100} = 3$'],
    answer: '400 J и 3',
    check: [400, 3],
    ask: ['топлина, J', 'коефициент'],
  },
  {
    title: '❄️ Ентропия на разтопен лед',
    problem: '1 kg лед се топи при 0 °C. Специфичната топлина на топене е 334 kJ/kg. С колко се увеличава ентропията му?',
    solution: ['$Q = \\lambda m = 334\\,000\\ \\mathrm{J}$, а температурата е постоянна: $T = 273\\ \\mathrm{K}$.', '$\\Delta S = \\frac{Q}{T} = \\frac{334\\,000}{273} \\approx 1220\\ \\mathrm{J/K}$'],
    answer: '$\\approx 1220\\ \\mathrm{J/K}$',
    check: [1220],
    ask: ['ΔS, J/K'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой е първият принцип на термодинамиката ($W$ – работата, извършена от газа)?',
    answers: ['$Q = \\Delta U + W$', '$Q = \\Delta U - W$', '$Q = W$', '$\\Delta U = Q + W$'],
    correctAnswer: '$Q = \\Delta U + W$',
  },
  {
    question: 'Какво е вярно при изотермен процес с идеален газ?',
    answers: ['$\\Delta U = 0$', '$Q = 0$', '$W = 0$', '$p = \\text{const}$'],
    correctAnswer: '$\\Delta U = 0$',
  },
  {
    question: 'Какво е вярно при адиабатен процес?',
    answers: ['$Q = 0$', '$\\Delta U = 0$', '$W = 0$', '$T = \\text{const}$'],
    correctAnswer: '$Q = 0$',
  },
  {
    question: 'Как се намира работата на газа от p–V диаграмата?',
    answers: ['като лице под кривата на процеса', 'като наклон на кривата', 'като произведение на крайните p и V', 'като дължина на кривата'],
    correctAnswer: 'като лице под кривата на процеса',
  },
  {
    question: 'Двигател на Карно работи между 400 K и 300 K. Какъв е КПД му?',
    answers: ['$25\\%$', '$75\\%$', '$33\\%$', '$100\\%$'],
    correctAnswer: '$25\\%$',
  },
  {
    question: 'Защо нито един топлинен двигател не може да има КПД 100%?',
    answers: [
      'част от топлината трябва да се отдаде на по-студено тяло',
      'винаги има триене',
      'енергията изчезва при работа',
      'газът не може да се разширява',
    ],
    correctAnswer: 'част от топлината трябва да се отдаде на по-студено тяло',
  },
  {
    question: 'Термопомпа има COP = 4. Колко топлина влиза в къщата от 1 kWh ток?',
    answers: ['$4\\ \\mathrm{kWh}$', '$1\\ \\mathrm{kWh}$', '$0{,}25\\ \\mathrm{kWh}$', '$3\\ \\mathrm{kWh}$'],
    correctAnswer: '$4\\ \\mathrm{kWh}$',
  },
  {
    question: 'На колко е равна вътрешната енергия на едноатомен идеален газ?',
    answers: ['$\\frac{3}{2}nRT$', '$nRT$', '$\\frac{5}{2}nRT$', '$\\frac{1}{2}nRT$'],
    correctAnswer: '$\\frac{3}{2}nRT$',
  },
  {
    question: 'Какво става с ентропията на изолирана система?',
    answers: ['не намалява', 'винаги намалява', 'остава точно същата', 'става нула'],
    correctAnswer: 'не намалява',
  },
];

// ---------- Страница ----------

const PROCESSES: [string, string, string, string, string][] = [
  ['изохорен', 'V = const', '0', '\\frac{3}{2}nR\\Delta T', 'Q = \\Delta U'],
  ['изобарен', 'p = const', 'p\\Delta V', '\\frac{3}{2}nR\\Delta T', 'Q = \\frac{5}{2}nR\\Delta T'],
  ['изотермен', 'T = const', 'nRT\\ln\\frac{V_2}{V_1}', '0', 'Q = W'],
  ['адиабатен', 'pV^{\\gamma} = const', '-\\Delta U', '\\frac{3}{2}nR\\Delta T', 'Q = 0'],
];

export function Thermodynamics() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Термодинамика</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔥 През 1824 г. млад френски инженер, Сади Карно, издава малка книжка, „Размишления върху движещата сила на огъня“. Парните машини
            вече движат фабрики, но никой не знае колко работа може да се получи от едно количество въглища. Карно разбира нещо дълбоко:
            работа се получава само когато топлината „пада“ от горещо към студено тяло – като вода, която върти воденично колело. Книжката
            остава почти незабелязана, а Карно умира от холера през 1832 г., едва на 36 години. Десетилетия по-късно Клаузиус и Келвин градят
            върху идеите му <strong>втория принцип на термодинамиката</strong> – закона, който казва защо времето тече само напред.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Вътрешна енергия и работа на газа</h2>
          <p className={text}>
            Молекулите на газа се движат хаотично (виж{' '}
            <Link to="/physics/heat/ideal-gas" className={link}>
              Идеален газ
            </Link>
            ). Сборът от техните енергии е <strong>вътрешната енергия</strong> <Tex>{'U'}</Tex>. При <Term id="ideal-gas">идеален газ</Term> молекулите не си
            взаимодействат, така че <Tex>{'U'}</Tex> зависи само от температурата.
          </p>
          <Theorem
            type="definition"
            title="Вътрешна енергия на идеален газ"
            description="За едноатомен газ (хелий, неон, аргон) $U = \frac{3}{2}nRT = \frac{3}{2}pV$. За двуатомен газ (въздух) при стайна температура $U \approx \frac{5}{2}nRT$ – молекулите се и въртят. Изменението $\Delta U$ зависи само от началната и крайната температура, а не от пътя."
          />
          <Theorem
            title="Работа на газа"
            description="Когато газът се разширява с $\Delta V$ при постоянно налягане $p$, той бута буталото и извършва работа $W = p\Delta V$. В общия случай работата е лицето под кривата на процеса в p–V диаграмата. При разширение $W > 0$, при свиване $W < 0$ – тогава работа се извършва ВЪРХУ газа."
          />
          <p className={text}>
            Лицето под кривата е <Term id="definite-integral">интеграл</Term>: <Tex>{'W = \\int_{V_1}^{V_2} p\\,dV'}</Tex> (виж{' '}
            <Link to="/analysis/integrals" className={link}>
              Интеграли
            </Link>
            ). Точно както пътят е лицето под графиката на скоростта.
          </p>
          <Example
            description="2 mol хелий се затоплят от 300 K до 400 K. С колко се променя вътрешната им енергия?"
            steps={['$\\Delta U = \\frac{3}{2}nR\\Delta T = 1{,}5 \\cdot 2 \\cdot 8{,}31 \\cdot 100 \\approx 2490\\ \\mathrm{J}$']}
          />
          <Example
            description="Газ с налягане $2 \cdot 10^5\ \mathrm{Pa}$ се разширява изобарно от 3 L до 8 L. Каква работа извършва?"
            steps={['$\\Delta V = 5\\ \\mathrm{L} = 5 \\cdot 10^{-3}\\ \\mathrm{m^3}$', '$W = p\\Delta V = 2 \\cdot 10^5 \\cdot 5 \\cdot 10^{-3} = 1000\\ \\mathrm{J}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Първи принцип на термодинамиката</h2>
          <p className={text}>
            Вътрешната енергия на газа може да се промени по два начина: чрез <strong>топлина</strong> (енергия, която минава сама от по-топлото
            към по-студеното тяло – виж{' '}
            <Link to="/physics/heat/temperature" className={link}>
              Температура и топлина
            </Link>
            ) и чрез <strong>работа</strong>. Това е <Term id="energy-conservation">законът за запазване на енергията</Term> (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ), разширен за топлината.
          </p>
          <Theorem
            title="Първи принцип"
            description="$Q = \Delta U + W$: топлината, получена от газа, отива за увеличаване на вътрешната му енергия и за работата, която газът извършва. Знаци: $Q > 0$ – газът получава топлина, $Q < 0$ – отдава; $W > 0$ – газът се разширява и извършва работа, $W < 0$ – газът е свит, работа се извършва върху него."
          />
          <Example
            description="Газ получава 500 J топлина и извършва 200 J работа. С колко се променя вътрешната му енергия?"
            steps={['$\\Delta U = Q - W = 500 - 200 = 300\\ \\mathrm{J}$ – газът се затопля.']}
          />
          <Example
            description="Газ е свит, като върху него е извършена работа 400 J, а през това време той отдава 150 J топлина. Как се променя $U$?"
            steps={['$W = -400\\ \\mathrm{J}$ (работа върху газа), $Q = -150\\ \\mathrm{J}$ (отдадена топлина)', '$\\Delta U = Q - W = -150 + 400 = 250\\ \\mathrm{J}$ – газът се затопля, въпреки че отдава топлина.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Процеси в идеален газ</h2>
          <p className={text}>
            В задачите обикновено една от величините се пази постоянна. Ето как изглежда първият принцип за едноатомен газ във всеки от
            четирите основни процеса:
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Процес</th>
                  <th className={th}>Условие</th>
                  <th className={th}>
                    <Tex>{'W'}</Tex>
                  </th>
                  <th className={th}>
                    <Tex>{'\\Delta U'}</Tex>
                  </th>
                  <th className={th}>Топлина</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSES.map(([name, cond, W, dU, Q]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{cond.replace('const', '\\text{const}')}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{W}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{dU}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{Q}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="1 mol газ при 300 K се разширява изотермно до двойно по-голям обем. Колко топлина получава?"
            steps={['$\\Delta U = 0$, значи $Q = W = nRT\\ln\\frac{V_2}{V_1}$', '$Q = 1 \\cdot 8{,}31 \\cdot 300 \\cdot \\ln 2 \\approx 1730\\ \\mathrm{J}$ – цялата топлина става работа, но само докато газът се разширява.']}
          />
          <p className={text}>
            При <strong>адиабатен</strong> процес няма топлообмен – той е толкова бърз или газът е толкова добре изолиран, че топлината не
            успява да мине. Тогава <Tex>{'pV^{\\gamma} = \\text{const}'}</Tex>, където <Tex>{'\\gamma = \\frac{5}{3}'}</Tex> за едноатомен газ и{' '}
            <Tex>{'\\gamma \\approx 1{,}4'}</Tex> за въздух, а за температурата <Tex>{'TV^{\\gamma - 1} = \\text{const}'}</Tex>. При свиване газът се
            затопля – затова помпата за колело става топла.
          </p>
          <Example
            description="В дизелов двигател въздух с температура 27 °C се свива бързо 20 пъти ($\gamma = 1{,}4$). До каква температура се нагрява?"
            steps={[
              '$T_2 = T_1\\left(\\frac{V_1}{V_2}\\right)^{\\gamma - 1} = 300 \\cdot 20^{0{,}4}$',
              '$20^{0{,}4} \\approx 3{,}31$, значи $T_2 \\approx 994\\ \\mathrm{K} \\approx 721\\ ^{\\circ}\\mathrm{C}$',
              'Това е много над температурата, при която дизеловото гориво се самозапалва – затова дизеловите двигатели нямат запалителни свещи.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Топлинни двигатели и цикълът на Карно</h2>
          <p className={text}>
            Двигателят трябва да работи многократно, затова газът минава през <strong>кръгов процес</strong> (цикъл) и се връща в началното си
            състояние. За цял цикъл <Tex>{'\\Delta U = 0'}</Tex>, а полезната работа е лицето, оградено от цикъла в p–V диаграмата.
          </p>
          <Theorem
            title="Топлинен двигател"
            description="Двигателят получава топлина $Q_1$ от нагревател (горивото, парата), извършва работа $W$ и отдава топлина $Q_2$ на хладилник (околния въздух, реката): $Q_1 = W + Q_2$. Коефициентът на полезно действие е $\eta = \frac{W}{Q_1} = 1 - \frac{Q_2}{Q_1}$."
          />
          <PVCycleLab />
          <Theorem
            title="Теорема на Карно"
            description="Никой двигател, работещ между нагревател с температура $T_1$ и хладилник с температура $T_2$, не може да има по-голям КПД от $\eta_{\max} = 1 - \frac{T_2}{T_1}$. Температурите са в келвини! Тази граница се постига само от идеалния цикъл на Карно (две изотерми и две адиабати), извършван безкрайно бавно."
          />
          <Example
            description="Парата в ТЕЦ влиза в турбината при 550 °C, а кондензаторът е при 30 °C. Какъв е най-големият възможен КПД?"
            steps={['$T_1 = 823\\ \\mathrm{K}$, $T_2 = 303\\ \\mathrm{K}$', '$\\eta_{\\max} = 1 - \\frac{303}{823} \\approx 0{,}632 = 63{,}2\\%$', 'Истинските централи постигат обикновено около 35–45% – има триене, загуби на топлина и процесите не са безкрайно бавни.']}
          />
          <HeatEngineLab />
          <p className={text}>
            Автомобилните двигатели превръщат в работа приблизително 25–35% от енергията на горивото, а най-добрите централи с газова и парна
            турбина (комбиниран цикъл) – около 60%. Затова печелим, ако повишим температурата на нагревателя или използваме „отпадната“ топлина
            за отопление.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Хладилници и термопомпи</h2>
          <p className={text}>
            Топлината сама тече само от топло към студено. За да я накараме да тече обратно, трябва да извършим работа – това правят
            хладилникът, климатикът и термопомпата. Те са топлинен двигател, пуснат наобратно.
          </p>
          <Theorem
            title="Хладилник и термопомпа"
            description="С работа $W$ машината взема топлина $Q_2$ от студеното тяло и отдава $Q_1 = Q_2 + W$ на топлото. За термопомпа ни интересува топлината навътре: $\mathrm{COP} = \frac{Q_1}{W} \le \frac{T_1}{T_1 - T_2}$. За хладилник – изнесената топлина: $\frac{Q_2}{W} \le \frac{T_2}{T_1 - T_2}$."
          />
          <Example
            description="Колко е най-големият възможен COP на термопомпа, която топли стая до 21 °C, когато навън е 0 °C?"
            steps={['$T_1 = 294\\ \\mathrm{K}$, $T_2 = 273\\ \\mathrm{K}$', '$\\mathrm{COP}_{\\max} = \\frac{294}{294 - 273} = \\frac{294}{21} = 14$', 'Истинските термопомпи постигат около 3–4: от 1 kWh ток в къщата влизат 3–4 kWh топлина.']}
          />
          <HeatPumpLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Втори принцип и ентропия</h2>
          <Theorem
            title="Втори принцип на термодинамиката"
            description="Клаузиус: топлината не може сама (без работа) да премине от по-студено към по-топло тяло. Келвин: невъзможно е машина с един-единствен топлинен резервоар да превръща цялата получена топлина в работа. Двете формулировки са еквивалентни – ако едната бъде нарушена, и другата ще бъде."
          />
          <p className={text}>
            <strong>Перпетуум мобиле от първи род</strong> – машина, която дава работа от нищо – нарушава първия принцип. <strong>От втори род</strong>{' '}
            – която например кара кораб само с топлината на океана, като го охлажда – не нарушава запазването на енергията, но е забранена от
            втория принцип.
          </p>
          <Theorem
            type="definition"
            title="Ентропия"
            description="Когато тяло получи топлина $Q$ при температура $T$, ентропията му нараства с $\Delta S = \frac{Q}{T}$ (единица J/K). Ентропията е мярка за безпорядъка – за броя на начините, по които могат да са подредени молекулите. Ентропията на изолирана система не намалява."
          />
          <p className={text}>
            Затова счупената чаша не се сглобява сама, а капка мастило се разтваря във водата, но никога не се събира обратно. Растежът на
            ентропията задава <strong>посоката на времето</strong>: физичните закони за отделните молекули работят и напред, и назад, но
            милиардите молекули почти винаги отиват към по-безпорядъчни състояния.
          </p>
          <Example
            description="1 J топлина минава от тяло с 400 K към тяло с 300 K. Как се променя общата ентропия?"
            steps={['Топлото тяло губи $\\frac{1}{400} = 0{,}0025\\ \\mathrm{J/K}$, а студеното печели $\\frac{1}{300} \\approx 0{,}0033\\ \\mathrm{J/K}$.', 'Общо $\\Delta S \\approx +0{,}0008\\ \\mathrm{J/K} > 0$ – затова топлината тече само от топло към студено.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 12,5, а <Term id="efficiency">КПД</Term> – в проценти (без знака %).</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Термодинамиката около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Градуси вместо келвини', '$\\eta = 1 - \\frac{27}{327} \\approx 92\\%$', '$\\eta = 1 - \\frac{300}{600} = 50\\%$ – само в келвини'],
              ['Знакът на работата', 'при свиване $W > 0$', '$W$ е работата НА газа: при свиване $W < 0$'],
              ['„Тялото съдържа топлина“', 'горещият чай има много топлина', 'има голяма вътрешна енергия; топлината е пренесената енергия'],
              ['Изотермен значи без топлина', 'изотермен процес: $Q = 0$', '$\\Delta U = 0$, а $Q = W$; без топлина е адиабатният'],
              ['COP > 1 е невъзможен', 'термопомпа с COP = 4 нарушава запазването на енергията', 'тя пренася топлина отвън: $Q_1 = Q_2 + W$'],
              ['Отворен хладилник', 'отвореният хладилник охлажда кухнята', 'загрява я: отдава $Q_1 = Q_2 + W$ – повече, отколкото изнася'],
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
              <Task id="a1" number={1} color="border-green-500" question="Газ получава 800 J топлина и извършва 300 J работа. С колко се променя вътрешната му енергия?" check={[500]} ask={['$\\Delta U$, J']}>
                <p><Tex>{'\\Delta U = Q - W = 800 - 300 = 500\\ \\mathrm{J}'}</Tex></p>
                <p>Вътрешната енергия расте, значи газът се затопля.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Газ при постоянно налягане $1{,}5 \cdot 10^5\ \mathrm{Pa}$ се разширява от 2 L до 6 L. Каква работа извършва?" check={[600]} ask={['$W$, J']}>
                <p><Tex>{'\\Delta V = 4\\ \\mathrm{L} = 4 \\cdot 10^{-3}\\ \\mathrm{m^3}'}</Tex></p>
                <p><Tex>{'W = p\\Delta V = 1{,}5 \\cdot 10^5 \\cdot 4 \\cdot 10^{-3} = 600\\ \\mathrm{J}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Какъв е най-големият възможен КПД на двигател, който работи между 327 °C и 27 °C?" check={[50]} ask={['$\\eta$, %']}>
                <p>В келвини: <Tex>{'T_1 = 600\\ \\mathrm{K}'}</Tex>, <Tex>{'T_2 = 300\\ \\mathrm{K}'}</Tex>.</p>
                <p><Tex>{'\\eta_{\\max} = 1 - \\frac{300}{600} = 0{,}5 = 50\\%'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="2 mol едноатомен газ се нагряват изобарно с 50 K ($R = 8{,}31$). Намерете $\Delta U$, работата на газа и получената топлина." check={[1250, 831, 2080]} ask={['$\\Delta U$, J', '$W$, J', '$Q$, J']}>
                <p><Tex>{'\\Delta U = \\frac{3}{2}nR\\Delta T = 1{,}5 \\cdot 2 \\cdot 8{,}31 \\cdot 50 \\approx 1250\\ \\mathrm{J}'}</Tex></p>
                <p>При постоянно налягане <Tex>{'W = p\\Delta V = nR\\Delta T = 2 \\cdot 8{,}31 \\cdot 50 = 831\\ \\mathrm{J}'}</Tex></p>
                <p><Tex>{'Q = \\Delta U + W = \\frac{5}{2}nR\\Delta T \\approx 2080\\ \\mathrm{J}'}</Tex> – 40% от топлината отива за работа.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Едноатомен газ извършва правоъгълен цикъл: при $V_1 = 2\ \mathrm{L}$ налягането се вдига от $1 \cdot 10^5$ до $3 \cdot 10^5\ \mathrm{Pa}$, газът се разширява изобарно до $V_2 = 5\ \mathrm{L}$, налягането пада обратно и газът се свива до $V_1$. Намерете полезната работа за цикъл и КПД (в %)." check={[600, 21.1]} ask={['$W$, J', '$\\eta$, %']}>
                <p>Полезната работа е лицето на правоъгълника: <Tex>{'W = (3 - 1) \\cdot 10^5 \\cdot 3 \\cdot 10^{-3} = 600\\ \\mathrm{J}'}</Tex>.</p>
                <p>Топлина се получава при нагряването при <Tex>{'V_1'}</Tex>: <Tex>{'\\frac{3}{2}V_1\\Delta p = 1{,}5 \\cdot 2 \\cdot 10^{-3} \\cdot 2 \\cdot 10^5 = 600\\ \\mathrm{J}'}</Tex>, и при изобарното разширение: <Tex>{'\\frac{5}{2}p_2\\Delta V = 2{,}5 \\cdot 3 \\cdot 10^5 \\cdot 3 \\cdot 10^{-3} = 2250\\ \\mathrm{J}'}</Tex>.</p>
                <p><Tex>{'\\eta = \\frac{600}{600 + 2250} \\approx 0{,}211 = 21{,}1\\%'}</Tex></p>
                <p>За сравнение: между най-ниската и най-високата температура в този цикъл (<Tex>{'pV'}</Tex> се мени от 200 до 1500 J) цикъл на Карно би дал около 87%.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Термопомпа топли къща до 20 °C, а навън е −5 °C. Колко е идеалният COP? Колко електрическа мощност ѝ трябва за 12 kW топлина, ако истинският ѝ COP е 3,5?" check={[11.7, 3.43]} ask={['COP на Карно', 'мощност, kW']}>
                <p><Tex>{'T_1 = 293\\ \\mathrm{K}'}</Tex>, <Tex>{'T_2 = 268\\ \\mathrm{K}'}</Tex>: <Tex>{'\\mathrm{COP}_{\\max} = \\frac{293}{25} \\approx 11{,}7'}</Tex></p>
                <p><Tex>{'W = \\frac{Q_1}{\\mathrm{COP}} = \\frac{12}{3{,}5} \\approx 3{,}43\\ \\mathrm{kW}'}</Tex></p>
                <p>Истинската помпа е 3–4 пъти под идеалната, но пак дава 3,5 пъти повече топлина от електрическа печка.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="1 mol идеален газ при 300 K се разширява изотермно от 10 L до 30 L. Колко топлина получава ($R = 8{,}31$)?" check={[2740]} ask={['$Q$, J']}>
                <p>При изотермен процес <Tex>{'\\Delta U = 0'}</Tex>, значи <Tex>{'Q = W'}</Tex>.</p>
                <p><Tex>{'W = \\int_{V_1}^{V_2} \\frac{nRT}{V}\\,dV = nRT\\ln\\frac{V_2}{V_1} = 8{,}31 \\cdot 300 \\cdot \\ln 3'}</Tex></p>
                <p><Tex>{'Q = W \\approx 2493 \\cdot 1{,}0986 \\approx 2740\\ \\mathrm{J}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В дизелов двигател въздух ($\gamma = 1{,}4$) с температура 27 °C се свива адиабатно 18 пъти. Каква е температурата му в келвини и колко пъти нараства налягането?" check={[953, 57.2]} ask={['$T_2$, K', '$p_2 : p_1$']}>
                <p>От <Tex>{'TV^{\\gamma - 1} = \\text{const}'}</Tex>: <Tex>{'T_2 = 300 \\cdot 18^{0{,}4} \\approx 300 \\cdot 3{,}18 \\approx 953\\ \\mathrm{K}'}</Tex> (около 680 °C).</p>
                <p>От <Tex>{'pV^{\\gamma} = \\text{const}'}</Tex>: <Tex>{'\\frac{p_2}{p_1} = 18^{1{,}4} \\approx 57{,}2'}</Tex>.</p>
                <p>Проверка с <Tex>{'pV = nRT'}</Tex>: <Tex>{'\\frac{p_2}{p_1} = 18 \\cdot \\frac{T_2}{T_1} = 18 \\cdot 3{,}18 \\approx 57{,}2'}</Tex> ✓</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Изобретател твърди, че двигателят му получава 1000 J от нагревател с 400 K, отдава топлина на хладилник с 300 K и извършва 300 J работа за цикъл. Възможно ли е? Каква е най-голямата възможна работа?" check={[250]} ask={['$W_{\\max}$, J']}>
                <p><Tex>{'\\eta_{\\max} = 1 - \\frac{300}{400} = 25\\%'}</Tex>, а твърдението е за <Tex>{'\\eta = 30\\%'}</Tex> – невъзможно.</p>
                <p><Tex>{'W_{\\max} = 0{,}25 \\cdot 1000 = 250\\ \\mathrm{J}'}</Tex></p>
                <p>С ентропия: нагревателят губи <Tex>{'\\frac{1000}{400} = 2{,}5\\ \\mathrm{J/K}'}</Tex>, а хладилникът би получил само <Tex>{'\\frac{700}{300} \\approx 2{,}33\\ \\mathrm{J/K}'}</Tex> – общата ентропия би намаляла, което вторият принцип забранява.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Едноатомен идеален газ: <Tex>{'U = \\frac{3}{2}nRT'}</Tex>; работата на газа е лицето под кривата в p–V диаграмата, при <Tex>{'p = \\text{const}'}</Tex> – <Tex>{'W = p\\Delta V'}</Tex></li>
              <li>✓ Първи принцип: <Tex>{'Q = \\Delta U + W'}</Tex>, като <Tex>{'W'}</Tex> е работата, извършена от газа</li>
              <li>✓ <Term id="charles-law">Изохорен</Term>: <Tex>{'W = 0'}</Tex>; <Term id="boyle-law">изотермен</Term>: <Tex>{'\\Delta U = 0'}</Tex>; адиабатен: <Tex>{'Q = 0'}</Tex>, <Tex>{'pV^{\\gamma} = \\text{const}'}</Tex></li>
              <li>✓ Двигател: <Tex>{'Q_1 = W + Q_2'}</Tex>, <Tex>{'\\eta = \\frac{W}{Q_1} \\le 1 - \\frac{T_2}{T_1}'}</Tex> (в келвини)</li>
              <li>✓ Термопомпа: <Tex>{'\\mathrm{COP} = \\frac{Q_1}{W} \\le \\frac{T_1}{T_1 - T_2}'}</Tex> – може да е много по-голям от 1</li>
              <li>✓ Втори принцип: топлината сама тече от топло към студено; ентропията на <Term id="closed-system">изолирана система</Term> не намалява</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 1867 г. Джеймс Клерк Максуел измисля „демон“ – малко същество, което стои при вратичка между две половини на съд с газ и
              пропуска бързите молекули само надясно, а бавните – само наляво. Така дясната половина би се затоплила, а лявата изстинала, без
              да се извършва работа – в нарушение на втория принцип. Загадката се решава едва през XX век: демонът трябва да помни кои молекули
              е пропуснал, а изтриването на информация, както показват Ролф Ландауер (1961) и Чарлз Бенет (1982), неизбежно отделя топлина и
              увеличава ентропията. Оказва се, че информацията също е физична.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
