import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Скали: коефициент на филтрация K (m/s) и ефективна порестост nₑ – типични, закръглени стойности. */
const ROCKS = [
  {
    id: 'gravel',
    name: 'чакъл',
    k: 1e-2,
    kText: '10⁻²',
    n: 0.25,
    fill: '#d6c7a1',
    dot: '#a08c5b',
  },
  {
    id: 'sand',
    name: 'пясък',
    k: 1e-4,
    kText: '10⁻⁴',
    n: 0.25,
    fill: '#f2dfa7',
    dot: '#c9a85a',
  },
  {
    id: 'fine',
    name: 'фин пясък',
    k: 1e-5,
    kText: '10⁻⁵',
    n: 0.2,
    fill: '#efe3c0',
    dot: '#cbb98a',
  },
  {
    id: 'loess',
    name: 'льос',
    k: 1e-7,
    kText: '10⁻⁷',
    n: 0.2,
    fill: '#e6cfa8',
    dot: '#b99a6a',
  },
  {
    id: 'clay',
    name: 'глина',
    k: 1e-9,
    kText: '10⁻⁹',
    n: 0.3,
    fill: '#c9a48a',
    dot: '#9a6f55',
  },
] as const;

type RockId = (typeof ROCKS)[number]['id'];

const DAY = 86_400;
const YEAR = 365 * DAY;
const THICK = 10; // дебелина на водоносния пласт, m

/** Време в подходящи единици. */
const duration = (s: number) => {
  if (!isFinite(s)) return '∞';
  if (s < 2 * DAY) return `${fmt(s / 3600, 0)} h`;
  if (s < 120 * DAY) return `${fmt(s / DAY, 0)} дни`;
  const y = s / YEAR;
  if (y < 10) return `${fmt(y, 1)} год.`;
  if (y < 1e6) return `${fmt(y, 0)} год.`;
  return `${fmt(y / 1e6, 1)} млн. год.`;
};

const speed = (v: number) => {
  const perDay = v * DAY;
  if (perDay >= 1) return `${fmt(perDay, perDay < 10 ? 1 : 0)} m/ден`;
  const perYear = v * YEAR;
  if (perYear >= 0.1) return `${fmt(perYear, perYear < 10 ? 1 : 0)} m/год.`;
  return `${fmt(perYear * 1000, 2)} mm/год.`;
};

const X0 = 70; // сметището
const X1 = 560; // кладенецът
const GROUND = 70;
const TOP = 120; // горна граница на пласта (под водното ниво)
const BOTTOM = 210;

