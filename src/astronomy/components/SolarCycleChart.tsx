import { useMemo, useState } from 'react';

const W = 640;
const H = 350;
const L = 40;
const R = 625;
const TOP = 30;
const BOTTOM = 190;
const YEAR0 = 1640;
const YEAR1 = 2032;
const SSN_MAX = 300;

// Начало (минимум), максимум и изгладено максимално число на петната (SILSO, версия 2) за цикли 1–25
const CYCLES: [number, number, number][] = [
  [1755.2, 1761.5, 144],
  [1766.5, 1769.7, 193],
  [1775.5, 1778.4, 264],
  [1784.7, 1788.1, 235],
  [1798.3, 1805.2, 82],
  [1810.6, 1816.4, 81],
  [1823.3, 1829.9, 119],
  [1833.9, 1837.2, 245],
  [1843.5, 1848.1, 220],
  [1855.9, 1860.1, 186],
  [1867.2, 1870.6, 234],
  [1878.9, 1883.9, 124],
  [1890.2, 1894.1, 147],
  [1902.0, 1906.2, 107],
  [1913.6, 1917.6, 176],
  [1923.6, 1928.4, 130],
  [1933.8, 1937.4, 199],
  [1944.2, 1947.4, 219],
  [1954.3, 1958.2, 285],
  [1964.9, 1968.9, 157],
  [1976.5, 1979.9, 233],
  [1986.8, 1989.6, 213],
  [1996.4, 2001.9, 180],
  [2008.9, 2014.3, 116],
  [2019.9, 2024.8, 161],
];
const NEXT_MIN = 2030.5; // очакван край на цикъл 25

const sx = (year: number) => L + ((year - YEAR0) / (YEAR1 - YEAR0)) * (R - L);
const sy = (ssn: number) => BOTTOM - (ssn / SSN_MAX) * (BOTTOM - TOP);

/** Изгладена крива: плавно изкачване до максимума и по-бавно спадане. */
function ssnAt(year: number) {
  for (let i = 0; i < CYCLES.length; i++) {
    const [min, max, peak] = CYCLES[i];
    const end = i + 1 < CYCLES.length ? CYCLES[i + 1][0] : NEXT_MIN;
    if (year < min || year >= end) continue;
    const base = 6;
    if (year < max) return base + (peak - base) * Math.sin(((year - min) / (max - min)) * (Math.PI / 2)) ** 2;
    return base + (peak - base) * Math.cos(((year - max) / (end - max)) * (Math.PI / 2)) ** 2;
  }
  return 0;
}

// Диаграмата „пеперуда“ за последните цикли
const BF_TOP = 238;
const BF_BOTTOM = 330;
const BF_YEAR0 = 1954;
const by = (lat: number) => (BF_TOP + BF_BOTTOM) / 2 - (lat / 40) * ((BF_BOTTOM - BF_TOP) / 2);
const bx = (year: number) => L + ((year - BF_YEAR0) / (YEAR1 - BF_YEAR0)) * (R - L);

