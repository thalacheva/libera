import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const M = 2;
const LENGTH = 3; // дължина на наклона, m
const BASE = { x: 450, y: 262 }; // долният край на наклона
const PX = 85; // пиксела на метър по наклона
const K = 3.2; // пиксела на нютон за стрелките
const SIDE = 34;

type Block = { d: number; v: number };

/** Блок на наклонена равнина: тежест, нормална реакция и триене; стои или се плъзга. */
export default function InclineLab() {
  const [deg, setDeg] = useState(25);
  const [mu, setMu] = useState(0.3);
  const al = (deg * Math.PI) / 180;
  const along = M * G * Math.sin(al);
  const press = M * G * Math.cos(al);
  const slides = Math.tan(al) > mu;
  // Опростяване: коефициентите на триене при покой и при плъзгане са равни
  const a = slides ? G * (Math.sin(al) - mu * Math.cos(al)) : 0;
  const friction = slides ? mu * press : along;

  // Блокът спира в долния край на наклона (отстъп 0,1 m отгоре плюс собствената му дължина)
  const dMax = LENGTH - 0.1 - SIDE / PX;
  const step = (s: Block, dt: number): Block =>
    s.d >= dMax ? s : { d: Math.min(dMax, s.d + s.v * dt + (a * dt * dt) / 2), v: s.d + s.v * dt >= dMax ? 0 : s.v + a * dt };
  const sim = useSimulation<Block>(() => ({ d: 0, v: 0 }), step);
  const restart = () => sim.reset({ d: 0, v: 0 });
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    restart();
  };

  // Посоки в координатите на SVG: u – надолу по наклона, n – навън от повърхността
  const u = { x: Math.cos(al), y: Math.sin(al) };
  const n = { x: Math.sin(al), y: -Math.cos(al) };
  const top = { x: BASE.x - LENGTH * PX * u.x, y: BASE.y - LENGTH * PX * u.y };
  const foot = { x: top.x + (0.1 + sim.state.d) * PX * u.x, y: top.y + (0.1 + sim.state.d) * PX * u.y };
  const c = { x: foot.x + (SIDE / 2) * u.x + (SIDE / 2) * n.x, y: foot.y + (SIDE / 2) * u.y + (SIDE / 2) * n.y };
  const corners = [
    foot,
    { x: foot.x + SIDE * u.x, y: foot.y + SIDE * u.y },
    { x: foot.x + SIDE * u.x + SIDE * n.x, y: foot.y + SIDE * u.y + SIDE * n.y },
    { x: foot.x + SIDE * n.x, y: foot.y + SIDE * n.y },
  ];
  const at = (dir: { x: number; y: number }, f: number) => ({ x: c.x + dir.x * f * K, y: c.y + dir.y * f * K });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 290">
        <polygon points={`${top.x},${top.y} ${BASE.x},${BASE.y} ${top.x},${BASE.y}`} className="fill-gray-100 stroke-gray-400 dark:fill-gray-700/50 dark:stroke-gray-500" strokeWidth="1.5" />
        <path d={`M ${BASE.x - 46} ${BASE.y} A 46 46 0 0 1 ${BASE.x - 46 * Math.cos(al)} ${BASE.y - 46 * Math.sin(al)}`} fill="none" className="stroke-amber-500" strokeWidth="2" />
        <Label p={{ x: BASE.x - 66 * Math.cos(al / 2), y: BASE.y - 66 * Math.sin(al / 2) }} size={13} tone="amber">
          α
        </Label>
        <polygon points={corners.map(p => `${p.x},${p.y}`).join(' ')} className="fill-sky-200 stroke-sky-600 dark:fill-sky-900" strokeWidth="1.5" />
        {/* Съставящите на тежестта – пунктир */}
        <line x1={c.x} y1={c.y} x2={at(u, along).x} y2={at(u, along).y} className="stroke-gray-400" strokeDasharray="4 3" strokeWidth="2" />
        <line x1={c.x} y1={c.y} x2={at(n, -press).x} y2={at(n, -press).y} className="stroke-gray-400" strokeDasharray="4 3" strokeWidth="2" />
        <Arrow from={c} to={at({ x: 0, y: 1 }, M * G)} tone="violet" label="mg" />
        <Arrow from={c} to={at(n, press)} tone="blue" label="N" />
        {friction > 0.05 && <Arrow from={c} to={at(u, -friction)} tone="rose" label="F" />}
        {slides && sim.state.v > 0.05 && <Arrow from={{ x: c.x + 52 * n.x - 20 * u.x, y: c.y + 52 * n.y - 20 * u.y }} to={{ x: c.x + 52 * n.x + 24 * u.x, y: c.y + 52 * n.y + 24 * u.y }} tone="emerald" width={2} label="a" />}
        <Label p={{ x: 20, y: 24 }} size={13} anchor="start" tone={slides ? 'rose' : 'emerald'}>
          {slides ? 'плъзга се' : 'стои неподвижно'}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={sim.time} />
      <Sliders>
        <Slider label="α, °" value={deg} onChange={change(setDeg)} min={0} max={60} step={1} tone="amber" />
        <Slider label="μ" value={mu} onChange={change(setMu)} min={0} max={1} step={0.05} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'mg sin α =', value: `${fmtNum(along, 1)} N` },
            { label: 'N = mg cos α =', value: `${fmtNum(press, 1)} N`, tone: 'blue' },
            { label: 'триене', value: `${fmtNum(friction, 1)} N`, tone: 'rose' },
            { label: 'a =', value: `${fmtNum(a, 2)} m/s²`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={slides ? 'rose' : 'emerald'}>
        {slides
          ? `tg α = ${fmtNum(Math.tan(al), 2)} > μ – триенето не стига и блокът се плъзга с a = g(sin α − μ cos α).`
          : `tg α = ${fmtNum(Math.tan(al), 2)} ≤ μ – триенето при покой точно уравновесява mg sin α.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Тежестта (лилаво) се разлага на две съставящи (пунктир): по наклона и перпендикулярно на него. Нормалната реакция N уравновесява
        перпендикулярната, а триенето (червено) се противопоставя на плъзгането. Масата е 2 kg, но ускорението от нея не зависи. За простота
        коефициентът на триене при покой и при плъзгане е един и същ.
      </p>
    </div>
  );
}
