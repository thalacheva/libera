import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const U = 931.494; // MeV на атомна единица маса
const M_H = 1.00782503; // атом на водорода, u
const M_N = 1.00866492; // неутрон, u

type Nuclide = { s: string; A: number; Z: number; m: number; show?: boolean };

// Масите са на неутралните атоми (AME), в u
const NUCLIDES: Nuclide[] = [
  { s: 'H', A: 2, Z: 1, m: 2.01410178, show: true },
  { s: 'H', A: 3, Z: 1, m: 3.01604928 },
  { s: 'He', A: 3, Z: 2, m: 3.01602932 },
  { s: 'He', A: 4, Z: 2, m: 4.00260325, show: true },
  { s: 'Li', A: 6, Z: 3, m: 6.0151229 },
  { s: 'Li', A: 7, Z: 3, m: 7.0160034 },
  { s: 'Be', A: 9, Z: 4, m: 9.0121831 },
  { s: 'C', A: 12, Z: 6, m: 12 },
  { s: 'N', A: 14, Z: 7, m: 14.003074 },
  { s: 'O', A: 16, Z: 8, m: 15.9949146, show: true },
  { s: 'Ne', A: 20, Z: 10, m: 19.9924402 },
  { s: 'Si', A: 28, Z: 14, m: 27.9769265 },
  { s: 'Ca', A: 40, Z: 20, m: 39.9625909 },
  { s: 'Fe', A: 56, Z: 26, m: 55.9349363, show: true },
  { s: 'Ni', A: 62, Z: 28, m: 61.9283449 },
  { s: 'Zr', A: 90, Z: 40, m: 89.9046977 },
  { s: 'Kr', A: 92, Z: 36, m: 91.926173 },
  { s: 'Sn', A: 120, Z: 50, m: 119.9022016 },
  { s: 'Ba', A: 141, Z: 56, m: 140.914403 },
  { s: 'Au', A: 197, Z: 79, m: 196.96657 },
  { s: 'Pb', A: 208, Z: 82, m: 207.9766525 },
  { s: 'U', A: 235, Z: 92, m: 235.0439301, show: true },
  { s: 'U', A: 238, Z: 92, m: 238.0507884 },
];

const defect = (n: Nuclide) => n.Z * M_H + (n.A - n.Z) * M_N - n.m;
const perNucleon = (n: Nuclide) => (defect(n) * U) / n.A;
const find = (s: string, A: number) => NUCLIDES.find(n => n.s === s && n.A === A)!;

const P = { x0: 46, x1: 466, y0: 22, y1: 232 };
const gx = (A: number) => P.x0 + (A / 240) * (P.x1 - P.x0);
const gy = (e: number) => P.y1 - (e / 9) * (P.y1 - P.y0);

const SUP: Record<string, string> = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const name = (n: Nuclide) => `${String(n.A).replace(/./g, d => SUP[d])}${n.s}`;

type Mode = 'nuclides' | 'fission' | 'fusion';

// Реакциите: изходни ядра → продукти (неутроните имат енергия на връзката 0)
const FISSION = { from: find('U', 235), to: [find('Ba', 141), find('Kr', 92)], neutrons: [1, 3] };
const FUSION = { from: [find('H', 2), find('H', 3)], to: find('He', 4), neutrons: [0, 1] };
const fissionQ = (FISSION.from.m + M_N - FISSION.to[0].m - FISSION.to[1].m - 3 * M_N) * U;
const fusionQ = (FUSION.from[0].m + FUSION.from[1].m - FUSION.to.m - M_N) * U;

