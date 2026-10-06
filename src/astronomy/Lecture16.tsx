import {useState} from 'react';

export default function Lecture16() {
  const [cometDistance, setCometDistance] = useState(50); // 0-100, 0 = близо до Слънцето
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Изчисляване на размера на комата и опашките според разстоянието
  const comaSize = Math.max(5, 30 - cometDistance * 0.25);
  const tailLength = Math.max(0, 200 - cometDistance * 2);
  const ionTailLength = Math.max(0, 250 - cometDistance * 2.5);

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 16: Комети и метеори
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Структура на кометите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Кометите са "мръсни снежни топки" от лед, прах и скали. Когато се
            приближат до Слънцето, ледът се изпарява и създава ярка кома и опашки.
          </p>

          {/* Интерактивна визуализация на комета */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Интерактивна комета</h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Преместете плъзгача, за да видите как се променя кометата при приближаване до Слънцето
            </p>

            <svg viewBox="0 0 800 400" className="w-full h-auto">
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
                  >
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur="2s"
                      begin={`${i * 0.1}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}
              <text x="100" y="260" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">☀️ Слънце</text>

              {/* Орбита на кометата (елиптична) */}
              <ellipse cx="300" cy="200" rx="350" ry="150" fill="none" stroke="gray" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />

              {/* Позиция на кометата */}
              <g transform={`translate(${150 + cometDistance * 5}, 200)`}>
                {/* Йонна опашка (синя, винаги от Слънцето) */}
                <path
                  d={`M 0,0 Q ${ionTailLength * 0.3},${-ionTailLength * 0.1} ${ionTailLength},${-ionTailLength * 0.15}`}
                  fill="none"
                  stroke="rgb(100, 200, 255)"
                  strokeWidth="8"
                  opacity="0.6"
                  strokeLinecap="round"
                />
                <path
                  d={`M 0,0 Q ${ionTailLength * 0.3},${ionTailLength * 0.1} ${ionTailLength},${ionTailLength * 0.15}`}
                  fill="none"
                  stroke="rgb(100, 200, 255)"
                  strokeWidth="6"
                  opacity="0.5"
                  strokeLinecap="round"
                />
                {ionTailLength > 50 && (
                  <text x={ionTailLength * 0.6} y="-30" fontSize="11" fill="rgb(100, 200, 255)" fontWeight="bold">
                    Йонна опашка
                  </text>
                )}

                {/* Прахова опашка (жълта, следва орбитата) */}
                <path
                  d={`M 0,0 Q ${tailLength * 0.4},${tailLength * 0.3} ${tailLength * 0.8},${tailLength * 0.5}`}
                  fill="none"
                  stroke="rgb(255, 215, 100)"
                  strokeWidth="12"
                  opacity="0.5"
                  strokeLinecap="round"
                />
                {tailLength > 50 && (
                  <text x={tailLength * 0.5} y={tailLength * 0.4 + 15} fontSize="11" fill="rgb(255, 215, 100)" fontWeight="bold">
                    Прахова опашка
                  </text>
                )}

                {/* Кома (газова обвивка) */}
                <circle cx="0" cy="0" r={comaSize} fill="rgba(200, 220, 255, 0.4)" />
                <circle cx="0" cy="0" r={comaSize} fill="none" stroke="rgb(150, 200, 255)" strokeWidth="1" />
                {comaSize > 15 && (
                  <text x="0" y={comaSize + 15} fontSize="10" textAnchor="middle" fill="rgb(150, 200, 255)">
                    Кома
                  </text>
                )}

                {/* Ядро */}
                <circle cx="0" cy="0" r="5" fill="rgb(100, 100, 100)" />
                <circle cx="0" cy="0" r="5" fill="none" stroke="white" strokeWidth="1" />
                <text x="0" y="-15" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Ядро
                </text>
              </g>

              {/* Етикети за разстояние */}
              <text x="150" y="350" fontSize="11" fill="gray">Перихелий (близо)</text>
              <text x="600" y="350" fontSize="11" fill="gray">Афелий (далеч)</text>
            </svg>

            {/* Плъзгач */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Разстояние от Слънцето: {cometDistance < 30 ? 'Близо (активна комета)' : cometDistance < 70 ? 'Средно' : 'Далеч (неактивна)'}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={cometDistance}
                onChange={(e) => setCometDistance(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Близо до Слънцето</span>
                <span>Далеч от Слънцето</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>🔵 <strong>Йонна опашка:</strong> Синкава, винаги насочена от Слънцето (слънчев вятър)</li>
                <li>🟡 <strong>Прахова опашка:</strong> Жълтеникава, следва орбитата на кометата</li>
                <li>⚪ <strong>Кома:</strong> Газова обвивка около ядрото, нараства при приближаване</li>
                <li>⚫ <strong>Ядро:</strong> Твърдо тяло от лед и прах (1-50 km)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Структура на кометите:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ядро</strong> – твърдо тяло от лед (H₂O, CO₂, CH₄) и прах (1-50 km)</li>
              <li><strong>Кома</strong> – газова обвивка около ядрото (може да достигне 100 000 km)</li>
              <li><strong>Прахова опашка</strong> – жълтеникава, следва орбитата, дължина до 10 млн. km</li>
              <li><strong>Йонна опашка</strong> – синкава, винаги насочена от Слънцето, дължина до 100 млн. km</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Известни комети
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Комета на Халей</strong> – период 76 години, следващо появяване 2061 г.
                Последно видима през 1986 г.
              </li>
              <li>
                <strong>Комета Хейл-Боп</strong> – видима с просто око през 1997 г.,
                една от най-ярките комети на XX век
              </li>
              <li>
                <strong>Комета Шумейкър-Леви 9</strong> – се разби в Юпитер през 1994 г.,
                давайки уникална възможност за наблюдение
              </li>
              <li>
                <strong>Комета NEOWISE</strong> – видима през 2020 г.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Метеорни дъждове
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато Земята премине през орбитата на комета, частиците от нея
            навлизат в атмосферата и създават метеорен дъжд.
          </p>

          {/* Визуализация на метеорен дъжд */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Метеорен дъжд</h3>

            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {/* Земя */}
              <circle cx="300" cy="300" r="60" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="300" r="60" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />

              {/* Атмосфера */}
              <circle cx="300" cy="300" r="70" fill="none" stroke="rgb(100, 200, 255)" strokeWidth="2" opacity="0.5" />

              {/* Орбита на кометата (пунктирана) */}
              <ellipse cx="300" cy="200" rx="250" ry="150" fill="none" stroke="gray" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />

              {/* Частици от кометата (метеороиди) */}
              {[...Array(20)].map((_, i) => {
                const x = 100 + i * 25;
                const y = 100 + Math.sin(i * 0.5) * 30;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="rgb(200, 200, 200)"
                    opacity="0.6"
                  />
                );
              })}

              {/* Метеори (падащи звезди) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const startX = 150 + i * 100;
                const startY = 50 + i * 30;
                return (
                  <g key={i}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={startX + 60}
                      y2={startY + 80}
                      stroke="rgb(255, 215, 0)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        dur="2s"
                        begin={`${i * 0.4}s`}
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="0 0"
                        to="100 150"
                        dur="2s"
                        begin={`${i * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </line>
                    {/* След на метеора */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={startX + 30}
                      y2={startY + 40}
                      stroke="rgb(255, 255, 200)"
                      strokeWidth="1"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;0.5;0"
                        dur="2s"
                        begin={`${i * 0.4}s`}
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="0 0"
                        to="100 150"
                        dur="2s"
                        begin={`${i * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                );
              })}

              {/* Радиант */}
              <circle cx="200" cy="80" r="5" fill="rgb(239, 68, 68)" />
              <circle cx="200" cy="80" r="15" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2" strokeDasharray="3,3" />
              <text x="220" y="85" fontSize="12" fill="rgb(239, 68, 68)" fontWeight="bold">Радиант</text>

              {/* Стрелки от радианта */}
              {[0, 45, 90, 135, 180].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1="200"
                    y1="80"
                    x2={200 + 40 * Math.cos(rad)}
                    y2={80 + 40 * Math.sin(rad)}
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                );
              })}

              <text x="300" y="30" fontSize="13" fontWeight="bold" textAnchor="middle" fill="currentColor">
                Метеорен дъжд
              </text>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Обяснение:</h4>
              <p className="text-sm">
                Когато Земята премине през орбитата на комета, хиляди малки частици
                (метеороиди) навлизат в атмосферата със скорост 10-70 km/s. Триенето
                ги нагрява до 1500-3000°C и те светят – "падащи звезди". Всички метеори
                изглеждат като че идват от една точка - <strong>радианта</strong>.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Известни метеорни дъждове:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Персеиди</strong> – август (10-13), до 100 метеора/час, от комета Swift-Tuttle</li>
              <li><strong>Геминиди</strong> – декември (13-14), най-интензивен (120 метеора/час)</li>
              <li><strong>Леониди</strong> – ноември (17-18), от комета Tempel-Tuttle</li>
              <li><strong>Квадрантиди</strong> – януари (3-4), кратък пик</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Метеороиди, метеори и метеорити
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <svg viewBox="0 0 600 300" className="w-full h-auto">
              {/* Космос */}
              <rect x="0" y="0" width="600" height="100" fill="rgb(10, 10, 30)" />
              {[...Array(30)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 600}
                  cy={Math.random() * 100}
                  r="1"
                  fill="white"
                />
              ))}

              {/* Метеороид в космоса */}
              <circle cx="150" cy="50" r="8" fill="rgb(150, 150, 150)" />
              <text x="150" y="80" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Метеороид
              </text>
              <text x="150" y="95" fontSize="10" textAnchor="middle" fill="white">
                (в космоса)
              </text>

              {/* Атмосфера */}
              <rect x="0" y="100" width="600" height="50" fill="rgba(100, 150, 255, 0.3)" />
              <text x="10" y="120" fontSize="11" fill="currentColor">Атмосфера</text>

              {/* Метеор (падаща звезда) */}
              <g>
                <line x1="350" y1="110" x2="380" y2="160" stroke="rgb(255, 215, 0)" strokeWidth="4" strokeLinecap="round" />
                <line x1="350" y1="110" x2="365" y2="135" stroke="rgb(255, 255, 200)" strokeWidth="2" />
                <circle cx="380" cy="160" r="3" fill="rgb(255, 100, 0)" />
              </g>
              <text x="390" y="140" fontSize="12" textAnchor="start" fill="rgb(255, 215, 0)" fontWeight="bold">
                Метеор
              </text>
              <text x="390" y="155" fontSize="10" textAnchor="start" fill="currentColor">
                (в атмосферата)
              </text>

              {/* Земя */}
              <rect x="0" y="150" width="600" height="150" fill="rgb(139, 69, 19)" />
              <text x="10" y="170" fontSize="11" fill="white">Земна повърхност</text>

              {/* Метеорит */}
              <circle cx="550" cy="220" r="10" fill="rgb(80, 80, 80)" />
              <circle cx="545" cy="215" r="3" fill="rgb(150, 150, 150)" />
              <text x="550" y="250" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Метеорит
              </text>
              <text x="550" y="265" fontSize="10" textAnchor="middle" fill="white">
                (на земята)
              </text>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Терминология:</h4>
              <ul className="text-sm space-y-2">
                <li><strong>Метеороид</strong> – малък обект в космоса (от прах до няколко метра)</li>
                <li><strong>Метеор</strong> – "падаща звезда", светещ след когато метеороид изгаря в атмосферата</li>
                <li><strong>Метеорит</strong> – метеороид, който е оцелял и е достигнал земната повърхност</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Типове метеорити:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Каменни (94%)</strong> – силикати, най-чести</li>
              <li><strong>Железни (5%)</strong> – желязо-никел сплав, много тежки</li>
              <li><strong>Каменно-железни (1%)</strong> – смесени, най-редки</li>
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
              <p className="font-semibold mb-2">1. Каква е разликата между метеор и метеорит?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Метеор</strong> – светещ след в атмосферата ("падаща звезда"),
                  когато метеороид изгаря.</p>
                  <p className="mt-2"><strong>Метеорит</strong> – метеороид, който е оцелял преминаването
                  през атмосферата и е достигнал земната повърхност.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Защо кометата има две опашки?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Прахова опашка:</strong> Състои се от прахови частици,
                  които се освобождават от ядрото. Следва орбитата на кометата. Жълтеникава.</p>
                  <p className="mt-2"><strong>Йонна опашка:</strong> Състои се от йонизирани газове,
                  които се отблъскват от слънчевия вятър. Винаги е насочена от Слънцето. Синкава.</p>
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
              <p className="font-semibold mb-2">3. Метеор навлиза в атмосферата със скорост 50 km/s.
              На каква височина обикновено започва да свети? (Атмосферата става достатъчно плътна
              на около 100 km)</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Около 100-120 km</p>
                  <p className="mt-2">Обяснение: Метеорите започват да светят на височина около
                  100-120 km, където атмосферата става достатъчно плътна, за да причини значително
                  триене. Повечето метеори изгарят напълно на височина 50-80 km. Само по-големите
                  обекти достигат до земята като метеорити.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Комета на Халей има период 76 години и перихелий
              0.59 AU. Изчисли афелия.</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">От третия закон на Кеплер: T² = a³</p>
                  <p>76² = a³</p>
                  <p>5776 = a³</p>
                  <p>a = ∛5776 ≈ 17.94 AU</p>
                  <p className="mt-2">Голямата полуос: a = (rₚ + rₐ) / 2</p>
                  <p>17.94 = (0.59 + rₐ) / 2</p>
                  <p>35.88 = 0.59 + rₐ</p>
                  <p>rₐ = 35.29 AU</p>
                  <p className="mt-2"><strong>Отговор: около 35.3 AU</strong></p>
                  <p className="mt-2 text-sm">Това е отвъд орбитата на Нептун (30 AU)!</p>
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
              <p className="font-semibold mb-2">5. Обясни защо метеорните дъждове се случват по
              едно и също време всяка година и защо всички метеори изглеждат като че идват от
              една точка (радиант).</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Защо по едно и също време:</strong></p>
                  <p>Земята обикаля около Слънцето по фиксирана орбита. Всяка година по същото
                  време Земята преминава през същата точка от орбитата си, където се пресича с
                  орбитата на дадена комета. Затова метеорните дъждове са предсказуеми.</p>
                  <p className="mt-2"><strong>Защо има радиант:</strong></p>
                  <p>Всички частици от кометата се движат приблизително в една и съща посока
                  (паралелни траектории). Поради перспективата, паралелните линии изглеждат като
                  че се събират в една точка - радианта. Това е същият ефект като железопътните
                  релси, които изглеждат като че се събират на хоризонта.</p>
                  <p className="mt-2">Радиантът се нарича по съзвездието, в което се намира
                  (напр. Персеиди → съзвездие Персей).</p>
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
              <li>✓ Кометите са "мръсни снежни топки" от лед и прах</li>
              <li>✓ Имат ядро, кома и две опашки (прахова и йонна)</li>
              <li>✓ Метеорни дъждове се случват когато Земята премине през орбита на комета</li>
              <li>✓ Метеороид → метеор → метеорит (в космоса → в атмосферата → на земята)</li>
              <li>✓ Всеки ден около 100 тона космически материал пада на Земята</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Всеки ден около 100 тона космически материал пада на Земята, но
              повечето от него е под формата на микроскопичен прах. Големи
              метеорити падат рядко, но могат да причинят значителни щети. Преди
              66 милиона години астероид с диаметър 10 km е причинил изчезването на
              динозаврите. Днес учените непрекъснато следят потенциално опасните обекти!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
