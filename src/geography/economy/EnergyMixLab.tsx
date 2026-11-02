import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const X0 = 46;
const X1 = 610;
const T0 = 40;
const B0 = 290;
const STEPS = 96; // през 15 минути
const HYDRO = 1.5; // GW, ВЕЦ, които могат да се включват при нужда
const GAS = 1; // GW, газови централи

/** Стилизирано потребление в България през делничен ден, GW (часове 0…24). */
const LOAD = {
  summer: [3.9, 3.7, 3.6, 3.5, 3.5, 3.6, 3.9, 4.2, 4.5, 4.7, 4.8, 4.9, 4.9, 4.9, 4.9, 4.9, 4.8, 4.8, 4.8, 4.9, 5.0, 5.2, 5.0, 4.5, 3.9],
  winter: [4.8, 4.5, 4.4, 4.4, 4.5, 4.8, 5.4, 5.9, 6.1, 6.0, 5.8, 5.7, 5.6, 5.5, 5.5, 5.6, 5.9, 6.4, 6.6, 6.5, 6.3, 6.0, 5.7, 5.3, 4.8],
};
/** Изгрев, залез (по часовника) и най-голямата част от мощността на соларите при ясно небе. */
const SUN = {
  summer: { rise: 6, set: 20.8, peak: 0.72 },
  winter: { rise: 7.8, set: 17.1, peak: 0.45 },
};

/** g CO₂ на kWh за целия жизнен цикъл – медиани по IPCC (2014); за лигнита – по-високата стойност на прякото изгаряне. */
const SOURCES = [
  { key: 'nuclear', name: 'АЕЦ', fill: 'fill-violet-500', co2: 12 },
  { key: 'coal', name: 'Въглища', fill: 'fill-stone-500', co2: 1100 },
  { key: 'wind', name: 'Вятър', fill: 'fill-teal-500', co2: 11 },
  { key: 'solar', name: 'Слънце', fill: 'fill-amber-400', co2: 45 },
  { key: 'hydro', name: 'ВЕЦ', fill: 'fill-sky-500', co2: 24 },
  { key: 'gas', name: 'Газ', fill: 'fill-orange-500', co2: 490 },
  { key: 'import', name: 'Внос', fill: 'fill-rose-400', co2: 0 },
] as const;
type Key = (typeof SOURCES)[number]['key'];

function interp(arr: number[], h: number) {
  const i = Math.floor(h);
  const f = h - i;
  return arr[i] * (1 - f) + arr[Math.min(i + 1, 24)] * f;
}

