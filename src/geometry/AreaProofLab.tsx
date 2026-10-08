import { useState } from 'react';
import { Buttons, Diagram, DiagramButton, Formula, Label, Note, Segment } from './diagram';
import { Point, tones } from './diagramMath';
import { Slider, Sliders } from '~/functions/plot';

type Mode = 'para' | 'trap';
const poly = (pts: Point[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

/** Лице чрез разрязване и преместване: успоредник → правоъгълник, два трапеца → успоредник. */
export function AreaProofLab() {
  const [mode, setMode] = useState<Mode>('para');
  const [t, setT] = useState(0);
  const ease = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) ** 2;

  let shapes: React.ReactNode;
  let formula: React.ReactNode;
  let note: string;
  if (mode === 'para') {
    // Основа 10, височина 6, наклон 3 (в единици по 20 px)
    const A = { x: 80, y: 260 };
    const B = { x: 280, y: 260 };
    const C = { x: 340, y: 140 };
    const D = { x: 140, y: 140 };
    const F = { x: 140, y: 260 }; // петата на височината от D
    const shift = 200 * ease;
    shapes = (
      <>
        <polygon points={poly([F, B, C, D])} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
        <polygon points={poly([A, F, D])} transform={`translate(${shift} 0)`} className={`${tones.amber.soft} ${tones.amber.stroke}`} strokeWidth="2.5" />
        {t < 0.02 && <polygon points={poly([A, B, C, D])} className="fill-none stroke-gray-400" strokeWidth="1" strokeDasharray="4 4" />}
        <Segment p={D} q={F} tone="rose" width={2} dashed />
        <Label p={{ x: 152, y: 200 }} tone="rose" size={14} anchor="start">
          h = 6
        </Label>
        <Label p={{ x: 180 + shift / 2, y: 282 }} tone="blue" size={14}>
          a = 10
        </Label>
      </>
    );
    formula = <>S = a · h = 10 · 6 = 60</>;
    note = 'Отрязваме триъгълника отляво и го местим надясно – получава се правоъгълник със същата основа и височина. Лицето не се променя!';
  } else {
    // Трапец с основи 10 и 4, височина 5
    const A = { x: 60, y: 270 };
    const B = { x: 260, y: 270 };
    const C = { x: 200, y: 170 };
    const D = { x: 120, y: 170 };
    const M = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
    shapes = (
      <>
        <polygon points={poly([A, B, C, D])} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
        <polygon points={poly([A, B, C, D])} transform={`rotate(${180 * ease} ${M.x} ${M.y})`} className={`${tones.amber.soft} ${tones.amber.stroke}`} strokeWidth="2.5" />
        <Segment p={D} q={{ x: D.x, y: A.y }} tone="rose" width={2} dashed />
        <Label p={{ x: D.x - 8, y: 220 }} tone="rose" size={14} anchor="end">
          h = 5
        </Label>
        <Label p={{ x: 160, y: 292 }} tone="blue" size={14}>
          a = 10
        </Label>
        <Label p={{ x: 160, y: 154 }} tone="blue" size={14}>
          c = 4
        </Label>
      </>
    );
    formula = ease > 0.98 ? <>2S = (a + c) · h = 14 · 5 = 70 ⇒ S = 35</> : <>S = (a + c) / 2 · h</>;
    note = 'Завъртаме копие на трапеца на 180° около средата на бедрото. Двата трапеца образуват успоредник с основа a + c и височина h – затова лицето на трапеца е половината.';
  }

  return (
    <Diagram
      hint="Плъзни, за да разрежеш и преместиш частите. Лицето на фигура не се променя, когато я разрежем и сглобим по друг начин."
      readout={
        <>
          <Buttons>
            <DiagramButton
              active={mode === 'para'}
              onClick={() => {
                setMode('para');
                setT(0);
              }}
            >
              успоредник → правоъгълник
            </DiagramButton>
            <DiagramButton
              active={mode === 'trap'}
              onClick={() => {
                setMode('trap');
                setT(0);
              }}
            >
              два трапеца → успоредник
            </DiagramButton>
          </Buttons>
          <Sliders>
            <Slider label="ход" value={t} onChange={setT} min={0} max={1} step={0.02} tone="amber" />
          </Sliders>
          <Formula>{formula}</Formula>
          <Note tone="gray">{note}</Note>
        </>
      }
    >
      {shapes}
    </Diagram>
  );
}
