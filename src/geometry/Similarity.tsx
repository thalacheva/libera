import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { HomothetyLab } from './HomothetyLab';
import { RightTriangleLab } from './RightTriangleLab';
import { ThalesLab } from './ThalesLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🌳 Сянката на дървото',
    problem: 'Човек с ръст 1,80 m хвърля сянка 1,20 m. В същия момент сянката на дърво е 8 m. Колко е високо дървото?',
    solution: [
      'Слънчевите лъчи са успоредни, затова триъгълниците „предмет – сянка – лъч“ са подобни (ЪЪ: прав ъгъл и еднакъв ъгъл на лъчите).',
      '$h : 8 = 1{,}8 : 1{,}2$',
      '$h = 8 \\cdot 1{,}5 = 12$',
    ],
    answer: '12 m',
    check: [12],
    ask: ['височина, m'],
  },
  {
    title: '🗺️ Карта',
    problem: 'Мащабът на туристическа карта е $1 : 25\\,000$. Разстоянието между две хижи на картата е 6 cm. Колко километра е то в действителност?',
    solution: ['$1\\ \\mathrm{cm}$ на картата е $25\\,000\\ \\mathrm{cm} = 250\\ \\mathrm{m}$ в действителност.', '$6 \\cdot 250\\ \\mathrm{m} = 1500\\ \\mathrm{m}$'],
    answer: '1,5 km',
    check: [1.5],
    ask: ['разстояние, km'],
  },
  {
    title: '🪞 Огледало',
    problem:
      'Огледало лежи на земята на 6 m от сграда. Човек застава на 1,5 m от огледалото и вижда в него върха на сградата. Очите му са на височина 1,6 m. Колко е висока сградата?',
    solution: [
      'Ъгълът на падане е равен на ъгъла на отражение, затова двата правоъгълни триъгълника (човек – огледало и сграда – огледало) са подобни.',
      '$h : 6 = 1{,}6 : 1{,}5$',
      '$h = 6 \\cdot 1{,}6 / 1{,}5 = 6{,}4$',
    ],
    answer: '6,4 m',
    check: [6.4],
    ask: ['височина, m'],
  },
  {
    title: '🍕 Пица',
    problem: 'Голяма пица има диаметър 30 cm, а малка – 20 cm. Колко пъти голямата пица е по-голяма от малката (по лице)?',
    solution: ['Двата кръга са подобни с коефициент $k = 30 : 20 = 1{,}5$.', 'Лицата се отнасят като $k^2 = 1{,}5^2 = 2{,}25$.'],
    answer: '2,25 пъти – т.е. една голяма пица е повече от две малки',
    check: [2.25],
    ask: ['пъти'],
  },
  {
    title: '📽️ Проектор',
    problem: 'Проектор на 3 m от стената дава картина, широка 1,2 m. На какво разстояние трябва да се постави, за да е картината широка 2 m?',
    solution: ['Лъчите от обектива образуват подобни триъгълници: ширината е пропорционална на разстоянието.', '$d : 3 = 2 : 1{,}2$', '$d = 3 \\cdot 2 / 1{,}2 = 5$'],
    answer: '5 m',
    check: [5],
    ask: ['разстояние, m'],
  },
  {
    title: '🏠 Макет',
    problem: 'Макет на къща е в мащаб $1 : 50$. Покривът на макета има площ $0{,}08\\ \\mathrm{m}^2$. Колко квадратни метра керемиди са нужни за истинския покрив?',
    solution: ['Дължините се отнасят като $1 : 50$, а лицата – като $1 : 50^2 = 1 : 2500$.', '$0{,}08 \\cdot 2500 = 200$'],
    answer: '$200\\ \\mathrm{m}^2$',
    check: [200],
    ask: ['площ, m²'],
  },
];

// ---------- Тест ----------

