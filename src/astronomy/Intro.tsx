import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import { MathText, Tex } from '~/MathText';
import AngleDistanceLab from './components/AngleDistanceLab';
import CosmicScaleLab from './components/CosmicScaleLab';
import LightTravelLab from './components/LightTravelLab';
import Term from '~/Term';

const link = 'text-blue-600 dark:text-blue-400 hover:underline';

const QUIZ: Question[] = [
  {
    question: 'Защо казваме, че астрономията е наблюдателна наука?',
    answers: [
      'Защото астрономите работят само нощем',
      'Защото не можем да правим опити със звездите – само ги наблюдаваме и сравняваме с модели',
      'Защото всичко се вижда с просто око',
      'Защото телескопите са изобретени отдавна',
    ],
    correctAnswer: 'Защото не можем да правим опити със звездите – само ги наблюдаваме и сравняваме с модели',
  },
  {
    question: 'Кой клон на астрономията изучава строежа и развитието на Вселената като цяло?',
    answers: ['Планетологията', 'Астрофизиката', 'Космологията', 'Небесната механика'],
    correctAnswer: 'Космологията',
  },
  {
    question: 'Колко време пътува светлината от Слънцето до Земята?',
    answers: ['Около 1 секунда', 'Около 8 минути', 'Около 8 часа', 'Около 4 години'],
    correctAnswer: 'Около 8 минути',
  },
  {
    question: 'Какво е светлинна година?',
    answers: [
      'Времето, за което Земята обикаля Слънцето',
      'Разстоянието, което светлината изминава за една година',
      'Разстоянието от Земята до Слънцето',
      'Годината, през която е открита скоростта на светлината',
    ],
    correctAnswer: 'Разстоянието, което светлината изминава за една година',
  },
  {
    question: 'Коя от единиците е най-голяма?',
    answers: ['Астрономическа единица', 'Светлинна година', 'Парсек', 'Милион километра'],
    correctAnswer: 'Парсек',
  },
  {
    question: 'Защо Слънцето и Луната изглеждат почти еднакво големи на небето?',
    answers: [
      'Защото са еднакво големи',
      'Защото са на еднакво разстояние от нас',
      'Слънцето е около 400 пъти по-голямо, но е и около 390 пъти по-далеч',
      'Защото атмосферата уголемява Луната',
    ],
    correctAnswer: 'Слънцето е около 400 пъти по-голямо, но е и около 390 пъти по-далеч',
  },
  {
    question: 'Гледате галактиката Андромеда. Каква я виждате?',
    answers: [
      'Такава, каквато е в момента',
      'Такава, каквато е била преди около 2,5 милиона години',
      'Такава, каквато е била преди около 2500 години',
      'Такава, каквато ще бъде след 2,5 милиона години',
    ],
    correctAnswer: 'Такава, каквато е била преди около 2,5 милиона години',
  },
];

const BRANCHES = [
  { name: 'Астрометрия и небесна механика', text: 'положенията и движенията на небесните тела, календари, затъмнения, орбити', to: '/astronomy/lecture07', lecture: 'Закони на Кеплер' },
  { name: 'Астрофизика', text: 'какво представляват звездите и как светят: излъчване, спектри, строеж и еволюция', to: '/astronomy/lecture09', lecture: 'Светлина и спектри' },
  { name: 'Планетология', text: 'планетите, спътниците, астероидите и кометите – и екзопланетите край други звезди', to: '/astronomy/lecture13', lecture: 'Планети от земен тип' },
  { name: 'Космология', text: 'Вселената като цяло: откъде е тръгнала, как се разширява и от какво е съставена', to: '/astronomy/lecture27', lecture: 'Големият взрив' },
];

