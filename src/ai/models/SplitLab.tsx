import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { AXIS, makeData } from './classify';
import { Points } from './Regions';
import { bestSplit, type Feature, split } from './trees';

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Един въпрос „признакът ≤ t?“: колко чисти са двете групи и каква е печалбата на информация. */
export default function SplitLab() {
  const [feature, setFeature] = useState<Feature>('y');
  const [t, setT] = useState(3);
  const data = useMemo(() => makeData('groups', 60, 21), []);
  const best = useMemo(() => bestSplit(data)!, [data]);

  const r = split(data, feature, t);
  const count = (list: typeof data) => `${list.filter(p => p.c).length} червени, ${list.filter(p => !p.c).length} сини`;
  const name = feature === 'x' ? 'x₁' : 'x₂';
  const isBest = feature === best.feature && Math.abs(r.gain - best.gain) < 0.005;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            {feature === 'x' ? (
              <>
                <rect x={s.x0} y={s.y1} width={s.sx(t) - s.x0} height={s.y0 - s.y1} className="fill-amber-300/25" />
                <line x1={s.sx(t)} y1={s.y0} x2={s.sx(t)} y2={s.y1} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
              </>
            ) : (
              <>
                <rect x={s.x0} y={s.sy(t)} width={s.x1 - s.x0} height={s.y0 - s.sy(t)} className="fill-amber-300/25" />
                <line x1={s.x0} y1={s.sy(t)} x2={s.x1} y2={s.sy(t)} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
              </>
            )}
            <Points s={s} data={data} />
          </>
        )}
      </Chart>
      <Buttons>
        <DiagramButton active={feature === 'x'} onClick={() => setFeature('x')}>
          питай за x₁
        </DiagramButton>
        <DiagramButton active={feature === 'y'} onClick={() => setFeature('y')}>
          питай за x₂
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setFeature(best.feature);
            setT(Math.round(best.t * 10) / 10);
          }}
        >
          най-добрият въпрос
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="праг t" value={t} onChange={setT} min={0.5} max={9.5} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `„да“ (${name} ≤ ${dec(t, 1)})`, value: `${count(r.left)}`, tone: 'amber' },
            { label: '„не“', value: `${count(r.right)}` },
            { label: 'ентропия преди', value: dec(r.before) },
            { label: 'след въпроса', value: dec(r.after), tone: 'violet' },
            { label: 'печалба', value: dec(r.gain), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={isBest ? 'emerald' : 'gray'}>
        {isBest
          ? 'По-добър единичен въпрос за тези точки няма: двете групи са почти чисти.'
          : 'Жълтата област е отговорът „да“. Търси въпроса, след който във всяка от двете групи преобладава един цвят – тогава печалбата е най-голяма.'}
      </Note>
    </div>
  );
}
