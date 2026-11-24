import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from '../history/rollouts';
import { maxPool, outSize } from './conv';

const W = 640;
const H = 300;

/** Числова карта 6 × 6 със стойности от 0 до 9 – винаги една и съща за дадено `seed`. */
const numberMap = (seed: number) => {
  const r = mulberry32(seed);
  return Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => Math.floor(r() * 10)));
};

/** Плъзгане на прозореца: размер на изхода при избрани n, k, допълване и стъпка. */
function Slide() {
  const [n, setN] = useState(6);
  const [k, setK] = useState(3);
  const [p, setP] = useState(0);
  const [s, setS] = useState(1);
  const [pos, setPos] = useState(0);

  const full = n + 2 * p;
  const m = outSize(n, k, p, s);
  const count = m * m;
  const at = Math.min(pos, Math.max(0, count - 1));
  const row = m ? Math.floor(at / m) : 0;
  const col = m ? at % m : 0;
  const unused = m ? full - ((m - 1) * s + k) : 0;

  const cell = Math.min(24, 250 / full);
  const x0 = 40 + (250 - cell * full) / 2;
  const y0 = 34 + (250 - cell * full) / 2;
  const oc = m ? Math.min(24, 220 / m) : 24;
  const ox = 380 + (220 - oc * m) / 2;
  const oy = 34 + (250 - oc * m) / 2;

  const fit = (a: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, a));
  // Ядрото не може да е по-голямо от допълнената картинка
  const setSafe = (next: { n?: number; k?: number; p?: number }) => {
    const nn = next.n ?? n;
    const pp = next.p ?? p;
    const kk = fit(next.k ?? k, 1, nn + 2 * pp);
    setN(nn);
    setP(pp);
    setK(kk);
    setPos(0);
  };

  return (
    <>
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={165} y={20} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          вход {n} × {n}
          {p ? ` + рамка от нули (${p})` : ''}
        </text>
        {Array.from({ length: full * full }, (_, i) => {
          const r = Math.floor(i / full);
          const c = i % full;
          const padded = r < p || c < p || r >= full - p || c >= full - p;
          const skipped = unused > 0 && (r >= full - unused || c >= full - unused);
          return (
            <rect
              key={i}
              x={x0 + c * cell}
              y={y0 + r * cell}
              width={cell}
              height={cell}
              className={padded ? 'fill-gray-200 stroke-gray-400 dark:fill-gray-700 dark:stroke-gray-500' : skipped ? 'fill-amber-100 stroke-gray-400 dark:fill-amber-900/40 dark:stroke-gray-500' : 'fill-blue-50 stroke-gray-400 dark:fill-blue-950/50 dark:stroke-gray-500'}
              strokeWidth="1"
              strokeDasharray={padded ? '3 2' : undefined}
            />
          );
        })}
        {m > 0 && <rect x={x0 + col * s * cell} y={y0 + row * s * cell} width={k * cell} height={k * cell} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3.5" rx="2" />}
        {m > 0 &&
          Array.from({ length: m }, (_, j) => (
            <circle key={j} cx={x0 + (j * s + k / 2) * cell} cy={y0 - 6} r={2.5} className={j === col ? 'fill-fuchsia-600 dark:fill-fuchsia-400' : 'fill-gray-400'} />
          ))}
        <text x={325} y={165} fontSize="24" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <text x={490} y={20} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          {m > 0 ? `изход ${m} × ${m}` : 'ядрото не се побира'}
        </text>
        {Array.from({ length: count }, (_, i) => {
          const r = Math.floor(i / m);
          const c = i % m;
          const on = i === at;
          return (
            <rect
              key={i}
              x={ox + c * oc}
              y={oy + r * oc}
              width={oc}
              height={oc}
              onClick={() => setPos(i)}
              className={`cursor-pointer ${on ? 'fill-fuchsia-500 stroke-fuchsia-700' : i < at ? 'fill-fuchsia-100 stroke-gray-400 dark:fill-fuchsia-900/40 dark:stroke-gray-500' : 'fill-white stroke-gray-400 dark:fill-gray-900 dark:stroke-gray-500'}`}
              strokeWidth="1"
            />
          );
        })}
      </LabSvg>
      <Sliders>
        <Slider label="вход n" value={n} onChange={v => setSafe({ n: v })} min={4} max={10} step={1} tone="blue" />
        <Slider label="ядро k" value={k} onChange={v => setSafe({ k: v })} min={1} max={5} step={1} tone="violet" />
        <Slider label="рамка p" value={p} onChange={v => setSafe({ p: v })} min={0} max={2} step={1} tone="gray" />
        <Slider
          label="стъпка s"
          value={s}
          onChange={v => {
            setS(v);
            setPos(0);
          }}
          min={1}
          max={3}
          step={1}
          tone="amber"
        />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setPos(count ? (at + 1) % count : 0)}>следваща позиция ▶</DiagramButton>
        <DiagramButton onClick={() => setPos(0)}>в началото</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'по една посока', value: `⌊(${n} − ${k} + 2·${p}) / ${s}⌋ + 1 = ${m}`, tone: 'violet' },
            { label: 'позиции на прозореца', value: `${m} · ${m} = ${count}` },
            { label: 'позиция', value: count ? `${at + 1} от ${count}` : '–' },
          ]}
        />
      </div>
      <Note tone={unused > 0 ? 'amber' : p > 0 && m === n ? 'emerald' : 'gray'}>
        {unused > 0
          ? `Със стъпка ${s} прозорецът не стига точно до края: ${unused === 1 ? 'последният ред и последната колона' : `последните ${unused} реда и ${unused} колони`} (в жълто) остават неизползвани.`
          : p > 0 && m === n
            ? 'С тази рамка от нули изходът е голям колкото входа – картата не се смалява.'
            : 'Всяка позиция на розовия прозорец дава една клетка от изхода. Точките над входа показват къде застава прозорецът по хоризонтала.'}
      </Note>
    </>
  );
}