const MESSENGERS = [
  { icon: '🌈', title: 'Светлина', text: 'Почти всичко знаем от светлината – видима, радио, инфрачервена, ултравиолетова, рентгенова, гама. Тя носи и спектъра, а в него – състава, температурата и скоростта на източника.' },
  { icon: '👻', title: 'Неутрино', text: 'Почти невзаимодействащи частици. Неутрината от ядрото на Слънцето ни показват термоядрените реакции в него, а през 1987 г. са уловени и неутрина от свръхнова в съседна галактика.' },
  { icon: '〰️', title: 'Гравитационни вълни', text: 'Трептения на самото пространство. За пръв път са регистрирани през 2015 г. – от сливането на две черни дупки.' },
  { icon: '☄️', title: 'Вещество', text: 'Метеорити, лунни проби, донесени от „Аполо“, частици от астероиди и комети, и апарати, които изследват планетите отблизо.' },
];

const FACTS = [
  {
    icon: '⏳',
    title: 'Гледаме в миналото',
    text: 'Светлината от Слънцето пътува около 8 минути, а от Полярната звезда – стотици години (оценките са около 430). Виждаме звездите не каквито са сега, а каквито са били, когато светлината им е тръгнала.',
  },
  {
    icon: '🌌',
    title: 'Най-далечното, което виждаш с просто око',
    text: 'Галактиката Андромеда се вижда като бледо петно в есенното небе. Светлината ѝ е тръгнала преди около 2,5 милиона години.',
  },
  {
    icon: '🧭',
    title: 'Небето като GPS',
    text: 'Векове наред моряците са определяли географската си ширина, като измерват колко високо е Полярната звезда. Защо това работи – в урок 1.',
  },
];

const UNITS = [
  { name: 'Астрономическа единица (AU)', value: '$149\\,597\\,870{,}7\\ \\mathrm{km} \\approx 1{,}496 \\cdot 10^{8}\\ \\mathrm{km}$', note: 'средното разстояние Земя – Слънце; за Слънчевата система' },
  { name: 'Светлинна година (ly)', value: '$\\approx 9{,}46 \\cdot 10^{12}\\ \\mathrm{km} \\approx 63\\,000\\ \\mathrm{AU}$', note: 'пътят на светлината за една година; удобна за „колко назад гледаме“' },
  { name: 'Парсек (pc)', value: '$\\approx 3{,}26\\ \\mathrm{ly} \\approx 206\\,265\\ \\mathrm{AU}$', note: "разстоянието, от което 1 AU се вижда под ъгъл $1''$; основната единица на астрономите" },
];

