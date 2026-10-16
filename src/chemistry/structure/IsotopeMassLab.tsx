import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Стабилните изотопи: масово число, маса в u и разпространение в природата (%) – по данни на IUPAC
const DATA: { symbol: string; name: string; ar: number; isotopes: [number, number, number][] }[] = [
  { symbol: 'Cl', name: 'хлор', ar: 35.45, isotopes: [[35, 34.96885, 75.8], [37, 36.9659, 24.2]] },
  { symbol: 'B', name: 'бор', ar: 10.81, isotopes: [[10, 10.01294, 19.65], [11, 11.00931, 80.35]] },
  { symbol: 'Mg', name: 'магнезий', ar: 24.305, isotopes: [[24, 23.98504, 78.965], [25, 24.98584, 10.011], [26, 25.98259, 11.025]] },
  { symbol: 'Cu', name: 'мед', ar: 63.546, isotopes: [[63, 62.9296, 69.15], [65, 64.92779, 30.85]] },
  { symbol: 'Br', name: 'бром', ar: 79.904, isotopes: [[79, 78.91834, 50.65], [81, 80.91629, 49.35]] },
  { symbol: 'Ne', name: 'неон', ar: 20.18, isotopes: [[20, 19.99244, 90.48], [21, 20.99385, 0.27], [22, 21.99139, 9.25]] },
];

const fmt = (v: number, d: number) => v.toFixed(d).replace('.', ',');

// Ос на спектъра
const X0 = 60;
const X1 = 450;
const Y0 = 200;
const H = 150;

/** Мас-спектрометър: пиковете на изотопите и средната атомна маса като претеглено средно. */
export default function IsotopeMassLab() {
  const [index, setIndex] = useState(0);
  const el = DATA[index];
  const natural = el.isotopes[0][2];
  const [first, setFirst] = useState(natural);

  const choose = (i: number) => {
    setIndex(i);
    setFirst(DATA[i].isotopes[0][2]);
  };

  // Разпространението на първия изотоп се задава с плъзгача; останалите запазват съотношението си
  const rest = el.isotopes.slice(1).reduce((s, x) => s + x[2], 0);
  const shares = el.isotopes.map(([, , pct], i) => (i === 0 ? first : (pct / rest) * (100 - first)));
  const ar = el.isotopes.reduce((s, [, m], i) => s + (m * shares[i]) / 100, 0);

  const aMin = el.isotopes[0][0] - 2;
  const aMax = el.isotopes[el.isotopes.length - 1][0] + 2;
  const x = (a: number) => X0 + ((a - aMin) / (aMax - aMin)) * (X1 - X0);
  const y = (pct: number) => Y0 - (pct / 100) * H;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {DATA.map((d, i) => (
          <DiagramButton key={d.symbol} active={i === index} onClick={() => choose(i)}>
            {d.symbol} – {d.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* Оси */}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1.5" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 10} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1.5" />
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={X0 - 5} x2={X0} y1={y(v)} y2={y(v)} className="stroke-gray-500 dark:stroke-gray-400" />
            <text x={X0 - 9} y={y(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        <text x={X0 - 40} y={Y0 - H - 16} fontSize="11" fill="currentColor">
          дял, %
        </text>
        {Array.from({ length: aMax - aMin + 1 }, (_, k) => aMin + k).map(a => (
          <g key={a}>
            <line x1={x(a)} x2={x(a)} y1={Y0} y2={Y0 + 5} className="stroke-gray-500 dark:stroke-gray-400" />
            <text x={x(a)} y={Y0 + 18} fontSize="11" textAnchor="middle" fill="currentColor">
              {a}
            </text>
          </g>
        ))}
        <text x={X1} y={Y0 + 34} fontSize="11" textAnchor="end" fill="currentColor">
          маса, u
        </text>

        {/* Пиковете */}
        {el.isotopes.map(([a, m], i) => (
          <g key={a}>
            <rect x={x(m) - 7} y={y(shares[i])} width={14} height={Y0 - y(shares[i])} rx="2" className="fill-amber-500" />
            <text x={x(m)} y={y(shares[i]) - 8} fontSize="12" fontWeight="600" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400">
              {`${fmt(shares[i], shares[i] < 1 ? 2 : 1)}%`}
            </text>
          </g>
        ))}

        {/* Средната атомна маса */}
        <line x1={x(ar)} x2={x(ar)} y1={Y0} y2={Y0 - H - 4} className="stroke-violet-500" strokeDasharray="5 4" strokeWidth="2" />
        <text x={x(ar)} y={Y0 - H - 10} fontSize="12" fontWeight="600" textAnchor="middle" className="fill-violet-700 dark:fill-violet-400">
          {`Ar = ${fmt(ar, 3)}`}
        </text>
      </LabSvg>

      <Sliders>
        <Slider label={`${el.isotopes[0][0]}${el.symbol}, %`} value={first} onChange={setFirst} min={0} max={100} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Ar =', value: el.isotopes.map(([, m], i) => `${fmt(shares[i] / 100, 3)}·${fmt(m, 3)}`).join(' + '), tone: 'violet' },
            { label: '=', value: fmt(ar, 3) },
            { label: 'в таблицата:', value: String(el.ar).replace('.', ',') },
          ]}
        />
      </div>
      {Math.abs(first - natural) > 0.01 ? (
        <Note tone="amber">
          Природното разпространение на {el.isotopes[0][0]}
          {el.symbol} е {fmt(natural, 2)}%. Върни плъзгача там, за да получиш масата от периодичната система.
        </Note>
      ) : (
        <Note tone="emerald">Това е природният изотопен състав – масата съвпада с тази в периодичната система.</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Мас-спектрометърът йонизира атомите и ги разделя по маса: всеки изотоп дава отделен пик, а височината му показва колко от атомите
        са от този вид. Средната атомна маса е претеглено средно – по-близо до по-разпространения изотоп. Затова масата на хлора е 35,45, а не
        36.
      </p>
    </div>
  );
}
