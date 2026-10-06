import { useState } from 'react';

export default function Lecture18() {
  const [selectedStar, setSelectedStar] = useState<string>('sun');
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const stars = {
    sun: {
      name: 'Слънце',
      type: 'G2V',
      temp: 5778,
      mass: 1,
      radius: 1,
      luminosity: 1,
      color: 'rgb(255, 255, 150)',
      size: 30,
    },
    sirius: {
      name: 'Сириус А',
      type: 'A1V',
      temp: 9940,
      mass: 2.02,
      radius: 1.71,
      luminosity: 25,
      color: 'rgb(220, 230, 255)',
      size: 35,
    },
    betelgeuse: {
      name: 'Бетелгейзе',
      type: 'M1-2',
      temp: 3500,
      mass: 20,
      radius: 900,
      luminosity: 100000,
      color: 'rgb(255, 100, 50)',
      size: 80,
    },
    rigel: {
      name: 'Ригел',
      type: 'B8',
      temp: 11000,
      mass: 21,
      radius: 78,
      luminosity: 120000,
      color: 'rgb(150, 200, 255)',
      size: 50,
    },
    proxima: {
      name: 'Проксима Кентавър',
      type: 'M5.5V',
      temp: 3042,
      mass: 0.12,
      radius: 0.14,
      luminosity: 0.0017,
      color: 'rgb(255, 150, 150)',
      size: 15,
    },
  };

  const star = stars[selectedStar as keyof typeof stars];

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 18: Звезди – основни характеристики
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Какво е звезда?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Звездата е самосветещо небесно тяло, което произвежда енергия чрез
            ядрен синтез в ядрото си.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Интерактивно сравнение на звезди
          </h2>

          {/* Избор на звезда */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedStar('proxima')}
              className={`px-3 py-2 rounded text-sm ${selectedStar === 'proxima' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Проксима (M)
            </button>
            <button
              onClick={() => setSelectedStar('sun')}
              className={`px-3 py-2 rounded text-sm ${selectedStar === 'sun' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ☀️ Слънце (G)
            </button>
            <button
              onClick={() => setSelectedStar('sirius')}
              className={`px-3 py-2 rounded text-sm ${selectedStar === 'sirius' ? 'bg-blue-300 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Сириус (A)
            </button>
            <button
              onClick={() => setSelectedStar('rigel')}
              className={`px-3 py-2 rounded text-sm ${selectedStar === 'rigel' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Ригел (B)
            </button>
            <button
              onClick={() => setSelectedStar('betelgeuse')}
              className={`px-3 py-2 rounded text-sm ${selectedStar === 'betelgeuse' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Бетелгейзе (M)
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">{star.name}</h3>
            
            <svg viewBox="0 0 700 400" className="w-full h-auto">
              {/* Фон */}
              <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />
              
              {/* Звезди на фона */}
              {[...Array(80)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 700}
                  cy={Math.random() * 400}
                  r={Math.random() * 1.5}
                  fill="white"
                  opacity={Math.random() * 0.6 + 0.2}
                />
              ))}

              {/* Избраната звезда */}
              <circle
                cx="350"
                cy="200"
                r={star.size}
                fill={star.color}
              >
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.8"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Корона/светимост */}
              <circle
                cx="350"
                cy="200"
                r={star.size + 10}
                fill={star.color}
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  values={`${star.size + 5};${star.size + 15};${star.size + 5}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Слънце за сравнение (малко, отстрани) */}
              <circle cx="600" cy="350" r="15" fill="rgb(255, 255, 150)" opacity="0.5" />
              <text x="600" y="375" fontSize="10" textAnchor="middle" fill="white">
                Слънце (за сравнение)
              </text>

              {/* Информационна карта */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="250" height="180" fill="rgba(0, 0, 0, 0.8)" rx="10" />
                <text x="125" y="30" fontSize="16" fontWeight="bold" textAnchor="middle" fill={star.color}>
                  {star.name}
                </text>
                
                <text x="15" y="55" fontSize="12" fill="white">
                  Спектрален клас: <tspan fontWeight="bold" fill={star.color}>{star.type}</tspan>
                </text>
                <text x="15" y="75" fontSize="12" fill="white">
                  Температура: <tspan fontWeight="bold">{star.temp} K</tspan>
                </text>
                <text x="15" y="95" fontSize="12" fill="white">
                  Маса: <tspan fontWeight="bold">{star.mass} M☉</tspan>
                </text>
                <text x="15" y="115" fontSize="12" fill="white">
                  Радиус: <tspan fontWeight="bold">{star.radius} R☉</tspan>
                </text>
                <text x="15" y="135" fontSize="12" fill="white">
                  Светимост: <tspan fontWeight="bold">{star.luminosity} L☉</tspan>
                </text>
                
                {/* Цветна лента за температура */}
                <rect x="15" y="145" width="220" height="20" fill={star.color} rx="5" />
                <text x="125" y="160" fontSize="10" textAnchor="middle" fill="black" fontWeight="bold">
                  Цвят
                </text>
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Сравнение със Слънцето:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Маса: {star.mass}x</div>
                <div>Радиус: {star.radius}x</div>
                <div>Светимост: {star.luminosity}x</div>
                <div>Температура: {(star.temp / 5778).toFixed(2)}x</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Основни параметри на звездите
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Маса</strong> – от 0.08 до 200 слънчеви маси (M☉)</li>
              <li><strong>Радиус</strong> – от 0.1 до 1000 слънчеви радиуса (R☉)</li>
              <li><strong>Температура</strong> – от 2000 до 50 000 K</li>
              <li><strong>Светимост</strong> – от 0.0001 до 1 000 000 слънчеви светимости (L☉)</li>
              <li><strong>Цвят</strong> – червени, оранжеви, жълти, бели, сини</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Спектрална класификация
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Спектрални класове (O B A F G K M)</h3>
            
            <svg viewBox="0 0 700 300" className="w-full h-auto">
              {/* Фон */}
              <rect x="0" y="0" width="700" height="300" fill="rgb(10, 10, 30)" />

              {/* Спектрални класове с цветове и размери */}
              {[
                { class: 'O', temp: '30000+', color: 'rgb(150, 200, 255)', size: 35, y: 80 },
                { class: 'B', temp: '10000-30000', color: 'rgb(180, 220, 255)', size: 32, y: 90 },
                { class: 'A', temp: '7500-10000', color: 'rgb(220, 230, 255)', size: 28, y: 100 },
                { class: 'F', temp: '6000-7500', color: 'rgb(255, 255, 220)', size: 25, y: 110 },
                { class: 'G', temp: '5200-6000', color: 'rgb(255, 255, 150)', size: 22, y: 120 },
                { class: 'K', temp: '3700-5200', color: 'rgb(255, 200, 100)', size: 20, y: 130 },
                { class: 'M', temp: '<3700', color: 'rgb(255, 150, 100)', size: 18, y: 140 },
              ].map((item, i) => (
                <g key={i} transform={`translate(${50 + i * 90}, 0)`}>
                  {/* Звезда */}
                  <circle cx="50" cy={item.y} r={item.size} fill={item.color}>
                    <animate
                      attributeName="opacity"
                      values="0.7;1;0.7"
                      dur={`${2 + i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Спектрален клас */}
                  <text x="50" y={item.y + 8} fontSize="24" fontWeight="bold" textAnchor="middle" fill="black">
                    {item.class}
                  </text>
                  
                  {/* Температура */}
                  <text x="50" y={item.y + 60} fontSize="10" textAnchor="middle" fill="white">
                    {item.temp} K
                  </text>
                  
                  {/* Специален маркер за Слънцето */}
                  {item.class === 'G' && (
                    <text x="50" y={item.y + 75} fontSize="11" textAnchor="middle" fill="rgb(255, 255, 100)" fontWeight="bold">
                      ☀️ Слънце
                    </text>
                  )}
                </g>
              ))}

              {/* Стрелка за температура */}
              <g transform="translate(0, 220)">
                <line x1="50" y1="0" x2="650" y2="0" stroke="white" strokeWidth="2" markerEnd="url(#arrowTemp)" />
                <text x="30" y="5" fontSize="12" fill="rgb(150, 200, 255)" fontWeight="bold">Горещи</text>
                <text x="620" y="5" fontSize="12" fill="rgb(255, 150, 100)" fontWeight="bold">Студени</text>
              </g>

              {/* Мнемоника */}
              <text x="350" y="270" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">
                Oh Be A Fine Girl/Guy, Kiss Me
              </text>
              <text x="350" y="290" fontSize="11" textAnchor="middle" fill="gray">
                (Мнемоника за запомняне)
              </text>

              <defs>
                <marker id="arrowTemp" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="white" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <p className="text-sm">
                <strong>O B A F G K M</strong> - от горещи към студени. Всеки клас се разделя
                на подкласове 0-9 (напр. G2 за Слънцето). По-горещите звезди са по-сини,
                по-студените - по-червени.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Видима и абсолютна звездна величина
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Има два начина да измерим яркостта на звездите:
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Звездни величини</h3>
            
            <svg viewBox="0 0 700 350" className="w-full h-auto">
              <rect x="0" y="0" width="700" height="350" fill="rgb(10, 10, 30)" />

              {/* Земя */}
              <circle cx="100" cy="175" r="20" fill="rgb(59, 130, 246)" />
              <text x="100" y="210" fontSize="12" textAnchor="middle" fill="white">🌍 Земя</text>

              {/* Близка слаба звезда */}
              <g>
                <circle cx="250" cy="175" r="8" fill="rgb(255, 200, 150)">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                </circle>
                <line x1="100" y1="175" x2="240" y2="175" stroke="gray" strokeWidth="1" strokeDasharray="3,3" />
                <text x="250" y="210" fontSize="11" textAnchor="middle" fill="white">Близка</text>
                <text x="250" y="225" fontSize="10" textAnchor="middle" fill="gray">m = 5</text>
                <text x="250" y="240" fontSize="10" textAnchor="middle" fill="rgb(100, 200, 255)">M = 5</text>
              </g>

              {/* Далечна ярка звезда */}
              <g>
                <circle cx="550" cy="175" r="12" fill="rgb(150, 200, 255)">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <line x1="100" y1="175" x2="535" y2="175" stroke="gray" strokeWidth="1" strokeDasharray="3,3" />
                <text x="550" y="210" fontSize="11" textAnchor="middle" fill="white">Далечна</text>
                <text x="550" y="225" fontSize="10" textAnchor="middle" fill="gray">m = 5</text>
                <text x="550" y="240" fontSize="10" textAnchor="middle" fill="rgb(100, 200, 255)">M = -5</text>
              </g>

              {/* Стрелки за разстояние */}
              <text x="175" y="160" fontSize="10" fill="gray">близо</text>
              <text x="375" y="160" fontSize="10" fill="gray">далеч</text>

              {/* Обяснение */}
              <g transform="translate(20, 270)">
                <rect x="0" y="0" width="660" height="60" fill="rgba(0, 0, 0, 0.7)" rx="5" />
                <text x="10" y="20" fontSize="12" fill="white">
                  <tspan fontWeight="bold" fill="gray">Видима величина (m):</tspan> Колко ярка изглежда от Земята
                </text>
                <text x="10" y="40" fontSize="12" fill="white">
                  <tspan fontWeight="bold" fill="rgb(100, 200, 255)">Абсолютна величина (M):</tspan> Колко ярка би била на 10 парсека
                </text>
                <text x="10" y="55" fontSize="10" fill="rgb(255, 200, 100)">
                  Формула: m - M = 5 × log₁₀(d/10)
                </text>
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Важно:</strong> По-малка величина = по-ярка звезда!
              </p>
              <ul className="text-sm space-y-1">
                <li>m = -26.7: Слънце (от Земята)</li>
                <li>m = -12.6: Пълнолуние</li>
                <li>m = -1.46: Сириус (най-яркатаta звезда)</li>
                <li>m = 0: Вега (референтна)</li>
                <li>m = 6: Граница на видимост с просто око</li>
                <li>m = 30: Граница на Хъбъл</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Връзка между параметрите
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Основни формули</h3>
            
            <svg viewBox="0 0 600 300" className="w-full h-auto">
              <rect x="0" y="0" width="600" height="300" fill="rgb(20, 20, 40)" />

              {/* Формула за светимост */}
              <g transform="translate(50, 50)">
                <rect x="0" y="0" width="500" height="70" fill="rgba(59, 130, 246, 0.2)" rx="10" />
                <text x="250" y="25" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                  Светимост
                </text>
                <text x="250" y="50" fontSize="16" fontWeight="bold" textAnchor="middle" fill="rgb(255, 200, 100)">
                  L = 4πR² × σT⁴
                </text>
                <text x="20" y="65" fontSize="10" fill="white">σ = 5.67×10⁻⁸ W/(m²·K⁴) - константа на Стефан-Болцман</text>
              </g>

              {/* Формула за маса-светимост */}
              <g transform="translate(50, 140)">
                <rect x="0" y="0" width="500" height="70" fill="rgba(168, 85, 247, 0.2)" rx="10" />
                <text x="250" y="25" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                  Връзка маса-светимост (главна последователност)
                </text>
                <text x="250" y="50" fontSize="16" fontWeight="bold" textAnchor="middle" fill="rgb(255, 200, 100)">
                  L ∝ M³·⁵
                </text>
                <text x="20" y="65" fontSize="10" fill="white">По-масивните звезди са много по-ярки, но живеят по-кратко</text>
              </g>

              {/* Формула за закон на Вин */}
              <g transform="translate(50, 230)">
                <rect x="0" y="0" width="500" height="60" fill="rgba(34, 197, 94, 0.2)" rx="10" />
                <text x="250" y="25" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                  Закон на Вин (връзка температура-цвят)
                </text>
                <text x="250" y="48" fontSize="16" fontWeight="bold" textAnchor="middle" fill="rgb(255, 200, 100)">
                  λₘₐₓ × T = 2.898 × 10⁻³ m·K
                </text>
              </g>
            </svg>
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
              <p className="font-semibold mb-2">1. Коя звезда е по-гореща - синя или червена?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Синята звезда</p>
                  <p className="mt-2">Обяснение: Цветът на звездата зависи от температурата ѝ
                  (закон на Вин). По-горещите звезди са сини (O, B класове, &gt;10 000 K),
                  по-студените са червени (K, M класове, &lt;5000 K).</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Какъв е спектралният клас на Слънцето?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: G2V</p>
                  <p className="mt-2">Обяснение: G2 означава жълта звезда с температура около 5778 K.
                  V означава "главна последователност" (dwarf - джудже, за разлика от гигант).
                  Слънцето е типична звезда от главната последователност.</p>
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
              <p className="font-semibold mb-2">3. Звезда има температура 10 000 K. Използвайки
              закона на Вин, изчисли при каква дължина на вълната излъчва най-интензивно.</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Закон на Вин: λₘₐₓ × T = 2.898 × 10⁻³ m·K</p>
                  <p className="mt-2">λₘₐₓ = 2.898 × 10⁻³ / T</p>
                  <p>λₘₐₓ = 2.898 × 10⁻³ / 10 000</p>
                  <p>λₘₐₓ = 2.898 × 10⁻⁷ m = 289.8 nm</p>
                  <p className="mt-2"><strong>Отговор: около 290 nm (ултравиолетово)</strong></p>
                  <p className="mt-2 text-sm">Това е в UV диапазона, затова горещите звезди
                  изглеждат сини - пикът е в UV, но виждаме синия край на спектъра.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Две звезди имат еднаква видима величина m = 5.
              Едната е на 10 pc, другата на 100 pc. Коя е по-ярка наистина?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме формулата: m - M = 5 × log₁₀(d/10)</p>
                  
                  <p className="mt-2"><strong>Звезда 1 (d = 10 pc):</strong></p>
                  <p>5 - M = 5 × log₁₀(10/10) = 5 × 0 = 0</p>
                  <p>M₁ = 5</p>
                  
                  <p className="mt-2"><strong>Звезда 2 (d = 100 pc):</strong></p>
                  <p>5 - M = 5 × log₁₀(100/10) = 5 × 1 = 5</p>
                  <p>M₂ = 0</p>
                  
                  <p className="mt-2"><strong>Отговор: Звезда 2 е по-ярка наистина</strong></p>
                  <p className="mt-2">M₂ = 0 &lt; M₁ = 5 (по-малка величина = по-ярка)</p>
                  <p className="mt-2 text-sm">Въпреки че изглеждат еднакво ярки от Земята, звезда 2
                  е 100 пъти по-ярка наистина, но е 10 пъти по-далеч.</p>
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
              <p className="font-semibold mb-2">5. Звезда А има двойна температура и двойна маса
              спрямо звезда Б. Колко пъти е по-ярка звезда А? (Използвай L = 4πR²σT⁴ и L ∝ M³·⁵)</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Имаме два подхода:</p>
                  
                  <p className="mt-3"><strong>Подход 1: Използваме L ∝ M³·⁵</strong></p>
                  <p>Ако Mₐ = 2Mᵦ, то:</p>
                  <p>Lₐ / Lᵦ = (Mₐ / Mᵦ)³·⁵ = 2³·⁵ = 2³ × 2⁰·⁵ = 8 × √2 ≈ 11.3</p>
                  
                  <p className="mt-3"><strong>Подход 2: Проверка с L = 4πR²σT⁴</strong></p>
                  <p>За звезди от главната последователност: R ∝ M⁰·⁸</p>
                  <p>Ако Mₐ = 2Mᵦ, то Rₐ = 2⁰·⁸Rᵦ ≈ 1.74Rᵦ</p>
                  <p className="mt-2">Lₐ / Lᵦ = (Rₐ/Rᵦ)² × (Tₐ/Tᵦ)⁴</p>
                  <p>= 1.74² × 2⁴ = 3.03 × 16 ≈ 48.5</p>
                  
                  <p className="mt-3"><strong>Отговор зависи от предположенията:</strong></p>
                  <p className="mt-1">• Ако използваме само M: ~11 пъти</p>
                  <p>• Ако T наистина е двойна (не типично за главна последователност): ~48 пъти</p>
                  
                  <p className="mt-3 text-sm font-semibold">Важно: За звезди от главната последователност
                  температурата и масата са свързани, не могат да се променят независимо!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Основни параметри: маса, радиус, температура, светимост</li>
              <li>✓ Спектрални класове: O B A F G K M (от горещи към студени)</li>
              <li>✓ L = 4πR²σT⁴ (светимост от размер и температура)</li>
              <li>✓ L ∝ M³·⁵ (за главна последователност)</li>
              <li>✓ Видима величина (m) vs абсолютна величина (M)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Интересен факт</span>
            </h3>
            <p>
              Най-масивната известна звезда е R136a1 с маса около 265 M☉ и светимост
              8.7 милиона L☉! Тя е толкова ярка, че ако беше на мястото на Слънцето,
              щеше да изпари Земята за секунди. За щастие, тя е на 165 000 светлинни
              години в Голямото Магеланово облаче. Най-малките звезди (червени джуджета)
              имат маса само 0.08 M☉ и ще живеят трилиони години - по-дълго от
              настоящата възраст на Вселената!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
