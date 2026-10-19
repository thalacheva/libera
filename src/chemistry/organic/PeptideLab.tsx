import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { molarMass } from '../formula';
import { buildMolecule, moleculeBox, molecularFormula, parseSmiles } from '../smiles';

/** Аминокиселини: трибуквен код, име и страничната верига R в SMILES (за глицина R = H). */
const AMINO: { code: string; name: string; r: string }[] = [
  { code: 'Gly', name: 'глицин', r: '' },
  { code: 'Ala', name: 'аланин', r: 'C' },
  { code: 'Ser', name: 'серин', r: 'CO' },
  { code: 'Cys', name: 'цистеин', r: 'CS' },
  { code: 'Val', name: 'валин', r: 'C(C)C' },
  { code: 'Phe', name: 'фенилаланин', r: 'Cc1ccccc1' },
  { code: 'Lys', name: 'лизин', r: 'CCCCN' },
  { code: 'Glu', name: 'глутаминова киселина', r: 'CCC(=O)O' },
];
const MAX = 5;
const W = 480;
const H = 250;

const aminoMass = (r: string) => molarMass(molecularFormula(r ? `NC(${r})C(=O)O` : 'NCC(=O)O'));

/** SMILES на пептида и индексите на атомите C (карбонилен) и N на всяка пептидна връзка. */
function peptide(codes: string[]) {
  let smiles = '';
  let count = 0;
  const links: [number, number][] = [];
  codes.forEach((code, i) => {
    const { r } = AMINO.find(a => a.code === code)!;
    const nIdx = count;
    const frag = r ? `NC(${r})C(=O)` : 'NCC(=O)';
    smiles += frag;
    count += parseSmiles(frag).atoms.length;
    const cIdx = count - 2; // карбонилният C е преди =O
    if (i > 0) links[i - 1][1] = nIdx;
    if (i < codes.length - 1) links.push([cIdx, -1]);
  });
  smiles += 'O';
  return { smiles, links };
}

/** Построй пептид от аминокиселини: при всяка пептидна връзка се отделя молекула вода. */
export default function PeptideLab() {
  const [chain, setChain] = useState<string[]>(['Gly', 'Ala']);
  const add = (code: string) => setChain(c => (c.length < MAX ? [...c, code] : c));

  const { smiles, links } = peptide(chain);
  const mol = buildMolecule(smiles);
  const box = moleculeBox(mol);
  const bond = Math.min(30, (W - 20) / (box.maxX - box.minX), (H - 44) / (box.maxY - box.minY));
  const x = (W - (box.maxX - box.minX) * bond) / 2 - box.minX * bond;
  const y = (H - 24 - (box.maxY - box.minY) * bond) / 2 - box.minY * bond;
  const linkBonds = links.map(([c, n]) => mol.bonds.findIndex(b => (b.a === c && b.b === n) || (b.a === n && b.b === c)));

  const formula = molecularFormula(smiles);
  const sum = chain.reduce((s, code) => s + aminoMass(AMINO.find(a => a.code === code)!.r), 0);
  const n = chain.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Добави аминокиселина в края на веригата (до {MAX}):</p>
      <Buttons>
        {AMINO.map(a => (
          <DiagramButton key={a.code} onClick={() => add(a.code)}>
            {a.code}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setChain(c => (c.length > 1 ? c.slice(0, -1) : c))}>← махни последната</DiagramButton>
        <DiagramButton onClick={() => setChain(['Gly'])}>отначало</DiagramButton>
      </Buttons>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <MoleculeGroup mol={mol} x={x} y={y} bond={bond} highlightBonds={linkBonds} />
        <text x={8} y={H - 8} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          H₂N– (N-край) вляво · –COOH (C-край) вдясно · жълто: пептидни връзки
        </text>
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'пептид:', value: chain.join('–'), tone: 'blue' },
            { label: 'формула:', value: formula.replace(/\d+/g, d => [...d].map(c => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]).join('')) },
            { label: 'пептидни връзки:', value: `${n - 1} (отделят се ${n - 1} H₂O)` },
            { label: 'M:', value: `${sum} − ${n - 1} · 18 = ${sum - 18 * (n - 1)} g/mol`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={n >= 3 ? 'emerald' : 'amber'}>
        {n === 1
          ? 'Една аминокиселина – още няма пептидна връзка.'
          : n === 2
            ? 'Дипептид: една пептидна връзка. Биуретовата реакция още не е положителна – нужни са поне две пептидни връзки.'
            : `${n === 3 ? 'Трипептид' : n === 4 ? 'Тетрапептид' : 'Пентапептид'}: с меден(II) сулфат в основна среда дава виолетово оцветяване (биуретова реакция).`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Редът има значение: Gly–Ala и Ala–Gly са различни вещества с еднаква формула. Опитай да ги построиш. Формулата и моларната маса
        тук се смятат от самата структура – провери, че съвпадат с <span className="whitespace-nowrap">ΣM − (n − 1) · 18</span>.
      </p>
    </div>
  );
}
