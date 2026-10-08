import { useState } from 'react';
import { fmt } from './terrestrialData';
import { lightTime } from './dwarfData';

const W = 700;
const H = 250;
const X0 = 30;
const X1 = 680;
const AU_MIN = 0.3;
const AU_MAX = 300000;
const AXIS_Y = 190;

/** Логаритмична скала: разстояние в AU → x. */
const ax = (au: number) => X0 + (Math.log10(au / AU_MIN) / Math.log10(AU_MAX / AU_MIN)) * (X1 - X0);

const PLANETS = [
  { name: 'Меркурий', a: 0.387, r: 2, color: '#a8a29e' },
  { name: 'Венера', a: 0.723, r: 3, color: '#facc15' },
  { name: 'Земя', a: 1, r: 3, color: '#3b82f6' },
  { name: 'Марс', a: 1.524, r: 2.5, color: '#ef4444' },
  { name: 'Юпитер', a: 5.2, r: 6, color: '#d6a46c' },
  { name: 'Сатурн', a: 9.54, r: 5.5, color: '#e9d18f' },
  { name: 'Уран', a: 19.2, r: 4, color: '#9fdde6' },
  { name: 'Нептун', a: 30.1, r: 4, color: '#4f7fe0' },
];

type Region = { id: string; name: string; from: number; to: number; y: number; h: number; color: string; count: string; text: string };

const REGIONS: Region[] = [
  {
    id: 'neo',
    name: 'Близки до Земята обекти',
    from: 0.5,
    to: 1.6,
    y: 60,
    h: 14,
    color: '#f87171',
    count: 'над 38 000 известни',
    text: 'Астероиди и комети, чиито орбити минават на по-малко от 1,3 AU от Слънцето. Те са „избягали“ от пояса на астероидите заради резонанси с Юпитер. Живеят само няколко милиона години, преди да паднат на планета или в Слънцето, или да бъдат изхвърлени. Затова непрекъснато ги следим (Лекция 17).',
  },
  {
    id: 'belt',
    name: 'Главен пояс на астероидите',
    from: 2.1,
    to: 3.3,
    y: 110,
    h: 50,
    color: '#a8a29e',
    count: 'над 1 милион известни',
    text: 'Скалисти и метални тела между Марс и Юпитер. Гравитацията на Юпитер не им е позволила да се слепят в планета. Въпреки огромния брой общата им маса е само ~3% от масата на Луната, а една трета от нея е в Церера. Средното разстояние между съседни астероиди е около милион километра – сондите прелитат без никакъв риск.',
  },
  {
    id: 'trojans',
    name: 'Троянци на Юпитер',
    from: 4.8,
    to: 5.6,
    y: 80,
    h: 30,
    color: '#fbbf24',
    count: 'над 15 000 известни',
    text: 'Два роя, които обикалят по орбитата на Юпитер – 60° пред и 60° зад него, в точките на Лагранж L₄ и L₅. Те може да са колкото астероидите в главния пояс. Сондата Lucy ще ги посети между 2027 и 2033 г.',
  },
  {
    id: 'centaurs',
    name: 'Кентаври',
    from: 5.5,
    to: 30,
    y: 40,
    h: 12,
    color: '#c084fc',
    count: 'стотици известни',
    text: 'Ледени тела, които пресичат орбитите на гигантите. Орбитите им са нестабилни за няколко милиона години: те са в преход между пояса на Кайпер и вътрешната Слънчева система, където някои стават комети с кратък период.',
  },
  {
    id: 'kuiper',
    name: 'Пояс на Кайпер',
    from: 30,
    to: 50,
    y: 110,
    h: 50,
    color: '#60a5fa',
    count: 'над 4000 известни; >100 000 по-големи от 100 km',
    text: 'Пръстен от ледени тела отвъд Нептун – като пояса на астероидите, но ~20 пъти по-широк и стотици пъти по-масивен. Тук са Плутон, Хаумеа и Макемаке. Много обекти са в резонанс с Нептун; най-известни са плутините (3 : 2). Оттук идват кометите с кратък период.',
  },
  {
    id: 'scattered',
    name: 'Разсеян диск',
    from: 35,
    to: 1000,
    y: 70,
    h: 22,
    color: '#38bdf8',
    count: 'стотици известни',
    text: 'Тела със силно издължени и наклонени орбити, които в перихелий се приближават до Нептун, а в афелий отиват на стотици AU. Нептун ги е „разпръснал“ в миналото. Тук е Ерида. Още по-далечни са откъснатите обекти като Седна (76–940 AU), които Нептун вече не достига.',
  },
  {
    id: 'helio',
    name: 'Хелиопауза',
    from: 115,
    to: 125,
    y: 40,
    h: 135,
    color: '#fde047',
    count: '„Вояджър 1“ я пресече през 2012 г.',
    text: 'Границата, където слънчевият вятър се сблъсква с междузвездния газ. Не е край на Слънчевата система – гравитацията на Слънцето управлява телата още хиляди пъти по-далеч. През 2026 г. „Вояджър 1“ е на ~170 AU – най-далечният предмет, създаден от човека; радиосигналът му пътува ~23,5 часа.',
  },
  {
    id: 'oort',
    name: 'Облак на Оорт',
    from: 2000,
    to: 100000,
    y: 60,
    h: 110,
    color: '#94a3b8',
    count: 'вероятно ~10¹¹–10¹² ледени тела',
    text: 'Огромна сферична обвивка от ледени ядра, никога не наблюдавана директно. Предполагаме я по кометите с дълъг период, които идват от всички посоки. Телата са изхвърлени там от гигантите в младостта на Слънчевата система. Външният ръб е на ~1,5 светлинни години – наполовина до най-близката звезда, където преминаващи звезди „разклащат“ облака и пращат комети към нас.',
  },
];

