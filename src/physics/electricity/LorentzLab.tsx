import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '~/physics/SimControls';
import { fmtNum, sig, useSimulation } from '~/physics/sim';

const E_CHARGE = 1.602e-19;
const W = 480;
const H = 280;
const FIELD = { left: 110, right: 470, top: 10, bottom: 270 };
const Y0 = 140; // височина на влизане (в координатите на SVG)

type Particle = {
  name: string;
  q: number; // в елементарни заряди
  m: number; // kg
  vUnit: number; // единица за скоростта на плъзгача, m/s
  vLabel: string;
  bUnit: number; // единица за B, T
  bLabel: string;
  ppm: number; // пиксела на метър
  k: number; // колко пъти е забавено времето
  v: [number, number, number];
  b: [number, number, number];
  e: [number, number]; // E в kV/m: максимум и стъпка
};

const LIGHT = { vUnit: 1e6, vLabel: '10⁶ m/s', bUnit: 1e-3, bLabel: 'mT', ppm: 5500, k: 2.24e8, v: [2, 8, 4] as [number, number, number], b: [1, 4, 2] as [number, number, number], e: [20, 0.5] as [number, number] };
const HEAVY = { vUnit: 1e5, vLabel: '10⁵ m/s', bUnit: 1, bLabel: 'T', ppm: 1200, k: 6.1e6, v: [2, 8, 5] as [number, number, number], b: [0.05, 0.2, 0.1] as [number, number, number], e: [120, 2] as [number, number] };

const PARTICLES: Particle[] = [
  { name: 'електрон', q: -1, m: 9.109e-31, ...LIGHT },
  { name: 'позитрон', q: 1, m: 9.109e-31, ...LIGHT },
  { name: 'протон', q: 1, m: 1.673e-27, ...HEAVY },
  { name: 'алфа частица', q: 2, m: 6.645e-27, ...HEAVY },
];

type State = { x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[]; out: boolean };

const inField = (x: number, y: number) => x >= FIELD.left && x <= FIELD.right && y >= FIELD.top && y <= FIELD.bottom;

