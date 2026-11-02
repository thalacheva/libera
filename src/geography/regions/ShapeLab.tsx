import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { STATE_SHAPES, type StateShape } from './stateShapes';

const TYPE: Record<StateShape['type'], string> = {
  compact: 'компактна',
  elongated: 'издължена',
  prorupted: 'с издатък',
  fragmented: 'разпокъсана',
  perforated: 'перфорирана',
};

const ABOUT: Record<string, string> = {
  Полша: 'Почти кръгла: столицата е близо до средата и до всяка граница се стига бързо.',
  България: 'Близо до компактна форма – около 500 km от запад на изток и около 300 km от север на юг.',
  Лесото: 'Малка и много компактна – но изцяло обградена от ЮАР (анклав).',
  Чили: 'Около 4300 km дълга и средно под 200 km широка; брегът с фиордите прави границата много дълга.',
  Италия: 'Издължен полуостров с два големи острова – Сицилия и Сардиния.',
  Виетнам: 'Тясна ивица по брега – на места под 50 km широка.',
  Гамбия: 'Ивица от двете страни на река Гамбия, обградена от Сенегал навсякъде освен на брега.',
  Тайланд: 'Компактно ядро с дълъг издатък на юг по Малайския полуостров.',
  Намибия: 'Ивицата Каприви на североизток – издатък, начертан през 1890 г., за да стигне до река Замбези.',
  Индонезия: 'Над 17 000 острова; от единия до другия край – над 5000 km.',
  Филипини: 'Над 7600 острова – връзките между тях са по море и въздух.',
  Азербайджан: 'Нахичеван е ексклав – отделен от основната територия от Армения.',
  ЮАР: 'Лесото е „дупка“ в територията ѝ – държава, изцяло заобиколена от ЮАР.',
};

const BOX = { x: 10, y: 10, w: 400, h: 300 };
/** km на пиксел при „еднакъв мащаб“ – Индонезия и Чили се побират в полето */
const COMMON = 17;

function measure(rings: number[][], s: number) {
  let area = 0;
  let perim = 0;
  let cx = 0;
  let cy = 0;
  const pts: [number, number][][] = [];
  for (const r of rings) {
    const sign = r[0];
    const p: [number, number][] = [];
    for (let i = 1; i < r.length; i += 2) p.push([r[i] * s, r[i + 1] / s]);
    let a = 0;
    let mx = 0;
    let my = 0;
    for (let i = 0; i < p.length; i++) {
      const [x0, y0] = p[i ? i - 1 : p.length - 1];
      const [x1, y1] = p[i];
      const c = x0 * y1 - x1 * y0;
      a += c;
      mx += (x0 + x1) * c;
      my += (y0 + y1) * c;
      perim += Math.hypot(x1 - x0, y1 - y0);
    }
    // знакът на обхождането не е сигурен – вземаме абсолютната площ, а дупките изваждаме
    const k = sign * Math.sign(a);
    area += (sign * Math.abs(a)) / 2;
    cx += (k * mx) / 6;
    cy += (k * my) / 6;
    pts.push(p);
  }
  cx /= area;
  cy /= area;
  let rmax = 0;
  let far: [number, number] = [cx, cy];
  for (const p of pts)
    for (const q of p) {
      const d = Math.hypot(q[0] - cx, q[1] - cy);
      if (d > rmax) {
        rmax = d;
        far = q;
      }
    }
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of pts)
    for (const [x, y] of p) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  return { area, perim, cx, cy, rmax, far, pts, bbox: { x0, x1, y0, y1 } };
}

