import { useState } from 'react';
import { AngleMark, Buttons, Diagram, DiagramButton, Formula, Handle, Note, SideLabel, VertexLabel } from './diagram';
import { angleAt, dist, fmt, Point, snap, tones, UNIT, units } from './diagramMath';

type Mode = 'sine' | 'cosine' | 'area';

function circumcenter(A: Point, B: Point, C: Point): Point | null {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(d) < 1e-6) return null;
  const a2 = A.x ** 2 + A.y ** 2;
  const b2 = B.x ** 2 + B.y ** 2;
  const c2 = C.x ** 2 + C.y ** 2;
  return {
    x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d,
    y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d,
  };
}

const sinD = (deg: number) => Math.sin((deg * Math.PI) / 180);
const cosD = (deg: number) => Math.cos((deg * Math.PI) / 180);

/** Синусова и косинусова теорема и лицето S = ½ab·sin γ. */
export function TriangleLawsLab() {
  const [A, setA] = useState<Point>({ x: 100, y: 240 });
  const [B, setB] = useState<Point>({ x: 360, y: 240 });
  const [C, setC] = useState<Point>({ x: 180, y: 100 });
  const [mode, setMode] = useState<Mode>('sine');

  const a = units(dist(B, C));
  const b = units(dist(A, C));
  const c = units(dist(A, B));
  const alpha = angleAt(A, B, C);
  const beta = angleAt(B, A, C);
  const gamma = angleAt(C, A, B);
  const O = circumcenter(A, B, C);
  const R = O ? units(dist(O, A)) : 0;
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const degenerate = !O || a * b * c === 0 || Math.min(alpha, beta, gamma) < 1;

  return (
    <Diagram
      hint="Влачи върховете. Отношението на всяка страна към синуса на срещулежащия ъгъл е едно и също число – диаметърът на описаната окръжност."
      readout={
        <>
          <Buttons>
            <DiagramButton active={mode === 'sine'} onClick={() => setMode('sine')}>
              синусова теорема
            </DiagramButton>
            <DiagramButton active={mode === 'cosine'} onClick={() => setMode('cosine')}>
              косинусова теорема
            </DiagramButton>
            <DiagramButton active={mode === 'area'} onClick={() => setMode('area')}>
              лице
            </DiagramButton>
          </Buttons>
          {degenerate ? (
            <Note tone="rose">Върховете са на една права – това не е триъгълник.</Note>
          ) : mode === 'sine' ? (
            <>
              <Formula>
                a/sin α = {fmt(a, 2)}/{fmt(sinD(alpha), 3)} = {fmt(a / sinD(alpha), 2)}
              </Formula>
              <Formula>
                b/sin β = {fmt(b, 2)}/{fmt(sinD(beta), 3)} = {fmt(b / sinD(beta), 2)}
              </Formula>
              <Formula>
                c/sin γ = {fmt(c, 2)}/{fmt(sinD(gamma), 3)} = {fmt(c / sinD(gamma), 2)}
              </Formula>
              <Note tone="violet">2R = 2 · {fmt(R, 2)} = {fmt(2 * R, 2)}</Note>
            </>
          ) : mode === 'cosine' ? (
            <>
              <Formula>
                c² = a² + b² − 2ab · cos γ
              </Formula>
              <Formula>
                {fmt(c * c, 2)} = {fmt(a * a, 2)} + {fmt(b * b, 2)} − 2 · {fmt(a, 2)} · {fmt(b, 2)} · {fmt(cosD(gamma), 3).replace('-', '−')}
              </Formula>
              <Note tone={Math.abs(gamma - 90) < 0.5 ? 'emerald' : gamma > 90 ? 'amber' : 'blue'}>
                {Math.abs(gamma - 90) < 0.5
                  ? 'γ = 90° ⇒ cos γ = 0 и остава Питагоровата теорема c² = a² + b²'
                  : gamma > 90
                    ? 'γ > 90° ⇒ cos γ < 0, затова c² > a² + b² (тъпоъгълен триъгълник)'
                    : 'γ < 90° ⇒ cos γ > 0, затова c² < a² + b²'}
              </Note>
            </>
          ) : (
            <>
              <Formula>
                S = ½ · a · b · sin γ = ½ · {fmt(a, 2)} · {fmt(b, 2)} · {fmt(sinD(gamma), 3)} = {fmt(0.5 * a * b * sinD(gamma), 2)}
              </Formula>
              <Formula>
                S = abc/(4R) = {fmt(a * b * c, 1)}/(4 · {fmt(R, 2)}) = {fmt((a * b * c) / (4 * R), 2)}
              </Formula>
            </>
          )}
        </>
      }
    >
      {O && !degenerate && (
        <>
          <circle cx={O.x} cy={O.y} r={R * UNIT} className={`fill-none ${tones.violet.stroke}`} strokeWidth="1.5" strokeDasharray="5 5" opacity={mode === 'sine' ? 1 : 0.35} />
          <circle cx={O.x} cy={O.y} r={3} className={tones.violet.fill} />
        </>
      )}
      <polygon points={[A, B, C].map(p => `${p.x},${p.y}`).join(' ')} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      <AngleMark v={A} p={B} q={C} tone="amber" r={26} label={`${Math.round(alpha)}°`} labelDistance={44} />
      <AngleMark v={B} p={C} q={A} tone="emerald" r={26} label={`${Math.round(beta)}°`} labelDistance={44} />
      <AngleMark v={C} p={A} q={B} tone="rose" r={26} label={`${Math.round(gamma)}°`} labelDistance={44} />
      <SideLabel p={B} q={C} center={center} width={50}>
        a = {fmt(a)}
      </SideLabel>
      <SideLabel p={A} q={C} center={center} width={50}>
        b = {fmt(b)}
      </SideLabel>
      <SideLabel p={A} q={B} center={center} tone={mode === 'cosine' ? 'rose' : 'gray'} width={50}>
        c = {fmt(c)}
      </SideLabel>
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={C} center={center} name="C" />
      <Handle p={A} onMove={p => setA(snap(p))} name="A" />
      <Handle p={B} onMove={p => setB(snap(p))} name="B" />
      <Handle p={C} onMove={p => setC(snap(p))} name="C" />
    </Diagram>
  );
}
