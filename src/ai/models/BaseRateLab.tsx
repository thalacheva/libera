import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';

const RATES = [0.5, 1, 2, 5, 10, 20, 50];
const COLS = 80;
const ROWS = 25;
const N = COLS * ROWS;

const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** 2000 души и един тест: колко от положителните резултати са истински, когато болните са малко. */
export default function BaseRateLab() {
  const [ri, setRi] = useState(1);
  const [sens, setSens] = useState(90);
  const [spec, setSpec] = useState(95);

  const sick = Math.round((N * RATES[ri]) / 100);
  const tp = Math.round((sick * sens) / 100);
  const fn = sick - tp;
  const tn = Math.round(((N - sick) * spec) / 100);
  const fp = N - sick - tn;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const accuracy = (tp + tn) / N;
  // Подредба: истински положителни, пропуснати болни, фалшиво положителни, истински отрицателни
  const kind = (i: number) => (i < tp ? 0 : i < tp + fn ? 1 : i < tp + fn + fp ? 2 : 3);
  const FILL = ['fill-rose-600', 'fill-violet-500', 'fill-amber-400', 'fill-gray-300 dark:fill-gray-600'];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <svg viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`} className="w-full h-auto block">
        {Array.from({ length: N }, (_, i) => (
          <rect key={i} x={(i % COLS) * 10 + 1} y={Math.floor(i / COLS) * 10 + 1} width={8} height={8} rx={2} className={FILL[kind(i)]} />
        ))}
      </svg>
      <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        <span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-600 align-middle" /> болни, тестът ги открива ({tp})</span>
        <span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-500 align-middle" /> болни, тестът ги пропуска ({fn})</span>
        <span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400 align-middle" /> здрави с положителен тест ({fp})</span>
        <span><span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-300 align-middle dark:bg-gray-600" /> здрави с отрицателен тест ({tn})</span>
      </p>
      <Sliders>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-16 flex-shrink-0 font-mono text-rose-600 dark:text-rose-400">болни</span>
          <input type="range" min={0} max={RATES.length - 1} step={1} value={ri} onChange={e => setRi(Number(e.target.value))} className="flex-1 min-w-0 accent-rose-500 cursor-pointer" aria-label="Дял на болните" />
          <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{dec(RATES[ri], RATES[ri] < 1 ? 1 : 0)}%</span>
        </label>
        <Slider label="открива" value={sens} onChange={setSens} min={50} max={100} step={1} tone="violet" />
        <Slider label="отхвърля" value={spec} onChange={setSpec} min={50} max={100} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'положителни тестове', value: tp + fp },
            { label: 'от тях наистина болни', value: `${tp} (${Math.round(precision * 100)}%)`, tone: precision > 0.5 ? 'emerald' : 'rose' },
            { label: 'точност на теста', value: `${dec(accuracy * 100)}%`, tone: 'blue' },
            { label: 'точност на „всички са здрави“', value: `${dec(((N - sick) / N) * 100)}%` },
          ]}
        />
      </div>
      <Note tone="gray">
        „Открива“ е делът на болните, при които тестът е положителен; „отхвърля“ – делът на здравите, при които е отрицателен. Всяко
        квадратче е един от 2000 души.
      </Note>
    </div>
  );
}
