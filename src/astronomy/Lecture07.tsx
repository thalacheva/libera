import {useState} from 'react';

export default function Lecture07() {
  const [time, setTime] = useState(0); // 0-100 за анимация
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Параметри на елипсата
  const a = 180; // голяма полуос
  const b = 140; // малка полуос
  const c = Math.sqrt(a * a - b * b); // фокусно разстояние
  const centerX = 300;
  const centerY = 200;
  const e = c / a; // ексцентрицитет
  const sunX = centerX - c; // Слънцето е в левия фокус, перихелият е вляво

  // Точка от орбитата за дадена средна аномалия M (решава уравнението на Кеплер E - e·sinE = M),
  // така че равни интервали от M съответстват на равни интервали от време
  const orbitPoint = (M: number) => {
    let E = M;
    for (let i = 0; i < 20; i++) {
      E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }
    return { x: centerX - a * Math.cos(E), y: centerY - b * Math.sin(E) };
  };

  // Позиция на планетата по елипсата (time = 0 → перихелий, 50 → афелий)
  const { x: planetX, y: planetY } = orbitPoint((time / 100) * 2 * Math.PI);

  // Сектори за втория закон: еднакъв интервал от време около перихелия и афелия
  const dM = 0.5;
  const p1 = orbitPoint(-dM / 2);
  const p2 = orbitPoint(dM / 2);
  const q1 = orbitPoint(Math.PI - dM / 2);
  const q2 = orbitPoint(Math.PI + dM / 2);

  // Трети закон: орбити в мащаб (100 px = 1 AU)
  const solarX = 180;
  const solarY = 175;
  const auPx = 100;
  const planets = [
    { name: 'Меркурий', a: 0.39, T: 0.24, color: 'gray', r: 4, deg: 120 },
    { name: 'Венера', a: 0.72, T: 0.62, color: 'orange', r: 6, deg: 215 },
    { name: 'Земя', a: 1, T: 1, color: 'rgb(59, 130, 246)', r: 7, deg: 0 },
    { name: 'Марс', a: 1.52, T: 1.88, color: 'rgb(239, 68, 68)', r: 5, deg: 300 },
  ].map(p => {
    const rad = (p.deg * Math.PI) / 180;
    const R = p.a * auPx;
    return {
      ...p,
      R,
      x: solarX + R * Math.cos(rad),
      y: solarY - R * Math.sin(rad),
      labelX: solarX + (R + 16) * Math.cos(rad),
      labelY: solarY - (R + 16) * Math.sin(rad) + 4,
    };
  });
  // Юпитер (5.2 AU) не се побира – показваме дъга не в мащаб
  const jupiterR = 230;
  const jupiterSpan = Math.asin(160 / jupiterR);
  const jupiterTop = { x: solarX + jupiterR * Math.cos(jupiterSpan), y: solarY - 160 };
  const jupiterBottom = { x: jupiterTop.x, y: solarY + 160 };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 7: Закони на Кеплер
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Йоханес Кеплер (1571-1630)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Немският астроном Йоханес Кеплер формулира три закона, които описват
            движението на планетите около Слънцето. Тези закони са базирани на
            прецизните наблюдения на Тихо Брахе и са революционизирали астрономията.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Първи закон на Кеплер (Закон за елипсите)
          </h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              Всяка планета се движи по елипса, в единия фокус на която се намира Слънцето.
            </p>
          </div>

          {/* Интерактивна визуализация на елиптична орбита */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Първи закон: Елиптична орбита</h3>

            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {/* Елипса (орбита) */}
              <ellipse
                cx={centerX}
                cy={centerY}
                rx={a}
                ry={b}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
              />

              {/* Център на елипсата */}
              <circle cx={centerX} cy={centerY} r="3" fill="gray" opacity="0.5" />
              <text x={centerX + 5} y={centerY - 5} fontSize="10" fill="gray">Център</text>

              {/* Слънце (в единия фокус) */}
              <circle cx={sunX} cy={centerY} r="20" fill="rgb(251, 191, 36)" />
              <text x={sunX} y={centerY + 35} fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">
                ☀️ Слънце (фокус)
              </text>

              {/* Втори фокус (празен) */}
              <circle cx={centerX + c} cy={centerY} r="3" fill="gray" />
              <text x={centerX + c + 5} y={centerY - 5} fontSize="10" fill="gray">Фокус 2</text>

              {/* Полуоси и фокусно разстояние */}
              <line x1={centerX} y1={centerY} x2={centerX + a} y2={centerY} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <text x={centerX + a / 2} y={centerY + 15} fontSize="11" fill="rgb(168, 85, 247)" fontWeight="bold" textAnchor="middle">
                a
              </text>
              <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - b} stroke="rgb(20, 184, 166)" strokeWidth="2" />
              <text x={centerX - 6} y={centerY - b / 2} fontSize="11" fill="rgb(20, 184, 166)" fontWeight="bold" textAnchor="end">
                b
              </text>
              <line x1={sunX} y1={centerY} x2={centerX} y2={centerY} stroke="gray" strokeWidth="2" strokeDasharray="3,3" />
              <text x={(sunX + centerX) / 2} y={centerY - 6} fontSize="11" fill="gray" fontWeight="bold" textAnchor="middle">
                c
              </text>

              {/* Радиус-вектор */}
              <line
                x1={sunX}
                y1={centerY}
                x2={planetX}
                y2={planetY}
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Планета */}
              <circle cx={planetX} cy={planetY} r="12" fill="rgb(59, 130, 246)">
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={planetX} y={planetY - 20} fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">
                Планета
              </text>

              {/* Перихелий и афелий */}
              <circle cx={centerX - a} cy={centerY} r="5" fill="rgb(239, 68, 68)" />
              <text x={centerX - a} y={centerY - 10} fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold" textAnchor="middle">
                Перихелий
              </text>
              <text x={centerX - a} y={centerY + 20} fontSize="10" fill="rgb(239, 68, 68)" textAnchor="middle">
                (най-близо)
              </text>

              <circle cx={centerX + a} cy={centerY} r="5" fill="rgb(34, 197, 94)" />
              <text x={centerX + a} y={centerY - 10} fontSize="11" fill="rgb(34, 197, 94)" fontWeight="bold" textAnchor="middle">
                Афелий
              </text>
              <text x={centerX + a} y={centerY + 20} fontSize="10" fill="rgb(34, 197, 94)" textAnchor="middle">
                (най-далеч)
              </text>
            </svg>

            {/* Контрола за анимация */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Движение на планетата по орбитата
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
                <span>Перихелий</span>
                <span>Афелий</span>
                <span>Перихелий</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Елементи на елипсата:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>a</strong> – голяма полуос (средно разстояние до Слънцето)</li>
                <li><strong>b</strong> – малка полуос</li>
                <li><strong>c</strong> – фокусно разстояние (разстояние от център до фокус)</li>
                <li><strong>e = c/a</strong> – ексцентрицитет (0 = кръг, близо до 1 = много издължена)</li>
                <li><strong>Перихелий</strong> – най-близката точка до Слънцето (r = a - c)</li>
                <li><strong>Афелий</strong> – най-далечната точка (r = a + c)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Втори закон на Кеплер (Закон за площите)
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              Радиус-векторът, свързващ Слънцето с планетата, описва равни площи
              за равни интервали от време.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Втори закон: Равни площи за равни времена</h3>

            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {/* Елипса */}
              <ellipse cx={centerX} cy={centerY} rx={a} ry={b} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" />

              {/* Сектор при перихелий (къса дъга, висока скорост) */}
              <path
                d={`M ${sunX},${centerY} L ${p1.x},${p1.y} A ${a},${b} 0 0,1 ${p2.x},${p2.y} Z`}
                fill="rgba(239, 68, 68, 0.3)"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
              />
              <text x={centerX - a - 10} y={centerY - 4} fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold" textAnchor="end">
                S₁ (1 ден)
              </text>
              <text x={centerX - a - 10} y={centerY + 10} fontSize="10" fill="rgb(239, 68, 68)" textAnchor="end">
                Висока скорост
              </text>

              {/* Сектор при афелий (дълъг и тесен сектор, същото време) */}
              <path
                d={`M ${sunX},${centerY} L ${q1.x},${q1.y} A ${a},${b} 0 0,1 ${q2.x},${q2.y} Z`}
                fill="rgba(34, 197, 94, 0.3)"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
              />
              <text x={centerX + a + 10} y={centerY - 4} fontSize="11" fill="rgb(34, 197, 94)" fontWeight="bold">
                S₂ (1 ден)
              </text>
              <text x={centerX + a + 10} y={centerY + 10} fontSize="10" fill="rgb(34, 197, 94)">
                Ниска скорост
              </text>

              {/* Слънце */}
              <circle cx={sunX} cy={centerY} r="15" fill="rgb(251, 191, 36)" />

              {/* Етикет за равни площи */}
              <text x={centerX} y={50} fontSize="13" fontWeight="bold" textAnchor="middle" fill="currentColor">
                S₁ = S₂ (за равни времена)
              </text>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Следствие:</strong> Планетата се движи по-бързо, когато е по-близо до
                Слънцето (в перихелий), и по-бавно, когато е по-далеч (в афелий).
              </p>
              <p className="text-sm mt-2">
                <strong>Пример:</strong> Земята се движи с около 30.3 km/s в перихелий (януари)
                и с около 29.3 km/s в афелий (юли).
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Физично обяснение:</h3>
            <p>
              Вторият закон на Кеплер е следствие от <strong>закона за запазване на ъгловия
              момент</strong>. Когато планетата е по-близо до Слънцето, тя трябва да се движи
              по-бързо, за да запази ъгловия момент.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Трети закон на Кеплер (Хармоничен закон)
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              Квадратът на периода на обращение на планетата е пропорционален на
              куба на голямата полуос на нейната орбита.
            </p>
            <p className="text-center text-xl my-3 font-mono">T² = k × a³</p>
            <p className="text-center my-2">или</p>
            <p className="text-center text-xl my-3 font-mono">T² / a³ = константа</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Трети закон: Сравнение на планети</h3>

            <svg viewBox="0 0 700 350" className="w-full h-auto">
              {/* Орбити (в мащаб) */}
              {planets.map(p => (
                <circle
                  key={`orbit-${p.name}`}
                  cx={solarX}
                  cy={solarY}
                  r={p.R}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={p.name === 'Земя' ? 2 : 1}
                />
              ))}

              {/* Юпитер (частично, не в мащаб) */}
              <path
                d={`M ${jupiterTop.x},${jupiterTop.y} A ${jupiterR},${jupiterR} 0 0,1 ${jupiterBottom.x},${jupiterBottom.y}`}
                fill="none"
                stroke="rgb(251, 146, 60)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x={solarX + jupiterR + 6} y={solarY - 4} fontSize="10" fill="currentColor">Юпитер</text>
              <text x={solarX + jupiterR + 6} y={solarY + 9} fontSize="8" fill="gray">(не в мащаб)</text>

              {/* Голяма полуос на Земята */}
              <line
                x1={solarX}
                y1={solarY}
                x2={solarX + auPx - 9}
                y2={solarY}
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                markerEnd="url(#arrowSize)"
              />
              <text x={solarX + 60} y={solarY - 6} fontSize="10" fill="rgb(168, 85, 247)" textAnchor="middle" fontWeight="bold">a</text>

              {/* Слънце */}
              <circle cx={solarX} cy={solarY} r="15" fill="rgb(251, 191, 36)" />

              {/* Планети */}
              {planets.map(p => (
                <g key={p.name}>
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} />
                  <text
                    x={p.labelX}
                    y={p.labelY}
                    fontSize="10"
                    textAnchor="middle"
                    fill="currentColor"
                    fontWeight={p.name === 'Земя' ? 'bold' : 'normal'}
                  >
                    {p.name}
                  </text>
                </g>
              ))}

              {/* Легенда */}
              {[...planets, { name: 'Юпитер', a: 5.2, T: 11.86, color: 'rgb(251, 146, 60)' }].map((p, i) => (
                <g key={`legend-${p.name}`}>
                  <circle cx={470} cy={60 + i * 22} r="5" fill={p.color} />
                  <text x={482} y={64 + i * 22} fontSize="11" fill="currentColor">
                    {p.name}: T = {p.T} г, a = {p.a.toFixed(2)} AU
                  </text>
                </g>
              ))}
              <text x={470} y={300} fontSize="10" fill="gray">Мащаб: 1 AU = {auPx} px</text>

              <defs>
                <marker id="arrowSize" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(168, 85, 247)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Проверка на третия закон:</h4>
              <div className="text-sm space-y-1">
                <p>Меркурий: T²/a³ = 0.24² / 0.39³ = 0.0576 / 0.0593 ≈ 0.97</p>
                <p>Венера: T²/a³ = 0.62² / 0.72³ = 0.384 / 0.373 ≈ 1.03</p>
                <p>Земя: T²/a³ = 1² / 1³ = 1 / 1 = 1.00</p>
                <p>Марс: T²/a³ = 1.88² / 1.52³ = 3.53 / 3.51 ≈ 1.01</p>
                <p className="mt-2 font-semibold">Съотношението е приблизително константа ≈ 1 (в единици AU и години)!</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Формули:</h3>
            <ul className="space-y-2">
              <li className="font-mono">T² = a³ (ако T е в години, a в AU)</li>
              <li className="font-mono">T² = (4π² / GM) × a³ (обща форма)</li>
              <li>G – гравитационна константа</li>
              <li>M – маса на централното тяло (Слънцето)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Значение на законите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Законите на Кеплер са революционни, защото за първи път описват
            точно движението на планетите. Те са основа за по-късното откритие
            на закона за всемирното привличане от Нютон.
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Приложения:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Предсказване на положенията на планетите</li>
              <li>Изчисляване на масите на планети и звезди</li>
              <li>Планиране на космически мисии</li>
              <li>Откриване на екзопланети</li>
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
              <p className="font-semibold mb-2">1. Къде се намира Слънцето спрямо орбитата на планетата?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: В единия фокус на елипсата</p>
                  <p className="mt-2">Обяснение: Според първия закон на Кеплер, Слънцето не е в
                  центъра на елипсата, а в единия от двата фокуса. Вторият фокус е празна точка
                  в пространството.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Къде се движи планетата по-бързо - в перихелий или в афелий?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: В перихелий (по-бързо)</p>
                  <p className="mt-2">Обяснение: Според втория закон на Кеплер, радиус-векторът
                  описва равни площи за равни времена. Когато планетата е по-близо до Слънцето
                  (перихелий), радиус-векторът е по-къс, затова планетата трябва да се движи
                  по-бързо, за да опише същата площ.</p>
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
              <p className="font-semibold mb-2">3. Планета обикаля около звезда с период 8 години.
              Каква е голямата полуос на орбитата ѝ в AU?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме третия закон на Кеплер: T² = a³</p>
                  <p className="mt-2">8² = a³</p>
                  <p>64 = a³</p>
                  <p>a = ∛64 = 4 AU</p>
                  <p className="mt-2"><strong>Отговор: 4 AU</strong></p>
                  <p className="mt-2 text-sm">Това е приблизително разстоянието на пояса на астероидите.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Комета има перихелий 0.6 AU и афелий 35 AU.
              Изчисли голямата полуос и периода на обращение.</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Голямата полуос е средното аритметично на перихелия и афелия:</p>
                  <p>a = (rₚ + rₐ) / 2 = (0.6 + 35) / 2 = 35.6 / 2 = 17.8 AU</p>
                  <p className="mt-2">Период (от третия закон): T² = a³</p>
                  <p>T² = 17.8³ = 5639.5</p>
                  <p>T = √5639.5 ≈ 75.1 години</p>
                  <p className="mt-2"><strong>Отговор: a = 17.8 AU, T ≈ 75 години</strong></p>
                  <p className="mt-2 text-sm">Това е подобно на кометата на Халей (T = 76 г)!</p>
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
              <p className="font-semibold mb-2">5. Изведи общата форма на третия закон на Кеплер,
              използвайки закона за всемирното привличане и центростремителното ускорение.</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">За кръгова орбита (опростено):</p>
                  <p className="mt-2">Гравитационната сила = Центростремителна сила</p>
                  <p className="font-mono">GMm/r² = mv²/r</p>
                  <p className="mt-2">Опростяваме: GM/r = v²</p>
                  <p className="mt-2">Орбиталната скорост: v = 2πr/T</p>
                  <p className="mt-2">Заместваме: GM/r = (2πr/T)²</p>
                  <p className="font-mono">GM/r = 4π²r²/T²</p>
                  <p className="mt-2">Пренареждаме:</p>
                  <p className="font-mono">T² = (4π²/GM) × r³</p>
                  <p className="mt-2">За елипса r → a (голяма полуос):</p>
                  <p className="font-mono text-lg mt-2"><strong>T² = (4π²/GM) × a³</strong></p>
                  <p className="mt-2">Това показва, че константата k = 4π²/GM зависи само от
                  масата на централното тяло!</p>
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
              <li>✓ <strong>Първи закон:</strong> Орбитите са елипси със Слънцето в единия фокус</li>
              <li>✓ <strong>Втори закон:</strong> Равни площи за равни времена → променлива скорост</li>
              <li>✓ <strong>Трети закон:</strong> T² = a³ (в години и AU)</li>
              <li>✓ По-близо до Слънцето = по-висока скорост</li>
              <li>✓ По-голяма орбита = по-дълъг период</li>
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
              Кеплер е изчислил орбитите на планетите без компютър, използвайки
              само ръчни изчисления! Работата му е отнела години на упорит труд
              и хиляди изчисления. Той е трябвало да провери стотици различни
              геометрични форми, преди да открие, че орбитите са елипси. Днес
              законите на Кеплер се използват за планиране на всички космически мисии!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
