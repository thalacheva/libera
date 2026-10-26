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
import ElectronSlitLab from './ElectronSlitLab';
import PhotoelectricLab from './PhotoelectricLab';
import StoppingVoltageLab from './StoppingVoltageLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.25 → 0{,}25. */
const dec = (v: number) => String(Number(v.toFixed(6))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6, 7]);
  if (kind === 0) {
    const lam = pick([124, 248, 310, 496, 620]);
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm}`,
      ask: 'Енергия на фотона: $E = ?\\ \\mathrm{eV}$',
      num: 1240,
      den: lam,
      steps: ['$E = \\frac{hc}{\\lambda}$, а $hc \\approx 1240\\ \\mathrm{eV \\cdot nm}$', `$E = \\frac{1240}{${lam}} = ${dec(1240 / lam)}\\ \\mathrm{eV}$`],
    };
  }
  if (kind === 1) {
    const [lam, A10] = [pick([248, 310]), pick([21, 23, 24])];
    const E10 = 12400 / lam;
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm},\\ A = ${dec(A10 / 10)}\\ \\mathrm{eV}`,
      ask: 'Най-голяма кинетична енергия: $E_k = ?\\ \\mathrm{eV}$',
      num: E10 - A10,
      den: 10,
      steps: [`$hf = \\frac{1240}{${lam}} = ${dec(E10 / 10)}\\ \\mathrm{eV}$`, `$E_k = hf - A = ${dec(E10 / 10)} - ${dec(A10 / 10)} = ${dec((E10 - A10) / 10)}\\ \\mathrm{eV}$`],
    };
  }
  if (kind === 2) {
    const A10 = pick([20, 25, 31, 40, 50]);
    return {
      tex: `A = ${dec(A10 / 10)}\\ \\mathrm{eV}`,
      ask: 'Червена граница: $\\lambda_0 = ?\\ \\mathrm{nm}$',
      num: 12400,
      den: A10,
      steps: ['При $\\lambda_0$ фотонът стига точно за $A$: $\\frac{hc}{\\lambda_0} = A$', `$\\lambda_0 = \\frac{1240}{${dec(A10 / 10)}} = ${dec(1240 / (A10 / 10))}\\ \\mathrm{nm}$`],
    };
  }
  if (kind === 3) {
    const [lam, U10] = [pick([248, 310]), pick([12, 15, 25])];
    const E10 = 12400 / lam;
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm},\\ U_s = ${dec(U10 / 10)}\\ \\mathrm{V}`,
      ask: 'Отделителна работа: $A = ?\\ \\mathrm{eV}$',
      num: E10 - U10,
      den: 10,
      steps: [`$hf = \\frac{1240}{${lam}} = ${dec(E10 / 10)}\\ \\mathrm{eV}$, а $E_k = eU_s = ${dec(U10 / 10)}\\ \\mathrm{eV}$`, `$A = hf - eU_s = ${dec((E10 - U10) / 10)}\\ \\mathrm{eV}$`],
    };
  }
  if (kind === 4) {
    const lam = pick([330, 440, 660]);
    return {
      tex: `\\lambda = ${lam}\\ \\mathrm{nm},\\ h = 6{,}6 \\cdot 10^{-34}\\ \\mathrm{J \\cdot s}`,
      ask: 'Импулс на фотона: $p = ?\\ \\cdot 10^{-27}\\ \\mathrm{kg \\cdot m/s}$',
      num: 660,
      den: lam,
      steps: ['$p = \\frac{h}{\\lambda}$', `$p = \\frac{6{,}6 \\cdot 10^{-34}}{${lam} \\cdot 10^{-9}} = ${dec(660 / lam)} \\cdot 10^{-27}\\ \\mathrm{kg \\cdot m/s}$`],
    };
  }
  if (kind === 5) {
    const E100 = pick([125, 200, 250, 500]);
    return {
      tex: `P = 1\\ \\mathrm{mW},\\ E = ${dec(E100 / 100)}\\ \\mathrm{eV}`,
      ask: 'Фотони за секунда: $N = ?\\ \\cdot 10^{15}$',
      num: 625,
      den: E100,
      steps: [
        `$E = ${dec(E100 / 100)} \\cdot 1{,}6 \\cdot 10^{-19}\\ \\mathrm{J}$`,
        `$N = \\frac{P}{E} = \\frac{10^{-3}}{${dec((E100 / 100) * 1.6)} \\cdot 10^{-19}} = ${dec(6.25 / (E100 / 100))} \\cdot 10^{15}$`,
      ],
    };
  }
  if (kind === 6) {
    const U10 = pick([15, 20, 25, 30]);
    return {
      tex: `U_s = ${dec(U10 / 10)}\\ \\mathrm{V}`,
      ask: 'Енергия на най-бързите електрони: $E_k = ?\\ \\cdot 10^{-19}\\ \\mathrm{J}$',
      num: U10 * 16,
      den: 100,
      steps: ['$E_k = eU_s$, $e = 1{,}6 \\cdot 10^{-19}\\ \\mathrm{C}$', `$E_k = 1{,}6 \\cdot 10^{-19} \\cdot ${dec(U10 / 10)} = ${dec((U10 * 16) / 100)} \\cdot 10^{-19}\\ \\mathrm{J}$`],
    };
  }
  const n = pick([2, 3, 4]);
  return {
    tex: `U_1 = 100\\ \\mathrm{V} \\to \\lambda_1 = 0{,}12\\ \\mathrm{nm}`,
    ask: `Електрон, ускорен с ${100 * n * n} V: $\\lambda_2 = ?\\ \\mathrm{nm}$`,
    num: 12,
    den: 100 * n,
    steps: [
      '$\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2meU}}$, т.е. $\\lambda \\propto \\frac{1}{\\sqrt{U}}$',
      `Напрежението е ${n * n} пъти по-голямо, затова $\\lambda_2 = \\frac{0{,}12}{${n}} = ${dec(0.12 / n)}\\ \\mathrm{nm}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '☀️ Защо изгаряме на слънце',
    problem:
      'Ултравиолетовите лъчи UVB (около 300 nm) причиняват слънчево изгаряне, а червената светлина (700 nm) – не, колкото и да е ярка. Каква е енергията на един UVB фотон в eV и колко пъти е по-голяма от тази на червения?',
    solution: [
      '$E_{\\text{UV}} = \\frac{1240}{300} \\approx 4{,}13\\ \\mathrm{eV}$, $E_{\\text{черв}} = \\frac{1240}{700} \\approx 1{,}77\\ \\mathrm{eV}$',
      '$\\frac{E_{\\text{UV}}}{E_{\\text{черв}}} = \\frac{700}{300} \\approx 2{,}33$',
      'Химичните връзки в молекулите (и в ДНК) са от порядъка на няколко eV. UV фотонът може да скъса връзка сам; червеният – не, а много червени фотони не се „събират“ в една молекула.',
    ],
    answer: '$\\approx 4{,}13\\ \\mathrm{eV}$, $\\approx 2{,}33$ пъти',
    check: [4.13, 2.33],
    ask: ['E, eV', 'пъти'],
  },
  {
    title: '🔴 Лазерна показалка',
    problem: 'Червена лазерна показалка с мощност 5 mW свети с λ = 650 nm. Колко фотона излъчва за една секунда?',
    solution: [
      '$E = \\frac{hc}{\\lambda} = \\frac{6{,}63 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8}{650 \\cdot 10^{-9}} \\approx 3{,}06 \\cdot 10^{-19}\\ \\mathrm{J}$',
      '$N = \\frac{P}{E} = \\frac{5 \\cdot 10^{-3}}{3{,}06 \\cdot 10^{-19}} \\approx 1{,}63 \\cdot 10^{16}$ фотона в секунда – затова не забелязваме „порциите“.',
    ],
    answer: '$\\approx 1{,}63 \\cdot 10^{16}$',
    check: [1.63],
    ask: ['N, ·10¹⁶ в секунда'],
  },
  {
    title: '🧪 Фотоклетка с цезий',
    problem: 'Катодът на фотоклетка е покрит с цезий (A ≈ 2,1 eV). До каква най-голяма дължина на вълната ще работи клетката?',
    solution: ['Червената граница: $\\frac{hc}{\\lambda_0} = A$', '$\\lambda_0 = \\frac{1240}{2{,}1} \\approx 590\\ \\mathrm{nm}$ – жълто-оранжево. Червената светлина вече не избива електрони от цезия.'],
    answer: '$\\approx 590\\ \\mathrm{nm}$',
    check: [590],
    ask: ['λ₀, nm'],
  },
  {
    title: '⛵ Слънчево платно',
    problem:
      'Огледално платно с площ 100 m² е разположено перпендикулярно на слънчевите лъчи близо до Земята, където интензитетът е 1360 W/m². С каква сила го бута светлината?',
    solution: [
      'Погълнатата светлина дава сила $\\frac{P}{c}$; отразената – двойно повече, защото импулсът на фотоните се обръща.',
      '$F = \\frac{2IS}{c} = \\frac{2 \\cdot 1360 \\cdot 100}{3 \\cdot 10^8} \\approx 9{,}07 \\cdot 10^{-4}\\ \\mathrm{N} \\approx 0{,}907\\ \\mathrm{mN}$',
      'Силата е мъничка, но действа постоянно и без гориво – за месеци скоростта нараства значително.',
    ],
    answer: '$\\approx 0{,}907\\ \\mathrm{mN}$',
    check: [0.907],
    ask: ['F, mN'],
  },
  {
    title: '🔬 Електронен микроскоп',
    problem: 'В електронен микроскоп електроните се ускоряват с напрежение 10 kV. Каква е дължината на вълната им (в pm)? Сравни с видимата светлина.',
    solution: [
      '$p = \\sqrt{2meU} = \\sqrt{2 \\cdot 9{,}11 \\cdot 10^{-31} \\cdot 1{,}6 \\cdot 10^{-19} \\cdot 10^4} \\approx 5{,}40 \\cdot 10^{-23}\\ \\mathrm{kg \\cdot m/s}$',
      '$\\lambda = \\frac{h}{p} = \\frac{6{,}63 \\cdot 10^{-34}}{5{,}40 \\cdot 10^{-23}} \\approx 1{,}23 \\cdot 10^{-11}\\ \\mathrm{m} = 12{,}3\\ \\mathrm{pm}$',
      'Около 40 000 пъти по-къса от зелената светлина – затова електронният микроскоп различава много по-фини детайли. (При 10 kV поправката от теорията на относителността е около 0,5%.)',
    ],
    answer: '$\\approx 12{,}3\\ \\mathrm{pm}$',
    check: [12.3],
    ask: ['λ, pm'],
  },
  {
    title: '📻 Радиостанция',
    problem: 'Радиостанция излъчва с мощност 100 kW на честота 100 MHz. Колко фотона излъчва за секунда?',
    solution: [
      '$E = hf = 6{,}63 \\cdot 10^{-34} \\cdot 10^8 = 6{,}63 \\cdot 10^{-26}\\ \\mathrm{J}$',
      '$N = \\frac{P}{E} = \\frac{10^5}{6{,}63 \\cdot 10^{-26}} \\approx 1{,}51 \\cdot 10^{30}$ в секунда. При толкова много нищожни порции радиовълната е напълно „непрекъсната“ и класическата теория работи отлично.',
    ],
    answer: '$\\approx 1{,}51 \\cdot 10^{30}$',
    check: [1.51],
    ask: ['N, ·10³⁰ в секунда'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'От какво зависи енергията на един фотон?',
    answers: ['от честотата на светлината', 'от яркостта на светлината', 'от времето на осветяване', 'от площта на осветената повърхност'],
    correctAnswer: 'от честотата на светлината',
  },
  {
    question: 'Увеличаваме яркостта на светлината, без да сменяме цвета ѝ. Какво става с фотоелектроните?',
    answers: ['стават повече, а максималната им енергия не се мени', 'стават по-бързи', 'стават по-малко, но по-бързи', 'нищо не се променя'],
    correctAnswer: 'стават повече, а максималната им енергия не се мени',
  },
  {
    question: 'Какво е червената граница на фотоефекта?',
    answers: ['най-голямата дължина на вълната, при която още има фотоефект', 'най-малката дължина на вълната, при която има фотоефект', 'дължината на вълната на червената светлина', 'най-голямата скорост на електроните'],
    correctAnswer: 'най-голямата дължина на вълната, при която още има фотоефект',
  },
  {
    question: 'Кой фотон има най-голяма енергия?',
    answers: ['рентгеновият', 'зеленият', 'инфрачервеният', 'на радиовълните'],
    correctAnswer: 'рентгеновият',
  },
  {
    question: 'На колко джаула е равен 1 eV?',
    answers: ['$1{,}6 \\cdot 10^{-19}\\ \\mathrm{J}$', '$6{,}63 \\cdot 10^{-34}\\ \\mathrm{J}$', '$1\\ \\mathrm{J}$', '$9{,}11 \\cdot 10^{-31}\\ \\mathrm{J}$'],
    correctAnswer: '$1{,}6 \\cdot 10^{-19}\\ \\mathrm{J}$',
  },
  {
    question: 'На какво е равен наклонът на графиката на спиращото напрежение $U_s$ като функция на честотата $f$?',
    answers: ['$\\frac{h}{e}$', '$h$', '$\\frac{A}{e}$', '$\\frac{e}{h}$'],
    correctAnswer: '$\\frac{h}{e}$',
  },
  {
    question: 'Скоростта на един електрон се удвоява. Какво става с дължината на вълната му на дьо Бройл?',
    answers: ['намалява наполовина', 'удвоява се', 'не се променя', 'намалява 4 пъти'],
    correctAnswer: 'намалява наполовина',
  },
  {
    question: 'Какво показва ефектът на Комптън?',
    answers: ['че фотоните имат импулс', 'че светлината интерферира', 'че електроните имат заряд', 'че светлината се пречупва'],
    correctAnswer: 'че фотоните имат импулс',
  },
  {
    question: 'Защо във фотолабораториите се използва червена светлина?',
    answers: ['червените фотони нямат достатъчно енергия, за да осветят фотохартията', 'червената светлина е най-слаба', 'червената светлина не се отразява', 'окото не вижда червено на тъмно'],
    correctAnswer: 'червените фотони нямат достатъчно енергия, за да осветят фотохартията',
  },
];

