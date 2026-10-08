import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Mode = 'chain' | 'interest';
const W = 600;
const eur = (v: number) => `${num(v, 2)} €`;
const pct = (p: number) => `${p > 0 ? '+' : p < 0 ? '−' : ''}${num(Math.abs(p), 2)}%`;

/** Последователни промени с проценти и сложна лихва. */
export default function PercentLab() {
  const [mode, setMode] = useState<Mode>('chain');
  const [price, setPrice] = useState(100);
  const [p, setP] = useState(20);
  const [q, setQ] = useState(-20);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(15);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📈 Проценти от проценти</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Увеличението с p% умножава по (1 + p/100). Всяка следваща промяна се смята от новата стойност, не от началната.
      </p>
      <Buttons>
        <DiagramButton active={mode === 'chain'} onClick={() => setMode('chain')}>
          две последователни промени
        </DiagramButton>
        <DiagramButton active={mode === 'interest'} onClick={() => setMode('interest')}>
          сложна срещу проста лихва
        </DiagramButton>
      </Buttons>
      {mode === 'chain' ? <Chain {...{ price, setPrice, p, setP, q, setQ }} /> : <Interest {...{ rate, setRate, years, setYears }} />}
    </div>
  );
}

function Chain({
  price,
  setPrice,
  p,
  setP,
  q,
  setQ,
}: {
  price: number;
  setPrice: (v: number) => void;
  p: number;
  setP: (v: number) => void;
  q: number;
  setQ: (v: number) => void;
}) {
  const v1 = price * (1 + p / 100);
  const v2 = v1 * (1 + q / 100);
  const total = (v2 / price - 1) * 100;
  const max = Math.max(price, v1, v2);
  const bars = [
    { label: 'начало', v: price, cls: 'fill-gray-400 dark:fill-gray-500' },
    { label: `след ${pct(p)}`, v: v1, cls: 'fill-blue-500' },
    { label: `след ${pct(q)}`, v: v2, cls: 'fill-amber-500' },
  ];
  const BW = 120;

  return (
    <>
      <svg viewBox={`0 0 ${W} 220`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        <line x1={40} x2={W - 40} y1={180} y2={180} stroke="currentColor" strokeOpacity="0.4" />
        <line x1={40} x2={W - 40} y1={180 - (price / max) * 150} y2={180 - (price / max) * 150} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="5 5" />
        {bars.map((b, i) => {
          const x = 70 + i * 180;
          const h = (b.v / max) * 150;
          return (
            <g key={i}>
              <rect x={x} y={180 - h} width={BW} height={h} rx={6} className={b.cls} />
              <text x={x + BW / 2} y={172 - h} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
                {eur(b.v)}
              </text>
              <text x={x + BW / 2} y={200} fontSize="13" textAnchor="middle" fill="currentColor" opacity="0.75">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <Sliders>
        <Slider label="цена" value={price} onChange={setPrice} min={50} max={500} step={10} tone="gray" />
        <Slider label="p, %" value={p} onChange={setP} min={-50} max={100} step={5} tone="blue" />
        <Slider label="q, %" value={q} onChange={setQ} min={-50} max={100} step={5} tone="amber" />
      </Sliders>
      <Formula>
        {num(price)} · {num(1 + p / 100, 2)} · {num(1 + q / 100, 2)} = {eur(v2)}
      </Formula>
      <Note tone={Math.abs(total) < 1e-9 ? 'emerald' : total < 0 ? 'rose' : 'blue'}>
        Общо: {pct(Math.round(total * 100) / 100)}
        {p === -q && p !== 0 ? ` – а не 0%! ${pct(p)} и ${pct(q)} не се „унищожават“: втората промяна е от друга основа.` : ''}
      </Note>
    </>
  );
}

function Interest({ rate, setRate, years, setYears }: { rate: number; setRate: (v: number) => void; years: number; setYears: (v: number) => void }) {
  const P = 1000;
  const compound = (n: number) => P * (1 + rate / 100) ** n;
  const simple = (n: number) => P * (1 + (rate / 100) * n);
  const max = compound(years);
  const H = 170;
  const step = (W - 80) / (years + 1);
  const bw = Math.max(4, step * 0.7);
  const double = Math.ceil(Math.log(2) / Math.log(1 + rate / 100));

  return (
    <>
      <svg viewBox={`0 0 ${W} 230`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        <line x1={40} x2={W - 30} y1={190} y2={190} stroke="currentColor" strokeOpacity="0.4" />
        {Array.from({ length: years + 1 }, (_, n) => {
          const x = 50 + n * step;
          const hc = (compound(n) / max) * H;
          const hs = (simple(n) / max) * H;
          return (
            <g key={n}>
              <rect x={x} y={190 - hc} width={bw} height={hc} rx={2} className={n === double ? 'fill-emerald-500' : 'fill-amber-500'} />
              <line x1={x - 1} x2={x + bw + 1} y1={190 - hs} y2={190 - hs} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" />
              {(n % 5 === 0 || n === years) && (
                <text x={x + bw / 2} y={208} fontSize="12" textAnchor="middle" fill="currentColor" opacity="0.7">
                  {n}
                </text>
              )}
            </g>
          );
        })}
        <text x={50} y={225} fontSize="12" fill="currentColor" opacity="0.7">
          години
        </text>
        <text x={50} y={18} fontSize="13" className="fill-amber-600 dark:fill-amber-400" fontWeight="700">
          ■ сложна лихва
        </text>
        <text x={50} y={36} fontSize="13" className="fill-blue-600 dark:fill-blue-400" fontWeight="700">
          ― проста лихва
        </text>
      </svg>
      <Sliders>
        <Slider label="лихва %" value={rate} onChange={setRate} min={1} max={12} step={0.5} tone="amber" />
        <Slider label="години" value={years} onChange={setYears} min={1} max={30} step={1} tone="gray" />
      </Sliders>
      <Formula>
        Сложна: 1000 · {num(1 + rate / 100, 3)}^{years} = {eur(compound(years))} &nbsp; Проста: 1000 + {years} · {num(rate * 10, 2)} = {eur(simple(years))}
      </Formula>
      <Note tone="emerald">
        Сумата се удвоява за {double} години (зелената колона). Правилото на 72: 72 : {num(rate)} ≈ {num(72 / rate, 1)}.
      </Note>
    </>
  );
}
