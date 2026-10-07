import { useId, useMemo, useState } from 'react';
import { formatScientific } from './physics';

const PW = 300; // ширина на всеки панел
const PH = 220;

const EYE = 7; // mm – зеницата на окото в тъмното

const PRESETS = [
  { label: 'Око', D: 7 },
  { label: 'Бинокъл', D: 50 },
  { label: 'Любителски 20 cm', D: 200 },
  { label: 'Рожен 2 m', D: 2000 },
  { label: 'Хъбъл 2,4 m', D: 2400 },
  { label: 'Кек 10 m', D: 10000 },
  { label: 'ELT 39 m', D: 39000 },
];

type Site = 'ground' | 'ao' | 'space';

const SITES: { id: Site; name: string; seeing: number; text: string }[] = [
  {
    id: 'ground',
    name: 'Земя',
    seeing: 1,
    text: 'Турбулентността в атмосферата „размазва“ звездите до ~1″ (seeing) – по-големият телескоп събира повече светлина, но не вижда по-остро.',
  },
  {
    id: 'ao',
    name: 'Земя + адаптивна оптика',
    seeing: 0,
    text: 'Деформируемо огледало променя формата си стотици пъти в секунда и компенсира турбулентността – телескопът достига почти теоретичната разделителна способност.',
  },
  {
    id: 'space',
    name: 'Космос',
    seeing: 0,
    text: 'Над атмосферата няма турбулентност – образът е ограничен само от дифракцията.',
  },
];

/** Гранична звездна величина при визуално наблюдение. */
const limitingMag = (D: number) => 2.7 + 5 * Math.log10(D);
/** Дифракционен предел (критерий на Рейли) за λ = 550 nm, в дъгови секунди. */
const diffraction = (D: number) => 138 / D;

/** Детерминиран псевдослучаен генератор – полето е едно и също при всяко рисуване. */
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const fmt = (v: number, d = 1) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });

/** Приблизителен брой звезди на цялото небе, по-ярки от m. */
function starCount(m: number) {
  const log = m <= 10 ? 0.48 * m + 0.9 : 5.7 + 0.35 * (m - 10);
  return 10 ** Math.min(log, 9.4);
}

function arcsec(v: number) {
  if (v >= 1) return `${fmt(v, 1)}″`;
  if (v >= 0.001) return `${fmt(v * 1000, 0)} mas`;
  return `${fmt(v * 1e6, 0)} µas`;
}

export default function ApertureLab() {
  const id = useId();
  const [logD, setLogD] = useState(Math.log10(200));
  const [sep, setSep] = useState(0.5); // ″
  const [site, setSite] = useState<Site>('ground');

  const D = Math.round(10 ** logD);
  const light = (D / EYE) ** 2;
  const mLim = limitingMag(D);
  const theta = diffraction(D);
  const seeing = SITES.find(s => s.id === site)!.seeing;
  const effective = Math.hypot(theta, seeing);
  const resolved = sep >= effective;

  const stars = useMemo(() => {
    const rnd = random(42);
    return Array.from({ length: 1400 }, () => ({
      x: rnd() * PW,
      y: rnd() * PH,
      m: 26 * Math.sqrt(rnd()),
    }));
  }, []);

  // Двойната звезда: полето е 4 пъти по-широко от разстоянието между звездите
  const field = 4 * sep;
  const pxPerArcsec = PW / field;
  // Ширината на петното (FWHM) е равна на разделителната способност
  const sigma = Math.max(1.5, (effective * pxPerArcsec) / 2.355);
  const ring = theta * pxPerArcsec * 1.63;
  const half = (sep * pxPerArcsec) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Защо телескопите стават все по-големи</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Променете диаметъра на телескопа. Вляво – колко звезди се виждат в едно и също парче небе. Вдясно – двойна звезда: успява ли
        телескопът да я раздели на две?
      </p>

      <svg viewBox={`0 0 ${2 * PW + 20} ${PH + 26}`} className="w-full h-auto select-none">
        <defs>
          <radialGradient id={`${id}-psf`}>
            <stop offset="0" stopColor="#fff7d6" stopOpacity="1" />
            <stop offset="0.33" stopColor="#fff7d6" stopOpacity="0.6" />
            <stop offset="0.66" stopColor="#fde68a" stopOpacity="0.12" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={PW} height={PH} rx="8" fill="#0b1020" />
        {stars
          .filter(s => s.m < mLim)
          .map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={Math.min(2.2, 0.4 + 0.18 * (mLim - s.m))} fill="white" opacity={Math.min(1, 0.35 + 0.15 * (mLim - s.m))} />
          ))}
        <text x={PW / 2} y={PH + 18} fontSize="12" textAnchor="middle" fill="currentColor">
          звезди до {fmt(mLim, 1)}ᵐ
        </text>

        <g transform={`translate(${PW + 20} 0)`}>
          <rect width={PW} height={PH} rx="8" fill="#0b1020" />
          <clipPath id={`${id}-clip`}>
            <rect width={PW} height={PH} rx="8" />
          </clipPath>
          <g clipPath={`url(#${id}-clip)`}>
            {[-half, half].map(dx => (
              <g key={dx}>
                {seeing === 0 && ring < PW && (
                  <circle cx={PW / 2 + dx} cy={PH / 2} r={ring} fill="none" stroke="#fde68a" strokeOpacity="0.25" strokeWidth={Math.max(1, sigma / 2)} />
                )}
                <circle cx={PW / 2 + dx} cy={PH / 2} r={3 * sigma} fill={`url(#${id}-psf)`} />
              </g>
            ))}
          </g>
          <line x1={PW / 2 - half} x2={PW / 2 + half} y1={PH - 18} y2={PH - 18} stroke="white" strokeOpacity="0.5" />
          <text x={PW / 2} y={PH - 24} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
            {arcsec(sep)}
          </text>
          <text x={PW / 2} y={PH + 18} fontSize="12" textAnchor="middle" fill={resolved ? '#16a34a' : '#dc2626'} fontWeight="600">
            {resolved ? '✓ две звезди' : '✗ сливат се в една'}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <label className="block">
          <span className="block text-xs font-semibold mb-1">Диаметър D = {D >= 1000 ? `${fmt(D / 1000, 1)} m` : `${D} mm`}</span>
          <input type="range" min={Math.log10(EYE)} max={Math.log10(39000)} step={0.005} value={logD} onChange={e => setLogD(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold mb-1">Разстояние между звездите: {arcsec(sep)}</span>
          <input
            type="range"
            min={-2}
            max={1.5}
            step={0.01}
            value={Math.log10(sep)}
            onChange={e => setSep(10 ** Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => setLogD(Math.log10(p.D))}
            className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-gray-700"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {SITES.map(s => (
          <button
            key={s.id}
            onClick={() => setSite(s.id)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              site === s.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{SITES.find(s => s.id === site)!.text}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Светлина спрямо окото (D / 7 mm)²', value: `${light < 1000 ? fmt(light, 0) : formatScientific(light, 1)}×` },
          { label: 'Гранична величина', value: `${fmt(mLim, 1)}ᵐ` },
          { label: 'Звезди на цялото небе', value: `~${formatScientific(starCount(mLim), 0)}` },
          { label: 'Предел: дифракция / с атмосфера', value: `${arcsec(theta)} / ${arcsec(effective)}` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
