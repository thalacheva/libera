import { useEffect, useId, useRef, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt, greatCircleKm } from '../geo';
import {
  BULGARIA,
  RIVERS,
  bgProjection,
  reliefAt,
  reliefImage,
} from './bulgariaShape';

type P = { lat: number; lon: number };

/** Градове и върхове, които се надписват на профила, ако линията минава до 10 km от тях. */
const PLACES: (P & { name: string; peak?: boolean })[] = [
  { name: 'Видин', lat: 43.99, lon: 22.88 },
  { name: 'Монтана', lat: 43.41, lon: 23.23 },
  { name: 'Враца', lat: 43.21, lon: 23.55 },
  { name: 'Плевен', lat: 43.42, lon: 24.62 },
  { name: 'Русе', lat: 43.85, lon: 25.97 },
  { name: 'В. Търново', lat: 43.08, lon: 25.63 },
  { name: 'Габрово', lat: 42.87, lon: 25.32 },
  { name: 'Шумен', lat: 43.27, lon: 26.92 },
  { name: 'Варна', lat: 43.21, lon: 27.91 },
  { name: 'Бургас', lat: 42.5, lon: 27.47 },
  { name: 'Сливен', lat: 42.68, lon: 26.32 },
  { name: 'Ст. Загора', lat: 42.43, lon: 25.64 },
  { name: 'Казанлък', lat: 42.62, lon: 25.4 },
  { name: 'Пловдив', lat: 42.15, lon: 24.75 },
  { name: 'Хасково', lat: 41.93, lon: 25.56 },
  { name: 'Кърджали', lat: 41.65, lon: 25.37 },
  { name: 'Смолян', lat: 41.58, lon: 24.71 },
  { name: 'Благоевград', lat: 42.02, lon: 23.1 },
  { name: 'Сандански', lat: 41.57, lon: 23.28 },
  { name: 'Кюстендил', lat: 42.28, lon: 22.69 },
  { name: 'София', lat: 42.7, lon: 23.32 },
  { name: 'Ботевград', lat: 42.91, lon: 23.79 },
  { name: 'Самоков', lat: 42.34, lon: 23.56 },
  { name: 'Карлово', lat: 42.64, lon: 24.81 },
  { name: 'Мусала', lat: 42.18, lon: 23.585, peak: true },
  { name: 'Вихрен', lat: 41.768, lon: 23.4, peak: true },
  { name: 'Ботев', lat: 42.717, lon: 24.918, peak: true },
  { name: 'Черни връх', lat: 42.564, lon: 23.279, peak: true },
  { name: 'Голям Перелик', lat: 41.604, lon: 24.572, peak: true },
  { name: 'Богдан', lat: 42.62, lon: 24.47, peak: true },
];

const PRESETS: { name: string; a: P; b: P }[] = [
  {
    name: 'Русе → Кърджали',
    a: { lat: 43.84, lon: 25.95 },
    b: { lat: 41.63, lon: 25.38 },
  },
  {
    name: 'Видин → Сандански',
    a: { lat: 43.98, lon: 22.88 },
    b: { lat: 41.58, lon: 23.28 },
  },
  {
    name: 'София → Бургас',
    a: { lat: 42.7, lon: 23.32 },
    b: { lat: 42.5, lon: 27.45 },
  },
  {
    name: 'Самоков → Вихрен',
    a: { lat: 42.34, lon: 23.56 },
    b: { lat: 41.768, lon: 23.4 },
  },
];

/** Височинни пояси на растителността – приблизителни граници за северните склонове на Рила и Пирин. */
const BELTS: { top: number; name: string; cls: string }[] = [
  { top: 800, name: 'дъбови гори, поля', cls: 'fill-lime-500/70' },
  { top: 1500, name: 'букови гори', cls: 'fill-green-600/75' },
  { top: 2100, name: 'иглолистни гори', cls: 'fill-emerald-800/75' },
  { top: 2500, name: 'клек, субалпийски', cls: 'fill-amber-600/70' },
  { top: 9999, name: 'алпийски ливади, скали', cls: 'fill-stone-400/80' },
];
const beltOf = (h: number) => BELTS.findIndex(b => h < b.top);

