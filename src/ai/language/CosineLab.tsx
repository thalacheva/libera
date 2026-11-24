import { useState } from 'react';
import { Plot, PlotArrow, PlotHandle, PlotLabel, PlotLine } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { cosine, dot, euclid, norm } from './wordVectors';

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

const PRESETS: { label: string; a: [number, number]; b: [number, number] }[] = [
  { label: 'една посока, различна дължина', a: [2, 1], b: [6, 3] },
  { label: 'близки по дължина, различна посока', a: [4, 1], b: [1, 4] },
  { label: 'перпендикулярни', a: [4, 2], b: [-2, 4] },
  { label: 'противоположни', a: [3, 2], b: [-3, -2] },
];

/** Два вектора с влачещи се върхове: скаларно произведение, косинусова близост, ъгъл и евклидово разстояние. */
export default function CosineLab() {
  const [a, setA] = useState({ x: 2, y: 1 });
  const [b, setB] = useState({ x: 6, y: 3 });
  const va = [a.x, a.y];
  const vb = [b.x, b.y];
  const zero = norm(va) === 0 || norm(vb) === 0;
  const cos = cosine(va, vb);
  const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  const dist = euclid(va, vb);
  const o = { x: 0, y: 0 };

  return (
    <div className="mb-6">
      <Plot
        x={[-8, 8]}
        y={[-6, 6]}
        readout={
          <>
            <Readout
              items={[
                { label: 'a', value: `(${a.x}; ${a.y})`, tone: 'blue' },
                { label: 'b', value: `(${b.x}; ${b.y})`, tone: 'rose' },
                { label: 'a · b', value: dec(dot(va, vb), 0) },
                { label: '|a|', value: dec(norm(va)), tone: 'blue' },
                { label: '|b|', value: dec(norm(vb)), tone: 'rose' },
                { label: 'косинусова близост', value: zero ? '–' : dec(cos), tone: 'violet' },
                { label: 'ъгъл', value: zero ? '–' : `${dec(angle, 0)}°`, tone: 'violet' },
                { label: 'евклидово разстояние', value: dec(dist), tone: 'amber' },
              ]}
            />
            <Buttons>
              {PRESETS.map(p => (
                <DiagramButton
                  key={p.label}
                  active={a.x === p.a[0] && a.y === p.a[1] && b.x === p.b[0] && b.y === p.b[1]}
                  onClick={() => {
                    setA({ x: p.a[0], y: p.a[1] });
                    setB({ x: p.b[0], y: p.b[1] });
                  }}
                >
                  {p.label}
                </DiagramButton>
              ))}
            </Buttons>
            <Note tone={zero ? 'gray' : cos > 0.95 ? 'emerald' : cos < -0.95 ? 'rose' : 'gray'}>
              {zero
                ? 'Нулевият вектор няма посока – за него косинусовата близост не е определена.'
                : cos > 0.95
                  ? dist > 2
                    ? 'Векторите сочат почти в една посока: близостта е почти 1, макар върховете им да са далеч един от друг.'
                    : 'Векторите сочат почти в една посока – близостта е почти 1.'
                  : cos < -0.95
                    ? 'Противоположни посоки: близостта е почти −1.'
                    : Math.abs(cos) < 0.05
                      ? 'Перпендикулярни вектори: скаларното произведение е 0 и близостта е 0.'
                      : 'Влачи върховете на двата вектора. Жълтата пунктирана отсечка е евклидовото разстояние между тях.'}
            </Note>
          </>
        }
      >
        <PlotLine p={a} q={b} tone="amber" width={2} dashed />
        <PlotArrow p={o} q={a} tone="blue" />
        <PlotArrow p={o} q={b} tone="rose" />
        <PlotLabel p={a} tone="blue" dx={12} dy={-12} size={15}>
          a
        </PlotLabel>
        <PlotLabel p={b} tone="rose" dx={12} dy={-12} size={15}>
          b
        </PlotLabel>
        <PlotHandle p={a} onMove={setA} name="връх на вектора a" tone="blue" />
        <PlotHandle p={b} onMove={setB} name="връх на вектора b" tone="rose" />
      </Plot>
    </div>
  );
}
