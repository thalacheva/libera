import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { posterior, predict, RULES } from './chatTools';

const INPUTS = [1, 2, 3, 4, 5];
const ASK = 7;
const pct = (p: number) => `${(p * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;

/** Опростен „учещ се в контекста“ модел: от примерите в заявката преценява кое от четири правила е намислено и предсказва отговора за нов вход. */
export default function FewShotLab() {
  const [rule, setRule] = useState(0);
  const [shown, setShown] = useState<number[]>([]);

  const examples = shown.map(x => [x, RULES[rule].f(x)] as [number, number]);
  const post = posterior(examples);
  const guesses = predict(post, ASK);
  const best = guesses[0];
  const right = RULES[rule].f(ASK);
  const sure = best.p > 0.9;
  const toggle = (x: number) => setShown(shown.includes(x) ? shown.filter(v => v !== x) : [...shown, x]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">Правилото, което си намислил (моделът не го вижда):</p>
      <Buttons>
        {RULES.map((r, i) => (
          <DiagramButton
            key={r.id}
            active={rule === i}
            onClick={() => {
              setRule(i);
              setShown([]);
            }}
          >
            {r.label}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-xs font-semibold mt-3 mb-1 text-gray-600 dark:text-gray-300">Примери, които слагаш в заявката (докосни, за да добавиш или махнеш):</p>
      <Buttons>
        {INPUTS.map(x => (
          <DiagramButton key={x} active={shown.includes(x)} onClick={() => toggle(x)}>
            {x} → {RULES[rule].f(x)}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Заявката</p>
          <div className="font-mono text-sm p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100">
            {examples.map(([x, y]) => (
              <p key={x}>
                {x} → {y}
              </p>
            ))}
            <p>
              {ASK} → <span className="bg-amber-200 dark:bg-amber-700/60 px-1">?</span>
            </p>
          </div>
          <p className="text-xs font-semibold mt-3 mb-2 text-gray-600 dark:text-gray-300">Какво би написал моделът след „{ASK} →“</p>
          <div className="space-y-1">
            {guesses.map(g => (
              <div key={g.y} className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-8 text-right font-mono font-bold text-gray-800 dark:text-gray-100">{g.y}</span>
                <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className={`h-full ${g.y === right ? 'bg-emerald-500' : 'bg-gray-400'}`} style={{ width: `${g.p * 100}%` }} />
                </div>
                <span className="w-14 text-right font-mono text-gray-700 dark:text-gray-200">{pct(g.p)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Увереност на модела във всяко правило</p>
          <div className="space-y-2">
            {RULES.map((r, i) => (
              <div key={r.id} className="text-xs sm:text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-200">
                  <span>{r.label}</span>
                  <span className="font-mono">{pct(post[i])}</span>
                </div>
                <div className="h-3 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full bg-fuchsia-500" style={{ width: `${post[i] * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'примери в заявката', value: examples.length, tone: 'violet' },
            { label: 'най-вероятен отговор', value: `${best.y} (${pct(best.p)})`, tone: best.y === right && sure ? 'emerald' : 'amber' },
            { label: 'верен отговор', value: right },
          ]}
        />
      </div>
      <Note tone={best.y === right && sure ? 'emerald' : 'amber'}>
        {examples.length === 0
          ? 'Без примери моделът няма как да знае какво искаш: четирите правила са еднакво вероятни и отговорът е налучкване.'
          : best.y === right && sure
            ? 'Примерите стигат: остава едно правило, което ги обяснява. Нито едно тегло не се е променило – променил се е само текстът на заявката.'
            : 'Тези примери отговарят на повече от едно правило и моделът се колебае. Добави пример, който ги различава.'}{' '}
        Това е опростена илюстрация с четири готови правила, не истински езиков модел.
      </Note>
    </div>
  );
}
