import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText, molarMass } from '../formula';

const AIR = 29;
const VM = 22.4;
const GASES = ['H2', 'He', 'CH4', 'NH3', 'N2', 'O2', 'CO2', 'Cl2', 'SF6'];
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// Балонът е толкова по-високо, колкото по-лек е газът спрямо въздуха (логаритмична скала)
const MID = 130;
const balloonY = (M: number) => MID - Math.max(-70, Math.min(70, 50 * Math.log2(AIR / M)));
const BX = 240;

/** Балон с газ във въздуха: издига се, ако моларната маса на газа е по-малка от 29 g/mol. */
export default function GasDensityLab() {
  const [gas, setGas] = useState('He');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const M = molarMass(gas);
  const D = M / AIR;
  const y = balloonY(M);
  const verdict = Math.abs(D - 1) < 0.05 ? 'почти се рее' : D < 1 ? 'се издига' : 'пада';

  const tryInput = () => {
    try {
      molarMass(input.trim());
      setGas(input.trim());
      setError('');
    } catch {
      setError('Не разпознавам формулата. Пиши символите с главна и малка буква, напр. C3H8 или SO2.');
    }
  };

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
        {/* Стаята */}
        <rect x={20} y={14} width={440} height={222} rx="8" className="fill-sky-50 stroke-gray-300 dark:fill-slate-900 dark:stroke-gray-600" strokeWidth="1.5" />
        <line x1={20} x2={460} y1={MID} y2={MID} className="stroke-gray-400" strokeDasharray="5 4" />
        <text x={30} y={MID - 6} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          въздух: M ≈ 29 g/mol
        </text>
        <text x={450} y={34} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          по-леки от въздуха ↑
        </text>
        <text x={450} y={226} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          по-тежки от въздуха ↓
        </text>

        {/* Балонът; връвчицата – само когато се издига (тежкият балон лежи на пода) */}
        {D < 1 && <path d={`M ${BX} ${y + 34} q 8 14 0 28 q -8 14 0 26`} className="fill-none stroke-gray-500" strokeWidth="1.5" />}
        <ellipse cx={BX} cy={y} rx={30} ry={34} className={D < 1 ? 'fill-amber-300 stroke-amber-600' : 'fill-violet-300 stroke-violet-600'} strokeWidth="2" />
        <text x={BX} y={y + 5} fontSize="14" fontWeight="700" textAnchor="middle" className="fill-gray-900">
          {formulaText(gas)}
        </text>
      </LabSvg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <input
          type="text"
          aria-label="Формула на газ"
          placeholder="друга формула, напр. C3H8"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryInput()}
          className="w-52 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
        <DiagramButton onClick={tryInput}>Пусни балона</DiagramButton>
      </div>
      {error && <Note tone="rose">{error}</Note>}

      <div className="mt-3">
        <Readout
          items={[
            { label: 'M =', value: `${fmt(M, 1)} g/mol`, tone: 'amber' },
            { label: 'ρ (н.у.) = M/22,4 =', value: `${fmt(M / VM)} g/L`, tone: 'blue' },
            { label: 'D(въздух) = M/29 =', value: fmt(D) },
            { label: 'D(H₂) = M/2 =', value: fmt(M / 2, 1) },
          ]}
        />
      </div>
      <Note tone={D < 1 ? 'emerald' : 'violet'}>
        Балонът с {formulaText(gas)} {verdict}
        {verdict === 'почти се рее'
          ? ' – газът е почти толкова плътен, колкото въздуха, и решава теглото на самия балон.'
          : D < 1
            ? ` – газът е ${fmt(1 / D, 1)} пъти по-лек от въздуха.`
            : ` – газът е ${fmt(D, 1)} пъти по-тежък от въздуха.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При еднакви температура и налягане еднакви обеми газове съдържат еднакъв брой молекули, затова плътностите им се отнасят като
        моларните маси. Лабораторията не проверява дали веществото наистина е газ при стайна температура, и не отчита масата на гумата на
        балона – истинският балон с хелий се издига, защото подемната сила е по-голяма от теглото на гумата.
      </p>
    </div>
  );
}
