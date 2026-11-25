import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';
import { type Fair, fairness, type Group, GROUPS, positives, SCORES } from './failureData';

const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;
/** Две стойности минават за „равни“, ако се различават с най-много 2 процентни пункта. */
const same = (a: number, b: number) => Math.abs(a - b) <= 0.02;

const TONE = [
  { text: 'text-blue-700 dark:text-blue-300', dark: 'fill-blue-700 dark:fill-blue-400', light: 'fill-blue-300 dark:fill-blue-800', slider: 'blue' as const },
  { text: 'text-amber-700 dark:text-amber-300', dark: 'fill-amber-600 dark:fill-amber-400', light: 'fill-amber-300 dark:fill-amber-800', slider: 'amber' as const },
];

function GroupCard({ g, i, t, setT, f }: { g: Group; i: number; t: number; setT: (v: number) => void; f: Fair }) {
  const W = 300;
  const H = 120;
  const max = 300;
  const bw = W / SCORES.length;
  const sy = (n: number) => H - 18 - (n / max) * (H - 26);
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <p className={`text-sm font-semibold ${TONE[i].text}`}>
        {g.name}: {f.n} души, {pct(f.base)} не връщат заема
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <rect x={t * W} y={4} width={W - t * W} height={H - 22} className="fill-rose-300/25" />
        {SCORES.map((s, b) => {
          const pos = positives(g, b);
          return (
            <g key={s}>
              <rect x={b * bw + 2} y={sy(g.counts[b])} width={bw - 4} height={sy(pos) - sy(g.counts[b])} className={TONE[i].light} />
              <rect x={b * bw + 2} y={sy(pos)} width={bw - 4} height={H - 18 - sy(pos)} className={TONE[i].dark} />
              <text x={b * bw + bw / 2} y={H - 5} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {Math.round(s * 100)}
              </text>
            </g>
          );
        })}
        <line x1={t * W} y1={2} x2={t * W} y2={H - 18} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
      </svg>
      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">оценка на риска, % (тъмното: наистина не връщат)</p>
      <Sliders>
        <Slider label="праг" value={t} onChange={setT} min={0.1} max={0.9} step={0.1} tone={TONE[i].slider} />
      </Sliders>
      <p className="mt-2 text-xs sm:text-sm text-center text-gray-700 dark:text-gray-300">
        отказ за {f.tp + f.fp} души: {f.tp} с основание, {f.fp} напразно · заем за {f.fn + f.tn}: {f.tn} го връщат, {f.fn} не
      </p>
    </div>
  );
}

/** Две групи с различна базова честота и калибриран модел: праг за всяка група и три мерки за справедливост. */
export default function FailureFairnessLab() {
  const [ta, setTa] = useState(0.5);
  const [tb, setTb] = useState(0.5);
  const a = fairness(GROUPS[0], ta);
  const b = fairness(GROUPS[1], tb);
  const rows: [string, string, number, number][] = [
    ['напразно отказани', 'от хората, които биха върнали заема', a.fpr, b.fpr],
    ['пропуснати', 'от хората, които не го връщат', a.fnr, b.fnr],
    ['основателни откази', 'от всички откази', a.ppv, b.ppv],
  ];
  const equal = rows.filter(r => same(r[2], r[3])).length;
  const cell = 'px-2 py-1.5 border border-gray-200 dark:border-gray-700';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <GroupCard g={GROUPS[0]} i={0} t={ta} setT={setTa} f={a} />
        <GroupCard g={GROUPS[1]} i={1} t={tb} setT={setTb} f={b} />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="mx-auto border-collapse text-xs sm:text-sm text-gray-800 dark:text-gray-200">
          <thead>
            <tr>
              <th className={`${cell} text-left`}>мярка</th>
              <th className={`${cell} ${TONE[0].text}`}>Сините</th>
              <th className={`${cell} ${TONE[1].text}`}>Оранжевите</th>
              <th className={cell}>равни?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, of, va, vb]) => (
              <tr key={name}>
                <th className={`${cell} text-left font-medium`}>
                  {name}
                  <span className="block font-normal text-[11px] text-gray-500 dark:text-gray-400">{of}</span>
                </th>
                <td className={`${cell} text-center font-mono`}>{pct(va)}</td>
                <td className={`${cell} text-center font-mono`}>{pct(vb)}</td>
                <td className={`${cell} text-center ${same(va, vb) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{same(va, vb) ? '✓' : '✗'}</td>
              </tr>
            ))}
            <tr>
              <th className={`${cell} text-left font-medium`}>точност</th>
              <td className={`${cell} text-center font-mono`}>{pct(a.accuracy)}</td>
              <td className={`${cell} text-center font-mono`}>{pct(b.accuracy)}</td>
              <td className={cell}></td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note tone={equal >= 2 ? 'amber' : 'rose'}>
        Изравнени мерки: {equal} от 3 (за „равни“ минават стойности с разлика до 2 процентни пункта). Опитай да получиш три отметки.
      </Note>
      <Note tone="gray">
        Отказ получава всеки с оценка над прага (розовата зона). Моделът е еднакво честен към двете групи: от хората с оценка 35% точно
        35% не връщат заема – и при Сините, и при Оранжевите.
      </Note>
    </div>
  );
}
