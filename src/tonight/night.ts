// Какво се вижда през една нощ: Слънце, Луна, планети, метеорни потоци и затъмнения.
// Всички часове са в българско време (Europe/Sofia).

import { SHOWERS, type Shower } from '~/astronomy/components/showerData';
import {
  findCrossings,
  fromJulianDay,
  julianDay,
  localSolarEclipseNear,
  lunarEclipseNear,
  moonIllumination,
  moonPhases,
  moonPosition,
  moonSunLongitudeDiff,
  type Observer,
  planetPosition,
  type PlanetId,
  refraction,
  solarMagnitudeAt,
  sunPosition,
  toHorizontal,
  topocentric,
} from './ephemeris';

// ---------- Места ----------

export type Place = Observer & { id: string; name: string };

export const PLACES: Place[] = [
  { id: 'sofia', name: 'София', lat: 42.6977, lon: 23.3219, height: 550 },
  { id: 'plovdiv', name: 'Пловдив', lat: 42.1354, lon: 24.7453, height: 160 },
  { id: 'varna', name: 'Варна', lat: 43.2141, lon: 27.9147, height: 50 },
  { id: 'burgas', name: 'Бургас', lat: 42.5048, lon: 27.4626, height: 20 },
  { id: 'ruse', name: 'Русе', lat: 43.8356, lon: 25.9657, height: 50 },
  {
    id: 'stara-zagora',
    name: 'Стара Загора',
    lat: 42.4258,
    lon: 25.6345,
    height: 200,
  },
  { id: 'pleven', name: 'Плевен', lat: 43.417, lon: 24.6067, height: 100 },
  {
    id: 'veliko-tarnovo',
    name: 'Велико Търново',
    lat: 43.0757,
    lon: 25.6172,
    height: 220,
  },
  { id: 'shumen', name: 'Шумен', lat: 43.2706, lon: 26.9229, height: 210 },
  {
    id: 'blagoevgrad',
    name: 'Благоевград',
    lat: 42.0209,
    lon: 23.0943,
    height: 360,
  },
  { id: 'vidin', name: 'Видин', lat: 43.9962, lon: 22.8679, height: 40 },
  { id: 'smolyan', name: 'Смолян', lat: 41.5774, lon: 24.7011, height: 1000 },
  { id: 'rozhen', name: 'НАО Рожен', lat: 41.6931, lon: 24.7383, height: 1750 },
];

// ---------- Време в България ----------

const TIME_ZONE = 'Europe/Sofia';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

/** Отместване на българското време спрямо UTC в минути (120 или 180). */
function offsetMinutes(ms: number) {
  const p = Object.fromEntries(
    partsFormatter.formatToParts(new Date(ms)).map(x => [x.type, x.value])
  );
  const local = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour,
    +p.minute,
    +p.second
  );
  return Math.round((local - ms) / 60000);
}

/** Момент (JD) за дадено местно време в България. */
function localToJd(year: number, month: number, day: number, hour: number) {
  const guess = Date.UTC(year, month - 1, day, hour);
  return julianDay(new Date(guess - offsetMinutes(guess) * 60000));
}

