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
import Term from '~/Term';
import { Molecule } from '../StructuralFormula';
import AcidRainLab from './AcidRainLab';
import CarbonLab from './CarbonLab';
import OzoneCycleLab from './OzoneCycleLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');

// Реакции с „хубава“ атомна икономия: [уравнение, желан продукт, M(продукт) · коефициент, сбор на реагентите]
const ECONOMY: [string, string, number, number][] = [
  ['\\mathrm{CaCO_3 \\to CaO + CO_2}', 'CaO', 56, 100],
  ['\\mathrm{CaCO_3 \\to CaO + CO_2}', 'CO_2', 44, 100],
  ['\\mathrm{CH_4 \\to C + 2H_2}', 'H_2', 4, 16],
  ['\\mathrm{CH_4 \\to C + 2H_2}', 'C', 12, 16],
  ['\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}', 'CO_2', 44, 80],
  ['\\mathrm{C_2H_4 + H_2O \\to C_2H_5OH}', 'C_2H_5OH', 46, 46],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const m = pick([3, 6, 12, 24, 30, 60]);
    return {
      tex: `m(\\mathrm{C}) = ${m}\\ \\mathrm{kg}`,
      ask: 'Колко килограма CO₂ се получават при пълното изгаряне на въглерода?',
      num: (m * 44) / 12,
      den: 1,
      steps: ['$\\mathrm{C + O_2 \\to CO_2}$: от 12 kg въглерод – 44 kg $\\mathrm{CO_2}$', `$m(\\mathrm{CO_2}) = ${m} \\cdot \\frac{44}{12} = ${dec((m * 44) / 12)}\\ \\mathrm{kg}$`],
    };
  }
  if (kind === 1) {
    const m = pick([4, 8, 16, 20, 32, 40]);
    return {
      tex: `m(\\mathrm{CH_4}) = ${m}\\ \\mathrm{kg}`,
      ask: 'Колко килограма CO₂ дава изгарянето на метана?',
      num: m * 2.75,
      den: 1,
      steps: ['$\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}$: от 16 kg метан – 44 kg $\\mathrm{CO_2}$', `$m(\\mathrm{CO_2}) = ${m} \\cdot \\frac{44}{16} = ${dec(m * 2.75)}\\ \\mathrm{kg}$`],
    };
  }
  if (kind === 2) {
    const c = pick([0.5, 1, 2, 5, 10]);
    const V = pick([2, 10, 50, 100, 1000]);
    return {
      tex: `c = ${dec(c)}\\ \\mathrm{ppm},\\quad V = ${V}\\ \\mathrm{L}\\ \\text{вода}`,
      ask: 'Колко милиграма от замърсителя има във водата?',
      num: c * V * 10,
      den: 10,
      steps: ['За разредени водни разтвори $1\\ \\mathrm{ppm} = 1\\ \\mathrm{mg/kg} \\approx 1\\ \\mathrm{mg/L}$', `$m = ${dec(c)} \\cdot ${V} = ${dec(c * V)}\\ \\mathrm{mg}$`],
    };
  }
  if (kind === 3) {
    const a = pick([5.6, 5, 6]);
    const d = pick([1, 2, 3]);
    return {
      tex: `\\mathrm{pH}: ${dec(a)} \\to ${dec(a - d)}`,
      ask: 'Колко пъти се е увеличила концентрацията на H⁺ йоните?',
      num: 10 ** d,
      den: 1,
      steps: ['Всяка единица pH е 10 пъти по концентрацията на $\\mathrm{H^+}$', `$10^{${d}} = ${10 ** d}$ пъти`],
    };
  }
  if (kind === 4) {
    const [eq, prod, mp, mr] = pick(ECONOMY);
    return {
      tex: eq,
      ask: `Каква е атомната икономия (в %) за получаване на $\\mathrm{${prod}}$?`,
      num: (mp * 100) / mr,
      den: 1,
      steps: [`Масата на желания продукт по уравнението: $${mp}\\ \\mathrm{g}$; на всички реагенти: $${mr}\\ \\mathrm{g}$`, `$\\frac{${mp}}{${mr}} \\cdot 100\\% = ${dec((mp * 100) / mr)}\\%$`],
    };
  }
  const c = pick([1, 1.5, 2, 2.5, 3]);
  const V = pick([1, 2, 5, 10]);
  return {
    tex: `c(\\mathrm{Ca(HCO_3)_2}) = ${dec(c)}\\ \\mathrm{mmol/L},\\quad V = ${V}\\ \\mathrm{L}`,
    ask: 'Колко милиграма котлен камък CaCO₃ остават след преваряване?',
    num: c * V * 100,
    den: 1,
    steps: ['$\\mathrm{Ca(HCO_3)_2 \\to CaCO_3 + H_2O + CO_2}$ – мол за мол', `$n = ${dec(c)} \\cdot ${V} = ${dec(c * V)}\\ \\mathrm{mmol}$; $m = ${dec(c * V)} \\cdot 100 = ${dec(c * V * 100)}\\ \\mathrm{mg}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🚗 Колко CO₂ изпуска една кола',
    problem: 'Кола харчи 6 L бензин на 100 km и изминава 12 000 km годишно. Приемете, че бензинът е октан C₈H₁₈ с плътност 0,74 kg/L. Колко тона CO₂ изпуска колата за година?',
    solution: ['Бензин: $\\frac{12\\,000}{100} \\cdot 6 = 720\\ \\mathrm{L}$, т.е. $720 \\cdot 0{,}74 \\approx 533\\ \\mathrm{kg}$', '$\\mathrm{2C_8H_{18} + 25O_2 \\to 16CO_2 + 18H_2O}$: от 114 kg октан – $8 \\cdot 44 = 352\\ \\mathrm{kg}$ $\\mathrm{CO_2}$', '$m(\\mathrm{CO_2}) = 533 \\cdot \\frac{352}{114} \\approx 1645\\ \\mathrm{kg} \\approx 1{,}6\\ \\mathrm{t}$ – три пъти повече от масата на бензина, защото кислородът идва от въздуха.'],
    answer: '$\\approx 1{,}6\\ \\mathrm{t}$',
    check: [1.645],
    ask: ['CO₂, t'],
  },
  {
    title: '🏭 Сероочистване в ТЕЦ',
    problem: 'ТЕЦ изгаря за час 1000 t лигнитни въглища с 2% сяра. Колко тона SO₂ би изпуснала без очистване и колко – ако сероочистващата инсталация задържа 95% от него?',
    solution: ['Сяра: $0{,}02 \\cdot 1000 = 20\\ \\mathrm{t}$; $\\mathrm{S + O_2 \\to SO_2}$ – от 32 t сяра се получават 64 t $\\mathrm{SO_2}$', 'Без очистване: $40\\ \\mathrm{t}$ $\\mathrm{SO_2}$ на час', 'С очистване остават $5\\%$: $0{,}05 \\cdot 40 = 2\\ \\mathrm{t}$. Задържаният $\\mathrm{SO_2}$ става гипс, който се използва в строителството.'],
    answer: '$40\\ \\mathrm{t}$ и $2\\ \\mathrm{t}$',
    check: [40, 2],
    ask: ['без очистване, t', 'с очистване, t'],
  },
  {
    title: '🌊 Малко по-кисел океан',
    problem: 'Средното pH на повърхностната океанска вода е спаднало от около 8,2 преди индустриалната революция до около 8,1 днес. Колко пъти и с колко процента се е увеличила концентрацията на H⁺ йоните?',
    solution: ['$\\frac{[\\mathrm{H^+}]_2}{[\\mathrm{H^+}]_1} = 10^{8{,}2 - 8{,}1} = 10^{0{,}1} \\approx 1{,}26$', 'Това е увеличение с около 26%. Океанът е още основен (pH > 7) – „подкисляване“ означава движение към киселата страна, не че водата е станала кисела.'],
    answer: '$\\approx 1{,}26$ пъти, $\\approx 26\\%$',
    check: [1.26, 26],
    ask: ['пъти', 'увеличение, %'],
  },
  {
    title: '❄️ Фреонът в стария хладилник',
    problem: 'Стар хладилник съдържа 150 g фреон CCl₂F₂. Колко мола хлорни атоми има в него? Ако всеки хлорен атом разруши 100 000 молекули озон, колко килограма озон е това?',
    solution: ['$M(\\mathrm{CCl_2F_2}) = 12 + 2 \\cdot 35{,}5 + 2 \\cdot 19 = 121\\ \\mathrm{g/mol}$; $n = \\frac{150}{121} \\approx 1{,}24\\ \\mathrm{mol}$', '$n(\\mathrm{Cl}) = 2 \\cdot 1{,}24 \\approx 2{,}48\\ \\mathrm{mol}$', '$m(\\mathrm{O_3}) = 2{,}48 \\cdot 10^5 \\cdot 48\\ \\mathrm{g} \\approx 1{,}19 \\cdot 10^7\\ \\mathrm{g} \\approx 11\\,900\\ \\mathrm{kg}$ – горна граница, но показва защо фреоните трябва да се събират при бракуване.'],
    answer: '$\\approx 2{,}48\\ \\mathrm{mol}$, $\\approx 11\\,900\\ \\mathrm{kg}$',
    check: [2.48, 11900],
    ask: ['Cl, mol', 'озон, kg'],
  },
  {
    title: '☕ Котлен камък в каната',
    problem: 'Чешмяната вода съдържа калциев хидрогенкарбонат 3 mmol/L. Всеки ден в каната се преваряват 1,5 L вода. Колко грама котлен камък CaCO₃ се отлагат за година?',
    solution: ['$\\mathrm{Ca(HCO_3)_2 \\xrightarrow{t} CaCO_3 + H_2O + CO_2}$ – мол за мол', 'За година: $3 \\cdot 1{,}5 \\cdot 365 = 1642{,}5\\ \\mathrm{mmol}$', '$m = 1{,}6425 \\cdot 100 \\approx 164\\ \\mathrm{g}$ – затова каната се почиства с оцет или лимонена киселина.'],
    answer: '$\\approx 164\\ \\mathrm{g}$',
    check: [164],
    ask: ['CaCO₃, g'],
  },
  {
    title: '🌿 Два пътя до един продукт',
    problem: 'Етиленоксидът C₂H₄O (суровина за антифриз и полиестери) по-рано се е получавал по сумарното уравнение C₂H₄ + Cl₂ + Ca(OH)₂ → C₂H₄O + CaCl₂ + H₂O, а днес – чрез директно окисление 2C₂H₄ + O₂ → 2C₂H₄O. Каква е атомната икономия на стария метод и колко тона отпадъци се падат на тон продукт?',
    solution: ['Реагенти: $28 + 71 + 74 = 173\\ \\mathrm{g}$, продукт: $44\\ \\mathrm{g}$', 'Атомна икономия: $\\frac{44}{173} \\cdot 100\\% \\approx 25{,}4\\%$', 'Отпадъци: $\\frac{173 - 44}{44} \\approx 2{,}93\\ \\mathrm{t}$ на тон. При директното окисление атомната икономия е 100%.'],
    answer: '$\\approx 25{,}4\\%$, $\\approx 2{,}93\\ \\mathrm{t}$',
    check: [25.4, 2.93],
    ask: ['атомна икономия, %', 'отпадъци, t'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой газ има най-голям обемен дял в сухия въздух след азота и кислорода?',
    answers: ['аргон', 'въглероден диоксид', 'водород', 'озон'],
    correctAnswer: 'аргон',
  },
  {
    question: 'Защо CO₂ и CH₄ са парникови газове, а N₂ и O₂ – не?',
    answers: ['трептенията на молекулите им поглъщат инфрачервено лъчение', 'защото са по-тежки от въздуха', 'защото са отровни', 'защото поглъщат видимата светлина'],
    correctAnswer: 'трептенията на молекулите им поглъщат инфрачервено лъчение',
  },
  {
    question: 'Какво е pH на чистия дъжд, в който е разтворен само CO₂ от въздуха?',
    answers: ['около 5,6', 'точно 7', 'около 8,2', 'около 3'],
    correctAnswer: 'около 5,6',
  },
  {
    question: 'Каква е ролята на хлорния атом в реакциите Cl + O₃ → ClO + O₂ и ClO + O → Cl + O₂?',
    answers: ['катализатор', 'продукт', 'инхибитор', 'реагент, който се изразходва'],
    correctAnswer: 'катализатор',
  },
  {
    question: 'Кой газ е основната причина за киселинните дъждове около ТЕЦ на въглища?',
    answers: ['$\\mathrm{SO_2}$', '$\\mathrm{CO_2}$', '$\\mathrm{CH_4}$', '$\\mathrm{O_3}$'],
    correctAnswer: '$\\mathrm{SO_2}$',
  },
  {
    question: 'Коя твърдост на водата се премахва с преваряване?',
    answers: ['временната (от хидрогенкарбонати)', 'постоянната (от сулфати и хлориди)', 'и двете', 'нито една'],
    correctAnswer: 'временната (от хидрогенкарбонати)',
  },
  {
    question: 'Кое НЕ превръща каталитичният конвертор на колата?',
    answers: ['$\\mathrm{CO_2}$', '$\\mathrm{CO}$', '$\\mathrm{NO}$', 'несгорелите въглеводороди'],
    correctAnswer: '$\\mathrm{CO_2}$',
  },
  {
    question: 'Каква е атомната икономия на присъединителна реакция като $\\mathrm{C_2H_4 + H_2O \\to C_2H_5OH}$?',
    answers: ['$100\\%$', '$50\\%$', '$61\\%$', '$0\\%$'],
    correctAnswer: '$100\\%$',
  },
  {
    question: 'Какво причинява еутрофикацията на езерата?',
    answers: ['излишък от фосфати и нитрати', 'киселинните дъждове', 'озонът', 'твърдата вода'],
    correctAnswer: 'излишък от фосфати и нитрати',
  },
];

// ---------- Страница ----------

const AIR: [string, string, string][] = [
  ['азот', 'N_2', '78{,}08'],
  ['кислород', 'O_2', '20{,}95'],
  ['аргон', 'Ar', '0{,}93'],
  ['въглероден диоксид', 'CO_2', '\\approx 0{,}042'],
  ['неон, хелий, метан, криптон…', '', '< 0{,}003'],
];

const GHG: [string, string, string, string][] = [
  ['въглероден диоксид', 'CO_2', '1', 'горене, производство на цимент, изсичане на гори'],
  ['метан', 'CH_4', '\\approx 28\\text{–}30', 'животновъдство, оризища, сметища, течове на газ'],
  ['диазотен оксид', 'N_2O', '\\approx 270', 'азотни торове'],
  ['фреон CFC-12', 'CCl_2F_2', '> 10\\,000', 'стари хладилници (вече забранен)'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Environment() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Химия на околната среда</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🌍 През 1921 г. американският инженер Томас Мидгли открива, че малко тетраетилолово в бензина спира „детонациите“ в двигателя. През
            1930 г. той представя ново чудо – фреона: негорим, неотровен газ за хладилниците. Пред химици вдишва от него и с издишаното духва
            свещ. И двете изобретения изглеждат блестящи. Днес знаем, че оловото от бензина е тровило хора по целия свят десетилетия наред, а
            фреоните разрушават <strong>озоновия слой</strong>. Историкът Джон Макнийл пише, че Мидгли е повлиял на атмосферата повече от който
            и да е друг отделен организъм в историята на Земята. Химията създава проблемите – и химията помага да ги решим.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Въздухът и въглеродният цикъл</h2>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Газ</th>
                  <th className={th}>Формула</th>
                  <th className={th}><Term id="volume-fraction">Обемна част</Term> в сухия въздух, %</th>
                </tr>
              </thead>
              <tbody>
                {AIR.map(([name, f, v]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{f && <Tex>{`\\mathrm{${f}}`}</Tex>}</td>
                    <td className={td}>
                      <Tex>{v}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Въглеродът непрекъснато обикаля между атмосферата, растенията, океаните и скалите: растенията поемат <Tex>{'\\mathrm{CO_2}'}</Tex> при{' '}
            <Term id="photosynthesis">фотосинтезата</Term>, а дишането, гниенето и горенето го връщат обратно. Хилядолетия наред двата потока са били почти уравновесени и
            концентрацията на <Tex>{'\\mathrm{CO_2}'}</Tex> е била около 280 <Term id="ppm">ppm</Term> (части на милион по обем). Изгарянето на въглища, нефт и газ
            добавя въглерод, който милиони години е бил под земята. От 1958 г. Чарлз Кийлинг измерва <Tex>{'\\mathrm{CO_2}'}</Tex> на вулкана
            Мауна Лоа в Хаваите – кривата му показва ръст от около 317 ppm през 1960 г. до около 425 ppm през 2024 г.
          </p>
          <Theorem
            type="definition"
            title="ppm в газовете"
            description="За газове ppm обикновено означава обемни части на милион: $1\ \mathrm{ppm} = 10^{-6}$ от обема, т.е. $1\ \mathrm{mL}$ в $1\ \mathrm{m^3}$. Така $420\ \mathrm{ppm} = 0{,}042\%$. По закона на Авогадро това е и моловата част."
          />
          <Example
            description="Колко грама CO₂ има в 1 m³ въздух при нормални условия при концентрация 420 ppm?"
            steps={['$V(\\mathrm{CO_2}) = 420 \\cdot 10^{-6} \\cdot 1000\\ \\mathrm{L} = 0{,}42\\ \\mathrm{L}$', '$n = \\frac{0{,}42}{22{,}4} = 0{,}01875\\ \\mathrm{mol}$; $m = 0{,}01875 \\cdot 44 \\approx 0{,}825\\ \\mathrm{g}$']}
          />
          <CarbonLab />
          <p className={text}>
            Масата на получения <Tex>{'\\mathrm{CO_2}'}</Tex> е по-голяма от масата на горивото, защото към всеки въглероден атом (12) се добавят
            два кислородни (32) от въздуха. Изчисленията са същите като в урока{' '}
            <Link to="/chemistry/quantities/stoichiometry" className={link}>
              Химични уравнения и стехиометрия
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Парникови газове</h2>
          <p className={text}>
            Земята получава енергия от Слънцето като видима светлина и я излъчва обратно като инфрачервено лъчение. Част от него се поглъща от
            газове в атмосферата и Земята остава по-топла – това е <Term id="greenhouse-effect">парниковият ефект</Term> (физиката му е в лекцията{' '}
            <Link to="/astronomy/lecture13" className={link}>
              Планети от земен тип
            </Link>
            ). Без него средната температура на повърхността би била около −18 °C вместо около +15 °C.
          </p>
          <p className={text}>
            Кои молекули поглъщат инфрачервено лъчение? Тези, чиито трептения променят разпределението на <Term id="electric-charge">заряда</Term> – <Tex>{'\\mathrm{H_2O}'}</Tex>,{' '}
            <Tex>{'\\mathrm{CO_2}'}</Tex>, <Tex>{'\\mathrm{CH_4}'}</Tex>, <Tex>{'\\mathrm{N_2O}'}</Tex>. Двуатомните молекули от еднакви атоми (
            <Tex>{'\\mathrm{N_2}'}</Tex>, <Tex>{'\\mathrm{O_2}'}</Tex>) нямат такива трептения и са „прозрачни“ (повече за поглъщането на
            инфрачервено лъчение – в урока{' '}
            <Link to="/chemistry/world/spectroscopy" className={link}>
              Спектроскопия и анализ
            </Link>
            ). Най-голям дял в естествения парников ефект има водната пара, но количеството ѝ зависи от температурата – тя усилва затоплянето,
            започнато от другите газове.
          </p>
          <Theorem
            type="definition"
            title="Потенциал за глобално затопляне (GWP)"
            description="Показва колко пъти повече топлина задържа 1 kg от даден газ за 100 години в сравнение с 1 kg $\mathrm{CO_2}$. Стойностите се уточняват с всеки доклад на IPCC – в таблицата са закръглени."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Газ</th>
                  <th className={th}>Формула</th>
                  <th className={th}>GWP (100 г.)</th>
                  <th className={th}>Основни източници</th>
                </tr>
              </thead>
              <tbody>
                {GHG.map(([name, f, gwp, src]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>
                      <Tex>{`\\mathrm{${f}}`}</Tex>
                    </td>
                    <td className={td}>
                      <Tex>{gwp}</Tex>
                    </td>
                    <td className={td}>{src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="При теч от газопровод изтичат 100 kg метан. На колко килограма CO₂ се равнява това по затопляне за 100 години (GWP ≈ 28)? А ако метанът беше изгорен?"
            steps={['$100 \\cdot 28 = 2800\\ \\mathrm{kg}$ „CO₂-еквивалент“', 'При изгаряне: $100 \\cdot \\frac{44}{16} = 275\\ \\mathrm{kg}$ $\\mathrm{CO_2}$ – десет пъти по-малко. Затова изгарянето на метан от сметищата („факел“) е по-добро от изпускането му.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Подкисляване на океаните</h2>
          <p className={text}>
            Около една четвърт от изхвърления <Tex>{'\\mathrm{CO_2}'}</Tex> се разтваря в океаните. Там той участва в поредица от равновесия (виж{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              Химично равновесие
            </Link>
            ):
          </p>
          <div className="mb-4 text-center overflow-x-auto">
            <Tex block>{'\\mathrm{CO_2 + H_2O \\rightleftharpoons H_2CO_3 \\rightleftharpoons H^+ + HCO_3^-}'}</Tex>
          </div>
          <p className={text}>
            Повече <Tex>{'\\mathrm{CO_2}'}</Tex> означава повече <Tex>{'\\mathrm{H^+}'}</Tex> <Term id="ion">йони</Term>: <Term id="ph">pH</Term> на повърхностната вода е спаднало от около 8,2
            на около 8,1. Това изглежда малко, но pH е логаритмична скала (виж{' '}
            <Link to="/chemistry/reactions/acids-bases" className={link}>
              Киселини, основи и pH
            </Link>
            ) – концентрацията на <Tex>{'\\mathrm{H^+}'}</Tex> е нараснала с около една четвърт. Йоните <Tex>{'\\mathrm{H^+}'}</Tex> свързват
            карбонатните йони (<Tex>{'\\mathrm{H^+ + CO_3^{2-} \\to HCO_3^-}'}</Tex>), а от тях кораловите полипи, мидите и някои планктонни
            организми строят черупките си от <Tex>{'\\mathrm{CaCO_3}'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Озоновият слой</h2>
          <p className={text}>
            На височина около 15–35 km има повече <Term id="ozone">озон</Term> <Tex>{'\\mathrm{O_3}'}</Tex>. Той поглъща по-голямата част от
            опасното ултравиолетово лъчение на Слънцето. Озонът там постоянно се образува и разпада – цикълът на Чапман (1930 г.).
          </p>
          <p className={text}>
            Фреоните (хлорофлуоровъглеродите, CFC) са много стабилни и затова стигат непроменени до стратосферата. Там ултравиолетовото
            лъчение откъсва от тях хлорни атоми:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
            <figure className="text-center">
              <Molecule smiles="ClC(Cl)(F)F" mode="semi" title="дихлородифлуорометан" />
              <figcaption className="text-xs text-gray-500 dark:text-gray-400">CFC-12, CCl₂F₂</figcaption>
            </figure>
            <figure className="text-center">
              <Molecule smiles="ClC(Cl)(Cl)F" mode="semi" title="трихлорофлуорометан" />
              <figcaption className="text-xs text-gray-500 dark:text-gray-400">CFC-11, CCl₃F</figcaption>
            </figure>
          </div>
          <div className="mb-4 text-center overflow-x-auto">
            <Tex block>{'\\mathrm{CCl_2F_2 \\xrightarrow{\\text{УВ}} CClF_2 + Cl}'}</Tex>
          </div>
          <Theorem
            title="Каталитично разрушаване на озона"
            description="$\mathrm{Cl + O_3 \to ClO + O_2}$, после $\mathrm{ClO + O \to Cl + O_2}$. Сумарно: $\mathrm{O_3 + O \to 2O_2}$. Хлорният атом излиза непроменен – той е катализатор и може да повтори цикъла хиляди пъти, преди да се свърже в по-стабилно съединение."
          />
          <OzoneCycleLab />
          <p className={text}>
            Механизмът е предсказан от Марио Молина и Шерууд Роуланд през 1974 г., а през 1985 г. британски учени от Антарктида съобщават за
            „озоновата дупка“ – силно изтъняване на слоя всяка пролет над Южния полюс. Монреалският протокол (1987 г.) постепенно забранява
            фреоните. Според оценките на ООН слоят се възстановява и над Антарктида може да се върне към нивата от 1980 г. около 2066 г. През 1995
            г. Крутцен, Молина и Роуланд получават Нобелова награда за химия. Как действат <Term id="catalyst">катализаторите</Term> и защо ускоряват реакциите, виж в урока{' '}
            <Link to="/chemistry/reactions/kinetics" className={link}>
              Скорост на реакцията
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Киселинни дъждове и смог</h2>
          <p className={text}>
            Въглищата и нефтът съдържат сяра. При горенето тя става <Tex>{'\\mathrm{SO_2}'}</Tex>, който във въздуха се окислява до{' '}
            <Tex>{'\\mathrm{SO_3}'}</Tex> и с водата дава сярна <Term id="acid">киселина</Term>. В горещите двигатели и пещи азотът от въздуха реагира с кислорода и
            се получават азотни <Term id="oxide">оксиди</Term> <Tex>{'\\mathrm{NO_x}'}</Tex>, а от тях – азотна киселина (свойствата на тези оксиди и киселини са в урока{' '}
            <Link to="/chemistry/inorganic/nonmetals" className={link}>
              Неметали
            </Link>
            ):
          </p>
          <div className="mb-4 text-center overflow-x-auto space-y-1">
            <Tex block>{'\\mathrm{2SO_2 + O_2 \\to 2SO_3,\\qquad SO_3 + H_2O \\to H_2SO_4}'}</Tex>
            <Tex block>{'\\mathrm{N_2 + O_2 \\xrightarrow{t} 2NO,\\qquad 2NO + O_2 \\to 2NO_2,\\qquad 4NO_2 + O_2 + 2H_2O \\to 4HNO_3}'}</Tex>
          </div>
          <Theorem
            type="definition"
            title="Кисел дъжд"
            description="Валеж с pH под 5,6. Дори чистият дъжд е леко кисел заради разтворения $\mathrm{CO_2}$, но киселинните дъждове съдържат и сярна и азотна киселина. Те разтварят мрамора и варовика ($\mathrm{CaCO_3} + \mathrm{H_2SO_4} \to \mathrm{CaSO_4} + \mathrm{H_2O} + \mathrm{CO_2}$), увреждат горите и подкисляват езерата."
          />
          <AcidRainLab />
          <p className={text}>
            <strong>Фотохимичният смог</strong> се образува в слънчеви дни над големите градове. Слънчевата светлина разкъсва{' '}
            <Tex>{'\\mathrm{NO_2}'}</Tex> и полученият кислороден атом образува озон близо до земята: <Tex>{'\\mathrm{NO_2 \\xrightarrow{h\\nu} NO + O}'}</Tex>,{' '}
            <Tex>{'\\mathrm{O + O_2 \\to O_3}'}</Tex>. Озонът, който горе ни пази, долу дразни дробовете и уврежда растенията.
          </p>
          <p className={text}>
            <strong>Каталитичният конвертор</strong> на колата съдържа платина, паладий и родий върху керамична пита. Той превръща трите основни
            замърсителя в отработените газове:
          </p>
          <div className="mb-4 text-center overflow-x-auto space-y-1">
            <Tex block>{'\\mathrm{2CO + O_2 \\to 2CO_2,\\qquad 2CO + 2NO \\to 2CO_2 + N_2}'}</Tex>
            <Tex block>{'\\mathrm{C_xH_y + \\left(x + \\tfrac{y}{4}\\right)O_2 \\to xCO_2 + \\tfrac{y}{2}H_2O}'}</Tex>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Водата: твърдост и пречистване</h2>
          <Theorem
            type="definition"
            title="Твърдост на водата"
            description="Твърдостта се дължи на разтворените йони $\mathrm{Ca^{2+}}$ и $\mathrm{Mg^{2+}}$ и се изразява в mmol/L. Временната твърдост е от хидрогенкарбонатите им и се премахва с преваряване: $\mathrm{Ca(HCO_3)_2} \to \mathrm{CaCO_3} \downarrow + \mathrm{H_2O} + \mathrm{CO_2} \uparrow$. Постоянната твърдост е от сулфатите и хлоридите им и се премахва например със сода: $\mathrm{CaSO_4} + \mathrm{Na_2CO_3} \to \mathrm{CaCO_3} \downarrow + \mathrm{Na_2SO_4}$, или с йонообменници."
          />
          <p className={text}>
            Твърдата вода оставя котлен камък в каните и бойлерите и пречи на сапуна да се пени: калциевите йони образуват със сапуна
            неразтворими соли. <Term id="precipitate">Утайките</Term> и йонните уравнения са разгледани в урока{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            .
          </p>
          <Example
            description="Колко грама сода Na₂CO₃ са нужни, за да се отстрани постоянната твърдост на 200 L вода, която съдържа 2 mmol/L Ca²⁺?"
            steps={['$n(\\mathrm{Ca^{2+}}) = 2 \\cdot 200 = 400\\ \\mathrm{mmol} = 0{,}4\\ \\mathrm{mol}$', '$\\mathrm{Ca^{2+} + CO_3^{2-} \\to CaCO_3 \\downarrow}$ – мол за мол', '$m(\\mathrm{Na_2CO_3}) = 0{,}4 \\cdot 106 = 42{,}4\\ \\mathrm{g}$']}
          />
          <p className={text}>
            В пречиствателните станции водата първо се утаява, после се добавя алуминиев сулфат. Той дава рехава утайка от{' '}
            <Tex>{'\\mathrm{Al(OH)_3}'}</Tex>, която „събира“ фините частици (коагулация):{' '}
            <Tex>{'\\mathrm{Al_2(SO_4)_3} + \\mathrm{3Ca(HCO_3)_2} \\to \\mathrm{2Al(OH)_3} \\downarrow + \\mathrm{3CaSO_4} + \\mathrm{6CO_2}'}</Tex>. Накрая водата се филтрира през пясък
            и се обеззаразява с хлор (<Tex>{'\\mathrm{Cl_2 + H_2O \\rightleftharpoons HCl + HClO}'}</Tex> – хипохлорестата киселина убива{' '}
            <Term id="bacterium">бактериите</Term>) или с озон.
          </p>
          <p className={text}>
            Два други проблема с водата: <strong>тежките метали</strong> (олово, живак, кадмий) се натрупват в организмите и не се разграждат;
            концентрациите им се следят в ppm и ppb (виж{' '}
            <Link to="/chemistry/quantities/solutions" className={link}>
              Разтвори и концентрации
            </Link>
            ). При <strong>еутрофикацията</strong> излишните фосфати и нитрати от торове и перилни препарати подхранват бурно размножаване на{' '}
            <Term id="alga">водорасли</Term>. Когато те загният, бактериите изразходват разтворения кислород и рибите се задушават. Пластмасовите отпадъци и{' '}
            <Term id="microplastic">микропластмасата</Term> са разгледани в урока{' '}
            <Link to="/chemistry/organic/polymers" className={link}>
              Полимери
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Зелена химия и атомна икономия</h2>
          <p className={text}>
            Зелената химия търси процеси, които изобщо не създават замърсяване: без отровни <Term id="reactant">реагенти</Term> и <Term id="solvent">разтворители</Term>, с катализатори вместо
            стехиометрични реагенти, с възобновими суровини и с възможно най-малко отпадъци. Един от измерителите е атомната икономия.
          </p>
          <Theorem
            type="definition"
            title="Атомна икономия"
            description="Каква част от масата на реагентите по уравнението влиза в желания продукт: $\text{АИ} = \frac{M(\text{желан продукт}) \cdot k}{\sum M(\text{реагенти}) \cdot k_i} \cdot 100\%$, където $k$ са коефициентите. Присъединителните реакции имат АИ = 100%; при заместване и разлагане част от атомите отиват в странични продукти."
          />
          <Example
            description="Каква е атомната икономия на получаването на хлорометан CH₃Cl по реакцията CH₄ + Cl₂ → CH₃Cl + HCl?"
            steps={['$\\sum M(\\text{реагенти}) = 16 + 71 = 87\\ \\mathrm{g/mol}$; $M(\\mathrm{CH_3Cl}) = 50{,}5\\ \\mathrm{g/mol}$', '$\\text{АИ} = \\frac{50{,}5}{87} \\cdot 100\\% \\approx 58\\%$', 'Атомната икономия не казва какъв е добивът – тя е горна граница, ако реакцията протече идеално.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 8. Тренажор
          </h2>
          <p className={text}>CO₂ от горене, ppm във вода, pH, атомна икономия и котлен камък. Десетичните отговори въвеждай като 5,6.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Околната среда в числа</h2>
          <p className={text}>Колата, ТЕЦ, океанът, хладилникът и каната в кухнята – навсякъде има химични сметки за околната среда.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Озоновата дупка и парниковият ефект', 'Озоновата дупка затопля Земята.', 'Това са различни явления: озоновата дупка пропуска УВ лъчение, а парниковите газове задържат инфрачервено.'],
              ['Озонът е само полезен', 'Повече озон навсякъде е добре.', 'В стратосферата ни пази, а близо до земята е замърсител – част от смога.'],
              ['Кисел дъжд', 'Всеки дъжд с pH под 7 е кисел дъжд.', 'Чистият дъжд е около 5,6 заради CO₂; кисел дъжд е под 5,6.'],
              ['Конверторът и CO₂', 'Катализаторът в колата премахва CO₂.', 'Той превръща CO, NO и въглеводородите – и дори образува CO₂.'],
              ['Преваряването', 'Преваряването премахва всякаква твърдост.', 'Само временната (хидрогенкарбонатите); сулфатите и хлоридите остават.'],
              ['ppm и проценти', '420 ppm = 4,2%', '$1\\ \\mathrm{ppm} = 10^{-4}\\%$, значи $420\\ \\mathrm{ppm} = 0{,}042\\%$'],
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
          <h2 className={h2}>11. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко литра и колко грама CO₂ има в 1 m³ въздух (нормални условия) при концентрация 420 ppm?" check={[0.42, 0.825]} ask={['$V$, L', '$m$, g']}>
                <p><Tex>{'V = 420 \\cdot 10^{-6} \\cdot 1000\\ \\mathrm{L} = 0{,}42\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'m = \\frac{0{,}42}{22{,}4} \\cdot 44 \\approx 0{,}825\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="2 L вода с временна твърдост 2,5 mmol/L $\mathrm{Ca(HCO_3)_2}$ се преваряват. Колко грама $\mathrm{CaCO_3}$ се утаяват?" check={[0.5]} ask={['$m$, g']}>
                <p><Tex>{'\\mathrm{Ca(HCO_3)_2} \\to \\mathrm{CaCO_3} + \\mathrm{H_2O} + \\mathrm{CO_2}'}</Tex></p>
                <p><Tex>{'n = 2{,}5 \\cdot 2 = 5\\ \\mathrm{mmol}'}</Tex>, <Tex>{'m = 5 \\cdot 100 = 500\\ \\mathrm{mg} = 0{,}5\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Каква е атомната икономия на получаването на негасена вар CaO чрез разлагане на варовик $\mathrm{CaCO_3 \to CaO + CO_2}$?" check={[56]} ask={['АИ, %']}>
                <p><Tex>{'\\text{АИ} = \\frac{56}{100} \\cdot 100\\% = 56\\%'}</Tex></p>
                <p>Останалите 44% от масата излитат като <Tex>{'\\mathrm{CO_2}'}</Tex> – затова производството на вар и цимент изпуска много въглероден диоксид дори без горене.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Изгаря 1 t въглища с 80% въглерод. Колко тона $\mathrm{CO_2}$ се получават и какъв обем (в m³) заемат при нормални условия?" check={[2.93, 1493]} ask={['$m$, t', '$V$, m³']}>
                <p><Tex>{'m(\\mathrm{C}) = 800\\ \\mathrm{kg}'}</Tex>; <Tex>{'m(\\mathrm{CO_2}) = 800 \\cdot \\frac{44}{12} \\approx 2933\\ \\mathrm{kg} \\approx 2{,}93\\ \\mathrm{t}'}</Tex></p>
                <p><Tex>{'n = \\frac{800\\,000}{12} \\approx 66\\,667\\ \\mathrm{mol}'}</Tex>; <Tex>{'V = 66\\,667 \\cdot 22{,}4\\ \\mathrm{L} \\approx 1493\\ \\mathrm{m^3}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Дъжд има pH 4. Колко пъти концентрацията на $\mathrm{H^+}$ в него е по-голяма от тази в чист дъжд (pH 5,6)? Колко грама $\mathrm{H_2SO_4}$ биха дали такава киселинност на 1 m³ вода (приемете пълна дисоциация)?" check={[39.8, 4.9]} ask={['пъти', '$m$, g']}>
                <p><Tex>{'10^{5{,}6 - 4} = 10^{1{,}6} \\approx 39{,}8'}</Tex> пъти.</p>
                <p><Tex>{'[\\mathrm{H^+}] = 10^{-4}\\ \\mathrm{mol/L}'}</Tex>; в 1000 L: <Tex>{'n(\\mathrm{H^+}) = 0{,}1\\ \\mathrm{mol}'}</Tex>.</p>
                <p>Всяка молекула <Tex>{'\\mathrm{H_2SO_4}'}</Tex> дава 2 йона <Tex>{'\\mathrm{H^+}'}</Tex>: <Tex>{'n = 0{,}05\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}05 \\cdot 98 = 4{,}9\\ \\mathrm{g}'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Целият озон над 1 m² от земната повърхност, ако бъде събран при нормални условия, образува слой с дебелина около 3 mm („300 добсънови единици“). Колко мола и колко грама озон има над всеки квадратен метър?" check={[0.134, 6.43]} ask={['$n$, mol', '$m$, g']}>
                <p>Обем: <Tex>{'1\\ \\mathrm{m^2} \\cdot 0{,}003\\ \\mathrm{m} = 0{,}003\\ \\mathrm{m^3} = 3\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'n = \\frac{3}{22{,}4} \\approx 0{,}134\\ \\mathrm{mol}'}</Tex>, <Tex>{'m = 0{,}134 \\cdot 48 \\approx 6{,}43\\ \\mathrm{g}'}</Tex></p>
                <p>Само няколко грама на квадратен метър – и от тях зависи животът на сушата.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Разтворимостта на $\mathrm{CO_2}$ във вода е $c = K_H \cdot p$ с $K_H = 0{,}034\ \mathrm{mol/(L \cdot atm)}$, а $K_{a1}(\mathrm{H_2CO_3}) = 4{,}3 \cdot 10^{-7}$. Пресметнете pH на чиста дъждовна вода при 420 ppm $\mathrm{CO_2}$ и при 280 ppm (налягане 1 atm; пренебрегнете втората степен на дисоциация)." check={[5.61, 5.69]} ask={['pH (420 ppm)', 'pH (280 ppm)']}>
                <p>При 420 ppm: <Tex>{'p = 4{,}2 \\cdot 10^{-4}\\ \\mathrm{atm}'}</Tex>, <Tex>{'c = 0{,}034 \\cdot 4{,}2 \\cdot 10^{-4} \\approx 1{,}43 \\cdot 10^{-5}\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'[\\mathrm{H^+}] = \\sqrt{K_{a1} c} = \\sqrt{4{,}3 \\cdot 10^{-7} \\cdot 1{,}43 \\cdot 10^{-5}} \\approx 2{,}48 \\cdot 10^{-6}'}</Tex>, <Tex>{'\\mathrm{pH} \\approx 5{,}61'}</Tex></p>
                <p>При 280 ppm: <Tex>{'c \\approx 9{,}52 \\cdot 10^{-6}'}</Tex>, <Tex>{'[\\mathrm{H^+}] \\approx 2{,}02 \\cdot 10^{-6}'}</Tex>, <Tex>{'\\mathrm{pH} \\approx 5{,}69'}</Tex>. Ето откъде идва „5,6“.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Етиленоксид $\mathrm{C_2H_4O}$ се е получавал по сумарното уравнение $\mathrm{C_2H_4} + \mathrm{Cl_2} + \mathrm{Ca(OH)_2} \to \mathrm{C_2H_4O} + \mathrm{CaCl_2} + \mathrm{H_2O}$. Каква е атомната икономия и колко тона странични продукти се падат на всеки тон етиленоксид (при 100% добив)?" check={[25.4, 2.93]} ask={['АИ, %', 'странични продукти, t']}>
                <p>Реагенти: <Tex>{'28 + 71 + 74 = 173\\ \\mathrm{g}'}</Tex>, продукт: <Tex>{'44\\ \\mathrm{g}'}</Tex>.</p>
                <p><Tex>{'\\text{АИ} = \\frac{44}{173} \\cdot 100\\% \\approx 25{,}4\\%'}</Tex></p>
                <p>Странични продукти: <Tex>{'\\frac{173 - 44}{44} \\approx 2{,}93\\ \\mathrm{t}'}</Tex> на тон (предимно <Tex>{'\\mathrm{CaCl_2}'}</Tex>). Днешният метод <Tex>{'\\mathrm{2C_2H_4 + O_2 \\xrightarrow{Ag} 2C_2H_4O}'}</Tex> има АИ = 100%.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="1 L вода съдържа 80 mg $\mathrm{Ca^{2+}}$ и 24 mg $\mathrm{Mg^{2+}}$. Каква е общата твърдост в mmol/L? Колко грама $\mathrm{Na_2CO_3}$ са нужни за омекотяването на 100 L от тази вода (приемете, че двата йона се утаяват като карбонати)?" check={[3, 31.8]} ask={['твърдост, mmol/L', '$m$, g']}>
                <p><Tex>{'n(\\mathrm{Ca^{2+}}) = \\frac{80}{40} = 2\\ \\mathrm{mmol}'}</Tex>, <Tex>{'n(\\mathrm{Mg^{2+}}) = \\frac{24}{24} = 1\\ \\mathrm{mmol}'}</Tex> – общо 3 mmol/L.</p>
                <p>За 100 L: 300 mmol = 0,3 mol <Tex>{'\\mathrm{CO_3^{2-}}'}</Tex>; <Tex>{'m(\\mathrm{Na_2CO_3}) = 0{,}3 \\cdot 106 = 31{,}8\\ \\mathrm{g}'}</Tex></p>
                <p>В практиката магнезият се утаява по-трудно (<Tex>{'\\mathrm{MgCO_3}'}</Tex> е малко разтворим) и затова често се добавя и вар.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Концентрацията на <Tex>{'\\mathrm{CO_2}'}</Tex> е нараснала от около 280 ppm до около 425 ppm (2024 г.); 1 ppm ≈ 7,8 Gt <Tex>{'\\mathrm{CO_2}'}</Tex></li>
              <li>✓ Парникови са газовете, чиито молекули поглъщат инфрачервено лъчение: <Tex>{'\\mathrm{H_2O}'}</Tex>, <Tex>{'\\mathrm{CO_2}'}</Tex>, <Tex>{'\\mathrm{CH_4}'}</Tex>, <Tex>{'\\mathrm{N_2O}'}</Tex></li>
              <li>✓ Разтвореният <Tex>{'\\mathrm{CO_2}'}</Tex> подкислява океаните: pH от около 8,2 до около 8,1</li>
              <li>✓ Хлорът от фреоните разрушава озона каталитично: <Tex>{'\\mathrm{Cl + O_3 \\to ClO + O_2}'}</Tex>, <Tex>{'\\mathrm{ClO + O \\to Cl + O_2}'}</Tex></li>
              <li>✓ <Tex>{'\\mathrm{SO_2}'}</Tex> и <Tex>{'\\mathrm{NO_x}'}</Tex> дават киселинни дъждове (pH под 5,6); конверторът превръща CO, NO и <Term id="hydrocarbon">въглеводородите</Term></li>
              <li>✓ Временната твърдост се премахва с преваряване, постоянната – със сода или йонообмен</li>
              <li>✓ Атомна икономия = маса на желания продукт / маса на реагентите · 100%</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Монреалският протокол е първият договор на ООН, ратифициран от всички страни членки (през 2009 г.). Освен озона той помага и на
              климата: фреоните са и силни парникови газове. Според изследване от 2007 г. към 2010 г. протоколът е намалявал емисиите с около
              10 милиарда тона <Tex>{'\\mathrm{CO_2}'}</Tex>-еквивалент годишно – няколко пъти повече от целта на Протокола от Киото.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
