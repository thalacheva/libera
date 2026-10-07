import { useState } from 'react';
import { dec, planck, T_SUN, temperatureToRGB, WIEN, wavelengthToRGB } from './light';

const W = 640;
const H = 320;
const L = 50; // ляво поле
const R = 620;
const TOP = 30;
const BOTTOM = 270;
const NM_MAX = 2000;

const sx = (nm: number) => L + (nm / NM_MAX) * (R - L);

const PRESETS = [
  { label: 'Жичка на лампа', T: 2700 },
  { label: 'Бетелгейзе', T: 3600 },
  { label: 'Слънцето', T: T_SUN },
  { label: 'Сириус', T: 9940 },
  { label: 'Ригел', T: 12100 },
  { label: 'Спика', T: 22000 },
];

const spectralClass = (T: number) =>
  T >= 30000 ? 'O' : T >= 10000 ? 'B' : T >= 7500 ? 'A' : T >= 6000 ? 'F' : T >= 5200 ? 'G' : T >= 3700 ? 'K' : 'M';

/** Път на кривата на Планк при обща вертикална скала. */
function curve(T: number, yMax: number, closed = false) {
  const pts: string[] = [];
  for (let nm = 20; nm <= NM_MAX; nm += 10) {
    const y = BOTTOM - (planck(nm * 1e-9, T) / yMax) * (BOTTOM - TOP);
    pts.push(`${sx(nm).toFixed(1)},${Math.max(TOP - 20, y).toFixed(1)}`);
  }
  return closed ? `M ${sx(20)},${BOTTOM} L ${pts.join(' L ')} L ${sx(NM_MAX)},${BOTTOM} Z` : `M ${pts.join(' L ')}`;
}

export default function BlackbodyLab() {
  const [T, setT] = useState(T_SUN);
  const [showSun, setShowSun] = useState(true);

  const peakNm = (WIEN / T) * 1e9;
  const peak = (t: number) => planck(WIEN / t, t);
  // Скалата обхваща и двете криви, за да се вижда колко по-ярка е по-горещата
  const yMax = Math.max(peak(T), showSun ? peak(T_SUN) : 0) * 1.08;
  const color = temperatureToRGB(T);
  const flux = (T / T_SUN) ** 4;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Излъчване на черно тяло</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Променете температурата и наблюдавайте как върхът на кривата се мести (закон на Вин), а площта под нея расте като T⁴ (закон на
        Стефан–Болцман).
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <linearGradient id="bb-visible" x1="0" x2="1">
            {[380, 430, 480, 530, 580, 630, 680, 750].map((w, i) => (
              <stop key={w} offset={i / 7} stopColor={wavelengthToRGB(w)} />
            ))}
          </linearGradient>
          <radialGradient id="bb-glow">
            <stop offset="0.45" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Видимата област */}
        <rect x={sx(380)} y={TOP} width={sx(750) - sx(380)} height={BOTTOM - TOP} fill="url(#bb-visible)" fillOpacity="0.18" />
        <rect x={sx(380)} y={BOTTOM} width={sx(750) - sx(380)} height={5} fill="url(#bb-visible)" />
        <text x={sx(190)} y={BOTTOM - 8} fontSize="10" textAnchor="middle" fill="#a5b4fc">
          UV
        </text>
        <text x={sx(565)} y={BOTTOM - 8} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          видима
        </text>
        <text x={sx(1300)} y={BOTTOM - 8} fontSize="10" textAnchor="middle" fill="#fca5a5">
          инфрачервено
        </text>

        {/* Оси */}
        <line x1={L} x2={R} y1={BOTTOM} y2={BOTTOM} stroke="white" strokeOpacity="0.4" />
        <line x1={L} x2={L} y1={TOP - 10} y2={BOTTOM} stroke="white" strokeOpacity="0.4" />
        {[0, 500, 1000, 1500, 2000].map(nm => (
          <text key={nm} x={sx(nm)} y={BOTTOM + 18} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            {nm}
          </text>
        ))}
        <text x={R} y={BOTTOM + 34} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
          λ, nm
        </text>
        <text x={L - 8} y={TOP - 14} fontSize="10" fill="white" fillOpacity="0.6">
          интензитет
        </text>

        <clipPath id="bb-clip">
          <rect x={L} y={TOP - 20} width={R - L} height={BOTTOM - TOP + 20} />
        </clipPath>
        <g clipPath="url(#bb-clip)">
          {showSun && T !== T_SUN && <path d={curve(T_SUN, yMax)} fill="none" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="5 4" />}
          <path d={curve(T, yMax, true)} fill={color} fillOpacity="0.18" />
          <path d={curve(T, yMax)} fill="none" stroke={color} strokeWidth="3" />
        </g>

        {/* Връх на кривата */}
        {peakNm <= NM_MAX && (
          <g>
            <line
              x1={sx(peakNm)}
              x2={sx(peakNm)}
              y1={BOTTOM - (peak(T) / yMax) * (BOTTOM - TOP)}
              y2={BOTTOM}
              stroke="white"
              strokeDasharray="3 3"
              strokeOpacity="0.7"
            />
            <text
              x={sx(peakNm) + 6}
              y={BOTTOM - (peak(T) / yMax) * (BOTTOM - TOP) - 6}
              fontSize="11"
              fill="white"
            >
              λmax = {dec(peakNm, 0)} nm
            </text>
          </g>
        )}
        {peakNm < 20 && (
          <text x={L + 6} y={TOP + 30} fontSize="11" fill="white">
            ← върхът е далеч в ултравиолетовото
          </text>
        )}

        {/* Звездата */}
        <circle cx={R - 45} cy={TOP + 55} r={38} fill="url(#bb-glow)" />
        <circle cx={R - 45} cy={TOP + 55} r={20} fill={color} />
        <text x={R - 45} y={TOP + 112} fontSize="11" textAnchor="middle" fill="white">
          клас {spectralClass(T)}
        </text>
        {showSun && T !== T_SUN && (
          <text x={L + 8} y={TOP + 6} fontSize="10" fill="#fde68a">
            - - - Слънцето (5772 K)
          </text>
        )}
      </svg>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">Температура: T = {dec(T, 0)} K</label>
        <input
          type="range"
          min="2000"
          max="30000"
          step="10"
          value={T}
          onChange={e => setT(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex flex-wrap gap-1 mt-2 items-center">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setT(p.T)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-700"
            >
              {p.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <input type="checkbox" checked={showSun} onChange={e => setShowSun(e.target.checked)} />
            сравни със Слънцето
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Връх (Вин) λmax = b / T', value: `${dec(peakNm, 0)} nm` },
          { label: 'Цвят', value: <span className="inline-block w-5 h-5 rounded-full align-middle border border-white/50" style={{ background: color }} /> },
          { label: 'Поток от 1 m²: (T / T☉)⁴', value: `${dec(flux, flux < 10 ? 2 : 0)} × Слънцето` },
          { label: 'Спектрален клас', value: spectralClass(T) },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