/** Днешната дата в България като 'YYYY-MM-DD'. */
export function todayIso() {
  const p = Object.fromEntries(
    partsFormatter.formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return `${p.year}-${p.month.padStart(2, '0')}-${p.day.padStart(2, '0')}`;
}

const timeFormatter = new Intl.DateTimeFormat('bg-BG', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const dateFormatter = new Intl.DateTimeFormat('bg-BG', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('bg-BG', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
});

export const formatTime = (jd: number) =>
  timeFormatter.format(fromJulianDay(jd));
export const formatDate = (jd: number) =>
  dateFormatter.format(fromJulianDay(jd)).replace(/ г\.$/, '');
export const formatShortDate = (jd: number) =>
  shortDateFormatter.format(fromJulianDay(jd));

// ---------- Посоки ----------

const DIRECTIONS = [
  'север',
  'североизток',
  'изток',
  'югоизток',
  'юг',
  'югозапад',
  'запад',
  'северозапад',
];
const DIRECTIONS_SHORT = ['С', 'СИ', 'И', 'ЮИ', 'Ю', 'ЮЗ', 'З', 'СЗ'];

export const direction = (az: number) => DIRECTIONS[Math.round(az / 45) % 8];
export const directionShort = (az: number) =>
  DIRECTIONS_SHORT[Math.round(az / 45) % 8];

// ---------- Видима височина ----------

// Изгревите, залезите и здрачът се определят по геометричната височина:
// стандартните граници (−0,833° за Слънцето, −0,567° за планетите) вече включват рефракцията.

/** Геометрична височина на центъра на Слънцето. */
export function sunAltitude(jd: number, place: Place) {
  return toHorizontal(sunPosition(jd), jd, place).alt;
}

/** Топоцентрична позиция и геометрична височина на Луната. */
export function moonHorizontal(jd: number, place: Place) {
  const pos = topocentric(moonPosition(jd), jd, place);
  return { ...toHorizontal(pos, jd, place), pos };
}

/** Видима височина (с рефракция) – за картата и за „най-високо“. */
export const apparentAltitude = (alt: number) => alt + refraction(alt);

// ---------- Фаза на Луната ----------

export const PHASE_NAMES = [
  'Новолуние',
  'Първа четвърт',
  'Пълнолуние',
  'Последна четвърт',
];
export const PHASE_ICONS = ['🌑', '🌓', '🌕', '🌗'];

export function moonPhaseName(elongation: number) {
  if (elongation < 8 || elongation > 352)
    return { name: 'Новолуние', icon: '🌑' };
  if (elongation < 82) return { name: 'Растящ сърп', icon: '🌒' };
  if (elongation < 98) return { name: 'Първа четвърт', icon: '🌓' };
  if (elongation < 172) return { name: 'Растяща Луна', icon: '🌔' };
  if (elongation < 188) return { name: 'Пълнолуние', icon: '🌕' };
  if (elongation < 262) return { name: 'Намаляваща Луна', icon: '🌖' };
  if (elongation < 278) return { name: 'Последна четвърт', icon: '🌗' };
  return { name: 'Намаляващ сърп', icon: '🌘' };
}

// ---------- Планети ----------

export const PLANETS: {
  id: PlanetId;
  name: string;
  color: string;
  tip: string;
}[] = [
  {
    id: 'mercury',
    name: 'Меркурий',
    color: '#d6c7a1',
    tip: 'Винаги е близо до Слънцето – търсете го ниско над хоризонта малко след залез или преди изгрев.',
  },
  {
    id: 'venus',
    name: 'Венера',
    color: '#fff4c2',
    tip: 'Най-ярката точка на небето след Луната. В телескоп се виждат фазите ѝ – като на малка Луна.',
  },
  {
    id: 'mars',
    name: 'Марс',
    color: '#f08a5d',
    tip: 'Познава се по червеникавия цвят. Най-ярък е при противостояние – веднъж на около 2 години и 2 месеца.',
  },
  {
    id: 'jupiter',
    name: 'Юпитер',
    color: '#f4d9a6',
    tip: 'С бинокъл се виждат до четирите Галилееви спътника – малки точки в редица до планетата.',
  },
  {
    id: 'saturn',
    name: 'Сатурн',
    color: '#e9d58f',
    tip: 'Пръстените се виждат дори в малък телескоп с увеличение около 30 пъти.',
  },
];

/** Минимална височина, над която планетата се вижда реално (над сгради и мъгла). */
const MIN_PLANET_ALT = 5;
/** Небето е достатъчно тъмно за ярките планети, когато Слънцето е под −6° (край на гражданския здрач). */
const DARK_ENOUGH = -6;

export type Interval = [number, number];

export type PlanetNight = {
  id: PlanetId;
  name: string;
  color: string;
  tip: string;
  magnitude: number;
  elongation: number;
  ra: number;
  dec: number;
  visible: Interval[];
  best?: { jd: number; alt: number; az: number };
  rise?: number;
  set?: number;
  summary: string;
};

// ---------- Нощта ----------

export type NightEvents = {
  start: number; // местно пладне
  end: number; // следващото местно пладне
  sunset?: number;
  sunrise?: number;
  civilDusk?: number;
  civilDawn?: number;
  nauticalDusk?: number;
  nauticalDawn?: number;
  astroDusk?: number;
  astroDawn?: number;
  moonrise?: number;
  moonset?: number;
};

export type Night = NightEvents & {
  date: string;
  /** Моментът „среднощ“ (средата между залеза и изгрева). */
  middle: number;
  moon: {
    illumination: number;
    elongation: number;
    ageDays: number;
    name: string;
    icon: string;
  };
  /** Тъмно небе без Луна (Слънцето под −18°, Луната под хоризонта). */
  darkNoMoon: Interval[];
  planets: PlanetNight[];
};

const STEP = 5 / 1440; // 5 минути

function intervalsWhere(
  jd0: number,
  jd1: number,
  test: (jd: number) => boolean
): Interval[] {
  const result: Interval[] = [];
  let open: number | null = null;
  for (let jd = jd0; jd <= jd1 + 1e-9; jd += STEP) {
    const ok = test(jd);
    if (ok && open === null) open = jd;
    if (!ok && open !== null) {
      result.push([open, jd - STEP]);
      open = null;
    }
  }
  if (open !== null) result.push([open, jd1]);
  return result.filter(([a, b]) => b - a > 10 / 1440);
}

function events(start: number, end: number, place: Place): NightEvents {
  const result: NightEvents = { start, end };
  const sun = (jd: number) => sunAltitude(jd, place);
  const crossing = (h: number, rising: boolean) =>
    findCrossings(jd => sun(jd) - h, start, end, 10 / 1440).find(
      c => c.rising === rising
    )?.jd;
  result.sunset = crossing(-0.833, false);
  result.sunrise = crossing(-0.833, true);
  result.civilDusk = crossing(-6, false);
  result.civilDawn = crossing(-6, true);
  result.nauticalDusk = crossing(-12, false);
  result.nauticalDawn = crossing(-12, true);
  result.astroDusk = crossing(-18, false);
  result.astroDawn = crossing(-18, true);

  // Луната изгрява/залязва, когато горният ѝ край (с рефракцията) е на хоризонта
  const moon = (jd: number) => {
    const m = moonHorizontal(jd, place);
    return m.alt + 0.5667 + Math.asin(1737.4 / m.pos.distance) * 57.29578;
  };
  const moonEvents = findCrossings(moon, start, end, 10 / 1440);
  result.moonrise = moonEvents.find(c => c.rising)?.jd;
  result.moonset = moonEvents.find(c => !c.rising)?.jd;
  return result;
}

function planetSummary(
  p: PlanetNight,
  dusk: number,
  dawn: number,
  middle: number
) {
  if (p.visible.length === 0) {
    return p.elongation < 30
      ? 'Не се вижда – твърде близо до Слънцето и се губи в светлината на здрача.'
      : 'Не се вижда – под хоризонта през тъмната част от нощта.';
  }
  const near = (a: number, b: number) => Math.abs(a - b) < 20 / 1440;
  const first = p.visible[0][0];
  const last = p.visible[p.visible.length - 1][1];
  if (near(first, dusk) && near(last, dawn)) return 'Вижда се цяла нощ.';
  if (near(first, dusk)) {
    return last > middle
      ? `От здрача до ${formatTime(last)} – по-голямата част от нощта.`
      : `Вечер след залез, до ${formatTime(last)}.`;
  }
  if (near(last, dawn)) {
    return first < middle
      ? `От ${formatTime(first)} до сутринта – по-голямата част от нощта.`
      : `Сутрин преди изгрев, от ${formatTime(first)}.`;
  }
  return `През нощта: ${formatTime(first)} – ${formatTime(last)}.`;
}

/** Изчислява нощта, която започва вечерта на датата date ('YYYY-MM-DD'). */
export function computeNight(date: string, place: Place): Night {
  const [y, m, d] = date.split('-').map(Number);
  const start = localToJd(y, m, d, 12);
  const end = localToJd(y, m, d + 1, 12);
  const ev = events(start, end, place);
  const middle =
    ev.sunset !== undefined && ev.sunrise !== undefined
      ? (ev.sunset + ev.sunrise) / 2
      : (start + end) / 2;

  const elongation = moonSunLongitudeDiff(middle);
  const lastNew = moonPhases(middle - 31, middle)
    .filter(p => p.phase === 0)
    .pop();
  const phase = moonPhaseName(elongation);

  const sunCache = new Map<number, number>();
  const sunAlt = (jd: number) => {
    const key = Math.round(jd * 1440);
    let v = sunCache.get(key);
    if (v === undefined) {
      v = sunAltitude(jd, place);
      sunCache.set(key, v);
    }
    return v;
  };

  const darkNoMoon = intervalsWhere(
    start,
    end,
    jd => sunAlt(jd) < -18 && moonHorizontal(jd, place).alt < -0.833
  );

  const dusk = ev.civilDusk ?? start;
  const dawn = ev.civilDawn ?? end;
  const planets = PLANETS.map(info => {
    const pos = planetPosition(info.id, middle);
    const alt = (jd: number) => toHorizontal(pos, jd, place).alt;
    const visible = intervalsWhere(
      start,
      end,
      jd =>
        sunAlt(jd) < DARK_ENOUGH && apparentAltitude(alt(jd)) > MIN_PLANET_ALT
    );
    let best: PlanetNight['best'];
    for (const [a, b] of visible) {
      for (let jd = a; jd <= b; jd += STEP) {
        const h = toHorizontal(pos, jd, place);
        if (!best || apparentAltitude(h.alt) > best.alt)
          best = { jd, alt: apparentAltitude(h.alt), az: h.az };
      }
    }
    const crossings = findCrossings(
      jd => alt(jd) + 0.5667,
      start,
      end,
      10 / 1440
    );
    const p: PlanetNight = {
      ...info,
      magnitude: pos.magnitude,
      elongation: pos.elongation,
      ra: pos.ra,
      dec: pos.dec,
      visible,
      best,
      rise: crossings.find(c => c.rising)?.jd,
      set: crossings.find(c => !c.rising)?.jd,
      summary: '',
    };
    p.summary = planetSummary(p, dusk, dawn, middle);
    return p;
  });

  return {
    ...ev,
    date,
    middle,
    moon: {
      illumination: moonIllumination(middle),
      elongation,
      ageDays: lastNew ? middle - lastNew.jd : 0,
      ...phase,
    },
    darkNoMoon,
    planets,
  };
}

// ---------- Основни фази на Луната ----------

export function upcomingPhases(fromJd: number, count = 4) {
  return moonPhases(fromJd, fromJd + 31).slice(0, count);
}

// ---------- Метеорни потоци ----------

// Периоди на активност по календара на IMO (месец, ден)
const ACTIVITY: Record<string, [[number, number], [number, number]]> = {
  qua: [
    [12, 28],
    [1, 12],
  ],
  lyr: [
    [4, 14],
    [4, 30],
  ],
  eta: [
    [4, 19],
    [5, 28],
  ],
  per: [
    [7, 17],
    [8, 24],
  ],
  ori: [
    [10, 2],
    [11, 7],
  ],
  leo: [
    [11, 6],
    [11, 30],
  ],
  gem: [
    [12, 4],
    [12, 20],
  ],
};

export type ShowerNight = Shower & {
  peakJd: number;
  activeFrom: number;
  activeTo: number;
  active: boolean;
  daysToPeak: number;
  moonIllumination: number;
  /** Каква част от тъмните часове в нощта на максимума са без Луна (0–1). */
  moonFree: number;
};

export function upcomingShowers(date: string, place: Place): ShowerNight[] {
  const [y, m, d] = date.split('-').map(Number);
  const today = localToJd(y, m, d, 12);
  const result: ShowerNight[] = [];
  for (const shower of SHOWERS) {
    for (const year of [y - 1, y, y + 1]) {
      // Нощта на максимума: вечерта на деня на пика
      const peakDate = new Date(Date.UTC(year, 0, 1 + Math.floor(shower.peak)));
      const peakJd = localToJd(
        peakDate.getUTCFullYear(),
        peakDate.getUTCMonth() + 1,
        peakDate.getUTCDate(),
        12
      );
      const [[fm, fd], [tm, td]] = ACTIVITY[shower.id];
      const fromYear = fm > peakDate.getUTCMonth() + 1 ? year - 1 : year;
      const toYear = tm < peakDate.getUTCMonth() + 1 ? year + 1 : year;
      const activeFrom = localToJd(fromYear, fm, fd, 12);
      const activeTo = localToJd(toYear, tm, td, 12);
      const active = today >= activeFrom - 0.5 && today <= activeTo;
      const daysToPeak = peakJd - today;
      if (!active && (daysToPeak < 0 || daysToPeak > 366)) continue;
      if (result.some(r => r.id === shower.id)) continue;

      const night = events(peakJd, peakJd + 1, place);
      const darkStart = night.astroDusk ?? night.nauticalDusk ?? peakJd + 0.3;
      const darkEnd = night.astroDawn ?? night.nauticalDawn ?? peakJd + 0.7;
      let total = 0;
      let free = 0;
      for (let jd = darkStart; jd < darkEnd; jd += 10 / 1440) {
        total++;
        if (moonHorizontal(jd, place).alt < 0) free++;
      }
      result.push({
        ...shower,
        peakJd,
        activeFrom,
        activeTo,
        active,
        daysToPeak,
        moonIllumination: moonIllumination(peakJd + 0.5),
        moonFree: total ? free / total : 1,
      });
    }
  }
  return result.sort((a, b) => a.peakJd - b.peakJd);
}

// ---------- Затъмнения ----------

export type EclipseVisibility = 'full' | 'partial' | 'none';

export type EclipseItem =
  | {
      type: 'lunar';
      kind: 'penumbral' | 'partial' | 'total';
      jd: number;
      magnitude: number;
      start: number;
      end: number;
      totalStart?: number;
      totalEnd?: number;
      visibility: EclipseVisibility;
      maxVisible: boolean;
      visibleFrom?: number;
      visibleTo?: number;
    }
  | {
      type: 'solar';
      kind: 'partial' | 'annular' | 'total';
      jd: number;
      magnitude: number;
      obscuration: number;
      start: number;
      end: number;
      visibility: EclipseVisibility;
      maxVisible: boolean;
      visibleFrom?: number;
      visibleTo?: number;
      /** Най-голямата фаза, която се вижда над хоризонта. */
      visibleMagnitude: number;
    };

function visibleWindow(
  start: number,
  end: number,
  up: (jd: number) => boolean
) {
  const step = 2 / 1440;
  let from: number | undefined;
  let to: number | undefined;
  let all = true;
  for (let jd = start; jd <= end; jd += step) {
    if (up(jd)) {
      from ??= jd;
      to = jd;
    } else {
      all = false;
    }
  }
  const visibility: EclipseVisibility =
    from === undefined ? 'none' : all ? 'full' : 'partial';
  return { visibility, from, to };
}

/** Затъмненията, видими от мястото, в следващите `years` години. */
export function upcomingEclipses(
  fromJd: number,
  place: Place,
  years = 10
): EclipseItem[] {
  const phases = moonPhases(fromJd, fromJd + years * 365.25);
  const items: EclipseItem[] = [];
  for (const p of phases) {
    if (p.phase === 2) {
      const e = lunarEclipseNear(p.jd);
      // Полусенчесто затъмнение под ~0,6 практически не се забелязва с око
      if (!e || (e.kind === 'penumbral' && e.penumbralMagnitude < 0.6))
        continue;
      const moonUp = (jd: number) => moonHorizontal(jd, place).alt > -0.833;
      // Интересната част е фазата в сянката; при полусенчесто – около максимума
      const w =
        e.u1 !== undefined && e.u4 !== undefined
          ? visibleWindow(e.u1, e.u4, moonUp)
          : visibleWindow(e.max - 0.5 / 24, e.max + 0.5 / 24, moonUp);
      if (w.visibility === 'none') continue;
      items.push({
        type: 'lunar',
        kind: e.kind,
        jd: e.max,
        magnitude:
          e.kind === 'penumbral' ? e.penumbralMagnitude : e.umbralMagnitude,
        start: e.u1 ?? e.p1,
        end: e.u4 ?? e.p4,
        totalStart: e.u2,
        totalEnd: e.u3,
        visibility: w.visibility,
        maxVisible: moonUp(e.max),
        visibleFrom: w.from,
        visibleTo: w.to,
      });
    } else if (p.phase === 0) {
      const e = localSolarEclipseNear(p.jd, place);
      if (!e) continue;
      const sunUp = (jd: number) => sunAltitude(jd, place) > -0.833;
      const w = visibleWindow(e.c1, e.c4, sunUp);
      if (w.visibility === 'none') continue;
      // Най-голямата видима фаза: при залез/изгрев може да е по-малка от максималната
      let visibleMagnitude = 0;
      for (let jd = w.from!; jd <= w.to!; jd += 2 / 1440) {
        visibleMagnitude = Math.max(
          visibleMagnitude,
          solarMagnitudeAt(jd, place)
        );
      }
      items.push({
        type: 'solar',
        kind: e.kind,
        jd: e.max,
        magnitude: e.magnitude,
        obscuration: e.obscuration,
        start: e.c1,
        end: e.c4,
        visibility: w.visibility,
        maxVisible: sunUp(e.max),
        visibleFrom: w.from,
        visibleTo: w.to,
        visibleMagnitude,
      });
    }
  }
  return items;
}
