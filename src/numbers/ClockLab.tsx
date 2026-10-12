import { useState } from 'react';
import { gcd } from '~/drill';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, ZoomingSvg } from '~/geometry/diagram';

const C = { x: 240, y: 150 };
const R = 115;
const pos = (k: number, m: number) => {
  const t = (2 * Math.PI * k) / m - Math.PI / 2;
  return { x: C.x + R * Math.cos(t), y: C.y + R * Math.sin(t) };
};

/** Редицата a, 2a, 3a, … или a, a², a³, … по модул m – докато започне да се повтаря. */
function sequence(a: number, m: number, mode: 'add' | 'pow') {
  const seq: number[] = [];
  let v = mode === 'add' ? 0 : 1;
  const seen = new Map<number, number>();
  while (!seen.has(v)) {
    seen.set(v, seq.length);
    seq.push(v);
    v = mode === 'add' ? (v + a) % m : (v * a) % m;
  }
  return { seq, back: seen.get(v)! };
}

/** Модулен „часовник“: събиране и степенуване по модул m като обикаляне по кръг. */
export default function ClockLab() {
  const [m, setM] = useState(12);
  const [a, setA] = useState(5);
  const [mode, setMode] = useState<'add' | 'pow'>('add');
  const aa = a % m;
  const { seq, back } = sequence(aa, m, mode);
  const visited = new Set(seq);
  const cycle = seq.length - back;
  const path = [...seq, seq[back]].map(k => pos(k, m));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 300">
        <circle cx={C.x} cy={C.y} r={R} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" />
        <polyline
          points={path.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-indigo-500"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {Array.from({ length: m }, (_, k) => {
          const p = pos(k, m);
          const q = { x: C.x + (R + 20) * Math.cos((2 * Math.PI * k) / m - Math.PI / 2), y: C.y + (R + 20) * Math.sin((2 * Math.PI * k) / m - Math.PI / 2) };
          const on = visited.has(k);
          return (
            <g key={k}>
              <circle
                cx={p.x}
                cy={p.y}
                r={on ? 7 : 4}
                className={`${k === seq[0] ? 'fill-emerald-500' : on ? 'fill-indigo-500' : 'fill-gray-300 dark:fill-gray-600'} stroke-white dark:stroke-gray-800`}
                strokeWidth="2"
              />
              <Label p={q} size={12} weight={on ? 700 : 400} tone={on ? 'violet' : 'gray'}>
                {String(k)}
              </Label>
            </g>
          );
        })}
      </ZoomingSvg>
      <Buttons>
        <DiagramButton active={mode === 'add'} onClick={() => setMode('add')}>
          стъпки по a: 0, a, 2a, …
        </DiagramButton>
        <DiagramButton active={mode === 'pow'} onClick={() => setMode('pow')}>
          степени: 1, a, a², …
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="m" value={m} onChange={setM} min={2} max={24} step={1} tone="blue" />
        <Slider label="a" value={a} onChange={setA} min={1} max={23} step={1} tone="violet" />
      </Sliders>
      <p className="mt-3 text-center font-mono text-sm text-gray-800 dark:text-gray-100 break-words">
        {seq.join(', ')}, {seq[back]}, … {a >= m ? `(a = ${a} ≡ ${aa} mod ${m})` : ''}
      </p>
      <Note tone="violet">
        {mode === 'add'
          ? gcd(aa, m) === 1
            ? `НОД(${aa}, ${m}) = 1 – стъпките по ${aa} обхождат всички ${m} остатъка.`
            : `НОД(${aa}, ${m}) = ${gcd(aa, m)} – обхождаме само ${m / gcd(aa, m)} от ${m} остатъка (кратните на ${gcd(aa, m)}).`
          : `Степените се повтарят с период ${cycle}${back > 0 ? ` (след първите ${back})` : ''}.${
              gcd(aa, m) === 1 ? ` Стигаме до 1 при степен ${cycle}.` : ` Понеже НОД(${aa}, ${m}) ≠ 1, никога не стигаме до 1.`
            }`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 По модул m числата „живеят“ на часовник с m деления: след m − 1 идва пак 0. При m = 12 това е обикновеният часовник, при m = 7 – дните от седмицата. Пробвай степените на 2 по модул 7 и по модул 11, или на 3 по модул 10 – оттам идват последните цифри на 3ⁿ.
      </p>
    </div>
  );
}