export default function SmallBodyMap() {
  const [regionId, setRegionId] = useState('belt');
  const region = REGIONS.find(r => r.id === regionId)!;

  const ticks = [1, 10, 100, 1000, 10000, 100000];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Къде живеят малките тела</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Разстояние от Слънцето в логаритмична скала: всяко деление е 10 пъти по-далеч от предишното. Щракнете върху област.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Областите */}
        {REGIONS.map(r => {
          const x = ax(r.from);
          const w = Math.max(ax(r.to) - x, 4);
          const active = r.id === regionId;
          return (
            <g key={r.id} className="cursor-pointer" onClick={() => setRegionId(r.id)}>
              <rect
                x={x}
                y={r.y}
                width={w}
                height={r.h}
                rx="5"
                fill={r.color}
                fillOpacity={active ? 0.5 : 0.2}
                stroke={active ? 'white' : r.color}
                strokeOpacity={active ? 1 : 0.5}
                strokeWidth={active ? 1.5 : 1}
              />
              <text x={x + w / 2} y={r.y - 4} fontSize="9" textAnchor="middle" fill="white" fillOpacity={active ? 1 : 0.7} fontWeight={active ? 700 : 400}>
                {r.id === 'helio' ? '' : r.name}
              </text>
            </g>
          );
        })}
        <text x={ax(120)} y={34} fontSize="9" textAnchor="middle" fill="#fde047" fillOpacity="0.9">
          хелиопауза
        </text>

        {/* Ос */}
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.4" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={ax(t)} x2={ax(t)} y1={AXIS_Y - 4} y2={AXIS_Y + 4} stroke="white" strokeOpacity="0.5" />
            <text x={ax(t)} y={AXIS_Y + 30} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
              {fmt(t, 0)} AU
            </text>
            <text x={ax(t)} y={AXIS_Y + 42} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.45">
              {lightTime(t)}
            </text>
          </g>
        ))}

        {/* Слънцето и планетите */}
        <circle cx={X0 - 14} cy={AXIS_Y} r="9" fill="#fbbf24" />
        {PLANETS.map(p => (
          <g key={p.name}>
            <circle cx={ax(p.a)} cy={AXIS_Y} r={p.r} fill={p.color} />
            {['Земя', 'Юпитер', 'Нептун'].includes(p.name) && (
              <text x={ax(p.a)} y={AXIS_Y + 16} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.8">
                {p.name}
              </text>
            )}
          </g>
        ))}

        {/* Седна и Вояджър 1 */}
        <line x1={ax(76)} x2={ax(940)} y1={AXIS_Y - 14} y2={AXIS_Y - 14} stroke="#f472b6" strokeWidth="2" />
        <text x={ax(270)} y={AXIS_Y - 18} fontSize="9" textAnchor="middle" fill="#f472b6">
          орбита на Седна
        </text>
        <path d={`M ${ax(170)} ${AXIS_Y - 2} l -4 -8 l 8 0 z`} fill="#22d3ee" />
        <text x={ax(170) + 6} y={AXIS_Y - 3} fontSize="8" fill="#22d3ee">
          Вояджър 1
        </text>
        <text x={X1} y={AXIS_Y - 6} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          Проксима →
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {REGIONS.map(r => (
          <button
            key={r.id}
            onClick={() => setRegionId(r.id)}
            className={`px-2 py-1 rounded text-xs border ${
              r.id === regionId
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: r.color }} />
            {r.name}
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-sm sm:text-base">
        <p className="font-semibold mb-1">
          {region.name}{' '}
          <span className="font-normal text-sm text-gray-600 dark:text-gray-400">
            ({fmt(region.from, 1)}–{fmt(region.to, region.to < 10 ? 1 : 0)} AU · светлината идва за {lightTime(region.from)}–{lightTime(region.to)} · {region.count})
          </span>
        </p>
        <p>{region.text}</p>
      </div>
    </div>
  );
}
