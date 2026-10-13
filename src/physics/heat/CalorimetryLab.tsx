import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const C_WATER = 4200;
const C_ICE = 2100;
const LAMBDA = 334000; // топлина на топене на леда, J/kg

type Material = { name: string; c: number; water?: boolean; ice?: boolean; min: number; max: number; t0: number };

const MATERIALS: Material[] = [
  { name: 'вода', c: C_WATER, water: true, min: 0, max: 100, t0: 80 },
  { name: 'лед', c: C_ICE, ice: true, min: -30, max: 0, t0: -10 },
  { name: 'алуминий', c: 900, min: -20, max: 100, t0: 100 },
  { name: 'желязо', c: 460, min: -20, max: 100, t0: 100 },
  { name: 'мед', c: 385, min: -20, max: 100, t0: 100 },
];

type Body = { mat: Material; m: number; t: number };

/** Енталпия на тялото спрямо „лед при 0 °C“ (за водата и леда) или спрямо 0 °C (за металите). */
function enthalpy(b: Body) {
  if (b.mat.water) return b.m * LAMBDA + b.m * C_WATER * b.t;
  if (b.mat.ice) return b.m * C_ICE * b.t;
  return b.m * b.mat.c * b.t;
}

/** Състояние на тялото при дадена енталпия: температура и стопена част (за вода/лед). */
function stateOf(b: Body, H: number) {
  if (!b.mat.water && !b.mat.ice) return { t: H / (b.m * b.mat.c), liquid: 0 };
  if (H < 0) return { t: H / (b.m * C_ICE), liquid: 0 };
  if (H <= b.m * LAMBDA) return { t: 0, liquid: H / LAMBDA };
  return { t: (H - b.m * LAMBDA) / (b.m * C_WATER), liquid: b.m };
}

/** Енталпия на тялото при температура t: водата и ледът над 0 °C са течни, под 0 °C – твърди. */
function enthalpyAt(x: Body, t: number) {
  if (x.mat.water || x.mat.ice) return t > 0 ? x.m * LAMBDA + x.m * C_WATER * t : x.m * C_ICE * t;
  return x.m * x.mat.c * t;
}

const isWater = (x: Body) => Boolean(x.mat.water || x.mat.ice);

/**
 * Крайното равновесие: търсим температура, при която сумата от енталпиите се запазва.
 * Ако енергията стига само за част от топенето, крайната температура е 0 °C, а liquid е стопената маса.
 * hA е енталпията на тялото A в края – от нея следва колко топлина A дава на B.
 */
function equilibrium(a: Body, b: Body) {
  const total = enthalpy(a) + enthalpy(b);
  const meltable = (isWater(a) ? a.m : 0) + (isWater(b) ? b.m : 0);
  const low = enthalpyAt(a, 0) + enthalpyAt(b, 0);
  if (meltable > 0 && total >= low && total <= low + meltable * LAMBDA) {
    const liquid = (total - low) / LAMBDA;
    // Водните тела се смесват – стопената маса делим пропорционално на масите им
    const hA = isWater(a) ? ((liquid * a.m) / meltable) * LAMBDA : 0;
    return { t: 0, liquid, meltable, hA };
  }
  let lo = -40;
  let hi = 110;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (enthalpyAt(a, mid) + enthalpyAt(b, mid) > total) hi = mid;
    else lo = mid;
  }
  const t = (lo + hi) / 2;
  return { t, liquid: t > 0 ? meltable : 0, meltable, hA: enthalpyAt(a, t) };
}

const TAU = 1.2; // колко бързо се изравняват температурите в анимацията, s
const END = 6 * TAU;

// Графика на температурите
const G = { left: 230, right: 466, top: 18, bottom: 196 };
const gx = (t: number) => G.left + (t / END) * (G.right - G.left);
const gy = (T: number) => G.bottom - ((T + 40) / 140) * (G.bottom - G.top);

