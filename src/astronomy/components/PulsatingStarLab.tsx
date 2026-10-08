import { useState } from 'react';
import { temperatureToRGB } from './light';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const SX = 140;
const SY = 150;
const BASE_PX = 85;
const PX0 = 300;
const PX1 = 620;
const PANELS = [
  { key: 'R', label: 'радиус', color: '#93c5fd', y0: 20 },
  { key: 'T', label: 'температура', color: '#fca5a5', y0: 110 },
  { key: 'L', label: 'блясък', color: '#fde68a', y0: 200 },
] as const;
const PANEL_H = 70;

const STARS = [
  { name: 'δ Цефей', P: 5.366, unit: 'дни', M: 4.5, R0: 44, T0: 5900, eR: 0.07, eT: 0.08, text: 'Прототипът на цефеидите, открит от Джон Гудрик през 1784 г. Радиусът се мени с ~±2 млн. km, а температурата – с ~1000 K. Блясъкът е най-голям малко след като звездата е най-свита.' },
  { name: 'RR Лира', P: 0.567, unit: 'дни', M: 0.65, R0: 5, T0: 6700, eR: 0.1, eT: 0.1, text: 'Стара звезда от хоризонталния клон. Пулсира два пъти по-бързо от денонощието – цикълът се проследява за една нощ.' },
  { name: 'Мира', P: 332, unit: 'дни', M: 1.2, R0: 330, T0: 2900, eR: 0.15, eT: 0.1, text: 'При студените мириди пълната светимост се мени само няколко пъти, но видимият блясък – стотици пъти. Когато звездата изстине, в атмосферата ѝ се образуват молекули TiO, които поглъщат видимата светлина като завеса.' },
];

