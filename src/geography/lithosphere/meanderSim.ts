// Опростен модел на меандриране (по идеята на Хауърд и Кнутсън): външният бряг се подкопава толкова
// по-бързо, колкото по-извит е завоят нагоре по течението; при твърде близки завои реката ги „прекъсва“ и остава старица.

export type Pt = { x: number; y: number };
export type MeanderState = { river: Pt[]; oxbows: { pts: Pt[]; step: number }[]; cutoffs: number };

const DS = 0.012; // стъпка между точките по реката (дължината на долината е 1)
const CUTOFF = 0.03; // при толкова близки участъци реката прекъсва завоя
const RATE = 0.00012;
const PASSES = 2;
const LAG = 6; // през колко точки нагоре по течението „помни“ извивката
const HALF_WIDTH = 0.42; // долината – от −0,42 до 0,42 по y

function resample(pts: Pt[]) {
  const out: Pt[] = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    let t = DS - carry;
    while (t <= seg) {
      out.push({ x: a.x + ((b.x - a.x) * t) / seg, y: a.y + ((b.y - a.y) * t) / seg });
      t += DS;
    }
    carry = seg - (t - DS);
  }
  const last = pts[pts.length - 1];
  if (Math.hypot(last.x - out[out.length - 1].x, last.y - out[out.length - 1].y) > DS * 0.3) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

function step(river: Pt[], rate = RATE, passes = PASSES): Pt[] {
  const n = river.length;
  // Извивка (кривина) във всяка точка: ъгълът на завиване на единица дължина
  const k = river.map((p, i) => {
    if (i < 3 || i > n - 4) return 0;
    // По-широк шаблон (±3 точки) – дребните „зъбци“ не се усилват
    const a = river[i - 3];
    const b = river[i + 3];
    const t1 = Math.atan2(p.y - a.y, p.x - a.x);
    const t2 = Math.atan2(b.y - p.y, b.x - p.x);
    let d = t2 - t1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d / (3 * DS);
  });
  const moved = river.map((p, i) => {
    if (i === 0 || i === n - 1) return p;
    // Претеглена кривина нагоре по течението – затова завоите „пълзят“ надолу по долината
    let s = 0;
    let w = 0;
    for (let j = 0; j <= LAG && i - j >= 0; j++) {
      const wj = Math.exp(-j / 3);
      s += wj * k[i - j];
      w += wj;
    }
    // Ограничаваме преместването за една стъпка – иначе моделът „трепери“
    const r = Math.max(-0.25 * DS, Math.min(0.25 * DS, (rate * s) / w));
    const a = river[i - 1];
    const b = river[i + 1];
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const tl = Math.hypot(tx, ty) || 1;
    // Лява нормала; завой наляво (k > 0) – външният бряг е вдясно
    const nx = -ty / tl;
    const ny = tx / tl;
    return { x: Math.max(0.01, Math.min(0.99, p.x - r * nx)), y: Math.max(-HALF_WIDTH, Math.min(HALF_WIDTH, p.y - r * ny)) };
  });
  // Изглаждане срещу „трион“ – три пъти по три точки
  let smooth = moved;
  for (let pass = 0; pass < passes; pass++)
    smooth = smooth.map((p, i, a) => (i === 0 || i === n - 1 ? p : { x: 0.25 * a[i - 1].x + 0.5 * p.x + 0.25 * a[i + 1].x, y: 0.25 * a[i - 1].y + 0.5 * p.y + 0.25 * a[i + 1].y }));
  return resample(smooth);
}

/** Прекъсва първия завой, чийто „врат“ е станал по-тесен от CUTOFF. */
function cutoff(river: Pt[]): { river: Pt[]; oxbow: Pt[] } | null {
  const gap = Math.ceil((3 * CUTOFF) / DS) + 4;
  for (let i = 0; i < river.length; i++)
    for (let j = river.length - 1; j > i + gap; j--) {
      const a = river[i];
      const b = river[j];
      if (Math.abs(a.x - b.x) < CUTOFF && Math.hypot(a.x - b.x, a.y - b.y) < CUTOFF) {
        return { river: resample([...river.slice(0, i + 1), ...river.slice(j)]), oxbow: river.slice(i, j + 1) };
      }
    }
  return null;
}

/** Началото: почти права река с леки извивки. */
export function initialRiver(): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    pts.push({ x, y: 0.03 * Math.sin(2 * Math.PI * 3 * x) + 0.012 * Math.sin(2 * Math.PI * 7.3 * x + 1) });
  }
  return resample(pts);
}

/** Моментни снимки на реката през всеки snapEvery стъпки. */
export function simulate(steps: number, snapEvery: number, rate = RATE, passes = PASSES): MeanderState[] {
  let river = initialRiver();
  const oxbows: { pts: Pt[]; step: number }[] = [];
  let cutoffs = 0;
  const snaps: MeanderState[] = [{ river, oxbows: [], cutoffs: 0 }];
  for (let s = 1; s <= steps; s++) {
    river = step(river, rate, passes);
    const c = cutoff(river);
    if (c) {
      river = c.river;
      oxbows.push({ pts: c.oxbow, step: s });
      cutoffs++;
    }
    if (s % snapEvery === 0) snaps.push({ river, oxbows: [...oxbows], cutoffs });
  }
  return snaps;
}

/** Колко пъти коритото е по-дълго от долината (коефициент на извитост). */
export function sinuosity(river: Pt[]) {
  let L = 0;
  for (let i = 1; i < river.length; i++) L += Math.hypot(river[i].x - river[i - 1].x, river[i].y - river[i - 1].y);
  return L / Math.hypot(river[river.length - 1].x - river[0].x, river[river.length - 1].y - river[0].y);
}
