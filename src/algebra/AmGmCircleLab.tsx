import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { AngleMark, Dot, Handle, Label, Note, Readout, Segment, ZoomingSvg } from '~/geometry/diagram';

// Полуокръжност с диаметър AB = a + b = 10 (в единици); C дели диаметъра на a и b.
const L = 60;
const R_PX = 180;
const O = { x: L + R_PX, y: 250 };
const A = { x: L, y: O.y };
const B = { x: L + 2 * R_PX, y: O.y };
const SUM = 10;
const PX = (2 * R_PX) / SUM; // пиксела на единица

/** Доказателство на AM ≥ GM с окръжност: височината CD = √(ab) не е по-дълга от радиуса (a + b)/2. */
export default function AmGmCircleLab() {
  const [a, setA] = useState(2.5);
  const b = SUM - a;
  const am = (a + b) / 2;
  const gm = Math.sqrt(a * b);

  const C = { x: L + a * PX, y: O.y };
  const D = { x: C.x, y: O.y - gm * PX };
  const equal = Math.abs(a - b) < 1e-9;
  const left = C.x < O.x;

  const arc = Array.from({ length: 61 }, (_, i) => {
    const th = Math.PI - (Math.PI * i) / 60;
    return `${i ? 'L' : 'M'} ${(O.x + R_PX * Math.cos(th)).toFixed(1)} ${(O.y - R_PX * Math.sin(th)).toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 50 480 245">
        {/* Правоъгълният триъгълник ADB, вписан в полуокръжността */}
        <polygon points={`${A.x},${A.y} ${D.x},${D.y} ${B.x},${B.y}`} className="fill-violet-500/10" />
        <path d={arc} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={2} />
        <Segment p={A} q={B} tone="gray" width={2} />
        <Segment p={A} q={D} tone="violet" width={1.5} />
        <Segment p={D} q={B} tone="violet" width={1.5} />
        {!equal && <AngleMark v={D} p={A} q={B} tone="violet" r={20} fill={false} />}
        {!equal && <AngleMark v={C} p={B} q={D} tone="emerald" r={14} fill={false} />}
        {/* Радиусът OD = (a + b)/2 */}
        <Segment p={O} q={D} tone="blue" width={3} />
        {/* Височината CD = √(ab) */}
        <Segment p={C} q={D} tone="emerald" width={3.5} />
        <Dot p={A} tone="gray" />
        <Dot p={B} tone="gray" />
        <Dot p={O} tone="blue" />
        <Dot p={D} tone="emerald" />
        <Label p={{ x: A.x - 12, y: A.y }} size={13} tone="ink" anchor="end">
          A
        </Label>
        <Label p={{ x: B.x + 12, y: B.y }} size={13} tone="ink" anchor="start">
          B
        </Label>
        {!equal && (
          <Label p={{ x: O.x, y: O.y + 16 }} size={12} tone="blue">
            O
          </Label>
        )}
        <Label p={{ x: (A.x + C.x) / 2, y: O.y + 30 }} size={13} tone="ink">
          a = {num(a, 2)}
        </Label>
        <Label p={{ x: (C.x + B.x) / 2, y: O.y + 30 }} size={13} tone="ink">
          b = {num(b, 2)}
        </Label>
        <Label p={{ x: C.x, y: O.y + 16 }} size={12} tone="violet">
          C
        </Label>
        <Label p={{ x: D.x + (left ? -10 : 10), y: D.y - 12 }} size={13} tone="emerald" anchor={left ? 'end' : 'start'}>
          D
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
            { label: 'радиус OD = (a + b)/2 =', value: num(am, 3), tone: 'blue' },
            { label: 'височина CD = √(ab) =', value: num(gm, 3), tone: 'emerald' },
          ]}
        />
        <Note tone={equal ? 'emerald' : 'violet'}>
          {equal
            ? 'C е центърът: височината CD съвпада с радиуса и (a + b)/2 = √(ab) = 5.'
            : `${num(am, 2)} > ${num(gm, 2)} – в правоъгълния триъгълник OCD радиусът OD е хипотенуза, а CD – катет.`}
        </Note>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Влачи точката C по диаметъра. Каквото и да са a и b, перпендикулярът CD до полуокръжността не надминава радиуса – и се изравнява с него
        само когато C е в центъра, т.е. при a = b.
      </p>
    </div>
  );
}
