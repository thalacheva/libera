import type { ReactNode } from 'react';
import { type Bond, COLOR, defaultBond, fontScale, labelGap, type FormulaMode, type Mol, buildMolecule, hydrogens, labels, moleculeBox, neighbors, textWidth } from './smiles';

// Структурни формули в SVG: <Molecule smiles="CCO" /> самостоятелно или <MoleculeGroup> в чертежа на лаборатория.

type GroupProps = {
  mol: Mol;
  mode?: FormulaMode;
  /** Отместване на чертежа в SVG координати и дължина на връзката в пиксели. */
  x?: number;
  y?: number;
  bond?: number;
  /** Индекси на атомите (в реда от SMILES) и на връзките за подчертаване, напр. функционална група. */
  highlightAtoms?: number[];
  highlightBonds?: number[];
  highlightClass?: string;
  /** Размер на шрифта в пиксели – по подразбиране следва дължината на връзката. */
  fontSize?: number;
};

/**
 * Структурна формула като <g> – за вграждане в SVG на лаборатория.
 * Координатите на атом k в SVG са x + mol.atoms[k].x * bond, y + mol.atoms[k].y * bond.
 */
export function MoleculeGroup({ mol, mode = 'skeletal', x = 0, y = 0, bond: bondProp, highlightAtoms = [], highlightBonds = [], highlightClass = 'fill-amber-300/60 stroke-amber-300/60', fontSize }: GroupProps) {
  const adj = neighbors(mol.atoms.length, mol.bonds);
  const lab = labels(mol, mode, adj);
  const bond = bondProp ?? defaultBond(mode);
  const fs = fontSize ?? bond * fontScale(mode);
  const X = (v: number) => x + v * bond;
  const Y = (v: number) => y + v * bond;
  const gap = (k: number, ux: number, uy: number) => labelGap(lab[k], ux, uy) * fs;
  const ringOf = (b: Bond) => mol.rings.find(r => r.includes(b.a) && r.includes(b.b));
  const center = (r: number[]) => ({ x: r.reduce((s, v) => s + mol.atoms[v].x, 0) / r.length, y: r.reduce((s, v) => s + mol.atoms[v].y, 0) / r.length });

  const lines: ReactNode[] = [];
  mol.bonds.forEach((b, i) => {
    const A = mol.atoms[b.a];
    const B = mol.atoms[b.b];
    const len = Math.hypot(B.x - A.x, B.y - A.y) * bond;
    const ux = (X(B.x) - X(A.x)) / len;
    const uy = (Y(B.y) - Y(A.y)) / len;
    const seg = (off: number, shrinkA: number, shrinkB: number, key: string) => (
      <line
        key={key}
        x1={X(A.x) + ux * shrinkA - uy * off}
        y1={Y(A.y) + uy * shrinkA + ux * off}
        x2={X(B.x) - ux * shrinkB - uy * off}
        y2={Y(B.y) - uy * shrinkB + ux * off}
      />
    );
    const ga = gap(b.a, ux, uy);
    const gb = gap(b.b, -ux, -uy);
    if (highlightBonds.includes(i)) {
      lines.push(<line key={`h${i}`} x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} className={highlightClass} strokeWidth={bond * 0.42} strokeLinecap="round" />);
    }
    const d = bond * 0.16;
    const ring = ringOf(b);
    if (b.order === 1) lines.push(seg(0, ga, gb, `b${i}`));
    else if (b.order === 3) lines.push(seg(0, ga, gb, `b${i}`), seg(d, ga, gb, `c${i}`), seg(-d, ga, gb, `d${i}`));
    else if (ring && mode === 'skeletal') {
      // Втората линия на двойната връзка в пръстен – навътре и по-къса
      const c = center(ring);
      const side = Math.sign((-uy) * (X(c.x) - X(A.x)) + ux * (Y(c.y) - Y(A.y))) || 1;
      lines.push(seg(0, ga, gb, `b${i}`), seg(side * d * 1.3, Math.max(ga, bond * 0.15), Math.max(gb, bond * 0.15), `c${i}`));
    } else lines.push(seg(d / 2, ga, gb, `b${i}`), seg(-d / 2, ga, gb, `c${i}`));
  });

  // Ароматни пръстени – с окръжност
  const circles = mol.rings
    .filter(r => r.every((v, k) => mol.bonds.some(b => b.aromatic && ((b.a === v && b.b === r[(k + 1) % r.length]) || (b.b === v && b.a === r[(k + 1) % r.length])))))
    .map((r, k) => {
      const c = center(r);
      const apothem = 1 / (2 * Math.tan(Math.PI / r.length));
      return <circle key={`r${k}`} cx={X(c.x)} cy={Y(c.y)} r={apothem * bond * 0.6} fill="none" />;
    });

  const hs = mode === 'full' ? hydrogens(mol, adj) : [];

  return (
    <g>
      {highlightAtoms.map(k => (
        <circle key={`ha${k}`} cx={X(mol.atoms[k].x)} cy={Y(mol.atoms[k].y)} r={bond * 0.34} className={highlightClass} strokeWidth={0} />
      ))}
      <g className="stroke-current" strokeWidth={Math.max(1.2, bond * 0.05)} strokeLinecap="round">
        {lines}
        {circles}
        {hs.map((h, k) => {
          const A = mol.atoms[h.from];
          const len = Math.hypot(h.x - A.x, h.y - A.y);
          const [ux, uy] = [(h.x - A.x) / len, (h.y - A.y) / len];
          const g1 = gap(h.from, ux, uy) / bond;
          const g2 = (fs * 0.55) / bond;
          return <line key={`hl${k}`} x1={X(A.x + ux * g1)} y1={Y(A.y + uy * g1)} x2={X(h.x - ux * g2)} y2={Y(h.y - uy * g2)} />;
        })}
      </g>
      {mol.atoms.map((a, k) => {
        const l = lab[k];
        if (!l) return null;
        const cls = COLOR[a.el] ?? 'fill-current';
        const half = (textWidth(l.symbol) * fs) / 2;
        const tail = l.hText + l.charge;
        return (
          <g key={`a${k}`} fontSize={fs} fontWeight={600} className={cls}>
            <text x={X(a.x)} y={Y(a.y)} textAnchor="middle" dominantBaseline="central">
              {l.symbol}
            </text>
            {/* зарядът е отделен текст – иначе символът не е центриран върху атома */}
            {l.hLeft && l.charge && (
              <text x={X(a.x) + half - fs * 0.04} y={Y(a.y) - fs * 0.4} fontSize={fs * 0.7} dominantBaseline="central">
                {l.charge}
              </text>
            )}
            {tail && !l.hLeft && (
              <text x={X(a.x) + half - fs * 0.04} y={Y(a.y)} dominantBaseline="central">
                {l.hText}
                {l.charge && <tspan dy={-fs * 0.4} fontSize={fs * 0.7}>{l.charge}</tspan>}
              </text>
            )}
            {l.hLeft && (
              <text x={X(a.x) - half + fs * 0.04} y={Y(a.y)} textAnchor="end" dominantBaseline="central">
                {l.hText}
              </text>
            )}
          </g>
        );
      })}
      {hs.map((h, k) => (
        <text key={`h${k}`} x={X(h.x)} y={Y(h.y)} fontSize={fs} fontWeight={600} textAnchor="middle" dominantBaseline="central" className="fill-current">
          H
        </text>
      ))}
    </g>
  );
}

