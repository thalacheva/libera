// Ефемериди за браузъра: Слънце, Луна, планети, изгрев/залез, фази и затъмнения.
// Луната – по Meeus, „Astronomical Algorithms“, гл. 47 (точност ~10″);
// планетите – по кеплеровите елементи на JPL (Standish), валидни 1800–2050 г.
// Позициите са спрямо средния екватор и равноденствие на датата
// (нутацията се пропуска – тя измества еднакво обектите и звездното време).

export const DEG = Math.PI / 180;
const J2000 = 2451545.0;
const AU_KM = 149597870.7;
const EARTH_RADIUS_KM = 6378.14;
const SUN_RADIUS_KM = 696000;
const MOON_RADIUS_KM = 1737.4;
const MOON_EARTH_MASS_RATIO = 1 / 81.30056;

const norm360 = (x: number) => ((x % 360) + 360) % 360;
const sind = (x: number) => Math.sin(x * DEG);
const cosd = (x: number) => Math.cos(x * DEG);

// ---------- Време ----------

export const julianDay = (date: Date) => date.getTime() / 86400000 + 2440587.5;
export const fromJulianDay = (jd: number) => new Date((jd - 2440587.5) * 86400000);

/** Юлиански векове земно време (TT) от J2000; ΔT ≈ 69 s за 2020-те години. */
const centuriesTT = (jd: number) => (jd + 69 / 86400 - J2000) / 36525;

/** Средно звездно време по Гринуич в градуси (IAU 1982). */
export function greenwichSidereal(jd: number) {
  const t = (jd - J2000) / 36525;
  return norm360(
    280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * t * t - (t * t * t) / 38710000
  );
}

const meanObliquity = (t: number) =>
  23.439291111 - 0.0130041667 * t - 1.6389e-7 * t * t + 5.0361e-7 * t * t * t;

// ---------- Вектори и координати ----------

export type Vec = [number, number, number];

const rotX = (v: Vec, angle: number): Vec => {
  const c = cosd(angle);
  const s = sind(angle);
  return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]];
};

const fromSpherical = (lon: number, lat: number, r = 1): Vec => [
  r * cosd(lat) * cosd(lon),
  r * cosd(lat) * sind(lon),
  r * sind(lat),
];

/** Прецесия от J2000 към датата (Lieske 1977), за вектор в екваториални координати. */
function precessFromJ2000(v: Vec, t: number): Vec {
  const zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) / 3600;
  const z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) / 3600;
  const theta = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) / 3600;
  const [cz, sz] = [cosd(zeta), sind(zeta)];
  const [cZ, sZ] = [cosd(z), sind(z)];
  const [ct, st] = [cosd(theta), sind(theta)];
  const m = [
    [cz * ct * cZ - sz * sZ, -sz * ct * cZ - cz * sZ, -st * cZ],
    [cz * ct * sZ + sz * cZ, -sz * ct * sZ + cz * cZ, -st * sZ],
    [cz * st, -sz * st, ct],
  ];
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

/** Звезда с координати за J2000 (градуси) → средно равноденствие на датата. */
export function starOfDate(ra: number, dec: number, jd: number) {
  const v = precessFromJ2000(fromSpherical(ra, dec), centuriesTT(jd));
  return toEquatorial(v);
}

/** Точка от еклиптиката с дължина lon (градуси) в екваториални координати на датата. */
export function eclipticPoint(lon: number, jd: number) {
  return toEquatorial(rotX(fromSpherical(lon, 0), meanObliquity(centuriesTT(jd))));
}

export type Equatorial = {
  ra: number; // градуси
  dec: number; // градуси
  distance: number; // km
};

const toEquatorial = (v: Vec): Equatorial => {
  const distance = Math.hypot(v[0], v[1], v[2]);
  return {
    ra: norm360(Math.atan2(v[1], v[0]) / DEG),
    dec: Math.asin(v[2] / distance) / DEG,
    distance,
  };
};

