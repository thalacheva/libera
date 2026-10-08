import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Kind = 'arith' | 'geom';
const W = 600;
const H = 240;
const MID = H / 2;

/** Членовете на аритметична и геометрична прогресия. */
export default function SequenceLab() {
  const [kind, setKind] = useState<Kind>('arith');
  const [a1, setA1] = useState(2);
  const [d, setD] = useState(3);
  const [q, setQ] = useState(2);
  const [n, setN] = useState(8);

  const terms = Array.from({ length: n }, (_, i) => (kind === 'arith' ? a1 + i * d : a1 * q ** i));
  const sum = terms.reduce((s, t) => s + t, 0);
  const max = Math.max(1, ...terms.map(Math.abs));
  const hasNeg = terms.some(t => t < 0);
  const base = hasNeg ? MID : H - 30;
  const scale = (hasNeg ? MID - 26 : H - 60) / max;
  const step = (W - 40) / n;
  const bw = step * 0.62;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📶 Членовете на прогресията</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        При аритметичната прогресия всеки следващ член се получава с <strong>прибавяне</strong> на d, при геометричната – с{' '}
        <strong>умножение</strong> по q. Сравни как растат стълбовете.
      </p>
      <Buttons>
        <DiagramButton active={kind === 'arith'} onClick={() => setKind('arith')}>
          аритметична (+d)
        </DiagramButton>
        <DiagramButton active={kind === 'geom'} onClick={() => setKind('geom')}>
          геометрична (·q)
        </DiagramButton>
      </Buttons>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        <line x1={20} x2={W - 20} y1={base} y2={base} stroke="currentColor" strokeOpacity="0.4" />
        {terms.map((t, i) => {
          const x = 20 + i * step + (step - bw) / 2;
          const h = Math.abs(t) * scale;
          const y = t >= 0 ? base - h : base;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={Math.max(h, 1)} rx={3} className={t >= 0 ? 'fill-indigo-500' : 'fill-rose-500'} />
              <text x={x + bw / 2} y={t >= 0 ? y - 6 : y + h + 15} fontSize={n > 9 ? 11 : 13} fontWeight="700" textAnchor="middle" fill="currentColor">
                {num(t, 2)}
              </text>
              <text x={x + bw / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.6">
                a{i + 1 <= 9 ? '₁₂₃₄₅₆₇₈₉'[i] : `${i + 1}`}
              </text>
            </g>
          );
        })}
      </svg>

      <Sliders>
        <Slider label="a₁" value={a1} onChange={setA1} min={-5} max={5} step={1} tone="violet" />
        {kind === 'arith' ? (
          <Slider label="d" value={d} onChange={setD} min={-4} max={4} step={0.5} tone="emerald" />
        ) : (
          <Slider label="q" value={q} onChange={v => setQ(v === 0 ? 0.5 : v)} min={-2} max={3} step={0.5} tone="emerald" />
        )}
        <Slider label="n" value={n} onChange={setN} min={3} max={10} step={1} tone="gray" />
      </Sliders>

      {kind === 'arith' ? (
        <>
          <Formula>
            aₙ = a₁ + (n − 1)d ⇒ a{n} = {num(a1)} + {n - 1} · {num(d)} = {num(terms[n - 1])}
          </Formula>
          <Formula>
            Sₙ = n(a₁ + aₙ)/2 = {n} · ({num(a1)} + {num(terms[n - 1])})/2 = {num(sum)}
          </Formula>
        </>
      ) : (
        <>
          <Formula>
            aₙ = a₁ · qⁿ⁻¹ ⇒ a{n} = {num(a1)} · {num(q)}^{n - 1} = {num(terms[n - 1])}
          </Formula>
          <Formula>
            Sₙ = a₁(qⁿ − 1)/(q − 1) = {num(sum)}
            {q === 1 ? ' (при q = 1 просто n · a₁)' : ''}
          </Formula>
          {q < 0 && <Note tone="rose">При q &lt; 0 знаците се редуват: +, −, +, −…</Note>}
          {Math.abs(q) < 1 && <Note tone="emerald">При |q| &lt; 1 членовете намаляват към 0 – вижте раздел 4.</Note>}
        </>
      )}
    </div>
  );
}
