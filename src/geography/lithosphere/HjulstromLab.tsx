import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Диаграма на Хюлстрьом в логаритмичен мащаб: размер на зърната 0,001–1000 mm, скорост 0,1–1000 cm/s
const PX = 64;
const PW = 400;
const PY = 16;
const PH = 270;
const D_MIN = -3;
const D_MAX = 3;
const V_MIN = -1;
const V_MAX = 3;
const xOf = (d: number) => PX + ((Math.log10(d) - D_MIN) / (D_MAX - D_MIN)) * PW;
const yOf = (v: number) => PY + PH - ((Math.log10(v) - V_MIN) / (V_MAX - V_MIN)) * PH;
const dOf = (x: number) => 10 ** (D_MIN + ((x - PX) / PW) * (D_MAX - D_MIN));
const vOf = (y: number) => 10 ** (V_MIN + ((PY + PH - y) / PH) * (V_MAX - V_MIN));

/** Скорост, при която течението откъсва зърна с диаметър d (mm), cm/s – приблизително по кривата на Хюлстрьом. */
const erodeV = (d: number) => 9 * ((0.3 / d) ** 0.45 + (d / 0.3) ** 0.6);
/** Под тази скорост зърната се утаяват, cm/s. Глината и тинята почти не се утаяват в течаща вода. */
const depositV = (d: number) => 1 / (1 / (0.6 * erodeV(d)) + 1 / (6 * (d / 0.3) ** 0.9));

const GRAINS = [
  { name: 'глина', d: 0.002 },
  { name: 'тиня', d: 0.02 },
  { name: 'пясък', d: 0.3 },
  { name: 'чакъл', d: 8 },
  { name: 'валуни', d: 300 },
];
const STREAMS = [
  { name: 'поток при пълноводие', v: 300 },
  { name: 'равнинна река', v: 50 },
  { name: 'устие, делта', v: 8 },
];

type Zone = 'erosion' | 'transport' | 'deposition';
const zoneOf = (d: number, v: number): Zone => (v >= erodeV(d) ? 'erosion' : v >= depositV(d) ? 'transport' : 'deposition');
const ZONE_TEXT: Record<Zone, string> = {
  erosion: 'течението откъсва и отнася зърната – ерозия',
  transport: 'зърната, които вече се движат, продължават да се носят, но лежащите не се откъсват – пренос',
  deposition: 'течението е твърде бавно и зърната се утаяват – натрупване',
};

const curve = (f: (d: number) => number) =>
  Array.from({ length: 121 }, (_, i) => {
    const d = 10 ** (D_MIN + (i / 120) * (D_MAX - D_MIN));
    const v = Math.max(10 ** V_MIN, Math.min(10 ** V_MAX, f(d)));
    return `${i ? 'L' : 'M'}${xOf(d).toFixed(1)} ${yOf(v).toFixed(1)}`;
  }).join('');

