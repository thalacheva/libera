import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart, { LineSegment } from './Chart';
import { fitLine, mse } from './regression';

/** Примерни измервания на гейзер: колко минути е траяло изригването и колко минути след това е дошло следващото. */
const DATA: [number, number][] = [
  [1.7, 55],
  [4.0, 78],
  [4.1, 72],
  [2.3, 58],
  [3.9, 83],
  [3.2, 69],
  [2.0, 52],
  [4.7, 78],
  [4.9, 78],
  [1.7, 50],
  [4.0, 79],
  [5.0, 89],
  [1.6, 51],
  [5.3, 95],
  [3.7, 70],
  [1.7, 50],
];
const XS = DATA.map(p => p[0]);
const YS = DATA.map(p => p[1]);
const BEST = fitLine(XS, YS);
const BEST_MSE = mse(BEST, XS, YS);

const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Нагласи правата на ръка и виж квадратите на грешките; после я сравни с най-добрата възможна. */
export default function FitLineLab() {
  const [w, setW] = useState(4);
  const [b, setB] = useState(60);
  const [squares, setSquares] = useState(true);

  const error = mse({ w, b }, XS, YS);
  const isBest = Math.abs(w - BEST.w) < 0.06 && Math.abs(b - BEST.b) < 0.6;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[1, 6]} y={[40, 100]} xTicks={[1, 2, 3, 4, 5, 6]} yTicks={[40, 50, 60, 70, 80, 90, 100]} xLabel="продължителност на изригването, min" yLabel="чакане до следващото, min">
        {s => {
          // Един пиксел по вертикала в единици на y – страната на квадрата е |грешката|
          const side = (e: number) => Math.abs(s.sy(0) - s.sy(e));
          return (
            <>
              {squares &&
                DATA.map(([x, y], i) => {
                  const e = y - (w * x + b);
                  const d = side(e);
                  return <rect key={i} x={s.sx(x)} y={e > 0 ? s.sy(y) : s.sy(y) - d} width={d} height={d} className="fill-amber-400/25 stroke-amber-500" strokeWidth="1" clipPath={s.clip} />;
                })}
              {DATA.map(([x, y], i) => (
                <line key={i} x1={s.sx(x)} y1={s.sy(y)} x2={s.sx(x)} y2={s.sy(w * x + b)} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.5" clipPath={s.clip} />
              ))}
              <LineSegment s={s} w={w} b={b} from={1} to={6} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" width={3} />
              {DATA.map(([x, y], i) => (
                <circle key={i} cx={s.sx(x)} cy={s.sy(y)} r={5.5} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1.2" />
              ))}
            </>
          );
        }}
      </Chart>

      <Sliders>
        <Slider label="w" value={w} onChange={setW} min={0} max={20} step={0.1} tone="violet" />
        <Slider label="b" value={b} onChange={setB} min={0} max={90} step={0.5} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton
          onClick={() => {
            setW(Math.round(BEST.w * 10) / 10);
            setB(Math.round(BEST.b * 2) / 2);
          }}
        >
          покажи най-добрата права
        </DiagramButton>
        <DiagramButton active={squares} onClick={() => setSquares(v => !v)}>
          квадратите на грешките
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'правата', value: `ŷ = ${dec(w)}·x + ${dec(b)}`, tone: 'violet' },
            { label: 'твоята грешка (MSE)', value: dec(error), tone: 'amber' },
            { label: 'най-малката възможна', value: dec(BEST_MSE), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={isBest ? 'emerald' : 'gray'}>
        {isBest
          ? 'Това е правата на най-малките квадрати: общата площ на жълтите квадрати не може да стане по-малка.'
          : 'Жълтите отсечки са грешките за всяка точка, а квадратите – техните квадрати. Средната им площ е грешката на правата. Направи я възможно най-малка.'}
      </Note>
    </div>
  );
}
