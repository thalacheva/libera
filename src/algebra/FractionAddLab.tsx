import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { FractionBar } from './FractionBar';
import { fracText, lcm, mixed } from './fractionMath';

const BLUE = 'fill-blue-400/70 dark:fill-blue-500/60';
const ROSE = 'fill-rose-400/70 dark:fill-rose-500/60';
const EMERALD = 'fill-emerald-400/70 dark:fill-emerald-500/60';

/** a/b ± c/d: привеждане към общ знаменател, нагледно. */
export default function FractionAddLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1);
  const [d, setD] = useState(3);
  const [op, setOp] = useState<'+' | '−'>('+');

  const L = lcm(b, d);
  const p = (a * L) / b;
  const q = (c * L) / d;
  const r = op === '+' ? p + q : p - q;
  const mix = r > 0 ? mixed(r, L) : null;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">➕ Общ знаменател</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Половинки и третинки не могат да се съберат директно – те са различни „мерки“. Нарязваме и двете на шестинки и вече можем да броим.
      </p>

      <Buttons>
        {(['+', '−'] as const).map(o => (
          <DiagramButton key={o} active={o === op} onClick={() => setOp(o)}>
            <span className="font-mono">{o}</span>
          </DiagramButton>
        ))}
      </Buttons>

      <div className="grid sm:grid-cols-2 gap-x-6 mt-3">
        <div>
          <FractionBar d={b} runs={[{ parts: a, className: BLUE }]} label={`${a}/${b}`} />
          <Sliders>
            <Slider label="a" value={a} onChange={setA} min={1} max={b} step={1} tone="blue" />
            <Slider label="b" value={b} onChange={v => { setB(v); setA(Math.min(a, v)); }} min={2} max={10} step={1} tone="blue" />
          </Sliders>
        </div>
        <div>
          <FractionBar d={d} runs={[{ parts: c, className: ROSE }]} label={`${c}/${d}`} />
          <Sliders>
            <Slider label="c" value={c} onChange={setC} min={1} max={d} step={1} tone="rose" />
            <Slider label="d" value={d} onChange={v => { setD(v); setC(Math.min(c, v)); }} min={2} max={10} step={1} tone="rose" />
          </Sliders>
        </div>
      </div>

      <div className="mt-4">
        <FractionBar d={L} runs={[{ parts: p, className: BLUE }]} label={`${a}/${b} = ${p}/${L}`} />
        <FractionBar d={L} runs={[{ parts: q, className: ROSE }]} label={`${c}/${d} = ${q}/${L}`} />
        {r >= 0 ? (
          op === '+' ? (
            <FractionBar d={L} runs={[{ parts: p, className: BLUE }, { parts: q, className: ROSE }]} label={`сбор: ${r}/${L}`} />
          ) : (
            <FractionBar d={L} runs={[{ parts: r, className: EMERALD }]} label={`разлика: ${r}/${L}`} />
          )
        ) : (
          <Note tone="rose">Разликата е отрицателна – изважда се повече, отколкото има.</Note>
        )}
      </div>

      <Formula>
        {a}/{b} {op} {c}/{d} = {p}/{L} {op} {q}/{L} = {r < 0 ? `−${-r}` : r}/{L}
        {fracText(r, L) !== `${r < 0 ? `−${-r}` : r}/${L}` ? ` = ${fracText(r, L)}` : ''}
        {mix ? ` = ${mix}` : ''}
      </Formula>
      <Note tone="gray">
        Общият знаменател е НОК({b}, {d}) = {L}. Допълнителните множители са {L / b} и {L / d}.
      </Note>
    </div>
  );
}