/** Кривата на Хюлстрьом: при каква скорост реката откъсва, носи или оставя зърна с различна големина. */
export default function HjulstromLab() {
  const [pt, setPt] = useState({ d: 0.3, v: 50 });
  const [drag, setDrag] = useState(false);
  const zone = zoneOf(pt.d, pt.v);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const x = Math.max(PX, Math.min(PX + PW, p.x));
    const y = Math.max(PY, Math.min(PY + PH, p.y));
    setPt({ d: dOf(x), v: vOf(y) });
  };

  const erosionArea = curve(erodeV) + `L${PX + PW} ${PY}L${PX} ${PY}Z`;
  const depositArea = curve(depositV) + `L${PX + PW} ${PY + PH}L${PX} ${PY + PH}Z`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox="0 0 640 330"
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
        onPointerMove={move}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      >
        <defs>
          <clipPath id="hj-plot">
            <rect x={PX} y={PY} width={PW} height={PH} />
          </clipPath>
        </defs>
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-sky-50 dark:fill-slate-900" />
        <g clipPath="url(#hj-plot)">
          <path d={erosionArea} className="fill-rose-200/70 dark:fill-rose-900/50" />
          <path d={depositArea} className="fill-amber-200/80 dark:fill-amber-900/50" />
          <path d={curve(erodeV)} fill="none" className="stroke-rose-700 dark:stroke-rose-300" strokeWidth="2.2" />
          <path d={curve(depositV)} fill="none" className="stroke-amber-700 dark:stroke-amber-300" strokeWidth="2" strokeDasharray="6 4" />
        </g>
        {[-3, -2, -1, 0, 1, 2, 3].map(k => (
          <g key={`x${k}`}>
            <line x1={xOf(10 ** k)} y1={PY + PH} x2={xOf(10 ** k)} y2={PY + PH + 5} className="stroke-gray-500" />
            <text x={xOf(10 ** k)} y={PY + PH + 17} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {fmt(10 ** k, Math.max(0, -k))}
            </text>
          </g>
        ))}
        {[-1, 0, 1, 2, 3].map(k => (
          <g key={`y${k}`}>
            <line x1={PX - 5} y1={yOf(10 ** k)} x2={PX} y2={yOf(10 ** k)} className="stroke-gray-500" />
            <text x={PX - 8} y={yOf(10 ** k) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {fmt(10 ** k, Math.max(0, -k))}
            </text>
          </g>
        ))}
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-500" />
        <text x={PX + PW / 2} y={PY + PH + 32} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          диаметър на зърната, mm
        </text>
        <text x={14} y={PY + PH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${PY + PH / 2})`}>
          скорост на течението, cm/s
        </text>
        <text x={xOf(0.01)} y={yOf(400)} fontSize="12" fontWeight="bold" className="fill-rose-800 dark:fill-rose-200">
          ЕРОЗИЯ
        </text>
        <text x={xOf(3)} y={yOf(8)} fontSize="12" fontWeight="bold" className="fill-sky-800 dark:fill-sky-200">
          ПРЕНОС
        </text>
        <text x={xOf(30)} y={yOf(0.4)} fontSize="12" fontWeight="bold" className="fill-amber-800 dark:fill-amber-200">
          НАТРУПВАНЕ
        </text>
        {GRAINS.map(g => (
          <text key={g.name} x={xOf(g.d)} y={PY + 12} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {g.name}
          </text>
        ))}
        <circle
          cx={xOf(pt.d)}
          cy={yOf(pt.v)}
          r={9}
          className="fill-fuchsia-500/40 stroke-fuchsia-700 cursor-grab"
          strokeWidth="2"
          style={{ touchAction: 'none' }}
          onPointerDown={e => {
            e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
            setDrag(true);
          }}
        />
        {/* Легенда */}
        <g transform="translate(482 40)">
          <line x1={0} y1={0} x2={24} y2={0} className="stroke-rose-700 dark:stroke-rose-300" strokeWidth="2.2" />
          <text x={30} y={4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            откъсване
          </text>
          <line x1={0} y1={22} x2={24} y2={22} className="stroke-amber-700 dark:stroke-amber-300" strokeWidth="2" strokeDasharray="6 4" />
          <text x={30} y={26} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            утаяване
          </text>
          <text x={0} y={64} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
            <tspan x={0}>Най-лесно се</tspan>
            <tspan x={0} dy="14">откъсва пясъкът</tspan>
            <tspan x={0} dy="14">(около 0,3 mm).</tspan>
            <tspan x={0} dy="22">Глината е по-фина,</tspan>
            <tspan x={0} dy="14">но частиците ѝ</tspan>
            <tspan x={0} dy="14">слепват една в</tspan>
            <tspan x={0} dy="14">друга.</tspan>
          </text>
        </g>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Влачи точката или избери зърна и течение. Стойностите са приблизителни.</p>
      <Buttons>
        {GRAINS.map(g => (
          <DiagramButton key={g.name} active={Math.abs(Math.log10(pt.d / g.d)) < 0.01} onClick={() => setPt(p => ({ ...p, d: g.d }))}>
            {g.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {STREAMS.map(s => (
          <DiagramButton key={s.name} active={Math.abs(Math.log10(pt.v / s.v)) < 0.01} onClick={() => setPt(p => ({ ...p, v: s.v }))}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'зърна', value: `${fmt(pt.d, pt.d < 0.01 ? 3 : pt.d < 1 ? 2 : 0)} mm` },
            { label: 'течение', value: `${fmt(pt.v, pt.v < 10 ? 1 : 0)} cm/s` },
            { label: 'откъсва се над', value: `${fmt(erodeV(pt.d))} cm/s`, tone: 'rose' },
            { label: 'утаява се под', value: `${fmt(depositV(pt.d), depositV(pt.d) < 1 ? 2 : 0)} cm/s`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={zone === 'erosion' ? 'rose' : zone === 'transport' ? 'blue' : 'amber'}>{ZONE_TEXT[zone]}</Note>
    </div>
  );
}
