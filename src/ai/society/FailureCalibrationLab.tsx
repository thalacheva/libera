import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { bins, calibrationError, makeForecasts, meanConfidence, shareCorrect } from './failureData';

const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** 200 отговора с обявена увереност: диаграма на надеждността и очаквана грешка на калибриране при различна самоувереност. */
export default function FailureCalibrationLab() {
  const [k, setK] = useState(2);
  const items = useMemo(() => makeForecasts(200, 7), []);
  const bs = bins(items, k);
  const ece = calibrationError(bs);
  const conf = meanConfidence(items, k);
  const acc = shareCorrect(items);
  const gap = conf - acc;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart
        x={[0.5, 1]}
        y={[0.4, 1]}
        xTicks={[0.5, 0.6, 0.7, 0.8, 0.9, 1]}
        yTicks={[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
        xLabel="увереност, която моделът обявява"
        yLabel="дял верни отговори"
        tick={v => `${Math.round(v * 100)}%`}
        height={330}
      >
        {s => (
          <>
            {bs.map(b =>
              b.n === 0 ? null : (
                <g key={b.from}>
                  <rect x={s.sx(b.from) + 2} y={s.sy(b.accuracy)} width={s.sx(b.to) - s.sx(b.from) - 4} height={Math.max(0, s.y0 - s.sy(b.accuracy))} className="fill-fuchsia-400/45 dark:fill-fuchsia-500/35" clipPath={s.clip} />
                  <line x1={s.sx(b.confidence)} y1={s.sy(b.confidence)} x2={s.sx(b.confidence)} y2={s.sy(b.accuracy)} className={b.confidence > b.accuracy ? 'stroke-rose-600 dark:stroke-rose-400' : 'stroke-blue-600 dark:stroke-blue-400'} strokeWidth="3" clipPath={s.clip} />
                  <circle cx={s.sx(b.confidence)} cy={s.sy(b.accuracy)} r={5} className="fill-fuchsia-700 dark:fill-fuchsia-300" stroke="white" strokeWidth="1" />
                  <text x={(s.sx(b.from) + s.sx(b.to)) / 2} y={s.y0 - 8} fontSize="12" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
                    {b.n} отг.
                  </text>
                </g>
              ),
            )}
            <line x1={s.sx(0.5)} y1={s.sy(0.5)} x2={s.sx(1)} y2={s.sy(1)} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={s.sx(0.56)} y={s.sy(0.6) - 8} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
              честна увереност
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="k" value={k} onChange={setK} min={0.4} max={3} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'верни', value: pct(acc) },
            { label: 'средна увереност', value: pct(conf), tone: 'violet' },
            { label: 'грешка на калибриране', value: pct(ece), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={Math.abs(gap) < 0.02 ? 'emerald' : gap > 0 ? 'rose' : 'blue'}>
        {Math.abs(gap) < 0.02
          ? 'Увереността отговаря на делата: точките лежат почти върху пунктира.'
          : gap > 0
            ? 'Моделът е самоуверен: обявява повече, отколкото познава – точките са под пунктира.'
            : 'Моделът е прекалено скромен: познава повече, отколкото обявява – точките са над пунктира.'}
      </Note>
      <Note tone="gray">
        Плъзгачът k е „самоувереността“: отговорите и броят на верните не се променят, променя се само колко сигурен се обявява моделът.
        Всеки стълб е кош от отговори с близка увереност; точката показва средната увереност в коша и дела на верните в него.
      </Note>
    </div>
  );
}
