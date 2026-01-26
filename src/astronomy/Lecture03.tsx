import {useState} from 'react';

export default function Lecture03() {
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});
  const [selectedSeason, setSelectedSeason] = useState<string>('spring');

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Позиции на Земята за различните сезони
  const seasonPositions = {
    spring: { x: 450, y: 200, label: 'Пролет (≈21 март)', angle: 0 },
    summer: { x: 300, y: 100, label: 'Лято (≈21 юни)', angle: 90 },
    autumn: { x: 150, y: 200, label: 'Есен (≈23 септември)', angle: 180 },
    winter: { x: 300, y: 300, label: 'Зима (≈21 декември)', angle: 270 },
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 3: Движение на Земята
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Въртене около оста
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земята се върти около въображаема ос, минаваща през северния и южния полюс.
          </p>

          {/* Интерактивна визуализация на въртенето */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Въртене на Земята около оста си</h3>

            <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Земя */}
              <circle cx="300" cy="200" r="80" fill="rgb(59, 130, 246)" opacity="0.3" />
              <circle cx="300" cy="200" r="80" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="3" />

              {/* Ос на въртене */}
              <line x1="300" y1="100" x2="300" y2="300" stroke="rgb(239, 68, 68)" strokeWidth="3" />
              <circle cx="300" cy="100" r="5" fill="rgb(239, 68, 68)" />
              <circle cx="300" cy="300" r="5" fill="rgb(239, 68, 68)" />
              <text x="310" y="95" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">Северен полюс</text>
              <text x="310" y="310" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">Южен полюс</text>

              {/* Екватор */}
              <ellipse cx="300" cy="200" rx="80" ry="25" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="385" y="205" fontSize="12" fill="rgb(34, 197, 94)" fontWeight="bold">Екватор</text>

              {/* Стрелка за посока на въртене */}
              <path
                d="M 380,200 A 80,80 0 0,1 300,280"
                fill="none"
                stroke="rgb(251, 191, 36)"
                strokeWidth="3"
                markerEnd="url(#arrowRotation)"
              />
              <text x="400" y="240" fontSize="14" fill="rgb(251, 191, 36)" fontWeight="bold">
                Посока: З → И
              </text>

              {/* Анимирана точка (град на екватора) */}
              <circle cx="0" cy="0" r="5" fill="rgb(239, 68, 68)">
                <animateMotion
                  path="M 380,200 A 80,25 0 1,1 379.9,200"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* България (на средни ширини) */}
              <circle cx="360" cy="170" r="4" fill="gold">
                <animateMotion
                  path="M 360,170 A 65,20 0 1,1 359.9,170"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>
              <text x="370" y="165" fontSize="11" fill="gold" fontWeight="bold">България</text>

              {/* Слънчеви лъчи */}
              <g opacity="0.5">
                <line x1="50" y1="150" x2="200" y2="180" stroke="rgb(251, 191, 36)" strokeWidth="2" />
                <line x1="50" y1="200" x2="200" y2="200" stroke="rgb(251, 191, 36)" strokeWidth="2" />
                <line x1="50" y1="250" x2="200" y2="220" stroke="rgb(251, 191, 36)" strokeWidth="2" />
                <text x="50" y="140" fontSize="12" fill="rgb(251, 191, 36)" fontWeight="bold">☀️ Слънце</text>
              </g>

              {/* Ден и нощ */}
              <path
                d="M 300,120 A 80,80 0 0,1 300,280"
                fill="rgba(0, 0, 0, 0.4)"
              />
              <text x="330" y="200" fontSize="11" fill="white" fontWeight="bold">Нощ</text>
              <text x="240" y="200" fontSize="11" fill="rgb(251, 191, 36)" fontWeight="bold">Ден</text>

              <defs>
                <marker id="arrowRotation" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(251, 191, 36)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Характеристики:</h4>
              <ul className="text-sm space-y-2">
                <li><strong>Период:</strong> 23 часа, 56 минути и 4 секунди (звезден ден)</li>
                <li><strong>Посока:</strong> от запад към изток (обратно на часовниковата стрелка, гледано от северния полюс)</li>
                <li><strong>Следствия:</strong> смяна на ден и нощ, видимо движение на звездите</li>
                <li><strong>Линейна скорост на екватора:</strong> около 1670 km/h (465 m/s)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Формула за линейна скорост:</h3>
            <p className="font-mono text-center text-lg my-3">v = 2πR / T</p>
            <ul className="text-sm space-y-1">
              <li>v – линейна скорост</li>
              <li>R – радиус на Земята (или разстояние от оста)</li>
              <li>T – период на въртене (24 часа)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Обикаляне около Слънцето
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земята обикаля около Слънцето по елиптична орбита. Това движение причинява
            смяната на сезоните заедно с наклона на земната ос.
          </p>

          {/* Интерактивна визуализация на орбитата */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Орбита на Земята и сезони</h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Изберете сезон, за да видите положението на Земята
            </p>

            {/* Бутони за избор на сезон */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setSelectedSeason('spring')}
                className={`px-3 py-1 rounded text-sm ${selectedSeason === 'spring' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🌸 Пролет
              </button>
              <button
                onClick={() => setSelectedSeason('summer')}
                className={`px-3 py-1 rounded text-sm ${selectedSeason === 'summer' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                ☀️ Лято
              </button>
              <button
                onClick={() => setSelectedSeason('autumn')}
                className={`px-3 py-1 rounded text-sm ${selectedSeason === 'autumn' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🍂 Есен
              </button>
              <button
                onClick={() => setSelectedSeason('winter')}
                className={`px-3 py-1 rounded text-sm ${selectedSeason === 'winter' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                ❄️ Зима
              </button>
            </div>

            <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Орбита на Земята */}
              <ellipse cx="300" cy="200" rx="150" ry="140" fill="none" stroke="rgb(156, 163, 175)" strokeWidth="2" strokeDasharray="5,5" />

              {/* Слънце */}
              <circle cx="300" cy="200" r="30" fill="rgb(251, 191, 36)" />
              <circle cx="300" cy="200" r="30" fill="rgb(251, 191, 36)" opacity="0.3">
                <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="300" y="205" fontSize="14" fontWeight="bold" textAnchor="middle" fill="rgb(120, 53, 15)">☀️</text>
              <text x="300" y="245" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">Слънце</text>

              {/* Позиции на Земята за всеки сезон */}
              {Object.entries(seasonPositions).map(([season, pos]) => {
                const isSelected = selectedSeason === season;
                const earthSize = isSelected ? 25 : 15;
                const opacity = isSelected ? 1 : 0.3;

                // Изчисляване на наклона на оста (23.5°)
                const axisAngle = pos.angle - 90; // Оста винаги сочи в същата посока
                const axisLength = earthSize * 1.5;
                const axisX1 = pos.x + axisLength * Math.cos((axisAngle * Math.PI) / 180);
                const axisY1 = pos.y + axisLength * Math.sin((axisAngle * Math.PI) / 180);
                const axisX2 = pos.x - axisLength * Math.cos((axisAngle * Math.PI) / 180);
                const axisY2 = pos.y - axisLength * Math.sin((axisAngle * Math.PI) / 180);

                return (
                  <g key={season} opacity={opacity}>
                    {/* Земя */}
                    <circle cx={pos.x} cy={pos.y} r={earthSize} fill="rgb(59, 130, 246)" />
                    <circle cx={pos.x} cy={pos.y} r={earthSize} fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />

                    {/* Ос на въртене */}
                    <line
                      x1={axisX1}
                      y1={axisY1}
                      x2={axisX2}
                      y2={axisY2}
                      stroke="rgb(239, 68, 68)"
                      strokeWidth="2"
                    />

                    {/* Екватор */}
                    <ellipse
                      cx={pos.x}
                      cy={pos.y}
                      rx={earthSize}
                      ry={earthSize * 0.3}
                      fill="none"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="1"
                      transform={`rotate(${axisAngle} ${pos.x} ${pos.y})`}
                    />

                    {/* Осветена половина */}
                    {season === 'summer' && isSelected && (
                      <path
                        d={`M ${pos.x - earthSize},${pos.y} A ${earthSize},${earthSize} 0 0,0 ${pos.x + earthSize},${pos.y}`}
                        fill="rgba(251, 191, 36, 0.3)"
                      />
                    )}
                    {season === 'winter' && isSelected && (
                      <path
                        d={`M ${pos.x + earthSize},${pos.y} A ${earthSize},${earthSize} 0 0,0 ${pos.x - earthSize},${pos.y}`}
                        fill="rgba(251, 191, 36, 0.3)"
                      />
                    )}

                    {/* Етикет */}
                    {isSelected && (
                      <text
                        x={pos.x}
                        y={pos.y + earthSize + 20}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="currentColor"
                      >
                        {pos.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Слънчеви лъчи */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const x1 = 300 + 35 * Math.cos(angle);
                const y1 = 200 + 35 * Math.sin(angle);
                const x2 = 300 + 50 * Math.cos(angle);
                const y2 = 200 + 50 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgb(251, 191, 36)"
                    strokeWidth="2"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="2s"
                      begin={`${i * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}

              {/* Стрелка за посока на обикаляне */}
              <path
                d="M 440,150 A 150,140 0 0,1 400,80"
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                markerEnd="url(#arrowOrbit)"
              />
              <text x="460" y="120" fontSize="12" fill="rgb(168, 85, 247)" fontWeight="bold">
                Посока на обикаляне
              </text>

              <defs>
                <marker id="arrowOrbit" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(168, 85, 247)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Обяснение на сезоните:</h4>
              <p className="text-sm mb-3">
                Сезоните се дължат на <strong>наклона на земната ос (23.5°)</strong>, а не на
                промяната в разстоянието до Слънцето!
              </p>
              {selectedSeason === 'spring' && (
                <div className="text-sm">
                  <strong className="text-green-600 dark:text-green-400">Пролет (≈21 март):</strong>
                  <p>Пролетно равноденствие. Слънцето е над екватора. Ден = нощ навсякъде на Земята.</p>
                </div>
              )}
              {selectedSeason === 'summer' && (
                <div className="text-sm">
                  <strong className="text-yellow-600 dark:text-yellow-400">Лято (≈21 юни):</strong>
                  <p>Лятно слънцестоене. Северното полукълбо е наклонено към Слънцето.
                  Най-дългият ден в Северното полукълбо. Слънцето е на максимална височина.</p>
                </div>
              )}
              {selectedSeason === 'autumn' && (
                <div className="text-sm">
                  <strong className="text-orange-600 dark:text-orange-400">Есен (≈23 септември):</strong>
                  <p>Есенно равноденствие. Слънцето отново е над екватора. Ден = нощ навсякъде.</p>
                </div>
              )}
              {selectedSeason === 'winter' && (
                <div className="text-sm">
                  <strong className="text-blue-600 dark:text-blue-400">Зима (≈21 декември):</strong>
                  <p>Зимно слънцестоене. Северното полукълбо е наклонено от Слънцето.
                  Най-краткият ден в Северното полукълбо. Слънцето е на минимална височина.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Характеристики на орбитата:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Период:</strong> 365.25 дни (една тропическа година)</li>
              <li><strong>Форма:</strong> елипса с малък ексцентрицитет (почти кръг)</li>
              <li><strong>Средна скорост:</strong> около 30 km/s (107 000 km/h)</li>
              <li><strong>Разстояние от Слънцето:</strong> 149.6 млн. km (1 астрономическа единица - AU)</li>
              <li><strong>Перихелий:</strong> 147.1 млн. km (януари)</li>
              <li><strong>Афелий:</strong> 152.1 млн. km (юли)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Наклон на земната ос
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земната ос е наклонена под ъгъл от <strong>23.5°</strong> (по-точно 23°26')
            спрямо перпендикуляра на равнината на орбитата. Този наклон е причина за
            смяната на сезоните.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">⚠️ Важно разбиране:</h3>
            <p className="mb-2">
              Сезоните НЕ се дължат на промяната в разстоянието до Слънцето!
              (Всъщност Земята е най-близо до Слънцето през януари - зимата в Северното полукълбо)
            </p>
            <p className="mt-2">
              Сезоните се дължат на <strong>ъгъла, под който слънчевите лъчи падат</strong>
              върху повърхността и на <strong>продължителността на деня</strong>.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Четирите важни момента:</h3>
            <ul className="space-y-3">
              <li>
                <strong className="text-green-600 dark:text-green-400">Пролетно равноденствие (≈21 март):</strong>
                <br/>Слънцето пресича небесния екватор от юг към север. Ден = нощ = 12 часа.
              </li>
              <li>
                <strong className="text-yellow-600 dark:text-yellow-400">Лятно слънцестоене (≈21 юни):</strong>
                <br/>Слънцето е на максимална деклинация (+23.5°). Най-дългият ден в Северното полукълбо.
              </li>
              <li>
                <strong className="text-orange-600 dark:text-orange-400">Есенно равноденствие (≈23 септември):</strong>
                <br/>Слънцето пресича небесния екватор от север към юг. Ден = нощ = 12 часа.
              </li>
              <li>
                <strong className="text-blue-600 dark:text-blue-400">Зимно слънцестоене (≈21 декември):</strong>
                <br/>Слънцето е на минимална деклинация (-23.5°). Най-краткият ден в Северното полукълбо.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Прецесия
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земната ос не е фиксирана в пространството, а извършва бавно конично
            движение с период от около <strong>26 000 години</strong>. Това явление се нарича
            прецесия и е причинено от гравитационното влияние на Слънцето и Луната
            върху "издутината" на Земята при екватора.
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Следствия от прецесията:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Полярната звезда не винаги е била "полярна"</li>
              <li>Пролетната точка (♈) се измества назад по еклиптиката</li>
              <li>Зодиакалните съзвездия не съответстват на астрологичните знаци</li>
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
              <p className="font-semibold mb-2">1. Колко часа трае едно звездно денонощие?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 23 часа, 56 минути и 4 секунди</p>
                  <p className="mt-2">Обяснение: Звездното денонощие е времето, за което Земята
                  прави един пълен оборот спрямо далечните звезди. То е с около 4 минути по-кратко
                  от слънчевото денонощие (24 часа), защото Земята се движи и по орбитата си.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. В каква посока се върти Земята около оста си?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: От запад към изток</p>
                  <p className="mt-2">Обяснение: Гледано от северния полюс, Земята се върти
                  обратно на часовниковата стрелка. Затова Слънцето и звездите изглеждат като
                  че изгряват от изток и залязват на запад.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">3. Колко градуса е наклонена земната ос спрямо
              перпендикуляра на орбитата?</p>
              <button
                onClick={() => toggleSolution('a3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 23.5° (по-точно 23°26')</p>
                  <p className="mt-2">Обяснение: Този наклон е причината за смяната на сезоните.
                  Ако земната ос беше перпендикулярна на орбитата, нямаше да има сезони.</p>
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
              <p className="font-semibold mb-2">4. Сравни слънчево и звездно денонощие. Защо има разлика?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Слънчево денонощие:</strong> 24 часа - времето между
                  два последователни преминавания на Слънцето през меридиана.</p>
                  <p className="mt-2"><strong>Звездно денонощие:</strong> 23h 56m 4s - времето за
                  пълен оборот спрямо далечните звезди.</p>
                  <p className="mt-2"><strong>Разлика:</strong> Около 4 минути. Причината е, че
                  докато Земята се върти, тя се движи и по орбитата си около Слънцето (около 1° на ден).
                  За да "догони" Слънцето, Земята трябва да се завърти с още ~1°, което отнема ~4 минути.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">5. Изчисли линейната скорост на точка на екватора
              поради въртенето на Земята. (Радиус на Земята R = 6371 km)</p>
              <button
                onClick={() => toggleSolution('b5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме формулата: v = 2πR / T</p>
                  <p className="mt-2">v = (2 × 3.14159 × 6371 km) / 24 h</p>
                  <p>v = 40030 km / 24 h</p>
                  <p>v ≈ 1668 km/h ≈ 463 m/s</p>
                  <p className="mt-2"><strong>Отговор: около 1670 km/h или 465 m/s</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">6. Защо Земята е най-близо до Слънцето през зимата
              (януари) в Северното полукълбо, но въпреки това е студено?</p>
              <button
                onClick={() => toggleSolution('b6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b6'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Температурата не зависи толкова от разстоянието до Слънцето
                  (разликата е само 3%), колкото от <strong>ъгъла на падане на слънчевите лъчи</strong>
                  и <strong>продължителността на деня</strong>.</p>
                  <p className="mt-2">През зимата в Северното полукълбо:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Северното полукълбо е наклонено ОТ Слънцето</li>
                    <li>Слънчевите лъчи падат под малък ъгъл → по-слабо нагряване</li>
                    <li>Денят е кратък → по-малко време за нагряване</li>
                  </ul>
                  <p className="mt-2">Затова наклонът на оста е много по-важен от разстоянието!</p>
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
              <p className="font-semibold mb-2">7. Ако наклонът на земната ос беше 0° (перпендикулярна
              на орбитата), как би се променил климатът на Земята?</p>
              <button
                onClick={() => toggleSolution('c7')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c7'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c7'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Ако земната ос беше перпендикулярна на орбитата:</p>
                  <ul className="list-disc list-inside mt-2 space-y-2">
                    <li><strong>Нямаше да има сезони!</strong> Всеки ден би бил като равноденствие.</li>
                    <li>Слънцето винаги би било над екватора (деклинация = 0°)</li>
                    <li>Продължителността на деня би била 12 часа навсякъде (освен на полюсите)</li>
                    <li>На полюсите Слънцето винаги би било на хоризонта</li>
                    <li>Климатичните зони биха зависели само от географската ширина</li>
                    <li>Екваторът би бил много горещ, полюсите - много студени, без сезонни промени</li>
                  </ul>
                  <p className="mt-2">Това би направило климата много по-предсказуем, но и по-еднообразен!</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-red-500">
              <p className="font-semibold mb-2">8. Изчисли с каква скорост се движи Земята по
              орбитата си около Слънцето. (1 AU = 149.6 млн. km, 1 година = 365.25 дни)</p>
              <button
                onClick={() => toggleSolution('c8')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c8'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c8'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Приемаме орбитата за кръг (добро приближение).</p>
                  <p className="mt-2">Обиколка на орбитата: L = 2πr = 2 × 3.14159 × 149.6 млн. km</p>
                  <p>L ≈ 940 млн. km</p>
                  <p className="mt-2">Време: T = 365.25 дни = 365.25 × 24 часа = 8766 часа</p>
                  <p className="mt-2">Скорост: v = L / T = 940 млн. km / 8766 h</p>
                  <p>v ≈ 107 200 km/h ≈ 29.8 km/s</p>
                  <p className="mt-2"><strong>Отговор: около 30 km/s или 107 000 km/h</strong></p>
                  <p className="mt-2 text-sm">Това е около 85 пъти по-бързо от скоростта на звука!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Земята се върти около оста си за 23h 56m 4s (звездно денонощие)</li>
              <li>✓ Земята обикаля около Слънцето за 365.25 дни със скорост ~30 km/s</li>
              <li>✓ Наклонът на оста (23.5°) причинява смяната на сезоните</li>
              <li>✓ Прецесията е бавно конично движение на оста с период 26 000 години</li>
              <li>✓ Формула: v = 2πR / T</li>
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
              Преди 5000 години Полярната звезда не е била близо до северния
              небесен полюс. Поради прецесията, след около 12 000 години звездата
              Вега ще бъде "полярна звезда"! Древните египтяни са използвали
              звездата Тубан (α Дракона) за ориентация при строежа на пирамидите.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
