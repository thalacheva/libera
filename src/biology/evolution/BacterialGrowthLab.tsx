import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

const T_MAX = 30; // h
const DT = 0.01; // h
/** Капацитет на средата – колко клетки в 1 ml побират хранителните вещества. */
const K = 1e9;
/** Колко часа трае стационарната фаза, преди клетките да започнат да умират. */
const STATIONARY_H = 6;
/** Отмиране: по 0,25 порядъка на час (десет пъти за 4 h). */
const DEATH_LG_PER_H = 0.25;
/** Колко пъти по-бързо пеницилинът убива, отколкото клетките биха се делили. */
const KILL = 1.5;

type Phase = 'lag' | 'log' | 'stat' | 'death' | 'kill';
const PHASE_NAME: Record<Phase, string> = {
  lag: 'лаг фаза',
  log: 'логаритмична фаза',
  stat: 'стационарна фаза',
  death: 'фаза на отмиране',
  kill: 'действа пеницилин',
};

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻';
const sup = (k: number) => String(k).split('').map(c => (c === '-' ? SUP[10] : SUP[Number(c)])).join('');
function big(v: number) {
  if (v < 1) return '< 1';
  if (v < 1e5) return Math.round(v).toLocaleString('bg-BG').replace(/\s/g, ' ');
  const k = Math.floor(Math.log10(v));
  return `${(v / 10 ** k).toFixed(1).replace('.', ',')}·10${sup(k)}`;
}
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Броят живи клетки в 1 ml през DT часа и фазата във всеки момент. */
function simulate(n0: number, g: number, lag: number, penicillin: number | null) {
  const mu = Math.log(2) / (g / 60); // за час
  const ns: number[] = [n0];
  const phases: Phase[] = ['lag'];
  let n = n0;
  let tFull: number | null = null;
  const steps = Math.round(T_MAX / DT);
  for (let i = 1; i <= steps; i++) {
    const t = i * DT;
    const room = Math.max(0, 1 - n / K);
    let phase: Phase;
    if (t < lag) {
      phase = 'lag';
    } else if (penicillin !== null && t >= penicillin && tFull === null) {
      // Пеницилинът спира строежа на клетъчната стена – растящите клетки се пукат.
      n -= KILL * mu * room * n * DT;
      phase = 'kill';
    } else if (tFull !== null && t >= tFull + STATIONARY_H) {
      n *= 10 ** (-DEATH_LG_PER_H * DT);
      phase = 'death';
    } else {
      n += mu * room * n * DT;
      if (tFull === null && n >= 0.99 * K) tFull = t;
      phase = n < 0.9 * K ? 'log' : 'stat';
    }
    n = Math.max(n, 0);
    ns.push(n);
    phases.push(phase);
  }
  return { ns, phases };
}

// Графиката
const GX = 70;
const GW = 540;
const GY = 30;
const GH = 220;
const gx = (t: number) => GX + (t / T_MAX) * GW;
const gyLog = (n: number) => GY + GH - (Math.log10(Math.max(1, n)) / 10) * GH;
const gyLin = (n: number) => GY + GH - (n / (1.1 * K)) * GH;

const BAND: Record<Phase, string> = {
  lag: '#e5e7eb',
  log: '#fecdd3',
  stat: '#fde68a',
  death: '#cbd5e1',
  kill: '#ddd6fe',
};

