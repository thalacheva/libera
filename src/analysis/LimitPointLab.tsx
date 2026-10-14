import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders, VLine } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const A = 2;
const X: [number, number] = [-2, 6];
const Y: [number, number] = [-2, 4];
// Мащабът на Plot: 480 px за целия интервал по x – за празните кръгчета, които рисуваме сами
const PPU = 480 / (X[1] - X[0]);
const svgX = (x: number) => (x - X[0]) * PPU;
const svgY = (y: number) => (Y[1] - y) * PPU;

type Case = {
  id: string;
  name: string;
  left: (x: number) => number;
  right: (x: number) => number;
  /** f(2) или null, ако не е дефинирана */
  value: number | null;
  limLeft: string;
  limRight: string;
  note: string;
};

const CASES: Case[] = [
  {
    id: 'cont',
    name: 'непрекъсната',
    left: x => 0.5 * x + 1,
    right: x => 0.5 * x + 1,
    value: 2,
    limLeft: '2',
    limRight: '2',
    note: 'Отляво и отдясно стойностите клонят към 2 и f(2) = 2. Границата съвпада със стойността – функцията е непрекъсната в точката.',
  },
  {
    id: 'hole',
    name: 'с „дупка“',
    left: x => (x + 2) / 2,
    right: x => (x + 2) / 2,
    value: 3,
    limLeft: '2',
    limRight: '2',
    note: 'Границата е 2, но f(2) = 3. Границата не зависи от стойността в самата точка – отстранимо прекъсване: „запушваме дупката“ с f(2) = 2.',
  },
  {
    id: 'jump',
    name: 'със скок',
    left: x => x / 2,
    right: x => x / 2 + 1,
    value: 2,
    limLeft: '1',
    limRight: '2',
    note: 'Лявата граница е 1, дясната – 2. Двете едностранни граници са различни, затова граница при x → 2 няма. Прекъсването е скок.',
  },
  {
    id: 'asym',
    name: 'с асимптота',
    left: x => 1 / (x - A) + 1,
    right: x => 1 / (x - A) + 1,
    value: null,
    limLeft: '−∞',
    limRight: '+∞',
    note: 'Отляво стойностите отиват към −∞, отдясно – към +∞. Правата x = 2 е вертикална асимптота, а y = 1 – хоризонтална.',
  },
];

function OpenDot({ x, y }: { x: number; y: number }) {
  return <circle cx={svgX(x)} cy={svgY(y)} r={6} className="fill-white dark:fill-gray-800 stroke-violet-500" strokeWidth={2.5} />;
}

/** Функция около точката x = 2: приближаваме се отляво и отдясно и гледаме към какво клонят стойностите. */
export default function LimitPointLab() {
  const [k, setK] = useState(0);
  const [h, setH] = useState(1);
  const C = CASES[k];
  const L = { x: A - h, y: C.left(A - h) };
  const R = { x: A + h, y: C.right(A + h) };
  const inView = (p: { y: number }) => p.y > Y[0] && p.y < Y[1];

  return (
    <Plot
      x={X}
      y={Y}
      hint="Намалявай h: синята точка идва отляво (x = 2 − h), розовата – отдясно (x = 2 + h). Границата е числото, към което клонят стойностите им; стойността f(2) в самата точка не влияе на границата."
      readout={
        <>
          <Buttons>
            {CASES.map((c, i) => (
              <DiagramButton
                key={c.id}
                active={i === k}
                onClick={() => {
                  setK(i);
                  setH(1);
                }}
              >
                {c.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="h" value={h} onChange={setH} min={0.02} max={1.5} step={0.02} tone="violet" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'f(2 − h) =', value: num(L.y, 3), tone: 'blue' },
                { label: 'f(2 + h) =', value: num(R.y, 3), tone: 'rose' },
                { label: 'f(2) =', value: C.value === null ? 'не е дефинирана' : num(C.value) },
              ]}
            />
          </div>
          <div className="mt-2">
            <Readout
              items={[
                { label: 'граница отляво', value: C.limLeft, tone: 'blue' },
                { label: 'граница отдясно', value: C.limRight, tone: 'rose' },
              ]}
            />
          </div>
          <Note tone={C.id === 'cont' ? 'emerald' : 'violet'}>{C.note}</Note>
        </>
      }
    >
      <VLine x={A} tone={C.id === 'asym' ? 'amber' : 'gray'} />
      {C.id === 'asym' && (
        <>
          <PlotLine p={{ x: X[0], y: 1 }} q={{ x: X[1], y: 1 }} tone="amber" dashed width={1.5} />
        </>
      )}
      <Curve f={C.left} to={A - 0.001} tone="gray" />
      <Curve f={C.right} from={A + 0.001} tone="gray" />
      {C.id === 'hole' && (
        <>
          <OpenDot x={A} y={2} />
          <PlotDot p={{ x: A, y: 3 }} tone="violet" r={6} />
        </>
      )}
      {C.id === 'jump' && (
        <>
          <OpenDot x={A} y={1} />
          <PlotDot p={{ x: A, y: 2 }} tone="violet" r={6} />
        </>
      )}
      {C.id === 'cont' && <PlotDot p={{ x: A, y: 2 }} tone="violet" r={6} />}
      {inView(L) && <PlotDot p={L} tone="blue" r={6} />}
      {inView(R) && <PlotDot p={R} tone="rose" r={6} />}
      <PlotLabel p={{ x: A, y: Y[0] }} dy={-10} dx={12} anchor="start" tone="violet" size={13}>
        x = 2
      </PlotLabel>
    </Plot>
  );
}
