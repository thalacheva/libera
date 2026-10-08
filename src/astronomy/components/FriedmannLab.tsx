import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const X0 = 50;
const X1 = 450;
const Y0 = 20;
const Y1 = 250;
const T_MIN = -20; // млрд. години спрямо днес
const T_MAX = 40;
const A_MAX = 4;
const H0 = 70 / 977.8; // 1/млрд. години при H₀ = 70 km/s/Mpc
const DT = 0.01;

type Model = { pts: [number, number][]; age: number | null; fate: 'crunch' | 'accel' | 'coast'; bounce: boolean };

/** Интегрира ä = H₀²(−Ωm / (2a²) + ΩΛ a) от днес (a = 1, ȧ = H₀) назад и напред. */
function solve(om: number, ol: number): Model {
  const acc = (a: number) => H0 * H0 * (-om / (2 * a * a) + ol * a);
  const run = (dir: 1 | -1) => {
    const pts: [number, number][] = [];
    let a = 1;
    let v = H0;
    let t = 0;
    let bounce = false;
    let turned = false;
    let end: number | null = null;
    for (let k = 0; k < 7000; k++) {
      pts.push([t, a]);
      // RK4
      const h = dir * DT;
      const k1a = v;
      const k1v = acc(a);
      const k2a = v + (h / 2) * k1v;
      const k2v = acc(a + (h / 2) * k1a);
      const k3a = v + (h / 2) * k2v;
      const k3v = acc(a + (h / 2) * k2a);
      const k4a = v + h * k3v;
      const k4v = acc(a + h * k3a);
      a += (h / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
      v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      t += h;
      if (a < 0.003) {
        end = t;
        break;
      }
      if (dir === -1 && v <= 0) bounce = true;
      if (dir === 1 && v <= 0) turned = true; // разширението е спряло – следва срутване
      if (a > A_MAX * 1.5 || t > T_MAX + 1 || t < T_MIN - 30) break;
    }
    return { pts, end, bounce, turned };
  };
  const back = run(-1);
  const fwd = run(1);
  const crunch = fwd.end !== null || fwd.turned;
  const q0 = om / 2 - ol;
  return {
    pts: [...back.pts.reverse(), ...fwd.pts],
    age: back.bounce ? null : back.end !== null ? -back.end : null,
    fate: crunch ? 'crunch' : q0 < 0 || ol > 0 ? 'accel' : 'coast',
    bounce: back.bounce,
  };
}

const PRESETS = [
  { name: 'Нашата Вселена (ΛCDM)', om: 0.315, ol: 0.685 },
  { name: 'Само вещество (Айнщайн–де Ситер)', om: 1, ol: 0 },
  { name: 'Затворена', om: 2.5, ol: 0 },
  { name: 'Празна', om: 0, ol: 0 },
];

const REFERENCE = solve(0.315, 0.685);

export default function FriedmannLab() {
  const [om, setOm] = useState(0.315);
  const [ol, setOl] = useState(0.685);
  const model = solve(om, ol);
  const ok = 1 - om - ol;

  const gx = (t: number) => X0 + ((t - T_MIN) / (T_MAX - T_MIN)) * (X1 - X0);
  const gy = (a: number) => Y1 - (a / A_MAX) * (Y1 - Y0);
  const path = (m: Model) =>
    m.pts
      .filter(([t, a]) => t >= T_MIN - 0.5 && t <= T_MAX && a <= A_MAX * 1.1)
      .map(([t, a]) => `${gx(Math.max(T_MIN, t))},${gy(a)}`)
      .join(' ');

  const q0 = om / 2 - ol;
  const fateText = model.fate === 'crunch' ? 'Голямо срутване: разширението спира и Вселената се свива' : q0 < 0 ? 'вечно и ускорено разширение – Голямо изстиване' : 'вечно, но забавящо се разширение';
  const geometry = Math.abs(ok) < 0.02 ? 'плоска' : ok > 0 ? 'отворена (седловидна)' : 'затворена (сферична)';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Миналото и бъдещето на Вселената</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Кривата показва как растат разстоянията (мащабния фактор a, днес a = 1). Веществото забавя разширението с гравитацията си, а
        тъмната енергия го ускорява. Изберете колко от всяко има.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <defs>
          <clipPath id="fr-clip">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <line x1={gx(0)} x2={gx(0)} y1={Y0} y2={Y1} stroke="white" strokeOpacity="0.3" strokeDasharray="3 3" />
        <text x={gx(0) + 4} y={Y0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          днес
        </text>
        <line x1={X0} x2={X1} y1={gy(1)} y2={gy(1)} stroke="white" strokeOpacity="0.1" />
        <g clipPath="url(#fr-clip)">
          <polyline points={path(REFERENCE)} fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 3" />
          <polyline points={path(model)} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
        </g>
        {model.age !== null && model.age < -T_MIN && (
          <g>
            <circle cx={gx(-model.age)} cy={gy(0)} r="4" fill="#fbbf24" />
            <text x={gx(-model.age)} y={Y1 - 8} fontSize="9" textAnchor="middle" fill="#fde68a">
              Голям взрив
            </text>
          </g>
        )}
        {[-20, -10, 0, 10, 20, 30, 40].map(t => (
          <text key={t} x={gx(t)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {t > 0 ? `+${t}` : t}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
          време спрямо днес, млрд. години
        </text>
        {[1, 2, 3, 4].map(a => (
          <text key={a} x={X0 - 4} y={gy(a) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {a}
          </text>
        ))}
        <text x={X0 + 4} y={Y0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          a
        </text>

        <g fontSize="11" fill="white" transform="translate(468, 40)">
          <text x={0} y={0} fontWeight="700" fill="#c4b5fd">
            Ωм = {fmt(om, 2)}, ΩΛ = {fmt(ol, 2)}
          </text>
          <text x={0} y={18} fontSize="10" fillOpacity="0.7">
            кривина Ωk = {fmt(ok, 2)}: {geometry}
          </text>
          <text x={0} y={44} fillOpacity="0.85">
            възраст:
          </text>
          <text x={0} y={62} fontSize="15" fontWeight="700" fill="#fde68a">
            {model.bounce ? 'няма Голям взрив!' : model.age !== null ? `${fmt(model.age, 1)} млрд. години` : '> 30 млрд. години'}
          </text>
          <text x={0} y={88} fillOpacity="0.85">
            днес разширението се
          </text>
          <text x={0} y={104} fill={q0 < 0 ? '#4ade80' : '#fca5a5'}>
            {q0 < 0 ? 'ускорява' : 'забавя'} (q₀ = {fmt(q0, 2)})
          </text>
          <text x={0} y={130} fontSize="10" fillOpacity="0.75">
            бъдеще:
          </text>
          {fateText.split(/: | – /).map((line, i) => (
            <text key={i} x={0} y={146 + i * 14} fontSize="10" fillOpacity="0.75">
              {line}
            </text>
          ))}
          <text x={0} y={196} fontSize="9" fillOpacity="0.5">
            пунктир – ΛCDM за сравнение
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Вещество (обикновено + тъмно): Ωм = {fmt(om, 2)}</label>
          <input type="range" min="0" max="3" step="0.005" value={om} onChange={e => setOm(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Тъмна енергия: ΩΛ = {fmt(ol, 2)}</label>
          <input type="range" min="0" max="1.5" step="0.005" value={ol} onChange={e => setOl(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setOm(p.om);
              setOl(p.ol);
            }}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {model.bounce
          ? 'При много тъмна енергия и малко вещество разширението в миналото би спряло и Вселената би „отскочила“ – без горещо начало. Наблюденията (реликтовото излъчване, леките елементи) изключват това.'
          : 'Ω е плътността в единици от критичната плътност ρ_c = 3H₀² / (8πG) ≈ 9 · 10⁻²⁷ kg/m³ – около 5 протона в кубичен метър. Вселена само с вещество и Ω > 1 се връща назад и се срутва; при Ω < 1 се разширява вечно. Тъмната енергия променя всичко: в нашата Вселена разширението се забавя първите ~9 млрд. години, а после започва да се ускорява.'}
      </p>
    </div>
  );
}
