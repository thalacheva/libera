import { useState } from 'react';
import { Tex } from '~/MathText';
import { parseNum } from '~/drill';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { atomicMass, formulaTex } from '../formula';

type Entry = { symbol: string; pct: string };

const PRESETS: { name: string; entries: Entry[]; M: string }[] = [
  { name: 'захар от плодове', entries: [{ symbol: 'C', pct: '40,0' }, { symbol: 'H', pct: '6,7' }, { symbol: 'O', pct: '53,3' }], M: '180' },
  { name: 'въглеводород', entries: [{ symbol: 'C', pct: '85,7' }, { symbol: 'H', pct: '14,3' }], M: '56' },
  { name: 'хематит', entries: [{ symbol: 'Fe', pct: '70,0' }, { symbol: 'O', pct: '30,0' }], M: '' },
  { name: 'магнетит', entries: [{ symbol: 'Fe', pct: '72,4' }, { symbol: 'O', pct: '27,6' }], M: '' },
  { name: 'етанол', entries: [{ symbol: 'C', pct: '52,2' }, { symbol: 'H', pct: '13,0' }, { symbol: 'O', pct: '34,8' }], M: '46' },
  { name: 'бензен', entries: [{ symbol: 'C', pct: '92,3' }, { symbol: 'H', pct: '7,7' }], M: '78' },
];
const SYMBOLS = ['C', 'H', 'O', 'N', 'S', 'P', 'Cl', 'Na', 'K', 'Ca', 'Mg', 'Al', 'Fe', 'Cu'];

const fmt = (v: number, d: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });
const texNum = (v: number, d: number) => fmt(v, d).replace(',', '{,}');

/** Най-малкият множител k ≤ 6, с който всички отношения стават почти цели числа. */
function multiplier(ratios: number[]) {
  for (let k = 1; k <= 6; k++) if (ratios.every(r => Math.abs(r * k - Math.round(r * k)) < 0.1)) return k;
  return null;
}

