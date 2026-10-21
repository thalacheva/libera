import { useEffect, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

type Sample = {
  name: string;
  length: number;
  circular: boolean;
  /** Местата за рязане, bp от началото (при плазмида – от върха на кръга). */
  sites: { EcoRI: number[]; HindIII: number[] };
  note: string;
};

const SAMPLES: Sample[] = [
  {
    name: 'линейна ДНК, 10 000 bp',
    length: 10000,
    circular: false,
    sites: { EcoRI: [3000, 8000], HindIII: [6500] },
    note: 'Линейна молекула: k разреза дават k + 1 фрагмента. Сумата на фрагментите във всяка писта е 10 000 bp.',
  },
  {
    name: 'плазмид, 6000 bp',
    length: 6000,
    circular: true,
    sites: { EcoRI: [0], HindIII: [1500, 4000] },
    note: 'Кръгова молекула: k разреза дават k фрагмента. Един разрез само „отваря“ плазмида в линейна молекула с пълната му дължина. Неразрязаният плазмид е усукан (суперспирализиран) и минава по-бързо от линейна молекула със същата дължина.',
  },
];

const LADDER = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500];

/** Фрагментите след рязане в дадените места. */
function cut(s: Sample, sites: number[]): number[] {
  const p = [...new Set(sites)].sort((a, b) => a - b);
  if (p.length === 0) return [s.length];
  if (s.circular) {
    return p.map((x, i) => (i + 1 < p.length ? p[i + 1] - x : s.length - x + p[0]));
  }
  const all = [0, ...p, s.length];
  return all.slice(1).map((x, i) => x - all[i]);
}

// Гелът: ямките са на y = WELL; пробег при t = 1 – d = K·(4,5 − lg размер)
const WELL = 58;
const K = 125;
const GEL_X = 250;
const LANE_W = 66;
const LANES = ['маркер', 'неразрязана', 'EcoRI', 'HindIII', 'EcoRI + HindIII'];
/** Мащаб: 3 единици от чертежа = 1 mm от гела. */
const MM = 3;

const dist = (size: number, t: number) => t * K * (4.5 - Math.log10(size));
const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');
const bp = (v: number) => Math.round(v).toLocaleString('bg-BG').replace(/\s/g, ' ');

/** Размер по маркера: линейна интерполация на lg(размер) между двете съседни ивици на маркера. */
function sizeFromLadder(d: number, t: number) {
  const pts = LADDER.map(s => ({ d: dist(s, t), lg: Math.log10(s) }));
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (d >= a.d && d <= b.d) return 10 ** (a.lg + ((d - a.d) / (b.d - a.d)) * (b.lg - a.lg));
  }
  return null;
}

