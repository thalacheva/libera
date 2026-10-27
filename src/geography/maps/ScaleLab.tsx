import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt, greatCircleKm, rad, type LatLon } from '../geo';
import { REGION_LAND } from '../balkansLand';

const W = 640;
const H = 360;
/** Една единица от чертежа е 0,25 mm на „хартията“ – картата е отпечатана 16 × 9 cm. */
const MM_PER_UNIT = 0.25;
const CENTER: LatLon = { lat: 42.4, lon: 25.4 };
const KM_PER_DEG = 111.19;

const SCALES = [4_000_000, 8_000_000, 16_000_000, 32_000_000];

const PLACES: (LatLon & { name: string; bg?: boolean })[] = [
  { name: 'София', lat: 42.7, lon: 23.32, bg: true },
  { name: 'Пловдив', lat: 42.14, lon: 24.75, bg: true },
  { name: 'Варна', lat: 43.21, lon: 27.91, bg: true },
  { name: 'Бургас', lat: 42.5, lon: 27.47, bg: true },
  { name: 'Русе', lat: 43.85, lon: 25.97, bg: true },
  { name: 'Видин', lat: 43.99, lon: 22.88, bg: true },
  { name: 'Благоевград', lat: 42.02, lon: 23.1, bg: true },
  { name: 'В. Търново', lat: 43.08, lon: 25.63, bg: true },
  { name: 'Букурещ', lat: 44.43, lon: 26.1 },
  { name: 'Истанбул', lat: 41.01, lon: 28.98 },
  { name: 'Солун', lat: 40.64, lon: 22.94 },
  { name: 'Белград', lat: 44.79, lon: 20.45 },
  { name: 'Скопие', lat: 42.0, lon: 21.43 },
  { name: 'Атина', lat: 37.98, lon: 23.73 },
  { name: 'Анкара', lat: 39.93, lon: 32.86 },
  { name: 'Будапеща', lat: 47.5, lon: 19.04 },
  { name: 'Виена', lat: 48.21, lon: 16.37 },
  { name: 'Рим', lat: 41.9, lon: 12.5 },
  { name: 'Киев', lat: 50.45, lon: 30.52 },
  { name: 'Берлин', lat: 52.52, lon: 13.4 },
  { name: 'Кайро', lat: 30.04, lon: 31.24 },
];

/** Кръгла дължина за мащабната линийка (1, 2 или 5 · 10ⁿ km), около 1/5 от ширината. */
function niceKm(target: number) {
  const p = 10 ** Math.floor(Math.log10(target));
  return [1, 2, 5, 10].map(m => m * p).filter(v => v <= target).pop() ?? p;
}

const nameOf = (n: number) => `1 : ${n.toLocaleString('bg-BG')}`;