/** Заредена частица в еднородно магнитно поле (⊗): сила на Лоренц и движение по окръжност; по желание – и електрично поле (селектор на скорости). */
export default function LorentzLab() {
  const [k, setK] = useState(0);
  const P = PARTICLES[k];
  const [v, setV] = useState(P.v[2]);
  const [b, setB] = useState(P.b[2]);
  const [withE, setWithE] = useState(false);
  const [e, setE] = useState(8);

  const vReal = v * P.vUnit;
  const bReal = b * P.bUnit;
  const eReal = withE ? e * 1e3 : 0;
  const q = P.q * E_CHARGE;
  // Ъглова скорост на екрана (rad/s) и ускорение от електричното поле (px/s²); координатите тук са „математически“ (y нагоре)
  const omega = (Math.abs(q) * bReal) / P.m / P.k;
  const aE = (-(q * eReal) / P.m) * (P.ppm / (P.k * P.k));
  const sgn = Math.sign(P.q);

  const init = (): State => ({ x: 10, y: 0, vx: (vReal * P.ppm) / P.k, vy: 0, trail: [{ x: 10, y: 0 }], out: false });
  const step = (s: State, dt: number): State => {
    if (s.out) return s;
    let { x, y, vx, vy } = s;
    const n = 8;
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const ins = inField(x, Y0 - y);
      // Средна точка: a = sgn·ω·(−v_y, v_x) + (0, aE) вътре в полето
      const acc = (ux: number, uy: number) => (ins ? [sgn * omega * -uy, sgn * omega * ux + aE] : [0, 0]);
      const [ax1, ay1] = acc(vx, vy);
      const mx = vx + (ax1 * h) / 2;
      const my = vy + (ay1 * h) / 2;
      const [ax2, ay2] = acc(mx, my);
      x += mx * h;
      y += my * h;
      vx += ax2 * h;
      vy += ay2 * h;
    }
    const out = x < -5 || x > W + 5 || Y0 - y < -5 || Y0 - y > H + 5;
    s.trail.push({ x, y });
    return { x, y, vx, vy, trail: s.trail, out };
  };
  const sim = useSimulation<State>(init, step);
  const restart = () => sim.reset(init());

  const choose = (i: number) => {
    const N = PARTICLES[i];
    setK(i);
    setV(N.v[2]);
    setB(N.b[2]);
    setE(i >= 2 ? 50 : 8);
    sim.reset({ x: 10, y: 0, vx: (N.v[2] * N.vUnit * N.ppm) / N.k, vy: 0, trail: [{ x: 10, y: 0 }], out: false });
  };
  // След промяна частицата тръгва отначало (началното състояние зависи само от скоростта)
  const start = (vNew: number): State => ({ x: 10, y: 0, vx: (vNew * P.vUnit * P.ppm) / P.k, vy: 0, trail: [{ x: 10, y: 0 }], out: false });
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    sim.reset(start(v));
  };
  const changeV = (n: number) => {
    setV(n);
    sim.reset(start(n));
  };

  const r = (P.m * vReal) / (Math.abs(q) * bReal);
  const T = (2 * Math.PI * P.m) / (Math.abs(q) * bReal);
  const F = Math.abs(q) * vReal * bReal;
  const vSel = eReal / bReal;
  const s = sim.state;
  const pos = { x: s.x, y: Y0 - s.y };
  const ins = inField(pos.x, pos.y);
  // Посока на магнитната сила: q·v×B, B към листа
  const fm = { x: sgn * -s.vy, y: sgn * s.vx };
  const fmLen = Math.hypot(fm.x, fm.y) || 1;
  const cmPx = P.ppm / 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PARTICLES.map((p, i) => (
          <DiagramButton key={p.name} active={i === k} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        <rect x={FIELD.left} y={FIELD.top} width={FIELD.right - FIELD.left} height={FIELD.bottom - FIELD.top} rx={6} className="fill-violet-500/10 stroke-violet-400" strokeDasharray="5 4" />
        {Array.from({ length: 6 }, (_, i) => i).flatMap(i =>
          Array.from({ length: 5 }, (_, j) => j).map(j => {
            const cx = FIELD.left + 30 + i * 62;
            const cy = FIELD.top + 26 + j * 52;
            return <path key={`${i}-${j}`} d={`M ${cx - 4} ${cy - 4} L ${cx + 4} ${cy + 4} M ${cx + 4} ${cy - 4} L ${cx - 4} ${cy + 4}`} className="stroke-violet-400/70" strokeWidth="1.5" />;
          }),
        )}
        {withE && (
          <g>
            {[0.25, 0.5, 0.75].map(f => {
              const x = FIELD.left + f * (FIELD.right - FIELD.left);
              return <Arrow key={f} from={{ x, y: FIELD.top + 30 }} to={{ x, y: FIELD.top + 70 }} tone="amber" width={2} />;
            })}
            <Label p={{ x: FIELD.left + 0.25 * (FIELD.right - FIELD.left) + 16, y: FIELD.top + 50 }} size={12} tone="amber" anchor="start">
              E
            </Label>
          </g>
        )}
        <Label p={{ x: FIELD.right - 8, y: FIELD.bottom - 12 }} size={12} anchor="end" tone="violet">
          {`B ⊗ ${fmtNum(b, 2)} ${P.bLabel}`}
        </Label>

        {/* Мащаб: 1 cm */}
        <line x1={14} y1={H - 14} x2={14 + cmPx} y2={H - 14} className="stroke-gray-500" strokeWidth="2" />
        <Label p={{ x: 14 + cmPx / 2, y: H - 26 }} size={10}>
          1 cm
        </Label>

        <polyline points={s.trail.map(p => `${p.x.toFixed(1)},${(Y0 - p.y).toFixed(1)}`).join(' ')} fill="none" className="stroke-rose-400" strokeWidth="2" />
        <Arrow from={pos} to={{ x: pos.x + (s.vx / Math.hypot(s.vx, s.vy || 0.0001)) * 30, y: pos.y - (s.vy / Math.hypot(s.vx, s.vy || 0.0001)) * 30 }} tone="blue" width={2} label="v" />
        {ins && <Arrow from={pos} to={{ x: pos.x + (fm.x / fmLen) * 30, y: pos.y - (fm.y / fmLen) * 30 }} tone="rose" width={2} label="F" />}
        <circle cx={pos.x} cy={pos.y} r={7} className={P.q > 0 ? 'fill-rose-500' : 'fill-blue-500'} />
        <text x={pos.x} y={pos.y + 0.5} fontSize={11} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          {P.q > 0 ? '+' : '−'}
        </text>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} />
      <Sliders>
        <Slider label="v" value={v} onChange={changeV} min={P.v[0]} max={P.v[1]} step={0.5} tone="blue" />
        <Slider label="B" value={b} onChange={change(setB)} min={P.b[0]} max={P.b[1]} step={P.b[0] < 0.1 ? 0.01 : 0.25} tone="violet" />
        {withE && <Slider label="E" value={e} onChange={change(setE)} min={0} max={P.e[0]} step={P.e[1]} tone="amber" />}
      </Sliders>
      <Buttons>
        <DiagramButton active={!withE} onClick={() => setWithE(false)}>
          само B
        </DiagramButton>
        <DiagramButton active={withE} onClick={() => setWithE(true)}>
          B и E (селектор)
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'v =', value: `${fmtNum(v, 1)} · ${P.vLabel}`, tone: 'blue' },
            { label: 'F = |q|vB =', value: `${sig(F, 3)} N`, tone: 'rose' },
            { label: 'r =', value: `${fmtNum(r * 100, 2)} cm` },
            { label: 'T =', value: T < 1e-6 ? `${fmtNum(T * 1e9, 1)} ns` : `${fmtNum(T * 1e6, 3)} µs` },
            ...(withE ? [{ label: 'E/B =', value: `${sig(vSel, 3)} m/s`, tone: 'amber' as const }] : []),
          ]}
        />
      </div>
      <Note tone="gray">
        {withE
          ? Math.abs(vSel - vReal) / vReal < 0.03
            ? 'v = E/B: електричната и магнитната сила се уравновесяват и частицата минава право.'
            : 'Частицата се отклонява. Само частици със скорост v = E/B минават право – така работи селекторът на скорости.'
          : 'Силата е перпендикулярна на скоростта: тя завърта частицата, но не я ускорява. Периодът не зависи от скоростта.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Магнитното поле е насочено към листа (⊗). Положителната частица завива нагоре, отрицателната – надолу. Удвои скоростта – радиусът се
        удвоява, а периодът остава същият. Движението е забавено милиони пъти.
      </p>
    </div>
  );
}
