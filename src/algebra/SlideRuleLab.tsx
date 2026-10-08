import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const W = 600;
const L = 440; // дължина на скалата от 1 до 10
const X0 = 30;

const MAJOR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MINOR = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5];

function Scale({ offset, y, up, tone }: { offset: number; y: number; up: boolean; tone: string }) {
  const s = up ? -1 : 1;
  return (
    <g transform={`translate(${offset} 0)`}>
      <line x1={X0} x2={X0 + L} y1={y} y2={y} className={tone} strokeWidth="2" />
      {MINOR.map(v => (
        <line key={v} x1={X0 + Math.log10(v) * L} x2={X0 + Math.log10(v) * L} y1={y} y2={y + s * 7} className={tone} strokeWidth="1" />
      ))}
      {MAJOR.map(v => {
        const x = X0 + Math.log10(v) * L;
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={y} y2={y + s * 14} className={tone} strokeWidth="2" />
            <text x={x} y={y + s * (up ? 20 : 28)} fontSize="13" textAnchor="middle" fill="currentColor" fontWeight="600">
              {v}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Логаритмичната линийка умножава, като събира дължини: lg(xy) = lg x + lg y. */
export default function SlideRuleLab() {
  const [x, setX] = useState(2);
  const [y, setY] = useState(3);
  const p = x * y;
  // Ако произведението е над 10, подравняваме 10 на горната скала (делим на 10 наум)
  const fold = p > 10 + 1e-9;
  const shift = (Math.log10(x) - (fold ? 1 : 0)) * L;
  const read = fold ? p / 10 : p;
  const yPos = X0 + shift + Math.log10(y) * L;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📐 Логаритмична линийка</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Разстоянието от 1 до числото е пропорционално на логаритъма му. Като долепим две дължини, логаритмите се събират – а числата се
        умножават. Така инженерите са смятали до 70-те години на XX век.
      </p>

      <svg viewBox={`0 0 ${W} 150`} className="w-full h-auto text-gray-700 dark:text-gray-300 overflow-hidden">
        <rect x={0} y={20} width={W} height={50} className="fill-amber-50 dark:fill-amber-900/20" />
        <rect x={0} y={78} width={W} height={50} className="fill-gray-50 dark:fill-gray-900/40" />
        <Scale offset={shift} y={70} up tone="stroke-amber-600" />
        <Scale offset={0} y={78} up={false} tone="stroke-gray-500" />
        {/* Отсечките lg x и lg y */}
        <line x1={X0} x2={X0 + Math.log10(x) * L} y1={140} y2={140} className="stroke-blue-500" strokeWidth="5" />
        <line x1={X0 + shift} x2={yPos} y1={12} y2={12} className="stroke-rose-500" strokeWidth="5" />
        <line x1={yPos} x2={yPos} y1={8} y2={135} className="stroke-emerald-500" strokeWidth="2" strokeDasharray="4 3" />
      </svg>

      <Sliders>
        <Slider label="x" value={x} onChange={setX} min={1} max={9} step={0.5} tone="blue" />
        <Slider label="y" value={y} onChange={setY} min={1} max={9} step={0.5} tone="rose" />
      </Sliders>

      <Formula>
        lg {num(x)} + lg {num(y)} = {num(Math.log10(x), 3)} + {num(Math.log10(y), 3)} = {num(Math.log10(p), 3)} = lg {num(p)}
      </Formula>
      <Note tone="emerald">
        Отчитаме {num(read)} на долната скала{fold ? ` и умножаваме по 10 наум: ${num(x)} · ${num(y)} = ${num(p)}` : `: ${num(x)} · ${num(y)} = ${num(p)}`}
      </Note>
      {fold && <Note tone="gray">Произведението е над 10, затова подравняваме края „10“ на горната скала с x – все едно делим на 10.</Note>}
    </div>
  );
}
