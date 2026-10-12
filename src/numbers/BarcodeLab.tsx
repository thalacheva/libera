import { useState } from 'react';
import { Note } from '~/geometry/diagram';

/** Контролната цифра на EAN-13: цифрите се умножават последователно по 1 и 3, сборът се допълва до кратно на 10. */
const checkDigit = (digits: number[]) => (10 - (digits.reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0) % 10)) % 10;

export default function BarcodeLab() {
  const [input, setInput] = useState('380123456789');
  const digits = input.replace(/\D/g, '').slice(0, 13).split('').map(Number);
  const first12 = digits.slice(0, 12);
  const ready = first12.length === 12;
  const sum = first12.reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = ready ? checkDigit(first12) : null;
  const given = digits.length === 13 ? digits[12] : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <label className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm sm:text-base">
        <span className="text-gray-700 dark:text-gray-300">Баркод (12 или 13 цифри):</span>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Баркод"
          className="w-52 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-center font-mono text-lg tracking-wider"
        />
      </label>

      {first12.length > 0 && (
        <div className="overflow-x-auto">
          <table className="mx-auto font-mono text-xs sm:text-sm text-center border-collapse">
            <tbody>
              <tr>
                <td className="pr-2 text-left text-gray-500 dark:text-gray-400 font-sans">цифра</td>
                {first12.map((d, i) => (
                  <td key={i} className="px-1 sm:px-1.5 py-1 font-semibold text-gray-800 dark:text-gray-100">
                    {d}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="pr-2 text-left text-gray-500 dark:text-gray-400 font-sans">тегло</td>
                {first12.map((_, i) => (
                  <td key={i} className={`px-1 sm:px-1.5 py-1 ${i % 2 ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'}`}>
                    ×{i % 2 ? 3 : 1}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="pr-2 text-left text-gray-500 dark:text-gray-400 font-sans">произв.</td>
                {first12.map((d, i) => (
                  <td key={i} className="px-1 sm:px-1.5 py-1 text-gray-700 dark:text-gray-300">
                    {d * (i % 2 ? 3 : 1)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {ready ? (
        <>
          <p className="mt-3 text-center text-sm sm:text-base text-gray-800 dark:text-gray-100">
            Сбор: <strong>{sum}</strong> ≡ {sum % 10} (mod 10) ⇒ контролна цифра <strong>{check}</strong> (допълва сбора до {sum + check!})
          </p>
          {given === null ? (
            <Note tone="emerald">
              Пълният баркод е {first12.join('')}
              {check}.
            </Note>
          ) : given === check ? (
            <Note tone="emerald">✓ Контролната цифра {given} е вярна – баркодът е валиден.</Note>
          ) : (
            <Note tone="rose">
              ✗ Контролната цифра е {given}, а трябва да е {check} – някоя цифра е сгрешена.
            </Note>
          )}
        </>
      ) : (
        <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">Въведи поне 12 цифри.</p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Българските баркодове започват с 380. Смени една цифра от валиден 13-цифрен баркод – проверката винаги открива грешката. Размяната на две съседни цифри също се открива, освен ако те се различават точно с 5 (тогава 1·a + 3·b и 1·b + 3·a дават еднакъв остатък по модул 10).
      </p>
    </div>
  );
}
