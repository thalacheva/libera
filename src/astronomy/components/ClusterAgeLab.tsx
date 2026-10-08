import { useState } from 'react';
import { hrAxes, lumOf, msDot, msLifetime, msLuminosity, msTemperature, rnd, turnoffMass, type Dot } from './hrData';
import { temperatureToRGB } from './light';
import { fmt } from './terrestrialData';

const W = 640;
const H = 360;
const X0 = 60;
const X1 = 430;
const Y0 = 24;
const Y1 = 320;
const { x: hx, y: hy } = hrAxes(X0, X1, Y0, Y1);

// Повече масивни звезди, отколкото в реален куп – за да се вижда горният край на главната последователност
const MASSES = Array.from({ length: 420 }, (_, i) => 0.25 * 120 ** (rnd(i * 3 + 101) ** 1.6));

const PRESETS = [
  {
    name: 'Плеяди',
    age: 1.0e8,
    text: 'Младият разсеян куп в Телеца. Сините горещи звезди с маса до ~5 M☉ още са на главната последователност. Вижда се с просто око като малко „ковшче“.',
  },
  {
    name: 'Хиади',
    age: 6.25e8,
    text: 'Най-близкият разсеян куп (47 pc), около Алдебаран (който не е член на купа!). Върхът на главната последователност е при клас A, а най-ярките членове вече са червени гиганти.',
  },
  {
    name: 'M67',
    age: 4e9,
    text: 'Стар разсеян куп в Рак – почти на възрастта на Слънцето. Отклонението от главната последователност е при звезди малко по-масивни от Слънцето.',
  },
  {
    name: 'M13',
    age: 1.2e10,
    text: 'Кълбовиден куп в Херкулес – стотици хиляди звезди, родени заедно преди ~12 млрд. години. Останали са само звезди, по-леки от Слънцето. Кълбовидните купове са сред най-старите обекти в Галактиката.',
  },
];

const ZAMS = Array.from({ length: 50 }, (_, i) => {
  const M = 0.25 * 120 ** (i / 49);
  return `${hx(msTemperature(M))},${hy(msLuminosity(M))}`;
}).join(' ');

function evolve(M: number, age: number, seed: number): Dot | null {
  const tMS = msLifetime(M);
  if (age < tMS * 0.85) return msDot(M, seed);
  if (age < tMS) {
    // Към края на главната последователност звездата става малко по-ярка и по-хладна
    const f = (age / tMS - 0.85) / 0.15;
    const d = msDot(M, seed);
    return { T: d.T * (1 - 0.12 * f), L: d.L * (1 + 1.2 * f), kind: 'ms' };
  }
  if (M > 8) {
    // Масивните звезди живеят кратко като свръхгиганти, после изчезват (свръхнова)
    if (age > tMS * 1.12) return null;
    const T = 10 ** (Math.log10(3500) + rnd(seed + 7) * (Math.log10(25000) - Math.log10(3500)));
    return { T, L: msLuminosity(M) * 1.3, kind: 'supergiant' };
  }
  if (age < tMS * 1.15) {
    // Пролуката на Херцшпрунг се прекосява бързо – почти всички гиганти са вече хладни (u близо до 1)
    const u = 0.65 + 0.35 * rnd(seed + 3);
    const T = 5300 - 1300 * u + (rnd(seed + 4) - 0.5) * 250;
    // Леките звезди изкачват високо клона на червените гиганти, по-масивните стоят в „червеното сгъстяване“
    const L = M < 2.2 ? 10 ** (1.5 + 1.6 * rnd(seed + 5) ** 2) : msLuminosity(M) * (1.5 + 2 * rnd(seed + 5));
    return { T, L, kind: 'giant' };
  }
  // Бяло джудже, което изстива с времето
  const since = age - tMS * 1.15;
  const T = Math.max(4500, Math.min(80000, 30000 * (since / 1e8) ** -0.35));
  return { T, L: lumOf(0.012, T), kind: 'wd' };
}

