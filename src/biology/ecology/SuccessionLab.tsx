import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mode = 'primary' | 'secondary';

/** Гладко 0 → 1 между 0 и 1. */
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** Обилие на група: расте от a до p, после намалява до остатъка rest при b. */
const bump = (t: number, a: number, p: number, b: number, rest: number) => (t <= p ? smooth((t - a) / (p - a)) : 1 - (1 - rest) * smooth((t - p) / (b - p)));

type Group = { key: string; name: string; color: string; n: number; species: number; mass: number; f: Record<Mode, (t: number) => number> };

/** Групите растения; числата за времето са ориентировъчни. */
const GROUPS: Group[] = [
  { key: 'lichen', name: 'лишеи', color: '#f59e0b', n: 10, species: 6, mass: 0.1, f: { primary: t => bump(t, -1, 30, 260, 0.1), secondary: () => 0 } },
  { key: 'moss', name: 'мъхове', color: '#65a30d', n: 10, species: 8, mass: 0.3, f: { primary: t => bump(t, 15, 90, 420, 0.15), secondary: () => 0 } },
  { key: 'weed', name: 'едногодишни плевели', color: '#e11d48', n: 12, species: 25, mass: 1, f: { primary: () => 0, secondary: t => bump(t, 0, 1, 7, 0) } },
  { key: 'herb', name: 'многогодишни треви', color: '#10b981', n: 14, species: 35, mass: 3, f: { primary: t => bump(t, 60, 180, 520, 0.15), secondary: t => bump(t, 0.5, 6, 35, 0.15) } },
  { key: 'shrub', name: 'храсти', color: '#8b5cf6', n: 6, species: 12, mass: 20, f: { primary: t => bump(t, 150, 300, 620, 0.1), secondary: t => bump(t, 5, 18, 60, 0.1) } },
  { key: 'pioneer', name: 'светлолюбиви дървета', color: '#38bdf8', n: 4, species: 6, mass: 80, f: { primary: t => bump(t, 250, 420, 760, 0.15), secondary: t => bump(t, 12, 40, 110, 0.15) } },
  { key: 'climax', name: 'сенкоиздръжливи дървета', color: '#166534', n: 4, species: 6, mass: 250, f: { primary: t => smooth((t - 380) / 380), secondary: t => smooth((t - 30) / 90) } },
];

const TMAX: Record<Mode, number> = { primary: 800, secondary: 150 };

/** Етапите – за надписа над картинката. */
const STAGES: Record<Mode, [number, string][]> = {
  primary: [
    [0, 'гола скала – няма почва'],
    [15, 'лишеи: разяждат скалата, по пукнатините се събира прах и органика'],
    [70, 'мъхове: задържат вода, образува се тънък слой почва'],
    [150, 'треви и цъфтящи растения'],
    [250, 'храсти'],
    [380, 'светлолюбиви дървета'],
    [560, 'сенкоиздръжлива гора – климакс'],
  ],
  secondary: [
    [0, 'гола почва – семената вече са в нея'],
    [1, 'едногодишни плевели'],
    [4, 'многогодишни треви и тревисти растения'],
    [14, 'храсти – шипка, глог, трънка, къпина'],
    [30, 'светлолюбиви дървета – бреза, трепетлика'],
    [80, 'сенкоиздръжлива (например дъбова) гора – климакс'],
  ],
};