/** Мащаб: една и съща карта при различен мащаб и линийка за измерване. */
export default function ScaleLab() {
  const [n, setN] = useState(8_000_000);
  const [ends, setEnds] = useState<LatLon[]>([PLACES[0], PLACES[2]]);
  const [drag, setDrag] = useState<number | null>(null);
  const clip = useId();

  // Колко km е една единица от чертежа при мащаб 1 : n
  const kmPerUnit = (MM_PER_UNIT * n) / 1e6;
  const cosF = Math.cos(rad(CENTER.lat));
  const toXY = (q: LatLon) => ({
    x: W / 2 + ((q.lon - CENTER.lon) * KM_PER_DEG * cosF) / kmPerUnit,
    y: H / 2 - ((q.lat - CENTER.lat) * KM_PER_DEG) / kmPerUnit,
  });
  const fromXY = (x: number, y: number): LatLon => ({
    lat: CENTER.lat - ((y - H / 2) * kmPerUnit) / KM_PER_DEG,
    lon: CENTER.lon + ((x - W / 2) * kmPerUnit) / (KM_PER_DEG * cosF),
  });

  const land = REGION_LAND.map(ring => {
    let d = '';
    for (let i = 0; i < ring.length; i += 2) {
      const p = toXY({ lat: ring[i + 1] / 100, lon: ring[i] / 100 });
      d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    return d + 'Z';
  }).join('');

  const [a, b] = ends.map(toXY);
  const mapCm = (Math.hypot(b.x - a.x, b.y - a.y) * MM_PER_UNIT) / 10;
  const realKm = greatCircleKm(ends[0], ends[1]);
  const kmPerCm = n / 100_000;
  const barKm = niceKm((W / 5) * kmPerUnit);
  const barLen = barKm / kmPerUnit;

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag === null) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const q = fromXY(Math.max(4, Math.min(W - 4, p.x)), Math.max(4, Math.min(H - 4, p.y)));
    setEnds(prev => prev.map((v, i) => (i === drag ? q : v)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <clipPath id={clip}>
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
        <rect x={0} y={0} width={W} height={H} className="fill-sky-100 dark:fill-slate-900" />
        <path d={land} clipPath={`url(#${clip})`} fillRule="evenodd" className="fill-emerald-100 stroke-emerald-600/60 dark:fill-emerald-900/60 dark:stroke-emerald-600/50" strokeWidth="0.8" />
        {PLACES.map(p => {
          const q = toXY(p);
          if (q.x < 2 || q.x > W - 2 || q.y < 2 || q.y > H - 2) return null;
          // При дребен мащаб пишем само столиците, за да не се застъпват имената
          const label = n <= 8_000_000 || !p.bg || p.name === 'София';
          return (
            <g key={p.name}>
              <circle cx={q.x} cy={q.y} r={p.bg ? 3 : 2.5} className={p.bg ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-700 dark:fill-gray-300'} />
              {label && (
                <text x={q.x + 5} y={q.y - 4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
                  {p.name}
                </text>
              )}
            </g>
          );
        })}
        {/* Линийката */}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" />
        {[a, b].map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={9}
            className="fill-fuchsia-500/30 stroke-fuchsia-600 dark:stroke-fuchsia-400 cursor-grab"
            strokeWidth="2"
            style={{ touchAction: 'none' }}
            onPointerDown={e => {
              e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
              setDrag(i);
            }}
          />
        ))}
        {/* Мащабна линийка и числен мащаб */}
        <g transform={`translate(14 ${H - 22})`}>
          <rect x={-6} y={-30} width={Math.max(barLen, 120) + 12} height={46} rx={6} className="fill-white/85 dark:fill-gray-900/85" />
          <text x={0} y={-15} fontSize="12" fontWeight="bold" className="fill-gray-800 dark:fill-gray-100">
            {nameOf(n)}
          </text>
          <rect x={0} y={-6} width={barLen / 2} height={6} className="fill-gray-800 dark:fill-gray-100" />
          <rect x={barLen / 2} y={-6} width={barLen / 2} height={6} className="fill-white stroke-gray-800 dark:fill-gray-900 dark:stroke-gray-100" strokeWidth="1" />
          <text x={0} y={12} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
            0
          </text>
          <text x={barLen} y={12} fontSize="10" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
            {fmt(barKm)} km
          </text>
        </g>
      </LabSvg>

      <Buttons>
        {SCALES.map(s => (
          <DiagramButton key={s} active={n === s} onClick={() => setN(s)}>
            {nameOf(s)}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Влачи краищата на линийката. Картата е отпечатана широка 16 cm.</p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'в 1 cm', value: `${fmt(kmPerCm)} km` },
            { label: 'на картата', value: `${fmt(mapCm, 2)} cm`, tone: 'rose' },
            { label: 'по мащаба', value: `${fmt(mapCm * kmPerCm)} km` },
            { label: 'по сферата', value: `${fmt(realKm)} km`, tone: 'emerald' },
          ]}
        />
      </div>
    </div>
  );
}
