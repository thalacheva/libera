import { useState } from 'react';

const W = 640;
const H = 300;
const CX = 160;
const CY = 150;

type Band = 'radio' | 'ir' | 'vis' | 'uv' | 'x' | 'gamma';
type Obj = 'crab' | 'galaxy';

const BANDS: { k: Band; name: string; lam: string; ground: string; scope: string; color: string }[] = [
  { k: 'radio', name: 'Радио', lam: '1 mm – 10 m', ground: 'да', scope: 'VLA, ALMA, FAST', color: '#f87171' },
  { k: 'ir', name: 'Инфрачервено', lam: '0,7 µm – 1 mm', ground: 'частично (само „прозорци“)', scope: 'JWST, Spitzer', color: '#fb923c' },
  { k: 'vis', name: 'Видимо', lam: '0,4 – 0,7 µm', ground: 'да', scope: 'Хъбъл, VLT', color: '#fde68a' },
  { k: 'uv', name: 'Ултравиолетово', lam: '10 – 400 nm', ground: 'не (озонът го поглъща)', scope: 'GALEX, Хъбъл', color: '#a78bfa' },
  { k: 'x', name: 'Рентгеново', lam: '0,01 – 10 nm', ground: 'не', scope: 'Чандра, XMM-Нютон', color: '#7dd3fc' },
  { k: 'gamma', name: 'Гама', lam: '< 0,01 nm', ground: 'не (но вижда се „душът“ от частици)', scope: 'Ферми, HESS', color: '#f0abfc' },
];

const TEXT: Record<Obj, Record<Band, string>> = {
  crab: {
    radio: 'Синхротронно излъчване: електрони с почти светлинна скорост се въртят в магнитното поле на цялата мъглявина.',
    ir: 'Топъл прах и газ в нишките, плюс синхротронното излъчване.',
    vis: 'Нишките светят в линиите на водорода, кислорода и сярата – остатъци от звездата, избухнала през 1054 г. Вътре – синкав синхротронен „туман“.',
    uv: 'Най-енергичните електрони – по-близо до центъра, защото бързо губят енергия.',
    x: 'Пулсарът (въртяща се неутронна звезда, 30 оборота в секунда) и неговият пръстен и струи. Рентгеновата мъглявина е 5 пъти по-малка – електроните с такава енергия „изгарят“ за години.',
    gamma: 'Един от най-ярките гама-източници на небето. Разделителната способност на гама-телескопите е лоша – виждаме размито петно.',
  },
  galaxy: {
    radio: 'Неутралният водород (линията 21 cm) – газовият диск е много по-голям от звездния. Скоростите му дават кривата на въртене (Лекция 25).',
    ir: 'Прахът в спиралните ръкави, нагрят от млади звезди, и старите червени звезди. Инфрачервеното минава през праха.',
    vis: 'Звездите: жълтеникава издутина от стари звезди и сини ръкави с млади, а прахът ги засенчва в тъмни ивици.',
    uv: 'Само най-младите и горещи звезди – „петна“ по ръкавите, където току-що са се родили звезди.',
    x: 'Рентгенови двойни звезди (неутронни звезди и черни дупки, които „ядат“ съседката си), горещ газ и централната черна дупка.',
    gamma: 'Почти нищо – само слаб фон от космически лъчи, които удрят междузвездния газ.',
  },
};

function rnd(n: number) {
  const x = Math.sin(n * 63.7 + 2.9) * 43758.5453;
  return x - Math.floor(x);
}

// Нишките на Рака: случайни разходки вътре в елипса
const FILAMENTS = Array.from({ length: 34 }, (_, f) => {
  let a = rnd(f) * 2 * Math.PI;
  let r = 0.35 + 0.6 * rnd(f + 100);
  const pts: string[] = [];
  for (let s = 0; s < 9; s++) {
    a += (rnd(f * 50 + s) - 0.5) * 0.35;
    r = Math.min(0.98, Math.max(0.2, r + (rnd(f * 50 + s + 25) - 0.5) * 0.12));
    pts.push(`${r * Math.cos(a) * 110},${r * Math.sin(a) * 75}`);
  }
  return pts.join(' ');
});

const arm = (k: number, r0: number, r1: number, off = 0) =>
  Array.from({ length: 60 }, (_, i) => {
    const th = (i / 59) * 6.6;
    const r = r0 * Math.exp(0.3 * th);
    if (r > r1) return null;
    const a = th + k * Math.PI + off;
    return `${r * Math.cos(a)},${r * Math.sin(a) * 0.75}`;
  })
    .filter(Boolean)
    .join(' ');
