import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { REGION_YEARS, REGIONS } from './euData';

const Y0 = 2019;
const Y1 = 2060;
const VMAX = 220;
const X0 = 46;
const X1 = 420;
const T = 24;
const B = 300;
const xOf = (y: number) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
const yOf = (v: number) => B - (Math.min(v, VMAX) / VMAX) * (B - T);

const BG = REGIONS.filter(r => r.code.startsWith('BG') && r.code.length === 4);
const last = (v: number[]) => v[v.length - 1];

/** Сближаване на регионите: за колко години регион ще достигне 75% и 100% от средния БВП на човек в ЕС. */
export default function ConvergenceLab() {
  const [code, setCode] = useState('BG31');
  const [g, setG] = useState(4);
  const [ge, setGe] = useState(1.5);
  const reg = REGIONS.find(r => r.code === code)!;
  const x0 = last(reg.v);
  const n = REGION_YEARS.length - 1;
  // Досегашното средногодишно изменение на относителното ниво
  const hist = (last(reg.v) / reg.v[0]) ** (1 / n) - 1;
  const ratio = (1 + g / 100) / (1 + ge / 100);
  const level = (t: number) => x0 * ratio ** t;
  const yearsTo = (target: number) => {
    if (x0 >= target) return 0;
    if (ratio <= 1) return Infinity;
    return Math.log(target / x0) / Math.log(ratio);
  };
  const t75 = yearsTo(75);
  const t100 = yearsTo(100);
  const yearText = (t: number) => (t === 0 ? 'вече' : t === Infinity ? 'никога' : `≈ ${fmt(2024 + t)} г.`);

  const proj: string[] = [];
  for (let y = 2024; y <= Y1; y++) proj.push(`${xOf(y).toFixed(1)},${yOf(level(y - 2024)).toFixed(1)}`);
  const histPts = reg.v.map((v, i) => `${xOf(REGION_YEARS[i]).toFixed(1)},${yOf(v).toFixed(1)}`);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* оси */}
        {[0, 50, 75, 100, 150, 200].map(v => (
          <g key={v}>
            <line
              x1={X0}
              x2={X1}
              y1={yOf(v)}
              y2={yOf(v)}
              className={v === 75 || v === 100 ? 'stroke-gray-500 dark:stroke-gray-400' : 'stroke-gray-200 dark:stroke-gray-700'}
              strokeWidth={v === 75 || v === 100 ? 1.2 : 1}
              strokeDasharray={v === 75 ? '5 4' : undefined}
            />
            <text x={X0 - 6} y={yOf(v) + 4} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        <text x={X0 + 4} y={yOf(75) - 4} fontSize="9.5" className="fill-gray-600 dark:fill-gray-300">
          75% – праг за по-слабо развит регион
        </text>
        <text x={X0 + 4} y={yOf(100) - 4} fontSize="9.5" className="fill-gray-600 dark:fill-gray-300">
          средно за ЕС
        </text>
        {[2020, 2030, 2040, 2050, 2060].map(y => (
          <text key={y} x={xOf(y)} y={B + 16} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {y}
          </text>
        ))}
        <text x={X0} y={14} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          БВП на човек по ППС, % от средното за ЕС
        </text>
        <line x1={xOf(2024)} x2={xOf(2024)} y1={T} y2={B} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="2 3" />
        <polyline points={proj.join(' ')} fill="none" className="stroke-sky-500" strokeWidth="2.5" strokeDasharray="6 4" />
        <polyline points={histPts.join(' ')} fill="none" className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="3" />
        {reg.v.map((v, i) => (
          <circle key={i} cx={xOf(REGION_YEARS[i])} cy={yOf(v)} r={3} className="fill-sky-700 dark:fill-sky-300" />
        ))}
        {[t75, t100].map((t, k) =>
          t > 0 && t !== Infinity && 2024 + t <= Y1 ? (
            <circle key={k} cx={xOf(2024 + t)} cy={yOf(k ? 100 : 75)} r={5} className="fill-amber-400 stroke-amber-700" strokeWidth="1.5" />
          ) : null
        )}

        {/* Регионите на България */}
        <text x={448} y={14} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          Регионите на България, 2024 г.
        </text>
        {BG.map((r, k) => {
          const y = 34 + k * 44;
          const w = (last(r.v) / 120) * 180;
          return (
            <g key={r.code} className="cursor-pointer" onClick={() => setCode(r.code)}>
              <text x={448} y={y} fontSize="10.5" className={`${r.code === code ? 'font-semibold fill-sky-700 dark:fill-sky-300' : 'fill-gray-700 dark:fill-gray-200'}`}>
                {r.name.replace(' (BG)', '')}
              </text>
              <rect x={448} y={y + 5} width={180} height={14} rx={3} className="fill-gray-100 dark:fill-gray-700" />
              <rect x={448} y={y + 5} width={w} height={14} rx={3} className={last(r.v) >= 75 ? 'fill-emerald-500' : 'fill-sky-500'} />
              <text x={448 + w + 4 > 600 ? 448 + w - 4 : 448 + w + 4} y={y + 16} fontSize="10" textAnchor={448 + w + 4 > 600 ? 'end' : 'start'} className={448 + w + 4 > 600 ? 'fill-white' : 'fill-gray-800 dark:fill-gray-100'}>
                {last(r.v)}%
              </text>
            </g>
          );
        })}
        <line x1={448 + (75 / 120) * 180} x2={448 + (75 / 120) * 180} y1={34} y2={34 + 6 * 44 - 18} className="stroke-gray-700 dark:stroke-gray-200" strokeDasharray="3 3" />
      </LabSvg>
      <Buttons>
        {REGIONS.filter(r => !BG.includes(r)).map(r => (
          <DiagramButton key={r.code} active={code === r.code} onClick={() => setCode(r.code)}>
            {r.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="ръст, %" value={g} onChange={setG} min={0} max={8} step={0.1} tone="blue" />
        <Slider label="ЕС, %" value={ge} onChange={setGe} min={0} max={4} step={0.1} tone="gray" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setG(Math.round(((1 + ge / 100) * (1 + hist) - 1) * 1000) / 10)}>като през 2019–2024</DiagramButton>
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Данни: Евростат, 2019–2024 г. (плътната линия). Щракни регион вдясно или бутон отдолу. „ръст“ – реален годишен ръст на БВП на човек в региона,
        „ЕС“ – средният за ЕС. Пунктирът приема, че двата темпа се запазват – това е упражнение, а не прогноза. Цените и населението също се променят.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: '2024 г.', value: `${x0}%`, tone: 'blue' },
            { label: 'спрямо ЕС 2019–24', value: `${hist >= 0 ? '+' : ''}${fmt(hist * 100, 1)}% год.`, tone: 'violet' },
            { label: '75%', value: yearText(t75), tone: 'amber' },
            { label: '100%', value: yearText(t100), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={ratio > 1 ? 'emerald' : 'rose'}>
        {x0 >= 100
          ? `${reg.name} вече е над средното за ЕС – често това са столичните региони, които привличат фирми и хора от цялата страна.`
          : ratio <= 1
            ? 'Регионът расте не по-бързо от ЕС – разликата не се стопява. Догонване има само при по-бърз растеж от средния.'
            : `Относителното ниво расте с около ${fmt((ratio - 1) * 100, 1)}% годишно. Колкото по-ниско е началното ниво, толкова по-дълго трае догонването: от ${x0}% до 100% са нужни около ${fmt(t100)} години.`}
      </Note>
    </div>
  );
}
