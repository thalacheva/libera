import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { FocusLab } from './FocusLab';
import { DiscriminantCases, InteractiveQuadraticGrapher, PointByPoint } from './InteractiveQuadraticGrapher';
import { SignLab } from './SignLab';
import { ThrowLab } from './ThrowLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const coefficients = [
  ['$a$', 'посока и ширина', '$a > 0$ – „чаша“ (отворена нагоре); $a < 0$ – „шапка“ (отворена надолу). Колкото по-голямо е $|a|$, толкова по-тясна е параболата.'],
  ['$b$', 'мести върха', 'заедно с $a$ определя абсцисата на върха $x_0 = -\\frac{b}{2a}$. Ако $b = 0$, върхът е на оста Oy.'],
  ['$c$', 'пресечна точка с Oy', 'при $x = 0$ получаваме $y = c$, т.е. параболата минава през точката $(0; c)$.'],
];

const properties: [string, string, string][] = [
  ['Отворена', 'нагоре', 'надолу'],
  ['Във върха има', 'най-малка стойност $y_0$', 'най-голяма стойност $y_0$'],
  ['За $x \\le x_0$ функцията е', 'намаляваща', 'растяща'],
  ['За $x \\ge x_0$ функцията е', 'растяща', 'намаляваща'],
  ['Множество от стойности', '$y \\ge y_0$', '$y \\le y_0$'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🏀 Хвърлена топка',
    problem: 'Топка е хвърлена право нагоре. Височината ѝ след $t$ секунди е $h(t) = -5t^2 + 20t$ метра. Колко най-високо стига и кога пада на земята?',
    solution: ['Върхът е при $t_0 = -\\frac{20}{2 \\cdot (-5)} = 2\\ \\mathrm{s}$', '$h(2) = -5 \\cdot 4 + 20 \\cdot 2 = 20\\ \\mathrm{m}$', 'Пада, когато $h(t) = 0$: $-5t(t - 4) = 0 \\Rightarrow t = 4$'],
    answer: '20 m след 2 s; пада след 4 s',
    check: [20, 4],
    ask: ['максимална височина, m', 'пада след, s'],
  },
  {
    title: '🐑 Оградата',
    problem: 'С 40 m мрежа трябва да оградиш правоъгълна ливада до река (по реката не се огражда). Какви да са размерите, за да е лицето най-голямо?',
    solution: ['Двете страни, перпендикулярни на реката – $x$, третата – $40 - 2x$', '$S(x) = x(40 - 2x) = -2x^2 + 40x$', 'Връх: $x_0 = -\\frac{40}{2 \\cdot (-2)} = 10$', '$S(10) = 10 \\cdot 20 = 200$'],
    answer: '$10\\ \\mathrm{m} \\times 20\\ \\mathrm{m}$, лице $200\\ \\mathrm{m}^2$',
    check: [200],
    ask: ['най-голямо лице, m²'],
  },
  {
    title: '🎟️ Цената на билета',
    problem: 'Кино продава 200 билета по 10 €. Всяко поскъпване с 1 € намалява продадените билети с 10. При каква цена приходът е най-голям?',
    solution: ['При поскъпване с $x$ €: $P(x) = (10 + x)(200 - 10x)$', '$P(x) = -10x^2 + 100x + 2000$', '$x_0 = -\\frac{100}{2 \\cdot (-10)} = 5$', '$P(5) = 15 \\cdot 150 = 2250$ €'],
    answer: 'при цена 15 € – приход 2250 €',
    check: [15],
    ask: ['цена на билета, €'],
  },
  {
    title: '🌉 Мостът',
    problem: 'Арката на мост има формата на парабола с ширина 40 m и височина 10 m в средата. Колко е висока арката на 10 m от средата?',
    solution: ['Поставяме върха в $(0; 10)$: $y = ax^2 + 10$', 'Краищата са $(\\pm 20; 0)$: $400a + 10 = 0 \\Rightarrow a = -\\frac{1}{40}$', '$y(10) = -\\frac{100}{40} + 10 = 7{,}5$'],
    answer: '7,5 m',
    check: [7.5],
    ask: ['височина, m'],
  },
  {
    title: '🍎 Падаща ябълка',
    problem: 'Ябълка пада от клон на височина 20 m. Височината ѝ след $t$ секунди е $h(t) = 20 - 5t^2$. След колко секунди ще падне на земята?',
    solution: ['$h(t) = 0 \\Rightarrow 20 - 5t^2 = 0$', '$t^2 = 4$', '$t = 2$ (отрицателният корен няма смисъл)'],
    answer: 'след 2 s',
    check: [2],
    ask: ['време, s'],
  },
];

