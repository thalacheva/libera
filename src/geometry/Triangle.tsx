import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { CentersLab } from './CentersLab';
import { CongruenceLab } from './CongruenceLab';
import { InteractiveTriangle } from './InteractiveTriangle';
import { PythagorasLab } from './PythagorasLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const bySides = [
  ['Разностранен', 'всички страни са различни', '$a \\ne b \\ne c$'],
  ['Равнобедрен', 'две равни страни (бедра); ъглите при основата са равни', '$a = b$'],
  ['Равностранен', 'трите страни са равни; всеки ъгъл е 60°', '$a = b = c$'],
];

const byAngles = [
  ['Остроъгълен', 'трите ъгъла са остри', 'всички $< 90^\\circ$'],
  ['Правоъгълен', 'един ъгъл е прав; страните до него са катети, срещу него – хипотенуза', '$\\gamma = 90^\\circ$'],
  ['Тъпоъгълен', 'един ъгъл е тъп', '$\\gamma > 90^\\circ$'],
];

const classifications = [
  { title: 'Според страните', kinds: bySides },
  { title: 'Според ъглите', kinds: byAngles },
];

const segments = [
  ['Височина', 'перпендикуляр от връх към правата на срещуположната страна', 'ортоцентър'],
  ['Медиана', 'свързва връх със средата на срещуположната страна', 'медицентър (центърът на тежестта) – дели всяка медиана в отношение $2 : 1$ от върха'],
  ['Ъглополовяща', 'дели ъгъла при върха на два равни ъгъла', 'център на вписаната окръжност'],
  ['Симетрала', 'перпендикуляр през средата на страна', 'център на описаната окръжност'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🪜 Стълбата',
    problem: 'Стълба с дължина 5 m е опряна на стена. Долният ѝ край е на 3 m от стената. На каква височина стига стълбата?',
    solution: ['Стената, земята и стълбата образуват правоъгълен триъгълник.', '$h^2 + 3^2 = 5^2$', '$h^2 = 25 - 9 = 16$', '$h = 4$'],
    answer: '4 m',
    check: [4],
    ask: ['височина, m'],
  },
  {
    title: '🌳 Пряк път през парка',
    problem: 'Правоъгълна поляна е $60\\ \\mathrm{m} \\times 80\\ \\mathrm{m}$. С колко метра е по-къс пътят по диагонала, отколкото покрай двата края?',
    solution: ['$d^2 = 60^2 + 80^2 = 3600 + 6400 = 10000$', '$d = 100\\ \\mathrm{m}$', 'Покрай краищата: $60 + 80 = 140\\ \\mathrm{m}$', '$140 - 100 = 40$'],
    answer: 'с 40 m',
    check: [40],
    ask: ['по-къс с, m'],
  },
  {
    title: '⛵ Платното',
    problem: 'Триъгълно платно има долен край 3 m, а височината към него е 4 m. Колко квадратни метра плат е нужен?',
    solution: ['$S = a \\cdot h_a / 2$', '$S = 3 \\cdot 4 / 2$', '$S = 6$'],
    answer: '$6\\ \\mathrm{m}^2$',
    check: [6],
    ask: ['плат, m²'],
  },
  {
    title: '⛺ Въжето на мачтата',
    problem: 'Мачта е висока 12 m. Опъваме въже от върха ѝ до колче в земята на 5 m от основата. Колко дълго е въжето?',
    solution: ['Мачтата, земята и въжето образуват правоъгълен триъгълник с катети 12 и 5.', '$x^2 = 12^2 + 5^2 = 144 + 25 = 169$', '$x = 13$'],
    answer: '13 m',
    check: [13],
    ask: ['дължина, m'],
  },
  {
    title: '📺 Екранът',
    problem: 'Екран със съотношение на страните $4 : 3$ има диагонал 50 инча. Колко са широчината и височината му?',
    solution: ['Страните са $4k$ и $3k$.', '$(4k)^2 + (3k)^2 = 50^2 \\Rightarrow 25k^2 = 2500$', '$k = 10 \\Rightarrow$ 40 и 30 инча'],
    answer: '$40 \\times 30$ инча',
    check: [40, 30],
    ask: ['широчина, инча', 'височина, инча'],
  },
];

