import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Константа на Хенри за CO₂ спрямо 25 °C: студената вода разтваря повече CO₂ (ван 'т Хоф, ≈ 2400 K). */
const henry = (T: number) => Math.exp(2400 * (1 / (T + 273.15) - 1 / 298.15));
/**
 * Колко калциев карбонат (mg/L) разтваря водата до равновесие при парциално налягане на CO₂ p (в %)
 * и температура T. Приближение: c ∝ (K_H · p)^(1/3), като при 25 °C и 0,04% CO₂ е около 50 mg/L.
 */
const caco3 = (p: number, T: number) => 50 * ((henry(T) * p) / 0.04) ** (1 / 3);

const ATM = 0.04;
const CAVE = 0.2;
const DENSITY = 2.7e6; // g/m³ – плътност на варовика

// Графиката: CO₂ от 0,01% до 10% (логаритмично), CaCO₃ от 0 до 500 mg/L
const GX = 54;
const GW = 250;
const GY = 20;
const GH = 240;
const xOf = (p: number) => GX + ((Math.log10(p) + 2) / 3) * GW;
const yOf = (c: number) => GY + GH - (c / 500) * GH;

/** Карст: колко варовик разтваря дъждовната вода и колко се снижава повърхността. */
export default function KarstLab() {
  const [T, setT] = useState(10);
  const [soil, setSoil] = useState(2);
  const [runoff, setRunoff] = useState(500);
  const [ka, setKa] = useState(100);

  const cAtm = caco3(ATM, T);
  const cSoil = caco3(soil, T);
  const cCave = caco3(CAVE, T);
  // Водата, просмукана през почвата, разтваря варовика до cSoil; отнасяме с оттока
  const gPerM2 = (runoff / 1000) * cSoil; // g/m² за година
  const mmPerKa = (gPerM2 / DENSITY) * 1e6;
  const lowered = (mmPerKa * ka) / 1000; // m
  const excess = Math.max(0, cSoil - cCave);

  const curve = Array.from({ length: 61 }, (_, i) => {
    const p = 10 ** (-2 + (i / 60) * 3);
    return `${i ? 'L' : 'M'}${xOf(p).toFixed(1)} ${yOf(Math.min(500, caco3(p, T))).toFixed(1)}`;
  }).join('');

  // Разрезът: мащабът се смалява, ако снижаването е голямо
  const BX = 360;
  const BW = 260;
  const TOP = 40;
  const PXM = Math.min(3.6, 120 / Math.max(lowered, 1));
  const surf = TOP + lowered * PXM;
  const doline = Math.min(60, lowered * 2.2) * PXM;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Графика на разтворимостта */}
        <rect x={GX} y={GY} width={GW} height={GH} className="fill-sky-50 dark:fill-slate-900" />
        {[0, 100, 200, 300, 400, 500].map(c => (
          <g key={c}>
            <line x1={GX} y1={yOf(c)} x2={GX + GW} y2={yOf(c)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX - 5} y={yOf(c) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {c}
            </text>
          </g>
        ))}
        {[0.01, 0.1, 1, 10].map(p => (
          <text key={p} x={xOf(p)} y={GY + GH + 14} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {fmt(p, p < 1 ? 2 : 0)}
          </text>
        ))}
        <text x={GX + GW / 2} y={GY + GH + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          CO₂ във въздуха над водата, %
        </text>
        <text x={14} y={GY + GH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${GY + GH / 2})`}>
          разтворен CaCO₃, mg/L
        </text>
        <path d={curve} fill="none" className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="2.2" />
        {[
          { p: ATM, c: cAtm, name: 'въздух', cls: 'fill-gray-600' },
          { p: CAVE, c: cCave, name: 'пещера', cls: 'fill-violet-600' },
          { p: soil, c: cSoil, name: 'почва', cls: 'fill-amber-700' },
        ].map(m => (
          <g key={m.name}>
            <circle cx={xOf(m.p)} cy={yOf(m.c)} r={5} className={m.cls} />
            <text x={xOf(m.p) - 6} y={yOf(m.c) - 9} fontSize="10" textAnchor="end" className="fill-gray-700 dark:fill-gray-200">
              {m.name}
            </text>
          </g>
        ))}
        {excess > 0 && (
          <line x1={xOf(CAVE)} y1={yOf(cSoil)} x2={xOf(CAVE)} y2={yOf(cCave)} className="stroke-violet-600" strokeWidth="2" strokeDasharray="4 3" />
        )}

        {/* Разрез на варовиково плато */}
        <rect x={BX} y={TOP} width={BW} height={250} className="fill-stone-300 dark:fill-stone-600" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={BX} y1={TOP + 25 + i * 26} x2={BX + BW} y2={TOP + 25 + i * 26} className="stroke-stone-400 dark:stroke-stone-500" strokeWidth="0.8" />
        ))}
        {/* Изтритият слой – над новата повърхност */}
        <rect x={BX} y={TOP} width={BW} height={Math.max(0, surf - TOP)} className="fill-white dark:fill-gray-800" />
        <line x1={BX} y1={TOP} x2={BX + BW} y2={TOP} className="stroke-gray-500" strokeDasharray="5 4" />
        <text x={BX + BW - 4} y={TOP - 5} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          повърхността в началото
        </text>
        {/* Въртоп (понижение над пукнатина) и почва */}
        <path
          d={`M${BX} ${surf}L${BX + 90} ${surf}Q${BX + 130} ${surf + doline} ${BX + 170} ${surf}L${BX + BW} ${surf}L${BX + BW} ${surf + 8}L${BX + 170} ${surf + 8}Q${BX + 130} ${surf + doline + 8} ${BX + 90} ${surf + 8}L${BX} ${surf + 8}Z`}
          className="fill-amber-800/70 dark:fill-amber-700/70"
        />
        {/* Пещерна галерия с капеща вода */}
        <path d={`M${BX + 40} 250 Q${BX + 130} 205 ${BX + 230} 250 Q${BX + 130} 268 ${BX + 40} 250Z`} className="fill-gray-800 dark:fill-black" />
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${BX + 95 + i * 22} ${226 + Math.abs(i - 1.5) * 4}l3 ${8 + i * 2}l3 ${-(8 + i * 2)}Z`} className="fill-stone-100" />
        ))}
        <line x1={BX + 130} y1={surf + doline} x2={BX + 130} y2={216} className="stroke-sky-500" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={BX + 6} y={286} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          снижаване за {fmt(ka)} хил. г.: {fmt(lowered, 1)} m
        </text>
        <line x1={BX + BW - 8} y1={186} x2={BX + BW - 8} y2={186 - 10 * PXM} className="stroke-gray-900 dark:stroke-white" strokeWidth="2.5" />
        <text x={BX + BW - 12} y={186 - 5 * PXM + 4} fontSize="10" textAnchor="end" className="fill-gray-900 dark:fill-white">
          10 m
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Плъзгачите: температура, CO₂ в почвения въздух, отток (колко от валежите се просмуква и изтича), време в хиляди години.
      </p>
      <Sliders>
        <Slider label="T, °C" value={T} onChange={setT} min={0} max={30} step={1} tone="rose" />
        <Slider label="CO₂, %" value={soil} onChange={setSoil} min={0.1} max={5} step={0.1} tone="amber" />
        <Slider label="R, mm" value={runoff} onChange={setRunoff} min={100} max={1500} step={50} tone="blue" />
        <Slider label="хил. г" value={ka} onChange={setKa} min={0} max={500} step={10} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'дъжд (въздух)', value: `${fmt(cAtm)} mg/L` },
            { label: 'след почвата', value: `${fmt(cSoil)} mg/L`, tone: 'amber' },
            { label: 'отлага се в пещерата до', value: `${fmt(excess)} mg/L`, tone: 'violet' },
            { label: 'снижаване', value: `${fmt(mmPerKa, 1)} mm за 1000 г.`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
}
