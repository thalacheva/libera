import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';

type Shape = { id: string; label: string; f: (w: number) => number; d: (w: number) => number; y: [number, number]; yTicks: number[] };

const SHAPES: Shape[] = [
  { id: 'bowl', label: 'една яма', f: w => (w - 1) ** 2 + 1, d: w => 2 * (w - 1), y: [0, 28], yTicks: [0, 7, 14, 21, 28] },
  { id: 'two', label: 'две ями', f: w => 0.05 * w ** 4 - 0.5 * w ** 2 + 0.3 * w + 2, d: w => 0.2 * w ** 3 - w + 0.3, y: [-0.5, 7], yTicks: [0, 2, 4, 6] },
];
const XS = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
const dec = (v: number, d = 2) => (Math.abs(v) > 9999 ? '—' : v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−'));

/** Градиентно спускане с един параметър: всяка стъпка е w ← w − η·L′(w). */
export default function Descent1DLab() {
  const [shapeId, setShapeId] = useState('bowl');
  const [start, setStart] = useState(-3.5);
  const [rate, setRate] = useState(0.1);
  const [path, setPath] = useState<number[]>([-3.5]);
  const shape = SHAPES.find(s => s.id === shapeId)!;
  const w = path[path.length - 1];
  const slope = shape.d(w);
  const lost = Math.abs(w) > 50;

  const reset = (id = shapeId, s = start) => {
    setShapeId(id);
    setStart(s);
    setPath([s]);
  };
  const step = (n: number) =>
    setPath(p => {
      const out = [...p];
      for (let i = 0; i < n; i++) {
        const last = out[out.length - 1];
        if (Math.abs(last) > 50) break;
        out.push(last - rate * shape.d(last));
      }
      return out;
    });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[-4, 4]} y={shape.y} xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={shape.yTicks} xLabel="параметър w" yLabel="загуба L(w)" height={300}>
        {s => (
          <>
            <polyline points={XS.map(x => `${s.sx(x)},${s.sy(shape.f(x))}`).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" clipPath={s.clip} />
            {/* Допирателната в текущата точка – наклонът ѝ е производната */}
            {!lost && <line x1={s.sx(w - 0.9)} y1={s.sy(shape.f(w) - 0.9 * slope)} x2={s.sx(w + 0.9)} y2={s.sy(shape.f(w) + 0.9 * slope)} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" clipPath={s.clip} />}
            <polyline points={path.filter(v => Math.abs(v) <= 4.5).map(v => `${s.sx(v)},${s.sy(shape.f(v))}`).join(' ')} fill="none" className="stroke-fuchsia-500" strokeWidth="1.2" strokeDasharray="4 3" clipPath={s.clip} />
            {path.map((v, i) => (Math.abs(v) <= 4 ? <circle key={i} cx={s.sx(v)} cy={s.sy(shape.f(v))} r={i === path.length - 1 ? 7 : 3.5} className={i === path.length - 1 ? 'fill-fuchsia-600 dark:fill-fuchsia-400' : 'fill-fuchsia-300 dark:fill-fuchsia-700'} stroke="white" strokeWidth={i === path.length - 1 ? 2 : 0.8} clipPath={s.clip} /> : null))}
          </>
        )}
      </Chart>
      <Buttons>
        {SHAPES.map(sh => (
          <DiagramButton key={sh.id} active={sh.id === shapeId} onClick={() => reset(sh.id)}>
            {sh.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="начало" value={start} onChange={v => reset(shapeId, v)} min={-3.9} max={3.9} step={0.1} tone="violet" />
        <Slider label="η" value={rate} onChange={setRate} min={0.02} max={1.1} step={0.02} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => step(1)}>една стъпка</DiagramButton>
        <DiagramButton onClick={() => step(10)}>10 стъпки</DiagramButton>
        <DiagramButton onClick={() => reset()}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: path.length - 1 },
            { label: 'w', value: dec(w), tone: 'violet' },
            { label: 'загуба', value: lost ? '—' : dec(shape.f(w)), tone: 'blue' },
            { label: 'наклон L′(w)', value: lost ? '—' : dec(slope), tone: 'amber' },
            { label: 'следваща стъпка', value: lost ? '—' : dec(-rate * slope), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={lost ? 'rose' : Math.abs(slope) < 0.01 ? 'emerald' : 'gray'}>
        {lost
          ? 'Точката излетя от графиката: стъпките са толкова големи, че всяка я хвърля по-далеч от предишната. Намали η.'
          : Math.abs(slope) < 0.01
            ? 'Наклонът е почти нула – стъпките спряха. Това е дъно. Дали е най-дълбокото?'
            : 'Оранжевата отсечка е допирателната. Ако се изкачва надясно (наклонът е положителен), стъпката е наляво – и обратно.'}
      </Note>
    </div>
  );
}
