import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { AngleMark, Buttons, Diagram, DiagramButton, Formula, Note, Segment, SideLabel, VertexLabel } from './diagram';
import { fmt, tones, UNIT } from './diagramMath';

type Ratio = 'sin' | 'cos' | 'tg';

const RATIOS: Record<Ratio, { name: string; top: 'a' | 'b'; bottom: 'b' | 'c'; words: string }> = {
  sin: { name: 'sin α', top: 'a', bottom: 'c', words: 'противолежащ катет / хипотенуза' },
  cos: { name: 'cos α', top: 'b', bottom: 'c', words: 'прилежащ катет / хипотенуза' },
  tg: { name: 'tg α', top: 'a', bottom: 'b', words: 'противолежащ катет / прилежащ катет' },
};

/** sin, cos и tg като отношения на страни; при промяна на размера отношенията не се менят. */
export function RightTrigLab() {
  const [alpha, setAlpha] = useState(35);
  const [c, setC] = useState(12);
  const [ratio, setRatio] = useState<Ratio>('sin');

  const rad = (alpha * Math.PI) / 180;
  const a = c * Math.sin(rad);
  const b = c * Math.cos(rad);
  const A = { x: 60, y: 280 };
  const C = { x: A.x + b * UNIT, y: A.y };
  const B = { x: C.x, y: A.y - a * UNIT };
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

  const r = RATIOS[ratio];
  const len = { a, b, c };
  const tone = (side: 'a' | 'b' | 'c') => (side === r.top ? 'rose' : side === r.bottom ? 'blue' : 'gray');
  const width = (side: 'a' | 'b' | 'c') => (tone(side) === 'gray' ? 2 : 4);

  return (
    <Diagram
      hint="Промени хипотенузата c – триъгълникът става по-голям или по-малък, но отношенията не се променят: всички правоъгълни триъгълници с ъгъл α са подобни. Затова sin α, cos α и tg α зависят само от ъгъла."
      readout={
        <>
          <Buttons>
            {(Object.keys(RATIOS) as Ratio[]).map(k => (
              <DiagramButton key={k} active={k === ratio} onClick={() => setRatio(k)}>
                {RATIOS[k].name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="α" value={alpha} onChange={setAlpha} min={5} max={85} step={1} tone="amber" />
            <Slider label="c" value={c} onChange={setC} min={4} max={12} step={0.5} tone="violet" />
          </Sliders>
          <Formula>
            {r.name} = <span className={tones.rose.text}>{r.top}</span> / <span className={tones.blue.text}>{r.bottom}</span> = {fmt(len[r.top], 2)} /{' '}
            {fmt(len[r.bottom], 2)} = <span className="font-bold">{fmt(len[r.top] / len[r.bottom], 3)}</span>
          </Formula>
          <Note tone="gray">{r.words}</Note>
        </>
      }
    >
      <polygon points={[A, B, C].map(p => `${p.x},${p.y}`).join(' ')} className={tones.blue.soft} />
      <Segment p={B} q={C} tone={tone('a')} width={width('a')} />
      <Segment p={A} q={C} tone={tone('b')} width={width('b')} />
      <Segment p={A} q={B} tone={tone('c')} width={width('c')} />
      <AngleMark v={A} p={C} q={B} tone="amber" r={34} label={`${alpha}°`} labelDistance={52} />
      <AngleMark v={C} p={A} q={B} tone="gray" r={20} />
      <SideLabel p={B} q={C} center={center} tone={tone('a')} width={30}>
        a
      </SideLabel>
      <SideLabel p={A} q={C} center={center} tone={tone('b')}>
        b
      </SideLabel>
      <SideLabel p={A} q={B} center={center} tone={tone('c')}>
        c
      </SideLabel>
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      <VertexLabel p={C} center={center} name="C" />
    </Diagram>
  );
}
