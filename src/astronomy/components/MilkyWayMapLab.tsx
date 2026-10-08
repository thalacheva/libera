import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 330;
// Изглед отгоре
const TX = 165;
const TY = 165;
const TPX = 10; // px на kpc
// Изглед отстрани
const SX = 480;
const SY = 165;
const SPX = 4.5;
const R_SUN = 8.2;
const PITCH = (12 * Math.PI) / 180;
const BAR_ANGLE = (27 * Math.PI) / 180; // спрямо линията Слънце–център

function rnd(n: number) {
  const x = Math.sin(n * 17.213 + 3.733) * 43758.5453;
  return x - Math.floor(x);
}

// Ръкави: логаритмични спирали r = r₀ · e^{k(θ − θ₀)}
// Краищата на пречката са под 63° и 243° (на 27° от вертикалата Слънце–център)
const BAR_END = Math.PI / 2 - BAR_ANGLE;
const ARMS = [
  { name: 'Щит–Кентавър', r0: 4, th0: BAR_END, color: '#93c5fd', major: true },
  { name: 'Персей', r0: 4, th0: BAR_END + Math.PI, color: '#93c5fd', major: true },
  { name: 'Стрелец–Кил', r0: 4.6, th0: BAR_END + Math.PI / 2, color: '#a5b4fc', major: false },
  { name: 'Наугол', r0: 4.6, th0: BAR_END - Math.PI / 2, color: '#a5b4fc', major: false },
];

// Посоката към Слънцето е надолу (θ = −90°)
const toTop = (r: number, th: number) => ({ x: TX + r * TPX * Math.cos(th), y: TY - r * TPX * Math.sin(th) });

const ARM_PATHS = ARMS.map(a => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const dth = (i / 120) * 1.7 * Math.PI;
    const r = a.r0 * Math.exp(Math.tan(PITCH) * dth);
    if (r > 16) break;
    const p = toTop(r, a.th0 + dth);
    pts.push(`${p.x},${p.y}`);
  }
  return pts.join(' ');
});

const SUN = toTop(R_SUN, -Math.PI / 2);

// Кълбовидни купове: сферично разпределение около центъра
const GLOBULARS = Array.from({ length: 150 }, (_, i) => {
  const r = 0.5 + 18 * rnd(i) ** 2.2;
  const th = rnd(i + 200) * 2 * Math.PI;
  const z = (rnd(i + 400) * 2 - 1) * r;
  const rho = Math.sqrt(Math.max(0, r * r - z * z));
  return { x: rho * Math.cos(th), y: rho * Math.sin(th), z };
});

type Part = 'bar' | 'arms' | 'sun' | 'disk' | 'halo' | 'center';

const PARTS: { id: Part; name: string; text: string }[] = [
  { id: 'center', name: 'Центърът', text: 'В съзвездието Стрелец, на 8,2 kpc от нас, скрит зад 30 звездни величини прах. В центъра е свръхмасивната черна дупка Стрелец A* с маса 4,3 млн. M☉ (Лекция 21).' },
  { id: 'bar', name: 'Пречката и издутината', text: 'Издължена структура от стари звезди, простираща се на ~5 kpc от центъра и завъртяна на ~27° спрямо посоката към Слънцето. Затова Млечният път е от тип SBbc.' },
  { id: 'arms', name: 'Спиралните ръкави', text: 'Два главни ръкава – Щит–Кентавър и Персей – тръгват от краищата на пречката; има и два по-слаби. Ръкавите са очертани от млади горещи звезди, мъглявини и облаци газ. Картографирани са по радиолинията на водорода (21 cm) и по разстоянията на млади звезди от Gaia.' },
  { id: 'sun', name: 'Слънцето', text: 'В малкия Орионов ръкав (шпора) между ръкавите Стрелец и Персей, на 8,2 kpc от центъра и ~20 pc над равнината на диска. Обикаля центъра с 230 km/s.' },
  { id: 'disk', name: 'Дискът', text: 'Тънкият диск (дебел ~0,3 kpc) съдържа млади звезди, газ и прах – Популация I. Около него има по-дебел диск (~1 kpc) от по-стари звезди. Звездният диск е с диаметър ~30 kpc (~100 000 светлинни години).' },
  { id: 'halo', name: 'Ореолът', text: 'Сферична област с радиус над 30 kpc със стари, бедни на метали звезди (Популация II) и ~160 кълбовидни купа. Около всичко това е тъмният ореол – ~10 пъти по-масивен от всички звезди.' },
];

