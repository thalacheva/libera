import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { atomicMass, formulaText, molarMass, parseFormula } from '../formula';

type Method = 'electrolysis' | 'reduction' | 'roasting';
type Ore = { metal: string; mineral: string; ore: string; method: Method; steps: string[]; note: string };

const ORES: Ore[] = [
  {
    metal: 'Na',
    mineral: 'NaCl',
    ore: 'каменна сол',
    method: 'electrolysis',
    steps: ['2NaCl (стопилка) → 2Na + Cl₂↑ (електролиза при около 600 °C, с добавка на CaCl₂ за по-ниска температура на топене)'],
    note: 'Натрият е толкова активен, че никой химичен редуктор не е удобен за добиването му – остава токът.',
  },
  {
    metal: 'Al',
    mineral: 'Al2O3',
    ore: 'боксит',
    method: 'electrolysis',
    steps: ['Бокситът се пречиства до чист Al₂O₃.', 'Al₂O₃ се разтваря в стопен криолит Na₃AlF₆ при около 950 °C (самият Al₂O₃ се топи над 2000 °C).', '2Al₂O₃ → 4Al + 3O₂ (електролиза; кислородът изгаря въглеродните аноди до CO₂)'],
    note: 'Процесът на Хол и Еру (1886 г.) е много енергоемък – около 14 kWh на килограм алуминий. Затова рециклирането на алуминия пести около 95% от енергията.',
  },
  {
    metal: 'Zn',
    mineral: 'ZnS',
    ore: 'сфалерит (цинкова блende)',
    method: 'reduction',
    steps: ['Пържене: 2ZnS + 3O₂ → 2ZnO + 2SO₂', 'Редукция с въглерод: ZnO + C → Zn + CO (цинкът се изпарява и се кондензира)'],
    note: 'Днес по-голямата част от цинка се получава с електролиза на разтвор на ZnSO₄ – така е по-чист.',
  },
  {
    metal: 'Fe',
    mineral: 'Fe2O3',
    ore: 'хематит',
    method: 'reduction',
    steps: ['В доменната пещ коксът изгаря: C + O₂ → CO₂, после CO₂ + C → 2CO', 'Въглеродният оксид редуцира рудата: Fe₂O₃ + 3CO → 2Fe + 3CO₂', 'Варовикът свързва примесите в шлака: CaCO₃ → CaO + CO₂, CaO + SiO₂ → CaSiO₃'],
    note: 'Получава се чугун – желязо с около 4% въглерод. От него в конвертор с кислород се изгаря излишният въглерод и се получава стомана.',
  },
  {
    metal: 'Cr',
    mineral: 'Cr2O3',
    ore: 'хромов оксид (от хромит)',
    method: 'reduction',
    steps: ['Алуминотермия: Cr₂O₃ + 2Al → Al₂O₃ + 2Cr'],
    note: 'Алуминият е по-активен от хрома и го редуцира с отделяне на много топлина. Така се получава чист хром без въглерод.',
  },
  {
    metal: 'Cu',
    mineral: 'Cu2S',
    ore: 'халкозин',
    method: 'roasting',
    steps: ['Пържене (опростено): Cu₂S + O₂ → 2Cu + SO₂', 'Получената „черна мед“ се пречиства с електролиза до 99,99% Cu.'],
    note: 'Серният диоксид не се изпуска – от него се прави сярна киселина. Така е например в медодобивния завод край Пирдоп.',
  },
  {
    metal: 'Hg',
    mineral: 'HgS',
    ore: 'цинобър',
    method: 'roasting',
    steps: ['Пържене: HgS + O₂ → Hg + SO₂ (живакът излита като пара и се кондензира)'],
    note: 'Живакът е толкова малко активен, че оксидът му се разлага при нагряване – не е нужен редуктор.',
  },
];

