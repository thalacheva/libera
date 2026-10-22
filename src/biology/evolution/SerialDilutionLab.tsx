import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Посява се 0,1 ml от избраната епруветка. */
const V = 0.1;
const TUBES = [1, 2, 3, 4, 5, 6, 7];
/** Над толкова колонии петрито е „твърде гъсто за броене“. */
const MAX_COUNT = 300;
const MIN_COUNT = 30;

/** Детерминиран генератор (mulberry32) – едно и също посяване дава едни и същи колонии. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Случайно число с разпределение на Поасон (алгоритъм на Кнут – стига за λ до няколкостотин). */
function poisson(lambda: number, r: () => number) {
  const l = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= r();
  } while (p > l);
  return k - 1;
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻';
const sup = (k: number) => String(k).split('').map(c => (c === '-' ? SUP[10] : SUP[Number(c)])).join('');
function sci(v: number) {
  const k = Math.floor(Math.log10(v));
  return `${(v / 10 ** k).toFixed(2).replace('.', ',')}·10${sup(k)}`;
}

const SAMPLES = [
  { name: 'кисело мляко', conc: 4.2e8 },
  { name: 'речна вода', conc: 3.6e5 },
  { name: 'бульон след 1 нощ', conc: 2.7e9 },
];

// Епруветките и петрито
const TX = 40;
const TSTEP = 62;
const DX = 320;
const DY = 228;
const DR = 70;

