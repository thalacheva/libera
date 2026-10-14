import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import { MathText, Tex } from '~/MathText';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { type Drill, pick } from '~/drill';
import Trainer from '~/Trainer';
import PendulumLab from './PendulumLab';
import ResonanceLab from './ResonanceLab';
import SpringMassLab from './SpringMassLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.25 → 0{,}25. */
const dec = (v: number) => String(Number(v.toFixed(6))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = pick([0, 1, 2, 3, 4, 5, 6]);
  if (kind === 0) {
    const f = pick([2, 4, 5, 10, 20, 25, 50]);
    return {
      tex: `f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Период: $T = ?\\ \\mathrm{s}$',
      num: 1,
      den: f,
      steps: ['$T = \\frac{1}{f}$', `$T = \\frac{1}{${f}} = ${dec(1 / f)}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 1) {
    const [n, t] = pick([
      [10, 5],
      [20, 5],
      [30, 10],
      [60, 20],
      [12, 4],
      [15, 30],
    ]);
    return {
      tex: `N = ${n}, \\quad t = ${t}\\ \\mathrm{s}`,
      ask: `За $${t}\\ \\mathrm{s}$ тялото прави ${n} трептения. Честота: $f = ?\\ \\mathrm{Hz}$`,
      num: n,
      den: t,
      steps: ['$f = \\frac{N}{t}$', `$f = \\frac{${n}}{${t}} = ${dec(n / t)}\\ \\mathrm{Hz}$`],
    };
  }
  if (kind === 2) {
    const [m, k] = pick([
      [1, 4],
      [1, 16],
      [2, 8],
      [4, 1],
      [0.5, 50],
      [9, 4],
      [3, 12],
    ]);
    const r = 2 * Math.sqrt(m / k);
    return {
      tex: `m = ${dec(m)}\\ \\mathrm{kg}, \\quad k = ${k}\\ \\mathrm{N/m}`,
      ask: 'Периодът е $T = n\\pi\\ \\mathrm{s}$. Колко е $n$?',
      num: r * 10,
      den: 10,
      steps: [`$T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{${dec(m)}}{${k}}} = 2\\pi \\cdot ${dec(r / 2)}$`, `$T = ${dec(r)}\\pi\\ \\mathrm{s}$, значи $n = ${dec(r)}$`],
    };
  }
  if (kind === 3) {
    const [a, w] = [pick([5, 10, 20]), pick([2, 4, 5, 10])];
    return {
      tex: `A = ${a}\\ \\mathrm{cm}, \\quad \\omega = ${w}\\ \\mathrm{rad/s}`,
      ask: 'Най-голяма скорост: $v_{\\max} = ?\\ \\mathrm{m/s}$',
      num: a * w,
      den: 100,
      steps: ['$v_{\\max} = A\\omega$, като $A$ е в метри', `$v_{\\max} = ${dec(a / 100)} \\cdot ${w} = ${dec((a * w) / 100)}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 4) {
    const [a, w] = [pick([5, 10, 20]), pick([2, 4, 5, 10])];
    return {
      tex: `A = ${a}\\ \\mathrm{cm}, \\quad \\omega = ${w}\\ \\mathrm{rad/s}`,
      ask: 'Най-голямо ускорение: $a_{\\max} = ?\\ \\mathrm{m/s^2}$',
      num: a * w * w,
      den: 100,
      steps: ['$a_{\\max} = A\\omega^2$ – в крайните положения', `$a_{\\max} = ${dec(a / 100)} \\cdot ${w}^2 = ${dec((a * w * w) / 100)}\\ \\mathrm{m/s^2}$`],
    };
  }
  if (kind === 5) {
    const [k, a] = [pick([100, 200, 400]), pick([5, 10, 20])];
    return {
      tex: `k = ${k}\\ \\mathrm{N/m}, \\quad A = ${a}\\ \\mathrm{cm}`,
      ask: 'Пълна енергия: $E = ?\\ \\mathrm{J}$',
      num: k * a * a,
      den: 20000,
      steps: ['$E = \\frac{kA^2}{2}$ – цялата енергия е в пружината в крайното положение', `$E = \\frac{${k} \\cdot ${dec(a / 100)}^2}{2} = ${dec((k * a * a) / 20000)}\\ \\mathrm{J}$`],
    };
  }
  const n = pick([4, 9, 16, 25]);
  return {
    tex: `l_2 = ${n}\\,l_1`,
    ask: 'Махалото е удължено. Колко пъти се увеличава периодът? $T_2 : T_1 = ?$',
    num: Math.sqrt(n),
    den: 1,
    steps: ['$T = 2\\pi\\sqrt{\\frac{l}{g}}$, значи $T \\sim \\sqrt{l}$', `$\\frac{T_2}{T_1} = \\sqrt{${n}} = ${Math.sqrt(n)}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🕰️ Секундно махало',
    problem: 'В старите стенни часовници махалото прави един замах (отиване или връщане) за 1 s, т.е. периодът му е 2 s. Колко дълго е то? ($g = 9{,}81\\ \\mathrm{m/s^2}$)',
    solution: ['$T = 2\\pi\\sqrt{\\frac{l}{g}} \\Rightarrow l = \\frac{gT^2}{4\\pi^2}$', '$l = \\frac{9{,}81 \\cdot 4}{4\\pi^2} \\approx 0{,}994\\ \\mathrm{m}$ – почти точно метър.'],
    answer: '$\\approx 0{,}994\\ \\mathrm{m}$',
    check: [0.994],
    ask: ['дължина, m'],
  },
  {
    title: '🚗 Окачване на кола',
    problem: 'Кола с маса 1200 kg стои на 4 пружини с коефициент 30 000 N/m всяка. С каква честота се люлее колата, ако я натиснем и пуснем (без амортисьори)?',
    solution: ['Пружините работят успоредно: $k = 4 \\cdot 30\\,000 = 120\\,000\\ \\mathrm{N/m}$', '$T = 2\\pi\\sqrt{\\frac{1200}{120\\,000}} = 2\\pi \\cdot 0{,}1 \\approx 0{,}628\\ \\mathrm{s}$', '$f = \\frac{1}{T} \\approx 1{,}59\\ \\mathrm{Hz}$ – около веднъж и половина в секунда. Амортисьорите гасят тези трептения.'],
    answer: '$\\approx 1{,}59\\ \\mathrm{Hz}$',
    check: [1.59],
    ask: ['честота, Hz'],
  },
  {
    title: '🌙 Махало на Луната',
    problem: 'На Земята махало има период 2 s. Какъв ще е периодът му на Луната, където $g = 1{,}62\\ \\mathrm{m/s^2}$?',
    solution: ['$T \\sim \\frac{1}{\\sqrt{g}}$, значи $\\frac{T_Л}{T_З} = \\sqrt{\\frac{9{,}81}{1{,}62}} \\approx 2{,}46$', '$T_Л \\approx 2 \\cdot 2{,}46 \\approx 4{,}92\\ \\mathrm{s}$'],
    answer: '$\\approx 4{,}92\\ \\mathrm{s}$',
    check: [4.92],
    ask: ['период, s'],
  },
  {
    title: '🪂 Бънджи',
    problem: 'Скачач с маса 70 kg виси на еластично въже с коефициент 100 N/m и подскача нагоре-надолу. Какъв е периодът на тези трептения?',
    solution: ['$T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{70}{100}} = 2\\pi\\sqrt{0{,}7}$', '$T \\approx 5{,}26\\ \\mathrm{s}$ – бавно люлеене.'],
    answer: '$\\approx 5{,}26\\ \\mathrm{s}$',
    check: [5.26],
    ask: ['период, s'],
  },
  {
    title: '🎵 Камертон',
    problem: 'Камертонът за настройване на инструменти трепти с честота 440 Hz (нотата „ла“). Колко милисекунди трае едно трептене?',
    solution: ['$T = \\frac{1}{f} = \\frac{1}{440}\\ \\mathrm{s}$', '$T \\approx 0{,}00227\\ \\mathrm{s} = 2{,}27\\ \\mathrm{ms}$. За 5 секунди той прави 2200 трептения.'],
    answer: '$\\approx 2{,}27\\ \\mathrm{ms}$',
    check: [2.27],
    ask: ['период, ms'],
  },
  {
    title: '🛝 Люлка',
    problem: 'Люлка е окачена на въжета с дължина 2,5 m. През колко секунди трябва да я буташ, за да я разлюлееш най-лесно?',
    solution: ['Най-лесно е при резонанс – бутаме веднъж на всеки период.', '$T = 2\\pi\\sqrt{\\frac{2{,}5}{9{,}81}} \\approx 3{,}17\\ \\mathrm{s}$'],
    answer: '$\\approx 3{,}17\\ \\mathrm{s}$',
    check: [3.17],
    ask: ['време, s'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Периодът на трептене е 0,2 s. Каква е честотата?',
    answers: ['$5\\ \\mathrm{Hz}$', '$0{,}2\\ \\mathrm{Hz}$', '$2\\ \\mathrm{Hz}$', '$20\\ \\mathrm{Hz}$'],
    correctAnswer: '$5\\ \\mathrm{Hz}$',
  },
  {
    question: 'Масата на тялото на пружина се увеличава 4 пъти. Как се променя периодът?',
    answers: ['увеличава се 2 пъти', 'увеличава се 4 пъти', 'намалява 2 пъти', 'не се променя'],
    correctAnswer: 'увеличава се 2 пъти',
  },
  {
    question: 'От какво НЕ зависи периодът на математическо махало при малки ъгли?',
    answers: ['от масата на топчето', 'от дължината на нишката', 'от земното ускорение', 'от планетата, на която е'],
    correctAnswer: 'от масата на топчето',
  },
  {
    question: 'Къде скоростта на трептящо тяло е най-голяма?',
    answers: ['в равновесното положение', 'в крайните положения', 'по средата между равновесието и края', 'навсякъде е еднаква'],
    correctAnswer: 'в равновесното положение',
  },
  {
    question: 'Къде ускорението на трептящо тяло е най-голямо?',
    answers: ['в крайните положения', 'в равновесното положение', 'навсякъде е еднакво', 'ускорението винаги е нула'],
    correctAnswer: 'в крайните положения',
  },
  {
    question: 'Какъв ще е периодът на земно махало, ако го пренесем на Луната?',
    answers: ['по-голям', 'по-малък', 'същият', 'махалото няма да трепти'],
    correctAnswer: 'по-голям',
  },
  {
    question: 'Кога настъпва резонанс?',
    answers: ['когато честотата на външната сила е близка до собствената честота', 'когато затихването е много голямо', 'когато амплитудата е малка', 'когато външната сила е постоянна'],
    correctAnswer: 'когато честотата на външната сила е близка до собствената честота',
  },
  {
    question: 'Амплитудата на трептене на пружина се удвоява. Колко пъти се увеличава енергията?',
    answers: ['$4$', '$2$', '$\\sqrt{2}$', '$8$'],
    correctAnswer: '$4$',
  },
  {
    question: 'Тяло трепти по закона $x = 3\\cos 2t$ (в SI). Какъв е периодът?',
    answers: ['$\\pi\\ \\mathrm{s}$', '$2\\ \\mathrm{s}$', '$3\\ \\mathrm{s}$', '$\\frac{\\pi}{2}\\ \\mathrm{s}$'],
    correctAnswer: '$\\pi\\ \\mathrm{s}$',
  },
];

// ---------- Страница ----------

export function Oscillations() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Трептения</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🕯️ Разказва се, че младият Галилей, докато седял в катедралата в Пиза, загледал една люлееща се лампа. Мерейки времето с пулса си,
            той забелязал нещо странно: и големите, и малките люлеения траят еднакво дълго. Историята е известна от биографията, написана от
            ученика му Вивиани, и вероятно е украсена – но откритието е истинско. Около 1656–1657 г. Кристиан Хюйгенс построява първия часовник с
            махало и точността на часовниците скача от около четвърт час до около 15 секунди на ден. Три века махалата отмерват времето на света.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Периодично движение</h2>
          <p className={text}>
            Трептене е движение, което се повтаря: люлка, струна, сърце, пружината на колата, атомите в кристал. Тялото се отклонява от{' '}
            <strong>равновесното положение</strong>, връща се, подминава го и отново се връща.
          </p>
          <Theorem
            type="definition"
            title="Амплитуда, период и честота"
            description="Амплитудата $A$ е най-голямото отклонение от равновесието. Периодът $T$ е времето за едно пълно трептене (отиване и връщане). Честотата $f = \frac{1}{T}$ е броят трептения за секунда; единицата е херц: $1\ \mathrm{Hz} = 1\ \mathrm{s^{-1}}$. Ъгловата честота е $\omega = \frac{2\pi}{T} = 2\pi f$."
          />
          <Example
            description="Тяло прави 30 трептения за 12 s. Какви са периодът, честотата и ъгловата честота?"
            steps={['$T = \\frac{12}{30} = 0{,}4\\ \\mathrm{s}$', '$f = \\frac{1}{T} = 2{,}5\\ \\mathrm{Hz}$', '$\\omega = 2\\pi f = 5\\pi \\approx 15{,}7\\ \\mathrm{rad/s}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Хармонично трептене</h2>
          <p className={text}>
            Ако силата, която връща тялото, е пропорционална на отклонението, <Tex>{'F = -kx'}</Tex>, от <Term id="newton-second-law">втория закон на Нютон</Term> получаваме{' '}
            <Tex>{"x'' = -\\omega^2 x"}</Tex> с <Tex>{'\\omega^2 = \\frac{k}{m}'}</Tex>. Решенията на това уравнение са изведени в урока{' '}
            <Link to="/analysis/differential-equations" className={link}>
              Диференциални уравнения
            </Link>
            .
          </p>
          <Theorem
            title="Закон на хармоничното трептене"
            description="$x(t) = A\cos(\omega t + \varphi)$, където $\varphi$ е началната фаза. Скоростта е $v = -A\omega\sin(\omega t + \varphi)$, а ускорението $a = -\omega^2 x$. Затова $v_{\max} = A\omega$ (в равновесието), а $a_{\max} = A\omega^2$ (в крайните положения). Периодът НЕ зависи от амплитудата."
          />
          <p className={text}>
            Хармоничното трептене е <strong>проекция</strong> на <Term id="uniform-motion">равномерно движение</Term> по окръжност (виж{' '}
            <Link to="/physics/mechanics/rotation" className={link}>
              Въртене
            </Link>
            ): ако точка обикаля окръжност с радиус <Tex>{'A'}</Tex> и <Term id="angular-velocity">ъглова скорост</Term> <Tex>{'\\omega'}</Tex>, сянката ѝ върху диаметъра трепти
            точно по закона <Tex>{'x = A\\cos \\omega t'}</Tex>. Оттук идва и името „ъглова честота“.
          </p>
          <SpringMassLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Пружинно махало и енергия</h2>
          <Theorem
            title="Период на пружинно махало"
            description="$T = 2\pi\sqrt{\frac{m}{k}}$. По-тежкото тяло трепти по-бавно, по-твърдата пружина – по-бързо. Периодът е един и същ при хоризонтална и вертикална пружина."
          />
          <p className={text}>
            При трептенето енергията непрекъснато се прелива (виж{' '}
            <Link to="/physics/mechanics/energy" className={link}>
              Работа, енергия, мощност
            </Link>
            ): в крайните положения тя е изцяло потенциална <Tex>{'\\frac{kA^2}{2}'}</Tex>, а в равновесието – изцяло кинетична{' '}
            <Tex>{'\\frac{mv_{\\max}^2}{2}'}</Tex>. Без <Term id="friction">триене</Term> сборът е постоянен:{' '}
            <Tex>{'\\frac{kx^2}{2} + \\frac{mv^2}{2} = \\frac{kA^2}{2}'}</Tex>.
          </p>
          <Example
            description="Тяло с маса 0,5 kg на пружина с $k = 200\ \mathrm{N/m}$ е отклонено на 4 cm и пуснато. Намерете периода и най-голямата скорост."
            steps={[
              '$T = 2\\pi\\sqrt{\\frac{0{,}5}{200}} = 2\\pi \\cdot 0{,}05 \\approx 0{,}314\\ \\mathrm{s}$',
              '$\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{400} = 20\\ \\mathrm{rad/s}$',
              '$v_{\\max} = A\\omega = 0{,}04 \\cdot 20 = 0{,}8\\ \\mathrm{m/s}$',
              'Проверка с енергия: $\\frac{200 \\cdot 0{,}04^2}{2} = 0{,}16\\ \\mathrm{J} = \\frac{0{,}5 \\cdot 0{,}8^2}{2}$ ✓',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Математическо махало</h2>
          <Theorem
            title="Период на математическо махало"
            description="При малки ъгли (до около $10$–$15^\circ$) $T = 2\pi\sqrt{\frac{l}{g}}$ – не зависи нито от масата, нито от амплитудата. При по-големи ъгли периодът расте; приблизително $T \approx 2\pi\sqrt{\frac{l}{g}}\left(1 + \frac{\theta_0^2}{16}\right)$, с $\theta_0$ в радиани."
          />
          <p className={text}>
            Защо масата не влияе? По-тежкото топче се дърпа по-силно от тежестта, но и по-трудно се ускорява – двата ефекта се съкращават, както
            при <Term id="free-fall">свободното падане</Term>. А защо формулата е само за малки ъгли? Връщащата сила е <Tex>{'mg\\sin\\theta'}</Tex>, а не{' '}
            <Tex>{'mg\\theta'}</Tex>; двете почти съвпадат само при малко <Tex>{'\\theta'}</Tex>. При <Tex>{'60^\\circ'}</Tex> истинският период
            е с около 7% по-дълъг, а при <Tex>{'90^\\circ'}</Tex> – с 18%.
          </p>
          <PendulumLab />
          <Example
            description="Колко дълго трябва да е махало с период точно 2 s?"
            steps={['$l = \\frac{gT^2}{4\\pi^2} = \\frac{9{,}81 \\cdot 4}{39{,}48} \\approx 0{,}994\\ \\mathrm{m}$', 'Затова „секундното махало“ е почти точно метър. През XVII век дори предлагат метърът да се определи чрез него.']}
          />
          <p className={text}>
            Махалото е и чудесен начин да измериш <Tex>{'g'}</Tex>: мериш дължината и времето за 10–20 трептения (както в първия урок,{' '}
            <Link to="/physics/mechanics/units" className={link}>
              Величини, единици и оценки
            </Link>
            ) и пресмяташ <Tex>{'g = \\frac{4\\pi^2 l}{T^2}'}</Tex>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Затихване и резонанс</h2>
          <p className={text}>
            Истинските трептения <strong>затихват</strong>: триенето и съпротивлението на въздуха превръщат енергията в топлина и амплитудата
            намалява. Затова люлката трябва да се бута. Ако периодична външна сила действа на трептяща система, след известно време тя трепти с
            честотата на силата – това са <strong>принудени трептения</strong>.
          </p>
          <Theorem
            type="definition"
            title="Резонанс"
            description="Резонанс е рязкото нарастване на амплитудата на принудените трептения, когато честотата на външната сила се доближи до собствената честота на системата. Колкото по-слабо е затихването, толкова по-висок и по-тесен е резонансният връх."
          />
          <ResonanceLab />
          <p className={text}>
            Резонансът е полезен – така бутаме люлка, настройваме радио и чуваме музика от китара. Но може и да е опасен. Певец може да счупи
            чаша, като пее точно с нейната собствена честота. През 2000 г. новият Мост на хилядолетието в Лондон започва да се люлее странично
            под крачките на хората: стъпките им се синхронизират с люлеенето и го усилват, затова мостът е затворен и оборудван с амортисьори.
            Срутването на моста Такома през 1940 г. често се дава като пример за резонанс, но днес се обяснява по-скоро с аеродинамично
            самовъзбуждане (флатер) – вятърът сам „помпа“ енергия в трептенията, а не ги разклаща с определена честота.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Пресметни исканата величина. Десетичните отговори въвеждай като 0,25.</p>
          <Trainer newDrill={newDrill} hint="Не съвсем. Виж решението стъпка по стъпка." />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Трептенията около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Честота и ъглова честота', '$\\omega = f$', '$\\omega = 2\\pi f$ – ъгловата честота е в rad/s'],
              ['Пружинно махало', '$T = 2\\pi\\sqrt{\\frac{k}{m}}$', '$T = 2\\pi\\sqrt{\\frac{m}{k}}$ – по-тежкото тяло трепти по-бавно'],
              ['Махало и маса', 'тежкото махало трепти по-бавно', 'периодът на махалото не зависи от масата'],
              ['Пълно трептене', 'от единия край до другия', 'отиване и връщане – обратно до началната точка'],
              ['Крайното положение', 'там скоростта е най-голяма', 'там $v = 0$, а ускорението е най-голямо'],
              ['Формулата за махало', 'важи при всякакви ъгли', 'само при малки ъгли; при $60^\\circ$ грешката е около 7%'],
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
              <Task id="a1" number={1} color="border-green-500" question="Тяло трепти по закона $x = 0{,}05\cos 4\pi t$ (в SI). Намерете амплитудата в сантиметри, честотата и периода." check={[5, 2, 0.5]} ask={['$A$, cm', '$f$, Hz', '$T$, s']}>
                <p><Tex>{'A = 0{,}05\\ \\mathrm{m} = 5\\ \\mathrm{cm}'}</Tex></p>
                <p><Tex>{'\\omega = 4\\pi = 2\\pi f \\Rightarrow f = 2\\ \\mathrm{Hz}'}</Tex></p>
                <p><Tex>{'T = \\frac{1}{f} = 0{,}5\\ \\mathrm{s}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Тяло с маса 2 kg на пружина трепти с период 1 s. Какъв е коефициентът на еластичност на пружината?" check={[79]} ask={['$k$, N/m']}>
                <p>От <Tex>{'T = 2\\pi\\sqrt{\\frac{m}{k}}'}</Tex>: <Tex>{'k = \\frac{4\\pi^2 m}{T^2}'}</Tex>.</p>
                <p><Tex>{'k = \\frac{4\\pi^2 \\cdot 2}{1^2} \\approx 79{,}0\\ \\mathrm{N/m}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Какъв е периодът на махало с дължина 0,5 m? ($g = 9{,}81\ \mathrm{m/s^2}$)" check={[1.42]} ask={['$T$, s']}>
                <p><Tex>{'T = 2\\pi\\sqrt{\\frac{0{,}5}{9{,}81}} \\approx 2\\pi \\cdot 0{,}226 \\approx 1{,}42\\ \\mathrm{s}'}</Tex></p>
                <p>Махало, 4 пъти по-късо от секундното, има 2 пъти по-малък период.</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Тяло с маса 0,5 kg на пружина с $k = 50\ \mathrm{N/m}$ трепти с амплитуда 10 cm. Намерете най-голямата скорост, най-голямото ускорение и пълната енергия." check={[1, 10, 0.25]} ask={['$v_{\\max}$, m/s', '$a_{\\max}$, m/s²', '$E$, J']}>
                <p><Tex>{'\\omega = \\sqrt{\\frac{50}{0{,}5}} = 10\\ \\mathrm{rad/s}'}</Tex></p>
                <p><Tex>{'v_{\\max} = A\\omega = 0{,}1 \\cdot 10 = 1\\ \\mathrm{m/s}'}</Tex>, <Tex>{'a_{\\max} = A\\omega^2 = 10\\ \\mathrm{m/s^2}'}</Tex></p>
                <p><Tex>{'E = \\frac{kA^2}{2} = \\frac{50 \\cdot 0{,}01}{2} = 0{,}25\\ \\mathrm{J}'}</Tex></p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Часовник с махало е точен при $g = 9{,}81\ \mathrm{m/s^2}$. Пренасят го в планината, където $g = 9{,}80\ \mathrm{m/s^2}$. С колко секунди изостава за едно денонощие?" check={[44]} ask={['изоставане, s']}>
                <p><Tex>{'T \\sim \\frac{1}{\\sqrt{g}}'}</Tex>: <Tex>{'\\frac{T_2}{T_1} = \\sqrt{\\frac{9{,}81}{9{,}80}} \\approx 1{,}000510'}</Tex>.</p>
                <p>За истинско денонощие часовникът отброява <Tex>{'\\frac{86\\,400}{1{,}000510} \\approx 86\\,356\\ \\mathrm{s}'}</Tex>.</p>
                <p>Изостава с около 44,0 s на ден – затова точните часовници с махало са се регулирали според мястото.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Тяло с маса 1 kg е закачено към две пружини с $k_1 = 100\ \mathrm{N/m}$ и $k_2 = 300\ \mathrm{N/m}$. Намерете периода, ако пружините са свързани успоредно и ако са последователно." check={[0.314, 0.726]} ask={['успоредно, s', 'последователно, s']}>
                <p>Успоредно: <Tex>{'k = k_1 + k_2 = 400\\ \\mathrm{N/m}'}</Tex>, <Tex>{'T = 2\\pi\\sqrt{\\frac{1}{400}} \\approx 0{,}314\\ \\mathrm{s}'}</Tex>.</p>
                <p>Последователно: <Tex>{'\\frac{1}{k} = \\frac{1}{100} + \\frac{1}{300} \\Rightarrow k = 75\\ \\mathrm{N/m}'}</Tex>.</p>
                <p><Tex>{'T = 2\\pi\\sqrt{\\frac{1}{75}} \\approx 0{,}726\\ \\mathrm{s}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Когато закачим тежест на вертикална пружина, тя се разтяга с 4 cm. Какъв е периодът на вертикалните трептения? ($g = 9{,}81\ \mathrm{m/s^2}$)" check={[0.401]} ask={['$T$, s']}>
                <p>В равновесие <Tex>{'k\\Delta l = mg'}</Tex>, значи <Tex>{'\\frac{m}{k} = \\frac{\\Delta l}{g}'}</Tex>.</p>
                <p><Tex>{'T = 2\\pi\\sqrt{\\frac{\\Delta l}{g}} = 2\\pi\\sqrt{\\frac{0{,}04}{9{,}81}} \\approx 0{,}401\\ \\mathrm{s}'}</Tex></p>
                <p>Не ни трябват нито масата, нито <Tex>{'k'}</Tex> – само удължението. Тежестта премества равновесието, но не променя периода.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Амплитудата на затихващо махало намалява наполовина на всеки 10 трептения. След колко трептения тя ще стане 1% от началната? Колко пъти намалява енергията за 10 трептения?" check={[66.4, 4]} ask={['брой трептения', 'енергията намалява, пъти']}>
                <p>След <Tex>{'n'}</Tex> трептения <Tex>{'A = A_0 \\cdot \\left(\\frac{1}{2}\\right)^{n/10}'}</Tex>.</p>
                <p><Tex>{'\\left(\\frac{1}{2}\\right)^{n/10} = 0{,}01 \\Rightarrow n = 10\\log_2 100 \\approx 66{,}4'}</Tex></p>
                <p>Енергията е пропорционална на <Tex>{'A^2'}</Tex>, затова за 10 трептения тя намалява <Tex>{'2^2 = 4'}</Tex> пъти.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Точният период на махало с амплитуда $\theta_0$ е $T = \frac{2}{\pi}K\left(\sin\frac{\theta_0}{2}\right) \cdot T_0$, където $T_0 = 2\pi\sqrt{l/g}$, а $K(\sin 45^\circ) \approx 1{,}8541$. С колко процента периодът при $\theta_0 = 90^\circ$ е по-дълъг от $T_0$? Колко дава приближението $1 + \frac{\theta_0^2}{16}$?" check={[18, 15.4]} ask={['точно, %', 'приближение, %']}>
                <p><Tex>{'\\frac{T}{T_0} = \\frac{2}{\\pi} \\cdot 1{,}8541 \\approx 1{,}180'}</Tex> – с около 18,0% по-дълъг.</p>
                <p>Приближението: <Tex>{'\\theta_0 = \\frac{\\pi}{2}'}</Tex>, <Tex>{'1 + \\frac{(\\pi/2)^2}{16} \\approx 1{,}154'}</Tex> – около 15,4%.</p>
                <p>При толкова голям ъгъл приближението вече подценява ефекта; затова трябва точната формула или числено решение, както в лабораторията.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'f = \\frac{1}{T}'}</Tex>, <Tex>{'\\omega = 2\\pi f'}</Tex>; пълното трептене е отиване и връщане</li>
              <li>✓ Хармонично трептене: <Tex>{'x = A\\cos(\\omega t + \\varphi)'}</Tex> – проекция на движение по окръжност</li>
              <li>✓ <Tex>{'v_{\\max} = A\\omega'}</Tex> в равновесието, <Tex>{'a_{\\max} = A\\omega^2'}</Tex> в крайните положения</li>
              <li>✓ Пружина: <Tex>{'T = 2\\pi\\sqrt{\\frac{m}{k}}'}</Tex>; махало при малки ъгли: <Tex>{'T = 2\\pi\\sqrt{\\frac{l}{g}}'}</Tex></li>
              <li>✓ Енергията се прелива между <Tex>{'\\frac{kx^2}{2}'}</Tex> и <Tex>{'\\frac{mv^2}{2}'}</Tex>; пълната е <Tex>{'\\frac{kA^2}{2}'}</Tex></li>
              <li>✓ Резонанс: най-голяма амплитуда, когато външната честота е близо до собствената</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              В небостъргача Тайпе 101 (Тайван) между 87-ия и 92-рия етаж виси огромно стоманено кълбо с маса около 660 тона. То е махало,
              настроено на собствената честота на сградата: когато вятър или земетресение я разлюлеят, кълбото се люлее в противофаза и поглъща
              част от енергията. Такива „гасители на трептения“ има и в много други високи сгради и мостове – резонансът е победен с резонанс.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
