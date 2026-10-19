import type { FormulaMode, Mol } from '../smiles';
import { MoleculeGroup } from '../StructuralFormula';

/**
 * Повтарящо се звено на полимер в квадратни скоби с индекс n – за SVG на лаборатория.
 * mol е от SMILES със * в двата края („*CC(Cl)*“); скобите пресичат крайните връзки.
 * (x, y) е мястото на началото на координатите на молекулата, както при MoleculeGroup.
 */
export default function RepeatUnit({ mol, mode = 'skeletal', bond, x, y }: { mol: Mol; mode?: FormulaMode; bond: number; x: number; y: number }) {
  const ys = mol.atoms.map(a => a.y);
  const y0 = y + (Math.min(...ys) - 0.55) * bond;
  const y1 = y + (Math.max(...ys) + 0.55) * bond;
  const ends = mol.atoms
    .map((a, i) => ({ a, i }))
    .filter(p => p.a.el === '*')
    .map(({ a, i }) => {
      const b = mol.bonds.find(bd => bd.a === i || bd.b === i)!;
      const other = mol.atoms[b.a === i ? b.b : b.a];
      // По-близо до звездата, за да не закрива надписа на съседния атом
      return { x: x + (0.35 * other.x + 0.65 * a.x) * bond, right: a.x > other.x };
    });
  return (
    <g>
      <MoleculeGroup mol={mol} mode={mode} bond={bond} x={x} y={y} />
      {ends.map((e, j) => {
        const t = e.right ? -5 : 5;
        return (
          <g key={j}>
            <path d={`M ${e.x + t} ${y0} L ${e.x} ${y0} L ${e.x} ${y1} L ${e.x + t} ${y1}`} fill="none" className="stroke-current" strokeWidth="1.6" />
            {e.right && (
              <text x={e.x + 3} y={y1 + 3} fontSize="12" fontWeight="700" fill="currentColor">
                n
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
