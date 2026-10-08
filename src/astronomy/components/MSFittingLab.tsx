import { useState } from 'react';
import { rnd } from './hrData';
import { temperatureToRGB } from './light';
import { temperatureFromBV } from './starData';
import { fmt } from './terrestrialData';

const W = 640;
const H = 330;
const X0 = 60;
const X1 = 450;
const Y0 = 20;
const Y1 = 300;
const BV_MIN = -0.3;
const BV_MAX = 1.6;
const MAG_TOP = -3;
const MAG_BOTTOM = 22;
const cx = (bv: number) => X0 + ((bv - BV_MIN) / (BV_MAX - BV_MIN)) * (X1 - X0);
const cy = (m: number) => Y0 + ((m - MAG_TOP) / (MAG_BOTTOM - MAG_TOP)) * (Y1 - Y0);

// Главна последователност на нулевата възраст: абсолютна величина M_V като функция на B − V
const ZAMS: [number, number][] = [
  [-0.3, -2.7], [-0.2, -1.2], [-0.1, 0.0], [0.0, 0.8], [0.1, 1.5], [0.2, 2.0], [0.3, 2.5], [0.4, 3.0], [0.5, 3.8],
  [0.6, 4.5], [0.7, 5.2], [0.8, 5.8], [0.9, 6.3], [1.0, 6.7], [1.2, 7.6], [1.4, 9.0], [1.6, 11.0],
];

function zams(bv: number) {
  for (let i = 1; i < ZAMS.length; i++) {
    if (bv <= ZAMS[i][0]) {
      const [b0, m0] = ZAMS[i - 1];
      const [b1, m1] = ZAMS[i];
      return m0 + ((m1 - m0) * (bv - b0)) / (b1 - b0);
    }
  }
  return ZAMS[ZAMS.length - 1][1];
}

type Cluster = { name: string; mu: number; bvMin: number; giants: number; text: string };

const CLUSTERS: Cluster[] = [
  { name: 'Плеяди', mu: 5.65, bvMin: -0.15, giants: 0, text: 'Gaia дава ~136 pc. Преди Gaia имаше спор: сателитът Hipparcos беше дал 120 pc, а подреждането по главната последователност – ~133 pc. Gaia потвърди втория метод.' },
  { name: 'Хиади', mu: 3.39, bvMin: 0.1, giants: 4, text: 'Най-близкият куп – ~47 pc. Неговото разстояние е първото стъпало от „стълбата на разстоянията“: по него се калибрира главната последователност за по-далечните купове.' },
  { name: 'Ясли (M44)', mu: 6.35, bvMin: 0.15, giants: 5, text: 'Куп в Рак на ~186 pc, видим с просто око като мъгливо петно. Почти на възрастта на Хиадите – и вероятно с общ произход.' },
  { name: 'Непознат куп', mu: 9.4, bvMin: 0.05, giants: 3, text: 'Модулът на разстоянието е ~9,4 – около 760 pc. Толкова далеч паралаксът вече е малък и неточен, а главната последователност все още работи.' },
];

function clusterStars(c: Cluster, ci: number) {
  const stars = Array.from({ length: 90 }, (_, i) => {
    const seed = ci * 1000 + i * 3;
    const bv = c.bvMin + rnd(seed) ** 1.3 * (1.5 - c.bvMin);
    const binary = rnd(seed + 1) < 0.2 ? -0.5 * rnd(seed + 2) : 0;
    const m = zams(bv) + c.mu + (rnd(seed + 3) - 0.5) * 0.25 + binary;
    return { bv, m };
  });
  const giants = Array.from({ length: c.giants }, (_, i) => {
    const seed = ci * 1000 + 700 + i * 3;
    return { bv: 0.95 + rnd(seed) * 0.15, m: 0.3 + c.mu + (rnd(seed + 1) - 0.5) * 0.4 };
  });
  return { stars, giants };
}

const DATA = CLUSTERS.map((c, i) => clusterStars(c, i));

