import { useState } from 'react';
import { temperatureToRGB } from './light';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
const YEAR = 3.156e7;
const T0 = 2.725;

// Опорни точки (време в секунди, температура в K) – логаритмична интерполация между тях
const CURVE: [number, number][] = [
  [5.4e-44, 1.4e32],
  [1e-36, 1e28],
  [1e-32, 1e27],
  [1e-12, 1e15],
  [1e-5, 2e12],
  [1, 1e10],
  [180, 1e9],
  [1.6e12, 9000],
  [1.2e13, 3000],
  [3.15e15, 60],
  [6.3e15, 49],
  [3.15e16, 18],
  [2.9e17, 3.9],
  [4.35e17, T0],
];

function temperatureAt(t: number) {
  for (let i = 1; i < CURVE.length; i++) {
    if (t <= CURVE[i][0]) {
      const [t0, T0a] = CURVE[i - 1];
      const [t1, T1] = CURVE[i];
      const f = (Math.log10(t) - Math.log10(t0)) / (Math.log10(t1) - Math.log10(t0));
      return 10 ** (Math.log10(T0a) + f * (Math.log10(T1) - Math.log10(T0a)));
    }
  }
  return T0;
}

const EPOCHS = [
  { until: 1e-36, name: 'Планкова епоха', text: 'Плътност и температура, при които квантовата механика и гравитацията трябва да се обединят. Нямаме теория за тази епоха – физиката, каквато я познаваме, започва след нея.' },
  { until: 1e-32, name: 'Инфлация', text: 'За ~10⁻³² s Вселената се раздува поне 10²⁶ пъти – от размер по-малък от протон до размер на грейпфрут. Квантовите трептения се разтягат до космически размери и стават семената на бъдещите галактики.' },
  { until: 1e-5, name: 'Кварково-глуонна плазма', text: 'Твърде горещо е за протони и неутрони: свободни кварки, глуони, електрони, неутрино и фотони. Такава плазма се създава за миг в Големия адронен ускорител.' },
  { until: 1, name: 'Адрони', text: 'При ~10¹² K кварките се свързват в протони и неутрони. Почти цялото вещество и антивещество се унищожават – остава само мъничък излишък от вещество (едно на милиард), от който сме направени ние.' },
  { until: 1200, name: 'Първичен нуклеосинтез', text: 'Между 1 s и ~20 min Вселената е гигантски термоядрен реактор. Протоните и неутроните образуват ~25% хелий (по маса), следи от деутерий и литий. После става твърде студено и рядко – синтезът спира.' },
  { until: 1.2e13, name: 'Ера на фотоните', text: 'Горещата плазма от ядра и електрони е непрозрачна като слънчевата повърхност: фотоните непрекъснато се разсейват от свободните електрони. Вселената е светла, но мъглива.' },
  { until: 2e13, name: 'Рекомбинация', text: 'При ~3000 K електроните се свързват с ядрата в неутрални атоми. Изведнъж Вселената става прозрачна и светлината полита свободно – тази светлина днес е реликтовото излъчване.' },
  { until: 5e15, name: 'Тъмни векове', text: 'Звезди още няма. Реликтовото излъчване изстива и преминава в инфрачервеното. Гравитацията бавно стяга тъмната материя и газа в сгъстявания.' },
  { until: 3.2e16, name: 'Космическа зора', text: 'Около 100–200 млн. години първите звезди се запалват – огромни, горещи, от чист водород и хелий. Ултравиолетовото им лъчение отново йонизира газа (рейонизация). JWST вижда галактики от ~300 млн. години след началото.' },
  { until: 2.9e17, name: 'Ерата на галактиките', text: 'Галактиките растат и се сливат, звездообразуването е най-бурно около 3–4 млрд. години. Преди ~5 млрд. години разширяването започва да се ускорява (Лекция 28).' },
  { until: 4.36e17, name: 'Слънчевата система и днес', text: 'Преди 4,6 млрд. години (на 9,2 млрд. години възраст на Вселената) от облак, обогатен от предишни поколения звезди, се раждат Слънцето и Земята. Днес реликтовото излъчване е само 2,725 K.' },
];

function formatTime(t: number) {
  if (t < 1e-3) return `${sci(t, 0)} s`;
  if (t < 60) return `${fmt(t, t < 1 ? 3 : 1)} s`;
  if (t < 3600) return `${fmt(t / 60, 1)} min`;
  if (t < YEAR) return `${fmt(t / 86400, 0)} дни`;
  if (t < 1e6 * YEAR) return `${fmt(t / YEAR, 0)} години`;
  if (t < 1e9 * YEAR) return `${fmt(t / YEAR / 1e6, 0)} млн. години`;
  return `${fmt(t / YEAR / 1e9, 2)} млрд. години`;
}

const LOG_MIN = Math.log10(5.4e-44);
const LOG_MAX = Math.log10(4.35e17);

function rnd(n: number) {
  const x = Math.sin(n * 61.37 + 2.17) * 43758.5453;
  return x - Math.floor(x);
}

