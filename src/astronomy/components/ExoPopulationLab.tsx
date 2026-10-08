import { useState } from 'react';

const W = 640;
const H = 320;
const GX0 = 60;
const GX1 = 620;
const GY0 = 20;
const GY1 = 270;
const LP_MIN = -0.5; // lg P (дни)
const LP_MAX = 6.5;
const LM_MIN = -1.5; // lg M (M⊕)
const LM_MAX = 4.3;

function rnd(n: number) {
  const x = Math.sin(n * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
}
const gauss = (n: number) => Math.sqrt(-2 * Math.log(rnd(n) + 1e-9)) * Math.cos(2 * Math.PI * rnd(n + 333));

type Method = 'transit' | 'rv' | 'micro' | 'image';
const METHODS: { k: Method; name: string; color: string; text: string }[] = [
  { k: 'transit', name: 'транзит', color: '#fbbf24', text: 'Kepler и TESS: най-много открития. Предпочита големи планети с кратки периоди – те минават пред звездата често и с по-голяма вероятност.' },
  { k: 'rv', name: 'радиална скорост', color: '#7dd3fc', text: 'Предпочита масивни планети близо до звездата – те я люлеят най-силно. Отдолу има граница: под нея сигналът е по-малък от ~1 m/s.' },
  { k: 'micro', name: 'микролещи', color: '#f472b6', text: 'Звезда-леща случайно минава пред далечна звезда; планетата добавя кратък „пик“. Чувствителен е към планети на няколко AU, далеч от нас – но всяко събитие се случва само веднъж.' },
  { k: 'image', name: 'директно изображение', color: '#a78bfa', text: 'Само за млади, горещи и масивни планети далеч от звездата си – там блясъкът на звездата не ги заслепява.' },
];

// Схематично разпределение (не каталог)
const POINTS: { lp: number; lm: number; m: Method }[] = [];
let seed = 1;
const add = (count: number, lp: number, slp: number, lm: number, slm: number, m: Method) => {
  for (let i = 0; i < count; i++) {
    POINTS.push({ lp: lp + slp * gauss(seed), lm: lm + slm * gauss(seed + 7), m });
    seed += 13;
  }
};
add(45, 0.55, 0.22, 2.6, 0.25, 'transit'); // горещи юпитери
add(140, 1.05, 0.38, 0.8, 0.3, 'transit'); // супер-Земи и мини-Нептуни
add(22, 0.6, 0.25, 2.5, 0.3, 'rv');
add(55, 2.7, 0.45, 2.7, 0.4, 'rv'); // студени гиганти
add(28, 1.2, 0.4, 1.0, 0.3, 'rv');
add(25, 3.6, 0.3, 2.0, 0.6, 'micro');
add(14, 5.2, 0.5, 3.6, 0.2, 'image');

const SOLAR = [
  { name: 'Меркурий', P: 88, M: 0.055 },
  { name: 'Венера', P: 225, M: 0.815 },
  { name: 'Земя', P: 365, M: 1 },
  { name: 'Марс', P: 687, M: 0.107 },
  { name: 'Юпитер', P: 4333, M: 318 },
  { name: 'Сатурн', P: 10759, M: 95 },
  { name: 'Уран', P: 30687, M: 14.5 },
  { name: 'Нептун', P: 60190, M: 17.1 },
];

const gx = (lp: number) => GX0 + ((lp - LP_MIN) / (LP_MAX - LP_MIN)) * (GX1 - GX0);
const gy = (lm: number) => GY1 - ((lm - LM_MIN) / (LM_MAX - LM_MIN)) * (GY1 - GY0);

export default function ExoPopulationLab() {
  const [on, setOn] = useState<Record<Method, boolean>>({ transit: true, rv: true, micro: true, image: true });
  const [solar, setSolar] = useState(true);
  const [focus, setFocus] = useState<Method | null>(null);

  // Граница за радиални скорости K = 1 m/s около слънчева звезда: M = (1/28,4) · 317,8 · (P/365,25)^(1/3)
  const rvLimit = Array.from({ length: 41 }, (_, i) => {
    const lp = LP_MIN + (i / 40) * (LP_MAX - LP_MIN);
    const lm = Math.log10((317.8 / 28.43) * (10 ** lp / 365.25) ** (1 / 3));
    return `${gx(lp)},${gy(lm)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Зоологическата градина на екзопланетите</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Маса спрямо период (схематично разпределение по реалните групи). Всеки метод „вижда“ различна част от картината. Къде ли е
        Слънчевата система?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="pop-clip">
            <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} />
          </clipPath>
        </defs>
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        {[0, 1, 2, 3, 4, 5, 6].map(lp => (
          <g key={lp}>
            <line x1={gx(lp)} x2={gx(lp)} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.06" />
            <text x={gx(lp)} y={GY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {['1 ден', '10', '100', '1000', '10⁴', '10⁵', '10⁶'][lp]}
            </text>
          </g>
        ))}
        {[-1, 0, 1, 2, 3, 4].map(lm => (
          <g key={lm}>
            <line x1={GX0} x2={GX1} y1={gy(lm)} y2={gy(lm)} stroke="white" strokeOpacity="0.06" />
            <text x={GX0 - 4} y={gy(lm) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
              {['0,1', '1', '10', '100', '1000', '10⁴'][lm + 1]}
            </text>
          </g>
        ))}
        <text x={(GX0 + GX1) / 2} y={GY1 + 28} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          орбитален период, дни
        </text>
        <text x={14} y={(GY0 + GY1) / 2} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55" transform={`rotate(-90 14 ${(GY0 + GY1) / 2})`}>
          маса, M⊕
        </text>
        <g clipPath="url(#pop-clip)">
          <line x1={GX0} x2={GX1} y1={gy(Math.log10(317.8))} y2={gy(Math.log10(317.8))} stroke="white" strokeOpacity="0.12" strokeDasharray="2 4" />
          {on.rv && <polyline points={rvLimit} fill="none" stroke="#7dd3fc" strokeOpacity="0.45" strokeDasharray="5 4" />}
          {POINTS.map((p, i) =>
            on[p.m] ? (
              <circle key={i} cx={gx(p.lp)} cy={gy(p.lm)} r={2.6} fill={METHODS.find(m => m.k === p.m)!.color} fillOpacity={focus && focus !== p.m ? 0.15 : 0.8} />
            ) : null,
          )}
          {solar &&
            SOLAR.map(s => (
              <g key={s.name}>
                <circle cx={gx(Math.log10(s.P))} cy={gy(Math.log10(s.M))} r={4.5} fill="none" stroke="#86efac" strokeWidth="1.5" />
                <text
                  x={gx(Math.log10(s.P)) + (s.name === 'Венера' || s.name === 'Уран' ? -7 : 7)}
                  y={gy(Math.log10(s.M)) + 3}
                  fontSize="9"
                  textAnchor={s.name === 'Венера' || s.name === 'Уран' ? 'end' : 'start'}
                  fill="#86efac"
                >
                  {s.name}
                </text>
              </g>
            ))}
        </g>
        <text x={gx(4.6)} y={gy(Math.log10(317.8)) - 4} fontSize="8" textAnchor="middle" fill="white" fillOpacity="0.45">
          маса на Юпитер
        </text>
        <text x={gx(0.55)} y={gy(3.35)} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          горещи юпитери
        </text>
        <text x={gx(1.1)} y={gy(-0.4)} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          супер-Земи и мини-Нептуни
        </text>
        {on.rv && (
          <text x={gx(5.4)} y={gy(2.25) + 14} fontSize="8" textAnchor="middle" fill="#7dd3fc" fillOpacity="0.7">
            K = 1 m/s
          </text>
        )}
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {METHODS.map(m => (
          <button
            key={m.k}
            onClick={() => setOn(v => ({ ...v, [m.k]: !v[m.k] }))}
            onMouseEnter={() => setFocus(m.k)}
            onMouseLeave={() => setFocus(null)}
            className={`px-2 py-1 rounded text-xs border ${on[m.k] ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 opacity-60'}`}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: m.color }} />
            {m.name}
          </button>
        ))}
        <button
          onClick={() => setSolar(v => !v)}
          className={`px-2 py-1 rounded text-xs border ${solar ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300' : 'border-gray-300 dark:border-gray-600 opacity-60'}`}
        >
          ○ Слънчевата система
        </button>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {focus
          ? METHODS.find(m => m.k === focus)!.text
          : 'Най-честите планети в Галактиката – супер-Земите и мини-Нептуните (1–4 радиуса на Земята) – липсват в Слънчевата система. А аналози на Земята (година ~1 г., маса ~1 M⊕) почти няма в каталога – не защото са редки, а защото са най-трудни за откриване. Посочете метод, за да научите какво „вижда“.'}
      </p>
    </div>
  );
}
