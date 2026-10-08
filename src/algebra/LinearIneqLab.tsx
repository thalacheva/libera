import { useState } from 'react';
import { num, polynomial } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { flip, fmtPieces, ray, RELS, type Rel } from './intervals';
import { NumberLine } from './NumberLine';

const holds = (l: number, rel: Rel, r: number) => (rel === '<' ? l < r : rel === '≤' ? l <= r : rel === '>' ? l > r : l >= r);
const par = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

/** Линейно неравенство ax + b REL c: решението на числовата ос и обръщането на знака. */
export default function LinearIneqLab() {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(-5);
  const [rel, setRel] = useState<Rel>('<');
  const [probe, setProbe] = useState(0);

  const k = (c - b) / a;
  const flipped = a < 0;
  const rel2 = flipped ? flip(rel) : rel;
  const piece = ray(rel2, k);
  const left = a * probe + b;
  const ok = holds(left, rel, c);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📏 Неравенство на числовата ос</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Направи коефициента a отрицателен и виж кога знакът се обръща. С пробната точка провери кои числа наистина са решения.
      </p>

      <p className="text-center font-mono text-lg sm:text-xl my-2 text-teal-700 dark:text-teal-300">
        {polynomial([a, b])} {rel} {num(c)}
      </p>

      <NumberLine pieces={[piece]} probe={{ x: probe, ok }} marks={[{ x: k, label: num(k), tone: 'violet' }]} />

      <Buttons>
        {RELS.map(r => (
          <DiagramButton key={r} active={r === rel} onClick={() => setRel(r)}>
            <span className="font-mono">{r}</span>
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="a" value={a} onChange={v => setA(v === 0 ? 1 : v)} min={-4} max={4} step={1} tone="violet" />
        <Slider label="b" value={b} onChange={setB} min={-6} max={6} step={1} tone="blue" />
        <Slider label="c" value={c} onChange={setC} min={-6} max={6} step={1} tone="blue" />
        <Slider label="проба x" value={probe} onChange={setProbe} min={-8} max={8} step={0.5} tone={ok ? 'emerald' : 'rose'} />
      </Sliders>

      <div className="mt-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100 space-y-1">
        <p>
          {polynomial([a, 0])} {rel} {num(c)} − {par(b)} = {num(c - b)}
        </p>
        <p>
          Делим на {par(a)}:{' '}
          {flipped ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              a &lt; 0 ⇒ знакът се обръща: x {rel2} {num(k)}
            </span>
          ) : (
            <span>
              a &gt; 0 ⇒ знакът се запазва: x {rel2} {num(k)}
            </span>
          )}
        </p>
        <p className="font-semibold">Отговор: x ∈ {fmtPieces([piece])}</p>
      </div>
      <Formula>
        Проба: x = {num(probe)} ⇒ {num(left)} {rel} {num(c)} е {ok ? 'вярно ✓' : 'невярно ✗'}
      </Formula>
      {probe === k && <Note tone={ok ? 'emerald' : 'rose'}>Точно в края: при „≤“ и „≥“ той е решение (плътна точка), при „&lt;“ и „&gt;“ – не е (празна точка).</Note>}
    </div>
  );
}
