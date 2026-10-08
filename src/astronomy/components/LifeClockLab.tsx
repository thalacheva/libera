import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const CX = 145;
const CY = 150;
const R = 110;
const AGE = 4.54; // млрд. години
// Графика на кислорода
const GX0 = 330;
const GX1 = 620;
const GY0 = 150;
const GY1 = 250;

const EONS = [
  { name: 'Хадей', from: 4.54, to: 4.0, color: '#7f1d1d' },
  { name: 'Архай', from: 4.0, to: 2.5, color: '#9a3412' },
  { name: 'Протерозой', from: 2.5, to: 0.539, color: '#0e7490' },
  { name: 'Фанерозой', from: 0.539, to: 0, color: '#15803d' },
];

const EVENTS = [
  { t: 4.54, name: 'Земята се образува', text: 'От диска около младото Слънце. Повърхността е океан от магма, бомбардиран от останки от образуването на планетите.' },
  { t: 4.5, name: 'Раждането на Луната', text: 'Тяло с размерите на Марс (Тея) се удря в Земята; от изхвърленото вещество се събира Луната.' },
  { t: 4.4, name: 'Първата вода', text: 'Най-старите кристали на Земята – циркони от Джак Хилс (Австралия) – показват, че вече е имало течна вода.' },
  { t: 3.7, name: 'Първи следи от живот?', text: 'Въглерод с „биологичен“ изотопен състав в скали от Гренландия. Спорно, но вероятно животът се появява малко след като условията го позволяват.' },
  { t: 3.48, name: 'Строматолити', text: 'Слоести постройки от микробни колонии в Пилбара (Австралия) – сигурни следи от живот. Цели 2 милиарда години животът е само едноклетъчен.' },
  { t: 2.4, name: 'Голямото окисляване', text: 'Цианобактериите произвеждат кислород чрез фотосинтеза от стотици милиони години. Сега той надвишава поглъщането му и започва да се натрупва в атмосферата.' },
  { t: 1.8, name: 'Клетки с ядро', text: 'Появяват се еукариотите – клетки с ядро и митохондрии (някога свободни бактерии, „погълнати“ от друга клетка).' },
  { t: 0.7, name: 'Земята-снежна топка', text: 'Ледниците стигат почти до екватора – може би няколко пъти. След размразяването кислородът рязко се повишава.' },
  { t: 0.575, name: 'Едиакарска фауна', text: 'Първите големи многоклетъчни организми – меки, плоски, странни същества по морското дъно.' },
  { t: 0.539, name: 'Камбрийският взрив', text: 'За ~20 млн. години се появяват почти всички днешни типове животни – с черупки, очи, крака.' },
  { t: 0.47, name: 'Растения на сушата', text: 'Първите растения излизат от водата. Около 100 млн. години по-късно – и първите четириноги животни.' },
  { t: 0.252, name: 'Великото измиране', text: 'В края на перма изчезват ~90% от морските видове – най-голямата катастрофа в историята на живота (масивни вулканични изригвания в Сибир).' },
  { t: 0.23, name: 'Първите динозаври', text: 'Динозаврите доминират над 160 млн. години. Първите бозайници се появяват почти по същото време – малки и нощни.' },
  { t: 0.066, name: 'Астероидът', text: 'Тяло с размер ~10 km удря Юкатан (кратерът Чиксулуб). Изчезват нелетящите динозаври – и идва ерата на бозайниците.' },
  { t: 0.0003, name: 'Homo sapiens', text: 'Нашият вид се появява в Африка преди ~300 000 години. На часовника – по-малко от 6 секунди преди полунощ.' },
];

/** Схематично съдържание на кислорода, lg (дял от днешното). */
function o2(t: number) {
  if (t > 2.45) return -5.5;
  if (t > 2.3) return -5.5 + ((2.45 - t) / 0.15) * 4;
  if (t > 2.05) return -1.0;
  if (t > 0.8) return -2;
  if (t > 0.54) return -2 + ((0.8 - t) / 0.26) * 1.3;
  if (t > 0.4) return -0.7 + ((0.54 - t) / 0.14) * 0.7;
  if (t > 0.25) return 0.15 * Math.sin(((0.4 - t) / 0.15) * Math.PI);
  return 0;
}

