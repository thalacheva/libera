import { useState } from 'react';
import { fmt } from './terrestrialData';
import { SHOWERS } from './showerData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const HORIZON = 278;
const POP_INDEX = 2.2; // колко пъти повече са метеорите с една звездна величина по-слаби
const TIME_WARP = 30; // 1 s на екрана = 30 s реално време
const SLOT = 0.05; // s
const LIFE = 0.5; // s – колко време свети един метеор на екрана
const SPORADIC_ZHR = 8;

/** Детерминирано псевдослучайно число в [0, 1) за цяло число n. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 400 }, (_, i) => ({
  x: hash(i * 3 + 1) * W,
  y: hash(i * 3 + 2) * HORIZON,
  // По-слабите звезди са много повече: величини от ~0 до 6,5
  mag: 6.5 - 6.5 * hash(i * 3 + 3) ** 2.2,
}));

export default function RadiantSky() {
  const [t, setT] = useState(16); // започваме „по средата на нощта“, за да има следи веднага
  const [playing, setPlaying] = useState(false);
  const [showerId, setShowerId] = useState('per');
  const [altitude, setAltitude] = useState(50);
  const [lm, setLm] = useState(6.0);
  const [trace, setTrace] = useState(false);
  const shower = SHOWERS.find(s => s.id === showerId)!;

  useAnimationFrame(playing, dt => setT(v => v + dt));

  const sinH = Math.sin((altitude * Math.PI) / 180);
  const correction = POP_INDEX ** (6.5 - lm);
  const hr = (shower.zhr * sinH) / correction;
  const hrSporadic = SPORADIC_ZHR / correction;

  const rx = W / 2;
  const ry = HORIZON - (altitude / 90) * (HORIZON - 30);

  // Кои „слотове“ имат метеор: вероятността е пропорционална на темпа
  const pShower = (hr / 3600) * TIME_WARP * SLOT;
  const pSporadic = (hrSporadic / 3600) * TIME_WARP * SLOT;
  const keep = trace ? 15 : LIFE;
  const first = Math.max(0, Math.floor((t - keep) / SLOT));
  const last = Math.floor(t / SLOT);

  const meteors: { x1: number; y1: number; x2: number; y2: number; age: number; shower: boolean }[] = [];
  for (let k = first; k <= last; k++) {
    const age = t - k * SLOT;
    if (age < 0) continue;
    const progress = Math.min(1, age / (LIFE * 0.6));
    if (hash(k * 7 + 1) < pShower) {
      // Метеор от потока: тръгва от точка, далеч от радианта, и се движи право навън
      const theta = hash(k * 7 + 2) * 2 * Math.PI;
      const d = 25 + hash(k * 7 + 3) * 300;
      const len = 12 + d * 0.28; // близо до радианта следите са къси – идват почти към нас
      const x1 = rx + d * Math.cos(theta);
      const y1 = ry + d * Math.sin(theta);
      meteors.push({ x1, y1, x2: x1 + len * progress * Math.cos(theta), y2: y1 + len * progress * Math.sin(theta), age, shower: true });
    }
    if (hash(k * 7 + 4) < pSporadic) {
      const theta = hash(k * 7 + 5) * 2 * Math.PI;
      const x1 = hash(k * 7 + 6) * W;
      const y1 = hash(k * 7 + 7) * HORIZON * 0.9;
      const len = 30 + hash(k * 11) * 60;
      meteors.push({ x1, y1, x2: x1 + len * progress * Math.cos(theta), y2: y1 + len * progress * Math.sin(theta), age, shower: false });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Радиантът и колко метеора ще видим</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Пуснете нощта (1 s = 30 s). Метеорите от потока летят успоредно, но перспективата ги кара да „излизат“ от една точка –
        радианта. Включете продълженията назад, за да я откриете. Сивите метеори са спорадични – не са от потока.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <linearGradient id="rs-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#020617" />
            <stop offset="1" stopColor={lm < 4.5 ? '#3b2f4a' : '#0f172a'} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={HORIZON} fill="url(#rs-sky)" />
        {STARS.filter(s => s.mag < lm).map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={Math.max(0.4, 1.8 - s.mag * 0.25)} fill="white" fillOpacity={Math.min(1, 0.35 + (lm - s.mag) * 0.2)} />
        ))}

        {/* Метеорите */}
        {meteors.map((m, i) => {
          const fade = m.age < LIFE ? 1 - m.age / LIFE : 0;
          return (
            <g key={i}>
              {trace && m.shower && (
                <line x1={m.x1} y1={m.y1} x2={rx} y2={ry} stroke="#c084fc" strokeOpacity="0.3" strokeDasharray="3 4" />
              )}
              {trace && <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.shower ? shower.color : '#94a3b8'} strokeOpacity="0.4" strokeWidth="1" />}
              {fade > 0 && (
                <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.shower ? '#fef9c3' : '#e2e8f0'} strokeOpacity={fade} strokeWidth="2" strokeLinecap="round" />
              )}
            </g>
          );
        })}

        {trace && (
          <g>
            <circle cx={rx} cy={ry} r="10" fill="none" stroke="#c084fc" strokeWidth="1.5" />
            <text x={rx + 14} y={ry - 8} fontSize="11" fill="#e9d5ff">
              радиант ({shower.radiant})
            </text>
          </g>
        )}

        {/* Хоризонт */}
        <rect x={0} y={HORIZON} width={W} height={H - HORIZON} fill="#020617" />
        <path d={`M 0 ${HORIZON} L 60 ${HORIZON - 8} L 120 ${HORIZON - 3} L 200 ${HORIZON - 14} L 260 ${HORIZON - 6} L 360 ${HORIZON - 10} L 450 ${HORIZON - 2} L 540 ${HORIZON - 12} L 640 ${HORIZON - 4} L 640 ${H} L 0 ${H} Z`} fill="#020617" />

        <text x={12} y={20} fontSize="11" fill="white" fillOpacity="0.85">
          HR = ZHR · sin h / r^(6,5 − LM) = {shower.zhr} · {fmt(sinH, 2)} / {fmt(correction, 2)} ≈{' '}
          <tspan fill="#fde68a" fontWeight="700">
            {fmt(hr, 0)} в час
          </tspan>
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-purple-600 text-white text-sm hover:bg-purple-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={trace} onChange={e => setTrace(e.target.checked)} />
          продължи следите назад
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {SHOWERS.map(s => (
          <button
            key={s.id}
            onClick={() => setShowerId(s.id)}
            className={`px-2 py-1 rounded text-xs border ${
              s.id === showerId
                ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name} ({s.zhr})
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold mt-3 mb-1">Височина на радианта над хоризонта: h = {altitude}°</label>
      <input type="range" min="2" max="90" value={altitude} onChange={e => setAltitude(Number(e.target.value))} className="w-full" />
      <label className="block text-sm font-semibold mt-3 mb-1">
        Най-слабите видими звезди: LM = {fmt(lm, 1)}{' '}
        <span className="font-normal text-gray-500 dark:text-gray-400">
          ({lm < 4 ? 'град' : lm < 5.5 ? 'предградие' : lm < 6.3 ? 'село' : 'планина, без Луна'})
        </span>
      </label>
      <input type="range" min="3" max="6.5" step="0.1" value={lm} onChange={e => setLm(Number(e.target.value))} className="w-full" />

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        Близо до радианта следите са къси – тези метеори летят почти право към нас. Когато радиантът е ниско, част от потока минава
        под хоризонта и виждаме само ~sin h от метеорите. Светлото небе на града скрива слабите метеори: при LM = 4 от Персеидите
        остават едва около {fmt((100 * sinH) / POP_INDEX ** 2.5, 0)} в час.
      </p>
    </div>
  );
}
