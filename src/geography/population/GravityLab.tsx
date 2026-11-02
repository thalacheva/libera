import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { REGION_LAND } from '../balkansLand';
import { fmt, greatCircleKm, rad, type LatLon } from '../geo';

/** Градовете с население в хиляди – закръглено, по преброяването през 2021 г. */
const TOWNS: (LatLon & { name: string; pop: number; dx?: number; dy?: number })[] = [
  { name: 'София', lat: 42.7, lon: 23.32, pop: 1240, dy: -14 },
  { name: 'Пловдив', lat: 42.15, lon: 24.75, pop: 347, dy: 18 },
  { name: 'Варна', lat: 43.21, lon: 27.91, pop: 311, dx: -6, dy: -12 },
  { name: 'Бургас', lat: 42.5, lon: 27.47, pop: 188, dx: -8, dy: 18 },
  { name: 'Русе', lat: 43.85, lon: 25.97, pop: 123, dy: -12 },
  { name: 'Стара Загора', lat: 42.43, lon: 25.64, pop: 122, dy: 18 },
  { name: 'Плевен', lat: 43.42, lon: 24.62, pop: 91, dy: -12 },
  { name: 'Сливен', lat: 42.68, lon: 26.32, pop: 79, dy: -12 },
  { name: 'Шумен', lat: 43.27, lon: 26.92, pop: 72, dy: 16 },
  { name: 'Велико Търново', lat: 43.08, lon: 25.63, pop: 66, dy: -12 },
  { name: 'Хасково', lat: 41.93, lon: 25.56, pop: 66, dy: 16 },
  { name: 'Благоевград', lat: 42.02, lon: 23.1, pop: 66, dy: 16 },
  { name: 'Видин', lat: 43.99, lon: 22.88, pop: 41, dy: -12 },
];

// Местна равнопромежутъчна проекция около България
const MAP = { x: 8, y: 26, w: 392, h: 286 };
const LON0 = 22.0;
const LON1 = 28.9;
const LAT1 = 44.5;
const COS = Math.cos(rad(42.7));
const PX = MAP.w / (LON1 - LON0);
const toXY = (q: LatLon) => ({ x: MAP.x + (q.lon - LON0) * PX, y: MAP.y + ((LAT1 - q.lat) * PX) / COS });

