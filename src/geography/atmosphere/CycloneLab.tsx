import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Slider, Sliders } from '~/functions/plot';
import { fmt } from '../geo';

type P = [number, number];
type Frame = { c: P; p: number; occl: [P, P, P]; warm: [P, P, P, P]; cold: [P, P, P, P]; fade: number };

// Норвежкият модел: шест стадия на средноширинния циклон (картата е 400 × 300, северът е нагоре)
const FRAMES: Frame[] = [
  {
    c: [200, 150],
    p: 1012,
    occl: [[200, 150], [200, 150], [200, 150]],
    warm: [[200, 150], [263, 150], [326, 150], [390, 150]],
    cold: [[200, 150], [137, 150], [74, 150], [10, 150]],
    fade: 1,
  },
  {
    c: [200, 145],
    p: 1006,
    occl: [[200, 145], [200, 145], [200, 145]],
    warm: [[200, 145], [252, 160], [310, 170], [385, 175]],
    cold: [[200, 145], [170, 178], [128, 203], [70, 222]],
    fade: 1,
  },
  {
    c: [205, 135],
    p: 996,
    occl: [[205, 135], [205, 135], [205, 135]],
    warm: [[205, 135], [262, 165], [318, 185], [385, 198]],
    cold: [[205, 135], [192, 190], [160, 238], [112, 272]],
    fade: 1,
  },
  {
    c: [208, 122],
    p: 988,
    occl: [[208, 122], [228, 140], [244, 168]],
    warm: [[244, 168], [290, 190], [335, 205], [390, 214]],
    cold: [[244, 168], [228, 218], [198, 258], [160, 292]],
    fade: 1,
  },
  {
    c: [200, 112],
    p: 980,
    occl: [[200, 112], [250, 130], [272, 198]],
    warm: [[272, 198], [310, 214], [348, 225], [392, 232]],
    cold: [[272, 198], [254, 245], [232, 278], [210, 305]],
    fade: 1,
  },
  {
    c: [196, 108],
    p: 998,
    occl: [[196, 108], [256, 112], [290, 190]],
    warm: [[290, 190], [318, 202], [342, 210], [366, 216]],
    cold: [[290, 190], [280, 222], [268, 246], [256, 268]],
    fade: 0.35,
  },
];

const STAGES: [string, string][] = [
  ['стационарен фронт', 'Студен полярен въздух на север и топъл на юг текат в противоположни посоки покрай почти неподвижен фронт.'],
  ['вълна', 'Фронтът се огъва: на изток от огъването топлият въздух напредва на север (топъл фронт), на запад студеният – на юг (студен фронт). Налягането във върха на вълната пада.'],
  ['млад циклон', 'Циклонът се задълбочава. Между двата фронта е топлият сектор. Пред топлия фронт има широка ивица продължителни валежи, на студения – тясна ивица от порои и гръмотевици.'],
  ['начало на оклузията', 'Студеният фронт се движи по-бързо и настига топлия. Там, където са се съединили, топлият въздух е изтласкан нагоре – това е оклудираният фронт.'],
  ['оклудиран циклон', 'Циклонът е най-дълбок. Топлият сектор е откъснат от центъра и все по-голяма част от циклона е запълнена със студен въздух.'],
  ['затихване', 'При земята вече няма топъл въздух, който да се издига. Налягането в центъра расте, циклонът се „запълва“ и затихва.'],
];

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

const frameAt = (s: number): Frame => {
  const i = Math.min(FRAMES.length - 2, Math.floor(s));
  const k = s - i;
  const A = FRAMES[i];
  const B = FRAMES[i + 1];
  return {
    c: lerpP(A.c, B.c, k),
    p: lerp(A.p, B.p, k),
    occl: A.occl.map((q, j) => lerpP(q, B.occl[j], k)) as Frame['occl'],
    warm: A.warm.map((q, j) => lerpP(q, B.warm[j], k)) as Frame['warm'],
    cold: A.cold.map((q, j) => lerpP(q, B.cold[j], k)) as Frame['cold'],
    fade: lerp(A.fade, B.fade, k),
  };
};