/** Гел-електрофореза: рязане на ДНК с рестриктази и разчитане на размерите по ДНК маркера. */
export default function GelLab() {
  const [sample, setSample] = useState(0);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [picked, setPicked] = useState<{ lane: number; size: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const s = SAMPLES[sample];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setT(v => {
        if (v >= 1) {
          setRunning(false);
          return 1;
        }
        return Math.min(1, Math.round((v + 0.01) * 100) / 100);
      });
    }, 40);
    return () => clearInterval(id);
  }, [running]);

  const lanes: { sizes: number[]; supercoiled?: boolean }[] = [
    { sizes: LADDER },
    { sizes: [s.length], supercoiled: s.circular },
    { sizes: cut(s, s.sites.EcoRI) },
    { sizes: cut(s, s.sites.HindIII) },
    { sizes: cut(s, [...s.sites.EcoRI, ...s.sites.HindIII]) },
  ];

  const reset = (i: number) => {
    setSample(i);
    setT(0);
    setRunning(false);
    setPicked(null);
    setShowMap(false);
  };

  // Неразрязаният плазмид минава като линейна молекула с около 0,6 от дължината си
  const apparent = (size: number, supercoiled?: boolean) => (supercoiled ? size * 0.6 : size);
  const pickedD = picked ? dist(apparent(picked.size, picked.lane === 1 && s.circular), t) : 0;
  const estimate = picked && t > 0.15 ? sizeFromLadder(pickedD, t) : null;

  // Картата на молекулата
  const sites = [
    ...s.sites.EcoRI.map(x => ({ x, name: 'EcoRI', color: '#e11d48' })),
    ...s.sites.HindIII.map(x => ({ x, name: 'HindIII', color: '#2563eb' })),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Картата */}
        <text x={20} y={24} fontSize="12" fontWeight="700" fill="currentColor">
          Картата на молекулата
        </text>
        {showMap ? (
          s.circular ? (
            <g>
              <circle cx={115} cy={150} r={70} fill="none" className="stroke-gray-500" strokeWidth={5} />
              {sites.map(site => {
                const a = (site.x / s.length) * 2 * Math.PI - Math.PI / 2;
                const x1 = 115 + 62 * Math.cos(a);
                const y1 = 150 + 62 * Math.sin(a);
                const x2 = 115 + 80 * Math.cos(a);
                const y2 = 150 + 80 * Math.sin(a);
                const lx = 115 + 88 * Math.cos(a);
                const ly = 150 + 88 * Math.sin(a) + (Math.sin(a) > 0.5 ? 10 : Math.sin(a) < -0.5 ? -4 : 0);
                const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
                return (
                  <g key={site.name + site.x}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={site.color} strokeWidth={3} />
                    <text x={lx} y={ly - 4} fontSize="10" textAnchor={anchor} fill={site.color} fontWeight="700">
                      {site.name}
                    </text>
                    <text x={lx} y={ly + 8} fontSize="9.5" textAnchor={anchor} className="fill-gray-500 dark:fill-gray-400">
                      {bp(site.x)}
                    </text>
                  </g>
                );
              })}
              <text x={115} y={154} fontSize="11" textAnchor="middle" fill="currentColor">
                {bp(s.length)} bp
              </text>
            </g>
          ) : (
            <g>
              <line x1={20} x2={220} y1={150} y2={150} className="stroke-gray-500" strokeWidth={5} />
              {sites.map((site, i) => {
                const x = 20 + (site.x / s.length) * 200;
                const up = i % 2 === 0;
                return (
                  <g key={site.name + site.x}>
                    <line x1={x} x2={x} y1={140} y2={160} stroke={site.color} strokeWidth={3} />
                    <text x={x} y={up ? 128 : 178} fontSize="10" textAnchor="middle" fill={site.color} fontWeight="700">
                      {site.name}
                    </text>
                    <text x={x} y={up ? 116 : 190} fontSize="9.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                      {bp(site.x)}
                    </text>
                  </g>
                );
              })}
              <text x={20} y={212} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
                0
              </text>
              <text x={220} y={212} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
                {bp(s.length)}
              </text>
            </g>
          )
        ) : (
          <g>
            <rect x={20} y={60} width={200} height={180} rx={10} className="fill-gray-100 dark:fill-gray-700/50" />
            <text x={120} y={140} fontSize="30" textAnchor="middle" className="fill-gray-400">
              ?
            </text>
            <text x={120} y={170} fontSize="10.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              Разчети гела и познай
            </text>
            <text x={120} y={184} fontSize="10.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              къде режат ензимите
            </text>
          </g>
        )}

        {/* Гелът */}
        <rect x={GEL_X - 8} y={36} width={LANE_W * LANES.length + 16} height={292} rx={6} className="fill-sky-50 stroke-sky-300 dark:fill-sky-950 dark:stroke-sky-800" />
        <text x={GEL_X - 14} y={46} fontSize="14" fontWeight="700" textAnchor="end" fill="currentColor">
          −
        </text>
        <text x={GEL_X - 14} y={324} fontSize="14" fontWeight="700" textAnchor="end" fill="#dc2626">
          +
        </text>
        {LANES.map((name, i) => {
          const cx = GEL_X + LANE_W * i + LANE_W / 2;
          const lane = lanes[i];
          return (
            <g key={name}>
              <text x={cx} y={26} fontSize="9.5" textAnchor="middle" fill="currentColor" fontWeight={i === 0 ? 400 : 600}>
                {name}
              </text>
              <rect x={cx - 22} y={WELL - 10} width={44} height={6} rx={1} className="fill-white stroke-gray-400 dark:fill-gray-900" />
              {lane.sizes.map((size, j) => {
                const y = WELL + dist(apparent(size, lane.supercoiled), t);
                const active = picked?.lane === i && picked.size === size;
                return (
                  <rect
                    key={j}
                    x={cx - 21}
                    y={y - 3}
                    width={42}
                    height={6}
                    rx={2}
                    className={i === 0 ? 'fill-gray-500 dark:fill-gray-400' : 'fill-violet-600 dark:fill-violet-400'}
                    opacity={t === 0 ? 0 : 0.95}
                    stroke={active ? '#f59e0b' : 'none'}
                    strokeWidth={active ? 2.5 : 0}
                    style={{ cursor: t > 0 ? 'pointer' : 'default' }}
                    onClick={() => t > 0 && setPicked({ lane: i, size })}
                  />
                );
              })}
            </g>
          );
        })}
        {picked && t > 0 && (
          <line
            x1={GEL_X - 8}
            x2={GEL_X + LANE_W * LANES.length + 8}
            y1={WELL + pickedD}
            y2={WELL + pickedD}
            stroke="#f59e0b"
            strokeDasharray="4 3"
          />
        )}
      </LabSvg>

      <Buttons>
        {SAMPLES.map((q, i) => (
          <DiagramButton key={q.name} active={sample === i} onClick={() => reset(i)}>
            {q.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="t, min" value={Math.round(t * 60)} onChange={v => { setRunning(false); setT(v / 60); }} min={0} max={60} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={running} onClick={() => setRunning(r => !r && t < 1)}>
          {running ? '⏸ Пауза' : '▶ Пусни тока'}
        </DiagramButton>
        <DiagramButton onClick={() => reset(sample)}>Отначало</DiagramButton>
        <DiagramButton active={showMap} onClick={() => setShowMap(v => !v)}>
          {showMap ? 'Скрий картата' : 'Покажи картата'}
        </DiagramButton>
      </Buttons>

      {picked && t > 0 ? (
        <>
          <Readout
            items={[
              { label: 'писта', value: LANES[picked.lane], tone: 'violet' },
              { label: 'пробег', value: `${fmt(pickedD / MM, 1)} mm`, tone: 'amber' },
              { label: 'по маркера', value: estimate ? `≈ ${bp(Math.round(estimate / 10) * 10)} bp` : 'извън маркера', tone: 'emerald' },
            ]}
          />
          {picked.lane === 1 && s.circular && (
            <Formula>Внимание: неразрязаният плазмид е усукан и изглежда по-малък, отколкото е ({bp(s.length)} bp).</Formula>
          )}
        </>
      ) : (
        <Formula>{t === 0 ? 'Пусни тока и изчакай ивиците да се разделят.' : 'Натисни ивица – ще видиш пробега ѝ и размера по маркера.'}</Formula>
      )}
      <Note tone="violet">{s.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 ДНК е заредена отрицателно и пътува към анода (+). По-малките фрагменти се провират по-лесно през порите на агарозата и
        стигат по-далеч. Пробегът е приблизително линейна функция на логаритъма на размера – затова размерът се отчита по маркера в
        логаритмичен мащаб. Маркерът: 10 000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000 и 500 bp.
      </p>
    </div>
  );
}