function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function SolarCycleChart() {
  const [selected, setSelected] = useState(24); // цикъл 25

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let y = CYCLES[0][0]; y <= 2026.5; y += 0.1) pts.push(`${sx(y).toFixed(1)},${sy(ssnAt(y)).toFixed(1)}`);
    return pts.join(' ');
  }, []);

  // Петната в началото на цикъла се появяват на ~30°, а към края – близо до екватора (закон на Шпьорер)
  const butterfly = useMemo(() => {
    const rnd = random(7);
    const dots: { x: number; y: number }[] = [];
    CYCLES.slice(18).forEach(([min, , peak], i) => {
      const end = i + 18 + 1 < CYCLES.length ? CYCLES[i + 18 + 1][0] : NEXT_MIN;
      const start = min - 1;
      const count = Math.round(peak * 1.6);
      for (let k = 0; k < count; k++) {
        const t = start + rnd() * (end + 1 - start);
        if (t > 2026) continue;
        const phase = (t - start) / (end + 1 - start);
        // По-гъсто около максимума
        if (rnd() > ssnAt(Math.min(Math.max(t, min), end - 0.01)) / peak + 0.15) continue;
        const lat = (30 - 24 * phase) * (0.75 + 0.5 * rnd());
        dots.push({ x: bx(t), y: by(rnd() < 0.5 ? lat : -lat) });
      }
    });
    return dots;
  }, []);

  const [min, max, peak] = CYCLES[selected];
  const end = selected + 1 < CYCLES.length ? CYCLES[selected + 1][0] : NEXT_MIN;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пулсът на Слънцето</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Броят на слънчевите петна от 1755 г. насам (изгладен). Щракнете върху цикъл. Отдолу – на какви ширини се появяват петната през
        последните цикли.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Минимуми на Маундер и Далтън */}
        <rect x={sx(1645)} y={TOP} width={sx(1715) - sx(1645)} height={BOTTOM - TOP} fill="#38bdf8" fillOpacity="0.12" />
        <text x={(sx(1645) + sx(1715)) / 2} y={TOP + 40} fontSize="11" textAnchor="middle" fill="#7dd3fc">
          Минимум
        </text>
        <text x={(sx(1645) + sx(1715)) / 2} y={TOP + 54} fontSize="11" textAnchor="middle" fill="#7dd3fc">
          на Маундер
        </text>
        <text x={(sx(1645) + sx(1715)) / 2} y={BOTTOM - 10} fontSize="9" textAnchor="middle" fill="#7dd3fc" fillOpacity="0.8">
          почти без петна
        </text>
        <rect x={sx(1796)} y={TOP} width={sx(1823) - sx(1796)} height={BOTTOM - TOP} fill="#38bdf8" fillOpacity="0.08" />
        <text x={(sx(1796) + sx(1823)) / 2} y={TOP + 12} fontSize="10" textAnchor="middle" fill="#7dd3fc">
          Далтън
        </text>
        <line x1={sx(1715)} x2={sx(1755)} y1={sy(40)} y2={sy(40)} stroke="white" strokeOpacity="0.25" strokeDasharray="3 4" />

        {/* Оси */}
        <line x1={L} x2={R} y1={BOTTOM} y2={BOTTOM} stroke="white" strokeOpacity="0.4" />
        {[0, 100, 200, 300].map(v => (
          <g key={v}>
            <line x1={L} x2={R} y1={sy(v)} y2={sy(v)} stroke="white" strokeOpacity={v === 0 ? 0 : 0.08} />
            <text x={L - 6} y={sy(v) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
              {v}
            </text>
          </g>
        ))}
        {[1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000].map(y => (
          <text key={y} x={sx(y)} y={BOTTOM + 14} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            {y}
          </text>
        ))}

        {/* Избраният цикъл */}
        <rect x={sx(min)} y={TOP} width={sx(Math.min(end, 2026.5)) - sx(min)} height={BOTTOM - TOP} fill="#fde047" fillOpacity="0.12" />
        <polyline points={curve} fill="none" stroke="#fbbf24" strokeWidth="2" />

        {/* Зони за щракане по цикли */}
        {CYCLES.map(([cMin], i) => {
          const cEnd = i + 1 < CYCLES.length ? CYCLES[i + 1][0] : 2026.5;
          return (
            <rect key={i} x={sx(cMin)} y={TOP} width={sx(cEnd) - sx(cMin)} height={BOTTOM - TOP} fill="transparent" className="cursor-pointer" onClick={() => setSelected(i)} />
          );
        })}
        <text x={sx(max)} y={sy(peak) - 8} fontSize="11" textAnchor="middle" fill="white" fontWeight="600" pointerEvents="none">
          {selected + 1}
        </text>

        {/* Пеперуда */}
        <text x={L} y={BF_TOP - 6} fontSize="10" fill="white" fillOpacity="0.7">
          Хелиографска ширина на петната (диаграма „пеперуда“), 1954 – днес
        </text>
        <rect x={L} y={BF_TOP} width={R - L} height={BF_BOTTOM - BF_TOP} fill="white" fillOpacity="0.03" />
        <line x1={L} x2={R} y1={by(0)} y2={by(0)} stroke="white" strokeOpacity="0.3" />
        {[30, -30].map(l => (
          <text key={l} x={L - 6} y={by(l) + 4} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
            {l > 0 ? `+${l}°` : `${l}°`}
          </text>
        ))}
        <text x={L - 6} y={by(0) + 4} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          0°
        </text>
        {butterfly.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.3} fill="#fbbf24" fillOpacity="0.7" />
        ))}
        {[1960, 1980, 2000, 2020].map(y => (
          <text key={y} x={bx(y)} y={BF_BOTTOM + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
            {y}
          </text>
        ))}
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Цикъл', value: `№ ${selected + 1}` },
          { label: 'Минимум → максимум', value: `${min.toFixed(1).replace('.', ',')} → ${max.toFixed(1).replace('.', ',')}` },
          { label: 'Продължителност', value: selected + 1 < CYCLES.length ? `${(end - min).toFixed(1).replace('.', ',')} г.` : 'все още тече' },
          { label: 'Петна в максимума', value: `~${peak}` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Максимумите и минимумите са реални (Кралска обсерватория на Белгия, SILSO), а формата между тях е изгладена схематично. Преди
        1755 г. наблюденията са откъслечни; точките на пеперудата са илюстрация на закона на Шпьорер.
      </p>
    </div>
  );
}
