// Структурни формули от SMILES: разбор, разполагане на атомите в равнината и данни за рисуването
// (компонентите са в StructuralFormula.tsx).
// Поддържа органичното подмножество (B C N O P S F Cl Br I и ароматни b c n o p s), атоми в [скоби]
// (заряд, брой H), разклонения, връзки - = # :, пръстени (вкл. слети), няколко частици, разделени с „.“,
// и * – точка на свързване (краищата на повтарящо се звено в полимер: „*CC(Cl)*“).
// Стереохимията (@, /, \) се приема, но не се рисува – клиновидните връзки, Фишер и Хауърт се чертаят на ръка.

export type Atom = {
  el: string;
  aromatic: boolean;
  charge: number;
  /** Брой водородни атоми (неявни или от [скобите]). */
  h: number;
  x: number;
  y: number;
};
export type Bond = { a: number; b: number; order: 1 | 2 | 3; aromatic: boolean };
export type Mol = { atoms: Atom[]; bonds: Bond[]; rings: number[][] };

/** Как се рисува формулата: скелетна (без C и H), полуструктурна (CH₃–CH₂–OH) или пълна (всички H). */
export type FormulaMode = 'skeletal' | 'semi' | 'full';

const VALENCES: Record<string, number[]> = { B: [3], C: [4], N: [3, 5], O: [2], P: [3, 5], S: [2, 4, 6], F: [1], Cl: [1], Br: [1], I: [1] };

// ---------- Разбор ----------

/** Граф на молекулата от SMILES, без координати. Хвърля грешка при невалиден запис. */
export function parseSmiles(smiles: string): Mol {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  const explicitH: boolean[] = [];
  const stack: number[] = [];
  const openRings = new Map<number, { atom: number; order: number }>();
  let prev = -1;
  let pendingOrder = 0; // 0 – няма изрична връзка
  let i = 0;

  const addBond = (a: number, b: number, order: number) => {
    const aromatic = order === 0 ? atoms[a].aromatic && atoms[b].aromatic : order === 4;
    bonds.push({ a, b, order: (order === 0 || order === 4 ? 1 : order) as 1 | 2 | 3, aromatic });
  };
  const addAtom = (el: string, aromatic: boolean, charge = 0, h = -1) => {
    atoms.push({ el, aromatic, charge, h: Math.max(h, 0), x: 0, y: 0 });
    explicitH.push(h >= 0);
    const idx = atoms.length - 1;
    if (prev >= 0) addBond(prev, idx, pendingOrder);
    prev = idx;
    pendingOrder = 0;
  };

  while (i < smiles.length) {
    const c = smiles[i];
    const two = smiles.slice(i, i + 2);
    if (two === 'Cl' || two === 'Br') {
      addAtom(two, false);
      i += 2;
    } else if (c === '*') {
      // Точка на свързване (напр. краищата на повтарящото се звено в полимер): без надпис и без водород
      addAtom('*', false, 0, 0);
      i++;
    } else if ('BCNOPSFI'.includes(c)) {
      addAtom(c, false);
      i++;
    } else if ('bcnops'.includes(c)) {
      addAtom(c.toUpperCase(), true);
      i++;
    } else if (c === '[') {
      const end = smiles.indexOf(']', i);
      const m = /^\d*([A-Z][a-z]?|[bcnops])(@{0,2})(H\d?)?([+-]+\d*)?(?::\d+)?$/.exec(smiles.slice(i + 1, end));
      if (end < 0 || !m) throw new Error(`Невалиден атом в SMILES: ${smiles}`);
      const aromatic = m[1] === m[1].toLowerCase();
      const el = aromatic ? m[1].toUpperCase() : m[1];
      const h = m[3] ? (m[3].length > 1 ? Number(m[3].slice(1)) : 1) : 0;
      let charge = 0;
      if (m[4]) {
        const sign = m[4][0] === '+' ? 1 : -1;
        const digits = m[4].replace(/[+-]/g, '');
        charge = sign * (digits ? Number(digits) : m[4].length);
      }
      addAtom(el, aromatic, charge, h);
      i = end + 1;
    } else if (c === '(') {
      stack.push(prev);
      i++;
    } else if (c === ')') {
      prev = stack.pop() ?? -1;
      i++;
    } else if ('-=#:/\\'.includes(c)) {
      pendingOrder = c === '=' ? 2 : c === '#' ? 3 : c === ':' ? 4 : 1;
      i++;
    } else if (c === '.') {
      prev = -1;
      i++;
    } else if (/[\d%]/.test(c)) {
      const num = c === '%' ? Number(smiles.slice(i + 1, i + 3)) : Number(c);
      i += c === '%' ? 3 : 1;
      const open = openRings.get(num);
      if (open) {
        addBond(open.atom, prev, pendingOrder || open.order);
        openRings.delete(num);
      } else openRings.set(num, { atom: prev, order: pendingOrder });
      pendingOrder = 0;
    } else throw new Error(`Непознат знак „${c}“ в SMILES: ${smiles}`);
  }
  if (openRings.size || stack.length) throw new Error(`Незатворен пръстен или скоба в SMILES: ${smiles}`);

  // Неявните водородни атоми – по най-малката подходяща валентност
  atoms.forEach((a, k) => {
    if (explicitH[k]) return;
    let sum = 0;
    for (const b of bonds) if (b.a === k || b.b === k) sum += b.order;
    if (a.aromatic && 'BCNP'.includes(a.el)) sum += 1;
    const vals = VALENCES[a.el] ?? [0];
    const shift = a.el === 'N' || a.el === 'P' ? a.charge : -Math.abs(a.charge);
    const v = vals.map(x => x + shift).find(x => x >= sum) ?? sum;
    a.h = v - sum;
  });

  return { atoms, bonds, rings: findRings(atoms.length, bonds) };
}

