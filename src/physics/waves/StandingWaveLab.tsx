import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const L = 0.65; // дължина на струната, m (като китара)
const X0 = 40;
const X1 = 440;
const MID = 80;
const AMP = 22; // амплитуда на всяка от бягащите вълни в пиксели
// Анимацията е силно забавена: показваме едно трептене за около секунда
const SHOW_F = 0.8;
const ORD: Record<number, string> = { 2: 'ри', 3: 'ти', 4: 'ти', 5: 'ти' };

/** Стояща вълна по струна със закрепени краища: сбор от две еднакви вълни, които бягат в противоположни посоки. */
export default function StandingWaveLab() {
  const [n, setN] = useState(2);
  const [v, setV] = useState(400);
  const [parts, setParts] = useState(false);
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 120 });
  const t = sim.state.t;

  const k = (n * Math.PI) / (X1 - X0);
  const w = 2 * Math.PI * SHOW_F;
  const y1 = (x: number) => AMP * Math.sin(k * (x - X0) - w * t);
  const y2 = (x: number) => AMP * Math.sin(k * (x - X0) + w * t);
  // y1 + y2 = 2A·sin(kx)·cos(ωt) – краищата винаги са неподвижни
  const sum = (x: number) => y1(x) + y2(x);
  const xs = Array.from({ length: 201 }, (_, i) => X0 + (i / 200) * (X1 - X0));
  const path = (f: (x: number) => number) => xs.map((x, i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${(MID - f(x)).toFixed(1)}`).join(' ');

  const lambda = (2 * L) / n;
  const freq = (n * v) / (2 * L);
  const nodes = Array.from({ length: n + 1 }, (_, i) => X0 + (i / n) * (X1 - X0));
  const antinodes = Array.from({ length: n }, (_, i) => X0 + ((i + 0.5) / n) * (X1 - X0));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {[1, 2, 3, 4, 5].map(m => (
          <DiagramButton key={m} active={m === n} onClick={() => setN(m)}>
            {m === 1 ? 'основен тон' : `${m}-${ORD[m]} хармоник`}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 160">
        {/* Обвивката – най-голямото отклонение на всяка точка */}
        <path d={path(x => 2 * AMP * Math.sin(k * (x - X0)))} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <path d={path(x => -2 * AMP * Math.sin(k * (x - X0)))} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        {parts && (
          <>
            <path d={path(y1)} fill="none" className="stroke-amber-400" strokeWidth="1.5" />
            <path d={path(y2)} fill="none" className="stroke-violet-400" strokeWidth="1.5" />
          </>
        )}
        <path d={path(sum)} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="3" />
        {nodes.map(x => (
          <circle key={x} cx={x} cy={MID} r={5} className="fill-gray-700 dark:fill-gray-200" />
        ))}
        {antinodes.map(x => (
          <circle key={x} cx={x} cy={MID - 2 * AMP - 10} r={4} className="fill-none stroke-emerald-500" strokeWidth="2" />
        ))}
        {/* Закрепените краища */}
        <rect x={X0 - 10} y={MID - 30} width={8} height={60} className="fill-gray-400" />
        <rect x={X1 + 2} y={MID - 30} width={8} height={60} className="fill-gray-400" />
        <Label p={{ x: X0, y: 146 }} size={11} anchor="start">
          възли ●
        </Label>
        <Label p={{ x: X1, y: 146 }} size={11} anchor="end" tone="emerald">
          пучности ○
        </Label>
        <Label p={{ x: (X0 + X1) / 2, y: 146 }} size={11}>
          {`L = ${fmtNum(L, 2)} m`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Buttons>
        <DiagramButton active={parts} onClick={() => setParts(!parts)}>
          {parts ? 'скрий бягащите вълни' : 'покажи двете бягащи вълни'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="v, m/s" value={v} onChange={setV} min={100} max={500} step={10} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'n =', value: String(n) },
            { label: 'λ = 2L/n =', value: `${fmtNum(lambda, 3)} m`, tone: 'amber' },
            { label: 'f = nv/2L =', value: `${fmtNum(freq, 0)} Hz`, tone: 'violet' },
            { label: 'възли', value: String(n + 1) },
          ]}
        />
      </div>
      <Note tone="gray">{`Между два съседни възела е половин дължина на вълната: ${fmtNum(lambda / 2, 3)} m.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вълната се отразява от закрепените краища и се среща със себе си. Двете бягащи вълни (жълта и лилава) се събират в стояща вълна
        (синя), която „не бяга“: възлите са винаги неподвижни, а пучностите трептят най-силно. По струната се побират само цял брой половинки
        от λ. Скоростта v зависи от опъна и дебелината на струната. Анимацията е забавена стотици пъти.
      </p>
    </div>
  );
}
