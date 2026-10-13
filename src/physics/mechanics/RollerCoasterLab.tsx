import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const MASS = 500;
const X_END = 100;
const HILL_X = 48;

type Cart = { x: number; v: number; heat: number; passed: boolean };

/** Профилът на пистата: косинусови преходи между опорни точки – в тях наклонът е 0 (върхове и долини). */
function track(hill: number) {
  const keys: [number, number][] = [
    [0, 32],
    [22, 2],
    [HILL_X, hill],
    [72, 2],
    [X_END, 34],
  ];
  const seg = (x: number) => {
    let i = 0;
    while (i < keys.length - 2 && x > keys[i + 1][0]) i++;
    return i;
  };
  const y = (x: number) => {
    const i = seg(x);
    const [[x1, y1], [x2, y2]] = [keys[i], keys[i + 1]];
    const u = (x - x1) / (x2 - x1);
    return y1 + ((y2 - y1) * (1 - Math.cos(Math.PI * u))) / 2;
  };
  const slope = (x: number) => {
    const i = seg(x);
    const [[x1, y1], [x2, y2]] = [keys[i], keys[i + 1]];
    const u = (x - x1) / (x2 - x1);
    return ((y2 - y1) * Math.PI * Math.sin(Math.PI * u)) / (2 * (x2 - x1));
  };
  return { y, slope };
}

const px = (x: number) => 20 + (x / X_END) * 440;
const py = (y: number) => 190 - y * 4.4;

