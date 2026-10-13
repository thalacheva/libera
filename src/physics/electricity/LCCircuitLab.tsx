import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const U0 = 10; // начално напрежение на кондензатора, V
const SHOWN_PERIOD = 3; // секунди за едно трептене на екрана

// Измислени станции в УКВ (FM) обхвата 87,5–108 MHz
const STATIONS = [
  { name: 'A', f: 89.5 },
  { name: 'B', f: 95.0 },
  { name: 'C', f: 101.3 },
  { name: 'D', f: 106.0 },
];
// Знаците върху плочите – встрани от проводника в средата
const SIGN_X = [-28, 28, -16, 16, -40];
const L_RADIO = 0.25e-6; // H
const Q_RADIO = 60; // качествен фактор на кръга
const F_MIN = 87.5;
const F_MAX = 108;

/** Трептящ LC кръг: енергията прелива между кондензатора и бобината; в режим „радио“ – настройка в резонанс. */
export default function LCCircuitLab() {
  const [mode, setMode] = useState<'lc' | 'radio'>('lc');
  const [Lm, setLm] = useState(10); // mH
  const [Cu, setCu] = useState(10); // µF
  const [zeta, setZeta] = useState(0);
  const [Cp, setCp] = useState(11); // pF

  const L = Lm / 1000;
  const C = Cu / 1e6;
  const w0 = 1 / Math.sqrt(L * C);
  const T = (2 * Math.PI) / w0;
  const beta = zeta * w0;
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  const R = 2 * zeta * Math.sqrt(L / C);

  // Решението е известно точно; симулацията брои „показаните“ периоди
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 240 });
  const t = (sim.state.t / SHOWN_PERIOD) * T; // реалното време във веригата
  const q0 = C * U0;
  const env = Math.exp(-beta * t);
  const q = q0 * env * (Math.cos(wd * t) + (beta / wd) * Math.sin(wd * t));
  const i = -q0 * env * (w0 * w0 / wd) * Math.sin(wd * t);
  const W0 = (C * U0 * U0) / 2;
  const WC = (q * q) / (2 * C);
  const WL = (L * i * i) / 2;
  const uC = q / C;

  // Радио
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L_RADIO * Cp * 1e-12)) / 1e6; // MHz
  const response = (f: number) => 1 / Math.sqrt(1 + Q_RADIO * Q_RADIO * (f / f0 - f0 / f) ** 2);
  const tuned = STATIONS.find(s => response(s.f) > 0.7);
  const rx = (f: number) => 40 + ((f - F_MIN) / (F_MAX - F_MIN)) * 420;
  const ry = (a: number) => 180 - a * 130;

  // Чертеж на кръга
  const cap = { x: 120, y: 110 };
  const coil = { x: 330, y: 110 };
  const plusCount = Math.round(Math.abs(uC / U0) * 5);
  const coilGlow = Math.abs(i) / (q0 * w0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'lc'} onClick={() => setMode('lc')}>
          трептящ кръг
        </DiagramButton>
        <DiagramButton active={mode === 'radio'} onClick={() => setMode('radio')}>
          настройка на радио
        </DiagramButton>
      </Buttons>

      {mode === 'lc' ? (
        <>
          <ZoomingSvg viewBox="0 0 480 236">
            {/* Проводници */}
            <path d={`M ${cap.x} ${cap.y - 40} V 40 H ${coil.x} V ${coil.y - 50}`} fill="none" className="stroke-gray-500" strokeWidth="2.5" />
            <path d={`M ${cap.x} ${cap.y + 40} V 190 H ${coil.x} V ${coil.y + 50}`} fill="none" className="stroke-gray-500" strokeWidth="2.5" />
            {/* Кондензатор */}
            <line x1={cap.x} y1={cap.y - 40} x2={cap.x} y2={cap.y - 8} className="stroke-gray-500" strokeWidth="2.5" />
            <line x1={cap.x} y1={cap.y + 8} x2={cap.x} y2={cap.y + 40} className="stroke-gray-500" strokeWidth="2.5" />
            <line x1={cap.x - 34} y1={cap.y - 8} x2={cap.x + 34} y2={cap.y - 8} className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="5" />
            <line x1={cap.x - 34} y1={cap.y + 8} x2={cap.x + 34} y2={cap.y + 8} className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="5" />
            {Array.from({ length: plusCount }, (_, k) => (
              <g key={k}>
                <text x={cap.x + SIGN_X[k]} y={cap.y - 18} fontSize={12} textAnchor="middle" className={uC > 0 ? 'fill-rose-600' : 'fill-blue-600'}>
                  {uC > 0 ? '+' : '−'}
                </text>
                <text x={cap.x + SIGN_X[k]} y={cap.y + 26} fontSize={12} textAnchor="middle" className={uC > 0 ? 'fill-blue-600' : 'fill-rose-600'}>
                  {uC > 0 ? '−' : '+'}
                </text>
              </g>
            ))}
            {/* Електричното поле между плочите */}
            {Math.abs(uC) > 0.5 &&
              [-20, 0, 20].map(dx => (
                <line key={dx} x1={cap.x + dx} y1={cap.y - 4} x2={cap.x + dx} y2={cap.y + 4} className="stroke-rose-400" strokeWidth={1 + 2 * Math.abs(uC / U0)} />
              ))}
            <Label p={{ x: cap.x - 52, y: cap.y }} size={13} anchor="end">
              C
            </Label>
            {/* Бобина */}
            <ellipse cx={coil.x} cy={coil.y} rx={46} ry={62} className="fill-sky-400" opacity={0.6 * coilGlow} />
            <path
              d={Array.from({ length: 6 }, (_, k) => `M ${coil.x - 14} ${coil.y - 50 + k * 17} a 14 8.5 0 1 1 0 17`).join(' ')}
              fill="none"
              className="stroke-amber-600"
              strokeWidth="3"
            />
            <Label p={{ x: coil.x + 56, y: coil.y }} size={13} anchor="start">
              L
            </Label>
            {/* Посока на тока */}
            {Math.abs(i) > 0.05 * q0 * w0 && (
              // Зарядът на горната плоча намалява (i < 0) ⇒ токът тече по горния проводник надясно
              <Arrow from={{ x: i < 0 ? 200 : 250, y: 40 }} to={{ x: i < 0 ? 250 : 200, y: 40 }} tone="emerald" label="i" />
            )}
            {/* Енергийни ленти */}
            <rect x={400} y={60} width={24} height={130} className="fill-gray-100 dark:fill-gray-700" />
            <rect x={400} y={190 - (WC / W0) * 130} width={24} height={(WC / W0) * 130} className="fill-rose-500" />
            <rect x={436} y={60} width={24} height={130} className="fill-gray-100 dark:fill-gray-700" />
            <rect x={436} y={190 - (WL / W0) * 130} width={24} height={(WL / W0) * 130} className="fill-sky-500" />
            <Label p={{ x: 412, y: 204 }} size={11} tone="rose">
              W_C
            </Label>
            <Label p={{ x: 448, y: 204 }} size={11} tone="blue">
              W_L
            </Label>
            <Label p={{ x: 430, y: 222 }} size={10}>
              енергия
            </Label>
            <Label p={{ x: 225, y: 222 }} size={11}>
              {`u_C = ${fmtNum(uC, 1)} V`}
            </Label>
          </ZoomingSvg>
          <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
          <Sliders>
            <Slider label="L, mH" value={Lm} onChange={setLm} min={1} max={100} step={1} tone="amber" />
            <Slider label="C, µF" value={Cu} onChange={setCu} min={1} max={100} step={1} tone="rose" />
            <Slider label="затих." value={zeta} onChange={setZeta} min={0} max={0.15} step={0.01} tone="gray" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'T = 2π√(LC) =', value: `${fmtNum(T * 1000, 2)} ms`, tone: 'blue' },
                { label: 'f =', value: `${fmtNum(1 / T, 0)} Hz` },
                { label: 'R =', value: `${fmtNum(R, 2)} Ω` },
              ]}
            />
          </div>
          <Note tone="gray">
            {zeta === 0
              ? 'Без съпротивление енергията прелива вечно: зареден кондензатор → ток в бобината → обратно зареден кондензатор.'
              : 'Съпротивлението превръща част от енергията в топлина при всяко трептене и трептенията затихват.'}
          </Note>
        </>
      ) : (
        <>
          <ZoomingSvg viewBox="0 0 480 226">
            <line x1={40} y1={180} x2={460} y2={180} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
            {[88, 92, 96, 100, 104, 108].map(f => (
              <g key={f}>
                <line x1={rx(f)} y1={180} x2={rx(f)} y2={185} className="stroke-gray-400" />
                <Label p={{ x: rx(f), y: 196 }} size={10} weight={500}>
                  {String(f)}
                </Label>
              </g>
            ))}
            <Label p={{ x: 460, y: 212 }} size={10} anchor="end">
              f, MHz
            </Label>
            <path
              d={Array.from({ length: 301 }, (_, k) => F_MIN + (k / 300) * (F_MAX - F_MIN))
                .map((f, k) => `${k ? 'L' : 'M'} ${rx(f).toFixed(1)} ${ry(response(f)).toFixed(1)}`)
                .join(' ')}
              fill="none"
              className="stroke-blue-500"
              strokeWidth="2.5"
            />
            {STATIONS.map(s => {
              const on = s === tuned;
              return (
                <g key={s.name}>
                  <line x1={rx(s.f)} y1={44} x2={rx(s.f)} y2={180} className={on ? 'stroke-emerald-500' : 'stroke-gray-300 dark:stroke-gray-600'} strokeWidth={on ? 2.5 : 1.5} strokeDasharray="4 3" />
                  <Label p={{ x: rx(s.f), y: 32 }} size={11} tone={on ? 'emerald' : 'gray'}>
                    {`📻 ${s.name}`}
                  </Label>
                </g>
              );
            })}
            {f0 >= F_MIN && f0 <= F_MAX && <circle cx={rx(f0)} cy={ry(1)} r={5} className="fill-blue-500" />}
            <Label p={{ x: 46, y: 14 }} size={10} anchor="start">
              сила на сигнала във веригата
            </Label>
          </ZoomingSvg>
          <Sliders>
            <Slider label="C, pF" value={Cp} onChange={setCp} min={8.5} max={13.5} step={0.05} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'L =', value: '0,25 µH' },
                { label: 'f₀ = 1/(2π√(LC)) =', value: `${fmtNum(f0, 1)} MHz`, tone: 'blue' },
              ]}
            />
          </div>
          <Note tone={tuned ? 'emerald' : 'gray'}>
            {tuned ? `Хвана станция ${tuned.name} (${fmtNum(tuned.f, 1)} MHz)! Останалите станции почти не възбуждат кръга.` : 'Шум… Завърти кондензатора, докато резонансната честота съвпадне със станция.'}
          </Note>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {mode === 'lc'
          ? 'Кондензаторът е зареден до 10 V. Анимацията е забавена така, че едно трептене трае 3 s – в действителност е хилядни от секундата. Сравни с тяло на пружина: зарядът е като отклонението, токът – като скоростта, L – като масата.'
          : 'Антената улавя едновременно всички станции, но силно трепти само кръгът, чиято собствена честота съвпада с честотата на станцията – резонанс. Станциите и честотите тук са измислени примери.'}
      </p>
    </div>
  );
}
