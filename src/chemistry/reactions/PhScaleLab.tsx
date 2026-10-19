import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { colorAt, LITMUS, METHYL_ORANGE, PHENOLPHTHALEIN, UNIVERSAL } from './phColors';
import { fmt, sci } from './ph';

// Приблизителни стойности – зависят от марката, разреждането и температурата
const SUBSTANCES: [string, number][] = [
  ['стомашен сок', 1.5],
  ['лимонов сок', 2.3],
  ['кола', 2.5],
  ['оцет', 2.8],
  ['портокалов сок', 3.5],
  ['кафе', 5],
  ['дъждовна вода', 5.6],
  ['мляко', 6.6],
  ['чиста вода', 7],
  ['кръв', 7.4],
  ['морска вода', 8.1],
  ['сода бикарбонат', 8.3],
  ['сапун', 10],
  ['амоняк (битов)', 11.5],
  ['белина', 12.5],
  ['препарат за канали', 13.5],
];

const L = 30;
const R = 450;
const xAt = (pH: number) => L + (pH / 14) * (R - L);

const TUBES = [
  { name: 'лакмус', color: (pH: number) => colorAt(LITMUS.stops, pH) },
  { name: 'фенолфталеин', color: (pH: number) => colorAt(PHENOLPHTHALEIN.stops, pH) },
  { name: 'метилоранж', color: (pH: number) => colorAt(METHYL_ORANGE.stops, pH) },
  { name: 'универсален', color: (pH: number) => colorAt(UNIVERSAL, pH) },
];

/** Скалата на pH: вещества от бита, концентрациите на H⁺ и OH⁻ и цветовете на индикаторите. */
export default function PhScaleLab() {
  const [pH, setPH] = useState(2.3);
  const h = 10 ** -pH;
  const oh = 10 ** (pH - 14);
  const near = SUBSTANCES.find(([, v]) => Math.abs(v - pH) < 0.05);
  const kind = pH < 6.95 ? 'кисела' : pH > 7.05 ? 'основна' : 'неутрална';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SUBSTANCES.map(([name, v]) => (
          <DiagramButton key={name} active={near?.[0] === name} onClick={() => setPH(v)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <defs>
          <linearGradient id="ph-universal" x1="0" x2="1" y1="0" y2="0">
            {UNIVERSAL.map(([p, c]) => (
              <stop key={p} offset={p / 14} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <text x={L} y={18} fontSize="12" className="fill-rose-600 dark:fill-rose-400" fontWeight="600">
          ← по-кисела
        </text>
        <text x={xAt(7)} y={18} fontSize="12" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontWeight="600">
          неутрална
        </text>
        <text x={R} y={18} fontSize="12" textAnchor="end" className="fill-violet-600 dark:fill-violet-400" fontWeight="600">
          по-основна →
        </text>
        <rect x={L} y={30} width={R - L} height={28} rx={4} fill="url(#ph-universal)" />
        {Array.from({ length: 15 }, (_, i) => (
          <g key={i}>
            <line x1={xAt(i)} x2={xAt(i)} y1={58} y2={64} className="stroke-gray-500" />
            <text x={xAt(i)} y={77} fontSize="11" textAnchor="middle" fill="currentColor">
              {i}
            </text>
          </g>
        ))}
        {/* показалец */}
        <path d={`M ${xAt(pH)} 58 l -7 -12 h 14 z`} className="fill-white stroke-gray-900" strokeWidth="1.5" />
        <line x1={xAt(pH)} x2={xAt(pH)} y1={24} y2={46} className="stroke-gray-900 dark:stroke-white" strokeWidth="2" />

        {TUBES.map((t, i) => {
          const cx = 75 + i * 110;
          return (
            <g key={t.name}>
              <path d={`M ${cx - 16} 100 V 190 a 16 16 0 0 0 32 0 V 100`} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
              <path d={`M ${cx - 15} 130 V 190 a 15 15 0 0 0 30 0 V 130 Z`} fill={t.color(pH)} />
              <line x1={cx - 22} x2={cx + 22} y1={100} y2={100} className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
              <text x={cx} y={232} fontSize="12" textAnchor="middle" fill="currentColor">
                {t.name}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="pH" value={pH} onChange={setPH} min={0} max={14} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: '[H⁺] =', value: `${sci(h)} mol/L`, tone: 'rose' },
            { label: '[OH⁻] =', value: `${sci(oh)} mol/L`, tone: 'blue' },
            { label: 'pOH =', value: fmt(14 - pH, 1) },
          ]}
        />
      </div>
      <Note tone={kind === 'кисела' ? 'rose' : kind === 'основна' ? 'violet' : 'emerald'}>
        {near ? `${near[0][0].toUpperCase()}${near[0].slice(1)}: pH ≈ ${fmt(pH, 1)} – ` : `pH = ${fmt(pH, 1)} – `}
        {kind === 'неутрална'
          ? 'неутрална среда: [H⁺] = [OH⁻] = 10⁻⁷ mol/L.'
          : kind === 'кисела'
            ? `кисела среда: [H⁺] е ${sci(h / oh)} пъти по-голяма от [OH⁻].`
            : `основна среда: [OH⁻] е ${sci(oh / h)} пъти по-голяма от [H⁺].`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери вещество или мести плъзгача. Една единица pH означава 10 пъти по-голяма или по-малка концентрация на H⁺. Стойностите за
        веществата са приблизителни, а цветовете на индикаторите – схематични. Забележи: фенолфталеинът не различава кисела от неутрална
        среда (безцветен е и в двете), а метилоранжът е жълт във всичко над pH ≈ 4,4.
      </p>
    </div>
  );
}
