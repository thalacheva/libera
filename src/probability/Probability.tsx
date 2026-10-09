import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { fracText } from '~/algebra/fractionMath';
import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import Theorem from '~/Theorem';
import { WordProblems, type WordProblem } from '~/WordProblems';
import FrequencyLab from './FrequencyLab';
import StatsLab from './StatsLab';
import TwoDiceLab from './TwoDiceLab';
import { MathText, Tex } from '~/MathText';

const h2 = 'text-xl sm:text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100';
const text = 'mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed';

// ---------- Тренажор: класическа вероятност ----------

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** m/n и (ако се съкращава) съкратеният вид. */
const ratio = (m: number, n: number) => (fracText(m, n) === `${m}/${n}` ? `${m}/${n}` : `${m}/${n} = ${fracText(m, n)}`);

type Drill = { text: string; good: number; total: number; steps: string[] };

const newDrill = (): Drill => {
  const kind = randInt(0, 3);
  if (kind === 0) {
    const k = randInt(1, 5);
    return {
      text: `Хвърляме зар. Каква е вероятността да се падне число, по-голямо от ${k}?`,
      good: 6 - k,
      total: 6,
      steps: [`Благоприятни: ${Array.from({ length: 6 - k }, (_, i) => k + 1 + i).join(', ')} – общо ${6 - k}`, `Всички: 6`, `P = ${ratio(6 - k, 6)}`],
    };
  }
  if (kind === 1) {
    const r = randInt(1, 8);
    const b = randInt(1, 8);
    const g = randInt(0, 5);
    return {
      text: `В кутия има ${r} червени, ${b} сини${g ? ` и ${g} зелени` : ''} топки. Изваждаме една наслуки. Каква е вероятността тя да е синя?`,
      good: b,
      total: r + b + g,
      steps: [`Благоприятни: ${b} сини`, `Всички: ${r + b + g} топки`, `P = ${ratio(b, r + b + g)}`],
    };
  }
  if (kind === 2) {
    const s = randInt(2, 12);
    const ways = 6 - Math.abs(7 - s);
    return {
      text: `Хвърляме два зара. Каква е вероятността сборът да е ${s}?`,
      good: ways,
      total: 36,
      steps: [`Двойките със сбор ${s} са ${ways}`, 'Всички наредени двойки: 6 · 6 = 36', `P = ${ratio(ways, 36)}`],
    };
  }
  const n = randInt(2, 3);
  return {
    text: `Хвърляме монета ${n} пъти. Каква е вероятността да се падне поне едно ези?`,
    good: 2 ** n - 1,
    total: 2 ** n,
    steps: [`Противоположното събитие „нито едно ези“ е само ${'Т'.repeat(n)}: вероятност 1/${2 ** n}`, `P = 1 − 1/${2 ** n} = ${2 ** n - 1}/${2 ** n}`],
  };
};

/** Приема 3/8, 0,375 или 37,5%. */
function parseProb(s: string) {
  const t = s.trim().replace(/\s/g, '').replace(',', '.');
  if (t === '') return null;
  if (t.endsWith('%')) {
    const v = Number(t.slice(0, -1));
    return Number.isNaN(v) ? null : v / 100;
  }
  if (t.includes('/')) {
    const [a, b] = t.split('/').map(Number);
    return Number.isNaN(a) || Number.isNaN(b) || b === 0 ? null : a / b;
  }
  const v = Number(t);
  return Number.isNaN(v) ? null : v;
}

