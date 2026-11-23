import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { accuracy, AXIS, type DatasetId, makeData, NOISY_DATASETS, pct } from './classify';
import { Points, Regions } from './Regions';
import { buildTree, leaves, type Tree, treeProb } from './trees';

const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Първите нива на дървото като вложен списък от въпроси. */
function Questions({ tree, level = 0 }: { tree: Tree; level?: number }) {
  if (tree.leaf) {
    const red = tree.ones > tree.total / 2;
    return <span className={red ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-300'}>{red ? 'червен' : 'син'} ({tree.ones} червени, {tree.total - tree.ones} сини)</span>;
  }
  if (level >= 2) return <span className="text-gray-500 dark:text-gray-400">още въпроси…</span>;
  return (
    <span>
      {tree.feature === 'x' ? 'x₁' : 'x₂'} ≤ {dec(tree.t)}?
      <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-300 pl-3 dark:border-gray-600">
        <li>
          да → <Questions tree={tree.left} level={level + 1} />
        </li>
        <li>
          не → <Questions tree={tree.right} level={level + 1} />
        </li>
      </ul>
    </span>
  );
}

/** Дърво на решенията с избрана дълбочина: правоъгълни области и точност върху познати и нови точки. */
export default function TreeLab() {
  const [id, setId] = useState<DatasetId>('noisy');
  const [maxDepth, setMaxDepth] = useState(1);

  const train = useMemo(() => makeData(id, 120, 21), [id]);
  const test = useMemo(() => makeData(id, 400, 77), [id]);
  const tree = useMemo(() => buildTree(train, maxDepth), [train, maxDepth]);
  const prob = (x: number, y: number) => treeProb(tree, x, y);
  const accTrain = accuracy(train, prob);
  const accTest = accuracy(test, prob);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <Regions s={s} prob={prob} />
            <Points s={s} data={train} prob={prob} r={4} />
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
      <Sliders>
        <Slider label="нива" value={maxDepth} onChange={setMaxDepth} min={0} max={12} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'листа', value: leaves(tree), tone: 'violet' },
            { label: 'вярно върху 120-те познати точки', value: pct(accTrain), tone: 'blue' },
            { label: 'вярно върху 400 нови точки', value: pct(accTest), tone: 'emerald' },
          ]}
        />
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
        <p className="mb-1 font-semibold">Началото на дървото:</p>
        <Questions tree={tree} />
      </div>
      <Note tone="gray">Всеки въпрос реже полето с отсечка, успоредна на някоя от осите, затова областите са правоъгълници. Увеличавай нивата и следи двете числа за точност.</Note>
    </div>
  );
}
