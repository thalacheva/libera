import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { accuracy, AXIS, type DatasetId, DATASETS, type Logistic, logisticProb, makeData, pct, trainLogistic } from './classify';
import { Points, Regions } from './Regions';

const START: Logistic = { w1: 0, w2: 0, b: 0 };
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('-', '−');

/** Логистична регресия с два признака: границата е права, а цветът показва колко сигурен е моделът. */
export default function BoundaryLab() {
  const [id, setId] = useState<DatasetId>('groups');
  const [model, setModel] = useState(START);
  const [steps, setSteps] = useState(0);

  const train = useMemo(() => makeData(id, 60, 21), [id]);
  const prob = (x: number, y: number) => logisticProb(model, x, y);
  const acc = accuracy(train, prob);

  const run = (n: number) => {
    setModel(m => trainLogistic(m, train, n));
    setSteps(s => s + n);
  };
  const reset = (next: DatasetId = id) => {
    setId(next);
    setModel(START);
    setSteps(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <Regions s={s} prob={prob} soft />
            <Points s={s} data={train} prob={steps ? prob : undefined} />
          </>
        )}
      </Chart>
      <Buttons>
        {DATASETS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => reset(d.id)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => run(100)}>100 стъпки обучение</DiagramButton>
        <DiagramButton onClick={() => run(2000)}>2000 стъпки</DiagramButton>
        <DiagramButton onClick={() => reset()}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: steps },
            { label: 'w₁', value: dec(model.w1), tone: 'violet' },
            { label: 'w₂', value: dec(model.w2), tone: 'violet' },
            { label: 'b', value: dec(model.b), tone: 'violet' },
            { label: 'вярно', value: steps ? pct(acc) : '–', tone: acc > 0.85 ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={steps && id !== 'groups' ? 'amber' : 'gray'}>
        {steps === 0
          ? 'В началото всички тегла са нула и моделът е напълно несигурен навсякъде – вероятност 50%. Натисни „обучение“.'
          : id === 'groups'
            ? 'Границата е права линия. Колкото по-далеч от нея е една точка, толкова по-наситен е цветът – толкова по-сигурен е моделът.'
            : 'Колкото и да се обучава, границата остава права – а тези два класа не могат да се разделят с права. Върни се при най-близките съседи и опитай същия набор там.'}
      </Note>
    </div>
  );
}
