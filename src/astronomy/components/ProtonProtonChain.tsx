import { useState } from 'react';

const W = 640;
const H = 270;
const COLS = [70, 230, 400, 560];
const ROWS = [60, 135, 210];
const NUC = 8; // радиус на нуклон

const STEPS = [
  {
    title: 'Начало',
    reaction: '6 протона (ядра на водорода)',
    energy: 0,
    time: '',
    text: 'В ядрото на Слънцето при 15 милиона K протоните се движат средно с ~600 km/s. Все пак електричното отблъскване е огромно – сливат се само благодарение на квантовия тунелен ефект.',
  },
  {
    title: 'Стъпка 1',
    reaction: '¹H + ¹H → ²H + e⁺ + νₑ (два пъти)',
    energy: 2 * 1.44,
    time: 'средно ~10 милиарда години за един протон',
    text: 'Два протона се сливат, а единият се превръща в неутрон, като излъчва позитрон и неутрино. Получава се деутерий (тежък водород). Това е бавна слаба реакция – тя ограничава скоростта на цялата верига и затова Слънцето „гори“ милиарди години, а не избухва. Позитронът веднага анихилира с електрон.',
  },
  {
    title: 'Стъпка 2',
    reaction: '²H + ¹H → ³He + γ (два пъти)',
    energy: 2 * 5.49,
    time: '~1 секунда',
    text: 'Деутерият почти веднага улавя още един протон и се получава лек хелий-3. Излъчва се гама фотон.',
  },
  {
    title: 'Стъпка 3',
    reaction: '³He + ³He → ⁴He + 2 ¹H',
    energy: 12.86,
    time: '~1 милион години',
    text: 'Две ядра хелий-3 се сливат в обикновен хелий-4, а два протона се освобождават обратно. Общо: 4 протона са станали едно ядро хелий.',
  },
];

function Nucleus({ x, y, p, n, opacity = 1 }: { x: number; y: number; p: number; n: number; opacity?: number }) {
  // Подреждаме нуклоните в малък „куп“
  const spots = [
    [0, 0],
    [1.6, 0.4],
    [0.5, 1.6],
    [1.9, 1.9],
  ];
  const kinds = [...Array(p).fill('p'), ...Array(n).fill('n')];
  // Редуваме протони и неутрони, за да изглежда като ядро
  const order = kinds.length === 4 ? ['p', 'n', 'n', 'p'] : kinds.length === 3 ? ['p', 'n', 'p'] : kinds;
  const cx = x - ((order.length > 1 ? 1.6 : 0) * NUC) / 2;
  const cy = y - ((order.length > 2 ? 1.6 : 0) * NUC) / 2;
  return (
    <g opacity={opacity}>
      {order.map((k, i) => (
        <circle
          key={i}
          cx={cx + spots[i][0] * NUC}
          cy={cy + spots[i][1] * NUC}
          r={NUC}
          fill={k === 'p' ? '#ef4444' : '#94a3b8'}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      ))}
    </g>
  );
}

const Label = ({ x, y, children, color = 'white' }: { x: number; y: number; children: React.ReactNode; color?: string }) => (
  <text x={x} y={y} fontSize="11" textAnchor="middle" fill={color}>
    {children}
  </text>
);

function Gamma({ x, y }: { x: number; y: number }) {
  const pts = Array.from({ length: 25 }, (_, i) => `${x + i * 1.6},${y + 4 * Math.sin(i * 0.9)}`).join(' ');
  return (
    <g>
      <polyline points={pts} fill="none" stroke="#fde047" strokeWidth="2" />
      <text x={x + 44} y={y + 4} fontSize="12" fill="#fde047">
        γ
      </text>
    </g>
  );
}

