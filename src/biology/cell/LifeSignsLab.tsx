import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Verdict = 'alive' | 'nonliving' | 'border';
/** ✓ – има признака, ~ – само наподобява го или го има частично, ✗ – няма го. */
type Mark = 'yes' | 'part' | 'no';

const SIGNS = ['клетъчен строеж', 'обмяна на вещества и енергия', 'хомеостаза', 'раздразнимост', 'растеж и развитие', 'размножаване', 'наследственост и еволюция'];

// Признаците са в реда на SIGNS. Нещата идват в един и същ ред – без случайност, за да съвпада с HTML-а от prerender.
const ITEMS: { name: string; emoji: string; verdict: Verdict; marks: Mark[]; why: string }[] = [
  {
    name: 'котка',
    emoji: '🐈',
    verdict: 'alive',
    marks: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
    why: 'Котката има всички признаци на живото. Лесният случай – за да имаме с какво да сравняваме останалите.',
  },
  {
    name: 'пламък',
    emoji: '🔥',
    verdict: 'nonliving',
    marks: ['no', 'part', 'no', 'no', 'part', 'part', 'no'],
    why: 'Огънят „диша“ кислород, „храни се“ с гориво, расте и се разпространява. Но няма клетки и няма наследственост: новият пламък не наследява нищо от стария.',
  },
  {
    name: 'дрожди',
    emoji: '🍞',
    verdict: 'alive',
    marks: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
    why: 'Дрождите са едноклетъчни гъби. Една-единствена клетка може да има всички признаци на живото – тестото втасва от въглеродния диоксид, който те отделят.',
  },
  {
    name: 'вирус',
    emoji: '🦠',
    verdict: 'border',
    marks: ['no', 'no', 'no', 'no', 'no', 'part', 'yes'],
    why: 'Вирусът има гени и еволюира (затова ваксината срещу грип се обновява всяка година), но няма клетки и собствена обмяна. Размножава се само в чужда клетка. Затова повечето биолози го смятат за граничен случай.',
  },
  {
    name: 'сухо семе',
    emoji: '🌰',
    verdict: 'alive',
    marks: ['yes', 'part', 'part', 'part', 'part', 'yes', 'yes'],
    why: 'Сухото семе е живо, но в покой: обмяната му е много бавна. Щом получи вода и топлина, то покълва. Семена от финикова палма на около 2000 години са покълнали успешно.',
  },
  {
    name: 'робот прахосмукачка',
    emoji: '🤖',
    verdict: 'nonliving',
    marks: ['no', 'part', 'part', 'yes', 'no', 'no', 'no'],
    why: 'Роботът реагира на препятствия и сам се връща да се зареди – прилича на раздразнимост и хомеостаза. Но няма клетки, не расте и не прави копия на себе си.',
  },
  {
    name: 'мъх на камък',
    emoji: '🌿',
    verdict: 'alive',
    marks: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
    why: 'Мъхът е растение – изглежда неподвижен, но расте, фотосинтезира и се размножава със спори. Движението не е задължителен признак на живото.',
  },
  {
    name: 'снежинка',
    emoji: '❄️',
    verdict: 'nonliving',
    marks: ['no', 'no', 'no', 'no', 'part', 'no', 'no'],
    why: 'Снежинката „расте“ и има сложна правилна форма, но кристалите растат, като към тях просто се прилепват още молекули вода. Нищо друго от признаците няма.',
  },
  {
    name: 'дървена дъска',
    emoji: '🪵',
    verdict: 'nonliving',
    marks: ['part', 'no', 'no', 'no', 'no', 'no', 'no'],
    why: 'Под микроскоп в дървото се виждат клетки – но само стените им. Дъската някога е била част от живо дърво, а сега е неживо (мъртво) вещество.',
  },
  {
    name: 'амеба',
    emoji: '🫧',
    verdict: 'alive',
    marks: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
    why: 'Амебата е едноклетъчен организъм: лови храна, бяга от силна светлина, расте и се дели на две.',
  },
];

const CHOICES: { verdict: Verdict; label: string }[] = [
  { verdict: 'alive', label: 'живо' },
  { verdict: 'nonliving', label: 'неживо' },
  { verdict: 'border', label: 'на границата' },
];

const MARK: Record<Mark, { sign: string; cls: string }> = {
  yes: { sign: '✓', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' },
  part: { sign: '~', cls: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200' },
  no: { sign: '✗', cls: 'border-gray-200 bg-gray-50 text-gray-500 line-through dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400' },
};

/** Живо ли е? Сравни нещото с признаците на живите организми. */
export default function LifeSignsLab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Verdict[]>([]);
  const answered = answers.length > index;
  const done = answers.length === ITEMS.length;
  const current = ITEMS[Math.min(index, ITEMS.length - 1)];
  const score = answers.filter((a, i) => a === ITEMS[i].verdict).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="text-center">
        <div className="text-4xl mb-1">{current.emoji}</div>
        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{current.name}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {Math.min(index + 1, ITEMS.length)} от {ITEMS.length}. Живо ли е?
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {SIGNS.map((sign, i) => {
          const m = MARK[current.marks[i]];
          return (
            <span
              key={sign}
              className={`rounded-full border px-2.5 py-0.5 text-xs sm:text-sm ${answered ? m.cls : 'border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500'}`}
            >
              {answered ? m.sign : '?'} {sign}
            </span>
          );
        })}
      </div>

      <Buttons>
        {!answered &&
          CHOICES.map(c => (
            <DiagramButton key={c.verdict} onClick={() => setAnswers([...answers, c.verdict])}>
              {c.label}
            </DiagramButton>
          ))}
        {answered && !done && <DiagramButton onClick={() => setIndex(index + 1)}>Следващо →</DiagramButton>}
        {done && (
          <DiagramButton
            onClick={() => {
              setIndex(0);
              setAnswers([]);
            }}
          >
            Отначало
          </DiagramButton>
        )}
      </Buttons>
      {answered && (
        <Note tone={answers[index] === current.verdict ? 'emerald' : 'rose'}>
          {answers[index] === current.verdict ? '✓ Вярно! ' : `✗ Отговорът е „${CHOICES.find(c => c.verdict === current.verdict)!.label}“. `}
          {current.why}
        </Note>
      )}
      {done && (
        <Note tone="violet">
          Позна {score} от {ITEMS.length}. Живо е само това, което има всички признаци – отделни признаци има и неживото.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 След отговора виждаш кои признаци има нещото: ✓ – има го, ~ – само прилича на него или го има отчасти, ✗ – няма го.
      </p>
    </div>
  );
}
