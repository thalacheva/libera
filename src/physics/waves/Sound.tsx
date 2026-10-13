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
import BeatsLab from './BeatsLab';
import HarmonicsLab from './HarmonicsLab';
import ToneLab from './ToneLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.25 → 0{,}25. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 7);
  if (kind === 0) {
    const f = pick([85, 170, 340, 680, 1360]);
    return {
      tex: `v = 340\\ \\mathrm{m/s}, \\quad f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Дължина на вълната: $\\lambda = ?\\ \\mathrm{m}$',
      num: 340,
      den: f,
      steps: [`$\\lambda = \\frac{v}{f} = \\frac{340}{${f}} = ${dec(340 / f)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 1) {
    const t10 = pick([4, 10, 20, 30]);
    return {
      tex: `t = ${dec(t10 / 10)}\\ \\mathrm{s}, \\quad v = 340\\ \\mathrm{m/s}`,
      ask: 'Ехото се връща след $t$. На колко метра е стената?',
      num: 340 * t10,
      den: 20,
      steps: ['Звукът изминава пътя два пъти – до стената и обратно: $2d = vt$', `$d = \\frac{340 \\cdot ${dec(t10 / 10)}}{2} = ${dec((34 * t10) / 2)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 2) {
    const t = pick([3, 6, 9, 12]);
    return {
      tex: `t = ${t}\\ \\mathrm{s}, \\quad v = 340\\ \\mathrm{m/s}`,
      ask: 'Гръмът се чува $t$ секунди след светкавицата. На колко km е мълнията?',
      num: 340 * t,
      den: 1000,
      steps: ['Светлината идва практически веднага, закъснява само звукът.', `$d = vt = 340 \\cdot ${t} = ${340 * t}\\ \\mathrm{m} = ${dec((340 * t) / 1000)}\\ \\mathrm{km}$`],
    };
  }
  if (kind === 3) {
    const n = randInt(1, 6);
    return {
      tex: `\\Delta L = ${10 * n}\\ \\mathrm{dB}`,
      ask: 'Колко пъти е по-голям интензитетът? $\\frac{I_2}{I_1} = ?$',
      num: 10 ** n,
      den: 1,
      steps: ['Всеки 10 dB означават 10 пъти по-голям интензитет.', `$\\frac{I_2}{I_1} = 10^{${10 * n}/10} = 10^{${n}} = ${10 ** n}$`],
    };
  }
  if (kind === 4) {
    const k = pick([-2, -1, 1, 2]);
    return {
      tex: `f = 440\\ \\mathrm{Hz}`,
      ask: `Тонът ${Math.abs(k) === 1 ? 'една октава' : 'две октави'} ${k > 0 ? 'по-високо' : 'по-ниско'}: $f' = ?\\ \\mathrm{Hz}$`,
      num: 440 * 2 ** k,
      den: 1,
      steps: ['Една октава нагоре удвоява честотата, надолу – я разполовява.', `$f' = 440 \\cdot 2^{${k}} = ${440 * 2 ** k}\\ \\mathrm{Hz}$`],
    };
  }
  if (kind === 5) {
    const [L, v, n] = [pick([0.5, 0.25, 1]), pick([200, 300, 400]), randInt(1, 3)];
    return {
      tex: `L = ${dec(L)}\\ \\mathrm{m}, \\quad v = ${v}\\ \\mathrm{m/s}`,
      ask: `Струна: честота на ${n}-ия хармоник $f_${n} = ?\\ \\mathrm{Hz}$`,
      num: (n * v) / (2 * L),
      den: 1,
      steps: [`$f_n = \\frac{nv}{2L}$`, `$f_${n} = \\frac{${n} \\cdot ${v}}{2 \\cdot ${dec(L)}} = ${(n * v) / (2 * L)}\\ \\mathrm{Hz}$`],
    };
  }
  if (kind === 6) {
    let f2 = randInt(434, 446);
    if (f2 === 440) f2 = 443;
    return {
      tex: `f_1 = 440\\ \\mathrm{Hz}, \\quad f_2 = ${f2}\\ \\mathrm{Hz}`,
      ask: 'Биения в секунда: $f_b = ?\\ \\mathrm{Hz}$',
      num: Math.abs(f2 - 440),
      den: 1,
      steps: [`$f_b = |f_1 - f_2| = |440 - ${f2}| = ${Math.abs(f2 - 440)}\\ \\mathrm{Hz}$`],
    };
  }
  const L = pick([0.85, 0.5, 0.25, 0.17]);
  return {
    tex: `L = ${dec(L)}\\ \\mathrm{m}, \\quad v = 340\\ \\mathrm{m/s}`,
    ask: 'Тръба, затворена в единия край: основен тон $f_1 = ?\\ \\mathrm{Hz}$',
    num: 340,
    den: 4 * L,
    steps: ['В затворения край има възел, в отворения – пучност: $L = \\frac{\\lambda}{4}$', `$f_1 = \\frac{v}{4L} = \\frac{340}{4 \\cdot ${dec(L)}} = ${dec(340 / (4 * L))}\\ \\mathrm{Hz}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '⛈️ Колко далеч е бурята?',
    problem: 'Виждаш светкавица и броиш 7,5 s до гърма. Скоростта на звука е 343 m/s. На какво разстояние е мълнията?',
    solution: ['Светлината стига до теб почти мигновено, затова закъснява само звукът.', '$d = vt = 343 \\cdot 7{,}5 \\approx 2570\\ \\mathrm{m} \\approx 2{,}57\\ \\mathrm{km}$', 'Правило за наум: секундите, разделени на 3, дават километрите.'],
    answer: '$\\approx 2{,}57\\ \\mathrm{km}$',
    check: [2.57],
    ask: ['разстояние, km'],
  },
  {
    title: '🏔️ Ехо в планината',
    problem: 'Викаш срещу скала и чуваш ехото след 2,4 s. На колко метра е скалата? (Скорост на звука 340 m/s.)',
    solution: ['Звукът отива до скалата и се връща: $2d = vt$', '$d = \\frac{340 \\cdot 2{,}4}{2} = 408\\ \\mathrm{m}$'],
    answer: '$408\\ \\mathrm{m}$',
    check: [408],
    ask: ['разстояние, m'],
  },
  {
    title: '🐬 Сонар',
    problem: 'Сонарът на кораб изпраща ултразвуков сигнал към дъното и го получава обратно след 0,8 s. Скоростта на звука в морската вода е около 1500 m/s. Колко е дълбоко морето?',
    solution: ['$2h = vt \\Rightarrow h = \\frac{1500 \\cdot 0{,}8}{2} = 600\\ \\mathrm{m}$'],
    answer: '$600\\ \\mathrm{m}$',
    check: [600],
    ask: ['дълбочина, m'],
  },
  {
    title: '🎸 Китарна струна',
    problem: 'Най-дебелата струна на китара има свободна дължина 0,648 m и основен тон ми₂ с честота 82,4 Hz. С каква скорост се разпространяват вълните по нея?',
    solution: ['Основният тон: $L = \\frac{\\lambda}{2}$, т.е. $f_1 = \\frac{v}{2L}$', '$v = 2Lf_1 = 2 \\cdot 0{,}648 \\cdot 82{,}4 \\approx 107\\ \\mathrm{m/s}$ – много по-бавно от звука във въздуха.'],
    answer: '$\\approx 107\\ \\mathrm{m/s}$',
    check: [107],
    ask: ['скорост, m/s'],
  },
  {
    title: '🔊 На концерт',
    problem: 'На 2 m от тонколона нивото на звука е 110 dB. Какво е нивото на 20 m, ако звукът се разпространява равномерно във всички посоки и не се поглъща?',
    solution: ['Интензитетът намалява с квадрата на разстоянието: 10 пъти по-далеч – 100 пъти по-слаб.', '100 пъти по-малък интензитет е $10 \\lg 100 = 20\\ \\mathrm{dB}$ по-малко.', '$L = 110 - 20 = 90\\ \\mathrm{dB}$ – все още силно; в залата отраженията го правят още по-силно.'],
    answer: '$90\\ \\mathrm{dB}$',
    check: [90],
    ask: ['ниво, dB'],
  },
  {
    title: '🎹 Пиано',
    problem: 'Ла₄ има честота 440 Hz. Тонът до₅ е 3 полутона по-високо. Каква е честотата му при равномерна темперация (всеки полутон умножава по $\\sqrt[12]{2}$)?',
    solution: ['$f = 440 \\cdot 2^{3/12} = 440 \\cdot 2^{1/4}$', '$\\approx 440 \\cdot 1{,}189 \\approx 523\\ \\mathrm{Hz}$'],
    answer: '$\\approx 523\\ \\mathrm{Hz}$',
    check: [523],
    ask: ['честота, Hz'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Каква вълна е звукът във въздуха?',
    answers: ['надлъжна вълна на налягането', 'напречна вълна', 'електромагнитна вълна', 'поток от частици въздух'],
    correctAnswer: 'надлъжна вълна на налягането',
  },
  {
    question: 'Защо в космоса не се чува експлозия на друг кораб?',
    answers: ['няма среда, по която звукът да се разпространява', 'звукът е твърде бавен', 'там е много студено', 'звукът се поглъща от светлината'],
    correctAnswer: 'няма среда, по която звукът да се разпространява',
  },
  {
    question: 'В коя среда звукът се разпространява най-бързо?',
    answers: ['в стомана', 'във вода', 'във въздух', 'във вакуум'],
    correctAnswer: 'в стомана',
  },
  {
    question: 'Как се променя тонът, ако честотата се удвои?',
    answers: ['става с октава по-висок', 'става два пъти по-силен', 'става с октава по-нисък', 'не се променя'],
    correctAnswer: 'става с октава по-висок',
  },
  {
    question: 'Нивото на звука нараства с 20 dB. Колко пъти е нараснал интензитетът?',
    answers: ['$100$', '$20$', '$2$', '$10$'],
    correctAnswer: '$100$',
  },
  {
    question: 'Какъв е приблизително обхватът на слуха на млад човек?',
    answers: ['$20\\ \\mathrm{Hz} \\text{ – } 20\\ \\mathrm{kHz}$', '$2\\ \\mathrm{Hz} \\text{ – } 2\\ \\mathrm{kHz}$', '$200\\ \\mathrm{Hz} \\text{ – } 200\\ \\mathrm{kHz}$', '$20\\ \\mathrm{kHz} \\text{ – } 20\\ \\mathrm{MHz}$'],
    correctAnswer: '$20\\ \\mathrm{Hz} \\text{ – } 20\\ \\mathrm{kHz}$',
  },
  {
    question: 'Гръмът се чува 9 s след светкавицата. Около колко далеч е мълнията?',
    answers: ['$3\\ \\mathrm{km}$', '$9\\ \\mathrm{km}$', '$1\\ \\mathrm{km}$', '$300\\ \\mathrm{m}$'],
    correctAnswer: '$3\\ \\mathrm{km}$',
  },
  {
    question: 'Кои хармоници има тръба, затворена в единия край?',
    answers: ['само нечетните', 'само четните', 'всички', 'само основния тон'],
    correctAnswer: 'само нечетните',
  },
  {
    question: 'Звучат едновременно тонове 440 Hz и 444 Hz. Колко биения в секунда се чуват?',
    answers: ['$4$', '$442$', '$884$', '$2$'],
    correctAnswer: '$4$',
  },
];

// ---------- Страница ----------

const LEVELS: [string, string][] = [
  ['0', 'праг на чуване'],
  ['20–30', 'шепот, тиха стая през нощта'],
  ['60', 'нормален разговор'],
  ['70–80', 'оживена улица, прахосмукачка'],
  ['85', 'при дълго излагане (часове всеки ден) слухът може да се увреди'],
  ['100–110', 'концерт, дискотека, слушалки на максимум'],
  ['около 120–130', 'праг на болката'],
];

const SPEEDS: [string, string][] = [
  ['въздух, 0 °C', '331'],
  ['въздух, 20 °C', '343'],
  ['хелий, 20 °C', 'около 1000'],
  ['вода', 'около 1480'],
  ['морска вода', 'около 1500'],
  ['стомана', 'около 5000–6000'],
];

const table = 'w-full text-sm sm:text-base border-collapse';
const th = 'text-left font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-3 py-1.5 border-b border-gray-100 dark:border-gray-800';

export function Sound() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Звук</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🌋 На 27 август 1883 г. вулканът Кракатау в Индонезия избухва. Според сведенията от онова време грохотът е чут на остров Родригес в
            Индийския океан – на около 4800 km – приблизително 4 часа по-късно. Барометри по целия свят отбелязват вълната на налягането, която
            обикаля Земята няколко пъти. Ако разделим 4800 km на 4 часа, получаваме около 333 m/s – почти точно <strong>скоростта на звука</strong>.
            Звукът е вълна, която носи енергия през въздуха, без самият въздух да пътува с нея.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е звук?</h2>
          <p className={text}>
            Струната на китарата, мембраната на тонколоната или гласните ни връзки трептят (виж{' '}
            <Link to="/physics/waves/oscillations" className={link}>
              Трептения
            </Link>
            ) и бутат съседния въздух. Частиците му се сгъстяват и разреждат и това смущение се предава нататък – получава се{' '}
            <strong>надлъжна вълна</strong> (общите свойства на вълните са в урока{' '}
            <Link to="/physics/waves/waves" className={link}>
              Вълни
            </Link>
            ). Всяка частица само трепти около мястото си, а вълната пренася енергия.
          </p>
          <Theorem
            type="definition"
            title="Звук"
            description="Звукът е механична надлъжна вълна – редуващи се сгъстявания и разреждания на средата (въздух, вода, твърдо тяло). Нужна му е среда: във вакуум звук няма. Връзката между скоростта, честотата и дължината на вълната е $v = \lambda f$."
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Скорост на звука, ехо и сонар</h2>
          <p className={text}>
            Във въздуха звукът се движи с около 343 m/s при 20 °C, а с повишаването на температурата – по-бързо: приблизително{' '}
            <Tex>{'v \\approx 331 + 0{,}6\\,t'}</Tex> (в m/s, <Tex>{'t'}</Tex> в °C). В течностите и твърдите тела той е много по-бърз, защото
            частиците им са по-силно свързани.
          </p>
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Среда</th>
                  <th className={th}>Скорост на звука, m/s</th>
                </tr>
              </thead>
              <tbody>
                {SPEEDS.map(([m, v]) => (
                  <tr key={m}>
                    <td className={td}>{m}</td>
                    <td className={td}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Theorem
            title="Ехо и сонар"
            description="Отразеният звук изминава пътя до препятствието два пъти, затова разстоянието е $d = \frac{vt}{2}$, където $t$ е времето до връщането на ехото. Така работят сонарите на корабите, ехолотите и прилепите."
          />
          <Example
            description="Ехото от скала се чува след 1,2 s. На какво разстояние е скалата ($v = 343\ \mathrm{m/s}$)?"
            steps={['$d = \\frac{vt}{2} = \\frac{343 \\cdot 1{,}2}{2} \\approx 206\\ \\mathrm{m}$']}
          />
          <Example
            description="Гръмът се чува 6 s след светкавицата. Колко далеч е мълнията?"
            steps={[
              'Светлината изминава няколко километра за микросекунди, затова приемаме, че я виждаме веднага.',
              '$d = vt = 343 \\cdot 6 \\approx 2060\\ \\mathrm{m} \\approx 2\\ \\mathrm{km}$ – оттук правилото „секундите делено на 3 = километри“.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Височина на тона и ноти</h2>
          <p className={text}>
            Височината на тона се определя от <strong>честотата</strong>: колкото по-голяма е, толкова по-висок е тонът. Младият човек чува
            приблизително от 20 Hz до 20 kHz; с възрастта горната граница пада и мнозина възрастни не чуват тонове над 12–15 kHz. Под 20 Hz е{' '}
            <strong>инфразвукът</strong> (слоновете общуват отчасти с него), а над 20 kHz – <strong>ултразвукът</strong>: прилепите и делфините
            се ориентират с него, а медицинските ехографи използват честоти от няколко мегахерца.
          </p>
          <Theorem
            title="Октава и полутон"
            description="Тон с двойно по-голяма честота звучи с октава по-високо. В съвременната (равномерно темперирана) музикална скала октавата е разделена на 12 равни полутона: всеки умножава честотата по $\sqrt[12]{2} \approx 1{,}0595$. Еталонът е ла₄ = 440 Hz, така че $f = 440 \cdot 2^{n/12}$, където $n$ е броят полутонове от ла₄."
          />
          <Example
            description="Каква е честотата на до₄ (средното „до“ на пианото), което е 9 полутона под ла₄?"
            steps={['$f = 440 \\cdot 2^{-9/12} \\approx 440 \\cdot 0{,}5946 \\approx 262\\ \\mathrm{Hz}$']}
          />
          <ToneLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Сила на звука и децибели</h2>
          <p className={text}>
            Колко силен е звукът, зависи от <strong>интензитета</strong> <Tex>{'I'}</Tex> – енергията, която минава за 1 s през 1 m², в{' '}
            <Tex>{'\\mathrm{W/m^2}'}</Tex>. Ухото е изключително чувствително: най-тихият звук, който чуваме, има интензитет около{' '}
            <Tex>{'10^{-12}\\ \\mathrm{W/m^2}'}</Tex>, а болезнено силният е около трилион пъти по-голям. Затова използваме логаритмична скала
            (виж{' '}
            <Link to="/algebra/logarithms" className={link}>
              Логаритми
            </Link>
            ).
          </p>
          <Theorem
            title="Ниво на звука в децибели"
            description="$L = 10 \lg \frac{I}{I_0}$, където $I_0 = 10^{-12}\ \mathrm{W/m^2}$. Всеки +10 dB означават 10 пъти по-голям интензитет, а +3 dB – приблизително двоен. За точков източник, който излъчва мощност $P$ във всички посоки, $I = \frac{P}{4\pi r^2}$: при двойно по-голямо разстояние интензитетът е 4 пъти по-малък, т.е. с около 6 dB по-малко."
          />
          <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Ниво, dB (типично)</th>
                  <th className={th}>Пример</th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map(([l, e]) => (
                  <tr key={l}>
                    <td className={td}>{l}</td>
                    <td className={td}>{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example
            description="Една прахосмукачка вдига 70 dB. Колко ще вдигат две еднакви прахосмукачки?"
            steps={['Интензитетите се събират: $I = 2I_1$', '$L = 10 \\lg \\frac{2I_1}{I_0} = 70 + 10 \\lg 2 \\approx 70 + 3 = 73\\ \\mathrm{dB}$ – а не 140 dB!']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Тембър, струни и тръби</h2>
          <p className={text}>
            Една и съща нота, изсвирена на флейта и на цигулка, звучи различно. Причината е, че истинските инструменти не трептят с една-единствена
            честота: заедно с основния тон <Tex>{'f_1'}</Tex> звучат и <strong>хармониците</strong> <Tex>{'2f_1, 3f_1, \\ldots'}</Tex> с различна
            сила. Този „рецепт“ от хармоници наричаме <strong>тембър</strong>. Хармониците се получават от стоящите вълни в струната или в
            тръбата.
          </p>
          <Theorem
            title="Собствени честоти на струни и тръби"
            description="Струна, закрепена в двата края, и тръба, отворена в двата края: $f_n = \frac{nv}{2L}$, $n = 1, 2, 3, \ldots$ Тръба, затворена в единия край: $f = \frac{(2n - 1)v}{4L}$ – само нечетните хармоници, а основният тон е октава по-нисък от този на отворена тръба със същата дължина."
          />
          <Example
            description="Китарна струна с дължина 0,65 m трябва да звучи като ла₂ = 110 Hz. С каква скорост трябва да се разпространяват вълните по нея?"
            steps={['Основният тон: $L = \\frac{\\lambda}{2}$, т.е. $f_1 = \\frac{v}{2L}$', '$v = 2Lf_1 = 2 \\cdot 0{,}65 \\cdot 110 = 143\\ \\mathrm{m/s}$', 'Скоростта зависи от опъна и дебелината на струната – затова настройваме с ключовете.']}
          />
          <Example
            description="Колко е основният тон на тръба с дължина 25 cm, затворена в единия край ($v = 343\ \mathrm{m/s}$)?"
            steps={['$f_1 = \\frac{v}{4L} = \\frac{343}{4 \\cdot 0{,}25} = 343\\ \\mathrm{Hz}$', 'Ако отворим и другия край: $f_1 = \\frac{v}{2L} = 686\\ \\mathrm{Hz}$ – октава по-високо.']}
          />
          <HarmonicsLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Биене и ефект на Доплер</h2>
          <Theorem
            title="Биене"
            description="Два тона с близки честоти $f_1$ и $f_2$ се събират в тон със средната честота, чиято сила пулсира: $f_b = |f_1 - f_2|$ пъти в секунда. Когато биенето изчезне, двата тона са еднакви."
          />
          <p className={text}>
            Музикантите настройват инструментите си точно така: свирят заедно с камертон или с друг инструмент и въртят ключа, докато биенето
            стане все по-бавно и изчезне.
          </p>
          <BeatsLab />
          <p className={text}>
            Ако източникът на звук се движи към нас, вълните се „сгъстяват“ и чуваме по-висок тон; когато се отдалечава – по-нисък. Това е{' '}
            <strong>ефектът на Доплер</strong>, познат от сирената на линейката (формулата и подробностите са в урока{' '}
            <Link to="/physics/waves/waves" className={link}>
              Вълни
            </Link>
            ). Ако източникът е по-бърз от звука, вълните се натрупват в конус и чуваме силен „звуков удар“. Обикновено за първия потвърден
            полет по-бързо от звука се сочи този на Чък Йегър с ракетния самолет Bell X-1 на 14 октомври 1947 г.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 0,25.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Звукът около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Разстояние по ехото', '$d = vt$', '$d = \\frac{vt}{2}$ – звукът отива и се връща'],
              ['Събиране на децибели', '$70\\ \\mathrm{dB} + 70\\ \\mathrm{dB} = 140\\ \\mathrm{dB}$', 'събират се интензитетите: $70 + 3 = 73\\ \\mathrm{dB}$'],
              ['Разстояние и интензитет', 'двойно по-далеч – наполовина по-тихо', 'интензитетът е 4 пъти по-малък ($-6\\ \\mathrm{dB}$)'],
              ['Височина и сила', 'по-силният тон е по-висок', 'височината зависи от честотата, силата – от амплитудата'],
              ['Затворена тръба', '$f_n = \\frac{nv}{2L}$', '$f = \\frac{(2n - 1)v}{4L}$ – само нечетни хармоници'],
              ['Звук в космоса', 'експлозията в космоса се чува', 'във вакуум няма среда – звук няма'],
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
              <Task id="a1" number={1} color="border-green-500" question="Свирка издава тон с честота 680 Hz. Каква е дължината на вълната във въздуха (340 m/s) и във вода (1480 m/s)?" check={[0.5, 2.18]} ask={['във въздуха, m', 'във вода, m']}>
                <p><Tex>{'\\lambda = \\frac{v}{f} = \\frac{340}{680} = 0{,}5\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\lambda = \\frac{1480}{680} \\approx 2{,}18\\ \\mathrm{m}'}</Tex> – честотата остава същата, мени се дължината на вълната.</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Каква е скоростта на звука във въздуха при 30 °C и за колко секунди звукът изминава 1 km?" check={[349, 2.87]} ask={['скорост, m/s', 'време, s']}>
                <p><Tex>{'v \\approx 331 + 0{,}6 \\cdot 30 = 349\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'t = \\frac{1000}{349} \\approx 2{,}87\\ \\mathrm{s}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Интензитетът на звука е $10^{-5}\ \mathrm{W/m^2}$. Какво е нивото му в децибели?" check={[70]} ask={['ниво, dB']}>
                <p><Tex>{'L = 10 \\lg \\frac{10^{-5}}{10^{-12}} = 10 \\lg 10^7 = 70\\ \\mathrm{dB}'}</Tex> – колкото оживена улица.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Всеки от два еднакви високоговорителя създава в дадена точка ниво 80 dB. Какво е нивото, когато работят заедно?" check={[83]} ask={['ниво, dB']}>
                <p>Интензитетите се събират: <Tex>{'I = 2I_1'}</Tex>.</p>
                <p><Tex>{'L = 80 + 10 \\lg 2 \\approx 80 + 3{,}01 \\approx 83{,}0\\ \\mathrm{dB}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Тръба с дължина 34 cm е затворена в единия край. Намерете основния тон и следващия възможен тон ($v = 340\ \mathrm{m/s}$)." check={[250, 750]} ask={['основен тон, Hz', 'следващ тон, Hz']}>
                <p><Tex>{'f_1 = \\frac{v}{4L} = \\frac{340}{4 \\cdot 0{,}34} = 250\\ \\mathrm{Hz}'}</Tex></p>
                <p>Четните хармоници липсват, следващият е третият: <Tex>{'3f_1 = 750\\ \\mathrm{Hz}'}</Tex>.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Удрят с чук стоманена релса. Човек на 1 km долепя ухо до релсата и чува удара два пъти – по релсата и по въздуха. Колко е времето между двата звука? (Звук в стомана – приемете 5000 m/s, във въздуха – 340 m/s.)" check={[2.74]} ask={['време, s']}>
                <p>По въздуха: <Tex>{'t_1 = \\frac{1000}{340} \\approx 2{,}941\\ \\mathrm{s}'}</Tex>; по релсата: <Tex>{'t_2 = \\frac{1000}{5000} = 0{,}2\\ \\mathrm{s}'}</Tex>.</p>
                <p><Tex>{'\\Delta t \\approx 2{,}941 - 0{,}2 \\approx 2{,}74\\ \\mathrm{s}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Скоростта на вълните по струна е $v = \sqrt{T/\mu}$ ($T$ – опън, $\mu$ – маса на единица дължина). Струна звучи като сол₃ = 196 Hz. С колко процента трябва да се увеличи опънът, за да звучи като ла₃ = 220 Hz?" check={[26]} ask={['увеличение, %']}>
                <p><Tex>{'f_1 = \\frac{1}{2L}\\sqrt{\\frac{T}{\\mu}} \\Rightarrow f \\propto \\sqrt{T}'}</Tex>, т.е. <Tex>{'T \\propto f^2'}</Tex>.</p>
                <p><Tex>{'\\frac{T_2}{T_1} = \\left(\\frac{220}{196}\\right)^2 \\approx 1{,}260'}</Tex></p>
                <p>Опънът трябва да нарасне с около 26,0%.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="На 1 m от сирена нивото на звука е 120 dB. На какво разстояние ще е 60 dB, ако звукът се разпространява равномерно във всички посоки и не се поглъща?" check={[1000]} ask={['разстояние, m']}>
                <p>Разлика 60 dB означава <Tex>{'10^6'}</Tex> пъти по-малък интензитет.</p>
                <p><Tex>{'I \\propto \\frac{1}{r^2} \\Rightarrow \\left(\\frac{r}{1\\ \\mathrm{m}}\\right)^2 = 10^6 \\Rightarrow r = 1000\\ \\mathrm{m}'}</Tex></p>
                <p>В действителност въздухът поглъща звука (особено високите тонове), сградите и релефът също, така че нивото там ще е по-ниско.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Камертон звучи с 440 Hz. Заедно с недонастроена струна се чуват 3 биения в секунда. Когато струната леко се опъне, биенията стават 2 в секунда. Каква е била честотата на струната?" check={[437]} ask={['честота, Hz']}>
                <p>От биенията: струната е била 437 Hz или 443 Hz.</p>
                <p>По-голям опън означава по-висока честота. Ако беше 443 Hz, след опъването разликата щеше да нарасне.</p>
                <p>Щом биенията намаляват, честотата се е приближила до 440 Hz отдолу – била е 437 Hz.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Звукът е надлъжна механична вълна; във вакуум не се разпространява; <Tex>{'v = \\lambda f'}</Tex></li>
              <li>✓ Във въздуха <Tex>{'v \\approx 343\\ \\mathrm{m/s}'}</Tex> при 20 °C; ехо: <Tex>{'d = \\frac{vt}{2}'}</Tex></li>
              <li>✓ Височината зависи от честотата: октава = ×2, полутон = <Tex>{'\\times\\sqrt[12]{2}'}</Tex>; чуваме ≈ 20 Hz – 20 kHz</li>
              <li>✓ <Tex>{'L = 10 \\lg \\frac{I}{I_0}'}</Tex>; +10 dB = 10 пъти по-голям интензитет; <Tex>{'I \\propto \\frac{1}{r^2}'}</Tex></li>
              <li>✓ Струна и отворена тръба: <Tex>{'f_n = \\frac{nv}{2L}'}</Tex>; затворена тръба: <Tex>{'f = \\frac{(2n - 1)v}{4L}'}</Tex></li>
              <li>✓ Биене: <Tex>{'f_b = |f_1 - f_2|'}</Tex>; тембърът се определя от силата на хармониците</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Прилепите „виждат“ със звук. Много видове издават ултразвукови писукания с честоти от около 20 до над 100 kHz и слушат ехото. При
              50 kHz дължината на вълната във въздуха е само <Tex>{'\\frac{343}{50\\,000} \\approx 7\\ \\mathrm{mm}'}</Tex> – колкото малко
              насекомо. По-дълга вълна просто би „заобиколила“ насекомото и почти не би се отразила, затова ехолокацията изисква високи честоти.
              По същата причина медицинският ултразвук работи с мегахерци: при 5 MHz вълната в тъканите е около 0,3 mm.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
