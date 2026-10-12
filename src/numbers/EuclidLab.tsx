import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, ZoomingSvg } from '~/geometry/diagram';

// Всяка стъпка на алгоритъма е с различен цвят – в чертежа (fill) и в списъка (bg)
const COLORS = [
  { fill: 'fill-sky-200 dark:fill-sky-800', bg: 'bg-sky-200 dark:bg-sky-800' },
  { fill: 'fill-amber-200 dark:fill-amber-800', bg: 'bg-amber-200 dark:bg-amber-800' },
  { fill: 'fill-rose-200 dark:fill-rose-800', bg: 'bg-rose-200 dark:bg-rose-800' },
  { fill: 'fill-violet-200 dark:fill-violet-800', bg: 'bg-violet-200 dark:bg-violet-800' },
  { fill: 'fill-emerald-200 dark:fill-emerald-800', bg: 'bg-emerald-200 dark:bg-emerald-800' },
  { fill: 'fill-orange-200 dark:fill-orange-800', bg: 'bg-orange-200 dark:bg-orange-800' },
];

type Square = { x: number; y: number; side: number; step: number };

/** Режем правоъгълника a × b на най-големите възможни квадрати – това е алгоритъмът на Евклид. */
function tile(a: number, b: number) {
  const squares: Square[] = [];
  const steps: { big: number; small: number; q: number; r: number }[] = [];
  let [x, y, w, h] = [0, 0, a, b];
  while (w > 0 && h > 0) {
    const step = steps.length;
    if (w >= h) {
      const q = Math.floor(w / h);
      for (let i = 0; i < q; i++) squares.push({ x: x + i * h, y, side: h, step });
      steps.push({ big: w, small: h, q, r: w - q * h });
      x += q * h;
      w -= q * h;
    } else {
      const q = Math.floor(h / w);
      for (let i = 0; i < q; i++) squares.push({ x, y: y + i * w, side: w, step });
      steps.push({ big: h, small: w, q, r: h - q * w });
      y += q * w;
      h -= q * w;
    }
  }
  return { squares, steps };
}

export default function EuclidLab() {
  const [a, setA] = useState(21);
  const [b, setB] = useState(15);
  const { squares, steps } = tile(a, b);
  const g = steps[steps.length - 1].small;
  const s = Math.min(440 / a, 260 / b);
  const [ox, oy] = [(480 - a * s) / 2, (290 - b * s) / 2];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 290">
        {squares.map((q, i) => (
          <g key={i}>
            <rect
              x={ox + q.x * s}
              y={oy + q.y * s}
              width={q.side * s}
              height={q.side * s}
              className={`${COLORS[q.step % COLORS.length].fill} stroke-gray-500 dark:stroke-gray-400`}
              strokeWidth="1.2"
            />
            {q.side * s >= 22 && (
              <Label p={{ x: ox + (q.x + q.side / 2) * s, y: oy + (q.y + q.side / 2) * s }} size={Math.min(14, q.side * s * 0.4)} weight={600}>
                {String(q.side)}
              </Label>
            )}
          </g>
        ))}
        <rect x={ox} y={oy} width={a * s} height={b * s} fill="none" className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="2" />
      </ZoomingSvg>

      <Sliders>
        <Slider label="a" value={a} onChange={setA} min={1} max={40} step={1} tone="blue" />
        <Slider label="b" value={b} onChange={setB} min={1} max={30} step={1} tone="rose" />
      </Sliders>
      <ol className="mt-3 mx-auto max-w-xs font-mono text-sm space-y-0.5 text-gray-800 dark:text-gray-100">
        {steps.map((st, i) => (
          <li key={i} className="flex gap-2">
            <span className={`inline-block w-3 h-3 mt-1 rounded-sm ${COLORS[i % COLORS.length].bg}`} />
            {st.big} = {st.q} · {st.small} + {st.r}
          </li>
        ))}
      </ol>
      <Note tone="emerald">
        НОД({a}, {b}) = {g} – страната на последния, най-малък квадрат{g === 1 ? '; числата са взаимно прости' : ''}.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 От правоъгълника a × b отрязваме възможно най-големите квадрати. Остава по-малък правоъгълник – и повтаряме. Квадратът, с който свършваме, има страна НОД(a, b): той пасва точно във всички предишни. Всеки ред отдолу е едно деление с остатък.
      </p>
    </div>
  );
}
