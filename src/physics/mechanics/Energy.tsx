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
import RollerCoasterLab from './RollerCoasterLab';
import SpringLauncherLab from './SpringLauncherLab';
import StairsPowerLab from './StairsPowerLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.5 → 0{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [F, s] = [pick([10, 20, 50, 100]), pick([2, 5, 10])];
    const [alpha, cos, cosTex] = pick([
      [0, 1, '1'],
      [60, 0.5, '0{,}5'],
      [90, 0, '0'],
      [180, -1, '-1'],
    ] as [number, number, string][]);
    return {
      tex: `F = ${F}\\ \\mathrm{N}, \\quad s = ${s}\\ \\mathrm{m}, \\quad \\alpha = ${alpha}^\\circ`,
      ask: 'Работа на силата: $W = ?\\ \\mathrm{J}$',
      num: F * s * cos,
      den: 1,
      steps: [`$W = Fs\\cos\\alpha = ${F} \\cdot ${s} \\cdot ${cosTex} = ${F * s * cos}\\ \\mathrm{J}$`, alpha === 90 ? 'Силата е перпендикулярна на преместването и не върши работа.' : alpha === 180 ? 'Силата е срещу движението – работата е отрицателна.' : 'Ъгълът е между силата и преместването.'],
    };
  }
  if (kind === 1) {
    const [m, v] = [pick([2, 4, 6, 10]), randInt(1, 10)];
    return {
      tex: `m = ${m}\\ \\mathrm{kg}, \\quad v = ${v}\\ \\mathrm{m/s}`,
      ask: 'Кинетична енергия: $E_k = ?\\ \\mathrm{J}$',
      num: (m * v * v) / 2,
      den: 1,
      steps: [`$E_k = \\frac{mv^2}{2} = \\frac{${m} \\cdot ${v}^2}{2} = ${(m * v * v) / 2}\\ \\mathrm{J}$`],
    };
  }
  if (kind === 2) {
    const [m, h] = [randInt(1, 10), randInt(1, 20)];
    return {
      tex: `m = ${m}\\ \\mathrm{kg}, \\quad h = ${h}\\ \\mathrm{m}, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Потенциална енергия: $E_p = ?\\ \\mathrm{J}$',
      num: m * 10 * h,
      den: 1,
      steps: [`$E_p = mgh = ${m} \\cdot 10 \\cdot ${h} = ${m * 10 * h}\\ \\mathrm{J}$`],
    };
  }
  if (kind === 3) {
    const [k, cm] = [pick([100, 200, 400, 1000]), pick([5, 10, 20])];
    const x = cm / 100;
    return {
      tex: `k = ${k}\\ \\mathrm{N/m}, \\quad x = ${dec(x)}\\ \\mathrm{m}`,
      ask: 'Енергия на пружината: $E = ?\\ \\mathrm{J}$',
      num: k * cm * cm,
      den: 20000,
      steps: [`$E = \\frac{kx^2}{2} = \\frac{${k} \\cdot ${dec(x)}^2}{2}$`, `$= \\frac{${k} \\cdot ${dec((cm * cm) / 10000)}}{2} = ${dec((k * cm * cm) / 20000)}\\ \\mathrm{J}$`],
    };
  }
  if (kind === 4) {
    const v = pick([10, 20, 30, 40]);
    const h = (v * v) / 20;
    return {
      tex: `h = ${h}\\ \\mathrm{m}, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Тяло пада от покой без триене. Скорост в долния край: $v = ?\\ \\mathrm{m/s}$',
      num: v,
      den: 1,
      steps: [`$mgh = \\frac{mv^2}{2}$ – масата се съкращава`, `$v = \\sqrt{2gh} = \\sqrt{2 \\cdot 10 \\cdot ${h}} = \\sqrt{${v * v}} = ${v}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 5) {
    const [W, t] = [pick([600, 1200, 3000]), pick([2, 3, 4, 5, 6, 10, 12, 15, 20, 30])];
    return {
      tex: `W = ${W}\\ \\mathrm{J}, \\quad t = ${t}\\ \\mathrm{s}`,
      ask: 'Мощност: $P = ?\\ \\mathrm{W}$',
      num: W,
      den: t,
      steps: [`$P = \\frac{W}{t} = \\frac{${W}}{${t}} = ${dec(W / t)}\\ \\mathrm{W}$`],
    };
  }
  const [F, kmh] = [pick([500, 1000, 2000]), pick([36, 72, 108])];
  const v = (kmh / 36) * 10;
  return {
    tex: `F = ${F}\\ \\mathrm{N}, \\quad v = ${kmh}\\ \\mathrm{km/h}`,
    ask: 'Мощност на двигателя: $P = ?\\ \\mathrm{kW}$',
    num: F * kmh,
    den: 3600,
    steps: [`$v = ${kmh} : 3{,}6 = ${v}\\ \\mathrm{m/s}$`, `$P = Fv = ${F} \\cdot ${v} = ${F * v}\\ \\mathrm{W} = ${dec((F * v) / 1000)}\\ \\mathrm{kW}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🎢 Влакче в увеселителен парк',
    problem: 'Количка на влакче тръгва почти от покой от височина 40 m. Каква е скоростта ѝ в най-ниската точка (на нивото на земята), ако пренебрегнем триенето? Дай отговора в km/h.',
    solution: ['$mgh = \\frac{mv^2}{2} \\Rightarrow v = \\sqrt{2gh} = \\sqrt{2 \\cdot 9{,}81 \\cdot 40} \\approx 28{,}0\\ \\mathrm{m/s}$', '$28{,}0 \\cdot 3{,}6 \\approx 101\\ \\mathrm{km/h}$ – независимо от масата на количката и от формата на пистата.'],
    answer: '$\\approx 101\\ \\mathrm{km/h}$',
    check: [101],
    ask: ['скорост, km/h'],
  },
  {
    title: '⛷️ Скиор',
    problem: 'Скиор с маса 70 kg слиза по писта с денивелация 100 m. В долния край скоростта му е 20 m/s. Колко енергия се е превърнала в топлина (триене в снега и съпротивление на въздуха)? Дай отговора в kJ.',
    solution: ['Начална енергия: $mgh = 70 \\cdot 9{,}81 \\cdot 100 = 68\\,670\\ \\mathrm{J}$', 'Крайна кинетична енергия: $\\frac{70 \\cdot 20^2}{2} = 14\\,000\\ \\mathrm{J}$', 'Топлина: $68\\,670 - 14\\,000 = 54\\,670\\ \\mathrm{J} \\approx 54{,}7\\ \\mathrm{kJ}$ – около 80% от енергията.'],
    answer: '$\\approx 54{,}7\\ \\mathrm{kJ}$',
    check: [54.7],
    ask: ['топлина, kJ'],
  },
  {
    title: '🏋️ Щанга',
    problem: 'Щангист вдига щанга от 100 kg на височина 2 m. Каква работа извършва срещу силата на тежестта?',
    solution: ['$W = mgh = 100 \\cdot 9{,}81 \\cdot 2 = 1962\\ \\mathrm{J} \\approx 1{,}96\\ \\mathrm{kJ}$', 'Докато държи щангата неподвижно над главата си, механична работа не върши – въпреки че се уморява.'],
    answer: '$\\approx 1960\\ \\mathrm{J}$',
    check: [1962],
    ask: ['работа, J'],
  },
  {
    title: '🚴 Колоездач',
    problem: 'Колоездач развива мощност 250 W и се движи с постоянна скорост 10 m/s (36 km/h). Колко е съпротивителната сила (основно на въздуха)?',
    solution: ['При постоянна скорост теглителната сила е равна на съпротивителната.', '$P = Fv \\Rightarrow F = \\frac{P}{v} = \\frac{250}{10} = 25\\ \\mathrm{N}$'],
    answer: '$25\\ \\mathrm{N}$',
    check: [25],
    ask: ['сила, N'],
  },
  {
    title: '🍫 Шоколад и стълби',
    problem: 'В 100 g шоколад има около 530 kcal (1 kcal = 4184 J). Колко MJ е това? Колко етажа по 3 m може да изкачи човек с маса 60 kg с тази енергия, ако мускулите превръщат в работа 25% от нея?',
    solution: ['$530 \\cdot 4184 \\approx 2{,}22 \\cdot 10^6\\ \\mathrm{J} = 2{,}22\\ \\mathrm{MJ}$', 'Полезна работа: $0{,}25 \\cdot 2{,}22 \\cdot 10^6 \\approx 5{,}54 \\cdot 10^5\\ \\mathrm{J}$', '$h = \\frac{W}{mg} = \\frac{5{,}54 \\cdot 10^5}{60 \\cdot 9{,}81} \\approx 942\\ \\mathrm{m}$, т.е. около 314 етажа.'],
    answer: '$\\approx 2{,}22\\ \\mathrm{MJ}$ и около 314 етажа',
    check: [2.22, 314],
    ask: ['енергия, MJ', 'етажи'],
  },
  {
    title: '💡 LED вместо крушка',
    problem: 'Сменяш крушка от 60 W с LED лампа от 10 W, която свети също толкова ярко. Лампата свети по 5 часа на ден. Колко kWh спестяваш за година и колко евро, ако 1 kWh струва 0,14 €?',
    solution: ['Разлика в мощността: $60 - 10 = 50\\ \\mathrm{W} = 0{,}05\\ \\mathrm{kW}$', '$0{,}05 \\cdot 5 \\cdot 365 = 91{,}25 \\approx 91{,}3\\ \\mathrm{kWh}$', '$91{,}25 \\cdot 0{,}14 \\approx 12{,}8$ € годишно – само от една лампа.'],
    answer: '$\\approx 91{,}3\\ \\mathrm{kWh}$ и 12,8 €',
    check: [91.3, 12.8],
    ask: ['енергия, kWh', 'спестени €'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Коя е единицата за работа и енергия в SI?',
    answers: ['джаул', 'ват', 'нютон', 'киловатчас'],
    correctAnswer: 'джаул',
  },
  {
    question: 'Носиш чанта по хоризонтален коридор с постоянна скорост. Каква работа върши силата, с която държиш чантата нагоре?',
    answers: ['нулева', 'положителна', 'отрицателна', 'зависи от масата на чантата'],
    correctAnswer: 'нулева',
  },
  {
    question: 'Колко пъти се увеличава кинетичната енергия, ако скоростта се удвои?',
    answers: ['$4$', '$2$', '$8$', '$\\sqrt{2}$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Тяло пада от покой от височина 20 m без съпротивление на въздуха. С каква скорост удря земята? ($g = 10\\ \\mathrm{m/s^2}$)',
    answers: ['$20\\ \\mathrm{m/s}$', '$200\\ \\mathrm{m/s}$', '$40\\ \\mathrm{m/s}$', '$14\\ \\mathrm{m/s}$'],
    correctAnswer: '$20\\ \\mathrm{m/s}$',
  },
  {
    question: 'На колко джаула е равен 1 kWh?',
    answers: ['$3{,}6 \\cdot 10^6\\ \\mathrm{J}$', '$1000\\ \\mathrm{J}$', '$3600\\ \\mathrm{J}$', '$3{,}6 \\cdot 10^3\\ \\mathrm{J}$'],
    correctAnswer: '$3{,}6 \\cdot 10^6\\ \\mathrm{J}$',
  },
  {
    question: 'Двигател с мощност 500 W работи 10 s. Каква работа извършва?',
    answers: ['$5000\\ \\mathrm{J}$', '$50\\ \\mathrm{J}$', '$510\\ \\mathrm{J}$', '$0{,}02\\ \\mathrm{J}$'],
    correctAnswer: '$5000\\ \\mathrm{J}$',
  },
  {
    question: 'Шейна се плъзга по склон с триене. Какво НЕ се запазва?',
    answers: ['механичната енергия', 'пълната енергия', 'масата на шейната', 'височината на склона'],
    correctAnswer: 'механичната енергия',
  },
  {
    question: 'Пружина с коефициент 100 N/m е разтегната с 0,2 m. Каква енергия е натрупана в нея?',
    answers: ['$2\\ \\mathrm{J}$', '$20\\ \\mathrm{J}$', '$10\\ \\mathrm{J}$', '$4\\ \\mathrm{J}$'],
    correctAnswer: '$2\\ \\mathrm{J}$',
  },
  {
    question: 'Двигател с КПД 80% дава полезна мощност 400 W. Каква мощност консумира?',
    answers: ['$500\\ \\mathrm{W}$', '$320\\ \\mathrm{W}$', '$480\\ \\mathrm{W}$', '$400\\ \\mathrm{W}$'],
    correctAnswer: '$500\\ \\mathrm{W}$',
  },
];

// ---------- Страница ----------

export function Energy() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Работа, енергия, мощност</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍺 През 1840-те години пивоварът от Манчестър Джеймс Прескот Джаул прави опит, който на пръв поглед е скучен: падащи тежести
            въртят лопатки в съд с вода. Водата се загрява – но само с части от градуса, и Джаул мери с изключително точни термометри. Изводът
            му е смел: работата и топлината са едно и също нещо – <strong>енергия</strong>, която само сменя формата си. Числото, което получава
            за „цената“ на една калория в механична работа, е близко до днешните 4,19 J. Разказва се, че дори на сватбеното си пътешествие
            той мерил температурата на водата над и под един водопад. Днес единицата за енергия носи неговото име.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Механична работа</h2>
          <p className={text}>
            В ежедневието „работа“ е всичко, от което се уморяваш. Във физиката работа има само когато сила премества тяло – и важна е
            само частта от силата по посока на преместването.
          </p>
          <Theorem
            type="definition"
            title="Работа на постоянна сила"
            description="$W = Fs\cos\alpha$, където $\alpha$ е ъгълът между силата и преместването. Единицата е джаул: $1\ \mathrm{J} = 1\ \mathrm{N \cdot m}$. При $\alpha < 90^\circ$ работата е положителна, при $\alpha = 90^\circ$ е нула, а при $\alpha > 90^\circ$ – отрицателна (например работата на триенето)."
          />
          <Example
            description="Дете тегли шейна със сила 50 N по въже, което сключва 30° с хоризонта, и я премества на 20 m. Каква работа извършва?"
            steps={['$W = Fs\\cos\\alpha = 50 \\cdot 20 \\cdot \\cos 30^\\circ \\approx 50 \\cdot 20 \\cdot 0{,}866 \\approx 866\\ \\mathrm{J}$', 'Вертикалната част от силата само „олекотява“ шейната – тя не върши работа.']}
          />
          <p className={text}>
            Ако силата се мени по пътя, работата е <strong>лицето под графиката</strong> <Tex>{'F(s)'}</Tex> – точно както преместването е
            лицето под <Tex>{'v(t)'}</Tex> (виж{' '}
            <Link to="/analysis/integrals" className={link}>
              Интеграли
            </Link>
            ). Така ще намерим енергията на пружината.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Кинетична енергия</h2>
          <Theorem
            title="Теорема за кинетичната енергия"
            description="Тяло с маса $m$ и скорост $v$ има кинетична енергия $E_k = \frac{mv^2}{2}$. Работата на всички сили, действащи на тялото, е равна на промяната на кинетичната му енергия: $W = E_{k2} - E_{k1}$."
          />
          <p className={text}>
            Теоремата следва от <Term id="newton-second-law">втория закон на Нютон</Term> (виж{' '}
            <Link to="/physics/mechanics/newton" className={link}>
              Закони на Нютон
            </Link>
            ): <Tex>{'W = Fs = mas'}</Tex>, а от{' '}
            <Link to="/physics/mechanics/linear-motion" className={link}>
              праволинейното движение
            </Link>{' '}
            знаем, че <Tex>{'as = \\frac{v_2^2 - v_1^2}{2}'}</Tex>. Затова <Term id="braking-distance">спирачният път</Term> расте с квадрата на скоростта – колата трябва да
            „изхаби“ четири пъти повече енергия.
          </p>
          <Example
            description="Кола с маса 1000 kg се движи с 20 m/s. Каква е кинетичната ѝ енергия и каква средна сила на триене я спира на 40 m?"
            steps={['$E_k = \\frac{1000 \\cdot 20^2}{2} = 200\\,000\\ \\mathrm{J} = 200\\ \\mathrm{kJ}$', 'Работата на триенето е $-F \\cdot 40 = 0 - 200\\,000$', '$F = \\frac{200\\,000}{40} = 5000\\ \\mathrm{N}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Потенциална енергия</h2>
          <Theorem
            title="Потенциална енергия"
            description="Тяло на височина $h$ над избрано нулево ниво има потенциална енергия $E_p = mgh$ – толкова работа ще извърши силата на тежестта, ако тялото падне до нулевото ниво. Деформирана пружина има $E_p = \frac{kx^2}{2}$, където $k$ е коефициентът на еластичност, а $x$ – деформацията."
          />
          <p className={text}>
            Нулевото ниво избираме ние – значение има само <strong>разликата</strong> в потенциалната енергия. Силата на пружината расте
            линейно, <Tex>{'F = kx'}</Tex>, затова работата ѝ е лицето на триъгълник: <Tex>{'\\frac{1}{2} \\cdot x \\cdot kx = \\frac{kx^2}{2}'}</Tex>.
          </p>
          <SpringLauncherLab />
          <Example
            description="Пружина с $k = 200\ \mathrm{N/m}$ е свита с 10 cm. Колко енергия е натрупана в нея?"
            steps={['$x = 0{,}1\\ \\mathrm{m}$', '$E = \\frac{kx^2}{2} = \\frac{200 \\cdot 0{,}01}{2} = 1\\ \\mathrm{J}$', 'Ако я свием двойно повече (20 cm), енергията става 4 J.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Закон за запазване на енергията</h2>
          <Theorem
            title="Запазване на механичната енергия"
            description="Ако върху тялото работят само сили като тежестта и еластичността (без триене и съпротивление), сумата $E_k + E_p$ остава постоянна. Енергията само преминава от една форма в друга."
          />
          <p className={text}>
            Това прави много задачи изненадващо лесни: скоростта на дъното на пързалка с височина <Tex>{'h'}</Tex> е{' '}
            <Tex>{'v = \\sqrt{2gh}'}</Tex> – независимо от формата на пързалката и от масата. Със същата идея се намира и скоростта, с която
            ракета трябва да напусне Земята (виж{' '}
            <Link to="/astronomy/lecture08" className={link}>
              Орбити и скорости
            </Link>
            ).
          </p>
          <Example
            description="Дете се спуска по пързалка, висока 5 m. Каква е скоростта му в долния край, ако триенето е пренебрежимо?"
            steps={['$mgh = \\frac{mv^2}{2} \\Rightarrow v = \\sqrt{2gh}$', '$v = \\sqrt{2 \\cdot 9{,}81 \\cdot 5} \\approx 9{,}90\\ \\mathrm{m/s}$ (около 36 km/h) – затова истинските пързалки имат триене!']}
          />
          <Theorem
            title="Триене и топлина"
            description="Силата на триене върши отрицателна работа и механичната енергия намалява. Тя не изчезва – превръща се в топлина: $Q = F_{\text{тр}} \cdot s$. Пълната енергия (механична плюс топлина и всички други форми) винаги се запазва."
          />
          <RollerCoasterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Мощност и коефициент на полезно действие</h2>
          <Theorem
            type="definition"
            title="Мощност"
            description="Мощността показва колко бързо се извършва работа: $P = \frac{W}{t}$, единица ват ($1\ \mathrm{W} = 1\ \mathrm{J/s}$). При движение с постоянна скорост $v$ под действие на сила $F$: $P = Fv$. Метричната конска сила е $1\ \text{к.с.} \approx 735{,}5\ \mathrm{W}$."
          />
          <p className={text}>
            Сметката за <Term id="electric-current">ток</Term> се плаща в <strong>киловатчасове</strong>: <Tex>{'1\\ \\mathrm{kWh} = 1000\\ \\mathrm{W} \\cdot 3600\\ \\mathrm{s} = 3{,}6\\ \\mathrm{MJ}'}</Tex>.
            Конската сила е въведена от Джеймс Уат в края на XVIII век, за да сравнява парните си машини с конете, които те заменят;
            неговата стойност (около 746 W) е малко по-голяма от метричната.
          </p>
          <Theorem
            type="definition"
            title="Коефициент на полезно действие (КПД)"
            description="Никоя машина не превръща цялата получена енергия в полезна работа – част от нея става топлина. $\eta = \frac{W_{\text{пол}}}{W_{\text{изр}}} = \frac{P_{\text{пол}}}{P_{\text{изр}}} < 1$, често в проценти."
          />
          <Example
            description="Асансьор вдига 800 kg (кабина с хора) на 30 m за 20 s. Каква полезна мощност развива? Каква мощност консумира двигателят, ако КПД е 80%?"
            steps={['$W = mgh = 800 \\cdot 9{,}81 \\cdot 30 = 235\\,440\\ \\mathrm{J}$', '$P_{\\text{пол}} = \\frac{235\\,440}{20} \\approx 11\\,800\\ \\mathrm{W} = 11{,}8\\ \\mathrm{kW}$', '$P_{\\text{изр}} = \\frac{11{,}8}{0{,}8} \\approx 14{,}7\\ \\mathrm{kW}$']}
          />
          <StairsPowerLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 0,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Енергията около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Работа без преместване', 'държа тежка чанта неподвижно – върша работа', 'механичната работа е 0, защото $s = 0$ (уморяват се мускулите)'],
              ['Ъгълът във формулата', '$W = Fs\\sin\\alpha$', '$W = Fs\\cos\\alpha$, $\\alpha$ е между силата и преместването'],
              ['Кинетичната енергия', '$E_k = mv^2$', '$E_k = \\frac{mv^2}{2}$ – и расте с квадрата на скоростта'],
              ['Енергия на пружината', '$E = kx$', '$E = \\frac{kx^2}{2}$; $kx$ е силата'],
              ['Мощност и енергия', 'чайникът консумира 2000 W ток', 'мощността е 2000 W, а енергията за 3 min е $2\\ \\mathrm{kW} \\cdot 0{,}05\\ \\mathrm{h} = 0{,}1\\ \\mathrm{kWh}$'],
              ['Триенето „унищожава“ енергия', 'при триене енергията изчезва', 'механичната енергия става топлина; пълната енергия се запазва'],
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
              <Task id="a1" number={1} color="border-green-500" question="Кран вдига товар от 500 kg на височина 12 m за 20 s. Каква работа извършва и каква е мощността му?" check={[58.9, 2.94]} ask={['работа, kJ', 'мощност, kW']}>
                <p><Tex>{'W = mgh = 500 \\cdot 9{,}81 \\cdot 12 = 58\\,860\\ \\mathrm{J} \\approx 58{,}9\\ \\mathrm{kJ}'}</Tex></p>
                <p><Tex>{'P = \\frac{W}{t} = \\frac{58\\,860}{20} \\approx 2940\\ \\mathrm{W} = 2{,}94\\ \\mathrm{kW}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Кола с маса 1200 kg ускорява от 54 km/h до 108 km/h. Каква е началната ѝ кинетична енергия и каква работа е извършил двигателят (без загуби)?" check={[135, 405]} ask={['начална $E_k$, kJ', 'работа, kJ']}>
                <p><Tex>{'54\\ \\mathrm{km/h} = 15\\ \\mathrm{m/s}'}</Tex>, <Tex>{'108\\ \\mathrm{km/h} = 30\\ \\mathrm{m/s}'}</Tex>.</p>
                <p><Tex>{'E_{k1} = \\frac{1200 \\cdot 15^2}{2} = 135\\ \\mathrm{kJ}'}</Tex>, <Tex>{'E_{k2} = \\frac{1200 \\cdot 30^2}{2} = 540\\ \\mathrm{kJ}'}</Tex></p>
                <p><Tex>{'W = 540 - 135 = 405\\ \\mathrm{kJ}'}</Tex> – удвояването на скоростта струва три пъти повече, отколкото потеглянето до 54 km/h.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Топка е хвърлена вертикално нагоре със скорост 12 m/s. До каква височина ще се издигне (без съпротивление на въздуха)?" check={[7.34]} ask={['височина, m']}>
                <p><Tex>{'\\frac{mv^2}{2} = mgh \\Rightarrow h = \\frac{v^2}{2g}'}</Tex></p>
                <p><Tex>{'h = \\frac{144}{2 \\cdot 9{,}81} \\approx 7{,}34\\ \\mathrm{m}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Дете тегли шейна със сила 50 N под ъгъл 30° спрямо хоризонта на 20 m. Силата на триене е 40 N. Каква работа извършва детето и с колко се увеличава кинетичната енергия на шейната?" check={[866, 66]} ask={['работа на детето, J', 'промяна на $E_k$, J']}>
                <p><Tex>{'W_1 = 50 \\cdot 20 \\cdot \\cos 30^\\circ \\approx 866\\ \\mathrm{J}'}</Tex></p>
                <p>Работата на триенето е отрицателна: <Tex>{'W_2 = -40 \\cdot 20 = -800\\ \\mathrm{J}'}</Tex>.</p>
                <p><Tex>{'\\Delta E_k = 866 - 800 = 66{,}0\\ \\mathrm{J}'}</Tex> – почти цялата работа отива в топлина.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Пружинен пистолет има пружина с $k = 800\ \mathrm{N/m}$, свита с 5 cm. С каква скорост излита топче от 10 g и колко високо би се издигнало, ако се изстреля вертикално?" check={[14.1, 10.2]} ask={['скорост, m/s', 'височина, m']}>
                <p><Tex>{'E = \\frac{kx^2}{2} = \\frac{800 \\cdot 0{,}05^2}{2} = 1\\ \\mathrm{J}'}</Tex></p>
                <p><Tex>{'v = \\sqrt{\\frac{2E}{m}} = \\sqrt{\\frac{2}{0{,}01}} \\approx 14{,}1\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'h = \\frac{E}{mg} = \\frac{1}{0{,}01 \\cdot 9{,}81} \\approx 10{,}2\\ \\mathrm{m}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Помпа изпомпва 2 m³ вода на височина 15 m за 10 min. Каква мощност консумира, ако КПД ѝ е 75%? (Плътност на водата 1000 kg/m³.)" check={[654]} ask={['консумирана мощност, W']}>
                <p><Tex>{'m = 2000\\ \\mathrm{kg}'}</Tex>, <Tex>{'W_{\\text{пол}} = mgh = 2000 \\cdot 9{,}81 \\cdot 15 = 294\\,300\\ \\mathrm{J}'}</Tex></p>
                <p><Tex>{'P_{\\text{пол}} = \\frac{294\\,300}{600} \\approx 491\\ \\mathrm{W}'}</Tex></p>
                <p><Tex>{'P_{\\text{изр}} = \\frac{490{,}5}{0{,}75} = 654\\ \\mathrm{W}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Количка тръгва от покой по писта без триене и трябва да премине през вертикален кръгов лупинг с радиус 8 m. От каква най-малка височина (над долната точка на лупинга) трябва да тръгне?" check={[20]} ask={['височина, m']}>
                <p>В горната точка на лупинга количката не пада, ако тежестта стига за центростремителната сила: <Tex>{'\\frac{mv^2}{R} \\ge mg'}</Tex>, т.е. <Tex>{'v^2 \\ge gR'}</Tex> (виж урока „Въртене“).</p>
                <p>От запазването на енергията: <Tex>{'mgh = mg \\cdot 2R + \\frac{mv^2}{2} \\ge 2mgR + \\frac{mgR}{2}'}</Tex>.</p>
                <p><Tex>{'h \\ge 2{,}5R = 20\\ \\mathrm{m}'}</Tex> – не само 16 m, колкото е горната точка.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Блокче се плъзга от покой по наклонена равнина с височина 5 m и наклон 30°. Коефициентът на триене е 0,2. Каква е скоростта му в долния край?" check={[8.01]} ask={['скорост, m/s']}>
                <p>Дължината на наклона е <Tex>{'s = \\frac{h}{\\sin 30^\\circ} = 10\\ \\mathrm{m}'}</Tex>; силата на триене е <Tex>{'\\mu mg\\cos 30^\\circ'}</Tex>.</p>
                <p><Tex>{'mgh - \\mu mg\\cos 30^\\circ \\cdot s = \\frac{mv^2}{2}'}</Tex> – масата се съкращава.</p>
                <p><Tex>{'v^2 = 2g(h - \\mu s\\cos 30^\\circ) = 2 \\cdot 9{,}81 \\cdot (5 - 1{,}73) \\approx 64{,}1'}</Tex></p>
                <p><Tex>{'v \\approx 8{,}01\\ \\mathrm{m/s}'}</Tex> (без триене би било 9,90 m/s).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Двигателят на кола развива най-много 60 kW, а съпротивлението на въздуха е $F = 0{,}4v^2$ (в N, $v$ в m/s). Каква е най-голямата скорост в km/h? Каква би била тя при двойно по-мощен двигател?" check={[191, 241]} ask={['скорост, km/h', 'при 120 kW, km/h']}>
                <p>При най-голяма скорост цялата мощност отива за съпротивлението: <Tex>{'P = Fv = 0{,}4v^3'}</Tex>.</p>
                <p><Tex>{'v = \\sqrt[3]{\\frac{60\\,000}{0{,}4}} = \\sqrt[3]{150\\,000} \\approx 53{,}1\\ \\mathrm{m/s} \\approx 191\\ \\mathrm{km/h}'}</Tex></p>
                <p>При двойна мощност скоростта нараства само <Tex>{'\\sqrt[3]{2} \\approx 1{,}26'}</Tex> пъти: около 241 km/h.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Работа: <Tex>{'W = Fs\\cos\\alpha'}</Tex>; при променлива сила – лицето под <Tex>{'F(s)'}</Tex></li>
              <li>✓ <Tex>{'E_k = \\frac{mv^2}{2}'}</Tex>; работата на всички сили е промяната на кинетичната енергия</li>
              <li>✓ <Tex>{'E_p = mgh'}</Tex> (тежест) и <Tex>{'E_p = \\frac{kx^2}{2}'}</Tex> (пружина)</li>
              <li>✓ Без <Term id="friction">триене</Term> <Tex>{'E_k + E_p = \\text{const}'}</Tex>; с триене част от енергията става топлина <Tex>{'Q = F_{\\text{тр}}s'}</Tex></li>
              <li>✓ Мощност <Tex>{'P = \\frac{W}{t} = Fv'}</Tex>; <Tex>{'1\\ \\mathrm{kWh} = 3{,}6\\ \\mathrm{MJ}'}</Tex>; <Tex>{'1\\ \\text{к.с.} \\approx 735{,}5\\ \\mathrm{W}'}</Tex></li>
              <li>✓ КПД <Tex>{'\\eta = \\frac{P_{\\text{пол}}}{P_{\\text{изр}}} < 1'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Ако един възрастен човек приема около 2000 kcal на ден, това са около 8,4 MJ, разпределени в 86 400 секунди – средно около 100 W.
              Тоест в покой ти „светиш“ с мощността на стара крушка, само че в инфрачервено. Затова в пълна зала за концерти става толкова
              топло: хиляда души отделят около 100 kW топлина – колкото няколко десетки печки.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
