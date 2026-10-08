import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import CoordinateSphere from './components/CoordinateSphere';
import Task, { TaskBoard, TaskLevel } from '~/Task';

const QUIZ: Question[] = [
  {
    question: 'Коя от координатите НЕ се променя при денонощното въртене?',
    answers: ['Азимут A', 'Височина h', 'Часов ъгъл t', 'Деклинация δ'],
    correctAnswer: 'Деклинация δ',
  },
  {
    question: 'Звезда е в горна кулминация. Колко е часовият ѝ ъгъл?',
    answers: ['0h', '6h', '12h', 'Равен на α'],
    correctAnswer: '0h',
  },
  {
    question: 'На колко градуса отговарят 4h ректасцензия?',
    answers: ['4°', '15°', '60°', '90°'],
    correctAnswer: '60°',
  },
  {
    question: 'Звездното време е S = 10h. Коя звезда кулминира в момента?',
    answers: [
      'Звездата с α = 0h',
      'Звездата с α = 10h',
      'Звездата с δ = 10°',
      'Звездата с t = 10h',
    ],
    correctAnswer: 'Звездата с α = 10h',
  },
  {
    question: 'Звезда има азимут A = 90° и височина h = 0°. Къде е тя?',
    answers: [
      'В зенита',
      'Изгрява в източната точка',
      'Залязва в западната точка',
      'Кулминира на юг',
    ],
    correctAnswer: 'Изгрява в източната точка',
  },
];

const ANALOGY = [
  { earth: 'Екватор', sky: 'Небесен екватор' },
  { earth: 'Географска ширина φ', sky: 'Деклинация δ' },
  { earth: 'Географска дължина λ', sky: 'Ректасцензия α' },
  { earth: 'Нулев меридиан (Гринуич)', sky: 'Пролетна точка ♈' },
  { earth: 'Северен / Южен полюс', sky: 'Полюси на света P / P′' },
];

const SYSTEMS = [
  {
    name: 'Хоризонтална',
    circle: 'Хоризонт',
    origin: 'Северна точка С',
    coords: 'A, h (z)',
    time: 'Да',
    place: 'Да',
  },
  {
    name: 'I екваториална',
    circle: 'Небесен екватор',
    origin: 'Горна точка на екватора Q',
    coords: 't, δ',
    time: 'Само t',
    place: 'Само t (по дължина)',
  },
  {
    name: 'II екваториална',
    circle: 'Небесен екватор',
    origin: 'Пролетна точка ♈',
    coords: 'α, δ',
    time: 'Не',
    place: 'Не',
  },
  {
    name: 'Еклиптична',
    circle: 'Еклиптика',
    origin: 'Пролетна точка ♈',
    coords: 'λ, β',
    time: 'Не',
    place: 'Не',
  },
];

