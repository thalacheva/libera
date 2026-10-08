import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const W = 600;
const H = 260;
const STAGES = [
  { name: 'тениска', label: '👕', icons: ['🔴', '🔵', '🟢', '🟡'] },
  { name: 'панталон', label: '👖', icons: ['👖', '🩳', '🩲', '🥋'] },
  { name: 'обувки', label: '👟', icons: ['👟', '👞', '🥾', '👢'] },
];

/** Правило за умножение: всеки избор се разклонява на толкова клона, колкото са възможностите на следващата стъпка. */
export default function TreeLab() {
  const [counts, setCounts] = useState([3, 2, 2]);
  const total = counts.reduce((p, c) => p * c, 1);

  // Нивата на дървото: корен, после листата на всяка стъпка
  const levels: { x: number; parent: number; icon: string }[][] = [[{ x: 80 + (W - 90) / 2, parent: -1, icon: '' }]];
  counts.forEach((c, s) => {
    const prev = levels[s];
    const n = prev.length * c;
    const row = Array.from({ length: n }, (_, i) => ({
      x: 80 + ((i + 0.5) / n) * (W - 90),
      parent: Math.floor(i / c),
      icon: STAGES[s].icons[i % c],
    }));
    levels.push(row);
  });
  const Y = (l: number) => 22 + l * ((H - 50) / counts.length);
  const leaves = levels[levels.length - 1].length;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🌳 Дърво на възможностите</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Обличаме се: тениска, после панталон, после обувки. Всеки клон на дървото е един възможен тоалет. Колко са листата?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        {levels.slice(1).map((row, l) =>
          row.map((node, i) => (
            <line
              key={`${l}-${i}`}
              x1={levels[l][node.parent].x}
              y1={Y(l) + 8}
              x2={node.x}
              y2={Y(l + 1) - 10}
              stroke="currentColor"
              strokeOpacity="0.3"
            />
          )),
        )}
        <circle cx={80 + (W - 90) / 2} cy={Y(0)} r={7} className="fill-emerald-600" />
        {levels.slice(1).map((row, l) =>
          row.map((node, i) => (
            <text key={`t${l}-${i}`} x={node.x} y={Y(l + 1) + 4} fontSize={row.length > 32 ? 9 : row.length > 16 ? 12 : 16} textAnchor="middle">
              {node.icon}
            </text>
          )),
        )}
        {counts.map((c, s) => (
          <text key={s} x={4} y={Y(s + 1) + 4} fontSize="12" fill="currentColor" opacity="0.6">
            {STAGES[s].name}: {c}
          </text>
        ))}
      </svg>

      <Sliders>
        {STAGES.map((st, s) => (
          <Slider
            key={st.name}
            label={st.label}
            value={counts[s]}
            onChange={v => setCounts(counts.map((c, i) => (i === s ? v : c)))}
            min={1}
            max={4}
            step={1}
            tone={(['rose', 'blue', 'amber'] as const)[s]}
          />
        ))}
      </Sliders>

      <Formula>
        {counts.join(' · ')} = <span className="font-bold">{total}</span> тоалета ({leaves} листа)
      </Formula>
      <Note tone="emerald">Правило за умножение: ако изборите се правят последователно и независимо, броят на начините се умножава.</Note>
    </div>
  );
}
