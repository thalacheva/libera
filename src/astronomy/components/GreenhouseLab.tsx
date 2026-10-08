import { useState } from 'react';
import { equilibriumT, fmt, terrestrial, type PlanetId } from './terrestrialData';

const W = 640;
const H = 300;
const GROUND = 250;
const TOP = 40;
const MAX_LAYERS_DRAWN = 12;

const CHOICES: PlanetId[] = ['venus', 'earth', 'mars'];

// Плъзгачът е логаритмичен: s ∈ [0, 1] → N ∈ [0, 150]
const N_MAX = 150;
const toN = (s: number) => (s === 0 ? 0 : 10 ** (s * Math.log10(N_MAX + 1)) - 1);
const toS = (N: number) => Math.log10(N + 1) / Math.log10(N_MAX + 1);

export default function GreenhouseLab() {
  const [planetId, setPlanetId] = useState<PlanetId>('earth');
  const [s, setS] = useState(0);
  const planet = terrestrial(planetId);

  const N = toN(s);
  const tEq = equilibriumT(planet.a, planet.albedo);
  const tSurface = tEq * (1 + N) ** 0.25;
  const nReal = (planet.meanT / tEq) ** 4 - 1;

  // Термометър вдясно: 100 – 800 K
  const ty = (T: number) => GROUND - ((T - 100) / 700) * (GROUND - TOP);

  // Ако двата маркера на термометъра са твърде близо, раздалечаваме надписите
  const gap = ty(tEq) - ty(planet.meanT);
  const labelShift = Math.abs(gap) < 14 ? (14 - Math.abs(gap)) / 2 * (gap >= 0 ? 1 : -1) : 0;

  const drawn = Math.min(MAX_LAYERS_DRAWN, Math.ceil(N));
  const layerY = (i: number) => GROUND - 30 - (i * (GROUND - TOP - 50)) / MAX_LAYERS_DRAWN;
  const hot = Math.min(1, (tSurface - 150) / 600);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Парниковият ефект</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Видимата светлина минава през атмосферата, но топлинното (инфрачервено) излъчване на повърхността се поглъща от CO₂ и водна
        пара. Всеки непрозрачен за него слой връща половината обратно надолу. Добавете слоеве и намерете реалната температура.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <linearGradient id="gh-sky" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={planetId === 'venus' ? '#fbbf24' : planetId === 'mars' ? '#fb923c' : '#60a5fa'} stopOpacity={0.15 + 0.35 * s} />
            <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
          <marker id="gh-arrow-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#fde047" />
          </marker>
          <marker id="gh-arrow-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#f87171" />
          </marker>
        </defs>

        <rect x={0} y={TOP - 20} width={470} height={GROUND - TOP + 20} fill="url(#gh-sky)" />

        {/* Слоевете атмосфера */}
        {Array.from({ length: drawn }, (_, i) => (
          <line key={i} x1={20} x2={450} y1={layerY(i)} y2={layerY(i)} stroke="#f97316" strokeOpacity={0.35 + 0.4 * (1 - i / MAX_LAYERS_DRAWN)} strokeWidth="2" strokeDasharray="10 4" />
        ))}
        {N > MAX_LAYERS_DRAWN && (
          <text x={440} y={layerY(MAX_LAYERS_DRAWN - 1) - 8} fontSize="11" textAnchor="end" fill="#fdba74">
            … общо {fmt(N, 0)} слоя
          </text>
        )}

        {/* Входяща слънчева светлина */}
        {[70, 130, 190].map(x => (
          <line key={x} x1={x} y1={TOP - 10} x2={x + 40} y2={GROUND - 4} stroke="#fde047" strokeWidth="2.5" markerEnd="url(#gh-arrow-y)" />
        ))}
        <text x={70} y={TOP - 18} fontSize="11" fill="#fde047">
          видима светлина
        </text>

        {/* Инфрачервено: до космоса стига все по-малка част, а слоевете връщат топлина надолу */}
        {[290, 360].map((x, k) => (
          <g key={x}>
            <line x1={x} y1={GROUND - 4} x2={x} y2={TOP} stroke="#f87171" strokeOpacity={Math.max(0.15, 1 / (1 + N))} strokeWidth="2.5" markerEnd="url(#gh-arrow-r)" />
            {N > 0 && (
              <line
                x1={x + 18}
                y1={layerY(drawn - 1)}
                x2={x + 18}
                y2={GROUND - 4}
                stroke="#f87171"
                strokeOpacity={Math.min(1, 0.3 + N)}
                strokeWidth="2"
                strokeDasharray="4 3"
                markerEnd="url(#gh-arrow-r)"
              />
            )}
            {k === 0 && (
              <text x={x - 10} y={TOP + 10} fontSize="11" textAnchor="end" fill="#f87171">
                инфрачервено
              </text>
            )}
          </g>
        ))}

        {/* Повърхност */}
        <rect x={0} y={GROUND} width={470} height={H - GROUND} fill={`rgb(${120 + 135 * hot}, ${90 - 40 * hot}, ${60 - 40 * hot})`} />
        <text x={235} y={GROUND + 30} fontSize="12" textAnchor="middle" fill="white">
          повърхност: {fmt(tSurface, 0)} K ({fmt(tSurface - 273, 0)} °C)
        </text>

        {/* Термометър */}
        <g>
          <rect x={530} y={TOP} width={16} height={GROUND - TOP} rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" />
          <rect x={533} y={ty(Math.min(tSurface, 800))} width={10} height={GROUND - ty(Math.min(tSurface, 800))} rx="5" fill="#ef4444" />
          <circle cx={538} cy={GROUND + 10} r={12} fill="#ef4444" />
          {[200, 300, 400, 500, 600, 700, 800].map(T => (
            <g key={T}>
              <line x1={524} x2={530} y1={ty(T)} y2={ty(T)} stroke="white" strokeOpacity="0.5" />
              <text x={520} y={ty(T) + 4} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
                {T}
              </text>
            </g>
          ))}
          {/* Маркери: равновесна и реална */}
          <line x1={548} x2={566} y1={ty(tEq)} y2={ty(tEq)} stroke="#93c5fd" strokeWidth="2" />
          <text x={570} y={ty(tEq) + 4 + labelShift} fontSize="10" fill="#93c5fd">
            T_eq
          </text>
          <line x1={548} x2={566} y1={ty(planet.meanT)} y2={ty(planet.meanT)} stroke="#4ade80" strokeWidth="2" />
          <text x={570} y={ty(planet.meanT) + 4 - labelShift} fontSize="10" fill="#4ade80">
            реална
          </text>
          <text x={538} y={TOP - 10} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            K
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {CHOICES.map(id => (
          <button
            key={id}
            onClick={() => {
              setPlanetId(id);
              setS(0);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              id === planetId
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {terrestrial(id).name}
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold mt-4 mb-1">Брой непрозрачни за инфрачервеното слоеве N = {fmt(N, N < 10 ? 2 : 0)}</label>
      <input type="range" min="0" max="1" step="0.002" value={s} onChange={e => setS(Number(e.target.value))} className="w-full" />
      <button onClick={() => setS(toS(nReal))} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        Покажи реалната стойност за {planet.name === 'Земя' ? 'Земята' : planet.name}
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Албедо A', value: fmt(planet.albedo, 2) },
          { label: 'Без атмосфера T_eq', value: `${fmt(tEq, 0)} K` },
          { label: 'Модел T = T_eq(1 + N)^¼', value: `${fmt(tSurface, 0)} K` },
          { label: 'Измерена средна', value: `${planet.meanT} K` },
        ].map(st => (
          <div key={st.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{st.label}</div>
            <div className="font-mono font-bold">{st.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        За {planet.name === 'Земя' ? 'Земята' : planet.name} са нужни N ≈ {fmt(nReal, nReal < 10 ? 2 : 0)} слоя.{' '}
        {planetId === 'venus' &&
          'Венера отразява 76% от светлината и без атмосфера би била по-студена от Земята! Но 92 bar CO₂ са като над сто одеяла.'}
        {planetId === 'earth' &&
          'Без парниковия ефект океаните щяха да замръзнат. Малко повече CO₂ означава малко повече N – и по-висока температура.'}
        {planetId === 'mars' && 'Атмосферата на Марс също е от CO₂, но е 15 000 пъти по-рядка от венерианската – ефектът е само няколко градуса.'}
      </p>
    </div>
  );
}
