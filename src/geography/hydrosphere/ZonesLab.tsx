import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { STATIONS } from '../atmosphere/koppen';
import { ZONES, dryThreshold, seasonOf, zoneOf } from './zones';

type Pt = { name: string; t: number; P: number; c: number };

// Станциите от урока „Климатите на Земята“ (без Мусала – там климатът се определя от височината) и още три.
const POINTS: Pt[] = [
  ...STATIONS.filter(s => s.name !== 'Мусала').map(s => ({
    name: s.name,
    t: Math.round((s.T.reduce((a, b) => a + b, 0) / 12) * 10) / 10,
    P: s.P.reduce((a, b) => a + b, 0),
    c: seasonOf(s.lat, s.P),
  })),
  { name: 'Манаус', t: 27, P: 2300, c: 140 },
  { name: 'Ниамей', t: 29.5, P: 560, c: 280 },
  { name: 'Астана', t: 3.5, P: 330, c: 280 },
];

const SEASONS: [number, string][] = [
  [280, 'летни валежи'],
  [140, 'равномерни'],
  [0, 'зимни валежи'],
];

const X0 = 64;
const X1 = 612;
const Y0 = 14;
const Y1 = 300;
const TMIN = -20;
const TMAX = 30;
const PMAX = 3000;
const xOf = (t: number) => X0 + ((t - TMIN) / (TMAX - TMIN)) * (X1 - X0);
const yOf = (P: number) => Y1 - Math.sqrt(P / PMAX) * (Y1 - Y0);
const tOf = (x: number) => TMIN + ((x - X0) / (X1 - X0)) * (TMAX - TMIN);
const POf = (y: number) => PMAX * ((Y1 - y) / (Y1 - Y0)) ** 2;

const COLS = 100;
const ROWS = 90;

