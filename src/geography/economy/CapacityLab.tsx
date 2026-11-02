import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt, rad, sunDeclination } from '../geo';

const X0 = 50;
const X1 = 590;
const T0 = 24;
const B0 = 280;
const HOURS = 8760;

// ---------- Вятър ----------

const RATED = 4; // MW
const CUT_IN = 3;
const V_RATED = 12;
const CUT_OUT = 25;
const VMAX = 26;

/** Крива на мощността на турбина 4 MW (ротор около 120 m): под номиналната скорост мощността расте като v³. */
const power = (v: number) => (v < CUT_IN || v >= CUT_OUT ? 0 : v >= V_RATED ? 1 : (v ** 3 - CUT_IN ** 3) / (V_RATED ** 3 - CUT_IN ** 3));
/** Разпределение на Рейли – обичайно приближение за скоростта на вятъра при средна скорост vm. */
const rayleigh = (v: number, vm: number) => (Math.PI / 2) * (v / vm ** 2) * Math.exp((-Math.PI / 4) * (v / vm) ** 2);

// ---------- Слънце ----------

/** Слънчева радиация върху хоризонтална площ при ясно небе, kWh/m² за денонощие (модел на Майнел с разсеяна светлина). */
function clearDay(lat: number, doy: number) {
  const d = rad(sunDeclination(doy));
  const f = rad(lat);
  let e = 0;
  for (let m = 0; m < 1440; m += 10) {
    const h = rad((m / 60 - 12) * 15);
    const s = Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(h);
    if (s <= 0.01) continue;
    e += 1.2 * 1361 * 0.7 ** ((1 / s) ** 0.678) * s * (10 / 60);
  }
  return e / 1000;
}
const MONTH_DAY = [15, 46, 75, 106, 136, 167, 197, 228, 259, 289, 320, 350];
const MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ['Я', 'Ф', 'М', 'А', 'М', 'Ю', 'Ю', 'А', 'С', 'О', 'Н', 'Д'];
/** Ширина и загуба от облаците (%), подбрана така, че годишната радиация да е близо до данните на Global Solar Atlas. */
const PLACES = [
  { name: 'Кайро', lat: 30, cloud: 8 },
  { name: 'Атина', lat: 38, cloud: 21 },
  { name: 'София', lat: 42.7, cloud: 25 },
  { name: 'Берлин', lat: 52.5, cloud: 32 },
  { name: 'Осло', lat: 59.9, cloud: 30 },
];
/** Добив от 1 kWp: наклонените панели хващат около 10% повече, а загубите в системата са около 20%. */
const YIELD_FACTOR = 1.1 * 0.8;

/** Коефициент на използване на вятърна и соларна централа: колко от възможната енергия наистина се произвежда. */
export default function CapacityLab() {
  const [mode, setMode] = useState<'wind' | 'solar'>('wind');
  const [vm, setVm] = useState(6.5);
  const [lat, setLat] = useState(42.7);
  const [cloud, setCloud] = useState(25);

  const windData = useMemo(() => {
    const bins: { v: number; p: number; e: number }[] = [];
    let cf = 0;
    for (let v = 0.5; v < VMAX; v += 1) {
      // Вероятност за интервала [v − 0,5; v + 0,5], пресметната по-ситно
      let p = 0;
      let e = 0;
      for (let u = v - 0.5 + 0.025; u < v + 0.5; u += 0.05) {
        p += rayleigh(u, vm) * 0.05;
        e += rayleigh(u, vm) * power(u) * 0.05;
      }
      bins.push({ v, p, e });
      cf += e;
    }
    return { bins, cf };
  }, [vm]);

  const solarData = useMemo(() => {
    const months = MONTH_DAY.map((d, i) => ({ clear: clearDay(lat, d), days: MONTH_LEN[i] }));
    const k = 1 - cloud / 100;
    const yearClear = months.reduce((a, m) => a + m.clear * m.days, 0);
    const year = yearClear * k;
    const yieldKwp = year * YIELD_FACTOR;
    return { months, k, year, yieldKwp, cf: yieldKwp / HOURS };
  }, [lat, cloud]);

  const cf = mode === 'wind' ? windData.cf : solarData.cf;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'wind'} onClick={() => setMode('wind')}>
          💨 Вятърна турбина
        </DiagramButton>
        <DiagramButton active={mode === 'solar'} onClick={() => setMode('solar')}>
          ☀️ Соларен парк
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        {mode === 'wind' ? <WindChart bins={windData.bins} /> : <SolarChart months={solarData.months} k={solarData.k} />}
      </div>
      {mode === 'solar' && (
        <Buttons>
          {PLACES.map(p => (
            <DiagramButton
              key={p.name}
              active={lat === p.lat && cloud === p.cloud}
              onClick={() => {
                setLat(p.lat);
                setCloud(p.cloud);
              }}
            >
              {p.name}
            </DiagramButton>
          ))}
        </Buttons>
      )}
      <Sliders>
        {mode === 'wind' ? (
          <Slider label="v̄, m/s" value={vm} onChange={setVm} min={3} max={10} step={0.1} tone="emerald" />
        ) : (
          <>
            <Slider label="φ, °" value={lat} onChange={setLat} min={0} max={65} step={0.1} tone="blue" />
            <Slider label="облаци" value={cloud} onChange={setCloud} min={0} max={60} step={1} tone="gray" />
          </>
        )}
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {mode === 'wind'
          ? 'v̄ – средната скорост на вятъра на височината на ротора. Стълбчетата показват колко часа в годината духа с дадена скорост, кривата – каква част от 4 MW дава турбината. Зеленото е енергията, която идва от всяка скорост.'
          : 'φ – географската ширина; облаци – с колко процента облаците намаляват радиацията спрямо ясно небе. Сивите стълбчета са радиацията при ясно небе, жълтите – реалната средна стойност за всеки месец.'}
      </p>
      <div className="mt-3">
        <Readout
          items={
            mode === 'wind'
              ? [
                  { label: 'КИ', value: `${fmt(cf * 100)}%`, tone: 'emerald' },
                  { label: 'за година', value: `${fmt(cf * RATED * HOURS / 1000, 1)} GWh`, tone: 'blue' },
                  { label: 'домакинства по 4000 kWh', value: `≈ ${fmt(Math.round((cf * RATED * HOURS * 1000) / 4000 / 100) * 100)}`, tone: 'gray' },
                ]
              : [
                  { label: 'радиация', value: `${fmt(solarData.year)} kWh/m²`, tone: 'amber' },
                  { label: '1 kWp дава', value: `${fmt(solarData.yieldKwp)} kWh`, tone: 'blue' },
                  { label: 'КИ', value: `${fmt(cf * 100, 1)}%`, tone: 'emerald' },
                ]
          }
        />
      </div>
      <Note tone="blue">
        {mode === 'wind'
          ? vm < 5
            ? 'При слаб вятър турбината стои почти неподвижна – мястото не е подходящо.'
            : `Мощността расте като v³: при средна скорост ${fmt(vm, 1)} m/s турбината дава средно ${fmt(cf * 100)}% от номиналната си мощност.`
          : `1 MW соларни панели тук произвеждат около ${fmt(solarData.yieldKwp / 1000, 2)} GWh годишно – колкото 1 MW, работещ на пълна мощност ${fmt(solarData.cf * HOURS)} часа.`}
      </Note>
    </div>
  );
}