const questions: Question[] = [
  {
    question: 'Кой е върхът на параболата $y = (x - 3)^2 + 2$?',
    answers: ['$(-3;\\ 2)$', '$(3;\\ 2)$', '$(3;\\ -2)$', '$(2;\\ 3)$'],
    correctAnswer: '$(3;\\ 2)$',
  },
  {
    question: 'Накъде е отворена параболата $y = -2x^2 + x + 5$?',
    answers: ['Нагоре', 'Надолу', 'Надясно', 'Зависи от $c$'],
    correctAnswer: 'Надолу',
  },
  {
    question: 'Колко нули има функцията $y = x^2 - 4x + 4$?',
    answers: ['Нито една', 'Една (двойна)', 'Две', 'Безброй'],
    correctAnswer: 'Една (двойна)',
  },
  {
    question: 'Коя е абсцисата на върха на $y = 2x^2 - 8x + 1$?',
    answers: ['$x_0 = -2$', '$x_0 = 2$', '$x_0 = 4$', '$x_0 = -4$'],
    correctAnswer: '$x_0 = 2$',
  },
  {
    question: 'В коя точка параболата $y = x^2 - 5x + 6$ пресича оста Oy?',
    answers: ['$(0;\\ 6)$', '$(6;\\ 0)$', '$(2;\\ 0)$', '$(0;\\ -5)$'],
    correctAnswer: '$(0;\\ 6)$',
  },
  {
    question: 'Коя е най-малката стойност на функцията $y = x^2 + 6x + 10$?',
    answers: ['$10$', '$1$', '$-3$', '$0$'],
    correctAnswer: '$1$',
  },
  {
    question: 'Кои са решенията на неравенството $x^2 - 4 < 0$?',
    answers: ['$x < 2$', '$x > 2$ или $x < -2$', '$-2 < x < 2$', '$x > -2$'],
    correctAnswer: '$-2 < x < 2$',
  },
  {
    question: 'Колко общи точки имат параболата $y = (x - 1)^2 + 3$ и оста Ox?',
    answers: ['Нито една', 'Една', 'Две', 'Зависи от $x$'],
    correctAnswer: 'Нито една',
  },
];

