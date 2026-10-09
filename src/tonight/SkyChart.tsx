import { useMemo } from 'react';
import { litPath } from '~/astronomy/components/earthMath';
import {
  eclipticPoint,
  type Horizontal,
  moonSunLongitudeDiff,
  starOfDate,
  sunPosition,
  toHorizontal,
} from './ephemeris';
import {
  apparentAltitude,
  formatTime,
  moonHorizontal,
  type Night,
  type Place,
} from './night';
import { BACKGROUND_STARS, CONSTELLATIONS, NAMED_STARS } from './stars';

const SIZE = 640;
const C = SIZE / 2;
const R = 285;

/** Азимутална проекция: зенитът в центъра, север горе, изток вляво (както гледаме нагоре). */
function project({ alt, az }: Horizontal) {
  const r = (R * (90 - alt)) / 90;
  return {
    x: C - r * Math.sin((az * Math.PI) / 180),
    y: C - r * Math.cos((az * Math.PI) / 180),
  };
}

/** Цвят на небето според височината на Слънцето. */
function skyColor(sunAlt: number) {
  if (sunAlt > 0) return '#3b6fb6';
  if (sunAlt > -6) return '#24467a';
  if (sunAlt > -12) return '#15264a';
  if (sunAlt > -18) return '#0d1630';
  return '#070b1a';
}

const starRadius = (mag: number) => Math.max(0.7, 3.4 - 0.62 * mag);

