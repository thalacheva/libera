import { useState } from 'react';

const W = 640;
const H = 300;
const GROUND = 250;
const GAP = 14;

type Scope = {
  name: string;
  size: number; // m
  year: string;
  place: string;
  shape: 'lens' | 'mirror' | 'segmented' | 'dish';
  note: string;
};

const SCOPES: Scope[] = [
  { name: 'Йеркс', size: 1.02, year: '1897', place: 'САЩ', shape: 'lens', note: 'Най-големият лещов телескоп, правен някога. По-голяма леща се огъва под собствената си тежест, а може да се подпре само по ръба.' },
  { name: 'Рожен', size: 2, year: '1981', place: 'България', shape: 'mirror', note: 'Най-големият телескоп в България – в Националната астрономическа обсерватория в Родопите, на 1759 m височина.' },
  { name: 'Хъбъл', size: 2.4, year: '1990', place: 'околоземна орбита', shape: 'mirror', note: 'Огледалото е малко за днешните стандарти, но над атмосферата образът е изключително остър.' },
  { name: 'Хейл', size: 5, year: '1948', place: 'САЩ', shape: 'mirror', note: 'Почти 30 години най-големият телескоп в света. Огледалото е отливано и охлаждано почти година.' },
  { name: 'Джеймс Уеб', size: 6.5, year: '2021', place: 'точката L2', shape: 'segmented', note: '18 шестоъгълни сегмента от позлатен берилий, сгънати като оригами, за да се поберат в ракетата.' },
  { name: 'Кек', size: 10, year: '1993', place: 'Хаваи', shape: 'segmented', note: 'Първият голям телескоп с огледало от сегменти – 36 шестоъгълника, подравнявани с точност от нанометри.' },
  { name: 'GTC', size: 10.4, year: '2009', place: 'Канарските о-ви', shape: 'segmented', note: 'Gran Telescopio Canarias – най-големият работещ оптичен телескоп днес.' },
  { name: 'ELT', size: 39, year: '~2029', place: 'Чили', shape: 'segmented', note: 'Extremely Large Telescope – 798 сегмента. Ще събира 15 пъти повече светлина от днешните най-големи телескопи.' },
];

const FAST: Scope = {
  name: 'FAST',
  size: 500,
  year: '2016',
  place: 'Китай',
  shape: 'dish',
  note: 'Радиотелескоп, вграден в естествена карстова падина. В чинията му биха се побрали 30 футболни игрища.',
};

function hexagon(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

export default function TelescopeSizes() {
  const [withFast, setWithFast] = useState(false);
  const [selected, setSelected] = useState('Рожен');

  const items = withFast ? [...SCOPES, FAST] : SCOPES;
  const largest = withFast ? FAST.size : 39;
  const totalSize = items.reduce((s, i) => s + i.size, 0) + 1.8;
  const scale = Math.min(200 / largest, (W - 40 - GAP * items.length) / totalSize);

  let x = 30;
  const placed = items.map(s => {
    const r = Math.max(1.5, (s.size * scale) / 2);
    const cx = x + r;
    x += 2 * r + GAP;
    return { ...s, cx, r };
  });
  const personH = 1.8 * scale;
  const current = [...SCOPES, FAST].find(s => s.name === selected)!;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Огледалата в един мащаб</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Главните огледала и лещи в един и същ мащаб, редом с човек. Щракнете върху телескоп, за да научите повече.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <line x1={10} x2={W - 10} y1={GROUND} y2={GROUND} stroke="white" strokeOpacity="0.3" />
        {/* Човек за мащаб */}
        <g transform={`translate(${x} ${GROUND})`}>
          <line x1={0} x2={0} y1={0} y2={-Math.max(personH, 6)} stroke="#fde68a" strokeWidth="2" />
          <circle cx={0} cy={-Math.max(personH, 6) - 2} r={2} fill="#fde68a" />
        </g>
        <text x={x} y={GROUND + 16} fontSize="10" textAnchor="middle" fill="#fde68a">
          човек
        </text>

        {placed.map((s, i) => {
          const cy = GROUND - s.r;
          const active = s.name === selected;
          const color = s.shape === 'lens' ? '#7dd3fc' : s.shape === 'dish' ? '#c084fc' : '#e2e8f0';
          return (
            <g key={s.name} onClick={() => setSelected(s.name)} className="cursor-pointer">
              {/* Невидима зона, за да се щраква лесно и по малките */}
              <rect x={s.cx - Math.max(s.r, 10)} y={cy - Math.max(s.r, 10)} width={2 * Math.max(s.r, 10)} height={Math.max(2 * s.r, 20) + 10} fill="transparent" />
              {s.shape === 'segmented' ? (
                <polygon points={hexagon(s.cx, cy, s.r)} fill={color} fillOpacity={active ? 0.45 : 0.2} stroke={color} strokeWidth={active ? 2.5 : 1.2} />
              ) : (
                <circle cx={s.cx} cy={cy} r={s.r} fill={color} fillOpacity={active ? 0.45 : 0.2} stroke={color} strokeWidth={active ? 2.5 : 1.2} />
              )}
              <text
                x={s.cx}
                y={GROUND + 16 + (i % 2) * 13}
                fontSize="10"
                textAnchor="middle"
                fill="white"
                fillOpacity={active ? 1 : 0.65}
                fontWeight={active ? 700 : 400}
              >
                {s.name}
              </text>
            </g>
          );
        })}
        <text x={14} y={22} fontSize="11" fill="white" fillOpacity="0.6">
          <tspan fill="#7dd3fc">● леща</tspan>
          <tspan dx="10" fill="#e2e8f0">● огледало</tspan>
          <tspan dx="10" fill="#e2e8f0">⬡ от сегменти</tspan>
          {withFast && (
            <tspan dx="10" fill="#c084fc">
              ● радиоантена
            </tspan>
          )}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={withFast} onChange={e => setWithFast(e.target.checked)} />
          Покажи и радиотелескопа FAST (500 m)
        </label>
      </div>

      <div className="mt-3 p-3 bg-gray-100/70 dark:bg-gray-900/40 rounded-lg text-sm">
        <p className="font-semibold">
          {current.name} – {current.size.toLocaleString('bg-BG')} m · {current.year} · {current.place}
        </p>
        <p className="mt-1 text-gray-700 dark:text-gray-300">{current.note}</p>
        {current.name !== 'FAST' && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Събира {Math.round((current.size / 0.007) ** 2).toLocaleString('bg-BG')} пъти повече светлина от окото.
          </p>
        )}
      </div>
    </div>
  );
}
