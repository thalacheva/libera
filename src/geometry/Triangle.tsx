import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { InteractiveTriangle } from './InteractiveTriangle';
import { WordProblems, type WordProblem } from '~/WordProblems';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

const bySides = [
  ['Разностранен', 'всички страни са различни', 'a ≠ b ≠ c'],
  ['Равнобедрен', 'две равни страни (бедра); ъглите при основата са равни', 'a = b'],
  ['Равностранен', 'трите страни са равни; всеки ъгъл е 60°', 'a = b = c'],
];

const byAngles = [
  ['Остроъгълен', 'трите ъгъла са остри', 'всички < 90°'],
  ['Правоъгълен', 'един ъгъл е прав; страните до него са катети, срещу него – хипотенуза', 'γ = 90°'],
  ['Тъпоъгълен', 'един ъгъл е тъп', 'γ > 90°'],
];

const classifications = [
  { title: 'Според страните', kinds: bySides },
  { title: 'Според ъглите', kinds: byAngles },
];

const segments = [
  ['Височина', 'перпендикуляр от връх към правата на срещуположната страна', 'ортоцентър'],
  ['Медиана', 'свързва връх със средата на срещуположната страна', 'медицентър (центърът на тежестта) – дели всяка медиана в отношение 2 : 1 от върха'],
  ['Ъглополовяща', 'дели ъгъла при върха на два равни ъгъла', 'център на вписаната окръжност'],
  ['Симетрала', 'перпендикуляр през средата на страна', 'център на описаната окръжност'],
];

const wordProblems: WordProblem[] = [
  {
    title: '🪜 Стълбата',
    problem: 'Стълба с дължина 5 m е опряна на стена. Долният ѝ край е на 3 m от стената. На каква височина стига стълбата?',
    solution: ['Стената, земята и стълбата образуват правоъгълен триъгълник.', 'h² + 3² = 5²', 'h² = 25 − 9 = 16', 'h = 4'],
    answer: '4 m',

    check: [4],

    ask: ['височина, m'],
  },
  {
    title: '🌳 Пряк път през парка',
    problem: 'Правоъгълна поляна е 60 m × 80 m. С колко метра е по-къс пътят по диагонала, отколкото покрай двата края?',
    solution: ['d² = 60² + 80² = 3600 + 6400 = 10000', 'd = 100 m', 'Покрай краищата: 60 + 80 = 140 m', '140 − 100 = 40'],
    answer: 'с 40 m',

    check: [40],

    ask: ['по-къс с, m'],
  },
  {
    title: '⛵ Платното',
    problem: 'Триъгълно платно има долен край 3 m, а височината към него е 4 m. Колко квадратни метра плат е нужен?',
    solution: ['S = a · hₐ / 2', 'S = 3 · 4 / 2', 'S = 6'],
    answer: '6 m²',

    check: [6],

    ask: ['плат, m²'],
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
    question: 'Външният ъгъл при върха C е 130°, а ∠A = 60°. Колко е ∠B?',
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
    answers: ['16 cm²', '30 cm²', '60 cm²', '15 cm²'],
    correctAnswer: '30 cm²',
  },
];

