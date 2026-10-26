import { useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 260;
const SUN_ANGLE = 0.533 * (Math.PI / 180); // ъгловият диаметър на Слънцето, rad
const WAVELENGTH = 550e-6; // mm – зелена светлина
const IMAGE_PX = 120; // образът на екрана се рисува винаги с този диаметър; мащабът е отдолу

const PRESETS = [
  { name: 'Картон с игла', distance: 2, hole: 1.5 },
  { name: 'Дупка с молив', distance: 1, hole: 8 },
  { name: 'Пролука в листата', distance: 6, hole: 20 },
];

export default function PinholeLab() {
  const [distance, setDistance] = useState(2); // m
  const [hole, setHole] = useState(1.5); // mm
  const [phase, setPhase] = useState(0.6);

  const image = distance * 1000 * SUN_ANGLE; // диаметър на образа, mm
  const diffraction = (2.44 * WAVELENGTH * distance * 1000) / hole; // mm
  const blur = hole + diffraction; // колко се размазва всяка точка, mm
  const best = 1.9 * Math.sqrt(distance * 1000 * WAVELENGTH); // най-острата дупка (Рейли), mm
  const ratio = blur / image;
  const sigma = (ratio * IMAGE_PX) / 4; // петно с диаметър b ≈ гаусово размазване с σ ≈ b/4
  const verdict =
    ratio < 0.25
      ? 'Ясен сърп'
      : ratio < 0.6
        ? 'Сърпът се познава, но е размазан'
        : 'Петно – сърпът не се вижда';

  // Схемата: Слънцето вляво, картонът с дупката и екранът на разстояние ∝ L
  const cardX = 150;
  const screenX = cardX + 40 + Math.min(distance, 8) * 22;
  const imgHalf = 6 + Math.min(distance, 8) * 2.2;
  // Сърпът: Луната закрива част от Слънцето; на екрана образът е обърнат
  const R = IMAGE_PX / 2;
  const d = 2 * R * (1 - phase);
  const scale10mm = (IMAGE_PX / image) * 10;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Камера обскура</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Светлината минава през малка дупка и рисува образа на Слънцето върху
        лист. Колко далеч трябва да е листът и колко голяма дупката, за да се
        види сърпът при затъмнение?
      </p>

      <LabSvg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-lg bg-slate-950 select-none"
      >
        <defs>
          <filter
            id="pinhole-blur"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation={sigma} />
          </filter>
          <clipPath id="pinhole-sheet">
            <rect x={420} y={20} width={180} height={196} rx={6} />
          </clipPath>
          <clipPath id="pinhole-sun">
            <circle cx={510} cy={118} r={R} />
          </clipPath>
        </defs>

        {/* Схема */}
        <circle cx={40} cy={118} r={22} fill="#fcd34d" />
        {/* Лъчите от горния и долния край на Слънцето се пресичат в дупката – образът е обърнат */}
        <polyline
          points={`58,104 ${cardX},118 ${screenX},${118 + imgHalf}`}
          fill="none"
          stroke="#fde68a"
          strokeOpacity="0.5"
        />
        <polyline
          points={`58,132 ${cardX},118 ${screenX},${118 - imgHalf}`}
          fill="none"
          stroke="#fde68a"
          strokeOpacity="0.5"
        />
        <line
          x1={cardX}
          x2={cardX}
          y1={50}
          y2={115}
          stroke="#a8a29e"
          strokeWidth="5"
        />
        <line
          x1={cardX}
          x2={cardX}
          y1={121}
          y2={186}
          stroke="#a8a29e"
          strokeWidth="5"
        />
        <text
          x={cardX}
          y={42}
          fontSize="10"
          textAnchor="middle"
          fill="white"
          fillOpacity="0.7"
        >
          картон
        </text>
        <line
          x1={screenX}
          x2={screenX}
          y1={60}
          y2={176}
          stroke="white"
          strokeWidth="3"
        />
        <line
          x1={screenX + 4}
          x2={screenX + 4}
          y1={118 - imgHalf}
          y2={118 + imgHalf}
          stroke="#fcd34d"
          strokeWidth="3"
        />
        <text
          x={screenX}
          y={52}
          fontSize="10"
          textAnchor="middle"
          fill="white"
          fillOpacity="0.7"
        >
          лист
        </text>
        <line
          x1={cardX}
          x2={screenX}
          y1={204}
          y2={204}
          stroke="white"
          strokeOpacity="0.5"
        />
        <text
          x={(cardX + screenX) / 2}
          y={220}
          fontSize="11"
          textAnchor="middle"
          fill="white"
          fillOpacity="0.8"
        >
          L = {fmt(distance, 1)} m
        </text>

        {/* Какво се вижда на листа */}
        <rect x={420} y={20} width={180} height={196} rx={6} fill="#f5f5f4" />
        <g clipPath="url(#pinhole-sheet)">
          <g filter="url(#pinhole-blur)">
            <circle cx={510} cy={118} r={R} fill="#f59e0b" />
            {/* Образът е обърнат: Луната „хапе“ от обратната страна */}
            <circle
              cx={510 + d * 0.8}
              cy={118 + d * 0.6}
              r={R}
              fill="#f5f5f4"
              clipPath="url(#pinhole-sun)"
            />
          </g>
        </g>
        {scale10mm > 6 && scale10mm < 170 && (
          <g>
            <line
              x1={430}
              x2={430 + scale10mm}
              y1={206}
              y2={206}
              stroke="#44403c"
              strokeWidth="2"
            />
            <text x={430} y={200} fontSize="9" fill="#44403c">
              1 cm
            </text>
          </g>
        )}
        <text x={430} y={34} fontSize="9" fill="#44403c">
          листът отблизо
        </text>

        {/* Числата */}
        <g fontSize="11" fill="white" transform="translate(20, 238)">
          <text x={0} y={0} fillOpacity="0.85">
            образ: L / 107 = {fmt(image, 1)} mm · размазване: {fmt(blur, 1)} mm
            ·{' '}
            <tspan
              fill={
                ratio < 0.25 ? '#86efac' : ratio < 0.6 ? '#fde68a' : '#fca5a5'
              }
            >
              {verdict}
            </tspan>
          </text>
        </g>
      </LabSvg>

      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Разстояние до листа L = {fmt(distance, 1)} m
          </label>
          <input
            type="range"
            min={0.2}
            max={8}
            step={0.1}
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Диаметър на дупката: {fmt(hole, 1)} mm
          </label>
          <input
            type="range"
            min={0.3}
            max={30}
            step={0.1}
            value={hole}
            onChange={e => setHole(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Фаза на затъмнението: {Math.round(phase * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.01}
            value={phase}
            onChange={e => setPhase(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setDistance(p.distance);
              setHole(p.hole);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              p.distance === distance && p.hole === hole
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Образът е толкова по-голям, колкото по-далеч е листът: Слънцето се вижда
        под ъгъл 0,53°, затова диаметърът на образа е около 1/107 от
        разстоянието. Всяка точка обаче се размазва поне колкото дупката –
        затова при голяма дупка сърпът се губи. Твърде малката дупка също
        размазва заради дифракцията. Най-остър е образът при дупка около{' '}
        {fmt(best, 1)} mm за L = {fmt(distance, 1)} m. Под дърветата пролуките
        са големи, но и разстоянието до земята е няколко метра – затова там
        сърпчетата се виждат.
      </p>
    </div>
  );
}
