import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const S = 0.01; // m² – рамка 10 cm × 10 cm
const W = 70; // половин ширина на рамката в пиксели
const H = 56; // половин височина
const C = { x: 120, y: 100 }; // център на рамката

const GR = { left: 262, right: 466, top: 30, h: 66, gap: 22 };

/** Генератор: рамка се върти в еднородно магнитно поле и в нея се индуцира синусоидално ЕДН. */
export default function GeneratorLab() {
  const [f, setF] = useState(1);
  const [N, setN] = useState(100);
  const [B, setB] = useState(0.2);
  const omega = 2 * Math.PI * f;
  const emfMax = N * B * S * omega;
  // При бързо въртене анимацията се забавя, за да се вижда
  const slow = Math.max(1, f / 0.5);

  const sim = useSimulation<{ th: number }>(() => ({ th: 0 }), (s, dt) => ({ th: (s.th + (omega / slow) * dt) % (2 * Math.PI) }), { dt: 1 / 240 });
  const th = sim.state.th;
  // θ – ъгълът между нормалата на рамката и B. При θ = 0 виждаме рамката откъм ръба: потокът е най-голям, ЕДН е нула.
  // Φ = NBS cos θ, ℰ = −dΦ/dt = NBSω sin θ
  const flux = N * B * S * Math.cos(th);
  const emf = emfMax * Math.sin(th);
  const w = W * Math.sin(th);

  const gx = (a: number) => GR.left + (a / (2 * Math.PI)) * (GR.right - GR.left);
  const curve = (fn: (a: number) => number, top: number) =>
    Array.from({ length: 101 }, (_, i) => (i / 100) * 2 * Math.PI)
      .map((a, i) => `${i ? 'L' : 'M'} ${gx(a).toFixed(1)} ${(top + GR.h / 2 - fn(a) * (GR.h / 2 - 4)).toFixed(1)}`)
      .join(' ');
  const top2 = GR.top + GR.h + GR.gap;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 220">
        {/* Полюсите и линиите на полето */}
        <rect x={6} y={44} width={28} height={112} rx={4} className="fill-rose-500" />
        <rect x={206} y={44} width={28} height={112} rx={4} className="fill-blue-500" />
        <text x={20} y={100} fontSize={14} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          N
        </text>
        <text x={220} y={100} fontSize={14} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          S
        </text>
        {[56, 78, 100, 122, 144].map(y => (
          <line key={y} x1={36} y1={y} x2={204} y2={y} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="5 4" />
        ))}
        <Label p={{ x: 64, y: 182 }} size={11}>
          B →
        </Label>
        {/* Оста и рамката (в перспектива – виждаме я под ъгъл) */}
        <line x1={C.x} y1={18} x2={C.x} y2={176} className="stroke-gray-500" strokeWidth="2" />
        <polygon
          points={`${C.x - w},${C.y - H} ${C.x + w},${C.y - H} ${C.x + w},${C.y + H} ${C.x - w},${C.y + H}`}
          className={Math.cos(th) >= 0 ? 'fill-amber-300/30 stroke-amber-600' : 'fill-amber-500/20 stroke-amber-700'}
          strokeWidth="4"
        />
        {/* Крушка: свети според моментното ЕДН */}
        <circle cx={120} cy={204} r={9} className="fill-yellow-300 stroke-gray-500" strokeWidth="1.5" opacity={0.25 + 0.75 * Math.abs(Math.sin(th))} />

        {/* Графики Φ(θ) и ℰ(θ) за един оборот */}
        {[GR.top, top2].map(t0 => (
          <g key={t0}>
            <rect x={GR.left} y={t0} width={GR.right - GR.left} height={GR.h} className="fill-gray-50 dark:fill-gray-900/40" />
            <line x1={GR.left} y1={t0 + GR.h / 2} x2={GR.right} y2={t0 + GR.h / 2} className="stroke-gray-400 dark:stroke-gray-500" />
          </g>
        ))}
        <path d={curve(Math.cos, GR.top)} fill="none" className="stroke-violet-500" strokeWidth="2.5" />
        <path d={curve(Math.sin, top2)} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
        <line x1={gx(th)} y1={GR.top} x2={gx(th)} y2={top2 + GR.h} className="stroke-gray-500" strokeDasharray="3 3" />
        <circle cx={gx(th)} cy={GR.top + GR.h / 2 - Math.cos(th) * (GR.h / 2 - 4)} r={5} className="fill-violet-500" />
        <circle cx={gx(th)} cy={top2 + GR.h / 2 - Math.sin(th) * (GR.h / 2 - 4)} r={5} className="fill-rose-500" />
        <Label p={{ x: GR.left - 8, y: GR.top + GR.h / 2 }} size={13} anchor="end" tone="violet">
          Φ
        </Label>
        <Label p={{ x: GR.left - 8, y: top2 + GR.h / 2 }} size={13} anchor="end" tone="rose">
          ℰ
        </Label>
        {[0, 90, 180, 270, 360].map(d => (
          <Label key={d} p={{ x: gx((d * Math.PI) / 180), y: top2 + GR.h + 12 }} size={10} weight={500}>
            {`${d}°`}
          </Label>
        ))}
        <Label p={{ x: GR.right, y: GR.top - 12 }} size={10} anchor="end">
          {`завъртане ${Math.round((th * 180) / Math.PI)}°`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset({ th: 0 })} />
      <Sliders>
        <Slider label="f, Hz" value={f} onChange={setF} min={0.5} max={50} step={0.5} tone="blue" />
        <Slider label="N" value={N} onChange={setN} min={10} max={500} step={10} tone="amber" />
        <Slider label="B, T" value={B} onChange={setB} min={0.05} max={1} step={0.05} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ω =', value: `${fmtNum(omega, 1)} rad/s` },
            { label: 'ℰₘₐₓ = NBSω =', value: `${fmtNum(emfMax, 2)} V`, tone: 'rose' },
            { label: 'Φ =', value: `${fmtNum(flux * 1000, 1)} mWb`, tone: 'violet' },
            { label: 'ℰ =', value: `${fmtNum(emf, 2)} V`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        {`${fmtNum(f * 60, 0)} оборота в минута${slow > 1 ? ` – анимацията е забавена ${fmtNum(slow, 0)} пъти` : ''}. При 50 Hz двуполюсен генератор прави 3000 оборота в минута.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Рамката (10 cm × 10 cm, N навивки) се върти около вертикалната ос; θ е ъгълът между нормалата ѝ и полето. Когато я виждаме
        откъм ръба (θ = 0°), полето я пронизва изцяло: потокът е най-голям, но в този миг не се мени – ЕДН е нула. Когато е обърната с лице
        към нас (θ = 90°), линиите на полето лежат в нейната равнина: потокът е нула, но се мени най-бързо – ЕДН е най-голямо. Затова ℰ(θ)
        е изместена на четвърт оборот спрямо Φ(θ).
      </p>
    </div>
  );
}