/** Последователно разреждане и посяване: брой колонии → брой бактерии в 1 ml (CFU/ml). */
export default function SerialDilutionLab() {
  const [sample, setSample] = useState(0);
  const [tube, setTube] = useState(4);
  const [shown, setShown] = useState(false);

  const conc = SAMPLES[sample].conc;
  const lambda = conc * 10 ** -tube * V;
  const r = rng(1000 * sample + tube + 7);
  const count = lambda > 600 ? null : poisson(lambda, r);
  const dots =
    count === null
      ? []
      : Array.from({ length: count }, () => {
          const a = r() * 2 * Math.PI;
          const d = Math.sqrt(r()) * (DR - 7);
          return { x: DX + Math.cos(a) * d, y: DY + Math.sin(a) * d, s: 2.2 + r() * 2.2 };
        });
  const choose = (k: number) => {
    setTube(k);
    setShown(false);
  };
  const countable = count !== null && count >= MIN_COUNT && count <= MAX_COUNT;
  const estimate = count === null ? null : count / (V * 10 ** -tube);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={20} fontSize="12.5" fontWeight="700" fill="currentColor">
          Проба: {SAMPLES[sample].name} → всяка епруветка: 1 ml в 9 ml вода (×10)
        </text>
        {/* Пробата и епруветките */}
        {[0, ...TUBES].map(k => {
          const x = TX + k * TSTEP;
          const active = k === tube;
          const shade = Math.max(0.05, 0.9 - k * 0.12);
          return (
            <g key={k} onClick={() => k > 0 && choose(k)} style={{ cursor: k > 0 ? 'pointer' : 'default' }}>
              <path d={`M${x - 13},40 L${x - 13},100 a13,13 0 0 0 26,0 L${x + 13},40`} className={active ? 'stroke-rose-600' : 'stroke-gray-400'} strokeWidth={active ? 3 : 2} fill="none" />
              <path d={`M${x - 12},62 L${x - 12},100 a12,12 0 0 0 24,0 L${x + 12},62 Z`} fill="#d97706" opacity={shade} />
              <text x={x} y={132} fontSize="12" textAnchor="middle" className={active ? 'fill-rose-600 font-bold' : 'fill-gray-600 dark:fill-gray-300'}>
                {k === 0 ? 'проба' : `10${sup(-k)}`}
              </text>
              {k > 0 && <path d={`M${x - TSTEP + 15},50 q${TSTEP / 2 - 15},-16 ${TSTEP - 30},0`} fill="none" className="stroke-gray-400" strokeWidth={1.2} markerEnd="url(#sd-arrow)" />}
            </g>
          );
        })}
        <defs>
          <marker id="sd-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" className="fill-gray-400" />
          </marker>
        </defs>
        {/* От избраната епруветка към петрито */}
        <path d={`M${TX + tube * TSTEP},140 Q${(TX + tube * TSTEP + DX) / 2},150 ${DX},${DY - DR - 6}`} fill="none" className="stroke-rose-400" strokeDasharray="4 3" strokeWidth={1.5} markerEnd="url(#sd-arrow)" />
        <text x={DX + DR + 14} y={DY - 30} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          посети 0,1 ml
        </text>
        <text x={DX + DR + 14} y={DY - 14} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          от 10{sup(-tube)}, 1 денонощие при 37 °C
        </text>
        {/* Петрито */}
        <circle cx={DX} cy={DY} r={DR + 4} className="fill-gray-100 dark:fill-gray-700 stroke-gray-400" strokeWidth={2} />
        <circle cx={DX} cy={DY} r={DR} fill="#fef3c7" className="dark:opacity-80" />
        {count === null ? (
          <>
            <circle cx={DX} cy={DY} r={DR - 2} fill="#fde68a" />
            <text x={DX} y={DY + 4} fontSize="12" textAnchor="middle" fill="#92400e">
              сплошен слой
            </text>
          </>
        ) : (
          dots.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={d.s} fill="#f8fafc" stroke="#b45309" strokeWidth={0.8} />)
        )}
        <text x={DX - DR - 14} y={DY + 4} fontSize="13" textAnchor="end" fontWeight="700" className={countable ? 'fill-emerald-600' : 'fill-rose-600'}>
          {count === null ? 'TNTC' : `${count} колонии`}
        </text>
      </LabSvg>

      <Buttons>
        {SAMPLES.map((s, k) => (
          <DiagramButton key={s.name} active={sample === k} onClick={() => { setSample(k); setShown(false); }}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {TUBES.map(k => (
          <DiagramButton key={k} active={tube === k} onClick={() => choose(k)}>
            10{sup(-k)}
          </DiagramButton>
        ))}
      </Buttons>
      <Readout
        items={[
          { label: 'разреждане', value: `10${sup(-tube)}`, tone: 'rose' },
          { label: 'колонии', value: count === null ? '> 600' : count, tone: countable ? 'emerald' : 'amber' },
          { label: 'посят обем', value: '0,1 ml' },
        ]}
      />
      {count !== null && count > 0 && (
        <Formula>
          N = колонии / (V · разреждане) = {count} / (0,1 · 10{sup(-tube)}) = {estimate !== null && sci(estimate)} CFU/ml
        </Formula>
      )}
      <Note tone={countable ? 'emerald' : 'amber'}>
        {count === null
          ? 'Колониите са толкова много, че са се слели – „твърде много за броене“ (TNTC). Избери по-голямо разреждане.'
          : count < MIN_COUNT
            ? `Под ${MIN_COUNT} колонии случайността е голяма – оценката е ненадеждна. Избери по-малко разреждане.`
            : count > MAX_COUNT
              ? `Над ${MAX_COUNT} колонии се сливат и се броят трудно. Избери по-голямо разреждане.`
              : `Между ${MIN_COUNT} и ${MAX_COUNT} колонии – това петри е подходящо за броене.`}
      </Note>
      <Buttons>
        <DiagramButton active={shown} onClick={() => setShown(s => !s)}>
          {shown ? `истински брой: ${sci(conc)} в 1 ml` : 'покажи истинския брой'}
        </DiagramButton>
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяка жива клетка (или слепена група клетки) дава една колония – затова резултатът се дава в колониеобразуващи единици (CFU).
        Броят на колониите е случаен (разпределение на Поасон): при 100 очаквани колонии обикновено се получават между 80 и 120.
        Сравни оценките от две съседни разреждания.
      </p>
    </div>
  );
}
