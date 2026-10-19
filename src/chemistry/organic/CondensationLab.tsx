import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText, molarMass } from '../formula';
import { buildMolecule, molecularFormula, moleculeBox } from '../smiles';
import { MoleculeGroup } from '../StructuralFormula';
import RepeatUnit from './RepeatUnit';

type Monomer = { name: string; smiles: string; /** кислородът на −OH групите, които излизат с водата (подчертани) */ leave: number[] };
type Polymer = { short: string; name: string; monomers: Monomer[]; unit: string; use: string };

const POLYMERS: Polymer[] = [
  {
    short: 'PET',
    name: 'полиетилентерефталат (полиестер)',
    monomers: [
      { name: 'терефталова киселина', smiles: 'OC(=O)c1ccc(cc1)C(=O)O', leave: [0, 11] },
      { name: 'етиленгликол', smiles: 'OCCO', leave: [] },
    ],
    unit: '*OCCOC(=O)c1ccc(cc1)C(=O)*',
    use: 'бутилки за напитки, полиестерни влакна',
  },
  {
    short: 'PA 6,6',
    name: 'найлон-6,6 (полиамид)',
    monomers: [
      { name: 'хексан-1,6-диамин', smiles: 'NCCCCCCN', leave: [] },
      { name: 'адипинова киселина', smiles: 'OC(=O)CCCCC(=O)O', leave: [0, 9] },
    ],
    unit: '*NCCCCCCNC(=O)CCCCC(=O)*',
    use: 'чорапогащници, четки за зъби, въжета',
  },
  {
    short: 'PLA',
    name: 'полимлечна киселина',
    monomers: [{ name: 'млечна киселина', smiles: 'CC(O)C(=O)O', leave: [5] }],
    unit: '*OC(C)C(=O)*',
    use: 'чаши и опаковки, конци за хирургия, 3D печат',
  },
];

const fmt = (v: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: 2 }).replace(/\s/g, ' ');

/** Молекула, вписана по ширина: мащаб, отместване и височина в SVG единици. */
function fit(smiles: string, cx: number, top: number, maxW: number, maxBond = 26) {
  const mol = buildMolecule(smiles);
  const box = moleculeBox(mol, 'skeletal');
  const bond = Math.min(maxBond, maxW / (box.maxX - box.minX));
  return { mol, bond, x: cx - ((box.minX + box.maxX) / 2) * bond, y: top - box.minY * bond, height: (box.maxY - box.minY) * bond };
}

export default function CondensationLab() {
  const [pi, setPi] = useState(0);
  const [n, setN] = useState(100);
  const p = POLYMERS[pi];
  const unitM = molarMass(molecularFormula(p.unit));
  const two = p.monomers.length === 2;
  // Двата вида мономери: на всяко звено се падат по един от всеки и 2 молекули вода (без последната);
  // при млечната киселина – 1 молекула вода на звено (без последната)
  const waterPerUnit = two ? 2 : 1;
  const water = waterPerUnit * n - 1;
  const monoMass = p.monomers.reduce((s, m) => s + molarMass(molecularFormula(m.smiles)), 0) * n;
  const chainM = n * unitM + 18;

  // Подредба: мономерите горе, стрелка, звеното в скоби, надпис
  const monos = p.monomers.map((m, i) => {
    const cx = two ? (i === 0 ? 125 : 365) : 240;
    return { m, cx, f: fit(m.smiles, cx, 10, two ? 200 : 180) };
  });
  const monoH = Math.max(...monos.map(x => x.f.height));
  const capY = 10 + monoH + 12;
  const arrowY = capY + 26;
  const unit = fit(p.unit, 240, arrowY + 20, 400, 24);
  const height = Math.ceil(arrowY + 20 + unit.height + 36);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {POLYMERS.map((x, i) => (
          <DiagramButton key={x.short} active={i === pi} onClick={() => setPi(i)}>
            {x.short}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 480 ${height}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {monos.map(({ m, f, cx }) => (
          <g key={m.name}>
            <MoleculeGroup mol={f.mol} bond={f.bond} x={f.x} y={f.y} highlightAtoms={m.leave} highlightClass="fill-sky-300/60 stroke-sky-300/60" />
            <text x={cx} y={capY} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              n · {m.name}
            </text>
          </g>
        ))}
        {two && (
          <text x={245} y={10 + monoH / 2} fontSize="20" textAnchor="middle" dominantBaseline="central" fill="currentColor">
            +
          </text>
        )}
        <text x={240} y={arrowY} fontSize="13" textAnchor="middle" className="fill-sky-700 dark:fill-sky-300">
          ↓ −{waterPerUnit === 2 ? '(2n − 1)' : '(n − 1)'} H₂O
        </text>
        <RepeatUnit mol={unit.mol} bond={unit.bond} x={unit.x} y={unit.y} />
        <text x={240} y={height - 8} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          повтарящо се звено {formulaText(molecularFormula(p.unit))} ({unitM} g/mol)
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="брой звена n" value={n} onChange={setN} min={1} max={500} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'мономери:', value: `${fmt(monoMass)} g` },
            { label: 'вода:', value: `${fmt(water)} mol = ${fmt(18 * water)} g`, tone: 'blue' },
            { label: 'полимер:', value: `${fmt(chainM)} g`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="emerald">
        {fmt(monoMass)} g = {fmt(chainM)} g + {fmt(18 * water)} g – масата се запазва. {p.name}: {p.use}.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сметката е за n мола от всеки мономер, т.е. за 1 mol вериги с по n звена. При поликондензацията функционалните групи на
        съседни мономери реагират: киселината губи −OH (подчертаната група), а алкохолът или аминът – по един H. Така се отделя вода и
        звеното е по-леко от сбора на мономерите, а веригата има краища H− и −OH.
      </p>
    </div>
  );
}
