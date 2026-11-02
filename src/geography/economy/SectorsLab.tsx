import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { SECTOR_PATHS, SECTORS_2023, type SectorRow, WORLD_2023 } from './industryModel';

const X0 = 50;
const X1 = 620;
const T0 = 16;
const B0 = 290;
const LMIN = 3; // 1000 $
const LMAX = 5; // 100 000 $
const YMAX = 90;
const xOf = (g: number) => X0 + ((Math.log10(g) - LMIN) / (LMAX - LMIN)) * (X1 - X0);
const yOf = (v: number) => B0 - (v / YMAX) * (B0 - T0);

const SECT = [
  { key: 'agr', label: 'селско стопанство', cls: 'fill-emerald-500', stroke: 'stroke-emerald-500', text: 'fill-emerald-700 dark:fill-emerald-400' },
  { key: 'ind', label: 'индустрия', cls: 'fill-amber-500', stroke: 'stroke-amber-500', text: 'fill-amber-700 dark:fill-amber-400' },
  { key: 'srv', label: 'услуги', cls: 'fill-blue-500', stroke: 'stroke-blue-500', text: 'fill-blue-700 dark:fill-blue-300' },
] as const;

/** Моделът на Кларк и Фишър: делът на заетите по сектори според доходите. */
export default function SectorsLab() {
  const [mode, setMode] = useState<'now' | 'path'>('now');
  const [sel, setSel] = useState('България');
  const [path, setPath] = useState('Китай');

  const row: SectorRow = sel === WORLD_2023.name ? WORLD_2023 : (SECTORS_2023.find(r => r.name === sel) ?? SECTORS_2023[0]);
  const pth = SECTOR_PATHS.find(p => p.name === path) ?? SECTOR_PATHS[0];
  const first = pth.rows[0];
  const last = pth.rows[pth.rows.length - 1];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
          <g key={v}>
            <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        <text x={X0 - 6} y={T0 - 6} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          %
        </text>
        {[1000, 2000, 5000, 10000, 20000, 50000, 100000].map(g => (
          <g key={g}>
            <line x1={xOf(g)} y1={T0} x2={xOf(g)} y2={B0} className="stroke-gray-100 dark:stroke-gray-700/60" />
            <text x={xOf(g)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {`${g / 1000} 000`}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={B0 + 30} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          БВП на човек по ППС, международни долари (логаритмична скала)
        </text>

        {mode === 'now' && (
          <>
            {SECTORS_2023.map(r =>
              SECT.map(s => (
                <circle
                  key={r.name + s.key}
                  cx={xOf(r.gdp)}
                  cy={yOf(r[s.key])}
                  r={r.name === sel ? 7 : 4.5}
                  className={`${s.cls} cursor-pointer ${r.name === sel ? 'stroke-gray-900 dark:stroke-white' : 'stroke-white dark:stroke-gray-800'}`}
                  strokeWidth={r.name === sel ? 2 : 1}
                  opacity={r.name === sel ? 1 : 0.75}
                  onClick={() => setSel(r.name)}
                />
              ))
            )}
            {SECT.map(s => (
              <text
                key={s.key}
                x={xOf(row.gdp) + 10}
                y={yOf(row[s.key]) + 4}
                fontSize="11"
                fontWeight="bold"
                className={s.text}
                stroke="white"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {fmt(row[s.key], 1)}%
              </text>
            ))}
            <text x={xOf(row.gdp)} y={T0 + 10} fontSize="11" fontWeight="bold" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
              {row.name}
            </text>
            <line x1={xOf(row.gdp)} y1={T0 + 14} x2={xOf(row.gdp)} y2={B0} className="stroke-gray-400" strokeDasharray="2 3" />
          </>
        )}

        {mode === 'path' &&
          [first, last].map(r => (
            <text key={r[0]} x={xOf(r[1])} y={T0 + 10} fontSize="10" fontWeight="bold" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {r[0]}
            </text>
          ))}
        {mode === 'path' &&
          SECT.map(s => (
            <g key={s.key}>
              <polyline
                points={pth.rows.map(r => `${xOf(r[1]).toFixed(1)},${yOf(r[2 + SECT.indexOf(s)]).toFixed(1)}`).join(' ')}
                fill="none"
                className={s.stroke}
                strokeWidth="2.5"
              />
              {pth.rows.map(r => (
                <circle key={r[0]} cx={xOf(r[1])} cy={yOf(r[2 + SECT.indexOf(s)])} r={4} className={`${s.cls} stroke-white dark:stroke-gray-800`} />
              ))}
            </g>
          ))}

      </LabSvg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-700 dark:text-gray-200">
        {SECT.map(s => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <svg width="10" height="10" aria-hidden="true">
              <circle cx="5" cy="5" r="5" className={s.cls} />
            </svg>
            {s.label}
          </span>
        ))}
      </div>
      <Buttons>
        <DiagramButton active={mode === 'now'} onClick={() => setMode('now')}>
          Страните през 2023 г.
        </DiagramButton>
        <DiagramButton active={mode === 'path'} onClick={() => setMode('path')}>
          Пътят 1991–2023
        </DiagramButton>
      </Buttons>
      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
        {(mode === 'now' ? [...SECTORS_2023.map(r => r.name), WORLD_2023.name] : SECTOR_PATHS.map(p => p.name)).map(n => {
          const active = mode === 'now' ? n === sel : n === path;
          return (
            <button
              key={n}
              type="button"
              onClick={() => (mode === 'now' ? setSel(n) : setPath(n))}
              className={`px-2 py-0.5 rounded text-xs border ${
                active ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Дял на заетите в трите сектора (моделни оценки на МОТ) и БВП на човек по паритет на покупателната способност в постоянни долари от 2021 г. Източник:
        Световната банка, WDI. Щракни точка или име на страна.
      </p>
      <div className="mt-3">
        {mode === 'now' ? (
          <Readout
            items={[
              { label: 'БВП на човек (ППС)', value: `${fmt(row.gdp)} $`, tone: 'gray' },
              { label: 'селско ст.', value: `${fmt(row.agr, 1)}%`, tone: 'emerald' },
              { label: 'индустрия', value: `${fmt(row.ind, 1)}%`, tone: 'amber' },
              { label: 'услуги', value: `${fmt(row.srv, 1)}%`, tone: 'blue' },
            ]}
          />
        ) : (
          <Readout
            items={[
              { label: 'доход', value: `×${fmt(last[1] / first[1], 1)}`, tone: 'gray' },
              { label: 'селско ст.', value: `${fmt(first[2], 0)} → ${fmt(last[2], 0)}%`, tone: 'emerald' },
              { label: 'индустрия', value: `${fmt(first[3], 0)} → ${fmt(last[3], 0)}%`, tone: 'amber' },
              { label: 'услуги', value: `${fmt(first[4], 0)} → ${fmt(last[4], 0)}%`, tone: 'blue' },
            ]}
          />
        )}
      </div>
      <Note tone="blue">
        {mode === 'now'
          ? 'Колкото по-богата е страната, толкова по-малко хора работят в селското стопанство и повече – в услугите. Делът на индустрията е най-голям при средните доходи.'
          : path === 'България'
            ? 'През 90-те години в България индустрията се свива, а част от хората се връщат към земеделието – пътят не винаги е прав.'
            : path === 'Южна Корея'
              ? 'Южна Корея вече е минала върха на индустрията: делът ѝ пада, а услугите растат – деиндустриализация.'
              : `За ${pth.rows[pth.rows.length - 1][0] - pth.rows[0][0]} години хората се местят от нивите към фабриките и услугите.`}
      </Note>
    </div>
  );
}
