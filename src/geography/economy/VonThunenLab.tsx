import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Продуктите в модела: добив Y (t/ha), печалба p − c на пазара (€/t), транспортна ставка f (€/t·km). */
const PRODUCTS = [
  { name: 'Зеленчуци и мляко', Y: 20, m: 100, f: 5, color: '#34d399' },
  { name: 'Гора (дърва)', Y: 10, m: 70, f: 2, color: '#15803d' },
  { name: 'Зърно', Y: 4, m: 110, f: 2, color: '#f59e0b' },
  { name: 'Пасища', Y: 0.5, m: 400, f: 4, color: '#bef264' },
];
const RIVER_K = 0.3; // по реката превозът струва 30% от превоза по суша

const DMAX = 100;
// карта
const MX = 165;
const MY = 170;
const MS = 1.5; // px на km
// графика
const GX0 = 370;
const GX1 = 625;
const GY0 = 300;
const GY1 = 30;
const RMAX = 2000;
const gx = (d: number) => GX0 + (d / DMAX) * (GX1 - GX0);
const gy = (r: number) => GY0 - (Math.max(0, Math.min(r, RMAX)) / RMAX) * (GY0 - GY1);

/** Моделът на фон Тюнен: поземлената рента на всеки продукт намалява с разстоянието до пазара. */
export default function VonThunenLab() {
  const [fx, setFx] = useState(1);
  const [px, setPx] = useState(1);
  const [river, setRiver] = useState(false);

  const prods = PRODUCTS.map((p, i) => ({ ...p, R0: p.Y * p.m * (i === 2 ? px : 1), slope: p.Y * p.f * fx }));
  const rent = (i: number, d: number) => prods[i].R0 - prods[i].slope * d;

  // Пояси: на всяко разстояние печели продуктът с най-висока рента
  const zones: { i: number; a: number; b: number }[] = [];
  for (let d = 0; d <= 160; d += 0.05) {
    let best = -1;
    let bestR = 0;
    prods.forEach((_, i) => {
      const r = rent(i, d);
      if (r > bestR) {
        bestR = r;
        best = i;
      }
    });
    const last = zones[zones.length - 1];
    if (best < 0) {
      break;
    }
    if (last && last.i === best) last.b = d;
    else zones.push({ i: best, a: d, b: d });
  }

  // Областта с „ефективно разстояние“ < b: кръг, а с река – и ромб по реката
  const shape = (b: number, color: string, key: string) => {
    const r = b * MS;
    const rx = (b / RIVER_K) * MS;
    return (
      <g key={key} fill={color}>
        <circle cx={MX} cy={MY} r={r} />
        {river && <polygon points={`${MX - rx},${MY} ${MX},${MY - r} ${MX + rx},${MY} ${MX},${MY + r}`} />}
      </g>
    );
  };

  const envelope: string[] = [];
  for (let d = 0; d <= DMAX; d += 0.5) {
    const r = Math.max(0, ...prods.map((_, i) => rent(i, d)));
    envelope.push(`${gx(d).toFixed(1)},${gy(r).toFixed(1)}`);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="vt-map">
            <rect x={MX - 150} y={MY - 150} width={300} height={300} />
          </clipPath>
        </defs>
        {/* Карта */}
        <rect x={MX - 150} y={MY - 150} width={300} height={300} className="fill-gray-200 dark:fill-gray-700" />
        <g clipPath="url(#vt-map)">
          {[...zones].reverse().map(z => shape(z.b, prods[z.i].color, `${z.i}-${z.a}`))}
          {river && <line x1={MX - 150} y1={MY} x2={MX + 150} y2={MY} stroke="#0284c7" strokeWidth="3" />}
        </g>
        <rect x={MX - 150} y={MY - 150} width={300} height={300} fill="none" className="stroke-gray-400 dark:stroke-gray-500" />
        <circle cx={MX} cy={MY} r={6} className="fill-rose-600 stroke-white" strokeWidth="1.5" />
        <text x={MX + 9} y={MY - 8} fontSize="11" fontWeight="600" className="fill-gray-900">
          град
        </text>
        <line x1={MX - 140} y1={MY + 140} x2={MX - 140 + 50 * MS} y2={MY + 140} className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="2" />
        <text x={MX - 140 + 25 * MS} y={MY + 135} fontSize="10" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
          50 km
        </text>

        {/* Графика на рентата */}
        {[0, 500, 1000, 1500, 2000].map(r => (
          <g key={r}>
            <line x1={GX0} y1={gy(r)} x2={GX1} y2={gy(r)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX0 - 5} y={gy(r) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {r}
            </text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(d => (
          <text key={d} x={gx(d)} y={GY0 + 13} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {d}
          </text>
        ))}
        <text x={GX1} y={GY0 + 25} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          разстояние до града, km
        </text>
        <text x={GX0 - 5} y={GY1 - 10} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          €/ha
        </text>
        {prods.map((p, i) => {
          const dz = Math.min(DMAX, p.R0 / p.slope);
          return <line key={i} x1={gx(0)} y1={gy(p.R0)} x2={gx(dz)} y2={gy(rent(i, dz))} stroke={p.color} strokeWidth="1.5" strokeDasharray="4 3" />;
        })}
        <polyline points={envelope.join(' ')} fill="none" className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="2.5" />
        {zones.map(z => (
          <rect
            key={`${z.i}-${z.a}`}
            x={gx(Math.min(z.a, DMAX))}
            y={GY0 - 6}
            width={Math.max(0, gx(Math.min(z.b, DMAX)) - gx(Math.min(z.a, DMAX)))}
            height={6}
            fill={prods[z.i].color}
          />
        ))}
      </LabSvg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-600 dark:text-gray-300">
        {prods.map(p => (
          <span key={p.name} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
      <Buttons>
        <DiagramButton active={!river} onClick={() => setRiver(false)}>
          Без река
        </DiagramButton>
        <DiagramButton active={river} onClick={() => setRiver(true)}>
          С плавателна река
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="f, ×" value={fx} onChange={setFx} min={0.5} max={2} step={0.05} tone="rose" />
        <Slider label="зърно" value={px} onChange={setPx} min={0.5} max={1.6} step={0.05} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        f – колко пъти по-скъп (или по-евтин) е превозът от днешния; „зърно“ – колко пъти се променя печалбата от тон зърно на пазара. Рентата на всеки продукт е
        R = Y(p − c) − Y·f·d; по реката превозът е 3 пъти по-евтин.
      </p>
      <div className="mt-3">
        <Readout
          items={zones
            .filter(z => z.a < DMAX)
            .map(z => ({
              label: prods[z.i].name,
              value: `${fmt(z.a)}–${fmt(Math.min(z.b, 160))} km`,
              tone: 'gray' as const,
            }))}
        />
      </div>
      <Note tone="blue">
        {zones.length < 4
          ? 'Един от продуктите изчезна: рентата му никъде не е най-високата, затова никой стопанин няма да го отглежда.'
          : 'Близо до града печелят продуктите с голям добив от хектар и скъп превоз; далеч остават евтините за превоз и екстензивните.'}
      </Note>
    </div>
  );
}
