import { useEffect, useRef, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { rng } from './industryModel';

const N = 60;
const REG = [
  { name: 'А', x: 120, y: 95 },
  { name: 'Б', x: 330, y: 70 },
  { name: 'В', x: 170, y: 245 },
  { name: 'Г', x: 380, y: 230 },
];
const COLORS = ['fill-sky-500', 'fill-amber-500', 'fill-emerald-500', 'fill-rose-500'];
const TEXT = ['fill-sky-700 dark:fill-sky-300', 'fill-amber-700 dark:fill-amber-300', 'fill-emerald-700 dark:fill-emerald-300', 'fill-rose-700 dark:fill-rose-300'];
const ADV = 0.5;
const NOISE = 0.3;
const GX = 470;
const GW = 150;
const GT = 40;
const GB = 280;
const MAXSTEP = 1200;

const start = (seed: number) => {
  const r = rng(seed);
  return Array.from({ length: N }, () => Math.floor(r() * 4));
};
const counts = (firms: number[]) => {
  const n = [0, 0, 0, 0];
  for (const r of firms) n[r]++;
  return n;
};

/** Агломерационен ефект: фирмите се местят там, където печелят повече, а печалбата расте с броя на съседите. */
export default function ClusterLab() {
  const [a, setA] = useState(1);
  const [c, setC] = useState(0.05);
  const [adv, setAdv] = useState(false);
  const [seed, setSeed] = useState(1);
  const [firms, setFirms] = useState(() => start(1));
  const [hist, setHist] = useState<number[]>(() => [Math.max(...counts(start(1))) / N]);
  const [running, setRunning] = useState(false);
  const rand = useRef(rng(1001));

  const B = [adv ? ADV : 0, 0, 0, 0];
  const profit = (r: number, n: number) => B[r] + a * Math.log(1 + n) - c * n;

  const stepMany = (k: number) => {
    const f = firms.slice();
    const n = counts(f);
    for (let s = 0; s < k; s++) {
      const i = Math.floor(rand.current() * N);
      n[f[i]]--;
      let best = 0;
      let bv = -Infinity;
      for (let r = 0; r < 4; r++) {
        const v = profit(r, n[r]) + (rand.current() - 0.5) * NOISE;
        if (v > bv) {
          bv = v;
          best = r;
        }
      }
      f[i] = best;
      n[best]++;
    }
    setFirms(f);
    setHist(h => (h.length * 20 > MAXSTEP ? h : [...h, Math.max(...n) / N]));
  };

  const stepRef = useRef(stepMany);
  stepRef.current = stepMany;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => stepRef.current(20), 120);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (hist.length * 20 > MAXSTEP) setRunning(false);
  }, [hist.length]);

  const reset = (s = seed + 1) => {
    setSeed(s);
    rand.current = rng(1000 + s);
    const f = start(s);
    setFirms(f);
    setHist([Math.max(...counts(f)) / N]);
    setRunning(false);
  };

  const n = counts(firms);
  const maxShare = Math.max(...n) / N;
  const occupied = n.filter(v => v > 0).length;
  const nStar = c > 0 ? a / c - 1 : Infinity;

  // Позиции на точките на фирмите – по спирала около центъра на района
  const slot = (k: number) => {
    const ang = k * 2.39996;
    const rad = 5.2 * Math.sqrt(k + 0.5);
    return { dx: rad * Math.cos(ang), dy: rad * Math.sin(ang) };
  };
  const byReg: number[][] = [[], [], [], []];
  firms.forEach((r, i) => byReg[r].push(i));

  const gx = (i: number) => GX + (i / (MAXSTEP / 20)) * GW;
  const gy = (v: number) => GB - v * (GB - GT);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Пътища между районите */}
        {REG.map((p, i) =>
          REG.slice(i + 1).map(q => (
            <line key={p.name + q.name} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" />
          ))
        )}
        {REG.map((p, r) => (
          <g key={p.name}>
            <circle cx={p.x} cy={p.y} r={18 + 5.2 * Math.sqrt(n[r])} className="fill-gray-100 dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600" />
            {byReg[r].map((id, k) => {
              const s = slot(k);
              return <circle key={id} cx={p.x + s.dx} cy={p.y + s.dy} r={3.2} className={COLORS[r]} />;
            })}
            <text x={p.x} y={p.y - 24 - 5.2 * Math.sqrt(n[r])} fontSize="12" fontWeight="bold" textAnchor="middle" className={TEXT[r]}>
              {p.name}: {n[r]}
              {adv && r === 0 ? ' ★' : ''}
            </text>
          </g>
        ))}
        {/* Графика: дял на най-големия район */}
        <rect x={GX} y={GT} width={GW} height={GB - GT} className="fill-gray-50 dark:fill-gray-900/40 stroke-gray-300 dark:stroke-gray-600" />
        {[0.25, 0.5, 0.75, 1].map(v => (
          <g key={v}>
            <line x1={GX} y1={gy(v)} x2={GX + GW} y2={gy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX - 4} y={gy(v) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v * 100}%
            </text>
          </g>
        ))}
        <polyline points={hist.map((v, i) => `${gx(i).toFixed(1)},${gy(v).toFixed(1)}`).join(' ')} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2" />
        <text x={GX + GW / 2} y={GT - 18} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          дял на най-големия район
        </text>
        <text x={GX + GW / 2} y={GT - 6} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          (за {MAXSTEP} премествания)
        </text>
        <text x={GX + GW / 2} y={GB + 14} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          премествания →
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton onClick={() => stepMany(20)}>+20 премествания</DiagramButton>
        <DiagramButton active={running} onClick={() => setRunning(v => !v)}>
          {running ? 'Пауза' : 'Пусни'}
        </DiagramButton>
        <DiagramButton onClick={() => reset()}>Отначало</DiagramButton>
        <DiagramButton
          active={adv}
          onClick={() => {
            setAdv(v => !v);
            reset();
          }}
        >
          ★ предимство за А
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="полза a" value={a} onChange={setA} min={0} max={2.5} step={0.1} tone="emerald" />
        <Slider label="тесн. c" value={c} onChange={setC} min={0} max={0.25} step={0.01} tone="rose" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        60 фирми избират между 4 района. Печалбата на фирма в район с n други фирми е a·ln(1 + n) − c·n (+ малка случайност): a – ползата от съседите
        (доставчици, обучени хора, обмен на идеи), c – „теснотата“ (наеми, заплати, задръствания). При ★ район А има малко предимство (по-добро
        местоположение, пристанище).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-голям дял', value: `${fmt(maxShare * 100)}%`, tone: 'blue' },
            { label: 'райони с фирми', value: String(occupied), tone: 'gray' },
            { label: 'печалбата расте до n ≈', value: Number.isFinite(nStar) ? fmt(Math.max(0, nStar)) : '∞', tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="blue">
        {hist.length < 5
          ? 'Пусни симулацията и гледай как се местят фирмите.'
          : maxShare > 0.9
            ? 'Ползата от съседите надделява: малка случайна преднина расте и почти всички фирми се събират в един район. Пусни отначало – често печели друг район.'
            : occupied === 4 && maxShare < 0.4
              ? 'Теснотата надделява (или ползата е малка): фирмите остават разпръснати почти поравно.'
              : 'Ползата и теснотата се уравновесяват: образуват се няколко центъра с по няколко десетки фирми.'}
      </Note>
    </div>
  );
}
