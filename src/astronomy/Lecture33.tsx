import { useState } from 'react';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import LightClockLab from './components/LightClockLab';
import MuonLab from './components/MuonLab';
import SuperluminalLab from './components/SuperluminalLab';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import TwinParadoxLab from './components/TwinParadoxLab';
import { fmt } from './components/terrestrialData';

const QUIZ: Question[] = [
  {
    question: 'Какво твърди вторият постулат на Айнщайн?',
    answers: [
      'Светлината се движи по-бързо от звука',
      'Скоростта на светлината във вакуум е една и съща за всички инерциални наблюдатели',
      'Времето е абсолютно',
      'Масата се запазва',
    ],
    correctAnswer: 'Скоростта на светлината във вакуум е една и съща за всички инерциални наблюдатели',
  },
  {
    question: 'Ракета лети с 0,6c. Колко е γ?',
    answers: ['0,8', '1,25', '1,6', '2'],
    correctAnswer: '1,25',
  },
  {
    question: 'Защо мюоните от горната атмосфера стигат до земната повърхност?',
    answers: [
      'Защото са по-бързи от светлината',
      'Защото за нас времето им тече по-бавно (а за тях атмосферата е свита)',
      'Защото не се разпадат',
      'Защото се раждат близо до земята',
    ],
    correctAnswer: 'Защото за нас времето им тече по-бавно (а за тях атмосферата е свита)',
  },
  {
    question: 'Кораб с 0,5c изстрелва сонда напред с 0,5c спрямо себе си. Колко е скоростта ѝ спрямо Земята?',
    answers: ['1c', '0,8c', '0,75c', '0,5c'],
    correctAnswer: '0,8c',
  },
  {
    question: 'Защо при парадокса на близнаците пътешественикът е по-младият?',
    answers: [
      'Защото е бил по-близо до звездата',
      'Защото само той сменя отправната си система (обръща се) – ситуацията не е симетрична',
      'Защото в космоса е студено',
      'Не е – двамата са на една възраст',
    ],
    correctAnswer: 'Защото само той сменя отправната си система (обръща се) – ситуацията не е симетрична',
  },
  {
    question: 'Откъде идва енергията на Слънцето според E = mc²?',
    answers: [
      'От горенето на водород с кислород',
      'Хелиевото ядро е с ~0,7% по-леко от четирите протона – разликата в масата се превръща в енергия',
      'От свиването на Слънцето',
      'От радиоактивен уран',
    ],
    correctAnswer: 'Хелиевото ядро е с ~0,7% по-леко от четирите протона – разликата в масата се превръща в енергия',
  },
  {
    question: 'Как се обясняват „свръхсветлинните“ струи на квазарите?',
    answers: [
      'Плазмата наистина е по-бърза от светлината',
      'Плазма с почти светлинна скорост под малък ъгъл към нас почти догонва светлината си – видимата скорост излиза над c',
      'Грешка в разстоянието',
      'Гравитационна леща',
    ],
    correctAnswer: 'Плазма с почти светлинна скорост под малък ъгъл към нас почти догонва светлината си – видимата скорост излиза над c',
  },
];

