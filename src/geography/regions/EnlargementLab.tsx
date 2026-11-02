import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import EuTiles from './EuTiles';
import { COUNTRIES, isMember, WAVES, type Country } from './euData';

type Layer = 'eu' | 'schengen' | 'euro';
const LAYERS: [Layer, string][] = [
  ['eu', 'ЕС'],
  ['schengen', 'Шенген'],
  ['euro', 'еврозона'],
];

const inLayer = (c: Country, layer: Layer, year: number) => {
  if (layer === 'eu') return isMember(c, year);
  const y = layer === 'schengen' ? c.schengen : c.euro;
  return y !== null && y <= year;
};
const yearOf = (c: Country, layer: Layer) => (layer === 'eu' ? c.eu : layer === 'schengen' ? c.schengen : c.euro);

const ON: Record<Layer, string> = {
  eu: 'fill-sky-300 stroke-sky-700 dark:fill-sky-700 dark:stroke-sky-300',
  schengen: 'fill-emerald-300 stroke-emerald-700 dark:fill-emerald-700 dark:stroke-emerald-300',
  euro: 'fill-violet-300 stroke-violet-700 dark:fill-violet-700 dark:stroke-violet-300',
};
const NEW = 'fill-amber-300 stroke-amber-700 dark:fill-amber-600 dark:stroke-amber-200';
const OFF = 'fill-gray-100 stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600';

/** Разширяването на ЕС, Шенгенското пространство и еврозоната година по година. */
export default function EnlargementLab() {
  const [year, setYear] = useState(2007);
  const [layer, setLayer] = useState<Layer>('eu');

  const members = COUNTRIES.filter(c => inLayer(c, layer, year));
  const fresh = members.filter(c => yearOf(c, layer) === year);
  const pop = members.reduce((s, c) => s + c.pop, 0);
  const outsideEu = members.filter(c => !isMember(c, year)).length;
  const waves = WAVES.filter(([y]) => y <= year);
  const wave = waves[waves.length - 1];
  const left = layer === 'eu' ? COUNTRIES.filter(c => c.left !== undefined && c.left <= year) : [];

  const fill = (c: Country) => {
    if (!inLayer(c, layer, year)) return left.includes(c) ? 'fill-gray-300 stroke-gray-500 dark:fill-gray-600 dark:stroke-gray-400' : OFF;
    return fresh.includes(c) ? NEW : ON[layer];
  };
  const sub = (c: Country) => {
    const y = yearOf(c, layer);
    if (layer === 'eu' && c.left !== undefined && c.left <= year) return `до ${c.left}`;
    return y === null ? '—' : String(y);
  };

  const title = layer === 'eu' ? 'Членки на ЕО/ЕС' : layer === 'schengen' ? 'Шенгенско пространство' : 'Еврозона';
  const rows: [string, string][] = [
    ['година', String(year)],
    [layer === 'eu' ? 'членки' : 'страни', String(members.length)],
    ['население*', `${fmt(pop)} млн.`],
  ];
  if (layer === 'schengen') rows.push(['от тях извън ЕС', String(outsideEu)]);
  if (layer === 'euro') rows.push(['членки на ЕС без еврото', String(COUNTRIES.filter(c => isMember(c, year)).length - members.length)]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 385" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={10} y={18} fontSize="12" className="fill-gray-700 dark:fill-gray-200 font-semibold">
          {title} в края на {year} г.
        </text>
        <EuTiles countries={COUNTRIES} x0={10} y0={32} fill={fill} sub={sub} />

        {rows.map(([label, value], k) => (
          <g key={label}>
            <text x={472} y={50 + k * 26} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
              {label}
            </text>
            <text x={632} y={50 + k * 26} fontSize="12" textAnchor="end" className="fill-gray-900 dark:fill-gray-100 font-medium">
              {value}
            </text>
          </g>
        ))}

        {/* легенда */}
        {(
          [
            [ON[layer], 'вътре'],
            [NEW, `влиза през ${year} г.`],
            [OFF, 'извън'],
            ...(layer === 'eu' ? ([['fill-gray-300 stroke-gray-500 dark:fill-gray-600 dark:stroke-gray-400', 'напуснала']] as [string, string][]) : []),
          ] as [string, string][]
        ).map(([cls, label], k) => (
          <g key={label}>
            <rect x={472} y={200 + k * 22} width={14} height={14} rx={3} className={cls} />
            <text x={492} y={211 + k * 22} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
              {label}
            </text>
          </g>
        ))}
        <text x={472} y={312} fontSize="9.5" className="fill-gray-500 dark:fill-gray-400">
          * по данни към 1.1.2025 г.
        </text>
        <text x={472} y={326} fontSize="9.5" className="fill-gray-500 dark:fill-gray-400">
          Под кода – годината на влизане.
        </text>
      </LabSvg>
      <Buttons>
        {LAYERS.map(([id, label]) => (
          <DiagramButton key={id} active={layer === id} onClick={() => setLayer(id)}>
            {label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="година" value={year} onChange={setYear} min={1958} max={2026} step={1} tone="blue" />
      </Sliders>
      <Buttons>
        {WAVES.map(([y]) => (
          <DiagramButton key={y} active={year === y} onClick={() => setYear(y)}>
            {y}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Картата е схематична: всяка страна е квадратче на приблизителното си място, без истинска форма и размер. За Шенген е дадена годината, от която
        страната прилага правилата изцяло (при някои – поетапно, напр. България и Румъния по въздух и море от март 2024 г., по суша от 2025 г.). За еврозоната
        – годината на приемане на еврото (първите 11 – безналично от 1999 г., банкноти и монети от 2002 г.).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: layer === 'eu' ? 'членки' : 'страни', value: String(members.length), tone: 'blue' },
            { label: 'население', value: `${fmt(pop)} млн.`, tone: 'violet' },
            { label: 'нови', value: fresh.length ? fresh.map(c => c.code).join(', ') : '—', tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={layer === 'eu' ? 'emerald' : layer === 'schengen' ? 'amber' : 'emerald'}>
        {layer === 'eu'
          ? wave
            ? `Последна промяна: ${wave[0]} г. – ${wave[1]}.`
            : ''
          : layer === 'schengen'
            ? 'Шенген и ЕС не съвпадат: Исландия, Норвегия, Швейцария (и Лихтенщайн) са в Шенген, без да са в ЕС, а Ирландия (по свой избор) и Кипър (засега) са в ЕС, но не са в Шенген.'
            : 'Не всички членки на ЕС са в еврозоната: Дания има право да не приеме еврото, а Швеция, Полша, Чехия, Унгария и Румъния още не са изпълнили или не са поискали приемането му.'}
      </Note>
    </div>
  );
}
