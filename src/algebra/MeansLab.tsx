import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Dot, Handle, Label, Note, Readout, Segment, ZoomingSvg } from '~/geometry/diagram';

// Полуокръжност с диаметър a + b = 10 (в единици); C дели диаметъра на a и b.
const L = 60;
const R_PX = 180;
const O = { x: L + R_PX, y: 250 };
const SUM = 10;
const PX = (2 * R_PX) / SUM; // пиксела на единица

/** Четирите средни на две числа като отсечки в полуокръжност: QM ≥ AM ≥ GM ≥ HM. */
export function MeansLab() {
  const [a, setA] = useState(2.5);
  const b = SUM - a;

  const am = (a + b) / 2;
  const gm = Math.sqrt(a * b);
  const hm = (2 * a * b) / (a + b);
  const qm = Math.sqrt((a * a + b * b) / 2);

  // C – точката от диаметъра, D – върхът на перпендикуляра в C, F – най-горната точка
  const C = { x: L + a * PX, y: O.y };
  const D = { x: C.x, y: O.y - gm * PX };
  const F = { x: O.x, y: O.y - R_PX };
  // E – петата на перпендикуляра от C към радиуса OD (DE = HM)
  const ux = (C.x - O.x) / R_PX;
  const uy = (D.y - O.y) / R_PX;
  const t = (C.x - O.x) * ux; // проекцията на OC върху OD
  const E = { x: O.x + t * ux, y: O.y + t * uy };
  // DE лежи върху OD – рисуваме я леко встрани (от страната на дъгата), за да се вижда и цялата OD
  const side = ux <= 0 ? 1 : -1;
  const shift = (p: { x: number; y: number }) => ({ x: p.x - side * uy * 6, y: p.y + side * ux * 6 });

  const arc = Array.from({ length: 61 }, (_, i) => {
    const th = Math.PI - (Math.PI * i) / 60;
    return `${i ? 'L' : 'M'} ${(O.x + R_PX * Math.cos(th)).toFixed(1)} ${(O.y - R_PX * Math.sin(th)).toFixed(1)}`;
  }).join(' ');

  const equal = Math.abs(a - b) < 1e-9;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 290">
        <path d={arc} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={2} />
        <Segment p={{ x: L, y: O.y }} q={{ x: L + 2 * R_PX, y: O.y }} tone="gray" width={2} />
        {/* AM – радиусът OD */}
        <Segment p={O} q={D} tone="blue" width={3} />
        {/* QM – от C до най-горната точка F */}
        <Segment p={C} q={F} tone="rose" width={3} />
        {/* GM – перпендикулярът CD */}
        <Segment p={C} q={D} tone="emerald" width={3.5} />
        {/* HM – DE, проекцията на CD върху радиуса */}
        {!equal && <Segment p={C} q={E} tone="gray" width={1.5} dashed />}
        <Segment p={shift(D)} q={shift(E)} tone="amber" width={4} />
        <Segment p={O} q={F} tone="gray" width={1} dashed />
        <Dot p={O} tone="gray" />
        <Dot p={D} tone="emerald" />
        <Dot p={F} tone="rose" />
        <Label p={{ x: O.x, y: O.y + 16 }} size={12}>
          O
        </Label>
        <Label p={{ x: (L + C.x) / 2, y: O.y + 16 }} size={13} tone="ink">
          a = {num(a, 2)}
        </Label>
        <Label p={{ x: (C.x + L + 2 * R_PX) / 2, y: O.y + 16 }} size={13} tone="ink">
          b = {num(b, 2)}
        </Label>
        <Label p={{ x: D.x + (C.x < O.x ? -10 : 10), y: D.y - 12 }} size={12} tone="emerald" anchor={C.x < O.x ? 'end' : 'start'}>
          D
        </Label>
        <Label p={{ x: F.x, y: F.y - 12 }} size={12} tone="rose">
          F
        </Label>
        <Handle
          p={C}
          name="C – дели диаметъра на a и b"
          tone="violet"
          onMove={q => {
            const v = Math.round(((q.x - L) / PX) * 4) / 4;
            setA(Math.min(SUM - 0.25, Math.max(0.25, v)));
          }}
        />
      </ZoomingSvg>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'QM = CF =', value: num(qm, 3), tone: 'rose' },
            { label: 'AM = OD =', value: num(am, 3), tone: 'blue' },
            { label: 'GM = CD =', value: num(gm, 3), tone: 'emerald' },
            { label: 'HM = DE =', value: num(hm, 3), tone: 'amber' },
          ]}
        />
        <Note tone={equal ? 'emerald' : 'violet'}>
          {equal
            ? 'При a = b четирите отсечки съвпадат: QM = AM = GM = HM = 5.'
            : `${num(qm, 2)} ≥ ${num(am, 2)} ≥ ${num(gm, 2)} ≥ ${num(hm, 2)} – хипотенузата е по-дълга от катета във всеки правоъгълен триъгълник.`}
        </Note>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Влачи точката C по диаметъра. Радиусът OD е средното аритметично, перпендикулярът CD – средното геометрично (височина в
        правоъгълния триъгълник, вписан в полуокръжността), DE – средното хармонично, а CF – средното квадратично. Всяка следваща отсечка е
        катет в правоъгълен триъгълник, чиято хипотенуза е предишната.
      </p>
    </div>
  );
}
