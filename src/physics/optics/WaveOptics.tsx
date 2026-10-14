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
import DoubleSlitLab from './DoubleSlitLab';
import GratingLab from './GratingLab';
import ThinFilmLab from './ThinFilmLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.25 → 0{,}25. */
const dec = (v: number) => String(Number(v.toFixed(6))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6]);
  if (kind === 0) {
    // Δy = λL/d; λ в nm, L в m, d в mm ⇒ Δy в mm = λ·L/(1000·d)
    const [lam, L, d10] = [pick([400, 500, 600]), pick([1, 2, 3]), pick([2, 4, 5])];
    const d = d10 / 10;
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm},\\ d = ${dec(d)}\\ \\mathrm{mm},\\ L = ${L}\\ \\mathrm{m}`,
      ask: 'Разстояние между ивиците: $\\Delta y = ?\\ \\mathrm{mm}$',
      num: lam * L * 10,
      den: d10 * 1000,
      steps: [
        '$\\Delta y = \\frac{\\lambda L}{d}$ – всичко в метри',
        `$\\Delta y = \\frac{${lam} \\cdot 10^{-9} \\cdot ${L}}{${dec(d)} \\cdot 10^{-3}} = ${dec((lam * L) / (1000 * d))} \\cdot 10^{-3}\\ \\mathrm{m} = ${dec((lam * L) / (1000 * d))}\\ \\mathrm{mm}$`,
      ],
    };
  }
  if (kind === 1) {
    const N = pick([100, 200, 250, 500, 1000]);
    return {
      tex: `N = ${N}\\ \\text{линии на милиметър}`,
      ask: 'Период на решетката: $d = ?\\ \\mu\\mathrm{m}$',
      num: 1000,
      den: N,
      steps: [`$d = \\frac{1\\ \\mathrm{mm}}{N} = \\frac{1000\\ \\mu\\mathrm{m}}{${N}}$`, `$d = ${dec(1000 / N)}\\ \\mu\\mathrm{m}$`],
    };
  }
  if (kind === 2) {
    const [lam, k] = [pick([400, 500, 600]), pick([1, 2])];
    return {
      tex: `d = 2\\ \\mu\\mathrm{m},\\ \\lambda = ${lam}\\ \\mathrm{nm},\\ k = ${k}`,
      ask: 'Решетка: $\\sin\\theta = ?$',
      num: k * lam,
      den: 2000,
      steps: [`$d \\sin\\theta = k\\lambda \\Rightarrow \\sin\\theta = \\frac{k\\lambda}{d}$`, `$\\sin\\theta = \\frac{${k} \\cdot ${lam}}{2000} = ${dec((k * lam) / 2000)}$`],
    };
  }
  if (kind === 3) {
    const [N, lam] = [pick([200, 300, 500]), pick([400, 500, 600, 700])];
    const d = 1e6 / N;
    const kMax = Math.ceil(d / lam) - 1;
    return {
      tex: `N = ${N}\\ \\mathrm{mm^{-1}},\\ \\lambda = ${lam}\\ \\mathrm{nm}`,
      ask: 'Най-висок наблюдаван порядък: $k_{\\max} = ?$',
      num: kMax,
      den: 1,
      steps: [
        `$d = \\frac{10^6\\ \\mathrm{nm}}{${N}} = ${dec(d)}\\ \\mathrm{nm}$`,
        `$\\sin\\theta = \\frac{k\\lambda}{d} < 1 \\Rightarrow k < \\frac{d}{\\lambda} = ${dec(Number((d / lam).toFixed(2)))}$, т.е. $k_{\\max} = ${kMax}$`,
      ],
    };
  }
  if (kind === 4) {
    const [phi, pct] = pick([
      [0, 100],
      [30, 75],
      [45, 50],
      [60, 25],
      [90, 0],
    ]);
    return {
      tex: `\\varphi = ${phi}^{\\circ}`,
      ask: 'Поляризирана светлина през поляризатор: $\\frac{I}{I_0} = ?\\ \\%$',
      num: pct,
      den: 1,
      steps: ['Закон на Малюс: $I = I_0 \\cos^2\\varphi$', `$\\cos^2 ${phi}^{\\circ} = ${dec(pct / 100)}$, т.е. ${pct}%`],
    };
  }
  if (kind === 5) {
    const [lam, n, dd] = pick([
      [500, 1.25, 100],
      [600, 1.5, 100],
      [480, 1.2, 100],
      [660, 1.5, 110],
      [520, 1.3, 100],
    ]);
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm},\\ n = ${dec(n)}`,
      ask: 'Антиотражателен слой: $d = ?\\ \\mathrm{nm}$',
      num: dd,
      den: 1,
      steps: ['Двата отразени лъча трябва да са в противофаза: $2nd = \\frac{\\lambda}{2}$', `$d = \\frac{\\lambda}{4n} = \\frac{${lam}}{4 \\cdot ${dec(n)}} = ${dd}\\ \\mathrm{nm}$`],
    };
  }
  const f = pick([400, 500, 600, 750]);
  return {
    tex: `f = ${f}\\ \\mathrm{THz}`,
    ask: 'Дължина на вълната във вакуум: $\\lambda = ?\\ \\mathrm{nm}$',
    num: 300000,
    den: f,
    steps: ['$\\lambda = \\frac{c}{f}$, $c = 3 \\cdot 10^8\\ \\mathrm{m/s}$', `$\\lambda = \\frac{3 \\cdot 10^8}{${f} \\cdot 10^{12}} = ${dec(300000 / f)} \\cdot 10^{-9}\\ \\mathrm{m} = ${dec(300000 / f)}\\ \\mathrm{nm}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🔴 Лазерна показалка',
    problem: 'Червена лазерна показалка (650 nm) свети през две цепнатини на разстояние 0,25 mm. Ивиците падат на стена на 3 m. На какво разстояние една от друга са светлите ивици?',
    solution: ['$\\Delta y = \\frac{\\lambda L}{d} = \\frac{650 \\cdot 10^{-9} \\cdot 3}{0{,}25 \\cdot 10^{-3}}$', '$\\Delta y = 7{,}8 \\cdot 10^{-3}\\ \\mathrm{m} = 7{,}8\\ \\mathrm{mm}$ – лесно се мери с линийка.'],
    answer: '$7{,}8\\ \\mathrm{mm}$',
    check: [7.8],
    ask: ['Δy, mm'],
  },
  {
    title: '💿 Дъга върху компактдиск',
    problem: 'Пистите на CD са на 1,6 µm една от друга. Под какъв ъгъл се отклонява зелена светлина (532 nm) в първия порядък?',
    solution: ['$\\sin\\theta = \\frac{\\lambda}{d} = \\frac{532 \\cdot 10^{-9}}{1{,}6 \\cdot 10^{-6}} \\approx 0{,}333$', '$\\theta \\approx 19{,}4^{\\circ}$ – затова дискът „хвърля“ дъги, когато го наклониш.'],
    answer: '$\\approx 19{,}4^{\\circ}$',
    check: [19.4],
    ask: ['ъгъл, °'],
  },
  {
    title: '🫧 Сапунен мехур',
    problem: 'Сапунен филм (n = 1,33) отразява най-силно светлина с дължина 600 nm. Каква е най-малката възможна дебелина на филма?',
    solution: [
      'Отражението от горната граница обръща фазата (+λ/2), от долната – не.',
      'Усилване при $2nd = \\frac{\\lambda}{2}$ (най-малката дебелина): $d = \\frac{\\lambda}{4n} = \\frac{600}{4 \\cdot 1{,}33}$',
      '$d \\approx 113\\ \\mathrm{nm}$ – около хиляда пъти по-тънък от косъм.',
    ],
    answer: '$\\approx 113\\ \\mathrm{nm}$',
    check: [113],
    ask: ['d, nm'],
  },
  {
    title: '👓 Покритие на очила',
    problem: 'Антиотражателното покритие на очила е от материал с n = 1,38. Колко дебело трябва да е, за да не отразява зелена светлина (550 nm)?',
    solution: ['И двете отражения са от по-плътна среда, затова гасене има при $2nd = \\frac{\\lambda}{2}$.', '$d = \\frac{\\lambda}{4n} = \\frac{550}{4 \\cdot 1{,}38} \\approx 99{,}6\\ \\mathrm{nm}$'],
    answer: '$\\approx 99{,}6\\ \\mathrm{nm}$',
    check: [99.6],
    ask: ['d, nm'],
  },
  {
    title: '🕶️ Два поляризатора',
    problem: 'Неполяризирана светлина минава през два поляризатора, чиито оси сключват ъгъл 30°. Какъв процент от светлината излиза?',
    solution: ['Първият поляризатор пропуска половината: $\\frac{I_0}{2}$.', 'Вторият – по закона на Малюс: $\\frac{I_0}{2}\\cos^2 30^{\\circ} = \\frac{I_0}{2} \\cdot 0{,}75 = 0{,}375\\,I_0$', 'Излизат 37,5% от светлината.'],
    answer: '$37{,}5\\%$',
    check: [37.5],
    ask: ['процент'],
  },
  {
    title: '🚗 Фаровете в нощта',
    problem: 'Зеницата на окото нощем е около 3 mm. Фаровете на кола са на 1,5 m един от друг. От какво най-голямо разстояние (в km) окото по принцип може да ги различи като два? Приеми λ = 550 nm.',
    solution: [
      'Дифракционна граница: $\\theta \\approx 1{,}22\\frac{\\lambda}{D} = 1{,}22 \\cdot \\frac{550 \\cdot 10^{-9}}{3 \\cdot 10^{-3}} \\approx 2{,}24 \\cdot 10^{-4}\\ \\mathrm{rad}$',
      '$L = \\frac{1{,}5}{2{,}24 \\cdot 10^{-4}} \\approx 6{,}71 \\cdot 10^{3}\\ \\mathrm{m} \\approx 6{,}71\\ \\mathrm{km}$',
      'На практика окото се справя по-зле – това е горна граница, наложена от вълновата природа на светлината.',
    ],
    answer: '$\\approx 6{,}71\\ \\mathrm{km}$',
    check: [6.71],
    ask: ['разстояние, km'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кое явление най-ясно показва, че светлината е вълна?',
    answers: ['интерференцията', 'праволинейното разпространение', 'отражението', 'сянката'],
    correctAnswer: 'интерференцията',
  },
  {
    question: 'В опита на Юнг разстоянието между цепнатините се удвоява. Какво става с разстоянието между ивиците?',
    answers: ['намалява наполовина', 'удвоява се', 'не се променя', 'намалява 4 пъти'],
    correctAnswer: 'намалява наполовина',
  },
  {
    question: 'При коя светлина ивиците в опита на Юнг са най-широко разположени?',
    answers: ['червена', 'зелена', 'синя', 'виолетова'],
    correctAnswer: 'червена',
  },
  {
    question: 'Решетка има 1000 линии на милиметър. Какъв е периодът ѝ?',
    answers: ['$1\\ \\mu\\mathrm{m}$', '$1\\ \\mathrm{mm}$', '$1\\ \\mathrm{nm}$', '$10\\ \\mu\\mathrm{m}$'],
    correctAnswer: '$1\\ \\mu\\mathrm{m}$',
  },
  {
    question: 'В дифракционна решетка кой цвят се отклонява най-много в първия порядък?',
    answers: ['червеният', 'виолетовият', 'всички еднакво', 'зеленият'],
    correctAnswer: 'червеният',
  },
  {
    question: 'Поляризирана светлина пада на поляризатор, чиято ос е под ъгъл 90° спрямо нея. Каква част от нея минава?',
    answers: ['$0$', '$\\frac{1}{2}$', '$\\frac{1}{4}$', 'цялата'],
    correctAnswer: '$0$',
  },
  {
    question: 'Каква част от неполяризираната светлина пропуска един идеален поляризатор?',
    answers: ['половината', 'цялата', 'една четвърт', 'нищо'],
    correctAnswer: 'половината',
  },
  {
    question: 'Защо сапунените мехури са цветни?',
    answers: ['интерференция в тънкия слой', 'боята в сапуна', 'пречупване като в призма', 'поляризация'],
    correctAnswer: 'интерференция в тънкия слой',
  },
  {
    question: 'В какъв диапазон са дължините на вълната на видимата светлина?',
    answers: ['$380$–$750\\ \\mathrm{nm}$', '$38$–$75\\ \\mathrm{nm}$', '$3{,}8$–$7{,}5\\ \\mu\\mathrm{m}$', '$380$–$750\\ \\mu\\mathrm{m}$'],
    correctAnswer: '$380$–$750\\ \\mathrm{nm}$',
  },
];

// ---------- Страница ----------

const COLORS: [string, string][] = [
  ['виолетово', '380–450'],
  ['синьо', '450–495'],
  ['зелено', '495–570'],
  ['жълто', '570–590'],
  ['оранжево', '590–620'],
  ['червено', '620–750'],
];

export function WaveOptics() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Вълнова оптика</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🌈 През 1818 г. Френската академия обявява конкурс за теория на <Term id="diffraction">дифракцията</Term>. Огюстен Френел изпраща вълнова теория на светлината.
            Според разказа един от журито, Симеон Поасон, смятал, че я опровергава: от нея следва, че точно в центъра на сянката на кръгъл диск
            трябва да има светло петно – „абсурд“. Франсоа Араго проверява опита и вижда петното. Днес то се нарича петно на Араго (или на
            Поасон), а вълновата теория печели. Петнадесетина години по-рано Томас Юнг вече е показал с две цепнатини, че светлината
            <Term id="interference">интерферира</Term> – но тогава авторитетът на Нютон тежи повече.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Светлината като вълна</h2>
          <p className={text}>
            Нютон смята, че светлината е поток от малки частици, а Кристиан Хюйгенс – че е вълна. През XVIII век надделява мнението на
            Нютон. Решаващи се оказват опитите, в които светлината прави нещо, което може само вълна: <strong>интерферира</strong> и{' '}
            <strong>огъва препятствия</strong>. Днес знаем, че светлината е <Term id="em-wave">електромагнитна вълна</Term> (виж{' '}
            <Link to="/physics/electricity/ac-em-waves" className={link}>
              Променлив ток и ЕМ вълни
            </Link>
            ), а общите свойства на вълните са разгледани в урока{' '}
            <Link to="/physics/waves/waves" className={link}>
              Вълни
            </Link>
            .
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="w-full text-sm sm:text-base border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">Цвят</th>
                  <th className="text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">λ, nm (приблизително)</th>
                </tr>
              </thead>
              <tbody>
                {COLORS.map(([c, r]) => (
                  <tr key={c}>
                    <td className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">{c}</td>
                    <td className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Theorem
            type="definition"
            title="Кохерентни източници"
            description="Две вълни интерферират устойчиво само ако имат еднаква честота и постоянна разлика във фазите – тогава ги наричаме кохерентни. Две отделни крушки не са кохерентни: атомите им излъчват независимо. Затова Юнг разделя светлината от един източник на две – с две цепнатини. Лазерът е много кохерентен и опитите с него стават лесно."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Интерференция: опитът на Юнг</h2>
          <p className={text}>
            Светлината минава през две тесни цепнатини на разстояние <Tex>{'d'}</Tex>. Те стават два кохерентни източника. В точка от екрана
            вълните идват с разлика в пътищата <Tex>{'\\Delta = d\\sin\\theta'}</Tex>.
          </p>
          <Theorem
            title="Условия за максимум и минимум"
            description="Светла ивица (максимум) има там, където $d\sin\theta = k\lambda$, $k = 0, \pm 1, \pm 2, \ldots$ Тъмна ивица (минимум) – където $d\sin\theta = \left(k + \frac{1}{2}\right)\lambda$. При малки ъгли и екран на разстояние $L$ светлите ивици са на равни разстояния $\Delta y = \frac{\lambda L}{d}$."
          />
          <Example
            description="Светлина с λ = 600 nm минава през две цепнатини на 0,5 mm една от друга. Екранът е на 2 m. На какво разстояние са ивиците?"
            steps={['$\\Delta y = \\frac{\\lambda L}{d} = \\frac{600 \\cdot 10^{-9} \\cdot 2}{0{,}5 \\cdot 10^{-3}} = 2{,}4 \\cdot 10^{-3}\\ \\mathrm{m}$', '$\\Delta y = 2{,}4\\ \\mathrm{mm}$ – ивиците са ситни, но се виждат с просто око.']}
          />
          <DoubleSlitLab />
          <p className={text}>
            Опитът на Юнг е и начин да се <strong>измери</strong> <Term id="wavelength">дължината на вълната</Term>: <Tex>{'\\lambda = \\frac{d\\,\\Delta y}{L}'}</Tex>.
            Така Юнг пръв оценява, че видимата светлина има дължина на вълната под микрометър.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Дифракция</h2>
          <p className={text}>
            Дифракция е огъването на вълните около препятствия и разширяването им след тесни отвори. Името дава Франческо Грималди (публикувано
            посмъртно през 1665 г.). Дифракцията е силна, когато препятствието е съизмеримо с дължината на вълната. Звукът (дължина около метър)
            лесно заобикаля ъгъла на сградата и чуваме човек, когото не виждаме; светлината (под микрометър) почти не го прави.
          </p>
          <Theorem
            title="Дифракция на една цепнатина"
            description="При цепнатина с ширина $a$ първият тъмен минимум е под ъгъл, за който $a\sin\theta = \lambda$. Централното светло петно е два пъти по-широко от останалите. Колкото по-тясна е цепнатината, толкова по-широко е петното."
          />
          <Theorem
            title="Дифракционна граница на разделителната способност"
            description="Кръгъл отвор с диаметър $D$ (зеница, обектив) размива точката в малко петно. Два точкови обекта се различават, ако ъгълът между тях е поне $\theta \approx 1{,}22\frac{\lambda}{D}$ (в радиани)."
          />
          <Example
            description="Каква е дифракционната граница на окото при зеница 5 mm и λ = 550 nm?"
            steps={['$\\theta \\approx 1{,}22 \\cdot \\frac{550 \\cdot 10^{-9}}{5 \\cdot 10^{-3}} \\approx 1{,}34 \\cdot 10^{-4}\\ \\mathrm{rad}$', 'Това е около $0{,}46$ дъгови минути. Истинското зрение е малко по-лошо – около 1 дъгова минута.']}
          />
          <p className={text}>
            Затова големите телескопи различават по-фини детайли – повече за това в лекцията{' '}
            <Link to="/astronomy/lecture10" className={link}>
              Телескопи
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Дифракционна решетка</h2>
          <p className={text}>
            Решетката е пластинка с много успоредни процепи (или черти) на еднакво разстояние <Tex>{'d'}</Tex> – периодът на решетката. Ако
            има <Tex>{'N'}</Tex> линии на милиметър, то <Tex>{'d = \\frac{1\\ \\mathrm{mm}}{N}'}</Tex>. Вълните от всички процепи се усилват
            само в няколко посоки и там се получават ярки, тесни линии.
          </p>
          <Theorem
            title="Формула на решетката"
            description="Максимумите са под ъглите, за които $d\sin\theta = k\lambda$, $k = 0, \pm 1, \pm 2, \ldots$ Понеже $\sin\theta \le 1$, порядъкът е ограничен: $|k| < \frac{d}{\lambda}$. По-дългите вълни (червеното) се отклоняват повече – обратно на призмата."
          />
          <GratingLab />
          <Example
            description="Решетка има 600 линии на милиметър. Под какви ъгли в първия порядък се виждат червената (656 nm) и виолетовата (410 nm) линия на водорода?"
            steps={[
              '$d = \\frac{1}{600}\\ \\mathrm{mm} \\approx 1667\\ \\mathrm{nm}$',
              '$\\sin\\theta_{\\text{черв}} = \\frac{656}{1667} \\approx 0{,}394 \\Rightarrow \\theta \\approx 23{,}2^{\\circ}$',
              '$\\sin\\theta_{\\text{виол}} = \\frac{410}{1667} \\approx 0{,}246 \\Rightarrow \\theta \\approx 14{,}2^{\\circ}$',
            ]}
          />
          <p className={text}>
            Йозеф фон Фраунхофер изработва в началото на XIX век първите прецизни решетки и с тях измерва дължините на вълните на тъмните
            линии в <Term id="spectrum">спектъра</Term> на Слънцето. Днес спектрографите с решетки разкриват състава и скоростта на звездите (виж{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>
            ). А пистите на CD (1,6 µm) и DVD (0,74 µm) действат като решетка – затова дисковете блестят в цветовете на дъгата.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Интерференция в тънки слоеве</h2>
          <p className={text}>
            Когато светлината падне на тънък прозрачен слой, част от нея се отразява от горната граница, а част – от долната. Вторият лъч
            изминава допълнително <Tex>{'2nd'}</Tex>, където <Tex>{'n'}</Tex> е <Term id="refractive-index">показателят на пречупване</Term> на слоя (виж{' '}
            <Link to="/physics/optics/reflection-refraction" className={link}>
              Отражение и пречупване
            </Link>
            ). Двата лъча интерферират.
          </p>
          <Theorem
            title="Обръщане на фазата при отражение"
            description="При отражение от оптически по-плътна среда (с по-голямо $n$) фазата на вълната се обръща – все едно пътят се удължава с $\frac{\lambda}{2}$. При отражение от по-рядка среда това не става. За сапунен филм във въздуха се обръща само единият лъч, затова усилване има при $2nd = \left(k + \frac{1}{2}\right)\lambda$."
          />
          <Theorem
            title="Антиотражателно покритие"
            description="Ако покритието има $n$ между това на въздуха и на стъклото, и двата лъча се обръщат. Те се гасят, когато $2nd = \frac{\lambda}{2}$, т.е. при дебелина $d = \frac{\lambda}{4n}$ – „четвъртвълнов“ слой. Така се покриват лещите на очила и фотоапарати."
          />
          <ThinFilmLab />
          <Example
            description="Масло (n = 1,45) е разлято на тънък слой с дебелина 300 nm върху вода (n = 1,33). Каква видима светлина отразява най-силно, ако гледаме отвисоко?"
            steps={[
              'Отражението въздух–масло обръща фазата; масло–вода – не (водата е по-рядка от маслото).',
              'Усилване: $2nd = \\left(k + \\frac{1}{2}\\right)\\lambda \\Rightarrow \\lambda = \\frac{2 \\cdot 1{,}45 \\cdot 300}{k + 0{,}5} = \\frac{870}{k + 0{,}5}$',
              '$k = 0$: 1740 nm (инфрачервено); $k = 1$: 580 nm (жълто); $k = 2$: 348 nm (ултравиолетово). Петното изглежда жълтеникаво.',
            ]}
          />
          <p className={text}>
            Подобна картина са <strong>пръстените на Нютон</strong>: изпъкнала <Term id="lens">леща</Term>, положена върху стъкло, оставя под себе си клиновиден
            въздушен слой и около допирната точка се виждат концентрични цветни пръстени. Иронично, Нютон ги описва подробно, но не ги обяснява
            с вълни.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Поляризация</h2>
          <p className={text}>
            Светлината е <strong>напречна</strong> вълна: <Term id="electric-field">електричното поле</Term> трепти перпендикулярно на посоката на разпространение. В обикновената
            светлина посоката на трептене се мени хаотично – тя е неполяризирана. Поляризаторът пропуска само трептенията по една ос.
          </p>
          <Theorem
            title="Закон на Малюс"
            description="Неполяризирана светлина с интензитет $I_0$ след идеален поляризатор има интензитет $\frac{I_0}{2}$. Поляризирана светлина с интензитет $I_0$, която пада на поляризатор под ъгъл $\varphi$ спрямо оста му, излиза с $I = I_0\cos^2\varphi$. При $\varphi = 90^{\circ}$ не минава нищо."
          />
          <p className={text}>
            Отразената от вода, сняг или път светлина е частично поляризирана – хоризонтално. Поляризиращите слънчеви очила имат вертикална ос
            и спират този отблясък. При ъгъла на Брюстер, за който <Tex>{'\\operatorname{tg}\\theta_B = n'}</Tex> (около 53° за вода),
            отразената светлина е напълно поляризирана. Течнокристалните екрани също работят с поляризатори – затова през поляризиращи очила
            някои екрани потъмняват, когато ги завъртиш.
          </p>
          <Example
            description="Неполяризирана светлина минава през два поляризатора с оси под ъгъл 60°. Каква част от нея излиза?"
            steps={['След първия: $\\frac{I_0}{2}$', 'След втория: $\\frac{I_0}{2}\\cos^2 60^{\\circ} = \\frac{I_0}{2} \\cdot \\frac{1}{4} = \\frac{I_0}{8}$, т.е. 12,5%']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 2,4.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Вълновата оптика около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Формулата на Юнг наобратно', '$\\Delta y = \\frac{\\lambda d}{L}$', '$\\Delta y = \\frac{\\lambda L}{d}$ – по-близките цепнатини дават по-широки ивици'],
              ['Смесени единици', '$\\frac{500 \\cdot 2}{0{,}5} = 2000$ – „mm“', 'всичко в метри: $\\frac{500 \\cdot 10^{-9} \\cdot 2}{0{,}5 \\cdot 10^{-3}} = 2 \\cdot 10^{-3}\\ \\mathrm{m}$'],
              ['Безкрайно много порядъци', 'решетката дава всяко $k$', '$|\\sin\\theta| \\le 1$, затова $|k| < \\frac{d}{\\lambda}$'],
              ['Решетка и призма', 'виолетовото се отклонява най-много', 'в решетката – червеното; в призмата е обратно'],
              ['Покритие с дебелина λ/2', '$d = \\frac{\\lambda}{2}$', '$d = \\frac{\\lambda}{4n}$ – в слоя вълната е $n$ пъти по-къса, а пътят е двоен'],
              ['Малюс за неполяризирана светлина', '$I = I_0\\cos^2\\varphi$ още при първия поляризатор', 'първият поляризатор пропуска $\\frac{I_0}{2}$ при всяко завъртане'],
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
              <Task id="a1" number={1} color="border-green-500" question="В опит на Юнг λ = 500 nm, разстоянието между цепнатините е 0,2 mm, а екранът е на 1,5 m. На какво разстояние са светлите ивици?" check={[3.75]} ask={['$\\Delta y$, mm']}>
                <p><Tex>{'\\Delta y = \\frac{\\lambda L}{d} = \\frac{500 \\cdot 10^{-9} \\cdot 1{,}5}{0{,}2 \\cdot 10^{-3}} = 3{,}75 \\cdot 10^{-3}\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\Delta y = 3{,}75\\ \\mathrm{mm}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Решетка с 500 линии на милиметър е осветена със светлина 600 nm. Под какъв ъгъл е първият максимум?" check={[17.5]} ask={['$\\theta$, °']}>
                <p><Tex>{'d = \\frac{1}{500}\\ \\mathrm{mm} = 2\\ \\mu\\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\sin\\theta = \\frac{\\lambda}{d} = \\frac{0{,}6}{2} = 0{,}3 \\Rightarrow \\theta \\approx 17{,}5^{\\circ}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Неполяризирана светлина минава през два поляризатора, чиито оси сключват 45°. Какъв процент от нея излиза?" check={[25]} ask={['процент']}>
                <p>След първия поляризатор: <Tex>{'\\frac{I_0}{2}'}</Tex>.</p>
                <p>След втория: <Tex>{'\\frac{I_0}{2}\\cos^2 45^{\\circ} = \\frac{I_0}{2} \\cdot \\frac{1}{2} = \\frac{I_0}{4}'}</Tex>, т.е. 25%.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Решетка има 600 линии на милиметър. Кой е най-високият порядък, в който се вижда червена светлина 700 nm?" check={[2]} ask={['$k_{\\max}$']}>
                <p><Tex>{'d = \\frac{10^6\\ \\mathrm{nm}}{600} \\approx 1667\\ \\mathrm{nm}'}</Tex></p>
                <p><Tex>{'|k| < \\frac{d}{\\lambda} = \\frac{1667}{700} \\approx 2{,}38'}</Tex></p>
                <p>Значи <Tex>{'k_{\\max} = 2'}</Tex> – общо 5 линии: <Tex>{'k = 0, \\pm 1, \\pm 2'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Опитът на Юнг във въздуха дава ивици на 3 mm една от друга. Каква ще е разликата между тях, ако цялата установка се потопи във вода (n = 1,33)?" check={[2.26]} ask={['$\\Delta y$, mm']}>
                <p>Във водата честотата не се мени, а скоростта намалява <Tex>{'n'}</Tex> пъти, затова <Tex>{"\\lambda' = \\frac{\\lambda}{n}"}</Tex>.</p>
                <p><Tex>{"\\Delta y' = \\frac{\\Delta y}{n} = \\frac{3}{1{,}33} \\approx 2{,}26\\ \\mathrm{mm}"}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Масло (n = 1,45) с дебелина 300 nm е разлято върху вода (n = 1,33). Коя видима дължина на вълната отразява най-силно?" check={[580]} ask={['$\\lambda$, nm']}>
                <p>Само отражението въздух–масло обръща фазата, затова усилване има при <Tex>{'2nd = \\left(k + \\frac{1}{2}\\right)\\lambda'}</Tex>.</p>
                <p><Tex>{'\\lambda = \\frac{870}{k + 0{,}5}'}</Tex>: 1740 nm, 580 nm, 348 nm…</p>
                <p>Във видимата област е само <Tex>{'\\lambda = 580\\ \\mathrm{nm}'}</Tex> (жълто).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="В опит на Юнг разстоянието между цепнатините е 5 пъти по-голямо от ширината на всяка от тях (d = 5a). Колко светли интерференционни ивици има в централния дифракционен максимум?" check={[9]} ask={['брой ивици']}>
                <p>Централният максимум на една цепнатина е до първия минимум: <Tex>{'a\\sin\\theta = \\lambda'}</Tex>, т.е. <Tex>{'\\sin\\theta = \\frac{\\lambda}{a} = \\frac{5\\lambda}{d}'}</Tex>.</p>
                <p>Интерференционните максимуми са при <Tex>{'\\sin\\theta = \\frac{k\\lambda}{d}'}</Tex>; вътре са тези с <Tex>{'|k| < 5'}</Tex>.</p>
                <p>При <Tex>{'k = \\pm 5'}</Tex> максимумът се пада точно на дифракционния минимум и изчезва. Остават <Tex>{'k = 0, \\pm 1, \\ldots, \\pm 4'}</Tex> – 9 ивици.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Космическият телескоп „Хъбъл“ има огледало с диаметър 2,4 m. Какъв е най-малкият детайл (в метри), който по принцип може да различи на Луната (384 000 km) при λ = 500 nm?" check={[97.7]} ask={['размер, m']}>
                <p><Tex>{'\\theta \\approx 1{,}22\\frac{\\lambda}{D} = 1{,}22 \\cdot \\frac{500 \\cdot 10^{-9}}{2{,}4} \\approx 2{,}54 \\cdot 10^{-7}\\ \\mathrm{rad}'}</Tex></p>
                <p><Tex>{'x = \\theta L = 2{,}54 \\cdot 10^{-7} \\cdot 3{,}844 \\cdot 10^{8} \\approx 97{,}7\\ \\mathrm{m}'}</Tex></p>
                <p>Затова „Хъбъл“ не може да види оставеното на Луната оборудване от мисиите „Аполо“ – то е много по-малко от 100 m.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При решетка вторият порядък на червената светлина (700 nm) се застъпва с третия порядък на по-къси вълни. Коя дължина на вълната от третия порядък попада точно на мястото на 700 nm от втория?" check={[467]} ask={['$\\lambda$, nm']}>
                <p>Еднакъв ъгъл означава еднакво <Tex>{'k\\lambda'}</Tex>: <Tex>{"2 \\cdot 700 = 3\\lambda'"}</Tex>.</p>
                <p><Tex>{"\\lambda' = \\frac{1400}{3} \\approx 467\\ \\mathrm{nm}"}</Tex> – синьо.</p>
                <p>Затова спектрите от втори и трети порядък се застъпват и спектрографите често използват само първия порядък или филтри.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Интерференцията и дифракцията показват, че светлината е вълна; видимата светлина е от около 380 до 750 nm</li>
              <li>✓ Опит на Юнг: максимуми при <Tex>{'d\\sin\\theta = k\\lambda'}</Tex>, ивици на разстояние <Tex>{'\\Delta y = \\frac{\\lambda L}{d}'}</Tex></li>
              <li>✓ Една цепнатина: първи минимум при <Tex>{'a\\sin\\theta = \\lambda'}</Tex>; <Term id="angular-resolution">разделителна способност</Term> <Tex>{'\\theta \\approx 1{,}22\\frac{\\lambda}{D}'}</Tex></li>
              <li>✓ Решетка: <Tex>{'d\\sin\\theta = k\\lambda'}</Tex>, <Tex>{'|k| < \\frac{d}{\\lambda}'}</Tex>; червеното се отклонява най-много</li>
              <li>✓ Тънък слой: пътна разлика <Tex>{'2nd'}</Tex> плюс <Tex>{'\\frac{\\lambda}{2}'}</Tex> при всяко отражение от по-плътна среда; покритие <Tex>{'d = \\frac{\\lambda}{4n}'}</Tex></li>
              <li>✓ Поляризация: поляризаторът пропуска половината неполяризирана светлина; закон на Малюс <Tex>{'I = I_0\\cos^2\\varphi'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Синият цвят на крилете на пеперудите морфо не идва от пигмент. Люспичките им имат микроскопични, редовно подредени гребенчета от
              хитин, а светлината, отразена от многото слоеве, интерферира и усилва най-вече синьото. Това е „структурен цвят“ – затова той се
              мени при промяна на ъгъла, под който гледаме, и изчезва, ако люспичките се намокрят с течност с подобен показател на пречупване.
              Подобен е произходът на блясъка на пауновите пера и на сапунените мехури.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
