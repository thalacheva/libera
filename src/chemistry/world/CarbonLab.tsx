import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Годишни средни стойности на CO₂ на Мауна Лоа (NOAA), закръглени до 0,1 ppm
const KEELING: [number, number][] = [
  [1960, 316.9],
  [1965, 320.0],
  [1970, 325.7],
  [1975, 331.1],
  [1980, 338.8],
  [1985, 346.1],
  [1990, 354.4],
  [1995, 360.8],
  [2000, 369.7],
  [2005, 379.8],
  [2010, 389.9],
  [2015, 401.0],
  [2020, 414.2],
  [2024, 424.6],
];

/** Горива: колко тона CO₂ дава 1 t гориво (въглищата – като чист въглерод). */
const FUELS = [
  { name: 'въглища (≈ C)', eq: 'C + O₂ → CO₂', k: 44 / 12 },
  { name: 'природен газ (CH₄)', eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', k: 44 / 16 },
  { name: 'бензин (≈ C₈H₁₈)', eq: '2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O', k: (8 * 44) / 114 },
];

/** 1 ppm CO₂ в атмосферата ≈ 2,13 Gt въглерод ≈ 7,81 Gt CO₂. */
const GT_CO2_PER_PPM = (2.13 * 44) / 12;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

const X0 = 50;
const X1 = 465;
const Y0 = 200; // долу: 270 ppm
const Y1 = 20; // горе: 430 ppm
const sx = (year: number) => X0 + ((year - 1958) / (2026 - 1958)) * (X1 - X0);
const sy = (ppm: number) => Y0 - ((ppm - 270) / (430 - 270)) * (Y0 - Y1);

/** Годишната средна стойност между точките – линейно. */
function annual(t: number) {
  if (t <= KEELING[0][0]) return KEELING[0][1];
  for (let i = 1; i < KEELING.length; i++) {
    const [x1, y1] = KEELING[i];
    const [x0, y0] = KEELING[i - 1];
    if (t <= x1) return y0 + ((t - x0) / (x1 - x0)) * (y1 - y0);
  }
  return KEELING[KEELING.length - 1][1];
}

/** Кривата на Кийлинг и колко CO₂ дава изгарянето на горивата. */
export default function CarbonLab() {
  const [seasons, setSeasons] = useState(true);
  const [fi, setFi] = useState(0);
  const [tonnes, setTonnes] = useState(10);
  const [world, setWorld] = useState(37);
  const fuel = FUELS[fi];

  // Сезонното колебание е схематично: ±3 ppm, максимум през май, минимум в началото на есента
  const pts: string[] = [];
  for (let t = 1958.5; t <= 2024.9; t += 1 / 12) {
    const v = annual(t) + (seasons ? 3 * Math.cos(2 * Math.PI * (t - Math.floor(t) - 0.37)) : 0);
    pts.push(`${sx(t).toFixed(1)},${sy(v).toFixed(1)}`);
  }

  const co2 = tonnes * fuel.k;
  const ppmIfAll = world / GT_CO2_PER_PPM;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 236" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* мрежа и надписи по осите */}
        {[280, 320, 360, 400].map(v => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={sy(v)} y2={sy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={sy(v) + 4} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        {[1960, 1980, 2000, 2020].map(y => (
          <text key={y} x={sx(y)} y={Y0 + 16} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {y}
          </text>
        ))}
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="stroke-gray-400" />
        <line x1={X0} x2={X0} y1={Y0} y2={Y1 - 6} className="stroke-gray-400" />
        <text x={X0 + 4} y={12} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          CO₂, ppm
        </text>
        <text x={X1} y={Y0 + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          година
        </text>

        {/* нивото преди индустриалната революция */}
        <line x1={X0} x2={X1} y1={sy(280)} y2={sy(280)} strokeDasharray="5 4" className="stroke-emerald-500" strokeWidth="1.5" />
        <text x={X1} y={sy(280) - 5} fontSize="11" textAnchor="end" className="fill-emerald-700 dark:fill-emerald-400">
          ≈ 280 ppm преди 1850 г.
        </text>

        <polyline points={pts.join(' ')} fill="none" className="stroke-rose-500" strokeWidth={seasons ? 1.3 : 2.2} />
        {KEELING.map(([y, v]) => (
          <circle key={y} cx={sx(y)} cy={sy(v)} r="2.6" className="fill-gray-800 dark:fill-gray-100" />
        ))}
        <text x={sx(2024) - 4} y={sy(424.6) - 10} fontSize="11" fontWeight="600" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          2024: ≈ 425 ppm
        </text>
        <text x={sx(1960) + 6} y={sy(316.9) + 20} fontSize="11" fontWeight="600" className="fill-gray-700 dark:fill-gray-200">
          1960: ≈ 317 ppm
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={seasons} onClick={() => setSeasons(true)}>
          със сезонното колебание
        </DiagramButton>
        <DiagramButton active={!seasons} onClick={() => setSeasons(false)}>
          само годишните средни
        </DiagramButton>
      </Buttons>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        Точките са годишните средни стойности на Мауна Лоа (NOAA, закръглени); сезонният „зъбец“ е нарисуван схематично.
      </p>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3">
        <Buttons>
          {FUELS.map((f, i) => (
            <DiagramButton key={f.name} active={i === fi} onClick={() => setFi(i)}>
              {f.name}
            </DiagramButton>
          ))}
        </Buttons>
        <Sliders>
          <Slider label="m, t" value={tonnes} onChange={setTonnes} min={1} max={100} step={1} tone="amber" />
          <Slider label="E, Gt" value={world} onChange={setWorld} min={5} max={50} step={1} tone="rose" />
        </Sliders>
        <div className="mt-3">
          <Readout
            items={[
              { label: 'уравнение:', value: fuel.eq },
              { label: `CO₂ от ${tonnes} t гориво:`, value: `${fmt(co2)} t (${fmt(fuel.k, 2)} t на тон)`, tone: 'amber' },
              { label: `светът изпуска ${world} Gt CO₂ годишно; ако всичко остане във въздуха:`, value: `+${fmt(ppmIfAll, 1)} ppm`, tone: 'rose' },
            ]}
          />
        </div>
        <Note tone="amber">
          Един ppm CO₂ в цялата атмосфера е около 7,8 милиарда тона CO₂. Океаните и растенията поемат около половината от изхвърления CO₂,
          затова концентрацията расте по-бавно от сметката „всичко остава във въздуха“ – през последното десетилетие средно с около 2,5–3 ppm на
          година.
        </Note>
      </div>
    </div>
  );
}
