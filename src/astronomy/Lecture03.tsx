import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import FoucaultPendulum from './components/FoucaultPendulum';
import SeasonsExplorer from './components/SeasonsExplorer';
import SiderealSolarDay from './components/SiderealSolarDay';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import { MathText, Tex } from '~/MathText';

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
    date: '$\\approx 20$ март',
    dec: '$0^\\circ$',
    noon: '$47{,}3^\\circ$',
    day: '$\\approx 12^{\\mathrm{h}}$',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Лятно слънцестоене',
    date: '$\\approx 21$ юни',
    dec: '$+23{,}4^\\circ$',
    noon: '$70{,}7^\\circ$',
    day: '$15^{\\mathrm{h}}\\,09^{\\mathrm{m}}$',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    name: 'Есенно равноденствие',
    date: '$\\approx 22$ септември',
    dec: '$0^\\circ$',
    noon: '$47{,}3^\\circ$',
    day: '$\\approx 12^{\\mathrm{h}}$',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: 'Зимно слънцестоене',
    date: '$\\approx 21$ декември',
    dec: '$-23{,}4^\\circ$',
    noon: '$23{,}9^\\circ$',
    day: '$8^{\\mathrm{h}}\\,51^{\\mathrm{m}}$',
    color: 'text-blue-600 dark:text-blue-400',
  },
];

