import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';
import { isPrime } from './numberMath';

/** Таблица на aᵏ mod m: при просто m последната колона (k = m − 1) е само единици – малката теорема на Ферма. */
export default function PowerTableLab() {
  const [m, setM] = useState(7);
  const prime = isPrime(m);
  const rows = Array.from({ length: m - 1 }, (_, i) => i + 1);
  const cols = Array.from({ length: m - 1 }, (_, i) => i + 1);
  const pow = (a: number, k: number) => {
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * a) % m;
    return r;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="overflow-x-auto">
        <table className="mx-auto font-mono text-[11px] sm:text-sm text-center border-collapse">
          <thead>
            <tr>
              <th className="px-1 py-1 text-gray-500 dark:text-gray-400 font-normal">a \ k</th>
              {cols.map(k => (
                <th key={k} className={`px-1 sm:px-1.5 py-1 font-semibold ${k === m - 1 ? 'text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-300'}`}>
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(a => (
              <tr key={a}>
                <th className="px-1 py-0.5 font-semibold text-gray-600 dark:text-gray-300">{a}</th>
                {cols.map(k => {
                  const v = pow(a, k);
                  return (
                    <td
                      key={k}
                      className={`px-1 sm:px-1.5 py-0.5 border border-white dark:border-gray-800 ${
                        v === 1
                          ? 'bg-emerald-500 text-white font-bold'
                          : v === 0
                            ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            : k === m - 1
                              ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                              : 'bg-gray-50 text-gray-800 dark:bg-gray-900/40 dark:text-gray-100'
                      }`}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Sliders>
        <Slider label="m" value={m} onChange={setM} min={3} max={13} step={1} tone="violet" />
      </Sliders>
      <Note tone={prime ? 'emerald' : 'amber'}>
        {prime
          ? `${m} е просто: в колоната k = ${m - 1} всички числа са 1 – това е малката теорема на Ферма.`
          : `${m} не е просто: в колоната k = ${m - 1} не всички са 1. Редовете с НОД(a, ${m}) > 1 никога не стигат до 1.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Клетката в ред a и колона k е остатъкът на aᵏ при деление на m; зелените са единиците. Сравни m = 7, 11, 13 с m = 8, 9, 12. Забележи и че всеки ред се повтаря периодично – периодът дели m − 1, когато m е просто.
      </p>
    </div>
  );
}
