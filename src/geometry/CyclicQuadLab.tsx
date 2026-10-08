import { useState } from 'react';
import { AngleMark, Buttons, Diagram, DiagramButton, Formula, Handle, Note, VertexLabel } from './diagram';
import { angleAt, dist, Point, polar, polarAngle, snap, tones } from './diagramMath';

const O = { x: 240, y: 160 };
const R = 120;
const NAMES = ['A', 'B', 'C', 'D'];

/** Вписан четириъгълник: сборът на срещуположните ъгли е 180°. */
export function CyclicQuadLab() {
  const [angles, setAngles] = useState([215, 320, 30, 120]);
  const [free, setFree] = useState(false);
  const [Dfree, setDfree] = useState<Point>(polar(O, R, 120));

  const V = angles.map(a => polar(O, R, a));
  if (free) V[3] = Dfree;
  // Върховете трябва да вървят по реда си около окръжността
  const ordered = (next: number[]) => {
    const rel = next.map(a => (((a - next[0]) % 360) + 360) % 360);
    return rel[1] < rel[2] && rel[2] < rel[3];
  };
  const move = (i: number, p: Point) => {
    if (free && i === 3) {
      setDfree(snap(p));
      return;
    }
    const next = angles.map((a, k) => (k === i ? Math.round(polarAngle(O, p)) : a));
    if (ordered(next)) setAngles(next);
  };

  const ang = V.map((v, i) => angleAt(v, V[(i + 3) % 4], V[(i + 1) % 4]));
  // Закръгляме A и B, а C и D допълваме, за да не излиза 181° от закръгляването
  const shown = free ? ang.map(a => Math.round(a)) : [Math.round(ang[0]), Math.round(ang[1]), 180 - Math.round(ang[0]), 180 - Math.round(ang[1])];
  const sAC = shown[0] + shown[2];
  const sBD = shown[1] + shown[3];
  const onCircle = Math.abs(dist(O, V[3]) - R) < 4;
  const center = { x: (V[0].x + V[1].x + V[2].x + V[3].x) / 4, y: (V[0].y + V[1].y + V[2].y + V[3].y) / 4 };
  const tonesList = ['rose', 'emerald', 'violet', 'amber'] as const;

  return (
    <Diagram
      grid={free}
      hint="Влачи върховете по окръжността. Срещуположните ъгли винаги допълват до 180°. Пусни D свободно и виж какво става, когато излезе от окръжността."
      readout={
        <>
          <Formula>
            ∠A + ∠C = {shown[0]}° + {shown[2]}° = {sAC}°
          </Formula>
          <Formula>
            ∠B + ∠D = {shown[1]}° + {shown[3]}° = {sBD}°
          </Formula>
          <Buttons>
            <DiagramButton
              active={free}
              onClick={() => {
                setFree(f => !f);
                setDfree(snap(polar(O, R, angles[3])));
              }}
            >
              {free ? 'върни D на окръжността' : 'пусни D свободно'}
            </DiagramButton>
          </Buttons>
          <Note tone={Math.abs(ang[0] + ang[2] - 180) < 1.5 ? 'emerald' : 'rose'}>
            {Math.abs(ang[0] + ang[2] - 180) < 1.5
              ? 'Сборът на срещуположните ъгли е 180° – четириъгълникът е вписан в окръжност.'
              : `D е ${dist(O, V[3]) > R ? 'извън' : 'вътре в'} окръжността – сборът вече не е 180°. Обратно: ако срещуположните ъгли допълват до 180°, около четириъгълника може да се опише окръжност.`}
          </Note>
          {!free && <Note tone="gray">Защо? ∠A и ∠C са вписани ъгли, които се опират на двете дъги BCD и BAD. Двете дъги заедно са 360°, значи ъглите заедно са 180°.</Note>}
        </>
      }
    >
      <circle cx={O.x} cy={O.y} r={R} className={`fill-none ${tones.blue.stroke}`} strokeWidth="2" strokeOpacity={free && !onCircle ? 0.4 : 1} />
      <polygon points={V.map(v => `${v.x},${v.y}`).join(' ')} className={`${tones.gray.soft} ${tones.gray.stroke}`} strokeWidth="2.5" strokeLinejoin="round" />
      {V.map((v, i) => (
        <AngleMark key={`a${i}`} v={v} p={V[(i + 3) % 4]} q={V[(i + 1) % 4]} tone={tonesList[i]} r={24} label={`${shown[i]}°`} labelDistance={42} />
      ))}
      {V.map((v, i) => (
        <g key={NAMES[i]}>
          <VertexLabel p={v} center={center} name={NAMES[i]} />
          <Handle p={v} name={NAMES[i]} onMove={p => move(i, p)} tone={free && i === 3 ? 'rose' : 'blue'} />
        </g>
      ))}
    </Diagram>
  );
}