export function Triangle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Триъгълник
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Защо мостовете, кулите и покривите са пълни с
              триъгълници? Сглоби четириъгълник от четири пръчки – той лесно се „сгъва“.
              Триъгълникът от три пръчки обаче не може да промени формата си: щом дължините на
              страните са избрани, формата е напълно определена. Затова триъгълникът е най-здравата
              фигура в строителството.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Триъгълник"
            description="Триъгълник е фигура, образувана от три точки, които не лежат на една права (върхове), и трите отсечки, които ги свързват (страни). Обикновено върховете се означават с A, B, C, а срещуположните им страни – с малките букви a, b, c. Ъглите при върховете се означават с α, β, γ."
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Видове триъгълници</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {classifications.map(({ title, kinds }) => (
              <div key={title}>
                <p className="font-semibold mb-2">{title}</p>
                <div className="space-y-2">
                  {kinds.map(([name, desc, formula]) => (
                    <div key={name} className={card}>
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold">{name}</p>
                        <p className="font-mono text-sm text-blue-700 dark:text-blue-300">{formula}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Ъгли в триъгълника</h2>
          <Theorem
            title="Сбор на ъглите в триъгълник"
            description="Сборът на трите вътрешни ъгъла на всеки триъгълник е 180°: α + β + γ = 180°."
            graphic={<InteractiveTriangle type="angles" />}
          />
          <p className={`${text} mb-6`}>
            <strong>Защо?</strong> Прекарай през върха C права, успоредна на AB. Двата ъгъла,
            които тя сключва със страните CA и CB, са равни на α и β (кръстни ъгли). Заедно с γ
            трите ъгъла образуват изправен ъгъл – точно 180°. От това следва, че триъгълникът може
            да има най-много един прав или тъп ъгъл.
          </p>
          <Theorem
            title="Външен ъгъл на триъгълник"
            description="Външният ъгъл при даден връх е равен на сбора от двата вътрешни ъгъла, които не са съседни на него. Например външният ъгъл при C е равен на α + β."
            graphic={<InteractiveTriangle type="exterior" />}
          />
          <Example
            description="В равнобедрен триъгълник ъгълът при върха (между бедрата) е 40°. Намери ъглите при основата."
            steps={[
              'Ъглите при основата на равнобедрен триъгълник са равни – означаваме всеки с x.',
              'Сборът на ъглите е 180°: x + x + 40° = 180°',
              '2x = 140°',
              'x = 70° – всеки от ъглите при основата е 70°.',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Страни в триъгълника</h2>
          <Theorem
            title="Неравенство на триъгълника"
            description="Всяка страна на триъгълник е по-малка от сбора на другите две и по-голяма от тяхната разлика: |b − c| < a < b + c."
            graphic={<InteractiveTriangle type="inequality" />}
          />
          <p className={`${text} mb-4`}>
            Това е причината правият път да е най-краткият: ако минеш през трета точка, винаги
            изминаваш повече. За да провериш дали три отсечки могат да образуват триъгълник, е
            достатъчно да сравниш <strong>най-дългата</strong> със сбора на другите две.
          </p>
          <Theorem
            title="Страни и ъгли"
            description="Срещу по-голямата страна лежи по-големият ъгъл и обратно. В частност, в правоъгълния триъгълник хипотенузата е най-дългата страна, защото лежи срещу най-големия ъгъл."
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Забележителни отсечки</h2>
          <p className={`${text} mb-4`}>
            Във всеки триъгълник от всеки връх можем да прекараме по една височина, медиана и
            ъглополовяща. Трите отсечки от един и същи вид винаги се пресичат в една точка.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {segments.map(([name, desc, point]) => (
              <div key={name} className={card}>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{desc}</p>
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Пресечна точка: </span>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Питагорова теорема</h2>
          <Theorem
            title="Питагорова теорема"
            description="В правоъгълен триъгълник квадратът на хипотенузата е равен на сбора от квадратите на катетите: c² = a² + b². Вярно е и обратното: ако за страните на триъгълник c² = a² + b², то той е правоъгълен."
          />
          <p className={`${text} mb-4`}>
            Тройки цели числа, за които c² = a² + b², се наричат <strong>питагорови тройки</strong>.
            Най-известните са:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['3, 4, 5', '5, 12, 13', '8, 15, 17', '7, 24, 25', '6, 8, 10'].map(triple => (
              <span key={triple} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-sm">
                {triple}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Лице на триъгълник</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 space-y-2 font-mono text-center text-gray-800 dark:text-gray-100">
            <p className="text-base sm:text-lg">S = a · hₐ / 2</p>
            <p className="text-sm sm:text-base">правоъгълен: S = a · b / 2 (a и b – катети)</p>
            <p className="text-sm sm:text-base">Херон: S = √(p(p − a)(p − b)(p − c)), p = (a + b + c) / 2</p>
          </div>
          <p className={`${text} mb-4`}>
            Основната формула идва от правоъгълника: два еднакви триъгълника се долепват в
            успоредник с основа a и височина hₐ. Формулата на Херон е полезна, когато знаем само
            трите страни.
          </p>
          <Example
            description="Намери лицето на триъгълник със страни 13 cm, 14 cm и 15 cm."
            steps={[
              'Полупериметър: p = (13 + 14 + 15) / 2 = 21',
              'p − a = 8, p − b = 7, p − c = 6',
              'S = √(21 · 8 · 7 · 6) = √7056',
              'S = 84 cm²',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>⚠️ Чести грешки</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Питагорова теорема за всеки триъгълник', 'c² = a² + b² за всеки триъгълник', 'само за правоъгълен, като c е хипотенузата'],
              ['Хипотенузата като сбор', 'катети 6 и 8 → c = 6 + 8 = 14', 'c = √(36 + 64) = 10'],
              ['Забравено делене на 2', 'S = a · hₐ', 'S = a · hₐ / 2'],
              ['Височината винаги е вътре', 'височината пада върху страната', 'при тъпоъгълен триъгълник две от височините падат извън него'],
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
          <Quiz questions={triangleQuiz} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Питагоровите тройки са познати много преди Питагор (VI век пр.н.е.). Вавилонската
              глинена плочка „Плимптън 322“, написана около 1800 г. пр.н.е., съдържа таблица с
              петнадесет такива тройки – някои с числа над 10 000. Вавилонците са ги използвали
              повече от хилядолетие преди гърците да докажат теоремата.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
