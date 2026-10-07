import { useState } from 'react';

const W = 640;
const H = 320;
const RAD = 206265; // дъгови секунди в радиан
const MOON = 3.844e8; // m

type Instrument = {
  name: string;
  icon: string;
  band: string;
  lambda: number; // m
  size: number; // m – диаметър или база
  interferometer?: boolean;
  /** Ако реалният предел се различава от дифракционния. */
  actual?: number; // ″
  note: string;
};

const INSTRUMENTS: Instrument[] = [
  {
    name: 'Човешко око',
    icon: '👁️',
    band: 'видима',
    lambda: 550e-9,
    size: 0.007,
    actual: 60,
    note: 'Дифракционният предел на зеницата е ~20″, но клетките на ретината са твърде едри – реално окото различава около 1′.',
  },
  { name: 'Телескопът на Галилей', icon: '🔭', band: 'видима', lambda: 550e-9, size: 0.037, note: 'С него през 1610 г. са открити спътниците на Юпитер и фазите на Венера.' },
  { name: 'FAST (500 m)', icon: '📡', band: 'радио 21 cm', lambda: 0.21, size: 500, note: 'Най-голямата единична антена в света. Радиовълните са милион пъти по-дълги от светлината, затова тя вижда по-размито и от окото!' },
  { name: 'Любителски 20 cm', icon: '🔭', band: 'видима', lambda: 550e-9, size: 0.2, note: 'На Земята атмосферата обикновено ограничава образа до ~1″, така че такъв телескоп рядко използва пълните си възможности.' },
  { name: 'VLA (база 36 km)', icon: '📡', band: 'радио 21 cm', lambda: 0.21, size: 36000, interferometer: true, note: '27 антени в Ню Мексико, свързани в един интерферометър. Разделителната способност се определя от най-голямото разстояние между тях.' },
  { name: 'Хъбъл (2,4 m)', icon: '🛰️', band: 'видима', lambda: 550e-9, size: 2.4, note: 'Без атмосферата образът е ограничен само от дифракцията.' },
  { name: 'Джеймс Уеб (6,5 m)', icon: '🛰️', band: 'инфрачервено 2 µm', lambda: 2e-6, size: 6.5, note: 'По-голямо огледало, но по-дълга вълна – затова е само малко по-остър от Хъбъл.' },
  { name: 'ELT (39 m) + адаптивна оптика', icon: '🏔️', band: 'инфрачервено 1,6 µm', lambda: 1.6e-6, size: 39, note: 'Строи се в Чили. С адаптивна оптика ще вижда около 15 пъти по-остро от Хъбъл.' },
  { name: 'ALMA (база 16 km)', icon: '📡', band: 'субмилиметрови 1 mm', lambda: 1e-3, size: 16000, interferometer: true, note: '66 антени на 5000 m височина в пустинята Атакама.' },
  { name: 'EHT (база ~ Земята)', icon: '🌍', band: 'радио 1,3 mm', lambda: 1.3e-3, size: 1.27e7, interferometer: true, note: 'Радиотелескопи по цялата Земя, синхронизирани с атомни часовници. През 2019 г. показаха първия образ на черна дупка (M87*).' },
];

const OBJECTS: { size: number; label: string }[] = [
  { size: 0.02, label: '🪙 монета' },
  { size: 0.1, label: '🍊 портокал' },
  { size: 0.5, label: '⚽ топка' },
  { size: 4, label: '🚗 кола' },
  { size: 20, label: '🏠 къща' },
  { size: 110, label: '🏟️ футболно игрище' },
  { size: 1000, label: '🏘️ квартал' },
  { size: 10000, label: '🏙️ град' },
  { size: 100000, label: '🌋 голям кратер' },
];

const theta = (i: Instrument) => i.actual ?? ((i.interferometer ? 1 : 1.22) * i.lambda * RAD) / i.size;

function arcsec(v: number) {
  const f = (x: number) => x.toLocaleString('bg-BG', { maximumFractionDigits: x < 10 ? 1 : 0 });
  if (v >= 60) return `${f(v / 60)}′`;
  if (v >= 1) return `${f(v)}″`;
  if (v >= 0.001) return `${f(v * 1000)} mas`;
  return `${f(v * 1e6)} µas`;
}

