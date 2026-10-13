import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, pow10, sig } from '../sim';

type Item = { name: string; icon: string; value: number };
type Scale = { id: string; title: string; unit: string; items: Item[] };

// Приблизителни стойности – важен е порядъкът, не точното число
const SCALES: Scale[] = [
  {
    id: 'length',
    title: 'Дължина',
    unit: 'm',
    items: [
      { name: 'протон', icon: '⚛️', value: 1.7e-15 },
      { name: 'атом на водорода', icon: '⚛️', value: 1e-10 },
      { name: 'вирус на грипа', icon: '🦠', value: 1e-7 },
      { name: 'червено кръвно телце', icon: '🩸', value: 7.5e-6 },
      { name: 'дебелина на косъм', icon: '💇', value: 7e-5 },
      { name: 'мравка', icon: '🐜', value: 5e-3 },
      { name: 'човек', icon: '🧍', value: 1.7 },
      { name: 'връх Мусала', icon: '🏔️', value: 2925 },
      { name: 'диаметър на Земята', icon: '🌍', value: 1.27e7 },
      { name: 'Земята – Луната', icon: '🌙', value: 3.84e8 },
      { name: 'Земята – Слънцето', icon: '☀️', value: 1.5e11 },
      { name: 'светлинна година', icon: '✨', value: 9.46e15 },
      { name: 'Млечният път', icon: '🌌', value: 9.5e20 },
      { name: 'наблюдаемата Вселена', icon: '🔭', value: 8.8e26 },
    ],
  },
  {
    id: 'mass',
    title: 'Маса',
    unit: 'kg',
    items: [
      { name: 'електрон', icon: '⚛️', value: 9.11e-31 },
      { name: 'протон', icon: '⚛️', value: 1.67e-27 },
      { name: 'бактерия E. coli', icon: '🦠', value: 1e-15 },
      { name: 'комар', icon: '🦟', value: 2.5e-6 },
      { name: 'монета от 1 €', icon: '🪙', value: 7.5e-3 },
      { name: 'човек', icon: '🧍', value: 70 },
      { name: 'автомобил', icon: '🚗', value: 1500 },
      { name: 'син кит', icon: '🐋', value: 1.5e5 },
      { name: 'пирамидата на Хеопс', icon: '🔺', value: 6e9 },
      { name: 'Луната', icon: '🌙', value: 7.35e22 },
      { name: 'Земята', icon: '🌍', value: 5.97e24 },
      { name: 'Слънцето', icon: '☀️', value: 1.99e30 },
      { name: 'Млечният път', icon: '🌌', value: 2e42 },
    ],
  },
  {
    id: 'time',
    title: 'Време',
    unit: 's',
    items: [
      { name: 'светлината прелита през атом', icon: '⚛️', value: 3.3e-19 },
      { name: 'едно трептене на зелена светлина', icon: '🟢', value: 1.7e-15 },
      { name: 'такт на процесор (3 GHz)', icon: '💻', value: 3.3e-10 },
      { name: 'мигване', icon: '👁️', value: 0.3 },
      { name: 'удар на сърцето', icon: '❤️', value: 0.8 },
      { name: 'денонощие', icon: '🌗', value: 86400 },
      { name: 'година', icon: '📅', value: 3.16e7 },
      { name: 'човешки живот', icon: '🧓', value: 2.5e9 },
      { name: 'от появата на писмеността', icon: '📜', value: 1.6e11 },
      { name: 'от изчезването на динозаврите', icon: '🦖', value: 2.1e15 },
      { name: 'възрастта на Земята', icon: '🌍', value: 1.43e17 },
      { name: 'възрастта на Вселената', icon: '🌌', value: 4.35e17 },
    ],
  },
];

const PREFIXES: [number, string, string][] = [
  [-18, 'а', 'ато'],
  [-15, 'f', 'фемто'],
  [-12, 'p', 'пико'],
  [-9, 'n', 'нано'],
  [-6, 'µ', 'микро'],
  [-3, 'm', 'мили'],
  [0, '', ''],
  [3, 'k', 'кило'],
  [6, 'M', 'мега'],
  [9, 'G', 'гига'],
  [12, 'T', 'тера'],
];

/** Стойността с най-подходящата представка: 7,5 · 10⁻⁶ m → „7,5 µm (микро)“. Килограмът е изключение – представките са към грама. */
function withPrefix(v: number, unit: string) {
  const [base, value] = unit === 'kg' ? ['g', v * 1000] : [unit, v];
  if (unit === 's' && v >= 60) return null;
  const e = Math.floor(Math.log10(value) / 3) * 3;
  const p = PREFIXES.find(([pe]) => pe === e);
  if (!p) return null;
  return `${fmtNum(Number((value / 10 ** e).toPrecision(3)), 2)} ${p[1]}${base}${p[2] ? ` (${p[2]})` : ''}`;
}