/** Детерминирани места за растенията. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const SPOTS = GROUPS.map((g, k) => {
  const r = rng(77 + k * 3571);
  return Array.from({ length: g.n }, () => 30 + r() * 580);
});

const GROUND = 200;
const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');

function Plant({ g, x, a, soil }: { g: Group; x: number; a: number; soil: number }) {
  const y = GROUND - soil;
  const s = 0.4 + 0.6 * a;
  switch (g.key) {
    case 'lichen':
      return <ellipse cx={x} cy={y - 2} rx={7 * s} ry={3} fill={g.color} opacity={0.85} />;
    case 'moss':
      return <ellipse cx={x} cy={y - 3} rx={9 * s} ry={5 * s} fill={g.color} />;
    case 'weed':
      return (
        <g>
          <line x1={x} y1={y} x2={x} y2={y - 16 * s} stroke="#4d7c0f" strokeWidth={1.5} />
          <circle cx={x} cy={y - 17 * s} r={3} fill={g.color} />
        </g>
      );
    case 'herb':
      return (
        <g stroke={g.color} strokeWidth={2} strokeLinecap="round">
          <line x1={x} y1={y} x2={x - 5} y2={y - 22 * s} />
          <line x1={x} y1={y} x2={x} y2={y - 26 * s} />
          <line x1={x} y1={y} x2={x + 5} y2={y - 20 * s} />
        </g>
      );
    case 'shrub':
      return <circle cx={x} cy={y - 16 * s} r={17 * s} fill={g.color} opacity={0.85} />;
    case 'pioneer':
      return (
        <g>
          <rect x={x - 2.5} y={y - 90 * s} width={5} height={90 * s} fill="#e5e7eb" stroke="#6b7280" strokeWidth={0.8} />
          <ellipse cx={x} cy={y - 95 * s} rx={16 * s} ry={30 * s} fill={g.color} opacity={0.8} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={x - 5} y={y - 95 * s} width={10} height={95 * s} fill="#78350f" />
          <ellipse cx={x} cy={y - 105 * s} rx={38 * s} ry={30 * s} fill={g.color} opacity={0.92} />
        </g>
      );
  }
}

// графика на обилието
const PX0 = 50;
const PX1 = 620;
const PY0 = 400;
const PY1 = 260;

/** Сукцесия: от гола скала (първична) или изоставена нива (вторична) до климаксно съобщество. */
export default function SuccessionLab() {
  const [mode, setMode] = useState<Mode>('secondary');
  const [t, setT] = useState(0);
  const tmax = TMAX[mode];

  const ab = GROUPS.map(g => Math.max(0, g.f[mode](t)));
  const soil = mode === 'secondary' ? 14 : 2 + 12 * smooth(t / 600);
  const stage = [...STAGES[mode]].reverse().find(([s]) => t >= s)?.[1] ?? '';

  const richness = GROUPS.reduce((s, g, k) => s + g.species * Math.min(1, ab[k] * 2), 0);
  const maxRich = Math.max(...Array.from({ length: 161 }, (_, i) => GROUPS.reduce((s, g) => s + g.species * Math.min(1, Math.max(0, g.f[mode]((i / 160) * tmax)) * 2), 0)));
  const biomass = GROUPS.reduce((s, g, k) => s + g.mass * ab[k], 0);
  const maxMass = GROUPS.reduce((s, g) => s + g.mass * Math.max(0, g.f[mode](tmax)), 0);

  const px = (v: number) => PX0 + (v / tmax) * (PX1 - PX0);
  const py = (v: number) => PY0 - v * (PY0 - PY1);
  const path = (f: (u: number) => number) =>
    Array.from({ length: 161 }, (_, i) => {
      const u = (i / 160) * tmax;
      return `${i ? 'L' : 'M'} ${px(u).toFixed(1)} ${py(Math.max(0, f(u))).toFixed(1)}`;
    }).join(' ');

  // кои групи се рисуват отпред: дърветата отзад
  const order = [6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 440" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={10} y={10} width={620} height={GROUND - 10} rx={6} className="fill-sky-50 dark:fill-slate-900" />
        <text x={320} y={30} fontSize="13" fontWeight="700" textAnchor="middle" fill="currentColor">
          {fmt(t)} г.: {stage}
        </text>
        {/* скала и почва */}
        <rect x={10} y={GROUND} width={620} height={30} fill="#9ca3af" />
        <rect x={10} y={GROUND - soil} width={620} height={soil} fill="#7c4a1e" opacity={0.85} />
        {order.map(k =>
          SPOTS[k].slice(0, Math.round(ab[k] * GROUPS[k].n)).map((x, j) => <Plant key={`${k}-${j}`} g={GROUPS[k]} x={x} a={ab[k]} soil={soil} />)
        )}

        {/* обилие на групите */}
        <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke="currentColor" />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke="currentColor" />
        {Array.from({ length: 6 }, (_, k) => (k * tmax) / 5).map(v => (
          <text key={v} x={px(v)} y={PY0 + 15} fontSize="11" textAnchor="middle" fill="currentColor">{fmt(v)}</text>
        ))}
        <text x={PX1} y={PY0 + 32} fontSize="12" textAnchor="end" fill="currentColor">години</text>
        <text x={PX0 - 6} y={PY1 + 4} fontSize="11" textAnchor="end" fill="currentColor">обилие</text>
        {GROUPS.map((g, k) => (g.f[mode](tmax / 2) > 0 || g.f[mode](tmax) > 0 || g.f[mode](tmax / 50) > 0 ? <path key={g.key} d={path(g.f[mode])} fill="none" stroke={g.color} strokeWidth={2.5} opacity={ab[k] > 0.02 ? 1 : 0.45} /> : null))}
        <line x1={px(t)} y1={PY1 - 6} x2={px(t)} y2={PY0} stroke="currentColor" strokeDasharray="4 3" />
      </LabSvg>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2">
        {GROUPS.filter(g => g.f[mode](tmax / 2) > 0 || g.f[mode](tmax) > 0 || g.f[mode](tmax / 50) > 0).map(g => (
          <span key={g.key} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: g.color }} /> {g.name}
          </span>
        ))}
      </div>

      <Buttons>
        <DiagramButton
          active={mode === 'secondary'}
          onClick={() => {
            setMode('secondary');
            setT(0);
          }}
        >
          изоставена нива (вторична)
        </DiagramButton>
        <DiagramButton
          active={mode === 'primary'}
          onClick={() => {
            setMode('primary');
            setT(0);
          }}
        >
          гола скала (първична)
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setMode('secondary');
            setT(0);
          }}
        >
          🔥 пожар
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="години" value={t} onChange={setT} min={0} max={tmax} step={mode === 'primary' ? 5 : 1} tone="emerald" />
      </Sliders>
      <Readout
        items={[
          { label: 'видове растения (отн.)', value: `${fmt((richness / maxRich) * 100)} %`, tone: 'violet' },
          { label: 'биомаса (отн.)', value: `${fmt((biomass / maxMass) * 100)} %`, tone: 'emerald' },
          { label: 'почва', value: soil < 4 ? 'почти няма' : soil < 10 ? 'тънка' : 'развита', tone: 'amber' },
        ]}
      />
      <Note tone="emerald">
        {mode === 'secondary'
          ? 'Вторичната сукцесия започва върху готова почва, пълна със семена и корени, затова гората се връща за десетилетия до около век и половина.'
          : 'Първичната сукцесия започва без почва: пионерите (лишеи, мъхове) първо я създават. Затова тя трае стотици, а понякога и хиляди години.'}{' '}
        Броят на видовете е най-голям в средата на сукцесията, когато се срещат растения и от ранните, и от късните етапи; биомасата расте
        почти до края.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Етапите и годините са ориентировъчни – за ниските части на България. Скоростта зависи от климата, почвата, наличието на семена
        наблизо и от животните. Климаксът не е вечно неподвижен: бури, пожари и болести непрекъснато отварят „прозорци“, в които
        сукцесията започва отначало.
      </p>
    </div>
  );
}
