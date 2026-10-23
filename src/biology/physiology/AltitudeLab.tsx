import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Атмосферно налягане на морското равнище, kPa; приблизителна скала на височината, m. */
const P0 = 101.3;
const H_SCALE = 8000;
/** Налягане на водните пари в дихателните пътища при 37 °C, kPa. */
const P_H2O = 6.3;
const F_O2 = 0.2095;
/** Дихателен коефициент (CO₂ издишан / O₂ поет). */
const RQ = 0.8;
const EVEREST = 8849;

type Mode = 'none' | 'hv' | 'acc';
const MODES: Record<Mode, { label: string; hb: number }> = {
  none: { label: 'без хипервентилация', hb: 150 },
  hv: { label: 'хипервентилация (часове)', hb: 150 },
  acc: { label: 'аклиматизация (седмици)', hb: 180 },
};

const PLACES = [
  { name: 'София', h: 550 },
  { name: 'Мусала', h: 2925 },
  { name: 'Ла Пас', h: 3640 },
  { name: 'Монблан', h: 4806 },
  { name: 'Еверест', h: EVEREST },
];

const sat = (p: number) => (p <= 0 ? 0 : p ** 2.7 / (p ** 2.7 + 3.5 ** 2.7));
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

function model(h: number, mode: Mode) {
  const pb = P0 * Math.exp(-h / H_SCALE);
  const dry = F_O2 * pb;
  const insp = F_O2 * (pb - P_H2O);
  // при хипоксия дишането се учестява и PCO₂ в алвеолите пада – до около 1 kPa на върха на Еверест
  const paco2 = mode === 'none' ? 5.3 : 5.3 - 4.3 * Math.min(1, Math.max(0, (h - 1000) / (EVEREST - 1000)));
  const alv = Math.max(0, insp - paco2 / RQ);
  const art = Math.max(0, alv - 0.5);
  const s = sat(art);
  const hb = MODES[mode].hb;
  const content = 1.34 * hb * s + 0.225 * art;
  return { pb, dry, insp, paco2, alv, art, s, content };
}

// Чертежът: планина вляво, стълбове вдясно
const MX0 = 20;
const MW = 250;
const MY0 = 260;
const MH = 220;
const my = (h: number) => MY0 - (h / 9000) * MH;
const BX0 = 330;
const BW = 60;
const BY0 = 250;
const BH = 200;
const P_MAX = 22;
const by = (p: number) => BY0 - (p / P_MAX) * BH;

