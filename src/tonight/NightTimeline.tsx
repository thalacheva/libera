import { useMemo } from 'react';
import { toHorizontal } from './ephemeris';
import {
  apparentAltitude,
  formatTime,
  moonHorizontal,
  type Night,
  type Place,
  sunAltitude,
} from './night';

const WIDTH = 640;
const LEFT = 92;
const RIGHT = 12;
const ROW = 22;
const STEP = 5 / 1440;

const TWILIGHT = [
  { from: -90, color: '#070b1a', label: 'Нощ' },
  { from: -18, color: '#0d1a3a', label: 'Астрономически здрач' },
  { from: -12, color: '#1d3561', label: 'Навигационен здрач' },
  { from: -6, color: '#3a5f96', label: 'Граждански здрач' },
  { from: -0.833, color: '#8fb3e0', label: 'Ден' },
];

const colorFor = (alt: number) =>
  [...TWILIGHT].reverse().find(t => alt >= t.from)!.color;

/** Хронология на нощта: здрач, Луна и планети по часове. */
export function NightTimeline({
  night,
  place,
  jd,
  onPick,
}: {
  night: Night;
  place: Place;
  jd: number;
  onPick?: (jd: number) => void;
}) {
  const from = (night.sunset ?? night.start) - 1 / 24;
  const to = (night.sunrise ?? night.end) + 1 / 24;
  const x = (t: number) =>
    LEFT + ((t - from) / (to - from)) * (WIDTH - LEFT - RIGHT);

  const rows = useMemo(() => {
    const samples: number[] = [];
    for (let t = from; t <= to; t += STEP) samples.push(t);
    const sky = samples.map(t => sunAltitude(t, place));
    const moon = samples.map(t =>
      apparentAltitude(moonHorizontal(t, place).alt)
    );
    const planets = night.planets.map(p => ({
      p,
      alt: samples.map(t => apparentAltitude(toHorizontal(p, t, place).alt)),
    }));
    return { samples, sky, moon, planets };
  }, [from, to, night.planets, place]);

  const height = 34 + ROW * (2 + rows.planets.length) + 26;

  const bar = (y: number, values: number[], color: string, threshold = 0) =>
    rows.samples.map((t, i) => {
      const v = values[i];
      if (v <= threshold) return null;
      const darkEnough = rows.sky[i] < -6;
      return (
        <rect
          key={i}
          x={x(t)}
          y={y + 5}
          width={x(t + STEP) - x(t) + 0.3}
          height={ROW - 10}
          fill={color}
          opacity={darkEnough ? 0.95 : 0.3}
          rx="1"
        />
      );
    });

  // Часовете на всеки кръгъл час
  const hours: number[] = [];
  // Кръглите часове в UTC са кръгли и в българско време
  for (let t = Math.ceil(from * 24) / 24 + 1 / 2880; t < to; t += 1 / 24)
    hours.push(t);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full min-w-[560px] h-auto"
          onClick={e => {
            if (!onPick) return;
            const box = (
              e.currentTarget as SVGSVGElement
            ).getBoundingClientRect();
            const px = ((e.clientX - box.left) / box.width) * WIDTH;
            if (px < LEFT) return;
            onPick(from + ((px - LEFT) / (WIDTH - LEFT - RIGHT)) * (to - from));
          }}
          style={{ cursor: onPick ? 'pointer' : undefined }}
        >
          <rect width={WIDTH} height={height} rx="12" fill="#030712" />

          {/* Небето */}
          <text x="10" y={34 + ROW / 2 + 4} fontSize="12" fill="#cbd5e1">
            Небето
          </text>
          {rows.samples.map((t, i) => (
            <rect
              key={i}
              x={x(t)}
              y={34 + 3}
              width={x(t + STEP) - x(t) + 0.3}
              height={ROW - 6}
              fill={colorFor(rows.sky[i])}
            />
          ))}

          {/* Луната */}
          <text x="10" y={34 + ROW * 1.5 + 4} fontSize="12" fill="#f3f4f6">
            Луна
          </text>
          {bar(34 + ROW, rows.moon, '#e5e7eb')}

          {/* Планетите: ярко – над 5° и на тъмно; бледо – над хоризонта по светло */}
          {rows.planets.map(({ p, alt }, k) => (
            <g key={p.id}>
              <text
                x="10"
                y={34 + ROW * (2.5 + k) + 4}
                fontSize="12"
                fill={p.color}
              >
                {p.name}
              </text>
              {bar(34 + ROW * (2 + k), alt, p.color, 5)}
            </g>
          ))}

          {/* Часове */}
          {hours.map(t => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={30}
                y2={height - 22}
                stroke="#fff"
                strokeOpacity="0.08"
              />
              <text
                x={x(t)}
                y={22}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
              >
                {formatTime(t).slice(0, 2)}
              </text>
            </g>
          ))}

          {/* Залез и изгрев */}
          {night.sunset && (
            <text
              x={x(night.sunset)}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#fbbf24"
            >
              ☀↓ {formatTime(night.sunset)}
            </text>
          )}
          {night.sunrise && (
            <text
              x={x(night.sunrise)}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#fbbf24"
            >
              ☀↑ {formatTime(night.sunrise)}
            </text>
          )}

          {/* Избраният момент */}
          {jd >= from && jd <= to && (
            <line
              x1={x(jd)}
              x2={x(jd)}
              y1={30}
              y2={height - 22}
              stroke="#f472b6"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
        {TWILIGHT.map(t => (
          <span key={t.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm border border-gray-400/40"
              style={{ background: t.color }}
            />
            {t.label}
          </span>
        ))}
        <span>
          Бледите ленти: обектът е над хоризонта, но небето още е светло.
        </span>
      </div>
    </div>
  );
}
