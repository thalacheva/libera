import { useState } from 'react';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import FoucaultPendulum from './components/FoucaultPendulum';
import SeasonsExplorer from './components/SeasonsExplorer';
import SiderealSolarDay from './components/SiderealSolarDay';
import Task from './components/Task';

const QUIZ: Question[] = [
  {
    question: 'Коя е основната причина за сезоните?',
    answers: [
      'Промяната на разстоянието до Слънцето',
      'Наклонът на земната ос спрямо орбитата',
      'Промяната на скоростта на Земята',
      'Слънчевата активност',
    ],
    correctAnswer: 'Наклонът на земната ос спрямо орбитата',
  },
  {
    question: 'Кога Земята е най-близо до Слънцето?',
    answers: ['Около 21 юни', 'Около 20 март', 'Около 3 януари', 'Около 4 юли'],
    correctAnswer: 'Около 3 януари',
  },
  {
    question: 'Кое денонощие е по-дълго?',
    answers: ['Звездното', 'Слънчевото', 'Еднакви са', 'Зависи от сезона'],
    correctAnswer: 'Слънчевото',
  },
  {
    question: 'На каква ширина е северният полярен кръг?',
    answers: ['23,4°', '45°', '66,6°', '90°'],
    correctAnswer: '66,6°',
  },
  {
    question: 'Какво прави махалото на Фуко на екватора?',
    answers: [
      'Равнината му се завърта за 24 часа',
      'Равнината му се завърта за 48 часа',
      'Равнината му не се завърта',
      'Спира да се люлее',
    ],
    correctAnswer: 'Равнината му не се завърта',
  },
];

const KEY_MOMENTS = [
  {
    name: 'Пролетно равноденствие',
    date: '≈20 март',
    dec: '0°',
    noon: '47,3°',
    day: '≈12h',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Лятно слънцестоене',
    date: '≈21 юни',
    dec: '+23,4°',
    noon: '70,7°',
    day: '15h 09m',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    name: 'Есенно равноденствие',
    date: '≈22 септември',
    dec: '0°',
    noon: '47,3°',
    day: '≈12h',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: 'Зимно слънцестоене',
    date: '≈21 декември',
    dec: '−23,4°',
    noon: '23,9°',
    day: '8h 51m',
    color: 'text-blue-600 dark:text-blue-400',
  },
];

