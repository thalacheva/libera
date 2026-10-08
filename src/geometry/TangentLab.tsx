import { useState } from 'react';
import { AngleMark, Diagram, Dot, Formula, Handle, Label, Note, Readout, Segment } from './diagram';
import { add, dist, fmt, Point, scale, snap, sub, tones, units } from './diagramMath';
import { Slider, Sliders } from '~/functions/plot';

const O = { x: 160, y: 160 };

/** Допирателни от външна точка: равни отсечки, перпендикулярни на радиусите. */
export function TangentLab() {
  const [P, setP] = useState<Point>({ x: 400, y: 120 });
  const [rU, setRU] = useState(4);
  const r = rU * 20;
  const d = dist(O, P);
  const outside = d > r + 1;

  let tangents: Point[] = [];
  if (outside) {
    const u = scale(sub(P, O), 1 / d);
    const phi = Math.acos(r / d);
    const rot = (v: Point, a: number) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });
    tangents = [add(O, scale(rot(u, phi), r)), add(O, scale(rot(u, -phi), r))];
  }
  const t = outside ? Math.sqrt(d * d - r * r) : 0;
  const angle = outside ? (2 * Math.asin(r / d) * 180) / Math.PI : 0;

  return (
    <Diagram
      hint="Влачи точката P. От точка извън окръжността минават точно две допирателни – и отсечките до допирните точки винаги са равни."
      readout={
        <>
          <Sliders>
            <Slider label="r" value={rU} onChange={setRU} min={2} max={6} step={1} tone="blue" />
          </Sliders>
          {outside ? (
            <>
              <Readout
                items={[
                  { label: 'OP =', value: fmt(units(d)), tone: 'gray' },
                  { label: 'r =', value: fmt(rU), tone: 'blue' },
                  { label: 'PT₁ = PT₂ =', value: fmt(units(t)), tone: 'rose' },
                  { label: '∠T₁PT₂ =', value: `${fmt(angle, 0)}°`, tone: 'amber' },
                ]}
              />
              <Formula>
                PT = √(OP² − r²) = √({fmt(units(d) ** 2)} − {fmt(rU * rU)}) = {fmt(units(t))}
              </Formula>
              <Note tone="rose">Радиусът към допирната точка е перпендикулярен на допирателната – затова триъгълниците OT₁P и OT₂P са правоъгълни и еднакви.</Note>
            </>
          ) : (
            <Note tone="amber">{Math.abs(d - r) <= 1 ? 'P е върху окръжността – през нея минава само една допирателна.' : 'P е вътре в окръжността – от нея не може да се прекара допирателна.'}</Note>
          )}
        </>
      }
    >
      <circle cx={O.x} cy={O.y} r={r} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      <Dot p={O} tone="gray" r={4} />
      <Label p={add(O, { x: -12, y: 12 })} tone="ink" size={14}>
        O
      </Label>
      {outside && (
        <>
          <Segment p={O} q={P} tone="gray" width={1.5} dashed />
          {tangents.map((T, i) => (
            <g key={i}>
              <Segment p={P} q={add(P, scale(sub(T, P), 1.35))} tone="rose" width={2.5} />
              <Segment p={O} q={T} tone="blue" width={2} />
              <AngleMark v={T} p={O} q={P} tone="emerald" r={16} />
              <Dot p={T} tone="rose" r={4.5} />
              <Label p={add(T, scale(sub(T, O), 18 / r))} tone="rose" size={14}>
                {i === 0 ? 'T₁' : 'T₂'}
              </Label>
            </g>
          ))}
        </>
      )}
      <Label p={add(P, { x: 14, y: -14 })} tone="ink" size={15}>
        P
      </Label>
      <Handle p={P} name="P" onMove={p => setP(snap(p))} tone="rose" />
    </Diagram>
  );
}