type MoleculeProps = Omit<GroupProps, 'mol' | 'x' | 'y'> & {
  smiles: string;
  zigzag?: boolean;
  rotate?: number;
  flip?: boolean;
  className?: string;
  /** Достъпно описание (име на веществото). */
  title?: string;
};

/**
 * Самостоятелна структурна формула: <Molecule smiles="CCO" mode="semi" title="етанол" />.
 * По подразбиране скелетните формули са на зигзаг, а полуструктурните и пълните – с прави вериги.
 * Пълната формула (всички H) е за малки молекули – вериги и ароматни пръстени; при наситени пръстени водородите се застъпват.
 */
export function Molecule({ smiles, mode = 'skeletal', zigzag, rotate, flip, bond: bondProp, className, title, ...rest }: MoleculeProps) {
  const bond = bondProp ?? defaultBond(mode);
  const mol = buildMolecule(smiles, { zigzag: zigzag ?? mode === 'skeletal', rotate, flip, branch: mode === 'full' ? 2 : 1 });
  const box = moleculeBox(mol, mode);
  const w = (box.maxX - box.minX) * bond;
  const h = (box.maxY - box.minY) * bond;
  return (
    <svg
      viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`}
      width={w}
      height={h}
      role="img"
      aria-label={title ?? smiles}
      className={className ?? 'inline-block max-w-full h-auto text-gray-800 dark:text-gray-100'}
    >
      {title && <title>{title}</title>}
      <MoleculeGroup mol={mol} mode={mode} x={-box.minX * bond} y={-box.minY * bond} bond={bond} {...rest} />
    </svg>
  );
}
