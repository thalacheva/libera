import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

const EARTH_SPEED = 29.78; // km/s
const C = 200;

const TARGETS = [
  { name: 'Венера', a: 0.723, T: 0.6152, color: 'rgb(251, 146, 60)' },
  { name: 'Марс', a: 1.524, T: 1.881, color: 'rgb(239, 68, 68)' },
  { name: 'Юпитер', a: 5.203, T: 11.86, color: 'rgb(217, 119, 6)' },
];

function solveKepler(M: number, e: number) {
  let E = M;
  for (let i = 0; i < 30; i++)
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

export default function HohmannTransfer() {
  const [targetIndex, setTargetIndex] = useState(1);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const target = TARGETS[targetIndex];
  const r1 = 1;
  const r2 = target.a;
  const aT = (r1 + r2) / 2;
  const tTransfer = 0.5 * aT ** 1.5; // години
  // Знаков ексцентрицитет: при полет навътре стартираме от афелия
  const eT = (r2 - r1) / (r2 + r1);

  // Скорости (vis-viva), в km/s
  const v1 = EARTH_SPEED;
  const v2 = EARTH_SPEED / Math.sqrt(r2);
  const vDepart = EARTH_SPEED * Math.sqrt((2 * r2) / (r1 * (r1 + r2)));
  const vArrive = EARTH_SPEED * Math.sqrt((2 * r1) / (r2 * (r1 + r2)));
  const dv1 = Math.abs(vDepart - v1);
  const dv2 = Math.abs(v2 - vArrive);

  // Целта трябва да изпреварва Земята с ъгъл θ при старта
  const phase = 180 - (360 * tTransfer) / target.T;

  useAnimationFrame(playing, dt => {
    const next = progress + dt * 0.18;
    if (next >= 1) {
      setProgress(1);
      setPlaying(false);
    } else {
      setProgress(next);
    }
  });

  const t = progress * tTransfer;
  const scale = 170 / Math.max(r1, r2);
  const pos = (r: number, ang: number) => ({
    x: C + r * scale * Math.cos(ang),
    y: C - r * scale * Math.sin(ang),
  });
  const earth = pos(r1, (2 * Math.PI * t) / 1);
  const planet = pos(
    r2,
    (phase * Math.PI) / 180 + (2 * Math.PI * t) / target.T
  );

  // Корабът по половин елипса от Земята до целевата орбита
  const onTransfer = (m: number) => {
    const E = solveKepler(m, eT);
    const nu =
      2 *
      Math.atan2(
        Math.sqrt(1 + eT) * Math.sin(E / 2),
        Math.sqrt(1 - eT) * Math.cos(E / 2)
      );
    return pos(aT * (1 - eT * Math.cos(E)), nu);
  };
  const ship = onTransfer(Math.PI * progress);
  const transferPath = Array.from({ length: 61 }, (_, i) => {
    const p = onTransfer((i / 60) * Math.PI);
    return `${p.x},${p.y}`;
  }).join(' ');

  const days = (tTransfer * 365.25).toFixed(0);
  const synodic = 1 / Math.abs(1 - 1 / target.T);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Полет до друга планета</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Най-икономичният път е половин елипса, допираща двете орбити – преход на
        Хоман.
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {TARGETS.map((tg, i) => (
          <button
            key={tg.name}
            onClick={() => {
              setTargetIndex(i);
              setProgress(0);
              setPlaying(false);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              targetIndex === i
                ? 'bg-red-500 text-white border-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-700'
            }`}
          >
            🚀 Към {tg.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-4 items-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto max-w-[400px] mx-auto rounded-lg bg-slate-900"
        >
          <circle cx={C} cy={C} r="10" fill="rgb(251, 191, 36)" />
          <circle
            cx={C}
            cy={C}
            r={r1 * scale}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeOpacity="0.5"
          />
          <circle
            cx={C}
            cy={C}
            r={r2 * scale}
            fill="none"
            stroke={target.color}
            strokeOpacity="0.5"
          />
          <polyline
            points={transferPath}
            fill="none"
            stroke="white"
            strokeOpacity="0.5"
            strokeDasharray="4,4"
          />
          <circle cx={earth.x} cy={earth.y} r="6" fill="rgb(59, 130, 246)" />
          <circle cx={planet.x} cy={planet.y} r="6" fill={target.color} />
          <circle cx={ship.x} cy={ship.y} r="4" fill="white" />
          <text x="8" y="18" fontSize="11" fill="white" opacity="0.8">
            Ден {Math.round(t * 365.25)} от {days}
          </text>
          {progress >= 1 && (
            <text x={C} y="390" fontSize="12" fill="white" textAnchor="middle">
              🎯 Пристигане! Корабът и {target.name} се срещат.
            </text>
          )}
        </svg>

        <div className="space-y-2 text-sm">
          {[
            {
              label: 'Голяма полуос на прехода',
              value: `${aT.toFixed(3).replace('.', ',')} AU`,
            },
            { label: 'Време за полета (½ период)', value: `${days} дни` },
            {
              label: 'Δv при тръгване (спрямо Земята)',
              value: `${dv1.toFixed(2).replace('.', ',')} km/s`,
            },
            {
              label: 'Δv при пристигане',
              value: `${dv2.toFixed(2).replace('.', ',')} km/s`,
            },
            {
              label: `${target.name} трябва да е ${phase >= 0 ? 'пред' : 'зад'} Земята с`,
              value: `${Math.abs(phase).toFixed(0)}°`,
            },
            {
              label: 'Ново „прозорче“ за старт на всеки',
              value: `${(synodic * 12).toFixed(0)} месеца`,
            },
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
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => {
            if (progress >= 1) setProgress(0);
            setPlaying(p => !p);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Пауза' : 'Старт!'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          className="w-full"
        />
        <button
          onClick={() => {
            setPlaying(false);
            setProgress(0);
          }}
          className="p-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Отначало"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Орбитите са приети за кръгови и в една равнина. Δv е спрямо скоростта на
        Земята по орбитата ѝ, без да се отчита излитането от самата Земя.
      </p>
    </div>
  );
}