const SERIES = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Ni', 'Sn', 'Pb', 'Cu', 'Hg', 'Ag', 'Au'];
const sx = (s: string) => 30 + SERIES.indexOf(s) * 30;
const ZONES: { method: Method; from: string; to: string; label: string; fill: string }[] = [
  { method: 'electrolysis', from: 'K', to: 'Al', label: 'електролиза на стопилки', fill: 'fill-violet-200 dark:fill-violet-900/60' },
  { method: 'reduction', from: 'Zn', to: 'Pb', label: 'редукция с C, CO, Al', fill: 'fill-amber-200 dark:fill-amber-900/60' },
  { method: 'roasting', from: 'Cu', to: 'Au', label: 'пържене, самородни', fill: 'fill-emerald-200 dark:fill-emerald-900/60' },
];

const fmt = (v: number, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('bg-BG', { maximumFractionDigits: d });

/** Как се добива металът според активността му и колко метал дава дадено количество руда. */
export default function ExtractionLab() {
  const [oi, setOi] = useState(3); // Fe
  const [ore, setOre] = useState(10);
  const [purity, setPurity] = useState(80);
  const [eta, setEta] = useState(90);
  const o = ORES[oi];
  const atoms = parseFormula(o.mineral).get(o.metal)!;
  const M = molarMass(o.mineral);
  const w = (atoms * atomicMass(o.metal)) / M;
  const mineralMass = ore * (purity / 100);
  const metalMass = mineralMass * w * (eta / 100);
  const zone = ZONES.find(z => z.method === o.method)!;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ORES.map((x, i) => (
          <DiagramButton key={x.metal} active={i === oi} onClick={() => setOi(i)}>
            {x.metal} от {formulaText(x.mineral)}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 120" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {ZONES.map(z => (
          <g key={z.method}>
            <rect x={sx(z.from) - 14} y={20} width={sx(z.to) - sx(z.from) + 28} height={70} rx={6} className={z.fill} opacity={z === zone ? 1 : 0.45} />
            <text x={(sx(z.from) + sx(z.to)) / 2} y={36} fontSize="10" fontWeight={z === zone ? 700 : 400} textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
              {z.label}
            </text>
          </g>
        ))}
        {SERIES.map(s => (
          <g key={s}>
            <rect x={sx(s) - 13} y={50} width={26} height={26} rx={4} className={s === o.metal ? 'fill-amber-400' : 'fill-white dark:fill-gray-700'} />
            <text x={sx(s)} y={68} fontSize="12" fontWeight={s === o.metal ? 700 : 400} textAnchor="middle" className={s === o.metal ? 'fill-gray-900' : 'fill-gray-700 dark:fill-gray-200'}>
              {s}
            </text>
          </g>
        ))}
        <text x={30} y={110} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          ← по-активни: по-трудно се добиват
        </text>
        <text x={450} y={110} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          по-малко активни: по-лесно →
        </text>
      </LabSvg>

      <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-1">
          Руда: {o.ore} ({formulaText(o.mineral)}) – {zone.label}
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          {o.steps.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <Sliders>
        <Slider label="руда, t" value={ore} onChange={setOre} min={1} max={100} step={1} tone="gray" />
        <Slider label={`${formulaText(o.mineral)} в рудата, %`} value={purity} onChange={setPurity} min={30} max={100} step={5} tone="amber" />
        <Slider label="добив, %" value={eta} onChange={setEta} min={50} max={100} step={5} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: `w(${o.metal}) в ${formulaText(o.mineral)} =`, value: `${atoms === 1 ? '' : atoms + '·'}${atomicMass(o.metal).toString().replace('.', ',')} / ${fmt(M)} = ${fmt(w * 100)}%`, tone: 'amber' },
            { label: `m(${formulaText(o.mineral)}) =`, value: `${fmt(mineralMass, 2)} t` },
            { label: `m(${o.metal}) =`, value: `${fmt(metalMass, 2)} t`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="violet">{o.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 m(метал) = m(руда) · w(минерал в рудата) · w(метал в минерала) · добив. Колкото по-активен е металът, толкова по-здраво е свързан в
        съединенията си и толкова повече енергия струва добиването му. Затова медта, оловото и желязото се използват от хилядолетия, а
        алуминият – едва от края на XIX век.
      </p>
    </div>
  );
}
