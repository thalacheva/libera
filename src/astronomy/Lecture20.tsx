import {useState} from 'react';

export default function Lecture20() {
  const [selectedPath, setSelectedPath] = useState<'solar' | 'massive'>('solar');
  const [evolutionStage, setEvolutionStage] = useState(0);
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const solarStages = [
    { name: 'Молекулен облак', x: 100, y: 100, size: 60, color: 'rgba(150, 150, 150, 0.5)' },
    { name: 'Протозвезда', x: 200, y: 150, size: 30, color: 'rgba(255, 150, 100, 0.7)' },
    { name: 'Главна последователност', x: 300, y: 250, size: 25, color: 'rgb(255, 255, 150)' },
    { name: 'Червен гигант', x: 450, y: 150, size: 70, color: 'rgb(255, 100, 50)' },
    { name: 'Планетарна мъглявина', x: 550, y: 200, size: 50, color: 'rgba(100, 200, 255, 0.4)' },
    { name: 'Бяло джудже', x: 550, y: 350, size: 15, color: 'rgb(200, 220, 255)' },
  ];

  const massiveStages = [
    { name: 'Молекулен облак', x: 100, y: 100, size: 80, color: 'rgba(150, 150, 150, 0.5)' },
    { name: 'Протозвезда', x: 200, y: 120, size: 40, color: 'rgba(255, 150, 100, 0.7)' },
    { name: 'Главна последователност', x: 280, y: 180, size: 35, color: 'rgb(150, 200, 255)' },
    { name: 'Свръхгигант', x: 420, y: 100, size: 90, color: 'rgb(255, 50, 50)' },
    { name: 'Свръхнова', x: 520, y: 180, size: 100, color: 'rgba(255, 255, 100, 0.8)' },
    { name: 'Неутронна звезда / Черна дупка', x: 550, y: 320, size: 20, color: 'rgb(50, 50, 50)' },
  ];

  const stages = selectedPath === 'solar' ? solarStages : massiveStages;
  const currentStage = stages[evolutionStage];

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 20: Еволюция на звездите
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Раждане на звездите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Звездите се раждат в молекулни облаци от газ и прах. Гравитацията
            причинява свиване на облака, което води до повишаване на температурата
            и налягането в центъра.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Етапи на формиране:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Молекулен облак</strong> – студен газ (10-100 K), плътност увеличава</li>
              <li><strong>Гравитационно свиване</strong> – облакът колапсира, температурата расте</li>
              <li><strong>Протозвезда</strong> – центърът се нагрява, но все още няма ядрен синтез</li>
              <li><strong>Главна последователност</strong> – започва синтез на водород → хелий</li>
            </ol>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Интерактивна еволюция на звездите
          </h2>

          {/* Избор на тип звезда */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => { setSelectedPath('solar'); setEvolutionStage(0); }}
              className={`px-6 py-3 rounded-lg ${selectedPath === 'solar' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ☀️ Звезда като Слънцето (1 M☉)
            </button>
            <button
              onClick={() => { setSelectedPath('massive'); setEvolutionStage(0); }}
              className={`px-6 py-3 rounded-lg ${selectedPath === 'massive' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ⭐ Масивна звезда (&gt;8 M☉)
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">
              {selectedPath === 'solar' ? 'Еволюция на звезда като Слънцето' : 'Еволюция на масивна звезда'}
            </h3>

            <svg viewBox="0 0 650 400" className="w-full h-auto">
              {/* Фон */}
              <rect x="0" y="0" width="650" height="400" fill="rgb(10, 10, 30)" />
              {[...Array(100)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 650}
                  cy={Math.random() * 400}
                  r={Math.random() * 1.5}
                  fill="white"
                  opacity={Math.random() * 0.8 + 0.2}
                />
              ))}

              {/* Път на еволюцията */}
              {stages.map((stage, i) => {
                if (i < stages.length - 1) {
                  return (
                    <line
                      key={i}
                      x1={stage.x}
                      y1={stage.y}
                      x2={stages[i + 1].x}
                      y2={stages[i + 1].y}
                      stroke="rgb(100, 150, 200)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity={i <= evolutionStage ? 0.8 : 0.3}
                    />
                  );
                }
                return null;
              })}

              {/* Стадии */}
              {stages.map((stage, i) => {
                const isActive = i === evolutionStage;
                const isPast = i < evolutionStage;
                const opacity = isActive ? 1 : isPast ? 0.6 : 0.3;

                return (
                  <g key={i} opacity={opacity}>
                    {/* Специални ефекти за различните стадии */}
                    {stage.name === 'Свръхнова' && isActive && (
                      <>
                        <circle cx={stage.x} cy={stage.y} r={stage.size * 1.3} fill={stage.color} opacity="0.3">
                          <animate attributeName="r" values={`${stage.size};${stage.size * 1.5};${stage.size}`} dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={stage.x} cy={stage.y} r={stage.size * 1.6} fill="none" stroke="rgb(255, 255, 100)" strokeWidth="2">
                          <animate attributeName="r" values={`${stage.size};${stage.size * 2};${stage.size * 2.5}`} dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}

                    {/* Основно тяло */}
                    <circle
                      cx={stage.x}
                      cy={stage.y}
                      r={stage.size}
                      fill={stage.color}
                      stroke={isActive ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                      strokeWidth={isActive ? 3 : 1}
                    >
                      {isActive && stage.name !== 'Свръхнова' && (
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                      )}
                    </circle>

                    {/* Етикет */}
                    <text
                      x={stage.x}
                      y={stage.y + stage.size + 20}
                      fontSize={isActive ? 13 : 11}
                      fontWeight={isActive ? 'bold' : 'normal'}
                      textAnchor="middle"
                      fill="white"
                    >
                      {i + 1}. {stage.name}
                    </text>

                    {/* Номер на стадия */}
                    <circle
                      cx={stage.x}
                      cy={stage.y - stage.size - 10}
                      r="12"
                      fill={isActive ? 'rgb(59, 130, 246)' : 'rgba(100, 100, 100, 0.5)'}
                    />
                    <text
                      x={stage.x}
                      y={stage.y - stage.size - 6}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="white"
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Контроли */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Стадий {evolutionStage + 1} от {stages.length}: {currentStage.name}
              </label>
              <input
                type="range"
                min="0"
                max={stages.length - 1}
                value={evolutionStage}
                onChange={(e) => setEvolutionStage(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Начало</span>
                <span>Край</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">{currentStage.name}</h4>
              {selectedPath === 'solar' && (
                <>
                  {evolutionStage === 0 && <p className="text-sm">Студен облак от газ и прах. Гравитацията започва да го свива.</p>}
                  {evolutionStage === 1 && <p className="text-sm">Центърът се нагрява до милиони градуси, но все още няма ядрен синтез. Светимост от гравитационно свиване.</p>}
                  {evolutionStage === 2 && <p className="text-sm">Започва синтез H → He. Звездата е стабилна за ~10 милиарда години. Слънцето е тук.</p>}
                  {evolutionStage === 3 && <p className="text-sm">Водородът в ядрото свършва. Звездата се разширява 100-200 пъти. Изгаря хелий в ядрото.</p>}
                  {evolutionStage === 4 && <p className="text-sm">Звездата отхвърля външните си слоеве, създавайки красива мъглявина.</p>}
                  {evolutionStage === 5 && <p className="text-sm">Остава горещото ядро - бяло джудже. Размер на Земята, плътност 1 тон/см³. Бавно се охлажда вечно.</p>}
                </>
              )}
              {selectedPath === 'massive' && (
                <>
                  {evolutionStage === 0 && <p className="text-sm">Много по-масивен облак. Свива се по-бързо заради по-силната гравитация.</p>}
                  {evolutionStage === 1 && <p className="text-sm">Масивна протозвезда. Бързо достига температури за ядрен синтез.</p>}
                  {evolutionStage === 2 && <p className="text-sm">Гореща синя звезда (O-B клас). Изгаря водород много бързо - само няколко милиона години!</p>}
                  {evolutionStage === 3 && <p className="text-sm">Огромна звезда (до 1000 R☉). Синтезира тежки елементи: He → C → O → Si → Fe. Желязото не може да се синтезира.</p>}
                  {evolutionStage === 4 && <p className="text-sm">Катастрофична експлозия! Ядрото колапсира за секунди. Освобождава се енергия като от 10 милиарда слънца!</p>}
                  {evolutionStage === 5 && <p className="text-sm">Ако M &lt; 3 M☉: неутронна звезда (пулсар). Ако M &gt; 3 M☉: черна дупка. Тежките елементи се разпръскват в космоса.</p>}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Живот на главната последователност
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Звездите прекарват 90% от живота си на главната последователност,
            където синтезират водород в хелий. Продължителността зависи от масата:
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Масивни звезди (&gt;8 M☉): няколко милиона години</li>
              <li>Слънцето (1 M☉): около 10 милиарда години</li>
              <li>Малки звезди (&lt;0.5 M☉): трилиони години</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Формула за живот на звездата:</h3>
            <p className="text-center text-lg font-mono my-3">t ∝ M / L ∝ M / M³·⁵ ∝ M⁻²·⁵</p>
            <p className="mt-2">
              Колкото по-масивна е звездата, толкова по-бързо изгаря горивото си!
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Еволюция на звезди като Слънцето (0.5-8 M☉)
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Главна последователност</strong> (10 млрд. години) – синтез H → He в ядрото
              </li>
              <li>
                <strong>Червен гигант</strong> – водородът в ядрото свършва, звездата се разширява.
                Изгаря хелий (He → C, O)
              </li>
              <li>
                <strong>Планетарна мъглявина</strong> – отхвърля външни слоеве, създава красива мъглявина
              </li>
              <li>
                <strong>Бяло джудже</strong> – остава горещото ядро (C, O). Охлажда се вечно,
                няма ядрен синтез
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Еволюция на масивни звезди (&gt;8 M☉)
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Главна последователност</strong> (няколко милиона години) – горещи сини звезди
              </li>
              <li>
                <strong>Червен/Син свръхгигант</strong> – огромни размери (до 1000 R☉)
              </li>
              <li>
                <strong>Синтез на тежки елементи</strong> – He → C → O → Ne → Si → Fe (като лукови слоеве)
              </li>
              <li>
                <strong>Свръхнова експлозия</strong> – ядрото колапсира, външните слоеве експлодират
              </li>
              <li>
                <strong>Неутронна звезда</strong> (1.4-3 M☉) или <strong>Черна дупка</strong> (&gt;3 M☉)
              </li>
            </ol>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">⚠️ Защо желязото е краят?</h3>
            <p>
              Синтезът на елементи до желязо <strong>освобождава</strong> енергия.
              Синтезът на по-тежки елементи от желязо <strong>изисква</strong> енергия.
              Когато ядрото стане желязо, ядреният синтез спира, подкрепата срещу
              гравитацията изчезва и ядрото колапсира за по-малко от секунда!
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Сравнение на еволюционните пътища
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <svg viewBox="0 0 700 300" className="w-full h-auto">
              <text x="350" y="25" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">
                Сравнение на еволюцията
              </text>

              {/* Звезда като Слънцето */}
              <g>
                <text x="150" y="60" fontSize="14" fontWeight="bold" fill="rgb(255, 255, 150)">
                  Звезда като Слънцето
                </text>
                <circle cx="150" cy="100" r="20" fill="rgb(255, 255, 150)" />
                <text x="150" y="130" fontSize="11" textAnchor="middle" fill="currentColor">10 млрд. г</text>
                <line x1="150" y1="140" x2="150" y2="180" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow1)" />
                <circle cx="150" cy="210" r="35" fill="rgb(255, 100, 50)" />
                <text x="150" y="255" fontSize="11" textAnchor="middle" fill="currentColor">Червен гигант</text>
                <line x1="150" y1="265" x2="150" y2="290" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow1)" />
                <circle cx="150" cy="295" r="8" fill="rgb(200, 220, 255)" />
                <text x="210" y="300" fontSize="11" fill="currentColor">Бяло джудже</text>
              </g>

              {/* Масивна звезда */}
              <g transform="translate(350, 0)">
                <text x="150" y="60" fontSize="14" fontWeight="bold" fill="rgb(150, 200, 255)">
                  Масивна звезда
                </text>
                <circle cx="150" cy="100" r="25" fill="rgb(150, 200, 255)" />
                <text x="150" y="135" fontSize="11" textAnchor="middle" fill="currentColor">5 млн. г</text>
                <line x1="150" y1="145" x2="150" y2="170" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow2)" />
                <circle cx="150" cy="200" r="45" fill="rgb(255, 50, 50)" />
                <text x="150" y="255" fontSize="11" textAnchor="middle" fill="currentColor">Свръхгигант</text>
                <line x1="150" y1="265" x2="150" y2="285" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow2)" />

                {/* Свръхнова */}
                <circle cx="150" cy="295" r="20" fill="rgb(255, 255, 100)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <text x="210" y="300" fontSize="11" fill="currentColor">Свръхнова</text>
              </g>

              <defs>
                <marker id="arrow1" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
                </marker>
                <marker id="arrow2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
                </marker>
              </defs>
            </svg>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Ключови разлики:</h3>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2">Характеристика</th>
                  <th className="text-center py-2">Слънчев тип</th>
                  <th className="text-center py-2">Масивна</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1">Маса</td>
                  <td className="text-center">0.5-8 M☉</td>
                  <td className="text-center">&gt;8 M☉</td>
                </tr>
                <tr>
                  <td className="py-1">Живот</td>
                  <td className="text-center">Милиарди години</td>
                  <td className="text-center">Милиони години</td>
                </tr>
                <tr>
                  <td className="py-1">Краен стадий</td>
                  <td className="text-center">Бяло джудже</td>
                  <td className="text-center">Неутронна звезда/Черна дупка</td>
                </tr>
                <tr>
                  <td className="py-1">Експлозия</td>
                  <td className="text-center">Не</td>
                  <td className="text-center">Да (свръхнова)</td>
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
              <p className="font-semibold mb-2">1. Колко процента от живота си звездата прекарва на главната последователност?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Около 90%</p>
                  <p className="mt-2">Обяснение: Главната последователност е най-дългият и
                  стабилен етап от живота на звездата, където тя синтезира водород в хелий.
                  Всички останали етапи (гигант, свръхгигант и др.) са относително кратки.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Какво остава след смъртта на звезда като Слънцето?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Бяло джудже</p>
                  <p className="mt-2">Обяснение: След фазата на червен гигант, звездата отхвърля
                  външните си слоеве (планетарна мъглявина) и остава горещото ядро - бяло джудже.
                  То е с размер на Земята, но с маса около половината от Слънцето.</p>
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
              <p className="font-semibold mb-2">3. Звезда с маса 10 M☉ живее около 20 милиона години.
              Приблизително колко ще живее звезда с маса 2 M☉? (t ∝ M⁻²·⁵)</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">t ∝ M⁻²·⁵, следователно: t₁ / t₂ = (M₂ / M₁)²·⁵</p>
                  <p className="mt-2">t₂ / 20 млн. = (10 / 2)²·⁵ = 5²·⁵</p>
                  <p>5²·⁵ = 5² × 5⁰·⁵ = 25 × √5 ≈ 25 × 2.236 ≈ 55.9</p>
                  <p className="mt-2">t₂ = 20 млн. × 55.9 ≈ 1118 млн. години ≈ 1.1 млрд. години</p>
                  <p className="mt-2"><strong>Отговор: около 1.1 милиарда години</strong></p>
                  <p className="mt-2 text-sm">Звезда с 5 пъти по-малка маса живее около 56 пъти по-дълго!</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Защо масивните звезди завършват като свръхнови,
              а звездите като Слънцето - не?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Разликата е в масата на ядрото:</p>
                  <p className="mt-2"><strong>Звезди като Слънцето:</strong> Ядрото не е достатъчно
                  масивно, за да достигне температурите, необходими за синтез на елементи по-тежки
                  от въглерод и кислород. Звездата бавно губи външни слоеве.</p>
                  <p className="mt-2"><strong>Масивни звезди:</strong> Ядрото е достатъчно масивно
                  и горещо, за да синтезира елементи до желязо. Когато се образува желязно ядро,
                  синтезът спира. Без енергия от синтеза, ядрото колапсира катастрофално за &lt;1
                  секунда, причинявайки свръхнова експлозия.</p>
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
              <p className="font-semibold mb-2">5. Обясни защо всички тежки елементи във Вселената
              (включително в нашите тела) са били създадени в звезди. Кои елементи се създават
              в нормални звезди и кои - при свръхнови?</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">След Големия взрив Вселената е съдържала само водород,
                  хелий и малко литий. Всички по-тежки елементи са създадени в звезди.</p>

                  <p className="mt-3"><strong>В нормални звезди (ядрен синтез):</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Главна последователност: H → He</li>
                    <li>Червени гиганти: He → C, O</li>
                    <li>Масивни звезди: C → Ne → Mg → Si → Fe</li>
                  </ul>

                  <p className="mt-3"><strong>При свръхнови (r-процес и s-процес):</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Елементи по-тежки от желязо (Cu, Zn, Au, Pb, U и др.)</li>
                    <li>Огромната енергия позволява синтез на тежки ядра</li>
                  </ul>

                  <p className="mt-3"><strong>Заключение:</strong> Ние сме буквално направени от
                  звезден прах! Въглеродът в телата ни, кислородът, който дишаме, калцият в
                  костите ни, желязото в кръвта ни - всички са били създадени в ядрата на звезди,
                  които са живели и умрели преди милиарди години. Златото и другите тежки метали
                  са създадени при свръхнови експлозии.</p>

                  <p className="mt-3 font-semibold">Карл Сейгън е казал: "Ние сме начин на космоса
                  да познае себе си."</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Звездите се раждат в молекулни облаци</li>
              <li>✓ 90% от живота - на главната последователност</li>
              <li>✓ Живот ∝ M⁻²·⁵ (по-масивни = по-кратък живот)</li>
              <li>✓ Звезди &lt;8 M☉ → бели джуджета</li>
              <li>✓ Звезди &gt;8 M☉ → свръхнова → неутронна звезда/черна дупка</li>
              <li>✓ Всички тежки елементи са създадени в звезди</li>
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
              Всички тежки елементи във Вселената (включително тези в нашите тела)
              са били създадени в ядрата на звезди или при свръхнови експлозии.
              Ние сме буквално направени от звезден прах! Атомите в лявата ви ръка
              вероятно идват от различна звезда от тези в дясната ви ръка. Свръхновите
              не само създават тежки елементи, но и ги разпръскват в космоса, давайки
              материал за нови звезди, планети и живот!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
