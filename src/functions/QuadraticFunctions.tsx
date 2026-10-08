import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { DiscriminantCases, InteractiveQuadraticGrapher, PointByPoint } from './InteractiveQuadraticGrapher';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const coefficients = [
  ['a', 'посока и ширина', 'a > 0 – „чаша“ (отворена нагоре); a < 0 – „шапка“ (отворена надолу). Колкото по-голямо е |a|, толкова по-тясна е параболата.'],
  ['b', 'мести върха', 'заедно с a определя абсцисата на върха x₀ = −b/(2a). Ако b = 0, върхът е на оста Oy.'],
  ['c', 'пресечна точка с Oy', 'при x = 0 получаваме y = c, т.е. параболата минава през точката (0; c).'],
];

const properties: [string, string, string][] = [
  ['Отворена', 'нагоре', 'надолу'],
  ['Във върха има', 'най-малка стойност y₀', 'най-голяма стойност y₀'],
  ['За x ≤ x₀ функцията е', 'намаляваща', 'растяща'],
  ['За x ≥ x₀ функцията е', 'растяща', 'намаляваща'],
  ['Множество от стойности', 'y ≥ y₀', 'y ≤ y₀'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🏀 Хвърлена топка',
    problem: 'Топка е хвърлена право нагоре. Височината ѝ след t секунди е h(t) = −5t² + 20t метра. Колко най-високо стига и кога пада на земята?',
    solution: ['Върхът е при t₀ = −20 / (2 · (−5)) = 2 s', 'h(2) = −5 · 4 + 20 · 2 = 20 m', 'Пада, когато h(t) = 0: −5t(t − 4) = 0 ⇒ t = 4'],
    answer: '20 m след 2 s; пада след 4 s',
    check: [20, 4],
    ask: ['максимална височина, m', 'пада след, s'],
  },
  {
    title: '🐑 Оградата',
    problem: 'С 40 m мрежа трябва да оградиш правоъгълна ливада до река (по реката не се огражда). Какви да са размерите, за да е лицето най-голямо?',
    solution: ['Двете страни, перпендикулярни на реката – x, третата – 40 − 2x', 'S(x) = x(40 − 2x) = −2x² + 40x', 'Връх: x₀ = −40 / (2 · (−2)) = 10', 'S(10) = 10 · 20 = 200'],
    answer: '10 m × 20 m, лице 200 m²',
    check: [200],
    ask: ['най-голямо лице, m²'],
  },
  {
    title: '🎟️ Цената на билета',
    problem: 'Кино продава 200 билета по 10 €. Всяко поскъпване с 1 € намалява продадените билети с 10. При каква цена приходът е най-голям?',
    solution: ['При поскъпване с x €: P(x) = (10 + x)(200 − 10x)', 'P(x) = −10x² + 100x + 2000', 'x₀ = −100 / (2 · (−10)) = 5', 'P(5) = 15 · 150 = 2250 €'],
    answer: 'при цена 15 € – приход 2250 €',
    check: [15],
    ask: ['цена на билета, €'],
  },
];

const questions: Question[] = [
  {
    question: 'Кой е върхът на параболата y = (x − 3)² + 2?',
    answers: ['(−3; 2)', '(3; 2)', '(3; −2)', '(2; 3)'],
    correctAnswer: '(3; 2)',
  },
  {
    question: 'Накъде е отворена параболата y = −2x² + x + 5?',
    answers: ['Нагоре', 'Надолу', 'Надясно', 'Зависи от c'],
    correctAnswer: 'Надолу',
  },
  {
    question: 'Колко нули има функцията y = x² − 4x + 4?',
    answers: ['Нито една', 'Една (двойна)', 'Две', 'Безброй'],
    correctAnswer: 'Една (двойна)',
  },
  {
    question: 'Коя е абсцисата на върха на y = 2x² − 8x + 1?',
    answers: ['x₀ = −2', 'x₀ = 2', 'x₀ = 4', 'x₀ = −4'],
    correctAnswer: 'x₀ = 2',
  },
  {
    question: 'В коя точка параболата y = x² − 5x + 6 пресича оста Oy?',
    answers: ['(0; 6)', '(6; 0)', '(2; 0)', '(0; −5)'],
    correctAnswer: '(0; 6)',
  },
  {
    question: 'Коя е най-малката стойност на функцията y = x² + 6x + 10?',
    answers: ['10', '1', '−3', '0'],
    correctAnswer: '1',
  },
];