export function QuadraticFunctions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Квадратни функции</h1>

        <div className="bg-gradient-to-br from-orange-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🎯 Векове наред артилеристите вярвали, че гюлето лети по права, после рязко пада надолу. Галилео Галилей търкаля топчета по наклонен
            улей, мери с капки вода и през 1638 г. доказва: всяко хвърлено тяло описва <strong>парабола</strong>. Хоризонтално то се движи
            равномерно, а вертикално гравитацията го забавя равномерно – и височината зависи от квадрата на времето. Същата крива имат
            струята на чешмата, кабелите на висящия мост под товар и чинията за сателитна телевизия.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Квадратна функция и парабола</h2>
          <Theorem
            type="definition"
            title="Квадратна функция"
            description="Функцията $y = ax^2 + bx + c$, където $a$, $b$ и $c$ са дадени числа и $a \ne 0$, се нарича квадратна. Дефиниционната ѝ област са всички реални числа, а графиката ѝ е крива, наречена парабола. Най-ниската (или най-високата) точка на параболата е нейният връх, а вертикалната права през върха е ос на симетрия."
            graphic={<InteractiveQuadraticGrapher />}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            {coefficients.map(([name, role, desc]) => (
              <div key={name} className={card}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300"><MathText>{name}</MathText></span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100"><MathText>{role}</MathText></span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400"><MathText>{desc}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Връх и ос на симетрия</h2>
          <Theorem
            title="Връх на параболата"
            description="Върхът на параболата $y = ax^2 + bx + c$ е точката $V(x_0;\ y_0)$, където $x_0 = -\frac{b}{2a}$ и $y_0 = f(x_0) = -\frac{D}{4a}$. Оста на симетрия е правата $x = x_0$. Функцията може да се запише във връхна форма $y = a(x - x_0)^2 + y_0$."
          />
          <p className={`${text} mb-4`}>
            Всяка парабола <Tex>{'y = ax^2 + bx + c'}</Tex> се получава от <Tex>{'y = ax^2'}</Tex>, като я преместим така, че върхът ѝ да отиде в точката <Tex>{'(x_0; y_0)'}</Tex>. Това се
            вижда, като отделим точен квадрат – така получаваме <strong>връхната форма</strong>, от която върхът се чете директно.
          </p>
          <Example
            description="Намери върха на параболата $y = x^2 - 4x + 3$ и я запиши във връхна форма."
            steps={[
              '$x_0 = -\\frac{b}{2a} = \\frac{4}{2} = 2$',
              '$y_0 = f(2) = 4 - 8 + 3 = -1$',
              'Връх $V(2;\\ -1)$, ос на симетрия $x = 2$.',
              'Отделяме точен квадрат: $x^2 - 4x + 3 = (x^2 - 4x + 4) - 1 = (x - 2)^2 - 1$.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Нули и дискриминанта</h2>
          <p className={`${text} mb-4`}>
            Нулите на функцията са абсцисите на точките, в които параболата пресича оста Ox. Те са корените на уравнението <Tex>{'ax^2 + bx + c = 0'}</Tex>, а
            броят им зависи от знака на дискриминантата <span className="font-mono"><Tex>{'D = b^2 - 4ac'}</Tex></span>:
          </p>
          <DiscriminantCases />
          <p className={`${text} mt-4`}>
            Нулите са симетрични спрямо оста на параболата, затова <Tex>{'x_0'}</Tex> е точно по средата между тях:{' '}
            <span className="font-mono"><Tex>{'x_0 = \\frac{x_1 + x_2}{2}'}</Tex></span>. Ако знаем нулите, можем да запишем функцията и така:{' '}
            <span className="font-mono"><Tex>{'y = a(x - x_1)(x - x_2)'}</Tex></span>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Свойства и графика</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                  <th className="text-left p-2 sm:p-3 font-semibold" />
                  <th className="p-2 sm:p-3 font-semibold font-mono text-emerald-700 dark:text-emerald-400"><Tex>{'a > 0'}</Tex></th>
                  <th className="p-2 sm:p-3 font-semibold font-mono text-rose-600 dark:text-rose-400"><Tex>{'a < 0'}</Tex></th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {properties.map(([name, up, down]) => (
                  <tr key={name} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-2 sm:p-3"><MathText>{name}</MathText></td>
                    <td className="p-2 sm:p-3 text-center"><MathText>{up}</MathText></td>
                    <td className="p-2 sm:p-3 text-center"><MathText>{down}</MathText></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Как се чертае парабола</h3>
          <ol className={`${text} list-decimal ml-5 space-y-1 mb-4`}>
            <li>Намери върха <Tex>{'(x_0; y_0)'}</Tex> и начертай пунктирано оста <Tex>{'x = x_0'}</Tex>.</li>
            <li>Намери пресечната точка с Oy – (0; c) – и нулите, ако има такива.</li>
            <li>Пресметни още няколко точки около върха. Използвай симетрията: на равни разстояния вляво и вдясно от оста стойностите са равни.</li>
            <li>Свържи точките с плавна крива – без чупки и без „дъно“ във формата на V.</li>
          </ol>
          <PointByPoint f={x => x * x - 2 * x - 3} xs={[-2, -1, 0, 1, 2, 3, 4]} formula="x² − 2x − 3" />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Най-голяма и най-малка стойност</h2>
          <p className={`${text} mb-4`}>
            Най-полезното свойство на параболата в практиката е, че върхът ѝ дава най-голямата или най-малката стойност на функцията. Ако <Tex>{'x'}</Tex> е
            ограничено в интервал [m; n], сравняваме стойностите в краищата и във върха (ако той е в интервала).
          </p>
          <Example
            description="Топка е хвърлена от 2 m височина и височината ѝ е $h(x) = -0{,}2x^2 + 1{,}2x + 2$ ($x$ е хоризонталното разстояние в метри). Колко високо стига?"
            steps={['$x_0 = -\\frac{1{,}2}{2 \\cdot (-0{,}2)} = 3\\ \\mathrm{m}$', '$h(3) = -0{,}2 \\cdot 9 + 3{,}6 + 2 = 3{,}8\\ \\mathrm{m}$', 'Най-високата точка е на 3 m от хвърлящия, на 3,8 m височина']}
          />
          <ThrowLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Квадратни неравенства</h2>
          <Theorem
            title="Знак на квадратния тричлен"
            description="Ако $ax^2 + bx + c$ има две нули $x_1 < x_2$, то извън интервала $[x_1;\ x_2]$ тричленът има знака на $a$, а между нулите – обратния знак. Ако $D = 0$, знакът е като на $a$ навсякъде освен в нулата; ако $D < 0$ – като на $a$ за всяко $x$."
          />
          <Example
            description="Да решим неравенството $x^2 - x - 6 < 0$"
            steps={['Нули: $x^2 - x - 6 = 0 \\Rightarrow x_1 = -2,\\ x_2 = 3$', '$a = 1 > 0$ – параболата е „чаша“, отрицателна е между нулите', 'Отговор: $-2 < x < 3$, т.е. $x \\in (-2;\\ 3)$']}
          />
          <SignLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Фокусът на параболата</h2>
          <p className={`${text} mb-4`}>
            Параболата <Tex>{'y = \\frac{x^2}{4p}'}</Tex> има специална точка – фокус <Tex>{'F(0; p)'}</Tex>. Всеки лъч, който пада успоредно на оста ѝ, се отразява точно към
            фокуса. Затова сателитните чинии, слънчевите пещи и огледалата на телескопите са параболични.
          </p>
          <FocusLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Знакът във връхната форма', '$y = (x + 3)^2$ има връх в $(3;\\ 0)$', '$x + 3 = x - (-3)$, върхът е $(-3;\\ 0)$'],
              ['Минусът в $x_0$', '$y = x^2 - 6x \\Rightarrow x_0 = -6 / 2 = -3$', '$x_0 = -\\frac{b}{2a} = \\frac{-(-6)}{2} = 3$'],
              ['Повдигане на отрицателно число', 'при $x = -2$: $-x^2 = 4$', '$-x^2 = -(x^2) = -4$, а $(-x)^2 = 4$'],
              ['$D < 0$ означава „грешка“', 'щом $D < 0$, задачата няма решение', 'функцията съществува; просто параболата не пресича Ox'],
              ['Неравенство „като уравнение“', '$x^2 > 9 \\Rightarrow x > 3$', '$x > 3$ или $x < -3$'],
              ['Най-голямата стойност в интервал', 'максимумът винаги е във върха', 'при „чаша“ във върха е минимумът; максимумът е в единия край'],
            ].map(([title, wrong, right]) => (
              <div key={title} className={card}>
                <p className="font-semibold mb-1"><MathText displayStyle>{title}</MathText></p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ <MathText displayStyle>{wrong}</MathText></p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ <MathText displayStyle>{right}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Задачи от живота</h2>
          <p className={`${text} mb-4`}>Върхът дава „най-много“ и „най-малко“, а нулите – „кога“ и „къде“.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={questions} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Намери върха и нулите на функцията $y = x^2 - 6x + 5$.">
                <p><Tex>{'x_0 = \\frac{6}{2} = 3,\\ y_0 = 9 - 18 + 5 = -4 \\Rightarrow V(3;\\ -4)'}</Tex></p>
                <p>Нули: <Tex>{'x^2 - 6x + 5 = 0 \\Rightarrow x_1 = 1,\\ x_2 = 5'}</Tex> (симетрични спрямо <Tex>{'x = 3'}</Tex> ✓)</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Коя е най-голямата стойност на функцията $y = -x^2 + 4x$ и при кое $x$ се достига?">
                <p><Tex>{'a = -1 < 0'}</Tex> – параболата е „шапка“, максимумът е във върха.</p>
                <p><Tex>{'x_0 = -\\frac{4}{2 \\cdot (-1)} = 2,\\ y_0 = -4 + 8 = 4'}</Tex></p>
                <p>Най-голямата стойност е 4 при <Tex>{'x = 2'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Парабола има връх $V(1;\ -2)$ и минава през точката $(3;\ 6)$. Намери уравнението ѝ.">
                <p>Връхна форма: <Tex>{'y = a(x - 1)^2 - 2'}</Tex></p>
                <p><Tex>{'6 = a \\cdot (3 - 1)^2 - 2 \\Rightarrow 4a = 8 \\Rightarrow a = 2'}</Tex></p>
                <p><Tex>{'y = 2(x - 1)^2 - 2 = 2x^2 - 4x'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Реши неравенството $x^2 - x - 6 \ge 0$.">
                <p>Нули: <Tex>{'x_1 = -2,\\ x_2 = 3'}</Tex>; <Tex>{'a = 1 > 0'}</Tex> – тричленът е неотрицателен извън нулите (и в тях).</p>
                <p>Отговор: <Tex>{'x \\le -2'}</Tex> или <Tex>{'x \\ge 3'}</Tex>, т.е. <Tex>{'x \\in (-\\infty ;\\ -2] \\cup [3;\\ +\\infty)'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="За кои стойности на $m$ неравенството $x^2 - 4x + m > 0$ е изпълнено за всяко $x$?">
                <p><Tex>{'a = 1 > 0'}</Tex>. Тричленът е положителен за всяко <Tex>{'x'}</Tex> <Tex>{'\\iff'}</Tex> параболата е изцяло над Ox <Tex>{'\\iff D < 0'}</Tex>.</p>
                <p><Tex>{'D = 16 - 4m < 0 \\Rightarrow m > 4'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Две числа имат сбор 10. Кога сборът от квадратите им е най-малък?">
                <p>Числата са <Tex>{'x'}</Tex> и <Tex>{'10 - x'}</Tex>: <Tex>{'S(x) = x^2 + (10 - x)^2 = 2x^2 - 20x + 100'}</Tex></p>
                <p><Tex>{'x_0 = \\frac{20}{4} = 5 \\Rightarrow'}</Tex> двете числа са равни: 5 и 5</p>
                <p>Най-малкият сбор от квадратите е <Tex>{'S(5) = 50'}</Tex>.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Намери квадратната функция, чиято графика минава през точките (0; 1), (1; 0) и (2; 3).">
                <p><Tex>{'(0; 1)'}</Tex>: <Tex>{'c = 1'}</Tex></p>
                <p><Tex>{'(1; 0)'}</Tex>: <Tex>{'a + b + 1 = 0'}</Tex>; <Tex>{'(2; 3)'}</Tex>: <Tex>{'4a + 2b + 1 = 3 \\Rightarrow 2a + b = 1'}</Tex></p>
                <p>Изваждаме: <Tex>{'a = 2,\\ b = -3 \\Rightarrow y = 2x^2 - 3x + 1'}</Tex></p>
                <p>Три точки (не на една права) определят параболата еднозначно.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Намери най-малката и най-голямата стойност на $f(x) = x^2 - 2x + 3$ в интервала $[-1;\ 2]$.">
                <p>Върхът е при <Tex>{'x_0 = 1'}</Tex> – той е в интервала: <Tex>{'f(1) = 2'}</Tex>.</p>
                <p>Краищата: <Tex>{'f(-1) = 1 + 2 + 3 = 6,\\ f(2) = 4 - 4 + 3 = 3'}</Tex>.</p>
                <p>Най-малка стойност 2 (при <Tex>{'x = 1'}</Tex>), най-голяма 6 (при <Tex>{'x = -1'}</Tex>).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="За кои стойности на $a$ решенията на неравенството $x^2 - (a + 1)x + a < 0$ съдържат точно три цели числа?">
                <p><Tex>{'x^2 - (a + 1)x + a = (x - 1)(x - a)'}</Tex>. Решенията са строго между 1 и <Tex>{'a'}</Tex>.</p>
                <p>Ако <Tex>{'a > 1'}</Tex>: в <Tex>{'(1; a)'}</Tex> трябва да са точно <Tex>{'2,\\ 3,\\ 4 \\Rightarrow 4 < a \\le 5'}</Tex>.</p>
                <p>Ако <Tex>{'a < 1'}</Tex>: в <Tex>{'(a; 1)'}</Tex> трябва да са точно <Tex>{'0,\\ -1,\\ -2 \\Rightarrow -3 \\le a < -2'}</Tex>.</p>
                <p>Отговор: <Tex>{'a \\in [-3;\\ -2) \\cup (4;\\ 5]'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'y = ax^2 + bx + c,\\ a \\ne 0'}</Tex> – графиката е парабола; <Tex>{'a > 0'}</Tex> – „чаша“, <Tex>{'a < 0'}</Tex> – „шапка“</li>
              <li>✓ Връх: <Tex>{'x_0 = -\\frac{b}{2a},\\ y_0 = -\\frac{D}{4a}'}</Tex>; връхна форма <Tex>{'y = a(x - x_0)^2 + y_0'}</Tex></li>
              <li>✓ Нули: корените на <Tex>{'ax^2 + bx + c = 0'}</Tex>; броят им зависи от знака на <Tex>{'D'}</Tex></li>
              <li>✓ Най-голяма/най-малка стойност – във върха (в интервал – сравни и краищата)</li>
              <li>✓ Знак: извън нулите – знакът на <Tex>{'a'}</Tex>, между тях – обратният ⇒ квадратни неравенства</li>
              <li>✓ Хвърлените тела летят по парабола; фокусът събира успоредните лъчи</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Ако завъртите чаша с вода, повърхността на водата се извива точно като парабола. Астрономите използват това: в обсерваторията
              край Ванкувър дълги години работи Large Zenith Telescope с 6-метрово „огледало“ от течен живак, който се върти и сам приема
              формата на параболоид. Такова огледало е много по-евтино от стъклено – но може да гледа само право нагоре.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
