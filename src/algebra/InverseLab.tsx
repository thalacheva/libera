import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotDot, PlotHandle, PlotLine, PlotPolyline } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

type M = { a: number; b: number; c: number; d: number };

const S = Math.SQRT1_2;
const PRESETS: { id: string; name: string; m: M; note: string }[] = [
  { id: 'rot45', name: 'завъртане 45°', m: { a: S, b: -S, c: S, d: S }, note: 'Обратното на завъртане на 45° е завъртане на −45°, т.е. на 45° по часовниковата стрелка.' },
  { id: 'shear', name: 'хлъзгане', m: { a: 1, b: 1, c: 0, d: 1 }, note: 'Хлъзгането надясно се отменя с хлъзгане наляво: обратната е (1 −1; 0 1).' },
  { id: 'scale', name: 'разтягане', m: { a: 2, b: 0, c: 0, d: 1 }, note: 'Разтягането 2 пъти по x се отменя със свиване 2 пъти: обратната е (0,5 0; 0 1).' },
  { id: 'refx', name: 'отражение в Ox', m: { a: 1, b: 0, c: 0, d: -1 }, note: 'Отражението е обратно само на себе си: два пъти огледало връщат всичко на място, A⁻¹ = A.' },
  { id: 'proj', name: 'проекция', m: { a: 1, b: 0, c: 0, d: 0 }, note: '' },
];

const LETTER_F: Point[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.3, y: 2.3 },
  { x: 1.5, y: 2.3 },
  { x: 0.3, y: 2.3 },
  { x: 0.3, y: 1.4 },
  { x: 1.1, y: 1.4 },
];

const apply = (m: M, p: Point): Point => ({ x: m.a * p.x + m.b * p.y, y: m.c * p.x + m.d * p.y });
const fmt = (m: M) => `(${num(m.a)} ${num(m.b)}; ${num(m.c)} ${num(m.d)})`;

/** Обратната трансформация: A мести буквата F, A⁻¹ я връща; при det = 0 обратна няма. */
export default function InverseLab() {
  const [m, setM] = useState<M>(PRESETS[0].m);
  const [preset, setPreset] = useState<string | null>(PRESETS[0].id);
  const [back, setBack] = useState(false);

  const det = m.a * m.d - m.b * m.c;
  const invertible = Math.abs(det) > 1e-9;
  const inv: M | null = invertible ? { a: m.d / det, b: -m.b / det, c: -m.c / det, d: m.a / det } : null;
  const image = LETTER_F.map(p => apply(m, p));
  const note = PRESETS.find(p => p.id === preset)?.note;

  const choose = (id: string, next: M) => {
    setM(next);
    setPreset(id);
    setBack(false);
  };

  // Две различни точки, които при det = 0 отиват в една и съща: разликата им е вектор k с A·k = 0
  let twins: [Point, Point] | null = null;
  if (!invertible) {
    const k = Math.hypot(m.a, m.b) > 1e-9 ? { x: m.b, y: -m.a } : Math.hypot(m.c, m.d) > 1e-9 ? { x: m.d, y: -m.c } : { x: 1, y: 0 };
    const len = Math.hypot(k.x, k.y);
    const p0 = { x: 1, y: 2 };
    twins = [p0, { x: p0.x + (1.5 * k.x) / len, y: p0.y + (1.5 * k.y) / len }];
  }

  return (
    <Plot
      x={[-5, 5]}
      y={[-4, 4]}
      hint="Сивата буква F е началото, оранжевата – образът ѝ при A. Натисни „Върни с A⁻¹“: обратната матрица връща всяка точка точно там, откъдето е тръгнала. Можеш да влачиш и стълбовете на A."
      readout={
        <>
          <Buttons>
            {PRESETS.map(p => (
              <DiagramButton key={p.id} active={p.id === preset} onClick={() => choose(p.id, p.m)}>
                {p.name}
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'A =', value: fmt(m), tone: 'amber' },
                { label: 'det A =', value: num(det), tone: 'violet' },
                { label: 'A⁻¹ =', value: inv ? fmt(inv) : 'няма', tone: 'emerald' },
              ]}
            />
          </div>
          <Buttons>
            <DiagramButton active={back} onClick={() => invertible && setBack(!back)}>
              {back ? 'Покажи само A' : 'Върни с A⁻¹'}
            </DiagramButton>
          </Buttons>
          <Note tone={invertible ? 'violet' : 'amber'}>
            {invertible
              ? back
                ? 'Зелената буква е A⁻¹, приложена към оранжевата – тя легна точно върху сивата: A⁻¹A = E. '
                : ''
              : 'det A = 0: равнината се смачква в права. Двете червени точки отиват в една и съща, затова няма как да разберем откъде е дошла – обратна матрица няма. '}
            {invertible ? note : ''}
          </Note>
        </>
      }
    >
      <PlotPolyline points={LETTER_F} tone="gray" width={2} />
      <PlotPolyline points={image} tone="amber" width={3.5} />
      {back && inv && <PlotPolyline points={image.map(p => apply(inv, p))} tone="emerald" width={2.5} />}
      {twins && (
        <>
          <PlotLine p={twins[0]} q={apply(m, twins[0])} tone="rose" width={1.5} dashed />
          <PlotLine p={twins[1]} q={apply(m, twins[1])} tone="rose" width={1.5} dashed />
          <PlotDot p={twins[0]} tone="rose" />
          <PlotDot p={twins[1]} tone="rose" />
          <PlotDot p={apply(m, twins[0])} tone="violet" r={6} />
        </>
      )}
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: m.a, y: m.c }} tone="blue" />
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: m.b, y: m.d }} tone="rose" />
      <PlotHandle p={{ x: m.a, y: m.c }} onMove={q => choose('', { ...m, a: q.x, c: q.y })} name="Ae₁" tone="blue" />
      <PlotHandle p={{ x: m.b, y: m.d }} onMove={q => choose('', { ...m, b: q.x, d: q.y })} name="Ae₂" tone="rose" />
    </Plot>
  );
}
