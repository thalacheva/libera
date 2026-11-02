import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { ANIMALS, KCAL_DAY, KCAL_PER_KG_GRAIN } from './agricultureModel';

const GX = 30;
const GY = 40;
const CELL = 24;
const PX = 330;
const PY = 40;
const PCOL = 10;
const PSTEP = 28;
const PMAX = 50;

function Person({ x, y, on }: { x: number; y: number; on: boolean }) {
  const cls = on ? 'fill-sky-600 dark:fill-sky-400' : 'fill-gray-200 dark:fill-gray-700';
  return (
    <g className={cls}>
      <circle cx={x} cy={y - 7} r={4.5} />
      <path d={`M${x - 7} ${y + 11} Q${x - 7} ${y - 1} ${x} ${y - 1} Q${x + 7} ${y - 1} ${x + 7} ${y + 11} Z`} />
    </g>
  );
}

/** Колко души изхранва един хектар според добива, дела на животинската храна и загубите. */
export default function FoodLab() {
  const [Y, setY] = useState(4);
  const [meat, setMeat] = useState(20);
  const [loss, setLoss] = useState(0);
  const [ai, setAi] = useState(1);

  const eff = ANIMALS[ai].eff;
  const s = meat / 100;
  const supply = Y * 1000 * KCAL_PER_KG_GRAIN * (1 - loss / 100);
  const perPerson = KCAL_DAY * 365 * (1 - s + s / eff);
  const people = supply / perPerson;
  const vegan = supply / (KCAL_DAY * 365);
  const feedShare = s / eff / (1 - s + s / eff);
  const feedCells = Math.round(feedShare * 100);
  const full = Math.floor(people);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={GX} y={GY - 12} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          1 хектар (100 m × 100 m)
        </text>
        {Array.from({ length: 100 }, (_, k) => {
          // фуражът е отдолу нагоре, за да се вижда като „изяждащ“ нивата
          const row = 9 - Math.floor(k / 10);
          const col = k % 10;
          const feed = k < feedCells;
          return (
            <rect
              key={k}
              x={GX + col * CELL}
              y={GY + row * CELL}
              width={CELL - 2}
              height={CELL - 2}
              rx={2}
              className={feed ? 'fill-rose-400 dark:fill-rose-500' : 'fill-amber-300 dark:fill-amber-500'}
            />
          );
        })}
        <rect x={GX} y={GY + 10 * CELL + 10} width={10} height={10} className="fill-amber-300 dark:fill-amber-500" />
        <text x={GX + 14} y={GY + 10 * CELL + 19} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          храна за хората
        </text>
        <rect x={GX + 120} y={GY + 10 * CELL + 10} width={10} height={10} className="fill-rose-400 dark:fill-rose-500" />
        <text x={GX + 134} y={GY + 10 * CELL + 19} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          фураж за животни
        </text>

        <text x={PX} y={PY - 12} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          изхранени хора за година: {fmt(people, 1)}
        </text>
        {Array.from({ length: PMAX }, (_, k) => (
          <Person key={k} x={PX + 12 + (k % PCOL) * PSTEP} y={PY + 18 + Math.floor(k / PCOL) * 42} on={k < full} />
        ))}
        {people - full > 0.05 && full < PMAX && (
          <text
            x={PX + 12 + (full % PCOL) * PSTEP}
            y={PY + 36 + Math.floor(full / PCOL) * 42}
            fontSize="9"
            textAnchor="middle"
            className="fill-sky-700 dark:fill-sky-300"
          >
            {fmt(people - full, 1)}
          </text>
        )}
        {people > PMAX && (
          <text x={PX + 12 + 9 * PSTEP} y={PY + 18 + 5 * 42} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
            и още {fmt(people - PMAX)}
          </text>
        )}
      </LabSvg>
      <Buttons>
        {ANIMALS.map((a, i) => (
          <DiagramButton key={a.name} active={ai === i} onClick={() => setAi(i)}>
            {a.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="добив" value={Y} onChange={setY} min={1} max={10} step={0.5} tone="amber" />
        <Slider label="месо, %" value={meat} onChange={setMeat} min={0} max={60} step={1} tone="rose" />
        <Slider label="загуби" value={loss} onChange={setLoss} min={0} max={40} step={1} tone="gray" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Добив – тонове зърно от хектар (около 3400 kcal/kg); месо – дял на калориите от животинска храна; загуби – процент от реколтата, който се губи или
        изхвърля. Човек има нужда от около 2500 kcal на ден. Колко от калориите във фуража стават храна (по оценка на Alexander и др., 2016): говеждо около 3%,
        свинско 10%, пилешко 13%, мляко 24%.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'хора на хектар', value: fmt(people, 1), tone: 'blue' },
            { label: 'само растения', value: fmt(vegan, 1), tone: 'emerald' },
            { label: 'за фураж', value: `${fmt(feedShare * 100)}% от нивата`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="blue">
        {meat === 0
          ? 'Без животинска храна цялата реколта отива направо за хората.'
          : `Само ${meat}% от калориите идват от „${ANIMALS[ai].name.toLowerCase()}“, но за тях отиват ${fmt(feedShare * 100)}% от нивата. Затова един хектар изхранва ${fmt(people, 1)} души вместо ${fmt(vegan, 1)}.`}
      </Note>
    </div>
  );
}