const path = (pts: P[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');

/** Точки през равни разстояния по начупена линия, с посоката в тях. */
const along = (pts: P[], step: number, offset = step / 2) => {
  const out: { p: P; d: P }[] = [];
  let next = offset;
  let run = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 1e-6) continue;
    while (next <= run + len) {
      const k = (next - run) / len;
      out.push({ p: [ax + (bx - ax) * k, ay + (by - ay) * k], d: [(bx - ax) / len, (by - ay) / len] });
      next += step;
    }
    run += len;
  }
  return out;
};

// Символите сочат наляво от посоката на линията: (dy, −dx)
const triangle = ({ p: [x, y], d: [dx, dy] }: { p: P; d: P }, flip = false) => {
  const s = flip ? -1 : 1;
  const nx = dy * s;
  const ny = -dx * s;
  return `M${x - dx * 6} ${y - dy * 6}L${x + nx * 9} ${y + ny * 9}L${x + dx * 6} ${y + dy * 6}Z`;
};
const semicircle = ({ p: [x, y], d: [dx, dy] }: { p: P; d: P }, flip = false) => {
  const sweep = flip ? 0 : 1;
  return `M${x - dx * 6} ${y - dy * 6}A6 6 0 0 ${sweep} ${x + dx * 6} ${y + dy * 6}Z`;
};

const MAP_X = 0;
const MAP_W = 400;
const MAP_H = 300;

