import { useRef, useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

// Пробите са типични (закръглени) стойности; нормите се различават малко според лабораторията.
type Sample = { name: string; hct: number; rbc: number; hb: number; buffy: number; note: string };
const SAMPLES: Sample[] = [
  { name: 'здрав мъж', hct: 0.45, rbc: 5.0, hb: 150, buffy: 0.01, note: 'Нормата за мъже е около 40–50 %, за жени – около 36–46 %.' },
  { name: 'здрава жена', hct: 0.4, rbc: 4.5, hb: 135, buffy: 0.01, note: 'При жените хематокритът е малко по-нисък – тестостеронът засилва образуването на еритроцити, а менструацията отнема желязо.' },
  { name: 'липса на желязо', hct: 0.3, rbc: 4.2, hb: 90, buffy: 0.01, note: 'Желязодефицитна анемия: еритроцитите са малки (MCV < 80 fL) и бледи – в тях има по-малко хемоглобин.' },
  { name: 'липса на B₁₂', hct: 0.3, rbc: 2.7, hb: 100, buffy: 0.008, note: 'Без витамин B₁₂ (или фолиева киселина) клетките в костния мозък се делят трудно: еритроцитите са малко, но големи (MCV > 100 fL).' },
  { name: 'живее на 4000 m', hct: 0.55, rbc: 6.1, hb: 185, buffy: 0.01, note: 'При недостиг на кислород бъбреците отделят повече еритропоетин и костният мозък прави повече еритроцити.' },
  { name: 'обезводняване', hct: 0.52, rbc: 5.8, hb: 173, buffy: 0.01, note: 'Еритроцитите не са се увеличили – плазмата е намаляла. Затова след пиене на вода хематокритът се връща.' },
  { name: 'левкемия', hct: 0.3, rbc: 3.4, hb: 100, buffy: 0.08, note: 'Огромно количество бели кръвни клетки – белият слой е дебел, а еритроцитите са малко, защото костният мозък е „зает“.' },
];

const T_FULL = 5; // min центрофугиране
const TAU = 0.8; // min – колко бързо се утаяват клетките

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');

// епруветката
const TX = 400;
const TY = 30;
const TW = 34;
const TH = 260;

/** Микрохематокрит: центрофуга, слоевете на кръвта и показателите на еритроцитите. */
export default function HematocritLab() {
  const [k, setK] = useState(0);
  const [t, setT] = useState(T_FULL);
  const [spinning, setSpinning] = useState(false);
  const tRef = useRef(t);
  const [angle, setAngle] = useState(0);

  useAnimationFrame(spinning, dt => {
    // 5 min центрофугиране за около 4 s
    tRef.current = Math.min(T_FULL, tRef.current + dt * 1.25);
    setT(tRef.current);
    setAngle(a => (a + dt * 900) % 360);
    if (tRef.current >= T_FULL) setSpinning(false);
  });

  const s = SAMPLES[k];
  const settle = Math.exp(-t / TAU);
  // видимият стълб еритроцити: в началото е цялата епруветка, после се свива до истинския хематокрит
  const red = s.hct + (1 - s.hct - s.buffy) * settle;
  const buffy = s.buffy * (1 - settle);
  const done = t >= T_FULL - 0.01;
  const mcv = (s.hct * 1000) / s.rbc; // fL
  const mchc = s.hb / s.hct; // g/L
  const o2 = 1.34 * s.hb; // mL O₂ на литър кръв

  const y = (frac: number) => TY + TH * (1 - frac);

  const start = () => {
    tRef.current = 0;
    setT(0);
    setSpinning(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* центрофугата */}
        <g transform={`translate(150 160) rotate(${angle})`}>
          <circle r={110} className="fill-gray-100 dark:fill-gray-700" stroke="#64748b" strokeWidth={2} />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <rect x={18} y={-4} width={80} height={8} rx={3} fill={i === 0 ? '#e11d48' : '#cbd5e1'} opacity={i === 0 ? 0.9 : 0.6} />
            </g>
          ))}
          <circle r={14} fill="#475569" />
        </g>
        <text x={150} y={296} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {spinning ? 'около 12 000 оборота в минута…' : 'центрофуга с капилярни тръбички'}
        </text>

        {/* скала */}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={TX + TW + 4} x2={TX + TW + (i % 5 === 0 ? 16 : 10)} y1={y(i / 10)} y2={y(i / 10)} stroke="#64748b" />
            <text x={TX + TW + 20} y={y(i / 10) + 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              {i * 10} %
            </text>
          </g>
        ))}
        {/* епруветката */}
        <rect x={TX} y={y(1)} width={TW} height={TH * (1 - red - buffy)} fill="#fde68a" />
        <rect x={TX} y={y(red + buffy)} width={TW} height={TH * buffy} fill="#f8fafc" />
        <rect x={TX} y={y(red)} width={TW} height={TH * red} fill="#b91c1c" />
        <rect x={TX} y={TY + TH} width={TW} height={12} fill="#94a3b8" />
        <rect x={TX} y={TY} width={TW} height={TH + 12} rx={4} fill="none" stroke="#475569" strokeWidth={1.5} />
        <line x1={TX - 30} x2={TX + TW + 4} y1={y(red)} y2={y(red)} stroke="#e11d48" strokeDasharray="3 3" />
        <text x={TX - 34} y={y(red) + 4} fontSize="11" textAnchor="end" fill="#e11d48">
          {fmt(red * 100)} %
        </text>
        {t > 0.5 && (
          <g fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            <text x={TX + TW + 64} y={y((1 + red + buffy) / 2) + 4}>плазма</text>
            <text x={TX + TW + 64} y={y(red + buffy / 2) + 4}>левкоцити и тромбоцити</text>
            <text x={TX + TW + 64} y={y(red / 2) + 4}>еритроцити</text>
          </g>
        )}
        <text x={TX + TW / 2} y={18} fontSize="11" textAnchor="middle" fill="currentColor">
          {fmt(t, 1)} min
        </text>
      </LabSvg>

      <Buttons>
        {SAMPLES.map((x, i) => (
          <DiagramButton key={x.name} active={k === i} onClick={() => setK(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={spinning} onClick={start}>
          ▶ центрофугирай
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="t, min" value={Math.round(t * 10) / 10} onChange={v => { tRef.current = v; setT(v); setSpinning(false); }} min={0} max={T_FULL} step={0.1} tone="rose" />
      </Sliders>

      <Readout
        items={[
          { label: 'хематокрит', value: done ? `${fmt(s.hct * 100)} %` : 'още се утаява…', tone: 'rose' },
          { label: 'еритроцити', value: `${fmt(s.rbc, 1)} · 10¹²/L`, tone: 'blue' },
          { label: 'хемоглобин', value: `${s.hb} g/L`, tone: 'violet' },
          { label: 'MCV', value: `${fmt(mcv)} fL`, tone: 'emerald' },
          { label: 'MCHC', value: `${fmt(mchc)} g/L`, tone: 'amber' },
          { label: 'O₂ в 1 L кръв', value: `≈ ${fmt(o2)} mL`, tone: 'gray' },
        ]}
      />
      <Formula>
        MCV = хематокрит : брой еритроцити = {fmt(s.hct, 2)} L/L : {fmt(s.rbc, 1)} · 10¹²/L = {fmt(mcv)} · 10⁻¹⁵ L = {fmt(mcv)} fL
      </Formula>
      <Note tone="rose">{done ? s.note : 'Преди да свърши центрофугирането, клетките не са се слегнали и стълбът еритроцити изглежда по-висок – хематокритът се чете накрая.'}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Хематокритът е частта от обема на кръвта, която заемат еритроцитите. От него и броя на клетките се смята средният обем
        на един еритроцит (MCV), а от хемоглобина – колко плътно са пълни с него (MCHC). 1 g хемоглобин свързва до около 1,34 mL
        кислород – повече за това в урока за дишането. Стойностите в пробите са типични, не от истински пациенти.
      </p>
    </div>
  );
}
