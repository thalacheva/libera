import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { REGION_LAND } from '../balkansLand';
import { fmt, greatCircleKm, rad, type LatLon } from '../geo';

const NODES: (LatLon & { name: string; dx?: number; dy?: number })[] = [
  { name: 'София', lat: 42.7, lon: 23.32, dy: -12 },
  { name: 'Пловдив', lat: 42.15, lon: 24.75, dy: 18 },
  { name: 'Ст. Загора', lat: 42.43, lon: 25.64, dy: 18 },
  { name: 'Бургас', lat: 42.5, lon: 27.47, dx: -6, dy: 18 },
  { name: 'Варна', lat: 43.21, lon: 27.91, dx: -8, dy: -12 },
  { name: 'Русе', lat: 43.85, lon: 25.97, dy: -12 },
  { name: 'В. Търново', lat: 43.08, lon: 25.63, dy: -12 },
  { name: 'Плевен', lat: 43.42, lon: 24.62, dy: -12 },
];
const V = NODES.length;

const MAP = { x: 8, y: 22, w: 392, h: 262 };
const LON0 = 22.2;
const LON1 = 28.8;
const LAT1 = 44.4;
const COS = Math.cos(rad(42.7));
const PX = MAP.w / (LON1 - LON0);
const toXY = (q: LatLon) => ({ x: MAP.x + (q.lon - LON0) * PX, y: MAP.y + ((LAT1 - q.lat) * PX) / COS });
const PTS = NODES.map(toXY);

const LAND = REGION_LAND.map(ring => {
  let d = '';
  for (let i = 0; i < ring.length; i += 2) {
    const p = toXY({ lon: ring[i] / 100, lat: ring[i + 1] / 100 });
    d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d + 'Z';
}).join('');

const DIST = NODES.map(a => NODES.map(b => greatCircleKm(a, b)));
const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);

/** Минимално покриващо дърво (алгоритъм на Прим) – най-късата мрежа, която свързва всички градове. */
function spanningTree() {
  const inTree = [0];
  const edges: string[] = [];
  while (inTree.length < V) {
    let best = [-1, -1];
    for (const i of inTree)
      for (let j = 0; j < V; j++)
        if (!inTree.includes(j) && (best[0] < 0 || DIST[i][j] < DIST[best[0]][best[1]])) best = [i, j];
    edges.push(key(best[0], best[1]));
    inTree.push(best[1]);
  }
  return edges;
}

const PRESETS: [string, string[]][] = [
  ['празна', []],
  ['дърво', spanningTree()],
  ['звезда', NODES.slice(1).map((_, k) => key(0, k + 1))],
  ['пръстен', NODES.map((_, k) => key(k, (k + 1) % V))],
  [
    'гъста',
    NODES.flatMap((_, i) =>
      NODES.map((_, j) => j)
        .filter(j => j > i && DIST[i][j] < 165)
        .map(j => key(i, j))
    ),
  ],
];

