import { useState } from 'react';
import { fmt } from './terrestrialData';
import { SHOWERS, type Shower } from './showerData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const SUN = { x: 160, y: 150 };
const R_EARTH = 115;
const GX0 = 340;
const GX1 = 625;
const GY0 = 40;
const GY1 = 250;
const RATE_MAX = 170;
const SPORADIC = 8; // спорадични метеори в час (усреднено)

const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
const MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/** Хелиоцентрична дължина на Земята (rad) в даден ден: при пролетното равноденствие (ден 79) тя е 180°. */
const earthLon = (day: number) => ((180 + ((day - 79) * 360) / 365.25) * Math.PI) / 180;

/** Час на пиковете с гаусова форма; отчитаме, че годината се „завърта“. */
function showerRate(s: Shower, day: number) {
  const sigma = s.width / 2.355;
  let d = Math.abs(day - s.peak);
  d = Math.min(d, 365 - d);
  return s.zhr * Math.exp(-(d * d) / (2 * sigma * sigma));
}
const totalRate = (day: number) => SPORADIC + SHOWERS.reduce((sum, s) => sum + showerRate(s, day), 0);

const gx = (day: number) => GX0 + (day / 365) * (GX1 - GX0);
const gy = (rate: number) => GY1 - (Math.min(rate, RATE_MAX) / RATE_MAX) * (GY1 - GY0);

const CURVE = Array.from({ length: 1461 }, (_, i) => {
  const day = i / 4;
  return `${gx(day)},${gy(totalRate(day))}`;
}).join(' ');

function dateText(day: number) {
  const d = Math.floor(day);
  let m = 11;
  while (m > 0 && MONTH_START[m] > d) m--;
  return `${d - MONTH_START[m] + 1} ${MONTHS[m]}.`;
}

export default function ShowerCalendar() {
  const [day, setDay] = useState(215);
  const [playing, setPlaying] = useState(false);
  const [showerId, setShowerId] = useState('per');
  const shower = SHOWERS.find(s => s.id === showerId)!;

  useAnimationFrame(playing, dt => setDay(d => (d + dt * 8) % 365));

  const lon = earthLon(day);
  const ex = SUN.x + R_EARTH * Math.cos(lon);
  const ey = SUN.y - R_EARTH * Math.sin(lon);
  const rate = totalRate(day);
  const active = SHOWERS.filter(s => showerRate(s, day) > 2);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Календарът на метеорните потоци</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Следите от прах на кометите стоят на едно място в пространството. Земята минава през всяка от тях по едно и също време всяка
        година. Пуснете годината (1 s = 8 дни) или щракнете върху поток.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Орбитата на Земята с месеците */}
        <circle cx={SUN.x} cy={SUN.y} r={R_EARTH} fill="none" stroke="white" strokeOpacity="0.25" />
        {MONTHS.map((m, i) => {
          const a = earthLon(MONTH_START[i] + 15);
          return (
            <text key={m} x={SUN.x + (R_EARTH + 24) * Math.cos(a)} y={SUN.y - (R_EARTH + 24) * Math.sin(a) + 3} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
              {m}
            </text>
          );
        })}

        {/* Потоците – ивици прах, които пресичат орбитата */}
        {SHOWERS.map(s => {
          const a = earthLon(s.peak);
          const tilt = a + 0.45;
          const cx = SUN.x + R_EARTH * Math.cos(a);
          const cy = SUN.y - R_EARTH * Math.sin(a);
          const len = 34;
          const isSel = s.id === showerId;
          return (
            <g key={s.id} className="cursor-pointer" onClick={() => setShowerId(s.id)}>
              <line
                x1={cx - len * Math.cos(tilt)}
                y1={cy + len * Math.sin(tilt)}
                x2={cx + len * Math.cos(tilt)}
                y2={cy - len * Math.sin(tilt)}
                stroke={s.color}
                strokeOpacity={isSel ? 0.7 : 0.35}
                strokeWidth={2 + s.width * 1.6}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        <circle cx={SUN.x} cy={SUN.y} r="9" fill="#fbbf24" />
        <circle cx={ex} cy={ey} r="6" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
        <text x={12} y={22} fontSize="13" fill="white" fontWeight="700">
          {dateText(day)}
        </text>

        {/* Графика на броя метеори */}
        <line x1={GX0} x2={GX1} y1={GY1} y2={GY1} stroke="white" strokeOpacity="0.4" />
        {[50, 100, 150].map(r => (
          <g key={r}>
            <line x1={GX0} x2={GX1} y1={gy(r)} y2={gy(r)} stroke="white" strokeOpacity="0.08" />
            <text x={GX0 - 4} y={gy(r) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
              {r}
            </text>
          </g>
        ))}
        {MONTHS.map((m, i) => (
          <text key={m} x={gx(MONTH_START[i] + 15)} y={GY1 + 14} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.5">
            {m}
          </text>
        ))}
        <polyline points={CURVE} fill="none" stroke="#c084fc" strokeWidth="1.5" />
        {SHOWERS.map(s => (
          <text
            key={s.id}
            x={gx(s.peak)}
            y={gy(Math.min(s.zhr + SPORADIC, RATE_MAX)) - 5}
            fontSize="8"
            textAnchor={s.peak < 20 ? 'start' : s.peak > 340 ? 'end' : 'middle'}
            fill={s.color}
            className="cursor-pointer"
            onClick={() => setShowerId(s.id)}
          >
            {s.name}
          </text>
        ))}
        <line x1={gx(day)} x2={gx(day)} y1={GY0 - 10} y2={GY1} stroke="#3b82f6" strokeWidth="1.5" />
        <text x={GX0} y={22} fontSize="11" fill="white">
          метеори в час при идеално небе:{' '}
          <tspan fill="#c084fc" fontWeight="700">
            ~{fmt(rate, 0)}
          </tspan>
        </text>
        <text x={GX1} y={H - 12} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          {active.length ? `сега: ${active.map(s => s.name).join(', ')}` : `само спорадични метеори (~${SPORADIC}/час)`}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-purple-600 text-white text-sm hover:bg-purple-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <input type="range" min="0" max="364.75" step="0.25" value={day} onChange={e => setDay(Number(e.target.value))} className="flex-1 min-w-48" />
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {SHOWERS.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setShowerId(s.id);
              setDay(s.peak);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              s.id === showerId
                ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-sm sm:text-base">
        <p className="font-semibold mb-1">
          {shower.name}{' '}
          <span className="font-normal text-sm text-gray-600 dark:text-gray-400">
            · {shower.date} · ZHR ~{shower.zhr} · {shower.speed} km/s · радиант в {shower.radiant} · родител: {shower.parent}
          </span>
        </p>
        <p>{shower.note}</p>
      </div>
    </div>
  );
}
