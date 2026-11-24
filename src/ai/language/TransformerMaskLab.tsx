import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { canSee, visiblePairs } from './transformer';

const TOKENS = ['Малката', 'котка', 'спи', 'на', 'топлия', 'диван', '.'];
const N = TOKENS.length;

/** Маската към бъдещето: кой токен кои токени вижда и колко задачи „познай следващия“ дава един текст. */
export default function TransformerMaskLab() {
  const [row, setRow] = useState(2);
  const [masked, setMasked] = useState(true);

  const seen = TOKENS.filter((_, c) => canSee(row, c, masked));
  const target = row < N - 1 ? TOKENS[row + 1] : null;
  const cheats = !masked && target !== null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-0.5 text-[11px] sm:text-sm select-none">
          <thead>
            <tr>
              <th className="px-1 text-right font-normal text-gray-500 dark:text-gray-400">гледа ↓ / вижда →</th>
              {TOKENS.map((t, c) => (
                <th key={c} className="px-0.5 font-medium text-gray-700 dark:text-gray-200">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOKENS.map((t, r) => (
              <tr key={r} onClick={() => setRow(r)} className="cursor-pointer">
                <td className={`px-1.5 py-1 text-right rounded ${r === row ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 font-semibold text-fuchsia-900 dark:text-fuchsia-100' : 'text-gray-700 dark:text-gray-200'}`}>{t}</td>
                {TOKENS.map((_, c) => {
                  const ok = canSee(r, c, masked);
                  const answer = !masked && c === r + 1;
                  return (
                    <td
                      key={c}
                      className={`w-9 h-8 sm:w-12 sm:h-9 text-center rounded ${
                        !ok
                          ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                          : answer
                            ? 'bg-rose-400 text-white dark:bg-rose-600'
                            : r === row
                              ? 'bg-fuchsia-500 text-white'
                              : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-200'
                      }`}
                    >
                      {ok ? (answer ? '!' : '●') : '✕'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Buttons>
        <DiagramButton active={masked} onClick={() => setMasked(true)}>
          с маска
        </DiagramButton>
        <DiagramButton active={!masked} onClick={() => setMasked(false)}>
          без маска
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'позиция', value: `${row + 1} от ${N}`, tone: 'violet' },
            { label: 'вижда', value: `${seen.length} ${seen.length === 1 ? 'токен' : 'токена'}` },
            { label: 'разрешени двойки', value: `${visiblePairs(N, masked)} от ${N * N}`, tone: masked ? 'emerald' : 'rose' },
            { label: 'задачи от този текст', value: N - 1, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={cheats ? 'rose' : 'gray'}>
        {target === null
          ? 'Последната позиция няма верен отговор в този текст – след точката не следва нищо. Затова задачите са с една по-малко от токените. Когато моделът пише, точно нейният изход е новият токен.'
          : cheats
            ? `Позицията „${TOKENS[row]}“ трябва да познае „${target}“ – а го вижда (червената клетка). Така моделът ще се научи да преписва отговора, а не да предсказва.`
            : `Позицията „${TOKENS[row]}“ вижда „${seen.join(' ')}“ и трябва да познае следващия токен: „${target}“. Докосни друг ред.`}
      </Note>
    </div>
  );
}
