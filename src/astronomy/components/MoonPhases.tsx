import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { litPath } from './earthMath';
import { DEG, formatHours } from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

export const SYNODIC_MONTH = 29.53;

const PHASES = [
  { name: 'Новолуние', icon: '🌑', from: 0 },
  { name: 'Млад месец (растящ сърп)', icon: '🌒', from: 0.03 },
  { name: 'Първа четвърт', icon: '🌓', from: 0.22 },
  { name: 'Растяща Луна', icon: '🌔', from: 0.28 },
  { name: 'Пълнолуние', icon: '🌕', from: 0.47 },
  { name: 'Намаляваща Луна', icon: '🌖', from: 0.53 },
  { name: 'Последна четвърт', icon: '🌗', from: 0.72 },
  { name: 'Стар месец (намаляващ сърп)', icon: '🌘', from: 0.78 },
  { name: 'Новолуние', icon: '🌑', from: 0.97 },
];

const PRESETS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];

const CX = 220;
const CY = 200;
const ORBIT_R = 140;
const EARTH_R = 34;
const MOON_R = 14;

function phaseOf(fraction: number) {
  return [...PHASES].reverse().find(p => fraction >= p.from)!;
}

export default function MoonPhases() {
  const [age, setAge] = useState(7.4);
  const [playing, setPlaying] = useState(false);
  const [southern, setSouthern] = useState(false);

  useAnimationFrame(playing, dt => setAge(a => (a + dt * 2.5) % SYNODIC_MONTH));

  const fraction = age / SYNODIC_MONTH;
  // Елонгация – ъгъл Слънце–Земя–Луна, расте на изток
  const elongation = fraction * 360;
  const psi = elongation * DEG;
  const illuminated = (1 - Math.cos(psi)) / 2;
  const phase = phaseOf(fraction);

  // Изглед отгоре: Слънцето е вляво, обикалянето е обратно на часовника
  const theta = Math.PI + psi;
  const moon = {
    x: CX + ORBIT_R * Math.cos(theta),
    y: CY - ORBIT_R * Math.sin(theta),
  };

  // Луната изостава от Слънцето с ψ / 15° часа
  const lag = elongation / 15;
  const rise = 6 + lag;
  const transit = 12 + lag;
  const set = 18 + lag;

  const timeMarks = [
    { label: '12:00', angle: 180 },
    { label: '18:00', angle: 270 },
    { label: '00:00', angle: 0 },
    { label: '06:00', angle: 90 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Симулатор на лунните фази
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вляво – изглед отгоре (от север). Вдясно – какво виждаме от Земята.
      </p>

      <div className="grid md:grid-cols-[1fr_220px] gap-4 items-center">
        <svg viewBox="0 0 440 400" className="w-full h-auto">
          {[-80, -40, 0, 40, 80].map(o => (
            <line
              key={o}
              x1="0"
              x2="45"
              y1={CY + o}
              y2={CY + o}
              stroke="rgb(251, 191, 36)"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
          <text
            x="4"
            y={CY - 95}
            fontSize="13"
            fontWeight="bold"
            fill="rgb(217, 119, 6)"
          >
            ☀️ към Слънцето
          </text>

          <circle
            cx={CX}
            cy={CY}
            r={ORBIT_R}
            fill="none"
            stroke="rgb(148, 163, 184)"
            strokeDasharray="4,4"
          />
          {/* Посока на обикаляне */}
          <path
            d={`M ${CX + ORBIT_R + 16},${CY + 30} A ${ORBIT_R + 16},${ORBIT_R + 16} 0 0,0 ${CX + ORBIT_R + 16},${CY - 30}`}
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
            markerEnd="url(#moon-orbit-arrow)"
          />
          <defs>
            <marker
              id="moon-orbit-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="rgb(168, 85, 247)" />
            </marker>
          </defs>

          {/* Положения на основните фази */}
          {PRESETS.map(p => {
            const t = Math.PI + p * 2 * Math.PI;
            return (
              <circle
                key={p}
                cx={CX + ORBIT_R * Math.cos(t)}
                cy={CY - ORBIT_R * Math.sin(t)}
                r="3"
                className="fill-gray-300 dark:fill-gray-600"
              />
            );
          })}

          {/* Земята с ден и нощ и местно време */}
          <circle cx={CX} cy={CY} r={EARTH_R} fill="rgb(30, 41, 59)" />
          <path
            d={litPath(CX, CY, EARTH_R, -1, 0, 0)}
            fill="rgb(59, 130, 246)"
          />
          {timeMarks.map(m => (
            <text
              key={m.label}
              x={CX + (EARTH_R + 16) * Math.cos(m.angle * DEG)}
              y={CY - (EARTH_R + 16) * Math.sin(m.angle * DEG) + 4}
              fontSize="10"
              textAnchor="middle"
              className="fill-gray-600 dark:fill-gray-300 select-none"
            >
              {m.label}
            </text>
          ))}

          {/* Линия на зрението Земя–Луна */}
          <line
            x1={CX}
            y1={CY}
            x2={moon.x}
            y2={moon.y}
            stroke="rgb(148, 163, 184)"
            strokeDasharray="2,3"
          />

          {/* Луната – осветена е винаги половината към Слънцето */}
          <circle cx={moon.x} cy={moon.y} r={MOON_R} fill="rgb(51, 65, 85)" />
          <path
            d={litPath(moon.x, moon.y, MOON_R, -1, 0, 0)}
            fill="rgb(226, 232, 240)"
          />
          <circle
            cx={moon.x}
            cy={moon.y}
            r={MOON_R}
            fill="none"
            stroke="rgb(148, 163, 184)"
          />
        </svg>

        <div className="text-center">
          <div className="mx-auto w-44 h-44 rounded-full bg-slate-900 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="rgb(51, 65, 85)"
                opacity="0.6"
              />
              <path
                d={litPath(
                  80,
                  80,
                  70,
                  (southern ? -1 : 1) * Math.sin(psi),
                  0,
                  -Math.cos(psi)
                )}
                fill="rgb(241, 245, 249)"
              />
            </svg>
          </div>
          <p className="mt-2 text-lg font-bold">
            {phase.icon} {phase.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Възраст: {age.toFixed(1)} дни · осветена{' '}
            {(illuminated * 100).toFixed(0)}%
          </p>
          <label className="flex items-center justify-center gap-2 text-xs mt-2">
            <input
              type="checkbox"
              checked={southern}
              onChange={e => setSouthern(e.target.checked)}
            />
            Гледам от южното полукълбо
          </label>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Ден от синодичния месец: {age.toFixed(1)} от {SYNODIC_MONTH}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
            aria-label={playing ? 'Пауза' : 'Пусни'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max={SYNODIC_MONTH}
            step="0.05"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {PRESETS.map(p => {
            const ph = phaseOf(p + 0.001);
            return (
              <button
                key={p}
                onClick={() => setAge(p * SYNODIC_MONTH)}
                title={ph.name}
                className="px-2 py-1 rounded text-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                {ph.icon}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Елонгация', value: `${elongation.toFixed(0)}° на изток` },
          { label: 'Изгрява ≈', value: formatHours(rise) },
          { label: 'Най-високо (на юг) ≈', value: formatHours(transit) },
          { label: 'Залязва ≈', value: formatHours(set) },
        ].map(s => (
          <div
            key={s.label}
            className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {s.label}
            </div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Времената са приблизителни (местно слънчево време, без отчитане на
        деклинацията на Луната). Наблюдател на Земята вижда Луната, когато тя е
        над хоризонта – сравнете с часовете около Земята на схемата.
      </p>
    </div>
  );
}
