import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { num, polynomial } from './functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from './plot';

type Rel = '>' | '≥' | '<' | '≤';
const RELS: Rel[] = ['>', '≥', '<', '≤'];
const X_MIN = -8;
const X_MAX = 8;

/** Знак на квадратния тричлен и решаване на квадратни неравенства. */
export function SignLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-6);
  const [rel, setRel] = useState<Rel>('<');

  const f = (x: number) => a * x * x + b * x + c;
  const D = b * b - 4 * a * c;
  const roots = a === 0 ? [] : D > 1e-9 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q) : Math.abs(D) <= 1e-9 ? [-b / (2 * a)] : [];
  const strict = rel === '>' || rel === '<';
  const wantPos = rel === '>' || rel === '≥';
  const ok = (x: number) => (wantPos ? (strict ? f(x) > 1e-9 : f(x) >= -1e-9) : strict ? f(x) < -1e-9 : f(x) <= 1e-9);

  // Отсечки по оста Ox, в които неравенството е вярно
  const segs: [number, number][] = [];
  const cuts = [X_MIN, ...roots.filter(r => r > X_MIN && r < X_MAX), X_MAX];
  for (let i = 0; i < cuts.length - 1; i++) {
    const mid = (cuts[i] + cuts[i + 1]) / 2;
    if (ok(mid)) segs.push([cuts[i], cuts[i + 1]]);
  }

  // Отговор в интервален запис
  const r = roots.map(v => num(v));
  const L = strict ? '(' : '[';
  const R = strict ? ')' : ']';
  let answer = '';
  if (roots.length === 2) {
    const inside = a > 0 !== wantPos; // между корените
    answer = inside ? `x ∈ ${L}${r[0]}; ${r[1]}${R}` : `x ∈ (−∞; ${r[0]}${R} ∪ ${L}${r[1]}; +∞)`;
  } else if (roots.length === 1) {
    const signAll = a > 0 ? 1 : -1; // знакът навсякъде извън корена
    if ((wantPos && signAll > 0) || (!wantPos && signAll < 0)) answer = strict ? `x ≠ ${r[0]}` : 'x – всяко реално число';
    else answer = strict ? 'няма решение' : `x = ${r[0]}`;
  } else {
    answer = (a > 0) === wantPos ? 'x – всяко реално число' : 'няма решение';
  }

  return (
    <Plot
      x={[X_MIN, X_MAX]}
      y={[-8, 8]}
      hint="Зелено – там, където неравенството е изпълнено. Знакът на параболата се сменя само в нулите ѝ: извън тях е знакът на a, а между тях – обратният."
      readout={
        <>
          <Buttons>
            {RELS.map(s => (
              <DiagramButton key={s} active={s === rel} onClick={() => setRel(s)}>
                f(x) {s} 0
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="a" value={a} onChange={v => setA(v === 0 ? 0.5 : v)} min={-2} max={2} step={0.5} tone="blue" />
            <Slider label="b" value={b} onChange={setB} min={-6} max={6} step={1} tone="violet" />
            <Slider label="c" value={c} onChange={setC} min={-8} max={8} step={1} tone="emerald" />
          </Sliders>
          <Formula>
            {polynomial([a, b, c])} {rel} 0
          </Formula>
          <Note tone="emerald">
            D = {num(D)} · {roots.length === 2 ? `нули ${r[0]} и ${r[1]}` : roots.length === 1 ? `двойна нула ${r[0]}` : 'няма нули'} ⇒ {answer}
          </Note>
        </>
      }
    >
      {segs.map(([p, q], i) => (
        <PlotLine key={i} p={{ x: p, y: 0 }} q={{ x: q, y: 0 }} tone="emerald" width={7} />
      ))}
      <Curve f={f} tone="blue" />
      {roots.map((x, i) => (
        <g key={i}>
          <PlotDot p={{ x, y: 0 }} tone={strict ? 'gray' : 'emerald'} r={6} />
          <PlotLabel p={{ x, y: 0 }} dy={i === 0 ? -12 : 20} tone="ink" size={12}>
            {num(x)}
          </PlotLabel>
        </g>
      ))}
    </Plot>
  );
}
