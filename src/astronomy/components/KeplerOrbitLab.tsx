import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

const CX = 300;
const CY = 200;
const A = 185;
const SECTORS = 12;

const PRESETS = [
  { label: 'Кръг', e: 0 },
  { label: '🌍 Земя', e: 0.017 },
  { label: '🔴 Марс', e: 0.093 },
  { label: '☿️ Меркурий', e: 0.206 },
  { label: '🧊 Плутон', e: 0.249 },
  { label: '☄️ Халей', e: 0.967 },
];

/** Решава уравнението на Кеплер E − e·sin E = M по метода на Нютон. */
function eccentricAnomaly(M: number, e: number) {
  let E = e > 0.8 ? Math.PI : M;
  for (let i = 0; i < 30; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

export default function KeplerOrbitLab() {
  const [e, setE] = useState(0.5);
  const [meanAnomaly, setMeanAnomaly] = useState(0.6);
  const [playing, setPlaying] = useState(true);
  const [showSectors, setShowSectors] = useState(true);
  const [showString, setShowString] = useState(false);

  useAnimationFrame(playing, dt =>
    setMeanAnomaly(m => (m + (dt * 2 * Math.PI) / 8) % (2 * Math.PI))
  );

  const b = A * Math.sqrt(1 - e * e);
  const c = A * e;
  const sun = { x: CX - c, y: CY };
  const emptyFocus = { x: CX + c, y: CY };
  const point = (E: number) => ({
    x: CX - A * Math.cos(E),
    y: CY - b * Math.sin(E),
  });

  const E = eccentricAnomaly(meanAnomaly, e);
  const planet = point(E);
  const r = 1 - e * Math.cos(E); // в единици a
  const speed = Math.sqrt(2 / r - 1); // спрямо кръговата скорост при r = a
  // Посока на скоростта – производна на положението по E
  const tx = A * Math.sin(E);
  const ty = -b * Math.cos(E);
  const tl = Math.hypot(tx, ty);
  const arrow = {
    x: planet.x + (tx / tl) * 45 * speed,
    y: planet.y + (ty / tl) * 45 * speed,
  };

  const sectorPath = (k: number) => {
    const m1 = (k / SECTORS) * 2 * Math.PI;
    const m2 = ((k + 1) / SECTORS) * 2 * Math.PI;
    const e1 = eccentricAnomaly(m1, e);
    const e2 = eccentricAnomaly(m2, e);
    const pts = Array.from({ length: 25 }, (_, i) =>
      point(e1 + ((e2 - e1) * i) / 24)
    );
    return (
      `M ${sun.x},${sun.y} ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ' Z'
    );
  };
  const currentSector = Math.floor((meanAnomaly / (2 * Math.PI)) * SECTORS);

  const r1 = r;
  const r2 = 2 - r;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Лаборатория „Орбити“</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Планетата се движи с истинското Кеплерово време. Всеки цветен сектор се
        описва за 1/12 от периода.
      </p>

      <svg viewBox="0 0 600 400" className="w-full h-auto">
        <defs>
          <marker
            id="kepler-velocity"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(16, 185, 129)" />
          </marker>
        </defs>
        {showSectors &&
          Array.from({ length: SECTORS }, (_, k) => (
            <path
              key={k}
              d={sectorPath(k)}
              fill={k % 2 ? 'rgb(59, 130, 246)' : 'rgb(168, 85, 247)'}
              opacity={k === currentSector ? 0.45 : 0.12}
              stroke="white"
              strokeOpacity="0.4"
            />
          ))}
        <ellipse
          cx={CX}
          cy={CY}
          rx={A}
          ry={b}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2.5"
        />
        <line
          x1={CX - A}
          y1={CY}
          x2={CX + A}
          y2={CY}
          stroke="rgb(148, 163, 184)"
          strokeDasharray="3,4"
        />

        {showString && (
          <>
            <line
              x1={sun.x}
              y1={sun.y}
              x2={planet.x}
              y2={planet.y}
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            <line
              x1={emptyFocus.x}
              y1={emptyFocus.y}
              x2={planet.x}
              y2={planet.y}
              stroke="rgb(249, 115, 22)"
              strokeWidth="2"
            />
            <text
              x={(sun.x + planet.x) / 2 - 10}
              y={(sun.y + planet.y) / 2 - 6}
              fontSize="12"
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
            >
              r₁
            </text>
            <text
              x={(emptyFocus.x + planet.x) / 2 + 6}
              y={(emptyFocus.y + planet.y) / 2 - 6}
              fontSize="12"
              fill="rgb(249, 115, 22)"
              fontWeight="bold"
            >
              r₂
            </text>
          </>
        )}

        <circle
          cx={emptyFocus.x}
          cy={emptyFocus.y}
          r="3.5"
          className="fill-gray-400"
        />
        <text
          x={emptyFocus.x}
          y={emptyFocus.y + 16}
          fontSize="10"
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
        >
          F₂
        </text>
        <circle cx={sun.x} cy={sun.y} r="13" fill="rgb(251, 191, 36)" />
        <text
          x={sun.x}
          y={sun.y + 28}
          fontSize="10"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Слънце (F₁)
        </text>
        <text
          x={CX - A - 6}
          y={CY - 8}
          fontSize="10"
          textAnchor="end"
          fill="rgb(239, 68, 68)"
        >
          перихелий
        </text>
        <text x={CX + A + 6} y={CY - 8} fontSize="10" fill="rgb(34, 197, 94)">
          афелий
        </text>

        <line
          x1={planet.x}
          y1={planet.y}
          x2={arrow.x}
          y2={arrow.y}
          stroke="rgb(16, 185, 129)"
          strokeWidth="3"
          markerEnd="url(#kepler-velocity)"
        />
        <circle
          cx={planet.x}
          cy={planet.y}
          r="8"
          fill="rgb(59, 130, 246)"
          stroke="white"
          strokeWidth="2"
        />
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-3">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Ексцентрицитет e = {e.toFixed(3).replace('.', ',')}
          </label>
          <input
            type="range"
            min="0"
            max="0.97"
            step="0.001"
            value={e}
            onChange={ev => setE(Number(ev.target.value))}
            className="w-full"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setE(p.e)}
                className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Време от перихелия:{' '}
            {((meanAnomaly / (2 * Math.PI)) * 100).toFixed(0)}% от периода
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
              max={2 * Math.PI}
              step="0.001"
              value={meanAnomaly}
              onChange={ev => setMeanAnomaly(Number(ev.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={showSectors}
                onChange={ev => setShowSectors(ev.target.checked)}
              />
              Равни площи (II закон)
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={showString}
                onChange={ev => setShowString(ev.target.checked)}
              />
              Метод на градинаря (I закон)
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Разстояние r
          </div>
          <div className="font-mono font-bold">
            {r.toFixed(3).replace('.', ',')} a
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Скорост
          </div>
          <div className="font-mono font-bold">
            {speed.toFixed(2).replace('.', ',')} v₀
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            vₚ / vₐ = (1+e)/(1−e)
          </div>
          <div className="font-mono font-bold">
            {((1 + e) / (1 - e)).toFixed(2).replace('.', ',')}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {showString ? 'r₁ + r₂' : 'Малка полуос b'}
          </div>
          <div className="font-mono font-bold">
            {showString
              ? `${r1.toFixed(2).replace('.', ',')} + ${r2.toFixed(2).replace('.', ',')} = 2a`
              : `${Math.sqrt(1 - e * e)
                  .toFixed(3)
                  .replace('.', ',')} a`}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        v₀ е скоростта по кръгова орбита с радиус a. Зелената стрелка е
        скоростта на планетата.
      </p>
    </div>
  );
}
