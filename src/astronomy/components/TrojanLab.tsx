import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 330;
const SUN = { x: 210, y: 165 };
const SCALE = 25; // px на AU
const A_J = 5.203;
const P_J = 11.862;

type Group = 'belt' | 'hilda' | 'trojan';
type Body = { group: Group; a: number; e: number; peri: number; M0: number; camp?: 'L4' | 'L5' };

/** Детерминирано псевдослучайно число в [0, 1). */
function rnd(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const BODIES: Body[] = [
  // Главен пояс: случайни орбити
  ...Array.from({ length: 160 }, (_, i): Body => ({
    group: 'belt',
    a: 2.15 + rnd(i) * 1.1,
    e: rnd(i + 1000) * 0.2,
    peri: rnd(i + 2000) * 2 * Math.PI,
    M0: rnd(i + 3000) * 2 * Math.PI,
  })),
  // Хилди: резонанс 3 : 2; в начален момент са в афелий на 180°, 300° или 60° от Юпитер
  ...Array.from({ length: 60 }, (_, i): Body => {
    const k = i % 3;
    const aphelion = Math.PI + (k * 2 * Math.PI) / 3 + (rnd(i + 4000) - 0.5) * 0.35;
    return { group: 'hilda', a: A_J * (2 / 3) ** (2 / 3), e: 0.1 + rnd(i + 5000) * 0.15, peri: aphelion - Math.PI, M0: Math.PI };
  }),
  // Троянци: същият период като Юпитер, около L4 (+60°) и L5 (−60°)
  ...Array.from({ length: 120 }, (_, i): Body => {
    const camp = i % 2 === 0 ? 'L4' : 'L5';
    const lambda = ((camp === 'L4' ? 60 : -60) + (rnd(i + 6000) - 0.5) * 50) * (Math.PI / 180);
    const M0 = rnd(i + 7000) * 2 * Math.PI;
    return { group: 'trojan', a: A_J * (1 + (rnd(i + 8000) - 0.5) * 0.0005), e: rnd(i + 9000) * 0.1, peri: lambda - M0, M0, camp };
  }),
];

function position(b: Body, t: number) {
  const P = b.a ** 1.5;
  const M = b.M0 + (2 * Math.PI * t) / P;
  let E = M;
  for (let k = 0; k < 6; k++) E -= (E - b.e * Math.sin(E) - M) / (1 - b.e * Math.cos(E));
  const x = b.a * (Math.cos(E) - b.e);
  const y = b.a * Math.sqrt(1 - b.e * b.e) * Math.sin(E);
  const r = Math.hypot(x, y);
  const lon = Math.atan2(y, x) + b.peri;
  return { r, lon };
}

const GROUPS: { id: Group; name: string; color: string; text: string }[] = [
  { id: 'belt', name: 'Главен пояс', color: '#a8a29e', text: 'Астероидите от главния пояс са с различни периоди и във въртящата се система се „размазват“ в пръстен. Юпитер ги среща на случайни места и общо взето ги оставя на мира – освен в пролуките на Къркууд.' },
  { id: 'hilda', name: 'Хилди (3 : 2)', color: '#4ade80', text: 'Хилдите обикалят Слънцето 3 пъти, докато Юпитер обиколи 2. Във въртящата се система всяка от тях описва заоблен триъгълник, а всички заедно образуват триъгълник с върхове в L3, L4 и L5. Афелият им – най-близката до Юпитер част от орбитата – никога не съвпада с мястото на Юпитер.' },
  { id: 'trojan', name: 'Троянци (1 : 1)', color: '#fbbf24', text: 'Троянците имат същия период като Юпитер и стоят около точките на Лагранж L4 (60° пред него, „гърците“) и L5 (60° зад него, „троянците“). Там привличането на Слънцето и Юпитер и центробежната сила се уравновесяват. Познаваме над 15 000; малките петлички, които описват, идват от ексцентрицитета на орбитите им.' },
];

const L_POINTS = [
  { name: 'L1', r: A_J - 0.355, a: 0 },
  { name: 'L2', r: A_J + 0.355, a: 0 },
  { name: 'L3', r: A_J, a: Math.PI },
  { name: 'L4', r: A_J, a: Math.PI / 3 },
  { name: 'L5', r: A_J, a: -Math.PI / 3 },
];

export default function TrojanLab() {
  const [t, setT] = useState(0); // години
  const [playing, setPlaying] = useState(false);
  const [rotating, setRotating] = useState(true);
  const [shown, setShown] = useState<Record<Group, boolean>>({ belt: true, hilda: true, trojan: true });
  const [focus, setFocus] = useState<Group>('trojan');

  useAnimationFrame(playing, dt => setT(v => v + dt * 1.5));

  const lambdaJ = (2 * Math.PI * t) / P_J;
  const rot = rotating ? -lambdaJ : 0;
  const toScreen = (r: number, lon: number) => ({ x: SUN.x + r * SCALE * Math.cos(lon + rot), y: SUN.y - r * SCALE * Math.sin(lon + rot) });
  const J = toScreen(A_J, lambdaJ);

  const counts = { L4: 0, L5: 0 };
  BODIES.forEach(b => {
    if (b.camp) counts[b.camp]++;
  });

  const focusGroup = GROUPS.find(g => g.id === focus)!;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пастирът Юпитер</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Във въртящата се система Юпитер стои неподвижно вдясно. Пуснете времето (1 s = 1,5 години) и вижте как резонансите подреждат
        астероидите.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <circle cx={SUN.x} cy={SUN.y} r={A_J * SCALE} fill="none" stroke="#d6a46c" strokeOpacity="0.3" />
        <circle cx={SUN.x} cy={SUN.y} r={1.524 * SCALE} fill="none" stroke="#ef4444" strokeOpacity="0.3" />
        <circle cx={SUN.x} cy={SUN.y} r={1 * SCALE} fill="none" stroke="#3b82f6" strokeOpacity="0.3" />

        {BODIES.filter(b => shown[b.group]).map((b, i) => {
          const p = position(b, t);
          const s = toScreen(p.r, p.lon);
          const g = GROUPS.find(x => x.id === b.group)!;
          return <circle key={i} cx={s.x} cy={s.y} r={b.group === 'belt' ? 1.3 : 1.8} fill={g.color} fillOpacity={b.group === focus ? 0.95 : 0.55} />;
        })}

        {rotating &&
          L_POINTS.map(l => {
            const s = toScreen(l.r, l.a + lambdaJ);
            return (
              <g key={l.name} pointerEvents="none">
                <path d={`M ${s.x - 4} ${s.y} h 8 M ${s.x} ${s.y - 4} v 8`} stroke="#f472b6" strokeWidth="1.5" />
                <text x={s.x + (l.name === 'L1' ? -8 : 7)} y={s.y + (l.name === 'L1' || l.name === 'L2' ? 14 : -6)} fontSize="10" textAnchor={l.name === 'L1' ? 'end' : 'start'} fill="#f9a8d4">
                  {l.name}
                </text>
              </g>
            );
          })}

        <circle cx={SUN.x} cy={SUN.y} r="7" fill="#fbbf24" />
        <circle cx={J.x} cy={J.y} r="7" fill="#d6a46c" />
        <text x={J.x} y={J.y - 11} fontSize="10" textAnchor="middle" fill="#fde68a">
          Юпитер
        </text>

        <g fontSize="11" fill="white" transform="translate(440, 40)">
          <text x={0} y={0} fontWeight="700">
            {fmt(t, 1)} години
          </text>
          <text x={0} y={20} fillOpacity="0.75">
            обиколки на Юпитер: {Math.floor(t / P_J)}
          </text>
          <text x={0} y={46} fill="#fbbf24">
            гърци около L4: {counts.L4}
          </text>
          <text x={0} y={62} fill="#fbbf24">
            троянци около L5: {counts.L5}
          </text>
          <text x={0} y={78} fill="#4ade80">
            Хилди: {BODIES.filter(b => b.group === 'hilda').length}
          </text>
          <text x={0} y={104} fontSize="10" fillOpacity="0.55">
            (примерни тела – реално
          </text>
          <text x={0} y={118} fontSize="10" fillOpacity="0.55">
            са стотици хиляди)
          </text>
          <text x={0} y={150} fontSize="10" fillOpacity="0.55">
            Синьо – Земя, червено – Марс
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-yellow-600 text-white text-sm hover:bg-yellow-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={rotating} onChange={e => setRotating(e.target.checked)} />
          въртяща се с Юпитер система
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {GROUPS.map(g => (
          <label
            key={g.id}
            className={`px-2 py-1 rounded text-sm border flex items-center gap-1 cursor-pointer ${
              g.id === focus
                ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setFocus(g.id)}
          >
            <input
              type="checkbox"
              checked={shown[g.id]}
              onChange={e => setShown(s => ({ ...s, [g.id]: e.target.checked }))}
              onClick={e => e.stopPropagation()}
            />
            <span className="inline-block w-2 h-2 rounded-full align-middle" style={{ background: g.color }} />
            {g.name}
          </label>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{focusGroup.text}</p>
    </div>
  );
}