/** Животът на средноширинния циклон по норвежкия модел – от вълна по фронта до оклузия и затихване. */
export default function CycloneLab() {
  const [s, setS] = useState(2);
  const f = frameAt(s);
  const stage = Math.min(5, Math.round(s));
  const stationary = s < 0.5;

  // Изобари: p(r) = pc + Δ(1 − e^{−r²/R²}), Δ = 1022 − pc
  const delta = 1022 - f.p;
  const R = 120;
  const levels: number[] = [];
  for (let q = Math.ceil((f.p + 0.5) / 4) * 4; q <= 1020; q += 4) levels.push(q);
  const radius = (q: number) => R * Math.sqrt(-Math.log(1 - (q - f.p) / delta));

  const warmSector = s >= 0.5 && s < 4.6 ? `${path([...f.warm, [f.warm[3][0], 300], [f.cold[3][0], 300], ...[...f.cold].reverse()])}Z` : '';
  const op = f.fade;
  const front = (pts: P[], kind: 'warm' | 'cold' | 'occl') =>
    along(pts, 24).map((m, i) =>
      kind === 'warm' ? (
        <path key={i} d={semicircle(m)} className="fill-red-600" />
      ) : kind === 'cold' ? (
        <path key={i} d={triangle(m)} className="fill-blue-600" />
      ) : i % 2 ? (
        <path key={i} d={semicircle(m)} className="fill-purple-600" />
      ) : (
        <path key={i} d={triangle(m)} className="fill-purple-600" />
      )
    );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="cy-map">
            <rect x={MAP_X} y={0} width={MAP_W} height={MAP_H} />
          </clipPath>
        </defs>
        <rect x={MAP_X} y={0} width={MAP_W} height={MAP_H} className="fill-sky-50 dark:fill-slate-900" />
        <g clipPath="url(#cy-map)">
          {/* студен въздух на север, топъл на юг */}
          {stationary && <rect x={0} y={150} width={400} height={150} className="fill-rose-100 dark:fill-rose-950/50" />}
          {warmSector && <path d={warmSector} className="fill-rose-100 dark:fill-rose-950/50" opacity={op} />}
          {levels.map(q => {
            const r = radius(q);
            return (
              <g key={q}>
                <ellipse cx={f.c[0]} cy={f.c[1]} rx={r * 1.25} ry={r} fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1" />
                <text x={f.c[0]} y={f.c[1] - r + 10} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                  {q}
                </text>
              </g>
            );
          })}
          <g opacity={op}>
            {stationary ? (
              <>
                <line x1={0} y1={150} x2={400} y2={150} className="stroke-gray-500" strokeWidth="2.5" />
                {along(
                  [
                    [0, 150],
                    [400, 150],
                  ],
                  24
                ).map((m, i) =>
                  i % 2 ? (
                    <path key={i} d={semicircle(m)} className="fill-red-600" />
                  ) : (
                    <path key={i} d={triangle(m, true)} className="fill-blue-600" />
                  )
                )}
              </>
            ) : (
              <>
                <path d={path(f.warm)} fill="none" className="stroke-red-600" strokeWidth="2.5" />
                {front(f.warm, 'warm')}
                <path d={path(f.cold)} fill="none" className="stroke-blue-600" strokeWidth="2.5" />
                {front(f.cold, 'cold')}
                <path d={path(f.occl)} fill="none" className="stroke-purple-600" strokeWidth="2.5" />
                {front(f.occl, 'occl')}
              </>
            )}
          </g>
          {stationary && (
            <>
              <text x={20} y={60} fontSize="12" className="fill-sky-800 dark:fill-sky-200">
                ← студен полярен въздух
              </text>
              <text x={250} y={250} fontSize="12" className="fill-rose-800 dark:fill-rose-200">
                топъл въздух →
              </text>
            </>
          )}
          {!stationary && (
            <text x={f.c[0]} y={f.c[1] + 7} fontSize="20" fontWeight="bold" textAnchor="middle" className="fill-red-700 dark:fill-red-400">
              Н
            </text>
          )}
          {s >= 1.5 && s < 4.6 && (
            <text x={(f.warm[1][0] + f.cold[2][0]) / 2 + 10} y={f.cold[2][1]} fontSize="10" textAnchor="middle" className="fill-rose-800 dark:fill-rose-200">
              топъл сектор
            </text>
          )}
        </g>
        <rect x={MAP_X} y={0} width={MAP_W} height={MAP_H} fill="none" className="stroke-gray-400" />
        <text x={MAP_W - 6} y={14} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          С ↑
        </text>

        {/* Легенда */}
        <g transform="translate(418 20)" fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          <line x1={0} y1={0} x2={34} y2={0} className="stroke-red-600" strokeWidth="2.5" />
          <path d={semicircle({ p: [17, 0], d: [1, 0] })} className="fill-red-600" />
          <text x={42} y={4}>топъл фронт</text>
          <line x1={0} y1={26} x2={34} y2={26} className="stroke-blue-600" strokeWidth="2.5" />
          <path d={triangle({ p: [17, 26], d: [1, 0] })} className="fill-blue-600" />
          <text x={42} y={30}>студен фронт</text>
          <line x1={0} y1={52} x2={34} y2={52} className="stroke-purple-600" strokeWidth="2.5" />
          <path d={triangle({ p: [10, 52], d: [1, 0] })} className="fill-purple-600" />
          <path d={semicircle({ p: [25, 52], d: [1, 0] })} className="fill-purple-600" />
          <text x={42} y={56}>оклудиран фронт</text>
          <line x1={0} y1={78} x2={34} y2={78} className="stroke-gray-500" strokeWidth="2.5" />
          <path d={triangle({ p: [10, 78], d: [1, 0] }, true)} className="fill-blue-600" />
          <path d={semicircle({ p: [25, 78], d: [1, 0] }, true)} className="fill-red-600" />
          <text x={42} y={82}>стационарен</text>
          <ellipse cx={17} cy={104} rx={15} ry={8} fill="none" className="stroke-gray-500" />
          <text x={42} y={108}>изобари през 4 hPa</text>
          <text x={0} y={140} fontSize="12" fontWeight="bold">
            {stage + 1}. {STAGES[stage][0]}
          </text>
          <text x={0} y={162} className="fill-gray-600 dark:fill-gray-300">
            налягане в центъра: {fmt(f.p)} hPa
          </text>
          <text x={0} y={184} className="fill-gray-600 dark:fill-gray-300">
            Символите сочат накъдето
          </text>
          <text x={0} y={198} className="fill-gray-600 dark:fill-gray-300">
            се движи фронтът.
          </text>
          <text x={0} y={220} className="fill-gray-600 dark:fill-gray-300">
            Целият живот на циклона
          </text>
          <text x={0} y={234} className="fill-gray-600 dark:fill-gray-300">
            трае обикновено няколко дни.
          </text>
        </g>
      </LabSvg>
      <Sliders>
        <Slider label="стадий" value={s} onChange={setS} min={0} max={5} step={0.05} tone="violet" />
      </Sliders>
      <Buttons>
        {STAGES.map(([name], i) => (
          <DiagramButton key={name} active={Math.abs(s - i) < 0.01} onClick={() => setS(i)}>
            {i + 1}. {name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стадий', value: `${stage + 1} от 6`, tone: 'violet' },
            { label: 'в центъра', value: `${fmt(f.p)} hPa`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="violet">{STAGES[stage][1]}</Note>
    </div>
  );
}
