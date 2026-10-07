import { useState } from 'react';
import { C, colorName, EV, formatEnergy, formatFrequency, formatLength, H_PLANCK, wavelengthToRGB } from './light';

const W = 640;
const H = 330;
const X0 = 20;
const X1 = W - 20;
const LOG_MIN = -12; // 1 pm
const LOG_MAX = 3; // 1 km
const ATM_BASE = 286;

const sx = (log: number) => X0 + ((log - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

type Band = {
  name: string;
  from: number; // log10 на λ в метри
  to: number;
  color: string;
  sources: string;
  telescope: string;
  everyday: string;
};

const BANDS: Band[] = [
  {
    name: 'Гама лъчи',
    from: LOG_MIN,
    to: -11,
    color: '#c026d3',
    sources: 'избухвания на свръхнови, гама-избухвания, околностите на черни дупки',
    telescope: 'Ферми (в орбита)',
    everyday: 'радиоактивен разпад, лъчетерапия',
  },
  {
    name: 'Рентгенови лъчи',
    from: -11,
    to: -8,
    color: '#7c3aed',
    sources: 'газ с милиони градуси – слънчевата корона, купове галактики, акреционни дискове',
    telescope: 'Чандра, XMM-Нютон (в орбита)',
    everyday: 'рентгенова снимка',
  },
  {
    name: 'Ултравиолетово',
    from: -8,
    to: Math.log10(380e-9),
    color: '#4f46e5',
    sources: 'горещи млади звезди (O и B), бели джуджета',
    telescope: 'Хъбъл, GALEX (в орбита)',
    everyday: 'слънчев загар, UV-лампи',
  },
  {
    name: 'Видима светлина',
    from: Math.log10(380e-9),
    to: Math.log10(750e-9),
    color: '#22c55e',
    sources: 'звезди като Слънцето, мъглявини, галактики',
    telescope: 'VLT, Кек, Рожен – и окото',
    everyday: 'всичко, което виждаме',
  },
  {
    name: 'Инфрачервено',
    from: Math.log10(750e-9),
    to: -3,
    color: '#dc2626',
    sources: 'хладни звезди, прах, протопланетни дискове, най-далечните галактики',
    telescope: 'Джеймс Уеб, Спицър',
    everyday: 'топлинни камери, дистанционно управление',
  },
  {
    name: 'Микровълни',
    from: -3,
    to: 0,
    color: '#ea580c',
    sources: 'реликтовото излъчване от Големия взрив, студени молекулни облаци',
    telescope: 'Планк, ALMA',
    everyday: 'микровълнова фурна, Wi-Fi',
  },
  {
    name: 'Радиовълни',
    from: 0,
    to: LOG_MAX,
    color: '#ca8a04',
    sources: 'пулсари, квазари, неутрален водород (линия 21 cm)',
    telescope: 'FAST, VLA, LOFAR',
    everyday: 'радио, телевизия, мобилни телефони',
  },
];

/**
 * Колко от излъчването спира атмосферата (0 – прозрачна, 1 – непрозрачна).
 * Опростено: два „прозореца“ – оптичен и радио – и няколко инфрачервени.
 */
function opacity(log: number) {
  const um = 10 ** log * 1e6;
  if (um < 0.3) return 1;
  if (um < 0.32) return 1 - (um - 0.3) / 0.02;
  if (um < 1.1) return 0;
  if (um < 2.5) return 0.3; // близко инфрачервено – няколко тесни прозореца
  if (um < 5) return 0.55;
  if (um < 8) return 0.9;
  if (um < 13) return 0.35; // прозорецът 8–13 µm
  if (um < 500) return 1;
  if (log < -2) return 1 - (log + 3.3) / 1.3; // субмилиметрови вълни
  if (log < 1) return 0;
  if (log < 1.4) return (log - 1) / 0.4; // йоносферата отразява дългите вълни
  return 1;
}

const PRESETS: { label: string; log: number }[] = [
  { label: 'Рентген', log: Math.log10(1e-10) },
  { label: 'UV', log: Math.log10(200e-9) },
  { label: 'Зелено', log: Math.log10(530e-9) },
  { label: 'Топлина', log: Math.log10(10e-6) },
  { label: 'Реликтово', log: Math.log10(1.9e-3) },
  { label: '21 cm', log: Math.log10(0.21) },
];

export default function EMSpectrumExplorer() {
  const [log, setLog] = useState(Math.log10(530e-9));

  const lambda = 10 ** log;
  const nm = lambda * 1e9;
  const nu = C / lambda;
  const energy = (H_PLANCK * nu) / EV;
  const band = BANDS.find(b => log >= b.from && log < b.to) ?? BANDS[BANDS.length - 1];
  const visible = nm >= 380 && nm <= 750;
  const blocked = opacity(log);

  // Вълната: брой периоди в кадъра намалява логаритмично с λ
  const cycles = Math.max(0.6, 26 - ((log - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 25.4);
  const wave: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = X0 + (i / 400) * (X1 - X0);
    wave.push(`${x.toFixed(1)},${(70 + 26 * Math.sin((i / 400) * cycles * 2 * Math.PI)).toFixed(1)}`);
  }
  const waveColor = visible ? wavelengthToRGB(nm) : band.color;

  // Атмосферна непрозрачност като запълнен профил
  const atm: string[] = [`${X0},${ATM_BASE}`];
  for (let i = 0; i <= 300; i++) {
    const l = LOG_MIN + (i / 300) * (LOG_MAX - LOG_MIN);
    atm.push(`${sx(l).toFixed(1)},${(ATM_BASE - 64 * opacity(l)).toFixed(1)}`);
  }
  atm.push(`${X1},${ATM_BASE}`);

  const visFrom = sx(Math.log10(380e-9));
  const visTo = sx(Math.log10(750e-9));
  const marker = sx(log);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Електромагнитният спектър</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Плъзнете маркера от гама лъчите до радиовълните. Скалата е логаритмична – всяко деление е 10 пъти по-дълга вълна.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <linearGradient id="em-visible" x1="0" x2="1">
            {[380, 420, 460, 500, 540, 580, 620, 660, 700, 750].map((w, i) => (
              <stop key={w} offset={i / 9} stopColor={wavelengthToRGB(w)} />
            ))}
          </linearGradient>
        </defs>

        {/* Вълната */}
        <polyline points={wave.join(' ')} fill="none" stroke={waveColor} strokeWidth="2.5" />
        <text x={X0} y={22} fontSize="12" fill="white" fillOpacity="0.6">
          λ = {formatLength(lambda)}
        </text>

        {/* Ивиците на спектъра */}
        {BANDS.map(b => (
          <g key={b.name}>
            <rect
              x={sx(b.from)}
              y={118}
              width={sx(b.to) - sx(b.from)}
              height={34}
              fill={b.name === 'Видима светлина' ? 'url(#em-visible)' : b.color}
              fillOpacity={b === band ? 0.95 : 0.55}
            />
          </g>
        ))}
        {/* Видимата светлина е тясна – увеличаваме я отдолу */}
        <path d={`M ${visFrom} 152 L ${W / 2 - 90} 164 M ${visTo} 152 L ${W / 2 + 90} 164`} stroke="white" strokeOpacity="0.35" />
        <rect x={W / 2 - 90} y={164} width={180} height={12} rx="2" fill="url(#em-visible)" />
        <text x={W / 2 - 96} y={174} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          380 nm
        </text>
        <text x={W / 2 + 96} y={174} fontSize="9" fill="white" fillOpacity="0.6">
          750 nm
        </text>

        {/* Скала */}
        {[-12, -9, -6, -3, 0, 3].map(l => (
          <g key={l}>
            <line x1={sx(l)} x2={sx(l)} y1={114} y2={118} stroke="white" strokeOpacity="0.5" />
            <text x={sx(l)} y={110} fontSize="10" textAnchor={l === -12 ? 'start' : l === 3 ? 'end' : 'middle'} fill="white" fillOpacity="0.6">
              {formatLength(10 ** l)}
            </text>
          </g>
        ))}

        {/* Атмосферата */}
        <polygon points={atm.join(' ')} fill="#94a3b8" fillOpacity="0.25" stroke="#94a3b8" strokeOpacity="0.6" />
        <text x={X0 + 4} y={ATM_BASE - 70} fontSize="10" fill="white" fillOpacity="0.6">
          Непрозрачност на атмосферата
        </text>
        <text x={sx(-6.3)} y={ATM_BASE - 6} fontSize="9" textAnchor="middle" fill="#86efac">
          оптичен прозорец
        </text>
        <text x={sx(-0.5)} y={ATM_BASE - 6} fontSize="9" textAnchor="middle" fill="#86efac">
          радиопрозорец
        </text>
        <line x1={X0} x2={X1} y1={ATM_BASE} y2={ATM_BASE} stroke="white" strokeOpacity="0.3" />

        {/* Маркер */}
        <line x1={marker} x2={marker} y1={100} y2={ATM_BASE + 4} stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={marker} cy={135} r={8} fill={waveColor} stroke="white" strokeWidth="2" />
        <text x={W / 2} y={H - 14} fontSize="13" fontWeight="600" textAnchor="middle" fill="white">
          {band.name}
          {visible && ` – ${colorName(nm)}`}
        </text>
      </svg>

      <input
        type="range"
        min={LOG_MIN}
        max={LOG_MAX}
        step="0.01"
        value={log}
        onChange={e => setLog(Number(e.target.value))}
        className="w-full mt-3"
        aria-label="Дължина на вълната"
      />
      <div className="flex flex-wrap gap-1 mt-1">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => setLog(p.log)}
            className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Дължина на вълната λ', value: formatLength(lambda) },
          { label: 'Честота ν = c / λ', value: formatFrequency(nu) },
          { label: 'Енергия на фотона hν', value: formatEnergy(energy) },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-gray-100/70 dark:bg-gray-900/40 rounded-lg text-sm space-y-1">
        <p>
          <strong>В космоса:</strong> {band.sources}
        </p>
        <p>
          <strong>Наблюдаваме с:</strong> {band.telescope}
        </p>
        <p>
          <strong>На Земята:</strong> {band.everyday}
        </p>
        <p className={blocked > 0.6 ? 'text-red-600 dark:text-red-400' : blocked > 0.2 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}>
          {blocked > 0.6
            ? '✗ Атмосферата не го пропуска – нужен е телескоп в космоса.'
            : blocked > 0.2
              ? '◐ Атмосферата го пропуска частично – наблюдава се от високи и сухи планини или от самолет.'
              : '✓ Достига до повърхността – може да се наблюдава от Земята.'}
        </p>
      </div>
    </div>
  );
}
