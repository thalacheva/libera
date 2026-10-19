import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { formulaText } from '../formula';

type Obs = { kind: 'ppt' | 'gas' | 'none'; text: string; fill?: string };
type PuzzleSet = { name: string; substances: string[]; tint: Record<string, string>; obs: Record<string, Obs> };

const W = '#f8fafc';
const none: Obs = { kind: 'none', text: '—' };

// Наблюденията за всяка двойка (ключ – двете формули по азбучен ред на индексите в substances)
const SETS: PuzzleSet[] = [
  {
    name: 'безцветни разтвори',
    substances: ['HCl', 'Na2CO3', 'BaCl2', 'AgNO3', 'NaCl'],
    tint: {},
    obs: {
      'HCl|Na2CO3': { kind: 'gas', text: 'газ ↑' },
      'HCl|BaCl2': none,
      'HCl|AgNO3': { kind: 'ppt', text: 'бяла ↓', fill: W },
      'HCl|NaCl': none,
      'Na2CO3|BaCl2': { kind: 'ppt', text: 'бяла ↓', fill: W },
      'Na2CO3|AgNO3': { kind: 'ppt', text: 'бледожълта ↓', fill: '#f3ecc0' },
      'Na2CO3|NaCl': none,
      'BaCl2|AgNO3': { kind: 'ppt', text: 'бяла ↓', fill: W },
      'BaCl2|NaCl': none,
      'AgNO3|NaCl': { kind: 'ppt', text: 'бяла ↓', fill: W },
    },
  },
  {
    name: 'с цветни разтвори',
    substances: ['NaOH', 'CuSO4', 'FeCl3', 'BaCl2', 'H2SO4'],
    tint: { CuSO4: '#7db7f0', FeCl3: '#e9b949' },
    obs: {
      'NaOH|CuSO4': { kind: 'ppt', text: 'синя ↓', fill: '#3b82f6' },
      'NaOH|FeCl3': { kind: 'ppt', text: 'кафява ↓', fill: '#8b3a1a' },
      'NaOH|BaCl2': none,
      'NaOH|H2SO4': { kind: 'none', text: 'топлина' },
      'CuSO4|FeCl3': none,
      'CuSO4|BaCl2': { kind: 'ppt', text: 'бяла ↓', fill: W },
      'CuSO4|H2SO4': none,
      'FeCl3|BaCl2': none,
      'FeCl3|H2SO4': none,
      'BaCl2|H2SO4': { kind: 'ppt', text: 'бяла ↓', fill: W },
    },
  },
];

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д'];

function observe(set: PuzzleSet, a: string, b: string): Obs {
  const [x, y] = set.substances.indexOf(a) < set.substances.indexOf(b) ? [a, b] : [b, a];
  return set.obs[`${x}|${y}`];
}

