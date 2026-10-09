import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import KeplerOrbitLab from './components/KeplerOrbitLab';
import KeplerThirdLaw from './components/KeplerThirdLaw';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import { Tex } from '~/MathText';

const QUIZ: Question[] = [
  {
    question: 'Къде се намира Слънцето спрямо орбитата на планетата?',
    answers: [
      'В центъра на елипсата',
      'В единия фокус на елипсата',
      'В перихелия',
      'Извън елипсата',
    ],
    correctAnswer: 'В единия фокус на елипсата',
  },
  {
    question: 'Къде планетата се движи най-бързо?',
    answers: [
      'В перихелий',
      'В афелий',
      'Еднакво навсякъде',
      'В края на малката ос',
    ],
    correctAnswer: 'В перихелий',
  },
  {
    question: 'Планета обикаля Слънцето на $a = 9\\ \\mathrm{AU}$. Какъв е периодът ѝ?',
    answers: ['9 години', '27 години', '81 години', '3 години'],
    correctAnswer: '27 години',
  },
  {
    question: 'Вторият закон на Кеплер е следствие от запазването на…',
    answers: ['енергията', 'масата', 'момента на импулса', 'импулса'],
    correctAnswer: 'момента на импулса',
  },
  {
    question: 'Какъв е ексцентрицитетът на кръгова орбита?',
    answers: ['0', '0,5', '1', 'Безкраен'],
    correctAnswer: '0',
  },
];

const ECCENTRICITIES = [
  { name: 'Венера', e: '0,007' },
  { name: 'Земя', e: '0,017' },
  { name: 'Марс', e: '0,093' },
  { name: 'Меркурий', e: '0,206' },
  { name: 'Плутон', e: '0,249' },
  { name: 'Кометата на Халей', e: '0,967' },
];