/** Електроенергийният микс през едно денонощие: кой източник покрива потреблението във всеки час. */
export default function EnergyMixLab() {
  const [season, setSeason] = useState<'summer' | 'winter'>('summer');
  const [sunny, setSunny] = useState(true);
  const [windy, setWindy] = useState(false);
  const [nuclear, setNuclear] = useState(2);
  const [coal, setCoal] = useState(2.5);
  const [solar, setSolar] = useState(4);
  const [wind, setWind] = useState(0.7);

  const sim = useMemo(() => {
    const sun = SUN[season];
    const rows: (Record<Key, number> & { h: number; load: number; surplus: number })[] = [];
    for (let k = 0; k <= STEPS; k++) {
      const h = (k / STEPS) * 24;
      const load = interp(LOAD[season], h);
      const x = (h - sun.rise) / (sun.set - sun.rise);
      const s = x > 0 && x < 1 ? solar * sun.peak * Math.sin(Math.PI * x) ** 1.3 * (sunny ? 1 : 0.25) : 0;
      const w = wind * (windy ? 0.55 + 0.12 * Math.sin((2 * Math.PI * (h - 3)) / 24) : 0.06);
      const coalMin = 0.4 * coal;
      let net = load - nuclear - s - w - coalMin;
      let coalOut = coalMin;
      let hydro = 0;
      let gas = 0;
      let imp = 0;
      let surplus = 0;
      if (net < 0) surplus = -net;
      else {
        const extra = Math.min(net, coal - coalMin);
        coalOut += extra;
        net -= extra;
        hydro = Math.min(net, HYDRO);
        net -= hydro;
        gas = Math.min(net, GAS);
        imp = net - gas;
      }
      rows.push({ h, load, nuclear, coal: coalOut, wind: w, solar: s, hydro, gas, import: imp, surplus });
    }
    // Енергия за денонощието, GWh (метод на трапеците)
    const energy = {} as Record<Key | 'surplus' | 'load', number>;
    for (const key of [...SOURCES.map(s => s.key), 'surplus', 'load'] as const) {
      let e = 0;
      for (let k = 0; k < STEPS; k++) e += ((rows[k][key] + rows[k + 1][key]) / 2) * (24 / STEPS);
      energy[key] = e;
    }
    return { rows, energy };
  }, [season, sunny, windy, nuclear, coal, solar, wind]);

  const domestic = SOURCES.filter(s => s.key !== 'import').reduce((a, s) => a + sim.energy[s.key], 0);
  const co2 = domestic > 0 ? SOURCES.reduce((a, s) => a + sim.energy[s.key] * s.co2, 0) / domestic : 0;
  const lowCarbon = domestic > 0 ? ((sim.energy.nuclear + sim.energy.wind + sim.energy.solar + sim.energy.hydro) / domestic) * 100 : 0;

  const top = Math.max(...sim.rows.map(r => SOURCES.reduce((a, s) => a + r[s.key], 0)), ...sim.rows.map(r => r.load));
  const ymax = Math.max(8, Math.ceil(top));
  const xOf = (h: number) => X0 + (h / 24) * (X1 - X0);
  const yOf = (v: number) => B0 - (v / ymax) * (B0 - T0);

  // Слоевете се натрупват един върху друг
  const layers = SOURCES.map((src, i) => {
    const lower = sim.rows.map(r => SOURCES.slice(0, i).reduce((a, s) => a + r[s.key], 0));
    const upper = sim.rows.map((r, k) => lower[k] + r[src.key]);
    const pts = [
      ...sim.rows.map((r, k) => `${xOf(r.h).toFixed(1)},${yOf(upper[k]).toFixed(1)}`),
      ...sim.rows.map((r, k) => `${xOf(r.h).toFixed(1)},${yOf(lower[k]).toFixed(1)}`).reverse(),
    ];
    return { src, pts: pts.join(' ') };
  });
  const loadPts = sim.rows.map(r => `${xOf(r.h).toFixed(1)},${yOf(r.load).toFixed(1)}`).join(' ');

  const share = (k: Key) => (domestic > 0 ? `${fmt((sim.energy[k] / domestic) * 100)}%` : '–');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {SOURCES.map((s, i) => (
          <g key={s.key} transform={`translate(${X0 + i * 82}, 12)`}>
            <rect width="12" height="12" rx="2" className={s.fill} />
            <text x="16" y="10" fontSize="11" className="fill-gray-700 dark:fill-gray-200">
              {s.name}
            </text>
          </g>
        ))}
        {Array.from({ length: ymax + 1 }, (_, v) => v)
          .filter(v => v % (ymax > 10 ? 2 : 1) === 0)
          .map(v => (
            <g key={v}>
              <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
              <text x={X0 - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
                {v}
              </text>
            </g>
          ))}
        <text x={X0 - 6} y={T0 - 6} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          GW
        </text>
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
          <text key={h} x={xOf(h)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {h}:00
          </text>
        ))}
        {layers.map(({ src, pts }) => (
          <polygon key={src.key} points={pts} className={`${src.fill} opacity-90`} />
        ))}
        <polyline points={loadPts} fill="none" className="stroke-gray-900 dark:stroke-white" strokeWidth="2.5" />
        <text x={X1 - 2} y={yOf(sim.rows[STEPS - 4].load) - 6} fontSize="11" textAnchor="end" className="fill-gray-900 dark:fill-white font-semibold">
          потребление
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={season === 'summer'} onClick={() => setSeason('summer')}>
          Лято
        </DiagramButton>
        <DiagramButton active={season === 'winter'} onClick={() => setSeason('winter')}>
          Зима
        </DiagramButton>
        <DiagramButton active={sunny} onClick={() => setSunny(!sunny)}>
          {sunny ? '☀️ Слънчево' : '☁️ Облачно'}
        </DiagramButton>
        <DiagramButton active={windy} onClick={() => setWindy(!windy)}>
          {windy ? '💨 Ветровито' : '🍃 Тихо'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="АЕЦ" value={nuclear} onChange={setNuclear} min={0} max={4} step={0.5} tone="violet" />
        <Slider label="ТЕЦ" value={coal} onChange={setCoal} min={0} max={4} step={0.1} tone="gray" />
        <Slider label="ФЕЦ" value={solar} onChange={setSolar} min={0} max={12} step={0.5} tone="amber" />
        <Slider label="ВяЕЦ" value={wind} onChange={setWind} min={0} max={4} step={0.1} tone="emerald" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Инсталирана мощност в GW: АЕЦ – атомни, ТЕЦ – въглищни (не могат да работят под 40% от мощността си), ФЕЦ – соларни, ВяЕЦ – вятърни централи. ВЕЦ (до{' '}
        {fmt(HYDRO, 1)} GW) и газът (до {fmt(GAS)} GW) се включват при нужда, а ако не стигат – внос. Потреблението е стилизирано по делничен ден в България;
        стойностите по подразбиране са близки до днешните мощности.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'АЕЦ', value: share('nuclear'), tone: 'violet' },
            { label: 'въглища', value: share('coal'), tone: 'gray' },
            { label: 'слънце', value: share('solar'), tone: 'amber' },
            { label: 'нисковъглеродни', value: `${fmt(lowCarbon)}%`, tone: 'emerald' },
            { label: 'CO₂', value: `${fmt(co2)} g/kWh`, tone: 'rose' },
          ]}
        />
      </div>
      <div className="mt-2">
        <Readout
          items={[
            { label: 'излишък', value: `${fmt(sim.energy.surplus, 1)} GWh`, tone: 'amber' },
            { label: 'внос', value: `${fmt(sim.energy.import, 1)} GWh`, tone: 'rose' },
            { label: 'за денонощието', value: `${fmt(sim.energy.load)} GWh`, tone: 'gray' },
          ]}
        />
      </div>
      <Note tone="blue">
        {sim.energy.surplus > 1
          ? `Около обед централите произвеждат повече, отколкото се потребява – ${fmt(sim.energy.surplus, 1)} GWh трябва да се изнесат, да се запазят в батерии и ПАВЕЦ или соларите да се изключат.`
          : sim.energy.import > 1
            ? `Вечер, когато слънцето залезе, не стига мощност – ${fmt(sim.energy.import, 1)} GWh идват от внос.`
            : 'Потреблението е покрито без излишък и без внос. Опитай без въглищните централи (по плановете те трябва да спрат до 2038 г.) или с повече соларни централи през лятото.'}
      </Note>
    </div>
  );
}
