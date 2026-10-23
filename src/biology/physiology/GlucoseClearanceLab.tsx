import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note, Readout } from '~/geometry/diagram';

/** Най-голямото количество глюкоза, което каналчетата могат да поемат обратно (Tm), mmol/min (≈ 375 mg/min). */
const TM = 2.075;
/** Праговете на отделните нефрони са разпръснати: стандартно отклонение като дял от средния праг. */
const SPREAD = 0.18;
/** Ефективен бъбречен плазмен ток (клирънсът на PAH), mL/min. */
const ERPF = 625;

const erf = (x: number) => {
  // приближение на Абрамовиц и Стегун, грешка < 1,5·10⁻⁷
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};

/** Филтрирана, поета обратно и отделена глюкоза (mmol/min) при плазмена концентрация p (mmol/L) и GFR g (mL/min). */
function glucose(p: number, g: number) {
  const gl = g / 1000; // L/min
  const mu = TM / gl; // среден праг на нефроните, mmol/L
  const s = SPREAD * mu;
  const z = (p - mu) / s;
  const Phi = 0.5 * (1 + erf(z / Math.SQRT2));
  const phi = Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);
  const filtered = gl * p;
  const excreted = Math.max(0, gl * ((p - mu) * Phi + s * phi));
  return { filtered, excreted, reabsorbed: filtered - excreted, mu };
}

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// графиката
const X0 = 50;
const X1 = 420;
const Y0 = 300;
const Y1 = 30;
const PMAX = 30;
const QMAX = 4.5;
const px = (p: number) => X0 + (p / PMAX) * (X1 - X0);
const py = (q: number) => Y0 - (Math.min(q, QMAX) / QMAX) * (Y0 - Y1);