export default function Lecture07() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 7: Закони на Кеплер
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔭 Хиляди години хората вярвали, че небесните тела се движат по
            съвършени окръжности. Йоханес Кеплер също вярвал – докато не се
            опитал да опише орбитата на Марс. Шест години пресмятания на ръка и
            една разлика от само 8 ъглови минути (четвърт от диаметъра на
            Луната) спрямо наблюденията на Тихо Брахе го накарали да изостави
            окръжностите. „Тези 8 минути – пише той – показаха пътя към
            реформата на цялата астрономия.“
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Тихо Брахе и Йоханес Кеплер
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">👁️ Тихо Брахе (1546–1601)</h3>
              <p className="text-sm">
                Датски астроном – най-точният наблюдател преди телескопа. В
                обсерваторията си на остров Хвен измервал положенията на
                планетите с точност около 1′ в продължение на 20 години.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">
                🧮 Йоханес Кеплер (1571–1630)
              </h3>
              <p className="text-sm">
                Немски математик, помощник на Брахе в Прага. След смъртта му
                наследил наблюденията и от тях извел трите закона (1609 и 1619)
                – без телескоп, без компютър и без да знае защо планетите се
                движат така.
              </p>
            </div>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Законите на Кеплер са <strong>емпирични</strong> – те описват{' '}
            <em>как</em> се движат планетите. Едва 70 години по-късно Нютон
            показа, че те следват от закона за всемирното привличане (Лекция 6)
            – и обясни <em>защо</em>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Първи закон: закон за елипсите
          </h2>
          <Theorem
            title="Първи закон на Кеплер"
            description="Всяка планета се движи по елипса, в единия фокус на която се намира Слънцето."
          />
          <Theorem
            type="definition"
            title="Елипса"
            description="Множеството от точки, за които сумата от разстоянията до два фиксирани фокуса $F_1$ и $F_2$ е постоянна и равна на $2a$: $r_1 + r_2 = 2a$. Голямата полуос е $a$, малката – $b$, разстоянието от центъра до фокус е $c = a\cdot e$, където $e$ е ексцентрицитетът ($0 \le e < 1$)."
          />
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Важни формули</h3>
              <ul className="space-y-1 font-mono text-sm">
                <li>перихелий: <Tex>{'r_p = a(1 - e)'}</Tex></li>
                <li>афелий: <Tex>{'r_a = a(1 + e)'}</Tex></li>
                <li><Tex>{'a = \\frac{r_p + r_a}{2}'}</Tex></li>
                <li><Tex>{'e = \\frac{r_a - r_p}{r_a + r_p}'}</Tex></li>
                <li><Tex>{'b = a\\cdot \\sqrt{1 - e^2}'}</Tex></li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Ексцентрицитети</h3>
              <ul className="space-y-1 text-sm">
                {ECCENTRICITIES.map(item => (
                  <li key={item.name} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-mono">e = {item.e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">
              ✏️ Опитайте сами: метод на градинаря
            </p>
            <p>
              Забийте две кабарчета в картон, вържете около тях хлабав конец и
              опънете го с молив. Движейки молива, ще начертаете елипса –
              кабарчетата са фокусите, а дължината на конеца е 2a. Колкото
              по-далеч са кабарчетата, толкова по-издължена е елипсата.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Втори закон: закон за площите
          </h2>
          <Theorem
            title="Втори закон на Кеплер"
            description="Радиус-векторът от Слънцето до планетата описва равни площи за равни интервали от време. Следователно планетата се движи най-бързо в перихелия и най-бавно в афелия."
          />

          <KeplerOrbitLab />

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Физично обяснение</h3>
            <p className="mb-2">
              Гравитацията винаги сочи към Слънцето, затова не може да завърти
              планетата „встрани“ – запазва се{' '}
              <strong>моментът на импулса</strong> <Tex>{'L = m\\cdot r\\cdot v_{\\perp}'}</Tex>. Площта, описана
              за кратко време <Tex>{'\\Delta t'}</Tex>, е <Tex>{'\\Delta S = \\tfrac{1}{2}\\cdot r\\cdot v_{\\perp}\\cdot \\Delta t = \\frac{L\\cdot \\Delta t}{2m}'}</Tex> – постоянна.
            </p>
            <p className="font-mono text-center">
              <Tex>{'r_p \\cdot v_p = r_a \\cdot v_a \\to v_p / v_a = r_a / r_p = \\frac{1 + e}{1 - e}'}</Tex>{' '}
            </p>
          </div>
          <Example
            description="С каква скорост се движи Земята в перихелия и в афелия, ако средната ѝ скорост е $29{,}78\ \mathrm{km/s}$, а $e = 0{,}0167$?"
            steps={[
              '$v_p / v_a = \\frac{1 + e}{1 - e} = 1{,}0167 / 0{,}9833 \\approx 1{,}034$.',
              'За почти кръгова орбита $v_p \\approx v_0\\cdot (1 + e)$ и $v_a \\approx v_0\\cdot (1 - e)$.',
              '$v_p \\approx 29{,}78 \\cdot 1{,}0167 \\approx 30{,}3\\ \\mathrm{km/s}$ (началото на януари), $v_a \\approx 29{,}78 \\cdot 0{,}9833 \\approx 29{,}3\\ \\mathrm{km/s}$ (началото на юли).',
              'Затова лятното полугодие в северното полукълбо е с ~7 дни по-дълго (Лекция 3).',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Трети закон: хармоничен закон
          </h2>
          <Theorem
            title="Трети закон на Кеплер"
            description="Квадратите на периодите на планетите се отнасят както кубовете на големите полуоси на орбитите им: $T_1^2 / T_2^2 = a_1^3 / a_2^3$. Ако $T$ е в години, а $a$ – в астрономически единици, за планетите от Слънчевата система $T^2 = a^3$."
          />

          <KeplerThirdLaw />

          <Theorem
            title="Третият закон във формата на Нютон"
            description="$T^2 = \frac{4\pi^2\cdot a^3}{G\cdot (M + m)}$. Константата зависи само от масата на централното тяло ($m$ обикновено се пренебрегва). Затова по орбитата на спътник може да се определи масата на планетата, звездата или черната дупка, около която обикаля."
          />
          <Example
            description="На какво разстояние от центъра на Земята е геостационарната орбита ($T = 1$ звезден ден $= 0{,}9973$ дни)? Сравнете с Луната ($a = 384\,400\ \mathrm{km},\ T = 27{,}32$ дни)."
            steps={[
              'Двата спътника обикалят едно и също тяло, затова $(a_{\\text{г}} / a_{\\text{☾}})^3 = (T_{\\text{г}} / T_{\\text{☾}})^2$.',
              '$T_{\\text{г}} / T_{\\text{☾}} = 0{,}9973 / 27{,}32 = 0{,}0365$.',
              '$a_{\\text{г}} = 384\\,400\\ \\mathrm{km} \\cdot 0{,}0365^{2/3} \\approx 384\\,400 \\cdot 0{,}110 \\approx 42\\,300\\ \\mathrm{km}$.',
              'Това е ~35 900 km над повърхността – там „висят“ телевизионните спътници.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Значение на законите
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                Законите важат за всяко тяло, обикалящо друго: планети, комети,
                спътници, двойни звезди, звезди около черната дупка в центъра на
                Галактиката.
              </li>
              <li>
                Чрез тях се изчисляват масите на небесните тела (Лекция 6).
              </li>
              <li>
                През 1846 г. малки отклонения на Уран от Кеплеровата му орбита
                позволили на Льо Верие да предскаже къде е непознатата планета,
                която го смущава. Нептун е открит на по-малко от 1° от
                предсказаното място.
              </li>
              <li>
                Всички космически мисии летят по Кеплерови орбити – например
                прелитането от Земята до Марс е половин елипса с перихелий при
                Земята и афелий при Марс (Лекция 8).
              </li>
              <li>
                По периода и „клатенето“ на звездите се откриват и измерват
                екзопланети (Лекция 30).
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. 🎯 Бърз тест
          </h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            7. 📝 Задачи за упражнение
          </h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />

            <Task
              id="a1"
              number={1}
              color="border-green-500"
              question="Къде се намира Слънцето спрямо орбитата на планетата?"
            >
              <p className="font-semibold">
                Отговор: в единия фокус на елипсата
              </p>
              <p>
                Според първия закон Слънцето не е в центъра на елипсата, а в
                единия фокус. Другият фокус е празна точка в пространството.
              </p>
            </Task>

            <Task
              id="a2"
              number={2}
              color="border-green-500"
              question="Къде планетата се движи по-бързо – в перихелий или в афелий? Защо?"
            >
              <p className="font-semibold">Отговор: в перихелий</p>
              <p>
                Радиус-векторът описва равни площи за равни времена. Близо до
                Слънцето той е по-къс, затова планетата трябва да измине
                по-дълга дъга за същото време.
              </p>
            </Task>

            <Task
              id="a3"
              number={3}
              color="border-green-500"
              question="Астероид обикаля Слънцето на средно разстояние 4 AU. Какъв е периодът му?"
            >
              <p><Tex>{'T^2 = a^3 = 4^3 = 64 \\to T = 8'}</Tex> години.</p>
              <p>
                <strong>Отговор: 8 години.</strong> Голямата полуос е 4 пъти
                по-голяма от земната, а периодът – 8 пъти.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task
              id="b1"
              number={4}
              color="border-yellow-500"
              question="Комета има перихелий 0,6 AU и афелий 35 AU. Изчисли голямата полуос, ексцентрицитета и периода."
            >
              <p><Tex>{'a = \\frac{0{,}6 + 35}{2} = 17{,}8\\ \\mathrm{AU}'}</Tex></p>
              <p><Tex>{'e = \\frac{35 - 0{,}6}{35 + 0{,}6} \\approx 0{,}966'}</Tex></p>
              <p><Tex>{'T = a^{3/2} = 17{,}8^{1{,}5} \\approx 75{,}1'}</Tex> години</p>
              <p>
                <strong>Почти като кометата на Халей (<Tex>{'T \\approx 76'}</Tex> години)!</strong>
              </p>
            </Task>

            <Task
              id="b2"
              number={5}
              color="border-yellow-500"
              question="Каква е голямата полуос на орбита с период 1000 години? А период на тяло на 0,1 AU?"
            >
              <p><Tex>{'a = T^{2/3} = 1000^{2/3} = 100\\ \\mathrm{AU}'}</Tex>.</p>
              <p><Tex>{'T = 0{,}1^{3/2} = 0{,}0316'}</Tex> години <Tex>{'\\approx 11{,}5'}</Tex> дни.</p>
            </Task>

            <Task
              id="b3"
              number={6}
              color="border-yellow-500"
              question="Изчисли радиуса на геостационарната орбита, като знаеш, че Луната обикаля Земята на 384 400 km за 27,32 дни."
            >
              <p>
                Геостационарният спътник обикаля за 1 звезден ден <Tex>{'= 0{,}9973'}</Tex> дни.
              </p>
              <p><Tex>{'a = 384\\,400 \\cdot (0{,}9973 / 27{,}32)^{2/3} \\approx 384\\,400 \\cdot 0{,}110'}</Tex></p>
              <p>
                <strong><Tex>{'a \\approx 42\\,300\\ \\mathrm{km}'}</Tex></strong> от центъра на Земята, т.е. ~35
                900 km над повърхността.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={7}
              color="border-red-500"
              question="Изведи третия закон на Кеплер във формата на Нютон за кръгова орбита."
            >
              <p>Гравитацията е центростремителна сила:</p>
              <p className="font-mono"><Tex>{'GMm / r^2 = m\\cdot v^2 / r \\to v^2 = GM / r'}</Tex></p>
              <p>За кръгова орбита <Tex>{'v = 2\\pi r / T'}</Tex>:</p>
              <p className="font-mono"><Tex>{'4\\pi^2r^2 / T^2 = GM / r'}</Tex></p>
              <p className="font-mono text-lg">
                <strong><Tex>{'T^2 = (4\\pi^2 / GM) \\cdot r^3'}</Tex></strong>
              </p>
              <p>
                За елиптична орбита <Tex>{'r'}</Tex> се заменя с голямата полуос <Tex>{'a'}</Tex>, а ако
                масата на спътника не е пренебрежима – <Tex>{'M'}</Tex> с <Tex>{'M + m'}</Tex>.
              </p>
            </Task>

            <Task
              id="c2"
              number={8}
              color="border-red-500"
              question="Луната Йо обикаля Юпитер на 421 700 km за 1,769 дни. Колко пъти Юпитер е по-масивен от Земята? (Луната: 384 400 km, 27,32 дни)"
            >
              <p>От <Tex>{'T^2 = \\frac{4\\pi^2a^3}{GM}'}</Tex> следва <Tex>{'M \\propto a^3 / T^2'}</Tex>. Затова:</p>
              <p className="font-mono"><Tex>{'M_{\\text{♃}} / M_{\\oplus} = (a_{\\text{Йо}} / a_{\\text{☾}})^3 \\cdot (T_{\\text{☾}} / T_{\\text{Йо}})^2'}</Tex></p>
              <p><Tex>{'= (1{,}097)^3 \\cdot (15{,}44)^2 \\approx 1{,}320 \\cdot 238{,}5 \\approx 315'}</Tex></p>
              <p>
                <strong>Отговор: ~315 пъти.</strong> Истинската стойност е 318 –
                разликата е, защото за системата Земя–Луна трябва да вземем <Tex>{'M_{\\oplus} + M_{\\text{☾}} = 1{,}012\\cdot M_{\\oplus}'}</Tex>: <Tex>{'315 \\cdot 1{,}012 \\approx 319'}</Tex>.
              </p>
            </Task>

            <Task
              id="c3"
              number={9}
              color="border-red-500"
              question="Кометата на Халей има период 76 години и перихелий 0,586 AU. Намери афелия, ексцентрицитета и отношението на скоростите в перихелия и афелия."
            >
              <p><Tex>{'a = 76^{2/3} \\approx 17{,}9\\ \\mathrm{AU}'}</Tex></p>
              <p>
                <Tex>{'r_a = 2a - r_p = 35{,}8 - 0{,}586 \\approx 35{,}3\\ \\mathrm{AU}'}</Tex> (отвъд орбитата на Нептун)
              </p>
              <p><Tex>{'e = 1 - r_p / a = 1 - 0{,}586 / 17{,}9 \\approx 0{,}967'}</Tex></p>
              <p>
                <Tex>{'v_p / v_a = r_a / r_p = 35{,}3 / 0{,}586 \\approx'}</Tex> <strong>60</strong>
              </p>
              <p>
                Кометата профучава покрай Слънцето за няколко месеца и прекарва
                десетилетия, бавно пълзейки далеч от него.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            8. Обобщение
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>
                ✓ <strong>I закон:</strong> орбитите са елипси със Слънцето в
                единия фокус; <Tex>{'r_p = a(1 - e),\\ r_a = a(1 + e)'}</Tex>{' '}
              </li>
              <li>
                ✓ <strong>II закон:</strong> равни площи за равни времена; <Tex>{'v_p / v_a = \\frac{1 + e}{1 - e}'}</Tex>{' '}
              </li>
              <li>
                ✓ <strong>III закон:</strong> <Tex>{'T^2 = a^3'}</Tex> (в години и AU)
              </li>
              <li>✓ Във вида на Нютон: <Tex>{'T^2 = \\frac{4\\pi^2a^3}{G(M + m)}'}</Tex></li>
              <li>✓ II законът следва от запазването на момента на импулса</li>
              <li>
                ✓ По орбитата на спътник се намира масата на централното тяло
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
              Кеплер е бил и автор на един от първите научнофантастични разкази
              – „Сънят“ (1634), в който описва пътуване до Луната и как изглежда
              Земята оттам. А майка му била съдена като вещица и самият Кеплер я
              защитавал години наред, докато успял да я освободи. Днес на името
              му е кръстен космическият телескоп „Кеплер“, открил хиляди
              екзопланети.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
