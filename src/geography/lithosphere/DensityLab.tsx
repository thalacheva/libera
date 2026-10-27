import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Средна плътност на Земята, g/cm³ – от масата и обема. */
const MEAN = 5.51;
/** Измереният момент на инерция I / (M R²) – от прецесията на земната ос и орбитите на спътниците. */
const TARGET = 0.3307;
const R_EARTH = 6371;

/** Двуслоен модел на Земята: от средната плътност и момента на инерция – колко тежко е ядрото. */
export default function DensityLab() {
  const [x, setX] = useState(0.55);
  const [rhoM, setRhoM] = useState(3.3);

  // Плътността на ядрото, при която средната плътност е 5,51
  const rhoC = rhoM + (MEAN - rhoM) / x ** 3;
  const inertia = (0.4 * (rhoM + (rhoC - rhoM) * x ** 5)) / MEAN;
  const massCore = (rhoC * x ** 3) / MEAN;
  const ok = Math.abs(inertia - TARGET) < 0.005;

  const CX = 160;
  const CY = 160;
  const RAD = 140;
  const shade = (rho: number) => {
    const t = Math.max(0, Math.min(1, (rho - 2.5) / 15));
    const c = [255 - 120 * t, 220 - 170 * t, 170 - 150 * t].map(Math.round);
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  // Скала за момента на инерция
  const SX = 360;
  const SW = 250;
  const sx = (v: number) => SX + ((v - 0.2) / 0.22) * SW;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <circle cx={CX} cy={CY} r={RAD} fill={shade(rhoM)} className="stroke-gray-500" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={RAD * x} fill={shade(rhoC)} className="stroke-gray-700" strokeWidth="1.5" />
        <text x={CX} y={CY - RAD * x - 10} fontSize="12" textAnchor="middle" className="fill-gray-900">
          мантия {fmt(rhoM, 1)}
        </text>
        <text x={CX} y={CY + 5} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-white">
          ядро {fmt(rhoC, 1)}
        </text>
        <text x={CX} y={CY + 22} fontSize="11" textAnchor="middle" className="fill-white">
          g/cm³
        </text>
        <text x={CX} y={CY + RAD + 16} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          радиус на ядрото {fmt(x * R_EARTH)} km
        </text>

        <text x={SX} y={40} fontSize="12" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
          момент на инерция I / (M R²)
        </text>
        <line x1={sx(0.2)} y1={80} x2={sx(0.42)} y2={80} className="stroke-gray-400" strokeWidth="2" />
        {[0.2, 0.25, 0.3, 0.35, 0.4].map(v => (
          <g key={v}>
            <line x1={sx(v)} y1={75} x2={sx(v)} y2={85} className="stroke-gray-400" />
            <text x={sx(v)} y={100} fontSize="10" textAnchor="middle" className="fill-gray-500">
              {fmt(v, 2)}
            </text>
          </g>
        ))}
        <line x1={sx(TARGET)} y1={60} x2={sx(TARGET)} y2={86} className="stroke-emerald-600" strokeWidth="2.5" />
        <text x={sx(TARGET)} y={56} fontSize="10" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300">
          Земята 0,331
        </text>
        <text x={sx(0.4)} y={118} fontSize="10" textAnchor="middle" className="fill-gray-500">
          еднородно кълбо
        </text>
        <circle cx={sx(Math.max(0.2, Math.min(0.42, inertia)))} cy={80} r={7} className={ok ? 'fill-emerald-500' : 'fill-rose-500'} />
        <text x={SX} y={160} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
          масата на ядрото: {fmt(massCore * 100)}% от масата на Земята
        </text>
        <text x={SX} y={182} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
          обемът на ядрото: {fmt(x ** 3 * 100, 1)}% от обема
        </text>
        <text x={SX} y={224} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          за сравнение, g/cm³: гранит 2,7 · базалт 3,0
        </text>
        <text x={SX} y={242} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          перидотит 3,3 · желязо 7,9 (без налягане)
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Плъзгачите: радиусът на ядрото като част от радиуса на Земята и плътността на мантията в g/cm³.</p>
      <Buttons>
        <DiagramButton
          active={false}
          onClick={() => {
            setX(3480 / R_EARTH);
            setRhoM(4.15);
          }}
        >
          Истинският радиус на ядрото
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="r / R" value={x} onChange={setX} min={0.2} max={0.9} step={0.01} tone="amber" />
        <Slider label="ρ мант." value={rhoM} onChange={setRhoM} min={2.7} max={5.4} step={0.05} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'плътност на ядрото', value: `${fmt(rhoC, 1)} g/cm³`, tone: 'rose' },
            { label: 'I / (M R²)', value: fmt(inertia, 3), tone: ok ? 'emerald' : 'amber' },
          ]}
        />
      </div>
      <Note tone={ok ? 'emerald' : 'amber'}>
        {ok
          ? 'Моделът отговаря и на средната плътност, и на момента на инерция на Земята.'
          : inertia > TARGET
            ? 'Масата е твърде равномерно разпределена – Земята е по-концентрирана към центъра.'
            : 'Масата е твърде струпана в центъра.'}
      </Note>
    </div>
  );
}
