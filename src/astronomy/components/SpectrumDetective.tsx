import { useState } from 'react';
import { element } from './light';
import { STRIP_MAX, STRIP_MIN, SpectrumStrip } from './SpectrumStrip';

const CANDIDATES = ['H', 'He', 'Na', 'Ca', 'Mg', 'Fe'];

const W = 640;
const X = 150;
const STRIP_W = W - X - 20;

/** Случайна „звезда“ с 2 или 3 елемента. */
function randomStar() {
  const pool = [...CANDIDATES].sort(() => Math.random() - 0.5);
  return pool.slice(0, 2 + Math.round(Math.random())).sort();
}

export default function SpectrumDetective() {
  const [star, setStar] = useState<string[]>(randomStar);
  const [guess, setGuess] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const lines = star.flatMap(id => element(id).lines);
  const correct = checked && guess.length === star.length && star.every(id => guess.includes(id));
  const sx = (nm: number) => X + ((nm - STRIP_MIN) / (STRIP_MAX - STRIP_MIN)) * STRIP_W;

  const rowH = 30;
  const top = 92;
  const height = top + CANDIDATES.length * rowH + 10;

  const toggle = (id: string) => {
    setChecked(false);
    setGuess(g => (g.includes(id) ? g.filter(x => x !== id) : [...g, id]));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">🔎 Спектрален детектив</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Горе е спектърът на непозната звезда. Отдолу – лабораторните спектри на шест елемента. Отбележете елементите, чиито линии
        съвпадат с тъмните линии на звездата. Пунктирът показва къде трябва да са линиите на избраните елементи.
      </p>

      <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <text x={X - 10} y={40} fontSize="12" fontWeight="600" textAnchor="end" fill="white">
          Звездата
        </text>
        <SpectrumStrip x={X} y={18} width={STRIP_W} height={40} kind="absorption" lines={lines} ticks />

        {/* Помощни линии за избраните елементи */}
        {guess.flatMap(id =>
          element(id).lines.map(l => (
            <line
              key={`${id}-${l.nm}`}
              x1={sx(l.nm)}
              x2={sx(l.nm)}
              y1={14}
              y2={height - 6}
              stroke="white"
              strokeOpacity="0.45"
              strokeDasharray="2 3"
            />
          ))
        )}

        {CANDIDATES.map((id, i) => {
          const e = element(id);
          const y = top + i * rowH;
          const on = guess.includes(id);
          return (
            <g key={id} onClick={() => toggle(id)} className="cursor-pointer">
              <rect x={6} y={y - 2} width={X - 14} height={rowH - 6} rx={4} fill={on ? '#047857' : '#1e293b'} />
              <text x={X - 14} y={y + 15} fontSize="11" textAnchor="end" fill="white">
                {e.name}
              </text>
              <SpectrumStrip x={X} y={y} width={STRIP_W} height={rowH - 10} kind="emission" lines={e.lines} />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-1 mt-3">
        {CANDIDATES.map(id => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`px-2 py-1 rounded text-xs border ${
              guess.includes(id)
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {guess.includes(id) ? '✓ ' : ''}
            {element(id).name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => setChecked(true)} className="px-3 py-1 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">
          Провери
        </button>
        <button
          onClick={() => {
            setStar(randomStar());
            setGuess([]);
            setChecked(false);
          }}
          className="px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Нова звезда
        </button>
      </div>
      {checked && (
        <p className={`mt-3 text-sm font-semibold ${correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {correct
            ? `Браво! Звездата съдържа ${star.map(id => element(id).name.toLowerCase()).join(', ')}. 🎉`
            : 'Още не е точно. Всяка тъмна линия трябва да има пунктир, а всеки пунктир – тъмна линия.'}
        </p>
      )}
    </div>
  );
}
