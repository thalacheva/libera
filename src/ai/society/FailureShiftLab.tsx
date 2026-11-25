import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { bestThreshold, groupThresholds, testSet, thresholdAccuracy, trainingSet } from './failureData';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const dec = (v: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: 2 });

/** Кого няма в обучаващите данни: един праг, нагласен върху извадка с малко хора от група Б, и точността му за всяка група. */
export default function FailureShiftLab() {
  const [share, setShare] = useState(5);
  const [offset, setOffset] = useState(1.5);
  const [byGroup, setByGroup] = useState(false);

  const train = useMemo(() => trainingSet(share / 100, offset), [share, offset]);
  const tests = useMemo(() => [testSet(0, offset), testSet(1, offset)], [offset]);
  const one = bestThreshold(train);
  const t = byGroup ? groupThresholds(train) : [one, one];
  const trainAcc = byGroup ? train.filter(r => r.x > t[r.group] === r.sick).length / train.length : thresholdAccuracy(train, one);
  const acc = [thresholdAccuracy(tests[0], t[0]), thresholdAccuracy(tests[1], t[1])];
  const nB = train.filter(r => r.group === 1).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[2, 10]} y={[0, 2]} xTicks={[2, 3, 4, 5, 6, 7, 8, 9, 10]} yTicks={[]} xLabel="показание на уреда" yLabel="" height={260}>
        {s => (
          <>
            <line x1={s.x0} y1={s.sy(1)} x2={s.x1} y2={s.sy(1)} className="stroke-gray-400" strokeWidth="1" />
            {[0, 1].map(g => (
              <g key={g}>
                <rect x={s.sx(t[g])} y={s.sy(2 - g)} width={Math.max(0, s.x1 - s.sx(t[g]))} height={s.sy(1 - g) - s.sy(2 - g)} className="fill-amber-300/25" clipPath={s.clip} />
                {tests[g].map((r, i) => {
                  const wrong = r.x > t[g] !== r.sick;
                  return <circle key={i} cx={s.sx(r.x)} cy={s.sy(1 - g + 0.1 + 0.62 * (((i * 37) % 29) / 29))} r={3} className={r.sick ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'} stroke={wrong ? 'black' : 'white'} strokeWidth={wrong ? 1.5 : 0.5} clipPath={s.clip} />;
                })}
                <line x1={s.sx(t[g])} y1={s.sy(1 - g)} x2={s.sx(t[g])} y2={s.sy(2 - g)} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
                <text x={s.x0 + 6} y={s.sy(2 - g) + 16} fontSize="12" className="fill-gray-800 dark:fill-gray-100">
                  {g === 0 ? 'група А' : 'група Б'}: 400 нови души, познати {pct(acc[g])}
                </text>
              </g>
            ))}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="Б, %" value={share} onChange={setShare} min={0} max={50} step={5} tone="violet" />
        <Slider label="разлика" value={offset} onChange={setOffset} min={0} max={2} step={0.5} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={!byGroup} onClick={() => setByGroup(false)}>
          един праг за всички
        </DiagramButton>
        <DiagramButton active={byGroup} onClick={() => setByGroup(true)}>
          моделът знае групата
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'обучаващи', value: `${200 - nB} от А + ${nB} от Б` },
            { label: 'праг', value: byGroup ? `А: ${dec(t[0])} · Б: ${dec(t[1])}` : dec(one), tone: 'violet' },
            { label: 'точност върху обучаващите', value: pct(trainAcc) },
            { label: 'нови от А', value: pct(acc[0]), tone: 'blue' },
            { label: 'нови от Б', value: pct(acc[1]), tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={acc[0] - acc[1] > 0.1 ? 'rose' : 'emerald'}>
        {acc[0] - acc[1] > 0.1
          ? `Общата точност изглежда добра, но за група Б моделът греши${acc[1] < 0.7 ? ' много по-често – целият му опит е от група А' : ' по-често'}.`
          : 'Двете групи получават близка точност.'}
      </Note>
      <Note tone="gray">
        Червените точки са болни, сините – здрави; над прага (жълтата зона) моделът казва „болен“. Черният контур е грешка. „Б, %“ е делът
        на група Б в 200-те обучаващи измервания, а „разлика“ – с колко уредът показва повече при хората от група Б.
      </Note>
    </div>
  );
}
