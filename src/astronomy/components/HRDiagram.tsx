import { useState, type MouseEvent } from 'react';
import { CLASSES, M_BOL_SUN, STARS, T_SUN, classOf, radiusOf } from './starData';
import { LOG_L_MAX, LOG_L_MIN, giantDot, hrAxes, lumOf, msDot, msLuminosity, msTemperature, rnd, supergiantDot, wdDot, type Dot } from './hrData';
import { temperatureToRGB } from './light';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 440;
const X0 = 62;
const X1 = 590;
const Y0 = 36;
const Y1 = 380;
const { x: hx, y: hy } = hrAxes(X0, X1, Y0, Y1);
const xToT = (px: number) => 10 ** (Math.log10(45000) - ((px - X0) / (X1 - X0)) * (Math.log10(45000) - Math.log10(2400)));
const yToL = (py: number) => 10 ** (LOG_L_MIN + ((Y1 - py) / (Y1 - Y0)) * (LOG_L_MAX - LOG_L_MIN));

type Sample = 'famous' | 'nearby' | 'bright';

// Най-близките звезди (до ~10 pc): почти само червени джуджета и няколко бели джуджета
// Дялове по преброяването на звездите до 10 pc (RECONS, закръглено)
const NEARBY_MIX: [number, number, number][] = [
  [0.73, 0.08, 0.5], // M
  [0.12, 0.5, 0.8], // K
  [0.06, 0.8, 1.05], // G
  [0.025, 1.05, 1.4], // F
  [0.01, 1.4, 2.5], // A
];
function nearbyStar(i: number): Dot {
  let u = rnd(i * 5 + 1);
  for (const [p, lo, hi] of NEARBY_MIX) {
    if (u < p) return msDot(lo * (hi / lo) ** rnd(i * 5 + 3), i * 5 + 4);
    u -= p;
  }
  return wdDot(i * 5 + 2);
}
const NEARBY: Dot[] = Array.from({ length: 330 }, (_, i) => nearbyStar(i));

// Най-ярките звезди на небето: виждаме ги отдалеч, защото са ярки – гиганти и горещи звезди
const BRIGHT: Dot[] = Array.from({ length: 300 }, (_, i) => {
  const u = rnd(i * 7 + 11);
  if (u < 0.33) return giantDot(i * 7 + 12);
  if (u < 0.43) return supergiantDot(i * 7 + 13);
  const M = 10 ** (Math.log10(1.1) + rnd(i * 7 + 14) * (Math.log10(15) - Math.log10(1.1)));
  return msDot(M, i * 7 + 15);
});

const SAMPLES: { id: Sample; name: string; text: string }[] = [
  { id: 'famous', name: 'Известни звезди', text: 'Щракнете върху звезда. Всяка звезда е точка с определени T и L – и следователно с определен радиус (пунктираните линии).' },
  { id: 'nearby', name: 'Най-близките (до 10 pc)', text: 'Около 350 звезди и бели джуджета в сфера с радиус 10 pc около Слънцето. Три четвърти са червени джуджета от клас M – толкова слаби, че нито едно не се вижда с просто око! Гиганти няма. Така изглежда истинската Галактика.' },
  { id: 'bright', name: 'Най-ярките на небето', text: 'Звездите, които виждаме с просто око. Сред тях има много гиганти, свръхгиганти и горещи звезди от класове B и A – не защото са чести, а защото са толкова ярки, че ги виждаме от стотици парсека. Това е ефект на подбора: ярките обекти са „свръхпредставени“.' },
];

const REGIONS = [
  { name: 'Главна последователност', x: hx(9000), y: hy(3), rotate: 32, color: '#fde68a' },
  { name: 'Гиганти', x: hx(4000), y: hy(3000), rotate: 0, color: '#fdba74' },
  { name: 'Свръхгиганти', x: hx(5000), y: hy(5e5), rotate: 0, color: '#c4b5fd' },
  { name: 'Бели джуджета', x: hx(14000), y: hy(1.5e-3), rotate: 0, color: '#bfdbfe' },
];

const RADII = [0.001, 0.01, 0.1, 1, 10, 100, 1000];
const L_TICKS: [number, string][] = [
  [-4, '10⁻⁴'],
  [-2, '10⁻²'],
  [0, '1'],
  [2, '10²'],
  [4, '10⁴'],
  [6, '10⁶'],
];

