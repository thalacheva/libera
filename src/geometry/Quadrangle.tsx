import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { AreaProofLab } from './AreaProofLab';
import { InteractiveQuadrangle } from './InteractiveQuadrangle';
import { ShapeDetectiveLab } from './ShapeDetectiveLab';
import { VarignonLab } from './VarignonLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const card = 'bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm';

type ShapeType = 'parallelogram' | 'rectangle' | 'rhombus' | 'square' | 'trapezoid';

const shapes: {
  type: ShapeType;
  name: string;
  definition: string;
  properties: string[];
  formulas: string[];
}[] = [
  {
    type: 'parallelogram',
    name: 'Успоредник',
    definition: 'Успоредник е четириъгълник, на който двете двойки срещуположни страни са успоредни.',
    properties: [
      'срещуположните страни са равни',
      'срещуположните ъгли са равни',
      'сборът на всеки два съседни ъгъла е 180°',
      'диагоналите се разполовяват взаимно',
    ],
    formulas: ['P = 2(a + b)', 'S = a · hₐ'],
  },
  {
    type: 'rectangle',
    name: 'Правоъгълник',
    definition: 'Правоъгълник е успоредник с прав ъгъл. Тогава и четирите му ъгъла са прави.',
    properties: ['има всички свойства на успоредника', 'диагоналите са равни'],
    formulas: ['P = 2(a + b)', 'S = a · b', 'd = √(a² + b²)'],
  },
  {
    type: 'rhombus',
    name: 'Ромб',
    definition: 'Ромб е успоредник, на който всички страни са равни.',
    properties: [
      'има всички свойства на успоредника',
      'диагоналите са взаимно перпендикулярни',
      'диагоналите са ъглополовящи на ъглите му',
    ],
    formulas: ['P = 4a', 'S = a · h', 'S = d₁ · d₂ / 2'],
  },
  {
    type: 'square',
    name: 'Квадрат',
    definition: 'Квадрат е правоъгълник, на който всички страни са равни. Той е едновременно правоъгълник и ромб.',
    properties: [
      'има всички свойства на правоъгълника и на ромба',
      'диагоналите са равни, перпендикулярни и се разполовяват',
    ],
    formulas: ['P = 4a', 'S = a²', 'd = a√2'],
  },
  {
    type: 'trapezoid',
    name: 'Трапец',
    definition: 'Трапец е четириъгълник, на който точно две страни са успоредни. Те се наричат основи, а другите две – бедра.',
    properties: [
      'средната основа е успоредна на основите и е равна на полусбора им',
      'сборът на ъглите при всяко бедро е 180°',
      'при равнобедрен трапец ъглите при основата и диагоналите са равни',
    ],
    formulas: ['P = a + b + c + d', 'm = (a + c) / 2', 'S = (a + c) / 2 · h = m · h'],
  },
];

const comparison: { property: string; values: boolean[] }[] = [
  { property: 'Срещуположните страни са успоредни', values: [true, true, true, true, false] },
  { property: 'Всички страни са равни', values: [false, false, true, true, false] },
  { property: 'Всички ъгли са прави', values: [false, true, false, true, false] },
  { property: 'Диагоналите се разполовяват', values: [true, true, true, true, false] },
  { property: 'Диагоналите са равни', values: [false, true, false, true, false] },
  { property: 'Диагоналите са перпендикулярни', values: [false, false, true, true, false] },
];

