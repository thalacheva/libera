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
import type { FormulaMode } from '../smiles';
import HomologLab from './HomologLab';
import IsomerLab from './IsomerLab';
import NameBuilderLab from './NameBuilderLab';
import { STEMS, iupacName } from './hydrocarbonNames';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

/** Няколко структурни формули един до друг, с надпис под всяка. */
function Gallery({ items, mode = 'skeletal' }: { items: { smiles: string; caption: string; mode?: FormulaMode; /** индекси на връзките за подчертаване */ highlight?: number[] }[]; mode?: FormulaMode }) {
  return (
    <div className="flex flex-wrap justify-center items-end gap-3 mb-4">
      {items.map(it => (
        <figure key={it.caption} className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
          <Molecule smiles={it.smiles} mode={it.mode ?? mode} title={it.caption} highlightBonds={it.highlight} />
          <figcaption className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{it.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 8, useGrouping: false }).replace('.', '{,}');
const KINDS = [
  { bond: 1, name: 'алкан', gen: '\\mathrm{C}_n\\mathrm{H}_{2n+2}', h: (n: number) => 2 * n + 2 },
  { bond: 2, name: 'алкен', gen: '\\mathrm{C}_n\\mathrm{H}_{2n}', h: (n: number) => 2 * n },
  { bond: 3, name: 'алкин', gen: '\\mathrm{C}_n\\mathrm{H}_{2n-2}', h: (n: number) => 2 * n - 2 },
] as const;
const ftex = (c: number, h: number) => `\\mathrm{C_{${c}}H_{${h}}}`;

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const k = pick([...KINDS]);
    const n = randInt(3, 10);
    const name = iupacName({ n, bond: k.bond, bondPos: k.bond === 1 ? 0 : 1, subs: [] });
    return {
      tex: `\\text{${name}}`,
      ask: `Колко водородни атома има в молекулата на този ${k.name}?`,
      num: k.h(n),
      den: 1,
      steps: [`${STEMS[n][0].toUpperCase() + STEMS[n].slice(1)}- означава ${n} въглеродни атома; общата формула е $${k.gen}$.`, `$2 \\cdot ${n}${k.bond === 1 ? ' + 2' : k.bond === 3 ? ' - 2' : ''} = ${k.h(n)}$, формулата е $${ftex(n, k.h(n))}$.`],
    };
  }
  if (kind === 1) {
    const k = pick([...KINDS]);
    const n = randInt(2, 10);
    const M = 12 * n + k.h(n);
    return {
      tex: `${ftex(n, k.h(n))}`,
      ask: 'Каква е моларната маса в g/mol?',
      num: M,
      den: 1,
      steps: [`$M = ${n} \\cdot 12 + ${k.h(n)} \\cdot 1 = ${M}\\ \\mathrm{g/mol}$`, `Проверка: за ${k.name}ите $M = 14n${k.bond === 1 ? ' + 2' : k.bond === 3 ? ' - 2' : ''}$.`],
    };
  }
  if (kind === 2) {
    const n = randInt(2, 10);
    const M = 14 * n + 2;
    return {
      tex: `M = ${M}\\ \\mathrm{g/mol}`,
      ask: 'Алкан има тази моларна маса. Колко въглеродни атома има в молекулата му?',
      num: n,
      den: 1,
      steps: [`За алканите $M = 14n + 2$.`, `$14n + 2 = ${M} \\Rightarrow n = \\frac{${M - 2}}{14} = ${n}$ – това е ${iupacName({ n, bond: 1, bondPos: 0, subs: [] })}.`],
    };
  }
  if (kind === 3) {
    const k = pick([...KINDS]);
    const n = randInt(1, 5) + (k.bond === 1 ? 0 : 1);
    const H = k.h(n);
    const V = pick([1, 2, 5, 10, 20]);
    const o2 = n + H / 4;
    return {
      tex: `${ftex(n, H)} + \\mathrm{O_2} \\to \\mathrm{CO_2} + \\mathrm{H_2O}`,
      ask: `Колко литра кислород са нужни за изгарянето на ${V} L от газа (при еднакви условия)?`,
      num: Math.round(V * o2 * 4),
      den: 4,
      steps: [`На 1 mol $${ftex(n, H)}$ се падат $${n} + \\frac{${H}}{4} = ${dec(o2)}\\ \\mathrm{mol\\ O_2}$ (всеки C иска 1 $\\mathrm{O_2}$, всеки 4 H – още 1).`, `$V(\\mathrm{O_2}) = ${V} \\cdot ${dec(o2)} = ${dec(V * o2)}\\ \\mathrm{L}$`],
    };
  }
  if (kind === 4) {
    const n = randInt(2, 6);
    const M = 14 * n;
    const k = randInt(1, 5);
    const m = (k * M) / 10;
    return {
      tex: `m(${ftex(n, 2 * n)}) = ${dec(m)}\\ \\mathrm{g}`,
      ask: 'Колко грама бром $\\mathrm{Br_2}$ присъединява този алкен?',
      num: 16 * k,
      den: 1,
      steps: [`$n = \\frac{${dec(m)}}{${M}} = ${dec(k / 10)}\\ \\mathrm{mol}$`, `Една двойна връзка присъединява 1 mol $\\mathrm{Br_2}$: $m = ${dec(k / 10)} \\cdot 160 = ${16 * k}\\ \\mathrm{g}$`],
    };
  }
  const [c, h] = pick([
    [6, 6],
    [6, 12],
    [6, 10],
    [4, 6],
    [8, 8],
    [10, 8],
    [7, 8],
    [5, 8],
    [3, 4],
  ]);
  const du = (2 * c + 2 - h) / 2;
  return {
    tex: ftex(c, h),
    ask: 'Каква е степента на ненаситеност (броят на пръстените и π-връзките)?',
    num: du,
    den: 1,
    steps: [`Наситеният алкан с ${c} атома C има $2 \\cdot ${c} + 2 = ${2 * c + 2}$ атома H.`, `Липсват $${2 * c + 2} - ${h} = ${2 * c + 2 - h}$ атома H – по 2 на пръстен или π-връзка: $\\frac{${2 * c + 2 - h}}{2} = ${du}$.`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🔥 Кубик природен газ',
    problem: 'Природният газ е почти само метан. Колко кубични метра кислород са нужни, за да изгори 1 m³ метан, и колко килограма въглероден диоксид се получават? (Обемите са при нормални условия.)',
    solution: ['$\\mathrm{CH_4 + 2O_2 \\to CO_2 + 2H_2O}$, затова $V(\\mathrm{O_2}) = 2\\ \\mathrm{m^3}$', '$n(\\mathrm{CH_4}) = \\frac{1000}{22{,}4} \\approx 44{,}6\\ \\mathrm{mol}$ – толкова мола и $\\mathrm{CO_2}$', '$m(\\mathrm{CO_2}) = 44{,}6 \\cdot 44 \\approx 1960\\ \\mathrm{g} \\approx 1{,}96\\ \\mathrm{kg}$'],
    answer: '$2\\ \\mathrm{m^3}$, $\\approx 1{,}96\\ \\mathrm{kg}$',
    check: [2, 1.96],
    ask: ['кислород, m³', 'CO₂, kg'],
  },
  {
    title: '🚗 Литър бензин',
    problem: 'Приемете, че бензинът е октан $\\mathrm{C_8H_{18}}$ с плътност 0,70 g/mL. Колко килограма $\\mathrm{CO_2}$ се отделят при изгарянето на 1 L бензин?',
    solution: ['$m = 1000 \\cdot 0{,}70 = 700\\ \\mathrm{g}$; $n = \\frac{700}{114} \\approx 6{,}14\\ \\mathrm{mol}$', '$\\mathrm{2C_8H_{18} + 25O_2 \\to 16CO_2 + 18H_2O}$ – от всеки мол октан 8 mol $\\mathrm{CO_2}$', '$m(\\mathrm{CO_2}) = 6{,}14 \\cdot 8 \\cdot 44 \\approx 2160\\ \\mathrm{g}$ – повече от три пъти масата на бензина, защото кислородът идва от въздуха.'],
    answer: '$\\approx 2{,}16\\ \\mathrm{kg}$',
    check: [2.16],
    ask: ['CO₂, kg'],
  },
  {
    title: '🧪 Проба с бромна вода',
    problem: 'Колко милилитра етен (при нормални условия) обезцветяват напълно 100 g бромна вода с масова част на брома 1,6%?',
    solution: ['$m(\\mathrm{Br_2}) = 100 \\cdot 0{,}016 = 1{,}6\\ \\mathrm{g}$; $n = \\frac{1{,}6}{160} = 0{,}01\\ \\mathrm{mol}$', '$\\mathrm{CH_2{=}CH_2 + Br_2 \\to CH_2Br{-}CH_2Br}$ – 1 : 1', '$V = 0{,}01 \\cdot 22{,}4 = 0{,}224\\ \\mathrm{L} = 224\\ \\mathrm{mL}$'],
    answer: '$224\\ \\mathrm{mL}$',
    check: [224],
    ask: ['етен, mL'],
  },
  {
    title: '⛽ Колко въздух иска котлонът',
    problem: 'Колко кубични метра въздух (21% кислород по обем, нормални условия) са нужни за изгарянето на 1 kg пропан $\\mathrm{C_3H_8}$?',
    solution: ['$n = \\frac{1000}{44} \\approx 22{,}7\\ \\mathrm{mol}$; $\\mathrm{C_3H_8 + 5O_2 \\to 3CO_2 + 4H_2O}$', '$V(\\mathrm{O_2}) = 5 \\cdot 22{,}7 \\cdot 22{,}4 \\approx 2545\\ \\mathrm{L}$', '$V_{\\text{въздух}} = \\frac{2545}{0{,}21} \\approx 12\\,100\\ \\mathrm{L} \\approx 12{,}1\\ \\mathrm{m^3}$'],
    answer: '$\\approx 12{,}1\\ \\mathrm{m^3}$',
    check: [12.1],
    ask: ['въздух, m³'],
  },
  {
    title: '🏭 Крекинг',
    problem: 'При крекинг молекулата на хексадекана се разкъсва на две: $\\mathrm{C_{16}H_{34} \\to C_8H_{18} + C_8H_{16}}$. Колко килограма октан могат да се получат най-много от 1 t хексадекан?',
    solution: ['$M(\\mathrm{C_{16}H_{34}}) = 16 \\cdot 12 + 34 = 226\\ \\mathrm{g/mol}$, $M(\\mathrm{C_8H_{18}}) = 114\\ \\mathrm{g/mol}$', 'От 1 mol хексадекан – 1 mol октан: $m = 1000 \\cdot \\frac{114}{226} \\approx 504\\ \\mathrm{kg}$', 'Останалото е октен – алкен, суровина за пластмаси.'],
    answer: '$\\approx 504\\ \\mathrm{kg}$',
    check: [504],
    ask: ['октан, kg'],
  },
  {
    title: '🕯️ Свещ',
    problem: 'Парафинът на свещите е смес от алкани; приемете, че е $\\mathrm{C_{25}H_{52}}$. Колко грама $\\mathrm{CO_2}$ се отделят при изгарянето на 10 g парафин?',
    solution: ['$M = 25 \\cdot 12 + 52 = 352\\ \\mathrm{g/mol}$; $n = \\frac{10}{352}\\ \\mathrm{mol}$', 'Всеки мол парафин дава 25 mol $\\mathrm{CO_2}$: $m = \\frac{10}{352} \\cdot 25 \\cdot 44 = 31{,}25\\ \\mathrm{g}$'],
    answer: '$31{,}25\\ \\mathrm{g}$',
    check: [31.25],
    ask: ['CO₂, g'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Каква е общата формула на алкените?',
    answers: ['$\\mathrm{C}_n\\mathrm{H}_{2n}$', '$\\mathrm{C}_n\\mathrm{H}_{2n+2}$', '$\\mathrm{C}_n\\mathrm{H}_{2n-2}$', '$\\mathrm{C}_n\\mathrm{H}_{2n-6}$'],
    correctAnswer: '$\\mathrm{C}_n\\mathrm{H}_{2n}$',
  },
  {
    question: 'Каква е хибридизацията на въглеродните атоми в етина $\\mathrm{HC{\\equiv}CH}$?',
    answers: ['$sp$', '$sp^2$', '$sp^3$', '$sp^3d$'],
    correctAnswer: '$sp$',
  },
  {
    question: 'Колко структурни изомера има $\\mathrm{C_5H_{12}}$?',
    answers: ['3', '2', '4', '5'],
    correctAnswer: '3',
  },
  {
    question: 'Кое вещество обезцветява бромната вода при стайна температура?',
    answers: ['етен', 'метан', 'бензен', 'циклохексан'],
    correctAnswer: 'етен',
  },
  {
    question: 'Как се казва по IUPAC веществото $\\mathrm{CH_3{-}CH(CH_3){-}CH_2{-}CH_3}$?',
    answers: ['2-метилбутан', '3-метилбутан', '2-етилпропан', '1,1-диметилпропан'],
    correctAnswer: '2-метилбутан',
  },
  {
    question: 'Какъв е ъгълът между връзките в молекулата на метана?',
    answers: ['$109{,}5^\\circ$', '$120^\\circ$', '$180^\\circ$', '$90^\\circ$'],
    correctAnswer: '$109{,}5^\\circ$',
  },
  {
    question: 'Какъв вид е реакцията на метан с хлор на светлина?',
    answers: ['заместване', 'присъединяване', 'полимеризация', 'хидрогениране'],
    correctAnswer: 'заместване',
  },
  {
    question: 'Кое от веществата има цис- и транс-изомер?',
    answers: ['бут-2-ен', 'бут-1-ен', 'пропен', '2-метилпропен'],
    correctAnswer: 'бут-2-ен',
  },
  {
    question: 'Какво е крекингът?',
    answers: ['разкъсване на дълги въглеводородни молекули на по-къси', 'разделяне на нефта на фракции по температурата на кипене', 'присъединяване на водород към двойна връзка', 'изгаряне на нефтени газове'],
    correctAnswer: 'разкъсване на дълги въглеводородни молекули на по-къси',
  },
];

// ---------- Страница ----------

const ALKANES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const HYBRID: [string, string, string, string, string][] = [
  ['sp^3', 'четири единични', '109{,}5^\\circ', 'тетраедър', '154'],
  ['sp^2', 'една двойна', '120^\\circ', 'плосък триъгълник', '134'],
  ['sp', 'една тройна', '180^\\circ', 'линия', '120'],
];

const FRACTIONS: [string, string, string, string][] = [
  ['газове', 'до около 40', 'C₁–C₄', 'гориво, суровина за химията'],
  ['бензин (нафта)', 'около 40–180', 'C₅–C₁₀', 'гориво за автомобили'],
  ['керосин', 'около 180–250', 'C₁₀–C₁₆', 'гориво за самолети'],
  ['дизел (газьол)', 'около 250–350', 'C₁₄–C₂₀', 'гориво за дизелови двигатели, отопление'],
  ['мазут', 'над 350', 'над C₂₀', 'смазочни масла, парафин, битум (асфалт)'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Hydrocarbons() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Въглеводороди</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🐍 През 1825 г. Майкъл Фарадей отделя от остатъците в бутилките с осветителен газ течност с формула, която по-късно се оказва{' '}
            <strong>C₆H₆</strong>. Шест въглеродни атома и само шест водородни – как изобщо се държи такава молекула? Четиридесет години
            по-късно Аугуст Кекуле предлага отговор: атомите са свързани в <strong>пръстен</strong>. През 1890 г. той разказва, че идеята му
            хрумнала в полусън, докато гледал как верига от атоми се извива като змия, захапала опашката си. Дали историята е вярна,
            историците спорят, но пръстенът на бензена е истински – и е само едно от безбройните неща, които въглеродът може да построи.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Защо въглеродът е особен</h2>
          <p className={text}>
            <strong>Въглеводородите</strong> са съединения само от въглерод и водород. Въглеродът е четиривалентен: образува четири{' '}
            <Term id="covalent-bond">ковалентни връзки</Term> и може да се свързва сам със себе си в дълги вериги, разклонения и пръстени,
            с единични, двойни и тройни връзки. Затова познатите органични съединения са милиони – много повече от всички неорганични заедно.
          </p>
          <Theorem
            type="definition"
            title="Хибридизация на въглеродния атом"
            description="Формата около въглеродния атом зависи от това колко атома са свързани с него. При четири съседа (само единични връзки) атомът е $sp^3$-хибридизиран и връзките сочат към върховете на тетраедър под ъгъл $109{,}5^\circ$. При двойна връзка той е $sp^2$ – три съседа в една равнина под $120^\circ$. При тройна връзка е $sp$ – два съседа на една линия под $180^\circ$."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Хибридизация</th>
                  <th className={th}>Връзки</th>
                  <th className={th}>Ъгъл</th>
                  <th className={th}>Форма</th>
                  <th className={th}>Дължина C–C, pm</th>
                </tr>
              </thead>
              <tbody>
                {HYBRID.map(([hyb, bonds, angle, shape, len]) => (
                  <tr key={hyb}>
                    <td className={td}>
                      <Tex>{hyb}</Tex>
                    </td>
                    <td className={td}>{bonds}</td>
                    <td className={td}>
                      <Tex>{angle}</Tex>
                    </td>
                    <td className={td}>{shape}</td>
                    <td className={td}>{len}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Как теорията за отблъскването на електронните двойки предсказва тези ъгли, видяхме в урока{' '}
            <Link to="/chemistry/structure/molecules" className={link}>
              Форма на молекулите и междумолекулни сили
            </Link>
            . Колкото повече връзки има между два въглеродни атома, толкова по-къса и по-здрава е връзката.
          </p>
          <Gallery
            mode="full"
            items={[
              { smiles: 'CC', caption: 'етан, sp³' },
              { smiles: 'C=C', caption: 'етен (етилен), sp²' },
              { smiles: 'C#C', caption: 'етин (ацетилен), sp' },
            ]}
          />
          <p className={text}>
            Да се пишат всички водородни атоми е дълго. Затова има по-кратки записи: в <strong>полуструктурната</strong> формула всеки
            въглерод е написан заедно със своите водородни атоми (<Tex>{'\\mathrm{CH_3{-}CH_2{-}CH_3}'}</Tex>), а в{' '}
            <strong>скелетната</strong> се чертаят само връзките – всеки връх и всеки край на линия е въглероден атом с толкова водородни,
            колкото му липсват до четири връзки.
          </p>
          <Gallery
            items={[
              { smiles: 'CCCC', caption: 'бутан – полуструктурна', mode: 'semi' },
              { smiles: 'CCCC', caption: 'бутан – скелетна' },
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Хомоложни редове</h2>
          <Theorem
            type="definition"
            title="Хомоложен ред"
            description="Хомоложен ред е редица от съединения с еднакъв строеж и сходни свойства, в която всеки член се различава от предишния с една група $\mathrm{CH_2}$ (хомоложна разлика, $14\ \mathrm{g/mol}$). Членовете на реда имат обща формула: алкани $\mathrm{C}_n\mathrm{H}_{2n+2}$, алкени и циклоалкани $\mathrm{C}_n\mathrm{H}_{2n}$, алкини $\mathrm{C}_n\mathrm{H}_{2n-2}$."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>n</th>
                  <th className={th}>Алкан</th>
                  <th className={th}>Формула</th>
                  <th className={th}>Алкен</th>
                  <th className={th}>Алкин</th>
                </tr>
              </thead>
              <tbody>
                {ALKANES.map(n => (
                  <tr key={n}>
                    <td className={td}>{n}</td>
                    <td className={td}>{iupacName({ n, bond: 1, bondPos: 0, subs: [] })}</td>
                    <td className={td}>
                      <Tex>{n === 1 ? '\\mathrm{CH_4}' : ftex(n, 2 * n + 2)}</Tex>
                    </td>
                    <td className={td}>{n > 1 ? iupacName({ n, bond: 2, bondPos: 1, subs: [] }) : '–'}</td>
                    <td className={td}>{n > 1 ? iupacName({ n, bond: 3, bondPos: 1, subs: [] }) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Първите четири имена са исторически (метан, етан, пропан, бутан), а от пет нататък идват от гръцките числителни: пента-, хекса-,
            хепта-, окта-, нона-, дека-. Алкените завършват на <strong>-ен</strong>, алкините – на <strong>-ин</strong>, а числото показва
            от кой въглероден атом започва кратната връзка. В по-старите учебници ще срещнеш и записа „1-бутен“ вместо „бут-1-ен“.
          </p>
          <HomologLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Имена по IUPAC</h2>
          <Theorem
            title="Как се наименува разклонен въглеводород"
            description="1) Намираме главната верига – най-дългата верига от въглеродни атоми; при алкените и алкините тя трябва да съдържа кратната връзка. 2) Номерираме я от края, по-близо до кратната връзка, а ако няма такава – по-близо до първото разклонение (сборът от номерата да е възможно най-малък). 3) Пишем номерата и имената на разклоненията по азбучен ред (етил, метил…), еднаквите събираме с ди-, три-. 4) Накрая – името на главната верига."
          />
          <Example
            description="Наименувайте $\mathrm{CH_3{-}CH(CH_3){-}CH_2{-}CH(C_2H_5){-}CH_3}$."
            steps={[
              'Най-дългата верига минава през етиловата група: тя има 6 атома C – хексан, а не пентан.',
              'Разклоненията са две метилови групи. Номерираме от левия край: метил при C2 и C4 (отдясно биха били C3 и C5).',
              'Името е 2,4-диметилхексан.',
            ]}
          />
          <Gallery items={[{ smiles: 'CC(C)CC(CC)C', caption: '2,4-диметилхексан', highlight: [0, 2, 3, 4, 5] }]} />
          <NameBuilderLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Изомерия</h2>
          <Theorem
            type="definition"
            title="Изомери"
            description="Изомерите са вещества с еднаква молекулна формула, но различен строеж и затова – различни свойства. При структурната изомерия атомите са свързани в различен ред: различна верига (бутан и 2-метилпропан), различно място на кратната връзка или разклонението (бут-1-ен и бут-2-ен) или различен клас (бут-1-ен и циклобутан). При цис-транс изомерията свързването е еднакво, но групите около двойната връзка са разположени различно в пространството."
          />
          <p className={text}>
            Около единичната връзка атомите се въртят свободно – затова зигзагът на бутана, начертан наобратно, е същата молекула. Около
            двойната връзка въртене няма. Ако всеки въглерод на двойната връзка носи две <strong>различни</strong> групи, възможни са два
            изомера: <strong>цис-</strong> (еднаквите групи са от една страна) и <strong>транс-</strong> (от двете страни).
          </p>
          <IsomerLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Алкани</h2>
          <p className={text}>
            Алканите (парафини) са <strong>наситени</strong> въглеводороди – само с единични връзки. Те са неполярни, не се разтварят във
            вода и са най-малко реактивните въглеводороди. Двете им най-важни реакции са горенето и заместването с <Term id="halogens">халогени</Term>.
          </p>
          <Theorem
            title="Горене на въглеводородите"
            description="При пълно изгаряне се получават въглероден диоксид и вода: $\mathrm{C}_x\mathrm{H}_y + \left(x + \frac{y}{4}\right)\mathrm{O_2} \to x\,\mathrm{CO_2} + \frac{y}{2}\,\mathrm{H_2O}$. Ако кислородът не стига, се получават и отровният въглероден оксид CO и сажди (C)."
          />
          <Example
            description="Хлориране на метана. На светлина или при нагряване хлорът замества водородните атоми един по един:"
            steps={[
              '$\\mathrm{CH_4 + Cl_2 \\xrightarrow{h\\nu} CH_3Cl + HCl}$ (хлорометан)',
              'Реакцията продължава: $\\mathrm{CH_2Cl_2}$, $\\mathrm{CHCl_3}$ (хлороформ), $\\mathrm{CCl_4}$ – получава се смес.',
              'Това е реакция на заместване – един атом се сменя с друг.',
            ]}
          />
          <p className={text}>
            Механизмът на това заместване (с радикали) е разгледан в урока{' '}
            <Link to="/chemistry/organic/mechanisms" className={link}>
              Механизми на органичните реакции
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Алкени и алкини</h2>
          <p className={text}>
            Алкените (с една двойна връзка) и алкините (с една тройна) са <strong>ненаситени</strong>. Едната връзка в двойната (π-връзката)
            е по-слаба и лесно се разкъсва – затова за тях са типични реакциите на <strong>присъединяване</strong>.
          </p>
          <Gallery
            items={[
              { smiles: 'C=CC', caption: 'пропен' },
              { smiles: 'C=CC=C', caption: 'бута-1,3-диен' },
              { smiles: 'CC#CC', caption: 'бут-2-ин' },
            ]}
          />
          <Example
            description="Присъединяване към етена:"
            steps={[
              'водород (хидрогениране): $\\mathrm{CH_2{=}CH_2 + H_2 \\xrightarrow{Ni,\\ t} CH_3{-}CH_3}$',
              'бром: $\\mathrm{CH_2{=}CH_2 + Br_2 \\to CH_2Br{-}CH_2Br}$ (1,2-диброметан)',
              'вода: $\\mathrm{CH_2{=}CH_2 + H_2O \\xrightarrow{H^+} CH_3{-}CH_2OH}$ (етанол)',
              'хлороводород: $\\mathrm{CH_2{=}CH_2 + HCl \\to CH_3{-}CH_2Cl}$',
            ]}
          />
          <Theorem
            title="Качествена проба с бромна вода"
            description="Бромната вода е жълто-кафява. Алкените и алкините я обезцветяват бързо, защото бромът се присъединява към кратната връзка. Алканите и бензенът при същите условия не я обезцветяват. Така се различават наситените от ненаситените въглеводороди."
          />
          <p className={text}>
            При несиметричен алкен (например пропен) с HBr водородът отива предимно при въглерода, който вече има повече водородни атоми
            (<Term id="markovnikov-rule">правило на Марковников</Term>): получава се 2-бромопропан. Защо – отново в урока за механизмите. А когато хиляди молекули етен се
            присъединят една към друга, се получава полиетилен – за това в урока{' '}
            <Link to="/chemistry/organic/polymers" className={link}>
              Полимери
            </Link>
            .
          </p>
          <Example
            description="Етинът (ацетиленът) се получава от калциев карбид и вода. Към тройната връзка могат да се присъединят две молекули бром."
            steps={['$\\mathrm{CaC_2 + 2H_2O \\to HC{\\equiv}CH\\uparrow + Ca(OH)_2}$', '$\\mathrm{HC{\\equiv}CH + 2Br_2 \\to CHBr_2{-}CHBr_2}$', 'Горелката на ацетилен с кислород дава пламък над 3000 °C – с нея се режат и заваряват метали.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Арени и циклоалкани</h2>
          <p className={text}>
            В бензена всичките шест връзки C–C са еднакво дълги – 139 pm, между единичната (154 pm) и двойната (134 pm). Шестте
            π-електрона не принадлежат на три отделни двойни връзки, а са общи за целия пръстен. Затова бензенът се чертае и с окръжност в
            шестоъгълника, и като формулата на Кекуле – двата записа означават едно и също.
          </p>
          <Gallery
            items={[
              { smiles: 'c1ccccc1', caption: 'бензен' },
              { smiles: 'C1=CC=CC=C1', caption: 'бензен (Кекуле)' },
              { smiles: 'Cc1ccccc1', caption: 'метилбензен (толуен)' },
              { smiles: 'c1ccc2ccccc2c1', caption: 'нафтален' },
            ]}
          />
          <Theorem
            title="Химичните свойства на бензена"
            description="Ароматният пръстен е много устойчив. Затова бензенът, макар формално ненаситен, не обезцветява бромната вода, а влиза главно в реакции на заместване, и то с катализатор: $\mathrm{C_6H_6 + Br_2 \xrightarrow{FeBr_3} C_6H_5Br + HBr}$, $\mathrm{C_6H_6 + HNO_3 \xrightarrow{H_2SO_4} C_6H_5NO_2 + H_2O}$ (нитробензен)."
          />
          <p className={text}>
            <strong>Циклоалканите</strong> имат пръстен само с единични връзки и обща формула <Tex>{'\\mathrm{C}_n\\mathrm{H}_{2n}'}</Tex> – същата
            като на алкените. По свойства обаче приличат на алканите. Циклохексанът е устойчив, а циклопропанът, с ъгли от само 60°, е
            напрегнат и се разкъсва по-лесно.
          </p>
          <Gallery
            items={[
              { smiles: 'C1CC1', caption: 'циклопропан' },
              { smiles: 'C1CCCC1', caption: 'циклопентан' },
              { smiles: 'C1CCCCC1', caption: 'циклохексан' },
            ]}
          />
          <Theorem
            type="definition"
            title="Степен на ненаситеност (за напреднали)"
            description="За въглеводород $\mathrm{C}_x\mathrm{H}_y$ броят на пръстените и π-връзките е $\frac{2x + 2 - y}{2}$. За бензена $\mathrm{C_6H_6}$: $\frac{14 - 6}{2} = 4$ – един пръстен и три π-връзки. Така от молекулната формула веднага се вижда колко „ненаситена“ е молекулата."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Нефт и природен газ</h2>
          <p className={text}>
            Природният газ е предимно метан, с малко етан, пропан и бутан. Нефтът е смес от стотици въглеводороди. В рафинерията той се
            разделя чрез <Term id="distillation">дестилация</Term> в колона на <strong>фракции</strong> – групи вещества с близки
            температури на кипене. Колкото по-дълги са молекулите, толкова по-високо кипят (виж графиката в лабораторията по-горе).
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Фракция</th>
                  <th className={th}>Кипи при, °C</th>
                  <th className={th}>Молекули</th>
                  <th className={th}>Употреба</th>
                </tr>
              </thead>
              <tbody>
                {FRACTIONS.map(([name, t, c, use]) => (
                  <tr key={name}>
                    <td className={td}>{name}</td>
                    <td className={td}>{t}</td>
                    <td className={td}>{c}</td>
                    <td className={td}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Бензинът, който нефтът дава при дестилация, не стига. Затова тежките фракции се подлагат на <strong>крекинг</strong>: при
            нагряване и с <Term id="catalyst">катализатор</Term> дългите молекули се разкъсват на по-къси, например{' '}
            <Tex>{'\\mathrm{C_{16}H_{34} \\to C_8H_{18} + C_8H_{16}}'}</Tex>. Получава се и алкен – ценна суровина за пластмасите.
          </p>
          <p className={text}>
            Качеството на бензина се мери с <strong>октаново число</strong>. Разклоненият 2,2,4-триметилпентан („изооктан“) гори
            равномерно в двигателя и има октаново число 100 по определение, а хептанът с права верига детонира лесно и има 0. Ето защо
            изомерите не са само учебна тема.
          </p>
          <Gallery
            items={[
              { smiles: 'CC(C)CC(C)(C)C', caption: 'изооктан – 100' },
              { smiles: 'CCCCCCC', caption: 'хептан – 0' },
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Формули по името, моларни маси, кислород за горенето, присъединяване на бром и степен на ненаситеност. Десетичните отговори въвеждай като 7,5.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Въглеводородите около нас</h2>
          <p className={text}>Котлони, коли, свещи и рафинерии – въглеводородите са най-важните горива на днешния свят.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Главната верига', 'Главната верига е хоризонталната в чертежа.', 'Главната верига е най-дългата, дори да завива.'],
              ['Номерацията', '4-метилпентан', 'Номерира се от по-близкия до разклонението край: 2-метилпентан.'],
              ['$\\mathrm{C}_n\\mathrm{H}_{2n}$ е алкен', 'Щом формулата е $\\mathrm{C_6H_{12}}$, веществото е алкен.', 'Може да е и циклоалкан – циклохексанът също е $\\mathrm{C_6H_{12}}$.'],
              ['Бензенът и бромната вода', 'Бензенът обезцветява бромната вода като алкените.', 'Не – ароматният пръстен е устойчив; бромира се само с катализатор.'],
              ['Цис-транс', 'Бут-1-енът има цис- и транс-изомер.', 'При C1 има два водородни атома – цис-транс изомерия няма.'],
              ['Обърнатата молекула', 'Зигзагът на бутана, начертан наобратно, е друг изомер.', 'Около единичната връзка има въртене – това е същата молекула.'],
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
          <h2 className={h2}>12. 🎯 Бърз тест</h2>
          <Quiz questions={quiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>13. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Колко водородни атома има молекулата на октана и каква е моларната му маса?" check={[18, 114]} ask={['брой H', '$M$, g/mol']}>
                <p>Октанът е алкан с 8 атома C: <Tex>{'\\mathrm{C_8H_{2 \\cdot 8 + 2} = C_8H_{18}}'}</Tex>.</p>
                <p><Tex>{'M = 8 \\cdot 12 + 18 = 114\\ \\mathrm{g/mol}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Колко литра кислород са нужни за изгарянето на 5 L пропан и колко литра $\mathrm{CO_2}$ се получават? (Обемите са при еднакви условия.)" check={[25, 15]} ask={['$\\mathrm{O_2}$, L', '$\\mathrm{CO_2}$, L']}>
                <p><Tex>{'\\mathrm{C_3H_8 + 5O_2 \\to 3CO_2 + 4H_2O}'}</Tex></p>
                <p><Tex>{'V(\\mathrm{O_2}) = 5 \\cdot 5 = 25\\ \\mathrm{L}'}</Tex>, <Tex>{'V(\\mathrm{CO_2}) = 3 \\cdot 5 = 15\\ \\mathrm{L}'}</Tex>.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Колко структурни изомера има $\mathrm{C_5H_{12}}$? Наименувайте ги." check={[3]} ask={['брой изомери']}>
                <p>Права верига: пентан.</p>
                <p>Верига от 4 атома с едно разклонение: 2-метилбутан.</p>
                <p>Верига от 3 атома с две разклонения: 2,2-диметилпропан. Общо 3 изомера.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="7 g алкен присъединяват 16 g бром. Каква е моларната маса на алкена и колко въглеродни атома има в молекулата му?" check={[70, 5]} ask={['$M$, g/mol', 'брой C']}>
                <p><Tex>{'n(\\mathrm{Br_2}) = \\frac{16}{160} = 0{,}1\\ \\mathrm{mol}'}</Tex> – толкова мола и алкен (1 : 1).</p>
                <p><Tex>{'M = \\frac{7}{0{,}1} = 70\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'14n = 70 \\Rightarrow n = 5'}</Tex>: <Tex>{'\\mathrm{C_5H_{10}}'}</Tex> (например пент-1-ен).</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Каква е степента на ненаситеност на бензена $\mathrm{C_6H_6}$ и на циклохексана $\mathrm{C_6H_{12}}$?" check={[4, 1]} ask={['$\\mathrm{C_6H_6}$', '$\\mathrm{C_6H_{12}}$']}>
                <p>Наситеният алкан с 6 атома C има 14 атома H.</p>
                <p>Бензен: <Tex>{'\\frac{14 - 6}{2} = 4'}</Tex> (пръстен и три π-връзки).</p>
                <p>Циклохексан: <Tex>{'\\frac{14 - 12}{2} = 1'}</Tex> (само пръстенът).</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="При пълното изгаряне на 0,1 mol въглеводород се получават 8,8 g $\mathrm{CO_2}$ и 3,6 g вода. Колко атома C и колко атома H има в молекулата му?" check={[2, 4]} ask={['брой C', 'брой H']}>
                <p><Tex>{'n(\\mathrm{CO_2}) = \\frac{8{,}8}{44} = 0{,}2\\ \\mathrm{mol}'}</Tex> – по 2 атома C на молекула.</p>
                <p><Tex>{'n(\\mathrm{H_2O}) = \\frac{3{,}6}{18} = 0{,}2\\ \\mathrm{mol}'}</Tex>, значи <Tex>{'0{,}4\\ \\mathrm{mol}'}</Tex> H – по 4 на молекула.</p>
                <p>Формулата е <Tex>{'\\mathrm{C_2H_4}'}</Tex> – етен.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Колко структурни изомера има хептанът $\mathrm{C_7H_{16}}$? При колко от тях главната верига е от 5 въглеродни атома?" check={[9, 5]} ask={['всички изомери', 'с главна верига от 5 атома']}>
                <p>Права верига: хептан (1). Главна верига от 6 атома: 2- и 3-метилхексан (2).</p>
                <p>Главна верига от 5 атома: 2,2-, 2,3-, 2,4- и 3,3-диметилпентан и 3-етилпентан (5).</p>
                <p>Главна верига от 4 атома: 2,2,3-триметилбутан (1). Общо <Tex>{'1 + 2 + 5 + 1 = 9'}</Tex>.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="10 L смес от метан и етен (нормални условия) преминават през излишък от бромна вода. Масата на склянката с бромната вода нараства с 5,6 g. Каква е обемната част на етена в сместа?" check={[44.8]} ask={['$\\varphi(\\mathrm{C_2H_4})$, %']}>
                <p>Метанът не реагира; масата нараства само с погълнатия етен.</p>
                <p><Tex>{'n(\\mathrm{C_2H_4}) = \\frac{5{,}6}{28} = 0{,}2\\ \\mathrm{mol}'}</Tex>, <Tex>{'V = 0{,}2 \\cdot 22{,}4 = 4{,}48\\ \\mathrm{L}'}</Tex></p>
                <p><Tex>{'\\varphi = \\frac{4{,}48}{10} = 44{,}8\\%'}</Tex></p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Въглеводород има относителна плътност спрямо водорода 39 и масова част на въглерода 92,3%. Намерете моларната му маса и степента на ненаситеност. Какво може да е веществото?" check={[78, 4]} ask={['$M$, g/mol', 'степен на ненаситеност']}>
                <p><Tex>{'M = 39 \\cdot 2 = 78\\ \\mathrm{g/mol}'}</Tex>; въглерод <Tex>{'0{,}923 \\cdot 78 \\approx 72\\ \\mathrm{g}'}</Tex> – 6 атома, водород <Tex>{'78 - 72 = 6'}</Tex>.</p>
                <p><Tex>{'\\mathrm{C_6H_6}'}</Tex>: степен на ненаситеност <Tex>{'\\frac{14 - 6}{2} = 4'}</Tex>.</p>
                <p>Това е бензенът. Тъй като не обезцветява бромната вода, четирите „ненаситености“ не са обикновени двойни връзки, а ароматен пръстен.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Въглеродът е четиривалентен; хибридизация <Tex>{'sp^3'}</Tex> (109,5°), <Tex>{'sp^2'}</Tex> (120°), <Tex>{'sp'}</Tex> (180°)</li>
              <li>✓ Хомоложни редове: алкани <Tex>{'\\mathrm{C}_n\\mathrm{H}_{2n+2}'}</Tex>, алкени и циклоалкани <Tex>{'\\mathrm{C}_n\\mathrm{H}_{2n}'}</Tex>, алкини <Tex>{'\\mathrm{C}_n\\mathrm{H}_{2n-2}'}</Tex>; хомоложна разлика <Tex>{'\\mathrm{CH_2}'}</Tex></li>
              <li>✓ Име по IUPAC: най-дългата верига, най-малки номера, разклоненията по азбучен ред</li>
              <li>✓ Изомерия: структурна (верига, място на връзката, клас) и цис-транс около двойната връзка</li>
              <li>✓ Алканите – горене и заместване; алкените и алкините – присъединяване, обезцветяват бромната вода</li>
              <li>✓ Бензенът е ароматен: еднакви връзки, заместване с катализатор вместо присъединяване</li>
              <li>✓ Нефтът се разделя чрез дестилация на фракции; крекингът разкъсва дългите молекули</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              На Титан, най-големия спътник на Сатурн, температурата е около −180 °C – между температурите на топене и кипене на метана и
              етана. Затова там има езера и морета от течни въглеводороди, а според данните на сондата Cassini, която ги заснема с радар, там вероятно вали и метанов дъжд
              (повече за Сатурн и спътниците му – в{' '}
              <Link to="/astronomy/lecture14" className={link}>
                лекцията за газовите гиганти
              </Link>
              ).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
