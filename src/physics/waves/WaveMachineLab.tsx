import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const LEN = 10; // дължина на показания участък, m
const N = 41; // брой частици
const X0 = 30;
const PX = 42; // пиксела на метър
const MID = 82;
const MARK = 10; // номер на отбелязаната частица

/** Вълна по редица частици: всяка трепти на място, а напред се движи само формата (и енергията). */
export default function WaveMachineLab() {
  const [kind, setKind] = useState<'transverse' | 'longitudinal'>('transverse');
  const [A, setA] = useState(0.6);
  const [f, setF] = useState(0.5);
  const [v, setV] = useState(2);
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 120 });
  const t = sim.state.t;
  const lambda = v / f;

  // Отклонението на частицата с координата x; вълната тръгва от левия край в момента t = 0
  const y = (x: number) => (x <= v * t ? A * Math.sin(2 * Math.PI * f * (t - x / v)) : 0);
  const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * LEN);
  const px = (x: number) => X0 + x * PX;
  const transverse = kind === 'transverse';
  const pos = (x: number) => (transverse ? { x: px(x), y: MID - y(x) * PX } : { x: px(x) + y(x) * PX * 0.5, y: MID });

  // Гребен, от който да отмерим λ: първият след x = 0,5 m, ако λ се побира
  const front = Math.min(v * t, LEN);
  const crest = Array.from({ length: 400 }, (_, i) => 0.5 + i * 0.025).find(x => x + lambda <= front && Math.abs(y(x) - A) < A * 0.02 && Math.abs(y(x + lambda) - A) < A * 0.02);

  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    sim.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={transverse} onClick={() => setKind('transverse')}>
          напречна
        </DiagramButton>
        <DiagramButton active={!transverse} onClick={() => setKind('longitudinal')}>
          надлъжна
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 170">
        <line x1={X0} y1={MID} x2={px(LEN)} y2={MID} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 3" />
        {/* Източникът – ръка, която трепти в левия край */}
        <rect x={X0 - 22} y={MID - 50} width={10} height={100} rx={3} className="fill-gray-200 dark:fill-gray-700" />
        {transverse && (
          <polyline
            points={xs.map(x => `${pos(x).x},${pos(x).y}`).join(' ')}
            fill="none"
            className="stroke-sky-300 dark:stroke-sky-700"
            strokeWidth="1.5"
          />
        )}
        {xs.map((x, i) => {
          const p = pos(x);
          return transverse ? (
            <circle key={i} cx={p.x} cy={p.y} r={i === MARK ? 6 : 4} className={i === MARK ? 'fill-rose-500' : 'fill-sky-500'} />
          ) : (
            <line key={i} x1={p.x} y1={MID - 34} x2={p.x} y2={MID + 34} className={i === MARK ? 'stroke-rose-500' : 'stroke-sky-500'} strokeWidth={i === MARK ? 3 : 2} />
          );
        })}
        {/* Покойното положение на отбелязаната частица */}
        <line x1={px(xs[MARK])} y1={MID - 60} x2={px(xs[MARK])} y2={MID + 60} className="stroke-rose-400" strokeDasharray="2 3" />
        {crest !== undefined && transverse && (
          <g>
            <line x1={px(crest)} y1={MID - A * PX - 12} x2={px(crest + lambda)} y2={MID - A * PX - 12} className="stroke-amber-500" strokeWidth="2" />
            <line x1={px(crest)} y1={MID - A * PX - 18} x2={px(crest)} y2={MID - A * PX - 6} className="stroke-amber-500" strokeWidth="2" />
            <line x1={px(crest + lambda)} y1={MID - A * PX - 18} x2={px(crest + lambda)} y2={MID - A * PX - 6} className="stroke-amber-500" strokeWidth="2" />
            <Label p={{ x: px(crest + lambda / 2), y: MID - A * PX - 24 }} size={13} tone="amber">
              λ
            </Label>
          </g>
        )}
        {[0, 2, 4, 6, 8, 10].map(m => (
          <Label key={m} p={{ x: px(m), y: 160 }} size={10} weight={500}>
            {String(m)}
          </Label>
        ))}
        <Label p={{ x: px(LEN), y: 146 }} size={10} anchor="end">
          x, m
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} time={t} />
      <Sliders>
        <Slider label="A, m" value={A} onChange={setA} min={0.2} max={1} step={0.1} tone="rose" />
        <Slider label="f, Hz" value={f} onChange={change(setF)} min={0.2} max={1.5} step={0.1} tone="violet" />
        <Slider label="v, m/s" value={v} onChange={change(setV)} min={1} max={4} step={0.5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'λ = v/f =', value: `${fmtNum(lambda, 2)} m`, tone: 'amber' },
            { label: 'T = 1/f =', value: `${fmtNum(1 / f, 2)} s`, tone: 'violet' },
            { label: 'фронтът е на', value: `${fmtNum(front, 1)} m`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="rose">
        {transverse
          ? 'Червената частица се движи само нагоре-надолу – напред бяга формата на вълната, а не веществото.'
          : 'Червената частица трепти напред-назад около мястото си; сгъстяванията и разреженията бягат напред.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При напречната вълна частиците трептят перпендикулярно на посоката на разпространение (въже), а при надлъжната – по нея (пружина,
        звук). За един период T вълната изминава точно една дължина на вълната λ, затова v = λ/T = λf. При надлъжната вълна отклонението е
        показано намалено наполовина.
      </p>
    </div>
  );
}
