import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { fmtPieces, RELS, type Piece, type Rel } from './intervals';
import { NumberLine } from './NumberLine';

const ALL: Piece = { from: -Infinity, to: Infinity, fromClosed: false, toClosed: false };

/** Решенията на |x − a| REL r. */
function solve(a: number, r: number, rel: Rel): Piece[] {
  const inner = rel === '<' || rel === '≤';
  const closed = rel === '≤' || rel === '≥';
  if (inner) {
    if (r < 0 || (r === 0 && !closed)) return [];
    return [{ from: a - r, to: a + r, fromClosed: closed, toClosed: closed }];
  }
  if (r < 0 || (r === 0 && closed)) return [ALL];
  return [
    { from: -Infinity, to: a - r, fromClosed: false, toClosed: closed },
    { from: a + r, to: Infinity, fromClosed: closed, toClosed: false },
  ];
}

/** Неравенства с модул като разстояния на числовата ос. */
export default function AbsIneqLab() {
  const [a, setA] = useState(1);
  const [r, setR] = useState(3);
  const [rel, setRel] = useState<Rel>('<');
  const pieces = solve(a, r, rel);
  const inner = rel === '<' || rel === '≤';
  const words = { '<': 'по-малко от', '≤': 'най-много', '>': 'повече от', '≥': 'поне' }[rel];

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📐 Модулът като разстояние</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        |x − a| е разстоянието от x до a. Неравенството пита: кои точки са на разстояние {words} r от a?
      </p>

      <p className="text-center font-mono text-lg sm:text-xl my-2 text-sky-700 dark:text-sky-300">
        {a === 0 ? '|x|' : `|x ${a < 0 ? '+' : '−'} ${num(Math.abs(a))}|`} {rel} {num(r)}
      </p>

      <NumberLine pieces={pieces} marks={r > 0 ? [] : [{ x: a, label: 'a', tone: 'rose' }]}>
        {X =>
          r > 0 && (
            <g className="stroke-sky-500" strokeWidth="1.5" fill="none">
              <path d={`M ${X(a)} 30 Q ${(X(a) + X(a + r)) / 2} 6 ${X(a + r)} 30`} />
              <path d={`M ${X(a)} 30 Q ${(X(a) + X(a - r)) / 2} 6 ${X(a - r)} 30`} />
              <text x={(X(a) + X(a + r)) / 2} y={14} fontSize="12" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400" stroke="none">
                r
              </text>
              <text x={(X(a) + X(a - r)) / 2} y={14} fontSize="12" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400" stroke="none">
                r
              </text>
              <text x={X(a)} y={20} fontSize="13" fontWeight="700" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400" stroke="none">
                a
              </text>
              <circle cx={X(a)} cy={44} r={4} className="fill-rose-500" stroke="none" />
            </g>
          )
        }
      </NumberLine>

      <Buttons>
        {RELS.map(s => (
          <DiagramButton key={s} active={s === rel} onClick={() => setRel(s)}>
            <span className="font-mono">{s}</span>
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="a" value={a} onChange={setA} min={-4} max={4} step={0.5} tone="rose" />
        <Slider label="r" value={r} onChange={setR} min={-2} max={4} step={0.5} tone="blue" />
      </Sliders>

      {r > 0 && (
        <Formula>
          {inner
            ? `${num(a - r)} ${rel} x ${rel} ${num(a + r)}`
            : `x ${rel === '>' ? '<' : '≤'} ${num(a - r)} или x ${rel} ${num(a + r)}`}
        </Formula>
      )}
      <Formula>
        <span className="font-semibold">x ∈ {fmtPieces(pieces)}</span>
      </Formula>
      {r < 0 && <Note tone="amber">Модулът никога не е отрицателен, затова при r &lt; 0 отговорът е „нищо“ или „всичко“ – без никакви сметки.</Note>}
      {r === 0 && <Note tone="amber">При r = 0 само точката x = a е на разстояние 0 от a.</Note>}
    </div>
  );
}
