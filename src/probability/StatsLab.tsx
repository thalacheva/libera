import { Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Data = { name: string; unit: string; min: number; max: number; values: number[] };

const DATA: Data[] = [
  { name: '📚 оценки', unit: '', min: 2, max: 6, values: [3, 4, 4, 5, 5, 5, 6, 6] },
  { name: '💶 заплати, стотици €', unit: '', min: 0, max: 50, values: [9, 10, 11, 12, 12, 13, 40] },
  { name: '🌡️ температури, °C', unit: '°', min: -10, max: 15, values: [-3, 0, 2, 2, 5, 7, 8] },
];

const W = 600;
const H = 215;
const PAD = 30;
const AXIS = 150;

function stats(v: number[]) {
  const s = [...v].sort((a, b) => a - b);
  const n = s.length;
  const mean = s.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const freq = new Map<number, number>();
  s.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1));
  const top = Math.max(...freq.values());
  const modes = top > 1 ? [...freq].filter(([, c]) => c === top).map(([x]) => x) : [];
  const sd = Math.sqrt(s.reduce((a, x) => a + (x - mean) ** 2, 0) / n);
  return { mean, median, modes, range: s[n - 1] - s[0], sd };
}

/** Средно, медиана, мода и разсейване – с точки, които се влачат. */
export default function StatsLab() {
  const [di, setDi] = useState(1);
  const [values, setValues] = useState(DATA[1].values);
  const [drag, setDrag] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const data = DATA[di];
  const st = stats(values);

  const X = (v: number) => PAD + ((v - data.min) / (data.max - data.min)) * (W - 2 * PAD);
  const toValue = (clientX: number) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = 0;
    const x = pt.matrixTransform(m.inverse()).x;
    const v = Math.round(data.min + ((x - PAD) / (W - 2 * PAD)) * (data.max - data.min));
    return Math.min(data.max, Math.max(data.min, v));
  };

  // Еднаквите стойности се нареждат една над друга
  const unit = (W - 2 * PAD) / (data.max - data.min);
  const r = Math.max(5, Math.min(9, unit / 2 - 0.5));
  const seen = new Map<number, number>();
  const dots = values.map((v, i) => {
    const k = seen.get(v) ?? 0;
    seen.set(v, k + 1);
    return { v, i, y: AXIS - r - 5 - k * (2 * r + 4) };
  });
  const ticks = Array.from({ length: data.max - data.min + 1 }, (_, i) => data.min + i).filter(
    t => (data.max - data.min <= 12 ? true : t % 5 === 0),
  );

  const choose = (i: number) => {
    setDi(i);
    setValues(DATA[i].values);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📊 Средно или медиана?</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Влачи точките. Дръпни една стойност далеч надясно – средното тръгва след нея, а медианата почти не помръдва.
      </p>
      <Buttons>
        {DATA.map((d, i) => (
          <DiagramButton key={d.name} active={i === di} onClick={() => choose(i)}>
            {d.name}
          </DiagramButton>
        ))}
      </Buttons>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto mt-3 touch-none select-none text-gray-700 dark:text-gray-300"
        onPointerMove={e => {
          if (drag === null) return;
          const v = toValue(e.clientX);
          if (v !== null && v !== values[drag]) setValues(values.map((x, i) => (i === drag ? v : x)));
        }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <line x1={PAD - 10} x2={W - PAD + 10} y1={AXIS} y2={AXIS} stroke="currentColor" strokeOpacity="0.5" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={AXIS - 4} y2={AXIS + 4} stroke="currentColor" strokeOpacity="0.5" />
            <text x={X(t)} y={AXIS + 20} fontSize="12" textAnchor="middle" fill="currentColor" opacity="0.7">
              {num(t)}
            </text>
          </g>
        ))}
        {/* Средно (▲) и медиана (◆) */}
        <g className="fill-rose-500">
          <path d={`M ${X(st.mean)} ${AXIS + 26} l -8 14 h 16 z`} />
          <text x={X(st.mean)} y={AXIS + 52} fontSize="11" textAnchor="middle" fontWeight="700" className="fill-rose-600 dark:fill-rose-400">
            средно
          </text>
        </g>
        <g>
          <path d={`M ${X(st.median)} ${AXIS - 8} l 7 8 l -7 8 l -7 -8 z`} className="fill-violet-600" />
        </g>
        {dots.map(d => (
          <circle
            key={d.i}
            cx={X(d.v)}
            cy={d.y}
            r={r}
            className={`${drag === d.i ? 'fill-emerald-600' : 'fill-emerald-500'} stroke-white dark:stroke-gray-800 cursor-grab`}
            strokeWidth="2"
            onPointerDown={e => {
              e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
              setDrag(d.i);
            }}
          />
        ))}
      </svg>

      <div className="flex justify-center gap-2 mt-1">
        <button
          onClick={() => setValues([...values, Math.round((data.min + data.max) / 2)])}
          disabled={values.length >= 15}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm disabled:opacity-40"
        >
          <Plus size={14} /> стойност
        </button>
        <button
          onClick={() => setValues(values.slice(0, -1))}
          disabled={values.length <= 2}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm disabled:opacity-40"
        >
          <Minus size={14} /> стойност
        </button>
      </div>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'n =', value: values.length },
            { label: 'средно ▲', value: num(st.mean, 2), tone: 'rose' },
            { label: 'медиана ◆', value: num(st.median, 2), tone: 'violet' },
            { label: 'мода', value: st.modes.length ? st.modes.map(m => num(m)).join('; ') : 'няма', tone: 'emerald' },
            { label: 'размах', value: num(st.range) },
            { label: 'σ ≈', value: num(st.sd, 2) },
          ]}
        />
      </div>
      <p className="text-center font-mono text-xs sm:text-sm mt-2 text-gray-500 dark:text-gray-400">
        подредени: {[...values].sort((a, b) => a - b).map(v => num(v)).join(', ')}
      </p>
      {Math.abs(st.mean - st.median) > (data.max - data.min) * 0.06 && (
        <Note tone="amber">Средното и медианата се разминават – има „екстремна“ стойност. Тогава медианата описва типичния случай по-добре.</Note>
      )}
    </div>
  );
}
