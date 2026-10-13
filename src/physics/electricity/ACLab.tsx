import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const R = 529; // крушка 100 W при 230 V
const WINDOW = 0.04; // секунди на екрана
const U_AXIS = 400; // V
const P_AXIS = (U_AXIS * U_AXIS) / R; // W
const SLOW = 50; // анимацията е забавена 50 пъти

const G = { left: 46, right: 356 };
const UP = { top: 18, mid: 78, h: 60 };
const PW = { top: 150, bottom: 226 };
const gx = (t: number) => G.left + (t / WINDOW) * (G.right - G.left);
const gu = (u: number) => UP.mid - (u / U_AXIS) * UP.h;
const gp = (p: number) => PW.bottom - (p / P_AXIS) * (PW.bottom - PW.top);

const PRESETS = [
  { name: '230 V, 50 Hz', U: 230, f: 50 },
  { name: '120 V, 60 Hz', U: 120, f: 60 },
];

/** Осцилоскоп: синусоидално напрежение, ефективна стойност и мощността в крушка. */
export default function ACLab() {
  const [Um, setUm] = useState(325);
  const [f, setF] = useState(50);
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 240, speed: 1 / SLOW });

  const w = 2 * Math.PI * f;
  const U = Um / Math.SQRT2;
  const u = (t: number) => Um * Math.sin(w * t);
  const P = (U * U) / R;
  // Курсорът обикаля прозореца от 40 ms отново и отново
  const tc = sim.state.t % WINDOW;
  const pc = (u(sim.state.t) ** 2) / R;

  const path = (fn: (t: number) => number) =>
    Array.from({ length: 241 }, (_, i) => (i / 240) * WINDOW)
      .map((t, i) => `${i ? 'L' : 'M'} ${gx(t).toFixed(1)} ${fn(t).toFixed(1)}`)
      .join(' ');

  const preset = (p: (typeof PRESETS)[number]) => {
    setUm(Math.round(p.U * Math.SQRT2));
    setF(p.f);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={Math.round(p.U * Math.SQRT2) === Um && p.f === f} onClick={() => preset(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 262">
        {/* Напрежение */}
        <rect x={G.left} y={UP.top} width={G.right - G.left} height={2 * UP.h} className="fill-gray-50 dark:fill-gray-900/40" />
        {[10, 20, 30].map(ms => (
          <line key={ms} x1={gx(ms / 1000)} y1={UP.top} x2={gx(ms / 1000)} y2={UP.top + 2 * UP.h} className="stroke-gray-200 dark:stroke-gray-700" />
        ))}
        <line x1={G.left} y1={UP.mid} x2={G.right} y2={UP.mid} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={G.left} y1={gu(Um)} x2={G.right} y2={gu(Um)} className="stroke-rose-400" strokeDasharray="5 4" />
        <line x1={G.left} y1={gu(U)} x2={G.right} y2={gu(U)} className="stroke-emerald-500" strokeDasharray="2 3" strokeWidth="1.5" />
        <Label p={{ x: G.left - 5, y: gu(Um) - 2 }} size={10} anchor="end" tone="rose">
          {fmtNum(Um, 0)}
        </Label>
        <Label p={{ x: G.left - 5, y: gu(U) + 9 }} size={10} anchor="end" tone="emerald">
          {fmtNum(U, 0)}
        </Label>
        <Label p={{ x: G.left - 5, y: UP.mid }} size={10} anchor="end">
          0
        </Label>
        <Label p={{ x: G.right + 6, y: UP.mid }} size={11} anchor="start" tone="blue">
          u, V
        </Label>
        <path d={path(t => gu(u(t)))} fill="none" className="stroke-blue-500" strokeWidth="2.5" />

        {/* Мощност в крушката */}
        <rect x={G.left} y={PW.top} width={G.right - G.left} height={PW.bottom - PW.top} className="fill-gray-50 dark:fill-gray-900/40" />
        {[10, 20, 30].map(ms => (
          <line key={ms} x1={gx(ms / 1000)} y1={PW.top} x2={gx(ms / 1000)} y2={PW.bottom} className="stroke-gray-200 dark:stroke-gray-700" />
        ))}
        <line x1={G.left} y1={PW.bottom} x2={G.right} y2={PW.bottom} className="stroke-gray-400 dark:stroke-gray-500" />
        <path d={path(t => gp(u(t) ** 2 / R))} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
        <line x1={G.left} y1={gp(P)} x2={G.right} y2={gp(P)} className="stroke-emerald-500" strokeDasharray="2 3" strokeWidth="1.5" />
        <Label p={{ x: G.left - 5, y: gp(P) }} size={10} anchor="end" tone="emerald">
          {fmtNum(P, 0)}
        </Label>
        <Label p={{ x: G.right + 6, y: (PW.top + PW.bottom) / 2 }} size={11} anchor="start" tone="amber">
          p, W
        </Label>
        {[0, 10, 20, 30, 40].map(ms => (
          <Label key={ms} p={{ x: gx(ms / 1000), y: PW.bottom + 12 }} size={10} weight={500}>
            {String(ms)}
          </Label>
        ))}
        <Label p={{ x: G.right, y: PW.bottom + 24 }} size={10} anchor="end">
          t, ms
        </Label>

        {/* Курсор и крушка */}
        <line x1={gx(tc)} y1={UP.top} x2={gx(tc)} y2={PW.bottom} className="stroke-gray-500" strokeDasharray="3 3" />
        <circle cx={gx(tc)} cy={gu(u(sim.state.t))} r={5} className="fill-blue-500" />
        <circle cx={gx(tc)} cy={gp(pc)} r={5} className="fill-amber-500" />
        <circle cx={420} cy={98} r={34} className="fill-amber-300" opacity={0.15 + 0.85 * (pc / P_AXIS)} />
        <circle cx={420} cy={98} r={22} fill="none" className="stroke-gray-500" strokeWidth="2" />
        <rect x={410} y={120} width={20} height={16} className="fill-gray-400" />
        <Label p={{ x: 420, y: 154 }} size={11}>
          крушка
        </Label>
        <Label p={{ x: 420, y: 170 }} size={10}>
          {`R = ${R} Ω`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="Uₘ, V" value={Um} onChange={setUm} min={20} max={400} step={1} tone="rose" />
        <Slider label="f, Hz" value={f} onChange={setF} min={25} max={100} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'U = Uₘ/√2 =', value: `${fmtNum(U, 0)} V`, tone: 'emerald' },
            { label: 'T =', value: `${fmtNum(1000 / f, 1)} ms`, tone: 'blue' },
            { label: 'I =', value: `${fmtNum(U / R, 2)} A` },
            { label: 'P =', value: `${fmtNum(P, 0)} W`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">{`Мощността пулсира от 0 до ${fmtNum((Um * Um) / R, 0)} W с честота ${fmtNum(2 * f)} Hz, а средната ѝ стойност е точно половината – ${fmtNum(P, 0)} W.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пунктирът в червено е максималното напрежение Uₘ, а зеленият – ефективното U = Uₘ/√2: постоянно напрежение с такава стойност би
        загряло крушката също толкова. Анимацията е забавена 50 пъти – в действителност яркостта пулсира 100 пъти в секунда, твърде бързо за
        окото (а нажежената жичка почти не успява да изстине).
      </p>
    </div>
  );
}
