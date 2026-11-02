import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/**
 * Сравнителното предимство по Рикардо (1817): Португалия и Англия, вино и плат.
 * Часовете за единица са на Рикардо (80, 90, 120, 100), разделени на 10; трудът на всяка страна
 * стига точно за по 20 единици от двете стоки без търговия, както в неговия пример (по 1 единица).
 */
const COUNTRIES = ['Португалия', 'Англия'];
const AUTARKY = 20;

// Графика на всяка страна: x – вино, y – плат, 0 … 60
const PANELS = [
  { x: 46, y: 28, s: 3.6 },
  { x: 366, y: 28, s: 3.6 },
];
const MAXQ = 60;

/** Сравнително предимство и печалба от търговията. */
export default function TradeLab() {
  const [hours, setHours] = useState([8, 9, 12, 10]); // [Пв, Пп, Ав, Ап]
  const [price, setPrice] = useState(1);
  const [exp, setExp] = useState(21);
  const clip = useId();

  const setH = (k: number) => (v: number) => setHours(hours.map((h, i) => (i === k ? v : h)));
  const h = [
    [hours[0], hours[1]],
    [hours[2], hours[3]],
  ];
  const labour = h.map(([w, c]) => AUTARKY * (w + c));
  // Алтернативна цена на 1 вино в плат
  const opp = h.map(([w, c]) => w / c);
  const same = Math.abs(opp[0] - opp[1]) < 1e-9;
  const wineMaker = opp[0] < opp[1] ? 0 : 1; // специализира във вино
  const clothMaker = 1 - wineMaker;
  const wineMax = labour[wineMaker] / h[wineMaker][0];
  const clothMax = labour[clothMaker] / h[clothMaker][1];
  const x = Math.min(exp, wineMax, clothMax / price);

  // Производство и потребление след специализацията и размяната: x вино срещу price·x плат
  const prod: [number, number][] = [];
  const cons: [number, number][] = [];
  prod[wineMaker] = [wineMax, 0];
  prod[clothMaker] = [0, clothMax];
  cons[wineMaker] = [wineMax - x, price * x];
  cons[clothMaker] = [x, clothMax - price * x];
  const gain = cons.map(([w, c]) => [w - AUTARKY, c - AUTARKY]);
  const better = gain.map(([dw, dc]) => dw >= -1e-9 && dc >= -1e-9 && dw + dc > 1e-9);
  const inRange = price > Math.min(...opp) && price < Math.max(...opp);

  const sx = (p: (typeof PANELS)[number], w: number) => p.x + w * p.s;
  const sy = (p: (typeof PANELS)[number], c: number) => p.y + (MAXQ - c) * p.s;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 298" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {PANELS.map((p, k) => {
          const [hw, hc] = h[k];
          const L = labour[k];
          const W = L / hw;
          const C = L / hc;
          const [pw, pc] = prod[k];
          const [cw, cc] = cons[k];
          return (
            <g key={k}>
              <clipPath id={`${clip}-${k}`}>
                <rect x={sx(p, 0)} y={sy(p, MAXQ)} width={MAXQ * p.s} height={MAXQ * p.s} />
              </clipPath>
              <text x={p.x} y={p.y - 12} fontSize="11" className="fill-gray-700 dark:fill-gray-200 font-medium">
                {COUNTRIES[k]}: {fmt(L)} часа труд
              </text>
              {/* Мрежа и оси */}
              {[0, 20, 40, 60].map(q => (
                <g key={q}>
                  <line x1={sx(p, 0)} y1={sy(p, q)} x2={sx(p, MAXQ)} y2={sy(p, q)} className="stroke-gray-200 dark:stroke-gray-700" />
                  <line x1={sx(p, q)} y1={sy(p, 0)} x2={sx(p, q)} y2={sy(p, MAXQ)} className="stroke-gray-200 dark:stroke-gray-700" />
                  <text x={sx(p, 0) - 4} y={sy(p, q) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
                    {q}
                  </text>
                  <text x={sx(p, q)} y={sy(p, 0) + 12} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                    {q}
                  </text>
                </g>
              ))}
              <text x={sx(p, MAXQ)} y={sy(p, 0) + 24} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
                вино →
              </text>
              <text x={sx(p, 0) + 4} y={sy(p, MAXQ) + 10} fontSize="9" className="fill-gray-500 dark:fill-gray-400">
                ↑ плат
              </text>
              <g clipPath={`url(#${clip}-${k})`}>
                {/* Граница на производствените възможности */}
                <line x1={sx(p, W)} y1={sy(p, 0)} x2={sx(p, 0)} y2={sy(p, C)} className="stroke-gray-500" strokeWidth="2" />
                {/* Линия на размяната: от точката на производство с наклон −цена */}
                {!same && (
                  <line
                    x1={sx(p, pw + pc / price)}
                    y1={sy(p, 0)}
                    x2={sx(p, 0)}
                    y2={sy(p, pc + pw * price)}
                    className="stroke-violet-500"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}
              </g>
              <circle cx={sx(p, AUTARKY)} cy={sy(p, AUTARKY)} r={4.5} className="fill-gray-400 stroke-white dark:stroke-gray-800" strokeWidth="1.5" />
              {!same && (
                <>
                  <rect x={sx(p, pw) - 4} y={sy(p, pc) - 4} width={8} height={8} className="fill-amber-500" />
                  <circle cx={sx(p, cw)} cy={sy(p, cc)} r={5.5} className={`${better[k] ? 'fill-emerald-500' : 'fill-rose-500'} stroke-white dark:stroke-gray-800`} strokeWidth="1.5" />
                </>
              )}
            </g>
          );
        })}
        <g fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          <circle cx={60} cy={290} r={4} className="fill-gray-400" />
          <text x={68} y={293}>без търговия</text>
          <rect x={160} y={286} width={8} height={8} className="fill-amber-500" />
          <text x={172} y={293}>производство</text>
          <circle cx={268} cy={290} r={4} className="fill-emerald-500" />
          <text x={276} y={293}>потребление след размяната</text>
        </g>
      </LabSvg>
      <Buttons>
        <DiagramButton
          active={hours.join() === '8,9,12,10'}
          onClick={() => {
            setHours([8, 9, 12, 10]);
            setPrice(1);
            setExp(21);
          }}
        >
          примерът на Рикардо
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="П: вино" value={hours[0]} onChange={setH(0)} min={2} max={20} step={1} tone="rose" />
        <Slider label="П: плат" value={hours[1]} onChange={setH(1)} min={2} max={20} step={1} tone="rose" />
        <Slider label="А: вино" value={hours[2]} onChange={setH(2)} min={2} max={20} step={1} tone="blue" />
        <Slider label="А: плат" value={hours[3]} onChange={setH(3)} min={2} max={20} step={1} tone="blue" />
        <Slider label="цена" value={price} onChange={setPrice} min={0.5} max={2} step={0.01} tone="violet" />
        <Slider label="износ" value={exp} onChange={setExp} min={0} max={45} step={0.5} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Първите четири плъзгача – колко часа труд струва една единица вино или плат във всяка страна. Без търговия всяка страна прави по 20 единици от двете
        стоки. „Цена“ – колко плат се дава за 1 вино; „износ“ – колко вино се разменя.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: '1 вино в Португалия струва', value: `${fmt(opp[0], 2)} плат`, tone: 'rose' },
            { label: 'в Англия', value: `${fmt(opp[1], 2)} плат`, tone: 'blue' },
            ...(same
              ? []
              : [
                  { label: `${COUNTRIES[0]}`, value: `${gain[0][0] >= 0 ? '+' : ''}${fmt(gain[0][0], 1)} вино, ${gain[0][1] >= 0 ? '+' : ''}${fmt(gain[0][1], 1)} плат`, tone: better[0] ? ('emerald' as const) : ('rose' as const) },
                  { label: `${COUNTRIES[1]}`, value: `${gain[1][0] >= 0 ? '+' : ''}${fmt(gain[1][0], 1)} вино, ${gain[1][1] >= 0 ? '+' : ''}${fmt(gain[1][1], 1)} плат`, tone: better[1] ? ('emerald' as const) : ('rose' as const) },
                ]),
          ]}
        />
      </div>
      <Note tone={same ? 'gray' : better[0] && better[1] ? 'emerald' : inRange ? 'amber' : 'rose'}>
        {same
          ? 'Алтернативните цени са еднакви – няма сравнително предимство и размяната не носи печалба.'
          : !inRange
            ? `Цената е извън интервала между алтернативните цени (${fmt(Math.min(...opp), 2)} – ${fmt(Math.max(...opp), 2)} плат за 1 вино) – едната страна губи от размяната.`
            : better[0] && better[1]
              ? `${COUNTRIES[wineMaker]} прави само вино, ${COUNTRIES[clothMaker]} – само плат, и след размяната и двете имат повече, отколкото без търговия.`
              : 'Цената е подходяща, но количеството на размяната не е – опитай с друг износ, така че и двете зелени точки да са над и вдясно от сивите.'}
      </Note>
    </div>
  );
}