/** Най-малките пръстени: за всяка връзка, която затваря цикъл, – най-краткият път между краищата ѝ без нея. */
function findRings(n: number, bonds: Bond[]): number[][] {
  const adj = neighbors(n, bonds);
  // Връзките извън покриващото дърво затварят пръстени
  const seen = new Array<boolean>(n).fill(false);
  const tree = new Set<Bond>();
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    seen[s] = true;
    const queue = [s];
    while (queue.length) {
      const u = queue.shift()!;
      for (const [v, b] of adj[u]) {
        if (seen[v]) continue;
        seen[v] = true;
        tree.add(b);
        queue.push(v);
      }
    }
  }
  const rings: number[][] = [];
  for (const closure of bonds) {
    if (tree.has(closure)) continue;
    const prev = new Map<number, number>([[closure.a, -1]]);
    const queue = [closure.a];
    while (queue.length && !prev.has(closure.b)) {
      const u = queue.shift()!;
      for (const [v, b] of adj[u]) {
        if (b === closure || prev.has(v)) continue;
        prev.set(v, u);
        queue.push(v);
      }
    }
    const ring: number[] = [];
    for (let v = closure.b; v !== -1; v = prev.get(v)!) ring.push(v);
    rings.push(ring);
  }
  return rings;
}

export function neighbors(n: number, bonds: Bond[]): [number, Bond][][] {
  const adj: [number, Bond][][] = Array.from({ length: n }, () => []);
  for (const b of bonds) {
    adj[b.a].push([b.b, b]);
    adj[b.b].push([b.a, b]);
  }
  return adj;
}

// ---------- Разполагане ----------

export const DEG = Math.PI / 180;
const angleOf = (dx: number, dy: number) => Math.atan2(dy, dx);

/**
 * Координати на атомите (дължината на връзката е 1, y сочи надолу).
 * zigzag: веригите са зигзаг под 120° (за скелетни формули); иначе са прави, а разклоненията – под прав ъгъл.
 */
