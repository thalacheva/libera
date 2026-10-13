import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const K = 273.15;
const INSIDE = 21;
const LOSS = 0.4; // топлинни загуби на къщата, kW на градус разлика (примерна къща)
const SUPPLY = 35; // температура на водата в подовото отопление, °C
const HOURS = 24;

/**
 * Термопомпа: взема топлина отвън и с работа W я „изпомпва“ навътре.
 * Опростен модел: истинската помпа постига около половината от Карно между водата (35 °C)
 * и изпарителя (5 градуса под външната температура).
 */
export default function HeatPumpLab() {
  const [out, setOut] = useState(0);
  const [price, setPrice] = useState(0.15);

  const heat = LOSS * (INSIDE - out); // нужна мощност, kW
  const copReal = (0.5 * (SUPPLY + K)) / (SUPPLY - (out - 5));
  const copIdeal = (INSIDE + K) / (INSIDE - out);
  const rows = [
    { name: 'нагревател', cop: 1, tone: 'rose' as const, fill: 'fill-rose-500' },
    { name: 'термопомпа', cop: copReal, tone: 'emerald' as const, fill: 'fill-emerald-500' },
    { name: 'идеална (Карно)', cop: copIdeal, tone: 'blue' as const, fill: 'fill-blue-500' },
  ];
  const kwhDay = (cop: number) => (heat * HOURS) / cop;

  // Потокът: Q₂ отвън + W от мрежата = Q₁ навътре
  const W = heat / copReal;
  const Qout = heat - W;
  const sc = 7; // пиксела на kW
  const barMax = Math.max(...rows.map(r => kwhDay(r.cop)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 250">
        <rect x={10} y={20} width={110} height={110} rx={10} className="fill-sky-100 dark:fill-sky-900/40 stroke-sky-500" strokeWidth="1.5" />
        <Label p={{ x: 65, y: 40 }} size={12} tone="blue">
          навън
        </Label>
        <Label p={{ x: 65, y: 60 }} size={16} tone="blue">
          {`${fmtNum(out, 0)} °C`}
        </Label>
        <rect x={190} y={45} width={100} height={60} rx={8} className="fill-gray-100 dark:fill-gray-700 stroke-gray-500" strokeWidth="1.5" />
        <Label p={{ x: 240, y: 75 }} size={12}>
          термопомпа
        </Label>
        <rect x={360} y={20} width={110} height={110} rx={10} className="fill-orange-100 dark:fill-orange-900/40 stroke-orange-500" strokeWidth="1.5" />
        <Label p={{ x: 415, y: 40 }} size={12} tone="amber">
          вкъщи
        </Label>
        <Label p={{ x: 415, y: 60 }} size={16} tone="amber">
          {`${INSIDE} °C`}
        </Label>
        {/* Ширините на лентите са пропорционални на мощностите */}
        <rect x={120} y={75 - (Qout * sc) / 2} width={70} height={Math.max(Qout * sc, 1)} className="fill-sky-400/70" />
        <Label p={{ x: 155, y: 75 + (Qout * sc) / 2 + 12 }} size={11} tone="blue">
          {`Q₂ = ${fmtNum(Qout, 1)} kW`}
        </Label>
        <rect x={240 - (W * sc) / 2} y={0} width={Math.max(W * sc, 1)} height={45} className="fill-amber-400/80" />
        <Label p={{ x: 240 + (W * sc) / 2 + 6, y: 16 }} size={11} tone="amber" anchor="start">
          {`⚡ W = ${fmtNum(W, 1)} kW`}
        </Label>
        <rect x={290} y={75 - (heat * sc) / 2} width={70} height={Math.max(heat * sc, 1)} className="fill-orange-400/75" />
        <Label p={{ x: 325, y: 75 + (heat * sc) / 2 + 12 }} size={11} tone="rose">
          {`Q₁ = ${fmtNum(heat, 1)} kW`}
        </Label>

        {/* Ток за едно денонощие */}
        <Label p={{ x: 10, y: 160 }} size={11} anchor="start">
          ток за едно денонощие:
        </Label>
        {rows.map((r, i) => (
          <g key={r.name}>
            <Label p={{ x: 130, y: 182 + i * 24 }} size={11} anchor="end" tone={r.tone}>
              {r.name}
            </Label>
            <rect x={138} y={174 + i * 24} width={Math.max((kwhDay(r.cop) / barMax) * 180, 1)} height={16} rx={3} className={r.fill} opacity={0.8} />
            <Label p={{ x: 142 + (kwhDay(r.cop) / barMax) * 180, y: 182 + i * 24 }} size={11} anchor="start">
              {`${fmtNum(kwhDay(r.cop), 1)} kWh · ${fmtNum(kwhDay(r.cop) * price, 2)} €`}
            </Label>
          </g>
        ))}
      </ZoomingSvg>

      <Sliders>
        <Slider label="T₂, °C" value={out} onChange={setOut} min={-20} max={15} step={1} tone="blue" />
        <Slider label="€/kWh" value={price} onChange={setPrice} min={0.05} max={0.4} step={0.01} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'нужни', value: `${fmtNum(heat, 1)} kW` },
            { label: 'COP помпа ≈', value: fmtNum(copReal, 1), tone: 'emerald' },
            { label: 'COP Карно =', value: fmtNum(copIdeal, 1), tone: 'blue' },
            { label: 'за 30 дни', value: `${fmtNum(kwhDay(1) * 30 * price, 0)} € → ${fmtNum(kwhDay(copReal) * 30 * price, 0)} €`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="gray">
        {`Термопомпата не „прави“ топлина от тока – тя пренася ${fmtNum(Qout, 1)} kW отвън и добавя ${fmtNum(W, 1)} kW работа. Колкото по-студено е навън, толкова по-малък е COP.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 T₂ е температурата навън. Примерна къща губи {fmtNum(LOSS, 1)} kW за всеки градус разлика между вътре и вън. COP = Q₁/W показва колко топлина влиза вкъщи
        за единица ток. Моделът на истинската помпа е груб: около половината от границата на Карно при вода за подово отопление 35 °C.
        Цената на тока избери сам.
      </p>
    </div>
  );
}
