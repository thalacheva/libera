import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { ALL_ON, circuitCorrect, INPUTS, type Mode, type Modes, NEURONS, OUT_THRESHOLD, runCircuit } from './featureMath';

const dec = (v: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: 1 }).replace('-', '−');
const MODES: [Mode, string][] = [
  ['on', 'работи'],
  ['off', 'изключен'],
  ['patch', 'подменен'],
];
const pick = 'px-2 py-1 rounded border text-xs transition-colors';
const picked: Record<Mode, string> = {
  on: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  off: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  patch: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};
const idle = 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60';

/** Ръчно сглобена верига за „точно един от двата входа“: изключване на неврон и подмяна на активацията му с тази от друг вход. */
export default function AblationLab() {
  const [modes, setModes] = useState<Modes>(ALL_ON);
  const [donor, setDonor] = useState(3);

  const rows = INPUTS.map(x => runCircuit(x, modes, INPUTS[donor]));
  const correct = circuitCorrect(modes, INPUTS[donor]);
  const touched = NEURONS.filter(n => modes[n.id] !== 'on');
  const patching = touched.some(n => modes[n.id] === 'patch');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-300 mb-2">
        Изход = 1, ако 0,5·A − 1·B + 0,5·C + 0·D ≥ {dec(OUT_THRESHOLD)}. Задачата: „точно един от двата входа е 1“.
      </p>
      <div className="space-y-1.5 max-w-lg mx-auto">
        {NEURONS.map(n => (
          <div key={n.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 p-1.5 rounded border border-gray-200 dark:border-gray-700">
            <span className="font-bold text-fuchsia-700 dark:text-fuchsia-300 w-4">{n.id}</span>
            <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 flex-1 min-w-[9rem]">
              „{n.name}“ <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{n.rule}</span>
            </span>
            <span className="flex gap-1">
              {MODES.map(([m, label]) => (
                <button key={m} aria-pressed={modes[n.id] === m} onClick={() => setModes({ ...modes, [n.id]: m })} className={`${pick} ${modes[n.id] === m ? picked[m] : idle}`}>
                  {label}
                </button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300 mt-3">Вход донор – от него се взима активацията на подменените неврони:</p>
      <Buttons>
        {INPUTS.map((x, i) => (
          <DiagramButton key={i} active={donor === i} onClick={() => setDonor(i)}>
            ({x[0]}; {x[1]})
          </DiagramButton>
        ))}
        <DiagramButton onClick={() => setModes(ALL_ON)}>върни всичко</DiagramButton>
      </Buttons>
      <div className="overflow-x-auto mt-3">
        <table className="w-full max-w-lg mx-auto text-xs sm:text-sm text-center border-collapse">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="py-1 font-medium">вход</th>
              {NEURONS.map(n => (
                <th key={n.id} className={`py-1 font-bold ${modes[n.id] === 'off' ? 'text-rose-600 dark:text-rose-400' : modes[n.id] === 'patch' ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                  {n.id}
                </th>
              ))}
              <th className="py-1 font-medium">сбор</th>
              <th className="py-1 font-medium">изход</th>
              <th className="py-1 font-medium">трябва</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bad = r.out !== r.want;
              return (
                <tr key={i} className={`border-t border-gray-100 dark:border-gray-700 ${bad ? 'bg-rose-50 dark:bg-rose-950/30' : ''}`}>
                  <td className="py-1 font-mono text-gray-800 dark:text-gray-100">
                    ({INPUTS[i][0]}; {INPUTS[i][1]})
                  </td>
                  {NEURONS.map(n => (
                    <td key={n.id} className={`py-1 font-mono ${r.acts[n.id] ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                      {r.acts[n.id]}
                    </td>
                  ))}
                  <td className="py-1 font-mono text-gray-800 dark:text-gray-100">{dec(r.sum)}</td>
                  <td className={`py-1 font-mono font-semibold ${bad ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {r.out} {bad ? '✗' : '✓'}
                  </td>
                  <td className="py-1 font-mono text-gray-500 dark:text-gray-400">{r.want}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'верни отговори', value: `${correct} от 4`, tone: correct === 4 ? 'emerald' : 'rose' },
            { label: 'пипнати неврони', value: touched.length ? touched.map(n => n.id).join(', ') : 'няма', tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={touched.length === 0 ? 'gray' : correct === 4 ? 'amber' : 'rose'}>
        {touched.length === 0
          ? 'Веригата работи. Изключи или подмени неврон и виж кои редове се чупят.'
          : correct === 4
            ? 'Нищо не се счупи. Или невронът не участва в сметката, или друг върши същата работа вместо него.'
            : patching
              ? 'Подмяната пренесе в сметката късче от друг вход – и изходът тръгна след него. Това е пряко свидетелство какво носи този неврон.'
              : 'Счупените редове показват за кои входове този неврон е бил нужен – това вече е причинна връзка, а не съвпадение.'}
      </Note>
    </div>
  );
}