export default function PulsatingStarLab() {
  const [si, setSi] = useState(0);
  const [phase, setPhase] = useState(0.0);
  const [playing, setPlaying] = useState(false);
  const st = STARS[si];

  useAnimationFrame(playing, dt => setPhase(v => (v + dt / 3) % 1));

  // Минималният радиус е малко преди максимума на блясъка (фаза 0)
  const R = (phi: number) => 1 - st.eR * Math.cos(2 * Math.PI * (phi + 0.1));
  const T = (phi: number) => 1 + st.eT * Math.cos(2 * Math.PI * phi) + 0.25 * st.eT * Math.cos(4 * Math.PI * phi - 0.6);
  const L = (phi: number) => R(phi) ** 2 * T(phi) ** 4;

  const r = R(phase);
  const temp = st.T0 * T(phase);
  const lum = L(phase);
  const compression = (1 - r) / st.eR; // от −1 (разширена) до +1 (свита)
  const opaque = 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase + 0.25)); // слоят е непрозрачен, докато се свива и в началото на разширяването
  const starPx = BASE_PX * (1 + (r - 1) * 3); // радиусът е преувеличен 3 пъти

  const series = (f: (p: number) => number) => {
    const vals = Array.from({ length: 201 }, (_, i) => f((i / 200) * 2));
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    return { vals, lo, hi };
  };
  const curves = { R: series(R), T: series(T), L: series(L) };
  const pathOf = (k: 'R' | 'T' | 'L', y0: number) => {
    const { vals, lo, hi } = curves[k];
    return vals.map((v, i) => `${PX0 + (i / 200) * (PX1 - PX0)},${y0 + PANEL_H - ((v - lo) / (hi - lo + 1e-9)) * PANEL_H}`).join(' ');
  };
  const nowX = PX0 + (phase / 2) * (PX1 - PX0);
  const nowY = (k: 'R' | 'T' | 'L', y0: number) => {
    const { lo, hi } = curves[k];
    const v = k === 'R' ? r : k === 'T' ? T(phase) : lum;
    return y0 + PANEL_H - ((v - lo) / (hi - lo + 1e-9)) * PANEL_H;
  };

  const stage =
    compression > 0.3
      ? 'Звездата е свита: слоят от йонизиран хелий е плътен и непрозрачен – задържа топлината отдолу като похлупак. Налягането расте и избутва слоевете навън.'
      : compression < -0.3
        ? 'Звездата е разширена: газът е изстинал, хелият отново е събрал електроните си и слоят е прозрачен – топлината изтича навън, налягането пада и гравитацията свива звездата.'
        : compression > 0
          ? 'Звездата се свива или е започнала да се разширява: топлината е задържана, затова повърхността е най-гореща и най-ярка малко след максималното свиване.'
          : 'Звездата се разширява по инерция и изстива. Скоро слоят ще стане прозрачен и топлината ще изтече.';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Как диша една цефеида</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Звездата се свива и разширява. Слоят от хелий под повърхността действа като клапан: задържа топлината, когато е свит, и я
        пропуска, когато е разширен (механизъм на Едингтън). Промяната на радиуса е преувеличена 3 пъти.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <circle cx={SX} cy={SY} r={BASE_PX} fill="none" stroke="white" strokeOpacity="0.2" strokeDasharray="3 3" />
        <circle cx={SX} cy={SY} r={starPx} fill={temperatureToRGB(temp)} />
        <circle cx={SX} cy={SY} r={starPx * 0.82} fill="none" stroke="#7c2d12" strokeWidth={10} strokeOpacity={0.15 + 0.6 * opaque} />
        <circle cx={SX} cy={SY} r={starPx * 0.55} fill={temperatureToRGB(temp * 1.6)} fillOpacity="0.5" />
        <text x={SX} y={SY - starPx * 0.82 + 3} fontSize="8" textAnchor="middle" fill="#0f172a" fontWeight="700">
          слой на He II
        </text>
        {/* Стрелки за движението на повърхността */}
        {[0, 90, 180, 270].map(a => {
          const rad = (a * Math.PI) / 180;
          const dir = Math.sin(2 * Math.PI * (phase + 0.1)) > 0 ? 1 : -1; // + разширяване
          const x = SX + Math.cos(rad) * (starPx + 12);
          const y = SY + Math.sin(rad) * (starPx + 12);
          return (
            <path
              key={a}
              d={`M ${x} ${y} l ${Math.cos(rad) * 10 * dir} ${Math.sin(rad) * 10 * dir}`}
              stroke="white"
              strokeOpacity="0.6"
              strokeWidth="2"
              markerEnd="url(#ps-arrow)"
            />
          );
        })}
        <defs>
          <marker id="ps-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" fillOpacity="0.7" />
          </marker>
        </defs>
        <text x={SX} y={H - 10} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          R = {fmt(st.R0 * r, 1)} R☉ · T = {fmt(Math.round(temp / 10) * 10, 0)} K
        </text>

        {PANELS.map(p => (
          <g key={p.key}>
            <rect x={PX0} y={p.y0} width={PX1 - PX0} height={PANEL_H} fill="#0b1120" stroke="white" strokeOpacity="0.15" />
            <polyline points={pathOf(p.key, p.y0)} fill="none" stroke={p.color} strokeWidth="1.8" />
            <circle cx={nowX} cy={nowY(p.key, p.y0)} r="3.5" fill={p.color} />
            <text x={PX0 + 4} y={p.y0 + 11} fontSize="9" fill={p.color}>
              {p.label}
            </text>
          </g>
        ))}
        <line x1={nowX} x2={nowX} y1={20} y2={270} stroke="white" strokeOpacity="0.25" />
        <text x={PX1} y={H - 10} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          два периода · P = {fmt(st.P, st.P < 1 ? 3 : 2)} {st.unit}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-yellow-600 text-white text-sm hover:bg-yellow-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {STARS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSi(i)}
            className={`px-3 py-1 rounded text-sm border ${
              i === si ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <input type="range" min="0" max="0.999" step="0.001" value={phase} onChange={e => setPhase(Number(e.target.value))} className="w-full mt-3" />
      <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <strong>Фаза {fmt(phase, 2)}:</strong> {stage}
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {st.text} Средна плътност: {fmt(st.M / st.R0 ** 3, 6)} ρ☉; P · √(ρ / ρ☉) ≈ {fmt(st.P * Math.sqrt(st.M / st.R0 ** 3), 3)} дни.
      </p>
    </div>
  );
}
