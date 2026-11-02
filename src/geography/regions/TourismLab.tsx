import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { NIGHTS, NUTS2_NAME, type Nuts2 } from './bgData';

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
const REGIONS = Object.keys(NUTS2_NAME) as Nuts2[];
const HINT: Record<Nuts2 | 'BG', string> = {
  BG: 'цялата страна',
  BG31: 'Видин, Враца, Плевен, Ловеч, Монтана',
  BG32: 'Велико Търново, Русе, Габрово…',
  BG33: 'Варна, Добрич – Северното Черноморие',
  BG34: 'Бургас – Южното Черноморие, Стара Загора',
  BG41: 'София, Банско, Боровец',
  BG42: 'Пловдив, Пампорово, Велинград',
};

/** Сезонност на туризма: нощувки по месеци и колко легла стоят празни извън сезона. */
export default function TourismLab() {
  const [reg, setReg] = useState<Nuts2 | 'BG'>('BG34');
  const [shift, setShift] = useState(0);

  const raw =
    reg === 'BG'
      ? { all: DAYS.map((_, m) => REGIONS.reduce((s, r) => s + NIGHTS[r].all[m], 0)), foreign: DAYS.map((_, m) => REGIONS.reduce((s, r) => s + NIGHTS[r].foreign[m], 0)) }
      : NIGHTS[reg];
  // Преместваме shift% от нощувките през юли и август поравно в май, юни, септември и октомври; делът на чужденците остава същият
  const all = [...raw.all];
  const foreign = [...raw.foreign];
  const moved = ((all[6] + all[7]) * shift) / 100;
  const movedF = ((foreign[6] + foreign[7]) * shift) / 100;
  for (const m of [6, 7]) {
    all[m] *= 1 - shift / 100;
    foreign[m] *= 1 - shift / 100;
  }
  for (const m of [4, 5, 8, 9]) {
    all[m] += moved / 4;
    foreign[m] += movedF / 4;
  }
  const total = all.reduce((a, b) => a + b, 0);
  const perDay = all.map((v, m) => v / DAYS[m]);
  const beds = Math.max(...perDay); // хиляди легла, нужни при 100% заетост в най-натоварения месец
  const occ = total / (beds * 365);
  const summer = (all[5] + all[6] + all[7] + all[8]) / total;
  const peakMonth = perDay.indexOf(beds);
  const lowMonth = perDay.indexOf(Math.min(...perDay));
  const foreignShare = foreign.reduce((a, b) => a + b, 0) / total;
  const baseBeds = Math.max(...raw.all.map((v, m) => v / DAYS[m]));

  const C = { x: 54, y: 24, w: 560, h: 220 };
  const yMax = Math.max(...raw.all.map((v, m) => v / DAYS[m])) * 1.08;
  const nice = (() => {
    const step = [0.5, 1, 2, 5, 10, 20, 50, 100, 200][[0.5, 1, 2, 5, 10, 20, 50, 100, 200].findIndex(s => yMax / s <= 6)] ?? 200;
    return Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  })();
  const cy = (v: number) => C.y + C.h - (v / yMax) * C.h;
  const bw = C.w / 12;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 280" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={C.x} y={13} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          Нощувки на ден по месеци, хиляди ({reg === 'BG' ? 'България' : `${NUTS2_NAME[reg]} район`}, 2025 г.)
        </text>
        {nice.map(v => (
          <g key={v}>
            <line x1={C.x} y1={cy(v)} x2={C.x + C.w} y2={cy(v)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={0.6} />
            <text x={C.x - 5} y={cy(v) + 3} fontSize="8.5" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(v, v < 1 && v > 0 ? 1 : 0)}
            </text>
          </g>
        ))}
        {all.map((v, m) => {
          const x = C.x + m * bw + 6;
          const dom = (v - foreign[m]) / DAYS[m];
          const f = foreign[m] / DAYS[m];
          return (
            <g key={m}>
              <rect x={x} y={cy(dom)} width={bw - 12} height={cy(0) - cy(dom)} className="fill-sky-400 dark:fill-sky-600" />
              <rect x={x} y={cy(dom + f)} width={bw - 12} height={cy(dom) - cy(dom + f)} className="fill-amber-400 dark:fill-amber-500" />
              {shift > 0 && <rect x={x} y={cy(raw.all[m] / DAYS[m])} width={bw - 12} height={1.5} className="fill-gray-500 dark:fill-gray-300" />}
              <text x={x + (bw - 12) / 2} y={C.y + C.h + 12} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {MONTHS[m]}
              </text>
            </g>
          );
        })}
        {/* легла за пика */}
        <line x1={C.x} y1={cy(beds)} x2={C.x + C.w} y2={cy(beds)} className="stroke-rose-500" strokeDasharray="5 3" strokeWidth={1.2} />
        <text x={C.x + C.w} y={cy(beds) - 4} fontSize="9" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          легла за най-натоварения месец: {fmt(beds, beds < 10 ? 1 : 0)} хил.
        </text>
        <g transform={`translate(${C.x} ${C.y + C.h + 22})`}>
          <rect width="10" height="8" className="fill-sky-400 dark:fill-sky-600" />
          <text x="14" y="8" fontSize="9" className="fill-gray-600 dark:fill-gray-300">
            българи
          </text>
          <rect x="70" width="10" height="8" className="fill-amber-400 dark:fill-amber-500" />
          <text x="84" y="8" fontSize="9" className="fill-gray-600 dark:fill-gray-300">
            чужденци
          </text>
          {shift > 0 && (
            <>
              <rect x="150" y="3" width="10" height="1.5" className="fill-gray-500 dark:fill-gray-300" />
              <text x="164" y="8" fontSize="9" className="fill-gray-600 dark:fill-gray-300">
                в действителност
              </text>
            </>
          )}
        </g>
      </LabSvg>
      <Buttons>
        <DiagramButton active={reg === 'BG'} onClick={() => setReg('BG')}>
          България
        </DiagramButton>
        {REGIONS.map(r => (
          <DiagramButton key={r} active={reg === r} onClick={() => setReg(r)}>
            {NUTS2_NAME[r]}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="преместв." value={shift} onChange={setShift} min={0} max={50} step={1} tone="emerald" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {HINT[reg]}. Височината на стълба е средният брой нощувки на ден през месеца – толкова легла са заети. „Преместв.“ – какъв процент от нощувките през
        юли и август се преместват поравно в май, юни, септември и октомври (удължаване на сезона). Данни: Евростат, места за настаняване, 2025 г.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'нощувки', value: `${fmt(total / 1000, 2)} млн.`, tone: 'blue' },
            { label: 'юни–септ.', value: `${fmt(100 * summer)}%`, tone: 'amber' },
            { label: 'чужденци', value: `${fmt(100 * foreignShare)}%`, tone: 'violet' },
            { label: `${MONTHS[peakMonth]} / ${MONTHS[lowMonth]}`, value: `${fmt(beds / perDay[lowMonth], 1)} пъти`, tone: 'rose' },
            { label: 'средна заетост', value: `${fmt(100 * occ)}%`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={occ < 0.45 ? 'rose' : 'emerald'}>
        {shift > 0
          ? `При по-дълъг сезон за пика стигат ${fmt(beds, beds < 10 ? 1 : 0)} хил. легла вместо ${fmt(baseBeds, baseBeds < 10 ? 1 : 0)} хил., а средната заетост става ${fmt(100 * occ)}%.`
          : occ < 0.45
            ? `Ако хотелите имат толкова легла, колкото са нужни през ${MONTHS[peakMonth]}, през годината средно ${fmt(100 * (1 - occ))}% от тях стоят празни.`
            : 'Нощувките са разпределени сравнително равномерно през годината – леглата се използват по-добре.'}
      </Note>
    </div>
  );
}