/** Формула по масовите части: деление на атомната маса, на най-малкото и умножение до цели числа. */
export default function EmpiricalFormulaLab() {
  const [preset, setPreset] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(PRESETS[0].entries);
  const [M, setM] = useState(PRESETS[0].M);

  const choose = (i: number) => {
    setPreset(i);
    setEntries(PRESETS[i].entries);
    setM(PRESETS[i].M);
  };
  const update = (i: number, e: Partial<Entry>) => {
    setPreset(-1);
    setEntries(entries.map((x, k) => (k === i ? { ...x, ...e } : x)));
  };

  const rows = entries.map(e => {
    const w = parseNum(e.pct);
    const A = atomicMass(e.symbol);
    return { ...e, w, A, n: w !== null && w > 0 ? w / A : null };
  });
  const valid = rows.every(r => r.n !== null) && new Set(rows.map(r => r.symbol)).size === rows.length;
  const sum = rows.reduce((s, r) => s + (r.w ?? 0), 0);
  const nMin = valid ? Math.min(...rows.map(r => r.n!)) : 0;
  const ratios = valid ? rows.map(r => r.n! / nMin) : [];
  const k = valid ? multiplier(ratios) : null;
  const counts = k ? ratios.map(r => Math.round(r * k)) : [];
  const empirical = k ? rows.map((r, i) => `${r.symbol}${counts[i] > 1 ? counts[i] : ''}`).join('') : '';
  const Memp = k ? rows.reduce((s, r, i) => s + r.A * counts[i], 0) : 0;
  const Mval = parseNum(M);
  const times = k && Mval ? Mval / Memp : null;
  const molecular = times && Math.abs(times - Math.round(times)) < 0.05 && Math.round(times) >= 1 ? rows.map((r, i) => `${r.symbol}${counts[i] * Math.round(times) > 1 ? counts[i] * Math.round(times) : ''}`).join('') : null;

  const input = 'px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center font-mono';
  const cell = 'px-3 py-1.5';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.name} active={i === preset} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 text-left">
              <th className={`${cell} font-semibold`}>елемент</th>
              <th className={`${cell} font-semibold`}>
                <Tex>{'w,\\ \\%'}</Tex>
              </th>
              <th className={`${cell} font-semibold`}>
                <Tex>{'n = \\frac{w}{A_r}'}</Tex>
              </th>
              <th className={`${cell} font-semibold`}>
                <Tex>{'n : n_{\\min}'}</Tex>
              </th>
              <th className={`${cell} font-semibold`}>{k && k > 1 ? `× ${k}` : 'цяло'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                <td className={cell}>
                  <select value={r.symbol} onChange={e => update(i, { symbol: e.target.value })} className={input} aria-label="елемент">
                    {SYMBOLS.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className={cell}>
                  <input value={r.pct} onChange={e => update(i, { pct: e.target.value })} className={`${input} w-20`} inputMode="decimal" aria-label={`масова част на ${r.symbol}`} />
                </td>
                <td className={cell}>{r.n !== null ? `${fmt(r.w!, 2)} : ${fmt(r.A, 1)} = ${fmt(r.n, 3)}` : '–'}</td>
                <td className={cell}>{valid ? fmt(ratios[i], 2) : '–'}</td>
                <td className={`${cell} font-semibold`}>{k ? counts[i] : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Buttons>
        {entries.length < 4 && (
          <DiagramButton
            onClick={() => {
              setPreset(-1);
              setEntries([...entries, { symbol: SYMBOLS.find(s => !entries.some(e => e.symbol === s)) ?? 'N', pct: '' }]);
            }}
          >
            + елемент
          </DiagramButton>
        )}
        {entries.length > 2 && <DiagramButton
            onClick={() => {
              setPreset(-1);
              setEntries(entries.slice(0, -1));
            }}
          >
            − елемент
          </DiagramButton>}
      </Buttons>
      <div className="flex flex-wrap justify-center items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
        <label htmlFor="empirical-M">Моларна маса (ако е известна), g/mol:</label>
        <input id="empirical-M" value={M} onChange={e => {
            setPreset(-1);
            setM(e.target.value);
          }} className={`${input} w-20`} inputMode="decimal" />
      </div>

      {!valid && <Note tone="rose">Попълни масовите части с положителни числа и избери различни елементи.</Note>}
      {valid && Math.abs(sum - 100) > 1 && <Note tone="amber">{`Сборът на масовите части е ${fmt(sum, 1)}%, а трябва да е около 100%.`}</Note>}
      {valid && !k && <Note tone="rose">Отношенията не стават цели числа с множител до 6 – провери данните.</Note>}
      {k && (
        <div className="text-center text-lg mt-3 text-gray-900 dark:text-gray-100">
          <Tex>{`\\text{най-проста формула: } ${formulaTex(empirical)},\\quad M = ${texNum(Memp, 1)}\\ \\mathrm{g/mol}`}</Tex>
        </div>
      )}
      {k && times !== null && (
        <Note tone={molecular ? 'emerald' : 'rose'}>
          {molecular
            ? `${fmt(Mval!, 1)} : ${fmt(Memp, 1)} = ${Math.round(times)} → молекулната формула е ${molecular.replace(/(\d+)/g, d => [...d].map(c => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]).join(''))}.`
            : `${fmt(Mval!, 1)} : ${fmt(Memp, 1)} ≈ ${fmt(times, 2)} – не е цяло число, провери моларната маса.`}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Удобно е да си представим 100 g от веществото – тогава масовите части в проценти са масите в грамове. Делим на атомната маса
        (броят молове), после на най-малкия брой молове. Ако се получи 1,5 или 1,33, умножаваме по 2 или 3. Моларната маса казва колко пъти
        молекулата е „по-голяма“ от най-простата формула.
      </p>
    </div>
  );
}
