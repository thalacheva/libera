import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const NM = 1.852;
const TS = 12 * NM;
const CZ = 24 * NM;
const EEZ = 200 * NM;

/** Поле на картата в пиксели и мащаб в km на пиксел */
const MAP = { x: 8, y: 8, w: 420, h: 300 };
const K = 2.2;
const H_KM = MAP.h * K;

type P = [number, number];

// Брегът на държава А (x в km от левия край, y в km отгоре): залив с устие 40 km и острови пред брега
const COAST_A: P[] = [
  [120, -20],
  [112, 60],
  [140, 120],
  [150, 190],
  [110, 200],
  [80, 212],
  [105, 224],
  [150, 230],
  [135, 300],
  [150, 380],
  [140, 440],
  [168, 500],
  [150, 560],
  [128, 620],
  [140, 680],
];
const ISLANDS: { c: P; r: number }[] = [
  { c: [176, 402], r: 6 },
  { c: [194, 450], r: 8 },
  { c: [200, 500], r: 5 },
  { c: [186, 544], r: 6 },
];
// Нормалната изходна линия е брегът, но заливът с устие под 24 мили се затваря с права линия
const BASE_NORMAL: P[] = [...COAST_A.slice(0, 4), ...COAST_A.slice(7)];
// Прави изходни линии: освен това линия през външните точки на островите
const BASE_A: P[] = [
  ...BASE_NORMAL.slice(0, 7),
  [181, 400],
  [201, 448],
  [205, 500],
  [191, 546],
  [150, 560],
  ...COAST_A.slice(13),
];

const coastB = (gap: number): P[] => Array.from({ length: 25 }, (_, i) => [120 + gap + 22 * Math.sin(i * 0.7) - 8 * Math.cos(i * 0.31), -20 + i * 30] as P);

function segDist(p: P, a: P, b: P) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
const lineDist = (p: P, line: P[]) => line.slice(1).reduce((m, q, i) => Math.min(m, segDist(p, line[i], q)), Infinity);
const islandDist = (p: P) => ISLANDS.reduce((m, s) => Math.min(m, Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) - s.r), Infinity);

/** x на линия, зададена като начупена линия по y */
function xAt(line: P[], y: number) {
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = line[i - 1];
    const [x1, y1] = line[i];
    if (y >= y0 && y <= y1) return y1 === y0 ? x0 : x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  }
  return line[line.length - 1][0];
}

