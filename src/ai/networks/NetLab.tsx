import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { accuracy, AXIS, type DatasetId, DATASETS, makeData, pct } from '../models/classify';
import { Points, Regions } from '../models/Regions';
import { type Activation, mlpLoss, mlpProb, paramCount, randomMlp, trainMlp } from './mlp';

const SETS = DATASETS.filter(d => d.id !== 'groups');
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Мрежа 2 → H → 1 върху наборите, които една права не може да раздели: брой скрити неврони, със и без активираща функция. */
export default function NetLab() {
  const [id, setId] = useState<DatasetId>('ring');
  const [hidden, setHidden] = useState(1);
  const [act, setAct] = useState<Activation>('tanh');
  const [seed, setSeed] = useState(1);
  const [lines, setLines] = useState(true);
  const [net, setNet] = useState(() => randomMlp(1, 'tanh', 101));
  const [steps, setSteps] = useState(0);

  const train = useMemo(() => makeData(id, 60, 21), [id]);
  const fresh = useMemo(() => makeData(id, 200, 77), [id]);
  const prob = (x: number, y: number) => mlpProb(net, x, y);
  const acc = accuracy(train, prob);
  const accNew = accuracy(fresh, prob);

  const restart = (next: { id?: DatasetId; hidden?: number; act?: Activation; seed?: number }) => {
    const h = next.hidden ?? hidden;
    const a = next.act ?? act;
    const s = next.seed ?? seed;
    setId(next.id ?? id);
    setHidden(h);
    setAct(a);
    setSeed(s);
    setNet(randomMlp(h, a, s * 100 + h));
    setSteps(0);
  };
  const run = (n: number) => {
    setNet(trainMlp(net, train, n));
    setSteps(steps + n);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <Regions s={s} prob={prob} soft />
            {lines &&
              net.w1.map((w, j) => {
                // Правата, по която сумата на скрит неврон j е нула (в координатите на графиката)
                const at = (x: number) => 5 + (-net.b1[j] * 2.5 - w[0] * (x - 5)) / w[1];
                return Math.abs(w[1]) > 1e-6 ? <line key={j} x1={s.sx(-5)} y1={s.sy(at(-5))} x2={s.sx(15)} y2={s.sy(at(15))} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="1.5" strokeDasharray="6 4" clipPath={s.clip} /> : null;
              })}
            <Points s={s} data={train} prob={steps ? prob : undefined} />
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="неврони" value={hidden} onChange={v => restart({ hidden: v })} min={1} max={8} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        {SETS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => restart({ id: d.id })}>
            {d.label}
          </DiagramButton>
        ))}
        <DiagramButton active={act === 'tanh'} onClick={() => restart({ act: 'tanh' })}>
          с tanh
        </DiagramButton>
        <DiagramButton active={act === 'linear'} onClick={() => restart({ act: 'linear' })}>
          без активация
        </DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => run(100)}>100 стъпки</DiagramButton>
        <DiagramButton onClick={() => run(1000)}>1000 стъпки</DiagramButton>
        <DiagramButton onClick={() => restart({ seed: seed + 1 })}>нови случайни тегла</DiagramButton>
        <DiagramButton active={lines} onClick={() => setLines(v => !v)}>
          правите на скритите неврони
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'параметри', value: paramCount(hidden), tone: 'violet' },
            { label: 'стъпки', value: steps },
            { label: 'загуба', value: dec(mlpLoss(net, train)) },
            { label: 'вярно (60 познати)', value: pct(acc), tone: acc > 0.97 ? 'emerald' : 'rose' },
            { label: 'вярно (200 нови)', value: pct(accNew), tone: accNew > 0.95 ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={steps === 0 ? 'gray' : act === 'linear' ? 'amber' : acc > 0.97 ? 'emerald' : 'gray'}>
        {steps === 0
          ? 'Теглата са случайни. Пунктираните прави са „границите“ на отделните скрити неврони. Натисни „1000 стъпки“.'
          : act === 'linear'
            ? 'Без активираща функция границата остава права, колкото и скрити неврони да добавиш – мрежата е равна на един-единствен неврон.'
            : acc > 0.97
              ? 'Скритите неврони са наредили правите си около едната група, а изходният неврон ги е съчетал в една извита граница.'
              : 'Мрежата още греши (точките с черен контур). Обучавай още, добави неврони или опитай с нови случайни тегла.'}
      </Note>
    </div>
  );
}
