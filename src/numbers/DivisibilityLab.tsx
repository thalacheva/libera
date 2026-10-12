import { useState } from 'react';

type Rule = { d: number; rule: string; detail: (digits: number[], n: bigint) => string; ok: (digits: number[], n: bigint) => boolean };

const last = (digits: number[]) => digits[digits.length - 1];
const lastK = (digits: number[], k: number) => Number(digits.slice(-k).join(''));
const digitSum = (digits: number[]) => digits.reduce((s, x) => s + x, 0);
// Знакопроменлив сбор отдясно наляво: последната цифра е с „+“
const altSum = (digits: number[]) => digits.reduceRight((s, x, i) => s + ((digits.length - 1 - i) % 2 === 0 ? x : -x), 0);

const RULES: Rule[] = [
  { d: 2, rule: 'последната цифра е четна', detail: d => `последна цифра ${last(d)}`, ok: d => last(d) % 2 === 0 },
  { d: 3, rule: 'сборът от цифрите се дели на 3', detail: d => `сбор на цифрите ${digitSum(d)}`, ok: d => digitSum(d) % 3 === 0 },
  { d: 4, rule: 'числото от последните две цифри се дели на 4', detail: d => `последни две цифри ${String(lastK(d, 2)).padStart(Math.min(2, d.length), '0')}`, ok: d => lastK(d, 2) % 4 === 0 },
  { d: 5, rule: 'последната цифра е 0 или 5', detail: d => `последна цифра ${last(d)}`, ok: d => last(d) % 5 === 0 },
  { d: 6, rule: 'дели се и на 2, и на 3', detail: d => `четно: ${last(d) % 2 === 0 ? 'да' : 'не'}, сбор на цифрите ${digitSum(d)}`, ok: d => last(d) % 2 === 0 && digitSum(d) % 3 === 0 },
  { d: 8, rule: 'числото от последните три цифри се дели на 8', detail: d => `последни три цифри ${String(lastK(d, 3)).padStart(Math.min(3, d.length), '0')}`, ok: d => lastK(d, 3) % 8 === 0 },
  { d: 9, rule: 'сборът от цифрите се дели на 9', detail: d => `сбор на цифрите ${digitSum(d)}`, ok: d => digitSum(d) % 9 === 0 },
  { d: 10, rule: 'последната цифра е 0', detail: d => `последна цифра ${last(d)}`, ok: d => last(d) === 0 },
  {
    d: 11,
    rule: 'знакопроменливият сбор на цифрите (отдясно наляво) се дели на 11',
    detail: d => `${[...d].reverse().map((x, i) => (i === 0 ? `${x}` : `${i % 2 === 0 ? '+' : '−'} ${x}`)).join(' ')} = ${String(altSum(d)).replace('-', '−')}`,
    ok: d => altSum(d) % 11 === 0,
  },
];

/** Признаците за делимост за произволно число – и проверка с истинско деление. */
export default function DivisibilityLab() {
  const [input, setInput] = useState('7920');
  const clean = input.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 15);
  const digits = clean.split('').map(Number);
  const n = clean ? BigInt(clean) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <label className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm sm:text-base">
        <span className="text-gray-700 dark:text-gray-300">Число:</span>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Число за проверка"
          className="w-48 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-center font-mono text-lg"
        />
      </label>

      {n === null ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Въведи естествено число (до 15 цифри).</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {RULES.map(r => {
            const ok = r.ok(digits, n);
            const real = n % BigInt(r.d) === 0n;
            return (
              <div
                key={r.d}
                className={`rounded-lg border p-2.5 text-sm ${
                  ok ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">на {r.d}</span>
                  <span className={ok ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                    {ok ? '✓ дели се' : '✗ не се дели'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.rule}</p>
                <p className="font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-all">{r.detail(digits, n)}</p>
                {/* Признакът и истинското деление винаги съвпадат – показваме остатъка за проверка */}
                {!real && <p className="text-xs text-gray-500 dark:text-gray-400">остатък {String(n % BigInt(r.d))}</p>}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пробвай 2024, 123456, 1001 или 999999. Признаците работят, защото 10, 100 и 1000 се делят на 2, 4 и 8, а 10, 100, 1000… дават остатък 1 при деление на 3 и 9 и остатъци ±1 при деление на 11.
      </p>
    </div>
  );
}
