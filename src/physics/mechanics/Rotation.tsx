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
import CircularMotionLab from './CircularMotionLab';
import RollingRaceLab from './RollingRaceLab';
import SkaterLab from './SkaterLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 12.5 → 12{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const SHAPES = [
  { name: 'обръч', kn: 1, kd: 1, tex: 'mR^2' },
  { name: 'плътен диск', kn: 1, kd: 2, tex: '\\frac{1}{2}mR^2' },
  { name: 'плътно кълбо', kn: 2, kd: 5, tex: '\\frac{2}{5}mR^2' },
];

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const n = pick([30, 60, 120, 240, 300]);
    return {
      tex: `n = ${n}\\ \\text{об/мин}`,
      ask: 'Период: $T = ?\\ \\mathrm{s}$',
      num: 60,
      den: n,
      steps: [`За една минута (60 s) колелото прави ${n} оборота.`, `$T = \\frac{60}{${n}} = ${dec(60 / n)}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 1) {
    const [w, rt] = [pick([2, 4, 5, 10]), pick([5, 15, 20, 30])];
    return {
      tex: `\\omega = ${w}\\ \\mathrm{rad/s}, \\quad r = ${dec(rt / 10)}\\ \\mathrm{m}`,
      ask: 'Линейна скорост: $v = ?\\ \\mathrm{m/s}$',
      num: w * rt,
      den: 10,
      steps: [`$v = \\omega r = ${w} \\cdot ${dec(rt / 10)} = ${dec((w * rt) / 10)}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 2) {
    const [v, r] = [pick([2, 4, 6, 10]), pick([2, 4, 5, 8, 10])];
    return {
      tex: `v = ${v}\\ \\mathrm{m/s}, \\quad r = ${r}\\ \\mathrm{m}`,
      ask: 'Центростремително ускорение: $a = ?\\ \\mathrm{m/s^2}$',
      num: v * v,
      den: r,
      steps: [`$a = \\frac{v^2}{r} = \\frac{${v * v}}{${r}} = ${dec((v * v) / r)}\\ \\mathrm{m/s^2}$`],
    };
  }
  if (kind === 3) {
    const [m, v, r] = [pick([2, 5, 10]), pick([2, 4, 6]), pick([2, 4, 8])];
    return {
      tex: `m = ${m}\\ \\mathrm{kg}, \\quad v = ${v}\\ \\mathrm{m/s}, \\quad r = ${r}\\ \\mathrm{m}`,
      ask: 'Центростремителна сила: $F = ?\\ \\mathrm{N}$',
      num: m * v * v,
      den: r,
      steps: [`$F = \\frac{mv^2}{r} = \\frac{${m} \\cdot ${v * v}}{${r}} = ${dec((m * v * v) / r)}\\ \\mathrm{N}$`],
    };
  }
  if (kind === 4) {
    const [s, m, rt] = [pick(SHAPES), pick([2, 4, 5, 10]), pick([5, 10, 20])];
    return {
      tex: `m = ${m}\\ \\mathrm{kg}, \\quad R = ${dec(rt / 10)}\\ \\mathrm{m}`,
      ask: `Инерчен момент на ${s.name} спрямо оста му: $I = ?\\ \\mathrm{kg \\cdot m^2}$`,
      num: m * rt * rt * s.kn,
      den: 100 * s.kd,
      steps: [`За ${s.name}: $I = ${s.tex}$`, `$I = ${s.kn === 1 && s.kd === 1 ? '' : `\\frac{${s.kn}}{${s.kd}} \\cdot `}${m} \\cdot ${dec(rt / 10)}^2 = ${dec((m * rt * rt * s.kn) / (100 * s.kd))}\\ \\mathrm{kg \\cdot m^2}$`],
    };
  }
  if (kind === 5) {
    const [I1, w1, I2] = [pick([4, 6]), pick([2, 3]), pick([1, 2, 3])];
    return {
      tex: `I_1 = ${I1}\\ \\mathrm{kg \\cdot m^2}, \\quad \\omega_1 = ${w1}\\ \\mathrm{rad/s}, \\quad I_2 = ${I2}\\ \\mathrm{kg \\cdot m^2}`,
      ask: 'Моментът на импулса се запазва: $\\omega_2 = ?\\ \\mathrm{rad/s}$',
      num: I1 * w1,
      den: I2,
      steps: [`$I_1 \\omega_1 = I_2 \\omega_2$`, `$\\omega_2 = \\frac{${I1} \\cdot ${w1}}{${I2}} = ${dec((I1 * w1) / I2)}\\ \\mathrm{rad/s}$`],
    };
  }
  const ring = randInt(0, 1) === 1;
  const v = pick([2, 4, 6]);
  // обръч: v² = gh; диск: v² = 4gh/3 (g = 10)
  const h = ring ? (v * v) / 10 : (3 * v * v) / 40;
  return {
    tex: `h = ${dec(h)}\\ \\mathrm{m}, \\quad g = 10\\ \\mathrm{m/s^2}`,
    ask: `${ring ? 'Обръч' : 'Плътен цилиндър'} се търкаля без плъзгане от покой. Скорост долу: $v = ?\\ \\mathrm{m/s}$`,
    num: v,
    den: 1,
    steps: [
      ring ? '$mgh = \\frac{mv^2}{2} + \\frac{mR^2 \\omega^2}{2} = mv^2 \\Rightarrow v = \\sqrt{gh}$' : '$mgh = \\frac{mv^2}{2} + \\frac{1}{2} \\cdot \\frac{mR^2\\omega^2}{2} = \\frac{3}{4}mv^2 \\Rightarrow v = \\sqrt{\\frac{4gh}{3}}$',
      `$v = \\sqrt{${ring ? `10 \\cdot ${dec(h)}` : `\\frac{4 \\cdot 10 \\cdot ${dec(h)}}{3}`}} = \\sqrt{${v * v}} = ${v}\\ \\mathrm{m/s}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🌍 Въртим се и без да усещаме',
    problem: 'Земята се завърта около оста си спрямо звездите за около 23 h 56 min (86 164 s), а радиусът ѝ на екватора е 6378 km. С каква скорост се движи човек на екватора?',
    solution: ['$v = \\frac{2\\pi R}{T} = \\frac{2\\pi \\cdot 6{,}378 \\cdot 10^6}{86\\,164} \\approx 465\\ \\mathrm{m/s}$', 'Това са около 1670 km/h – повече от скоростта на звука. Не го усещаме, защото движението е почти равномерно.'],
    answer: '$\\approx 465\\ \\mathrm{m/s}$',
    check: [465],
    ask: ['скорост, m/s'],
  },
  {
    title: '🚴 Наклон в завоя',
    problem: 'Велосипедист взема завой с радиус 20 m със скорост 36 km/h. На какъв ъгъл от вертикалата трябва да се наклони? ($g = 9{,}81\\ \\mathrm{m/s^2}$)',
    solution: ['$v = 10\\ \\mathrm{m/s}$. Силата от пътя (нормална плюс триене) трябва да минава през центъра на масата.', 'Хоризонталната ѝ част дава $\\frac{mv^2}{r}$, а вертикалната уравновесява $mg$: $\\operatorname{tg}\\theta = \\frac{v^2}{rg} = \\frac{100}{196{,}2} \\approx 0{,}510$', '$\\theta \\approx 27{,}0^\\circ$'],
    answer: '$\\approx 27{,}0^\\circ$',
    check: [27],
    ask: ['ъгъл, °'],
  },
  {
    title: '🧑‍🚀 Центрофуга за космонавти',
    problem: 'Космонавтите тренират в центрофуга с радиус 8 m. Колко оборота в минута трябва да прави тя, за да е центростремителното ускорение 5g? ($g = 9{,}81\\ \\mathrm{m/s^2}$)',
    solution: ['$\\omega^2 r = 5g \\Rightarrow \\omega = \\sqrt{\\frac{5 \\cdot 9{,}81}{8}} \\approx 2{,}48\\ \\mathrm{rad/s}$', '$n = \\frac{\\omega}{2\\pi} \\cdot 60 \\approx 23{,}6$ оборота в минута'],
    answer: '$\\approx 23{,}6$ об/мин',
    check: [23.6],
    ask: ['об/мин'],
  },
  {
    title: '🧺 Центрофугата на пералнята',
    problem: 'Барабанът на пералня има радиус 25 cm и центрофугира с 1200 оборота в минута. Колко пъти центростремителното ускорение е по-голямо от $g = 9{,}81\\ \\mathrm{m/s^2}$?',
    solution: ['$\\omega = \\frac{2\\pi \\cdot 1200}{60} \\approx 126\\ \\mathrm{rad/s}$', '$a = \\omega^2 r \\approx 126^2 \\cdot 0{,}25 \\approx 3950\\ \\mathrm{m/s^2}$', '$\\frac{a}{g} \\approx 402$ – затова водата излита през дупките, а дрехите остават.'],
    answer: '$\\approx 402$ пъти',
    check: [402],
    ask: ['пъти'],
  },
  {
    title: '⛸️ Пирует',
    problem: 'Фигуристка се върти с 2 оборота в секунда с разперени ръце (инерчен момент 3,5 kg·m²). Тя прибира ръцете си и инерчният ѝ момент става 1,0 kg·m². Колко оборота в секунда прави сега?',
    solution: ['Моментът на импулса се запазва: $I_1 \\omega_1 = I_2 \\omega_2$', '$\\omega_2 = \\frac{3{,}5 \\cdot 2}{1{,}0} = 7$ оборота в секунда'],
    answer: '7 об/s',
    check: [7],
    ask: ['об/s'],
  },
  {
    title: '🚲 Колелото на велосипеда',
    problem: 'Колелото на велосипед има диаметър 70 cm. Колко оборота в минута прави то, когато велосипедът се движи с 18 km/h без плъзгане?',
    solution: ['$v = 18 : 3{,}6 = 5\\ \\mathrm{m/s}$; при търкаляне $v = \\omega R$', '$\\omega = \\frac{5}{0{,}35} \\approx 14{,}3\\ \\mathrm{rad/s}$', '$n = \\frac{14{,}3}{2\\pi} \\cdot 60 \\approx 136$ оборота в минута'],
    answer: '$\\approx 136$ об/мин',
    check: [136],
    ask: ['об/мин'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'В каква единица се измерва ъгловата скорост?',
    answers: ['$\\mathrm{rad/s}$', '$\\mathrm{m/s}$', '$\\mathrm{rad/s^2}$', '$\\mathrm{N \\cdot m}$'],
    correctAnswer: '$\\mathrm{rad/s}$',
  },
  {
    question: 'Накъде сочи ускорението на тяло, което се движи равномерно по окръжност?',
    answers: ['към центъра', 'по допирателната', 'навън от центъра', 'ускорението е нула'],
    correctAnswer: 'към центъра',
  },
  {
    question: 'Как се променя центростремителното ускорение, ако скоростта се удвои при същия радиус?',
    answers: ['нараства 4 пъти', 'нараства 2 пъти', 'не се променя', 'намалява 2 пъти'],
    correctAnswer: 'нараства 4 пъти',
  },
  {
    question: 'Топче се върти на връв. Ако връвта се скъса, топчето се движи:',
    answers: ['по допирателната към окръжността', 'по радиуса навън', 'по спирала навън', 'продължава по окръжността'],
    correctAnswer: 'по допирателната към окръжността',
  },
  {
    question: 'Обръч, плътен цилиндър и плътно кълбо се търкалят без плъзгане по един и същ наклон. Кое стига първо долу?',
    answers: ['кълбото', 'цилиндърът', 'обръчът', 'стигат едновременно'],
    correctAnswer: 'кълбото',
  },
  {
    question: 'Колко е инерчният момент на тънък обръч с маса $m$ и радиус $R$ спрямо оста му?',
    answers: ['$mR^2$', '$\\frac{1}{2}mR^2$', '$\\frac{2}{5}mR^2$', '$2mR^2$'],
    correctAnswer: '$mR^2$',
  },
  {
    question: 'Фигуристка прибира ръцете си по време на пирует. Какво става с ъгловата ѝ скорост?',
    answers: ['нараства', 'намалява', 'не се променя', 'става нула'],
    correctAnswer: 'нараства',
  },
  {
    question: 'Каква е най-малката скорост в най-горната точка на лупинг с радиус $r$, за да не падне количката?',
    answers: ['$\\sqrt{gr}$', '$\\sqrt{2gr}$', '$gr$', '$0$'],
    correctAnswer: '$\\sqrt{gr}$',
  },
  {
    question: 'Сила 20 N действа перпендикулярно на гаечен ключ на 0,5 m от оста. Колко е моментът ѝ?',
    answers: ['$10\\ \\mathrm{N \\cdot m}$', '$40\\ \\mathrm{N \\cdot m}$', '$20{,}5\\ \\mathrm{N \\cdot m}$', '$0{,}025\\ \\mathrm{N \\cdot m}$'],
    correctAnswer: '$10\\ \\mathrm{N \\cdot m}$',
  },
];

// ---------- Страница ----------

export function Rotation() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Въртене</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🐈 През 1894 г. френският физиолог Етиен-Жюл Маре снима с бърза камера падаща котка – около 12 кадъра в секунда. Котката е пусната
            с краката нагоре, без да се върти, и все пак каца на четирите си лапи. Снимките смущават учените: щом в началото котката не се върти,
            моментът на импулса ѝ е нула и би трябвало да остане нула. Как тогава се обръща? Отговорът е хитър – котката върти отделните части на
            тялото си в различни посоки и сгъва и разгъва лапите си, така че <strong>общият момент на импулса</strong> остава нула през цялото
            време. В този урок ще разберем защо въртенето се подчинява на свои закони.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Равномерно движение по окръжност</h2>
          <p className={text}>
            Колело, въртележка, стрелка на часовник, точка от Земята – всички се движат по окръжности. Ъгълът на завъртане измерваме в{' '}
            <strong>радиани</strong>: ъгъл <Tex>{'\\varphi'}</Tex> обхваща дъга с дължина <Tex>{'s = \\varphi r'}</Tex>, а пълният оборот е{' '}
            <Tex>{'2\\pi'}</Tex> rad (виж{' '}
            <Link to="/geometry/circle" className={link}>
              Окръжност и кръг
            </Link>
            ).
          </p>
          <Theorem
            type="definition"
            title="Период, честота и ъглова скорост"
            description="Периодът $T$ е времето за един оборот, а честотата $\nu = \frac{1}{T}$ – броят обороти за секунда (единица $\mathrm{Hz}$). Ъгловата скорост $\omega = \frac{\Delta\varphi}{\Delta t} = \frac{2\pi}{T}$ се мери в $\mathrm{rad/s}$. Линейната скорост на точка на разстояние $r$ от оста е $v = \omega r = \frac{2\pi r}{T}$."
          />
          <Example
            description="С каква скорост се движи връхчето на секундната стрелка на часовник, ако тя е дълга 15 cm?"
            steps={['$T = 60\\ \\mathrm{s}$, $\\omega = \\frac{2\\pi}{60} \\approx 0{,}105\\ \\mathrm{rad/s}$', '$v = \\omega r \\approx 0{,}105 \\cdot 0{,}15 \\approx 0{,}0157\\ \\mathrm{m/s} = 1{,}57\\ \\mathrm{cm/s}$', 'Всички точки на стрелката имат една и съща $\\omega$, но различни $v$ – най-бързо се движи връхчето.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Центростремително ускорение и сила</h2>
          <p className={text}>
            При <Term id="uniform-motion">равномерно движение</Term> по окръжност големината на скоростта е постоянна, но посоката ѝ непрекъснато се мени. Значи има <Term id="acceleration">ускорение</Term> –
            и то сочи към центъра.
          </p>
          <Theorem
            title="Центростремително ускорение"
            description="Тяло, което се движи по окръжност с радиус $r$ със скорост $v$, има ускорение $a = \frac{v^2}{r} = \omega^2 r$, насочено към центъра. По втория закон на Нютон за това е нужна резултантна сила $F = \frac{mv^2}{r}$, също към центъра."
          />
          <p className={text}>
            Центростремителната сила <strong>не е нова сила</strong> – това е името на резултантната на истинските сили: <Term id="tension">опънът</Term> на връвта,{' '}
            <Term id="friction">триенето</Term> на гумите в завоя, гравитацията при спътника (виж{' '}
            <Link to="/physics/mechanics/newton" className={link}>
              Закони на Нютон
            </Link>{' '}
            и{' '}
            <Link to="/astronomy/lecture08" className={link}>
              Орбити и скорости
            </Link>
            ). „Центробежната сила“, която усещаш в завиващия автобус, се появява само в <Term id="reference-frame">отправната система</Term> на автобуса: всъщност тялото ти иска
            да продължи направо, а автобусът завива под него.
          </p>
          <CircularMotionLab />
          <Example
            description="С каква най-голяма скорост кола може да вземе хоризонтален завой с радиус 50 m, ако коефициентът на триене между гумите и пътя е 0,7?"
            steps={[
              'Центростремителната сила е силата на триене при покой: $\\frac{mv^2}{r} \\le \\mu mg$',
              'Масата се съкращава: $v_{\\max} = \\sqrt{\\mu g r} = \\sqrt{0{,}7 \\cdot 9{,}81 \\cdot 50} \\approx 18{,}5\\ \\mathrm{m/s}$',
              'Това са около 66,7 km/h. На мокър път $\\mu$ е по-малко и безопасната скорост пада. Затова завоите по магистралите са наклонени: така част от нужната сила идва от нормалната сила на пътя.',
            ]}
          />
          <Example
            description="Количка минава по лупинг с радиус 10 m. Каква е най-малката скорост в най-горната точка, при която тя не се отделя от релсата?"
            steps={[
              'Горе и теглото, и нормалната сила сочат надолу – към центъра: $mg + N = \\frac{mv^2}{r}$',
              'Най-малката скорост е при $N = 0$: $v = \\sqrt{gr} = \\sqrt{9{,}81 \\cdot 10} \\approx 9{,}90\\ \\mathrm{m/s}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Момент на сила и инерчен момент</h2>
          <p className={text}>
            Една и съща сила завърта вратата много по-лесно, ако буташ далеч от пантите. Въртящото действие на силата зависи от нея и от{' '}
            <strong>рамото</strong> ѝ.
          </p>
          <Theorem
            type="definition"
            title="Момент на сила"
            description="Моментът на сила спрямо ос е $M = F \cdot d$, където рамото $d$ е перпендикулярното разстояние от оста до линията, по която действа силата. Единицата е $\mathrm{N \cdot m}$. Равновесието на моментите (лостове, везни) разглеждаме в урока „Статика и флуиди“."
          />
          <Theorem
            title="Основен закон за въртенето"
            description="Моментът на силите определя ъгловото ускорение: $M = I\alpha$, където $\alpha = \frac{\Delta\omega}{\Delta t}$, а инерчният момент $I = \sum m_i r_i^2$ показва колко трудно се завърта тялото. Обръч: $I = mR^2$; плътен диск или цилиндър: $I = \frac{1}{2}mR^2$; плътно кълбо: $I = \frac{2}{5}mR^2$ (всички спрямо оста през центъра)."
          />
          <p className={text}>
            Сравни с <Tex>{'F = ma'}</Tex>: моментът играе ролята на силата, ъгловото ускорение – на ускорението, а инерчният момент – на масата.
            Но <Tex>{'I'}</Tex> зависи не само от масата, а и от това <strong>как</strong> е разпределена: масата далеч от оста „тежи“ повече.
          </p>
          <Example
            description="Маховик е плътен диск с маса 10 kg и радиус 0,3 m. Двигател го завърта с момент 4,5 N·m. Какво е ъгловото ускорение?"
            steps={['$I = \\frac{1}{2}mR^2 = \\frac{1}{2} \\cdot 10 \\cdot 0{,}09 = 0{,}45\\ \\mathrm{kg \\cdot m^2}$', '$\\alpha = \\frac{M}{I} = \\frac{4{,}5}{0{,}45} = 10\\ \\mathrm{rad/s^2}$ – за всяка секунда ъгловата скорост расте с 10 rad/s.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Енергия при въртене и търкаляне</h2>
          <Theorem
            title="Кинетична енергия на въртене"
            description="Въртящо се тяло има кинетична енергия $E = \frac{I\omega^2}{2}$. Тяло, което се търкаля без плъзгане, едновременно се движи и се върти, като $v = \omega R$: $E = \frac{mv^2}{2} + \frac{I\omega^2}{2}$. Ако $I = kmR^2$, това е $E = (1 + k)\frac{mv^2}{2}$."
          />
          <p className={text}>
            Когато тяло се търкаля по наклон, <Term id="potential-energy">потенциалната енергия</Term> се разделя между движението напред и въртенето (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ). От <Tex>{'mgh = (1 + k)\\frac{mv^2}{2}'}</Tex> следва <Tex>{'v = \\sqrt{\\frac{2gh}{1 + k}}'}</Tex> – скоростта не зависи нито от
            масата, нито от радиуса, а само от формата.
          </p>
          <RollingRaceLab />
          <Example
            description="Плътно кълбо и обръч се търкалят от покой по наклон с височина 1 m. Каква скорост имат долу?"
            steps={['Кълбо ($k = 0{,}4$): $v = \\sqrt{\\frac{2 \\cdot 9{,}81 \\cdot 1}{1{,}4}} \\approx 3{,}74\\ \\mathrm{m/s}$', 'Обръч ($k = 1$): $v = \\sqrt{9{,}81} \\approx 3{,}13\\ \\mathrm{m/s}$', 'Без търкаляне (плъзгане без триене) скоростта би била $\\sqrt{2gh} \\approx 4{,}43\\ \\mathrm{m/s}$.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Момент на импулса</h2>
          <Theorem
            title="Закон за запазване на момента на импулса"
            description="Моментът на импулса на въртящо се тяло е $L = I\omega$. Ако върху тялото не действа външен момент на сила, $L$ се запазва: $I_1\omega_1 = I_2\omega_2$. Когато $I$ намалее, $\omega$ се увеличава."
          />
          <p className={text}>
            Затова фигуристката се завърта по-бързо, като прибере ръцете си, скачачът във вода се свива на топка, за да направи повече салта, а
            котката от началото на урока може да се обърне, като върти частите на тялото си една срещу друга.
          </p>
          <SkaterLab />
          <Example
            description="Мислен опит: ако Слънцето (период на въртене около 25 дни, радиус 696 000 km) се свие до кълбо с радиус 12 km, без да губи маса, колко бързо ще се върти? Да приемем грубо, че остава еднородно кълбо."
            steps={[
              '$I \\propto R^2$, значи $\\omega_2 = \\omega_1\\left(\\frac{R_1}{R_2}\\right)^2$, а периодът $T_2 = T_1\\left(\\frac{R_2}{R_1}\\right)^2$',
              '$T_2 = 25 \\cdot 86\\,400 \\cdot \\left(\\frac{12}{696\\,000}\\right)^2 \\approx 6{,}4 \\cdot 10^{-4}\\ \\mathrm{s}$ – около 1600 оборота в секунда.',
              'Слънцето няма да стане неутронна звезда, но този ефект обяснява защо неутронните звезди (пулсарите) се въртят толкова бързо.',
            ]}
          />
          <p className={text}>
            Повече за <Term id="neutron-star">неутронните звезди</Term> – в урока{' '}
            <Link to="/astronomy/lecture21" className={link}>
              Бели джуджета и черни дупки
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 0,25.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Въртенето около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Центробежна сила', 'върху топчето действа сила навън', 'в инерциална система резултантната сочи към центъра; „центробежната“ е ефект на въртящата се система'],
              ['Обороти вместо радиани', '$\\omega = 120\\ \\text{об/мин} \\Rightarrow v = 120r$', 'първо $\\omega = \\frac{2\\pi \\cdot 120}{60} \\approx 12{,}6\\ \\mathrm{rad/s}$'],
              ['Рамо на силата', 'рамото е разстоянието до точката на прилагане', 'рамото е перпендикулярът от оста до линията на силата'],
              ['Енергия при търкаляне', '$E = \\frac{mv^2}{2}$', '$E = \\frac{mv^2}{2} + \\frac{I\\omega^2}{2}$'],
              ['Тежкото се търкаля по-бързо', 'по-масивното кълбо стига първо', 'времето зависи само от формата ($k$), не от масата и радиуса'],
              ['Енергия при пирует', 'запазва се енергията', 'запазва се $L = I\\omega$; енергията расте за сметка на работата на мускулите'],
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
              <Task id="a1" number={1} color="border-green-500" question="Секундната стрелка на стенен часовник е дълга 15 cm. Намерете ъгловата ѝ скорост и скоростта на връхчето в cm/s." check={[0.105, 1.57]} ask={['$\\omega$, rad/s', '$v$, cm/s']}>
                <p><Tex>{'T = 60\\ \\mathrm{s}'}</Tex>, <Tex>{'\\omega = \\frac{2\\pi}{60} \\approx 0{,}105\\ \\mathrm{rad/s}'}</Tex></p>
                <p><Tex>{'v = \\omega r = 0{,}105 \\cdot 15 \\approx 1{,}57\\ \\mathrm{cm/s}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Кола с маса 1200 kg минава с 72 km/h през завой с радиус 100 m. Намерете центростремителното ускорение и нужната сила." check={[4, 4800]} ask={['$a$, m/s²', '$F$, N']}>
                <p><Tex>{'v = 72 : 3{,}6 = 20\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'a = \\frac{v^2}{r} = \\frac{400}{100} = 4\\ \\mathrm{m/s^2}'}</Tex></p>
                <p><Tex>{'F = ma = 1200 \\cdot 4 = 4800\\ \\mathrm{N}'}</Tex> – осигурява я триенето между гумите и пътя.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Плътен диск и тънък обръч имат еднаква маса 2 kg и еднакъв радиус 0,3 m. Намерете инерчните им моменти спрямо оста през центъра." check={[0.09, 0.18]} ask={['диск, kg·m²', 'обръч, kg·m²']}>
                <p>Диск: <Tex>{'I = \\frac{1}{2}mR^2 = \\frac{1}{2} \\cdot 2 \\cdot 0{,}09 = 0{,}09\\ \\mathrm{kg \\cdot m^2}'}</Tex></p>
                <p>Обръч: <Tex>{'I = mR^2 = 2 \\cdot 0{,}09 = 0{,}18\\ \\mathrm{kg \\cdot m^2}'}</Tex> – двойно повече, защото цялата маса е на ръба.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Завой с радиус 100 m е проектиран така, че кола с 72 km/h да го взема без помощта на триенето. Под какъв ъгъл е наклонено платното? ($g = 9{,}81\ \mathrm{m/s^2}$)" check={[22.2]} ask={['ъгъл, °']}>
                <p>Без триене действат само теглото <Tex>{'mg'}</Tex> и нормалната сила <Tex>{'N'}</Tex>, перпендикулярна на наклонения път.</p>
                <p>Вертикално: <Tex>{'N\\cos\\alpha = mg'}</Tex>; хоризонтално: <Tex>{'N\\sin\\alpha = \\frac{mv^2}{r}'}</Tex>.</p>
                <p><Tex>{'\\operatorname{tg}\\alpha = \\frac{v^2}{rg} = \\frac{400}{981} \\approx 0{,}408 \\Rightarrow \\alpha \\approx 22{,}2^\\circ'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Макара е плътен диск с маса 4 kg и радиус 0,2 m и може да се върти без триене. Около нея е навито въже, което дърпаме с постоянна сила 10 N. Намерете ъгловото ускорение и ъгловата скорост след 2 s от покой." check={[25, 50]} ask={['$\\alpha$, rad/s²', '$\\omega$, rad/s']}>
                <p><Tex>{'I = \\frac{1}{2} \\cdot 4 \\cdot 0{,}2^2 = 0{,}08\\ \\mathrm{kg \\cdot m^2}'}</Tex>, <Tex>{'M = F R = 10 \\cdot 0{,}2 = 2\\ \\mathrm{N \\cdot m}'}</Tex></p>
                <p><Tex>{'\\alpha = \\frac{M}{I} = \\frac{2}{0{,}08} = 25\\ \\mathrm{rad/s^2}'}</Tex></p>
                <p><Tex>{'\\omega = \\alpha t = 25 \\cdot 2 = 50\\ \\mathrm{rad/s}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Плътен цилиндър се търкаля без плъзгане от покой по наклон с височина 1,2 m. Каква е скоростта му долу? С колко процента е по-малка от скоростта на тяло, което се плъзга без триене от същата височина? ($g = 9{,}81\ \mathrm{m/s^2}$)" check={[3.96, 18.4]} ask={['скорост, m/s', 'по-малка с, %']}>
                <p><Tex>{'mgh = \\frac{mv^2}{2} + \\frac{1}{2}\\cdot\\frac{mR^2\\omega^2}{2} = \\frac{3}{4}mv^2'}</Tex></p>
                <p><Tex>{'v = \\sqrt{\\frac{4gh}{3}} = \\sqrt{\\frac{4 \\cdot 9{,}81 \\cdot 1{,}2}{3}} \\approx 3{,}96\\ \\mathrm{m/s}'}</Tex></p>
                <p>При плъзгане <Tex>{'v = \\sqrt{2gh} \\approx 4{,}85\\ \\mathrm{m/s}'}</Tex>; отношението е <Tex>{'\\sqrt{\\frac{2}{3}} \\approx 0{,}816'}</Tex>, т.е. скоростта е по-малка с около 18,4%.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Малко плътно топче се търкаля без плъзгане по улей с лупинг с радиус $R = 0{,}5\ \mathrm{m}$. От каква най-малка височина $h$ над най-ниската точка трябва да тръгне от покой, за да мине лупинга? Намерете $h/R$ и $h$ (размера на топчето пренебрегваме)." check={[2.7, 1.35]} ask={['$h/R$', '$h$, m']}>
                <p>Горе трябва <Tex>{'v^2 \\ge gR'}</Tex> (както при плъзгане).</p>
                <p>Енергия при търкаляне на кълбо: <Tex>{'mgh = mg \\cdot 2R + \\frac{7}{10}mv^2'}</Tex>, защото <Tex>{'(1 + 0{,}4)\\frac{mv^2}{2} = \\frac{7}{10}mv^2'}</Tex>.</p>
                <p><Tex>{'h = 2R + \\frac{7}{10}R = 2{,}7R = 1{,}35\\ \\mathrm{m}'}</Tex> (при плъзгане без триене би стигнало <Tex>{'2{,}5R'}</Tex>).</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Йо-йо е плътен диск с радиус $R = 3\ \mathrm{cm}$, а конецът е навит на тънка ос с радиус $r = 0{,}5\ \mathrm{cm}$. С какво ускорение пада центърът му, ако горният край на конеца е неподвижен? ($g = 9{,}81\ \mathrm{m/s^2}$)" check={[0.516]} ask={['$a$, m/s²']}>
                <p>Постъпателно: <Tex>{'mg - T = ma'}</Tex>; въртене: <Tex>{'Tr = I\\alpha'}</Tex>, а без плъзгане по конеца <Tex>{'a = \\alpha r'}</Tex>.</p>
                <p>С <Tex>{'I = \\frac{1}{2}mR^2'}</Tex>: <Tex>{'T = \\frac{I a}{r^2} = \\frac{mR^2}{2r^2}a'}</Tex>, откъдето <Tex>{'a = \\frac{g}{1 + \\frac{R^2}{2r^2}}'}</Tex>.</p>
                <p><Tex>{'\\frac{R^2}{2r^2} = \\frac{9}{0{,}5} = 18 \\Rightarrow a = \\frac{9{,}81}{19} \\approx 0{,}516\\ \\mathrm{m/s^2}'}</Tex> – около 19 пъти по-бавно от свободното падане.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Въртележка е плътен диск с маса 200 kg и радиус 2 m и се върти с 1 rad/s без триене. Дете с маса 40 kg отива от ръба до центъра. Каква е новата ъглова скорост и с колко се променя кинетичната енергия?" check={[1.4, 112]} ask={['$\\omega_2$, rad/s', '$\\Delta E$, J']}>
                <p><Tex>{'I_1 = \\frac{1}{2} \\cdot 200 \\cdot 2^2 + 40 \\cdot 2^2 = 400 + 160 = 560\\ \\mathrm{kg \\cdot m^2}'}</Tex>, <Tex>{'I_2 = 400\\ \\mathrm{kg \\cdot m^2}'}</Tex></p>
                <p><Tex>{'\\omega_2 = \\frac{I_1\\omega_1}{I_2} = \\frac{560}{400} = 1{,}4\\ \\mathrm{rad/s}'}</Tex></p>
                <p><Tex>{'E_1 = \\frac{560 \\cdot 1^2}{2} = 280\\ \\mathrm{J}'}</Tex>, <Tex>{'E_2 = \\frac{400 \\cdot 1{,}4^2}{2} = 392\\ \\mathrm{J}'}</Tex></p>
                <p>Енергията нараства с 112 J – толкова работа извършва детето, докато се придърпва към центъра срещу „центробежната“ сила.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\omega = \\frac{2\\pi}{T} = 2\\pi\\nu'}</Tex>, <Tex>{'v = \\omega r'}</Tex>; ъглите – в <Term id="radian">радиани</Term></li>
              <li>✓ Центростремително ускорение <Tex>{'a = \\frac{v^2}{r} = \\omega^2 r'}</Tex> към центъра; нужната сила <Tex>{'\\frac{mv^2}{r}'}</Tex> е резултантната на истинските сили</li>
              <li>✓ Момент на сила <Tex>{'M = Fd'}</Tex>; основен закон <Tex>{'M = I\\alpha'}</Tex></li>
              <li>✓ Обръч <Tex>{'mR^2'}</Tex>, диск <Tex>{'\\frac{1}{2}mR^2'}</Tex>, кълбо <Tex>{'\\frac{2}{5}mR^2'}</Tex></li>
              <li>✓ Търкаляне: <Tex>{'E = \\frac{mv^2}{2} + \\frac{I\\omega^2}{2}'}</Tex>, <Tex>{'v = \\sqrt{\\frac{2gh}{1 + k}}'}</Tex> – зависи само от формата</li>
              <li>✓ Без външен момент <Tex>{'L = I\\omega'}</Tex> се запазва: по-малко <Tex>{'I'}</Tex> – по-голямо <Tex>{'\\omega'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Денят на Земята бавно се удължава – средно с около 2 милисекунди на век. Приливите, които Луната предизвиква, трият океаните в
              дъното и спират въртенето на Земята, а изгубеният момент на импулса се предава на Луната. Затова тя се отдалечава от нас с около
              3,8 cm годишно – това се измерва с <Term id="laser">лазерни</Term> лъчи, отразени от огледала, оставени на Луната. По <Term id="annual-ring">годишните пръстени</Term> на растеж при
              древни корали учените оценяват, че преди около 400 милиона години годината е имала приблизително 400 дни.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