export default function HRDiagram() {
  const [sample, setSample] = useState<Sample>('famous');
  const [starId, setStarId] = useState<string | null>('sun');
  const [probe, setProbe] = useState<{ T: number; L: number } | null>(null);
  const [showRadii, setShowRadii] = useState(true);
  const [showRegions, setShowRegions] = useState(true);

  const dots = sample === 'nearby' ? NEARBY : sample === 'bright' ? BRIGHT : [];
  const named = STARS.find(s => s.id === starId);
  const current = SAMPLES.find(s => s.id === sample)!;

  // Разпределение по спектрални класове за избраната извадка
  const counted = sample === 'famous' ? STARS.map(s => ({ T: s.T, kind: s.id === 'siriusb' ? 'wd' : 'x' })) : dots;
  const classCounts = CLASSES.slice(0, 7).map(c => ({ c, n: counted.filter(d => d.kind !== 'wd' && classOf(d.T).letter === c.letter).length }));
  const wdCount = counted.filter(d => d.kind === 'wd').length;
  const total = counted.length;

  const onPlotClick = (e: MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    const box = svg.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const py = ((e.clientY - box.top) / box.height) * H;
    setProbe({ T: xToT(px), L: yToL(py) });
    setStarId(null);
  };

  const probeR = probe ? radiusOf(probe) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Диаграмата на Херцшпрунг–Ръсел</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Хоризонтално – температурата (горещите са вляво!), вертикално – светимостта в логаритмична скала. Щракнете където и да е в
        диаграмата, за да разберете каква би била звезда на това място.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="hr-plot">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
          <linearGradient id="hr-ms" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#93c5fd" />
            <stop offset="0.5" stopColor="#fef3c7" />
            <stop offset="1" stopColor="#f87171" />
          </linearGradient>
        </defs>

        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" className="cursor-crosshair" onClick={onPlotClick} />

        <g clipPath="url(#hr-plot)" pointerEvents="none">
          {/* Линии на постоянен радиус */}
          {showRadii &&
            RADII.map(R => {
              const Ta = 45000;
              const Tb = 2400;
              return (
                <g key={R}>
                  <line x1={hx(Ta)} y1={hy(lumOf(R, Ta))} x2={hx(Tb)} y2={hy(lumOf(R, Tb))} stroke="white" strokeOpacity="0.18" strokeDasharray="4 4" />
                </g>
              );
            })}
          {/* Главната последователност като широка ивица */}
          {showRegions && (
            <polyline
              points={Array.from({ length: 60 }, (_, i) => {
                const M = 0.08 * 1000 ** (i / 59);
                return `${hx(msTemperature(M))},${hy(msLuminosity(M))}`;
              }).join(' ')}
              fill="none"
              stroke="url(#hr-ms)"
              strokeOpacity="0.18"
              strokeWidth="26"
              strokeLinecap="round"
            />
          )}
          {dots.map((d, i) => (
            <circle key={i} cx={hx(d.T)} cy={hy(d.L)} r={d.kind === 'supergiant' ? 2.6 : d.kind === 'giant' ? 2.2 : 1.7} fill={temperatureToRGB(d.T)} fillOpacity="0.85" />
          ))}
        </g>

        {showRadii &&
          RADII.map(R => {
            // Етикет там, където линията пресича горния ръб или левия ръб
            const Ttop = T_SUN * (10 ** LOG_L_MAX / (R * R)) ** 0.25;
            const lx = Ttop < 45000 && Ttop > 2400 ? hx(Ttop) : X0 + 4;
            const ly = Ttop < 45000 && Ttop > 2400 ? Y0 + 10 : hy(lumOf(R, 45000)) - 3;
            if (ly > Y1 || ly < Y0) return null;
            return (
              <text key={R} x={lx + 3} y={ly} fontSize="9" fill="white" fillOpacity="0.45">
                {R >= 1 ? fmt(R, 0) : fmt(R, 3)} R☉
              </text>
            );
          })}
        {showRegions &&
          REGIONS.map(r => (
            <text key={r.name} x={r.x} y={r.y} fontSize="11" textAnchor="middle" fill={r.color} fillOpacity="0.75" fontWeight="600" transform={`rotate(${r.rotate} ${r.x} ${r.y})`} pointerEvents="none">
              {r.name}
            </text>
          ))}

        {/* Известните звезди */}
        {sample === 'famous' &&
          STARS.map(s => {
            const sel = s.id === starId;
            return (
              <g
                key={s.id}
                className="cursor-pointer"
                onClick={() => {
                  setStarId(s.id);
                  setProbe(null);
                }}
              >
                <circle cx={hx(s.T)} cy={hy(s.L)} r={sel ? 7 : 5} fill={temperatureToRGB(s.T)} stroke={sel ? 'white' : 'none'} strokeWidth="1.5" />
                <text x={hx(s.T) + 8} y={hy(s.L) + 3} fontSize="9.5" fill="white" fillOpacity={sel ? 1 : 0.7}>
                  {s.name}
                </text>
              </g>
            );
          })}

        {probe && (
          <g pointerEvents="none">
            <path d={`M ${hx(probe.T) - 7} ${hy(probe.L)} h 14 M ${hx(probe.T)} ${hy(probe.L) - 7} v 14`} stroke="#f472b6" strokeWidth="2" />
          </g>
        )}

        {/* Оси */}
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" stroke="white" strokeOpacity="0.3" pointerEvents="none" />
        {[40000, 20000, 10000, 6000, 4000, 3000].map(T => (
          <g key={T}>
            <line x1={hx(T)} x2={hx(T)} y1={Y1} y2={Y1 + 4} stroke="white" strokeOpacity="0.5" />
            <text x={hx(T)} y={Y1 + 15} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
              {fmt(T, 0)}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 28} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
          температура на повърхността, K
        </text>
        {CLASSES.slice(0, 7).map(c => {
          const mid = Math.sqrt(Math.min(c.to, 45000) * Math.max(c.from, 2400));
          return (
            <text key={c.letter} x={hx(mid)} y={Y0 - 8} fontSize="11" textAnchor="middle" fill={c.color} fontWeight="700">
              {c.letter}
            </text>
          );
        })}
        {L_TICKS.map(([p, label]) => (
          <g key={p}>
            <line x1={X0 - 4} x2={X0} y1={hy(10 ** p)} y2={hy(10 ** p)} stroke="white" strokeOpacity="0.5" />
            <text x={X0 - 6} y={hy(10 ** p) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
              {label}
            </text>
            <text x={X1 + 6} y={hy(10 ** p) + 3} fontSize="9" fill="white" fillOpacity="0.4">
              {fmt(M_BOL_SUN - 2.5 * p, 0)}
            </text>
          </g>
        ))}
        <text x={14} y={(Y0 + Y1) / 2} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
          светимост, L☉
        </text>
        <text x={W - 8} y={(Y0 + Y1) / 2} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.4" transform={`rotate(90 ${W - 8} ${(Y0 + Y1) / 2})`}>
          абсолютна болометрична величина
        </text>

        {/* Разпределение по класове */}
        {(() => {
          let acc = X0;
          const parts = [...classCounts.map(({ c, n }) => ({ key: c.letter, color: c.color, n })), { key: 'WD', color: '#e2e8f0', n: wdCount }];
          return parts.map(p => {
            const w = (p.n / Math.max(total, 1)) * (X1 - X0);
            const x = acc;
            acc += w;
            return (
              <g key={p.key}>
                <rect x={x} y={H - 24} width={w} height={14} fill={p.color} fillOpacity="0.85" />
                {w > 18 && (
                  <text x={x + w / 2} y={H - 14} fontSize="9" textAnchor="middle" fill="#0f172a" fontWeight="700">
                    {p.key} {Math.round((p.n / total) * 100)}%
                  </text>
                )}
              </g>
            );
          });
        })()}
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {SAMPLES.map(s => (
          <button
            key={s.id}
            onClick={() => setSample(s.id)}
            className={`px-3 py-1 rounded text-sm border ${
              s.id === sample
                ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
        <label className="text-sm flex items-center gap-1 ml-2">
          <input type="checkbox" checked={showRadii} onChange={e => setShowRadii(e.target.checked)} />
          линии на еднакъв радиус
        </label>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={showRegions} onChange={e => setShowRegions(e.target.checked)} />
          области
        </label>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-sm sm:text-base">
        {probe ? (
          <p>
            <strong>Звезда в тази точка:</strong> T ≈ {fmt(probe.T, 0)} K (клас {classOf(probe.T).letter}), L ≈{' '}
            {probe.L >= 1000 || probe.L < 0.001 ? sci(probe.L, 1) : fmt(probe.L, probe.L < 1 ? 3 : 1)} L☉ ⇒ R = √L · (T☉/T)² ≈{' '}
            {probeR < 0.1 ? fmt(probeR, 4) : fmt(probeR, probeR < 10 ? 2 : 0)} R☉
            {probeR < 0.03 ? ' – размерът на Земята: бяло джудже.' : probeR > 100 ? ' – свръхгигант.' : probeR > 8 ? ' – гигант.' : '.'}
          </p>
        ) : named && sample === 'famous' ? (
          <p>
            <strong>
              {named.name} ({named.type})
            </strong>
            : T = {fmt(named.T, 0)} K, L = {named.L >= 1000 ? sci(named.L, 1) : fmt(named.L, named.L < 1 ? 4 : 1)} L☉, R ≈{' '}
            {fmt(radiusOf(named), radiusOf(named) < 0.1 ? 4 : radiusOf(named) < 10 ? 2 : 0)} R☉, M ≈ {fmt(named.M, 2)} M☉. {named.note}
          </p>
        ) : (
          <p>{current.text}</p>
        )}
        {sample !== 'famous' && (probe || named) && <p className="mt-2 text-gray-600 dark:text-gray-400">{current.text}</p>}
      </div>
    </div>
  );
}