/** Растежна крива на бактерии: лаг, логаритмична, стационарна фаза и отмиране; пеницилин в различни фази. */
export default function BacterialGrowthLab() {
  const [g, setG] = useState(30);
  const [lgN0, setLgN0] = useState(3);
  const [lag, setLag] = useState(1.5);
  const [t, setT] = useState(8);
  const [logScale, setLogScale] = useState(true);
  const [pen, setPen] = useState<number | null>(null);

  const n0 = 10 ** lgN0;
  const { ns, phases } = simulate(n0, g, lag, pen);
  const gy = logScale ? gyLog : gyLin;
  const i = Math.round(t / DT);
  const n = ns[i];
  const phase = phases[i];

  // Ивиците на фазите (сливаме съседните еднакви)
  const bands: { from: number; to: number; phase: Phase }[] = [];
  phases.forEach((p, k) => {
    const last = bands[bands.length - 1];
    if (last && last.phase === p) last.to = k * DT;
    else bands.push({ from: k * DT, to: k * DT, phase: p });
  });

  const step = 5;
  const path = ns
    .filter((_, k) => k % step === 0)
    .map((v, k) => `${k === 0 ? 'M' : 'L'}${gx(k * step * DT).toFixed(1)},${gy(v).toFixed(1)}`)
    .join(' ');

  const gens = Math.log2(Math.max(n, 1) / n0);
  const yTicks = logScale ? [0, 2, 4, 6, 8, 10].map(k => ({ v: 10 ** k, label: k === 0 ? '1' : `10${sup(k)}` })) : [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: f * K, label: f === 0 ? '0' : `${fmt(f, 2)}·10⁹` }));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {bands.map(b => (
          <g key={b.from}>
            <rect x={gx(b.from)} y={GY} width={Math.max(0, gx(b.to) - gx(b.from))} height={GH} fill={BAND[b.phase]} opacity={0.45} />
            {gx(b.to) - gx(b.from) > 70 && (
              <text x={(gx(b.from) + gx(b.to)) / 2} y={GY + 14} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {PHASE_NAME[b.phase].replace(' фаза', '').replace('фаза на ', '')}
              </text>
            )}
          </g>
        ))}
        {yTicks.map(({ v, label }) => (
          <g key={label}>
            <line x1={GX} x2={GX + GW} y1={gy(v)} y2={gy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX - 6} y={gy(v) + 3.5} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {label}
            </text>
          </g>
        ))}
        {[0, 5, 10, 15, 20, 25, 30].map(h => (
          <text key={h} x={gx(h)} y={GY + GH + 15} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {h}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          време, h
        </text>
        <text x={GX} y={GY - 10} fontSize="12" fontWeight="700" fill="currentColor">
          Живи клетки в 1 ml {logScale ? '(логаритмичен мащаб)' : '(линеен мащаб)'}
        </text>
        {pen !== null && (
          <g>
            <line x1={gx(pen)} x2={gx(pen)} y1={GY} y2={GY + GH} stroke="#7c3aed" strokeDasharray="4 3" />
            <text x={gx(pen) + 4} y={GY + GH - 8} fontSize="11" fill="#7c3aed">
              пеницилин
            </text>
          </g>
        )}
        <path d={path} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth={3} />
        <line x1={gx(t)} x2={gx(t)} y1={GY} y2={GY + GH} className="stroke-gray-400" strokeDasharray="2 3" />
        <circle cx={gx(t)} cy={gy(n)} r={6} className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-gray-800" strokeWidth={2} />
      </LabSvg>

      <Sliders>
        <Slider label="g, min" value={g} onChange={setG} min={20} max={60} step={5} tone="rose" />
        <Slider label="lg N₀" value={lgN0} onChange={setLgN0} min={2} max={6} step={1} tone="emerald" />
        <Slider label="лаг, h" value={lag} onChange={setLag} min={0} max={4} step={0.5} tone="amber" />
        <Slider label="t, h" value={t} onChange={setT} min={0} max={T_MAX} step={0.25} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={logScale} onClick={() => setLogScale(true)}>
          логаритмичен мащаб
        </DiagramButton>
        <DiagramButton active={!logScale} onClick={() => setLogScale(false)}>
          линеен мащаб
        </DiagramButton>
        <DiagramButton active={pen !== null} onClick={() => setPen(p => (p === null ? t : null))}>
          {pen === null ? `💊 пеницилин при t = ${fmt(t, 2)} h` : 'без пеницилин'}
        </DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 't', value: `${fmt(t, 2)} h`, tone: 'blue' },
          { label: 'N', value: big(n), tone: 'rose' },
          { label: 'фаза', value: PHASE_NAME[phase] },
        ]}
      />
      {phase === 'log' || phase === 'lag' ? (
        <Formula>
          поколения: log₂(N/N₀) = {fmt(Math.max(0, gens))}; (t − лаг)/g = {fmt((Math.max(0, t - lag) * 60) / g)}
        </Formula>
      ) : (
        <Formula>N = {big(n)} клетки в 1 ml (храната стига за около 10⁹)</Formula>
      )}
      <Note tone="rose">
        {phase === 'kill'
          ? 'Пеницилинът убива само клетки, които растат и строят нова клетъчна стена.'
          : pen !== null && ['stat', 'death'].includes(phases[Math.round(pen / DT)])
            ? 'Пеницилинът е добавен в стационарната фаза – клетките не растат и почти не умират от него.'
            : logScale
              ? 'В логаритмичен мащаб експоненциалният растеж е права линия: наклонът показва колко бързо се делят клетките.'
              : 'В линеен мащаб първите часове изглеждат като „нищо“, а после кривата изведнъж излита нагоре.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: след лаг фазата клетките се делят на всеки g минути, докато храната ги ограничи до около 10⁹ в 1 ml (логистичен
        растеж); след {STATIONARY_H} h в стационарна фаза живите клетки намаляват по десет пъти на 4 h. Опитай: при един и същ брой
        поколения две криви с различно N₀ са успоредни в логаритмичен мащаб. Добави пеницилин в логаритмичната фаза и после в
        стационарната.
      </p>
    </div>
  );
}
