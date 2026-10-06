import { useState } from 'react';
import {
  AngleMark,
  Buttons,
  Diagram,
  DiagramButton,
  Dot,
  Formula,
  Handle,
  Label,
  Note,
  Readout,
  Segment,
  VertexLabel,
} from './diagram';
import { angleAt, arcPath, fmt, norm360, polar, polarAngle, tones } from './diagramMath';

const O = { x: 240, y: 160 };
const R = 130;

/** Лежи ли ъгълът φ на дъгата от φ1 до φ2 (обратно на часовниковата стрелка)? */
const onArc = (phi: number, from: number, to: number) => norm360(phi - from) < norm360(to - from);

export function InscribedAngle() {
  const [phiA, setPhiA] = useState(215);
  const [phiB, setPhiB] = useState(325);
  const [phiP, setPhiP] = useState(100);

  // Централният ъгъл се опира на дъгата AB, която НЕ съдържа P
  const [from, to] = onArc(phiP, phiA, phiB) ? [phiB, phiA] : [phiA, phiB];
  const central = norm360(to - from);

  const A = polar(O, R, phiA);
  const B = polar(O, R, phiB);
  const P = polar(O, R, phiP);
  const inscribed = angleAt(P, A, B);

  const angle = (p: { x: number; y: number }) => Math.round(polarAngle(O, p)) % 360;
  // Точките не бива да съвпадат
  const apart = (phi: number, ...others: number[]) =>
    others.every(o => Math.min(norm360(phi - o), norm360(o - phi)) >= 6);

  const rr = 30;
  const bis = from + central / 2;

  return (
    <Diagram
      grid={false}
      hint="Влачи P по окръжността – вписаният ъгъл не се променя. Влачи A или B, за да смениш дъгата."
      readout={
        <>
          <Readout
            items={[
              { label: 'централен ∠AOB =', value: `${central}°`, tone: 'blue' },
              { label: 'вписан ∠APB =', value: `${fmt(inscribed, 1)}°`, tone: 'amber' },
            ]}
          />
          <Formula>
            ∠APB = ∠AOB / 2 = {central}° / 2 = {fmt(central / 2, 1)}°
          </Formula>
          {central === 180 && <Note>AB е диаметър, затова вписаният ъгъл е прав (теорема на Талес).</Note>}
          <Buttons>
            <DiagramButton onClick={() => setPhiB(norm360(phiA + 180))} active={central === 180}>
              AB е диаметър
            </DiagramButton>
          </Buttons>
        </>
      }
    >
      <circle cx={O.x} cy={O.y} r={R} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />

      {/* Дъгата AB, на която се опират двата ъгъла */}
      <path d={arcPath(O, R, from, to)} className={`fill-none ${tones.violet.stroke}`} strokeWidth="6" strokeLinecap="round" />

      <Segment p={O} q={A} tone="blue" width={2.5} />
      <Segment p={O} q={B} tone="blue" width={2.5} />
      <path d={arcPath(O, rr, from, to, true)} className={`${tones.blue.soft} stroke-none`} />
      <path d={arcPath(O, rr, from, to)} className={`fill-none ${tones.blue.stroke}`} strokeWidth="2" />
      <Label p={polar(O, rr + 16, bis)} tone="blue" size={14}>
        {central}°
      </Label>

      <Segment p={P} q={A} tone="amber" width={2.5} />
      <Segment p={P} q={B} tone="amber" width={2.5} />
      <AngleMark v={P} p={A} q={B} tone="amber" r={34} />

      <Dot p={O} tone="gray" />
      <Label p={{ x: O.x - 14, y: O.y - 12 }} tone="ink" size={16} weight={700}>O</Label>

      {[
        { name: 'A', phi: phiA, set: setPhiA, others: [phiB, phiP] },
        { name: 'B', phi: phiB, set: setPhiB, others: [phiA, phiP] },
        { name: 'P', phi: phiP, set: setPhiP, others: [phiA, phiB] },
      ].map(pt => (
        <g key={pt.name}>
          <VertexLabel p={polar(O, R, pt.phi)} center={O} name={pt.name} />
          <Handle
            p={polar(O, R, pt.phi)}
            name={pt.name}
            tone={pt.name === 'P' ? 'amber' : 'violet'}
            onMove={q => {
              const phi = angle(q);
              if (apart(phi, ...pt.others)) pt.set(phi);
            }}
          />
        </g>
      ))}
    </Diagram>
  );
}
