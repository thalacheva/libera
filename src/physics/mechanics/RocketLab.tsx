import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '../sim';

const R_MAX = 20;
const V_MAX = 14;
const ORBIT = 7.9;
const L = 46;
const RIGHT = 462;
const TOP = 14;
const BOTTOM = 190;

const rx = (r: number) => L + ((r - 1) / (R_MAX - 1)) * (RIGHT - L);
const vy = (v: number) => BOTTOM - (Math.min(v, V_MAX) / V_MAX) * (BOTTOM - TOP);

/**
 * Ракета от 100 t с полезен товар 1 t: горивото е 90% от масата на всяка степен, а корпусът – 10%.
 * Изхвърленият празен корпус на долната степен вече не трябва да се ускорява.
 */
function stagedDv(u: number, n: number) {
  const stage = 99 / n;
  let m = 100;
  let dv = 0;
  for (let i = 0; i < n; i++) {
    const burnt = m - 0.9 * stage;
    dv += u * Math.log(m / burnt);
    m = burnt - 0.1 * stage;
  }
  return dv;
}

/** Ракетата изхвърля горивото на порции: всяка порция дава толкова повече скорост, колкото по-лека е вече ракетата. */
export default function RocketLab() {
  const [u, setU] = useState(3);
  const [R, setR] = useState(10);
  const [n, setN] = useState(4);

  // Порция δ, изхвърлена със скорост u спрямо ракетата, дава Δv = u·δ/m (m – масата преди изхвърлянето)
  const delta = (1 - 1 / R) / n;
  const steps = [{ r: 1, v: 0 }];
  let m = 1;
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (u * delta) / m;
    m -= delta;
    steps.push({ r: 1 / m, v });
  }
  const exact = u * Math.log(R);
  const stairs = steps.map((p, i) => (i === 0 ? `${rx(p.r)},${vy(p.v)}` : `${rx(p.r)},${vy(steps[i - 1].v)} ${rx(p.r)},${vy(p.v)}`)).join(' ');
  const curve = Array.from({ length: 96 }, (_, i) => 1 + (i / 95) * (R_MAX - 1))
    .map(r => `${rx(r).toFixed(1)},${vy(u * Math.log(r)).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 330">
        <line x1={L} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={L} y1={BOTTOM} x2={L} y2={TOP} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[0, 4, 8, 12].map(k => (
          <Label key={k} p={{ x: L - 6, y: vy(k) }} size={10} anchor="end">
            {String(k)}
          </Label>
        ))}
        {[1, 5, 10, 15, 20].map(r => (
          <Label key={r} p={{ x: rx(r), y: BOTTOM + 13 }} size={10} weight={500}>
            {String(r)}
          </Label>
        ))}
        <Label p={{ x: L + 6, y: TOP + 4 }} size={11} anchor="start">
          v, km/s
        </Label>
        <Label p={{ x: RIGHT, y: BOTTOM + 27 }} size={11} anchor="end">
          m₀/m
        </Label>
        <line x1={L} y1={vy(ORBIT)} x2={RIGHT} y2={vy(ORBIT)} className="stroke-emerald-500" strokeDasharray="5 4" strokeWidth="1.5" />
        <Label p={{ x: RIGHT - 4, y: vy(ORBIT) - 10 }} size={10} tone="emerald" anchor="end">
          7,9 km/s – около Земята
        </Label>
        <polyline points={curve} fill="none" className="stroke-blue-500" strokeWidth="1.5" strokeDasharray="4 3" />
        <polyline points={stairs} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
        <line x1={rx(R)} y1={BOTTOM} x2={rx(R)} y2={vy(exact)} className="stroke-gray-400" strokeDasharray="2 3" />
        <circle cx={rx(R)} cy={vy(exact)} r={5} className="fill-blue-500" />

        {/* Едностепенна срещу многостепенна ракета със същото количество гориво */}
        <Label p={{ x: 20, y: 236 }} size={11} anchor="start">
          100 t, товар 1 t, при същото u:
        </Label>
        {[1, 2, 3].map(k => {
          const dv = stagedDv(u, k);
          return (
            <g key={k}>
              <Label p={{ x: 20, y: 236 + k * 26 }} size={11} anchor="start">
                {k === 1 ? '1 степен' : `${k} степени`}
              </Label>
              <rect x={96} y={228 + k * 26} width={(dv / V_MAX) * 300} height={16} className={dv >= ORBIT ? 'fill-emerald-500/70' : 'fill-amber-500/70'} />
              <Label p={{ x: 102 + (dv / V_MAX) * 300, y: 236 + k * 26 }} size={11} anchor="start">
                {`${fmtNum(dv, 1)} km/s`}
              </Label>
            </g>
          );
        })}
        <line x1={96 + (ORBIT / V_MAX) * 300} y1={248} x2={96 + (ORBIT / V_MAX) * 300} y2={326} className="stroke-emerald-500" strokeDasharray="5 4" strokeWidth="1.5" />
      </ZoomingSvg>

      <Sliders>
        <Slider label="u, km/s" value={u} onChange={setU} min={1} max={4.5} step={0.5} tone="blue" />
        <Slider label="m₀/m₁" value={R} onChange={setR} min={1.5} max={20} step={0.5} tone="gray" />
        <Slider label="порции" value={n} onChange={setN} min={1} max={40} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'гориво', value: `${fmtNum((1 - 1 / R) * 100, 0)}% от масата` },
            { label: `${n} ${n === 1 ? 'порция' : 'порции'}:`, value: `${fmtNum(v, 2)} km/s`, tone: 'rose' },
            { label: 'u·ln(m₀/m₁) =', value: `${fmtNum(exact, 2)} km/s`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={exact >= ORBIT ? 'emerald' : 'amber'}>
        {exact >= ORBIT
          ? 'Стига за орбита около Земята – ако пренебрегнем загубите от гравитацията и въздуха, които в действителност са 1,5–2 km/s.'
          : `Не стига за орбита: трябва m₀/m₁ ≥ ${fmtNum(Math.exp(ORBIT / u), 1)} при тази скорост на газовете.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червената стълбичка: ракетата изхвърля горивото на няколко порции. Всяка порция носи импулс назад, а ракетата получава същия импулс
        напред. Колкото повече и по-малки са порциите, толкова по-близо сме до синята крива на Циолковски v = u·ln(m₀/m). Кривата расте все
        по-бавно – затова ракетите са на степени: празните резервоари се изхвърлят и вече не се ускоряват.
      </p>
    </div>
  );
}
