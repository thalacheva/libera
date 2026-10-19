import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { RadicalDot } from './CurlyArrow';
import { moleculeBox } from '../smiles';
import { at, carbonNeighbors, centered, radicalAtoms, semi } from './mechanismGeom';

type Alkene = {
  name: string;
  smiles: string;
  /** Карбокатионите: [по-стабилен, по-малко стабилен]. */
  cations: [string, string];
  /** Продуктите по Марковников – X е мястото на халогена (или OH). */
  products: [string, string];
  /** С HBr и пероксиди: радикалите след присъединяване на Br· и продуктите. */
  radicals: [string, string];
  antiProducts: [string, string];
  note?: string;
};

const ALKENES: Alkene[] = [
  {
    name: 'пропен',
    smiles: 'C=CC',
    cations: ['C[CH+]C', '[CH2+]CC'],
    products: ['CC(X)C', 'XCCC'],
    radicals: ['BrC[CH]C', '[CH2]C(Br)C'],
    antiProducts: ['BrCCC', 'CC(Br)C'],
  },
  {
    name: 'бут-1-ен',
    smiles: 'C=CCC',
    cations: ['C[CH+]CC', '[CH2+]CCC'],
    products: ['CC(X)CC', 'XCCCC'],
    radicals: ['BrC[CH]CC', '[CH2]C(Br)CC'],
    antiProducts: ['BrCCCC', 'CC(Br)CC'],
  },
  {
    name: '2-метилпропен',
    smiles: 'C=C(C)C',
    cations: ['C[C+](C)C', '[CH2+]C(C)C'],
    products: ['CC(C)(X)C', 'XCC(C)C'],
    radicals: ['BrC[C](C)C', '[CH2]C(C)(C)Br'],
    antiProducts: ['BrCC(C)C', 'CC(C)(Br)C'],
  },
  {
    name: '2-метилбут-2-ен',
    smiles: 'CC=C(C)C',
    cations: ['CC[C+](C)C', 'C[CH+]C(C)C'],
    products: ['CCC(X)(C)C', 'CC(X)C(C)C'],
    radicals: ['CC(Br)[C](C)C', 'C[CH]C(C)(C)Br'],
    antiProducts: ['CC(Br)C(C)C', 'CCC(C)(C)Br'],
    note: 'И двата въглерода на двойната връзка имат заместители, но единият е свързан с два въглерода, другият – с един. Карбокатионът на по-заместения въглерод е третичен.',
  },
  {
    name: 'стирен',
    smiles: 'C=Cc1ccccc1',
    cations: ['C[CH+]c1ccccc1', '[CH2+]Cc1ccccc1'],
    products: ['CC(X)c1ccccc1', 'XCCc1ccccc1'],
    radicals: ['BrC[CH]c1ccccc1', '[CH2]C(Br)c1ccccc1'],
    antiProducts: ['BrCCc1ccccc1', 'CC(Br)c1ccccc1'],
    note: 'Карбокатионът до бензеновия пръстен (бензилов) е особено стабилен: положителният заряд се „размазва“ по пръстена (резонанс).',
  },
];

type Reagent = { key: string; label: string; x: string; peroxide?: boolean };
const REAGENTS: Reagent[] = [
  { key: 'HBr', label: 'HBr', x: 'Br' },
  { key: 'HCl', label: 'HCl', x: 'Cl' },
  { key: 'H2O', label: 'H₂O (H⁺)', x: 'O' },
  { key: 'HBrROOR', label: 'HBr + пероксид', x: 'Br', peroxide: true },
];

const DEGREE = ['', 'първичен', 'вторичен', 'третичен'];
const B = 40;
const FS = 12.5;
const opts = { bond: B, fs: FS };

/** Индекс на хетероатома (халоген или O) в продукта – за подчертаване. */
const heteroAtom = (smiles: string) => semi(smiles).atoms.findIndex(a => a.el !== 'C');

