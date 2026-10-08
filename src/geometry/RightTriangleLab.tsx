import { useState } from 'react';
import { AngleMark, Buttons, Diagram, DiagramButton, Formula, Handle, Label, Note, Segment, VertexLabel } from './diagram';
import { arcPath, fmt, Point, tones, units } from './diagramMath';

const A = { x: 60, y: 270 };
const B = { x: 420, y: 270 };
const O = { x: 240, y: 270 };
const R = 180;

type Show = 'h' | 'a' | 'b';

/** Метрични зависимости в правоъгълен триъгълник чрез подобните триъгълници AHC, CHB и ACB. */
export function RightTriangleLab() {
  const [phi, setPhi] = useState(60); // ъгълът COB в градуси
  const [show, setShow] = useState<Show>('h');

  const C = { x: O.x + R * Math.cos((phi * Math.PI) / 180), y: O.y - R * Math.sin((phi * Math.PI) / 180) };
  const H = { x: C.x, y: A.y };
  const c = units(B.x - A.x);
  const p = units(H.x - A.x); // AH – проекцията на AC
  const q = units(B.x - H.x); // HB – проекцията на BC
  const h = units(H.y - C.y);
  const a = Math.hypot(q, h); // BC
  const b = Math.hypot(p, h); // AC
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

  const moveC = (m: Point) => {
    const deg = (Math.atan2(O.y - m.y, m.x - O.x) * 180) / Math.PI;
    setPhi(Math.round(Math.min(165, Math.max(15, deg))));
  };

  const formula = {
    h: { text: `h² = p · q`, nums: `${fmt(h, 2)}² = ${fmt(h * h, 2)} и ${fmt(p, 2)} · ${fmt(q, 2)} = ${fmt(p * q, 2)}`, why: 'ΔAHC ~ ΔCHB (ЪЪ) ⇒ AH/CH = CH/HB' },
    a: { text: `a² = c · q`, nums: `${fmt(a, 2)}² = ${fmt(a * a, 2)} и ${fmt(c)} · ${fmt(q, 2)} = ${fmt(c * q, 2)}`, why: 'ΔCHB ~ ΔACB (ЪЪ) ⇒ HB/CB = CB/AB' },
    b: { text: `b² = c · p`, nums: `${fmt(b, 2)}² = ${fmt(b * b, 2)} и ${fmt(c)} · ${fmt(p, 2)} = ${fmt(c * p, 2)}`, why: 'ΔAHC ~ ΔACB (ЪЪ) ⇒ AH/AC = AC/AB' },
  }[show];

  // Подобните триъгълници, които дават избраната формула
  const left = { pts: [A, H, C], tone: 'amber' as const };
  const right = { pts: [H, B, C], tone: 'emerald' as const };
  const shade = show === 'h' ? [left, right] : show === 'a' ? [right] : [left];

  return (
    <Diagram
      grid={false}
      hint="Точката C се движи по полуокръжност с диаметър AB – затова ъгълът при C винаги е прав (Талес). Височината CH разделя триъгълника на два, подобни на него и помежду си."
      readout={
        <>
          <Buttons>
            <DiagramButton active={show === 'h'} onClick={() => setShow('h')}>
              височина h
            </DiagramButton>
            <DiagramButton active={show === 'a'} onClick={() => setShow('a')}>
              катет a = BC
            </DiagramButton>
            <DiagramButton active={show === 'b'} onClick={() => setShow('b')}>
              катет b = AC
            </DiagramButton>
          </Buttons>
          <Formula>
            <span className="font-semibold">{formula.text}</span>: &nbsp; {formula.nums}
          </Formula>
          <Note tone="violet">{formula.why}</Note>
          <Formula>
            Сбор: a² + b² = c · q + c · p = c(p + q) = c² – това е доказателство на Питагоровата теорема!
          </Formula>
        </>
      }
    >
      <path d={arcPath(O, R, 0, 180)} className="fill-none stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" strokeDasharray="5 5" />
      {shade.map(({ pts, tone }) => (
        <polygon key={tone} points={pts.map(v => `${v.x},${v.y}`).join(' ')} className={tones[tone].soft} />
      ))}
      <polygon points={[A, B, C].map(v => `${v.x},${v.y}`).join(' ')} className={`fill-none ${tones.blue.stroke}`} strokeWidth="2.5" />
      <Segment p={C} q={H} tone="rose" width={2.5} dashed />
      <AngleMark v={C} p={A} q={B} tone="blue" r={22} />
      <AngleMark v={H} p={B} q={C} tone="rose" r={18} />
      <Label p={{ x: (A.x + H.x) / 2, y: A.y + 20 }} tone="amber" size={15}>
        p = {fmt(p)}
      </Label>
      <Label p={{ x: (H.x + B.x) / 2, y: A.y + 20 }} tone="emerald" size={15}>
        q = {fmt(q)}
      </Label>
      <Label p={{ x: H.x + 10, y: (H.y + C.y) / 2 }} tone="rose" size={15} anchor="start">
        h = {fmt(h)}
      </Label>
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={H} center={{ x: H.x, y: H.y - 40 }} name="H" />
      <VertexLabel p={C} center={O} name="C" />
      <Handle p={C} onMove={moveC} name="C" />
    </Diagram>
  );
}
