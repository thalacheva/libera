import { type FormulaMode, type Mol, buildMolecule, defaultBond, moleculeBox, parseSmiles } from '../smiles';

// Разполагане на частиците в чертежите на механизмите.

/** Частица на чертежа: молекулата, отместването (x, y) и дължината на връзката в пиксели. */
export type Placed = { mol: Mol; x: number; y: number; bond: number; mode: FormulaMode; hl?: number[]; fs?: number };

/** Полуструктурна формула с прави вериги. */
export const semi = (smiles: string, opts: { rotate?: number; flip?: boolean } = {}) => buildMolecule(smiles, { zigzag: false, ...opts });

/** Молекула с ръчно зададени координати (в дължини на връзката) – когато трябва точно разположение, напр. анти-H и Br при E2. */
export function manual(smiles: string, coords: [number, number][]): Mol {
  const mol = parseSmiles(smiles);
  mol.atoms.forEach((a, k) => ([a.x, a.y] = coords[k]));
  return mol;
}

/** Частица с център на чертежа в (cx, cy). */
export function centered(mol: Mol, cx: number, cy: number, { bond, mode = 'semi', hl, fs }: { bond?: number; mode?: FormulaMode; hl?: number[]; fs?: number } = {}): Placed {
  const b = bond ?? defaultBond(mode);
  const box = moleculeBox(mol, mode);
  return { mol, mode, bond: b, hl, fs, x: cx - ((box.minX + box.maxX) / 2) * b, y: cy - ((box.minY + box.maxY) / 2) * b };
}

/** Частица, чийто атом k е в точката (px, py). */
export function anchored(mol: Mol, k: number, px: number, py: number, { bond, mode = 'semi', hl, fs }: { bond?: number; mode?: FormulaMode; hl?: number[]; fs?: number } = {}): Placed {
  const b = bond ?? defaultBond(mode);
  return { mol, mode, bond: b, hl, fs, x: px - mol.atoms[k].x * b, y: py - mol.atoms[k].y * b };
}

/** Координати на атом k в SVG. */
export const at = (p: Placed, k: number) => ({ x: p.x + p.mol.atoms[k].x * p.bond, y: p.y + p.mol.atoms[k].y * p.bond });

/** Средата на връзката между атомите a и b. */
export const mid = (p: Placed, a: number, b: number) => {
  const [A, B] = [at(p, a), at(p, b)];
  return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
};

/** Въглеродни атоми с несдвоен електрон (сборът от връзките и водородите е 3, без заряд). */
export function radicalAtoms(mol: Mol) {
  return mol.atoms
    .map((a, k) => ({ a, k }))
    .filter(({ a, k }) => a.el === 'C' && !a.aromatic && a.charge === 0 && a.h + mol.bonds.filter(b => b.a === k || b.b === k).reduce((s, b) => s + b.order, 0) === 3)
    .map(({ k }) => k);
}

/** Брой въглеродни атоми, свързани с атом k – 1 – първичен, 2 – вторичен, 3 – третичен. */
export const carbonNeighbors = (mol: Mol, k: number) =>
  mol.bonds.filter(b => (b.a === k && mol.atoms[b.b].el === 'C') || (b.b === k && mol.atoms[b.a].el === 'C')).length;
