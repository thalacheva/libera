import { useState } from 'react';

export default function Lecture24() {
  const [selectedMethod, setSelectedMethod] = useState<'parallax' | 'cepheid' | 'supernova'>('parallax');
  const [parallaxAngle, setParallaxAngle] = useState(0.5); // ъглови секунди
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Изчисляване на разстояние от паралакс
  const distance = 1 / parallaxAngle; // в парсеки

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 24: Разстояния в астрономията
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Единици за разстояние
          </h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Астрономическа единица (AU)</strong> – разстоянието Земя-Слънце = 149.6 млн. km</li>
              <li><strong>Светлинна година (ly)</strong> – разстояние, което светлината изминава за 1 година = 9.46 трилиона km</li>
              <li><strong>Парсек (pc)</strong> – 3.26 светлинни години = 206 265 AU = 3.086 × 10¹³ km</li>
              <li><strong>Килопарсек (kpc)</strong> – 1000 парсека</li>
              <li><strong>Мегапарсек (Mpc)</strong> – 1 милион парсека</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Космическа стълба на разстоянията
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Различни методи се използват за различни разстояния. Всеки метод се
            калибрира с предходния.
          </p>

          {/* Избор на метод */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedMethod('parallax')}
              className={`px-4 py-2 rounded ${selectedMethod === 'parallax' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              📐 Паралакс
            </button>
            <button
              onClick={() => setSelectedMethod('cepheid')}
              className={`px-4 py-2 rounded ${selectedMethod === 'cepheid' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              ⭐ Цефеиди
            </button>
            <button
              onClick={() => setSelectedMethod('supernova')}
              className={`px-4 py-2 rounded ${selectedMethod === 'supernova' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              💥 Свръхнови
            </button>
          </div>

          {/* Визуализация на паралакс */}
          {selectedMethod === 'parallax' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
              <h3 className="font-semibold mb-3 text-center">Тригонометричен паралакс</h3>
              
              <svg viewBox="0 0 700 400" className="w-full h-auto">
                {/* Фон */}
                <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />
                
                {/* Далечни звезди (фон) */}
                {[...Array(50)].map((_, i) => (
                  <circle
                    key={i}
                    cx={50 + Math.random() * 600}
                    cy={50 + Math.random() * 300}
                    r="1"
                    fill="white"
                    opacity="0.3"
                  />
                ))}

                {/* Орбита на Земята */}
                <ellipse cx="350" cy="300" rx="100" ry="30" fill="none" stroke="rgb(100, 150, 200)" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Слънце */}
                <circle cx="350" cy="300" r="15" fill="rgb(251, 191, 36)" />
                <text x="350" y="330" fontSize="11" textAnchor="middle" fill="white">☀️ Слънце</text>

                {/* Земя - позиция 1 (януари) */}
                <circle cx="450" cy="300" r="8" fill="rgb(59, 130, 246)" />
                <text x="450" y="320" fontSize="10" textAnchor="middle" fill="white">Земя (януари)</text>

                {/* Земя - позиция 2 (юли) */}
                <circle cx="250" cy="300" r="8" fill="rgb(59, 130, 246)" opacity="0.5" />
                <text x="250" y="320" fontSize="10" textAnchor="middle" fill="white">Земя (юли)</text>

                {/* Близка звезда */}
                <circle cx="350" cy="100" r="8" fill="rgb(255, 255, 100)">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="350" y="85" fontSize="12" textAnchor="middle" fill="rgb(255, 255, 100)" fontWeight="bold">
                  Близка звезда
                </text>

                {/* Линии на видимост */}
                <line x1="450" y1="300" x2="350" y2="100" stroke="rgb(100, 200, 255)" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="250" y1="300" x2="350" y2="100" stroke="rgb(100, 200, 255)" strokeWidth="2" strokeDasharray="3,3" />

                {/* Ъгъл на паралакса */}
                <path
                  d={`M 350,280 L 350,250 A 50,50 0 0,1 ${350 + 50 * Math.sin(parallaxAngle * 0.1)},${280 - 50 * Math.cos(parallaxAngle * 0.1)}`}
                  fill="none"
                  stroke="rgb(255, 100, 100)"
                  strokeWidth="2"
                />
                <text x="380" y="265" fontSize="11" fill="rgb(255, 100, 100)" fontWeight="bold">
                  p = {parallaxAngle}"
                </text>

                {/* База (1 AU) */}
                <line x1="250" y1="340" x2="450" y2="340" stroke="rgb(34, 197, 94)" strokeWidth="2" />
                <line x1="250" y1="335" x2="250" y2="345" stroke="rgb(34, 197, 94)" strokeWidth="2" />
                <line x1="450" y1="335" x2="450" y2="345" stroke="rgb(34, 197, 94)" strokeWidth="2" />
                <text x="350" y="360" fontSize="11" textAnchor="middle" fill="rgb(34, 197, 94)" fontWeight="bold">
                  1 AU (база)
                </text>
              </svg>

              {/* Контрола */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-center">
                  Паралакс: {parallaxAngle}" → Разстояние: {distance.toFixed(2)} парсека ({(distance * 3.26).toFixed(1)} св.г.)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={parallaxAngle}
                  onChange={(e) => setParallaxAngle(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Малък ъгъл (далеч)</span>
                  <span>Голям ъгъл (близо)</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Формула:</h4>
                <p className="font-mono text-center text-lg my-2">d (парсеки) = 1 / p (ъглови секунди)</p>
                <p className="text-sm mt-2">
                  <strong>Обхват:</strong> До около 100 парсека (300 св.г.) от Земята.
                  Спътникът Gaia измерва паралакси с точност до 0.00002" (микроъглови секунди)!
                </p>
              </div>
            </div>
          )}

          {/* Визуализация на цефеиди */}
          {selectedMethod === 'cepheid' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
              <h3 className="font-semibold mb-3 text-center">Цефеиди - "Стандартни свещи"</h3>
              
              <svg viewBox="0 0 700 400" className="w-full h-auto">
                {/* Фон */}
                <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />

                {/* График период-светимост */}
                <g transform="translate(50, 50)">
                  {/* Оси */}
                  <line x1="0" y1="300" x2="600" y2="300" stroke="white" strokeWidth="2" />
                  <line x1="0" y1="300" x2="0" y2="0" stroke="white" strokeWidth="2" />
                  
                  <text x="300" y="330" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">
                    Период (дни)
                  </text>
                  <text x="-150" y="15" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold" transform="rotate(-90 -150 15)">
                    Светимост (L☉)
                  </text>

                  {/* Скала на осите */}
                  <text x="100" y="320" fontSize="10" fill="white">1</text>
                  <text x="300" y="320" fontSize="10" fill="white">10</text>
                  <text x="500" y="320" fontSize="10" fill="white">100</text>
                  
                  <text x="-15" y="280" fontSize="10" fill="white">10³</text>
                  <text x="-15" y="180" fontSize="10" fill="white">10⁴</text>
                  <text x="-15" y="80" fontSize="10" fill="white">10⁵</text>

                  {/* Линия период-светимост */}
                  <path
                    d="M 50,250 Q 200,180 350,120 Q 450,80 550,50"
                    fill="none"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="3"
                  />

                  {/* Примерни цефеиди */}
                  {[
                    { period: 3, lum: 1000, x: 150, y: 220 },
                    { period: 10, lum: 5000, x: 300, y: 150 },
                    { period: 30, lum: 15000, x: 450, y: 90 },
                    { period: 100, lum: 40000, x: 550, y: 50 },
                  ].map((star, i) => (
                    <g key={i}>
                      <circle cx={star.x} cy={star.y} r="6" fill="rgb(255, 255, 100)">
                        <animate attributeName="r" values="6;9;6" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                      </circle>
                      <text x={star.x} y={star.y - 15} fontSize="9" textAnchor="middle" fill="white">
                        P={star.period}d
                      </text>
                    </g>
                  ))}

                  {/* Обяснение */}
                  <rect x="380" y="180" width="200" height="100" fill="rgba(0, 0, 0, 0.7)" rx="5" />
                  <text x="480" y="205" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                    Връзка период-светимост
                  </text>
                  <text x="390" y="230" fontSize="10" fill="white">
                    • По-дълъг период →
                  </text>
                  <text x="390" y="245" fontSize="10" fill="white">
                    по-ярка звезда
                  </text>
                  <text x="390" y="265" fontSize="10" fill="rgb(100, 200, 255)">
                    Открито от Хенриета
                  </text>
                  <text x="390" y="278" fontSize="10" fill="rgb(100, 200, 255)">
                    Левит (1912)
                  </text>
                </g>
              </svg>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Как работи методът:</h4>
                <ol className="text-sm list-decimal list-inside space-y-2">
                  <li>Наблюдаваме цефеидата и измерваме периода на пулсация</li>
                  <li>От периода определяме абсолютната светимост (колко ярка е наистина)</li>
                  <li>Измерваме видимата светимост (колко ярка изглежда от Земята)</li>
                  <li>Сравняваме двете светимости и изчисляваме разстоянието</li>
                </ol>
                <p className="text-sm mt-3 font-semibold">
                  Обхват: До 30 Mpc (100 милиона светлинни години)
                </p>
              </div>
            </div>
          )}

          {/* Визуализация на свръхнови */}
          {selectedMethod === 'supernova' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
              <h3 className="font-semibold mb-3 text-center">Свръхнови тип Ia - "Стандартни бомби"</h3>
              
              <svg viewBox="0 0 700 400" className="w-full h-auto">
                {/* Фон */}
                <rect x="0" y="0" width="700" height="400" fill="rgb(10, 10, 30)" />

                {/* Крива на светимостта */}
                <g transform="translate(50, 50)">
                  {/* Оси */}
                  <line x1="0" y1="300" x2="600" y2="300" stroke="white" strokeWidth="2" />
                  <line x1="0" y1="300" x2="0" y2="0" stroke="white" strokeWidth="2" />
                  
                  <text x="300" y="330" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">
                    Време (дни)
                  </text>
                  <text x="-150" y="15" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold" transform="rotate(-90 -150 15)">
                    Видима звездна величина
                  </text>

                  {/* Скала */}
                  <text x="100" y="320" fontSize="10" fill="white">10</text>
                  <text x="300" y="320" fontSize="10" fill="white">50</text>
                  <text x="500" y="320" fontSize="10" fill="white">100</text>

                  {/* Крива на светимостта на свръхнова */}
                  <path
                    d="M 50,280 L 100,250 Q 150,80 200,50 Q 250,60 300,100 Q 400,180 500,240 L 550,260"
                    fill="none"
                    stroke="rgb(255, 100, 100)"
                    strokeWidth="3"
                  />

                  {/* Пик на светимостта */}
                  <circle cx="200" cy="50" r="8" fill="rgb(255, 200, 100)">
                    <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <text x="200" y="35" fontSize="11" textAnchor="middle" fill="rgb(255, 200, 100)" fontWeight="bold">
                    Максимум
                  </text>
                  <text x="200" y="20" fontSize="10" textAnchor="middle" fill="white">
                    M = -19.3
                  </text>

                  {/* Анотации */}
                  <text x="80" y="260" fontSize="10" fill="rgb(100, 200, 255)">Експлозия</text>
                  <text x="400" y="200" fontSize="10" fill="rgb(100, 200, 255)">Избледняване</text>

                  {/* Обяснение */}
                  <rect x="350" y="120" width="230" height="90" fill="rgba(0, 0, 0, 0.7)" rx="5" />
                  <text x="465" y="145" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                    Свръхнова тип Ia
                  </text>
                  <text x="360" y="165" fontSize="10" fill="white">
                    • Еднаква светимост
                  </text>
                  <text x="360" y="180" fontSize="10" fill="white">
                    • M = -19.3 (пик)
                  </text>
                  <text x="360" y="195" fontSize="10" fill="white">
                    • Видима до 1000 Mpc
                  </text>
                </g>
              </svg>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Защо са "стандартни":</h4>
                <p className="text-sm mb-2">
                  Свръхновите тип Ia се случват, когато бяло джудже достигне точно 1.4 M☉
                  (граница на Чандрасекар) и експлодира. Тъй като масата е винаги еднаква,
                  експлозията освобождава еднакво количество енергия.
                </p>
                <p className="text-sm mt-2 font-semibold">
                  Обхват: До 1000 Mpc (3 милиарда светлинни години)
                </p>
              </div>
            </div>
          )}

          {/* Визуализация на цефеиди - крива на светимостта */}
          {selectedMethod === 'cepheid' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
              <h3 className="font-semibold mb-3 text-center">Пулсация на цефеида</h3>
              
              <svg viewBox="0 0 700 350" className="w-full h-auto">
                <rect x="0" y="0" width="700" height="350" fill="rgb(10, 10, 30)" />

                {/* График на пулсацията */}
                <g transform="translate(50, 50)">
                  {/* Оси */}
                  <line x1="0" y1="200" x2="600" y2="200" stroke="white" strokeWidth="2" />
                  <line x1="0" y1="200" x2="0" y2="0" stroke="white" strokeWidth="2" />
                  
                  <text x="300" y="230" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">
                    Време (дни)
                  </text>
                  <text x="-100" y="15" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold" transform="rotate(-90 -100 15)">
                    Яркост
                  </text>

                  {/* Синусоидална крива на пулсацията */}
                  <path
                    d="M 0,100 Q 75,50 150,100 Q 225,150 300,100 Q 375,50 450,100 Q 525,150 600,100"
                    fill="none"
                    stroke="rgb(255, 200, 100)"
                    strokeWidth="3"
                  />

                  {/* Анимирана звезда */}
                  {[0, 150, 300, 450].map((x, i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy="100"
                      r="8"
                      fill="rgb(255, 255, 100)"
                    >
                      <animate
                        attributeName="r"
                        values="8;12;8"
                        dur="3s"
                        begin={`${i * 0.75}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;1;0.6"
                        dur="3s"
                        begin={`${i * 0.75}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {/* Период */}
                  <line x1="0" y1="220" x2="150" y2="220" stroke="rgb(100, 200, 255)" strokeWidth="2" />
                  <line x1="0" y1="215" x2="0" y2="225" stroke="rgb(100, 200, 255)" strokeWidth="2" />
                  <line x1="150" y1="215" x2="150" y2="225" stroke="rgb(100, 200, 255)" strokeWidth="2" />
                  <text x="75" y="245" fontSize="12" textAnchor="middle" fill="rgb(100, 200, 255)" fontWeight="bold">
                    Период (P)
                  </text>

                  {/* Обяснение */}
                  <rect x="350" y="20" width="230" height="100" fill="rgba(0, 0, 0, 0.7)" rx="5" />
                  <text x="465" y="45" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                    Цефеидна променлива
                  </text>
                  <text x="360" y="65" fontSize="10" fill="white">
                    Звездата пулсира редовно
                  </text>
                  <text x="360" y="80" fontSize="10" fill="white">
                    Период: 1-100 дни
                  </text>
                  <text x="360" y="95" fontSize="10" fill="rgb(255, 200, 100)">
                    По-дълъг период =
                  </text>
                  <text x="360" y="110" fontSize="10" fill="rgb(255, 200, 100)">
                    по-ярка звезда
                  </text>
                </g>
              </svg>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Връзка период-светимост:</h4>
                <p className="text-sm mb-2">
                  Хенриета Левит открива (1912), че колкото по-дълъг е периодът на цефеидата,
                  толкова по-ярка е звездата. Това прави цефеидите "стандартни свещи".
                </p>
                <p className="text-sm mt-2">
                  <strong>Как се използва:</strong> Измерваме периода → знаем абсолютната светимост
                  → сравняваме с видимата светимост → изчисляваме разстоянието
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Космическа стълба на разстоянията
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {/* Стълба */}
              <g>
                {/* Стъпало 1: Паралакс */}
                <rect x="100" y="320" width="150" height="60" fill="rgb(100, 150, 255)" stroke="white" strokeWidth="2" />
                <text x="175" y="345" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                  Паралакс
                </text>
                <text x="175" y="365" fontSize="10" textAnchor="middle" fill="white">
                  До 100 pc
                </text>

                {/* Стъпало 2: Цефеиди */}
                <rect x="150" y="240" width="150" height="60" fill="rgb(168, 85, 247)" stroke="white" strokeWidth="2" />
                <text x="225" y="265" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                  Цефеиди
                </text>
                <text x="225" y="285" fontSize="10" textAnchor="middle" fill="white">
                  До 30 Mpc
                </text>

                {/* Стъпало 3: Свръхнови Ia */}
                <rect x="200" y="160" width="150" height="60" fill="rgb(239, 68, 68)" stroke="white" strokeWidth="2" />
                <text x="275" y="185" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                  Свръхнови Ia
                </text>
                <text x="275" y="205" fontSize="10" textAnchor="middle" fill="white">
                  До 1000 Mpc
                </text>

                {/* Стъпало 4: Червено изместване */}
                <rect x="250" y="80" width="150" height="60" fill="rgb(255, 150, 100)" stroke="white" strokeWidth="2" />
                <text x="325" y="105" fontSize="13" textAnchor="middle" fill="white" fontWeight="bold">
                  Червено изместване
                </text>
                <text x="325" y="125" fontSize="10" textAnchor="middle" fill="white">
                  До края на Вселената
                </text>

                {/* Стрелки между стъпалата */}
                <path d="M 225,320 L 225,300" stroke="rgb(100, 200, 255)" strokeWidth="2" markerEnd="url(#arrowUp1)" />
                <path d="M 275,240 L 275,220" stroke="rgb(100, 200, 255)" strokeWidth="2" markerEnd="url(#arrowUp2)" />
                <path d="M 325,160 L 325,140" stroke="rgb(100, 200, 255)" strokeWidth="2" markerEnd="url(#arrowUp3)" />

                {/* Текст - калибриране */}
                <text x="240" y="315" fontSize="9" fill="rgb(100, 200, 255)">калибрира</text>
                <text x="290" y="235" fontSize="9" fill="rgb(100, 200, 255)">калибрира</text>
                <text x="340" y="155" fontSize="9" fill="rgb(100, 200, 255)">калибрира</text>

                {/* Обяснение */}
                <rect x="420" y="200" width="160" height="80" fill="rgba(0, 0, 0, 0.7)" rx="5" />
                <text x="500" y="225" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                  Космическа стълба
                </text>
                <text x="430" y="245" fontSize="9" fill="white">
                  Всеки метод се калибрира
                </text>
                <text x="430" y="260" fontSize="9" fill="white">
                  с предходния, създавайки
                </text>
                <text x="430" y="275" fontSize="9" fill="white">
                  "стълба" за все по-големи
                </text>
              </g>

              <defs>
                <marker id="arrowUp1" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <polygon points="0 10, 5 0, 10 10" fill="rgb(100, 200, 255)" />
                </marker>
                <marker id="arrowUp2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <polygon points="0 10, 5 0, 10 10" fill="rgb(100, 200, 255)" />
                </marker>
                <marker id="arrowUp3" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <polygon points="0 10, 5 0, 10 10" fill="rgb(100, 200, 255)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">
                Всеки метод работи в определен диапазон от разстояния. За да измерим
                много далечни обекти, трябва да "изкачим стълбата" - всеки метод се
                калибрира с предходния.
              </p>
            </div>
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
              <p className="font-semibold mb-2">1. Колко парсека е 1 светлинна година?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 1 ly = 0.307 pc (или 1 pc = 3.26 ly)</p>
                  <p className="mt-2">Обяснение: Парсекът е по-голяма единица от светлинната година.
                  1 парсек = 3.26 светлинни години.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Звезда има паралакс 0.5". На какво разстояние е?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Формула: d = 1 / p</p>
                  <p>d = 1 / 0.5" = 2 парсека</p>
                  <p className="mt-2">В светлинни години: 2 × 3.26 = 6.52 св.г.</p>
                  <p className="mt-2"><strong>Отговор: 2 парсека или 6.5 светлинни години</strong></p>
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
              <p className="font-semibold mb-2">3. Цефеида има период 10 дни и видима звездна величина
              m = 15. Ако абсолютната ѝ величина е M = -4, на какво разстояние е?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме формулата за модул на разстоянието:</p>
                  <p className="font-mono mt-2">m - M = 5 × log₁₀(d) - 5</p>
                  <p className="mt-2">15 - (-4) = 5 × log₁₀(d) - 5</p>
                  <p>19 = 5 × log₁₀(d) - 5</p>
                  <p>24 = 5 × log₁₀(d)</p>
                  <p>log₁₀(d) = 4.8</p>
                  <p>d = 10⁴·⁸ ≈ 63 096 парсека ≈ 63 kpc</p>
                  <p className="mt-2"><strong>Отговор: около 63 килопарсека (206 000 св.г.)</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Защо паралаксът не може да се използва за
              измерване на разстояния до други галактики?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Паралаксът работи само за близки обекти, защото ъгълът
                  става изключително малък за далечни обекти.</p>
                  <p className="mt-2">Най-близката галактика (Андромеда) е на около 780 kpc.
                  Паралаксът би бил:</p>
                  <p className="font-mono mt-2">p = 1 / 780000 ≈ 0.0000013" (1.3 микроъглови секунди)</p>
                  <p className="mt-2">Това е извън възможностите дори на най-добрите телескопи
                  (Gaia измерва до ~0.00002"). Затова за галактики използваме цефеиди,
                  свръхнови и червено изместване.</p>
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
              <p className="font-semibold mb-2">5. Обясни защо грешка в измерването на разстоянието
              до близките цефеиди води до систематична грешка в измерването на разстоянията
              до далечните галактики.</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Космическата стълба на разстоянията е верига от методи,
                  където всеки следващ метод се калибрира с предходния:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-2">
                    <li><strong>Паралакс</strong> → измерва разстояния до близки цефеиди</li>
                    <li><strong>Близки цефеиди</strong> → калибрират връзката период-светимост</li>
                    <li><strong>Далечни цефеиди</strong> → измерват разстояния до галактики</li>
                    <li><strong>Свръхнови в тези галактики</strong> → калибрират светимостта на свръхновите</li>
                    <li><strong>Далечни свръхнови</strong> → измерват космологични разстояния</li>
                  </ol>
                  <p className="mt-3">Ако направим грешка в стъпка 1 (паралакс до близки цефеиди),
                  тази грешка се <strong>умножава</strong> през всички следващи стъпки. Например:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>10% грешка в паралакса → 10% грешка в калибрацията на цефеидите</li>
                    <li>→ 10% грешка в разстоянията до галактики</li>
                    <li>→ 10% грешка в калибрацията на свръхновите</li>
                    <li>→ 10% грешка в космологичните разстояния</li>
                  </ul>
                  <p className="mt-3">Това е <strong>систематична грешка</strong> - засяга всички
                  измервания в една посока. Затова прецизното измерване на паралаксите (като с
                  Gaia) е критично за цялата космология!</p>
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
              <li>✓ Паралакс: d (pc) = 1 / p (") - до 100 pc</li>
              <li>✓ Цефеиди: период-светимост - до 30 Mpc</li>
              <li>✓ Свръхнови Ia: стандартни свещи - до 1000 Mpc</li>
              <li>✓ Червено изместване: закон на Хъбъл - до края на Вселената</li>
              <li>✓ Всеки метод калибрира следващия</li>
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
              Спътникът Gaia на ЕКА измерва позициите на над 1 милиард звезди с
              невероятна точност (до 20 микроъглови секунди)! Това е като да видите
              монета на Луната от Земята. Gaia революционизира нашите познания за
              Млечния път и прави космическата стълба много по-точна!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
