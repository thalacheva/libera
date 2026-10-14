import { useState } from 'react';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 250;
const X0 = 30;
const X1 = 610;
const AXIS_Y = 120;
const YEAR = 3.156e7; // s
const LOG_MIN = 0; // 1 s
const LOG_MAX = Math.log10(14e9 * YEAR);

type Source = { name: string; seconds: number; time: string; distance: string; then: string };

/** Колко време пътува светлината от обекта и какво е ставало на Земята, когато е тръгнала (закръглено). */
const SOURCES: Source[] = [
  { name: 'Луната', seconds: 1.28, time: '1,3 s', distance: '384 400 km', then: 'Почти „сега“ – но радиосигналът до астронавтите на Луната и обратно отнема около 2,6 s.' },
  { name: 'Слънцето', seconds: 499, time: '8,3 min', distance: '1 AU = 149,6 млн. km', then: 'Ако Слънцето изчезне, ще разберем след 8 минути. Междувременно Земята изминава по орбитата си около 15 000 km.' },
  { name: 'Юпитер', seconds: 43 * 60, time: '35–52 min', distance: '4,2–6,2 AU', then: 'По закъсненията на затъмненията на спътниците на Юпитер Оле Рьомер разбира през 1676 г., че светлината има крайна скорост.' },
  { name: 'Нептун', seconds: 4.1 * 3600, time: 'около 4 h', distance: 'около 30 AU', then: 'Сигналите на „Вояджър 2“ от Нептун (1989 г.) пътуват до Земята около 4 часа.' },
  { name: 'Проксима Кентавър', seconds: 4.24 * YEAR, time: '4,2 години', distance: '4,24 светлинни години', then: 'Виждаме най-близката звезда такава, каквато е била преди около четири години.' },
  { name: 'Сириус', seconds: 8.6 * YEAR, time: '8,6 години', distance: '8,6 светлинни години', then: 'Най-ярката звезда на нощното небе. Около нея обикаля бяло джудже – Сириус B.' },
  { name: 'Полярната звезда', seconds: 430 * YEAR, time: 'около 430 години', distance: 'около 430 светлинни години (оценките се различават)', then: 'Края на XVI век – още няма телескопи: първите се появяват през 1608 г.' },
  { name: 'Мъглявината Орион', seconds: 1350 * YEAR, time: 'около 1350 години', distance: 'около 1350 светлинни години', then: 'Около края на VII век – по времето, когато е основана българската държава (681 г.).' },
  { name: 'Центърът на Млечния път', seconds: 26700 * YEAR, time: 'около 27 000 години', distance: 'около 27 000 светлинни години', then: 'Последната ледникова епоха; хората рисуват по стените на пещерите.' },
  { name: 'Галактиката Андромеда', seconds: 2.5e6 * YEAR, time: 'около 2,5 милиона години', distance: 'около 2,5 милиона светлинни години', then: 'Приблизително тогава в Африка се появяват първите представители на рода Homo.' },
  { name: 'Квазарът 3C 273', seconds: 2.0e9 * YEAR, time: 'около 2 милиарда години', distance: 'най-яркият квазар на небето', then: 'Животът на Земята е още само микроскопичен.' },
  { name: 'Реликтовото излъчване', seconds: 13.8e9 * YEAR, time: 'около 13,8 милиарда години', distance: 'най-старата светлина във Вселената', then: 'Земята и Слънцето още не съществуват – те са на около 4,6 милиарда години.' },
];

const TICKS: [number, string][] = [
  [1, '1 s'],
  [60, '1 min'],
  [3600, '1 h'],
  [86400, '1 ден'],
  [YEAR, '1 г.'],
  [100 * YEAR, '100 г.'],
  [1e4 * YEAR, '10⁴ г.'],
  [1e6 * YEAR, '10⁶ г.'],
  [1e8 * YEAR, '10⁸ г.'],
  [1e10 * YEAR, '10¹⁰ г.'],
];

const sx = (seconds: number) => X0 + ((Math.log10(seconds) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

export default function LightTravelLab() {
  const [i, setI] = useState(1);
  const s = SOURCES[i];
  const x = sx(s.seconds);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко назад във времето гледаме?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Светлината изминава 300 000 km в секунда, но и тя пътува дълго. Изберете обект: оста показва колко време е летяла
        светлината му до окото ни.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <text x={X0} y={28} fontSize="12" fill="white" fillOpacity="0.6">
          ← сега
        </text>
        <text x={X1} y={28} fontSize="12" fill="white" fillOpacity="0.6" textAnchor="end">
          Големият взрив →
        </text>
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.4" />
        {TICKS.map(([t, label]) => (
          <g key={label}>
            <line x1={sx(t)} x2={sx(t)} y1={AXIS_Y - 4} y2={AXIS_Y + 4} stroke="white" strokeOpacity="0.5" />
            <text x={sx(t)} y={AXIS_Y + 20} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {label}
            </text>
          </g>
        ))}
        {SOURCES.map((src, k) => (
          <circle
            key={src.name}
            cx={sx(src.seconds)}
            cy={AXIS_Y}
            r={k === i ? 7 : 4}
            fill={k === i ? '#fbbf24' : '#fcd34d'}
            fillOpacity={k === i ? 1 : 0.45}
            onClick={() => setI(k)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        {/* Лъч от обекта към нас */}
        <line x1={X0} x2={x} y1={AXIS_Y - 22} y2={AXIS_Y - 22} stroke="#fde68a" strokeWidth="2" strokeDasharray="6 4" />
        <path d={`M ${X0} ${AXIS_Y - 22} l 8 -4 l 0 8 z`} fill="#fde68a" />
        <text
          x={x}
          y={AXIS_Y - 32}
          fontSize="13"
          fontWeight="700"
          fill="#fde68a"
          textAnchor={x < 120 ? 'start' : x > 520 ? 'end' : 'middle'}
        >
          {s.name}
        </text>

        <g fontSize="12" fill="white" transform="translate(20, 184)">
          <text x={0} y={0} fillOpacity="0.9">
            Светлината е пътувала {s.time} · разстояние: {s.distance}
          </text>
          <text x={0} y={22} fill="#86efac">
            Виждаме обекта такъв, какъвто е бил преди {s.time}.
          </text>
        </g>
      </LabSvg>

      <label className="block text-sm font-semibold mt-4 mb-1">Обект: {s.name}</label>
      <input type="range" min={0} max={SOURCES.length - 1} step={1} value={i} onChange={e => setI(Number(e.target.value))} className="w-full" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <strong>Когато светлината е тръгнала:</strong> {s.then}
      </p>
    </div>
  );
}
