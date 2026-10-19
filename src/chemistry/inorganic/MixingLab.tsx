import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText } from '../formula';
import { ANION_REAGENTS, ANIONS, byId, CATION_REAGENTS, CATIONS, mix } from './qualitativeData';

const fmt = (v: number) => Number(v.toPrecision(4)).toString().replace('.', ',');

/** Епруветка с разтвор: x – лявата стена, top – горният ръб на течността. */
function Tube({ x, top, tint, label }: { x: number; top: number; tint?: string; label: string }) {
  const w = 34;
  const bottom = 132;
  return (
    <g>
      <path d={`M ${x} ${top} V ${bottom} A ${w / 2} ${w / 2} 0 0 0 ${x + w} ${bottom} V ${top} Z`} fill={tint ?? '#dbeafe'} fillOpacity={tint ? 0.85 : 0.45} />
      <path d={`M ${x} 30 V ${bottom} A ${w / 2} ${w / 2} 0 0 0 ${x + w} ${bottom} V 30`} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
      <text x={x + w / 2} y={170} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
        {label}
      </text>
    </g>
  );
}

/** Смесване на разтвори на две соли: утайка, газ или нищо; йонни уравнения и маса на утайката. */
export default function MixingLab() {
  const [i1, setI1] = useState(0);
  const [i2, setI2] = useState(1);
  const [v1, setV1] = useState(50);
  const [c1, setC1] = useState(0.2);
  const [v2, setV2] = useState(50);
  const [c2, setC2] = useState(0.2);
  const r1 = CATION_REAGENTS[i1];
  const r2 = ANION_REAGENTS[i2];
  const m = mix(r1, r2);
  const cat = byId(CATIONS, r1.cat);
  const an = byId(ANIONS, r2.an);

  // Количества на реагиращите йони и маса на утайката (само при сигурна утайка)
  const nCat = (c1 * v1 * r1.p) / 1000;
  const nAn = (c2 * v2 * r2.q) / 1000;
  const solid = m.kind === 'precipitate' ? m.solid : undefined;
  const xi = solid ? Math.min(nCat / solid.a, nAn / solid.b) : 0;
  const leftCat = solid ? nCat - solid.a * xi : 0;
  const leftAn = solid ? nAn - solid.b * xi : 0;
  const excess = leftCat > 1e-12 ? `${cat.text} – ${fmt(leftCat * 1000)} mmol` : leftAn > 1e-12 ? `${an.text} – ${fmt(leftAn * 1000)} mmol` : 'няма – йоните са точно в отношението от уравнението';

  const hasSolid = m.kind === 'precipitate' || m.kind === 'maybe' || (m.kind === 'color' && m.color);
  const liquid = m.solutionTint ?? r1.tint;
  const result =
    m.kind === 'none'
      ? 'няма видима промяна'
      : m.kind === 'gas'
        ? 'отделя се газ (при затопляне)'
        : m.kind === 'maybe'
          ? `${m.color?.name} утайка – само при по-концентрирани разтвори`
          : m.kind === 'color' && !m.color
            ? 'разтворът покафенява'
            : `${m.color?.name} утайка${m.gas ? ' и газ' : ''}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Разтвор 1 – сол на катиона</p>
      <Buttons>
        {CATION_REAGENTS.map((r, i) => (
          <DiagramButton key={r.f} active={i === i1} onClick={() => setI1(i)}>
            {formulaText(r.f)}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200 mt-3">Разтвор 2 – сол на аниона</p>
      <Buttons>
        {ANION_REAGENTS.map((r, i) => (
          <DiagramButton key={r.f} active={i === i2} onClick={() => setI2(i)}>
            {formulaText(r.f)}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 200" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Tube x={30} top={70} tint={r1.tint} label={`1: ${formulaText(r1.f)}`} />
        <Tube x={110} top={70} label={`2: ${formulaText(r2.f)}`} />
        <text x={88} y={100} fontSize="16" textAnchor="middle" className="fill-gray-500">
          +
        </text>
        <text x={200} y={100} fontSize="18" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        {/* чашата със сместа */}
        <path d="M 250 60 V 150 H 420 V 60" fill={liquid ?? '#dbeafe'} fillOpacity={liquid ? 0.75 : 0.45} />
        {hasSolid && m.color && (
          <g>
            <rect x={251} y={134} width={168} height={16} fill={m.color.fill} stroke="#6b7280" strokeWidth="1" opacity={m.kind === 'maybe' ? 0.5 : 1} />
            {Array.from({ length: m.kind === 'maybe' ? 8 : 26 }, (_, k) => (
              <circle key={k} cx={258 + ((k * 37) % 156)} cy={70 + ((k * 23) % 62)} r={2.8} fill={m.color!.fill} stroke="#6b7280" strokeWidth="0.8" />
            ))}
          </g>
        )}
        {(m.gas || m.kind === 'gas') &&
          [0, 1, 2, 3, 4, 5].map(k => <circle key={k} cx={275 + k * 26} cy={50 - (k % 3) * 9} r={4 + (k % 2)} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="1.2" />)}
        <path d="M 250 25 V 150 H 420 V 25" fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        <text x={335} y={172} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          {result}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="V₁, mL" value={v1} onChange={setV1} min={10} max={100} step={10} tone="blue" />
        <Slider label="c₁, mol/L" value={c1} onChange={v => setC1(Math.round(v * 10) / 10)} min={0.1} max={1} step={0.1} tone="blue" />
        <Slider label="V₂, mL" value={v2} onChange={setV2} min={10} max={100} step={10} tone="rose" />
        <Slider label="c₂, mol/L" value={c2} onChange={v => setC2(Math.round(v * 10) / 10)} min={0.1} max={1} step={0.1} tone="rose" />
      </Sliders>

      <div className="mt-3">
        <Readout
          items={
            m.full
              ? [
                  { label: 'уравнение:', value: m.full, tone: 'blue' },
                  { label: 'съкратено йонно:', value: m.net, tone: 'emerald' },
                  ...(solid
                    ? [
                        { label: 'йони:', value: `${cat.text} – ${fmt(nCat * 1000)} mmol, ${an.text} – ${fmt(nAn * 1000)} mmol` },
                        { label: `утайка ${formulaText(solid.f)}:`, value: `${fmt(xi * 1000)} mmol · ${fmt(solid.M)} g/mol = ${fmt(xi * solid.M)} g`, tone: 'amber' as const },
                        { label: 'в излишък:', value: excess },
                      ]
                    : []),
                ]
              : [{ label: 'йоните в сместа:', value: [cat, byId(ANIONS, r1.an), byId(CATIONS, r2.cat), an].map(i => i.text).join(', ') }]
          }
        />
      </div>
      <Note tone={m.kind === 'none' ? 'blue' : m.kind === 'maybe' ? 'amber' : 'emerald'}>{m.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Реакцията между йоните протича, когато се образува утайка, газ или слаб електролит (например вода). Йоните, които не
        участват – тук {[byId(ANIONS, r1.an), byId(CATIONS, r2.cat)].map(i => i.text).join(' и ')} – остават в разтвора и не се пишат в
        съкратеното уравнение.
      </p>
    </div>
  );
}