function Trainer() {
  const [task, setTask] = useState<Drill>(newDrill);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const check = () => {
    const v = parseProb(input);
    if (v === null) return;
    // Десетичният отговор се приема, ако е закръглен до стотни
    if (Math.abs(v - task.good / task.total) < 0.006) {
      setResult('correct');
      setSolved(solved + 1);
      setStreak(streak + 1);
      setBest(Math.max(best, streak + 1));
    } else {
      setResult('wrong');
      setStreak(0);
    }
  };

  const next = () => {
    setTask(newDrill());
    setInput('');
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 border border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-4 text-gray-700 dark:text-gray-300">
        <span>✅ Решени: <strong>{solved}</strong></span>
        <span>🔥 Серия: <strong>{streak}</strong></span>
        <span>🏆 Рекорд: <strong>{best}</strong></span>
      </div>

      <p className="text-center text-base sm:text-lg mb-4 text-gray-800 dark:text-gray-100">{task.text}</p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span className="font-mono text-lg">P =</span>
        <input
          type="text"
          aria-label="Вероятност"
          placeholder="напр. 3/8"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={e => e.key === 'Enter' && (result === 'correct' ? next() : check())}
          disabled={result === 'correct'}
          className="w-28 px-3 py-2 rounded-lg border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 text-center font-mono text-lg"
        />
        {result === 'correct' ? (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition">
            Следваща →
          </button>
        ) : (
          <button onClick={check} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
            Провери
          </button>
        )}
      </div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Можеш да пишеш дроб (3/8), десетично число (0,375) или процент (37,5%).</p>

      {result && (
        <div
          className={`flex items-center justify-center gap-2 mt-4 font-semibold ${result === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {result === 'correct' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {result === 'correct'
            ? streak >= 5 ? `Невероятно! ${streak} поредни верни! 🚀` : `Браво! P = ${fracText(task.good, task.total)} 🎉`
            : 'Не съвсем. Преброй внимателно благоприятните и всички изходи.'}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-4 text-sm">
        <button onClick={() => setShowSteps(!showSteps)} className="text-blue-600 dark:text-blue-400 hover:underline">
          {showSteps ? '▼ Скрий решението' : '▶ Покажи решението'}
        </button>
        {result !== 'correct' && (
          <button onClick={next} className="text-gray-500 hover:underline">
            Пропусни
          </button>
        )}
      </div>

      {showSteps && (
        <ol className="list-decimal ml-8 mt-3 space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
          {task.steps.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------- Задачи от живота ----------

const wordProblems: WordProblem[] = [
  {
    title: '🎟️ Томбола',
    problem: 'В томбола има 50 билета, от които 2 са печеливши. Купуваш един билет. Каква е вероятността да спечелиш (в проценти)?',
    solution: ['$P = \\frac{2}{50} = \\frac{1}{25}$', '$= 0{,}04 = 4\\%$'],
    answer: '4%',
    check: [4],
    ask: ['вероятност, %'],
  },
  {
    title: '📚 Среден успех',
    problem: 'Оценките на Мария по математика са 4, 5, 6, 6 и 3. Какъв е средният ѝ успех?',
    solution: ['Сбор: $4 + 5 + 6 + 6 + 3 = 24$', 'Средно: $24 : 5 = 4{,}8$'],
    answer: '4,80',
    check: [4.8],
    ask: ['среден успех'],
  },
  {
    title: '💼 Заплати във фирма',
    problem: 'В малка фирма заплатите на петимата служители са 1000, 1100, 1200, 1300 и 9000 € (последната е на директора). Намерете средната заплата и медианата.',
    solution: ['Средно: $(1000 + 1100 + 1200 + 1300 + 9000) : 5 = 13\\,600 : 5 = 2720$ €', 'Медиана: средната от подредените стойности – 1200 €', 'Средното е по-голямо от заплатата на четирима от петимата – медианата описва „типичния“ служител по-добре.'],
    answer: 'Средно 2720 €, медиана 1200 €',
    check: [2720, 1200],
    ask: ['средно, €', 'медиана, €'],
  },
  {
    title: '👧👦 Две деца',
    problem: 'В семейство има две деца. Ако приемем, че момче и момиче са еднакво вероятни, каква е вероятността децата да са от различен пол (в проценти)?',
    solution: ['Равновероятните изходи (по-голямо; по-малко): ММ, МД, ДМ, ДД', 'Благоприятни: МД и ДМ – 2 от 4', '$P = \\frac{2}{4} = 50\\%$'],
    answer: '50%',
    check: [50],
    ask: ['вероятност, %'],
  },
  {
    title: '🌧️ Прогноза',
    problem: 'Вероятността за дъжд в събота е 30%, в неделя – също 30%, независимо от съботата. Каква е вероятността да вали поне в единия ден (в проценти)?',
    solution: ['Противоположното: не вали нито в събота, нито в неделя: $0{,}7 \\cdot 0{,}7 = 0{,}49$', '$P(\\text{поне един ден}) = 1 - 0{,}49 = 0{,}51$', '$= 51\\%$ (а не 60%!)'],
    answer: '51%',
    check: [51],
    ask: ['вероятност, %'],
  },
  {
    title: '🔐 ПИН код',
    problem: 'Някой се опитва да познае 4-цифрен ПИН код (от 0000 до 9999), като има 3 опита и не повтаря кодове. Каква е вероятността да успее (в проценти)?',
    solution: ['Възможните кодове са $10^4 = 10\\,000$.', 'С 3 различни опита „покрива“ 3 от тях: $P = \\frac{3}{10\\,000}$', '$= 0{,}0003 = 0{,}03\\%$'],
    answer: '0,03%',
    check: [0.03],
    ask: ['вероятност, %'],
  },
];

// ---------- Тест ----------

const probabilityQuiz: Question[] = [
  {
    question: 'Каква е вероятността при хвърляне на зар да се падне четно число?',
    answers: ['$\\frac{1}{6}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$', '$\\frac{2}{3}$'],
    correctAnswer: '$\\frac{1}{2}$',
  },
  {
    question: 'Хвърляме два зара. Каква е вероятността сборът да е 7?',
    answers: ['$\\frac{1}{12}$', '$\\frac{1}{11}$', '$\\frac{1}{6}$', '$\\frac{7}{36}$'],
    correctAnswer: '$\\frac{1}{6}$',
  },
  {
    question: 'Хвърляме монета два пъти. Каква е вероятността да се падне поне едно ези?',
    answers: ['$\\frac{1}{4}$', '$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{3}{4}$'],
    correctAnswer: '$\\frac{3}{4}$',
  },
  {
    question: 'Монета е паднала ези 5 пъти поред. Каква е вероятността при шестото хвърляне да падне ези?',
    answers: ['$\\frac{1}{2}$', 'по-малко от $\\frac{1}{2}$ – „ред е“ на тура', 'по-голямо от $\\frac{1}{2}$ – „върви“ на ези', '$\\frac{1}{64}$'],
    correctAnswer: '$\\frac{1}{2}$',
  },
  {
    question: '$P(A) = 0{,}3$. Колко е вероятността на противоположното събитие?',
    answers: ['0,3', '0,7', '−0,3', '1,3'],
    correctAnswer: '0,7',
  },
  {
    question: 'Колко е медианата на числата 3, 7, 1, 9, 5?',
    answers: ['5', '7', '5,5', '25'],
    correctAnswer: '5',
  },
  {
    question: 'Колко е средното аритметично на 2, 4, 6, 8?',
    answers: ['4', '5', '6', '20'],
    correctAnswer: '5',
  },
  {
    question: 'По колко начина можем да изберем 2 души от 5 (редът няма значение)?',
    answers: ['5', '10', '20', '25'],
    correctAnswer: '10',
  },
  {
    question: 'По колко начина могат да се наредят 4 книги на рафт?',
    answers: ['4', '12', '16', '24'],
    correctAnswer: '24',
  },
];

// ---------- Страница ----------

export function Probability() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Вероятности и статистика</h1>

        <div className="bg-gradient-to-br from-violet-700 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🎲 През 1654 г. френският писател и комарджия Шевалие дьо Мере пита Блез Паскал защо губи пари. Залагал, че при 4 хвърляния на
            зар ще се падне поне една шестица – и печелел. После заложил, че при 24 хвърляния на два зара ще се падне поне една двойна
            шестица – и започнал да губи. Нали <Tex>{'\\frac{4}{6} = \\frac{24}{36}'}</Tex>? Паскал и Пиер дьо Ферма разменят писма за подобни задачи и полагат основите на
            <strong> теорията на вероятностите</strong>. Отговорът: първият залог печели с вероятност около 51,8%, а вторият – само около
            49,1%.
          </p>
        </div>

        <section className="mb-8">
          <h2 className={h2}>1. Случайни събития и вероятност</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              🤔 <strong>Загадка:</strong> Хвърляме два зара. Кое е по-вероятно – сбор 11 или сбор 12? Мнозина казват „еднакво – по един
              начин“. Но 11 се получава като <Tex>{'5 + 6'}</Tex> и като <Tex>{'6 + 5'}</Tex> – два различни изхода! Сборът 11 е два пъти по-вероятен от 12.
            </p>
          </div>
          <Theorem
            type="definition"
            title="Класическа вероятност"
            description="Ако опитът има $n$ равновероятни изхода и $m$ от тях са благоприятни за събитието $A$, вероятността на $A$ е $P(A) = \frac{m}{n}$. Винаги $0 \le P(A) \le 1$; невъзможното събитие има вероятност 0, а сигурното – 1. Вероятността често се изразява и в проценти."
          />
          <TwoDiceLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>2. Честота и закон за големите числа</h2>
          <p className={text}>
            Вероятността <Tex>{'\\frac{1}{6}'}</Tex> не значи, че на всеки 6 хвърляния ще има точно една шестица. Значи, че при много хвърляния делът на шестиците ще
            бъде близо до <Tex>{'\\frac{1}{6}'}</Tex>. Това е <strong>законът за големите числа</strong> – и затова казината винаги печелят в дългосрочен план.
          </p>
          <Theorem
            type="definition"
            title="Относителна честота"
            description="Ако при $N$ опита събитието $A$ се е случило $k$ пъти, отношението $\frac{k}{N}$ е относителната му честота. При голям брой независими опити относителната честота се доближава до вероятността $P(A)$."
          />
          <FrequencyLab />
        </section>

        <section className="mb-8">
          <h2 className={h2}>3. Броене: правило за умножение, пермутации и комбинации</h2>
          <Theorem
            title="Основни правила за броене"
            description="Правило за умножение: ако първият избор може да се направи по $m$ начина, а след него вторият – по $n$ начина, двата заедно се правят по $m \cdot n$ начина. Пермутации: $n$ различни предмета могат да се наредят по $n! = 1 \cdot 2 \cdot \ldots \cdot n$ начина. Комбинации: $k$ предмета от $n$ (без значение от реда) могат да се изберат по $C(n,\ k) = \frac{n!}{k!(n - k)!}$ начина."
          />
          <Example
            description="От 7 ученици избираме комисия от 3. Каква е вероятността Ани (една от седемте) да е в нея?"
            steps={['Всички комисии: $C(7,\\ 3) = \\frac{7 \\cdot 6 \\cdot 5}{3 \\cdot 2 \\cdot 1} = 35$', 'Комисии с Ани: избираме още 2 от останалите 6: $C(6,\\ 2) = 15$', '$P = \\frac{15}{35} = \\frac{3}{7}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>4. Правила за вероятностите</h2>
          <Theorem
            title="Противоположно събитие, сбор и произведение"
            description="Противоположно събитие: $P(\text{не } A) = 1 - P(A)$. Несъвместими събития (не могат да се случат едновременно): $P(A \text{ или } B) = P(A) + P(B)$. Независими събития (едното не влияе на другото): $P(A \text{ и } B) = P(A) \cdot P(B)$. Полезен трик: „поне едно“ $= 1 -$ „нито едно“."
          />
          <Example
            description="Да решим задачата на дьо Мере: каква е вероятността при 4 хвърляния на зар да се падне поне една шестица?"
            steps={[
              'Противоположното събитие: нито една шестица – всяко хвърляне дава едно от 5-те други числа: $\\left(\\frac{5}{6}\\right)^4$',
              '$P(\\text{поне една шестица}) = 1 - \\left(\\frac{5}{6}\\right)^4 = 1 - \\frac{625}{1296} = \\frac{671}{1296} \\approx 0{,}518$',
              'Двойна шестица при 24 хвърляния на два зара: $1 - \\left(\\frac{35}{36}\\right)^{24} \\approx 0{,}491$ – вече под $\\frac{1}{2}$!',
            ]}
          />
          <Example
            description="В кутия има 3 червени и 2 сини топки. Вадим две една след друга, без да връщаме. Каква е вероятността и двете да са червени?"
            steps={['Първата е червена: $\\frac{3}{5}$', 'Ако първата е била червена, остават 2 червени от 4: $\\frac{2}{4}$', '$P = \\frac{3}{5} \\cdot \\frac{2}{4} = \\frac{6}{20} = \\frac{3}{10}$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={h2}>5. Статистика: средно, медиана, мода</h2>
          <Theorem
            type="definition"
            title="Характеристики на данни"
            description="Средно аритметично: сборът на стойностите, разделен на броя им. Медиана: средната стойност в подредените данни (при четен брой – средното на двете средни). Мода: най-често срещаната стойност. Размах: най-голямата минус най-малката стойност. Стандартното отклонение $\sigma$ показва колко средно се отдалечават стойностите от средното."
          />
          <StatsLab />
          <Example
            description="Данни: 2, 3, 3, 5, 7, 10. Намерете средното, медианата и модата."
            steps={['Средно: $(2 + 3 + 3 + 5 + 7 + 10) : 6 = 30 : 6 = 5$', 'Медиана: двете средни стойности са 3 и 5 $\\Rightarrow \\frac{3 + 5}{2} = 4$', 'Мода: 3 (среща се два пъти); размах: $10 - 2 = 8$']}
          />
        </section>

        <section className="mb-8">
          <h2 className={`${h2} flex items-center gap-2`}>
            <Sparkles size={22} className="text-sky-500" /> 6. Тренажор
          </h2>
          <p className={text}>Класическа вероятност: преброй благоприятните изходи и всички изходи.</p>
          <Trainer />
        </section>

        <section className="mb-8">
          <h2 className={h2}>7. Задачи от живота</h2>
          <WordProblems problems={wordProblems} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>8. ⚠️ Чести грешки</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {[
              ['Грешката на играча', '5 пъти ези $\\Rightarrow$ сега „трябва“ да е тура', 'монетата няма памет: $P = \\frac{1}{2}$'],
              ['„Поне едно“ чрез умножение по $n$', 'поне една 6 от 4 хвърляния: $4 \\cdot \\frac{1}{6} = \\frac{2}{3}$', '$1 - \\left(\\frac{5}{6}\\right)^4 \\approx 0{,}518$'],
              ['Неравновероятни „изходи“', 'сборът на два зара е $2,\\ 3,\\ \\ldots ,\\ 12 \\Rightarrow P(12) = \\frac{1}{11}$', '36 равновероятни двойки $\\Rightarrow P(12) = \\frac{1}{36}$'],
              ['Сбор на съвместими събития', '$P(\\text{четно или } > 3) = \\frac{1}{2} + \\frac{1}{2} = 1$', 'изходи $2,\\ 4,\\ 5,\\ 6 \\Rightarrow \\frac{4}{6} = \\frac{2}{3}$'],
              ['Средното като „типично“', 'средна заплата 2720 € ⇒ повечето получават ~2720 €', 'при екстремни стойности гледаме медианата'],
              ['Вероятност извън $[0;\\ 1]$', '$P = \\frac{7}{5}$', 'винаги $0 \\le P \\le 1$ – иначе има грешка в броенето'],
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
          <Quiz questions={probabilityQuiz} />
        </section>

        <section className="mb-8">
          <h2 className={h2}>10. 📝 Задачи за упражнение</h2>
          <TaskBoard>
            <div className="mb-6">
              <TaskLevel level="A" />
              <Task id="a1" number={1} color="border-green-500" question="В кутия има 3 червени и 5 сини топки. Каква е вероятността наслуки извадена топка да е синя?">
                <p>Всички изходи: 8; благоприятни: 5.</p>
                <p><Tex>{'P = \\frac{5}{8} = 0{,}625'}</Tex></p>
              </Task>
              <Task id="a2" number={2} color="border-green-500" question="Намерете средното, медианата и модата на данните 2, 3, 3, 5, 7, 10.">
                <p>Средно: <Tex>{'30 : 6 = 5'}</Tex></p>
                <p>Медиана: <Tex>{'\\frac{3 + 5}{2} = 4'}</Tex></p>
                <p>Мода: 3</p>
              </Task>
              <Task id="a3" number={3} color="border-green-500" question="Хвърляме два зара. Каква е вероятността сборът да е поне 10?">
                <p>Сбор 10: (4;6), (5;5), (6;4); сбор 11: (5;6), (6;5); сбор 12: (6;6) – общо 6.</p>
                <p><Tex>{'P = \\frac{6}{36} = \\frac{1}{6}'}</Tex></p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="B" />
              <Task id="b1" number={4} color="border-yellow-500" question="От 7 ученици избираме комисия от 3. Каква е вероятността Ани да е в нея?">
                <p>Всички комисии: <Tex>{'C(7,\\ 3) = 35'}</Tex>.</p>
                <p>С Ани: <Tex>{'C(6,\\ 2) = 15'}</Tex>.</p>
                <p><Tex>{'P = \\frac{15}{35} = \\frac{3}{7}'}</Tex>. (По-кратко: всеки е в комисията с вероятност <Tex>{'\\frac{3}{7}'}</Tex> – 3 места за 7 души.)</p>
              </Task>
              <Task id="b2" number={5} color="border-yellow-500" question="Каква е вероятността при 4 хвърляния на зар да се падне поне една шестица? А поне една двойна шестица при 24 хвърляния на два зара?">
                <p><Tex>{'1 - \\left(\\frac{5}{6}\\right)^4 = \\frac{671}{1296} \\approx 0{,}518'}</Tex></p>
                <p><Tex>{'1 - \\left(\\frac{35}{36}\\right)^{24} \\approx 0{,}491'}</Tex></p>
                <p>Първият залог на дьо Мере е изгоден, вторият – не.</p>
              </Task>
              <Task id="b3" number={6} color="border-yellow-500" question="В кутия има 3 червени и 2 сини топки. Вадим две без връщане. Каква е вероятността да са с различен цвят?">
                <p>Червена после синя: <Tex>{'\\frac{3}{5} \\cdot \\frac{2}{4} = \\frac{6}{20}'}</Tex>; синя после червена: <Tex>{'\\frac{2}{5} \\cdot \\frac{3}{4} = \\frac{6}{20}'}</Tex>.</p>
                <p><Tex>{'P = \\frac{12}{20} = \\frac{3}{5}'}</Tex></p>
                <p>Проверка с комбинации: <Tex>{'\\frac{3 \\cdot 2}{C(5,\\ 2)} = \\frac{6}{10} = \\frac{3}{5}'}</Tex> ✓</p>
              </Task>
            </div>

            <div className="mb-6">
              <TaskLevel level="C" />
              <Task id="c1" number={7} color="border-red-500" question="Парадоксът на рождените дни: каква е вероятността в група от 23 души поне двама да имат рожден ден в един и същи ден (без 29 февруари, всички дни равновероятни)?">
                <p>Противоположното: всички рождени дни са различни: <Tex>{'\\frac{365}{365} \\cdot \\frac{364}{365} \\cdot \\ldots \\cdot \\frac{343}{365}'}</Tex>.</p>
                <p>Това произведение е <Tex>{'\\approx 0{,}493'}</Tex>.</p>
                <p><Tex>{'P(\\text{съвпадение}) \\approx 1 - 0{,}493 = 0{,}507'}</Tex> – повече от 50% само при 23 души!</p>
              </Task>
              <Task id="c2" number={8} color="border-red-500" question="Задачата на Монти Хол: зад една от 3 врати има кола, зад другите – кози. Избираш врата; водещият (който знае къде е колата) отваря друга врата с коза и ти предлага да смениш. Изгодно ли е?">
                <p>Първоначалният ти избор е верен с вероятност <Tex>{'\\frac{1}{3}'}</Tex> – и това не се променя, когато водещият отвори врата.</p>
                <p>С вероятност <Tex>{'\\frac{2}{3}'}</Tex> колата е зад някоя от другите две врати; водещият ти показва коя от тях НЕ е.</p>
                <p>Ако смениш, печелиш с вероятност <Tex>{'\\frac{2}{3}'}</Tex>. Смяната удвоява шанса!</p>
              </Task>
              <Task id="c3" number={9} color="border-red-500" question="Прекъсната игра (задачата на Паскал и Ферма): двама играят до 3 победи, всяка партида е $50 : 50$. Играта спира при резултат $2 : 1$. Как справедливо да се раздели наградата?">
                <p>На водещия му трябва още 1 победа, на другия – 2.</p>
                <p>Изостаналият печели само ако спечели следващите 2 партиди: <Tex>{'\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}'}</Tex>.</p>
                <p>Водещият печели с вероятност <Tex>{'\\frac{3}{4}'}</Tex> <Tex>{'\\Rightarrow'}</Tex> наградата се дели в отношение <Tex>{'3 : 1'}</Tex>.</p>
              </Task>
            </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className={h2}>11. Обобщение</h2>
          <div className="bg-gradient-to-r from-violet-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2 text-sm sm:text-base">
              <li>✓ <Tex>{'P(A) = \\frac{\\text{благоприятни}}{\\text{всички}}'}</Tex> (при равновероятни изходи); <Tex>{'0 \\le P \\le 1'}</Tex></li>
              <li>✓ Честотата се доближава до вероятността при много опити</li>
              <li>✓ Броене: <Tex>{'m \\cdot n'}</Tex>; <Tex>{'n!'}</Tex>; <Tex>{'C(n,\\ k) = \\frac{n!}{k!(n - k)!}'}</Tex></li>
              <li>✓ <Tex>{'P(\\text{не } A) = 1 - P(A)'}</Tex>; „поне едно“ <Tex>{'= 1 -'}</Tex> „нито едно“</li>
              <li>✓ Несъвместими: събираме; независими: умножаваме</li>
              <li>✓ Средно, медиана, мода, размах; при екстремни стойности – медианата</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold mb-2">💡 Интересен факт</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              През 1990 г. задачата на Монти Хол е публикувана в американско списание заедно с верния отговор „сменете вратата“. Редакцията
              получава хиляди писма с твърдения, че отговорът е грешен – сред тях и от хора с научни степени. Компютърните симулации обаче
              бързо потвърждават <Tex>{'\\frac{2}{3}'}</Tex>. Вероятностите често противоречат на интуицията – затова си струва да ги пресмятаме.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
