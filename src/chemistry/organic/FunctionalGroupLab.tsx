import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText } from '../formula';
import { buildMolecule, molecularFormula } from '../smiles';
import { Molecule } from '../StructuralFormula';

type Group = 'halo' | 'alcohol' | 'phenol' | 'aldehyde' | 'ketone' | 'acid' | 'ester' | 'ether' | 'amine' | 'amide';

const GROUPS: { id: Group; name: string; group: string }[] = [
  { id: 'halo', name: 'халогенопроизводно', group: '−Hal' },
  { id: 'alcohol', name: 'алкохол', group: '−OH при наситен C' },
  { id: 'phenol', name: 'фенол', group: '−OH при бензеновия пръстен' },
  { id: 'aldehyde', name: 'алдехид', group: '−CHO' },
  { id: 'ketone', name: 'кетон', group: '>C=O между два C атома' },
  { id: 'acid', name: 'карбоксилна киселина', group: '−COOH' },
  { id: 'ester', name: 'естер', group: '−COO−' },
  { id: 'ether', name: 'етер', group: '−O− между два C атома' },
  { id: 'amine', name: 'амин', group: '−NH₂' },
  { id: 'amide', name: 'амид', group: '−CONH₂' },
];

// Индексите на атомите на групата са по реда в SMILES
const MOLECULES: { name: string; smiles: string; group: Group; atoms: number[]; note: string }[] = [
  { name: 'хлороетан', smiles: 'CCCl', group: 'halo', atoms: [2], note: 'Някога се е използвал за местно обезболяване чрез охлаждане („замразяващ спрей“).' },
  { name: 'пропан-2-ол', smiles: 'CC(O)C', group: 'alcohol', atoms: [2], note: 'Вторичен алкохол – OH е при въглерод, свързан с два други C атома. Използва се за дезинфекция.' },
  { name: 'глицерол (пропан-1,2,3-триол)', smiles: 'OCC(O)CO', group: 'alcohol', atoms: [0, 3, 5], note: 'Тривалентен алкохол – три OH групи. Сладък, вискозен, влиза в състава на мазнините.' },
  { name: 'фенол', smiles: 'Oc1ccccc1', group: 'phenol', atoms: [0], note: 'OH е направо при ароматния пръстен – затова фенолът е по-силна киселина от алкохолите.' },
  { name: 'метанал (формалдехид)', smiles: 'C=O', group: 'aldehyde', atoms: [0, 1], note: 'Най-простият алдехид; воден разтвор с около 37% метанал е формалинът.' },
  { name: 'етанал', smiles: 'CC=O', group: 'aldehyde', atoms: [1, 2], note: 'Карбонилната група е в края на веригата – при въглерода има и водороден атом.' },
  { name: 'пропанон (ацетон)', smiles: 'CC(=O)C', group: 'ketone', atoms: [1, 2], note: 'Карбонилната група е вътре във веригата – въглеродът ѝ е свързан с два други C атома.' },
  { name: 'етанова (оцетна) киселина', smiles: 'CC(=O)O', group: 'acid', atoms: [1, 2, 3], note: 'Карбоксилната група съчетава карбонилна и хидроксилна група.' },
  { name: 'бензоена киселина', smiles: 'OC(=O)c1ccccc1', group: 'acid', atoms: [0, 1, 2], note: 'Солта ѝ натриев бензоат (E211) е консервант.' },
  { name: 'етилов етаноат (етилацетат)', smiles: 'CC(=O)OCC', group: 'ester', atoms: [1, 2, 3], note: 'Разтворител в лаковете за нокти и лепилата; естерите се получават от киселина и алкохол.' },
  { name: 'диетилов етер', smiles: 'CCOCC', group: 'ether', atoms: [2], note: 'Кислородът е между два въглеводородни остатъка и няма водород при себе си.' },
  { name: 'етиламин', smiles: 'CCN', group: 'amine', atoms: [2], note: 'Аминогрупата прави молекулата основа – като амоняка.' },
  { name: 'етанамид (ацетамид)', smiles: 'CC(N)=O', group: 'amide', atoms: [1, 2, 3], note: 'Амидната връзка −CO−NH− свързва аминокиселините в белтъците.' },
  { name: '2-бромопропан', smiles: 'CC(Br)C', group: 'halo', atoms: [2], note: 'Халогенът замества водороден атом във въглеводорода.' },
];

/** Разпознаване на функционалната група: ученикът избира класа, после групата се оцветява. */
export default function FunctionalGroupLab() {
  const [mi, setMi] = useState(0);
  const [guess, setGuess] = useState<Group | null>(null);
  const [mode, setMode] = useState<'skeletal' | 'semi'>('semi');
  const [score, setScore] = useState({ right: 0, total: 0 });
  const m = MOLECULES[mi];
  const answered = guess !== null;
  const correct = guess === m.group;
  const groupInfo = GROUPS.find(g => g.id === m.group)!;
  const bonds = buildMolecule(m.smiles)
    .bonds.map((b, i) => (m.atoms.includes(b.a) && m.atoms.includes(b.b) ? i : -1))
    .filter(i => i >= 0);

  const choose = (g: Group) => {
    if (answered) return;
    setGuess(g);
    setScore(s => ({ right: s.right + (g === m.group ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setMi(i => (i + 1) % MOLECULES.length);
    setGuess(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'semi'} onClick={() => setMode('semi')}>
          полуструктурна формула
        </DiagramButton>
        <DiagramButton active={mode === 'skeletal'} onClick={() => setMode('skeletal')}>
          скелетна формула
        </DiagramButton>
      </Buttons>

      <div className="flex justify-center items-center min-h-[150px] my-3">
        <Molecule
          smiles={m.smiles}
          mode={mode}
          bond={mode === 'semi' ? 50 : 40}
          title={answered ? m.name : 'неизвестно вещество'}
          highlightAtoms={answered ? m.atoms : []}
          highlightBonds={answered ? bonds : []}
        />
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-1">
        Молекулна формула: <span className="font-semibold">{formulaText(molecularFormula(m.smiles))}</span> · Към кой клас е веществото?
      </p>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {GROUPS.map(g => {
          const state = !answered ? '' : g.id === m.group ? 'right' : g.id === guess ? 'wrong' : '';
          return (
            <button
              key={g.id}
              onClick={() => choose(g.id)}
              disabled={answered}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                state === 'right'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : state === 'wrong'
                    ? 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:hover:bg-transparent'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <Note tone={correct ? 'emerald' : 'rose'}>
            {correct ? '✓ Вярно! ' : `✗ Не е ${GROUPS.find(g => g.id === guess)!.name}. `}
            <strong>{m.name}</strong>: клас {groupInfo.name}, група {groupInfo.group}.
          </Note>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">{m.note}</p>
        </>
      )}
      <div className="flex flex-wrap justify-center items-center gap-3 mt-3">
        <Readout items={[{ label: 'верни:', value: `${score.right} от ${score.total}`, tone: 'emerald' }]} />
        <DiagramButton onClick={next}>следващо вещество →</DiagramButton>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Гледай не само кои атоми има, а и с какво са свързани. Групата −OH е алкохолна при наситен въглерод и фенолна при ароматния
        пръстен; групата C=O е алдехидна в края на веригата и кетонна в средата ѝ; кислородът в −COO− е естерен, ако след него има
        въглерод, и киселинен, ако има водород.
      </p>
    </div>
  );
}
