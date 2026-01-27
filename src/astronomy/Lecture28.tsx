import { useState } from 'react';

export default function Lecture28() {
  const [time, setTime] = useState(0); // 0-100 за анимация на разширяването
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Мащабен фактор (колко се е разширила Вселената)
  const scaleFactor = 1 + time * 0.02;

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 28: Разширяване на Вселената
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Закон на Хъбъл
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Едуин Хъбъл открива (1929), че галактиките се отдалечават от нас със
            скорост, пропорционална на разстоянието им.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-center text-xl font-mono my-3">v = H₀ × d</p>
            <ul className="list-disc list-inside space-y-2">
              <li>v – скорост на отдалечаване (km/s)</li>
              <li>H₀ – константа на Хъбъл (около 70 km/s/Mpc)</li>
              <li>d – разстояние (Mpc - мегапарсек)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Интерактивна визуализация на разширяването
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Наблюдавайте как галактиките се отдалечават една от друга:
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Разширяване на Вселената</h3>
            
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {/* Фон */}
              <rect x="0" y="0" width="600" height="400" fill="rgb(10, 10, 30)" />

              {/* Мрежа (разширяваща се) */}
              {[...Array(10)].map((_, i) => (
                <g key={`grid-${i}`}>
                  {/* Вертикални линии */}
                  <line
                    x1={100 + i * 40 * scaleFactor}
                    y1="50"
                    x2={100 + i * 40 * scaleFactor}
                    y2="350"
                    stroke="rgb(100, 100, 150)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.3"
                  />
                  {/* Хоризонтални линии */}
                  <line
                    x1="100"
                    y1={50 + i * 30 * scaleFactor}
                    x2="500"
                    y2={50 + i * 30 * scaleFactor}
                    stroke="rgb(100, 100, 150)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.3"
                  />
                </g>
              ))}

              {/* Наша галактика (в центъра, референтна точка) */}
              <g>
                <circle cx="300" cy="200" r="12" fill="rgb(255, 200, 100)" />
                <circle cx="300" cy="200" r="8" fill="rgb(255, 255, 200)" />
                <text x="300" y="235" fontSize="11" textAnchor="middle" fill="white" fontWeight="bold">
                  Млечен път
                </text>
                <text x="300" y="250" fontSize="9" textAnchor="middle" fill="gray">
                  (референтна точка)
                </text>
              </g>

              {/* Околни галактики - отдалечават се */}
              {[
                { angle: 0, distance: 80, name: 'Галактика A', color: 'rgb(150, 200, 255)' },
                { angle: 45, distance: 100, name: 'Галактика B', color: 'rgb(200, 150, 255)' },
                { angle: 90, distance: 60, name: 'Галактика C', color: 'rgb(255, 150, 200)' },
                { angle: 135, distance: 90, name: 'Галактика D', color: 'rgb(150, 255, 200)' },
                { angle: 180, distance: 70, name: 'Галактика E', color: 'rgb(255, 200, 150)' },
                { angle: 225, distance: 110, name: 'Галактика F', color: 'rgb(200, 255, 150)' },
                { angle: 270, distance: 85, name: 'Галактика G', color: 'rgb(255, 150, 255)' },
                { angle: 315, distance: 95, name: 'Галактика H', color: 'rgb(150, 255, 255)' },
              ].map((galaxy, i) => {
                const rad = (galaxy.angle * Math.PI) / 180;
                const dist = galaxy.distance * scaleFactor;
                const x = 300 + dist * Math.cos(rad);
                const y = 200 + dist * Math.sin(rad);
                
                // Скорост на отдалечаване (Хъбъл)
                const velocity = Math.round(galaxy.distance * scaleFactor * 0.7); // km/s (опростено)
                
                return (
                  <g key={i}>
                    {/* Галактика */}
                    <circle cx={x} cy={y} r="10" fill={galaxy.color} opacity="0.7" />
                    <circle cx={x} cy={y} r="5" fill="white" opacity="0.9" />
                    
                    {/* Стрелка показваща посоката на движение */}
                    {time > 20 && (
                      <line
                        x1={300 + galaxy.distance * 0.8 * Math.cos(rad)}
                        y1={200 + galaxy.distance * 0.8 * Math.sin(rad)}
                        x2={x}
                        y2={y}
                        stroke="rgb(255, 100, 100)"
                        strokeWidth="2"
                        markerEnd="url(#arrowGalaxy)"
                        opacity="0.6"
                      />
                    )}
                    
                    {/* Етикет */}
                    <text
                      x={x}
                      y={y + 20}
                      fontSize="9"
                      textAnchor="middle"
                      fill="white"
                    >
                      {velocity} km/s
                    </text>
                  </g>
                );
              })}

              <defs>
                <marker id="arrowGalaxy" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 100, 100)" />
                </marker>
              </defs>
            </svg>

            {/* Контрола */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Време: {time === 0 ? 'Начало' : `След ${(time * 0.1).toFixed(1)} млрд години`}
                {time > 0 && ` (мащаб: ${scaleFactor.toFixed(2)}x)`}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Миналото (по-близо)</span>
                <span>Бъдещето (по-далеч)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>🌌 Всички галактики се отдалечават от нас</li>
                <li>📏 По-далечните галактики се движат по-бързо (закон на Хъбъл)</li>
                <li>🌐 Разширява се самото пространство, не галактиките през него</li>
                <li>🎯 Няма "център" на разширяването - всяка точка изглежда като център</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Червено изместване
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Светлината от отдалечаващи се галактики се измества към червения край
            на спектъра заради разширяването на пространството.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Червено изместване (Redshift)</h3>
            
            <svg viewBox="0 0 700 250" className="w-full h-auto">
              {/* Близка галактика */}
              <g>
                <circle cx="100" cy="125" r="20" fill="rgb(200, 200, 255)" />
                <text x="100" y="160" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Близка галактика
                </text>
                <text x="100" y="175" fontSize="10" textAnchor="middle" fill="gray">
                  z = 0.01
                </text>
                
                {/* Спектър */}
                <rect x="60" y="190" width="80" height="15" fill="url(#spectrum)" />
                <line x1="100" y1="185" x2="100" y2="210" stroke="rgb(0, 255, 0)" strokeWidth="2" />
                <text x="100" y="225" fontSize="9" textAnchor="middle" fill="rgb(0, 255, 0)">
                  λ = 500 nm
                </text>
              </g>

              {/* Средна галактика */}
              <g transform="translate(200, 0)">
                <circle cx="100" cy="125" r="20" fill="rgb(255, 200, 200)" />
                <text x="100" y="160" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Средна галактика
                </text>
                <text x="100" y="175" fontSize="10" textAnchor="middle" fill="gray">
                  z = 0.5
                </text>
                
                {/* Спектър с изместване */}
                <rect x="60" y="190" width="80" height="15" fill="url(#spectrum)" />
                <line x1="110" y1="185" x2="110" y2="210" stroke="rgb(255, 165, 0)" strokeWidth="2" />
                <text x="110" y="225" fontSize="9" textAnchor="middle" fill="rgb(255, 165, 0)">
                  λ = 750 nm
                </text>
              </g>

              {/* Далечна галактика */}
              <g transform="translate(400, 0)">
                <circle cx="100" cy="125" r="20" fill="rgb(255, 150, 150)" />
                <text x="100" y="160" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Далечна галактика
                </text>
                <text x="100" y="175" fontSize="10" textAnchor="middle" fill="gray">
                  z = 2.0
                </text>
                
                {/* Спектър с голямо изместване */}
                <rect x="60" y="190" width="80" height="15" fill="url(#spectrum)" />
                <line x1="120" y1="185" x2="120" y2="210" stroke="rgb(255, 0, 0)" strokeWidth="2" />
                <text x="120" y="225" fontSize="9" textAnchor="middle" fill="rgb(255, 0, 0)">
                  λ = 1500 nm
                </text>
              </g>

              {/* Стрелки показващи изместване */}
              <path d="M 100,205 L 110,205" stroke="rgb(255, 100, 100)" strokeWidth="2" markerEnd="url(#arrowRed1)" />
              <path d="M 300,205 L 320,205" stroke="rgb(255, 100, 100)" strokeWidth="2" markerEnd="url(#arrowRed2)" />

              <defs>
                <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgb(138, 43, 226)', stopOpacity: 1 }} />
                  <stop offset="20%" style={{ stopColor: 'rgb(0, 0, 255)', stopOpacity: 1 }} />
                  <stop offset="40%" style={{ stopColor: 'rgb(0, 255, 0)', stopOpacity: 1 }} />
                  <stop offset="60%" style={{ stopColor: 'rgb(255, 255, 0)', stopOpacity: 1 }} />
                  <stop offset="80%" style={{ stopColor: 'rgb(255, 165, 0)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(255, 0, 0)', stopOpacity: 1 }} />
                </linearGradient>
                <marker id="arrowRed1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 100, 100)" />
                </marker>
                <marker id="arrowRed2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 100, 100)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Червено изместване (z):</h4>
              <p className="text-sm mb-2">z = Δλ / λ = (λ_наблюдавана - λ_излъчена) / λ_излъчена</p>
              <ul className="text-sm space-y-1">
                <li>z = 0: Няма изместване (локални обекти)</li>
                <li>z = 0.01-0.1: Близки галактики</li>
                <li>z = 0.5-2: Далечни галактики</li>
                <li>z &gt; 6: Най-ранните галактики</li>
                <li>z = 1089: CMB (най-далечното наблюдаемо)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Анимация на разширяването
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Как се разширява Вселената</h3>
            
            <svg viewBox="0 0 600 300" className="w-full h-auto">
              <rect x="0" y="0" width="600" height="300" fill="rgb(20, 20, 50)" />

              {/* Галактики на мрежа */}
              {[0, 1, 2, 3, 4].map((row) =>
                [0, 1, 2, 3, 4].map((col) => {
                  const baseX = 100 + col * 100;
                  const baseY = 50 + row * 50;
                  const x = 300 + (baseX - 300) * scaleFactor;
                  const y = 150 + (baseY - 150) * scaleFactor;
                  
                  // Скорост (пропорционална на разстоянието)
                  const dx = baseX - 300;
                  const dy = baseY - 150;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  const velocity = Math.round(distance * 0.5 * (scaleFactor - 1) * 10);
                  
                  return (
                    <g key={`${row}-${col}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill={row === 2 && col === 2 ? 'rgb(255, 200, 100)' : 'rgb(150, 200, 255)'}
                        stroke="white"
                        strokeWidth="1"
                      />
                      {/* Показваме скорост за някои галактики */}
                      {time > 30 && (row === 0 || row === 4) && col === 2 && velocity > 0 && (
                        <text
                          x={x}
                          y={y + 15}
                          fontSize="8"
                          textAnchor="middle"
                          fill="rgb(255, 100, 100)"
                          fontWeight="bold"
                        >
                          {velocity} km/s
                        </text>
                      )}
                    </g>
                  );
                })
              )}

              {/* Текст */}
              <text x="300" y="25" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                Разширяване на пространството
              </text>
            </svg>

            {/* Контрола */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Мащаб на Вселената: {scaleFactor.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Миналото (1x)</span>
                <span>Бъдещето (3x)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Ключови наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>📐 Разстоянията между галактиките нарастват пропорционално</li>
                <li>🚀 По-далечните галактики се отдалечават по-бързо (v ∝ d)</li>
                <li>🌐 Всяка галактика вижда същата картина - няма център</li>
                <li>📏 Мрежата се разтяга - пространството се разширява</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Ускорено разширяване
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            През 1998 г. е открито, че разширяването на Вселената се ускорява!
            Това откритие е донесло Нобелова награда и е довело до концепцията за
            тъмна енергия.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Наблюдения на далечни свръхнови тип Ia показват:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Разширяването се е забавяло в миналото (гравитация)</li>
              <li>Преди около 5 милиарда години е започнало ускорение</li>
              <li>Тъмната енергия доминира днес (~68% от Вселената)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Съдба на Вселената
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-2 font-semibold">Възможни сценарии:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Голямо замръзване</strong> – вечно разширяване, Вселената става
                студена и тъмна (най-вероятно)
              </li>
              <li>
                <strong>Голямо свиване</strong> – Вселената колапсира обратно (малко вероятно)
              </li>
              <li>
                <strong>Голямо разкъсване</strong> – тъмната енергия разкъсва всичко
                (зависи от свойствата на тъмната енергия)
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
              <p className="font-semibold mb-2">1. Какво казва законът на Хъбъл?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор:</p>
                  <p className="mt-2">Законът на Хъбъл казва, че галактиките се отдалечават от нас
                  със скорост, пропорционална на разстоянието им: v = H₀ × d</p>
                  <p className="mt-2">Колкото по-далеч е галактиката, толкова по-бързо се отдалечава.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Какво е червено изместване?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Червеното изместване е изместване на спектралните линии към
                  по-дълги дължини на вълната (червения край на спектъра). То се дължи на
                  разширяването на пространството между нас и далечните галактики.</p>
                  <p className="mt-2">Колкото по-голямо е червеното изместване (z), толкова
                  по-далеч е обектът и толкова по-бързо се отдалечава.</p>
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
              <p className="font-semibold mb-2">3. Галактика е на разстояние 100 Mpc. С каква скорост
              се отдалечава, ако H₀ = 70 km/s/Mpc?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме закона на Хъбъл: v = H₀ × d</p>
                  <p className="mt-2">v = 70 km/s/Mpc × 100 Mpc = 7000 km/s</p>
                  <p className="mt-2"><strong>Отговор: 7000 km/s</strong></p>
                  <p className="mt-2 text-sm">Това е около 2.3% от скоростта на светлината!</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Галактика има червено изместване z = 0.1.
              Изчисли скоростта на отдалечаване. (За малки z: v ≈ c × z)</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">За малки червени измествания: v ≈ c × z</p>
                  <p className="mt-2">v = 300 000 km/s × 0.1 = 30 000 km/s</p>
                  <p className="mt-2"><strong>Отговор: 30 000 km/s (10% от скоростта на светлината)</strong></p>
                  <p className="mt-2 text-sm">Забележка: При по-големи z трябва да се използва
                  релативистката формула.</p>
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
              <p className="font-semibold mb-2">5. Обясни парадокса: Ако всички галактики се
              отдалечават от нас, означава ли това, че ние сме в центъра на Вселената?</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Не, ние НЕ сме в центъра!</strong></p>
                  <p className="mt-2">Ключът е да разберем, че <strong>самото пространство се
                  разширява</strong>, а не че галактиките се движат през пространството.</p>
                  <p className="mt-3">Аналогия с балон:</p>
                  <p className="mt-1">Представете си точки на повърхността на балон. Когато
                  надуваме балона, всяка точка вижда всички останали точки да се отдалечават.
                  Няма "център" на повърхността - всяка точка изглежда като център от своя
                  гледна точка.</p>
                  <p className="mt-3">Същото е с Вселената: всеки наблюдател (на всяка галактика)
                  вижда всички останали галактики да се отдалечават според закона на Хъбъл.
                  Няма привилегирована позиция или център на разширяването.</p>
                  <p className="mt-3 font-semibold">Това е космологичният принцип: Вселената изглежда
                  еднаква от всяка точка (хомогенна и изотропна).</p>
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
              <li>✓ Закон на Хъбъл: v = H₀ × d (H₀ ≈ 70 km/s/Mpc)</li>
              <li>✓ Червено изместване: z = Δλ / λ</li>
              <li>✓ Разширява се пространството, не галактиките през него</li>
              <li>✓ Разширяването се ускорява (тъмна енергия)</li>
              <li>✓ Няма център на разширяването</li>
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
              Разширяването на Вселената не означава, че галактиките се движат
              през пространството. Самото пространство се разширява, като носи
              галактиките със себе си! Това е като да рисувате точки на балон и
              после да го надувате - точките се отдалечават, но не се движат по
              повърхността. Поради това галактики могат да се "отдалечават" по-бързо
              от светлината - не нарушават относителността, защото не се движат
              през пространството!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
