import { useState } from 'react';
import { dec, element } from './light';
import { SpectrumStrip } from './SpectrumStrip';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 370;
const STAR = { x: 320, y: 105 };
const C_KMS = 299792;
const V_MAX = 50000;
const PERIOD = 0.55; // s между два гребена в анимацията
const SPEED = 90; // скорост на вълните в анимацията, px/s

const MIN = 370;
const MAX = 780;
const STRIP_X = 110;
const STRIP_W = W - STRIP_X - 20;

const LAB = [...element('H').lines, ...element('Ca').lines];

const PRESETS = [
  { label: 'Андромеда', v: -300 },
  { label: 'Звездата на Барнард', v: -110 },
  { label: 'В покой', v: 0 },
  { label: 'Купът в Дева', v: 1100 },
  { label: 'Купът в Кома', v: 6900 },
  { label: 'Квазар 3C 273', v: 43700 },
];

// Плъзгачът е квадратичен – така и малките скорости се нагласят лесно
const toSlider = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v) / V_MAX);
const fromSlider = (s: number) => Math.round(Math.sign(s) * s * s * V_MAX);

export default function DopplerLab() {
  const [v, setV] = useState(1100);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);

  useAnimationFrame(playing, dt => setT(prev => prev + dt));

  const beta = v / C_KMS;
  const factor = Math.sqrt((1 + beta) / (1 - beta)); // релативистки доплеров множител
  const z = factor - 1;
  const shifted = LAB.map(l => ({ ...l, nm: l.nm * factor }));
  const halpha = 656.3;

  // Анимацията силно преувеличава скоростта, иначе ефектът не се вижда
  const vis = 0.75 * Math.sign(v) * Math.sqrt(Math.abs(v) / V_MAX) * SPEED;
  const waves = [];
  for (let k = 0; k < 9; k++) {
    const age = (t % PERIOD) + k * PERIOD;
    waves.push({ k, r: SPEED * age, cx: STAR.x - vis * age, opacity: 1 - age / (9 * PERIOD) });
  }

  const sx = (nm: number) => STRIP_X + ((nm - MIN) / (MAX - MIN)) * STRIP_W;
  const status = v < 0 ? 'приближава се – синьо отместване' : v > 0 ? 'отдалечава се – червено отместване' : 'неподвижна спрямо нас';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Доплеров ефект</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Звездата излъчва вълни във всички посоки, но докато се движи, „настига“ гребените пред себе си и „бяга“ от тези зад себе си. Земята е
        вляво.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <clipPath id="dop-scene">
            <rect x={0} y={0} width={W} height={210} />
          </clipPath>
        </defs>
        <g clipPath="url(#dop-scene)">
          {waves.map(w => (
            <circle
              key={w.k}
              cx={w.cx}
              cy={STAR.y}
              r={w.r}
              fill="none"
              stroke={v < 0 ? '#60a5fa' : v > 0 ? '#f87171' : '#fde68a'}
              strokeOpacity={0.15 + 0.6 * w.opacity}
              strokeWidth="2"
            />
          ))}
        </g>
        <circle cx={STAR.x} cy={STAR.y} r={14} fill="#fde68a" />
        {v !== 0 && (
          <line
            x1={STAR.x}
            y1={STAR.y + 28}
            x2={STAR.x + Math.sign(v) * 40}
            y2={STAR.y + 28}
            stroke="white"
            strokeWidth="2.5"
            markerEnd="url(#dop-arrow)"
          />
        )}
        <defs>
          <marker id="dop-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="white" />
          </marker>
        </defs>

        {/* Земята */}
        <circle cx={26} cy={STAR.y} r={12} fill="#3b82f6" />
        <text x={26} y={STAR.y + 30} fontSize="11" textAnchor="middle" fill="white">
          Земя
        </text>
        <text x={W / 2} y={200} fontSize="12" textAnchor="middle" fill="white" fillOpacity="0.8">
          {status}
        </text>

        {/* Спектрите */}
        <text x={STRIP_X - 10} y={248} fontSize="11" textAnchor="end" fill="white">
          Лаборатория
        </text>
        <SpectrumStrip x={STRIP_X} y={232} width={STRIP_W} height={28} kind="absorption" lines={LAB} min={MIN} max={MAX} />
        <text x={STRIP_X - 10} y={318} fontSize="11" textAnchor="end" fill="white">
          Звездата
        </text>
        <SpectrumStrip x={STRIP_X} y={302} width={STRIP_W} height={28} kind="absorption" lines={shifted} min={MIN} max={MAX} ticks />
        {LAB.map((l, i) => {
          const to = shifted[i].nm;
          if (to > MAX || l.nm < MIN) return null;
          return <line key={l.nm} x1={sx(l.nm)} y1={262} x2={sx(to)} y2={300} stroke="white" strokeOpacity="0.4" strokeDasharray="2 3" />;
        })}
      </svg>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Радиална скорост: v = {v > 0 ? '+' : ''}
          {dec(v, 0)} km/s {v < 0 ? '(към нас)' : v > 0 ? '(от нас)' : ''}
        </label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.002}
          value={toSlider(v)}
          onChange={e => setV(fromSlider(Number(e.target.value)))}
          className="w-full"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setV(p.v)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setPlaying(!playing)}
            className="ml-auto px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            {playing ? '⏸ Пауза' : '▶ Пусни'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'v / c', value: dec(beta, 5) },
          { label: 'z = Δλ / λ', value: dec(z, 5) },
          { label: 'Hα: 656,3 nm →', value: `${dec(halpha * factor, 2)} nm` },
          { label: 'Δλ на Hα', value: `${v > 0 ? '+' : ''}${dec(halpha * z, 2)} nm` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        В анимацията скоростта е силно преувеличена. Отместването в спектъра е изчислено точно, с релативистката формула.
      </p>
    </div>
  );
}
