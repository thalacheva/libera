import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/**
 * Условен модел на разходите за един тон товар: начален разход (товарене, терминали) + ставка на тон-километър
 * + „цената на времето“ – парите, замразени в стоката, докато пътува (около 0,06% от стойността на ден ≈ 22% годишно).
 * Числата са подбрани по порядък, за да покажат идеята, а не да дават истински тарифи.
 */
const MODES = [
  { key: 'road', name: 'камион', fixed: 5, rate: 0.08, kmDay: 600, wait: 0.5, co2: 80, cls: 'stroke-amber-500', fill: 'fill-amber-500', tone: 'amber' as const },
  { key: 'rail', name: 'влак', fixed: 30, rate: 0.035, kmDay: 400, wait: 1.5, co2: 25, cls: 'stroke-emerald-500', fill: 'fill-emerald-500', tone: 'emerald' as const },
  { key: 'sea', name: 'кораб', fixed: 60, rate: 0.006, kmDay: 650, wait: 4, co2: 10, cls: 'stroke-blue-500', fill: 'fill-blue-500', tone: 'blue' as const },
  { key: 'air', name: 'самолет', fixed: 150, rate: 0.35, kmDay: 12000, wait: 1, co2: 600, cls: 'stroke-rose-500', fill: 'fill-rose-500', tone: 'rose' as const },
];
type Mode = (typeof MODES)[number];

const GOODS: [string, number][] = [
  ['въглища', 100],
  ['зърно', 250],
  ['коли', 15_000],
  ['дрехи', 30_000],
  ['лекарства', 200_000],
  ['смартфони', 2_000_000],
];

const HOLD = 0.0006; // дял от стойността на ден

const days = (m: Mode, d: number) => m.wait + d / m.kmDay;
const freight = (m: Mode, d: number) => m.fixed + m.rate * d;
const total = (m: Mode, d: number, value: number) => freight(m, d) + value * HOLD * days(m, d);

// Графика: x – разстояние до 12 000 km, y – логаритмична скала 10 … 100 000 €/t
const P = { x: 52, y: 20, w: 340, h: 230 };
const DMAX = 12000;
const gx = (d: number) => P.x + (d / DMAX) * P.w;
const gy = (c: number) => P.y + P.h - ((Math.log10(Math.max(c, 10)) - 1) / 4) * P.h;

const money = (c: number) => (c >= 10_000 ? `${fmt(c / 1000, 1)} хил.` : fmt(c));

