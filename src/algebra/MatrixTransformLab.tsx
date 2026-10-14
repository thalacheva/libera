import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotHandle, PlotLine, PlotPolygon, PlotPolyline } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

type M = { a: number; b: number; c: number; d: number }; // ( a b ; c d ), стълбовете са образите на e₁ и e₂

const S = Math.SQRT1_2;
const PRESETS: { id: string; name: string; m: M; note: string }[] = [
  { id: 'id', name: 'единична E', m: { a: 1, b: 0, c: 0, d: 1 }, note: 'Единичната матрица оставя всяка точка на мястото ѝ.' },
  { id: 'rot90', name: 'завъртане 90°', m: { a: 0, b: -1, c: 1, d: 0 }, note: 'e₁ отива в e₂, а e₂ – в −e₁: всичко се завърта на 90° обратно на часовниковата стрелка.' },
  { id: 'rot45', name: 'завъртане 45°', m: { a: S, b: -S, c: S, d: S }, note: 'Стълбовете са (cos 45°; sin 45°) и (−sin 45°; cos 45°). Влаченето закръгля до цели числа.' },
  { id: 'refx', name: 'отражение в Ox', m: { a: 1, b: 0, c: 0, d: -1 }, note: 'y сменя знака си. Буквата F се вижда „наопаки“ – ориентацията е обърната, det = −1.' },
  { id: 'refyx', name: 'отражение в y = x', m: { a: 0, b: 1, c: 1, d: 0 }, note: 'x и y си разменят местата.' },
  { id: 'scale', name: 'разтягане', m: { a: 2, b: 0, c: 0, d: 1 }, note: 'Разтягане 2 пъти по x: лицето на всяка фигура се удвоява.' },
  { id: 'shear', name: 'хлъзгане', m: { a: 1, b: 1, c: 0, d: 1 }, note: 'Хлъзгане: всяка хоризонтална линия се измества с толкова, колкото е височината ѝ. Лицето не се променя.' },
  { id: 'proj', name: 'проекция', m: { a: 1, b: 0, c: 0, d: 0 }, note: 'Проекция върху Ox: цялата равнина „пада“ върху правата, det = 0 и обратна трансформация няма.' },
];

/** Буквата F – по нея се вижда дали трансформацията обръща равнината. */
const LETTER_F: Point[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.3, y: 2.3 },
  { x: 1.5, y: 2.3 },
  { x: 0.3, y: 2.3 },
  { x: 0.3, y: 1.4 },
  { x: 1.1, y: 1.4 },
];

const apply = (m: M, p: Point): Point => ({ x: m.a * p.x + m.b * p.y, y: m.c * p.x + m.d * p.y });

/** Матрицата като трансформация: стълбовете ѝ са образите на базисните вектори e₁ и e₂. */
export default function MatrixTransformLab() {
  const [m, setM] = useState<M>(PRESETS[6].m);
  const [preset, setPreset] = useState<string | null>('shear');
  const det = m.a * m.d - m.b * m.c;
  const note = PRESETS.find(p => p.id === preset)?.note;

  const set = (next: M) => {
    setM(next);
    setPreset(null);
  };

  // Образите на линиите от мрежата x = k и y = k
  const lines = [-4, -3, -2, -1, 1, 2, 3, 4];

  return (
    <Plot
      x={[-6, 6]}
      y={[-5, 5]}
      hint="Влачи краищата на синия вектор (образа на e₁) и червения (образа на e₂). Те са стълбовете на матрицата и определят къде отива всяка друга точка: (x; y) → x · (стълб 1) + y · (стълб 2). Сивата мрежа е образът на квадратната мрежа."
      readout={
        <>
          <Buttons>
            {PRESETS.map(p => (
              <DiagramButton
                key={p.id}
                active={p.id === preset}
                onClick={() => {
                  setM(p.m);
                  setPreset(p.id);
                }}
              >
                {p.name}
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'стълб 1 =', value: `(${num(m.a)}; ${num(m.c)})`, tone: 'blue' },
                { label: 'стълб 2 =', value: `(${num(m.b)}; ${num(m.d)})`, tone: 'rose' },
                { label: 'det =', value: num(det), tone: 'violet' },
              ]}
            />
          </div>
          <Note tone="violet">
            {note ??
              (det === 0
                ? 'det = 0: стълбовете лежат на една права и равнината се смачква в права (или точка).'
                : det < 0
                  ? `Лицата се умножават по |det| = ${num(Math.abs(det))}, а ориентацията се обръща – буквата F е огледална.`
                  : `Лицата се умножават по det = ${num(det)}; ориентацията се запазва.`)}
          </Note>
        </>
      }
    >
      {lines.map(k => (
        <g key={k}>
          <PlotLine p={apply(m, { x: k, y: -12 })} q={apply(m, { x: k, y: 12 })} tone="gray" width={1} />
          <PlotLine p={apply(m, { x: -12, y: k })} q={apply(m, { x: 12, y: k })} tone="gray" width={1} />
        </g>
      ))}
      <PlotPolyline points={[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]} tone="gray" width={1.5} />
      <PlotPolygon points={[{ x: 0, y: 0 }, apply(m, { x: 1, y: 0 }), apply(m, { x: 1, y: 1 }), apply(m, { x: 0, y: 1 })]} tone="violet" />
      <PlotPolyline points={LETTER_F} tone="gray" width={2} />
      <PlotPolyline points={LETTER_F.map(p => apply(m, p))} tone="amber" width={3.5} />
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: m.a, y: m.c }} tone="blue" />
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: m.b, y: m.d }} tone="rose" />
      <PlotHandle p={{ x: m.a, y: m.c }} onMove={q => set({ ...m, a: q.x, c: q.y })} name="Ae₁" tone="blue" />
      <PlotHandle p={{ x: m.b, y: m.d }} onMove={q => set({ ...m, b: q.x, d: q.y })} name="Ae₂" tone="rose" />
    </Plot>
  );
}
