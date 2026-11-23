import { type PointerEvent, useRef, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart, { LineSegment } from './Chart';
import { fitLine, rSquared } from './regression';

/** Часове учене и точки на теста за осем ученици. */
const BASE: [number, number][] = [
  [1, 52],
  [2, 58],
  [3, 61],
  [4, 70],
  [5, 72],
  [6, 80],
  [7, 83],
  [8, 91],
];
const X: [number, number] = [0, 13];
const Y: [number, number] = [0, 100];
const START = { x: 12, y: 20 };

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Една допълнителна точка, която се мести: колко силно променя тя правата и R². */
export default function OutlierLab() {
  const [p, setP] = useState(START);
  const [on, setOn] = useState(true);
  const svg = useRef<SVGSVGElement>(null);

  const place = (e: PointerEvent<SVGSVGElement>) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m || !on) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    // Същите полета като в Chart: ляво 56, дясно 14, горе 12, долу 44, височина 320
    const x = X[0] + ((q.x - 56) / (640 - 56 - 14)) * (X[1] - X[0]);
    const y = Y[0] + ((320 - 44 - q.y) / (320 - 12 - 44)) * (Y[1] - Y[0]);
    setP({ x: Math.min(X[1], Math.max(X[0], Math.round(x * 2) / 2)), y: Math.min(Y[1], Math.max(Y[0], Math.round(y))) });
  };

  const baseLine = fitLine(BASE.map(q => q[0]), BASE.map(q => q[1]));
  const baseR2 = rSquared(baseLine, BASE.map(q => q[0]), BASE.map(q => q[1]));
  const all = on ? [...BASE, [p.x, p.y] as [number, number]] : BASE;
  const xs = all.map(q => q[0]);
  const ys = all.map(q => q[1]);
  const line = fitLine(xs, ys);
  const r2 = rSquared(line, xs, ys);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart
        ref={svg}
        x={X}
        y={Y}
        xTicks={[0, 2, 4, 6, 8, 10, 12]}
        yTicks={[0, 20, 40, 60, 80, 100]}
        xLabel="часове учене"
        yLabel="точки на теста"
        style={{ cursor: on ? 'crosshair' : 'default' }}
        onPointerDown={place}
        onPointerMove={e => {
          if (e.pointerType === 'mouse' && e.buttons === 1) place(e);
        }}
      >
        {s => (
          <>
            <LineSegment s={s} w={baseLine.w} b={baseLine.b} from={X[0]} to={X[1]} className="stroke-gray-400 dark:stroke-gray-500" dashed width={2} />
            <LineSegment s={s} w={line.w} b={line.b} from={X[0]} to={X[1]} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" width={3} />
            {BASE.map(([x, y], i) => (
              <circle key={i} cx={s.sx(x)} cy={s.sy(y)} r={5.5} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1.2" />
            ))}
            {on && <circle cx={s.sx(p.x)} cy={s.sy(p.y)} r={8} className="fill-rose-600 dark:fill-rose-400" stroke="white" strokeWidth="2" />}
          </>
        )}
      </Chart>

      <Buttons>
        <DiagramButton active={on} onClick={() => setOn(v => !v)}>
          деветата точка
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setOn(true);
            setP(START);
          }}
        >
          отначало
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'без нея: w', value: dec(baseLine.w) },
            { label: 'R²', value: dec(baseR2) },
            { label: 'с нея: w', value: dec(line.w), tone: 'violet' },
            { label: 'R²', value: dec(r2), tone: r2 > 0.8 ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        Докосни произволно място, за да преместиш червената точка. Пунктирът е правата само през осемте сини точки. Сравни какво става, когато
        червената е далеч вдясно и когато е над средата на облака.
      </Note>
    </div>
  );
}
