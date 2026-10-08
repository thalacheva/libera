import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { fmtPieces, RELS, strict, type Piece, type Rel } from './intervals';

// Множител (x − r)^k – в числителя или в знаменателя
type Factor = { r: number; k: number; den?: boolean };
type Preset = { text: string; factors: Factor[] };

const PRESETS: Preset[] = [
  { text: '(x + 2)(x − 1)(x − 3)', factors: [{ r: -2, k: 1 }, { r: 1, k: 1 }, { r: 3, k: 1 }] },
  { text: '(x − 1)²(x + 2)', factors: [{ r: 1, k: 2 }, { r: -2, k: 1 }] },
  { text: '(x + 1)/(x − 2)', factors: [{ r: -1, k: 1 }, { r: 2, k: 1, den: true }] },
  { text: '(x² − 4)/(x(x − 3))', factors: [{ r: -2, k: 1 }, { r: 2, k: 1 }, { r: 0, k: 1, den: true }, { r: 3, k: 1, den: true }] },
];

const W = 600;
const PAD = 30;
const AXIS_Y = 70;
const LO = -5;
const HI = 5;
const X = (v: number) => PAD + ((v - LO) / (HI - LO)) * (W - 2 * PAD);

const sign = (factors: Factor[], x: number) => factors.reduce((s, f) => s * Math.sign((x - f.r) ** f.k), 1);

/** Метод на интервалите: знак на произведение/частно и „змийката“. */
export default function IntervalMethodLab() {
  const [pi, setPi] = useState(0);
  const [rel, setRel] = useState<Rel>('>');
  const { factors, text } = PRESETS[pi];

  // Критичните точки – подредени, без повторения
  const crit = [...new Set(factors.map(f => f.r))].sort((p, q) => p - q);
  const isPole = (c: number) => factors.some(f => f.den && f.r === c);
  const bounds = [-Infinity, ...crit, Infinity];
  const signs = bounds.slice(0, -1).map((l, i) => {
    const r = bounds[i + 1];
    const mid = l === -Infinity ? r - 1 : r === Infinity ? l + 1 : (l + r) / 2;
    return sign(factors, mid);
  });
  const wantPos = rel === '>' || rel === '≥';

  // Елементи по реда на оста: интервал, точка, интервал, …
  type Item = { kind: 'gap'; i: number; ok: boolean } | { kind: 'point'; c: number; ok: boolean };
  const items: Item[] = [];
  signs.forEach((s, i) => {
    items.push({ kind: 'gap', i, ok: wantPos ? s > 0 : s < 0 });
    if (i < crit.length) items.push({ kind: 'point', c: crit[i], ok: !strict(rel) && !isPole(crit[i]) });
  });
  // Поредните включени елементи се сливат в един интервал
  const pieces: Piece[] = [];
  let run: Item[] = [];
  const flush = () => {
    if (run.length === 0) return;
    const first = run[0];
    const last = run[run.length - 1];
    const from = first.kind === 'point' ? first.c : bounds[first.i];
    const to = last.kind === 'point' ? last.c : bounds[last.i + 1];
    pieces.push({ from, to, fromClosed: first.kind === 'point', toClosed: last.kind === 'point' });
    run = [];
  };
  items.forEach(it => (it.ok ? run.push(it) : flush()));
  flush();

  // „Змийката“: дъга над оста, където изразът е положителен, и под нея – където е отрицателен
  const H = 34;
  let snake = '';
  signs.forEach((s, i) => {
    const l = bounds[i] === -Infinity ? LO : bounds[i];
    const r = bounds[i + 1] === Infinity ? HI : bounds[i + 1];
    const y = AXIS_Y - s * H;
    if (bounds[i] === -Infinity) snake += `M ${X(l)} ${AXIS_Y - s * H * 0.9} Q ${X((l + r) / 2)} ${y} ${X(r)} ${AXIS_Y} `;
    else if (bounds[i + 1] === Infinity) snake += `Q ${X((l + r) / 2)} ${y} ${X(r)} ${AXIS_Y - s * H * 0.9}`;
    else snake += `Q ${X((l + r) / 2)} ${y} ${X(r)} ${AXIS_Y} `;
  });

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🐍 Метод на интервалите</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Нулите на числителя и знаменателя делят оста на интервали. Във всеки интервал знакът е постоянен – „змийката“ минава над оста при
        „+“ и под нея при „−“.
      </p>
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.text} active={i === pi} onClick={() => setPi(i)}>
            <span className="font-mono">{p.text}</span>
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {RELS.map(r => (
          <DiagramButton key={r} active={r === rel} onClick={() => setRel(r)}>
            <span className="font-mono">
              {r} 0
            </span>
          </DiagramButton>
        ))}
      </Buttons>

      <p className="text-center font-mono text-lg sm:text-xl my-3 text-violet-700 dark:text-violet-300">
        {text} {rel} 0
      </p>

      <svg viewBox={`0 0 ${W} 140`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        {pieces.map((p, i) => (
          <line
            key={i}
            x1={X(Math.max(p.from, LO))}
            x2={X(Math.min(p.to, HI))}
            y1={AXIS_Y}
            y2={AXIS_Y}
            className="stroke-emerald-500"
            strokeWidth={p.from === p.to ? 0 : 9}
            opacity="0.55"
          />
        ))}
        <line x1={PAD - 16} x2={W - PAD + 10} y1={AXIS_Y} y2={AXIS_Y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <path d={`M ${W - PAD + 18} ${AXIS_Y} l -9 -4.5 v 9 z`} className="fill-gray-400 dark:fill-gray-500" />
        <path d={snake} fill="none" className="stroke-violet-500" strokeWidth="2.5" />

        {signs.map((s, i) => {
          const l = bounds[i] === -Infinity ? LO : bounds[i];
          const r = bounds[i + 1] === Infinity ? HI : bounds[i + 1];
          return (
            <text
              key={i}
              x={X((l + r) / 2)}
              y={s > 0 ? AXIS_Y - H - 6 : AXIS_Y + H + 18}
              fontSize="20"
              fontWeight="700"
              textAnchor="middle"
              className={s > 0 ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}
            >
              {s > 0 ? '+' : '−'}
            </text>
          );
        })}

        {crit.map(c => {
          const pole = isPole(c);
          const filled = !pole && !strict(rel);
          const even = factors.filter(f => f.r === c).reduce((k, f) => k + f.k, 0) % 2 === 0;
          return (
            <g key={c}>
              <circle
                cx={X(c)}
                cy={AXIS_Y}
                r={6.5}
                className={filled ? 'fill-violet-600 stroke-violet-600' : 'fill-white dark:fill-gray-800 stroke-violet-600'}
                strokeWidth="2.5"
              />
              <text x={X(c)} y={AXIS_Y + 24} fontSize="14" fontWeight="700" textAnchor="middle" fill="currentColor">
                {num(c)}
              </text>
              {(pole || even) && (
                <text x={X(c)} y={AXIS_Y + 40} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                  {pole ? 'знаменател' : 'четна степен'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 space-y-1">
        <p>
          Критични точки: <span className="font-mono">{crit.map(num).join(', ')}</span>. Вдясно от най-голямата всички множители са положителни ⇒
          знак „+“.
        </p>
        <p>При нечетна степен знакът се сменя при преминаване през точката, при четна степен – не се сменя.</p>
        <p className="font-mono font-semibold">Отговор: x ∈ {fmtPieces(pieces)}</p>
      </div>
      {factors.some(f => f.den) && <Note tone="rose">Нулите на знаменателя никога не влизат в отговора – там изразът не е дефиниран.</Note>}
    </div>
  );
}