export function QuadraticFunctions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Квадратни функции
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Какво общо имат струята на чешма, траекторията на
              баскетболна топка и сателитната чиния на покрива? И трите имат формата на{' '}
              <strong>парабола</strong> – графиката на квадратната функция. Хвърлената топка
              описва парабола, защото гравитацията я забавя равномерно: височината ѝ зависи от
              квадрата на времето.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Квадратна функция"
            description="Функцията y = ax² + bx + c, където a, b и c са дадени числа и a ≠ 0, се нарича квадратна. Дефиниционната ѝ област са всички реални числа, а графиката ѝ е крива, наречена парабола. Най-ниската (или най-високата) точка на параболата е нейният връх, а вертикалната права през върха е ос на симетрия."
            graphic={<InteractiveQuadraticGrapher />}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Какво показват коефициентите</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {coefficients.map(([name, role, desc]) => (
              <div key={name} className={card}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{name}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{role}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Връх и ос на симетрия</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-base sm:text-lg">x₀ = −b / (2a),   y₀ = f(x₀) = −D / (4a)</p>
            <p className="text-sm sm:text-base">ос на симетрия: x = x₀</p>
            <p className="text-sm sm:text-base">връхна форма: y = a(x − x₀)² + y₀</p>
          </div>
          <p className={`${text} mb-4`}>
            Всяка парабола y = ax² + bx + c се получава от y = ax², като я преместим така, че
            върхът ѝ да отиде в точката (x₀; y₀). Това се вижда, като отделим точен квадрат – така
            получаваме <strong>връхната форма</strong>, от която върхът се чете директно.
          </p>
          <Example
            description="Намери върха на параболата y = x² − 4x + 3 и я запиши във връхна форма."
            steps={[
              'x₀ = −b / (2a) = 4 / 2 = 2',
              'y₀ = f(2) = 4 − 8 + 3 = −1',
              'Връх V(2; −1), ос на симетрия x = 2.',
              'Отделяме точен квадрат: x² − 4x + 3 = (x² − 4x + 4) − 1 = (x − 2)² − 1.',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Нули и дискриминанта</h2>
          <p className={`${text} mb-4`}>
            Нулите на функцията са абсцисите на точките, в които параболата пресича оста Ox. Те са
            корените на уравнението ax² + bx + c = 0, а броят им зависи от знака на дискриминантата{' '}
            <span className="font-mono">D = b² − 4ac</span>:
          </p>
          <DiscriminantCases />
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 my-4 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-base sm:text-lg">x₁,₂ = (−b ± √D) / (2a)</p>
          </div>
          <p className={text}>
            Нулите са симетрични спрямо оста на параболата, затова x₀ е точно по средата между тях:{' '}
            <span className="font-mono">x₀ = (x₁ + x₂) / 2</span>. Ако знаем нулите, можем да
            запишем функцията и така: <span className="font-mono">y = a(x − x₁)(x − x₂)</span>.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Свойства</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                  <th className="text-left p-2 sm:p-3 font-semibold" />
                  <th className="p-2 sm:p-3 font-semibold font-mono text-emerald-700 dark:text-emerald-400">a &gt; 0</th>
                  <th className="p-2 sm:p-3 font-semibold font-mono text-rose-600 dark:text-rose-400">a &lt; 0</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {properties.map(([name, up, down]) => (
                  <tr key={name} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-2 sm:p-3">{name}</td>
                    <td className="p-2 sm:p-3 text-center">{up}</td>
                    <td className="p-2 sm:p-3 text-center">{down}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Как се чертае парабола</h2>
          <ol className={`${text} list-decimal ml-5 space-y-1 mb-4`}>
            <li>Намери върха (x₀; y₀) и начертай пунктирано оста x = x₀.</li>
            <li>Намери пресечната точка с Oy – (0; c) – и нулите, ако има такива.</li>
            <li>Пресметни още няколко точки около върха. Използвай симетрията: на равни разстояния вляво и вдясно от оста стойностите са равни.</li>
            <li>Свържи точките с плавна крива – без чупки и без „дъно“ във формата на V.</li>
          </ol>
          <PointByPoint f={x => x * x - 2 * x - 3} xs={[-2, -1, 0, 1, 2, 3, 4]} formula="x² − 2x − 3" />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>⚠️ Чести грешки</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Знакът във връхната форма', 'y = (x + 3)² има връх в (3; 0)', 'x + 3 = x − (−3), върхът е (−3; 0)'],
              ['Минусът в x₀', 'y = x² − 6x ⇒ x₀ = −6 / 2 = −3', 'x₀ = −b/(2a) = −(−6) / 2 = 3'],
              ['Повдигане на отрицателно число', 'при x = −2: −x² = 4', '−x² = −(x²) = −4, а (−x)² = 4'],
              ['D < 0 означава „грешка“', 'щом D < 0, задачата няма решение', 'функцията съществува; просто параболата не пресича Ox'],
            ].map(([title, wrong, right]) => (
              <div key={title} className={card}>
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Задачи от живота</h2>
          <p className={`${text} mb-4`}>
            Най-полезното свойство на параболата в практиката е, че върхът ѝ дава най-голямата или
            най-малката стойност. Така се решават много задачи за „най-изгодно“ и „най-много“.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Упражнения</h2>
          <Quiz questions={questions} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Параболата има специална точка – фокус. Всеки лъч, който пада успоредно на оста ѝ, се
              отразява точно към фокуса. Затова сателитните чинии, слънчевите пещи и огледалата на
              телескопите са параболични: събират слабия сигнал или светлина в една точка. Обратно,
              фаровете на колите поставят лампата във фокуса, за да изпратят успореден сноп.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