export default function ClusterAgeLab() {
  const [logAge, setLogAge] = useState(8);
  const [preset, setPreset] = useState<string | null>('Плеяди');
  const age = 10 ** logAge;
  const mTO = turnoffMass(age);
  const dots = MASSES.map((M, i) => evolve(M, age, i * 13 + 5)).filter((d): d is Dot => d !== null);
  const toT = msTemperature(mTO);
  const toL = msLuminosity(mTO);
  const p = PRESETS.find(x => x.name === preset);

  const counts = {
    ms: dots.filter(d => d.kind === 'ms').length,
    giant: dots.filter(d => d.kind === 'giant' || d.kind === 'supergiant').length,
    wd: dots.filter(d => d.kind === 'wd').length,
  };

  const ageText = age < 1e9 ? `${fmt(age / 1e6, 0)} млн. години` : `${fmt(age / 1e9, 1)} млрд. години`;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко е стар звездният куп?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Звездите в един куп са родени заедно, но с различни маси. С времето най-масивните първи напускат главната последователност и тя „се изяжда“
        отгоре надолу. Точката на отклонение е часовник.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#0b1120" stroke="white" strokeOpacity="0.25" />
        <polyline points={ZAMS} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="8" strokeLinecap="round" />
        <defs>
          <clipPath id="ca-plot">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        <g clipPath="url(#ca-plot)">
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={hx(d.T)}
              cy={hy(d.L)}
              r={d.kind === 'giant' || d.kind === 'supergiant' ? 2.4 : 1.7}
              fill={temperatureToRGB(d.T)}
              fillOpacity="0.9"
            />
          ))}
        </g>
        {/* Точка на отклонение */}
        <line x1={X0} x2={X1} y1={hy(toL)} y2={hy(toL)} stroke="#f472b6" strokeOpacity="0.5" strokeDasharray="4 3" />
        <circle cx={hx(toT)} cy={hy(toL)} r="7" fill="none" stroke="#f472b6" strokeWidth="2" />
        <text x={X0 + 4} y={hy(toL) - 5} fontSize="9" fill="#f9a8d4">
          точка на отклонение
        </text>

        {[30000, 10000, 6000, 4000].map(T => (
          <text key={T} x={hx(T)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(T, 0)} K
          </text>
        ))}
        {[-2, 0, 2, 4, 6].map(q => (
          <text key={q} x={X0 - 5} y={hy(10 ** q) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {q === 0 ? '1 L☉' : `10${['⁻²', '', '²', '⁴', '⁶'][[-2, 0, 2, 4, 6].indexOf(q)]}`}
          </text>
        ))}

        <g fontSize="11" fill="white" transform="translate(450, 40)">
          <text x={0} y={0} fontSize="15" fontWeight="700">
            {ageText}
          </text>
          <text x={0} y={26} fill="#f9a8d4">
            маса в точката на отклонение:
          </text>
          <text x={0} y={42} fill="#f9a8d4" fontWeight="700">
            {fmt(mTO, mTO < 10 ? 2 : 0)} M☉ (клас {toT > 30000 ? 'O' : toT > 10000 ? 'B' : toT > 7500 ? 'A' : toT > 6000 ? 'F' : 'G'})
          </text>
          <text x={0} y={72} fillOpacity="0.85">
            на главната посл.: {counts.ms}
          </text>
          <text x={0} y={90} fillOpacity="0.85">
            гиганти: {counts.giant}
          </text>
          <text x={0} y={108} fillOpacity="0.85">
            бели джуджета: {counts.wd}
          </text>
          <text x={0} y={136} fontSize="10" fillOpacity="0.55">
            По-масивните звезди вече са
          </text>
          <text x={0} y={150} fontSize="10" fillOpacity="0.55">
            бели джуджета, неутронни звезди
          </text>
          <text x={0} y={164} fontSize="10" fillOpacity="0.55">
            или черни дупки (Лекции 20–21).
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Възраст на купа: {ageText}</label>
      <input
        type="range"
        min="6.3"
        max="10.15"
        step="0.01"
        value={logAge}
        onChange={e => {
          setLogAge(Number(e.target.value));
          setPreset(null);
        }}
        className="w-full"
      />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {PRESETS.map(x => (
          <button
            key={x.name}
            onClick={() => {
              setLogAge(Math.log10(x.age));
              setPreset(x.name);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              x.name === preset
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {p
          ? p.text
          : 'Звездите на точката на отклонение са тези, чийто живот на главната последователност е равен точно на възрастта на купа: t ≈ 10¹⁰ г. · M / L.'}
      </p>
    </div>
  );
}
