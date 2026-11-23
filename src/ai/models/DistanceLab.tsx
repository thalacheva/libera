import { type PointerEvent, useRef, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from '../history/rollouts';
import { distance, type Metric } from './scaling';

// Три вида перуника; размерите са измислени по образец на прочутия набор на Фишър (венчелистче в cm).
const KINDS = [
  { name: 'четинеста', color: 'fill-blue-600 dark:fill-blue-400', text: 'text-blue-700 dark:text-blue-300', len: 1.5, lenS: 0.18, wid: 0.25, widS: 0.09 },
  { name: 'разноцветна', color: 'fill-emerald-600 dark:fill-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', len: 4.3, lenS: 0.45, wid: 1.3, widS: 0.18 },
  { name: 'виргинска', color: 'fill-rose-600 dark:fill-rose-400', text: 'text-rose-600 dark:text-rose-400', len: 5.6, lenS: 0.5, wid: 2.0, widS: 0.24 },
];

type Flower = { len: number; wid: number; kind: number };

/** 30 цветя, винаги едни и същи (генератор със зададено начало). */
const FLOWERS: Flower[] = (() => {
  const random = mulberry32(11);
  // Нормално разпределено число по метода на Бокс и Мюлер
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const round = (v: number) => Math.round(v * 10) / 10;
  return KINDS.flatMap((k, kind) =>
    Array.from({ length: 10 }, () => ({ len: round(k.len + k.lenS * normal()), wid: Math.max(0.1, round(k.wid + k.widS * normal())), kind }))
  );
})();

const W = 640;
const H = 330;
const UNIT = 80; // 1 cm = 80 единици и по двете оси, за да е окръжността окръжност
const X0 = 50;
const Y0 = 290;
const XMAX = 7.2;
const YMAX = 3.2;
const sx = (v: number) => X0 + v * UNIT;
const sy = (v: number) => Y0 - v * UNIT;

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Ново цвете сред 30 познати: трите най-близки по избраното разстояние решават на кой вид прилича. */
export default function DistanceLab() {
  const [q, setQ] = useState({ len: 4.6, wid: 1.7 });
  const [metric, setMetric] = useState<Metric>('euclid');
  const svg = useRef<SVGSVGElement>(null);

  const place = (e: PointerEvent<SVGSVGElement>) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const len = Math.min(XMAX, Math.max(0, (p.x - X0) / UNIT));
    const wid = Math.min(YMAX, Math.max(0, (Y0 - p.y) / UNIT));
    setQ({ len: Math.round(len * 10) / 10, wid: Math.round(wid * 10) / 10 });
  };

  const ranked = FLOWERS.map(f => ({ f, d: distance(metric, [f.len, f.wid], [q.len, q.wid]) })).sort((a, b) => a.d - b.d);
  const near = ranked.slice(0, 3);
  const r = near[2].d;
  const votes = KINDS.map((_, k) => near.filter(n => n.f.kind === k).length);
  const winner = votes.indexOf(Math.max(...votes));
  const tie = votes.filter(v => v === Math.max(...votes)).length > 1;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block select-none cursor-crosshair text-gray-800 dark:text-gray-100"
        onPointerDown={place}
        onPointerMove={e => {
          if (e.pointerType === 'mouse' && e.buttons === 1) place(e);
        }}
      >
        <rect x={X0} y={sy(YMAX)} width={XMAX * UNIT} height={YMAX * UNIT} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" />
        {[1, 2, 3, 4, 5, 6, 7].map(v => (
          <g key={v}>
            <line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(YMAX)} className="stroke-gray-300/70 dark:stroke-gray-600/70" />
            <text x={sx(v)} y={Y0 + 15} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3].map(v => (
          <g key={v}>
            <line x1={sx(0)} y1={sy(v)} x2={sx(XMAX)} y2={sy(v)} className="stroke-gray-300/70 dark:stroke-gray-600/70" />
            <text x={X0 - 7} y={sy(v) + 4} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        <text x={sx(XMAX / 2)} y={H - 6} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          дължина на венчелистчето, cm
        </text>
        <text x={14} y={sy(YMAX / 2)} fontSize="13" textAnchor="middle" transform={`rotate(-90 14 ${sy(YMAX / 2)})`} className="fill-gray-700 dark:fill-gray-200">
          ширина, cm
        </text>

        {/* Всички точки на еднакво разстояние от новото цвете: окръжност или ромб */}
        {metric === 'euclid' ? (
          <circle cx={sx(q.len)} cy={sy(q.wid)} r={r * UNIT} className="fill-fuchsia-500/10 stroke-fuchsia-500" strokeWidth="1.5" strokeDasharray="5 4" />
        ) : (
          <polygon
            points={`${sx(q.len - r)},${sy(q.wid)} ${sx(q.len)},${sy(q.wid + r)} ${sx(q.len + r)},${sy(q.wid)} ${sx(q.len)},${sy(q.wid - r)}`}
            className="fill-fuchsia-500/10 stroke-fuchsia-500"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
        )}
        {near.map(({ f }, i) =>
          metric === 'euclid' ? (
            <line key={i} x1={sx(q.len)} y1={sy(q.wid)} x2={sx(f.len)} y2={sy(f.wid)} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" />
          ) : (
            <polyline key={i} points={`${sx(q.len)},${sy(q.wid)} ${sx(f.len)},${sy(q.wid)} ${sx(f.len)},${sy(f.wid)}`} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" />
          )
        )}
        {FLOWERS.map((f, i) => (
          <circle key={i} cx={sx(f.len)} cy={sy(f.wid)} r={6} className={KINDS[f.kind].color} stroke="white" strokeWidth="1.2" />
        ))}
        <g>
          <circle cx={sx(q.len)} cy={sy(q.wid)} r={9} className="fill-fuchsia-600 dark:fill-fuchsia-400" stroke="white" strokeWidth="2" />
          <text x={sx(q.len)} y={sy(q.wid) + 4} fontSize="12" fontWeight="bold" textAnchor="middle" fill="white">
            ?
          </text>
        </g>
        {KINDS.map((k, i) => (
          <g key={k.name} transform={`translate(${X0 + 12} ${sy(YMAX) + 18 + i * 18})`}>
            <circle cx={0} cy={-4} r={5} className={k.color} />
            <text x={10} y={0} fontSize="12" className="fill-gray-800 dark:fill-gray-100">
              {k.name}
            </text>
          </g>
        ))}
      </LabSvg>

      <Buttons>
        <DiagramButton active={metric === 'euclid'} onClick={() => setMetric('euclid')}>
          евклидово разстояние
        </DiagramButton>
        <DiagramButton active={metric === 'manhattan'} onClick={() => setMetric('manhattan')}>
          манхатънско разстояние
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'новото цвете', value: `(${dec(q.len, 1)}; ${dec(q.wid, 1)})`, tone: 'violet' },
            ...near.map((n, i) => ({ label: `${i + 1}. ${KINDS[n.f.kind].name}`, value: dec(n.d) })),
          ]}
        />
      </div>
      <Note tone={tie ? 'amber' : 'emerald'}>
        {tie ? 'Трите най-близки цветя са от три различни вида – машината не може да реши.' : `Сред трите най-близки преобладава ${KINDS[winner].name} перуника (${votes[winner]} от 3).`}
      </Note>
      <p className="mt-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">Докосни произволно място в полето, за да преместиш новото цвете.</p>
    </div>
  );
}
