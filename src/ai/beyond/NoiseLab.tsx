import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { correlation, gaussians, noise, noisy, PICTURE, signal, SIZE, STEPS } from './diffusionMath';

const pct = (v: number) => `${Math.max(0, Math.round(v * 100))}%`;
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('-', '−');
const CELL = 9;
const TS = Array.from({ length: STEPS + 1 }, (_, i) => i);

function Picture({ x, values, title }: { x: number; values: number[]; title: string }) {
  return (
    <g>
      <text x={x + (SIZE * CELL) / 2} y={14} fontSize="12" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        {title}
      </text>
      {values.map((v, i) => {
        const g = Math.round(255 * (1 - Math.min(1, Math.max(0, (v + 1) / 2))));
        return <rect key={i} x={x + (i % SIZE) * CELL} y={22 + Math.floor(i / SIZE) * CELL} width={CELL + 0.4} height={CELL + 0.4} fill={`rgb(${g},${g},${g})`} />;
      })}
      <rect x={x} y={22} width={SIZE * CELL} height={SIZE * CELL} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
    </g>
  );
}

/** Права дифузия: картинка 16 × 16, към която на всяка стъпка се добавя шум; делът на оригинала и на шума по стъпки. */
export default function NoiseLab() {
  const [t, setT] = useState(0);
  const [seed, setSeed] = useState(1);
  const eps = useMemo(() => gaussians(seed, SIZE * SIZE), [seed]);
  const xt = noisy(PICTURE, eps, t);
  const corr = t === 0 ? 1 : correlation(PICTURE, xt);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <svg viewBox="0 0 340 172" className="w-full max-w-md mx-auto h-auto block select-none">
        <Picture x={10} values={PICTURE} title="оригинал x₀" />
        <Picture x={186} values={xt} title={`след ${t} ${t === 1 ? 'стъпка' : 'стъпки'}: x${t === 0 ? '₀' : 'ₜ'}`} />
        <text x={170} y={100} fontSize="18" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          →
        </text>
      </svg>
      <Chart x={[0, STEPS]} y={[0, 1]} xTicks={[0, 10, 20, 30, 40]} yTicks={[0, 0.25, 0.5, 0.75, 1]} xLabel="стъпка t" yLabel="множител" height={240}>
        {s => (
          <>
            <polyline points={TS.map(k => `${s.sx(k)},${s.sy(signal(k))}`).join(' ')} fill="none" className="stroke-fuchsia-500" strokeWidth={2.5} />
            <polyline points={TS.map(k => `${s.sx(k)},${s.sy(noise(k))}`).join(' ')} fill="none" className="stroke-amber-500" strokeWidth={2.5} />
            <line x1={s.sx(t)} y1={s.y0} x2={s.sx(t)} y2={s.y1} className="stroke-gray-500 dark:stroke-gray-300" strokeDasharray="5 4" />
            <circle cx={s.sx(t)} cy={s.sy(signal(t))} r={5} className="fill-fuchsia-500" />
            <circle cx={s.sx(t)} cy={s.sy(noise(t))} r={5} className="fill-amber-500" />
            <text x={s.x1 - 8} y={s.sy(0.2)} fontSize="13" textAnchor="end" className="fill-fuchsia-600 dark:fill-fuchsia-300">
              пред оригинала
            </text>
            <text x={s.x1 - 8} y={s.sy(0.86)} fontSize="13" textAnchor="end" className="fill-amber-600 dark:fill-amber-300">
              пред шума
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="t" value={t} onChange={setT} min={0} max={STEPS} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setSeed(seed + 1)}>🎲 друг шум</DiagramButton>
        <DiagramButton onClick={() => setT(0)}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'пред оригинала', value: dec(signal(t)), tone: 'violet' },
            { label: 'пред шума', value: dec(noise(t)), tone: 'amber' },
            { label: 'сигнал : шум', value: t === 0 ? '∞' : dec(signal(t) ** 2 / noise(t) ** 2), tone: 'blue' },
            { label: 'прилика с оригинала', value: pct(corr), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={t === 0 ? 'gray' : t <= 6 ? 'emerald' : t < 25 ? 'amber' : 'rose'}>
        {t === 0
          ? 'Още няма шум. Премести плъзгача надясно.'
          : t <= 6
            ? 'Къщата се вижда ясно – сигналът още е по-силен от шума.'
            : t < 25
              ? 'Шумът вече е по-силен от сигнала. Къщата се отгатва само по едрите петна.'
              : 'Почти чист шум: от тази картинка не може да се познае какво е имало в началото.'}
      </Note>
    </div>
  );
}
