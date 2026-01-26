import {useState} from 'react';

export default function Lecture05() {
  const [eclipseType, setEclipseType] = useState<'total' | 'partial' | 'annular'>('total');
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 5: Слънчеви затъмнения
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Какво е слънчево затъмнение?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Слънчевото затъмнение настъпва, когато Луната се намира между Земята
            и Слънцето, и сянката на Луната пада върху Земята. Това може да се
            случи само при <strong>новолуние</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Интерактивна визуализация
          </h2>

          {/* Бутони за избор на тип затъмнение */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setEclipseType('total')}
              className={`px-4 py-2 rounded ${eclipseType === 'total' ? 'bg-gray-800 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Пълно
            </button>
            <button
              onClick={() => setEclipseType('annular')}
              className={`px-4 py-2 rounded ${eclipseType === 'annular' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Пръстеновидно
            </button>
            <button
              onClick={() => setEclipseType('partial')}
              className={`px-4 py-2 rounded ${eclipseType === 'partial' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Частично
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">
              {eclipseType === 'total' && 'Пълно слънчево затъмнение'}
              {eclipseType === 'annular' && 'Пръстеновидно затъмнение'}
              {eclipseType === 'partial' && 'Частично затъмнение'}
            </h3>

            <svg viewBox="0 0 800 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
              {/* Слънце */}
              <circle cx="80" cy="200" r="50" fill="rgb(251, 191, 36)" />
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={80 + 55 * Math.cos(angle)}
                    y1={200 + 55 * Math.sin(angle)}
                    x2={80 + 70 * Math.cos(angle)}
                    y2={200 + 70 * Math.sin(angle)}
                    stroke="rgb(251, 191, 36)"
                    strokeWidth="3"
                  />
                );
              })}
              <text x="80" y="270" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">Слънце</text>

              {/* Луна */}
              <circle
                cx={eclipseType === 'annular' ? 350 : 320}
                cy="200"
                r={eclipseType === 'annular' ? 25 : 30}
                fill="rgb(100, 100, 100)"
              />
              <circle
                cx={eclipseType === 'annular' ? 350 : 320}
                cy="200"
                r={eclipseType === 'annular' ? 25 : 30}
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={eclipseType === 'annular' ? 350 : 320}
                y="240"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill="currentColor"
              >
                Луна
              </text>

              {/* Сянка на Луната (конус към Земята) */}
              {eclipseType === 'total' && (
                <>
                  <path
                    d="M 320,170 L 600,195 L 600,205 L 320,230 Z"
                    fill="rgba(0, 0, 0, 0.4)"
                    stroke="rgb(100, 100, 100)"
                    strokeWidth="1"
                  />
                  <text x="460" y="190" fontSize="11" fill="rgb(100, 100, 100)" fontWeight="bold">Сянка (умбра)</text>
                </>
              )}

              {/* Пръстеновидно - сянката не достига до Земята */}
              {eclipseType === 'annular' && (
                <>
                  <path
                    d="M 350,175 L 520,190 M 350,225 L 520,210"
                    stroke="rgb(100, 100, 100)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <circle cx="520" cy="200" r="3" fill="rgb(239, 68, 68)" />
                  <text x="460" y="180" fontSize="10" fill="rgb(100, 100, 100)">Сянката не достига</text>
                </>
              )}

              {/* Полусянка */}
              <path
                d={eclipseType === 'annular'
                  ? "M 350,150 L 650,100 M 350,250 L 650,300"
                  : "M 320,140 L 650,100 M 320,260 L 650,300"}
                stroke="rgb(150, 150, 150)"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
              <text x="550" y="120" fontSize="10" fill="rgb(150, 150, 150)">Полусянка</text>

              {/* Земя */}
              <circle cx="600" cy="200" r="50" fill="rgb(59, 130, 246)" />

              {/* Осветена половина */}
              <path
                d="M 600,150 A 50,50 0 0,0 600,250"
                fill="rgba(251, 191, 36, 0.3)"
              />

              {/* Зона на затъмнението на Земята */}
              {eclipseType === 'total' && (
                <circle cx="600" cy="200" r="8" fill="rgb(0, 0, 0)" />
              )}
              {eclipseType === 'annular' && (
                <>
                  <circle cx="600" cy="200" r="8" fill="rgb(251, 191, 36)" />
                  <circle cx="600" cy="200" r="5" fill="rgb(0, 0, 0)" />
                </>
              )}
              {eclipseType === 'partial' && (
                <path
                  d="M 600,192 A 8,8 0 0,1 600,208 L 600,200 Z"
                  fill="rgb(0, 0, 0)"
                />
              )}

              <circle cx="600" cy="200" r="50" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2" />
              <text x="600" y="270" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">Земя</text>

              {/* Път на пълнотата */}
              {eclipseType === 'total' && (
                <text x="600" y="185" fontSize="9" textAnchor="middle" fill="white" fontWeight="bold">
                  Път на пълнотата
                </text>
              )}
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">
                {eclipseType === 'total' && 'Пълно слънчево затъмнение'}
                {eclipseType === 'annular' && 'Пръстеновидно затъмнение'}
                {eclipseType === 'partial' && 'Частично затъмнение'}
              </h4>
              {eclipseType === 'total' && (
                <p className="text-sm">
                  Луната изцяло закрива Слънцето. Видимо само от тясна ивица на Земята
                  (път на пълнотата, ширина до 270 km). Продължителност: до 7.5 минути.
                  Може да се види короната на Слънцето.
                </p>
              )}
              {eclipseType === 'annular' && (
                <p className="text-sm">
                  Луната е по-далеч от Земята (в апогей) и изглежда по-малка от Слънцето,
                  оставяйки видим ярък "пръстен" около себе си. Короната не е видима.
                </p>
              )}
              {eclipseType === 'partial' && (
                <p className="text-sm">
                  Луната закрива само част от Слънцето. Видимо от по-широка област около
                  пътя на пълнотата. Не може да се види короната.
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Видове слънчеви затъмнения:</h3>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Пълно слънчево затъмнение</strong> – Луната изцяло закрива Слънцето.
                Видимо само от тясна ивица (път на пълнотата). Продължителност: до 7.5 минути.
              </li>
              <li>
                <strong>Пръстеновидно затъмнение</strong> – Луната е по-далеч и изглежда
                по-малка, оставяйки видим "пръстен" около себе си.
              </li>
              <li>
                <strong>Частично слънчево затъмнение</strong> – Луната закрива само част
                от Слънцето. Видимо от по-широка област.
              </li>
              <li>
                <strong>Хибридно затъмнение</strong> – рядко явление, когато затъмнението
                е пълно на някои места и пръстеновидно на други.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Корона на Слънцето
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            По време на пълно слънчево затъмнение можем да видим короната на
            Слънцето – външната му атмосфера, която обикновено е невидима поради
            яркостта на фотосферата.
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Характеристики на короната:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Температура: над 1 милион градуса (парадокс - по-гореща от повърхността!)</li>
              <li>Простира се на милиони километри в космоса</li>
              <li>Източник на слънчевия вятър</li>
              <li>Видима само при пълно затъмнение или със специални коронографи</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Невероятно космическо съвпадение
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Пълните слънчеви затъмнения са възможни само защото Луната и Слънцето
            изглеждат почти еднакви по размер от Земята!
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Ъглови размери:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Слънце:</strong> диаметър 1.39 млн. km, разстояние 150 млн. km → ъглов размер ≈ 0.53°</li>
              <li><strong>Луна:</strong> диаметър 3474 km, разстояние 384 400 km → ъглов размер ≈ 0.52°</li>
            </ul>
            <p className="mt-3 font-semibold">
              Луната бавно се отдалечава от Земята (около 3.8 cm годишно), така че след
              милиони години пълните затъмнения няма да са възможни!
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Защо затъмненията не се случват всеки месец?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Орбитата на Луната е наклонена под ъгъл от около 5° спрямо еклиптиката.
            Затова Луната обикновено минава над или под Слънцето при новолуние.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Наклон на лунната орбита</h3>

            <svg viewBox="0 0 600 300" className="w-full h-auto">
              {/* Еклиптика (хоризонтална) */}
              <line x1="50" y1="150" x2="550" y2="150" stroke="rgb(251, 191, 36)" strokeWidth="3" />
              <text x="560" y="155" fontSize="12" fill="rgb(251, 191, 36)" fontWeight="bold">Еклиптика</text>

              {/* Орбита на Луната (наклонена) */}
              <ellipse
                cx="300"
                cy="150"
                rx="200"
                ry="60"
                fill="none"
                stroke="rgb(156, 163, 175)"
                strokeWidth="2"
                transform="rotate(-10 300 150)"
              />
              <text x="480" y="100" fontSize="12" fill="rgb(156, 163, 175)" fontWeight="bold">Орбита на Луната</text>

              {/* Възли */}
              <circle cx="150" cy="150" r="6" fill="rgb(239, 68, 68)" />
              <text x="155" y="145" fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold">Възел</text>
              <circle cx="450" cy="150" r="6" fill="rgb(239, 68, 68)" />
              <text x="455" y="145" fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold">Възел</text>

              {/* Ъгъл 5° */}
              <path
                d="M 300,150 L 350,150 L 350,120"
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="1"
              />
              <text x="360" y="135" fontSize="11" fill="rgb(239, 68, 68)" fontWeight="bold">5°</text>

              {/* Луна над еклиптиката */}
              <circle cx="250" cy="110" r="10" fill="rgb(200, 200, 200)" opacity="0.5" />
              <text x="265" y="110" fontSize="10" fill="currentColor">Луна над</text>

              {/* Луна под еклиптиката */}
              <circle cx="350" cy="190" r="10" fill="rgb(200, 200, 200)" opacity="0.5" />
              <text x="365" y="195" fontSize="10" fill="currentColor">Луна под</text>

              {/* Затъмнение при възел */}
              <circle cx="450" cy="150" r="10" fill="rgb(100, 100, 100)" />
              <text x="430" y="175" fontSize="10" fill="rgb(239, 68, 68)" fontWeight="bold">Затъмнение!</text>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">
                Затъмнения се случват само когато новолунието (или пълнолунието) съвпадне
                с <strong>възел</strong> – точка, където орбитата на Луната пресича еклиптиката.
                Това се случва 2-5 пъти годишно за слънчеви затъмнения.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>ВАЖНО ПРЕДУПРЕЖДЕНИЕ!</span>
            </h3>
            <p className="mb-2 font-semibold">
              Никога не гледайте директно към Слънцето по време на затъмнение без
              специални филтри!
            </p>
            <p>
              Това може да причини трайно увреждане на очите, включително слепота.
              Използвайте само сертифицирани очила за наблюдение на слънчеви
              затъмнения (ISO 12312-2). Обикновените слънчеви очила НЕ са безопасни!
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
              <p className="font-semibold mb-2">1. При коя фаза на Луната може да се случи слънчево затъмнение?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: При новолуние</p>
                  <p className="mt-2">Обяснение: Слънчевото затъмнение се случва, когато Луната
                  е между Земята и Слънцето. Това е възможно само при новолуние.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Каква е разликата между пълно и пръстеновидно затъмнение?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Пълно:</strong> Луната е достатъчно близо до Земята
                  и изглежда по-голяма или равна на Слънцето. Изцяло го закрива.</p>
                  <p className="mt-2"><strong>Пръстеновидно:</strong> Луната е по-далеч (в апогей)
                  и изглежда по-малка от Слънцето. Остава видим ярък пръстен около Луната.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">3. Защо пълното слънчево затъмнение е видимо само от тясна ивица на Земята?</p>
              <button
                onClick={() => toggleSolution('a3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Сянката на Луната е конусовидна и много малка в сравнение
                  с размера на Земята. Върхът на конуса достига до Земята и създава тясна ивица
                  (път на пълнотата) с ширина до 270 km. Само от тази ивица затъмнението е пълно.</p>
                  <p className="mt-2">Извън тази ивица (в полусянката) затъмнението е частично.</p>
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
              <p className="font-semibold mb-2">4. Колко максимално може да продължи пълно слънчево затъмнение?</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: До 7 минути и 31 секунди</p>
                  <p className="mt-2">Обяснение: Максималната продължителност зависи от:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Луната да е в перигей (най-близо до Земята) → изглежда по-голяма</li>
                    <li>Земята да е в афелий (най-далеч от Слънцето) → Слънцето изглежда по-малко</li>
                    <li>Затъмнението да се случва на екватора (по-бавно движение на сянката)</li>
                  </ul>
                  <p className="mt-2">На практика повечето пълни затъмнения продължават 2-4 минути.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">5. Изчисли ъгловия размер на Луната, ако диаметърът
              ѝ е 3474 km, а разстоянието до Земята е 384 400 km.</p>
              <button
                onClick={() => toggleSolution('b5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Формула за малки ъгли: α ≈ d / D (в радиани)</p>
                  <p className="mt-2">α = 3474 km / 384400 km = 0.00904 радиана</p>
                  <p className="mt-2">Преобразуване в градуси: α = 0.00904 × (180° / π) ≈ 0.518°</p>
                  <p className="mt-2">Преобразуване в ъглови минути: 0.518° × 60 ≈ 31'</p>
                  <p className="mt-2"><strong>Отговор: около 0.52° или 31 ъглови минути</strong></p>
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
              <p className="font-semibold mb-2">6. Обясни защо на Марс не може да има пълни
              слънчеви затъмнения, подобни на земните. (Фобос: диаметър 22 km, разстояние 9400 km;
              Деймос: диаметър 12 km, разстояние 23 500 km)</p>
              <button
                onClick={() => toggleSolution('c6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c6'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Изчисляваме ъгловите размери на спътниците:</p>
                  <p className="mt-2"><strong>Фобос:</strong> α = 22 / 9400 ≈ 0.00234 рад ≈ 0.134° ≈ 8'</p>
                  <p><strong>Деймос:</strong> α = 12 / 23500 ≈ 0.00051 рад ≈ 0.029° ≈ 1.7'</p>
                  <p className="mt-2"><strong>Слънце от Марс:</strong> α ≈ 0.35° (по-малко от Земята)</p>
                  <p className="mt-2"><strong>Заключение:</strong> И двата спътника изглеждат много
                  по-малки от Слънцето от Марс. Фобос може да причини частично затъмнение, но не
                  и пълно. Деймос изглежда като малка точка пред Слънцето.</p>
                  <p className="mt-2">Пълните слънчеви затъмнения са уникално земно явление!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Обобщение
          </h2>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Слънчеви затъмнения се случват при новолуние</li>
              <li>✓ Пълно затъмнение е видимо само от тясна ивица (път на пълнотата)</li>
              <li>✓ Максимална продължителност: 7.5 минути</li>
              <li>✓ Луната и Слънцето имат почти еднакъв ъглов размер (~0.5°)</li>
              <li>✓ Орбитата на Луната е наклонена на 5° спрямо еклиптиката</li>
              <li>✓ Затъмнения се случват само при възлите</li>
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
              Пълните слънчеви затъмнения са възможни само защото Луната и
              Слънцето изглеждат почти еднакви по размер от Земята – невероятно
              космическо съвпадение! Луната бавно се отдалечава от Земята (3.8 cm/година),
              така че след около 600 милиона години пълните затъмнения няма да са възможни.
              Ние живеем в специален момент от историята на Земята!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
