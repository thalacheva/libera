import {useState} from 'react';

export default function Lecture13() {
  const [selectedPlanet, setSelectedPlanet] = useState<'mercury' | 'venus' | 'earth' | 'mars'>('earth');
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const planets = {
    mercury: {
      name: 'Меркурий',
      color: 'rgb(169, 169, 169)',
      size: 15,
      distance: 80,
      period: '88 дни',
      temp: '-180°C до +430°C',
      facts: ['Най-малката планета', 'Няма атмосфера', 'Покрит с кратери'],
    },
    venus: {
      name: 'Венера',
      color: 'rgb(255, 198, 73)',
      size: 35,
      distance: 130,
      period: '225 дни',
      temp: '465°C',
      facts: ['Най-гореща планета', 'Плътна CO₂ атмосфера', 'Въртене в обратна посока'],
    },
    earth: {
      name: 'Земя',
      color: 'rgb(59, 130, 246)',
      size: 36,
      distance: 180,
      period: '365.25 дни',
      temp: '-89°C до +58°C',
      facts: ['Течна вода', 'Богата на O₂ атмосфера', 'Активна тектоника'],
    },
    mars: {
      name: 'Марс',
      color: 'rgb(239, 68, 68)',
      size: 20,
      distance: 230,
      period: '687 дни',
      temp: '-140°C до +20°C',
      facts: ['Червената планета', 'Полярни ледени шапки', 'Олимп Монс - най-висок вулкан'],
    },
  };

  const planet = planets[selectedPlanet];

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 13: Планетите от земен тип
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Какво са планетите от земен тип?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Планетите от земен тип (скалисти планети) са четирите вътрешни
            планети на Слънчевата система: Меркурий, Венера, Земя и Марс.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Общи характеристики:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Твърда скалиста повърхност</li>
              <li>Относително малки размери и маси</li>
              <li>Висока плътност (5-5.5 g/cm³)</li>
              <li>Малко или никакви спътници</li>
              <li>Нямат пръстени</li>
              <li>Близо до Слънцето</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Интерактивна визуализация
          </h2>

          {/* Бутони за избор на планета */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedPlanet('mercury')}
              className={`px-4 py-2 rounded ${selectedPlanet === 'mercury' ? 'bg-gray-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ☿ Меркурий
            </button>
            <button
              onClick={() => setSelectedPlanet('venus')}
              className={`px-4 py-2 rounded ${selectedPlanet === 'venus' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ♀ Венера
            </button>
            <button
              onClick={() => setSelectedPlanet('earth')}
              className={`px-4 py-2 rounded ${selectedPlanet === 'earth' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              🌍 Земя
            </button>
            <button
              onClick={() => setSelectedPlanet('mars')}
              className={`px-4 py-2 rounded ${selectedPlanet === 'mars' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ♂ Марс
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">{planet.name}</h3>

            <svg viewBox="0 0 700 400" className="w-full h-auto">
              {/* Слънце */}
              <circle cx="100" cy="200" r="40" fill="rgb(251, 191, 36)" />
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={100 + 45 * Math.cos(angle)}
                    y1={200 + 45 * Math.sin(angle)}
                    x2={100 + 60 * Math.cos(angle)}
                    y2={200 + 60 * Math.sin(angle)}
                    stroke="rgb(251, 191, 36)"
                    strokeWidth="2"
                  />
                );
              })}
              <text x="100" y="260" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">☀️ Слънце</text>

              {/* Орбити на всички планети (за контекст) */}
              <circle cx="100" cy="200" r="80" fill="none" stroke="gray" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="200" r="130" fill="none" stroke="gray" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="200" r="180" fill="none" stroke="gray" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="200" r="230" fill="none" stroke="gray" strokeWidth="1" opacity="0.2" />

              {/* Избраната планета с орбита */}
              <circle
                cx="100"
                cy="200"
                r={planet.distance}
                fill="none"
                stroke={planet.color}
                strokeWidth="3"
              />

              {/* Планетата */}
              <g>
                <circle
                  cx={100 + planet.distance}
                  cy="200"
                  r={planet.size}
                  fill={planet.color}
                  stroke="white"
                  strokeWidth="2"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 100 200`}
                    to={`360 100 200`}
                    dur="20s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Специални детайли за всяка планета */}
                {selectedPlanet === 'mercury' && (
                  <g>
                    {/* Кратери */}
                    <circle cx={100 + planet.distance - 5} cy="195" r="2" fill="rgb(100, 100, 100)">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx={100 + planet.distance + 3} cy="203" r="1.5" fill="rgb(100, 100, 100)">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}

                {selectedPlanet === 'venus' && (
                  <g>
                    {/* Облаци */}
                    <ellipse cx={100 + planet.distance} cy="195" rx="30" ry="10" fill="rgba(255, 255, 255, 0.3)">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                  </g>
                )}

                {selectedPlanet === 'earth' && (
                  <g>
                    {/* Континенти */}
                    <path
                      d={`M ${100 + planet.distance - 10},200 Q ${100 + planet.distance - 5},195 ${100 + planet.distance},200`}
                      fill="rgb(34, 197, 94)"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </path>
                    {/* Луна */}
                    <circle cx={100 + planet.distance + 50} cy="180" r="8" fill="rgb(200, 200, 200)">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${100 + planet.distance} 200`}
                        to={`360 ${100 + planet.distance} 200`}
                        dur="5s"
                        repeatCount="indefinite"
                        additive="sum"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}

                {selectedPlanet === 'mars' && (
                  <g>
                    {/* Полярна шапка */}
                    <circle cx={100 + planet.distance} cy={200 - planet.size + 3} r="4" fill="white">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 100 200`}
                        to={`360 100 200`}
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}
              </g>

              {/* Етикети за другите планети */}
              <text x="180" y="205" fontSize="10" fill="gray" opacity="0.5">Меркурий</text>
              <text x="230" y="205" fontSize="10" fill="gray" opacity="0.5">Венера</text>
              <text x="280" y="205" fontSize="10" fill="gray" opacity="0.5">Земя</text>
              <text x="330" y="205" fontSize="10" fill="gray" opacity="0.5">Марс</text>

              {/* Информация за избраната планета */}
              <g transform="translate(400, 50)">
                <rect x="0" y="0" width="250" height="280" fill="rgba(59, 130, 246, 0.1)" stroke={planet.color} strokeWidth="2" rx="10" />
                <text x="125" y="30" fontSize="16" fontWeight="bold" textAnchor="middle" fill={planet.color}>
                  {planet.name}
                </text>

                <text x="20" y="60" fontSize="12" fill="currentColor">Период: {planet.period}</text>
                <text x="20" y="80" fontSize="12" fill="currentColor">Температура: {planet.temp}</text>

                <text x="20" y="110" fontSize="12" fontWeight="bold" fill="currentColor">Характеристики:</text>
                {planet.facts.map((fact, i) => (
                  <text key={i} x="25" y={130 + i * 20} fontSize="11" fill="currentColor">• {fact}</text>
                ))}
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Сравнителни данни:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2">Планета</th>
                      <th className="text-right py-2">Диаметър (km)</th>
                      <th className="text-right py-2">Маса (Земи)</th>
                      <th className="text-right py-2">Разстояние (AU)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={selectedPlanet === 'mercury' ? 'bg-gray-200 dark:bg-gray-600' : ''}>
                      <td className="py-1">☿ Меркурий</td>
                      <td className="text-right">4,879</td>
                      <td className="text-right">0.055</td>
                      <td className="text-right">0.39</td>
                    </tr>
                    <tr className={selectedPlanet === 'venus' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}>
                      <td className="py-1">♀ Венера</td>
                      <td className="text-right">12,104</td>
                      <td className="text-right">0.815</td>
                      <td className="text-right">0.72</td>
                    </tr>
                    <tr className={selectedPlanet === 'earth' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}>
                      <td className="py-1">🌍 Земя</td>
                      <td className="text-right">12,742</td>
                      <td className="text-right">1.000</td>
                      <td className="text-right">1.00</td>
                    </tr>
                    <tr className={selectedPlanet === 'mars' ? 'bg-red-100 dark:bg-red-900/30' : ''}>
                      <td className="py-1">♂ Марс</td>
                      <td className="text-right">6,779</td>
                      <td className="text-right">0.107</td>
                      <td className="text-right">1.52</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Меркурий ☿</h2>
          <div className="bg-gray-100/70 dark:bg-gray-800/70 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Най-малката планета и най-близка до Слънцето</li>
              <li>Няма атмосфера (изпарена от слънчевия вятър)</li>
              <li>Температурни крайности: -180°C (нощ) до +430°C (ден)</li>
              <li>Покрит с кратери, подобно на Луната</li>
              <li>Има желязно ядро (70% от масата)</li>
              <li>Бавно въртене: 1 ден = 59 земни дни</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Венера ♀</h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Най-гореща планета (около 465°C) заради парников ефект</li>
              <li>Плътна атмосфера от CO₂ (налягане 92 пъти по-голямо от земното)</li>
              <li>Въртене в обратна посока (ретроградно)</li>
              <li>Облаци от сярна киселина</li>
              <li>Един ден на Венера (243 земни дни) е по-дълъг от годината ѝ (225 дни)!</li>
              <li>Най-яркият обект на небето след Слънцето и Луната</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Земя 🌍</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Единствената планета с течна вода на повърхността</li>
              <li>Атмосфера богата на кислород (21% O₂, 78% N₂)</li>
              <li>Активна тектоника на плочите</li>
              <li>Магнитно поле, което ни защитава от слънчевия вятър</li>
              <li>Един естествен спътник – Луната</li>
              <li>Единственото известно място с живот</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Марс ♂</h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Червената планета (заради желязния оксид в почвата)</li>
              <li>Тънка атмосфера от CO₂ (налягане 0.6% от земното)</li>
              <li>Полярни ледени шапки от вода и CO₂ лед</li>
              <li>Олимп Монс – най-високият вулкан в Слънчевата система (21 km)</li>
              <li>Валес Маринерис – каньон дълъг 4000 km</li>
              <li>Два малки спътника – Фобос и Деймос</li>
              <li>Следи от древни реки и езера</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Сравнение на размерите
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <svg viewBox="0 0 600 200" className="w-full h-auto">
              {/* Меркурий */}
              <circle cx="80" cy="100" r="15" fill="rgb(169, 169, 169)" />
              <text x="80" y="130" fontSize="11" textAnchor="middle" fill="currentColor">Меркурий</text>
              <text x="80" y="145" fontSize="9" textAnchor="middle" fill="gray">4,879 km</text>

              {/* Венера */}
              <circle cx="180" cy="100" r="35" fill="rgb(255, 198, 73)" />
              <text x="180" y="145" fontSize="11" textAnchor="middle" fill="currentColor">Венера</text>
              <text x="180" y="160" fontSize="9" textAnchor="middle" fill="gray">12,104 km</text>

              {/* Земя */}
              <circle cx="300" cy="100" r="36" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="100" r="36" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="300" y="150" fontSize="11" textAnchor="middle" fill="currentColor" fontWeight="bold">Земя</text>
              <text x="300" y="165" fontSize="9" textAnchor="middle" fill="gray">12,742 km</text>

              {/* Марс */}
              <circle cx="420" cy="100" r="20" fill="rgb(239, 68, 68)" />
              <text x="420" y="130" fontSize="11" textAnchor="middle" fill="currentColor">Марс</text>
              <text x="420" y="145" fontSize="9" textAnchor="middle" fill="gray">6,779 km</text>

              {/* Луна (за сравнение) */}
              <circle cx="520" cy="100" r="10" fill="rgb(200, 200, 200)" />
              <text x="520" y="120" fontSize="10" textAnchor="middle" fill="gray">Луна</text>
              <text x="520" y="133" fontSize="8" textAnchor="middle" fill="gray">3,474 km</text>
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
              <p className="font-semibold mb-2">1. Коя е най-горещата планета в Слънчевата система и защо?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Венера</p>
                  <p className="mt-2">Обяснение: Въпреки че Меркурий е по-близо до Слънцето,
                  Венера е по-гореща (465°C) заради мощния парников ефект. Плътната атмосфера
                  от CO₂ задържа топлината и не позволява на планетата да се охлажда.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Защо Марс е червен?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Марс е червен заради желязния оксид (ръжда) в почвата и
                  скалите на повърхността. Желязото се е окислило в миналото, когато Марс е имал
                  по-плътна атмосфера и вода.</p>
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
              <p className="font-semibold mb-2">3. Обясни защо на Меркурий има толкова големи
              температурни разлики между деня и нощта.</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Причини за екстремните температури:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Няма атмосфера</strong> – няма нищо да задържа топлината през нощта</li>
                    <li><strong>Бавно въртене</strong> – един ден = 59 земни дни, дълго време за нагряване/охлаждане</li>
                    <li><strong>Близо до Слънцето</strong> – получава много слънчева енергия през деня</li>
                  </ul>
                  <p className="mt-2">Резултат: +430°C на слънце, -180°C в сянка (разлика 610°C!)</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Използвайки третия закон на Кеплер, изчисли
              периода на Марс, ако a = 1.52 AU.</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Трети закон на Кеплер: T² = a³</p>
                  <p className="mt-2">T² = 1.52³ = 3.512</p>
                  <p>T = √3.512 ≈ 1.874 години</p>
                  <p className="mt-2">Преобразуване в дни: 1.874 × 365.25 ≈ 684 дни</p>
                  <p className="mt-2"><strong>Отговор: около 1.87 години или 687 дни</strong></p>
                  <p className="mt-2 text-sm">(Реалната стойност е 687 дни)</p>
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
              <p className="font-semibold mb-2">5. Защо Венера е по-гореща от Меркурий, въпреки че
              е по-далеч от Слънцето? Изчисли колко пъти по-малко слънчева енергия получава
              Венера спрямо Меркурий.</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Слънчевата енергия намалява с квадрата на разстоянието:</p>
                  <p className="font-mono">I ∝ 1/r²</p>
                  <p className="mt-2">Съотношение: I_Венера / I_Меркурий = (r_Меркурий / r_Венера)²</p>
                  <p>= (0.39 / 0.72)² = 0.542² ≈ 0.29</p>
                  <p className="mt-2">Венера получава около <strong>29%</strong> от енергията на Меркурий
                  (или 3.4 пъти по-малко).</p>
                  <p className="mt-2"><strong>Защо е по-гореща?</strong></p>
                  <p className="mt-2">Парниковият ефект! Плътната атмосфера от CO₂ задържа топлината.
                  Меркурий няма атмосфера, затова бързо се охлажда през нощта. Венера задържа
                  топлината и постоянно се нагрява.</p>
                  <p className="mt-2">Това показва, че атмосферата е по-важна от разстоянието за температурата!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Четири планети от земен тип: Меркурий, Венера, Земя, Марс</li>
              <li>✓ Всички имат скалиста повърхност и висока плътност</li>
              <li>✓ Меркурий – най-малък, екстремни температури</li>
              <li>✓ Венера – най-горещ, парников ефект</li>
              <li>✓ Земя – единствена с течна вода и живот</li>
              <li>✓ Марс – червен, следи от древна вода</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Венера и Земя са почти еднакви по размер (Венера е 95% от Земята) и често
              се наричат "планети-близнаци". Но условията са драстично различни! Венера
              е пример за "избягал парников ефект" – предупреждение какво може да се случи
              с климата на една планета.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
