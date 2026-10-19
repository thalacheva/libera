import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText, molarMass } from '../formula';
import { buildMolecule, molecularFormula, moleculeBox } from '../smiles';
import { MoleculeGroup } from '../StructuralFormula';
import RepeatUnit from './RepeatUnit';

type Monomer = { short: string; name: string; polymer: string; monomer: string; unit: string; use: string };

/** Мономерите и повтарящите се звена (със * в краищата) на полимерите от присъединяване. */
const MONOMERS: Monomer[] = [
  { short: 'PE', name: 'етен', polymer: 'полиетилен', monomer: 'C=C', unit: 'CC', use: 'торбички, фолио, бутилки за мляко' },
  { short: 'PP', name: 'пропен', polymer: 'полипропилен', monomer: 'C=CC', unit: 'CC(C)', use: 'капачки, кутии за храна, въжета' },
  { short: 'PVC', name: 'винилхлорид', polymer: 'поливинилхлорид', monomer: 'C=CCl', unit: 'CC(Cl)', use: 'тръби, дограма, изолация на кабели' },
  { short: 'PS', name: 'стирен', polymer: 'полистирен', monomer: 'C=Cc1ccccc1', unit: 'CC(c1ccccc1)', use: 'чашки за еднократна употреба, стиропор' },
  { short: 'PTFE', name: 'тетрафлуороетен', polymer: 'политетрафлуороетен (тефлон)', monomer: 'FC(F)=C(F)F', unit: 'C(F)(F)C(F)(F)', use: 'незалепващи тигани, уплътнения' },
];

const chainSmiles = (unit: string, k: number) => '*' + unit.repeat(k) + '*';
const fmt = (v: number) => v.toLocaleString('bg-BG').replace(/\s/g, ' ');

function chainLayout(m: Monomer, k: number) {
  const mol = buildMolecule(chainSmiles(m.unit, k), { zigzag: false });
  const box = moleculeBox(mol, 'semi');
  const b = 34 * Math.min(1, 440 / ((box.maxX - box.minX) * 34));
  return { mol, box, b, height: (box.maxY - box.minY) * b };
}

/** Верига от k звена – полуструктурна формула с отворени краища. */
function Chain({ m, k, y }: { m: Monomer; k: number; y: number }) {
  const { mol, box, b } = chainLayout(m, k);
  return <MoleculeGroup mol={mol} mode="semi" bond={b} x={240 - ((box.minX + box.maxX) / 2) * b} y={y - box.minY * b} />;
}

export default function AdditionPolymerLab() {
  const [mi, setMi] = useState(0);
  const [k, setK] = useState(3);
  const [n, setN] = useState(1000);
  const m = MONOMERS[mi];
  const formula = molecularFormula(m.monomer);
  const M = molarMass(formula);

  // Мономерът и звеното в скоби – една до друга
  const mono = buildMolecule(m.monomer, { zigzag: false });
  const unit = buildMolecule('*' + m.unit + '*', { zigzag: false });
  const bond = 34;
  const mb = moleculeBox(mono, 'semi');
  const ub = moleculeBox(unit, 'semi');
  const top = 26;
  const mbond = Math.min(bond, 165 / (mb.maxX - mb.minX));
  const monoX = 118 - ((mb.minX + mb.maxX) / 2) * mbond;
  const unitX = 345 - ((ub.minX + ub.maxX) / 2) * bond;
  const unitY = top - Math.min(mb.minY * mbond, ub.minY * bond);
  const chainY = unitY + Math.max(mb.maxY * mbond, ub.maxY * bond) + 50;
  const height = Math.ceil(chainY + 10 + chainLayout(m, k).height + 12);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MONOMERS.map((x, i) => (
          <DiagramButton key={x.short} active={i === mi} onClick={() => setMi(i)}>
            {x.name} → {x.short}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 480 ${height}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={monoX + mb.minX * mbond - 6} y={unitY + ((mb.minY + mb.maxY) / 2) * mbond} textAnchor="end" fontSize="15" fontWeight="700" dominantBaseline="central" fill="currentColor">
          n
        </text>
        <MoleculeGroup mol={mono} mode="semi" bond={mbond} x={monoX} y={unitY} />
        <text x={222} y={unitY + ((mb.minY + mb.maxY) / 2) * mbond} fontSize="22" textAnchor="middle" dominantBaseline="central" className="fill-amber-600 dark:fill-amber-400">
          →
        </text>
        <RepeatUnit mol={unit} mode="semi" bond={bond} x={unitX} y={unitY} />
        <text x={118} y={unitY + mb.maxY * mbond + 14} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          мономер: {m.name}
        </text>
        <text x={345} y={unitY + ub.maxY * bond + 14} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          повтарящо се звено
        </text>
        <line x1={20} x2={460} y1={chainY - 16} y2={chainY - 16} className="stroke-gray-200 dark:stroke-gray-700" />
        <text x={20} y={chainY - 2} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          част от веригата – {k} {k === 1 ? 'звено' : 'звена'}:
        </text>
        <Chain m={m} k={k} y={chainY + 10} />
      </LabSvg>

      <Sliders>
        <Slider label="звена" value={k} onChange={setK} min={1} max={4} step={1} tone="amber" />
        <Slider label="степен n" value={n} onChange={setN} min={100} max={20000} step={100} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'мономер:', value: `${formulaText(formula)}, M = ${fmt(M)} g/mol` },
            { label: 'звено:', value: `${fmt(M)} g/mol` },
            { label: 'M(полимер) = n · M(звено) =', value: `${fmt(n * M)} g/mol`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="emerald">
        {m.polymer} ({m.short}): {m.use}.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При присъединителната полимеризация двойната връзка C=C се „отваря“ и мономерите се свързват един за друг. Друго вещество не се
        отделя, затова звеното има същия състав и същата моларна маса като мономера. Краищата на истинската верига са други групи, но
        при хиляди звена масата им е пренебрежимо малка.
      </p>
    </div>
  );
}