export default function Lecture02() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 2: Небесни координати
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔭 Обаждате се на приятел от другия край на страната: „Виж онази
            ярка звезда вдясно от комина!“ Не става, нали? Неговият комин е
            другаде, а след час звездата също ще е другаде. Астрономите са
            измислили „небесен адрес“, който е еднакъв за всички и не остарява –
            така телескопите по целия свят намират един и същ обект с точност до
            части от ъглова секунда.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Защо са нужни координати?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            От Лекция 1 знаем, че положението на звезда върху небесната сфера се
            определя само от посоката към нея, т.е. от два ъгъла. Всяка
            координатна система избира:
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>основен кръг</strong> (хоризонт, екватор или еклиптика)
                и неговия полюс
              </li>
              <li>
                <strong>начална точка</strong> върху основния кръг, от която
                отчитаме първата координата
              </li>
              <li>
                <strong>посока</strong> на отчитане
              </li>
            </ul>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">🌍 На Земята</th>
                  <th className="p-2 text-left">✨ На небето</th>
                </tr>
              </thead>
              <tbody>
                {ANALOGY.map(row => (
                  <tr
                    key={row.earth}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-2">{row.earth}</td>
                    <td className="p-2 font-semibold">{row.sky}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Хоризонтална координатна система
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Най-интуитивната система: „колко да се завъртя“ и „колко високо да
            погледна“. Точно така работят и азимуталните монтировки на
            телескопите.
          </p>
          <Theorem
            type="definition"
            title="Азимут A"
            description="Ъгълът по хоризонта от северната точка С до вертикалния кръг на звездата, отчитан по посока на часовниковата стрелка (С → И → Ю → З). Изменя се от 0° до 360°. Внимание: в някои учебници азимутът се отчита от южната точка на запад – винаги проверявайте коя е конвенцията!"
          />
          <Theorem
            type="definition"
            title="Височина h и зенитно разстояние z"
            description="Височината h е ъгълът от хоризонта до звездата по вертикалния кръг (от −90° до +90°; отрицателна е за звезди под хоризонта). Зенитното разстояние е ъгълът от зенита до звездата: z = 90° − h."
          />

          <CoordinateSphere initialMode="horizontal" />

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="font-semibold mb-2">⚠️ Недостатък:</p>
            <p>
              Хоризонталните координати се променят непрекъснато заради
              въртенето на Земята и са различни за различните наблюдатели. Те не
              стават за каталози, но са незаменими при самото наблюдение.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Първа екваториална система (t, δ)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Сменяме основния кръг: вместо хоризонта използваме небесния екватор.
            Така едната координата престава да се мени при въртенето на небето –
            звездата се движи по успоредник на екватора и разстоянието ѝ до него
            остава същото.
          </p>
          <Theorem
            type="definition"
            title="Деклинация δ"
            description="Ъгълът от небесния екватор до звездата, мерен по часовия ѝ кръг (кръга през P, P′ и звездата). От +90° (северен полюс) до −90° (южен полюс). Аналог на географската ширина."
          />
          <Theorem
            type="definition"
            title="Часов ъгъл t"
            description="Ъгълът по небесния екватор от горната точка Q на екватора (където той пресича меридиана над хоризонта) до часовия кръг на звездата, отчитан на запад – по посока на видимото денонощно движение. Измерва се в часове: 0h–24h, 1h = 15°."
          />
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">⏰ Защо в часове?</p>
            <p>
              Часовият ъгъл е като стрелка на часовник: расте равномерно с 1h за
              всеки час (звездно време). t = 0h означава, че звездата кулминира
              (на меридиана, най-високо), t = 12h – че е в долна кулминация, а t
              = 3h – че е кулминирала преди 3 часа.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Втора екваториална система (α, δ)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Часовият ъгъл още зависи от времето. Решението: да отчитаме от
            точка, която се върти <em>заедно</em> със звездите – пролетната
            точка ♈. Това е системата на звездните каталози и картите.
          </p>
          <Theorem
            type="definition"
            title="Ректасцензия α"
            description="Ъгълът по небесния екватор от пролетната точка ♈ до часовия кръг на звездата, отчитан на изток – обратно на денонощното движение. От 0h до 24h. Аналог на географската дължина."
          />

          <CoordinateSphere initialMode="equatorial" />

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">✅ Предимство:</p>
            <p>
              α и δ са едни и същи за всички наблюдатели и почти не се променят
              с времето. Бавно се изменят само заради прецесията на земната ос
              (около 50″ годишно) и собственото движение на звездите, затова
              каталозите посочват епоха – например J2000.0.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Звездно време – мостът между системите
          </h2>
          <Theorem
            type="definition"
            title="Звездно време S"
            description="Часовият ъгъл на пролетната точка: S = t♈. За един звезден ден (23h 56m 04s слънчево време) S нараства с 24h."
          />
          <Theorem
            title="Основна формула на звездното време"
            description="За всяко светило в даден момент S = t + α. Следователно светилото кулминира (t = 0), когато звездното време е равно на ректасцензията му: S = α."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Изберете режим „Звездно време S = t + α“ в модела по-горе: трите
            дъги по екватора се събират точно като в равенството.
          </p>
          <Example
            description="В София звездното време е S = 20h 00m. Къде е Вега (α = 18h 37m)?"
            steps={[
              'Часовият ъгъл е t = S − α = 20h 00m − 18h 37m = 1h 23m.',
              'Превръщаме в градуси: 1h 23m = 1,383h × 15°/h ≈ 20,8°.',
              't > 0, значи Вега вече е минала меридиана и е на ~21° западно от него.',
              'Тя е кулминирала преди 1h 23m звездно време – при S = 18h 37m.',
            ]}
          />
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Превръщане часове ↔ градуси</h3>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                1h = 15°
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                1m = 15′
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                1s = 15″
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Еклиптична система (λ, β)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            За Слънцето и планетите е удобно основният кръг да е еклиптиката.
            Еклиптичната дължина λ се мери от ♈ на изток по еклиптиката, а
            еклиптичната ширина β – от еклиптиката към полюса ѝ. Слънцето винаги
            има β = 0°, а λ нараства с около 1° на ден: на 21 юни λ☉ = 90°, на
            23 септември – 180°.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            7. Сравнение на системите
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Система</th>
                  <th className="p-2 text-left">Основен кръг</th>
                  <th className="p-2 text-left">Начало</th>
                  <th className="p-2 text-left">Координати</th>
                  <th className="p-2 text-left">Зависи от времето?</th>
                  <th className="p-2 text-left">Зависи от мястото?</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEMS.map(s => (
                  <tr
                    key={s.name}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-2 font-semibold">{s.name}</td>
                    <td className="p-2">{s.circle}</td>
                    <td className="p-2">{s.origin}</td>
                    <td className="p-2 font-mono">{s.coords}</td>
                    <td className="p-2">{s.time}</td>
                    <td className="p-2">{s.place}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            8. Връзка между хоризонталната и екваториалната система
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Зенитът Z, полюсът P и звездата образуват сферичен триъгълник –
            т.нар. <strong>паралактичен триъгълник</strong>. Страните му са 90°
            − φ (от P до Z), 90° − δ (от P до звездата) и z (от Z до звездата),
            а ъгълът при P е часовият ъгъл t. От сферичната косинусова теорема
            следва:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4 text-center">
            <p className="font-mono text-base sm:text-lg">
              sin h = sin φ · sin δ + cos φ · cos δ · cos t
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">
              Важен частен случай – кулминации
            </h3>
            <p className="mb-2">
              При горна кулминация t = 0 и cos t = 1, откъдето sin h = cos(φ −
              δ), т.е.:
            </p>
            <p className="font-mono text-center mb-2">
              h<sub>горна</sub> = 90° − |φ − δ|
            </p>
            <p>
              Ако δ = φ, звездата минава точно през зенита. Ако δ &lt; φ, тя
              кулминира на юг от зенита, а ако δ &gt; φ – на север от него.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. 🎯 Бърз тест
          </h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            10. 📝 Задачи за упражнение
          </h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />

            <Task
              id="a1"
              number={1}
              color="border-green-500"
              question="Намери зенитното разстояние при h = 40°."
            >
              <p>z = 90° − h = 90° − 40° = 50°.</p>
              <p>
                <strong>Отговор: z = 50°</strong>
              </p>
            </Task>

            <Task
              id="a2"
              number={2}
              color="border-green-500"
              question="Каква е височината на звезда, която е в зенита? А на звезда, която изгрява?"
            >
              <p>
                В зенита z = 0°, следователно h = 90°. При изгрев звездата е на
                хоризонта: h = 0°.
              </p>
            </Task>

            <Task
              id="a3"
              number={3}
              color="border-green-500"
              question="Колко градуса съответстват на 1 час ректасцензия?"
            >
              <p>
                Пълната окръжност е 360° = 24h, следователно 1h = 360° / 24 =
                15°.
              </p>
            </Task>

            <Task
              id="a4"
              number={4}
              color="border-green-500"
              question="Бетелгейзе има ректасцензия α = 5h 55m. Изрази я в градуси."
            >
              <p>5h = 75°; 55m = 55 × 15′ = 825′ = 13,75°.</p>
              <p>
                <strong>Отговор: α ≈ 88,75°</strong>
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task
              id="b1"
              number={5}
              color="border-yellow-500"
              question="Кои координати на една звезда се променят при въртенето на Земята и кои – не?"
            >
              <p>
                <strong>Променят се:</strong> A, h, z (хоризонтални) и часовият
                ъгъл t – всички те се отчитат от точки, свързани с наблюдателя
                (С, Z, Q).
              </p>
              <p>
                <strong>Не се променят:</strong> δ и α. Деклинацията – защото
                звездата се движи успоредно на екватора. Ректасцензията – защото
                се отчита от ♈, която се върти заедно със звездите.
              </p>
            </Task>

            <Task
              id="b2"
              number={6}
              color="border-yellow-500"
              question="Каква трябва да е деклинацията на звезда, за да минава през зенита в София (φ = 42,7°)? Минава ли Вега (δ = +38,8°) през зенита?"
            >
              <p>
                При горна кулминация h = 90° − |φ − δ| = 90° само ако δ = φ ={' '}
                <strong>+42,7°</strong>.
              </p>
              <p>
                За Вега h = 90° − 3,9° = 86,1° – тя минава на 3,9° южно от
                зенита, но не през него.
              </p>
            </Task>

            <Task
              id="b3"
              number={7}
              color="border-yellow-500"
              question="В кой момент (по звездно време) кулминира Сириус (α = 6h 45m, δ = −16,7°) и на каква височина е тогава в София (φ = 42,7°)?"
            >
              <p>
                Кулминацията е при t = 0, т.е. S = α = <strong>6h 45m</strong>.
              </p>
              <p>
                h = 90° − |42,7° − (−16,7°)| = 90° − 59,4° ={' '}
                <strong>30,6°</strong> над южната точка.
              </p>
            </Task>

            <Task
              id="b4"
              number={8}
              color="border-yellow-500"
              question="Звездното време е S = 2h 00m. Звезда има часов ъгъл t = 22h 30m. Каква е ректасцензията ѝ? Кулминирала ли е вече?"
            >
              <p>
                α = S − t = 2h 00m − 22h 30m = −20h 30m → +24h ={' '}
                <strong>3h 30m</strong>.
              </p>
              <p>
                t = 22h 30m = −1h 30m: звездата е на изток от меридиана и ще
                кулминира след 1h 30m – при S = 3h 30m = α ✓.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={9}
              color="border-red-500"
              question="Обясни как от екваториалните координати (α, δ) на звезда се получава височината ѝ h. Какви допълнителни данни са нужни?"
            >
              <p>Нужни са:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>φ</strong> – географската ширина на наблюдателя
                </li>
                <li>
                  <strong>S</strong> – местното звездно време (зависи от момента
                  и географската дължина)
                </li>
              </ul>
              <p>
                Първо намираме t = S − α, после от паралактичния триъгълник: sin
                h = sin φ sin δ + cos φ cos δ cos t.
              </p>
            </Task>

            <Task
              id="c2"
              number={10}
              color="border-red-500"
              question="Наблюдател на φ = 43° с.ш. вижда звезда с δ = +20° при часов ъгъл t = 3h. Намери височината ѝ."
            >
              <p>t = 3h = 45°.</p>
              <p>
                sin h = sin 43° · sin 20° + cos 43° · cos 20° · cos 45° = 0,682
                · 0,342 + 0,731 · 0,940 · 0,707 ≈ 0,233 + 0,486 = 0,719
              </p>
              <p>
                <strong>h ≈ 46,0°</strong>
              </p>
              <p>
                Проверка: при кулминация звездата би била на 90° − 23° = 67°; 3
                часа по-късно е по-ниско – логично.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            11. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>
                ✓ Хоризонталната система (A, h) е интуитивна, но зависи от време
                и място
              </li>
              <li>
                ✓ I екваториална (t, δ): δ е постоянна, t расте с 1h на звезден
                час
              </li>
              <li>
                ✓ II екваториална (α, δ) е универсална – използва се в
                каталозите
              </li>
              <li>✓ h + z = 90°, 1h = 15°</li>
              <li>✓ S = t + α; звездата кулминира, когато S = α</li>
              <li>✓ h при горна кулминация = 90° − |φ − δ|</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Практическо приложение</span>
            </h3>
            <p>
              Любителските телескопи с „GoTo“ монтировка пресмятат точно S = t +
              α: въвеждате дата, час и място, а телескопът сам изчислява часовия
              ъгъл и се насочва. Космическият телескоп Gaia е измерил α и δ на
              близо 2 милиарда звезди с точност до няколко десетки милионни
              части от ъгловата секунда – толкова голяма изглежда монета,
              оставена на Луната.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