/** Форма на държавата: площ, дължина на границата и индекси на компактност върху истински очертания. */
export default function ShapeLab() {
  const [idx, setIdx] = useState(0);
  const [stretch, setStretch] = useState(1);
  const [common, setCommon] = useState(false);
  const shape = STATE_SHAPES[idx];
  const m = measure(shape.rings, stretch);

  // Мащаб: по полето или общ за всички държави
  const { x0, x1, y0, y1 } = m.bbox;
  const kmPx = common ? COMMON : Math.max((x1 - x0) / (BOX.w - 30), (y1 - y0) / (BOX.h - 30), 0.5);
  const midX = common ? m.cx : (x0 + x1) / 2;
  const midY = common ? m.cy : (y0 + y1) / 2;
  const X = (x: number) => BOX.x + BOX.w / 2 + (x - midX) / kmPx;
  const Y = (y: number) => BOX.y + BOX.h / 2 - (y - midY) / kmPx;

  const d = m.pts.map(p => p.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join('') + 'Z').join('');
  const req = Math.sqrt(m.area / Math.PI);
  const pp = (4 * Math.PI * m.area) / (m.perim * m.perim);
  const circ = m.area / (Math.PI * m.rmax * m.rmax);
  const barKm = [50, 100, 200, 500, 1000, 2000].find(v => v / kmPx > 60) ?? 2000;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={6} className="fill-sky-50 dark:fill-sky-950" />
        <svg x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`} overflow="hidden">
          <circle cx={X(m.cx)} cy={Y(m.cy)} r={m.rmax / kmPx} fill="none" className="stroke-gray-400" strokeWidth="1" strokeDasharray="2 4" />
          <path d={d} fillRule="evenodd" className="fill-amber-200 stroke-amber-700 dark:fill-amber-700/60 dark:stroke-amber-300" strokeWidth="1" strokeLinejoin="round" />
          <circle cx={X(m.cx)} cy={Y(m.cy)} r={req / kmPx} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.8" strokeDasharray="6 4" />
          <line x1={X(m.cx)} y1={Y(m.cy)} x2={X(m.far[0])} y2={Y(m.far[1])} className="stroke-rose-500" strokeWidth="1.5" />
          <circle cx={X(m.cx)} cy={Y(m.cy)} r={3.5} className="fill-rose-600" />
        </svg>
        {/* мащабна линийка */}
        <line x1={BOX.x + 12} y1={BOX.y + BOX.h - 14} x2={BOX.x + 12 + barKm / kmPx} y2={BOX.y + BOX.h - 14} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" />
        <text x={BOX.x + 12} y={BOX.y + BOX.h - 20} fontSize="10" className="fill-gray-700 dark:fill-gray-200">
          {fmt(barKm)} km
        </text>
        <text x={BOX.x + 10} y={BOX.y + 16} fontSize="12" className="fill-gray-800 dark:fill-gray-100 font-semibold">
          {shape.name} – {TYPE[shape.type]}
        </text>

        {(
          [
            ['площ', `${fmt(m.area)} km²`],
            ['дължина на границата', `${fmt(m.perim)} km`],
            ['радиус на кръг със същата площ', `${fmt(req)} km`],
            ['най-далечна точка от центъра', `${fmt(m.rmax)} km`],
            ['индекс 4πS / P²', fmt(pp, 3)],
            ['индекс S / πR²ₘₐₓ', fmt(circ, 2)],
          ] as [string, string][]
        ).map(([label, value], k) => (
          <g key={label}>
            <text x={424} y={36 + k * 30} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
              {label}
            </text>
            <text x={630} y={52 + k * 30} fontSize="12" textAnchor="end" className="fill-gray-900 dark:fill-gray-100 font-medium">
              {value}
            </text>
          </g>
        ))}
        <g fontSize="9.5" className="fill-gray-500 dark:fill-gray-400">
          <line x1={424} y1={234} x2={444} y2={234} className="stroke-sky-600" strokeWidth="1.8" strokeDasharray="6 4" />
          <text x={450} y={237}>кръг със същата площ</text>
          <line x1={424} y1={250} x2={444} y2={250} className="stroke-gray-400" strokeDasharray="2 4" />
          <text x={450} y={253}>кръг до най-далечната точка</text>
          <line x1={424} y1={266} x2={444} y2={266} className="stroke-rose-500" strokeWidth="1.5" />
          <text x={450} y={269}>от центъра до най-далечната точка</text>
        </g>
      </LabSvg>
      <Buttons>
        {STATE_SHAPES.map((s, i) => (
          <DiagramButton key={s.name} active={i === idx} onClick={() => setIdx(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!common} onClick={() => setCommon(false)}>
          по размера на полето
        </DiagramButton>
        <DiagramButton active={common} onClick={() => setCommon(true)}>
          еднакъв мащаб
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="разтяг." value={stretch} onChange={setStretch} min={0.25} max={4} step={0.05} tone="violet" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Разтягането удължава държавата по ширина и я свива по височина, без да променя площта ѝ. Очертанията са по Natural Earth (1:50 m), затова дължината на
        границата е по-къса от официалната – колкото по-подробна е картата, толкова по-дълга излиза назъбената брегова линия.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'вид', value: TYPE[shape.type], tone: 'amber' },
            { label: '4πS / P²', value: fmt(pp, 3), tone: 'blue' },
            { label: 'S / πR²', value: fmt(circ, 2), tone: 'violet' },
            { label: 'Rₘₐₓ', value: `${fmt(m.rmax)} km`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={circ > 0.45 ? 'emerald' : circ > 0.25 ? 'amber' : 'rose'}>
        {ABOUT[shape.name]}{' '}
        {stretch !== 1
          ? `При разтягане ${fmt(stretch, 2)} пъти площта е същата, но най-далечната точка е на ${fmt(m.rmax)} km от центъра.`
          : circ > 0.45
            ? 'Кръгът със същата площ почти покрива държавата – формата е близка до компактна.'
            : 'Най-далечната точка е много по-далеч от радиуса на кръга със същата площ – управлението, отбраната и пътищата излизат по-скъпи.'}
      </Note>
    </div>
  );
}
