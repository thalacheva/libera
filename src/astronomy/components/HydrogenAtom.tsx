import { useState } from 'react';
import { colorName, dec, hydrogenLevel, rydberg, wavelengthToRGB } from './light';

const W = 640;
const H = 340;
const LEVEL_X0 = 40;
const LEVEL_X1 = 250;
const TOP = 40;
const BOTTOM = 280;

// Нивата не са в мащаб – горните иначе се сливат в една линия
const LEVEL_POS: Record<number, number> = { 1: 0, 2: 0.45, 3: 0.65, 4: 0.77, 5: 0.86, 6: 0.93 };
const ly = (n: number) => BOTTOM - (LEVEL_POS[n] ?? 1) * (BOTTOM - TOP);

const SERIES: Record<number, { name: string; band: string }> = {
  1: { name: 'Лайман', band: 'ултравиолетово' },
  2: { name: 'Балмер', band: 'видимо' },
  3: { name: 'Пашен', band: 'инфрачервено' },
};

const GREEK = ['α', 'β', 'γ', 'δ', 'ε'];

// Скала на дължините на вълната вдясно (логаритмична)
const SX0 = 300;
const SX1 = 620;
const LOG0 = Math.log10(85);
const LOG1 = Math.log10(2000);
const sx = (nm: number) => SX0 + ((Math.log10(nm) - LOG0) / (LOG1 - LOG0)) * (SX1 - SX0);

