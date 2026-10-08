import { useState } from 'react';
import { Buttons, Diagram, DiagramButton, Dot, Handle, Label, Note, Readout, Segment, VertexLabel } from './diagram';
import { add, dist, fmt, mid, Point, polygonArea, scale, snap, sub, tones, UNIT, units } from './diagramMath';

type Mode = 'median' | 'altitude' | 'bisector' | 'perp';
const MODES: { k: Mode; name: string; point: string; tone: 'blue' | 'rose' | 'emerald' | 'violet' }[] = [
  { k: 'median', name: 'медиани', point: 'медицентър G', tone: 'blue' },
  { k: 'altitude', name: 'височини', point: 'ортоцентър H', tone: 'rose' },
  { k: 'bisector', name: 'ъглополовящи', point: 'център на вписаната окръжност I', tone: 'emerald' },
  { k: 'perp', name: 'симетрали', point: 'център на описаната окръжност O', tone: 'violet' },
];
const NAMES = ['A', 'B', 'C'];

const foot = (p: Point, a: Point, b: Point): Point => {
  const d = sub(b, a);
  const t = ((p.x - a.x) * d.x + (p.y - a.y) * d.y) / (d.x * d.x + d.y * d.y);
  return add(a, scale(d, t));
};

function circumcenter(A: Point, B: Point, C: Point): Point {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const a2 = A.x * A.x + A.y * A.y;
  const b2 = B.x * B.x + B.y * B.y;
  const c2 = C.x * C.x + C.y * C.y;
  return {
    x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d,
    y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d,
  };
}

