import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { correctCount, forward, type Net, netLoss, randomNet, trainStep, XOR } from './tinyNet';

const W = 640;
const H = 280;
const IN = [
  { x: 60, y: 80 },
  { x: 60, y: 200 },
];
const HID = [
  { x: 250, y: 80 },
  { x: 250, y: 200 },
];
const OUT = { x: 430, y: 140 };
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Връзка между два неврона: дебелината е големината на теглото, цветът – знакът му. */
function Edge({ a, c, w }: { a: { x: number; y: number }; c: { x: number; y: number }; w: number }) {
  return <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} className={w >= 0 ? 'stroke-rose-500' : 'stroke-blue-500'} strokeWidth={Math.min(9, 0.8 + Math.abs(w) * 1.1)} strokeLinecap="round" opacity="0.8" />;
}

/** Мрежа 2–2–1, която се учи на XOR с обратно разпространение: тегла, изходи и загуба. */
export default function XorTrainLab() {
  const [seed, setSeed] = useState(1);
  const [net, setNet] = useState<Net>(() => randomNet(1));
  const [steps, setSteps] = useState(0);
  const [curve, setCurve] = useState<number[]>(() => [netLoss(randomNet(1))]);

  const run = (n: number) => {
    let m = net;
    const out = [...curve];
    for (let i = 0; i < n; i++) {
      m = trainStep(m, 1);
      if ((steps + i + 1) % 10 === 0) out.push(netLoss(m));
    }
    setNet(m);
    setSteps(steps + n);
    setCurve(out);
  };
  const restart = () => {
    const s = seed + 1;
    setSeed(s);
    setNet(randomNet(s));
    setSteps(0);
    setCurve([netLoss(randomNet(s))]);
  };

  const loss = netLoss(net);
  const right = correctCount(net);
  // Малка крива на загубата вдясно
  const box = { x: 500, y: 40, w: 128, h: 90 };
  const top = Math.max(0.8, ...curve);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {HID.map((h, j) => IN.map((p, i) => <Edge key={`${i}${j}`} a={p} c={h} w={net.w1[j][i]} />))}
        {HID.map((h, j) => (
          <Edge key={`o${j}`} a={h} c={OUT} w={net.w2[j]} />
        ))}
        {IN.map((p, i) => (
          <g key={`i${i}`}>
            <circle cx={p.x} cy={p.y} r={24} className="fill-blue-50 stroke-blue-500 dark:fill-blue-950/60 dark:stroke-blue-400" strokeWidth="2" />
            <text x={p.x} y={p.y + 5} fontSize="14" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
              x{i === 0 ? '₁' : '₂'}
            </text>
          </g>
        ))}
        {HID.map((h, j) => (
          <g key={`h${j}`}>
            <circle cx={h.x} cy={h.y} r={24} className="fill-gray-50 stroke-gray-500 dark:fill-gray-900 dark:stroke-gray-400" strokeWidth="2" />
            <text x={h.x} y={h.y + 5} fontSize="14" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
              h{j === 0 ? '₁' : '₂'}
            </text>
          </g>
        ))}
        <circle cx={OUT.x} cy={OUT.y} r={24} className="fill-amber-50 stroke-amber-500 dark:fill-amber-950/50 dark:stroke-amber-400" strokeWidth="2" />
        <text x={OUT.x} y={OUT.y + 5} fontSize="14" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
          ŷ
        </text>
        <text x={60} y={H - 12} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          входове
        </text>
        <text x={250} y={H - 12} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          скрит слой
        </text>
        <text x={430} y={H - 12} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          изход
        </text>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/50 dark:stroke-gray-600" />
        <polyline points={curve.map((v, i) => `${box.x + (i / Math.max(1, curve.length - 1)) * box.w},${box.y + box.h - (Math.min(top, v) / top) * box.h}`).join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" />
        <text x={box.x + box.w / 2} y={box.y - 8} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          загуба по стъпките
        </text>
        <text x={box.x} y={152} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          вход → изход (цел)
        </text>
        {XOR.map(([a, b, t], i) => {
          const y = forward(net, a, b).y;
          const ok = (y > 0.5 ? 1 : 0) === t;
          return (
            <text key={i} x={box.x} y={174 + i * 22} fontSize="13" fontFamily="monospace" className={ok ? 'fill-emerald-700 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
              {a};{b} → {dec(y)} ({t}) {ok ? '✓' : '✗'}
            </text>
          );
        })}
      </LabSvg>
      <Buttons>
        <DiagramButton onClick={() => run(10)}>10 стъпки</DiagramButton>
        <DiagramButton onClick={() => run(100)}>100 стъпки</DiagramButton>
        <DiagramButton onClick={() => run(1000)}>1000 стъпки</DiagramButton>
        <DiagramButton onClick={restart}>нови случайни тегла</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: steps },
            { label: 'загуба', value: dec(loss, 3), tone: 'violet' },
            { label: 'верни', value: `${right} от 4`, tone: right === 4 ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={right === 4 ? 'emerald' : steps >= 3000 ? 'rose' : 'gray'}>
        {right === 4
          ? 'Мрежата научи XOR. Никой не ѝ каза какво да пресмятат скритите неврони – обратното разпространение им намери роля.'
          : steps >= 3000
            ? 'Тази мрежа заседна: загубата спря да намалява, макар отговорите да не са верни. Опитай с нови случайни тегла.'
            : 'Червените връзки са положителни тегла, сините – отрицателни; дебелината е големината им. В началото теглата са случайни и мрежата отговаря около 0,5 на всичко.'}
      </Note>
    </div>
  );
}
