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
import ExtractionLab from './ExtractionLab';
import MetalReactionLab from './MetalReactionLab';
import MixtureLab from './MixtureLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');
/** Отговор като точна дроб: всички стойности тук са крайни десетични дроби с до 4 знака. */
const answer = (v: number) => ({ num: Math.round(v * 10000), den: 10000 });

// Метал, моларна маса и молове H₂ на мол метал със солна киселина
const ACID_METALS: [string, number, number, string][] = [
  ['Mg', 24, 1, '\\mathrm{Mg + 2HCl \\to MgCl_2 + H_2}'],
  ['Zn', 65, 1, '\\mathrm{Zn + 2HCl \\to ZnCl_2 + H_2}'],
  ['Fe', 56, 1, '\\mathrm{Fe + 2HCl \\to FeCl_2 + H_2}'],
  ['Al', 27, 1.5, '\\mathrm{2Al + 6HCl \\to 2AlCl_3 + 3H_2}'],
  ['Ca', 40, 1, '\\mathrm{Ca + 2HCl \\to CaCl_2 + H_2}'],
];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const [s, M, k, eq] = pick(ACID_METALS);
    const n = pick([0.05, 0.1, 0.2, 0.25, 0.5]);
    const m = n * M;
    const V = n * k * 22.4;
    return {
      tex: `${dec(m)}\\ \\mathrm{g\\ ${s}} + \\mathrm{HCl}\\ \\text{(излишък)}`,
      ask: 'Колко литра водород (н.у.) се отделят?',
      ...answer(V),
      steps: [`$${eq}$`, `$n(\\mathrm{${s}}) = \\frac{${dec(m)}}{${M}} = ${dec(n)}\\ \\mathrm{mol}$`, `$n(\\mathrm{H_2}) = ${k === 1 ? '' : '1{,}5 \\cdot '}${dec(n)} = ${dec(n * k)}\\ \\mathrm{mol}$, $V = ${dec(n * k)} \\cdot 22{,}4 = ${dec(V)}\\ \\mathrm{L}$`],
    };
  }
  if (kind === 1) {
    const [s, M] = pick<[string, number]>([
      ['Fe', 56],
      ['Zn', 65],
      ['Mg', 24],
    ]);
    const n = pick([0.05, 0.1, 0.2, 0.4]);
    return {
      tex: `\\mathrm{${s} + CuSO_4 \\to ${s}SO_4 + Cu}`,
      ask: `Колко грама мед се отлагат, ако реагират ${dec(n * M).replace('{,}', ',')} g ${s}?`,
      ...answer(n * 63.5),
      steps: [`$n(\\mathrm{${s}}) = \\frac{${dec(n * M)}}{${M}} = ${dec(n)}\\ \\mathrm{mol} = n(\\mathrm{Cu})$`, `$m(\\mathrm{Cu}) = ${dec(n)} \\cdot 63{,}5 = ${dec(n * 63.5)}\\ \\mathrm{g}$`],
    };
  }
  if (kind === 2) {
    const ore = pick([1, 2, 5, 10]);
    const p = pick([60, 70, 80, 90]);
    const eta = pick([80, 90, 100]);
    const fe = (ore * p * 0.7 * eta) / 10000;
    return {
      tex: `${ore}\\ \\mathrm{t}\\ \\text{руда с}\\ ${p}\\%\\ \\mathrm{Fe_2O_3},\\ \\text{добив}\\ ${eta}\\%`,
      ask: 'Колко тона желязо се получават?',
      ...answer(fe),
      steps: [`$w(\\mathrm{Fe}) = \\frac{112}{160} = 0{,}7$`, `$m(\\mathrm{Fe}) = ${ore} \\cdot ${dec(p / 100)} \\cdot 0{,}7 \\cdot ${dec(eta / 100)} = ${dec(fe)}\\ \\mathrm{t}$`],
    };
  }
  if (kind === 3) {
    const total = pick([10, 20, 25, 50]);
    const n = pick([0.1, 0.2].filter(x => x * 65 < total));
    const V = n * 22.4;
    const wCu = ((total - n * 65) / total) * 100;
    return {
      tex: `${total}\\ \\mathrm{g}\\ (\\mathrm{Zn + Cu}) + \\mathrm{HCl} \\to ${dec(V)}\\ \\mathrm{L\\ H_2}\\ \\text{(н.у.)}`,
      ask: 'Каква е масовата част на медта в сместа (в %)?',
      ...answer(wCu),
      steps: [
        'Медта не реагира със солна киселина – целият водород е от цинка.',
        `$n(\\mathrm{Zn}) = n(\\mathrm{H_2}) = \\frac{${dec(V)}}{22{,}4} = ${dec(n)}\\ \\mathrm{mol}$, $m(\\mathrm{Zn}) = ${dec(n * 65)}\\ \\mathrm{g}$`,
        `$w(\\mathrm{Cu}) = \\frac{${total} - ${dec(n * 65)}}{${total}} \\cdot 100\\% = ${dec(wCu)}\\%$`,
      ],
    };
  }
  if (kind === 4) {
    const [s, M] = pick<[string, number]>([
      ['Li', 7],
      ['Na', 23],
      ['K', 39],
    ]);
    const n = pick([0.1, 0.2, 0.5, 1]);
    const V = (n / 2) * 22.4;
    return {
      tex: `\\mathrm{2${s} + 2H_2O \\to 2${s}OH + H_2}`,
      ask: `Колко литра водород (н.у.) отделят ${dec(n * M).replace('{,}', ',')} g ${s}?`,
      ...answer(V),
      steps: [`$n(\\mathrm{${s}}) = \\frac{${dec(n * M)}}{${M}} = ${dec(n)}\\ \\mathrm{mol}$`, `$n(\\mathrm{H_2}) = \\frac{${dec(n)}}{2} = ${dec(n / 2)}\\ \\mathrm{mol}$, $V = ${dec(V)}\\ \\mathrm{L}$`],
    };
  }
  const [probe, w] = pick<[number, number]>([
    [585, 0.585],
    [750, 0.75],
    [375, 0.375],
  ]);
  const m = pick([2, 4, 5, 8, 10]);
  return {
    tex: `\\text{златен пръстен, проба}\\ ${probe},\\ m = ${m}\\ \\mathrm{g}`,
    ask: 'Колко грама чисто злато съдържа?',
    ...answer(m * w),
    steps: [`Пробата ${probe} означава ${probe} части злато на 1000 части сплав.`, `$m(\\mathrm{Au}) = ${m} \\cdot ${dec(w)} = ${dec(m * w)}\\ \\mathrm{g}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🥫 Алуминий от боксит',
    problem: 'Колко килограма чист Al₂O₃ са нужни за 1 t алуминий, ако цялото количество се превърне в метал? Колко електроенергия отива за тази 1 t, ако за 1 kg алуминий се изразходват около 14 kWh?',
    solution: ['$2\\mathrm{Al_2O_3} \\to 4\\mathrm{Al} + 3\\mathrm{O_2}$: от 102 g $\\mathrm{Al_2O_3}$ се получават 54 g Al.', '$m(\\mathrm{Al_2O_3}) = 1000 \\cdot \\frac{102}{54} \\approx 1889\\ \\mathrm{kg}$', 'Енергия: $1000 \\cdot 14 = 14\\,000\\ \\mathrm{kWh}$ – колкото едно домакинство изразходва за няколко години. Рециклираният алуминий струва около 20 пъти по-малко енергия.'],
    answer: '$\\approx 1889\\ \\mathrm{kg}$, $14\\,000\\ \\mathrm{kWh}$',
    check: [1889, 14000],
    ask: ['Al₂O₃, kg', 'енергия, kWh'],
  },
  {
    title: '🔩 Пирон в меден сулфат',
    problem: 'Железен пирон с маса 10 g е потопен в разтвор на CuSO₄. След известно време го изваждат, изсушават и претеглят: масата му е 10,75 g. Колко грама мед са се отложили върху него?',
    solution: ['$\\mathrm{Fe + CuSO_4 \\to FeSO_4 + Cu}$: на всеки мол разтворено желязо (56 g) се отлага мол мед (63,5 g).', 'Масата расте с $63{,}5 - 56 = 7{,}5\\ \\mathrm{g}$ на мол; $n = \\frac{0{,}75}{7{,}5} = 0{,}1\\ \\mathrm{mol}$', '$m(\\mathrm{Cu}) = 0{,}1 \\cdot 63{,}5 = 6{,}35\\ \\mathrm{g}$ (разтворили са се 5,6 g желязо).'],
    answer: '$6{,}35\\ \\mathrm{g}$',
    check: [6.35],
    ask: ['мед, g'],
  },
  {
    title: '💍 Злато проба 585',
    problem: 'Пръстен от злато проба 585 тежи 4 g. Колко грама чисто злато има в него и колко грама са другите метали (сребро и мед)?',
    solution: ['Пробата показва колко грама злато има в 1000 g сплав.', '$m(\\mathrm{Au}) = 4 \\cdot 0{,}585 = 2{,}34\\ \\mathrm{g}$', 'Другите метали: $4 - 2{,}34 = 1{,}66\\ \\mathrm{g}$. Те правят сплавта по-твърда – чистото злато е толкова меко, че се драска с нокът.'],
    answer: '$2{,}34\\ \\mathrm{g}$ и $1{,}66\\ \\mathrm{g}$',
    check: [2.34, 1.66],
    ask: ['злато, g', 'други метали, g'],
  },
  {
    title: '🏭 Доменна пещ',
    problem: 'В доменна пещ се зарежда 1 t руда, която съдържа 80% Fe₂O₃. Колко килограма желязо може да се получи най-много? Колко килограма чугун с 4% въглерод е това?',
    solution: ['$m(\\mathrm{Fe_2O_3}) = 0{,}8 \\cdot 1000 = 800\\ \\mathrm{kg}$; $w(\\mathrm{Fe}) = \\frac{112}{160} = 0{,}7$', '$m(\\mathrm{Fe}) = 800 \\cdot 0{,}7 = 560\\ \\mathrm{kg}$', 'Желязото е 96% от чугуна: $m = \\frac{560}{0{,}96} \\approx 583{,}3\\ \\mathrm{kg}$'],
    answer: '$560\\ \\mathrm{kg}$; $\\approx 583\\ \\mathrm{kg}$ чугун',
    check: [560, 583.3],
    ask: ['желязо, kg', 'чугун, kg'],
  },
  {
    title: '🛤️ Заваряване на релси с термит',
    problem: 'Релсите се заваряват с термитна смес: Fe₂O₃ + 2Al → Al₂O₃ + 2Fe. Реакцията отделя толкова топлина, че желязото излиза разтопено. Колко килограма алуминий и колко Fe₂O₃ са нужни, за да се получат 10 kg желязо?',
    solution: ['$n(\\mathrm{Fe}) = \\frac{10\\,000}{56} \\approx 178{,}6\\ \\mathrm{mol}$', '$n(\\mathrm{Al}) = n(\\mathrm{Fe})$: $m(\\mathrm{Al}) = 178{,}6 \\cdot 27 \\approx 4{,}82\\ \\mathrm{kg}$', '$n(\\mathrm{Fe_2O_3}) = \\frac{178{,}6}{2} \\approx 89{,}3\\ \\mathrm{mol}$: $m \\approx 89{,}3 \\cdot 160 \\approx 14{,}3\\ \\mathrm{kg}$'],
    answer: '$\\approx 4{,}82\\ \\mathrm{kg}$ Al и $\\approx 14{,}3\\ \\mathrm{kg}$ $\\mathrm{Fe_2O_3}$',
    check: [4.82, 14.3],
    ask: ['алуминий, kg', 'Fe₂O₃, kg'],
  },
  {
    title: '🎺 Колко цинк има в месинга',
    problem: 'Парче месинг (сплав на мед и цинк) с маса 10 g се обработва с излишък солна киселина. Отделят се 1,12 L водород (н.у.). Каква е масовата част на цинка в месинга?',
    solution: ['Медта не реагира със солна киселина: $\\mathrm{Zn + 2HCl \\to ZnCl_2 + H_2}$', '$n(\\mathrm{Zn}) = n(\\mathrm{H_2}) = \\frac{1{,}12}{22{,}4} = 0{,}05\\ \\mathrm{mol}$, $m = 0{,}05 \\cdot 65 = 3{,}25\\ \\mathrm{g}$', '$w(\\mathrm{Zn}) = \\frac{3{,}25}{10} = 32{,}5\\%$ – типичен месинг за тръби и музикални инструменти.'],
    answer: '$32{,}5\\%$',
    check: [32.5],
    ask: ['цинк, %'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кой метал е течен при стайна температура?',
    answers: ['живак', 'олово', 'натрий', 'волфрам'],
    correctAnswer: 'живак',
  },
  {
    question: 'Кой метал провежда електрическия ток най-добре?',
    answers: ['среброто', 'медта', 'алуминият', 'желязото'],
    correctAnswer: 'среброто',
  },
  {
    question: 'Кой от тези метали реагира бурно със студена вода?',
    answers: ['натрий', 'мед', 'желязо', 'алуминий'],
    correctAnswer: 'натрий',
  },
  {
    question: 'Защо алуминиевата тенджера не реагира с водата, въпреки че алуминият е активен метал?',
    answers: ['покрита е с плътен слой от алуминиев оксид', 'алуминият е благороден метал', 'водата е твърде студена', 'алуминият е след водорода в реда на активност'],
    correctAnswer: 'покрита е с плътен слой от алуминиев оксид',
  },
  {
    question: 'Какво се получава при реакцията на желязо с разредена солна киселина?',
    answers: ['$\\mathrm{FeCl_2 + H_2}$', '$\\mathrm{FeCl_3 + H_2}$', '$\\mathrm{Fe_2O_3 + H_2}$', '$\\mathrm{FeCl_2 + Cl_2}$'],
    correctAnswer: '$\\mathrm{FeCl_2 + H_2}$',
  },
  {
    question: 'Кой метал НЕ може да измести медта от разтвор на $\\mathrm{CuSO_4}$?',
    answers: ['сребро', 'цинк', 'желязо', 'магнезий'],
    correctAnswer: 'сребро',
  },
  {
    question: 'Как се добива алуминият в промишлеността?',
    answers: ['с електролиза на стопилка от $\\mathrm{Al_2O_3}$ в криолит', 'с редукция на $\\mathrm{Al_2O_3}$ с кокс', 'с пържене на боксита', 'с изместване от разтвор на $\\mathrm{AlCl_3}$ с желязо'],
    correctAnswer: 'с електролиза на стопилка от $\\mathrm{Al_2O_3}$ в криолит',
  },
  {
    question: 'Каква е разликата между чугун и стомана?',
    answers: ['чугунът съдържа повече въглерод', 'стоманата съдържа повече въглерод', 'чугунът няма желязо', 'стоманата е чисто желязо'],
    correctAnswer: 'чугунът съдържа повече въглерод',
  },
  {
    question: 'От кои метали е сплавта бронз?',
    answers: ['мед и калай', 'мед и цинк', 'желязо и въглерод', 'алуминий и мед'],
    correctAnswer: 'мед и калай',
  },
];

// ---------- Страница ----------

const RECORDS: [string, string, string][] = [
  ['най-ниска температура на топене', 'живак Hg', '−38,8 °C'],
  ['топи се в ръката', 'галий Ga', '29,8 °C'],
  ['най-висока температура на топене', 'волфрам W', '3422 °C'],
  ['най-лек', 'литий Li', '0,53 g/cm³'],
  ['най-плътен', 'осмий Os', '22,6 g/cm³'],
  ['най-добър проводник', 'сребро Ag', 'следват Cu, Au, Al'],
];

const ALLOYS: [string, string, string][] = [
  ['стомана', 'Fe + до 2% C', 'конструкции, инструменти, коли'],
  ['чугун', 'Fe + 2–4% C', 'отливки, тенджери, радиатори'],
  ['неръждаема стомана', 'Fe + около 18% Cr + 8% Ni', 'прибори, кухненски мивки, медицина'],
  ['месинг', 'Cu + 20–40% Zn', 'кранове, ключалки, духови инструменти'],
  ['бронз', 'Cu + около 10% Sn', 'камбани, статуи, медали'],
  ['дуралуминий', 'Al + около 4% Cu, малко Mg и Mn', 'самолети, велосипеди'],
  ['злато проба 585', '58,5% Au + Ag и Cu', 'бижута'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Metals() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Метали</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🍴 Разказват, че на пиршествата на Наполеон III най-почетните гости са яли с алуминиеви прибори, а останалите – само със златни.
            В средата на XIX век алуминият се е получавал с натрий, на малки порции, и е струвал колкото среброто, а понякога и повече. През
            1884 г. връхчето на паметника на Вашингтон е излято от алуминий – като скъпоценност. Само две години по-късно американецът Чарлз
            Хол и французинът Пол Еру, независимо един от друг, измислят как да получават алуминий с <strong>електролиза</strong>. Цената
            рухва и днес от алуминий правим кутийки за еднократна употреба. Как се добиват металите и защо някои са толкова трудни за
            „освобождаване“ – това е темата на урока.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Метална връзка и физични свойства</h2>
          <p className={text}>
            В металния кристал атомите са отдали външните си електрони на общ „електронен газ“, който свързва положителните <Term id="ion">йони</Term> (виж{' '}
            <Link to="/chemistry/structure/bonding" className={link}>
              Химична връзка
            </Link>
            ). Тази <Term id="metallic-bond">метална връзка</Term> обяснява общите свойства на металите.
          </p>
          <Theorem
            type="definition"
            title="Общи физични свойства на металите"
            description="Металите имат метален блясък, провеждат добре електричния ток и топлината (подвижните електрони пренасят заряд и енергия), ковки и пластични са (слоевете йони се плъзгат, без връзката да се къса). Освен живака всички са твърди при стайна температура."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Рекорд</th>
                  <th className={th}>Метал</th>
                  <th className={th}>Стойност</th>
                </tr>
              </thead>
              <tbody>
                {RECORDS.map(([what, metal, value]) => (
                  <tr key={what}>
                    <td className={td}>{what}</td>
                    <td className={td}>{metal}</td>
                    <td className={td}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Затова жиците са от мед и алуминий (среброто е твърде скъпо), нишките на старите крушки – от волфрам, а термометрите от
            миналото – с живак. Свойствата зависят и от чистотата: съвсем малко примеси правят метала по-твърд, но по-лош <Term id="conductor">проводник</Term>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Металите в периодичната система</h2>
          <p className={text}>
            От 118-те известни елемента над 90 са метали. Те заемат лявата и долната част на <Term id="periodic-table">периодичната система</Term>, а границата с{' '}
            <Term id="nonmetals">неметалите</Term> минава по диагонала от бор към астат, където са <Term id="metalloids">полуметалите</Term>.
          </p>
          <Theorem
            title="Металите са редуктори"
            description="Атомите на металите имат малко валентни електрони (обикновено 1–3) и ниска йонизационна енергия. В реакциите те отдават електрони и се окисляват до положителни йони: $\mathrm{M - ne^- \to M^{n+}}$. Затова металите са редуктори. В периода металните свойства отслабват отляво надясно, а в групата се засилват отгоре надолу."
          />
          <p className={text}>
            Най-активните метали – цезий и франций – са долу вляво. Затова калият реагира с вода по-бурно от натрия, а натрият – по-бурно
            от лития.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Химични свойства на металите</h2>
          <p className={text}>
            Колко лесно металът отдава електрони, показва <Term id="activity-series">редът на активност</Term> (подробно – в урока{' '}
            <Link to="/chemistry/reactions/redox" className={link}>
              Окисление-редукция и електрохимия
            </Link>
            ). От него следват четири правила:
          </p>
          <ul className={`${text} list-disc pl-6 space-y-1`}>
            <li>
              <strong>С кислород</strong> реагират почти всички метали, при нагряване по-бързо: <Tex>{'\\mathrm{2Mg + O_2 \\to 2MgO}'}</Tex>.
              Златото и платината не се окисляват.
            </li>
            <li>
              <strong>С вода</strong> при стайна температура реагират само най-активните – алкалните метали и Ca, Sr, Ba: получават се основа
              и водород, <Tex>{'\\mathrm{2Na + 2H_2O \\to 2NaOH + H_2\\uparrow}'}</Tex>.
            </li>
            <li>
              <strong>С разредени киселини</strong> (HCl, разредена <Tex>{'\\mathrm{H_2SO_4}'}</Tex>) водород отделят металите преди водорода
              в реда на активност: <Tex>{'\\mathrm{Zn + 2HCl \\to ZnCl_2 + H_2\\uparrow}'}</Tex>. Азотната <Term id="acid">киселина</Term> и концентрираната сярна
              киселина действат иначе – вместо водород отделят NO, NO₂ или SO₂ и разтварят дори медта.
            </li>
            <li>
              <strong>С разтвори на соли:</strong> по-активният метал измества по-малко активния от солта му:{' '}
              <Tex>{'\\mathrm{Fe + CuSO_4 \\to FeSO_4 + Cu}'}</Tex>.
            </li>
          </ul>
          <Example
            description="Какво ще се случи, ако в разтвор на CuSO₄ пуснем парченце натрий? Ще се отложи ли мед?"
            steps={[
              'Натрият е много по-активен от медта, но първо реагира с водата: $\\mathrm{2Na + 2H_2O \\to 2NaOH + H_2\\uparrow}$',
              'Получената основа дава с медната сол синя утайка: $\\mathrm{2NaOH + CuSO_4 \\to Cu(OH)_2\\downarrow + Na_2SO_4}$',
              'Мед не се отлага. Правилото за изместване важи за метали, които не реагират с водата.',
            ]}
          />
          <MetalReactionLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Алкални и алкалоземни метали</h2>
          <p className={text}>
            <Term id="alkali-metals">Алкалните метали</Term> (група 1: Li, Na, K, Rb, Cs) имат по един валентен електрон и са най-активните
            метали. Те са меки (натрият се реже с нож), леки и се пазят под керосин или парафиново масло, за да не реагират с въздуха и
            влагата. С вода дават силни основи – основи, разтворими във вода, се наричат <strong>алкални основи</strong> (оттам и името на
            групата).
          </p>
          <p className={text}>
            Алкалоземните метали (група 2: Be, Mg, Ca, Sr, Ba) имат по два валентни електрона и в съединенията си са със <Term id="oxidation-state">степен на
            окисление</Term> +2. Те са по-твърди и по-малко активни: калцият реагира с вода спокойно, а магнезият – едва при нагряване. Магнезият
            гори с ослепително бяла светлина (използвал се е в светкавиците на старите фотоапарати), а калциевите съединения са навсякъде
            около нас – варовик <Tex>{'\\mathrm{CaCO_3}'}</Tex>, негасена вар <Tex>{'\\mathrm{CaO}'}</Tex>, гасена вар{' '}
            <Tex>{'\\mathrm{Ca(OH)_2}'}</Tex>, гипс. Йоните <Tex>{'\\mathrm{Ca^{2+}}'}</Tex> и <Tex>{'\\mathrm{Mg^{2+}}'}</Tex> правят водата
            твърда – от тях е котленият камък в чайника.
          </p>
          <Theorem
            title="Активните метали с вода"
            description="$\mathrm{2M + 2H_2O \to 2MOH + H_2\uparrow}$ за алкалните метали и $\mathrm{M + 2H_2O \to M(OH)_2 + H_2\uparrow}$ за Ca, Sr, Ba. Активността расте надолу в групата: литият реагира спокойно, а цезият – с експлозия."
          />
          <p className={text}>
            Йоните на тези метали оцветяват пламъка в характерни цветове – Na в жълто, K във виолетово, Ca в оранжево-червено. Как с това
            се откриват веществата, ще видим в урока{' '}
            <Link to="/chemistry/inorganic/qualitative-analysis" className={link}>
              Йонни реакции и качествен анализ
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Алуминий</h2>
          <p className={text}>
            Алуминият е най-разпространеният метал в земната кора (около 8% по маса), лек е (2,7 g/cm³) и добър проводник. Въпреки че е
            активен, във въздуха се покрива с плътен слой <Tex>{'\\mathrm{Al_2O_3}'}</Tex>, дебел само няколко нанометра, който го пази от
            по-нататъшно <Term id="oxidation">окисление</Term>. С разредени киселини реагира, след като слоят се разтвори:{' '}
            <Tex>{'\\mathrm{2Al + 6HCl \\to 2AlCl_3 + 3H_2\\uparrow}'}</Tex>.
          </p>
          <Theorem
            title="Амфотерност на алуминия"
            description="Алуминият, оксидът и хидроксидът му реагират и с киселини, и с основи – те са амфотерни. С разтвор на основа: $\mathrm{2Al + 2NaOH + 6H_2O}$ $\mathrm{{} \to 2Na[Al(OH)_4] + 3H_2\uparrow}$. Затова в алуминиеви съдове не се държат силно основни разтвори."
          />
          <p className={text}>
            Повече за <Term id="amphoterism">амфотерните</Term> <Term id="oxide">оксиди</Term> и <Term id="hydroxide">хидроксиди</Term> – в урока{' '}
            <Link to="/chemistry/inorganic/compound-classes" className={link}>
              Класове неорганични съединения
            </Link>
            . Алуминият е и силен <Term id="reducing-agent">редуктор</Term> при висока температура: в <strong>алуминотермията</strong> той отнема кислорода от оксидите на
            по-малко активните метали, например <Tex>{'\\mathrm{Fe_2O_3 + 2Al \\to Al_2O_3 + 2Fe}'}</Tex>. Реакцията отделя толкова топлина,
            че желязото се получава разтопено – така се заваряват релси.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Желязо и мед</h2>
          <p className={text}>
            <strong>Желязото</strong> е вторият по разпространение метал в земната кора и най-използваният метал изобщо – около 90% от
            металите, които човечеството произвежда (по маса), са желязо и стомана. В съединенията си е със степен на окисление +2 или +3. С разредени киселини и със
            сяра дава съединения на Fe(II): <Tex>{'\\mathrm{Fe + 2HCl \\to FeCl_2 + H_2\\uparrow}'}</Tex>,{' '}
            <Tex>{'\\mathrm{Fe + S \\to FeS}'}</Tex>, а със силния <Term id="oxidizing-agent">окислител</Term> хлор – на Fe(III):{' '}
            <Tex>{'\\mathrm{2Fe + 3Cl_2 \\to 2FeCl_3}'}</Tex>. Студените концентрирани <Tex>{'\\mathrm{H_2SO_4}'}</Tex> и{' '}
            <Tex>{'\\mathrm{HNO_3}'}</Tex> пасивират желязото – покриват го със защитен оксиден слой, – затова се превозват в стоманени
            цистерни.
          </p>
          <p className={text}>
            <strong>Медта</strong> е червеникав, много добър проводник. Тя е след водорода в реда на активност и не реагира с разредена солна
            киселина. При нагряване на въздух почернява от <Tex>{'\\mathrm{CuO}'}</Tex>, а с годините покривите и статуите от мед се
            покриват със зелена патина – основен меден карбонат <Tex>{'\\mathrm{Cu_2(OH)_2CO_3}'}</Tex>. Медта се разтваря в азотна
            киселина: <Tex>{'\\mathrm{3Cu + 8HNO_3 \\to 3Cu(NO_3)_2 + 2NO\\uparrow + 4H_2O}'}</Tex>.
          </p>
          <Example
            description="Метал с маса 2,8 g отделя с излишък солна киселина 1,12 L водород (н.у.), а при горене в хлор дава 8,125 g хлорид. Кой е металът?"
            steps={[
              '$n(\\mathrm{H_2}) = \\frac{1{,}12}{22{,}4} = 0{,}05\\ \\mathrm{mol}$. Ако металът е двувалентен в хлорида с HCl, $n(\\mathrm{M}) = 0{,}05\\ \\mathrm{mol}$.',
              '$M = \\frac{2{,}8}{0{,}05} = 56\\ \\mathrm{g/mol}$ – желязо.',
              'Проверка с хлора: $\\mathrm{FeCl_3}$, $0{,}05 \\cdot 162{,}5 = 8{,}125\\ \\mathrm{g}$ ✓. С HCl желязото е +2, с хлор – +3.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Добиване на металите</h2>
          <p className={text}>
            Само най-малко активните метали – злато, платина, понякога сребро и мед – се срещат <strong>самородни</strong>, като чист метал.
            Другите са в <strong>руди</strong>: минерали (оксиди, сулфиди, карбонати, хлориди) с примеси от скали. Добиването на метала е{' '}
            <Term id="reduction">редукция</Term>: <Tex>{'\\mathrm{M^{n+} + ne^- \\to M}'}</Tex>.
          </p>
          <Theorem
            title="Методът зависи от активността"
            description="Най-активните метали (K – Al) се получават с електролиза на стопилки: никой евтин химичен редуктор не е достатъчно силен. Металите със средна активност (Zn – Pb) се редуцират от оксидите си с въглерод, въглероден оксид, водород или алуминий. Най-малко активните (Cu, Hg, Ag, Au) се получават с пържене на сулфидите им или се срещат самородни."
          />
          <p className={text}>
            В <strong>доменната пещ</strong> желязната руда, коксът и варовикът се зареждат отгоре, а отдолу се вдухва горещ въздух. Коксът
            изгаря до въглероден оксид, който редуцира рудата: <Tex>{'\\mathrm{Fe_2O_3 + 3CO \\to 2Fe + 3CO_2}'}</Tex>. Варовикът свързва
            пясъка и глината в шлака, която плава над разтопения чугун.
          </p>
          <ExtractionLab />
          <Example
            description="Колко тона алуминий се получават от 10 t боксит, който съдържа 51% Al₂O₃, ако добивът е 90%?"
            steps={[
              '$m(\\mathrm{Al_2O_3}) = 10 \\cdot 0{,}51 = 5{,}1\\ \\mathrm{t}$',
              '$w(\\mathrm{Al}) = \\frac{54}{102}$, значи теоретично: $5{,}1 \\cdot \\frac{54}{102} = 2{,}7\\ \\mathrm{t}$',
              'При добив 90%: $2{,}7 \\cdot 0{,}9 = 2{,}43\\ \\mathrm{t}$ алуминий.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Сплави и смеси от метали</h2>
          <p className={text}>
            Чистите метали рядко имат точно нужните свойства. <strong>Сплавите</strong> – твърди разтвори и смеси на метал с други метали
            или с въглерод – често са по-твърди, по-здрави или по-устойчиви на корозия от съставките си. Чужди атоми в кристала пречат на
            слоевете да се плъзгат.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Сплав</th>
                  <th className={th}>Състав (приблизително)</th>
                  <th className={th}>Употреба</th>
                </tr>
              </thead>
              <tbody>
                {ALLOYS.map(([name, comp, use]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{comp}</td>
                    <td className={td}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Съставът на сплав или смес от метали често се намира, като проба се разтвори в киселина и се измери отделеният водород.
          </p>
          <Example
            description="7,8 g смес от магнезий и алуминий отделят с излишък солна киселина 8,96 L водород (н.у.). Колко грама от всеки метал има в сместа?"
            steps={[
              'Нека $n(\\mathrm{Mg}) = x$, $n(\\mathrm{Al}) = y$. От Mg се отделят $x$ mol $\\mathrm{H_2}$, от Al – $1{,}5y$ mol.',
              '$24x + 27y = 7{,}8$ и $x + 1{,}5y = \\frac{8{,}96}{22{,}4} = 0{,}4$',
              'От второто $x = 0{,}4 - 1{,}5y$; заместваме: $9{,}6 - 36y + 27y = 7{,}8 \\Rightarrow y = 0{,}2$, $x = 0{,}1$',
              '$m(\\mathrm{Mg}) = 2{,}4\\ \\mathrm{g}$, $m(\\mathrm{Al}) = 5{,}4\\ \\mathrm{g}$',
            ]}
          />
          <MixtureLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. Корозия – накратко</h2>
          <p className={text}>
            Добиването на метала изразходва енергия, а <Term id="corrosion">корозията</Term> е обратният, самопроизволен процес: металът
            отново се окислява до съединения, подобни на рудата. Желязото ръждясва, когато има едновременно вода и кислород. Металите се
            пазят с боя, с покритие от по-активен метал (поцинковане), с протектори от магнезий или цинк и с неръждаеми сплави. Как
            действат тези методи от гледна точка на електрохимията, е обяснено в урока{' '}
            <Link to="/chemistry/reactions/redox" className={link}>
              Окисление-редукция и електрохимия
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 10. Тренажор
          </h2>
          <p className={text}>Водород от метал и киселина, изместване на медта, желязо от руда, състав на смес и проба на златото. Десетичните отговори въвеждай като 2,24.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Металите около нас</h2>
          <p className={text}>От кутийката за напитки до златния пръстен – изчисленията с метали са навсякъде.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Желязо и солна киселина', '$\\mathrm{2Fe + 6HCl \\to 2FeCl_3 + 3H_2}$', 'С разредени киселини се получава $\\mathrm{FeCl_2}$; $\\mathrm{Fe^{3+}}$ дават силни окислители като $\\mathrm{Cl_2}$.'],
              ['Натрий в разтвор на сол', 'Натрият измества медта от $\\mathrm{CuSO_4}$.', 'Натрият реагира първо с водата; получава се утайка $\\mathrm{Cu(OH)_2}$.'],
              ['Мед и киселини', 'Медта не реагира с никоя киселина.', 'Не реагира с разредени HCl и $\\mathrm{H_2SO_4}$, но се разтваря в $\\mathrm{HNO_3}$ и в концентрирана $\\mathrm{H_2SO_4}$.'],
              ['Алуминият е пасивен', 'Алуминият е неактивен метал, щом не ръждясва.', 'Активен е, но го пази тънък плътен слой $\\mathrm{Al_2O_3}$.'],
              ['Смес с мед', 'Целият водород е от двата метала.', 'Медта не отделя водород със солна киселина – той е само от другия метал.'],
              ['Добив и чистота', '$m(\\mathrm{Fe}) = m(\\text{руда}) \\cdot 0{,}7$', 'Умножи още по частта на минерала в рудата и по добива.'],
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
          <h2 className={h2}>13. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко литра водород (н.у.) се отделят при действието на излишък солна киселина на 4,8 g магнезий?" check={[4.48]} ask={['$V(\\mathrm{H_2})$, L']}>
                <p><Tex>{'\\mathrm{Mg + 2HCl \\to MgCl_2 + H_2\\uparrow}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{Mg}) = \\frac{4{,}8}{24} = 0{,}2\\ \\mathrm{mol} = n(\\mathrm{H_2})'}</Tex></p>
                <p><Tex>{'V = 0{,}2 \\cdot 22{,}4 = 4{,}48\\ \\mathrm{L}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Коя желязна руда е по-богата на желязо – хематит $\mathrm{Fe_2O_3}$ или магнетит $\mathrm{Fe_3O_4}$? Пресметнете масовата част на желязото във всеки минерал." check={[70, 72.4]} ask={['$\\mathrm{Fe_2O_3}$, %', '$\\mathrm{Fe_3O_4}$, %']}>
                <p><Tex>{'w = \\frac{2 \\cdot 56}{160} = 70\\%'}</Tex> в хематита.</p>
                <p><Tex>{'w = \\frac{3 \\cdot 56}{232} \\approx 72{,}4\\%'}</Tex> в магнетита.</p>
                <p>Магнетитът е малко по-богат, но в практиката значение има и колко минерал съдържа рудата.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Напишете уравнението на реакцията на калций с вода. Колко грама $\mathrm{Ca(OH)_2}$ и колко литра водород (н.у.) се получават от 2 g калций?" check={[3.7, 1.12]} ask={['$\\mathrm{Ca(OH)_2}$, g', '$\\mathrm{H_2}$, L']}>
                <p><Tex>{'\\mathrm{Ca + 2H_2O \\to Ca(OH)_2 + H_2\\uparrow}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{Ca}) = \\frac{2}{40} = 0{,}05\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Ca(OH)_2}) = 0{,}05 \\cdot 74 = 3{,}7\\ \\mathrm{g}'}</Tex>, <Tex>{'V(\\mathrm{H_2}) = 0{,}05 \\cdot 22{,}4 = 1{,}12\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Колко литра водород (н.у.) се отделят, когато 5,4 g алуминий се разтворят в разтвор на натриева основа?" check={[6.72]} ask={['$V(\\mathrm{H_2})$, L']}>
                <p><Tex>{'\\mathrm{2Al + 2NaOH + 6H_2O}'}</Tex> <Tex>{'\\mathrm{{} \\to 2Na[Al(OH)_4] + 3H_2\\uparrow}'}</Tex></p>
                <p><Tex>{'n(\\mathrm{Al}) = \\frac{5{,}4}{27} = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{H_2}) = 1{,}5 \\cdot 0{,}2 = 0{,}3\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'V = 0{,}3 \\cdot 22{,}4 = 6{,}72\\ \\mathrm{L}'}</Tex> – толкова, колкото и със солна киселина.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="10 g смес от магнезий и мед се обработват с излишък солна киселина. Отделят се 4,48 L водород (н.у.). Каква е масовата част на медта в сместа?" check={[52]} ask={['$w(\\mathrm{Cu})$, %']}>
                <p>Медта не реагира. <Tex>{'n(\\mathrm{Mg}) = n(\\mathrm{H_2}) = \\frac{4{,}48}{22{,}4} = 0{,}2\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Mg}) = 0{,}2 \\cdot 24 = 4{,}8\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\mathrm{Cu}) = 10 - 4{,}8 = 5{,}2\\ \\mathrm{g}'}</Tex></p>
                <p><Tex>{'w(\\mathrm{Cu}) = 52\\%'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Колко тона чугун с 95% желязо се получават от 1 t магнетитова руда, която съдържа 10% примеси, ако добивът е 90%?" check={[0.617]} ask={['чугун, t']}>
                <p><Tex>{'m(\\mathrm{Fe_3O_4}) = 0{,}9\\ \\mathrm{t}'}</Tex>; <Tex>{'w(\\mathrm{Fe}) = \\frac{168}{232}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Fe}) = 0{,}9 \\cdot \\frac{168}{232} \\cdot 0{,}9 \\approx 0{,}587\\ \\mathrm{t}'}</Tex></p>
                <p><Tex>{'m(\\text{чугун}) = \\frac{0{,}587}{0{,}95} \\approx 0{,}617\\ \\mathrm{t}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Цинкова пластинка с маса 20 g е потопена в разтвор на $\mathrm{CuSO_4}$. След реакцията масата ѝ е 19,85 g. Колко грама мед са се отложили и колко грама $\mathrm{ZnSO_4}$ има в разтвора?" check={[6.35, 16.1]} ask={['мед, g', '$\\mathrm{ZnSO_4}$, g']}>
                <p><Tex>{'\\mathrm{Zn + CuSO_4 \\to ZnSO_4 + Cu}'}</Tex>: на мол разтваря се 65 g цинк и се отлага 63,5 g мед.</p>
                <p>Масата намалява с 1,5 g на мол: <Tex>{'n = \\frac{20 - 19{,}85}{1{,}5} = 0{,}1\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Cu}) = 6{,}35\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\mathrm{ZnSO_4}) = 0{,}1 \\cdot 161 = 16{,}1\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="10 g смес от желязо, алуминий и мед се обработват с излишък солна киселина и се отделят 5,6 L водород (н.у.); остават 1,7 g неразтворим остатък. Колко грама алуминий има в сместа?" check={[2.7]} ask={['$m(\\mathrm{Al})$, g']}>
                <p>Остатъкът е медта: желязото и алуминият заедно са <Tex>{'10 - 1{,}7 = 8{,}3\\ \\mathrm{g}'}</Tex>.</p>
                <p>Нека <Tex>{'n(\\mathrm{Fe}) = x'}</Tex>, <Tex>{'n(\\mathrm{Al}) = y'}</Tex>: <Tex>{'56x + 27y = 8{,}3'}</Tex> и <Tex>{'x + 1{,}5y = \\frac{5{,}6}{22{,}4} = 0{,}25'}</Tex>.</p>
                <p><Tex>{'x = 0{,}25 - 1{,}5y \\Rightarrow 14 - 84y + 27y = 8{,}3 \\Rightarrow 57y = 5{,}7,\\ y = 0{,}1'}</Tex>, <Tex>{'x = 0{,}1'}</Tex></p>
                <p><Tex>{'m(\\mathrm{Al}) = 0{,}1 \\cdot 27 = 2{,}7\\ \\mathrm{g}'}</Tex>, <Tex>{'m(\\mathrm{Fe}) = 5{,}6\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="При пълното изгаряне на 5,4 g метал в кислород се получават 10,2 g оксид. Кой е металът, ако степента му на окисление в оксида е +3? Колко литра кислород (н.у.) са изразходвани?" check={[27, 3.36]} ask={['$M$, g/mol', '$V(\\mathrm{O_2})$, L']}>
                <p>Кислородът в оксида е <Tex>{'10{,}2 - 5{,}4 = 4{,}8\\ \\mathrm{g}'}</Tex>, т.е. <Tex>{'\\frac{4{,}8}{16} = 0{,}3\\ \\mathrm{mol}'}</Tex> атоми O.</p>
                <p>Оксидът е <Tex>{'\\mathrm{M_2O_3}'}</Tex>: <Tex>{'n(\\mathrm{M}) = \\frac{2}{3} \\cdot 0{,}3 = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'M = \\frac{5{,}4}{0{,}2} = 27\\ \\mathrm{g/mol}'}</Tex> – алуминий.</p>
                <p><Tex>{'n(\\mathrm{O_2}) = \\frac{0{,}3}{2} = 0{,}15\\ \\mathrm{mol}'}</Tex>, <Tex>{'V = 0{,}15 \\cdot 22{,}4 = 3{,}36\\ \\mathrm{L}'}</Tex></p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>15. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Металите имат метална връзка: блясък, проводимост, ковкост; над 90 от 118-те елемента са метали</li>
              <li>✓ Металите са редуктори: <Tex>{'\\mathrm{M - ne^- \\to M^{n+}}'}</Tex>; активността расте надолу в групата и наляво в периода</li>
              <li>✓ С вода реагират най-активните метали; с разредени киселини – металите преди водорода; по-активният метал измества по-малко активния от солта му</li>
              <li>✓ Алуминият е пазен от оксиден слой и е амфотерен; желязото дава Fe(II) с киселини и Fe(III) с хлор; медта не реагира с разредена HCl</li>
              <li>✓ Добиване: K–Al с <Term id="electrolysis">електролиза</Term> на стопилки, Zn–Pb с редукция (C, CO, Al), Cu–Au с пържене или самородни</li>
              <li>✓ <Tex>{'m(\\text{метал}) = m(\\text{руда}) \\cdot w(\\text{минерал}) \\cdot w(\\text{метал}) \\cdot \\eta'}</Tex></li>
              <li>✓ Сплавите (стомана, месинг, бронз, дуралуминий) имат по-добри свойства от чистите метали</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Галият се топи при 29,8 °C – по-ниско от температурата на тялото. Лъжичка от галий се разтапя в чаша горещ чай, а в ръката се
              превръща в сребриста течност. Нещо повече: течният галий остава течен до над 2000 °C, а при замръзване се разширява като
              водата. Днес почти целият галий отива за полупроводници – галиев нитрид и галиев арсенид в светодиодите и бързите зарядни
              устройства.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