export default function Lecture33() {
  const [beta, setBeta] = useState(0.6);

  const gamma = 1 / Math.sqrt(1 - beta * beta);

  // Графика на γ(β)
  const gx = (b: number) => 60 + b * 520;
  const gy = (g: number) => 250 - ((g - 1) / 7) * 210;
  const gammaCurve = Array.from({ length: 100 }, (_, i) => {
    const b = (i / 99) * 0.99;
    return `${i === 0 ? 'M' : 'L'} ${gx(b)},${gy(1 / Math.sqrt(1 - b * b))}`;
  }).join(' ');

  // Свиване на дължините: L₀ = 300 px
  const restLength = 300;
  const movingLength = restLength / gamma;

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Лекция 33: Специална теория на относителността</h1>

        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            ⚡ 16-годишният Алберт Айнщайн си представя, че препуска до светлинен лъч със същата скорост. Би ли видял „замръзнала“
            електромагнитна вълна? Уравненията на Максуел казват, че такова нещо не съществува. Десет години по-късно, през 1905 г.,
            младият служител в патентното бюро в Берн публикува решението: скоростта на светлината е една и съща за всички. Цената е
            висока – времето и пространството престават да бъдат абсолютни. Днес тази теория работи всеки ден в GPS навигацията на
            телефона ви, в ускорителите на частици и в струите на черните дупки.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Двата постулата</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Специалната теория на относителността (СТО) описва как изглеждат пространството и времето за наблюдатели, които се движат един
            спрямо друг с постоянна скорост. При скорости, близки до скоростта на светлината, законите на Нютон престават да бъдат точни.
          </p>
          <Theorem
            title="Постулатите на Айнщайн (1905)"
            description="1) Принцип на относителността: законите на физиката са еднакви във всички инерциални отправни системи. 2) Скоростта на светлината във вакуум c ≈ 299 792 km/s е една и съща за всички наблюдатели, независимо от движението на източника и на наблюдателя."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Няма експеримент, с който да определим дали се движим равномерно или стоим неподвижно. Ако от ракета, летяща с 0,5c, светнем с
            фенерче напред, светлината пак ще се движи с c, а не с 1,5c – както за космонавтите, така и за нас на Земята. Именно второто
            твърдение налага времето и пространството да бъдат относителни. Опитът на Майкелсън и Морли (1887 г.) не открива никаква разлика в
            скоростта на светлината при движението на Земята.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Лоренцовият фактор</h2>
          <Theorem
            title="Лоренцов фактор"
            description="γ = 1 / √(1 − v²/c²). Всички релативистки ефекти се изразяват чрез γ. При малки скорости γ ≈ 1 + v²/(2c²) ≈ 1 и получаваме класическата физика; при v → c, γ → ∞."
          />
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Как расте γ със скоростта</h3>
            <svg viewBox="0 0 640 290" className="w-full h-auto rounded-lg bg-slate-950 select-none">
              <line x1={gx(0)} y1={gy(1)} x2={gx(1)} y2={gy(1)} stroke="white" strokeOpacity="0.4" />
              <line x1={gx(0)} y1={gy(1)} x2={gx(0)} y2={gy(8)} stroke="white" strokeOpacity="0.4" />
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map(b => (
                <g key={`bx-${b}`}>
                  <line x1={gx(b)} y1={gy(1)} x2={gx(b)} y2={gy(1) + 5} stroke="white" strokeOpacity="0.4" />
                  <text x={gx(b)} y={gy(1) + 18} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
                    {fmt(b, 1)}
                  </text>
                </g>
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                <g key={`gy-${g}`}>
                  <line x1={gx(0) - 5} y1={gy(g)} x2={gx(0)} y2={gy(g)} stroke="white" strokeOpacity="0.4" />
                  <text x={gx(0) - 9} y={gy(g) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
                    {g}
                  </text>
                </g>
              ))}
              <text x={gx(1)} y={gy(1) + 34} fontSize="11" textAnchor="end" fill="white" fillOpacity="0.7">
                v / c
              </text>
              <text x={gx(0) + 8} y={gy(8) + 4} fontSize="11" fill="white" fillOpacity="0.7">
                γ
              </text>
              <line x1={gx(1)} y1={gy(1)} x2={gx(1)} y2={gy(8)} stroke="white" strokeOpacity="0.35" strokeDasharray="4,4" />
              <text x={gx(1) - 5} y={gy(8) + 4} fontSize="10" fill="white" fillOpacity="0.5" textAnchor="end">
                v → c, γ → ∞
              </text>
              <path d={gammaCurve} fill="none" stroke="#c084fc" strokeWidth="3" />
              <line x1={gx(beta)} y1={gy(1)} x2={gx(beta)} y2={gy(gamma)} stroke="#f87171" strokeDasharray="3,3" />
              <line x1={gx(0)} y1={gy(gamma)} x2={gx(beta)} y2={gy(gamma)} stroke="#f87171" strokeDasharray="3,3" />
              <circle cx={gx(beta)} cy={gy(gamma)} r="6" fill="#f87171" />
              <text x={beta < 0.3 ? gx(beta) + 10 : gx(beta) - 10} y={gy(gamma) - 10} fontSize="11" fontWeight="bold" fill="#fca5a5" textAnchor={beta < 0.3 ? 'start' : 'end'}>
                γ = {fmt(gamma, 2)}
              </text>
            </svg>
            <label className="block text-sm font-semibold mt-4 mb-1">
              Скорост: v = {fmt(beta, 2)}c ({fmt(beta * 299792, 0)} km/s)
            </label>
            <input type="range" min="0" max="0.95" step="0.01" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">Плъзгачът управлява и диаграмата на ракетата в т. 4.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-sm font-mono text-center">
              {[
                ['0,1c', '1,005'],
                ['0,6c', '1,25'],
                ['0,8c', '1,67'],
                ['0,99c', '7,09'],
                ['0,9999c', '70,7'],
              ].map(([v, g]) => (
                <div key={v} className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                  v = {v}
                  <br />γ ≈ {g}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Забавяне на времето</h2>
          <Theorem
            title="Забавяне на времето"
            description="Движещият се часовник върви по-бавно от неподвижния: Δt = γ · Δt₀, където Δt₀ е собственото време – измерено от часовник, който е в покой спрямо събитията (например часовникът на космонавта)."
          />
          <LightClockLab />
          <Example
            description="Мюон има собствено време на живот 2,2 µs и се движи с 0,995c. Какво разстояние изминава средно според земен наблюдател?"
            steps={[
              'Без относителност: d = v τ₀ = 0,995 · 3 · 10⁸ · 2,2 · 10⁻⁶ ≈ 657 m',
              'γ = 1 / √(1 − 0,995²) = 1 / √0,009975 ≈ 10,0',
              'Със СТО: d = v · γτ₀ ≈ 6,6 km – десет пъти повече. Мюоните, родени на 15 km, имат реален шанс да стигнат до земята',
            ]}
          />
          <MuonLab />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Свиване на дължините</h2>
          <Theorem
            title="Свиване на дължините"
            description="Движещото се тяло е по-късо по посока на движението си: L = L₀ / γ, където L₀ е собствената дължина (измерена в покой спрямо тялото). Размерите, перпендикулярни на движението, не се променят."
          />
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">Ракета в покой и в движение (v = {fmt(beta, 2)}c)</h3>
            <svg viewBox="0 0 640 220" className="w-full h-auto rounded-lg bg-slate-950 select-none">
              <rect x={120} y={40} width={restLength - 40} height={36} rx="8" fill="#94a3b8" />
              <polygon points={`${120 + restLength - 40},40 ${120 + restLength},58 ${120 + restLength - 40},76`} fill="#94a3b8" />
              <text x={110} y={63} fontSize="11" textAnchor="end" fill="white" fillOpacity="0.8">
                v = 0
              </text>
              <line x1={120} y1={90} x2={120 + restLength} y2={90} stroke="#c084fc" strokeWidth="2" />
              <line x1={120} y1={85} x2={120} y2={95} stroke="#c084fc" strokeWidth="2" />
              <line x1={120 + restLength} y1={85} x2={120 + restLength} y2={95} stroke="#c084fc" strokeWidth="2" />
              <text x={120 + restLength / 2} y={107} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#d8b4fe">
                L₀
              </text>
              <rect x={120} y={130} width={movingLength * (260 / 300)} height={36} rx={8 / gamma} fill="#3b82f6" />
              <polygon points={`${120 + movingLength * (260 / 300)},130 ${120 + movingLength},148 ${120 + movingLength * (260 / 300)},166`} fill="#3b82f6" />
              <text x={110} y={153} fontSize="11" textAnchor="end" fill="white" fillOpacity="0.8">
                v = {fmt(beta, 2)}c
              </text>
              <line x1={120} y1={180} x2={120 + movingLength} y2={180} stroke="#c084fc" strokeWidth="2" />
              <line x1={120} y1={175} x2={120} y2={185} stroke="#c084fc" strokeWidth="2" />
              <line x1={120 + movingLength} y1={175} x2={120 + movingLength} y2={185} stroke="#c084fc" strokeWidth="2" />
              <text x={120 + movingLength / 2} y={202} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#d8b4fe">
                L = {fmt(1 / gamma, 2)} L₀
              </text>
              <line x1={120 + restLength} y1={95} x2={120 + restLength} y2={185} stroke="white" strokeOpacity="0.35" strokeDasharray="4,4" />
            </svg>
            <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Свиването е само по посока на движението – височината на ракетата не се променя. От гледна точка на мюона не времето му се
              забавя, а разстоянието до Земята се свива от 15 km до около 1,5 km. Двете описания дават един и същ резултат.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Пътуване до звездите и парадоксът на близнаците</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Забавянето на времето прави възможно (поне на теория) да стигнем далечни звезди за един човешки живот – за пътешественика. На
            Земята обаче ще минат десетилетия или векове.
          </p>
          <Example
            description="Близнак лети до Проксима Кентавър (4,24 св. г.) и обратно с 0,8c. С колко остарява всеки от близнаците?"
            steps={[
              'На Земята: T = 2 · 4,24 / 0,8 = 10,6 години',
              'γ = 1 / √(1 − 0,64) = 1 / 0,6 ≈ 1,67',
              'Пътешественикът: τ = T / γ = 10,6 · 0,6 ≈ 6,4 години – той се връща с 4,2 години по-млад от брат си',
            ]}
          />
          <TwinParadoxLab />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">6. Събиране на скоростите</h2>
          <Theorem
            title="Релативистко събиране на скоростите"
            description="Ако тяло се движи със скорост u' спрямо система, която се движи със скорост v (в същата посока), то спрямо нас скоростта му е u = (u' + v) / (1 + u'v/c²). Резултатът никога не надминава c."
          />
          <Example
            description="Кораб се движи с 0,5c и изстрелва сонда напред с 0,5c спрямо себе си. Колко е скоростта на сондата спрямо Земята? А ако вместо сонда изпрати светлинен лъч?"
            steps={['Сонда: u = (0,5 + 0,5) / (1 + 0,25) c = 0,8c, а не 1c', 'Светлина: u = (c + v) / (1 + v/c) = c – точно според втория постулат']}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">7. Маса и енергия: E = mc²</h2>
          <Theorem
            title="Еквивалентност на маса и енергия"
            description="Тяло с маса m в покой има енергия E₀ = mc². Пълната енергия на движещо се тяло е E = γmc², а кинетичната – (γ − 1)mc². Тъй като γ → ∞ при v → c, нито едно тяло с маса не може да достигне скоростта на светлината."
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Защо свети Слънцето?</h3>
            <p>
              В ядрото на Слънцето 4 протона се сливат в едно хелиево ядро (Лекция 11). Хелиевото ядро е с около 0,7% по-леко от четирите
              протона – тази „изчезнала“ маса се превръща в енергия по формулата E = mc². Така Слънцето губи около 4 милиона тона маса всяка
              секунда и въпреки това ще свети още около 5 милиарда години.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">8. СТО в астрономията</h2>
          <Theorem
            title="Релативистки ефект на Доплер"
            description="За източник, който се отдалечава със скорост v = βc по зрителния лъч: λ = λ₀ · √((1 + β) / (1 − β)). При малки скорости това дава познатото Δλ/λ ≈ v/c. (Червеното отместване на далечните галактики е друго – от разширението на пространството, Лекция 28.)"
          />
          <SuperluminalLab />
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <p className="font-semibold mb-1">☄️ Космически лъчи</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Протони с γ над 10¹¹ – най-енергичните частици, наблюдавани във Вселената. За такъв протон Млечният път (100 000 св. г.) е свит до ~3 милиона km и го прелита за ~10 секунди по собствения си часовник!</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <p className="font-semibold mb-1">🛰️ GPS</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Часовниците на спътниците изостават с ~7 µs на ден заради скоростта си (СТО) и избързват с ~45 µs заради по-слабата гравитация
                (обща теория). Без корекцията от +38 µs/ден грешката в позицията би расла с ~10 km на ден.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Специална или обща теория?</h3>
            <p>
              Специалната теория (1905) разглежда равномерно движение без гравитация. Общата теория на относителността (1915) обяснява
              гравитацията като изкривяване на пространство-времето и е нужна за черните дупки, гравитационните лещи (Лекция 29) и
              гравитационните вълни (Лекция 32).
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">9. 🎯 Бърз тест</h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />
            <Task id="a1" number={1} color="border-green-500" question="Кораб лети от Земята със скорост 0,6c. Космонавтът отчита по своя часовник 1 час. Колко време е минало на Земята?">
              <p>γ = 1 / √(1 − 0,6²) = 1 / √0,64 = 1 / 0,8 = 1,25</p>
              <p>Δt = γ · Δt₀ = 1,25 · 1 h = 1,25 h</p>
              <p>
                <strong>Отговор: 1 час и 15 минути</strong>
              </p>
            </Task>
            <Task id="a2" number={2} color="border-green-500" question="Ракета с дължина 100 m в покой лети с 0,8c. Каква дължина ще измери наблюдател на Земята?">
              <p>γ = 1 / √(1 − 0,8²) = 1 / √0,36 = 1 / 0,6 ≈ 1,67</p>
              <p>L = L₀ / γ = 100 m · 0,6 = 60 m</p>
              <p>
                <strong>Отговор: 60 m</strong>
              </p>
            </Task>
            <Task id="a3" number={3} color="border-green-500" question="Може ли нещо да се движи по-бързо от светлината? Как тогава струите на квазарите изглеждат „свръхсветлинни“?">
              <p>
                Нито едно тяло с маса, нито сигнал, не може да надмине c – за това би била нужна безкрайна енергия (γ → ∞). „Свръхсветлинните“
                струи са оптична илюзия: плазма с почти светлинна скорост, насочена почти към нас, почти догонва собствената си светлина, затова
                интервалите между пристигащите сигнали са съкратени и видимата напречна скорост излиза над c.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />
            <Task id="b3" number={4} color="border-yellow-500" question="Мюон със собствено време на живот 2,2 µs се движи със скорост 0,995c. Какво разстояние ще измине средно според наблюдател на Земята? А колко би изминал без релативистки ефекти?">
              <p>v = 0,995 · 3 · 10⁸ ≈ 2,985 · 10⁸ m/s</p>
              <p>Без СТО: d = v · τ₀ = 2,985 · 10⁸ · 2,2 · 10⁻⁶ ≈ 657 m</p>
              <p>γ = 1 / √(1 − 0,995²) = 1 / √0,009975 ≈ 10,0</p>
              <p>Със СТО: d = v · γτ₀ ≈ 657 m · 10,0 ≈ 6,6 km</p>
              <p>
                <strong>Отговор: ≈ 6,6 km вместо ≈ 0,66 km</strong>
              </p>
            </Task>
            <Task id="b4" number={5} color="border-yellow-500" question="Колко енергия се съдържа в 1 g вещество? Сравнете с енергията на 1 килотон тротил (4,2 · 10¹² J).">
              <p>E = mc² = 10⁻³ kg · (3 · 10⁸ m/s)² = 9 · 10¹³ J</p>
              <p>9 · 10¹³ / 4,2 · 10¹² ≈ 21</p>
              <p>
                <strong>Отговор: 9 · 10¹³ J ≈ 21 килотона тротил</strong>
              </p>
            </Task>
            <Task id="b5" number={6} color="border-yellow-500" question="Ако галактика се отдалечаваше от нас със скорост 0,5c (като обикновен Доплеров ефект), на каква дължина на вълната бихме видели линията Hα (656,3 nm)? В кой диапазон е това?">
              <p>λ = λ₀ · √((1 + 0,5) / (1 − 0,5)) = 656,3 · √3 ≈ 656,3 · 1,732 ≈ 1137 nm</p>
              <p>z = λ/λ₀ − 1 ≈ 0,73 – линията е в близкото инфрачервено, невидима за окото.</p>
              <p>Класическата формула Δλ/λ = v/c би дала 984 nm – грешка от ~13%.</p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />
            <Task id="c5" number={7} color="border-red-500" question="Светимостта на Слънцето е L = 3,83 · 10²⁶ W. Колко маса губи Слънцето всяка секунда? Каква част от масата си (M = 2 · 10³⁰ kg) би загубило за 10 милиарда години?">
              <p>Δm/Δt = L / c² = 3,83 · 10²⁶ / 9 · 10¹⁶ ≈ 4,3 · 10⁹ kg/s</p>
              <p>10 милиарда години ≈ 10¹⁰ · 3,16 · 10⁷ s ≈ 3,16 · 10¹⁷ s</p>
              <p>Δm ≈ 4,3 · 10⁹ · 3,16 · 10¹⁷ ≈ 1,4 · 10²⁷ kg</p>
              <p>Δm / M ≈ 1,4 · 10²⁷ / 2 · 10³⁰ ≈ 0,07%</p>
              <p>
                <strong>Отговор: ≈ 4,3 милиона тона в секунда, но само ≈ 0,07% от масата за целия живот</strong>
              </p>
            </Task>
            <Task id="c6" number={8} color="border-red-500" question="Две частици от космическите лъчи се движат една срещу друга, всяка със скорост 0,8c спрямо Земята. С каква скорост се движи едната спрямо другата?">
              <p>Класически: 0,8c + 0,8c = 1,6c – невъзможно!</p>
              <p>Релативистки: u = (u' + v) / (1 + u'v/c²) = (0,8 + 0,8) / (1 + 0,64) c = 1,6 / 1,64 c ≈ 0,976c</p>
              <p>
                <strong>Отговор: ≈ 0,976c</strong>
              </p>
            </Task>
            <Task id="c7" number={9} color="border-red-500" question="Петно в струята на M87 се движи по небето с видима скорост 6c. Видимата скорост е β_вид = β sin θ / (1 − β cos θ). Каква е най-малката истинска скорост на петното и под какъв ъгъл към зрителния лъч трябва да се движи?">
              <p>При дадено β видимата скорост е най-голяма при cos θ = β и е равна на βγ.</p>
              <p>Значи βγ ≥ 6 ⇒ β² / (1 − β²) ≥ 36 ⇒ β ≥ 6 / √37 ≈ 0,986 (γ ≥ √37 ≈ 6,1)</p>
              <p>Ъгъл: cos θ = 0,986 ⇒ θ ≈ 9,5° (tg θ = 1/6)</p>
              <p>Струята е насочена почти към нас и се движи с поне 98,6% от скоростта на светлината.</p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">11. Обобщение</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>
                ✓ <strong>Постулати:</strong> физиката е една и съща за всички инерциални наблюдатели; c е еднаква за всички
              </li>
              <li>
                ✓ <strong>Лоренцов фактор:</strong> γ = 1 / √(1 − v²/c²)
              </li>
              <li>
                ✓ <strong>Забавяне на времето:</strong> Δt = γΔt₀ – мюоните, GPS, близнаците
              </li>
              <li>
                ✓ <strong>Свиване на дължините:</strong> L = L₀ / γ
              </li>
              <li>
                ✓ <strong>Събиране на скоростите:</strong> u = (u' + v) / (1 + u'v/c²) – никога над c
              </li>
              <li>
                ✓ <strong>Маса и енергия:</strong> E = mc² – източникът на енергия на звездите
              </li>
              <li>
                ✓ <strong>В астрономията:</strong> релативистки Доплер, „свръхсветлинни“ струи, космически лъчи
              </li>
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
              Астронавтите на Международната космическа станция се движат с около 7,7 km/s. Само заради скоростта си след 6 месеца в орбита те
              са остарели с около 0,005 секунди по-малко от хората на Земята. Рекордьорът по време в космоса Олег Кононенко (над 1100 дни) е
              „пътувал във времето“ с около 0,03 секунди напред!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
