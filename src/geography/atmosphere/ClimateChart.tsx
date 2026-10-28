import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { fmt } from '../geo';
import { isDry, MONTHS, pFromUnits, pUnits } from './koppen';

// Климатограма: температурата (линия) и валежите (стълбчета) в общ мащаб 10 °C ↔ 20 mm.
// Където стълбчето е под линията, месецът е сух (P < 2T). Над 100 mm мащабът на валежите е 10 пъти по-сбит.
const X0 = 62;
const X1 = 578;
const Y0 = 22;
const Y1 = 262;
const COL = (X1 - X0) / 12;

type Props = {
  T: number[];
  P: number[];
  /** обхват на скалата в „°C единици“ */
  lo: number;
  hi: number;
  /** заглавие над графиката */
  title?: string;
  onChangeT?: (month: number, t: number) => void;
  onChangeP?: (month: number, p: number) => void;
};

export default function ClimateChart({ T, P, lo, hi, title, onChangeT, onChangeP }: Props) {
  const [drag, setDrag] = useState<{ kind: 'T' | 'P'; m: number } | null>(null);
  const yOf = (u: number) => Y1 - ((u - lo) / (hi - lo)) * (Y1 - Y0);
  const uOf = (y: number) => lo + ((Y1 - y) / (Y1 - Y0)) * (hi - lo);
  const xOf = (m: number) => X0 + (m + 0.5) * COL;
  const editable = !!(onChangeT || onChangeP);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const ctm = e.currentTarget.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const u = uOf(Math.max(Y0, Math.min(Y1, p.y)));
    if (drag.kind === 'T') onChangeT?.(drag.m, Math.round(u * 2) / 2);
    else onChangeP?.(drag.m, Math.max(0, Math.round(pFromUnits(Math.max(0, u)) / 5) * 5));
  };
  const start = (kind: 'T' | 'P', m: number) => (e: React.PointerEvent) => {
    setDrag({ kind, m });
    try {
      (e.currentTarget as SVGElement).ownerSVGElement?.setPointerCapture(e.pointerId);
    } catch {
      // без прихващане влаченето пак работи, докато показалецът е над чертежа
    }
  };

  const tTicks: number[] = [];
  for (let u = Math.ceil(lo / 10) * 10; u <= hi; u += 10) tTicks.push(u);
  const linePath = T.map((t, m) => `${m ? 'L' : 'M'}${xOf(m).toFixed(1)} ${yOf(t).toFixed(1)}`).join('');

  return (
    <LabSvg
      viewBox="0 0 640 300"
      className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
      onPointerMove={move}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} className="fill-white dark:fill-slate-900 stroke-gray-300 dark:stroke-gray-600" />
      {/* Сбитата част на скалата за валежите (над 100 mm) */}
      {hi > 50 && <rect x={X0} y={Y0} width={X1 - X0} height={yOf(50) - Y0} className="fill-sky-50 dark:fill-sky-950/40" />}
      {tTicks.map(u => (
        <g key={u}>
          <line x1={X0} y1={yOf(u)} x2={X1} y2={yOf(u)} className={u === 0 ? 'stroke-gray-500' : 'stroke-gray-200 dark:stroke-gray-700'} />
          {u <= 40 && (
            <text x={X0 - 6} y={yOf(u) + 4} fontSize="11" textAnchor="end" className="fill-rose-700 dark:fill-rose-300">
              {fmt(u)}
            </text>
          )}
          {u >= 0 && (
            <text x={X1 + 6} y={yOf(u) + 4} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
              {fmt(pFromUnits(u))}
            </text>
          )}
        </g>
      ))}
      <text x={X0 - 6} y={Y0 - 8} fontSize="11" textAnchor="end" className="fill-rose-700 dark:fill-rose-300">
        °C
      </text>
      <text x={X1 + 6} y={Y0 - 8} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
        mm
      </text>
      {title && (
        <text x={(X0 + X1) / 2} y={Y0 - 8} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          {title}
        </text>
      )}
      {P.map((p, m) => {
        const dry = isDry(T[m], p);
        const top = yOf(Math.min(hi, pUnits(p)));
        const base = yOf(Math.max(lo, 0));
        return (
          <g key={`p${m}`}>
            <rect
              x={X0 + m * COL + 6}
              y={Math.min(top, base)}
              width={COL - 12}
              height={Math.abs(base - top)}
              className={dry ? 'fill-amber-400/80 dark:fill-amber-500/70' : 'fill-sky-500/70 dark:fill-sky-400/60'}
            />
            {onChangeP && (
              <rect
                x={X0 + m * COL + 6}
                y={top - 6}
                width={COL - 12}
                height={12}
                className="fill-sky-900/0 hover:fill-sky-900/20 cursor-ns-resize"
                style={{ touchAction: 'none' }}
                onPointerDown={start('P', m)}
              />
            )}
          </g>
        );
      })}
      <path d={linePath} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
      {T.map((t, m) => (
        <circle
          key={`t${m}`}
          cx={xOf(m)}
          cy={yOf(t)}
          r={editable ? 6 : 3.5}
          className={`fill-rose-600 dark:fill-rose-400 ${onChangeT ? 'cursor-ns-resize' : ''}`}
          style={onChangeT ? { touchAction: 'none' } : undefined}
          onPointerDown={onChangeT ? start('T', m) : undefined}
        />
      ))}
      {MONTHS.map((name, m) => (
        <text key={`m${m}`} x={xOf(m)} y={Y1 + 16} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {name}
        </text>
      ))}
      <g transform={`translate(${X0} 290)`} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
        <line x1={0} y1={-4} x2={20} y2={-4} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
        <text x={26} y={0}>температура</text>
        <rect x={120} y={-10} width={14} height={10} className="fill-sky-500/70" />
        <text x={140} y={0}>валежи</text>
        <rect x={210} y={-10} width={14} height={10} className="fill-amber-400/80" />
        <text x={230} y={0}>сух месец (P &lt; 2T)</text>
        {hi > 50 && <text x={370} y={0}>над 100 mm – по-сбит мащаб</text>}
      </g>
    </LabSvg>
  );
}
