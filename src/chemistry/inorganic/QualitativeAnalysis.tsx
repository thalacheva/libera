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
import { formulaTex, molarMass } from '../formula';
import FlameTestLab from './FlameTestLab';
import MixingLab from './MixingLab';
import { ANIONS, CATIONS, type Ion, solubility } from './qualitativeData';
import UnknownBottlesLab from './UnknownBottlesLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Десетично число в LaTeX: 0.45 → 0{,}45. */
const dec = (v: number) => v.toLocaleString('en-US', { maximumSignificantDigits: 6, useGrouping: false }).replace('.', '{,}');
/** Отговорът като дроб num/den – стойностите тук имат най-много 4 знака след запетаята. */
const answer = (v: number) => ({ num: Math.round(v * 10000), den: 10000 });

// Сол, йоните ѝ (TeX, текст, брой във формулата)
const SALTS: { f: string; ions: [string, string, number][] }[] = [
  { f: 'Na2SO4', ions: [['\\mathrm{Na^+}', 'Na⁺', 2], ['\\mathrm{SO_4^{2-}}', 'SO₄²⁻', 1]] },
  { f: 'AlCl3', ions: [['\\mathrm{Al^{3+}}', 'Al³⁺', 1], ['\\mathrm{Cl^-}', 'Cl⁻', 3]] },
  { f: 'Al2(SO4)3', ions: [['\\mathrm{Al^{3+}}', 'Al³⁺', 2], ['\\mathrm{SO_4^{2-}}', 'SO₄²⁻', 3]] },
  { f: 'K3PO4', ions: [['\\mathrm{K^+}', 'K⁺', 3], ['\\mathrm{PO_4^{3-}}', 'PO₄³⁻', 1]] },
  { f: 'Ca(NO3)2', ions: [['\\mathrm{Ca^{2+}}', 'Ca²⁺', 1], ['\\mathrm{NO_3^-}', 'NO₃⁻', 2]] },
  { f: 'Fe2(SO4)3', ions: [['\\mathrm{Fe^{3+}}', 'Fe³⁺', 2], ['\\mathrm{SO_4^{2-}}', 'SO₄²⁻', 3]] },
  { f: 'NaCl', ions: [['\\mathrm{Na^+}', 'Na⁺', 1], ['\\mathrm{Cl^-}', 'Cl⁻', 1]] },
];

