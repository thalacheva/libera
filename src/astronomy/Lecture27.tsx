import { useState } from 'react';

export default function Lecture27() {
  const [timeSlider, setTimeSlider] = useState(50); // 0-100 представлява времето от Големия взрив
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Изчисляване на времето в милиарди години
  const timeInBillionYears = (timeSlider / 100) * 13.8;
  
  // Размер на Вселената (визуален ефект)
  const universeSize = 50 + timeSlider * 2;
  
  // Определяне на епохата
  let epoch = '';
  let epochColor = '';
  let description = '';
  
  if (timeSlider < 0.001) {
    epoch = 'Големият взрив';
    epochColor = 'rgb(255, 255, 255)';
    description = 't = 0, безкрайна температура и плътност';
  } else if (timeSlider < 1) {
    epoch = 'Инфлация';
    epochColor = 'rgb(255, 200, 100)';
    description = 't < 10⁻³² s, експоненциално разширяване';
  } else if (timeSlider < 5) {
    epoch = 'Кварк-глуонна плазма';
    epochColor = 'rgb(255, 150, 50)';
    description = 't < 1 s, екстремно гореща плазма';
  } else if (timeSlider < 10) {
    epoch = 'Нуклеосинтеза';
    epochColor = 'rgb(255, 100, 100)';
    description = 't = 3-20 min, образуване на H, He, Li';
  } else if (timeSlider < 30) {
    epoch = 'Тъмна ера';
    epochColor = 'rgb(100, 100, 150)';
    description = 't < 380 000 г, Вселената е непрозрачна';
  } else if (timeSlider < 45) {
    epoch = 'Рекомбинация';
    epochColor = 'rgb(255, 150, 150)';
    description = 't = 380 000 г, Вселената става прозрачна (CMB)';
  } else if (timeSlider < 60) {
    epoch = 'Първи звезди';
    epochColor = 'rgb(200, 200, 255)';
    description = 't = 200 млн г, раждат се първите звезди';
  } else if (timeSlider < 75) {
    epoch = 'Първи галактики';
    epochColor = 'rgb(150, 150, 255)';
    description = 't = 1 млрд г, формират се галактики';
  } else {
    epoch = 'Съвременна ера';
    epochColor = 'rgb(100, 150, 255)';
    description = `t = ${timeInBillionYears.toFixed(1)} млрд г, съвременната Вселена`;
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 27: Космология – Големият взрив
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Теория за Големия взрив
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Вселената е започнала от изключително гореща и плътна точка преди
            около 13.8 милиарда години и оттогава непрекъснато се разширява.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Интерактивна визуализация на Големия взрив
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Преместете плъзгача, за да видите еволюцията на Вселената във времето:
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Еволюция на Вселената</h3>
            
            <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Фон - черен космос */}
              <rect x="0" y="0" width="600" height="400" fill="rgb(10, 10, 30)" />
              
              {/* Звезди на фона (само след образуването им) */}
              {timeSlider > 45 && [...Array(50)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 600}
                  cy={Math.random() * 400}
                  r={Math.random() * 1.5}
                  fill="white"
                  opacity={Math.random() * 0.8 + 0.2}
                />
              ))}

              {/* Централна точка - Големият взрив */}
              <circle
                cx="300"
                cy="200"
                r={universeSize}
                fill={epochColor}
                opacity="0.6"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;0.8;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Вълни на разширяване */}
              {timeSlider > 1 && [1, 2, 3].map((i) => (
                <circle
                  key={i}
                  cx="300"
                  cy="200"
                  r={universeSize + i * 30}
                  fill="none"
                  stroke={epochColor}
                  strokeWidth="2"
                  opacity={0.3 / i}
                >
                  <animate
                    attributeName="r"
                    from={universeSize}
                    to={universeSize + 100}
                    dur={`${3 + i}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur={`${3 + i}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}

              {/* Галактики (след 1 млрд години) */}
              {timeSlider > 60 && (
                <>
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const distance = 80 + Math.random() * 100;
                    const x = 300 + distance * Math.cos(angle);
                    const y = 200 + distance * Math.sin(angle);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="8" fill="rgba(200, 200, 255, 0.6)" />
                        <circle cx={x} cy={y} r="4" fill="rgba(255, 255, 255, 0.8)" />
                      </g>
                    );
                  })}
                  {/* Стрелки показващи разширяване */}
                  {[0, 90, 180, 270].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 300 + 60 * Math.cos(rad);
                    const y1 = 200 + 60 * Math.sin(rad);
                    const x2 = 300 + (universeSize + 20) * Math.cos(rad);
                    const y2 = 200 + (universeSize + 20) * Math.sin(rad);
                    return (
                      <line
                        key={angle}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgb(255, 100, 100)"
                        strokeWidth="2"
                        markerEnd="url(#arrowExpand)"
                      />
                    );
                  })}
                </>
              )}

              {/* Текст в центъра */}
              <text
                x="300"
                y="200"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                fill="white"
              >
                {timeSlider < 1 ? '💥' : timeSlider < 45 ? '🌫️' : '✨'}
              </text>

              {/* Легенда */}
              <rect x="10" y="10" width="200" height="80" fill="rgba(0, 0, 0, 0.7)" rx="5" />
              <text x="20" y="30" fontSize="14" fontWeight="bold" fill="white">
                {epoch}
              </text>
              <text x="20" y="50" fontSize="11" fill="white">
                {timeInBillionYears.toFixed(2)} млрд години
              </text>
              <text x="20" y="70" fontSize="10" fill="rgb(200, 200, 200)">
                {description}
              </text>

              <defs>
                <marker id="arrowExpand" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 100, 100)" />
                </marker>
              </defs>
            </svg>

            {/* Плъзгач за време */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Време от Големия взрив: {timeInBillionYears.toFixed(2)} милиарда години
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={timeSlider}
                onChange={(e) => setTimeSlider(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Начало (0)</span>
                <span>Днес (13.8 млрд г)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2" style={{ color: epochColor }}>
                {epoch}
              </h4>
              <p className="text-sm">{description}</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Доказателства за Големия взрив
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Разширяване на Вселената</strong> – галактиките се
                отдалечават една от друга (закон на Хъбъл)
              </li>
              <li>
                <strong>Космическо микровълново фоново излъчване (CMB)</strong> –
                "ехо" от Големия взрив, температура 2.7 K
              </li>
              <li>
                <strong>Изобилие на леки елементи</strong> – водород (75%), хелий (25%) и
                литий в предсказаните пропорции
              </li>
              <li>
                <strong>Еволюция на галактиките</strong> – ранните галактики
                изглеждат различно от съвременните
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Хронология на Вселената
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="space-y-3">
              <li><strong>t = 0</strong> – Големият взрив, безкрайна температура</li>
              <li><strong>t = 10⁻⁴³ s</strong> – Планково време, начало на физиката</li>
              <li><strong>t = 10⁻³⁶ s</strong> – Инфлация, бързо разширяване</li>
              <li><strong>t = 3 min</strong> – Нуклеосинтеза, образуване на леки ядра</li>
              <li><strong>t = 380 000 г</strong> – Рекомбинация, Вселената става прозрачна</li>
              <li><strong>t = 200 млн г</strong> – Първите звезди</li>
              <li><strong>t = 1 млрд г</strong> – Първите галактики</li>
              <li><strong>t = 9 млрд г</strong> – Образуване на Слънчевата система</li>
              <li><strong>t = 13.8 млрд г</strong> – Днес</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Космическо микровълново фоново излъчване (CMB)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            CMB е излъчване от епохата, когато Вселената е станала прозрачна
            (380 000 години след Големия взрив). Спътниците COBE, WMAP и Planck са
            картографирали CMB с невероятна точност.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Температурни флуктуации в CMB</h3>
            
            <svg viewBox="0 0 600 300" className="w-full h-auto">
              {/* Симулация на CMB карта */}
              <rect x="0" y="0" width="600" height="300" fill="rgb(255, 100, 50)" />
              
              {/* Случайни "топли" и "студени" петна */}
              {[...Array(100)].map((_, i) => {
                const x = Math.random() * 600;
                const y = Math.random() * 300;
                const size = 20 + Math.random() * 40;
                const temp = Math.random();
                const color = temp > 0.5 
                  ? `rgb(255, ${100 + temp * 50}, ${50 + temp * 50})` // По-топло
                  : `rgb(${200 - temp * 50}, ${100 - temp * 30}, 255)`; // По-студено
                return (
                  <ellipse
                    key={i}
                    cx={x}
                    cy={y}
                    rx={size}
                    ry={size * 0.8}
                    fill={color}
                    opacity="0.3"
                  />
                );
              })}

              <text x="300" y="30" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Космическо микровълново фоново излъчване
              </text>
              <text x="300" y="50" fontSize="11" textAnchor="middle" fill="white">
                Температура: 2.725 K (±0.0002 K флуктуации)
              </text>

              {/* Легенда */}
              <g transform="translate(20, 250)">
                <rect x="0" y="0" width="30" height="15" fill="rgb(255, 150, 100)" />
                <text x="35" y="12" fontSize="10" fill="white">По-топли области (+0.0002 K)</text>
                
                <rect x="200" y="0" width="30" height="15" fill="rgb(150, 100, 255)" />
                <text x="235" y="12" fontSize="10" fill="white">По-студени области (-0.0002 K)</text>
              </g>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <p className="text-sm">
                Малките температурни разлики в CMB (±0.0002 K) са "семената" на
                днешните галактики и структури. По-плътните области са привлекли
                повече материя и са станали галактики.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Времева линия
          </h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <svg viewBox="0 0 700 200" className="w-full h-auto">
              {/* Времева линия */}
              <line x1="50" y1="100" x2="650" y2="100" stroke="currentColor" strokeWidth="3" />
              
              {/* Ключови моменти */}
              {[
                { time: 0, label: 'Големият взрив', x: 50, icon: '💥' },
                { time: 0.000001, label: 'Инфлация', x: 100, icon: '⚡' },
                { time: 0.003, label: 'Нуклео-синтеза', x: 180, icon: '⚛️' },
                { time: 380000, label: 'Рекомбинация (CMB)', x: 300, icon: '🌫️' },
                { time: 200000000, label: 'Първи звезди', x: 420, icon: '⭐' },
                { time: 1000000000, label: 'Първи галактики', x: 520, icon: '🌌' },
                { time: 13800000000, label: 'Днес', x: 650, icon: '🌍' },
              ].map((event, i) => (
                <g key={i}>
                  <circle cx={event.x} cy="100" r="8" fill="rgb(59, 130, 246)" stroke="white" strokeWidth="2" />
                  <text x={event.x} y="130" fontSize="20" textAnchor="middle">{event.icon}</text>
                  <text x={event.x} y="150" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">
                    {event.label}
                  </text>
                  {i > 0 && (
                    <text x={event.x} y="165" fontSize="8" textAnchor="middle" fill="gray">
                      {event.time < 1 ? `${event.time} s` : 
                       event.time < 1000000 ? `${(event.time / 1000).toFixed(0)} хил г` :
                       event.time < 1000000000 ? `${(event.time / 1000000).toFixed(0)} млн г` :
                       `${(event.time / 1000000000).toFixed(1)} млрд г`}
                    </text>
                  )}
                </g>
              ))}

              {/* Маркер за текущото време */}
              <circle
                cx={50 + timeSlider * 6}
                cy="100"
                r="12"
                fill="rgb(239, 68, 68)"
                stroke="white"
                strokeWidth="3"
              >
                <animate
                  attributeName="r"
                  values="12;15;12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
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
              <p className="font-semibold mb-2">1. Преди колко години е започнала Вселената?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: Преди около 13.8 милиарда години</p>
                  <p className="mt-2">Обяснение: Това е възрастта на Вселената, определена от
                  наблюдения на CMB, разширяването и най-старите звезди.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Каква е температурата на космическото микровълново
              фоново излъчване днес?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 2.725 K (около -270°C)</p>
                  <p className="mt-2">Обяснение: CMB е останало от епохата на рекомбинацията
                  (380 000 г след Големия взрив). Тогава температурата е била около 3000 K, но
                  поради разширяването на Вселената, излъчването е "охладено" до 2.7 K.</p>
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
              <p className="font-semibold mb-2">3. Защо Вселената е била непрозрачна преди
              рекомбинацията?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Преди рекомбинацията Вселената е била толкова гореща
                  (T &gt; 3000 K), че водородът е бил йонизиран (протони и електрони свободни).
                  Свободните електрони разсейват светлината много ефективно (Томсоново разсейване),
                  правейки Вселената непрозрачна като гъста мъгла.</p>
                  <p className="mt-2">При рекомбинацията (t = 380 000 г), температурата е паднала
                  достатъчно, за да се образуват неутрални атоми водород. Светлината вече може
                  да пътува свободно - Вселената става прозрачна. Това излъчване наблюдаваме днес
                  като CMB.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. С колко пъти се е разширила Вселената от
              епохата на рекомбинацията до днес, ако температурата е паднала от 3000 K до 2.7 K?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">При разширяване на Вселената, температурата на излъчването
                  намалява пропорционално на мащабния фактор:</p>
                  <p className="font-mono mt-2">T₁ / T₂ = a₂ / a₁</p>
                  <p className="mt-2">където a е мащабният фактор (размер на Вселената)</p>
                  <p className="mt-2">a₂ / a₁ = T₁ / T₂ = 3000 K / 2.7 K ≈ 1111</p>
                  <p className="mt-2"><strong>Отговор: Вселената се е разширила около 1100 пъти</strong></p>
                  <p className="mt-2 text-sm">Това означава, че разстоянията са 1100 пъти по-големи
                  днес, отколкото са били при рекомбинацията.</p>
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
              <p className="font-semibold mb-2">5. Обясни защо не можем да "видим" Големия взрив
              директно, дори с най-мощните телескопи. Какво е най-далечното нещо, което можем
              да наблюдаваме?</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Не можем да "видим" Големия взрив директно, защото:</p>
                  <ul className="list-decimal list-inside mt-2 space-y-2">
                    <li><strong>Вселената е била непрозрачна</strong> преди рекомбинацията
                    (t &lt; 380 000 г). Светлината не е могла да пътува свободно.</li>
                    <li><strong>Няма "преди" Големия взрив</strong> - времето и пространството
                    са започнали с него.</li>
                    <li><strong>Светлината има краен на скорост</strong> - виждаме миналото,
                    но не можем да видим по-назад от рекомбинацията.</li>
                  </ul>
                  <p className="mt-3"><strong>Най-далечното нещо:</strong> Космическото микровълново
                  фоново излъчване (CMB) от t = 380 000 години. Това е "повърхността на последното
                  разсейване" - най-далечното нещо, което можем да наблюдаваме с електромагнитно
                  излъчване.</p>
                  <p className="mt-2">За по-ранни епохи теоретично можем да използваме:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li><strong>Неутрино</strong> от t ≈ 1 секунда</li>
                    <li><strong>Гравитационни вълни</strong> от t ≈ 10⁻⁴³ секунди (Планково време)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Вселената е започнала преди 13.8 милиарда години</li>
              <li>✓ Непрекъснато се разширява от Големия взрив</li>
              <li>✓ CMB е "ехо" от епохата на рекомбинацията (380 000 г)</li>
              <li>✓ Първите звезди са се образували след 200 милиона години</li>
              <li>✓ Доказателства: разширяване, CMB, изобилие на елементи</li>
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
              Около 1% от "снега" на стар телевизор без сигнал всъщност е
              космическо микровълново фоново излъчване – буквално виждаме "ехото"
              от Големия взрив! Всеки път, когато гледате статично на телевизора,
              виждате светлина на 13.8 милиарда години - най-старата светлина във
              Вселената!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
