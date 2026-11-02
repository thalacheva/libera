import { useEffect, useId, useMemo, useRef, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import {
  BULGARIA,
  RELIEF,
  RIVERS,
  bgProjection,
  hypso,
  inBulgaria,
  reliefGrid,
  reliefImage,
} from './bulgariaShape';

/** Накъде излиза водата от правоъгълника на релефа. */
type Outlet = 'sea' | 'N' | 'W' | 'WS' | 'S' | 'E';
const BLACK: Outlet[] = ['sea', 'N', 'W', 'E'];
const OUTLET_TEXT: Record<Outlet, string> = {
  sea: 'направо в Черно море',
  N: 'по Дунав до Черно море',
  W: 'през Сърбия (Морава) до Дунав и Черно море',
  E: 'до Черно море',
  WS: 'през Северна Македония (Вардар) до Бяло море',
  S: 'до Бяло (Егейско) море',
};

/** Данни за главните реки – дължините са закръглени и зависят от това кой приток се смята за начало. */
const RIVER_INFO: Record<
  string,
  { total: string; inBg: string; sea: 'Черно' | 'Бяло'; note: string }
> = {
  Дунав: {
    total: '≈ 2850 km',
    inBg: '≈ 470 km (граница с Румъния)',
    sea: 'Черно',
    note: 'втората по дължина река в Европа; събира водите на цяла Северна България',
  },
  Искър: {
    total: '368 km',
    inBg: 'изцяло',
    sea: 'Черно',
    note: 'най-дългата река изцяло в България; извира от Рила и пресича Стара планина в пролом',
  },
  Огоста: {
    total: '≈ 141 km',
    inBg: 'изцяло',
    sea: 'Черно',
    note: 'приток на Дунав в Северозападна България; язовир „Огоста“',
  },
  Янтра: {
    total: '≈ 285 km',
    inBg: 'изцяло',
    sea: 'Черно',
    note: 'извира от Стара планина и прави големи меандри при Велико Търново',
  },
  Камчия: {
    total: '≈ 245 km',
    inBg: 'изцяло',
    sea: 'Черно',
    note: 'най-голямата река, която се влива направо в Черно море от българския бряг',
  },
  Марица: {
    total: '≈ 472 km',
    inBg: '≈ 321 km',
    sea: 'Бяло',
    note: 'извира от Рила и тече през Горнотракийската низина; най-пълноводната ни река',
  },
  Тунджа: {
    total: '≈ 390 km',
    inBg: '≈ 350 km',
    sea: 'Бяло',
    note: 'тече през Казанлъшката котловина и се влива в Марица в Турция',
  },
  Арда: {
    total: '≈ 272 km',
    inBg: '≈ 241 km',
    sea: 'Бяло',
    note: 'най-голямата река в Родопите; каскада от язовири – Кърджали, Студен кладенец, Ивайловград',
  },
  Струма: {
    total: '≈ 415 km',
    inBg: '≈ 290 km',
    sea: 'Бяло',
    note: 'извира от Витоша и тече на юг през котловини и проломи (Кресненския)',
  },
  Места: {
    total: '≈ 230 km',
    inBg: '≈ 126 km',
    sea: 'Бяло',
    note: 'извира от Рила и тече между Пирин и Родопите',
  },
};

const { nx, ny, d: D, lon0, lat1 } = RELIEF;
const NB = [-1, 0, 1].flatMap(dj =>
  [-1, 0, 1].filter(di => di || dj).map(di => [di, dj])
);

/**
 * Насочване на оттока: реките се „врязват“ с 150 m (иначе мрежата през 4 km не вижда проломите),
 * падините се запълват с приоритетна опашка, а всяка клетка сочи към съседа, от който е достигната.
 */
function route() {
  const z = Float32Array.from(reliefGrid());
  const river = new Array<string | null>(nx * ny).fill(null);
  for (const [name, parts] of Object.entries(RIVERS))
    for (const p of parts)
      for (let i = 0; i + 3 < p.length; i += 2) {
        const [x1, y1, x2, y2] = [
          p[i] / 100,
          p[i + 1] / 100,
          p[i + 2] / 100,
          p[i + 3] / 100,
        ];
        const n = Math.max(
          1,
          Math.ceil((Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / D) * 3)
        );
        for (let t = 0; t <= n; t++) {
          const ci = Math.round((x1 + ((x2 - x1) * t) / n - lon0) / D);
          const cj = Math.round((lat1 - (y1 + ((y2 - y1) * t) / n)) / D);
          if (ci < 0 || cj < 0 || ci >= nx || cj >= ny) continue;
          const k = cj * nx + ci;
          if (river[k] === null) {
            river[k] = name;
            z[k] -= 150;
          }
        }
      }

  const down = new Int32Array(nx * ny).fill(-1);
  const outlet = new Array<Outlet>(nx * ny);
  const done = new Uint8Array(nx * ny);
  // двоична пирамида от [височина, клетка]
  const heap: [number, number][] = [];
  const push = (h: number, k: number) => {
    heap.push([h, k]);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };

  for (let k = 0; k < nx * ny; k++) {
    const i = k % nx;
    const j = (k - i) / nx;
    const sea = z[k] <= 0 && lon0 + i * D > 27.3;
    if (sea || i === 0 || j === 0 || i === nx - 1 || j === ny - 1) {
      done[k] = 1;
      outlet[k] = sea
        ? 'sea'
        : j === 0
          ? 'N'
          : j === ny - 1
            ? 'S'
            : i === 0
              ? lat1 - j * D > 42.3
                ? 'W'
                : 'WS'
              : 'E';
      push(z[k], k);
    }
  }
  while (heap.length) {
    const [h, k] = pop();
    const i = k % nx;
    const j = (k - i) / nx;
    for (const [di, dj] of NB) {
      const a = i + di;
      const b = j + dj;
      if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
      const m = b * nx + a;
      if (done[m]) continue;
      done[m] = 1;
      down[m] = k;
      outlet[m] = outlet[k];
      push(Math.max(z[m], h + 0.01), m);
    }
  }

  // Дял на двата басейна в България
  let total = 0;
  let black = 0;
  for (let k = 0; k < nx * ny; k++) {
    const i = k % nx;
    const j = (k - i) / nx;
    if (!inBulgaria(lon0 + i * D, lat1 - j * D)) continue;
    total++;
    if (BLACK.includes(outlet[k])) black++;
  }
  return { down, outlet, river, blackShare: black / total };
}

const MAP = bgProjection(20, 8, 600);
const OUTLINE = MAP.path(BULGARIA, true);
const cellOf = (lon: number, lat: number) =>
  Math.round((lat1 - lat) / D) * nx + Math.round((lon - lon0) / D);
const cellLon = (k: number) => lon0 + (k % nx) * D;
const cellLat = (k: number) => lat1 - Math.floor(k / nx) * D;

/** „Капка дъжд“: накъде тече водата от всяка точка на България – към Черно или към Бяло море. */
export default function DropLab() {
  const flow = useMemo(route, []);
  const [drop, setDrop] = useState<{ lon: number; lat: number }>({
    lon: 23.32,
    lat: 42.69,
  });
  const [basins, setBasins] = useState(true);
  const [riverSel, setRiverSel] = useState<string | null>(null);
  const [imgs, setImgs] = useState<{ plain: string; basins: string }>({
    plain: '',
    basins: '',
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const clip = useId();

  useEffect(() => {
    const plain = reliefImage(300, 200);
    const tinted = reliefImage(300, 200, (lon, lat, z) => {
      const base = hypso(z);
      const black = BLACK.includes(flow.outlet[cellOf(lon, lat)]);
      const tint: [number, number, number] = black
        ? [70, 130, 220]
        : [60, 175, 120];
      return [0, 1, 2].map(i => 0.45 * base[i] + 0.55 * tint[i]) as [
        number,
        number,
        number,
      ];
    });
    setImgs({ plain, basins: tinted });
  }, [flow]);

  // Пътят на капката
  const path: number[] = [];
  for (
    let k = cellOf(drop.lon, drop.lat);
    k >= 0 && path.length < 2000;
    k = flow.down[k]
  )
    path.push(k);
  const end = path[path.length - 1];
  const out = flow.outlet[end];
  const rivers: string[] = [];
  for (const k of path) {
    const r = flow.river[k];
    if (r && rivers[rivers.length - 1] !== r && !rivers.includes(r))
      rivers.push(r);
  }
  const toBlack = BLACK.includes(out);
  let lenKm = 0;
  for (let i = 1; i < path.length; i++) {
    const dx =
      (cellLon(path[i]) - cellLon(path[i - 1])) *
      111.32 *
      Math.cos((42.7 * Math.PI) / 180);
    const dy = (cellLat(path[i]) - cellLat(path[i - 1])) * 111.32;
    lenKm += Math.hypot(dx, dy);
  }
  const line = path
    .map(
      (k, i) =>
        `${i ? 'L' : 'M'}${MAP.x(cellLon(k)).toFixed(1)} ${MAP.y(cellLat(k)).toFixed(1)}`
    )
    .join('');
  const start = reliefGrid()[path[0]];

  const click = (e: React.PointerEvent<SVGSVGElement>) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const lon = MAP.lon(p.x);
    const lat = MAP.lat(p.y);
    if (inBulgaria(lon, lat)) {
      setDrop({ lon, lat });
      setRiverSel(null);
    }
  };

  const info = riverSel ? RIVER_INFO[riverSel] : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        ref={svgRef}
        viewBox={`0 0 640 ${MAP.h + 16}`}
        className="w-full h-auto block select-none cursor-crosshair text-gray-800 dark:text-gray-100"
        onPointerDown={click}
      >
        <defs>
          <clipPath id={clip}>
            <path d={OUTLINE} />
          </clipPath>
          <clipPath id={`${clip}r`}>
            <rect x={20} y={8} width={MAP.w} height={MAP.h} rx={6} />
          </clipPath>
        </defs>
        <rect
          x={20}
          y={8}
          width={MAP.w}
          height={MAP.h}
          rx={6}
          className="fill-gray-100 dark:fill-gray-900"
        />
        {imgs.plain && (
          <>
            <image
              href={imgs.plain}
              x={20}
              y={8}
              width={MAP.w}
              height={MAP.h}
              preserveAspectRatio="none"
              opacity={0.3}
            />
            <image
              href={basins ? imgs.basins : imgs.plain}
              x={20}
              y={8}
              width={MAP.w}
              height={MAP.h}
              preserveAspectRatio="none"
              clipPath={`url(#${clip})`}
            />
          </>
        )}
        <g clipPath={`url(#${clip}r)`}>
          {Object.entries(RIVERS).map(([name, parts]) =>
            parts.map((p, i) => (
              <path
                key={`${name}${i}`}
                d={MAP.path(p)}
                fill="none"
                className={
                  riverSel === name
                    ? 'stroke-yellow-300'
                    : rivers.includes(name)
                      ? 'stroke-rose-500'
                      : RIVER_INFO[name].sea === 'Черно'
                        ? 'stroke-blue-800 dark:stroke-blue-300'
                        : 'stroke-emerald-900 dark:stroke-emerald-300'
                }
                strokeWidth={
                  riverSel === name ? 4 : name === 'Дунав' ? 2.5 : 1.6
                }
              />
            ))
          )}
          <path
            d={OUTLINE}
            fill="none"
            className="stroke-gray-800 dark:stroke-gray-100"
            strokeWidth="1.2"
          />
          <path
            d={line}
            fill="none"
            className="stroke-rose-600"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />
        </g>
        <circle
          cx={MAP.x(drop.lon)}
          cy={MAP.y(drop.lat)}
          r={7}
          className="fill-sky-400 stroke-white"
          strokeWidth="2"
        />
        <text
          x={MAP.x(drop.lon)}
          y={MAP.y(drop.lat) - 11}
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-900 dark:fill-white pointer-events-none"
        >
          💧
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={basins} onClick={() => setBasins(!basins)}>
          {basins ? 'скрий басейните' : 'покажи басейните'}
        </DiagramButton>
        {Object.keys(RIVER_INFO).map(name => (
          <DiagramButton
            key={name}
            active={riverSel === name}
            onClick={() => setRiverSel(riverSel === name ? null : name)}
          >
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни където и да е в България – капката тръгва надолу по склона. В
        синьо е Черноморският водосборен басейн, в зелено – Беломорският.
        Релефът е от мрежа през около 4 km, затова близо до вододела пътят може
        да се отклони; реките са „врязани“ в релефа, за да се виждат проломите.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            {
              label: 'начало',
              value: `≈ ${fmt(Math.max(0, Math.round(start / 10) * 10))} m`,
              tone: 'amber',
            },
            {
              label: 'път до края на картата',
              value: `≈ ${fmt(lenKm)} km`,
              tone: 'blue',
            },
            {
              label: 'море',
              value: toBlack ? 'Черно' : 'Бяло',
              tone: toBlack ? 'blue' : 'emerald',
            },
            {
              label: 'Черноморски басейн',
              value: `${fmt(100 * flow.blackShare)}%`,
              tone: 'violet',
            },
          ]}
        />
      </div>
      <Note tone={toBlack ? 'blue' : 'emerald'}>
        Капката тече {rivers.length ? `по ${rivers.join(' → ')} и ` : ''}
        {toBlack && rivers.includes('Дунав')
          ? 'до Черно море'
          : OUTLET_TEXT[out]}
        .
      </Note>
      {info && riverSel && (
        <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
          <p className="font-semibold mb-1">
            {riverSel} –{' '}
            {info.sea === 'Черно' ? 'Черноморски басейн' : 'Беломорски басейн'}
          </p>
          <p>
            Дължина: {info.total}; в България: {info.inBg}.
          </p>
          <p>{info.note[0].toUpperCase() + info.note.slice(1)}.</p>
        </div>
      )}
    </div>
  );
}
