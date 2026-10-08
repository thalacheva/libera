import { useState } from 'react';
import { temperatureToRGB } from './light';
import { STARS, T_SUN, classOf } from './starData';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
const CX = 200;
const CY = 150;
const MAX_PX = 125;
const AU = 215; // R☉
const R_EARTH = 0.00917; // R☉
const R_JUPITER = 0.1005; // R☉

const ORBITS = [
  { name: 'Меркурий', r: 0.387 * AU },
  { name: 'Венера', r: 0.723 * AU },
  { name: 'Земя', r: AU },
  { name: 'Марс', r: 1.524 * AU },
  { name: 'Юпитер', r: 5.2 * AU },
];

const formatR = (r: number) => (r < 0.1 ? fmt(r, 4) : r < 10 ? fmt(r, 2) : fmt(r, 0));

export default function StarSizeLab() {
  const [logL, setLogL] = useState(Math.log10(90000));
  const [T, setT] = useState(3600);
  const [starId, setStarId] = useState<string | null>('betelgeuse');
  const L = 10 ** logL;
  const R = Math.sqrt(L) * (T_SUN / T) ** 2;
  const named = STARS.find(s => s.id === starId);

  const scale = MAX_PX / Math.max(R, 1);
  const color = temperatureToRGB(T);
  const small = R < 0.5;
  // Вдясно: сравнение със Земята и Юпитер за малките звезди
  const zScale = 80 / Math.max(R, R_JUPITER);

  const choose = (id: string) => {
    const s = STARS.find(x => x.id === id)!;
    setStarId(id);
    setLogL(Math.log10(s.L));
    setT(s.T);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко е голяма звездата?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Светимостта и температурата определят радиуса: L = 4πR²σT⁴. При една и съща температура по-ярката звезда трябва да е
        по-голяма. Изберете звезда или задайте L и T сами.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <clipPath id="ss-left">
            <rect x={0} y={0} width={400} height={H} />
          </clipPath>
          <radialGradient id="ss-limb" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        <g clipPath="url(#ss-left)">
          <circle cx={CX} cy={CY} r={Math.max(1, R * scale)} fill={color} />
          <circle cx={CX} cy={CY} r={Math.max(1, R * scale)} fill="url(#ss-limb)" />
          {/* Орбитите на планетите, ако звездата е огромна */}
          {R > 20 &&
            ORBITS.map(o => (
              <g key={o.name}>
                <circle cx={CX} cy={CY} r={o.r * scale} fill="none" stroke={o.r < R ? '#1e293b' : 'white'} strokeOpacity={o.r < R ? 0.7 : 0.3} strokeDasharray="3 3" />
                {o.r * scale < 140 && o.r * scale > 8 && !['Меркурий', 'Венера'].includes(o.name) && (
                  <text x={CX} y={CY - o.r * scale - 3} fontSize="9" textAnchor="middle" fill={o.r < R ? '#1e293b' : 'white'} fillOpacity="0.75">
                    {o.name}
                  </text>
                )}
              </g>
            ))}
          {/* Слънцето за сравнение: контур около малките звезди, отделно кръгче до големите */}
          {R <= 1.5 ? (
            <g>
              <circle cx={CX} cy={CY} r={scale} fill="none" stroke={temperatureToRGB(T_SUN)} strokeDasharray="5 4" strokeWidth="1.5" />
              <text x={CX} y={CY - scale - 6} fontSize="10" textAnchor="middle" fill={temperatureToRGB(T_SUN)}>
                Слънце
              </text>
            </g>
          ) : R * scale < 140 ? (
            <g>
              <circle cx={CX + R * scale + 30} cy={CY} r={Math.max(1.5, scale)} fill={temperatureToRGB(T_SUN)} />
              <text x={CX + R * scale + 30} y={CY + Math.max(1.5, scale) + 13} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
                Слънце
              </text>
            </g>
          ) : null}
        </g>

        <line x1={400} x2={400} y1={10} y2={H - 10} stroke="white" strokeOpacity="0.1" />

        {small ? (
          <g>
            <text x={520} y={24} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
              увеличено: спрямо Земята и Юпитер
            </text>
            <circle cx={470} cy={130} r={Math.max(1, R * zScale)} fill={color} />
            <circle cx={575} cy={130} r={R_JUPITER * zScale} fill="#d6a46c" fillOpacity="0.85" />
            <circle cx={575} cy={225} r={Math.max(1, R_EARTH * zScale)} fill="#3b82f6" />
            <text x={575} y={130 + R_JUPITER * zScale + 12} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.7">
              Юпитер
            </text>
            <text x={575} y={225 + R_EARTH * zScale + 12} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.7">
              Земя
            </text>
          </g>
        ) : (
          <g fontSize="11" fill="white">
            <text x={420} y={60} fillOpacity="0.85">
              В обема ѝ се побират
            </text>
            <text x={420} y={80} fill="#fde68a" fontWeight="700" fontSize="14">
              {R ** 3 < 1e4 ? fmt(R ** 3, 0) : sci(R ** 3, 1)} Слънца
            </text>
            <text x={420} y={110} fillOpacity="0.85">
              Средна плътност:
            </text>
            <text x={420} y={128} fillOpacity="0.85">
              {named ? `${sci((1.41 * named.M) / R ** 3, 1)} g/cm³` : '–'}
            </text>
          </g>
        )}

        <g fontSize="11" fill="white" transform="translate(420, 190)">
          <text x={0} y={0} fontWeight="700" fontSize="13">
            {named ? named.name : 'Собствена звезда'}
          </text>
          <text x={0} y={20} fillOpacity="0.85">
            R = √L · (T☉ / T)² = {formatR(R)} R☉
          </text>
          <text x={0} y={38} fillOpacity="0.85">
            = {R * 696000 < 1e6 ? fmt(R * 696000, 0) : sci(R * 696000, 1)} km{R > 50 ? ` = ${fmt(R / AU, 2)} AU` : ''}
          </text>
          <text x={0} y={58} fillOpacity="0.6" fontSize="10">
            L = {L >= 1000 ? sci(L, 1) : fmt(L, L < 1 ? 4 : 1)} L☉, T = {fmt(T, 0)} K (клас {classOf(T).letter})
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Светимост: {L >= 1000 ? sci(L, 1) : fmt(L, L < 1 ? 4 : 2)} L☉</label>
          <input
            type="range"
            min="-4"
            max="6"
            step="0.01"
            value={logL}
            onChange={e => {
              setLogL(Number(e.target.value));
              setStarId(null);
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Температура: {fmt(T, 0)} K</label>
          <input
            type="range"
            min="2500"
            max="40000"
            step="50"
            value={T}
            onChange={e => {
              setT(Number(e.target.value));
              setStarId(null);
            }}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {STARS.map(s => (
          <button
            key={s.id}
            onClick={() => choose(s.id)}
            className={`px-2 py-1 rounded text-xs border ${
              s.id === starId
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: temperatureToRGB(s.T) }} />
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {named
          ? named.note
          : 'Опитайте: задръжте температурата и увеличете светимостта 100 пъти – радиусът расте 10 пъти. Задръжте светимостта и удвоете температурата – радиусът намалява 4 пъти.'}
      </p>
    </div>
  );
}
