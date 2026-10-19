import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Енергийната ос: от −320 до +340 kJ, реагентите са на нула
const E_MIN = -320;
const E_MAX = 340;
const Y_TOP = 30;
const Y_BOTTOM = 230;
const y = (E: number) => Y_BOTTOM - ((E - E_MIN) / (E_MAX - E_MIN)) * (Y_BOTTOM - Y_TOP);

const X_R = 150; // край на площадката на реагентите
const X_PEAK = 250;
const X_P = 350; // начало на площадката на продуктите

/** Профилът: площадка – гърбица (активиран комплекс) – площадка. */
const profile = (peak: number, dH: number) =>
  `M 70 ${y(0)} L ${X_R} ${y(0)} C ${X_R + 45} ${y(0)}, ${X_PEAK - 45} ${y(peak)}, ${X_PEAK} ${y(peak)} C ${X_PEAK + 45} ${y(peak)}, ${X_P - 45} ${y(dH)}, ${X_P} ${y(dH)} L 440 ${y(dH)}`;

/** Вертикална стрелка с надпис отстрани. */
function Arrow({ x, from, to, label, value, className, side = 'left' }: { x: number; from: number; to: number; label: string; value: string; className: string; side?: 'left' | 'right' }) {
  const [y1, y2] = [y(from), y(to)];
  const dir = y2 < y1 ? 1 : -1;
  if (Math.abs(y2 - y1) < 10) return null;
  return (
    <g className={className}>
      <line x1={x} x2={x} y1={y1} y2={y2 + dir * 6} stroke="currentColor" strokeWidth="2" />
      <path d={`M ${x - 5} ${y2 + dir * 8} L ${x} ${y2} L ${x + 5} ${y2 + dir * 8} Z`} fill="currentColor" />
      <text x={side === 'left' ? x - 7 : x + 7} y={(y1 + y2) / 2 - 3} fontSize="13" fontWeight="700" textAnchor={side === 'left' ? 'end' : 'start'} fill="currentColor">
        {label}
      </text>
      <text x={side === 'left' ? x - 7 : x + 7} y={(y1 + y2) / 2 + 12} fontSize="12" textAnchor={side === 'left' ? 'end' : 'start'} fill="currentColor">
        {value}
      </text>
    </g>
  );
}

const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}`;

/** Енергийна диаграма на реакция: ΔH, енергия на активиране и действие на катализатор. */
export default function EnergyProfileLab() {
  const [dH, setDH] = useState(-180);
  const [ea, setEa] = useState(160);
  const [cat, setCat] = useState(false);

  // Върхът не може да е под продуктите – иначе обратната реакция няма бариера
  const peak = Math.max(ea, dH + 20);
  // Катализаторът снижава бариерата приблизително наполовина над по-високото от двете нива
  const base = Math.max(0, dH);
  const catPeak = Math.round(base + (peak - base) * 0.5);
  const exo = dH < 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 260" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* ос на енергията */}
        <line x1={40} x2={40} y1={Y_BOTTOM + 6} y2={Y_TOP - 12} className="stroke-gray-400" strokeWidth="1.5" />
        <path d={`M 35 ${Y_TOP - 6} L 40 ${Y_TOP - 16} L 45 ${Y_TOP - 6} Z`} className="fill-gray-400" />
        <text x={48} y={Y_TOP - 8} fontSize="12" className="fill-gray-500">
          енергия (енталпия)
        </text>
        <text x={440} y={Y_BOTTOM + 22} fontSize="12" textAnchor="end" className="fill-gray-500">
          ход на реакцията →
        </text>

        {/* нивата на реагентите и продуктите */}
        <line x1={X_R} x2={440} y1={y(0)} y2={y(0)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <line x1={X_R - 10} x2={X_PEAK} y1={y(peak)} y2={y(peak)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />

        {cat && <path d={profile(catPeak, dH)} fill="none" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 4" />}
        <path d={profile(peak, dH)} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="3" />

        <text x={72} y={y(0) + 18} fontSize="13" fontWeight="600" fill="currentColor">
          реагенти
        </text>
        <text x={X_P} y={y(dH) + (exo ? 18 : -8)} fontSize="13" fontWeight="600" fill="currentColor">
          продукти
        </text>
        <text x={X_PEAK} y={y(peak) - 8} fontSize="11" textAnchor="middle" className="fill-gray-500">
          активиран комплекс
        </text>

        <Arrow x={X_R - 10} from={0} to={peak} label="Eₐ" value={`${peak}`} className="text-rose-600 dark:text-rose-400" />
        <Arrow x={415} from={0} to={dH} label="ΔH" value={fmt(dH)} className={exo ? 'text-sky-600 dark:text-sky-400' : 'text-orange-600 dark:text-orange-400'} side="right" />
      </LabSvg>

      <Sliders>
        <Slider label="ΔH, kJ" value={dH} onChange={setDH} min={-300} max={300} step={10} tone="blue" />
        <Slider label="Eₐ, kJ" value={ea} onChange={setEa} min={20} max={320} step={10} tone="rose" />
      </Sliders>
      <Buttons>
        <DiagramButton active={!cat} onClick={() => setCat(false)}>
          без катализатор
        </DiagramButton>
        <DiagramButton active={cat} onClick={() => setCat(true)}>
          с катализатор
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ΔH =', value: `${fmt(dH)} kJ`, tone: exo ? 'blue' : 'amber' },
            { label: 'Eₐ (права) =', value: cat ? `${catPeak} kJ (без катализатор ${peak})` : `${peak} kJ`, tone: 'rose' },
            { label: 'Eₐ (обратна) =', value: `${(cat ? catPeak : peak) - dH} kJ` },
          ]}
        />
      </div>
      <Note tone={exo ? 'blue' : dH > 0 ? 'amber' : 'gray'}>
        {exo
          ? 'Екзотермична реакция: продуктите са по-ниско от реагентите, разликата се отделя като топлина (ΔH < 0).'
          : dH > 0
            ? 'Ендотермична реакция: продуктите са по-високо, системата поглъща топлина от околната среда (ΔH > 0).'
            : 'ΔH = 0 – реакцията нито отделя, нито поглъща топлина.'}
        {peak > ea && ' Върхът е вдигнат – бариерата трябва да е над продуктите.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 ΔH зависи само от началото и края на пътя. Енергията на активиране е „хълмът“ по пътя – колкото е по-висок, толкова по-бавна
        е реакцията. Катализаторът (зелената крива) прокарва по-нисък път, но не мести нивата на реагентите и продуктите – ΔH остава
        същата. За скоростта – в урока „Скорост на реакцията“.
      </p>
    </div>
  );
}
