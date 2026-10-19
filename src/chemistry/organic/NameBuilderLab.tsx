import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { type FormulaMode, buildMolecule, moleculeBox } from '../smiles';
import { type Chain, type Substituent, chainError, chainFormula, chainSmiles, hasCisTrans, iupacName, numbered } from './hydrocarbonNames';

const W = 480;
const KIND_NAME = { 1: 'метил', 2: 'етил' } as const;

/** Конструктор: главна верига, кратна връзка и разклонения → чертеж с номерацията и име по IUPAC. */
export default function NameBuilderLab() {
  const [bond, setBond] = useState<1 | 2 | 3>(1);
  const [n, setN] = useState(5);
  const [bondPos, setBondPos] = useState(1);
  const [subs, setSubs] = useState<Substituent[]>([{ pos: 2, kind: 1 }]);
  const [mode, setMode] = useState<FormulaMode>('skeletal');

  const minN = bond === 1 ? 1 : 2;
  const chain: Chain = { n, bond, bondPos: bond === 1 ? 0 : Math.min(bondPos, n - 1), subs };
  const error = chainError(chain);
  const valenceError = error?.startsWith('Въглеродът') ?? false;

  const changeN = (v: number) => {
    setN(v);
    setBondPos(p => Math.min(p, Math.max(1, v - 1)));
    setSubs(ss => ss.filter(s => s.pos <= v));
  };
  const changeBond = (b: 1 | 2 | 3) => {
    setBond(b);
    if (b > 1 && n < 2) setN(2);
  };
  const addSub = (kind: 1 | 2) => setSubs(ss => (ss.length >= 3 ? ss : [...ss, { pos: Math.min(kind === 1 ? 2 : 3, n), kind }]));
  const moveSub = (i: number, d: number) => setSubs(ss => ss.map((s, j) => (j === i ? { ...s, pos: Math.min(n, Math.max(1, s.pos + d)) } : s)));
  const removeSub = (i: number) => setSubs(ss => ss.filter((_, j) => j !== i));

  // Чертеж – само ако всеки въглерод има най-много 4 връзки
  let drawing = null;
  let height = 120;
  if (!valenceError) {
    const { smiles, chainAtoms } = chainSmiles(chain);
    const mol = buildMolecule(smiles, { zigzag: mode === 'skeletal' });
    const box = moleculeBox(mol, mode);
    const bondPx = Math.min(mode === 'skeletal' ? 56 : 52, (W - 40) / (box.maxX - box.minX));
    const pad = 22;
    height = (box.maxY - box.minY) * bondPx + 2 * pad;
    const ox = (W - (box.maxX - box.minX) * bondPx) / 2 - box.minX * bondPx;
    const oy = pad - box.minY * bondPx;
    const { flipped } = numbered(chain);
    const nb = mol.bonds;
    drawing = (
      <>
        <MoleculeGroup mol={mol} mode={mode} x={ox} y={oy} bond={bondPx} />
        {!error &&
          chainAtoms.map((a, i) => {
            // Номерът – в най-широката празнина между връзките на атома
            const at = mol.atoms[a];
            const dirs = nb
              .filter(b => b.a === a || b.b === a)
              .map(b => mol.atoms[b.a === a ? b.b : b.a])
              .map(p => Math.atan2(p.y - at.y, p.x - at.x))
              .sort((p, q) => p - q);
            let best = -Math.PI / 2;
            let gap = -1;
            dirs.forEach((t, j) => {
              const next = j + 1 < dirs.length ? dirs[j + 1] : dirs[0] + 2 * Math.PI;
              if (next - t > gap + 1e-6) {
                gap = next - t;
                best = t + gap / 2;
              }
            });
            // При две връзки под 120° предпочитаме страната на по-широкия ъгъл; при права линия – отгоре
            if (dirs.length === 2 && Math.abs(gap - Math.PI) < 1e-3) best = -Math.PI / 2;
            const [dx, dy] = [Math.cos(best), Math.sin(best)];
            const r = mode === 'skeletal' ? 0.5 : 0.62;
            return (
              <text
                key={a}
                x={ox + (at.x + dx * r) * bondPx}
                y={oy + (at.y + dy * r) * bondPx}
                fontSize="13"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-blue-600 dark:fill-blue-400"
              >
                {flipped ? n - i : i + 1}
              </text>
            );
          })}
      </>
    );
  }

  const f = chainFormula(chain);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {([1, 2, 3] as const).map(b => (
          <DiagramButton key={b} active={bond === b} onClick={() => changeBond(b)}>
            {b === 1 ? 'алкан' : b === 2 ? 'алкен (C=C)' : 'алкин (C≡C)'}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 ${W} ${height.toFixed(0)}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {drawing}
      </LabSvg>

      <Sliders>
        <Slider label="верига" value={n} onChange={changeN} min={minN} max={8} step={1} tone="blue" />
        {bond > 1 && n > 2 && <Slider label="връзка" value={Math.min(bondPos, n - 1)} onChange={setBondPos} min={1} max={n - 1} step={1} tone="rose" />}
      </Sliders>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3 text-sm">
        {subs.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1">
            <button className="px-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-500/20" onClick={() => moveSub(i, -1)} aria-label="към по-малък номер">
              ‹
            </button>
            <span className="font-medium">
              {KIND_NAME[s.kind]} при C{s.pos}
            </span>
            <button className="px-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-500/20" onClick={() => moveSub(i, 1)} aria-label="към по-голям номер">
              ›
            </button>
            <button className="px-1.5 rounded text-gray-500 hover:bg-amber-100 dark:hover:bg-amber-500/20" onClick={() => removeSub(i)} aria-label="махни разклонението">
              ✕
            </button>
          </span>
        ))}
        {subs.length < 3 && (
          <>
            <button className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60" onClick={() => addSub(1)}>
              + метил
            </button>
            <button className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60" onClick={() => addSub(2)}>
              + етил
            </button>
          </>
        )}
      </div>

      <Buttons>
        <DiagramButton active={mode === 'skeletal'} onClick={() => setMode('skeletal')}>
          скелетна формула
        </DiagramButton>
        <DiagramButton active={mode === 'semi'} onClick={() => setMode('semi')}>
          полуструктурна формула
        </DiagramButton>
      </Buttons>

      <div className="mt-3">
        {error ? (
          <Note tone="rose">{error}</Note>
        ) : (
          <>
            <Readout
              items={[
                { label: 'име:', value: iupacName(chain), tone: 'blue' },
                { label: 'формула:', value: <Tex>{`\\mathrm{C_{${f.C}}H_{${f.H}}}`}</Tex> },
              ]}
            />
            {numbered(chain).flipped && <Note tone="blue">Номерацията започва отдясно – така номерата (локантите) са по-малки.</Note>}
            {hasCisTrans(chain) && <Note tone="violet">Това вещество има цис- и транс-изомер.</Note>}
          </>
        )}
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сините числа са номерата на главната верига. Номерира се от края, по-близо до кратната връзка; ако няма такава – до
        разклоненията. Разклоненията се изреждат по азбучен ред (етил преди метил), а еднаквите се събират с „ди-“ и „три-“.
      </p>
    </div>
  );
}