const similarityQuiz: Question[] = [
  {
    question: 'Триъгълник $A_1B_1C_1$ е подобен на $ABC$ с коефициент $k = 3$ ($A_1B_1 = 3 \\cdot AB$). Ако $AB = 4\\ \\mathrm{cm}$, колко е $A_1B_1$?',
    answers: ['$\\frac{4}{3}\\ \\mathrm{cm}$', '$7\\ \\mathrm{cm}$', '$12\\ \\mathrm{cm}$', '$36\\ \\mathrm{cm}$'],
    correctAnswer: '$12\\ \\mathrm{cm}$',
  },
  {
    question: 'Кое от изброените НЕ е признак за подобие на триъгълници?',
    answers: ['Два равни ъгъла', 'Две пропорционални страни и равен ъгъл между тях', 'Три пропорционални страни', 'Две пропорционални страни и равен ъгъл срещу едната'],
    correctAnswer: 'Две пропорционални страни и равен ъгъл срещу едната',
  },
  {
    question: 'Два триъгълника са подобни с коефициент 2. Колко пъти лицето на по-големия е по-голямо от лицето на по-малкия?',
    answers: ['2 пъти', '4 пъти', '8 пъти', '$\\sqrt{2}$ пъти'],
    correctAnswer: '4 пъти',
  },
  {
    question: 'Периметрите на два подобни триъгълника са 12 cm и 18 cm. Как се отнасят лицата им?',
    answers: ['$2 : 3$', '$4 : 9$', '$8 : 27$', '$\\sqrt{2} : \\sqrt{3}$'],
    correctAnswer: '$4 : 9$',
  },
  {
    question: 'В триъгълник $ABC$ точките $M \\in AB$ и $N \\in AC$ са такива, че $MN \\parallel BC$. Ако $AM = 2$, $MB = 3$ и $AN = 4$, колко е $NC$?',
    answers: ['$5$', '$6$', '$\\frac{8}{3}$', '$1{,}5$'],
    correctAnswer: '$6$',
  },
  {
    question: 'Височината към хипотенузата на правоъгълен триъгълник я дели на отсечки 4 cm и 9 cm. Колко е височината?',
    answers: ['6 cm', '6,5 cm', '13 cm', '36 cm'],
    correctAnswer: '6 cm',
  },
  {
    question: 'Кои триъгълници винаги са подобни помежду си?',
    answers: ['Всички равностранни', 'Всички равнобедрени', 'Всички правоъгълни', 'Всички тъпоъгълни'],
    correctAnswer: 'Всички равностранни',
  },
  {
    question: '$MN$ е средна отсечка в триъгълник $ABC$ ($M \\in AB$, $N \\in AC$). Каква част от лицето на $ABC$ е лицето на $AMN$?',
    answers: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{1}{4}$', '$\\frac{1}{8}$'],
    correctAnswer: '$\\frac{1}{4}$',
  },
  {
    question: 'На карта с мащаб $1 : 100\\,000$ разстоянието между две села е 3 cm. Колко е то в действителност?',
    answers: ['300 m', '3 km', '30 km', '300 km'],
    correctAnswer: '3 km',
  },
];

// ---------- Страница ----------

