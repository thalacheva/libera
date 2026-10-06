import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  DEG,
  EAST,
  NADIR,
  NORTH,
  SOUTH,
  STAR_KIND_COLORS,
  STAR_KIND_LABELS,
  WEST,
  ZENITH,
  eclipticToHorizon,
  equatorialFrame,
  formatHours,
  raDecToHorizon,
  scale,
  splitRuns,
  starKind,
  type Vec3,
} from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';
import { circlePoints, useSphereView } from './useSphereView';

const WIDTH = 600;
const HEIGHT = 520;
const CX = 300;
const CY = 260;
const R = 190;

const DEFAULT_VIEW = { azimuth: -115, elevation: 16 };

const COLORS = {
  sphere: 'rgb(59, 130, 246)',
  horizon: 'rgb(34, 197, 94)',
  meridian: 'rgb(239, 68, 68)',
  equator: 'rgb(168, 85, 247)',
  ecliptic: 'rgb(245, 158, 11)',
  axis: 'rgb(100, 116, 139)',
  zenith: 'rgb(59, 130, 246)',
  observer: 'rgb(234, 179, 8)',
};

const LOCATIONS = [
  { label: '🇧🇬 София', latitude: 43 },
  { label: '🌍 Екватор', latitude: 0 },
  { label: '🧭 Северен полюс', latitude: 90 },
  { label: '🇬🇧 Лондон', latitude: 51 },
  { label: '🇦🇺 Сидни', latitude: -34 },
];

// Примерни звезди за денонощните успоредници
const SAMPLE_STARS = [
  { ra: 2, dec: 75 },
  { ra: 9, dec: 40 },
  { ra: 15, dec: 0 },
  { ra: 20, dec: -30 },
  { ra: 5, dec: -72 },
];

type ElementId =
  | 'horizon'
  | 'meridian'
  | 'equator'
  | 'ecliptic'
  | 'axis'
  | 'zenith'
  | 'nadir'
  | 'north'
  | 'south'
  | 'cardinal'
  | 'observer'
  | 'vernal'
  | 'autumnal'
  | 'summer'
  | 'winter'
  | 'parallels';

const CHIPS: { id: ElementId; label: string; color: string }[] = [
  { id: 'horizon', label: 'Хоризонт', color: COLORS.horizon },
  { id: 'meridian', label: 'Небесен меридиан', color: COLORS.meridian },
  { id: 'equator', label: 'Небесен екватор', color: COLORS.equator },
  { id: 'ecliptic', label: 'Еклиптика', color: COLORS.ecliptic },
  { id: 'axis', label: 'Ос на света', color: COLORS.axis },
  { id: 'zenith', label: 'Зенит Z', color: COLORS.zenith },
  { id: 'nadir', label: "Надир Z'", color: COLORS.axis },
  { id: 'north', label: 'Полюс P', color: COLORS.meridian },
  { id: 'south', label: "Полюс P'", color: COLORS.meridian },
  { id: 'cardinal', label: 'С, Ю, И, З', color: COLORS.horizon },
  { id: 'vernal', label: '♈ Пролетна точка', color: COLORS.horizon },
  { id: 'autumnal', label: '♎ Есенна точка', color: 'rgb(249, 115, 22)' },
  { id: 'summer', label: '☀️ Лятно слънцестоене', color: COLORS.ecliptic },
  { id: 'winter', label: '❄️ Зимно слънцестоене', color: 'rgb(96, 165, 250)' },
];

