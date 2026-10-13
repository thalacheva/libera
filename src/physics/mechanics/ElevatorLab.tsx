import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;

/** Профил на движението: [до кой момент, ускорение] за всеки участък; y0 – начална височина. */
type Profile = { name: string; y0: number; segments: [number, number][]; note: string };

const PROFILES: Profile[] = [
  {
    name: 'нагоре',
    y0: 2,
    segments: [
      [1, 0],
      [3, 1.5],
      [7, 0],
      [9, -1.5],
      [10, 0],
    ],
    note: 'При потегляне нагоре и спиране при слизане везната показва повече, при равномерно движение – колкото в покой.',
  },
  {
    name: 'надолу',
    y0: 20,
    segments: [
      [1, 0],
      [3, -1.5],
      [7, 0],
      [9, 1.5],
      [10, 0],
    ],
    note: 'При потегляне надолу „олекваш“, а при спирането долу „натежаваш“.',
  },
  {
    name: 'скъсано въже',
    y0: 23,
    segments: [
      [1, 0],
      [2.5, -G],
      [4, G],
      [5, 0],
    ],
    note: 'При свободно падане везната показва 0 – безтегловност. Аварийната спирачка спира кабината и тогава „тежиш“ двойно.',
  },
];

const accel = (p: Profile, t: number) => (p.segments.find(([end]) => t < end) ?? [0, 0])[1];

type Cabin = { t: number; y: number; v: number };

const SHAFT = { left: 40, right: 120, bottom: 266, px: 10 };
const sy = (y: number) => SHAFT.bottom - y * SHAFT.px;
const GR = { left: 196, right: 464, top: 30, bottom: 236 };

/** Асансьор с везна: показанието е N = m(g + a), а не mg. */
export default function ElevatorLab() {
  const [k, setK] = useState(0);
  const [m, setM] = useState(60);
  const P = PROFILES[k];
  const end = P.segments[P.segments.length - 1][0];

  const step = (s: Cabin, dt: number): Cabin => {
    if (s.t >= end) return s;
    const v = s.v + accel(P, s.t) * dt;
    return { t: s.t + dt, y: s.y + v * dt, v };
  };
  const sim = useSimulation<Cabin>(() => ({ t: 0, y: P.y0, v: 0 }), step, { dt: 1 / 500 });
  const choose = (i: number) => {
    setK(i);
    sim.reset({ t: 0, y: PROFILES[i].y0, v: 0 });
  };

  const { t, y, v } = sim.state;
  const a = t >= end ? 0 : accel(P, t);
  const reading = (m * (G + a)) / G; // в килограми, както показва везната

  // Графика на показанието; скала до 1,25 пъти най-голямото показание
  const top = Math.max(...P.segments.map(([, sa]) => (G + sa) / G)) * 1.25;
  const gx = (s: number) => GR.left + (s / end) * (GR.right - GR.left);
  const gy = (r: number) => GR.bottom - (r / top) * (GR.bottom - GR.top);
  const pts: string[] = [];
  let from = 0;
  for (const [until, sa] of P.segments) {
    const r = (G + sa) / G;
    pts.push(`${gx(from)},${gy(r)}`, `${gx(until)},${gy(r)}`);
    from = until;
  }

  const cabin = sy(y);
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PROFILES.map((p, i) => (
          <DiagramButton key={p.name} active={i === k} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        {/* Шахта с етажи през 3 m */}
        <rect x={SHAFT.left} y={sy(25)} width={SHAFT.right - SHAFT.left} height={25 * SHAFT.px} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" />
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(f => (
          <g key={f}>
            <line x1={SHAFT.left - 8} y1={sy(f)} x2={SHAFT.left} y2={sy(f)} className="stroke-gray-400" />
            <Label p={{ x: SHAFT.left - 12, y: sy(f) }} size={10} anchor="end">
              {String(f / 3)}
            </Label>
          </g>
        ))}
        <rect x={SHAFT.left + 8} y={cabin - 26} width={SHAFT.right - SHAFT.left - 16} height={26} rx={2} className="fill-amber-100 stroke-amber-600 dark:fill-amber-900/50" strokeWidth="1.5" />
        <text x={(SHAFT.left + SHAFT.right) / 2} y={cabin - 13} fontSize={18} textAnchor="middle" dominantBaseline="central">
          🧍
        </text>
        {k !== 2 || t < 1 ? (
          <line x1={(SHAFT.left + SHAFT.right) / 2} y1={sy(25)} x2={(SHAFT.left + SHAFT.right) / 2} y2={cabin - 26} className="stroke-gray-500" strokeWidth="1.5" />
        ) : (
          <line x1={(SHAFT.left + SHAFT.right) / 2} y1={sy(25)} x2={(SHAFT.left + SHAFT.right) / 2} y2={sy(25) + 20} className="stroke-gray-500" strokeWidth="1.5" />
        )}
        <Label p={{ x: (SHAFT.left + SHAFT.right) / 2, y: 274 }} size={10}>
          етаж
        </Label>

        {/* Графика на показанието на везната */}
        <line x1={GR.left} y1={GR.bottom} x2={GR.right} y2={GR.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={GR.left} y1={GR.bottom} x2={GR.left} y2={GR.top - 6} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={GR.left} y1={gy(1)} x2={GR.right} y2={gy(1)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <Label p={{ x: GR.left - 6, y: gy(1) }} size={10} anchor="end">
          {`${m} kg`}
        </Label>
        <Label p={{ x: GR.left - 6, y: GR.bottom }} size={10} anchor="end">
          0
        </Label>
        <polyline points={pts.join(' ')} fill="none" className="stroke-blue-500" strokeWidth="2" strokeDasharray="5 4" opacity={0.5} />
        <polyline points={pts.filter((_, i) => i === 0 || Number(pts[i].split(',')[0]) <= gx(t) + 0.01).join(' ') + ` ${gx(t)},${gy(reading / m)}`} fill="none" className="stroke-blue-500" strokeWidth="3" />
        <circle cx={gx(t)} cy={gy(reading / m)} r={5} className="fill-blue-500" />
        {Array.from({ length: end + 1 }, (_, i) => i).map(s => (
          <Label key={s} p={{ x: gx(s), y: GR.bottom + 12 }} size={10} weight={500}>
            {String(s)}
          </Label>
        ))}
        <Label p={{ x: GR.right, y: GR.bottom + 26 }} size={10} anchor="end">
          t, s
        </Label>
        <Label p={{ x: GR.left + 8, y: GR.top - 10 }} size={11} anchor="start" tone="blue">
          показание на везната
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset({ t: 0, y: P.y0, v: 0 })} time={t} />
      <Sliders>
        <Slider label="m, kg" value={m} onChange={setM} min={40} max={100} step={5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'везната:', value: `${fmtNum(reading, 1)} kg`, tone: 'blue' },
            { label: 'N =', value: `${fmtNum(m * (G + a), 0)} N` },
            { label: 'a =', value: `${fmtNum(a, 2)} m/s²` },
            { label: 'v =', value: `${fmtNum(v, 1)} m/s` },
          ]}
        />
      </div>
      <Note tone="gray">{P.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Везната мери силата, с която я натискаш – тя е равна на нормалната реакция N. От втория закон N − mg = ma, т.е. N = m(g + a), където a
        е положително нагоре. Масата ти не се променя, променя се само показанието.
      </p>
    </div>
  );
}
