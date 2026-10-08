import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import { RightTrigLab } from './RightTrigLab';
import { TriangleLawsLab } from './TriangleLawsLab';
import { UnitCircleLab } from './UnitCircleLab';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';
const link = 'text-blue-600 dark:text-blue-400 hover:underline';

// ---------- Тренажор: таблични стойности ----------

const NONE = 'не съществува';
const CHOICES = ['0', '1/2', '√2/2', '√3/2', '1', '√3/3', '√3', '−1/2', '−√2/2', '−√3/2', '−1', '−√3/3', '−√3', NONE];

// [функция, ъгъл, стойност] – ъгли от 0° до 180°
const TABLE: [string, number, string][] = [];
const VALUES: Record<number, [string, string, string]> = {
  0: ['0', '1', '0'],
  30: ['1/2', '√3/2', '√3/3'],
  45: ['√2/2', '√2/2', '1'],
  60: ['√3/2', '1/2', '√3'],
  90: ['1', '0', NONE],
  120: ['√3/2', '−1/2', '−√3'],
  135: ['√2/2', '−√2/2', '−1'],
  150: ['1/2', '−√3/2', '−√3/3'],
  180: ['0', '−1', '0'],
};
Object.entries(VALUES).forEach(([deg, [s, c, t]]) => {
  TABLE.push(['sin', Number(deg), s], ['cos', Number(deg), c], ['tg', Number(deg), t]);
});

/** Случаен въпрос, различен от предишния. */
const pick = (prev?: number) => {
  let i: number;
  do i = Math.floor(Math.random() * TABLE.length);
  while (i === prev);
  return i;
};