/** Ъглово разстояние между две посоки, в градуси. */
export function separation(a: Equatorial, b: Equatorial) {
  const c =
    sind(a.dec) * sind(b.dec) + cosd(a.dec) * cosd(b.dec) * cosd(a.ra - b.ra);
  return Math.acos(Math.min(1, Math.max(-1, c))) / DEG;
}

// ---------- Луна (Meeus, гл. 47) ----------

// D, M, M', F, Σl, Σr
const MOON_LR: number[][] = [
  [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968], [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733], [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0], [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824], [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403], [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884],
  [0, 1, 2, 0, -2120, 5751], [0, 2, 0, 0, -2069, 0],
  [2, -2, -1, 0, 2048, -4950], [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958],
  [0, 0, 2, 2, -1110, 0], [3, 0, -1, 0, -892, 3258],
  [2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117], [2, 2, -1, 0, -700, 2354],
  [2, 1, -2, 0, 691, 0], [2, -1, 0, -2, 596, 0],
  [4, 0, 1, 0, 549, -1423], [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571], [1, 0, -2, 0, -487, -1739],
  [2, 1, 0, -2, -399, 0], [0, 0, 2, -2, -381, -4421],
  [1, 1, 1, 0, 351, 0], [3, 0, -2, 0, -340, 0],
  [4, 0, -3, 0, 330, 0], [2, -1, 2, 0, 327, 0],
  [0, 2, 1, 0, -323, 1165], [1, 1, -1, 0, 299, 0],
  [2, 0, 3, 0, 294, 0], [2, 0, -1, -2, 0, 8752],
];

// D, M, M', F, Σb
const MOON_B: number[][] = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237], [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211], [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794], [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107], [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833],
  [0, 0, 1, -3, 777], [4, 0, -2, 1, 671], [2, 0, 0, -3, 607],
  [2, 0, 2, -1, 596], [2, -1, 1, -1, 491], [2, 0, -2, 1, -451],
  [0, 0, 3, -1, 439], [2, 0, 2, 1, 422], [2, 0, -3, -1, 421],
  [2, 1, -1, 1, -366], [2, 1, 0, 1, -351], [4, 0, 0, 1, 331],
  [2, -1, 1, 1, 315], [2, -2, 0, -1, 302], [0, 0, 1, 3, -283],
  [2, 1, 1, -1, -229], [1, 1, 0, -1, 223], [1, 1, 0, 1, 223],
  [0, 1, -2, -1, -220], [2, 1, -1, -1, -220], [1, 0, 1, 1, -185],
  [2, -1, -2, -1, 181], [0, 1, 2, 1, -177], [4, 0, -2, -1, 176],
  [4, -1, -1, -1, 166], [1, 0, 1, -1, -164], [4, 0, 1, -1, 132],
  [1, 0, -1, -1, -119], [4, -1, 0, -1, 115], [2, -2, 0, 1, 107],
];

/** Геоцентрична Луна: еклиптични λ, β (средно равноденствие на датата) и разстояние в km. */
export function moonEcliptic(jd: number) {
  const t = centuriesTT(jd);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const Lp = norm360(218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000);
  const D = norm360(297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000);
  const M = norm360(357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000);
  const F = norm360(93.272095 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000);
  const A1 = 119.75 + 131.849 * t;
  const A2 = 53.09 + 479264.29 * t;
  const A3 = 313.45 + 481266.484 * t;
  const E = 1 - 0.002516 * t - 0.0000074 * t2;
  const eFactor = (m: number) => (m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E);

  let sl = 0;
  let sr = 0;
  for (const [d, m, mp, f, l, r] of MOON_LR) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const e = eFactor(m);
    sl += l * e * sind(arg);
    sr += r * e * cosd(arg);
  }
  let sb = 0;
  for (const [d, m, mp, f, b] of MOON_B) {
    sb += b * eFactor(m) * sind(d * D + m * M + mp * Mp + f * F);
  }
  sl += 3958 * sind(A1) + 1962 * sind(Lp - F) + 318 * sind(A2);
  sb +=
    -2235 * sind(Lp) + 382 * sind(A3) + 175 * sind(A1 - F) + 175 * sind(A1 + F) +
    127 * sind(Lp - Mp) - 115 * sind(Lp + Mp);

  return {
    lon: norm360(Lp + sl / 1e6),
    lat: sb / 1e6,
    distance: 385000.56 + sr / 1000,
  };
}