/** Природни зони по средна годишна температура и годишни валежи. */
export default function ZonesLab() {
  const [pt, setPt] = useState<{ t: number; P: number }>({ t: 10.6, P: 615 });
  const [c, setC] = useState(140);
  const [drag, setDrag] = useState(false);

  // Фонът: за всяка колона сливаме съседните клетки с една и съща зона
  const cells = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; color: string }[] = [];
    const acc = new Map<string, { a: number; x: number; y: number }>();
    const w = (X1 - X0) / COLS;
    for (let i = 0; i < COLS; i++) {
      const t = TMIN + ((i + 0.5) / COLS) * (TMAX - TMIN);
      let start = 0;
      let prev = '';
      for (let j = 0; j <= ROWS; j++) {
        const color = j < ROWS ? zoneOf(t, POf(Y1 - ((j + 0.5) / ROWS) * (Y1 - Y0)), c).color : '';
        if (color !== prev) {
          if (prev) {
            const yb = Y1 - (start / ROWS) * (Y1 - Y0);
            const yt = Y1 - (j / ROWS) * (Y1 - Y0);
            out.push({
              x: X0 + i * w,
              y: yt,
              w: w + 0.4,
              h: yb - yt + 0.4,
              color: prev,
            });
            const a = w * (yb - yt);
            const g = acc.get(prev) ?? { a: 0, x: 0, y: 0 };
            acc.set(prev, {
              a: g.a + a,
              x: g.x + a * (X0 + (i + 0.5) * w),
              y: g.y + a * ((yb + yt) / 2),
            });
          }
          start = j;
          prev = color;
        }
      }
    }
    const labels = [...acc]
      .filter(([, g]) => g.a > 2500)
      .map(([color, g]) => ({
        color,
        x: g.x / g.a,
        y: g.y / g.a,
        name: Object.values(ZONES).find(z => z.color === color)?.name ?? '',
      }));
    return { out, labels };
  }, [c]);

  const zone = zoneOf(pt.t, pt.P, c);
  const d = dryThreshold(pt.t, c);
  const near = POINTS.find(p => Math.abs(p.t - pt.t) < 0.05 && Math.abs(p.P - pt.P) < 1 && p.c === c);

  const place = (svg: SVGSVGElement, cx: number, cy: number) => {
    const m = svg.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    if (q.x < X0 - 10 || q.x > X1 + 10 || q.y < Y0 - 10 || q.y > Y1 + 10) return;
    const x = Math.max(X0, Math.min(X1, q.x));
    const y = Math.max(Y0, Math.min(Y1, q.y));
    setPt({ t: Math.round(tOf(x) * 2) / 2, P: Math.round(POf(y) / 10) * 10 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox="0 0 640 340"
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
        onPointerMove={e => drag && place(e.currentTarget, e.clientX, e.clientY)}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
        onClick={e => place(e.currentTarget, e.clientX, e.clientY)}
      >
        {cells.out.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.color} />
        ))}
        {cells.labels.map(l => (
          <text key={l.color} x={l.x} y={l.y} fontSize="10" textAnchor="middle" className="fill-gray-900 pointer-events-none" opacity={0.75}>
            {l.name.split(' (')[0].replace(' гори и храсталаци', '').replace(' и суха савана', '')}
          </text>
        ))}
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
        {[-20, -10, 0, 10, 20, 30].map(t => (
          <g key={t}>
            <line x1={xOf(t)} y1={Y1} x2={xOf(t)} y2={Y1 + 4} className="stroke-gray-500" />
            <text x={xOf(t)} y={Y1 + 16} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={X1} y={Y1 + 32} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          средна годишна температура, °C
        </text>
        {[0, 100, 250, 500, 1000, 1500, 2000, 3000].map(P => (
          <g key={P}>
            <line x1={X0 - 4} y1={yOf(P)} x2={X0} y2={yOf(P)} className="stroke-gray-500" />
            <text x={X0 - 6} y={yOf(P) + 4} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {fmt(P)}
            </text>
          </g>
        ))}
        <text
          x={14}
          y={(Y0 + Y1) / 2}
          fontSize="11"
          textAnchor="middle"
          transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}
          className="fill-gray-600 dark:fill-gray-300"
        >
          годишни валежи P, mm
        </text>
        {POINTS.map(p => (
          <circle
            key={p.name}
            cx={xOf(p.t)}
            cy={yOf(p.P)}
            r={3}
            className="fill-white stroke-gray-800 pointer-events-none"
            strokeWidth="1"
            opacity={p.c === c ? 1 : 0.4}
          />
        ))}
        {near && (
          <text
            x={xOf(near.t) + (near.t > 22 ? -12 : 12)}
            y={yOf(near.P) - 10}
            fontSize="12"
            fontWeight="700"
            textAnchor={near.t > 22 ? 'end' : 'start'}
            className="fill-gray-900 pointer-events-none"
          >
            {near.name}
          </text>
        )}
        <g
          className="cursor-grab"
          style={{ touchAction: 'none' }}
          onPointerDown={e => {
            (e.currentTarget as SVGElement).ownerSVGElement?.setPointerCapture(e.pointerId);
            setDrag(true);
          }}
        >
          <circle cx={xOf(pt.t)} cy={yOf(pt.P)} r={8} className="fill-rose-600 stroke-white" strokeWidth="2.5" />
        </g>
      </LabSvg>
      <Buttons>
        {SEASONS.map(([v, label]) => (
          <DiagramButton key={v} active={c === v} onClick={() => setC(v)}>
            {label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {POINTS.map(p => (
          <DiagramButton
            key={p.name}
            active={near?.name === p.name}
            onClick={() => {
              setPt({ t: p.t, P: p.P });
              setC(p.c);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Влачи точката, щракни някъде по диаграмата или избери град; бледите точки са градове с друг сезон на валежите. Влагата се сравнява с прага на сухота на
        Кьопен, който расте с температурата и е по-висок, когато вали главно лятото. Схемата е опростена: границите между зоните в природата са постепенни.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 't', value: `${fmt(pt.t, 1)} °C`, tone: 'rose' },
            { label: 'P', value: `${fmt(pt.P)} mm`, tone: 'blue' },
            { label: 'праг на сухота', value: `${fmt(d)} mm`, tone: 'amber' },
            { label: 'P / праг', value: fmt(pt.P / d, 2), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone="emerald">
        {zone.name}: {zone.veg}; почвите – {zone.soil}
      </Note>
    </div>
  );
}
