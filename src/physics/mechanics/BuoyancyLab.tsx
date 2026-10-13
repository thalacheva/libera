import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow } from '../SimControls';
import { fmtNum } from '../sim';

const G = 9.8;
const SIDE = 0.1; // кубче с ръб 10 cm
const AREA = SIDE * SIDE;
const PX = 8; // пиксела на сантиметър

// Плътности в kg/m³ (приблизителни, при стайна температура)
const MATERIALS = [
  { name: 'корк', rho: 240, fill: 'fill-amber-300' },
  { name: 'дърво (бор)', rho: 500, fill: 'fill-amber-600' },
  { name: 'лед', rho: 917, fill: 'fill-sky-200' },
  { name: 'PVC', rho: 1400, fill: 'fill-gray-300' },
  { name: 'алуминий', rho: 2700, fill: 'fill-slate-400' },
  { name: 'желязо', rho: 7870, fill: 'fill-slate-600' },
];
const LIQUIDS = [
  { name: 'прясна вода', rho: 1000, fill: 'fill-sky-400/40' },
  { name: 'морска вода', rho: 1025, fill: 'fill-cyan-500/40' },
  { name: 'олио', rho: 920, fill: 'fill-amber-300/50' },
  { name: 'живак', rho: 13600, fill: 'fill-gray-400/70' },
];

const SURFACE = 130;
const BOTTOM = 262;

/** Кубче на динамометър се спуска в течност: динамометърът показва теглото минус Архимедовата сила. */
export default function BuoyancyLab() {
  const [mi, setMi] = useState(4);
  const [li, setLi] = useState(0);
  const [depth, setDepth] = useState(4);
  const mat = MATERIALS[mi];
  const liq = LIQUIDS[li];

  const weight = mat.rho * SIDE ** 3 * G;
  const floats = mat.rho < liq.rho;
  // Дълбочина на потъване при плаване (в cm)
  const floatDepth = (SIDE * 100 * mat.rho) / liq.rho;
  // Колко от кубчето е потопено: колкото го спуснем, но плаващото не потъва повече от floatDepth
  const sub = Math.min(depth, 10, floats ? floatDepth : Infinity);
  const buoy = liq.rho * G * AREA * (sub / 100);
  const scale = Math.max(0, weight - buoy);
  const slack = floats && depth >= floatDepth;

  const bottomY = SURFACE + sub * PX + Math.max(0, depth - 10) * PX * (floats ? 0 : 1);
  const topY = bottomY - 10 * PX;
  const cx = 240;
  const hookY = 20;

  // Дължините на стрелките – общ мащаб, но не повече от 70 px
  const k = Math.min(70 / Math.max(weight, buoy, 1), 4);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MATERIALS.map((m, i) => (
          <DiagramButton key={m.name} active={i === mi} onClick={() => setMi(i)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {LIQUIDS.map((l, i) => (
          <DiagramButton key={l.name} active={i === li} onClick={() => setLi(i)}>
            {l.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        {/* Съдът с течността */}
        <rect x={120} y={SURFACE} width={240} height={BOTTOM - SURFACE} className={liq.fill} />
        <polyline points={`120,${SURFACE - 30} 120,${BOTTOM} 360,${BOTTOM} 360,${SURFACE - 30}`} fill="none" className="stroke-gray-500" strokeWidth="3" />
        <line x1={120} y1={SURFACE} x2={360} y2={SURFACE} className="stroke-sky-600" strokeWidth="1.5" />

        {/* Динамометър */}
        <rect x={cx - 18} y={hookY - 14} width={36} height={22} rx={4} className="fill-gray-700" />
        <text x={cx} y={hookY - 3} fontSize={11} textAnchor="middle" dominantBaseline="central" className="fill-white" fontFamily="ui-monospace, monospace">
          {fmtNum(scale, 1)}
        </text>
        <line x1={cx} y1={hookY + 8} x2={cx} y2={topY} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" strokeDasharray={slack ? '3 3' : undefined} />

        {/* Кубчето */}
        <rect x={cx - 5 * PX} y={topY} width={10 * PX} height={10 * PX} className={`${mat.fill} stroke-gray-700`} strokeWidth="1.5" />
        <Arrow from={{ x: cx - 18, y: topY + 5 * PX }} to={{ x: cx - 18, y: topY + 5 * PX + weight * k }} tone="gray" label="mg" />
        {buoy > 0 && <Arrow from={{ x: cx + 18, y: bottomY }} to={{ x: cx + 18, y: bottomY - buoy * k }} tone="blue" label="Fₐ" />}

        <Label p={{ x: 380, y: SURFACE + 14 }} size={11} anchor="start">
          {`ρ = ${liq.rho} kg/m³`}
        </Label>
        <Label p={{ x: 8, y: 40 }} size={11} anchor="start">
          {`${mat.name}: ${mat.rho} kg/m³`}
        </Label>
        <Label p={{ x: 8, y: 58 }} size={11} anchor="start">
          ръб 10 cm
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="↓, cm" value={depth} onChange={setDepth} min={0} max={14} step={0.5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'тегло', value: `${fmtNum(weight, 2)} N` },
            { label: 'Fₐ =', value: `${fmtNum(buoy, 2)} N`, tone: 'blue' },
            { label: 'динамометър', value: `${fmtNum(scale, 2)} N`, tone: 'amber' },
            { label: 'потопено', value: `${fmtNum((sub / 10) * 100, 0)}%` },
          ]}
        />
      </div>
      <Note tone={floats ? 'emerald' : 'rose'}>
        {floats
          ? `Кубчето плава: потъва на ${fmtNum(floatDepth, 1)} cm, т.е. ${fmtNum((mat.rho / liq.rho) * 100, 1)}% от обема му е в течността.`
          : `Кубчето потъва: плътността му е по-голяма. Напълно потопено „олеква“ с ${fmtNum(liq.rho * G * SIDE ** 3, 2)} N.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Спускай кубчето с плъзгача. Архимедовата сила (синята стрелка) е равна на теглото на изместената течност и расте, докато кубчето
        потъва. Когато стигне теглото, динамометърът показва 0 и нишката се отпуска – тялото плава. Пробвай желязо в живак и лед в олио.
      </p>
    </div>
  );
}
