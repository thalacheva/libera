import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import HohmannTransfer from './components/HohmannTransfer';
import OrbitAltitudeExplorer from './components/OrbitAltitudeExplorer';
import Task, { TaskBoard, TaskLevel } from './components/Task';
import VisVivaLab from './components/VisVivaLab';

const QUIZ: Question[] = [
  {
    question:
      'Как се променя скоростта на спътник по кръгова орбита, ако орбитата е по-висока?',
    answers: [
      'Расте',
      'Намалява',
      'Не се променя',
      'Зависи от масата на спътника',
    ],
    correctAnswer: 'Намалява',
  },
  {
    question:
      'Колко пъти скоростта за бягство е по-голяма от кръговата скорост на същото разстояние?',
    answers: ['2 пъти', '√2 пъти', '1,5 пъти', '4 пъти'],
    correctAnswer: '√2 пъти',
  },
  {
    question:
      'Тяло е изстреляно хоризонтално със скорост между v₁ и v₂. По каква траектория ще се движи?',
    answers: ['Окръжност', 'Елипса', 'Парабола', 'Хипербола'],
    correctAnswer: 'Елипса',
  },
  {
    question: 'Колко трае полетът до Марс по преход на Хоман?',
    answers: ['3 дни', '~1 месец', '~8,5 месеца', '~2 години'],
    correctAnswer: '~8,5 месеца',
  },
  {
    question:
      'Космически кораб иска да догони МКС, която е пред него на същата орбита. Какво трябва да направи първо?',
    answers: [
      'Да увеличи скоростта си',
      'Да намали скоростта си',
      'Да се насочи право към станцията',
      'Нищо – ще я настигне сам',
    ],
    correctAnswer: 'Да намали скоростта си',
  },
];

const ESCAPE = [
  { name: 'Луна', v: '2,4', note: '0,21 × Земя' },
  { name: 'Марс', v: '5,0', note: '0,45 × Земя' },
  { name: 'Земя', v: '11,2', note: '1' },
  { name: 'Юпитер', v: '59,5', note: '5,3 × Земя' },
  { name: 'Слънце (от повърхността)', v: '618', note: '55 × Земя' },
  { name: 'Неутронна звезда', v: '~190 000', note: '~0,6 c' },
];

