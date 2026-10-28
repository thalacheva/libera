import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt, landPathGlobe, rad } from '../geo';

const CX = 290;
const CY = 180;
const R = 145;
const LON0 = 20;
const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const BG = { lat: 42.7, lon: 25.3 };

/** Средна по всички дължини ширина на вътрешнотропичната зона на конвергенция – приблизително. */
const itczLat = (m: number) => 4 + 6 * Math.cos((2 * Math.PI * (m - 8)) / 12);

/** Границите на клетките в Северното и Южното полукълбо при изместване s на ВЗК. */
const bounds = (s: number) => ({
  n: [s, 30 + s / 2, 60 + s / 4, 90],
  sth: [s, -30 + s / 2, -60 + s / 4, -90],
});

/** Приземен вятър (на изток, на север) на ширина φ – схемата на трите клетки. */
function surfaceWind(lat: number, s: number) {
  const { n, sth } = bounds(s);
  const b = lat >= s ? n : sth;
  const sgn = lat >= s ? 1 : -1; // към полюса
  for (let k = 0; k < 3; k++) {
    const a = b[k];
    const c = b[k + 1];
    if ((lat - a) * (lat - c) <= 0) {
      const t = Math.sin((Math.PI * (lat - a)) / (c - a));
      if (k === 0) return { u: -0.9 * t, v: -0.5 * t * sgn }; // пасати – от изток и към екватора
      if (k === 1) return { u: 1 * t, v: 0.35 * t * sgn }; // западни ветрове – от запад и към полюса
      return { u: -0.6 * t, v: -0.3 * t * sgn }; // полярни източни ветрове
    }
  }
  return { u: 0, v: 0 };
}

const P = (lat: number, r = R) => ({ x: CX + r * Math.cos(rad(lat)), y: CY - r * Math.sin(rad(lat)) });

