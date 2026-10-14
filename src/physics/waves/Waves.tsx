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
import DopplerLab from './DopplerLab';
import StandingWaveLab from './StandingWaveLab';
import WaveMachineLab from './WaveMachineLab';
import Term from '~/Term';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор ----------

/** Число в LaTeX с десетична запетая: 0.25 → 0{,}25. */
const dec = (v: number) => String(Number(v.toFixed(4))).replace('.', '{,}');

const newDrill = (): Drill => {
  const kind = randInt(0, 6);
  if (kind === 0) {
    const [lambda, f] = [pick([0.5, 2, 4, 1.5]), pick([10, 20, 50, 100])];
    return {
      tex: `\\lambda = ${dec(lambda)}\\ \\mathrm{m}, \\quad f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Скорост на вълната: $v = ?\\ \\mathrm{m/s}$',
      num: lambda * 10 * f,
      den: 10,
      steps: [`$v = \\lambda f = ${dec(lambda)} \\cdot ${f} = ${dec(lambda * f)}\\ \\mathrm{m/s}$`],
    };
  }
  if (kind === 1) {
    const f = pick([85, 170, 340, 680]);
    return {
      tex: `v = 340\\ \\mathrm{m/s}, \\quad f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Дължина на звуковата вълна: $\\lambda = ?\\ \\mathrm{m}$',
      num: 340,
      den: f,
      steps: [`$\\lambda = \\frac{v}{f} = \\frac{340}{${f}} = ${dec(340 / f)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 2) {
    const f = pick([2, 4, 5, 10, 20, 50]);
    return {
      tex: `f = ${f}\\ \\mathrm{Hz}`,
      ask: 'Период: $T = ?\\ \\mathrm{s}$',
      num: 1,
      den: f,
      steps: [`$T = \\frac{1}{f} = \\frac{1}{${f}} = ${dec(1 / f)}\\ \\mathrm{s}$`],
    };
  }
  if (kind === 3) {
    const [L, n] = [pick([0.6, 1.2, 2.4]), randInt(1, 4)];
    return {
      tex: `L = ${dec(L)}\\ \\mathrm{m}, \\quad n = ${n}`,
      ask: 'Стояща вълна по струна, закрепена в двата края: $\\lambda_n = ?\\ \\mathrm{m}$',
      num: Math.round(L * 20),
      den: 10 * n,
      steps: [`По струната се побират $n$ половинки: $L = n\\frac{\\lambda}{2}$`, `$\\lambda = \\frac{2L}{n} = \\frac{${dec(2 * L)}}{${n}} = ${dec((2 * L) / n)}\\ \\mathrm{m}$`],
    };
  }
  if (kind === 4) {
    const [v, L, n] = [pick([120, 240, 360]), pick([0.6, 1.2]), randInt(1, 3)];
    return {
      tex: `v = ${v}\\ \\mathrm{m/s}, \\quad L = ${dec(L)}\\ \\mathrm{m}, \\quad n = ${n}`,
      ask: 'Честота на $n$-тия хармоник: $f_n = ?\\ \\mathrm{Hz}$',
      num: n * v * 10,
      den: Math.round(L * 20),
      steps: [`$f_n = \\frac{nv}{2L} = \\frac{${n} \\cdot ${v}}{${dec(2 * L)}} = ${dec((n * v) / (2 * L))}\\ \\mathrm{Hz}$`],
    };
  }
  if (kind === 5) {
    const [vs, f0] = [pick([20, 40, 85, 170]), pick([300, 600])];
    return {
      tex: `f_0 = ${f0}\\ \\mathrm{Hz}, \\quad v = ${vs}\\ \\mathrm{m/s}, \\quad u = 340\\ \\mathrm{m/s}`,
      ask: 'Източникът се приближава към теб: $f = ?\\ \\mathrm{Hz}$',
      num: f0 * 340,
      den: 340 - vs,
      steps: [`При приближаващ се източник: $f = f_0 \\frac{u}{u - v}$`, `$f = ${f0} \\cdot \\frac{340}{${340 - vs}} = ${dec((f0 * 340) / (340 - vs))}\\ \\mathrm{Hz}$`],
    };
  }
  const s = pick([0.5, 0.25, 0.8]);
  return {
    tex: `\\sin\\theta = ${dec(s)}, \\quad u = 340\\ \\mathrm{m/s}`,
    ask: 'Конус на Мах: скорост на самолета $v = ?\\ \\mathrm{m/s}$',
    num: 340,
    den: s,
    steps: [`$\\sin\\theta = \\frac{u}{v} \\Rightarrow v = \\frac{u}{\\sin\\theta}$`, `$v = \\frac{340}{${dec(s)}} = ${dec(340 / s)}\\ \\mathrm{m/s}$`],
  };
};

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '⛈️ Колко далеч е бурята?',
    problem: 'Виждаш светкавица и броиш 3 s до гърмежа. На какво разстояние е мълнията? (Скорост на звука 340 m/s; светлината идва практически мигновено.)',
    solution: ['$s = ut = 340 \\cdot 3 = 1020\\ \\mathrm{m}$', 'Правило за бързо смятане: около 3 s на километър.'],
    answer: '$1020\\ \\mathrm{m}$',
    check: [1020],
    ask: ['разстояние, m'],
  },
  {
    title: '📻 Радио',
    problem: 'Радиостанция излъчва на 100 MHz. Каква е дължината на радиовълната? ($c = 3 \\cdot 10^8\\ \\mathrm{m/s}$)',
    solution: ['$\\lambda = \\frac{c}{f} = \\frac{3 \\cdot 10^8}{10^8} = 3\\ \\mathrm{m}$', 'Затова антените за FM радио са дълги около метър – половин или четвърт дължина на вълната.'],
    answer: '$3\\ \\mathrm{m}$',
    check: [3],
    ask: ['дължина на вълната, m'],
  },
  {
    title: '🌊 Вълни на плажа',
    problem: 'Гребените на морските вълни идват до брега на всеки 4 s, а разстоянието между два съседни гребена е около 12 m. С каква скорост се движат вълните?',
    solution: ['$T = 4\\ \\mathrm{s}$, $\\lambda = 12\\ \\mathrm{m}$', '$v = \\frac{\\lambda}{T} = \\frac{12}{4} = 3\\ \\mathrm{m/s}$'],
    answer: '$3\\ \\mathrm{m/s}$',
    check: [3],
    ask: ['скорост, m/s'],
  },
  {
    title: '🚑 Линейка',
    problem: 'Сирената на линейка е 700 Hz. Линейката се движи с 25 m/s (90 km/h). Каква честота чуваш, докато се приближава, и каква – след като отмине?',
    solution: ['Приближава се: $f = 700 \\cdot \\frac{340}{340 - 25} \\approx 756\\ \\mathrm{Hz}$', 'Отдалечава се: $f = 700 \\cdot \\frac{340}{340 + 25} \\approx 652\\ \\mathrm{Hz}$', 'В момента, в който минава покрай теб, тонът „пада“ с около 100 Hz.'],
    answer: '$\\approx 756$ и $\\approx 652\\ \\mathrm{Hz}$',
    check: [756, 652],
    ask: ['приближава се, Hz', 'отдалечава се, Hz'],
  },
  {
    title: '🌍 Земетресение',
    problem: 'Сеизмичните P вълни (надлъжни) бягат с около 6 km/s, а S вълните (напречни) – с около 3,5 km/s. Сеизмографът регистрира S вълната 20 s след P вълната. На какво разстояние е огнището?',
    solution: ['$\\frac{d}{3{,}5} - \\frac{d}{6} = 20$', '$d\\left(\\frac{1}{3{,}5} - \\frac{1}{6}\\right) = 20 \\Rightarrow d \\approx 168\\ \\mathrm{km}$', 'С три сеизмографа на различни места може да се намери и самото огнище.'],
    answer: '$\\approx 168\\ \\mathrm{km}$',
    check: [168],
    ask: ['разстояние, km'],
  },
  {
    title: '🦇 Прилеп',
    problem: 'Прилепите се ориентират с ултразвук с честота около 40 kHz. Каква е дължината на вълната във въздуха (в mm)?',
    solution: ['$\\lambda = \\frac{340}{40\\,000} = 0{,}0085\\ \\mathrm{m} = 8{,}5\\ \\mathrm{mm}$', 'Вълните се отразяват добре от тела, по-големи от дължината на вълната – прилепът „вижда“ дори дребни насекоми.'],
    answer: '$8{,}5\\ \\mathrm{mm}$',
    check: [8.5],
    ask: ['дължина на вълната, mm'],
  },
];

// ---------- Тест ----------

const quiz: Question[] = [
  {
    question: 'Какво пренася механичната вълна?',
    answers: ['енергия, без да пренася вещество', 'вещество, без да пренася енергия', 'и вещество, и енергия', 'нито вещество, нито енергия'],
    correctAnswer: 'енергия, без да пренася вещество',
  },
  {
    question: 'Какъв вид вълна е звукът във въздуха?',
    answers: ['надлъжна', 'напречна', 'стояща', 'електромагнитна'],
    correctAnswer: 'надлъжна',
  },
  {
    question: 'Звук с честота 170 Hz се разпространява с 340 m/s. Каква е дължината на вълната?',
    answers: ['$2\\ \\mathrm{m}$', '$0{,}5\\ \\mathrm{m}$', '$57\\,800\\ \\mathrm{m}$', '$170\\ \\mathrm{m}$'],
    correctAnswer: '$2\\ \\mathrm{m}$',
  },
  {
    question: 'Струна е закрепена в двата края и трепти с основния си тон. Каква е връзката между дължината ѝ и дължината на вълната?',
    answers: ['$L = \\frac{\\lambda}{2}$', '$L = \\lambda$', '$L = 2\\lambda$', '$L = \\frac{\\lambda}{4}$'],
    correctAnswer: '$L = \\frac{\\lambda}{2}$',
  },
  {
    question: 'Колко е разстоянието между два съседни възела на стояща вълна?',
    answers: ['$\\frac{\\lambda}{2}$', '$\\lambda$', '$\\frac{\\lambda}{4}$', '$2\\lambda$'],
    correctAnswer: '$\\frac{\\lambda}{2}$',
  },
  {
    question: 'Звук преминава от въздуха във водата. Коя величина НЕ се променя?',
    answers: ['честотата', 'скоростта', 'дължината на вълната', 'и трите се променят'],
    correctAnswer: 'честотата',
  },
  {
    question: 'Две вълни от еднакви източници пристигат в точка с разлика в пътищата $1{,}5\\lambda$. Какво се наблюдава там?',
    answers: ['отслабване', 'усилване', 'стояща вълна', 'удвояване на честотата'],
    correctAnswer: 'отслабване',
  },
  {
    question: 'Какво чуваш, когато източник на звук се приближава към теб?',
    answers: ['по-висок тон', 'по-нисък тон', 'същия тон, но по-силно', 'същия тон, но по-тихо'],
    correctAnswer: 'по-висок тон',
  },
  {
    question: 'Самолет лети с двойната скорост на звука. Колко е половината ъгъл на конуса на Мах?',
    answers: ['$30^\\circ$', '$60^\\circ$', '$45^\\circ$', '$90^\\circ$'],
    correctAnswer: '$30^\\circ$',
  },
];

// ---------- Страница ----------

export function Waves() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Вълни</h1>

        <div className="bg-gradient-to-br from-emerald-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🎺 През 1842 г. австриецът Кристиан Доплер предсказва, че <Term id="frequency">честотата</Term> на вълна зависи от това дали източникът се движи към нас или
            от нас. Три години по-късно холандецът Кристоф Бюйс Бало решава да го провери – според описанията с открита платформа на влак
            между Утрехт и Марсен, на която свирят тромпетисти, и с музиканти с абсолютен слух край линията. Когато влакът се приближава,
            музикантите чуват тона по-висок, а когато се отдалечава – по-нисък. Днес същият ефект измерва скоростта на колите, кръвта във
            вените и галактиките във Вселената.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Какво е вълна?</h2>
          <p className={text}>
            Хвърли камък в езеро: кръговете бягат навън, но листото на водата само се полюшва на място. Вълната е разпространение на{' '}
            <strong>трептене</strong> (виж{' '}
            <Link to="/physics/waves/oscillations" className={link}>
              Трептения
            </Link>
            ) от една частица на средата към съседната. Така се пренася енергия – вълните на океана рушат брегове, – без веществото да пътува
            заедно с вълната.
          </p>
          <Theorem
            type="definition"
            title="Напречни и надлъжни вълни"
            description="При напречната вълна частиците трептят перпендикулярно на посоката на разпространение (въже, вълни по струна). При надлъжната – по посоката на разпространение, като се образуват сгъстявания и разреждания (пружина, звук). Напречни механични вълни има само в среди, които се съпротивляват на срязване – твърди тела и повърхността на течности; надлъжни – във всички среди."
          />
          <WaveMachineLab />
          <p className={text}>
            При земетресение тръгват и двата вида: по-бързите надлъжни P вълни и по-бавните напречни S вълни. S вълните не минават през течност
            – и от „сянката“, която външното ядро на Земята хвърля за тях, сеизмолозите са заключили, че то е течно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Дължина на вълната, честота и скорост</h2>
          <Theorem
            title="Основни величини на вълната"
            description="Дължината на вълната $\lambda$ е разстоянието между два съседни гребена (или две съседни точки, които трептят еднакво). Периодът $T$ и честотата $f = \frac{1}{T}$ са тези на трептенето на частиците. За един период вълната изминава една дължина на вълната, затова $v = \frac{\lambda}{T} = \lambda f$."
          />
          <p className={text}>
            Скоростта зависи от <strong>средата</strong>, а не от източника: звукът във въздуха е около 340 m/s, във водата – около 1500 m/s, в
            стоманата – около 5000 m/s. По опъната струна вълната бяга с <Tex>{'v = \\sqrt{\\frac{F}{\\mu}}'}</Tex>, където <Tex>{'F'}</Tex> е
            опъването, а <Tex>{'\\mu'}</Tex> – масата на метър дължина. Честотата пък се определя от <strong>източника</strong> – затова при
            преминаване в друга среда се мени дължината на вълната, а честотата остава.
          </p>
          <p className={text}>
            Математически бягащата вълна се описва с <Tex>{'y = A\\sin(\\omega t - kx)'}</Tex>, където <Tex>{'\\omega = 2\\pi f'}</Tex> и{' '}
            <Tex>{'k = \\frac{2\\pi}{\\lambda}'}</Tex>: при фиксирано <Tex>{'x'}</Tex> това е трептене във времето, а при фиксирано{' '}
            <Tex>{'t'}</Tex> – синусоида в пространството („снимка“ на въжето).
          </p>
          <Example
            description="Камертонът „ла“ трепти с 440 Hz. Каква е дължината на звуковата вълна във въздуха и във водата?"
            steps={['Във въздуха: $\\lambda = \\frac{340}{440} \\approx 0{,}773\\ \\mathrm{m}$', 'Във водата: $\\lambda = \\frac{1500}{440} \\approx 3{,}41\\ \\mathrm{m}$', 'Тонът е същият (440 Hz), но вълната във водата е над 4 пъти по-дълга.']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Отражение, суперпозиция и интерференция</h2>
          <p className={text}>
            Изпрати импулс по въже, вързано за стена: той се връща <strong>обърнат</strong> – гърбицата става вдлъбнатина. Ако краят е свободен
            (на халка, която се плъзга по прът), импулсът се връща необърнат. Когато две вълни се срещнат, те просто се събират и после
            продължават, сякаш нищо не се е случило.
          </p>
          <Theorem
            title="Принцип на суперпозицията и интерференция"
            description="Отклонението в точка, до която стигат няколко вълни, е сборът от отклоненията на отделните вълни. Две еднакви вълни, тръгнали в една фаза, се усилват там, където разликата в пътищата е цял брой дължини на вълната: $\Delta = n\lambda$, и се отслабват (при еднаква амплитуда – гасят), където $\Delta = \left(n + \frac{1}{2}\right)\lambda$."
          />
          <Example
            description="Два високоговорителя излъчват в една фаза тон с 680 Hz. Слушател е на 3,00 m от единия и на 3,75 m от другия. Какво чува?"
            steps={['$\\lambda = \\frac{340}{680} = 0{,}5\\ \\mathrm{m}$', '$\\Delta = 3{,}75 - 3{,}00 = 0{,}75\\ \\mathrm{m} = 1{,}5\\lambda$', 'Половин дължина на вълната в повече – вълните се гасят и тонът е много по-тих.']}
          />
          <p className={text}>
            Вълните заобикалят препятствия и се разливат зад отвори – това е <strong>дифракция</strong>. Тя е силна, когато отворът е от <Term id="order-of-magnitude">порядъка</Term>{' '}
            на дължината на вълната. Звукът (дължина около метър) минава през вратата и зад ъгъла, а светлината (под микрометър) хвърля остра
            сянка. Затова чуваме, но не виждаме човека в съседната стая.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Стоящи вълни</h2>
          <p className={text}>
            Опъната струна е закрепена в двата края. Вълната се отразява от краищата, бяга обратно и се среща със себе си. При някои честоти
            резултатът е <strong>стояща вълна</strong>: точки, които изобщо не трептят (възли), и точки, които трептят най-силно (пучности).
          </p>
          <Theorem
            title="Стояща вълна по струна със закрепени краища"
            description="Краищата са възли, а между два съседни възела има $\frac{\lambda}{2}$. Затова по струната се побират само цял брой половинки: $L = n\frac{\lambda_n}{2}$, и възможните честоти са $f_n = \frac{nv}{2L}$, $n = 1, 2, 3, \ldots$ Най-ниската $f_1$ е основният тон, а $f_2 = 2f_1$, $f_3 = 3f_1, \ldots$ – хармониците."
          />
          <StandingWaveLab />
          <Example
            description="Струна на китара е дълга 0,65 m, с маса 0,5 g на метър, опъната с 80 N. Каква е честотата на основния тон?"
            steps={['$v = \\sqrt{\\frac{F}{\\mu}} = \\sqrt{\\frac{80}{0{,}0005}} = 400\\ \\mathrm{m/s}$', '$f_1 = \\frac{v}{2L} = \\frac{400}{1{,}3} \\approx 308\\ \\mathrm{Hz}$', 'Като натиснем струната на прага, я скъсяваме и тонът се повишава.']}
          />
          <p className={text}>
            Как <Term id="harmonics">хармониците</Term> правят звука на цигулката различен от този на флейтата, разказваме в урока{' '}
            <Link to="/physics/waves/sound" className={link}>
              Звук
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Ефект на Доплер и ударни вълни</h2>
          <p className={text}>
            Когато източникът се движи към нас, той „настига“ собствените си гребени: те пристигат по-нагъсто и честотата е по-висока. Когато се
            отдалечава – гребените се разреждат и тонът пада. Подобно е и когато ние се движим към неподвижен източник.
          </p>
          <Theorem
            title="Ефект на Доплер за звук"
            description="Ако $u$ е скоростта на звука във въздуха, $v_s$ – на източника, а $v_n$ – на наблюдателя, то $f = f_0\,\frac{u \pm v_n}{u \mp v_s}$. Горните знаци са при сближаване, долните – при отдалечаване."
          />
          <DopplerLab />
          <Theorem
            title="Конус на Мах"
            description="Ако източникът е по-бърз от звука ($v > u$), гребените се събират в конус – ударна вълна, която чуваме като трясък. Половината ъгъл при върха е $\sin\theta = \frac{u}{v}$. Числото $\frac{v}{u}$ се нарича число на Мах."
          />
          <p className={text}>
            За светлината ефектът е същият по смисъл, но формулата е друга – той показва, че галактиките се отдалечават от нас (виж{' '}
            <Link to="/astronomy/lecture09" className={link}>
              Светлина и спектри
            </Link>{' '}
            и{' '}
            <Link to="/astronomy/lecture28" className={link}>
              Разширяване на Вселената
            </Link>
            ).
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
          <h2 className={h2}>7. Вълните около нас</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Какво пътува', 'водата се движи заедно с вълната', 'пренася се енергия; частиците само трептят около местата си'],
              ['Скоростта и честотата', 'по-висок тон бяга по-бързо', 'скоростта зависи от средата: $v = \\lambda f$, по-високият тон е с по-къса $\\lambda$'],
              ['Смяна на средата', 'в друга среда се мени честотата', 'честотата остава (определя я източникът); мени се $\\lambda$'],
              ['Възли и пучности', 'между два възела има $\\lambda$', 'между два съседни възела има $\\frac{\\lambda}{2}$'],
              ['Гасене', 'при $\\Delta = \\lambda$ вълните се гасят', 'гасят се при $\\Delta = \\left(n + \\frac{1}{2}\\right)\\lambda$; при $\\Delta = n\\lambda$ се усилват'],
              ['Доплер', 'тонът е висок, защото източникът е близо', 'тонът е висок, докато източникът се приближава – дори когато е далеч'],
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
              <Task id="a1" number={1} color="border-green-500" question="Звукова вълна има дължина 0,5 m и честота 680 Hz. Намерете скоростта ѝ и периода в милисекунди." check={[340, 1.47]} ask={['$v$, m/s', '$T$, ms']}>
                <p><Tex>{'v = \\lambda f = 0{,}5 \\cdot 680 = 340\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'T = \\frac{1}{680} \\approx 0{,}00147\\ \\mathrm{s} = 1{,}47\\ \\mathrm{ms}'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="По въже бяга вълна. Между първия и петия гребен има 6 m, а ръката, която я създава, прави 2 трептения в секунда. Намерете дължината на вълната и скоростта ѝ." check={[1.5, 3]} ask={['$\\lambda$, m', '$v$, m/s']}>
                <p>Между първия и петия гребен има 4 дължини на вълната: <Tex>{'\\lambda = \\frac{6}{4} = 1{,}5\\ \\mathrm{m}'}</Tex>.</p>
                <p><Tex>{'v = \\lambda f = 1{,}5 \\cdot 2 = 3\\ \\mathrm{m/s}'}</Tex></p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Струна на китара е дълга 0,65 m и основният ѝ тон е 110 Hz. Намерете дължината на вълната на основния тон и скоростта на вълните по струната." check={[1.3, 143]} ask={['$\\lambda_1$, m', '$v$, m/s']}>
                <p>При основния тон <Tex>{'L = \\frac{\\lambda_1}{2}'}</Tex>, т.е. <Tex>{'\\lambda_1 = 2L = 1{,}3\\ \\mathrm{m}'}</Tex>.</p>
                <p><Tex>{'v = \\lambda_1 f_1 = 1{,}3 \\cdot 110 = 143\\ \\mathrm{m/s}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Струна с маса 0,5 g на метър е опъната с 80 N, а дължината ѝ между закрепванията е 0,65 m. Намерете скоростта на вълните и честотата на основния тон." check={[400, 308]} ask={['$v$, m/s', '$f_1$, Hz']}>
                <p><Tex>{'\\mu = 0{,}5\\ \\mathrm{g/m} = 5 \\cdot 10^{-4}\\ \\mathrm{kg/m}'}</Tex></p>
                <p><Tex>{'v = \\sqrt{\\frac{80}{5 \\cdot 10^{-4}}} = \\sqrt{160\\,000} = 400\\ \\mathrm{m/s}'}</Tex></p>
                <p><Tex>{'f_1 = \\frac{v}{2L} = \\frac{400}{1{,}3} \\approx 308\\ \\mathrm{Hz}'}</Tex>. При 4 пъти по-силно опъване тонът би се удвоил.</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Два високоговорителя излъчват в една фаза тон с 680 Hz. Слушател е на 3,00 m от единия и на 3,75 m от другия. На колко дължини на вълната е равна разликата в пътищата? Усилване ли чува или отслабване?" check={[1.5]} ask={['$\\Delta / \\lambda$']}>
                <p><Tex>{'\\lambda = \\frac{340}{680} = 0{,}5\\ \\mathrm{m}'}</Tex>, <Tex>{'\\Delta = 0{,}75\\ \\mathrm{m}'}</Tex></p>
                <p><Tex>{'\\frac{\\Delta}{\\lambda} = 1{,}5'}</Tex> – цял брой и половина, затова вълните се отслабват.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="Шофираш с 20 m/s право към неподвижна сирена, която свири с 500 Hz. Каква честота чуваш?" check={[529]} ask={['честота, Hz']}>
                <p>Наблюдателят се приближава: <Tex>{'f = f_0 \\frac{u + v_n}{u}'}</Tex>.</p>
                <p><Tex>{'f = 500 \\cdot \\frac{360}{340} \\approx 529\\ \\mathrm{Hz}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Кола минава покрай теб с включен клаксон. Докато се приближава, тонът е 1,2 пъти по-висок, отколкото след като отмине. С каква скорост се движи колата (в m/s)?" check={[30.9]} ask={['скорост, m/s']}>
                <p><Tex>{'\\frac{f_{\\text{пр}}}{f_{\\text{отд}}} = \\frac{u/(u - v)}{u/(u + v)} = \\frac{u + v}{u - v} = 1{,}2'}</Tex></p>
                <p><Tex>{'u + v = 1{,}2u - 1{,}2v \\Rightarrow 2{,}2v = 0{,}2u'}</Tex></p>
                <p><Tex>{'v = \\frac{0{,}2 \\cdot 340}{2{,}2} \\approx 30{,}9\\ \\mathrm{m/s}'}</Tex> – около 111 km/h. Честотата на самия клаксон не ни трябва.</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Свръхзвуков самолет лети хоризонтално на височина 3 km с двойната скорост на звука (u = 340 m/s). Колко е половината ъгъл на конуса на Мах и след колко секунди, откакто самолетът мине точно над теб, ще чуеш трясъка?" check={[30, 7.64]} ask={['$\\theta$, °', 'време, s']}>
                <p><Tex>{'\\sin\\theta = \\frac{u}{v} = \\frac{1}{2} \\Rightarrow \\theta = 30^\\circ'}</Tex></p>
                <p>Конусът стига до теб, когато самолетът е отминал хоризонтално <Tex>{'x = \\frac{h}{\\tg\\theta} = \\frac{3000}{0{,}577} \\approx 5196\\ \\mathrm{m}'}</Tex>.</p>
                <p><Tex>{'t = \\frac{x}{v} = \\frac{5196}{680} \\approx 7{,}64\\ \\mathrm{s}'}</Tex> – самолетът отдавна е отминал, когато чуеш трясъка.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Въже с дължина 3 m е закрепено в двата края, а вълните по него бягат с 12 m/s. С каква честота трябва да се клати единият край, за да се получи третият хармоник, и колко възела (заедно с краищата) ще има?" check={[6, 4]} ask={['честота, Hz', 'брой възли']}>
                <p><Tex>{'f_n = \\frac{nv}{2L} = n \\cdot \\frac{12}{6} = 2n\\ \\mathrm{Hz}'}</Tex>, значи <Tex>{'f_3 = 6\\ \\mathrm{Hz}'}</Tex>.</p>
                <p>При <Tex>{'n = 3'}</Tex> по въжето има 3 половинки дължина на вълната, разделени от <Tex>{'n + 1 = 4'}</Tex> възела (два от тях са краищата).</p>
                <p>При всяка друга честота отразените вълни не съвпадат и въжето трепти неравномерно и слабо.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ Вълната пренася енергия без вещество; напречни и надлъжни вълни</li>
              <li>✓ <Tex>{'v = \\lambda f = \\frac{\\lambda}{T}'}</Tex>; скоростта зависи от средата, честотата – от източника</li>
              <li>✓ Суперпозиция: усилване при <Tex>{'\\Delta = n\\lambda'}</Tex>, отслабване при <Tex>{'\\Delta = \\left(n + \\frac{1}{2}\\right)\\lambda'}</Tex></li>
              <li>✓ Стояща вълна по струна: <Tex>{'L = n\\frac{\\lambda}{2}'}</Tex>, <Tex>{'f_n = \\frac{nv}{2L}'}</Tex>; между възлите има <Tex>{'\\frac{\\lambda}{2}'}</Tex></li>
              <li>✓ Доплер: <Tex>{'f = f_0\\frac{u \\pm v_n}{u \\mp v_s}'}</Tex> – по-висок тон при сближаване</li>
              <li>✓ Ударна вълна при <Tex>{'v > u'}</Tex>: <Tex>{'\\sin\\theta = \\frac{u}{v}'}</Tex></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              В открития океан вълната на цунами е висока едва около метър и корабите почти не я усещат. Но тя е стотици километри дълга и бяга
              със скорост около <Tex>{'\\sqrt{gh}'}</Tex>, където <Tex>{'h'}</Tex> е дълбочината: при 4 km това са около 200 m/s – над 700 km/h,
              колкото пътнически самолет. Край брега водата става плитка, вълната се забавя, предната ѝ част се „натрупва“ и височината ѝ може да
              стигне много метри.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