const newDrill = (): Drill => {
  const kind = randInt(0, 5);
  if (kind === 0) {
    // Маса на AgCl от маса на NaCl
    const n = pick([0.01, 0.02, 0.04, 0.1, 0.2]);
    const m = n * 58.5;
    return {
      tex: `${dec(m)}\\ \\mathrm{g\\ NaCl} + \\mathrm{AgNO_3}\\ \\text{(излишък)}`,
      ask: 'Колко грама AgCl се утаяват?',
      ...answer(n * 143.5),
      steps: [`$n(\\mathrm{NaCl}) = \\frac{${dec(m)}}{58{,}5} = ${dec(n)}\\ \\mathrm{mol}$`, `$\\mathrm{Ag^+ + Cl^- \\to AgCl\\downarrow}$, значи $n(\\mathrm{AgCl}) = ${dec(n)}\\ \\mathrm{mol}$`, `$m = ${dec(n)} \\cdot 143{,}5 = ${dec(n * 143.5)}\\ \\mathrm{g}$`],
    };
  }
  if (kind === 1) {
    // Маса на BaSO4 от обем и концентрация на Na2SO4
    const V = pick([50, 100, 200, 250]);
    const c = pick([0.1, 0.2, 0.4]);
    const n = (V * c) / 1000;
    return {
      tex: `${V}\\ \\mathrm{mL}\\ \\ ${dec(c)}\\ \\mathrm{mol/L\\ Na_2SO_4} + \\mathrm{BaCl_2}\\ \\text{(излишък)}`,
      ask: 'Колко грама BaSO₄ се утаяват?',
      ...answer(n * 233),
      steps: [`$n(\\mathrm{SO_4^{2-}}) = c \\cdot V = ${dec(c)} \\cdot ${dec(V / 1000)} = ${dec(n)}\\ \\mathrm{mol}$`, `$m(\\mathrm{BaSO_4}) = ${dec(n)} \\cdot 233 = ${dec(n * 233)}\\ \\mathrm{g}$`],
    };
  }
  if (kind === 2) {
    // Концентрация на йон в разтвор на силен електролит
    const s = pick(SALTS);
    const [tex, txt, k] = pick(s.ions);
    const c = pick([0.05, 0.1, 0.2, 0.3]);
    return {
      tex: `c(${formulaTex(s.f)}) = ${dec(c)}\\ \\mathrm{mol/L}`,
      ask: `Каква е концентрацията на ${txt}? (mol/L)`,
      ...answer(c * k),
      steps: [`$${formulaTex(s.f)} \\to ${s.ions.map(([t, , q]) => (q > 1 ? q : '') + t).join(' + ')}$`, `$c(${tex}) = ${k} \\cdot ${dec(c)} = ${dec(c * k)}\\ \\mathrm{mol/L}$`],
    };
  }
  if (kind === 3) {
    // Общ брой молове йони
    const s = pick(SALTS);
    const n = pick([0.1, 0.2, 0.5]);
    const total = s.ions.reduce((a, [, , q]) => a + q, 0);
    return {
      tex: `n(${formulaTex(s.f)}) = ${dec(n)}\\ \\mathrm{mol}`,
      ask: 'Колко мола йони общо се получават при пълната дисоциация?',
      ...answer(n * total),
      steps: [`$${formulaTex(s.f)} \\to ${s.ions.map(([t, , q]) => (q > 1 ? q : '') + t).join(' + ')}$ – от една формулна единица ${total} йона`, `$${total} \\cdot ${dec(n)} = ${dec(n * total)}\\ \\mathrm{mol}$`],
    };
  }
  if (kind === 4) {
    // Смесване на равни обеми NaCl и CaCl2
    const c1 = pick([0.1, 0.2, 0.3, 0.4]);
    const c2 = pick([0.1, 0.2, 0.3]);
    const V = pick([50, 100, 200]);
    const cl = (c1 + 2 * c2) / 2;
    return {
      tex: `${V}\\ \\mathrm{mL}\\ \\ ${dec(c1)}\\ \\mathrm{mol/L\\ NaCl} + ${V}\\ \\mathrm{mL}\\ \\ ${dec(c2)}\\ \\mathrm{mol/L\\ CaCl_2}`,
      ask: 'Каква е концентрацията на Cl⁻ в сместа? (mol/L)',
      ...answer(cl),
      steps: [
        `Хлоридните йони идват и от двете соли: $${dec(c1)} \\cdot V + 2 \\cdot ${dec(c2)} \\cdot V$`,
        `Обемът се удвоява: $c(\\mathrm{Cl^-}) = \\frac{${dec(c1)} + ${dec(2 * c2)}}{2} = ${dec(cl)}\\ \\mathrm{mol/L}$`,
      ],
    };
  }
  // Обем CO2 от карбонат и киселина
  const m = pick([5, 10, 15, 20, 25, 50]);
  return {
    tex: `${m}\\ \\mathrm{g\\ CaCO_3} + \\mathrm{HCl}\\ \\text{(излишък)}`,
    ask: 'Колко литра CO₂ (н.у.) се отделят?',
    ...answer((m / 100) * 22.4),
    steps: [`$\\mathrm{CaCO_3 + 2H^+ \\to Ca^{2+} + H_2O + CO_2\\uparrow}$`, `$n = \\frac{${m}}{100} = ${dec(m / 100)}\\ \\mathrm{mol}$; $V = ${dec(m / 100)} \\cdot 22{,}4 = ${dec((m / 100) * 22.4)}\\ \\mathrm{L}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '💧 Хлорид в минералната вода',
    problem: 'Към 200 mL минерална вода се добавя излишък от разтвор на AgNO₃, подкислен с азотна киселина. Утайката се филтрува, изсушава и тежи 0,1435 g. Колко милиграма хлоридни йони има в литър от водата?',
    solution: ['$n(\\mathrm{AgCl}) = \\frac{0{,}1435}{143{,}5} = 0{,}001\\ \\mathrm{mol}$ – толкова е и $n(\\mathrm{Cl^-})$', '$m(\\mathrm{Cl^-}) = 0{,}001 \\cdot 35{,}5 = 0{,}0355\\ \\mathrm{g} = 35{,}5\\ \\mathrm{mg}$ в 200 mL', 'В литър: $35{,}5 \\cdot 5 = 177{,}5\\ \\mathrm{mg/L}$. Азотната киселина е нужна, за да не се утаят и карбонатите като $\\mathrm{Ag_2CO_3}$.'],
    answer: '$177{,}5\\ \\mathrm{mg/L}$',
    check: [177.5],
    ask: ['Cl⁻, mg/L'],
  },
  {
    title: '🏥 Бариева каша за рентген',
    problem: 'Преди рентгенова снимка на стомаха пациентът пие суспензия на BaSO₄ – барият задържа рентгеновите лъчи. Колко грама BaSO₄ могат да се получат от 41,6 g BaCl₂ с излишък от Na₂SO₄?',
    solution: ['$n(\\mathrm{BaCl_2}) = \\frac{41{,}6}{208} = 0{,}2\\ \\mathrm{mol}$', '$\\mathrm{Ba^{2+} + SO_4^{2-} \\to BaSO_4\\downarrow}$: $m = 0{,}2 \\cdot 233 = 46{,}6\\ \\mathrm{g}$', 'Разтворимите бариеви соли са отровни. BaSO₄ е безопасен, защото практически не се разтваря – дори в солната киселина на стомаха. BaCO₃ не става: той се разтваря в киселината и освобождава отровните йони Ba²⁺.'],
    answer: '$46{,}6\\ \\mathrm{g}$',
    check: [46.6],
    ask: ['BaSO₄, g'],
  },
  {
    title: '🚿 Омекотяване на твърда вода',
    problem: 'Водата съдържа 80 mg/L калциеви йони. Колко грама сода Na₂CO₃ са нужни, за да се утаи калцият от 1 m³ вода, и колко грама CaCO₃ ще се получат?',
    solution: ['В 1000 L: $m(\\mathrm{Ca^{2+}}) = 80\\ \\mathrm{g}$, $n = \\frac{80}{40} = 2\\ \\mathrm{mol}$', '$\\mathrm{Ca^{2+} + CO_3^{2-} \\to CaCO_3\\downarrow}$: нужни са 2 mol сода, $2 \\cdot 106 = 212\\ \\mathrm{g}$', 'Утаява се $2 \\cdot 100 = 200\\ \\mathrm{g}$ CaCO₃ – това е и „котленият камък“, който се натрупва в чайниците при варене на твърда вода.'],
    answer: '$212\\ \\mathrm{g}$ сода, $200\\ \\mathrm{g}$ CaCO₃',
    check: [212, 200],
    ask: ['Na₂CO₃, g', 'CaCO₃, g'],
  },
  {
    title: '🎆 Червените фойерверки',
    problem: 'Червеният цвят във фойерверките се дължи на стронциеви соли, например Sr(NO₃)₂. Каква е масовата част на стронция в тази сол? Колко грама Sr(NO₃)₂ съдържат 0,05 mol стронций?',
    solution: [`$M(\\mathrm{Sr(NO_3)_2}) = 88 + 2 \\cdot 62 = ${molarMass('Sr(NO3)2')}\\ \\mathrm{g/mol}$`, '$w(\\mathrm{Sr}) = \\frac{88}{212} \\approx 41{,}5\\%$', '$m = 0{,}05 \\cdot 212 = 10{,}6\\ \\mathrm{g}$. Нитратът е и окислител – той поддържа горенето на сместа.'],
    answer: '$\\approx 41{,}5\\%$; $10{,}6\\ \\mathrm{g}$',
    check: [41.5, 10.6],
    ask: ['w(Sr), %', 'маса, g'],
  },
  {
    title: '🧂 Каква е тази смес?',
    problem: 'Смес от NaCl и Na₂SO₄ с маса 10 g се разтваря във вода. С излишък от BaCl₂ се получават 11,65 g утайка. Каква е масовата част на натриевия сулфат в сместа?',
    solution: ['Утаява се само сулфатът: $n(\\mathrm{BaSO_4}) = \\frac{11{,}65}{233} = 0{,}05\\ \\mathrm{mol}$', '$m(\\mathrm{Na_2SO_4}) = 0{,}05 \\cdot 142 = 7{,}1\\ \\mathrm{g}$', '$w = \\frac{7{,}1}{10} = 71\\%$, а натриевият хлорид е 29%.'],
    answer: '$71\\%$',
    check: [71],
    ask: ['w(Na₂SO₄), %'],
  },
  {
    title: '🥚 Колко варовик има в черупката',
    problem: 'Към 10 g натрошени яйчени черупки се добавя излишък от солна киселина. Отделят се 2,016 L CO₂ (н.у.). Каква е масовата част на CaCO₃ в черупките? (Приемете, че само той отделя газ.)',
    solution: ['$n(\\mathrm{CO_2}) = \\frac{2{,}016}{22{,}4} = 0{,}09\\ \\mathrm{mol}$ – толкова е и $n(\\mathrm{CaCO_3})$', '$m(\\mathrm{CaCO_3}) = 0{,}09 \\cdot 100 = 9\\ \\mathrm{g}$', '$w = \\frac{9}{10} = 90\\%$ – черупката наистина е предимно калциев карбонат; останалото са белтъци и други соли.'],
    answer: '$90\\%$',
    check: [90],
    ask: ['w(CaCO₃), %'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Кое от тези вещества е слаб електролит?',
    answers: ['$\\mathrm{CH_3COOH}$', '$\\mathrm{NaCl}$', '$\\mathrm{HCl}$', '$\\mathrm{KOH}$'],
    correctAnswer: '$\\mathrm{CH_3COOH}$',
  },
  {
    question: 'Кои йони не участват в реакцията $\\mathrm{BaCl_2 + Na_2SO_4 \\to BaSO_4 + 2NaCl}$ (йони-наблюдатели)?',
    answers: ['$\\mathrm{Na^+}$ и $\\mathrm{Cl^-}$', '$\\mathrm{Ba^{2+}}$ и $\\mathrm{SO_4^{2-}}$', '$\\mathrm{Na^+}$ и $\\mathrm{SO_4^{2-}}$', '$\\mathrm{Ba^{2+}}$ и $\\mathrm{Cl^-}$'],
    correctAnswer: '$\\mathrm{Na^+}$ и $\\mathrm{Cl^-}$',
  },
  {
    question: 'С кой реактив се открива сулфатен йон?',
    answers: ['$\\mathrm{BaCl_2}$', '$\\mathrm{AgNO_3}$', '$\\mathrm{NaOH}$', '$\\mathrm{KNO_3}$'],
    correctAnswer: '$\\mathrm{BaCl_2}$',
  },
  {
    question: 'Каква утайка дават йоните $\\mathrm{Cu^{2+}}$ с разтвор на NaOH?',
    answers: ['синя', 'червено-кафява', 'бяла', 'жълта'],
    correctAnswer: 'синя',
  },
  {
    question: 'Каква е концентрацията на хлоридните йони в разтвор на $\\mathrm{AlCl_3}$ с концентрация $0{,}1\\ \\mathrm{mol/L}$?',
    answers: ['$0{,}3\\ \\mathrm{mol/L}$', '$0{,}1\\ \\mathrm{mol/L}$', '$0{,}4\\ \\mathrm{mol/L}$', '$0{,}033\\ \\mathrm{mol/L}$'],
    correctAnswer: '$0{,}3\\ \\mathrm{mol/L}$',
  },
  {
    question: 'Сол оцветява пламъка жълтозелено. Кой метал съдържа?',
    answers: ['барий', 'натрий', 'калий', 'литий'],
    correctAnswer: 'барий',
  },
  {
    question: 'При смесването на кои разтвори НЕ протича реакция?',
    answers: ['$\\mathrm{KNO_3 + NaCl}$', '$\\mathrm{AgNO_3 + NaCl}$', '$\\mathrm{Na_2CO_3 + HCl}$', '$\\mathrm{NaOH + HCl}$'],
    correctAnswer: '$\\mathrm{KNO_3 + NaCl}$',
  },
  {
    question: 'Как се открива карбонатен йон?',
    answers: ['с киселина – отделя се газ, който размътва варната вода', 'с $\\mathrm{AgNO_3}$ – жълта утайка, неразтворима в киселини', 'с фенолфталеин – малинов цвят', 'по жълтия цвят на пламъка'],
    correctAnswer: 'с киселина – отделя се газ, който размътва варната вода',
  },
  {
    question: 'Колко грама AgCl се утаяват от разтвор с 0,1 mol NaCl и излишък от $\\mathrm{AgNO_3}$?',
    answers: ['$14{,}35\\ \\mathrm{g}$', '$5{,}85\\ \\mathrm{g}$', '$143{,}5\\ \\mathrm{g}$', '$7{,}18\\ \\mathrm{g}$'],
    correctAnswer: '$14{,}35\\ \\mathrm{g}$',
  },
];

// ---------- Страница ----------

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 align-top';

const ionTex = (i: Ion) => `${formulaTex(i.f)}^{${Math.abs(i.charge) === 1 ? '' : Math.abs(i.charge)}${i.charge > 0 ? '+' : '-'}}`;
const SOL_CLASS = {
  р: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  м: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  н: 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  '–': 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const CATION_TESTS: [string, string, string][] = [
  ['$\\mathrm{Li^+}$, $\\mathrm{Na^+}$, $\\mathrm{K^+}$, $\\mathrm{Ca^{2+}}$, $\\mathrm{Sr^{2+}}$, $\\mathrm{Ba^{2+}}$, $\\mathrm{Cu^{2+}}$', 'пламък', 'характерен цвят на пламъка (лабораторията по-долу)'],
  ['$\\mathrm{NH_4^+}$', '$\\mathrm{NaOH}$, затопляне', 'амоняк: мирис и посиняване на влажна червена лакмусова хартия'],
  ['$\\mathrm{Ag^+}$', '$\\mathrm{Cl^-}$ ($\\mathrm{HCl}$ или $\\mathrm{NaCl}$)', 'бяла утайка $\\mathrm{AgCl}$, разтворима в амоняк'],
  ['$\\mathrm{Ba^{2+}}$', '$\\mathrm{SO_4^{2-}}$ ($\\mathrm{H_2SO_4}$)', 'бяла утайка $\\mathrm{BaSO_4}$, неразтворима в киселини'],
  ['$\\mathrm{Cu^{2+}}$', '$\\mathrm{NaOH}$', 'синя утайка $\\mathrm{Cu(OH)_2}$'],
  ['$\\mathrm{Fe^{2+}}$', '$\\mathrm{NaOH}$', 'бледозелена утайка $\\mathrm{Fe(OH)_2}$, която на въздуха покафенява'],
  ['$\\mathrm{Fe^{3+}}$', '$\\mathrm{NaOH}$ или $\\mathrm{KSCN}$', 'червено-кафява утайка $\\mathrm{Fe(OH)_3}$; с тиоцианат – кървавочервен разтвор'],
  ['$\\mathrm{Al^{3+}}$, $\\mathrm{Zn^{2+}}$', '$\\mathrm{NaOH}$ на капки', 'бяла утайка, която се разтваря в излишък от основата'],
];

const ANION_TESTS: [string, string, string][] = [
  ['$\\mathrm{Cl^-}$', '$\\mathrm{AgNO_3}$ + $\\mathrm{HNO_3}$', 'бяла „сиренеста“ утайка $\\mathrm{AgCl}$'],
  ['$\\mathrm{Br^-}$', '$\\mathrm{AgNO_3}$ + $\\mathrm{HNO_3}$', 'бледожълта утайка $\\mathrm{AgBr}$'],
  ['$\\mathrm{I^-}$', '$\\mathrm{AgNO_3}$ + $\\mathrm{HNO_3}$', 'жълта утайка $\\mathrm{AgI}$'],
  ['$\\mathrm{SO_4^{2-}}$', '$\\mathrm{BaCl_2}$', 'бяла утайка $\\mathrm{BaSO_4}$, неразтворима в $\\mathrm{HCl}$ и $\\mathrm{HNO_3}$'],
  ['$\\mathrm{CO_3^{2-}}$', '$\\mathrm{HCl}$', 'газ без мирис ($\\mathrm{CO_2}$), който размътва варната вода'],
  ['$\\mathrm{PO_4^{3-}}$', '$\\mathrm{AgNO_3}$', 'жълта утайка $\\mathrm{Ag_3PO_4}$, разтворима в $\\mathrm{HNO_3}$'],
  ['$\\mathrm{NO_3^-}$', '$\\mathrm{Cu}$ + конц. $\\mathrm{H_2SO_4}$, затопляне', 'кафяв газ $\\mathrm{NO_2}$'],
  ['$\\mathrm{OH^-}$', 'фенолфталеин', 'малинов цвят'],
];

function TestTable({ rows, head }: { rows: [string, string, string][]; head: string }) {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>{head}</th>
            <th className={th}>Реактив</th>
            <th className={th}>Какво се вижда</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([ion, reagent, sign]) => (
            <tr key={ion}>
              <td className={td}>
                <MathText>{ion}</MathText>
              </td>
              <td className={td}>
                <MathText>{reagent}</MathText>
              </td>
              <td className={td}>
                <MathText>{sign}</MathText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QualitativeAnalysis() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Йонни реакции и качествен анализ</h1>

        <div className="bg-gradient-to-br from-amber-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🔥 През 1859 г. в Хайделберг химикът Роберт Бунзен и физикът Густав Кирхоф насочват светлината от почти безцветния пламък на
            горелката на Бунзен през призма. Всеки метал дава свои цветни линии – като пръстов отпечатък. Година по-късно в <Term id="spectrum">спектъра</Term> на
            изпарена минерална вода те виждат две сини линии, които не принадлежат на нито един познат елемент. Така е открит цезият (от
            латинското <em>caesius</em> – небесносин), а скоро след него и рубидият. От десетки тонове вода получават едва няколко грама
            от новата сол – но пламъкът я „вижда“ веднага. Как разпознаваме веществата, без да ги виждаме?
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Електролити и електролитна дисоциация</h2>
          <Theorem
            type="definition"
            title="Електролити"
            description="Електролити са веществата, чиито разтвори (или стопилки) провеждат електричен ток. При разтваряне те се разпадат на йони – това е електролитната дисоциация, например $\mathrm{NaCl \to Na^+ + Cl^-}$. Веществата, които във вода остават молекули (захар, етанол), са неелектролити."
          />
          <p className={text}>
            Солите, <Term id="strong-acid">силните киселини</Term> (<Tex>{'\\mathrm{HCl}'}</Tex>, <Tex>{'\\mathrm{HNO_3}'}</Tex>, <Tex>{'\\mathrm{H_2SO_4}'}</Tex>) и
            основите на <Term id="alkali-metals">алкалните метали</Term> и на Ca, Sr, Ba се разпадат на <Term id="ion">йони</Term> почти напълно – те са <strong>силни електролити</strong>.{' '}
            <strong>Слабите електролити</strong> – оцетна <Term id="acid">киселина</Term>, амоняк във вода, въглена киселина, самата вода – са дисоциирани само
            отчасти; повечето им частици остават молекули. Колко отчасти, показва{' '}
            <Term id="degree-of-dissociation">степента на дисоциация</Term> – подробно в урока{' '}
            <Link to="/chemistry/reactions/acids-bases" className={link}>
              Киселини, основи и pH
            </Link>
            .
          </p>
          <Example
            description="Напишете дисоциацията на $\mathrm{Al_2(SO_4)_3}$. Каква е концентрацията на всеки йон в разтвор с $c = 0{,}1\ \mathrm{mol/L}$?"
            steps={[
              '$\\mathrm{Al_2(SO_4)_3 \\to 2Al^{3+} + 3SO_4^{2-}}$ – индексите от формулата стават коефициенти пред йоните, а сулфатната група остава цяла.',
              '$c(\\mathrm{Al^{3+}}) = 2 \\cdot 0{,}1 = 0{,}2\\ \\mathrm{mol/L}$, $c(\\mathrm{SO_4^{2-}}) = 3 \\cdot 0{,}1 = 0{,}3\\ \\mathrm{mol/L}$',
              'Проверка за заряда: $0{,}2 \\cdot 3 = 0{,}3 \\cdot 2$ – разтворът е електронеутрален.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Йонни уравнения</h2>
          <p className={text}>
            Щом солите в <Term id="solution">разтвор</Term> са йони, реакцията между два разтвора всъщност е реакция между йони. Записваме я по три начина:
          </p>
          <Example
            description="Смесваме разтвори на калциев хлорид и натриев карбонат. Напишете молекулното, пълното и съкратеното йонно уравнение."
            steps={[
              'Молекулно: $\\mathrm{CaCl_2 + Na_2CO_3 \\to CaCO_3\\downarrow + 2NaCl}$',
              'Пълно йонно – силните електролити се пишат като йони, утайката – с формула: $\\mathrm{Ca^{2+}} + \\mathrm{2Cl^-} + \\mathrm{2Na^+} + \\mathrm{CO_3^{2-}} \\to \\mathrm{CaCO_3}\\downarrow + \\mathrm{2Na^+} + \\mathrm{2Cl^-}$',
              'Йоните $\\mathrm{Na^+}$ и $\\mathrm{Cl^-}$ са от двете страни – те не участват. Съкратено: $\\mathrm{Ca^{2+} + CO_3^{2-} \\to CaCO_3\\downarrow}$',
            ]}
          />
          <Theorem
            title="Съкратено йонно уравнение"
            description="Съкратеното йонно уравнение показва само частиците, които наистина реагират. Йоните, които са еднакви от двете страни, са йони-наблюдатели и се съкращават. Като молекули (с формули) се пишат утайките, газовете, слабите електролити и водата. В изравненото уравнение и атомите, и зарядите от двете страни са равни."
          />
          <p className={text}>
            Едно съкратено уравнение описва много реакции: <Tex>{'\\mathrm{Ca^{2+} + CO_3^{2-} \\to CaCO_3\\downarrow}'}</Tex> е и{' '}
            <Tex>{'\\mathrm{Ca(NO_3)_2 + K_2CO_3}'}</Tex>, и <Tex>{'\\mathrm{CaCl_2 + (NH_4)_2CO_3}'}</Tex>. Затова химиците казват „реакция
            за калциеви йони“, а не „реакция за калциев хлорид“.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Кога протича йонна реакция</h2>
          <Theorem
            title="Условия за протичане на йонни реакции"
            description="Реакция между йоните в разтвор протича докрай, когато се образува (1) утайка – слабо разтворимо вещество; (2) газ, който напуска разтвора; или (3) слаб електролит, най-често вода. Ако нито едно от трите не става, йоните само се смесват."
          />
          <Example
            description="Напишете съкратените йонни уравнения: а) $\mathrm{Na_2CO_3 + HCl}$; б) $\mathrm{NaOH + HNO_3}$; в) $\mathrm{KNO_3 + NaCl}$."
            steps={[
              'а) Газ: $\\mathrm{CO_3^{2-} + 2H^+ \\to H_2O + CO_2\\uparrow}$',
              'б) Слаб електролит – вода: $\\mathrm{H^+ + OH^- \\to H_2O}$. Това е съкратеното уравнение на всяка неутрализация между силна киселина и силна основа.',
              'в) Всички възможни продукти ($\\mathrm{KCl}$, $\\mathrm{NaNO_3}$) са разтворими силни електролити – реакция няма, в разтвора има четири вида йони.',
            ]}
          />
          <p className={text}>
            Изпробвай в лабораторията: избери сол на <Term id="cation">катиона</Term> и сол на <Term id="anion">аниона</Term>, промени обемите и концентрациите и виж кога има утайка, какво е
            съкратеното уравнение и колко грама утайка се получават. Някои двойки ще те изненадат – там протича не обменна, а{' '}
            <Link to="/chemistry/reactions/redox" className={link}>
              окислително-редукционна
            </Link>{' '}
            реакция.
          </p>
          <MixingLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Таблица на разтворимостта</h2>
          <p className={text}>
            Как да знаем дали ще има утайка? От таблицата на разтворимостта на основите и солите във вода. „Неразтворимо“ в нея означава
            приблизително под 0,01 g в 100 g вода – съвсем неразтворими вещества няма. Количественото описание е{' '}
            <Term id="solubility-product">произведението на разтворимостта</Term> <Tex>{'K_{sp}'}</Tex> от урока{' '}
            <Link to="/chemistry/reactions/equilibrium" className={link}>
              Химично равновесие
            </Link>
            .
          </p>
          <div className="overflow-x-auto mb-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="text-sm border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1.5" />
                  {ANIONS.map(a => (
                    <th key={a.id} className="px-2 py-1.5 font-semibold text-center">
                      <Tex>{ionTex(a)}</Tex>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATIONS.map(c => (
                  <tr key={c.id}>
                    <th className="px-2 py-1 font-semibold text-left whitespace-nowrap">
                      <Tex>{ionTex(c)}</Tex>
                    </th>
                    {ANIONS.map(a => {
                      const { s } = solubility(c.id, a.id);
                      return (
                        <td key={a.id} className={`px-2 py-1 text-center border border-white dark:border-gray-900 ${SOL_CLASS[s]}`}>
                          {s}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            р – разтворимо, м – слабо разтворимо, н – практически неразтворимо, „–“ – във вода не съществува (разлага се или реагира с
            водата, например <Tex>{'\\mathrm{Fe_2(CO_3)_3}'}</Tex> и <Tex>{'\\mathrm{Al_2(CO_3)_3}'}</Tex>). Таблиците в различните
            учебници се различават в някои клетки – границата между „м“ и „н“ е условна.
          </p>
          <p className={text}>
            Полезни правила: всички соли на натрия, калия и амония и всички нитрати са разтворими. Повечето хлориди са разтворими (без{' '}
            <Tex>{'\\mathrm{AgCl}'}</Tex> и отчасти <Tex>{'\\mathrm{PbCl_2}'}</Tex>), повечето сулфати – също (без бариевия и оловния,
            калциевият е слабо разтворим). Карбонатите, фосфатите и <Term id="hydroxide">хидроксидите</Term> са обикновено неразтворими – освен на алкалните метали и
            амония.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Откриване на катиони</h2>
          <Theorem
            type="definition"
            title="Качествен анализ"
            description="Качественият анализ отговаря на въпроса какво има в пробата, а количественият – колко. За всеки йон се търси характерна реакция: такава, която дава лесно видим признак (утайка с определен цвят, газ, оцветяване на разтвора или на пламъка) и не се получава с другите йони в пробата."
          />
          <TestTable rows={CATION_TESTS} head="Катион" />
          <p className={text}>
            Най-бързият начин да се открият металите от първа и втора група е оцветяването на пламъка: на тел от платина или нихром се взема
            малко от солта и се внася в пламъка на горелката. В горещия пламък атомите на метала се възбуждат и излъчват светлина с точно
            определени дължини на вълната – същото явление като{' '}
            <Link to="/physics/modern/atom" className={link}>
              линейните спектри
            </Link>{' '}
            от физиката.
          </p>
          <FlameTestLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Откриване на аниони</h2>
          <TestTable rows={ANION_TESTS} head="Анион" />
          <p className={text}>
            Защо при откриването на халогениди към сребърния нитрат се добавя азотна киселина? Без нея с йоните на сребро ще се утаят и
            карбонатите, и фосфатите. В кисела среда тези утайки се разтварят, а <Tex>{'\\mathrm{AgCl}'}</Tex>,{' '}
            <Tex>{'\\mathrm{AgBr}'}</Tex> и <Tex>{'\\mathrm{AgI}'}</Tex> – не. По същата причина сулфатът се доказва с бариев хлорид в
            присъствие на солна киселина: <Tex>{'\\mathrm{BaCO_3}'}</Tex> се разтваря, а <Tex>{'\\mathrm{BaSO_4}'}</Tex> остава.
          </p>
          <Example
            description="Как да докажем, че варовикът е карбонат? Напишете уравненията."
            steps={[
              'Капваме солна киселина – вещество „кипи“: $\\mathrm{CaCO_3 + 2H^+ \\to Ca^{2+} + H_2O + CO_2\\uparrow}$',
              'Прекарваме газа през варна вода (разтвор на $\\mathrm{Ca(OH)_2}$) – тя се размътва: $\\mathrm{Ca^{2+} + 2OH^- + CO_2 \\to CaCO_3\\downarrow + H_2O}$',
              'Газ без мирис, който размътва варната вода, е $\\mathrm{CO_2}$. (Серният диоксид също размътва варната вода, но има остра миризма.)',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Шишета без етикети</h2>
          <p className={text}>
            Класическа олимпиадна задача: имате няколко шишета с известни вещества, но етикетите са паднали, а други реактиви няма. Решението
            е да смесвате пробите по двойки и да запишете наблюденията в таблица. Всяко вещество дава свой „отпечатък“ – колко утайки, газове
            и „нищо“ дава с останалите.
          </p>
          <Example
            description="В три шишета без етикети има разтвори на NaCl, Na₂CO₃ и Na₂SO₄. Как да ги разпознаем само с разтвор на BaCl₂ и солна киселина?"
            steps={[
              'Към проба от всяко шише добавяме $\\mathrm{BaCl_2}$. Където няма утайка – това е $\\mathrm{NaCl}$.',
              'В другите две се образуват бели утайки: $\\mathrm{BaCO_3}$ и $\\mathrm{BaSO_4}$.',
              'Добавяме солна киселина: утайката, която се разтваря с отделяне на газ, е $\\mathrm{BaCO_3}$ – значи там е $\\mathrm{Na_2CO_3}$. Тази, която остава, е $\\mathrm{BaSO_4}$.',
            ]}
          />
          <UnknownBottlesLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Колко? Гравиметричен анализ</h2>
          <p className={text}>
            Утайките служат не само за откриване, но и за измерване. При гравиметричния (тегловния) анализ търсеният йон се утаява напълно с
            излишък от реактив, утайката се филтрува, промива, изсушава и претегля. От масата ѝ по формулата се пресмята колко е бил йонът.
          </p>
          <Theorem
            title="Пресмятане по масата на утайката"
            description="Ако в една формулна единица на утайката има $k$ атома (или йона) X, то $m(\mathrm{X}) = m_{\text{утайка}} \cdot \frac{k \cdot M(\mathrm{X})}{M_{\text{утайка}}}$. Например за сяра, утаена като $\mathrm{BaSO_4}$: $m(\mathrm{S}) = m(\mathrm{BaSO_4}) \cdot \frac{32}{233}$."
          />
          <Example
            description="Проба от 0,5 g тор се разтваря и сулфатът в нея се утаява с излишък от BaCl₂. Утайката BaSO₄ тежи 0,699 g. Каква е масовата част на сярата в тора?"
            steps={[
              '$n(\\mathrm{BaSO_4}) = \\frac{0{,}699}{233} = 0{,}003\\ \\mathrm{mol}$ – толкова е и $n(\\mathrm{S})$',
              '$m(\\mathrm{S}) = 0{,}003 \\cdot 32 = 0{,}096\\ \\mathrm{g}$',
              '$w(\\mathrm{S}) = \\frac{0{,}096}{0{,}5} = 19{,}2\\%$',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 9. Тренажор
          </h2>
          <p className={text}>Маса на утайка, концентрация на йони в разтвор, смесване на разтвори и обем на отделен газ. Десетичните отговори въвеждай като 1,435.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. Анализи около нас</h2>
          <p className={text}>Минерална вода, болница, чайник, фойерверки и яйчени черупки – навсякъде, където трябва да разберем какво има в една проба.</p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Утайка в йонен вид', '$\\mathrm{Ca^{2+} + CO_3^{2-} \\to Ca^{2+} + CO_3^{2-}}$', 'Утайките, газовете, слабите електролити и водата се пишат с формули: $\\mathrm{CaCO_3\\downarrow}$.'],
              ['Индекс и коефициент', '$\\mathrm{Na_2SO_4 \\to Na_2^+ + SO_4^{2-}}$', '$\\mathrm{Na_2SO_4 \\to 2Na^+ + SO_4^{2-}}$ – индексът става коефициент.'],
              ['Разпадане на сложния йон', '$\\mathrm{SO_4^{2-} \\to S^{6+} + 4O^{2-}}$', 'Сулфатната, нитратната, карбонатната група остават цели йони.'],
              ['Слабата киселина като йони', '$\\mathrm{CH_3COOH}$ се пише като $\\mathrm{H^+ + CH_3COO^-}$', 'Слабите електролити се пишат като молекули: $\\mathrm{CH_3COOH + OH^- \\to CH_3COO^- + H_2O}$.'],
              ['Всяко смесване е реакция', '$\\mathrm{KNO_3 + NaCl \\to KCl + NaNO_3}$', 'Няма утайка, газ или слаб електролит – йоните само се смесват.'],
              ['Жълт пламък = натрий', 'Пламъкът на калиевата сол е жълт, значи има само натрий.', 'Следи от натрий скриват калия; гледай през кобалтово стъкло.'],
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
              <Task id="a1" number={1} color="border-green-500" question="Напишете молекулното и съкратеното йонно уравнение на реакцията между $\mathrm{BaCl_2}$ и $\mathrm{Na_2SO_4}$. Колко грама утайка се получават от 0,1 mol $\mathrm{BaCl_2}$ с излишък от натриев сулфат?" check={[23.3]} ask={['утайка, g']}>
                <p><Tex>{'\\mathrm{BaCl_2 + Na_2SO_4 \\to BaSO_4\\downarrow + 2NaCl}'}</Tex></p>
                <p><Tex>{'\\mathrm{Ba^{2+} + SO_4^{2-} \\to BaSO_4\\downarrow}'}</Tex></p>
                <p><Tex>{'m = 0{,}1 \\cdot 233 = 23{,}3\\ \\mathrm{g}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Каква е концентрацията на всеки от йоните в разтвор на $\mathrm{Al_2(SO_4)_3}$ с концентрация $0{,}2\ \mathrm{mol/L}$?" check={[0.4, 0.6]} ask={['$c(\\mathrm{Al^{3+}})$, mol/L', '$c(\\mathrm{SO_4^{2-}})$, mol/L']}>
                <p><Tex>{'\\mathrm{Al_2(SO_4)_3 \\to 2Al^{3+} + 3SO_4^{2-}}'}</Tex></p>
                <p><Tex>{'c(\\mathrm{Al^{3+}}) = 2 \\cdot 0{,}2 = 0{,}4\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'c(\\mathrm{SO_4^{2-}}) = 3 \\cdot 0{,}2 = 0{,}6\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Смесват се разтвори с 0,1 mol $\mathrm{AgNO_3}$ и 0,1 mol NaCl. Кои йони остават в разтвора и колко грама утайка се образуват?" check={[14.35]} ask={['AgCl, g']}>
                <p><Tex>{'\\mathrm{Ag^+ + Cl^- \\to AgCl\\downarrow}'}</Tex> – йоните реагират 1 : 1 и изчезват напълно.</p>
                <p>В разтвора остават йоните-наблюдатели <Tex>{'\\mathrm{Na^+}'}</Tex> и <Tex>{'\\mathrm{NO_3^-}'}</Tex> (по 0,1 mol).</p>
                <p><Tex>{'m(\\mathrm{AgCl}) = 0{,}1 \\cdot 143{,}5 = 14{,}35\\ \\mathrm{g}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Смесват се 50 mL разтвор на $\mathrm{AgNO_3}$ с концентрация 0,2 mol/L и 50 mL разтвор на NaCl с концентрация 0,3 mol/L. Колко грама утайка се получават и каква е концентрацията на хлоридните йони след реакцията?" check={[1.435, 0.05]} ask={['AgCl, g', '$c(\\mathrm{Cl^-})$, mol/L']}>
                <p><Tex>{'n(\\mathrm{Ag^+}) = 0{,}2 \\cdot 0{,}05 = 0{,}01\\ \\mathrm{mol}'}</Tex>, <Tex>{'n(\\mathrm{Cl^-}) = 0{,}3 \\cdot 0{,}05 = 0{,}015\\ \\mathrm{mol}'}</Tex></p>
                <p>Сребърните йони са в недостиг: <Tex>{'m(\\mathrm{AgCl}) = 0{,}01 \\cdot 143{,}5 = 1{,}435\\ \\mathrm{g}'}</Tex></p>
                <p>Остават <Tex>{'0{,}005\\ \\mathrm{mol}\\ \\mathrm{Cl^-}'}</Tex> в 100 mL: <Tex>{'c = \\frac{0{,}005}{0{,}1} = 0{,}05\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Смес от NaCl и NaBr с маса 2,2 g се разтваря и се обработва с излишък от $\mathrm{AgNO_3}$. Получават се 4,75 g утайка. Каква е масовата част на NaCl в сместа?" check={[53.2]} ask={['$w(\\mathrm{NaCl})$, %']}>
                <p>Нека NaCl е <Tex>{'x'}</Tex> mol, NaBr – <Tex>{'y'}</Tex> mol. Утайката е смес от AgCl и AgBr.</p>
                <p><Tex>{'58{,}5x + 103y = 2{,}2,\\quad 143{,}5x + 188y = 4{,}75'}</Tex></p>
                <p>Решението е <Tex>{'x = 0{,}02'}</Tex>, <Tex>{'y = 0{,}01'}</Tex>: <Tex>{'m(\\mathrm{NaCl}) = 1{,}17\\ \\mathrm{g}'}</Tex>, <Tex>{'w = \\frac{1{,}17}{2{,}2} \\approx 53{,}2\\%'}</Tex></p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="0,555 g безводен $\mathrm{CaCl_2}$ се разтварят и разтворът се довежда до 250 mL. Каква е концентрацията на калциевите и на хлоридните йони?" check={[0.02, 0.04]} ask={['$c(\\mathrm{Ca^{2+}})$, mol/L', '$c(\\mathrm{Cl^-})$, mol/L']}>
                <p><Tex>{`M(\\mathrm{CaCl_2}) = ${molarMass('CaCl2')}\\ \\mathrm{g/mol}`}</Tex>, <Tex>{'n = \\frac{0{,}555}{111} = 0{,}005\\ \\mathrm{mol}'}</Tex></p>
                <p><Tex>{'c(\\mathrm{CaCl_2}) = \\frac{0{,}005}{0{,}25} = 0{,}02\\ \\mathrm{mol/L}'}</Tex></p>
                <p><Tex>{'c(\\mathrm{Ca^{2+}}) = 0{,}02\\ \\mathrm{mol/L}'}</Tex>, <Tex>{'c(\\mathrm{Cl^-}) = 0{,}04\\ \\mathrm{mol/L}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Безводна сол X оцветява пламъка жълтозелено. Разтворът ѝ дава с $\mathrm{AgNO_3}$ бяла утайка, неразтворима в азотна киселина. От 2,08 g X се получават 2,87 g от тази утайка. Намерете моларната маса на X. Коя е солта?" check={[208]} ask={['$M(\\mathrm{X})$, g/mol']}>
                <p>Пламъкът показва барий, бялата утайка с <Tex>{'\\mathrm{Ag^+}'}</Tex> – хлорид. Предполагаме <Tex>{'\\mathrm{BaCl_2}'}</Tex>.</p>
                <p><Tex>{'n(\\mathrm{AgCl}) = \\frac{2{,}87}{143{,}5} = 0{,}02\\ \\mathrm{mol}'}</Tex>; в <Tex>{'\\mathrm{BaCl_2}'}</Tex> има по 2 хлорида, значи <Tex>{'n(\\mathrm{X}) = 0{,}01\\ \\mathrm{mol}'}</Tex>.</p>
                <p><Tex>{'M = \\frac{2{,}08}{0{,}01} = 208\\ \\mathrm{g/mol}'}</Tex> – точно колкото <Tex>{'M(\\mathrm{BaCl_2}) = 137 + 71'}</Tex>. Предположението се потвърждава.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="$K_{sp}(\mathrm{PbI_2}) \approx 9{,}8 \cdot 10^{-9}$ при 25 °C. В разтвор концентрацията на $\mathrm{Pb^{2+}}$ е $0{,}001\ \mathrm{mol/L}$. При каква най-малка концентрация на йодидни йони започва да се утаява $\mathrm{PbI_2}$? (Отговорът – в mmol/L.)" check={[3.13]} ask={['$c(\\mathrm{I^-})$, mmol/L']}>
                <p>Утайка се образува, когато <Tex>{'[\\mathrm{Pb^{2+}}][\\mathrm{I^-}]^2 > K_{sp}'}</Tex>.</p>
                <p><Tex>{'[\\mathrm{I^-}] = \\sqrt{\\frac{9{,}8 \\cdot 10^{-9}}{0{,}001}} = \\sqrt{9{,}8 \\cdot 10^{-6}} \\approx 3{,}13 \\cdot 10^{-3}\\ \\mathrm{mol/L}'}</Tex></p>
                <p>Около 3,13 mmol/L. Под тази концентрация разтворът остава бистър, макар че по таблицата <Tex>{'\\mathrm{PbI_2}'}</Tex> е „неразтворим“.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="2,44 g от кристалохидрат $\mathrm{BaCl_2 \cdot xH_2O}$ се разтварят и барият се утаява напълно с излишък от сярна киселина. Получават се 2,33 g $\mathrm{BaSO_4}$. Колко молекули вода се падат на една формулна единица ($x$)?" check={[2]} ask={['$x$']}>
                <p><Tex>{'n(\\mathrm{BaSO_4}) = \\frac{2{,}33}{233} = 0{,}01\\ \\mathrm{mol}'}</Tex> – толкова е и кристалохидратът.</p>
                <p><Tex>{'M = \\frac{2{,}44}{0{,}01} = 244\\ \\mathrm{g/mol}'}</Tex></p>
                <p><Tex>{'x = \\frac{244 - 208}{18} = 2'}</Tex> – формулата е <Tex>{'\\mathrm{BaCl_2 \\cdot 2H_2O}'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>14. Обобщение</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Електролитите във вода се разпадат на йони; силните – почти напълно, слабите – отчасти</li>
              <li>✓ В съкратеното йонно уравнение остават само реагиращите частици; утайките, газовете, слабите електролити и водата се пишат с формули</li>
              <li>✓ Йонна реакция протича, когато се образува утайка, газ или слаб електролит</li>
              <li>✓ Таблицата на разтворимостта казва кога ще има утайка; соли на Na⁺, K⁺, NH₄⁺ и нитратите са разтворими</li>
              <li>✓ Характерни реакции: пламък за металите от 1. и 2. група, NaOH за Cu²⁺, Fe²⁺, Fe³⁺ и NH₄⁺, AgNO₃ за халогенидите, BaCl₂ за сулфатите, киселина за карбонатите</li>
              <li>✓ Гравиметрия: <Tex>{'n(\\text{утайка}) = m/M'}</Tex>, а по формулата на утайката – количеството на търсения йон</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              „Златен дъжд“: оловният йодид <Tex>{'\\mathrm{PbI_2}'}</Tex> е много по-разтворим в гореща вода, отколкото в студена. Ако
              жълтата утайка се разтвори при кипене и разтворът се остави бавно да изстине, от него започват да падат блестящи златисти
              шестоъгълни люспички – като златен дъжд в епруветката. Опитът е красив, но се прави само от учител: оловните съединения са
              отровни.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
