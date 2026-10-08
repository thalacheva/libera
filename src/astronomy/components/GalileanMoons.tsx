import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 340;
const JX = 185;
const JY = 145;
const PX_PER_RJ = 4.8; // пиксела на радиус на Юпитер
const R_J = 71492;
const STRIP_Y = 305;

type Moon = {
  id: string;
  name: string;
  color: string;
  a: number; // km
  period: number; // дни
  radius: number; // km
  density: number; // g/cm³
  lon0: number; // начална дължина, ° (подбрана така, че λ_Ио − 3λ_Европа + 2λ_Ганимед = 180°)
  text: string;
};

const MOONS: Moon[] = [
  {
    id: 'io',
    name: 'Йо',
    color: '#facc15',
    a: 421700,
    period: 1.769138,
    radius: 1822,
    density: 3.53,
    lon0: 100,
    text: 'Най-вулканичното тяло в Слънчевата система – над 400 активни вулкана, чиито струи от серни газове се издигат на стотици километри. Енергията идва от приливите: резонансът с Европа и Ганимед не позволява орбитата на Йо да стане кръгова, затова Юпитер непрекъснато го „мачка“ – приливната издутина се движи нагоре-надолу с ~100 m.',
  },
  {
    id: 'europa',
    name: 'Европа',
    color: '#e7e5e4',
    a: 671100,
    period: 3.551181,
    radius: 1561,
    density: 3.01,
    lon0: 20,
    text: 'Под ледена кора, дебела 15–25 km, има солен океан, дълбок ~100 km – с около два пъти повече вода от всички океани на Земята. Приливното нагряване държи водата течна. Европа е едно от най-обещаващите места за търсене на живот извън Земята; сондата Europa Clipper (изстреляна през 2024 г.) ще пристигне там през 2030 г.',
  },
  {
    id: 'ganymede',
    name: 'Ганимед',
    color: '#a8a29e',
    a: 1070400,
    period: 7.154553,
    radius: 2634,
    density: 1.94,
    lon0: 70,
    text: 'Най-големият спътник в Слънчевата система – по-голям от Меркурий (но двойно по-лек от него). Единственият спътник със собствено магнитно поле, а под леда вероятно има океан. Европейската сонда JUICE ще влезе в орбита около Ганимед през 2034 г. – първата сонда, която ще обикаля спътник на друга планета.',
  },
  {
    id: 'callisto',
    name: 'Калисто',
    color: '#78716c',
    a: 1882700,
    period: 16.689018,
    radius: 2410,
    density: 1.83,
    lon0: 200,
    text: 'Най-осеяното с кратери тяло в Слънчевата система – повърхността ѝ е непроменена от ~4 млрд. години. Калисто не участва в резонанса и почти не се нагрява от приливи, затова в недрата си е само частично разслоена на ядро и мантия.',
  },
];

const deg = (x: number) => (x * Math.PI) / 180;
const norm180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180;
const lonAt = (m: Moon, t: number) => m.lon0 + (360 * t) / m.period;

/** Дължина на последното съединение на два спътника до момента t. */
function lastConjunction(inner: Moon, outer: Moon, t: number) {
  const rate = 360 / inner.period - 360 / outer.period; // °/ден
  const gap = (((lonAt(outer, 0) - lonAt(inner, 0)) % 360) + 360) % 360; // колко трябва да навакса вътрешният
  const t1 = gap / rate;
  const synodic = 360 / rate;
  if (t < t1) return null;
  const tc = t1 + Math.floor((t - t1) / synodic) * synodic;
  return lonAt(inner, tc);
}

