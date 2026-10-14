import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 250;
const X0 = 30;
const X1 = 610;
const AXIS_Y = 150;
const LOG_MIN = 0; // 1 m
const LOG_MAX = 27; // 10²⁷ m
const C = 2.998e8; // m/s
const EARTH = 1.2742e7; // диаметър на Земята, m
const LY = 9.4607e15; // m

type Item = { name: string; size: number; what: string; note: string };

/** Размери и разстояния от човека до наблюдаемата Вселена (закръглени). */
const ITEMS: Item[] = [
  { name: 'Човек', size: 1.7, what: 'ръст', note: 'Отправната точка: всичко останало е толкова пъти по-голямо от нас.' },
  { name: 'Земята', size: EARTH, what: 'диаметър', note: 'Около 12 700 km – самолет би я обиколил за около два дни.' },
  { name: 'Земя – Луна', size: 3.844e8, what: 'разстояние', note: 'Между Земята и Луната се побират около 30 Земи една до друга.' },
  { name: 'Слънцето', size: 1.3927e9, what: 'диаметър', note: 'В Слънцето биха се побрали над милион Земи.' },
  { name: 'Земя – Слънце (1 AU)', size: 1.496e11, what: 'разстояние', note: 'Астрономическата единица – мярката за разстоянията в Слънчевата система.' },
  { name: 'Орбитата на Нептун', size: 9.0e12, what: 'диаметър', note: 'Нептун е на около 30 AU от Слънцето.' },
  { name: 'Вояджър 1', size: 2.5e13, what: 'разстояние', note: 'Най-далечният апарат, създаден от човека – над 160 AU (2020-те години).' },
  { name: 'Проксима Кентавър', size: 4.01e16, what: 'разстояние', note: 'Най-близката звезда след Слънцето – 4,24 светлинни години.' },
  { name: 'Млечният път', size: 9.5e20, what: 'диаметър', note: 'Около 100 000 светлинни години и стотици милиарди звезди.' },
  { name: 'Галактиката Андромеда', size: 2.4e22, what: 'разстояние', note: 'Около 2,5 милиона светлинни години – най-далечното, което се вижда с просто око.' },
  { name: 'Наблюдаемата Вселена', size: 8.8e26, what: 'диаметър', note: 'Около 93 милиарда светлинни години – по-далеч светлината още не е стигнала до нас.' },
];

const sx = (log: number) => X0 + ((log - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

/** Разстояние с подходяща единица. */
function human(m: number) {
  if (m < 1e4) return `${fmt(m, 1)} m`;
  if (m < 1e10) return `${fmt(m / 1e3, 0)} km`;
  if (m < 1e14) return `${fmt(m / 1.496e11, m < 1e12 ? 2 : 0)} AU`;
  return `${fmt(m / LY, m < 1e18 ? 2 : 0)} светлинни години`;
}

/** Време за светлината с подходяща единица. */
function lightTime(m: number) {
  const t = m / C;
  if (t < 1e-3) return `${sci(t * 1e9, 1)} ns`;
  if (t < 120) return `${fmt(t, 2)} s`;
  if (t < 7200) return `${fmt(t / 60, 1)} min`;
  if (t < 3 * 86400) return `${fmt(t / 3600, 1)} h`;
  const years = t / 3.156e7;
  return years < 1e6 ? `${fmt(years, years < 10 ? 2 : 0)} години` : `${sci(years, 1)} години`;
}

/** Колко е обектът в модел, в който Земята е топче с диаметър 1 cm. */
function model(m: number) {
  const cm = m / EARTH;
  if (cm < 1e-4) return `${fmt(cm * 1e7, 1)} nm`;
  if (cm < 100) return `${fmt(cm, cm < 1 ? 3 : 1)} cm`;
  if (cm < 1e5) return `${fmt(cm / 100, cm < 1000 ? 1 : 0)} m`;
  return `${sci(cm / 1e5, 1)} km`;
}

export default function CosmicScaleLab() {
  const [i, setI] = useState(4);
  const item = ITEMS[i];
  const log = Math.log10(item.size);
  const prev = i > 0 ? ITEMS[i - 1] : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Стъпалата на Вселената</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всяко деление на оста е 1000 пъти по-голямо от предишното. Изберете стъпало и сравнете със съседното.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Логаритмична ос: 10⁰ … 10²⁷ m */}
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.4" />
        {Array.from({ length: 10 }, (_, k) => k * 3).map(p => (
          <g key={p}>
            <line x1={sx(p)} x2={sx(p)} y1={AXIS_Y - 5} y2={AXIS_Y + 5} stroke="white" strokeOpacity="0.5" />
            <text x={sx(p)} y={AXIS_Y + 20} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.65">
              10{p === 0 ? '⁰' : String(p).replace(/./g, ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)])} m
            </text>
          </g>
        ))}
        {ITEMS.map((it, k) => {
          const x = sx(Math.log10(it.size));
          const on = k === i;
          return (
            <g key={it.name} onClick={() => setI(k)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={AXIS_Y} r={on ? 7 : 4} fill={on ? '#fbbf24' : '#a5b4fc'} />
              {on && <circle cx={x} cy={AXIS_Y} r={14} fill="#fbbf24" fillOpacity="0.2" />}
            </g>
          );
        })}
        {/* Стрелка към избрания обект */}
        <line x1={sx(log)} x2={sx(log)} y1={AXIS_Y - 14} y2={AXIS_Y - 40} stroke="#fbbf24" strokeDasharray="3 3" />
        <text
          x={Math.min(X1 - 4, Math.max(X0 + 4, sx(log)))}
          y={AXIS_Y - 46}
          fontSize="13"
          fontWeight="700"
          fill="#fde68a"
          textAnchor={sx(log) < 120 ? 'start' : sx(log) > 520 ? 'end' : 'middle'}
        >
          {item.name}
        </text>

        {/* Числата */}
        <g fontSize="12" fill="white" transform="translate(20, 28)">
          <text x={0} y={0} fillOpacity="0.9">
            {item.what}: {sci(item.size, 1)} m ≈ {human(item.size)}
          </text>
          <text x={0} y={20} fillOpacity="0.75">
            светлината го изминава за {lightTime(item.size)}
          </text>
        </g>
        <g fontSize="12" fill="white" transform="translate(20, 208)">
          <text x={0} y={0} fill="#86efac">
            Ако Земята е топче с диаметър 1 cm, това е {model(item.size)}
          </text>
          {prev && (
            <text x={0} y={20} fill="#c4b5fd">
              {fmt(item.size / prev.size, item.size / prev.size < 10 ? 1 : 0)} пъти повече от „{prev.name}“
            </text>
          )}
        </g>
      </LabSvg>

      <label className="block text-sm font-semibold mt-4 mb-1">
        Стъпало {i + 1} от {ITEMS.length}: {item.name}
      </label>
      <input type="range" min={0} max={ITEMS.length - 1} step={1} value={i} onChange={e => setI(Number(e.target.value))} className="w-full" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{item.note}</p>
    </div>
  );
}
