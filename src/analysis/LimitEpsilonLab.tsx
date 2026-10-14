import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';

type Seq = { name: string; a: (n: number) => number; L: number | null; y: [number, number] };

const SEQS: Seq[] = [
  { name: '1 + 1/n', a: n => 1 + 1 / n, L: 1, y: [0.5, 2.1] },
  { name: '1 + (−1)ⁿ/n', a: n => 1 + (-1) ** n / n, L: 1, y: [-0.15, 1.65] },
  { name: '0,8ⁿ', a: n => 0.8 ** n, L: 0, y: [-0.35, 0.9] },
  { name: '(−1)ⁿ', a: n => (-1) ** n, L: null, y: [-1.6, 1.6] },
];

const N_MAX = 40;
const X0 = 40;
const X1 = 462;
const Y0 = 22;
const Y1 = 228;

/** Най-малкото N, от което нататък всички членове са в ивицата (L − ε; L + ε). */
function firstN(s: Seq, L: number, eps: number) {
  let last = 0;
  // строго |aₙ − L| < ε; допускът пази от закръглянето (1,2 − 1 = 0,19999… < 0,2)
  for (let n = 1; n <= 5000; n++) if (Math.abs(s.a(n) - L) >= eps - 1e-9) last = n;
  return last === 5000 ? null : last + 1;
}

/** Ивицата с ширина 2ε около границата: от някой номер N нататък всички членове на редицата са в нея. */
export default function LimitEpsilonLab() {
  const [k, setK] = useState(0);
  const [eps, setEps] = useState(0.2);
  const s = SEQS[k];
  const L = s.L ?? 1;
  const e = Math.round(eps * 100) / 100;
  const N = s.L === null ? null : firstN(s, L, e);

  const sx = (n: number) => X0 + ((X1 - X0) * n) / N_MAX;
  const sy = (v: number) => Y1 - ((Y1 - Y0) * (v - s.y[0])) / (s.y[1] - s.y[0]);
  const clampY = (v: number) => Math.min(Y1, Math.max(Y0, sy(v)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 262">
        {/* Ивицата */}
        <rect x={X0} y={clampY(L + e)} width={X1 - X0} height={clampY(L - e) - clampY(L + e)} className={s.L === null ? 'fill-rose-500/10' : 'fill-emerald-500/15'} />
        <line x1={X0} y1={sy(L)} x2={X1} y2={sy(L)} className={s.L === null ? 'stroke-rose-400' : 'stroke-emerald-600'} strokeWidth={1.5} />
        {[L + e, L - e].map(v => (
          <line key={v} x1={X0} y1={clampY(v)} x2={X1} y2={clampY(v)} className="stroke-gray-400" strokeDasharray="4 4" />
        ))}
        <Label p={{ x: X0 - 6, y: sy(L) }} size={11} anchor="end" tone={s.L === null ? 'rose' : 'emerald'}>
          {s.L === null ? '1?' : num(L)}
        </Label>
        <Label p={{ x: X1, y: clampY(L + e) - 9 }} size={10} anchor="end" weight={500}>
          L + ε
        </Label>
        <Label p={{ x: X1, y: clampY(L - e) + 9 }} size={10} anchor="end" weight={500}>
          L − ε
        </Label>

        {/* Оси */}
        <line x1={X0} y1={Y1 + 8} x2={X1 + 6} y2={Y1 + 8} className="stroke-gray-400" strokeWidth={1.5} />
        {[1, 10, 20, 30, 40].map(n => (
          <Label key={n} p={{ x: sx(n), y: Y1 + 22 }} size={11} weight={500}>
            {String(n)}
          </Label>
        ))}
        <Label p={{ x: X1 + 10, y: Y1 + 12 }} size={12} anchor="start" tone="ink" weight={700}>
          n
        </Label>

        {/* Номерът N */}
        {N !== null && N <= N_MAX && (
          <>
            <line x1={sx(N) - 5} y1={Y0 - 6} x2={sx(N) - 5} y2={Y1 + 8} className="stroke-blue-500" strokeDasharray="5 4" strokeWidth={1.5} />
            <Label p={{ x: N > 30 ? sx(N) - 9 : sx(N) - 1, y: Y0 - 10 }} size={11} anchor={N > 30 ? 'end' : 'start'} tone="blue">
              N = {N}
            </Label>
          </>
        )}

        {/* Членовете */}
        {Array.from({ length: N_MAX }, (_, i) => i + 1).map(n => {
          const v = s.a(n);
          const inside = Math.abs(v - L) < e - 1e-9;
          return (
            <circle
              key={n}
              cx={sx(n)}
              cy={clampY(v)}
              r={3.6}
              className={inside ? 'fill-emerald-500' : 'fill-rose-500'}
              stroke="white"
              strokeWidth={1}
            />
          );
        })}
      </ZoomingSvg>

      <Buttons>
        {SEQS.map((q, i) => (
          <DiagramButton key={q.name} active={i === k} onClick={() => setK(i)}>
            aₙ = {q.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="ε" value={eps} onChange={setEps} min={0.02} max={0.6} step={0.01} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ε =', value: num(e), tone: 'emerald' },
            { label: 'граница L =', value: s.L === null ? 'няма' : num(L) },
            { label: 'N =', value: N === null ? '—' : String(N), tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={s.L === null ? 'rose' : N !== null && N > N_MAX ? 'amber' : 'emerald'}>
        {s.L === null
          ? 'Членовете скачат между −1 и 1. Ивица с ε < 1 не може да ги побере – около никое число L. Редицата няма граница.'
          : N !== null && N > N_MAX
            ? `N = ${N} е извън чертежа: колкото по-тясна е ивицата, толкова по-далеч трябва да отидем.`
            : `От ${N}-ия член нататък всички членове са в ивицата – колкото и тясна да я направиш, такова N има.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Зелените точки са в ивицата (L − ε; L + ε), червените – извън нея. Намаляй ε: N расте, но винаги съществува. Точно това означава, че
        редицата клони към L. Отделни членове може да са извън ивицата – важното е, че от някой номер нататък всички са вътре.
      </p>
    </div>
  );
}
