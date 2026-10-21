import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Model = 'semi' | 'cons' | 'disp';

const MODELS: { id: Model; name: string; note: string }[] = [
  {
    id: 'semi',
    name: 'полуконсервативна',
    note: 'Всяка нова молекула има една стара (¹⁵N) и една нова (¹⁴N) верига. След 1 поколение всичката ДНК е хибридна; след това хибридните молекули остават 2, а леките стават все повече. Точно това виждат Мезелсон и Стал.',
  },
  {
    id: 'cons',
    name: 'консервативна',
    note: 'Старата двойна спирала остава цяла, а новата е изцяло от ¹⁴N. Още след 1 поколение би имало две ивици – тежка и лека – и никаква хибридна. Опитът го отхвърля.',
  },
  {
    id: 'disp',
    name: 'дисперсна',
    note: 'Всяка верига е „кърпена“ от стари и нови парчета. Би имало една ивица, която с всяко поколение се качва постепенно към леката. След 1 поколение изглежда като полуконсервативната – разликата се вижда чак след 2 поколения или при денатурация.',
  },
];

const HEAVY = '#1d4ed8';
const LIGHT = '#f59e0b';

/** Дели на ивици за поколение g: [позиция по плътност (0 – лека, 1 – тежка), дял]. */
function bands(model: Model, g: number, single: boolean): [number, number][] {
  const h = 0.5 ** g;
  if (single) {
    if (model === 'disp') return [[h, 1]];
    return [
      [1, h],
      [0, 1 - h],
    ];
  }
  if (g === 0) return [[1, 1]];
  if (model === 'semi') return [
    [0.5, 2 * h],
    [0, 1 - 2 * h],
  ];
  if (model === 'cons') return [
    [1, h],
    [0, 1 - h],
  ];
  return [[h, 1]];
}

const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;

function Strand({ x, y, len, kind, heavyShare }: { x: number; y: number; len: number; kind: 'H' | 'L' | 'D'; heavyShare: number }) {
  if (kind !== 'D') return <line x1={x} x2={x + len} y1={y} y2={y} stroke={kind === 'H' ? HEAVY : LIGHT} strokeWidth={4} strokeLinecap="round" />;
  // Дисперсна: четири парчета, всяко с дял heavyShare тежко
  const piece = len / 4;
  return (
    <g>
      <line x1={x} x2={x + len} y1={y} y2={y} stroke={LIGHT} strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2, 3].map(k => (
        <line key={k} x1={x + k * piece} x2={x + k * piece + piece * heavyShare} y1={y} y2={y} stroke={HEAVY} strokeWidth={4} />
      ))}
    </g>
  );
}

