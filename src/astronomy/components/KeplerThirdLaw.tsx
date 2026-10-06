import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

const AU_KM = 1.496e8;
const YEAR_DAYS = 365.25;

const PLANETS = [
  { name: 'Меркурий', a: 0.387, T: 0.2408, color: 'rgb(148, 163, 184)' },
  { name: 'Венера', a: 0.723, T: 0.6152, color: 'rgb(251, 146, 60)' },
  { name: 'Земя', a: 1.0, T: 1.0, color: 'rgb(59, 130, 246)' },
  { name: 'Марс', a: 1.524, T: 1.881, color: 'rgb(239, 68, 68)' },
  { name: 'Юпитер', a: 5.203, T: 11.86, color: 'rgb(217, 119, 6)' },
  { name: 'Сатурн', a: 9.537, T: 29.46, color: 'rgb(202, 138, 4)' },
  { name: 'Уран', a: 19.19, T: 84.01, color: 'rgb(34, 211, 238)' },
  { name: 'Нептун', a: 30.07, T: 164.8, color: 'rgb(37, 99, 235)' },
];

// Галилеевите спътници на Юпитер (km, дни) → AU, години
const MOONS = [
  { name: 'Йо', a: 421_700, T: 1.769 },
  { name: 'Европа', a: 671_034, T: 3.551 },
  { name: 'Ганимед', a: 1_070_412, T: 7.155 },
  { name: 'Калисто', a: 1_882_709, T: 16.689 },
].map(m => ({ ...m, a: m.a / AU_KM, T: m.T / YEAR_DAYS }));

const JUPITER_MASS = 1 / 1047.6; // в слънчеви маси

// Графика log T срещу log a
const GW = 360;
const GH = 300;
const LOG_A = [-3, 2];
const LOG_T = [-3, 3];
const gx = (a: number) =>
  40 + ((Math.log10(a) - LOG_A[0]) / (LOG_A[1] - LOG_A[0])) * (GW - 55);
const gy = (T: number) =>
  GH - 30 - ((Math.log10(T) - LOG_T[0]) / (LOG_T[1] - LOG_T[0])) * (GH - 45);

// Орерий
const OR = 150;
const OCX = 160;
const OCY = 160;

