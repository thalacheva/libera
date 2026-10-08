import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { InteractiveLinearGrapher, TwoLines } from './InteractiveLinearGrapher';
import { InverseLab } from './InverseLab';
import { PointByPoint } from './InteractiveQuadraticGrapher';
import { ModelFitLab } from './ModelFitLab';
import { TariffLab } from './TariffLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
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
  {
    title: '💧 Басейнът',
    problem: 'В басейн вече има 200 литра вода, а помпата добавя по 30 литра в минута. След колко минути водата ще е 1100 литра?',
    solution: ['V(t) = 200 + 30t', '200 + 30t = 1100', '30t = 900 ⇒ t = 30'],
    answer: 'след 30 минути',
    check: [30],
    ask: ['минути'],
  },
  {
    title: '👷 Работниците',
    problem: '6 работници боядисват ограда за 10 дни. За колко дни ще я боядисат 4 работници, ако работят със същото темпо?',
    solution: ['Работата е 6 · 10 = 60 „работнико-дни“ – постоянна величина.', 'Броят дни е обратно пропорционален на броя работници: d = 60 / n', 'd = 60 / 4 = 15'],
    answer: '15 дни',
    check: [15],
    ask: ['дни'],
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
  {
    question: 'Кои величини са обратно пропорционални?',
    answers: ['Цената и количеството плодове', 'Скоростта и времето за един и същ път', 'Страната и периметърът на квадрат', 'Пътят и времето при постоянна скорост'],
    correctAnswer: 'Скоростта и времето за един и същ път',
  },
  {
    question: 'План А струва 5 € + 0,10 € на минута, план Б – 0,20 € на минута. При колко минути струват еднакво?',
    answers: ['25', '50', '100', 'Никога'],
    correctAnswer: '50',
  },
];

