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
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const slopeCases = [
  ['$a > 0$', 'Растяща', 'когато $x$ расте, $y$ също расте – правата „се изкачва“ отляво надясно', 'text-emerald-700 dark:text-emerald-400'],
  ['$a < 0$', 'Намаляваща', 'когато $x$ расте, $y$ намалява – правата „слиза“ отляво надясно', 'text-rose-600 dark:text-rose-400'],
  ['$a = 0$', 'Константна', '$y = b$ за всяко $x$ – правата е успоредна на оста Ox', 'text-gray-600 dark:text-gray-300'],
];

const positions = [
  ['$a_1 \\ne a_2$', 'Пресичат се', 'имат точно една обща точка'],
  ['$a_1 = a_2,\\ b_1 \\ne b_2$', 'Успоредни', 'нямат обща точка'],
  ['$a_1 = a_2,\\ b_1 = b_2$', 'Съвпадат', 'това е една и съща права'],
  ['$a_1 \\cdot a_2 = -1$', 'Перпендикулярни', 'пресичат се под прав ъгъл'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🚕 Такси',
    problem: 'Таксито взема 1,20 € при качване и по 0,80 € за всеки километър. Колко ще платиш за 15 km?',
    solution: ['Цената е линейна функция на пътя $x$ (в km):', '$C(x) = 0{,}8x + 1{,}2$', '$C(15) = 0{,}8 \\cdot 15 + 1{,}2 = 12 + 1{,}2$'],
    answer: '13,20 €',
    check: [13.2],
    ask: ['цена, €'],
  },
  {
    title: '🌡️ Градуси по Фаренхайт',
    problem: 'Връзката между градуси по Целзий и по Фаренхайт е $F = 1{,}8C + 32$. Колко °F е стайната температура 20 °C? А при колко °C водата замръзва, ако е 32 °F?',
    solution: ['$F = 1{,}8 \\cdot 20 + 32 = 36 + 32 = 68$', '$32 = 1{,}8C + 32$', '$1{,}8C = 0 \\Rightarrow C = 0$'],
    answer: '68 °F; 0 °C',
    check: [68, 0],
    ask: ['20 °C = ? °F', '32 °F = ? °C'],
  },
  {
    title: '🕯️ Свещта',
    problem: 'Свещ е висока 24 cm и изгаря с 3 cm на час. Запиши височината ѝ $h$ като функция на времето $t$. След колко часа ще изгори?',
    solution: ['$h(t) = 24 - 3t$ ($a = -3 < 0$, функцията намалява)', 'Свещта изгаря, когато $h(t) = 0$:', '$24 - 3t = 0 \\Rightarrow t = 8$'],
    answer: '$h(t) = 24 - 3t$; след 8 часа',
    check: [8],
    ask: ['изгаря след, часа'],
  },
  {
    title: '💧 Басейнът',
    problem: 'В басейн вече има 200 литра вода, а помпата добавя по 30 литра в минута. След колко минути водата ще е 1100 литра?',
    solution: ['$V(t) = 200 + 30t$', '$200 + 30t = 1100$', '$30t = 900 \\Rightarrow t = 30$'],
    answer: 'след 30 минути',
    check: [30],
    ask: ['минути'],
  },
  {
    title: '👷 Работниците',
    problem: '6 работници боядисват ограда за 10 дни. За колко дни ще я боядисат 4 работници, ако работят със същото темпо?',
    solution: ['Работата е $6 \\cdot 10 = 60$ „работнико-дни“ – постоянна величина.', 'Броят дни е обратно пропорционален на броя работници: $d = 60 / n$', '$d = 60 / 4 = 15$'],
    answer: '15 дни',
    check: [15],
    ask: ['дни'],
  },
];

