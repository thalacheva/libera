import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { colorAt, UNIVERSAL } from './phColors';
import { fmt, phOf } from './ph';

const KA = 10 ** -4.76; // оцетна киселина при 25 °C
const VOL = 0.1; // 100 mL

/** Чаша с разтвор, оцветен с универсален индикатор, и pH преди → след. */
function Beaker({ x, title, before, after }: { x: number; title: string; before: number; after: number }) {
  return (
    <g>
      <text x={x + 60} y={16} fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">
        {title}
      </text>
      <path d={`M ${x} 28 V 138 a 8 8 0 0 0 8 8 H ${x + 112} a 8 8 0 0 0 8 -8 V 28`} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
      <path d={`M ${x + 2} 60 V 137 a 7 7 0 0 0 7 7 H ${x + 111} a 7 7 0 0 0 7 -7 V 60 Z`} fill={colorAt(UNIVERSAL, after)} />
      <text x={x + 60} y={170} fontSize="13" textAnchor="middle" fill="currentColor">
        pH {fmt(before)} → <tspan fontWeight="700">{fmt(after)}</tspan>
      </text>
      <text x={x + 60} y={190} fontSize="12" textAnchor="middle" className={Math.abs(after - before) > 1 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-emerald-600 dark:fill-emerald-400'}>
        ΔpH = {after - before >= 0 ? '+' : '−'}
        {fmt(Math.abs(after - before))}
      </text>
    </g>
  );
}

/** Слаба киселина и буфер: оцетна киселина + натриев ацетат срещу чиста вода при добавяне на HCl или NaOH. */
export default function BufferLab() {
  const [ca, setCa] = useState(0.1);
  const [cs, setCs] = useState(0.1);
  const [add, setAdd] = useState(2);
  const [base, setBase] = useState(false);

  // добавеното вещество в mmol → mol/L в 100 mL (обемът на добавката пренебрегваме)
  const cAdd = add / 1000 / VOL;
  const na = cs + (base ? cAdd : 0);
  const cl = base ? 0 : cAdd;
  const before = phOf(ca + cs, KA, cs);
  const after = phOf(ca + cs, KA, na, cl);
  const waterBefore = 7;
  const waterAfter = phOf(0, KA, base ? cAdd : 0, base ? 0 : cAdd);

  // дял на дисоциираната форма A⁻ преди добавката
  const h = 10 ** -before;
  const alpha = ca > 0 && cs === 0 ? KA / (KA + h) : null;
  const isBuffer = ca > 0 && cs > 0;
  // количествата HA и A⁻ в mmol след добавката (приближено – цялата добавка реагира)
  const nHA = Math.max(0, (ca * VOL * 1000) + (base ? -add : add));
  const nA = Math.max(0, (cs * VOL * 1000) + (base ? add : -add));
  const exhausted = isBuffer && (base ? add >= ca * VOL * 1000 : add >= cs * VOL * 1000);
  const hh = isBuffer ? 4.76 + Math.log10(cs / ca) : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!base} onClick={() => setBase(false)}>
          добавяме HCl
        </DiagramButton>
        <DiagramButton active={base} onClick={() => setBase(true)}>
          добавяме NaOH
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Beaker x={40} title="100 mL вода" before={waterBefore} after={waterAfter} />
        <Beaker x={300} title="100 mL разтвор" before={before} after={after} />
        <text x={240} y={92} fontSize="13" textAnchor="middle" className="fill-gray-500">
          + {fmt(add, 1)} mmol
        </text>
        <text x={240} y={110} fontSize="13" textAnchor="middle" className="fill-gray-500">
          {base ? 'NaOH' : 'HCl'} →
        </text>
        {/* количествата в разтвора след добавката */}
        {[
          { label: 'CH₃COOH', n: nHA, cls: 'fill-rose-400' },
          { label: 'CH₃COO⁻', n: nA, cls: 'fill-sky-400' },
        ].map((b, i) => (
          <g key={b.label}>
            <text x={170} y={215 + i * 22} fontSize="12" textAnchor="end" fill="currentColor">
              {b.label}
            </text>
            <rect x={176} y={205 + i * 22} width={Math.min(b.n, 25) * 9} height={14} className={b.cls} />
            <text x={182 + Math.min(b.n, 25) * 9} y={216 + i * 22} fontSize="11" fill="currentColor">
              {fmt(b.n, 1)} mmol
            </text>
          </g>
        ))}
      </LabSvg>

      <Sliders>
        <Slider label="c(HA)" value={ca} onChange={setCa} min={0} max={0.2} step={0.01} tone="rose" />
        <Slider label="c(A⁻)" value={cs} onChange={setCs} min={0} max={0.2} step={0.01} tone="blue" />
        <Slider label="mmol" value={add} onChange={setAdd} min={0} max={5} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'pH на разтвора:', value: fmt(before), tone: 'violet' },
            ...(hh !== null ? [{ label: 'Хендерсън–Хаселбалх:', value: `4,76 + lg(${fmt(cs)}/${fmt(ca)}) = ${fmt(hh)}`, tone: 'blue' as const }] : []),
            ...(alpha !== null ? [{ label: 'степен на дисоциация α:', value: `${fmt(alpha * 100, 2)} %`, tone: 'rose' as const }] : []),
          ]}
        />
      </div>
      <Note tone={!isBuffer ? 'amber' : exhausted ? 'rose' : 'emerald'}>
        {!isBuffer
          ? ca > 0
            ? `Само оцетна киселина – не е буфер: малко HCl или NaOH променя pH много повече. Дисоциирани са едва ${fmt((alpha ?? 0) * 100, 1)}% от молекулите.`
            : cs > 0
              ? 'Само натриев ацетат – слабо основен разтвор (ацетатът хидролизира), но не и буфер.'
              : 'Чиста вода – добави киселина или сол.'
          : exhausted
            ? 'Буферът е изчерпан: добавката е повече от компонента, който я неутрализира, и pH се променя рязко.'
            : `Буфер: ${base ? 'OH⁻ се свързва с CH₃COOH' : 'H⁺ се свързва с CH₃COO⁻'} и pH се променя само с ${fmt(Math.abs(after - before))}, а във водата – с ${fmt(Math.abs(waterAfter - waterBefore))}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 HA е оцетната киселина, A⁻ – ацетатът от натриевия ацетат. Чашите са оцветени с универсален индикатор. Концентрациите са в mol/L, добавката е в милимолове (като концентриран разтвор – промяната на обема пренебрегваме). pH е
        пресметнато точно. Буферът задържа pH най-добре, когато двата компонента са в близки количества – тогава pH ≈ pKa = 4,76. Нулирай
        натриевия ацетат, за да видиш степента на дисоциация на чистата оцетна киселина.
      </p>
    </div>
  );
}
