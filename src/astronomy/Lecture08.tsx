import { useState } from 'react';

export default function Lecture08() {
  const [altitude, setAltitude] = useState(400); // km над Земята
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Константи
  const earthRadius = 6371; // km
  const G = 6.674e-11; // N⋅m²/kg²
  const M = 5.972e24; // kg (маса на Земята)
  
  // Изчисляване на орбитална скорост
  const r = (earthRadius + altitude) * 1000; // в метри
  const orbitalVelocity = Math.sqrt(G * M / r) / 1000; // km/s
  
  // Втора космическа скорост (скорост на освобождаване)
  const escapeVelocity = Math.sqrt(2 * G * M / r) / 1000; // km/s

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 8: Орбити и скорости
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Орбитална скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Орбиталната скорост е скоростта, с която едно тяло се движи по
            орбита около друго тяло. Тя зависи от масата на централното тяло и
            разстоянието до него.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">Формула за орбитална скорост:</h3>
            <p className="text-center text-xl font-mono my-3">v = √(GM / r)</p>
            <ul className="list-disc list-inside space-y-2">
              <li>v – орбитална скорост</li>
              <li>G – гравитационна константа (6.674 × 10⁻¹¹ N⋅m²/kg²)</li>
              <li>M – маса на централното тяло</li>
              <li>r – разстояние от центъра на централното тяло</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Интерактивна визуализация на орбити
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Орбитална скорост на различни височини</h3>
            
            <svg viewBox="0 0 600 500" className="w-full h-auto">
              {/* Фон - космос */}
              <rect x="0" y="0" width="600" height="500" fill="rgb(10, 10, 30)" />
              
              {/* Звезди */}
              {[...Array(60)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 600}
                  cy={Math.random() * 500}
                  r={Math.random() * 1.5}
                  fill="white"
                  opacity={Math.random() * 0.6 + 0.2}
                />
              ))}

              {/* Земя */}
              <circle cx="300" cy="250" r="60" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="250" r="60" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              
              {/* Континенти (опростени) */}
              <path d="M 280,230 Q 290,225 300,230 L 305,240 Q 300,245 295,240 Z" fill="rgb(34, 197, 94)" />
              <path d="M 310,260 Q 320,255 325,265 L 320,275 Z" fill="rgb(34, 197, 94)" />
              
              <text x="300" y="330" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                🌍 Земя
              </text>

              {/* Орбита на текущата височина */}
              <circle
                cx="300"
                cy="250"
                r={60 + altitude * 0.15}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="3"
              />

              {/* Спътник на орбитата */}
              <g>
                <circle
                  cx={300 + (60 + altitude * 0.15)}
                  cy="250"
                  r="8"
                  fill="rgb(200, 200, 200)"
                  stroke="white"
                  strokeWidth="2"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 300 250"
                    to="360 300 250"
                    dur={`${10 / orbitalVelocity}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Стрелка за посока */}
                <path
                  d={`M ${300 + (60 + altitude * 0.15) + 15},250 L ${300 + (60 + altitude * 0.15) + 25},250`}
                  stroke="rgb(255, 200, 100)"
                  strokeWidth="2"
                  markerEnd="url(#arrowOrbit)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 300 250"
                    to="360 300 250"
                    dur={`${10 / orbitalVelocity}s`}
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Референтни орбити */}
              {/* МКС (400 km) */}
              <circle cx="300" cy="250" r="120" fill="none" stroke="rgb(100, 150, 200)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              <text x="420" y="255" fontSize="9" fill="rgb(100, 150, 200)">МКС (400 km)</text>
              
              {/* GPS (20200 km) */}
              <circle cx="300" cy="250" r="180" fill="none" stroke="rgb(150, 200, 100)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
              <text x="480" y="255" fontSize="9" fill="rgb(150, 200, 100)">GPS (20200 km)</text>

              {/* Информация */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="220" height="110" fill="rgba(0, 0, 0, 0.8)" rx="5" />
                <text x="110" y="25" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                  Орбитални параметри
                </text>
                <text x="10" y="50" fontSize="11" fill="white">
                  Височина: <tspan fontWeight="bold" fill="rgb(168, 85, 247)">{altitude} km</tspan>
                </text>
                <text x="10" y="70" fontSize="11" fill="white">
                  Орбитална скорост:
                </text>
                <text x="10" y="85" fontSize="13" fontWeight="bold" fill="rgb(255, 200, 100)">
                  v = {orbitalVelocity.toFixed(2)} km/s
                </text>
                <text x="10" y="105" fontSize="10" fill="gray">
                  ({(orbitalVelocity * 3600).toFixed(0)} km/h)
                </text>
              </g>

              <defs>
                <marker id="arrowOrbit" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 200, 100)" />
                </marker>
              </defs>
            </svg>

            {/* Контрола */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Височина над Земята: {altitude} km
              </label>
              <input
                type="range"
                min="200"
                max="36000"
                step="100"
                value={altitude}
                onChange={(e) => setAltitude(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>200 km (ниска орбита)</span>
                <span>36000 km (геостационарна)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>📉 Колкото по-високо, толкова по-бавна е орбиталната скорост</li>
                <li>🛰️ МКС (400 km): v ≈ 7.66 km/s, период ≈ 90 минути</li>
                <li>📡 GPS (20200 km): v ≈ 3.87 km/s, период ≈ 12 часа</li>
                <li>🌍 Геостационарна (35786 km): v ≈ 3.07 km/s, период = 24 часа</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Космически скорости
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Три космически скорости</h3>
            
            <svg viewBox="0 0 700 400" className="w-full h-auto">
              <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />

              {/* Земя */}
              <circle cx="150" cy="200" r="50" fill="rgb(59, 130, 246)" />
              <circle cx="150" cy="200" r="50" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />

              {/* Първа космическа скорост - орбита */}
              <g>
                <ellipse cx="150" cy="200" rx="90" ry="85" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="3" />
                <text x="150" y="120" fontSize="13" textAnchor="middle" fill="rgb(34, 197, 94)" fontWeight="bold">
                  1-ва космическа
                </text>
                <text x="150" y="135" fontSize="11" textAnchor="middle" fill="rgb(34, 197, 94)">
                  v₁ = 7.9 km/s
                </text>
                <text x="150" y="150" fontSize="10" textAnchor="middle" fill="white">
                  (орбита около Земята)
                </text>
                
                {/* Анимиран спътник */}
                <circle cx="240" cy="200" r="6" fill="rgb(200, 200, 200)">
                  <animateMotion
                    path="M 90,0 A 90,85 0 1,1 89.9,0"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Втора космическа скорост - избягване */}
              <g>
                <path
                  d="M 150,150 Q 300,100 450,80"
                  fill="none"
                  stroke="rgb(255, 165, 0)"
                  strokeWidth="3"
                />
                <text x="300" y="70" fontSize="13" textAnchor="middle" fill="rgb(255, 165, 0)" fontWeight="bold">
                  2-ра космическа
                </text>
                <text x="300" y="85" fontSize="11" textAnchor="middle" fill="rgb(255, 165, 0)">
                  v₂ = 11.2 km/s
                </text>
                <text x="300" y="100" fontSize="10" textAnchor="middle" fill="white">
                  (напуска Земята)
                </text>
                
                {/* Анимирана ракета */}
                <g>
                  <polygon points="0,-8 -4,8 4,8" fill="rgb(255, 200, 100)">
                    <animateMotion
                      path="M 0,0 Q 150,-50 300,-70"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </polygon>
                  <circle cx="0" cy="10" r="2" fill="rgb(255, 100, 50)">
                    <animateMotion
                      path="M 0,0 Q 150,-50 300,-70"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                    <animate attributeName="opacity" values="1;0" dur="0.5s" repeatCount="indefinite" />
                  </circle>
                </g>
              </g>

              {/* Трета космическа скорост - напуска Слънчевата система */}
              <g>
                <path
                  d="M 150,250 Q 250,320 400,350"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                />
                <text x="280" y="345" fontSize="13" textAnchor="middle" fill="rgb(239, 68, 68)" fontWeight="bold">
                  3-та космическа
                </text>
                <text x="280" y="360" fontSize="11" textAnchor="middle" fill="rgb(239, 68, 68)">
                  v₃ = 16.7 km/s
                </text>
                <text x="280" y="375" fontSize="10" textAnchor="middle" fill="white">
                  (напуска Слънчевата система)
                </text>
              </g>

              {/* Легенда */}
              <g transform="translate(480, 20)">
                <rect x="0" y="0" width="200" height="100" fill="rgba(0, 0, 0, 0.8)" rx="5" />
                <text x="10" y="20" fontSize="12" fontWeight="bold" fill="white">
                  Космически скорости
                </text>
                <line x1="10" y1="35" x2="30" y2="35" stroke="rgb(34, 197, 94)" strokeWidth="3" />
                <text x="35" y="40" fontSize="10" fill="white">1-ва: орбита</text>
                
                <line x1="10" y1="55" x2="30" y2="55" stroke="rgb(255, 165, 0)" strokeWidth="3" />
                <text x="35" y="60" fontSize="10" fill="white">2-ра: избягване</text>
                
                <line x1="10" y1="75" x2="30" y2="75" stroke="rgb(239, 68, 68)" strokeWidth="3" strokeDasharray="4,2" />
                <text x="35" y="80" fontSize="10" fill="white">3-та: Слънч. сист.</text>
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Обяснение:</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <strong className="text-green-600 dark:text-green-400">Първа космическа (v₁ = 7.9 km/s):</strong> 
                  Минимална скорост за орбита на малка височина около Земята
                </li>
                <li>
                  <strong className="text-orange-600 dark:text-orange-400">Втора космическа (v₂ = 11.2 km/s):</strong> 
                  Скорост на освобождаване - напуска гравитационното поле на Земята
                </li>
                <li>
                  <strong className="text-red-600 dark:text-red-400">Трета космическа (v₃ = 16.7 km/s):</strong> 
                  Напуска Слънчевата система от орбитата на Земята
                </li>
              </ul>
            </div>
          </div>

          {/* Интерактивен калкулатор */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Калкулатор на орбитална скорост</h3>
            
            <svg viewBox="0 0 600 350" className="w-full h-auto">
              <rect x="0" y="0" width="600" height="350" fill="rgb(20, 20, 40)" />

              {/* Земя с атмосфера */}
              <defs>
                <radialGradient id="atmosphere">
                  <stop offset="0%" stopColor="rgba(100, 150, 255, 0)" />
                  <stop offset="70%" stopColor="rgba(100, 150, 255, 0.3)" />
                  <stop offset="100%" stopColor="rgba(100, 150, 255, 0)" />
                </radialGradient>
              </defs>
              
              <circle cx="300" cy="175" r="70" fill="url(#atmosphere)" />
              <circle cx="300" cy="175" r="50" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="175" r="50" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />

              {/* Орбита */}
              <circle
                cx="300"
                cy="175"
                r={50 + altitude * 0.12}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
              />

              {/* Спътник */}
              <circle
                cx={300 + 50 + altitude * 0.12}
                cy="175"
                r="6"
                fill="rgb(200, 200, 200)"
              />
              <text
                x={300 + 50 + altitude * 0.12}
                y={175 - 15}
                fontSize="10"
                textAnchor="middle"
                fill="white"
              >
                🛰️
              </text>

              {/* Данни */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="250" height="140" fill="rgba(0, 0, 0, 0.8)" rx="5" />
                <text x="10" y="25" fontSize="13" fontWeight="bold" fill="white">
                  На височина {altitude} km:
                </text>
                <text x="10" y="50" fontSize="11" fill="white">
                  Радиус орбита: <tspan fontWeight="bold">{(earthRadius + altitude).toFixed(0)} km</tspan>
                </text>
                <text x="10" y="70" fontSize="11" fill="white">
                  Орбитална скорост:
                </text>
                <text x="10" y="90" fontSize="15" fontWeight="bold" fill="rgb(255, 200, 100)">
                  v = {orbitalVelocity.toFixed(2)} km/s
                </text>
                <text x="10" y="110" fontSize="11" fill="white">
                  Скорост на освобождаване:
                </text>
                <text x="10" y="130" fontSize="13" fontWeight="bold" fill="rgb(255, 150, 100)">
                  v_esc = {escapeVelocity.toFixed(2)} km/s
                </text>
              </g>

              {/* Сравнение със звука */}
              <g transform="translate(400, 280)">
                <text x="0" y="0" fontSize="10" fill="gray">
                  Скорост на звука: 0.34 km/s
                </text>
                <text x="0" y="15" fontSize="10" fill="rgb(255, 200, 100)">
                  Орбитална: {(orbitalVelocity / 0.34).toFixed(0)}x по-бърза
                </text>
              </g>
            </svg>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Видове орбити
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
            <svg viewBox="0 0 700 400" className="w-full h-auto">
              <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />

              {/* Централно тяло */}
              <circle cx="150" cy="200" r="30" fill="rgb(251, 191, 36)" />
              <text x="150" y="245" fontSize="11" textAnchor="middle" fill="white">Централно тяло</text>

              {/* Кръгова орбита */}
              <circle cx="150" cy="200" r="70" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="3" />
              <text x="230" y="200" fontSize="12" fill="rgb(34, 197, 94)" fontWeight="bold">
                Кръгова (e=0)
              </text>

              {/* Елиптична орбита */}
              <ellipse cx="180" cy="200" rx="120" ry="90" fill="none" stroke="rgb(168, 85, 247)" strokeWidth="3" />
              <text x="310" y="200" fontSize="12" fill="rgb(168, 85, 247)" fontWeight="bold">
                Елиптична (0&lt;e&lt;1)
              </text>
              <circle cx="150" cy="200" r="4" fill="rgb(168, 85, 247)" />
              <text x="150" y="185" fontSize="9" fill="rgb(168, 85, 247)">фокус</text>

              {/* Параболична орбита */}
              <path
                d="M 150,130 Q 250,150 350,100"
                fill="none"
                stroke="rgb(255, 165, 0)"
                strokeWidth="3"
              />
              <text x="280" y="120" fontSize="12" fill="rgb(255, 165, 0)" fontWeight="bold">
                Параболична (e=1)
              </text>

              {/* Хиперболична орбита */}
              <path
                d="M 150,270 Q 280,250 420,280"
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="3"
              />
              <text x="310" y="290" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">
                Хиперболична (e&gt;1)
              </text>

              {/* Обяснение */}
              <g transform="translate(450, 50)">
                <rect x="0" y="0" width="230" height="140" fill="rgba(0, 0, 0, 0.8)" rx="5" />
                <text x="115" y="25" fontSize="13" fontWeight="bold" textAnchor="middle" fill="white">
                  Ексцентрицитет (e)
                </text>
                <text x="10" y="50" fontSize="10" fill="rgb(34, 197, 94)">
                  e = 0: Кръг
                </text>
                <text x="10" y="70" fontSize="10" fill="rgb(168, 85, 247)">
                  0 &lt; e &lt; 1: Елипса (затворена)
                </text>
                <text x="10" y="90" fontSize="10" fill="rgb(255, 165, 0)">
                  e = 1: Парабола (граница)
                </text>
                <text x="10" y="110" fontSize="10" fill="rgb(239, 68, 68)">
                  e &gt; 1: Хипербола (отворена)
                </text>
                <text x="10" y="130" fontSize="9" fill="gray">
                  v &lt; v_esc: затворена орбита
                </text>
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">
                <strong>Ексцентрицитетът (e)</strong> определя формата на орбитата. При v &lt; v_esc
                орбитата е затворена (кръг или елипса). При v ≥ v_esc обектът напуска системата.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Космически скорости за различни тела
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Втора космическа скорост (v_esc):</h3>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2">Тяло</th>
                  <th className="text-right py-2">v_esc (km/s)</th>
                  <th className="text-right py-2">Сравнение</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1">Луна</td>
                  <td className="text-right">2.4</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">0.21x Земя</td>
                </tr>
                <tr>
                  <td className="py-1">Земя</td>
                  <td className="text-right font-bold">11.2</td>
                  <td className="text-right">1.00x</td>
                </tr>
                <tr>
                  <td className="py-1">Юпитер</td>
                  <td className="text-right">59.5</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">5.3x Земя</td>
                </tr>
                <tr>
                  <td className="py-1">Слънце</td>
                  <td className="text-right">617.5</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">55x Земя</td>
                </tr>
                <tr>
                  <td className="py-1">Неутронна звезда</td>
                  <td className="text-right">200 000</td>
                  <td className="text-right text-red-600 dark:text-red-400">67% от c</td>
                </tr>
              </tbody>
            </table>
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
              <p className="font-semibold mb-2">1. Каква е първата космическа скорост за Земята?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 7.9 km/s (28 440 km/h)</p>
                  <p className="mt-2">Обяснение: Това е минималната скорост, необходима за влизане
                  в орбита около Земята на малка височина. При по-ниска скорост обектът ще падне
                  обратно на Земята.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Защо МКС трябва да се движи толкова бързо?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">МКС се движи с около 7.66 km/s (27 600 km/h), за да остане
                  на орбита. При тази скорост центростремителното ускорение (v²/r) е равно на
                  гравитационното ускорение.</p>
                  <p className="mt-2">Ако се движеше по-бавно, щеше да падне. Ако се движеше
                  по-бързо, щеше да се издигне на по-висока орбита. МКС е в постоянно "свободно
                  падане" около Земята!</p>
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
              <p className="font-semibold mb-2">3. Изчисли орбиталната скорост на спътник на
              височина 400 km. (R_Земя = 6371 km, M = 5.972 × 10²⁴ kg, G = 6.674 × 10⁻¹¹)</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">v = √(GM / r)</p>
                  <p className="mt-2">r = R_Земя + h = 6371 + 400 = 6771 km = 6.771 × 10⁶ m</p>
                  <p className="mt-2">v = √(6.674 × 10⁻¹¹ × 5.972 × 10²⁴ / 6.771 × 10⁶)</p>
                  <p>v = √(3.985 × 10¹⁴ / 6.771 × 10⁶)</p>
                  <p>v = √(5.884 × 10⁷)</p>
                  <p>v ≈ 7670 m/s ≈ 7.67 km/s</p>
                  <p className="mt-2"><strong>Отговор: около 7.67 km/s (27 600 km/h)</strong></p>
                  <p className="mt-2 text-sm">Това е орбиталната скорост на МКС!</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Докажи, че скоростта на освобождаване е √2 пъти
              по-голяма от орбиталната скорост (на същата височина).</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Орбитална скорост: v_orb = √(GM / r)</p>
                  <p className="mt-2">Скорост на освобождаване: v_esc = √(2GM / r)</p>
                  <p className="mt-2">Съотношение:</p>
                  <p>v_esc / v_orb = √(2GM / r) / √(GM / r)</p>
                  <p>= √[(2GM / r) / (GM / r)]</p>
                  <p>= √2</p>
                  <p className="mt-2"><strong>v_esc = √2 × v_orb ≈ 1.414 × v_orb</strong></p>
                  <p className="mt-2 text-sm">Пример: На повърхността на Земята v_orb = 7.9 km/s,
                  v_esc = 11.2 km/s. Съотношение: 11.2 / 7.9 ≈ 1.418 ≈ √2 ✓</p>
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
              <p className="font-semibold mb-2">5. Астронавт на МКС (h = 400 km) хвърля топка напред
              (по посоката на движението) със скорост 1 m/s спрямо станцията. Опиши орбитата на топката.</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">МКС се движи с v_МКС ≈ 7.67 km/s = 7670 m/s</p>
                  <p className="mt-2">Топката получава допълнителна скорост +1 m/s:</p>
                  <p>v_топка = 7670 + 1 = 7671 m/s</p>
                  
                  <p className="mt-3"><strong>Какво ще се случи:</strong></p>
                  <p className="mt-2">Топката има малко по-голяма скорост от необходимата за
                  кръгова орбита на 400 km. Това означава, че тя ще се издигне на по-висока орбита.</p>
                  
                  <p className="mt-2">Орбитата на топката ще бъде <strong>елипса</strong> с:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Перигей (най-ниска точка): 400 km (където е хвърлена)</li>
                    <li>Апогей (най-висока точка): малко по-висок (около 402 km)</li>
                  </ul>
                  
                  <p className="mt-3">Топката ще се върне обратно към МКС след половин орбита
                  (около 45 минути), но малко "отзад" и "отгоре"!</p>
                  
                  <p className="mt-3 text-sm font-semibold">Интересно: Ако астронавтът хвърли топката
                  "назад" (срещу движението), тя ще падне на по-ниска орбита и също ще се върне
                  след половин орбита. В орбита не можеш просто да "хвърлиш" нещо - то остава
                  на орбита!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Орбитална скорост: v = √(GM / r)</li>
              <li>✓ Скорост на освобождаване: v_esc = √(2GM / r) = √2 × v_orb</li>
              <li>✓ Първа космическа (Земя): 7.9 km/s</li>
              <li>✓ Втора космическа (Земя): 11.2 km/s</li>
              <li>✓ Трета космическа: 16.7 km/s (от орбитата на Земята)</li>
              <li>✓ Видове орбити: кръгова (e=0), елиптична (0&lt;e&lt;1), параболична (e=1), хиперболична (e&gt;1)</li>
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
              Международната космическа станция (МКС) се движи с орбитална скорост
              от около 7.66 km/s и прави пълен оборот около Земята за около 90
              минути. Астронавтите на борда виждат 16 изгрева и залеза на ден!
              Въпреки че са на "само" 400 km височина, те са в състояние на безтегловност,
              защото са в постоянно свободно падане около Земята. Вояджър 1, изстрелян
              през 1977 г., е напуснал Слънчевата система и сега се движи с около
              17 km/s спрямо Слънцето!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
