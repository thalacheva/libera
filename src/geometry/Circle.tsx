import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { CyclicQuadLab } from './CyclicQuadLab';
import { InscribedAngle } from './InscribedAngle';
import { InteractiveCircle } from './InteractiveCircle';
import { PiLab } from './PiLab';
import { TangentLab } from './TangentLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const elements = [
  ['Хорда', 'отсечка, която свързва две точки от окръжността'],
  ['Диаметър', 'хорда, която минава през центъра; $d = 2r$'],
  ['Дъга', 'частта от окръжността между две нейни точки'],
  ['Секуща', 'права, която пресича окръжността в две точки'],
  ['Допирателна', 'права с точно една обща точка с окръжността; перпендикулярна е на радиуса в допирната точка'],
  ['Централен ъгъл', 'ъгъл с връх в центъра; рамената му са радиуси'],
];

const formulas = [
  ['Дължина на окръжност', '$C = 2\\pi r = \\pi d$'],
  ['Лице на кръг', '$S = \\pi r^2$'],
  ['Дължина на дъга ($\\alpha$ в градуси)', '$l = \\frac{\\pi r\\alpha}{180^\\circ}$'],
  ['Лице на сектор ($\\alpha$ в градуси)', '$S = \\frac{\\pi r^2\\alpha}{360^\\circ} = \\frac{l \\cdot r}{2}$'],
  ['Дължина на дъга ($\\alpha$ в радиани)', '$l = \\alpha \\cdot r$'],
  ['Градуси ↔ радиани', '$\\alpha(\\mathrm{rad}) = \\alpha(^\\circ) \\cdot \\frac{\\pi}{180^\\circ}$'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🍕 Пицата',
    problem: 'Кое е повече пица: една с диаметър 45 cm или две с диаметър по 30 cm?',
    solution: ['Голяма: $r = 22{,}5 \\to S = \\pi \\cdot 22{,}5^2 \\approx 1590\\ \\mathrm{cm}^2$', 'Малка: $r = 15 \\to S = \\pi \\cdot 15^2 \\approx 707\\ \\mathrm{cm}^2$', 'Две малки: $2 \\cdot 707 \\approx 1414\\ \\mathrm{cm}^2$'],
    answer: 'една голяма – с около $176\\ \\mathrm{cm}^2$ повече',
    check: [176.7],
    ask: ['разлика в лицата, cm²'],
  },
  {
    title: '🚲 Колелото',
    problem: 'Колело на велосипед има диаметър 70 cm. Колко пълни оборота прави, докато велосипедът измине 1 km?',
    solution: ['$C = \\pi d = \\pi \\cdot 0{,}7 \\approx 2{,}199\\ \\mathrm{m}$', '$1\\ \\mathrm{km} = 1000\\ \\mathrm{m}$', '$1000 / 2{,}199 \\approx 454{,}7$ – пълните обороти са 454'],
    answer: '454 пълни оборота ($\\approx 454{,}7$)',
    check: [454.7],
    ask: ['пълни оборота'],
  },
  {
    title: '🕰️ Часовникът',
    problem: 'Минутната стрелка на часовник е дълга 10 cm. Какъв път изминава върхът ѝ за 20 минути?',
    solution: ['За 60 минути върхът описва цялата окръжност.', '20 минути $= \\frac{1}{3}$ от пълния оборот $= 120^\\circ$', '$l = 2\\pi \\cdot 10 / 3 \\approx 20{,}9$'],
    answer: 'около 20,9 cm',
    check: [20.94],
    ask: ['път, cm'],
  },
  {
    title: '🏟️ Пистата',
    problem: 'Лекоатлетическа писта има две прави по 84,4 m и два полукръга с радиус 36,8 m (по линията на бягане). Колко е дълга една обиколка?',
    solution: ['Двата полукръга правят една цяла окръжност: $C = 2\\pi \\cdot 36{,}8 \\approx 231{,}2\\ \\mathrm{m}$', 'Правите: $2 \\cdot 84{,}4 = 168{,}8\\ \\mathrm{m}$', '$231{,}2 + 168{,}8 = 400\\ \\mathrm{m}$'],
    answer: '400 m',
    check: [400],
    ask: ['обиколка, m'],
  },
  {
    title: '🌳 Стволът',
    problem: 'Обиколката на ствол на дърво е $157\\ \\mathrm{cm}$. Колко е диаметърът му ($\\pi \\approx 3{,}14$)?',
    solution: ['$C = \\pi d$', '$d = C / \\pi = 157 / 3{,}14$', '$d = 50$'],
    answer: '50 cm',
    check: [50],
    ask: ['диаметър, cm'],
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
    answers: ['$3\\pi\\ \\mathrm{cm}^2$', '$6\\pi\\ \\mathrm{cm}^2$', '$9\\pi\\ \\mathrm{cm}^2$', '$18\\pi\\ \\mathrm{cm}^2$'],
    correctAnswer: '$9\\pi\\ \\mathrm{cm}^2$',
  },
  {
    question: 'Колко е дължината на окръжност с диаметър 10 cm?',
    answers: ['$5\\pi\\ \\mathrm{cm}$', '$10\\pi\\ \\mathrm{cm}$', '$20\\pi\\ \\mathrm{cm}$', '$25\\pi\\ \\mathrm{cm}$'],
    correctAnswer: '$10\\pi\\ \\mathrm{cm}$',
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
  {
    question: 'Какъв ъгъл сключва допирателната с радиуса в допирната точка?',
    answers: ['45°', '60°', '90°', 'Зависи от радиуса'],
    correctAnswer: '90°',
  },
  {
    question: 'В четириъгълник, вписан в окръжност, $\\angle A = 70^\\circ$. Колко е $\\angle C$?',
    answers: ['70°', '110°', '140°', '290°'],
    correctAnswer: '110°',
  },
];

export function Circle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Окръжност и кръг</h1>

        <div className="bg-gradient-to-br from-blue-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⭕ Сиракуза, 212 г. пр.н.е. Римляните превземат града след две години обсада, а 75-годишният Архимед чертае в пясъка окръжности.
            Според легендата, когато римски войник стъпва върху чертежа, старецът извиква „Не пипай кръговете ми!“ – и плаща с живота си.
            Архимед е първият, който пресмята <Tex>{'\\pi'}</Tex> с гарантирана точност, като вписва и описва около окръжност многоъгълници с 96 страни. На
            гроба му по негово желание е изобразено кълбо, вписано в цилиндър – откритието, с което се гордее най-много.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Окръжност или кръг?</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Опъваме въже около Земята по екватора (около 40 000 km). След това го удължаваме с{' '}
              <strong>само 1 метър</strong> и го повдигаме равномерно над земята. Може ли котка да мине под въжето? Предположи, а отговорът
              ще намериш в т. 4.
            </p>
          </div>
          <p className={`${text} mb-4`}>В ежедневието двете думи често се бъркат, но в геометрията означават различни неща.</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className={`${card} flex gap-4 items-center`}>
              <svg viewBox="0 0 80 80" className="w-16 h-16 flex-shrink-0">
                <circle cx="40" cy="40" r="32" className="fill-none stroke-blue-500" strokeWidth="4" />
              </svg>
              <div className={text}>
                <p className="font-semibold">Окръжност</p>
                <p className="text-sm">Само „линията“ – всички точки, които са на разстояние точно <Tex>{'r'}</Tex> от центъра <Tex>{'O'}</Tex>.</p>
              </div>
            </div>
            <div className={`${card} flex gap-4 items-center`}>
              <svg viewBox="0 0 80 80" className="w-16 h-16 flex-shrink-0">
                <circle cx="40" cy="40" r="32" className="fill-blue-500/30 stroke-blue-500" strokeWidth="4" />
              </svg>
              <div className={text}>
                <p className="font-semibold">Кръг</p>
                <p className="text-sm">Окръжността заедно с вътрешността ѝ – всички точки на разстояние не повече от <Tex>{'r'}</Tex>.</p>
              </div>
            </div>
          </div>
          <p className={`${text} mb-4`}>
            Затова казваме <strong>дължина на окръжността</strong> (тя е линия), но <strong>лице на кръга</strong> (той е част от
            равнината).
          </p>
          <Theorem
            type="definition"
            title="Център, радиус и диаметър"
            description="Окръжност с център $O$ и радиус $r$ е множеството от всички точки в равнината, които са на разстояние $r$ от $O$. Радиус се нарича и всяка отсечка от центъра до точка от окръжността. Диаметърът е отсечка през центъра с краища върху окръжността; той е два пъти по-дълъг от радиуса: $d = 2r$."
            graphic={<InteractiveCircle type="basic" />}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Елементи на окръжността</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-6 text-gray-700 dark:text-gray-300">
            {elements.map(([name, desc]) => (
              <div key={name} className={card}>
                <p className="font-semibold"><MathText>{name}</MathText></p>
                <p className="text-sm text-gray-600 dark:text-gray-400"><MathText>{desc}</MathText></p>
              </div>
            ))}
          </div>
          <Theorem
            title="Свойства на хордата"
            description="Диаметърът е най-дългата хорда. Перпендикулярът от центъра към хорда я разполовява. Равни хорди са на равни разстояния от центъра."
            graphic={<InteractiveCircle type="chord" />}
          />
          <Example
            description="Хорда с дължина 16 cm е на 6 cm от центъра на окръжността. Колко е радиусът?"
            steps={['Перпендикулярът от центъра разполовява хордата: половината е 8 cm.', 'Радиусът, половината хорда и разстоянието образуват правоъгълен триъгълник.', '$r^2 = 8^2 + 6^2 = 100 \\Rightarrow r = 10\\ \\mathrm{cm}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Допирателна</h2>
          <Theorem
            title="Допирателна и радиус"
            description="Допирателната към окръжност е перпендикулярна на радиуса в допирната точка. От точка $P$ извън окръжността минават точно две допирателни и отсечките от $P$ до допирните точки са равни: $PT_1 = PT_2 = \sqrt{OP^2 - r^2}$."
          />
          <TangentLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Числото <Tex>{'\\pi'}</Tex>, дължина и лице</h2>
          <p className={`${text} mb-4`}>
            Колкото и голяма или малка да е една окръжност, ако разделим дължината ѝ на диаметъра, получаваме едно и също число –{' '}
            <strong><Tex>{'\\pi \\approx 3{,}14159'}</Tex></strong>. Цифрите му след десетичната запетая продължават безкрайно, без да се повтарят. Как да го пресметнем?
            Ето метода на Архимед:
          </p>
          <PiLab />
          <Theorem
            title="Дължина на окръжността и лице на кръга"
            description="Дължината на окръжност с радиус $r$ е $C = 2\pi r = \pi d$. Лицето на кръг с радиус $r$ е $S = \pi r^2$."
            graphic={<InteractiveCircle type="area-circumference" />}
          />
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded mb-6">
            <p className="font-semibold mb-1 text-gray-800 dark:text-gray-100">🐈 Отговор на загадката</p>
            <p className={text}>
              Ако радиусът е <Tex>{'R'}</Tex>, дължината на въжето е <Tex>{'2\\pi R'}</Tex>. Удълженото въже е <Tex>{'2\\pi R + 1'}</Tex> и лежи на окръжност с радиус <Tex>{'R + x'}</Tex>. Тогава <Tex>{'2\\pi(R + x) = 2\\pi R + 1'}</Tex>, откъдето <Tex>{'x = \\frac{1}{2\\pi} \\approx 0{,}16\\ \\mathrm{m}'}</Tex>. Въжето се вдига с около <strong>16 cm</strong> –
              котката минава спокойно! Изненадващото е, че отговорът изобщо не зависи от размера на Земята: същото се получава и около топка за
              тенис.
            </p>
          </div>
          <Example
            description="Дължината на окръжност е 31,4 cm. Намери радиуса и лицето на кръга ($\pi \approx 3{,}14$)."
            steps={['$C = 2\\pi r \\to r = \\frac{C}{2\\pi} = 31{,}4 / 6{,}28 = 5\\ \\mathrm{cm}$', '$S = \\pi r^2 = 3{,}14 \\cdot 5^2 = 3{,}14 \\cdot 25 = 78{,}5\\ \\mathrm{cm}^2$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Дъга, сектор и радиан</h2>
          <p className={`${text} mb-4`}>Дъгата и секторът са „парче“ от окръжността и от кръга. Ако централният ъгъл е <Tex>{'\\alpha'}</Tex>, то парчето е <Tex>{'\\frac{\\alpha}{360^\\circ}'}</Tex> от цялото.</p>
          <Theorem title="Дължина на дъга" description="Дъга с централен ъгъл $\alpha$ (в градуси) има дължина $l = 2\pi r \cdot \frac{\alpha}{360^\circ} = \frac{\pi r\alpha}{180^\circ}$." graphic={<InteractiveCircle type="arc" />} />
          <Theorem
            title="Лице на сектор"
            description="Секторът е частта от кръга между два радиуса и дъгата между тях. При централен ъгъл $\alpha$ (в градуси) лицето му е $S = \pi r^2 \cdot \frac{\alpha}{360^\circ}$. Може да се пресметне и чрез дължината на дъгата: $S = l \cdot r / 2$."
            graphic={<InteractiveCircle type="sector" />}
          />
          <Theorem
            type="definition"
            title="Радиан"
            description="Един радиан е централният ъгъл, чиято дъга е равна по дължина на радиуса. Пълният ъгъл е $2\pi$ радиана $= 360^\circ$, затова $1\ \mathrm{rad} \approx 57{,}3^\circ$ и $1^\circ = \frac{\pi}{180}\ \mathrm{rad} \approx 0{,}01745\ \mathrm{rad}$. С радиани формулата за дъга става съвсем проста: $l = \alpha \cdot r$."
            graphic={<InteractiveCircle type="radian" />}
          />
          <Example
            description="Окръжност има радиус 6 cm. Намери дължината на дъга и лицето на сектор с централен ъгъл 60°."
            steps={['60° е $\\frac{60}{360} = \\frac{1}{6}$ от пълния ъгъл.', 'Дъга: $l = 2\\pi \\cdot 6 / 6 = 2\\pi \\approx 6{,}28\\ \\mathrm{cm}$', 'Сектор: $S = \\pi \\cdot 6^2 / 6 = 6\\pi \\approx 18{,}85\\ \\mathrm{cm}^2$', 'Проверка: $S = l \\cdot r / 2 = 2\\pi \\cdot 6 / 2 = 6\\pi$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Вписан ъгъл и вписан четириъгълник</h2>
          <p className={`${text} mb-4`}>
            Ъгъл, чийто връх е върху окръжността, а рамената му са хорди, се нарича <strong>вписан ъгъл</strong>. Той „гледа“ към дъгата
            между рамената си.
          </p>
          <Theorem
            title="Теорема за вписания ъгъл"
            description="Вписаният ъгъл е равен на половината от централния ъгъл, който се опира на същата дъга. Следствия: вписаните ъгли, които се опират на една и съща дъга, са равни; всеки ъгъл, вписан в полуокръжност, е прав (теорема на Талес)."
            graphic={<InscribedAngle />}
          />
          <Theorem
            title="Вписан четириъгълник"
            description="Ако четириъгълник е вписан в окръжност (четирите му върха са върху нея), сборът на срещуположните му ъгли е 180°. Вярно е и обратното: ако $\angle A + \angle C = 180^\circ$, около четириъгълника може да се опише окръжност."
          />
          <CyclicQuadLab />
          <p className={`${text} mb-4`}>
            Около всеки триъгълник може да се опише окръжност – центърът ѝ е пресечната точка на симетралите. Във всеки триъгълник може да се
            впише окръжност – центърът ѝ е пресечната точка на ъглополовящите (виж урока „Триъгълник“). При четириъгълниците това не е винаги
            възможно: правоъгълникът може да се опише с окръжност, а ромбът, който не е квадрат – не.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Всички формули на едно място</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-gray-700/60 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {formulas.map(([name, formula]) => (
              <div key={name} className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3">
                <span><MathText>{name}</MathText></span>
                <span className="font-mono text-blue-700 dark:text-blue-300"><MathText>{formula}</MathText></span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Диаметър вместо радиус', '$d = 10 \\to S = \\pi \\cdot 10^2 = 100\\pi$', '$r = 5 \\to S = \\pi \\cdot 5^2 = 25\\pi$'],
              ['Объркани формули', '$C = \\pi r^2,\\ S = 2\\pi r$', '$C = 2\\pi r$ (линия), $S = \\pi r^2$ (площ)'],
              ['Градуси във формула за радиани', '$l = \\alpha \\cdot r = 60 \\cdot 6 = 360$', '$60^\\circ = \\frac{\\pi}{3}\\ \\mathrm{rad} \\to l = \\frac{\\pi}{3} \\cdot 6 = 2\\pi$'],
              ['„Лице на окръжност“', 'окръжността има лице', 'лице има кръгът; окръжността има дължина'],
              ['Вписан = централен ъгъл', 'вписаният ъгъл на дъга 80° е 80°', 'вписаният е половината: 40°'],
              ['Всеки четириъгълник е вписан', 'около всеки четириъгълник има окръжност', 'само ако срещуположните ъгли допълват до 180°'],
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
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={circleQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Окръжност има радиус 7 cm. Намери дължината ѝ и лицето на кръга ($\pi \approx \frac{22}{7}$).">
                <p><Tex>{'C = 2\\pi r = 2 \\cdot \\frac{22}{7} \\cdot 7 = 44\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'S = \\pi r^2 = \\frac{22}{7} \\cdot 49 = 154\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намери дължината на дъгата и лицето на сектора с централен ъгъл 120° в окръжност с радиус 9 cm.">
                <p>120° е <Tex>{'\\frac{1}{3}'}</Tex> от пълния ъгъл.</p>
                <p><Tex>{'l = 2\\pi \\cdot 9 / 3 = 6\\pi \\approx 18{,}8\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'S = \\pi \\cdot 81 / 3 = 27\\pi \\approx 84{,}8\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Вписан ъгъл се опира на дъга от 100°. Колко е той? Колко е ъгъл, вписан в полуокръжност?">
                <p>Вписаният ъгъл е половината от централния: <Tex>{'100^\\circ / 2 = 50^\\circ'}</Tex>.</p>
                <p>Полуокръжността е дъга от <Tex>{'180^\\circ'}</Tex> <Tex>{'\\Rightarrow'}</Tex> вписаният ъгъл е <Tex>{'90^\\circ'}</Tex> (Талес).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Точка $P$ е на 13 cm от центъра на окръжност с радиус 5 cm. Колко е дълга допирателната от $P$ до окръжността?">
                <p>Радиусът е перпендикулярен на допирателната ⇒ правоъгълен триъгълник OTP с хипотенуза OP.</p>
                <p><Tex>{'PT = \\sqrt{13^2 - 5^2} = \\sqrt{144} = 12\\ \\mathrm{cm}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Четириъгълникът $ABCD$ е вписан в окръжност. $\angle A = 75^\circ$, $\angle B = 110^\circ$. Намери $\angle C$ и $\angle D$.">
                <p>Срещуположните ъгли допълват до 180°:</p>
                <p><Tex>{'\\angle C = 180^\\circ - 75^\\circ = 105^\\circ'}</Tex>; <Tex>{'\\angle D = 180^\\circ - 110^\\circ = 70^\\circ'}</Tex></p>
                <p>Проверка: <Tex>{'75^\\circ + 110^\\circ + 105^\\circ + 70^\\circ = 360^\\circ'}</Tex> ✓</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Правоъгълен триъгълник има катети 6 и 8. Намери радиусите на описаната и на вписаната окръжност.">
                <p>Хипотенуза <Tex>{'c = 10'}</Tex>. Центърът на описаната окръжност е средата на хипотенузата (Талес) <Tex>{'\\Rightarrow R = \\frac{c}{2} = 5'}</Tex>.</p>
                <p>Вписаната: <Tex>{'r = \\frac{S}{p} = \\frac{24}{12} = 2'}</Tex> (или <Tex>{'r = \\frac{a + b - c}{2} = \\frac{6 + 8 - 10}{2} = 2'}</Tex>).</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Две концентрични окръжности образуват пръстен. Хорда на голямата окръжност, която се допира до малката, е дълга 10 cm. Намери лицето на пръстена.">
                <p>Нека радиусите са <Tex>{'R'}</Tex> и <Tex>{'r'}</Tex>. Допирателната към малката е перпендикулярна на радиуса <Tex>{'r'}</Tex> и разполовява хордата.</p>
                <p>Питагор: <Tex>{'R^2 = r^2 + 5^2 \\Rightarrow R^2 - r^2 = 25'}</Tex></p>
                <p><Tex>{'S = \\pi R^2 - \\pi r^2 = \\pi(R^2 - r^2) = 25\\pi \\approx 78{,}5\\ \\mathrm{cm}^2'}</Tex></p>
                <p>Изненада: отговорът не зависи от самите радиуси!</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Върху катетите на правоъгълен триъгълник с катети 6 и 8 са построени навън полукръгове, а около триъгълника е описана окръжност. Намери общото лице на двата „полумесеца“ – частите от малките полукръгове извън голямата окръжност.">
                <p>Полукръговете върху катетите: <Tex>{'\\pi \\cdot \\frac{3^2}{2} + \\pi \\cdot \\frac{4^2}{2} = 12{,}5\\pi'}</Tex>. Полукръгът върху хипотенузата: <Tex>{'\\pi \\cdot \\frac{5^2}{2} = 12{,}5\\pi'}</Tex> – същото (Питагор!).</p>
                <p>Полумесеците = (малките полукръгове) − (полукръга върху хипотенузата) + (триъгълника).</p>
                <p><Tex>{'= 12{,}5\\pi - 12{,}5\\pi + 24 = 24'}</Tex> – точно колкото лицето на триъгълника!</p>
                <p>Това са „луните на Хипократ“ (V век пр.н.е.) – първите криволинейни фигури, чието лице е пресметнато точно.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="От точка $P$ извън окръжност са прекарани допирателни $PA$ и $PB$, а $\angle APB = 60^\circ$. Радиусът е 6 cm. Намери $OP$, $PA$ и дължината на по-малката дъга $AB$.">
                <p><Tex>{'OA \\perp PA'}</Tex> и <Tex>{'OB \\perp PB \\Rightarrow'}</Tex> в четириъгълника <Tex>{'OAPB'}</Tex>: <Tex>{'\\angle AOB = 360^\\circ - 90^\\circ - 90^\\circ - 60^\\circ = 120^\\circ'}</Tex>.</p>
                <p><Tex>{'OP'}</Tex> е ъглополовяща: <Tex>{'\\angle APO = 30^\\circ \\Rightarrow OP = 2 \\cdot OA = 12\\ \\mathrm{cm}'}</Tex> (катет срещу 30°), <Tex>{'PA = \\sqrt{144 - 36} = 6\\sqrt{3} \\approx 10{,}4\\ \\mathrm{cm}'}</Tex></p>
                <p>Дъгата <Tex>{'AB'}</Tex> (120°): <Tex>{'l = 2\\pi \\cdot 6 / 3 = 4\\pi \\approx 12{,}6\\ \\mathrm{cm}'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Окръжността е линия (дължина <Tex>{'C = 2\\pi r'}</Tex>), кръгът – част от равнината (лице <Tex>{'S = \\pi r^2'}</Tex>)</li>
              <li>✓ Перпендикулярът от центъра разполовява хордата; допирателната е перпендикулярна на радиуса</li>
              <li>✓ Допирателните от външна точка са равни: <Tex>{'PT = \\sqrt{OP^2 - r^2}'}</Tex></li>
              <li>✓ <Tex>{'\\pi \\approx 3{,}14159\\ldots'}</Tex> – Архимед го „притиска“ между вписани и описани многоъгълници</li>
              <li>✓ Дъга: <Tex>{'l = \\frac{\\pi r\\alpha}{180^\\circ}'}</Tex>; сектор: <Tex>{'S = \\frac{\\pi r^2\\alpha}{360^\\circ}'}</Tex>; радиан: <Tex>{'l = \\alpha \\cdot r'}</Tex></li>
              <li>✓ Вписаният ъгъл е половината от централния; вписан четириъгълник: <Tex>{'\\angle A + \\angle C = 180^\\circ'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Около 240 г. пр.н.е. Ератостен измерва обиколката на Земята само с формулата за дължина на дъга. В Сиена (днешен Асуан) по пладне
              на лятното слънцестоене Слънцето е точно в зенита, а в Александрия в същия момент сянката на вертикален прът показва ъгъл от около
              7,2° – това е <Tex>{'\\frac{1}{50}'}</Tex> от пълния ъгъл. Щом разстоянието между двата града е около 5000 стадия, цялата обиколка трябва да е 50 пъти
              по-голяма – 250 000 стадия. Според това каква дължина приемаме за стадий, резултатът е много близо до истинските 40 000 km.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
