import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const G = 9.8;
/** Височина на вълната над огнището, m. */
const H0 = 0.5;
/** Най-малката дълбочина, до която проследяваме вълната – самият бряг. */
const SHORE = 5;

type Ocean = { name: string; km: number; depth: (x: number) => number };
/** Опростени профили на дъното; x – част от пътя от огнището до брега. */
const OCEANS: Ocean[] = [
  { name: 'Тихи океан, 2000 km', km: 2000, depth: x => (x < 0.88 ? 4000 + 300 * Math.sin(9 * x) : Math.max(SHORE, 4000 * ((1 - x) / 0.12) ** 2)) },
  { name: 'Индийски океан, 1600 km', km: 1600, depth: x => (x < 0.9 ? 3800 + 500 * Math.sin(6 * x + 1) : Math.max(SHORE, 3800 * ((1 - x) / 0.1) ** 1.6)) },
  { name: 'Черно море, 300 km', km: 300, depth: x => (x < 0.8 ? 2100 - 200 * x : Math.max(SHORE, 1940 * ((1 - x) / 0.2) ** 1.5)) },
];

const X0 = 30;
const W = 590;
const SEA = 70;
const BOTTOM = 230;

/** Цунами: скорост √(gh), време до брега и нарастване на вълната в плитчините. */
export default function TsunamiLab() {
  const [o, setO] = useState(0);
  const [tMin, setTMin] = useState(60);
  const ocean = OCEANS[o];

  // Време за достигане до всяка точка: интеграл от dx / √(g h)
  const arrival = useMemo(() => {
    const n = 600;
    const t = [0];
    for (let i = 1; i <= n; i++) {
      const x = (i - 0.5) / n;
      const v = Math.sqrt(G * ocean.depth(x));
      t.push(t[i - 1] + (ocean.km * 1000) / n / v);
    }
    return t;
  }, [ocean]);
  const n = arrival.length - 1;
  const total = arrival[n] / 60;
  const tSec = tMin * 60;
  let k = 0;
  while (k < n && arrival[k + 1] <= tSec) k++;
  const xPos = k / n;
  const hHere = ocean.depth(Math.min(xPos, 0.999));
  const vHere = Math.sqrt(G * hHere);
  const heightHere = H0 * (ocean.depth(0.01) / hHere) ** 0.25;

  const maxDepth = Math.max(...Array.from({ length: 101 }, (_, i) => ocean.depth(i / 100)));
  const dy = (h: number) => SEA + (h / maxDepth) * (BOTTOM - SEA);
  const floor = Array.from({ length: 201 }, (_, i) => `${i ? 'L' : 'M'}${(X0 + (i / 200) * W).toFixed(1)} ${dy(ocean.depth(i / 200)).toFixed(1)}`).join('');
  // Повърхността с гърбица на мястото на вълната (височината е силно преувеличена)
  const wx = X0 + xPos * W;
  const surface = Array.from({ length: 301 }, (_, i) => {
    const x = X0 + (i / 300) * W;
    const bump = tMin >= total ? 0 : Math.min(40, heightHere * 10) * Math.exp(-(((x - wx) / 14) ** 2));
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${(SEA - bump).toFixed(1)}`;
  }).join('');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 270" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <path d={`${floor}L${X0 + W} ${SEA}L${X0} ${SEA}Z`} className="fill-sky-200 dark:fill-sky-900/60" />
        <path d={`${floor}L${X0 + W} ${BOTTOM + 15}L${X0} ${BOTTOM + 15}Z`} className="fill-amber-200 stroke-amber-700 dark:fill-amber-900/60 dark:stroke-amber-400" strokeWidth="1" />
        <path d={surface} fill="none" className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="2" />
        <path d={`M${X0 + W} ${SEA} L${X0 + W} ${SEA - 18} L${X0 + W - 10} ${SEA - 18}`} className="stroke-gray-700 dark:stroke-gray-200" fill="none" strokeWidth="1.5" />
        <text x={X0 + W} y={SEA - 24} fontSize="11" textAnchor="end" className="fill-gray-700 dark:fill-gray-200">
          бряг
        </text>
        <text x={X0} y={SEA - 24} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          огнище
        </text>
        <path d={`M${X0} ${dy(ocean.depth(0.01)) + 2} l-6 10 l12 0 z`} className="fill-red-600" />
        <text x={X0 + 4} y={BOTTOM + 32} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          0
        </text>
        <text x={X0 + W} y={BOTTOM + 32} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          {ocean.km} km
        </text>
        <text x={X0 + W / 2} y={BOTTOM + 32} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          най-голяма дълбочина {fmt(maxDepth)} m (дълбочините и вълната са силно преувеличени)
        </text>
      </LabSvg>
      <Buttons>
        {OCEANS.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={o === i}
            onClick={() => {
              setO(i);
              setTMin(10);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="t, min" value={Math.min(tMin, Math.ceil(total) + 5)} onChange={setTMin} min={0} max={Math.ceil(total) + 5} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            tMin >= total
              ? [
                  { label: 'вълната стигна брега след', value: `${fmt(total)} min = ${fmt(total / 60, 1)} h`, tone: 'rose' },
                  { label: 'височина при брега (без разливането)', value: `≈ ${fmt(H0 * (ocean.depth(0.01) / SHORE) ** 0.25, 1)} m` },
                ]
              : [
                  { label: 'изминала', value: `${fmt(xPos * ocean.km)} km` },
                  { label: 'дълбочина', value: `${fmt(hHere)} m` },
                  { label: 'скорост', value: `${fmt(vHere * 3.6)} km/h`, tone: 'blue' },
                  { label: 'височина', value: `${fmt(heightHere, 2)} m`, tone: 'rose' },
                  { label: 'до брега', value: `${fmt(total)} min` },
                ]
          }
        />
      </div>
    </div>
  );
}