export function Intro() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Въведение: какво изучава астрономията
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔭 В ясна есенна нощ, далеч от светлините на града, потърсете в съзвездието Андромеда малко бледо петно. Това е цяла
            галактика – стотици милиарди звезди. Светлината, която в този момент влиза в окото ви, е тръгнала от нея преди около 2,5
            милиона години, когато нашите далечни предци още не са познавали огъня. Как изобщо знаем всичко това, без никой да е ходил
            там? Отговорът е астрономията.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Какво изучава астрономията?</h2>
          <Theorem
            type="definition"
            title="Астрономия"
            description="Науката за небесните тела – Слънцето, Луната, планетите, звездите, галактиките – и за Вселената като цяло: как се движат, от какво са изградени, как възникват и се развиват."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Днес астрономията е тясно свързана с физиката – законите, които действат в лабораторията, важат и в най-далечните
            галактики. Затова голяма част от нея е <strong>астрофизика</strong>. Основните ѝ направления:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {BRANCHES.map(b => (
              <div key={b.name} className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-1">{b.name}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{b.text}</p>
                <p className="text-sm">
                  Например:{' '}
                  <Link to={b.to} className={link}>
                    {b.lecture}
                  </Link>
                </p>
              </div>
            ))}
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Към тях се добавят и по-млади области: астробиологията търси условия за живот извън Земята, а изследването на{' '}
            <Term id="exoplanet">екзопланетите</Term> – светове около други звезди – е едно от най-бързо развиващите се направления днес.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Най-старата наука</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Хората са следили небето много преди да има писменост. Небето е било календар и часовник: древните египтяни са свързвали
            разливите на Нил с времето, когато Сириус за пръв път се появява на зазоряване, а календарът, който ползваме днес, е
            астрономическо изобретение. Небето е било и компас – моряците са се ориентирали по звездите хилядолетия наред.
          </p>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <strong>Вавилон</strong> – векове наред записва положенията на Луната и планетите и открива повтарящите се цикли на
                затъмненията.
              </li>
              <li>
                <strong>Древна Гърция</strong> – Аристарх (III в. пр.н.е.) предполага, че Земята обикаля Слънцето, и оценява, че
                Слънцето е много по-далеч от Луната; Ератостен измерва обиколката на Земята по сенките в два града; на Хипарх (II в.
                пр.н.е.) се приписват един от първите звездни каталози и откриването на <Term id="precession">прецесията</Term>; Птолемей (II в.) описва
                геоцентричния модел, който се ползва около 1400 години.
              </li>
              <li>
                <strong>Научната революция</strong> – Коперник (1543) поставя Слънцето в центъра; Галилей (1609–1610) насочва телескоп към
                небето и вижда спътниците на Юпитер и фазите на Венера; Кеплер открива законите на планетните орбити; Нютон (1687)
                обяснява всичко с един закон за гравитацията.
              </li>
              <li>
                <strong>XX и XXI век</strong> – Хъбъл показва, че мъглявината Андромеда е отделна галактика (1920-те години) и че
                галактиките се отдалечават; космическите телескопи („Хъбъл“ – от 1990 г., „Джеймс Уеб“ – от 2021 г.) виждат небето без
                пречките на атмосферата.
              </li>
            </ul>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Тези истории ще срещнете отново: гравитацията и законите на Кеплер в{' '}
            <Link to="/astronomy/lecture06" className={link}>
              уроци 6–8
            </Link>
            , телескопите в{' '}
            <Link to="/astronomy/lecture10" className={link}>
              урок 10
            </Link>
            , разширяването на Вселената в{' '}
            <Link to="/astronomy/lecture28" className={link}>
              урок 28
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Наука без експерименти</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Химикът може да смеси две вещества, а физикът – да пусне топче от кула. Астрономът не може да запали звезда или да
            премести галактика. Той може само да <strong>гледа</strong> – да събира всичко, което идва до нас от небето, и да го
            сравнява с модели, построени по законите на физиката.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {MESSENGERS.map(m => (
              <div key={m.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                <div className="text-2xl mb-1">{m.icon}</div>
                <h3 className="font-semibold mb-1">{m.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded mb-4">
            <p className="font-semibold">💡 Важна идея:</p>
            <p>
              Вместо експерименти астрономията има огромен брой обекти. Не можем да проследим живота на една звезда – той трае милиарди
              години, – но виждаме милиони звезди на различна възраст, както по снимка на тълпа можем да разберем как растат хората.
              Повече за „пратениците“ и уредите – в{' '}
              <Link to="/astronomy/lecture09" className={link}>
                урок 9
              </Link>{' '}
              и{' '}
              <Link to="/astronomy/lecture32" className={link}>
                урок 32
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Мащабите на Вселената</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Най-трудното в астрономията е да си представим разстоянията. Затова ги записваме със степени на десетката: Земята е около{' '}
            <Tex>{'10^7\\ \\mathrm{m}'}</Tex>, Слънчевата система – около <Tex>{'10^{13}\\ \\mathrm{m}'}</Tex>, нашата Галактика – около{' '}
            <Tex>{'10^{21}\\ \\mathrm{m}'}</Tex>, а наблюдаемата Вселена – около <Tex>{'10^{27}\\ \\mathrm{m}'}</Tex>. Всяко стъпало е
            хиляди или милиони пъти по-голямо от предишното.
          </p>

          <CosmicScaleLab />

          <Example
            description="Ако Земята е топче с диаметър 1 cm, колко далеч е Слънцето в този модел и колко е голямо?"
            steps={[
              'Мащабът е $\\frac{1\\ \\mathrm{cm}}{12\\,742\\ \\mathrm{km}}$ – всички размери делим на $1{,}274 \\cdot 10^{9}$.',
              'Разстояние: $\\frac{1{,}496 \\cdot 10^{11}\\ \\mathrm{m}}{1{,}274 \\cdot 10^{9}} \\approx 117\\ \\mathrm{m}$ – колкото футболно игрище.',
              'Слънцето: $\\frac{1{,}39 \\cdot 10^{9}\\ \\mathrm{m}}{1{,}274 \\cdot 10^{9}} \\approx 1{,}1\\ \\mathrm{m}$ – голяма топка на 117 m от грахово зърно.',
              'А най-близката звезда в същия модел би била на около 31 000 km – три четвърти от обиколката на истинската Земя.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Единици за разстояние</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Километрите стават неудобни още в Слънчевата система. Затова астрономите използват три единици:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <tbody>
                {UNITS.map(u => (
                  <tr key={u.name} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 pr-2 font-semibold">{u.name}</td>
                    <td className="py-2 px-2">
                      <MathText>{u.value}</MathText>
                    </td>
                    <td className="py-2 pl-2 text-gray-600 dark:text-gray-400">
                      <MathText>{u.note}</MathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Най-близката звезда, Проксима Кентавър, е на 4,24 светлинни години. Колко е това в километри и в парсеци?"
            steps={[
              '$d = 4{,}24 \\cdot 9{,}46 \\cdot 10^{12}\\ \\mathrm{km} \\approx 4{,}01 \\cdot 10^{13}\\ \\mathrm{km}$ – 40 трилиона километра.',
              '$d = 4{,}24 / 3{,}26 \\approx 1{,}30\\ \\mathrm{pc}$.',
              'Космически апарат със скорост 17 km/s (колкото „Вояджър 1“) би пътувал дотам около 75 000 години.',
            ]}
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Как се мерят тези разстояния и откъде идва парсекът – в{' '}
            <Link to="/astronomy/lecture24" className={link}>
              урок 24 „Разстояния в астрономията“
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">6. Гледаме в миналото</h2>
          <Theorem
            title="Светлината пътува"
            description="Светлината се движи с крайна скорост $c \approx 3 \cdot 10^8\ \mathrm{m/s}$. От обект на разстояние $d$ тя идва за време $t = \frac{d}{c}$ – затова виждаме обекта такъв, какъвто е бил преди време $t$."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Колкото по-далеч гледаме, толкова по-назад във времето. Това е огромно предимство: не можем да видим как е изглеждала
            нашата Галактика преди милиард години, но можем да видим други галактики такива, каквито са били тогава.
          </p>

          <LightTravelLab />

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {FACTS.map(fact => (
              <div key={fact.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                <div className="text-3xl mb-2">{fact.icon}</div>
                <h3 className="font-semibold mb-1">{fact.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {fact.title === 'Небето като GPS' ? (
                    <>
                      Векове наред моряците са определяли географската си ширина, като измерват колко високо е Полярната звезда. Защо
                      това работи – в{' '}
                      <Link to="/astronomy/lecture01" className={link}>
                        урок 1
                      </Link>
                      .
                    </>
                  ) : (
                    fact.text
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">7. Ъглите – езикът на астрономията</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато погледнем небето, не виждаме разстояния – виждаме само посоки и ъгли. Затова положенията и размерите на небесните
            тела се дават в градуси (°), ъглови минути (′) и ъглови секунди (″): <Tex>{"1^\\circ = 60'"}</Tex>,{' '}
            <Tex>{"1' = 60''"}</Tex>.
          </p>
          <Theorem
            title="Формула за малки ъгли"
            description="Тяло с диаметър $D$ на разстояние $d \gg D$ се вижда под ъгъл $\alpha = \frac{D}{d}$ (в радиани). В градуси $\alpha \approx 57{,}3^\circ \cdot \frac{D}{d}$, а в ъглови секунди $\alpha \approx 206\,265'' \cdot \frac{D}{d}$."
          />

          <AngleDistanceLab />

          <Example
            description="Под какъв ъгъл виждаме Луната (диаметър 3475 km, разстояние 384 400 km) и Слънцето (диаметър 1 392 700 km, разстояние 149,6 млн. km)?"
            steps={[
              "Луната: $\\alpha = \\frac{3475}{384\\,400} \\approx 0{,}00904\\ \\mathrm{rad} \\approx 0{,}518^\\circ \\approx 31'$.",
              "Слънцето: $\\alpha = \\frac{1\\,392\\,700}{149\\,600\\,000} \\approx 0{,}00931\\ \\mathrm{rad} \\approx 0{,}533^\\circ \\approx 32'$.",
              'Почти еднакво – около половин градус. Затова Луната може да закрие точно Слънцето при пълно затъмнение (виж урок 5).',
            ]}
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Щом за небето има значение само посоката, можем да си го представим като сфера, върху която са „закрепени“ всички тела.
            Това е <strong>небесната сфера</strong> – с нея започва{' '}
            <Link to="/astronomy/lecture01" className={link}>
              урок 1
            </Link>
            . А какво се вижда тази вечер от вашия град – в{' '}
            <Link to="/astronomy/tonight" className={link}>
              „Какво да наблюдавам тази вечер“
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">8. 🎯 Бърз тест</h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">9. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />

              <Task
                id="a1"
                number={1}
                color="border-green-500"
                question="Слънцето е на $1{,}496 \cdot 10^{11}$ m. За колко минути стига светлината му до нас ($c = 3 \cdot 10^8$ m/s)?"
                check={[8.31]}
                ask={['време, min']}
              >
                <p>
                  <Tex>{'t = \\frac{d}{c} = \\frac{1{,}496 \\cdot 10^{11}}{3 \\cdot 10^8} \\approx 499\\ \\mathrm{s} \\approx 8{,}31\\ \\mathrm{min}'}</Tex>.
                </p>
                <p>Ако Слънцето угасне, ще научим за това чак след около 8 минути.</p>
              </Task>

              <Task
                id="a2"
                number={2}
                color="border-green-500"
                question="Проксима Кентавър е на 4,24 светлинни години. Колко километра е това ($1\ \mathrm{ly} = 9{,}46 \cdot 10^{12}$ km)?"
                check={[4.01]}
                ask={['разстояние, в единици $10^{13}$ km']}
              >
                <p>
                  <Tex>{'d = 4{,}24 \\cdot 9{,}46 \\cdot 10^{12} \\approx 4{,}01 \\cdot 10^{13}\\ \\mathrm{km}'}</Tex> – около 40 трилиона
                  километра.
                </p>
              </Task>

              <Task
                id="a3"
                number={3}
                color="border-green-500"
                question="Луната има диаметър 3475 km и е на 384 400 km. Под какъв ъгъл я виждаме (в градуси)?"
                check={[0.518]}
                ask={['ъглов диаметър, °']}
              >
                <p>
                  <Tex>{'\\alpha = \\frac{3475}{384\\,400} \\approx 0{,}00904\\ \\mathrm{rad} = 0{,}00904 \\cdot 57{,}3^\\circ \\approx 0{,}518^\\circ'}</Tex>.
                </p>
                <p>Около половин градус – колкото нокътя на малкия пръст на изпъната ръка.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />

              <Task
                id="b1"
                number={4}
                color="border-yellow-500"
                question="В модел на Слънчевата система Земята е топче с диаметър 1 cm (истинският е 12 742 km). На колко метра от него трябва да е Слънцето ($1{,}496 \cdot 10^{11}$ m)?"
                check={[117]}
                ask={['разстояние, m']}
              >
                <p>
                  Мащабът е <Tex>{'\\frac{0{,}01\\ \\mathrm{m}}{1{,}2742 \\cdot 10^7\\ \\mathrm{m}} \\approx 7{,}85 \\cdot 10^{-10}'}</Tex>.
                </p>
                <p>
                  <Tex>{'1{,}496 \\cdot 10^{11} \\cdot 7{,}85 \\cdot 10^{-10} \\approx 117\\ \\mathrm{m}'}</Tex> – дължината на футболно игрище.
                </p>
              </Task>

              <Task
                id="b2"
                number={5}
                color="border-yellow-500"
                question="На какво разстояние от окото монета с диаметър 2 cm закрива точно Луната (ъглов диаметър 0,00904 rad)?"
                check={[2.21]}
                ask={['разстояние, m']}
              >
                <p>
                  Монетата трябва да се вижда под същия ъгъл:{' '}
                  <Tex>{'d = \\frac{D}{\\alpha} = \\frac{0{,}02}{0{,}00904} \\approx 2{,}21\\ \\mathrm{m}'}</Tex>.
                </p>
                <p>Изпробвайте с приятел при пълнолуние!</p>
              </Task>

              <Task
                id="b3"
                number={6}
                color="border-yellow-500"
                question="При най-голямо доближаване Юпитер (диаметър 142 984 km) е на около 4,2 AU от Земята. Под какъв ъгъл се вижда дискът му в ъглови секунди ($1\ \mathrm{AU} = 1{,}496 \cdot 10^8$ km)?"
                check={[46.9]}
                ask={['ъглов диаметър, ″']}
              >
                <p>
                  <Tex>{'d = 4{,}2 \\cdot 1{,}496 \\cdot 10^8 \\approx 6{,}28 \\cdot 10^8\\ \\mathrm{km}'}</Tex>
                </p>
                <p>
                  <Tex>{"\\alpha = 206\\,265'' \\cdot \\frac{142\\,984}{6{,}28 \\cdot 10^8} \\approx 46{,}9''"}</Tex> – под 1′. Окото различава около
                  1′, затова с просто око Юпитер е точка, а с бинокъл се вижда малък диск.
                </p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />

              <Task
                id="c1"
                number={7}
                color="border-red-500"
                question="Слънцето и Луната се виждат под почти еднакъв ъгъл. Слънцето е на $1{,}496 \cdot 10^8$ km, а Луната (диаметър 3475 km) – на 384 400 km. Колко пъти Слънцето е по-далеч и какъв трябва да е диаметърът му?"
                check={[389, 1.35]}
                ask={['пъти по-далеч', 'диаметър на Слънцето, в единици $10^6$ km']}
              >
                <p>
                  <Tex>{'\\frac{1{,}496 \\cdot 10^8}{384\\,400} \\approx 389'}</Tex> пъти.
                </p>
                <p>
                  При еднакъв ъгъл <Tex>{'\\frac{D_\\odot}{d_\\odot} = \\frac{D_{\\text{Л}}}{d_{\\text{Л}}}'}</Tex>, следователно{' '}
                  <Tex>{'D_\\odot = 389 \\cdot 3475 \\approx 1{,}35 \\cdot 10^6\\ \\mathrm{km}'}</Tex>.
                </p>
                <p>
                  Истинският диаметър е <Tex>{'1{,}39 \\cdot 10^6'}</Tex> km – Слънцето се вижда малко по-голямо от Луната. Точно така Аристарх е
                  разсъждавал преди повече от 2200 години, но е мислил, че Слънцето е само около 20 пъти по-далеч – ъгълът, който е мерил, е
                  твърде малък, за да се измери точно с тогавашните уреди.
                </p>
              </Task>

              <Task
                id="c2"
                number={8}
                color="border-red-500"
                question="Парсек е разстоянието, от което 1 AU се вижда под ъгъл 1″. Колко AU и колко светлинни години е 1 парсек ($1\ \mathrm{ly} \approx 63\,240$ AU)?"
                check={[2.06, 3.26]}
                ask={['1 pc, в единици $10^5$ AU', '1 pc, ly']}
              >
                <p>
                  <Tex>{"1'' = \\frac{1}{3600} \\cdot \\frac{\\pi}{180} \\approx 4{,}848 \\cdot 10^{-6}\\ \\mathrm{rad}"}</Tex>
                </p>
                <p>
                  От формулата за малки ъгли <Tex>{'d = \\frac{1\\ \\mathrm{AU}}{4{,}848 \\cdot 10^{-6}} \\approx 206\\,265\\ \\mathrm{AU} \\approx 2{,}06 \\cdot 10^5\\ \\mathrm{AU}'}</Tex>.
                </p>
                <p>
                  <Tex>{'206\\,265 / 63\\,240 \\approx 3{,}26\\ \\mathrm{ly}'}</Tex>.
                </p>
              </Task>

              <Task
                id="c3"
                number={9}
                color="border-red-500"
                question="Разстоянието между Земята и Марс се мени между около 0,38 AU и 2,67 AU. Колко е най-краткото и най-дългото време, за което сигнал до марсоход отива и се връща ($1\ \mathrm{AU} = 1{,}496 \cdot 10^{11}$ m, $c = 3 \cdot 10^8$ m/s)?"
                check={[6.32, 44.4]}
                ask={['най-кратко, min', 'най-дълго, min']}
              >
                <p>
                  Най-близо: <Tex>{'t = \\frac{2 \\cdot 0{,}38 \\cdot 1{,}496 \\cdot 10^{11}}{3 \\cdot 10^8} \\approx 379\\ \\mathrm{s} \\approx 6{,}32\\ \\mathrm{min}'}</Tex>.
                </p>
                <p>
                  Най-далеч: <Tex>{'t = \\frac{2 \\cdot 2{,}67 \\cdot 1{,}496 \\cdot 10^{11}}{3 \\cdot 10^8} \\approx 2663\\ \\mathrm{s} \\approx 44{,}4\\ \\mathrm{min}'}</Tex>.
                </p>
                <p>
                  Затова марсоходите не се управляват „с джойстик“ в реално време – получават команди за цял ден и сами избягват
                  препятствията.
                </p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">10. Обобщение</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Астрономията изучава небесните тела и Вселената като цяло; днес голяма част от нея е астрофизика</li>
              <li>✓ Тя е най-старата наука – календари, навигация, а после Коперник, Галилей, Кеплер и Нютон</li>
              <li>✓ Астрономията е наблюдателна наука: светлина, <Term id="neutrino">неутрино</Term>, <Term id="gravitational-wave">гравитационни вълни</Term> и вещество са единствените ни „пратеници“</li>
              <li>✓ Мащабите: Земята ~<Tex>{'10^7'}</Tex> m, Слънчевата система ~<Tex>{'10^{13}'}</Tex> m, Галактиката ~<Tex>{'10^{21}'}</Tex> m, наблюдаемата Вселена ~<Tex>{'10^{27}'}</Tex> m</li>
              <li>✓ <Tex>{'1\\ \\mathrm{AU} \\approx 1{,}496 \\cdot 10^8\\ \\mathrm{km}'}</Tex>, <Tex>{'1\\ \\mathrm{ly} \\approx 9{,}46 \\cdot 10^{12}\\ \\mathrm{km}'}</Tex>, <Tex>{'1\\ \\mathrm{pc} \\approx 3{,}26\\ \\mathrm{ly}'}</Tex></li>
              <li>✓ Светлината идва за време <Tex>{'t = d/c'}</Tex> – колкото по-далеч гледаме, толкова по-назад във времето</li>
              <li>✓ Небето ни дава ъгли: <Tex>{'\\alpha = D/d'}</Tex>; Слънцето и Луната се виждат под около половин градус</li>
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
              Около 240 г. пр.н.е. Ератостен забелязва, че в деня на лятното слънцестоене в Сиена (днешен Асуан) Слънцето е точно в{' '}
              <Term id="zenith">зенита</Term>, а в Александрия, на север, в същия момент пръчките хвърлят сянка – Слънцето е на около 7° от зенита. Тъй като 7° са
              около 1/50 от пълния кръг, обиколката на Земята е около 50 пъти разстоянието между двата града. Резултатът му е изненадващо
              близо до истинските 40 000 km – колко точно, зависи от това каква дължина на древния „стадий“ приемем.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