/** Избор на вид транспорт според разстоянието и стойността на товара. */
export default function ModeLab() {
  const [dist, setDist] = useState(1500);
  const [good, setGood] = useState(3);
  const [water, setWater] = useState(true);
  const value = GOODS[good][1];

  const modes = MODES.filter(m => water || m.key !== 'sea');
  const costs = modes.map(m => ({ m, c: total(m, dist, value) }));
  const best = costs.reduce((a, b) => (b.c < a.c ? b : a));

  // Къде най-евтиният вид се сменя – обхождаме разстоянията през 10 km
  const switches: { d: number; from: string; to: string }[] = [];
  let prev = '';
  for (let d = 10; d <= DMAX; d += 10) {
    const b = modes.reduce((a, m) => (total(m, d, value) < total(a, d, value) ? m : a));
    if (prev && b.name !== prev) switches.push({ d, from: prev, to: b.name });
    prev = b.name;
  }

  const curve = (m: Mode) => {
    let s = '';
    for (let d = 0; d <= DMAX; d += 100) s += `${d ? 'L' : 'M'}${gx(d).toFixed(1)} ${gy(total(m, d, value)).toFixed(1)}`;
    return s;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Оси */}
        {[10, 100, 1000, 10_000, 100_000].map(c => (
          <g key={c}>
            <line x1={P.x} y1={gy(c)} x2={P.x + P.w} y2={gy(c)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={P.x - 5} y={gy(c) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {c >= 1000 ? `${c / 1000} хил.` : c}
            </text>
          </g>
        ))}
        {[0, 3000, 6000, 9000, 12000].map(d => (
          <text key={d} x={gx(d)} y={P.y + P.h + 13} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {fmt(d)}
          </text>
        ))}
        <text x={P.x + P.w} y={P.y + P.h + 26} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          разстояние, km
        </text>
        <text x={P.x - 44} y={P.y - 8} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          общ разход, € за тон (лог. скала)
        </text>
        <line x1={P.x} y1={P.y + P.h} x2={P.x + P.w} y2={P.y + P.h} className="stroke-gray-400" />

        {modes.map(m => (
          <path key={m.key} d={curve(m)} fill="none" className={m.cls} strokeWidth={m === best.m ? 3 : 1.6} />
        ))}
        <line x1={gx(dist)} y1={P.y} x2={gx(dist)} y2={P.y + P.h} className="stroke-gray-500" strokeDasharray="4 3" />
        {costs.map(({ m, c }) => (
          <circle key={m.key} cx={gx(dist)} cy={gy(c)} r={m === best.m ? 5 : 3.5} className={`${m.fill} stroke-white dark:stroke-gray-800`} strokeWidth="1.5" />
        ))}

        {/* Таблица */}
        <text x={418} y={30} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          за {fmt(dist)} km
        </text>
        {['€/t', 'дни', 'kg CO₂/t'].map((h, i) => (
          <text key={h} x={510 + i * 46} y={30} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {h}
          </text>
        ))}
        {MODES.map((m, k) => {
          const on = water || m.key !== 'sea';
          const y = 50 + k * 26;
          return (
            <g key={m.key} opacity={on ? 1 : 0.35}>
              {m === best.m && <rect x={410} y={y - 13} width={222} height={20} rx={4} className="fill-sky-100 dark:fill-sky-900/50" />}
              <rect x={416} y={y - 7} width={10} height={4} className={m.fill} />
              <text x={430} y={y} fontSize="10" className="fill-gray-800 dark:fill-gray-100">
                {m.name}
              </text>
              <text x={510} y={y} fontSize="10" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
                {on ? money(total(m, dist, value)) : '—'}
              </text>
              <text x={556} y={y} fontSize="10" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
                {fmt(days(m, dist), 1)}
              </text>
              <text x={602} y={y} fontSize="10" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
                {fmt((m.co2 * dist) / 1000)}
              </text>
            </g>
          );
        })}
        <text x={418} y={168} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          най-евтино по разстояние:
        </text>
        {switches.length === 0 && (
          <text x={418} y={186} fontSize="10" className="fill-gray-800 dark:fill-gray-100">
            {prev} при всяко разстояние
          </text>
        )}
        {switches.slice(0, 4).map((s, i) => (
          <text key={i} x={418} y={186 + i * 17} fontSize="10" className="fill-gray-800 dark:fill-gray-100">
            {s.from} → {s.to} при ≈ {fmt(s.d)} km
          </text>
        ))}
      </LabSvg>
      <Buttons>
        {GOODS.map(([name], i) => (
          <DiagramButton key={name} active={good === i} onClick={() => setGood(i)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="km" value={dist} onChange={setDist} min={50} max={DMAX} step={50} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={water} onClick={() => setWater(!water)}>
          {water ? 'има воден път ✓' : 'няма воден път'}
        </DiagramButton>
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Избери стоката – тя определя колко струва един тон. Общият разход = начален разход (товарене, терминали) + ставка за всеки тон-километър + „цената на
        времето“: парите, замразени в стоката по пътя (около 0,06% от стойността на ден). Тарифите са условни, подбрани по порядък; въглеродните емисии са
        средни ориентировъчни стойности.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-евтино', value: best.m.name, tone: best.m.tone },
            { label: '1 тон струва', value: `${fmt(value)} €` },
            { label: 'превоз', value: `${money(freight(best.m, dist))} €/t` },
            { label: 'цена на времето', value: `${money(value * HOLD * days(best.m, dist))} €/t` },
          ]}
        />
      </div>
      <Note tone={best.m.key === 'air' ? 'rose' : best.m.key === 'sea' ? 'blue' : 'emerald'}>
        {best.m.key === 'air'
          ? 'Стоката е толкова скъпа, че всеки ден по пътя струва повече от самия полет – затова смартфоните и лекарствата летят.'
          : best.m.key === 'sea'
            ? 'На големи разстояния корабът е несравнимо най-евтин на тон-километър – по море минава над 80% от световната търговия по тегло.'
            : best.m.key === 'rail'
              ? 'На средни разстояния влакът печели: началният разход е по-голям, но тон-километърът е по-евтин от този на камиона.'
              : 'На къси разстояния камионът е най-удобен: малък начален разход и доставка „от врата до врата“.'}
      </Note>
    </div>
  );
}