function clockTime(t: number) {
  const s = ((AGE - t) / AGE) * 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatAgo(t: number) {
  if (t >= 1) return `${fmt(t, 2)} млрд. години`;
  if (t >= 0.001) return `${fmt(t * 1000, 0)} млн. години`;
  return `${fmt(t * 1e6, 0)} хил. години`;
}

const angle = (t: number) => ((AGE - t) / AGE) * 2 * Math.PI - Math.PI / 2;

export default function LifeClockLab() {
  const [ei, setEi] = useState(4);
  const [t, setT] = useState(EVENTS[4].t);

  const past = EVENTS.filter(e => e.t >= t);
  const last = past[past.length - 1];
  const a = angle(t);

  const gx = (tt: number) => GX0 + ((AGE - tt) / AGE) * (GX1 - GX0);
  const gy = (lg: number) => GY1 - ((lg + 6) / 6.5) * (GY1 - GY0);
  const curve = Array.from({ length: 301 }, (_, i) => {
    const tt = AGE - (i / 300) * AGE;
    return `${gx(tt)},${gy(o2(tt))}`;
  }).join(' ');

  const arc = (from: number, to: number, r0: number, r1: number) => {
    const a0 = angle(from);
    const a1 = angle(to);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (ang: number, r: number) => `${CX + r * Math.cos(ang)} ${CY + r * Math.sin(ang)}`;
    return `M ${p(a0, r1)} A ${r1} ${r1} 0 ${large} 1 ${p(a1, r1)} L ${p(a1, r0)} A ${r0} ${r0} 0 ${large} 0 ${p(a0, r0)} Z`;
  };

  const go = (i: number) => {
    const j = Math.max(0, Math.min(EVENTS.length - 1, i));
    setEi(j);
    setT(EVENTS[j].t);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Историята на живота в едно денонощие</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Нека 4,54 млрд. години от образуването на Земята до днес са 24 часа. В колко часа се появява животът? А хората?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {EONS.map(e => (
          <path key={e.name} d={arc(e.from, e.to, R - 16, R)} fill={e.color} fillOpacity="0.85" />
        ))}
        {EONS.map(e => {
          const am = angle((e.from + e.to) / 2);
          return e.from - e.to > 0.6 ? (
            <text key={e.name} x={CX + (R - 30) * Math.cos(am)} y={CY + (R - 30) * Math.sin(am) + 3} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.7">
              {e.name}
            </text>
          ) : null;
        })}
        {[0, 6, 12, 18].map(h => {
          const ang = (h / 24) * 2 * Math.PI - Math.PI / 2;
          return (
            <text key={h} x={CX + (R + 11) * Math.cos(ang)} y={CY + (R + 11) * Math.sin(ang) + 3} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
              {h === 0 ? '0/24' : h}
            </text>
          );
        })}
        {EVENTS.map((e, i) => {
          const ang = angle(e.t);
          return (
            <line
              key={e.name}
              x1={CX + (R - 18) * Math.cos(ang)}
              y1={CY + (R - 18) * Math.sin(ang)}
              x2={CX + (R + 2) * Math.cos(ang)}
              y2={CY + (R + 2) * Math.sin(ang)}
              stroke={i === ei ? '#fde68a' : 'white'}
              strokeWidth={i === ei ? 2.5 : 1}
              strokeOpacity={e.t >= t ? 0.9 : 0.3}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={CX + (R - 24) * Math.cos(a)} y2={CY + (R - 24) * Math.sin(a)} stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={4} fill="#fde68a" />
        <text x={CX} y={CY + 28} fontSize="15" textAnchor="middle" fill="#fde68a" fontWeight="700">
          {clockTime(t)}
        </text>

        <g fontSize="11" fill="white" transform="translate(330, 34)">
          <text x={0} y={0} fontSize="14" fontWeight="700" fill="#86efac">
            {last.name}
          </text>
          <text x={0} y={20} fillOpacity="0.8">
            преди {formatAgo(last.t)} · на часовника {clockTime(last.t)}
          </text>
          <text x={0} y={44} fillOpacity="0.6" fontSize="10">
            {t < 0.01 ? `Последните ${fmt((t / AGE) * 86400, 1)} s от денонощието` : `Сега: преди ${formatAgo(t)}`}
          </text>
        </g>

        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={curve} fill="none" stroke="#7dd3fc" strokeWidth="2" />
        <line x1={gx(t)} x2={gx(t)} y1={GY0} y2={GY1} stroke="#fde68a" strokeOpacity="0.7" />
        <text x={GX0 + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.6">
          кислород в атмосферата (схематично)
        </text>
        {[0, -2, -4].map(lg => (
          <text key={lg} x={GX0 - 4} y={gy(lg) + 3} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.5">
            {lg === 0 ? '100%' : lg === -2 ? '1%' : '0,01%'}
          </text>
        ))}
        {[4, 3, 2, 1, 0].map(tt => (
          <text key={tt} x={gx(tt)} y={GY1 + 12} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
            {tt === 0 ? 'днес' : `${tt} млрд.`}
          </text>
        ))}
        <text x={GX1} y={GY1 + 26} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.5">
          % от днешното количество, лог. скала
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Преди: {formatAgo(t)}</label>
      <input
        type="range"
        min="0"
        max={AGE}
        step="0.001"
        value={AGE - t}
        onChange={ev => {
          const nt = AGE - Number(ev.target.value);
          setT(nt);
          const idx = EVENTS.filter(e => e.t >= nt).length - 1;
          setEi(Math.max(idx, 0));
        }}
        className="w-full"
      />
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => go(ei - 1)} className="px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          ◀ предишно
        </button>
        <span className="text-sm px-2">
          {ei + 1} / {EVENTS.length}
        </span>
        <button onClick={() => go(ei + 1)} className="px-3 py-1 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700">
          следващо ▶
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{last.text}</p>
    </div>
  );
}
