import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const F0 = 1; // собствена честота, Hz
const W0 = 2 * Math.PI * F0;
const D = 0.05; // амплитуда на ръката, m

type Osc = { t: number; x: number; v: number; amp: number };

/** Установената амплитуда при принудени трептения: A = D·ω₀² / √((ω₀² − Ω²)² + 4β²Ω²). */
const steady = (f: number, beta: number) => {
  const W = 2 * Math.PI * f;
  return (D * W0 * W0) / Math.sqrt((W0 * W0 - W * W) ** 2 + 4 * beta * beta * W * W);
};

const G = { left: 44, right: 466, top: 118, bottom: 270 };
const F_MAX = 2;

/** Принудени трептения: ръка разклаща пружина с тяло; при честота близо до собствената амплитудата расте много. */
export default function ResonanceLab() {
  const [f, setF] = useState(0.6);
  const [beta, setBeta] = useState(0.3);
  const W = 2 * Math.PI * f;

  // x″ = −ω₀²(x − xₕ) − 2βx′, където ръката е в xₕ = D·cos Ωt; amp следи текущия размах
  const accel = (t: number, x: number, v: number) => -W0 * W0 * (x - D * Math.cos(W * t)) - 2 * beta * v;
  const step = (s: Osc, dt: number): Osc => {
    const k1 = [s.v, accel(s.t, s.x, s.v)];
    const k2 = [s.v + (dt / 2) * k1[1], accel(s.t + dt / 2, s.x + (dt / 2) * k1[0], s.v + (dt / 2) * k1[1])];
    const k3 = [s.v + (dt / 2) * k2[1], accel(s.t + dt / 2, s.x + (dt / 2) * k2[0], s.v + (dt / 2) * k2[1])];
    const k4 = [s.v + dt * k3[1], accel(s.t + dt, s.x + dt * k3[0], s.v + dt * k3[1])];
    const x = s.x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    const v = s.v + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    // Размахът бавно „забравя“ старите стойности – около 30% за секунда
    return { t: s.t + dt, x, v, amp: Math.max(Math.abs(x), s.amp * (1 - 0.35 * dt)) };
  };
  const sim = useSimulation<Osc>(() => ({ t: 0, x: 0, v: 0, amp: 0 }), step, { dt: 1 / 500 });
  const { t, x, amp } = sim.state;

  // Мащабът е такъв, че най-голямата установена амплитуда при това β да се побира
  const aMax = steady(Math.sqrt(Math.max(W0 * W0 - 2 * beta * beta, 0)) / (2 * Math.PI), beta);
  const px = 90 / aMax;
  const hand = 80 + D * px * Math.cos(W * t);
  const mass = 280 + Math.max(-1.25 * aMax, Math.min(1.25 * aMax, x)) * px;

  const yMax = aMax / D;
  const gx = (ff: number) => G.left + (ff / F_MAX) * (G.right - G.left);
  const gy = (ratio: number) => G.bottom - (Math.min(ratio, yMax * 1.15) / (yMax * 1.15)) * (G.bottom - G.top);
  const curve = Array.from({ length: 301 }, (_, i) => {
    const ff = (i / 300) * F_MAX;
    return `${i ? 'L' : 'M'} ${gx(ff).toFixed(1)} ${gy(steady(ff, beta) / D).toFixed(1)}`;
  }).join(' ');
  const yStep = yMax > 12 ? 5 : yMax > 5 ? 2 : 1;

  // Пружината от ръката до тялото
  const n = 12;
  const springD = Array.from({ length: n + 1 }, (_, i) => `${i ? 'L' : 'M'} ${(hand + 10 + ((mass - 20 - hand - 10) * i) / n).toFixed(1)} ${i === 0 || i === n ? 60 : 60 + (i % 2 ? -8 : 8)}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 300">
        <line x1={20} y1={84} x2={470} y2={84} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <text x={hand - 8} y={60} fontSize={24} textAnchor="middle" dominantBaseline="central">
          ✋
        </text>
        <path d={springD} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" />
        <rect x={mass - 20} y={44} width={40} height={32} rx={4} className="fill-rose-400 stroke-rose-700" strokeWidth="1.5" />
        <line x1={280} y1={78} x2={280} y2={92} className="stroke-gray-500" strokeWidth="2" />

        {/* Резонансна крива */}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.left} y1={G.bottom} x2={G.left} y2={G.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {Array.from({ length: Math.floor((yMax * 1.15) / yStep) }, (_, i) => (i + 1) * yStep).map(r => (
          <g key={r}>
            <line x1={G.left} y1={gy(r)} x2={G.right} y2={gy(r)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: G.left - 6, y: gy(r) }} size={10} anchor="end">
              {String(r)}
            </Label>
          </g>
        ))}
        {[0, 0.5, 1, 1.5, 2].map(ff => (
          <Label key={ff} p={{ x: gx(ff), y: G.bottom + 12 }} size={10} weight={500}>
            {fmtNum(ff, 1)}
          </Label>
        ))}
        <Label p={{ x: G.right, y: G.bottom + 25 }} size={10} anchor="end">
          f, Hz
        </Label>
        <Label p={{ x: G.left + 6, y: G.top - 8 }} size={11} anchor="start">
          A : D (колко пъти размахът на тялото е по-голям от този на ръката)
        </Label>
        <line x1={gx(F0)} y1={G.top} x2={gx(F0)} y2={G.bottom} className="stroke-emerald-500" strokeDasharray="4 4" />
        <path d={curve} fill="none" className="stroke-blue-500" strokeWidth="2.5" />
        <line x1={gx(f)} y1={G.bottom} x2={gx(f)} y2={gy(amp / D)} className="stroke-rose-400" strokeWidth="3" />
        <circle cx={gx(f)} cy={gy(steady(f, beta) / D)} r={5} className="fill-blue-600" />
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} time={t} />
      <Sliders>
        <Slider label="f, Hz" value={f} onChange={setF} min={0.2} max={2} step={0.02} tone="rose" />
        <Slider label="β, 1/s" value={beta} onChange={setBeta} min={0.1} max={2} step={0.05} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'f₀ =', value: '1 Hz', tone: 'emerald' },
            { label: 'установена A =', value: `${fmtNum(steady(f, beta) * 100, 1)} cm`, tone: 'blue' },
            { label: 'сега', value: `${fmtNum(amp * 100, 1)} cm`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={Math.abs(f - F0) < 0.1 ? 'rose' : 'gray'}>
        {Math.abs(f - F0) < 0.1
          ? 'Резонанс! Ръката разклаща тялото почти със собствената му честота и всеки тласък идва навреме.'
          : f < F0
            ? 'Бавно разклащане: тялото просто следва ръката.'
            : 'Бързо разклащане: тялото не смогва и трепти слабо, в противофаза с ръката.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Ръката трепти с 5 cm и честота f, а собствената честота на тялото е 1 Hz. Синята крива е установената амплитуда, а червеното
        стълбче – текущият размах: след промяна той расте или намалява няколко секунди (преходен процес). Колкото по-малко е затихването β,
        толкова по-висок и тесен е резонансният връх. Мащабът на анимацията се мени с β.
      </p>
    </div>
  );
}
