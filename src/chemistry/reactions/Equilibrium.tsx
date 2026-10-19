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
import Term from '~/Term';
import ApproachEquilibriumLab from './ApproachEquilibriumLab';
import IceTableLab from './IceTableLab';
import LeChatelierLab from './LeChatelierLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const M = (v: number) => `${dec(v)}\\ \\mathrm{mol/L}`;

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    // K от равновесни концентрации; в стотни от mol/L, знаменателите са само от 2 и 5 – отговорът е крайна десетична дроб
    const A = pick([10, 20, 25, 40, 50]);
    const B = pick([10, 20, 25, 40, 50]);
    const C = pick([30, 60, 80, 100, 120, 150]);
    const [a, b, c] = [A / 100, B / 100, C / 100];
    return {
      tex: `\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI}:\\ [\\mathrm{H_2}] = ${M(a)},\\ [\\mathrm{I_2}] = ${M(b)},\\ [\\mathrm{HI}] = ${M(c)}`,
      ask: 'Колко е константата на равновесие K?',
      num: C * C,
      den: A * B,
      steps: [`$K = \\frac{[\\mathrm{HI}]^2}{[\\mathrm{H_2}][\\mathrm{I_2}]} = \\frac{${dec(c)}^2}{${dec(a)} \\cdot ${dec(b)}} = \\frac{${dec(c * c)}}{${dec(a * b)}} = ${dec((C * C) / (A * B))}$`],
    };
  }
  if (kind === 1) {
    const K = pick([1, 3, 4, 9]);
    const A10 = pick([5, 10, 15, 20]);
    const a0 = A10 / 10;
    const b = (K * a0) / (1 + K);
    return {
      tex: `\\mathrm{A \\rightleftharpoons B},\\quad K = ${K},\\quad [\\mathrm{A}]_0 = ${M(a0)},\\ [\\mathrm{B}]_0 = 0`,
      ask: 'Каква е равновесната концентрация на B (mol/L)?',
      num: K * A10,
      den: (1 + K) * 10,
      steps: [
        `Нека се превръщат $x$ mol/L: $[\\mathrm{B}] = x$, $[\\mathrm{A}] = ${dec(a0)} - x$.`,
        `$\\frac{x}{${dec(a0)} - x} = ${K} \\Rightarrow x = ${K} \\cdot (${dec(a0)} - x) \\Rightarrow ${K + 1}x = ${dec(K * a0)}$`,
        `$x = ${M(b)}$`,
      ],
    };
  }
  if (kind === 2) {
    // Q за синтеза на амоняк; концентрациите в десети от mol/L
    const N = pick([5, 10, 20]);
    const H = pick([5, 10, 20]);
    const A = pick([2, 4, 10]);
    const [n, h, a] = [N / 10, H / 10, A / 10];
    const Q = (A * A * 100) / (N * H * H * H);
    const K = pick([0.5, 2, 6]);
    return {
      tex: `\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}:\\ [\\mathrm{N_2}] = ${M(n)},\\ [\\mathrm{H_2}] = ${M(h)},\\ [\\mathrm{NH_3}] = ${M(a)}`,
      ask: `Изчисли Q. В коя посока ще тръгне реакцията, ако K = ${String(K).replace('.', ',')}?`,
      num: A * A * 100,
      den: N * H * H * H,
      steps: [
        `$Q = \\frac{[\\mathrm{NH_3}]^2}{[\\mathrm{N_2}][\\mathrm{H_2}]^3} = \\frac{${dec(a)}^2}{${dec(n)} \\cdot ${dec(h)}^3} = ${dec(Q)}$`,
        Q < K ? `$Q < K$ – реакцията протича надясно, към амоняка.` : Q > K ? `$Q > K$ – реакцията протича наляво, амонякът се разпада.` : '$Q = K$ – сместа е в равновесие.',
      ],
    };
  }
  if (kind === 3) {
    // Таблица ICE: от измерения HI към K
    const c0 = pick([0.5, 1, 2]);
    const [f, K] = pick<[number, number]>([
      [0.5, 4],
      [0.6, 9],
      [0.75, 36],
      [0.8, 64],
    ]);
    const x = f * c0;
    return {
      tex: `\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI}:\\ [\\mathrm{H_2}]_0 = [\\mathrm{I_2}]_0 = ${M(c0)},\\ [\\mathrm{HI}]_{\\text{равн}} = ${M(2 * x)}`,
      ask: 'Колко е K?',
      num: K,
      den: 1,
      steps: [
        `Получили са се $2x = ${dec(2 * x)}$, значи $x = ${M(x)}$ водород и йод са изразходвани.`,
        `$[\\mathrm{H_2}] = [\\mathrm{I_2}] = ${dec(c0)} - ${dec(x)} = ${M(c0 - x)}$`,
        `$K = \\frac{${dec(2 * x)}^2}{${dec(c0 - x)}^2} = ${K}$`,
      ],
    };
  }
  const K = pick([2, 4, 5, 8, 20, 25, 50]);
  return Math.random() < 0.5
    ? {
        tex: `\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI},\\quad K = ${K}`,
        ask: 'Колко е K за обратната реакция 2HI ⇌ H₂ + I₂?',
        num: 1,
        den: K,
        steps: [`Обратната реакция има обърнат израз за K: $K' = \\frac{1}{K} = \\frac{1}{${K}} = ${dec(1 / K)}$`],
      }
    : {
        tex: `\\mathrm{A \\rightleftharpoons B},\\quad K = ${K}`,
        ask: 'Колко е K за уравнението 2A ⇌ 2B?',
        num: K * K,
        den: 1,
        steps: [`Всички концентрации влизат на квадрат: $K' = K^2 = ${K}^2 = ${K * K}$`],
      };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🏭 Колона за амоняк',
    problem: 'В реактор за синтез на амоняк влизат 1000 mol азот и 3000 mol водород. При едно преминаване през катализатора около 15% от азота се превръща в амоняк. Колко мола и колко килограма амоняк се получават при едно преминаване?',
    solution: ['$\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}$; реагират $0{,}15 \\cdot 1000 = 150\\ \\mathrm{mol}$ азот', '$n(\\mathrm{NH_3}) = 2 \\cdot 150 = 300\\ \\mathrm{mol}$, $m = 300 \\cdot 17 = 5100\\ \\mathrm{g} = 5{,}1\\ \\mathrm{kg}$', 'Останалите 85% от газовете не се изхвърлят: амонякът се кондензира при охлаждане, а азотът и водородът се връщат обратно в реактора.'],
    answer: '$300\\ \\mathrm{mol}$, $5{,}1\\ \\mathrm{kg}$',
    check: [300, 5.1],
    ask: ['амоняк, mol', 'амоняк, kg'],
  },
  {
    title: '🍏 Естер с плодов аромат',
    problem: 'Етилацетатът (естер с плодов мирис) се получава от оцетна киселина и етанол: киселина + алкохол ⇌ естер + вода, K ≈ 4. Колко мола естер се получават от 1 mol киселина и 1 mol алкохол? А ако алкохолът е 3 mol?',
    solution: ['1 : 1: $\\frac{x^2}{(1 - x)^2} = 4 \\Rightarrow \\frac{x}{1 - x} = 2 \\Rightarrow x = \\frac{2}{3} \\approx 0{,}667\\ \\mathrm{mol}$', '1 : 3: $\\frac{x^2}{(1 - x)(3 - x)} = 4 \\Rightarrow 3x^2 - 16x + 12 = 0$', '$x = \\frac{16 - \\sqrt{112}}{6} \\approx 0{,}903\\ \\mathrm{mol}$ (другият корен е по-голям от 1 и няма смисъл). С излишък от евтиния алкохол се превръща 90% от киселината вместо 67%.'],
    answer: '$\\approx 0{,}667\\ \\mathrm{mol}$ и $\\approx 0{,}903\\ \\mathrm{mol}$',
    check: [0.667, 0.903],
    ask: ['1 : 1, mol', '1 : 3, mol'],
  },
  {
    title: '🩸 Отравяне с въглероден оксид',
    problem: 'В кръвта CO измества кислорода от хемоглобина: HbO₂ + CO ⇌ HbCO + O₂. Константата е около 200–250; приемете K = 210. Въздухът съдържа 21% кислород. При каква обемна част на CO във въздуха половината от хемоглобина ще е свързана с CO? (Приемете, че отношението на газовете в кръвта е като във въздуха.)',
    solution: ['$K = \\frac{[\\mathrm{HbCO}] \\cdot p(\\mathrm{O_2})}{[\\mathrm{HbO_2}] \\cdot p(\\mathrm{CO})}$; половината е свързана, значи $[\\mathrm{HbCO}] = [\\mathrm{HbO_2}]$', '$p(\\mathrm{CO}) = \\frac{p(\\mathrm{O_2})}{K} = \\frac{21\\%}{210} = 0{,}1\\%$', 'Само една хилядна от въздуха! Затова CO е толкова опасен. Лечението използва принципа на Льо Шателие: чист кислород (а при тежки случаи – под налягане) измества равновесието наляво.'],
    answer: '$0{,}1\\%$',
    check: [0.1],
    ask: ['CO, %'],
  },
  {
    title: '🔥 Пещ за вар',
    problem: 'При печене на варовик протича CaCO₃(тв) ⇌ CaO(тв) + CO₂(г). При около 900 °C равновесното налягане на CO₂ е около 101 kPa. Колко грама CaCO₃ ще се разложат в затворен съд с обем 10 L при 900 °C, ако варовикът е в излишък?',
    solution: ['$K = p(\\mathrm{CO_2})$ – твърдите вещества не влизат в израза. Разлагането спира, щом налягането на CO₂ стигне 101 kPa.', '$n = \\frac{pV}{RT} = \\frac{101{,}3 \\cdot 10}{8{,}314 \\cdot 1173} \\approx 0{,}104\\ \\mathrm{mol}$', '$m(\\mathrm{CaCO_3}) \\approx 0{,}104 \\cdot 100 \\approx 10{,}4\\ \\mathrm{g}$. Затова пещите за вар са отворени: CO₂ се отвежда и равновесието непрекъснато се измества надясно.'],
    answer: '$\\approx 10{,}4\\ \\mathrm{g}$',
    check: [10.4],
    ask: ['CaCO₃, g'],
  },
  {
    title: '🟤 Ампула с кафяв газ',
    problem: 'В запоена ампула с обем 1 L има 9,2 g N₂O₄ при 25 °C. Каква част от него се разпада по N₂O₄ ⇌ 2NO₂, ако Kc ≈ 0,0046?',
    solution: ['$n_0 = \\frac{9{,}2}{92} = 0{,}1\\ \\mathrm{mol}$; разпадат се $x$ mol/L, получават се $2x$ mol/L NO₂', '$\\frac{(2x)^2}{0{,}1 - x} = 0{,}0046 \\Rightarrow 4x^2 + 0{,}0046x - 0{,}00046 = 0 \\Rightarrow x \\approx 0{,}0102$', 'Разпада се около $10{,}2\\%$. Ако ампулата се потопи в гореща вода, тя потъмнява, а в лед – почти се обезцветява.'],
    answer: '$\\approx 10{,}2\\%$',
    check: [10.2],
    ask: ['разпаднал се N₂O₄, %'],
  },
  {
    title: '🧂 Колко сребърен хлорид се разтваря',
    problem: 'Сребърният хлорид е „неразтворим“, но малко от него все пак преминава в разтвор: AgCl(тв) ⇌ Ag⁺ + Cl⁻, $K_{sp} = 1{,}8 \\cdot 10^{-10}$ при 25 °C. Колко милиграма AgCl се разтварят в 1 L вода?',
    solution: ['$[\\mathrm{Ag^+}] = [\\mathrm{Cl^-}] = s$, $s^2 = 1{,}8 \\cdot 10^{-10}$', '$s \\approx 1{,}34 \\cdot 10^{-5}\\ \\mathrm{mol/L}$', '$m = 1{,}34 \\cdot 10^{-5} \\cdot 143{,}5 \\approx 1{,}93 \\cdot 10^{-3}\\ \\mathrm{g} \\approx 1{,}93\\ \\mathrm{mg}$ – около две хилядни от грама на литър.'],
    answer: '$\\approx 1{,}93\\ \\mathrm{mg}$',
    check: [1.93],
    ask: ['AgCl, mg'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво е равно в състояние на химично равновесие?',
    answers: ['скоростите на правата и обратната реакция', 'концентрациите на реагентите и продуктите', 'масите на реагентите и продуктите', 'нищо – реакцията е спряла'],
    correctAnswer: 'скоростите на правата и обратната реакция',
  },
  {
    question: 'Кой е изразът за константата на равновесие на $\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}$?',
    answers: ['$\\frac{[\\mathrm{NH_3}]^2}{[\\mathrm{N_2}][\\mathrm{H_2}]^3}$', '$\\frac{2[\\mathrm{NH_3}]}{[\\mathrm{N_2}] \\cdot 3[\\mathrm{H_2}]}$', '$\\frac{[\\mathrm{N_2}][\\mathrm{H_2}]^3}{[\\mathrm{NH_3}]^2}$', '$\\frac{[\\mathrm{NH_3}]}{[\\mathrm{N_2}] + [\\mathrm{H_2}]}$'],
    correctAnswer: '$\\frac{[\\mathrm{NH_3}]^2}{[\\mathrm{N_2}][\\mathrm{H_2}]^3}$',
  },
  {
    question: 'Как действа катализаторът на обратима реакция?',
    answers: ['равновесието се установява по-бързо, но съставът му не се променя', 'измества равновесието към продуктите', 'увеличава константата на равновесие', 'измества равновесието към реагентите'],
    correctAnswer: 'равновесието се установява по-бързо, но съставът му не се променя',
  },
  {
    question: 'Как ще се измести равновесието $\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}$ при повишаване на налягането?',
    answers: ['надясно – към амоняка', 'наляво – към азота и водорода', 'няма да се измести', 'зависи от катализатора'],
    correctAnswer: 'надясно – към амоняка',
  },
  {
    question: 'Кое от изброените променя стойността на константата на равновесие?',
    answers: ['температурата', 'налягането', 'концентрацията на реагентите', 'катализаторът'],
    correctAnswer: 'температурата',
  },
  {
    question: 'За дадена смес $Q = 0{,}5$, а $K = 10$. Какво ще се случи?',
    answers: ['реакцията ще протече надясно', 'реакцията ще протече наляво', 'нищо – сместа е в равновесие', 'реакцията ще спре'],
    correctAnswer: 'реакцията ще протече надясно',
  },
  {
    question: 'Кой е изразът за $K_c$ на $\\mathrm{CaCO_3(тв) \\rightleftharpoons CaO(тв) + CO_2(г)}$?',
    answers: ['$[\\mathrm{CO_2}]$', '$\\frac{[\\mathrm{CaO}][\\mathrm{CO_2}]}{[\\mathrm{CaCO_3}]}$', '$\\frac{[\\mathrm{CaO}]}{[\\mathrm{CaCO_3}]}$', '$\\frac{1}{[\\mathrm{CO_2}]}$'],
    correctAnswer: '$[\\mathrm{CO_2}]$',
  },
  {
    question: 'Константата на равновесие на една реакция е $10^{-10}$. Какво означава това?',
    answers: ['в равновесие почти няма продукти', 'реакцията протича почти докрай', 'реакцията е много бавна', 'реакцията е екзотермична'],
    correctAnswer: 'в равновесие почти няма продукти',
  },
  {
    question: 'За $\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI}$ $K = 50$. Колко е $K$ за $\\mathrm{2HI \\rightleftharpoons H_2 + I_2}$?',
    answers: ['$0{,}02$', '$50$', '$-50$', '$2500$'],
    correctAnswer: '$0{,}02$',
  },
];

