import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Детерминиран генератор на случайни числа (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PONDS = [
  { name: 'езеро А', n: 320, seed: 11 },
  { name: 'езеро Б', n: 540, seed: 29 },
  { name: 'езеро В', n: 780, seed: 47 },
];

type Mode = 'fair' | 'shy' | 'happy';
const MODES: { id: Mode; name: string; w: number }[] = [
  { id: 'fair', name: 'всички се хващат еднакво', w: 1 },
  { id: 'shy', name: 'маркираните избягват мрежата', w: 0.5 },
  { id: 'happy', name: 'маркираните се хващат по-лесно', w: 2 },
];

/** Риби в езерото: случайни точки в елипса. Рибите с номер < M са маркираните – местата са случайни, затова е все едно кои. */
function fishPositions(n: number, seed: number) {
  const r = rng(seed);
  const pts: { x: number; y: number }[] = [];
  while (pts.length < n) {
    const u = r() * 2 - 1;
    const v = r() * 2 - 1;
    if (u * u + v * v <= 1) pts.push({ x: 195 + u * 175, y: 165 + v * 120 });
  }
  return pts;
}

/** Второ улавяне: C различни риби; маркираните имат тегло w (1 – честно). */
function catchSample(n: number, m: number, c: number, w: number, seed: number) {
  const r = rng(seed);
  const left = Array.from({ length: n }, (_, i) => i);
  const caught: number[] = [];
  for (let k = 0; k < c && left.length; k++) {
    const total = left.reduce((s, i) => s + (i < m ? w : 1), 0);
    let x = r() * total;
    let j = 0;
    for (; j < left.length - 1; j++) {
      x -= left[j] < m ? w : 1;
      if (x < 0) break;
    }
    caught.push(left[j]);
    left.splice(j, 1);
  }
  return caught;
}

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');

const MAXE = 2000;
const GX0 = 430;
const GX1 = 625;
const GY0 = 280;
const GY1 = 40;
const gy = (e: number) => GY0 - (Math.min(e, MAXE) / MAXE) * (GY0 - GY1);

/** Маркиране и повторно улавяне: оценка на числеността по Линкълн–Петерсен и Чапман. */
export default function MarkRecaptureLab() {
  const [pond, setPond] = useState(1);
  const [m, setM] = useState(80);
  const [c, setC] = useState(80);
  const [mode, setMode] = useState<Mode>('fair');
  // семената на поредните вторични улавяния – последното е текущото
  const [seeds, setSeeds] = useState<number[]>([1]);
  const [reveal, setReveal] = useState(false);

  const p = PONDS[pond];
  const w = MODES.find(x => x.id === mode)!.w;
  const fish = useMemo(() => fishPositions(p.n, p.seed), [p]);
  const samples = useMemo(
    () =>
      seeds.map(sd => {
        const caught = catchSample(p.n, m, c, w, p.seed * 1000 + sd);
        const r = caught.filter(i => i < m).length;
        return { caught, r, lp: r ? (m * c) / r : Infinity, ch: ((m + 1) * (c + 1)) / (r + 1) - 1 };
      }),
    [p, m, c, w, seeds]
  );
  const { caught, r: R, lp, ch } = samples[samples.length - 1];
  const caughtSet = new Set(caught);

  const reset = (f: () => void) => {
    f();
    setSeeds(s => [s[s.length - 1] + 1]);
  };
  const again = () => setSeeds(s => [...s, s[s.length - 1] + 1].slice(-21));

  const shown = samples;
  const finite = shown.filter(h => Number.isFinite(h.lp));
  const meanLp = finite.length ? finite.reduce((s, h) => s + h.lp, 0) / finite.length : NaN;
  const meanCh = shown.reduce((s, h) => s + h.ch, 0) / shown.length;
  const gx = (k: number) => GX0 + 12 + k * ((GX1 - GX0 - 20) / 20);

  let msg: string;
  if (R === 0) msg = 'Нито една маркирана риба във второто улавяне – формулата на Линкълн–Петерсен дава безкрайност. Маркирай или улови повече.';
  else if (mode === 'shy') msg = 'Маркираните риби избягват мрежата: R е твърде малко и оценката излиза систематично по-голяма от истината.';
  else if (mode === 'happy') msg = 'Маркираните се хващат по-лесно (например свикват със стръвта): R е твърде голямо и оценката излиза систематично по-малка.';
  else if (R < 7) msg = `Само ${R} маркирани в улова – оценката силно „скача“ от опит на опит. Чапман е по-надежден при малко R.`;
  else msg = `R = ${R}: делът на маркираните в улова (${R}/${c}) е приблизително равен на дела им в езерото (${m}/N).`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <ellipse cx={195} cy={165} rx={185} ry={130} className="fill-sky-100 dark:fill-sky-950" stroke="#0ea5e9" strokeWidth={2} />
        {fish.map((f, i) => {
          const marked = i < m;
          const inNet = caughtSet.has(i);
          return (
            <g key={i}>
              <ellipse cx={f.x} cy={f.y} rx={3.2} ry={1.8} fill={marked ? '#f59e0b' : '#64748b'} opacity={inNet ? 1 : 0.55} />
              {inNet && <circle cx={f.x} cy={f.y} r={4.6} fill="none" stroke={marked ? '#e11d48' : '#2563eb'} strokeWidth={1.4} />}
            </g>
          );
        })}
        <g fontSize="11" fill="currentColor">
          <ellipse cx={20} cy={14} rx={4} ry={2.2} fill="#f59e0b" />
          <text x={30} y={18}>маркирана (M = {m})</text>
          <circle cx={160} cy={14} r={4.6} fill="none" stroke="#2563eb" strokeWidth={1.4} />
          <text x={170} y={18}>във второто улавяне (C = {c})</text>
          <text x={20} y={312}>
            маркирани в улова: R = {R}
          </text>
        </g>

        {/* оценки от поредните опити */}
        <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke="currentColor" />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke="currentColor" />
        {[0, 500, 1000, 1500, 2000].map(v => (
          <g key={v}>
            <line x1={GX0 - 4} x2={GX1} y1={gy(v)} y2={gy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX0 - 6} y={gy(v) + 4} fontSize="10" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={GX0} y={GY1 - 14} fontSize="11" fill="currentColor">оценки на N (опит след опит)</text>
        {Number.isFinite(meanCh) && <line x1={GX0} x2={GX1} y1={gy(meanCh)} y2={gy(meanCh)} stroke="#10b981" strokeDasharray="5 4" strokeWidth={1.5} />}
        {reveal && <line x1={GX0} x2={GX1} y1={gy(p.n)} y2={gy(p.n)} stroke="#e11d48" strokeWidth={2} />}
        {shown.map((h, k) => (
          <g key={k}>
            <circle cx={gx(k)} cy={gy(Number.isFinite(h.lp) ? h.lp : MAXE)} r={3.5} fill="#f59e0b" opacity={k === shown.length - 1 ? 1 : 0.6} />
            <rect x={gx(k) - 3} y={gy(h.ch) - 3} width={6} height={6} fill="#10b981" opacity={k === shown.length - 1 ? 1 : 0.6} />
          </g>
        ))}
        <g fontSize="10">
          <circle cx={GX0 + 8} cy={GY0 + 16} r={3.5} fill="#f59e0b" />
          <text x={GX0 + 15} y={GY0 + 19} fill="#d97706">Линкълн–Петерсен</text>
          <rect x={GX0 + 124} y={GY0 + 13} width={6} height={6} fill="#10b981" />
          <text x={GX0 + 134} y={GY0 + 19} fill="#059669">Чапман</text>
          {reveal && <text x={GX1} y={gy(p.n) - 4} textAnchor="end" fill="#e11d48">истински N = {p.n}</text>}
        </g>
      </LabSvg>

      <Buttons>
        {PONDS.map((x, k) => (
          <DiagramButton key={x.name} active={pond === k} onClick={() => reset(() => { setPond(k); setReveal(false); })}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {MODES.map(x => (
          <DiagramButton key={x.id} active={mode === x.id} onClick={() => reset(() => setMode(x.id))}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="M" value={m} onChange={v => reset(() => setM(v))} min={10} max={200} step={5} tone="amber" />
        <Slider label="C" value={c} onChange={v => reset(() => setC(v))} min={10} max={200} step={5} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={again}>🎣 ново второ улавяне</DiagramButton>
        <DiagramButton active={reveal} onClick={() => setReveal(!reveal)}>
          {reveal ? 'скрий истинския брой' : 'покажи истинския брой'}
        </DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 'R', value: R, tone: 'rose' },
          { label: 'Линкълн–Петерсен', value: Number.isFinite(lp) ? fmt(lp) : '∞', tone: 'amber' },
          { label: 'Чапман', value: fmt(ch), tone: 'emerald' },
          { label: `средно (${shown.length})`, value: Number.isFinite(meanLp) ? `${fmt(meanLp)} / ${fmt(meanCh)}` : '–', tone: 'violet' },
        ]}
      />
      <Formula>
        N ≈ M · C / R = {m} · {c} / {R} = {Number.isFinite(lp) ? fmt(lp) : '∞'}
      </Formula>
      <Note tone="rose">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Първо уловихме M риби, маркирахме ги и ги пуснахме. След като се смесят с останалите, улавяме C риби и броим маркираните
        сред тях – R. Ако всяка риба има еднакъв шанс да попадне в мрежата, R/C ≈ M/N, откъдето N ≈ MC/R. Натискай „ново второ
        улавяне“ и гледай как оценките се разпиляват около истинската стойност – по-малко, когато R е голямо. Методът предполага
        затворена популация (никой не се ражда, не умира, не идва и не си тръгва между двете улавяния), трайни маркировки и
        маркирани животни, които се държат като немаркираните. Опитай и двата режима, в които това не е така.
      </p>
    </div>
  );
}