export default function ProtonProtonChain() {
  const [step, setStep] = useState(0);
  const total = STEPS.slice(1, step + 1).reduce((s, x) => s + x.energy, 0);
  const current = STEPS[step];
  const shown = (i: number) => (i <= step ? (i === step ? 1 : 0.35) : 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Протон-протонната верига</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Проследете стъпка по стъпка как четири ядра на водорода стават едно ядро на хелия.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {COLS.map((x, i) => (
          <text key={i} x={x} y={22} fontSize="12" fontWeight="600" textAnchor="middle" fill="white" opacity={i <= step ? 1 : 0.25}>
            {STEPS[i].title}
          </text>
        ))}
        {[0, 1, 2].map(i => (
          <text key={i} x={(COLS[i] + COLS[i + 1]) / 2} y={140} fontSize="22" textAnchor="middle" fill="white" opacity={i < step ? 0.6 : 0.15}>
            →
          </text>
        ))}

        {/* Начало: две двойки протони и два единични */}
        <g opacity={shown(0)}>
          <Nucleus x={COLS[0] - 12} y={ROWS[0]} p={1} n={0} />
          <Nucleus x={COLS[0] + 12} y={ROWS[0]} p={1} n={0} />
          <Nucleus x={COLS[0] - 12} y={ROWS[2]} p={1} n={0} />
          <Nucleus x={COLS[0] + 12} y={ROWS[2]} p={1} n={0} />
          <Nucleus x={COLS[0] - 12} y={ROWS[1]} p={1} n={0} />
          <Nucleus x={COLS[0] + 12} y={ROWS[1]} p={1} n={0} />
        </g>

        {/* Стъпка 1: два деутерия + позитрони и неутрино */}
        <g opacity={shown(1)}>
          {[ROWS[0], ROWS[2]].map(y => (
            <g key={y}>
              <Nucleus x={COLS[1] - 20} y={y} p={1} n={1} />
              <Label x={COLS[1] - 20} y={y + 30}>
                ²H
              </Label>
              <circle cx={COLS[1] + 22} cy={y - 10} r={5} fill="#38bdf8" />
              <text x={COLS[1] + 32} y={y - 6} fontSize="11" fill="#38bdf8">
                e⁺
              </text>
              <text x={COLS[1] + 22} y={y + 14} fontSize="13" fill="#4ade80" textAnchor="middle">
                ν
              </text>
            </g>
          ))}
          <Nucleus x={COLS[1] - 20} y={ROWS[1]} p={1} n={0} />
          <Nucleus x={COLS[1] + 4} y={ROWS[1]} p={1} n={0} />
        </g>

        {/* Стъпка 2: два хелий-3 + гама */}
        <g opacity={shown(2)}>
          {[ROWS[0] + 20, ROWS[2] - 20].map(y => (
            <g key={y}>
              <Nucleus x={COLS[2] - 22} y={y} p={2} n={1} />
              <Label x={COLS[2] - 22} y={y + 32}>
                ³He
              </Label>
              <Gamma x={COLS[2] + 2} y={y} />
            </g>
          ))}
        </g>

        {/* Стъпка 3: хелий-4 + два протона */}
        <g opacity={shown(3)}>
          <Nucleus x={COLS[3] - 10} y={ROWS[1]} p={2} n={2} />
          <Label x={COLS[3] - 10} y={ROWS[1] + 36}>
            ⁴He
          </Label>
          <Nucleus x={COLS[3] + 34} y={ROWS[0] + 10} p={1} n={0} />
          <Nucleus x={COLS[3] + 34} y={ROWS[2] - 10} p={1} n={0} />
          <Label x={COLS[3] + 34} y={ROWS[0] - 8} color="#fca5a5">
            p обратно
          </Label>
        </g>

        <g transform={`translate(14 ${H - 14})`}>
          <circle cx={0} cy={-4} r={5} fill="#ef4444" />
          <text x={9} y={0} fontSize="10" fill="white" fillOpacity="0.7">
            протон
          </text>
          <circle cx={62} cy={-4} r={5} fill="#94a3b8" />
          <text x={71} y={0} fontSize="10" fill="white" fillOpacity="0.7">
            неутрон
          </text>
          <circle cx={130} cy={-4} r={4} fill="#38bdf8" />
          <text x={138} y={0} fontSize="10" fill="white" fillOpacity="0.7">
            позитрон
          </text>
          <text x={198} y={0} fontSize="12" fill="#4ade80">
            ν
          </text>
          <text x={208} y={0} fontSize="10" fill="white" fillOpacity="0.7">
            неутрино
          </text>
          <text x={268} y={0} fontSize="12" fill="#fde047">
            γ
          </text>
          <text x={278} y={0} fontSize="10" fill="white" fillOpacity="0.7">
            гама фотон
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setStep(Math.min(3, step + 1))}
          disabled={step === 3}
          className="px-3 py-1 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
        >
          Следваща стъпка →
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Отначало
        </button>
      </div>

      <div className="mt-3 p-3 bg-gray-100/70 dark:bg-gray-900/40 rounded-lg text-sm">
        <p className="font-mono font-semibold">{current.reaction}</p>
        {current.time && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Време: {current.time}</p>}
        <p className="mt-2 text-gray-700 dark:text-gray-300">{current.text}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-center text-sm">
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Отделена енергия досега</div>
          <div className="font-mono font-bold">{total.toFixed(2).replace('.', ',')} MeV</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Маса на 4 атома ¹H</div>
          <div className="font-mono font-bold">4,03130 u</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">Маса на 1 атом ⁴He</div>
          <div className="font-mono font-bold">4,00260 u</div>
        </div>
      </div>
      {step === 3 && (
        <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-400">
          Липсват Δm = 0,0287 u – 0,7% от масата. По E = Δm·c² те са станали 26,7 MeV енергия. Около 2% от нея отнасят неутриното, които
          напускат Слънцето директно.
        </p>
      )}
    </div>
  );
}
