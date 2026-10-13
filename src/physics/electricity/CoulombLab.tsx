import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow } from '~/physics/SimControls';
import { fmtNum, sig } from '~/physics/sim';

const K = 8.99e9;
const G = 6.674e-11;
const E = 1.602e-19;

// Двойки частици за сравнение на електричната и гравитационната сила
const PAIRS = [
  { name: 'протон – протон', q: E * E, m: 1.673e-27 * 1.673e-27 },
  { name: 'електрон – електрон', q: E * E, m: 9.109e-31 * 9.109e-31 },
  { name: 'протон – електрон', q: E * E, m: 1.673e-27 * 9.109e-31 },
];

// Графика F(r): r от 5 до 50 cm
const P = { left: 52, right: 462, top: 112, bottom: 232 };
const R_MIN = 5;
const R_MAX = 50;
const px = (r: number) => P.left + ((r - R_MIN) / (R_MAX - R_MIN)) * (P.right - P.left);

/** Закон на Кулон: сила между два точкови заряда, равна по големина и противоположна по посока. */
export default function CoulombLab() {
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(-3);
  const [r, setR] = useState(20);
  const [pair, setPair] = useState(0);

  const prod = q1 * q2 * 1e-12;
  const force = (rr: number) => (K * Math.abs(prod)) / (rr / 100) ** 2;
  const F = force(r);
  const repel = prod > 0;

  // Зарядите стоят симетрично около средата; разстоянието расте с r (не в точен мащаб, за да се побират надписите)
  const cx = 240;
  const half = 40 + (r / R_MAX) * 140;
  const xa = cx - half;
  const xb = cx + half;
  const y = 52;
  // Дължина на стрелката: расте със силата, но не излиза от чертежа
  const len = F === 0 ? 0 : Math.min(60, 10 + 18 * Math.log10(1 + F * 10));
  const dir = repel ? 1 : -1;

  // Ос y на графиката – до силата при r = 10 cm, за да се вижда как намалява
  const fTop = force(10) || 1;
  const py = (f: number) => P.bottom - Math.min(1, f / fTop) * (P.bottom - P.top);
  // Кривата започва от r = 10 cm – при по-малко r силата излиза над графиката (не я „отрязваме“ хоризонтално)
  const curve = Array.from({ length: 81 }, (_, i) => 10 + (i / 80) * (R_MAX - 10))
    .map((rr, i) => `${i ? 'L' : 'M'} ${px(rr).toFixed(1)} ${py(force(rr)).toFixed(1)}`)
    .join(' ');

  const charge = (x: number, q: number, name: string) => (
    <g>
      <circle cx={x} cy={y} r={11 + Math.abs(q) * 2} className={q > 0 ? 'fill-rose-500' : q < 0 ? 'fill-blue-500' : 'fill-gray-400'} />
      <text x={x} y={y} fontSize={16} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
        {q > 0 ? '+' : q < 0 ? '−' : '0'}
      </text>
      <Label p={{ x, y: y + 32 }} size={11}>
        {`${name} = ${fmtNum(q)} µC`}
      </Label>
    </g>
  );

  const pp = PAIRS[pair];
  const ratio = (K * pp.q) / (G * pp.m);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 262">
        <line x1={xa} y1={y} x2={xb} y2={y} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <Label p={{ x: cx, y: y - 14 }} size={11}>
          {`r = ${fmtNum(r)} cm`}
        </Label>
        {len > 0 && (
          <>
            <Arrow from={{ x: xa, y }} to={{ x: xa - dir * len, y }} tone="amber" label="F" />
            <Arrow from={{ x: xb, y }} to={{ x: xb + dir * len, y }} tone="amber" label="F" />
          </>
        )}
        {charge(xa, q1, 'q₁')}
        {charge(xb, q2, 'q₂')}

        {/* Графика F(r) */}
        <line x1={P.left} y1={P.bottom} x2={P.right} y2={P.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={P.left} y1={P.bottom} x2={P.left} y2={P.top - 6} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[10, 20, 30, 40, 50].map(v => (
          <Label key={v} p={{ x: px(v), y: P.bottom + 12 }} size={10} weight={500}>
            {String(v)}
          </Label>
        ))}
        <Label p={{ x: P.right, y: P.bottom + 25 }} size={10} anchor="end">
          r, cm
        </Label>
        <Label p={{ x: P.left - 6, y: P.top }} size={10} anchor="end">
          {sig(fTop, 2)}
        </Label>
        <Label p={{ x: P.left + 6, y: P.top - 4 }} size={10} anchor="start">
          F, N
        </Label>
        {F > 0 && (
          <>
            <path d={curve} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
            {r * 2 <= R_MAX && (
              <>
                <line x1={px(2 * r)} y1={py(force(2 * r))} x2={px(2 * r)} y2={P.bottom} className="stroke-gray-400" strokeDasharray="3 3" />
                <circle cx={px(2 * r)} cy={py(force(2 * r))} r={4} className="fill-gray-500" />
                <Label p={{ x: px(2 * r) + 6, y: py(force(2 * r)) - 12 }} size={10} anchor="start">
                  2r: F/4
                </Label>
              </>
            )}
            {r >= 10 ? (
              <circle cx={px(r)} cy={py(F)} r={6} className="fill-amber-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
            ) : (
              <Label p={{ x: px(r), y: P.top + 10 }} size={12} tone="amber">
                ↑
              </Label>
            )}
          </>
        )}
      </ZoomingSvg>

      <Sliders>
        <Slider label="q₁, µC" value={q1} onChange={setQ1} min={-5} max={5} step={1} tone="rose" />
        <Slider label="q₂, µC" value={q2} onChange={setQ2} min={-5} max={5} step={1} tone="blue" />
        <Slider label="r, cm" value={r} onChange={setR} min={R_MIN} max={R_MAX} step={1} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'F =', value: `${sig(F, 3)} N`, tone: 'amber' },
            { label: '', value: F === 0 ? 'няма сила' : repel ? 'отблъскване' : 'привличане' },
          ]}
        />
      </div>
      <Note tone="gray">
        {F === 0
          ? 'Ако единият заряд е нула, сила няма.'
          : 'Двете сили са равни по големина и противоположни по посока – трети закон на Нютон. Удвоиш ли r, силата намалява 4 пъти.'}
      </Note>

      <p className="text-center text-sm font-semibold mt-4 text-gray-700 dark:text-gray-200">Колко пъти електричната сила е по-голяма от гравитационната?</p>
      <Buttons>
        {PAIRS.map((p, i) => (
          <DiagramButton key={p.name} active={i === pair} onClick={() => setPair(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout items={[{ label: 'F_ел : F_гр ≈', value: sig(ratio, 3), tone: 'violet' }]} />
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червено – положителен заряд, синьо – отрицателен. Стрелките показват силата върху всеки заряд (дължината расте по-бавно от
        силата, за да се побере). Отношението на двете сили не зависи от разстоянието, защото и двете намаляват като 1/r².
      </p>
    </div>
  );
}
