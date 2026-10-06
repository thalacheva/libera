import {useState} from 'react';

export default function Lecture33() {
  const [beta, setBeta] = useState(0.6); // v/c
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Лоренцов фактор
  const gamma = 1 / Math.sqrt(1 - beta * beta);

  // Светлинен часовник: разстояние между огледалата h
  const h = 80;
  const mirrorTop = 60;
  const mirrorBottom = mirrorTop + h;
  const restX = 80;
  // За половин тик фотонът изминава γh, а часовникът се измества с βγh
  const shift = beta * gamma * h;
  const movingX0 = 180;

  // Свиване на дължините: L₀ = 300 px
  const restLength = 300;
  const movingLength = restLength / gamma;

  // Графика на γ(β)
  const gx = (b: number) => 60 + b * 500;
  const gy = (g: number) => 260 - ((g - 1) / 7) * 220;
  const gammaCurve = Array.from({ length: 100 }, (_, i) => {
    const b = (i / 99) * 0.99;
    return `${i === 0 ? 'M' : 'L'} ${gx(b)},${gy(1 / Math.sqrt(1 - b * b))}`;
  }).join(' ');

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 33: Специална теория на относителността
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Алберт Айнщайн (1879-1955)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            През 1905 г. Айнщайн публикува специалната теория на относителността (СТО).
            Тя описва как изглеждат пространството и времето за наблюдатели, които се
            движат един спрямо друг с постоянна скорост. При скорости, близки до
            скоростта на светлината, законите на Нютон престават да бъдат точни и
            се появяват ефекти като забавяне на времето и свиване на дължините.
          </p>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            В астрономията СТО е необходима навсякъде, където частици или вещество се
            движат изключително бързо: космически лъчи, релативистки струи от черни
            дупки, далечни галактики и дори спътниците на GPS системата.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Двата постулата на Айнщайн
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              1. Принцип на относителността: законите на физиката са еднакви във всички
              инерциални отправни системи.
            </p>
            <p className="font-semibold text-lg">
              2. Скоростта на светлината във вакуум е една и съща за всички наблюдатели,
              независимо от движението на източника и наблюдателя:
            </p>
            <p className="text-center text-xl my-3 font-mono">c ≈ 299 792 km/s ≈ 3 × 10⁸ m/s</p>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Няма експеримент, с който да определим дали се движим равномерно или стоим
            неподвижно. Ако от ракета, летяща с 0.5c, светнем с фенерче напред, светлината
            пак ще се движи с c, а не с 1.5c – както за космонавтите, така и за нас на Земята.
            Именно второто следствие налага времето и пространството да бъдат относителни.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Лоренцов фактор
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="text-center text-xl my-3 font-mono">γ = 1 / √(1 − v²/c²)</p>
            <p className="text-center">
              Всички релативистки ефекти се изразяват чрез γ. При малки скорости γ ≈ 1 и
              получаваме класическата физика.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Как расте γ със скоростта</h3>

            <svg viewBox="0 0 600 300" className="w-full h-auto">
              {/* Оси */}
              <line x1={gx(0)} y1={gy(1)} x2={gx(1)} y2={gy(1)} stroke="currentColor" strokeWidth="1" />
              <line x1={gx(0)} y1={gy(1)} x2={gx(0)} y2={gy(8)} stroke="currentColor" strokeWidth="1" />
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map(b => (
                <g key={`bx-${b}`}>
                  <line x1={gx(b)} y1={gy(1)} x2={gx(b)} y2={gy(1) + 5} stroke="currentColor" />
                  <text x={gx(b)} y={gy(1) + 18} fontSize="10" textAnchor="middle" fill="currentColor">{b}</text>
                </g>
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                <g key={`gy-${g}`}>
                  <line x1={gx(0) - 5} y1={gy(g)} x2={gx(0)} y2={gy(g)} stroke="currentColor" />
                  <text x={gx(0) - 9} y={gy(g) + 4} fontSize="10" textAnchor="end" fill="currentColor">{g}</text>
                </g>
              ))}
              <text x={gx(1)} y={gy(1) + 34} fontSize="11" textAnchor="end" fill="currentColor">v / c</text>
              <text x={gx(0) + 8} y={gy(8) + 4} fontSize="11" fill="currentColor">γ</text>

              {/* Асимптота при v = c */}
              <line x1={gx(1)} y1={gy(1)} x2={gx(1)} y2={gy(8)} stroke="gray" strokeDasharray="4,4" />
              <text x={gx(1) - 5} y={gy(8) + 4} fontSize="10" fill="gray" textAnchor="end">v → c, γ → ∞</text>

              {/* Крива */}
              <path d={gammaCurve} fill="none" stroke="rgb(168, 85, 247)" strokeWidth="3" />

              {/* Текуща стойност */}
              <line x1={gx(beta)} y1={gy(1)} x2={gx(beta)} y2={gy(gamma)} stroke="rgb(239, 68, 68)" strokeDasharray="3,3" />
              <line x1={gx(0)} y1={gy(gamma)} x2={gx(beta)} y2={gy(gamma)} stroke="rgb(239, 68, 68)" strokeDasharray="3,3" />
              <circle cx={gx(beta)} cy={gy(gamma)} r="6" fill="rgb(239, 68, 68)" />
              <text
                x={beta < 0.3 ? gx(beta) + 10 : gx(beta) - 10}
                y={gy(gamma) - 10}
                fontSize="11"
                fontWeight="bold"
                fill="rgb(239, 68, 68)"
                textAnchor={beta < 0.3 ? 'start' : 'end'}
              >
                γ = {gamma.toFixed(2)}
              </text>
            </svg>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-center">
                Скорост: v = {beta.toFixed(2)} c ({Math.round(beta * 299792).toLocaleString('bg-BG')} km/s)
              </label>
              <input
                type="range"
                min="0"
                max="0.95"
                step="0.01"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
                Плъзгачът управлява и трите диаграми в лекцията.
              </p>
            </div>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <h4 className="font-semibold mb-2">Някои стойности:</h4>
              <ul className="text-sm space-y-1 font-mono">
                <li>v = 0.1c → γ ≈ 1.005</li>
                <li>v = 0.6c → γ = 1.25</li>
                <li>v = 0.8c → γ ≈ 1.67</li>
                <li>v = 0.99c → γ ≈ 7.09</li>
                <li>v = 0.9999c → γ ≈ 70.7</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Забавяне на времето
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              Движещият се часовник върви по-бавно от неподвижния.
            </p>
            <p className="text-center text-xl my-3 font-mono">Δt = γ · Δt₀</p>
            <p className="text-center">
              Δt₀ – собствено време (измерено от часовник, който е в покой спрямо събитията)
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Светлинен часовник</h3>

            <svg viewBox="0 0 700 220" className="w-full h-auto">
              {/* Неподвижен часовник */}
              <line x1={restX - 25} y1={mirrorTop} x2={restX + 25} y2={mirrorTop} stroke="currentColor" strokeWidth="4" />
              <line x1={restX - 25} y1={mirrorBottom} x2={restX + 25} y2={mirrorBottom} stroke="currentColor" strokeWidth="4" />
              <line x1={restX} y1={mirrorBottom} x2={restX} y2={mirrorTop} stroke="rgb(251, 191, 36)" strokeWidth="3" />
              <circle cx={restX} cy={mirrorTop} r="5" fill="rgb(251, 191, 36)" />
              <text x={restX + 8} y={mirrorTop + h / 2 + 4} fontSize="11" fill="currentColor">h</text>
              <text x={restX} y={mirrorBottom + 25} fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">
                В покой
              </text>
              <text x={restX} y={mirrorBottom + 40} fontSize="10" textAnchor="middle" fill="gray">
                тик: Δt₀ = 2h / c
              </text>

              {/* Движещ се часовник: начално, средно и крайно положение */}
              {[0, 1, 2].map(i => {
                const x = movingX0 + i * shift;
                return (
                  <g key={`clock-${i}`} opacity={i === 2 ? 1 : 0.35}>
                    <line x1={x - 25} y1={mirrorTop} x2={x + 25} y2={mirrorTop} stroke="currentColor" strokeWidth="4" />
                    <line x1={x - 25} y1={mirrorBottom} x2={x + 25} y2={mirrorBottom} stroke="currentColor" strokeWidth="4" />
                  </g>
                );
              })}
              {/* Път на фотона: нагоре и обратно надолу по диагонал */}
              <polyline
                points={`${movingX0},${mirrorBottom} ${movingX0 + shift},${mirrorTop} ${movingX0 + 2 * shift},${mirrorBottom}`}
                fill="none"
                stroke="rgb(251, 191, 36)"
                strokeWidth="3"
              />
              <circle cx={movingX0 + 2 * shift} cy={mirrorBottom} r="5" fill="rgb(251, 191, 36)" />

              {/* Посока на движение */}
              <line
                x1={movingX0}
                y1={mirrorBottom + 20}
                x2={movingX0 + Math.max(2 * shift, 40) - 8}
                y2={mirrorBottom + 20}
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                markerEnd="url(#arrowV)"
              />
              <text
                x={movingX0 + Math.max(shift, 20)}
                y={mirrorBottom + 38}
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                fill="rgb(34, 197, 94)"
              >
                v = {beta.toFixed(2)}c
              </text>
              <text x={movingX0 + Math.max(shift, 20)} y={mirrorBottom + 54} fontSize="10" textAnchor="middle" fill="gray">
                тик: Δt = γ · Δt₀ = {gamma.toFixed(2)} Δt₀
              </text>
              <text x={movingX0} y={mirrorTop - 15} fontSize="11" fontWeight="bold" fill="currentColor">
                В движение (гледано от Земята)
              </text>

              <defs>
                <marker id="arrowV" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(34, 197, 94)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Защо?</strong> Светлината в движещия се часовник изминава по-дълъг,
                диагонален път. Тъй като скоростта ѝ е все същата c, един тик трае по-дълго.
                От питагоровата теорема (c·Δt/2)² = h² + (v·Δt/2)² следва Δt = γ · 2h/c.
              </p>
              <p className="text-sm mt-2">
                <strong>Пример:</strong> При v = {beta.toFixed(2)}c за всяка 1 секунда на
                кораба на Земята минават {gamma.toFixed(2)} s.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Мюоните от космическите лъчи</h3>
            <p>
              Космическите лъчи създават мюони на височина около 15 km. Собственото им време
              на живот е само 2.2 μs – дори при скорост c те биха изминали едва ~660 m.
              Въпреки това ги регистрираме в голям брой на земната повърхност. Причината:
              при v ≈ 0.995c имаме γ ≈ 10 и за нас те живеят около 10 пъти по-дълго.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Свиване на дължините
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-3 font-semibold text-lg">
              Движещото се тяло е по-късо по посока на движението си.
            </p>
            <p className="text-center text-xl my-3 font-mono">L = L₀ / γ</p>
            <p className="text-center">L₀ – собствена дължина (измерена в покой спрямо тялото)</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Ракета в покой и в движение</h3>

            <svg viewBox="0 0 600 220" className="w-full h-auto">
              {/* В покой */}
              <rect x={100} y={40} width={restLength - 40} height={36} rx="8" fill="rgb(148, 163, 184)" />
              <polygon points={`${100 + restLength - 40},40 ${100 + restLength},58 ${100 + restLength - 40},76`} fill="rgb(148, 163, 184)" />
              <text x={90} y={63} fontSize="11" textAnchor="end" fill="currentColor">v = 0</text>
              <line x1={100} y1={90} x2={100 + restLength} y2={90} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <line x1={100} y1={85} x2={100} y2={95} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <line x1={100 + restLength} y1={85} x2={100 + restLength} y2={95} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <text x={100 + restLength / 2} y={107} fontSize="11" fontWeight="bold" textAnchor="middle" fill="rgb(168, 85, 247)">
                L₀
              </text>

              {/* В движение (тялото на ракетата и носът се свиват еднакво) */}
              <rect x={100} y={130} width={movingLength * (260 / 300)} height={36} rx={8 / gamma} fill="rgb(59, 130, 246)" />
              <polygon
                points={`${100 + movingLength * (260 / 300)},130 ${100 + movingLength},148 ${100 + movingLength * (260 / 300)},166`}
                fill="rgb(59, 130, 246)"
              />
              <text x={90} y={153} fontSize="11" textAnchor="end" fill="currentColor">v = {beta.toFixed(2)}c</text>
              <line x1={100} y1={180} x2={100 + movingLength} y2={180} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <line x1={100} y1={175} x2={100} y2={185} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <line x1={100 + movingLength} y1={175} x2={100 + movingLength} y2={185} stroke="rgb(168, 85, 247)" strokeWidth="2" />
              <text x={100 + movingLength / 2} y={197} fontSize="11" fontWeight="bold" textAnchor="middle" fill="rgb(168, 85, 247)">
                L = {(1 / gamma).toFixed(2)} L₀
              </text>

              {/* Пунктир за сравнение с дължината в покой */}
              <line x1={100 + restLength} y1={95} x2={100 + restLength} y2={185} stroke="gray" strokeDasharray="4,4" />
            </svg>

            <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg">
              <p className="text-sm">
                Свиването е само по посока на движението – височината на ракетата не се променя.
                От гледна точка на мюона не времето му се забавя, а разстоянието до Земята се
                свива от 15 km до около 1.5 km. Двете описания дават един и същ резултат.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Събиране на скоростите
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <p className="text-center text-xl my-3 font-mono">u = (u' + v) / (1 + u'v/c²)</p>
            <p className="text-center">
              Скоростите не се събират просто като u' + v. Резултатът никога не надминава c.
            </p>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Ако кораб се движи с 0.5c и изстреля сонда напред с 0.5c спрямо себе си, сондата
            спрямо Земята има скорост (0.5 + 0.5) / (1 + 0.25) = 0.8c, а не 1c. А ако вместо
            сонда изпрати светлинен лъч: (c + v) / (1 + v/c) = c – точно според втория постулат.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Маса и енергия: E = mc²
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="text-center text-xl my-3 font-mono">E₀ = mc²</p>
            <p className="text-center text-xl my-3 font-mono">E = γmc²</p>
            <p className="text-center">
              Масата е форма на енергия. Пълната енергия на движещо се тяло е γ пъти по-голяма
              от енергията му в покой, затова нито едно тяло с маса не може да достигне c.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Защо свети Слънцето?</h3>
            <p>
              В ядрото на Слънцето 4 протона се сливат в едно хелиево ядро. Хелиевото ядро е
              с около 0.7% по-леко от четирите протона – тази "изчезнала" маса се превръща в
              енергия по формулата E = mc². Така Слънцето губи около 4 милиона тона маса всяка
              секунда и въпреки това ще свети още около 5 милиарда години.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            СТО в астрономията
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Релативистки Доплеров ефект:</strong> за източник, който се отдалечава,
                λ = λ₀ · √((1 + β) / (1 − β)). Използва се за много далечни и бързи обекти.
              </li>
              <li>
                <strong>Релативистки струи:</strong> квазарите и активните галактики изхвърлят
                струи плазма със скорости над 0.99c. Някои дори изглеждат "по-бързи от светлината" –
                оптична илюзия, обяснима със СТО.
              </li>
              <li>
                <strong>Космически лъчи:</strong> протони с γ над 10¹¹ – най-енергичните частици,
                наблюдавани във Вселената.
              </li>
              <li>
                <strong>GPS:</strong> часовниците на спътниците изостават със ~7 μs на ден заради
                скоростта си (СТО) и избързват с ~45 μs заради по-слабата гравитация (обща
                теория на относителността). Без корекция от +38 μs/ден грешката в позицията би
                расла с ~10 km на ден.
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Специална или обща теория?</h3>
            <p>
              Специалната теория (1905) разглежда равномерно движение без гравитация. Общата
              теория на относителността (1915) обяснява гравитацията като изкривяване на
              пространство-времето и е нужна за черните дупки, гравитационните лещи и
              гравитационните вълни.
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
              <p className="font-semibold mb-2">1. Кораб лети от Земята със скорост 0.6c. Космонавтът
              отчита по своя часовник 1 час. Колко време е минало на Земята?</p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">γ = 1 / √(1 − 0.6²) = 1 / √0.64 = 1 / 0.8 = 1.25</p>
                  <p className="mt-2">Δt = γ · Δt₀ = 1.25 × 1 h = 1.25 h</p>
                  <p className="mt-2"><strong>Отговор: 1 час и 15 минути</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">2. Ракета с дължина 100 m в покой лети с 0.8c.
              Каква дължина ще измери наблюдател на Земята?</p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">γ = 1 / √(1 − 0.8²) = 1 / √0.36 = 1 / 0.6 ≈ 1.67</p>
                  <p className="mt-2">L = L₀ / γ = 100 m × 0.6 = 60 m</p>
                  <p className="mt-2"><strong>Отговор: 60 m</strong></p>
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
              <p className="font-semibold mb-2">3. Мюон със собствено време на живот 2.2 μs се движи
              със скорост 0.995c. Какво разстояние ще измине средно според наблюдател на Земята?
              А колко би изминал без релативистки ефекти?</p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">v = 0.995 × 3 × 10⁸ ≈ 2.985 × 10⁸ m/s</p>
                  <p className="mt-2">Без СТО: d = v · τ₀ = 2.985 × 10⁸ × 2.2 × 10⁻⁶ ≈ 657 m</p>
                  <p className="mt-2">γ = 1 / √(1 − 0.995²) = 1 / √0.009975 ≈ 10.0</p>
                  <p className="mt-2">Със СТО: d = v · γτ₀ ≈ 657 m × 10.0 ≈ 6.6 km</p>
                  <p className="mt-2"><strong>Отговор: ≈ 6.6 km вместо ≈ 0.66 km</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">4. Колко енергия се съдържа в 1 g вещество? Сравни
              с енергията на 1 килотон тротил (4.2 × 10¹² J).</p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">E = mc² = 10⁻³ kg × (3 × 10⁸ m/s)² = 9 × 10¹³ J</p>
                  <p className="mt-2">9 × 10¹³ / 4.2 × 10¹² ≈ 21</p>
                  <p className="mt-2"><strong>Отговор: 9 × 10¹³ J ≈ 21 килотона тротил</strong></p>
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
              <p className="font-semibold mb-2">5. Светимостта на Слънцето е L = 3.83 × 10²⁶ W.
              Колко маса губи Слънцето всяка секунда? Каква част от масата си
              (M = 2 × 10³⁰ kg) би загубило за 10 милиарда години?</p>
              <button
                onClick={() => toggleSolution('c5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c5'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Δm/Δt = L / c² = 3.83 × 10²⁶ / 9 × 10¹⁶ ≈ 4.3 × 10⁹ kg/s</p>
                  <p className="mt-2">10 милиарда години ≈ 10¹⁰ × 3.16 × 10⁷ s ≈ 3.16 × 10¹⁷ s</p>
                  <p className="mt-2">Δm ≈ 4.3 × 10⁹ × 3.16 × 10¹⁷ ≈ 1.4 × 10²⁷ kg</p>
                  <p className="mt-2">Δm / M ≈ 1.4 × 10²⁷ / 2 × 10³⁰ ≈ 0.07%</p>
                  <p className="mt-2"><strong>Отговор: ≈ 4.3 милиона тона в секунда, но само ≈ 0.07% от масата за целия живот</strong></p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-red-500">
              <p className="font-semibold mb-2">6. Две частици от космическите лъчи се движат една
              срещу друга, всяка със скорост 0.8c спрямо Земята. С каква скорост се движи едната
              спрямо другата?</p>
              <button
                onClick={() => toggleSolution('c6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c6'] ? '▼ Скрий решението' : '▶ Покажи решението'}
              </button>
              {showSolutions['c6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">Класически: 0.8c + 0.8c = 1.6c – невъзможно!</p>
                  <p className="mt-2">Релативистки: u = (u' + v) / (1 + u'v/c²)</p>
                  <p className="font-mono">u = (0.8 + 0.8) / (1 + 0.64) c = 1.6 / 1.64 c ≈ 0.976c</p>
                  <p className="mt-2"><strong>Отговор: ≈ 0.976c</strong></p>
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
              <li>✓ <strong>Постулати:</strong> физиката е една и съща за всички инерциални наблюдатели; c е еднаква за всички</li>
              <li>✓ <strong>Лоренцов фактор:</strong> γ = 1 / √(1 − v²/c²)</li>
              <li>✓ <strong>Забавяне на времето:</strong> Δt = γΔt₀</li>
              <li>✓ <strong>Свиване на дължините:</strong> L = L₀ / γ</li>
              <li>✓ <strong>Събиране на скоростите:</strong> резултатът никога не надминава c</li>
              <li>✓ <strong>Маса и енергия:</strong> E = mc² – източникът на енергия на звездите</li>
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
              Астронавтите на Международната космическа станция се движат с около 7.7 km/s.
              След 6 месеца в орбита те са остарели с около 0.005 секунди по-малко от хората
              на Земята. Рекордьорът Генадий Падалка, прекарал 879 дни в космоса, е "пътувал
              във времето" с около 0.02 секунди напред!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
