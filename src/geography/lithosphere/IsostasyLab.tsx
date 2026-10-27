import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

type Mode = 'mountain' | 'ice' | 'erosion';
const RHO_M = 3.3;
const RHO_ICE = 0.917;
/** Нормална дебелина на континенталната кора с повърхност на морското равнище, km. */
const T0 = 35;

// Чертеж: вертикален мащаб – 2,5 px на km
const PX = 2.5;
const SEA = 60;

/** Изостазия по Ейри: кората „плава“ в мантията и под високите планини има дълбоки корени. */
export default function IsostasyLab() {
  const [mode, setMode] = useState<Mode>('mountain');
  const [h, setH] = useState(4);
  const [ice, setIce] = useState(2);
  const [eroded, setEroded] = useState(2);
  const [rhoC, setRhoC] = useState(2.7);

  const k = rhoC / (RHO_M - rhoC); // корен на km височина
  // Колоните: [ширина, височина над морето, корен под нормалната кора, лед]
  let cols: { w: number; top: number; root: number; ice: number; label: string }[] = [];
  let readout: { label: string; value: string; tone?: 'rose' | 'emerald' | 'blue' }[] = [];
  let note = '';

  if (mode === 'mountain') {
    const root = h * k;
    cols = [
      { w: 150, top: 0, root: 0, ice: 0, label: 'равнина' },
      { w: 140, top: h / 2, root: (h / 2) * k, ice: 0, label: 'предпланина' },
      { w: 140, top: h, root, ice: 0, label: 'планина' },
      { w: 150, top: 0, root: 0, ice: 0, label: 'равнина' },
    ];
    readout = [
      { label: 'корен', value: `${fmt(root, 1)} km`, tone: 'rose' },
      { label: 'дебелина на кората', value: `${fmt(T0 + h + root, 1)} km` },
      { label: 'корен : височина', value: `${fmt(k, 1)} : 1` },
    ];
    note = 'Масата на всяка колона до дълбочината на изравняване е една и съща – планината е уравновесена от лек корен.';
  } else if (mode === 'ice') {
    const sink = (ice * RHO_ICE) / RHO_M;
    cols = [
      { w: 150, top: 0, root: 0, ice: 0, label: 'без лед' },
      { w: 280, top: -sink, root: sink, ice, label: 'под ледената шапка' },
      { w: 150, top: 0, root: 0, ice: 0, label: 'без лед' },
    ];
    readout = [
      { label: 'кората потъва с', value: `${fmt(sink * 1000)} m`, tone: 'rose' },
      { label: 'повърхността на леда', value: `${fmt((ice - sink) * 1000)} m над морето` },
    ];
    note = 'Когато ледът се стопи, кората бавно изплува обратно – Скандинавия и днес се издига с до около 1 cm годишно.';
  } else {
    const start = 4;
    const drop = eroded * (1 - rhoC / RHO_M);
    const top = start - drop;
    cols = [
      { w: 150, top: 0, root: 0, ice: 0, label: 'равнина' },
      { w: 280, top, root: top * k, ice: 0, label: 'планина след ерозията' },
      { w: 150, top: 0, root: 0, ice: 0, label: 'равнина' },
    ];
    readout = [
      { label: 'отнесени', value: `${fmt(eroded, 1)} km скали` },
      { label: 'върхът се снижава с', value: `${fmt(drop * 1000)} m`, tone: 'rose' },
      { label: 'изплуват отдолу', value: `${fmt((eroded - drop) * 1000)} m`, tone: 'emerald' },
    ];
    note = 'Ерозията отнема скали отгоре, но кората изплува и отдолу излизат скали, образувани дълбоко – така на повърхността се появяват гранити и гнайси.';
  }

  let x = 20;
  const y = (km: number) => SEA - km * PX; // km над морето → px
  const base = T0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={20} y={y(-base)} width={600} height={330 - y(-base)} className="fill-orange-200 dark:fill-orange-950/70" />
        <text x={612} y={318} fontSize="12" textAnchor="end" className="fill-orange-900 dark:fill-orange-200">
          мантия, {fmt(RHO_M, 1)} g/cm³
        </text>
        {cols.map((c, i) => {
          const x0 = x;
          x += c.w;
          const topY = y(c.top);
          const botY = y(-base - c.root);
          return (
            <g key={i}>
              <rect x={x0} y={topY} width={c.w} height={botY - topY} className="fill-stone-300 stroke-stone-500 dark:fill-stone-600 dark:stroke-stone-400" strokeWidth="1" />
              {c.ice > 0 && <rect x={x0 + 10} y={y(c.top + c.ice)} width={c.w - 20} height={c.ice * PX} rx={6} className="fill-sky-100 stroke-sky-400 dark:fill-sky-200" />}
              <text x={x0 + c.w / 2} y={botY + 14} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
                {c.label}
              </text>
              {c.root > 0.05 && (
                <text x={x0 + c.w / 2} y={(y(-base) + botY) / 2 + 4} fontSize="11" textAnchor="middle" className="fill-stone-800 dark:fill-stone-100">
                  корен {fmt(c.root, 1)} km
                </text>
              )}
            </g>
          );
        })}
        <line x1={20} y1={y(0)} x2={620} y2={y(0)} className="stroke-blue-500" strokeDasharray="6 4" />
        <text x={24} y={y(0) - 4} fontSize="11" className="fill-blue-700 dark:fill-blue-300">
          морско равнище
        </text>
        <line x1={20} y1={y(-base)} x2={620} y2={y(-base)} className="stroke-gray-500" strokeDasharray="3 3" />
        <text x={24} y={y(-base) - 4} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          нормална основа на кората, {T0} km
        </text>
        <text x={24} y={y(0) + 16} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
          кора, {fmt(rhoC, 2)} g/cm³
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Вертикалният и хоризонталният мащаб са различни – дебелините са в km.</p>
      <Buttons>
        {(
          [
            ['mountain', 'Планина и корен'],
            ['ice', 'Ледена шапка'],
            ['erosion', 'Ерозия'],
          ] as [Mode, string][]
        ).map(([id, name]) => (
          <DiagramButton key={id} active={mode === id} onClick={() => setMode(id)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        {mode === 'mountain' && <Slider label="h, km" value={h} onChange={setH} min={0} max={8} step={0.5} tone="amber" />}
        {mode === 'ice' && <Slider label="лед, km" value={ice} onChange={setIce} min={0} max={3.5} step={0.25} tone="blue" />}
        {mode === 'erosion' && <Slider label="ерозия" value={eroded} onChange={setEroded} min={0} max={4} step={0.25} tone="amber" />}
        <Slider label="ρ кора" value={rhoC} onChange={setRhoC} min={2.6} max={2.9} step={0.05} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout items={readout} />
      </div>
      <Note tone="blue">{note}</Note>
    </div>
  );
}