function length(m: number) {
  const f = (x: number) => x.toLocaleString('bg-BG', { maximumFractionDigits: x < 10 ? 1 : 0 });
  if (m >= 1000) return `${f(m / 1000)} km`;
  if (m >= 1) return `${f(m)} m`;
  return `${f(m * 100)} cm`;
}

// Логаритмична скала: от 3′ до 10 µas
const LOG_MAX = Math.log10(180);
const LOG_MIN = Math.log10(1e-5);
const X0 = 30;
const X1 = W - 30;
const sx = (v: number) => X0 + ((LOG_MAX - Math.log10(v)) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

export default function ResolutionLab() {
  const [index, setIndex] = useState(5);
  const inst = INSTRUMENTS[index];
  const t = theta(inst);
  const onMoon = (t / RAD) * MOON;
  const headlights = 1.5 / (t / RAD);
  const like = [...OBJECTS].reverse().find(o => o.size <= onMoon * 1.5) ?? OBJECTS[0];

  // Скала на дъговите секунди
  const ticks = [60, 1, 0.001, 1e-5].filter(v => v <= 180);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко остро вижда телескопът</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете инструмент. Колкото по-надясно е на скалата, толкова по-малки ъгли различава. Интерферометрите комбинират антени на
        хиляди километри една от друга.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <text x={X0} y={24} fontSize="11" fill="white" fillOpacity="0.6">
          ← по-размито
        </text>
        <text x={X1} y={24} fontSize="11" textAnchor="end" fill="white" fillOpacity="0.6">
          по-остро →
        </text>
        <line x1={X0} x2={X1} y1={44} y2={44} stroke="white" strokeOpacity="0.4" />
        {ticks.map(v => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={40} y2={48} stroke="white" strokeOpacity="0.6" />
            <text x={sx(v)} y={62} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {v === 60 ? '1′' : v === 1 ? '1″' : v === 0.001 ? '1 mas' : '10 µas'}
            </text>
          </g>
        ))}
        {/* Атмосферната граница */}
        <rect x={sx(1)} y={70} width={sx(0.3) - sx(1)} height={INSTRUMENTS.length * 21 + 4} fill="#f59e0b" fillOpacity="0.08" />
        <text x={sx(0.55)} y={70 + INSTRUMENTS.length * 21 + 18} fontSize="10" textAnchor="middle" fill="#fbbf24" fillOpacity="0.8">
          атмосфера (seeing)
        </text>

        {INSTRUMENTS.map((ins, i) => {
          const y = 76 + i * 21;
          const x = sx(theta(ins));
          const active = i === index;
          return (
            <g key={ins.name} onClick={() => setIndex(i)} className="cursor-pointer">
              <rect x={X0} y={y - 2} width={X1 - X0} height={19} fill="white" fillOpacity={active ? 0.08 : 0} rx="3" />
              <line x1={X0} x2={x} y1={y + 8} y2={y + 8} stroke={ins.interferometer ? '#c084fc' : '#38bdf8'} strokeOpacity={active ? 0.9 : 0.35} strokeWidth={active ? 4 : 3} />
              <circle cx={x} cy={y + 8} r={active ? 6 : 4} fill={ins.interferometer ? '#c084fc' : '#38bdf8'} />
              <text x={x < W / 2 ? x + 10 : x - 10} y={y + 12} fontSize="11" textAnchor={x < W / 2 ? 'start' : 'end'} fill="white" fillOpacity={active ? 1 : 0.7}>
                {ins.icon} {ins.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-1 mt-3">
        {INSTRUMENTS.map((ins, i) => (
          <button
            key={ins.name}
            onClick={() => setIndex(i)}
            className={`px-2 py-0.5 rounded text-xs border ${
              i === index
                ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {ins.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: inst.interferometer ? 'θ ≈ λ / B' : 'θ = 1,22 λ / D', value: arcsec(t) },
          { label: 'Дължина на вълната', value: inst.band },
          { label: 'Най-малкият детайл на Луната', value: length(onMoon) },
          { label: 'Различава два фара на кола до', value: length(headlights) },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <strong>
          {inst.icon} {inst.name}:
        </strong>{' '}
        {inst.note} На Луната би различил детайли с размер на {like.label}.
      </p>
    </div>
  );
}
