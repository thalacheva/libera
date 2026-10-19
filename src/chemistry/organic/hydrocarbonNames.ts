// Имена по IUPAC и SMILES на прости въглеводороди: права главна верига с метилови и етилови разклонения
// и най-много една двойна или тройна връзка.

export const STEMS = ['', 'мет', 'ет', 'проп', 'бут', 'пент', 'хекс', 'хепт', 'окт', 'нон', 'дек'];

/** kind: 1 – метил, 2 – етил. */
export type Substituent = { pos: number; kind: 1 | 2 };
/** bond: 1 – алкан, 2 – алкен, 3 – алкин; bondPos – номерът на първия въглерод на кратната връзка. */
export type Chain = { n: number; bond: 1 | 2 | 3; bondPos: number; subs: Substituent[] };

const SUB_NAME = { 1: 'метил', 2: 'етил' } as const;
const MULT = ['', '', 'ди', 'три', 'тетра'];

/** Защо такава верига не е възможна (или не е главната), или null. */
export function chainError(c: Chain): string | null {
  if (c.bond > 1 && (c.bondPos < 1 || c.bondPos > c.n - 1)) return 'Кратната връзка трябва да е между два въглеродни атома от веригата.';
  for (const s of c.subs) {
    if (s.kind === 1 && (s.pos === 1 || s.pos === c.n)) return `Метил при C${s.pos} удължава веригата – тогава главната верига е по-дълга.`;
    if (s.kind === 2 && (s.pos <= 2 || s.pos >= c.n - 1)) return `Етил при C${s.pos} дава по-дълга верига – изберете по-дълга главна верига.`;
  }
  for (let i = 1; i <= c.n; i++) {
    const chainBonds = c.n === 1 ? 0 : i === 1 || i === c.n ? 1 : 2;
    const extra = c.bond > 1 && (i === c.bondPos || i === c.bondPos + 1) ? c.bond - 1 : 0;
    const subs = c.subs.filter(s => s.pos === i).length;
    if (chainBonds + extra + subs > 4) return `Въглеродът C${i} би имал ${chainBonds + extra + subs} връзки – повече от 4.`;
  }
  return null;
}

/** Номерацията отдясно наляво. */
const reversed = (c: Chain): Chain => ({
  ...c,
  bondPos: c.bond > 1 ? c.n - c.bondPos : 0,
  subs: c.subs.map(s => ({ ...s, pos: c.n + 1 - s.pos })),
});

/** Сравнение на две номерации: първо кратната връзка, после наборът от локанти, после първото по азбучен ред разклонение. */
function better(a: Chain, b: Chain) {
  if (a.bond > 1 && a.bondPos !== b.bondPos) return a.bondPos < b.bondPos;
  const la = a.subs.map(s => s.pos).sort((p, q) => p - q);
  const lb = b.subs.map(s => s.pos).sort((p, q) => p - q);
  for (let i = 0; i < la.length; i++) if (la[i] !== lb[i]) return la[i] < lb[i];
  // етил е преди метил по азбучен ред
  const first = (c: Chain) => Math.min(...c.subs.filter(s => s.kind === 2).map(s => s.pos), ...(c.subs.some(s => s.kind === 2) ? [] : c.subs.map(s => s.pos)));
  return first(a) <= first(b);
}

/** Веригата с правилната номерация (най-малки локанти) и дали е обърната. */
export function numbered(c: Chain): { chain: Chain; flipped: boolean } {
  const r = reversed(c);
  return better(c, r) ? { chain: c, flipped: false } : { chain: r, flipped: true };
}

/** Име по IUPAC: „2-метилбутан“, „4-метилпент-2-ен“, „3-етил-2-метилпентан“. */
export function iupacName(c: Chain): string {
  const { chain } = numbered(c);
  const prefix = ([2, 1] as const)
    .map(kind => {
      const locs = chain.subs.filter(s => s.kind === kind).map(s => s.pos).sort((p, q) => p - q);
      return locs.length ? `${locs.join(',')}-${MULT[locs.length]}${SUB_NAME[kind]}` : '';
    })
    .filter(Boolean)
    .join('-');
  const stem = STEMS[chain.n];
  let parent: string;
  if (chain.bond === 1) parent = `${stem}ан`;
  else {
    const ending = chain.bond === 2 ? 'ен' : 'ин';
    parent = chain.n <= 3 ? `${stem}${ending}` : `${stem}-${chain.bondPos}-${ending}`;
  }
  return prefix + parent;
}

/** SMILES на веригата и индексите на главните въглеродни атоми (C1…Cn в посочената номерация). */
export function chainSmiles(c: Chain): { smiles: string; chainAtoms: number[] } {
  let smiles = '';
  let atom = 0;
  const chainAtoms: number[] = [];
  for (let i = 1; i <= c.n; i++) {
    smiles += 'C';
    chainAtoms.push(atom++);
    for (const s of c.subs.filter(x => x.pos === i)) {
      smiles += s.kind === 1 ? '(C)' : '(CC)';
      atom += s.kind;
    }
    if (i < c.n) smiles += c.bond > 1 && i === c.bondPos ? (c.bond === 2 ? '=' : '#') : '';
  }
  return { smiles, chainAtoms };
}

/** Описание на разклонението като група (за сравняване на заместителите при цис-транс). */
function groupSig(c: Chain, i: number, dir: number): string {
  const parts: string[] = c.subs.filter(s => s.pos === i).map(s => (s.kind === 1 ? 'C()' : 'C(C())'));
  const next = i + dir;
  if (next >= 1 && next <= c.n) parts.push(groupSig(c, next, dir));
  return `C(${parts.sort().join(',')})`;
}

/** Има ли алкенът цис-транс изомери: всеки въглерод на двойната връзка носи две различни групи. */
export function hasCisTrans(c: Chain): boolean {
  if (c.bond !== 2) return false;
  const differs = (i: number, dir: number) => {
    const groups: string[] = c.subs.filter(s => s.pos === i).map(s => (s.kind === 1 ? 'C()' : 'C(C())'));
    const next = i + dir;
    if (next >= 1 && next <= c.n) groups.push(groupSig(c, next, dir));
    if (groups.length === 0) return false; // два водородни атома
    return groups.length === 1 || groups[0] !== groups[1];
  };
  return differs(c.bondPos, -1) && differs(c.bondPos + 1, 1);
}

/** Молекулна формула CₓHᵧ на веригата. */
export function chainFormula(c: Chain): { C: number; H: number } {
  const C = c.n + c.subs.reduce((s, x) => s + x.kind, 0);
  const H = 2 * C + 2 - 2 * (c.bond - 1);
  return { C, H };
}
