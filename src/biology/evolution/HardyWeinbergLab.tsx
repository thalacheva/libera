import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Sample = { id: string; name: string; labels: [string, string, string]; counts: [number, number, number]; note: string };

// Примерни (измислени, но реалистични) извадки по 1000 души или растения
const SAMPLES: Sample[] = [
  {
    id: 'mn',
    name: 'кръвни групи MN',
    labels: ['MM', 'MN', 'NN'],
    counts: [298, 489, 213],
    note: 'Алелите M и N са кодоминантни и не влияят на оцеляването. Наблюдаваното почти съвпада с очакваното – популацията е в равновесие.',
  },
  {
    id: 'selfing',
    name: 'самоопрашване',
    labels: ['AA', 'Aa', 'aa'],
    counts: [380, 240, 380],
    note: 'Растенията често се самоопрашват – това е крайна форма на инбридинг. Хомозиготите са твърде много, хетерозиготите – твърде малко, макар честотите на алелите да са същите.',
  },
  {
    id: 'sickle',
    name: 'възрастни в малариен район',
    labels: ['AA', 'AS', 'SS'],
    counts: [704, 292, 4],
    note: 'При раждане генотиповете са в равновесие, но до зряла възраст доживяват повече хетерозиготи AS – те са защитени и от маларията, и от тежката анемия. Изобилието на хетерозиготи издава отбор.',
  },
];

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');
const pct = (v: number) => `${fmt(v * 100, 1)}%`;

const COL = { AA: '#e11d48', Aa: '#a855f7', aa: '#2563eb' };

// Квадратът на Пънет за популацията
const SQ = 170;
const SX = 30;
const SY = 34;
// Графиката p², 2pq, q² от p
const GX = 262;
const GW = 196;
const GY = 34;
const GH = 170;

