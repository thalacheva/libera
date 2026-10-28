import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton } from '~/geometry/diagram';
import { equirect, landPathEquirect } from '../geo';

// Карта от 80° с.ш. до 70° ю.ш.; дължините над 180° се рисуват и отместени с −360° (изрязва ги clipPath)
const MW = 640;
const MH = (MW / 360) * 180;
const TOP = 80;
const BOTTOM = -70;
const CROP_Y = ((90 - TOP) / 180) * MH;
const CROP_H = ((TOP - BOTTOM) / 180) * MH;
const proj = equirect(0, 0, MW, MH);

type Current = {
  name: string;
  warm: boolean;
  pts: [number, number][];
  info: string;
};

const CURRENTS: Current[] = [
  {
    name: 'Гълфстрийм',
    warm: true,
    pts: [
      [-80, 25],
      [-79.5, 30],
      [-75, 35],
      [-65, 39],
      [-50, 41],
    ],
    info: 'Най-известното топло течение: тръгва от Мексиканския залив покрай Флорида и носи около 30 милиона m³/s, а край Нюфаундленд – няколко пъти повече. Скоростта стига 2 m/s.',
  },
  {
    name: 'Северноатлантическо',
    warm: true,
    pts: [
      [-48, 43],
      [-35, 48],
      [-20, 53],
      [-8, 58],
      [5, 64],
      [17, 70],
      [35, 72],
    ],
    info: 'Продължението на Гълфстрийм към Европа. Благодарение на него и на западните ветрове Норвегия има мек климат, а пристанището Мурманск не замръзва.',
  },
  {
    name: 'Канарско',
    warm: false,
    pts: [
      [-12, 42],
      [-15, 33],
      [-18, 25],
      [-21, 17],
    ],
    info: 'Студено течение покрай Северозападна Африка с апвелинг – богат риболов край брега и сухият бряг на Сахара.',
  },
  {
    name: 'Северно пасатно (Атлантик)',
    warm: true,
    pts: [
      [-20, 14],
      [-35, 14],
      [-55, 15],
      [-72, 19],
    ],
    info: 'Пасатите го гонят на запад покрай тропика; затваря северноатлантическия кръговрат.',
  },
  {
    name: 'Лабрадорско',
    warm: false,
    pts: [
      [-62, 66],
      [-58, 58],
      [-54, 51],
      [-50, 45],
    ],
    info: 'Носи на юг студена вода и айсберги от Гренландия. Там, където среща Гълфстрийм край Нюфаундленд, често има мъгли.',
  },
  {
    name: 'Източногренландско',
    warm: false,
    pts: [
      [-12, 79],
      [-20, 72],
      [-32, 66],
      [-42, 60],
    ],
    info: 'Изнася лед от Северния ледовит океан на юг покрай Гренландия.',
  },
  {
    name: 'Бразилско',
    warm: true,
    pts: [
      [-35, -8],
      [-38, -16],
      [-42, -23],
      [-48, -31],
      [-53, -38],
    ],
    info: 'Топлото западно гранично течение на Южния Атлантик.',
  },
  {
    name: 'Южно пасатно (Атлантик)',
    warm: true,
    pts: [
      [10, -4],
      [-5, -5],
      [-20, -6],
      [-33, -7],
    ],
    info: 'Тече на запад покрай екватора; при Бразилия се разделя на две.',
  },
  {
    name: 'Бенгелско',
    warm: false,
    pts: [
      [17, -35],
      [14, -28],
      [12, -20],
      [9, -12],
    ],
    info: 'Студено течение с апвелинг покрай Намибия – мъглите над пустинята Намиб идват от него.',
  },
  {
    name: 'Курошио',
    warm: true,
    pts: [
      [122, 21],
      [125, 27],
      [132, 32],
      [140, 35],
      [152, 37],
    ],
    info: 'Тихоокеанският „близнак“ на Гълфстрийм покрай Япония.',
  },
  {
    name: 'Севернотихоокеанско',
    warm: true,
    pts: [
      [152, 39],
      [175, 42],
      [200, 44],
      [225, 45],
    ],
    info: 'Продължението на Курошио на изток към Северна Америка.',
  },
  {
    name: 'Ойашио',
    warm: false,
    pts: [
      [163, 56],
      [155, 48],
      [146, 42],
    ],
    info: 'Студено течение от Берингово море; среща Курошио край Япония – там е един от най-богатите риболовни райони.',
  },
  {
    name: 'Калифорнийско',
    warm: false,
    pts: [
      [-128, 48],
      [-125, 40],
      [-120, 33],
      [-114, 24],
    ],
    info: 'Студено течение с апвелинг: студеното море и честите мъгли край Сан Франциско.',
  },
  {
    name: 'Северно пасатно (Пасифик)',
    warm: true,
    pts: [
      [-110, 12],
      [-140, 13],
      [-170, 14],
      [-200, 14],
      [-230, 15],
    ],
    info: 'Най-дългото пасатно течение – прекосява целия Тихи океан.',
  },
  {
    name: 'Южно пасатно (Пасифик)',
    warm: true,
    pts: [
      [-82, -3],
      [-110, -4],
      [-150, -7],
      [-190, -11],
      [-205, -15],
    ],
    info: 'Гони топлата вода към Индонезия; когато пасатите отслабнат, настъпва Ел Ниньо.',
  },
  {
    name: 'Перуанско (Хумболт)',
    warm: false,
    pts: [
      [-76, -45],
      [-74, -35],
      [-72, -25],
      [-77, -15],
      [-81, -5],
    ],
    info: 'Студено течение с най-силния апвелинг на света – огромни пасажи аншоа и пустинята Атакама на брега.',
  },
  {
    name: 'Източноавстралийско',
    warm: true,
    pts: [
      [155, -14],
      [154, -24],
      [153, -32],
      [155, -38],
    ],
    info: 'Топло течение покрай Големия бариерен риф и Сидни.',
  },
  {
    name: 'Западноавстралийско',
    warm: false,
    pts: [
      [112, -36],
      [114, -29],
      [112, -22],
      [105, -17],
    ],
    info: 'Студено течение покрай пустинното западно крайбрежие на Австралия.',
  },
  {
    name: 'Южно пасатно (Индийски)',
    warm: true,
    pts: [
      [112, -12],
      [95, -13],
      [75, -14],
      [55, -16],
    ],
    info: 'Пасатно течение на Индийския океан.',
  },
  {
    name: 'Агуляс',
    warm: true,
    pts: [
      [42, -14],
      [36, -25],
      [30, -32],
      [21, -37],
    ],
    info: 'Бързо топло течение покрай Южна Африка. Част от водата му „изтича“ в Атлантика.',
  },
  {
    name: 'Антарктическо циркумполярно',
    warm: false,
    pts: [
      [-180, -58],
      [-130, -59],
      [-80, -59],
      [-55, -57],
      [-25, -51],
      [20, -47],
      [70, -48],
      [120, -50],
      [180, -58],
    ],
    info: 'Течението на западните ветрове – единственото, което обикаля Земята, без да среща континент. Пренася над 100 милиона m³/s – повече от всички реки по света над сто пъти.',
  },
];