/** Обединяване 2 × 2 по максимум върху карта от числа. */
function Pool() {
  const [seed, setSeed] = useState(3);
  const map = numberMap(seed);
  const pooled = maxPool(map, 2);
  const cell = 40;
  const x0 = 60;
  const y0 = 40;
  const ox = 420;
  const oy = 70;
  const oc = 60;
  const tints = ['fill-blue-50 dark:fill-blue-950/40', 'fill-amber-50 dark:fill-amber-950/30'];

  return (
    <>
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={x0 + 3 * cell} y={24} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          карта 6 × 6
        </text>
        {map.map((line, r) =>
          line.map((v, c) => {
            const best = v === pooled[Math.floor(r / 2)][Math.floor(c / 2)];
            return (
              <g key={`${r}-${c}`}>
                <rect x={x0 + c * cell} y={y0 + r * cell} width={cell} height={cell} className={`${best ? 'fill-fuchsia-200 dark:fill-fuchsia-800/60' : tints[(Math.floor(r / 2) + Math.floor(c / 2)) % 2]} stroke-gray-300 dark:stroke-gray-600`} />
                <text x={x0 + (c + 0.5) * cell} y={y0 + (r + 0.5) * cell + 5} fontSize="16" fontFamily="monospace" fontWeight={best ? 'bold' : 'normal'} textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
                  {v}
                </text>
              </g>
            );
          })
        )}
        {[0, 1, 2].map(r => [0, 1, 2].map(c => <rect key={`${r}${c}`} x={x0 + 2 * c * cell} y={y0 + 2 * r * cell} width={2 * cell} height={2 * cell} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />))}
        <text x={355} y={170} fontSize="24" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <text x={ox + 1.5 * oc} y={54} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          след обединяване 3 × 3
        </text>
        {pooled.map((line, r) =>
          line.map((v, c) => (
            <g key={`${r}-${c}`}>
              <rect x={ox + c * oc} y={oy + r * oc} width={oc} height={oc} className="fill-fuchsia-200 stroke-gray-600 dark:fill-fuchsia-800/60 dark:stroke-gray-300" strokeWidth="2" />
              <text x={ox + (c + 0.5) * oc} y={oy + (r + 0.5) * oc + 7} fontSize="20" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
                {v}
              </text>
            </g>
          ))
        )}
      </LabSvg>
      <Buttons>
        <DiagramButton onClick={() => setSeed(seed + 1)}>нови числа</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'числа преди', value: 36 },
            { label: 'числа след', value: 9, tone: 'violet' },
            { label: 'параметри за учене', value: 0 },
          ]}
        />
      </div>
      <Note tone="gray">От всяко квадратче 2 × 2 остава само най-голямото число (в розово). Картата става 4 пъти по-малка, а къде точно в квадратчето е бил максимумът, вече не се знае.</Note>
    </>
  );
}

/** Две части: `slide` – как се плъзга прозорецът (размер на изхода), `pool` – обединяване по максимум. */
export default function SlideLab({ part = 'slide' }: { part?: 'slide' | 'pool' }) {
  return <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">{part === 'slide' ? <Slide /> : <Pool />}</div>;
}
