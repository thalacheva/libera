import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '~/physics/SimControls';
import { fmtNum, sig, useSimulation } from '~/physics/sim';

const EMF = 9;
const END = 5; // колко τ показваме

// Графика: време в единици τ по x, U/ℰ и I/I₀ по y (от −1 до 1)
const G = { left: 50, right: 462, mid: 222, half: 56 };
const gx = (s: number) => G.left + (s / END) * (G.right - G.left);
const gy = (v: number) => G.mid - v * G.half;

/** Зареждане и разреждане на кондензатор през резистор: експонента с времеконстанта τ = RC. */
export default function RCLab() {
  const [R, setR] = useState(10); // kΩ
  const [C, setC] = useState(100); // µF
  const [charging, setCharging] = useState(true);
  const [u0, setU0] = useState(0); // U/ℰ в началото на етапа

  // Времето тече в единици τ: една τ за една секунда, каквото и да е RC
  const sim = useSimulation<{ s: number }>(() => ({ s: 0 }), (st, dt) => (st.s >= END + 1 ? st : { s: st.s + dt }), { dt: 1 / 120 });
  const s = sim.state.s;
  const target = charging ? 1 : 0;
  const u = (x: number) => target + (u0 - target) * Math.exp(-x);
  const uNow = u(s);
  const iNow = target - uNow; // ток в единици I₀ = ℰ/R

  const tauMs = R * C; // kΩ · µF = ms
  const tau = tauMs >= 1000 ? `${fmtNum(tauMs / 1000, 2)} s` : `${fmtNum(tauMs, 1)} ms`;

  const flip = () => {
    setU0(uNow);
    setCharging(!charging);
    sim.reset({ s: 0 });
    sim.play();
  };
  const restart = () => {
    setU0(charging ? 0 : 1);
    sim.reset({ s: 0 });
  };

  const path = (to: number, f: (x: number) => number) =>
    Array.from({ length: 101 }, (_, i) => (i / 100) * to)
      .map((x, i) => `${i ? 'L' : 'M'} ${gx(x).toFixed(1)} ${gy(f(x)).toFixed(1)}`)
      .join(' ');
  const cur = (x: number) => target - u(x);
  const signs = Math.round(uNow * 6);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={charging} onClick={() => !charging && flip()}>
          зареждане
        </DiagramButton>
        <DiagramButton active={!charging} onClick={() => charging && flip()}>
          разреждане
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 302">
        {/* Верига: батерия – ключ – резистор – кондензатор */}
        <g className="stroke-gray-500" strokeWidth="2" fill="none">
          <polyline points="60,52 60,22 112,22" />
          <polyline points="112,52 112,112" />
          <polyline points="150,36 200,36" />
          <polyline points="280,36 400,36 400,62" />
          <polyline points="400,76 400,112 60,112 60,84" />
        </g>
        {/* Батерия */}
        <line x1={44} y1={56} x2={76} y2={56} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <line x1={52} y1={66} x2={68} y2={66} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <line x1={44} y1={76} x2={76} y2={76} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <line x1={52} y1={84} x2={68} y2={84} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <Label p={{ x: 24, y: 70 }} size={11}>
          {`${EMF} V`}
        </Label>
        {/* Превключвател */}
        <circle cx={112} cy={22} r={3} className="fill-gray-600" />
        <circle cx={112} cy={52} r={3} className="fill-gray-600" />
        <circle cx={150} cy={36} r={3} className="fill-gray-600" />
        <line x1={150} y1={36} x2={114} y2={charging ? 23 : 51} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="2.5" />
        {/* Резистор */}
        <rect x={200} y={28} width={80} height={16} className="fill-white stroke-gray-700 dark:fill-gray-800 dark:stroke-gray-200" strokeWidth="2" />
        <Label p={{ x: 240, y: 58 }} size={11}>
          {`R = ${R} kΩ`}
        </Label>
        {/* Кондензатор */}
        <line x1={378} y1={62} x2={422} y2={62} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" />
        <line x1={378} y1={76} x2={422} y2={76} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" />
        {Array.from({ length: signs }, (_, i) => 382 + i * 7).map(x => (
          <g key={x}>
            <text x={x} y={55} fontSize={10} textAnchor="middle" className="fill-rose-600 font-bold">
              +
            </text>
            <text x={x} y={90} fontSize={10} textAnchor="middle" className="fill-sky-700 font-bold">
              −
            </text>
          </g>
        ))}
        <Label p={{ x: 448, y: 69 }} size={11}>
          {`${C} µF`}
        </Label>
        {Math.abs(iNow) > 0.03 && (
          <Arrow from={{ x: 320 - 30 * Math.sign(iNow), y: 18 }} to={{ x: 320 + (5 + 40 * Math.abs(iNow)) * Math.sign(iNow), y: 18 }} tone="amber" width={2.5} label="I" />
        )}

        {/* Графика */}
        <line x1={G.left} y1={G.mid} x2={G.right} y2={G.mid} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.left} y1={gy(1.05)} x2={G.left} y2={gy(-1.05)} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[1, 2, 3, 4, 5].map(x => (
          <g key={x}>
            <line x1={gx(x)} y1={gy(1)} x2={gx(x)} y2={gy(-1)} className={x === 1 ? 'stroke-amber-500' : 'stroke-gray-100 dark:stroke-gray-700/50'} strokeDasharray={x === 1 ? '4 3' : undefined} />
            <Label p={{ x: gx(x), y: gy(-1) + 12 }} size={10} weight={500}>
              {x === 1 ? 'τ' : `${x}τ`}
            </Label>
          </g>
        ))}
        <line x1={G.left} y1={gy(charging ? 0.632 : 0.368)} x2={gx(1)} y2={gy(charging ? 0.632 : 0.368)} className="stroke-amber-500" strokeDasharray="4 3" />
        <Label p={{ x: G.left - 4, y: gy(charging ? 0.632 : 0.368) }} size={10} anchor="end" tone="amber">
          {charging ? '63%' : '37%'}
        </Label>
        <Label p={{ x: G.left - 4, y: gy(1) }} size={10} anchor="end">
          ℰ
        </Label>
        <Label p={{ x: G.left - 4, y: G.mid }} size={10} anchor="end">
          0
        </Label>
        <path d={path(END, u)} fill="none" className="stroke-blue-500" strokeWidth="1.5" strokeDasharray="4 4" opacity={0.5} />
        <path d={path(END, cur)} fill="none" className="stroke-rose-500" strokeWidth="1.5" strokeDasharray="4 4" opacity={0.5} />
        {s > 0 && <path d={path(Math.min(s, END), u)} fill="none" className="stroke-blue-500" strokeWidth="3" />}
        {s > 0 && <path d={path(Math.min(s, END), cur)} fill="none" className="stroke-rose-500" strokeWidth="3" />}
        <circle cx={gx(Math.min(s, END))} cy={gy(uNow)} r={5} className="fill-blue-500" />
        <circle cx={gx(Math.min(s, END))} cy={gy(iNow)} r={5} className="fill-rose-500" />
        <Label p={{ x: G.right - 2, y: gy(target) + (charging ? 12 : -12) }} size={11} anchor="end" tone="blue">
          U_C
        </Label>
        <Label p={{ x: G.right - 2, y: G.mid + (charging ? -12 : 12) }} size={11} anchor="end" tone="rose">
          I
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} />
      <Sliders>
        <Slider label="R, kΩ" value={R} onChange={setR} min={1} max={100} step={1} tone="gray" />
        <Slider label="C, µF" value={C} onChange={setC} min={10} max={1000} step={10} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'τ = RC =', value: tau, tone: 'amber' },
            { label: 'изминало', value: `${fmtNum(Math.min(s, END), 2)} τ` },
            { label: 'U_C =', value: `${fmtNum(uNow * EMF, 2)} V`, tone: 'blue' },
            { label: 'I =', value: `${sig((iNow * EMF) / R, 3)} mA`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        {charging
          ? 'В началото празният кондензатор „не пречи“ и токът е най-голям: I₀ = ℰ/R. После напрежението на кондензатора расте и токът спада.'
          : 'При разреждане кондензаторът е източникът: токът тече в обратна посока и двете величини намаляват към нула.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Времето в графиката е в единици τ = RC – формата на кривата е една и съща за всички R и C, променя се само мащабът. За една τ
        кондензаторът се зарежда до около 63%, а за 5τ – до над 99%. Анимацията показва една τ за една секунда.
      </p>
    </div>
  );
}
