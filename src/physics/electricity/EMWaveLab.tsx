import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { sig, useSimulation } from '~/physics/sim';

const C = 2.998e8;
const LG_MIN = 4;
const LG_MAX = 21;

// Границите между областите са условни (особено между рентгенови и гама лъчи)
const BANDS = [
  { name: 'радиовълни', short: 'радио', from: LG_MIN, to: Math.log10(3e8), fill: '#94a3b8' },
  { name: 'микровълни', short: 'микро', from: Math.log10(3e8), to: Math.log10(3e11), fill: '#a78bfa' },
  { name: 'инфрачервени лъчи', short: 'ИЧ', from: Math.log10(3e11), to: Math.log10(4.3e14), fill: '#f87171' },
  { name: 'видима светлина', short: '', from: Math.log10(4.3e14), to: Math.log10(7.5e14), fill: 'url(#rainbow)' },
  { name: 'ултравиолетови лъчи', short: 'УВ', from: Math.log10(7.5e14), to: Math.log10(3e16), fill: '#c084fc' },
  { name: 'рентгенови лъчи', short: 'рентген', from: Math.log10(3e16), to: Math.log10(3e19), fill: '#60a5fa' },
  { name: 'гама лъчи', short: 'гама', from: Math.log10(3e19), to: LG_MAX, fill: '#34d399' },
];

// Примери от ежедневието (честоти в Hz, приблизително)
const EXAMPLES: [number, string][] = [
  [5e4, 'дълговълнови сигнали за точно време'],
  [1e6, 'средновълново (AM) радио'],
  [1e8, 'УКВ (FM) радио'],
  [9e8, 'мобилни мрежи'],
  [2.45e9, 'Wi-Fi 2,4 GHz и микровълнова фурна'],
  [5e9, 'Wi-Fi 5 GHz'],
  [1e10, 'радар'],
  [3e13, 'топлинно излъчване на човешкото тяло'],
  [3.2e14, 'дистанционно управление'],
  [5.45e14, 'зелена светлина'],
  [1e15, 'слънчев загар (UV-B)'],
  [3e18, 'рентгенова снимка'],
  [1e20, 'радиоактивен разпад'],
];

// Неща с размер, близък до дължината на вълната (m)
const SIZES: [number, string][] = [
  [1e4, 'град'],
  [1e3, 'голям мост'],
  [100, 'футболно игрище'],
  [10, 'автобус'],
  [1, 'човек'],
  [0.1, 'длан'],
  [0.01, 'монета'],
  [1e-3, 'зрънце пясък'],
  [1e-4, 'дебелината на косъм'],
  [1e-5, 'клетка'],
  [1e-6, 'бактерия'],
  [1e-7, 'вирус'],
  [1e-9, 'молекула'],
  [1e-10, 'атом'],
  [1e-14, 'атомно ядро'],
];

const nearest = <T,>(list: [number, T][], v: number) =>
  list.reduce((best, cur) => (Math.abs(Math.log10(cur[0] / v)) < Math.abs(Math.log10(best[0] / v)) ? cur : best));

const SX = (lg: number) => 20 + ((lg - LG_MIN) / (LG_MAX - LG_MIN)) * 440;