/** Влакче без двигател: потенциалната енергия става кинетична и обратно, а триенето превръща част от нея в топлина. */
export default function RollerCoasterLab() {
  const [hill, setHill] = useState(24);
  const [mu, setMu] = useState(0);
  const [v0, setV0] = useState(2);
  const T = track(hill);

  const step = (s: Cart, dt: number): Cart => {
    const th = Math.atan(T.slope(s.x));
    const [sin, cos] = [Math.sin(th), Math.cos(th)];
    let v = s.v;
    const drive = -G * sin;
    const fr = mu * G * cos;
    if (v === 0) {
      // Покой: триенето при покой задържа количката, ако наклонът е малък
      if (Math.abs(drive) <= fr) return s;
      v += (drive - Math.sign(drive) * fr) * dt;
    } else {
      const nv = v + (drive - Math.sign(v) * fr) * dt;
      // При триене скоростта не сменя посоката си в една стъпка – спира
      v = mu > 0 && Math.sign(nv) !== Math.sign(v) ? 0 : nv;
    }
    let x = s.x + v * cos * dt;
    // В двата края има буфери – количката отскача
    if (x < 0) [x, v] = [0, Math.abs(v)];
    if (x > X_END) [x, v] = [X_END, -Math.abs(v)];
    return { x, v, heat: s.heat + MASS * fr * Math.abs(v) * dt, passed: s.passed || x > HILL_X };
  };
  const init = (): Cart => ({ x: 0, v: v0, heat: 0, passed: false });
  const sim = useSimulation<Cart>(init, step, { dt: 1 / 500 });
  const { x, v, heat, passed } = sim.state;

  const restart = () => sim.reset(init());
  const change = (set: (n: number) => void) => (n: number) => {
    set(n);
    sim.reset({ x: 0, v: set === setV0 ? n : v0, heat: 0, passed: false });
  };

  const E0 = (MASS * v0 * v0) / 2 + MASS * G * T.y(0);
  const ek = (MASS * v * v) / 2;
  const ep = MASS * G * T.y(x);
  const enough = E0 > MASS * G * hill;

  const path = Array.from({ length: 201 }, (_, i) => (i / 200) * X_END)
    .map((s, i) => `${i ? 'L' : 'M'} ${px(s).toFixed(1)} ${py(T.y(s)).toFixed(1)}`)
    .join(' ');
  const th = Math.atan(T.slope(x));
  // Количката е малко над релсата, по нормалата
  const cart = { x: px(x) - 7 * Math.sin(th), y: py(T.y(x)) - 7 * Math.cos(th) };
  const tip = { x: cart.x + v * 4 * Math.cos(th), y: cart.y - v * 4 * Math.sin(th) };

  // Стълбчета на енергията – дял от началната
  const bars: [string, number, string][] = [
    ['кинетична', ek, 'fill-blue-500'],
    ['потенциална', ep, 'fill-violet-500'],
    ['топлина', heat, 'fill-rose-500'],
  ];
  let acc = 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 270">
        <path d={`${path} L ${px(X_END)} 200 L ${px(0)} 200 Z`} className="fill-gray-100 dark:fill-gray-700/40" />
        <path d={path} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="3" />
        <line x1={px(HILL_X) - 30} y1={py(hill)} x2={px(HILL_X) + 30} y2={py(hill)} className="stroke-amber-500" strokeDasharray="4 3" />
        <Label p={{ x: px(HILL_X), y: py(hill) - 12 }} size={11} tone="amber">
          {`хълм ${fmtNum(hill)} m`}
        </Label>
        <Label p={{ x: px(0) + 4, y: py(32) - 12 }} size={11} anchor="start">
          32 m
        </Label>
        <circle cx={cart.x} cy={cart.y} r={7} className="fill-blue-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        {Math.abs(v) > 0.5 && <Arrow from={cart} to={tip} tone="blue" width={2} />}

        {/* Енергията: едно стълбче, разделено на три части */}
        <rect x={20} y={222} width={440} height={20} className="fill-gray-100 dark:fill-gray-700/50" />
        {bars.map(([name, e, cls]) => {
          const w = (Math.max(0, e) / E0) * 440;
          const left = 20 + acc;
          acc += w;
          return (
            <g key={name}>
              <rect x={left} y={222} width={w} height={20} className={cls} />
              {w > 60 && (
                <text x={left + w / 2} y={232} fontSize={11} textAnchor="middle" dominantBaseline="central" className="fill-white font-semibold">
                  {name}
                </text>
              )}
            </g>
          );
        })}
        <Label p={{ x: 20, y: 258 }} size={11} anchor="start">
          {`пълна енергия ${fmtNum(E0 / 1000, 0)} kJ`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={sim.time} />
      <Sliders>
        <Slider label="хълм, m" value={hill} onChange={change(setHill)} min={10} max={34} step={1} tone="amber" />
        <Slider label="μ" value={mu} onChange={change(setMu)} min={0} max={0.1} step={0.01} tone="rose" />
        <Slider label="v₀, m/s" value={v0} onChange={change(setV0)} min={0.5} max={6} step={0.5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'v =', value: `${fmtNum(Math.abs(v) * 3.6, 0)} km/h`, tone: 'blue' },
            { label: 'Eₖ =', value: `${fmtNum(ek / 1000, 0)} kJ`, tone: 'blue' },
            { label: 'Eₚ =', value: `${fmtNum(ep / 1000, 0)} kJ`, tone: 'violet' },
            { label: 'Q =', value: `${fmtNum(heat / 1000, 0)} kJ`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={passed ? 'emerald' : 'gray'}>
        {passed
          ? 'Количката мина хълма!'
          : mu === 0
            ? enough
              ? 'Без триене енергията стига – пусни и провери.'
              : 'Без триене енергията не стига: хълмът е по-висок от началната височина плюс v₀²/2g.'
            : 'С триене част от енергията става топлина – стига ли остатъкът?'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Количката (500 kg) тръгва от 32 m с начална скорост v₀. Без триене сумата Eₖ + Eₚ е постоянна и количката се люлее вечно; с
        триене топлината расте, докато количката спре в някоя долина. Моделът е опростен – триенето е μmg cos α, без влиянието на кривината.
      </p>
    </div>
  );
}