const triangleQuiz: Question[] = [
  {
    question: 'Два от ъглите на триъгълник са 50° и 70°. Колко е третият ъгъл?',
    answers: ['40°', '60°', '80°', '120°'],
    correctAnswer: '60°',
  },
  {
    question: 'Могат ли отсечки с дължини 3 cm, 4 cm и 8 cm да бъдат страни на триъгълник?',
    answers: ['Да', 'Не, защото 3 + 4 < 8', 'Само ако триъгълникът е правоъгълен'],
    correctAnswer: 'Не, защото 3 + 4 < 8',
  },
  {
    question: 'Катетите на правоъгълен триъгълник са 6 и 8. Колко е хипотенузата?',
    answers: ['7', '10', '12', '14'],
    correctAnswer: '10',
  },
  {
    question: 'Външният ъгъл при върха $C$ е 130°, а $\\angle A = 60^\\circ$. Колко е $\\angle B$?',
    answers: ['50°', '60°', '70°', '130°'],
    correctAnswer: '70°',
  },
  {
    question: 'Как се нарича отсечката, която свързва връх със средата на срещуположната страна?',
    answers: ['Височина', 'Медиана', 'Ъглополовяща', 'Симетрала'],
    correctAnswer: 'Медиана',
  },
  {
    question: 'Страна на триъгълник е 10 cm, а височината към нея е 6 cm. Колко е лицето?',
    answers: ['$16\\ \\mathrm{cm}^2$', '$30\\ \\mathrm{cm}^2$', '$60\\ \\mathrm{cm}^2$', '$15\\ \\mathrm{cm}^2$'],
    correctAnswer: '$30\\ \\mathrm{cm}^2$',
  },
  {
    question: 'Триъгълник има страни 6, 7 и 9. Какъв е той?',
    answers: ['Остроъгълен', 'Правоъгълен', 'Тъпоъгълен', 'Не съществува'],
    correctAnswer: 'Остроъгълен',
  },
  {
    question: 'Кой от изброените НЕ е признак за еднаквост на триъгълници?',
    answers: ['ССС', 'СЪС', 'ЪСЪ', 'ССЪ (ъгълът не е между страните)'],
    correctAnswer: 'ССЪ (ъгълът не е между страните)',
  },
];

