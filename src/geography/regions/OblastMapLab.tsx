import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { NUTS2_NAME, NUTS2_STATS, OBLASTS, type Nuts2, type Oblast } from './bgData';
import { OBLAST_LABEL, OBLAST_SHAPES } from './bgOblasts';

type Ind = {
  key: string;
  name: string;
  unit: string;
  digits: number;
  value: (o: Oblast) => number;
  /** обхват на скалата */
  scale: [number, number];
  /** seq – тъмно е голямо; neg – тъмночервено е най-голям спад; div – нулата е в средата */
  palette: 'seq' | 'neg' | 'div';
  source: string;
};

const INDICATORS: Ind[] = [
  {
    key: 'change',
    name: 'промяна 2011–2021',
    unit: '%',
    digits: 1,
    value: o => (100 * (o.pop2021 - o.pop2011)) / o.pop2011,
    scale: [-25, 0],
    palette: 'neg',
    source: 'преброявания 2011 и 2021 г. (НСИ)',
  },
  {
    key: 'density',
    name: 'гъстота',
    unit: 'души/km²',
    digits: 0,
    value: o => o.pop2021 / o.area,
    scale: [20, 120],
    palette: 'seq',
    source: 'преброяване 2021 г.',
  },
  {
    key: 'medAge',
    name: 'медианна възраст',
    unit: 'години',
    digits: 1,
    value: o => o.medAge,
    scale: [43, 54],
    palette: 'seq',
    source: 'Евростат, към 1.1.2025 г.',
  },
  {
    key: 'p65',
    name: 'дял на 65+',
    unit: '%',
    digits: 1,
    value: o => o.p65,
    scale: [19, 32],
    palette: 'seq',
    source: 'Евростат, към 1.1.2025 г.',
  },
  {
    key: 'nat',
    name: 'естествен прираст',
    unit: '‰',
    digits: 1,
    value: o => o.nat,
    scale: [-18, 0],
    palette: 'neg',
    source: 'Евростат, 2024 г.',
  },
  {
    key: 'mig',
    name: 'механичен прираст',
    unit: '‰',
    digits: 1,
    value: o => o.mig,
    scale: [-12, 12],
    palette: 'div',
    source: 'Евростат, 2024 г.',
  },
  {
    key: 'gdp',
    name: 'БВП на човек',
    unit: '€',
    digits: 0,
    value: o => o.gdp,
    scale: [6000, 24000],
    palette: 'seq',
    source: 'Евростат, 2024 г.',
  },
];

const REGION_COLOR: Record<Nuts2, string> = {
  BG31: '#f59e0b',
  BG32: '#84cc16',
  BG33: '#06b6d4',
  BG34: '#f43f5e',
  BG41: '#8b5cf6',
  BG42: '#10b981',
};