/** Опитът на Мезелсон и Стал: бактерии от ¹⁵N в ¹⁴N, ДНК в градиент на плътността (CsCl) след всяко поколение. */
export default function MeselsonStahlLab() {
  const [model, setModel] = useState<Model>('semi');
  const [gen, setGen] = useState(1);
  const [single, setSingle] = useState(false);

  const m = MODELS.find(x => x.id === model)!;
  const n = 2 ** gen;
  const h = 0.5 ** gen;

  // Молекулите в текущото поколение: [горна верига, долна верига]
  const molecules: ['H' | 'L' | 'D', 'H' | 'L' | 'D'][] = Array.from({ length: n }, (_, i) => {
    if (gen === 0) return ['H', 'H'];
    if (model === 'semi') return i < 2 ? ['H', 'L'] : ['L', 'L'];
    if (model === 'cons') return i === 0 ? ['H', 'H'] : ['L', 'L'];
    return ['D', 'D'];
  });

  const cols = gen <= 2 ? 2 : 4;
  const molLen = cols === 2 ? 110 : 56;
  const cellW = 300 / cols;
  const rows = Math.ceil(n / cols);
  const cellH = Math.min(46, 200 / Math.max(rows, 1));

  // Епруветки: y на плътността (тежко – по-ниско)
  const TUBE_TOP = 56;
  const yBand = (d: number) => (single ? 120 + d * 80 : 110 + d * 80);

  const bs = bands(model, gen, single);
  const heavyFrac = gen === 0 ? 1 : model === 'cons' ? h : 0;
  const hybridFrac = gen > 0 && model === 'semi' ? 2 * h : 0;
  const lightFrac = 1 - heavyFrac - hybridFrac;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={24} fontSize="11.5" fontWeight="700" fill="currentColor">
          След {gen} {gen === 1 ? 'поколение' : 'поколения'}: {n} {n === 1 ? 'молекула' : 'молекули'} ДНК
        </text>
        {molecules.map(([a, b], i) => {
          const cx = 20 + (i % cols) * cellW + (cellW - molLen) / 2;
          const cy = 50 + Math.floor(i / cols) * cellH + cellH / 2 - 4;
          return (
            <g key={i}>
              <Strand x={cx} y={cy} len={molLen} kind={a} heavyShare={h} />
              <Strand x={cx} y={cy + 8} len={molLen} kind={b} heavyShare={h} />
            </g>
          );
        })}
        <g fontSize="10.5">
          <line x1={20} x2={40} y1={272} y2={272} stroke={HEAVY} strokeWidth={4} />
          <text x={46} y={276} fill="currentColor">
            верига с ¹⁵N (стара)
          </text>
          <line x1={170} x2={190} y1={272} y2={272} stroke={LIGHT} strokeWidth={4} />
          <text x={196} y={276} fill="currentColor">
            верига с ¹⁴N (нова)
          </text>
        </g>

        {/* Епруветките с градиента */}
        <text x={490} y={24} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="currentColor">
          {single ? 'Единични вериги (след денатурация)' : 'Ивици в градиента на CsCl'}
        </text>
        <text x={360} y={yBand(0) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          лека
        </text>
        {!single && (
          <text x={360} y={yBand(0.5) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            хибридна
          </text>
        )}
        <text x={360} y={yBand(1) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          тежка
        </text>
        {[0, 1, 2, 3, 4].map(g => {
          const x = 384 + g * 50;
          const active = g <= gen;
          return (
            <g key={g} opacity={active ? 1 : 0.3}>
              <rect x={x} y={TUBE_TOP} width={28} height={200} rx={12} className="fill-sky-50 stroke-gray-400 dark:fill-sky-500/10" strokeWidth={1.5} />
              {active &&
                bands(model, g, single)
                  .filter(([, f]) => f > 0)
                  .map(([d, f]) => (
                    <rect key={d} x={x + 3} y={yBand(d) - 3} width={22} height={6} rx={2} fill="#7c3aed" opacity={0.2 + 0.8 * f} />
                  ))}
              <text x={x + 14} y={TUBE_TOP + 216} fontSize="10.5" textAnchor="middle" fill="currentColor" fontWeight={g === gen ? 700 : 400}>
                {g}
              </text>
            </g>
          );
        })}
        <text x={484} y={TUBE_TOP + 232} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          поколение
        </text>
      </LabSvg>

      <Buttons>
        {MODELS.map(x => (
          <DiagramButton key={x.id} active={model === x.id} onClick={() => setModel(x.id)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label={`g = ${gen}`} value={gen} onChange={setGen} min={0} max={4} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={single} onClick={() => setSingle(v => !v)}>
          {single ? 'Двойни спирали' : 'Денатурирай (раздели веригите)'}
        </DiagramButton>
      </Buttons>

      {single ? (
        <Readout
          items={[
            { label: 'вериги ¹⁵N', value: model === 'disp' ? '–' : pct(h), tone: 'blue' },
            { label: 'вериги ¹⁴N', value: model === 'disp' ? '–' : pct(1 - h), tone: 'amber' },
            { label: 'ивици', value: bs.filter(([, f]) => f > 0).length },
          ]}
        />
      ) : model === 'disp' && gen > 0 ? (
        <Readout
          items={[
            { label: 'молекули', value: 'всички еднакви', tone: 'violet' },
            { label: 'дял ¹⁵N във всяка', value: pct(h), tone: 'blue' },
          ]}
        />
      ) : (
        <Readout
          items={[
            { label: 'тежки', value: pct(heavyFrac), tone: 'blue' },
            { label: 'хибридни', value: pct(hybridFrac), tone: 'violet' },
            { label: 'леки', value: pct(lightFrac), tone: 'amber' },
          ]}
        />
      )}
      <Note tone="violet">
        {single
          ? model === 'disp'
            ? 'При дисперсния модел всяка верига е смесена – след денатурация пак има само една ивица по средата.'
            : 'При полуконсервативния и при консервативния модел старите вериги остават цели – след денатурация има две ивици: тежки и леки вериги. Така денатурацията отличава дисперсния модел още след 1 поколение.'
          : m.note}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 g – брой поколения в ¹⁴N. Бактериите растат дълго в среда с ¹⁵N, после се прехвърлят в ¹⁴N. ДНК с ¹⁵N е малко по-плътна и при центрофугиране в разтвор на
        цезиев хлорид застава по-ниско в епруветката.
      </p>
    </div>
  );
}
