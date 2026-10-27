import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

type Shape = 'even' | 'concave' | 'convex';
const SHAPES: { id: Shape; name: string; gaps: number[] }[] = [
  // Разстоянията между хоризонталите на картата, отдолу нагоре по склона
  { id: 'even', name: 'равен склон', gaps: [1, 1, 1, 1] },
  { id: 'concave', name: 'вдлъбнат склон', gaps: [1.7, 1.1, 0.7, 0.5] },
  { id: 'convex', name: 'изпъкнал склон', gaps: [0.5, 0.7, 1.1, 1.7] },
];
const SCALES = [10_000, 25_000, 50_000];
const INTERVALS = [10, 20, 50];

const degOf = (slope: number) => (Math.atan(slope) * 180) / Math.PI;

function compare(angle: number) {
  if (angle < 3) return 'почти равно – като поле или тераса на река';
  if (angle < 7) return 'наклон на стръмна улица или планински път (до около 10–12%)';
  if (angle < 20) return 'стръмна пътека – изкачва се бавно, със серпентини';
  if (angle < 30) return 'много стръмно – като стълбище за пешеходци се изкачва трудно';
  if (angle < 45) return 'опасно стръмно; на такива заснежени склонове най-често падат лавини';
  return 'скален отвес – само с алпинистка екипировка';
}

/** Наклонът на склона по разстоянието между хоризонталите. */
export default function SlopeLab() {
  const [mm, setMm] = useState(8);
  const [n, setN] = useState(25_000);
  const [dh, setDh] = useState(20);
  const [shape, setShape] = useState<Shape>('even');
  const gaps = SHAPES.find(s => s.id === shape)!.gaps;

  // Средното разстояние е mm; при вдлъбнат и изпъкнал склон отделните разстояния се различават
  const gapMm = gaps.map(g => g * mm);
  const gapM = gapMm.map(g => (g * n) / 1000);
  const slopes = gapM.map(d => dh / d);
  const avg = (dh * 4) / gapM.reduce((s, d) => s + d, 0);
  const angle = degOf(avg);

  // Картата: ивица с 5 хоризонтали; 1 mm от картата е 6 единици, а при много раздалечени – смаляваме, за да се събере
  const totalMm = gapMm.reduce((s, g) => s + g, 0);
  const u = Math.min(6, 270 / totalMm);
  let acc = 0;
  const mx = [0, ...gapMm].map(g => 25 + (acc += g) * u);

  // Разрезът в истински пропорции (без преувеличение)
  const totalM = gapM.reduce((s, d) => s + d, 0);
  const sx = Math.min(250 / totalM, 160 / (4 * dh));
  let cx = 0;
  const prof = [{ x: 0, h: 0 }, ...gapM.map((d, i) => ({ x: (cx += d), h: (i + 1) * dh }))];
  const PX = 360;
  const PB = 230;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 260" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={155} y={22} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          картата 1 : {n.toLocaleString('bg-BG')}
        </text>
        <rect x={10} y={34} width={300} height={190} rx={4} className="fill-amber-50 stroke-gray-300 dark:fill-gray-900 dark:stroke-gray-600" />
        {mx.map((x, i) => (
          <g key={i}>
            <path d={`M${x} 44 C${x + 10} 90 ${x - 10} 160 ${x} 214`} fill="none" className="stroke-amber-800 dark:stroke-amber-300" strokeWidth={1.4} />
            <text x={x + 3} y={130} fontSize="10" className="fill-amber-900 dark:fill-amber-200" transform={`rotate(-90 ${x + 3} 130)`} textAnchor="middle">
              {(i * dh).toString()}
            </text>
          </g>
        ))}
        {mx.slice(1).map((x, i) => (
          <text key={i} x={(x + mx[i]) / 2} y={238} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {fmt(gapMm[i], 1)}
          </text>
        ))}
        <text x={155} y={252} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          разстояния между хоризонталите, mm
        </text>

        {/* Разрез */}
        <text x={PX + 125} y={22} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          разрез в истински пропорции
        </text>
        <path
          d={prof.map((p, i) => `${i ? 'L' : 'M'}${(PX + p.x * sx).toFixed(1)} ${(PB - p.h * sx).toFixed(1)}`).join('') + `L${PX + totalM * sx} ${PB}Z`}
          className="fill-amber-200 stroke-amber-800 dark:fill-amber-900/60 dark:stroke-amber-300"
          strokeWidth="1.5"
        />
        <line x1={PX} y1={PB} x2={PX + totalM * sx} y2={PB - 4 * dh * sx} className="stroke-fuchsia-600" strokeWidth="1.2" strokeDasharray="4 3" />
        <path d={`M${PX + 30} ${PB} A30 30 0 0 0 ${PX + 30 * Math.cos(Math.atan(avg))} ${PB - 30 * Math.sin(Math.atan(avg))}`} fill="none" className="stroke-fuchsia-600" strokeWidth="1.5" />
        <text x={PX + 36} y={PB - 6} fontSize="12" className="fill-fuchsia-700 dark:fill-fuchsia-300">
          {fmt(angle, 1)}°
        </text>
        <line x1={PX} y1={PB} x2={PX + 270} y2={PB} className="stroke-gray-500" />
        <text x={PX + 130} y={PB + 16} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {fmt(totalM)} m по хоризонтала, {4 * dh} m денивелация
        </text>
      </LabSvg>

      <Buttons>
        {SHAPES.map(s => (
          <DiagramButton key={s.id} active={shape === s.id} onClick={() => setShape(s.id)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {SCALES.map(s => (
          <DiagramButton key={s} active={n === s} onClick={() => setN(s)}>
            1 : {s.toLocaleString('bg-BG')}
          </DiagramButton>
        ))}
        {INTERVALS.map(s => (
          <DiagramButton key={s} active={dh === s} onClick={() => setDh(s)}>
            през {s} m
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="mm" value={mm} onChange={setMm} min={1} max={20} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'среден наклон', value: `${fmt(avg * 100)}% = ${fmt(angle, 1)}°`, tone: 'rose' },
            { label: 'по участъци (отдолу)', value: slopes.map(s => `${fmt(degOf(s))}°`).join(' · ') },
          ]}
        />
      </div>
      <Note tone="blue">{compare(angle)}</Note>
    </div>
  );
}