// Последователна скала от светло към тъмно синьо; разходяща – от червено през бяло към зелено
const SEQ = [
  [239, 246, 255],
  [147, 197, 253],
  [37, 99, 235],
  [30, 58, 138],
];
const NEG = [
  [127, 29, 29],
  [220, 38, 38],
  [252, 165, 165],
  [254, 242, 242],
];
const DIV = [
  [190, 18, 60],
  [251, 207, 232],
  [248, 250, 252],
  [187, 247, 208],
  [21, 128, 61],
];
function ramp(stops: number[][], t: number) {
  const u = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(u));
  const f = u - i;
  const c = stops[i].map((a, k) => Math.round(a + (stops[i + 1][k] - a) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// Равнопромерна проекция с мащаб по паралела 42,7°
const K = 80;
const COS = Math.cos((42.7 * Math.PI) / 180);
const X0 = 22.3;
const Y0 = 44.3;
const px = (lon: number) => 40 + (lon - X0) * K * COS;
const py = (lat: number) => 8 + (Y0 - lat) * K;
const PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(OBLAST_SHAPES).map(([code, pts]) => {
    let d = '';
    for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${px(pts[i] / 100).toFixed(1)} ${py(pts[i + 1] / 100).toFixed(1)}`;
    return [code, d + 'Z'];
  }),
);

// Къси имена за надписите върху картата
const SHORT: Record<string, string> = {
  'Велико Търново': 'В. Търново',
  'Стара Загора': 'Ст. Загора',
  'София (столица)': 'София-град',
  София: 'Софийска',
};
// Изместване на надписите, които иначе се застъпват (в пиксели)
const NUDGE: Record<string, [number, number]> = { BG411: [0, -3], BG412: [10, 18], BG414: [-4, 4] };

/** Карта на областите: избран показател, класиране и районите за планиране. */
export default function OblastMapLab() {
  const [key, setKey] = useState('change');
  const [regions, setRegions] = useState(false);
  const [sel, setSel] = useState('BG311');
  const [labels, setLabels] = useState(true);
  const ind = INDICATORS.find(i => i.key === key)!;
  const vals = new Map(OBLASTS.map(o => [o.code, ind.value(o)]));
  const [lo, hi] = ind.scale;
  const stops = ind.palette === 'div' ? DIV : ind.palette === 'neg' ? NEG : SEQ;
  const color = (v: number) => ramp(stops, (v - lo) / (hi - lo));
  const fill = (o: Oblast) => (regions ? REGION_COLOR[o.nuts2] : color(vals.get(o.code)!));
  const ranked = [...OBLASTS].sort((a, b) => vals.get(b.code)! - vals.get(a.code)!);
  const o = OBLASTS.find(q => q.code === sel)!;
  const v = vals.get(sel)!;
  const rank = ranked.findIndex(q => q.code === sel) + 1;
  const sorted = ranked.map(q => vals.get(q.code)!);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  const national = {
    change: (100 * (6519789 - 7364570)) / 7364570,
    density: 6519789 / 111001.7,
  } as Record<string, number>;

  // класиране вдясно
  const R = { x: 470, y: 22, w: 160, row: 9.4 };
  const absMax = Math.max(...sorted.map(Math.abs));
  const zeroX = min < 0 && max > 0 ? R.x + 62 + (R.w - 62) * (-min / (max - min)) : min < 0 ? R.x + R.w : R.x + 62;
  const barW = (x: number) => {
    if (min < 0 && max > 0) return ((R.w - 62) * Math.abs(x)) / (max - min);
    return ((R.w - 62) * Math.abs(x)) / absMax;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {OBLASTS.map(q => (
          <path
            key={q.code}
            d={PATHS[q.code]}
            fill={fill(q)}
            className="stroke-white dark:stroke-gray-800 cursor-pointer"
            strokeWidth={0.8}
            onClick={() => setSel(q.code)}
          >
            <title>{q.name}</title>
          </path>
        ))}
        <path d={PATHS[sel]} fill="none" className="stroke-gray-900 dark:stroke-white pointer-events-none" strokeWidth={2} />
        {labels &&
          OBLASTS.map(q => {
            const [lx, ly] = OBLAST_LABEL[q.code];
            const [dx, dy] = NUDGE[q.code] ?? [0, 0];
            const t = regions ? 0 : (vals.get(q.code)! - lo) / (hi - lo);
            const dark = !regions && (ind.palette === 'div' ? t < 0.15 || t > 0.85 : ind.palette === 'neg' ? t < 0.4 : t > 0.6);
            return (
              <text
                key={q.code}
                x={px(lx / 100) + dx}
                y={py(ly / 100) + dy + 2}
                fontSize="6.5"
                textAnchor="middle"
                className={`pointer-events-none ${dark ? 'fill-white' : 'fill-gray-800'}`}
              >
                {SHORT[q.name] ?? q.name}
              </text>
            );
          })}

        {/* легенда */}
        {regions ? (
          (Object.keys(NUTS2_NAME) as Nuts2[]).map((r, i) => (
            <g key={r} transform={`translate(${12 + (i % 3) * 130} ${262 + Math.floor(i / 3) * 14})`}>
              <rect width="10" height="8" fill={REGION_COLOR[r]} rx="1.5" />
              <text x="14" y="7.5" fontSize="9" className="fill-gray-700 dark:fill-gray-200">
                {NUTS2_NAME[r]}
              </text>
            </g>
          ))
        ) : (
          <g transform="translate(14 266)">
            <defs>
              <linearGradient id="oblast-legend">
                {Array.from({ length: 11 }, (_, i) => (
                  <stop key={i} offset={`${i * 10}%`} stopColor={ramp(stops, i / 10)} />
                ))}
              </linearGradient>
            </defs>
            <rect width="200" height="8" fill="url(#oblast-legend)" rx="2" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth={0.5} />
            <text y="20" fontSize="9" className="fill-gray-500 dark:fill-gray-400">
              {fmt(lo)}
            </text>
            {ind.palette === 'div' && (
              <text x="100" y="20" fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                0
              </text>
            )}
            <text x="200" y="20" fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(hi)} {ind.unit}
            </text>
            <text x="212" y="8" fontSize="9" className="fill-gray-600 dark:fill-gray-300">
              {ind.name}
            </text>
          </g>
        )}

        {/* класиране */}
        <text x={R.x} y={12} fontSize="9" className="fill-gray-600 dark:fill-gray-300">
          {ind.name}, {ind.unit}
        </text>
        <line x1={zeroX} y1={R.y - 4} x2={zeroX} y2={R.y + 28 * R.row} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth={0.6} />
        {ranked.map((q, i) => {
          const x = vals.get(q.code)!;
          const w = barW(x);
          const y = R.y + i * R.row;
          const active = q.code === sel;
          return (
            <g key={q.code} className="cursor-pointer" onClick={() => setSel(q.code)}>
              <text x={R.x + 58} y={y + 6.5} fontSize="7" textAnchor="end" className={active ? 'fill-gray-900 dark:fill-white font-bold' : 'fill-gray-600 dark:fill-gray-300'}>
                {SHORT[q.name] ?? q.name}
              </text>
              <rect x={x < 0 ? zeroX - w : zeroX} y={y} width={Math.max(0.8, w)} height={R.row - 2} fill={regions ? REGION_COLOR[q.nuts2] : color(x)} className={active ? 'stroke-gray-900 dark:stroke-white' : ''} strokeWidth={active ? 1 : 0} />
            </g>
          );
        })}
      </LabSvg>
      <Buttons>
        {INDICATORS.map(i => (
          <DiagramButton
            key={i.key}
            active={!regions && key === i.key}
            onClick={() => {
              setKey(i.key);
              setRegions(false);
            }}
          >
            {i.name}
          </DiagramButton>
        ))}
        <DiagramButton active={regions} onClick={() => setRegions(!regions)}>
          райони за планиране
        </DiagramButton>
        <DiagramButton active={labels} onClick={() => setLabels(!labels)}>
          имена
        </DiagramButton>
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни област на картата или в класирането. Източник: {ind.source}; механичният прираст включва и вътрешната, и външната миграция.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: o.name, value: `${fmt(v, ind.digits)} ${ind.unit}`, tone: 'blue' },
            { label: 'място', value: `${rank} от 28`, tone: 'violet' },
            { label: 'население', value: `${fmt(o.pop2025)} (2025)`, tone: 'gray' },
            { label: `район ${NUTS2_NAME[o.nuts2]}`, value: `безработица ${fmt(NUTS2_STATS[o.nuts2].unemp, 1)}%`, tone: 'amber' },
            ...(key in national ? [{ label: 'България', value: `${fmt(national[key], ind.digits)} ${ind.unit}`, tone: 'emerald' as const }] : []),
          ]}
        />
      </div>
      <Note tone="gray">
        {regions
          ? `${NUTS2_NAME[o.nuts2]} район: БВП на човек по ППС ${NUTS2_STATS[o.nuts2].pps}% от средното за ЕС, безработица ${fmt(NUTS2_STATS[o.nuts2].unemp, 1)}% (2024 г.).`
          : `Най-висока стойност: ${SHORT[ranked[0].name] ?? ranked[0].name} (${fmt(max, ind.digits)} ${ind.unit}); най-ниска: ${SHORT[ranked[27].name] ?? ranked[27].name} (${fmt(min, ind.digits)} ${ind.unit}).`}
      </Note>
    </div>
  );
}