export default function Lecture08() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 8: Орбити и скорости
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🛰️ 4 октомври 1957 г.: малка метална топка с антени – „Спутник-1“ –
            обикаля Земята за 96 минути и всеки, който има радио, чува нейното
            „бип-бип“. За да не падне, тя се движи с почти 8 km/s – десетки пъти
            по-бързо от куршум. Откъде идва точно това число? И защо, за да
            догоните някого в орбита, трябва… да намалите скоростта?
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Кръгова орбитална скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Спътникът по орбита непрекъснато пада към Земята, но се движи
            хоризонтално толкова бързо, че повърхността „бяга“ под него (топът
            на Нютон, Лекция 6). При кръгова орбита гравитацията играе ролята на
            центростремителна сила.
          </p>
          <Theorem
            title="Кръгова (първа космическа) скорост"
            description="От GMm / r² = m·v² / r следва v = √(GM / r). На повърхността на Земята (r = R) това е първата космическа скорост v₁ = √(GM / R) = √(gR) ≈ 7,9 km/s. Периодът е T = 2πr / v = 2π·√(r³ / GM) – третият закон на Кеплер."
          />

          <OrbitAltitudeExplorer />

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Познати орбити</h3>
            <ul className="text-sm space-y-2">
              <li>
                🛰️ <strong>МКС</strong> (~408 km): v ≈ 7,66 km/s, T ≈ 92 min
              </li>
              <li>
                📡 <strong>GPS</strong> (20 200 km): v ≈ 3,87 km/s, T ≈ 12 h
              </li>
              <li>
                📺 <strong>Геостационарна</strong> (35 786 km над екватора): v ≈
                3,07 km/s, T = 23h 56m – спътникът „виси“ над една точка
              </li>
              <li>
                🌙 <strong>Луната</strong> (384 400 km): v ≈ 1,02 km/s, T ≈ 27,3
                дни
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Скорост за бягство и форма на орбитата
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Каква скорост е нужна, за да напуснем Земята завинаги? Тялото трябва
            да има достатъчно кинетична енергия, за да преодолее гравитационната
            потенциална енергия −GMm/r.
          </p>
          <Theorem
            title="Скорост за бягство (втора космическа скорост)"
            description="От ½·m·v² − GMm/r = 0 следва v₂ = √(2GM / r) = √2 · v₁. За Земята v₂ ≈ 11,2 km/s. Тя не зависи от масата на тялото и от посоката на изстрелване."
          />
          <Theorem
            title="Уравнение vis-viva"
            description="Скоростта на тяло по всяка Кеплерова орбита с голяма полуос a на разстояние r от центъра е v² = GM·(2/r − 1/a). При кръгова орбита a = r и v² = GM/r; при парабола a → ∞ и v² = 2GM/r."
          />

          <VisVivaLab />

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Начална скорост</th>
                  <th className="p-2 text-left">Енергия</th>
                  <th className="p-2 text-left">Орбита</th>
                  <th className="p-2 text-left">e</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['v = v₁', 'ε < 0', 'окръжност', '0'],
                  ['v₁ < v < v₂', 'ε < 0', 'елипса', '0 < e < 1'],
                  ['v = v₂', 'ε = 0', 'парабола', '1'],
                  ['v > v₂', 'ε > 0', 'хипербола', '> 1'],
                ].map(row => (
                  <tr
                    key={row[0]}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    {row.map(cell => (
                      <td key={cell} className="p-2 font-mono">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">
              Скорост за бягство от различни тела
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {ESCAPE.map(row => (
                  <tr
                    key={row.name}
                    className="border-t border-green-200 dark:border-green-800"
                  >
                    <td className="py-1">{row.name}</td>
                    <td className="py-1 text-right font-mono font-bold">
                      {row.v} km/s
                    </td>
                    <td className="py-1 text-right text-gray-600 dark:text-gray-400">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm mt-2">
              Ако v₂ стане равна на скоростта на светлината c, нищо не може да
              избяга – това е черна дупка (Лекция 21). Радиусът ѝ е R = 2GM /
              c².
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Третата космическа скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            За да напусне Слънчевата система, тялото трябва да избяга и от
            Слънцето. На разстоянието на Земята скоростта за бягство от Слънцето
            е √2 · 29,8 ≈ 42,1 km/s. Земята обаче вече ни носи с 29,8 km/s!
          </p>
          <Example
            description="Колко е минималната скорост на изстрелване от Земята, за да напуснем Слънчевата система?"
            steps={[
              'Изстрелваме по посоката на движение на Земята. Далеч от Земята ни трябват 42,1 − 29,8 ≈ 12,3 km/s спрямо нея.',
              'При излитането трябва да преодолеем и привличането на Земята. По закона за запазване на енергията: v₃² = v₂² + 12,3².',
              'v₃ = √(11,2² + 12,3²) ≈ 16,6 km/s – третата космическа скорост.',
              'Ако изстрелваме срещу движението на Земята, ще ни трябват над 70 km/s! Посоката е от огромно значение.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Полети до други планети
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Космическите кораби не летят „направо“ – те се движат по Кеплерови
            орбити около Слънцето и двигателите им работят само за кратко.
          </p>

          <HohmannTransfer />

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Преход на Хоман</strong> – елипса с перихелий на едната
                орбита и афелий на другата. Нужни са само два импулса на
                двигателя.
              </li>
              <li>
                <strong>Стартови прозорци</strong> – до Марс може да се полети
                удобно само веднъж на ~26 месеца, когато планетите са в правилно
                взаимно положение (синодичният период).
              </li>
              <li>
                <strong>Гравитационна прашка</strong> – при прелитане край
                планета корабът „открадва“ малко от орбиталната ѝ скорост. Така
                „Вояджър 2“ посети Юпитер, Сатурн, Уран и Нептун.
              </li>
            </ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">
              🤯 Парадоксът на орбиталната гонитба
            </p>
            <p>
              Ако ускорите напред, орбитата ви става по-висока и по-дълга – и
              вие изоставате! За да догоните МКС пред вас, трябва да спирачите:
              слизате на по-ниска и по-бърза орбита, изпреварвате я и после
              ускорявате, за да се изравните. Така се скачват всички кораби.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. 🎯 Бърз тест
          </h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. 📝 Задачи за упражнение
          </h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />

            <Task
              id="a1"
              number={1}
              color="border-green-500"
              question="Каква е първата космическа скорост за Земята и какво означава тя?"
            >
              <p className="font-semibold">
                Отговор: v₁ ≈ 7,9 km/s (~28 400 km/h)
              </p>
              <p>
                Това е скоростта на кръгова орбита точно над повърхността (без
                да отчитаме атмосферата). При по-малка хоризонтална скорост
                тялото пада обратно на Земята.
              </p>
            </Task>

            <Task
              id="a2"
              number={2}
              color="border-green-500"
              question="Защо МКС трябва да се движи толкова бързо?"
            >
              <p>
                МКС се движи с ~7,66 km/s, за да е по кръгова орбита: тогава
                центростремителното ускорение v²/r е точно равно на
                гравитационното на тази височина.
              </p>
              <p>
                Ако се движеше по-бавно, щеше да слезе по елипса и да навлезе в
                атмосферата. Станцията е в постоянно свободно падане около
                Земята.
              </p>
            </Task>

            <Task
              id="a3"
              number={3}
              color="border-green-500"
              question="Защо телевизионните спътници изглеждат неподвижни на небето?"
            >
              <p>
                Те са на геостационарна орбита – над екватора, на ~35 800 km
                височина. Периодът им е точно едно звездно денонощие и те
                обикалят в посоката на въртене на Земята. Затова „висят“ над
                една точка и антените не трябва да се завъртат.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task
              id="b1"
              number={4}
              color="border-yellow-500"
              question="Изчисли орбиталната скорост и периода на спътник на височина 400 km (R = 6371 km, GM = 3,986·10¹⁴ m³/s²)."
            >
              <p>r = 6371 + 400 = 6771 km = 6,771·10⁶ m</p>
              <p>
                v = √(GM / r) = √(3,986·10¹⁴ / 6,771·10⁶) = √(5,887·10⁷) ≈ 7670
                m/s
              </p>
              <p>T = 2πr / v = 2π · 6,771·10⁶ / 7670 ≈ 5550 s ≈ 92,5 min</p>
              <p>
                <strong>Отговор: 7,67 km/s и ~92 минути</strong> – 15–16
                обиколки на ден.
              </p>
            </Task>

            <Task
              id="b2"
              number={5}
              color="border-yellow-500"
              question="Докажи, че скоростта за бягство е √2 пъти по-голяма от кръговата скорост на същото разстояние."
            >
              <p>Кръгова: GMm / r² = mv₁² / r → v₁ = √(GM / r).</p>
              <p>Бягство: ½mv₂² = GMm / r → v₂ = √(2GM / r).</p>
              <p>v₂ / v₁ = √2 ≈ 1,414. За Земята: 11,2 / 7,9 ≈ 1,42 ✓</p>
            </Task>

            <Task
              id="b3"
              number={6}
              color="border-yellow-500"
              question="Изчисли скоростта за бягство от Луната (M = 7,35·10²² kg, R = 1737 km). Защо Луната няма атмосфера?"
            >
              <p>
                v₂ = √(2GM / R) = √(2 · 6,674·10⁻¹¹ · 7,35·10²² / 1,737·10⁶) ≈
                √(5,65·10⁶) ≈ <strong>2,38 km/s</strong>
              </p>
              <p>
                Молекулите на газовете при дневната температура на Луната (~120
                °C) се движат средно с ~0,5 km/s, а най-бързите от тях
                надвишават 2,4 km/s. За милиарди години атмосферата е избягала в
                космоса.
              </p>
            </Task>

            <Task
              id="b4"
              number={7}
              color="border-yellow-500"
              question="Спътник се движи по елипса с перигей на височина 300 km и апогей 35 786 km. Каква е скоростта му в перигея? (Използвай vis-viva.)"
            >
              <p>rₚ = 6671 km, rₐ = 42 157 km, a = (rₚ + rₐ) / 2 = 24 414 km</p>
              <p>
                v² = GM(2/rₚ − 1/a) = 398 600 · (2/6671 − 1/24 414) ≈ 398 600 ·
                2,589·10⁻⁴ ≈ 103,2
              </p>
              <p>
                <strong>vₚ ≈ 10,16 km/s</strong> – с 2,43 km/s повече от
                кръговата скорост на 300 km (7,73 km/s).
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={8}
              color="border-red-500"
              question="Астронавт на МКС (h = 400 km, T ≈ 92,5 min) хвърля топка напред със скорост 1 m/s спрямо станцията. Къде ще е топката след една обиколка?"
            >
              <p>
                Топката получава Δv = +1 m/s и тръгва по елипса с перигей в
                точката на хвърлянето. Голямата ѝ полуос нараства с Δa = 2a·Δv /
                v = 2 · 6771 km · 1 / 7670 ≈ 1,77 km.
              </p>
              <p>
                След половин обиколка тя е ~3,5 km <em>по-високо</em> от
                станцията (в апогея).
              </p>
              <p>
                Периодът ѝ е по-дълъг: ΔT / T = 1,5 · Δa / a ≈ 3,9·10⁻⁴, т.е. ΔT
                ≈ 2,2 s. След една обиколка топката се връща на височината на
                МКС, но <strong>изостава зад нея с ~3·Δv·T ≈ 17 km</strong>!
              </p>
              <p>
                Парадокс: хвърлена напред, топката се озовава отзад. Хвърлена
                назад, ще изпревари станцията.
              </p>
            </Task>

            <Task
              id="c2"
              number={9}
              color="border-red-500"
              question="Изведи третата космическа скорост (v₃ ≈ 16,6 km/s), като знаеш, че Земята обикаля Слънцето с 29,8 km/s, а v₂ = 11,2 km/s."
            >
              <p>
                Скорост за бягство от Слънцето на 1 AU: √2 · 29,8 ≈ 42,1 km/s.
                Изстрелвайки по посоката на Земята, извън земното притегляне ни
                трябват v∞ = 42,1 − 29,8 = 12,3 km/s.
              </p>
              <p>
                Енергия на единица маса при старта: ½v₃² − GM⊕/R = ½v∞², а GM⊕/R
                = ½v₂².
              </p>
              <p>
                v₃ = √(v₂² + v∞²) = √(11,2² + 12,3²) ≈{' '}
                <strong>16,6 km/s</strong>
              </p>
            </Task>

            <Task
              id="c3"
              number={10}
              color="border-red-500"
              question="Кораб лети до Марс (a = 1,524 AU) по преход на Хоман. Колко трае полетът? Под какъв ъгъл пред Земята трябва да е Марс при старта и колко често се повтаря такава възможност?"
            >
              <p>a_пр = (1 + 1,524) / 2 = 1,262 AU</p>
              <p>t = ½ · a^(3/2) = ½ · 1,262^1,5 ≈ 0,709 години ≈ 259 дни</p>
              <p>
                За това време Марс изминава 360° · 0,709 / 1,881 ≈ 136°. Той
                трябва да пристигне в точката, противоположна на старта (180°),
                значи при старта е <strong>~44° пред Земята</strong>.
              </p>
              <p>
                Същото взаимно положение се повтаря през синодичния период: 1/S
                = 1 − 1/1,881 → S ≈ 2,14 години ≈ <strong>26 месеца</strong>.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            7. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Кръгова скорост v = √(GM/r); по-високо = по-бавно</li>
              <li>✓ Скорост за бягство v₂ = √(2GM/r) = √2·v₁</li>
              <li>✓ Vis-viva: v² = GM(2/r − 1/a)</li>
              <li>✓ Земя: v₁ = 7,9 km/s, v₂ = 11,2 km/s, v₃ = 16,6 km/s</li>
              <li>
                ✓ Окръжност (e = 0), елипса (0 &lt; e &lt; 1), парабола (e = 1),
                хипербола (e &gt; 1)
              </li>
              <li>
                ✓ Полетите до планетите са по Кеплерови орбити – преход на Хоман
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
              Астронавтите на МКС виждат по 16 изгрева и залеза на ден. „Вояджър
              1“, изстрелян през 1977 г., се движи с ~17 km/s спрямо Слънцето и
              през 2012 г. стана първият човешки апарат в междузвездното
              пространство. Въпреки това до най-близката звезда ще му трябват
              над 70 000 години.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
