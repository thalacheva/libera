import { type PointerEvent, useRef, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart, { LineSegment } from '../models/Chart';
import { DATA, loss, minimum } from './landscape';
import Relief from './Relief';

const W: [number, number] = [0, 22];
const B: [number, number] = [0, 80];
const BEST = minimum();
const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Всяка точка от цветното поле е една права; цветът показва колко греши тя. */
export default function LandscapeLab() {
  const [p, setP] = useState({ w: 4, b: 60 });
  const svg = useRef<SVGSVGElement>(null);

  const place = (e: PointerEvent<SVGSVGElement>) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    // Полетата на Chart: ляво 56, дясно 14, горе 12, долу 44; височина 300
    const w = W[0] + ((q.x - 56) / (640 - 56 - 14)) * (W[1] - W[0]);
    const b = B[0] + ((300 - 44 - q.y) / (300 - 12 - 44)) * (B[1] - B[0]);
    setP({ w: Math.min(W[1], Math.max(W[0], Math.round(w * 10) / 10)), b: Math.min(B[1], Math.max(B[0], Math.round(b))) });
  };

  const value = loss(p);
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart
        ref={svg}
        x={W}
        y={B}
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={[0, 20, 40, 60, 80]}
        xLabel="тегло w"
        yLabel="отместване b"
        height={300}
        style={{ cursor: 'crosshair' }}
        onPointerDown={place}
        onPointerMove={e => {
          if (e.pointerType === 'mouse' && e.buttons === 1) place(e);
        }}
      >
        {s => (
          <>
            <Relief s={s} w={W} b={B} data={DATA} lo={16} hi={6000} />
            <circle cx={s.sx(BEST.w)} cy={s.sy(BEST.b)} r={5} fill="white" stroke="black" strokeWidth="1.5" />
            <circle cx={s.sx(p.w)} cy={s.sy(p.b)} r={8} className="fill-fuchsia-500" stroke="white" strokeWidth="2.5" />
          </>
        )}
      </Chart>
      <Chart x={[1, 6]} y={[20, 120]} xTicks={[1, 2, 3, 4, 5, 6]} yTicks={[20, 40, 60, 80, 100, 120]} xLabel="продължителност на изригването, min" yLabel="чакане, min" height={230}>
        {s => (
          <>
            <LineSegment s={s} w={p.w} b={p.b} from={1} to={6} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" width={3} />
            {DATA.map(([x, y], i) => (
              <circle key={i} cx={s.sx(x)} cy={s.sy(y)} r={4.5} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1" />
            ))}
          </>
        )}
      </Chart>
      <Buttons>
        <DiagramButton onClick={() => setP({ w: Math.round(BEST.w * 10) / 10, b: Math.round(BEST.b) })}>иди в най-ниската точка</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'w', value: dec(p.w), tone: 'violet' },
            { label: 'b', value: dec(p.b, 0), tone: 'violet' },
            { label: 'загуба', value: dec(value), tone: 'amber' },
            { label: 'най-малката възможна', value: dec(loss(BEST)), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="gray">
        Докосни цветното поле: тъмносиньото е ниска загуба, жълтото – висока. Бялата точка е дъното. Долу е правата, която отговаря на
        избраните w и b.
      </Note>
    </div>
  );
}
