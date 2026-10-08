import { useState } from 'react';
import { temperatureToRGB } from './light';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 330;
const SKY_Y = 80;
const LX0 = 40;
const LX1 = 620;
const LY0 = 170;
const LY1 = 300;
const LIMB = 0.6; // потъмняване към ръба
const RINGS = 36;

type Params = { r1: number; r2: number; t1: number; t2: number; a: number; inc: number };

const PRESETS: (Params & { name: string; text: string })[] = [
  { name: 'Алгол', r1: 2.73, r2: 3.48, t1: 12500, t2: 4500, a: 14.1, inc: 79, text: 'Горещата синьо-бяла Алгол A (B8V) и по-хладният, но по-голям субгигант Алгол B (K0IV) с период 2,867 дни. При главния минимум блясъкът пада с 60–70% (около 1,3 звездни величини) – видимо с просто око. Вторичният минимум, когато скрием хладната звезда, едва се забелязва.' },
  { name: 'Еднакви звезди', r1: 1, r2: 1, t1: 5800, t2: 5800, a: 5, inc: 88, text: 'Две еднакви звезди: двата минимума са еднакво дълбоки. Ако единият минимум е по-дълбок, значи звездата, която се скрива тогава, е с по-висока повърхностна яркост – т.е. по-гореща.' },
  { name: 'Бяло джудже и червено джудже', r1: 0.3, r2: 0.012, t1: 3200, t2: 25000, a: 1.2, inc: 89, text: 'Малкото, но горещо бяло джудже изчезва изцяло зад червеното джудже за кратко – минимумът е тесен, плосък и с много стръмни стени.' },
  { name: 'Горещ Юпитер', r1: 1, r2: 0.12, t1: 5800, t2: 1300, a: 10, inc: 89, text: 'Планета колкото Юпитер, близо до звезда като Слънцето. Транзитът намалява блясъка с ~1,5–2%: геометрично (R_p / R_*)² = 0,12² ≈ 1,4%, малко повече заради потъмняването на звездата към ръба. Така Kepler и TESS откриха хиляди екзопланети.' },
];

/** Каква част от светлината на звезда (радиус R, потъмняване към ръба) скрива диск с радиус Ro на разстояние d. */
function blocked(R: number, Ro: number, d: number) {
  let total = 0;
  let covered = 0;
  for (let k = 0; k < RINGS; k++) {
    const rho = ((k + 0.5) / RINGS) * R;
    const mu = Math.sqrt(1 - (rho / R) ** 2);
    const w = (1 - LIMB * (1 - mu)) * rho; // яркост на пръстена × обиколка
    total += w;
    let f: number;
    if (d === 0) f = rho <= Ro ? 1 : 0;
    else if (rho + d <= Ro) f = 1; // пръстенът е изцяло зад диска
    else if (rho >= d + Ro || d >= rho + Ro) f = 0; // не се застъпват
    else f = Math.acos(Math.min(1, Math.max(-1, (rho * rho + d * d - Ro * Ro) / (2 * rho * d)))) / Math.PI;
    covered += w * f;
  }
  return covered / total;
}

function lightAt(p: Params, phase: number) {
  const i = (p.inc * Math.PI) / 180;
  const d = p.a * Math.sqrt(Math.sin(phase) ** 2 + Math.cos(i) ** 2 * Math.cos(phase) ** 2);
  const L1 = p.r1 ** 2 * p.t1 ** 4;
  const L2 = p.r2 ** 2 * p.t2 ** 4;
  // При cos φ > 0 звезда 2 е пред звезда 1
  const lost = Math.cos(phase) > 0 ? L1 * blocked(p.r1, p.r2, d) : L2 * blocked(p.r2, p.r1, d);
  return (L1 + L2 - lost) / (L1 + L2);
}

