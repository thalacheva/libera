import Example from '~/Example';
import Quiz, { Question } from '~/Quiz';
import Theorem from '~/Theorem';
import { InteractiveQuadrangle } from './InteractiveQuadrangle';
import { WordProblem, WordProblems } from './WordProblems';

const h2 = 'text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100';
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
    problem: 'Стена е 5 m × 3 m и има прозорец 1 m × 1,5 m. Една кутия боя стига за 10 m². Колко кутии са нужни?',
    solution: ['Стена: 5 · 3 = 15 m²', 'Прозорец: 1 · 1,5 = 1,5 m²', 'За боядисване: 15 − 1,5 = 13,5 m²', '13,5 / 10 = 1,35 → закръгляме нагоре'],
    answer: '2 кутии',
  },
  {
    title: '🧱 Плочки',
    problem: 'Под на баня е 3 m × 4 m. Колко квадратни плочки със страна 50 cm са нужни, за да се покрие?',
    solution: ['3 m = 300 cm, 4 m = 400 cm', 'По ширина: 300 / 50 = 6 плочки', 'По дължина: 400 / 50 = 8 плочки', '6 · 8 = 48'],
    answer: '48 плочки',
  },
  {
    title: '🌷 Лехата',
    problem: 'Леха има форма на трапец с основи 8 m и 5 m и височина 4 m. Колко е лицето ѝ?',
    solution: ['S = (a + c) / 2 · h', 'S = (8 + 5) / 2 · 4', 'S = 6,5 · 4 = 26'],
    answer: '26 m²',
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
    answers: ['16 cm²', '30 cm²', '32 cm²', '60 cm²'],
    correctAnswer: '30 cm²',
  },
  {
    question: 'Трапец има основи 7 cm и 11 cm и височина 5 cm. Колко е лицето му?',
    answers: ['18 cm²', '40 cm²', '45 cm²', '90 cm²'],
    correctAnswer: '45 cm²',
  },
  {
    question: 'Вярно ли е, че всеки квадрат е ромб?',
    answers: ['Да', 'Не', 'Само ако страната е по-голяма от 1'],
    correctAnswer: 'Да',
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Четириъгълници
        </h1>

        <section className="mb-6 sm:mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className={text}>
              🤔 <strong>Загадка:</strong> Квадратът правоъгълник ли е? А ромб ли е? Отговорът и на
              двата въпроса е „да“. Всеки квадрат отговаря на определението и за правоъгълник, и за
              ромб, затова има свойствата и на двете фигури.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Четириъгълник"
            description="Четириъгълник е фигура с четири върха и четири страни, като никои три от върховете не лежат на една права. Отсечките, които свързват несъседни върхове, се наричат диагонали – всеки четириъгълник има два диагонала."
          />
          <Theorem
            title="Сбор на ъглите в четириъгълник"
            description="Сборът на вътрешните ъгли на всеки четириъгълник е 360°. Причината: диагоналът, който лежи вътре в него, го разделя на два триъгълника, а сборът на ъглите на всеки от тях е 180°."
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Родословно дърво на четириъгълниците</h2>
          <p className={`${text} mb-4`}>
            Специалните четириъгълници са „роднини“. Всяка фигура долу е частен случай на тази
            над нея и наследява всичките ѝ свойства, като добавя и нови.
          </p>
          <FamilyTree />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Видове четириъгълници</h2>
          <p className={`${text} mb-4`}>
            Плъзгай върховете на всяка фигура и наблюдавай кои свойства се запазват.
          </p>
        </section>

        {shapes.map(shape => (
          <section key={shape.type} className="mb-6 sm:mb-8">
            <Theorem
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
          </section>
        ))}

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>Сравнение на свойствата</h2>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <table className="w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold">Свойство</th>
                  {shapes.map(s => (
                    <th key={s.type} className="p-3 font-semibold">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map(row => (
                  <tr key={row.property} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-3">{row.property}</td>
                    {row.values.map((v, i) => (
                      <td
                        key={shapes[i].type}
                        className={`p-3 text-center font-semibold ${v ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        {v ? '✓' : '–'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            При равнобедрения трапец диагоналите също са равни.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <Example
            description="Диагоналите на ромб са 6 cm и 8 cm. Намери лицето, страната и периметъра му."
            steps={[
              'Лице: S = d₁ · d₂ / 2 = 6 · 8 / 2 = 24 cm²',
              'Диагоналите се разполовяват под прав ъгъл и образуват 4 правоъгълни триъгълника с катети 3 cm и 4 cm.',
              'Страна (по Питагоровата теорема): a = √(3² + 4²) = √25 = 5 cm',
              'Периметър: P = 4a = 20 cm',
            ]}
          />
          <Example
            description="Трапец има основи 10 cm и 6 cm и височина 4 cm. Намери средната основа и лицето."
            steps={[
              'Средна основа: m = (10 + 6) / 2 = 8 cm',
              'Лице: S = m · h = 8 · 4 = 32 cm²',
            ]}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className={h2}>⚠️ Чести грешки</h2>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Лице на успоредник със страните', 'S = a · b', 'S = a · hₐ – трябва височината, а не другата страна'],
              ['Забравено делене на 2 при ромба', 'S = d₁ · d₂', 'S = d₁ · d₂ / 2'],
              ['„Квадратът не е правоъгълник“', 'квадратът е отделна фигура', 'квадратът е и правоъгълник, и ромб'],
              ['Смесване на мерните единици', 'P = 12 cm²', 'периметърът е в cm, лицето – в cm²'],
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
          <Quiz questions={quadrangleQuiz} />
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className={text}>
              Листът A4 е правоъгълник с отношение на страните 1 : √2. Това отношение е избрано
              нарочно: когато разрежеш листа на две, получаваш два по-малки правоъгълника със
              същата форма. Най-големият формат A0 има лице точно 1 m². От него чрез разполовяване
              се получават A1, A2, A3 и A4 (210 × 297 mm).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
