import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Drill, gcd, pick, randInt } from '~/drill';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import Trainer from '~/Trainer';
import { WordProblems, type WordProblem } from '~/WordProblems';
import DecimalLab from './DecimalLab';
import NumberSetsLab from './NumberSetsLab';
import ZoomLab from './ZoomLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Периодът на 1/q – чрез деление с остатък. */
function periodOf(q: number) {
  let r = 1;
  let s = '';
  const seen: number[] = [];
  while (!seen.includes(r)) {
    seen.push(r);
    s += Math.floor((r * 10) / q);
    r = (r * 10) % q;
  }
  return s;
}

const newDrill = (): Drill => {
  const kind = randInt(0, 4);
  if (kind === 0) {
    let n = 0;
    while (n % 11 === 0) n = randInt(1, 98);
    const ab = String(n).padStart(2, '0');
    const g = gcd(n, 99);
    return {
      tex: `0{,}(${ab})`,
      ask: 'Запишете като несъкратима обикновена дроб.',
      num: n / g,
      den: 99 / g,
      steps: [`Нека $x = 0{,}(${ab})$. Тогава $100x = ${n}{,}(${ab})$.`, `Изваждаме: $99x = ${n}$`, `$x = \\frac{${n}}{99}${g > 1 ? ` = \\frac{${n / g}}{${99 / g}}` : ''}$`],
    };
  }
  if (kind === 1) {
    const a = randInt(1, 9);
    let b = a;
    while (b === a) b = randInt(1, 9);
    const top = 10 * a + b - a;
    const g = gcd(top, 90);
    return {
      tex: `0{,}${a}(${b})`,
      ask: 'Запишете като несъкратима обикновена дроб.',
      num: top / g,
      den: 90 / g,
      steps: [`Нека $x = 0{,}${a}(${b})$. Тогава $10x = ${a}{,}(${b})$ и $100x = ${a}${b}{,}(${b})$.`, `Изваждаме: $90x = ${a}${b} - ${a} = ${top}$`, `$x = \\frac{${top}}{90}${g > 1 ? ` = \\frac{${top / g}}{${90 / g}}` : ''}$`],
    };
  }
  if (kind === 2) {
    let a = 0;
    let b = 0;
    while (a + b === 0) [a, b] = [randInt(0, 4), randInt(0, 4)];
    const den = 2 ** a * 5 ** b;
    const p = pick([1, 3, 7, 9, 11, 13, 17, 19, 21, 23]);
    const k = Math.max(a, b);
    return {
      tex: `\\frac{${p}}{${den}}`,
      ask: 'Колко цифри след десетичната запетая има?',
      num: k,
      den: 1,
      steps: [
        `$${den} = ${[a ? `2^{${a}}` : '', b ? `5^{${b}}` : ''].filter(Boolean).join(' \\cdot ')}$ – само двойки и петици, значи дробта е крайна.`,
        `Допълваме до $10^{${k}}$: $\\frac{${p}}{${den}} = \\frac{${p * 10 ** k / den}}{10^{${k}}} = ${(p / den).toFixed(k).replace('.', '{,}')}$`,
        `${k} цифри след запетаята`,
      ],
    };
  }
  if (kind === 3) {
    const q = pick([3, 7, 11, 13, 21, 27, 37, 41, 101]);
    const per = periodOf(q);
    return {
      tex: `\\frac{1}{${q}}`,
      ask: 'Колко цифри има периодът?',
      num: per.length,
      den: 1,
      steps: [`Делим 1 на ${q}, докато остатъкът се повтори.`, `$\\frac{1}{${q}} = 0{,}(${per})$`, `Периодът има ${per.length} ${per.length === 1 ? 'цифра' : 'цифри'}`],
    };
  }
  const nonSquare = () => {
    let v = 4;
    while (Number.isInteger(Math.sqrt(v))) v = randInt(2, 90);
    return v;
  };
  const [a, b] = [nonSquare(), nonSquare()];
  const [fa, fb] = [Math.floor(Math.sqrt(a)), Math.floor(Math.sqrt(b))];
  return {
    tex: `-\\sqrt{${a}} < x < \\sqrt{${b}}`,
    ask: 'Колко цели числа $x$ има в интервала?',
    num: fa + fb + 1,
    den: 1,
    steps: [
      `$${fa}^2 = ${fa * fa} < ${a} < ${(fa + 1) ** 2}$, значи $-${fa + 1} < -\\sqrt{${a}} < -${fa}$`,
      `$${fb}^2 = ${fb * fb} < ${b} < ${(fb + 1) ** 2}$, значи $${fb} < \\sqrt{${b}} < ${fb + 1}$`,
      `Целите числа от $-${fa}$ до $${fb}$ са $${fa} + ${fb} + 1 = ${fa + fb + 1}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '📄 Тайната на листа A4',
    problem:
      'Листовете от серия A имат отношение на страните $\\sqrt{2} : 1$ – така, разрязан наполовина, листът запазва формата си. Листът A0 има лице $1\\ \\mathrm{m}^2$, а A4 се получава, като A0 се разреже наполовина 4 пъти. Намерете страните на A4 в милиметри.',
    solution: [
      'За A0: $a \\cdot a\\sqrt{2} = 1$, откъдето $a = \\frac{1}{\\sqrt[4]{2}} \\approx 0{,}841\\ \\mathrm{m}$ и $a\\sqrt{2} \\approx 1{,}189\\ \\mathrm{m}$.',
      'Всяко разрязване наполовина намалява страните $\\sqrt{2}$ пъти; след 4 разрязвания – $(\\sqrt{2})^4 = 4$ пъти.',
      'A4: $841 : 4 \\approx 210\\ \\mathrm{mm}$ и $1189 : 4 \\approx 297\\ \\mathrm{mm}$ – точно размерите на обикновения лист.',
    ],
    answer: '210 mm × 297 mm',
    check: [210, 297],
    ask: ['къса страна, mm', 'дълга страна, mm'],
  },
  {
    title: '🎹 Пианото и дванадесетият корен от 2',
    problem:
      'В съвременния строй всеки полутон умножава честотата по $\\sqrt[12]{2}$ – ирационално число. Тонът ла има честота $440\\ \\mathrm{Hz}$, а ми е 7 полутона по-високо. Каква е честотата на ми на пианото и каква би била в „чистия“ строй на Питагор, където отношението е точно $\\frac{3}{2}$?',
    solution: [
      'На пианото: $440 \\cdot 2^{7/12} \\approx 440 \\cdot 1{,}4983 \\approx 659\\ \\mathrm{Hz}$.',
      'В чистия строй: $440 \\cdot \\frac{3}{2} = 660\\ \\mathrm{Hz}$.',
      'Числото $2^{k/12}$ е рационално само когато $k$ се дели на 12 (октави), затова пианото винаги е „малко фалшиво“ – съвсем малко, но опитното ухо го чува.',
    ],
    answer: 'около 659 Hz и 660 Hz',
    check: [659, 660],
    ask: ['на пианото, Hz', 'чист строй, Hz'],
  },
  {
    title: '🥧 Дроби за π',
    problem:
      'Архимед е използвал приближението $\\pi \\approx \\frac{22}{7}$, а китайският математик Дзу Чунджъ през V век – $\\frac{355}{113}$. С колко верни цифри след десетичната запетая $\\frac{355}{113}$ дава π (π = 3,14159265…)?',
    solution: ['$\\frac{22}{7} = 3{,}142857\\ldots$ – само 2 верни цифри след запетаята.', '$\\frac{355}{113} = 3{,}14159292\\ldots$', 'Съвпадат 3,141592 – 6 верни цифри. Но никоя дроб не е точно π, защото π е ирационално.'],
    answer: '6 цифри',
    check: [6],
    ask: ['верни цифри'],
  },
  {
    title: '🛒 Изгубеният цент',
    problem:
      'Магазин продава пакет от 3 бутилки за 10 €. Касата пресмята цената на една бутилка и я закръгля до цент. Ресторант купува 300 бутилки поотделно по закръглената цена. С колко евро плаща по-малко, отколкото за 100 пакета?',
    solution: ['$10 : 3 = 3{,}(3)$ € – безкрайна периодична дроб; касата я закръгля до $3{,}33$ €.', '$300 \\cdot 3{,}33 = 999$ €, а 100 пакета струват $1000$ €.', 'Разлика 1 € – по $0{,}(3)$ цента на бутилка.'],
    answer: '1 €',
    check: [1],
    ask: ['евро'],
  },
  {
    title: '🧱 Диагоналът на плочката',
    problem: 'Квадратна плочка е със страна $30\\ \\mathrm{cm}$. Колко е диагоналът ѝ, закръглен до милиметър? Може ли да се измери точно с линийка?',
    solution: ['По Питагоровата теорема $d = \\sqrt{30^2 + 30^2} = 30\\sqrt{2}$.', '$30\\sqrt{2} \\approx 42{,}4\\ \\mathrm{cm}$', 'Точно – не: $30\\sqrt{2}$ е ирационално, а всяко деление на линийката е рационално число. Можем само да се доближим колкото искаме.'],
    answer: '≈ 42,4 cm',
    check: [42.4],
    ask: ['диагонал, cm'],
  },
  {
    title: '🌻 Златното сечение',
    problem:
      'Числото $\\varphi = \\frac{1 + \\sqrt{5}}{2}$ (златното сечение) е ирационално. Отношенията на поредни числа на Фибоначи (1, 1, 2, 3, 5, 8, 13, 21, 34, …) се доближават до него. Пресметнете φ и $\\frac{34}{21}$ с три знака след запетаята.',
    solution: ['$\\sqrt{5} \\approx 2{,}2361$, затова $\\varphi \\approx \\frac{3{,}2361}{2} \\approx 1{,}618$.', '$\\frac{34}{21} \\approx 1{,}619$', 'Рационалните отношения на Фибоначи се доближават до φ все повече, но никога не стават равни на него.'],
    answer: 'φ ≈ 1,618; 34/21 ≈ 1,619',
    check: [1.618, 1.619],
    ask: ['φ', '34/21'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кое от числата е ирационално?',
    answers: ['$\\sqrt{7}$', '$\\sqrt{49}$', '$0{,}(7)$', '$\\frac{7}{3}$'],
    correctAnswer: '$\\sqrt{7}$',
  },
  {
    question: 'Кое е вярно?',
    answers: ['$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$', '$\\mathbb{Z} \\subset \\mathbb{N} \\subset \\mathbb{Q} \\subset \\mathbb{R}$', '$\\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{N} \\subset \\mathbb{R}$', '$\\mathbb{N} \\subset \\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{R}$'],
    correctAnswer: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$',
  },
  {
    question: 'На коя обикновена дроб е равно $0{,}(18)$?',
    answers: ['$\\frac{2}{11}$', '$\\frac{9}{50}$', '$\\frac{18}{100}$', '$\\frac{1}{18}$'],
    correctAnswer: '$\\frac{2}{11}$',
  },
  {
    question: 'Коя дроб се записва като крайна десетична дроб?',
    answers: ['$\\frac{7}{40}$', '$\\frac{1}{6}$', '$\\frac{2}{15}$', '$\\frac{5}{12}$'],
    correctAnswer: '$\\frac{7}{40}$',
  },
  {
    question: 'На колко е равно $0{,}(9) = 0{,}999\\ldots$?',
    answers: ['$1$', 'на число, малко по-малко от 1', '$0{,}9$', 'не е число'],
    correctAnswer: '$1$',
  },
  {
    question: 'Сборът на две ирационални числа е:',
    answers: ['понякога рационален, понякога ирационален', 'винаги ирационален', 'винаги рационален', 'винаги цяло число'],
    correctAnswer: 'понякога рационален, понякога ирационален',
  },
  {
    question: 'Сборът на рационално и ирационално число е:',
    answers: ['винаги ирационален', 'винаги рационален', 'понякога рационален', 'винаги цяло число'],
    correctAnswer: 'винаги ирационален',
  },
  {
    question: 'Кое число е между $\\frac{1}{3}$ и $\\frac{1}{2}$?',
    answers: ['$\\frac{5}{12}$', '$\\frac{1}{4}$', '$\\frac{2}{3}$', '$\\frac{3}{10}$'],
    correctAnswer: '$\\frac{5}{12}$',
  },
  {
    question: 'Колко цели числа $x$ удовлетворяват $-\\sqrt{10} < x < \\sqrt{10}$?',
    answers: ['$7$', '$6$', '$3$', '$20$'],
    correctAnswer: '$7$',
  },
];

// ---------- Страница ----------

export function NumberSets() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Видове числа</h1>

        <div className="bg-gradient-to-br from-violet-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏛️ „Всичко е число“ – учели питагорейците в Древна Гърция. Под „число“ разбирали цяло число или отношение на цели числа. Вярвали, че
            всяка дължина може да се изрази така. После някой от тях – според преданието Хипас от Метапонт – открил, че диагоналът на квадрат
            със страна 1 не е отношение на никакви цели числа. Легендата разказва, че боговете го наказали, като потънал в морето. Истина или не,
            откритието разклатило гръцката математика – и дало началото на ирационалните числа.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Естествени и цели числа</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Вярно ли е, че <Tex>{'0{,}999\\ldots = 1'}</Tex>? Повечето хора казват „не, малко по-малко е“. До края на
              урока ще можеш да докажеш кой е прав.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Естествени числа"
            description="Числата, с които броим: $\mathbb{N} = \{1, 2, 3, \ldots\}$. Дали 0 е естествено число, е въпрос на уговорка: в много учебници не е, а в други (и в международния стандарт ISO 80000-2) $\mathbb{N}$ започва от 0. Сборът и произведението на естествени числа е естествено число, но разликата и частното – не винаги: $3 - 5$ и $3 : 5$ не са естествени."
          />
          <Theorem
            type="definition"
            title="Цели числа"
            description="Естествените числа, нулата и противоположните на естествените: $\mathbb{Z} = \{\ldots, -2, -1, 0, 1, 2, \ldots\}$. Буквата идва от немската дума Zahlen – „числа“. В $\mathbb{Z}$ вече можем да изваждаме без ограничения, но не и да делим: $7 : 2$ не е цяло число."
          />
          <p className={text}>
            Всяко ново множество числа се появява, за да може да се извършва действие, което в старото не винаги е възможно. Отрицателните числа
            използват китайски математици преди повече от 2000 години, а индиецът Брахмагупта (VII век) описва правила за „дългове“ и
            „имущества“. В Европа те дълго се смятат за „абсурдни“ – чак до XVII–XVIII век.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Рационални числа</h2>
          <Theorem
            type="definition"
            title="Рационални числа"
            description="Число, което може да се запише като дроб $\frac{p}{q}$, където $p$ е цяло, а $q \ne 0$ – естествено число: $\mathbb{Q} = \left\{\frac{p}{q} : p \in \mathbb{Z},\ q \in \mathbb{N}\right\}$. Например $\frac{3}{4}$, $-2{,}5 = -\frac{5}{2}$, $7 = \frac{7}{1}$. Името идва от латинското ratio – „отношение“, а буквата – от quotient, „частно“."
          />
          <p className={text}>
            В <Tex>{'\\mathbb{Q}'}</Tex> можем да събираме, изваждаме, умножаваме и делим (без деление на 0) – резултатът винаги е рационално число. Освен
            това рационалните числа са <strong>гъсти</strong>: между всеки две има трето, например средното им аритметично{' '}
            <Tex>{'\\frac{a + b}{2}'}</Tex>. Значи между всеки две рационални числа има безброй много други.
          </p>
          <NumberSetsLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Десетичен запис на рационалните числа</h2>
          <Theorem
            title="Крайни и периодични дроби"
            description="Всяко рационално число се записва като крайна или като безкрайна периодична десетична дроб – и обратно, всяка такава дроб е рационално число. Несъкратимата дроб $\frac{p}{q}$ е крайна точно когато $q$ няма други прости делители освен 2 и 5: $\frac{7}{40} = 0{,}175$, но $\frac{1}{6} = 0{,}1(6)$ и $\frac{5}{7} = 0{,}(714285)$."
          />
          <p className={text}>
            Защо периодът е неизбежен? При деление на <Tex>{'q'}</Tex> остатъците са най-много <Tex>{'q'}</Tex> различни числа. Щом някой остатък се
            повтори, делението тръгва отначало и цифрите – също. Пробвай сам в лабораторията (повече за остатъците има в урока{' '}
            <Link to="/numbers/divisibility" className={link}>
              Делимост и прости числа
            </Link>
            ).
          </p>
          <DecimalLab />
          <Example
            description="Да запишем $0{,}2(45) = 0{,}2454545\ldots$ като обикновена дроб."
            steps={[
              'Нека $x = 0{,}2(45)$. Местим запетаята пред периода и след първия период: $10x = 2{,}(45)$ и $1000x = 245{,}(45)$.',
              'Изваждаме – безкрайните „опашки“ се унищожават: $990x = 245 - 2 = 243$.',
              '$x = \\frac{243}{990} = \\frac{27}{110}$',
            ]}
          />
          <Example
            description="Отговорът на загадката: на колко е равно $0{,}(9)$?"
            steps={['Нека $x = 0{,}(9)$. Тогава $10x = 9{,}(9)$.', 'Изваждаме: $9x = 9$, т.е. $x = 1$.', 'Друг начин: $\\frac{1}{3} = 0{,}(3)$; умножаваме по 3 и получаваме $1 = 0{,}(9)$. Едно число може да има два десетични записа!']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Ирационални числа</h2>
          <Theorem
            type="definition"
            title="Ирационални числа"
            description="Реално число, което не е рационално, т.е. не може да се запише като дроб $\frac{p}{q}$ с цели $p$ и $q$. Десетичният му запис е безкраен и непериодичен. Примери: $\sqrt{2} = 1{,}41421\ldots$, $\pi = 3{,}14159\ldots$, $e = 2{,}71828\ldots$, $0{,}1010010001\ldots$"
          />
          <Theorem title="Числото √2 е ирационално" description="Не съществуват цели числа $p$ и $q \ne 0$, за които $\left(\frac{p}{q}\right)^2 = 2$." />
          <p className={text}>
            <strong>Доказателство (от противното).</strong> Да допуснем, че <Tex>{'\\sqrt{2} = \\frac{p}{q}'}</Tex> и дробта е несъкратима.
          </p>
          <ol className="list-decimal ml-8 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              Тогава <Tex>{'p^2 = 2q^2'}</Tex> – значи <Tex>{'p^2'}</Tex> е четно, а оттам и <Tex>{'p'}</Tex> е четно (квадратът на нечетно число е
              нечетен): <Tex>{'p = 2k'}</Tex>.
            </li>
            <li>
              Заместваме: <Tex>{'4k^2 = 2q^2'}</Tex>, т.е. <Tex>{'q^2 = 2k^2'}</Tex> – и <Tex>{'q'}</Tex> е четно.
            </li>
            <li>И <Term id="numerator">числителят</Term>, и <Term id="denominator">знаменателят</Term> се делят на 2 – противоречие с несъкратимостта. Значи √2 не е рационално.</li>
          </ol>
          <Theorem
            title="Кога коренът е ирационален"
            description="Ако естественото число $n$ не е точен квадрат, то $\sqrt{n}$ е ирационално. Така $\sqrt{3}$, $\sqrt{5}$, $\sqrt{8}$ са ирационални, а $\sqrt{9} = 3$ и $\sqrt{\frac{4}{25}} = \frac{2}{5}$ – не."
          />
          <p className={text}>
            Сборът, разликата, произведението и частното на рационално число <Tex>{'r \\ne 0'}</Tex> и ирационално число са винаги ирационални: ако{' '}
            <Tex>{'r + \\alpha = s'}</Tex> беше рационално, и <Tex>{'\\alpha = s - r'}</Tex> щеше да е рационално. Но две ирационални числа могат да
            дадат рационален резултат: <Tex>{'\\sqrt{2} + (-\\sqrt{2}) = 0'}</Tex>, <Tex>{'\\sqrt{2} \\cdot \\sqrt{8} = 4'}</Tex>. Ирационалността на
            π доказва Йохан Ламберт през 1761 г. – доказателството е много по-трудно.
          </p>
          <Example
            description="Ирационално ли е числото $\sqrt{2} + \sqrt{3}$?"
            steps={[
              'Да допуснем, че $\\sqrt{2} + \\sqrt{3} = r$ е рационално. Повдигаме на квадрат: $5 + 2\\sqrt{6} = r^2$.',
              'Тогава $\\sqrt{6} = \\frac{r^2 - 5}{2}$ е рационално.',
              'Но 6 не е точен квадрат, така че $\\sqrt{6}$ е ирационално – противоречие. Значи $\\sqrt{2} + \\sqrt{3}$ е ирационално.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Реални числа и числовата ос</h2>
          <Theorem
            type="definition"
            title="Реални числа"
            description="Рационалните и ирационалните числа заедно образуват реалните числа $\mathbb{R}$. Всяко реално число е точка от числовата ос и всяка точка от оста е реално число. Множествата са вложени едно в друго: $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$."
          />
          <p className={text}>
            Макар рационалните числа да са гъсти, те оставят „дупки“ по оста: в точката √2 няма рационално число. Ирационалните числа запълват
            тези дупки. С пергел √2 може да се нанесе точно: това е диагоналът на квадрат със страна 1, завъртян до оста. В лабораторията
            „увеличаваме“ оста с лупа – при всяко увеличение ×10 се показва още една цифра.
          </p>
          <ZoomLab />
          <p className={text}>
            Реалните числа не са краят: уравнението <Tex>{'x^2 = -1'}</Tex> няма реален корен. Затова математиците въвеждат{' '}
            <Link to="/algebra/complex" className={link}>
              комплексните числа
            </Link>{' '}
            <Tex>{'\\mathbb{C}'}</Tex>, и тогава <Tex>{'\\mathbb{R} \\subset \\mathbb{C}'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Периодични дроби, крайни дроби и цели числа между корени. Дробите въвеждай с наклонена черта, например 3/11.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка и опитай със следващата задача." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Рационални и ирационални числа около нас</h2>
          <p className={text}>
            Всяко измерване дава рационално число – линийката и калкулаторът знаят само краен брой цифри. Но зад формата на листа хартия, тоновете
            на пианото и кръга се крият ирационални числа.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Корен = ирационално', '$\\sqrt{9}$ е ирационално, защото има корен', '$\\sqrt{9} = 3$; ирационален е коренът само от число, което не е точен квадрат'],
              ['Безкрайна дроб', '$0{,}(3)$ е ирационално, защото цифрите не свършват', '$0{,}(3) = \\frac{1}{3}$; ирационални са само непериодичните безкрайни дроби'],
              ['Сбор на ирационални', '$\\alpha$ и $\\beta$ ирационални $\\Rightarrow \\alpha + \\beta$ е ирационално', '$\\sqrt{2} + (-\\sqrt{2}) = 0$ е рационално'],
              ['Числото π', '$\\pi = \\frac{22}{7}$ или $\\pi = 3{,}14$', 'това са приближения; π е ирационално'],
              ['Дроб с корени', '$\\frac{\\sqrt{2}}{2}$ е рационално, защото е дроб', 'в $\\frac{p}{q}$ числата $p$ и $q$ трябва да са цели'],
              ['Числото $0{,}(9)$', '$0{,}(9) < 1$', '$0{,}(9) = 1$ – две записвания на едно и също число'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1"><MathText displayStyle>{title}</MathText></p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">✗ <MathText displayStyle>{wrong}</MathText></p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">✓ <MathText displayStyle>{right}</MathText></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Кои от числата $-5$, $\frac{3}{4}$, $\sqrt{16}$, $\sqrt{7}$, $0{,}(12)$, $\pi$, $-\frac{8}{2}$ са цели, кои са рационални и кои – ирационални?">
                <p>Цели: <Tex>{'-5'}</Tex>, <Tex>{'\\sqrt{16} = 4'}</Tex> и <Tex>{'-\\frac{8}{2} = -4'}</Tex> (от тях естествено е само 4).</p>
                <p>Рационални: всички цели и още <Tex>{'\\frac{3}{4}'}</Tex> и <Tex>{'0{,}(12) = \\frac{12}{99} = \\frac{4}{33}'}</Tex>.</p>
                <p>Ирационални: <Tex>{'\\sqrt{7}'}</Tex> (7 не е точен квадрат) и <Tex>{'\\pi'}</Tex>.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Запишете $0{,}(27)$ като несъкратима обикновена дроб." check={[3 / 11]} ask={['дроб']}>
                <p><Tex>{'x = 0{,}(27) \\Rightarrow 100x = 27{,}(27)'}</Tex></p>
                <p><Tex>{'99x = 27 \\Rightarrow x = \\frac{27}{99} = \\frac{3}{11}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Крайна ли е десетичната дроб, равна на $\frac{7}{40}$? Ако да, намерете я." check={[0.175]} ask={['десетична дроб']}>
                <p><Tex>{'40 = 2^3 \\cdot 5'}</Tex> – само двойки и петици, значи дробта е крайна.</p>
                <p><Tex>{'\\frac{7}{40} = \\frac{7 \\cdot 25}{1000} = \\frac{175}{1000} = 0{,}175'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Запишете $0{,}1(6)$ и $1{,}2(3)$ като обикновени дроби." check={[1 / 6, 37 / 30]} ask={['$0{,}1(6)$', '$1{,}2(3)$']}>
                <p><Tex>{'x = 0{,}1(6)'}</Tex>: <Tex>{'100x - 10x = 16{,}(6) - 1{,}(6) = 15'}</Tex>, т.е. <Tex>{'x = \\frac{15}{90} = \\frac{1}{6}'}</Tex>.</p>
                <p><Tex>{'y = 1{,}2(3)'}</Tex>: <Tex>{'100y - 10y = 123{,}(3) - 12{,}(3) = 111'}</Tex>, т.е. <Tex>{'y = \\frac{111}{90} = \\frac{37}{30}'}</Tex>.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Докажете, че $\sqrt{3}$ е ирационално число.">
                <p>Да допуснем, че <Tex>{'\\sqrt{3} = \\frac{p}{q}'}</Tex>, несъкратима дроб. Тогава <Tex>{'p^2 = 3q^2'}</Tex>, т.е. <Tex>{'3 \\mid p^2'}</Tex>.</p>
                <p>3 е просто число, затова <Tex>{'3 \\mid p'}</Tex>: <Tex>{'p = 3k'}</Tex>. Тогава <Tex>{'9k^2 = 3q^2'}</Tex>, т.е. <Tex>{'q^2 = 3k^2'}</Tex> и <Tex>{'3 \\mid q'}</Tex>.</p>
                <p>И <Tex>{'p'}</Tex>, и <Tex>{'q'}</Tex> се делят на 3 – противоречие с несъкратимостта.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко цели числа има между $-\sqrt{20}$ и $\sqrt{50}$?" check={[12]} ask={['брой']}>
                <p><Tex>{'16 < 20 < 25 \\Rightarrow -5 < -\\sqrt{20} < -4'}</Tex>; <Tex>{'49 < 50 < 64 \\Rightarrow 7 < \\sqrt{50} < 8'}</Tex>.</p>
                <p>Целите числа са от <Tex>{'-4'}</Tex> до 7: <Tex>{'4 + 7 + 1 = 12'}</Tex> на брой.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Коя е 2026-ата цифра след десетичната запетая на числото $\frac{1}{7}$?" check={[8]} ask={['цифра']}>
                <p><Tex>{'\\frac{1}{7} = 0{,}(142857)'}</Tex> – периодът има 6 цифри.</p>
                <p><Tex>{'2026 = 6 \\cdot 337 + 4'}</Tex>, значи 2026-ата цифра е 4-тата в периода.</p>
                <p>Четвъртата цифра на 142857 е 8.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Докажете, че $\log_2 3$ е ирационално число.">
                <p>Да допуснем, че <Tex>{'\\log_2 3 = \\frac{p}{q}'}</Tex> с естествени <Tex>{'p'}</Tex> и <Tex>{'q'}</Tex> (числото е положително, защото 3 &gt; 1).</p>
                <p>Тогава <Tex>{'2^{p/q} = 3'}</Tex>, т.е. <Tex>{'2^p = 3^q'}</Tex>.</p>
                <p>Лявата страна е четна, а дясната – нечетна. Противоречие, значи <Tex>{'\\log_2 3'}</Tex> е ирационално.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Съществуват ли ирационални числа $a$ и $b$, за които $a^b$ е рационално?">
                <p>Да. Разглеждаме <Tex>{'x = \\sqrt{2}^{\\sqrt{2}}'}</Tex>. Ако <Tex>{'x'}</Tex> е рационално, взимаме <Tex>{'a = b = \\sqrt{2}'}</Tex> – готово.</p>
                <p>Ако <Tex>{'x'}</Tex> е ирационално, взимаме <Tex>{'a = x'}</Tex>, <Tex>{'b = \\sqrt{2}'}</Tex>: <Tex>{'a^b = \\sqrt{2}^{\\sqrt{2} \\cdot \\sqrt{2}} = \\sqrt{2}^{2} = 2'}</Tex>.</p>
                <p>И в двата случая получаваме пример – макар да не казахме кой от двата е верният! (Всъщност е известно, че <Tex>{'\\sqrt{2}^{\\sqrt{2}}'}</Tex> е ирационално.)</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}'}</Tex>: естествени, цели, рационални, реални</li>
              <li>✓ Рационално число: <Tex>{'\\frac{p}{q}'}</Tex>, <Tex>{'p \\in \\mathbb{Z}'}</Tex>, <Tex>{'q \\in \\mathbb{N}'}</Tex>; записва се като крайна или периодична десетична дроб</li>
              <li>✓ Несъкратимата <Tex>{'\\frac{p}{q}'}</Tex> е крайна дроб точно когато <Tex>{'q'}</Tex> има само прости <Term id="divisor">делители</Term> 2 и 5</li>
              <li>✓ Периодична → обикновена: умножаваме по 10, 100, … и изваждаме, за да изчезне периодът</li>
              <li>✓ Ирационалните числа имат безкраен непериодичен запис: <Tex>{'\\sqrt{2}'}</Tex>, <Tex>{'\\pi'}</Tex>, <Tex>{'e'}</Tex></li>
              <li>✓ <Tex>{'\\sqrt{n}'}</Tex> е ирационално, ако <Tex>{'n'}</Tex> не е точен квадрат; рационално ± ирационално = ирационално</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 1874 г. Георг Кантор доказва нещо смайващо: рационалните числа могат да се подредят в <Term id="sequence">редица</Term> и „преброят“, а реалните – не.
              Значи ирационалните числа са несравнимо повече от рационалните, макар че почти всички числа, които срещаме в училище, са рационални.
              А някои съвсем прости въпроси още нямат отговор: никой не знае дали <Tex>{'\\pi + e'}</Tex> е рационално или ирационално число.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