/** Средна годишна температура: около 12,5 °C ниско долу и около 0,5 °C по-малко на всеки 100 m. */
const tempAt = (h: number) => 12.5 - (0.5 * Math.max(0, h)) / 100;

const MAP = bgProjection(20, 8, 600);
const G = { x: 52, y: MAP.h + 40, w: 540, h: 170 };
const N = 240;

const OUTLINE = MAP.path(BULGARIA, true);
const RIVER_PATHS = Object.values(RIVERS)
  .flat()
  .map(p => MAP.path(p));

/** Профил на релефа на България по права линия между две точки, с височинните пояси. */
export default function ReliefLab() {
  const [a, setA] = useState<P>(PRESETS[0].a);
  const [b, setB] = useState<P>(PRESETS[0].b);
  const [drag, setDrag] = useState<'a' | 'b' | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [img, setImg] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const clip = useId();

  // Картината на релефа се рисува веднъж, чак в браузъра
  useEffect(() => setImg(reliefImage(420, 280)), []);

  const total = greatCircleKm(a, b);
  const pts = Array.from({ length: N + 1 }, (_, k) => {
    const t = k / N;
    const lat = a.lat + t * (b.lat - a.lat);
    const lon = a.lon + t * (b.lon - a.lon);
    return { lat, lon, d: t * total, h: Math.max(0, reliefAt(lon, lat)) };
  });
  const hMax = Math.max(...pts.map(p => p.h));
  const top = Math.max(1000, Math.ceil(hMax / 500) * 500);
  const gx = (d: number) => G.x + (d / total) * G.w;
  const gy = (h: number) => G.y + G.h - (h / top) * G.h;

  // Стълбчета с цвета на пояса
  const bars = pts.slice(0, -1).map((p, k) => {
    const q = pts[k + 1];
    return {
      x: gx(p.d),
      w: gx(q.d) - gx(p.d) + 0.4,
      h: (p.h + q.h) / 2,
      belt: beltOf((p.h + q.h) / 2),
    };
  });
  const line = pts
    .map(
      (p, k) => `${k ? 'L' : 'M'}${gx(p.d).toFixed(1)} ${gy(p.h).toFixed(1)}`
    )
    .join('');

  // Места близо до линията
  const kmPerLon = 111.32 * Math.cos((42.7 * Math.PI) / 180);
  const ax = a.lon * kmPerLon;
  const ay = a.lat * 111.32;
  const vx = b.lon * kmPerLon - ax;
  const vy = b.lat * 111.32 - ay;
  const len2 = vx * vx + vy * vy || 1;
  const labels = PLACES.map(p => {
    const px = p.lon * kmPerLon - ax;
    const py = p.lat * 111.32 - ay;
    const t = (px * vx + py * vy) / len2;
    const dist = Math.abs(px * vy - py * vx) / Math.sqrt(len2);
    return { ...p, t, dist };
  })
    .filter(p => p.t > 0.01 && p.t < 0.99 && p.dist < (p.peak ? 7 : 10))
    .sort((p, q) => p.t - q.t);
  // Да не се застъпват: ако са твърде близо, вдигаме надписа по-нагоре
  let lastX = -99;
  let row = 0;
  const placed = labels.map(p => {
    const x = gx(p.t * total);
    row = x - lastX < 62 ? (row + 1) % 3 : 0;
    lastX = x;
    const h = pts[Math.round(p.t * N)].h;
    return { ...p, x, y: Math.max(G.y - 4, gy(h) - 8 - 12 * row) };
  });

  const toSvg = (e: React.PointerEvent) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e);
    if (!p) return;
    if (drag) {
      const x = Math.max(20, Math.min(20 + MAP.w, p.x));
      const y = Math.max(8, Math.min(8 + MAP.h, p.y));
      const q = { lat: MAP.lat(y), lon: MAP.lon(x) };
      if (drag === 'a') setA(q);
      else setB(q);
      return;
    }
    if (p.y > G.y - 10 && p.x >= G.x && p.x <= G.x + G.w)
      setHover(Math.round(((p.x - G.x) / G.w) * N));
    else setHover(null);
  };

  const hp = hover !== null ? pts[hover] : null;
  const top1 = pts.reduce((m, p) => (p.h > m.h ? p : m), pts[0]);
  const beltsHit = [...new Set(bars.map(s => s.belt))].sort();

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        ref={svgRef}
        viewBox={`0 0 640 ${G.y + G.h + 34}`}
        className="w-full h-auto block select-none touch-none text-gray-800 dark:text-gray-100"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => {
          setDrag(null);
          setHover(null);
        }}
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
        {img && (
          <>
            <image
              href={img}
              x={20}
              y={8}
              width={MAP.w}
              height={MAP.h}
              preserveAspectRatio="none"
              opacity={0.35}
            />
            <image
              href={img}
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
          {RIVER_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              className="stroke-sky-600/70"
              strokeWidth="1"
            />
          ))}
        </g>
        <path
          d={OUTLINE}
          fill="none"
          className="stroke-gray-700 dark:stroke-gray-200"
          strokeWidth="1.2"
        />

        {/* Линията на профила */}
        <line
          x1={MAP.x(a.lon)}
          y1={MAP.y(a.lat)}
          x2={MAP.x(b.lon)}
          y2={MAP.y(b.lat)}
          className="stroke-rose-600"
          strokeWidth="2.5"
        />
        {hp && (
          <circle
            cx={MAP.x(hp.lon)}
            cy={MAP.y(hp.lat)}
            r={4}
            className="fill-white stroke-rose-600"
            strokeWidth="2"
          />
        )}
        {(['a', 'b'] as const).map(k => {
          const q = k === 'a' ? a : b;
          return (
            <g key={k} className="cursor-grab" onPointerDown={() => setDrag(k)}>
              <circle
                cx={MAP.x(q.lon)}
                cy={MAP.y(q.lat)}
                r={16}
                fill="transparent"
              />
              <circle
                cx={MAP.x(q.lon)}
                cy={MAP.y(q.lat)}
                r={8}
                className="fill-rose-600 stroke-white"
                strokeWidth="2"
              />
              <text
                x={MAP.x(q.lon)}
                y={MAP.y(q.lat) + 3.5}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                className="fill-white pointer-events-none"
              >
                {k.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Профилът */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line
              x1={G.x}
              x2={G.x + G.w}
              y1={gy(f * top)}
              y2={gy(f * top)}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <text
              x={G.x - 6}
              y={gy(f * top) + 3}
              fontSize="9"
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400"
            >
              {fmt(f * top)}
            </text>
            <text
              x={G.x + G.w + 6}
              y={gy(f * top) + 3}
              fontSize="9"
              className="fill-sky-700 dark:fill-sky-400"
            >
              {fmt(tempAt(f * top), 1)}°
            </text>
          </g>
        ))}
        <text
          x={G.x - 6}
          y={G.y - 10}
          fontSize="9"
          textAnchor="end"
          className="fill-gray-500 dark:fill-gray-400"
        >
          m
        </text>
        <text
          x={G.x + G.w + 6}
          y={G.y - 10}
          fontSize="9"
          className="fill-sky-700 dark:fill-sky-400"
        >
          °C/год.
        </text>
        {bars.map((s, k) => (
          <rect
            key={k}
            x={s.x}
            y={gy(s.h)}
            width={s.w}
            height={G.y + G.h - gy(s.h)}
            className={BELTS[s.belt].cls}
          />
        ))}
        <path
          d={line}
          fill="none"
          className="stroke-gray-800 dark:stroke-gray-100"
          strokeWidth="1.3"
        />
        <line
          x1={G.x}
          x2={G.x + G.w}
          y1={G.y + G.h}
          y2={G.y + G.h}
          className="stroke-gray-500"
        />
        {Array.from(
          { length: Math.floor(total / 50) + 1 },
          (_, k) => k * 50
        ).map(d => (
          <text
            key={d}
            x={gx(d)}
            y={G.y + G.h + 13}
            fontSize="9"
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
          >
            {d}
          </text>
        ))}
        <text
          x={G.x + G.w}
          y={G.y + G.h + 26}
          fontSize="9"
          textAnchor="end"
          className="fill-gray-500 dark:fill-gray-400"
        >
          km от A
        </text>
        {placed.map(p => (
          <g key={p.name} className="pointer-events-none">
            <line
              x1={p.x}
              x2={p.x}
              y1={p.y + 2}
              y2={gy(pts[Math.round(p.t * N)].h)}
              className="stroke-gray-400"
              strokeDasharray="2 2"
            />
            <text
              x={p.x}
              y={p.y}
              fontSize="9"
              textAnchor="middle"
              className={
                p.peak
                  ? 'fill-amber-800 dark:fill-amber-300'
                  : 'fill-gray-700 dark:fill-gray-200'
              }
            >
              {p.peak ? '▲ ' : ''}
              {p.name}
            </text>
          </g>
        ))}
        {hp && (
          <g className="pointer-events-none">
            <line
              x1={gx(hp.d)}
              x2={gx(hp.d)}
              y1={G.y}
              y2={G.y + G.h}
              className="stroke-rose-600"
            />
            <circle
              cx={gx(hp.d)}
              cy={gy(hp.h)}
              r={3.5}
              className="fill-rose-600"
            />
          </g>
        )}
      </LabSvg>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={
              a.lat === p.a.lat &&
              a.lon === p.a.lon &&
              b.lat === p.b.lat &&
              b.lon === p.b.lon
            }
            onClick={() => {
              setA(p.a);
              setB(p.b);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
        {BELTS.map((s, i) => (
          <span
            key={s.name}
            className={`inline-flex items-center gap-1.5 ${beltsHit.includes(i) ? '' : 'opacity-40'}`}
          >
            <svg width="12" height="12" aria-hidden="true">
              <rect width="12" height="12" rx="2" className={s.cls} />
            </svg>
            {s.name} {i < BELTS.length - 1 ? `(до ${fmt(s.top)} m)` : ''}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Влачи точките A и B по картата или избери готов профил. Посочи профила,
        за да видиш височината и температурата. Релефът е от мрежа през около 4
        km (ETOPO1), затова върховете излизат по-ниски: Мусала е около 2540 m
        вместо 2925 m. Температурата е грубо приближение – около 12,5 °C ниско
        долу и с 0,5 °C по-малко на всеки 100 m. Границите на поясите са
        приблизителни и зависят от изложението на склона.
      </p>
      <div className="mt-3">
        <Readout
          items={
            hp
              ? [
                  {
                    label: 'разстояние',
                    value: `${fmt(hp.d)} km`,
                    tone: 'blue',
                  },
                  {
                    label: 'височина',
                    value: `≈ ${fmt(Math.round(hp.h / 10) * 10)} m`,
                    tone: 'amber',
                  },
                  {
                    label: 'ср. год. темп.',
                    value: `≈ ${fmt(tempAt(hp.h), 1)} °C`,
                    tone: 'rose',
                  },
                  {
                    label: 'пояс',
                    value: BELTS[beltOf(hp.h)].name,
                    tone: 'emerald',
                  },
                ]
              : [
                  { label: 'дължина', value: `${fmt(total)} km`, tone: 'blue' },
                  {
                    label: 'най-високо',
                    value: `≈ ${fmt(Math.round(top1.h / 10) * 10)} m`,
                    tone: 'amber',
                  },
                  {
                    label: 'на',
                    value: `${fmt(top1.d)} km от A`,
                    tone: 'amber',
                  },
                  { label: 'пояси', value: beltsHit.length, tone: 'emerald' },
                ]
          }
        />
      </div>
      <Note tone={hMax > 1500 ? 'violet' : 'emerald'}>
        {hMax > 2000
          ? `Профилът минава през високи планини: на няколко десетки километра се сменят ${beltsHit.length} пояса – от гори до клек и скали.`
          : hMax > 1200
            ? 'Профилът пресича планина: виж как над около 800 m дъбът отстъпва на бука, а по-нагоре – на иглолистните гори.'
            : 'По този профил няма високи планини – равнини, хълмове и котловини.'}
      </Note>
    </div>
  );
}