// ---------- Страница ----------

const SPECTRUM: [string, string, string][] = [
  ['радио (FM)', '100 MHz', '4 · 10⁻⁷'],
  ['микровълни', '2,45 GHz', '10⁻⁵'],
  ['инфрачервено', '10 µm', '0,12'],
  ['червено', '700 nm', '1,8'],
  ['виолетово', '400 nm', '3,1'],
  ['ултравиолетово', '250 nm', '5'],
  ['рентгеново', '0,1 nm', '12 400'],
];

const METALS: [string, string, string][] = [
  ['цезий', '2,1', '590'],
  ['калий', '2,3', '540'],
  ['натрий', '2,4', '520'],
  ['калций', '2,9', '430'],
  ['цинк', '4,3', '290'],
  ['мед', '4,7', '260'],
  ['платина', '5,6', '220'],
];

const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="w-full text-sm sm:text-base border-collapse">
        <thead>
          <tr>
            {head.map(h => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={td}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Photons() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Фотони и фотоефект</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            💡 През 1905 г. Айнщайн предлага смела идея: светлината се поглъща на порции – кванти. Американецът Робърт Миликан не вярва в нея и
            години наред мери фотоефекта все по-прецизно – с метали, които почиства с нож във вакуум. През 1916 г. резултатът е ясен:
            уравнението на Айнщайн е вярно, а от опитите излиза константата на Планк с отклонение под 1% от днешната стойност. Миликан
            въпреки това пише, че теорията зад уравнението му изглежда несъстоятелна. Нобеловата награда на Айнщайн (за 1921 г.) е именно за
            закона на фотоефекта – не за теорията на относителността.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Светлината идва на порции</h2>
          <p className={text}>
            В края на XIX век светлината е „решен въпрос“: тя е <Term id="em-wave">електромагнитна вълна</Term> (виж{' '}
            <Link to="/physics/electricity/ac-em-waves" className={link}>
              Променлив ток и ЕМ вълни
            </Link>{' '}
            и{' '}
            <Link to="/physics/optics/wave-optics" className={link}>
              Вълнова оптика
            </Link>
            ). Но през 1900 г. Макс Планк успява да обясни <Term id="spectrum">спектъра</Term> на нагрято тяло само като приеме, че енергията се излъчва на порции{' '}
            <Tex>{'E = hf'}</Tex> (повече за топлинното излъчване – в урока{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>
            ). Самият Планк смята това за математически трик. Айнщайн отива по-далеч: самата светлина се състои от порции – по-късно наречени{' '}
            <strong>фотони</strong>.
          </p>
          <Theorem
            type="definition"
            title="Фотон"
            description="Фотонът е най-малката порция електромагнитно излъчване. Той се движи със скоростта на светлината $c$, няма маса на покой и се поглъща или излъчва цял – „половин фотон“ не съществува."
          />
          <Theorem
            title="Енергия на фотона"
            description="$E = hf = \frac{hc}{\lambda}$, където $h \approx 6{,}63 \cdot 10^{-34}\ \mathrm{J \cdot s}$ е константата на Планк. В атомната физика енергията се мери в електронволтове: $1\ \mathrm{eV} = 1{,}6 \cdot 10^{-19}\ \mathrm{J}$ – енергията, която получава електрон при ускоряване с 1 V. Удобно правило: $E\,[\mathrm{eV}] \approx \frac{1240}{\lambda\,[\mathrm{nm}]}$."
          />
          <Table head={['Излъчване', 'f или λ', 'E на фотона, eV']} rows={SPECTRUM} />
          <Example
            description="Каква е енергията на фотон от червената (700 nm) и от виолетовата (400 nm) светлина?"
            steps={['$E_{\\text{черв}} = \\frac{1240}{700} \\approx 1{,}77\\ \\mathrm{eV}$', '$E_{\\text{виол}} = \\frac{1240}{400} = 3{,}1\\ \\mathrm{eV}$ – виолетовият фотон носи почти два пъти повече енергия.']}
          />
          <p className={text}>
            Енергиите на <Term id="chemical-bond">химичните връзки</Term> са от <Term id="order-of-magnitude">порядъка</Term> на няколко eV. Затова видимата светлина задейства зрението и <Term id="photosynthesis">фотосинтезата</Term>, ултравиолетът
            вече руши молекули, а радиовълните не могат да скъсат нито една връзка, колкото и мощен да е предавателят.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Фотоефектът: опитите, които вълните не обясняват</h2>
          <p className={text}>
            През 1887 г. Хайнрих Херц забелязва, че искрата прескача по-лесно, когато електродите са осветени с ултравиолет. Оказва се, че
            светлината избива електрони от метала – това е <strong>фотоефектът</strong>. Филип Ленард изследва избитите електрони (1902 г.)
            и открива закономерности, които вълновата теория не може да обясни:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>броят на избитите електрони (<Term id="electric-current">токът</Term> на насищане) е пропорционален на яркостта на светлината;</li>
            <li>най-голямата <Term id="kinetic-energy">кинетична енергия</Term> на електроните <strong>не зависи от яркостта</strong>, а расте с <Term id="frequency">честотата</Term>;</li>
            <li>за всеки метал има <strong>червена граница</strong> – под определена честота няма фотоефект, колкото и ярка да е светлината;</li>
            <li>електроните излитат веднага – дори при съвсем слаба светлина няма забавяне.</li>
          </ul>
          <p className={text}>
            Според вълновата теория по-ярката вълна трябва да „разклаща“ електроните по-силно и да ги изхвърля по-бързо, а слабата светлина –
            да ги „натрупва“ енергия дълго време, преди да излетят. Опитите показват обратното.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Уравнението на Айнщайн</h2>
          <p className={text}>
            Обяснението на Айнщайн е просто: един фотон се поглъща от един електрон и му предава цялата си енергия. Част от нея отива, за да
            излезе електронът от метала – това е <strong>отделителната работа</strong> <Tex>{'A'}</Tex>. Останалото е кинетична енергия.
            Електроните по-навътре в метала губят още енергия по пътя, затова уравнението дава <em>най-голямата</em> кинетична енергия.
          </p>
          <Theorem
            title="Уравнение на Айнщайн за фотоефекта"
            description="$hf = A + E_{k,\max}$. Фотоефект има само ако $hf \ge A$, т.е. при честота над $f_0 = \frac{A}{h}$ или дължина на вълната под червената граница $\lambda_0 = \frac{hc}{A}$."
          />
          <Theorem
            title="Спиращо напрежение"
            description="Ако анодът е с отрицателен потенциал спрямо катода, полето спира електроните. Токът изчезва при спиращото напрежение $U_s$, за което $eU_s = E_{k,\max} = hf - A$. Ако енергията е в eV, $U_s$ във волтове е същото число."
          />
          <Table head={['Метал', 'A, eV (прибл.)', 'λ₀, nm']} rows={METALS} />
          <p className={text}>
            Стойностите са приблизителни: отделителната работа зависи от чистотата и обработката на повърхността. <Term id="alkali-metals">Алкалните метали</Term> (цезий, калий,
            натрий) реагират на видима светлина, а повечето други – само на ултравиолет.
          </p>
          <PhotoelectricLab />
          <Example
            description="Натрий (A = 2,4 eV) е осветен с ултравиолет 300 nm. Намери най-голямата кинетична енергия и скорост на електроните и спиращото напрежение."
            steps={[
              '$hf = \\frac{1240}{300} \\approx 4{,}13\\ \\mathrm{eV}$',
              '$E_{k,\\max} = hf - A = 4{,}13 - 2{,}4 = 1{,}73\\ \\mathrm{eV}$, затова $U_s = 1{,}73\\ \\mathrm{V}$',
              '$v = \\sqrt{\\frac{2E_k}{m}} = \\sqrt{\\frac{2 \\cdot 1{,}73 \\cdot 1{,}6 \\cdot 10^{-19}}{9{,}11 \\cdot 10^{-31}}} \\approx 7{,}8 \\cdot 10^5\\ \\mathrm{m/s}$',
            ]}
          />
          <p className={text}>
            Фотоефектът работи около нас: фотоумножителите засичат отделни фотони, а нощното виждане усилва слабата светлина. В слънчевите клетки
            и камерите на телефоните действа сроден <em>вътрешен</em> фотоефект – фотонът не изхвърля електрона навън, а го освобождава вътре в
            полупроводника.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Как Миликан измери h</h2>
          <p className={text}>
            Ако разделим уравнението на Айнщайн на <Tex>{'e'}</Tex>, получаваме права линия:
          </p>
          <Theorem
            title="Спиращото напрежение като функция на честотата"
            description="$U_s = \frac{h}{e}f - \frac{A}{e}$. Наклонът $\frac{h}{e}$ е един и същ за всички метали; пресечната точка с оста $f$ е червената граница $f_0$, а с оста $U_s$ (продължена до $f = 0$) е $-\frac{A}{e}$."
          />
          <StoppingVoltageLab />
          <Example
            description="Наклонът на правата U_s(f) в опит е 4,14·10⁻¹⁵ V·s. Каква е константата на Планк?"
            steps={['$h = e \\cdot \\text{наклона} = 1{,}6 \\cdot 10^{-19} \\cdot 4{,}14 \\cdot 10^{-15}$', '$h \\approx 6{,}62 \\cdot 10^{-34}\\ \\mathrm{J \\cdot s}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Импулс на фотона и светлинно налягане</h2>
          <p className={text}>
            Щом фотонът носи енергия и се движи, той носи и <Term id="momentum">импулс</Term>. Когато светлината се поглъща или отразява, тя предава импулс – тоест бута.
          </p>
          <Theorem
            title="Импулс на фотона"
            description="$p = \frac{E}{c} = \frac{h}{\lambda}$. Сноп с мощност $P$ при пълно поглъщане действа със сила $F = \frac{P}{c}$, а при пълно отражение – с $F = \frac{2P}{c}$, защото импулсът на фотоните се обръща."
          />
          <p className={text}>
            Силата е мъничка: слънчевата светлина бута 1 m² черна повърхност близо до Земята с около 4,5 µN. Тя обаче отклонява праховите опашки на
            кометите встрани от Слънцето и позволява слънчевите платна. Най-ясно импулсът на фотона се вижда при разсейването на рентгенови
            лъчи от електрони.
          </p>
          <Theorem
            title="Ефект на Комптън (1923 г.)"
            description="Рентгенов фотон, разсеян от свободен електрон под ъгъл $\theta$, излиза с по-голяма дължина на вълната: $\Delta\lambda = \frac{h}{mc}(1 - \cos\theta)$. Величината $\frac{h}{mc} \approx 2{,}43\ \mathrm{pm}$ е комптъновата дължина на вълната на електрона. Фотонът и електронът се удрят като билярдни топки – запазват се и енергията, и импулсът."
          />
          <Example
            description="Колко се увеличава дължината на вълната на фотон, отразен назад (θ = 180°) от електрон?"
            steps={['$\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos 180^{\\circ}) = 2 \\cdot 2{,}43\\ \\mathrm{pm}$', '$\\Delta\\lambda \\approx 4{,}85\\ \\mathrm{pm}$ – забележимо за рентгенови лъчи (около 70 pm), но нищожно за видимата светлина (500 000 pm).']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Частиците също са вълни</h2>
          <p className={text}>
            През 1924 г. Луи дьо Бройл предлага обратната идея: щом вълната светлина има импулс като частица, може би и частиците имат вълнови
            свойства. През 1927 г. Клинтън Дейвисън и Лестър Джърмър, а независимо от тях и Джордж Томсън, наблюдават <Term id="diffraction">дифракция</Term> на електрони от
            кристали – точно както рентгеновите лъчи.
          </p>
          <Theorem
            title="Дължина на вълната на дьо Бройл"
            description="Частица с импулс $p$ има дължина на вълната $\lambda = \frac{h}{p} = \frac{h}{mv}$. За електрон, ускорен от покой с напрежение $U$: $eU = \frac{p^2}{2m}$, т.е. $\lambda = \frac{h}{\sqrt{2meU}}$."
          />
          <ElectronSlitLab />
          <Example
            description="Сравни дължините на вълната на електрон, ускорен със 100 V, и на тенис топка (60 g) със скорост 50 m/s."
            steps={[
              'Електрон: $\\lambda = \\frac{6{,}63 \\cdot 10^{-34}}{\\sqrt{2 \\cdot 9{,}11 \\cdot 10^{-31} \\cdot 1{,}6 \\cdot 10^{-19} \\cdot 100}} \\approx 1{,}23 \\cdot 10^{-10}\\ \\mathrm{m}$ – колкото разстоянието между атомите в кристал.',
              'Топка: $\\lambda = \\frac{6{,}63 \\cdot 10^{-34}}{0{,}06 \\cdot 50} \\approx 2{,}2 \\cdot 10^{-34}\\ \\mathrm{m}$ – нищожно малко; вълновите свойства на топката не могат да се наблюдават.',
            ]}
          />
          <Theorem
            type="definition"
            title="Корпускулярно-вълнов дуализъм"
            description="И светлината, и частиците се държат като вълни, когато се разпространяват (интерференция, дифракция), и като частици, когато се поглъщат или засичат (една точка на екрана, един избит електрон). Вълната определя вероятността къде ще попадне частицата."
          />
          <p className={text}>
            На това се основава електронният <Term id="microscope">микроскоп</Term>: електроните имат стотици хиляди пъти по-къса <Term id="wavelength">дължина на вълната</Term> от видимата светлина и
            различават много по-фини детайли – до отделни атоми. Как вълновите свойства на електрона определят строежа на атома, ще видим в урока{' '}
            <Link to="/physics/modern/atom" className={link}>
              Атомът
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Приеми hc = 1240 eV·nm. Десетичните отговори въвеждай като 2,4.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Фотоните около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Яркост и енергия', 'по-ярката светлина дава по-бързи електрони', 'по-ярката дава повече електрони; $E_{k,\\max}$ зависи само от $f$'],
              ['Енергия от дължината на вълната', '$E = h\\lambda$', '$E = hf = \\frac{hc}{\\lambda}$ – по-късата вълна носи повече енергия'],
              ['Смесени единици', '$hf$ в джаули минус $A$ в eV', 'първо всичко в eV (или в J): $1\\ \\mathrm{eV} = 1{,}6 \\cdot 10^{-19}\\ \\mathrm{J}$'],
              ['Червена граница наобратно', 'фотоефект има при $\\lambda > \\lambda_0$', 'фотоефект има при $\\lambda < \\lambda_0$, т.е. $f > f_0$'],
              ['Спиращо напрежение', '$U_s = E_{k,\\max}$ в джаули', '$eU_s = E_{k,\\max}$; в eV числото е същото като $U_s$ във волтове'],
              ['Импулс на ускорен електрон', '$p = eU$', '$p = \\sqrt{2meU}$, защото $eU = \\frac{p^2}{2m}$'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">
                  <MathText displayStyle>{title}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                  ✗ <MathText displayStyle>{wrong}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  ✓ <MathText displayStyle>{right}</MathText>
                </p>
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
              <Task id="a1" number={1} color="border-green-500" question="Каква е енергията на фотон със зелена светлина (500 nm) в джаули и в електронволтове?" check={[2.49]} ask={['$E$, eV']}>
                <p>
                  <Tex>{'E = \\frac{hc}{\\lambda} = \\frac{6{,}63 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8}{500 \\cdot 10^{-9}} \\approx 3{,}98 \\cdot 10^{-19}\\ \\mathrm{J}'}</Tex>
                </p>
                <p>
                  <Tex>{'E = \\frac{3{,}98 \\cdot 10^{-19}}{1{,}6 \\cdot 10^{-19}} \\approx 2{,}49\\ \\mathrm{eV}'}</Tex>
                </p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Отделителната работа на цинка е 4,3 eV. Каква е червената граница на фотоефекта за него? Ще избие ли видима светлина електрони от цинк?" check={[288]} ask={['$\\lambda_0$, nm']}>
                <p>
                  <Tex>{'\\lambda_0 = \\frac{hc}{A} = \\frac{1240}{4{,}3} \\approx 288\\ \\mathrm{nm}'}</Tex>
                </p>
                <p>Това е ултравиолет. Видимата светлина (над 380 nm) не избива електрони от цинк.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Калий (A = 2,3 eV) е осветен със светлина 400 nm. Какво е спиращото напрежение?" check={[0.8]} ask={['$U_s$, V']}>
                <p>
                  <Tex>{'hf = \\frac{1240}{400} = 3{,}1\\ \\mathrm{eV}'}</Tex>
                </p>
                <p>
                  <Tex>{'eU_s = hf - A = 3{,}1 - 2{,}3 = 0{,}8\\ \\mathrm{eV} \\Rightarrow U_s = 0{,}8\\ \\mathrm{V}'}</Tex>
                </p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task
                id="b1"
                number={4}
                color="border-yellow-500"
                question="При осветяване на метал със светлина с честота $1{,}2 \cdot 10^{15}$ Hz спиращото напрежение е 2,67 V, а при $0{,}75 \cdot 10^{15}$ Hz – 0,81 V. Намери константата на Планк и отделителната работа на метала."
                check={[6.61, 2.29]}
                ask={['$h$, ·10⁻³⁴ J·s', '$A$, eV']}
              >
                <p>
                  Извадени едно от друго, двете уравнения <Tex>{'eU_s = hf - A'}</Tex> дават <Tex>{'e(U_1 - U_2) = h(f_1 - f_2)'}</Tex>.
                </p>
                <p>
                  <Tex>{'h = \\frac{1{,}6 \\cdot 10^{-19} \\cdot 1{,}86}{0{,}45 \\cdot 10^{15}} \\approx 6{,}61 \\cdot 10^{-34}\\ \\mathrm{J \\cdot s}'}</Tex>
                </p>
                <p>
                  <Tex>{'A = hf_2 - eU_2 = \\frac{6{,}61 \\cdot 10^{-34} \\cdot 0{,}75 \\cdot 10^{15}}{1{,}6 \\cdot 10^{-19}} - 0{,}81 \\approx 3{,}10 - 0{,}81 = 2{,}29\\ \\mathrm{eV}'}</Tex>
                </p>
              </Task>
              <Task
                id="b2"
                number={5}
                color="border-yellow-500"
                question="Фотон и електрон имат еднаква дължина на вълната 1 nm. Каква е енергията на фотона и каква е кинетичната енергия на електрона (в eV)?"
                check={[1240, 1.51]}
                ask={['$E_{\\text{фотон}}$, eV', '$E_{k}$, eV']}
              >
                <p>
                  Фотон: <Tex>{'E = \\frac{1240}{1} = 1240\\ \\mathrm{eV}'}</Tex> – това вече е рентгенов фотон.
                </p>
                <p>
                  Електрон: <Tex>{'p = \\frac{h}{\\lambda} = 6{,}63 \\cdot 10^{-25}\\ \\mathrm{kg \\cdot m/s}'}</Tex>,{' '}
                  <Tex>{'E_k = \\frac{p^2}{2m} = \\frac{(6{,}63 \\cdot 10^{-25})^2}{2 \\cdot 9{,}11 \\cdot 10^{-31}} \\approx 2{,}41 \\cdot 10^{-19}\\ \\mathrm{J}'}</Tex>
                </p>
                <p>
                  <Tex>{'E_k \\approx 1{,}51\\ \\mathrm{eV}'}</Tex> – около 800 пъти по-малко. При еднаква дължина на вълната фотонът и електронът
                  имат еднакъв импулс, но различна енергия.
                </p>
              </Task>
              <Task
                id="b3"
                number={6}
                color="border-yellow-500"
                question="Фотоклетка е осветена със светлина 400 nm с мощност 1 mW. Токът на насищане е 2 µA. Какъв процент от фотоните избиват електрон (квантов добив)?"
                check={[0.62]}
                ask={['добив, %']}
              >
                <p>
                  Фотони за секунда: <Tex>{'N_f = \\frac{P\\lambda}{hc} = \\frac{10^{-3} \\cdot 400 \\cdot 10^{-9}}{6{,}63 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8} \\approx 2{,}01 \\cdot 10^{15}'}</Tex>
                </p>
                <p>
                  Електрони за секунда: <Tex>{'N_e = \\frac{I}{e} = \\frac{2 \\cdot 10^{-6}}{1{,}6 \\cdot 10^{-19}} = 1{,}25 \\cdot 10^{13}'}</Tex>
                </p>
                <p>
                  <Tex>{'\\frac{N_e}{N_f} \\approx 0{,}0062'}</Tex>, т.е. около 0,62% – повечето фотони се поглъщат, без да изхвърлят електрон.
                </p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task
                id="c1"
                number={7}
                color="border-red-500"
                question="Рентгенови лъчи с λ = 70,9 pm се разсейват от свободни електрони под ъгъл 90°. Каква е дължината на вълната на разсеяните лъчи и каква кинетична енергия (в keV) получава електронът?"
                check={[73.3, 0.58]}
                ask={["$\\lambda'$, pm", '$E_k$, keV']}
              >
                <p>
                  <Tex>{'\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos 90^{\\circ}) = \\frac{6{,}63 \\cdot 10^{-34}}{9{,}11 \\cdot 10^{-31} \\cdot 3 \\cdot 10^8} \\approx 2{,}43\\ \\mathrm{pm}'}</Tex>
                </p>
                <p>
                  <Tex>{"\\lambda' = 70{,}9 + 2{,}43 \\approx 73{,}3\\ \\mathrm{pm}"}</Tex>
                </p>
                <p>
                  Електронът получава разликата в енергиите: <Tex>{"E_k = \\frac{hc}{\\lambda} - \\frac{hc}{\\lambda'} \\approx 17{,}53 - 16{,}95 \\approx 0{,}58\\ \\mathrm{keV}"}</Tex>
                </p>
              </Task>
              <Task
                id="c2"
                number={8}
                color="border-red-500"
                question="Изолирано медно топче (A = 4,7 eV) с радиус 1 cm е осветено с ултравиолет 200 nm. До какъв най-голям потенциал се зарежда то и колко електрона губи?"
                check={[1.5, 1.04]}
                ask={['$\\varphi$, V', '$N$, ·10⁷']}
              >
                <p>
                  Топчето губи електрони и се зарежда положително. Те спират да излитат, когато потенциалът задържа и най-бързите:{' '}
                  <Tex>{'e\\varphi = hf - A = \\frac{1240}{200} - 4{,}7 = 1{,}5\\ \\mathrm{eV}'}</Tex>, т.е. <Tex>{'\\varphi = 1{,}5\\ \\mathrm{V}'}</Tex>.
                </p>
                <p>
                  Заряд на топчето: <Tex>{'q = 4\\pi\\varepsilon_0 R\\varphi = 4\\pi \\cdot 8{,}85 \\cdot 10^{-12} \\cdot 0{,}01 \\cdot 1{,}5 \\approx 1{,}67 \\cdot 10^{-12}\\ \\mathrm{C}'}</Tex>
                </p>
                <p>
                  <Tex>{'N = \\frac{q}{e} = \\frac{1{,}67 \\cdot 10^{-12}}{1{,}6 \\cdot 10^{-19}} \\approx 1{,}04 \\cdot 10^{7}'}</Tex> електрона.
                </p>
              </Task>
              <Task
                id="c3"
                number={9}
                color="border-red-500"
                question="Атом на натрия (маса 23 u, 1 u = 1,66·10⁻²⁷ kg) поглъща фотон с λ = 589 nm, който лети срещу него. С колко се променя скоростта на атома (в cm/s)? Колко такива фотона трябва да погълне атомът, за да спре от 300 m/s?"
                check={[2.95, 1.02]}
                ask={['$\\Delta v$, cm/s', '$N$, ·10⁴']}
              >
                <p>
                  Импулсът на фотона преминава в атома: <Tex>{'\\Delta v = \\frac{h}{\\lambda m} = \\frac{6{,}63 \\cdot 10^{-34}}{589 \\cdot 10^{-9} \\cdot 23 \\cdot 1{,}66 \\cdot 10^{-27}} \\approx 2{,}95 \\cdot 10^{-2}\\ \\mathrm{m/s}'}</Tex>
                </p>
                <p>
                  След поглъщането атомът излъчва фотон в случайна посока, затова средно това излъчване не му предава импулс.
                </p>
                <p>
                  <Tex>{'N = \\frac{300}{0{,}0295} \\approx 1{,}02 \\cdot 10^{4}'}</Tex> фотона. Така работи лазерното охлаждане на атоми – атомът
                  поглъща и излъчва милиони фотони в секунда и спира за милисекунди.
                </p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                ✓ Светлината се излъчва и поглъща на порции – фотони с енергия <Tex>{'E = hf = \\frac{hc}{\\lambda}'}</Tex>;{' '}
                <Tex>{'E\\,[\\mathrm{eV}] \\approx \\frac{1240}{\\lambda\\,[\\mathrm{nm}]}'}</Tex>
              </li>
              <li>
                ✓ Уравнение на Айнщайн: <Tex>{'hf = A + E_{k,\\max}'}</Tex>; червена граница <Tex>{'\\lambda_0 = \\frac{hc}{A}'}</Tex>
              </li>
              <li>✓ Яркостта определя броя на електроните, а честотата – енергията им</li>
              <li>
                ✓ Спиращо напрежение: <Tex>{'eU_s = E_{k,\\max}'}</Tex>; графиката <Tex>{'U_s(f)'}</Tex> е права с наклон <Tex>{'\\frac{h}{e}'}</Tex>
              </li>
              <li>
                ✓ Импулс на фотона <Tex>{'p = \\frac{h}{\\lambda}'}</Tex>; светлинно налягане <Tex>{'F = \\frac{P}{c}'}</Tex> (поглъщане) или{' '}
                <Tex>{'\\frac{2P}{c}'}</Tex> (отражение); ефект на Комптън <Tex>{'\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos\\theta)'}</Tex>
              </li>
              <li>
                ✓ Частиците са и вълни: <Tex>{'\\lambda = \\frac{h}{p}'}</Tex>, за ускорен електрон <Tex>{'\\lambda = \\frac{h}{\\sqrt{2meU}}'}</Tex>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 2010 г. японският апарат IKAROS разпъва в междупланетното пространство платно с размери около 14 × 14 m и дебелина няколко
              микрометра – по-тънко от човешки косъм. Светлинното налягане го бута със сила от порядъка на милинютон – колкото тежестта на
              предмет с маса 0,1 g. Това е първата демонстрация, че слънчево платно може да ускорява и насочва космически апарат само със светлина.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