export default function HydrogenAtom() {
  const [lower, setLower] = useState(2);
  const [upper, setUpper] = useState(3);
  const [emission, setEmission] = useState(true);

  const nm = rydberg(lower, upper);
  const dE = hydrogenLevel(upper) - hydrogenLevel(lower);
  const visible = nm >= 380 && nm <= 750;
  const color = visible ? wavelengthToRGB(nm) : nm < 380 ? '#a78bfa' : '#f87171';
  const series = SERIES[lower];
  const lineName = `${series.name} ${GREEK[upper - lower - 1] ?? ''}`.trim();

  const allLines = [1, 2, 3].flatMap(n1 => [2, 3, 4, 5, 6].filter(n2 => n2 > n1).map(n2 => ({ n1, n2, nm: rydberg(n1, n2) })));

  const xArrow = 175;
  const y1 = emission ? ly(upper) : ly(lower);
  const y2 = emission ? ly(lower) : ly(upper);

  // Вълничка – фотонът
  const photonY = (ly(upper) + ly(lower)) / 2;
  const squiggle: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = xArrow + 12 + i;
    const y = photonY + 6 * Math.sin((i / 60) * 6 * Math.PI);
    squiggle.push(`${x},${y}`);
  }

  const pick = (n1: number, n2: number) => {
    setLower(n1);
    setUpper(n2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-cyan-300 dark:border-cyan-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Откъде идват спектралните линии?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Електронът във водородния атом може да е само на определени енергетични нива. При скок надолу атомът излъчва фотон с енергия, равна
        точно на разликата между нивата; при скок нагоре – поглъща такъв.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <marker id="h-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={color} />
          </marker>
        </defs>

        {/* Енергетични нива */}
        <line x1={LEVEL_X0} x2={LEVEL_X1} y1={TOP} y2={TOP} stroke="white" strokeOpacity="0.35" strokeDasharray="4 4" />
        <text x={LEVEL_X1 + 6} y={TOP + 4} fontSize="10" fill="white" fillOpacity="0.6">
          n = ∞ (0 eV)
        </text>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <g key={n}>
            <line
              x1={LEVEL_X0}
              x2={LEVEL_X1}
              y1={ly(n)}
              y2={ly(n)}
              stroke="white"
              strokeOpacity={n === lower || n === upper ? 0.95 : 0.45}
              strokeWidth={n === lower || n === upper ? 2.5 : 1.5}
            />
            <text x={LEVEL_X0 - 8} y={ly(n) + 4} fontSize="11" textAnchor="end" fill="white">
              {n}
            </text>
            {n <= 4 && (
              <text x={LEVEL_X1 + 6} y={ly(n) + 4} fontSize="10" fill="white" fillOpacity="0.6">
                {dec(hydrogenLevel(n), 2)} eV
              </text>
            )}
          </g>
        ))}
        <text x={LEVEL_X0 - 26} y={TOP - 18} fontSize="10" fill="white" fillOpacity="0.6">
          n – номер на нивото (не в мащаб)
        </text>

        {/* Преходът */}
        <line x1={xArrow} x2={xArrow} y1={y1} y2={y2 + (emission ? -8 : 8)} stroke={color} strokeWidth="3" markerEnd="url(#h-arrow)" />
        <circle cx={xArrow} cy={y1} r={6} fill="#38bdf8" stroke="white" strokeWidth="1.5" />
        <polyline points={squiggle.join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
        <text x={xArrow + 44} y={photonY + 22} fontSize="10" textAnchor="middle" fill={color}>
          {emission ? 'излъчен' : 'погълнат'} фотон
        </text>

        {/* Всички линии на трите серии */}
        <text x={SX0} y={TOP - 18} fontSize="11" fill="white" fillOpacity="0.8">
          Линии на водорода, λ (nm, логаритмична скала)
        </text>
        <rect x={sx(380)} y={TOP} width={sx(750) - sx(380)} height={BOTTOM - TOP} fill="white" fillOpacity="0.05" />
        {[1, 2, 3].map(n1 => {
          const ys = TOP + 30 + (n1 - 1) * 80;
          const lines = allLines.filter(l => l.n1 === n1);
          return (
            <g key={n1}>
              <text x={SX0} y={ys - 8} fontSize="11" fill="white" fillOpacity="0.7">
                {SERIES[n1].name} (n → {n1}) – {SERIES[n1].band}
              </text>
              <line x1={SX0} x2={SX1} y1={ys + 18} y2={ys + 18} stroke="white" strokeOpacity="0.15" />
              {lines.map(l => {
                const active = l.n1 === lower && l.n2 === upper;
                const c = l.nm >= 380 && l.nm <= 750 ? wavelengthToRGB(l.nm) : l.nm < 380 ? '#a78bfa' : '#f87171';
                return (
                  <g key={l.n2} onClick={() => pick(l.n1, l.n2)} className="cursor-pointer">
                    <rect x={sx(l.nm) - 5} y={ys} width={10} height={36} fill="transparent" />
                    <line x1={sx(l.nm)} x2={sx(l.nm)} y1={ys} y2={ys + 36} stroke={c} strokeWidth={active ? 4 : 2} strokeOpacity={active ? 1 : 0.6} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {[100, 200, 500, 1000, 2000].map(v => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={BOTTOM} y2={BOTTOM + 4} stroke="white" strokeOpacity="0.5" />
            <text x={sx(v)} y={BOTTOM + 16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {v}
            </text>
          </g>
        ))}
        <line x1={SX0} x2={SX1} y1={BOTTOM} y2={BOTTOM} stroke="white" strokeOpacity="0.4" />
        <text x={(sx(380) + sx(750)) / 2} y={BOTTOM - 6} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          видима
        </text>
        <text x={W / 2} y={H - 12} fontSize="13" fontWeight="600" textAnchor="middle" fill={color}>
          {lineName}: n = {upper} {emission ? '→' : '←'} {lower}, λ = {dec(nm, 1)} nm
        </text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Долно ниво (определя серията)</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => {
                  setLower(n);
                  if (upper <= n) setUpper(n + 1);
                }}
                className={`flex-1 px-2 py-1 rounded border text-xs ${
                  lower === n ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                n = {n} · {SERIES[n].name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Горно ниво</p>
          <div className="flex gap-1">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                disabled={n <= lower}
                onClick={() => setUpper(n)}
                className={`flex-1 px-2 py-1 rounded border text-xs disabled:opacity-30 ${
                  upper === n ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {[true, false].map(e => (
          <button
            key={String(e)}
            onClick={() => setEmission(e)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              emission === e ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {e ? '↓ Излъчване' : '↑ Поглъщане'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'ΔE = 13,6 (1/n₁² − 1/n₂²)', value: `${dec(dE, 2)} eV` },
          { label: 'λ = hc / ΔE', value: `${dec(nm, 1)} nm` },
          { label: 'Серия', value: series.name },
          { label: 'Област', value: visible ? colorName(nm) : series.band },
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