const LAND = REGION_LAND.map(ring => {
  let d = '';
  for (let i = 0; i < ring.length; i += 2) {
    const p = toXY({ lon: ring[i] / 100, lat: ring[i + 1] / 100 });
    d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d + 'Z';
}).join('');

/** Съкратени имена за надписите на двойките. */
const short = (name: string) => name.replace('Стара ', 'Ст. ').replace('Велико ', 'В. ');

const DIST = TOWNS.map(a => TOWNS.map(b => greatCircleKm(a, b)));

/** Гравитационен модел на миграцията между градовете: поток ∝ P₁P₂ / d^β. */
export default function GravityLab() {
  const [origin, setOrigin] = useState(6);
  const [beta, setBeta] = useState(2);
  const [sofia, setSofia] = useState(1);
  const [all, setAll] = useState(false);
  const clip = useId();

  const pop = TOWNS.map((t, i) => (i === 0 ? t.pop * sofia : t.pop));
  const pts = TOWNS.map(toXY);

  // Потоци от избрания град към останалите и делът на всеки
  const raw = TOWNS.map((_, j) => (j === origin ? 0 : (pop[origin] * pop[j]) / DIST[origin][j] ** beta));
  const sum = raw.reduce((a, b) => a + b, 0);
  const share = raw.map(v => v / sum);
  const order = TOWNS.map((_, j) => j)
    .filter(j => j !== origin)
    .sort((a, b) => share[b] - share[a]);
  const nearest = order.reduce((m, j) => (DIST[origin][j] < DIST[origin][m] ? j : m), order[0]);
  const meanDist = order.reduce((s, j) => s + share[j] * DIST[origin][j], 0);

  // Всички двойки – десетте най-силни връзки в страната
  const pairs: { i: number; j: number; v: number }[] = [];
  for (let i = 0; i < TOWNS.length; i++) for (let j = i + 1; j < TOWNS.length; j++) pairs.push({ i, j, v: (pop[i] * pop[j]) / DIST[i][j] ** beta });
  pairs.sort((a, b) => b.v - a.v);
  const top = pairs.slice(0, 10);
  const topSum = pairs.reduce((s, p) => s + p.v, 0);

  // Затихване с разстоянието: d^-β спрямо 50 km
  const G = { x: 440, y: 216, w: 180, h: 84 };
  const gx = (d: number) => G.x + ((d - 25) / 475) * G.w;
  const gy = (v: number) => G.y + G.h - v * G.h;
  let curve = '';
  for (let d = 50; d <= 500; d += 10) curve += `${d === 50 ? 'M' : 'L'}${gx(d).toFixed(1)} ${gy((50 / d) ** beta).toFixed(1)}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id={clip}>
            <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={6} />
          </clipPath>
        </defs>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={6} className="fill-sky-100 dark:fill-sky-950" />
        <path d={LAND} clipPath={`url(#${clip})`} className="fill-stone-100 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-600" strokeWidth="0.6" />
        <text x={MAP.x + 6} y={MAP.y - 8} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          {all ? 'Десетте най-силни връзки между градовете' : `Къде отиват преселниците от ${TOWNS[origin].name}`}
        </text>

        {/* Потоците */}
        {all
          ? top.map(p => (
              <line
                key={`${p.i}-${p.j}`}
                x1={pts[p.i].x}
                y1={pts[p.i].y}
                x2={pts[p.j].x}
                y2={pts[p.j].y}
                className="stroke-violet-500/70"
                strokeWidth={1 + 40 * (p.v / topSum)}
                strokeLinecap="round"
              />
            ))
          : order.map(j => (
              <line
                key={j}
                x1={pts[origin].x}
                y1={pts[origin].y}
                x2={pts[j].x}
                y2={pts[j].y}
                className="stroke-rose-500/70"
                strokeWidth={0.5 + 16 * share[j]}
                strokeLinecap="round"
              />
            ))}

        {/* Градовете */}
        {TOWNS.map((t, i) => (
          <g key={t.name} className="cursor-pointer" onClick={() => setOrigin(i)}>
            <circle
              cx={pts[i].x}
              cy={pts[i].y}
              r={3 + Math.sqrt(pop[i]) / 4}
              className={i === origin && !all ? 'fill-rose-500 stroke-rose-800' : 'fill-sky-600/80 stroke-white dark:stroke-gray-900'}
              strokeWidth="1.5"
            />
            <circle cx={pts[i].x} cy={pts[i].y} r={14} fill="transparent" />
            <text
              x={pts[i].x + (t.dx ?? 0)}
              y={pts[i].y + (t.dy ?? -12)}
              fontSize="10"
              textAnchor="middle"
              className="fill-gray-800 dark:fill-gray-100 pointer-events-none"
            >
              {t.name}
            </text>
          </g>
        ))}

        {/* Дялове */}
        <text x={430} y={18} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          {all ? 'дял от всички връзки' : 'дял от преселниците'}
        </text>
        {(all ? top.slice(0, 8) : order.slice(0, 8)).map((item, k) => {
          const isPair = typeof item !== 'number';
          const v = isPair ? item.v / topSum : share[item];
          const label = isPair ? `${short(TOWNS[item.i].name)}–${short(TOWNS[item.j].name)}` : TOWNS[item].name;
          const y = 30 + k * 20;
          return (
            <g key={label}>
              <text x={430} y={y + 11} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
                {label}
              </text>
              <rect x={540} y={y + 2} width={Math.max(1, 70 * v)} height={12} rx={2} className={isPair ? 'fill-violet-500' : 'fill-rose-500'} />
              <text x={544 + 70 * v} y={y + 12} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
                {fmt(100 * v)}%
              </text>
            </g>
          );
        })}

        {/* Затихване с разстоянието */}
        <text x={G.x - 10} y={G.y - 8} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          затихване: поток спрямо 50 km
        </text>
        <line x1={G.x} y1={G.y + G.h} x2={G.x + G.w} y2={G.y + G.h} className="stroke-gray-400" />
        <line x1={G.x} y1={G.y} x2={G.x} y2={G.y + G.h} className="stroke-gray-400" />
        {[100, 200, 300, 400, 500].map(d => (
          <text key={d} x={gx(d)} y={G.y + G.h + 12} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {d}
          </text>
        ))}
        <text x={G.x + G.w} y={G.y + G.h + 24} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          km
        </text>
        <path d={curve} fill="none" className="stroke-amber-500" strokeWidth="2" />
        <text x={G.x - 4} y={G.y + 4} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          1
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={!all} onClick={() => setAll(false)}>
          от един град
        </DiagramButton>
        <DiagramButton active={all} onClick={() => setAll(true)}>
          всички двойки
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="β" value={beta} onChange={setBeta} min={0} max={3} step={0.1} tone="amber" />
        <Slider label="София ×" value={sofia} onChange={setSofia} min={0.25} max={2} step={0.05} tone="blue" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни върху град, за да го избереш за начало. β – колко силно разстоянието спира хората; „София ×“ – колко пъти увеличаваме (или намаляваме)
        населението на столицата. Населението е по преброяването през 2021 г. (закръглено), разстоянията са по права линия.
      </p>
      {!all && (
        <div className="mt-3">
          <Readout
            items={[
              { label: 'към София', value: origin === 0 ? '—' : `${fmt(100 * share[0])}%`, tone: 'blue' },
              { label: `към ${TOWNS[nearest].name} (най-близо)`, value: `${fmt(100 * share[nearest])}%`, tone: 'rose' },
              { label: 'средно разстояние', value: `${fmt(meanDist)} km`, tone: 'amber' },
            ]}
          />
        </div>
      )}
      <Note tone={beta < 1 ? 'violet' : 'emerald'}>
        {beta < 0.5
          ? 'При β ≈ 0 разстоянието не пречи – всички отиват там, където е най-много население.'
          : beta > 2.2
            ? 'При голямо β разстоянието почти „забранява“ далечните премествания – хората отиват в най-близкия голям град.'
            : 'При β около 1–2 печелят и големите, и близките градове – както в действителност.'}
      </Note>
    </div>
  );
}