/** Закон на Харди–Вайнберг: генотипове от честотите на алелите и проверка на извадка с χ². */
export default function HardyWeinbergLab() {
  const [p, setP] = useState(0.7);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const q = 1 - p;
  const freqs = [p * p, 2 * p * q, q * q];

  const sample = SAMPLES.find(s => s.id === sampleId);
  let check: { n: number; ps: number; expected: number[]; chi: number } | null = null;
  if (sample) {
    const [aa1, ab, bb] = sample.counts;
    const n = aa1 + ab + bb;
    const ps = (2 * aa1 + ab) / (2 * n);
    const qs = 1 - ps;
    const expected = [ps * ps * n, 2 * ps * qs * n, qs * qs * n];
    const chi = sample.counts.reduce((sum, o, i) => sum + (o - expected[i]) ** 2 / expected[i], 0);
    check = { n, ps, expected, chi };
  }
  // В квадрата и графиката показваме честотите от извадката, ако е избрана
  const pp = check ? check.ps : p;
  const w = SQ * pp;

  const gx = (x: number) => GX + x * GW;
  const gy = (y: number) => GY + GH - y * GH;
  const curve = (f: (x: number) => number) =>
    Array.from({ length: 101 }, (_, i) => i / 100)
      .map(x => `${gx(x).toFixed(1)},${gy(f(x)).toFixed(1)}`)
      .join(' ');

  const labels = sample ? sample.labels : ['AA', 'Aa', 'aa'];
  const cell = (x: number, y: number, cw: number, ch: number, label: string, color: string) =>
    cw > 0.5 && ch > 0.5 ? (
      <g>
        <rect x={x} y={y} width={cw} height={ch} fill={color} opacity={0.22} stroke={color} strokeWidth={1.5} />
        {cw > 26 && ch > 18 && (
          <text x={x + cw / 2} y={y + ch / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill={color}>
            {label}
          </text>
        )}
      </g>
    ) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Гаметите отгоре и отляво */}
        <text x={SX + w / 2} y={SY - 8} fontSize="11" textAnchor="middle" fill={COL.AA}>
          {w > 30 ? `${labels[0][0]}: ${fmt(pp)}` : ''}
        </text>
        <text x={SX + w + (SQ - w) / 2} y={SY - 8} fontSize="11" textAnchor="middle" fill={COL.aa}>
          {SQ - w > 30 ? `${labels[2][0]}: ${fmt(1 - pp)}` : ''}
        </text>
        <text x={SX - 6} y={SY + w / 2 + 4} fontSize="11" textAnchor="end" fill={COL.AA}>
          {w > 16 ? labels[0][0] : ''}
        </text>
        <text x={SX - 6} y={SY + w + (SQ - w) / 2 + 4} fontSize="11" textAnchor="end" fill={COL.aa}>
          {SQ - w > 16 ? labels[2][0] : ''}
        </text>
        {cell(SX, SY, w, w, labels[0], COL.AA)}
        {cell(SX + w, SY, SQ - w, w, labels[1], COL.Aa)}
        {cell(SX, SY + w, w, SQ - w, labels[1], COL.Aa)}
        {cell(SX + w, SY + w, SQ - w, SQ - w, labels[2], COL.aa)}
        <rect x={SX} y={SY} width={SQ} height={SQ} fill="none" className="stroke-gray-500" />
        <text x={SX + SQ / 2} y={SY + SQ + 18} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          яйцеклетки × сперматозоиди
        </text>

        {/* p², 2pq, q² */}
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={gy(0)} className="stroke-gray-400" />
        {[0, 0.5, 1].map(v => (
          <g key={v}>
            <text x={GX - 5} y={gy(v) + 4} fontSize="10" textAnchor="end" fill="currentColor">
              {fmt(v, 1)}
            </text>
            <text x={gx(v)} y={gy(0) + 14} fontSize="10" textAnchor="middle" fill="currentColor">
              {fmt(v, 1)}
            </text>
          </g>
        ))}
        <text x={GX + GW} y={gy(0) + 28} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          p (честота на {labels[0][0]})
        </text>
        <polyline points={curve(x => x * x)} fill="none" stroke={COL.AA} strokeWidth="2" />
        <polyline points={curve(x => 2 * x * (1 - x))} fill="none" stroke={COL.Aa} strokeWidth="2" />
        <polyline points={curve(x => (1 - x) ** 2)} fill="none" stroke={COL.aa} strokeWidth="2" />
        <text x={gx(0.97)} y={gy(0.94) - 4} fontSize="11" textAnchor="end" fill={COL.AA}>
          p²
        </text>
        <text x={gx(0.5)} y={gy(0.5) - 6} fontSize="11" textAnchor="middle" fill={COL.Aa}>
          2pq
        </text>
        <text x={gx(0.03)} y={gy(0.94) - 4} fontSize="11" fill={COL.aa}>
          q²
        </text>
        <line x1={gx(pp)} x2={gx(pp)} y1={GY} y2={gy(0)} className="stroke-gray-400" strokeDasharray="3 3" />
        {[pp * pp, 2 * pp * (1 - pp), (1 - pp) ** 2].map((f, i) => (
          <circle key={i} cx={gx(pp)} cy={gy(f)} r="4.5" fill={[COL.AA, COL.Aa, COL.aa][i]} stroke="white" strokeWidth="1.5" />
        ))}
      </LabSvg>

      <Buttons>
        <DiagramButton active={!sample} onClick={() => setSampleId(null)}>
          модел
        </DiagramButton>
        {SAMPLES.map(s => (
          <DiagramButton key={s.id} active={sampleId === s.id} onClick={() => setSampleId(s.id)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>

      {!sample && (
        <>
          <Sliders>
            <Slider label="p" value={p} onChange={setP} min={0} max={1} step={0.01} tone="rose" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'AA = p²', value: pct(freqs[0]), tone: 'rose' },
                { label: 'Aa = 2pq', value: pct(freqs[1]), tone: 'violet' },
                { label: 'aa = q²', value: pct(freqs[2]), tone: 'blue' },
              ]}
            />
          </div>
          <Note tone="violet">
            {q < 0.1 && q > 0
              ? `Рядък рецесивен алел: само ${pct(freqs[2])} са aa, но носителите Aa са ${pct(freqs[1])} – ${fmt(freqs[1] / freqs[2], 0)} пъти повече. Почти всички алели a се крият в хетерозиготи.`
              : 'Хетерозиготите са най-много при p = q = 0,5 – тогава са 50%. Повече не могат да бъдат, докато популацията е в равновесие.'}
          </Note>
        </>
      )}

      {sample && check && (
        <>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse max-w-md mx-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700">генотип</th>
                  <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">наблюдавани</th>
                  <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">очаквани</th>
                  <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-right">(O − E)²/E</th>
                </tr>
              </thead>
              <tbody>
                {sample.counts.map((o, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 font-mono" style={{ color: [COL.AA, COL.Aa, COL.aa][i] }}>
                      {sample.labels[i]}
                    </td>
                    <td className="px-2 py-1 text-right font-mono">{o}</td>
                    <td className="px-2 py-1 text-right font-mono">{fmt(check.expected[i], 1)}</td>
                    <td className="px-2 py-1 text-right font-mono">{fmt((o - check.expected[i]) ** 2 / check.expected[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Readout
              items={[
                { label: `p = (2·${sample.counts[0]} + ${sample.counts[1]}) / ${2 * check.n}`, value: fmt(check.ps, 3), tone: 'rose' },
                { label: 'χ²', value: fmt(check.chi), tone: check.chi > 3.84 ? 'rose' : 'emerald' },
              ]}
            />
          </div>
          <Note tone={check.chi > 3.84 ? 'rose' : 'emerald'}>
            {check.chi > 3.84
              ? `χ² = ${fmt(check.chi)} > 3,84 – популацията НЕ е в равновесие на Харди–Вайнберг.`
              : `χ² = ${fmt(check.chi)} < 3,84 – отклонението е случайно, популацията е в равновесие.`}
          </Note>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center max-w-xl mx-auto">{sample.note}</p>
        </>
      )}

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Площта на всяко квадратче е вероятността яйцеклетка и сперматозоид с тези алели да се срещнат: p · p, p · q, q · p и q · q.
        При проверката на извадка степента на свобода е 1 (три класа, минус 1, минус още 1 за честотата p, пресметната от самите данни),
        затова критичната стойност е 3,84.
      </p>
    </div>
  );
}
