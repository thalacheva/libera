import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { positionSimilarity, positionVector } from './transformer';

const W = 640;
const H = 330;
const N = 50;
const LEFT = 62;
const CELL = 11.2;
const TOP = 26;
const MAP_H = 190;
const BAR_TOP = 248;
const BAR_H = 54;
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('-', '−');

/** Топлинна карта на синусоидалното позиционно кодиране и близостта между кодовете на две позиции. */
export default function TransformerPositionLab() {
  const [d, setD] = useState(32);
  const [p, setP] = useState(10);
  const [q, setQ] = useState(15);

  const rowH = MAP_H / d;
  const codes = Array.from({ length: N }, (_, pos) => positionVector(pos, d));
  const sim = positionSimilarity(p, q, d);
  const x = (pos: number) => LEFT + pos * CELL;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={LEFT + (N * CELL) / 2} y={14} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          позиция в текста (0 – {N - 1}) →
        </text>
        <text x={16} y={TOP + MAP_H / 2} fontSize="12" textAnchor="middle" transform={`rotate(-90 16 ${TOP + MAP_H / 2})`} className="fill-gray-600 dark:fill-gray-300">
          измерение 1 – {d}
        </text>
        {codes.map((code, pos) =>
          code.map((v, i) => <rect key={`${pos}-${i}`} x={x(pos)} y={TOP + i * rowH} width={CELL + 0.4} height={rowH + 0.4} opacity={Math.abs(v)} className={v >= 0 ? 'fill-rose-500' : 'fill-blue-500'} />)
        )}
        <rect x={LEFT} y={TOP} width={N * CELL} height={MAP_H} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
        {[
          { pos: p, cls: 'stroke-violet-600 dark:stroke-violet-300', fill: 'fill-violet-700 dark:fill-violet-300', name: 'A' },
          { pos: q, cls: 'stroke-amber-500 dark:stroke-amber-300', fill: 'fill-amber-600 dark:fill-amber-300', name: 'B' },
        ].map(m => (
          <g key={m.name}>
            <rect x={x(m.pos)} y={TOP - 2} width={CELL} height={MAP_H + 4} fill="none" className={m.cls} strokeWidth="2.5" />
            <text x={x(m.pos) + CELL / 2} y={TOP + MAP_H + 16} fontSize="12" fontWeight="bold" textAnchor="middle" className={m.fill}>
              {m.name}
            </text>
          </g>
        ))}
        <text x={LEFT - 6} y={BAR_TOP + BAR_H / 2 + 4} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          близост
        </text>
        <text x={LEFT - 6} y={BAR_TOP + BAR_H / 2 + 17} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          с A
        </text>
        <line x1={LEFT} y1={BAR_TOP + BAR_H} x2={LEFT + N * CELL} y2={BAR_TOP + BAR_H} className="stroke-gray-400 dark:stroke-gray-500" />
        {Array.from({ length: N }, (_, pos) => {
          const s = Math.max(0, positionSimilarity(p, pos, d));
          return <rect key={pos} x={x(pos) + 1.5} y={BAR_TOP + BAR_H - s * BAR_H} width={CELL - 3} height={s * BAR_H} className={pos === q ? 'fill-amber-500' : pos === p ? 'fill-violet-600 dark:fill-violet-400' : 'fill-gray-400 dark:fill-gray-500'} />;
        })}
        <text x={LEFT + (N * CELL) / 2} y={H - 6} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          червено – положително число, синьо – отрицателно; по-наситено – по-далеч от нулата
        </text>
      </LabSvg>
      <Sliders>
        <Slider label="позиция A" value={p} onChange={setP} min={0} max={N - 1} step={1} tone="violet" />
        <Slider label="позиция B" value={q} onChange={setQ} min={0} max={N - 1} step={1} tone="amber" />
        <Slider label="измерения d" value={d} onChange={setD} min={8} max={64} step={8} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'разстояние между A и B', value: Math.abs(p - q), tone: 'violet' },
            { label: 'близост на кодовете', value: dec(sim), tone: sim > 0.8 ? 'emerald' : 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">
        Всяка колона е кодът на една позиция. Горните редове се сменят бързо – различават съседите. Долните се менят бавно – казват
        приблизително къде в текста сме. Стълбчетата долу показват колко прилича кодът на всяка позиция на кода на A.
      </Note>
    </div>
  );
}
