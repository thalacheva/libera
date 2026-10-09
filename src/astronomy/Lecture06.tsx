import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import GravityPlayground from './components/GravityPlayground';
import NewtonCannon from './components/NewtonCannon';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import TidesExplorer from './components/TidesExplorer';
import WeightOnWorlds from './components/WeightOnWorlds';
import { Tex } from '~/MathText';

const QUIZ: Question[] = [
  {
    question: 'Как се променя силата на привличане, ако разстоянието се утрои?',
    answers: [
      'Намалява 3 пъти',
      'Намалява 9 пъти',
      'Увеличава се 3 пъти',
      'Не се променя',
    ],
    correctAnswer: 'Намалява 9 пъти',
  },
  {
    question: 'Ученик с маса 60 kg отлита на Луната. Каква е масата му там?',
    answers: ['10 kg', '60 kg', '97 kg', 'Нула'],
    correctAnswer: '60 kg',
  },
  {
    question:
      'Земята привлича ябълка със сила 1 N. С каква сила ябълката привлича Земята?',
    answers: ['$0\\ \\mathrm{N}$', 'Почти $0\\ \\mathrm{N}$', '$1\\ \\mathrm{N}$', '$6\\cdot 10^{24}\\ \\mathrm{N}$'],
    correctAnswer: '$1\\ \\mathrm{N}$',
  },
  {
    question: 'Защо приливите са по два на денонощие?',
    answers: [
      'Защото Луната обикаля Земята два пъти на ден',
      'Защото има издутина и откъм Луната, и от противоположната страна',
      'Заради Слънцето',
      'Заради вятъра',
    ],
    correctAnswer:
      'Защото има издутина и откъм Луната, и от противоположната страна',
  },
  {
    question: 'Кога приливите са най-силни?',
    answers: [
      'При новолуние и пълнолуние',
      'При първа и последна четвърт',
      'Само при пълнолуние',
      'През лятото',
    ],
    correctAnswer: 'При новолуние и пълнолуние',
  },
];

