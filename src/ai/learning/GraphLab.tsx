import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const W = 640;
const H = 250;
const dec = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('bg-BG', { maximumFractionDigits: d }).replace('-', '−');

type Node = { id: string; x: number; y: number; label: string; value: number; grad: number; kind: 'in' | 'op' | 'out' };

/** Граф на изчисленията за един неврон с квадратична загуба: стойностите вървят надясно, производните – наляво. */
export default function GraphLab() {
  const [x, setX] = useState(2);
  const [w, setW] = useState(1.5);
  const [b, setB] = useState(-1);
  const [y, setY] = useState(4);
  const [back, setBack] = useState(false);

  // Права посока
  const p = w * x;
  const z = p + b;
  const e = z - y;
  const L = e * e;
  // Обратна посока: производната на L по всяка междинна стойност
  const dE = 2 * e;
  const dZ = dE;
  const dP = dZ;
  const dB = dZ;
  const dW = dP * x;
  const dX = dP * w;
  const dY = -dE;

  const nodes: Node[] = [
    { id: 'x', x: 50, y: 50, label: 'x', value: x, grad: dX, kind: 'in' },
    { id: 'w', x: 50, y: 120, label: 'w', value: w, grad: dW, kind: 'in' },
    { id: 'b', x: 190, y: 190, label: 'b', value: b, grad: dB, kind: 'in' },
    { id: 'y', x: 330, y: 190, label: 'y', value: y, grad: dY, kind: 'in' },
    { id: 'p', x: 190, y: 85, label: 'w·x', value: p, grad: dP, kind: 'op' },
    { id: 'z', x: 330, y: 85, label: 'ŷ = w·x + b', value: z, grad: dZ, kind: 'op' },
    { id: 'e', x: 470, y: 85, label: 'e = ŷ − y', value: e, grad: dE, kind: 'op' },
    { id: 'L', x: 590, y: 85, label: 'L = e²', value: L, grad: 1, kind: 'out' },
  ];
  const at = (id: string) => nodes.find(n => n.id === id)!;
  const edges: [string, string][] = [
    ['x', 'p'],
    ['w', 'p'],
    ['p', 'z'],
    ['b', 'z'],
    ['z', 'e'],
    ['y', 'e'],
    ['e', 'L'],
  ];

  const stepDown = () => {
    setW(v => Math.round((v - 0.05 * dW) * 100) / 100);
    setB(v => Math.round((v - 0.05 * dB) * 100) / 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {edges.map(([a, c]) => (
          <line key={a + c} x1={at(a).x} y1={at(a).y} x2={at(c).x} y2={at(c).y} className={back ? 'stroke-rose-400 dark:stroke-rose-500' : 'stroke-gray-400 dark:stroke-gray-500'} strokeWidth="2" />
        ))}
        {nodes.map(n => (
          <g key={n.id}>
            <rect
              x={n.x - 44}
              y={n.y - 26}
              width={88}
              height={52}
              rx={10}
              className={n.kind === 'in' ? 'fill-blue-50 stroke-blue-500 dark:fill-blue-950/50 dark:stroke-blue-400' : n.kind === 'out' ? 'fill-amber-50 stroke-amber-500 dark:fill-amber-950/40 dark:stroke-amber-400' : 'fill-gray-50 stroke-gray-400 dark:fill-gray-900/60 dark:stroke-gray-500'}
              strokeWidth="1.5"
            />
            <text x={n.x} y={n.y - 9} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 9} fontSize="14" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
              {dec(n.value)}
            </text>
            {back && (
              <text x={n.x} y={n.y + 22} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
                ∂L: {dec(n.grad)}
              </text>
            )}
          </g>
        ))}
        <text x={W - 8} y={H - 10} fontSize="12" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          {back ? 'червено: с колко се променя L, ако тази стойност нарасне с малко' : 'стойностите се пресмятат отляво надясно'}
        </text>
      </LabSvg>
      <Sliders>
        <Slider label="x" value={x} onChange={setX} min={-3} max={3} step={0.5} tone="blue" />
        <Slider label="w" value={w} onChange={setW} min={-3} max={3} step={0.05} tone="violet" />
        <Slider label="b" value={b} onChange={setB} min={-3} max={3} step={0.05} tone="violet" />
        <Slider label="y" value={y} onChange={setY} min={-5} max={5} step={0.5} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={back} onClick={() => setBack(v => !v)}>
          обратна посока
        </DiagramButton>
        <DiagramButton onClick={stepDown}>една стъпка на спускането (η = 0,05)</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'загуба L', value: dec(L), tone: 'amber' },
            { label: '∂L/∂w', value: dec(dW), tone: 'rose' },
            { label: '∂L/∂b', value: dec(dB), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={L < 0.001 ? 'emerald' : 'gray'}>
        {L < 0.001
          ? 'Загубата е практически нула: невронът предсказва точно y за този пример.'
          : 'Включи „обратна посока“ и проследи червените числа отдясно наляво: всяко се получава от съседа си вдясно, умножен по местната производна.'}
      </Note>
    </div>
  );
}