export default function MSFittingLab() {
  const [ci, setCi] = useState(0);
  const [mu, setMu] = useState(2);
  const cl = CLUSTERS[ci];
  const { stars, giants } = DATA[ci];

  // Колко добре пасва: средно отклонение по-долната (единични) звезди
  const residuals = stars.map(s => s.m - (zams(s.bv) + mu));
  const median = [...residuals].sort((a, b) => a - b)[Math.floor(residuals.length * 0.6)];
  const good = Math.abs(median) < 0.2;
  const d = 10 ** (mu / 5 + 1);

  const line = Array.from({ length: 77 }, (_, i) => {
    const bv = BV_MIN + (i / 76) * (BV_MAX - BV_MIN);
    return `${cx(bv)},${cy(zams(bv) + mu)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-teal-300 dark:border-teal-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Разстояние чрез главната последователност</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Точките са измерени звезди от купа: видима величина m и цвят B − V. Жълтата линия е еталонната главна последователност в
        абсолютни величини M. Плъзнете я надолу, докато легне върху звездите – отместването е модулът на разстоянието m − M.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.25" />
        {[0, 5, 10, 15, 20].map(m => (
          <g key={m}>
            <line x1={X0} x2={X1} y1={cy(m)} y2={cy(m)} stroke="white" strokeOpacity="0.06" />
            <text x={X0 - 5} y={cy(m) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
              {m}
            </text>
          </g>
        ))}
        {[-0.2, 0.2, 0.6, 1.0, 1.4].map(bv => (
          <text key={bv} x={cx(bv)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(bv, 1)}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 27} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
          показател на цвета B − V
        </text>
        <text x={16} y={(Y0 + Y1) / 2} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55" transform={`rotate(-90 16 ${(Y0 + Y1) / 2})`}>
          видима величина m (по-ярки ↑)
        </text>

        <defs>
          <clipPath id="msf-clip">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <g clipPath="url(#msf-clip)">
          <polyline points={line} fill="none" stroke={good ? '#4ade80' : '#fde68a'} strokeWidth="3" strokeOpacity="0.8" />
          {[...stars, ...giants].map((s, i) => (
            <circle key={i} cx={cx(s.bv)} cy={cy(s.m)} r="2.2" fill={temperatureToRGB(temperatureFromBV(s.bv))} />
          ))}
        </g>

        <g fontSize="11" fill="white" transform="translate(470, 40)">
          <text x={0} y={0} fontSize="14" fontWeight="700">
            {cl.name}
          </text>
          <text x={0} y={26} fillOpacity="0.85">
            m − M = {fmt(mu, 2)}
          </text>
          <text x={0} y={44} fillOpacity="0.85">
            d = 10^((m − M)/5 + 1)
          </text>
          <text x={0} y={64} fill={good ? '#4ade80' : '#fde68a'} fontWeight="700" fontSize="14">
            d ≈ {d < 1000 ? `${fmt(d, 0)} pc` : `${fmt(d / 1000, 2)} kpc`}
          </text>
          <text x={0} y={90} fill={good ? '#4ade80' : '#94a3b8'}>
            {good ? '✓ линията пасва!' : median > 0 ? 'плъзнете линията надолу' : 'плъзнете линията нагоре'}
          </text>
          <text x={0} y={120} fontSize="10" fillOpacity="0.55">
            Звездите над линията са
          </text>
          <text x={0} y={134} fontSize="10" fillOpacity="0.55">
            двойни: две звезди в една точка
          </text>
          <text x={0} y={148} fontSize="10" fillOpacity="0.55">
            са до 0,75 величини по-ярки.
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Модул на разстоянието m − M = {fmt(mu, 2)}</label>
      <input type="range" min="0" max="12" step="0.01" value={mu} onChange={e => setMu(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {CLUSTERS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => {
              setCi(i);
              setMu(2);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              i === ci
                ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {good ? cl.text : 'Всички звезди в купа са на почти едно и също разстояние от нас, затова всички са отместени с едно и също число величини спрямо абсолютните си стойности.'}
      </p>
    </div>
  );
}
