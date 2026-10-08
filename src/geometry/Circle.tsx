import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { InscribedAngle } from './InscribedAngle';
import { InteractiveCircle } from './InteractiveCircle';
import { WordProblems, type WordProblem } from '~/WordProblems';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const elements = [
  ['Хорда', 'отсечка, която свързва две точки от окръжността'],
  ['Диаметър', 'хорда, която минава през центъра; d = 2r'],
  ['Дъга', 'частта от окръжността между две нейни точки'],
  ['Секуща', 'права, която пресича окръжността в две точки'],
  ['Допирателна', 'права с точно една обща точка с окръжността; перпендикулярна е на радиуса в допирната точка'],
  ['Централен ъгъл', 'ъгъл с връх в центъра; рамената му са радиуси'],
];

const formulas = [
  ['Дължина на окръжност', 'C = 2πr = πd'],
  ['Лице на кръг', 'S = πr²'],
  ['Дължина на дъга (α в градуси)', 'l = πrα / 180°'],
  ['Лице на сектор (α в градуси)', 'S = πr²α / 360° = l · r / 2'],
  ['Дължина на дъга (α в радиани)', 'l = α · r'],
  ['Градуси ↔ радиани', 'α(rad) = α(°) · π / 180°'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🍕 Пицата',
    problem: 'Кое е повече пица: една с диаметър 45 cm или две с диаметър по 30 cm?',
    solution: ['Голяма: r = 22,5 → S = π · 22,5² ≈ 1590 cm²', 'Малка: r = 15 → S = π · 15² ≈ 707 cm²', 'Две малки: 2 · 707 ≈ 1414 cm²'],
    answer: 'една голяма – с около 176 cm² повече',
    check: [176.7],
    ask: ['разлика в лицата, cm²'],
  },
  {
    title: '🚲 Колелото',
    problem: 'Колело на велосипед има диаметър 70 cm. Колко пълни оборота прави, докато велосипедът измине 1 km?',
    solution: ['C = πd = π · 0,7 ≈ 2,2 m', '1 km = 1000 m', '1000 / 2,2 ≈ 455'],
    answer: 'около 455 оборота',
    check: [455],
    ask: ['пълни оборота'],
  },
  {
    title: '🕰️ Часовникът',
    problem: 'Минутната стрелка на часовник е дълга 10 cm. Какъв път изминава върхът ѝ за 20 минути?',
    solution: ['За 60 минути върхът описва цялата окръжност.', '20 минути = 1/3 от пълния оборот = 120°', 'l = 2π · 10 / 3 ≈ 20,9'],
    answer: 'около 20,9 cm',
    check: [20.94],
    ask: ['път, cm'],
  },
];

const circleQuiz: Question[] = [
  {
    question: 'Радиусът на окръжност е 5 cm. Колко е диаметърът ѝ?',
    answers: ['2,5 cm', '5 cm', '10 cm', '25 cm'],
    correctAnswer: '10 cm',
  },
  {
    question: 'Колко е лицето на кръг с радиус 3 cm?',
    answers: ['3π cm²', '6π cm²', '9π cm²', '18π cm²'],
    correctAnswer: '9π cm²',
  },
  {
    question: 'Колко е дължината на окръжност с диаметър 10 cm?',
    answers: ['5π cm', '10π cm', '20π cm', '25π cm'],
    correctAnswer: '10π cm',
  },
  {
    question: 'Централен ъгъл е 80°. Колко е вписаният ъгъл, който се опира на същата дъга?',
    answers: ['40°', '80°', '160°', '100°'],
    correctAnswer: '40°',
  },
  {
    question: 'Колко е ъгъл, вписан в полуокръжност (опира се на диаметър)?',
    answers: ['45°', '90°', '180°', 'зависи от окръжността'],
    correctAnswer: '90°',
  },
  {
    question: 'Ако радиусът на кръг се удвои, какво става с лицето му?',
    answers: ['Удвоява се', 'Увеличава се 4 пъти', 'Увеличава се 8 пъти', 'Не се променя'],
    correctAnswer: 'Увеличава се 4 пъти',
  },
  {
    question: 'На колко градуса приблизително е равен 1 радиан?',
    answers: ['1°', '3,14°', '57,3°', '180°'],
    correctAnswer: '57,3°',
  },
];

