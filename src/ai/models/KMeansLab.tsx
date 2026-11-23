import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { AXIS } from './classify';
import { assign, type CloudId, CLOUDS, GROUP_FILL, initialCenters, kMeans, makeCloud, moveCenters, type P2, scatter } from './clusters';

const GROUP_STROKE = ['stroke-blue-600 dark:stroke-blue-400', 'stroke-rose-600 dark:stroke-rose-400', 'stroke-emerald-600 dark:stroke-emerald-400', 'stroke-amber-500', 'stroke-violet-600 dark:stroke-violet-400', 'stroke-cyan-600 dark:stroke-cyan-400'];

type State = { centers: P2[]; labels: number[] | null; steps: number; done: boolean };

/** k-средни стъпка по стъпка: разпредели точките, премести центровете – и пак. */
export default function KMeansLab() {
  const [id, setId] = useState<CloudId>('four');
  const [k, setK] = useState(4);
  const [seed, setSeed] = useState(8);
  const points = useMemo(() => makeCloud(id, 90, 4), [id]);
  const fresh = (cloud: P2[], count: number, s: number): State => ({ centers: initialCenters(cloud, count, s), labels: null, steps: 0, done: false });
  const [state, setState] = useState<State>(() => fresh(points, 4, 8));

  const restart = (nextId: CloudId = id, nextK = k, nextSeed = seed) => {
    setId(nextId);
    setK(nextK);
    setSeed(nextSeed);
    setState(fresh(makeCloud(nextId, 90, 4), nextK, nextSeed));
  };

  /** Една половин стъпка: ако точките са разпределени – местим центровете, иначе разпределяме. */
  const step = () =>
    setState(s => {
      if (s.done) return s;
      if (s.labels && s.steps % 2 === 1) {
        const centers = moveCenters(points, s.labels, s.centers);
        const labels = assign(points, centers);
        const same = labels.every((v, i) => v === s.labels![i]);
        return { centers, labels: s.labels, steps: s.steps + 1, done: same };
      }
      return { ...s, labels: assign(points, s.centers), steps: s.steps + 1 };
    });

  const finish = () => {
    const r = kMeans(points, state.centers);
    setState({ centers: r.centers, labels: r.labels, steps: state.steps + 1, done: true });
  };

  const total = state.labels ? scatter(points, state.labels, state.centers) : null;
  const next = state.done ? null : state.labels && state.steps % 2 === 1 ? 'премести центровете' : 'разпредели точките';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            {state.labels && points.map((p, i) => <line key={`l${i}`} x1={s.sx(p.x)} y1={s.sy(p.y)} x2={s.sx(state.centers[state.labels![i]].x)} y2={s.sy(state.centers[state.labels![i]].y)} className={GROUP_STROKE[state.labels![i]]} strokeWidth="0.7" opacity="0.5" />)}
            {points.map((p, i) => (
              <circle key={i} cx={s.sx(p.x)} cy={s.sy(p.y)} r={4.5} className={state.labels ? GROUP_FILL[state.labels[i]] : 'fill-gray-500 dark:fill-gray-400'} stroke="white" strokeWidth="1" />
            ))}
            {state.centers.map((c, i) => (
              <g key={`c${i}`} transform={`translate(${s.sx(c.x)} ${s.sy(c.y)}) rotate(45)`}>
                <rect x={-8} y={-8} width={16} height={16} className={GROUP_FILL[i]} stroke="black" strokeWidth="2" />
              </g>
            ))}
          </>
        )}
      </Chart>
      <Buttons>
        {CLOUDS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => restart(d.id)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {[2, 3, 4, 5, 6].map(v => (
          <DiagramButton key={v} active={v === k} onClick={() => restart(id, v)}>
            k = {v}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={step}>{next ?? 'готово'}</DiagramButton>
        <DiagramButton onClick={finish}>докрай</DiagramButton>
        <DiagramButton onClick={() => restart(id, k, seed + 1)}>нов случаен старт</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'половин стъпки', value: state.steps },
            { label: 'сбор от квадратите на разстоянията', value: total === null ? '–' : Math.round(total), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={state.done ? 'emerald' : 'gray'}>
        {state.done
          ? 'Центровете спряха да се местят – алгоритъмът приключи. Опитай „нов случаен старт“: винаги ли стига до същите групи?'
          : 'Ромбовете са центровете на групите; в началото са k случайно избрани точки. Натискай бутона и гледай как сборът намалява на всяка стъпка.'}
      </Note>
    </div>
  );
}
