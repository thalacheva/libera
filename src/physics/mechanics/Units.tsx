import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, pick, randInt } from '~/drill';
import Trainer from '~/Trainer';
import DimensionLab from './DimensionLab';
import MeasurementLab from './MeasurementLab';
import ScaleLab from './ScaleLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
const u = (unit: string) => `\\ \\mathrm{${unit}}`;

/** Превръщане на мерни единици: [стойност, от, към, множител като num/den, обяснение]. */
type Conversion = [number, string, string, number, number, string];

const conversions = (): Conversion[] => {
  const km = pick([12, 25, 35, 48, 7]);
  const mm = pick([450, 75, 1200, 8]);
  const g = pick([250, 1500, 75]);
  const h = pick([15, 25, 5]);
  const L = pick([20, 5, 15]);
  const rho = pick([78, 27, 113, 9]);
  const cm2 = pick([36, 250, 5000]);
  const kwh = pick([1, 2, 5, 10]);
  return [
    [km / 10, 'km', 'm', km * 100, 1, '$1\\ \\mathrm{km} = 1000\\ \\mathrm{m}$ – умножаваме по 1000'],
    [mm, 'mm', 'm', mm, 1000, '$1\\ \\mathrm{mm} = 10^{-3}\\ \\mathrm{m}$ – делим на 1000'],
    [g, 'g', 'kg', g, 1000, '$1\\ \\mathrm{g} = 10^{-3}\\ \\mathrm{kg}$ – делим на 1000'],
    [h / 10, 'h', 's', h * 360, 1, '$1\\ \\mathrm{h} = 60 \\cdot 60 = 3600\\ \\mathrm{s}$'],
    [L / 10, 'L', 'cm^3', L * 100, 1, '$1\\ \\mathrm{L} = 1\\ \\mathrm{dm^3} = 1000\\ \\mathrm{cm^3}$'],
    [rho / 10, 'g/cm^3', 'kg/m^3', rho * 100, 1, '$1\\ \\mathrm{g/cm^3} = \\frac{10^{-3}\\ \\mathrm{kg}}{10^{-6}\\ \\mathrm{m^3}} = 1000\\ \\mathrm{kg/m^3}$'],
    [cm2, 'cm^2', 'm^2', cm2, 10000, '$1\\ \\mathrm{cm^2} = (10^{-2}\\ \\mathrm{m})^2 = 10^{-4}\\ \\mathrm{m^2}$ – делим на 10 000'],
    [kwh, 'kWh', 'MJ', kwh * 36, 10, '$1\\ \\mathrm{kWh} = 1000\\ \\mathrm{W} \\cdot 3600\\ \\mathrm{s} = 3{,}6 \\cdot 10^6\\ \\mathrm{J} = 3{,}6\\ \\mathrm{MJ}$'],
  ];
};

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  if (kind === 0) {
    const v = pick([18, 36, 54, 72, 90, 108, 126, 144]);
    return {
      tex: `${v}${u('km/h')}`,
      ask: `= ?${u('m/s')}`,
      num: v * 10,
      den: 36,
      steps: [`$1\\ \\mathrm{km/h} = \\frac{1000\\ \\mathrm{m}}{3600\\ \\mathrm{s}} = \\frac{1}{3{,}6}\\ \\mathrm{m/s}$`, `$${v} : 3{,}6 = ${dec(v / 3.6)}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 1) {
    const v = pick([5, 10, 15, 20, 25, 30, 40]);
    return {
      tex: `${v}${u('m/s')}`,
      ask: `= ?${u('km/h')}`,
      num: v * 36,
      den: 10,
      steps: [`$1\\ \\mathrm{m/s} = \\frac{0{,}001\\ \\mathrm{km}}{\\frac{1}{3600}\\ \\mathrm{h}} = 3{,}6\\ \\mathrm{km/h}$`, `$${v} \\cdot 3{,}6 = ${dec((v * 36) / 10)}\\ \\mathrm{km/h}$`],
    };
  }
  if (kind === 2) {
    const [value, from, to, num, den, why] = pick(conversions());
    return {
      tex: `${dec(value)}${u(from)}`,
      ask: `= ?${u(to)}`,
      num,
      den,
      steps: [why, `$${dec(value)}${u(from)} = ${dec(num / den)}${u(to)}$`],
    };
  }
  // Научен запис: 0,000042 = 4,2 · 10^n
  const mantissa = pick([1.5, 4.2, 7, 3.8, 2.5, 9.1]);
  const e = pick([-7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8]);
  const value = Number(`${mantissa}e${e}`).toLocaleString('en-US', { maximumSignificantDigits: 3, useGrouping: false }).replace('.', '{,}');
  return {
    tex: `${value} = ${dec(mantissa)} \\cdot 10^{n}`,
    ask: 'n = ?',
    num: e,
    den: 1,
    steps: [
      e > 0
        ? `Запетаята се мести с ${e} ${e === 1 ? 'позиция' : 'позиции'} наляво, докато пред нея остане една цифра.`
        : `Запетаята се мести с ${-e} ${e === -1 ? 'позиция' : 'позиции'} надясно, докато пред нея остане една ненулева цифра.`,
      e > 0 ? `Голямо число – степента е положителна: $n = ${e}$` : `Малко число – степента е отрицателна: $n = ${e}$`,
    ],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '📱 Поглед към телефона',
    problem: 'Шофьор кара по магистралата със 140 km/h и за 2 s поглежда към телефона си. Колко метра изминава колата „на сляпо“?',
    solution: ['$140\\ \\mathrm{km/h} = 140 : 3{,}6 \\approx 38{,}9\\ \\mathrm{m/s}$', '$s = v \\cdot t = 38{,}9 \\cdot 2 \\approx 77{,}8\\ \\mathrm{m}$ – почти дължината на футболно игрище.'],
    answer: '$\\approx 77{,}8\\ \\mathrm{m}$',
    check: [77.8],
    ask: ['път, m'],
  },
  {
    title: '🚰 Капещ кран',
    problem: 'От повреден кран капе по една капка в секунда. Обемът на една капка е около 0,05 mL. Колко литра вода изтичат за едно денонощие?',
    solution: ['В едно денонощие има $24 \\cdot 3600 = 86\\,400\\ \\mathrm{s}$, значи 86 400 капки.', '$86\\,400 \\cdot 0{,}05\\ \\mathrm{mL} = 4320\\ \\mathrm{mL} = 4{,}32\\ \\mathrm{L}$', 'За година това са около 1600 L – повече от 10 пълни вани.'],
    answer: '$4{,}32\\ \\mathrm{L}$',
    check: [4.32],
    ask: ['литра'],
  },
  {
    title: '🏃 Световният рекорд',
    problem: 'Юсейн Болт бяга 100 m за 9,58 s (2009 г.). Каква е средната му скорост в km/h?',
    solution: ['$v = \\frac{100\\ \\mathrm{m}}{9{,}58\\ \\mathrm{s}} \\approx 10{,}44\\ \\mathrm{m/s}$', '$10{,}44 \\cdot 3{,}6 \\approx 37{,}6\\ \\mathrm{km/h}$ – а в най-бързата част от бягането е стигал над 40 km/h.'],
    answer: '$\\approx 37{,}6\\ \\mathrm{km/h}$',
    check: [37.6],
    ask: ['скорост, km/h'],
  },
  {
    title: '🧱 Плътност на тухла',
    problem: 'Тухла с размери 25 cm × 12 cm × 6,5 cm има маса 3,5 kg. Каква е плътността ѝ в kg/m³?',
    solution: ['$V = 25 \\cdot 12 \\cdot 6{,}5 = 1950\\ \\mathrm{cm^3} = 1{,}95 \\cdot 10^{-3}\\ \\mathrm{m^3}$', '$\\rho = \\frac{m}{V} = \\frac{3{,}5}{1{,}95 \\cdot 10^{-3}} \\approx 1790\\ \\mathrm{kg/m^3}$ – около 1,8 пъти по-плътна от водата.'],
    answer: '$\\approx 1790\\ \\mathrm{kg/m^3}$',
    check: [1790],
    ask: ['плътност, kg/m³'],
  },
  {
    title: '☀️ Светлината от Слънцето',
    problem: 'Разстоянието от Земята до Слънцето е около 1,496 · 10¹¹ m, а скоростта на светлината – 2,998 · 10⁸ m/s. За колко минути светлината стига до нас?',
    solution: ['$t = \\frac{s}{c} = \\frac{1{,}496 \\cdot 10^{11}}{2{,}998 \\cdot 10^8} \\approx 499\\ \\mathrm{s}$', '$499 : 60 \\approx 8{,}32$ минути – виждаме Слънцето такова, каквото е било преди 8 минути.'],
    answer: '$\\approx 8{,}32$ минути',
    check: [8.32],
    ask: ['минути'],
  },
  {
    title: '⏱ Периодът на махало',
    problem: 'Ученик мери с хронометър 10 пълни трептения на махало и получава 20,1 s. Грешката от реакцията му е около 0,2 s. Какъв е периодът и с каква грешка?',
    solution: ['$T = \\frac{20{,}1}{10} = 2{,}01\\ \\mathrm{s}$', 'Грешката 0,2 s е на цялото време, затова за един период тя е $\\Delta T = \\frac{0{,}2}{10} = 0{,}02\\ \\mathrm{s}$.', '$T = 2{,}01 \\pm 0{,}02\\ \\mathrm{s}$'],
    answer: '$T = 2{,}01 \\pm 0{,}02\\ \\mathrm{s}$',
    check: [2.01, 0.02],
    ask: ['T, s', 'ΔT, s'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Коя от тези единици е основна в SI?',
    answers: ['килограм', 'нютон', 'джаул', 'километър в час'],
    correctAnswer: 'килограм',
  },
  {
    question: 'На колко метра е равен 1 µm (микрометър)?',
    answers: ['$10^{-6}\\ \\mathrm{m}$', '$10^{-3}\\ \\mathrm{m}$', '$10^{-9}\\ \\mathrm{m}$', '$10^{6}\\ \\mathrm{m}$'],
    correctAnswer: '$10^{-6}\\ \\mathrm{m}$',
  },
  {
    question: 'Колко е 72 km/h в m/s?',
    answers: ['$20\\ \\mathrm{m/s}$', '$259{,}2\\ \\mathrm{m/s}$', '$7{,}2\\ \\mathrm{m/s}$', '$72\\ \\mathrm{m/s}$'],
    correctAnswer: '$20\\ \\mathrm{m/s}$',
  },
  {
    question: 'Как се изразява нютонът чрез основните единици?',
    answers: ['$\\mathrm{kg \\cdot m/s^2}$', '$\\mathrm{kg \\cdot m/s}$', '$\\mathrm{kg \\cdot m^2/s^2}$', '$\\mathrm{kg/(m \\cdot s^2)}$'],
    correctAnswer: '$\\mathrm{kg \\cdot m/s^2}$',
  },
  {
    question: 'Тук $s$ е път, $v$ – скорост, $a$ – ускорение, $t$ – време. Коя формула със сигурност е грешна?',
    answers: ['$s = vt^2$', '$v = at$', '$s = \\frac{at^2}{2}$', '$v^2 = 2as$'],
    correctAnswer: '$s = vt^2$',
  },
  {
    question: 'Пет измервания дават 2,1; 2,0; 2,2; 1,9 и 2,3 s. Колко е средната стойност?',
    answers: ['$2{,}1\\ \\mathrm{s}$', '$2{,}0\\ \\mathrm{s}$', '$2{,}2\\ \\mathrm{s}$', '$10{,}5\\ \\mathrm{s}$'],
    correctAnswer: '$2{,}1\\ \\mathrm{s}$',
  },
  {
    question: 'Страната на куб е измерена с относителна грешка 1%. Каква е относителната грешка на обема му?',
    answers: ['$3\\%$', '$1\\%$', '$9\\%$', '$0{,}33\\%$'],
    correctAnswer: '$3\\%$',
  },
  {
    question: 'Колко значещи цифри има числото 0,00340?',
    answers: ['$3$', '$2$', '$5$', '$6$'],
    correctAnswer: '$3$',
  },
  {
    question: 'Около колко секунди има в една година?',
    answers: ['$3 \\cdot 10^{7}$', '$3 \\cdot 10^{5}$', '$9 \\cdot 10^{6}$', '$5 \\cdot 10^{9}$'],
    correctAnswer: '$3 \\cdot 10^{7}$',
  },
];

// ---------- Страница ----------

const PREFIXES: [string, string, string, string][] = [
  ['тера', 'T', '10^{12}', 'терабайт'],
  ['гига', 'G', '10^{9}', 'гигават'],
  ['мега', 'M', '10^{6}', 'мегапиксел'],
  ['кило', 'k', '10^{3}', 'килограм'],
  ['санти', 'c', '10^{-2}', 'сантиметър'],
  ['мили', 'm', '10^{-3}', 'милилитър'],
  ['микро', 'µ', '10^{-6}', 'микрометър'],
  ['нано', 'n', '10^{-9}', 'нанометър'],
  ['пико', 'p', '10^{-12}', 'пикосекунда'],
];

const BASE_UNITS: [string, string, string][] = [
  ['дължина', 'метър', 'm'],
  ['маса', 'килограм', 'kg'],
  ['време', 'секунда', 's'],
  ['сила на тока', 'ампер', 'A'],
  ['температура', 'келвин', 'K'],
  ['количество вещество', 'мол', 'mol'],
  ['интензитет на светлината', 'кандела', 'cd'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Units() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Величини, единици и оценки</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🛰️ На 23 септември 1999 г. сондата Mars Climate Orbiter на NASA трябва да влезе в орбита около Марс. Вместо това тя минава на около
            57 km над повърхността – много по-ниско от планираното – и изчезва завинаги. Причината? Програмата на един екип пресмята тягата на
            двигателите в британски единици (паунд-сила по секунда), а навигаторите очакват нютон по секунда. Разликата е около 4,45 пъти. Сонда
            за около 125 милиона долара е загубена заради <strong>мерни единици</strong>. Затова всеки урок по физика започва оттук.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Физични величини и единици SI</h2>
          <p className={text}>
            Физичната величина е свойство, което можем да измерим: дължина, маса, време, скорост. Да измерим означава да сравним с единица:
            „масата е 3 kg“ значи „3 пъти колкото един килограм“. Затова всяка стойност е <strong>число × единица</strong> – самото число 3 без
            единица не казва нищо.
          </p>
          <Theorem
            type="definition"
            title="Международна система единици (SI)"
            description="SI има седем основни единици. Всички останали – производните – се получават от тях чрез умножение и деление, например $1\ \mathrm{N} = 1\ \mathrm{kg \cdot m/s^2}$ и $1\ \mathrm{J} = 1\ \mathrm{N \cdot m}$."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Величина</th>
                  <th className={th}>Единица</th>
                  <th className={th}>Означение</th>
                </tr>
              </thead>
              <tbody>
                {BASE_UNITS.map(([q, name, sym]) => (
                  <tr key={sym}>
                    <td className={td}>{q}</td>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{`\\mathrm{${sym}}`}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            От 2019 г. всички основни единици са определени чрез природни константи, които са приети за точни. Секундата е 9 192 631 770
            трептения на излъчването на атом цезий-133; метърът е пътят, който светлината изминава за <Tex>{'\\frac{1}{299\\,792\\,458}'}</Tex>{' '}
            от секундата; килограмът е свързан с <Term id="planck-constant">константата на Планк</Term>. Така всяка лаборатория по света може сама да „направи“ еталон.
          </p>
          <Example
            description="Да изразим джаула и вата чрез основните единици."
            steps={[
              'Работата е сила по път: $1\\ \\mathrm{J} = 1\\ \\mathrm{N} \\cdot 1\\ \\mathrm{m} = 1\\ \\mathrm{kg \\cdot m/s^2 \\cdot m} = 1\\ \\mathrm{kg \\cdot m^2/s^2}$',
              'Мощността е работа за единица време: $1\\ \\mathrm{W} = 1\\ \\mathrm{J/s} = 1\\ \\mathrm{kg \\cdot m^2/s^3}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Представки и научен запис</h2>
          <p className={text}>
            Физиката се занимава с размери от <Term id="proton">протона</Term> до Вселената – над 40 порядъка. Вместо да пишем много нули, използваме{' '}
            <strong>научен запис</strong> (виж{' '}
            <Link to="/algebra/powers" className={link}>
              Степени и корени
            </Link>
            ) и <strong>представки</strong> пред единиците.
          </p>
          <Theorem
            title="Научен запис"
            description="Всяко положително число се записва като $a \cdot 10^n$, където $1 \le a < 10$ и $n$ е цяло. Например $299\,792\,458 \approx 3{,}00 \cdot 10^8$ и $0{,}00042 = 4{,}2 \cdot 10^{-4}$. Числото $n$ е порядъкът на величината."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Представка</th>
                  <th className={th}>Означение</th>
                  <th className={th}>Множител</th>
                  <th className={th}>Пример</th>
                </tr>
              </thead>
              <tbody>
                {PREFIXES.map(([name, sym, factor, example]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{sym}</td>
                    <td className={td}>
                      <Tex>{factor}</Tex>
                    </td>
                    <td className={td}>{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Да превърнем 72 km/h в m/s."
            steps={[
              '$1\\ \\mathrm{km/h} = \\frac{1000\\ \\mathrm{m}}{3600\\ \\mathrm{s}} = \\frac{1}{3{,}6}\\ \\mathrm{m/s}$',
              '$72\\ \\mathrm{km/h} = 72 : 3{,}6 = 20\\ \\mathrm{m/s}$. Обратно: от m/s към km/h умножаваме по 3,6.',
            ]}
          />
          <Example
            description="Колко метра е една светлинна година – пътят, който светлината изминава за една година?"
            steps={[
              'Една година е $365{,}25 \\cdot 24 \\cdot 3600 \\approx 3{,}16 \\cdot 10^7\\ \\mathrm{s}$.',
              '$s = c \\cdot t \\approx 3{,}00 \\cdot 10^8 \\cdot 3{,}16 \\cdot 10^7 = 9{,}48 \\cdot 10^{15}\\ \\mathrm{m}$ (по-точно $9{,}46 \\cdot 10^{15}\\ \\mathrm{m}$).',
              'Мантисите се умножават, а степените на 10 се събират: $10^8 \\cdot 10^7 = 10^{15}$.',
            ]}
          />
          <p className={text}>
            В лабораторията сравни два обекта. Скалата е логаритмична (виж{' '}
            <Link to="/algebra/logarithms" className={link}>
              Логаритми
            </Link>
            ): еднакви разстояния означават еднакво отношение, а не еднаква разлика.
          </p>
          <ScaleLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Анализ на размерностите</h2>
          <p className={text}>
            Размерността показва от кои основни величини е „построена“ една величина. Означаваме я с квадратни скоби и с буквите{' '}
            <Tex>{'M'}</Tex> (маса), <Tex>{'L'}</Tex> (дължина) и <Tex>{'T'}</Tex> (време): скоростта има размерност{' '}
            <Tex>{'[v] = L\\,T^{-1}'}</Tex>, а силата – <Tex>{'[F] = M\\,L\\,T^{-2}'}</Tex>.
          </p>
          <Theorem
            title="Правило за размерностите"
            description="Можем да събираме, изваждаме и сравняваме само величини с еднаква размерност. Затова двете страни на всяко физично уравнение и всички събираеми в него имат една и съща размерност. Аргументите на $\sin$, $e^x$ и $\log$ са безразмерни."
          />
          <Example
            description="Да проверим формулата $s = v_0 t + \frac{at^2}{2}$ за пътя при равноускорително движение."
            steps={[
              '$[s] = L$',
              '$[v_0 t] = L\\,T^{-1} \\cdot T = L$ ✓',
              '$\\left[\\frac{at^2}{2}\\right] = L\\,T^{-2} \\cdot T^2 = L$ ✓ (числото 2 е безразмерно)',
              'Всички събираеми са дължини – формулата може да е вярна. Ако бяхме написали $v_0 t^2$, щеше със сигурност да е грешна.',
            ]}
          />
          <p className={text}>
            Правилото може и повече: да <strong>намери</strong> формула. Ако знаем от кои величини зависи търсената, търсим я като произведение
            на степени и подбираме степените така, че размерностите да съвпаднат.
          </p>
          <Example
            description="От какво зависи периодът $T$ на махало? Да предположим, че зависи от масата $m$, дължината $l$ и земното ускорение $g$: $T = C \cdot m^a l^b g^c$."
            steps={[
              '$[T] = T$, а $[m^a l^b g^c] = M^a \\cdot L^b \\cdot (L\\,T^{-2})^c = M^a L^{b + c} T^{-2c}$',
              'Сравняваме степените: $a = 0$, $b + c = 0$, $-2c = 1$',
              '$c = -\\frac{1}{2}$, $b = \\frac{1}{2}$, $a = 0$, т.е. $T = C\\sqrt{\\frac{l}{g}}$',
              'Масата изобщо не участва! Константата $C = 2\\pi$ идва от пълното решение – анализът не може да я намери.',
            ]}
          />
          <DimensionLab />
          <p className={text}>
            Същият подход дава и скоростта на спътник в кръгова орбита – подробно в лекцията{' '}
            <Link to="/astronomy/lecture08" className={link}>
              Орбити и скорости
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Измерване и грешки</h2>
          <p className={text}>
            Нито едно измерване не е абсолютно точно: линийката има деления, ръката закъснява, уредът се влияе от температурата. Затова
            резултатът се пише заедно с грешката си: <Tex>{'x = \\bar{x} \\pm \\Delta x'}</Tex>.
          </p>
          <Theorem
            type="definition"
            title="Абсолютна и относителна грешка"
            description="Абсолютната грешка $\Delta x$ показва с колко може да се отклонява резултатът и има същата единица като $x$. Относителната грешка $\varepsilon = \frac{\Delta x}{x}$ е безразмерна и често се дава в проценти. При няколко измервания вземаме средното аритметично $\bar{x}$, а за проста оценка на грешката – половината от разликата между най-голямата и най-малката стойност (но не по-малко от точността на уреда)."
          />
          <Theorem
            title="Пренасяне на грешките (максимална оценка)"
            description="При сбор и разлика се събират абсолютните грешки: $\Delta(a \pm b) = \Delta a + \Delta b$. При произведение и частно се събират относителните: $\varepsilon_{ab} = \varepsilon_{a/b} = \varepsilon_a + \varepsilon_b$. При степен: $\varepsilon_{a^n} = |n| \cdot \varepsilon_a$."
          />
          <Example
            description="Стая е измерена с ролетка: $a = 4{,}20 \pm 0{,}01\ \mathrm{m}$, $b = 3{,}15 \pm 0{,}01\ \mathrm{m}$. Колко е лицето ѝ и с каква грешка?"
            steps={[
              '$S = a \\cdot b = 4{,}20 \\cdot 3{,}15 = 13{,}23\\ \\mathrm{m^2}$',
              '$\\varepsilon_S = \\frac{0{,}01}{4{,}20} + \\frac{0{,}01}{3{,}15} \\approx 0{,}0024 + 0{,}0032 = 0{,}0056$, т.е. около 0,6%',
              '$\\Delta S = 0{,}0056 \\cdot 13{,}23 \\approx 0{,}07\\ \\mathrm{m^2}$, значи $S = 13{,}23 \\pm 0{,}07\\ \\mathrm{m^2}$',
              'Грешката определя колко цифри пишем: няма смисъл от $13{,}2300$, щом стотните вече са несигурни.',
            ]}
          />
          <p className={text}>
            Как да намалим грешката? Един от най-хубавите трикове е да измерим <strong>много наведнъж</strong>: дебелината на лист – като
            измерим пачка от 500 листа, периода на <Term id="simple-pendulum">махало</Term> – като измерим 10 или 20 трептения. Пробвай сам.
          </p>
          <MeasurementLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Оценки по Ферми</h2>
          <p className={text}>
            Енрико Ферми обичал да пита студентите си неща като „Колко настройвачи на пиана има в Чикаго?“. Точен отговор няма, но с няколко
            разумни предположения можеш да получиш правилния <strong>порядък</strong>. Грешките в отделните стъпки обикновено отчасти се
            компенсират – някои предположения са малко завишени, други занижени.
          </p>
          <Theorem
            title="Как се прави оценка"
            description="Разбиваме въпроса на по-прости, за които имаме разумна представа. Закръгляме смело до 1, 2, 3 или 5 по степен на 10. Пресмятаме и проверяваме дали отговорът има смисъл. Цел е порядъкът, а не точните цифри."
          />
          <Example
            description="Колко пъти ще удари сърцето ти за 80 години живот?"
            steps={[
              'В покой сърцето бие около 75 пъти в минута ≈ $10^2$ пъти в минута.',
              'В една година има около $5 \\cdot 10^5$ минути ($365 \\cdot 24 \\cdot 60 \\approx 525\\,600$).',
              '$75 \\cdot 5{,}26 \\cdot 10^5 \\cdot 80 \\approx 3 \\cdot 10^9$ – около три милиарда удара.',
            ]}
          />
          <Example
            description="Колко вода ще изпиеш през живота си?"
            steps={[
              'Около 2 литра на ден (с храната и напитките).',
              '$2 \\cdot 365 \\cdot 80 \\approx 6 \\cdot 10^4\\ \\mathrm{L} = 60\\ \\mathrm{m^3}$',
              'Колкото басейн с размери 6 m × 5 m × 2 m.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Превърни в исканата единица или намери степента в <Term id="scientific-notation">научния запис</Term>. Десетичните отговори въвеждай като 0,45.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Единиците около нас</h2>
          <p className={text}>
            Превръщането на единици не е само училищно упражнение – с него се сблъскваш при шофиране, готвене, пазаруване и сметки за <Term id="electric-current">ток</Term>.
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['km/h и m/s', '$72\\ \\mathrm{km/h} = 72 \\cdot 3{,}6\\ \\mathrm{m/s}$', '$72 : 3{,}6 = 20\\ \\mathrm{m/s}$ – в m/s числото е по-малко'],
              ['Квадратни единици', '$1\\ \\mathrm{m^2} = 100\\ \\mathrm{cm^2}$', '$1\\ \\mathrm{m^2} = (100\\ \\mathrm{cm})^2 = 10\\,000\\ \\mathrm{cm^2}$'],
              ['M и m', '$1\\ \\mathrm{Mm} = 10^{-3}\\ \\mathrm{m}$', 'M (мега) е $10^6$, m (мили) е $10^{-3}$ – главната и малката буква са различни'],
              ['Събиране на различни величини', '$2\\ \\mathrm{m} + 3\\ \\mathrm{s}$', 'Събират се само величини с еднаква размерност'],
              ['Грешка на произведение', '$\\Delta(ab) = \\Delta a + \\Delta b$', 'При произведение се събират относителните грешки: $\\varepsilon_{ab} = \\varepsilon_a + \\varepsilon_b$'],
              ['Твърде много цифри', '$g = 9{,}675134 \\pm 0{,}12\\ \\mathrm{m/s^2}$', '$g = 9{,}68 \\pm 0{,}12\\ \\mathrm{m/s^2}$ – грешката казва докъде са сигурните цифри'],
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
              <Task id="a1" number={1} color="border-green-500" question="Превърнете 54 km/h в m/s и 25 m/s в km/h." check={[15, 90]} ask={['$54\\ \\mathrm{km/h}$ в m/s', '$25\\ \\mathrm{m/s}$ в km/h']}>
                <p><Tex>{'54 : 3{,}6 = 15\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'25 \\cdot 3{,}6 = 90\\ \\mathrm{km/h}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Лист хартия е дебел 0,1 mm. Колко листа има в пачка, висока 5 cm?" check={[500]} ask={['брой листа']}>
                <p>Привеждаме в еднакви единици: <Tex>{'5\\ \\mathrm{cm} = 50\\ \\mathrm{mm}'}</Tex>.</p>
                <p><Tex>{'N = \\frac{50}{0{,}1} = 500'}</Tex> листа.</p>
                <p>Обратно – като измерим пачката с линийка, намираме дебелината на един лист много по-точно, отколкото ако го мерим самостоятелно.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="За колко наносекунди светлината изминава 1 m? ($c = 2{,}998 \cdot 10^8\ \mathrm{m/s}$)" check={[3.34]} ask={['време, ns']}>
                <p><Tex>{'t = \\frac{s}{c} = \\frac{1}{2{,}998 \\cdot 10^8} \\approx 3{,}34 \\cdot 10^{-9}\\ \\mathrm{s}'}</Tex></p>
                <p><Tex>{'10^{-9}\\ \\mathrm{s} = 1\\ \\mathrm{ns}'}</Tex>, значи <Tex>{'t \\approx 3{,}34\\ \\mathrm{ns}'}</Tex>.</p>
                <p>Затова в процесор с такт 3 GHz сигналът изминава за един такт само няколко сантиметра.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Скоростта на звука в газ зависи от налягането $p$ и плътността $\rho$: $v = C \cdot p^a \rho^b$. Намерете $a$ и $b$ от размерностите ($[p] = M\,L^{-1}T^{-2}$)." check={[0.5, -0.5]} ask={['$a$', '$b$']}>
                <p><Tex>{'[p^a \\rho^b] = M^a L^{-a} T^{-2a} \\cdot M^b L^{-3b} = M^{a + b} L^{-a - 3b} T^{-2a}'}</Tex></p>
                <p>Трябва да е <Tex>{'L\\,T^{-1}'}</Tex>: <Tex>{'-2a = -1'}</Tex>, <Tex>{'a + b = 0'}</Tex>, откъдето <Tex>{'a = \\frac{1}{2}'}</Tex>, <Tex>{'b = -\\frac{1}{2}'}</Tex>.</p>
                <p><Tex>{'v = C\\sqrt{\\frac{p}{\\rho}}'}</Tex>. За въздух <Tex>{'\\sqrt{10^5 / 1{,}2} \\approx 289\\ \\mathrm{m/s}'}</Tex>; с <Tex>{'C = \\sqrt{1{,}4}'}</Tex> от пълната теория – около 342 m/s, близо до измереното.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Метален куб има ръб $a = 2{,}00 \pm 0{,}02\ \mathrm{cm}$ и маса $m = 62{,}4 \pm 0{,}1\ \mathrm{g}$. Намерете плътността и нейната абсолютна грешка в g/cm³." check={[7.8, 0.25]} ask={['$\\rho$, g/cm³', '$\\Delta\\rho$, g/cm³']}>
                <p><Tex>{'V = a^3 = 8{,}00\\ \\mathrm{cm^3}'}</Tex>, <Tex>{'\\rho = \\frac{62{,}4}{8{,}00} = 7{,}80\\ \\mathrm{g/cm^3}'}</Tex></p>
                <p><Tex>{'\\varepsilon_\\rho = \\varepsilon_m + 3\\varepsilon_a = \\frac{0{,}1}{62{,}4} + 3 \\cdot \\frac{0{,}02}{2{,}00} \\approx 0{,}0016 + 0{,}03 \\approx 0{,}032'}</Tex></p>
                <p><Tex>{'\\Delta\\rho \\approx 0{,}032 \\cdot 7{,}80 \\approx 0{,}25\\ \\mathrm{g/cm^3}'}</Tex>, т.е. <Tex>{'\\rho = 7{,}80 \\pm 0{,}25\\ \\mathrm{g/cm^3}'}</Tex> – вероятно желязо.</p>
                <p>Почти цялата грешка идва от ръба, защото той е на трета степен. Ако искаме по-точен резултат, трябва да мерим по-точно ръба.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Оценете колко пъти мигате за една година. (Оценка по Ферми – важен е порядъкът.)">
                <p>Мигаме около 15–20 пъти в минута, докато сме будни – да кажем 15.</p>
                <p>Будни сме около 16 часа на ден: <Tex>{'15 \\cdot 60 \\cdot 16 \\approx 1{,}4 \\cdot 10^4'}</Tex> мигвания на ден.</p>
                <p>За година: <Tex>{'1{,}4 \\cdot 10^4 \\cdot 365 \\approx 5 \\cdot 10^6'}</Tex> – няколко милиона пъти. Ако едно мигване трае 0,3 s, това са над 400 часа със затворени очи.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Капка течност в безтегловност трепти под действие на повърхностното напрежение $\sigma$ (единица N/m). Честотата $f$ зависи от $\sigma$, плътността $\rho$ и радиуса $R$: $f = C \cdot \sigma^a \rho^b R^c$. Намерете степените." check={[0.5, -0.5, -1.5]} ask={['$a$', '$b$', '$c$']}>
                <p><Tex>{'[\\sigma] = \\mathrm{N/m} = M\\,T^{-2}'}</Tex>, <Tex>{'[\\rho] = M\\,L^{-3}'}</Tex>, <Tex>{'[R] = L'}</Tex>, <Tex>{'[f] = T^{-1}'}</Tex>.</p>
                <p><Tex>{'M:\\ a + b = 0;\\quad L:\\ -3b + c = 0;\\quad T:\\ -2a = -1'}</Tex></p>
                <p><Tex>{'a = \\frac{1}{2}'}</Tex>, <Tex>{'b = -\\frac{1}{2}'}</Tex>, <Tex>{'c = -\\frac{3}{2}'}</Tex>, т.е. <Tex>{'f = C\\sqrt{\\frac{\\sigma}{\\rho R^3}}'}</Tex>.</p>
                <p>Това е резултатът на лорд Рейли (1879). Двойно по-голяма капка трепти <Tex>{'2^{3/2} \\approx 2{,}8'}</Tex> пъти по-бавно.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="От константата на Планк $\hbar$ ($[\hbar] = M\,L^2T^{-1}$), гравитационната константа $G$ ($[G] = M^{-1}L^3T^{-2}$) и скоростта на светлината $c$ съставете дължина: $l = \hbar^a G^b c^d$. Намерете степените." check={[0.5, 0.5, -1.5]} ask={['$a$', '$b$', '$d$']}>
                <p><Tex>{'M:\\ a - b = 0;\\quad L:\\ 2a + 3b + d = 1;\\quad T:\\ -a - 2b - d = 0'}</Tex></p>
                <p>От първото <Tex>{'a = b'}</Tex>; събираме второто и третото: <Tex>{'a + b = 1'}</Tex>, откъдето <Tex>{'a = b = \\frac{1}{2}'}</Tex> и <Tex>{'d = -\\frac{3}{2}'}</Tex>.</p>
                <p><Tex>{'l_P = \\sqrt{\\frac{\\hbar G}{c^3}} \\approx 1{,}6 \\cdot 10^{-35}\\ \\mathrm{m}'}</Tex> – дължината на Планк. Смята се, че на такива разстояния вече са нужни квантова теория и гравитация едновременно.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="За да намери $g$, ученик измерва махало с дължина $l = 1{,}000 \pm 0{,}002\ \mathrm{m}$: 20 трептения стават за 40,4 s, а грешката от реакцията е 0,2 s. Намерете $g$ и $\Delta g$ от $T = 2\pi\sqrt{l/g}$." check={[9.68, 0.12]} ask={['$g$, m/s²', '$\\Delta g$, m/s²']}>
                <p><Tex>{'T = \\frac{40{,}4}{20} = 2{,}02\\ \\mathrm{s}'}</Tex>, <Tex>{'g = \\frac{4\\pi^2 l}{T^2} = \\frac{4\\pi^2 \\cdot 1{,}000}{2{,}02^2} \\approx 9{,}68\\ \\mathrm{m/s^2}'}</Tex></p>
                <p><Tex>{'\\varepsilon_T = \\frac{0{,}2}{40{,}4} \\approx 0{,}0050'}</Tex>, <Tex>{'\\varepsilon_l = 0{,}002'}</Tex>, а <Tex>{'\\varepsilon_g = \\varepsilon_l + 2\\varepsilon_T \\approx 0{,}012'}</Tex></p>
                <p><Tex>{'\\Delta g \\approx 0{,}012 \\cdot 9{,}68 \\approx 0{,}12\\ \\mathrm{m/s^2}'}</Tex>, т.е. <Tex>{'g = 9{,}68 \\pm 0{,}12\\ \\mathrm{m/s^2}'}</Tex>.</p>
                <p>Табличната стойност 9,81 m/s² е малко извън интервала – вероятно има и друга грешка (например дължината е мерена до горния край на топчето, а не до центъра му).</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Всяка стойност е число × единица; SI има 7 основни единици (m, kg, s, A, K, mol, cd)</li>
              <li>✓ Научен запис <Tex>{'a \\cdot 10^n'}</Tex>, <Tex>{'1 \\le a < 10'}</Tex>; представки от пико (<Tex>{'10^{-12}'}</Tex>) до тера (<Tex>{'10^{12}'}</Tex>)</li>
              <li>✓ <Tex>{'1\\ \\mathrm{m/s} = 3{,}6\\ \\mathrm{km/h}'}</Tex>; при квадратни и кубични единици множителят се повдига на степен</li>
              <li>✓ Двете страни на уравнение имат еднаква размерност; така проверяваме формули и намираме нови с точност до константа</li>
              <li>✓ <Tex>{'x = \\bar{x} \\pm \\Delta x'}</Tex>; при сбор се събират абсолютните грешки, при произведение – относителните, при степен <Tex>{'\\varepsilon_{a^n} = |n|\\,\\varepsilon_a'}</Tex></li>
              <li>✓ Оценка по Ферми: разбиваме въпроса на прости стъпки и търсим порядъка</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              130 години килограмът беше определен от един метален цилиндър от платина и иридий, пазен в трезор край Париж – „Големият К“.
              При сравненията с официалните му копия се оказало, че за около век масите им са се разминали с няколко десетки микрограма, и никой
              не може да каже кой се е променил. От 20 май 2019 г. килограмът вече не зависи от никой предмет: определен е чрез точно фиксираната
              константа на Планк <Tex>{'h = 6{,}626\\,070\\,15 \\cdot 10^{-34}\\ \\mathrm{J \\cdot s}'}</Tex>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
