import { useState } from 'react';
import { Tex } from '~/MathText';
import { divisors, factorize } from './numberMath';

/** Разлагане на прости множители „на колона“, каноничен вид и всички делители. */
export default function FactorLab() {
  const [input, setInput] = useState('360');
  const n = Number(input.replace(/\D/g, '').slice(0, 7));
  const valid = n >= 2;
  const factors = valid ? factorize(n) : [];

  // Редовете на колоната: текущото число и простият делител, на който делим
  const rows: [number, number | null][] = [];
  let m = n;
  for (const [p, e] of factors) {
    for (let i = 0; i < e; i++) {
      rows.push([m, p]);
      m /= p;
    }
  }
  if (valid) rows.push([1, null]);

  const canonical = factors.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\cdot ');
  const count = factors.reduce((c, [, e]) => c * (e + 1), 1);
  const divs = valid && n <= 100000 ? divisors(n) : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <label className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm sm:text-base">
        <span className="text-gray-700 dark:text-gray-300">Число:</span>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Число за разлагане"
          className="w-36 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-center font-mono text-lg"
        />
      </label>

      {!valid ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Въведи естествено число от 2 до 9 999 999.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          <table className="font-mono text-base sm:text-lg">
            <tbody>
              {rows.map(([value, p], i) => (
                <tr key={i}>
                  <td className="pr-3 text-right text-gray-800 dark:text-gray-100">{value}</td>
                  <td className="pl-3 border-l-2 border-gray-400 dark:border-gray-500 text-indigo-700 dark:text-indigo-300 font-semibold">{p ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-sm">
            <p>
              {factors.length === 1 && factors[0][1] === 1 ? (
                <>
                  <strong>{n}</strong> е просто число.
                </>
              ) : (
                <>
                  Каноничен вид: <Tex>{`${n} = ${canonical}`}</Tex>
                </>
              )}
            </p>
            <p>
              Брой делители: <Tex>{`${factors.map(([, e]) => `(${e} + 1)`).join(' \\cdot ')} = ${count}`}</Tex>
            </p>
            {divs.length > 0 && (
              <p className="font-mono text-xs sm:text-sm break-words">
                {divs.length <= 60 ? divs.join(', ') : `${divs.slice(0, 30).join(', ')}, … (общо ${divs.length})`}
              </p>
            )}
          </div>
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Делим последователно на най-малкия прост делител, докато стигнем 1. Пробвай 360, 1001, 2026, 65536 или някое просто число като 9973. Всеки делител на n се получава, като за всяко просто p изберем степен от 0 до показателя му – оттам идва формулата за броя.
      </p>
    </div>
  );
}
