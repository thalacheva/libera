import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Cls = { name: string; color: string; wrinkled: boolean };

const YR: Cls = { name: 'жълти кръгли', color: '#facc15', wrinkled: false };
const YW: Cls = { name: 'жълти набръчкани', color: '#facc15', wrinkled: true };
const GR: Cls = { name: 'зелени кръгли', color: '#84cc16', wrinkled: false };
const GW: Cls = { name: 'зелени набръчкани', color: '#84cc16', wrinkled: true };
const Y: Cls = { name: 'жълти', color: '#facc15', wrinkled: false };
const G: Cls = { name: 'зелени', color: '#84cc16', wrinkled: false };

type Source = { id: string; name: string; classes: Cls[]; probs: number[]; hyp: number[]; hypName: string; note: string };

const SOURCES: Source[] = [
  {
    id: 'mono',
    name: 'Aa × Aa',
    classes: [Y, G],
    probs: [3 / 4, 1 / 4],
    hyp: [3, 1],
    hypName: '3 : 1',
    note: 'Хипотезата е вярна. Повечето посеви минават теста, но при около 5% от тях χ² случайно надхвърля критичната стойност.',
  },
  {
    id: 'test',
    name: 'Aa × aa',
    classes: [Y, G],
    probs: [1 / 2, 1 / 2],
    hyp: [1, 1],
    hypName: '1 : 1',
    note: 'Анализиращо кръстосване – очакваме 1 : 1. Хипотезата е вярна, затова отхвърлянията са рядкост (около 5%).',
  },
  {
    id: 'di',
    name: 'AaBb × AaBb',
    classes: [YR, YW, GR, GW],
    probs: [9 / 16, 3 / 16, 3 / 16, 1 / 16],
    hyp: [9, 3, 3, 1],
    hypName: '9 : 3 : 3 : 1',
    note: 'Двата гена са на различни хромозоми и се разпределят независимо – 9 : 3 : 3 : 1 е вярната хипотеза.',
  },
  {
    id: 'linked',
    name: 'скачени гени',
    classes: [YR, YW, GR, GW],
    // AB/ab × AB/ab, честота на рекомбинация 20%: гаметата ab има честота q = 0,4
    probs: [0.5 + 0.16, 0.25 - 0.16, 0.25 - 0.16, 0.16],
    hyp: [9, 3, 3, 1],
    hypName: '9 : 3 : 3 : 1',
    note: 'Тук гените са на една хромозома, на 20 cM един от друг (родителите са AB/ab). Хипотезата за независимо разпределение е грешна – при голям посев тестът почти винаги я отхвърля, а при малък може да не забележи разликата.',
  },
];

// Критични стойности на χ² при ниво 0,05
const CRITICAL: Record<number, number> = { 1: 3.84, 2: 5.99, 3: 7.81 };

// жълти кръгли, жълти набръчкани, зелени кръгли, зелени набръчкани
const MENDEL = [315, 101, 108, 32];

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

function sow(probs: number[], n: number) {
  const counts = probs.map(() => 0);
  for (let i = 0; i < n; i++) {
    let u = Math.random();
    let k = 0;
    while (k < probs.length - 1 && u >= probs[k]) {
      u -= probs[k];
      k++;
    }
    counts[k]++;
  }
  return counts;
}

function chiSquare(observed: number[], hyp: number[]) {
  const n = observed.reduce((a, b) => a + b, 0);
  const total = hyp.reduce((a, b) => a + b, 0);
  const expected = hyp.map(h => (n * h) / total);
  const parts = observed.map((o, i) => (o - expected[i]) ** 2 / expected[i]);
  return { n, expected, parts, chi: parts.reduce((a, b) => a + b, 0) };
}

function Pea({ x, y, r, cls }: { x: number; y: number; r: number; cls: Cls }) {
  if (!cls.wrinkled) return <circle cx={x} cy={y} r={r} fill={cls.color} stroke="#4d7c0f" strokeWidth={1.2} />;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    const rr = r * (i % 2 === 0 ? 1 : 0.8);
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  });
  return <polygon points={pts.join(' ')} fill={cls.color} stroke="#4d7c0f" strokeWidth={1.2} strokeLinejoin="round" />;
}

