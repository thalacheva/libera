import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Couplet = { q: string; a: [string, string]; next: [Step, Step] };
/** Стъпка в ключа: следващ въпрос (номер) или име на организма. */
type Step = number | string;

// Двувходовият ключ: 8 животни, 7 въпроса (n − 1)
const KEY: Record<number, Couplet> = {
  1: { q: 'Каква е симетрията на тялото?', a: ['радиална – около ос, като колело', 'двустранна – лява и дясна половина'], next: [2, 3] },
  2: { q: 'Какво е тялото?', a: ['меко и прозрачно, с пипала с жилещи клетки', 'с твърди бодливи пластинки и тръбести крачета'], next: ['медуза', 'морска звезда'] },
  3: { q: 'Има ли членести крака?', a: ['не', 'да'], next: [4, 5] },
  4: { q: 'Как изглежда тялото?', a: ['от много еднакви пръстеновидни сегменти', 'меко, несегментирано, с черупка и мускулест крак'], next: ['дъждовен червей', 'градински охлюв'] },
  5: { q: 'Колко чифта ходилни крака има?', a: ['4 чифта', '3 или 5 чифта'], next: ['паяк кръстач', 6] },
  6: { q: 'Колко чифта ходилни крака има?', a: ['5 чифта, две двойки антени', '3 чифта, една двойка антени'], next: ['речен рак', 7] },
  7: { q: 'Какви са крилете?', a: ['предните са твърди надкрилия', 'две двойки ципести крила'], next: ['калинка', 'медоносна пчела'] },
};

const ANIMALS: { name: string; emoji: string; looks: string; group: string }[] = [
  { name: 'медоносна пчела', emoji: '🐝', looks: 'Летящо насекомо с две двойки прозрачни крила, шест крака и жило.', group: 'тип Членестоноги, клас Насекоми, разред Ципокрили' },
  { name: 'градински охлюв', emoji: '🐌', looks: 'Пълзи бавно на широк мускулест крак, носи спирална черупка.', group: 'тип Мекотели, клас Коремоноги' },
  { name: 'медуза', emoji: '🪼', looks: 'Прозрачен „чадър“, около който висят пипала. Пипалата парят.', group: 'тип Мешести' },
  { name: 'паяк кръстач', emoji: '🕷️', looks: 'Плете колелообразна мрежа, има осем крака и няма антени.', group: 'тип Членестоноги, клас Паякообразни' },
  { name: 'дъждовен червей', emoji: '🪱', looks: 'Дълго розово тяло, разделено на над 100 пръстена. Няма крака.', group: 'тип Прешленести червеи, клас Малочетинести' },
  { name: 'калинка', emoji: '🐞', looks: 'Червени твърди надкрилия с черни точки; под тях има ципести крила.', group: 'тип Членестоноги, клас Насекоми, разред Твърдокрили' },
  { name: 'морска звезда', emoji: '⭐', looks: 'Пет лъча, покрити с твърди бодливи пластинки; отдолу – стотици тръбести крачета.', group: 'тип Бодлокожи' },
  { name: 'речен рак', emoji: '🦞', looks: 'Твърда черупка, големи щипки, десет крака и две двойки антени.', group: 'тип Членестоноги, клас Ракообразни, разред Десетоноги' },
];

/** Пътят в ключа до даден организъм: [номер на въпроса, избран отговор]. */
function pathTo(name: string, step: Step = 1, trail: [number, number][] = []): [number, number][] | null {
  if (typeof step === 'string') return step === name ? trail : null;
  for (const i of [0, 1]) {
    const found = pathTo(name, KEY[step].next[i], [...trail, [step, i]]);
    if (found) return found;
  }
  return null;
}

/** Целият ключ в класическия вид: 1а … → 2; 1б … → 3. */
function KeyText() {
  return (
    <ol className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-3">
      {Object.entries(KEY).map(([n, c]) => (
        <li key={n}>
          {(['а', 'б'] as const).map((letter, i) => (
            <div key={letter} className="flex gap-2">
              <span className="font-mono w-7 shrink-0 text-gray-500">{`${n}${letter}`}</span>
              <span className="flex-1">{c.a[i]}</span>
              <span className="shrink-0 font-semibold">
                {typeof c.next[i] === 'number' ? `→ ${c.next[i]}` : c.next[i]}
              </span>
            </div>
          ))}
        </li>
      ))}
    </ol>
  );
}

/** Определи животното с двувходов ключ – стъпка по стъпка. */
export default function DichotomousKeyLab() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>(1);
  const [trail, setTrail] = useState<string[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [showKey, setShowKey] = useState(false);
  const animal = ANIMALS[index];
  const correctPath = pathTo(animal.name)!;
  const done = typeof step === 'string';
  const couplet = typeof step === 'number' ? KEY[step] : null;

  const choose = (i: number) => {
    if (typeof step !== 'number') return;
    const right = correctPath.find(([n]) => n === step)?.[1];
    if (right !== i) {
      setWrong(i);
      return;
    }
    setWrong(null);
    setTrail(t => [...t, `${step}${i === 0 ? 'а' : 'б'}`]);
    setStep(KEY[step].next[i]);
  };

  const goTo = (k: number) => {
    setIndex(k);
    setStep(1);
    setTrail([]);
    setWrong(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {ANIMALS.map((a, k) => (
          <button
            key={a.name}
            onClick={() => goTo(k)}
            aria-label={a.name}
            aria-pressed={k === index}
            className={`w-9 h-9 rounded-lg border text-xl ${k === index ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15' : 'border-gray-200 dark:border-gray-700'}`}
          >
            {a.emoji}
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className="text-4xl mb-1">{animal.emoji}</div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-xl mx-auto">{animal.looks}</p>
      </div>

      {couplet && (
        <div className="mt-3">
          <p className="text-center font-semibold text-gray-900 dark:text-gray-100">
            Въпрос {step}: {couplet.q}
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {couplet.a.map((a, i) => (
              <button
                key={a}
                onClick={() => choose(i)}
                className={`text-left text-sm rounded-lg border px-3 py-2 ${
                  wrong === i ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/15' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60'
                }`}
              >
                <span className="font-mono text-gray-500 mr-1.5">{`${step}${i === 0 ? 'а' : 'б'}`}</span>
                {a}
              </button>
            ))}
          </div>
          {wrong !== null && <Note tone="rose">Погледни описанието отново – този отговор не пасва на животното.</Note>}
        </div>
      )}

      {done && (
        <Note tone="emerald">
          ✓ Това е {step}! ({animal.group}). Стигна до него с {trail.length} въпроса.
        </Note>
      )}

      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
        Път в ключа: {trail.length ? trail.join(' → ') : '—'}
      </p>

      <Buttons>
        {done && index < ANIMALS.length - 1 && <DiagramButton onClick={() => goTo(index + 1)}>Следващо животно →</DiagramButton>}
        <DiagramButton onClick={() => goTo(index)}>Отначало</DiagramButton>
        <DiagramButton active={showKey} onClick={() => setShowKey(s => !s)}>
          {showKey ? 'Скрий ключа' : 'Покажи целия ключ'}
        </DiagramButton>
      </Buttons>
      {showKey && <KeyText />}

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всеки въпрос има точно два отговора, които се изключват. Ключът за 8 животни има 7 въпроса; до калинката и пчелата се стига с 5,
        а до медузата – само с 2. Ключът подрежда животните по удобни видими белези – той не е задължително родословно дърво.
      </p>
    </div>
  );
}
