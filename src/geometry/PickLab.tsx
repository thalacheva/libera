import { useState } from 'react';
import { Diagram, Formula, Handle, Note, Readout } from './diagram';
import { fmt, H, Point, snap, tones, UNIT, W } from './diagramMath';

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Точката P лежи на отсечката AB (в единици на мрежата)? */
function onSegment(p: Point, a: Point, b: Point) {
  const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return cross === 0 && Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}

/** Лъч надясно – пресича страните нечетен брой пъти, ако точката е вътре. */
function inside(p: Point, poly: Point[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

/** Самопресичане: несъседни страни, които се пресичат. */
function selfIntersecting(poly: Point[]) {
  const n = poly.length;
  const o = (a: Point, b: Point, c: Point) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  for (let i = 0; i < n; i++)
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const [a, b, c, d] = [poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n]];
      if (o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0) return true;
    }
  return false;
}

/** Формулата на Пик: S = I + B/2 − 1 за многоъгълник с върхове във възли на мрежата. */
export function PickLab() {
  const [pts, setPts] = useState<Point[]>([
    { x: 80, y: 260 },
    { x: 300, y: 280 },
    { x: 400, y: 160 },
    { x: 260, y: 60 },
    { x: 120, y: 120 },
  ]);
  // В единици на мрежата (y нагоре не е нужно – лицето е по модул)
  const g = pts.map(p => ({ x: p.x / UNIT, y: p.y / UNIT }));
  const n = g.length;
  let twice = 0;
  for (let i = 0; i < n; i++) twice += g[i].x * g[(i + 1) % n].y - g[(i + 1) % n].x * g[i].y;
  const S = Math.abs(twice) / 2;
  const bad = selfIntersecting(g);

  const lattice: { p: Point; kind: 'in' | 'on' }[] = [];
  for (let x = 0; x <= W / UNIT; x++)
    for (let y = 0; y <= H / UNIT; y++) {
      const p = { x, y };
      if (g.some((a, i) => onSegment(p, a, g[(i + 1) % n]))) lattice.push({ p, kind: 'on' });
      else if (inside(p, g)) lattice.push({ p, kind: 'in' });
    }
  const B = lattice.filter(l => l.kind === 'on').length;
  const I = lattice.length - B;
  const Bgcd = g.reduce((s, a, i) => s + gcd(Math.abs(g[(i + 1) % n].x - a.x), Math.abs(g[(i + 1) % n].y - a.y)), 0);

  return (
    <Diagram
      hint="Влачи върховете (те се закачат за възлите на мрежата). Преброй зелените точки вътре (I) и червените по контура (B) – формулата на Пик дава лицето без нито едно умножение."
      readout={
        bad ? (
          <Note tone="rose">Страните се пресичат – това не е многоъгълник. Раздели ги.</Note>
        ) : (
          <>
            <Readout
              items={[
                { label: 'I (вътре) =', value: I, tone: 'emerald' },
                { label: 'B (по контура) =', value: B, tone: 'rose' },
              ]}
            />
            <Formula>
              Пик: S = I + B/2 − 1 = {I} + {B}/2 − 1 = {fmt(I + B / 2 - 1, 1)}
            </Formula>
            <Formula>Гаус (по координатите на върховете): S = {fmt(S, 1)}</Formula>
            <Note tone="gray">Точките по една страна от (x₁; y₁) до (x₂; y₂) са НОД(|Δx|, |Δy|) + 1 – оттук B = {Bgcd}.</Note>
          </>
        )
      }
    >
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')} className={`${bad ? 'fill-rose-500/10' : tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      {!bad &&
        lattice.map(({ p, kind }) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x * UNIT} cy={p.y * UNIT} r={kind === 'on' ? 4.5 : 3.5} className={kind === 'on' ? 'fill-rose-500' : 'fill-emerald-500'} />
        ))}
      {pts.map((p, i) => (
        <Handle key={i} p={p} onMove={q => setPts(pts.map((r, j) => (j === i ? snap(q) : r)))} name={String.fromCharCode(65 + i)} />
      ))}
    </Diagram>
  );
}
