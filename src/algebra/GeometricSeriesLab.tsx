import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const W = 600;
const COLORS = ['fill-sky-500', 'fill-sky-300', 'fill-violet-500', 'fill-violet-300'];

/** Безкрайна намаляваща геометрична прогресия: частичните сборове се приближават до a₁/(1 − q). */
export default function GeometricSeriesLab() {
  const [q, setQ] = useState(0.5);
  const [n, setN] = useState(4);

  const limit = 1 / (1 - q);
  const terms = Array.from({ length: n }, (_, i) => q ** i);
  const Sn = terms.reduce((s, t) => s + t, 0);
  const L = W - 40;
  const px = (v: number) => 20 + (v / limit) * L;

  // При q = 1/2: всеки член запълва половината от останалото място в квадрат
  const square = q === 0.5;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  if (square) {
    let x = 0;
    let y = 0;
    let w = 200;
    let h = 200;
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) {
        rects.push({ x, y, w: w / 2, h });
        x += w / 2;
        w /= 2;
      } else {
        rects.push({ x, y, w, h: h / 2 });
        y += h / 2;
        h /= 2;
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">♾️ Безкраен сбор с краен резултат</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        1 + q + q² + q³ + … При |q| &lt; 1 всеки следващ член е все по-малък и сборът никога не надминава 1/(1 − q).
      </p>

      <svg viewBox={`0 0 ${W} 80`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <rect x={20} y={20} width={L} height={30} rx={4} className="fill-gray-100 dark:fill-gray-700 stroke-gray-400" strokeDasharray="5 4" />
        {terms.map((t, i) => {
          const start = terms.slice(0, i).reduce((s, v) => s + v, 0);
          return <rect key={i} x={px(start)} y={20} width={px(start + t) - px(start)} height={30} className={COLORS[i % 4]} />;
        })}
        <line x1={px(Sn)} x2={px(Sn)} y1={12} y2={58} className="stroke-rose-500" strokeWidth="2.5" />
        <text x={px(Sn)} y={74} fontSize="13" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400" fontWeight="700">
          S{n <= 9 ? '₁₂₃₄₅₆₇₈₉'[n - 1] : n} = {num(Sn, 4)}
        </text>
        <text x={W - 20} y={12} fontSize="12" textAnchor="end" fill="currentColor" opacity="0.7">
          граница {num(limit, 3)}
        </text>
      </svg>

      {square && (
        <svg viewBox="-2 -2 204 204" className="w-40 h-40 mx-auto block mt-2">
          <rect x={0} y={0} width={200} height={200} className="fill-gray-100 dark:fill-gray-700 stroke-gray-500" strokeWidth="2" />
          {rects.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} className={`${COLORS[i % 4]} stroke-white dark:stroke-gray-800`} strokeWidth="1.5" />
          ))}
        </svg>
      )}

      <Sliders>
        <Slider label="q" value={q} onChange={setQ} min={0.1} max={0.9} step={0.05} tone="blue" />
        <Slider label="n" value={n} onChange={setN} min={1} max={20} step={1} tone="gray" />
      </Sliders>

      <Formula>
        S{n} = (1 − q^{n})/(1 − q) = {num(Sn, 4)} &nbsp; → &nbsp; S = 1/(1 − q) = {num(limit, 4)}
      </Formula>
      <Note tone={limit - Sn < 0.01 ? 'emerald' : 'gray'}>
        Остава до границата: {num(limit - Sn, 4)} = q^{n}/(1 − q){square ? '. Квадратът има лице 2 и всеки член запълва половината от още празното място.' : ''}
      </Note>
    </div>
  );
}