const px = ([x, y]: P) => `${(MAP.x + x / K).toFixed(1)} ${(MAP.y + y / K).toFixed(1)}`;
const path = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${px(p)}`).join('');

const TONES = {
  a: ['stroke-sky-100 dark:stroke-sky-950', 'stroke-sky-200 dark:stroke-sky-900', 'stroke-sky-400 dark:stroke-sky-700'],
  b: ['stroke-rose-100 dark:stroke-rose-950', 'stroke-rose-200 dark:stroke-rose-900', 'stroke-rose-400 dark:stroke-rose-700'],
};
const toFill = (cls: string) => cls.replace(/stroke-/g, 'fill-');

/** Морски пространства по UNCLOS: изходни линии, териториално море, прилежаща зона, ИИЗ и средна линия между две държави. */
export default function SeaZonesLab() {
  const [gap, setGap] = useState(500);
  const [straight, setStraight] = useState(false);
  const [ship, setShip] = useState<P>([320, 330]);
  const id = useId();

  const base = straight ? BASE_A : BASE_NORMAL;
  const B = coastB(gap);
  const dA = (p: P) => Math.max(0, Math.min(lineDist(p, base), islandDist(p)));
  const dB = (p: P) => lineDist(p, B);

  // Средна линия: точките, еднакво далеч от изходните линии на двете държави
  const median: P[] = [];
  for (let y = -20; y <= H_KM + 20; y += 6) {
    let lo = xAt(base, y);
    let hi = xAt(B, y);
    for (let k = 0; k < 28; k++) {
      const mid = (lo + hi) / 2;
      if (dA([mid, y]) < dB([mid, y])) lo = mid;
      else hi = mid;
    }
    median.push([(lo + hi) / 2, y]);
  }
  const sideA: P[] = [[-200, -20], ...median, [-200, H_KM + 20]];
  const sideB: P[] = [[3000, -20], ...median, [3000, H_KM + 20]];

  // Най-широкото открито море по средата
  const midRow = median.reduce((best, p) => {
    const d = dA(p);
    return d > best ? d : best;
  }, 0);
  const highSeas = Math.max(0, 2 * (midRow - EEZ));
  const minGap = Math.min(...median.map(p => dA(p) + dB(p)));

  const zone = (p: P) => {
    if (p[0] < xAt(COAST_A, p[1]) || islandDist(p) < 0) return { text: 'суша на А', tone: 'gray' as const };
    if (p[0] > xAt(B, p[1])) return { text: 'суша на Б', tone: 'gray' as const };
    if (p[1] > 190 && p[1] < 230 && p[0] < 150) return { text: 'вътрешни води на А (залив)', tone: 'blue' as const };
    if (straight && p[1] > 380 && p[1] < 560 && p[0] < xAt(BASE_A, p[1])) return { text: 'вътрешни води на А', tone: 'blue' as const };
    const a = dA(p);
    const b = dB(p);
    const own = a <= b ? 'А' : 'Б';
    const d = Math.min(a, b);
    if (d <= TS) return { text: `териториално море на ${own}`, tone: (own === 'А' ? 'blue' : 'rose') as 'blue' | 'rose' };
    if (d <= CZ) return { text: `прилежаща зона на ${own}`, tone: (own === 'А' ? 'blue' : 'rose') as 'blue' | 'rose' };
    if (d <= EEZ) return { text: `ИИЗ на ${own}`, tone: (own === 'А' ? 'blue' : 'rose') as 'blue' | 'rose' };
    return { text: 'открито море', tone: 'emerald' as const };
  };
  const z = zone(ship);
  const rights: Record<string, string> = {
    вътрешни: 'Пълен суверенитет – като на сушата; чужд кораб влиза само с разрешение.',
    териториално: 'Суверенитет на крайбрежната държава, но чуждите кораби имат право на мирно преминаване.',
    прилежаща: 'Държавата може да проверява за митнически, данъчни, имиграционни и санитарни нарушения.',
    ИИЗ: 'Корабоплаването е свободно, но рибата, нефтът, газът и вятърът принадлежат на крайбрежната държава.',
    открито: 'Свободно за всички: корабоплаване, риболов, полети, полагане на кабели.',
    суша: 'Корабът е на сушата – щракни в морето.',
  };
  const right = Object.entries(rights).find(([k]) => z.text.startsWith(k))?.[1] ?? '';

  const click = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return;
    const q = pt.matrixTransform(m.inverse());
    setShip([(q.x - MAP.x) * K, (q.y - MAP.y) * K]);
  };

  const buffers = (side: 'a' | 'b') => {
    const line = side === 'a' ? base : B;
    const t = TONES[side];
    return [EEZ, CZ, TS].map((d, k) => (
      <g key={d}>
        <path d={path(line)} fill="none" className={t[k]} strokeWidth={(2 * d) / K} strokeLinejoin="round" strokeLinecap="round" />
        {side === 'a' && ISLANDS.map(s => <circle key={s.c[1]} cx={MAP.x + s.c[0] / K} cy={MAP.y + s.c[1] / K} r={(s.r + d) / K} className={toFill(t[k])} />)}
      </g>
    ));
  };

  const internal = [path(COAST_A.slice(3, 8)) + 'Z', ...(straight ? [path([...BASE_A.slice(6, 12), ...COAST_A.slice(10, 12).reverse()]) + 'Z'] : [])];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 316" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id={`${id}m`}>
            <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={6} />
          </clipPath>
          <clipPath id={`${id}a`}>
            <path d={path(sideA) + 'Z'} />
          </clipPath>
          <clipPath id={`${id}b`}>
            <path d={path(sideB) + 'Z'} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}m)`}>
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} className="fill-emerald-50 dark:fill-slate-900" />
          <g clipPath={`url(#${id}a)`}>{buffers('a')}</g>
          <g clipPath={`url(#${id}b)`}>{buffers('b')}</g>
          {internal.map(d => (
            <path key={d} d={d} className="fill-sky-600 dark:fill-sky-500" />
          ))}
          <path d={path([...COAST_A, [-200, H_KM + 20], [-200, -20]]) + 'Z'} className="fill-stone-200 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-400" strokeWidth="1" />
          {ISLANDS.map(s => (
            <circle key={s.c[1]} cx={MAP.x + s.c[0] / K} cy={MAP.y + s.c[1] / K} r={s.r / K} className="fill-stone-200 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-400" strokeWidth="1" />
          ))}
          <path d={path([...B, [3000, H_KM + 20], [3000, -20]]) + 'Z'} className="fill-stone-200 stroke-stone-500 dark:fill-stone-700 dark:stroke-stone-400" strokeWidth="1" />
          <path d={path(straight ? BASE_A.slice(3, 12) : BASE_NORMAL.slice(3, 5))} fill="none" className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="1.2" strokeDasharray="5 3" />
          <path d={path(median)} fill="none" className="stroke-violet-700 dark:stroke-violet-300" strokeWidth="1.5" strokeDasharray="7 4" />
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} fill="transparent" className="cursor-crosshair" onClick={click} />
          <g transform={`translate(${MAP.x + ship[0] / K} ${MAP.y + ship[1] / K})`} className="pointer-events-none">
            <path d="M-8 0 h16 l-4 5 h-8 Z M0 0 v-11 l7 7 h-7" className="fill-gray-900 stroke-gray-900 dark:fill-white dark:stroke-white" strokeWidth="1" />
          </g>
          <text x={MAP.x + 14} y={MAP.y + 20} fontSize="13" className="fill-stone-700 dark:fill-stone-200 font-bold">
            А
          </text>
          <text x={MAP.x + MAP.w - 14} y={MAP.y + 20} fontSize="13" textAnchor="end" className="fill-stone-700 dark:fill-stone-200 font-bold">
            Б
          </text>
        </g>
        <line x1={MAP.x + 12} y1={MAP.y + MAP.h - 12} x2={MAP.x + 12 + 200 / K} y2={MAP.y + MAP.h - 12} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth="2" />
        <text x={MAP.x + 12} y={MAP.y + MAP.h - 17} fontSize="10" className="fill-gray-800 dark:fill-gray-100">
          200 km
        </text>

        {/* Легенда */}
        <g fontSize="10.5" className="fill-gray-700 dark:fill-gray-200">
          {(
            [
              ['fill-sky-600 dark:fill-sky-500', 'вътрешни води'],
              ['fill-sky-400 dark:fill-sky-700', 'териториално море – 12 мили'],
              ['fill-sky-200 dark:fill-sky-900', 'прилежаща зона – до 24 мили'],
              ['fill-sky-100 dark:fill-sky-950', 'ИИЗ – до 200 мили'],
              ['fill-emerald-50 dark:fill-slate-900', 'открито море'],
            ] as [string, string][]
          ).map(([cls, label], k) => (
            <g key={label}>
              <rect x={442} y={14 + k * 22} width={16} height={14} rx={2} className={`${cls} stroke-gray-300 dark:stroke-gray-600`} />
              <text x={464} y={25 + k * 22}>
                {label}
              </text>
            </g>
          ))}
          <line x1={442} y1={130} x2={458} y2={130} className="stroke-violet-700 dark:stroke-violet-300" strokeWidth="1.5" strokeDasharray="7 4" />
          <text x={464} y={134}>средна линия</text>
          <text x={442} y={156} fontSize="9.5" className="fill-gray-500 dark:fill-gray-400">
            при Б същите зони са в розово
          </text>
          <text x={442} y={186} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
            корабът е в:
          </text>
          <text x={442} y={204} fontSize="12" className="fill-gray-900 dark:fill-gray-100 font-semibold">
            {z.text}
          </text>
          <text x={442} y={232} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
            до А: {fmt(dA(ship) / NM)} мили · до Б: {fmt(dB(ship) / NM)} мили
          </text>
          <text x={442} y={260} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
            най-тясно между бреговете:
          </text>
          <text x={442} y={276} fontSize="11" className="fill-gray-900 dark:fill-gray-100">
            {fmt(minGap)} km = {fmt(minGap / NM)} мили
          </text>
        </g>
      </LabSvg>
      <Buttons>
        <DiagramButton active={!straight} onClick={() => setStraight(false)}>
          нормална изходна линия
        </DiagramButton>
        <DiagramButton active={straight} onClick={() => setStraight(true)}>
          прави изходни линии
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="море" value={gap} onChange={setGap} min={30} max={900} step={5} tone="violet" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        море – колко километра е средно между бреговете на А и Б. Щракни в морето, за да преместиш кораба. Разстоянията се мерят от изходната линия: обикновено
        това е линията на отлива по брега, но при силно нарязан бряг или верига от острови държавата може да прекара прави линии.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'корабът', value: z.text, tone: z.tone },
            { label: 'открито море', value: highSeas > 0 ? `${fmt(highSeas)} km` : 'няма', tone: 'emerald' },
            { label: 'тер. води', value: minGap < 2 * TS ? 'опират' : 'не се допират', tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={highSeas > 0 ? 'emerald' : minGap < 2 * TS ? 'rose' : 'amber'}>
        {right}{' '}
        {minGap < 2 * TS
          ? 'Бреговете са по-близо от 24 мили: териториалните морета се срещат и границата е по средната линия – няма нито ИИЗ, нито открито море помежду им.'
          : highSeas > 0
            ? 'Бреговете са на повече от 400 мили: между двете ИИЗ остава открито море.'
            : 'Бреговете са по-близо от 400 мили: изключителните икономически зони се застъпват и се делят по средната линия (или по договор).'}
      </Note>
    </div>
  );
}