function layout(mol: Mol, zigzag: boolean, branch: number) {
  const { atoms, bonds, rings } = mol;
  const n = atoms.length;
  const adj = neighbors(n, bonds);
  const placed = new Array<boolean>(n).fill(false);
  const dirIn: (number | null)[] = new Array<number | null>(n).fill(null);
  const turn = new Array<number>(n).fill(1);
  const ringCenter = new Map<number[], { x: number; y: number }>();
  const ringsOf = (u: number) => rings.filter(r => r.includes(u));
  const isSp = (u: number) => adj[u].some(([, b]) => b.order === 3) || adj[u].filter(([, b]) => b.order === 2).length >= 2;
  const put = (u: number, x: number, y: number) => {
    atoms[u].x = x;
    atoms[u].y = y;
    placed[u] = true;
  };

  const placeRing = (ring: number[]) => {
    const m = ring.length;
    const R = 1 / (2 * Math.sin(Math.PI / m));
    let order = ring;
    let cx: number, cy: number;
    const pairIdx = ring.findIndex((v, k) => placed[v] && placed[ring[(k + 1) % m]]);
    if (pairIdx >= 0) {
      // Слят пръстен: общата връзка е вече начертана, центърът е от другата ѝ страна
      const a = ring[pairIdx];
      const b = ring[(pairIdx + 1) % m];
      const [A, B] = [atoms[a], atoms[b]];
      const mx = (A.x + B.x) / 2;
      const my = (A.y + B.y) / 2;
      let nx = -(B.y - A.y);
      let ny = B.x - A.x;
      const others = [...adj[a], ...adj[b]].map(([v]) => v).filter(v => v !== a && v !== b && placed[v]);
      if (others.length) {
        const ox = others.reduce((s, v) => s + atoms[v].x, 0) / others.length;
        const oy = others.reduce((s, v) => s + atoms[v].y, 0) / others.length;
        if (nx * (ox - mx) + ny * (oy - my) > 0) [nx, ny] = [-nx, -ny];
      }
      const apothem = 1 / (2 * Math.tan(Math.PI / m));
      cx = mx + nx * apothem;
      cy = my + ny * apothem;
      order = [...ring.slice(pairIdx), ...ring.slice(0, pairIdx)];
    } else {
      const p = ring.find(v => placed[v]) ?? ring[0];
      if (!placed[p]) put(p, 0, 0);
      let dir = dirIn[p];
      const other = ringsOf(p).find(r => r !== ring && ringCenter.has(r));
      if (other) {
        const c = ringCenter.get(other)!;
        dir = angleOf(atoms[p].x - c.x, atoms[p].y - c.y);
      }
      dir ??= 90 * DEG; // самостоятелен пръстен – с връх нагоре
      cx = atoms[p].x + R * Math.cos(dir);
      cy = atoms[p].y + R * Math.sin(dir);
      const k = ring.indexOf(p);
      order = [...ring.slice(k), ...ring.slice(0, k)];
    }
    const t0 = angleOf(atoms[order[0]].x - cx, atoms[order[0]].y - cy);
    let step = (2 * Math.PI) / m;
    if (placed[order[1]]) {
      const tb = angleOf(atoms[order[1]].x - cx, atoms[order[1]].y - cy);
      const diff = (tb - t0 + 4 * Math.PI) % (2 * Math.PI);
      if (Math.abs(diff - step) > 1e-6) step = -step;
    }
    const fresh: number[] = [];
    order.forEach((v, k) => {
      if (placed[v]) return;
      put(v, cx + R * Math.cos(t0 + k * step), cy + R * Math.sin(t0 + k * step));
      fresh.push(v);
    });
    ringCenter.set(ring, { x: cx, y: cy });
    return fresh;
  };

  const queue: number[] = [];
  const visit = (u: number) => {
    for (const r of ringsOf(u)) if (!ringCenter.has(r)) queue.push(...placeRing(r));
    const children = adj[u].map(([v]) => v).filter(v => !placed[v]);
    if (!children.length) return;
    const k = children.length;
    // Последното дете е основната верига (в SMILES разклоненията са преди нея)
    const main = children[k - 1];
    const branches = children.slice(0, k - 1);
    let angles: number[]; // ъгли за [основна, ...разклонения]
    let axis = 0; // спрямо тази посока се взима огледалният вариант
    const myRings = ringsOf(u).filter(r => ringCenter.has(r));
    if (myRings.length) {
      let ox = 0;
      let oy = 0;
      for (const r of myRings) {
        const c = ringCenter.get(r)!;
        ox += atoms[u].x - c.x;
        oy += atoms[u].y - c.y;
      }
      const o = angleOf(ox, oy);
      axis = o;
      angles = k === 1 ? [o] : k === 2 ? [o + 35 * DEG, o - 35 * DEG] : [o, o + 70 * DEG, o - 70 * DEG];
    } else if (dirIn[u] === null) {
      const start = zigzag && !isSp(u) ? -30 * DEG : 0;
      turn[u] = -1;
      angles =
        k === 1
          ? [start]
          : k === 2
            ? [start, zigzag ? 210 * DEG : 180 * DEG]
            : k === 3
              ? [start, zigzag ? 90 * DEG : 180 * DEG, zigzag ? 210 * DEG : 90 * DEG]
              : [0, 90 * DEG, 180 * DEG, 270 * DEG];
    } else {
      const din = dirIn[u]!;
      const s = turn[u];
      axis = din;
      if (isSp(u)) angles = [din, din + 90 * DEG, din - 90 * DEG];
      else if (zigzag) angles = k === 1 ? [din + 60 * s * DEG] : k === 2 ? [din + 60 * s * DEG, din - 60 * s * DEG] : [din + 60 * s * DEG, din - 20 * s * DEG, din - 100 * s * DEG]; // при 4 съседа веригата продължава на зигзаг
      else angles = [din, din + 90 * DEG, din - 90 * DEG];
    }
    // Огледалният вариант (разклоненията от другата страна), ако държи новите атоми по-далеч от вече начертаните
    if (dirIn[u] !== null || myRings.length) {
      const mirrored = angles.map(a => 2 * axis - a);
      const score = (set: number[]) => {
        let best = Infinity;
        set.slice(0, k).forEach(a => {
          const px = atoms[u].x + Math.cos(a);
          const py = atoms[u].y + Math.sin(a);
          atoms.forEach((w, q) => {
            if (placed[q] && q !== u) best = Math.min(best, Math.hypot(w.x - px, w.y - py));
          });
        });
        return best;
      };
      // Огледално – само при истинско сближаване (по-малко от 1,2 връзки), иначе зигзагът остава правилен
      const own = score(angles);
      if (own < 1.2 && score(mirrored) > own + 1e-6) {
        angles = mirrored;
        turn[u] = -turn[u];
      }
    }
    [main, ...branches].forEach((v, j) => {
      const a = angles[j] ?? angles[0] + (j * 45 + 20) * DEG;
      // По-дълги са само разклоненията, които носят водород или продължават (не =O, −Cl…)
      const len = j > 0 && !zigzag && !myRings.length && (atoms[v].h > 0 || adj[v].length > 1) ? branch : 1;
      put(v, atoms[u].x + len * Math.cos(a), atoms[u].y + len * Math.sin(a));
      dirIn[v] = a;
      turn[v] = j === 0 ? -turn[u] : turn[u];
      queue.push(v);
    });
  };

  // Всяка частица (компонент) поотделно, една до друга
  let offset = 0;
  for (let s = 0; s < n; s++) {
    if (placed[s]) continue;
    const before = placed.map((p, k) => (p ? -1 : k)).filter(k => k >= 0);
    put(s, 0, 0);
    queue.push(s);
    while (queue.length) visit(queue.shift()!);
    const comp = before.filter(k => placed[k]);
    const minX = Math.min(...comp.map(k => atoms[k].x));
    const maxX = Math.max(...comp.map(k => atoms[k].x));
    for (const k of comp) atoms[k].x += offset - minX;
    offset += maxX - minX + 1.6;
  }
}