/** Градина с грах: посяваш N растения, броиш класовете и проверяваш хипотезата с χ². */
export default function PeaGardenLab() {
  const [sourceId, setSourceId] = useState('di');
  const [n, setN] = useState(560);
  // Отначало – истинските данни на Мендел от дихибридното кръстосване
  const [observed, setObserved] = useState<number[]>(MENDEL);
  const [isMendel, setIsMendel] = useState(true);
  const [repeat, setRepeat] = useState<{ rejected: number; runs: number } | null>(null);

  const source = SOURCES.find(s => s.id === sourceId)!;
  const { n: total, expected, parts, chi } = chiSquare(observed, source.hyp);
  const df = source.hyp.length - 1;
  const critical = CRITICAL[df];
  const rejected = chi > critical;

  const doSow = (s: Source, size: number) => {
    setObserved(sow(s.probs, size));
    setIsMendel(false);
    setRepeat(null);
  };

  const repeatMany = () => {
    let count = 0;
    const runs = 200;
    for (let r = 0; r < runs; r++) if (chiSquare(sow(source.probs, n), source.hyp).chi > critical) count++;
    setRepeat({ rejected: count, runs });
  };

  // Стълбчеста диаграма: наблюдавани (плътни) и очаквани (пунктир)
  const W = 480;
  const H = 214;
  const base = 150;
  const maxV = Math.max(...observed, ...expected) * 1.1;
  const groupW = (W - 40) / source.classes.length;
  const scale = (v: number) => (v / maxV) * 120;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SOURCES.map(s => (
          <DiagramButton
            key={s.id}
            active={sourceId === s.id}
            onClick={() => {
              setSourceId(s.id);
              doSow(s, n);
            }}
          >
            <span className={s.id === 'linked' ? undefined : 'font-serif italic'}>{s.name}</span>
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <line x1={20} x2={W - 20} y1={base} y2={base} className="stroke-gray-400" />
        {source.classes.map((c, i) => {
          const cx = 20 + groupW * (i + 0.5);
          const bw = Math.min(40, groupW / 3);
          return (
            <g key={c.name}>
              <rect x={cx - bw - 2} y={base - scale(observed[i])} width={bw} height={scale(observed[i])} rx={3} fill={c.color} stroke="#4d7c0f" strokeWidth={1} />
              <rect
                x={cx + 2}
                y={base - scale(expected[i])}
                width={bw}
                height={scale(expected[i])}
                rx={3}
                fill="none"
                className="stroke-gray-500 dark:stroke-gray-400"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text x={cx - bw / 2 - 2} y={base - scale(observed[i]) - 5} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">
                {observed[i]}
              </text>
              <text x={cx + bw / 2 + 2} y={base - scale(expected[i]) - 5} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {fmt(expected[i], 1)}
              </text>
              <Pea x={cx} y={base + 17} r={8} cls={c} />
              {c.name.split(' ').map((word, k) => (
                <text key={word} x={cx} y={base + 41 + k * 14} fontSize="11.5" textAnchor="middle" fill="currentColor">
                  {word}
                </text>
              ))}
            </g>
          );
        })}
        <text x={20} y={16} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          плътно – преброени, пунктир – очаквани по хипотезата {source.hypName}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label={`N = ${n}`} value={n} onChange={v => setN(v)} min={20} max={2000} step={20} tone="emerald" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => doSow(source, n)}>🌱 Посей {n} растения</DiagramButton>
        <DiagramButton onClick={repeatMany}>🔁 Повтори 200 пъти</DiagramButton>
      </Buttons>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm border-collapse max-w-xl mx-auto">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700">клас</th>
              <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">O</th>
              <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">E</th>
              <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">(O − E)²/E</th>
            </tr>
          </thead>
          <tbody>
            {source.classes.map((c, i) => (
              <tr key={c.name}>
                <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">{c.name}</td>
                <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono">{observed[i]}</td>
                <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono">{fmt(expected[i], 1)}</td>
                <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono">{fmt(parts[i], 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'N', value: total },
            { label: 'χ²', value: fmt(chi, 2), tone: rejected ? 'rose' : 'emerald' },
            { label: 'степени на свобода', value: df },
            { label: 'критична (0,05)', value: fmt(critical, 2) },
          ]}
        />
        {repeat && <Readout items={[{ label: 'отхвърлена', value: `${repeat.rejected} от ${repeat.runs} пъти (${Math.round((100 * repeat.rejected) / repeat.runs)}%)`, tone: 'violet' }]} />}
      </div>
      <Note tone={rejected ? 'rose' : 'emerald'}>
        {rejected
          ? `χ² = ${fmt(chi)} > ${fmt(critical)}: отклонението е твърде голямо, за да е случайно – отхвърляме хипотезата ${source.hypName}.`
          : `χ² = ${fmt(chi)} < ${fmt(critical)}: отклонението може да е случайно – нямаме основание да отхвърлим хипотезата ${source.hypName}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {isMendel ? 'Отначало са истинските числа на Мендел от дихибридното кръстосване (556 семена). ' : ''}
        {source.note}
      </p>
    </div>
  );
}
