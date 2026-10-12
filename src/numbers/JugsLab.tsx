import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, ZoomingSvg } from '~/geometry/diagram';
import { gcd } from '~/drill';

const UNIT = 18;
const BOTTOM = 200;

function Jug({ x, capacity, amount, name }: { x: number; capacity: number; amount: number; name: string }) {
  const h = capacity * UNIT;
  return (
    <g>
      <rect x={x} y={BOTTOM - amount * UNIT} width={80} height={amount * UNIT} className="fill-sky-400/70 dark:fill-sky-500/60" />
      {Array.from({ length: capacity - 1 }, (_, i) => (
        <line key={i} x1={x} y1={BOTTOM - (i + 1) * UNIT} x2={x + 10} y2={BOTTOM - (i + 1) * UNIT} className="stroke-gray-400 dark:stroke-gray-500" />
      ))}
      <path d={`M ${x} ${BOTTOM - h} V ${BOTTOM} H ${x + 80} V ${BOTTOM - h}`} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
      <Label p={{ x: x + 40, y: BOTTOM + 16 }} size={13} weight={600}>
        {`${name}: ${amount} от ${capacity} l`}
      </Label>
    </g>
  );
}

/** Задачата с двете кани: кои количества могат да се отмерят? Точно кратните на НОД на обемите. */
export default function JugsLab() {
  const [capA, setCapA] = useState(3);
  const [capB, setCapB] = useState(5);
  const [target, setTarget] = useState(4);
  const [[x, y], setState] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState(0);

  // Действието получава текущото съдържание на каните – така бързите поредни кликове не се губят
  const act = (f: (x: number, y: number) => [number, number]) => {
    setState(([x0, y0]) => f(x0, y0));
    setMoves(m => m + 1);
  };
  const reset = () => {
    setState([0, 0]);
    setMoves(0);
  };
  // Чертежът е толкова висок, колкото е по-голямата кана
  const top = BOTTOM - Math.max(capA, capB) * UNIT - 12;
  const g = gcd(capA, capB);
  const possible = target % g === 0 && target <= Math.max(capA, capB);
  const won = x === target || y === target;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox={`0 ${top} 480 ${BOTTOM + 28 - top}`}>
        <Jug x={110} capacity={capA} amount={x} name="A" />
        <Jug x={290} capacity={capB} amount={y} name="B" />
      </ZoomingSvg>
      <Buttons>
        <DiagramButton onClick={() => act((_, y0) => [capA, y0])}>Напълни A</DiagramButton>
        <DiagramButton onClick={() => act(x0 => [x0, capB])}>Напълни B</DiagramButton>
        <DiagramButton onClick={() => act((_, y0) => [0, y0])}>Изпразни A</DiagramButton>
        <DiagramButton onClick={() => act(x0 => [x0, 0])}>Изпразни B</DiagramButton>
        <DiagramButton
          onClick={() =>
            act((x0, y0) => {
              const t = Math.min(x0, capB - y0);
              return [x0 - t, y0 + t];
            })
          }
        >
          Прелей A → B
        </DiagramButton>
        <DiagramButton
          onClick={() =>
            act((x0, y0) => {
              const t = Math.min(y0, capA - x0);
              return [x0 + t, y0 - t];
            })
          }
        >
          Прелей B → A
        </DiagramButton>
        <DiagramButton onClick={reset}>Отначало</DiagramButton>
      </Buttons>
      <Note tone={won ? 'emerald' : possible ? 'blue' : 'rose'}>
        {won
          ? `Браво! Отмери ${target} l с ${moves} действия.`
          : possible
            ? `Цел: точно ${target} l в една от каните. Действия: ${moves}.`
            : `Невъзможно: НОД(${capA}, ${capB}) = ${g}, а ${target} не се дели на ${g}${target > Math.max(capA, capB) ? ' (и не се побира в каните)' : ''}.`}
      </Note>
      <Sliders>
        <Slider label="A, l" value={capA} onChange={v => {
            setCapA(v);
            reset();
          }} min={2} max={9} step={1} tone="blue" />
        <Slider label="B, l" value={capB} onChange={v => {
            setCapB(v);
            reset();
          }} min={2} max={9} step={1} tone="blue" />
        <Slider label="цел, l" value={target} onChange={v => {
            setTarget(v);
            reset();
          }} min={1} max={9} step={1} tone="emerald" />
      </Sliders>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Задачата е от филма „Умирай трудно 3“: с кани от 3 и 5 литра трябва да се отмерят точно 4 литра. Всяко количество, което получаваме, е от вида 3x + 5y с цели x и y – затова се получава всичко, кратно на НОД(3, 5) = 1. Пробвай и кани 4 и 6 литра: тогава нечетни количества не стават.
      </p>
    </div>
  );
}
