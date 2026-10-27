import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const COLS = 48;
const ROWS = 30;
const CELL = 10;
const X0 = 8;
const Y0 = 6;

type Season = 'spring' | 'summer' | 'autumn';
type Mode = 'natural' | 'false' | 'ndvi';
type Cover = 'water' | 'forest' | 'wheat' | 'maize' | 'sunflower' | 'soil' | 'town' | 'burnt';

const NAMES: Record<Cover, string> = {
  water: 'вода',
  forest: 'широколистна гора',
  wheat: 'пшеница',
  maize: 'царевица',
  sunflower: 'слънчоглед',
  soil: 'гола почва',
  town: 'град',
  burnt: 'опожарена гора',
};

/** Отразяване [синьо, зелено, червено, близко инфрачервено] – приблизителни стойности за всеки сезон. */
const SOIL = [0.08, 0.11, 0.15, 0.22];
const DRY = [0.08, 0.11, 0.14, 0.27];
const GREEN = (nir: number) => [0.03, 0.08, 0.04, nir];
const REFL: Record<Cover, Record<Season, number[]>> = {
  water: { spring: [0.07, 0.06, 0.04, 0.02], summer: [0.06, 0.06, 0.03, 0.01], autumn: [0.06, 0.05, 0.03, 0.01] },
  forest: { spring: [0.03, 0.08, 0.04, 0.38], summer: [0.03, 0.06, 0.03, 0.42], autumn: [0.04, 0.07, 0.08, 0.28] },
  // Есенницата пшеница е зелена напролет и е ожъната в началото на лятото
  wheat: { spring: GREEN(0.45), summer: [0.1, 0.14, 0.18, 0.28], autumn: SOIL },
  // Царевицата и слънчогледът се сеят през пролетта и зреят до есента
  maize: { spring: SOIL, summer: GREEN(0.5), autumn: DRY },
  sunflower: { spring: SOIL, summer: [0.04, 0.09, 0.05, 0.47], autumn: DRY },
  soil: { spring: SOIL, summer: SOIL, autumn: SOIL },
  town: { spring: [0.12, 0.13, 0.15, 0.19], summer: [0.12, 0.13, 0.15, 0.2], autumn: [0.12, 0.13, 0.15, 0.19] },
  burnt: { spring: [0.04, 0.04, 0.05, 0.08], summer: [0.04, 0.04, 0.05, 0.08], autumn: [0.04, 0.04, 0.05, 0.08] },
};

