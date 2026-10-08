import { useState } from 'react';
import { AngleMark, Diagram, Handle, Note, TickMark, VertexLabel } from './diagram';
import { Point, snap, tones } from './diagramMath';

const NAMES = ['A', 'B', 'C', 'D'];

type Kind = 'квадрат' | 'правоъгълник' | 'ромб' | 'успоредник' | 'равнобедрен трапец' | 'правоъгълен трапец' | 'трапец' | 'делтоид' | 'четириъгълник' | 'вдлъбнат четириъгълник' | 'самопресичаща се фигура';

const sub = (p: Point, q: Point) => ({ x: p.x - q.x, y: p.y - q.y });
const cross = (u: Point, v: Point) => u.x * v.y - u.y * v.x;
const dot = (u: Point, v: Point) => u.x * v.x + u.y * v.y;
const len2 = (u: Point) => dot(u, u);

function classify(V: Point[]) {
  const s = V.map((v, i) => sub(V[(i + 1) % 4], v));
  const turns = s.map((u, i) => cross(u, s[(i + 1) % 4]));
  const L = s.map(len2);
  const par02 = cross(s[0], s[2]) === 0;
  const par13 = cross(s[1], s[3]) === 0;
  const right = s.map((u, i) => dot(u, s[(i + 1) % 4]) === 0); // прав ъгъл при връх i + 1
  // Самопресичане: противоположните страни се пресичат
  const seg = (a: Point, b: Point, c: Point, d: Point) => cross(sub(b, a), sub(c, a)) * cross(sub(b, a), sub(d, a)) < 0 && cross(sub(d, c), sub(a, c)) * cross(sub(d, c), sub(b, c)) < 0;
  if (seg(V[0], V[1], V[2], V[3]) || seg(V[1], V[2], V[3], V[0])) return { kind: 'самопресичаща се фигура' as Kind, L, right, par02, par13 };
  const convex = turns.every(t => t > 0) || turns.every(t => t < 0);
  const kite = (L[0] === L[1] && L[2] === L[3]) || (L[1] === L[2] && L[3] === L[0]);
  let kind: Kind;
  if (!convex) kind = kite ? 'делтоид' : 'вдлъбнат четириъгълник';
  else if (par02 && par13) {
    const allRight = right.every(Boolean);
    const allEqual = L.every(l => l === L[0]);
    kind = allRight && allEqual ? 'квадрат' : allRight ? 'правоъгълник' : allEqual ? 'ромб' : 'успоредник';
  } else if (par02 || par13) {
    const legs = par02 ? [L[1], L[3]] : [L[0], L[2]];
    kind = right.some(Boolean) ? 'правоъгълен трапец' : legs[0] === legs[1] ? 'равнобедрен трапец' : 'трапец';
  } else kind = kite ? 'делтоид' : 'четириъгълник';
  return { kind, L, right, par02, par13 };
}

const CHALLENGES: { text: string; ok: (k: Kind, V: Point[]) => boolean }[] = [
  { text: 'Успоредник, който не е правоъгълник', ok: k => k === 'успоредник' || k === 'ромб' },
  { text: 'Ромб, който не е квадрат', ok: k => k === 'ромб' },
  { text: 'Правоъгълник, който не е квадрат', ok: k => k === 'правоъгълник' },
  { text: 'Квадрат, „завъртян“ спрямо мрежата', ok: (k, V) => k === 'квадрат' && V[0].x !== V[1].x && V[0].y !== V[1].y },
  { text: 'Равнобедрен трапец', ok: k => k === 'равнобедрен трапец' },
  { text: 'Правоъгълен трапец', ok: k => k === 'правоъгълен трапец' },
  { text: 'Делтоид („хвърчило“)', ok: k => k === 'делтоид' },
];

/** Игра: направи фигура с исканите свойства. */
export function ShapeDetectiveLab() {
  const [V, setV] = useState<Point[]>([
    { x: 120, y: 240 },
    { x: 340, y: 240 },
    { x: 380, y: 100 },
    { x: 140, y: 80 },
  ]);
  const [ci, setCi] = useState(0);
  const [done, setDone] = useState<boolean[]>(CHALLENGES.map(() => false));
  const { kind, L, right, par02, par13 } = classify(V);
  const center = { x: (V[0].x + V[1].x + V[2].x + V[3].x) / 4, y: (V[0].y + V[1].y + V[2].y + V[3].y) / 4 };

  const move = (i: number, p: Point) => {
    const next = V.map((v, k) => (k === i ? snap(p) : v));
    if (next.some((v, k) => next.some((w, j) => j !== k && v.x === w.x && v.y === w.y))) return;
    setV(next);
    const k = classify(next).kind;
    if (CHALLENGES[ci].ok(k, next) && !done[ci]) setDone(d => d.map((x, j) => (j === ci ? true : x)));
  };

  // Равни страни се отбелязват с еднакъв брой чертички
  const groups = [...new Set(L)];
  const ticks = L.map(l => (L.filter(x => x === l).length > 1 ? groups.indexOf(l) + 1 : 0));

  return (
    <Diagram
      hint="Влачи върховете по мрежата. Детективът разпознава фигурата по страните, ъглите и успоредните страни. Изпълни предизвикателствата!"
      readout={
        <>
          <p className="text-center text-lg font-bold text-gray-800 dark:text-gray-100">🔎 Това е: {kind}</p>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            успоредни двойки страни: {(par02 ? 1 : 0) + (par13 ? 1 : 0)} · прави ъгли: {right.filter(Boolean).length} · различни дължини на страните: {new Set(L).size}
          </p>
          <div className="mt-3 grid sm:grid-cols-2 gap-1.5">
            {CHALLENGES.map((c, i) => (
              <button
                key={c.text}
                onClick={() => {
                  setCi(i);
                  if (c.ok(kind, V)) setDone(d => d.map((x, j) => (j === i ? true : x)));
                }}
                className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-lg border text-sm ${
                  i === ci ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${done[i] ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{done[i] ? '✓' : i + 1}</span>
                <span className={done[i] ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'}>{c.text}</span>
              </button>
            ))}
          </div>
          <Note tone={done.every(Boolean) ? 'emerald' : CHALLENGES[ci].ok(kind, V) ? 'emerald' : 'gray'}>
            {done.every(Boolean) ? '🏆 Всички предизвикателства са изпълнени!' : CHALLENGES[ci].ok(kind, V) ? '✓ Точно така! Избери следващото.' : `Задача: ${CHALLENGES[ci].text.toLowerCase()}.`}
          </Note>
        </>
      }
    >
      <polygon points={V.map(v => `${v.x},${v.y}`).join(' ')} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" strokeLinejoin="round" />
      {V.map((v, i) => (ticks[i] ? <TickMark key={`t${i}`} p={v} q={V[(i + 1) % 4]} count={ticks[i]} tone="rose" /> : null))}
      {right.map((r, i) => {
        const at = V[(i + 1) % 4];
        return r ? <AngleMark key={`r${i}`} v={at} p={V[i]} q={V[(i + 2) % 4]} tone="emerald" r={18} /> : null;
      })}
      {V.map((v, i) => (
        <g key={NAMES[i]}>
          <VertexLabel p={v} center={center} name={NAMES[i]} />
          <Handle p={v} name={NAMES[i]} onMove={p => move(i, p)} />
        </g>
      ))}
    </Diagram>
  );
}
