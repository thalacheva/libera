import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { molarMass } from '../formula';
import { buildMolecule, moleculeBox } from '../smiles';
import { iupacName } from './hydrocarbonNames';

// Температури на кипене на нормалните алкани C1–C10, °C (справочни данни)
const BP = [-161.5, -88.6, -42.1, -0.5, 36.1, 68.7, 98.4, 125.6, 150.8, 174.1];

const SERIES = [
  { bond: 1 as const, label: 'алкани', general: '\\mathrm{C}_n\\mathrm{H}_{2n+2}' },
  { bond: 2 as const, label: 'алкени', general: '\\mathrm{C}_n\\mathrm{H}_{2n}' },
  { bond: 3 as const, label: 'алкини', general: '\\mathrm{C}_n\\mathrm{H}_{2n-2}' },
];

const W = 480;
const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('bg-BG', { maximumFractionDigits: 1 });
const k = (v: number) => (v === 1 ? '' : String(v));

/** Хомоложен ред: формула, моларна маса, уравнение на горенето и температурите на кипене на алканите. */
export default function HomologLab() {
  const [si, setSi] = useState(0);
  const [n, setN] = useState(4);
  const s = SERIES[si];
  const minN = s.bond === 1 ? 1 : 2;
  const nn = Math.max(n, minN);
  const H = 2 * nn + 2 - 2 * (s.bond - 1);
  const formula = `C${nn > 1 ? nn : ''}H${H}`;
  const smiles = s.bond === 1 ? 'C'.repeat(nn) : 'C' + (s.bond === 2 ? '=' : '#') + 'C'.repeat(nn - 1);
  const name = iupacName({ n: nn, bond: s.bond, bondPos: s.bond === 1 ? 0 : 1, subs: [] });

  // CₓHᵧ + (x + y/4) O₂ → x CO₂ + y/2 H₂O, с цели коефициенти
  const f = (nn + H / 4) % 1 === 0 ? 1 : 2;
  const eq = `${k(f)}\\mathrm{${formula.replace(/(\d+)/g, '_{$1}')}} + ${f * (nn + H / 4)}\\mathrm{O_2} \\to ${k(f * nn)}\\mathrm{CO_2} + ${k((f * H) / 2)}\\mathrm{H_2O}`;

  // Чертеж на молекулата
  const mol = buildMolecule(smiles);
  const box = moleculeBox(mol);
  const bond = Math.min(46, (W - 40) / (box.maxX - box.minX));
  const mh = (box.maxY - box.minY) * bond;
  const ox = (W - (box.maxX - box.minX) * bond) / 2 - box.minX * bond;
  const oy = 8 - box.minY * bond;

  // Графика на температурите на кипене
  const top = mh + 30;
  const gx = (i: number) => 60 + (i - 1) * 44;
  const gy = (t: number) => top + 16 + ((200 - t) / 380) * 170;
  const height = top + 16 + 170 + 30;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SERIES.map((x, i) => (
          <DiagramButton key={x.label} active={i === si} onClick={() => setSi(i)}>
            {x.label} <Tex>{x.general}</Tex>
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 ${W} ${height.toFixed(0)}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <MoleculeGroup mol={mol} x={ox} y={oy} bond={bond} />

        {/* Оси */}
        <text x={W / 2} y={top} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          Температура на кипене на алканите с права верига
        </text>
        {[-150, -100, -50, 0, 50, 100, 150, 200].map(t => (
          <g key={t}>
            <line x1={50} x2={460} y1={gy(t)} y2={gy(t)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={44} y={gy(t) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(t)}
            </text>
          </g>
        ))}
        <line x1={50} x2={460} y1={gy(25)} y2={gy(25)} className="stroke-rose-400" strokeDasharray="5 4" />
        <text x={458} y={gy(25) - 4} fontSize="10" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          25 °C
        </text>
        {BP.map((_, i) => (
          <text key={i} x={gx(i + 1)} y={height - 12} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            C{i + 1}
          </text>
        ))}
        <polyline points={BP.map((t, i) => `${gx(i + 1)},${gy(t)}`).join(' ')} fill="none" className="stroke-amber-500" strokeWidth="2" />
        {BP.map((t, i) => (
          <circle
            key={i}
            cx={gx(i + 1)}
            cy={gy(t)}
            r={s.bond === 1 && i + 1 === nn ? 7 : 4}
            className={s.bond === 1 && i + 1 === nn ? 'fill-blue-500 stroke-white dark:stroke-gray-800' : 'fill-amber-500 stroke-white dark:stroke-gray-800'}
            strokeWidth="2"
          />
        ))}
        <text x={58} y={gy(-130)} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          газове при стайна температура
        </text>
        <text x={gx(5) - 6} y={gy(170)} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          течности
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="n" value={nn} onChange={setN} min={minN} max={10} step={1} tone="blue" />
      </Sliders>

      <div className="mt-3 space-y-2">
        <Readout
          items={[
            { label: 'име:', value: name, tone: 'blue' },
            { label: 'формула:', value: <Tex>{`\\mathrm{${formula.replace(/(\d+)/g, '_{$1}')}}`}</Tex> },
            { label: 'M =', value: `${molarMass(formula)} g/mol` },
            ...(s.bond === 1 ? [{ label: 't кип =', value: `${fmt(BP[nn - 1])} °C` }] : []),
          ]}
        />
        <p className="text-center text-sm sm:text-base overflow-x-auto">
          <Tex>{eq}</Tex>
        </p>
      </div>
      <Note tone="emerald">Всеки следващ член на реда има една група CH₂ повече – моларната му маса е с 14 g/mol по-голяма.</Note>
      {s.bond !== 1 && (
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Графиката е за алканите. Алкените и алкините със същия брой въглеродни атоми кипят при близки температури.
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 С дължината на веригата растат моларната маса и площта на допиране между молекулите, а с тях – силите на Ван дер Ваалс.
        Затова алканите до бутана са газове, от пентана до около C₁₇ – течности, а по-дългите (парафинът) – твърди вещества.
      </p>
    </div>
  );
}
