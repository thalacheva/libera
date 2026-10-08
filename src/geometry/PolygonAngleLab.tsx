import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { AngleMark, Buttons, Diagram, DiagramButton, Formula, Note, Readout, Segment } from './diagram';
import { fmt, Point, tones } from './diagramMath';

type Mode = 'fan' | 'all';
const O = { x: 240, y: 165 };
const R = 135;
const FAN_TONES = ['fill-blue-500/15', 'fill-emerald-500/15', 'fill-amber-500/20', 'fill-rose-500/15', 'fill-violet-500/15'];

/** Сбор на ъглите (триангулация от един връх) и брой диагонали. */
export function PolygonAngleLab() {
  const [n, setN] = useState(6);
  const [mode, setMode] = useState<Mode>('fan');
  const V: Point[] = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: O.x + R * Math.cos(a), y: O.y + R * Math.sin(a) };
  });
  const poly = (pts: Point[]) => pts.map(p => `${p.x},${p.y}`).join(' ');
  const sum = (n - 2) * 180;
  const diagonals = (n * (n - 3)) / 2;

  return (
    <Diagram
      grid={false}
      hint="Диагоналите от един връх разрязват n-ъгълника на n − 2 триъгълника – всеки с 180°. Затова сборът на ъглите е (n − 2) · 180°."
      readout={
        <>
          <Buttons>
            <DiagramButton active={mode === 'fan'} onClick={() => setMode('fan')}>
              триъгълници от един връх
            </DiagramButton>
            <DiagramButton active={mode === 'all'} onClick={() => setMode('all')}>
              всички диагонали
            </DiagramButton>
          </Buttons>
          <Sliders>
            <Slider label="n" value={n} onChange={setN} min={3} max={12} step={1} tone="blue" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'сбор', value: `(${n} − 2) · 180° = ${sum}°`, tone: 'blue' },
                { label: 'вътрешен', value: `${fmt(sum / n)}°`, tone: 'rose' },
                { label: 'външен', value: `${fmt(360 / n)}°`, tone: 'amber' },
                { label: 'диагонали', value: diagonals, tone: 'emerald' },
              ]}
            />
          </div>
          {mode === 'all' ? (
            <Formula>
              От всеки от {n}-те върха излизат {n - 3} диагонала; всеки е броен два пъти ⇒ {n} · {n - 3} / 2 = {diagonals}
            </Formula>
          ) : (
            <Note tone="blue">
              {n - 2} триъгълника · 180° = {sum}°
            </Note>
          )}
        </>
      }
    >
      {mode === 'fan' &&
        Array.from({ length: n - 2 }, (_, i) => (
          <polygon key={i} points={poly([V[0], V[i + 1], V[i + 2]])} className={FAN_TONES[i % FAN_TONES.length]} />
        ))}
      <polygon points={poly(V)} className={`fill-none ${tones.blue.stroke}`} strokeWidth="2.5" />
      {mode === 'fan'
        ? Array.from({ length: n - 3 }, (_, i) => <Segment key={i} p={V[0]} q={V[i + 2]} tone="gray" width={1.5} />)
        : V.flatMap((p, i) => V.slice(i + 2, i === 0 ? n - 1 : n).map((q, j) => <Segment key={`${i}-${j}`} p={p} q={q} tone="emerald" width={1.2} />))}
      <AngleMark v={V[1]} p={V[0]} q={V[2]} tone="rose" r={24} label={`${fmt(sum / n)}°`} labelDistance={44} />
      {V.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} className={tones.blue.fill} />
      ))}
    </Diagram>
  );
}
