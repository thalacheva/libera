import { useState } from 'react';

export default function Lecture21() {
  const [blackHoleMass, setBlackHoleMass] = useState(10); // В слънчеви маси
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Радиус на Шварцшилд: Rs = 2GM/c² ≈ 3 km × (M/M☉)
  const schwarzschildRadius = blackHoleMass * 3; // km (опростено)

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 21: Бели джуджета, неутронни звезди, черни дупки
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Бели джуджета
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Остатъци от звезди с маса под 8 слънчеви маси. Много малки (размер на
            Земята) но изключително плътни.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Маса: до 1.4 M☉ (граница на Чандрасекар)</li>
              <li>Радиус: около 10 000 km (като Земята)</li>
              <li>Плътност: 1 тон/cm³</li>
              <li>Температура: 100 000 K (в началото)</li>
              <li>Не извършват ядрен синтез, само се охлаждат</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Неутронни звезди
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Остатъци от свръхнови на звезди с маса 8-25 M☉. Състоят се почти
            изцяло от неутрони.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Маса: 1.4-3 M☉</li>
              <li>Радиус: около 10-20 km</li>
              <li>Плътност: 100 милиона тона/cm³</li>
              <li>Въртене: до 700 оборота в секунда</li>
              <li>Магнитно поле: трилиони пъти по-силно от земното</li>
            </ul>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            <strong>Пулсари</strong> – бързо въртящи се неутронни звезди, които
            излъчват радиовълни като космически фарове.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Черни дупки
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Области в пространството с толкова силна гравитация, че дори светлината
            не може да избяга. Образуват се от звезди с маса над 25 M☉.
          </p>

          {/* Интерактивна визуализация на черна дупка */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-900 dark:border-gray-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Интерактивна черна дупка</h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Променете масата на черната дупка
            </p>

            <svg viewBox="0 0 600 500" className="w-full h-auto">
              {/* Фон - космос */}
              <rect x="0" y="0" width="600" height="500" fill="rgb(5, 5, 15)" />
              
              {/* Звезди на фона */}
              {[...Array(100)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 600}
                  cy={Math.random() * 500}
                  r={Math.random() * 1.5}
                  fill="white"
                  opacity={Math.random() * 0.8 + 0.2}
                />
              ))}

              {/* Гравитационно лещиране на фона */}
              <defs>
                <radialGradient id="lensing">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="50%" stopColor="rgba(100,100,150,0.2)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <radialGradient id="accretionDisk">
                  <stop offset="0%" stopColor="rgb(255, 200, 100)" />
                  <stop offset="40%" stopColor="rgb(255, 150, 50)" />
                  <stop offset="70%" stopColor="rgb(255, 100, 50)" />
                  <stop offset="100%" stopColor="rgb(200, 50, 50)" />
                </radialGradient>
              </defs>

              {/* Акреционен диск */}
              <ellipse
                cx="300"
                cy="250"
                rx={schwarzschildRadius * 8}
                ry={schwarzschildRadius * 2}
                fill="url(#accretionDisk)"
                opacity="0.7"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 300 250"
                  to="360 300 250"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </ellipse>

              {/* Джетове (изхвърляния) */}
              <g opacity="0.6">
                <path
                  d={`M 300,250 L 300,${250 - schwarzschildRadius * 15}`}
                  stroke="rgb(100, 200, 255)"
                  strokeWidth={schwarzschildRadius * 0.5}
                  strokeLinecap="round"
                >
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
                </path>
                <path
                  d={`M 300,250 L 300,${250 + schwarzschildRadius * 15}`}
                  stroke="rgb(100, 200, 255)"
                  strokeWidth={schwarzschildRadius * 0.5}
                  strokeLinecap="round"
                >
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="1s" repeatCount="indefinite" />
                </path>
              </g>

              {/* Фотонна сфера */}
              <circle
                cx="300"
                cy="250"
                r={schwarzschildRadius * 1.5}
                fill="none"
                stroke="rgb(255, 200, 100)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
              <text
                x="300"
                y={250 - schwarzschildRadius * 1.5 - 10}
                fontSize="10"
                textAnchor="middle"
                fill="rgb(255, 200, 100)"
              >
                Фотонна сфера
              </text>

              {/* Хоризонт на събитията */}
              <circle
                cx="300"
                cy="250"
                r={schwarzschildRadius}
                fill="rgb(0, 0, 0)"
                stroke="rgb(255, 100, 100)"
                strokeWidth="3"
              />
              <text
                x="300"
                y={250 - schwarzschildRadius - 10}
                fontSize="11"
                textAnchor="middle"
                fill="rgb(255, 100, 100)"
                fontWeight="bold"
              >
                Хоризонт на събитията
              </text>
              <text
                x="300"
                y={250 - schwarzschildRadius - 25}
                fontSize="10"
                textAnchor="middle"
                fill="rgb(255, 100, 100)"
              >
                Rs = {schwarzschildRadius} km
              </text>

              {/* Сингулярност */}
              <circle cx="300" cy="250" r="3" fill="white">
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
              </circle>
              <text x="315" y="255" fontSize="10" fill="white" fontWeight="bold">
                Сингулярност
              </text>

              {/* Частици, падащи към черната дупка */}
              {[0, 120, 240].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <g key={i}>
                    <circle
                      cx={300 + schwarzschildRadius * 10 * Math.cos(rad)}
                      cy={250 + schwarzschildRadius * 10 * Math.sin(rad)}
                      r="4"
                      fill="rgb(255, 200, 100)"
                    >
                      <animateMotion
                        path={`M ${schwarzschildRadius * 10 * Math.cos(rad)},${schwarzschildRadius * 10 * Math.sin(rad)} 
                                L ${schwarzschildRadius * 1.2 * Math.cos(rad)},${schwarzschildRadius * 1.2 * Math.sin(rad)}`}
                        dur={`${3 + i}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="1;0"
                        dur={`${3 + i}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}

              {/* Легенда */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="200" height="120" fill="rgba(0, 0, 0, 0.8)" rx="5" />
                <text x="10" y="25" fontSize="13" fill="white" fontWeight="bold">
                  Черна дупка
                </text>
                <text x="10" y="45" fontSize="11" fill="white">
                  Маса: {blackHoleMass} M☉
                </text>
                <text x="10" y="60" fontSize="11" fill="white">
                  Rs: {schwarzschildRadius} km
                </text>
                <text x="10" y="80" fontSize="9" fill="rgb(255, 100, 100)">
                  ⚫ Хоризонт на събитията
                </text>
                <text x="10" y="95" fontSize="9" fill="rgb(255, 200, 100)">
                  🟡 Фотонна сфера (1.5 Rs)
                </text>
                <text x="10" y="110" fontSize="9" fill="rgb(255, 150, 50)">
                  🔥 Акреционен диск
                </text>
              </g>

              {/* Информация за гравитация */}
              <g transform="translate(380, 420)">
                <text x="0" y="0" fontSize="10" fill="rgb(255, 100, 100)" fontWeight="bold">
                  ⚠️ Нищо не може да избяга от хоризонта!
                </text>
                <text x="0" y="15" fontSize="9" fill="white">
                  Дори светлината е уловена завинаги
                </text>
              </g>
            </svg>

            {/* Контрола за маса */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Маса на черната дупка: {blackHoleMass} M☉ → Радиус на Шварцшилд: {schwarzschildRadius} km
              </label>
              <input
                type="range"
                min="3"
                max="100"
                value={blackHoleMass}
                onChange={(e) => setBlackHoleMass(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Звездна (3 M☉)</span>
                <span>Междинна (100 M☉)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Елементи на черната дупка:</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <strong className="text-red-600 dark:text-red-400">Хоризонт на събитията:</strong> 
                  Границата на черната дупка (Rs = {schwarzschildRadius} km). Нищо не може да избяга отвътре.
                </li>
                <li>
                  <strong className="text-yellow-600 dark:text-yellow-400">Фотонна сфера:</strong> 
                  На 1.5 × Rs. Светлината може да обикаля черната дупка по кръгови орбити.
                </li>
                <li>
                  <strong className="text-orange-600 dark:text-orange-400">Акреционен диск:</strong> 
                  Материя, която пада към черната дупка. Нагрява се до милиони градуси и излъчва рентгенови лъчи.
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-blue-400">Джетове:</strong> 
                  Мощни изхвърляния на материя по оста на въртене.
                </li>
                <li>
                  <strong>Сингулярност:</strong> 
                  Точка с безкрайна плътност в центъра (физиката се "разваля").
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Сравнение на размерите
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <svg viewBox="0 0 700 300" className="w-full h-auto">
              <rect x="0" y="0" width="700" height="300" fill="rgb(20, 20, 40)" />

              {/* Земя (за сравнение) */}
              <circle cx="100" cy="150" r="40" fill="rgb(59, 130, 246)" />
              <circle cx="100" cy="150" r="40" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="100" y="210" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Земя
              </text>
              <text x="100" y="225" fontSize="10" textAnchor="middle" fill="gray">
                R = 6371 km
              </text>

              {/* Бяло джудже */}
              <circle cx="250" cy="150" r="38" fill="rgb(220, 220, 255)" />
              <text x="250" y="210" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Бяло джудже
              </text>
              <text x="250" y="225" fontSize="10" textAnchor="middle" fill="gray">
                R ≈ 10000 km
              </text>
              <text x="250" y="240" fontSize="9" textAnchor="middle" fill="gray">
                M = 1 M☉
              </text>

              {/* Неутронна звезда */}
              <circle cx="400" cy="150" r="8" fill="rgb(200, 150, 255)" />
              <circle cx="400" cy="150" r="15" fill="none" stroke="rgb(200, 150, 255)" strokeWidth="1" strokeDasharray="2,2" />
              <text x="400" y="180" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Неутронна звезда
              </text>
              <text x="400" y="195" fontSize="10" textAnchor="middle" fill="gray">
                R ≈ 10-20 km
              </text>
              <text x="400" y="210" fontSize="9" textAnchor="middle" fill="gray">
                M = 1.4-3 M☉
              </text>

              {/* Черна дупка */}
              <circle cx="550" cy="150" r="12" fill="rgb(0, 0, 0)" stroke="rgb(255, 100, 100)" strokeWidth="3" />
              <circle cx="550" cy="150" r="25" fill="none" stroke="rgb(255, 200, 100)" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
              <text x="550" y="190" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                Черна дупка
              </text>
              <text x="550" y="205" fontSize="10" textAnchor="middle" fill="gray">
                Rs = {schwarzschildRadius} km
              </text>
              <text x="550" y="220" fontSize="9" textAnchor="middle" fill="gray">
                M = {blackHoleMass} M☉
              </text>

              {/* Стрелки за плътност */}
              <text x="350" y="50" fontSize="13" textAnchor="middle" fill="rgb(255, 200, 100)" fontWeight="bold">
                Плътност нараства →
              </text>
            </svg>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Видове черни дупки
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Звездни черни дупки</strong> – от свръхнови (5-100 M☉)
                <br/>Rs ≈ 15-300 km
              </li>
              <li>
                <strong>Междинни черни дупки</strong> – 100-100 000 M☉
                <br/>Rs ≈ 300 km - 300 000 km
              </li>
              <li>
                <strong>Свръхмасивни черни дупки</strong> – в центрове на галактики (милиони-милиарди M☉)
                <br/>Rs ≈ милиони km (като орбитата на Земята!)
              </li>
              <li>
                <strong>Първични черни дупки</strong> – хипотетични, от ранната Вселена
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Формули
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="space-y-3">
              <li>
                <strong>Радиус на Шварцшилд:</strong>
                <p className="font-mono mt-1">Rs = 2GM / c²</p>
                <p className="text-sm">Rs ≈ 3 km × (M / M☉)</p>
              </li>
              <li>
                <strong>Граница на Чандрасекар:</strong>
                <p className="mt-1">Максимална маса на бяло джудже: 1.4 M☉</p>
              </li>
              <li>
                <strong>Граница на Толман–Опенхаймер–Волков:</strong>
                <p className="mt-1">Максимална маса на неутронна звезда: около 2-3 M☉</p>
              </li>
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
              <p className="font-semibold mb-2">1. Какво е хоризонт на събитията?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Хоризонтът на събитията е границата на черната дупка.
                  Всичко, което премине през тази граница, не може да избяга - дори светлината.
                  Радиусът на хоризонта се нарича радиус на Шварцшилд (Rs).</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Каква е максималната маса на бяло джудже?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 1.4 M☉ (граница на Чандрасекар)</p>
                  <p className="mt-2">Обяснение: Ако бялото джудже надхвърли тази маса, гравитацията
                  надвива налягането на електроните и то колапсира - или става неутронна звезда
                  (ако има свръхнова), или директно черна дупка.</p>
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
              <p className="font-semibold mb-2">3. Изчисли радиуса на Шварцшилд за черна дупка с
              маса 10 M☉. (Rs ≈ 3 km × M/M☉)</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Rs = 3 km × (M / M☉)</p>
                  <p>Rs = 3 km × 10 = 30 km</p>
                  <p className="mt-2"><strong>Отговор: 30 km</strong></p>
                  <p className="mt-2 text-sm">За сравнение: София е на около 30 km от север до юг!</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Колко е плътността на неутронна звезда, ако
              има маса 1.4 M☉ и радиус 10 km?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Обем на сфера: V = (4/3)πR³</p>
                  <p>V = (4/3) × 3.14159 × (10 km)³ = 4189 km³</p>
                  <p className="mt-2">Маса: M = 1.4 M☉ = 1.4 × 2 × 10³⁰ kg = 2.8 × 10³⁰ kg</p>
                  <p className="mt-2">Плътност: ρ = M / V = 2.8 × 10³⁰ kg / (4.189 × 10¹² m³)</p>
                  <p>ρ ≈ 6.7 × 10¹⁷ kg/m³</p>
                  <p className="mt-2"><strong>Отговор: около 7 × 10¹⁷ kg/m³</strong></p>
                  <p className="mt-2 text-sm">Това е около 100 милиона тона на кубичен сантиметър!
                  Лъжичка от неутронна звезда би тежала колкото всички хора на Земята заедно.</p>
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
              <p className="font-semibold mb-2">5. Ако Слънцето стане черна дупка (хипотетично),
              какъв ще бъде радиусът на Шварцшилд? Ще се промени ли орбитата на Земята?</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Радиус на Шварцшилд:</strong></p>
                  <p>Rs = 3 km × (M / M☉) = 3 km × 1 = 3 km</p>
                  <p className="mt-2">Слънцето (R = 696 000 km) би се свило до 3 km!</p>
                  
                  <p className="mt-3"><strong>Орбитата на Земята:</strong></p>
                  <p className="mt-2">НЕ, орбитата няма да се промени!</p>
                  
                  <p className="mt-2">Обяснение: Гравитацията зависи само от масата и разстоянието,
                  не от размера на обекта. Формула:</p>
                  <p className="font-mono mt-1">F = GMm / r²</p>
                  
                  <p className="mt-2">Масата на "черната дупка-Слънце" е същата (1 M☉), разстоянието
                  до Земята е същото (1 AU = 150 млн km), значи силата е същата.</p>
                  
                  <p className="mt-3">Земята ще продължи да обикаля по същата орбита. Единствената
                  разлика ще бъде, че няма да получаваме светлина и топлина!</p>
                  
                  <p className="mt-3 font-semibold">Важно: Черните дупки не "засмукват" всичко около
                  себе си. Те имат същата гравитация като звездата, от която са образувани.
                  Опасни са само ако се приближите много близо (под няколко Rs).</p>
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
              <li>✓ Бели джуджета: M &lt; 1.4 M☉, R ≈ 10 000 km, ρ ≈ 1 т/cm³</li>
              <li>✓ Неутронни звезди: M = 1.4-3 M☉, R ≈ 10-20 km, ρ ≈ 10⁸ т/cm³</li>
              <li>✓ Черни дупки: M &gt; 3 M☉, Rs = 2GM/c² ≈ 3 km × (M/M☉)</li>
              <li>✓ Хоризонт на събитията - точка на невръщане</li>
              <li>✓ Първа снимка на черна дупка - M87*, 2019 г.</li>
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
              Първата снимка на черна дупка беше направена през 2019 г. от Event
              Horizon Telescope – свръхмасивната черна дупка в центъра на галактика
              M87, с маса 6.5 милиарда слънчеви маси! За да я "снимат", са използвали
              мрежа от телескопи по целия свят, създавайки виртуален телескоп с
              размер на Земята. През 2022 г. снимаха и нашата черна дупка - Sgr A*
              в центъра на Млечния път (4 милиона M☉).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
