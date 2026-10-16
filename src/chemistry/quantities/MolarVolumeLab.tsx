import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText, molarMass } from '../formula';

const R = 8.314;
const GASES = ['H2', 'He', 'N2', 'O2', 'CO2', 'Cl2'];
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// Цилиндър с бутало: обемът в литри → височина в пиксели
const CYL = { x: 70, w: 90, bottom: 226 };
const PX_PER_L = 4.4;
const yOf = (V: number) => CYL.bottom - V * PX_PER_L;
// Диаграма с масите вдясно
const BAR = { x: 290, max: 150, top: 62, row: 26 };

/** Един мол от различни газове: еднакъв обем, различна маса. Обемът зависи само от температурата и налягането. */
export default function MolarVolumeLab() {
  const [gas, setGas] = useState('O2');
  const [t, setT] = useState(0);
  const [p, setP] = useState(101.3);

  const T = t + 273.15;
  const V = (R * T) / p; // в литри, защото p е в kPa
  const M = molarMass(gas);
  const masses = GASES.map(g => ({ g, M: molarMass(g) }));
  const maxM = Math.max(...masses.map(m => m.M));
  const normal = t === 0 && Math.abs(p - 101.3) < 0.05;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {GASES.map(g => (
          <DiagramButton key={g} active={g === gas} onClick={() => setGas(g)}>
            {formulaText(g)}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* Цилиндър с газ и бутало */}
        <rect x={CYL.x} y={yOf(V)} width={CYL.w} height={V * PX_PER_L} className="fill-sky-200/70 dark:fill-sky-500/30" />
        <rect x={CYL.x - 2} y={yOf(V) - 10} width={CYL.w + 4} height={10} rx="2" className="fill-gray-500 dark:fill-gray-400" />
        <line x1={CYL.x + CYL.w / 2} x2={CYL.x + CYL.w / 2} y1={yOf(V) - 10} y2={12} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="5" />
        <path d={`M ${CYL.x} 20 L ${CYL.x} ${CYL.bottom} L ${CYL.x + CYL.w} ${CYL.bottom} L ${CYL.x + CYL.w} 20`} className="fill-none stroke-gray-600 dark:stroke-gray-300" strokeWidth="2.5" />
        <text x={CYL.x + CYL.w / 2} y={CYL.bottom - 12} fontSize="13" fontWeight="700" textAnchor="middle" className="fill-sky-900 dark:fill-sky-100">
          1 mol {formulaText(gas)}
        </text>
        {/* Отметки: 22,4 L отляво, 24,5 L отдясно – за да не се застъпват */}
        <line x1={CYL.x - 8} x2={CYL.x + CYL.w} y1={yOf(22.41)} y2={yOf(22.41)} className="stroke-emerald-600" strokeDasharray="4 3" strokeWidth="1.5" />
        <text x={CYL.x - 12} y={yOf(22.41) + 4} fontSize="11" textAnchor="end" className="fill-emerald-700 dark:fill-emerald-400">
          22,4 L
        </text>
        <line x1={CYL.x} x2={CYL.x + CYL.w + 8} y1={yOf(24.47)} y2={yOf(24.47)} className="stroke-amber-600" strokeDasharray="4 3" strokeWidth="1.5" />
        <text x={CYL.x + CYL.w + 12} y={yOf(24.47) + 4} fontSize="11" className="fill-amber-700 dark:fill-amber-400">
          24,5 L
        </text>
        <text x={CYL.x + CYL.w / 2} y={244} fontSize="12" textAnchor="middle" fill="currentColor">
          V = {fmt(V)} L
        </text>

        {/* Масите на 1 mol от всеки газ */}
        <text x={BAR.x + 60} y={30} fontSize="12" fontWeight="600" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          маса на 1 mol при същия обем
        </text>
        {masses.map(({ g, M: m }, i) => {
          const y = BAR.top + i * BAR.row;
          const active = g === gas;
          return (
            <g key={g} style={{ cursor: 'pointer' }} onClick={() => setGas(g)}>
              <text x={BAR.x - 8} y={y + 4} fontSize="12" fontWeight={active ? 700 : 400} textAnchor="end" fill="currentColor">
                {formulaText(g)}
              </text>
              <rect x={BAR.x} y={y - 8} width={Math.max(2, (m / maxM) * BAR.max)} height={16} rx="3" className={active ? 'fill-amber-500' : 'fill-gray-300 dark:fill-gray-600'} />
              <text x={BAR.x + (m / maxM) * BAR.max + 6} y={y + 4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
                {fmt(m, 0)} g
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="t, °C" value={t} onChange={setT} min={-50} max={150} step={5} tone="rose" />
        <Slider label="p, kPa" value={p} onChange={setP} min={80} max={200} step={0.1} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={normal} onClick={() => {
            setT(0);
            setP(101.3);
          }}>
          нормални условия (0 °C, 101,3 kPa)
        </DiagramButton>
        <DiagramButton active={t === 25 && Math.abs(p - 101.3) < 0.05} onClick={() => {
            setT(25);
            setP(101.3);
          }}>
          стайни условия (25 °C, 101,3 kPa)
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Vm =', value: `${fmt(V, 2)} L/mol`, tone: 'blue' },
            { label: 'm =', value: `${fmt(M, 0)} g`, tone: 'amber' },
            { label: 'ρ = m/V =', value: `${fmt(M / V, 2)} g/L`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone="blue">Смени газа: обемът не се променя – променя се само масата. Смени температурата или налягането: обемът се мени еднакво за всички газове.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Обемът е пресметнат от <span className="font-mono">pV = nRT</span> за n = 1 mol. Зелената линия е моларният обем при нормални условия
        (22,4 L), жълтата – при 25 °C (24,5 L). Реалните газове се отклоняват малко от тези стойности – най-много лесно втечнимите като хлора.
      </p>
    </div>
  );
}
