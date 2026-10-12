import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Drill, fracTex, nonZero, pick, polyTex, randInt } from '~/drill';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import ComplexPlaneLab from './ComplexPlaneLab';
import ComplexPowersLab from './ComplexPowersLab';
import RootsOfUnityLab from './RootsOfUnityLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** a + bi в LaTeX: 3 - 2i, -i, 4. */
function cTex(a: number, b: number) {
  if (b === 0) return String(a);
  const im = Math.abs(b) === 1 ? 'i' : `${Math.abs(b)}i`;
  if (a === 0) return b < 0 ? `-${im}` : im;
  return `${a} ${b < 0 ? '-' : '+'} ${im}`;
}

/** (re + im·i) / m в LaTeX, с опростени дроби: −2 + i, -\\frac{1}{5} + \\frac{7}{5}i, -i. */
function cFracTex(re: number, im: number, m: number) {
  const imAbs = fracTex(Math.abs(im), m);
  const imPart = im === 0 ? '' : `${imAbs === '1' ? '' : imAbs}i`;
  if (re === 0) return im === 0 ? '0' : `${im < 0 ? '-' : ''}${imPart}`;
  return im === 0 ? fracTex(re, m) : `${fracTex(re, m)} ${im < 0 ? '-' : '+'} ${imPart}`;
}

const TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 6, 10],
  [12, 5, 13],
  [8, 15, 17],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    const [a, b, c, d] = [nonZero(-4, 4), nonZero(-4, 4), nonZero(-4, 4), nonZero(-4, 4)];
    const [re, im] = [a * c - b * d, a * d + b * c];
    const askRe = randInt(0, 1) === 0;
    return {
      tex: `(${cTex(a, b)})(${cTex(c, d)})`,
      ask: askRe ? 'Реалната част е:' : 'Имагинерната част е:',
      num: askRe ? re : im,
      den: 1,
      steps: [
        `Разкриваме скобите и заместваме $i^2 = -1$: реална част $${a} \\cdot ${c < 0 ? `(${c})` : c} - ${b < 0 ? `(${b})` : b} \\cdot ${d < 0 ? `(${d})` : d} = ${re}$`,
        `имагинерна част $${a} \\cdot ${d < 0 ? `(${d})` : d} + ${b < 0 ? `(${b})` : b} \\cdot ${c < 0 ? `(${c})` : c} = ${im}$, т.е. $${cTex(re, im)}$`,
      ],
    };
  }
  if (kind === 1) {
    const [a, b, r] = pick(TRIPLES);
    const [sa, sb] = [pick([1, -1]) * a, pick([1, -1]) * b];
    return {
      tex: `|${cTex(sa, sb)}|`,
      ask: '= ?',
      num: r,
      den: 1,
      steps: [`$|a + bi| = \\sqrt{a^2 + b^2}$`, `$\\sqrt{${a * a} + ${b * b}} = \\sqrt{${r * r}} = ${r}$`],
    };
  }
  if (kind === 2) {
    const n = 2 * randInt(2, 40);
    const v = n % 4 === 0 ? 1 : -1;
    return {
      tex: `i^{${n}}`,
      ask: '= ?',
      num: v,
      den: 1,
      steps: ['Степените на $i$ се повтарят през 4: $i,\\ -1,\\ -i,\\ 1$', `$${n} = 4 \\cdot ${Math.floor(n / 4)} + ${n % 4}$, затова $i^{${n}} = ${n % 4 === 0 ? '1' : 'i^2 = -1'}$`],
    };
  }
  if (kind === 3) {
    const [c, d] = pick([
      [1, 1],
      [1, -1],
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
    ]);
    const [a, b] = [nonZero(-5, 5), nonZero(-5, 5)];
    const m = c * c + d * d;
    const [re, im] = [a * c + b * d, b * c - a * d];
    const askRe = randInt(0, 1) === 0;
    return {
      tex: `\\frac{${cTex(a, b)}}{${cTex(c, d)}}`,
      ask: askRe ? 'Реалната част е:' : 'Имагинерната част е:',
      num: askRe ? re : im,
      den: m,
      steps: [
        `Умножаваме числителя и знаменателя по спрегнатото $${cTex(c, -d)}$; знаменателят става $${c}^2 + ${Math.abs(d)}^2 = ${m}$`,
        `$(${cTex(a, b)})(${cTex(c, -d)}) = ${cTex(re, im)}$`,
        `Резултат: $${cFracTex(re, im, m)}$`,
      ],
    };
  }
  const [mm, nn] = [randInt(-3, 3), randInt(1, 4)];
  const [p, q] = [-2 * mm, mm * mm + nn * nn];
  const askIm = randInt(0, 1) === 0;
  return {
    tex: `${polyTex([[1, 2], [p, 1], [q, 0]])} = 0`,
    ask: askIm ? 'Имагинерната част на корена с $\\operatorname{Im} > 0$ е:' : 'Реалната част на корените е:',
    num: askIm ? nn : mm,
    den: 1,
    steps: [`$D = ${p * p} - ${4 * q} = ${p * p - 4 * q} < 0$, $\\sqrt{D} = ${2 * nn}i$`, `$x = \\frac{${-p} \\pm ${2 * nn}i}{2} = ${mm === 0 ? `\\pm ${nn === 1 ? '' : nn}i` : `${mm} \\pm ${nn === 1 ? '' : nn}i`}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '⚡ Импеданс',
    problem: 'В електротехниката съпротивлението на верига с бобина се записва като комплексно число $Z = R + iX$. При $R = 3\\ \\Omega$ и $X = 4\\ \\Omega$ колко е големината $|Z|$ и какъв ток тече при напрежение 10 V ($I = \\frac{U}{|Z|}$)?',
    solution: ['$|Z| = \\sqrt{3^2 + 4^2} = 5\\ \\Omega$', '$I = \\frac{10}{5} = 2\\ \\mathrm{A}$', '(Електроинженерите пишат $j$ вместо $i$, за да не се бърка с тока.)'],
    answer: '$5\\ \\Omega$, $2\\ \\mathrm{A}$',
    check: [5, 2],
    ask: ['|Z|, Ω', 'ток, A'],
  },
  {
    title: '🔌 Последователно свързване',
    problem: 'Два елемента с импеданси $Z_1 = 2 + 3i$ и $Z_2 = 4 - 11i$ (в омове) са свързани последователно – импедансите се събират. Колко е $|Z_1 + Z_2|$?',
    solution: ['$Z = (2 + 4) + (3 - 11)i = 6 - 8i$', '$|Z| = \\sqrt{36 + 64} = 10\\ \\Omega$'],
    answer: '$10\\ \\Omega$',
    check: [10],
    ask: ['|Z|, Ω'],
  },
  {
    title: '🤖 Робот завива',
    problem: 'Робот е в точката $(3;\\ 4)$ спрямо началото. Завъртането на 90° около началото обратно на часовниковата стрелка е умножение по $i$. Къде ще е роботът след завъртането?',
    solution: ['$(3 + 4i) \\cdot i = 3i + 4i^2 = -4 + 3i$', 'Новото положение е $(-4;\\ 3)$ – разстоянието до началото остава 5.'],
    answer: '$(-4;\\ 3)$',
    check: [-4, 3],
    ask: ['x', 'y'],
  },
  {
    title: '📐 Завъртане на 60°',
    problem: 'Точката $(2;\\ 0)$ се завърта на 60° около началото. Намерете новите ѝ координати, като умножите по $\\cos 60^{\\circ} + i\\sin 60^{\\circ}$.',
    solution: ['$\\cos 60^{\\circ} + i\\sin 60^{\\circ} = \\frac{1}{2} + \\frac{\\sqrt{3}}{2}i$', '$2 \\cdot \\left(\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right) = 1 + \\sqrt{3}\\,i$', 'Новите координати са $(1;\\ \\sqrt{3}) \\approx (1;\\ 1{,}73)$.'],
    answer: '$(1;\\ 1{,}73)$',
    check: [1, 1.73],
    ask: ['x', 'y'],
  },
  {
    title: '🔊 Сбор на трептения',
    problem: 'Две трептения с еднаква честота и амплитуди 3 и 4, изместени на четвърт период (90°), се събират. Физиците ги представят като комплексни числа $3$ и $4i$. Каква е амплитудата на сбора?',
    solution: ['Сборът е $3 + 4i$.', 'Амплитудата е модулът: $|3 + 4i| = 5$ (а не 7!).'],
    answer: '5',
    check: [5],
    ask: ['амплитуда'],
  },
  {
    title: '🌀 Фрактал на Манделброт',
    problem: 'Фракталът на Манделброт се строи с правилото $z_{n+1} = z_n^2 + c$, $z_0 = 0$. Пресметнете $z_3$ при $c = i$ (въведете реалната и имагинерната част).',
    solution: ['$z_1 = 0^2 + i = i$', '$z_2 = i^2 + i = -1 + i$', '$z_3 = (-1 + i)^2 + i = 1 - 2i - 1 + i = -i$', 'После редицата се повтаря: $z_4 = -1 + i$ – остава ограничена, затова $c = i$ е в множеството на Манделброт.'],
    answer: '$z_3 = -i$',
    check: [0, -1],
    ask: ['Re', 'Im'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'На колко е равно $i^2$?',
    answers: ['$-1$', '$1$', '$i$', '$-i$'],
    correctAnswer: '$-1$',
  },
  {
    question: 'На колко е равно $i^3$?',
    answers: ['$-i$', '$i$', '$-1$', '$1$'],
    correctAnswer: '$-i$',
  },
  {
    question: 'На колко е равно $(2 + 3i) + (1 - i)$?',
    answers: ['$3 + 2i$', '$3 + 4i$', '$1 + 4i$', '$5i$'],
    correctAnswer: '$3 + 2i$',
  },
  {
    question: 'На колко е равно $(1 + i)(1 - i)$?',
    answers: ['$2$', '$0$', '$-2$', '$2i$'],
    correctAnswer: '$2$',
  },
  {
    question: 'На колко е равно $|3 - 4i|$?',
    answers: ['$5$', '$7$', '$-1$', '$25$'],
    correctAnswer: '$5$',
  },
  {
    question: 'Кое е спрегнатото число на $5 - 2i$?',
    answers: ['$5 + 2i$', '$-5 + 2i$', '$-5 - 2i$', '$2 - 5i$'],
    correctAnswer: '$5 + 2i$',
  },
  {
    question: 'Кои са корените на $x^2 + 4 = 0$?',
    answers: ['$\\pm 2i$', '$\\pm 2$', '$\\pm 4i$', 'няма корени'],
    correctAnswer: '$\\pm 2i$',
  },
  {
    question: 'Какво прави умножението по $i$ с точка от комплексната равнина?',
    answers: ['завърта я на 90° около началото', 'отразява я спрямо реалната ос', 'премества я с 1 нагоре', 'удвоява разстоянието до началото'],
    correctAnswer: 'завърта я на 90° около началото',
  },
  {
    question: 'На колко е равно $i^{100}$?',
    answers: ['$1$', '$-1$', '$i$', '$100i$'],
    correctAnswer: '$1$',
  },
];

// ---------- Страница ----------

export function ComplexNumbers() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Комплексни числа</h1>

        <div className="bg-gradient-to-br from-fuchsia-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🧩 През 1545 г. Джероламо Кардано публикува формула за корените на кубичните уравнения. Но се случва нещо странно: при
            уравнението <Tex>{'x^3 = 15x + 4'}</Tex>, което очевидно има корен <Tex>{'x = 4'}</Tex>, формулата изисква квадратен корен от{' '}
            <Tex>{'-121'}</Tex>. Около 1572 г. Рафаел Бомбели се осмелява да смята с такива „невъзможни“ корени като с обикновени числа – и
            накрая те се съкращават и дават точно 4. Декарт по-късно ги нарича подигравателно „въображаеми“ (имагинерни). Днес без тях няма
            квантова механика, електротехника и обработка на звук.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Имагинерната единица</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Уравнението <Tex>{'x^2 = -1'}</Tex> няма реален корен – квадратът на всяко реално число е
              неотрицателен. Какво ще стане, ако просто <em>измислим</em> число с <Tex>{'i^2 = -1'}</Tex> и смятаме с него по обичайните правила?
            </p>
          </div>
          <Theorem
            type="definition"
            title="Комплексно число"
            description="Числото $i$ с $i^2 = -1$ се нарича имагинерна единица. Комплексно число е число от вида $z = a + bi$, където $a$ и $b$ са реални: $a = \operatorname{Re} z$ е реалната част, $b = \operatorname{Im} z$ – имагинерната. Две комплексни числа са равни, когато реалните и имагинерните им части са равни. Реалните числа са комплексните с $b = 0$."
          />
          <p className={text}>
            Сега <Tex>{'\\sqrt{-9} = 3i'}</Tex>, защото <Tex>{'(3i)^2 = 9i^2 = -9'}</Tex>. Степените на <Tex>{'i'}</Tex> се повтарят през четири:{' '}
            <Tex>{'i^1 = i,\\ i^2 = -1,\\ i^3 = -i,\\ i^4 = 1,\\ i^5 = i, \\ldots'}</Tex> Затова <Tex>{'i^n'}</Tex> зависи само от остатъка на{' '}
            <Tex>{'n'}</Tex> при деление на 4.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Действия с комплексни числа</h2>
          <Theorem
            title="Събиране, изваждане и умножение"
            description="Смятаме като с многочлени на $i$ и заместваме $i^2 = -1$: $(a + bi) \pm (c + di) = (a \pm c) + (b \pm d)i$; $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$."
          />
          <Theorem
            type="definition"
            title="Спрегнато число и деление"
            description="Спрегнатото на $z = a + bi$ е $\bar{z} = a - bi$. Тогава $z \cdot \bar{z} = a^2 + b^2$ е реално число. За да разделим, умножаваме числителя и знаменателя по спрегнатото на знаменателя: $\frac{a + bi}{c + di} = \frac{(a + bi)(c - di)}{c^2 + d^2}$."
          />
          <Example
            description="Да пресметнем $(2 + 3i)(4 - i)$ и $\frac{5 + 5i}{1 + 2i}$."
            steps={[
              '$(2 + 3i)(4 - i) = 8 - 2i + 12i - 3i^2 = 8 + 10i + 3 = 11 + 10i$',
              '$\\frac{5 + 5i}{1 + 2i} = \\frac{(5 + 5i)(1 - 2i)}{1^2 + 2^2} = \\frac{5 - 10i + 5i - 10i^2}{5}$',
              '$= \\frac{15 - 5i}{5} = 3 - i$ (проверка: $(3 - i)(1 + 2i) = 3 + 6i - i - 2i^2 = 5 + 5i$ ✓)',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Комплексната равнина</h2>
          <p className={text}>
            В началото на XIX век Арган и Гаус предлагат да изобразим <Tex>{'a + bi'}</Tex> като точката <Tex>{'(a;\\ b)'}</Tex> в равнината –
            хоризонталната ос е реалната, вертикалната – имагинерната. Изведнъж „въображаемите“ числа получават съвсем реална геометрия:
            събирането е събиране на вектори (виж{' '}
            <Link to="/geometry/vectors" className={link}>
              Вектори
            </Link>
            ), а модулът е разстоянието до нулата.
          </p>
          <Theorem
            type="definition"
            title="Модул"
            description="Модулът на $z = a + bi$ е $|z| = \sqrt{a^2 + b^2}$ – разстоянието от точката $(a;\ b)$ до началото (по Питагоровата теорема). В сила е $|z|^2 = z\bar{z}$ и $|zw| = |z| \cdot |w|$."
          />
          <ComplexPlaneLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Тригонометричен вид и формула на Моавър</h2>
          <Theorem
            title="Тригонометричен вид"
            description="Всяко $z \ne 0$ се записва като $z = r(\cos \varphi + i\sin \varphi)$, където $r = |z|$, а $\varphi$ е ъгълът между положителната реална полуос и вектора към $z$ (аргумент). При умножение модулите се умножават, а аргументите се събират: $z_1 z_2 = r_1 r_2\left(\cos(\varphi_1 + \varphi_2) + i\sin(\varphi_1 + \varphi_2)\right)$."
          />
          <p className={text}>
            Затова умножението по <Tex>{'i = \\cos 90^{\\circ} + i\\sin 90^{\\circ}'}</Tex> е завъртане на 90°. Като повтаряме умножението,
            получаваме <strong>формулата на Моавър</strong>: <Tex>{'z^n = r^n(\\cos n\\varphi + i\\sin n\\varphi)'}</Tex>. Свързахме алгебрата с{' '}
            <Link to="/geometry/trigonometry" className={link}>
              тригонометрията
            </Link>
            .
          </p>
          <ComplexPowersLab />
          <Example
            description="Да пресметнем $(1 + i)^8$."
            steps={[
              '$|1 + i| = \\sqrt{2}$, аргументът е $45^{\\circ}$: $1 + i = \\sqrt{2}(\\cos 45^{\\circ} + i\\sin 45^{\\circ})$',
              '$(1 + i)^8 = (\\sqrt{2})^8(\\cos 360^{\\circ} + i\\sin 360^{\\circ}) = 16 \\cdot 1 = 16$',
              'Без формулата: $(1 + i)^2 = 2i$, $(2i)^4 = 16i^4 = 16$ ✓',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Уравнения и корени от единицата</h2>
          <p className={text}>
            Квадратните уравнения с отрицателна дискриминанта вече имат корени (виж{' '}
            <Link to="/algebra/quadratic" className={link}>
              Квадратни уравнения
            </Link>
            ): <Tex>{'x_{1,2} = \\frac{-b \\pm i\\sqrt{-D}}{2a}'}</Tex>. Двата корена са спрегнати. Нещо повече – Гаус доказва (1799), че
            всяко алгебрично уравнение от степен <Tex>{'n'}</Tex> има точно <Tex>{'n'}</Tex> комплексни корена (броени с кратностите). Това е{' '}
            <strong>основната теорема на алгебрата</strong>: с комплексните числа никое уравнение не остава без решение.
          </p>
          <Example
            description="Да решим $x^2 + 2x + 5 = 0$."
            steps={['$D = 4 - 20 = -16$, $\\sqrt{D} = 4i$', '$x_{1,2} = \\frac{-2 \\pm 4i}{2} = -1 \\pm 2i$', 'Проверка: $(-1 + 2i)^2 + 2(-1 + 2i) + 5 = (1 - 4i - 4) - 2 + 4i + 5 = 0$ ✓']}
          />
          <Theorem
            title="Корени от единицата"
            description="Уравнението $z^n = 1$ има $n$ корена $\varepsilon_k = \cos \frac{360^{\circ} k}{n} + i\sin \frac{360^{\circ} k}{n}$, $k = 0, 1, \ldots, n - 1$. Те са върховете на правилен $n$-ъгълник, вписан в единичната окръжност, и сборът им е 0."
          />
          <RootsOfUnityLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата част. Дробните отговори въвеждай като 3/5, отрицателните – с минус.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Замести i² = −1 и събери реалните и имагинерните части поотделно." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Комплексните числа около нас</h2>
          <p className={text}>
            Където има въртене или трептене, има комплексни числа: в променливия ток, в звука и музиката (разлагането на сигнал на честоти),
            в радиото и Wi-Fi, в компютърната графика. Уравнението на Шрьодингер в квантовата механика е записано директно с <Tex>{'i'}</Tex>.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Квадратът на $i$', '$i^2 = 1$', '$i^2 = -1$'],
              ['Корен от произведение', '$\\sqrt{-4} \\cdot \\sqrt{-9} = \\sqrt{36} = 6$', '$2i \\cdot 3i = 6i^2 = -6$'],
              ['Модул', '$|3 + 4i| = 3 + 4 = 7$', '$|3 + 4i| = \\sqrt{9 + 16} = 5$'],
              ['Спрегнато число', '$\\overline{3 + 4i} = -3 - 4i$', '$\\overline{3 + 4i} = 3 - 4i$'],
              ['Квадрат на сбор', '$(a + bi)^2 = a^2 + b^2$', '$(a + bi)^2 = a^2 - b^2 + 2abi$'],
              ['Деление поотделно', '$\\frac{a + bi}{c + di} = \\frac{a}{c} + \\frac{b}{d}i$', 'умножаваме по спрегнатото $c - di$'],
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
              <Task id="a1" number={1} color="border-green-500" question="За $z = 3 + 2i$ и $w = 1 - 4i$ пресметнете $z + w$, $z - w$ и $zw$.">
                <p><Tex>{'z + w = 4 - 2i'}</Tex>; <Tex>{'z - w = 2 + 6i'}</Tex></p>
                <p><Tex>{'zw = 3 - 12i + 2i - 8i^2 = 3 - 10i + 8 = 11 - 10i'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Пресметнете $\frac{2 + i}{1 - i}$." check={[1 / 2, 3 / 2]} ask={['$\\operatorname{Re}$', '$\\operatorname{Im}$']}>
                <p><Tex>{'\\frac{(2 + i)(1 + i)}{(1 - i)(1 + i)} = \\frac{2 + 2i + i + i^2}{1 + 1}'}</Tex></p>
                <p><Tex>{'= \\frac{1 + 3i}{2} = \\frac{1}{2} + \\frac{3}{2}i'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Решете уравнението $x^2 - 4x + 13 = 0$.">
                <p><Tex>{'D = 16 - 52 = -36'}</Tex>, <Tex>{'\\sqrt{D} = 6i'}</Tex></p>
                <p><Tex>{'x_{1,2} = \\frac{4 \\pm 6i}{2} = 2 \\pm 3i'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Пресметнете $i^{2026}$ и $i + i^2 + i^3 + \ldots + i^{100}$." check={[-1, 0]} ask={['$i^{2026}$', 'сборът']}>
                <p><Tex>{'2026 = 4 \\cdot 506 + 2 \\Rightarrow i^{2026} = i^2 = -1'}</Tex></p>
                <p>Всеки четири поредни степени дават <Tex>{'i - 1 - i + 1 = 0'}</Tex>, а 100 събираеми са 25 такива четворки.</p>
                <p>Сборът е 0.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Запишете $1 + i\sqrt{3}$ в тригонометричен вид и пресметнете $(1 + i\sqrt{3})^6$." check={[64]} ask={['$(1 + i\\sqrt{3})^6$']}>
                <p><Tex>{'r = \\sqrt{1 + 3} = 2'}</Tex>; <Tex>{'\\cos \\varphi = \\frac{1}{2},\\ \\sin \\varphi = \\frac{\\sqrt{3}}{2} \\Rightarrow \\varphi = 60^{\\circ}'}</Tex></p>
                <p><Tex>{'1 + i\\sqrt{3} = 2(\\cos 60^{\\circ} + i\\sin 60^{\\circ})'}</Tex></p>
                <p><Tex>{'(1 + i\\sqrt{3})^6 = 2^6(\\cos 360^{\\circ} + i\\sin 360^{\\circ}) = 64'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намерете реалните числа $x$ и $y$, за които $(x + yi)(2 - i) = 5 + 5i$." check={[1, 3]} ask={['$x$', '$y$']}>
                <p><Tex>{'x + yi = \\frac{5 + 5i}{2 - i} = \\frac{(5 + 5i)(2 + i)}{5}'}</Tex></p>
                <p><Tex>{'= \\frac{10 + 5i + 10i + 5i^2}{5} = \\frac{5 + 15i}{5} = 1 + 3i'}</Tex></p>
                <p><Tex>{'x = 1,\\ y = 3'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намерете всички корени на $z^3 = 1$ и проверете, че сборът им е 0.">
                <p><Tex>{'z^3 - 1 = (z - 1)(z^2 + z + 1) = 0'}</Tex></p>
                <p><Tex>{'z_1 = 1'}</Tex>; от <Tex>{'z^2 + z + 1 = 0'}</Tex>: <Tex>{'z_{2,3} = -\\frac{1}{2} \\pm \\frac{\\sqrt{3}}{2}i'}</Tex></p>
                <p>Сбор: <Tex>{'1 - \\frac{1}{2} - \\frac{1}{2} = 0'}</Tex> (имагинерните части се унищожават). Също от Виет: сборът на корените на <Tex>{'z^3 - 1'}</Tex> е 0.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Комплексното число $z$ удовлетворява $z + \frac{1}{z} = 1$. Пресметнете $z^{2026} + \frac{1}{z^{2026}}$." check={[-1]} ask={['$z^{2026} + \\frac{1}{z^{2026}}$']}>
                <p>Умножаваме по <Tex>{'z'}</Tex>: <Tex>{'z^2 - z + 1 = 0'}</Tex>. Тогава <Tex>{'z^3 + 1 = (z + 1)(z^2 - z + 1) = 0'}</Tex>, т.е. <Tex>{'z^3 = -1'}</Tex> и <Tex>{'z^6 = 1'}</Tex>.</p>
                <p><Tex>{'2026 = 6 \\cdot 337 + 4 \\Rightarrow z^{2026} = z^4 = -z'}</Tex>, а <Tex>{'\\frac{1}{z^{2026}} = \\frac{1}{z^4} = z^2 = z - 1'}</Tex>.</p>
                <p>Сборът е <Tex>{'-z + z - 1 = -1'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Какво множество от точки в комплексната равнина описва условието $|z - 2i| = |z + 2|$?">
                <p><Tex>{'|z - 2i|'}</Tex> е разстоянието от <Tex>{'z'}</Tex> до точката <Tex>{'(0;\\ 2)'}</Tex>, а <Tex>{'|z + 2|'}</Tex> – до <Tex>{'(-2;\\ 0)'}</Tex>.</p>
                <p>Точките, равноотдалечени от две точки, лежат на симетралата на отсечката между тях.</p>
                <p>С <Tex>{'z = x + yi'}</Tex>: <Tex>{'x^2 + (y - 2)^2 = (x + 2)^2 + y^2 \\Rightarrow y = -x'}</Tex> – правата <Tex>{'y = -x'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-fuchsia-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'i^2 = -1'}</Tex>; <Tex>{'z = a + bi'}</Tex>, <Tex>{'\\operatorname{Re} z = a'}</Tex>, <Tex>{'\\operatorname{Im} z = b'}</Tex>; степените на <Tex>{'i'}</Tex> се повтарят през 4</li>
              <li>✓ <Tex>{'(a + bi)(c + di) = (ac - bd) + (ad + bc)i'}</Tex>; делим, като умножим по спрегнатото <Tex>{'\\bar{z} = a - bi'}</Tex></li>
              <li>✓ <Tex>{'|z| = \\sqrt{a^2 + b^2}'}</Tex> – разстоянието до 0 в комплексната равнина</li>
              <li>✓ <Tex>{'z = r(\\cos \\varphi + i\\sin \\varphi)'}</Tex>; при умножение модулите се умножават, ъглите се събират</li>
              <li>✓ Моавър: <Tex>{'z^n = r^n(\\cos n\\varphi + i\\sin n\\varphi)'}</Tex>; корените на <Tex>{'z^n = 1'}</Tex> са върхове на правилен <Tex>{'n'}</Tex>-ъгълник</li>
              <li>✓ Всяко уравнение от степен <Tex>{'n'}</Tex> има <Tex>{'n'}</Tex> комплексни корена (основна теорема на алгебрата)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Ойлер открива, че <Tex>{'e^{i\\varphi} = \\cos \\varphi + i\\sin \\varphi'}</Tex>. При <Tex>{'\\varphi = \\pi'}</Tex> се получава{' '}
              <Tex>{'e^{i\\pi} + 1 = 0'}</Tex> – равенство, което свързва петте най-важни числа в математиката: <Tex>{'0'}</Tex>, <Tex>{'1'}</Tex>,{' '}
              <Tex>{'\\pi'}</Tex>, <Tex>{'e'}</Tex> и <Tex>{'i'}</Tex>. В анкети сред математици то често е избирано за „най-красивата формула“.
              Символа <Tex>{'i'}</Tex> за имагинерната единица също въвежда Ойлер.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