export default function EclipsingLab() {
  const [params, setParams] = useState<Params>(PRESETS[0]);
  const [presetName, setPresetName] = useState('Алгол');
  const [phase, setPhase] = useState(0.4);
  const [playing, setPlaying] = useState(false);
  const preset = PRESETS.find(p => p.name === presetName);

  useAnimationFrame(playing, dt => setPhase(v => (v + dt * 0.9) % (2 * Math.PI)));

  const N = 360;
  const curve = Array.from({ length: N + 1 }, (_, k) => lightAt(params, -Math.PI / 2 + (k / N) * 2 * Math.PI));
  const minL = Math.min(...curve);
  const lo = Math.max(0, Math.min(minL - 0.02, 0.985));
  const ly = (f: number) => LY1 - ((f - lo) / (1 - lo + 0.01)) * (LY1 - LY0);
  const lx = (k: number) => LX0 + (k / N) * (LX1 - LX0);
  const path = curve.map((f, k) => `${lx(k)},${ly(f)}`).join(' ');
  const nowPhase = ((phase + Math.PI / 2) % (2 * Math.PI)) - Math.PI / 2;
  const nowX = LX0 + ((nowPhase + Math.PI / 2) / (2 * Math.PI)) * (LX1 - LX0);
  const nowL = lightAt(params, phase);

  const primary = 1 - lightAt(params, 0);
  const secondary = 1 - lightAt(params, Math.PI);

  // Небето: проекция на орбитата
  const span = params.a + params.r1 + params.r2;
  const pxR = 250 / span;
  const inc = (params.inc * Math.PI) / 180;
  const sx = W / 2 + params.a * Math.sin(phase) * pxR;
  const sy = SKY_Y + params.a * Math.cos(inc) * Math.cos(phase) * pxR;
  const star1 = { x: W / 2, y: SKY_Y, r: params.r1 * pxR, T: params.t1 };
  const star2 = { x: sx, y: sy, r: Math.max(1.2, params.r2 * pxR), T: params.t2 };
  const order = Math.cos(phase) > 0 ? [star1, star2] : [star2, star1];

  const set = (k: keyof Params, v: number) => {
    setParams(p => ({ ...p, [k]: v }));
    setPresetName('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Затъмняваща двойна и кривата на блясъка ѝ</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Горе – двойката, както би изглеждала от Земята, ако можехме да я разделим. Долу – общият блясък, който всъщност мерим.
        Дълбочината, формата и продължителността на минимумите издават размерите и температурите на звездите.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <radialGradient id="ecl-limb" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.5" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        {order.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={s.r} fill={temperatureToRGB(s.T)} />
            <circle cx={s.x} cy={s.y} r={s.r} fill="url(#ecl-limb)" />
          </g>
        ))}

        {/* Кривата на блясъка */}
        <rect x={LX0} y={LY0 - 10} width={LX1 - LX0} height={LY1 - LY0 + 10} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={path} fill="none" stroke="#fbbf24" strokeWidth="2" />
        <line x1={nowX} x2={nowX} y1={LY0 - 10} y2={LY1} stroke="#f472b6" />
        <circle cx={nowX} cy={ly(nowL)} r="4" fill="#f472b6" />
        <text x={LX0 + 4} y={LY0 + 2} fontSize="9" fill="white" fillOpacity="0.55">
          100%
        </text>
        <text x={LX0 + 4} y={LY1 - 4} fontSize="9" fill="white" fillOpacity="0.55">
          {fmt(lo * 100, 1)}%
        </text>
        <text x={lx(N / 4)} y={LY1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          главен минимум
        </text>
        <text x={lx((3 * N) / 4)} y={LY1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          вторичен минимум
        </text>
        <text x={W - 12} y={20} fontSize="11" textAnchor="end" fill="white">
          блясък: <tspan fill="#fde68a" fontWeight="700">{fmt(nowL * 100, 1)}%</tspan>
        </text>
        <text x={W - 12} y={38} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.7">
          главен: −{fmt(primary * 100, 1)}% ({fmt(-2.5 * Math.log10(1 - primary + 1e-9), 2)} mag)
        </text>
        <text x={W - 12} y={54} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.7">
          вторичен: −{fmt(secondary * 100, secondary < 0.01 ? 2 : 1)}%
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setParams(p);
              setPresetName(p.name);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              p.name === presetName ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">R₁ = {fmt(params.r1, 2)} R☉</label>
          <input type="range" min="0.1" max="5" step="0.01" value={params.r1} onChange={e => set('r1', Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">R₂ = {fmt(params.r2, 3)} R☉</label>
          <input type="range" min="0.01" max="5" step="0.01" value={params.r2} onChange={e => set('r2', Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Наклон i = {params.inc}°</label>
          <input type="range" min="60" max="90" step="0.5" value={params.inc} onChange={e => set('inc', Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">T₁ = {fmt(params.t1, 0)} K</label>
          <input type="range" min="2500" max="30000" step="100" value={params.t1} onChange={e => set('t1', Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">T₂ = {fmt(params.t2, 0)} K</label>
          <input type="range" min="1000" max="30000" step="100" value={params.t2} onChange={e => set('t2', Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Разстояние a = {fmt(params.a, 1)} R☉</label>
          <input type="range" min="1" max="30" step="0.1" value={params.a} onChange={e => set('a', Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {preset
          ? preset.text
          : 'Намалете наклона – минимумите стават плитки и накрая изчезват: затъмнения има само ако гледаме орбитата почти отстрани. Увеличете разстоянието – минимумите стават по-тесни.'}
      </p>
    </div>
  );
}
