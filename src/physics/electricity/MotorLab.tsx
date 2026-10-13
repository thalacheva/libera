import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const TURNS = 50;
const AREA = 2e-3; // 5 cm × 4 cm, m²
const J = 4e-3; // инерчен момент на рамката с оста, kg·m²
const FRICTION = 0.01; // N·m·s – триене в лагерите

const C = { x: 170, y: 130 };
const HALF = 70; // половината от ширината на рамката на екрана
const G = { left: 340, right: 470, top: 50, bottom: 190 };

type Rotor = { phi: number; om: number };

/** Посоката на тока в страната A: +1 – излиза от листа (⊙). С колектор токът се обръща на всеки половин оборот. */
const currentSign = (phi: number, commutator: boolean) => (commutator ? (Math.sin(phi) > 0 ? -1 : 1) : 1);

/** Рамка с ток между полюсите на магнит: сили на Ампер, въртящ момент и роля на колектора. */
export default function MotorLab() {
  const [B, setB] = useState(0.5);
  const [I, setI] = useState(2);
  const [commutator, setCommutator] = useState(true);
  const mMax = TURNS * B * I * AREA;

  // φ – ъгълът на рамката от вертикалата, по часовниковата стрелка на екрана.
  // При ток ⊙ в страната A силата върху нея е нагоре и моментът е −M_max·sin φ.
  const torque = (phi: number) => -currentSign(phi, commutator) * mMax * Math.sin(phi);
  const step = (s: Rotor, dt: number): Rotor => {
    const om = s.om + ((torque(s.phi) - FRICTION * s.om) / J) * dt;
    return { phi: s.phi + om * dt, om };
  };
  const init = (): Rotor => ({ phi: (60 * Math.PI) / 180, om: 0 });
  const sim = useSimulation<Rotor>(init, step);

  const { phi, om } = sim.state;
  const sA = currentSign(phi, commutator);
  const a = { x: C.x + HALF * Math.sin(phi), y: C.y - HALF * Math.cos(phi) };
  const b = { x: C.x - HALF * Math.sin(phi), y: C.y + HALF * Math.cos(phi) };
  // Сила върху страна с ток ⊙ в поле надясно: нагоре (лявото правило)
  const fLen = 14 + 30 * (B * I) / 5;
  const M = torque(phi);
  const phiDeg = (((phi * 180) / Math.PI) % 360 + 360) % 360;

  const gx = (deg: number) => G.left + (deg / 360) * (G.right - G.left);
  const gy = (m: number) => (G.top + G.bottom) / 2 - m * ((G.bottom - G.top) / 2 - 6);
  const curve = Array.from({ length: 121 }, (_, i) => {
    const d = i * 3;
    const r = (d * Math.PI) / 180;
    return `${i ? 'L' : 'M'} ${gx(d).toFixed(1)} ${gy(-currentSign(r, commutator) * Math.sin(r)).toFixed(1)}`;
  }).join(' ');

  const wireMark = (p: { x: number; y: number }, out: boolean, name: string) => (
    <g>
      <circle cx={p.x} cy={p.y} r={10} className="fill-amber-100 stroke-amber-600" strokeWidth="2" />
      {out ? <circle cx={p.x} cy={p.y} r={3} className="fill-amber-700" /> : <path d={`M ${p.x - 5} ${p.y - 5} L ${p.x + 5} ${p.y + 5} M ${p.x + 5} ${p.y - 5} L ${p.x - 5} ${p.y + 5}`} className="stroke-amber-700" strokeWidth="2" />}
      <Label p={{ x: p.x + (p.x >= C.x ? 18 : -18), y: p.y + (p.y < C.y ? -12 : 12) }} size={12} anchor={p.x >= C.x ? 'start' : 'end'}>
        {name}
      </Label>
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 260">
        {/* Полюсите и полето между тях */}
        <rect x={20} y={40} width={36} height={180} rx={4} className="fill-rose-500" />
        <rect x={284} y={40} width={36} height={180} rx={4} className="fill-blue-500" />
        <text x={38} y={130} fontSize={18} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          N
        </text>
        <text x={302} y={130} fontSize={18} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          S
        </text>
        {[60, 95, 165, 200].map(y => (
          <g key={y}>
            <line x1={62} y1={y} x2={278} y2={y} className="stroke-sky-300" strokeDasharray="5 5" />
            <polygon points={`270,${y - 4} 278,${y} 270,${y + 4}`} className="fill-sky-400" />
          </g>
        ))}
        <Label p={{ x: 72, y: 236 }} size={12} tone="blue" anchor="start">
          {`B = ${fmtNum(B, 2)} T →`}
        </Label>

        {/* Рамката в разрез: оста е перпендикулярна на листа */}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-amber-500" strokeWidth="4" />
        <circle cx={C.x} cy={C.y} r={5} className="fill-gray-600" />
        {I > 0 && <Arrow from={a} to={{ x: a.x, y: a.y - sA * fLen }} tone="rose" label="F" />}
        {I > 0 && <Arrow from={b} to={{ x: b.x, y: b.y + sA * fLen }} tone="rose" label="F" />}
        {wireMark(a, sA > 0, 'A')}
        {wireMark(b, sA < 0, 'B')}

        {/* Въртящ момент в зависимост от ъгъла */}
        <rect x={G.left} y={G.top} width={G.right - G.left} height={G.bottom - G.top} className="fill-gray-50 dark:fill-gray-900/40" />
        <line x1={G.left} y1={gy(0)} x2={G.right} y2={gy(0)} className="stroke-gray-400" />
        <path d={curve} fill="none" className="stroke-violet-500" strokeWidth="2.5" />
        <circle cx={gx(phiDeg)} cy={gy(M / (mMax || 1))} r={5} className="fill-violet-600" />
        <Label p={{ x: (G.left + G.right) / 2, y: G.top - 14 }} size={11} tone="violet">
          въртящ момент
        </Label>
        {[0, 180, 360].map(d => (
          <Label key={d} p={{ x: gx(d), y: G.bottom + 12 }} size={10} weight={500}>
            {`${d}°`}
          </Label>
        ))}
        <Label p={{ x: G.right, y: G.bottom + 28 }} size={10} anchor="end">
          ъгъл φ
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset(init())} />
      <Sliders>
        <Slider label="B, T" value={B} onChange={setB} min={0.1} max={1} step={0.05} tone="blue" />
        <Slider label="I, A" value={I} onChange={setI} min={0} max={3} step={0.1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={commutator} onClick={() => setCommutator(true)}>
          с колектор
        </DiagramButton>
        <DiagramButton active={!commutator} onClick={() => setCommutator(false)}>
          без колектор
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'M_max = NBIS =', value: `${fmtNum(mMax, 3)} N·m`, tone: 'violet' },
            { label: 'обороти', value: `${fmtNum((Math.abs(om) * 60) / (2 * Math.PI), 0)} /min` },
          ]}
        />
      </div>
      <Note tone="gray">
        {commutator
          ? 'Колекторът обръща тока на всеки половин оборот – моментът винаги върти в една посока и двигателят се върти непрекъснато.'
          : 'Без колектор рамката се люлее и спира там, където равнината ѝ е перпендикулярна на полето – моментът там е нула.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Гледаме рамката отстрани: страните A и B са перпендикулярни на листа (⊙ – токът излиза, ⊗ – влиза). Силите на Ампер са равни и
        противоположни, но не лежат на една права – затова завъртат рамката. Рамката има {TURNS} навивки с площ 20 cm²; триенето в лагерите
        е малко.
      </p>
    </div>
  );
}
