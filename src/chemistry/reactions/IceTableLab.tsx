import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Species = { f: string; nu: number; color: string };
const REACTIONS: { eq: string; K: number; kText: string; species: Species[]; start: number[]; note: string }[] = [
  {
    eq: 'H₂ + I₂ ⇌ 2HI',
    K: 50,
    kText: '50 (около 450 °C)',
    species: [
      { f: 'H₂', nu: -1, color: '#2563eb' },
      { f: 'I₂', nu: -1, color: '#7c3aed' },
      { f: 'HI', nu: 2, color: '#e11d48' },
    ],
    start: [1, 1, 0],
    note: 'Броят на молекулите газ не се променя, затова K не зависи от обема.',
  },
  {
    eq: 'CO + H₂O ⇌ CO₂ + H₂',
    K: 1,
    kText: '1 (около 800 °C)',
    species: [
      { f: 'CO', nu: -1, color: '#ea580c' },
      { f: 'H₂O', nu: -1, color: '#0284c7' },
      { f: 'CO₂', nu: 1, color: '#059669' },
      { f: 'H₂', nu: 1, color: '#2563eb' },
    ],
    start: [1, 1, 0, 0],
    note: 'Така в заводите „преработват“ въглеродния оксид във водород. Опитай с повече водна пара – повече CO се превръща.',
  },
  {
    eq: 'N₂O₄ ⇌ 2NO₂',
    K: 0.0046,
    kText: '0,0046 (25 °C)',
    species: [
      { f: 'N₂O₄', nu: -1, color: '#64748b' },
      { f: 'NO₂', nu: 2, color: '#b45309' },
    ],
    start: [1, 0],
    note: 'Малка K: в равновесие преобладава N₂O₄. Колкото по-разреден е газът, толкова по-голяма част от него се разпада.',
  },
  {
    eq: 'киселина + алкохол ⇌ естер + вода',
    K: 4,
    kText: '4 (оцетна киселина и етанол)',
    species: [
      { f: 'кис.', nu: -1, color: '#dc2626' },
      { f: 'алк.', nu: -1, color: '#2563eb' },
      { f: 'естер', nu: 1, color: '#059669' },
      { f: 'вода', nu: 1, color: '#0284c7' },
    ],
    start: [1, 1, 0, 0],
    note: 'При равни количества се получават само 2/3 mol естер. Излишък от алкохол или отстраняване на водата увеличава добива.',
  },
];

const fmt = (v: number, d = 3) => {
  const s = v.toFixed(d).replace('.', ',');
  return s === '-0,000' ? '0,000' : s;
};

/** Q за дадени концентрации; ∞, ако в знаменателя има нула. */
function quotient(sp: Species[], c: number[]) {
  let num = 1;
  let den = 1;
  sp.forEach((s, i) => {
    if (s.nu > 0) num *= c[i] ** s.nu;
    else den *= c[i] ** -s.nu;
  });
  if (den === 0) return num === 0 ? NaN : Infinity;
  return num / den;
}

