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
import MonkeyHunterLab from './MonkeyHunterLab';
import ProjectileLab from './ProjectileLab';
import RiverCrossingLab from './RiverCrossingLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 12.5 → 12{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    // Хоризонтално хвърляне: времето зависи само от височината
    const t = randInt(1, 4);
    const v0 = randInt(2, 15);
    return {
      tex: `h = ${5 * t * t}\\ \\mathrm{m}, \\quad v_0 = ${v0}\\ \\mathrm{m/s}, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Хвърлено хоризонтално: време за падане $t = ?\\ \\mathrm{s}$',
      num: t,
      den: 1,
      steps: [`Вертикално тялото пада свободно: $h = \\frac{gt^2}{2}$ – хоризонталната скорост не влияе.`, `$t = \\sqrt{\\frac{2 \\cdot ${5 * t * t}}{10}} = \\sqrt{${t * t}} = ${t}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 1) {
    const t = randInt(1, 4);
    const v0 = randInt(2, 15);
    return {
      tex: `h = ${5 * t * t}\\ \\mathrm{m}, \\quad v_0 = ${v0}\\ \\mathrm{m/s}, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Хвърлено хоризонтално: далечина $L = ?\\ \\mathrm{m}$',
      num: v0 * t,
      den: 1,
      steps: [`$t = \\sqrt{\\frac{2h}{g}} = ${t}\\ \\mathrm{s}$`, `Хоризонтално движението е равномерно: $L = v_0 t = ${v0} \\cdot ${t} = ${v0 * t}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 2) {
    // При 30° вертикалната компонента е v/2, при 60° – хоризонталната
    const v = pick([10, 16, 20, 30, 40, 50]);
    const deg = pick([30, 60]);
    const comp = deg === 30 ? 'v_y' : 'v_x';
    const fn = deg === 30 ? '\\sin' : '\\cos';
    return {
      tex: `v = ${v}\\ \\mathrm{m/s}, \\quad \\alpha = ${deg}^\\circ`,
      ask: `$\\alpha$ е ъгълът с хоризонталата. $${comp} = ?\\ \\mathrm{m/s}$`,
      num: v,
      den: 2,
      steps: [`$${comp} = v ${fn} \\alpha = ${v} \\cdot ${fn} ${deg}^\\circ = ${v} \\cdot \\frac{1}{2} = ${dec(v / 2)}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 3) {
    const v0 = pick([10, 15, 20, 25, 30]);
    return {
      tex: `v_0 = ${v0}\\ \\mathrm{m/s}, \\quad \\alpha = 30^\\circ, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Време на полета: $T = ?\\ \\mathrm{s}$',
      num: v0,
      den: 10,
      steps: [`$T = \\frac{2v_0 \\sin \\alpha}{g} = \\frac{2 \\cdot ${v0} \\cdot \\frac{1}{2}}{10}$`, `$T = ${dec(v0 / 10)}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 4) {
    const v0 = pick([10, 20, 30]);
    return {
      tex: `v_0 = ${v0}\\ \\mathrm{m/s}, \\quad \\alpha = 45^\\circ, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Обхват: $R = ?\\ \\mathrm{m}$',
      num: v0 * v0,
      den: 10,
      steps: [`$R = \\frac{v_0^2 \\sin 2\\alpha}{g}$, а $\\sin 90^\\circ = 1$`, `$R = \\frac{${v0 * v0}}{10} = ${(v0 * v0) / 10}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 5) {
    const [a, b, c] = pick([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ]);
    return {
      tex: `u = ${b}\\ \\mathrm{m/s}, \\quad w = ${a}\\ \\mathrm{m/s}`,
      ask: 'Лодка, насочена перпендикулярно на брега, в река с течение $w$. Скорост спрямо брега: $v = ?\\ \\mathrm{m/s}$',
      num: c,
      den: 1,
      steps: [`Скоростите са перпендикулярни – събираме ги като вектори: $v = \\sqrt{u^2 + w^2}$`, `$v = \\sqrt{${b * b} + ${a * a}} = \\sqrt{${c * c}} = ${c}\\ \\mathrm{m/s}$`],
    };
  }
  const [d, u] = [pick([60, 90, 120]), pick([2, 3, 4, 5, 6])];
  return {
    tex: `d = ${d}\\ \\mathrm{m}, \\quad u = ${u}\\ \\mathrm{m/s}, \\quad w = 2\\ \\mathrm{m/s}`,
    ask: 'Лодката е насочена перпендикулярно на брега. Време за пресичане: $t = ?\\ \\mathrm{s}$',
    num: d,
    den: u,
    steps: [`Течението отнася лодката встрани, но не я приближава до брега: $t = \\frac{d}{u}$`, `$t = \\frac{${d}}{${u}} = ${dec(d / u)}\\ \\mathrm{s}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '💦 Маркуч в градината',
    problem: 'Водата излиза от маркуч със скорост 10 m/s. Насочваш го под 45° над земята (ниско долу). Докъде стига струята? ($g = 9{,}8\\ \\mathrm{m/s^2}$, без съпротивление)',
    solution: ['$R = \\frac{v_0^2 \\sin 2\\alpha}{g} = \\frac{100 \\cdot \\sin 90^\\circ}{9{,}8}$', '$R \\approx 10{,}2\\ \\mathrm{m}$ – под 45° струята стига най-далеч.'],
    answer: '$\\approx 10{,}2\\ \\mathrm{m}$',
    check: [10.2],
    ask: ['разстояние, m'],
  },
  {
    title: '🏐 Топка от терасата',
    problem: 'От тераса на 5 m височина хвърляш топка хоризонтално с 8 m/s. На какво разстояние от сградата ще падне? ($g = 9{,}8\\ \\mathrm{m/s^2}$)',
    solution: ['$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{10}{9{,}8}} \\approx 1{,}01\\ \\mathrm{s}$', '$L = v_0 t = 8 \\cdot 1{,}01 \\approx 8{,}08\\ \\mathrm{m}$'],
    answer: '$\\approx 8{,}08\\ \\mathrm{m}$',
    check: [8.08],
    ask: ['разстояние, m'],
  },
  {
    title: '🛶 През реката',
    problem: 'Река е широка 60 m, а течението е 1,5 m/s. Гребеш с 3 m/s спрямо водата, насочен право към отсрещния бряг. За колко време ще стигнеш и колко метра надолу по течението ще те отнесе?',
    solution: ['Към брега се движиш само с 3 m/s: $t = \\frac{60}{3} = 20\\ \\mathrm{s}$', 'За това време течението те отнася на $1{,}5 \\cdot 20 = 30\\ \\mathrm{m}$.'],
    answer: '20 s и 30 m',
    check: [20, 30],
    ask: ['време, s', 'отнасяне, m'],
  },
  {
    title: '🌧️ Дъжд по стъклото',
    problem: 'Дъждът пада вертикално с 6 m/s. Колата ти се движи с 72 km/h. Под какъв ъгъл спрямо вертикалата изглеждат дъждовните капки по страничното стъкло?',
    solution: ['$72\\ \\mathrm{km/h} = 20\\ \\mathrm{m/s}$. Спрямо колата капките имат и хоризонтална скорост 20 m/s назад.', '$\\tg \\varphi = \\frac{20}{6} \\Rightarrow \\varphi \\approx 73{,}3^\\circ$ – почти хоризонтални следи.'],
    answer: '$\\approx 73{,}3^\\circ$',
    check: [73.3],
    ask: ['ъгъл, °'],
  },
  {
    title: '📦 Помощ от самолет',
    problem: 'Самолет лети хоризонтално на 180 m височина с 50 m/s и пуска пакет с помощи. На какво хоризонтално разстояние преди целта трябва да го пусне? ($g = 9{,}8\\ \\mathrm{m/s^2}$, без съпротивление)',
    solution: ['Пакетът пада $t = \\sqrt{\\frac{2 \\cdot 180}{9{,}8}} \\approx 6{,}06\\ \\mathrm{s}$', 'През това време той лети напред със скоростта на самолета: $50 \\cdot 6{,}06 \\approx 303\\ \\mathrm{m}$', 'В момента на удара самолетът е точно над пакета.'],
    answer: '$\\approx 303\\ \\mathrm{m}$',
    check: [303],
    ask: ['разстояние, m'],
  },
  {
    title: '⚽ Дълъг пас',
    problem: 'Вратар изритва топката с 25 m/s под 40° спрямо земята. Докъде би стигнала тя без съпротивление на въздуха? ($g = 9{,}8\\ \\mathrm{m/s^2}$)',
    solution: ['$R = \\frac{v_0^2 \\sin 2\\alpha}{g} = \\frac{625 \\cdot \\sin 80^\\circ}{9{,}8}$', '$R \\approx 62{,}8\\ \\mathrm{m}$. В действителност въздухът я спира по-рано – виж лабораторията.'],
    answer: '$\\approx 62{,}8\\ \\mathrm{m}$',
    check: [62.8],
    ask: ['разстояние, m'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'От една и съща височина едновременно пускат една топка и хвърлят хоризонтално друга. Коя пада първа на земята (без въздух)?',
    answers: ['падат едновременно', 'пуснатата', 'хвърлената', 'зависи от скоростта на хвърлената'],
    correctAnswer: 'падат едновременно',
  },
  {
    question: 'Каква е скоростта на тяло, хвърлено под ъгъл $\\alpha$, в най-високата точка?',
    answers: ['$v_0 \\cos \\alpha$', '$0$', '$v_0$', '$v_0 \\sin \\alpha$'],
    correctAnswer: '$v_0 \\cos \\alpha$',
  },
  {
    question: 'При какъв ъгъл на хвърляне от земята обхватът е най-голям (без въздух)?',
    answers: ['$45^\\circ$', '$30^\\circ$', '$60^\\circ$', '$90^\\circ$'],
    correctAnswer: '$45^\\circ$',
  },
  {
    question: 'Хвърляне под $30^\\circ$ дава обхват 50 m. Кой друг ъгъл дава същия обхват при същата скорост?',
    answers: ['$60^\\circ$', '$15^\\circ$', '$45^\\circ$', '$150^\\circ$'],
    correctAnswer: '$60^\\circ$',
  },
  {
    question: 'Какво става с хоризонталната компонента на скоростта по време на полета (без въздух)?',
    answers: ['остава постоянна', 'намалява', 'расте', 'става нула в най-високата точка'],
    correctAnswer: 'остава постоянна',
  },
  {
    question: 'Каква е траекторията на хвърлено под ъгъл тяло без съпротивление на въздуха?',
    answers: ['парабола', 'окръжност', 'права линия', 'хипербола'],
    correctAnswer: 'парабола',
  },
  {
    question: 'Колко пъти нараства обхватът, ако удвоим началната скорост (при същия ъгъл)?',
    answers: ['$4$', '$2$', '$\\sqrt{2}$', '$8$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Лодка гребе с 4 m/s перпендикулярно на брега, а течението е 3 m/s. Колко е скоростта ѝ спрямо брега?',
    answers: ['$5\\ \\mathrm{m/s}$', '$7\\ \\mathrm{m/s}$', '$1\\ \\mathrm{m/s}$', '$4\\ \\mathrm{m/s}$'],
    correctAnswer: '$5\\ \\mathrm{m/s}$',
  },
  {
    question: 'Как трябва да се насочи лодка, за да пресече реката за най-кратко време?',
    answers: ['перпендикулярно на брега', 'малко срещу течението', 'по течението', 'зависи от ширината на реката'],
    correctAnswer: 'перпендикулярно на брега',
  },
];

// ---------- Страница ----------

export function PlaneMotion() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Движение в равнина</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            💣 През XVI век артилеристите спорят как лети гюлето. Мнозина вярват, че то лети по права линия, докато „силата“ му не свърши, и
            чак тогава пада. Италианецът Николо Тарталя пише през 1537 г., че най-далеч стига гюлето, изстреляно под 45°. Обяснението идва
            едва след близо век: Галилей показва в „Беседи за две нови науки“ (1638), че хоризонталното и вертикалното движение се случват{' '}
            <strong>независимо едно от друго</strong> – и че заедно те дават <strong>парабола</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Скоростта е вектор</h2>
          <p className={text}>
            В равнината положението се задава с две координати <Tex>{'(x;\\ y)'}</Tex>, а преместването и скоростта са{' '}
            <strong>вектори</strong> – имат големина и посока (виж{' '}
            <Link to="/geometry/vectors" className={link}>
              Вектори
            </Link>
            ). Всеки вектор можем да разложим на две перпендикулярни компоненти и да работим с тях поотделно.
          </p>
          <Theorem
            title="Компоненти на скоростта"
            description="Ако скоростта $v$ сключва ъгъл $\alpha$ с хоризонталата, то $v_x = v\cos\alpha$ и $v_y = v\sin\alpha$. Обратно, $v = \sqrt{v_x^2 + v_y^2}$ и $\tg\alpha = \frac{v_y}{v_x}$."
          />
          <Example
            description="Топка е ритната с 20 m/s под ъгъл 30° спрямо земята. Колко са хоризонталната и вертикалната компонента на скоростта?"
            steps={[
              '$v_x = 20 \\cos 30^\\circ = 20 \\cdot \\frac{\\sqrt{3}}{2} \\approx 17{,}3\\ \\mathrm{m/s}$',
              '$v_y = 20 \\sin 30^\\circ = 20 \\cdot \\frac{1}{2} = 10\\ \\mathrm{m/s}$',
              'Проверка: $\\sqrt{17{,}3^2 + 10^2} \\approx 20\\ \\mathrm{m/s}$ ✓',
            ]}
          />
          <p className={text}>
            Стойностите на синуса и косинуса на 30°, 45° и 60° са в урока{' '}
            <Link to="/geometry/trigonometry" className={link}>
              Тригонометрия
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Хоризонтално хвърляне</h2>
          <Theorem
            title="Принцип за независимост на движенията"
            description="Ако съпротивлението на въздуха е пренебрежимо, хоризонталното и вертикалното движение протичат независимо. По хоризонтала няма сила – движението е равномерно. По вертикала тялото пада свободно с ускорение $g$."
          />
          <Theorem
            title="Хоризонтално хвърляне от височина $h$"
            description="$x = v_0 t$ и $y = h - \frac{gt^2}{2}$. Времето за падане $t = \sqrt{\frac{2h}{g}}$ не зависи от $v_0$, а далечината е $L = v_0\sqrt{\frac{2h}{g}}$. Скоростта при удара е $v = \sqrt{v_0^2 + 2gh}$."
          />
          <Example
            description="От 20 m височина хвърлят камък хоризонтално с 15 m/s ($g = 10\ \mathrm{m/s^2}$). Кога и къде пада и с каква скорост?"
            steps={[
              '$t = \\sqrt{\\frac{2 \\cdot 20}{10}} = 2\\ \\mathrm{s}$ – колкото и при пускане от покой.',
              '$L = 15 \\cdot 2 = 30\\ \\mathrm{m}$',
              '$v_y = gt = 20\\ \\mathrm{m/s}$, $v = \\sqrt{15^2 + 20^2} = 25\\ \\mathrm{m/s}$',
            ]}
          />
          <p className={text}>
            Това е изненадващо за мнозина: куршум, изстрелян хоризонтално, и куршум, изпуснат от същата височина, падат на земята{' '}
            <strong>едновременно</strong> (ако пренебрегнем въздуха и кривината на Земята). Вертикалното движение не „знае“ за хоризонталното –
            същата идея като в урока{' '}
            <Link to="/physics/mechanics/linear-motion" className={link}>
              Праволинейно движение
            </Link>
            , само по две оси наведнъж.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Хвърляне под ъгъл</h2>
          <Theorem
            title="Хвърляне под ъгъл $\alpha$ от земята"
            description="$x = v_0 \cos\alpha \cdot t$, $y = v_0 \sin\alpha \cdot t - \frac{gt^2}{2}$. Време на полета $T = \frac{2v_0\sin\alpha}{g}$, максимална височина $H = \frac{v_0^2\sin^2\alpha}{2g}$ и обхват $R = \frac{v_0^2\sin 2\alpha}{g}$."
          />
          <p className={text}>
            От формулата за обхвата следват два красиви извода. Понеже <Tex>{'\\sin 2\\alpha \\le 1'}</Tex>, най-далеч стига тялото при{' '}
            <Tex>{'2\\alpha = 90^\\circ'}</Tex>, т.е. <Tex>{'\\alpha = 45^\\circ'}</Tex>: <Tex>{'R_{\\max} = \\frac{v_0^2}{g}'}</Tex>. И понеже{' '}
            <Tex>{'\\sin 2\\alpha = \\sin(180^\\circ - 2\\alpha)'}</Tex>, ъглите <Tex>{'\\alpha'}</Tex> и <Tex>{'90^\\circ - \\alpha'}</Tex> дават{' '}
            <strong>един и същ обхват</strong> – по-високият полет просто трае по-дълго. При хвърляне от височина или със съпротивление на
            въздуха най-добрият ъгъл е по-малък от 45° – затова гюлетата и дисковете се хвърлят по-ниско.
          </p>
          <Example
            description="Футболист рита топката с 20 m/s под 30° ($g = 10\ \mathrm{m/s^2}$, без въздух). Колко време лети тя, колко високо стига и къде пада?"
            steps={[
              '$v_x = 17{,}3\\ \\mathrm{m/s}$, $v_y = 10\\ \\mathrm{m/s}$',
              '$T = \\frac{2 \\cdot 10}{10} = 2\\ \\mathrm{s}$, $H = \\frac{10^2}{2 \\cdot 10} = 5\\ \\mathrm{m}$',
              '$R = 17{,}3 \\cdot 2 \\approx 34{,}6\\ \\mathrm{m}$ (или $\\frac{400 \\sin 60^\\circ}{10}$)',
            ]}
          />
          <ProjectileLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Маймуната и ловецът</h2>
          <p className={text}>
            Класическа задача, с която физиците обичат да изненадват: ловец се цели право в маймуна на клон. В мига на изстрела маймуната се
            пуска, за да избегне стрелата. Улучва ли я ловецът? Да – винаги, ако стрелата изобщо стигне до дървото!
          </p>
          <Theorem
            title="Защо стрелата уцелва"
            description="Без гравитация стрелата би летяла по правата към маймуната, а маймуната би стояла на място. С гравитация и двете падат за време $t$ с едно и също разстояние $\frac{gt^2}{2}$ под мястото, където биха били без нея. Затова стрелата остава точно на една височина с маймуната, когато стигне до дървото."
          />
          <MonkeyHunterLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Относително движение</h2>
          <p className={text}>
            Скоростта зависи от това спрямо какво я мерим. Пътник, който върви в движещ се влак, има една скорост спрямо влака и друга спрямо
            перона.
          </p>
          <Theorem
            title="Събиране на скоростите"
            description="Скоростта на тялото спрямо земята е векторният сбор от скоростта му спрямо подвижната система и скоростта на самата система: $\vec{v} = \vec{u} + \vec{w}$. Ако двете са перпендикулярни, $v = \sqrt{u^2 + w^2}$."
          />
          <Example
            description="Река е широка 100 m, течението е 3 m/s, а лодката гребе с 5 m/s спрямо водата. Как да пресече най-бързо и как да стигне точно отсреща?"
            steps={[
              'Най-бързо: насочена право към брега. Тогава $t = \\frac{100}{5} = 20\\ \\mathrm{s}$, а течението я отнася на $3 \\cdot 20 = 60\\ \\mathrm{m}$.',
              'Точно отсреща: лодката се насочва срещу течението под ъгъл $\\beta$ с перпендикуляра, така че $5\\sin\\beta = 3$, т.е. $\\beta \\approx 36{,}9^\\circ$.',
              'Тогава към брега остават $\\sqrt{5^2 - 3^2} = 4\\ \\mathrm{m/s}$ и $t = \\frac{100}{4} = 25\\ \\mathrm{s}$ – по-дълго, но без отнасяне.',
            ]}
          />
          <RiverCrossingLab />
          <p className={text}>
            Същата идея обяснява защо при шофиране в дъжд капките по страничното стъкло оставят почти хоризонтални следи: спрямо колата те
            имат и голяма хоризонтална скорост назад. А в астрономията движението на планетите изглежда различно от Земята и от Слънцето –
            виж лекцията{' '}
            <Link to="/astronomy/lecture03" className={link}>
              Движение на Земята
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 1,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Движението в равнина около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Хоризонталната скорост „задържа“ тялото', 'хвърленото хоризонтално пада по-бавно', 'времето за падане зависи само от височината: $t = \\sqrt{2h/g}$'],
              ['Най-високата точка', '$v = 0$ в най-високата точка', 'там $v_y = 0$, но $v = v_x = v_0\\cos\\alpha$'],
              ['Формулата за обхвата', '$R = \\frac{v_0^2 \\sin \\alpha}{g}$', '$R = \\frac{v_0^2 \\sin 2\\alpha}{g}$'],
              ['Радиани вместо градуси', '$\\sin 30 \\approx -0{,}988$ на калкулатора', 'калкулаторът трябва да е в режим DEG: $\\sin 30^\\circ = 0{,}5$'],
              ['Събиране на скорости', '$4\\ \\mathrm{m/s} + 3\\ \\mathrm{m/s} = 7\\ \\mathrm{m/s}$ за лодката', 'перпендикулярните скорости се събират като вектори: $5\\ \\mathrm{m/s}$'],
              ['Най-кратко и най-бързо', 'най-краткият път е и най-бърз', 'най-бързо е перпендикулярно на брега; най-краткото е по-бавно'],
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
              <Task id="a1" number={1} color="border-green-500" question="Самолет излита със скорост 50 m/s под ъгъл 30° спрямо пистата. Колко са хоризонталната и вертикалната компонента на скоростта му?" check={[43.3, 25]} ask={['$v_x$, m/s', '$v_y$, m/s']}>
                <p><Tex>{'v_x = 50 \\cos 30^\\circ \\approx 43{,}3\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'v_y = 50 \\sin 30^\\circ = 25\\ \\mathrm{m/s}'}</Tex> – с толкова се изкачва всяка секунда.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="От скала, висока 45 m, хвърлят камък хоризонтално с 12 m/s ($g = 10\ \mathrm{m/s^2}$). След колко време и на какво разстояние от подножието пада?" check={[3, 36]} ask={['време, s', 'разстояние, m']}>
                <p><Tex>{'t = \\sqrt{\\frac{2 \\cdot 45}{10}} = 3\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'L = 12 \\cdot 3 = 36\\ \\mathrm{m}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Топка е хвърлена от земята с 20 m/s под 45° ($g = 10\ \mathrm{m/s^2}$). Колко е обхватът? Под какъв друг ъгъл освен 30° се получава същият обхват като при 30°?" check={[40, 60]} ask={['обхват при 45°, m', 'ъгъл, °']}>
                <p><Tex>{'R = \\frac{20^2 \\cdot \\sin 90^\\circ}{10} = 40\\ \\mathrm{m}'}</Tex></p>
                <p>Ъглите <Tex>{'\\alpha'}</Tex> и <Tex>{'90^\\circ - \\alpha'}</Tex> дават един и същ обхват, защото <Tex>{'\\sin 60^\\circ = \\sin 120^\\circ'}</Tex>: отговорът е <Tex>{'60^\\circ'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Тяло е хвърлено от земята с 20 m/s под 60° ($g = 10\ \mathrm{m/s^2}$). Намерете максималната височина и времето на полета." check={[15, 3.46]} ask={['височина, m', 'време, s']}>
                <p><Tex>{'v_y = 20 \\sin 60^\\circ = 10\\sqrt{3} \\approx 17{,}3\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'H = \\frac{v_y^2}{2g} = \\frac{300}{20} = 15\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'T = \\frac{2v_y}{g} = 2\\sqrt{3} \\approx 3{,}46\\ \\mathrm{s}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Лодка гребе с 5 m/s спрямо водата през река, широка 100 m, с течение 3 m/s. Под какъв ъгъл спрямо перпендикуляра на брега трябва да се насочи срещу течението, за да стигне точно отсреща, и за колко време?" check={[36.9, 25]} ask={['ъгъл, °', 'време, s']}>
                <p>Компонентата срещу течението трябва да го уравновеси: <Tex>{'5\\sin\\beta = 3 \\Rightarrow \\beta \\approx 36{,}9^\\circ'}</Tex></p>
                <p>Към брега остава <Tex>{'5\\cos\\beta = 4\\ \\mathrm{m/s}'}</Tex>, значи <Tex>{'t = \\frac{100}{4} = 25\\ \\mathrm{s}'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Камък е хвърлен хоризонтално с 15 m/s от 20 m височина ($g = 10\ \mathrm{m/s^2}$). С каква скорост и под какъв ъгъл спрямо хоризонталата удря земята?" check={[25, 53.1]} ask={['скорост, m/s', 'ъгъл, °']}>
                <p><Tex>{'v_y = \\sqrt{2gh} = \\sqrt{400} = 20\\ \\mathrm{m/s}'}</Tex>, а <Tex>{'v_x = 15\\ \\mathrm{m/s}'}</Tex> не се мени.</p>
                <p><Tex>{'v = \\sqrt{15^2 + 20^2} = 25\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'\\tg\\varphi = \\frac{20}{15} \\Rightarrow \\varphi \\approx 53{,}1^\\circ'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="От ръба на скала, висока 15 m, хвърлят камък с 20 m/s под 30° нагоре ($g = 10\ \mathrm{m/s^2}$). След колко време и на какво разстояние от подножието пада той?" check={[3, 52]} ask={['време, s', 'разстояние, m']}>
                <p>С ос нагоре от подножието: <Tex>{'y = 15 + 10t - 5t^2'}</Tex>.</p>
                <p><Tex>{'5t^2 - 10t - 15 = 0 \\Rightarrow t^2 - 2t - 3 = 0 \\Rightarrow t = 3\\ \\mathrm{s}'}</Tex> (другият корен е отрицателен).</p>
                <p><Tex>{'x = 20\\cos 30^\\circ \\cdot 3 \\approx 17{,}32 \\cdot 3 \\approx 52{,}0\\ \\mathrm{m}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Под какъв ъгъл трябва да се хвърли тяло от земята, за да е максималната му височина равна на обхвата?" check={[76]} ask={['ъгъл, °']}>
                <p><Tex>{'\\frac{v_0^2\\sin^2\\alpha}{2g} = \\frac{2v_0^2\\sin\\alpha\\cos\\alpha}{g}'}</Tex></p>
                <p>Делим на <Tex>{'\\frac{v_0^2\\sin\\alpha}{g} \\ne 0'}</Tex>: <Tex>{'\\frac{\\sin\\alpha}{2} = 2\\cos\\alpha \\Rightarrow \\tg\\alpha = 4'}</Tex>.</p>
                <p><Tex>{'\\alpha \\approx 76{,}0^\\circ'}</Tex> – отговорът не зависи нито от скоростта, нито от <Tex>{'g'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Ловец е на 20 m (по хоризонтала) от дърво, а маймуната е на клон на 15 m височина. Стрелата излита с 30 m/s, насочена право към маймуната, а тя се пуска в същия миг ($g = 10\ \mathrm{m/s^2}$). След колко време стрелата стига до дървото и на каква височина я улучва?" check={[0.833, 11.5]} ask={['време, s', 'височина, m']}>
                <p>Разстоянието до маймуната е <Tex>{'\\sqrt{20^2 + 15^2} = 25\\ \\mathrm{m}'}</Tex>, значи <Tex>{'\\cos\\alpha = \\frac{20}{25} = 0{,}8'}</Tex>.</p>
                <p><Tex>{'t = \\frac{20}{30 \\cdot 0{,}8} \\approx 0{,}833\\ \\mathrm{s}'}</Tex></p>
                <p>За това време и двете падат с <Tex>{'5t^2 \\approx 3{,}47\\ \\mathrm{m}'}</Tex> под мястото си без гравитация.</p>
                <p>Срещат се на <Tex>{'15 - 3{,}47 \\approx 11{,}5\\ \\mathrm{m}'}</Tex> височина.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Скоростта е вектор: <Tex>{'v_x = v\\cos\\alpha'}</Tex>, <Tex>{'v_y = v\\sin\\alpha'}</Tex></li>
              <li>✓ Хоризонталното и вертикалното движение са независими: по хоризонтала – равномерно, по вертикала – свободно падане</li>
              <li>✓ Хоризонтално хвърляне: <Tex>{'t = \\sqrt{2h/g}'}</Tex>, <Tex>{'L = v_0 t'}</Tex></li>
              <li>✓ Под ъгъл: <Tex>{'T = \\frac{2v_0\\sin\\alpha}{g}'}</Tex>, <Tex>{'H = \\frac{v_0^2\\sin^2\\alpha}{2g}'}</Tex>, <Tex>{'R = \\frac{v_0^2\\sin 2\\alpha}{g}'}</Tex>; най-далеч при 45°</li>
              <li>✓ Траекторията без въздух е парабола; ъглите <Tex>{'\\alpha'}</Tex> и <Tex>{'90^\\circ - \\alpha'}</Tex> дават еднакъв обхват</li>
              <li>✓ Относителна скорост: <Tex>{'\\vec{v} = \\vec{u} + \\vec{w}'}</Tex>; реката се пресича най-бързо перпендикулярно на брега</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През февруари 1971 г. астронавтът Алан Шепърд (Аполо 14) изважда на Луната импровизиран стик и удря две топки за голф. Там{' '}
              <Tex>{'g'}</Tex> е около 6 пъти по-малко, а въздух няма, така че при същия удар топката би летяла около 6 пъти по-далеч. Шепърд
              казва, че втората топка лети „мили и мили“, но анализ на снимките, публикуван през 2021 г., оценява, че по-далечната е паднала на
              около 37 m – скафандърът почти не му позволява да замахне. Гравитацията на Луната е в лекцията{' '}
              <Link to="/astronomy/lecture06" className="text-blue-600 dark:text-blue-400 hover:underline">
                Гравитация
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
