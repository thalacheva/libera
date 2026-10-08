import { useState } from 'react';
import { Buttons, Diagram, DiagramButton, Dot, Handle, Label, Note, Readout, Segment, VertexLabel } from './diagram';
import { dist, fmt, mid, Point, polygonArea, snap, sub, tones, UNIT, units } from './diagramMath';

const NAMES = ['A', 'B', 'C', 'D'];

/** Пресичат ли се отсечките PQ и RS (за проверка на самопресичане). */
function crosses(P: Point, Q: Point, R: Point, S: Point) {
  const cr = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return cr(P, Q, R) * cr(P, Q, S) < 0 && cr(R, S, P) * cr(R, S, Q) < 0;
}

/** Теорема на Вариньон: средите на страните на всеки четириъгълник са върхове на успоредник. */
export function VarignonLab() {
  const [V, setV] = useState<Point[]>([
    { x: 80, y: 240 },
    { x: 340, y: 280 },
    { x: 400, y: 80 },
    { x: 160, y: 60 },
  ]);
  const [diag, setDiag] = useState(true);
  const move = (i: number, p: Point) => {
    const next = V.map((v, k) => (k === i ? snap(p) : v));
    if (crosses(next[0], next[1], next[2], next[3]) || crosses(next[1], next[2], next[3], next[0])) return;
    if (polygonArea(next) < UNIT * UNIT * 2) return;
    setV(next);
  };

  const [A, B, C, D] = V;
  const M = [mid(A, B), mid(B, C), mid(C, D), mid(D, A)];
  const center = { x: (A.x + B.x + C.x + D.x) / 4, y: (A.y + B.y + C.y + D.y) / 4 };
  const S = polygonArea(V);
  const SM = polygonArea(M);
  const d1 = dist(A, C);
  const d2 = dist(B, D);
  const u = sub(C, A);
  const w = sub(D, B);
  const cos = Math.abs((u.x * w.x + u.y * w.y) / (d1 * d2));
  const perp = cos < 0.02;
  const equal = Math.abs(d1 - d2) < 0.5;
  const kind = perp && equal ? 'квадрат' : perp ? 'правоъгълник' : equal ? 'ромб' : 'успоредник';

  return (
    <Diagram
      hint="Влачи върховете – дори да направиш вдлъбнат четириъгълник. Средите на страните винаги образуват успоредник."
      readout={
        <>
          <Readout
            items={[
              { label: 'S(ABCD) =', value: fmt(S / (UNIT * UNIT)), tone: 'blue' },
              { label: 'S(MNPQ) =', value: fmt(SM / (UNIT * UNIT)), tone: 'violet' },
              { label: 'S(MNPQ) : S(ABCD) =', value: fmt(SM / S, 2), tone: 'violet' },
              { label: 'AC =', value: fmt(units(d1)), tone: 'amber' },
              { label: 'BD =', value: fmt(units(d2)), tone: 'emerald' },
            ]}
          />
          <Note tone="violet">
            MNPQ е {kind}
            {kind === 'успоредник' ? '. Страните му са успоредни на диагоналите и са половината от тях.' : perp && equal ? ' – диагоналите на ABCD са равни и перпендикулярни.' : perp ? ' – защото диагоналите на ABCD са перпендикулярни.' : ' – защото диагоналите на ABCD са равни.'}
          </Note>
          <Buttons>
            <DiagramButton active={diag} onClick={() => setDiag(d => !d)}>
              диагонали
            </DiagramButton>
          </Buttons>
        </>
      }
    >
      <polygon points={V.map(v => `${v.x},${v.y}`).join(' ')} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" strokeLinejoin="round" />
      {diag && (
        <>
          <Segment p={A} q={C} tone="amber" width={1.5} dashed />
          <Segment p={B} q={D} tone="emerald" width={1.5} dashed />
        </>
      )}
      <polygon points={M.map(v => `${v.x},${v.y}`).join(' ')} className={`${tones.violet.soft} ${tones.violet.stroke}`} strokeWidth="2.5" />
      {M.map((p, i) => (
        <g key={i}>
          <Dot p={p} tone="violet" r={4.5} />
          <Label p={{ x: p.x + (p.x > center.x ? 14 : -14), y: p.y + (p.y > center.y ? 12 : -12) }} tone="violet" size={13}>
            {['M', 'N', 'P', 'Q'][i]}
          </Label>
        </g>
      ))}
      {V.map((v, i) => (
        <g key={NAMES[i]}>
          <VertexLabel p={v} center={center} name={NAMES[i]} />
          <Handle p={v} name={NAMES[i]} onMove={p => move(i, p)} />
        </g>
      ))}
    </Diagram>
  );
}
