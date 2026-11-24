import { useState } from 'react';
import { Plot, PlotArrow, PlotDot, PlotHandle, PlotLabel, Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { attend } from './attentionMath';

const KEYS = [
  [3, 1],
  [1, 3],
  [-2, 2],
  [-1, -3],
];
const VALUES = [
  [4, 0],
  [0, 3],
  [-3, -1],
  [2, -3],
];
const SUB = ['₁', '₂', '₃', '₄'];
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Една заявка (влачи се) към четири ключа: оценки, тегла след софтмакс и изходът като претеглена средна на стойностите. */
export default function AttentionQueryLab() {
  const [q, setQ] = useState({ x: 2, y: 1 });
  const [sharp, setSharp] = useState(0.3);
  const { scores, weights, out } = attend([q.x, q.y], KEYS, VALUES, sharp);
  const best = weights.indexOf(Math.max(...weights));
  const top = weights[best];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Plot x={[-5, 5]} y={[-4, 4]}>
        {KEYS.map((k, i) => (
          <g key={`k${i}`} opacity={0.35 + 0.65 * weights[i]}>
            <PlotArrow p={{ x: 0, y: 0 }} q={{ x: k[0], y: k[1] }} tone="blue" width={2 + 5 * weights[i]} />
          </g>
        ))}
        {KEYS.map((k, i) => (
          <PlotLabel key={`kl${i}`} p={{ x: k[0], y: k[1] }} tone="blue" dx={k[0] > 0 ? 14 : -14} dy={k[1] > 0 ? -8 : 16}>
            k{SUB[i]}
          </PlotLabel>
        ))}
        {VALUES.map((v, i) => (
          <g key={`v${i}`}>
            <PlotDot p={{ x: v[0], y: v[1] }} tone="violet" r={4 + 7 * weights[i]} />
            <PlotLabel p={{ x: v[0], y: v[1] }} tone="violet" dx={v[0] >= 0 ? 16 : -16} dy={v[1] < 0 ? 18 : -10}>
              v{SUB[i]}
            </PlotLabel>
          </g>
        ))}
        <PlotArrow p={{ x: 0, y: 0 }} q={q} tone="rose" width={3.5} />
        <PlotDot p={{ x: out[0], y: out[1] }} tone="amber" r={8} />
        <PlotLabel p={{ x: out[0], y: out[1] }} tone="amber" dy={-14}>
          изход
        </PlotLabel>
        <PlotHandle p={q} onMove={setQ} name="заявка" tone="rose" />
      </Plot>
      <Sliders>
        <Slider label="острота" value={sharp} onChange={setSharp} min={0} max={2} step={0.1} tone="amber" />
      </Sliders>
      <div className="max-w-md mx-auto mt-3 space-y-1.5 text-sm font-mono">
        {KEYS.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-7 text-blue-600 dark:text-blue-400">k{SUB[i]}</span>
            <span className="w-14 text-right text-gray-600 dark:text-gray-300">{dec(scores[i], 1)}</span>
            <span className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <span className="block h-full bg-blue-500" style={{ width: `${weights[i] * 100}%` }} />
            </span>
            <span className="w-12 text-right text-gray-900 dark:text-gray-100">{Math.round(weights[i] * 100)}%</span>
          </div>
        ))}
        <p className="text-xs text-center font-sans text-gray-500 dark:text-gray-400">ключ · оценка · тегло след софтмакс</p>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'заявка', value: `(${q.x}; ${q.y})`, tone: 'rose' },
            { label: 'най-голямо тегло', value: `k${SUB[best]} – ${Math.round(top * 100)}%`, tone: 'blue' },
            { label: 'изход', value: `(${dec(out[0])}; ${dec(out[1])})`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={sharp === 0 || (q.x === 0 && q.y === 0) ? 'gray' : top > 0.9 ? 'amber' : 'emerald'}>
        {sharp === 0 || (q.x === 0 && q.y === 0)
          ? 'Всички оценки са равни – вниманието се разпределя по равно и изходът е обикновената средна на четирите стойности.'
          : top > 0.9
            ? `Почти цялото внимание отива при k${SUB[best]} и изходът на практика съвпада със стойността v${SUB[best]} – „меко“ търсене, което е станало почти твърдо.`
            : 'Влачи червената заявка. Колкото по-добре сочи по посока на един ключ, толкова по-голяма е оценката му и толкова по-близо до неговата стойност (лилава точка) отива жълтият изход.'}
      </Note>
    </div>
  );
}
