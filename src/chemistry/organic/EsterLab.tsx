import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText, molarMass } from '../formula';
import { molecularFormula } from '../smiles';
import { Molecule } from '../StructuralFormula';

// Киселината и алкохолът се задават с въглеводородния си остатък в SMILES
const ACIDS = [
  { name: 'метанова', ester: 'метаноат', r: '' },
  { name: 'етанова', ester: 'етаноат', r: 'C' },
  { name: 'пропанова', ester: 'пропаноат', r: 'CC' },
  { name: 'бутанова', ester: 'бутаноат', r: 'CCC' },
];
const ALCOHOLS = [
  { name: 'метанол', ester: 'метилов', r: 'C' },
  { name: 'етанол', ester: 'етилов', r: 'CC' },
  { name: 'пропан-1-ол', ester: 'пропилов', r: 'CCC' },
  { name: 'бутан-1-ол', ester: 'бутилов', r: 'CCCC' },
  { name: '3-метилбутан-1-ол', ester: '3-метилбутилов', r: 'CCC(C)C' },
  { name: 'октан-1-ол', ester: 'октилов', r: 'CCCCCCCC' },
];
// Мирисите са приблизителни описания от литературата; при високи концентрации много естери миришат „химически“
const SMELL: Record<string, string> = {
  'метилов етаноат': 'на лепило, плодов',
  'етилов метаноат': 'на ром',
  'етилов етаноат': 'на лак за нокти; разреден – плодов',
  'пропилов етаноат': 'на круша',
  'бутилов етаноат': 'плодов, на ябълка',
  '3-метилбутилов етаноат': 'на банан',
  'октилов етаноат': 'на портокал',
  'метилов бутаноат': 'на ябълка',
  'етилов бутаноат': 'на ананас',
  'бутилов бутаноат': 'на ананас',
};

/** Добив в равновесие за киселина : алкохол = 1 : r при K = 4 (x – молове естер на мол киселина). */
const equilibriumYield = (r: number, K = 4) => {
  const A = K - 1;
  const B = -K * (1 + r);
  const C = K * r;
  return (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
};
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Естерификация: киселина + алкохол ⇌ естер + вода – строеж, име, мирис и равновесен добив. */
export default function EsterLab() {
  const [ai, setAi] = useState(1);
  const [li, setLi] = useState(1);
  const [ratio, setRatio] = useState(1);
  const acid = ACIDS[ai];
  const alc = ALCOHOLS[li];
  const smiles = `${acid.r}C(=O)O${alc.r}`;
  const n = acid.r.length; // индексът на карбонилния C = броят атоми в остатъка на киселината
  const name = `${alc.ester} ${acid.ester}`;
  const formula = molecularFormula(smiles);
  const M = molarMass(formula);
  const x = equilibriumYield(ratio);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm font-semibold mb-1">киселина</p>
      <div className="flex flex-wrap justify-center gap-2">
        {ACIDS.map((a, i) => (
          <DiagramButton key={a.name} active={i === ai} onClick={() => setAi(i)}>
            {a.name}
          </DiagramButton>
        ))}
      </div>
      <p className="text-center text-sm font-semibold mt-3 mb-1">алкохол</p>
      <div className="flex flex-wrap justify-center gap-2">
        {ALCOHOLS.map((a, i) => (
          <DiagramButton key={a.name} active={i === li} onClick={() => setLi(i)}>
            {a.name}
          </DiagramButton>
        ))}
      </div>

      <div className="flex justify-center items-center min-h-[110px] my-3">
        <Molecule smiles={smiles} mode="skeletal" bond={40} title={name} highlightAtoms={[n, n + 1, n + 2]} />
      </div>
      <p className="text-center text-base mb-2">
        <strong>{name}</strong> · {formulaText(formula)} · M = {fmt(M, 0)} g/mol
      </p>
      <Readout
        items={[
          { label: 'мирис:', value: SMELL[name] ?? 'не е характерен', tone: 'violet' },
          { label: 'от:', value: `${acid.name} киселина + ${alc.name}` },
        ]}
      />

      <Sliders>
        <Slider label="алкохол, mol" value={ratio} onChange={setRatio} min={1} max={5} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <div className="h-5 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden max-w-md mx-auto" role="img" aria-label={`добив ${fmt(x * 100)}%`}>
          <div className="h-full bg-amber-500" style={{ width: `${x * 100}%` }} />
        </div>
        <Note tone="amber">
          На 1 mol киселина и {fmt(ratio)} mol алкохол в равновесие се превръщат {fmt(x * 100)}% от киселината – получават се {fmt(x * M)} g естер.
        </Note>
      </div>
      <Buttons>
        <DiagramButton onClick={() => setRatio(1)}>еквимоларна смес</DiagramButton>
        <DiagramButton onClick={() => setRatio(3)}>тройно повече алкохол</DiagramButton>
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Оцветената група −COO− е естерната. Името на естера е от алкохола (с окончание -илов) и киселината (с окончание -оат).
        Реакцията е обратима; тук е пресметната с константа на равновесие K ≈ 4 (стойност, измерена за етилов етаноат и използвана
        приблизително за всички). При равни количества се получават само около 2/3 от възможния естер; излишъкът от алкохол или
        отстраняването на водата изместват равновесието надясно.
      </p>
    </div>
  );
}
