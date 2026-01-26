import {useState} from 'react';

export default function Lecture19() {
  const [selectedStar, setSelectedStar] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Известни звезди на HR диаграмата
  const stars = [
    { name: 'Ригел', x: 120, y: 50, color: 'rgb(150, 200, 255)', type: 'Син свръхгигант', temp: '11000 K', lum: '120000 L☉' },
    { name: 'Бетелгейзе', x: 520, y: 80, color: 'rgb(255, 100, 50)', type: 'Червен свръхгигант', temp: '3500 K', lum: '100000 L☉' },
    { name: 'Спика', x: 180, y: 150, color: 'rgb(180, 220, 255)', type: 'Син гигант', temp: '22000 K', lum: '2000 L☉' },
    { name: 'Арктур', x: 480, y: 180, color: 'rgb(255, 180, 100)', type: 'Червен гигант', temp: '4300 K', lum: '170 L☉' },
    { name: 'Сириус А', x: 220, y: 250, color: 'rgb(220, 230, 255)', type: 'Главна последователност', temp: '9900 K', lum: '25 L☉' },
    { name: 'Веган', x: 240, y: 260, color: 'rgb(220, 230, 255)', type: 'Главна последователност', temp: '9600 K', lum: '40 L☉' },
    { name: 'Слънце', x: 380, y: 300, color: 'rgb(255, 255, 150)', type: 'Главна последователност (G2V)', temp: '5778 K', lum: '1 L☉' },
    { name: 'Проксима', x: 520, y: 380, color: 'rgb(255, 150, 150)', type: 'Червено джудже', temp: '3000 K', lum: '0.0017 L☉' },
    { name: 'Сириус Б', x: 280, y: 420, color: 'rgb(200, 220, 255)', type: 'Бяло джудже', temp: '25000 K', lum: '0.03 L☉' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 19: Диаграма на Херцшпрунг–Ръсел
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Какво е HR диаграмата?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Диаграмата на Херцшпрунг–Ръсел (HR) е графика, която показва връзката
            между светимостта и температурата (или спектралния клас) на звездите.
            Тя е един от най-важните инструменти в астрономията.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="mb-2">Създадена независимо от:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Ейнар Херцшпрунг</strong> (1911) – датски астроном</li>
              <li><strong>Хенри Норис Ръсел</strong> (1913) – американски астроном</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Интерактивна HR диаграма
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Кликнете на звездите, за да видите информация за тях:
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Диаграма на Херцшпрунг–Ръсел</h3>

            <svg viewBox="0 0 600 500" className="w-full h-auto">
              {/* Оси */}
              <line x1="80" y1="450" x2="580" y2="450" stroke="currentColor" strokeWidth="2" />
              <line x1="80" y1="450" x2="80" y2="30" stroke="currentColor" strokeWidth="2" />

              {/* Етикети на осите */}
              <text x="330" y="485" fontSize="14" textAnchor="middle" fill="currentColor" fontWeight="bold">
                Температура (K) →
              </text>
              <text x="30" y="240" fontSize="14" textAnchor="middle" fill="currentColor" fontWeight="bold" transform="rotate(-90 30 240)">
                Светимост (L☉) →
              </text>

              {/* Температурна скала */}
              <text x="120" y="470" fontSize="11" fill="currentColor">30000</text>
              <text x="220" y="470" fontSize="11" fill="currentColor">10000</text>
              <text x="380" y="470" fontSize="11" fill="currentColor">6000</text>
              <text x="520" y="470" fontSize="11" fill="currentColor">3000</text>

              {/* Светимостна скала (логаритмична) */}
              <text x="60" y="60" fontSize="10" fill="currentColor">10⁶</text>
              <text x="60" y="140" fontSize="10" fill="currentColor">10⁴</text>
              <text x="60" y="220" fontSize="10" fill="currentColor">10²</text>
              <text x="60" y="300" fontSize="10" fill="currentColor">1</text>
              <text x="60" y="380" fontSize="10" fill="currentColor">10⁻²</text>
              <text x="60" y="440" fontSize="10" fill="currentColor">10⁻⁴</text>

              {/* Спектрални класове */}
              <text x="120" y="25" fontSize="13" fill="rgb(150, 200, 255)" fontWeight="bold">O</text>
              <text x="180" y="25" fontSize="13" fill="rgb(180, 220, 255)" fontWeight="bold">B</text>
              <text x="240" y="25" fontSize="13" fill="rgb(220, 230, 255)" fontWeight="bold">A</text>
              <text x="300" y="25" fontSize="13" fill="rgb(255, 255, 220)" fontWeight="bold">F</text>
              <text x="360" y="25" fontSize="13" fill="rgb(255, 255, 150)" fontWeight="bold">G</text>
              <text x="420" y="25" fontSize="13" fill="rgb(255, 200, 100)" fontWeight="bold">K</text>
              <text x="480" y="25" fontSize="13" fill="rgb(255, 150, 100)" fontWeight="bold">M</text>

              {/* Зони на диаграмата */}
              {/* Главна последователност */}
              <path
                d="M 120,380 Q 200,320 280,280 Q 360,250 440,340 Q 480,380 520,420"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="40"
                opacity="0.2"
              />
              <text x="300" y="320" fontSize="13" fill="rgb(59, 130, 246)" fontWeight="bold">
                Главна последователност
              </text>

              {/* Гиганти */}
              <ellipse cx="450" cy="150" rx="100" ry="60" fill="rgb(239, 68, 68)" opacity="0.1" />
              <text x="450" y="155" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold" textAnchor="middle">
                Гиганти
              </text>

              {/* Свръхгиганти */}
              <ellipse cx="320" cy="70" rx="200" ry="40" fill="rgb(168, 85, 247)" opacity="0.1" />
              <text x="320" y="75" fontSize="12" fill="rgb(168, 85, 247)" fontWeight="bold" textAnchor="middle">
                Свръхгиганти
              </text>

              {/* Бели джуджета */}
              <ellipse cx="280" cy="420" rx="60" ry="30" fill="rgb(156, 163, 175)" opacity="0.2" />
              <text x="280" y="425" fontSize="11" fill="rgb(100, 100, 100)" fontWeight="bold" textAnchor="middle">
                Бели джуджета
              </text>

              {/* Звезди */}
              {stars.map((star, i) => (
                <g
                  key={i}
                  onClick={() => setSelectedStar(star.name)}
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedStar(star.name)}
                >
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={selectedStar === star.name ? 10 : 7}
                    fill={star.color}
                    stroke="white"
                    strokeWidth="2"
                  >
                    {selectedStar === star.name && (
                      <animate
                        attributeName="r"
                        values="7;12;7"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  {selectedStar === star.name && (
                    <text
                      x={star.x}
                      y={star.y - 20}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="currentColor"
                    >
                      {star.name}
                    </text>
                  )}
                </g>
              ))}

              {/* Стрелка за еволюция */}
              <path
                d="M 380,300 Q 420,250 450,200"
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd="url(#arrowEvolution)"
              />
              <text x="420" y="240" fontSize="10" fill="rgb(239, 68, 68)">Еволюция</text>

              <defs>
                <marker id="arrowEvolution" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(239, 68, 68)" />
                </marker>
              </defs>
            </svg>

            {/* Информация за избраната звезда */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[100px]">
              {selectedStar ? (
                <div>
                  {stars.filter(s => s.name === selectedStar).map(star => (
                    <div key={star.name}>
                      <h4 className="font-bold text-lg mb-2" style={{ color: star.color }}>
                        {star.name}
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>Тип:</strong> {star.type}</li>
                        <li><strong>Температура:</strong> {star.temp}</li>
                        <li><strong>Светимост:</strong> {star.lum}</li>
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Кликнете или преминете с мишката над звезда, за да видите информация.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Основни области на HR диаграмата
          </h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong className="text-blue-600 dark:text-blue-400">Главна последователност</strong> –
                диагонална лента от горе-ляво (горещи, ярки) към долу-дясно (студени, слаби).
                Тук звездите прекарват 90% от живота си, синтезирайки водород в хелий.
                Слънцето е тук.
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">Червени гиганти</strong> –
                горна дясна част. Големи и студени звезди, които са напуснали главната
                последователност и изгарят хелий.
              </li>
              <li>
                <strong className="text-purple-600 dark:text-purple-400">Свръхгиганти</strong> –
                най-горе на диаграмата. Изключително ярки и масивни звезди. Кратък живот.
              </li>
              <li>
                <strong className="text-gray-600 dark:text-gray-400">Бели джуджета</strong> –
                долу вляво. Малки, горещи, но слаби звезди. Крайна фаза за звезди като Слънцето.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Еволюция на звездите на HR диаграмата
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            HR диаграмата показва еволюционния път на звездите. Звездите не остават
            на едно място, а се движат по диаграмата с времето.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Еволюционен път на звезда като Слънцето:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Раждане на главната последователност (G2V)</li>
              <li>10 милиарда години на главната последователност</li>
              <li>Разширяване → червен гигант (K-M клас)</li>
              <li>Отхвърляне на външни слоеве → планетарна мъглявина</li>
              <li>Остава бяло джудже → бавно охлаждане</li>
            </ol>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Еволюционен път на масивна звезда (&gt;8 M☉):</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Раждане на главната последователност (O-B клас)</li>
              <li>Няколко милиона години на главната последователност</li>
              <li>Разширяване → червен/син свръхгигант</li>
              <li>Синтез на тежки елементи до желязо</li>
              <li>Свръхнова експлозия</li>
              <li>Остава неутронна звезда или черна дупка</li>
            </ol>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Връзка маса-светимост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            За звездите от главната последователност съществува ясна връзка между
            масата и светимостта:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="text-center text-xl font-mono my-3">L ∝ M³·⁵</p>
            <p className="text-center mt-2">или</p>
            <p className="text-center text-lg font-mono my-2">L / L☉ = (M / M☉)³·⁵</p>
            <p className="mt-3">
              <strong>Следствие:</strong> Звезда с двойна маса е около 11 пъти по-ярка,
              но живее много по-кратко време!
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Примери:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Звезда с M = 2 M☉ → L ≈ 11 L☉, живот ≈ 1 млрд. години</li>
              <li>Слънце (M = 1 M☉) → L = 1 L☉, живот ≈ 10 млрд. години</li>
              <li>Звезда с M = 0.5 M☉ → L ≈ 0.03 L☉, живот &gt; 100 млрд. години</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Спектрална класификация
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <svg viewBox="0 0 700 150" className="w-full h-auto">
              {/* Спектрални класове с цветове */}
              {[
                { class: 'O', color: 'rgb(150, 200, 255)', temp: '&gt;30000 K', x: 50 },
                { class: 'B', color: 'rgb(180, 220, 255)', temp: '10000-30000', x: 140 },
                { class: 'A', color: 'rgb(220, 230, 255)', temp: '7500-10000', x: 230 },
                { class: 'F', color: 'rgb(255, 255, 220)', temp: '6000-7500', x: 320 },
                { class: 'G', color: 'rgb(255, 255, 150)', temp: '5200-6000', x: 410 },
                { class: 'K', color: 'rgb(255, 200, 100)', temp: '3700-5200', x: 500 },
                { class: 'M', color: 'rgb(255, 150, 100)', temp: '&lt;3700', x: 590 },
              ].map((item, i) => (
                <g key={i}>
                  <circle cx={item.x} cy="50" r="25" fill={item.color} stroke="white" strokeWidth="2" />
                  <text x={item.x} y="58" fontSize="20" fontWeight="bold" textAnchor="middle" fill="black">
                    {item.class}
                  </text>
                  <text x={item.x} y="95" fontSize="10" textAnchor="middle" fill="currentColor">
                    {item.temp} K
                  </text>
                  {item.class === 'G' && (
                    <text x={item.x} y="110" fontSize="9" textAnchor="middle" fill="rgb(234, 179, 8)" fontWeight="bold">
                      ☀️ Слънце
                    </text>
                  )}
                </g>
              ))}

              {/* Стрелка */}
              <line x1="50" y1="130" x2="640" y2="130" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowTemp)" />
              <text x="30" y="135" fontSize="11" fill="currentColor">Горещи</text>
              <text x="650" y="135" fontSize="11" fill="currentColor">Студени</text>

              <defs>
                <marker id="arrowTemp" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Мнемоника:</strong> "Oh Be A Fine Girl/Guy, Kiss Me"
                (O B A F G K M)
              </p>
              <p className="text-sm">
                Спектралните класове се определят от температурата и спектралните линии.
                Всеки клас се разделя на подкласове 0-9 (напр. G2 за Слънцето).
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            📝 Задачи за упражнение
          </h2>

          {/* Ниво А */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
              Ниво А (Областен кръг)
            </h3>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">1. В коя област на HR диаграмата се намира Слънцето?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: На главната последователност</p>
                  <p className="mt-2">Обяснение: Слънцето е звезда от спектрален клас G2V,
                  където V означава "главна последователност" (dwarf). То е типична звезда
                  от главната последователност с температура 5778 K и светимост 1 L☉.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Коя звезда е по-гореща - червена или синя?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Синята звезда</p>
                  <p className="mt-2">Обяснение: Цветът на звездата зависи от температурата ѝ.
                  По-горещите звезди са сини (O, B класове, &gt;10000 K), по-студените са червени
                  (K, M класове, &lt;5000 K). Това е според закона на Вин.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ниво В */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
              Ниво В (Национален кръг)
            </h3>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">3. Звезда има маса 4 M☉. Изчисли светимостта ѝ,
              ако е на главната последователност. (L ∝ M³·⁵)</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">L / L☉ = (M / M☉)³·⁵</p>
                  <p>L / L☉ = 4³·⁵</p>
                  <p>L / L☉ = 4³ × 4⁰·⁵ = 64 × 2 = 128</p>
                  <p className="mt-2"><strong>Отговор: L ≈ 128 L☉</strong></p>
                  <p className="mt-2 text-sm">Звездата е 128 пъти по-ярка от Слънцето, но ще живее
                  много по-кратко време (около 500 милиона години).</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Защо червените гиганти са толкова ярки, въпреки
              че са студени?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Светимостта зависи от температурата И размера на звездата:</p>
                  <p className="font-mono mt-2">L = 4πR² × σT⁴</p>
                  <p className="mt-2">Червените гиганти имат ниска температура (3000-5000 K), но
                  <strong> огромен радиус</strong> (10-100 пъти по-голям от Слънцето). Големият
                  размер компенсира ниската температура.</p>
                  <p className="mt-2">Пример: Бетелгейзе има T ≈ 3500 K (по-студена от Слънцето),
                  но R ≈ 900 R☉ → L ≈ 100000 L☉!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ниво С */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
              Ниво С (Международна олимпиада)
            </h3>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-red-500">
              <p className="font-semibold mb-2">5. Две звезди имат еднаква температура 6000 K, но
              една е 100 пъти по-ярка от другата. Изчисли съотношението на радиусите им.</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Светимостта на звезда: L = 4πR²σT⁴</p>
                  <p className="mt-2">За две звезди с еднаква температура:</p>
                  <p className="font-mono">L₁ / L₂ = R₁² / R₂²</p>
                  <p className="mt-2">Ако L₁ / L₂ = 100, то:</p>
                  <p>R₁² / R₂² = 100</p>
                  <p>R₁ / R₂ = √100 = 10</p>
                  <p className="mt-2"><strong>Отговор: R₁ = 10 × R₂</strong></p>
                  <p className="mt-2">По-яркатаta звезда има 10 пъти по-голям радиус. Това означава,
                  че едната е вероятно гигант, а другата - звезда от главната последователност.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ HR диаграмата показва връзка между светимост и температура</li>
              <li>✓ Главната последователност - 90% от живота на звездата</li>
              <li>✓ Спектрални класове: O B A F G K M (от горещи към студени)</li>
              <li>✓ L ∝ M³·⁵ за главната последователност</li>
              <li>✓ L = 4πR²σT⁴ (светимост зависи от размер И температура)</li>
              <li>✓ Еволюцията на звездите се вижда като движение по диаграмата</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              HR диаграмата е създадена независимо от Ейнар Херцшпрунг (1911) и
              Хенри Норис Ръсел (1913). Тя е революционизирала разбирането ни за
              звездите и тяхната еволюция. Днес HR диаграмата е основен инструмент
              за определяне на възрастта на звездни купове и изследване на звездната еволюция!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
