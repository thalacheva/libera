import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { REGION_LAND } from '../balkansLand';
import { fmt, greatCircleKm, rad, type LatLon } from '../geo';

/** Скорости на P и S вълните в земната кора, km/s. */
const VP = 6;
const VS = 3.5;
/** Разстояние на секунда разлика S − P: vP·vS/(vP − vS) = 8,4 km/s. */
const K = (VP * VS) / (VP - VS);

// Картата: местна равнопромежутъчна проекция около България
const MAP = { x: 8, y: 8, w: 330, h: 330 };
const LON0 = 18.5;
const LON1 = 31;
const LAT1 = 47.5;
const COS = Math.cos(rad(42.7));
const PX_PER_DEG = MAP.w / (LON1 - LON0);
const toXY = (q: LatLon) => ({ x: MAP.x + (q.lon - LON0) * PX_PER_DEG, y: MAP.y + (LAT1 - q.lat) * PX_PER_DEG / COS });
const fromXY = (x: number, y: number): LatLon => ({ lon: LON0 + (x - MAP.x) / PX_PER_DEG, lat: LAT1 - ((y - MAP.y) * COS) / PX_PER_DEG });
const KM_PER_PX = (111.19 * COS) / PX_PER_DEG;

const STATIONS: (LatLon & { name: string; color: string; stroke: string })[] = [
  { name: 'София', lat: 42.7, lon: 23.32, color: 'fill-sky-600', stroke: 'stroke-sky-600' },
  { name: 'Букурещ', lat: 44.43, lon: 26.1, color: 'fill-amber-600', stroke: 'stroke-amber-600' },
  { name: 'Солун', lat: 40.64, lon: 22.94, color: 'fill-violet-600', stroke: 'stroke-violet-600' },
];

/** Огнищата са приблизителни – за упражнение, не за справка. */
const QUAKES: (LatLon & { name: string; depth: number })[] = [
  { name: 'Кресна, 1904', lat: 41.8, lon: 23.15, depth: 15 },
  { name: 'Пловдив, 1928', lat: 42.15, lon: 24.95, depth: 15 },
  { name: 'Вранча, 1977', lat: 45.77, lon: 26.76, depth: 90 },
  { name: 'Егейско море', lat: 39.8, lon: 25.5, depth: 12 },
];

