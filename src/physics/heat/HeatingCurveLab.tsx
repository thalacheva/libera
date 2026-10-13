import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const M = 1; // kg
const C_ICE = 2100;
const C_WATER = 4200;
const C_STEAM = 2000;
const LAMBDA = 334000;
const L_VAP = 2.26e6; // приемаме я за еднаква и при по-ниска температура на кипене
const T_START = -20;
const T_STEAM = 120;
const SPEED = 100; // анимацията е ускорена 100 пъти

const PLACES = [
  { name: 'морско равнище', boil: 100 },
  { name: 'Мусала (2925 m)', boil: 90 },
  { name: 'Еверест (8849 m)', boil: 70 },
];

/** Етапите на нагряването: [име, начална и крайна температура, нужна топлина]. */
function stages(boil: number) {
  return [
    { name: 'лед се затопля', from: T_START, to: 0, Q: M * C_ICE * (0 - T_START) },
    { name: 'лед се топи', from: 0, to: 0, Q: M * LAMBDA },
    { name: 'вода се затопля', from: 0, to: boil, Q: M * C_WATER * boil },
    { name: 'вода кипи', from: boil, to: boil, Q: M * L_VAP },
    { name: 'пара се затопля', from: boil, to: T_STEAM, Q: M * C_STEAM * (T_STEAM - boil) },
  ];
}

/** Температурата и етапът след като е подадена топлина Q. */
function stateAt(Q: number, boil: number) {
  let left = Q;
  const st = stages(boil);
  for (let i = 0; i < st.length; i++) {
    const s = st[i];
    if (left <= s.Q) return { T: s.from + ((s.to - s.from) * left) / s.Q, stage: i, part: left / s.Q };
    left -= s.Q;
  }
  return { T: T_STEAM, stage: st.length - 1, part: 1 };
}

const G = { left: 172, right: 466, top: 14, bottom: 196 };
const gy = (T: number) => G.bottom - ((T - T_START) / (T_STEAM + 10 - T_START)) * (G.bottom - G.top);

