import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
// Изглед отстрани
const CX = 40;
const CY = 230;
// Графика
const GX0 = 360;
const GX1 = 620;
const GY0 = 40;
const GY1 = 220;
const NB = 6;

const appSpeed = (b: number, th: number) => (b * Math.sin(th)) / (1 - b * Math.cos(th));

export default function SuperluminalLab() {
  const [beta, setBeta] = useState(0.98);
  const [deg, setDeg] = useState(15);
  const th = (deg * Math.PI) / 180;
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const bApp = appSpeed(beta, th);
  const delta = 1 / (gamma * (1 - beta * Math.cos(th)));
  const ratio = ((1 + beta * Math.cos(th)) / (1 - beta * Math.cos(th))) ** 3;
  const thOpt = (Math.acos(beta) * 180) / Math.PI;

  // Изглед отстрани: петна, изпуснати през равни интервали
  const len = Math.min(240, (CY - 60) / Math.max(Math.sin(th), 1e-3));
  const step = len / (NB - 1);
  const blobs = Array.from({ length: NB }, (_, k) => {
    const r = k * step; // βc·t_e в px
    const x = CX + r * Math.cos(th);
    const y = CY - r * Math.sin(th);
    return { x, y, k };
  });

  const yMax = Math.max(gamma * beta * 1.15, 1.5);
  const gx = (d: number) => GX0 + (d / 90) * (GX1 - GX0);
  const gy = (v: number) => GY1 - (v / yMax) * (GY1 - GY0);
  const curve = Array.from({ length: 181 }, (_, i) => {
    const d = (i / 180) * 90;
    return `${gx(d)},${gy(appSpeed(beta, (d * Math.PI) / 180))}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">„По-бързо от светлината“: струите на квазарите</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Плазма излита от ядрото на галактика почти със скоростта на светлината, под малък ъгъл към нас. Петното почти „догонва“ собствената
        си светлина – затова на небето изглежда, че се движи по-бързо от c.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <marker id="sl-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#fde68a" />
          </marker>
        </defs>
        <line x1={CX} x2={330} y1={CY + 30} y2={CY + 30} stroke="#fde68a" strokeWidth="1.5" markerEnd="url(#sl-arrow)" />
        <text x={325} y={CY + 46} fontSize="10" textAnchor="end" fill="#fde68a">
          към Земята
        </text>
        <line x1={CX} x2={CX + len * Math.cos(th) + 15} y1={CY} y2={CY - len * Math.sin(th) - 15 * Math.tan(th)} stroke="#fb923c" strokeOpacity="0.4" strokeDasharray="4 3" />
        {blobs.map(b => (
          <g key={b.k}>
            <line x1={b.x} x2={330} y1={b.y} y2={b.y} stroke="#fde68a" strokeOpacity="0.15" />
            <circle cx={b.x} cy={b.y} r={5} fill="#fb923c" fillOpacity={0.35 + (0.65 * b.k) / (NB - 1)} />
          </g>
        ))}
        <circle cx={CX} cy={CY} r={7} fill="white" />
        <text x={CX} y={CY + 20} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.7">
          ядро
        </text>
        <path d={`M ${CX + 40} ${CY} A 40 40 0 0 0 ${CX + 40 * Math.cos(th)} ${CY - 40 * Math.sin(th)}`} fill="none" stroke="white" strokeOpacity="0.5" />
        <text x={CX + 48} y={CY + 14} fontSize="10" fill="white" fillOpacity="0.8">
          θ = {deg}°
        </text>
        <text x={20} y={22} fontSize="10" fill="white" fillOpacity="0.7">
          петната са изпуснати през равни интервали Δt;
        </text>
        <text x={20} y={36} fontSize="10" fill="white" fillOpacity="0.7">
          светлината им пристига през Δt·(1 − β cos θ) = {fmt(1 - beta * Math.cos(th), 3)} Δt
        </text>

        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <line x1={GX0} x2={GX1} y1={gy(1)} y2={gy(1)} stroke="#fde68a" strokeOpacity="0.5" strokeDasharray="4 3" />
        <text x={GX1 - 4} y={gy(1) - 4} fontSize="9" textAnchor="end" fill="#fde68a">
          скоростта на светлината
        </text>
        <polyline points={curve} fill="none" stroke="#fb923c" strokeWidth="2" />
        <circle cx={gx(deg)} cy={gy(bApp)} r={5} fill="white" />
        {[0, 30, 60, 90].map(d => (
          <text key={d} x={gx(d)} y={GY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {d}°
          </text>
        ))}
        <text x={GX0 + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          видима скорост / c
        </text>
        <g fontSize="11" fill="white" transform={`translate(${GX0}, ${GY1 + 34})`}>
          <text x={0} y={0} fontWeight="700" fill={bApp > 1 ? '#fb923c' : 'white'}>
            видима скорост: {fmt(bApp, 2)}c {bApp > 1 ? '– „свръхсветлинна“!' : ''}
          </text>
          <text x={0} y={18} fillOpacity="0.8">
            струя / обратна струя: ~{ratio > 1e4 ? sci(ratio, 1) : fmt(ratio, 0)} пъти по-ярка
          </text>
          <text x={0} y={34} fontSize="10" fillOpacity="0.6">
            максимум βγ = {fmt(beta * gamma, 1)}c при θ = {fmt(thOpt, 1)}° · δ = {fmt(delta, 1)}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Истинска скорост: β = {fmt(beta, 3)}</label>
          <input type="range" min="0.5" max="0.998" step="0.001" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Ъгъл към зрителния лъч: θ = {deg}°</label>
          <input type="range" min="1" max="90" step="1" value={deg} onChange={e => setDeg(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        <button onClick={() => setDeg(Math.max(1, Math.round(thOpt)))} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          ъгъл с най-голяма видима скорост
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Видимата скорост е β_вид = β sin θ / (1 − β cos θ). Нищо не се движи по-бързо от светлината – просто по-късните петна са по-близо
        до нас и светлината им идва „на по-кратък път“. Хъбъл е видял петна в струята на M87, които се движат с ~6c. Освен това
        излъчването на приближаващата се струя е силно усилено (релативистки Доплер), а на отдалечаващата се – отслабено: затова често
        виждаме само едната струя.
      </p>
    </div>
  );
}
