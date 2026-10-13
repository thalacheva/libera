import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const E = 12; // напрежение на батерията, V
const RB = 24; // съпротивление на една лампа, Ω (12 V / 6 W)
const PMAX = (E * E) / RB;

type Pt = { x: number; y: number };
type Preset = {
  name: string;
  bulbs: Pt[];
  wires: Pt[][];
  /** Ток през всяка лампа при дадените включени лампи. */
  solve: (on: boolean[]) => number[];
};

const L = 60;
const T = 40;
const B = 190;

const PRESETS: Preset[] = [
  {
    name: 'една лампа',
    bulbs: [{ x: 250, y: T }],
    wires: [[{ x: L, y: T }, { x: 420, y: T }, { x: 420, y: B }, { x: L, y: B }, { x: L, y: T }]],
    solve: on => [on[0] ? E / RB : 0],
  },
  {
    name: 'последователно',
    bulbs: [
      { x: 190, y: T },
      { x: 320, y: T },
    ],
    wires: [[{ x: L, y: T }, { x: 420, y: T }, { x: 420, y: B }, { x: L, y: B }, { x: L, y: T }]],
    solve: on => {
      const i = on[0] && on[1] ? E / (2 * RB) : 0;
      return [i, i];
    },
  },
  {
    name: 'успоредно',
    bulbs: [
      { x: 250, y: 115 },
      { x: 390, y: 115 },
    ],
    wires: [
      [{ x: L, y: T }, { x: 390, y: T }, { x: 390, y: B }, { x: L, y: B }, { x: L, y: T }],
      [{ x: 250, y: T }, { x: 250, y: B }],
    ],
    solve: on => on.map(o => (o ? E / RB : 0)),
  },
  {
    name: 'смесено',
    bulbs: [
      { x: 160, y: T },
      { x: 280, y: 115 },
      { x: 400, y: 115 },
    ],
    wires: [
      [{ x: L, y: T }, { x: 400, y: T }, { x: 400, y: B }, { x: L, y: B }, { x: L, y: T }],
      [{ x: 280, y: T }, { x: 280, y: B }],
    ],
    solve: on => {
      const n = (on[1] ? 1 : 0) + (on[2] ? 1 : 0);
      if (!on[0] || n === 0) return [0, 0, 0];
      const rg = RB / n;
      const i = E / (RB + rg);
      const ug = i * rg;
      return [i, on[1] ? ug / RB : 0, on[2] ? ug / RB : 0];
    },
  },
];

/** Лампи последователно и успоредно: яркостта показва мощността; развинти лампа и виж какво става с другите. */
export default function BulbCircuitLab() {
  const [k, setK] = useState(0);
  const [on, setOn] = useState([true, true, true]);
  const P = PRESETS[k];
  const currents = P.solve(on);
  const total = k === 0 || k === 1 ? currents[0] : k === 2 ? currents[0] + currents[1] : currents[0];

  const choose = (i: number) => {
    setK(i);
    setOn([true, true, true]);
  };
  const toggle = (i: number) => setOn(on.map((o, j) => (j === i ? !o : o)));

  const anyOff = P.bulbs.some((_, i) => !on[i]);
  const note =
    k === 1 && anyOff
      ? 'При последователно свързване веригата се прекъсва – угасват всички лампи.'
      : k === 2 && anyOff
        ? 'При успоредно свързване другата лампа свети както преди – затова така са свързани уредите вкъщи.'
        : k === 3 && !on[0]
          ? 'Лампа L1 е в главния клон – без нея токът спира навсякъде.'
          : k === 3 && anyOff
            ? 'Съпротивлението на разклонението нараства, общият ток намалява: L1 светва по-слабо, а останалата лампа в разклонението – по-силно.'
            : k === 1
              ? 'Двете лампи си делят напрежението: всяка получава 6 V и мощност 4 пъти по-малка от тази на една лампа.'
              : k === 2
                ? 'Всяка лампа е под пълните 12 V – светят като една лампа, а батерията дава двоен ток.'
                : k === 3
                  ? 'L1 носи целия ток и свети най-силно; L2 и L3 си го делят.'
                  : 'Една лампа на 12 V: ток 0,5 A, мощност 6 W. Натисни лампата, за да я развиеш.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.name} active={i === k} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 230">
        {P.wires.map((w, i) => (
          <polyline key={i} points={w.map(p => `${p.x},${p.y}`).join(' ')} fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        ))}
        {/* Батерия 12 V вляво */}
        <rect x={L - 16} y={100} width={32} height={30} className="fill-white dark:fill-gray-800" />
        <line x1={L - 14} y1={108} x2={L + 14} y2={108} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" />
        <line x1={L - 7} y1={120} x2={L + 7} y2={120} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="5" />
        <Label p={{ x: L - 24, y: 115 }} size={12} anchor="end">
          12 V
        </Label>
        {P.bulbs.map((b, i) => {
          const p = currents[i] * currents[i] * RB;
          const g = p / PMAX;
          return (
            <g key={i} onClick={() => toggle(i)} className="cursor-pointer">
              {on[i] && <circle cx={b.x} cy={b.y} r={16 + 26 * g} className="fill-amber-300" opacity={0.1 + 0.6 * g} />}
              <circle cx={b.x} cy={b.y} r={15} className={`${on[i] ? 'fill-white dark:fill-gray-800 stroke-gray-600' : 'fill-gray-100 dark:fill-gray-700 stroke-gray-400'}`} strokeWidth="2" strokeDasharray={on[i] ? undefined : '4 3'} />
              {on[i] && <path d={`M ${b.x - 9} ${b.y - 9} L ${b.x + 9} ${b.y + 9} M ${b.x + 9} ${b.y - 9} L ${b.x - 9} ${b.y + 9}`} className={g > 0 ? 'stroke-amber-600' : 'stroke-gray-500'} strokeWidth="2" />}
              <Label p={{ x: b.x, y: b.y === T ? T - 26 : b.y + 30 }} size={12}>
                {`L${i + 1}${on[i] ? '' : ' (няма)'}`}
              </Label>
            </g>
          );
        })}
        <Label p={{ x: 240, y: 214 }} size={11}>
          {`ток от батерията: ${fmtNum(total, 3)} A`}
        </Label>
      </ZoomingSvg>

      <Buttons>
        {P.bulbs.map((_, i) => (
          <DiagramButton key={i} active={on[i]} onClick={() => toggle(i)}>
            {`L${i + 1}: ${on[i] ? 'развий' : 'завий'}`}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3 space-y-2">
        {P.bulbs.map((_, i) => {
          const I = currents[i];
          return (
            <Readout
              key={i}
              items={[
                { label: `L${i + 1}:`, value: on[i] ? '' : 'развита', tone: 'amber' },
                { label: 'U =', value: `${fmtNum(I * RB, 2)} V` },
                { label: 'I =', value: `${fmtNum(I, 3)} A`, tone: 'blue' },
                { label: 'P =', value: `${fmtNum(I * I * RB, 2)} W`, tone: 'rose' },
              ]}
            />
          );
        })}
      </div>
      <Note tone="gray">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всички лампи са еднакви: 12 V / 6 W, т.е. 24 Ω. Яркостта на ореола е пропорционална на мощността P = I²R. За простота приемаме, че съпротивлението не зависи от температурата (виж първата лаборатория – при истинска лампа то расте).
      </p>
    </div>
  );
}
