import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Обем на мазнината в червото, m³ (10 mL – около 9 g). */
const V = 10e-6;
/** Маса на мазнината, g. */
const MASS = 9;
/** Скорост на липазата върху повърхността, g на min на m² (подбрана така, че при капки 1 µm мазнината да се разгради за около 30 min). */
const K = MASS / (30 * 60);
/** Без жлъчни соли капчиците отново се сливат – не стават по-малки от това, m. */
const D_NO_BILE = 0.2e-3;

const SIZES = [
  { d: 26.7e-3, name: 'една капка' },
  { d: 1e-3, name: '1 mm' },
  { d: 0.1e-3, name: '0,1 mm' },
  { d: 10e-6, name: '10 µm' },
  { d: 1e-6, name: '1 µm' },
];

/** Число с десетична запетая и интервал между хилядите. */
function nice(v: number) {
  if (v >= 1e6) {
    const e = Math.floor(Math.log10(v));
    const sup = String(e).replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);
    return `${(v / 10 ** e).toFixed(1).replace('.', ',')}·10${sup}`;
  }
  if (v >= 100) return Math.round(v).toLocaleString('bg-BG');
  if (v >= 10) return v.toFixed(1).replace('.', ',');
  if (Number.isInteger(v)) return String(v);
  if (v >= 0.1) return v.toFixed(2).replace('.', ',');
  return v.toPrecision(2).replace('.', ',');
}

function duration(min: number) {
  if (min < 120) return `${nice(min)} min`;
  if (min < 60 * 48) return `${nice(min / 60)} h`;
  return `${nice(min / 60 / 24)} дни`;
}

/** Капчиците в квадратно „зрително поле“ – правилна мрежа, по-малки капки → повече в полето. */
function drops(d: number, view: number) {
  if (d >= 20e-3) return [{ x: 100, y: 100, r: 80 }];
  // радиусът в пиксели расте логаритмично, за да се виждат и най-малките капки
  const rPx = Math.max(2, 8 + 6 * Math.log10(d / 1e-6) - 2);
  const step = rPx * 2.3;
  const n = Math.floor(view / step);
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) out.push({ x: step / 2 + i * step + (j % 2) * step * 0.25, y: step / 2 + j * step, r: rPx });
  return out;
}

/** Жлъчката раздробява мазнината на капчици; площта им расте като 1/d и липазата работи по-бързо. */
export default function EmulsionLab() {
  const [k, setK] = useState(0);
  const [bile, setBile] = useState(true);

  const wanted = SIZES[k].d;
  const d = bile ? wanted : Math.max(wanted, D_NO_BILE);
  const merged = !bile && wanted < D_NO_BILE;
  const n = (6 * V) / (Math.PI * d ** 3);
  const area = (6 * V) / d; // m²
  const minutes = MASS / (K * area);
  const dots = drops(d, 200);

  // логаритмична лента за площта: от 0,001 до 100 m²
  const barW = (a: number) => (Math.log10(a / 1e-3) / 5) * 300;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 250" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* зрително поле */}
        <g transform="translate(20 25)">
          <rect width={200} height={200} rx={8} fill="#e0f2fe" className="dark:opacity-80" />
          <clipPath id="emulsion-view">
            <rect width={200} height={200} rx={8} />
          </clipPath>
          <g clipPath="url(#emulsion-view)">
            {dots.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fde047" stroke="#ca8a04" strokeWidth={p.r > 4 ? 1 : 0.5} />
            ))}
          </g>
          <text x={100} y={218} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            капките не са в мащаб
          </text>
        </g>

        {/* площ – логаритмична скала */}
        <g transform="translate(270 40)">
          <text x={0} y={0} fontSize="12" fontWeight="700" fill="currentColor">
            Обща повърхност на капките
          </text>
          <rect x={0} y={14} width={300} height={24} className="fill-gray-100 dark:fill-gray-700" />
          <rect x={0} y={14} width={Math.max(2, barW(area))} height={24} fill="#eab308" />
          {[1e-3, 1e-2, 0.1, 1, 10, 100].map(v => (
            <g key={v}>
              <line x1={barW(v)} x2={barW(v)} y1={38} y2={44} className="stroke-gray-400" />
              <text x={barW(v)} y={56} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {v >= 1 ? v : String(v).replace('.', ',')}
              </text>
            </g>
          ))}
          <text x={300} y={70} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            m² (логаритмична скала)
          </text>

          <text x={0} y={110} fontSize="12" fontWeight="700" fill="currentColor">
            Време, за което липазата разгражда 9 g мазнина
          </text>
          <text x={0} y={140} fontSize="22" fontWeight="700" fill={minutes < 300 ? '#059669' : '#e11d48'}>
            {duration(minutes)}
          </text>
          <text x={0} y={170} fontSize="11" fill="currentColor">
            {merged ? 'Без жлъчни соли капчиците се сливат отново.' : bile ? 'Жлъчните соли обвиват капчиците и не им дават да се слеят.' : 'Едри капки – жлъчката още не е нужна.'}
          </text>
        </g>
      </LabSvg>

      <Buttons>
        {SIZES.map((s, i) => (
          <DiagramButton key={s.name} active={k === i} onClick={() => setK(i)}>
            {s.name}
          </DiagramButton>
        ))}
        <DiagramButton active={bile} onClick={() => setBile(v => !v)}>
          жлъчни соли {bile ? '✓' : '✗'}
        </DiagramButton>
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'капки d', value: d >= 1e-3 ? `${nice(d * 1000)} mm` : `${nice(d * 1e6)} µm`, tone: 'amber' },
            { label: 'брой', value: nice(n), tone: 'blue' },
            { label: 'площ', value: `${nice(area)} m²`, tone: 'emerald' },
          ]}
        />
      </div>
      <Formula>
        A = 6V / d = 6 · 10 cm³ / {d >= 1e-3 ? `${nice(d * 1000)} mm` : `${nice(d * 1e6)} µm`} ≈ {nice(area)} m²
      </Formula>
      <Note tone="amber">
        {k === 0
          ? 'Една голяма капка има площ само около 22 cm² – липазата е разтворена във водата и може да работи само по повърхността.'
          : merged
            ? 'Разбъркването в стомаха и червото раздробява мазнината, но без жлъчни соли капчиците бързо се сливат отново и разграждането е бавно.'
            : 'Всеки път, когато диаметърът на капките намалее 10 пъти, площта им – и скоростта на разграждане – расте 10 пъти. Количеството мазнина не се променя.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 10 cm³ мазнина се разделя на еднакви сферични капки с диаметър d. Броят им е 6V/(πd³), а общата площ – 6V/d. Скоростта на липазата е
        пропорционална на площта; константата ѝ е подбрана само за пример (при капки 1 µm мазнината се разгражда за около 30 min). Без жлъчни соли
        приемаме, че капчиците не остават по-малки от 0,2 mm.
      </p>
    </div>
  );
}
