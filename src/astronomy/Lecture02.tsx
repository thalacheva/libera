import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import CoordinateSphere from './components/CoordinateSphere';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import { MathText, Tex } from '~/MathText';

const QUIZ: Question[] = [
  {
    question: 'Коя от координатите НЕ се променя при денонощното въртене?',
    answers: ['Азимут $A$', 'Височина $h$', 'Часов ъгъл $t$', 'Деклинация $\\delta$'],
    correctAnswer: 'Деклинация $\\delta$',
  },
  {
    question: 'Звезда е в горна кулминация. Колко е часовият ѝ ъгъл?',
    answers: ['$0^{\\mathrm{h}}$', '$6^{\\mathrm{h}}$', '$12^{\\mathrm{h}}$', 'Равен на $\\alpha$'],
    correctAnswer: '$0^{\\mathrm{h}}$',
  },
  {
    question: 'На колко градуса отговарят $4^{\\mathrm{h}}$ ректасцензия?',
    answers: ['$4^\\circ$', '$15^\\circ$', '$60^\\circ$', '$90^\\circ$'],
    correctAnswer: '$60^\\circ$',
  },
  {
    question: 'Звездното време е $S = 10^{\\mathrm{h}}$. Коя звезда кулминира в момента?',
    answers: [
      'Звездата с $\\alpha = 0^{\\mathrm{h}}$',
      'Звездата с $\\alpha = 10^{\\mathrm{h}}$',
      'Звездата с $\\delta = 10^\\circ$',
      'Звездата с $t = 10^{\\mathrm{h}}$',
    ],
    correctAnswer: 'Звездата с $\\alpha = 10^{\\mathrm{h}}$',
  },
  {
    question: 'Звезда има азимут $A = 90^\\circ$ и височина $h = 0^\\circ$. Къде е тя?',
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
  { earth: 'Географска ширина $\\varphi$', sky: 'Деклинация $\\delta$' },
  { earth: 'Географска дължина $\\lambda$', sky: 'Ректасцензия $\\alpha$' },
  { earth: 'Нулев меридиан (Гринуич)', sky: 'Пролетна точка ♈' },
  { earth: 'Северен / Южен полюс', sky: 'Полюси на света $P / P\'$' },
];

const SYSTEMS = [
  {
    name: 'Хоризонтална',
    circle: 'Хоризонт',
    origin: 'Северна точка С',
    coords: '$A$, $h$ ($z$)',
    time: 'Да',
    place: 'Да',
  },
  {
    name: 'I екваториална',
    circle: 'Небесен екватор',
    origin: 'Горна точка на екватора $Q$',
    coords: '$t$, $\\delta$',
    time: 'Само $t$',
    place: 'Само $t$ (по дължина)',
  },
  {
    name: 'II екваториална',
    circle: 'Небесен екватор',
    origin: 'Пролетна точка ♈',
    coords: '$\\alpha$, $\\delta$',
    time: 'Не',
    place: 'Не',
  },
  {
    name: 'Еклиптична',
    circle: 'Еклиптика',
    origin: 'Пролетна точка ♈',
    coords: '$\\lambda$, $\\beta$',
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
                    <td className="p-2"><MathText>{row.earth}</MathText></td>
                    <td className="p-2 font-semibold"><MathText>{row.sky}</MathText></td>
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
            title="Азимут $A$"
            description="Ъгълът по хоризонта от северната точка С до вертикалния кръг на звездата, отчитан по посока на часовниковата стрелка (С → И → Ю → З). Изменя се от 0° до 360°. Внимание: в някои учебници азимутът се отчита от южната точка на запад – винаги проверявайте коя е конвенцията!"
          />
          <Theorem
            type="definition"
            title="Височина $h$ и зенитно разстояние $z$"
            description="Височината $h$ е ъгълът от хоризонта до звездата по вертикалния кръг (от $-90^\circ$ до $+90^\circ$; отрицателна е за звезди под хоризонта). Зенитното разстояние е ъгълът от зенита до звездата: $z = 90^\circ - h$."
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
            3. Първа екваториална система (<Tex>{'t'}</Tex>, <Tex>{'\\delta'}</Tex>)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Сменяме основния кръг: вместо хоризонта използваме небесния екватор.
            Така едната координата престава да се мени при въртенето на небето –
            звездата се движи по успоредник на екватора и разстоянието ѝ до него
            остава същото.
          </p>
          <Theorem
            type="definition"
            title="Деклинация $\delta$"
            description="Ъгълът от небесния екватор до звездата, мерен по часовия ѝ кръг (кръга през $P$, $P'$ и звездата). От $+90^\circ$ (северен полюс) до $-90^\circ$ (южен полюс). Аналог на географската ширина."
          />
          <Theorem
            type="definition"
            title="Часов ъгъл $t$"
            description="Ъгълът по небесния екватор от горната точка $Q$ на екватора (където той пресича меридиана над хоризонта) до часовия кръг на звездата, отчитан на запад – по посока на видимото денонощно движение. Измерва се в часове: $0^{\mathrm{h}}\text{–}24^{\mathrm{h}}$, $1^{\mathrm{h}} = 15^\circ$."
          />
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">⏰ Защо в часове?</p>
            <p>
              Часовият ъгъл е като стрелка на часовник: расте равномерно с <Tex>{'1^{\\mathrm{h}}'}</Tex> за
              всеки час (звездно време). <Tex>{'t = 0^{\\mathrm{h}}'}</Tex> означава, че звездата кулминира
              (на меридиана, най-високо), <Tex>{'t = 12^{\\mathrm{h}}'}</Tex> – че е в долна кулминация, а <Tex>{'t = 3^{\\mathrm{h}}'}</Tex> – че е кулминирала преди 3 часа.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Втора екваториална система (<Tex>{'\\alpha'}</Tex>, <Tex>{'\\delta'}</Tex>)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Часовият ъгъл още зависи от времето. Решението: да отчитаме от
            точка, която се върти <em>заедно</em> със звездите – пролетната
            точка ♈. Това е системата на звездните каталози и картите.
          </p>
          <Theorem
            type="definition"
            title="Ректасцензия $\alpha$"
            description="Ъгълът по небесния екватор от пролетната точка ♈ до часовия кръг на звездата, отчитан на изток – обратно на денонощното движение. От $0^{\mathrm{h}}$ до $24^{\mathrm{h}}$. Аналог на географската дължина."
          />

          <CoordinateSphere initialMode="equatorial" />

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">✅ Предимство:</p>
            <p>
              <Tex>{'\\alpha'}</Tex> и <Tex>{'\\delta'}</Tex> са едни и същи за всички наблюдатели и почти не се променят
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
            title="Звездно време $S$"
            description="Часовият ъгъл на пролетната точка: $S = t_{\text{♈}}$. За един звезден ден ($23^{\mathrm{h}}\,56^{\mathrm{m}}\,04^{\mathrm{s}}$ слънчево време) $S$ нараства с $24^{\mathrm{h}}$."
          />
          <Theorem
            title="Основна формула на звездното време"
            description="За всяко светило в даден момент $S = t + \alpha$. Следователно светилото кулминира ($t = 0$), когато звездното време е равно на ректасцензията му: $S = \alpha$."
          />
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Изберете режим „Звездно време <Tex>{'S = t + \\alpha'}</Tex>“ в модела по-горе: трите
            дъги по екватора се събират точно като в равенството.
          </p>
          <Example
            description="В София звездното време е $S = 20^{\mathrm{h}}\,00^{\mathrm{m}}$. Къде е Вега ($\alpha = 18^{\mathrm{h}}\,37^{\mathrm{m}}$)?"
            steps={[
              'Часовият ъгъл е $t = S - \\alpha = 20^{\\mathrm{h}}\\,00^{\\mathrm{m}} - 18^{\\mathrm{h}}\\,37^{\\mathrm{m}} = 1^{\\mathrm{h}}\\,23^{\\mathrm{m}}$.',
              'Превръщаме в градуси: $1^{\\mathrm{h}}\\,23^{\\mathrm{m}} = 1{,}383^{\\mathrm{h}} \\times 15^\\circ/\\mathrm{h} \\approx 20{,}8^\\circ$.',
              '$t > 0$, значи Вега вече е минала меридиана и е на ~21° западно от него.',
              'Тя е кулминирала преди $1^{\\mathrm{h}}\\,23^{\\mathrm{m}}$ звездно време – при $S = 18^{\\mathrm{h}}\\,37^{\\mathrm{m}}$.',
            ]}
          />
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Превръщане часове ↔ градуси</h3>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                <Tex>{'1^{\\mathrm{h}} = 15^\\circ'}</Tex>{' '}
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                <Tex>{'1^{\\mathrm{m}} = 15\''}</Tex>{' '}
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded">
                <Tex>{'1^{\\mathrm{s}} = 15\'\''}</Tex>{' '}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Еклиптична система (<Tex>{'\\lambda'}</Tex>, <Tex>{'\\beta'}</Tex>)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            За Слънцето и планетите е удобно основният кръг да е еклиптиката.
            Еклиптичната дължина <Tex>{'\\lambda'}</Tex> се мери от ♈ на изток по еклиптиката, а
            еклиптичната ширина <Tex>{'\\beta'}</Tex> – от еклиптиката към полюса ѝ. Слънцето винаги
            има <Tex>{'\\beta = 0^\\circ'}</Tex>, а <Tex>{'\\lambda'}</Tex> нараства с около 1° на ден: на 21 юни <Tex>{'\\lambda_{\\odot} = 90^\\circ'}</Tex>, на
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
                    <td className="p-2 font-semibold"><MathText>{s.name}</MathText></td>
                    <td className="p-2"><MathText>{s.circle}</MathText></td>
                    <td className="p-2"><MathText>{s.origin}</MathText></td>
                    <td className="p-2 font-mono"><MathText>{s.coords}</MathText></td>
                    <td className="p-2"><MathText>{s.time}</MathText></td>
                    <td className="p-2"><MathText>{s.place}</MathText></td>
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
            Зенитът <Tex>{'Z'}</Tex>, полюсът <Tex>{'P'}</Tex> и звездата образуват сферичен триъгълник –
            т.нар. <strong>паралактичен триъгълник</strong>. Страните му са <Tex>{'90^\\circ - \\varphi'}</Tex> (от <Tex>{'P'}</Tex> до <Tex>{'Z'}</Tex>), <Tex>{'90^\\circ - \\delta'}</Tex> (от <Tex>{'P'}</Tex> до звездата) и <Tex>{'z'}</Tex> (от <Tex>{'Z'}</Tex> до звездата),
            а ъгълът при <Tex>{'P'}</Tex> е часовият ъгъл <Tex>{'t'}</Tex>. От сферичната косинусова теорема
            следва:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4 text-center">
            <p className="font-mono text-base sm:text-lg">
              <Tex>{'\\sin h = \\sin \\varphi \\cdot \\sin \\delta + \\cos \\varphi \\cdot \\cos \\delta \\cdot \\cos t'}</Tex>{' '}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">
              Важен частен случай – кулминации
            </h3>
            <p className="mb-2">
              При горна кулминация <Tex>{'t = 0'}</Tex> и <Tex>{'\\cos t = 1'}</Tex>, откъдето <Tex>{'\\sin h = \\cos (\\varphi - \\delta)'}</Tex>, т.е.:
            </p>
            <p className="font-mono text-center mb-2">
              <Tex>{'h_{\\text{горна}} = 90^\\circ - |\\varphi - \\delta|'}</Tex>{' '}
            </p>
            <p>
              Ако <Tex>{'\\delta = \\varphi'}</Tex>, звездата минава точно през зенита. Ако <Tex>{'\\delta < \\varphi'}</Tex>, тя
              кулминира на юг от зенита, а ако <Tex>{'\\delta > \\varphi'}</Tex> – на север от него.
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
              question="Намери зенитното разстояние при $h = 40^\circ$."
            >
              <p><Tex>{'z = 90^\\circ - h = 90^\\circ - 40^\\circ = 50^\\circ'}</Tex>.</p>
              <p>
                <strong>Отговор: <Tex>{'z = 50^\\circ'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="a2"
              number={2}
              color="border-green-500"
              question="Каква е височината на звезда, която е в зенита? А на звезда, която изгрява?"
            >
              <p>
                В зенита <Tex>{'z = 0^\\circ'}</Tex>, следователно <Tex>{'h = 90^\\circ'}</Tex>. При изгрев звездата е на
                хоризонта: <Tex>{'h = 0^\\circ'}</Tex>.
              </p>
            </Task>

            <Task
              id="a3"
              number={3}
              color="border-green-500"
              question="Колко градуса съответстват на 1 час ректасцензия?"
            >
              <p>
                Пълната окръжност е <Tex>{'360^\\circ = 24^{\\mathrm{h}}'}</Tex>, следователно <Tex>{'1^{\\mathrm{h}} = 360^\\circ / 24 = 15^\\circ'}</Tex>.
              </p>
            </Task>

            <Task
              id="a4"
              number={4}
              color="border-green-500"
              question="Бетелгейзе има ректасцензия $\alpha = 5^{\mathrm{h}}\,55^{\mathrm{m}}$. Изрази я в градуси."
            >
              <p><Tex>{'5^{\\mathrm{h}} = 75^\\circ'}</Tex>; <Tex>{'55^{\\mathrm{m}} = 55 \\times 15\' = 825\' = 13{,}75^\\circ'}</Tex>.</p>
              <p>
                <strong>Отговор: <Tex>{'\\alpha \\approx 88{,}75^\\circ'}</Tex></strong>
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
                <strong>Променят се:</strong> <Tex>{'A'}</Tex>, <Tex>{'h'}</Tex>, <Tex>{'z'}</Tex> (хоризонтални) и часовият
                ъгъл <Tex>{'t'}</Tex> – всички те се отчитат от точки, свързани с наблюдателя
                (С, <Tex>{'Z'}</Tex>, <Tex>{'Q'}</Tex>).
              </p>
              <p>
                <strong>Не се променят:</strong> <Tex>{'\\delta'}</Tex> и <Tex>{'\\alpha'}</Tex>. Деклинацията – защото
                звездата се движи успоредно на екватора. Ректасцензията – защото
                се отчита от ♈, която се върти заедно със звездите.
              </p>
            </Task>

            <Task
              id="b2"
              number={6}
              color="border-yellow-500"
              question="Каква трябва да е деклинацията на звезда, за да минава през зенита в София ($\varphi = 42{,}7^\circ$)? Минава ли Вега ($\delta = +38{,}8^\circ$) през зенита?"
            >
              <p>
                При горна кулминация <Tex>{'h = 90^\\circ - |\\varphi - \\delta| = 90^\\circ'}</Tex> само ако <Tex>{'\\delta = \\varphi ='}</Tex>{' '}
                <strong><Tex>{'+42{,}7^\\circ'}</Tex></strong>.
              </p>
              <p>
                За Вега <Tex>{'h = 90^\\circ - 3{,}9^\\circ = 86{,}1^\\circ'}</Tex> – тя минава на 3,9° южно от
                зенита, но не през него.
              </p>
            </Task>

            <Task
              id="b3"
              number={7}
              color="border-yellow-500"
              question="В кой момент (по звездно време) кулминира Сириус ($\alpha = 6^{\mathrm{h}}\,45^{\mathrm{m}},\ \delta = -16{,}7^\circ$) и на каква височина е тогава в София ($\varphi = 42{,}7^\circ$)?"
            >
              <p>
                Кулминацията е при <Tex>{'t = 0'}</Tex>, т.е. <Tex>{'S = \\alpha ='}</Tex> <strong><Tex>{'6^{\\mathrm{h}}\\,45^{\\mathrm{m}}'}</Tex></strong>.
              </p>
              <p>
                <Tex>{'h = 90^\\circ - |42{,}7^\\circ - (-16{,}7^\\circ)| = 90^\\circ - 59{,}4^\\circ ='}</Tex>{' '}
                <strong><Tex>{'30{,}6^\\circ'}</Tex></strong> над южната точка.
              </p>
            </Task>

            <Task
              id="b4"
              number={8}
              color="border-yellow-500"
              question="Звездното време е $S = 2^{\mathrm{h}}\,00^{\mathrm{m}}$. Звезда има часов ъгъл $t = 22^{\mathrm{h}}\,30^{\mathrm{m}}$. Каква е ректасцензията ѝ? Кулминирала ли е вече?"
            >
              <p>
                <Tex>{'\\alpha = S - t = 2^{\\mathrm{h}}\\,00^{\\mathrm{m}} - 22^{\\mathrm{h}}\\,30^{\\mathrm{m}} = -20^{\\mathrm{h}}\\,30^{\\mathrm{m}} \\to +24^{\\mathrm{h}} ='}</Tex>{' '}
                <strong><Tex>{'3^{\\mathrm{h}}\\,30^{\\mathrm{m}}'}</Tex></strong>.
              </p>
              <p>
                <Tex>{'t = 22^{\\mathrm{h}}\\,30^{\\mathrm{m}} = -1^{\\mathrm{h}}\\,30^{\\mathrm{m}}'}</Tex>: звездата е на изток от меридиана и ще
                кулминира след <Tex>{'1^{\\mathrm{h}}\\,30^{\\mathrm{m}}'}</Tex> – при <Tex>{'S = 3^{\\mathrm{h}}\\,30^{\\mathrm{m}} = \\alpha'}</Tex> ✓.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={9}
              color="border-red-500"
              question="Обясни как от екваториалните координати ($\alpha$, $\delta$) на звезда се получава височината ѝ $h$. Какви допълнителни данни са нужни?"
            >
              <p>Нужни са:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong><Tex>{'\\varphi'}</Tex></strong> – географската ширина на наблюдателя
                </li>
                <li>
                  <strong><Tex>{'S'}</Tex></strong> – местното звездно време (зависи от момента
                  и географската дължина)
                </li>
              </ul>
              <p>
                Първо намираме <Tex>{'t = S - \\alpha'}</Tex>, после от паралактичния триъгълник: <Tex>{'\\sin h = \\sin \\varphi \\sin \\delta + \\cos \\varphi \\cos \\delta \\cos t'}</Tex>.
              </p>
            </Task>

            <Task
              id="c2"
              number={10}
              color="border-red-500"
              question="Наблюдател на $\varphi = 43^\circ$ с.ш. вижда звезда с $\delta = +20^\circ$ при часов ъгъл $t = 3^{\mathrm{h}}$. Намери височината ѝ."
            >
              <p><Tex>{'t = 3^{\\mathrm{h}} = 45^\\circ'}</Tex>.</p>
              <p>
                <Tex>{'\\sin h = \\sin 43^\\circ \\cdot \\sin 20^\\circ + \\cos 43^\\circ \\cdot \\cos 20^\\circ \\cdot \\cos 45^\\circ = 0{,}682 \\cdot 0{,}342 + 0{,}731 \\cdot 0{,}940 \\cdot 0{,}707 \\approx 0{,}233 + 0{,}486 = 0{,}719'}</Tex>{' '}
              </p>
              <p>
                <strong><Tex>{'h \\approx 46{,}0^\\circ'}</Tex></strong>
              </p>
              <p>
                Проверка: при кулминация звездата би била на <Tex>{'90^\\circ - 23^\\circ = 67^\\circ'}</Tex>; 3
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
                ✓ Хоризонталната система (<Tex>{'A'}</Tex>, <Tex>{'h'}</Tex>) е интуитивна, но зависи от време
                и място
              </li>
              <li>
                ✓ I екваториална (<Tex>{'t'}</Tex>, <Tex>{'\\delta'}</Tex>): <Tex>{'\\delta'}</Tex> е постоянна, <Tex>{'t'}</Tex> расте с <Tex>{'1^{\\mathrm{h}}'}</Tex> на звезден
                час
              </li>
              <li>
                ✓ II екваториална (<Tex>{'\\alpha'}</Tex>, <Tex>{'\\delta'}</Tex>) е универсална – използва се в
                каталозите
              </li>
              <li>✓ <Tex>{'h + z = 90^\\circ'}</Tex>, <Tex>{'1^{\\mathrm{h}} = 15^\\circ'}</Tex></li>
              <li>✓ <Tex>{'S = t + \\alpha'}</Tex>; звездата кулминира, когато <Tex>{'S = \\alpha'}</Tex></li>
              <li>✓ <Tex>{'h'}</Tex> при горна кулминация <Tex>{'= 90^\\circ - |\\varphi - \\delta|'}</Tex></li>
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
              Любителските телескопи с „GoTo“ монтировка пресмятат точно <Tex>{'S = t + \\alpha'}</Tex>: въвеждате дата, час и място, а телескопът сам изчислява часовия
              ъгъл и се насочва. Космическият телескоп Gaia е измерил <Tex>{'\\alpha'}</Tex> и <Tex>{'\\delta'}</Tex> на
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
