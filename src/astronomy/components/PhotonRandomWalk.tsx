import { useRef, useState } from 'react';
import { formatScientific } from './physics';
import { useAnimationFrame } from './useAnimationFrame';

const SIZE = 300;
const C = SIZE / 2;
const RADIUS = 130;
const R_SUN = 6.96e8; // m
const C_LIGHT = 3e8;
const YEAR = 3.156e7;

const STEP_SIZES = [
  { label: 'дълга', value: 26 },
  { label: 'средна', value: 13 },
  { label: 'къса', value: 6.5 },
];

const fmt = (v: number, d = 0) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });

function lengthLabel(m: number) {
  if (m >= 0.01) return `${fmt(m * 100, 1)} cm`;
  return `${fmt(m * 1000, 2)} mm`;
}

export default function PhotonRandomWalk() {
  const [stepPx, setStepPx] = useState(13);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [escaped, setEscaped] = useState(false);
  const path = useRef<{ x: number; y: number }[]>([{ x: C, y: C }]);
  const [logL, setLogL] = useState(-3); // реален среден свободен пробег, log10(m)

  useAnimationFrame(running, () => {
    const pts = path.current;
    let p = pts[pts.length - 1];
    let n = 0;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * 2 * Math.PI;
      p = { x: p.x + stepPx * Math.cos(a), y: p.y + stepPx * Math.sin(a) };
      pts.push(p);
      n++;
      if (Math.hypot(p.x - C, p.y - C) >= RADIUS) {
        setRunning(false);
        setEscaped(true);
        break;
      }
    }
    // Пазим само последните точки, за да не тежи рисуването
    if (pts.length > 4000) pts.splice(0, pts.length - 4000);
    setSteps(s => s + n);
  });

  const reset = (size = stepPx) => {
    path.current = [{ x: C, y: C }];
    setSteps(0);
    setEscaped(false);
    setRunning(false);
    setStepPx(size);
  };

  const pts = path.current;
  const last = pts[pts.length - 1];
  const distance = Math.hypot(last.x - C, last.y - C);
  const expected = (RADIUS / stepPx) ** 2;

  // Реалното Слънце
  const ell = 10 ** logL;
  const N = (R_SUN / ell) ** 2;
  const t = (R_SUN * R_SUN) / (ell * C_LIGHT);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пиянското лутане на фотона</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Фотонът изминава малко разстояние ℓ, поглъща се и се излъчва отново в случайна посока. За да се отдалечи на R, са нужни около
        N = (R / ℓ)² стъпки – много повече от R / ℓ.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 items-start">
        <div>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-sm mx-auto rounded-lg bg-slate-900 select-none">
            <defs>
              <radialGradient id="walk-sun">
                <stop offset="0" stopColor="#fde68a" stopOpacity="0.35" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <circle cx={C} cy={C} r={RADIUS} fill="url(#walk-sun)" stroke="#f59e0b" strokeOpacity="0.7" strokeDasharray="5 4" />
            <polyline points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#fde047" strokeOpacity="0.6" strokeWidth="1" />
            <circle cx={C} cy={C} r={3} fill="white" />
            <circle cx={last.x} cy={last.y} r={4} fill={escaped ? '#4ade80' : '#fde047'} />
            {escaped && (
              <text x={C} y={22} fontSize="14" fontWeight="700" textAnchor="middle" fill="#4ade80">
                Излезе след {fmt(steps)} стъпки!
              </text>
            )}
          </svg>
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            <button
              onClick={() => (escaped ? reset() : setRunning(!running))}
              className="px-3 py-1 rounded-lg text-sm bg-amber-500 text-white hover:bg-amber-600"
            >
              {escaped ? 'Отначало' : running ? '⏸ Пауза' : '▶ Пусни фотона'}
            </button>
            {STEP_SIZES.map(s => (
              <button
                key={s.value}
                onClick={() => reset(s.value)}
                className={`px-2 py-1 rounded text-xs border ${
                  stepPx === s.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                стъпка {s.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
            {[
              { label: 'Стъпки', value: fmt(steps) },
              { label: 'Разстояние', value: `${fmt(distance / stepPx, 1)} ℓ` },
              { label: 'Очаквано (R/ℓ)²', value: fmt(expected) },
            ].map(s => (
              <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
                <div className="text-gray-600 dark:text-gray-400">{s.label}</div>
                <div className="font-mono font-bold text-sm">{s.value}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Наполовина по-къса стъпка → четири пъти повече стъпки. Всеки опит е различен, но средно числото е близо до очакваното.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold mb-2">А в истинското Слънце?</p>
          <label className="block">
            <span className="block text-xs font-semibold mb-1">Среден свободен пробег на фотона ℓ = {lengthLabel(ell)}</span>
            <input type="range" min={-4} max={-1} step={0.01} value={logL} onChange={e => setLogL(Number(e.target.value))} className="w-full" />
          </label>
          <div className="space-y-2 mt-3">
            {[
              { label: 'Брой стъпки N = (R☉ / ℓ)²', value: `~${formatScientific(N, 1)}` },
              { label: 'Време t = N · ℓ / c = R☉² / (ℓ · c)', value: `${fmt(t / YEAR)} години` },
              { label: 'По права линия: R☉ / c', value: '2,3 секунди' },
            ].map(s => (
              <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg flex justify-between gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
                <span className="font-mono font-bold whitespace-nowrap">{s.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            Плътността в Слънцето се мени милиони пъти, затова ℓ е различен на различна дълбочина – от части от милиметъра в ядрото до
            сантиметри по-навън. Подробните модели дават между <strong>10 000 и 170 000 години</strong>. Последните ~200 000 km
            енергията изминава много по-бързо с конвекция.
          </p>
        </div>
      </div>
    </div>
  );
}
