import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Drill, fracTex, nonZero, paren, pick, randInt } from '~/drill';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import DeterminantAreaLab from './DeterminantAreaLab';
import MatrixMultiplyLab from './MatrixMultiplyLab';
import MatrixTransformLab from './MatrixTransformLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Матрица в LaTeX: [[1, 2], [3, 4]] → \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}. */
const pm = (m: (number | string)[][], env = 'pmatrix') => `\\begin{${env}} ${m.map(r => r.join(' & ')).join(' \\\\ ')} \\end{${env}}`;
/** Произведение на два множителя, отрицателните – в скоби: (−2) \cdot 3. */
const prod = (a: number, b: number) => `${paren(a)} \\cdot ${paren(b)}`;
/** Сбор със знаци: [4, −2, 0] → 4 - 2 + 0. */
const signed = (vs: number[]) => vs.map((v, k) => (k === 0 ? String(v) : v < 0 ? ` - ${-v}` : ` + ${v}`)).join('');
const rand2 = (min: number, max: number) => [
  [randInt(min, max), randInt(min, max)],
  [randInt(min, max), randInt(min, max)],
];
const det2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
/** Случайна обратима матрица 2×2 с малка детерминанта. */
function invertible(min: number, max: number, maxDet: number) {
  for (;;) {
    const m = rand2(min, max);
    const d = det2(m);
    if (d !== 0 && Math.abs(d) <= maxDet) return m;
  }
}
const IDX = ['1', '2'];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const [A, B] = [rand2(-3, 4), rand2(-3, 4)];
    const [i, j] = [randInt(0, 1), randInt(0, 1)];
    const v = A[i][0] * B[0][j] + A[i][1] * B[1][j];
    return {
      tex: `A = ${pm(A)},\\ B = ${pm(B)}`,
      ask: `Елементът $c_{${IDX[i]}${IDX[j]}}$ на $AB$ е:`,
      num: v,
      den: 1,
      steps: [
        `$c_{${IDX[i]}${IDX[j]}}$ = ред ${i + 1} на $A$ по стълб ${j + 1} на $B$`,
        `$c_{${IDX[i]}${IDX[j]}} = ${prod(A[i][0], B[0][j])} + ${prod(A[i][1], B[1][j])} = ${v}$`,
      ],
    };
  }
  if (kind === 1) {
    const A = rand2(-5, 6);
    const d = det2(A);
    return {
      tex: pm(A, 'vmatrix'),
      ask: '$= ?$',
      num: d,
      den: 1,
      steps: ['$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$', `$${prod(A[0][0], A[1][1])} - ${prod(A[0][1], A[1][0])} = ${A[0][0] * A[1][1]} - ${paren(A[0][1] * A[1][0])} = ${d}$`],
    };
  }
  if (kind === 2) {
    const a = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randInt(-2, 3)));
    const plus = [a[0][0] * a[1][1] * a[2][2], a[0][1] * a[1][2] * a[2][0], a[0][2] * a[1][0] * a[2][1]];
    const minus = [a[0][2] * a[1][1] * a[2][0], a[0][0] * a[1][2] * a[2][1], a[0][1] * a[1][0] * a[2][2]];
    const [p, m] = [plus.reduce((s, x) => s + x, 0), minus.reduce((s, x) => s + x, 0)];
    return {
      tex: pm(a, 'vmatrix'),
      ask: '$= ?$ (правило на Сарус)',
      num: p - m,
      den: 1,
      steps: [
        `Главният диагонал и успоредните му „триъгълници“: $${signed(plus)} = ${p}$`,
        `Другият диагонал и неговите „триъгълници“: $${signed(minus)} = ${m}$`,
        `Детерминантата е $${p} - ${paren(m)} = ${p - m}$`,
      ],
    };
  }
  if (kind === 3) {
    const A = invertible(-4, 5, 6);
    const d = det2(A);
    const adj = [
      [A[1][1], -A[0][1]],
      [-A[1][0], A[0][0]],
    ];
    const [i, j] = [randInt(0, 1), randInt(0, 1)];
    return {
      tex: `A = ${pm(A)}`,
      ask: `Елементът в ред ${i + 1}, стълб ${j + 1} на $A^{-1}$ е:`,
      num: adj[i][j],
      den: d,
      steps: [
        `$\\det A = ${prod(A[0][0], A[1][1])} - ${prod(A[0][1], A[1][0])} = ${d}$`,
        `$A^{-1} = \\frac{1}{${d}} ${pm(adj)}$ – разменяме $a$ и $d$, сменяме знака на $b$ и $c$`,
        `Търсеният елемент е $\\frac{${adj[i][j]}}{${d}} = ${fracTex(adj[i][j], d)}$`,
      ],
    };
  }
  if (kind === 4) {
    const A = invertible(-4, 5, 12);
    const [x, y] = [randInt(-4, 4), randInt(-4, 4)];
    const [p, q] = [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
    const d = det2(A);
    const [dx, dy] = [p * A[1][1] - q * A[0][1], A[0][0] * q - A[1][0] * p];
    const askX = randInt(0, 1) === 0;
    return {
      tex: `${pm(A)} ${pm([['x'], ['y']])} = ${pm([[p], [q]])}`,
      ask: askX ? 'Колко е $x$?' : 'Колко е $y$?',
      num: askX ? x : y,
      den: 1,
      steps: [
        `$D = \\det A = ${d}$`,
        askX ? `$D_x = ${prod(p, A[1][1])} - ${prod(A[0][1], q)} = ${dx}$` : `$D_y = ${prod(A[0][0], q)} - ${prod(A[1][0], p)} = ${dy}$`,
        askX ? `$x = \\frac{D_x}{D} = \\frac{${dx}}{${d}} = ${x}$` : `$y = \\frac{D_y}{D} = \\frac{${dy}}{${d}} = ${y}$`,
      ],
    };
  }
  const A = rand2(-3, 3);
  const [x, y] = [nonZero(-4, 4), nonZero(-4, 4)];
  const askX = pick([true, false]);
  const r = askX ? 0 : 1;
  const v = A[r][0] * x + A[r][1] * y;
  return {
    tex: `${pm(A)} ${pm([[x], [y]])}`,
    ask: askX ? "Първата координата $x'$ на образа е:" : "Втората координата $y'$ на образа е:",
    num: v,
    den: 1,
    steps: [`Ред ${r + 1} на матрицата по стълба $(${x};\\ ${y})$`, `$${prod(A[r][0], x)} + ${prod(A[r][1], y)} = ${v}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🎮 Завъртане в игра',
    problem:
      'В компютърна игра героят стои в точката $(4;\\ 2)$, а камерата завърта света на 90° обратно на часовниковата стрелка около началото с матрицата $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$. Къде ще се окаже героят?',
    solution: ['$\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix} = \\begin{pmatrix} 0 \\cdot 4 - 1 \\cdot 2 \\\\ 1 \\cdot 4 + 0 \\cdot 2 \\end{pmatrix} = \\begin{pmatrix} -2 \\\\ 4 \\end{pmatrix}$', 'Новото положение е $(-2;\\ 4)$; разстоянието до началото остава $\\sqrt{20}$.'],
    answer: '$(-2;\\ 4)$',
    check: [-2, 4],
    ask: ['x', 'y'],
  },
  {
    title: '🛒 Сметки за два класа',
    problem:
      'Клас А купува 5 тетрадки и 10 химикалки, клас Б – 8 тетрадки и 4 химикалки. Тетрадката струва 2,50 €, химикалката – 1,20 €. Запишете покупките като матрица, умножете по стълба с цените и намерете сметката на всеки клас.',
    solution: ['$\\begin{pmatrix} 5 & 10 \\\\ 8 & 4 \\end{pmatrix}\\begin{pmatrix} 2{,}5 \\\\ 1{,}2 \\end{pmatrix} = \\begin{pmatrix} 12{,}5 + 12 \\\\ 20 + 4{,}8 \\end{pmatrix} = \\begin{pmatrix} 24{,}5 \\\\ 24{,}8 \\end{pmatrix}$', 'Клас А плаща 24,50 €, клас Б – 24,80 €.'],
    answer: '24,50 € и 24,80 €',
    check: [24.5, 24.8],
    ask: ['клас А, €', 'клас Б, €'],
  },
  {
    title: '🌦️ Времето утре и вдругиден',
    problem:
      'Прост модел: след слънчев ден следва слънчев с вероятност 0,8 и дъждовен с 0,2; след дъждовен – слънчев с 0,4 и дъждовен с 0,6. Днес е слънчево. С каква вероятност ще е слънчево вдругиден? Към какво число клони тази вероятност след много дни?',
    solution: [
      'Матрицата на преходите е $P = \\begin{pmatrix} 0{,}8 & 0{,}2 \\\\ 0{,}4 & 0{,}6 \\end{pmatrix}$ (ред – днес, стълб – утре).',
      'След два дни: $P^2$, ред „слънце“, стълб „слънце“: $0{,}8 \\cdot 0{,}8 + 0{,}2 \\cdot 0{,}4 = 0{,}72$.',
      'След много дни вероятностите спират да се менят: $s = 0{,}8s + 0{,}4(1 - s) \\Rightarrow 0{,}6s = 0{,}4 \\Rightarrow s = \\frac{2}{3} \\approx 0{,}667$.',
    ],
    answer: '0,72; около 0,667',
    check: [0.72, 0.667],
    ask: ['вдругиден', 'след много дни'],
  },
  {
    title: '🐇 Фибоначи с матрица',
    problem:
      'Числата на Фибоначи (1, 1, 2, 3, 5, …) се получават от степените на $M = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix}$: $M^n = \\begin{pmatrix} F_{n+1} & F_n \\\\ F_n & F_{n-1} \\end{pmatrix}$. Намерете $F_{10}$ и пресметнете $\\det M^{10} = F_{11}F_9 - F_{10}^2$.',
    solution: [
      '$M^2 = \\begin{pmatrix} 2 & 1 \\\\ 1 & 1 \\end{pmatrix}$, $M^4 = (M^2)^2 = \\begin{pmatrix} 5 & 3 \\\\ 3 & 2 \\end{pmatrix}$, $M^8 = \\begin{pmatrix} 34 & 21 \\\\ 21 & 13 \\end{pmatrix}$, $M^{10} = M^8M^2 = \\begin{pmatrix} 89 & 55 \\\\ 55 & 34 \\end{pmatrix}$',
      '$F_{10} = 55$',
      '$\\det M^{10} = (\\det M)^{10} = (-1)^{10} = 1$; проверка: $89 \\cdot 34 - 55^2 = 3026 - 3025 = 1$',
    ],
    answer: '$F_{10} = 55$, детерминантата е 1',
    check: [55, 1],
    ask: ['F₁₀', 'детерминанта'],
  },
  {
    title: '🔐 Шифър на Хил',
    problem:
      'Двойка букви се кодира като двойка числа и се умножава по $K = \\begin{pmatrix} 3 & 2 \\\\ 1 & 1 \\end{pmatrix}$. Получено е съобщението $(19;\\ 8)$. Разшифровайте го с обратната матрица.',
    solution: [
      '$\\det K = 3 - 2 = 1$, затова $K^{-1} = \\begin{pmatrix} 1 & -2 \\\\ -1 & 3 \\end{pmatrix}$ – с цели числа.',
      '$K^{-1}\\begin{pmatrix} 19 \\\\ 8 \\end{pmatrix} = \\begin{pmatrix} 19 - 16 \\\\ -19 + 24 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 5 \\end{pmatrix}$',
      'Проверка: $K\\begin{pmatrix} 3 \\\\ 5 \\end{pmatrix} = \\begin{pmatrix} 9 + 10 \\\\ 3 + 5 \\end{pmatrix} = \\begin{pmatrix} 19 \\\\ 8 \\end{pmatrix}$ ✓',
    ],
    answer: '$(3;\\ 5)$',
    check: [3, 5],
    ask: ['първо число', 'второ число'],
  },
  {
    title: '🦌 Популация по възрасти',
    problem:
      'В модел на популация млади ($M$) и възрастни ($V$) животни се менят всяка година така: новите млади са $2V$, а възрастните са $0{,}5M + 0{,}8V$. В началото има 100 млади и 50 възрастни. Колко ще са след две години?',
    solution: [
      'Матрицата е $L = \\begin{pmatrix} 0 & 2 \\\\ 0{,}5 & 0{,}8 \\end{pmatrix}$ (такива модели се наричат модели на Лесли).',
      'След една година: $L\\begin{pmatrix} 100 \\\\ 50 \\end{pmatrix} = \\begin{pmatrix} 100 \\\\ 50 + 40 \\end{pmatrix} = \\begin{pmatrix} 100 \\\\ 90 \\end{pmatrix}$',
      'След две: $L\\begin{pmatrix} 100 \\\\ 90 \\end{pmatrix} = \\begin{pmatrix} 180 \\\\ 50 + 72 \\end{pmatrix} = \\begin{pmatrix} 180 \\\\ 122 \\end{pmatrix}$',
    ],
    answer: '180 млади и 122 възрастни',
    check: [180, 122],
    ask: ['млади', 'възрастни'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Матрицата $A$ е с размер $2 \\times 3$, а $B$ – $3 \\times 4$. Какъв е размерът на $AB$?',
    answers: ['$2 \\times 4$', '$3 \\times 3$', '$2 \\times 3$', '$4 \\times 2$'],
    correctAnswer: '$2 \\times 4$',
  },
  {
    question: 'На колко е равно $\\begin{vmatrix} 2 & 1 \\\\ 4 & 3 \\end{vmatrix}$?',
    answers: ['$2$', '$10$', '$-2$', '$6$'],
    correctAnswer: '$2$',
  },
  {
    question: 'Кое равенство е вярно за всички матрици $A$ и $B$ с размер $2 \\times 2$?',
    answers: ['$\\det(AB) = \\det A \\cdot \\det B$', '$AB = BA$', '$\\det(A + B) = \\det A + \\det B$', '$\\det(2A) = 2\\det A$'],
    correctAnswer: '$\\det(AB) = \\det A \\cdot \\det B$',
  },
  {
    question: 'Каква трансформация на равнината е $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$?',
    answers: ['завъртане на 90°', 'отражение в оста Ox', 'хлъзгане', 'разтягане 2 пъти'],
    correctAnswer: 'завъртане на 90°',
  },
  {
    question: 'Кога една матрица $2 \\times 2$ няма обратна?',
    answers: ['когато $\\det A = 0$', 'когато $\\det A = 1$', 'когато $a_{11} = 0$', 'когато $\\det A < 0$'],
    correctAnswer: 'когато $\\det A = 0$',
  },
  {
    question: 'Коя е обратната матрица на $\\begin{pmatrix} 2 & 0 \\\\ 0 & 4 \\end{pmatrix}$?',
    answers: [
      '$\\begin{pmatrix} \\frac{1}{2} & 0 \\\\ 0 & \\frac{1}{4} \\end{pmatrix}$',
      '$\\begin{pmatrix} -2 & 0 \\\\ 0 & -4 \\end{pmatrix}$',
      '$\\begin{pmatrix} 4 & 0 \\\\ 0 & 2 \\end{pmatrix}$',
      '$\\begin{pmatrix} 0 & \\frac{1}{2} \\\\ \\frac{1}{4} & 0 \\end{pmatrix}$',
    ],
    correctAnswer: '$\\begin{pmatrix} \\frac{1}{2} & 0 \\\\ 0 & \\frac{1}{4} \\end{pmatrix}$',
  },
  {
    question: 'На колко е равна детерминантата на отражението в оста Ox?',
    answers: ['$-1$', '$1$', '$0$', '$2$'],
    correctAnswer: '$-1$',
  },
  {
    question: 'Колко е лицето на успоредника, построен върху векторите $(3;\\ 1)$ и $(1;\\ 2)$?',
    answers: ['$5$', '$7$', '$6$', '$1$'],
    correctAnswer: '$5$',
  },
  {
    question: 'На какво е равно $(AB)^{-1}$?',
    answers: ['$B^{-1}A^{-1}$', '$A^{-1}B^{-1}$', '$AB$', '$BA$'],
    correctAnswer: '$B^{-1}A^{-1}$',
  },
];

// ---------- Страница ----------

export function Matrices() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Матрици</h1>

        <div className="bg-gradient-to-br from-cyan-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🎮 Когато в компютърна игра завъртиш камерата, видеокартата пресмята наново къде на екрана отива всяка точка от сцената – стотици
            хиляди точки, десетки пъти в секунда. Всяко такова пресмятане е умножение на матрица по вектор. Самата идея е стара: в китайския
            трактат „Девет глави за математическото изкуство“, съставен преди около 2000 години, <Term id="system-of-equations">системи уравнения</Term> се решават, като
            коефициентите се подреждат в таблица и се преобразуват по ред – почти както днес. Думата „матрица“ въвежда Джеймс Силвестър
            през 1850 г., а Артър Кейли през 1858 г. описва как се смята с матриците като с числа.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Матрица – таблица от числа</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> В урока{' '}
              <Link to="/algebra/systems" className={link}>
                Системи уравнения
              </Link>{' '}
              решението зависеше само от коефициентите пред <Tex>{'x'}</Tex> и <Tex>{'y'}</Tex>. Ако ги запишем в таблица, може ли да
              смятаме със самата таблица – да я събираме, умножаваме и дори „делим“?
            </p>
          </div>
          <Theorem
            type="definition"
            title="Матрица"
            description="Матрица с размер $m \times n$ е правоъгълна таблица от числа с $m$ реда и $n$ стълба. Елементът в ред $i$ и стълб $j$ се бележи $a_{ij}$. Матрица с еднакъв брой редове и стълбове се нарича квадратна. Две матрици са равни, ако са с еднакъв размер и съответните им елементи са равни."
          />
          <Theorem
            title="Събиране и умножение с число"
            description="Матрици с еднакъв размер се събират елемент по елемент: $(A + B)_{ij} = a_{ij} + b_{ij}$. При умножение с число $k$ всеки елемент се умножава по $k$: $(kA)_{ij} = k\,a_{ij}$. Тези действия имат обичайните свойства – например $A + B = B + A$ и $k(A + B) = kA + kB$."
          />
          <Example
            description="Да пресметнем $A + B$ и $3A$ за $A = \begin{pmatrix} 2 & -1 \\ 0 & 3 \end{pmatrix}$, $B = \begin{pmatrix} 1 & 4 \\ -2 & 5 \end{pmatrix}$."
            steps={[
              '$A + B = \\begin{pmatrix} 2 + 1 & -1 + 4 \\\\ 0 + (-2) & 3 + 5 \\end{pmatrix} = \\begin{pmatrix} 3 & 3 \\\\ -2 & 8 \\end{pmatrix}$',
              '$3A = \\begin{pmatrix} 6 & -3 \\\\ 0 & 9 \\end{pmatrix}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Матрицата като трансформация на равнината</h2>
          <p className={text}>
            Матрица <Tex>{'2 \\times 2'}</Tex> може да „подейства“ на точка (вектор) <Tex>{'(x;\\ y)'}</Tex>:{' '}
            <Tex>{'\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}'}</Tex>. Всяка
            координата на образа е „ред по стълб“: първият ред по <Tex>{'(x;\\ y)'}</Tex> дава новото <Tex>{'x'}</Tex>, вторият – новото{' '}
            <Tex>{'y'}</Tex>.
          </p>
          <Theorem
            title="Стълбовете са образите на базисните вектори"
            description="Векторът $e_1 = (1;\ 0)$ отива в първия стълб $(a;\ c)$, а $e_2 = (0;\ 1)$ – във втория $(b;\ d)$. Тъй като $(x;\ y) = x e_1 + y e_2$, образът е $x \cdot (a;\ c) + y \cdot (b;\ d)$. Правите отиват в прави, успоредните – в успоредни, а началото остава на място."
          />
          <p className={text}>
            Затова е лесно да напишем матрицата на позната трансформация – достатъчно е да видим къде отиват <Tex>{'e_1'}</Tex> и{' '}
            <Tex>{'e_2'}</Tex> (виж{' '}
            <Link to="/geometry/vectors" className={link}>
              Вектори
            </Link>{' '}
            и{' '}
            <Link to="/geometry/trigonometry" className={link}>
              Тригонометрия
            </Link>
            ):
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Завъртане на ъгъл $\\varphi$', '$\\begin{pmatrix} \\cos\\varphi & -\\sin\\varphi \\\\ \\sin\\varphi & \\cos\\varphi \\end{pmatrix}$'],
              ['Отражение в оста $Ox$', '$\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$'],
              ['Разтягане $k$ пъти по $x$ и $l$ пъти по $y$', '$\\begin{pmatrix} k & 0 \\\\ 0 & l \\end{pmatrix}$'],
              ['Хлъзгане (наклоняване)', '$\\begin{pmatrix} 1 & k \\\\ 0 & 1 \\end{pmatrix}$'],
            ].map(([name, m]) => (
              <div key={name} className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm flex items-center justify-between gap-3">
                <span>
                  <MathText>{name}</MathText>
                </span>
                <MathText>{m}</MathText>
              </div>
            ))}
          </div>
          <MatrixTransformLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Умножение на матрици</h2>
          <p className={text}>
            Ако първо приложим трансформацията <Tex>{'B'}</Tex>, а след това <Tex>{'A'}</Tex>, пак получаваме трансформация, която праща
            прави в прави. Нейната матрица наричаме <strong>произведение</strong> <Tex>{'AB'}</Tex> – и тя се смята „ред по стълб“.
          </p>
          <Theorem
            type="definition"
            title="Произведение на матрици"
            description="Ако $A$ е с размер $m \times n$, а $B$ – $n \times p$, произведението $C = AB$ е с размер $m \times p$ и $c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \ldots + a_{in}b_{nj}$ – ред $i$ на $A$ по стълб $j$ на $B$. Броят на стълбовете на $A$ трябва да е равен на броя на редовете на $B$."
          />
          <MatrixMultiplyLab />
          <Theorem
            title="Свойства на умножението"
            description="Умножението е асоциативно: $(AB)C = A(BC)$, и разпределително: $A(B + C) = AB + AC$. Единичната матрица $E = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$ играе ролята на числото 1: $AE = EA = A$. Но в общия случай $AB \ne BA$ – редът на трансформациите има значение."
          />
          <Example
            description="Да пресметнем $AB$ и $BA$ за $A = \begin{pmatrix} 2 & 1 \\ 0 & 3 \end{pmatrix}$, $B = \begin{pmatrix} 1 & -1 \\ 2 & 4 \end{pmatrix}$."
            steps={[
              '$AB = \\begin{pmatrix} 2 \\cdot 1 + 1 \\cdot 2 & 2 \\cdot (-1) + 1 \\cdot 4 \\\\ 0 \\cdot 1 + 3 \\cdot 2 & 0 \\cdot (-1) + 3 \\cdot 4 \\end{pmatrix} = \\begin{pmatrix} 4 & 2 \\\\ 6 & 12 \\end{pmatrix}$',
              '$BA = \\begin{pmatrix} 1 \\cdot 2 + (-1) \\cdot 0 & 1 \\cdot 1 + (-1) \\cdot 3 \\\\ 2 \\cdot 2 + 4 \\cdot 0 & 2 \\cdot 1 + 4 \\cdot 3 \\end{pmatrix} = \\begin{pmatrix} 2 & -2 \\\\ 4 & 14 \\end{pmatrix}$',
              '$AB \\ne BA$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Детерминанта: колко пъти се променя лицето</h2>
          <p className={text}>
            Числото <Tex>{'D = ad - bc'}</Tex> от правилото на <Term id="cramer-rule">Крамер</Term> (виж{' '}
            <Link to="/algebra/systems" className={link}>
              Системи уравнения
            </Link>
            ) е <strong>детерминантата</strong> на матрицата <Tex>{'\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'}</Tex> и се записва с
            прави черти: <Tex>{'\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}'}</Tex>. Тя има ясен геометричен смисъл.
          </p>
          <Theorem
            title="Геометричен смисъл на детерминантата"
            description="Образът на единичния квадрат е успоредникът със страни $(a;\ c)$ и $(b;\ d)$, а лицето му е $|ad - bc|$. Затова трансформацията умножава лицето на всяка фигура по $|\det A|$. Ако $\det A < 0$, ориентацията се обръща (като в огледало), а при $\det A = 0$ равнината се смачква в права или точка."
          />
          <DeterminantAreaLab />
          <Theorem
            title="Свойства"
            description="$\det(AB) = \det A \cdot \det B$ – лицата се умножават последователно. $\det E = 1$. Ако разменим два реда (или два стълба), детерминантата сменя знака си. Ако един ред е кратен на друг, детерминантата е 0. За матрица $2 \times 2$: $\det(kA) = k^2 \det A$."
          />
          <Theorem
            type="definition"
            title="Детерминанта 3 × 3 (правило на Сарус)"
            description="$\begin{vmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{vmatrix} = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}$. Модулът ѝ е обемът на паралелепипеда, построен върху стълбовете."
          />
          <Example
            description="Да пресметнем $\begin{vmatrix} 2 & 1 & 3 \\ 0 & -1 & 4 \\ 1 & 2 & 0 \end{vmatrix}$."
            steps={[
              'С плюс – главният диагонал и двата „триъгълника“ успоредно на него: $2 \\cdot (-1) \\cdot 0 + 1 \\cdot 4 \\cdot 1 + 3 \\cdot 0 \\cdot 2 = 4$',
              'С минус – другият диагонал и неговите „триъгълници“: $3 \\cdot (-1) \\cdot 1 + 2 \\cdot 4 \\cdot 2 + 1 \\cdot 0 \\cdot 0 = 13$',
              'Детерминантата е $4 - 13 = -9$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Обратна матрица</h2>
          <p className={text}>
            Обратната трансформация връща всяка точка обратно. Ако <Tex>{'A'}</Tex> смачква равнината в права (<Tex>{'\\det A = 0'}</Tex>),
            различни точки отиват в една и съща – и няма как да разберем откъде са дошли. Иначе обратна трансформация има.
          </p>
          <Theorem
            title="Обратна матрица 2 × 2"
            description="Матрицата $A^{-1}$ е обратна на $A$, ако $AA^{-1} = A^{-1}A = E$. Обратна има точно когато $\det A \ne 0$, и тогава $\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$ – разменяме $a$ и $d$, сменяме знаците на $b$ и $c$ и делим на детерминантата. Освен това $(AB)^{-1} = B^{-1}A^{-1}$."
          />
          <Example
            description="Да намерим обратната на $A = \begin{pmatrix} 4 & 7 \\ 2 & 6 \end{pmatrix}$."
            steps={[
              '$\\det A = 4 \\cdot 6 - 7 \\cdot 2 = 10 \\ne 0$ – обратна има',
              '$A^{-1} = \\frac{1}{10}\\begin{pmatrix} 6 & -7 \\\\ -2 & 4 \\end{pmatrix} = \\begin{pmatrix} 0{,}6 & -0{,}7 \\\\ -0{,}2 & 0{,}4 \\end{pmatrix}$',
              'Проверка на първия елемент на $AA^{-1}$: $4 \\cdot 0{,}6 + 7 \\cdot (-0{,}2) = 2{,}4 - 1{,}4 = 1$ ✓',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Системи уравнения в матричен вид</h2>
          <p className={text}>
            Системата <Tex>{'a_1x + b_1y = c_1,\\ a_2x + b_2y = c_2'}</Tex> е просто едно матрично уравнение <Tex>{'AX = B'}</Tex>, където{' '}
            <Tex>{'A'}</Tex> е матрицата на коефициентите, <Tex>{'X = \\begin{pmatrix} x \\\\ y \\end{pmatrix}'}</Tex>, а <Tex>{'B'}</Tex> е
            стълбът на десните страни. Ако <Tex>{'\\det A \\ne 0'}</Tex>, умножаваме отляво по <Tex>{'A^{-1}'}</Tex>:{' '}
            <Tex>{'X = A^{-1}B'}</Tex>. Като разпишем, получаваме точно правилото на Крамер.
          </p>
          <Example
            description="Да решим $3x + 2y = 7,\ x + 4y = 9$ с обратна матрица."
            steps={[
              '$A = \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$, $\\det A = 12 - 2 = 10$, $A^{-1} = \\frac{1}{10}\\begin{pmatrix} 4 & -2 \\\\ -1 & 3 \\end{pmatrix}$',
              '$X = A^{-1}\\begin{pmatrix} 7 \\\\ 9 \\end{pmatrix} = \\frac{1}{10}\\begin{pmatrix} 28 - 18 \\\\ -7 + 27 \\end{pmatrix} = \\frac{1}{10}\\begin{pmatrix} 10 \\\\ 20 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$',
              'Отговор: $x = 1$, $y = 2$. Проверка: $3 + 4 = 7$ ✓; $1 + 8 = 9$ ✓',
            ]}
          />
          <p className={text}>
            За големи системи (с хиляди неизвестни) компютрите не смятат детерминанти, а изключват неизвестните едно по едно по
            редовете на таблицата – <strong>метод на Гаус</strong>. Това е същата идея като в „Девет глави“, само че с много повече числа.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Произведения, детерминанти, обратни матрици и системи. Дробните отговори въвеждай като 3/2, отрицателните – с минус.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Помни: всеки елемент на произведението е „ред по стълб“, а ad − bc се смята със знаците." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Матриците около нас</h2>
          <p className={text}>
            Компютърната графика описва завъртания, мащабиране и перспектива с матрици. Таблиците с вероятности за преход от едно
            състояние в друго (<strong>вериги на Марков</strong>) се използват в прогнози за времето, в прости модели на езика и при
            подреждането на уеб страници в търсачките. Степените на матрицата <Tex>{'\\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix}'}</Tex> дават числата на Фибоначи
            (виж{' '}
            <Link to="/algebra/sequences" className={link}>
              Прогресии
            </Link>
            ), а обратимите матрици – прости шифри.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Умножение елемент по елемент', '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} e & f \\\\ g & h \\end{pmatrix} = \\begin{pmatrix} ae & bf \\\\ cg & dh \\end{pmatrix}$', 'ред по стълб: $c_{11} = ae + bg$'],
              ['Разместване на множителите', '$AB = BA$', 'в общия случай $AB \\ne BA$'],
              ['Детерминанта на сбор', '$\\det(A + B) = \\det A + \\det B$', '$\\det(AB) = \\det A \\cdot \\det B$'],
              ['Детерминанта на $2A$', '$\\det(2A) = 2\\det A$', 'за $2 \\times 2$: $\\det(2A) = 4\\det A$'],
              ['Обратна матрица', '$A^{-1} = \\begin{pmatrix} \\frac{1}{a} & \\frac{1}{b} \\\\ \\frac{1}{c} & \\frac{1}{d} \\end{pmatrix}$', '$A^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$'],
              ['Обратна на произведение', '$(AB)^{-1} = A^{-1}B^{-1}$', '$(AB)^{-1} = B^{-1}A^{-1}$'],
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
              <Task
                id="a1"
                number={1}
                color="border-green-500"
                question="За $A = \begin{pmatrix} 2 & 1 \\ 0 & 3 \end{pmatrix}$ и $B = \begin{pmatrix} 1 & -1 \\ 2 & 4 \end{pmatrix}$ пресметнете $A - B$, $2A$ и $AB$."
                check={[4, 2, 6, 12]}
                ask={['$c_{11}$', '$c_{12}$', '$c_{21}$', '$c_{22}$']}
              >
                <p><Tex>{'A - B = \\begin{pmatrix} 1 & 2 \\\\ -2 & -1 \\end{pmatrix}'}</Tex>; <Tex>{'2A = \\begin{pmatrix} 4 & 2 \\\\ 0 & 6 \\end{pmatrix}'}</Tex></p>
                <p><Tex>{'AB = \\begin{pmatrix} 2 + 2 & -2 + 4 \\\\ 0 + 6 & 0 + 12 \\end{pmatrix} = \\begin{pmatrix} 4 & 2 \\\\ 6 & 12 \\end{pmatrix}'}</Tex></p>
              </Task>
              <Task
                id="a2"
                number={2}
                color="border-green-500"
                question="Пресметнете $\begin{vmatrix} 3 & -2 \\ 5 & 4 \end{vmatrix}$ и $\begin{vmatrix} 1 & 2 & 0 \\ 3 & -1 & 2 \\ 1 & 0 & 1 \end{vmatrix}$."
                check={[22, -3]}
                ask={['$2 \\times 2$', '$3 \\times 3$']}
              >
                <p><Tex>{'3 \\cdot 4 - (-2) \\cdot 5 = 12 + 10 = 22'}</Tex></p>
                <p>С плюс: <Tex>{'1 \\cdot (-1) \\cdot 1 + 2 \\cdot 2 \\cdot 1 + 0 \\cdot 3 \\cdot 0 = 3'}</Tex>; с минус: <Tex>{'0 \\cdot (-1) \\cdot 1 + 1 \\cdot 2 \\cdot 0 + 2 \\cdot 3 \\cdot 1 = 6'}</Tex></p>
                <p>Детерминантата е <Tex>{'3 - 6 = -3'}</Tex>.</p>
              </Task>
              <Task
                id="a3"
                number={3}
                color="border-green-500"
                question="Намерете обратната матрица на $\begin{pmatrix} 2 & 1 \\ 5 & 3 \end{pmatrix}$ и проверете резултата."
                check={[3, -1, -5, 2]}
                ask={['ред 1, стълб 1', 'ред 1, стълб 2', 'ред 2, стълб 1', 'ред 2, стълб 2']}
              >
                <p><Tex>{'\\det = 6 - 5 = 1'}</Tex>, затова <Tex>{'A^{-1} = \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}'}</Tex></p>
                <p>Проверка: <Tex>{'\\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}\\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix} = \\begin{pmatrix} 6 - 5 & -2 + 2 \\\\ 15 - 15 & -5 + 6 \\end{pmatrix} = E'}</Tex> ✓</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Решете системата $2x + 3y = 8,\ x - y = -1$, като я запишете във вида $AX = B$ и намерите $A^{-1}$." check={[1, 2]} ask={['$x$', '$y$']}>
                <p><Tex>{'A = \\begin{pmatrix} 2 & 3 \\\\ 1 & -1 \\end{pmatrix}'}</Tex>, <Tex>{'\\det A = -2 - 3 = -5'}</Tex>, <Tex>{'A^{-1} = -\\frac{1}{5}\\begin{pmatrix} -1 & -3 \\\\ -1 & 2 \\end{pmatrix}'}</Tex></p>
                <p><Tex>{'X = -\\frac{1}{5}\\begin{pmatrix} -8 + 3 \\\\ -8 - 2 \\end{pmatrix} = -\\frac{1}{5}\\begin{pmatrix} -5 \\\\ -10 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}'}</Tex></p>
                <p>Отговор: <Tex>{'x = 1,\\ y = 2'}</Tex>.</p>
              </Task>
              <Task
                id="b2"
                number={5}
                color="border-yellow-500"
                question="$R = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$ е завъртане на 90°. Пресметнете $R^2$ и намерете $R^{2026}$."
                check={[-1]}
                ask={['елементът в ред 1, стълб 1 на $R^{2026}$']}
              >
                <p><Tex>{'R^2 = \\begin{pmatrix} -1 & 0 \\\\ 0 & -1 \\end{pmatrix} = -E'}</Tex> – завъртане на 180°; <Tex>{'R^4 = E'}</Tex> – пълен оборот.</p>
                <p><Tex>{'2026 = 4 \\cdot 506 + 2'}</Tex>, затова <Tex>{'R^{2026} = R^2 = \\begin{pmatrix} -1 & 0 \\\\ 0 & -1 \\end{pmatrix}'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намерете лицето на триъгълника с върхове $A(1;\ 1)$, $B(4;\ 2)$ и $C(2;\ 5)$ с помощта на детерминанта." check={[5.5]} ask={['лице']}>
                <p><Tex>{'\\overrightarrow{AB} = (3;\\ 1)'}</Tex>, <Tex>{'\\overrightarrow{AC} = (1;\\ 4)'}</Tex>. Лицето на успоредника върху тях е модулът на детерминантата.</p>
                <p><Tex>{'\\begin{vmatrix} 3 & 1 \\\\ 1 & 4 \\end{vmatrix} = 12 - 1 = 11'}</Tex></p>
                <p>Триъгълникът е половината от успоредника: <Tex>{'S = \\frac{11}{2} = 5{,}5'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task
                id="c1"
                number={7}
                color="border-red-500"
                question="При кои стойности на $a$ матрицата $\begin{pmatrix} a & 2 \\ 3 & a + 1 \end{pmatrix}$ няма обратна?"
                check={[2, -3]}
                ask={['$a_1$', '$a_2$']}
                anyOrder
              >
                <p>Обратна няма точно когато детерминантата е 0: <Tex>{'a(a + 1) - 6 = 0'}</Tex>.</p>
                <p><Tex>{'a^2 + a - 6 = (a - 2)(a + 3) = 0 \\Rightarrow a = 2'}</Tex> или <Tex>{'a = -3'}</Tex>.</p>
              </Task>
              <Task
                id="c2"
                number={8}
                color="border-red-500"
                question="Числата на Фибоначи са $F_1 = F_2 = 1$, $F_{n+1} = F_n + F_{n-1}$. Пресметнете $F_{2026}F_{2024} - F_{2025}^2$."
                check={[-1]}
                ask={['стойност']}
              >
                <p>По индукция <Tex>{'M^n = \\begin{pmatrix} F_{n+1} & F_n \\\\ F_n & F_{n-1} \\end{pmatrix}'}</Tex> за <Tex>{'M = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix}'}</Tex>: <Tex>{'M^{n+1} = M^n M'}</Tex> дава точно рекурентната връзка.</p>
                <p>Детерминантата на произведение е произведение на детерминантите: <Tex>{'F_{n+1}F_{n-1} - F_n^2 = \\det M^n = (\\det M)^n = (-1)^n'}</Tex> (тъждество на Касини).</p>
                <p>При <Tex>{'n = 2025'}</Tex> получаваме <Tex>{'(-1)^{2025} = -1'}</Tex>.</p>
              </Task>
              <Task
                id="c3"
                number={9}
                color="border-red-500"
                question="Нека $A = \begin{pmatrix} 3 & 1 \\ -2 & 0 \end{pmatrix}$. Докажете, че $A^2 = 3A - 2E$, и намерете $A^5$."
                check={[63, 31, -62, -30]}
                ask={['ред 1, стълб 1', 'ред 1, стълб 2', 'ред 2, стълб 1', 'ред 2, стълб 2']}
              >
                <p><Tex>{'A^2 = \\begin{pmatrix} 9 - 2 & 3 \\\\ -6 & -2 \\end{pmatrix} = \\begin{pmatrix} 7 & 3 \\\\ -6 & -2 \\end{pmatrix}'}</Tex>, а <Tex>{'3A - 2E = \\begin{pmatrix} 7 & 3 \\\\ -6 & -2 \\end{pmatrix}'}</Tex> ✓ (за всяка матрица <Tex>{'2 \\times 2'}</Tex> е вярно <Tex>{'A^2 = (a + d)A - (\\det A)E'}</Tex> – теорема на Кейли–Хамилтън).</p>
                <p>По индукция <Tex>{'A^n = (2^n - 1)A - (2^n - 2)E'}</Tex>: ако е вярно за <Tex>{'n'}</Tex>, то <Tex>{'A^{n+1} = (2^n - 1)(3A - 2E) - (2^n - 2)A = (2^{n+1} - 1)A - (2^{n+1} - 2)E'}</Tex>.</p>
                <p><Tex>{'A^5 = 31A - 30E = \\begin{pmatrix} 93 - 30 & 31 \\\\ -62 & -30 \\end{pmatrix} = \\begin{pmatrix} 63 & 31 \\\\ -62 & -30 \\end{pmatrix}'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Матрицата е таблица <Tex>{'m \\times n'}</Tex>; събираме елемент по елемент, умножаваме с число – всеки елемент</li>
              <li>✓ Матрицата <Tex>{'2 \\times 2'}</Tex> е трансформация на равнината; стълбовете ѝ са образите на <Tex>{'e_1'}</Tex> и <Tex>{'e_2'}</Tex></li>
              <li>✓ <Tex>{'AB'}</Tex> – „ред по стълб“; това е последователното прилагане на <Tex>{'B'}</Tex> и <Tex>{'A'}</Tex>; в общия случай <Tex>{'AB \\ne BA'}</Tex></li>
              <li>✓ <Tex>{'\\det A = ad - bc'}</Tex> – коефициентът, с който се умножават лицата (знакът – ориентацията); <Tex>{'\\det(AB) = \\det A \\cdot \\det B'}</Tex></li>
              <li>✓ <Tex>{'A^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}'}</Tex>, съществува точно при <Tex>{'\\det A \\ne 0'}</Tex></li>
              <li>✓ Системата <Tex>{'AX = B'}</Tex> има решение <Tex>{'X = A^{-1}B'}</Tex> – правилото на Крамер в матричен вид</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Детерминантите се появяват преди матриците: японският математик Секи Такакадзу и Лайбниц стигат до тях независимо един от
              друг в края на XVII век, докато решават системи уравнения. Самите матрици като самостоятелни обекти, с които се смята,
              идват повече от 150 години по-късно – при Кейли. А днес умножението на огромни матрици е основната операция, която изпълняват
              видеокартите – и в графиката, и в изкуствения интелект.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