export function LinearFunctions() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Линейни функции</h1>

        <div className="bg-gradient-to-br from-sky-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔭 През 1929 г. Едуин Хъбъл нанася на графика 24 галактики: хоризонтално – разстоянието до тях, вертикално – скоростта, с която се
            отдалечават. Точките, макар и разпръснати, лягат около една права през началото: v = H₀ · d. Колкото по-далеч е галактиката,
            толкова по-бързо бяга. Тази проста линейна функция показа, че Вселената се разширява (Лекция 28 по астрономия). Ще видиш, че
            линейните функции са навсякъде – в таксито, в сметката за телефон, в пружината и в свещта.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Функция и линейна функция</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Такси взема 1,20 € при качване и 0,80 € на километър. Ако начертаеш цената спрямо изминатия път,
              всички точки ще легнат на една права. Защо точно права? Защото всеки следващ километър добавя <em>една и съща</em> сума – цената
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

        <section className="mb-8">
          <h2 className={h2}>2. Наклон: какво показва a</h2>
          <p className={`${text} mb-4`}>
            Ако x нарасне с Δx, стойността y = ax + b нараства с Δy = a · Δx. Затова наклонът е отношението{' '}
            <strong className="font-mono">a = Δy / Δx</strong> и може да се намери от всеки две точки на правата. Например при a = 2 всяка
            стъпка надясно с 1 вдига правата с 2, а при a = −½ всяка стъпка надясно я сваля с половин деление.
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
            Колкото по-голямо е |a|, толкова по-стръмна е правата. Ако α е ъгълът, който правата сключва с положителната посока на Ox, то{' '}
            <span className="font-mono">a = tg α</span>.
          </p>
          <Example
            description="Намери уравнението на правата през точките A(1; 3) и B(4; 9)."
            steps={['Наклон: a = Δy/Δx = (9 − 3)/(4 − 1) = 6/3 = 2', 'y = 2x + b; точката A е на правата: 3 = 2 · 1 + b ⇒ b = 1', 'Отговор: y = 2x + 1. Проверка с B: 2 · 4 + 1 = 9 ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Пресечни точки с осите и графика</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-sm sm:text-base">с оста Oy (x = 0): точката (0; b)</p>
            <p className="text-sm sm:text-base">с оста Ox (y = 0): ax + b = 0 ⇒ точката (−b/a; 0), a ≠ 0</p>
          </div>
          <p className={`${text} mb-4`}>
            Числото x₀ = −b/a, за което f(x₀) = 0, се нарича <strong>нула</strong> (корен) на функцията. Намирането на нулата е същото като
            решаването на линейното уравнение ax + b = 0.
          </p>
          <Example
            description="Намери пресечните точки на правата y = 2x − 4 с координатните оси."
            steps={[
              'С Oy: x = 0 ⇒ y = 2 · 0 − 4 = −4. Точката е (0; −4).',
              'С Ox: y = 0 ⇒ 2x − 4 = 0 ⇒ x = 2. Точката е (2; 0).',
              'Двете точки са достатъчни, за да начертаем правата.',
            ]}
          />
          <p className={`${text} mb-4`}>
            През две точки минава точно една права, затова е достатъчно да пресметнем стойностите на функцията за две стойности на x. Трета
            точка е добра проверка – ако не легне на правата, някъде има грешка в сметките.
          </p>
          <PointByPoint f={x => 2 * x + 1} xs={[-3, -1, 0, 1, 2]} formula="2x + 1" />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Взаимно положение на две прави</h2>
          <p className={`${text} mb-4`}>
            Две прави y = a₁x + b₁ и y = a₂x + b₂ се сравняват по наклоните си. Еднакъв наклон означава еднаква посока, т.е. правите са
            успоредни или съвпадат.
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
          <Theorem
            title="Пресечна точка на две прави"
            description="Координатите на общата точка на две прави са решението на системата от двете уравнения. Приравняваме a₁x + b₁ = a₂x + b₂, намираме x и после y."
            graphic={<TwoLines />}
          />
          <Example
            description="Намери пресечната точка на правите y = x + 1 и y = −2x + 7."
            steps={['x + 1 = −2x + 7', '3x = 6 ⇒ x = 2', 'y = 2 + 1 = 3', 'Пресечната точка е (2; 3).']}
          />
          <p className={`${text} mb-4`}>
            Пресечната точка често е отговорът на житейски въпрос: от колко минути нататък един план е по-изгоден от друг?
          </p>
          <TariffLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Права и обратна пропорционалност</h2>
          <Theorem
            type="definition"
            title="Права пропорционалност"
            description="Величините y и x са правопропорционални, ако y = kx (k ≠ 0). Графиката е права през началото на координатната система. Ако x се увеличи n пъти, и y се увеличава n пъти; отношението y/x = k е постоянно."
          />
          <p className={`${text} mb-4`}>
            Цената на плодове по 3 € за килограм (y = 3x) е такава функция, а цената на такси с начална такса – не е, защото при x = 0 вече
            плащаш. Линейната функция y = ax + b е пропорционалност само при b = 0.
          </p>
          <Theorem
            type="definition"
            title="Обратна пропорционалност"
            description="Величините y и x са обратно пропорционални, ако y = k/x (k ≠ 0, x ≠ 0), т.е. произведението x · y = k е постоянно. Ако x се увеличи n пъти, y намалява n пъти. Графиката не е права, а крива – хипербола."
          />
          <InverseLab />
          <Example
            description="Път от 120 km може да се измине с различни скорости. Как зависи времето от скоростта?"
            steps={['t = 120 / v – времето е обратно пропорционално на скоростта', 'v = 40 km/h ⇒ t = 3 h;  v = 60 km/h ⇒ t = 2 h;  v = 120 km/h ⇒ t = 1 h', 'Скоростта се удвои (от 60 на 120) – времето намаля наполовина']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Линейни модели: от данни към формула</h2>
          <p className={`${text} mb-4`}>
            Истинските измервания никога не лежат точно на права – винаги има малки грешки. Учените търсят правата, която минава „най-близо“ до
            всички точки, и после я използват за прогнози. Опитай се ти!
          </p>
          <ModelFitLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Наклон „наобратно“', 'a = Δx / Δy', 'a = Δy / Δx – промяната на y върху промяната на x'],
              ['Объркани пресечни точки', 'y = 3x − 6 пресича Ox в (0; −6)', '(0; −6) е на оста Oy; с Ox: 3x − 6 = 0 ⇒ (2; 0)'],
              ['Знакът на b', 'y = 2x − 3 пресича Oy в (0; 3)', 'пресича Oy в (0; −3)'],
              ['Вертикалната права', 'x = 2 е линейна функция', 'x = 2 не е функция – на x = 2 съответстват безброй стойности на y'],
              ['Всяка линейна функция е пропорционалност', 'y = 2x + 3 е права пропорционалност', 'само при b = 0; тук y/x не е постоянно'],
              ['„Колкото повече, толкова по-малко“ значи обратна пропорционалност', 'y = 10 − x е обратна пропорционалност', 'обратна е само ако x · y е постоянно'],
            ].map(([title, wrong, right]) => (
              <div key={title} className={card}>
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={questions} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Дадена е функцията f(x) = −3x + 6. Намери f(−2), нулата на функцията и пресечната точка с оста Oy. Растяща ли е?">
                <p>f(−2) = −3 · (−2) + 6 = 12</p>
                <p>Нула: −3x + 6 = 0 ⇒ x = 2; пресечна точка с Oy: (0; 6)</p>
                <p>a = −3 &lt; 0 – функцията е намаляваща.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намери уравнението на правата през точките (1; 3) и (3; 7).">
                <p>a = (7 − 3)/(3 − 1) = 2</p>
                <p>3 = 2 · 1 + b ⇒ b = 1</p>
                <p>y = 2x + 1</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Лежи ли точката M(4; −5) на правата y = −2x + 3? А точката N(−1; 4)?">
                <p>M: −2 · 4 + 3 = −5 ✓ – лежи.</p>
                <p>N: −2 · (−1) + 3 = 5 ≠ 4 – не лежи.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="За кое a правата y = (a − 1)x + 3 е успоредна на y = 2x − 7? А перпендикулярна на нея?">
                <p>Успоредни: еднакъв наклон ⇒ a − 1 = 2 ⇒ a = 3 (и 3 ≠ −7, значи не съвпадат).</p>
                <p>Перпендикулярни: (a − 1) · 2 = −1 ⇒ a − 1 = −½ ⇒ a = ½</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="План А струва 8 € месечно и 0,10 € на минута, план Б – 0,30 € на минута без такса. При колко минути двата плана струват еднакво? Кой е по-изгоден при 60 минути?">
                <p>8 + 0,1x = 0,3x ⇒ 0,2x = 8 ⇒ x = 40 минути</p>
                <p>При 60 минути: А = 8 + 6 = 14 €, Б = 18 € ⇒ А е по-изгоден.</p>
                <p>Над 40 минути печели А (по-малката цена на минута), под 40 – Б (няма такса).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намери лицето на триъгълника, който правата y = 2x − 4 отсича от координатните оси.">
                <p>Пресечни точки: с Ox – (2; 0), с Oy – (0; −4).</p>
                <p>Триъгълникът е правоъгълен с катети 2 и 4.</p>
                <p>S = 2 · 4 / 2 = 4 кв. единици.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="През точката (2; 1) минава права, която заедно с положителните координатни полуоси образува триъгълник с лице 4. Намери уравнението ѝ.">
                <p>y = kx + b, като 1 = 2k + b ⇒ b = 1 − 2k. За триъгълник в първи квадрант: b &gt; 0 и k &lt; 0.</p>
                <p>Пресечна точка с Ox: x = −b/k. Лице: S = ½ · b · (−b/k) = 4 ⇒ b² = −8k</p>
                <p>(1 − 2k)² = −8k ⇒ 4k² + 4k + 1 = 0 ⇒ (2k + 1)² = 0 ⇒ k = −½</p>
                <p>b = 2, правата е y = −½x + 2 – единствената. (Всъщност 4 е най-малкото възможно лице за права през (2; 1)!)</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Начертай графиката на y = |x − 1| + |x + 1|. Коя е най-малката стойност на функцията и при кои x се достига?">
                <p>x ≤ −1: y = (1 − x) + (−x − 1) = −2x</p>
                <p>−1 ≤ x ≤ 1: y = (1 − x) + (x + 1) = 2</p>
                <p>x ≥ 1: y = (x − 1) + (x + 1) = 2x</p>
                <p>Графиката е „корито“ от три отсечки. Най-малката стойност е 2 – за всяко x от [−1; 1] (сборът от разстоянията до −1 и до 1).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Намери всички линейни функции f(x) = ax + b, за които f(f(x)) = 4x + 3 за всяко x.">
                <p>f(f(x)) = a(ax + b) + b = a²x + ab + b</p>
                <p>Сравняваме коефициентите: a² = 4 и ab + b = 3</p>
                <p>a = 2: 3b = 3 ⇒ b = 1 ⇒ f(x) = 2x + 1</p>
                <p>a = −2: −b = 3 ⇒ b = −3 ⇒ f(x) = −2x − 3</p>
                <p>Проверка: −2(−2x − 3) − 3 = 4x + 3 ✓</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Функция: на всяко x – точно едно y; линейна: y = ax + b, графиката е права</li>
              <li>✓ Наклон a = Δy/Δx: a &gt; 0 – растяща, a &lt; 0 – намаляваща, a = 0 – константна</li>
              <li>✓ Пресечни точки: (0; b) с Oy и (−b/a; 0) с Ox</li>
              <li>✓ Успоредни: a₁ = a₂; перпендикулярни: a₁ · a₂ = −1; пресечна точка – от системата</li>
              <li>✓ Права пропорционалност: y = kx; обратна: y = k/x, x · y = const (хипербола)</li>
              <li>✓ Линейните модели описват данни и позволяват прогнози</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Идеята да описваме точките с двойка числа и да рисуваме уравненията като линии е на Рене Декарт (1637 г.). Според легендата му
              хрумнала, докато лежал болен и гледал как муха пълзи по тавана: положението ѝ можело да се опише с разстоянията до двете стени.
              Затова и днес казваме „декартова координатна система“.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