function Trainer() {
  const [task, setTask] = useState(() => pick());
  const [chosen, setChosen] = useState<string | null>(null);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fn, deg, answer] = TABLE[task];
  const right = chosen === answer;

  const choose = (v: string) => {
    if (chosen !== null) return;
    setChosen(v);
    if (v === answer) {
      setSolved(solved + 1);
      setStreak(streak + 1);
      setBest(Math.max(best, streak + 1));
    } else setStreak(0);
  };

  const next = () => {
    setTask(pick(task));
    setChosen(null);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center font-mono text-2xl sm:text-3xl mb-4 text-gray-800 dark:text-gray-100">
        {fn} {deg}° = ?
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
        {CHOICES.map(v => (
          <button
            key={v}
            onClick={() => choose(v)}
            disabled={chosen !== null}
            className={`px-3 py-2 rounded-lg border-2 font-mono text-sm sm:text-base min-w-[3.5rem] transition ${
              chosen !== null && v === answer
                ? 'border-green-500 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                : v === chosen
                  ? 'border-red-500 bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-sky-400'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {chosen !== null && (
        <div className="mt-4 text-center">
          <p className={`flex items-center justify-center gap-2 font-semibold ${right ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {right ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {right ? (streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : 'Браво! 🎉') : `Не съвсем: ${fn} ${deg}° = ${answer}`}
          </p>
          {!right && deg > 90 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Подсказка: {fn === 'sin' ? `sin ${deg}° = sin ${180 - deg}°` : `${fn} ${deg}° = −${fn} ${180 - deg}°`}
            </p>
          )}
          <button onClick={next} className="mt-3 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
            Следващ →
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🪜 Стълба',
    problem: 'Стълба с дължина 5 m е опряна на стена и сключва със земята ъгъл 70°. На каква височина достига горният ѝ край?',
    solution: ['Стълбата е хипотенуза, височината е катетът срещу ъгъла 70°.', 'h = 5 · sin 70° ≈ 5 · 0,940', 'h ≈ 4,70'],
    answer: '≈ 4,70 m',
    check: [4.7],
    ask: ['височина, m'],
  },
  {
    title: '⛰️ Пътен знак',
    problem: 'Знакът „Стръмен наклон 10%“ означава, че пътят се изкачва с 10 m на всеки 100 m по хоризонтала. Какъв ъгъл сключва пътят с хоризонталата?',
    solution: ['Наклонът в проценти е tg на ъгъла: tg α = 10/100 = 0,1', 'α = arctg 0,1 ≈ 5,71°'],
    answer: '≈ 5,7° – много по-малко, отколкото изглежда!',
    check: [5.71],
    ask: ['ъгъл, °'],
  },
  {
    title: '🏢 Сграда',
    problem: 'Стоиш на 30 m от сграда и виждаш върха ѝ под ъгъл 40° спрямо хоризонталата. Очите ти са на 1,6 m над земята. Колко е висока сградата?',
    solution: ['Над нивото на очите: x = 30 · tg 40° ≈ 30 · 0,839 ≈ 25,17 m', 'Добавяме височината на очите: h ≈ 25,17 + 1,6 ≈ 26,8 m'],
    answer: '≈ 26,8 m',
    check: [26.8],
    ask: ['височина, m'],
  },
  {
    title: '🪁 Хвърчило',
    problem: 'Конецът на хвърчило е опънат и дълъг 50 m, а ъгълът му с хоризонталата е 35°. На каква височина над ръката е хвърчилото?',
    solution: ['h = 50 · sin 35°', 'sin 35° ≈ 0,574', 'h ≈ 28,7'],
    answer: '≈ 28,7 m',
    check: [28.7],
    ask: ['височина, m'],
  },
  {
    title: '🌊 Ширина на езеро',
    problem:
      'Не можем да измерим директно разстоянието между точките A и B на двата бряга на езеро. От точка C на сушата измерваме CA = 300 m, CB = 400 m и ∠ACB = 60°. Колко е AB?',
    solution: ['Косинусова теорема: AB² = 300² + 400² − 2 · 300 · 400 · cos 60°', 'AB² = 90 000 + 160 000 − 120 000 = 130 000', 'AB = √130 000 ≈ 360,6'],
    answer: '≈ 360,6 m',
    check: [360.6],
    ask: ['разстояние, m'],
  },
  {
    title: '🌾 Нива',
    problem: 'Триъгълна нива има две страни 40 m и 50 m, които сключват ъгъл 30°. Колко квадратни метра е тя?',
    solution: ['S = ½ · a · b · sin γ', 'S = ½ · 40 · 50 · sin 30° = ½ · 40 · 50 · ½', 'S = 500'],
    answer: '500 m²',
    check: [500],
    ask: ['лице, m²'],
  },
];

// ---------- Тест ----------

const trigQuiz: Question[] = [
  {
    question: 'В правоъгълен триъгълник sin α е отношението на:',
    answers: ['противолежащия катет към хипотенузата', 'прилежащия катет към хипотенузата', 'противолежащия към прилежащия катет', 'хипотенузата към противолежащия катет'],
    correctAnswer: 'противолежащия катет към хипотенузата',
  },
  {
    question: 'На колко е равно sin 30°?',
    answers: ['1/2', '√2/2', '√3/2', '√3/3'],
    correctAnswer: '1/2',
  },
  {
    question: 'На колко е равно tg 45°?',
    answers: ['0', '1/2', '1', '√3'],
    correctAnswer: '1',
  },
  {
    question: 'Ъгълът α е остър и sin α = 0,6. На колко е равно cos α?',
    answers: ['0,4', '0,8', '0,36', '0,64'],
    correctAnswer: '0,8',
  },
  {
    question: 'На колко е равно sin 150°?',
    answers: ['−1/2', '1/2', '−√3/2', '√3/2'],
    correctAnswer: '1/2',
  },
  {
    question: 'На колко е равно cos 120°?',
    answers: ['1/2', '−1/2', '√3/2', '−√3/2'],
    correctAnswer: '−1/2',
  },
  {
    question: 'Коя е косинусовата теорема за страната c срещу ъгъла γ?',
    answers: ['c² = a² + b² − 2ab · cos γ', 'c² = a² + b² + 2ab · cos γ', 'c = a · cos β + b · cos α · sin γ', 'c² = a² + b² − 2ab · sin γ'],
    correctAnswer: 'c² = a² + b² − 2ab · cos γ',
  },
  {
    question: 'В триъгълник a = 10 и α = 30°. Колко е радиусът R на описаната окръжност?',
    answers: ['5', '10', '20', '5√3'],
    correctAnswer: '10',
  },
  {
    question: 'Две страни на триъгълник са 6 и 8, а ъгълът между тях е 30°. Колко е лицето му?',
    answers: ['12', '24', '48', '12√3'],
    correctAnswer: '12',
  },
];

// ---------- Страница ----------

export function Trigonometry() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Тригонометрия</h1>

        <div className="bg-gradient-to-br from-sky-800 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🏔️ През XIX век британските геодезисти в Индия мерят един връх, наречен просто „Пик XV“, от точки на повече от 100 km разстояние. Не
            могат да се качат на него – дори не могат да влязат в Непал. Имат само теодолит (уред за мерене на ъгли), измерени разстояния
            между наблюдателните точки и тригонометрия. През 1856 г. обявяват височина 29 002 фута (около 8840 m) – най-високия връх на света,
            по-късно наречен Еверест. Днешното измерване от 2020 г. е 8848,86 m: разлика под 0,1%, постигната с ъгли и синуси.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Синус, косинус и тангенс на остър ъгъл</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Два правоъгълни триъгълника – единият малък, начертан в тетрадка, другият огромен, образуван от
              сянката на кула – имат еднакъв остър ъгъл 35°. Какво общо има между тях? Всички техни отношения на страни са равни – защото са{' '}
              <Link to="/geometry/similar" className={link}>
                подобни
              </Link>
              . Затова тези отношения можем да пресметнем веднъж и да ги „закачим“ за самия ъгъл.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Тригонометрични функции на остър ъгъл"
            description="В правоъгълен триъгълник с остър ъгъл α, хипотенуза c, противолежащ катет a и прилежащ катет b: sin α = a/c, cos α = b/c, tg α = a/b, cotg α = b/a. Те зависят само от ъгъла α, не от размера на триъгълника."
          />
          <RightTrigLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Стойности за 30°, 45° и 60°</h2>
          <p className={text}>
            Тези стойности се извеждат от две фигури. Диагоналът дели квадрата на два равнобедрени правоъгълни триъгълника с ъгли 45° и катети
            1 и 1, а хипотенуза √2. Височината дели равностранния триъгълник със страна 2 на два триъгълника с ъгли 30° и 60°, катети 1 и √3 и
            хипотенуза 2.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base text-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded shadow-sm font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2 sm:p-3 text-left font-sans">α</th>
                  {['0°', '30°', '45°', '60°', '90°'].map(d => (
                    <th key={d} className="p-2 sm:p-3">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['sin α', '0', '1/2', '√2/2', '√3/2', '1'],
                  ['cos α', '1', '√3/2', '√2/2', '1/2', '0'],
                  ['tg α', '0', '√3/3', '1', '√3', '—'],
                  ['cotg α', '—', '√3', '1', '√3/3', '0'],
                ].map(([name, ...vals]) => (
                  <tr key={name} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                    <td className="p-2 sm:p-3 text-left">{name}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="p-2 sm:p-3">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={text}>
            Лесно за запомняне: sin за 0°, 30°, 45°, 60°, 90° е √0/2, √1/2, √2/2, √3/2, √4/2 – а cos е същият ред, обърнат.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Основни тъждества</h2>
          <Theorem
            title="Връзки между функциите на един ъгъл"
            description="sin²α + cos²α = 1 (Питагоровата теорема, разделена на c²); tg α = sin α / cos α; cotg α = cos α / sin α; tg α · cotg α = 1. За допълнителни ъгли: sin(90° − α) = cos α и cos(90° − α) = sin α – двата остри ъгъла в правоъгълен триъгълник си разменят катетите."
          />
          <Example
            description="Ъгълът α е остър и cos α = 5/13. Да намерим sin α и tg α."
            steps={['sin²α = 1 − cos²α = 1 − 25/169 = 144/169', 'α е остър ⇒ sin α > 0 ⇒ sin α = 12/13', 'tg α = sin α / cos α = (12/13) : (5/13) = 12/5']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Решаване на правоъгълен триъгълник</h2>
          <p className={text}>
            „Да решим триъгълник“ значи да намерим всичките му страни и ъгли. В правоъгълния триъгълник са достатъчни два елемента (освен
            правия ъгъл), поне единият от които е страна.
          </p>
          <Example
            description="Хипотенузата е c = 10, а острият ъгъл α = 30°. Да намерим катетите и другия ъгъл."
            steps={['β = 90° − 30° = 60°', 'a = c · sin α = 10 · 1/2 = 5', 'b = c · cos α = 10 · √3/2 = 5√3 ≈ 8,66']}
          />
          <Example
            description="Катетите са a = 7 и b = 24. Да намерим хипотенузата и ъглите."
            steps={['c = √(49 + 576) = √625 = 25', 'tg α = 7/24 ≈ 0,292 ⇒ α ≈ 16,3° (с калкулатор: tan⁻¹)', 'β = 90° − α ≈ 73,7°']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Ъгли до 180° и единичната окръжност</h2>
          <p className={text}>
            В правоъгълен триъгълник ъгълът е винаги остър. За тъпи ъгли (а и за ъгли над 180°) имаме нужда от нова дефиниция. Нанасяме ъгъла
            в единична окръжност и казваме: cos α е абсцисата, а sin α – ординатата на точката. За острите ъгли тя съвпада със старата.
          </p>
          <Theorem
            title="Формули за 180° − α"
            description="sin(180° − α) = sin α; cos(180° − α) = −cos α; tg(180° − α) = −tg α. Следствие: за тъпите ъгли синусът е положителен, а косинусът и тангенсът – отрицателни. Например sin 150° = sin 30° = 1/2, cos 120° = −cos 60° = −1/2."
          />
          <UnitCircleLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>6. Синусова и косинусова теорема</h2>
          <p className={text}>Тези две теореми решават произволен триъгълник – не само правоъгълен.</p>
          <Theorem
            title="Синусова теорема"
            description="Във всеки триъгълник a/sin α = b/sin β = c/sin γ = 2R, където R е радиусът на описаната окръжност. Използваме я, когато знаем страна и срещулежащия ѝ ъгъл."
          />
          <Theorem
            title="Косинусова теорема"
            description="Във всеки триъгълник c² = a² + b² − 2ab · cos γ (и аналогично за другите страни). При γ = 90° тя е Питагоровата теорема. Използваме я, когато знаем две страни и ъгъла между тях или трите страни."
          />
          <Theorem
            title="Лице чрез синус"
            description="S = ½ · a · b · sin γ – половината от произведението на две страни и синуса на ъгъла между тях. Като заместим sin γ = c/(2R), получаваме и S = abc/(4R)."
          />
          <TriangleLawsLab />
          <Example
            description="Страните на триъгълник са a = 7, b = 8 и c = 13. Да намерим най-големия ъгъл."
            steps={['Най-големият ъгъл е срещу най-голямата страна – γ срещу c = 13', 'cos γ = (a² + b² − c²)/(2ab) = (49 + 64 − 169)/112 = −56/112 = −1/2', 'γ = 120° (тъп ъгъл – косинусът е отрицателен)']}
          />
          <Example
            description="В триъгълник a = 6, α = 30° и β = 45°. Да намерим b и R."
            steps={['Синусова теорема: b = a · sin β / sin α = 6 · (√2/2) : (1/2) = 6√2 ≈ 8,49', '2R = a / sin α = 6 : (1/2) = 12 ⇒ R = 6']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 7. Тренажор: таблични стойности
          </h2>
          <p className={text}>Олимпиадните задачи очакват точните стойности наизуст. Колко поредни верни отговора можеш да постигнеш?</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. Задачи от живота</h2>
          <p className={text}>
            За ъгли, които не са в таблицата, използвай калкулатор – но първо провери, че е в режим <strong>DEG</strong> (градуси)!
          </p>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>9. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Калкулатор в радиани', 'sin 30 = −0,988', 'режим DEG: sin 30° = 0,5'],
              ['Объркани отношения', 'sin α = противолежащ / прилежащ', 'това е tg α; sin α = противолежащ / хипотенуза'],
              ['„Изваждане“ на числото пред ъгъла', 'sin 60° = 2 · sin 30° = 1', 'sin 60° = √3/2 ≈ 0,866'],
              ['Знак при тъп ъгъл', 'cos 120° = 1/2', 'cos 120° = −cos 60° = −1/2'],
              ['Ъгъл по синус – изгубено решение', 'sin β = 1/2 ⇒ β = 30°', 'β = 30° или β = 150° (ако е възможно)'],
              ['Косинусова теорема с грешен ъгъл', 'c² = a² + b² − 2ab · cos α', 'ъгълът е срещу c, т.е. между a и b: γ'],
            ].map(([title, wrong, right]) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
                <p className="font-semibold mb-1">{title}</p>
                <p className="font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">✗ {wrong}</p>
                <p className="font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">✓ {right}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 🎯 Бърз тест</h2>
          <Quiz questions={trigQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="Катетите на правоъгълен триъгълник са 3 и 4. Намерете sin, cos и tg на ъгъла α срещу катета 3.">
                <p>Хипотенузата е √(9 + 16) = 5.</p>
                <p>sin α = 3/5 = 0,6; cos α = 4/5 = 0,8; tg α = 3/4 = 0,75</p>
                <p>Проверка: 0,6² + 0,8² = 0,36 + 0,64 = 1 ✓</p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Хипотенузата на правоъгълен триъгълник е 10, а единият му ъгъл е 30°. Намерете катетите.">
                <p>Катетът срещу 30° е a = 10 · sin 30° = 5 (половината от хипотенузата).</p>
                <p>Другият катет е b = 10 · cos 30° = 5√3 ≈ 8,66.</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Пресметнете sin²30° + cos²60° + tg 45°.">
                <p>sin 30° = 1/2 ⇒ sin²30° = 1/4</p>
                <p>cos 60° = 1/2 ⇒ cos²60° = 1/4</p>
                <p>1/4 + 1/4 + 1 = 1,5</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="Ъгълът α е остър и tg α = 2. Намерете sin α и cos α.">
                <p>Нека a = 2 и b = 1 (катети с отношение 2). Хипотенузата е √5.</p>
                <p>sin α = 2/√5 = 2√5/5 ≈ 0,894</p>
                <p>cos α = 1/√5 = √5/5 ≈ 0,447</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Страните на триъгълник са 7, 8 и 13. Намерете най-големия му ъгъл.">
                <p>Той е срещу страната 13: cos γ = (7² + 8² − 13²)/(2 · 7 · 8) = (49 + 64 − 169)/112</p>
                <p>cos γ = −56/112 = −1/2</p>
                <p>γ = 120°</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="В триъгълник a = 6, α = 30° и β = 45°. Намерете b и радиуса на описаната окръжност.">
                <p>a/sin α = 6 : (1/2) = 12 = 2R ⇒ R = 6</p>
                <p>b = 2R · sin β = 12 · √2/2 = 6√2 ≈ 8,49</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Докажи, че за всеки триъгълник S = abc/(4R).">
                <p>Лицето е S = ½ · a · b · sin γ.</p>
                <p>От синусовата теорема c = 2R · sin γ, т.е. sin γ = c/(2R).</p>
                <p>S = ½ · a · b · c/(2R) = abc/(4R).</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Изведи формулата за медианата mc = ½√(2a² + 2b² − c²) и я приложи за страни a = 5, b = 6, c = 7.">
                <p>Нека M е средата на AB, ∠AMC = φ, ∠BMC = 180° − φ. Косинусова теорема в двата триъгълника:</p>
                <p>b² = m² + c²/4 − m · c · cos φ и a² = m² + c²/4 + m · c · cos φ (защото cos(180° − φ) = −cos φ).</p>
                <p>Събираме: a² + b² = 2m² + c²/2 ⇒ m² = (2a² + 2b² − c²)/4.</p>
                <p>За 5, 6, 7: m² = (50 + 72 − 49)/4 = 73/4 ⇒ m = √73/2 ≈ 4,27.</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Страните на триъгълник са 5, 6 и 7. Намерете лицето му и радиуса на описаната окръжност.">
                <p>cos γ (срещу 7) = (25 + 36 − 49)/60 = 1/5 ⇒ sin γ = √(1 − 1/25) = 2√6/5</p>
                <p>S = ½ · 5 · 6 · 2√6/5 = 6√6 ≈ 14,70</p>
                <p>R = abc/(4S) = 210/(24√6) = 35√6/24 ≈ 3,57</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>12. Обобщение</h2>
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ sin α = a/c, cos α = b/c, tg α = a/b – зависят само от ъгъла (подобни триъгълници)</li>
              <li>✓ 30°, 45°, 60°: sin = 1/2, √2/2, √3/2; cos – в обратен ред</li>
              <li>✓ sin²α + cos²α = 1; tg α = sin α / cos α; sin(90° − α) = cos α</li>
              <li>✓ Единична окръжност: cos α = x, sin α = y; sin(180° − α) = sin α, cos(180° − α) = −cos α</li>
              <li>✓ Синусова теорема: a/sin α = b/sin β = c/sin γ = 2R</li>
              <li>✓ Косинусова теорема: c² = a² + b² − 2ab · cos γ</li>
              <li>✓ Лице: S = ½ab · sin γ = abc/(4R)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Думата „синус“ има странна история. Индийските астрономи наричали половин хорда „джива“ – тетива на лък. Арабските учени
              заимствали думата като „джиба“, която се пише с едни и същи съгласни като „джайб“ – „пазва, гънка“. При превода на латински през
              XII век тя е предадена като <em>sinus</em> – „гънка, извивка“. Така, според най-разпространеното обяснение, тетивата на лъка се
              превърнала в „гънка“ заради една двусмислена дума.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