// ---------- Страница ----------

export function Equilibrium() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Химично равновесие</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🌾 Въздухът е почти 80% азот, а растенията гладуват за азот – те не могат да усвоят здравата молекула N₂. В началото на XX век
            торовете идват от чилийската селитра и гуано, и учените се страхуват, че запасите ще свършат. Реакцията{' '}
            <Tex>{'\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}'}</Tex> изглежда проста, но има уловка: тя никога не стига докрай – спира
            някъде по средата. През 1909 г. Фриц Хабер намира условията, при които амонякът все пак се трупа, а Карл Бош превръща опита в
            огромен завод. Днес по техния метод се правят около 180 милиона тона амоняк годишно и по някои оценки около половината от
            азота в <Term id="protein">белтъците</Term> на тялото ти е минал през такъв завод. Тайната им е в умението да „побутват“ <strong>химичното равновесие</strong>.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Обратими реакции</h2>
          <p className={text}>
            Много реакции протичат докрай: изгорялата хартия не се връща обратно. Но при други продуктите реагират помежду си и отново дават
            изходните вещества. Ако нагряваме водород с йодни пари в затворен съд, част от тях дават йодоводород, но и йодоводородът се разпада
            на водород и йод. Такива реакции записваме с двойна стрелка <Tex>{'\\rightleftharpoons'}</Tex>.
          </p>
          <Theorem
            type="definition"
            title="Обратима реакция"
            description="Обратима е реакция, която при едни и същи условия протича и в двете посоки: правата (от реагентите към продуктите) и обратната (от продуктите към реагентите). Например $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$, $\mathrm{N_2O_4 \rightleftharpoons 2NO_2}$, $\mathrm{N_2 + 3H_2 \rightleftharpoons 2NH_3}$."
          />
          <p className={text}>
            Строго погледнато, всички реакции са обратими. Когато обратната реакция е пренебрежимо слаба или продуктът напуска системата (газ
            излита от отворен съд, <Term id="precipitate">утайка</Term> пада на дъното), казваме, че реакцията протича необратимо – докрай.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Динамично равновесие</h2>
          <p className={text}>
            В началото има само <Term id="reactant">реагенти</Term> и правата реакция е бърза. С изразходването им тя се забавя, а натрупаните продукти ускоряват
            обратната реакция. Идва момент, в който двете скорости се изравняват – колкото молекули продукт се образуват за секунда, толкова се
            и разпадат. Концентрациите престават да се променят, макар че реакцията продължава (за скоростта на реакциите виж урока{' '}
            <Link to="/chemistry/reactions/kinetics" className={link}>
              Скорост на реакцията
            </Link>
            ).
          </p>
          <Theorem
            type="definition"
            title="Химично равновесие"
            description="Химичното равновесие е състояние на обратима реакция, при което скоростите на правата и обратната реакция са равни: $v_{\to} = v_{\leftarrow}$. Концентрациите на всички вещества остават постоянни, но не са непременно равни. Равновесието е динамично – и двете реакции продължават да текат."
          />
          <p className={text}>
            Как знаем, че реакцията не е спряла? Ако в равновесна смес <Tex>{'\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI}'}</Tex> добавим малко
            йодоводород с <Term id="radioactivity">радиоактивен</Term> <Term id="isotope">изотоп</Term> на йода, след време радиоактивност има и в йода <Tex>{'\\mathrm{I_2}'}</Tex> – въпреки че
            количествата на веществата не се променят.
          </p>
          <ApproachEquilibriumLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Константа на равновесие</h2>
          <p className={text}>
            В лабораторията видя, че каквото и да е началото, отношението <Tex>{'[\\mathrm{B}]/[\\mathrm{A}]'}</Tex> в равновесие е едно и също.
            Това е общ закон, открит от норвежците Гулдберг и Ваге през 1864 г. В него влизат равновесните{' '}
            <Term id="molar-concentration">моларни концентрации</Term>, които означаваме с квадратни скоби.
          </p>
          <Theorem
            title="Закон за действие на масите"
            description="За обратимата реакция $a\mathrm{A} + b\mathrm{B} \rightleftharpoons c\mathrm{C} + d\mathrm{D}$ в равновесие при дадена температура $K_c = \frac{[\mathrm{C}]^c [\mathrm{D}]^d}{[\mathrm{A}]^a [\mathrm{B}]^b}$, където $[\mathrm{X}]$ е равновесната моларна концентрация на X в mol/L. Константата $K_c$ зависи само от реакцията и температурата."
          />
          <ul className={`${text} list-disc pl-6 space-y-1`}>
            <li>Продуктите са в <Term id="numerator">числителя</Term>, реагентите – в <Term id="denominator">знаменателя</Term>; коефициентите стават степенни показатели.</li>
            <li>
              Твърди вещества и чисти течности (например водата като <Term id="solvent">разтворител</Term>) не влизат в израза – тяхната „концентрация“ е постоянна. За{' '}
              <Tex>{'\\mathrm{CaCO_3(тв) \\rightleftharpoons CaO(тв) + CO_2(г)}'}</Tex> имаме просто <Tex>{'K_c = [\\mathrm{CO_2}]'}</Tex>.
            </li>
            <li>
              Голяма K (<Tex>{'K \\gg 1'}</Tex>) – в равновесие преобладават продуктите; малка K (<Tex>{'K \\ll 1'}</Tex>) – реагентите.
            </li>
            <li>
              За обратната реакция константата е <Tex>{'1/K'}</Tex>; ако умножим уравнението по 2, константата става <Tex>{'K^2'}</Tex>.
            </li>
          </ul>
          <Example
            description="В равновесна смес $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$ при около 450 °C $[\mathrm{H_2}] = [\mathrm{I_2}] = 0{,}11\ \mathrm{mol/L}$ и $[\mathrm{HI}] = 0{,}78\ \mathrm{mol/L}$. Колко е $K_c$?"
            steps={[
              '$K_c = \\frac{[\\mathrm{HI}]^2}{[\\mathrm{H_2}][\\mathrm{I_2}]} = \\frac{0{,}78^2}{0{,}11 \\cdot 0{,}11} = \\frac{0{,}6084}{0{,}0121} \\approx 50$',
              'Числото е по-голямо от 1 – в равновесие йодоводородът преобладава, но реагентите не изчезват напълно.',
            ]}
          />
          <p className={text}>
            Строго погледнато, константата на равновесие е безразмерна (в нея влизат концентрациите, разделени на 1 mol/L). Затова в урока
            записваме стойностите на K без мерни единици.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Реакционно частно: накъде ще тръгне реакцията?</h2>
          <Theorem
            type="definition"
            title="Реакционно частно Q"
            description="Реакционното частно $Q$ се пресмята по същия израз като $K$, но с текущите (не непременно равновесни) концентрации. Сравнението им показва посоката: при $Q < K$ реакцията протича надясно, при $Q > K$ – наляво, а при $Q = K$ системата е в равновесие."
          />
          <Example
            description="За $\mathrm{N_2O_4 \rightleftharpoons 2NO_2}$ при 25 °C $K_c \approx 0{,}0046$. В съд има $0{,}1\ \mathrm{mol/L}$ $\mathrm{N_2O_4}$ и $0{,}03\ \mathrm{mol/L}$ $\mathrm{NO_2}$. Накъде ще се измести сместа?"
            steps={[
              '$Q = \\frac{[\\mathrm{NO_2}]^2}{[\\mathrm{N_2O_4}]} = \\frac{0{,}03^2}{0{,}1} = 0{,}009$',
              '$Q > K$ – има твърде много $\\mathrm{NO_2}$; реакцията ще протече наляво и част от него ще се свърже в $\\mathrm{N_2O_4}$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Изчисления с равновесни концентрации</h2>
          <p className={text}>
            Повечето задачи се решават с таблица от три реда: <strong>начало</strong>, <strong>промяна</strong> и <strong>равновесие</strong> (на
            английски ICE – Initial, Change, Equilibrium). Промяната означаваме с <Tex>{'x'}</Tex> и я умножаваме по коефициентите. После заместваме
            реда „равновесие“ в израза за K и решаваме уравнението.
          </p>
          <Example
            description="В съд с обем 1 L поставят 1 mol водород и 1 mol йод и нагряват до около 450 °C ($K = 50$). Колко мола йодоводород има в равновесие?"
            steps={[
              'Начало: $1;\\ 1;\\ 0$. Промяна: $-x;\\ -x;\\ +2x$. Равновесие: $1 - x;\\ 1 - x;\\ 2x$.',
              '$\\frac{(2x)^2}{(1 - x)^2} = 50 \\Rightarrow \\frac{2x}{1 - x} = \\sqrt{50} \\approx 7{,}07$',
              '$2x = 7{,}07 - 7{,}07x \\Rightarrow x \\approx 0{,}780$; $n(\\mathrm{HI}) = 2x \\approx 1{,}56\\ \\mathrm{mol}$',
              'Превърнали са се 78% от реагентите – не 100%, колкото би дало „обикновеното“ изчисление по уравнението.',
            ]}
          />
          <IceTableLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Принцип на Льо Шателие</h2>
          <Theorem
            title="Принцип на Льо Шателие"
            description="Ако върху система в равновесие се въздейства отвън – промени се концентрация, налягане или температура – равновесието се измества в посоката, която отслабва това въздействие."
          />
          <ul className={`${text} list-disc pl-6 space-y-1`}>
            <li>
              <strong>Концентрация.</strong> Добавим ли реагент или отстраним ли продукт, равновесието се измества надясно – системата
              изразходва добавеното и попълва отнетото. K не се променя; променя се Q.
            </li>
            <li>
              <strong>Налягане</strong> (за газове). При сгъстяване равновесието се измества към страната с по-малко молекули газ. В{' '}
              <Tex>{'\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}'}</Tex> вляво има 4 <Term id="mole">мола</Term> газ, вдясно – 2, затова високото налягане
              благоприятства амоняка. Ако броят на молекулите газ е еднакъв (<Tex>{'\\mathrm{H_2 + I_2 \\rightleftharpoons 2HI}'}</Tex>), налягането
              не влияе.
            </li>
            <li>
              <strong>Температура.</strong> Нагряването измества равновесието в посоката на <Term id="endothermic-reaction">ендотермичната реакция</Term>, охлаждането – на
              екзотермичната (за топлинния ефект виж{' '}
              <Link to="/chemistry/reactions/energy" className={link}>
                Енергия на реакциите
              </Link>
              ). Това е единственият фактор, който променя самата K.
            </li>
            <li>
              <strong>Катализатор.</strong> Ускорява еднакво правата и обратната реакция – равновесието се достига по-бързо, но не се
              измества.
            </li>
          </ul>
          <LeChatelierLab />
          <Theorem
            title="Зависимост на K от температурата (за напреднали)"
            description="Уравнение на Вант Хоф: $\ln\frac{K_2}{K_1} = -\frac{\Delta H}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)$. При $\Delta H > 0$ (ендотермична права реакция) K расте с температурата, при $\Delta H < 0$ – намалява."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Синтезът на амоняк</h2>
          <p className={text}>
            Реакцията <Tex>{'\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}'}</Tex>, <Tex>{'\\Delta H \\approx -92\\ \\mathrm{kJ}'}</Tex>, е{' '}
            <Term id="exothermic-reaction">екзотермична</Term> и намалява броя на молекулите газ. Принципът на Льо Шателие подсказва: ниска температура и високо налягане. При 25 °C{' '}
            <Tex>{'K_p'}</Tex> е огромна – около <Tex>{'6 \\cdot 10^5'}</Tex>, но реакцията е толкова бавна, че практически не тече. При нагряване
            тя се ускорява, но K намалява милиарди пъти. Хабер и Бош намират компромис:
          </p>
          <ul className={`${text} list-disc pl-6 space-y-1`}>
            <li>температура около 400–450 °C – достатъчно бързо, макар и с по-малък равновесен добив;</li>
            <li>налягане от порядъка на 150–300 атмосфери – измества равновесието към амоняка;</li>
            <li><Term id="catalyst">катализатор</Term> от желязо – не измества равновесието, но позволява да се работи при по-ниска температура;</li>
            <li>
              непрекъснато отстраняване на продукта – амонякът се втечнява при охлаждане, а неизреагиралите азот и водород се връщат в реактора.
              При едно преминаване се превръщат обикновено около 15% от газовете, но с многократното връщане почти всичко става амоняк.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Kp и произведение на разтворимостта (за напреднали)</h2>
          <Theorem
            type="definition"
            title="Константа Kp"
            description="За реакции между газове константата може да се запише с парциалните налягания: $K_p = \frac{p_{\mathrm{C}}^c\, p_{\mathrm{D}}^d}{p_{\mathrm{A}}^a\, p_{\mathrm{B}}^b}$ (наляганията в bar). Връзката с $K_c$ е $K_p = K_c (RT)^{\Delta n}$, където $\Delta n$ е промяната на броя молове газ, а $R = 0{,}08314\ \mathrm{L \cdot bar/(mol \cdot K)}$."
          />
          <Theorem
            type="definition"
            title="Произведение на разтворимостта"
            description="За слабо разтворима сол в равновесие с наситения си разтвор, например $\mathrm{AgCl(тв) \rightleftharpoons Ag^+ + Cl^-}$, константата е $K_{sp} = [\mathrm{Ag^+}][\mathrm{Cl^-}]$. Утайка се образува, когато произведението на концентрациите на йоните надхвърли $K_{sp}$."
          />
          <p className={text}>
            Над утайката <Term id="solution">разтворът</Term> е <Term id="saturated-solution">наситен</Term>. Добавянето на общ <Term id="ion">йон</Term> намалява <Term id="solubility">разтворимостта</Term>: в 0,1 mol/L разтвор на NaCl концентрацията на сребърните йони може да е само{' '}
            <Tex>{'1{,}8 \\cdot 10^{-10} / 0{,}1 = 1{,}8 \\cdot 10^{-9}\\ \\mathrm{mol/L}'}</Tex> – хиляди пъти по-малко, отколкото в чиста вода.
            Равновесията с <Term id="acid">киселини</Term> и основи (<Term id="acid-dissociation-constant">константата на дисоциация</Term> <Tex>{'K_a'}</Tex> и <Term id="ph">pH</Term>) са в урока{' '}
            <Link to="/chemistry/reactions/acids-bases" className={link}>
              Киселини, основи и pH
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>
            Константа на равновесие от концентрации, равновесен състав, реакционно частно, таблица ICE и константа на обърнато уравнение.
            Десетичните отговори въвеждай като 0,75.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Равновесия около нас</h2>
          <p className={text}>Заводи за торове, плодови аромати, кръвта ни и пещите за вар – навсякъде има равновесия, които можем да изместим.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Равни концентрации', 'В равновесие концентрациите на реагентите и продуктите са равни.', 'Равни са скоростите; концентрациите са постоянни, но обикновено различни.'],
              ['Реакцията е спряла', 'Щом концентрациите не се менят, реакцията не тече.', 'Равновесието е динамично – двете реакции текат с еднаква скорост.'],
              ['Коефициентите в K', '$K = \\frac{2[\\mathrm{HI}]}{[\\mathrm{H_2}][\\mathrm{I_2}]}$', 'Коефициентите са степенни показатели: $K = \\frac{[\\mathrm{HI}]^2}{[\\mathrm{H_2}][\\mathrm{I_2}]}$'],
              ['Твърдите вещества', '$K = \\frac{[\\mathrm{CaO}][\\mathrm{CO_2}]}{[\\mathrm{CaCO_3}]}$', 'Твърди вещества и чисти течности не влизат: $K = [\\mathrm{CO_2}]$'],
              ['Катализаторът', 'Катализаторът увеличава добива на продукта.', 'Катализаторът само ускорява достигането на равновесие; добивът не се променя.'],
              ['K и концентрацията', 'Добавянето на реагент увеличава K.', 'K зависи само от температурата; добавката променя Q и равновесието се измества.'],
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
          <h2 className={h2}>12. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Запишете израза за $K_c$ на $\mathrm{N_2 + 3H_2 \rightleftharpoons 2NH_3}$ и пресметнете стойността ѝ, ако в равновесие $[\mathrm{N_2}] = 0{,}5$, $[\mathrm{H_2}] = 1$ и $[\mathrm{NH_3}] = 0{,}2\ \mathrm{mol/L}$." check={[0.08]} ask={['$K_c$']}>
                <p><Tex>{'K_c = \\frac{[\\mathrm{NH_3}]^2}{[\\mathrm{N_2}][\\mathrm{H_2}]^3}'}</Tex></p>
                <p><Tex>{'K_c = \\frac{0{,}2^2}{0{,}5 \\cdot 1^3} = \\frac{0{,}04}{0{,}5} = 0{,}08'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="В равновесна смес $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$ $[\mathrm{H_2}] = [\mathrm{I_2}] = 0{,}1\ \mathrm{mol/L}$, а $[\mathrm{HI}] = 0{,}7\ \mathrm{mol/L}$. Колко е $K_c$ и колко е константата на обратната реакция?" check={[49, 0.0204]} ask={['$K_c$', "$K_c'$"]}>
                <p><Tex>{'K_c = \\frac{0{,}7^2}{0{,}1 \\cdot 0{,}1} = \\frac{0{,}49}{0{,}01} = 49'}</Tex></p>
                <p>За <Tex>{'\\mathrm{2HI \\rightleftharpoons H_2 + I_2}'}</Tex>: <Tex>{"K_c' = \\frac{1}{49} \\approx 0{,}0204"}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Как ще се измести равновесието $\mathrm{2SO_2 + O_2 \rightleftharpoons 2SO_3}$, $\Delta H < 0$, при: а) повишаване на налягането; б) нагряване; в) добавяне на кислород? Колко мола газ има отляво и колко отдясно?" check={[3, 2]} ask={['мола газ вляво', 'мола газ вдясно']}>
                <p>Вляво има <Tex>{'2 + 1 = 3'}</Tex> мола газ, вдясно – 2.</p>
                <p>а) При повишаване на налягането – надясно, към по-малко молекули.</p>
                <p>б) Правата реакция е екзотермична, затова нагряването измества равновесието наляво (K намалява).</p>
                <p>в) Добавеният кислород се изразходва – равновесието се измества надясно.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="За $\mathrm{CO + H_2O \rightleftharpoons CO_2 + H_2}$ при около 800 °C $K = 1$. В съд с обем 1 L поставят 1 mol CO и 3 mol водна пара. Колко мола водород има в равновесие и какъв процент от CO е превърнат?" check={[0.75, 75]} ask={['$n(\\mathrm{H_2})$, mol', 'превърнат CO, %']}>
                <p>Равновесие: <Tex>{'1 - x;\\ 3 - x;\\ x;\\ x'}</Tex></p>
                <p><Tex>{'\\frac{x^2}{(1 - x)(3 - x)} = 1 \\Rightarrow x^2 = 3 - 4x + x^2 \\Rightarrow x = 0{,}75'}</Tex></p>
                <p>Водородът е 0,75 mol; превърнати са 75% от CO. При равни количества (1 : 1) щяха да са само 50% – излишъкът от пара измества равновесието.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="За $\mathrm{N_2O_4 \rightleftharpoons 2NO_2}$ при 25 °C $K_c \approx 0{,}0046$. В съд има $0{,}1\ \mathrm{mol/L}$ $\mathrm{N_2O_4}$ и $0{,}01\ \mathrm{mol/L}$ $\mathrm{NO_2}$. Пресметнете Q. Накъде ще протече реакцията?" check={[0.001]} ask={['$Q$']}>
                <p><Tex>{'Q = \\frac{0{,}01^2}{0{,}1} = 0{,}001'}</Tex></p>
                <p><Tex>{'Q < K'}</Tex> – реакцията ще протече надясно: още <Tex>{'\\mathrm{N_2O_4}'}</Tex> ще се разпадне и газът ще потъмнее.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="За $\mathrm{PCl_5 \rightleftharpoons PCl_3 + Cl_2}$ при около 250 °C $K_c \approx 0{,}04$. Началната концентрация на $\mathrm{PCl_5}$ е $0{,}5\ \mathrm{mol/L}$. Каква е равновесната концентрация на хлора и каква част от $\mathrm{PCl_5}$ се разлага?" check={[0.123, 24.6]} ask={['$[\\mathrm{Cl_2}]$, mol/L', 'разложен $\\mathrm{PCl_5}$, %']}>
                <p><Tex>{'\\frac{x^2}{0{,}5 - x} = 0{,}04 \\Rightarrow x^2 + 0{,}04x - 0{,}02 = 0'}</Tex></p>
                <p><Tex>{'x = \\frac{-0{,}04 + \\sqrt{0{,}0016 + 0{,}08}}{2} \\approx 0{,}123\\ \\mathrm{mol/L}'}</Tex></p>
                <p>Разложени са <Tex>{'0{,}123 / 0{,}5 \\approx 24{,}6\\%'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Равновесна смес $\mathrm{H_2 + I_2 \rightleftharpoons 2HI}$ в съд с обем 1 L съдържа 0,2 mol $\mathrm{H_2}$, 0,2 mol $\mathrm{I_2}$ и 1,6 mol HI. Добавят 0,6 mol водород при същата температура. Колко мола HI ще има в новото равновесие и колко мола йод ще останат?" check={[1.843, 0.0783]} ask={['$n(\\mathrm{HI})$, mol', '$n(\\mathrm{I_2})$, mol']}>
                <p><Tex>{'K = \\frac{1{,}6^2}{0{,}2 \\cdot 0{,}2} = 64'}</Tex></p>
                <p>След добавката: <Tex>{'\\mathrm{H_2}'}</Tex> 0,8; <Tex>{'\\mathrm{I_2}'}</Tex> 0,2; HI 1,6. <Tex>{'Q = \\frac{1{,}6^2}{0{,}8 \\cdot 0{,}2} = 16 < 64'}</Tex> – надясно.</p>
                <p><Tex>{'\\frac{(1{,}6 + 2x)^2}{(0{,}8 - x)(0{,}2 - x)} = 64 \\Rightarrow 60x^2 - 70{,}4x + 7{,}68 = 0 \\Rightarrow x \\approx 0{,}122'}</Tex></p>
                <p><Tex>{'n(\\mathrm{HI}) \\approx 1{,}843\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{I_2}) \\approx 0{,}0783\\ \\mathrm{mol}'}</Tex> – излишъкът от водород „изчерпва“ йода.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="За $\mathrm{N_2O_4 \rightleftharpoons 2NO_2}$ при 25 °C $K_c \approx 0{,}0046$. Пресметнете $K_p$ (налягания в bar). Какво е парциалното налягане на $\mathrm{NO_2}$, ако това на $\mathrm{N_2O_4}$ в равновесие е 1 bar?" check={[0.114, 0.338]} ask={['$K_p$', '$p(\\mathrm{NO_2})$, bar']}>
                <p><Tex>{'\\Delta n = 2 - 1 = 1'}</Tex>, затова <Tex>{'K_p = K_c \\cdot RT = 0{,}0046 \\cdot 0{,}08314 \\cdot 298 \\approx 0{,}114'}</Tex></p>
                <p><Tex>{'p(\\mathrm{NO_2}) = \\sqrt{K_p \\cdot p(\\mathrm{N_2O_4})} = \\sqrt{0{,}114} \\approx 0{,}338\\ \\mathrm{bar}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="$K_{sp}(\mathrm{AgCl}) = 1{,}8 \cdot 10^{-10}$ при 25 °C. Колко милиграма AgCl се разтварят в 1 L вода? Колко пъти по-малка е разтворимостта в 0,1 mol/L разтвор на NaCl?" check={[1.93, 7450]} ask={['в вода, mg', 'колко пъти']}>
                <p>В чиста вода: <Tex>{'s = \\sqrt{1{,}8 \\cdot 10^{-10}} \\approx 1{,}34 \\cdot 10^{-5}\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'m = s \\cdot 143{,}5 \\approx 1{,}93\\ \\mathrm{mg}'}</Tex>.</p>
                <p>В NaCl: <Tex>{'[\\mathrm{Cl^-}] \\approx 0{,}1'}</Tex>, <Tex>{"s' = \\frac{1{,}8 \\cdot 10^{-10}}{0{,}1} = 1{,}8 \\cdot 10^{-9}\\ \\mathrm{mol/L}"}</Tex>.</p>
                <p><Tex>{"\\frac{s}{s'} = \\frac{1{,}34 \\cdot 10^{-5}}{1{,}8 \\cdot 10^{-9}} \\approx 7450"}</Tex> – ефект на общия йон.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Обратимите реакции стигат до динамично равновесие: <Tex>{'v_{\\to} = v_{\\leftarrow}'}</Tex>, концентрациите са постоянни</li>
              <li>✓ Закон за действие на масите: <Tex>{'K_c = \\frac{[\\mathrm{C}]^c[\\mathrm{D}]^d}{[\\mathrm{A}]^a[\\mathrm{B}]^b}'}</Tex>; твърдите вещества и чистите течности не влизат</li>
              <li>✓ Голяма K – преобладават продуктите, малка K – реагентите; обратната реакция има константа <Tex>{'1/K'}</Tex></li>
              <li>✓ <Tex>{'Q < K'}</Tex> – надясно, <Tex>{'Q > K'}</Tex> – наляво, <Tex>{'Q = K'}</Tex> – равновесие</li>
              <li>✓ Таблица „начало – промяна – равновесие“ с промяна <Tex>{'x'}</Tex>, умножена по коефициентите</li>
              <li>✓ Принцип на Льо Шателие: системата отслабва въздействието; само температурата променя K, катализаторът не измества равновесието</li>
              <li>✓ <Tex>{'K_p = K_c(RT)^{\\Delta n}'}</Tex>; за слабо разтворими соли <Tex>{'K_{sp}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Кокошките снасят яйца с по-тънки черупки в горещо време. Едно от обясненията е химично равновесие: задъхвайки се, птиците
              издишват повече <Tex>{'\\mathrm{CO_2}'}</Tex>, равновесията <Tex>{'\\mathrm{CO_2 + H_2O \\rightleftharpoons H_2CO_3 \\rightleftharpoons H^+ + HCO_3^-}'}</Tex> в
              кръвта се изместват наляво и за черупката от <Tex>{'\\mathrm{CaCO_3}'}</Tex> остават по-малко карбонатни йони. Предлагано е
              решение по Льо Шателие – газирана вода за пиене на птиците, но доколко помага на практика, е спорно.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