/** Калориметър: две тела в топлоизолиран съд си разменят топлина, докато температурите им се изравнят. */
export default function CalorimetryLab() {
  const [ia, setIa] = useState(0);
  const [ib, setIb] = useState(1);
  const [ma, setMa] = useState(0.5);
  const [mb, setMb] = useState(0.1);
  const [ta, setTa] = useState(40);
  const [tb, setTb] = useState(-10);
  const A: Body = { mat: MATERIALS[ia], m: ma, t: ta };
  const B: Body = { mat: MATERIALS[ib], m: mb, t: tb };

  const sim = useSimulation<{ s: number }>(() => ({ s: 0 }), (st, dt) => (st.s >= END ? st : { s: st.s + dt }), { dt: 1 / 120 });
  const restart = () => sim.reset({ s: 0 });

  const eq = equilibrium(A, B);
  // Топлината, която минава от A към B до края
  const Q = enthalpy(A) - eq.hA;
  const share = (s: number) => 1 - Math.exp(-s / TAU);
  const now = (s: number) => {
    const q = Q * share(s);
    return [stateOf(A, enthalpy(A) - q), stateOf(B, enthalpy(B) + q)];
  };
  const [sa, sb] = now(sim.state.s);

  const curve = (k: 0 | 1, to: number) =>
    Array.from({ length: 81 }, (_, i) => (i / 80) * to)
      .map((s, i) => `${i ? 'L' : 'M'} ${gx(s).toFixed(1)} ${gy(now(s)[k].t).toFixed(1)}`)
      .join(' ');

  const pick = (which: 'a' | 'b') => (i: number) => {
    const m = MATERIALS[i];
    if (which === 'a') {
      setIa(i);
      setTa(m.t0);
    } else {
      setIb(i);
      setTb(m.t0);
    }
    restart();
  };
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    restart();
  };

  const thermo = (x: number, T: number, tone: string, name: string) => (
    <g>
      <rect x={x - 7} y={G.top} width={14} height={G.bottom - G.top} rx={7} className="fill-gray-100 stroke-gray-400 dark:fill-gray-700 dark:stroke-gray-500" />
      <rect x={x - 4} y={gy(T)} width={8} height={G.bottom - gy(T)} rx={4} className={tone} />
      <circle cx={x} cy={G.bottom + 6} r={10} className={tone} />
      <Label p={{ x, y: G.bottom + 28 }} size={11}>
        {name}
      </Label>
      <Label p={{ x: x + 12, y: gy(T) }} size={11} anchor="start">
        {`${fmtNum(T, 1)}°`}
      </Label>
    </g>
  );

  // Колко лед се е стопил досега (отрицателно – колко вода е замръзнала)
  const liquid0 = (A.mat.water ? A.m : 0) + (B.mat.water ? B.m : 0);
  const liquidNow = (isWater(A) ? sa.liquid : 0) + (isWater(B) ? sb.liquid : 0);
  const melted = liquidNow - liquid0;
  const hasWater = isWater(A) || isWater(B);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center items-center gap-x-4 text-sm text-gray-700 dark:text-gray-300">
        <span className="text-rose-600 dark:text-rose-400 font-semibold">A:</span>
        <Buttons>
          {MATERIALS.map((m, i) => (
            <DiagramButton key={m.name} active={i === ia} onClick={() => pick('a')(i)}>
              {m.name}
            </DiagramButton>
          ))}
        </Buttons>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-4 text-sm text-gray-700 dark:text-gray-300">
        <span className="text-blue-600 dark:text-blue-400 font-semibold">B:</span>
        <Buttons>
          {MATERIALS.map((m, i) => (
            <DiagramButton key={m.name} active={i === ib} onClick={() => pick('b')(i)}>
              {m.name}
            </DiagramButton>
          ))}
        </Buttons>
      </div>
      <ZoomingSvg viewBox="0 0 480 236">
        {/* Съдът */}
        <rect x={20} y={G.top + 20} width={160} height={G.bottom - G.top - 10} rx={8} className="fill-sky-50 stroke-gray-400 dark:fill-sky-950/30" strokeWidth="3" strokeDasharray="10 4" />
        {/* Надписът е по лявата стена, за да не го закриват термометрите */}
        <g transform={`rotate(-90 34 ${(G.top + G.bottom) / 2 + 15})`}>
          <Label p={{ x: 34, y: (G.top + G.bottom) / 2 + 15 }} size={11}>
            топлоизолиран съд
          </Label>
        </g>
        {thermo(70, sa.t, 'fill-rose-500', 'A')}
        {thermo(130, sb.t, 'fill-blue-500', 'B')}

        {/* Графика T(t) */}
        {[-40, 0, 50, 100].map(T => (
          <g key={T}>
            <line x1={G.left} y1={gy(T)} x2={G.right} y2={gy(T)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: G.left - 6, y: gy(T) }} size={10} anchor="end">
              {`${String(T).replace('-', '−')}°`}
            </Label>
          </g>
        ))}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={G.left} y1={G.top} x2={G.left} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={G.left} y1={gy(eq.t)} x2={G.right} y2={gy(eq.t)} className="stroke-emerald-500" strokeDasharray="5 4" />
        <path d={curve(0, END)} fill="none" className="stroke-rose-500" strokeWidth="1.2" strokeDasharray="3 3" opacity={0.6} />
        <path d={curve(1, END)} fill="none" className="stroke-blue-500" strokeWidth="1.2" strokeDasharray="3 3" opacity={0.6} />
        {sim.state.s > 0 && <path d={curve(0, sim.state.s)} fill="none" className="stroke-rose-500" strokeWidth="3" />}
        {sim.state.s > 0 && <path d={curve(1, sim.state.s)} fill="none" className="stroke-blue-500" strokeWidth="3" />}
        <Label p={{ x: G.right, y: G.bottom + 14 }} size={10} anchor="end">
          време
        </Label>
        <Label p={{ x: G.right - 4, y: gy(eq.t) - 10 }} size={11} anchor="end" tone="emerald">
          {`равновесие ${fmtNum(eq.t, 1)} °C`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} />
      <Sliders>
        <Slider label="m_A, kg" value={ma} onChange={change(setMa)} min={0.05} max={1} step={0.05} tone="rose" />
        <Slider label="t_A, °C" value={ta} onChange={change(setTa)} min={A.mat.min} max={A.mat.max} step={1} tone="rose" />
        <Slider label="m_B, kg" value={mb} onChange={change(setMb)} min={0.05} max={1} step={0.05} tone="blue" />
        <Slider label="t_B, °C" value={tb} onChange={change(setTb)} min={B.mat.min} max={B.mat.max} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'крайна t =', value: `${fmtNum(eq.t, 1)} °C`, tone: 'emerald' },
            { label: Q >= 0 ? 'A дава на B' : 'B дава на A', value: `${fmtNum(Math.abs(Q) / 1000, 1)} kJ` },
            ...(hasWater && Math.abs(melted) > 1e-4
              ? [{ label: melted > 0 ? 'стопен лед' : 'замръзнала вода', value: `${fmtNum(Math.abs(melted) * 1000, 0)} g`, tone: 'blue' as const }]
              : []),
          ]}
        />
      </div>
      <Note tone="gray">
        {eq.t === 0 && eq.meltable > 0 && eq.liquid > 0 && eq.liquid < eq.meltable
          ? 'Ледът не се стопява целият – в съда остава смес от вода и лед при 0 °C.'
          : 'Топлината, която дава по-топлото тяло, е точно колкото тази, която получава по-студеното.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери две тела, масите и началните им температури и пусни опита. Пунктирът показва как ще се изменят температурите. Докато ледът се
        топи, температурата му стои на 0 °C – енергията отива за топенето. Топлинният капацитет на самия съд пренебрегваме, а водата не може да
        заври (всички начални температури са до 100 °C).
      </p>
    </div>
  );
}

