import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow } from '../SimControls';
import { fmtNum } from '../sim';

const G = 9.8;
const PX = 100; // пиксела на метър
const PIVOT = { x: 240, y: 150 };

const PRESETS = [
  { name: 'люлка', m1: 30, x1: -2, m2: 60, x2: 1 },
  { name: 'неравни деца', m1: 20, x1: -1.5, m2: 35, x2: 1.5 },
  { name: 'и двете вляво', m1: 20, x1: -1, m2: 20, x2: -0.5 },
];

/** Лост (люлка): гредата е в равновесие, когато сумата от моментите спрямо опората е нула. */
export default function LeverLab() {
  const [m1, setM1] = useState(30);
  const [x1, setX1] = useState(-2);
  const [m2, setM2] = useState(40);
  const [x2, setX2] = useState(1);

  // Момент по часовниковата стрелка е положителен: тежест вдясно от опората
  const M1 = m1 * G * x1;
  const M2 = m2 * G * x2;
  const net = M1 + M2;
  const balanced = Math.abs(net) < 1e-6;
  // Гредата се накланя към по-големия момент, но не повече от 12°
  const tilt = balanced ? 0 : 12 * Math.tanh(net / 150);
  const rad = (tilt * Math.PI) / 180;
  const at = (x: number) => ({ x: PIVOT.x + x * PX * Math.cos(rad), y: PIVOT.y + x * PX * Math.sin(rad) });

  const weights = [
    { m: m1, x: x1, tone: 'blue' as const, fill: 'fill-blue-500/80' },
    { m: m2, x: x2, tone: 'rose' as const, fill: 'fill-rose-500/80' },
  ];

  const preset = (p: (typeof PRESETS)[number]) => {
    setM1(p.m1);
    setX1(p.x1);
    setM2(p.m2);
    setX2(p.x2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={p.m1 === m1 && p.x1 === x1 && p.m2 === m2 && p.x2 === x2} onClick={() => preset(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 270">
        {/* Деления по гредата през 0,5 m */}
        {[-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2].map(x => {
          const p = at(x);
          return (
            <g key={x}>
              <line x1={p.x} y1={p.y - 5} x2={p.x} y2={p.y + 5} className="stroke-gray-500" />
              {Number.isInteger(x) && (
                <Label p={{ x: p.x, y: p.y - 16 }} size={10} weight={500}>
                  {`${fmtNum(Math.abs(x))} m`}
                </Label>
              )}
            </g>
          );
        })}
        <line x1={at(-2.15).x} y1={at(-2.15).y} x2={at(2.15).x} y2={at(2.15).y} className="stroke-amber-700 dark:stroke-amber-500" strokeWidth="8" strokeLinecap="round" />
        <polygon points={`${PIVOT.x},${PIVOT.y + 4} ${PIVOT.x - 22},${PIVOT.y + 44} ${PIVOT.x + 22},${PIVOT.y + 44}`} className="fill-gray-500" />
        <line x1={PIVOT.x - 70} y1={PIVOT.y + 44} x2={PIVOT.x + 70} y2={PIVOT.y + 44} className="stroke-gray-400" strokeWidth="2" />
        {weights.map(w => {
          const p = at(w.x);
          const size = 14 + Math.sqrt(w.m) * 3.2;
          return (
            <g key={w.tone}>
              <rect x={p.x - size / 2} y={p.y - 4 - size} width={size} height={size} rx={4} className={w.fill} />
              <Label p={{ x: p.x, y: p.y - 4 - size / 2 }} size={11} tone="ink">
                {`${w.m}`}
              </Label>
              <Arrow from={{ x: p.x, y: p.y + 6 }} to={{ x: p.x, y: p.y + 6 + w.m * 1.2 }} tone={w.tone} width={2.5} />
            </g>
          );
        })}
        <Label p={{ x: 240, y: 258 }} size={12} tone={balanced ? 'emerald' : 'rose'}>
          {balanced ? 'Равновесие' : net > 0 ? 'Натежава дясната страна' : 'Натежава лявата страна'}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="m₁, kg" value={m1} onChange={setM1} min={5} max={60} step={5} tone="blue" />
        <Slider label="x₁, m" value={x1} onChange={setX1} min={-2} max={2} step={0.1} tone="blue" />
        <Slider label="m₂, kg" value={m2} onChange={setM2} min={5} max={60} step={5} tone="rose" />
        <Slider label="x₂, m" value={x2} onChange={setX2} min={-2} max={2} step={0.1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'M₁ =', value: `${fmtNum(M1, 1)} N·m`, tone: 'blue' },
            { label: 'M₂ =', value: `${fmtNum(M2, 1)} N·m`, tone: 'rose' },
            { label: 'ΣM =', value: `${fmtNum(net, 1)} N·m` },
          ]}
        />
      </div>
      <Note tone={balanced ? 'emerald' : 'gray'}>
        {balanced
          ? 'Моментите се уравновесяват: m₁·x₁ = m₂·x₂ по големина, но завъртат в противоположни посоки.'
          : `За равновесие при m₂ = ${m2} kg второто тегло трябва да е на x₂ = ${fmtNum((-m1 * x1) / m2, 2)} m.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Положителното x е вдясно от опората. Моментът на теглото е mgx: по-тежкото тегло уравновесява по-лекото, ако е по-близо до опората.
        Числата в квадратчетата са масите в kg, а стрелките – теглата им (g = 9,8 m/s²).
      </p>
    </div>
  );
}