export function Similarity() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Подобни триъгълници</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔺 Според античните автори Талес от Милет (VI век пр.н.е.) измерил височината на Великата пирамида, без да се качва на нея. Забил
            пръчка в пясъка и изчакал момента, в който сянката на пръчката е толкова дълга, колкото самата пръчка. Тогава и сянката на
            пирамидата (мерена от центъра на основата) е равна на височината ѝ. Хитрината работи по всяко време на деня – стига да знаеш, че
            триъгълниците „предмет – сянка“ са <strong>подобни</strong>. Днес със същата идея измерваме дървета, сгради, разстояния до кораби и
            дори до звездите.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Пропорционални отсечки и мащаб</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Снимка <Tex>{'10 \\times 15\\ \\mathrm{cm}'}</Tex> е увеличена до <Tex>{'20 \\times 30\\ \\mathrm{cm}'}</Tex>. Колко пъти е по-голяма новата снимка? Ако си казал
              „два пъти“ – погледни пак: в нея се побират точно <em>четири</em> стари снимки. Защо – ще разберем в раздел 5.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Отношение и пропорционални отсечки"
            description="Отношение на две отсечки е отношението на дължините им, измерени с една и съща мярка, например $AB : CD = 6 : 4 = 3 : 2$. Отсечките $a$, $b$ и $c$, $d$ са пропорционални, ако $a : b = c : d$. В пропорцията произведението на крайните членове е равно на произведението на средните: $a \cdot d = b \cdot c$."
          />
          <p className={text}>
            Картите, чертежите и макетите са умалени копия: всички дължини са умножени по едно и също число – <strong>мащаба</strong>. Мащаб
            {' '}<Tex>{'1 : 25\\,000'}</Tex> означава, че <Tex>{'1\\ \\mathrm{cm}'}</Tex> на картата е <Tex>{'25\\,000\\ \\mathrm{cm} = 250\\ \\mathrm{m}'}</Tex> в действителност.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Теорема на Талес за пропорционалните отсечки</h2>
          <Theorem
            title="Теорема на Талес"
            description="Ако успоредни прави пресичат двете рамена на ъгъл, те отсичат върху тях пропорционални отсечки. В триъгълник: ако $M \in AB$, $N \in AC$ и $MN \parallel BC$, то $\frac{AM}{MB} = \frac{AN}{NC}$ и $\frac{AM}{AB} = \frac{AN}{AC} = \frac{MN}{BC}$. Вярно е и обратното: ако $\frac{AM}{MB} = \frac{AN}{NC}$, то $MN \parallel BC$."
          />
          <p className={text}>
            Частен случай е средната отсечка (<Tex>{'M'}</Tex> и <Tex>{'N'}</Tex> са среди на страните): тя е успоредна на <Tex>{'BC'}</Tex> и е равна на половината от нея. За нея вече
            стана дума в урока{' '}
            <Link to="/geometry/triangle" className={link}>
              Триъгълник
            </Link>
            .
          </p>
          <ThalesLab />
          <Example
            description="В триъгълник $ABC$ правата $MN \parallel BC$ ($M \in AB$, $N \in AC$). $AM = 3,\ MB = 6,\ AN = 4$ и $BC = 12$. Намерете $NC$ и $MN$."
            steps={['По теоремата на Талес: $\\frac{AM}{MB} = \\frac{AN}{NC} \\Rightarrow \\frac{3}{6} = \\frac{4}{NC} \\Rightarrow NC = 8$', '$AB = 3 + 6 = 9$, затова $\\frac{MN}{BC} = \\frac{AM}{AB} = \\frac{3}{9} = \\frac{1}{3}$', '$MN = \\frac{12}{3} = 4$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Подобни триъгълници</h2>
          <Theorem
            type="definition"
            title="Подобни триъгълници"
            description="Триъгълниците $ABC$ и $A_1B_1C_1$ са подобни ($\Delta ABC \sim \Delta A_1B_1C_1$), ако съответните им ъгли са равни ($\angle A = \angle A_1,\ \angle B = \angle B_1,\ \angle C = \angle C_1$) и съответните им страни са пропорционални: $\frac{A_1B_1}{AB} = \frac{B_1C_1}{BC} = \frac{C_1A_1}{CA} = k$. Числото $k$ се нарича коефициент на подобие."
          />
          <p className={text}>
            Подобните триъгълници имат еднаква <em>форма</em>, но могат да са с различна <em>големина</em>. При <Tex>{'k = 1'}</Tex> те са еднакви. Редът на
            буквите в записа е важен: <Tex>{'\\Delta ABC \\sim \\Delta A_1B_1C_1'}</Tex> казва кой връх на кой съответства – и така кои страни да сравняваме.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Признаци за подобие</h2>
          <p className={text}>Не е нужно да проверяваме и трите ъгъла, и трите отношения – достатъчно е едно от следните условия:</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['I. ЪЪ', 'Два ъгъла на единия триъгълник са равни на два ъгъла на другия (третите тогава също са равни).'],
              ['II. СЪС', 'Две страни на единия са пропорционални на две страни на другия и ъглите между тях са равни.'],
              ['III. ССС', 'Трите страни на единия са пропорционални на трите страни на другия.'],
            ].map(([title, body]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">{title}</p>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <Example
            description="Да проверим дали триъгълниците със страни 4, 6, 8 и 6, 9, 12 са подобни."
            steps={['Подреждаме страните по големина и делим съответните: $\\frac{6}{4} = 1{,}5$; $\\frac{9}{6} = 1{,}5$; $\\frac{12}{8} = 1{,}5$', 'Трите отношения са равни $\\Rightarrow$ подобни са по признак ССС с $k = 1{,}5$']}
          />
          <Example
            description="Диагоналите на трапец $ABCD$ ($AB \parallel CD$) се пресичат в точка $O$. $AB = 12,\ CD = 4,\ AC = 10$. Намерете $AO$ и $OC$."
            steps={[
              '$\\angle OAB = \\angle OCD$ (кръстни ъгли при $AB \\parallel CD$) и $\\angle AOB = \\angle COD$ (връхни ъгли)',
              'По признак ЪЪ: $\\Delta AOB \\sim \\Delta COD$ с $k = \\frac{AB}{CD} = 3$',
              '$AO = 3 \\cdot OC$ и $AO + OC = 10 \\Rightarrow 4 \\cdot OC = 10 \\Rightarrow OC = 2{,}5$; $AO = 7{,}5$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Периметри и лица на подобни фигури</h2>
          <Theorem
            title="Отношение на периметрите и лицата"
            description="Ако два триъгълника са подобни с коефициент $k$, то отношението на периметрите им е $k$, отношението на съответните им височини, медиани и ъглополовящи също е $k$, а отношението на лицата им е $k^2$. Същото важи за всякакви подобни фигури: при подобие с коефициент $k$ лицата се умножават по $k^2$, а обемите на подобни тела – по $k^3$."
          />
          <p className={text}>
            Това е отговорът на загадката от началото: снимката е увеличена с <Tex>{'k = 2'}</Tex>, затова лицето ѝ е <Tex>{'2^2 = 4'}</Tex> пъти по-голямо. Един начин да
            получим подобен триъгълник е <strong>хомотетията</strong> – „увеличаване“ от точка <Tex>{'O'}</Tex>. Пробвай:
          </p>
          <HomothetyLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Подобие в правоъгълния триъгълник</h2>
          <p className={text}>
            Нека <Tex>{'CH'}</Tex> е височината към хипотенузата <Tex>{'AB'}</Tex> на правоъгълния триъгълник <Tex>{'ABC'}</Tex>, а <Tex>{'p = AH'}</Tex> и <Tex>{'q = HB'}</Tex> са проекциите на катетите <Tex>{'b = AC'}</Tex> и <Tex>{'a = BC'}</Tex> върху хипотенузата. Височината разделя триъгълника на два малки, които са подобни на целия (имат общ остър ъгъл и прав ъгъл).
          </p>
          <Theorem
            title="Метрични зависимости (теореми на Евклид)"
            description="В правоъгълен триъгълник с хипотенуза $c$, катети $a$ и $b$, височина $h$ към хипотенузата и проекции $p$ и $q$ на катетите $b$ и $a$ върху нея: $h^2 = p \cdot q$; $a^2 = c \cdot q$; $b^2 = c \cdot p$. Освен това $a \cdot b = c \cdot h$ (двата начина за удвоеното лице)."
          />
          <RightTriangleLab />
          <Example
            description="Катетите на правоъгълен триъгълник са 6 cm и 8 cm. Намерете височината към хипотенузата и отсечките, на които тя я дели."
            steps={['$c = \\sqrt{6^2 + 8^2} = 10\\ \\mathrm{cm}$', '$h = a \\cdot b / c = \\frac{48}{10} = 4{,}8\\ \\mathrm{cm}$', 'Проекция на катета $6$: $6^2 = 10 \\cdot x \\Rightarrow x = 3{,}6\\ \\mathrm{cm}$', 'Проекция на катета $8$: $8^2 = 10 \\cdot y \\Rightarrow y = 6{,}4\\ \\mathrm{cm}$', 'Проверка: $3{,}6 \\cdot 6{,}4 = 23{,}04 = 4{,}8^2$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Задачи от живота</h2>
          <p className={text}>
            Когато нещо е твърде високо, далечно или голямо за директно измерване, търсим два подобни триъгълника: един малък, който можем да
            измерим, и един голям, в който е неизвестното.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Сбъркано съответствие на върховете', '$\\Delta ABC \\sim \\Delta MNP \\Rightarrow \\frac{AB}{NP} = \\frac{BC}{MN}$', '$\\frac{AB}{MN} = \\frac{BC}{NP} = \\frac{CA}{PM}$'],
              ['Лицата като периметрите', '$k = 3 \\Rightarrow S_1 = 3S$', '$S_1 = k^2 \\cdot S = 9S$'],
              ['Отсечката $MN$ при Талес', '$MN \\parallel BC \\Rightarrow \\frac{MN}{BC} = \\frac{AM}{MB}$', '$\\frac{MN}{BC} = \\frac{AM}{AB}$'],
              ['„Признак“ ССЪ', 'две пропорционални страни и ъгъл срещу едната ⇒ подобни', 'не е признак (както и при еднаквост)'],
              ['Мащаб на площ', '$1 : 25\\,000 \\Rightarrow 1\\ \\mathrm{cm}^2 \\leftrightarrow 25\\,000\\ \\mathrm{cm}^2$', '$1\\ \\mathrm{cm}^2 \\leftrightarrow 250\\ \\mathrm{m} \\cdot 250\\ \\mathrm{m} = 62\\,500\\ \\mathrm{m}^2$'],
              ['Подобни ⇔ еднакви', 'подобните триъгълници имат равни страни', 'само при $k = 1$'],
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
          <Quiz questions={similarityQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="$\Delta ABC \sim \Delta A_1B_1C_1$, $AB = 6,\ BC = 8,\ CA = 10$ и $A_1B_1 = 9$. Намерете другите страни и периметъра на $A_1B_1C_1$.">
                <p><Tex>{'k = \\frac{A_1B_1}{AB} = \\frac{9}{6} = 1{,}5'}</Tex></p>
                <p><Tex>{'B_1C_1 = 1{,}5 \\cdot 8 = 12'}</Tex>; <Tex>{'C_1A_1 = 1{,}5 \\cdot 10 = 15'}</Tex></p>
                <p><Tex>{'P_1 = 9 + 12 + 15 = 36\\ (= 1{,}5 \\cdot 24)'}</Tex> ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="В триъгълник $ABC$ $M \in AB$, $N \in AC$ и $MN \parallel BC$. $AM = 4,\ AB = 10,\ BC = 15$. Намерете $MN$.">
                <p><Tex>{'\\Delta AMN \\sim \\Delta ABC'}</Tex> (ЪЪ – съответни ъгли при успоредни прави).</p>
                <p><Tex>{'\\frac{MN}{BC} = \\frac{AM}{AB} = \\frac{4}{10} = 0{,}4'}</Tex></p>
                <p><Tex>{'MN = 0{,}4 \\cdot 15 = 6'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Стълб с височина 6 m хвърля сянка 4 m. Колко е висок момче, чиято сянка в същия момент е 1,10 m?">
                <p>Отношението височина : сянка е еднакво: <Tex>{'\\frac{h}{1{,}1} = \\frac{6}{4} = 1{,}5'}</Tex></p>
                <p><Tex>{'h = 1{,}5 \\cdot 1{,}1 = 1{,}65\\ \\mathrm{m}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Диагоналите на трапец $ABCD$ ($AB \parallel CD$) се пресичат в $O$. $AB = 12,\ CD = 4$. Ако лицето на $\Delta COD$ е $2\ \mathrm{cm}^2$, колко е лицето на $\Delta AOB$?">
                <p><Tex>{'\\Delta AOB \\sim \\Delta COD'}</Tex> (ЪЪ: кръстни и връхни ъгли) с <Tex>{'k = \\frac{AB}{CD} = 3'}</Tex>.</p>
                <p>Лицата се отнасят като <Tex>{'k^2 = 9'}</Tex>.</p>
                <p><Tex>{'S(AOB) = 9 \\cdot 2 = 18\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Хипотенузата на правоъгълен триъгълник е 10, а проекцията на единия катет върху нея е 3,6. Намерете катетите и височината към хипотенузата.">
                <p>Другата проекция: <Tex>{'10 - 3{,}6 = 6{,}4'}</Tex>.</p>
                <p>Катетите: <Tex>{'\\sqrt{10 \\cdot 3{,}6} = \\sqrt{36} = 6'}</Tex> и <Tex>{'\\sqrt{10 \\cdot 6{,}4} = \\sqrt{64} = 8'}</Tex>.</p>
                <p>Височината: <Tex>{'h = \\sqrt{3{,}6 \\cdot 6{,}4} = \\sqrt{23{,}04} = 4{,}8'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="В триъгълник $ABC$ страната $BC = 12$ и височината към нея е 8. В него е вписан квадрат, едната страна на който лежи на $BC$, а другите два върха – на $AB$ и $AC$. Намерете страната на квадрата.">
                <p>Нека страната е <Tex>{'x'}</Tex>. Горната страна на квадрата е успоредна на <Tex>{'BC'}</Tex> и отрязва триъгълник, подобен на <Tex>{'ABC'}</Tex>.</p>
                <p>Височината на малкия триъгълник е <Tex>{'8 - x'}</Tex>, а основата му е <Tex>{'x'}</Tex>. От подобието: <Tex>{'\\frac{x}{12} = \\frac{8 - x}{8}'}</Tex>.</p>
                <p><Tex>{'8x = 96 - 12x \\Rightarrow 20x = 96 \\Rightarrow x = 4{,}8'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажи, че ъглополовящата $AL$ в триъгълник $ABC$ дели срещулежащата страна в отношение $BL : LC = AB : AC$. Пресметни $BL$ и $LC$ при $AB = 6,\ AC = 9,\ BC = 10$.">
                <p>През <Tex>{'C'}</Tex> прекарваме права, успоредна на <Tex>{'AL'}</Tex>; нека тя пресича правата <Tex>{'AB'}</Tex> в точка <Tex>{'D'}</Tex>.</p>
                <p><Tex>{'\\angle ACD = \\angle CAL'}</Tex> (кръстни) и <Tex>{'\\angle ADC = \\angle BAL'}</Tex> (съответни); тъй като <Tex>{'\\angle BAL = \\angle CAL'}</Tex>, <Tex>{'\\Delta ACD'}</Tex> е равнобедрен: <Tex>{'AD = AC'}</Tex>.</p>
                <p>По теоремата на Талес за ъгъла <Tex>{'B'}</Tex>: <Tex>{'\\frac{BL}{LC} = \\frac{BA}{AD} = \\frac{AB}{AC}'}</Tex>.</p>
                <p><Tex>{'BL : LC = 6 : 9 = 2 : 3'}</Tex> и <Tex>{'BL + LC = 10 \\Rightarrow BL = 4,\\ LC = 6'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="През точка вътре в триъгълник ABC са прекарани прави, успоредни на страните му. Те образуват три малки триъгълника с лица 4, 9 и 16. Намерете лицето на ABC.">
                <p>Трите малки триъгълника са подобни на <Tex>{'ABC'}</Tex> с коефициенти <Tex>{'\\sqrt{\\frac{4}{S}}'}</Tex>, <Tex>{'\\sqrt{\\frac{9}{S}}'}</Tex> и <Tex>{'\\sqrt{\\frac{16}{S}}'}</Tex>.</p>
                <p>Основите им върху една страна (например <Tex>{'BC'}</Tex>) – след успоредно пренасяне – съставят цялата страна: <Tex>{'k_1 + k_2 + k_3 = 1'}</Tex>.</p>
                <p><Tex>{'\\frac{2 + 3 + 4}{\\sqrt{S}} = 1 \\Rightarrow \\sqrt{S} = 9'}</Tex></p>
                <p><Tex>{'S = 81'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Основите на трапец са $a = 12$ и $b = 4$. През пресечната точка $O$ на диагоналите е прекарана отсечка, успоредна на основите, с краища върху бедрата. Намерете дължината ѝ.">
                <p>От <Tex>{'\\Delta AOB \\sim \\Delta COD'}</Tex>: <Tex>{'AO : OC = 12 : 4 = 3 : 1'}</Tex>, т.е. <Tex>{'\\frac{CO}{CA} = \\frac{1}{4}'}</Tex> и <Tex>{'\\frac{AO}{AC} = \\frac{3}{4}'}</Tex>.</p>
                <p>В <Tex>{'\\Delta ACD'}</Tex> отсечката от <Tex>{'O'}</Tex> до бедрото <Tex>{'AD'}</Tex> е успоредна на <Tex>{'CD'}</Tex>: тя е <Tex>{'\\frac{AO}{AC} \\cdot CD = \\frac{3}{4} \\cdot 4 = 3'}</Tex>.</p>
                <p>В <Tex>{'\\Delta CAB'}</Tex> аналогично частта от <Tex>{'O'}</Tex> до <Tex>{'BC'}</Tex> е <Tex>{'\\frac{CO}{CA} \\cdot AB = \\frac{1}{4} \\cdot 12 = 3'}</Tex>.</p>
                <p>Цялата отсечка е <Tex>{'6'}</Tex> – и <Tex>{'O'}</Tex> е нейната среда. Общо: <Tex>{'\\frac{2ab}{a + b} = \\frac{96}{16} = 6'}</Tex> (средно хармонично на основите).</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Талес: успоредни прави отсичат пропорционални отсечки; <Tex>{'MN \\parallel BC \\Rightarrow \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}'}</Tex></li>
              <li>✓ Подобни триъгълници: равни ъгли и пропорционални страни с коефициент <Tex>{'k'}</Tex></li>
              <li>✓ Признаци: ЪЪ, СЪС, ССС (ССЪ не е признак)</li>
              <li>✓ Периметри, височини, медиани – отношение <Tex>{'k'}</Tex>; лица – <Tex>{'k^2'}</Tex>; обеми – <Tex>{'k^3'}</Tex></li>
              <li>✓ Правоъгълен триъгълник: <Tex>{'h^2 = pq,\\ a^2 = cq,\\ b^2 = cp,\\ ab = ch'}</Tex></li>
              <li>✓ Измерване на недостъпни разстояния: търсим два подобни триъгълника</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Листът А4 е <Tex>{'297 \\times 210\\ \\mathrm{mm}'}</Tex>, а <Tex>{'297 : 210 \\approx 1{,}414 \\approx \\sqrt{2}'}</Tex>. Това не е случайно: ако го разрежеш наполовина, получаваш лист А5, който е
              подобен на А4. Лицето е намаляло 2 пъти, значи коефициентът на подобие е <Tex>{'\\frac{1}{\\sqrt{2}}'}</Tex> – точно колкото трябва, за да остане отношението
              на страните <Tex>{'\\sqrt{2}'}</Tex>. Затова копирната машина намалява А4 до А5 с бутона „71%“ (<Tex>{'\\frac{1}{\\sqrt{2}} \\approx 0{,}707'}</Tex>).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