const cache = new Map<string, Mol>();

/**
 * Молекула с координати от SMILES (дължината на връзката е 1). Резултатът се кешира – не го променяй.
 * rotate – завъртане в градуси (по часовника); flip – огледално по хоризонтала;
 * branch – дължина на разклоненията при прави вериги (2 в пълните формули, за да има място за водородите).
 */
export function buildMolecule(smiles: string, { zigzag = true, rotate = 0, flip = false, branch = 1 } = {}): Mol {
  const key = `${smiles}|${zigzag}|${rotate}|${flip}|${branch}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const mol = parseSmiles(smiles);
  layout(mol, zigzag, branch);
  const [c, s] = [Math.cos(rotate * DEG), Math.sin(rotate * DEG)];
  for (const a of mol.atoms) {
    const x = flip ? -a.x : a.x;
    [a.x, a.y] = [x * c - a.y * s, x * s + a.y * c];
  }
  cache.set(key, mol);
  return mol;
}

/** Молекулна формула по Хил (C, H, после по азбучен ред): „C2H6O“. Работи с formulaTex и molarMass. */
export function molecularFormula(smiles: string): string {
  const { atoms } = parseSmiles(smiles);
  const count = new Map<string, number>();
  const add = (el: string, k: number) => k && count.set(el, (count.get(el) ?? 0) + k);
  for (const a of atoms) {
    if (a.el === '*') continue;
    add(a.el, 1);
    add('H', a.h);
  }
  const els = [...count.keys()].sort((p, q) => {
    const rank = (e: string) => (count.has('C') ? (e === 'C' ? 0 : e === 'H' ? 1 : 2) : 2);
    return rank(p) - rank(q) || p.localeCompare(q);
  });
  return els.map(e => e + (count.get(e)! > 1 ? count.get(e) : '')).join('');
}

// ---------- Рисуване ----------

export const COLOR: Record<string, string> = {
  O: 'fill-red-600 dark:fill-red-400',
  N: 'fill-blue-600 dark:fill-blue-400',
  S: 'fill-amber-600 dark:fill-amber-400',
  P: 'fill-orange-600 dark:fill-orange-400',
  F: 'fill-emerald-600 dark:fill-emerald-400',
  Cl: 'fill-emerald-600 dark:fill-emerald-400',
  Br: 'fill-rose-700 dark:fill-rose-400',
  I: 'fill-violet-600 dark:fill-violet-400',
};
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (k: number) => (k > 1 ? String(k).replace(/\d/g, d => SUB[Number(d)]) : '');
const chargeText = (q: number) => (q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−'));
/** Приблизителна ширина на надпис в em (безсерифен шрифт). */
export const textWidth = (s: string) => [...s].reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[₀-₉]/.test(ch) ? 0.4 : 0.52), 0);

/** Размер на шрифта като част от дължината на връзката (полуструктурните и пълните формули са с по-дълги връзки). */
export const fontScale = (mode: FormulaMode) => (mode === 'skeletal' ? 0.48 : 0.34);
/** Дължина на връзката в пиксели по подразбиране – шрифтът и в трите вида е около 14 px. */
export const defaultBond = (mode: FormulaMode) => (mode === 'skeletal' ? 30 : 42);

/** Колко да се скъси връзка, излизаща от атом с надпис в посока (ux, uy), за да не минава през надписа (в em). */
export function labelGap(l: Label | null, ux: number, uy: number) {
  if (!l) return 0;
  const half = textWidth(l.symbol) / 2;
  const tail = textWidth(l.hText + l.charge);
  // При водород отляво зарядът остава вдясно от символа (като горен индекс)
  const right = half + (l.hLeft ? textWidth(l.charge) * 0.7 : tail);
  const left = half + (l.hLeft ? textWidth(l.hText) : 0);
  const tx = ux > 1e-9 ? right / ux : ux < -1e-9 ? left / -ux : Infinity;
  const ty = Math.abs(uy) > 1e-9 ? 0.5 / Math.abs(uy) : Infinity;
  return Math.min(tx, ty) + 0.18;
}

export type Label = { symbol: string; hText: string; hLeft: boolean; charge: string };

/** Кои атоми имат надпис и какъв. */
export function labels(mol: Mol, mode: FormulaMode, adj: [number, Bond][][]): (Label | null)[] {
  return mol.atoms.map((a, k) => {
    const deg = adj[k].length;
    // В скелетната формула въглеродът не се пише; в полуструктурната – само в ароматните пръстени
    const hidden = a.el === '*' || (a.el === 'C' && deg > 0 && a.charge === 0 && (mode === 'skeletal' || (mode === 'semi' && a.aromatic)));
    const show = !hidden;
    if (!show) return null;
    const meanDx = deg ? adj[k].reduce((s, [v]) => s + mol.atoms[v].x - a.x, 0) / deg : -1;
    const hText = mode === 'full' || a.h === 0 ? '' : 'H' + sub(a.h);
    // Самостоятелни частици по навик: H₂O, H₃O⁺, HCl, HO⁻ – но NH₃, CH₄
    const hLeft = hText !== '' && (deg ? meanDx > 0.3 : ['O', 'S', 'F', 'Cl', 'Br', 'I'].includes(a.el));
    return { symbol: a.el, hText, hLeft, charge: chargeText(a.charge) };
  });
}

/** Пълна формула: водородните атоми като отделни атоми в най-големите празни посоки. */
export function hydrogens(mol: Mol, adj: [number, Bond][][]) {
  const out: { from: number; x: number; y: number }[] = [];
  mol.atoms.forEach((a, k) => {
    const used = adj[k].map(([v]) => angleOf(mol.atoms[v].x - a.x, mol.atoms[v].y - a.y));
    // sp²-атом с един съсед (напр. в етена): водородите под 120°
    if (used.length === 1 && a.h === 2 && adj[k].some(([, b]) => b.order === 2)) {
      for (const t of [used[0] + (2 * Math.PI) / 3, used[0] - (2 * Math.PI) / 3]) out.push({ from: k, x: a.x + 0.85 * Math.cos(t), y: a.y + 0.85 * Math.sin(t) });
      return;
    }
    for (let j = 0; j < a.h; j++) {
      let best = 0;
      if (used.length) {
        const sorted = [...used].sort((p, q) => p - q);
        let gap = -1;
        sorted.forEach((t, i) => {
          const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 2 * Math.PI;
          if (next - t > gap + 1e-6) {
            gap = next - t;
            best = t + gap / 2;
          }
        });
      }
      used.push(best);
      out.push({ from: k, x: a.x + 0.85 * Math.cos(best), y: a.y + 0.85 * Math.sin(best) });
    }
  });
  return out;
}

/** Граници на чертежа в единици „дължина на връзка“ (с място за надписите). */
export function moleculeBox(mol: Mol, mode: FormulaMode = 'skeletal') {
  const adj = neighbors(mol.atoms.length, mol.bonds);
  const lab = labels(mol, mode, adj);
  const pts = mol.atoms.map((a, k) => {
    const l = lab[k];
    const w = l ? (textWidth(l.symbol) * fontScale(mode)) / 2 : 0;
    const hw = l ? textWidth(l.hText + l.charge) * fontScale(mode) : 0;
    return { x0: a.x - w - (l?.hLeft ? hw : 0), x1: a.x + w + (l && !l.hLeft ? hw : 0), y: a.y };
  });
  if (mode === 'full') for (const h of hydrogens(mol, adj)) pts.push({ x0: h.x - 0.2, x1: h.x + 0.2, y: h.y });
  return {
    minX: Math.min(...pts.map(p => p.x0)) - 0.35,
    maxX: Math.max(...pts.map(p => p.x1)) + 0.35,
    minY: Math.min(...pts.map(p => p.y)) - 0.45,
    maxY: Math.max(...pts.map(p => p.y)) + 0.45,
  };
}