export function Circle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Окръжност и кръг
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Опъваме въже около Земята по екватора (около 40 000 km).
              След това го удължаваме с <strong>само 1 метър</strong> и го повдигаме равномерно
              над земята. Може ли котка да мине под въжето? Предположи, а отговорът ще намериш
              по-долу.
            </p>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Окръжност или кръг?</h2>
          <p className={`${text} mb-4`}>
            В ежедневието двете думи често се бъркат, но в геометрията означават различни неща.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className={`${card} flex gap-4 items-center`}>
              <svg viewBox="0 0 80 80" className="w-16 h-16 flex-shrink-0">
                <circle cx="40" cy="40" r="32" className="fill-none stroke-blue-500" strokeWidth="4" />
              </svg>
              <div className={text}>
                <p className="font-semibold">Окръжност</p>
                <p className="text-sm">
                  Само „линията“ – всички точки, които са на разстояние точно r от центъра O.
                </p>
              </div>
            </div>
            <div className={`${card} flex gap-4 items-center`}>
              <svg viewBox="0 0 80 80" className="w-16 h-16 flex-shrink-0">
                <circle cx="40" cy="40" r="32" className="fill-blue-500/30 stroke-blue-500" strokeWidth="4" />
              </svg>
              <div className={text}>
                <p className="font-semibold">Кръг</p>
                <p className="text-sm">
                  Окръжността заедно с вътрешността ѝ – всички точки на разстояние не повече от r.
                </p>
              </div>
            </div>
          </div>
          <p className={`${text} mb-4`}>
            Затова казваме <strong>дължина на окръжността</strong> (тя е линия), но{' '}
            <strong>лице на кръга</strong> (той е част от равнината).
          </p>
          <Theorem
            type="definition"
            title="Център, радиус и диаметър"
            description="Окръжност с център O и радиус r е множеството от всички точки в равнината, които са на разстояние r от O. Радиус се нарича и всяка отсечка от центъра до точка от окръжността. Диаметърът е отсечка през центъра с краища върху окръжността; той е два пъти по-дълъг от радиуса: d = 2r."
            graphic={<InteractiveCircle type="basic" />}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Елементи на окръжността</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-6 text-gray-700 dark:text-gray-300">
            {elements.map(([name, desc]) => (
              <div key={name} className={card}>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
          <Theorem
            title="Свойства на хордата"
            description="Диаметърът е най-дългата хорда. Перпендикулярът от центъра към хорда я разполовява. Равни хорди са на равни разстояния от центъра."
            graphic={<InteractiveCircle type="chord" />}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Числото π, дължина и лице</h2>
          <p className={`${text} mb-4`}>
            Колкото и голяма или малка да е една окръжност, ако разделим дължината ѝ на диаметъра,
            получаваме едно и също число – <strong>π ≈ 3,14159</strong>. Цифрите му след десетичната
            запетая продължават безкрайно, без да се повтарят. Още Архимед (III век пр.н.е.)
            вписва и описва около окръжност 96-ъгълници и доказва, че 3 10/71 &lt; π &lt; 3 1/7.
          </p>
          <Theorem
            title="Дължина на окръжността и лице на кръга"
            description="Дължината на окръжност с радиус r е C = 2πr = πd. Лицето на кръг с радиус r е S = πr²."
            graphic={<InteractiveCircle type="area-circumference" />}
          />
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded mb-6">
            <p className="font-semibold mb-1 text-gray-800 dark:text-gray-100">🐈 Отговор на загадката</p>
            <p className={text}>
              Ако радиусът е R, дължината на въжето е 2πR. Удълженото въже е 2πR + 1 и лежи на
              окръжност с радиус R + x. Тогава 2π(R + x) = 2πR + 1, откъдето{' '}
              <span className="font-mono">x = 1 / (2π) ≈ 0,16 m</span>. Въжето се вдига с около{' '}
              <strong>16 cm</strong> – котката минава спокойно! Изненадващото е, че отговорът
              изобщо не зависи от размера на Земята: същото се получава и около топка за тенис.
            </p>
          </div>
          <Example
            description="Дължината на окръжност е 31,4 cm. Намери радиуса и лицето на кръга (π ≈ 3,14)."
            steps={[
              'C = 2πr → r = C / (2π) = 31,4 / 6,28 = 5 cm',
              'S = πr² = 3,14 · 5² = 3,14 · 25 = 78,5 cm²',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Дъга, сектор и радиан</h2>
          <p className={`${text} mb-4`}>
            Дъгата и секторът са „парче“ от окръжността и от кръга. Ако централният ъгъл е α,
            то парчето е α/360° от цялото.
          </p>
          <Theorem
            title="Дължина на дъга"
            description="Дъга с централен ъгъл α (в градуси) има дължина l = 2πr · α/360° = πrα/180°."
            graphic={<InteractiveCircle type="arc" />}
          />
          <Theorem
            title="Лице на сектор"
            description="Секторът е частта от кръга между два радиуса и дъгата между тях. При централен ъгъл α (в градуси) лицето му е S = πr² · α/360°. Може да се пресметне и чрез дължината на дъгата: S = l · r / 2."
            graphic={<InteractiveCircle type="sector" />}
          />
          <Theorem
            type="definition"
            title="Радиан"
            description="Един радиан е централният ъгъл, чиято дъга е равна по дължина на радиуса. Пълният ъгъл е 2π радиана = 360°, затова 1 rad ≈ 57,3° и 1° = π/180 rad ≈ 0,01745 rad. С радиани формулата за дъга става съвсем проста: l = α · r."
            graphic={<InteractiveCircle type="radian" />}
          />
          <Example
            description="Окръжност има радиус 6 cm. Намери дължината на дъга и лицето на сектор с централен ъгъл 60°."
            steps={[
              '60° е 60/360 = 1/6 от пълния ъгъл.',
              'Дъга: l = 2π · 6 / 6 = 2π ≈ 6,28 cm',
              'Сектор: S = π · 6² / 6 = 6π ≈ 18,85 cm²',
              'Проверка: S = l · r / 2 = 2π · 6 / 2 = 6π ✓',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Вписан ъгъл</h2>
          <p className={`${text} mb-4`}>
            Ъгъл, чийто връх е върху окръжността, а рамената му са хорди, се нарича{' '}
            <strong>вписан ъгъл</strong>. Той „гледа“ към дъгата между рамената си.
          </p>
          <Theorem
            title="Теорема за вписания ъгъл"
            description="Вписаният ъгъл е равен на половината от централния ъгъл, който се опира на същата дъга. Следствие (теорема на Талес): всеки ъгъл, вписан в полуокръжност, е прав."
            graphic={<InscribedAngle />}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Всички формули на едно място</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-gray-700/60 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {formulas.map(([name, formula]) => (
              <div key={name} className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3">
                <span>{name}</span>
                <span className="font-mono text-blue-700 dark:text-blue-300">{formula}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>⚠️ Чести грешки</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Диаметър вместо радиус', 'd = 10 → S = π · 10² = 100π', 'r = 5 → S = π · 5² = 25π'],
              ['Объркани формули', 'C = πr², S = 2πr', 'C = 2πr (линия), S = πr² (площ)'],
              ['Градуси във формула за радиани', 'l = α · r = 60 · 6 = 360', '60° = π/3 rad → l = π/3 · 6 = 2π'],
              ['„Лице на окръжност“', 'окръжността има лице', 'лице има кръгът; окръжността има дължина'],
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
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Упражнения
          </h2>
          <Quiz questions={circleQuiz} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Около 240 г. пр.н.е. Ератостен измерва обиколката на Земята само с формулата за
              дължина на дъга. В Сиена (днешен Асуан) по пладне на лятното слънцестоене Слънцето
              е точно в зенита, а в Александрия в същия момент сянката на вертикален прът показва
              ъгъл от около 7,2° – това е 1/50 от пълния ъгъл. Щом разстоянието между двата града е
              около 5000 стадия, цялата обиколка трябва да е 50 пъти по-голяма – 250 000 стадия.
              Според това каква дължина приемаме за стадий, резултатът е много близо до истинските
              40 000 km.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
