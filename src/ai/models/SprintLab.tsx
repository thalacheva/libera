import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart, { LineSegment } from './Chart';
import { fitLine, predict, SPRINT } from './regression';

const LAST = SPRINT[SPRINT.length - 1];
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Права през олимпийските времена на 100 m – и какво „предсказва“ тя, ако я продължим твърде далеч. */
export default function SprintLab() {
  const [year, setYear] = useState(2024);
  const [early, setEarly] = useState(false);

  // Данните, по които чертаем правата: всички или само до 1968 г.
  const used = early ? SPRINT.filter(p => p[0] <= 1968) : SPRINT;
  const line = fitLine(used.map(p => p[0]), used.map(p => p[1]));
  const value = predict(line, year);
  const xMax = Math.max(2040, year + 16);
  const step = xMax > 2500 ? 200 : xMax > 2200 ? 100 : xMax > 2080 ? 40 : 20;
  const xTicks: number[] = [];
  for (let v = 1900; v <= xMax; v += step) xTicks.push(v);
  const yMin = Math.min(9, Math.floor(value));
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / 2) * 2; v <= 12; v += yMin < 6 ? 2 : 1) yTicks.push(v);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[1890, xMax]} y={[yMin - 0.3, 12.3]} xTicks={xTicks} yTicks={yTicks} xLabel="година" yLabel="време на победителя, s">
        {s => (
          <>
            {yMin < 0.5 && <line x1={s.x0} y1={s.sy(0)} x2={s.x1} y2={s.sy(0)} className="stroke-rose-500" strokeWidth="1.5" />}
            <LineSegment s={s} w={line.w} b={line.b} from={1890} to={xMax} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" />
            {SPRINT.map(([x, y]) => (
              <circle
                key={x}
                cx={s.sx(x)}
                cy={s.sy(y)}
                r={xMax > 2300 ? 2.5 : 4.5}
                className={early && x > 1968 ? 'fill-gray-400 dark:fill-gray-500' : 'fill-blue-600 dark:fill-blue-400'}
                stroke="white"
                strokeWidth={xMax > 2300 ? 0.5 : 1}
              />
            ))}
            <circle cx={s.sx(year)} cy={s.sy(value)} r={7} className="fill-amber-500" stroke="white" strokeWidth="2" clipPath={s.clip} />
          </>
        )}
      </Chart>

      <Sliders>
        <Slider label="година" value={year} onChange={setYear} min={1972} max={2900} step={4} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={!early} onClick={() => setEarly(false)}>
          права по всички данни
        </DiagramButton>
        <DiagramButton active={early} onClick={() => setEarly(true)}>
          права само по данните до 1968 г.
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'наклон', value: `${dec(line.w * 100)} s на век`, tone: 'violet' },
            { label: `предсказание за ${year} г.`, value: `${dec(value)} s`, tone: value <= 0 ? 'rose' : 'amber' },
            ...(early ? [{ label: 'истинското време през 2024 г.', value: `${dec(LAST[1])} s`, tone: 'blue' as const }] : []),
          ]}
        />
      </div>
      <Note tone={value <= 0 ? 'rose' : year > 2024 ? 'amber' : 'gray'}>
        {value <= 0
          ? 'Правата „предсказва“ спринтьор, който финишира, преди да е стартирал. Формулата не знае, че времето не може да е отрицателно.'
          : year > 2024
            ? 'Това е екстраполация: за тези години няма нито една точка. Правата продължава, но нищо не гарантира, че светът я следва.'
            : early
              ? 'Сивите точки не участват в чертането на правата. Сравни предсказанието ѝ за 2024 г. с истинското време.'
              : 'Синята точка за всяка олимпиада е времето на шампиона. Премести плъзгача напред във времето.'}
      </Note>
    </div>
  );
}