export default function MilkyWayMapLab() {
  const [part, setPart] = useState<Part>('sun');
  const [shapley, setShapley] = useState(false);
  const [herschel, setHerschel] = useState(false);
  const info = PARTS.find(p => p.id === part)!;

  const centroid = GLOBULARS.reduce((a, g) => ({ x: a.x + g.x / GLOBULARS.length, y: a.y + g.y / GLOBULARS.length }), { x: 0, y: 0 });
  const hl = (p: Part) => (part === p ? 1 : 0.55);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Картата на нашата Галактика</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вляво – изглед отгоре (схематично), вдясно – отстрани. Изберете част от Галактиката или пробвайте как Хершел и Шапли са
        търсили нашето място в нея.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Изглед отгоре */}
        <circle cx={TX} cy={TY} r={15 * TPX} fill="#1e293b" fillOpacity="0.5" />
        {ARMS.map((a, i) => (
          <polyline key={a.name} points={ARM_PATHS[i]} fill="none" stroke={a.color} strokeOpacity={hl('arms') * (a.major ? 1 : 0.7)} strokeWidth={a.major ? 9 : 6} strokeLinecap="round" />
        ))}
        {/* Орионовата шпора около Слънцето */}
        <line x1={SUN.x - 22} y1={SUN.y + 8} x2={SUN.x + 18} y2={SUN.y - 10} stroke="#c7d2fe" strokeOpacity={hl('arms') * 0.7} strokeWidth="5" strokeLinecap="round" />
        <ellipse
          cx={TX}
          cy={TY}
          rx={5 * TPX}
          ry={1.6 * TPX}
          fill="#fde68a"
          fillOpacity={hl('bar') * 0.8}
          transform={`rotate(${-((BAR_END * 180) / Math.PI)} ${TX} ${TY})`}
        />
        <circle cx={TX} cy={TY} r={2.2 * TPX} fill="#fef3c7" fillOpacity={hl('bar') * 0.6} />
        <circle cx={TX} cy={TY} r="3" fill={part === 'center' ? '#f472b6' : 'black'} stroke="white" strokeWidth="1" />
        {herschel && (
          <path
            d={`M ${SUN.x - 32} ${SUN.y} Q ${SUN.x - 20} ${SUN.y - 22} ${SUN.x + 5} ${SUN.y - 18} Q ${SUN.x + 30} ${SUN.y - 12} ${SUN.x + 28} ${SUN.y + 6} Q ${SUN.x + 15} ${SUN.y + 22} ${SUN.x - 8} ${SUN.y + 18} Q ${SUN.x - 30} ${SUN.y + 14} ${SUN.x - 32} ${SUN.y} Z`}
            fill="#fbbf24"
            fillOpacity="0.15"
            stroke="#fbbf24"
            strokeDasharray="3 2"
          />
        )}
        {shapley && (
          <g>
            {GLOBULARS.map((g, i) => {
              const p = { x: TX + g.x * TPX, y: TY - g.y * TPX };
              return <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="#f9a8d4" fillOpacity="0.8" />;
            })}
            <path d={`M ${TX + centroid.x * TPX - 7} ${TY - centroid.y * TPX} h 14 M ${TX + centroid.x * TPX} ${TY - centroid.y * TPX - 7} v 14`} stroke="#f472b6" strokeWidth="2.5" />
          </g>
        )}
        <circle cx={SUN.x} cy={SUN.y} r={part === 'sun' ? 6 : 4.5} fill="#facc15" stroke="white" strokeWidth="1" />
        <text x={SUN.x + 9} y={SUN.y + 16} fontSize="10" fill="#fde68a">
          Слънце
        </text>
        <line x1={TX} y1={TY} x2={SUN.x} y2={SUN.y} stroke="white" strokeOpacity="0.25" strokeDasharray="3 3" />
        <text x={TX + 5} y={(TY + SUN.y) / 2} fontSize="9" fill="white" fillOpacity="0.6">
          8,2 kpc
        </text>
        <text x={TX} y={16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          отгоре
        </text>

        {/* Изглед отстрани */}
        <ellipse cx={SX} cy={SY} rx={20 * SPX} ry={20 * SPX} fill="#a78bfa" fillOpacity={hl('halo') * 0.12} stroke="#a78bfa" strokeOpacity={hl('halo') * 0.5} strokeDasharray="4 4" />
        <ellipse cx={SX} cy={SY} rx={15 * SPX} ry={1 * SPX} fill="#93c5fd" fillOpacity={hl('disk') * 0.35} />
        <ellipse cx={SX} cy={SY} rx={15 * SPX} ry={0.3 * SPX + 0.8} fill="#e0f2fe" fillOpacity={hl('disk') * 0.9} />
        <ellipse cx={SX} cy={SY} rx={2.5 * SPX} ry={1.6 * SPX} fill="#fde68a" fillOpacity={hl('bar') * 0.9} />
        {shapley &&
          GLOBULARS.map((g, i) => <circle key={i} cx={SX + g.x * SPX} cy={SY - g.z * SPX} r="1.5" fill="#f9a8d4" fillOpacity="0.8" />)}
        <circle cx={SX + R_SUN * SPX} cy={SY - 0.02 * SPX} r="3" fill="#facc15" />
        <text x={SX + R_SUN * SPX} y={SY - 8} fontSize="9" textAnchor="middle" fill="#fde68a">
          Слънце
        </text>
        <text x={SX} y={16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          отстрани
        </text>
        <line x1={SX - 15 * SPX} x2={SX + 15 * SPX} y1={H - 22} y2={H - 22} stroke="white" strokeOpacity="0.4" />
        <text x={SX} y={H - 8} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          30 kpc ≈ 100 000 светлинни години
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PARTS.map(p => (
          <button
            key={p.id}
            onClick={() => setPart(p.id)}
            className={`px-2 py-1 rounded text-xs border ${
              p.id === part ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={herschel} onChange={e => setHerschel(e.target.checked)} />
          моделът на Хершел (1785)
        </label>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={shapley} onChange={e => setShapley(e.target.checked)} />
          кълбовидните купове на Шапли (1918)
        </label>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {shapley
          ? `Кълбовидните купове са разпределени сферично около центъра на Галактиката, а не около Слънцето. Шапли намира центъра на разпределението им (розовия кръст) – на ${fmt(Math.hypot(centroid.x, centroid.y + R_SUN), 1)} kpc от нас в посока Стрелец. Слънцето не е в центъра!`
          : herschel
            ? 'Хершел брои звездите в различни посоки и получава сплескана „воденичка“ със Слънцето почти в центъра. Грешката е от праха: в диска виждаме само на няколко килопарсека – като в мъгла, където навсякъде изглеждаме в центъра на видимия свят.'
            : info.text}
      </p>
    </div>
  );
}