export function CentersLab() {
  const [V, setV] = useState<Point[]>([
    { x: 80, y: 260 },
    { x: 400, y: 260 },
    { x: 180, y: 60 },
  ]);
  const [mode, setMode] = useState<Mode>('median');
  const [euler, setEuler] = useState(false);
  const move = (i: number, p: Point) => {
    const next = V.map((v, k) => (k === i ? snap(p) : v));
    if (polygonArea(next) < UNIT * UNIT * 2) return;
    setV(next);
  };

  const [A, B, C] = V;
  const a = dist(B, C);
  const b = dist(C, A);
  const c = dist(A, B);
  const G = scale(add(add(A, B), C), 1 / 3);
  const O = circumcenter(A, B, C);
  const Hc = sub(add(add(A, B), C), scale(O, 2));
  const I = scale(add(add(scale(A, a), scale(B, b)), scale(C, c)), 1 / (a + b + c));
  const S = polygonArea(V);
  const r = (2 * S) / (a + b + c);
  const R = dist(O, A);
  const center = G;
  const m = MODES.find(x => x.k === mode)!;
  const tone = m.tone;

  // Отсечките за избрания вид
  const lines: React.ReactNode[] = [];
  V.forEach((P, i) => {
    const Q1 = V[(i + 1) % 3];
    const Q2 = V[(i + 2) % 3];
    if (mode === 'median') lines.push(<Segment key={i} p={P} q={mid(Q1, Q2)} tone={tone} width={2} />);
    if (mode === 'altitude') {
      const F = foot(P, Q1, Q2);
      lines.push(<Segment key={i} p={P} q={F} tone={tone} width={2} />);
      lines.push(<Segment key={`e${i}`} p={F} q={Hc} tone={tone} width={1.2} dashed />);
      // Петата е извън страната – продължаваме страната до нея
      if (dist(F, Q1) + dist(F, Q2) > dist(Q1, Q2) + 0.5) lines.push(<Segment key={`s${i}`} p={F} q={dist(F, Q1) < dist(F, Q2) ? Q1 : Q2} tone="gray" width={1.2} dashed />);
    }
    if (mode === 'bisector') {
      const s1 = dist(P, Q1);
      const s2 = dist(P, Q2);
      const D = scale(add(scale(Q1, s2), scale(Q2, s1)), 1 / (s1 + s2));
      lines.push(<Segment key={i} p={P} q={D} tone={tone} width={2} />);
    }
    if (mode === 'perp') {
      const M = mid(Q1, Q2);
      const d = sub(Q2, Q1);
      const len = Math.hypot(d.x, d.y);
      const n = { x: -d.y / len, y: d.x / len };
      const reach = Math.max(dist(M, O) + 40, 60);
      lines.push(<Segment key={i} p={add(M, scale(n, reach))} q={add(M, scale(n, -reach))} tone={tone} width={1.5} dashed />);
    }
  });
  const point = mode === 'median' ? G : mode === 'altitude' ? Hc : mode === 'bisector' ? I : O;
  const letter = mode === 'median' ? 'G' : mode === 'altitude' ? 'H' : mode === 'bisector' ? 'I' : 'O';
  const inside = Math.abs(polygonArea([A, B, point]) + polygonArea([B, C, point]) + polygonArea([C, A, point]) - S) < 1;

  const readout =
    mode === 'median'
      ? [
          { label: 'AG : GMₐ =', value: '2 : 1', tone: 'blue' as const },
          { label: 'AG =', value: fmt(units(dist(A, G))), tone: 'blue' as const },
          { label: 'GMₐ =', value: fmt(units(dist(G, mid(B, C)))), tone: 'blue' as const },
        ]
      : mode === 'bisector'
        ? [{ label: 'r =', value: fmt(units(r)), tone: 'emerald' as const }]
        : mode === 'perp'
          ? [{ label: 'R =', value: fmt(units(R)), tone: 'violet' as const }]
          : [{ label: 'H е', value: inside ? 'вътре в триъгълника' : 'извън триъгълника', tone: 'rose' as const }];

  return (
    <Diagram
      hint="Влачи върховете. Трите отсечки от един вид винаги се пресичат в една точка – дори когато тя излезе извън триъгълника."
      readout={
        <>
          <Buttons>
            {MODES.map(x => (
              <DiagramButton key={x.k} active={x.k === mode} onClick={() => setMode(x.k)}>
                {x.name}
              </DiagramButton>
            ))}
            <DiagramButton active={euler} onClick={() => setEuler(e => !e)}>
              права на Ойлер
            </DiagramButton>
          </Buttons>
          <Readout items={readout} />
          <Note tone={tone}>
            Пресечна точка: {m.point}
            {mode === 'perp' && ' – еднакво отдалечен от трите върха'}
            {mode === 'bisector' && ' – еднакво отдалечен от трите страни'}
            {mode === 'median' && ' – центърът на тежестта на триъгълника'}
            {mode === 'altitude' && (inside ? ' (остроъгълен триъгълник)' : ' – при тъпоъгълен триъгълник е извън него')}
          </Note>
          {euler && <Note tone="gray">O, G и H винаги лежат на една права и OG : GH = 1 : 2 (Ойлер, 1765 г.).</Note>}
        </>
      }
    >
      {mode === 'perp' && <circle cx={O.x} cy={O.y} r={R} className={`fill-none ${tones.violet.stroke}`} strokeWidth="1.5" strokeOpacity="0.6" />}
      {mode === 'bisector' && <circle cx={I.x} cy={I.y} r={r} className={`${tones.emerald.soft} ${tones.emerald.stroke}`} strokeWidth="1.5" />}
      <polygon points={V.map(v => `${v.x},${v.y}`).join(' ')} className={`${tones.gray.soft} ${tones.gray.stroke}`} strokeWidth="2.5" strokeLinejoin="round" />
      {lines}
      {euler && (
        <>
          <Segment p={add(O, scale(sub(Hc, O), -0.3))} q={add(Hc, scale(sub(Hc, O), 0.3))} tone="amber" width={2} />
          <Dot p={O} tone="violet" r={4} />
          <Dot p={G} tone="blue" r={4} />
          <Dot p={Hc} tone="rose" r={4} />
          {letter !== 'O' && <Label p={add(O, { x: 10, y: -10 })} tone="violet" size={13}>O</Label>}
          {letter !== 'G' && <Label p={add(G, { x: 10, y: -10 })} tone="blue" size={13}>G</Label>}
          {letter !== 'H' && <Label p={add(Hc, { x: 10, y: -10 })} tone="rose" size={13}>H</Label>}
        </>
      )}
      <Dot p={point} tone={tone} r={5.5} />
      <Label p={add(point, { x: 12, y: -12 })} tone={tone} size={15}>
        {letter}
      </Label>
      {V.map((v, i) => (
        <g key={NAMES[i]}>
          <VertexLabel p={v} center={center} name={NAMES[i]} />
          <Handle p={v} name={NAMES[i]} onMove={p => move(i, p)} />
        </g>
      ))}
    </Diagram>
  );
}