const wordProblems: WordProblem[] = [
  {
    title: '🎨 Боядисване',
    problem: 'Стена е $5\\ \\mathrm{m} \\times 3\\ \\mathrm{m}$ и има прозорец $1\\ \\mathrm{m} \\times 1{,}5\\ \\mathrm{m}$. Една кутия боя стига за $10\\ \\mathrm{m}^2$. Колко кутии са нужни?',
    solution: ['Стена: $5 \\cdot 3 = 15\\ \\mathrm{m}^2$', 'Прозорец: $1 \\cdot 1{,}5 = 1{,}5\\ \\mathrm{m}^2$', 'За боядисване: $15 - 1{,}5 = 13{,}5\\ \\mathrm{m}^2$', '$13{,}5 / 10 = 1{,}35 \\to$ закръгляме нагоре'],
    answer: '2 кутии',
    check: [2],
    ask: ['кутии'],
  },
  {
    title: '🧱 Плочки',
    problem: 'Под на баня е $3\\ \\mathrm{m} \\times 4\\ \\mathrm{m}$. Колко квадратни плочки със страна $50\\ \\mathrm{cm}$ са нужни, за да се покрие?',
    solution: ['$3\\ \\mathrm{m} = 300\\ \\mathrm{cm}$, $4\\ \\mathrm{m} = 400\\ \\mathrm{cm}$', 'По ширина: $300 / 50 = 6$ плочки', 'По дължина: $400 / 50 = 8$ плочки', '$6 \\cdot 8 = 48$'],
    answer: '48 плочки',
    check: [48],
    ask: ['плочки'],
  },
  {
    title: '🌷 Лехата',
    problem: 'Леха има форма на трапец с основи 8 m и 5 m и височина 4 m. Колко е лицето ѝ?',
    solution: ['$S = \\frac{a + c}{2} \\cdot h$', '$S = \\frac{8 + 5}{2} \\cdot 4$', '$S = 6{,}5 \\cdot 4 = 26$'],
    answer: '$26\\ \\mathrm{m}^2$',
    check: [26],
    ask: ['лице, m²'],
  },
  {
    title: '🪁 Хвърчилото',
    problem: 'Хвърчило има форма на делтоид с диагонали 60 cm и 40 cm. Колко квадратни сантиметра плат е нужен за него?',
    solution: ['Диагоналите на делтоида са перпендикулярни – като при ромба.', '$S = d_1 \\cdot d_2 / 2$', '$S = 60 \\cdot 40 / 2 = 1200$'],
    answer: '$1200\\ \\mathrm{cm}^2$',
    check: [1200],
    ask: ['плат, cm²'],
  },
  {
    title: '🌾 Нивата',
    problem: 'Нива има форма на успоредник с основа $50\\ \\mathrm{m}$ и височина към нея $30\\ \\mathrm{m}$. За $100\\ \\mathrm{m}^2$ са нужни $1\\ \\mathrm{kg}$ семена. Колко килограма семена трябват?',
    solution: ['$S = a \\cdot h_a = 50 \\cdot 30 = 1500\\ \\mathrm{m}^2$', '$1500 / 100 = 15$'],
    answer: '15 kg',
    check: [15],
    ask: ['семена, kg'],
  },
];

const quadrangleQuiz: Question[] = [
  {
    question: 'Колко е сборът на вътрешните ъгли на всеки четириъгълник?',
    answers: ['180°', '270°', '360°', '540°'],
    correctAnswer: '360°',
  },
  {
    question: 'Три от ъглите на четириъгълник са 80°, 100° и 70°. Колко е четвъртият?',
    answers: ['90°', '110°', '100°', '250°'],
    correctAnswer: '110°',
  },
  {
    question: 'При кой четириъгълник диагоналите винаги са перпендикулярни, но не винаги са равни?',
    answers: ['Правоъгълник', 'Ромб', 'Успоредник', 'Трапец'],
    correctAnswer: 'Ромб',
  },
  {
    question: 'Диагоналите на ромб са 10 cm и 6 cm. Колко е лицето му?',
    answers: ['$16\\ \\mathrm{cm}^2$', '$30\\ \\mathrm{cm}^2$', '$32\\ \\mathrm{cm}^2$', '$60\\ \\mathrm{cm}^2$'],
    correctAnswer: '$30\\ \\mathrm{cm}^2$',
  },
  {
    question: 'Трапец има основи 7 cm и 11 cm и височина 5 cm. Колко е лицето му?',
    answers: ['$18\\ \\mathrm{cm}^2$', '$40\\ \\mathrm{cm}^2$', '$45\\ \\mathrm{cm}^2$', '$90\\ \\mathrm{cm}^2$'],
    correctAnswer: '$45\\ \\mathrm{cm}^2$',
  },
  {
    question: 'Вярно ли е, че всеки квадрат е ромб?',
    answers: ['Да', 'Не', 'Само ако страната е по-голяма от 1'],
    correctAnswer: 'Да',
  },
  {
    question: 'Какво образуват средите на страните на произволен четириъгълник?',
    answers: ['Квадрат', 'Успоредник', 'Трапец', 'Зависи от четириъгълника'],
    correctAnswer: 'Успоредник',
  },
  {
    question: 'Колко е сборът на вътрешните ъгли на шестоъгълник?',
    answers: ['540°', '720°', '900°', '1080°'],
    correctAnswer: '720°',
  },
];

