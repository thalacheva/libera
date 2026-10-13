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
import CalorimetryLab from './CalorimetryLab';
import HeatingCurveLab from './HeatingCurveLab';
import InsulationLab from './InsulationLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 12.5 → 12{,}5. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');
const deg = '\\ ^{\\circ}\\mathrm{C}';

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const t = pick([-40, -10, 0, 20, 25, 37, 100]);
    return {
      tex: `t = ${t}${deg}`,
      ask: 'В келвини: $T = ?\\ \\mathrm{K}$',
      num: t + 273.15,
      den: 1,
      steps: [`$T = t + 273{,}15 = ${t < 0 ? `(${t})` : t} + 273{,}15 = ${dec(t + 273.15)}\\ \\mathrm{K}$`],
    };
  }
  if (kind === 1) {
    const t = pick([-40, -10, 0, 10, 20, 25, 30, 37, 100]);
    return {
      tex: `t = ${t}${deg}`,
      ask: 'Във фаренхайти: $t_F = ?\\ ^{\\circ}\\mathrm{F}$',
      num: 9 * t + 160,
      den: 5,
      steps: [`$t_F = 1{,}8\\,t + 32 = 1{,}8 \\cdot ${t < 0 ? `(${t})` : t} + 32 = ${dec((9 * t + 160) / 5)}\\ ^{\\circ}\\mathrm{F}$`],
    };
  }
  if (kind === 2) {
    const [mt, dt] = [pick([5, 10, 20]), pick([10, 20, 50, 80])];
    return {
      tex: `m = ${dec(mt / 10)}\\ \\mathrm{kg}, \\quad \\Delta t = ${dt}${deg}`,
      ask: 'Колко топлина трябва на водата ($c = 4200$)? $Q = ?\\ \\mathrm{kJ}$',
      num: mt * 42 * dt,
      den: 100,
      steps: [`$Q = mc\\Delta t = ${dec(mt / 10)} \\cdot 4200 \\cdot ${dt} = ${mt * 420 * dt}\\ \\mathrm{J}$`, `$= ${dec((mt * 42 * dt) / 100)}\\ \\mathrm{kJ}$`],
    };
  }
  if (kind === 3) {
    const [m1, m2] = pick([
      [100, 100],
      [100, 300],
      [300, 100],
      [200, 200],
      [200, 300],
      [300, 200],
    ]);
    const [t1, t2] = [pick([60, 70, 80, 90]), pick([10, 15, 20])];
    const t = (m1 * t1 + m2 * t2) / (m1 + m2);
    return {
      tex: `m_1 = ${m1}\\ \\mathrm{g}, \\quad t_1 = ${t1}${deg}`,
      ask: `Смесваме с $m_2 = ${m2}\\ \\mathrm{g}$ вода при $t_2 = ${t2}${deg}$. $t = ?${deg}$`,
      num: m1 * t1 + m2 * t2,
      den: m1 + m2,
      steps: [
        `Топлинен баланс: $m_1 c(t_1 - t) = m_2 c(t - t_2)$ – $c$ се съкращава.`,
        `$t = \\frac{m_1 t_1 + m_2 t_2}{m_1 + m_2} = \\frac{${m1} \\cdot ${t1} + ${m2} \\cdot ${t2}}{${m1 + m2}} = ${dec(t)}${deg}$`,
      ],
    };
  }
  if (kind === 4) {
    const m10 = pick([1, 2, 5, 10, 20]);
    return {
      tex: `m = ${dec(m10 / 10)}\\ \\mathrm{kg}, \\quad t = 0${deg}`,
      ask: 'Топлина за стопяване на леда ($\\lambda = 334\\ \\mathrm{kJ/kg}$): $Q = ?\\ \\mathrm{kJ}$',
      num: m10 * 334,
      den: 10,
      steps: [`$Q = \\lambda m = 334 \\cdot ${dec(m10 / 10)} = ${dec((m10 * 334) / 10)}\\ \\mathrm{kJ}$`, 'Температурата остава 0 °C, докато целият лед се стопи.'],
    };
  }
  if (kind === 5) {
    const [L, dt] = [pick([10, 20, 50, 100]), pick([20, 30, 40, 50])];
    return {
      tex: `L_0 = ${L}\\ \\mathrm{m}, \\quad \\Delta t = ${dt}${deg}`,
      ask: 'Стоманена релса ($\\alpha = 1{,}2 \\cdot 10^{-5}\\ \\mathrm{K^{-1}}$): $\\Delta L = ?\\ \\mathrm{mm}$',
      num: 12 * L * dt,
      den: 1000,
      steps: [`$\\Delta L = \\alpha L_0 \\Delta t = 1{,}2 \\cdot 10^{-5} \\cdot ${L} \\cdot ${dt} = ${dec((12 * L * dt) / 1e6)}\\ \\mathrm{m}$`, `$= ${dec((12 * L * dt) / 1000)}\\ \\mathrm{mm}$`],
    };
  }
  const [P, dt] = [pick([1000, 2000]), pick([20, 50, 80])];
  return {
    tex: `P = ${P}\\ \\mathrm{W}, \\quad \\Delta t = ${dt}${deg}`,
    ask: 'За колко време котлонът затопля 1 kg вода? $\\tau = ?\\ \\mathrm{s}$',
    num: 4200 * dt,
    den: P,
    steps: [`$Q = mc\\Delta t = 1 \\cdot 4200 \\cdot ${dt} = ${4200 * dt}\\ \\mathrm{J}$`, `$\\tau = \\frac{Q}{P} = \\frac{${4200 * dt}}{${P}} = ${dec((4200 * dt) / P)}\\ \\mathrm{s}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🍵 Чаша чай',
    problem: 'В електрическа кана с мощност 2000 W има 250 g вода с температура 20 °C. Колко топлина трябва, за да заври водата, и за колко секунди ще стане това, ако няма загуби?',
    solution: ['$Q = mc\\Delta t = 0{,}25 \\cdot 4200 \\cdot 80 = 84\\,000\\ \\mathrm{J} = 84\\ \\mathrm{kJ}$', '$\\tau = \\frac{Q}{P} = \\frac{84\\,000}{2000} = 42\\ \\mathrm{s}$ – в действителност малко повече заради загубите.'],
    answer: '84 kJ, 42 s',
    check: [84, 42],
    ask: ['топлина, kJ', 'време, s'],
  },
  {
    title: '🛁 Вана',
    problem: 'Искаш да напълниш вана със 150 L вода с температура 40 °C, като смесиш гореща вода от бойлера (60 °C) и студена от чешмата (15 °C). Колко литра гореща вода са нужни? Загубите пренебрегваме.',
    solution: ['Нека горещата вода е $x$ литра (= $x$ kg), студената – $150 - x$.', 'Топлинен баланс: $x(60 - 40) = (150 - x)(40 - 15) \\Rightarrow 20x = 3750 - 25x$', '$45x = 3750 \\Rightarrow x \\approx 83{,}3\\ \\mathrm{L}$'],
    answer: '$\\approx 83{,}3\\ \\mathrm{L}$',
    check: [83.3],
    ask: ['гореща вода, L'],
  },
  {
    title: '🤒 Температура',
    problem: 'Приятел от САЩ пише, че има температура. Ти си измерил 39 °C. Колко е това по Фаренхайт и в келвини?',
    solution: ['$t_F = 1{,}8 \\cdot 39 + 32 = 102{,}2\\ ^{\\circ}\\mathrm{F}$', '$T = 39 + 273{,}15 = 312{,}15\\ \\mathrm{K}$'],
    answer: '102,2 °F и 312,15 K',
    check: [102.2, 312.15],
    ask: ['°F', 'K'],
  },
  {
    title: '🌉 Стоманен мост',
    problem: 'Стоманен мост е дълъг 200 m. През зимата температурата пада до −20 °C, а през лятото стига 40 °C. С колко сантиметра се променя дължината му? (α = 1,2 · 10⁻⁵ K⁻¹)',
    solution: ['$\\Delta t = 40 - (-20) = 60\\ ^{\\circ}\\mathrm{C}$', '$\\Delta L = \\alpha L_0 \\Delta t = 1{,}2 \\cdot 10^{-5} \\cdot 200 \\cdot 60 = 0{,}144\\ \\mathrm{m} = 14{,}4\\ \\mathrm{cm}$', 'Затова мостовете имат температурни фуги – „зъбите“, по които колите тракат.'],
    answer: '$14{,}4\\ \\mathrm{cm}$',
    check: [14.4],
    ask: ['промяна, cm'],
  },
  {
    title: '🧊 Лед в лимонадата',
    problem: 'Колко грама лед с температура 0 °C трябва да сложиш в 300 g лимонада с температура 25 °C, за да стане тя 5 °C? Лимонадата има c като водата (4200 J/(kg·K)), λ = 334 kJ/kg.',
    solution: [
      'Лимонадата дава $0{,}3 \\cdot 4200 \\cdot 20 = 25\\,200\\ \\mathrm{J}$.',
      'Ледът първо се стопява, после стопената вода се затопля до 5 °C: $m(334\\,000 + 4200 \\cdot 5) = 355\\,000\\,m$.',
      '$m = \\frac{25\\,200}{355\\,000} \\approx 0{,}071\\ \\mathrm{kg} = 71{,}0\\ \\mathrm{g}$',
    ],
    answer: '$\\approx 71{,}0\\ \\mathrm{g}$',
    check: [71.0],
    ask: ['лед, g'],
  },
  {
    title: '🏠 Изолирана стена',
    problem: 'Стена с площ 10 m² е изолирана с 10 cm минерална вата (k = 0,04 W/(m·K)). Вътре е 20 °C, навън 0 °C. Колко вата минават само през ватата и колко струват загубите за 30 дни при 0,14 €/kWh? (Останалите слоеве пренебрегваме.)',
    solution: ['$q = \\frac{kS\\Delta t}{d} = \\frac{0{,}04 \\cdot 10 \\cdot 20}{0{,}1} = 80\\ \\mathrm{W}$', 'За 30 дни: $80 \\cdot 24 \\cdot 30 = 57\\,600\\ \\mathrm{Wh} = 57{,}6\\ \\mathrm{kWh}$', '$57{,}6 \\cdot 0{,}14 \\approx 8{,}06$ €'],
    answer: '80 W, около 8,06 €',
    check: [80, 8.06],
    ask: ['поток, W', 'цена, €'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Колко е абсолютната нула по Целзий?',
    answers: ['$-273{,}15\\ ^{\\circ}\\mathrm{C}$', '$0\\ ^{\\circ}\\mathrm{C}$', '$-100\\ ^{\\circ}\\mathrm{C}$', '$-459{,}67\\ ^{\\circ}\\mathrm{C}$'],
    correctAnswer: '$-273{,}15\\ ^{\\circ}\\mathrm{C}$',
  },
  {
    question: 'Колко е 20 °C в келвини?',
    answers: ['$293{,}15\\ \\mathrm{K}$', '$20\\ \\mathrm{K}$', '$253{,}15\\ \\mathrm{K}$', '$68\\ \\mathrm{K}$'],
    correctAnswer: '$293{,}15\\ \\mathrm{K}$',
  },
  {
    question: 'При каква температура скалите на Целзий и на Фаренхайт показват едно и също число?',
    answers: ['$-40$', '$0$', '$32$', '$100$'],
    correctAnswer: '$-40$',
  },
  {
    question: 'При каква температура водата има най-голяма плътност?',
    answers: ['$4\\ ^{\\circ}\\mathrm{C}$', '$0\\ ^{\\circ}\\mathrm{C}$', '$100\\ ^{\\circ}\\mathrm{C}$', '$-4\\ ^{\\circ}\\mathrm{C}$'],
    correctAnswer: '$4\\ ^{\\circ}\\mathrm{C}$',
  },
  {
    question: 'Защо в чаша вода с лед температурата стои 0 °C, докато ледът се топи?',
    answers: ['енергията отива за разрушаване на кристалите на леда', 'ледът не получава топлина', 'водата отдава топлина навън', 'термометърът не работи под вода'],
    correctAnswer: 'енергията отива за разрушаване на кристалите на леда',
  },
  {
    question: 'При каква температура кипи водата на връх Мусала?',
    answers: ['около 90 °C', 'точно 100 °C', 'около 110 °C', 'около 70 °C'],
    correctAnswer: 'около 90 °C',
  },
  {
    question: 'Колко топлина е нужна, за да се затопли 1 kg вода с 1 °C?',
    answers: ['$\\approx 4200\\ \\mathrm{J}$', '$\\approx 420\\ \\mathrm{J}$', '$\\approx 334\\ \\mathrm{kJ}$', '$1\\ \\mathrm{J}$'],
    correctAnswer: '$\\approx 4200\\ \\mathrm{J}$',
  },
  {
    question: 'Кой начин на пренасяне на топлина действа и във вакуум?',
    answers: ['излъчване', 'топлопроводност', 'конвекция', 'нито един'],
    correctAnswer: 'излъчване',
  },
  {
    question: 'Смесваме 1 kg вода при 10 °C и 1 kg вода при 50 °C. Каква е крайната температура?',
    answers: ['$30\\ ^{\\circ}\\mathrm{C}$', '$60\\ ^{\\circ}\\mathrm{C}$', '$40\\ ^{\\circ}\\mathrm{C}$', '$20\\ ^{\\circ}\\mathrm{C}$'],
    correctAnswer: '$30\\ ^{\\circ}\\mathrm{C}$',
  },
];

// ---------- Страница ----------

const C_TABLE: [string, string][] = [
  ['вода', '4200'],
  ['лед', '2100'],
  ['водна пара', '2000'],
  ['алуминий', '900'],
  ['желязо, стомана', '460'],
  ['мед', '385'],
  ['олово', '130'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Temperature() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Температура и топлина</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🗼 Айфеловата кула не е еднакво висока през цялата година. Железните ѝ греди се разширяват при затопляне и се свиват при
            изстиване и според често цитираните оценки между студен зимен и горещ летен ден върхът ѝ се премества с до около 15 cm. Същото
            се случва с релсите, мостовете и жиците по стълбовете – затова между релсите има фуги, а жиците през лятото провисват повече. В
            този урок ще видим какво всъщност е температурата, как топлината преминава от тяло на тяло и защо понякога тялото поглъща енергия,
            без да се затопля.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Температура и температурни скали</h2>
          <p className={text}>
            Когато допрем горещо и студено тяло, топлото изстива, а студеното се затопля, докато температурите им се изравнят – казваме, че
            са в <strong>топлинно равновесие</strong>. Температурата е величината, която е еднаква за телата в равновесие. На ниво молекули
            тя е мярка за средната енергия на хаотичното им движение (подробно в урока{' '}
            <Link to="/physics/heat/ideal-gas" className={link}>
              Идеален газ
            </Link>
            ).
          </p>
          <Theorem
            type="definition"
            title="Скали на Целзий, Келвин и Фаренхайт"
            description="По Целзий водата замръзва при 0 °C и кипи при 100 °C (при нормално налягане). Скалата на Келвин има същата стъпка, но започва от абсолютната нула – най-ниската възможна температура: $T = t + 273{,}15$, т.е. $0\ \mathrm{K} = -273{,}15\ ^{\circ}\mathrm{C}$. По Фаренхайт: $t_F = 1{,}8\,t + 32$. Разликата от 1 °C е равна на 1 K."
          />
          <p className={text}>
            Андерш Целзий предлага скалата си през 1742 г. – но обърната: 0 при кипенето и 100 при замръзването. Скоро след смъртта му тя
            е обърната в днешния вид. Габриел Фаренхайт избира за нула температурата на смес от лед, вода и сол, а за друга опорна точка –
            приблизително температурата на човешкото тяло (по различни описания). Абсолютната скала е предложена от лорд Келвин през 1848 г.
          </p>
          <Example
            description="Нормалната телесна температура е около 37 °C. Колко е тя в келвини и по Фаренхайт?"
            steps={['$T = 37 + 273{,}15 = 310{,}15\\ \\mathrm{K}$', '$t_F = 1{,}8 \\cdot 37 + 32 = 98{,}6\\ ^{\\circ}\\mathrm{F}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Топлинно разширение</h2>
          <Theorem
            title="Линейно разширение"
            description="При затопляне с $\Delta t$ дължината на тялото нараства с $\Delta L = \alpha L_0 \Delta t$, където $\alpha$ е коефициентът на линейно разширение. За стомана и желязо $\alpha \approx 1{,}2 \cdot 10^{-5}\ \mathrm{K^{-1}}$, за алуминий $\approx 2{,}3 \cdot 10^{-5}\ \mathrm{K^{-1}}$. Обемът на твърдите тела нараства приблизително с $\beta \approx 3\alpha$."
          />
          <Example
            description="С колко се удължава желязна конструкция с височина около 300 m при затопляне с 40 °C?"
            steps={['$\\Delta L = 1{,}2 \\cdot 10^{-5} \\cdot 300 \\cdot 40 = 0{,}144\\ \\mathrm{m}$', 'Около 14 cm – колкото е промяната на Айфеловата кула между зима и лято.']}
          />
          <p className={text}>
            Водата е изключение – <strong>аномалия</strong>. От 0 °C до около 4 °C тя се свива при затопляне и има най-голяма плътност при
            около 4 °C. Ледът е по-лек от водата и плува. Затова езерата замръзват отгоре надолу: най-плътната вода от 4 °C слиза на дъното и
            там рибите оцеляват през зимата, а ледът отгоре изолира водата под него.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Количество топлина</h2>
          <p className={text}>
            Топлината не е нещо, което тялото „съдържа“. Тя е <strong>енергия, която преминава</strong> от по-топлото към по-студеното тяло
            заради разликата в температурите. Затова се мери в джаули – също като работата (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ). Тялото има вътрешна енергия, която може да се промени и с топлина, и с работа (виж{' '}
            <Link to="/physics/heat/thermodynamics" className={link}>
              Термодинамика
            </Link>
            ).
          </p>
          <Theorem
            title="Количество топлина"
            description="За да се затопли тяло с маса $m$ с $\Delta t$, е нужна топлина $Q = mc\Delta t$. Специфичният топлинен капацитет $c$ показва колко джаула трябват за 1 kg с 1 °C; единицата е $\mathrm{J/(kg \cdot K)}$. При изстиване тялото отдава същото количество топлина."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Вещество</th>
                  <th className={th}>
                    <Tex>{'c,\\ \\mathrm{J/(kg \\cdot K)}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody>
                {C_TABLE.map(([name, c]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Водата има необичайно голям топлинен капацитет (по-точно 4186 J/(kg·K); в задачите често 4200). Моретата се затоплят бавно
            през лятото и изстиват бавно през зимата – затова край морето климатът е по-мек, отколкото навътре в сушата.
          </p>
          <Example
            description="Колко време трябва на кана с мощност 2000 W, за да загрее 2 L вода от 20 °C до кипене? (без загуби)"
            steps={['$Q = mc\\Delta t = 2 \\cdot 4200 \\cdot 80 = 672\\,000\\ \\mathrm{J}$', '$\\tau = \\frac{Q}{P} = \\frac{672\\,000}{2000} = 336\\ \\mathrm{s} \\approx 5{,}6\\ \\mathrm{min}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Топлинен баланс</h2>
          <Theorem
            title="Уравнение на топлинния баланс"
            description="Ако телата обменят топлина само помежду си (в топлоизолиран съд – калориметър), отдадената топлина е равна на получената: $Q_{\text{отд}} = Q_{\text{пол}}$. Това е законът за запазване на енергията."
          />
          <Example
            description="Смесваме 200 g вода при 80 °C и 300 g вода при 20 °C. Каква е крайната температура?"
            steps={['$0{,}2 \\cdot c(80 - t) = 0{,}3 \\cdot c(t - 20)$ – $c$ се съкращава.', '$16 - 0{,}2t = 0{,}3t - 6 \\Rightarrow 0{,}5t = 22 \\Rightarrow t = 44\\ ^{\\circ}\\mathrm{C}$', 'Крайната температура е по-близо до тази на по-голямата маса.']}
          />
          <CalorimetryLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Топене, кипене и изпарение</h2>
          <Theorem
            title="Топлина на топене и на изпарение"
            description="При топене температурата не се мени, докато цялото тяло не се стопи: нужна е топлина $Q = \lambda m$. За леда $\lambda \approx 334\ \mathrm{kJ/kg}$. При изпарение $Q = Lm$; за водата $L \approx 2{,}26 \cdot 10^6\ \mathrm{J/kg}$ – почти седем пъти повече. При втвърдяване и кондензация същата топлина се отделя."
          />
          <p className={text}>
            Температурата на кипене зависи от налягането. На планина налягането е по-ниско и водата кипи по-рано: на Мусала (2925 m) – около
            90 °C, а на Еверест – около 70 °C. Изпарението охлажда: молекулите, които излитат, отнасят енергия. Така потта ни охлажда, а
            мокрите дрехи на вятъра ни правят зиморничави.
          </p>
          <HeatingCurveLab />
          <Example
            description="Слагаме 100 g лед при 0 °C в 500 g вода при 40 °C. Каква е крайната температура?"
            steps={[
              'Водата може да отдаде до 0 °C: $0{,}5 \\cdot 4200 \\cdot 40 = 84\\,000\\ \\mathrm{J}$; за топенето трябват $0{,}1 \\cdot 334\\,000 = 33\\,400\\ \\mathrm{J}$ – ледът се стопява целият.',
              'Баланс: $0{,}5 \\cdot 4200(40 - t) = 33\\,400 + 0{,}1 \\cdot 4200\\,t$',
              '$84\\,000 - 2100t = 33\\,400 + 420t \\Rightarrow t = \\frac{50\\,600}{2520} \\approx 20{,}1\\ ^{\\circ}\\mathrm{C}$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Как се пренася топлината</h2>
          <p className={text}>
            <strong>Топлопроводност</strong> – енергията минава от частица на частица в самото вещество (лъжица в горещ чай).{' '}
            <strong>Конвекция</strong> – топлият флуид се издига и носи енергията със себе си (радиатор, вятър, течения в морето).{' '}
            <strong>Излъчване</strong> – всяко тяло излъчва електромагнитни вълни; така Слънцето ни топли през вакуума (законите на излъчването
            са в лекцията{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>
            ).
          </p>
          <Theorem
            title="Топлопроводност през стена"
            description="През плоска стена с площ $S$ и дебелина $d$ за всяка секунда минава топлина $q = \frac{kS\Delta t}{d}$ (във ватове), където $k$ е топлопроводността на материала, $\mathrm{W/(m \cdot K)}$ (често се бележи и с $\lambda$ – да не се бърка с топлината на топене). Съпротивленията $R = \frac{d}{k}$ на слоевете се събират."
          />
          <p className={text}>
            Металите провеждат топлината много добре, а въздухът – много зле. Затова металната дръжка в студена сутрин ни се струва по-студена
            от дървената, макар двете да са с една и съща температура, а топлоизолациите (вата, стиропор, пух) са пълни с въздух.
          </p>
          <InsulationLab />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 293,15.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Топлината около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Топлина и температура', 'горещото тяло „съдържа“ много топлина', 'топлината е енергия, която преминава; тялото има вътрешна енергия'],
              ['Келвини', '$20\\ ^{\\circ}\\mathrm{C} = 20\\ \\mathrm{K}$', '$20\\ ^{\\circ}\\mathrm{C} = 293{,}15\\ \\mathrm{K}$; но разлика от 20 °C е разлика от 20 K'],
              ['Средна температура при смесване', '$\\frac{80 + 20}{2} = 50\\ ^{\\circ}\\mathrm{C}$ винаги', 'средното е претеглено с масите: $\\frac{m_1 t_1 + m_2 t_2}{m_1 + m_2}$'],
              ['Забравената топлина на топене', 'лед при 0 °C → вода при 0 °C без енергия', 'нужни са $\\lambda m$ – 334 kJ за всеки килограм'],
              ['Грамове в $Q = mc\\Delta t$', '$Q = 200 \\cdot 4200 \\cdot 10$', '$c$ е за килограм: $Q = 0{,}2 \\cdot 4200 \\cdot 10 = 8400\\ \\mathrm{J}$'],
              ['Студеният метал', 'металът е по-студен от дървото до него', 'температурата е еднаква – металът по-бързо отнема топлина от ръката'],
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
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Изразете 25 °C в келвини и по Фаренхайт." check={[298.15, 77]} ask={['$T$, K', '$t_F$, °F']}>
                <p><Tex>{'T = 25 + 273{,}15 = 298{,}15\\ \\mathrm{K}'}</Tex></p>
                <p><Tex>{'t_F = 1{,}8 \\cdot 25 + 32 = 77\\ ^{\\circ}\\mathrm{F}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко топлина е нужна, за да се загреят 3 kg вода от 15 °C до 65 °C? ($c = 4200\ \mathrm{J/(kg \cdot K)}$)" check={[630]} ask={['$Q$, kJ']}>
                <p><Tex>{'Q = mc\\Delta t = 3 \\cdot 4200 \\cdot 50 = 630\\,000\\ \\mathrm{J}'}</Tex></p>
                <p><Tex>{'Q = 630\\ \\mathrm{kJ}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Стоманена релса е дълга 25 m. С колко милиметра се удължава при затопляне с 50 °C? ($\alpha = 1{,}2 \cdot 10^{-5}\ \mathrm{K^{-1}}$)" check={[15]} ask={['$\\Delta L$, mm']}>
                <p><Tex>{'\\Delta L = \\alpha L_0 \\Delta t = 1{,}2 \\cdot 10^{-5} \\cdot 25 \\cdot 50 = 0{,}015\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\Delta L = 15\\ \\mathrm{mm}'}</Tex> – затова между релсите се оставят фуги.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Железен къс с маса 500 g, нагрят до 100 °C, пускат в 1 kg вода при 20 °C. Каква е крайната температура? ($c_{\text{Fe}} = 460$, $c_{\text{вода}} = 4200\ \mathrm{J/(kg \cdot K)}$)" check={[24.2]} ask={['$t$, °C']}>
                <p>Баланс: <Tex>{'0{,}5 \\cdot 460(100 - t) = 1 \\cdot 4200(t - 20)'}</Tex></p>
                <p><Tex>{'23\\,000 - 230t = 4200t - 84\\,000 \\Rightarrow 4430t = 107\\,000'}</Tex></p>
                <p><Tex>{'t \\approx 24{,}2\\ ^{\\circ}\\mathrm{C}'}</Tex> – водата почти не се затопля, защото има много по-голям топлинен капацитет.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Метално тяло с маса 200 g, нагрято до 100 °C, пускат в 400 g вода при 20 °C. Крайната температура е 24,0 °C. Намерете специфичния топлинен капацитет на метала." check={[442]} ask={['$c$, J/(kg·K)']}>
                <p>Водата получава <Tex>{'0{,}4 \\cdot 4200 \\cdot 4 = 6720\\ \\mathrm{J}'}</Tex>.</p>
                <p>Металът отдава <Tex>{'0{,}2 \\cdot c \\cdot 76 = 15{,}2\\,c'}</Tex>.</p>
                <p><Tex>{'c = \\frac{6720}{15{,}2} \\approx 442\\ \\mathrm{J/(kg \\cdot K)}'}</Tex> – близо до желязото (460).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко топлина е нужна, за да превърнем 0,5 kg лед при −10 °C във вода при 20 °C? ($c_{\text{лед}} = 2100$, $c_{\text{вода}} = 4200\ \mathrm{J/(kg \cdot K)}$, $\lambda = 334\ \mathrm{kJ/kg}$)" check={[220]} ask={['$Q$, kJ']}>
                <p>Затопляне на леда до 0 °C: <Tex>{'0{,}5 \\cdot 2100 \\cdot 10 = 10\\,500\\ \\mathrm{J}'}</Tex></p>
                <p>Топене: <Tex>{'0{,}5 \\cdot 334\\,000 = 167\\,000\\ \\mathrm{J}'}</Tex></p>
                <p>Затопляне на водата до 20 °C: <Tex>{'0{,}5 \\cdot 4200 \\cdot 20 = 42\\,000\\ \\mathrm{J}'}</Tex></p>
                <p>Общо <Tex>{'219\\,500\\ \\mathrm{J} \\approx 220\\ \\mathrm{kJ}'}</Tex> – три четвърти от нея отиват за топенето.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="В 1 kg вода при 30 °C слагат 0,5 kg лед при −20 °C. Каква е крайната температура и колко грама лед се стопяват? (данни като в задача 6)" check={[0, 314]} ask={['$t$, °C', 'стопен лед, g']}>
                <p>Ледът се затопля до 0 °C с <Tex>{'0{,}5 \\cdot 2100 \\cdot 20 = 21\\,000\\ \\mathrm{J}'}</Tex>.</p>
                <p>Водата може да отдаде до 0 °C най-много <Tex>{'1 \\cdot 4200 \\cdot 30 = 126\\,000\\ \\mathrm{J}'}</Tex>, а за целия лед трябват <Tex>{'21\\,000 + 167\\,000 = 188\\,000\\ \\mathrm{J}'}</Tex> – не стига.</p>
                <p>Значи крайната температура е 0 °C. За топене остават <Tex>{'126\\,000 - 21\\,000 = 105\\,000\\ \\mathrm{J}'}</Tex>.</p>
                <p><Tex>{'m = \\frac{105\\,000}{334\\,000} \\approx 0{,}314\\ \\mathrm{kg} = 314\\ \\mathrm{g}'}</Tex> – в съда остава смес от вода и лед.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Тухлена стена е дебела 25 cm ($k = 0{,}7\ \mathrm{W/(m \cdot K)}$). Колко сантиметра минерална вата ($k = 0{,}04$) трябва да се добавят, за да намалее потокът на топлина 5 пъти? (Въздушните слоеве пренебрегваме.)" check={[5.71]} ask={['дебелина, cm']}>
                <p>Съпротивлението на тухлата е <Tex>{'R_1 = \\frac{0{,}25}{0{,}7} \\approx 0{,}357\\ \\mathrm{m^2 \\cdot K/W}'}</Tex>.</p>
                <p>Потокът е обратно пропорционален на общото съпротивление, значи трябва <Tex>{'R = 5R_1 \\approx 1{,}786'}</Tex>, т.е. ватата трябва да добави <Tex>{'4R_1 \\approx 1{,}429'}</Tex>.</p>
                <p><Tex>{'d = 1{,}429 \\cdot 0{,}04 \\approx 0{,}0571\\ \\mathrm{m} = 5{,}71\\ \\mathrm{cm}'}</Tex> – под 6 cm вата изолират колкото още 1 m тухла.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При тичане тялото трябва да изхвърли допълнително 300 W топлина само чрез изпаряване на пот. Колко грама пот трябва да се изпарят за 1 час? (При температурата на кожата $L \approx 2{,}4 \cdot 10^6\ \mathrm{J/kg}$.)" check={[450]} ask={['пот, g']}>
                <p>За един час: <Tex>{'Q = 300 \\cdot 3600 = 1{,}08 \\cdot 10^6\\ \\mathrm{J}'}</Tex>.</p>
                <p><Tex>{'m = \\frac{Q}{L} = \\frac{1{,}08 \\cdot 10^6}{2{,}4 \\cdot 10^6} = 0{,}45\\ \\mathrm{kg} = 450\\ \\mathrm{g}'}</Tex></p>
                <p>Затова при бягане в жега трябва да се пие вода. Ако потта се стича, без да се изпари, тя не охлажда.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'T = t + 273{,}15'}</Tex>; <Tex>{'t_F = 1{,}8\\,t + 32'}</Tex>; абсолютната нула е <Tex>{'0\\ \\mathrm{K} = -273{,}15\\ ^{\\circ}\\mathrm{C}'}</Tex></li>
              <li>✓ Линейно разширение <Tex>{'\\Delta L = \\alpha L_0 \\Delta t'}</Tex>; водата е най-плътна при около 4 °C</li>
              <li>✓ Топлината е пренесена енергия: <Tex>{'Q = mc\\Delta t'}</Tex>, за водата <Tex>{'c \\approx 4200\\ \\mathrm{J/(kg \\cdot K)}'}</Tex></li>
              <li>✓ Топлинен баланс: <Tex>{'Q_{\\text{отд}} = Q_{\\text{пол}}'}</Tex></li>
              <li>✓ Топене <Tex>{'Q = \\lambda m'}</Tex>, изпарение <Tex>{'Q = Lm'}</Tex>; температурата стои, докато се сменя агрегатното състояние</li>
              <li>✓ Топлопроводност, конвекция, излъчване; през стена <Tex>{'q = \\frac{kS\\Delta t}{d}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Тенджерата под налягане готви по-бързо, защото налягането в нея е около два пъти по-голямо от атмосферното и водата кипи при
              около 120 °C. На Еверест е точно обратното: налягането е около една трета от това на морското равнище и водата кипи при около 70
              °C – алпинистите могат да варят ориз с часове, без той да омекне. Температурата на кипене не е „свойство на водата“, а зависи от
              налягането над нея.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