// ---------- Планети (JPL, Standish: 1800–2050 г.) ----------

export type PlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

// a, e, I, L, ϖ, Ω и техните изменения за век
const ELEMENTS: Record<PlanetId | 'earth', number[][]> = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus: [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  earth: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
  mars: [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus: [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
};

/** Хелиоцентричен вектор в AU (еклиптика и равноденствие J2000). */
function heliocentric(id: PlanetId | 'earth', t: number): Vec {
  const [base, rate] = ELEMENTS[id];
  const [a, e, I, L, w, O] = base.map((v, i) => v + rate[i] * t);
  const M = norm360(L - w + 180) - 180;
  let E = M + (e / DEG) * sind(M);
  for (let i = 0; i < 8; i++) {
    E -= (E - (e / DEG) * sind(E) - M) / (1 - e * cosd(E));
  }
  const x = a * (cosd(E) - e);
  const y = a * Math.sqrt(1 - e * e) * sind(E);
  const argPeri = w - O;
  const [cw, sw] = [cosd(argPeri), sind(argPeri)];
  const [cO, sO] = [cosd(O), sind(O)];
  const [cI, sI] = [cosd(I), sind(I)];
  return [
    (cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y,
    (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y,
    sw * sI * x + cw * sI * y,
  ];
}

const OBLIQUITY_J2000 = 23.4392911;

/** Земята в AU (еклиптика J2000): барицентърът Земя–Луна минус приноса на Луната. */
function earthHeliocentric(jd: number): Vec {
  const t = centuriesTT(jd);
  const emb = heliocentric('earth', t);
  // Луната в еклиптика J2000 (приближено: прецесията по дължина)
  const m = moonEcliptic(jd);
  const moon = fromSpherical(m.lon - 1.396971 * t, m.lat, m.distance / AU_KM);
  const k = MOON_EARTH_MASS_RATIO / (1 + MOON_EARTH_MASS_RATIO);
  return [emb[0] - k * moon[0], emb[1] - k * moon[1], emb[2] - k * moon[2]];
}

/** Еклиптичен вектор J2000 → екваториални координати на датата. */
function eclipticJ2000ToDate(v: Vec, t: number): Equatorial {
  return toEquatorial(precessFromJ2000(rotX(v, OBLIQUITY_J2000), t));
}

/** Еклиптични координати на датата → екваториални на датата. */
function eclipticOfDateToEquatorial(lon: number, lat: number, distance: number, t: number) {
  return toEquatorial(rotX(fromSpherical(lon, lat, distance), meanObliquity(t)));
}

// ---------- Видими (геоцентрични) позиции ----------

export function moonPosition(jd: number): Equatorial {
  const m = moonEcliptic(jd);
  return eclipticOfDateToEquatorial(m.lon, m.lat, m.distance, centuriesTT(jd));
}

/** Слънцето с поправка за аберацията (~20″). */
export function sunPosition(jd: number): Equatorial {
  const t = centuriesTT(jd);
  const e = earthHeliocentric(jd);
  const r = Math.hypot(e[0], e[1], e[2]);
  const lon = Math.atan2(-e[1], -e[0]) / DEG - 20.4898 / 3600 / r;
  const lat = Math.asin(-e[2] / r) / DEG;
  return { ...eclipticJ2000ToDate(fromSpherical(lon, lat, r), t), distance: r * AU_KM };
}

export type PlanetPosition = Equatorial & {
  /** Разстояние до Слънцето в AU. */
  r: number;
  /** Разстояние до Земята в AU. */
  delta: number;
  /** Фазов ъгъл в градуси. */
  phaseAngle: number;
  /** Ъглово разстояние от Слънцето (елонгация) в градуси. */
  elongation: number;
  /** Видима звездна величина. */
  magnitude: number;
};

export function planetPosition(id: PlanetId, jd: number): PlanetPosition {
  const t = centuriesTT(jd);
  const earth = earthHeliocentric(jd);
  // Поправка за времето, за което светлината пътува до нас
  let p = heliocentric(id, t);
  let geo: Vec = [p[0] - earth[0], p[1] - earth[1], p[2] - earth[2]];
  for (let i = 0; i < 2; i++) {
    const lightDays = (Math.hypot(...geo) * AU_KM) / 299792.458 / 86400;
    p = heliocentric(id, t - lightDays / 36525);
    geo = [p[0] - earth[0], p[1] - earth[1], p[2] - earth[2]];
  }
  const r = Math.hypot(...p);
  const delta = Math.hypot(...geo);
  const R = Math.hypot(...earth);
  const phaseAngle = Math.acos((r * r + delta * delta - R * R) / (2 * r * delta)) / DEG;
  const elongation = Math.acos((R * R + delta * delta - r * r) / (2 * R * delta)) / DEG;
  const pos = eclipticJ2000ToDate(geo, t);

  let saturnRingTilt = 0;
  if (id === 'saturn') {
    const lon = Math.atan2(geo[1], geo[0]) / DEG;
    const lat = Math.asin(geo[2] / delta) / DEG;
    // Наклон на пръстените към Земята (Meeus, гл. 45; еклиптика J2000)
    const inc = 28.075216 - 0.012998 * t;
    const node = 169.50847 + 1.394681 * t - 1.396971 * t;
    saturnRingTilt = Math.asin(
      sind(inc) * cosd(lat) * sind(lon - node) - cosd(inc) * sind(lat)
    ) / DEG;
  }

  return {
    ...pos,
    distance: delta * AU_KM,
    r,
    delta,
    phaseAngle,
    elongation,
    magnitude: planetMagnitude(id, r, delta, phaseAngle, saturnRingTilt),
  };
}

/** Звездна величина по формулите на Mallama и Hilton (2018), опростени. */
function planetMagnitude(id: PlanetId, r: number, delta: number, i: number, ringTilt: number) {
  const d = 5 * Math.log10(r * delta);
  switch (id) {
    case 'mercury':
      return d - 0.613 + 6.328e-2 * i - 1.6336e-3 * i ** 2 + 3.3644e-5 * i ** 3 -
        3.4265e-7 * i ** 4 + 1.6893e-9 * i ** 5 - 3.0334e-12 * i ** 6;
    case 'venus':
      return i < 163.7
        ? d - 4.384 - 1.044e-3 * i + 3.687e-4 * i ** 2 - 2.814e-6 * i ** 3 + 8.938e-9 * i ** 4
        : d + 236.05828 - 2.81914 * i + 8.39034e-3 * i ** 2;
    case 'mars':
      return d - 1.601 + 2.267e-2 * i - 1.302e-4 * i ** 2;
    case 'jupiter':
      return d - 9.395 - 3.7e-4 * i + 6.16e-4 * i ** 2;
    case 'saturn': {
      const s = Math.sin(Math.abs(ringTilt) * DEG);
      return d - 8.914 - 1.825 * s + 2.6e-2 * i - 0.378 * s * Math.exp(-2.25 * i);
    }
    case 'uranus':
      return d - 7.11 + 6.587e-3 * i + 1.045e-4 * i ** 2;
    case 'neptune':
      return d - 7.0;
  }
}

// ---------- Наблюдател ----------

export type Observer = { lat: number; lon: number; height?: number };

/** Топоцентрична поправка за паралакса (важна за Луната – до 1°). */
export function topocentric(pos: Equatorial, jd: number, obs: Observer): Equatorial {
  const u = Math.atan(0.99664719 * Math.tan(obs.lat * DEG));
  const h = (obs.height ?? 0) / 6378140;
  const rhoSin = 0.99664719 * Math.sin(u) + h * sind(obs.lat);
  const rhoCos = Math.cos(u) + h * cosd(obs.lat);
  const lst = greenwichSidereal(jd) + obs.lon;
  const H = lst - pos.ra;
  const sinPi = EARTH_RADIUS_KM / pos.distance;
  const A = cosd(pos.dec) * sind(H);
  const B = cosd(pos.dec) * cosd(H) - rhoCos * sinPi;
  const C = sind(pos.dec) - rhoSin * sinPi;
  const q = Math.sqrt(A * A + B * B + C * C);
  return {
    ra: norm360(lst - Math.atan2(A, B) / DEG),
    dec: Math.asin(C / q) / DEG,
    distance: q * pos.distance,
  };
}

export type Horizontal = { alt: number; az: number };

/** Височина и азимут (от север през изток), без рефракция. */
export function toHorizontal(pos: { ra: number; dec: number }, jd: number, obs: Observer): Horizontal {
  const H = greenwichSidereal(jd) + obs.lon - pos.ra;
  const alt = Math.asin(sind(obs.lat) * sind(pos.dec) + cosd(obs.lat) * cosd(pos.dec) * cosd(H)) / DEG;
  const az = Math.atan2(-cosd(pos.dec) * sind(H), sind(pos.dec) * cosd(obs.lat) - cosd(pos.dec) * sind(obs.lat) * cosd(H)) / DEG;
  return { alt, az: norm360(az) };
}

/** Атмосферна рефракция в градуси (Bennett) за видима височина h. */
export function refraction(alt: number) {
  if (alt < -1.5) return 0;
  return 1.02 / Math.tan((alt + 10.3 / (alt + 5.11)) * DEG) / 60;
}

// ---------- Търсене на събития ----------

/** Намира моментите, в които f сменя знака в [jd0, jd1]; стъпка step (дни). */
export function findCrossings(f: (jd: number) => number, jd0: number, jd1: number, step: number) {
  const result: { jd: number; rising: boolean }[] = [];
  let a = jd0;
  let fa = f(a);
  while (a < jd1) {
    const b = Math.min(a + step, jd1);
    const fb = f(b);
    if (fa === 0 || fa * fb < 0) {
      let lo = a;
      let hi = b;
      let flo = fa;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (flo * fm <= 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fm;
        }
      }
      result.push({ jd: (lo + hi) / 2, rising: fb > fa });
    }
    a = b;
    fa = fb;
  }
  return result;
}

/** Минимум на функция в [a, b] (златно сечение). */
export function findMinimum(f: (jd: number) => number, a: number, b: number) {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  let fc = f(c);
  let fd = f(d);
  for (let i = 0; i < 60; i++) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - g * (b - a);
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + g * (b - a);
      fd = f(d);
    }
  }
  const jd = (a + b) / 2;
  return { jd, value: f(jd) };
}

// ---------- Луна: фаза и основни фази ----------

/** Елонгация на Луната по еклиптична дължина (0 – новолуние, 180 – пълнолуние). */
export function moonSunLongitudeDiff(jd: number) {
  const t = centuriesTT(jd);
  const sun = sunPosition(jd);
  const sunVec = rotX(fromSpherical(sun.ra, sun.dec), -meanObliquity(t));
  const sunLon = Math.atan2(sunVec[1], sunVec[0]) / DEG;
  return norm360(moonEcliptic(jd).lon - sunLon);
}

/** Осветена част от лунния диск (0–1). */
export function moonIllumination(jd: number) {
  const moon = moonPosition(jd);
  const sun = sunPosition(jd);
  const elong = separation(moon, sun);
  const phaseAngle = Math.atan2(sun.distance * sind(elong), moon.distance - sun.distance * cosd(elong)) / DEG;
  return (1 + cosd(phaseAngle)) / 2;
}

export type MoonPhaseEvent = { jd: number; phase: 0 | 1 | 2 | 3 };

/** Основните фази (0 новолуние, 1 първа четвърт, 2 пълнолуние, 3 последна четвърт) в интервала. */
export function moonPhases(jd0: number, jd1: number): MoonPhaseEvent[] {
  const events: MoonPhaseEvent[] = [];
  for (const phase of [0, 1, 2, 3] as const) {
    const target = phase * 90;
    const f = (jd: number) => norm360(moonSunLongitudeDiff(jd) - target + 180) - 180;
    for (const c of findCrossings(f, jd0, jd1, 2)) {
      // При прехода от +180 към −180 знакът също се сменя – тези моменти ги пропускаме
      if (c.rising && Math.abs(f(c.jd)) < 1) events.push({ jd: c.jd, phase });
    }
  }
  return events.sort((a, b) => a.jd - b.jd);
}

// ---------- Затъмнения ----------

export type LunarEclipse = {
  kind: 'penumbral' | 'partial' | 'total';
  max: number; // JD на максимума
  umbralMagnitude: number;
  penumbralMagnitude: number;
  // Контакти (JD): полусянка P1/P4, сянка U1/U4, пълна фаза U2/U3
  p1: number;
  p4: number;
  u1?: number;
  u4?: number;
  u2?: number;
  u3?: number;
};

/** Разстояние от центъра на Луната до оста на земната сянка и радиусите (в градуси). */
function lunarShadow(jd: number) {
  const moon = moonPosition(jd);
  const sun = sunPosition(jd);
  const anti: Equatorial = { ra: norm360(sun.ra + 180), dec: -sun.dec, distance: sun.distance };
  const moonParallax = Math.asin(EARTH_RADIUS_KM / moon.distance) / DEG;
  const sunParallax = Math.asin(EARTH_RADIUS_KM / sun.distance) / DEG;
  const sunRadius = Math.asin(SUN_RADIUS_KM / sun.distance) / DEG;
  const moonRadius = Math.asin(MOON_RADIUS_KM / moon.distance) / DEG;
  // Правило на Данжон: атмосферата увеличава сянката с ~1/85 от земния радиус
  const umbra = 1.01 * moonParallax + sunParallax - sunRadius;
  const penumbra = 1.01 * moonParallax + sunParallax + sunRadius;
  return { d: separation(moon, anti), umbra, penumbra, moonRadius };
}

/** Лунно затъмнение около пълнолунието fullMoonJd, ако има такова. */
export function lunarEclipseNear(fullMoonJd: number): LunarEclipse | null {
  const { jd: max } = findMinimum(jd => lunarShadow(jd).d, fullMoonJd - 0.3, fullMoonJd + 0.3);
  const s = lunarShadow(max);
  const penumbralMagnitude = (s.penumbra + s.moonRadius - s.d) / (2 * s.moonRadius);
  if (penumbralMagnitude <= 0) return null;
  const umbralMagnitude = (s.umbra + s.moonRadius - s.d) / (2 * s.moonRadius);

  const contact = (radius: (x: ReturnType<typeof lunarShadow>) => number, before: boolean) => {
    const f = (jd: number) => {
      const x = lunarShadow(jd);
      return x.d - radius(x);
    };
    const [a, b] = before ? [max - 0.3, max] : [max, max + 0.3];
    return findCrossings(f, a, b, 0.02)[0]?.jd;
  };

  const eclipse: LunarEclipse = {
    kind: umbralMagnitude >= 1 ? 'total' : umbralMagnitude > 0 ? 'partial' : 'penumbral',
    max,
    umbralMagnitude,
    penumbralMagnitude,
    p1: contact(x => x.penumbra + x.moonRadius, true),
    p4: contact(x => x.penumbra + x.moonRadius, false),
  };
  if (umbralMagnitude > 0) {
    eclipse.u1 = contact(x => x.umbra + x.moonRadius, true);
    eclipse.u4 = contact(x => x.umbra + x.moonRadius, false);
  }
  if (umbralMagnitude >= 1) {
    eclipse.u2 = contact(x => x.umbra - x.moonRadius, true);
    eclipse.u3 = contact(x => x.umbra - x.moonRadius, false);
  }
  return eclipse;
}

export type LocalSolarEclipse = {
  kind: 'partial' | 'annular' | 'total';
  max: number; // JD на максимума за наблюдателя
  magnitude: number; // част от диаметъра на Слънцето, закрита от Луната
  obscuration: number; // част от площта на Слънцето, закрита от Луната
  c1: number;
  c4: number;
  c2?: number;
  c3?: number;
};

function solarDisks(jd: number, obs: Observer) {
  const sun = topocentric(sunPosition(jd), jd, obs);
  const moon = topocentric(moonPosition(jd), jd, obs);
  return {
    d: separation(sun, moon),
    sunRadius: Math.asin(SUN_RADIUS_KM / sun.distance) / DEG,
    moonRadius: Math.asin(MOON_RADIUS_KM / moon.distance) / DEG,
    sun,
  };
}

/** Фаза на слънчевото затъмнение за наблюдателя в момента jd (0, ако няма затъмнение). */
export function solarMagnitudeAt(jd: number, obs: Observer) {
  const s = solarDisks(jd, obs);
  return Math.max(0, (s.sunRadius + s.moonRadius - s.d) / (2 * s.sunRadius));
}

/** Частта от площта на диск с радиус R, закрита от диск с радиус r на разстояние d. */
function overlapFraction(R: number, r: number, d: number) {
  if (d >= R + r) return 0;
  if (d <= Math.abs(R - r)) return r >= R ? 1 : (r * r) / (R * R);
  const a = Math.acos((d * d + R * R - r * r) / (2 * d * R));
  const b = Math.acos((d * d + r * r - R * R) / (2 * d * r));
  const area = R * R * (a - Math.sin(2 * a) / 2) + r * r * (b - Math.sin(2 * b) / 2);
  return area / (Math.PI * R * R);
}

/** Слънчево затъмнение за наблюдателя около новолунието newMoonJd, ако има такова. */
export function localSolarEclipseNear(newMoonJd: number, obs: Observer): LocalSolarEclipse | null {
  const { jd: max } = findMinimum(jd => solarDisks(jd, obs).d, newMoonJd - 0.4, newMoonJd + 0.4);
  const s = solarDisks(max, obs);
  if (s.d >= s.sunRadius + s.moonRadius) return null;
  const magnitude = (s.sunRadius + s.moonRadius - s.d) / (2 * s.sunRadius);

  const contact = (inner: boolean, before: boolean) => {
    const f = (jd: number) => {
      const x = solarDisks(jd, obs);
      return x.d - (inner ? Math.abs(x.moonRadius - x.sunRadius) : x.sunRadius + x.moonRadius);
    };
    const [a, b] = before ? [max - 0.25, max] : [max, max + 0.25];
    return findCrossings(f, a, b, 0.005)[0]?.jd;
  };

  const central = s.d < Math.abs(s.moonRadius - s.sunRadius);
  const eclipse: LocalSolarEclipse = {
    kind: central ? (s.moonRadius > s.sunRadius ? 'total' : 'annular') : 'partial',
    max,
    magnitude,
    obscuration: overlapFraction(s.sunRadius, s.moonRadius, s.d),
    c1: contact(false, true),
    c4: contact(false, false),
  };
  if (central) {
    eclipse.c2 = contact(true, true);
    eclipse.c3 = contact(true, false);
  }
  return eclipse;
}
