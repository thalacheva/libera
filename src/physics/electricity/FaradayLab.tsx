import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

// Модел: потокът през една навивка от магнит на разстояние x (cm) от центъра на бобината
// е Φ₀ / (1 + (x/a)²)^(3/2) – като поле на магнитен дипол по оста.
const PHI0 = 1e-4; // Wb – най-големият поток през една навивка
const A = 3; // cm – радиус на бобината
const X_FAR = -16; // cm – началното положение на магнита
const WINDOW = 3; // s – колко секунди показват графиките
const SAMPLE = 0.02;

type Mode = 'in' | 'out' | 'shake';
type State = { t: number; x: number; v: number; hist: { t: number; phi: number; emf: number }[]; next: number };

const flux = (x: number) => PHI0 / (1 + (x / A) ** 2) ** 1.5;
/** dΦ/dx в Wb/cm. */
const dFlux = (x: number) => (PHI0 * -1.5 * (2 * x) / (A * A)) / (1 + (x / A) ** 2) ** 2.5;

const px = (x: number) => 330 + x * 9;
const G = { left: 50, right: 466 };

/** Магнит и бобина: ЕДН се индуцира само докато потокът се мени. */
export default function FaradayLab() {
  const [mode, setMode] = useState<Mode>('in');
  const [speed, setSpeed] = useState(0.5); // m/s
  const [turns, setTurns] = useState(200);

  // Скоростта на магнита в cm/s според режима
  const velocity = (t: number, x: number) => {
    const v = speed * 100;
    if (mode === 'in') return x < 0 ? v : 0;
    if (mode === 'out') return x > X_FAR ? -v : 0;
    // Напред-назад между −16 и 0 cm: x = −8 − 8cos(ωt), най-голямата скорост е v
    const w = v / 8;
    return 8 * w * Math.sin(w * t);
  };

  const step = (s: State, dt: number): State => {
    const v = velocity(s.t, s.x);
    const x = Math.max(X_FAR, Math.min(0, s.x + v * dt));
    const t = s.t + dt;
    if (t < s.next) return { ...s, t, x, v };
    const emf = -turns * dFlux(x) * v; // V (dΦ/dx в Wb/cm, v в cm/s)
    const hist = [...s.hist, { t, phi: turns * flux(x), emf }].filter(h => h.t > t - WINDOW);
    return { t, x, v, hist, next: s.next + SAMPLE };
  };

  const start = (m: Mode): State => ({ t: 0, x: m === 'out' ? 0 : X_FAR, v: 0, hist: [], next: SAMPLE });
  const sim = useSimulation<State>(() => start('in'), step, { dt: 1 / 400 });
  const { x, v, t, hist } = sim.state;
  const emf = -turns * dFlux(x) * v;

  const choose = (m: Mode) => {
    setMode(m);
    sim.reset(start(m));
    sim.play();
  };

  // Мащаби на графиките
  const phiMax = turns * PHI0;
  const emfMax = (turns * PHI0 * 0.86 * speed * 100) / A; // най-голямото |ℰ| при тази скорост
  const gt = (tt: number) => G.left + ((tt - Math.max(0, t - WINDOW)) / WINDOW) * (G.right - G.left);
  const line = (vals: { t: number; y: number }[], top: number, h: number, max: number, mid: boolean) =>
    vals.map((p, i) => `${i ? 'L' : 'M'} ${gt(p.t).toFixed(1)} ${(mid ? top + h / 2 - (p.y / max) * (h / 2) : top + h - (p.y / max) * h).toFixed(1)}`).join(' ');

  // Индуцираният полюс на близкия край на бобината (правило на Ленц)
  const induced = Math.abs(emf) < emfMax * 0.05 ? null : v > 0 ? 'N' : 'S';
  const needle = Math.max(-1, Math.min(1, emf / emfMax)) * 60;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'in'} onClick={() => choose('in')}>
          вкарай магнита
        </DiagramButton>
        <DiagramButton active={mode === 'out'} onClick={() => choose('out')}>
          извади магнита
        </DiagramButton>
        <DiagramButton active={mode === 'shake'} onClick={() => choose('shake')}>
          напред-назад
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 300">
        {/* Бобина – задните половини на навивките */}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`b${i}`} d={`M ${300 + i * 10} 40 A 6 28 0 0 0 ${300 + i * 10} 96`} fill="none" className="stroke-amber-700/50" strokeWidth="3" />
        ))}
        {/* Магнитът: червено – северен полюс (обърнат към бобината) */}
        <rect x={px(x - 4)} y={58} width={36} height={20} className="fill-blue-500" />
        <rect x={px(x)} y={58} width={36} height={20} className="fill-rose-500" />
        <text x={px(x - 2)} y={68} fontSize={12} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          S
        </text>
        <text x={px(x + 2)} y={68} fontSize={12} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
          N
        </text>
        {/* Предните половини на навивките */}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`f${i}`} d={`M ${300 + i * 10} 40 A 6 28 0 0 1 ${300 + i * 10} 96`} fill="none" className="stroke-amber-600" strokeWidth="3" />
        ))}
        {induced && (
          <Label p={{ x: 288, y: 30 }} size={14} tone={induced === 'N' ? 'rose' : 'blue'}>
            {induced}
          </Label>
        )}
        {/* Проводници към галванометъра */}
        <path d="M 300 96 L 300 112 L 420 112 L 420 98" fill="none" className="stroke-gray-500" strokeWidth="1.5" />
        <path d="M 360 96 L 360 104 L 440 104 L 440 98" fill="none" className="stroke-gray-500" strokeWidth="1.5" />
        {/* Галванометър */}
        <circle cx={430} cy={66} r={30} className="fill-white stroke-gray-500 dark:fill-gray-900" strokeWidth="2" />
        <line x1={430} y1={86} x2={430 + 26 * Math.sin((needle * Math.PI) / 180)} y2={86 - 26 * Math.cos((needle * Math.PI) / 180)} className="stroke-rose-600" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={430} cy={86} r={3} className="fill-gray-700" />
        <Label p={{ x: 430, y: 48 }} size={10}>
          0
        </Label>

        {/* Графики на потока и на ЕДН */}
        <rect x={G.left} y={134} width={G.right - G.left} height={60} className="fill-gray-50 dark:fill-gray-900/40" />
        <rect x={G.left} y={210} width={G.right - G.left} height={70} className="fill-gray-50 dark:fill-gray-900/40" />
        <line x1={G.left} y1={245} x2={G.right} y2={245} className="stroke-gray-400 dark:stroke-gray-500" />
        <Label p={{ x: G.left - 6, y: 164 }} size={13} anchor="end" tone="violet">
          Φ
        </Label>
        <Label p={{ x: G.left - 6, y: 245 }} size={13} anchor="end" tone="rose">
          ℰ
        </Label>
        {hist.length > 1 && (
          <>
            <path d={line(hist.map(h => ({ t: h.t, y: h.phi })), 134, 60, phiMax * 1.05, false)} fill="none" className="stroke-violet-500" strokeWidth="2.5" />
            <path d={line(hist.map(h => ({ t: h.t, y: Math.max(-emfMax, Math.min(emfMax, h.emf)) })), 210, 70, emfMax * 1.1, true)} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
          </>
        )}
        <Label p={{ x: G.right, y: 292 }} size={10} anchor="end">
          последните 3 s
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset(start(mode))} />
      <Sliders>
        <Slider label="v, m/s" value={speed} onChange={setSpeed} min={0.1} max={1} step={0.1} tone="blue" />
        <Slider label="N" value={turns} onChange={setTurns} min={50} max={500} step={50} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Φ =', value: `${fmtNum(turns * flux(x) * 1000, 2)} mWb`, tone: 'violet' },
            { label: 'ℰ =', value: `${fmtNum(emf * 1000, 0)} mV`, tone: 'rose' },
            { label: 'магнит на', value: `${fmtNum(-x, 1)} cm` },
          ]}
        />
      </div>
      <Note tone={induced ? 'rose' : 'gray'}>
        {induced === 'N'
          ? 'Магнитът се приближава: потокът расте и бобината става северен полюс към него – отблъсква го.'
          : induced === 'S'
            ? 'Магнитът се отдалечава: потокът намалява и бобината става южен полюс – дърпа го обратно.'
            : 'Магнитът стои – потокът не се мени и ЕДН е нула, колкото и силен да е магнитът.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Φ е общият поток през всички N навивки. ЕДН е пропорционално на наклона на графиката на Φ, а не на самия поток: най-голямо е там,
        където Φ се мени най-бързо. Удвои скоростта или броя навивки – ЕДН се удвоява. Стойностите са за силен малък магнит и бобина с радиус 3 cm.
      </p>
    </div>
  );
}
