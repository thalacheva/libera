import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { MOUNTAIN, contours, hypsoColor, levelsOf, sample } from '../terrain';

const M0 = 10;
const MS = 300;
/** Квадратът на картата е 8 × 8 km. */
const SIDE_KM = 8;
const EYE = 1.7;
// Профилът
const PX = 360;
const PW = 266;
const PY = 30;
const PH = 230;
const SAMPLES = 160;

type P = { x: number; y: number };

/** Профил по линия през въображаема планина: наклон и видимост. */
export default function ProfileLab() {
  const [ends, setEnds] = useState<P[]>([
    { x: 0.12, y: 0.6 },
    { x: 0.86, y: 0.2 },
  ]);
  const [drag, setDrag] = useState<number | null>(null);
  const [exag, setExag] = useState(2);

  const { lines, cells } = useMemo(() => {
    const grid = sample(MOUNTAIN, 70);
    const n = 35;
    return {
      lines: contours(grid, levelsOf(grid, 100)),
      cells: Array.from({ length: n * n }, (_, c) => ({ i: c % n, j: Math.floor(c / n), n, fill: hypsoColor(MOUNTAIN((c % n + 0.5) / n, (Math.floor(c / n) + 0.5) / n)) })),
    };
  }, []);

  const [a, b] = ends;
  const lenKm = Math.hypot(b.x - a.x, b.y - a.y) * SIDE_KM;
  const prof = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    return { t, h: MOUNTAIN(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)) };
  });
  const hs = prof.map(p => p.h);
  const hA = hs[0];
  const hB = hs[SAMPLES];
  const lo = Math.floor(Math.min(...hs) / 100) * 100 - 100;
  // Вертикален мащаб: exag пъти по-едър от хоризонталния
  const pxPerKm = PW / Math.max(lenKm, 0.5);
  const pxPerM = Math.min((pxPerKm / 1000) * exag, (PH - 10) / (Math.max(...hs) - lo));
  const px = (t: number) => PX + t * lenKm * pxPerKm;
  const py = (h: number) => PY + PH - (h - lo) * pxPerM;
  const realExag = pxPerM / (pxPerKm / 1000);

  // Наклони
  let maxSlope = 0;
  for (let i = 1; i <= SAMPLES; i++) maxSlope = Math.max(maxSlope, Math.abs(hs[i] - hs[i - 1]) / ((lenKm * 1000) / SAMPLES));
  const avg = lenKm > 0 ? (hB - hA) / (lenKm * 1000) : 0;

  // Видимост от A (очите на 1,7 m) до B
  const eye = hA + EYE;
  const target = hB + EYE;
  const blocked = prof.slice(1, -1).some(p => p.h > eye + (target - eye) * p.t);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag === null) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const q = { x: Math.max(0, Math.min(1, (p.x - M0) / MS)), y: Math.max(0, Math.min(1, (p.y - M0) / MS)) };
    setEnds(prev => prev.map((v, i) => (i === drag ? q : v)));
  };

  const area = prof.map((p, i) => `${i ? 'L' : 'M'}${px(p.t).toFixed(1)} ${py(p.h).toFixed(1)}`).join('') + `L${px(1)} ${PY + PH}L${px(0)} ${PY + PH}Z`;
  const gridLevels = [];
  for (let h = lo; h <= Math.max(...hs) + 100; h += 200) if (py(h) >= PY - 4) gridLevels.push(h);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        {cells.map(c => (
          <rect key={`${c.i}/${c.j}`} x={M0 + (c.i * MS) / c.n} y={M0 + (c.j * MS) / c.n} width={MS / c.n + 0.5} height={MS / c.n + 0.5} fill={c.fill} opacity={0.8} />
        ))}
        <g transform={`translate(${M0} ${M0}) scale(${MS})`}>
          {lines.map(l => (
            <path key={l.level} d={l.d} fill="none" vectorEffect="non-scaling-stroke" className="stroke-amber-900/80" strokeWidth={l.level % 500 === 0 ? 1.8 : 0.7} />
          ))}
        </g>
        <rect x={M0} y={M0} width={MS} height={MS} fill="none" className="stroke-gray-500" />
        <line x1={M0 + a.x * MS} y1={M0 + a.y * MS} x2={M0 + b.x * MS} y2={M0 + b.y * MS} className="stroke-fuchsia-700" strokeWidth="2.5" />
        {ends.map((p, i) => (
          <g key={i}>
            <circle
              cx={M0 + p.x * MS}
              cy={M0 + p.y * MS}
              r={9}
              className="fill-fuchsia-500/35 stroke-fuchsia-700 cursor-grab"
              strokeWidth="2"
              style={{ touchAction: 'none' }}
              onPointerDown={e => {
                e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
                setDrag(i);
              }}
            />
            <text x={M0 + p.x * MS} y={M0 + p.y * MS + 4} fontSize="11" fontWeight="bold" textAnchor="middle" className="fill-fuchsia-900 pointer-events-none">
              {i ? 'B' : 'A'}
            </text>
          </g>
        ))}
        {/* Мащабна линийка 2 km */}
        <g transform={`translate(${M0 + 8} ${M0 + MS - 12})`}>
          <rect x={-4} y={-14} width={(2 / SIDE_KM) * MS + 8} height={20} rx={4} className="fill-white/80" />
          <line x1={0} y1={0} x2={(2 / SIDE_KM) * MS} y2={0} className="stroke-gray-800" strokeWidth="3" />
          <text x={(1 / SIDE_KM) * MS} y={-4} fontSize="10" textAnchor="middle" className="fill-gray-800">
            2 km
          </text>
        </g>

        {/* Профилът */}
        {gridLevels.map(h => (
          <g key={h}>
            <line x1={PX} y1={py(h)} x2={PX + PW} y2={py(h)} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.6" />
            <text x={PX - 4} y={py(h) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {h}
            </text>
          </g>
        ))}
        <path d={area} className="fill-amber-200/80 stroke-amber-800 dark:fill-amber-900/60 dark:stroke-amber-300" strokeWidth="1.5" />
        <line x1={px(0)} y1={py(eye)} x2={px(1)} y2={py(target)} className={blocked ? 'stroke-red-600' : 'stroke-emerald-600'} strokeWidth="1.8" strokeDasharray="6 4" />
        <text x={px(0)} y={py(hA) - 8} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-fuchsia-800 dark:fill-fuchsia-300">
          A
        </text>
        <text x={px(1)} y={py(hB) - 8} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-fuchsia-800 dark:fill-fuchsia-300">
          B
        </text>
        <line x1={PX} y1={PY + PH} x2={px(1)} y2={PY + PH} className="stroke-gray-500" />
        <text x={(PX + px(1)) / 2} y={PY + PH + 16} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {fmt(lenKm, 2)} km; височините – {fmt(realExag, 1)}× преувеличени
        </text>
        <text x={PX - 4} y={py(gridLevels[gridLevels.length - 1]) - 12} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          m
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Влачи точките A и B. Хоризонтали през 100 m, удебелените – през 500 m.</p>
      <Sliders>
        <Slider label="×, пъти" value={exag} onChange={setExag} min={1} max={10} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'A', value: `${fmt(hA)} m` },
            { label: 'B', value: `${fmt(hB)} m` },
            { label: 'разлика', value: `${fmt(hB - hA)} m` },
            { label: 'среден наклон', value: `${fmt(avg * 100, 1)}%` },
            { label: 'най-стръмно', value: `${fmt(maxSlope * 100)}% (${fmt((Math.atan(maxSlope) * 180) / Math.PI)}°)`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={blocked ? 'rose' : 'emerald'}>{blocked ? 'От A не се вижда B – релефът закрива гледката.' : 'От A се вижда B.'}</Note>
    </div>
  );
}