function shuffled(n: number) {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

/** Пет шишета без етикети: смесваме ги по двойки и по наблюденията разпознаваме веществата. */
export default function UnknownBottlesLab() {
  const [si, setSi] = useState(0);
  // Началната подредба е фиксирана (за предварителното рендериране); „Нови шишета“ я разбърква
  const [perm, setPerm] = useState([2, 0, 4, 1, 3]);
  const [picked, setPicked] = useState<number[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [guess, setGuess] = useState<(string | '')[]>(['', '', '', '', '']);
  const [checked, setChecked] = useState(false);
  const set = SETS[si];
  const sub = (bottle: number) => set.substances[perm[bottle]];

  const reset = (newSet = si) => {
    setSi(newSet);
    setPerm(shuffled(5));
    setPicked([]);
    setDone(new Set());
    setGuess(['', '', '', '', '']);
    setChecked(false);
  };

  // Функционални обновявания – бързите поредни докосвания не се губят
  const pick = (b: number) =>
    setPicked(prev => {
      if (prev.includes(b)) return prev.filter(x => x !== b);
      const next = prev.length === 2 ? [b] : [...prev, b];
      if (next.length === 2) setDone(d => new Set(d).add([...next].sort().join('-')));
      return next;
    });

  const last = picked.length === 2 ? observe(set, sub(picked[0]), sub(picked[1])) : null;
  const correct = guess.filter((g, b) => g === sub(b)).length;
  const bottleX = (b: number) => 40 + b * 54;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SETS.map((x, i) => (
          <DiagramButton key={x.name} active={i === si} onClick={() => reset(i)}>
            {x.name}
          </DiagramButton>
        ))}
        <DiagramButton onClick={() => reset()}>🔀 нови шишета</DiagramButton>
      </Buttons>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
        В шишетата са {set.substances.map(formulaText).join(', ')} – но не знаем кое къде е. Докосни две шишета, за да смесиш проби от тях.
      </p>

      <LabSvg viewBox="0 0 480 170" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {LETTERS.map((L, b) => {
          const x = bottleX(b);
          const on = picked.includes(b);
          return (
            <g key={L} onClick={() => pick(b)} className="cursor-pointer">
              <rect x={x - 18} y={40} width={36} height={90} rx={8} fill={set.tint[sub(b)] ?? '#dbeafe'} fillOpacity={set.tint[sub(b)] ? 0.85 : 0.4} />
              <rect x={x - 18} y={40} width={36} height={90} rx={8} fill="none" strokeWidth={on ? 3 : 1.5} className={on ? 'stroke-blue-500' : 'stroke-gray-500 dark:stroke-gray-300'} />
              <rect x={x - 7} y={26} width={14} height={14} className="fill-gray-500 dark:fill-gray-400" />
              <text x={x} y={92} fontSize="18" fontWeight="700" textAnchor="middle" className="fill-gray-900 stroke-white" strokeWidth="3" paintOrder="stroke">
                {L}
              </text>
            </g>
          );
        })}
        {/* епруветката с последното смесване */}
        <text x={395} y={22} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          {picked.length === 2 ? `${LETTERS[picked[0]]} + ${LETTERS[picked[1]]}` : 'смесване'}
        </text>
        <path d="M 378 30 V 128 A 17 17 0 0 0 412 128 V 30" fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        {last && (
          <g>
            <path d="M 378 70 V 128 A 17 17 0 0 0 412 128 V 70 Z" fill="#dbeafe" fillOpacity="0.5" />
            {last.kind === 'ppt' && <path d="M 378 124 V 128 A 17 17 0 0 0 412 128 V 124 Z" fill={last.fill} stroke="#6b7280" strokeWidth="1" />}
            {last.kind === 'ppt' && [0, 1, 2, 3, 4, 5, 6].map(k => <circle key={k} cx={383 + ((k * 11) % 24)} cy={78 + ((k * 17) % 44)} r={2.6} fill={last.fill} stroke="#6b7280" strokeWidth="0.8" />)}
            {last.kind === 'gas' && [0, 1, 2, 3].map(k => <circle key={k} cx={386 + k * 6} cy={60 - (k % 2) * 12} r={3} fill="none" className="stroke-gray-500 dark:stroke-gray-300" />)}
            <text x={395} y={163} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
              {last.kind === 'none' ? (last.text === 'топлина' ? 'затопля се' : 'нищо') : last.kind === 'gas' ? 'газ' : `${last.text.replace(' ↓', '')} утайка`}
            </text>
          </g>
        )}
      </LabSvg>
      <Buttons>
        {LETTERS.map((L, b) => (
          <DiagramButton key={L} active={picked.includes(b)} onClick={() => pick(b)}>
            {L}
          </DiagramButton>
        ))}
      </Buttons>

      {/* таблица на наблюденията */}
      <div className="overflow-x-auto mt-3">
        <table className="mx-auto text-sm border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1" />
              {LETTERS.map(L => (
                <th key={L} className="px-2 py-1 font-semibold">
                  {L}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LETTERS.map((L, i) => (
              <tr key={L}>
                <th className="px-2 py-1 font-semibold">{L}</th>
                {LETTERS.map((_, j) => {
                  const key = [i, j].sort().join('-');
                  const o = i !== j && done.has(key) ? observe(set, sub(i), sub(j)) : null;
                  return (
                    <td key={j} className={`px-2 py-1 text-center border border-gray-200 dark:border-gray-700 whitespace-nowrap ${i === j ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                      {o ? o.text : i === j ? '' : '?'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* отговорът на ученика */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {LETTERS.map((L, b) => (
          <label key={L} className="text-sm flex items-center gap-1">
            <span className="font-semibold">{L}:</span>
            <select
              value={guess[b]}
              onChange={e => {
                const g = [...guess];
                g[b] = e.target.value;
                setGuess(g);
                setChecked(false);
              }}
              className={`rounded border px-1 py-0.5 bg-white dark:bg-gray-900 ${checked ? (guess[b] === sub(b) ? 'border-green-500' : 'border-red-500') : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">?</option>
              {set.substances.map(f => (
                <option key={f} value={f}>
                  {formulaText(f)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <Buttons>
        <DiagramButton onClick={() => setChecked(true)}>Провери</DiagramButton>
      </Buttons>
      {checked && (
        <Note tone={correct === 5 ? 'emerald' : 'amber'}>
          {correct === 5
            ? `Браво! Направи ${done.size} смесвания от 10 възможни.`
            : `Верни са ${correct} от 5. Помисли кое вещество с колко от другите дава утайка или газ.`}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Подсказка: за всяко вещество преброй колко утайки, газове и „нищо“ дава с останалите четири – получава се „отпечатък“, по
        който веществата се различават. Ако искаш, попълни първо на лист очакваната таблица и после я сравни с наблюденията.
      </p>
    </div>
  );
}
