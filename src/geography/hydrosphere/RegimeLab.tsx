import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
const MONTHS_LONG = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

type River = {
  id: string;
  name: string;
  /** Среден годишен отток, m³/s (закръглен), и водосборна площ, km² – където са известни достатъчно надеждно. */
  q?: number;
  area?: number;
  /** Относителен месечен отток – стилизиран, закръглен ход; нормираме го към средното. */
  monthly: number[];
  feed: string;
  note: string;
};

const RIVERS: River[] = [
  {
    id: 'iskar',
    name: 'Искър',
    q: 55,
    area: 8646,
    monthly: [0.8, 1, 1.4, 1.9, 1.8, 1.2, 0.7, 0.45, 0.4, 0.5, 0.75, 0.9],
    feed: 'снежно-дъждовно',
    note: 'Пълноводие напролет, когато снегът в Рила и Стара планина се топи и вали много; маловодие в края на лятото.',
  },
  {
    id: 'kamchia',
    name: 'Камчия',
    monthly: [1.5, 1.9, 1.9, 1.4, 1, 0.7, 0.45, 0.3, 0.3, 0.45, 0.8, 1.3],
    feed: 'дъждовно-снежно',
    note: 'Басейнът е нисък, снегът е малко и се топи рано – пълноводието е през зимата и в началото на пролетта.',
  },
  {
    id: 'danube',
    name: 'Дунав',
    q: 6500,
    area: 817000,
    monthly: [0.85, 0.95, 1.2, 1.4, 1.35, 1.2, 1, 0.8, 0.7, 0.7, 0.85, 0.95],
    feed: 'смесено',
    note: 'Голям басейн с притоци от Алпите, Карпатите и равнините: пиковете на различните притоци се разминават и режимът е сравнително изравнен.',
  },
  {
    id: 'rhone',
    name: 'Рона (Алпите)',
    q: 180,
    area: 5200,
    monthly: [0.35, 0.33, 0.4, 0.6, 1.2, 1.9, 2.1, 1.9, 1.3, 0.8, 0.55, 0.45],
    feed: 'ледниково-снежно',
    note: 'Горното течение над Женевското езеро: най-много вода има в най-топлите месеци, когато се топят снегът и ледниците.',
  },
  {
    id: 'volga',
    name: 'Волга',
    q: 8000,
    area: 1360000,
    monthly: [0.5, 0.45, 0.5, 1.6, 3.4, 1.5, 0.8, 0.6, 0.6, 0.7, 0.7, 0.6],
    feed: 'снежно',
    note: 'Естественият режим (преди язовирите): за няколко седмици през май се топи снегът от цялата Руска равнина, а през зимата реката е под лед.',
  },
  {
    id: 'amazon',
    name: 'Амазонка',
    q: 209000,
    area: 6100000,
    monthly: [1, 1.12, 1.22, 1.3, 1.33, 1.28, 1.1, 0.88, 0.68, 0.6, 0.66, 0.8],
    feed: 'дъждовно',
    note: 'Вали през цялата година, а притоците от двете страни на екватора се пълнят в различни сезони – реката винаги е огромна.',
  },
  {
    id: 'nile',
    name: 'Нил (Асуан)',
    q: 2700,
    area: 3000000,
    monthly: [0.45, 0.35, 0.3, 0.28, 0.28, 0.35, 0.9, 2.6, 3, 1.6, 0.8, 0.55],
    feed: 'дъждовно (мусонно)',
    note: 'Естественият режим преди Асуанския язовир: пълноводието през август–септември идва от летните мусонни дъждове в Етиопските планини.',
  },
];

/** Режим на реките: кога в годината реката е пълноводна и кога маловодна. */
export default function RegimeLab() {
  const [id, setId] = useState('iskar');
  const river = RIVERS.find(r => r.id === id)!;
  const mean = river.monthly.reduce((s, v) => s + v, 0) / 12;
  const rel = river.monthly.map(v => v / mean);
  const iMax = rel.indexOf(Math.max(...rel));
  const iMin = rel.indexOf(Math.min(...rel));
  const runoffMm = river.q && river.area ? (river.q * 31.536e6) / (river.area * 1e3) : null;
  const modulus = river.q && river.area ? (1000 * river.q) / river.area : null;

  const X0 = 52;
  const BW = 46;
  const Y0 = 250;
  const H = 210;
  const top = Math.max(3, Math.ceil(Math.max(...rel) * 2) / 2);
  const sy = (v: number) => Y0 - (v / top) * H;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += top > 2 ? 1 : 0.5) ticks.push(v);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {RIVERS.map(r => (
          <button
            key={r.id}
            onClick={() => setId(r.id)}
            className={`px-3 py-1.5 rounded-full text-sm border ${id === r.id ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {r.name}
          </button>
        ))}
      </div>
      <LabSvg viewBox="0 0 640 280" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {ticks.map(v => (
          <g key={v}>
            <line x1={X0} y1={sy(v)} x2={X0 + 12 * BW} y2={sy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={sy(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(v * 100)} %
            </text>
          </g>
        ))}
        {rel.map((v, m) => (
          <g key={m}>
            <rect
              x={X0 + m * BW + 5}
              y={sy(v)}
              width={BW - 10}
              height={Y0 - sy(v)}
              rx={3}
              className={
                m === iMax ? 'fill-blue-600 dark:fill-blue-500' : m === iMin ? 'fill-amber-500 dark:fill-amber-500' : 'fill-sky-400/80 dark:fill-sky-600/80'
              }
            />
            <text x={X0 + m * BW + BW / 2} y={Y0 + 14} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {MONTHS[m]}
            </text>
          </g>
        ))}
        <line x1={X0} y1={sy(1)} x2={X0 + 12 * BW} y2={sy(1)} className="stroke-rose-600" strokeWidth="1.8" strokeDasharray="6 4" />
        <text x={X0 + 12 * BW} y={sy(1) - 5} fontSize="10" textAnchor="end" className="fill-rose-700 dark:fill-rose-300">
          средногодишен отток
        </text>
        <line x1={X0} y1={Y0} x2={X0 + 12 * BW} y2={Y0} className="stroke-gray-500" />
        <text x={X0 + 6} y={16} fontSize="12" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
          {river.name}: подхранване {river.feed}
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Месечният отток в проценти от средногодишния. Ходът е стилизиран и закръглен по многогодишни данни – служи за сравнение на типовете, не за точни
        стойности.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'пълноводие', value: MONTHS_LONG[iMax], tone: 'blue' },
            { label: 'маловодие', value: MONTHS_LONG[iMin], tone: 'amber' },
            {
              label: 'макс. : мин.',
              value: `${fmt(rel[iMax] / rel[iMin], 1)} : 1`,
            },
            { label: 'Q', value: river.q ? `≈ ${fmt(river.q)} m³/s` : '–' },
            {
              label: 'отточен слой',
              value: runoffMm ? `≈ ${fmt(runoffMm)} mm` : '–',
              tone: 'emerald',
            },
            {
              label: 'отточен модул',
              value: modulus ? `≈ ${fmt(modulus, 1)} l/s·km²` : '–',
              tone: 'violet',
            },
          ]}
        />
      </div>
      <Note tone="blue">{river.note}</Note>
    </div>
  );
}
