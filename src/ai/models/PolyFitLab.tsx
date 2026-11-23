import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { fitPolynomial, makeMeasurements, meanSquaredError, truth } from './evaluation';

const DEGREES = Array.from({ length: 13 }, (_, i) => i);
const XS = Array.from({ length: 201 }, (_, i) => -1 + i / 100);
const dec = (v: number) => (v > 10 ? '> 10' : v.toLocaleString('bg-BG', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

/** Полином с избрана степен през 14 измервания: грешка върху тях и върху 80 нови измервания. */
export default function PolyFitLab() {
  const [degree, setDegree] = useState(1);
  const [showTruth, setShowTruth] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const train = useMemo(() => makeMeasurements(14, 12), []);
  const test = useMemo(() => makeMeasurements(80, 112), []);
  const fits = useMemo(() => DEGREES.map(d => fitPolynomial(train, d)), [train]);
  const errors = useMemo(() => fits.map(f => ({ train: meanSquaredError(train, f), test: meanSquaredError(test, f) })), [fits, train, test]);
  const f = fits[degree];
  const best = errors.reduce((b, e, i) => (e.test < errors[b].test ? i : b), 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[-1, 1]} y={[-1.6, 1.6]} xTicks={[-1, -0.5, 0, 0.5, 1]} yTicks={[-1.5, -1, -0.5, 0, 0.5, 1, 1.5]} xLabel="x" yLabel="y" height={300}>
        {s => (
          <>
            {showTruth && <polyline points={XS.map(x => `${s.sx(x)},${s.sy(truth(x))}`).join(' ')} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" strokeDasharray="6 4" clipPath={s.clip} />}
            {showTest && test.map((p, i) => <circle key={`t${i}`} cx={s.sx(p.x)} cy={s.sy(p.y)} r={2.5} className="fill-gray-500 dark:fill-gray-400" />)}
            <polyline points={XS.map(x => `${s.sx(x)},${s.sy(Math.max(-5, Math.min(5, f(x))))}`).join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" clipPath={s.clip} />
            {train.map((p, i) => (
              <circle key={i} cx={s.sx(p.x)} cy={s.sy(p.y)} r={5.5} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1.2" />
            ))}
          </>
        )}
      </Chart>
      <Chart x={[-0.5, 12.5]} y={[0, 0.5]} xTicks={[0, 2, 4, 6, 8, 10, 12]} yTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} xLabel="степен на полинома" yLabel="средна квадр. грешка" height={210}>
        {s => (
          <>
            <polyline points={errors.map((e, i) => `${s.sx(i)},${s.sy(Math.min(0.9, e.test))}`).join(' ')} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2.5" clipPath={s.clip} />
            <polyline points={errors.map((e, i) => `${s.sx(i)},${s.sy(e.train)}`).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" clipPath={s.clip} />
            <line x1={s.sx(degree)} y1={s.y0} x2={s.sx(degree)} y2={s.y1} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" strokeDasharray="5 4" />
            <text x={s.x0 + 8} y={s.y1 + 16} fontSize="12" className="fill-emerald-700 dark:fill-emerald-400">
              зелено – върху 80 нови измервания
            </text>
            <text x={s.x0 + 8} y={s.y1 + 32} fontSize="12" className="fill-blue-700 dark:fill-blue-300">
              синьо – върху 14-те познати
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="степен" value={degree} onChange={setDegree} min={0} max={12} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={showTest} onClick={() => setShowTest(v => !v)}>
          покажи новите измервания
        </DiagramButton>
        <DiagramButton active={showTruth} onClick={() => setShowTruth(v => !v)}>
          покажи истинската зависимост
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'параметри', value: degree + 1, tone: 'violet' },
            { label: 'грешка върху познатите', value: dec(errors[degree].train), tone: 'blue' },
            { label: 'грешка върху новите', value: dec(errors[degree].test), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={degree === best ? 'emerald' : degree < 3 ? 'amber' : degree > 8 ? 'rose' : 'gray'}>
        {degree === best
          ? 'Тук грешката върху новите измервания е най-малка – моделът е достатъчно гъвкав, но още не гони шума.'
          : degree < 3
            ? 'Недообучаване: кривата е твърде проста и греши много и върху познатите, и върху новите точки.'
            : degree > 8
              ? 'Преобучаване: кривата минава почти точно през познатите точки, но между тях се мята и върху нови измервания греши все повече.'
              : 'Следи двете числа: грешката върху познатите точки само намалява, а тази върху новите – първо намалява, после расте.'}
      </Note>
    </div>
  );
}