/** Енергия на връзката на нуклон: кривата с връх при желязото обяснява делене и синтез. */
export default function BindingEnergyLab() {
  const [sel, setSel] = useState(find('Fe', 56));
  const [mode, setMode] = useState<Mode>('nuclides');
  const pick = (n: Nuclide) => {
    setSel(n);
    setMode('nuclides');
  };

  const line = NUCLIDES.map(n => `${gx(n.A).toFixed(1)},${gy(perNucleon(n)).toFixed(1)}`).join(' ');
  const highlighted = mode === 'fission' ? [FISSION.from, ...FISSION.to] : mode === 'fusion' ? [...FUSION.from, FUSION.to] : [sel];

  const arrow = (a: Nuclide, b: Nuclide, tone: string) => {
    const [x1, y1, x2, y2] = [gx(a.A), gy(perNucleon(a)), gx(b.A), gy(perNucleon(b))];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
    const [ex, ey] = [x2 - ux * 9, y2 - uy * 9];
    return (
      <g key={`${a.A}-${b.A}`}>
        <line x1={x1 + ux * 8} y1={y1 + uy * 8} x2={ex - ux * 8} y2={ey - uy * 8} className={tone.replace('fill', 'stroke')} strokeWidth="2.5" />
        <polygon points={`${ex},${ey} ${ex - ux * 9 - uy * 5},${ey - uy * 9 + ux * 5} ${ex - ux * 9 + uy * 5},${ey - uy * 9 - ux * 5}`} className={tone} />
      </g>
    );
  };

  const items =
    mode === 'nuclides'
      ? [
          { label: 'ядро', value: `${name(sel)} (Z = ${sel.Z}, N = ${sel.A - sel.Z})` },
          { label: 'Δm =', value: `${fmtNum(defect(sel), 5)} u`, tone: 'violet' as const },
          { label: 'E_св =', value: `${fmtNum(defect(sel) * U, 1)} MeV` },
          { label: 'E_св / A =', value: `${fmtNum(perNucleon(sel), 2)} MeV`, tone: 'blue' as const },
        ]
      : mode === 'fission'
        ? [
            { label: 'реакция', value: '²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n' },
            { label: 'Q =', value: `${fmtNum(fissionQ, 0)} MeV`, tone: 'rose' as const },
            { label: 'на нуклон ≈', value: `${fmtNum(fissionQ / 236, 2)} MeV` },
          ]
        : [
            { label: 'реакция', value: '²H + ³H → ⁴He + n' },
            { label: 'Q =', value: `${fmtNum(fusionQ, 1)} MeV`, tone: 'emerald' as const },
            { label: 'на нуклон ≈', value: `${fmtNum(fusionQ / 5, 2)} MeV` },
          ];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'nuclides'} onClick={() => setMode('nuclides')}>
          ядра
        </DiagramButton>
        <DiagramButton active={mode === 'fission'} onClick={() => setMode('fission')}>
          делене на уран
        </DiagramButton>
        <DiagramButton active={mode === 'fusion'} onClick={() => setMode('fusion')}>
          синтез на хелий
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 268">
        {/* Областите, в които синтезът или деленето освобождават енергия */}
        <rect x={P.x0} y={P.y0} width={gx(56) - P.x0} height={P.y1 - P.y0} className="fill-emerald-500/10" />
        <rect x={gx(56)} y={P.y0} width={P.x1 - gx(56)} height={P.y1 - P.y0} className="fill-rose-500/10" />
        <Label p={{ x: gx(30), y: gy(1.2) }} size={11} tone="emerald">
          синтез →
        </Label>
        <Label p={{ x: gx(170), y: gy(1.2) }} size={11} tone="rose">
          ← делене
        </Label>
        {[2, 4, 6, 8].map(e => (
          <g key={e}>
            <line x1={P.x0} y1={gy(e)} x2={P.x1} y2={gy(e)} className="stroke-gray-200 dark:stroke-gray-700" />
            <Label p={{ x: P.x0 - 5, y: gy(e) }} size={10} weight={500} anchor="end">
              {String(e)}
            </Label>
          </g>
        ))}
        <line x1={P.x0} y1={P.y1} x2={P.x1} y2={P.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        <line x1={P.x0} y1={P.y0} x2={P.x0} y2={P.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        {[0, 50, 100, 150, 200].map(A => (
          <Label key={A} p={{ x: gx(A), y: P.y1 + 12 }} size={10} weight={500}>
            {String(A)}
          </Label>
        ))}
        <Label p={{ x: P.x1, y: P.y1 + 28 }} size={11} anchor="end">
          масово число A
        </Label>
        <Label p={{ x: P.x0 + 6, y: 10 }} size={11} anchor="start">
          E_св / A, MeV
        </Label>
        <polyline points={line} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />

        {mode === 'fission' && FISSION.to.map(t => arrow(FISSION.from, t, 'fill-rose-500'))}
        {mode === 'fusion' && FUSION.from.map(f => arrow(f, FUSION.to, 'fill-emerald-500'))}

        {NUCLIDES.map(n => {
          const on = highlighted.includes(n);
          return (
            <g key={`${n.s}${n.A}`} onClick={() => pick(n)} className="cursor-pointer">
              <circle cx={gx(n.A)} cy={gy(perNucleon(n))} r={10} fill="transparent" />
              <circle cx={gx(n.A)} cy={gy(perNucleon(n))} r={on ? 6 : 4} className={on ? 'fill-blue-500' : 'fill-gray-500 dark:fill-gray-300'} />
            </g>
          );
        })}
        {NUCLIDES.filter(n => n.show || highlighted.includes(n)).map(n => (
          <Label key={`l${n.s}${n.A}`} p={{ x: gx(n.A) + (n.A < 10 ? 8 : 0), y: gy(perNucleon(n)) - 13 }} size={11} tone="blue" anchor={n.A < 10 ? 'start' : 'middle'}>
            {name(n)}
          </Label>
        ))}
      </ZoomingSvg>

      <div className="mt-3">
        <Readout items={items} />
      </div>
      <Note tone={mode === 'fission' ? 'rose' : mode === 'fusion' ? 'emerald' : 'blue'}>
        {mode === 'nuclides'
          ? 'Щракни върху точка, за да видиш дефекта на масата и енергията на връзката на ядрото.'
          : mode === 'fission'
            ? 'Продуктите са по-високо на кривата – нуклоните им са по-силно свързани и разликата се отделя.'
            : 'Хелият е много по-високо от водородните изотопи – на нуклон синтезът дава около 4–5 пъти повече от деленето.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Колкото по-високо е ядрото на кривата, толкова по-здраво са свързани нуклоните му. Най-високо са желязото и никелът (около 8,8
        MeV на нуклон). Енергия се отделя, когато ядрата „се изкачват“ към върха: леките – като се сливат (синтез), тежките – като се делят.
        Енергиите са пресметнати от масите на атомите; при деленето продуктите се разпадат и после, затова общо се отделят около 200 MeV.
      </p>
    </div>
  );
}
