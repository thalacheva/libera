import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import LabSvg from '~/LabSvg';

// Температури на кипене при нормално налягане, °C (закръглени; справочни стойности)
type Point = { name: string; bp: number };
type Series = { label: string; color: string; points: Point[]; expected?: number };
type Dataset = { id: string; title: string; x: string[]; y: [number, number]; series: Series[]; note: string };

const DATASETS: Dataset[] = [
  {
    id: 'hydrides',
    title: 'водородни съединения',
    x: ['2. период', '3. период', '4. период', '5. период'],
    y: [-180, 120],
    // expected – грубо очакване за 2. период по хода на 3. и 4. период (без водородни връзки)
    series: [
      { label: 'група 14', color: '#64748b', points: [{ name: 'CH₄', bp: -161.5 }, { name: 'SiH₄', bp: -112 }, { name: 'GeH₄', bp: -88 }, { name: 'SnH₄', bp: -52 }] },
      { label: 'група 15', color: '#2563eb', points: [{ name: 'NH₃', bp: -33.3 }, { name: 'PH₃', bp: -87.7 }, { name: 'AsH₃', bp: -62.5 }, { name: 'SbH₃', bp: -17 }], expected: -112.9 },
      { label: 'група 16', color: '#dc2626', points: [{ name: 'H₂O', bp: 100 }, { name: 'H₂S', bp: -60.3 }, { name: 'H₂Se', bp: -41.3 }, { name: 'H₂Te', bp: -2 }], expected: -79.3 },
      { label: 'група 17', color: '#16a34a', points: [{ name: 'HF', bp: 19.5 }, { name: 'HCl', bp: -85.1 }, { name: 'HBr', bp: -66.8 }, { name: 'HI', bp: -35.4 }], expected: -103.4 },
    ],
    note: 'Надолу в групата молекулите стават по-големи и лондонските сили растат. NH₃, H₂O и HF „излизат“ от реда – между молекулите им има водородни връзки. Метанът няма такива и следва хода на групата.',
  },
  {
    id: 'noble',
    title: 'благородни газове',
    x: ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'],
    y: [-280, 0],
    series: [
      {
        label: 'благородни газове',
        color: '#0891b2',
        points: [
          { name: 'He', bp: -268.9 },
          { name: 'Ne', bp: -246 },
          { name: 'Ar', bp: -185.8 },
          { name: 'Kr', bp: -153.4 },
          { name: 'Xe', bp: -108.1 },
          { name: 'Rn', bp: -61.7 },
        ],
      },
    ],
    note: 'Атомите на благородните газове се привличат само с лондонски сили. По-големите атоми имат повече електрони, облакът им се поляризира по-лесно и привличането е по-силно.',
  },
  {
    id: 'halogens',
    title: 'халогени',
    x: ['F₂', 'Cl₂', 'Br₂', 'I₂'],
    y: [-200, 200],
    series: [
      {
        label: 'халогени',
        color: '#9333ea',
        points: [
          { name: 'F₂', bp: -188.1 },
          { name: 'Cl₂', bp: -34 },
          { name: 'Br₂', bp: 58.8 },
          { name: 'I₂', bp: 184.3 },
        ],
      },
    ],
    note: 'При стайна температура флуорът и хлорът са газове, бромът – течност, а йодът – твърдо вещество. Молекулите са неполярни – разликата идва само от лондонските сили.',
  },
  {
    id: 'alkanes',
    title: 'алкани',
    x: ['C₁', 'C₂', 'C₃', 'C₄', 'C₅', 'C₆', 'C₇', 'C₈'],
    y: [-180, 140],
    series: [
      {
        label: 'алкани CₙH₂ₙ₊₂',
        color: '#ea580c',
        points: [
          { name: 'метан', bp: -161.5 },
          { name: 'етан', bp: -88.6 },
          { name: 'пропан', bp: -42.1 },
          { name: 'бутан', bp: -0.5 },
          { name: 'пентан', bp: 36.1 },
          { name: 'хексан', bp: 68.7 },
          { name: 'хептан', bp: 98.4 },
          { name: 'октан', bp: 125.6 },
        ],
      },
    ],
    note: 'Всеки следващ алкан има една група CH₂ повече. По-дългата верига означава по-голяма повърхност на допир между молекулите и по-силни лондонски сили. Пропанът и бутанът в бутилките за газ са втечнени под налягане.',
  },
];

const L = 62;
const R = 462;
const TOP = 18;
const BOTTOM = 232;
const fmt = (v: number) => String(v).replace('.', ',').replace('-', '−');