/** Кривата на нагряване на 1 kg лед: температурата стои, докато се сменя агрегатното състояние. */
export default function HeatingCurveLab() {
  const [P, setP] = useState(2000);
  const [place, setPlace] = useState(0);
  const boil = PLACES[place].boil;
  const st = stages(boil);
  const total = st.reduce((s, x) => s + x.Q, 0);
  const tTotal = total / P;
  const gx = (t: number) => G.left + (t / tTotal) * (G.right - G.left);

  const sim = useSimulation<{ Q: number }>(() => ({ Q: 0 }), (s, dt) => (s.Q >= total ? s : { Q: Math.min(total, s.Q + P * dt) }), { dt: 1 / 4, speed: SPEED });
  const restart = () => sim.reset({ Q: 0 });
  const now = stateAt(sim.state.Q, boil);
  const t = sim.state.Q / P;

  const curve = (upto: number) => {
    const pts: string[] = [];
    let Q = 0;
    pts.push(`M ${gx(0).toFixed(1)} ${gy(T_START).toFixed(1)}`);
    for (const s of st) {
      const Qend = Math.min(Q + s.Q, upto);
      if (Qend <= Q) break;
      const T = s.from + ((s.to - s.from) * (Qend - Q)) / s.Q;
      pts.push(`L ${gx(Qend / P).toFixed(1)} ${gy(T).toFixed(1)}`);
      Q += s.Q;
    }
    return pts.join(' ');
  };

  // Чашата: лед, вода, мехурчета или пара според етапа
  const iceLeft = now.stage === 0 ? 1 : now.stage === 1 ? 1 - now.part : 0;
  const waterLeft = now.stage < 1 ? 0 : now.stage === 1 ? now.part : now.stage === 2 ? 1 : now.stage === 3 ? 1 - now.part : 0;
  const cup = { x: 30, y: 60, w: 90, h: 110 };
  const level = cup.y + cup.h - 90 * (iceLeft * 0.9 + waterLeft);

  const minutes = (s: number) => (s >= 120 ? `${fmtNum(s / 60, 1)} min` : `${fmtNum(s, 0)} s`);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PLACES.map((p, i) => (
          <DiagramButton
            key={p.name}
            active={i === place}
            onClick={() => {
              setPlace(i);
              restart();
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 226">
        {/* Съдът с котлона */}
        <rect x={cup.x} y={cup.y} width={cup.w} height={cup.h} fill="none" className="stroke-gray-500" strokeWidth="2.5" />
        {waterLeft > 0 && <rect x={cup.x + 2} y={level + iceLeft * 81} width={cup.w - 4} height={cup.y + cup.h - (level + iceLeft * 81) - 1} className="fill-sky-300/70" />}
        {iceLeft > 0 &&
          [0, 1, 2].map(i => (
            <rect key={i} x={cup.x + 8 + i * 27} y={cup.y + cup.h - 4 - 80 * iceLeft} width={22} height={Math.max(4, 76 * iceLeft)} rx={3} className="fill-cyan-100 stroke-cyan-400" />
          ))}
        {now.stage === 3 &&
          [0, 1, 2, 3, 4].map(i => (
            <circle key={i} cx={cup.x + 12 + i * 16} cy={cup.y + cup.h - 10 - ((i * 23 + t * 0.5) % Math.max(10, (cup.y + cup.h - level) - 6))} r={3} className="fill-white stroke-sky-500" />
          ))}
        {now.stage >= 3 &&
          [0, 1, 2].map(i => (
            <text key={i} x={cup.x + 22 + i * 24} y={cup.y - 12 - (i % 2) * 10} fontSize={18} textAnchor="middle" dominantBaseline="central" opacity={0.7}>
              ♨️
            </text>
          ))}
        <rect x={cup.x - 6} y={cup.y + cup.h + 4} width={cup.w + 12} height={10} rx={3} className={sim.running ? 'fill-rose-500' : 'fill-gray-400'} />
        <Label p={{ x: cup.x + cup.w / 2, y: cup.y + cup.h + 28 }} size={11}>
          {`${fmtNum(P)} W`}
        </Label>
        <Label p={{ x: cup.x + cup.w / 2, y: 20 }} size={12} tone="rose">
          {st[now.stage].name}
        </Label>

        {/* Графика T(t) */}
        {[-20, 0, 50, boil, T_STEAM].map(T => (
          <g key={T}>
            <line x1={G.left} y1={gy(T)} x2={G.right} y2={gy(T)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: G.left - 6, y: gy(T) }} size={10} anchor="end">
              {`${String(T).replace('-', '−')}°`}
            </Label>
          </g>
        ))}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={G.left} y1={G.top} x2={G.left} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" />
        <path d={curve(total)} fill="none" className="stroke-rose-500" strokeWidth="1.5" strokeDasharray="4 4" opacity={0.5} />
        {sim.state.Q > 0 && <path d={curve(sim.state.Q)} fill="none" className="stroke-rose-500" strokeWidth="3" />}
        <circle cx={gx(t)} cy={gy(now.T)} r={5} className="fill-rose-500" />
        <Label p={{ x: G.right, y: G.bottom + 14 }} size={10} anchor="end">
          {`време (общо ${minutes(tTotal)})`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} />
      <Sliders>
        <Slider
          label="P, W"
          value={P}
          onChange={n => {
            setP(n);
            restart();
          }}
          min={500}
          max={3000}
          step={100}
          tone="rose"
        />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 't =', value: `${fmtNum(now.T, 1)} °C`, tone: 'rose' },
            { label: 'Q =', value: `${fmtNum(sim.state.Q / 1000, 0)} kJ` },
            { label: 'време', value: minutes(t) },
          ]}
        />
      </div>
      <div className="mt-2">
        <Readout items={st.map((s, i) => ({ label: s.name, value: `${fmtNum(s.Q / 1000, 0)} kJ`, tone: i === now.stage ? ('rose' as const) : undefined }))} />
      </div>
      <Note tone="gray">
        {now.stage === 1 || now.stage === 3
          ? 'Котлонът грее, но температурата не расте – цялата енергия отива за смяна на агрегатното състояние.'
          : 'Изпаряването на водата отнема почти седем пъти повече енергия, отколкото топенето на леда.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Котлонът дава на 1 kg лед (в началото −20 °C) постоянна мощност; загубите пренебрегваме. Анимацията е ускорена 100 пъти. На планина
        налягането е по-ниско и водата кипи при по-ниска температура – около 90 °C на Мусала и около 70 °C на Еверест; топлината на изпарение
        приемаме за една и съща.
      </p>
    </div>
  );
}
