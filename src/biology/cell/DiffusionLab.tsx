import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { useSimulation } from '~/physics/sim';

type Substance = 'o2' | 'water' | 'na' | 'glucose';

const SUBSTANCES: Record<Substance, { label: string; color: string; lipid: number; channel: number; protein: string; why: string }> = {
  o2: { label: 'O₂', color: '#ef4444', lipid: 0.9, channel: 0, protein: '', why: 'Кислородът е малка неполярна молекула – минава направо през липидния слой. Белтъци не са му нужни.' },
  water: {
    label: 'H₂O',
    color: '#0ea5e9',
    lipid: 0.04,
    channel: 1,
    protein: 'аквапорини',
    why: 'Водата е малка, но полярна – през липидите минава бавно. Аквапорините са канали само за вода и ускоряват преминаването многократно.',
  },
  na: { label: 'Na⁺', color: '#a855f7', lipid: 0, channel: 1, protein: 'натриеви канали', why: 'Йоните са заредени и обвити с вода – неполярната среда на мембраната не ги пуска. Минават само през отворени йонни канали.' },
  glucose: { label: 'глюкоза', color: '#f59e0b', lipid: 0, channel: 0.4, protein: 'преносители на глюкоза', why: 'Глюкозата е голяма полярна молекула. Минава само с белтъци-преносители, които я свързват и се преобръщат – по-бавно от канал.' },
};

// Кутията и мембраната (в пиксели на чертежа)
const X0 = 12;
const X1 = 468;
const Y0 = 14;
const Y1 = 186;
const M1 = 234;
const M2 = 246;
const N = 60;
const SIGMA = 100; // px/√s – колко силно се лутат частиците
const CHANNELS = [50, 100, 150]; // y на белтъците в мембраната
const HALF = 9;

/** Псевдослучайни начални положения – еднакви на сървъра и в браузъра. */
const seed = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const init = () => ({
  x: Array.from({ length: N }, (_, i) => X0 + 6 + seed(i) * (M1 - X0 - 12)),
  y: Array.from({ length: N }, (_, i) => Y0 + 6 + seed(i + 500) * (Y1 - Y0 - 12)),
});
type State = ReturnType<typeof init>;

const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const reflect = (v: number, lo: number, hi: number) => (v < lo ? 2 * lo - v : v > hi ? 2 * hi - v : v);

/** Дифузия през мембрана: кои частици минават през липидите и кои – само през белтъци. */
export default function DiffusionLab() {
  const [substance, setSubstance] = useState<Substance>('o2');
  const [proteins, setProteins] = useState(false);
  const sub = SUBSTANCES[substance];

  const passes = (y: number) => {
    if (Math.random() < sub.lipid) return true;
    return proteins && CHANNELS.some(c => Math.abs(y - c) < HALF) && Math.random() < sub.channel;
  };

  const step = (s: State, dt: number): State => {
    const x = s.x.slice();
    const y = s.y.slice();
    const k = SIGMA * Math.sqrt(dt);
    for (let i = 0; i < N; i++) {
      let nx = x[i] + k * gauss();
      const ny = reflect(y[i] + k * gauss(), Y0 + 4, Y1 - 4);
      if (x[i] < M1 && nx >= M1) nx = passes(ny) ? M2 + (nx - M1) : 2 * M1 - nx;
      else if (x[i] > M2 && nx <= M2) nx = passes(ny) ? M1 - (M2 - nx) : 2 * M2 - nx;
      x[i] = reflect(nx, X0 + 4, X1 - 4);
      y[i] = ny;
    }
    return { x, y };
  };

  const sim = useSimulation(init, step, { dt: 1 / 60 });
  const right = sim.state.x.filter(v => v > M2).length;
  const left = N - right;

  const choose = (s: Substance) => {
    setSubstance(s);
    sim.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 200" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="8" className="fill-sky-50 stroke-gray-300 dark:fill-sky-950/40 dark:stroke-gray-600" strokeWidth="1.5" />
        {/* Липиден двоен слой: две редици глави, опашки помежду им */}
        <rect x={M1} y={Y0} width={M2 - M1} height={Y1 - Y0} fill="#fde68a" />
        {Array.from({ length: 22 }, (_, i) => Y0 + 4 + i * 8).map(y => (
          <g key={y}>
            <circle cx={M1} cy={y} r="3.2" fill="#f59e0b" />
            <circle cx={M2} cy={y} r="3.2" fill="#f59e0b" />
          </g>
        ))}
        {proteins &&
          sub.protein &&
          CHANNELS.map(c => <rect key={c} x={M1 - 5} y={c - HALF} width={M2 - M1 + 10} height={2 * HALF} rx="4" fill="#16a34a" opacity="0.85" />)}
        {sim.state.x.map((x, i) => (
          <circle key={i} cx={x} cy={sim.state.y[i]} r="4" fill={sub.color} stroke="white" strokeWidth="0.8" />
        ))}
        <text x={X0 + 10} y={Y1 - 8} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
          отвън
        </text>
        <text x={X1 - 10} y={Y1 - 8} fontSize="12" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          в клетката
        </text>
      </LabSvg>

      <Buttons>
        {(Object.keys(SUBSTANCES) as Substance[]).map(s => (
          <DiagramButton key={s} active={substance === s} onClick={() => choose(s)}>
            {SUBSTANCES[s].label}
          </DiagramButton>
        ))}
      </Buttons>
      {sub.protein && (
        <Buttons>
          <DiagramButton active={proteins} onClick={() => setProteins(!proteins)}>
            {proteins ? '✓ ' : ''}
            {sub.protein} в мембраната
          </DiagramButton>
        </Buttons>
      )}
      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} time={sim.time} />
      <div className="mt-3">
        <Readout
          items={[
            { label: 'отвън', value: left },
            { label: 'в клетката', value: right },
          ]}
        />
      </div>
      <Note tone="violet">
        {sub.why}
        {right > N * 0.4 && ' Сега частиците минават и в двете посоки почти еднакво често – концентрациите са се изравнили и нетният поток е нула.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всички частици започват отвън. Те се лутат напълно случайно – никоя не „знае“ накъде е по-ниската концентрация. Просто отляво
        има повече частици, които да се ударят в мембраната. Зелено – белтъците в мембраната.
      </p>
    </div>
  );
}