/** Температури на кипене: лондонски сили и водородни връзки. */
export default function BoilingPointLab() {
  const [di, setDi] = useState(0);
  const [expected, setExpected] = useState(false);
  const [sel, setSel] = useState<{ s: number; p: number } | null>({ s: 2, p: 0 });
  const d = DATASETS[di];

  const xAt = (i: number) => L + 30 + (i * (R - L - 60)) / (d.x.length - 1);
  const yAt = (t: number) => BOTTOM - ((t - d.y[0]) * (BOTTOM - TOP)) / (d.y[1] - d.y[0]);
  const step = d.y[1] - d.y[0] > 300 ? 50 : 40;
  const ticks: number[] = [];
  for (let t = Math.ceil(d.y[0] / step) * step; t <= d.y[1]; t += step) ticks.push(t);

  const choose = (i: number) => {
    setDi(i);
    setSel(i === 0 ? { s: 2, p: 0 } : null);
  };
  const picked = sel && d.series[sel.s]?.points[sel.p];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {DATASETS.map((x, i) => (
          <DiagramButton key={x.id} active={i === di} onClick={() => choose(i)}>
            {x.title}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 284" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        {ticks.map(t => (
          <g key={t}>
            <line x1={L} x2={R} y1={yAt(t)} y2={yAt(t)} className={t === 0 ? 'stroke-gray-400 dark:stroke-gray-500' : 'stroke-gray-100 dark:stroke-gray-700/60'} />
            <text x={L - 6} y={yAt(t) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={8} y={12} fontSize="11" fill="currentColor">
          t, °C
        </text>
        {/* Стайна температура */}
        {25 > d.y[0] && 25 < d.y[1] && (
          <g>
            <line x1={L} x2={R} y1={yAt(25)} y2={yAt(25)} className="stroke-amber-500" strokeDasharray="6 4" />
            <text x={R} y={yAt(25) - 4} fontSize="11" textAnchor="end" className="fill-amber-600 dark:fill-amber-400">
              стайна температура
            </text>
          </g>
        )}
        {d.x.map((label, i) => (
          <text key={label} x={xAt(i)} y={BOTTOM + 18} fontSize="12" textAnchor="middle" fill="currentColor">
            {label}
          </text>
        ))}

        {d.series.map((s, si) => (
          <g key={s.label}>
            {expected && s.expected !== undefined && (
              <g>
                <line x1={xAt(0)} y1={yAt(s.expected)} x2={xAt(1)} y2={yAt(s.points[1].bp)} stroke={s.color} strokeWidth="2" strokeDasharray="5 4" />
                <circle cx={xAt(0)} cy={yAt(s.expected)} r={5} fill="white" stroke={s.color} strokeWidth="2" />
              </g>
            )}
            <polyline points={s.points.map((p, i) => `${xAt(i)},${yAt(p.bp)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.5" />
            {s.points.map((p, i) => (
              <g key={p.name} style={{ cursor: 'pointer' }} onClick={() => setSel({ s: si, p: i })}>
                <circle cx={xAt(i)} cy={yAt(p.bp)} r={sel?.s === si && sel.p === i ? 8 : 6} fill={s.color} className="stroke-white dark:stroke-gray-800" strokeWidth="2" />
                {(d.series.length === 1 || i === 0) && (
                  <text x={xAt(i) + 9} y={yAt(p.bp) - 7} fontSize="11" fill={s.color} fontWeight="600">
                    {p.name}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
        {d.series.length > 1 &&
          d.series.map((s, si) => (
            <text key={s.label} x={L + 8 + si * 100} y={BOTTOM + 42} fontSize="12" fill={s.color} fontWeight="600">
              ● {s.label}
            </text>
          ))}
      </LabSvg>

      {di === 0 && (
        <Buttons>
          <DiagramButton active={expected} onClick={() => setExpected(!expected)}>
            {expected ? 'скрий' : 'покажи'} очакването без водородни връзки
          </DiagramButton>
        </Buttons>
      )}
      <div className="mt-3">
        <Readout items={picked ? [{ label: `${picked.name}:`, value: `${fmt(picked.bp)} °C`, tone: 'rose' }] : [{ label: '', value: 'докосни точка, за да видиш стойността' }]} />
      </div>
      {di === 0 && expected && (
        <Note tone="violet">
          Ако продължим хода на 3. и 4. период, водата би трябвало да кипи около −80 °C, т.е. при стайна температура да е газ. Водородните
          връзки я държат течна – разлика от около 180 °C.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">💡 {d.note}</p>
    </div>
  );
}
