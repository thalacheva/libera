import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

type Kind = 'adult' | 'fetal' | 'myo';
/** P50 (kPa) и коефициент на Хил при pH 7,4 и 37 °C. */
const KINDS: Record<Kind, { label: string; p50: number; n: number }> = {
  adult: { label: 'хемоглобин на възрастен', p50: 3.5, n: 2.7 },
  fetal: { label: 'фетален хемоглобин', p50: 2.5, n: 2.7 },
  myo: { label: 'миоглобин', p50: 0.37, n: 1 },
};
/** PO₂ в алвеолите и артериалната кръв, kPa. */
const P_ART = 13.3;
/** Хемоглобин в кръвта, g/L; 1 g Hb свързва до 1,34 mL O₂; разтворен O₂ – 0,225 mL/L на kPa. */
const HB = 150;
const HUFNER = 1.34;
const DISSOLVED = 0.225;

const hill = (p: number, p50: number, n: number) => (p <= 0 ? 0 : p ** n / (p ** n + p50 ** n));
/** pH на кръвта по Хендерсон–Хаселбалх при 24 mmol/L HCO₃⁻. */
const phOf = (pco2: number) => 6.1 + Math.log10(24 / (0.23 * pco2));

function p50Of(kind: Kind, pco2: number, temp: number, bpg: number, co: number) {
  const k = KINDS[kind];
  if (kind === 'myo') return k.p50; // миоглобинът няма ефект на Бор
  const bohr = 10 ** (-0.48 * (phOf(pco2) - 7.4)) * 10 ** (0.024 * (temp - 37));
  // феталният хемоглобин почти не свързва 2,3-БФГ
  const b = (kind === 'fetal' ? 0.05 : 0.2) * (bpg - 5);
  return (k.p50 * bohr + b) * (1 - co) ** 0.8;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// Чертежът: PO₂ 0–14 kPa, насищане 0–100 %
const X0 = 60;
const XW = 500;
const Y0 = 250;
const YH = 220;
const P_MAX = 14;
const px = (p: number) => X0 + (p / P_MAX) * XW;
const py = (s: number) => Y0 - s * YH;

function path(f: (p: number) => number) {
  const pts: string[] = [];
  for (let k = 0; k <= 280; k++) {
    const p = (k / 280) * P_MAX;
    pts.push(`${px(p).toFixed(1)},${py(f(p)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Кислородна дисоциационна крива: ефект на Бор, температура, 2,3-БФГ, CO, фетален хемоглобин и миоглобин; колко O₂ се отдава в тъканите. */
export default function DissociationLab() {
  const [kind, setKind] = useState<Kind>('adult');
  const [pTis, setPTis] = useState(5.3);
  const [pco2, setPco2] = useState(6.1);
  const [temp, setTemp] = useState(37);
  const [bpg, setBpg] = useState(5);
  const [coPct, setCoPct] = useState(0);
  const co = coPct / 100;

  const k = KINDS[kind];
  const p50n = KINDS[kind].p50 * (1 - co) ** 0.8;
  const p50 = p50Of(kind, pco2, temp, bpg, co);
  const ph = phOf(pco2);
  // в белите дробове: pH 7,4, 37 °C; в тъканите – избраните условия
  const sArt = hill(P_ART, p50n, k.n) * (1 - co);
  const sTis = hill(pTis, p50, k.n) * (1 - co);
  const cArt = HUFNER * HB * sArt + DISSOLVED * P_ART;
  const cTis = HUFNER * HB * sTis + DISSOLVED * pTis;
  const given = cArt - cTis;
  const shifted = Math.abs(p50 - p50n) > 0.03;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 0.25, 0.5, 0.75, 1].map(s => (
          <g key={s}>
            <line x1={X0} x2={X0 + XW} y1={py(s)} y2={py(s)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={py(s) + 4} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {s * 100}
            </text>
          </g>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <text key={i} x={px(i * 2)} y={Y0 + 16} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {i * 2}
          </text>
        ))}
        <text x={X0 + XW} y={Y0 + 32} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          PO₂, kPa
        </text>
        <text x={X0 - 50} y={18} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          насищане на хемоглобина, %
        </text>

        {/* алвеоли и тъкан */}
        <line x1={px(P_ART)} x2={px(P_ART)} y1={py(0)} y2={py(1)} stroke="#e11d48" strokeDasharray="3 4" />
        <text x={px(P_ART)} y={py(0) - 6} fontSize="11" textAnchor="end" fill="#e11d48">
          алвеоли ▸
        </text>
        <line x1={px(pTis)} x2={px(pTis)} y1={py(0)} y2={py(1)} stroke="#2563eb" strokeDasharray="3 4" />
        <text x={px(pTis) + 4} y={py(0) - 6} fontSize="11" fill="#2563eb">
          ◂ тъкан
        </text>

        {/* за сравнение: другите две криви и нормалната крива на избрания вид */}
        {(Object.keys(KINDS) as Kind[])
          .filter(o => o !== kind)
          .map(o => (
            <polyline key={o} points={path(p => hill(p, KINDS[o].p50, KINDS[o].n))} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth={1.5} />
          ))}
        {shifted && <polyline points={path(p => hill(p, p50n, k.n) * (1 - co))} fill="none" stroke="#e11d48" strokeWidth={1.5} strokeDasharray="5 4" />}
        <polyline points={path(p => hill(p, p50, k.n) * (1 - co))} fill="none" stroke="#2563eb" strokeWidth={2.6} />

        {/* P50 */}
        <line x1={X0} x2={px(p50)} y1={py(0.5 * (1 - co))} y2={py(0.5 * (1 - co))} stroke="#7c3aed" strokeDasharray="2 3" />
        <line x1={px(p50)} x2={px(p50)} y1={py(0.5 * (1 - co))} y2={py(0)} stroke="#7c3aed" strokeDasharray="2 3" />
        <text x={px(p50) + 4} y={py(0.5 * (1 - co)) + 14} fontSize="11" fill="#7c3aed">
          P50 = {fmt(p50, 2)}
        </text>

        {/* точките и отдаденото */}
        <circle cx={px(P_ART)} cy={py(sArt)} r={5} fill="#e11d48" />
        <circle cx={px(pTis)} cy={py(sTis)} r={5} fill="#2563eb" />
        <line x1={590} x2={590} y1={py(sArt)} y2={py(sTis)} stroke="#059669" strokeWidth={4} />
        <text x={596} y={(py(sArt) + py(sTis)) / 2 - 2} fontSize="11" fill="#059669">
          отдава
        </text>
        <text x={596} y={(py(sArt) + py(sTis)) / 2 + 12} fontSize="11" fill="#059669">
          {Math.round((sArt - sTis) * 100)} %
        </text>
      </LabSvg>

      <Buttons>
        {(Object.keys(KINDS) as Kind[]).map(o => (
          <DiagramButton key={o} active={kind === o} onClick={() => setKind(o)}>
            {KINDS[o].label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={pTis === 5.3 && pco2 === 6.1 && temp === 37} onClick={() => { setPTis(5.3); setPco2(6.1); setTemp(37); }}>
          😌 мускул в покой
        </DiagramButton>
        <DiagramButton active={pTis === 2.5 && pco2 === 8 && temp === 39} onClick={() => { setPTis(2.5); setPco2(8); setTemp(39); }}>
          🏋️ работещ мускул
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="PO₂" value={pTis} onChange={setPTis} min={1} max={10} step={0.1} tone="blue" />
        <Slider label="PCO₂" value={pco2} onChange={setPco2} min={3} max={10} step={0.1} tone="amber" />
        <Slider label="T, °C" value={temp} onChange={setTemp} min={34} max={42} step={0.5} tone="rose" />
        <Slider label="2,3-БФГ" value={bpg} onChange={setBpg} min={3} max={9} step={0.5} tone="violet" />
        <Slider label="COHb, %" value={coPct} onChange={setCoPct} min={0} max={60} step={5} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'pH в тъканта', value: fmt(ph, 2), tone: 'amber' },
          { label: 'в артериите', value: `${Math.round(sArt * 100)} % · ${Math.round(cArt)} mL O₂/L`, tone: 'rose' },
          { label: 'в тъканта', value: `${Math.round(sTis * 100)} % · ${Math.round(cTis)} mL O₂/L`, tone: 'blue' },
          { label: 'отдадени', value: `${Math.round(given)} mL O₂ на L кръв`, tone: 'emerald' },
        ]}
      />
      <Formula>
        S = PO₂ⁿ / (PO₂ⁿ + P50ⁿ), n = {fmt(k.n)}; C = 1,34 · {HB} g/L · S + 0,225 · PO₂
      </Formula>
      <Note tone="emerald">
        {kind === 'myo'
          ? 'Миоглобинът е наситен почти напълно дори при 2–3 kPa и отдава кислорода си чак когато мускулът остане почти без O₂. Той е резерв, а не преносител – кривата му е хипербола, защото има само една верига и един хем.'
          : kind === 'fetal'
            ? 'Феталният хемоглобин е по-вляво: при еднакво PO₂ в плацентата той е по-наситен от хемоглобина на майката, затова кислородът минава от майката към плода.'
            : coPct >= 20
              ? 'Въглеродният оксид заема местата за O₂ и освен това измества кривата наляво – останалият хемоглобин държи кислорода по-здраво. Затова отравянето с CO е много по-опасно от анемия със същия „липсващ“ хемоглобин.'
              : p50 > p50n + 0.3
                ? 'Кривата е изместена надясно (ефект на Бор): повече CO₂, по-кисело и по-топло – хемоглобинът отдава повече кислород точно там, където мускулът работи.'
                : p50 < p50n - 0.3
                  ? 'Кривата е изместена наляво: хемоглобинът свързва O₂ по-здраво и отдава по-малко в тъканите.'
                  : 'В покой кръвта отдава около една четвърт от кислорода си. Стръмната част на S-кривата е точно в областта на PO₂ в тъканите: малък спад на PO₂ освобождава много O₂.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: уравнение на Хил с P50 = 3,5 kPa за възрастен (около 27 mmHg), 2,5 kPa за фетален хемоглобин и 0,37 kPa за
        миоглобин. В белите дробове условията са нормални (червената пунктирна крива), в тъканта – избраните: pH се смята от PCO₂, а
        P50 расте при по-ниско pH, по-висока температура и повече 2,3-БФГ. Сивите криви са другите два белтъка. Числата са
        приблизителни; в истинския опит влиянието на CO и 2,3-БФГ е по-сложно.
      </p>
    </div>
  );
}