export function SkyChart({
  night,
  place,
  jd,
}: {
  night: Night;
  place: Place;
  jd: number;
}) {
  // Звездите се пренасят към датата веднъж за нощта
  const stars = useMemo(() => {
    const t = night.middle;
    return {
      background: BACKGROUND_STARS.map(([ra, dec, mag]) => ({
        ...starOfDate(ra, dec, t),
        mag,
      })),
      named: Object.fromEntries(
        NAMED_STARS.map(s => [s.id, { ...s, ...starOfDate(s.ra, s.dec, t) }])
      ),
      ecliptic: Array.from({ length: 73 }, (_, i) => eclipticPoint(i * 5, t)),
    };
  }, [night.middle]);

  const horizontal = (pos: { ra: number; dec: number }) => {
    const h = toHorizontal(pos, jd, place);
    return { ...h, alt: apparentAltitude(h.alt) };
  };

  const sun = horizontal(sunPosition(jd));
  const moon = moonHorizontal(jd, place);
  const moonAlt = apparentAltitude(moon.alt);
  const elongation = moonSunLongitudeDiff(jd);
  const night_ = sun.alt < -12;

  const named = Object.fromEntries(
    Object.entries(stars.named).map(([id, s]) => [
      id,
      { ...s, h: horizontal(s) },
    ])
  );

  // Еклиптиката: прекъсваме линията под хоризонта
  const eclipticPath = stars.ecliptic
    .map(p => horizontal(p))
    .map((h, i, all) => {
      const { x, y } = project(h);
      const prevBelow = i === 0 || all[i - 1].alt < -20;
      return h.alt < -20
        ? ''
        : `${prevBelow ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full h-auto max-w-[640px] mx-auto block"
      role="img"
      aria-label={`Карта на небето над ${place.name} в ${formatTime(jd)}`}
    >
      <defs>
        <clipPath id="sky-clip">
          <circle cx={C} cy={C} r={R} />
        </clipPath>
        <radialGradient id="sky-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#000" stopOpacity="0" />
          <stop
            offset="100%"
            stopColor="#fff"
            stopOpacity={night_ ? 0.06 : 0.12}
          />
        </radialGradient>
      </defs>
      <rect width={SIZE} height={SIZE} rx="16" fill="#030712" />
      <circle cx={C} cy={C} r={R} fill={skyColor(sun.alt)} />
      <circle cx={C} cy={C} r={R} fill="url(#sky-glow)" />

      <g clipPath="url(#sky-clip)">
        {/* Височини 30° и 60° */}
        {[30, 60].map(alt => (
          <circle
            key={alt}
            cx={C}
            cy={C}
            r={(R * (90 - alt)) / 90}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.08"
            strokeDasharray="3 6"
          />
        ))}

        {/* Еклиптиката – пътят на Слънцето, край който се движат Луната и планетите */}
        <path
          d={eclipticPath}
          fill="none"
          stroke="#fbbf24"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="6 5"
        />

        {/* Съзвездия */}
        {CONSTELLATIONS.map(c =>
          c.lines.map((line, li) => {
            const pts = line.map(id => named[id].h);
            if (pts.every(h => h.alt < 0)) return null;
            const d = pts
              .map((h, i) => {
                const { x, y } = project(h);
                return `${i ? 'L' : 'M'} ${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ');
            return (
              <path
                key={c.name + li}
                d={d}
                fill="none"
                stroke="#93c5fd"
                strokeOpacity={night_ ? 0.35 : 0.15}
                strokeWidth="1"
              />
            );
          })
        )}

        {/* Звезди */}
        {night_ || sun.alt < -6
          ? stars.background.map((s, i) => {
              const h = horizontal(s);
              if (h.alt < 0) return null;
              const { x, y } = project(h);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={starRadius(s.mag)}
                  fill="#fff"
                  opacity={sun.alt < -12 ? 0.85 : 0.4}
                />
              );
            })
          : null}
        {Object.values(named).map(s => {
          if (s.h.alt < 0 || (sun.alt > -6 && s.mag > 1.5)) return null;
          const { x, y } = project(s.h);
          return (
            <circle key={s.id} cx={x} cy={y} r={starRadius(s.mag)} fill="#fff">
              {s.name && (
                <title>{`${s.name} (${s.mag.toFixed(1).replace('.', ',').replace('-', '−')})`}</title>
              )}
            </circle>
          );
        })}
      </g>

      {/* Имена на съзвездия и ярки звезди */}
      {CONSTELLATIONS.map(c => {
        const ids = [...new Set(c.lines.flat())];
        const hs = ids.map(id => named[id].h).filter(h => h.alt > 8);
        if (hs.length < ids.length / 2) return null;
        const ps = hs.map(project);
        const x = ps.reduce((a, p) => a + p.x, 0) / ps.length;
        const y = ps.reduce((a, p) => a + p.y, 0) / ps.length;
        return (
          <text
            key={c.name}
            x={x}
            y={y + 16}
            textAnchor="middle"
            fontSize="13"
            fill="#93c5fd"
            opacity={night_ ? 0.75 : 0.4}
            className="select-none"
          >
            {c.name}
          </text>
        );
      })}
      {Object.values(named).map(s => {
        if (!s.name || s.h.alt < 3 || (s.mag > 1.6 && s.id !== 'polaris'))
          return null;
        const { x, y } = project(s.h);
        return (
          <text
            key={s.id}
            x={x + 5}
            y={y - 5}
            fontSize="12"
            fill="#e5e7eb"
            opacity="0.7"
            className="select-none"
          >
            {s.name}
          </text>
        );
      })}

      {/* Планети */}
      {night.planets.map(p => {
        const h = horizontal(p);
        if (h.alt < 0) return null;
        const { x, y } = project(h);
        const r = Math.max(3.5, 6.5 - 0.7 * p.magnitude);
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={r + 3} fill={p.color} opacity="0.2" />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={p.color}
              stroke="#000"
              strokeOpacity="0.4"
            >
              <title>{`${p.name}: височина ${Math.round(h.alt)}°`}</title>
            </circle>
            <text
              x={x + r + 4}
              y={y + 4}
              fontSize="15"
              fontWeight="600"
              fill={p.color}
              className="select-none"
            >
              {p.name}
            </text>
          </g>
        );
      })}

      {/* Луната с фазата ѝ (растяща – осветена отдясно) */}
      {moonAlt > -0.5 &&
        (() => {
          const { x, y } = project({ alt: moonAlt, az: moon.az });
          const e = (elongation * Math.PI) / 180;
          return (
            <g>
              <circle
                cx={x}
                cy={y}
                r="11"
                fill="#1f2937"
                stroke="#9ca3af"
                strokeOpacity="0.5"
              />
              <path
                d={litPath(x, y, 11, Math.sin(e), 0, -Math.cos(e))}
                fill="#f3f4f6"
              />
              <text
                x={x + 15}
                y={y + 4}
                fontSize="15"
                fontWeight="600"
                fill="#f3f4f6"
                className="select-none"
              >
                Луна
              </text>
            </g>
          );
        })()}

      {/* Слънцето */}
      {sun.alt > -0.5 &&
        (() => {
          const { x, y } = project(sun);
          return (
            <circle
              cx={x}
              cy={y}
              r="13"
              fill="#fde047"
              stroke="#f59e0b"
              strokeWidth="3"
            />
          );
        })()}

      {/* Хоризонт и посоки */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#9ca3af"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      {[
        ['С', C, C - R - 12],
        ['Ю', C, C + R + 22],
        ['И', C - R - 16, C + 5],
        ['З', C + R + 16, C + 5],
      ].map(([label, x, y]) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="#e5e7eb"
          className="select-none"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