export default function Lecture03() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 3: Движение на Земята
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed mb-4">
            🚀 Седите неподвижно и четете тези редове. Всъщност в момента:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold"><Tex>{'340\\ \\mathrm{m/s}'}</Tex></div>
              <div className="text-sm opacity-80">
                около земната ос (в България)
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold"><Tex>{'30\\ \\mathrm{km/s}'}</Tex></div>
              <div className="text-sm opacity-80">около Слънцето</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold"><Tex>{'230\\ \\mathrm{km/s}'}</Tex></div>
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

          <div className="bg-gray-100/70 dark:bg-gray-800/70 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Характеристики:</h3>
            <ul className="text-sm sm:text-base space-y-2">
              <li>
                <strong>Период спрямо звездите:</strong> <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}\\,04^{\\mathrm{s}}'}</Tex> (звездно
                денонощие)
              </li>
              <li>
                <strong>Ъглова скорост:</strong> 15° на час – еднаква за всички
                точки
              </li>
              <li>
                <strong>Линейна скорост на екватора:</strong> около <Tex>{'1670\\ \\mathrm{km/h}'}</Tex> (<Tex>{'465\\ \\mathrm{m/s}'}</Tex>)
              </li>
              <li>
                <strong>Следствия:</strong> смяна на ден и нощ, видимо денонощно
                движение на небето, сплескване на Земята при полюсите
              </li>
            </ul>
          </div>

          <Theorem
            title="Линейна скорост на въртене"
            description="Точка на географска ширина $\varphi$ описва окръжност с радиус $R\cdot \cos \varphi$ около земната ос. Затова линейната ѝ скорост е $v = 2\pi R\cdot \cos \varphi / T$, където $T = 23^{\mathrm{h}}\,56^{\mathrm{m}}$ е звездното денонощие. На екватора $v \approx 465\ \mathrm{m/s}$, а на полюсите $v = 0$."
          />
          <Example
            description="С каква скорост се движи София ($\varphi = 42{,}7^\circ$) заради въртенето на Земята?"
            steps={[
              'Скоростта на екватора е $v_0 = 2\\pi R / T = 2\\pi \\cdot 6378\\ \\mathrm{km} / 23{,}93\\ \\mathrm{h} \\approx 1674\\ \\mathrm{km/h} \\approx 465\\ \\mathrm{m/s}$.',
              'Радиусът на успоредника на София е $R\\cdot \\cos 42{,}7^\\circ \\approx 0{,}735\\cdot R$.',
              '$v = v_0 \\cdot \\cos \\varphi \\approx 465 \\cdot 0{,}735 \\approx 342\\ \\mathrm{m/s} \\approx 1230\\ \\mathrm{km/h}$ – по-бързо от звука!',
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
                подът под нея. На полюса оборотът е за <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}'}</Tex>, а на екватора
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
            Ако Земята се завърта за <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}'}</Tex>, откъде идват нашите 24 часа?
            Проследете една обиколка стъпка по стъпка:
          </p>

          <SiderealSolarDay />

          <Theorem
            title="Връзка между звездното и слънчевото денонощие"
            description="За една година Земята прави спрямо звездите с един оборот повече, отколкото спрямо Слънцето: 366,26 звездни срещу 365,26 слънчеви денонощия. Следователно $T_{\odot} = T_{\star} \cdot 366{,}26 / 365{,}26$, а разликата е около $3^{\mathrm{m}}\,56^{\mathrm{s}}$."
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
                <strong>Перихелий:</strong> 147,1 млн. km (<Tex>{'\\approx 3'}</Tex> януари), скорост
                {' '}<Tex>{'30{,}3\\ \\mathrm{km/s}'}</Tex>{' '}
              </li>
              <li>
                <strong>Афелий:</strong> 152,1 млн. km (<Tex>{'\\approx 4'}</Tex> юли), скорост <Tex>{'29{,}3\\ \\mathrm{km/s}'}</Tex>{' '}
              </li>
              <li>
                <strong>Ексцентрицитет:</strong> <Tex>{'e = 0{,}0167'}</Tex> – разликата в
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
            Земната ос сключва ъгъл <strong><Tex>{'\\varepsilon = 23^\\circ26\' \\approx 23{,}4^\\circ'}</Tex></strong> с
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
            Четирите важни момента (за София, <Tex>{'\\varphi = 42{,}7^\\circ'}</Tex>)
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Момент</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left"><Tex>{'\\delta_{\\odot}'}</Tex></th>
                  <th className="p-2 text-left"><Tex>{'h'}</Tex> по пладне</th>
                  <th className="p-2 text-left">Ден</th>
                </tr>
              </thead>
              <tbody>
                {KEY_MOMENTS.map(m => (
                  <tr
                    key={m.name}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className={`p-2 font-semibold ${m.color}`}><MathText>{m.name}</MathText></td>
                    <td className="p-2"><MathText>{m.date}</MathText></td>
                    <td className="p-2 font-mono"><MathText>{m.dec}</MathText></td>
                    <td className="p-2 font-mono"><MathText>{m.noon}</MathText></td>
                    <td className="p-2 font-mono"><MathText>{m.day}</MathText></td>
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
            description="Слънцето изгрява и залязва при часов ъгъл $t_0$, за който $\cos t_0 = -\tg \varphi \cdot \tg \delta_{\odot}$. Продължителността на деня е $2t_0$ (в часове: $2t_0 / 15^\circ$). Ако $-\tg \varphi \cdot \tg \delta_{\odot} < -1$, Слънцето не залязва (полярен ден), а ако е $> 1$ – не изгрява (полярна нощ)."
          />

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🌴 Тропици (<Tex>{'\\varphi = \\pm 23{,}4^\\circ'}</Tex>)</h3>
              <p className="text-sm">
                Най-далечните ширини, на които Слънцето може да е в зенита по
                пладне. На Тропика на Рака това става на 21 юни.
              </p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">
                🧊 Полярни кръгове (<Tex>{'\\varphi = \\pm 66{,}6^\\circ'}</Tex>)
              </h3>
              <p className="text-sm">
                <Tex>{'90^\\circ - 23{,}4^\\circ = 66{,}6^\\circ'}</Tex>. Отвъд тях поне веднъж годишно има полярен
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
            7. 🎯 Бърз тест
          </h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            8. 📝 Задачи за упражнение
          </h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />

            <Task
              id="a1"
              number={1}
              color="border-green-500"
              question="Колко трае едно звездно денонощие?"
            >
              <p className="font-semibold">Отговор: <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}\\,04^{\\mathrm{s}}'}</Tex></p>
              <p>
                Това е времето за един пълен оборот на Земята спрямо далечните
                звезди. То е с около 4 минути по-кратко от слънчевото денонощие
                (<Tex>{'24^{\\mathrm{h}}'}</Tex>), защото Земята се движи и по орбитата си.
              </p>
            </Task>

            <Task
              id="a2"
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
              id="a3"
              number={3}
              color="border-green-500"
              question="Колко градуса е наклонена земната ос спрямо перпендикуляра към равнината на орбитата?"
            >
              <p className="font-semibold">Отговор: <Tex>{'23^\\circ26\' \\approx 23{,}4^\\circ'}</Tex></p>
              <p>
                Ако оста беше перпендикулярна на орбитата, нямаше да има сезони.
              </p>
            </Task>

            <Task
              id="a4"
              number={4}
              color="border-green-500"
              question="На каква височина е Слънцето по пладне в София ($\varphi = 42{,}7^\circ$) на 21 юни и на 21 декември?"
            >
              <p><Tex>{'h = 90^\\circ - \\varphi + \\delta_{\\odot}'}</Tex>.</p>
              <p>
                21 юни: <Tex>{'h = 90^\\circ - 42{,}7^\\circ + 23{,}4^\\circ ='}</Tex> <strong><Tex>{'70{,}7^\\circ'}</Tex></strong>.
              </p>
              <p>
                21 декември: <Tex>{'h = 90^\\circ - 42{,}7^\\circ - 23{,}4^\\circ ='}</Tex> <strong><Tex>{'23{,}9^\\circ'}</Tex></strong>.
              </p>
              <p>
                Разликата е <Tex>{'2\\varepsilon = 46{,}9^\\circ'}</Tex> – проверете с лабораторията „Сезони“.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task
              id="b1"
              number={5}
              color="border-yellow-500"
              question="Сравни слънчевото и звездното денонощие. Защо има разлика?"
            >
              <p>
                <strong>Слънчево денонощие:</strong> <Tex>{'24^{\\mathrm{h}}'}</Tex> – между две
                последователни кулминации на Слънцето.
              </p>
              <p>
                <strong>Звездно денонощие:</strong> <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}\\,04^{\\mathrm{s}}'}</Tex> – един оборот
                спрямо звездите.
              </p>
              <p>
                За едно денонощие Земята изминава ~<Tex>{'\\frac{360^\\circ}{365} \\approx 1^\\circ'}</Tex> от орбитата си.
                За да „настигне“ Слънцето, тя трябва да се завърти с още ~1°,
                което при <Tex>{'15^\\circ/\\mathrm{h}'}</Tex> отнема ~4 минути.
              </p>
            </Task>

            <Task
              id="b2"
              number={6}
              color="border-yellow-500"
              question="Изчисли линейната скорост на точка от екватора заради въртенето на Земята ($R = 6371\ \mathrm{km}$)."
            >
              <p>
                Използваме звездното денонощие <Tex>{'T = 23^{\\mathrm{h}}\\,56^{\\mathrm{m}} \\approx 23{,}93\\ \\mathrm{h}'}</Tex> (оборот
                спрямо звездите, а не спрямо Слънцето).
              </p>
              <p><Tex>{'v = 2\\pi R / T = 2\\pi \\cdot 6371\\ \\mathrm{km} / 23{,}93\\ \\mathrm{h} \\approx 40\\,030\\ \\mathrm{km} / 23{,}93\\ \\mathrm{h}'}</Tex></p>
              <p>
                <strong><Tex>{'v \\approx 1673\\ \\mathrm{km/h} \\approx 465\\ \\mathrm{m/s}'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="b3"
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
                <li>Денят е кратък (~<Tex>{'9^{\\mathrm{h}}'}</Tex>) → по-малко време за нагряване</li>
              </ul>
              <p>
                В южното полукълбо по същото време е лято – доказателство, че
                разстоянието не е причината.
              </p>
            </Task>

            <Task
              id="b4"
              number={8}
              color="border-yellow-500"
              question="За колко време ще направи пълен оборот равнината на махало на Фуко в София ($\varphi = 42{,}7^\circ$)?"
            >
              <p>
                <Tex>{'T = T_{\\star} / \\sin \\varphi = 23{,}93\\ \\mathrm{h} / \\sin 42{,}7^\\circ = 23{,}93 / 0{,}678 \\approx'}</Tex>{' '}
                <strong><Tex>{'35{,}3\\ \\mathrm{h}'}</Tex></strong>
              </p>
              <p>За час равнината се завърта с <Tex>{'15^\\circ \\cdot \\sin \\varphi \\approx 10{,}2^\\circ'}</Tex>.</p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={9}
              color="border-red-500"
              question="Ако наклонът на земната ос беше 0°, как би се променил климатът на Земята?"
            >
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Нямаше да има сезони</strong> – всеки ден би бил като
                  равноденствие (<Tex>{'\\delta_{\\odot} = 0^\\circ'}</Tex> винаги).
                </li>
                <li>Денят би траял 12 часа навсякъде (освен на полюсите).</li>
                <li>
                  На полюсите Слънцето постоянно би обикаляло по хоризонта.
                </li>
                <li>
                  Височината на Слънцето по пладне би била <Tex>{'90^\\circ - \\varphi'}</Tex> целогодишно,
                  така че климатът би зависел само от ширината.
                </li>
                <li>
                  Остава малка годишна промяна заради ексцентрицитета (~7% в
                  облъчването), еднаква за двете полукълба.
                </li>
              </ul>
            </Task>

            <Task
              id="c2"
              number={10}
              color="border-red-500"
              question="Изчисли средната орбитална скорост на Земята ($1\ \mathrm{AU} = 149{,}6$ млн. km, 1 година = 365,26 денонощия)."
            >
              <p>Приемаме орбитата за окръжност.</p>
              <p><Tex>{'L = 2\\pi r = 2\\pi \\cdot 149{,}6'}</Tex> млн. km <Tex>{'\\approx 940'}</Tex> млн. km</p>
              <p><Tex>{'T = 365{,}26 \\cdot 24\\ \\mathrm{h} \\approx 8766\\ \\mathrm{h}'}</Tex></p>
              <p>
                <Tex>{'v = L / T \\approx 107\\,200\\ \\mathrm{km/h} \\approx'}</Tex> <strong><Tex>{'29{,}8\\ \\mathrm{km/s}'}</Tex></strong>
              </p>
              <p>Около 87 пъти по-бързо от звука във въздуха!</p>
            </Task>

            <Task
              id="c3"
              number={11}
              color="border-red-500"
              question="Пресметни продължителността на най-дългия ден в София ($\varphi = 42{,}7^\circ$). Защо измерената стойност (~$15^{\mathrm{h}}\,20^{\mathrm{m}}$) е по-голяма?"
            >
              <p>
                На 21 юни <Tex>{'\\delta_{\\odot} = +23{,}4^\\circ'}</Tex>: <Tex>{'\\cos t_0 = -\\tg 42{,}7^\\circ \\cdot \\tg 23{,}4^\\circ = -0{,}923 \\cdot 0{,}433 \\approx -0{,}400'}</Tex>.
              </p>
              <p>
                <Tex>{'t_0 \\approx 113{,}6^\\circ = 7{,}57\\ \\mathrm{h}'}</Tex>, денят е <Tex>{'2t_0 \\approx 15{,}15\\ \\mathrm{h} ='}</Tex>{' '}
                <strong><Tex>{'15^{\\mathrm{h}}\\,09^{\\mathrm{m}}'}</Tex></strong>.
              </p>
              <p>
                В действителност изгревът и залезът се отчитат по горния край на
                слънчевия диск (радиус ~16′), а атмосферната рефракция повдига
                Слънцето с ~35′ на хоризонта. Затова Слънцето изгрява по-рано и
                залязва по-късно – с общо около 10 минути.
              </p>
            </Task>

            <Task
              id="c4"
              number={12}
              color="border-red-500"
              question="Наклонът на оста на Марс е 25,2°. На каква ширина са марсианските полярни кръгове и тропици? Има ли Марс сезони?"
            >
              <p>
                Тропици: <Tex>{'\\varphi = \\pm 25{,}2^\\circ'}</Tex>. Полярни кръгове: <Tex>{'\\varphi = \\pm (90^\\circ - 25{,}2^\\circ) ='}</Tex>{' '}
                <strong><Tex>{'\\pm 64{,}8^\\circ'}</Tex></strong>.
              </p>
              <p>
                Да – наклонът е почти като земния, затова Марс има сезони.
                Орбитата му обаче е много по-сплескана (<Tex>{'e = 0{,}093'}</Tex>), така че
                разстоянието също влияе осезаемо: южното лято там е по-горещо и
                по-кратко от северното.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>
                ✓ Земята се върти от запад на изток за <Tex>{'23^{\\mathrm{h}}\\,56^{\\mathrm{m}}\\,04^{\\mathrm{s}}'}</Tex> (звездно
                денонощие); слънчевото е <Tex>{'24^{\\mathrm{h}}'}</Tex>
              </li>
              <li>✓ Линейна скорост на въртене: <Tex>{'v = 2\\pi R\\cdot \\cos \\varphi / T'}</Tex></li>
              <li>
                ✓ Въртенето се доказва с махалото на Фуко: <Tex>{'T = 23^{\\mathrm{h}}\\,56^{\\mathrm{m}} / \\sin \\varphi'}</Tex>{' '}
              </li>
              <li>
                ✓ Земята обикаля Слънцето за една година с ~<Tex>{'30\\ \\mathrm{km/s}'}</Tex>; най-близо е
                през януари
              </li>
              <li>
                ✓ Наклонът на оста (23,4°) – не разстоянието – причинява
                сезоните
              </li>
              <li>
                ✓ По пладне <Tex>{'h = 90^\\circ - \\varphi + \\delta_{\\odot}'}</Tex>; денят: <Tex>{'\\cos t_0 = -\\tg \\varphi \\cdot \\tg \\delta_{\\odot}'}</Tex>{' '}
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
