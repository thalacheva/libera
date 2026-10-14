import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotHandle, PlotLabel, PlotPolygon, PlotPolyline } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

const SHAPES = [
  { id: 'square', name: 'единичен квадрат' },
  { id: 'circle', name: 'единичен кръг' },
] as const;

/** Детерминантата като коефициент на лицето: образът на единичния квадрат е успоредник с лице |det|. */
export default function DeterminantAreaLab() {
  const [u, setU] = useState<Point>({ x: 3, y: 1 });
  const [v, setV] = useState<Point>({ x: 1, y: 2 });
  const [shape, setShape] = useState<(typeof SHAPES)[number]['id']>('square');
  const det = u.x * v.y - v.x * u.y;
  const tone = det > 0 ? 'blue' : det < 0 ? 'rose' : 'gray';
  const O = { x: 0, y: 0 };

  // Образът на окръжността: (cos t; sin t) → cos t · u + sin t · v
  const ellipse = Array.from({ length: 73 }, (_, k) => {
    const t = (k / 72) * 2 * Math.PI;
    return { x: Math.cos(t) * u.x + Math.sin(t) * v.x, y: Math.cos(t) * u.y + Math.sin(t) * v.y };
  });
  const circle = Array.from({ length: 73 }, (_, k) => {
    const t = (k / 72) * 2 * Math.PI;
    return { x: Math.cos(t), y: Math.sin(t) };
  });
  // Малка дъга от u към v показва посоката на обхождане
  const turn = Array.from({ length: 13 }, (_, k) => {
    const s = k / 12;
    const w = { x: (1 - s) * u.x + s * v.x, y: (1 - s) * u.y + s * v.y };
    const len = Math.hypot(w.x, w.y) || 1;
    return { x: (0.9 * w.x) / len, y: (0.9 * w.y) / len };
  });

  return (
    <Plot
      x={[-6, 6]}
      y={[-5, 5]}
      hint="Влачи краищата на двата стълба u = (a; c) и v = (b; d) на матрицата. Образът на единичния квадрат е успоредникът със страни u и v, а лицето му е |ad − bc|. Знакът на детерминантата казва дали от u към v се завърта обратно на часовниковата стрелка (+) или по нея (−)."
      readout={
        <>
          <Buttons>
            {SHAPES.map(s => (
              <DiagramButton key={s.id} active={s.id === shape} onClick={() => setShape(s.id)}>
                {s.name}
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'u =', value: `(${num(u.x)}; ${num(u.y)})`, tone: 'blue' },
                { label: 'v =', value: `(${num(v.x)}; ${num(v.y)})`, tone: 'rose' },
                { label: 'det =', value: `${num(u.x)}·${num(v.y)} − ${num(v.x)}·${num(u.y)} = ${num(det)}`, tone: 'violet' },
              ]}
            />
          </div>
          <Note tone={det === 0 ? 'amber' : 'violet'}>
            {det === 0
              ? 'det = 0: u и v лежат на една права, успоредникът се сплесква в отсечка – лицето е 0 и обратна матрица няма.'
              : shape === 'square'
                ? `Лицето на успоредника е |det| = ${num(Math.abs(det))}. ${det > 0 ? 'Ориентацията се запазва.' : 'Ориентацията е обърната (като в огледало).'}`
                : `Кръгът с лице π става елипса с лице π · |det| ≈ ${num(Math.PI * Math.abs(det))}. Всяка фигура увеличава лицето си |det| пъти.`}
          </Note>
        </>
      }
    >
      {shape === 'square' ? (
        <>
          <PlotPolyline points={[O, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, O]} tone="gray" width={1.5} />
          <PlotPolygon points={[O, u, { x: u.x + v.x, y: u.y + v.y }, v]} tone={tone} />
        </>
      ) : (
        <>
          <PlotPolyline points={circle} tone="gray" width={1.5} />
          {det !== 0 && <PlotPolygon points={ellipse} tone={tone} />}
          {det === 0 && <PlotPolyline points={ellipse} tone="gray" width={3} />}
        </>
      )}
      {det !== 0 && (
        <>
          <PlotPolyline points={turn.slice(0, 10)} tone="violet" width={2} />
          <PlotArrow p={turn[8]} q={turn[12]} tone="violet" width={2} />
        </>
      )}
      {det !== 0 && shape === 'square' && (
        <PlotLabel p={{ x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 }} tone="violet" size={13}>
          {num(Math.abs(det))}
        </PlotLabel>
      )}
      <PlotArrow p={O} q={u} tone="blue" />
      <PlotArrow p={O} q={v} tone="rose" />
      <PlotHandle p={u} onMove={setU} name="u" tone="blue" />
      <PlotHandle p={v} onMove={setV} name="v" tone="rose" />
    </Plot>
  );
}
