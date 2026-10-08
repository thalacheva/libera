import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { InteractiveLinearGrapher, TwoLines } from './InteractiveLinearGrapher';
import { PointByPoint } from './InteractiveQuadraticGrapher';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const slopeCases = [
  ['a > 0', 'Растяща', 'когато x расте, y също расте – правата „се изкачва“ отляво надясно', 'text-emerald-700 dark:text-emerald-400'],
  ['a < 0', 'Намаляваща', 'когато x расте, y намалява – правата „слиза“ отляво надясно', 'text-rose-600 dark:text-rose-400'],
  ['a = 0', 'Константна', 'y = b за всяко x – правата е успоредна на оста Ox', 'text-gray-600 dark:text-gray-300'],
];

const positions = [
  ['a₁ ≠ a₂', 'Пресичат се', 'имат точно една обща точка'],
  ['a₁ = a₂, b₁ ≠ b₂', 'Успоредни', 'нямат обща точка'],
  ['a₁ = a₂, b₁ = b₂', 'Съвпадат', 'това е една и съща права'],
  ['a₁ · a₂ = −1', 'Перпендикулярни', 'пресичат се под прав ъгъл'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🚕 Такси',
    problem: 'Таксито взема 1,20 € при качване и по 0,80 € за всеки километър. Колко ще платиш за 15 km?',
    solution: ['Цената е линейна функция на пътя x (в km):', 'C(x) = 0,8x + 1,2', 'C(15) = 0,8 · 15 + 1,2 = 12 + 1,2'],
    answer: '13,20 €',

    check: [13.2],

    ask: ['цена, €'],
  },
  {
    title: '🌡️ Градуси по Фаренхайт',
    problem: 'Връзката между градуси по Целзий и по Фаренхайт е F = 1,8C + 32. Колко °F е стайната температура 20 °C? А при колко °C водата замръзва, ако е 32 °F?',
    solution: ['F = 1,8 · 20 + 32 = 36 + 32 = 68', '32 = 1,8C + 32', '1,8C = 0 ⇒ C = 0'],
    answer: '68 °F; 0 °C',

    check: [68, 0],

    ask: ['20 °C = ? °F', '32 °F = ? °C'],
  },
  {
    title: '🕯️ Свещта',
    problem: 'Свещ е висока 24 cm и изгаря с 3 cm на час. Запиши височината ѝ h като функция на времето t. След колко часа ще изгори?',
    solution: ['h(t) = 24 − 3t (a = −3 < 0, функцията намалява)', 'Свещта изгаря, когато h(t) = 0:', '24 − 3t = 0 ⇒ t = 8'],
    answer: 'h(t) = 24 − 3t; след 8 часа',

    check: [8],

    ask: ['изгаря след, часа'],
  },
];

const questions: Question[] = [
  {
    question: 'Ако f(x) = 2x + 1, колко е f(3)?',
    answers: ['5', '6', '7', '8'],
    correctAnswer: '7',
  },
  {
    question: 'Коя от функциите е намаляваща?',
    answers: ['y = 3x − 5', 'y = −2x + 7', 'y = 4', 'y = x'],
    correctAnswer: 'y = −2x + 7',
  },
  {
    question: 'В коя точка правата y = 3x − 6 пресича оста Ox?',
    answers: ['(0; −6)', '(2; 0)', '(−2; 0)', '(6; 0)'],
    correctAnswer: '(2; 0)',
  },
  {
    question: 'Кой е наклонът на правата през точките (1; 2) и (3; 8)?',
    answers: ['2', '3', '6', '1/3'],
    correctAnswer: '3',
  },
  {
    question: 'Коя права е успоредна на y = 2x + 3?',
    answers: ['y = 3x + 2', 'y = −2x + 3', 'y = 2x − 5', 'y = −½x + 3'],
    correctAnswer: 'y = 2x − 5',
  },
  {
    question: 'Коя права е перпендикулярна на y = 2x + 3?',
    answers: ['y = 2x − 1', 'y = −2x', 'y = ½x + 3', 'y = −½x + 1'],
    correctAnswer: 'y = −½x + 1',
  },
];

