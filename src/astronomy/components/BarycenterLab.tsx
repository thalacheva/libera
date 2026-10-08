import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 340;
const LEFT = { x: 165, y: 170 };
const SEP = 140; // разстояние между телата в лявата картина, px
const ZOOM = { x: 485, y: 170, r: 44 }; // радиус на главното тяло в увеличения изглед

type System = {
  id: string;
  label: string;
  primary: { name: string; radius: number; color: string };
  secondary: { name: string; radius: number; color: string };
  a: number; // km
  ratio: number; // m₂ / m₁
  period: string;
  locked: 'both' | 'secondary' | 'none';
  text: string;
};

const SYSTEMS: System[] = [
  {
    id: 'pluto',
    label: 'Плутон – Харон',
    primary: { name: 'Плутон', radius: 1188, color: '#d6b48a' },
    secondary: { name: 'Харон', radius: 606, color: '#a8a29e' },
    a: 19596,
    ratio: 0.1217,
    period: '6,387 дни',
    locked: 'both',
    text: 'Харон е половината от размера на Плутон и 1/8 от масата му – най-големият спътник спрямо своята планета. Общият център на масите е извън Плутон, затова често говорим за двойна система. Приливите са синхронизирали и двете тела: Плутон и Харон винаги са обърнати един към друг с една и съща страна. От едното полукълбо на Плутон Харон виси неподвижно на небето, от другото никога не се вижда.',
  },
  {
    id: 'earth',
    label: 'Земя – Луна',
    primary: { name: 'Земя', radius: 6371, color: '#3b82f6' },
    secondary: { name: 'Луна', radius: 1737, color: '#d4d4d4' },
    a: 384400,
    ratio: 0.0123,
    period: '27,32 дни',
    locked: 'secondary',
    text: 'Центърът на масите е на ~4670 km от центъра на Земята – вътре в нея, на ~1700 km под повърхността. Земята „се клатушка“ около тази точка веднъж месечно. Луната е синхронизирана, но Земята – още не: приливите бавно забавят въртенето ѝ.',
  },
  {
    id: 'sun',
    label: 'Слънце – Юпитер',
    primary: { name: 'Слънце', radius: 696000, color: '#fbbf24' },
    secondary: { name: 'Юпитер', radius: 69911, color: '#d6a46c' },
    a: 778.5e6,
    ratio: 1 / 1047.6,
    period: '11,86 години',
    locked: 'none',
    text: 'Юпитер е 1/1048 от масата на Слънцето, но е много далеч – центърът на масите е малко над повърхността на Слънцето. Слънцето описва малък кръг около тази точка със скорост ~12,5 m/s. Такова „клатене“ на далечни звезди се измерва по доплеровото отместване на линиите им – така през 1995 г. е открита първата планета около звезда като Слънцето.',
  },
];

