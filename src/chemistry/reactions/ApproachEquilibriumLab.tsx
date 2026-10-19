import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// A ⇌ B, и двете посоки от първи порядък: v→ = k₁[A], v← = k₂[B].
// Решението е точно: [A](t) = [A]∞ + ([A]₀ − [A]∞)·e^(−(k₁+k₂)t), [A] + [B] = const.
const STARTS: { name: string; a0: number }[] = [
  { name: 'започваме само с A', a0: 1 },
  { name: 'започваме само с B', a0: 0 },
  { name: 'смес 50 : 50', a0: 0.5 },
];

const T_MAX = 10; // секунди
const L = 46;
const R = 466;
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** Графика със собствена ос y; две криви и маркер за избрания момент. */
function Chart({
  top,
  height,
  yMax,
  yLabel,
  ticks,
  curves,
  t,
}: {
  top: number;
  height: number;
  yMax: number;
  yLabel: string;
  ticks: number[];
  curves: { f: (t: number) => number; color: string; name: string }[];
  t: number;
}) {
  const bottom = top + height;
  const xAt = (s: number) => L + (s / T_MAX) * (R - L);
  const yAt = (v: number) => bottom - (v / yMax) * height;
  const steps = 200;
  return (
    <g>
      {ticks.map(v => (
        <g key={v}>
          <line x1={L} x2={R} y1={yAt(v)} y2={yAt(v)} className="stroke-gray-100 dark:stroke-gray-700" />
          <text x={L - 6} y={yAt(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
            {String(v).replace('.', ',')}
          </text>
        </g>
      ))}
      <line x1={L} x2={R} y1={bottom} y2={bottom} className="stroke-gray-400" strokeWidth="1.5" />
      <line x1={L} x2={L} y1={top} y2={bottom} className="stroke-gray-400" strokeWidth="1.5" />
      <text x={L + 6} y={top + 2} fontSize="12" fontWeight="600" fill="currentColor">
        {yLabel}
      </text>
      {curves.map(c => (
        <polyline
          key={c.name}
          points={Array.from({ length: steps + 1 }, (_, i) => {
            const s = (T_MAX * i) / steps;
            return `${xAt(s).toFixed(1)},${yAt(c.f(s)).toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke={c.color}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
      <line x1={xAt(t)} x2={xAt(t)} y1={top} y2={bottom} className="stroke-gray-500" strokeDasharray="4 4" />
      {curves.map(c => (
        <circle key={c.name} cx={xAt(t)} cy={yAt(c.f(t))} r={5} fill={c.color} className="stroke-white dark:stroke-gray-800" strokeWidth="2" />
      ))}
      {/* Надписите на кривите – вдясно, разделени, ако стойностите са близки */}
      {(() => {
        // Надписът стои над кривата; ако кривите са близо, долният слиза под нея
        const ends = curves.map(c => ({ ...c, y: yAt(c.f(T_MAX)) - 8 }));
        if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 16) {
          const mid = (ends[0].y + ends[1].y) / 2 + 8;
          const upper = ends[0].y <= ends[1].y ? 0 : 1;
          ends[upper].y = Math.max(top + 12, mid - 8);
          ends[1 - upper].y = mid + 16;
        }
        return ends.map(c => (
          <text key={c.name} x={R - 4} y={c.y} fontSize="12" fontWeight="700" textAnchor="end" fill={c.color}>
            {c.name}
          </text>
        ));
      })()}
    </g>
  );
}

/** Приближаване към равновесие: концентрациите и скоростите на правата и обратната реакция с времето. */
export default function ApproachEquilibriumLab() {
  const [start, setStart] = useState(0);
  const [k1, setK1] = useState(0.6);
  const [k2, setK2] = useState(0.3);
  const [t, setT] = useState(1);

  const a0 = STARTS[start].a0;
  const total = 1;
  const aEq = (k2 * total) / (k1 + k2);
  const A = (s: number) => aEq + (a0 - aEq) * Math.exp(-(k1 + k2) * s);
  const B = (s: number) => total - A(s);
  const vf = (s: number) => k1 * A(s);
  const vr = (s: number) => k2 * B(s);

  // Скоростите се менят монотонно – най-голямата е в началото
  const vMax = Math.max(0.5, Math.ceil(Math.max(vf(0), vr(0)) * 2) / 2);
  const K = k1 / k2;
  const Q = A(t) > 1e-12 ? B(t) / A(t) : Infinity;
  const equal = Math.abs(vf(t) - vr(t)) < 0.01;
  // Време, след което скоростите се различават с по-малко от 0,01 mol/(L·s)
  const diff0 = Math.abs(vf(0) - vr(0));
  const tEq = diff0 <= 0.01 ? 0 : Math.log(diff0 / 0.01) / (k1 + k2);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {STARTS.map((s, i) => (
          <DiagramButton key={s.name} active={i === start} onClick={() => setStart(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 350" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Chart
          top={20}
          height={130}
          yMax={1}
          yLabel="концентрация, mol/L"
          ticks={[0, 0.5, 1]}
          curves={[
            { f: A, color: '#2563eb', name: '[A]' },
            { f: B, color: '#e11d48', name: '[B]' },
          ]}
          t={t}
        />
        <Chart
          top={190}
          height={120}
          yMax={vMax}
          yLabel="скорост, mol/(L·s)"
          ticks={[0, vMax / 2, vMax]}
          curves={[
            { f: vf, color: '#059669', name: 'v→' },
            { f: vr, color: '#d97706', name: 'v←' },
          ]}
          t={t}
        />
        {[0, 2, 4, 6, 8, 10].map(s => (
          <text key={s} x={L + (s / T_MAX) * (R - L)} y={326} fontSize="11" textAnchor="middle" fill="currentColor">
            {s}
          </text>
        ))}
        <text x={(L + R) / 2} y={344} fontSize="12" textAnchor="middle" fill="currentColor">
          време, s
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="k₁ (→)" value={k1} onChange={setK1} min={0.1} max={2} step={0.1} tone="emerald" />
        <Slider label="k₂ (←)" value={k2} onChange={setK2} min={0.1} max={2} step={0.1} tone="amber" />
        <Slider label="t, s" value={t} onChange={setT} min={0} max={10} step={0.1} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: '[A] =', value: fmt(A(t)), tone: 'blue' },
            { label: '[B] =', value: fmt(B(t)), tone: 'rose' },
            { label: 'v→ =', value: fmt(vf(t), 3), tone: 'emerald' },
            { label: 'v← =', value: fmt(vr(t), 3), tone: 'amber' },
            { label: 'Q = [B]/[A] =', value: Number.isFinite(Q) ? fmt(Q) : '∞' },
            { label: 'K = k₁/k₂ =', value: fmt(K) },
          ]}
        />
      </div>
      <Note tone={equal ? 'emerald' : 'amber'}>
        {equal
          ? `Равновесие: v→ = v←, концентрациите вече не се променят (след около ${fmt(tEq, 1)} s). Но реакцията не е спряла – в двете посоки текат по ${fmt(vf(t), 2)} mol/(L·s).`
          : Q < K
            ? 'Q < K: правата реакция е по-бърза – B се трупа, докато скоростите се изравнят.'
            : 'Q > K: обратната реакция е по-бърза – A се трупа, докато скоростите се изравнят.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Каквото и да е началото – само A, само B или смес – системата стига до едно и също отношение <span className="whitespace-nowrap">[B]/[A] = k₁/k₂ = K</span>. Промени k₁ и k₂ заедно в
        едно и също отношение (например 0,6 и 0,3 → 1,2 и 0,6): равновесието се достига по-бързо, но на същото място. Точно така действа катализаторът.
      </p>
    </div>
  );
}
