import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

// Едноатомен идеален газ, U = (3/2)pV, γ = 5/3. Обемът е в литри, налягането – в kPa,
// така че pV излиза направо в джаули. Приемаме nR = 1 J/K, т.е. T (в K) = pV.
const GAMMA = 5 / 3;

type Kind = 'isochoric' | 'isobaric' | 'isothermal' | 'adiabatic';
type Point = { V: number; p: number };
type Stage = { kind: Kind; from: Point; to: Point };

const KIND_NAME: Record<Kind, string> = {
  isochoric: 'изохорен',
  isobaric: 'изобарен',
  isothermal: 'изотермен',
  adiabatic: 'адиабатен',
};

/** Точка от процеса при параметър s от 0 до 1. */
function along(st: Stage, s: number): Point {
  const { from, to, kind } = st;
  if (kind === 'isochoric') return { V: from.V, p: from.p + (to.p - from.p) * s };
  const V = from.V + (to.V - from.V) * s;
  if (kind === 'isobaric') return { V, p: from.p };
  if (kind === 'isothermal') return { V, p: (from.p * from.V) / V };
  return { V, p: (from.p * from.V ** GAMMA) / V ** GAMMA };
}

/** Топлина, работа на газа и изменение на вътрешната енергия за един етап (в J). */
function energies(st: Stage) {
  const { from, to, kind } = st;
  const dU = 1.5 * (to.p * to.V - from.p * from.V);
  let W = 0;
  if (kind === 'isobaric') W = from.p * (to.V - from.V);
  if (kind === 'isothermal') W = from.p * from.V * Math.log(to.V / from.V);
  if (kind === 'adiabatic') W = -dU;
  const Q = kind === 'adiabatic' ? 0 : kind === 'isothermal' ? W : dU + W;
  return { Q, W, dU: kind === 'isothermal' ? 0 : dU };
}

function rectangle(V2: number, p2: number): Stage[] {
  const A = { V: 2, p: 100 };
  const B = { V: 2, p: p2 };
  const C = { V: V2, p: p2 };
  const D = { V: V2, p: 100 };
  return [
    { kind: 'isochoric', from: A, to: B },
    { kind: 'isobaric', from: B, to: C },
    { kind: 'isochoric', from: C, to: D },
    { kind: 'isobaric', from: D, to: A },
  ];
}

function otto(r: number, heat: number): Stage[] {
  const A = { V: 8, p: 50 };
  const B = { V: 8 / r, p: 50 * r ** GAMMA };
  const C = { V: B.V, p: B.p * heat };
  const D = { V: 8, p: (C.p * C.V ** GAMMA) / 8 ** GAMMA };
  return [
    { kind: 'adiabatic', from: A, to: B },
    { kind: 'isochoric', from: B, to: C },
    { kind: 'adiabatic', from: C, to: D },
    { kind: 'isochoric', from: D, to: A },
  ];
}

function carnot(Tc: number, ratio: number): Stage[] {
  const Th = 400;
  const k = (Th / Tc) ** (1 / (GAMMA - 1));
  const A = { V: 1, p: Th };
  const B = { V: ratio, p: Th / ratio };
  const C = { V: ratio * k, p: Tc / (ratio * k) };
  const D = { V: k, p: Tc / k };
  return [
    { kind: 'isothermal', from: A, to: B },
    { kind: 'adiabatic', from: B, to: C },
    { kind: 'isothermal', from: C, to: D },
    { kind: 'adiabatic', from: D, to: A },
  ];
}

const CYCLES = ['правоъгълен', 'Ото', 'Карно'] as const;

// Графиката p–V
const P = { left: 46, right: 300, top: 14, bottom: 214 };

