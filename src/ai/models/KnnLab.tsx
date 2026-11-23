import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { accuracy, AXIS, type DatasetId, DATASETS, knnShare, makeData, pct } from './classify';
import { Points, Regions } from './Regions';

const KS = [1, 3, 5, 7, 9, 15, 25, 60];

/** k най-близки съседи: как броят на съседите променя границата между двата класа. */
export default function KnnLab() {
  const [id, setId] = useState<DatasetId>('groups');
  const [ki, setKi] = useState(0);
  const k = KS[ki];

  const train = useMemo(() => makeData(id, 60, 21), [id]);
  const test = useMemo(() => makeData(id, 200, 77), [id]);
  const prob = useMemo(() => {
    const cache = new Map<string, number>();
    return (x: number, y: number) => {
      const key = `${x},${y}`;
      let v = cache.get(key);
      if (v === undefined) {
        v = knnShare(train, k, x, y);
        cache.set(key, v);
      }
      return v;
    };
  }, [train, k]);
  const accTrain = accuracy(train, prob);
  const accTest = accuracy(test, prob);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <Regions s={s} prob={prob} />
            <Points s={s} data={train} prob={prob} />
          </>
        )}
      </Chart>
      <Buttons>
        {DATASETS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => setId(d.id)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="max-w-md mx-auto mt-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-16 flex-shrink-0 font-mono text-violet-700 dark:text-violet-400">k</span>
          <input type="range" min={0} max={KS.length - 1} step={1} value={ki} onChange={e => setKi(Number(e.target.value))} className="flex-1 min-w-0 accent-violet-500 cursor-pointer" aria-label="Брой съседи k" />
          <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{k}</span>
        </label>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'съседи k', value: k, tone: 'violet' },
            { label: 'вярно върху 60-те познати точки', value: pct(accTrain), tone: 'blue' },
            { label: 'вярно върху 200 нови точки', value: pct(accTest), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="gray">
        {k === 1
          ? 'При k = 1 всяка позната точка си има собствено „островче“ и върху познатите точки няма нито една грешка. Виж обаче числото за новите точки.'
          : k >= 60
            ? 'При k = 60 гласуват всичките 60 точки, по 30 от клас. Гласовете са винаги поравно и граница няма – моделът не е научил нищо.'
            : 'Точките с черен контур са от грешната страна на границата. Сравни двете числа при различни k.'}
      </Note>
    </div>
  );
}