const questions: Question[] = [
  {
    question: 'Ако $f(x) = 2x + 1$, колко е $f(3)$?',
    answers: ['$5$', '$6$', '$7$', '$8$'],
    correctAnswer: '$7$',
  },
  {
    question: 'Коя от функциите е намаляваща?',
    answers: ['$y = 3x - 5$', '$y = -2x + 7$', '$y = 4$', '$y = x$'],
    correctAnswer: '$y = -2x + 7$',
  },
  {
    question: 'В коя точка правата $y = 3x - 6$ пресича оста Ox?',
    answers: ['$(0;\\ -6)$', '$(2;\\ 0)$', '$(-2;\\ 0)$', '$(6;\\ 0)$'],
    correctAnswer: '$(2;\\ 0)$',
  },
  {
    question: 'Кой е наклонът на правата през точките $(1; 2)$ и $(3; 8)$?',
    answers: ['$2$', '$3$', '$6$', '$\\frac{1}{3}$'],
    correctAnswer: '$3$',
  },
  {
    question: 'Коя права е успоредна на $y = 2x + 3$?',
    answers: ['$y = 3x + 2$', '$y = -2x + 3$', '$y = 2x - 5$', '$y = -\\tfrac{1}{2}x + 3$'],
    correctAnswer: '$y = 2x - 5$',
  },
  {
    question: 'Коя права е перпендикулярна на $y = 2x + 3$?',
    answers: ['$y = 2x - 1$', '$y = -2x$', '$y = \\tfrac{1}{2}x + 3$', '$y = -\\tfrac{1}{2}x + 1$'],
    correctAnswer: '$y = -\\tfrac{1}{2}x + 1$',
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
            отдалечават. Точките, макар и разпръснати, лягат около една права през началото: <Tex>{'v = H_0 \\cdot d'}</Tex>. Колкото по-далеч е галактиката,
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
            description="Функция е правило, което на всяко допустимо число $x$ съпоставя точно едно число $y$. Пишем $y = f(x)$ и казваме, че $y$ е функция на $x$. Множеството от допустимите стойности на $x$ е дефиниционната област, а графиката на функцията е множеството от всички точки $(x; f(x))$ в координатната система."
          />
          <Theorem
            type="definition"
            title="Линейна функция"
            description="Функцията $y = ax + b$, където $a$ и $b$ са дадени числа, се нарича линейна. Дефиниционната ѝ област са всички реални числа, а графиката ѝ е права. Числото $a$ е ъгловият коефициент (наклон), а $b$ показва къде правата пресича оста Oy."
            graphic={<InteractiveLinearGrapher />}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Наклон: какво показва <Tex>{'a'}</Tex></h2>
          <p className={`${text} mb-4`}>
            Ако <Tex>{'x'}</Tex> нарасне с <Tex>{'\\Delta x'}</Tex>, стойността <Tex>{'y = ax + b'}</Tex> нараства с <Tex>{'\\Delta y = a \\cdot \\Delta x'}</Tex>. Затова наклонът е отношението{' '}
            <strong className="font-mono"><Tex>{'a = \\Delta y / \\Delta x'}</Tex></strong> и може да се намери от всеки две точки на правата. Например при <Tex>{'a = 2'}</Tex> всяка
            стъпка надясно с 1 вдига правата с 2, а при <Tex>{'a = -\\tfrac{1}{2}'}</Tex> всяка стъпка надясно я сваля с половин деление.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {slopeCases.map(([cond, name, desc, color]) => (
              <div key={cond} className={card}>
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100"><MathText>{name}</MathText></p>
                  <p className={`font-mono text-sm ${color}`}><MathText>{cond}</MathText></p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400"><MathText>{desc}</MathText></p>
              </div>
            ))}
          </div>
          <p className={`${text} mb-4`}>
            Колкото по-голямо е <Tex>{'|a|'}</Tex>, толкова по-стръмна е правата. Ако <Tex>{'\\alpha'}</Tex> е ъгълът, който правата сключва с положителната посока на Ox, то{' '}
            <span className="font-mono"><Tex>{'a = \\tg \\alpha'}</Tex></span>.
          </p>
          <Example
            description="Намери уравнението на правата през точките A(1; 3) и B(4; 9)."
            steps={['Наклон: $a = \\frac{\\Delta y}{\\Delta x} = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$', '$y = 2x + b$; точката $A$ е на правата: $3 = 2 \\cdot 1 + b \\Rightarrow b = 1$', 'Отговор: $y = 2x + 1$. Проверка с $B$: $2 \\cdot 4 + 1 = 9$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Пресечни точки с осите и графика</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-sm sm:text-base">с оста Oy (<Tex>{'x = 0'}</Tex>): точката <Tex>{'(0; b)'}</Tex></p>
            <p className="text-sm sm:text-base">с оста Ox (<Tex>{'y = 0'}</Tex>): <Tex>{'ax + b = 0 \\Rightarrow'}</Tex> точката <Tex>{'\\left(-\\frac{b}{a}; 0\\right)'}</Tex>, <Tex>{'a \\ne 0'}</Tex></p>
          </div>
          <p className={`${text} mb-4`}>
            Числото <Tex>{'x_0 = -\\frac{b}{a}'}</Tex>, за което <Tex>{'f(x_0) = 0'}</Tex>, се нарича <strong>нула</strong> (корен) на функцията. Намирането на нулата е същото като
            решаването на линейното уравнение <Tex>{'ax + b = 0'}</Tex>.
          </p>
          <Example
            description="Намери пресечните точки на правата $y = 2x - 4$ с координатните оси."
            steps={[
              'С Oy: $x = 0 \\Rightarrow y = 2 \\cdot 0 - 4 = -4$. Точката е $(0; -4)$.',
              'С Ox: $y = 0 \\Rightarrow 2x - 4 = 0 \\Rightarrow x = 2$. Точката е $(2; 0)$.',
              'Двете точки са достатъчни, за да начертаем правата.',
            ]}
          />
          <p className={`${text} mb-4`}>
            През две точки минава точно една права, затова е достатъчно да пресметнем стойностите на функцията за две стойности на <Tex>{'x'}</Tex>. Трета
            точка е добра проверка – ако не легне на правата, някъде има грешка в сметките.
          </p>
          <PointByPoint f={x => 2 * x + 1} xs={[-3, -1, 0, 1, 2]} formula="2x + 1" />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Взаимно положение на две прави</h2>
          <p className={`${text} mb-4`}>
            Две прави <Tex>{'y = a_1x + b_1'}</Tex> и <Tex>{'y = a_2x + b_2'}</Tex> се сравняват по наклоните си. Еднакъв наклон означава еднаква посока, т.е. правите са
            успоредни или съвпадат.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {positions.map(([cond, name, desc]) => (
              <div key={cond} className={card}>
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100"><MathText>{name}</MathText></p>
                  <p className="font-mono text-sm text-blue-700 dark:text-blue-300"><MathText>{cond}</MathText></p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400"><MathText>{desc}</MathText></p>
              </div>
            ))}
          </div>
          <Theorem
            title="Пресечна точка на две прави"
            description="Координатите на общата точка на две прави са решението на системата от двете уравнения. Приравняваме $a_1x + b_1 = a_2x + b_2$, намираме $x$ и после $y$."
            graphic={<TwoLines />}
          />
          <Example
            description="Намери пресечната точка на правите $y = x + 1$ и $y = -2x + 7$."
            steps={['$x + 1 = -2x + 7$', '$3x = 6 \\Rightarrow x = 2$', '$y = 2 + 1 = 3$', 'Пресечната точка е $(2; 3)$.']}
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
            description="Величините $y$ и $x$ са правопропорционални, ако $y = kx$ ($k \ne 0$). Графиката е права през началото на координатната система. Ако $x$ се увеличи $n$ пъти, и $y$ се увеличава $n$ пъти; отношението $\frac{y}{x} = k$ е постоянно."
          />
          <p className={`${text} mb-4`}>
            Цената на плодове по 3 € за килограм (<Tex>{'y = 3x'}</Tex>) е такава функция, а цената на такси с начална такса – не е, защото при <Tex>{'x = 0'}</Tex> вече
            плащаш. Линейната функция <Tex>{'y = ax + b'}</Tex> е пропорционалност само при <Tex>{'b = 0'}</Tex>.
          </p>
          <Theorem
            type="definition"
            title="Обратна пропорционалност"
            description="Величините $y$ и $x$ са обратно пропорционални, ако $y = \frac{k}{x}$ ($k \ne 0$, $x \ne 0$), т.е. произведението $x \cdot y = k$ е постоянно. Ако $x$ се увеличи $n$ пъти, $y$ намалява $n$ пъти. Графиката не е права, а крива – хипербола."
          />
          <InverseLab />
          <Example
            description="Път от 120 km може да се измине с различни скорости. Как зависи времето от скоростта?"
            steps={['$t = 120 / v$ – времето е обратно пропорционално на скоростта', '$v = 40\\ \\mathrm{km/h} \\Rightarrow t = 3\\ \\mathrm{h}$; $v = 60\\ \\mathrm{km/h} \\Rightarrow t = 2\\ \\mathrm{h}$; $v = 120\\ \\mathrm{km/h} \\Rightarrow t = 1\\ \\mathrm{h}$', 'Скоростта се удвои (от 60 на 120) – времето намаля наполовина']}
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
              ['Наклон „наобратно“', '$a = \\Delta x / \\Delta y$', '$a = \\Delta y / \\Delta x$ – промяната на $y$ върху промяната на $x$'],
              ['Объркани пресечни точки', '$y = 3x - 6$ пресича Ox в $(0; -6)$', '$(0; -6)$ е на оста Oy; с Ox: $3x - 6 = 0 \\Rightarrow (2; 0)$'],
              ['Знакът на $b$', '$y = 2x - 3$ пресича Oy в $(0; 3)$', 'пресича Oy в $(0; -3)$'],
              ['Вертикалната права', '$x = 2$ е линейна функция', '$x = 2$ не е функция – на $x = 2$ съответстват безброй стойности на $y$'],
              ['Всяка линейна функция е пропорционалност', '$y = 2x + 3$ е права пропорционалност', 'само при $b = 0$; тук $\\frac{y}{x}$ не е постоянно'],
              ['„Колкото повече, толкова по-малко“ значи обратна пропорционалност', '$y = 10 - x$ е обратна пропорционалност', 'обратна е само ако $x \\cdot y$ е постоянно'],
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
              <Task id="a1" number={1} color="border-green-500" question="Дадена е функцията $f(x) = -3x + 6$. Намери $f(-2)$, нулата на функцията и пресечната точка с оста Oy. Растяща ли е?">
                <p><Tex>{'f(-2) = -3 \\cdot (-2) + 6 = 12'}</Tex></p>
                <p>Нула: <Tex>{'-3x + 6 = 0 \\Rightarrow x = 2'}</Tex>; пресечна точка с Oy: <Tex>{'(0; 6)'}</Tex></p>
                <p><Tex>{'a = -3 < 0'}</Tex> – функцията е намаляваща.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намери уравнението на правата през точките (1; 3) и (3; 7).">
                <p><Tex>{'a = \\frac{7 - 3}{3 - 1} = 2'}</Tex></p>
                <p><Tex>{'3 = 2 \\cdot 1 + b \\Rightarrow b = 1'}</Tex></p>
                <p><Tex>{'y = 2x + 1'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Лежи ли точката $M(4;\ -5)$ на правата $y = -2x + 3$? А точката $N(-1;\ 4)$?">
                <p><Tex>{'M'}</Tex>: <Tex>{'-2 \\cdot 4 + 3 = -5'}</Tex> ✓ – лежи.</p>
                <p><Tex>{'N'}</Tex>: <Tex>{'-2 \\cdot (-1) + 3 = 5 \\ne 4'}</Tex> – не лежи.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="За кое $a$ правата $y = (a - 1)x + 3$ е успоредна на $y = 2x - 7$? А перпендикулярна на нея?">
                <p>Успоредни: еднакъв наклон <Tex>{'\\Rightarrow a - 1 = 2 \\Rightarrow a = 3'}</Tex> (и <Tex>{'3 \\ne -7'}</Tex>, значи не съвпадат).</p>
                <p>Перпендикулярни: <Tex>{'(a - 1) \\cdot 2 = -1 \\Rightarrow a - 1 = -\\tfrac{1}{2} \\Rightarrow a = \\tfrac{1}{2}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="План А струва 8 € месечно и 0,10 € на минута, план Б – 0,30 € на минута без такса. При колко минути двата плана струват еднакво? Кой е по-изгоден при 60 минути?">
                <p><Tex>{'8 + 0{,}1x = 0{,}3x \\Rightarrow 0{,}2x = 8 \\Rightarrow x = 40'}</Tex> минути</p>
                <p>При 60 минути: А = 8 + 6 = 14 €, Б = 18 € ⇒ А е по-изгоден.</p>
                <p>Над 40 минути печели А (по-малката цена на минута), под 40 – Б (няма такса).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Намери лицето на триъгълника, който правата $y = 2x - 4$ отсича от координатните оси.">
                <p>Пресечни точки: с Ox – <Tex>{'(2; 0)'}</Tex>, с Oy – <Tex>{'(0; -4)'}</Tex>.</p>
                <p>Триъгълникът е правоъгълен с катети 2 и 4.</p>
                <p><Tex>{'S = \\frac{2 \\cdot 4}{2} = 4'}</Tex> кв. единици.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="През точката (2; 1) минава права, която заедно с положителните координатни полуоси образува триъгълник с лице 4. Намери уравнението ѝ.">
                <p><Tex>{'y = kx + b'}</Tex>, като <Tex>{'1 = 2k + b \\Rightarrow b = 1 - 2k'}</Tex>. За триъгълник в първи квадрант: <Tex>{'b > 0'}</Tex> и <Tex>{'k < 0'}</Tex>.</p>
                <p>Пресечна точка с Ox: <Tex>{'x = -\\frac{b}{k}'}</Tex>. Лице: <Tex>{'S = \\tfrac{1}{2} \\cdot b \\cdot \\left(-\\frac{b}{k}\\right) = 4 \\Rightarrow b^2 = -8k'}</Tex></p>
                <p><Tex>{'(1 - 2k)^2 = -8k \\Rightarrow 4k^2 + 4k + 1 = 0 \\Rightarrow (2k + 1)^2 = 0 \\Rightarrow k = -\\tfrac{1}{2}'}</Tex></p>
                <p><Tex>{'b = 2'}</Tex>, правата е <Tex>{'y = -\\tfrac{1}{2}x + 2'}</Tex> – единствената. (Всъщност 4 е най-малкото възможно лице за права през <Tex>{'(2; 1)'}</Tex>!)</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Начертай графиката на $y = |x - 1| + |x + 1|$. Коя е най-малката стойност на функцията и при кои $x$ се достига?">
                <p><Tex>{'x \\le -1'}</Tex>: <Tex>{'y = (1 - x) + (-x - 1) = -2x'}</Tex></p>
                <p><Tex>{'-1 \\le x \\le 1'}</Tex>: <Tex>{'y = (1 - x) + (x + 1) = 2'}</Tex></p>
                <p><Tex>{'x \\ge 1'}</Tex>: <Tex>{'y = (x - 1) + (x + 1) = 2x'}</Tex></p>
                <p>Графиката е „корито“ от три отсечки. Най-малката стойност е 2 – за всяко <Tex>{'x'}</Tex> от <Tex>{'[-1;\\ 1]'}</Tex> (сборът от разстоянията до −1 и до 1).</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Намери всички линейни функции $f(x) = ax + b$, за които $f(f(x)) = 4x + 3$ за всяко $x$.">
                <p><Tex>{'f(f(x)) = a(ax + b) + b = a^2x + ab + b'}</Tex></p>
                <p>Сравняваме коефициентите: <Tex>{'a^2 = 4'}</Tex> и <Tex>{'ab + b = 3'}</Tex></p>
                <p><Tex>{'a = 2'}</Tex>: <Tex>{'3b = 3 \\Rightarrow b = 1 \\Rightarrow f(x) = 2x + 1'}</Tex></p>
                <p><Tex>{'a = -2'}</Tex>: <Tex>{'-b = 3 \\Rightarrow b = -3 \\Rightarrow f(x) = -2x - 3'}</Tex></p>
                <p>Проверка: <Tex>{'-2(-2x - 3) - 3 = 4x + 3'}</Tex> ✓</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Функция: на всяко <Tex>{'x'}</Tex> – точно едно <Tex>{'y'}</Tex>; линейна: <Tex>{'y = ax + b'}</Tex>, графиката е права</li>
              <li>✓ Наклон <Tex>{'a = \\frac{\\Delta y}{\\Delta x}'}</Tex>: <Tex>{'a > 0'}</Tex> – растяща, <Tex>{'a < 0'}</Tex> – намаляваща, <Tex>{'a = 0'}</Tex> – константна</li>
              <li>✓ Пресечни точки: <Tex>{'(0; b)'}</Tex> с Oy и <Tex>{'\\left(-\\frac{b}{a}; 0\\right)'}</Tex> с Ox</li>
              <li>✓ Успоредни: <Tex>{'a_1 = a_2'}</Tex>; перпендикулярни: <Tex>{'a_1 \\cdot a_2 = -1'}</Tex>; пресечна точка – от системата</li>
              <li>✓ Права пропорционалност: <Tex>{'y = kx'}</Tex>; обратна: <Tex>{'y = \\frac{k}{x}'}</Tex>, <Tex>{'x \\cdot y = \\mathrm{const}'}</Tex> (хипербола)</li>
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