function WindChart({ bins }: { bins: { v: number; p: number; e: number }[] }) {
  const pMax = Math.max(0.16, ...bins.map(b => b.p));
  const xOf = (v: number) => X0 + (v / VMAX) * (X1 - X0);
  const yH = (p: number) => B0 - (p / pMax) * (B0 - T0);
  const yP = (f: number) => B0 - f * (B0 - T0);
  const w = (X1 - X0) / VMAX;
  const curve: string[] = [];
  for (let v = 0; v <= VMAX; v += 0.1) curve.push(`${xOf(v).toFixed(1)},${yP(power(v)).toFixed(1)}`);
  return (
    <LabSvg viewBox="0 0 640 310" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={X0} y1={yP(f)} x2={X1} y2={yP(f)} className="stroke-gray-200 dark:stroke-gray-700" />
          <text x={X1 + 6} y={yP(f) + 3} fontSize="10" className="fill-rose-600 dark:fill-rose-400">
            {fmt(f * RATED)}
          </text>
        </g>
      ))}
      {[0, 500, 1000].map(h => (
        <text key={h} x={X0 - 6} y={yH(h / HOURS) + 3} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
          {h}
        </text>
      ))}
      <text x={X0 - 6} y={T0 - 10} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
        часа/год.
      </text>
      <text x={X1 + 30} y={T0 - 10} fontSize="10" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
        MW
      </text>
      {bins.map(b => (
        <g key={b.v}>
          <rect x={xOf(b.v - 0.5) + 1} y={yH(b.p)} width={w - 2} height={B0 - yH(b.p)} className="fill-sky-300/60 dark:fill-sky-700/60" />
          <rect x={xOf(b.v - 0.5) + 1} y={yH(b.e)} width={w - 2} height={B0 - yH(b.e)} className="fill-emerald-500/80" />
        </g>
      ))}
      <polyline points={curve.join(' ')} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
      {[0, 5, 10, 15, 20, 25].map(v => (
        <text key={v} x={xOf(v)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {v}
        </text>
      ))}
      <text x={X1} y={B0 + 27} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
        скорост на вятъра, m/s
      </text>
      <text x={xOf(CUT_IN)} y={yP(0) - 6} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
        тръгва
      </text>
      <text x={xOf(V_RATED) + 4} y={yP(1) - 6} fontSize="9" className="fill-gray-500 dark:fill-gray-400">
        номинална мощност
      </text>
      <text x={xOf(CUT_OUT) - 4} y={yP(1) + 14} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
        спира при буря →
      </text>
    </LabSvg>
  );
}

function SolarChart({ months, k }: { months: { clear: number; days: number }[]; k: number }) {
  const max = 10;
  const yOf = (v: number) => B0 - (v / max) * (B0 - T0);
  const w = (X1 - X0) / 12;
  return (
    <LabSvg viewBox="0 0 640 310" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
      {[0, 2, 4, 6, 8, 10].map(v => (
        <g key={v}>
          <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
          <text x={X0 - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {v}
          </text>
        </g>
      ))}
      <text x={X0 - 6} y={T0 - 10} fontSize="10" textAnchor="start" className="fill-gray-500 dark:fill-gray-400">
        kWh/m² за денонощие
      </text>
      {months.map((m, i) => (
        <g key={i}>
          <rect x={X0 + i * w + 6} y={yOf(m.clear)} width={w - 12} height={B0 - yOf(m.clear)} className="fill-gray-300 dark:fill-gray-600" />
          <rect x={X0 + i * w + 12} y={yOf(m.clear * k)} width={w - 24} height={B0 - yOf(m.clear * k)} className="fill-amber-400" />
          <text x={X0 + (i + 0.5) * w} y={yOf(m.clear * k) - 4} fontSize="10" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            {fmt(m.clear * k, 1)}
          </text>
          <text x={X0 + (i + 0.5) * w} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {MONTHS[i]}
          </text>
        </g>
      ))}
    </LabSvg>
  );
}
