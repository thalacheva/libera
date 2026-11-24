import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { chainShares, pairCount } from './attentionMath';

const pct = (v: number) => (v >= 0.0995 ? `${Math.round(v * 100)}%` : v >= 0.001 ? `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%` : 'под 0,1%');
const big = (v: number) => v.toLocaleString('bg-BG').replace(/\s/g, ' ');

/** Верига с памет (опростена): каква част от крайното състояние идва от всяка дума – срещу пряк достъп при внимание. */
export default function AttentionBottleneckLab() {
  const [n, setN] = useState(20);
  const [keep, setKeep] = useState(0.8);
  const [pos, setPos] = useState(2);
  const shares = chainShares(n, keep);
  const p = Math.min(pos, n);
  const share = shares[p - 1];
  const top = Math.max(0.2, Math.ceil((1 - keep) * 10) / 10);
  const ticks = n <= 12 ? Array.from({ length: n }, (_, i) => i + 1) : [1, ...Array.from({ length: Math.floor(n / 5) }, (_, i) => (i + 1) * 5)];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0.3, n + 0.7]} y={[0, top]} xTicks={ticks} yTicks={[0, top / 2, top]} xLabel="поредна дума в изречението" yLabel="дял в крайната памет" height={260} yTick={v => `${Math.round(v * 100)}%`}>
        {s => (
          <>
            {shares.map((v, i) => {
              const w = Math.min(22, ((s.x1 - s.x0) / (n + 0.4)) * 0.7);
              return <rect key={i} x={s.sx(i + 1) - w / 2} y={s.sy(v)} width={w} height={Math.max(1.5, s.y0 - s.sy(v))} className={i + 1 === p ? 'fill-rose-500' : 'fill-blue-400 dark:fill-blue-500'} clipPath={s.clip} />;
            })}
            <line x1={s.sx(p)} y1={s.y0} x2={s.sx(p)} y2={s.y1} className="stroke-rose-500" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={Math.min(s.x1 - 70, Math.max(s.x0 + 70, s.sx(p)))} y={s.y1 + 16} fontSize="12" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
              нужната дума
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="думи" value={n} onChange={setN} min={5} max={60} step={1} tone="blue" />
        <Slider label="памет" value={keep} onChange={setKeep} min={0.5} max={0.95} step={0.05} tone="amber" />
        <Slider label="нужна" value={p} onChange={setPos} min={1} max={n} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `дял на дума ${p} във веригата`, value: pct(share), tone: 'rose' },
            { label: 'стъпки до края по веригата', value: n - p },
            { label: 'стъпки при внимание', value: 1, tone: 'emerald' },
            { label: 'двойки при внимание', value: `${n}² = ${big(pairCount(n))}`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={share < 0.01 ? 'rose' : 'gray'}>
        {share < 0.01
          ? `От дума ${p} в крайната памет е останало ${pct(share)} – веригата на практика я е забравила. Вниманието би стигнало до нея с една стъпка, но плаща за това с ${big(pairCount(n))} сравнения.`
          : 'Веригата чете дума по дума и на всяка стъпка пази част от старата памет („памет“ = каква част). Стълбовете показват колко от всяка дума е останало накрая. Премести „нужна“ към началото и удължи изречението.'}
      </Note>
    </div>
  );
}
