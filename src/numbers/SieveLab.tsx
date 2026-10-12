import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

const N = 120;
const PRIMES_TO_SIFT = [2, 3, 5, 7];
// Цветът на зачеркването показва кое просто число го е зачеркнало
const COLORS: Record<number, string> = {
  2: 'bg-sky-100 text-sky-400 dark:bg-sky-900/30 dark:text-sky-700',
  3: 'bg-amber-100 text-amber-400 dark:bg-amber-900/30 dark:text-amber-700',
  5: 'bg-rose-100 text-rose-400 dark:bg-rose-900/30 dark:text-rose-700',
  7: 'bg-violet-100 text-violet-400 dark:bg-violet-900/30 dark:text-violet-700',
};

/** Решето на Ератостен до 120: зачеркваме кратните на 2, 3, 5 и 7 – остават простите числа. */
export default function SieveLab() {
  const [step, setStep] = useState(0);
  const sifted = PRIMES_TO_SIFT.slice(0, step);
  const done = step === PRIMES_TO_SIFT.length;

  /** Кое просто число е зачеркнало n (най-малкият му прост делител сред пресятите), или null. */
  const crossedBy = (n: number) => sifted.find(p => n !== p && n % p === 0) ?? null;
  const primes = Array.from({ length: N - 1 }, (_, i) => i + 2).filter(n => crossedBy(n) === null);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="grid grid-cols-10 gap-1 max-w-md mx-auto font-mono text-xs sm:text-sm">
        {Array.from({ length: N }, (_, i) => i + 1).map(n => {
          const by = crossedBy(n);
          const isPrime = done && n > 1 && by === null;
          const current = step > 0 && n === PRIMES_TO_SIFT[step - 1];
          return (
            <div
              key={n}
              className={`aspect-square flex items-center justify-center rounded ${
                n === 1
                  ? 'text-gray-300 dark:text-gray-600'
                  : by !== null
                    ? `${COLORS[by]} line-through`
                    : current
                      ? 'bg-indigo-600 text-white font-bold'
                      : isPrime
                        ? 'bg-emerald-500 text-white font-semibold'
                        : 'bg-gray-50 text-gray-800 dark:bg-gray-900/40 dark:text-gray-100'
              }`}
            >
              {n}
            </div>
          );
        })}
      </div>

      <Buttons>
        <DiagramButton onClick={() => setStep(s => Math.min(s + 1, PRIMES_TO_SIFT.length))}>
          {done ? 'Готово ✓' : `Зачеркни кратните на ${PRIMES_TO_SIFT[step]}`}
        </DiagramButton>
        <DiagramButton onClick={() => setStep(0)}>Отначало</DiagramButton>
      </Buttons>
      <Note tone={done ? 'emerald' : 'gray'}>
        {done
          ? `Готово! Простите числа до ${N} са ${primes.length}. Следващото просто число е 11, но 11² = 121 > ${N} – всяко съставно число до ${N} вече е зачеркнато.`
          : step === 0
            ? '1 не е нито просто, нито съставно. Първото просто число е 2 – натисни бутона.'
            : `Зачеркнахме кратните на ${PRIMES_TO_SIFT[step - 1]} от ${PRIMES_TO_SIFT[step - 1] ** 2} нататък${step > 1 ? ' – по-малките вече са зачеркнати' : ''}. Незачеркнати остават ${primes.length} числа.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Цветът показва кое просто число е зачеркнало числото: синьо – 2, жълто – 3, червено – 5, лилаво – 7. Достатъчно е да пресеем с простите числа до √120 ≈ 10,95.
      </p>
    </div>
  );
}
