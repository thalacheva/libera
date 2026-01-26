import { useState } from 'react';

export default function Lecture02() {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [azimuth, setAzimuth] = useState(135);
  const [altitude, setAltitude] = useState(45);
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Изчисляване на позицията на звездата в хоризонтална система
  const getStarPosition = (azimuth: number, altitude: number) => {
    const centerX = 300;
    const centerY = 250;
    const maxRadius = 150;

    // Преобразуване на азимут (0° = север, по часовниковата стрелка)
    const azimuthRad = ((azimuth - 90) * Math.PI) / 180;

    // Височината определя разстоянието от центъра (90° = център, 0° = край)
    const radius = maxRadius * (1 - altitude / 90);

    return {
      x: centerX + radius * Math.cos(azimuthRad),
      y: centerY + radius * Math.sin(azimuthRad)
    };
  };

  const starPos = getStarPosition(azimuth, altitude);
  const zenithDistance = 90 - altitude;

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 2: Небесни координати
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Защо са нужни координати?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            За да можем точно да определим положението на небесните тела, се
            използват различни координатни системи, подобно на географските
            координати на Земята.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Основни изисквания към координатната система:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Да позволява еднозначно определяне на положението</li>
              <li>Да е удобна за изчисления</li>
              <li>Да отговаря на целите на наблюдението</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Хоризонтална координатна система
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Най-простата и интуитивна система, базирана на хоризонта на наблюдателя.
          </p>

          {/* Интерактивна визуализация */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Интерактивна хоризонтална система</h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Използвайте плъзгачите, за да промените координатите на звездата
            </p>

            <svg viewBox="0 0 600 500" className="w-full h-auto" style={{ maxHeight: '500px' }}>
              {/* Хоризонт (външен кръг) */}
              <circle
                cx="300"
                cy="250"
                r="150"
                fill="rgba(34, 197, 94, 0.1)"
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
              />

              {/* Концентрични кръгове за височина */}
              <circle cx="300" cy="250" r="112.5" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              <circle cx="300" cy="250" r="75" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              <circle cx="300" cy="250" r="37.5" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

              {/* Зенит (център) */}
              <circle
                cx="300"
                cy="250"
                r="5"
                fill="rgb(59, 130, 246)"
                onMouseEnter={() => setHoveredElement('zenith')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text x="310" y="255" fontSize="12" fill="rgb(59, 130, 246)" fontWeight="bold">Z</text>

              {/* Посоки на хоризонта */}
              <text x="300" y="110" fontSize="14" fill="currentColor" fontWeight="bold" textAnchor="middle">С (0°)</text>
              <text x="460" y="255" fontSize="14" fill="currentColor" fontWeight="bold">И (90°)</text>
              <text x="300" y="415" fontSize="14" fill="currentColor" fontWeight="bold" textAnchor="middle">Ю (180°)</text>
              <text x="135" y="255" fontSize="14" fill="currentColor" fontWeight="bold">З (270°)</text>

              {/* Линии за азимут */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const x2 = 300 + 150 * Math.cos(rad);
                const y2 = 250 + 150 * Math.sin(rad);
                return (
                  <line
                    key={angle}
                    x1="300"
                    y1="250"
                    x2={x2}
                    y2={y2}
                    stroke="gray"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.3"
                  />
                );
              })}

              {/* Линия от зенит до звездата (зенитно разстояние) */}
              <line
                x1="300"
                y1="250"
                x2={starPos.x}
                y2={starPos.y}
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Линия за азимут */}
              <line
                x1="300"
                y1="250"
                x2="300"
                y2="100"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                opacity="0.5"
              />
              <path
                d={`M 300,250 L 300,${250 - 80} A 80,80 0 0,1 ${300 + 80 * Math.cos(((azimuth - 90) * Math.PI) / 180)},${250 + 80 * Math.sin(((azimuth - 90) * Math.PI) / 180)}`}
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
              />

              {/* Звездата */}
              <circle
                cx={starPos.x}
                cy={starPos.y}
                r="8"
                fill="gold"
                stroke="white"
                strokeWidth="2"
              >
                <animate
                  attributeName="opacity"
                  values="1;0.6;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text x={starPos.x + 12} y={starPos.y + 5} fontSize="12" fill="gold" fontWeight="bold">★</text>

              {/* Етикети */}
              <text x="320" y="180" fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold">A = {azimuth}°</text>
              <text x="350" y={starPos.y} fontSize="11" fill="rgb(168, 85, 247)" fontWeight="bold">h = {altitude}°</text>
              <text x="350" y={starPos.y + 15} fontSize="10" fill="rgb(168, 85, 247)">z = {zenithDistance}°</text>
            </svg>

            {/* Контроли */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Азимут (A): {azimuth}° - {azimuth === 0 ? 'Север' : azimuth === 90 ? 'Изток' : azimuth === 180 ? 'Юг' : azimuth === 270 ? 'Запад' : ''}
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={azimuth}
                  onChange={(e) => setAzimuth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Височина (h): {altitude}° (Зенитно разстояние z = {zenithDistance}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={altitude}
                  onChange={(e) => setAltitude(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Координати на звездата:</h4>
              <ul className="text-sm space-y-1">
                <li><strong className="text-red-600 dark:text-red-400">Азимут (A):</strong> {azimuth}° (ъгъл от север по часовниковата стрелка)</li>
                <li><strong className="text-purple-600 dark:text-purple-400">Височина (h):</strong> {altitude}° (ъгъл над хоризонта)</li>
                <li><strong className="text-purple-600 dark:text-purple-400">Зенитно разстояние (z):</strong> {zenithDistance}° (ъгъл от зенита)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Основни формули:</h3>
            <ul className="space-y-2">
              <li className="font-mono">h + z = 90° (височина + зенитно разстояние)</li>
              <li className="font-mono">h = 90° - z</li>
              <li className="font-mono">z = 90° - h</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="font-semibold mb-2">⚠️ Недостатък:</p>
            <p>Координатите се променят с времето (поради въртенето на Земята) и зависят от
            местоположението на наблюдателя. Една и съща звезда има различни хоризонтални
            координати за различни наблюдатели.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Екваториална координатна система
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Най-използваната система в астрономията. Координатите са фиксирани спрямо
            небесната сфера и не зависят от времето и местоположението на наблюдателя.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Екваториална система</h3>

            <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Небесна сфера */}
              <ellipse cx="300" cy="200" rx="200" ry="150" fill="rgba(59, 130, 246, 0.05)" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeDasharray="5,5" />

              {/* Небесен екватор */}
              <ellipse
                cx="300"
                cy="200"
                rx="180"
                ry="60"
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="3"
              />
              <text x="470" y="190" fontSize="12" fill="rgb(168, 85, 247)" fontWeight="bold">Небесен екватор</text>

              {/* Меридиани (кръгове на ректасцензия) */}
              {[0, 6, 12, 18].map((hour) => {
                const angle = (hour * 15 - 90) * Math.PI / 180;
                return (
                  <ellipse
                    key={hour}
                    cx="300"
                    cy="200"
                    rx={Math.abs(Math.cos(angle)) * 40}
                    ry="150"
                    fill="none"
                    stroke="gray"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.3"
                    transform={`rotate(${hour * 15} 300 200)`}
                  />
                );
              })}

              {/* Северен полюс */}
              <circle cx="300" cy="50" r="6" fill="rgb(239, 68, 68)" />
              <text x="310" y="55" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">P (Северен полюс)</text>

              {/* Южен полюс */}
              <circle cx="300" cy="350" r="6" fill="rgb(239, 68, 68)" />
              <text x="310" y="355" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">P' (Южен полюс)</text>

              {/* Пролетна точка (0h) */}
              <circle cx="480" cy="200" r="5" fill="rgb(34, 197, 94)" />
              <text x="490" y="205" fontSize="12" fill="rgb(34, 197, 94)" fontWeight="bold">♈ (0h)</text>

              {/* Примерна звезда */}
              <circle cx="400" cy="140" r="8" fill="gold">
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="410" y="145" fontSize="12" fill="gold" fontWeight="bold">Звезда</text>

              {/* Линия за деклинация */}
              <line x1="300" y1="200" x2="400" y2="140" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeDasharray="5,5" />
              <text x="340" y="165" fontSize="11" fill="rgb(59, 130, 246)" fontWeight="bold">δ (деклинация)</text>

              {/* Дъга за ректасцензия */}
              <path
                d="M 480,200 A 180,60 0 0,0 400,140"
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
              />
              <text x="440" y="180" fontSize="11" fill="rgb(168, 85, 247)" fontWeight="bold">α (ректасцензия)</text>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Координати:</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <strong className="text-purple-600 dark:text-purple-400">Ректасцензия (α, RA):</strong>
                  <br/>Аналог на географската дължина. Измерва се от пролетната точка (♈)
                  по небесния екватор в посока, обратна на часовниковата стрелка.
                  <br/>Диапазон: 0h до 24h (или 0° до 360°, където 1h = 15°)
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-blue-400">Деклинация (δ, Dec):</strong>
                  <br/>Аналог на географската ширина. Измерва се от небесния екватор към полюсите.
                  <br/>Диапазон: -90° (южен полюс) до +90° (северен полюс)
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">✅ Предимство:</p>
            <p>Координатите са постоянни за дадено небесно тяло (с малки изменения поради
            прецесия). Независими от местоположението на наблюдателя и времето.</p>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Важни точки:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Пролетна точка (♈)</strong> – началото на координатната система (α = 0h, δ = 0°)</li>
              <li><strong>Есенна точка (♎)</strong> – противоположна на пролетната (α = 12h, δ = 0°)</li>
              <li><strong>Северен небесен полюс</strong> – δ = +90°</li>
              <li><strong>Южен небесен полюс</strong> – δ = -90°</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Връзка между системите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Хоризонталната и екваториалната система са свързани чрез географската ширина
            на наблюдателя и часовия ъгъл на звездата.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Преобразуване:</h3>
            <p className="mb-2">Зависи от:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Географска ширина на наблюдателя (φ)</li>
              <li>Часови ъгъл на звездата (t)</li>
              <li>Деклинация на звездата (δ)</li>
            </ul>
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
              <p className="font-semibold mb-2">1. Намери зенитното разстояние при h = 40°.</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме формулата: z = 90° - h</p>
                  <p>z = 90° - 40° = 50°</p>
                  <p className="mt-2"><strong>Отговор: 50°</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Каква е височината на звезда, която е в зенита?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Зенитът е точката точно над главата на наблюдателя,
                  което означава, че е на максимална височина.</p>
                  <p className="mt-2"><strong>Отговор: h = 90°</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">3. Колко градуса съответстват на 1 час ректасцензия?</p>
              <button
                onClick={() => toggleSolution('a3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Пълният кръг е 360°, което съответства на 24 часа.</p>
                  <p>360° / 24h = 15°/h</p>
                  <p className="mt-2"><strong>Отговор: 15°</strong></p>
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
              <p className="font-semibold mb-2">4. Как се променят координатите на звезда при въртенето на Земята?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Хоризонтални координати (A, h):</strong> Променят се
                  непрекъснато поради въртенето на Земята. Азимутът и височината на звездата се
                  изменят с времето.</p>
                  <p className="mt-2"><strong>Екваториални координати (α, δ):</strong> Остават
                  постоянни (с малки изменения поради прецесия). Не зависят от въртенето на Земята.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">5. Звезда има деклинация δ = +42°. Може ли тя да
              премине през зенита за наблюдател в София (φ ≈ 42°N)?</p>
              <button
                onClick={() => toggleSolution('b5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Звезда може да премине през зенита, ако нейната деклинация
                  е равна на географската ширина на наблюдателя.</p>
                  <p className="mt-2">В този случай: δ = φ = 42°</p>
                  <p className="mt-2"><strong>Отговор: Да, звездата ще премине през зенита.</strong></p>
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
              <p className="font-semibold mb-2">6. Обясни връзката между хоризонталната и
              екваториалната координатна система. Какви параметри са необходими за преобразуване
              от една система в друга?</p>
              <button
                onClick={() => toggleSolution('c6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c6'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Връзката между двете системи се осъществява чрез сферична
                  тригонометрия. Необходими параметри:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>φ</strong> – географска ширина на наблюдателя</li>
                    <li><strong>t</strong> – часови ъгъл на звездата (зависи от времето)</li>
                    <li><strong>δ</strong> – деклинация на звездата</li>
                  </ul>
                  <p className="mt-2">Основна формула за височина:</p>
                  <p className="font-mono mt-1">sin(h) = sin(φ)·sin(δ) + cos(φ)·cos(δ)·cos(t)</p>
                  <p className="mt-2">Тази формула показва, че хоризонталните координати зависят
                  от местоположението (φ) и времето (t), докато екваториалните (α, δ) са постоянни.</p>
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
              <li>✓ Хоризонталната система (A, h) е интуитивна, но зависи от време и място</li>
              <li>✓ Екваториалната система (α, δ) е универсална и постоянна</li>
              <li>✓ h + z = 90° (основна формула за хоризонтална система)</li>
              <li>✓ 1 час ректасцензия = 15°</li>
              <li>✓ Звезда преминава през зенита, ако δ = φ</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Практическо приложение</span>
            </h3>
            <p>
              Съвременните телескопи използват екваториални координати за
              автоматично насочване към избрани обекти. GPS системите в
              астрономията позволяват точност до долни от секундата! Професионалните
              обсерватории използват каталози с прецизни координати на милиони звезди.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
