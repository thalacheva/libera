import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { type Pt, weberCost, weberOptimum } from './industryModel';

const W = 640;
const H = 330;
/** 1 единица в чертежа = 1 km; превоз 0,1 € за тон и километър. */
const RATE = 0.1;
const CELL = 10;
const BAND = 5; // € на тон между две изодапани

const NAMES = ['М₁', 'М₂', 'П', 'Р'];
const TITLES = ['суровина 1 (руда)', 'суровина 2 (въглища)', 'пазар', 'евтина работна ръка'];
const FILL = ['fill-amber-500', 'fill-stone-600', 'fill-blue-600', 'fill-violet-600'];

/** Задачата на Вебер: къде да се построи заводът, за да са най-малки разходите за превоз. */
export default function WeberLab() {
  const [pts, setPts] = useState<Pt[]>([
    { x: 120, y: 250 },
    { x: 230, y: 70 },
    { x: 500, y: 200 },
    { x: 420, y: 60 },
  ]);
  const [w1, setW1] = useState(1.4);
  const [w2, setW2] = useState(0.8);
  const [labour, setLabour] = useState(false);
  const [saving, setSaving] = useState(15);
  const [drag, setDrag] = useState<number | null>(null);

  const tri = pts.slice(0, 3);
  const w = [w1, w2, 1];
  const opt = weberOptimum(tri, w);
  const cMin = weberCost(opt, tri, w) * RATE;
  const cL = weberCost(pts[3], tri, w) * RATE;
  const extra = cL - cMin;
  const moves = labour && extra < saving;
  const mi = w1 + w2;

  const cells: { x: number; y: number; band: number; inCrit: boolean }[] = [];
  for (let y = 0; y < H; y += CELL)
    for (let x = 0; x < W; x += CELL) {
      const c = weberCost({ x: x + CELL / 2, y: y + CELL / 2 }, tri, w) * RATE;
      cells.push({ x, y, band: Math.floor((c - cMin) / BAND), inCrit: c - cMin <= saving });
    }

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag === null) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const q = { x: Math.max(12, Math.min(W - 12, p.x)), y: Math.max(12, Math.min(H - 12, p.y)) };
    setPts(prev => prev.map((v, i) => (i === drag ? q : v)));
  };

  const site = moves ? pts[3] : opt;
  const shown = labour ? pts : tri;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 rounded"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        {cells.map(c => (
          <rect
            key={`${c.x}/${c.y}`}
            x={c.x}
            y={c.y}
            width={CELL + 0.5}
            height={CELL + 0.5}
            fill={`hsl(${Math.max(0, 140 - c.band * 9)} 60% ${Math.min(92, 70 + c.band * 1.2) + (c.band % 2 ? 5 : 0)}%)`}
          />
        ))}
        {labour &&
          cells
            .filter(c => c.inCrit)
            .map(c => <rect key={`k${c.x}/${c.y}`} x={c.x} y={c.y} width={CELL} height={CELL} className="fill-violet-500/25" />)}
        {/* Пътищата от завода */}
        {tri.map((p, i) => (
          <line key={i} x1={site.x} y1={site.y} x2={p.x} y2={p.y} className="stroke-gray-700" strokeWidth={1 + 1.5 * w[i]} strokeOpacity={0.55} />
        ))}
        {shown.map((p, i) => (
          <g key={i}>
            <title>{TITLES[i]}</title>
            <circle
              cx={p.x}
              cy={p.y}
              r={13}
              className={`${FILL[i]} stroke-white cursor-grab`}
              strokeWidth="2"
              style={{ touchAction: 'none' }}
              onPointerDown={e => {
                e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
                setDrag(i);
              }}
            />
            <text x={p.x} y={p.y + 4} fontSize="11" fontWeight="bold" textAnchor="middle" className="fill-white pointer-events-none">
              {NAMES[i]}
            </text>
          </g>
        ))}
        <g className="pointer-events-none">
          <rect x={opt.x - 7} y={opt.y - 7} width={14} height={14} transform={`rotate(45 ${opt.x} ${opt.y})`} className="fill-rose-600 stroke-white" strokeWidth="2" />
          <text x={opt.x + 12} y={opt.y - 10} fontSize="11" fontWeight="bold" className="fill-rose-700" stroke="white" strokeWidth="3" paintOrder="stroke">
            min
          </text>
        </g>
        {/* Мащаб */}
        <g transform={`translate(${W - 120} ${H - 16})`}>
          <rect x={-6} y={-14} width={112} height={22} rx={4} className="fill-white/80" />
          <line x1={0} y1={0} x2={100} y2={0} className="stroke-gray-800" strokeWidth="3" />
          <text x={50} y={-4} fontSize="10" textAnchor="middle" className="fill-gray-800">
            100 km
          </text>
        </g>
      </LabSvg>
      <Buttons>
        <DiagramButton active={!labour} onClick={() => setLabour(false)}>
          Само транспорт
        </DiagramButton>
        <DiagramButton active={labour} onClick={() => setLabour(true)}>
          + евтина работна ръка
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="М₁, t" value={w1} onChange={setW1} min={0} max={4} step={0.1} tone="amber" />
        <Slider label="М₂, t" value={w2} onChange={setW2} min={0} max={4} step={0.1} tone="gray" />
        {labour && <Slider label="труд, €" value={saving} onChange={setSaving} min={0} max={40} step={1} tone="violet" />}
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Влачи кръгчетата. М₁, М₂ – находищата на две суровини (например руда и въглища); плъзгачите задават колко тона от всяка отиват за 1 t продукт; продуктът (1 t) се превозва до пазара П. Превозът струва 0,1 € за тон и
        километър. Ивиците са изодапани – през 5 € на тон. „труд“ – колко евро на тон продукт спестява по-евтината работна ръка в Р.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'материален индекс', value: fmt(mi, 1), tone: 'amber' },
            { label: 'превоз в min', value: `${fmt(cMin, 1)} €/t`, tone: 'rose' },
            ...(labour
              ? [
                  { label: 'превоз от Р', value: `${fmt(cL, 1)} €/t`, tone: 'violet' as const },
                  { label: 'допълнително', value: `${fmt(extra, 1)} €/t`, tone: 'gray' as const },
                ]
              : [{ label: 'до пазара', value: `${fmt(Math.hypot(opt.x - pts[2].x, opt.y - pts[2].y))} km`, tone: 'blue' as const }]),
          ]}
        />
      </div>
      <Note tone={labour ? 'violet' : 'blue'}>
        {labour
          ? moves
            ? `Р е вътре в критичната изодапана: по-скъпият превоз (+${fmt(extra, 1)} €/t) се покрива от спестения труд (${fmt(saving)} €/t) – заводът отива в Р.`
            : `Р е извън критичната изодапана: превозът оттам струва ${fmt(extra, 1)} €/t повече, а трудът спестява само ${fmt(saving)} €/t – заводът остава в min.`
          : mi > 1.05
            ? `Материалният индекс е ${fmt(mi, 1)} > 1: суровините са по-тежки от продукта и заводът се дърпа към тях.`
            : mi < 0.95
              ? `Материалният индекс е ${fmt(mi, 1)} < 1: продуктът е по-тежък от суровините, които се превозват – заводът се дърпа към пазара.`
              : 'Материалният индекс е около 1 – суровините и пазарът „дърпат“ почти еднакво.'}
      </Note>
    </div>
  );
}