export default function Lecture03() {
  const [showSolutions, setShowSolutions] = useState<{
    [key: string]: boolean;
  }>({});

  const task = (id: string) => ({
    id,
    shown: !!showSolutions[id],
    onToggle: (taskId: string) =>
      setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] })),
  });

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 3: Движение на Земята
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed mb-4">
            🚀 Седите неподвижно и четете тези редове. Всъщност в момента:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">340 m/s</div>
              <div className="text-sm opacity-80">
                около земната ос (в България)
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">30 km/s</div>
              <div className="text-sm opacity-80">около Слънцето</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">230 km/s</div>
              <div className="text-sm opacity-80">
                заедно със Слънцето около центъра на Галактиката
              </div>
            </div>
          </div>
          <p className="mt-4 opacity-90">
            Защо тогава не усещаме нищо? И как хората са доказали, че се движим,
            преди да има космически кораби?
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Въртене около оста
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земята се върти около въображаема ос, минаваща през северния и южния
            географски полюс, от <strong>запад на изток</strong> – обратно на
            часовниковата стрелка, ако гледаме от Северния полюс. Затова
            Слънцето и звездите изгряват на изток и залязват на запад.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Характеристики:</h3>
            <ul className="text-sm sm:text-base space-y-2">
              <li>
                <strong>Период спрямо звездите:</strong> 23h 56m 04s (звездно
                денонощие)
              </li>
              <li>
                <strong>Ъглова скорост:</strong> 15° на час – еднаква за всички
                точки
              </li>
              <li>
                <strong>Линейна скорост на екватора:</strong> около 1670 km/h
                (465 m/s)
              </li>
              <li>
                <strong>Следствия:</strong> смяна на ден и нощ, видимо денонощно
                движение на небето, сплескване на Земята при полюсите
              </li>
            </ul>
          </div>

          <Theorem
            title="Линейна скорост на въртене"
            description="Точка на географска ширина φ описва окръжност с радиус R·cos φ около земната ос. Затова линейната ѝ скорост е v = 2πR·cos φ / T, където T = 23h 56m е звездното денонощие. На екватора v ≈ 465 m/s, а на полюсите v = 0."
          />
          <Example
            description="С каква скорост се движи София (φ = 42,7°) заради въртенето на Земята?"
            steps={[
              'Скоростта на екватора е v₀ = 2πR / T = 2π · 6378 km / 23,93 h ≈ 1674 km/h ≈ 465 m/s.',
              'Радиусът на успоредника на София е R·cos 42,7° ≈ 0,735·R.',
              'v = v₀ · cos φ ≈ 465 · 0,735 ≈ 342 m/s ≈ 1230 km/h – по-бързо от звука!',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Как знаем, че Земята се върти?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Видимото движение на небето може да се обясни и с въртене на небето
            около неподвижна Земя. Има обаче опити, при които въртенето се
            вижда, без изобщо да поглеждаме към небето.
          </p>

          <FoucaultPendulum />

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🕰️ Махалото на Фуко</h3>
              <p className="text-sm">
                През 1851 г. Леон Фуко окачва 67-метрово махало в Пантеона в
                Париж. Равнината на люлеене бавно се завърта – всъщност се върти
                подът под нея. На полюса оборотът е за 23h 56m, а на екватора
                въртене няма.
              </p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🌀 Силата на Кориолис</h3>
              <p className="text-sm">
                Движещите се тела във въртяща се система се отклоняват – в
                северното полукълбо надясно. Затова циклоните тук се въртят
                обратно на часовниковата стрелка, а пасатите духат от
                североизток.
              </p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🥏 Сплескването</h3>
              <p className="text-sm">
                Въртенето „издува“ Земята при екватора: екваториалният радиус е
                6378 km, а полярният – 6357 km. Затова на полюса тежим с около
                0,5% повече, отколкото на екватора.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Звездно и слънчево денонощие
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Ако Земята се завърта за 23h 56m, откъде идват нашите 24 часа?
            Проследете една обиколка стъпка по стъпка:
          </p>

          <SiderealSolarDay />

          <Theorem
            title="Връзка между звездното и слънчевото денонощие"
            description="За една година Земята прави спрямо звездите с един оборот повече, отколкото спрямо Слънцето: 366,26 звездни срещу 365,26 слънчеви денонощия. Следователно T☉ = T★ · 366,26 / 365,26, а разликата е около 3m 56s."
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Обикаляне около Слънцето
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земята обикаля около Слънцето по почти кръгова елипса, в същата
            посока, в която се върти около оста си – обратно на часовниковата
            стрелка, гледано от север.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Характеристики на орбитата:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Звездна година</strong> (спрямо звездите): 365,2564
                денонощия
              </li>
              <li>
                <strong>Тропична година</strong> (между две пролетни
                равноденствия): 365,2422 денонощия – по нея се прави календарът
              </li>
              <li>
                <strong>Средно разстояние:</strong> 149,6 млн. km = 1
                астрономическа единица (AU)
              </li>
              <li>
                <strong>Перихелий:</strong> 147,1 млн. km (≈3 януари), скорост
                30,3 km/s
              </li>
              <li>
                <strong>Афелий:</strong> 152,1 млн. km (≈4 юли), скорост 29,3
                km/s
              </li>
              <li>
                <strong>Ексцентрицитет:</strong> e = 0,0167 – разликата в
                разстоянието е само 3%
              </li>
            </ul>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">
              🔍 Доказателства за обикалянето
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Аберация на светлината</strong> (Брадли, 1727): звездите
                описват годишно малки елипси с размер до 20,5″, защото Земята се
                движи напреко на лъчите им.
              </li>
              <li>
                <strong>Годишен паралакс</strong> (Бесел, 1838): близките звезди
                се изместват на фона на далечните, защото ги гледаме от различни
                точки на орбитата.
              </li>
              <li>
                <strong>Доплеров ефект:</strong> спектралните линии на звездите
                близо до еклиптиката се изместват периодично с година период.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Наклон на земната ос и сезони
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земната ос сключва ъгъл <strong>ε = 23°26′ ≈ 23,4°</strong> с
            перпендикуляра към равнината на орбитата и сочи винаги в една и съща
            посока в пространството – към Полярната звезда. Затова през годината
            ту северното, ту южното полукълбо е обърнато към Слънцето.
          </p>

          <SeasonsExplorer />

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">⚠️ Честа грешка</h3>
            <p className="mb-2">
              Сезоните НЕ се дължат на промяната в разстоянието до Слънцето.
              Земята е най-близо до него в началото на януари – посред зимата в
              северното полукълбо. Ако разстоянието беше причината, сезоните в
              двете полукълба щяха да съвпадат, а те са обратни.
            </p>
            <p>
              Сезоните се дължат на <strong>височината на Слънцето</strong> (под
              какъв ъгъл падат лъчите) и на{' '}
              <strong>продължителността на деня</strong>.
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3">
            Четирите важни момента (за София, φ = 42,7°)
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Момент</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">δ☉</th>
                  <th className="p-2 text-left">h по пладне</th>
                  <th className="p-2 text-left">Ден</th>
                </tr>
              </thead>
              <tbody>
                {KEY_MOMENTS.map(m => (
                  <tr
                    key={m.name}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className={`p-2 font-semibold ${m.color}`}>{m.name}</td>
                    <td className="p-2">{m.date}</td>
                    <td className="p-2 font-mono">{m.dec}</td>
                    <td className="p-2 font-mono">{m.noon}</td>
                    <td className="p-2 font-mono">{m.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Продължителността е геометрична – без атмосферната рефракция и
              размера на слънчевия диск, които удължават деня с около 10–15
              минути.
            </p>
          </div>

          <Theorem
            title="Продължителност на деня"
            description="Слънцето изгрява и залязва при часов ъгъл t₀, за който cos t₀ = −tg φ · tg δ☉. Продължителността на деня е 2t₀ (в часове: 2t₀ / 15°). Ако −tg φ · tg δ☉ < −1, Слънцето не залязва (полярен ден), а ако е > 1 – не изгрява (полярна нощ)."
          />

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🌴 Тропици (φ = ±23,4°)</h3>
              <p className="text-sm">
                Най-далечните ширини, на които Слънцето може да е в зенита по
                пладне. На Тропика на Рака това става на 21 юни.
              </p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">
                🧊 Полярни кръгове (φ = ±66,6°)
              </h3>
              <p className="text-sm">
                90° − 23,4° = 66,6°. Отвъд тях поне веднъж годишно има полярен
                ден и полярна нощ. Изберете „Северен полярен кръг“ в
                лабораторията и сравнете юни с декември!
              </p>
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">🤓 Знаете ли, че…</p>
            <p>
              Лятното полугодие в северното полукълбо (от 20 март до 22
              септември) е с около 7 дни по-дълго от зимното. Причината е, че
              през юли Земята е най-далеч от Слънцето и се движи най-бавно по
              орбитата си (II закон на Кеплер).
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Прецесия
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Земната ос не е съвсем неподвижна: като ос на наклонен пумпал тя
            описва конус с период около <strong>25 800 години</strong>.
            Причината е привличането на Слънцето и Луната върху екваториалната
            „издутина“ на Земята.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Следствия от прецесията:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Полюсът на света описва кръг с радиус 23,4° сред звездите. Около
                2800 г. пр.н.е. полярна е била Тубан (α Дракон), а след около 12
                000 години полюсът ще е близо до Вега.
              </li>
              <li>
                Пролетната точка ♈ се измества по еклиптиката на запад с около
                50″ годишно – затова каталозите посочват епоха (J2000.0).
              </li>
              <li>
                Тропичната година е с около 20 минути по-къса от звездната.
              </li>
              <li>
                Пролетната точка вече не е в съзвездието Овен, а в Риби –
                знаците на зодиака не съответстват на съзвездията.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            7. ✅ Провери се
          </h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            8. 📝 Задачи за упражнение
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
              Ниво А (Областен кръг)
            </h3>

            <Task
              {...task('a1')}
              number={1}
              color="border-green-500"
              question="Колко трае едно звездно денонощие?"
            >
              <p className="font-semibold">Отговор: 23h 56m 04s</p>
              <p>
                Това е времето за един пълен оборот на Земята спрямо далечните
                звезди. То е с около 4 минути по-кратко от слънчевото денонощие
                (24h), защото Земята се движи и по орбитата си.
              </p>
            </Task>

            <Task
              {...task('a2')}
              number={2}
              color="border-green-500"
              question="В каква посока се върти Земята около оста си?"
            >
              <p className="font-semibold">Отговор: от запад на изток</p>
              <p>
                Гледано от Северния полюс – обратно на часовниковата стрелка.
                Затова небесните тела изглеждат, че изгряват на изток и залязват
                на запад.
              </p>
            </Task>

            <Task
              {...task('a3')}
              number={3}
              color="border-green-500"
              question="Колко градуса е наклонена земната ос спрямо перпендикуляра към равнината на орбитата?"
            >
              <p className="font-semibold">Отговор: 23°26′ ≈ 23,4°</p>
              <p>
                Ако оста беше перпендикулярна на орбитата, нямаше да има сезони.
              </p>
            </Task>

            <Task
              {...task('a4')}
              number={4}
              color="border-green-500"
              question="На каква височина е Слънцето по пладне в София (φ = 42,7°) на 21 юни и на 21 декември?"
            >
              <p>h = 90° − φ + δ☉.</p>
              <p>
                21 юни: h = 90° − 42,7° + 23,4° = <strong>70,7°</strong>.
              </p>
              <p>
                21 декември: h = 90° − 42,7° − 23,4° = <strong>23,9°</strong>.
              </p>
              <p>
                Разликата е 2ε = 46,9° – проверете с лабораторията „Сезони“.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
              Ниво В (Национален кръг)
            </h3>

            <Task
              {...task('b1')}
              number={5}
              color="border-yellow-500"
              question="Сравни слънчевото и звездното денонощие. Защо има разлика?"
            >
              <p>
                <strong>Слънчево денонощие:</strong> 24h – между две
                последователни кулминации на Слънцето.
              </p>
              <p>
                <strong>Звездно денонощие:</strong> 23h 56m 04s – един оборот
                спрямо звездите.
              </p>
              <p>
                За едно денонощие Земята изминава ~360°/365 ≈ 1° от орбитата си.
                За да „настигне“ Слънцето, тя трябва да се завърти с още ~1°,
                което при 15°/h отнема ~4 минути.
              </p>
            </Task>

            <Task
              {...task('b2')}
              number={6}
              color="border-yellow-500"
              question="Изчисли линейната скорост на точка от екватора заради въртенето на Земята (R = 6371 km)."
            >
              <p>
                Използваме звездното денонощие T = 23h 56m ≈ 23,93 h (оборот
                спрямо звездите, а не спрямо Слънцето).
              </p>
              <p>v = 2πR / T = 2π · 6371 km / 23,93 h ≈ 40 030 km / 23,93 h</p>
              <p>
                <strong>v ≈ 1673 km/h ≈ 465 m/s</strong>
              </p>
            </Task>

            <Task
              {...task('b3')}
              number={7}
              color="border-yellow-500"
              question="Земята е най-близо до Слънцето през януари. Защо тогава в България е зима?"
            >
              <p>
                Разстоянието се променя само с ~3%, което променя облъчването с
                ~7%. Много по-важни са височината на Слънцето и
                продължителността на деня.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>През зимата северното полукълбо е наклонено от Слънцето</li>
                <li>
                  Слънцето е ниско (23,9° в София) → лъчите се разпределят на
                  по-голяма площ
                </li>
                <li>Денят е кратък (~9h) → по-малко време за нагряване</li>
              </ul>
              <p>
                В южното полукълбо по същото време е лято – доказателство, че
                разстоянието не е причината.
              </p>
            </Task>

            <Task
              {...task('b4')}
              number={8}
              color="border-yellow-500"
              question="За колко време ще направи пълен оборот равнината на махало на Фуко в София (φ = 42,7°)?"
            >
              <p>
                T = T★ / sin φ = 23,93 h / sin 42,7° = 23,93 / 0,678 ≈{' '}
                <strong>35,3 h</strong>
              </p>
              <p>За час равнината се завърта с 15° · sin φ ≈ 10,2°.</p>
            </Task>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
              Ниво С (Международна олимпиада)
            </h3>

            <Task
              {...task('c1')}
              number={9}
              color="border-red-500"
              question="Ако наклонът на земната ос беше 0°, как би се променил климатът на Земята?"
            >
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Нямаше да има сезони</strong> – всеки ден би бил като
                  равноденствие (δ☉ = 0° винаги).
                </li>
                <li>Денят би траял 12 часа навсякъде (освен на полюсите).</li>
                <li>
                  На полюсите Слънцето постоянно би обикаляло по хоризонта.
                </li>
                <li>
                  Височината на Слънцето по пладне би била 90° − φ целогодишно,
                  така че климатът би зависел само от ширината.
                </li>
                <li>
                  Остава малка годишна промяна заради ексцентрицитета (~7% в
                  облъчването), еднаква за двете полукълба.
                </li>
              </ul>
            </Task>

            <Task
              {...task('c2')}
              number={10}
              color="border-red-500"
              question="Изчисли средната орбитална скорост на Земята (1 AU = 149,6 млн. km, 1 година = 365,26 денонощия)."
            >
              <p>Приемаме орбитата за окръжност.</p>
              <p>L = 2πr = 2π · 149,6 млн. km ≈ 940 млн. km</p>
              <p>T = 365,26 · 24 h ≈ 8766 h</p>
              <p>
                v = L / T ≈ 107 200 km/h ≈ <strong>29,8 km/s</strong>
              </p>
              <p>Около 87 пъти по-бързо от звука във въздуха!</p>
            </Task>

            <Task
              {...task('c3')}
              number={11}
              color="border-red-500"
              question="Пресметни продължителността на най-дългия ден в София (φ = 42,7°). Защо измерената стойност (~15h 20m) е по-голяма?"
            >
              <p>
                На 21 юни δ☉ = +23,4°: cos t₀ = −tg 42,7° · tg 23,4° = −0,923 ·
                0,433 ≈ −0,400.
              </p>
              <p>
                t₀ ≈ 113,6° = 7,57 h, денят е 2t₀ ≈ 15,15 h ={' '}
                <strong>15h 09m</strong>.
              </p>
              <p>
                В действителност изгревът и залезът се отчитат по горния край на
                слънчевия диск (радиус ~16′), а атмосферната рефракция повдига
                Слънцето с ~35′ на хоризонта. Затова Слънцето изгрява по-рано и
                залязва по-късно – с общо около 10 минути.
              </p>
            </Task>

            <Task
              {...task('c4')}
              number={12}
              color="border-red-500"
              question="Наклонът на оста на Марс е 25,2°. На каква ширина са марсианските полярни кръгове и тропици? Има ли Марс сезони?"
            >
              <p>
                Тропици: φ = ±25,2°. Полярни кръгове: φ = ±(90° − 25,2°) ={' '}
                <strong>±64,8°</strong>.
              </p>
              <p>
                Да – наклонът е почти като земния, затова Марс има сезони.
                Орбитата му обаче е много по-сплескана (e = 0,093), така че
                разстоянието също влияе осезаемо: южното лято там е по-горещо и
                по-кратко от северното.
              </p>
            </Task>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>
                ✓ Земята се върти от запад на изток за 23h 56m 04s (звездно
                денонощие); слънчевото е 24h
              </li>
              <li>✓ Линейна скорост на въртене: v = 2πR·cos φ / T</li>
              <li>
                ✓ Въртенето се доказва с махалото на Фуко: T = 23h 56m / sin φ
              </li>
              <li>
                ✓ Земята обикаля Слънцето за една година с ~30 km/s; най-близо е
                през януари
              </li>
              <li>
                ✓ Наклонът на оста (23,4°) – не разстоянието – причинява
                сезоните
              </li>
              <li>
                ✓ По пладне h = 90° − φ + δ☉; денят: cos t₀ = −tg φ · tg δ☉
              </li>
              <li>✓ Прецесията завърта оста за ~25 800 години</li>
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
              Земята бавно забавя въртенето си заради приливното триене с Луната
              – денонощието се удължава с около 2 милисекунди на век. Преди 400
              милиона години денонощието е траело около 22 часа, а годината е
              имала ~400 дни. Знаем го от годишните и дневните пръстени на
              растеж при древни корали!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