const GYRES: { lat: number; lon: number; cw: boolean; name: string }[] = [
  { lat: 28, lon: -42, cw: true, name: 'Саргасово море' },
  { lat: 29, lon: -150, cw: true, name: '' },
  { lat: -22, lon: -15, cw: false, name: '' },
  { lat: -25, lon: -110, cw: false, name: '' },
  { lat: -25, lon: 80, cw: false, name: '' },
];

const pathOf = (pts: [number, number][], shift: number) =>
  pts
    .map(([lon, lat], i) => {
      const { x, y } = proj({ lon: lon + shift, lat });
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join('');

type Filter = 'all' | 'warm' | 'cold';

/** Карта на основните повърхностни течения: топли и студени, кръговрати, сведения за всяко. */
export default function CurrentsLab() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sel, setSel] = useState(0);
  const land = useMemo(() => landPathEquirect(0, 0, MW, MH), []);
  const cur = CURRENTS[sel];

  const shown = CURRENTS.map((c, i) => ({ c, i })).filter(({ c }) => filter === 'all' || (filter === 'warm') === c.warm);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 ${CROP_Y} ${MW} ${CROP_H}`} className="w-full h-auto block select-none">
        <defs>
          <clipPath id="oc-map">
            <rect x={0} y={CROP_Y} width={MW} height={CROP_H} />
          </clipPath>
          {(['warm', 'cold', 'sel'] as const).map(k => (
            <marker key={k} id={`oc-arrow-${k}`} markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
              <path
                d="M0 0 L10 5 L0 10 Z"
                className={k === 'warm' ? 'fill-red-600 dark:fill-red-400' : k === 'cold' ? 'fill-blue-700 dark:fill-blue-300' : 'fill-amber-500'}
              />
            </marker>
          ))}
        </defs>
        <rect x={0} y={CROP_Y} width={MW} height={CROP_H} className="fill-sky-100 dark:fill-slate-900" />
        <path d={land} clipPath="url(#oc-map)" fillRule="evenodd" className="fill-stone-300 dark:fill-stone-600" />
        <line x1={0} x2={MW} y1={proj({ lat: 0, lon: 0 }).y} y2={proj({ lat: 0, lon: 0 }).y} className="stroke-gray-500/50" strokeDasharray="4 4" />
        {GYRES.map(g => {
          const { x, y } = proj(g);
          const r = 16;
          // Дъга от 300°, със стрелка по посоката на въртене
          const a0 = g.cw ? -60 : 240;
          const a1 = g.cw ? 240 : -60;
          const pt = (a: number) => `${(x + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(y + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
          return (
            <g key={`${g.lat}${g.lon}`} clipPath="url(#oc-map)">
              <path
                d={`M${pt(a0)} A${r} ${r} 0 1 ${g.cw ? 1 : 0} ${pt(a1)}`}
                fill="none"
                className="stroke-gray-500 dark:stroke-gray-400"
                strokeWidth="1.2"
                markerEnd="url(#oc-arrow-cold)"
                opacity={0.6}
              />
              {g.name && (
                <text x={x} y={y + 3} fontSize="8" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                  {g.name}
                </text>
              )}
            </g>
          );
        })}
        <g clipPath="url(#oc-map)">
          {shown.map(({ c, i }) => {
            const on = i === sel;
            const cls = on ? 'stroke-amber-500' : c.warm ? 'stroke-red-600 dark:stroke-red-400' : 'stroke-blue-700 dark:stroke-blue-300';
            const marker = `url(#oc-arrow-${on ? 'sel' : c.warm ? 'warm' : 'cold'})`;
            return [0, -360, 360].map(shift => (
              <g key={`${c.name}${shift}`} className="cursor-pointer" onClick={() => setSel(i)}>
                <path d={pathOf(c.pts, shift)} fill="none" stroke="transparent" strokeWidth="12" />
                <path
                  d={pathOf(c.pts, shift)}
                  fill="none"
                  className={cls}
                  strokeWidth={on ? 3.2 : 2}
                  markerEnd={marker}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ));
          })}
        </g>
      </LabSvg>
      <Buttons>
        {(
          [
            ['all', 'Всички'],
            ['warm', 'Топли'],
            ['cold', 'Студени'],
          ] as [Filter, string][]
        ).map(([k, t]) => (
          <DiagramButton key={k} active={filter === k} onClick={() => setFilter(k)}>
            {t}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3 flex justify-center">
        <select
          value={sel}
          onChange={e => setSel(Number(e.target.value))}
          className="max-w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100"
        >
          {CURRENTS.map((c, i) => (
            <option key={c.name} value={i}>
              {c.name} ({c.warm ? 'топло' : 'студено'})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-1">
          {cur.name} –{' '}
          <span className={cur.warm ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-300'}>{cur.warm ? 'топло' : 'студено'} течение</span>
        </p>
        <p>{cur.info}</p>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Червено – топли течения, синьо – студени; сивите кръгове са кръговратите (по часовниковата стрелка в Северното полукълбо, обратно – в Южното). Натисни
        течение на картата или го избери от списъка. Пътищата са схематични.
      </p>
    </div>
  );
}
