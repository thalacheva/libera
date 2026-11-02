import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { type Tone } from '~/geometry/diagramMath';
import { fmt } from '../geo';

const W = 640;
const H = 400;
const CX = W / 2;
const CY = H / 2;
const S = 34; // разстояние между най-малките селища в чертежа

/**
 * Системите на Кристалер. Селищата са в триъгълна мрежа z = i + j·ω (ω = e^{iπ/3}).
 * Центровете от по-висок ред са кратни на w = m + n·ω, |w|² = m² + mn + n² = K.
 */
const SYSTEMS = [
  { K: 3, m: 1, n: 1, name: 'K = 3', title: 'пазарен принцип', why: 'всяко село е на границата между 3 центъра и пазарува по равно при всеки от тях' },
  { K: 4, m: 2, n: 0, name: 'K = 4', title: 'транспортен принцип', why: 'селата са по пътищата между центровете – максимум селища на прави пътища' },
  { K: 7, m: 2, n: 1, name: 'K = 7', title: 'административен принцип', why: 'всяко село принадлежи изцяло на един център – удобно за управление' },
];

type C = [number, number];
const mul = ([a, b]: C, [c, d]: C): C => [a * c - b * d, a * d + b * c];
const div = ([a, b]: C, [c, d]: C): C => {
  const q = c * c + d * d;
  return [(a * c + b * d) / q, (b * c - a * d) / q];
};
const OMEGA: C = [0.5, Math.sqrt(3) / 2];
/** Точка от мрежата по координати (i, j). */
const lat = (i: number, j: number): C => [i + j * OMEGA[0], j * OMEGA[1]];
/** Дали z е кратно на w в мрежата (Айзенщайнови цели числа). */
function divisible(z: C, w: C) {
  const [x, y] = div(z, w);
  const j = y / OMEGA[1];
  const i = x - j * OMEGA[0];
  return Math.abs(i - Math.round(i)) < 1e-6 && Math.abs(j - Math.round(j)) < 1e-6;
}

const ORDER_STYLE = [
  { r: 3, cls: 'fill-gray-500 dark:fill-gray-400', hex: 'stroke-gray-300 dark:stroke-gray-600', label: 'село' },
  { r: 6, cls: 'fill-sky-600 dark:fill-sky-400', hex: 'stroke-sky-500', label: 'малък град' },
  { r: 9, cls: 'fill-violet-600 dark:fill-violet-400', hex: 'stroke-violet-500', label: 'среден град' },
  { r: 12, cls: 'fill-rose-600 dark:fill-rose-400', hex: 'stroke-rose-500', label: 'голям град' },
];

/** Теорията на централните места: шестоъгълни пазарни зони на няколко реда. */
export default function CentralPlaceLab() {
  const [si, setSi] = useState(0);
  const [levels, setLevels] = useState(3);
  const [d, setD] = useState(7);

  const sys = SYSTEMS[si];
  const w: C = lat(sys.m, sys.n);
  const powers: C[] = [[1, 0]];
  for (let o = 1; o < 4; o++) powers.push(mul(powers[o - 1], w));

  // Селищата и редът на всяко – най-високата степен на w, на която е кратно
  const places: { x: number; y: number; order: number }[] = [];
  for (let i = -16; i <= 16; i++)
    for (let j = -14; j <= 14; j++) {
      const z = lat(i, j);
      const x = CX + z[0] * S;
      const y = CY - z[1] * S;
      if (x < -S || x > W + S || y < -S || y > H + S) continue;
      let order = 0;
      while (order < levels - 1 && divisible(z, powers[order + 1])) order++;
      places.push({ x, y, order });
    }

  // Пазарната зона на център от ред o – шестоъгълникът на Вороной за мрежата w^o
  const hex = (x: number, y: number, o: number) => {
    const p = powers[o];
    const len = Math.hypot(p[0], p[1]) * S;
    const ang = Math.atan2(p[1], p[0]);
    const rad = len / Math.sqrt(3);
    return Array.from({ length: 6 }, (_, k) => {
      const a = ang + Math.PI / 6 + (k * Math.PI) / 3;
      return `${k ? 'L' : 'M'}${(x + rad * Math.cos(a)).toFixed(1)} ${(y - rad * Math.sin(a)).toFixed(1)}`;
    }).join(' ') + 'Z';
  };

  const dist = (o: number) => d * Math.sqrt(sys.K) ** o;
  const area = (o: number) => ((Math.sqrt(3) / 2) * dist(o) ** 2); // площ на шестоъгълника с разстояние dist между центровете
  const counts = Array.from({ length: levels }, (_, o) => places.filter(p => p.order === o).length);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="cpl-clip">
            <rect x="0" y="0" width={W} height={H} rx="8" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width={W} height={H} rx="8" className="fill-emerald-50 dark:fill-gray-900" />
        <g clipPath="url(#cpl-clip)">
          {Array.from({ length: levels }, (_, o) =>
            places
              .filter(p => p.order >= o)
              .map((p, i) => (
                <path
                  key={`${o}-${i}`}
                  d={hex(p.x, p.y, o)}
                  fill="none"
                  className={ORDER_STYLE[o].hex}
                  strokeWidth={o === 0 ? 0.7 : 1.2 + o * 0.6}
                />
              ))
          )}
          {places.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={ORDER_STYLE[p.order].r} className={`${ORDER_STYLE[p.order].cls} stroke-white dark:stroke-gray-900`} strokeWidth="1.5" />
          ))}
        </g>
        <g transform="translate(10, 10)">
          <rect width="128" height={12 + levels * 20} rx="6" className="fill-white/90 dark:fill-gray-800/90" />
          {ORDER_STYLE.slice(0, levels).map((s, o) => (
            <g key={o} transform={`translate(18, ${18 + o * 20})`}>
              <circle r={Math.min(s.r, 7)} className={s.cls} />
              <text x="16" y="4" fontSize="11" className="fill-gray-700 dark:fill-gray-200">
                {s.label}
              </text>
            </g>
          ))}
        </g>
      </LabSvg>
      <Buttons>
        {SYSTEMS.map((s, i) => (
          <DiagramButton key={s.K} active={i === si} onClick={() => setSi(i)}>
            {s.name} – {s.title}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="редове" value={levels} onChange={setLevels} min={1} max={4} step={1} tone="violet" />
        <Slider label="d, km" value={d} onChange={setD} min={3} max={15} step={0.5} tone="emerald" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        d – разстоянието между съседни села. Всеки шестоъгълник е пазарната зона на център: колкото по-рядка е услугата (болница, университет), толкова
        по-голяма зона ѝ трябва, за да събере достатъчно клиенти (прага).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            ...Array.from({ length: levels - 1 }, (_, o) => ({
              label: ORDER_STYLE[o + 1].label,
              value: `през ${fmt(dist(o + 1), 1)} km, зона ${fmt(area(o + 1), 0)} km²`,
              tone: (['blue', 'violet', 'rose'] as Tone[])[o],
            })),
            { label: 'на екрана', value: counts.map(c => fmt(c)).join(' : '), tone: 'emerald' as Tone },
          ]}
        />
      </div>
      <Note tone="violet">
        {sys.name}: зоната на всеки център побира колкото {sys.K} зони от по-нисък ред, заедно с неговата собствена – {sys.why}. При всеки следващ ред разстоянието расте √{sys.K} ≈{' '}
        {fmt(Math.sqrt(sys.K), 2)} пъти, а зоната – {sys.K} пъти.
      </Note>
    </div>
  );
}