export function Triangle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Триъгълник</h1>

        <div className="bg-gradient-to-br from-violet-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🪢 Разказва се, че древноегипетските землемери – „опъвачите на въже“ – след всяко разливане на Нил възстановявали границите на
            нивите с едно въже с 12 равноотдалечени възела. Опънато в триъгълник със страни 3, 4 и 5 деления, то дава точно прав ъгъл. Дали
            е било така, историците спорят – но трикът работи и днес: зидари проверяват ъгъла на стена с рулетка и правилото „3 – 4 – 5“. Зад
            него стои най-известната теорема в математиката – и още много изненади, скрити в най-простата фигура.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Триъгълник и видове триъгълници</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Защо мостовете, кулите и покривите са пълни с триъгълници? Сглоби четириъгълник от четири пръчки –
              той лесно се „сгъва“. Триъгълникът от три пръчки обаче не може да промени формата си: щом дължините на страните са избрани,
              формата е напълно определена. Затова триъгълникът е най-здравата фигура в строителството.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Триъгълник"
            description="Триъгълник е фигура, образувана от три точки, които не лежат на една права (върхове), и трите отсечки, които ги свързват (страни). Обикновено върховете се означават с $A$, $B$, $C$, а срещуположните им страни – с малките букви $a$, $b$, $c$. Ъглите при върховете се означават с $\alpha$, $\beta$, $\gamma$."
          />
          <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {classifications.map(({ title, kinds }) => (
              <div key={title}>
                <p className="font-semibold mb-2"><MathText>{title}</MathText></p>
                <div className="space-y-2">
                  {kinds.map(([name, desc, formula]) => (
                    <div key={name} className={card}>
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold">{name}</p>
                        <p className="font-mono text-sm text-blue-700 dark:text-blue-300"><MathText>{formula}</MathText></p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Ъгли в триъгълника</h2>
          <Theorem
            title="Сбор на ъглите в триъгълник"
            description="Сборът на трите вътрешни ъгъла на всеки триъгълник е 180°: $\alpha + \beta + \gamma = 180^\circ$."
            graphic={<InteractiveTriangle type="angles" />}
          />
          <p className={`${text} mb-6`}>
            <strong>Защо?</strong> Прекарай през върха <Tex>{'C'}</Tex> права, успоредна на <Tex>{'AB'}</Tex>. Двата ъгъла, които тя сключва със страните <Tex>{'CA'}</Tex> и <Tex>{'CB'}</Tex>, са равни
            на <Tex>{'\\alpha'}</Tex> и <Tex>{'\\beta'}</Tex> (кръстни ъгли). Заедно с <Tex>{'\\gamma'}</Tex> трите ъгъла образуват изправен ъгъл – точно 180°. От това следва, че триъгълникът може да има
            най-много един прав или тъп ъгъл.
          </p>
          <Theorem
            title="Външен ъгъл на триъгълник"
            description="Външният ъгъл при даден връх е равен на сбора от двата вътрешни ъгъла, които не са съседни на него. Например външният ъгъл при $C$ е равен на $\alpha + \beta$."
            graphic={<InteractiveTriangle type="exterior" />}
          />
          <Example
            description="В равнобедрен триъгълник ъгълът при върха (между бедрата) е 40°. Намери ъглите при основата."
            steps={[
              'Ъглите при основата на равнобедрен триъгълник са равни – означаваме всеки с $x$.',
              'Сборът на ъглите е 180°: $x + x + 40^\\circ = 180^\\circ$',
              '$2x = 140^\\circ$',
              '$x = 70^\\circ$ – всеки от ъглите при основата е 70°.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Страни в триъгълника</h2>
          <Theorem
            title="Неравенство на триъгълника"
            description="Всяка страна на триъгълник е по-малка от сбора на другите две и по-голяма от тяхната разлика: $|b - c| < a < b + c$."
            graphic={<InteractiveTriangle type="inequality" />}
          />
          <p className={`${text} mb-4`}>
            Това е причината правият път да е най-краткият: ако минеш през трета точка, винаги изминаваш повече. За да провериш дали три
            отсечки могат да образуват триъгълник, е достатъчно да сравниш <strong>най-дългата</strong> със сбора на другите две.
          </p>
          <Theorem
            title="Страни и ъгли"
            description="Срещу по-голямата страна лежи по-големият ъгъл и обратно. В частност, в правоъгълния триъгълник хипотенузата е най-дългата страна, защото лежи срещу най-големия ъгъл."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Еднакви триъгълници</h2>
          <p className={`${text} mb-4`}>
            Два триъгълника са еднакви, ако могат да се наложат един върху друг – имат равни съответни страни и ъгли. За да го докажем, не е
            нужно да сравняваме всичките шест елемента: достатъчни са три подходящо избрани.
          </p>
          <Theorem
            title="Признаци за еднаквост"
            description="Два триъгълника са еднакви, ако имат съответно равни: 1) две страни и ъгъла между тях (СЪС); 2) страна и двата ъгъла до нея (ЪСЪ); 3) три страни (ССС). Две страни и ъгъл, който НЕ е между тях (ССЪ), в общия случай не са достатъчни."
          />
          <CongruenceLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Забележителни отсечки и точки</h2>
          <p className={`${text} mb-4`}>
            Във всеки триъгълник от всеки връх можем да прекараме по една височина, медиана и ъглополовяща. Трите отсечки от един и същи вид
            винаги се пресичат в една точка – това е една от малките „магии“ на геометрията.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
            {segments.map(([name, desc, point]) => (
              <div key={name} className={card}>
                <p className="font-semibold"><MathText>{name}</MathText></p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><MathText>{desc}</MathText></p>
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Пресечна точка: </span>
                  <MathText>{point}</MathText>
                </p>
              </div>
            ))}
          </div>
          <CentersLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Питагорова теорема</h2>
          <Theorem
            title="Питагорова теорема"
            description="В правоъгълен триъгълник квадратът на хипотенузата е равен на сбора от квадратите на катетите: $c^2 = a^2 + b^2$. Вярно е и обратното: ако за страните на триъгълник $c^2 = a^2 + b^2$, то той е правоъгълен. Освен това: ако $c^2 < a^2 + b^2$, ъгълът срещу $c$ е остър, а ако $c^2 > a^2 + b^2$ – тъп."
          />
          <PythagorasLab />
          <p className={`${text} mb-4`}>
            Тройки цели числа, за които <Tex>{'c^2 = a^2 + b^2'}</Tex>, се наричат <strong>питагорови тройки</strong>. Най-известните са:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['3, 4, 5', '5, 12, 13', '8, 15, 17', '7, 24, 25', '6, 8, 10'].map(triple => (
              <span key={triple} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-sm">
                {triple}
              </span>
            ))}
          </div>
          <Example
            description="Катетите на правоъгълен триъгълник са 9 cm и 12 cm. Намери хипотенузата и височината към нея."
            steps={['$c^2 = 81 + 144 = 225 \\Rightarrow c = 15\\ \\mathrm{cm}$', 'Лицето по два начина: $S = 9 \\cdot 12 / 2 = 54$ и $S = c \\cdot h / 2$', '$h = 2S / c = 108 / 15 = 7{,}2\\ \\mathrm{cm}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Лице на триъгълник</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-base sm:text-lg"><Tex>{'S = a \\cdot h_a / 2'}</Tex></p>
            <p className="text-sm sm:text-base">правоъгълен: <Tex>{'S = a \\cdot b / 2'}</Tex> (<Tex>{'a'}</Tex> и <Tex>{'b'}</Tex> – катети)</p>
            <p className="text-sm sm:text-base">Херон: <Tex>{'S = \\sqrt{p(p - a)(p - b)(p - c)},\\ p = \\frac{a + b + c}{2}'}</Tex></p>
          </div>
          <p className={`${text} mb-4`}>
            Основната формула идва от правоъгълника: два еднакви триъгълника се долепват в успоредник с основа <Tex>{'a'}</Tex> и височина <Tex>{'h_a'}</Tex>. Формулата на
            Херон е полезна, когато знаем само трите страни.
          </p>
          <Example
            description="Намери лицето на триъгълник със страни 13 cm, 14 cm и 15 cm."
            steps={['Полупериметър: $p = \\frac{13 + 14 + 15}{2} = 21$', '$p - a = 8,\\ p - b = 7,\\ p - c = 6$', '$S = \\sqrt{21 \\cdot 8 \\cdot 7 \\cdot 6} = \\sqrt{7056}$', '$S = 84\\ \\mathrm{cm}^2$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Питагорова теорема за всеки триъгълник', '$c^2 = a^2 + b^2$ за всеки триъгълник', 'само за правоъгълен, като $c$ е хипотенузата'],
              ['Хипотенузата като сбор', 'катети $6$ и $8 \\to c = 6 + 8 = 14$', '$c = \\sqrt{36 + 64} = 10$'],
              ['Забравено делене на 2', '$S = a \\cdot h_a$', '$S = a \\cdot h_a / 2$'],
              ['Височината винаги е вътре', 'височината пада върху страната', 'при тъпоъгълен триъгълник две от височините падат извън него'],
              ['Признак „ССЪ“', 'две страни и ъгъл ⇒ еднакви', 'само ако ъгълът е между двете страни (СЪС)'],
              ['Медиана и височина', 'медианата е перпендикулярна на страната', 'само в равнобедрен триъгълник към основата'],
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
          <Quiz questions={triangleQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Ъглите на триъгълник се отнасят както $2 : 3 : 4$. Намери ги.">
                <p>Нека ъглите са <Tex>{'2x'}</Tex>, <Tex>{'3x'}</Tex> и <Tex>{'4x'}</Tex>: <Tex>{'2x + 3x + 4x = 180^\\circ \\Rightarrow 9x = 180^\\circ \\Rightarrow x = 20^\\circ'}</Tex></p>
                <p>Ъглите са 40°, 60° и 80° – триъгълникът е остроъгълен.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Правоъгълен ли е триъгълникът със страни 5, 12, 13? А със страни 6, 7, 9?">
                <p><Tex>{'5^2 + 12^2 = 25 + 144 = 169 = 13^2 \\Rightarrow'}</Tex> правоъгълен (обратната Питагорова теорема).</p>
                <p><Tex>{'6^2 + 7^2 = 85,\\ 9^2 = 81 < 85 \\Rightarrow'}</Tex> най-големият ъгъл е остър – триъгълникът е остроъгълен.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Равнобедрен триъгълник има периметър 32 cm и основа 8 cm. Намери бедрата, височината към основата и лицето.">
                <p>Бедра: <Tex>{'\\frac{32 - 8}{2} = 12\\ \\mathrm{cm}'}</Tex></p>
                <p>Височината към основата я разполовява: <Tex>{'h^2 = 12^2 - 4^2 = 128 \\Rightarrow h = 8\\sqrt{2} \\approx 11{,}3\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'S = 8 \\cdot 8\\sqrt{2} / 2 = 32\\sqrt{2} \\approx 45{,}3\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Катетите на правоъгълен триъгълник са 9 и 12. Намери хипотенузата, височината и медианата към нея.">
                <p><Tex>{'c = \\sqrt{81 + 144} = 15'}</Tex></p>
                <p><Tex>{'h = \\frac{ab}{c} = \\frac{108}{15} = 7{,}2'}</Tex></p>
                <p>Медианата към хипотенузата е равна на половината от нея: <Tex>{'m = 7{,}5'}</Tex> (тя е радиусът на описаната окръжност!)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="В триъгълник $ABC$ $\angle A = 2\angle B$, а външният ъгъл при $C$ е 120°. Намери ъглите на триъгълника.">
                <p>Външният ъгъл при <Tex>{'C'}</Tex> <Tex>{'= \\angle A + \\angle B \\Rightarrow 2\\angle B + \\angle B = 120^\\circ \\Rightarrow \\angle B = 40^\\circ'}</Tex></p>
                <p><Tex>{'\\angle A = 80^\\circ,\\ \\angle C = 180^\\circ - 120^\\circ = 60^\\circ'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Триъгълник има страни 5, 5 и 6. Намери лицето му, радиуса на вписаната окръжност $r = \frac{S}{p}$ и на описаната $R = \frac{abc}{4S}$.">
                <p><Tex>{'p = 8,\\ S = \\sqrt{8 \\cdot 3 \\cdot 3 \\cdot 2} = \\sqrt{144} = 12'}</Tex> (или: височина към основата <Tex>{'4'}</Tex>, <Tex>{'S = 6 \\cdot 4 / 2 = 12'}</Tex>)</p>
                <p><Tex>{'r = \\frac{S}{p} = \\frac{12}{8} = 1{,}5'}</Tex></p>
                <p><Tex>{'R = \\frac{abc}{4S} = \\frac{150}{48} = 3{,}125'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажи, че трите медиани разделят триъгълника на шест триъгълника с равни лица.">
                <p>Ключово наблюдение: триъгълници с равни основи и обща височина имат равни лица.</p>
                <p>Нека <Tex>{'G'}</Tex> е медицентърът. Тогава <Tex>{'GBM_a'}</Tex> и <Tex>{'GM_aC'}</Tex> имат равни лица – означаваме ги с <Tex>{'x'}</Tex>; аналогично <Tex>{'GCM_b'}</Tex> и <Tex>{'GM_bA'}</Tex> – с <Tex>{'y'}</Tex>, а <Tex>{'GAM_c'}</Tex> и <Tex>{'GM_cB'}</Tex> – с <Tex>{'z'}</Tex>.</p>
                <p>Медианата <Tex>{'AM_a'}</Tex> дели <Tex>{'ABC'}</Tex> на две равни части: <Tex>{'x + 2z = x + 2y \\Rightarrow y = z'}</Tex>. Медианата <Tex>{'BM_b'}</Tex>: <Tex>{'y + 2x = y + 2z \\Rightarrow x = z'}</Tex>.</p>
                <p>Значи <Tex>{'x = y = z'}</Tex> – всяка от шестте части има лице <Tex>{'\\frac{S}{6}'}</Tex>, а триъгълникът <Tex>{'ABG'}</Tex> има лице <Tex>{'\\frac{S}{3}'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В триъгълник $ABC$: $AB = 10,\ BC = 6,\ \angle A = 35^\circ$. Колко такива триъгълника има? Намери възможните дължини на $AC$ ($\sin 35^\circ \approx 0{,}574$, $\cos 35^\circ \approx 0{,}819$).">
                <p>Нека <Tex>{'AC = x'}</Tex>. По косинусовата теорема: <Tex>{'6^2 = x^2 + 10^2 - 2 \\cdot 10 \\cdot x \\cdot \\cos 35^\\circ \\Rightarrow x^2 - 16{,}38x + 64 = 0'}</Tex></p>
                <p><Tex>{'\\frac{D}{4} = 8{,}19^2 - 64 \\approx 3{,}1 > 0 \\Rightarrow'}</Tex> два корена: <Tex>{'x \\approx 8{,}19 \\pm 1{,}76'}</Tex></p>
                <p><Tex>{'AC \\approx 9{,}95'}</Tex> или <Tex>{'AC \\approx 6{,}43'}</Tex> – два различни триъгълника (пробвай в лабораторията ССЪ!).</p>
                <p>Причината: <Tex>{'10 \\cdot \\sin 35^\\circ \\approx 5{,}74 < 6 < 10'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Докажи, че за всеки естествени $m > n$ числата $m^2 - n^2,\ 2mn$ и $m^2 + n^2$ са питагорова тройка. Намери всички правоъгълни триъгълници с цели страни и хипотенуза 25.">
                <p><Tex>{'(m^2 - n^2)^2 + (2mn)^2 = m^4 - 2m^2n^2 + n^4 + 4m^2n^2 = (m^2 + n^2)^2'}</Tex> ✓</p>
                <p><Tex>{'m^2 + n^2 = 25'}</Tex>: <Tex>{'m = 4,\\ n = 3 \\Rightarrow 7,\\ 24,\\ 25'}</Tex>. Освен това кратни на по-малки тройки: <Tex>{'5 \\cdot (3,\\ 4,\\ 5) = 15,\\ 20,\\ 25'}</Tex>.</p>
                <p>Отговор: катети 7 и 24 или 15 и 20.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\alpha + \\beta + \\gamma = 180^\\circ'}</Tex>; външният ъгъл е равен на сбора на двата несъседни вътрешни</li>
              <li>✓ <Tex>{'|b - c| < a < b + c'}</Tex>; срещу по-голямата страна лежи по-големият ъгъл</li>
              <li>✓ Признаци за еднаквост: СЪС, ЪСЪ, ССС (но не ССЪ)</li>
              <li>✓ Медиани, височини, ъглополовящи и симетрали се пресичат в една точка; <Tex>{'G'}</Tex> дели медианите <Tex>{'2 : 1'}</Tex></li>
              <li>✓ Питагор: <Tex>{'c^2 = a^2 + b^2 \\iff \\gamma = 90^\\circ'}</Tex>; <Tex>{'c^2 < a^2 + b^2'}</Tex> – остър, <Tex>{'c^2 > a^2 + b^2'}</Tex> – тъп</li>
              <li>✓ <Tex>{'S = a \\cdot h_a / 2'}</Tex>; Херон: <Tex>{'S = \\sqrt{p(p - a)(p - b)(p - c)}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Питагоровите тройки са познати много преди Питагор (VI век пр.н.е.). Вавилонската глинена плочка „Плимптън 322“, написана около
              1800 г. пр.н.е., съдържа таблица с петнадесет такива тройки – някои с числа над 10 000. Вавилонците са ги използвали повече от
              хилядолетие преди гърците да докажат теоремата. А днес са известни стотици различни доказателства на Питагоровата теорема – едно
              от тях е измислил дори американският президент Джеймс Гарфийлд (1876 г.).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
