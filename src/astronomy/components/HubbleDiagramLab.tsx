import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 290;
const X0 = 60;
const X1 = 450;
const Y0 = 20;
const Y1 = 250;

// Таблицата на Хъбъл (1929): разстояние в Mpc, скорост в km/s
const HUBBLE_1929: [number, number][] = [
  [0.032, 170], [0.034, 290], [0.214, -130], [0.263, -70], [0.275, -185], [0.275, -220], [0.45, 200], [0.5, 290],
  [0.5, 270], [0.63, 200], [0.8, 300], [0.9, -30], [0.9, 650], [0.9, 150], [0.9, 500], [1.0, 920],
  [1.1, 450], [1.1, 500], [1.4, 500], [1.7, 960], [2.0, 500], [2.0, 850], [2.0, 800], [2.0, 1090],
];

function rnd(n: number) {
  const x = Math.sin(n * 21.991 + 9.137) * 43758.5453;
  return x - Math.floor(x);
}

// Съвременни свръхнови Ia (схематично; H₀ ≈ 70 km/s/Mpc)
const MODERN: [number, number][] = Array.from({ length: 36 }, (_, i) => {
  const d = 15 + rnd(i) * 480;
  return [d * (1 + (rnd(i + 50) - 0.5) * 0.12), 70 * d + (rnd(i + 90) - 0.5) * 600];
});

const SETS = {
  hubble: { name: 'Хъбъл, 1929', data: HUBBLE_1929, dMax: 2.2, vMax: 1200, vMin: -300 },
  modern: { name: 'Свръхнови Ia днес', data: MODERN, dMax: 520, vMax: 36000, vMin: 0 },
};

export default function HubbleDiagramLab() {
  const [setId, setSetId] = useState<'hubble' | 'modern'>('hubble');
  const [h0, setH0] = useState(200);
  const set = SETS[setId];
  const gx = (d: number) => X0 + (d / set.dMax) * (X1 - X0);
  const gy = (v: number) => Y1 - ((v - set.vMin) / (set.vMax - set.vMin)) * (Y1 - Y0);

  // Най-добра права през началото: H = Σ d v / Σ d²
  const best = set.data.reduce((s, [d, v]) => s + d * v, 0) / set.data.reduce((s, [d]) => s + d * d, 0);
  const rms = Math.sqrt(set.data.reduce((s, [d, v]) => s + (v - h0 * d) ** 2, 0) / set.data.length);
  const bestRms = Math.sqrt(set.data.reduce((s, [d, v]) => s + (v - best * d) ** 2, 0) / set.data.length);
  const good = rms < bestRms * 1.08;
  const age = 977.8 / h0; // млрд. години

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Диаграмата на Хъбъл</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всяка точка е галактика: разстояние и скорост на отдалечаване. Нагласете наклона на правата v = H₀ · d така, че да пасне най-добре.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <defs>
          <clipPath id="hd-clip">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <line x1={X0} x2={X1} y1={gy(0)} y2={gy(0)} stroke="white" strokeOpacity="0.2" />
        <g clipPath="url(#hd-clip)">
          <line x1={gx(0)} y1={gy(0)} x2={gx(set.dMax)} y2={gy(h0 * set.dMax)} stroke={good ? '#4ade80' : '#fbbf24'} strokeWidth="2.5" />
        </g>
        {set.data.map(([d, v], i) => (
          <circle key={i} cx={gx(d)} cy={gy(v)} r="3.5" fill="#f87171" />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <text key={f} x={gx(f * set.dMax)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(f * set.dMax, setId === 'hubble' ? 1 : 0)}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
          разстояние, Mpc
        </text>
        {[set.vMin, 0, set.vMax / 2, set.vMax].map(v => (
          <text key={v} x={X0 - 4} y={gy(v) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {fmt(v, 0)}
          </text>
        ))}
        <text x={14} y={(Y0 + Y1) / 2} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
          скорост, km/s
        </text>

        <g fontSize="11" fill="white" transform="translate(468, 40)">
          <text x={0} y={0} fontSize="13" fontWeight="700" fill="#fca5a5">
            {set.name}
          </text>
          <text x={0} y={26} fillOpacity="0.85">
            H₀ = {fmt(h0, 0)} km/s/Mpc
          </text>
          <text x={0} y={44} fill={good ? '#4ade80' : '#94a3b8'}>
            {good ? '✓ най-добро съвпадение' : `най-добре: ~${fmt(best, 0)}`}
          </text>
          <text x={0} y={72} fillOpacity="0.85">
            време на Хъбъл 1/H₀:
          </text>
          <text x={0} y={90} fontSize="15" fontWeight="700" fill="#fde68a">
            {fmt(age, age < 10 ? 2 : 1)} млрд. години
          </text>
          <text x={0} y={116} fontSize="10" fillOpacity="0.6">
            {age < 4.6 ? 'по-малко от възрастта на Земята!' : '≈ възрастта на Вселената'}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">H₀ = {fmt(h0, 0)} km/s/Mpc</label>
      <input type="range" min="20" max="700" step="1" value={h0} onChange={e => setH0(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {(['hubble', 'modern'] as const).map(id => (
          <button
            key={id}
            onClick={() => setSetId(id)}
            className={`px-3 py-1 rounded text-sm border ${
              id === setId ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {SETS[id].name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {setId === 'hubble'
          ? 'Хъбъл има само 24 галактики, всичките в нашата околност, и голямо разсейване – някои дори се приближават (Андромеда!), защото собствените движения са сравними с разширението. Наклонът, който получава, е ~420–500 km/s/Mpc – шест-седем пъти повече от днешния, заради грешна калибровка на цефеидите (Лекция 23). Така Вселената излиза на 2 млрд. години – по-млада от Земята. Тази криза трае до 50-те години.'
          : 'Днес свръхновите Ia проследяват закона на Хъбъл стотици пъти по-далеч, а разсейването е малко. H₀ е около 70 km/s/Mpc, а 1/H₀ ≈ 14 млрд. години – близо до възрастта на Вселената от реликтовото излъчване.'}
      </p>
    </div>
  );
}
