import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { MOUNTAIN, contours, gradient, hypsoColor, levelsOf, sample } from '../terrain';

const M0 = 10;
const MS = 310;
const SIDE_M = 8000;
const N = 40;
const CELL_KM2 = (SIDE_M / N / 1000) ** 2;

type P = { x: number; y: number };
const RIVER: P[] = [
  { x: 0, y: 0.75 },
  { x: 0.18, y: 0.71 },
  { x: 0.38, y: 0.74 },
  { x: 0.58, y: 0.71 },
  { x: 0.8, y: 0.69 },
  { x: 1, y: 0.71 },
];
const ROAD: P[] = [
  { x: 0, y: 0.85 },
  { x: 0.3, y: 0.82 },
  { x: 0.62, y: 0.8 },
  { x: 0.78, y: 0.62 },
  { x: 0.62, y: 0.47 },
  { x: 0.55, y: 0.33 },
];
const VILLAGES = [
  { name: 'с. Долно', x: 0.14, y: 0.83 },
  { name: 'с. Горно', x: 0.7, y: 0.83 },
];
const RESERVE = { x: 0.36, y: 0.33, r: 0.17 };

/** Разстояние от точка до начупена линия, в единици от квадрата. */
function distToLine(p: P, line: P[]) {
  let best = Infinity;
  for (let k = 1; k < line.length; k++) {
    const a = line[k - 1];
    const b = line[k];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return best;
}

const pathOf = (line: P[]) => line.map((p, i) => `${i ? 'L' : 'M'}${(M0 + p.x * MS).toFixed(1)} ${(M0 + p.y * MS).toFixed(1)}`).join('');

/** ГИС анализ: слоеве, буферни зони и наслагване – къде може да се направи къмпинг. */
export default function GisLab() {
  const [maxSlope, setMaxSlope] = useState(15);
  const [flood, setFlood] = useState(200);
  const [road, setRoad] = useState(1000);
  const [reserve, setReserve] = useState(true);

  const { cells, lines } = useMemo(() => {
    const cells = Array.from({ length: N * N }, (_, c) => {
      const i = c % N;
      const j = Math.floor(c / N);
      const p = { x: (i + 0.5) / N, y: (j + 0.5) / N };
      const { gx, gy } = gradient(MOUNTAIN, p.x, p.y);
      return {
        i,
        j,
        h: MOUNTAIN(p.x, p.y),
        slope: (Math.hypot(gx, gy) / SIDE_M) * 100,
        river: distToLine(p, RIVER) * SIDE_M,
        road: distToLine(p, ROAD) * SIDE_M,
        inReserve: Math.hypot(p.x - RESERVE.x, p.y - RESERVE.y) < RESERVE.r,
      };
    });
    return { cells, lines: contours(sample(MOUNTAIN, 60), levelsOf(sample(MOUNTAIN, 60), 100)) };
  }, []);

  const why = cells.map(c => ({
    steep: c.slope > maxSlope,
    wet: c.river < flood,
    far: c.road > road,
    prot: reserve && c.inReserve,
  }));
  const ok = why.map(w => !w.steep && !w.wet && !w.far && !w.prot);
  const okCount = ok.filter(Boolean).length;
  const count = (k: keyof (typeof why)[number]) => why.filter(w => w[k]).length * CELL_KM2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {cells.map(c => (
          <rect key={`${c.i}/${c.j}`} x={M0 + (c.i * MS) / N} y={M0 + (c.j * MS) / N} width={MS / N + 0.4} height={MS / N + 0.4} fill={hypsoColor(c.h)} opacity={0.7} />
        ))}
        <g transform={`translate(${M0} ${M0}) scale(${MS})`}>
          {lines.map(l => (
            <path key={l.level} d={l.d} fill="none" vectorEffect="non-scaling-stroke" className="stroke-amber-900/50" strokeWidth={0.6} />
          ))}
        </g>
        {cells.map((c, k) =>
          ok[k] ? <rect key={`ok${k}`} x={M0 + (c.i * MS) / N} y={M0 + (c.j * MS) / N} width={MS / N} height={MS / N} className="fill-fuchsia-500/60" /> : null,
        )}
        {reserve && <circle cx={M0 + RESERVE.x * MS} cy={M0 + RESERVE.y * MS} r={RESERVE.r * MS} className="fill-emerald-700/15 stroke-emerald-800" strokeWidth="2" strokeDasharray="8 4" />}
        <path d={pathOf(RIVER)} fill="none" className="stroke-blue-300/60" strokeWidth={Math.max(2, ((2 * flood) / SIDE_M) * MS)} strokeLinejoin="round" />
        <path d={pathOf(RIVER)} fill="none" className="stroke-blue-600" strokeWidth="2.5" />
        <path d={pathOf(ROAD)} fill="none" className="stroke-gray-800 dark:stroke-gray-200" strokeWidth="2.5" />
        <path d={pathOf(ROAD)} fill="none" className="stroke-yellow-300" strokeWidth="1" strokeDasharray="5 4" />
        {VILLAGES.map(v => (
          <g key={v.name}>
            <rect x={M0 + v.x * MS - 5} y={M0 + v.y * MS - 5} width={10} height={10} className="fill-gray-800 stroke-white" />
            <text x={M0 + v.x * MS + 8} y={M0 + v.y * MS + 18} fontSize="11" className="fill-gray-900">
              {v.name}
            </text>
          </g>
        ))}
        <rect x={M0} y={M0} width={MS} height={MS} fill="none" className="stroke-gray-500" />

        {/* Легенда и колко площ отпада по всяко условие */}
        {[
          ['fill-fuchsia-500/60', 'подходящо за къмпинг'],
          ['fill-blue-300/60', `заливна зона (±${flood} m)`],
          ['fill-emerald-700/20', 'резерват'],
        ].map(([cls, name], k) => (
          <g key={name} transform={`translate(345 ${22 + k * 20})`}>
            <rect x={0} y={-10} width={16} height={12} className={cls} />
            <text x={22} y={0} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
              {name}
            </text>
          </g>
        ))}
        <text x={345} y={102} fontSize="12" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
          отпада площ, km² (от 64 km²)
        </text>
        {(
          [
            ['steep', `наклон над ${maxSlope}%`],
            ['wet', 'заливна зона'],
            ['far', `над ${fmt(road / 1000, 1)} km от пътя`],
            ['prot', 'резерват'],
          ] as [keyof (typeof why)[number], string][]
        ).map(([k, name], idx) => {
          const v = count(k);
          return (
            <g key={k} transform={`translate(345 ${118 + idx * 34})`}>
              <text x={0} y={10} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
                {name}
              </text>
              <rect x={0} y={15} width={(v / 64) * 280} height={10} className="fill-gray-400 dark:fill-gray-500" />
              <text x={(v / 64) * 280 + 5} y={24} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
                {fmt(v, 1)}
              </text>
            </g>
          );
        })}
        <text x={345} y={268} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
          една клетка = 200 × 200 m
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={reserve} onClick={() => setReserve(!reserve)}>
          🌲 Без строеж в резервата
        </DiagramButton>
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Плъзгачите: най-голям наклон, най-малко разстояние от реката, най-голямо разстояние до пътя.
      </p>
      <Sliders>
        <Slider label="i, %" value={maxSlope} onChange={setMaxSlope} min={5} max={40} step={1} tone="amber" />
        <Slider label="река, m" value={flood} onChange={setFlood} min={0} max={600} step={50} tone="blue" />
        <Slider label="път, m" value={road} onChange={setRoad} min={200} max={3000} step={100} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'подходяща площ', value: `${fmt(okCount * CELL_KM2, 2)} km²`, tone: 'rose' },
            { label: 'дял от територията', value: `${fmt((okCount / (N * N)) * 100, 1)}%` },
          ]}
        />
      </div>
    </div>
  );
}
