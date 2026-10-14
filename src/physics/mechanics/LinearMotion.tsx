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
import BrakingLab from './BrakingLab';
import MotionGraphsLab from './MotionGraphsLab';
import ReactionRulerLab from './ReactionRulerLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 12.5 → 12{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');
/** Отрицателните числа в скоби при заместване: −2 → (−2). */
const par = (v: number) => (v < 0 ? `(${v})` : String(v));

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [v, t] = [pick([36, 54, 72, 90, 108]), pick([5, 10, 20])];
    return {
      tex: `v = ${v}\\ \\mathrm{km/h}, \\quad t = ${t}\\ \\mathrm{s}`,
      ask: 's = ?\\ \\mathrm{m}',
      num: v * 10 * t,
      den: 36,
      steps: [`$${v}\\ \\mathrm{km/h} = ${v} : 3{,}6 = ${dec(v / 3.6)}\\ \\mathrm{m/s}$`, `$s = vt = ${dec(v / 3.6)} \\cdot ${t} = ${dec((v * t) / 3.6)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 1) {
    const [v0, a, t] = [randInt(0, 10), pick([-3, -2, 1, 2, 3]), randInt(1, 5)];
    return {
      tex: `v_0 = ${v0}\\ \\mathrm{m/s}, \\quad a = ${a}\\ \\mathrm{m/s^2}`,
      ask: `v(${t}\\ \\mathrm{s}) = ?\\ \\mathrm{m/s}`,
      num: v0 + a * t,
      den: 1,
      steps: [`$v = v_0 + at = ${v0} + ${par(a)} \\cdot ${t} = ${v0 + a * t}\\ \\mathrm{m/s}$`, v0 + a * t < 0 ? 'Знакът минус значи, че тялото вече се движи в обратна посока.' : 'Скоростта се мени с $a$ на всяка секунда.'],
    };
  }
  if (kind === 2) {
    const [v0, a, t] = [randInt(0, 8), pick([2, 4, -2]), randInt(1, 4)];
    const s = v0 * t + (a * t * t) / 2;
    return {
      tex: `v_0 = ${v0}\\ \\mathrm{m/s}, \\quad a = ${a}\\ \\mathrm{m/s^2}`,
      ask: `Преместване за ${t} s: $\\Delta x = ?\\ \\mathrm{m}$`,
      num: s,
      den: 1,
      steps: [`$\\Delta x = v_0 t + \\frac{at^2}{2} = ${v0} \\cdot ${t} + \\frac{${par(a)} \\cdot ${t}^2}{2}$`, `$= ${v0 * t} ${a < 0 ? '-' : '+'} ${Math.abs((a * t * t) / 2)} = ${s}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 3) {
    const [v, a] = [pick([10, 20, 30]), pick([4, 5, 8])];
    return {
      tex: `v_0 = ${v}\\ \\mathrm{m/s}, \\quad a = -${a}\\ \\mathrm{m/s^2}`,
      ask: 'Спирачен път: $s = ?\\ \\mathrm{m}$',
      num: v * v,
      den: 2 * a,
      steps: [`От $v^2 - v_0^2 = 2as$ при $v = 0$: $s = \\frac{v_0^2}{2|a|}$`, `$s = \\frac{${v}^2}{2 \\cdot ${a}} = \\frac{${v * v}}{${2 * a}} = ${dec((v * v) / (2 * a))}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 4) {
    const t = randInt(1, 5);
    const h = 5 * t * t;
    return {
      tex: `h = ${h}\\ \\mathrm{m}, \\quad g = 10\\ \\mathrm{m/s^2}`,
      ask: 'Време за свободно падане: $t = ?\\ \\mathrm{s}$',
      num: t,
      den: 1,
      steps: [`$h = \\frac{gt^2}{2} \\Rightarrow t = \\sqrt{\\frac{2h}{g}}$`, `$t = \\sqrt{\\frac{2 \\cdot ${h}}{10}} = \\sqrt{${t * t}} = ${t}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 5) {
    const [v1, v2] = pick([
      [60, 40],
      [30, 60],
      [60, 90],
      [20, 30],
    ]);
    const avg = (2 * v1 * v2) / (v1 + v2);
    return {
      tex: `v_1 = ${v1}\\ \\mathrm{km/h}, \\quad v_2 = ${v2}\\ \\mathrm{km/h}`,
      ask: 'Половината път с $v_1$, другата половина – с $v_2$. $v_{\\text{ср}} = ?\\ \\mathrm{km/h}$',
      num: avg,
      den: 1,
      steps: [`Нека целият път е $2s$: времето е $\\frac{s}{${v1}} + \\frac{s}{${v2}}$`, `$v_{\\text{ср}} = \\frac{2s}{\\frac{s}{${v1}} + \\frac{s}{${v2}}} = \\frac{2 \\cdot ${v1} \\cdot ${v2}}{${v1} + ${v2}} = ${avg}\\ \\mathrm{km/h}$ – не $${(v1 + v2) / 2}$!`],
    };
  }
  const v0 = pick([10, 20, 30]);
  return {
    tex: `v_0 = ${v0}\\ \\mathrm{m/s}, \\quad g = 10\\ \\mathrm{m/s^2}`,
    ask: 'Хвърлено право нагоре: $h_{\\max} = ?\\ \\mathrm{m}$',
    num: (v0 * v0) / 20,
    den: 1,
    steps: [`В най-високата точка $v = 0$: $0 - v_0^2 = -2gh$`, `$h = \\frac{v_0^2}{2g} = \\frac{${v0 * v0}}{20} = ${(v0 * v0) / 20}\\ \\mathrm{m}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🛣️ Пътуване по магистрала',
    problem: 'Кола изминава 280 km. Първите 200 km кара със 140 km/h, а последните 80 km попада в задръстване и се движи с 40 km/h. Каква е средната ѝ скорост?',
    solution: ['$t_1 = \\frac{200}{140} \\approx 1{,}43\\ \\mathrm{h}$, $t_2 = \\frac{80}{40} = 2\\ \\mathrm{h}$', '$v_{\\text{ср}} = \\frac{280}{1{,}43 + 2} \\approx 81{,}7\\ \\mathrm{km/h}$', 'Задръстването „изяжда“ повече време, отколкото печелим с високата скорост.'],
    answer: '$\\approx 81{,}7\\ \\mathrm{km/h}$',
    check: [81.7],
    ask: ['скорост, km/h'],
  },
  {
    title: '🛫 Излитане',
    problem: 'Самолет тръгва от покой и се ускорява равномерно с 2,5 m/s². За да излети, му трябва скорост 75 m/s (270 km/h). След колко секунди излита и колко дълга писта му трябва?',
    solution: ['$t = \\frac{v}{a} = \\frac{75}{2{,}5} = 30\\ \\mathrm{s}$', '$s = \\frac{v^2}{2a} = \\frac{75^2}{5} = 1125\\ \\mathrm{m}$'],
    answer: '30 s и 1125 m',
    check: [30, 1125],
    ask: ['време, s', 'писта, m'],
  },
  {
    title: '🪨 Кладенец',
    problem: 'Пускаш камък в кладенец и той цопва във водата след 2 s. Колко дълбок е кладенецът до водата? ($g = 9{,}8\\ \\mathrm{m/s^2}$, времето за звука пренебрегваме.)',
    solution: ['$h = \\frac{gt^2}{2} = \\frac{9{,}8 \\cdot 2^2}{2} = 19{,}6\\ \\mathrm{m}$'],
    answer: '$19{,}6\\ \\mathrm{m}$',
    check: [19.6],
    ask: ['дълбочина, m'],
  },
  {
    title: '🚸 Дете на пътя',
    problem: 'Шофьор кара с 50 km/h по сух път и вижда дете, което изтичва на пътя. Реакцията му е 1 s, а колата спира със забавяне 7 m/s². Колко метра изминава колата до пълното спиране?',
    solution: ['$v = 50 : 3{,}6 \\approx 13{,}9\\ \\mathrm{m/s}$; път на реакцията $13{,}9 \\cdot 1 = 13{,}9\\ \\mathrm{m}$', 'Спирачен път $\\frac{v^2}{2a} = \\frac{13{,}9^2}{14} \\approx 13{,}8\\ \\mathrm{m}$', 'Общо $\\approx 27{,}7\\ \\mathrm{m}$. При 60 km/h същото е 36,5 m, а на 27,7 m колата още се движи с около 40 km/h.'],
    answer: '$\\approx 27{,}7\\ \\mathrm{m}$',
    check: [27.7],
    ask: ['път, m'],
  },
  {
    title: '⚽ Топка нагоре',
    problem: 'Хвърляш топка право нагоре със скорост 15 m/s. Колко високо ще се издигне? ($g = 9{,}8\\ \\mathrm{m/s^2}$, без съпротивление на въздуха.)',
    solution: ['В най-високата точка скоростта е 0: $0 - v_0^2 = -2gh$', '$h = \\frac{v_0^2}{2g} = \\frac{225}{19{,}6} \\approx 11{,}5\\ \\mathrm{m}$ – колкото четириетажна сграда.'],
    answer: '$\\approx 11{,}5\\ \\mathrm{m}$',
    check: [11.5],
    ask: ['височина, m'],
  },
  {
    title: '🏃 Догонване',
    problem: 'Сестра ти е тръгнала пеша със скорост 1,5 m/s и е на 100 m пред теб. Ти тичаш след нея с 5 m/s. След колко секунди ще я настигнеш?',
    solution: ['С нея свързваме отправна система: ти се приближаваш с $5 - 1{,}5 = 3{,}5\\ \\mathrm{m/s}$.', '$t = \\frac{100}{3{,}5} \\approx 28{,}6\\ \\mathrm{s}$'],
    answer: '$\\approx 28{,}6\\ \\mathrm{s}$',
    check: [28.6],
    ask: ['време, s'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво показва наклонът на графиката на положението $x(t)$?',
    answers: ['скоростта', 'ускорението', 'изминатия път', 'времето'],
    correctAnswer: 'скоростта',
  },
  {
    question: 'Какво показва лицето под графиката на скоростта $v(t)$?',
    answers: ['преместването', 'ускорението', 'скоростта', 'силата'],
    correctAnswer: 'преместването',
  },
  {
    question: 'Кола изминава половината път с 60 km/h, а другата половина – с 40 km/h. Каква е средната ѝ скорост?',
    answers: ['$48\\ \\mathrm{km/h}$', '$50\\ \\mathrm{km/h}$', '$45\\ \\mathrm{km/h}$', '$100\\ \\mathrm{km/h}$'],
    correctAnswer: '$48\\ \\mathrm{km/h}$',
  },
  {
    question: 'Кола с 72 km/h спира равнозакъснително за 4 s. Колко е забавянето ѝ?',
    answers: ['$5\\ \\mathrm{m/s^2}$', '$18\\ \\mathrm{m/s^2}$', '$4\\ \\mathrm{m/s^2}$', '$20\\ \\mathrm{m/s^2}$'],
    correctAnswer: '$5\\ \\mathrm{m/s^2}$',
  },
  {
    question: 'Колко метра изминава тяло, пуснато да пада свободно, за първите 2 s? ($g = 10\\ \\mathrm{m/s^2}$)',
    answers: ['$20\\ \\mathrm{m}$', '$10\\ \\mathrm{m}$', '$40\\ \\mathrm{m}$', '$5\\ \\mathrm{m}$'],
    correctAnswer: '$20\\ \\mathrm{m}$',
  },
  {
    question: 'Топка е хвърлена право нагоре. Какво е вярно в най-високата ѝ точка?',
    answers: ['скоростта е 0, а ускорението е $g$', 'скоростта и ускорението са 0', 'ускорението е 0, а скоростта – не', 'скоростта е $g$'],
    correctAnswer: 'скоростта е 0, а ускорението е $g$',
  },
  {
    question: 'Колко пъти се увеличава спирачният път, ако скоростта се удвои?',
    answers: ['$4$', '$2$', '$\\sqrt{2}$', '$8$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Графиката $v(t)$ е хоризонтална права над оста на времето. Какво е движението?',
    answers: ['равномерно', 'равноускорително', 'тялото стои на едно място', 'равнозакъснително'],
    correctAnswer: 'равномерно',
  },
  {
    question: 'Тяло пада свободно от покой. Как се отнасят пътищата, изминати през 1-вата, 2-рата и 3-тата секунда?',
    answers: ['$1 : 3 : 5$', '$1 : 2 : 3$', '$1 : 4 : 9$', '$1 : 1 : 1$'],
    correctAnswer: '$1 : 3 : 5$',
  },
];

// ---------- Страница ----------

export function LinearMotion() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Праволинейно движение</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚖️ Падащият камък е твърде бърз за очите – и за часовниците от XVII век. Затова Галилео Галилей решава да „забави“ падането. В книгата
            си „Беседи за две нови науки“ (1638) той описва как пуска бронзово топче по гладък жлеб в наклонена дъска, дълга около 12 лакътя, а
            времето мери, като събира и претегля водата, изтекла от съд през тънка тръбичка. Резултатът го изненадва: пътищата, изминати през
            равни интервали време, се отнасят като <strong>нечетните числа 1 : 3 : 5 : 7</strong>. Това е първият закон за ускореното движение,
            открит с опит.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Положение, път и преместване</h2>
          <p className={text}>
            За да опишем движение, ни трябва <strong>отправна система</strong>: тяло, спрямо което мерим (пътят, перонът, Земята), ос с посока и
            часовник. При движение по права положението се задава с една координата <Tex>{'x'}</Tex>, която може да е и отрицателна.
          </p>
          <Theorem
            type="definition"
            title="Преместване и път"
            description="Преместването е промяната на координатата: $\Delta x = x_2 - x_1$. То има знак – показва и посоката. Изминатият път $s$ е дължината на целия изминат отрязък и никога не е отрицателен. Ако се върнеш у дома, пътят ти е няколко километра, а преместването – нула."
          />
          <Theorem
            type="definition"
            title="Средна скорост"
            description="Средната скорост е целият път, разделен на цялото време: $v_{\text{ср}} = \frac{s}{t}$. Тя обикновено НЕ е средното аритметично на скоростите."
          />
          <Example
            description="Кола изминава 60 km с 60 km/h и после още 60 km с 40 km/h. Каква е средната ѝ скорост?"
            steps={['$t_1 = \\frac{60}{60} = 1\\ \\mathrm{h}$, $t_2 = \\frac{60}{40} = 1{,}5\\ \\mathrm{h}$', '$v_{\\text{ср}} = \\frac{120}{2{,}5} = 48\\ \\mathrm{km/h}$, а не 50 – с по-ниската скорост колата се движи по-дълго.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Равномерно движение</h2>
          <Theorem
            title="Закон за равномерното движение"
            description="Ако скоростта $v$ е постоянна, тялото изминава равни пътища за равни интервали време и $x = x_0 + vt$. Графиката $x(t)$ е права с наклон $v$, а $v(t)$ е хоризонтална права. Лицето под $v(t)$ от 0 до $t$ е $vt$ – преместването."
          />
          <p className={text}>
            Най-удобният начин да решаваме задачи за срещане и догонване е да запишем закона за движение на всяко тяло в <strong>една и съща</strong>{' '}
            отправна система и да приравним координатите им.
          </p>
          <Example
            description="От София и от Пловдив, които са на около 150 km един от друг по магистралата, едновременно тръгват една срещу друга две коли: от София със 100 km/h, от Пловдив с 80 km/h. Кога и къде ще се срещнат?"
            steps={[
              'Оста е от София към Пловдив: $x_1 = 100t$, $x_2 = 150 - 80t$ (в km и h).',
              'При срещата $x_1 = x_2$: $100t = 150 - 80t \\Rightarrow t = \\frac{150}{180} \\approx 0{,}833\\ \\mathrm{h} = 50\\ \\mathrm{min}$',
              '$x = 100 \\cdot 0{,}833 \\approx 83{,}3\\ \\mathrm{km}$ от София.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Ускорение и равноускорително движение</h2>
          <Theorem
            type="definition"
            title="Ускорение"
            description="Ускорението показва колко бързо се мени скоростта: $a = \frac{\Delta v}{\Delta t}$, единица $\mathrm{m/s^2}$. Ускорение $2\ \mathrm{m/s^2}$ значи, че скоростта нараства с $2\ \mathrm{m/s}$ всяка секунда. Ако $a$ и $v$ имат различни знаци, тялото се забавя."
          />
          <Theorem
            title="Равноускорително движение ($a$ = const)"
            description="Скоростта е $v = v_0 + at$, координатата е $x = x_0 + v_0 t + \frac{at^2}{2}$, а без времето: $v^2 - v_0^2 = 2a(x - x_0)$. Третата формула е удобна, когато времето не ни интересува – например за спирачен път."
          />
          <p className={text}>
            Втората формула следва от графиката: лицето под правата <Tex>{'v = v_0 + at'}</Tex> е <Term id="trapezoid">трапец</Term> с лице{' '}
            <Tex>{'\\frac{v_0 + v}{2} \\cdot t = v_0 t + \\frac{at^2}{2}'}</Tex>. На езика на математическия анализ скоростта е <Term id="derivative">производната</Term> на
            положението, <Tex>{"v = x'(t)"}</Tex>, а ускорението – производната на скоростта (виж{' '}
            <Link to="/analysis/derivatives" className={link}>
              Производни
            </Link>{' '}
            и{' '}
            <Link to="/analysis/integrals" className={link}>
              Интеграли
            </Link>
            ).
          </p>
          <MotionGraphsLab />
          <Example
            description="Кола се движи с 20 m/s и спира равнозакъснително със забавяне 5 m/s². За колко време и на какво разстояние спира?"
            steps={['$0 = 20 - 5t \\Rightarrow t = 4\\ \\mathrm{s}$', '$s = 20 \\cdot 4 - \\frac{5 \\cdot 4^2}{2} = 80 - 40 = 40\\ \\mathrm{m}$', 'Проверка с третата формула: $s = \\frac{v_0^2}{2a} = \\frac{400}{10} = 40\\ \\mathrm{m}$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Спирачен път и безопасност</h2>
          <p className={text}>
            Докато шофьорът осъзнае опасността и премести крака на спирачката, минава около секунда. През това време колата се движи с пълна
            скорост. Затова <strong>опасният път</strong> има две части: път на реакцията <Tex>{'vt_r'}</Tex> и спирачен път{' '}
            <Tex>{'\\frac{v^2}{2a}'}</Tex>. Втората расте с квадрата на скоростта – при двойно по-висока скорост спирачният път е 4 пъти по-дълъг.
          </p>
          <BrakingLab />
          <Example
            description="Кола с 50 km/h едва успява да спре пред препятствие (реакция 1 s, забавяне 7 m/s²). С каква скорост ще удари същото препятствие кола, която кара с 60 km/h?"
            steps={[
              'При 50 km/h ($13{,}9\\ \\mathrm{m/s}$): $13{,}9 \\cdot 1 + \\frac{13{,}9^2}{14} \\approx 27{,}7\\ \\mathrm{m}$ – на толкова е препятствието.',
              'При 60 km/h ($16{,}7\\ \\mathrm{m/s}$) за реакцията колата изминава $16{,}7\\ \\mathrm{m}$ и има само $11{,}0\\ \\mathrm{m}$ за спиране.',
              '$v^2 = 16{,}7^2 - 2 \\cdot 7 \\cdot 11{,}0 \\approx 124 \\Rightarrow v \\approx 11{,}1\\ \\mathrm{m/s} \\approx 40\\ \\mathrm{km/h}$',
              'Само 10 km/h повече в началото – и вместо да спре, колата удря с 40 km/h.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Свободно падане</h2>
          <Theorem
            title="Свободно падане"
            description="Без съпротивление на въздуха всички тела близо до повърхността на Земята падат с едно и също ускорение $g \approx 9{,}81\ \mathrm{m/s^2}$ (в задачите често $10\ \mathrm{m/s^2}$). Пуснато от покой тяло има $v = gt$ и изминава $h = \frac{gt^2}{2}$. Затова пътищата през последователни секунди се отнасят като $1 : 3 : 5 : 7 : \ldots$"
          />
          <p className={text}>
            Тяло, хвърлено нагоре, се движи със същото ускорение <Tex>{'g'}</Tex>, насочено надолу, през <strong>цялото</strong> време – и при
            качването, и в най-високата точка, и при спускането. На други планети <Tex>{'g'}</Tex> е различно (виж{' '}
            <Link to="/astronomy/lecture06" className={link}>
              Гравитация
            </Link>
            ).
          </p>
          <Example
            description="Топка е хвърлена право нагоре с 20 m/s ($g = 10\ \mathrm{m/s^2}$). Кога спира, колко високо стига и кога се връща?"
            steps={['$0 = 20 - 10t \\Rightarrow t = 2\\ \\mathrm{s}$ до най-високата точка', '$h = \\frac{v_0^2}{2g} = \\frac{400}{20} = 20\\ \\mathrm{m}$', 'Движението е симетрично: обратно пада пак за 2 s, т.е. се връща след 4 s със скорост 20 m/s надолу.']}
          />
          <p className={text}>
            Свободното падане дава и прост начин да измериш реакцията си: приятел пуска линийка между пръстите ти, а от изминатия път{' '}
            <Tex>{'d'}</Tex> намираш времето <Tex>{'t = \\sqrt{2d/g}'}</Tex>.
          </p>
          <ReactionRulerLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 12,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Движението около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Средна скорост', '$\\frac{60 + 40}{2} = 50\\ \\mathrm{km/h}$', 'Цял път през цяло време: при равни пътища $48\\ \\mathrm{km/h}$'],
              ['Път и преместване', 'отиване и връщане по 5 km: преместване 10 km', 'пътят е 10 km, а преместването е 0'],
              ['Знак на ускорението', '$a < 0$ значи забавяне', 'забавяне има, когато $a$ и $v$ са с различни знаци'],
              ['Най-високата точка', '$v = 0 \\Rightarrow a = 0$', 'там $v = 0$, но $a = g$ – иначе топката би останала във въздуха'],
              ['Забравена начална скорост', '$s = \\frac{at^2}{2}$ винаги', '$s = v_0 t + \\frac{at^2}{2}$; без $v_0 t$ само при старт от покой'],
              ['km/h във формулата', '$s = \\frac{50^2}{2 \\cdot 7} \\approx 179\\ \\mathrm{m}$', 'първо $50\\ \\mathrm{km/h} \\approx 13{,}9\\ \\mathrm{m/s}$: $s \\approx 13{,}8\\ \\mathrm{m}$'],
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
              <Task id="a1" number={1} color="border-green-500" question="Законът за движение на тяло е $x = 5 + 3t - t^2$ (в SI). Намерете началната координата, началната скорост и ускорението." check={[5, 3, -2]} ask={['$x_0$, m', '$v_0$, m/s', '$a$, m/s²']}>
                <p>Сравняваме с <Tex>{'x = x_0 + v_0 t + \\frac{at^2}{2}'}</Tex>.</p>
                <p><Tex>{'x_0 = 5\\ \\mathrm{m}'}</Tex>, <Tex>{'v_0 = 3\\ \\mathrm{m/s}'}</Tex>, <Tex>{'\\frac{a}{2} = -1 \\Rightarrow a = -2\\ \\mathrm{m/s^2}'}</Tex>.</p>
                <p>Тялото се забавя и при <Tex>{'t = 1{,}5\\ \\mathrm{s}'}</Tex> обръща посоката си.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Кола ускорява от 0 до 100 km/h за 8 s. Какво е средното ѝ ускорение?" check={[3.47]} ask={['$a$, m/s²']}>
                <p><Tex>{'100\\ \\mathrm{km/h} = 100 : 3{,}6 \\approx 27{,}8\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'a = \\frac{\\Delta v}{\\Delta t} = \\frac{27{,}8}{8} \\approx 3{,}47\\ \\mathrm{m/s^2}'}</Tex> – около една трета от <Tex>{'g'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Камък пада свободно от 45 m ($g = 10\ \mathrm{m/s^2}$). За колко време пада и с каква скорост удря земята?" check={[3, 30]} ask={['време, s', 'скорост, m/s']}>
                <p><Tex>{'t = \\sqrt{\\frac{2h}{g}} = \\sqrt{9} = 3\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'v = gt = 30\\ \\mathrm{m/s}'}</Tex> (= 108 km/h).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Кола минава с постоянни 20 m/s покрай спрял полицай. В същия момент полицаят тръгва след нея с ускорение 4 m/s². След колко секунди и на какво разстояние ще я настигне?" check={[10, 200]} ask={['време, s', 'разстояние, m']}>
                <p><Tex>{'x_1 = 20t'}</Tex>, <Tex>{'x_2 = \\frac{4t^2}{2} = 2t^2'}</Tex>.</p>
                <p><Tex>{'20t = 2t^2 \\Rightarrow t = 10\\ \\mathrm{s}'}</Tex> (другото решение <Tex>{'t = 0'}</Tex> е началният момент).</p>
                <p><Tex>{'x = 20 \\cdot 10 = 200\\ \\mathrm{m}'}</Tex>. Тогава полицаят има скорост 40 m/s – двойно по-голяма от тази на колата.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Тяло пада свободно от покой. Колко пъти пътят през третата секунда е по-голям от пътя през първата? Колко метра е той ($g = 9{,}8\ \mathrm{m/s^2}$)?" check={[5, 24.5]} ask={['пъти', 'път през 3-тата секунда, m']}>
                <p>За <Tex>{'n'}</Tex> секунди тялото изминава <Tex>{'\\frac{gn^2}{2}'}</Tex>; през <Tex>{'n'}</Tex>-тата секунда – <Tex>{'\\frac{g}{2}(n^2 - (n - 1)^2) = \\frac{g}{2}(2n - 1)'}</Tex>.</p>
                <p>За <Tex>{'n = 1'}</Tex> и <Tex>{'n = 3'}</Tex>: <Tex>{'\\frac{2 \\cdot 3 - 1}{2 \\cdot 1 - 1} = 5'}</Tex> пъти – нечетните числа на Галилей.</p>
                <p><Tex>{'s_3 = 4{,}9 \\cdot 5 = 24{,}5\\ \\mathrm{m}'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Скоростта на бегач нараства равномерно от 0 до 12 m/s за 4 s, след това е постоянна 6 s, а накрая намалява равномерно до 0 за 3 s. Намерете целия път и средната скорост." check={[114, 8.77]} ask={['път, m', 'средна скорост, m/s']}>
                <p>Пътят е лицето под графиката <Tex>{'v(t)'}</Tex> – трапец.</p>
                <p><Tex>{'s = \\frac{12 \\cdot 4}{2} + 12 \\cdot 6 + \\frac{12 \\cdot 3}{2} = 24 + 72 + 18 = 114\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'v_{\\text{ср}} = \\frac{114}{13} \\approx 8{,}77\\ \\mathrm{m/s}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="От височина 45 m пускат топка. В същия момент от земята точно под нея хвърлят друга топка нагоре с 30 m/s. Кога и на каква височина ще се срещнат? ($g = 10\ \mathrm{m/s^2}$)" check={[1.5, 33.75]} ask={['време, s', 'височина, m']}>
                <p><Tex>{'y_1 = 45 - 5t^2'}</Tex>, <Tex>{'y_2 = 30t - 5t^2'}</Tex>.</p>
                <p>Членовете с <Tex>{'t^2'}</Tex> се съкращават: <Tex>{'45 = 30t \\Rightarrow t = 1{,}5\\ \\mathrm{s}'}</Tex>.</p>
                <p><Tex>{'y = 45 - 5 \\cdot 2{,}25 = 33{,}75\\ \\mathrm{m}'}</Tex>.</p>
                <p>Защо членовете се съкращават? В системата на падащата топка двете топки нямат ускорение една спрямо друга – втората просто се приближава с 30 m/s и изминава 45 m за 1,5 s.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Пускаш камък в кладенец и чуваш плясъка след 3 s. Колко е дълбок кладенецът? ($g = 9{,}8\ \mathrm{m/s^2}$, скорост на звука 340 m/s)" check={[40.7]} ask={['дълбочина, m']}>
                <p>Нека камъкът пада <Tex>{'t_1'}</Tex> секунди, а звукът се връща за <Tex>{'3 - t_1'}</Tex>: <Tex>{'\\frac{9{,}8\\,t_1^2}{2} = 340(3 - t_1)'}</Tex>.</p>
                <p><Tex>{'4{,}9\\,t_1^2 + 340\\,t_1 - 1020 = 0 \\Rightarrow t_1 = \\frac{-340 + \\sqrt{340^2 + 4 \\cdot 4{,}9 \\cdot 1020}}{9{,}8} \\approx 2{,}88\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'h = 4{,}9 \\cdot 2{,}88^2 \\approx 40{,}7\\ \\mathrm{m}'}</Tex>. Ако забравим звука, получаваме 44,1 m – грешка от около 8%.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Между два светофара има 300 m. Кола тръгва от покой с ускорение 2 m/s², а после спира със забавяне 4 m/s² точно на втория светофар. Какво е най-краткото време за пътя и каква е най-голямата скорост (в km/h)?" check={[21.2, 102]} ask={['време, s', 'скорост, km/h']}>
                <p>Най-бързо е без участък с постоянна скорост: ускоряване <Tex>{'t_1'}</Tex> до <Tex>{'v_{\\max} = 2t_1'}</Tex>, после спиране за <Tex>{'t_2 = \\frac{v_{\\max}}{4} = \\frac{t_1}{2}'}</Tex>.</p>
                <p><Tex>{'s = \\frac{2t_1^2}{2} + \\frac{4t_2^2}{2} = t_1^2 + \\frac{t_1^2}{2} = 1{,}5\\,t_1^2 = 300 \\Rightarrow t_1 = \\sqrt{200} \\approx 14{,}1\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'t = 1{,}5\\,t_1 \\approx 21{,}2\\ \\mathrm{s}'}</Tex>, <Tex>{'v_{\\max} = 2t_1 \\approx 28{,}3\\ \\mathrm{m/s} \\approx 102\\ \\mathrm{km/h}'}</Tex> – твърде много за градско движение.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Преместването <Tex>{'\\Delta x'}</Tex> има знак, пътят – не; средната скорост е целият път през цялото време</li>
              <li>✓ Равномерно движение: <Tex>{'x = x_0 + vt'}</Tex>; наклонът на <Tex>{'x(t)'}</Tex> е скоростта</li>
              <li>✓ <Tex>{'v = v_0 + at'}</Tex>, <Tex>{'x = x_0 + v_0 t + \\frac{at^2}{2}'}</Tex>, <Tex>{'v^2 - v_0^2 = 2a\\Delta x'}</Tex></li>
              <li>✓ Лицето под <Tex>{'v(t)'}</Tex> е преместването; наклонът на <Tex>{'v(t)'}</Tex> е ускорението</li>
              <li>✓ Опасен път = <Tex>{'vt_r + \\frac{v^2}{2a}'}</Tex>; спирачният път расте с квадрата на скоростта</li>
              <li>✓ Свободно падане: <Tex>{'g \\approx 9{,}81\\ \\mathrm{m/s^2}'}</Tex> за всички тела, насочено надолу и в най-високата точка</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              На 10 декември 1954 г. американският военен лекар Джон Пол Стап се качва на ракетна шейна, ускорява до около 1017 km/h и спира за
              около 1,4 s. В пика забавянето му е около 46 <Tex>{'g'}</Tex> – тялото му за миг „тежи“ 46 пъти повече. Стап оцелява с временни
              увреждания на очите, а опитите му показват, че човек може да издържи много по-големи претоварвания, отколкото се е смятало. Те
              помагат за въвеждането на предпазните колани в колите.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