/** Клетка като пръстен по десния ръб на глобуса между ширините a и b, с височина h px. */
function cellPath(a: number, b: number, h: number) {
  const pts: string[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const lat = a + ((b - a) * i) / steps;
    const p = P(lat, R + 6);
    pts.push(`${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  for (let i = steps; i >= 0; i--) {
    const lat = a + ((b - a) * i) / steps;
    const p = P(lat, R + 6 + h);
    pts.push(`L${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  return pts.join('') + 'Z';
}

/** Стрелка по дъга на радиус r от ширина a към ширина b. */
function ArcArrow({ a, b, r, cls }: { a: number; b: number; r: number; cls: string }) {
  const p1 = P(a, r);
  const p2 = P(b, r);
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return (
    <g className={cls}>
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeWidth="2" />
      <path d={`M${p2.x} ${p2.y}L${p2.x - 7 * Math.cos(ang - 0.5)} ${p2.y - 7 * Math.sin(ang - 0.5)}L${p2.x - 7 * Math.cos(ang + 0.5)} ${p2.y - 7 * Math.sin(ang + 0.5)}Z`} fill="currentColor" />
    </g>
  );
}

/** Радиална стрелка на ширина lat от радиус r1 към r2 (издигане или спускане). */
function RadArrow({ lat, r1, r2, cls }: { lat: number; r1: number; r2: number; cls: string }) {
  const p1 = P(lat, r1);
  const p2 = P(lat, r2);
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return (
    <g className={cls}>
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeWidth="2" />
      <path d={`M${p2.x} ${p2.y}L${p2.x - 6 * Math.cos(ang - 0.5)} ${p2.y - 6 * Math.sin(ang - 0.5)}L${p2.x - 6 * Math.cos(ang + 0.5)} ${p2.y - 6 * Math.sin(ang + 0.5)}Z`} fill="currentColor" />
    </g>
  );
}

/** Общата циркулация на атмосферата: три клетки във всяко полукълбо, пояси на налягането и ветровете, сезонното им местене. */
export default function GeneralCirculationLab() {
  const [month, setMonth] = useState(7);
  const s = itczLat(month);
  const { n, sth } = bounds(s);
  const land = landPathGlobe(0, LON0, CX, CY, R);

  // Приземни ветрове: мрежа от стрелки по лицето на глобуса
  const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
  for (let lat = -80; lat <= 80; lat += 10)
    for (const lon of [-40, -15, 10, 35]) {
      const { u, v } = surfaceWind(lat, s);
      const f = rad(lat);
      const l = rad(lon);
      const x = CX + R * Math.cos(f) * Math.sin(l);
      const y = CY - R * Math.sin(f);
      // Единичните вектори на изток и на север в ортографската проекция (екранното y е надолу)
      const dx = (u * Math.cos(l) - v * Math.sin(f) * Math.sin(l)) * 22;
      const dy = -v * Math.cos(f) * 22;
      arrows.push({ x, y, dx, dy });
    }

  // Пояси на налягането: ниско – ВЗК и субполярните депресии; високо – субтропичните и полярните антициклони
  const belts = [
    { lat: n[0], low: true, name: 'ВЗК (ниско налягане)' },
    { lat: n[1], low: false, name: 'субтропичен антициклон' },
    { lat: n[2], low: true, name: 'субполярна депресия' },
    { lat: sth[1], low: false, name: 'субтропичен антициклон' },
    { lat: sth[2], low: true, name: 'субполярна депресия' },
  ];
  const band = (lat: number) => {
    const y1 = CY - R * Math.sin(rad(lat + 3));
    const y2 = CY - R * Math.sin(rad(lat - 3));
    return { y1, y2 };
  };

  // Клетки: височината в пиксели – тропосферата е най-висока над тропиците
  const cells = [
    { a: n[0], b: n[1], h: 40, name: 'Хадли', cls: 'fill-rose-200/70 dark:fill-rose-900/50' },
    { a: n[1], b: n[2], h: 30, name: 'Ферел', cls: 'fill-emerald-200/70 dark:fill-emerald-900/50' },
    { a: n[2], b: 90, h: 22, name: 'полярна', cls: 'fill-sky-200/70 dark:fill-sky-900/50' },
    { a: sth[0], b: sth[1], h: 40, name: 'Хадли', cls: 'fill-rose-200/70 dark:fill-rose-900/50' },
    { a: sth[1], b: sth[2], h: 30, name: 'Ферел', cls: 'fill-emerald-200/70 dark:fill-emerald-900/50' },
    { a: sth[2], b: -90, h: 22, name: 'полярна', cls: 'fill-sky-200/70 dark:fill-sky-900/50' },
  ];

  const bg = { x: CX + R * Math.cos(rad(BG.lat)) * Math.sin(rad(BG.lon - LON0)), y: CY - R * Math.sin(rad(BG.lat)) };
  const summer = s > 6;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 360" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="gc-globe">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>
        <circle cx={CX} cy={CY} r={R} className="fill-sky-100 dark:fill-slate-900" />
        <g clipPath="url(#gc-globe)">
          <path d={land} fillRule="evenodd" className="fill-stone-300/80 dark:fill-stone-700/80" />
          {belts.map((b, i) => {
            const { y1, y2 } = band(b.lat);
            return <rect key={i} x={CX - R} y={y1} width={2 * R} height={y2 - y1} className={b.low ? 'fill-blue-400/35' : 'fill-amber-400/40'} />;
          })}
          {[-60, -30, 0, 30, 60].map(l => (
            <line key={l} x1={CX - R} x2={CX + R} y1={CY - R * Math.sin(rad(l))} y2={CY - R * Math.sin(rad(l))} strokeDasharray={l === 0 ? undefined : '3 4'} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={l === 0 ? 1.2 : 0.8} />
          ))}
          {arrows.map((a, i) =>
            Math.hypot(a.dx, a.dy) < 3 ? null : (
              <g key={i} className="text-blue-700 dark:text-blue-300">
                <line x1={a.x - a.dx / 2} y1={a.y - a.dy / 2} x2={a.x + a.dx / 2} y2={a.y + a.dy / 2} stroke="currentColor" strokeWidth="1.6" />
                <path
                  d={(() => {
                    const x2 = a.x + a.dx / 2;
                    const y2 = a.y + a.dy / 2;
                    const ang = Math.atan2(a.dy, a.dx);
                    return `M${x2} ${y2}L${x2 - 5 * Math.cos(ang - 0.5)} ${y2 - 5 * Math.sin(ang - 0.5)}L${x2 - 5 * Math.cos(ang + 0.5)} ${y2 - 5 * Math.sin(ang + 0.5)}Z`;
                  })()}
                  fill="currentColor"
                />
              </g>
            ),
          )}
          <circle cx={bg.x} cy={bg.y} r={4} className="fill-rose-600 stroke-white" strokeWidth="1.5" />
        </g>
        <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-gray-500" />
        <text x={bg.x + 7} y={bg.y - 5} fontSize="10" fontWeight="bold" className="fill-rose-700 dark:fill-rose-300">
          България
        </text>

        {/* Клетките по десния ръб */}
        {cells.map((c, i) => (
          <path key={i} d={cellPath(c.a, c.b, c.h)} className={`${c.cls} stroke-gray-400 dark:stroke-gray-500`} strokeWidth="0.8" />
        ))}
        {cells.map((c, i) => {
          const toPole = Math.sign(c.b - c.a);
          const mid = (c.a + c.b) / 2;
          const span = (c.b - c.a) * 0.25;
          const rIn = R + 12;
          const rOut = R + c.h;
          // Хадли и полярната: при земята към екватора; Ферел: при земята към полюса
          const surfaceToPole = c.name === 'Ферел';
          const s1 = surfaceToPole ? mid - span : mid + span;
          const s2 = surfaceToPole ? mid + span : mid - span;
          const rise = c.name === 'Хадли' ? c.a : c.name === 'Ферел' ? c.b : c.a; // издигане при ниското налягане
          const sink = c.name === 'Хадли' ? c.b : c.name === 'Ферел' ? c.a : c.b;
          const inset = 4 * toPole;
          return (
            <g key={`a${i}`}>
              <ArcArrow a={s1} b={s2} r={rIn} cls="text-gray-700 dark:text-gray-200" />
              <ArcArrow a={s2} b={s1} r={rOut} cls="text-gray-700 dark:text-gray-200" />
              {Math.abs(rise) < 89 && <RadArrow lat={rise + (rise === c.a ? inset : -inset)} r1={rIn + 2} r2={rOut - 4} cls="text-rose-600 dark:text-rose-400" />}
              {Math.abs(sink) < 89 && <RadArrow lat={sink + (sink === c.a ? inset : -inset)} r1={rOut - 4} r2={rIn + 2} cls="text-blue-600 dark:text-blue-400" />}
            </g>
          );
        })}
        {/* Струйни течения – на тропопаузата над границите между клетките */}
        {[n[1], n[2], sth[1], sth[2]].map((l, i) => {
          const p = P(l, R + 6 + (i % 2 === 0 ? 40 : 30));
          return <circle key={i} cx={p.x} cy={p.y} r={5} className="fill-fuchsia-600 stroke-white" strokeWidth="1.5" />;
        })}
        {[
          { lat: (n[0] + n[1]) / 2, t: 'Хадли', h: 40 },
          { lat: (n[1] + n[2]) / 2, t: 'Ферел', h: 30 },
          { lat: (sth[0] + sth[1]) / 2, t: 'Хадли', h: 40 },
          { lat: (sth[1] + sth[2]) / 2, t: 'Ферел', h: 30 },
        ].map((c, i) => {
          const p = P(c.lat, R + c.h + 14);
          return (
            <text key={i} x={p.x} y={p.y + 4} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
              {c.t}
            </text>
          );
        })}

        {/* Надписи на поясите вляво */}
        {belts.map((b, i) => (
          <text key={i} x={CX - R - 8} y={CY - R * Math.sin(rad(b.lat)) + 4} fontSize="10" textAnchor="end" className={b.low ? 'fill-blue-700 dark:fill-blue-300' : 'fill-amber-700 dark:fill-amber-300'}>
            {b.name}
          </text>
        ))}
        {[
          { lat: (n[0] + n[1]) / 2, t: 'СИ пасати' },
          { lat: (n[1] + n[2]) / 2, t: 'западни ветрове' },
          { lat: (n[2] + 90) / 2 + 4, t: 'полярни източни' },
          { lat: (sth[0] + sth[1]) / 2, t: 'ЮИ пасати' },
          { lat: (sth[1] + sth[2]) / 2, t: 'западни ветрове' },
        ].map((w, i) => (
          <text key={i} x={CX - R - 8} y={CY - R * Math.sin(rad(w.lat)) + 4} fontSize="10" fontStyle="italic" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {w.t}
          </text>
        ))}

        {/* Легенда */}
        <g fontSize="10" transform="translate(500 250)">
          <rect x={0} y={-8} width={12} height={8} className="fill-blue-400/50" />
          <text x={18} y={0} className="fill-gray-700 dark:fill-gray-200">
            ниско налягане
          </text>
          <rect x={0} y={8} width={12} height={8} className="fill-amber-400/60" />
          <text x={18} y={16} className="fill-gray-700 dark:fill-gray-200">
            високо налягане
          </text>
          <line x1={0} y1={30} x2={12} y2={30} className="stroke-rose-600" strokeWidth="2" />
          <text x={18} y={34} className="fill-gray-700 dark:fill-gray-200">
            издигане
          </text>
          <line x1={0} y1={46} x2={12} y2={46} className="stroke-blue-600" strokeWidth="2" />
          <text x={18} y={50} className="fill-gray-700 dark:fill-gray-200">
            спускане
          </text>
          <circle cx={6} cy={64} r={4} className="fill-fuchsia-600" />
          <text x={18} y={68} className="fill-gray-700 dark:fill-gray-200">
            струйно течение
          </text>
        </g>
        <text x={20} y={22} fontSize="13" fontWeight="bold" className="fill-gray-700 dark:fill-gray-100">
          {MONTHS[month - 1]}
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Схема, средна по всички дължини. Над континентите поясите се местят много повече – над Южна Азия през лятото ВЗК стига до около
        20–25° с.ш. Височината на клетките е силно преувеличена.
      </p>
      <Sliders>
        <Slider label="месец" value={month} onChange={setMonth} min={1} max={12} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ВЗК', value: `≈ ${fmt(Math.abs(s), 0)}° ${s >= 0 ? 'с.ш.' : 'ю.ш.'}`, tone: 'blue' },
            { label: 'субтропичен пояс', value: `≈ ${fmt(n[1], 0)}° с.ш.`, tone: 'amber' },
            { label: 'субполярен пояс', value: `≈ ${fmt(n[2], 0)}° с.ш.`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="blue">
        {summer
          ? 'Лято в Северното полукълбо: поясите са изместени на север. Субтропичният антициклон (у нас – Азорският) често се разпростира към Балканите и носи горещо и сухо време.'
          : 'Зима в Северното полукълбо: поясите са изместени на юг. Над Средиземно море минават повече циклони от запад, а от изток понякога нахлува студен въздух от Сибирския антициклон.'}
      </Note>
    </div>
  );
}
