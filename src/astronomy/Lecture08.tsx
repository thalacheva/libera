import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import HohmannTransfer from './components/HohmannTransfer';
import OrbitAltitudeExplorer from './components/OrbitAltitudeExplorer';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import VisVivaLab from './components/VisVivaLab';
import { MathText, Tex } from '~/MathText';

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
    answers: ['$2$ пъти', '$\\sqrt{2}$ пъти', '$1{,}5$ пъти', '$4$ пъти'],
    correctAnswer: '$\\sqrt{2}$ пъти',
  },
  {
    question:
      'Тяло е изстреляно хоризонтално със скорост между $v_1$ и $v_2$. По каква траектория ще се движи?',
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
  { name: 'Луна', v: '2,4', note: '$0{,}21 \\times$ Земя' },
  { name: 'Марс', v: '5,0', note: '$0{,}45 \\times$ Земя' },
  { name: 'Земя', v: '11,2', note: '1' },
  { name: 'Юпитер', v: '59,5', note: '$5{,}3 \\times$ Земя' },
  { name: 'Слънце (от повърхността)', v: '618', note: '$55 \\times$ Земя' },
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
            „бип-бип“. За да не падне, тя се движи с почти <Tex>{'8\\ \\mathrm{km/s}'}</Tex> – десетки пъти
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
            description="От $GMm / r^2 = m\cdot v^2 / r$ следва $v = \sqrt{GM / r}$. На повърхността на Земята ($r = R$) това е първата космическа скорост $v_1 = \sqrt{GM / R} = \sqrt{gR} \approx 7{,}9\ \mathrm{km/s}$. Периодът е $T = 2\pi r / v = 2\pi\cdot \sqrt{r^3 / GM}$ – третият закон на Кеплер."
          />

          <OrbitAltitudeExplorer />

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Познати орбити</h3>
            <ul className="text-sm space-y-2">
              <li>
                🛰️ <strong>МКС</strong> (~408 km): <Tex>{'v \\approx 7{,}66\\ \\mathrm{km/s}'}</Tex>, <Tex>{'T \\approx 92\\ \\mathrm{min}'}</Tex>
              </li>
              <li>
                📡 <strong>GPS</strong> (20 200 km): <Tex>{'v \\approx 3{,}87\\ \\mathrm{km/s}'}</Tex>, <Tex>{'T \\approx 12\\ \\mathrm{h}'}</Tex>
              </li>
              <li>
                📺 <strong>Геостационарна</strong> (35 786 km над екватора): <Tex>{'v \\approx 3{,}07\\ \\mathrm{km/s}'}</Tex>, <Tex>{'T = 23^{\\mathrm{h}}\\,56^{\\mathrm{m}}'}</Tex> – спътникът „виси“ над една точка
              </li>
              <li>
                🌙 <strong>Луната</strong> (384 400 km): <Tex>{'v \\approx 1{,}02\\ \\mathrm{km/s}'}</Tex>, <Tex>{'T \\approx 27{,}3'}</Tex>{' '}
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
            потенциална енергия <Tex>{'-\\frac{GMm}{r}'}</Tex>.
          </p>
          <Theorem
            title="Скорост за бягство (втора космическа скорост)"
            description="От $\tfrac{1}{2}\cdot m\cdot v^2 - \frac{GMm}{r} = 0$ следва $v_2 = \sqrt{2GM / r} = \sqrt{2} \cdot v_1$. За Земята $v_2 \approx 11{,}2\ \mathrm{km/s}$. Тя не зависи от масата на тялото и от посоката на изстрелване."
          />
          <Theorem
            title="Уравнение vis-viva"
            description="Скоростта на тяло по всяка Кеплерова орбита с голяма полуос $a$ на разстояние $r$ от центъра е $v^2 = GM\cdot (\frac{2}{r} - \frac{1}{a})$. При кръгова орбита $a = r$ и $v^2 = \frac{GM}{r}$; при парабола $a \to \infty$ и $v^2 = \frac{2GM}{r}$."
          />

          <VisVivaLab />

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Начална скорост</th>
                  <th className="p-2 text-left">Енергия</th>
                  <th className="p-2 text-left">Орбита</th>
                  <th className="p-2 text-left"><Tex>{'e'}</Tex></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['$v = v_1$', '$\\varepsilon < 0$', 'окръжност', '$0$'],
                  ['$v_1 < v < v_2$', '$\\varepsilon < 0$', 'елипса', '$0 < e < 1$'],
                  ['$v = v_2$', '$\\varepsilon = 0$', 'парабола', '$1$'],
                  ['$v > v_2$', '$\\varepsilon > 0$', 'хипербола', '$> 1$'],
                ].map(row => (
                  <tr
                    key={row[0]}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    {row.map(cell => (
                      <td key={cell} className="p-2 font-mono">
                        <MathText>{cell}</MathText>
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
                      <MathText>{row.note}</MathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm mt-2">
              Ако <Tex>{'v_2'}</Tex> стане равна на скоростта на светлината <Tex>{'c'}</Tex>, нищо не може да
              избяга – това е черна дупка (Лекция 21). Радиусът ѝ е <Tex>{'R = 2GM / c^2'}</Tex>.
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
            е <Tex>{'\\sqrt{2} \\cdot 29{,}8 \\approx 42{,}1\\ \\mathrm{km/s}'}</Tex>. Земята обаче вече ни носи с <Tex>{'29{,}8\\ \\mathrm{km/s}'}</Tex>!
          </p>
          <Example
            description="Колко е минималната скорост на изстрелване от Земята, за да напуснем Слънчевата система?"
            steps={[
              'Изстрелваме по посоката на движение на Земята. Далеч от Земята ни трябват $42{,}1 - 29{,}8 \\approx 12{,}3\\ \\mathrm{km/s}$ спрямо нея.',
              'При излитането трябва да преодолеем и привличането на Земята. По закона за запазване на енергията: $v_3^2 = v_2^2 + 12{,}3^2$.',
              '$v_3 = \\sqrt{11{,}2^2 + 12{,}3^2} \\approx 16{,}6\\ \\mathrm{km/s}$ – третата космическа скорост.',
              'Ако изстрелваме срещу движението на Земята, ще ни трябват над $70\\ \\mathrm{km/s}$! Посоката е от огромно значение.',
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
                Отговор: <Tex>{'v_1 \\approx 7{,}9\\ \\mathrm{km/s}'}</Tex> (~<Tex>{'28\\,400\\ \\mathrm{km/h}'}</Tex>)
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
                МКС се движи с ~<Tex>{'7{,}66\\ \\mathrm{km/s}'}</Tex>, за да е по кръгова орбита: тогава
                центростремителното ускорение <Tex>{'\\frac{v^2}{r}'}</Tex> е точно равно на
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
              question="Изчисли орбиталната скорост и периода на спътник на височина $400\ \mathrm{km}$ ($R = 6371\ \mathrm{km}$, $GM = 3{,}986\cdot 10^{14}\ \mathrm{m^{3}/s^{2}}$)."
            >
              <p><Tex>{'r = 6371 + 400 = 6771\\ \\mathrm{km} = 6{,}771\\cdot 10^6\\ \\mathrm{m}'}</Tex></p>
              <p>
                <Tex>{'v = \\sqrt{GM / r} = \\sqrt{3{,}986\\cdot 10^{14} / 6{,}771\\cdot 10^6} = \\sqrt{5{,}887\\cdot 10^7} \\approx 7670\\ \\mathrm{m/s}'}</Tex>{' '}
              </p>
              <p><Tex>{'T = 2\\pi r / v = 2\\pi \\cdot 6{,}771\\cdot 10^6 / 7670 \\approx 5550\\ \\mathrm{s} \\approx 92{,}5\\ \\mathrm{min}'}</Tex></p>
              <p>
                <strong>Отговор: <Tex>{'7{,}67\\ \\mathrm{km/s}'}</Tex> и ~92 минути</strong> – 15–16
                обиколки на ден.
              </p>
            </Task>

            <Task
              id="b2"
              number={5}
              color="border-yellow-500"
              question="Докажи, че скоростта за бягство е $\sqrt{2}$ пъти по-голяма от кръговата скорост на същото разстояние."
            >
              <p>Кръгова: <Tex>{'GMm / r^2 = mv_1^2 / r \\to v_1 = \\sqrt{GM / r}'}</Tex>.</p>
              <p>Бягство: <Tex>{'\\tfrac{1}{2}mv_2^2 = GMm / r \\to v_2 = \\sqrt{2GM / r}'}</Tex>.</p>
              <p><Tex>{'v_2 / v_1 = \\sqrt{2} \\approx 1{,}414'}</Tex>. За Земята: <Tex>{'11{,}2 / 7{,}9 \\approx 1{,}42'}</Tex> ✓</p>
            </Task>

            <Task
              id="b3"
              number={6}
              color="border-yellow-500"
              question="Изчисли скоростта за бягство от Луната ($M = 7{,}35\cdot 10^{22}\ \mathrm{kg},\ R = 1737\ \mathrm{km}$). Защо Луната няма атмосфера?"
            >
              <p>
                <Tex>{'v_2 = \\sqrt{\\frac{2GM}{R}} = \\sqrt{\\frac{2 \\cdot 6{,}674\\cdot 10^{-11} \\cdot 7{,}35\\cdot 10^{22}}{1{,}737\\cdot 10^6}} \\approx \\sqrt{5{,}65\\cdot 10^6} \\approx'}</Tex> <strong><Tex>{'2{,}38\\ \\mathrm{km/s}'}</Tex></strong>
              </p>
              <p>
                Молекулите на газовете при дневната температура на Луната (~120
                °C) се движат средно с ~<Tex>{'0{,}5\\ \\mathrm{km/s}'}</Tex>, а най-бързите от тях
                надвишават <Tex>{'2{,}4\\ \\mathrm{km/s}'}</Tex>. За милиарди години атмосферата е избягала в
                космоса.
              </p>
            </Task>

            <Task
              id="b4"
              number={7}
              color="border-yellow-500"
              question="Спътник се движи по елипса с перигей на височина 300 km и апогей 35 786 km. Каква е скоростта му в перигея? (Използвай vis-viva.)"
            >
              <p><Tex>{'r_p = 6671\\ \\mathrm{km},\\ r_a = 42\\,157\\ \\mathrm{km},\\ a = \\frac{r_p + r_a}{2} = 24\\,414\\ \\mathrm{km}'}</Tex></p>
              <p>
                <Tex>{'v^2 = GM(\\frac{2}{r_p} - \\frac{1}{a}) = 398\\,600 \\cdot (\\frac{2}{6671} - \\frac{1}{24\\,414}) \\approx 398\\,600 \\cdot 2{,}589\\cdot 10^{-4} \\approx 103{,}2'}</Tex>{' '}
              </p>
              <p>
                <strong><Tex>{'v_p \\approx 10{,}16\\ \\mathrm{km/s}'}</Tex></strong> – с <Tex>{'2{,}43\\ \\mathrm{km/s}'}</Tex> повече от
                кръговата скорост на <Tex>{'300\\ \\mathrm{km}'}</Tex> (<Tex>{'7{,}73\\ \\mathrm{km/s}'}</Tex>).
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={8}
              color="border-red-500"
              question="Астронавт на МКС ($h = 400\ \mathrm{km},\ T \approx 92{,}5\ \mathrm{min}$) хвърля топка напред със скорост $1\ \mathrm{m/s}$ спрямо станцията. Къде ще е топката след една обиколка?"
            >
              <p>
                Топката получава <Tex>{'\\Delta v = +1\\ \\mathrm{m/s}'}</Tex> и тръгва по елипса с перигей в
                точката на хвърлянето. Голямата ѝ полуос нараства с <Tex>{'\\Delta a = 2a\\cdot \\Delta v / v = 2 \\cdot 6771\\ \\mathrm{km} \\cdot 1 / 7670 \\approx 1{,}77\\ \\mathrm{km}'}</Tex>.
              </p>
              <p>
                След половин обиколка тя е ~3,5 km <em>по-високо</em> от
                станцията (в апогея).
              </p>
              <p>
                Периодът ѝ е по-дълъг: <Tex>{'\\Delta T / T = 1{,}5 \\cdot \\Delta a / a \\approx 3{,}9\\cdot 10^{-4}'}</Tex>, т.е. <Tex>{'\\Delta T \\approx 2{,}2\\ \\mathrm{s}'}</Tex>. След една обиколка топката се връща на височината на
                МКС, но <strong>изостава зад нея с ~<Tex>{'3\\cdot \\Delta v\\cdot T \\approx 17\\ \\mathrm{km}'}</Tex></strong>!
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
              question="Изведи третата космическа скорост ($v_3 \approx 16{,}6\ \mathrm{km/s}$), като знаеш, че Земята обикаля Слънцето с $29{,}8\ \mathrm{km/s}$, а $v_2 = 11{,}2\ \mathrm{km/s}$."
            >
              <p>
                Скорост за бягство от Слънцето на 1 AU: <Tex>{'\\sqrt{2} \\cdot 29{,}8 \\approx 42{,}1\\ \\mathrm{km/s}'}</Tex>.
                Изстрелвайки по посоката на Земята, извън земното притегляне ни
                трябват <Tex>{'v_{\\infty} = 42{,}1 - 29{,}8 = 12{,}3\\ \\mathrm{km/s}'}</Tex>.
              </p>
              <p>
                Енергия на единица маса при старта: <Tex>{'\\tfrac{1}{2}v_3^2 - \\frac{GM_{\\oplus}}{R} = \\tfrac{1}{2}v_{\\infty}^2'}</Tex>, а <Tex>{'\\frac{GM_{\\oplus}}{R} = \\tfrac{1}{2}v_2^2'}</Tex>.
              </p>
              <p>
                <Tex>{'v_3 = \\sqrt{v_2^2 + v_{\\infty}^2} = \\sqrt{11{,}2^2 + 12{,}3^2} \\approx'}</Tex>{' '}
                <strong><Tex>{'16{,}6\\ \\mathrm{km/s}'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="c3"
              number={10}
              color="border-red-500"
              question="Кораб лети до Марс ($a = 1{,}524\ \mathrm{AU}$) по преход на Хоман. Колко трае полетът? Под какъв ъгъл пред Земята трябва да е Марс при старта и колко често се повтаря такава възможност?"
            >
              <p><Tex>{'a_{\\text{пр}} = \\frac{1 + 1{,}524}{2} = 1{,}262\\ \\mathrm{AU}'}</Tex></p>
              <p><Tex>{'t = \\tfrac{1}{2} \\cdot a^{3/2} = \\tfrac{1}{2} \\cdot 1{,}262^{1{,}5} \\approx 0{,}709'}</Tex> години <Tex>{'\\approx 259'}</Tex> дни</p>
              <p>
                За това време Марс изминава <Tex>{'360^\\circ \\cdot 0{,}709 / 1{,}881 \\approx 136^\\circ'}</Tex>. Той
                трябва да пристигне в точката, противоположна на старта (180°),
                значи при старта е <strong>~44° пред Земята</strong>.
              </p>
              <p>
                Същото взаимно положение се повтаря през синодичния период: <Tex>{'\\frac{1}{S} = 1 - \\frac{1}{1{,}881} \\to S \\approx 2{,}14'}</Tex> години ≈ <strong>26 месеца</strong>.
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
              <li>✓ Кръгова скорост <Tex>{'v = \\sqrt{\\frac{GM}{r}}'}</Tex>; по-високо = по-бавно</li>
              <li>✓ Скорост за бягство <Tex>{'v_2 = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2}\\cdot v_1'}</Tex></li>
              <li>✓ Vis-viva: <Tex>{'v^2 = GM(\\frac{2}{r} - \\frac{1}{a})'}</Tex></li>
              <li>✓ Земя: <Tex>{'v_1 = 7{,}9\\ \\mathrm{km/s},\\ v_2 = 11{,}2\\ \\mathrm{km/s},\\ v_3 = 16{,}6\\ \\mathrm{km/s}'}</Tex></li>
              <li>
                ✓ Окръжност (<Tex>{'e = 0'}</Tex>), елипса (<Tex>{'0 < e < 1'}</Tex>), парабола (<Tex>{'e = 1'}</Tex>),
                хипербола (<Tex>{'e > 1'}</Tex>)
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
              1“, изстрелян през 1977 г., се движи с ~<Tex>{'17\\ \\mathrm{km/s}'}</Tex> спрямо Слънцето и
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
