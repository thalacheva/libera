import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Население на 31.12.2024 г. по НСИ, млн.
const SOFIA0 = 1.296;
const REST0 = 5.141;
const Y0 = 2025;
const Y1 = 2050;

const PRESETS: { name: string; b: number; d: number; ext: number; int: number }[] = [
  { name: 'като през 2024 г.', b: 8.3, d: 15.6, ext: 6.1, int: 2 },
  { name: 'като през 90-те', b: 10, d: 13.5, ext: -10, int: 2 },
  { name: 'без миграции', b: 8.3, d: 15.6, ext: 0, int: 0 },
  { name: 'много завръщащи се', b: 9, d: 15, ext: 10, int: 2 },
];

/** Баланс на населението: естествен и механичен прираст, София и останалата част от страната. */
export default function BalanceLab() {
  const [b, setB] = useState(8.3);
  const [d, setD] = useState(15.6);
  const [ext, setExt] = useState(6.1);
  const [int, setInt] = useState(2);

  // Годишна стъпка: P₁ = P₀ + (Р − У) + (И − Е); вътрешните преселници само се местят
  const rows: { y: number; s: number; r: number }[] = [];
  let s = SOFIA0;
  let r = REST0;
  for (let y = Y0; y <= Y1; y++) {
    rows.push({ y, s, r });
    const moved = (int / 1000) * r;
    s += ((b - d + ext) / 1000) * s + moved;
    r += ((b - d + ext) / 1000) * r - moved;
  }
  const end = rows[rows.length - 1];
  const total0 = SOFIA0 + REST0;
  const total1 = end.s + end.r;

  const C = { x: 50, y: 24, w: 360, h: 230 };
  const yMax = 8;
  const cx = (y: number) => C.x + ((y - Y0) / (Y1 - Y0)) * C.w;
  const cy = (v: number) => C.y + C.h - (v / yMax) * C.h;
  const area = (lo: (q: (typeof rows)[0]) => number, hi: (q: (typeof rows)[0]) => number) =>
    rows.map((q, i) => `${i ? 'L' : 'M'}${cx(q.y).toFixed(1)} ${cy(hi(q)).toFixed(1)}`).join('') +
    rows
      .slice()
      .reverse()
      .map(q => `L${cx(q.y).toFixed(1)} ${cy(lo(q)).toFixed(1)}`)
      .join('') +
    'Z';

  // Компонентите през първата година, хиляди души
  const nat = ((b - d) / 1000) * total0 * 1000;
  const mech = (ext / 1000) * total0 * 1000;
  const comps: [string, number, string][] = [
    ['родени', (b / 1000) * total0 * 1000, 'fill-emerald-500'],
    ['умрели', (-d / 1000) * total0 * 1000, 'fill-gray-500'],
    ['естествен', nat, 'fill-sky-500'],
    ['механичен', mech, 'fill-amber-500'],
    ['общо', nat + mech, nat + mech >= 0 ? 'fill-emerald-600' : 'fill-rose-500'],
  ];
  const B = { x: 450, y: 24, w: 170, h: 230 };
  const bMax = 120;
  const by = (v: number) => B.y + B.h / 2 - (v / bMax) * (B.h / 2);

  const apply = (p: (typeof PRESETS)[0]) => {
    setB(p.b);
    setD(p.d);
    setExt(p.ext);
    setInt(p.int);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={C.x} y={14} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          Население на България, млн.
        </text>
        {[0, 2, 4, 6, 8].map(v => (
          <g key={v}>
            <line x1={C.x} y1={cy(v)} x2={C.x + C.w} y2={cy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={C.x - 6} y={cy(v) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        {[2025, 2030, 2035, 2040, 2045, 2050].map(y => (
          <text key={y} x={cx(y)} y={C.y + C.h + 13} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {y}
          </text>
        ))}
        <path d={area(() => 0, q => q.s)} className="fill-violet-500/70" />
        <path d={area(q => q.s, q => q.s + q.r)} className="fill-sky-500/50" />
        <text x={C.x + 8} y={cy(end.s / 2) + 4} fontSize="11" className="fill-white font-semibold">
          София
        </text>
        <text x={C.x + 8} y={cy(end.s + Math.min(end.r, REST0) / 2) + 4} fontSize="11" className="fill-sky-900 dark:fill-sky-100 font-semibold">
          останалата част от страната
        </text>
        <text x={C.x + C.w} y={cy(total1) - 6} fontSize="10" textAnchor="end" className="fill-gray-700 dark:fill-gray-200">
          {fmt(total1, 2)} млн.
        </text>

        <text x={B.x - 10} y={14} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          За {Y0} г., хиляди души
        </text>
        <line x1={B.x} y1={by(0)} x2={B.x + B.w} y2={by(0)} className="stroke-gray-400" />
        {comps.map(([name, v, cls], i) => {
          const x = B.x + 4 + i * 34;
          const h = Math.min(B.h / 2, Math.abs(by(v) - by(0)));
          return (
            <g key={name}>
              <rect x={x} y={v >= 0 ? by(0) - h : by(0)} width={26} height={Math.max(1, h)} className={cls} rx={2} />
              <text x={x + 13} y={v >= 0 ? by(0) - h - 4 : by(0) + h + 11} fontSize="9" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
                {v > 0 ? '+' : v < 0 ? '−' : ''}
                {fmt(Math.abs(v))}
              </text>
              <text
                x={x + 13}
                y={B.y + B.h + 13}
                fontSize="9"
                textAnchor="end"
                transform={`rotate(-30 ${x + 13} ${B.y + B.h + 13})`}
                className="fill-gray-500 dark:fill-gray-400"
              >
                {name}
              </text>
            </g>
          );
        })}
      </LabSvg>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={p.b === b && p.d === d && p.ext === ext && p.int === int} onClick={() => apply(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="Р" value={b} onChange={setB} min={5} max={15} step={0.1} tone="emerald" />
        <Slider label="У" value={d} onChange={setD} min={8} max={20} step={0.1} tone="gray" />
        <Slider label="И−Е" value={ext} onChange={setExt} min={-15} max={15} step={0.1} tone="amber" />
        <Slider label="→Соф." value={int} onChange={setInt} min={0} max={8} step={0.1} tone="violet" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Р и У – раждаемост и смъртност, И − Е – механичен прираст от външна миграция (всички в ‰ годишно); „→Соф.“ – колко души на 1000 от
        останалата част на страната се преместват всяка година в София. Началото е населението на 31.12.2024 г. по НСИ. За простота раждаемостта и
        смъртността са еднакви навсякъде, а в действителност в София населението е по-младо.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: `${Y1} г.`, value: `${fmt(total1, 2)} млн.`, tone: 'blue' },
            { label: 'промяна', value: `${total1 >= total0 ? '+' : '−'}${fmt((100 * Math.abs(total1 - total0)) / total0, 1)}%`, tone: total1 >= total0 ? 'emerald' : 'rose' },
            { label: 'София', value: `${fmt(100 * (SOFIA0 / total0))}% → ${fmt((100 * end.s) / total1)}%`, tone: 'violet' },
            { label: 'нужно И − Е за баланс', value: `${d - b > 0 ? '+' : ''}${fmt(d - b, 1)}‰`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={Math.abs(ext) < 0.05 ? 'gray' : ext > 0 ? 'emerald' : 'rose'}>
        {b - d + ext >= 0
          ? 'Механичният прираст покрива естествения спад – населението не намалява.'
          : ext > 0
            ? 'Заселват се повече хора, отколкото се изселват, но това не стига, за да компенсира естествения спад.'
            : 'Естественият и механичният прираст са отрицателни – населението намалява още по-бързо.'}
      </Note>
    </div>
  );
}