const L = 22;
const R = 458;

/** Скала от атома до Вселената: всяко деление е 10 пъти повече от предишното. */
export default function ScaleLab() {
  const [k, setK] = useState(0);
  const scale = SCALES[k];
  const [a, setA] = useState(1);
  const [b, setB] = useState(6);
  const items = scale.items;
  const A = items[Math.min(a, items.length - 1)];
  const B = items[Math.min(b, items.length - 1)];

  const lo = Math.floor(Math.log10(items[0].value)) - 1;
  const hi = Math.ceil(Math.log10(items[items.length - 1].value)) + 1;
  const x = (v: number) => L + ((Math.log10(v) - lo) / (hi - lo)) * (R - L);
  const ticks = [];
  for (let e = Math.ceil(lo / 5) * 5; e <= hi; e += 5) ticks.push(e);

  const ratio = B.value / A.value;
  const orders = Math.round(Math.log10(ratio));
  const [big, small] = ratio >= 1 ? [B, A] : [A, B];

  const choose = (i: number) => {
    setK(i);
    setA(1);
    setB(6);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SCALES.map((s, i) => (
          <DiagramButton key={s.id} active={i === k} onClick={() => choose(i)}>
            {s.title}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 150">
        {/* Една десетична степен на всяка чертичка */}
        {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map(e => (
          <line key={e} x1={x(10 ** e)} y1={80} x2={x(10 ** e)} y2={e % 5 === 0 ? 90 : 85} className="stroke-gray-400 dark:stroke-gray-500" />
        ))}
        <line x1={L} y1={80} x2={R} y2={80} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {ticks.map(e => (
          <Label key={e} p={{ x: x(10 ** e), y: 104 }} size={12} weight={500}>
            {pow10(e)}
          </Label>
        ))}
        <Label p={{ x: R, y: 122 }} size={12} anchor="end">
          {scale.unit}
        </Label>
        {items.map((it, i) => {
          const chosen = it === A || it === B;
          return (
            <circle
              key={it.name}
              cx={x(it.value)}
              cy={80}
              r={chosen ? 6 : 3.5}
              className={chosen ? (it === A ? 'fill-blue-500' : 'fill-rose-500') : 'fill-gray-400 dark:fill-gray-500'}
              onClick={() => (i < b ? setA(i) : setB(i))}
            />
          );
        })}
        {[A, B].map((it, i) => (
          <g key={i}>
            <line x1={x(it.value)} y1={80} x2={x(it.value)} y2={i ? 52 : 36} className={i ? 'stroke-rose-500' : 'stroke-blue-500'} strokeDasharray="3 3" />
            <text x={x(it.value)} y={i ? 42 : 22} fontSize={20} textAnchor="middle" dominantBaseline="central">
              {it.icon}
            </text>
          </g>
        ))}
        {A !== B && (
          <>
            <line x1={x(A.value)} y1={138} x2={x(B.value)} y2={138} className="stroke-amber-500" strokeWidth="2" />
            <Label p={{ x: (x(A.value) + x(B.value)) / 2, y: 138 }} size={12} tone="amber">
              {Math.abs(orders) === 1 ? '1 порядък' : `${Math.abs(orders)} порядъка`}
            </Label>
          </>
        )}
      </ZoomingSvg>

      <Sliders>
        <Slider label="A" value={a} onChange={setA} min={0} max={items.length - 1} step={1} tone="blue" />
        <Slider label="B" value={b} onChange={setB} min={0} max={items.length - 1} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3 space-y-2">
        {[
          [A, 'blue'],
          [B, 'rose'],
        ].map(([it, tone]) => {
          const item = it as Item;
          const prefixed = withPrefix(item.value, scale.unit);
          return (
            <Readout
              key={tone as string}
              items={[
                { label: `${item.icon} ${item.name}`, value: '', tone: tone as 'blue' | 'rose' },
                { label: '≈', value: `${sig(item.value, 3)} ${scale.unit}` },
                ...(prefixed ? [{ label: '=', value: prefixed }] : []),
              ]}
            />
          );
        })}
      </div>
      <Note tone="amber">
        {A === B
          ? 'Избери два различни обекта.'
          : `${big.name} : ${small.name} ≈ ${orders === 0 ? 1 : pow10(Math.abs(orders))} (по-точно ${sig(Math.max(ratio, 1 / ratio), 2)})`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Скалата е логаритмична: всяка чертичка е 10 пъти повече от предишната. Само така на един ред се събират протонът и Вселената.
        Стойностите са приблизителни – важен е порядъкът.
      </p>
    </div>
  );
}