export default function GalileanMoons() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [moonId, setMoonId] = useState('io');
  const moon = MOONS.find(m => m.id === moonId)!;
  const [io, europa, ganymede] = MOONS;

  useAnimationFrame(playing, dt => setT(v => v + dt * speed));

  const pos = (m: Moon) => {
    const r = (m.a / R_J) * PX_PER_RJ;
    const l = deg(lonAt(m, t));
    return { x: JX + r * Math.cos(l), y: JY - r * Math.sin(l), depth: Math.sin(l) };
  };

  const laplace = norm180(lonAt(io, t) - 3 * lonAt(europa, t) + 2 * lonAt(ganymede, t));
  const conjIE = lastConjunction(io, europa, t);
  const conjEG = lastConjunction(europa, ganymede, t);
  const orbits = MOONS.slice(0, 3).map(m => Math.floor(t / m.period));

  const ray = (lon: number, color: string, label: string) => {
    const L = 118;
    return (
      <g pointerEvents="none">
        <line x1={JX} y1={JY} x2={JX + L * Math.cos(deg(lon))} y2={JY - L * Math.sin(deg(lon))} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.8" />
        <text x={JX + (L + 6) * Math.cos(deg(lon))} y={JY - (L + 6) * Math.sin(deg(lon)) + 3} fontSize="9" textAnchor="middle" fill={color}>
          {label}
        </text>
      </g>
    );
  };

  const DIAL = { x: 520, y: 205, r: 34 };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Галилеевите спътници и резонансът на Лаплас</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Горе – изглед отвесно над Юпитер. Долу – какво вижда наблюдател от Земята: четири звездички, които сменят местата си всяка нощ.
        Щракнете върху спътник.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Орбити */}
        {MOONS.map(m => (
          <circle key={m.id} cx={JX} cy={JY} r={(m.a / R_J) * PX_PER_RJ} fill="none" stroke="white" strokeOpacity={m.id === moonId ? 0.4 : 0.12} />
        ))}

        {/* Последните съединения */}
        {conjIE !== null && ray(conjIE, '#facc15', 'Йо–Европа')}
        {conjEG !== null && ray(conjEG, '#a8a29e', 'Европа–Ганимед')}

        <circle cx={JX} cy={JY} r={PX_PER_RJ} fill="#d6a46c" />

        {MOONS.map(m => {
          const p = pos(m);
          const r = Math.max(3, m.radius / 600);
          return (
            <g key={m.id} className="cursor-pointer" onClick={() => setMoonId(m.id)}>
              <circle cx={p.x} cy={p.y} r={r + 5} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={r} fill={m.color} stroke={m.id === moonId ? 'white' : 'none'} strokeWidth="1.5" />
              <text x={p.x} y={p.y - r - 4} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
                {m.name}
              </text>
            </g>
          );
        })}
        <text x={JX + 150} y={JY + 130} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          ↓ към Земята
        </text>

        {/* Изгледът от Земята */}
        <rect x={20} y={STRIP_Y - 22} width={W - 40} height={36} rx="6" fill="black" fillOpacity="0.5" />
        <circle cx={JX} cy={STRIP_Y - 4} r={PX_PER_RJ * 1.6} fill="#d6a46c" />
        {MOONS.map(m => {
          const p = pos(m);
          const dx = p.x - JX;
          // Зад диска на Юпитер спътникът не се вижда
          const hidden = p.depth > 0 && Math.abs(dx) < PX_PER_RJ * 1.6;
          return hidden ? null : (
            <circle key={m.id} cx={JX + dx} cy={STRIP_Y - 4} r={m.id === moonId ? 2.8 : 2} fill={m.id === moonId ? '#fde68a' : 'white'} />
          );
        })}
        <text x={30} y={STRIP_Y - 26} fontSize="9" fill="white" fillOpacity="0.6">
          в телескоп от Земята
        </text>

        {/* Резонансът */}
        <g fontSize="11" fill="white">
          <text x={400} y={34} fontWeight="600">
            Обиколки от началото
          </text>
          {MOONS.slice(0, 3).map((m, i) => (
            <g key={m.id}>
              <circle cx={406} cy={54 + i * 20} r="4" fill={m.color} />
              <text x={416} y={58 + i * 20}>
                {m.name}: {orbits[i]}
              </text>
              <text x={510} y={58 + i * 20} fillOpacity="0.6">
                T = {fmt(m.period, 3)} д
              </text>
            </g>
          ))}
          <text x={400} y={130} fillOpacity="0.7" fontSize="10">
            Периодите се отнасят почти точно като 1 : 2 : 4
          </text>
        </g>

        {/* Ъгълът на Лаплас */}
        <circle cx={DIAL.x} cy={DIAL.y} r={DIAL.r} fill="none" stroke="white" strokeOpacity="0.3" />
        <line
          x1={DIAL.x}
          y1={DIAL.y}
          x2={DIAL.x + DIAL.r * Math.cos(deg(laplace))}
          y2={DIAL.y - DIAL.r * Math.sin(deg(laplace))}
          stroke="#fbbf24"
          strokeWidth="2.5"
        />
        <text x={DIAL.x} y={DIAL.y - DIAL.r - 22} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
          λ(Йо) − 3λ(Европа) + 2λ(Ганимед)
        </text>
        <text x={DIAL.x} y={DIAL.y - DIAL.r - 8} fontSize="12" textAnchor="middle" fill="#fbbf24" fontWeight="700">
          = {fmt(Math.abs(laplace), 1)}°
        </text>
        <text x={DIAL.x} y={DIAL.y + DIAL.r + 16} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          винаги 180° – трите никога не се подреждат
        </text>
        <text x={DIAL.x} y={DIAL.y + DIAL.r + 28} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          в една линия от една и съща страна
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-yellow-600 text-white text-sm hover:bg-yellow-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <button
          onClick={() => {
            setT(0);
            setPlaying(false);
          }}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ↺ Начало
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">ден {fmt(t, 1)}</span>
      </div>
      <label className="block text-sm font-semibold mt-3 mb-1">Скорост: {fmt(speed, 2)} дни в секунда</label>
      <input type="range" min="0.25" max="4" step="0.25" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full" />

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {MOONS.map(m => (
          <button
            key={m.id}
            onClick={() => setMoonId(m.id)}
            className={`px-3 py-1 rounded text-sm border ${
              m.id === moonId
                ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: m.color }} />
            {m.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Радиус', value: `${fmt(moon.radius, 0)} km` },
          { label: 'Средна плътност', value: `${fmt(moon.density, 2)} g/cm³` },
          { label: 'Разстояние', value: `${fmt(moon.a, 0)} km`, note: `${fmt(moon.a / R_J, 1)} R♃` },
          { label: 'Период', value: `${fmt(moon.period, 2)} дни` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
            {s.note && <div className="text-xs text-gray-500 dark:text-gray-400">{s.note}</div>}
          </div>
        ))}
      </div>
      <p className="mt-3 p-3 rounded-lg text-sm sm:text-base bg-yellow-50 dark:bg-yellow-500/10">{moon.text}</p>
    </div>
  );
}
