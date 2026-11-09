import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotArrow, PlotPolyline } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';

type M = [[number, number], [number, number]];

const mul = (X: M, Y: M): M => [
  [X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]],
  [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]],
];
const apply = (m: M, p: Point): Point => ({ x: m[0][0] * p.x + m[0][1] * p.y, y: m[1][0] * p.x + m[1][1] * p.y });
const same = (X: M, Y: M) => X.every((r, i) => r.every((v, j) => Math.abs(v - Y[i][j]) < 1e-9));
const fmt = (m: M) => `(${num(m[0][0])} ${num(m[0][1])}; ${num(m[1][0])} ${num(m[1][1])})`;

const S = Math.SQRT1_2;
const ROT90: M = [[0, -1], [1, 0]];
const PAIRS: { id: string; name: string; A: M; B: M; nameA: string; nameB: string; note: string }[] = [
  {
    id: 'rotref',
    name: 'завъртане и отражение',
    A: ROT90,
    B: [[1, 0], [0, -1]],
    nameA: 'завъртане на 90°',
    nameB: 'отражение в Ox',
    note: 'Двата реда дават различни огледални образи: AB е отражение в правата y = x, а BA – в правата y = −x.',
  },
  {
    id: 'shearref',
    name: 'хлъзгане и отражение',
    A: [[1, 1], [0, 1]],
    B: [[1, 0], [0, -1]],
    nameA: 'хлъзгане надясно',
    nameB: 'отражение в Ox',
    note: 'След отражението буквата е под оста и хлъзгането я наклонява наляво; в обратния ред я наклонява надясно.',
  },
  {
    id: 'rotscale',
    name: 'завъртане и равномерно разтягане',
    A: ROT90,
    B: [[2, 0], [0, 2]],
    nameA: 'завъртане на 90°',
    nameB: 'разтягане 2 пъти',
    note: 'Тук AB = BA: равномерното разтягане не зависи от посоката, затова няма значение дали ще го направим преди или след завъртането.',
  },
  {
    id: 'rotrot',
    name: 'две завъртания',
    A: ROT90,
    B: [[S, -S], [S, S]],
    nameA: 'завъртане на 90°',
    nameB: 'завъртане на 45°',
    note: 'Две завъртания около началото също са разместими: и в двата реда резултатът е завъртане на 135°.',
  },
];

/** Буквата F – по нея се вижда и обръщането на равнината. */
const LETTER_F: Point[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.3, y: 2.3 },
  { x: 1.5, y: 2.3 },
  { x: 0.3, y: 2.3 },
  { x: 0.3, y: 1.4 },
  { x: 1.1, y: 1.4 },
];

/** Последователни трансформации: F → (първа)(F) → (втора)(първа(F)), сравнение на AB и BA. */
export default function CompositionLab() {
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [swap, setSwap] = useState(false);
  const pair = PAIRS.find(p => p.id === pairId)!;

  // AB = „първо B, после A“; при размяна – BA = „първо A, после B“
  const [first, second] = swap ? [pair.A, pair.B] : [pair.B, pair.A];
  const [firstName, secondName] = swap ? [pair.nameA, pair.nameB] : [pair.nameB, pair.nameA];
  const product = mul(second, first);
  const other = mul(first, second);
  const mid = LETTER_F.map(p => apply(first, p));
  const end = LETTER_F.map(p => apply(product, p));

  return (
    <Plot
      x={[-6, 6]}
      y={[-5, 5]}
      hint="Сивата буква F е началото. Синята е след първата трансформация, а оранжевата – след втората. Стрелките показват образите на e₁ и e₂ след двете стъпки – това са стълбовете на произведението."
      readout={
        <>
          <Buttons>
            {PAIRS.map(p => (
              <DiagramButton key={p.id} active={p.id === pairId} onClick={() => setPairId(p.id)}>
                {p.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Buttons>
            <DiagramButton active={!swap} onClick={() => setSwap(false)}>
              AB: първо B, после A
            </DiagramButton>
            <DiagramButton active={swap} onClick={() => setSwap(true)}>
              BA: първо A, после B
            </DiagramButton>
          </Buttons>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'A =', value: `${pair.nameA} ${fmt(pair.A)}`, tone: 'violet' },
                { label: 'B =', value: `${pair.nameB} ${fmt(pair.B)}`, tone: 'violet' },
              ]}
            />
          </div>
          <div className="mt-2">
            <Readout
              items={[
                { label: '1.', value: firstName, tone: 'blue' },
                { label: '2.', value: secondName, tone: 'amber' },
                { label: swap ? 'BA =' : 'AB =', value: fmt(product), tone: 'amber' },
              ]}
            />
          </div>
          <Note tone="violet">
            {same(product, other) ? 'AB = BA. ' : `AB ≠ BA: в другия ред се получава ${fmt(other)}. `}
            {pair.note}
          </Note>
        </>
      }
    >
      <PlotPolyline points={LETTER_F} tone="gray" width={2} />
      <PlotPolyline points={mid} tone="blue" width={2.5} />
      <PlotPolyline points={end} tone="amber" width={3.5} />
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: product[0][0], y: product[1][0] }} tone="blue" width={2} />
      <PlotArrow p={{ x: 0, y: 0 }} q={{ x: product[0][1], y: product[1][1] }} tone="rose" width={2} />
    </Plot>
  );
}