export function LinearFunctions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Линейни функции
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Такси взема 1,20 € при качване и 0,80 € на километър. Ако
              начертаеш цената спрямо изминатия път, всички точки ще легнат на една права. Защо
              точно права? Защото всеки следващ километър добавя <em>една и съща</em> сума – цената
              расте с постоянна скорост. Точно това е линейната функция.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Функция"
            description="Функция е правило, което на всяко допустимо число x съпоставя точно едно число y. Пишем y = f(x) и казваме, че y е функция на x. Множеството от допустимите стойности на x е дефиниционната област, а графиката на функцията е множеството от всички точки (x; f(x)) в координатната система."
          />
          <Theorem
            type="definition"
            title="Линейна функция"
            description="Функцията y = ax + b, където a и b са дадени числа, се нарича линейна. Дефиниционната ѝ област са всички реални числа, а графиката ѝ е права. Числото a е ъгловият коефициент (наклон), а b показва къде правата пресича оста Oy."
            graphic={<InteractiveLinearGrapher />}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Наклон: какво показва a</h2>
          <p className={`${text} mb-4`}>
            Ако x нарасне с Δx, стойността y = ax + b нараства с Δy = a · Δx. Затова наклонът е
            отношението <strong className="font-mono">a = Δy / Δx</strong> и може да се намери от
            всеки две точки на правата. Например при a = 2 всяка стъпка надясно с 1 вдига правата
            с 2, а при a = −½ всяка стъпка надясно я сваля с половин деление.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {slopeCases.map(([cond, name, desc, color]) => (
              <div key={cond} className={card}>
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{name}</p>
                  <p className={`font-mono text-sm ${color}`}>{cond}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
          <p className={`${text} mb-4`}>
            Колкото по-голямо е |a|, толкова по-стръмна е правата. Ако α е ъгълът, който правата
            сключва с положителната посока на Ox, то <span className="font-mono">a = tg α</span>.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Пресечни точки с осите</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-sm sm:text-base">с оста Oy (x = 0): точката (0; b)</p>
            <p className="text-sm sm:text-base">с оста Ox (y = 0): ax + b = 0 ⇒ точката (−b/a; 0), a ≠ 0</p>
          </div>
          <p className={`${text} mb-4`}>
            Числото x₀ = −b/a, за което f(x₀) = 0, се нарича <strong>нула</strong> (корен) на
            функцията. Намирането на нулата е същото като решаването на линейното уравнение
            ax + b = 0.
          </p>
          <Example
            description="Намери пресечните точки на правата y = 2x − 4 с координатните оси."
            steps={[
              'С Oy: x = 0 ⇒ y = 2 · 0 − 4 = −4. Точката е (0; −4).',
              'С Ox: y = 0 ⇒ 2x − 4 = 0 ⇒ x = 2. Точката е (2; 0).',
              'Двете точки са достатъчни, за да начертаем правата.',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Как се чертае графиката</h2>
          <p className={`${text} mb-4`}>
            През две точки минава точно една права, затова е достатъчно да пресметнем стойностите
            на функцията за две стойности на x. Трета точка е добра проверка – ако не легне на
            правата, някъде има грешка в сметките.
          </p>
          <PointByPoint f={x => 2 * x + 1} xs={[-3, -1, 0, 1, 2]} formula="2x + 1" />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Взаимно положение на две прави</h2>
          <p className={`${text} mb-4`}>
            Две прави y = a₁x + b₁ и y = a₂x + b₂ се сравняват по наклоните си. Еднакъв наклон
            означава еднаква посока, т.е. правите са успоредни или съвпадат.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {positions.map(([cond, name, desc]) => (
              <div key={cond} className={card}>
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{name}</p>
                  <p className="font-mono text-sm text-blue-700 dark:text-blue-300">{cond}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
          <Theorem title="Пресечна точка на две прави" description="Координатите на общата точка на две прави са решението на системата от двете уравнения. Приравняваме a₁x + b₁ = a₂x + b₂, намираме x и после y." graphic={<TwoLines />} />
          <Example
            description="Намери пресечната точка на правите y = x + 1 и y = −2x + 7."
            steps={['x + 1 = −2x + 7', '3x = 6 ⇒ x = 2', 'y = 2 + 1 = 3', 'Пресечната точка е (2; 3).']}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Права пропорционалност</h2>
          <p className={text}>
            Когато b = 0, функцията е y = ax и правата минава през началото на координатната
            система. Тогава y и x са <strong>правопропорционални</strong>: ако x се увеличи 2 пъти,
            и y се увеличава 2 пъти. Цената на плодове по 3 € за килограм (y = 3x) е такава
            функция, а цената на такси с начална такса – не е, защото при x = 0 вече плащаш.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>⚠️ Чести грешки</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Наклон „наобратно“', 'a = Δx / Δy', 'a = Δy / Δx – промяната на y върху промяната на x'],
              ['Объркани пресечни точки', 'y = 3x − 6 пресича Ox в (0; −6)', '(0; −6) е на оста Oy; с Ox: 3x − 6 = 0 ⇒ (2; 0)'],
              ['Знакът на b', 'y = 2x − 3 пресича Oy в (0; 3)', 'пресича Oy в (0; −3)'],
              ['Вертикалната права', 'x = 2 е линейна функция', 'x = 2 не е функция – на x = 2 съответстват безброй стойности на y'],
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
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Упражнения</h2>
          <Quiz questions={questions} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Идеята да описваме точките с двойка числа и да рисуваме уравненията като линии е на
              Рене Декарт (1637 г.). Според легендата му хрумнала, докато лежал болен и гледал как
              муха пълзи по тавана: положението ѝ можело да се опише с разстоянията до двете
              стени. Затова и днес казваме „декартова координатна система“.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
