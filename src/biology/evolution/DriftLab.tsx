import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const POPS = 10;
const GENS = 100;
// Тясното гърло: в поколения 30–34 остават само 4 индивида
const NECK_FROM = 30;
const NECK_TO = 34;
const NECK_N = 4;

const COLORS = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#ea580c', '#475569'];

/** Генератор на случайни числа със семе – първото пускане е едно и също при сървъра и браузъра. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Биномно разпределение B(n, p) чрез обхождане на функцията на разпределение (бързо при малко np). */
function binomial(n: number, p: number, rand: () => number): number {
  if (p <= 0) return 0;
  if (p >= 1) return n;
  if (p > 0.5) return n - binomial(n, 1 - p, rand);
  if (n * p > 60) {
    // Нормално приближение – при много алели разликата не се вижда
    const u = Math.max(rand(), 1e-12);
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
    return Math.min(n, Math.max(0, Math.round(n * p + z * Math.sqrt(n * p * (1 - p)))));
  }
  const r = p / (1 - p);
  let prob = (1 - p) ** n;
  let cdf = prob;
  const u = rand();
  let k = 0;
  while (u > cdf && k < n) {
    prob *= (r * (n - k)) / (k + 1);
    k++;
    cdf += prob;
  }
  return k;
}

/** Модел на Райт–Фишър: всяко поколение 2N алела се теглят случайно от алелите на предишното. */
function simulate(seed: number, n: number, p0: number, neck: boolean) {
  const rand = mulberry32(seed);
  return Array.from({ length: POPS }, () => {
    const path = [p0];
    let p = p0;
    for (let g = 1; g <= GENS; g++) {
      const size = neck && g >= NECK_FROM && g <= NECK_TO ? NECK_N : n;
      p = binomial(2 * size, p, rand) / (2 * size);
      path.push(p);
    }
    return path;
  });
}

/** Делът на популациите, в които алелът A се фиксира (дълго пускане до края на дрейфа). */
function fixationShare(seed: number, n: number, p0: number, runs: number) {
  const rand = mulberry32(seed);
  let fixed = 0;
  for (let r = 0; r < runs; r++) {
    let p = p0;
    for (let g = 0; g < 40 * n && p > 0 && p < 1; g++) p = binomial(2 * n, p, rand) / (2 * n);
    if (p >= 1) fixed++;
  }
  return fixed / runs;
}

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// Графиката
const GX = 40;
const GW = 420;
const GY = 12;
const GH = 190;

/** Генетичен дрейф: 10 популации с еднакво начало, всяка се „лута“ случайно до загуба или фиксиране на алела. */
export default function DriftLab() {
  const [n, setN] = useState(20);
  const [p0, setP0] = useState(0.5);
  const [neck, setNeck] = useState(false);
  const [seed, setSeed] = useState(7);
  const [share, setShare] = useState<{ value: number; runs: number; n: number; p0: number } | null>(null);

  const paths = useMemo(() => simulate(seed, n, p0, neck), [seed, n, p0, neck]);
  const finals = paths.map(path => path[GENS]);
  const fixed = finals.filter(p => p >= 1).length;
  const lost = finals.filter(p => p <= 0).length;
  // Средна хетерозиготност 2pq във всички популации и очакваната по формулата
  const hNow = finals.reduce((s, p) => s + 2 * p * (1 - p), 0) / POPS;
  const h0 = 2 * p0 * (1 - p0);
  const neckFactor = neck ? (1 - 1 / (2 * NECK_N)) ** (NECK_TO - NECK_FROM + 1) : 1;
  const hExp = h0 * (1 - 1 / (2 * n)) ** (neck ? GENS - (NECK_TO - NECK_FROM + 1) : GENS) * neckFactor;

  const gx = (g: number) => GX + (g / GENS) * GW;
  const gy = (p: number) => GY + GH - p * GH;

  const runShare = () => {
    const runs = 500;
    setShare({ value: fixationShare(Math.floor(Math.random() * 1e9), n, p0, runs), runs, n, p0 });
  };

  let note: string;
  if (neck) note = `През тясното гърло минават само ${NECK_N} индивида (${2 * NECK_N} алела) – честотите скачат рязко и много популации губят алел наведнъж. След това популацията пак е голяма, но изгубеното разнообразие не се връща.`;
  else if (n <= 10) note = 'В малка популация случайността е огромна: за няколко десетки поколения почти всяка популация губи единия алел. Кой от двата – решава случаят, не ползата.';
  else if (n >= 200) note = 'В голяма популация дрейфът е бавен – за 100 поколения честотите се променят малко. Затова в големите популации отборът надделява над случайността.';
  else note = 'Всички популации започват еднакво и живеят при еднакви условия – алелите са неутрални. Разликите между тях идват само от случайния избор кои индивиди ще оставят потомство.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 236" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {neck && <rect x={gx(NECK_FROM)} y={GY} width={gx(NECK_TO) - gx(NECK_FROM)} height={GH} fill="#f59e0b" opacity={0.15} />}
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX + GW} y1={gy(1)} y2={gy(1)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
        {[0, 0.5, 1].map(v => (
          <text key={v} x={GX - 5} y={gy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
            {fmt(v, 1)}
          </text>
        ))}
        {[0, 25, 50, 75, 100].map(g => (
          <text key={g} x={gx(g)} y={gy(0) + 15} fontSize="11" textAnchor="middle" fill="currentColor">
            {g}
          </text>
        ))}
        <text x={GX + GW} y={gy(0) + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          поколение
        </text>
        <text x={GX + 6} y={GY + 12} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          честота на алела A
        </text>
        {neck && (
          <text x={(gx(NECK_FROM) + gx(NECK_TO)) / 2} y={gy(0) - 6} fontSize="10" textAnchor="middle" fill="#b45309">
            тясно гърло
          </text>
        )}
        {paths.map((path, i) => (
          <polyline
            key={i}
            points={path.map((p, g) => `${gx(g).toFixed(1)},${gy(p).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={COLORS[i]}
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity={0.85}
          />
        ))}
      </LabSvg>

      <Sliders>
        <Slider label="N" value={n} onChange={setN} min={2} max={300} step={1} tone="rose" />
        <Slider label="p₀" value={p0} onChange={setP0} min={0.05} max={0.95} step={0.05} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>🎲 Нови 10 популации</DiagramButton>
        <DiagramButton active={neck} onClick={() => setNeck(!neck)}>
          {neck ? '✓ ' : ''}тясно гърло
        </DiagramButton>
        <DiagramButton onClick={runShare}>🔁 500 популации до края</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'фиксиран A', value: `${fixed} от ${POPS}`, tone: 'rose' },
            { label: 'изгубен A', value: `${lost} от ${POPS}`, tone: 'blue' },
            { label: 'H след 100 пок.', value: fmt(hNow, 3) },
            { label: 'очаквано H', value: fmt(hExp, 3) },
          ]}
        />
      </div>
      {share && share.n === n && share.p0 === p0 && (
        <Note tone="emerald">
          От {share.runs} популации с N = {share.n} алелът A се е фиксирал в {fmt(share.value * 100, 1)}% – близо до началната му честота {fmt(share.p0 * 100, 0)}%.
        </Note>
      )}
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Модел на Райт–Фишър: популация от N диплоидни индивида, всяко поколение 2N алела се избират случайно (с връщане) от алелите на
        предишното. Хетерозиготността H = 2pq намалява средно с множител (1 − 1/2N) на поколение. Вероятността неутрален алел да се
        фиксира е равна на началната му честота.
      </p>
    </div>
  );
}