export default function BarycenterLab() {
  const [systemId, setSystemId] = useState('pluto');
  const [phase, setPhase] = useState(0.4);
  const [playing, setPlaying] = useState(false);
  const sys = SYSTEMS.find(s => s.id === systemId)!;

  useAnimationFrame(playing, dt => setPhase(p => p + (dt * 2 * Math.PI) / 6));

  const fromPrimary = (sys.a * sys.ratio) / (1 + sys.ratio); // km
  const inside = fromPrimary < sys.primary.radius;

  // Лявата картина: барицентърът е в LEFT, телата обикалят около него
  const scale = SEP / sys.a;
  const d1 = fromPrimary * scale;
  const d2 = SEP - d1;
  const c = Math.cos(phase);
  const s = Math.sin(phase);
  const p1 = { x: LEFT.x - d1 * c, y: LEFT.y + d1 * s };
  const p2 = { x: LEFT.x + d2 * c, y: LEFT.y - d2 * s };
  const r1 = Math.max(sys.primary.radius * scale, 2.5);
  const r2 = Math.max(sys.secondary.radius * scale, 2);
  const toward = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

  // Увеличеният изглед: барицентърът стои в центъра, главното тяло обикаля около него
  const zs = ZOOM.r / sys.primary.radius;
  const zd = fromPrimary * zs;
  const zp = { x: ZOOM.x - zd * c, y: ZOOM.y + zd * s };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Около кого обикаля Харон?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Двете тела обикалят около общия център на масите (+). Вдясно главното тяло е увеличено: вътре ли е центърът, или навън?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Лявата картина в мащаб */}
        <circle cx={LEFT.x} cy={LEFT.y} r={d2} fill="none" stroke="white" strokeOpacity="0.15" />
        {d1 > 1 && <circle cx={LEFT.x} cy={LEFT.y} r={d1} fill="none" stroke="white" strokeOpacity="0.25" strokeDasharray="2 2" />}
        <circle cx={p1.x} cy={p1.y} r={r1} fill={sys.primary.color} />
        <circle cx={p2.x} cy={p2.y} r={r2} fill={sys.secondary.color} />
        {/* Синхронно въртене: черта от лицето, обърнато към другото тяло */}
        {sys.locked === 'both' && (
          <line x1={p1.x} y1={p1.y} x2={p1.x + r1 * Math.cos((toward * Math.PI) / 180)} y2={p1.y + r1 * Math.sin((toward * Math.PI) / 180)} stroke="#7c2d12" strokeWidth="2" />
        )}
        {sys.locked !== 'none' && (
          <line x1={p2.x} y1={p2.y} x2={p2.x - r2 * Math.cos((toward * Math.PI) / 180)} y2={p2.y - r2 * Math.sin((toward * Math.PI) / 180)} stroke="#44403c" strokeWidth="1.5" />
        )}
        <path d={`M ${LEFT.x - 5} ${LEFT.y} h 10 M ${LEFT.x} ${LEFT.y - 5} v 10`} stroke="#f472b6" strokeWidth="1.5" />
        <text x={p1.x} y={p1.y - r1 - 6} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
          {sys.primary.name}
        </text>
        <text x={p2.x} y={p2.y - r2 - 6} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
          {sys.secondary.name}
        </text>
        <text x={LEFT.x} y={H - 10} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          в мащаб (малките тела са поне 2 px)
        </text>

        {/* Увеличен изглед */}
        <line x1={330} x2={330} y1={20} y2={H - 20} stroke="white" strokeOpacity="0.1" />
        <circle cx={ZOOM.x} cy={ZOOM.y} r={zd} fill="none" stroke="#f472b6" strokeOpacity="0.5" strokeDasharray="3 3" />
        <circle cx={zp.x} cy={zp.y} r={ZOOM.r} fill={sys.primary.color} fillOpacity="0.85" />
        <circle cx={zp.x} cy={zp.y} r={2.5} fill="#0f172a" />
        <path d={`M ${ZOOM.x - 7} ${ZOOM.y} h 14 M ${ZOOM.x} ${ZOOM.y - 7} v 14`} stroke="#f472b6" strokeWidth="2.5" />
        <text x={ZOOM.x} y={20} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
          {sys.primary.name} отблизо
        </text>
        <text x={ZOOM.x} y={H - 26} fontSize="12" textAnchor="middle" fill={inside ? '#60a5fa' : '#f472b6'} fontWeight="700">
          център на масите: {fmt(fromPrimary, 0)} km = {fmt(fromPrimary / sys.primary.radius, 2)} R
        </text>
        <text x={ZOOM.x} y={H - 10} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.75">
          {inside ? 'вътре в тялото' : 'извън тялото!'}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {SYSTEMS.map(x => (
          <button
            key={x.id}
            onClick={() => setSystemId(x.id)}
            className={`px-3 py-1 rounded text-sm border ${
              x.id === systemId
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {x.label}
          </button>
        ))}
        <button onClick={() => setPlaying(p => !p)} className="ml-2 px-4 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Разстояние', value: `${fmt(sys.a, 0)} km` },
          { label: 'Отношение на масите', value: `1 : ${fmt(1 / sys.ratio, sys.ratio > 0.05 ? 1 : 0)}` },
          { label: 'Период', value: sys.period },
          { label: `Радиус на ${sys.primary.name === 'Земя' ? 'Земята' : sys.primary.name}`, value: `${fmt(sys.primary.radius, 0)} km` },
        ].map(x => (
          <div key={x.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{x.label}</div>
            <div className="font-semibold">{x.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 p-3 rounded-lg text-sm sm:text-base bg-amber-50 dark:bg-amber-500/10">{sys.text}</p>
    </div>
  );
}