// Родословно дърво: всяка фигура е частен случай на тази над нея
const treeNodes = {
  quad: { x: 330, y: 30, label: 'Четириъгълник' },
  trap: { x: 130, y: 120, label: 'Трапец' },
  para: { x: 480, y: 120, label: 'Успоредник' },
  isoTrap: { x: 130, y: 210, label: 'Равнобедрен трапец' },
  rect: { x: 380, y: 210, label: 'Правоъгълник' },
  rhomb: { x: 580, y: 210, label: 'Ромб' },
  square: { x: 480, y: 295, label: 'Квадрат' },
};

const treeEdges: [keyof typeof treeNodes, keyof typeof treeNodes, string][] = [
  ['quad', 'trap', '1 двойка успоредни'],
  ['quad', 'para', '2 двойки успоредни'],
  ['trap', 'isoTrap', 'равни бедра'],
  ['para', 'rect', 'прав ъгъл'],
  ['para', 'rhomb', 'равни страни'],
  ['rect', 'square', ''],
  ['rhomb', 'square', ''],
];

function FamilyTree() {
  const w = 184;
  const h = 36;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4 overflow-x-auto">
      <svg viewBox="0 0 680 320" className="w-full min-w-[520px] h-auto text-gray-700 dark:text-gray-300">
        {treeEdges.map(([from, to, label]) => {
          const a = treeNodes[from];
          const b = treeNodes[to];
          return (
            <g key={`${from}-${to}`}>
              <line x1={a.x} y1={a.y + h / 2} x2={b.x} y2={b.y - h / 2} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" />
              {label && (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 + 4}
                  textAnchor="middle"
                  fontSize="13"
                  paintOrder="stroke"
                  strokeWidth="8"
                  strokeLinejoin="round"
                  className="fill-gray-500 stroke-white dark:fill-gray-400 dark:stroke-gray-800"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {Object.entries(treeNodes).map(([key, n]) => (
          <g key={key}>
            <rect
              x={n.x - w / 2}
              y={n.y - h / 2}
              width={w}
              height={h}
              rx="10"
              className="fill-blue-50 stroke-blue-300 dark:fill-blue-950 dark:stroke-blue-700"
              strokeWidth="1.5"
            />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fontWeight="600" className="fill-current">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Quadrangle() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Четириъгълници</h1>

        <div className="bg-gradient-to-br from-teal-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ✏️ Нарисувай произволен четириъгълник – колкото искаш крив, дори вдлъбнат. Отбележи средите на четирите му страни и ги свържи.
            Получава се успоредник. Винаги! Тази изненадващо проста теорема е публикувана чак през 1731 г. от френския математик Пиер Вариньон
            – две хилядолетия след Евклид, който е могъл да я докаже само с няколко реда. Геометрията на четириъгълниците е пълна с такива
            скрити закономерности – ще откриеш някои от тях сам.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Четириъгълник и многоъгълник</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Квадратът правоъгълник ли е? А ромб ли е? Отговорът и на двата въпроса е „да“. Всеки квадрат
              отговаря на определението и за правоъгълник, и за ромб, затова има свойствата и на двете фигури.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Четириъгълник"
            description="Четириъгълник е фигура с четири върха и четири страни, като никои три от върховете не лежат на една права. Отсечките, които свързват несъседни върхове, се наричат диагонали – всеки четириъгълник има два диагонала."
          />
          <Theorem
            title="Сбор на ъглите в многоъгълник"
            description="Сборът на вътрешните ъгли на всеки четириъгълник е 360°: диагоналът го разделя на два триъгълника. Изобщо, изпъкнал $n$-ъгълник се разделя от диагоналите от един връх на $n - 2$ триъгълника, затова сборът на ъглите му е $(n - 2) \cdot 180^\circ$. Сборът на външните ъгли (по един при всеки връх) на всеки изпъкнал многоъгълник е 360°."
          />
          <Example
            description="Колко е всеки ъгъл на правилен осмоъгълник (знакът STOP)?"
            steps={['Сбор на ъглите: $(8 - 2) \\cdot 180^\\circ = 1080^\\circ$', 'Всички ъгли са равни: $1080^\\circ : 8 = 135^\\circ$', 'Проверка с външните ъгли: $360^\\circ : 8 = 45^\\circ$ и $180^\\circ - 45^\\circ = 135^\\circ$ ✓']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Родословно дърво на четириъгълниците</h2>
          <p className={`${text} mb-4`}>
            Специалните четириъгълници са „роднини“. Всяка фигура долу е частен случай на тази над нея и наследява всичките ѝ свойства, като
            добавя и нови.
          </p>
          <FamilyTree />
          <p className={`${text} mb-4`}>Провери дали разпознаваш фигурите – детективът ще ти каже какво си направил:</p>
          <ShapeDetectiveLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Видове четириъгълници</h2>
          <p className={`${text} mb-4`}>Плъзгай върховете на всяка фигура и наблюдавай кои свойства се запазват.</p>
          {shapes.map(shape => (
            <Theorem
              key={shape.type}
              type="definition"
              title={shape.name}
              description={shape.definition}
              graphic={
                <>
                  <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className={card}>
                      <p className="font-semibold mb-1">Свойства</p>
                      <ul className="list-disc ml-5 space-y-1 text-sm">
                        {shape.properties.map(p => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={card}>
                      <p className="font-semibold mb-1">Формули</p>
                      <ul className="space-y-1 font-mono text-sm text-blue-700 dark:text-blue-300">
                        {shape.formulas.map(f => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <InteractiveQuadrangle type={shape.type} />
                </>
              }
            />
          ))}
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Сравнение на свойствата</h2>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <table className="w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold">Свойство</th>
                  {shapes.map(s => (
                    <th key={s.type} className="p-3 font-semibold">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map(row => (
                  <tr key={row.property} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-3">{row.property}</td>
                    {row.values.map((v, i) => (
                      <td key={shapes[i].type} className={`p-3 text-center font-semibold ${v ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>
                        {v ? '✓' : '–'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">При равнобедрения трапец диагоналите също са равни.</p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Откъде идват формулите за лице?</h2>
          <p className={`${text} mb-4`}>
            Всички формули за лице на четириъгълници произлизат от една-единствена: лицето на правоъгълника е <Tex>{'a \\cdot b'}</Tex>. Останалото е въпрос на
            умело рязане и преместване.
          </p>
          <AreaProofLab />
          <Example
            description="Диагоналите на ромб са 6 cm и 8 cm. Намери лицето, страната и периметъра му."
            steps={[
              'Лице: $S = d_1 \\cdot d_2 / 2 = 6 \\cdot 8 / 2 = 24\\ \\mathrm{cm}^2$',
              'Диагоналите се разполовяват под прав ъгъл и образуват 4 правоъгълни триъгълника с катети 3 cm и 4 cm.',
              'Страна (по Питагоровата теорема): $a = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5\\ \\mathrm{cm}$',
              'Периметър: $P = 4a = 20\\ \\mathrm{cm}$',
            ]}
          />
          <Example
            description="Трапец има основи 10 cm и 6 cm и височина 4 cm. Намери средната основа и лицето."
            steps={['Средна основа: $m = \\frac{10 + 6}{2} = 8\\ \\mathrm{cm}$', 'Лице: $S = m \\cdot h = 8 \\cdot 4 = 32\\ \\mathrm{cm}^2$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Теоремата на Вариньон</h2>
          <Theorem
            title="Теорема на Вариньон"
            description="Средите на страните на всеки четириъгълник са върхове на успоредник. Страните му са успоредни на диагоналите на четириъгълника и са равни на половината от тях, а лицето му е половината от лицето на четириъгълника."
          />
          <p className={`${text} mb-4`}>
            <strong>Защо?</strong> В триъгълника <Tex>{'ABC'}</Tex> отсечката, която свързва средите на <Tex>{'AB'}</Tex> и <Tex>{'BC'}</Tex>, е средна отсечка – успоредна на <Tex>{'AC'}</Tex> и равна на
            {' '}<Tex>{'\\frac{AC}{2}'}</Tex>. Същото важи за средите на <Tex>{'CD'}</Tex> и <Tex>{'DA'}</Tex> в триъгълника <Tex>{'ACD'}</Tex>. Значи две срещуположни страни на <Tex>{'MNPQ'}</Tex> са успоредни и равни – това е
            успоредник.
          </p>
          <VarignonLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Лице на успоредник със страните', '$S = a \\cdot b$', '$S = a \\cdot h_a$ – трябва височината, а не другата страна'],
              ['Забравено делене на 2 при ромба', '$S = d_1 \\cdot d_2$', '$S = d_1 \\cdot d_2 / 2$'],
              ['„Квадратът не е правоъгълник“', 'квадратът е отделна фигура', 'квадратът е и правоъгълник, и ромб'],
              ['Смесване на мерните единици', '$P = 12\\ \\mathrm{cm}^2$', 'периметърът е в $\\mathrm{cm}$, лицето – в $\\mathrm{cm}^2$'],
              ['Равни диагонали ⇒ правоъгълник', 'диагоналите са равни, значи е правоъгълник', 'и равнобедреният трапец има равни диагонали'],
              ['Сбор на ъглите на $n$-ъгълник', 'шестоъгълник: $6 \\cdot 180^\\circ = 1080^\\circ$', '$(6 - 2) \\cdot 180^\\circ = 720^\\circ$'],
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
          <Quiz questions={quadrangleQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Ъглите на четириъгълник се отнасят както $1 : 2 : 3 : 4$. Намери ги.">
                <p><Tex>{'x + 2x + 3x + 4x = 360^\\circ \\Rightarrow 10x = 360^\\circ \\Rightarrow x = 36^\\circ'}</Tex></p>
                <p>Ъглите са 36°, 72°, 108° и 144°.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Един ъгъл на успоредник е 3 пъти по-голям от друг. Намери ъглите на успоредника.">
                <p>Различните ъгли на успоредника са съседни, а сборът на съседните е 180°: <Tex>{'x + 3x = 180^\\circ \\Rightarrow x = 45^\\circ'}</Tex>.</p>
                <p>Ъглите са 45°, 135°, 45°, 135°.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Правоъгълник има страни 6 cm и 8 cm. Намери диагонала, периметъра и лицето му.">
                <p><Tex>{'d = \\sqrt{36 + 64} = 10\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'P = 2(6 + 8) = 28\\ \\mathrm{cm}'}</Tex>; <Tex>{'S = 6 \\cdot 8 = 48\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Ромб има страна 13 cm и диагонал 24 cm. Намери другия диагонал и лицето.">
                <p>Половината от диагонала е 12; диагоналите са перпендикулярни: <Tex>{'(\\frac{d_2}{2})^2 = 13^2 - 12^2 = 25 \\Rightarrow \\frac{d_2}{2} = 5'}</Tex></p>
                <p><Tex>{'d_2 = 10\\ \\mathrm{cm}'}</Tex>; <Tex>{'S = 24 \\cdot 10 / 2 = 120\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Равнобедрен трапец има основи 14 cm и 6 cm и бедро 5 cm. Намери височината и лицето му.">
                <p>Височините от краищата на малката основа „отрязват“ от голямата по <Tex>{'\\frac{14 - 6}{2} = 4\\ \\mathrm{cm}'}</Tex>.</p>
                <p><Tex>{'h = \\sqrt{5^2 - 4^2} = 3\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'S = \\frac{14 + 6}{2} \\cdot 3 = 30\\ \\mathrm{cm}^2'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Кой многоъгълник има сбор на вътрешните ъгли 1440°? Колко е всеки ъгъл, ако многоъгълникът е правилен?">
                <p><Tex>{'(n - 2) \\cdot 180^\\circ = 1440^\\circ \\Rightarrow n - 2 = 8 \\Rightarrow n = 10'}</Tex> – десетоъгълник</p>
                <p>Всеки ъгъл на правилния десетоъгълник: <Tex>{'1440^\\circ : 10 = 144^\\circ'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажи, че лицето на успоредника на Вариньон е половината от лицето на четириъгълника ABCD.">
                <p>Отрязаните „ъглови“ триъгълници: <Tex>{'MBN'}</Tex> е подобен на <Tex>{'ABC'}</Tex> с коефициент <Tex>{'\\frac{1}{2}'}</Tex> <Tex>{'\\Rightarrow S(MBN) = \\frac{S(ABC)}{4}'}</Tex>. Аналогично <Tex>{'S(PDQ) = \\frac{S(ACD)}{4}'}</Tex>.</p>
                <p>Сборът им е <Tex>{'\\frac{S(ABC) + S(ACD)}{4} = \\frac{S}{4}'}</Tex>. Същото за другите два ъглови триъгълника (с диагонала <Tex>{'BD'}</Tex>) – още <Tex>{'\\frac{S}{4}'}</Tex>.</p>
                <p><Tex>{'S(MNPQ) = S - \\frac{S}{4} - \\frac{S}{4} = \\frac{S}{2}'}</Tex> ✓</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="В трапец с основи 12 и 4 средната основа пресича диагоналите в точки $K$ и $L$. Намери $KL$.">
                <p>Средната основа минава през средите на диагоналите. В триъгълника с основа 12 отсечката от бедрото до диагонала е средна отсечка: <Tex>{'\\frac{12}{2} = 6'}</Tex>.</p>
                <p>В другия триъгълник (с основа 4) частта е <Tex>{'\\frac{4}{2} = 2'}</Tex>.</p>
                <p><Tex>{'KL = 6 - 2 = 4'}</Tex>. Изобщо: <Tex>{'KL = \\frac{a - c}{2}'}</Tex>.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Вътре в квадрата $ABCD$ е построен равностранен триъгълник $ABM$. Намери $\angle MCD$.">
                <p><Tex>{'MB = AB = BC \\Rightarrow'}</Tex> триъгълникът <Tex>{'MBC'}</Tex> е равнобедрен.</p>
                <p><Tex>{'\\angle MBC = 90^\\circ - 60^\\circ = 30^\\circ \\Rightarrow \\angle BCM = \\frac{180^\\circ - 30^\\circ}{2} = 75^\\circ'}</Tex></p>
                <p><Tex>{'\\angle MCD = 90^\\circ - 75^\\circ = 15^\\circ'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Сбор на ъглите: четириъгълник 360°, <Tex>{'n'}</Tex>-ъгълник <Tex>{'(n - 2) \\cdot 180^\\circ'}</Tex>; външните ъгли – 360°</li>
              <li>✓ Успоредник ⊃ правоъгълник, ромб ⊃ квадрат; трапец – точно една двойка успоредни страни</li>
              <li>✓ Успоредник: <Tex>{'S = a \\cdot h_a'}</Tex>; ромб/делтоид: <Tex>{'S = \\frac{d_1d_2}{2}'}</Tex>; трапец: <Tex>{'S = \\frac{a + c}{2} \\cdot h'}</Tex></li>
              <li>✓ Формулите идват от правоъгълника чрез разрязване и преместване</li>
              <li>✓ Вариньон: средите на страните на всеки четириъгълник образуват успоредник с половин лице</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Листът A4 е правоъгълник с отношение на страните <Tex>{'1 : \\sqrt{2}'}</Tex>. Това отношение е избрано нарочно: когато разрежеш листа на две,
              получаваш два по-малки правоъгълника със същата форма. Най-големият формат A0 има лице точно <Tex>{'1\\ \\mathrm{m}^2'}</Tex>. От него чрез разполовяване се
              получават A1, A2, A3 и A4 (<Tex>{'210 \\times 297\\ \\mathrm{mm}'}</Tex>).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