export default function KeplerThirdLaw() {
  const [logA, setLogA] = useState(Math.log10(2.5));
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);

  useAnimationFrame(playing, dt => setTime(t => t + dt * 0.25));

  const a = 10 ** logA;
  const T = a ** 1.5;

  const line = (k: number) =>
    `M ${gx(10 ** LOG_A[0])},${gy(10 ** (1.5 * LOG_A[0]) * k)} L ${gx(10 ** LOG_A[1])},${gy(10 ** (1.5 * LOG_A[1]) * k)}`;

  const inner = PLANETS.slice(0, 4);
  const maxR = Math.max(1.6, a * 1.05);
  const scale = OR / maxR;
  const angleOf = (period: number, offset: number) =>
    offset + (2 * Math.PI * time) / period;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Трети закон: създайте своя планета
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете голямата полуос – законът определя периода. Вижте как
        по-далечните планети „изостават“.
      </p>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-auto max-w-[320px] mx-auto rounded-lg bg-slate-900"
        >
          <circle cx={OCX} cy={OCY} r="8" fill="rgb(251, 191, 36)" />
          {inner.map((p, i) => {
            const ang = angleOf(p.T, i * 1.3);
            return (
              <g key={p.name}>
                <circle
                  cx={OCX}
                  cy={OCY}
                  r={p.a * scale}
                  fill="none"
                  stroke={p.color}
                  strokeOpacity="0.35"
                />
                <circle
                  cx={OCX + p.a * scale * Math.cos(ang)}
                  cy={OCY - p.a * scale * Math.sin(ang)}
                  r="4"
                  fill={p.color}
                />
              </g>
            );
          })}
          <circle
            cx={OCX}
            cy={OCY}
            r={a * scale}
            fill="none"
            stroke="rgb(52, 211, 153)"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          <circle
            cx={OCX + a * scale * Math.cos(angleOf(T, 0))}
            cy={OCY - a * scale * Math.sin(angleOf(T, 0))}
            r="6"
            fill="rgb(52, 211, 153)"
            stroke="white"
          />
          <text x="8" y="16" fontSize="11" fill="white" opacity="0.8">
            Изминали години: {time.toFixed(1).replace('.', ',')}
          </text>
          <text x="8" y="310" fontSize="10" fill="white" opacity="0.6">
            Меркурий, Венера, Земя, Марс и вашата планета (зелена)
          </text>
        </svg>

        <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full h-auto">
          <line
            x1="40"
            y1={GH - 30}
            x2={GW - 10}
            y2={GH - 30}
            stroke="rgb(148, 163, 184)"
          />
          <line
            x1="40"
            y1="10"
            x2="40"
            y2={GH - 30}
            stroke="rgb(148, 163, 184)"
          />
          {[-3, -2, -1, 0, 1, 2].map(k => (
            <text
              key={k}
              x={gx(10 ** k)}
              y={GH - 16}
              fontSize="9"
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400"
            >
              10{k === 0 ? '⁰' : k < 0 ? `⁻${'¹²³'[-k - 1]}` : '¹²'[k - 1]}
            </text>
          ))}
          {[-3, -2, -1, 0, 1, 2, 3].map(k => (
            <text
              key={k}
              x="34"
              y={gy(10 ** k) + 3}
              fontSize="9"
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400"
            >
              10{k === 0 ? '⁰' : k < 0 ? `⁻${'¹²³'[-k - 1]}` : '¹²³'[k - 1]}
            </text>
          ))}
          <text
            x={GW - 10}
            y={GH - 34}
            fontSize="10"
            textAnchor="end"
            className="fill-gray-500 dark:fill-gray-400"
          >
            a, AU
          </text>
          <text
            x="44"
            y="18"
            fontSize="10"
            className="fill-gray-500 dark:fill-gray-400"
          >
            T, години
          </text>

          <defs>
            <clipPath id="kepler-plot">
              <rect x="40" y="10" width={GW - 50} height={GH - 40} />
            </clipPath>
          </defs>
          <path
            clipPath="url(#kepler-plot)"
            d={line(1)}
            stroke="rgb(251, 191, 36)"
            strokeWidth="1.5"
            strokeDasharray="5,4"
          />
          <path
            clipPath="url(#kepler-plot)"
            d={line(1 / Math.sqrt(JUPITER_MASS))}
            stroke="rgb(217, 119, 6)"
            strokeWidth="1.5"
            strokeDasharray="2,4"
          />
          <text
            x={gx(0.03) + 6}
            y={gy(0.03 ** 1.5) + 4}
            fontSize="10"
            fill="rgb(217, 119, 6)"
          >
            ☀️ Слънцето
          </text>
          <text
            x={gx(0.03) + 8}
            y={gy(0.03 ** 1.5 / Math.sqrt(JUPITER_MASS)) + 6}
            fontSize="10"
            fill="rgb(217, 119, 6)"
          >
            🪐 Юпитер
          </text>

          {PLANETS.map(p => (
            <circle key={p.name} cx={gx(p.a)} cy={gy(p.T)} r="4" fill={p.color}>
              <title>{p.name}</title>
            </circle>
          ))}
          {MOONS.map(m => (
            <rect
              key={m.name}
              x={gx(m.a) - 3}
              y={gy(m.T) - 3}
              width="6"
              height="6"
              fill="rgb(217, 119, 6)"
            >
              <title>{m.name}</title>
            </rect>
          ))}
          <circle
            cx={gx(a)}
            cy={gy(T)}
            r="6"
            fill="rgb(52, 211, 153)"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Голяма полуос на вашата планета: a ={' '}
          {a < 10
            ? a.toFixed(2).replace('.', ',')
            : a.toFixed(1).replace('.', ',')}{' '}
          AU
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1.5 rounded bg-purple-500 text-white hover:bg-purple-600"
            aria-label={playing ? 'Пауза' : 'Пусни'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <input
            type="range"
            min={Math.log10(0.2)}
            max={Math.log10(40)}
            step="0.001"
            value={logA}
            onChange={e => setLogA(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <p className="mt-2 text-center font-mono">
          T = a<sup>3/2</sup> ={' '}
          {T < 10
            ? T.toFixed(2).replace('.', ',')
            : T.toFixed(1).replace('.', ',')}{' '}
          години
        </p>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 text-left">Планета</th>
              <th className="p-2 text-right">a, AU</th>
              <th className="p-2 text-right">T, години</th>
              <th className="p-2 text-right">T² / a³</th>
            </tr>
          </thead>
          <tbody>
            {PLANETS.map(p => (
              <tr
                key={p.name}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ background: p.color }}
                  />
                  {p.name}
                </td>
                <td className="p-2 text-right font-mono">
                  {p.a.toLocaleString('bg-BG')}
                </td>
                <td className="p-2 text-right font-mono">
                  {p.T.toLocaleString('bg-BG')}
                </td>
                <td className="p-2 text-right font-mono font-bold">
                  {(p.T ** 2 / p.a ** 3).toFixed(3).replace('.', ',')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm mt-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
        В логаритмичен мащаб T = k·a<sup>3/2</sup> е права с наклон 3/2.
        Спътниците на Юпитер (квадратчета) лежат на успоредна права, но ~32 пъти
        по-високо: k = 1/√M, а масата на Юпитер е ~1/1048 от слънчевата.
        Наклонът е един и същ – законът е универсален.
      </p>
    </div>
  );
}