export default function CelestialSphere() {
  const [latitude, setLatitude] = useState(43);
  const [sidereal, setSidereal] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [showEcliptic, setShowEcliptic] = useState(true);
  const [showParallels, setShowParallels] = useState(false);
  const [hovered, setHovered] = useState<ElementId | null>(null);
  const [selected, setSelected] = useState<ElementId | null>(null);

  useAnimationFrame(playing, dt => setSidereal(s => (s + dt * 1.5) % 24));

  const active = hovered ?? selected;

  const { project, resetView, dragHandlers } = useSphereView(
    DEFAULT_VIEW,
    { x: CX, y: CY },
    R
  );

  const { pole, q } = equatorialFrame(latitude);
  const southPole = scale(pole, -1);

  const horizonPts = circlePoints(t => [Math.cos(t), Math.sin(t), 0]);
  const meridianPts = circlePoints(t => [Math.cos(t), 0, Math.sin(t)]);
  const equatorPts = circlePoints(t => [
    q[0] * Math.cos(t),
    -Math.sin(t),
    q[2] * Math.cos(t),
  ]);
  const eclipticPts = circlePoints(t =>
    eclipticToHorizon(latitude, sidereal, t / DEG)
  );

  const ecl = (longitude: number) =>
    eclipticToHorizon(latitude, sidereal, longitude);

  // Дъга φ: от точката на хоризонта до издигнатия полюс
  const elevatedSign = latitude >= 0 ? -1 : 1;
  const phiArc = circlePoints(
    t => scale([elevatedSign * Math.cos(t), 0, Math.sin(t)], 0.3),
    0,
    Math.abs(latitude)
  );
  const phiLabel = project(
    scale(
      [
        elevatedSign * Math.cos((Math.abs(latitude) / 2) * DEG),
        0,
        Math.sin((Math.abs(latitude) / 2) * DEG),
      ],
      0.42
    )
  );

  const opacityFor = (id: ElementId) =>
    active === null || active === id ? 1 : 0.25;
  const widthFor = (id: ElementId, base: number) =>
    active === id ? base + 2 : base;

  const interactive = (id: ElementId) => ({
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered(null),
    onClick: () => setSelected(s => (s === id ? null : id)),
    className: 'cursor-pointer',
  });

  const curve = (
    id: ElementId,
    points: Vec3[],
    color: string,
    width = 2.5,
    extraKey?: (v: Vec3) => boolean
  ) => {
    const runs = splitRuns(
      points.map(p => ({ v: p, s: project(p) })),
      p => `${p.s.front}|${extraKey ? extraKey(p.v) : true}`
    );
    return (
      <g opacity={opacityFor(id)} {...interactive(id)}>
        {/* Широка прозрачна линия, за да се посочва по-лесно */}
        <path
          d={runs
            .map(r => 'M' + r.points.map(p => `${p.s.x},${p.s.y}`).join(' L'))
            .join(' ')}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
        />
        {runs.map((r, i) => {
          const [front, extra] = r.key.split('|');
          return (
            <path
              key={i}
              d={'M' + r.points.map(p => `${p.s.x},${p.s.y}`).join(' L')}
              fill="none"
              stroke={color}
              strokeWidth={front === 'true' ? widthFor(id, width) : 1.5}
              strokeDasharray={front === 'true' ? undefined : '5,5'}
              opacity={
                (front === 'true' ? 1 : 0.5) * (extra === 'true' ? 1 : 0.35)
              }
            />
          );
        })}
      </g>
    );
  };

  const point = (
    id: ElementId,
    v: Vec3,
    label: string,
    color: string,
    r = 6
  ) => {
    const p = project(v);
    const dx = p.x - CX;
    const dy = p.y - CY;
    const len = Math.hypot(dx, dy);
    const [ox, oy] = len > 20 ? [(dx / len) * 18, (dy / len) * 18] : [14, -10];
    return (
      <g opacity={opacityFor(id) * (p.front ? 1 : 0.55)} {...interactive(id)}>
        <circle
          cx={p.x}
          cy={p.y}
          r={active === id ? r + 3 : r}
          fill={p.front ? color : 'white'}
          stroke={color}
          strokeWidth="2"
        />
        <text
          x={p.x + ox}
          y={p.y + oy + 5}
          fontSize="14"
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
          className="select-none"
        >
          {label}
        </text>
      </g>
    );
  };

  const line = (a: Vec3, b: Vec3, color: string, id: ElementId) => {
    const pa = project(a);
    const pb = project(b);
    return (
      <line
        x1={pa.x}
        y1={pa.y}
        x2={pb.x}
        y2={pb.y}
        stroke={color}
        strokeWidth={widthFor(id, 2)}
        strokeDasharray="8,4"
        opacity={opacityFor(id) * 0.8}
        {...interactive(id)}
      />
    );
  };

  const horizonFill = horizonPts
    .map(p => project(p))
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
      {/* Контроли */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Географска ширина (φ): {Math.abs(latitude)}°
            {latitude > 0 ? ' с.ш.' : latitude < 0 ? ' ю.ш.' : ''}
          </label>
          <input
            type="range"
            min="-90"
            max="90"
            value={latitude}
            onChange={e => setLatitude(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>Южен полюс</span>
            <span>Екватор</span>
            <span>Северен полюс</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Въртене на небето (звездно време): {formatHours(sidereal)}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              aria-label={playing ? 'Пауза' : 'Пусни'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="24"
              step="0.05"
              value={sidereal}
              onChange={e => setSidereal(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Земята се върти → небесната сфера изглежда, че се върти около оста
            PP'
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-center gap-2 flex-wrap">
        {LOCATIONS.map(loc => (
          <button
            key={loc.label}
            onClick={() => setLatitude(loc.latitude)}
            className={`px-3 py-1 rounded text-sm border ${
              latitude === loc.latitude
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto cursor-grab active:cursor-grabbing"
          style={{ maxHeight: '520px', touchAction: 'pan-y' }}
          {...dragHandlers}
        >
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="rgba(59, 130, 246, 0.06)"
            stroke={COLORS.sphere}
            strokeWidth="1.5"
          />
          <polygon
            points={horizonFill}
            fill="rgba(34, 197, 94, 0.12)"
            opacity={opacityFor('horizon')}
          />

          {curve('horizon', horizonPts, COLORS.horizon, 3)}
          {curve('meridian', meridianPts, COLORS.meridian)}
          {curve('equator', equatorPts, COLORS.equator)}
          {showEcliptic && curve('ecliptic', eclipticPts, COLORS.ecliptic)}

          {showParallels &&
            SAMPLE_STARS.map(star => {
              const kind = starKind(latitude, star.dec);
              const color = STAR_KIND_COLORS[kind];
              const parallel = circlePoints(t =>
                raDecToHorizon(latitude, 0, -t / DEG / 15, star.dec)
              );
              const pos = project(
                raDecToHorizon(latitude, sidereal, star.ra, star.dec)
              );
              return (
                <g key={star.dec}>
                  {curve('parallels', parallel, color, 1.5, v => v[2] >= 0)}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                    opacity={pos.front ? 1 : 0.5}
                  />
                </g>
              );
            })}

          {/* Ос на света и вертикала */}
          {line(pole, southPole, COLORS.axis, 'axis')}
          {line(ZENITH, NADIR, COLORS.zenith, 'zenith')}

          {/* φ = височината на полюса */}
          {latitude !== 0 && (
            <g opacity={active === null ? 1 : 0.3}>
              <path
                d={
                  'M' +
                  phiArc
                    .map(project)
                    .map(p => `${p.x},${p.y}`)
                    .join(' L')
                }
                fill="none"
                stroke={COLORS.meridian}
                strokeWidth="2"
              />
              <text
                x={phiLabel.x}
                y={phiLabel.y + 5}
                fontSize="15"
                fontWeight="bold"
                fill={COLORS.meridian}
                textAnchor="middle"
                className="select-none"
              >
                φ
              </text>
            </g>
          )}

          {/* Точки */}
          {point('cardinal', NORTH, 'С', COLORS.horizon, 5)}
          {point('cardinal', SOUTH, 'Ю', COLORS.horizon, 5)}
          {point('cardinal', EAST, 'И', COLORS.horizon, 5)}
          {point('cardinal', WEST, 'З', COLORS.horizon, 5)}
          {point('zenith', ZENITH, 'Z', COLORS.zenith)}
          {point('nadir', NADIR, "Z'", COLORS.axis)}
          {point('north', pole, 'P', COLORS.meridian)}
          {point('south', southPole, "P'", COLORS.meridian)}
          {showEcliptic && (
            <>
              {point('vernal', ecl(0), '♈', COLORS.horizon)}
              {point('autumnal', ecl(180), '♎', 'rgb(249, 115, 22)')}
              {point('summer', ecl(90), '☀️', COLORS.ecliptic)}
              {point('winter', ecl(270), '❄️', 'rgb(96, 165, 250)')}
            </>
          )}

          <g opacity={opacityFor('observer')} {...interactive('observer')}>
            <circle
              cx={CX}
              cy={CY}
              r="7"
              fill={COLORS.observer}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        </svg>
        <button
          onClick={resetView}
          className="absolute top-0 right-0 flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RotateCcw size={12} /> Изглед
        </button>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          🖱️ Завъртете сферата с мишката. Пунктирът е задната половина на
          сферата.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 justify-center text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showEcliptic}
            onChange={e => setShowEcliptic(e.target.checked)}
          />
          Еклиптика
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showParallels}
            onChange={e => setShowParallels(e.target.checked)}
          />
          Денонощни пътища на звезди
        </label>
      </div>

      {showParallels && (
        <div className="mt-2 flex flex-wrap gap-4 justify-center text-xs">
          {(['circumpolar', 'rising', 'never'] as const).map(kind => (
            <span key={kind} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: STAR_KIND_COLORS[kind] }}
              />
              {STAR_KIND_LABELS[kind]}
            </span>
          ))}
        </div>
      )}

      {/* Намери на диаграмата */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {CHIPS.filter(
          c =>
            showEcliptic ||
            !['ecliptic', 'vernal', 'autumnal', 'summer', 'winter'].includes(
              c.id
            )
        ).map(chip => (
          <button
            key={chip.id}
            onPointerEnter={() => setHovered(chip.id)}
            onPointerLeave={() => setHovered(null)}
            onClick={() => setSelected(s => (s === chip.id ? null : chip.id))}
            className={`px-2 py-1 rounded-full text-xs border-2 transition-colors ${
              active === chip.id ? 'text-white' : ''
            }`}
            style={{
              borderColor: chip.color,
              background: active === chip.id ? chip.color : undefined,
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[140px]">
        {active ? (
          <ElementInfo id={active} latitude={latitude} />
        ) : (
          <LatitudeSummary latitude={latitude} />
        )}
      </div>
    </div>
  );
}

function LatitudeSummary({ latitude }: { latitude: number }) {
  const abs = Math.abs(latitude);
  const north = latitude >= 0;
  return (
    <div className="text-sm space-y-1">
      <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
        Наблюдател на φ = {abs}° {north ? 'с.ш.' : 'ю.ш.'}
      </h4>
      {abs === 0 && (
        <>
          <p>• Двата полюса P и P' лежат на хоризонта – в точките С и Ю.</p>
          <p>• Небесният екватор минава през зенита.</p>
          <p>
            • Всички звезди изгряват и залязват, като се издигат перпендикулярно
            на хоризонта. Няма незалязващи звезди.
          </p>
        </>
      )}
      {abs === 90 && (
        <>
          <p>
            • Полюсът {north ? 'P' : "P'"} съвпада със зенита, а небесният
            екватор – с хоризонта.
          </p>
          <p>
            • Звездите обикалят по кръгове, успоредни на хоризонта: видимите
            никога не залязват, а другите никога не изгряват.
          </p>
        </>
      )}
      {abs > 0 && abs < 90 && (
        <>
          <p>
            • Полюсът {north ? 'P' : "P'"} е на височина{' '}
            <strong>h = φ = {abs}°</strong> над точката {north ? 'С' : 'Ю'}.
          </p>
          <p>• Небесният екватор сключва ъгъл {90 - abs}° с хоризонта.</p>
          <p>
            • Незалязващи са звездите с δ {north ? '>' : '<'}{' '}
            {north ? '+' : '−'}
            {90 - abs}°.
          </p>
          <p>
            • Никога не изгряват звездите с δ {north ? '<' : '>'}{' '}
            {north ? '−' : '+'}
            {90 - abs}°.
          </p>
        </>
      )}
      <p className="text-xs italic pt-2 text-gray-600 dark:text-gray-400">
        Посочете или натиснете елемент на диаграмата или бутон отгоре, за да
        научите повече.
      </p>
    </div>
  );
}

function ElementInfo({ id, latitude }: { id: ElementId; latitude: number }) {
  const abs = Math.abs(latitude);
  const info: Record<ElementId, { title: string; body: ReactNode }> = {
    horizon: {
      title: 'Математически хоризонт',
      body: "Голям кръг, перпендикулярен на вертикалата ZZ'. Дели небесната сфера на видима (над хоризонта) и невидима половина. Върху него лежат точките С, Ю, И и З.",
    },
    meridian: {
      title: 'Небесен меридиан',
      body: "Голям кръг, минаващ през зенита Z, надира Z' и двата полюса P и P' – на всяка географска ширина. Пресича хоризонта в северната (С) и южната (Ю) точка. Когато звезда пресича меридиана, казваме, че кулминира – тогава е най-високо или най-ниско.",
    },
    equator: {
      title: 'Небесен екватор',
      body: `Голям кръг, перпендикулярен на оста на света PP' – продължение на земния екватор върху небето. Пресича хоризонта винаги в точките И и З и е наклонен под ъгъл 90° − φ = ${90 - abs}° спрямо него.`,
    },
    ecliptic: {
      title: 'Еклиптика',
      body: 'Видимият годишен път на Слънцето сред звездите – проекция на равнината на земната орбита. Наклонена е на ε ≈ 23,4° спрямо небесния екватор. Тъй като е закрепена към звездите, тя се върти заедно с небето – пуснете анимацията и вижте как се люлее!',
    },
    axis: {
      title: 'Ос на света',
      body: "Правата PP', успоредна на оста на въртене на Земята. Около нея небесната сфера извършва видимото си денонощно въртене.",
    },
    zenith: {
      title: 'Зенит (Z)',
      body: 'Точката точно над главата на наблюдателя – там, където сочи отвесът нагоре. Височината ѝ над хоризонта е 90°.',
    },
    nadir: {
      title: "Надир (Z')",
      body: 'Точката точно под краката на наблюдателя, диаметрално противоположна на зенита. Винаги е под хоризонта.',
    },
    north: {
      title: 'Северен полюс на света (P)',
      body:
        latitude > 0
          ? `Около него се върти небето. На под 1° от него е Полярната звезда. Тук P е на ${abs}° над северната точка С – точно колкото е географската ширина.`
          : latitude === 0
            ? 'На екватора P лежи точно на хоризонта, в северната точка С.'
            : `В южното полукълбо P е под хоризонта – на ${abs}° под северната точка. Полярната звезда не се вижда!`,
    },
    south: {
      title: "Южен полюс на света (P')",
      body:
        latitude > 0
          ? `Диаметрално противоположен на P. Тук е на ${abs}° под южната точка Ю и никога не се вижда.`
          : latitude === 0
            ? "На екватора P' лежи на хоризонта, в южната точка Ю."
            : `В южното полукълбо P' е на ${abs}° над южната точка Ю. Около него няма ярка звезда – посоката се намира по съзвездието Южен кръст.`,
    },
    cardinal: {
      title: 'Посоки на света',
      body: 'Северната (С) и южната (Ю) точка са пресечните точки на меридиана с хоризонта. Източната (И) и западната (З) точка са пресечните точки на екватора с хоризонта – там изгряват и залязват звездите от небесния екватор.',
    },
    observer: {
      title: 'Наблюдател',
      body: 'Центърът на небесната сфера. Радиусът на сферата е произволен – важни са само посоките към небесните тела, т.е. ъглите между тях.',
    },
    vernal: {
      title: 'Пролетна точка (♈)',
      body: 'Слънцето пресича небесния екватор от юг на север около 20 март – пролетно равноденствие. Оттук се отчита ректасцензията (α = 0h).',
    },
    autumnal: {
      title: 'Есенна точка (♎)',
      body: 'Слънцето пресича небесния екватор от север на юг около 22–23 септември – есенно равноденствие. Ректасцензията ѝ е α = 12h.',
    },
    summer: {
      title: 'Точка на лятното слънцестоене',
      body: 'Слънцето е на най-голяма деклинация δ = +23,4° около 21 юни – най-дългият ден в северното полукълбо.',
    },
    winter: {
      title: 'Точка на зимното слънцестоене',
      body: 'Слънцето е на най-малка деклинация δ = −23,4° около 21 декември – най-късият ден в северното полукълбо.',
    },
    parallels: {
      title: 'Денонощни успоредници',
      body: 'Всяка звезда описва за едно денонощие малък кръг, успореден на небесния екватор. Светлата част е над хоризонта, бледата – под него.',
    },
  };
  return (
    <div>
      <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
        {info[id].title}
      </h4>
      <p className="text-sm">{info[id].body}</p>
    </div>
  );
}