/** Електромагнитна вълна: E и B трептят перпендикулярно едно на друго и на посоката; целият спектър. */
export default function EMWaveLab() {
  const [lgf, setLgf] = useState(8);
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 240 });

  const f = 10 ** lgf;
  const lambda = C / f;
  const band = BANDS.find(b => lgf >= b.from && lgf < b.to) ?? BANDS[BANDS.length - 1];
  const example = nearest(EXAMPLES, f);
  const size = nearest(SIZES, lambda);

  // Вълната на екрана: една дължина на вълната е 150 px, фазата тече с времето
  const X0 = 40;
  const X1 = 440;
  const AXIS_Y = 96;
  const phase = sim.state.t * 2 * Math.PI * 0.6;
  const pts = Array.from({ length: 161 }, (_, k) => {
    const x = X0 + (k / 160) * (X1 - X0);
    return { x, a: Math.sin(((x - X0) / 150) * 2 * Math.PI - phase) };
  });
  // E – вертикално, B – „хоризонтално“ в наклонена перспектива
  const ePath = pts.map((p, k) => `${k ? 'L' : 'M'} ${p.x.toFixed(1)} ${(AXIS_Y - 52 * p.a).toFixed(1)}`).join(' ');
  const bPath = pts.map((p, k) => `${k ? 'L' : 'M'} ${(p.x - 26 * p.a).toFixed(1)} ${(AXIS_Y + 18 * p.a).toFixed(1)}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 236">
        <defs>
          <linearGradient id="rainbow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ef4444" />
            <stop offset="0.25" stopColor="#f59e0b" />
            <stop offset="0.5" stopColor="#22c55e" />
            <stop offset="0.75" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Вълната */}
        {pts
          .filter((_, k) => k % 8 === 0)
          .map(p => (
            <g key={p.x}>
              <line x1={p.x} y1={AXIS_Y} x2={p.x} y2={AXIS_Y - 52 * p.a} className="stroke-rose-300 dark:stroke-rose-800" />
              <line x1={p.x} y1={AXIS_Y} x2={p.x - 26 * p.a} y2={AXIS_Y + 18 * p.a} className="stroke-sky-300 dark:stroke-sky-800" />
            </g>
          ))}
        <line x1={X0 - 10} y1={AXIS_Y} x2={X1 + 18} y2={AXIS_Y} className="stroke-gray-500" strokeWidth="1.5" />
        <path d={`M ${X1 + 24} ${AXIS_Y} l -9 -4.5 v 9 z`} className="fill-gray-500" />
        <path d={ePath} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
        <path d={bPath} fill="none" className="stroke-sky-500" strokeWidth="2.5" />
        <Label p={{ x: X0 - 14, y: AXIS_Y - 44 }} size={14} tone="rose">
          E
        </Label>
        <Label p={{ x: X0 - 14, y: AXIS_Y + 30 }} size={14} tone="blue">
          B
        </Label>
        <Label p={{ x: X1 + 24, y: AXIS_Y + 16 }} size={13} anchor="end">
          c
        </Label>
        <line x1={X0 + 75} y1={AXIS_Y + 58} x2={X0 + 225} y2={AXIS_Y + 58} className="stroke-gray-500" />
        <line x1={X0 + 75} y1={AXIS_Y + 53} x2={X0 + 75} y2={AXIS_Y + 63} className="stroke-gray-500" />
        <line x1={X0 + 225} y1={AXIS_Y + 53} x2={X0 + 225} y2={AXIS_Y + 63} className="stroke-gray-500" />
        <Label p={{ x: X0 + 150, y: AXIS_Y + 70 }} size={12}>
          {`λ = ${sig(lambda, 3)} m`}
        </Label>

        {/* Спектърът */}
        {BANDS.map(b => (
          <rect key={b.name} x={SX(b.from)} y={188} width={SX(b.to) - SX(b.from)} height={16} fill={b.fill} opacity={b === band ? 1 : 0.55} />
        ))}
        {BANDS.filter(b => b.short).map(b => (
          <Label key={b.name} p={{ x: (SX(b.from) + SX(b.to)) / 2, y: 218 }} size={10} weight={b === band ? 700 : 500}>
            {b.short}
          </Label>
        ))}
        <Label p={{ x: SX(14.75), y: 230 }} size={10} weight={band.short === '' ? 700 : 500}>
          видима
        </Label>
        <path d={`M ${SX(lgf)} 186 l -6 -9 h 12 z`} className="fill-gray-800 dark:fill-gray-100" />
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="lg f" value={lgf} onChange={setLgf} min={LG_MIN} max={LG_MAX - 0.05} step={0.05} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'f =', value: `${sig(f, 3)} Hz`, tone: 'violet' },
            { label: 'λ = c/f =', value: `${sig(lambda, 3)} m`, tone: 'blue' },
            { label: 'област:', value: band.name },
          ]}
        />
      </div>
      <Note tone="gray">{`Около тази честота: ${example[1]}. Дължината на вълната е колкото ${size[1]}.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червената крива е електричното поле E, синята – магнитното B (нарисувано в перспектива, в хоризонталната равнина). Те трептят
        заедно, перпендикулярно едно на друго и на посоката на движение. Плъзгачът е по логаритмична скала: +1 значи 10 пъти по-висока
        честота. Всички вълни от спектъра се движат във вакуум с една и съща скорост c ≈ 3 · 10⁸ m/s; на екрана вълната е показана силно
        забавена и в един и същ мащаб. Границите между областите са условни.
      </p>
    </div>
  );
}