/** Присъединяване на HX към несиметричен алкен: кой карбокатион (или радикал) е по-стабилен и кой е основният продукт. */
export default function MarkovnikovLab() {
  const [ai, setAi] = useState(0);
  const [ri, setRi] = useState(0);
  const alkene = ALKENES[ai];
  const reagent = REAGENTS[ri];
  const per = !!reagent.peroxide;

  const inter = (per ? alkene.radicals : alkene.cations).map(s => semi(s));
  const prods = (per ? alkene.antiProducts : alkene.products).map(s => s.replace('X', reagent.x));
  const centers = inter.map(m => (per ? radicalAtoms(m)[0] : m.atoms.findIndex(a => a.charge !== 0)));
  const degrees = inter.map((m, i) => carbonNeighbors(m, centers[i]));

  // Височината на всеки ред следва молекулите в него (пръстени и разклонения надолу са по-високи)
  const height = (m: ReturnType<typeof semi>) => {
    const b = moleculeBox(m, 'semi');
    return (b.maxY - b.minY) * B;
  };
  const startMol = semi(alkene.smiles);
  const prodMols = prods.map(s => semi(s));
  const h0 = height(startMol);
  const hI = Math.max(...inter.map(height));
  const hP = Math.max(...prodMols.map(height));
  const textY = 8 + h0 + 12;
  const cardTop = textY + 16;
  const cardH = hI + 30;
  const prodTop = cardTop + cardH + 26;
  const total = prodTop + hP + 22;

  const start = centered(startMol, 240, 8 + h0 / 2, opts);
  const cards = inter.map((m, i) => centered(m, i === 0 ? 120 : 360, cardTop + 4 + hI / 2, { ...opts, hl: [centers[i]] }));
  const products = prods.map((s, i) => centered(prodMols[i], i === 0 ? 120 : 360, prodTop + hP / 2, { ...opts, hl: [heteroAtom(s)] }));
  const kind = per ? 'радикал' : 'карбокатион';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ALKENES.map((a, i) => (
          <DiagramButton key={a.name} active={i === ai} onClick={() => setAi(i)}>
            {a.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {REAGENTS.map((r, i) => (
          <DiagramButton key={r.key} active={i === ri} onClick={() => setRi(i)}>
            {r.label}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 480 ${Math.round(total)}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <MoleculeGroup mol={start.mol} mode="semi" x={start.x} y={start.y} bond={B} fontSize={FS} />
        <text x={240} y={textY} fontSize={12} textAnchor="middle" className="fill-gray-500">
          + {reagent.label}: {per ? 'първо се присъединява Br·' : 'първо се присъединява H⁺'}
        </text>
        {/* разклонение към двете възможности */}
        <g className="stroke-gray-400" strokeWidth={1.4} fill="none">
          <path d={`M 200 ${textY + 4} L 140 ${cardTop}`} />
          <path d={`M 280 ${textY + 4} L 340 ${cardTop}`} />
        </g>
        {[0, 1].map(i => {
          const x0 = i === 0 ? 10 : 250;
          const good = i === 0;
          return (
            <g key={i}>
              <rect x={x0} y={cardTop} width={220} height={cardH} rx={8} className={good ? 'fill-emerald-50 stroke-emerald-500 dark:fill-emerald-900/30' : 'fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600'} strokeWidth={1.4} />
              <MoleculeGroup mol={cards[i].mol} mode="semi" x={cards[i].x} y={cards[i].y} bond={B} fontSize={FS} highlightAtoms={cards[i].hl} />
              {per && <RadicalDot at={at(cards[i], centers[i])} angle={-90} r={13} />}
              <text x={x0 + 110} y={cardTop + cardH - 7} fontSize={11} textAnchor="middle" className={good ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-gray-500'}>
                {DEGREE[degrees[i]]} {kind} {good ? '– по-стабилен' : '– по-нестабилен'}
              </text>
              <path d={`M ${x0 + 110} ${cardTop + cardH + 3} L ${x0 + 110} ${prodTop - 4}`} className={good ? 'stroke-emerald-500' : 'stroke-gray-300 dark:stroke-gray-600'} strokeWidth={good ? 2.4 : 1.2} strokeDasharray={good ? undefined : '4 3'} />
              <MoleculeGroup mol={products[i].mol} mode="semi" x={products[i].x} y={products[i].y} bond={B} fontSize={FS} highlightAtoms={products[i].hl} />
              <text x={x0 + 110} y={prodTop + hP + 14} fontSize={12} fontWeight={600} textAnchor="middle" className={good ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-gray-500'}>
                {good ? 'основен продукт' : 'страничен (малко или никак)'}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Note tone={per ? 'amber' : 'emerald'}>
        {per
          ? 'С пероксиди HBr се присъединява по радикалов механизъм: първо бромен радикал се свързва с крайния въглерод, за да остане по-стабилният радикал. Затова бромът отива на по-малко заместения въглерод – обратно на правилото на Марковников (ефект на Караш).'
          : `Протонът се свързва с този въглерод от двойната връзка, който има повече водородни атоми. Така положителният заряд остава на по-заместения въглерод – ${DEGREE[degrees[0]]} карбокатион вместо ${DEGREE[degrees[1]]}. Нуклеофилът (${reagent.x === 'O' ? 'водата' : reagent.x === 'Br' ? 'Br⁻' : 'Cl⁻'}) се свързва именно там.`}
      </Note>
      {alkene.note && <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{alkene.note}</p>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Стабилност на карбокатионите (и на радикалите): третичен &gt; вторичен &gt; първичен &gt; метилов. Алкиловите групи „подпират“ въглерода
        с недостиг на електрони. С вода реакцията протича само в кисела среда (H⁺ е катализатор) и дава алкохол. Ефектът на пероксидите важи само
        за HBr – с HCl и HI не се наблюдава.
      </p>
    </div>
  );
}