/** Транспортна мрежа като граф: индекси β, γ, α, диаметър и коефициент на заобикаляне. */
export default function NetworkLab() {
  const [edges, setEdges] = useState<string[]>(PRESETS[1][1]);
  const [sel, setSel] = useState<number | null>(null);
  const clip = useId();

  const click = (i: number) => {
    if (sel === null) return setSel(i);
    if (sel !== i) {
      const k = key(sel, i);
      setEdges(edges.includes(k) ? edges.filter(e => e !== k) : [...edges, k]);
    }
    setSel(null);
  };

  // Най-къси пътища (Флойд–Уоршал) по километри и по брой връзки
  const km = NODES.map((_, i) => NODES.map((_, j) => (i === j ? 0 : Infinity)));
  const hops = NODES.map((_, i) => NODES.map((_, j) => (i === j ? 0 : Infinity)));
  for (const e of edges) {
    const [i, j] = e.split('-').map(Number);
    km[i][j] = km[j][i] = DIST[i][j];
    hops[i][j] = hops[j][i] = 1;
  }
  for (let k = 0; k < V; k++)
    for (let i = 0; i < V; i++)
      for (let j = 0; j < V; j++) {
        if (km[i][k] + km[k][j] < km[i][j]) km[i][j] = km[i][k] + km[k][j];
        if (hops[i][k] + hops[k][j] < hops[i][j]) hops[i][j] = hops[i][k] + hops[k][j];
      }

  // Свързани компоненти
  const seen = new Set<number>();
  let parts = 0;
  for (let s = 0; s < V; s++) {
    if (seen.has(s)) continue;
    parts++;
    for (let j = 0; j < V; j++) if (hops[s][j] < Infinity) seen.add(j);
  }
  const e = edges.length;
  const beta = e / V;
  const gamma = e / (3 * (V - 2));
  const alpha = Math.max(0, e - V + parts) / (2 * V - 5);
  const connected = parts === 1;
  let diam = 0;
  let detour = 0;
  for (let i = 0; i < V; i++)
    for (let j = i + 1; j < V; j++) {
      diam = Math.max(diam, hops[i][j]);
      detour += km[i][j] / DIST[i][j];
    }
  detour /= (V * (V - 1)) / 2;
  const length = edges.reduce((s, k) => {
    const [i, j] = k.split('-').map(Number);
    return s + DIST[i][j];
  }, 0);
  const fromSofia = connected ? Math.max(...km[0]) : Infinity;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id={clip}>
            <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={6} />
          </clipPath>
        </defs>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={6} className="fill-sky-100 dark:fill-sky-950" />
        <path d={LAND} clipPath={`url(#${clip})`} className="fill-stone-100 stroke-stone-400 dark:fill-stone-800 dark:stroke-stone-600" strokeWidth="0.6" />
        <text x={MAP.x + 4} y={MAP.y - 7} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          {sel === null ? 'Щракни два града, за да добавиш или махнеш връзка' : `${NODES[sel].name} → щракни втори град`}
        </text>

        {edges.map(k => {
          const [i, j] = k.split('-').map(Number);
          return (
            <line key={k} x1={PTS[i].x} y1={PTS[i].y} x2={PTS[j].x} y2={PTS[j].y} className="stroke-violet-500" strokeWidth="3" strokeLinecap="round" />
          );
        })}
        {NODES.map((n, i) => (
          <g key={n.name} className="cursor-pointer" onClick={() => click(i)}>
            <circle cx={PTS[i].x} cy={PTS[i].y} r={16} fill="transparent" />
            <circle
              cx={PTS[i].x}
              cy={PTS[i].y}
              r={sel === i ? 8 : 6}
              className={sel === i ? 'fill-rose-500 stroke-rose-800' : 'fill-sky-600 stroke-white dark:stroke-gray-900'}
              strokeWidth="1.5"
            />
            <text
              x={PTS[i].x + (n.dx ?? 0)}
              y={PTS[i].y + (n.dy ?? -12)}
              fontSize="10"
              textAnchor="middle"
              className="fill-gray-800 dark:fill-gray-100 pointer-events-none"
            >
              {n.name}
            </text>
          </g>
        ))}

        {/* Показатели */}
        {(
          [
            ['възли v', String(V)],
            ['връзки e', String(e)],
            ['части p', String(parts)],
            ['β = e / v', fmt(beta, 2)],
            ['γ = e / 3(v − 2)', fmt(gamma, 2)],
            ['α (затворени кръгове)', fmt(alpha, 2)],
            ['диаметър (връзки)', connected ? String(diam) : '∞'],
            ['заобикаляне', connected ? fmt(detour, 2) : '—'],
            ['обща дължина', `${fmt(length)} km`],
            ['най-далечно от София', connected ? `${fmt(fromSofia)} km` : '—'],
          ] as [string, string][]
        ).map(([label, value], k) => (
          <g key={label}>
            <text x={420} y={34 + k * 24} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
              {label}
            </text>
            <text x={630} y={34 + k * 24} fontSize="11" textAnchor="end" className="fill-gray-900 dark:fill-gray-100 font-medium">
              {value}
            </text>
          </g>
        ))}
      </LabSvg>
      <Buttons>
        {PRESETS.map(([name, list]) => (
          <DiagramButton
            key={name}
            active={list.length === edges.length && list.every(k => edges.includes(k))}
            onClick={() => {
              setEdges(list);
              setSel(null);
            }}
          >
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Връзките са по права линия между градовете. Заобикаляне – средно колко пъти пътят по мрежата е по-дълъг от разстоянието по права (1 = идеално).
        Диаметър – колко връзки има по пътя между двата най-отдалечени един от друг града.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'вид', value: !connected ? 'несвързана' : e === V - 1 ? 'дърво' : 'с кръгове', tone: connected ? 'emerald' : 'rose' },
            { label: 'β', value: fmt(beta, 2), tone: 'violet' },
            { label: 'заобикаляне', value: connected ? fmt(detour, 2) : '—', tone: 'amber' },
            { label: 'дължина', value: `${fmt(length)} km`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={connected ? (e === V - 1 ? 'amber' : 'emerald') : 'rose'}>
        {!connected
          ? 'Мрежата не е свързана – от някои градове до други изобщо не може да се стигне.'
          : e === V - 1
            ? 'Дърво: β < 1 и няма затворени кръгове. Мрежата е най-евтина, но ако се прекъсне една връзка, тя се разпада.'
            : beta >= 1.4
              ? 'Гъста мрежа: пътищата са почти по права, но строежът и поддръжката струват много.'
              : 'Има кръгове: ако една връзка се прекъсне, има обиколен път.'}
      </Note>
    </div>
  );
}