const KNOTS = Array.from({ length: 50 }, (_, i) => {
  const th = 0.8 + rnd(i + 10) * 5.6;
  const r = 14 * Math.exp(0.3 * th);
  const a = th + Math.floor(rnd(i + 20) * 2) * Math.PI + (rnd(i + 30) - 0.5) * 0.2;
  return { x: r * Math.cos(a), y: r * Math.sin(a) * 0.75, s: 1.5 + rnd(i + 40) * 3 };
});
const XRB = Array.from({ length: 13 }, (_, i) => {
  const r = 15 + rnd(i + 70) * 90;
  const a = rnd(i + 80) * 2 * Math.PI;
  return { x: r * Math.cos(a), y: r * Math.sin(a) * 0.75, s: 1.5 + rnd(i + 90) * 2.5 };
});

function Crab({ band }: { band: Band }) {
  return (
    <g transform={`translate(${CX} ${CY}) rotate(-25)`}>
      {band === 'radio' && <ellipse rx={115} ry={80} fill="url(#mw-radio)" />}
      {band === 'ir' && (
        <>
          <ellipse rx={110} ry={76} fill="url(#mw-ir)" />
          {FILAMENTS.map((p, i) => (
            <polyline key={i} points={p} fill="none" stroke="#fdba74" strokeOpacity="0.45" strokeWidth="3" filter="url(#mw-blur)" />
          ))}
        </>
      )}
      {band === 'vis' && (
        <>
          <ellipse rx={95} ry={62} fill="url(#mw-sync)" />
          {FILAMENTS.map((p, i) => (
            <polyline key={i} points={p} fill="none" stroke={i % 3 ? '#fb923c' : '#86efac'} strokeOpacity="0.85" strokeWidth="1.6" />
          ))}
          <circle r={2} fill="white" />
        </>
      )}
      {band === 'uv' && (
        <>
          <ellipse rx={70} ry={48} fill="url(#mw-uv)" />
          {FILAMENTS.slice(0, 10).map((p, i) => (
            <polyline key={i} points={p} fill="none" stroke="#c4b5fd" strokeOpacity="0.25" strokeWidth="1.5" />
          ))}
        </>
      )}
      {band === 'x' && (
        <>
          <ellipse rx={40} ry={30} fill="url(#mw-x)" />
          <ellipse rx={26} ry={10} fill="none" stroke="#e0f2fe" strokeWidth="3" strokeOpacity="0.8" filter="url(#mw-blur)" />
          <ellipse rx={14} ry={5} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
          <path d="M 0 0 Q 4 -20 -2 -42" fill="none" stroke="#bae6fd" strokeWidth="3" strokeOpacity="0.7" filter="url(#mw-blur)" />
          <path d="M 0 0 Q -3 14 2 26" fill="none" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.5" filter="url(#mw-blur)" />
          <circle r={3.5} fill="white" />
        </>
      )}
      {band === 'gamma' && <circle r={34} fill="url(#mw-gamma)" />}
    </g>
  );
}

function Galaxy({ band }: { band: Band }) {
  const arms = (color: string, width: number, opacity: number, r1 = 120) =>
    [0, 1].map(k => <polyline key={k} points={arm(k, 14, r1)} fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" filter="url(#mw-blur2)" />);
  return (
    <g transform={`translate(${CX} ${CY})`}>
      {band === 'radio' && (
        <>
          <ellipse rx={140} ry={105} fill="url(#mw-radio)" fillOpacity="0.7" />
          {[0, 1].map(k => (
            <polyline key={k} points={arm(k, 16, 150, 0.15)} fill="none" stroke="#fca5a5" strokeWidth={16} strokeOpacity="0.35" strokeLinecap="round" filter="url(#mw-blur2)" />
          ))}
          <circle r={3} fill="#fecaca" />
        </>
      )}
      {band === 'ir' && (
        <>
          <ellipse rx={30} ry={22} fill="url(#mw-ir)" />
          {arms('#fb923c', 7, 0.7)}
          {KNOTS.map((k, i) => (
            <circle key={i} cx={k.x} cy={k.y} r={k.s} fill="#fed7aa" fillOpacity="0.7" />
          ))}
        </>
      )}
      {band === 'vis' && (
        <>
          <ellipse rx={110} ry={82} fill="url(#mw-disk)" />
          {arms('#bfdbfe', 10, 0.55)}
          {[0, 1].map(k => (
            <polyline key={k} points={arm(k, 12.5, 120, -0.12)} fill="none" stroke="#1c1917" strokeWidth={2.5} strokeOpacity="0.7" />
          ))}
          <ellipse rx={30} ry={23} fill="url(#mw-bulge)" />
        </>
      )}
      {band === 'uv' &&
        KNOTS.map((k, i) => <circle key={i} cx={k.x} cy={k.y} r={k.s * 1.3} fill="#c4b5fd" fillOpacity="0.8" filter="url(#mw-blur)" />)}
      {band === 'x' && (
        <>
          <ellipse rx={60} ry={45} fill="url(#mw-x)" fillOpacity="0.4" />
          {XRB.map((k, i) => (
            <circle key={i} cx={k.x} cy={k.y} r={k.s} fill="#e0f2fe" />
          ))}
          <circle r={4} fill="white" />
        </>
      )}
      {band === 'gamma' && <ellipse rx={90} ry={66} fill="url(#mw-gamma)" fillOpacity="0.15" />}
    </g>
  );
}

export default function MultiwavelengthLab() {
  const [obj, setObj] = useState<Obj>('crab');
  const [band, setBand] = useState<Band>('vis');
  const b = BANDS.find(x => x.k === band)!;

  const grad = (id: string, c: string, o = 0.9) => (
    <radialGradient id={id}>
      <stop offset="0%" stopColor={c} stopOpacity={o} />
      <stop offset="60%" stopColor={c} stopOpacity={o * 0.4} />
      <stop offset="100%" stopColor={c} stopOpacity="0" />
    </radialGradient>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Един обект – шест различни картини</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всеки диапазон на спектъра показва различни физични процеси. Сменяйте „очите“ си и вижте какво се появява и какво изчезва
        (схематично).
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          {grad('mw-radio', '#ef4444')}
          {grad('mw-ir', '#f97316', 0.7)}
          {grad('mw-sync', '#93c5fd', 0.45)}
          {grad('mw-uv', '#8b5cf6', 0.8)}
          {grad('mw-x', '#38bdf8', 0.9)}
          {grad('mw-gamma', '#e879f9', 0.95)}
          {grad('mw-disk', '#e2e8f0', 0.35)}
          {grad('mw-bulge', '#fde68a', 1)}
          <filter id="mw-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <filter id="mw-blur2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {obj === 'crab' ? <Crab band={band} /> : <Galaxy band={band} />}

        <g fontSize="11" fill="white" transform="translate(340, 40)">
          <text x={0} y={0} fontSize="16" fontWeight="700" fill={b.color}>
            {b.name}
          </text>
          <text x={0} y={22} fillOpacity="0.8">
            дължина на вълната: {b.lam}
          </text>
          <text x={0} y={42} fillOpacity="0.8">
            минава през атмосферата: {b.ground}
          </text>
          <text x={0} y={62} fillOpacity="0.8">
            телескопи: {b.scope}
          </text>
        </g>
        {/* Скала на спектъра */}
        <g transform="translate(340, 130)">
          {BANDS.map((x, i) => (
            <g key={x.k}>
              <rect x={i * 46} y={0} width={44} height={10} rx={2} fill={x.color} fillOpacity={x.k === band ? 1 : 0.3} />
              <text x={i * 46 + 22} y={24} fontSize="8" textAnchor="middle" fill="white" fillOpacity={x.k === band ? 0.9 : 0.45}>
                {x.name.slice(0, 5)}
                {x.name.length > 5 ? '.' : ''}
              </text>
            </g>
          ))}
          <text x={0} y={40} fontSize="8" fill="white" fillOpacity="0.45">
            ← по-дълги вълни
          </text>
          <text x={274} y={40} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.45">
            по-висока енергия →
          </text>
        </g>
        <text x={CX} y={H - 10} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.55">
          {obj === 'crab' ? 'Мъглявината Рак (M1), ~11 св. години' : 'Спирална галактика, ~100 000 св. години'}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {BANDS.map(x => (
          <button
            key={x.k}
            onClick={() => setBand(x.k)}
            className={`px-2 py-1 rounded text-xs border ${
              x.k === band ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {(['crab', 'galaxy'] as const).map(o => (
          <button
            key={o}
            onClick={() => setObj(o)}
            className={`px-2 py-1 rounded text-xs border ${
              o === obj ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {o === 'crab' ? 'Мъглявината Рак' : 'Спирална галактика'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{TEXT[obj][band]}</p>
    </div>
  );
}
