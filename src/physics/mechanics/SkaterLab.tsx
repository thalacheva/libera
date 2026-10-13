import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

// Опростен модел: тяло с I = 0,8 kg·m² и две ръце по 4 kg на разстояние r от оста
const I_BODY = 0.8;
const ARMS = 8;
const R_OUT = 0.8;
const OMEGA_OUT = 2 * Math.PI * 1.5; // 1,5 оборота в секунда с разперени ръце
const L = (I_BODY + ARMS * R_OUT ** 2) * OMEGA_OUT;

const inertia = (r: number) => I_BODY + ARMS * r * r;

const C = { x: 150, y: 130 };
const PX = 130; // пиксела на метър

/** Пирует: при прибиране на ръцете инерчният момент намалява, а ъгловата скорост расте, защото L = Iω се запазва. */
export default function SkaterLab() {
  const [r, setR] = useState(R_OUT);
  const I = inertia(r);
  const omega = L / I;
  const E = (I * omega * omega) / 2;
  const E0 = (inertia(R_OUT) * OMEGA_OUT ** 2) / 2;

  const sim = useSimulation<{ th: number }>(() => ({ th: 0 }), (s, dt) => ({ th: s.th + omega * dt }), { speed: 0.25 });
  const th = sim.state.th;

  const hand = (side: number) => ({ x: C.x + side * r * PX * Math.cos(th), y: C.y + side * r * PX * Math.sin(th) });
  const shoulder = (side: number) => ({ x: C.x + side * 0.18 * PX * Math.cos(th), y: C.y + side * 0.18 * PX * Math.sin(th) });

  // Стълбчета: I, ω и E спрямо стойностите с разперени ръце
  const bars = [
    { name: 'I', value: I / inertia(R_OUT), fill: 'fill-violet-500' },
    { name: 'ω', value: omega / OMEGA_OUT, fill: 'fill-blue-500' },
    { name: 'L', value: 1, fill: 'fill-emerald-500' },
    { name: 'E', value: E / E0, fill: 'fill-amber-500' },
  ];
  const bx = (i: number) => 320 + i * 40;
  const base = 230;
  const unit = 30;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 260">
        <circle cx={C.x} cy={C.y} r={R_OUT * PX + 12} className="fill-sky-50 dark:fill-sky-950/30" />
        {[-1, 1].map(side => {
          const s = shoulder(side);
          const h = hand(side);
          return (
            <g key={side}>
              <line x1={s.x} y1={s.y} x2={h.x} y2={h.y} className="stroke-rose-400" strokeWidth="7" strokeLinecap="round" />
              <circle cx={h.x} cy={h.y} r={7} className="fill-rose-500" />
            </g>
          );
        })}
        <ellipse cx={C.x} cy={C.y} rx={0.2 * PX} ry={0.11 * PX} transform={`rotate(${(th * 180) / Math.PI} ${C.x} ${C.y})`} className="fill-violet-500" />
        <circle cx={C.x} cy={C.y} r={11} className="fill-amber-200 stroke-amber-600" strokeWidth="1.5" />
        <Label p={{ x: C.x, y: 252 }} size={11}>
          поглед отгоре
        </Label>

        <line x1={300} y1={base} x2={470} y2={base} className="stroke-gray-400 dark:stroke-gray-500" />
        <line x1={300} y1={base - unit} x2={470} y2={base - unit} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
        <Label p={{ x: 296, y: base - unit }} size={10} anchor="end">
          1×
        </Label>
        {bars.map((b, i) => {
          const hgt = Math.min(6.5, b.value) * unit;
          return (
            <g key={b.name}>
              <rect x={bx(i)} y={base - hgt} width={26} height={hgt} className={b.fill} />
              <Label p={{ x: bx(i) + 13, y: base + 14 }} size={13}>
                {b.name}
              </Label>
              <Label p={{ x: bx(i) + 13, y: base - hgt - 10 }} size={10}>
                {`${fmtNum(b.value, 1)}×`}
              </Label>
            </g>
          );
        })}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="r, m" value={r} onChange={setR} min={0.2} max={R_OUT} step={0.05} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'I =', value: `${fmtNum(I, 2)} kg·m²`, tone: 'violet' },
            { label: 'ω =', value: `${fmtNum(omega / (2 * Math.PI), 2)} об/s`, tone: 'blue' },
            { label: 'L =', value: `${fmtNum(L, 1)} kg·m²/s`, tone: 'emerald' },
            { label: 'E =', value: `${fmtNum(E, 0)} J`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={r < R_OUT ? 'amber' : 'gray'}>
        {r < R_OUT
          ? `Енергията е нараснала с ${fmtNum(E - E0, 0)} J – толкова работа са извършили мускулите, за да придърпат ръцете към оста.`
          : 'Пусни въртенето и прибери ръцете с плъзгача.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моментът на импулса L = Iω не се променя, защото ледът почти не създава момент на сила. Ръцете близо до оста означават малък
        инерчен момент I и голяма ъглова скорост ω. Анимацията е забавена 4 пъти; моделът е опростен (ръцете като две точкови маси).
      </p>
    </div>
  );
}
