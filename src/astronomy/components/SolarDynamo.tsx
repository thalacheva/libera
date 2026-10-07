import { useState } from 'react';
import { project, siderealRate } from './sunMath';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const CX = 170;
const CY = 160;
const R = 135;
const DAYS = 250;

const STAGES = [
  { upTo: 5, title: 'Полоидално поле', text: 'В началото на цикъла полето прилича на това на магнит: линиите излизат от единия полюс и влизат в другия.' },
  {
    upTo: 120,
    title: 'Навиване',
    text: 'Плазмата „влачи“ магнитните линии със себе си. Екваторът се върти по-бързо от полюсите и разтяга линиите в посока изток–запад.',
  },
  {
    upTo: DAYS + 1,
    title: 'Тороидално поле',
    text: 'След много обиколки линиите са навити плътно около Слънцето като конец на макара. Полето се усилва, докато сноповете му изплуват нагоре и пробият повърхността – там се появяват двойки петна.',
  },
];

export default function SolarDynamo() {
  const [day, setDay] = useState(0);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt =>
    setDay(d => {
      const next = d + dt * 20;
      if (next >= DAYS) {
        setPlaying(false);
        return DAYS;
      }
      return next;
    })
  );

  // Линиите се движат спрямо полюса, така че в началото са прави меридиани
  const lines = Array.from({ length: 12 }, (_, i) => {
    const lon0 = -180 + i * 30;
    const segments: string[][] = [[]];
    for (let lat = -88; lat <= 88; lat += 1) {
      const lon = lon0 + (siderealRate(lat) - siderealRate(88)) * day;
      const p = project(lat, ((lon % 360) + 540) % 360 - 180);
      if (p.visible) segments[segments.length - 1].push(`${(CX + p.x * R).toFixed(1)},${(CY + p.y * R).toFixed(1)}`);
      else if (segments[segments.length - 1].length) segments.push([]);
    }
    return segments.filter(s => s.length > 1);
  });

  const stage = STAGES.find(s => day < s.upTo)!;
  const turns = ((siderealRate(0) - siderealRate(88)) * day) / 360;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Магнитното динамо</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Пуснете времето и вижте как неравномерното въртене навива магнитните линии. Така Слънцето превръща енергията на въртенето си в
        магнитна (модел на Бабкок).
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="dyn-sun">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="0.85" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill="url(#dyn-sun)" />
        {lines.map((segs, i) =>
          segs.map((s, j) => <polyline key={`${i}-${j}`} points={s.join(' ')} fill="none" stroke="#1e40af" strokeWidth="1.8" strokeOpacity="0.85" />)
        )}
        <text x={CX} y={CY - R - 8} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          N
        </text>
        <text x={CX} y={CY + R + 16} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          S
        </text>

        {/* Изплуваща магнитна примка и двойка петна */}
        <g transform="translate(475 0)">
          <text x={0} y={30} fontSize="12" fontWeight="600" textAnchor="middle" fill="white">
            Как се ражда двойка петна
          </text>
          <rect x={-130} y={200} width={260} height={60} fill="#f59e0b" fillOpacity="0.35" />
          <text x={-124} y={252} fontSize="10" fill="white" fillOpacity="0.7">
            фотосфера
          </text>
          <path d="M -70 260 C -70 90, 70 90, 70 260" fill="none" stroke="#60a5fa" strokeWidth="3" opacity={day > 120 ? 1 : 0.25} />
          <path d="M -40 260 C -40 130, 40 130, 40 260" fill="none" stroke="#60a5fa" strokeWidth="2" opacity={day > 120 ? 0.7 : 0.15} />
          <ellipse cx={-55} cy={200} rx={22} ry={7} fill="#1c0a02" opacity={day > 120 ? 1 : 0.2} />
          <ellipse cx={55} cy={200} rx={22} ry={7} fill="#1c0a02" opacity={day > 120 ? 1 : 0.2} />
          <text x={-55} y={185} fontSize="13" fontWeight="700" textAnchor="middle" fill="#f87171" opacity={day > 120 ? 1 : 0.3}>
            N
          </text>
          <text x={55} y={185} fontSize="13" fontWeight="700" textAnchor="middle" fill="#93c5fd" opacity={day > 120 ? 1 : 0.3}>
            S
          </text>
          <text x={0} y={290} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
            където примката излиза и влиза – петна
          </text>
          <text x={0} y={304} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
            с противоположна полярност
          </text>
        </g>
      </svg>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => {
            if (day >= DAYS) setDay(0);
            setPlaying(!playing);
          }}
          className="px-3 py-1 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600 whitespace-nowrap"
        >
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <input type="range" min={0} max={DAYS} step={1} value={day} onChange={e => setDay(Number(e.target.value))} className="flex-1" />
        <span className="text-sm font-mono w-20 text-right">{Math.round(day)} дни</span>
      </div>
      <div className="mt-3 p-3 bg-gray-100/70 dark:bg-gray-900/40 rounded-lg text-sm">
        <p className="font-semibold">
          {stage.title} – екваторът е изпреварил полюсите с {turns.toFixed(1).replace('.', ',')} обиколки
        </p>
        <p className="mt-1 text-gray-700 dark:text-gray-300">{stage.text}</p>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Опростено: в действителност навиването става в дълбочина, в основата на конвективната зона, а конвекцията и изплуващите петна
        постепенно възстановяват полоидалното поле – с обратна полярност. Затова магнитният цикъл е 22 години.
      </p>
    </div>
  );
}
