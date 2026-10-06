import {useState} from 'react';

export default function Lecture09() {
  const [selectedWavelength, setSelectedWavelength] = useState(550); // nm
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Функция за определяне на цвета според дължината на вълната
  const getColor = (wavelength: number) => {
    if (wavelength < 380) return 'rgb(139, 0, 139)'; // UV (виолетов)
    if (wavelength < 450) return 'rgb(138, 43, 226)'; // Виолетов
    if (wavelength < 495) return 'rgb(0, 0, 255)'; // Син
    if (wavelength < 570) return 'rgb(0, 255, 0)'; // Зелен
    if (wavelength < 590) return 'rgb(255, 255, 0)'; // Жълт
    if (wavelength < 620) return 'rgb(255, 165, 0)'; // Оранжев
    if (wavelength < 750) return 'rgb(255, 0, 0)'; // Червен
    return 'rgb(139, 0, 0)'; // IR (тъмночервен)
  };

  const getWavelengthName = (wavelength: number) => {
    if (wavelength < 380) return 'Ултравиолетово';
    if (wavelength < 450) return 'Виолетово';
    if (wavelength < 495) return 'Синьо';
    if (wavelength < 570) return 'Зелено';
    if (wavelength < 590) return 'Жълто';
    if (wavelength < 620) return 'Оранжево';
    if (wavelength < 750) return 'Червено';
    return 'Инфрачервено';
  };

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 9: Светлина и спектри
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Електромагнитен спектър
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Светлината е електромагнитно излъчване. Видимата светлина е само
            малка част от електромагнитния спектър.
          </p>

          {/* Интерактивна визуализация на спектъра */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Интерактивен електромагнитен спектър</h3>

            <svg viewBox="0 0 800 300" className="w-full h-auto">
              {/* Пълен спектър */}
              <defs>
                <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgb(139, 0, 139)', stopOpacity: 0.5 }} />
                  <stop offset="14%" style={{ stopColor: 'rgb(138, 43, 226)', stopOpacity: 1 }} />
                  <stop offset="28%" style={{ stopColor: 'rgb(0, 0, 255)', stopOpacity: 1 }} />
                  <stop offset="42%" style={{ stopColor: 'rgb(0, 255, 0)', stopOpacity: 1 }} />
                  <stop offset="56%" style={{ stopColor: 'rgb(255, 255, 0)', stopOpacity: 1 }} />
                  <stop offset="70%" style={{ stopColor: 'rgb(255, 165, 0)', stopOpacity: 1 }} />
                  <stop offset="84%" style={{ stopColor: 'rgb(255, 0, 0)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(139, 0, 0)', stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>

              {/* Видим спектър */}
              <rect x="200" y="100" width="400" height="60" fill="url(#spectrumGradient)" stroke="black" strokeWidth="2" />

              {/* Граници на видимия спектър */}
              <line x1="200" y1="90" x2="200" y2="170" stroke="black" strokeWidth="2" />
              <text x="200" y="85" fontSize="11" textAnchor="middle" fill="currentColor">380 nm</text>
              <line x1="600" y1="90" x2="600" y2="170" stroke="black" strokeWidth="2" />
              <text x="600" y="85" fontSize="11" textAnchor="middle" fill="currentColor">750 nm</text>

              {/* Невидими части */}
              <rect x="50" y="100" width="150" height="60" fill="rgba(139, 0, 139, 0.2)" stroke="purple" strokeWidth="2" strokeDasharray="5,5" />
              <text x="125" y="135" fontSize="12" textAnchor="middle" fill="purple" fontWeight="bold">UV</text>

              <rect x="600" y="100" width="150" height="60" fill="rgba(139, 0, 0, 0.2)" stroke="darkred" strokeWidth="2" strokeDasharray="5,5" />
              <text x="675" y="135" fontSize="12" textAnchor="middle" fill="darkred" fontWeight="bold">IR</text>

              {/* Маркер за избраната дължина на вълната */}
              {selectedWavelength >= 380 && selectedWavelength <= 750 && (
                <>
                  <line
                    x1={200 + ((selectedWavelength - 380) / 370) * 400}
                    y1="95"
                    x2={200 + ((selectedWavelength - 380) / 370) * 400}
                    y2="165"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx={200 + ((selectedWavelength - 380) / 370) * 400}
                    cy="130"
                    r="8"
                    fill={getColor(selectedWavelength)}
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Етикети за цветовете */}
              <text x="230" y="185" fontSize="10" fill="rgb(138, 43, 226)">Виолетов</text>
              <text x="300" y="185" fontSize="10" fill="rgb(0, 0, 255)">Син</text>
              <text x="370" y="185" fontSize="10" fill="rgb(0, 200, 0)">Зелен</text>
              <text x="430" y="185" fontSize="10" fill="rgb(200, 200, 0)">Жълт</text>
              <text x="490" y="185" fontSize="10" fill="rgb(255, 165, 0)">Оранжев</text>
              <text x="550" y="185" fontSize="10" fill="rgb(255, 0, 0)">Червен</text>

              {/* Пълен електромагнитен спектър (опростен) */}
              <g transform="translate(0, 220)">
                <rect x="50" y="0" width="50" height="30" fill="rgba(200, 0, 200, 0.3)" />
                <text x="75" y="20" fontSize="9" textAnchor="middle" fill="currentColor">Гама</text>

                <rect x="100" y="0" width="50" height="30" fill="rgba(150, 0, 200, 0.3)" />
                <text x="125" y="20" fontSize="9" textAnchor="middle" fill="currentColor">Рентген</text>

                <rect x="150" y="0" width="50" height="30" fill="rgba(139, 0, 139, 0.3)" />
                <text x="175" y="20" fontSize="9" textAnchor="middle" fill="currentColor">UV</text>

                <rect x="200" y="0" width="400" height="30" fill="url(#spectrumGradient)" />
                <text x="400" y="20" fontSize="10" textAnchor="middle" fill="black" fontWeight="bold">ВИДИМА СВЕТЛИНА</text>

                <rect x="600" y="0" width="50" height="30" fill="rgba(139, 0, 0, 0.3)" />
                <text x="625" y="20" fontSize="9" textAnchor="middle" fill="currentColor">IR</text>

                <rect x="650" y="0" width="50" height="30" fill="rgba(100, 100, 0, 0.3)" />
                <text x="675" y="20" fontSize="9" textAnchor="middle" fill="currentColor">Микро</text>

                <rect x="700" y="0" width="50" height="30" fill="rgba(100, 50, 0, 0.3)" />
                <text x="725" y="20" fontSize="9" textAnchor="middle" fill="currentColor">Радио</text>

                <text x="50" y="50" fontSize="10" fill="currentColor">Къси вълни</text>
                <text x="700" y="50" fontSize="10" fill="currentColor">Дълги вълни</text>
                <line x1="50" y1="55" x2="750" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowWave)" />
              </g>

              <defs>
                <marker id="arrowWave" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>

            {/* Плъзгач за дължина на вълната */}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2 text-center">
                Дължина на вълната: {selectedWavelength} nm - {getWavelengthName(selectedWavelength)}
              </label>
              <input
                type="range"
                min="300"
                max="850"
                value={selectedWavelength}
                onChange={(e) => setSelectedWavelength(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>UV (300nm)</span>
                <span>Видима (380-750nm)</span>
                <span>IR (850nm)</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Избрана дължина на вълната:</h4>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded border-2 border-white"
                  style={{ backgroundColor: getColor(selectedWavelength) }}
                />
                <div className="text-sm">
                  <p><strong>λ = {selectedWavelength} nm</strong></p>
                  <p>Цвят: <strong>{getWavelengthName(selectedWavelength)}</strong></p>
                  <p>Честота: ν ≈ {(299792 / selectedWavelength).toFixed(2)} THz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Видове електромагнитно излъчване:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Гама лъчи</strong> – най-енергийни, от радиоактивни процеси</li>
              <li><strong>Рентгенови лъчи</strong> – от горещи газове, черни дупки</li>
              <li><strong>Ултравиолетово (UV)</strong> – от горещи звезди</li>
              <li><strong>Видима светлина</strong> – 380-750 nm, това което виждаме</li>
              <li><strong>Инфрачервено (IR)</strong> – топлинно излъчване, прах</li>
              <li><strong>Микровълни</strong> – космическо фоново излъчване</li>
              <li><strong>Радиовълни</strong> – от студен газ, пулсари, галактики</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Спектрален анализ
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато светлината от звезда премине през призма или дифракционна
            решетка, тя се разлага на спектър. Анализът на спектъра разкрива
            много информация за звездата.
          </p>

          {/* Визуализация на спектрите */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Видове спектри</h3>

            <svg viewBox="0 0 700 500" className="w-full h-auto">
              {/* 1. Непрекъснат спектър */}
              <g>
                <text x="50" y="70" fontSize="14" fontWeight="bold" fill="currentColor">1. Непрекъснат спектър</text>
                <text x="50" y="90" fontSize="11" fill="currentColor">(нагрято плътно тяло)</text>

                <rect x="200" y="50" width="400" height="40" fill="url(#spectrumGradient)" stroke="black" strokeWidth="1" />

                <text x="50" y="115" fontSize="10" fill="currentColor">Източник: нагрята</text>
                <text x="50" y="130" fontSize="10" fill="currentColor">метална нишка</text>
              </g>

              {/* 2. Емисионен спектър */}
              <g transform="translate(0, 150)">
                <text x="50" y="20" fontSize="14" fontWeight="bold" fill="currentColor">2. Емисионен спектър</text>
                <text x="50" y="40" fontSize="11" fill="currentColor">(нагрят газ)</text>

                <rect x="200" y="0" width="400" height="40" fill="black" stroke="black" strokeWidth="1" />

                {/* Ярки линии на определени дължини */}
                {[250, 320, 380, 450, 520].map((x, i) => (
                  <rect
                    key={i}
                    x={x}
                    y="0"
                    width="4"
                    height="40"
                    fill={getColor(380 + ((x - 200) / 400) * 370)}
                  />
                ))}

                <text x="50" y="65" fontSize="10" fill="currentColor">Източник: неонова</text>
                <text x="50" y="80" fontSize="10" fill="currentColor">лампа, газ</text>
              </g>

              {/* 3. Абсорбционен спектър */}
              <g transform="translate(0, 300)">
                <text x="50" y="20" fontSize="14" fontWeight="bold" fill="currentColor">3. Абсорбционен спектър</text>
                <text x="50" y="40" fontSize="11" fill="currentColor">(светлина през хладен газ)</text>

                <rect x="200" y="0" width="400" height="40" fill="url(#spectrumGradient)" stroke="black" strokeWidth="1" />

                {/* Тъмни линии */}
                {[250, 320, 380, 450, 520].map((x, i) => (
                  <rect
                    key={i}
                    x={x}
                    y="0"
                    width="4"
                    height="40"
                    fill="black"
                  />
                ))}

                <text x="50" y="65" fontSize="10" fill="currentColor">Източник: звезден</text>
                <text x="50" y="80" fontSize="10" fill="currentColor">спектър</text>
              </g>

              {/* Обяснителни стрелки */}
              <text x="620" y="75" fontSize="10" fill="currentColor">Всички цветове</text>
              <text x="620" y="215" fontSize="10" fill="currentColor">Само определени линии</text>
              <text x="620" y="365" fontSize="10" fill="currentColor">Тъмни линии върху</text>
              <text x="620" y="380" fontSize="10" fill="currentColor">непрекъснат фон</text>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Обяснение:</h4>
              <ul className="text-sm space-y-2">
                <li><strong>Непрекъснат:</strong> Всички дължини на вълната са представени.
                Излъчва се от нагрято плътно тяло (напр. нажежена метална нишка).</li>
                <li><strong>Емисионен:</strong> Ярки линии на определени дължини. Излъчва се
                от нагрят разреден газ (напр. неонова лампа).</li>
                <li><strong>Абсорбционен:</strong> Тъмни линии върху непрекъснат фон. Получава
                се когато светлина премине през по-хладен газ (напр. звезден спектър).</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Какво научаваме от спектрите?
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Химичен състав</strong> – всеки елемент има уникален спектър (като "пръстов отпечатък")</li>
              <li><strong>Температура</strong> – от цвета и формата на спектъра (закон на Вин)</li>
              <li><strong>Скорост</strong> – от доплеровото изместване на линиите</li>
              <li><strong>Магнитно поле</strong> – от разцепването на спектралните линии (ефект на Зееман)</li>
              <li><strong>Плътност</strong> – от ширината на линиите</li>
              <li><strong>Въртене</strong> – от разширяването на линиите</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Доплеров ефект
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато източник на светлина се движи спрямо наблюдателя, дължината на
            вълната се променя.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Доплеров ефект в астрономията</h3>

            <svg viewBox="0 0 600 250" className="w-full h-auto">
              {/* Звезда, която се приближава (синьо изместване) */}
              <g>
                <circle cx="150" cy="80" r="20" fill="rgb(59, 130, 246)" />
                <path d="M 120,80 L 100,80" stroke="white" strokeWidth="2" markerEnd="url(#arrowApproach)" />
                <text x="150" y="120" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Приближава се
                </text>

                {/* Спектър с изместване към синьото */}
                <rect x="100" y="140" width="100" height="20" fill="url(#spectrumGradient)" />
                <line x1="140" y1="135" x2="140" y2="165" stroke="rgb(0, 0, 255)" strokeWidth="3" />
                <text x="150" y="180" fontSize="10" textAnchor="middle" fill="rgb(0, 0, 255)">← Синьо</text>
              </g>

              {/* Неподвижна звезда */}
              <g transform="translate(150, 0)">
                <circle cx="150" cy="80" r="20" fill="rgb(251, 191, 36)" />
                <text x="150" y="120" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Неподвижна
                </text>

                {/* Нормален спектър */}
                <rect x="100" y="140" width="100" height="20" fill="url(#spectrumGradient)" />
                <line x1="150" y1="135" x2="150" y2="165" stroke="rgb(0, 255, 0)" strokeWidth="3" />
                <text x="150" y="180" fontSize="10" textAnchor="middle" fill="rgb(0, 255, 0)">Нормално</text>
              </g>

              {/* Звезда, която се отдалечава (червено изместване) */}
              <g transform="translate(300, 0)">
                <circle cx="150" cy="80" r="20" fill="rgb(239, 68, 68)" />
                <path d="M 180,80 L 200,80" stroke="white" strokeWidth="2" markerEnd="url(#arrowRecede)" />
                <text x="150" y="120" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">
                  Отдалечава се
                </text>

                {/* Спектър с изместване към червеното */}
                <rect x="100" y="140" width="100" height="20" fill="url(#spectrumGradient)" />
                <line x1="160" y1="135" x2="160" y2="165" stroke="rgb(255, 0, 0)" strokeWidth="3" />
                <text x="150" y="180" fontSize="10" textAnchor="middle" fill="rgb(255, 0, 0)">Червено →</text>
              </g>

              <defs>
                <marker id="arrowApproach" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="white" />
                </marker>
                <marker id="arrowRecede" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="white" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Доплерова формула:</h4>
              <p className="font-mono text-center my-2">Δλ / λ = v / c</p>
              <ul className="text-sm space-y-1">
                <li>Δλ – изместване на дължината на вълната</li>
                <li>λ – оригинална дължина на вълната</li>
                <li>v – радиална скорост (към/от наблюдателя)</li>
                <li>c – скорост на светлината (300 000 km/s)</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Приложения:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Измерване на скоростта на звезди и галактики</li>
              <li>Откриване на екзопланети (метод на радиалните скорости)</li>
              <li>Доказване на разширяването на Вселената</li>
              <li>Измерване на въртенето на звезди</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Основни формули
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="space-y-3">
              <li>
                <strong>Връзка между честота и дължина на вълната:</strong>
                <p className="font-mono mt-1">c = λ × ν</p>
                <p className="text-sm">c = 3 × 10⁸ m/s (скорост на светлината)</p>
              </li>
              <li>
                <strong>Енергия на фотон:</strong>
                <p className="font-mono mt-1">E = h × ν = h × c / λ</p>
                <p className="text-sm">h = 6.626 × 10⁻³⁴ J·s (константа на Планк)</p>
              </li>
              <li>
                <strong>Закон на Вин (връзка температура-цвят):</strong>
                <p className="font-mono mt-1">λₘₐₓ × T = 2.898 × 10⁻³ m·K</p>
                <p className="text-sm">По-горещите звезди са по-сини, по-студените - по-червени</p>
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
              <p className="font-semibold mb-2">1. Изброй основните видове електромагнитно излъчване
              от къси към дълги вълни.</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор:</p>
                  <p className="mt-2">От къси към дълги вълни:</p>
                  <ol className="list-decimal list-inside mt-2">
                    <li>Гама лъчи</li>
                    <li>Рентгенови лъчи</li>
                    <li>Ултравиолетово излъчване</li>
                    <li>Видима светлина</li>
                    <li>Инфрачервено излъчване</li>
                    <li>Микровълни</li>
                    <li>Радиовълни</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Каква е разликата между емисионен и абсорбционен спектър?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2"><strong>Емисионен спектър:</strong> Ярки линии на тъмен фон.
                  Получава се от нагрят разреден газ, който излъчва светлина само на определени
                  дължини на вълната.</p>
                  <p className="mt-2"><strong>Абсорбционен спектър:</strong> Тъмни линии върху
                  непрекъснат цветен фон. Получава се когато светлина от горещ източник премине
                  през по-хладен газ, който поглъща определени дължини на вълната.</p>
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
              <p className="font-semibold mb-2">3. Звезда се приближава към нас със скорост 60 km/s.
              Спектрална линия с дължина на вълната 500 nm се измества с колко?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Използваме доплеровата формула: Δλ / λ = v / c</p>
                  <p className="mt-2">Δλ = λ × (v / c) = 500 nm × (60 km/s / 300000 km/s)</p>
                  <p>Δλ = 500 nm × 0.0002 = 0.1 nm</p>
                  <p className="mt-2">Тъй като звездата се приближава, линията се измества към
                  <strong> синьото</strong> (по-къси вълни).</p>
                  <p className="mt-2"><strong>Отговор: 0.1 nm към синьото</strong></p>
                  <p className="mt-2 text-sm">Новата дължина: 500 - 0.1 = 499.9 nm</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Използвайки закона на Вин, изчисли температурата
              на звезда, която излъчва най-интензивно при λ = 500 nm.</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Закон на Вин: λₘₐₓ × T = 2.898 × 10⁻³ m·K</p>
                  <p className="mt-2">T = 2.898 × 10⁻³ / λₘₐₓ</p>
                  <p>T = 2.898 × 10⁻³ / (500 × 10⁻⁹)</p>
                  <p>T = 2.898 × 10⁻³ / 5 × 10⁻⁷</p>
                  <p>T = 5796 K</p>
                  <p className="mt-2"><strong>Отговор: около 5800 K</strong></p>
                  <p className="mt-2 text-sm">Това е близо до температурата на Слънцето (5778 K)!</p>
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
              <p className="font-semibold mb-2">5. Галактика показва червено изместване z = 0.1.
              Изчисли скоростта, с която се отдалечава от нас. (За малки z: v ≈ c × z)</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Червеното изместване z се дефинира като:</p>
                  <p className="font-mono">z = Δλ / λ = (λₒբₛ - λₑₘᵢₜ) / λₑₘᵢₜ</p>
                  <p className="mt-2">За малки скорости (v &lt;&lt; c): z ≈ v / c</p>
                  <p className="mt-2">v = z × c = 0.1 × 300000 km/s = 30000 km/s</p>
                  <p className="mt-2"><strong>Отговор: 30 000 km/s (10% от скоростта на светлината)</strong></p>
                  <p className="mt-2 text-sm">Забележка: При по-големи z трябва да се използва
                  релативистката формула.</p>
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
              <li>✓ Видимата светлина е малка част от електромагнитния спектър (380-750 nm)</li>
              <li>✓ Спектралният анализ разкрива състав, температура, скорост на звездите</li>
              <li>✓ Доплеровият ефект: синьо изместване = приближаване, червено = отдалечаване</li>
              <li>✓ Всеки елемент има уникален спектър</li>
              <li>✓ Формули: c = λν, E = hν, λₘₐₓT = 2.898×10⁻³</li>
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
              Спектралният анализ позволява да определим химичния състав на
              звездите, въпреки че никога не сме били там! Хелият е открит първо
              в спектъра на Слънцето през 1868 г. (оттам и името му – от гръцкото
              "хелиос"), преди да бъде намерен на Земята през 1895 г. Фраунхофер е
              открил над 500 тъмни линии в слънчевия спектър още през 1814 г.!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