/** Напредък x на реакцията до равновесие – с разполовяване, защото ln Q(x) расте с x. */
function solve(sp: Species[], c0: number[], K: number) {
  let lo = -Infinity;
  let hi = Infinity;
  sp.forEach((s, i) => {
    const lim = -c0[i] / s.nu; // c0 + νx = 0
    if (s.nu < 0) hi = Math.min(hi, lim);
    else lo = Math.max(lo, lim);
  });
  if (!(lo < hi)) return 0;
  const g = (x: number) => {
    let v = -Math.log(K);
    sp.forEach((s, i) => (v += s.nu * Math.log(c0[i] + s.nu * x)));
    return v;
  };
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

const BAR_TOP = 36;
const BAR_H = 120;

/** Таблица „начало – промяна – равновесие“: Q сравнено с K и равновесните концентрации. */
export default function IceTableLab() {
  const [ri, setRi] = useState(0);
  const [c0, setC0] = useState<number[]>(REACTIONS[0].start);
  const r = REACTIONS[ri];

  const Q = quotient(r.species, c0);
  const x = Number.isNaN(Q) ? 0 : solve(r.species, c0, r.K);
  const ceq = r.species.map((s, i) => Math.max(0, c0[i] + s.nu * x));
  const cMax = Math.max(1, ...c0, ...ceq);
  const colW = 440 / r.species.length;

  const th = 'px-2 py-1.5 text-left font-semibold bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
  const td = 'px-2 py-1 border-b border-gray-100 dark:border-gray-800 font-mono whitespace-nowrap';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {REACTIONS.map((x, i) => (
          <DiagramButton
            key={x.eq}
            active={i === ri}
            onClick={() => {
              setRi(i);
              setC0(x.start);
            }}
          >
            {x.eq}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">K = {r.kText}</p>

      <LabSvg viewBox="0 0 480 184" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        <line x1={20} x2={460} y1={BAR_TOP + BAR_H} y2={BAR_TOP + BAR_H} className="stroke-gray-400" strokeWidth="1.5" />
        {r.species.map((s, i) => {
          const cx = 20 + colW * (i + 0.5);
          const h0 = (c0[i] / cMax) * BAR_H;
          const h1 = (ceq[i] / cMax) * BAR_H;
          return (
            <g key={s.f}>
              <rect x={cx - 26} y={BAR_TOP + BAR_H - h0} width={22} height={h0} fill={s.color} opacity={0.3} />
              <rect x={cx + 4} y={BAR_TOP + BAR_H - h1} width={22} height={h1} fill={s.color} />
              <text x={cx - 15} y={BAR_TOP + BAR_H - h0 - 4} fontSize="10" textAnchor="middle" fill="currentColor">
                {fmt(c0[i], 1)}
              </text>
              <text x={cx + 15} y={BAR_TOP + BAR_H - h1 - 4} fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">
                {fmt(ceq[i], 2)}
              </text>
              <text x={cx} y={BAR_TOP + BAR_H + 16} fontSize="12" fontWeight="700" textAnchor="middle" fill={s.color}>
                {s.f}
              </text>
            </g>
          );
        })}
        <text x={20} y={12} fontSize="11" fill="currentColor">
          бледо – в началото, плътно – в равновесие (mol/L)
        </text>
      </LabSvg>

      <Sliders>
        {r.species.map((s, i) => (
          <Slider
            key={s.f}
            label={s.f}
            value={c0[i]}
            onChange={v => setC0(c => c.map((old, j) => (j === i ? v : old)))}
            min={0}
            max={3}
            step={0.1}
            tone="gray"
          />
        ))}
      </Sliders>

      <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr>
              <th className={th}>mol/L</th>
              {r.species.map(s => (
                <th key={s.f} className={th} style={{ color: s.color }}>
                  {s.f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={td}>начало</td>
              {c0.map((v, i) => (
                <td key={i} className={td}>
                  {fmt(v, 2)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={td}>промяна</td>
              {r.species.map((s, i) => (
                <td key={i} className={td}>
                  {s.nu * x >= 0 ? '+' : '−'}
                  {fmt(Math.abs(s.nu * x))}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${td} font-semibold`}>равновесие</td>
              {ceq.map((v, i) => (
                <td key={i} className={`${td} font-semibold`}>
                  {fmt(v)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Note tone={Number.isNaN(Q) ? 'gray' : Math.abs(x) < 1e-4 ? 'emerald' : 'amber'}>
        {Number.isNaN(Q)
          ? 'Липсват и реагент, и продукт – реакцията не може да тръгне в никоя посока.'
          : Math.abs(x) < 1e-4
            ? 'Q = K – сместа вече е в равновесие.'
            : `Q = ${Q === 0 ? '0' : Number.isFinite(Q) ? fmt(Q) : '∞'} ${x > 0 ? '<' : '>'} K → реакцията протича ${x > 0 ? 'надясно (към продуктите)' : 'наляво (към реагентите)'}, x = ${fmt(Math.abs(x))} mol/L.`}
      </Note>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{r.note}</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Редът „промяна“ винаги следва коефициентите: ако се изразходват x mol/L H₂, се изразходват и x mol/L I₂ и се получават 2x mol/L HI.
        Лабораторията намира x числено; на ръка решаваме уравнението, което се получава, като заместим реда „равновесие“ в израза за K.
      </p>
    </div>
  );
}