/** Законът на Дарси: замърсяване от сметище тръгва с подземната вода към кладенец. */
export default function DarcyLab() {
  const [rockId, setRockId] = useState<RockId>('sand');
  const [grad, setGrad] = useState(5); // ‰
  const [dist, setDist] = useState(500); // m
  const [years, setYears] = useState(2);

  const rock = ROCKS.find(r => r.id === rockId)!;
  const i = grad / 1000;
  const q = rock.k * i; // скорост на Дарси, m/s
  const v = q / rock.n; // действителна скорост между зърната
  const travel = dist / v;
  const front = Math.min(1, (v * years * YEAR) / dist);
  const flow = q * THICK * DAY; // m³ на ден през ивица 1 m
  const reached = front >= 1;

  // Водното ниво пада към кладенеца – наклонът е силно преувеличен
  const wtY = (x: number) => 92 + ((x - X0) / (X1 - X0)) * (8 + grad * 1.6);
  const plumeX = X0 + front * (X1 - X0);
  const dots = Array.from({ length: 70 }, (_, k) => ({
    x: 20 + ((k * 97) % 600),
    y: TOP + 6 + ((k * 37) % (BOTTOM - TOP - 12)),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 250" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={640} height={GROUND} className="fill-sky-50 dark:fill-slate-900" />
        <rect x={0} y={GROUND} width={640} height={TOP - GROUND} className="fill-amber-100 dark:fill-amber-950/60" />
        <rect x={0} y={TOP} width={640} height={BOTTOM - TOP} fill={rock.fill} />
        {dots.map((d, k) => (
          <circle key={k} cx={d.x} cy={d.y} r={rock.id === 'gravel' ? 3.2 : rock.id === 'clay' ? 0.9 : 1.6} fill={rock.dot} />
        ))}
        <rect x={0} y={BOTTOM} width={640} height={250 - BOTTOM} className="fill-stone-400 dark:fill-stone-700" />
        <text x={630} y={BOTTOM + 15} fontSize="11" textAnchor="end" className="fill-white">
          водонепропусклива скала
        </text>
        <text x={540} y={TOP + 16} fontSize="11" textAnchor="end" className="fill-gray-800">
          {rock.name}: K = {rock.kText} m/s
        </text>

        {/* Водата в пласта и замърсяването */}
        <rect x={0} y={TOP} width={640} height={BOTTOM - TOP} className="fill-sky-400/25" />
        <path
          d={`M${X0 - 20} ${TOP + 4} L${plumeX} ${TOP + 14} Q${plumeX + 14} ${(TOP + BOTTOM) / 2} ${plumeX} ${BOTTOM - 14} L${X0 - 20} ${BOTTOM - 4} Z`}
          className="fill-rose-500/45"
        />
        <polyline
          points={Array.from({ length: 33 }, (_, k) => {
            const x = (640 * k) / 32;
            return `${x.toFixed(0)},${wtY(Math.min(Math.max(x, X0), X1)).toFixed(1)}`;
          }).join(' ')}
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x={240} y={wtY(240) - 6} fontSize="11" className="fill-blue-700 dark:fill-blue-300">
          ниво на подземните води
        </text>

        {/* Сметище */}
        <path
          d={`M${X0 - 45} ${GROUND} L${X0 - 30} ${GROUND - 26} L${X0 + 30} ${GROUND - 26} L${X0 + 45} ${GROUND} Z`}
          className="fill-stone-500 dark:fill-stone-500"
        />
        <text x={X0} y={GROUND - 32} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          сметище
        </text>
        {/* Кладенец */}
        <rect
          x={X1 - 5}
          y={GROUND - 16}
          width={10}
          height={BOTTOM - GROUND + 6}
          className="fill-gray-100 stroke-gray-600 dark:fill-gray-700 dark:stroke-gray-300"
        />
        <text
          x={X1}
          y={GROUND - 22}
          fontSize="11"
          textAnchor="middle"
          className={reached ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-700 dark:fill-gray-200'}
        >
          кладенец{reached ? ' ⚠' : ''}
        </text>
        <line x1={X0} y1={234} x2={X1} y2={234} className="stroke-gray-500 dark:stroke-gray-400" markerStart="url(#darcy-a)" markerEnd="url(#darcy-a)" />
        <defs>
          <marker id="darcy-a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-gray-500 dark:fill-gray-400" />
          </marker>
        </defs>
        <text x={(X0 + X1) / 2} y={247} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          {fmt(dist)} m
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Червеното петно е докъдето е стигнало замърсяването след t години (без разсейване и задържане в скалата). Наклонът на водното ниво на чертежа е силно
        преувеличен.
      </p>
      <Buttons>
        {ROCKS.map(r => (
          <DiagramButton key={r.id} active={r.id === rockId} onClick={() => setRockId(r.id)}>
            {r.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="i, ‰" value={grad} onChange={setGrad} min={1} max={20} step={1} tone="blue" />
        <Slider label="d, m" value={dist} onChange={setDist} min={50} max={2000} step={50} tone="amber" />
        <Slider label="t, год." value={years} onChange={setYears} min={1} max={50} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'q = K·i', value: speed(q), tone: 'blue' },
            { label: 'v = q/nₑ', value: speed(v), tone: 'blue' },
            { label: 'до кладенеца', value: duration(travel), tone: 'rose' },
            {
              label: 'отток',
              value: `${fmt(flow, flow < 0.1 ? 4 : 2)} m³/ден на 1 m ширина`,
              tone: 'emerald',
            },
          ]}
        />
      </div>
      <Note tone={reached ? 'rose' : 'emerald'}>
        {reached
          ? `Замърсяването стига до кладенеца за ${duration(travel)} – водата в него вече не е за пиене.`
          : `За ${fmt(years)} год. замърсяването е изминало ${fmt(front * dist)} m от ${fmt(dist)} m.`}
      </Note>
    </div>
  );
}
