import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { accuracy, AXIS, type DatasetId, makeData, NOISY_DATASETS, pct } from './classify';
import { Points, Regions } from './Regions';
import { buildForest, buildTree, forestProb, treeProb } from './trees';

const COUNTS = [1, 3, 5, 11, 25, 51, 101];

/** Гора от дълбоки дървета: всяко е преобучено по свой начин, но гласуването им изглажда границата. */
export default function ForestLab() {
  const [id, setId] = useState<DatasetId>('noisy');
  const [ci, setCi] = useState(0);
  const [seed, setSeed] = useState(9);
  const count = COUNTS[ci];

  const train = useMemo(() => makeData(id, 120, 21), [id]);
  const test = useMemo(() => makeData(id, 400, 77), [id]);
  const forest = useMemo(() => buildForest(train, count, seed, 12), [train, count, seed]);
  const single = useMemo(() => buildTree(train, 12), [train]);
  const prob = useMemo(() => {
    const cache = new Map<string, number>();
    return (x: number, y: number) => {
      const key = `${x},${y}`;
      let v = cache.get(key);
      if (v === undefined) {
        v = forestProb(forest, x, y);
        cache.set(key, v);
      }
      return v;
    };
  }, [forest]);
  const accForest = accuracy(test, prob);
  const accSingle = accuracy(test, (x, y) => treeProb(single, x, y));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <Regions s={s} prob={prob} soft />
            <Points s={s} data={train} r={4} />
          </>
        )}
      </Chart>
      <Buttons>
        {NOISY_DATASETS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => setId(d.id)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="max-w-md mx-auto mt-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-16 flex-shrink-0 font-mono text-violet-700 dark:text-violet-400">дървета</span>
          <input type="range" min={0} max={COUNTS.length - 1} step={1} value={ci} onChange={e => setCi(Number(e.target.value))} className="flex-1 min-w-0 accent-violet-500 cursor-pointer" aria-label="Брой дървета в гората" />
          <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{count}</span>
        </label>
      </div>
      <Buttons>
        <DiagramButton onClick={() => setSeed(v => v + 1)}>посади гората отново</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'дървета', value: count, tone: 'violet' },
            { label: 'гората върху 400 нови точки', value: pct(accForest), tone: 'emerald' },
            { label: 'едно дълбоко дърво върху същите', value: pct(accSingle), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        Наситеността на цвета показва каква част от дърветата са съгласни. Където цветът е блед, гората се колебае – обикновено точно там,
        където двата класа се смесват.
      </Note>
    </div>
  );
}
