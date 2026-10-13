import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const AREA = 10; // m²
const PRICE = 0.14; // € за kWh – примерна цена
const R_SURFACE = 0.17; // въздушните слоеве от двете страни на стената, m²·K/W
const K_WOOL = 0.04; // минерална вата, W/(m·K)

// Топлопроводност k в W/(m·K) – типични стойности; при прозорците е дадено направо U
const WALLS = [
  { name: 'тухла', k: 0.7, fill: 'fill-orange-300' },
  { name: 'бетон', k: 1.7, fill: 'fill-gray-300' },
  { name: 'дърво', k: 0.13, fill: 'fill-amber-200' },
  { name: 'единичен прозорец', U: 5.8, fill: 'fill-sky-200' },
  { name: 'стъклопакет', U: 2.8, fill: 'fill-sky-100' },
];

/** Топлинни загуби през стена: q = S·Δt / R, където съпротивленията на слоевете се събират. */
export default function InsulationLab() {
  const [w, setW] = useState(0);
  const [d, setD] = useState(25);
  const [ins, setIns] = useState(0);
  const [out, setOut] = useState(0);
  const wall = WALLS[w];
  const inside = 20;
  const dt = inside - out;
  const isWindow = wall.U !== undefined;

  const resistance = (wool: number) => (isWindow ? 1 / (wall.U as number) : R_SURFACE + d / 100 / (wall.k as number)) + wool / 100 / K_WOOL;
  const q = (AREA * dt) / resistance(ins);
  const qBare = (AREA * dt) / resistance(0);
  const kwh = (q * 24 * 30) / 1000;
  const cost = kwh * PRICE;

  // Рисунка: стена с изолация, стрелки с дебелина според потока
  const wallW = isWindow ? 14 : 30 + d * 2.2;
  const insW = ins * 4;
  const x0 = 240 - (wallW + insW) / 2;
  // Броят стрелки расте с потока (по една на около 60 W)
  const arrows = q > 0 ? Math.max(1, Math.min(7, Math.round(q / 60))) : 0;
  const arrowY = (i: number) => (arrows === 1 ? 95 : 40 + (i * 110) / (arrows - 1));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {WALLS.map((x, i) => (
          <DiagramButton key={x.name} active={i === w} onClick={() => setW(i)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 200">
        <rect x={0} y={20} width={x0} height={150} className="fill-rose-50 dark:fill-rose-950/30" />
        <rect x={x0 + wallW + insW} y={20} width={480 - x0 - wallW - insW} height={150} className="fill-sky-50 dark:fill-sky-950/30" />
        <rect x={x0} y={20} width={wallW} height={150} className={`${wall.fill} stroke-gray-500`} />
        {insW > 0 && <rect x={x0 + wallW} y={20} width={insW} height={150} className="fill-yellow-100 stroke-yellow-500" strokeDasharray="3 2" />}
        {Array.from({ length: arrows }, (_, i) => (
          <g key={i}>
            <line x1={20} y1={arrowY(i)} x2={452} y2={arrowY(i)} className="stroke-rose-500" strokeWidth={2.5} opacity={0.75} />
            <polygon points={`462,${arrowY(i)} 450,${arrowY(i) - 6} 450,${arrowY(i) + 6}`} className="fill-rose-500" opacity={0.75} />
          </g>
        ))}
        <Label p={{ x: x0 / 2, y: 186 }} size={12} tone="rose">
          {`вътре ${inside} °C`}
        </Label>
        <Label p={{ x: (480 + x0 + wallW + insW) / 2, y: 186 }} size={12} tone="blue">
          {`навън ${String(out).replace('-', '−')} °C`}
        </Label>
        <Label p={{ x: 240, y: 10 }} size={12}>
          {`${fmtNum(Math.max(0, q), 0)} W през ${AREA} m²`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        {!isWindow && <Slider label="d, cm" value={d} onChange={setD} min={5} max={50} step={1} tone="amber" />}
        <Slider label="вата cm" value={ins} onChange={setIns} min={0} max={20} step={1} tone="emerald" />
        <Slider label="tₙ, °C" value={out} onChange={setOut} min={-15} max={20} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'U =', value: `${fmtNum(1 / resistance(ins), 2)} W/(m²·K)` },
            { label: 'загуби', value: `${fmtNum(Math.max(0, q), 0)} W`, tone: 'rose' },
            { label: 'за 30 дни', value: `${fmtNum(Math.max(0, kwh), 0)} kWh` },
            { label: 'цена', value: `${fmtNum(Math.max(0, cost), 2)} €`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={ins > 0 ? 'emerald' : 'gray'}>
        {dt <= 0
          ? 'Навън е колкото вътре или по-топло – топлина не излиза.'
          : ins > 0
            ? `Изолацията намалява загубите ${fmtNum(qBare / q, 1)} пъти: от ${fmtNum(qBare, 0)} W на ${fmtNum(q, 0)} W.`
            : 'Добави изолация и виж колко пада сметката.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Съпротивленията на слоевете се събират: R = d₁/k₁ + d₂/k₂ + …, а загубите са S·Δt/R. Включени са и тънките въздушни слоеве от двете
        страни на стената (около 0,17 m²·K/W общо) – без тях единичното стъкло би изглеждало почти без съпротивление. Стойностите на k, U и
        цената 0,14 €/kWh са примерни; приемаме, че температурата навън е постоянна 30 дни.
      </p>
    </div>
  );
}