const LAND = REGION_LAND.map(ring => {
  let d = '';
  for (let i = 0; i < ring.length; i += 2) {
    const p = toXY({ lon: ring[i] / 100, lat: ring[i + 1] / 100 });
    d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d + 'Z';
}).join('');

// Сеизмограмите
const TR = { x: 370, w: 255, t: 200 };
const TRACE_Y = [70, 170, 270];
const hash = (i: number) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** Синтетична сеизмограма: шум, после P вълна и по-силна S вълна, които затихват. */
function trace(tp: number, ts: number, amp: number, seed: number) {
  let d = '';
  for (let k = 0; k <= 400; k++) {
    const t = (k / 400) * TR.t;
    let v = (hash(k + seed * 1000) - 0.5) * 0.08;
    if (t > tp) v += 0.35 * amp * Math.exp(-(t - tp) / 12) * Math.sin(2 * Math.PI * 1.1 * t + seed);
    if (t > ts) v += amp * Math.exp(-(t - ts) / 18) * Math.sin(2 * Math.PI * 0.6 * t + 2 * seed);
    d += `${k ? 'L' : 'M'}${(TR.x + (t / TR.t) * TR.w).toFixed(1)} ${(-Math.max(-1.3, Math.min(1.3, v)) * 30).toFixed(1)}`;
  }
  return d;
}

/** Намиране на епицентъра по разликата във времената на S и P вълните в три станции. */
export default function EpicenterLab() {
  const [q, setQ] = useState(0);
  const [guess, setGuess] = useState<LatLon | null>(null);
  const [circles, setCircles] = useState(false);
  const clip = useId();
  const quake = QUAKES[q];

  const data = STATIONS.map((s, i) => {
    const epi = greatCircleKm(quake, s);
    const hypo = Math.hypot(epi, quake.depth);
    const tp = hypo / VP;
    const ts = hypo / VS;
    return { ...s, epi, tp, ts, dt: ts - tp, r: (ts - tp) * K, path: trace(tp, ts, Math.min(1.2, 160 / (hypo + 40)), i + 3 * q) };
  });
  const epiXY = toXY(quake);
  const err = guess ? greatCircleKm(guess, quake) : null;

  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.x < MAP.x || p.x > MAP.x + MAP.w || p.y < MAP.y || p.y > MAP.y + MAP.h) return;
    setGuess(fromXY(p.x, p.y));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 346" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 cursor-crosshair" onClick={click}>
        <clipPath id={clip}>
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} />
        </clipPath>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} className="fill-sky-100 dark:fill-slate-900" />
        <g clipPath={`url(#${clip})`}>
          <path d={LAND} fillRule="evenodd" className="fill-emerald-100 stroke-emerald-600/60 dark:fill-emerald-900/60 dark:stroke-emerald-600/50" strokeWidth="0.8" />
          {circles &&
            data.map(s => {
              const c = toXY(s);
              return <circle key={s.name} cx={c.x} cy={c.y} r={s.r / KM_PER_PX} fill="none" className={s.stroke} strokeWidth="2" />;
            })}
          {circles && (
            <g>
              <circle cx={epiXY.x} cy={epiXY.y} r={6} className="fill-red-600 stroke-white" strokeWidth="1.5" />
              <text x={epiXY.x + 8} y={epiXY.y - 6} fontSize="11" fontWeight="bold" className="fill-red-700 dark:fill-red-300">
                епицентър
              </text>
            </g>
          )}
          {guess && (
            <g>
              <line x1={toXY(guess).x - 7} y1={toXY(guess).y - 7} x2={toXY(guess).x + 7} y2={toXY(guess).y + 7} className="stroke-fuchsia-700 dark:stroke-fuchsia-300" strokeWidth="2.5" />
              <line x1={toXY(guess).x - 7} y1={toXY(guess).y + 7} x2={toXY(guess).x + 7} y2={toXY(guess).y - 7} className="stroke-fuchsia-700 dark:stroke-fuchsia-300" strokeWidth="2.5" />
            </g>
          )}
        </g>
        {data.map(s => {
          const c = toXY(s);
          return (
            <g key={s.name}>
              <path d={`M${c.x} ${c.y - 7} L${c.x + 6} ${c.y + 4} L${c.x - 6} ${c.y + 4} Z`} className={s.color} />
              <text x={c.x + 8} y={c.y + 4} fontSize="11" fontWeight="bold" className="fill-gray-800 dark:fill-gray-100">
                {s.name}
              </text>
            </g>
          );
        })}
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} fill="none" className="stroke-gray-400" />
        <g transform={`translate(${MAP.x + 10} ${MAP.y + MAP.h - 12})`}>
          <line x1={0} y1={0} x2={100 / KM_PER_PX} y2={0} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="3" />
          <text x={50 / KM_PER_PX} y={-5} fontSize="10" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
            100 km
          </text>
        </g>

        {/* Сеизмограмите */}
        {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(t => (
          <g key={t}>
            <line x1={TR.x + (t / TR.t) * TR.w} y1={22} x2={TR.x + (t / TR.t) * TR.w} y2={312} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={t % 100 === 0 ? 1 : 0.6} />
            {t % 40 === 0 && (
              <text x={TR.x + (t / TR.t) * TR.w} y={326} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {t}
              </text>
            )}
          </g>
        ))}
        <text x={TR.x + TR.w / 2} y={341} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          секунди след началото на земетресението
        </text>
        {data.map((s, i) => (
          <g key={s.name} transform={`translate(0 ${TRACE_Y[i]})`}>
            <text x={TR.x} y={-36} fontSize="11" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
              {s.name}
            </text>
            <path d={s.path} fill="none" className={s.stroke} strokeWidth="1" />
            {(
              [
                ['P', s.tp],
                ['S', s.ts],
              ] as [string, number][]
            ).map(([w, t]) => (
              <g key={w}>
                <line x1={TR.x + (t / TR.t) * TR.w} y1={-30} x2={TR.x + (t / TR.t) * TR.w} y2={30} className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="1" strokeDasharray="2 2" />
                <text x={TR.x + (t / TR.t) * TR.w + 2} y={-22} fontSize="10" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
                  {w}
                </text>
              </g>
            ))}
          </g>
        ))}
      </LabSvg>

      <Buttons>
        {QUAKES.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={q === i}
            onClick={() => {
              setQ(i);
              setGuess(null);
              setCircles(false);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Отчети разликата S − P на всяка сеизмограма, умножи по 8,4 km/s и щракни по картата там, където мислиш, че е епицентърът.
      </p>
      <Buttons>
        <DiagramButton active={circles} onClick={() => setCircles(!circles)}>
          ⭕ Покажи окръжностите и епицентъра
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            ...data.map(s => ({ label: s.name, value: circles ? `S − P = ${fmt(s.dt, 1)} s → ${fmt(s.r)} km` : 'S − P = ?' })),
            { label: 'твоята грешка', value: err === null ? 'щракни по картата' : `${fmt(err)} km`, tone: 'rose' as const },
          ]}
        />
      </div>
    </div>
  );
}