/** p–V диаграма на кръгов процес: лицето в цикъла е полезната работа за един цикъл. */
export default function PVCycleLab() {
  const [k, setK] = useState(0);
  const [a, setA] = useState(6);
  const [b, setB] = useState(300);
  const [r, setR] = useState(4);
  const [heat, setHeat] = useState(2.5);
  const [tc, setTc] = useState(250);
  const [ratio, setRatio] = useState(2);

  const stages = k === 0 ? rectangle(a, b) : k === 1 ? otto(r, heat) : carnot(tc, ratio);
  const n = stages.length;

  const sim = useSimulation<{ s: number }>(() => ({ s: 0 }), (st, dt) => ({ s: (st.s + dt * 0.6) % n }), { dt: 1 / 120 });
  const idx = Math.floor(sim.state.s) % n;
  const now = along(stages[idx], sim.state.s - Math.floor(sim.state.s));

  // Всички точки на цикъла – за пътя, мащаба и най-високата и най-ниската температура
  const pts = stages.flatMap(st => Array.from({ length: 41 }, (_, i) => along(st, i / 40)));
  const vMax = Math.ceil(Math.max(...pts.map(q => q.V)) + 0.5);
  const pTop = Math.max(...pts.map(q => q.p));
  const pMax = pTop <= 200 ? 200 : pTop <= 500 ? Math.ceil(pTop / 100) * 100 : Math.ceil(pTop / 500) * 500;
  const x = (V: number) => P.left + (V / vMax) * (P.right - P.left);
  const y = (p: number) => P.bottom - (p / pMax) * (P.bottom - P.top);
  const path = pts.map((q, i) => `${i ? 'L' : 'M'} ${x(q.V).toFixed(1)} ${y(q.p).toFixed(1)}`).join(' ') + ' Z';

  const E = stages.map(energies);
  const Wnet = E.reduce((s, e) => s + e.W, 0);
  const Qin = E.reduce((s, e) => s + Math.max(e.Q, 0), 0);
  const Ts = pts.map(q => q.p * q.V);
  const etaC = 1 - Math.min(...Ts) / Math.max(...Ts);
  const T = now.p * now.V;

  const vStep = vMax <= 6 ? 1 : 2;
  const pStep = pMax / 4;
  // Буталото: широчината на газа е пропорционална на обема, цветът – на температурата
  const gasW = 20 + (now.V / vMax) * 110;
  const hot = Math.min(1, Math.max(0, (T - Math.min(...Ts)) / (Math.max(...Ts) - Math.min(...Ts) || 1)));
  const gasColor = `rgb(${Math.round(80 + 175 * hot)}, ${Math.round(140 - 60 * hot)}, ${Math.round(240 - 180 * hot)})`;

  const choose = (i: number) => {
    setK(i);
    sim.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {CYCLES.map((c, i) => (
          <DiagramButton key={c} active={i === k} onClick={() => choose(i)}>
            {`цикъл ${c}`}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 250">
        {Array.from({ length: Math.floor(vMax / vStep) + 1 }, (_, i) => i * vStep).map(V => (
          <g key={`v${V}`}>
            <line x1={x(V)} y1={P.top} x2={x(V)} y2={P.bottom} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: x(V), y: P.bottom + 12 }} size={10} weight={500}>
              {String(V)}
            </Label>
          </g>
        ))}
        {[1, 2, 3, 4].map(i => (
          <g key={`p${i}`}>
            <line x1={P.left} y1={y(i * pStep)} x2={P.right} y2={y(i * pStep)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: P.left - 5, y: y(i * pStep) }} size={10} weight={500} anchor="end">
              {fmtNum(i * pStep, 0)}
            </Label>
          </g>
        ))}
        <line x1={P.left} y1={P.bottom} x2={P.right} y2={P.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={P.left} y1={P.bottom} x2={P.left} y2={P.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <Label p={{ x: P.left + 4, y: P.top + 2 }} size={10} anchor="start">
          p, kPa
        </Label>
        <Label p={{ x: P.right, y: P.bottom + 26 }} size={10} anchor="end">
          V, L
        </Label>

        <path d={path} className="fill-emerald-500/20 stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" />
        {stages.map((st, i) => {
          const m1 = along(st, 0.45);
          const m2 = along(st, 0.6);
          return <Arrow key={i} from={{ x: x(m1.V), y: y(m1.p) }} to={{ x: x(m2.V), y: y(m2.p) }} tone={E[i].Q > 0.5 ? 'rose' : E[i].Q < -0.5 ? 'blue' : 'gray'} width={2} />;
        })}
        {stages.map((st, i) => (
          <Label key={`n${i}`} p={{ x: x(st.from.V) + (st.from.V < vMax / 2 ? -9 : 9), y: y(st.from.p) - 8 }} size={11}>
            {'ABCD'[i]}
          </Label>
        ))}
        <circle cx={x(now.V)} cy={y(now.p)} r={6} className="fill-amber-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />

        {/* Цилиндър с бутало */}
        <rect x={320} y={70} width={150} height={80} rx={3} fill="none" className="stroke-gray-500" strokeWidth="2" />
        <rect x={322} y={72} width={gasW} height={76} style={{ fill: gasColor }} opacity={0.75} />
        <rect x={322 + gasW} y={70} width={8} height={80} className="fill-gray-600 dark:fill-gray-300" />
        <line x1={330 + gasW} y1={110} x2={468} y2={110} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="4" />
        <Label p={{ x: 395, y: 166 }} size={11}>
          {`T = ${fmtNum(T, 0)} K`}
        </Label>
        <Label p={{ x: 395, y: 184 }} size={11} tone={E[idx].Q > 0.5 ? 'rose' : E[idx].Q < -0.5 ? 'blue' : 'gray'}>
          {`${'ABCD'[idx]}→${'ABCD'[(idx + 1) % n]}: ${KIND_NAME[stages[idx].kind]}`}
        </Label>
        <Label p={{ x: 395, y: 200 }} size={10}>
          {E[idx].Q > 0.5 ? 'газът получава топлина' : E[idx].Q < -0.5 ? 'газът отдава топлина' : 'без топлообмен'}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        {k === 0 && (
          <>
            <Slider label="V₂, L" value={a} onChange={setA} min={3} max={8} step={0.5} tone="blue" />
            <Slider label="p₂, kPa" value={b} onChange={setB} min={150} max={400} step={10} tone="rose" />
          </>
        )}
        {k === 1 && (
          <>
            <Slider label="V₁/V₂" value={r} onChange={setR} min={2} max={10} step={0.5} tone="blue" />
            <Slider label="pC/pB" value={heat} onChange={setHeat} min={1.5} max={4} step={0.1} tone="rose" />
          </>
        )}
        {k === 2 && (
          <>
            <Slider label="T₂, K" value={tc} onChange={setTc} min={150} max={350} step={10} tone="blue" />
            <Slider label="VB/VA" value={ratio} onChange={setRatio} min={1.5} max={3} step={0.1} tone="rose" />
          </>
        )}
      </Sliders>

      <div className="overflow-x-auto mt-3">
        <table className="mx-auto text-xs sm:text-sm font-mono border-collapse">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1 text-left font-medium">етап</th>
              <th className="px-2 py-1 text-right font-medium">Q, J</th>
              <th className="px-2 py-1 text-right font-medium">W, J</th>
              <th className="px-2 py-1 text-right font-medium">ΔU, J</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((st, i) => (
              <tr key={i} className={i === idx ? 'bg-amber-50 dark:bg-amber-900/20' : ''}>
                <td className="px-2 py-0.5">{`${'ABCD'[i]}→${'ABCD'[(i + 1) % n]} ${KIND_NAME[st.kind]}`}</td>
                <td className={`px-2 py-0.5 text-right ${E[i].Q > 0.5 ? 'text-rose-600 dark:text-rose-400' : E[i].Q < -0.5 ? 'text-blue-600 dark:text-blue-400' : ''}`}>{fmtNum(E[i].Q, 0)}</td>
                <td className="px-2 py-0.5 text-right">{fmtNum(E[i].W, 0)}</td>
                <td className="px-2 py-0.5 text-right">{fmtNum(E[i].dU, 0)}</td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 dark:border-gray-700 font-semibold">
              <td className="px-2 py-0.5">цикъл</td>
              <td className="px-2 py-0.5 text-right">{fmtNum(E.reduce((s, e) => s + e.Q, 0), 0)}</td>
              <td className="px-2 py-0.5 text-right">{fmtNum(Wnet, 0)}</td>
              <td className="px-2 py-0.5 text-right">0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note tone="emerald">{`Полезна работа ${fmtNum(Wnet, 0)} J от получени ${fmtNum(Qin, 0)} J: η = ${fmtNum(Wnet / Qin * 100, 1)}%, а цикъл на Карно между същите крайни температури би дал ${fmtNum(etaC * 100, 1)}%.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Газът е едноатомен идеален газ (U = 3pV/2). Червените етапи получават топлина, сините отдават. За цял цикъл ΔU = 0, така че
        полезната работа е равна на нетната топлина – и на зеленото лице в цикъла. W е работата, извършена ОТ газа: при разширение е
        положителна, при свиване – отрицателна. Цветът на газа в цилиндъра показва температурата.
      </p>
    </div>
  );
}
