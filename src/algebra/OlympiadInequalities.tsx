import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, fracTex, pick, randInt } from '~/drill';
import { CauchySchwarzLab } from './CauchySchwarzLab';
import { ConvexityLab } from './ConvexityLab';
import { MeansLab } from './MeansLab';
import Term from '~/Term';

// ---------- Тренажор ----------

/** Коефициент пред буква: 1 → '', 3 → '3'. */
const co = (k: number) => (k === 1 ? '' : String(k));

/** Двойки с точен корен от произведението (средно геометрично – цяло число). */
const GM_PAIRS: [number, number][] = [
  [2, 8],
  [4, 9],
  [3, 12],
  [1, 16],
  [4, 25],
  [9, 16],
  [8, 18],
  [5, 20],
  [6, 24],
  [2, 18],
  [1, 9],
  [3, 27],
];
/** Двойки, при които и средното квадратично е цяло число. */
const QM_PAIRS: [number, number, number][] = [
  [1, 7, 5],
  [7, 17, 13],
  [7, 23, 17],
  [17, 31, 25],
  [2, 14, 10],
  [14, 34, 26],
];
/** Питагорови тройки за Коши–Буняковски. */
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [4, 3, 5],
  [12, 5, 13],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    // ax + b/x ≥ 2√(ab), b = a·m²
    const a = randInt(1, 5);
    const m = randInt(1, 6);
    const b = a * m * m;
    const askX = randInt(0, 2) === 0;
    return {
      tex: `${co(a)}x + \\frac{${b}}{x}`,
      ask: askX ? 'При кое $x > 0$ изразът е най-малък?' : 'Най-малката стойност при $x > 0$ е $?$',
      num: askX ? m : 2 * a * m,
      den: 1,
      steps: [
        `По неравенството между средните: $${co(a)}x + \\frac{${b}}{x} \\ge 2\\sqrt{${co(a)}x \\cdot \\frac{${b}}{x}} = 2\\sqrt{${a * b}} = ${2 * a * m}$`,
        `Равенство при $${co(a)}x = \\frac{${b}}{x}$, т.е. $x^2 = ${m * m}$ и $x = ${m}$`,
      ],
    };
  }
  if (kind === 1) {
    // px + qy = S ⇒ xy ≤ S²/(4pq)
    const p = randInt(1, 4);
    const q = randInt(1, 4);
    const S = 2 * randInt(2, 10);
    return {
      tex: `${co(p)}x + ${co(q)}y = ${S}`,
      ask: 'Най-голямата стойност на $xy$ при $x, y > 0$ е $?$',
      num: S * S,
      den: 4 * p * q,
      steps: [
        `$${co(p)}x \\cdot ${co(q)}y \\le \\left(\\frac{${co(p)}x + ${co(q)}y}{2}\\right)^2 = \\left(\\frac{${S}}{2}\\right)^2 = ${(S * S) / 4}$`,
        `$xy \\le ${fracTex(S * S, 4 * p * q)}$; равенство при $${co(p)}x = ${co(q)}y = ${S / 2}$`,
      ],
    };
  }
  if (kind === 2) {
    const [a, b] = pick(GM_PAIRS);
    const which = randInt(0, 2);
    const am = fracTex(a + b, 2);
    const gm = Math.sqrt(a * b);
    if (which === 0)
      return {
        tex: `a = ${a},\\quad b = ${b}`,
        ask: 'Средно аритметично $A = ?$',
        num: a + b,
        den: 2,
        steps: [`$A = \\frac{a + b}{2} = \\frac{${a + b}}{2} = ${am}$`],
      };
    if (which === 1)
      return {
        tex: `a = ${a},\\quad b = ${b}`,
        ask: 'Средно геометрично $G = ?$',
        num: gm,
        den: 1,
        steps: [`$G = \\sqrt{ab} = \\sqrt{${a * b}} = ${gm}$`],
      };
    return {
      tex: `a = ${a},\\quad b = ${b}`,
      ask: 'Средно хармонично $H = ?$',
      num: 2 * a * b,
      den: a + b,
      steps: [`$H = \\frac{2ab}{a + b} = \\frac{${2 * a * b}}{${a + b}} = ${fracTex(2 * a * b, a + b)}$`, `Проверка: $H = \\frac{G^2}{A} \\le G = ${gm} \\le A = ${am}$`],
    };
  }
  if (kind === 3) {
    const [a, b, qm] = pick(QM_PAIRS);
    return {
      tex: `a = ${a},\\quad b = ${b}`,
      ask: 'Средно квадратично $Q = ?$',
      num: qm,
      den: 1,
      steps: [`$Q = \\sqrt{\\frac{a^2 + b^2}{2}} = \\sqrt{\\frac{${a * a} + ${b * b}}{2}} = \\sqrt{${(a * a + b * b) / 2}} = ${qm}$`],
    };
  }
  if (kind === 4) {
    // px + qy при x² + y² = r² ⇒ най-много r·√(p² + q²)
    const [p, q, c] = pick(TRIPLES);
    const r = randInt(1, 4);
    return {
      tex: `x^2 + y^2 = ${r * r}`,
      ask: `Най-голямата стойност на $${p}x + ${q}y$ е $?$`,
      num: c * r,
      den: 1,
      steps: [
        `Коши–Буняковски: $(${p}x + ${q}y)^2 \\le (${p}^2 + ${q}^2)(x^2 + y^2) = ${c * c} \\cdot ${r * r}$`,
        `$${p}x + ${q}y \\le ${c} \\cdot ${r} = ${c * r}$; равенство при $x : y = ${p} : ${q}$`,
      ],
    };
  }
  if (kind === 5) {
    // x² + 2m³/x ≥ 3m²
    const m = randInt(1, 4);
    const m3 = m ** 3;
    return {
      tex: `x^2 + \\frac{${2 * m3}}{x}`,
      ask: 'Най-малката стойност при $x > 0$ е $?$',
      num: 3 * m * m,
      den: 1,
      steps: [
        `Разделяме дробта на две равни: $x^2 + \\frac{${m3}}{x} + \\frac{${m3}}{x}$ – произведението вече е константа`,
        `$\\ge 3\\sqrt[3]{x^2 \\cdot \\frac{${m3}}{x} \\cdot \\frac{${m3}}{x}} = 3\\sqrt[3]{${m ** 6}} = ${3 * m * m}$`,
        `Равенство при $x^2 = \\frac{${m3}}{x}$, т.е. $x = ${m}$`,
      ],
    };
  }
  // Форма на Енгел: a²/x + b²/y ≥ (a + b)²/(x + y)
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const S = randInt(1, 6);
  return {
    tex: `\\frac{${a * a}}{x} + \\frac{${b * b}}{y}`,
    ask: `Най-малката стойност при $x, y > 0$ и $x + y = ${S}$ е $?$`,
    num: (a + b) ** 2,
    den: S,
    steps: [
      `$\\frac{${a}^2}{x} + \\frac{${b}^2}{y} \\ge \\frac{(${a} + ${b})^2}{x + y} = ${fracTex((a + b) ** 2, S)}$`,
      `Равенство при $\\frac{${a}}{x} = \\frac{${b}}{y}$, т.е. $x = ${fracTex(a * S, a + b)}$ и $y = ${fracTex(b * S, a + b)}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🚗 Средна скорост',
    problem: 'Шофьор кара от София до Пловдив със 60 km/h, а обратно по същия път – с 40 km/h. Каква е средната му скорост за целия път?',
    solution: [
      'Нека разстоянието е $s$. Времето е $\\frac{s}{60} + \\frac{s}{40}$, а пътят – $2s$.',
      '$v = \\frac{2s}{\\frac{s}{60} + \\frac{s}{40}} = \\frac{2 \\cdot 60 \\cdot 40}{60 + 40} = 48\\ \\mathrm{km/h}$',
      'Това е средното хармонично на 60 и 40 – по-малко от средното аритметично 50: по-бавно караме по-дълго време.',
    ],
    answer: '$48\\ \\mathrm{km/h}$',
    check: [48],
    ask: ['средна скорост, km/h'],
  },
  {
    title: '📦 Кутия без капак',
    problem: 'От квадратен картон със страна 30 cm изрязваме в ъглите четири еднакви квадратчета със страна $x$ и сгъваме кутия без капак. При какво $x$ обемът е най-голям и колко е той?',
    solution: [
      '$V = x(30 - 2x)^2$. Искаме сбор-константа: $4x + (30 - 2x) + (30 - 2x) = 60$.',
      'По неравенството между средните за три числа: $4x(30 - 2x)^2 \\le \\left(\\frac{60}{3}\\right)^3 = 8000$, т.е. $V \\le 2000$.',
      'Равенство при $4x = 30 - 2x$, т.е. $x = 5\\ \\mathrm{cm}$; тогава $V = 5 \\cdot 20^2 = 2000\\ \\mathrm{cm}^3$.',
    ],
    answer: '$x = 5\\ \\mathrm{cm}$, $V = 2000\\ \\mathrm{cm}^3 = 2\\ \\mathrm{l}$',
    check: [5, 2000],
    ask: ['x, cm', 'обем, cm³'],
  },
  {
    title: '🐑 Загон с преграда',
    problem: 'Фермер има 600 m мрежа. Иска правоъгълен загон, разделен на две части с една преграда, успоредна на едната страна. Колко е най-голямото лице на загона?',
    solution: [
      'Ако страните са $x$ (три пъти – двете страни и преградата) и $y$ (два пъти): $3x + 2y = 600$.',
      '$3x \\cdot 2y \\le \\left(\\frac{3x + 2y}{2}\\right)^2 = 300^2 \\Rightarrow xy \\le \\frac{90\\,000}{6} = 15\\,000$',
      'Равенство при $3x = 2y = 300$: $x = 100\\ \\mathrm{m}$, $y = 150\\ \\mathrm{m}$.',
    ],
    answer: '$15\\,000\\ \\mathrm{m}^2$ (при страни 100 m и 150 m)',
    check: [15000],
    ask: ['лице, m²'],
  },
  {
    title: '📈 Среден годишен ръст',
    problem: 'Цената на акция се покачва с 60% през първата година и пада с 10% през втората. С колко процента средно на година се е променяла?',
    solution: [
      'За двете години цената се умножава по $1{,}6 \\cdot 0{,}9 = 1{,}44$.',
      'Средният множител е средното геометрично: $\\sqrt{1{,}44} = 1{,}2$ – средно $+20\\%$ на година.',
      'Средното аритметично $\\frac{60 - 10}{2} = 25\\%$ надценява ръста: $1{,}25^2 = 1{,}5625 \\ne 1{,}44$.',
    ],
    answer: 'Средно $+20\\%$ на година',
    check: [20],
    ask: ['среден ръст, %'],
  },
  {
    title: '⚖️ Везна с неравни рамена',
    problem: 'Продавач с неточна везна (раменете ѝ са с различна дължина) претегля стока веднъж на лявото блюдо – 1,6 kg, и веднъж на дясното – 2,5 kg. Колко е истинската маса и с колко грама средното аритметично на двете показания надценява стоката?',
    solution: [
      'Ако раменете са $l_1$ и $l_2$: $m l_1 = m_1 l_2$ и $m_2 l_1 = m l_2$. Умножаваме: $m^2 = m_1 m_2$.',
      '$m = \\sqrt{1{,}6 \\cdot 2{,}5} = \\sqrt{4} = 2\\ \\mathrm{kg}$ – средното геометрично на показанията.',
      'Средното аритметично е $\\frac{1{,}6 + 2{,}5}{2} = 2{,}05\\ \\mathrm{kg}$ – с $50\\ \\mathrm{g}$ повече.',
    ],
    answer: '$2\\ \\mathrm{kg}$; надценка $50\\ \\mathrm{g}$',
    check: [2, 50],
    ask: ['маса, kg', 'надценка, g'],
  },
  {
    title: '🥛 Кутия с най-малко картон',
    problem: 'Затворена кутия с форма на правоъгълен паралелепипед трябва да побира $1000\\ \\mathrm{cm}^3$. Колко най-малко картон (лице на повърхнината) е нужен?',
    solution: [
      'При ръбове $a$, $b$, $c$: $abc = 1000$, а $S = 2(ab + bc + ca)$.',
      'По неравенството между средните: $ab + bc + ca \\ge 3\\sqrt[3]{(abc)^2} = 3 \\cdot 100 = 300$.',
      '$S \\ge 600\\ \\mathrm{cm}^2$, с равенство при $ab = bc = ca$, т.е. при куб с ръб 10 cm.',
    ],
    answer: '$600\\ \\mathrm{cm}^2$ (куб с ръб 10 cm)',
    check: [600],
    ask: ['картон, cm²'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кое е вярно за всеки положителни числа $a$ и $b$?',
    answers: [
      '$\\frac{a + b}{2} \\ge \\sqrt{ab} \\ge \\frac{2ab}{a + b}$',
      '$\\sqrt{ab} \\ge \\frac{a + b}{2} \\ge \\frac{2ab}{a + b}$',
      '$\\frac{2ab}{a + b} \\ge \\frac{a + b}{2} \\ge \\sqrt{ab}$',
      '$\\frac{a + b}{2} \\ge \\frac{2ab}{a + b} \\ge \\sqrt{ab}$',
    ],
    correctAnswer: '$\\frac{a + b}{2} \\ge \\sqrt{ab} \\ge \\frac{2ab}{a + b}$',
  },
  {
    question: 'Каква е най-малката стойност на $x + \\frac{9}{x}$ при $x > 0$?',
    answers: ['$6$', '$3$', '$9$', '$10$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Положителните числа $x$ и $y$ имат сбор 12. Колко е най-голямото възможно $xy$?',
    answers: ['$36$', '$144$', '$24$', '$72$'],
    correctAnswer: '$36$',
  },
  {
    question: 'Кола изминава един път със 60 km/h и се връща по него с 40 km/h. Каква е средната ѝ скорост?',
    answers: ['$48\\ \\mathrm{km/h}$', '$50\\ \\mathrm{km/h}$', '$49\\ \\mathrm{km/h}$', '$52\\ \\mathrm{km/h}$'],
    correctAnswer: '$48\\ \\mathrm{km/h}$',
  },
  {
    question: 'Как гласи неравенството на Коши–Буняковски за два вектора?',
    answers: [
      '$|\\vec{u} \\cdot \\vec{v}| \\le |\\vec{u}| \\cdot |\\vec{v}|$',
      '$|\\vec{u} \\cdot \\vec{v}| \\ge |\\vec{u}| \\cdot |\\vec{v}|$',
      '$|\\vec{u} + \\vec{v}| \\ge |\\vec{u}| + |\\vec{v}|$',
      '$\\vec{u} \\cdot \\vec{v} \\ge 0$',
    ],
    correctAnswer: '$|\\vec{u} \\cdot \\vec{v}| \\le |\\vec{u}| \\cdot |\\vec{v}|$',
  },
  {
    question: 'Кога в неравенството на Коши–Буняковски има равенство?',
    answers: [
      'Когато двете редици числа са пропорционални',
      'Когато векторите са перпендикулярни',
      'Когато всички числа са равни на 1',
      'Равенство никога не е възможно',
    ],
    correctAnswer: 'Когато двете редици числа са пропорционални',
  },
  {
    question: 'Коя от функциите е изпъкнала на интервала $(0;\\ +\\infty)$?',
    answers: ['$x^2$', '$\\sqrt{x}$', '$\\ln x$', '$-x^2$'],
    correctAnswer: '$x^2$',
  },
  {
    question: 'Числата 1, 2, 3 трябва да се умножат по 4, 5, 6 (всяко по едно) и произведенията да се съберат. Кой сбор е най-голям?',
    answers: [
      '$1 \\cdot 4 + 2 \\cdot 5 + 3 \\cdot 6$',
      '$1 \\cdot 6 + 2 \\cdot 5 + 3 \\cdot 4$',
      '$1 \\cdot 5 + 2 \\cdot 4 + 3 \\cdot 6$',
      '$1 \\cdot 4 + 2 \\cdot 6 + 3 \\cdot 5$',
    ],
    correctAnswer: '$1 \\cdot 4 + 2 \\cdot 5 + 3 \\cdot 6$',
  },
  {
    question: 'Кое твърдение е НЕвярно?',
    answers: [
      '$x + \\frac{1}{x} \\ge 2$ за всяко $x \\ne 0$',
      '$x + \\frac{1}{x} \\ge 2$ за всяко $x > 0$',
      '$x^2 + \\frac{1}{x^2} \\ge 2$ за всяко $x \\ne 0$',
      '$|x| + \\frac{1}{|x|} \\ge 2$ за всяко $x \\ne 0$',
    ],
    correctAnswer: '$x + \\frac{1}{x} \\ge 2$ за всяко $x \\ne 0$',
  },
];

// ---------- Страница ----------

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

export function OlympiadInequalities() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Олимпиадни неравенства</h1>

        <div className="bg-gradient-to-br from-violet-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚖️ На пазара продавач има стара везна, чиито рамена не са съвсем равни. „Няма проблем – казва той, – ще претегля стоката веднъж на
            лявото блюдо и веднъж на дясното и ще взема средното.“ Везната показва 1,6 kg и 2,5 kg, а продавачът таксува 2,05 kg. Честно ли е?
            Оказва се, че истинската маса е точно 2 kg – и че при такава везна <Term id="arithmetic-mean">средното аритметично</Term> на двете показания{' '}
            <strong>винаги</strong> е повече от истинската маса, каквито и да са раменете. Защо „винаги“? Отговорът е едно от най-красивите{' '}
            <Term id="inequality">неравенства</Term> в математиката – и началото на пътя към олимпиадните задачи.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Четирите средни</h2>
          <p className={text}>
            В урока{' '}
            <Link to="/algebra/inequalities" className={link}>
              Неравенства
            </Link>{' '}
            доказахме, че <Tex>{'\\frac{a + b}{2} \\ge \\sqrt{ab}'}</Tex>, като започнахме от <Tex>{'(\\sqrt{a} - \\sqrt{b})^2 \\ge 0'}</Tex>. Това неравенство
            има още двама „съседи“ – средното квадратично и средното хармонично.
          </p>
          <Theorem
            type="definition"
            title="Средни на две положителни числа"
            description="Средно квадратично $Q = \sqrt{\frac{a^2 + b^2}{2}}$, средно аритметично $A = \frac{a + b}{2}$, средно геометрично $G = \sqrt{ab}$ и средно хармонично $H = \frac{2ab}{a + b} = \frac{2}{\frac{1}{a} + \frac{1}{b}}$ (реципрочното на средното аритметично на реципрочните)."
          />
          <Theorem
            title="Неравенство между средните"
            description="За всеки положителни $a$ и $b$: $Q \ge A \ge G \ge H$, като във всяко от неравенствата равенство има само при $a = b$."
          />
          <p className={text}>
            Доказателството е кратко. <Tex>{'Q^2 - A^2 = \\frac{a^2 + b^2}{2} - \\frac{(a + b)^2}{4} = \\frac{(a - b)^2}{4} \\ge 0'}</Tex>. Неравенството{' '}
            <Tex>{'A \\ge G'}</Tex> вече знаем. Накрая <Tex>{'H = \\frac{ab}{A} = \\frac{G^2}{A} \\le \\frac{G^2}{G} = G'}</Tex>, защото{' '}
            <Tex>{'A \\ge G'}</Tex>. Още по-нагледно е геометричното доказателство: в полуокръжност с диаметър <Tex>{'a + b'}</Tex> четирите средни
            са отсечки и всяка е <Term id="leg">катет</Term> в правоъгълен триъгълник, чиято <Term id="hypotenuse">хипотенуза</Term> е предишната.
          </p>
          <MeansLab />
          <Example
            description="Везната от началото: рамената са $l_1$ и $l_2$, показанията – $m_1$ и $m_2$. Каква е истинската маса $m$ и защо продавачът винаги печели, ако таксува средното аритметично?"
            steps={[
              'Стоката на лявото блюдо: равновесие при $m l_1 = m_1 l_2$. На дясното: $m_2 l_1 = m l_2$.',
              'Оттук $m_1 = m\\frac{l_1}{l_2}$ и $m_2 = m\\frac{l_2}{l_1}$. Умножаваме: $m_1 m_2 = m^2$ – раменете се съкращават.',
              'Истинската маса е средното геометрично: $m = \\sqrt{m_1 m_2} = \\sqrt{1{,}6 \\cdot 2{,}5} = 2\\ \\mathrm{kg}$.',
              'Продавачът таксува средното аритметично $\\frac{m_1 + m_2}{2} \\ge \\sqrt{m_1 m_2} = m$ – винаги повече, освен ако раменете са равни.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Средните на n числа и най-голяма и най-малка стойност</h2>
          <Theorem
            title="Неравенство между средното аритметично и средното геометрично"
            description="За неотрицателни числа $a_1, a_2, \ldots, a_n$: $\frac{a_1 + a_2 + \ldots + a_n}{n} \ge \sqrt[n]{a_1 a_2 \cdots a_n}$. Равенство има само когато всички числа са равни."
          />
          <p className={text}>
            Едно хитро доказателство тръгва от две числа. За четири: <Tex>{'\\frac{a + b + c + d}{4} = \\frac{1}{2}\\left(\\frac{a + b}{2} + \\frac{c + d}{2}\\right) \\ge \\sqrt{\\sqrt{ab} \\cdot \\sqrt{cd}} = \\sqrt[4]{abcd}'}</Tex>.
            Така стигаме до 8, 16, … числа. За три числа добавяме четвърто – самото им средно <Tex>{'A = \\frac{a + b + c}{3}'}</Tex>:{' '}
            <Tex>{'\\frac{a + b + c + A}{4} = A \\ge \\sqrt[4]{abcA}'}</Tex>, откъдето <Tex>{'A^4 \\ge abcA'}</Tex> и <Tex>{'A^3 \\ge abc'}</Tex>. Същият
            ход „надолу“ работи за всяко <Tex>{'n'}</Tex>. Тази идея се свързва с името на Огюстен Коши.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">Как се търси <Term id="extremum">екстремум</Term> с <Term id="am-gm">неравенството между средните</Term></p>
            <p>
              • <strong>Сборът е постоянен</strong> → произведението е най-голямо, когато събираемите са равни.
              <br />• <strong>Произведението е постоянно</strong> → сборът е най-малък, когато множителите са равни.
              <br />• Винаги проверяваме, че равенството наистина <strong>се достига</strong> при допустими стойности.
            </p>
          </div>
          <Example
            description="Да намерим най-малката стойност на $f(x) = x^2 + \frac{2}{x}$ при $x > 0$."
            steps={[
              'Директно $x^2 + \\frac{2}{x} \\ge 2\\sqrt{2x}$ не помага – дясната страна зависи от $x$.',
              'Разделяме $\\frac{2}{x}$ на две равни части, така че произведението да е константа: $x^2 + \\frac{1}{x} + \\frac{1}{x}$.',
              'За трите числа: $x^2 + \\frac{1}{x} + \\frac{1}{x} \\ge 3\\sqrt[3]{x^2 \\cdot \\frac{1}{x} \\cdot \\frac{1}{x}} = 3$.',
              'Равенство при $x^2 = \\frac{1}{x}$, т.е. $x = 1$ – допустимо. Най-малката стойност е $f(1) = 3$.',
            ]}
          />
          <p className={text}>
            Същата задача се решава и с{' '}
            <Link to="/analysis/derivatives" className={link}>
              производни
            </Link>
            , но неравенството дава отговора без смятане и показва <em>защо</em> минимумът е точно там.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Неравенство на Коши–Буняковски</h2>
          <Theorem
            title="Неравенство на Коши–Буняковски"
            description="За всеки реални числа $a_1, \ldots, a_n$ и $b_1, \ldots, b_n$: $(a_1b_1 + a_2b_2 + \ldots + a_nb_n)^2 \le (a_1^2 + a_2^2 + \ldots + a_n^2)(b_1^2 + b_2^2 + \ldots + b_n^2)$. Равенство има само когато числата са пропорционални: $a_i = tb_i$ за всяко $i$ (или всички $b_i = 0$)."
          />
          <p className={text}>
            Доказателство: изразът <Tex>{'(a_1t - b_1)^2 + \\ldots + (a_nt - b_n)^2'}</Tex> е неотрицателен за всяко <Tex>{'t'}</Tex>. Като го разкрием,
            получаваме квадратен <Term id="quadratic-trinomial">тричлен</Term> <Tex>{'At^2 - 2Bt + C \\ge 0'}</Tex>, където <Tex>{'A = \\sum a_i^2'}</Tex>, <Tex>{'B = \\sum a_ib_i'}</Tex>,{' '}
            <Tex>{'C = \\sum b_i^2'}</Tex>. Тричлен, който не става отрицателен, има <Term id="discriminant">дискриминанта</Term> <Tex>{'4B^2 - 4AC \\le 0'}</Tex> – това е точно{' '}
            <Tex>{'B^2 \\le AC'}</Tex>.
          </p>
          <p className={text}>
            За две числа неравенството има прост геометричен смисъл: това е{' '}
            <Link to="/geometry/vectors" className={link}>
              скаларното произведение
            </Link>{' '}
            <Tex>{'\\vec{u} \\cdot \\vec{v} = |\\vec{u}|\\,|\\vec{v}|\\cos\\varphi'}</Tex>, а <Tex>{'|\\cos\\varphi| \\le 1'}</Tex>. Неравенството носи
            имената на Огюстен Коши (за сборове, 1821 г.) и Виктор Буняковски (за <Term id="definite-integral">интеграли</Term>, 1859 г.); в много страни го наричат и неравенство на
            Шварц.
          </p>
          <CauchySchwarzLab />
          <Theorem
            title="Форма на Енгел (лема на Титу)"
            description="За реални $a_1, \ldots, a_n$ и положителни $x_1, \ldots, x_n$: $\frac{a_1^2}{x_1} + \frac{a_2^2}{x_2} + \ldots + \frac{a_n^2}{x_n} \ge \frac{(a_1 + a_2 + \ldots + a_n)^2}{x_1 + x_2 + \ldots + x_n}$, с равенство при $\frac{a_1}{x_1} = \ldots = \frac{a_n}{x_n}$. Получава се от Коши–Буняковски за числата $\frac{a_i}{\sqrt{x_i}}$ и $\sqrt{x_i}$."
          />
          <Example
            description="Неравенство на Несбит (1903 г.): за положителни $a$, $b$, $c$ е вярно $\frac{a}{b + c} + \frac{b}{c + a} + \frac{c}{a + b} \ge \frac{3}{2}$."
            steps={[
              'Пишем всяка дроб с квадрат в числителя: $\\frac{a}{b + c} = \\frac{a^2}{a(b + c)}$.',
              'Форма на Енгел: $\\sum \\frac{a^2}{a(b + c)} \\ge \\frac{(a + b + c)^2}{a(b + c) + b(c + a) + c(a + b)} = \\frac{(a + b + c)^2}{2(ab + bc + ca)}$.',
              'Остава $(a + b + c)^2 \\ge 3(ab + bc + ca)$, т.е. $a^2 + b^2 + c^2 \\ge ab + bc + ca$ – доказахме го в урока „Неравенства“ (задача 9).',
              'Равенство при $a = b = c$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Пренареждане и неравенство на Чебишов</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Имаш банкноти от 5, 10 и 20 € и можеш да вземеш 1, 2 и 3 броя от тях – но от всеки вид различен брой.
              Как да разпределиш броевете, за да получиш най-много пари? Отговорът е очевиден: най-много броя – от най-едрата банкнота. Това „очевидно“
              е теорема.
            </p>
          </div>
          <Theorem
            title="Неравенство за пренареждането"
            description="Ако $a_1 \le a_2 \le \ldots \le a_n$ и $b_1 \le b_2 \le \ldots \le b_n$, то за всяко пренареждане $c_1, \ldots, c_n$ на числата $b_i$: $a_1b_1 + \ldots + a_nb_n \ge a_1c_1 + \ldots + a_nc_n \ge a_1b_n + a_2b_{n-1} + \ldots + a_nb_1$. Еднакво подредените редици дават най-голям сбор, обратно подредените – най-малък."
          />
          <p className={text}>
            Доказателство с „размяна“: ако в сбора по-голямото <Tex>{'a_j'}</Tex> е умножено по по-малкото <Tex>{'c'}</Tex>, разменяме двата множителя.
            При <Tex>{'a_i \\le a_j'}</Tex> и <Tex>{'c_i \\ge c_j'}</Tex> разликата е{' '}
            <Tex>{'(a_ic_j + a_jc_i) - (a_ic_i + a_jc_j) = (a_j - a_i)(c_i - c_j) \\ge 0'}</Tex> – сборът не намалява. След краен брой размени
            редиците стават еднакво подредени.
          </p>
          <Example
            description="Да докажем, че $a^3 + b^3 + c^3 \ge a^2b + b^2c + c^2a$ за положителни $a$, $b$, $c$."
            steps={[
              'Редиците $(a^2, b^2, c^2)$ и $(a, b, c)$ са еднакво подредени – по-голямото число има по-голям квадрат.',
              'Еднакво подредени: $a^2 \\cdot a + b^2 \\cdot b + c^2 \\cdot c$ – най-големият възможен сбор.',
              '$a^2 \\cdot b + b^2 \\cdot c + c^2 \\cdot a$ е друго пренареждане на втората редица, затова е по-малък или равен.',
            ]}
          />
          <Theorem
            title="Неравенство на Чебишов"
            description="Ако $a_1 \le \ldots \le a_n$ и $b_1 \le \ldots \le b_n$, то $\frac{a_1b_1 + \ldots + a_nb_n}{n} \ge \frac{a_1 + \ldots + a_n}{n} \cdot \frac{b_1 + \ldots + b_n}{n}$. Средното на произведенията е поне колкото произведението на средните. Доказва се, като съберем $n$ неравенства за пренареждане (с циклично изместените редици)."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Изпъкналост и неравенство на Йенсен</h2>
          <Theorem
            type="definition"
            title="Изпъкнала функция"
            description="Функцията $f$ е изпъкнала на интервал, ако всяка хорда на графиката ѝ лежи над графиката (или върху нея). Ако хордите са под графиката, функцията е вдлъбната. Ако производната $f'$ расте (например $f''(x) \ge 0$), функцията е изпъкнала."
          />
          <Theorem
            title="Неравенство на Йенсен"
            description="Ако $f$ е изпъкнала, $w_1, \ldots, w_n \ge 0$ и $w_1 + \ldots + w_n = 1$, то $f(w_1x_1 + \ldots + w_nx_n) \le w_1f(x_1) + \ldots + w_nf(x_n)$. При равни тегла: $f\left(\frac{x_1 + \ldots + x_n}{n}\right) \le \frac{f(x_1) + \ldots + f(x_n)}{n}$. За вдлъбната функция знакът е обратен."
          />
          <ConvexityLab />
          <p className={text}>
            Йенсен обединява много от досегашните неравенства. За изпъкналата <Tex>{'f(x) = x^2'}</Tex> получаваме <Tex>{'\\left(\\frac{a + b}{2}\\right)^2 \\le \\frac{a^2 + b^2}{2}'}</Tex> –
            това е <Tex>{'A \\le Q'}</Tex>. За вдлъбнатата <Tex>{'f(x) = \\ln x'}</Tex>:{' '}
            <Tex>{'\\ln\\frac{a_1 + \\ldots + a_n}{n} \\ge \\frac{\\ln a_1 + \\ldots + \\ln a_n}{n} = \\ln\\sqrt[n]{a_1 \\cdots a_n}'}</Tex> – това е неравенството
            между средното аритметично и средното геометрично за <Tex>{'n'}</Tex> числа (виж урока{' '}
            <Link to="/algebra/logarithms" className={link}>
              Логаритми
            </Link>
            ).
          </p>
          <Example
            description="Да докажем, че за ъглите на всеки триъгълник $\sin A + \sin B + \sin C \le \frac{3\sqrt{3}}{2}$."
            steps={[
              'На интервала $[0;\\ \\pi]$ функцията $\\sin x$ е вдлъбната – графиката е „дъга“ над всяка своя хорда.',
              'По Йенсен за вдлъбната функция: $\\frac{\\sin A + \\sin B + \\sin C}{3} \\le \\sin\\frac{A + B + C}{3} = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.',
              'Умножаваме по 3: $\\sin A + \\sin B + \\sin C \\le \\frac{3\\sqrt{3}}{2} \\approx 2{,}598$, с равенство за равностранния триъгълник.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Олимпиадни техники</h2>
          <p className={text}>Освен готовите неравенства, състезателите използват няколко общи хода. Ето четири от най-полезните.</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold mb-1">Сбор от квадрати (SOS)</p>
              <p>
                Записваме разликата на двете страни като сбор от квадрати с неотрицателни коефициенти. Например{' '}
                <MathText>{'$a^3 + b^3 + c^3 - 3abc = \\frac{1}{2}(a + b + c)\\left[(a - b)^2 + (b - c)^2 + (c - a)^2\\right]$'}</MathText> – за
                неотрицателни числа това е неравенството между средните за три числа.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold mb-1">Хомогенизиране и нормиране</p>
              <p>
                Ако е дадено <MathText>{'$a + b + c = 1$'}</MathText>, можем да заменим единиците с <MathText>{'$a + b + c$'}</MathText>, така че всички членове
                да са от една степен. Например <MathText>{'$ab + bc + ca \\le \\frac{1}{3}$'}</MathText> става{' '}
                <MathText>{'$ab + bc + ca \\le \\frac{(a + b + c)^2}{3}$'}</MathText>. Обратно, хомогенно неравенство можем да „нормираме“ – да приемем
                удобно, например <MathText>{'$a + b + c = 3$'}</MathText>.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold mb-1">Субституция</p>
              <p>
                Условие като <MathText>{'$abc = 1$'}</MathText> често се „скрива“ със смяна <MathText>{'$x = \\frac{1}{a}$'}</MathText>,{' '}
                <MathText>{'$y = \\frac{1}{b}$'}</MathText>, <MathText>{'$z = \\frac{1}{c}$'}</MathText> – тогава и <MathText>{'$xyz = 1$'}</MathText>, а
                изразът става по-приятен (виж задача 9). За страните на триъгълник: <MathText>{'$a = y + z$'}</MathText>, <MathText>{'$b = z + x$'}</MathText>,{' '}
                <MathText>{'$c = x + y$'}</MathText> с положителни <MathText>{'$x, y, z$'}</MathText>.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
              <p className="font-semibold mb-1">Допирателна</p>
              <p>
                Когато очакваме равенство при <MathText>{'$a = b = c$'}</MathText>, сравняваме всеки член с допирателната в тази точка. Пример по-долу.
              </p>
            </div>
          </div>
          <Example
            description="Неотрицателните числа $a$, $b$, $c$ имат сбор 3. Да докажем, че $a^3 + b^3 + c^3 \ge 3$."
            steps={[
              'Очакваме равенство при $a = b = c = 1$. Допирателната към $y = x^3$ в точката $x = 1$ е $y = 3x - 2$.',
              'Проверяваме, че графиката е над нея: $x^3 - (3x - 2) = (x - 1)^2(x + 2) \\ge 0$ за всяко $x \\ge 0$.',
              'Събираме трите неравенства: $a^3 + b^3 + c^3 \\ge 3(a + b + c) - 6 = 9 - 6 = 3$.',
              'Равенство при $a = b = c = 1$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>
            Средни, най-малка и най-голяма стойност с неравенството между средните и с Коши–Буняковски. Дробните отговори въвеждай като 25/2.
          </p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Потърси сбор или произведение, което е постоянно, и провери кога има равенство." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <p className={text}>
            Много задачи за „най-изгодно“ са скрито неравенство между средните: щом нещо е постоянно, оптимумът е при равни части.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Средни на отрицателни числа', '$x + \\frac{1}{x} \\ge 2$ за всяко $x \\ne 0$', 'при $x = -1$ сборът е $-2$; нужно е $x > 0$'],
              [
                'Равенството не се достига',
                'при $x \\ge 2$: $x + \\frac{1}{x} \\ge 2$, значи минимумът е 2',
                'равенство е само при $x = 1$, а то е извън областта; минимумът е $\\frac{5}{2}$ при $x = 2$',
              ],
              [
                'Границата зависи от x',
                '$x^2 + \\frac{1}{x} \\ge 2\\sqrt{x}$, значи минимумът е $2\\sqrt{x}$',
                '$\\frac{1}{x} = \\frac{1}{2x} + \\frac{1}{2x}$ дава константа: $\\ge 3\\sqrt[3]{\\frac{1}{4}}$',
              ],
              [
                'Събрани неравенства с различно равенство',
                '$a^2 + 1 \\ge 2a$ и $a^2 + 4 \\ge 4a$, значи най-малката стойност на $2a^2 - 6a + 5$ е 0',
                'равенствата са при $a = 1$ и $a = 2$ – не едновременно; минимумът е $\\frac{1}{2}$ при $a = \\frac{3}{2}$',
              ],
              ['Умножаване на неравенства', '$-3 < 1$ и $-2 < 1$, значи $6 < 1$', 'неравенства се умножават почленно само при положителни страни'],
              [
                'Йенсен в грешната посока',
                '$\\sin A + \\sin B + \\sin C \\ge \\frac{3\\sqrt{3}}{2}$',
                'на $[0;\\ \\pi]$ синусът е вдлъбнат: сборът е $\\le \\frac{3\\sqrt{3}}{2}$',
              ],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                  ✗ <MathText>{wrong}</MathText>
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  ✓ <MathText>{right}</MathText>
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
              <Task id="a1" number={1} color="border-green-500" question="Намери най-малката стойност на $2x + \frac{8}{x}$ при $x > 0$." check={[8]} ask={['най-малка стойност']}>
                <p>
                  <Tex>{'2x + \\frac{8}{x} \\ge 2\\sqrt{2x \\cdot \\frac{8}{x}} = 2\\sqrt{16} = 8'}</Tex>
                </p>
                <p>
                  Равенство при <Tex>{'2x = \\frac{8}{x}'}</Tex>, т.е. <Tex>{'x^2 = 4'}</Tex> и <Tex>{'x = 2'}</Tex>. Най-малката стойност е 8.
                </p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Положителните числа $a$ и $b$ имат сбор 10. Колко е най-голямото възможно произведение $ab$?" check={[25]} ask={['$ab$']}>
                <p>
                  <Tex>{'\\sqrt{ab} \\le \\frac{a + b}{2} = 5'}</Tex>, следователно <Tex>{'ab \\le 25'}</Tex>.
                </p>
                <p>
                  Равенство при <Tex>{'a = b = 5'}</Tex>. Най-голямото произведение е 25.
                </p>
              </Task>
              <Task
                id="a3"
                number={3}
                color="border-green-500"
                question="Докажи, че $(a + b)\left(\frac{1}{a} + \frac{1}{b}\right) \ge 4$ за положителни $a$ и $b$. Колко е най-малката стойност на израза?"
                check={[4]}
                ask={['най-малка стойност']}
              >
                <p>
                  По неравенството между средните: <Tex>{'a + b \\ge 2\\sqrt{ab}'}</Tex> и <Tex>{'\\frac{1}{a} + \\frac{1}{b} \\ge \\frac{2}{\\sqrt{ab}}'}</Tex>.
                </p>
                <p>
                  Двете страни са положителни, умножаваме: <Tex>{'(a + b)\\left(\\frac{1}{a} + \\frac{1}{b}\\right) \\ge 2\\sqrt{ab} \\cdot \\frac{2}{\\sqrt{ab}} = 4'}</Tex>.
                </p>
                <p>Равенство при <Tex>{'a = b'}</Tex> – най-малката стойност е 4. (Това е и <Tex>{'A \\ge H'}</Tex>.)</p>
              </Task>
            </div>
            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Положителните числа $x$ и $y$ са такива, че $x + 2y = 8$. Колко е най-голямата стойност на $xy$?" check={[8]} ask={['$xy$']}>
                <p>
                  Сборът на <Tex>{'x'}</Tex> и <Tex>{'2y'}</Tex> е постоянен: <Tex>{'x \\cdot 2y \\le \\left(\\frac{x + 2y}{2}\\right)^2 = 16'}</Tex>.
                </p>
                <p>
                  <Tex>{'xy \\le 8'}</Tex>, с равенство при <Tex>{'x = 2y = 4'}</Tex>, т.е. <Tex>{'x = 4'}</Tex>, <Tex>{'y = 2'}</Tex>.
                </p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Реалните числа $x$ и $y$ са такива, че $x^2 + y^2 = 13$. Колко е най-голямата стойност на $2x + 3y$?" check={[13]} ask={['$2x + 3y$']}>
                <p>
                  Коши–Буняковски: <Tex>{'(2x + 3y)^2 \\le (2^2 + 3^2)(x^2 + y^2) = 13 \\cdot 13 = 169'}</Tex>.
                </p>
                <p>
                  <Tex>{'2x + 3y \\le 13'}</Tex>. Равенство при <Tex>{'x : y = 2 : 3'}</Tex>, т.е. <Tex>{'x = 2'}</Tex>, <Tex>{'y = 3'}</Tex>: <Tex>{'4 + 9 = 13'}</Tex> ✓.
                </p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Докажи, че $a^4 + b^4 + c^4 \ge abc(a + b + c)$ за всички реални $a$, $b$, $c$.">
                <p>
                  Използваме два пъти <Tex>{'x^2 + y^2 + z^2 \\ge xy + yz + zx'}</Tex> (сбор от квадрати).
                </p>
                <p>
                  За <Tex>{'x = a^2,\\ y = b^2,\\ z = c^2'}</Tex>: <Tex>{'a^4 + b^4 + c^4 \\ge a^2b^2 + b^2c^2 + c^2a^2'}</Tex>.
                </p>
                <p>
                  За <Tex>{'x = ab,\\ y = bc,\\ z = ca'}</Tex>: <Tex>{'a^2b^2 + b^2c^2 + c^2a^2 \\ge ab \\cdot bc + bc \\cdot ca + ca \\cdot ab = abc(a + b + c)'}</Tex>.
                </p>
                <p>Двете неравенства дават търсеното; равенство при <Tex>{'a = b = c'}</Tex>.</p>
              </Task>
            </div>
            <div className="mb-6">
              <TaskLevel level="C" />
              <Task
                id="c1"
                number={7}
                color="border-red-500"
                question="Положителните числа $x$, $y$, $z$ имат сбор 1. Намери най-малката стойност на $\frac{1}{x} + \frac{4}{y} + \frac{9}{z}$."
                check={[36]}
                ask={['най-малка стойност']}
              >
                <p>
                  Форма на Енгел: <Tex>{'\\frac{1^2}{x} + \\frac{2^2}{y} + \\frac{3^2}{z} \\ge \\frac{(1 + 2 + 3)^2}{x + y + z} = 36'}</Tex>.
                </p>
                <p>
                  Равенство при <Tex>{'\\frac{1}{x} = \\frac{2}{y} = \\frac{3}{z}'}</Tex>, т.е. <Tex>{'x : y : z = 1 : 2 : 3'}</Tex>:{' '}
                  <Tex>{'x = \\frac{1}{6},\\ y = \\frac{1}{3},\\ z = \\frac{1}{2}'}</Tex>.
                </p>
                <p>
                  Проверка: <Tex>{'6 + 12 + 18 = 36'}</Tex>. Най-малката стойност е 36.
                </p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажи, че за положителни $a$, $b$, $c$ е вярно $\frac{a^2}{b} + \frac{b^2}{c} + \frac{c^2}{a} \ge a + b + c$.">
                <p>
                  Форма на Енгел: <Tex>{'\\frac{a^2}{b} + \\frac{b^2}{c} + \\frac{c^2}{a} \\ge \\frac{(a + b + c)^2}{b + c + a} = a + b + c'}</Tex>.
                </p>
                <p>
                  Друг начин: <Tex>{'\\frac{a^2}{b} + b \\ge 2a'}</Tex> (средни на две числа). Събираме трите такива неравенства и съкращаваме{' '}
                  <Tex>{'a + b + c'}</Tex>.
                </p>
                <p>Равенство при <Tex>{'a = b = c'}</Tex>.</p>
              </Task>
              <Task
                id="c3"
                number={9}
                color="border-red-500"
                question="Задача в стила на Международната олимпиада (1995 г.): положителните числа $a$, $b$, $c$ имат произведение 1. Докажи, че $\frac{1}{a^3(b + c)} + \frac{1}{b^3(c + a)} + \frac{1}{c^3(a + b)} \ge \frac{3}{2}$."
              >
                <p>
                  Субституция <Tex>{'x = \\frac{1}{a},\\ y = \\frac{1}{b},\\ z = \\frac{1}{c}'}</Tex>; тогава <Tex>{'xyz = 1'}</Tex> и{' '}
                  <Tex>{'b + c = \\frac{1}{y} + \\frac{1}{z} = \\frac{y + z}{yz}'}</Tex>.
                </p>
                <p>
                  Първото събираемо става <Tex>{'\\frac{x^3 yz}{y + z} = \\frac{x^2 \\cdot xyz}{y + z} = \\frac{x^2}{y + z}'}</Tex>; аналогично и другите.
                </p>
                <p>
                  Форма на Енгел: <Tex>{'\\frac{x^2}{y + z} + \\frac{y^2}{z + x} + \\frac{z^2}{x + y} \\ge \\frac{(x + y + z)^2}{2(x + y + z)} = \\frac{x + y + z}{2}'}</Tex>.
                </p>
                <p>
                  Накрая <Tex>{'x + y + z \\ge 3\\sqrt[3]{xyz} = 3'}</Tex>, следователно сборът е <Tex>{'\\ge \\frac{3}{2}'}</Tex>. Равенство при{' '}
                  <Tex>{'a = b = c = 1'}</Tex>.
                </p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                ✓ <Tex>{'\\sqrt{\\frac{a^2 + b^2}{2}} \\ge \\frac{a + b}{2} \\ge \\sqrt{ab} \\ge \\frac{2ab}{a + b}'}</Tex> за положителни <Tex>{'a,\\ b'}</Tex>; равенство само при <Tex>{'a = b'}</Tex>
              </li>
              <li>
                ✓ <Tex>{'\\frac{a_1 + \\ldots + a_n}{n} \\ge \\sqrt[n]{a_1 \\cdots a_n}'}</Tex>: постоянен сбор → най-голямо произведение; постоянно произведение → най-малък сбор
              </li>
              <li>
                ✓ Коши–Буняковски: <Tex>{'\\left(\\sum a_ib_i\\right)^2 \\le \\sum a_i^2 \\sum b_i^2'}</Tex>; форма на Енгел: <Tex>{'\\sum \\frac{a_i^2}{x_i} \\ge \\frac{(\\sum a_i)^2}{\\sum x_i}'}</Tex>
              </li>
              <li>✓ Пренареждане: еднакво подредени <Term id="sequence">редици</Term> дават най-голям сбор от произведения</li>
              <li>
                ✓ Йенсен: за изпъкнала <Tex>{'f'}</Tex> стойността в средното е най-много средното на стойностите
              </li>
              <li>✓ Техники: сбор от квадрати, хомогенизиране, субституция, допирателна</li>
              <li>✓ Винаги проверяваме кога има равенство – и дали то е възможно</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Първата книга, посветена изцяло на неравенствата, е „Inequalities“ на Годфри Харди, Джон Литълууд и Георг Пойа, издадена в Кеймбридж
              през 1934 г. Дотогава неравенствата били „помощни инструменти“, разпръснати из статии по анализ. Книгата ги събира в стройна теория –
              и много от техниките, които днес се учат за олимпиади, идват оттам.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