export default function Lecture06() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 6: Гравитация и закон на Нютон
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍎 Защо ябълката пада, а Луната – не? Голямото прозрение на Нютон е,
            че <strong>Луната също пада</strong> – непрекъснато, към Земята. И
            че една и съща сила движи ябълката, Луната, планетите и дори
            галактиките. За първи път законите на небето и на Земята се оказали
            едни и същи.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Закон за всемирното привличане
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Исак Нютон публикува закона през 1687 г. в книгата си „Математически
            начала на натурфилософията“.
          </p>
          <Theorem
            title="Закон за всемирното привличане"
            description="Всеки две тела се привличат със сила, пропорционална на произведението на масите им и обратно пропорционална на квадрата на разстоянието между тях: $F = G\cdot m_1\cdot m_2 / r^2$, където $G = 6{,}674\cdot 10^{-11}\ \mathrm{N\cdot m^{2}/kg^{2}}$ е гравитационната константа."
          />
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong><Tex>{'F'}</Tex></strong> – сила на привличане (N); насочена е по
                правата, свързваща телата
              </li>
              <li>
                <strong><Tex>{'m_1,\\ m_2'}</Tex></strong> – масите на телата (kg)
              </li>
              <li>
                <strong><Tex>{'r'}</Tex></strong> – разстоянието между центровете им (m); за
                кълбо формулата важи, все едно цялата маса е в центъра
              </li>
              <li>
                Двете тела се привличат с <strong>равни по големина</strong> и
                противоположни сили (III закон на Нютон) – дори ако едното е
                Земята, а другото е ябълка
              </li>
            </ul>
          </div>

          <GravityPlayground />

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">
              🤔 Защо тогава ябълката пада към Земята, а не обратното?
            </p>
            <p>
              Силите са равни, но ускорението е <Tex>{'a = F / m'}</Tex>. Масата на Земята е
              {' '}<Tex>{'10^{24}'}</Tex> пъти по-голяма, затова тя се премества незабележимо малко, а
              ябълката – с <Tex>{'9{,}8\\ \\mathrm{m/s}^2'}</Tex>.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Гравитационно ускорение, маса и тегло
          </h2>
          <Theorem
            title="Ускорение на свободното падане"
            description="На повърхността на тяло с маса $M$ и радиус $R$ всяко тяло пада с ускорение $g = G\cdot M / R^2$, независимо от собствената си маса. На височина $h$ над повърхността $g(h) = g_0\cdot \left(\frac{R}{R + h}\right)^2$."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            <strong>Масата</strong> (kg) е мярка за количеството вещество и е
            еднаква навсякъде. <strong>Теглото</strong> (N) е силата, с която
            планетата ви привлича: <Tex>{'P = m\\cdot g'}</Tex>.
          </p>

          <WeightOnWorlds />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Луната пада! Проверката на Нютон
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Нютон проверил закона си, като сравнил ябълката с Луната. Луната е
            на около 60 земни радиуса от центъра на Земята. Ако силата намалява
            с квадрата на разстоянието, ускорението на Луната трябва да е <Tex>{'60^2 = 3600'}</Tex> пъти по-малко от <Tex>{'g'}</Tex>.
          </p>
          <Example
            description="Сравнете очакваното и измереното ускорение на Луната."
            steps={[
              'По закона на Нютон: $a = g / 60^2 = 9{,}81 / 3600 \\approx 2{,}72\\cdot 10^{-3}\\ \\mathrm{m/s}^2$.',
              'От движението на Луната: тя обикаля по окръжност с $r = 3{,}844\\cdot 10^8\\ \\mathrm{m}$ за $T = 27{,}32$ дни $= 2{,}36\\cdot 10^6\\ \\mathrm{s}$.',
              'Центростремително ускорение: $a = \\frac{4\\pi^2r}{T^2} = \\frac{4\\pi^2 \\cdot 3{,}844\\cdot 10^8}{(2{,}36\\cdot 10^6)^2} \\approx 2{,}72\\cdot 10^{-3}\\ \\mathrm{m/s}^2$.',
              'Двете числа съвпадат! Една и съща сила кара ябълката да пада и Луната да обикаля.',
            ]}
          />

          <NewtonCannon />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Как се „претегля“ Земята?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Нютон знаел <Tex>{'g'}</Tex> и <Tex>{'R'}</Tex>, но не и <Tex>{'G'}</Tex> – затова не могъл да пресметне масата
            на Земята. През 1798 г. Хенри Кавендиш измерил <Tex>{'G'}</Tex> с торзионна везна:
            две малки оловни топчета, окачени на тънка нишка, се завъртали едва
            забележимо към две големи топки.
          </p>
          <Example
            description="Пресметнете масата и средната плътност на Земята."
            steps={[
              'От $g = GM / R^2$ следва $M = gR^2 / G$.',
              '$M = \\frac{9{,}81 \\cdot (6{,}371\\cdot 10^6)^2}{6{,}674\\cdot 10^{-11}} \\approx 5{,}97\\cdot 10^{24}\\ \\mathrm{kg}$.',
              'Обем: $V = \\frac{4}{3} \\cdot \\pi R^3 \\approx 1{,}083\\cdot 10^{21}\\ \\mathrm{m^{3}}$.',
              'Плътност: $\\rho = M / V \\approx 5510\\ \\mathrm{kg/m^{3}} = 5{,}5\\ \\mathrm{g/cm^{3}}$ – два пъти повече от скалите на повърхността. Значи ядрото на Земята е от много плътно вещество (желязо)!',
            ]}
          />
          <Theorem
            title="Маса от орбита"
            description="Ако спътник обикаля тяло по орбита с радиус $a$ и период $T$, масата на централното тяло е $M = \frac{4\pi^2a^3}{G\cdot T^2}$. Така се „претеглят“ Слънцето, планетите със спътници, двойните звезди и дори черните дупки. Това е III закон на Кеплер в обобщения вид на Нютон (Лекция 7)."
          />
          <Example
            description="Колко е масата на Слънцето?"
            steps={[
              'Земята обикаля Слънцето по почти кръгова орбита с $a = 1{,}496\\cdot 10^{11}\\ \\mathrm{m}$ за $T = 1$ година $= 3{,}156\\cdot 10^7\\ \\mathrm{s}$.',
              '$M_{\\odot} = \\frac{4\\pi^2 \\cdot (1{,}496\\cdot 10^{11})^3}{6{,}674\\cdot 10^{-11} \\cdot (3{,}156\\cdot 10^7)^2}$',
              '$M_{\\odot} \\approx 1{,}99\\cdot 10^{30}\\ \\mathrm{kg}$ – около 333 000 пъти масата на Земята.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Център на масите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Щом и двете тела се привличат, не само Луната обикаля Земята – двете
            обикалят около общия си <strong>център на масите</strong>{' '}
            (барицентър). Разстоянието му от по-масивното тяло е <Tex>{'x = \\frac{r \\cdot m}{M + m}'}</Tex>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">🌍 Земя – Луна</h3>
              <p className="text-sm">
                <Tex>{'x = 384\\,400\\ \\mathrm{km} \\cdot 7{,}34\\cdot 10^{22} / 6{,}05\\cdot 10^{24} \\approx 4670\\ \\mathrm{km}'}</Tex> от центъра на
                Земята – под повърхността, на ~1700 km дълбочина. Земята
                „клатушка“ около тази точка веднъж месечно.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">☀️ Слънце – Юпитер</h3>
              <p className="text-sm">
                <Tex>{'x \\approx 778\\cdot 10^6\\ \\mathrm{km} / 1048 \\approx 742\\,000\\ \\mathrm{km}'}</Tex> – малко{' '}
                <strong>извън</strong> Слънцето (<Tex>{'R_{\\odot} = 696\\,000\\ \\mathrm{km}'}</Tex>). Такова
                „клатене“ на звезди издава невидими планети около тях (Лекция
                30).
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Приливи и отливи
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Луната привлича по-силно близката до нея страна на Земята и по-слабо
            далечната. Разликата – <strong>приливната сила</strong> – разтяга
            Земята по линията към Луната. Океаните образуват две издутини: откъм
            Луната (водата е привлечена по-силно от Земята) и от
            противоположната страна (Земята е привлечена по-силно от водата).
          </p>
          <Theorem
            title="Приливно ускорение"
            description="Приливното ускорение от тяло с маса $M$ на разстояние $d$ в точка на повърхността на Земята е приблизително $a \approx 2\cdot G\cdot M\cdot R / d^3$. То намалява с куба на разстоянието – затова Луната, макар и 27 милиона пъти по-лека от Слънцето, създава около 2,2 пъти по-силни приливи."
          />

          <TidesExplorer />

          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                Земята се върти под издутините, затова на всяко място има по два
                прилива и два отлива за ~24h 50m (лунното денонощие) – на всеки
                ~12h 25m.
              </li>
              <li>
                <strong>Сизигийни (големи) приливи</strong> – при новолуние и
                пълнолуние: приливите от Луната и Слънцето се събират.
              </li>
              <li>
                <strong>Квадратурни (малки) приливи</strong> – при първа и
                последна четвърт: двете действия частично се компенсират.
              </li>
              <li>
                Приливното триене забавя въртенето на Земята и отдалечава Луната
                (Лекции 3 и 4). Същите сили са „заключили“ Луната да гледа
                Земята с една страна.
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
              question="Как се променя силата на привличане между две тела, ако разстоянието между тях се удвои? А ако масата на едното се удвои?"
            >
              <p>
                <Tex>{'F \\propto \\frac{1}{r^2}'}</Tex>: при двойно разстояние силата намалява{' '}
                <strong>4 пъти</strong>.
              </p>
              <p>
                <Tex>{'F \\propto m'}</Tex>: при двойна маса силата се <strong>удвоява</strong>.
              </p>
            </Task>

            <Task
              id="a2"
              number={2}
              color="border-green-500"
              question="Космонавт има маса 80 kg. Каква е масата му на Луната и какво е теглото му там ($g_{\text{☾}} = 1{,}62\ \mathrm{m/s}^2$)?"
            >
              <p>
                Масата не се променя: <strong>80 kg</strong>.
              </p>
              <p>
                Теглото: <Tex>{'P = m\\cdot g_{\\text{☾}} = 80 \\cdot 1{,}62 \\approx'}</Tex> <strong><Tex>{'130\\ \\mathrm{N}'}</Tex></strong> – около 6
                пъти по-малко от земното (785 N).
              </p>
            </Task>

            <Task
              id="a3"
              number={3}
              color="border-green-500"
              question="Защо астронавтите на МКС (на 408 km височина) се носят в безтегловност, щом там $g$ е около $8{,}7\ \mathrm{m/s}^2$?"
            >
              <p>
                Гравитацията там е почти колкото на Земята (~89%).
                Безтегловността се дължи на това, че станцията и астронавтите{' '}
                <strong>падат свободно</strong> заедно – с еднакво ускорение.
                Нищо не ги притиска към пода, като в асансьор, чието въже се е
                скъсало.
              </p>
              <p>
                Станцията не пада на Земята, защото се движи хоризонтално с ~<Tex>{'7{,}7\\ \\mathrm{km/s}'}</Tex> – като гюлето на Нютон.
              </p>
            </Task>

            <Task
              id="a4"
              number={4}
              color="border-green-500"
              question="Земята привлича ябълка със сила 1 N. С каква сила ябълката привлича Земята? Защо не виждаме Земята да „пада“ към ябълката?"
            >
              <p>
                Със същата сила – <strong>1 N</strong> (III закон на Нютон).
              </p>
              <p>
                Но ускорението на Земята е <Tex>{'a = F / M_{\\oplus} = 1 / 6\\cdot 10^{24} \\approx 1{,}7\\cdot 10^{-25}\\ \\mathrm{m/s}^2'}</Tex> – напълно незабележимо.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task
              id="b1"
              number={5}
              color="border-yellow-500"
              question="Изчисли $g$ на повърхността на Марс ($M = 6{,}42\cdot 10^{23}\ \mathrm{kg},\ R = 3390\ \mathrm{km}$). Колко пъти по-високо ще скочите там?"
            >
              <p>
                <Tex>{'g = GM / R^2 = \\frac{6{,}674\\cdot 10^{-11} \\cdot 6{,}42\\cdot 10^{23}}{(3{,}39\\cdot 10^6)^2} \\approx'}</Tex>{' '}
                <strong><Tex>{'3{,}73\\ \\mathrm{m/s}^2'}</Tex></strong>
              </p>
              <p>
                Височината на скока при една и съща начална скорост е <Tex>{'h = v^2 / 2g'}</Tex>, т.е. <Tex>{'h \\propto \\frac{1}{g}'}</Tex>: <Tex>{'9{,}81 / 3{,}73 \\approx'}</Tex> <strong>2,6 пъти</strong>{' '}
                по-високо.
              </p>
            </Task>

            <Task
              id="b2"
              number={6}
              color="border-yellow-500"
              question="На каква височина над повърхността на Земята $g$ е два пъти по-малко от $g_0$?"
            >
              <p><Tex>{'\\left(\\frac{R}{R + h}\\right)^2 = \\frac{1}{2} \\to R + h = R\\sqrt{2}'}</Tex></p>
              <p>
                <Tex>{'h = R(\\sqrt{2} - 1) = 6371 \\cdot 0{,}414 \\approx'}</Tex> <strong><Tex>{'2640\\ \\mathrm{km}'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="b3"
              number={7}
              color="border-yellow-500"
              question="Пресметни масата на Земята от $g = 9{,}81\ \mathrm{m/s}^2$ и $R = 6371\ \mathrm{km}$. Колко е средната ѝ плътност?"
            >
              <p>
                <Tex>{'M = gR^2 / G = \\frac{9{,}81 \\cdot (6{,}371\\cdot 10^6)^2}{6{,}674\\cdot 10^{-11}} \\approx'}</Tex>{' '}
                <strong><Tex>{'5{,}97\\cdot 10^{24}\\ \\mathrm{kg}'}</Tex></strong>
              </p>
              <p>
                <Tex>{'\\rho = \\frac{M}{\\frac{4}{3} \\pi R^3} \\approx 5{,}97\\cdot 10^{24} / 1{,}083\\cdot 10^{21} \\approx'}</Tex>{' '}
                <strong><Tex>{'5{,}5\\ \\mathrm{g/cm^{3}}'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="b4"
              number={8}
              color="border-yellow-500"
              question="Луната Европа обикаля Юпитер по почти кръгова орбита с радиус 671 000 km за 3,55 дни. Пресметни масата на Юпитер."
            >
              <p><Tex>{'T = 3{,}55 \\cdot 86\\,400 \\approx 3{,}07\\cdot 10^5\\ \\mathrm{s}'}</Tex>; <Tex>{'a = 6{,}71\\cdot 10^8\\ \\mathrm{m}'}</Tex></p>
              <p>
                <Tex>{'M = \\frac{4\\pi^2a^3}{GT^2} = \\frac{4\\pi^2 \\cdot 3{,}02\\cdot 10^{26}}{6{,}674\\cdot 10^{-11} \\cdot 9{,}41\\cdot 10^{10}} \\approx'}</Tex> <strong><Tex>{'1{,}9\\cdot 10^{27}\\ \\mathrm{kg}'}</Tex></strong>
              </p>
              <p>Около 318 земни маси – най-масивната планета.</p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={9}
              color="border-red-500"
              question="В коя точка между Земята и Луната силите на привличане от двете тела се уравновесяват? ($M_{\text{☾}} / M_{\oplus} = 0{,}0123,\ d = 384\,400\ \mathrm{km}$)"
            >
              <p>
                На разстояние <Tex>{'x'}</Tex> от Земята: <Tex>{'\\frac{GM_{\\oplus}}{x^2} = \\frac{GM_{\\text{☾}}}{(d - x)^2} \\to \\frac{d - x}{x} = \\sqrt{M_{\\text{☾}} / M_{\\oplus}} = 0{,}111'}</Tex>.
              </p>
              <p>
                <Tex>{'x = d / 1{,}111 \\approx'}</Tex> <strong><Tex>{'346\\,000\\ \\mathrm{km}'}</Tex></strong> от Земята – на ~38
                000 km от Луната.
              </p>
            </Task>

            <Task
              id="c2"
              number={10}
              color="border-red-500"
              question="Покажи, че приливното действие на Слънцето е ~0,46 от това на Луната. Колко пъти сизигийните приливи са по-високи от квадратурните? ($M_{\odot} / M_{\text{☾}} = 2{,}71\cdot 10^7,\ d_{\odot} = 1{,}496\cdot 10^8\ \mathrm{km},\ d_{\text{☾}} = 3{,}844\cdot 10^5\ \mathrm{km}$)"
            >
              <p>
                <Tex>{'a \\propto M / d^3'}</Tex>: <Tex>{'a_{\\odot} / a_{\\text{☾}} = (M_{\\odot} / M_{\\text{☾}}) \\cdot (d_{\\text{☾}} / d_{\\odot})^3 = 2{,}71\\cdot 10^7 \\cdot (2{,}57\\cdot 10^{-3})^3 \\approx'}</Tex> <strong>0,46</strong>
              </p>
              <p>
                Сизигия: <Tex>{'1 + 0{,}46 = 1{,}46'}</Tex>. Квадратура: <Tex>{'1 - 0{,}46 = 0{,}54'}</Tex>. Отношение
                {' '}<Tex>{'1{,}46 / 0{,}54 \\approx'}</Tex> <strong>2,7</strong>.
              </p>
            </Task>

            <Task
              id="c3"
              number={11}
              color="border-red-500"
              question="Звезда с маса $1\,M_{\odot}$ има планета с маса на Юпитер ($M = \frac{M_{\odot}}{1048}$) на 5,2 AU. С каква скорост „клати“ звездата около общия център на масите? (Скоростта на Юпитер е $13{,}1\ \mathrm{km/s}$.)"
            >
              <p>
                Центърът на масите е неподвижен, затова импулсите са равни: <Tex>{'M_{\\star} v_{\\star} = m v'}</Tex>.
              </p>
              <p>
                <Tex>{'v_{\\star} = v \\cdot m / M_{\\star} = 13{,}1\\ \\mathrm{km/s} / 1048 \\approx'}</Tex> <strong><Tex>{'12{,}5\\ \\mathrm{m/s}'}</Tex></strong>
              </p>
              <p>
                Такива малки скорости се измерват по ефекта на Доплер в спектъра
                на звездата – така са открити стотици екзопланети.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ <Tex>{'F = G\\cdot m_1\\cdot m_2 / r^2'}</Tex>; <Tex>{'G = 6{,}674\\cdot 10^{-11}\\ \\mathrm{N\\cdot m^{2}/kg^{2}}'}</Tex></li>
              <li>✓ Силите между две тела са равни и противоположни</li>
              <li>✓ <Tex>{'g = GM / R^2'}</Tex>; на височина <Tex>{'h'}</Tex>: <Tex>{'g_0\\cdot \\left(\\frac{R}{R + h}\\right)^2'}</Tex></li>
              <li>✓ Масата е постоянна, теглото <Tex>{'P = mg'}</Tex> зависи от мястото</li>
              <li>✓ Орбитата е непрекъснато свободно падане</li>
              <li>✓ Маса от орбита: <Tex>{'M = \\frac{4\\pi^2a^3}{GT^2}'}</Tex></li>
              <li>
                ✓ Приливната сила <Tex>{'\\propto M / d^3'}</Tex>; Луната създава 2,2 пъти по-силни
                приливи от Слънцето
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
              Гравитацията е най-слабата от фундаменталните сили: малко магнитче
              на хладилника удържа кламер срещу привличането на цялата Земя! Тя
              управлява Вселената само защото масите са огромни и защото – за
              разлика от електричеството – няма „отрицателна“ маса, която да я
              неутрализира. А легендата за ябълката, паднала на главата на
              Нютон, вероятно е преувеличена – но самият Нютон разказвал, че
              падаща ябълка в градината го е накарала да се замисли.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
