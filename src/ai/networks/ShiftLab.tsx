import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { argMax, conv2d, dot, type Grid, place } from './conv';

const W = 640;
const H = 270;
const N = 9;
const CELL = 24;
const Y0 = 40;

const PLUS: Grid = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];
const HOME = 3;
/** Тегла на „неврона шаблон“: кръстчето точно в средата на картинката. */
const TEMPLATE = place(PLUS, N, HOME, HOME);

/** Кръстче, което се мести по картинката: неврон, свързан с всички пиксели, срещу един филтър, плъзган навсякъде. */
export default function ShiftLab() {
  const [pos, setPos] = useState({ top: HOME, left: HOME });
  const img = place(PLUS, N, pos.top, pos.left);
  const template = dot(img, TEMPLATE);
  const map = conv2d(img, PLUS);
  const best = argMax(map);
  const moved = pos.top !== HOME || pos.left !== HOME;
  const move = (dr: number, dc: number) => setPos(p => ({ top: Math.max(0, Math.min(N - 3, p.top + dr)), left: Math.max(0, Math.min(N - 3, p.left + dc)) }));

  const x1 = 30;
  const mc = 26;
  const x2 = 400;
  const my = Y0 + (N * CELL - 7 * mc) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={x1 + (N * CELL) / 2} y={22} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          картинка 9 × 9 (пунктир: където гледа шаблонът)
        </text>
        {img.map((row, r) =>
          row.map((v, c) => (
            <rect
              key={`${r}-${c}`}
              x={x1 + c * CELL}
              y={Y0 + r * CELL}
              width={CELL}
              height={CELL}
              onClick={() => setPos({ top: Math.max(0, Math.min(N - 3, r - 1)), left: Math.max(0, Math.min(N - 3, c - 1)) })}
              className={`cursor-pointer ${v ? 'fill-gray-900 dark:fill-gray-100' : 'fill-gray-100 dark:fill-gray-900'} stroke-gray-300 dark:stroke-gray-600`}
              strokeWidth="0.8"
            />
          ))
        )}
        {TEMPLATE.map((row, r) => row.map((v, c) => (v ? <rect key={`t${r}-${c}`} x={x1 + c * CELL + 2} y={Y0 + r * CELL + 2} width={CELL - 4} height={CELL - 4} fill="none" className="stroke-blue-500" strokeWidth="2" strokeDasharray="4 3" pointerEvents="none" /> : null)))}
        <text x={325} y={Y0 + (N * CELL) / 2 + 8} fontSize="24" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <text x={x2 + (7 * mc) / 2} y={22} fontSize="13" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          карта на филтъра „кръстче“ 7 × 7
        </text>
        {map.map((row, r) =>
          row.map((v, c) => {
            const top = r === best.r && c === best.c;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x2 + c * mc} y={my + r * mc} width={mc} height={mc} fill={`rgba(192,38,211,${(v / 5) * 0.85})`} className={top ? 'stroke-fuchsia-800 dark:stroke-fuchsia-200' : 'stroke-gray-300 dark:stroke-gray-600'} strokeWidth={top ? 2.5 : 0.8} />
                <text x={x2 + (c + 0.5) * mc} y={my + (r + 0.5) * mc + 4} fontSize="12" fontFamily="monospace" fontWeight={top ? 'bold' : 'normal'} textAnchor="middle" className="fill-gray-900 dark:fill-gray-100" pointerEvents="none">
                  {v}
                </text>
              </g>
            );
          })
        )}
      </LabSvg>
      <Buttons>
        <DiagramButton onClick={() => move(0, -1)}>← наляво</DiagramButton>
        <DiagramButton onClick={() => move(-1, 0)}>↑ нагоре</DiagramButton>
        <DiagramButton onClick={() => move(1, 0)}>↓ надолу</DiagramButton>
        <DiagramButton onClick={() => move(0, 1)}>надясно →</DiagramButton>
        <DiagramButton onClick={() => setPos({ top: HOME, left: HOME })}>в средата</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'неврон шаблон (81 тегла)', value: `${template} от 5`, tone: template === 5 ? 'emerald' : 'rose' },
            { label: 'филтър (9 тегла), най-голям изход', value: `${best.value} от 5`, tone: 'emerald' },
            { label: 'къде', value: `ред ${best.r + 1}, колона ${best.c + 1}`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={moved ? (template <= 2 ? 'rose' : 'amber') : 'gray'}>
        {moved
          ? `Кръстчето е същото, само преместено. Шаблонът, който го очаква в средата, дава ${template} вместо 5 – за него това е друга картинка. Филтърът пак намира 5, само че на друго място в картата; максимумът на картата не се е променил.`
          : 'Кръстчето е точно където го очаква шаблонът и двата начина дават 5. Премести го със стрелките или докосни картинката.'}
      </Note>
    </div>
  );
}
