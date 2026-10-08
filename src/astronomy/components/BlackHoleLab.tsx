import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
const CX = 160;
const CY = 150;
const PX_PER_RS = 15; // 10 Rs = 150 px
const G = 6.674e-11;
const C = 2.998e8;
const M_SUN = 1.989e30;
const RS_SUN_KM = 2.953;

const PRESETS = [
  { name: 'Земята', m: 3.0e-6 },
  { name: 'Слънцето', m: 1 },
  { name: 'Звездна (10 M☉)', m: 10 },
  { name: 'GW150914 (62 M☉)', m: 62 },
  { name: 'Sgr A* (4,3 млн. M☉)', m: 4.3e6 },
  { name: 'M87* (6,5 млрд. M☉)', m: 6.5e9 },
];

function sizeOf(km: number) {
  if (km < 1e-3) return `${fmt(km * 1e6, 1)} mm – топче колкото лешник`;
  if (km < 1) return `${fmt(km * 1000, 0)} m`;
  if (km < 100) return `${fmt(km, 1)} km – колкото град`;
  if (km < 7e5) return `${fmt(km, 0)} km`;
  if (km < 1.5e8) return `${fmt(km / 696000, 1)} R☉`;
  return `${fmt(km / 1.496e8, 0)} AU${km > 4.5e9 ? ' – по-голямо от орбитата на Нептун' : ''}`;
}

export default function BlackHoleLab() {
  const [logM, setLogM] = useState(1);
  const [r, setR] = useState(3); // в единици Rs
  const M = 10 ** logM;
  const rsKm = RS_SUN_KM * M;
  const rs = rsKm * 1000;
  const rM = r * rs;

  const tidal = (2 * G * M * M_SUN * 2) / rM ** 3; // m/s² между глава и крака (2 m)
  const dilation = Math.sqrt(Math.max(0, 1 - 1 / r));
  const vEsc = Math.sqrt(1 / r) * C;
  const deadly = tidal > 300; // ~30 g разтягане

  // Астронавтът се разтяга видимо, когато приливът стане голям
  const stretch = Math.min(3, 1 + Math.max(0, Math.log10(tidal / 10)) * 0.4);
  const ax = CX + r * PX_PER_RS;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-400 dark:border-slate-500 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пътуване към черна дупка</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете масата на черната дупка и колко близо да застане астронавтът. Разстоянията са в радиуси на Шварцшилд, затова
        картината е еднаква за всяка маса – но приливните сили съвсем не са.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <circle cx={CX} cy={CY} r={3 * PX_PER_RS} fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeDasharray="5 4" />
        <circle cx={CX} cy={CY} r={1.5 * PX_PER_RS} fill="none" stroke="#fbbf24" strokeOpacity="0.7" strokeDasharray="3 3" />
        <circle cx={CX} cy={CY} r={PX_PER_RS} fill="black" stroke="#f87171" strokeWidth="1.5" />
        <text x={CX} y={CY - 3 * PX_PER_RS - 4} fontSize="9" textAnchor="middle" fill="#7dd3fc">
          последна устойчива орбита (3 Rs)
        </text>
        <text x={CX - 1.5 * PX_PER_RS - 3} y={CY + 3} fontSize="8" textAnchor="end" fill="#fde68a">
          фотонна сфера
        </text>
        <text x={CX} y={CY + PX_PER_RS + 12} fontSize="9" textAnchor="middle" fill="#fca5a5">
          хоризонт (Rs)
        </text>
        {[2, 4, 6, 8, 10].map(k => (
          <text key={k} x={CX + k * PX_PER_RS} y={H - 10} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.4">
            {k} Rs
          </text>
        ))}
        <line x1={CX} x2={CX + 10 * PX_PER_RS} y1={H - 22} y2={H - 22} stroke="white" strokeOpacity="0.2" />

        {/* Астронавтът – разтегнат по посока към дупката */}
        <g transform={`translate(${ax} ${CY}) scale(${stretch} ${1 / Math.sqrt(stretch)})`}>
          <ellipse cx={0} cy={0} rx={7} ry={3} fill={deadly ? '#f87171' : '#e2e8f0'} />
          <circle cx={8} cy={0} r={2.5} fill={deadly ? '#f87171' : '#e2e8f0'} />
        </g>
        <text x={ax} y={CY - 14} fontSize="10" textAnchor="middle" fill="white">
          🧑‍🚀 {fmt(r, 2)} Rs
        </text>

        <g fontSize="11" fill="white" transform="translate(340, 30)">
          <text x={0} y={0} fontSize="13" fontWeight="700">
            M = {M < 0.01 ? sci(M, 1) : M < 1e4 ? fmt(M, 1) : sci(M, 1)} M☉
          </text>
          <text x={0} y={20} fill="#fca5a5">
            Rs = 2GM/c² = {sizeOf(rsKm)}
          </text>
          <text x={0} y={46} fillOpacity="0.85">
            разстояние: {rM / 1000 < 1e6 ? `${fmt(rM / 1000, rM < 1e4 ? 2 : 0)} km` : sizeOf(rM / 1000)}
          </text>
          <text x={0} y={70} fill={deadly ? '#f87171' : '#86efac'} fontWeight="700">
            разтягане глава–крака: {tidal < 1e4 ? fmt(tidal / 9.81, tidal < 9.81 ? 4 : 1) : sci(tidal / 9.81, 1)} g
          </text>
          <text x={0} y={86} fontSize="10" fillOpacity="0.6">
            {deadly ? 'смъртоносно – „спагетизация“' : tidal > 10 ? 'неприятно, но поносимо' : 'не се усеща'}
          </text>
          <text x={0} y={112} fill="#fde68a">
            1 час на астронавта = {dilation > 0.001 ? fmt(1 / dilation, 3) : '∞'} часа отдалеч
          </text>
          <text x={0} y={136} fillOpacity="0.85">
            втора космическа скорост: {fmt((vEsc / C) * 100, 1)}% c
          </text>
          <text x={0} y={160} fontSize="10" fillOpacity="0.6">
            {r < 1.5 ? 'по-близо от фотонната сфера: дори светлината не може да обикаля тук' : r < 3 ? 'под последната устойчива орбита: всичко пада навътре' : 'тук може да се обикаля по орбита'}
          </text>
          <text x={0} y={180} fontSize="10" fillOpacity="0.6">
            Светлината от астронавта идва с {fmt(1 / dilation, 2)} пъти
          </text>
          <text x={0} y={194} fontSize="10" fillOpacity="0.6">
            по-дълга вълна (гравитационно червено отместване)
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Маса: {M < 0.01 ? sci(M, 1) : M < 1e4 ? fmt(M, 1) : sci(M, 1)} M☉</label>
      <input type="range" min={Math.log10(3e-6)} max="10" step="0.01" value={logM} onChange={e => setLogM(Number(e.target.value))} className="w-full" />
      <label className="block text-sm font-semibold mt-3 mb-1">Разстояние до центъра: {fmt(r, 2)} Rs</label>
      <input type="range" min="1.01" max="10" step="0.01" value={r} onChange={e => setR(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => setLogM(Math.log10(p.m))}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Приливната сила намалява като 1/M² на хоризонта: при звездна черна дупка астронавтът е разкъсан далеч преди хоризонта, а при
        свръхмасивна може да го пресече, без да усети нищо особено – и никога да не се върне.
      </p>
    </div>
  );
}
