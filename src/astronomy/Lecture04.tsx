import {useState} from 'react';

export default function Lecture04() {
  const [moonPhase, setMoonPhase] = useState(0); // 0-7 за 8-те фази
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const phases = [
    { name: 'Новолуние', angle: 0, icon: '🌑' },
    { name: 'Млад месец', angle: 45, icon: '🌒' },
    { name: 'Първа четвърт', angle: 90, icon: '🌓' },
    { name: 'Нарастваща луна', angle: 135, icon: '🌔' },
    { name: 'Пълнолуние', angle: 180, icon: '🌕' },
    { name: 'Намаляваща луна', angle: 225, icon: '🌖' },
    { name: 'Последна четвърт', angle: 270, icon: '🌗' },
    { name: 'Стара луна', angle: 315, icon: '🌘' },
  ];

  const currentPhase = phases[moonPhase];
  const moonAngleRad = (currentPhase.angle * Math.PI) / 180;
  const moonX = 300 + 150 * Math.cos(moonAngleRad);
  const moonY = 200 + 150 * Math.sin(moonAngleRad);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 4: Фази на Луната и лунни затъмнения
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Фази на Луната
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Луната не излъчва собствена светлина, а отразява слънчевата. Поради
            движението ѝ около Земята, виждаме различни части от осветената ѝ
            страна, което създава фазите.
          </p>

          {/* Интерактивна визуализация на фазите */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Интерактивна визуализация на лунните фази</h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Използвайте бутоните или плъзгача, за да видите различните фази
            </p>

            {/* Бутони за фази */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {phases.map((phase, index) => (
                <button
                  key={index}
                  onClick={() => setMoonPhase(index)}
                  className={`px-2 py-1 rounded text-sm ${moonPhase === index ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  title={phase.name}
                >
                  {phase.icon}
                </button>
              ))}
            </div>

            <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Орбита на Луната */}
              <circle cx="300" cy="200" r="150" fill="none" stroke="rgb(156, 163, 175)" strokeWidth="2" strokeDasharray="5,5" />

              {/* Земя в центъра */}
              <circle cx="300" cy="200" r="30" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="200" r="30" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="300" y="250" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">Земя</text>

              {/* Слънчеви лъчи (отляво) */}
              {[-60, -40, -20, 0, 20, 40, 60].map((offset, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={200 + offset}
                  x2="100"
                  y2={200 + offset}
                  stroke="rgb(251, 191, 36)"
                  strokeWidth="2"
                  opacity="0.5"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;0.7;0.3"
                    dur="3s"
                    begin={`${i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </line>
              ))}
              <text x="10" y="150" fontSize="14" fontWeight="bold" fill="rgb(251, 191, 36)">☀️ Слънце</text>

              {/* Луна на текущата позиция */}
              <g>
                {/* Пълен кръг (основа) */}
                <circle cx={moonX} cy={moonY} r="25" fill="rgb(200, 200, 200)" />

                {/* Тъмна половина - зависи от позицията спрямо Слънцето */}
                {/* Слънцето е отляво (angle 180° = пълнолуние, Луната отдясно) */}
                {(() => {
                  // Ъгъл на Луната спрямо Слънцето (0° = новолуние, 180° = пълнолуние)
                  const phaseAngle = currentPhase.angle;
                  
                  // При 0° (новолуние): тъмна страна към нас (цялата Луна тъмна)
                  // При 180° (пълнолуние): светла страна към нас (цялата Луна светла)
                  
                  if (phaseAngle === 0) {
                    // Новолуние - цялата Луна е тъмна
                    return <circle cx={moonX} cy={moonY} r="25" fill="rgb(60, 60, 60)" />;
                  } else if (phaseAngle === 180) {
                    // Пълнолуние - цялата Луна е светла (вече е светла от основния кръг)
                    return null;
                  } else if (phaseAngle < 180) {
                    // Нарастваща (0° → 180°): тъмна страна отляво, светла отдясно
                    const width = 25 * Math.cos(moonAngleRad);
                    return (
                      <path
                        d={`M ${moonX},${moonY - 25} A 25,25 0 0,0 ${moonX},${moonY + 25} A ${Math.abs(width)},25 0 0,${phaseAngle < 90 ? 0 : 1} ${moonX},${moonY - 25}`}
                        fill="rgb(60, 60, 60)"
                      />
                    );
                  } else {
                    // Намаляваща (180° → 360°): тъмна страна отдясно, светла отляво
                    const width = 25 * Math.abs(Math.cos(moonAngleRad));
                    return (
                      <path
                        d={`M ${moonX},${moonY - 25} A 25,25 0 0,1 ${moonX},${moonY + 25} A ${width},25 0 0,${phaseAngle > 270 ? 0 : 1} ${moonX},${moonY - 25}`}
                        fill="rgb(60, 60, 60)"
                      />
                    );
                  }
                })()}

                <circle cx={moonX} cy={moonY} r="25" fill="none" stroke="white" strokeWidth="2" />
              </g>

              {/* Етикет на фазата */}
              <text
                x={moonX}
                y={moonY + 45}
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                fill="currentColor"
              >
                {currentPhase.name}
              </text>

              {/* Стрелка за посока на движение */}
              <path
                d={`M ${300 + 170 * Math.cos(moonAngleRad)},${200 + 170 * Math.sin(moonAngleRad)}
                    A 170,170 0 0,1 ${300 + 170 * Math.cos(moonAngleRad + 0.5)},${200 + 170 * Math.sin(moonAngleRad + 0.5)}`}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                markerEnd="url(#arrowMoon)"
              />

              <defs>
                <marker id="arrowMoon" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(168, 85, 247)" />
                </marker>
              </defs>
            </svg>

            {/* Плъзгач за фази */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                {currentPhase.icon} {currentPhase.name} (Ден {Math.round((moonPhase / 8) * 29.5)} от цикъла)
              </label>
              <input
                type="range"
                min="0"
                max="7"
                value={moonPhase}
                onChange={(e) => setMoonPhase(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Обяснение:</h4>
              <p className="text-sm">
                Луната обикаля около Земята за <strong>29.5 дни</strong> (синодичен месец).
                Винаги половината от Луната, обърната към Слънцето, е осветена. Фазите
                зависят от това коя част от осветената половина виждаме от Земята.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Основни фази (цикъл 29.5 дни):</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>🌑 Новолуние</strong> – Луната е между Земята и Слънцето, невидима</li>
              <li><strong>🌒 Млад месец</strong> – тънък сърп на запад след залез</li>
              <li><strong>🌓 Първа четвърт</strong> – виждаме половината от Луната</li>
              <li><strong>🌔 Нарастваща луна</strong> – повече от половината е видима</li>
              <li><strong>🌕 Пълнолуние</strong> – цялата осветена страна е видима</li>
              <li><strong>🌖 Намаляваща луна</strong> – след пълнолуние</li>
              <li><strong>🌗 Последна четвърт</strong> – отново половин луна</li>
              <li><strong>🌘 Стара луна</strong> – тънък сърп преди новолуние</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Лунни затъмнения
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Лунното затъмнение настъпва, когато Земята се намира между Слънцето и
            Луната, и сянката на Земята пада върху Луната. Това може да се случи
            само при пълнолуние.
          </p>

          {/* Визуализация на лунно затъмнение */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Лунно затъмнение</h3>

            <svg viewBox="0 0 700 300" className="w-full h-auto" style={{ maxHeight: '300px' }}>
              {/* Слънце */}
              <circle cx="50" cy="150" r="30" fill="rgb(251, 191, 36)" />
              <text x="50" y="200" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">Слънце</text>

              {/* Слънчеви лъчи */}
              {[-40, -20, 0, 20, 40].map((offset, i) => (
                <line
                  key={i}
                  x1="80"
                  y1={150 + offset}
                  x2="200"
                  y2={150 + offset * 0.5}
                  stroke="rgb(251, 191, 36)"
                  strokeWidth="2"
                  opacity="0.4"
                />
              ))}

              {/* Земя */}
              <circle cx="300" cy="150" r="40" fill="rgb(59, 130, 246)" />
              <circle cx="300" cy="150" r="40" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="300" y="210" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">Земя</text>

              {/* Сянка на Земята (конус) */}
              <path
                d="M 300,110 L 600,50 L 600,250 L 300,190 Z"
                fill="rgba(0, 0, 0, 0.3)"
                stroke="rgb(100, 100, 100)"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text x="450" y="100" fontSize="11" fill="rgb(100, 100, 100)" fontWeight="bold">Сянка</text>

              {/* Полусянка */}
              <path
                d="M 300,90 L 650,20 M 300,210 L 650,280"
                stroke="rgb(150, 150, 150)"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
              <text x="500" y="40" fontSize="10" fill="rgb(150, 150, 150)">Полусянка</text>

              {/* Луна в сянката */}
              <circle cx="550" cy="150" r="20" fill="rgb(139, 69, 19)">
                <animate attributeName="fill" values="rgb(220,220,220);rgb(139,69,19);rgb(220,220,220)" dur="6s" repeatCount="indefinite" />
              </circle>
              <circle cx="550" cy="150" r="20" fill="none" stroke="white" strokeWidth="1" />
              <text x="550" y="185" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">Луна</text>

              {/* Стрелка показваща движението */}
              <path
                d="M 520,130 L 580,130"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                markerEnd="url(#arrowLunar)"
              />

              <defs>
                <marker id="arrowLunar" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(168, 85, 247)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Условия за лунно затъмнение:</h4>
              <ul className="text-sm space-y-2">
                <li>✓ Трябва да е <strong>пълнолуние</strong></li>
                <li>✓ Луната трябва да премине през сянката на Земята</li>
                <li>✓ Слънце - Земя - Луна трябва да са почти на една права</li>
                <li>✓ Луната трябва да е близо до възел (пресечна точка на орбитите)</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Видове лунни затъмнения:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Пълно лунно затъмнение</strong> – Луната изцяло влиза в
                сянката на Земята. Луната придобива червеникав цвят ("кървава луна").
                Продължителност: до 107 минути.
              </li>
              <li>
                <strong>Частично лунно затъмнение</strong> – само част от Луната
                влиза в сянката на Земята
              </li>
              <li>
                <strong>Полусянково затъмнение</strong> – Луната преминава през
                полусянката, едва забележимо
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Защо Луната става червена?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            По време на пълно лунно затъмнение, Луната придобива червеникав цвят.
            Това се дължи на атмосферата на Земята, която пречупва и разсейва
            слънчевата светлина.
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Механизъм:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Слънчевата светлина преминава през атмосферата на Земята</li>
              <li>Синята светлина се разсейва (същият ефект като синьото небе)</li>
              <li>Червената светлина се пречупва и достига до Луната</li>
              <li>Колкото по-замърсена е атмосферата, толкова по-тъмна е Луната</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Защо затъмненията не се случват всеки месец?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Орбитата на Луната е наклонена под ъгъл от около <strong>5°</strong> спрямо
            еклиптиката (орбитата на Земята). Затова Луната обикновено минава над или
            под сянката на Земята при пълнолуние.
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Възли на орбитата:</h3>
            <p className="mb-2">
              Затъмнения се случват само когато пълнолунието съвпадне с <strong>възел</strong> –
              точка, където орбитата на Луната пересича еклиптиката.
            </p>
            <p className="mt-2">
              Затова лунните затъмнения се случват 2-5 пъти годишно (включително полусянкови).
            </p>
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
              <p className="font-semibold mb-2">1. Колко дни продължава един пълен цикъл на лунните фази?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 29.5 дни (синодичен месец)</p>
                  <p className="mt-2">Обяснение: Това е времето от едно новолуние до следващото.
                  Различава се от сидеричния месец (27.3 дни), който е времето за пълен оборот
                  спрямо звездите, защото Земята също се движи по орбитата си.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. При коя фаза на Луната може да се случи лунно затъмнение?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: При пълнолуние</p>
                  <p className="mt-2">Обяснение: Лунното затъмнение се случва, когато Земята е
                  между Слънцето и Луната. Това е възможно само при пълнолуние, когато Луната
                  е от противоположната страна на Земята спрямо Слънцето.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">3. Защо Луната става червена по време на пълно затъмнение?</p>
              <button
                onClick={() => toggleSolution('a3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Атмосферата на Земята пречупва слънчевата светлина.
                  Синята светлина се разсейва, докато червената светлина се пречупва и
                  достига до Луната. Това е същият ефект, който прави залезите червени.</p>
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
              <p className="font-semibold mb-2">4. Защо лунните затъмнения не се случват всеки месец при пълнолуние?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Орбитата на Луната е наклонена под ъгъл от около 5° спрямо
                  еклиптиката (орбитата на Земята). Поради този наклон, при повечето пълнолуния
                  Луната минава над или под сянката на Земята.</p>
                  <p className="mt-2">Затъмнения се случват само когато пълнолунието съвпадне с
                  <strong> възел</strong> – точка, където орбитата на Луната пресича еклиптиката.
                  Това се случва 2-5 пъти годишно.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">5. Колко максимално може да продължи пълно лунно затъмнение?</p>
              <button
                onClick={() => toggleSolution('b5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: До 107 минути (около 1 час и 47 минути)</p>
                  <p className="mt-2">Обяснение: Максималната продължителност зависи от това
                  колко централно Луната преминава през сянката на Земята и от разстоянието на
                  Луната от Земята. Най-дългите затъмнения се случват, когато Луната е в афелий
                  (най-далеч от Земята) и преминава през центъра на сянката.</p>
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
              <p className="font-semibold mb-2">6. Обясни защо от Луната никога не може да се
              наблюдава "земно затъмнение" (Земята да влезе в сянката на Луната от гледна точка
              на наблюдател на Луната).</p>
              <button
                onClick={() => toggleSolution('c6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c6'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">От гледна точка на наблюдател на Луната, "земно затъмнение"
                  би било когато Земята влиза в сянката на Луната. Но Луната е много по-малка от
                  Земята, така че нейната сянка е твърде малка, за да покрие цялата Земя.</p>
                  <p className="mt-2">Вместо това, от Луната се наблюдава <strong>"слънчево затъмнение"</strong> –
                  Земята закрива Слънцето. Това съответства на лунното затъмнение, наблюдавано от Земята.</p>
                  <p className="mt-2">По време на това "слънчево затъмнение" от Луната, наблюдателят
                  би видял Земята като тъмен диск с ярък червен пръстен около него (светлината,
                  преминаваща през атмосферата).</p>
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
              <li>✓ Лунните фази се повтарят на всеки 29.5 дни</li>
              <li>✓ Фазите зависят от взаимното положение Слънце-Земя-Луна</li>
              <li>✓ Лунните затъмнения се случват при пълнолуние</li>
              <li>✓ Луната става червена заради пречупването на светлината в атмосферата</li>
              <li>✓ Орбитата на Луната е наклонена на 5° спрямо еклиптиката</li>
              <li>✓ Лунните затъмнения са безопасни за наблюдение и видими от цялото нощно полукълбо</li>
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
              Лунните затъмнения могат да продължат до 107 минути! За разлика от
              слънчевите затъмнения, лунните са безопасни за наблюдение и видими
              от цялото нощно полукълбо на Земята. През 2022 г. имахме "супер кървава
              луна" - комбинация от пълно затъмнение и суперлуние (Луната е най-близо до Земята).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