export default function CosmicTimelineLab() {
  const [logT, setLogT] = useState(Math.log10(1.2e13));
  const t = 10 ** logT;
  const T = temperatureAt(t);
  const z = T / T0 - 1;
  const epoch = EPOCHS.find(e => t <= e.until) ?? EPOCHS[EPOCHS.length - 1];
  const opaque = t < 1.2e13;
  const stars = t > 3e15 ? Math.min(1, (Math.log10(t) - 15.5) / 1.5) : 0;
  const glow = opaque ? temperatureToRGB(Math.min(40000, Math.max(1000, T))) : T > 700 ? temperatureToRGB(Math.max(1000, T)) : '#1e1b4b';

  const ticks = [-40, -30, -20, -10, 0, 10, 17];
  const tx = (lg: number) => 20 + ((lg - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (W - 40);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пътешествие във времето</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Плъзнете по оста на времето – тя е логаритмична: всяко деление е 10¹⁰ пъти по-далеч. Колкото по-рано, толкова по-гореща и
        плътна е Вселената.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* „Прозорец“ към Вселената в този момент */}
        <rect x={20} y={20} width={260} height={190} rx="10" fill={glow} fillOpacity={opaque ? 0.85 : 0.35} />
        {opaque &&
          Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={30 + rnd(i) * 240} cy={30 + rnd(i + 50) * 170} r={6 + rnd(i + 90) * 10} fill="white" fillOpacity="0.12" />
          ))}
        {stars > 0 &&
          Array.from({ length: Math.round(140 * stars) }, (_, i) => (
            <circle key={i} cx={28 + rnd(i + 200) * 244} cy={28 + rnd(i + 300) * 174} r={rnd(i + 400) < 0.1 ? 2.2 : 1} fill={rnd(i + 500) < 0.5 ? '#bfdbfe' : '#fde68a'} fillOpacity={0.6 + 0.4 * rnd(i + 600)} />
          ))}
        <text x={150} y={200} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          {opaque ? 'непрозрачна плазма' : stars > 0 ? 'звезди и галактики' : 'прозрачен, тъмен газ'}
        </text>

        <g fontSize="11" fill="white" transform="translate(305, 40)">
          <text x={0} y={0} fontSize="15" fontWeight="700" fill="#fdba74">
            {epoch.name}
          </text>
          <text x={0} y={26} fillOpacity="0.85">
            време: {formatTime(t)}
          </text>
          <text x={0} y={46} fillOpacity="0.85">
            температура: {T < 1e4 ? `${fmt(T, T < 10 ? 2 : 0)} K` : `${sci(T, 1)} K`}
          </text>
          <text x={0} y={66} fillOpacity="0.85">
            червено отместване: z ≈ {z < 1000 ? fmt(z, z < 10 ? 2 : 0) : sci(z, 1)}
          </text>
          <text x={0} y={86} fillOpacity="0.85">
            разстоянията са {z < 1 ? fmt(1 / (1 + z), 2) : `1/${z + 1 < 1e4 ? fmt(z + 1, 0) : sci(z + 1, 1)}`} от днешните
          </text>
          <text x={0} y={112} fontSize="10" fillOpacity="0.6">
            T = 2,725 K · (1 + z): излъчването изстива,
          </text>
          <text x={0} y={126} fontSize="10" fillOpacity="0.6">
            докато пространството се разтяга.
          </text>
        </g>

        {/* Ос на времето */}
        <line x1={20} x2={W - 20} y1={250} y2={250} stroke="white" strokeOpacity="0.35" />
        {ticks.map(p => (
          <g key={p}>
            <line x1={tx(p)} x2={tx(p)} y1={246} y2={254} stroke="white" strokeOpacity="0.5" />
            <text x={tx(p)} y={268} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              {p === 0 ? '1 s' : p === 17 ? 'днес' : `10${p < 0 ? '⁻' : ''}${String(Math.abs(p)).replace(/./g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])} s`}
            </text>
          </g>
        ))}
        {[
          { t: 180, l: 'нуклеосинтез' },
          { t: 1.2e13, l: 'рекомбинация' },
          { t: 6e15, l: 'първи звезди' },
        ].map(m => (
          <g key={m.l}>
            <circle cx={tx(Math.log10(m.t))} cy={250} r="3" fill="#fdba74" />
            <text x={tx(Math.log10(m.t))} y={240} fontSize="8" textAnchor="middle" fill="#fdba74">
              {m.l}
            </text>
          </g>
        ))}
        <path d={`M ${tx(logT)} 256 l -6 10 l 12 0 z`} fill="white" />
      </svg>

      <input type="range" min={LOG_MIN} max={LOG_MAX} step="0.01" value={logT} onChange={e => setLogT(Number(e.target.value))} className="w-full mt-3" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {EPOCHS.map((e, i) => (
          <button
            key={e.name}
            onClick={() => setLogT(i === 0 ? -40 : (Math.log10(EPOCHS[i - 1].until) + Math.log10(e.until)) / 2)}
            className={`px-2 py-1 rounded text-xs border ${
              e === epoch ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{epoch.text}</p>
    </div>
  );
}