/** Каскада на кислорода: от въздуха до артериите на различна височина; хипервентилация и аклиматизация. */
export default function AltitudeLab() {
  const [h, setH] = useState(2925);
  const [mode, setMode] = useState<Mode>('hv');
  const m = model(h, mode);
  const sea = model(0, mode);

  const bars = [
    { label: 'въздух', p: m.dry, color: '#38bdf8' },
    { label: 'трахея', p: m.insp, color: '#60a5fa' },
    { label: 'алвеоли', p: m.alv, color: '#a78bfa' },
    { label: 'артерии', p: m.art, color: '#e11d48' },
  ];
  // силует на планината
  const ridge = `M ${MX0} ${MY0} L ${MX0 + 40} ${my(1500)} L ${MX0 + 70} ${my(1200)} L ${MX0 + 120} ${my(5200)} L ${MX0 + 140} ${my(4600)} L ${MX0 + 180} ${my(EVEREST)} L ${MX0 + 215} ${my(6500)} L ${MX0 + MW} ${my(3000)} L ${MX0 + MW} ${MY0} Z`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* планината */}
        <path d={ridge} className="fill-slate-300 dark:fill-slate-600" />
        <path d={`M ${MX0 + 165} ${my(7600)} L ${MX0 + 180} ${my(EVEREST)} L ${MX0 + 198} ${my(7500)} Z`} fill="white" />
        {PLACES.map(pl => (
          <g key={pl.name}>
            <line x1={MX0 + MW + 2} x2={MX0 + MW + 8} y1={my(pl.h)} y2={my(pl.h)} className="stroke-gray-500" />
            <text x={MX0 + MW + 10} y={my(pl.h) + 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              {pl.name}
            </text>
          </g>
        ))}
        <line x1={MX0} x2={MX0 + MW} y1={my(h)} y2={my(h)} stroke="#e11d48" strokeDasharray="4 3" />
        <text x={MX0 + 4} y={my(h) - 5} fontSize="12" fontWeight="700" fill="#e11d48">
          🧗 {h} m · {fmt(m.pb)} kPa
        </text>
        {h >= 8000 && (
          <text x={MX0 + 4} y={22} fontSize="11" fill="#e11d48">
            „зона на смъртта“ над 8000 m
          </text>
        )}

        {/* стълбове PO₂ */}
        <text x={BX0} y={18} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          PO₂, kPa (сивото – на морското равнище)
        </text>
        {[0, 5, 10, 15, 20].map(p => (
          <g key={p}>
            <line x1={BX0} x2={BX0 + 4 * (BW + 14)} y1={by(p)} y2={by(p)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={BX0 - 4} y={by(p) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {p}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = BX0 + 8 + i * (BW + 14);
          const ref = [sea.dry, sea.insp, sea.alv, sea.art][i];
          return (
            <g key={b.label}>
              <rect x={x} y={by(ref)} width={BW} height={BY0 - by(ref)} className="fill-gray-200 dark:fill-gray-700" />
              <rect x={x + 8} y={by(b.p)} width={BW - 16} height={BY0 - by(b.p)} fill={b.color} />
              <text x={x + BW / 2} y={by(b.p) - 4} fontSize="11" textAnchor="middle" fill="currentColor">
                {fmt(b.p)}
              </text>
              <text x={x + BW / 2} y={BY0 + 14} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {b.label}
              </text>
            </g>
          );
        })}
        {/* насищане */}
        <text x={BX0 + 8} y={BY0 + 32} fontSize="12" fill="#e11d48">
          насищане на хемоглобина: {Math.round(m.s * 100)} %
        </text>
      </LabSvg>

      <Buttons>
        {PLACES.map(pl => (
          <DiagramButton key={pl.name} active={h === pl.h} onClick={() => setH(pl.h)}>
            {pl.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {(Object.keys(MODES) as Mode[]).map(k => (
          <DiagramButton key={k} active={mode === k} onClick={() => setMode(k)}>
            {MODES[k].label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="h, m" value={h} onChange={setH} min={0} max={EVEREST} step={1} tone="rose" />
      </Sliders>

      <Readout
        items={[
          { label: 'налягане', value: `${fmt(m.pb)} kPa`, tone: 'blue' },
          { label: 'PCO₂ в алвеолите', value: `${fmt(m.paco2)} kPa`, tone: 'amber' },
          { label: 'PO₂ в артериите', value: `${fmt(m.art)} kPa`, tone: 'rose' },
          { label: 'O₂ в кръвта', value: `${Math.round(m.content)} mL/L (${Math.round((m.content / 199) * 100)} %)`, tone: 'emerald' },
        ]}
      />
      <Formula>
        PAO₂ = 0,21 · (p − 6,3) − PACO₂ / 0,8 = 0,21 · ({fmt(m.pb)} − 6,3) − {fmt(m.paco2)} / 0,8 ≈ {fmt(m.alv)} kPa
      </Formula>
      <Note tone="emerald">
        {mode === 'none' && m.alv < 4
          ? 'Ако дишането не се учести, на тази височина в алвеолите почти няма кислород – човекът губи съзнание. Хипервентилацията изтласква CO₂ и прави място за O₂.'
          : m.art < 6
            ? 'Артериалното PO₂ е паднало до стръмната част на кривата – всяка крачка нагоре сваля насищането рязко. Тук хората се изкачват бавно, а повечето използват кислородни бутилки.'
            : mode === 'acc' && h >= 2000
              ? 'След седмици в планината бъбреците отделят повече еритропоетин и кръвта има повече хемоглобин – съдържанието на O₂ се възстановява, макар че насищането остава ниско.'
              : h >= 2500
                ? 'Над около 2500 m някои хора развиват височинна болест: главоболие, гадене, безсъние. Изкачването на етапи дава време за аклиматизация.'
                : 'До около 2000 m насищането почти не пада – PO₂ в артериите е на плоската част на дисоциационната крива.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: налягането пада експоненциално с височината (около 8 km скала); въздухът в трахеята е наситен с водни пари
        (6,3 kPa при 37 °C); в алвеолите CO₂ заема част от мястото (уравнение на алвеоларния газ); артериите – с 0,5 kPa по-малко от
        алвеолите. Делът на кислорода (около 21 %) е еднакъв на всяка височина – пада само налягането. При аклиматизация
        хемоглобинът расте от 150 на около 180 g/L. Числата са приблизителни; през 2007 г. в кръв, взета от катерачи на 8400 m, докато дишат
        въздух без бутилка, е измерено средно артериално PO₂ около 3,3 kPa.
      </p>
    </div>
  );
}