/** Глюкозата в бъбрека: филтрирана, поета обратно и отделена с урината; бъбречен праг и клирънс. */
export default function GlucoseClearanceLab() {
  const [p, setP] = useState(5);
  const [g, setG] = useState(125);

  const now = glucose(p, g);
  const ps = Array.from({ length: 121 }, (_, k) => (k / 120) * PMAX);
  const path = (f: (r: ReturnType<typeof glucose>) => number) =>
    ps.map((v, k) => `${k ? 'L' : 'M'} ${px(v).toFixed(1)} ${py(f(glucose(v, g))).toFixed(1)}`).join(' ');
  const clearance = p > 0 ? (now.excreted / p) * 1000 : 0; // mL/min
  const gramsDay = now.excreted * 1440 * 0.18; // g/ден (180 g/mol)
  const tested = gramsDay > 0.5;

  const bars = [
    { name: 'инулин', c: g, color: '#0ea5e9' },
    { name: 'PAH', c: ERPF, color: '#8b5cf6' },
    { name: 'урея', c: 0.5 * g, color: '#f59e0b' },
    { name: 'глюкоза', c: clearance, color: '#e11d48' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* оси */}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 5, 10, 15, 20, 25, 30].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={py(v)} y2={py(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 34} fontSize="12" textAnchor="middle" fill="currentColor">глюкоза в плазмата, mmol/L</text>
        <text x={X0 + 4} y={Y1 - 10} fontSize="12" fill="currentColor">mmol/min</text>

        {/* нормалната зона и Tm */}
        <rect x={px(3.9)} y={Y1} width={px(5.6) - px(3.9)} height={Y0 - Y1} fill="#10b981" opacity={0.12} />
        <line x1={X0} x2={X1} y1={py(TM)} y2={py(TM)} stroke="#64748b" strokeDasharray="5 4" />
        <text x={X1 - 4} y={py(TM) - 6} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">Tm</text>

        <path d={path(r => r.filtered)} fill="none" stroke="#0ea5e9" strokeWidth={2.5} />
        <path d={path(r => r.reabsorbed)} fill="none" stroke="#10b981" strokeWidth={2.5} />
        <path d={path(r => r.excreted)} fill="none" stroke="#e11d48" strokeWidth={2.5} />
        <text x={px(25)} y={py(glucose(25, g).filtered) - 8} fontSize="12" fill="#0284c7" textAnchor="end">филтрирана</text>
        <text x={px(27)} y={py(glucose(27, g).reabsorbed) + 16} fontSize="12" fill="#059669" textAnchor="middle">поета обратно</text>
        <text x={px(29)} y={py(glucose(29, g).excreted) + 18} fontSize="12" fill="#e11d48" textAnchor="end">в урината</text>

        <line x1={px(p)} x2={px(p)} y1={Y0} y2={Y1} stroke="#e11d48" strokeDasharray="3 3" />
        <circle cx={px(p)} cy={py(now.filtered)} r={4.5} fill="#0ea5e9" />
        <circle cx={px(p)} cy={py(now.reabsorbed)} r={4.5} fill="#10b981" />
        <circle cx={px(p)} cy={py(now.excreted)} r={4.5} fill="#e11d48" />

        {/* клирънси */}
        <text x={460} y={44} fontSize="12" fontWeight="700" fill="currentColor">клирънс, mL/min</text>
        {bars.map((b, k) => {
          const y = 64 + k * 58;
          const w = (Math.min(b.c, 650) / 650) * 125;
          return (
            <g key={b.name}>
              <text x={460} y={y} fontSize="12" fill="currentColor">{b.name}</text>
              <rect x={460} y={y + 6} width={Math.max(w, 1)} height={18} rx={2} fill={b.color} opacity={0.85} />
              <text x={460 + Math.max(w, 1) + 4} y={y + 20} fontSize="11" fill="currentColor">
                {Math.round(b.c)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="глюкоза" value={p} onChange={setP} min={0} max={30} step={0.5} tone="rose" />
        <Slider label="GFR" value={g} onChange={setG} min={40} max={180} step={5} tone="blue" />
      </Sliders>

      <Readout
        items={[
          { label: 'филтрирана', value: `${fmt(now.filtered)} mmol/min`, tone: 'blue' },
          { label: 'поета', value: `${fmt(now.reabsorbed)} mmol/min`, tone: 'emerald' },
          { label: 'в урината', value: `${fmt(gramsDay, gramsDay < 10 ? 1 : 0)} g/ден`, tone: 'rose' },
          { label: 'клирънс', value: `${fmt(clearance, clearance < 10 ? 1 : 0)} mL/min`, tone: 'violet' },
        ]}
      />
      <Formula>
        филтрирана = GFR · P = {fmt(g / 1000, 3)} L/min · {fmt(p, 1)} mmol/L = {fmt(now.filtered)} mmol/min
      </Formula>
      <Note tone="rose">
        {p < 3.9
          ? 'Хипогликемия: мозъкът остава без гориво. Цялата филтрирана глюкоза се поема обратно.'
          : !tested
            ? p <= 5.6
              ? 'Нормална кръвна захар на гладно: всичката глюкоза, която се филтрира, се връща в кръвта – урината е без захар.'
              : 'Захарта е повишена, но още под бъбречния праг – в урината почти няма глюкоза.'
            : now.reabsorbed > 0.97 * TM
              ? 'Преносителите във всички нефрони са наситени: колкото повече глюкоза се филтрира, толкова повече отива в урината. Клирънсът на глюкозата се приближава до този на инулина.'
              : 'Над бъбречния праг: в нефроните с най-малко преносители те вече са наситени и глюкозата се появява в урината – като при нелекуван захарен диабет.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: каналчетата могат да поемат най-много Tm ≈ {fmt(TM)} mmol/min (около 375 mg/min). Ако всички нефрони бяха еднакви,
        глюкозата би се появила в урината чак при Tm / GFR ≈ {fmt(TM / 0.125, 1)} mmol/L; но нефроните се различават и в най-слабите
        преносителите се насищат по-рано – затова реалният праг е около 10 mmol/L (180 mg/dL), а кривата е заоблена. Намали GFR
        (бъбречна болест) или го увеличи (бременност) и виж как се мести прагът. Клирънсът на уреята е взет приблизително половината
        от GFR, а на PAH – около {ERPF} mL/min (бъбречният плазмен ток).
      </p>
    </div>
  );
}