const hash = (i: number, j: number) => {
  const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Измислена сцена: река, езеро, гора, град и ниви. */
function coverAt(i: number, j: number, fire: boolean): Cover {
  const x = (i + 0.5) / COLS;
  const y = (j + 0.5) / ROWS;
  if (Math.abs(y - (0.62 + 0.08 * Math.sin(6 * x))) < 0.035) return 'water';
  if (((x - 0.82) / 0.1) ** 2 + ((y - 0.25) / 0.14) ** 2 < 1) return 'water';
  if (x > 0.22 && x < 0.42 && y > 0.72 && y < 0.95) return hash(i, j) < 0.15 ? 'forest' : 'town';
  if (y < 0.42 && x < 0.66 && y < 0.5 - 0.35 * x + 0.12 * hash(i, j)) {
    if (fire && ((x - 0.3) / 0.12) ** 2 + ((y - 0.18) / 0.12) ** 2 < 1) return 'burnt';
    return 'forest';
  }
  // Ниви – парцели 6 × 5 клетки с различни култури
  const crops: Cover[] = ['wheat', 'maize', 'sunflower', 'wheat', 'soil', 'maize'];
  return crops[Math.floor(hash(Math.floor(i / 6), Math.floor(j / 5) + 17) * crops.length)];
}

const ndviOf = (r: number[]) => (r[3] - r[2]) / (r[3] + r[2]);
const toByte = (v: number) => Math.max(0, Math.min(255, Math.round(255 * Math.pow(Math.min(1, v * 4.5), 0.65))));

/** Цвят за NDVI: вода синьо, гола земя кафяво, растителност – все по-тъмно зелено. */
function ndviColor(v: number) {
  if (v < 0) return 'rgb(60,110,190)';
  const stops: [number, number[]][] = [
    [0, [150, 110, 80]],
    [0.25, [220, 200, 120]],
    [0.5, [140, 190, 80]],
    [0.8, [20, 110, 40]],
  ];
  let k = 1;
  while (k < stops.length - 1 && v > stops[k][0]) k++;
  const [a, ca] = stops[k - 1];
  const [b, cb] = stops[k];
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  const c = ca.map((x, i) => Math.round(x + t * (cb[i] - x)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function colorOf(r: number[], mode: Mode) {
  if (mode === 'ndvi') return ndviColor(ndviOf(r));
  const [bl, g, rd, nir] = r;
  const [R, G, B] = mode === 'natural' ? [rd, g, bl] : [nir * 0.55, rd, g];
  return `rgb(${toByte(R)},${toByte(G)},${toByte(B)})`;
}

/** Сателитна снимка в естествени цветове, във фалшиви цветове и като NDVI. */
export default function NdviLab() {
  const [season, setSeason] = useState<Season>('summer');
  const [mode, setMode] = useState<Mode>('natural');
  const [fire, setFire] = useState(false);
  const [pick, setPick] = useState<{ i: number; j: number }>({ i: 14, j: 8 });

  const cells = useMemo(
    () => Array.from({ length: COLS * ROWS }, (_, c) => ({ i: c % COLS, j: Math.floor(c / COLS), cover: coverAt(c % COLS, Math.floor(c / COLS), fire) })),
    [fire],
  );
  const refl = (cover: Cover) => REFL[cover][season];
  const veg = cells.filter(c => ndviOf(refl(c.cover)) > 0.5).length / cells.length;
  const picked = coverAt(pick.i, pick.j, fire);
  const pr = refl(picked);

  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const i = Math.floor((p.x - X0) / CELL);
    const j = Math.floor((p.y - Y0) / CELL);
    if (i >= 0 && i < COLS && j >= 0 && j < ROWS) setPick({ i, j });
  };

  const legend =
    mode === 'ndvi'
      ? [-0.3, 0, 0.2, 0.4, 0.6, 0.8].map(v => ({ color: ndviColor(v), label: fmt(v, 1) }))
      : (['water', 'forest', 'wheat', 'maize', 'soil', 'town'] as Cover[]).map(c => ({ color: colorOf(refl(c), mode), label: NAMES[c] }));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 312" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 cursor-crosshair" onClick={click}>
        {cells.map(c => (
          <rect key={`${c.i}/${c.j}`} x={X0 + c.i * CELL} y={Y0 + c.j * CELL} width={CELL + 0.4} height={CELL + 0.4} fill={colorOf(refl(c.cover), mode)} />
        ))}
        <rect x={X0 + pick.i * CELL} y={Y0 + pick.j * CELL} width={CELL} height={CELL} fill="none" className="stroke-fuchsia-500" strokeWidth="2.5" />
        <text x={500} y={20} fontSize="12" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">
          {mode === 'ndvi' ? 'NDVI' : mode === 'natural' ? 'естествени цветове' : 'NIR → червено'}
        </text>
        {legend.map((l, k) => (
          <g key={l.label} transform={`translate(500 ${34 + k * 20})`}>
            <rect x={0} y={0} width={16} height={14} fill={l.color} className="stroke-gray-400" strokeWidth="0.5" />
            <text x={22} y={11} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
              {l.label}
            </text>
          </g>
        ))}
        {/* Спектърът на избрания пиксел */}
        <text x={500} y={166} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          <tspan x={500}>пиксел:</tspan>
          <tspan x={500} dy="14" fontWeight="bold">
            {NAMES[picked]}
          </tspan>
        </text>
        {['С', 'З', 'Ч', 'БИЧ'].map((b, k) => (
          <g key={b}>
            <rect x={506 + k * 30} y={292 - pr[k] * 200} width={20} height={pr[k] * 200} className={['fill-blue-500', 'fill-green-500', 'fill-red-500', 'fill-rose-900 dark:fill-rose-300'][k]} />
            <text x={516 + k * 30} y={306} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {b}
            </text>
          </g>
        ))}
        <line x1={500} y1={292} x2={626} y2={292} className="stroke-gray-500" />
        <line x1={500} y1={192} x2={500} y2={292} className="stroke-gray-400" />
        <text x={503} y={200} fontSize="9" className="fill-gray-500">
          50%
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Щракни върху пиксел. С – синьо, З – зелено, Ч – червено, БИЧ – близко инфрачервено.</p>
      <Buttons>
        {(
          [
            ['natural', 'Естествени цветове'],
            ['false', 'Фалшиви цветове'],
            ['ndvi', 'NDVI'],
          ] as [Mode, string][]
        ).map(([id, name]) => (
          <DiagramButton key={id} active={mode === id} onClick={() => setMode(id)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {(
          [
            ['spring', 'април'],
            ['summer', 'юли'],
            ['autumn', 'октомври'],
          ] as [Season, string][]
        ).map(([id, name]) => (
          <DiagramButton key={id} active={season === id} onClick={() => setSeason(id)}>
            {name}
          </DiagramButton>
        ))}
        <DiagramButton active={fire} onClick={() => setFire(!fire)}>
          🔥 Горски пожар
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'червено', value: fmt(pr[2], 2) },
            { label: 'инфрачервено', value: fmt(pr[3], 2) },
            { label: 'NDVI', value: fmt(ndviOf(pr), 2), tone: 'emerald' },
            { label: 'NDVI > 0,5', value: `${fmt(veg * 100)}% от снимката`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
}
