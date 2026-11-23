import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// ---------- База знания ----------

const FACTS = [
  ['fur', 'има козина'],
  ['milk', 'дава мляко'],
  ['feathers', 'има пера'],
  ['flies', 'лети'],
  ['eggs', 'снася яйца'],
  ['meat', 'яде месо'],
  ['hooves', 'има копита'],
  ['tawny', 'жълтеникав цвят'],
  ['spots', 'тъмни петна'],
  ['stripes', 'черни ивици'],
  ['neck', 'дълга шия'],
  ['swims', 'плува'],
] as const;

type FactId = (typeof FACTS)[number][0];

/** Изводи, до които стигат правилата (не се избират от ученика). */
const DERIVED: Record<string, string> = {
  mammal: 'бозайник',
  bird: 'птица',
  carnivore: 'хищник',
  ungulate: 'копитно',
  noFly: 'не лети',
  cheetah: 'гепард',
  tiger: 'тигър',
  giraffe: 'жираф',
  zebra: 'зебра',
  ostrich: 'щраус',
  penguin: 'пингвин',
};
const ANIMALS = ['cheetah', 'tiger', 'giraffe', 'zebra', 'ostrich', 'penguin'];

const NAME: Record<string, string> = { ...Object.fromEntries(FACTS), ...DERIVED };

type Rule = { id: number; when: string[]; then: string };

const RULES: Rule[] = [
  { id: 1, when: ['fur'], then: 'mammal' },
  { id: 2, when: ['milk'], then: 'mammal' },
  { id: 3, when: ['feathers'], then: 'bird' },
  { id: 4, when: ['flies', 'eggs'], then: 'bird' },
  { id: 5, when: ['mammal', 'meat'], then: 'carnivore' },
  { id: 6, when: ['mammal', 'hooves'], then: 'ungulate' },
  { id: 7, when: ['carnivore', 'tawny', 'spots'], then: 'cheetah' },
  { id: 8, when: ['carnivore', 'tawny', 'stripes'], then: 'tiger' },
  { id: 9, when: ['ungulate', 'neck', 'spots'], then: 'giraffe' },
  { id: 10, when: ['ungulate', 'stripes'], then: 'zebra' },
  { id: 11, when: ['bird', 'noFly', 'neck'], then: 'ostrich' },
  { id: 12, when: ['bird', 'noFly', 'swims'], then: 'penguin' },
];

type Step = { round: number; rule: Rule };

/** Права верига: правилата се прилагат кръг след кръг, докато спрат да дават нови факти. */
function infer(chosen: Set<string>) {
  const known = new Set(chosen);
  // Което не е отбелязано, се смята за невярно: „не лети“
  if (!known.has('flies')) known.add('noFly');
  const steps: Step[] = [];
  for (let round = 1; ; round++) {
    const fired = RULES.filter(r => !known.has(r.then) && r.when.every(f => known.has(f)));
    if (!fired.length) break;
    for (const rule of fired) {
      if (known.has(rule.then)) continue;
      known.add(rule.then);
      steps.push({ round, rule });
    }
  }
  return { steps, animals: ANIMALS.filter(a => known.has(a)), known };
}

const PRESETS: { label: string; facts: FactId[] }[] = [
  { label: 'тигър', facts: ['fur', 'meat', 'tawny', 'stripes'] },
  { label: 'зебра', facts: ['milk', 'hooves', 'stripes'] },
  { label: 'пингвин', facts: ['feathers', 'swims'] },
  { label: 'делфин', facts: ['milk', 'meat', 'swims'] },
  { label: 'прилеп', facts: ['fur', 'milk', 'flies'] },
  { label: 'окапи', facts: ['fur', 'hooves', 'stripes', 'neck'] },
];

const ruleText = (r: Rule) => `АКО ${r.when.map(f => NAME[f]).join(' И ')} → ${NAME[r.then]}`;

/** Малка експертна система за разпознаване на животни: вижда се всяко приложено правило. */
export default function ExpertSystemLab() {
  const [chosen, setChosen] = useState<Set<string>>(new Set(PRESETS[0].facts));
  const { steps, animals } = infer(chosen);
  const firedIds = new Set(steps.map(s => s.rule.id));

  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChosen(next);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Какво знаем за животното (фактите):</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm sm:text-base text-gray-800 dark:text-gray-200">
        {FACTS.map(([id, label]) => (
          <label key={id} className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={chosen.has(id)} onChange={() => toggle(id)} className="accent-fuchsia-600" />
            {label}
          </label>
        ))}
      </div>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.label} onClick={() => setChosen(new Set(p.facts))}>
            {p.label}
          </DiagramButton>
        ))}
        <DiagramButton onClick={() => setChosen(new Set())}>изчисти</DiagramButton>
      </Buttons>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Базата знания – {RULES.length} правила:</p>
          <ul className="space-y-1 font-mono text-xs sm:text-sm">
            {RULES.map(r => (
              <li
                key={r.id}
                className={`rounded px-2 py-1 ${
                  firedIds.has(r.id) ? 'bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-200' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                П{r.id}: {ruleText(r)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Как разсъждава системата:</p>
          {steps.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Нито едно правило не може да се приложи към тези факти.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {steps.map((s, i) => (
                <li key={i} className="rounded bg-gray-50 px-2 py-1 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
                  <span className="text-gray-500 dark:text-gray-400">кръг {s.round} · П{s.rule.id}:</span> {s.rule.when.map(f => NAME[f]).join(' и ')} →{' '}
                  <strong>{NAME[s.rule.then]}</strong>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-3">
            <Readout
              items={[
                { label: 'приложени правила', value: steps.length, tone: 'violet' },
                { label: 'извод', value: animals.length ? animals.map(a => NAME[a]).join(' или ') : 'няма', tone: animals.length === 1 ? 'emerald' : 'rose' },
              ]}
            />
          </div>
        </div>
      </div>
      <Note tone={animals.length === 1 ? 'emerald' : animals.length > 1 ? 'amber' : 'rose'}>
        {animals.length === 1
          ? `Системата е сигурна: това е ${NAME[animals[0]]} – и може да покаже по кои правила е стигнала дотам.`
          : animals.length > 1
            ? 'Две правила дават различни отговори – системата няма как да реши кое е вярното.'
            : 'За това животно няма правило. Системата не може да предположи – знае само това, което някой е записал.'}
      </Note>
    </div>
  );
}
