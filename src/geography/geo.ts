// Общи изчисления за уроците по география: разстояния по сферата, проекции и положение на Слънцето.
import { LAND } from './worldLand';

/** Среден радиус на Земята, km. */
export const EARTH_R = 6371;
/** Наклон на земната ос към орбитата, градуси. */
export const OBLIQUITY = 23.44;

export const rad = (d: number) => (d * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
/** Дължина в интервала [−180, 180). */
export const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;

export type LatLon = { lat: number; lon: number };

/** Разстояние по голям кръг (ортодромия), km – формулата на хаверсинусите. */
export function greatCircleKm(a: LatLon, b: LatLon) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Начален курс (азимут от север по часовниковата стрелка) по ортодромията, градуси. */
export function initialBearing(a: LatLon, b: LatLon) {
  const f1 = rad(a.lat);
  const f2 = rad(b.lat);
  const dl = rad(b.lon - a.lon);
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Точки по ортодромията от a до b (сферична интерполация). */
export function greatCirclePoints(a: LatLon, b: LatLon, n = 96): LatLon[] {
  const d = greatCircleKm(a, b) / EARTH_R;
  if (d < 1e-9) return [a, b];
  const [f1, l1, f2, l2] = [rad(a.lat), rad(a.lon), rad(b.lat), rad(b.lon)];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(f1) * Math.cos(l1) + B * Math.cos(f2) * Math.cos(l2);
    const y = A * Math.cos(f1) * Math.sin(l1) + B * Math.cos(f2) * Math.sin(l2);
    const z = A * Math.sin(f1) + B * Math.sin(f2);
    return { lat: deg(Math.atan2(z, Math.hypot(x, y))), lon: deg(Math.atan2(y, x)) };
  });
}

/** „Меркаторска“ ширина ψ – по нея локсодромията е права линия. */
const psi = (lat: number) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/** Разстояние по локсодромията (постоянен курс), km – по по-късата посока на изток или запад. */
export function rhumbKm(a: LatLon, b: LatLon) {
  const dPhi = rad(b.lat - a.lat);
  const dPsi = psi(b.lat) - psi(a.lat);
  const q = Math.abs(dPsi) > 1e-12 ? dPhi / dPsi : Math.cos(rad(a.lat));
  const dLon = rad(wrapLon(b.lon - a.lon));
  return EARTH_R * Math.hypot(dPhi, q * dLon);
}

/** Точки по локсодромията от a до b. */
export function rhumbPoints(a: LatLon, b: LatLon, n = 96): LatLon[] {
  const dLon = wrapLon(b.lon - a.lon);
  const [p1, p2] = [psi(a.lat), psi(b.lat)];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const lat = Math.abs(p2 - p1) > 1e-12 ? deg(2 * Math.atan(Math.exp(p1 + t * (p2 - p1))) - Math.PI / 2) : a.lat;
    return { lat, lon: wrapLon(a.lon + t * dLon) };
  });
}

// ---------- Проекции ----------

/** Равнопромежутъчна (цилиндрична) проекция на правоъгълник x0, y0, w, h. */
export const equirect = (x0: number, y0: number, w: number, h: number) => (p: LatLon) => ({
  x: x0 + ((p.lon + 180) / 360) * w,
  y: y0 + ((90 - p.lat) / 180) * h,
});

/** Линия през точки на картата; прекъсва се, където минава през 180-ия меридиан. */
export function mapPolyline(points: LatLon[], proj: (p: LatLon) => { x: number; y: number }) {
  let d = '';
  points.forEach((p, i) => {
    const { x, y } = proj(p);
    const jump = i > 0 && Math.abs(p.lon - points[i - 1].lon) > 180;
    d += `${i === 0 || jump ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return d;
}

/**
 * Сушата в равнопромежутъчна проекция – един path (fill-rule evenodd).
 * Пръстените, които минават отвъд 180° (Евразия до Чукотка), се рисуват и отместени с 360° –
 * затова пътят трябва да се изреже по правоъгълника на картата (clipPath).
 */
export function landPathEquirect(x0: number, y0: number, w: number, h: number) {
  const proj = equirect(x0, y0, w, h);
  const draw = (ring: number[], shift: number) => {
    let d = '';
    for (let i = 0; i < ring.length; i += 2) {
      const { x, y } = proj({ lon: ring[i] / 10 + shift, lat: ring[i + 1] / 10 });
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + 'Z';
  };
  return LAND.map(ring => draw(ring, 0) + (Math.max(...ring.filter((_, i) => i % 2 === 0)) > 1800 ? draw(ring, -360) : '')).join('');
}

/** Ортографска проекция (глобус, гледан отдалеч) с център на изгледа lat0, lon0. */
export function orthographic(lat0: number, lon0: number, cx: number, cy: number, R: number) {
  const s0 = Math.sin(rad(lat0));
  const c0 = Math.cos(rad(lat0));
  return (p: LatLon) => {
    const f = rad(p.lat);
    const dl = rad(p.lon - lon0);
    const x = Math.cos(f) * Math.sin(dl);
    const y = c0 * Math.sin(f) - s0 * Math.cos(f) * Math.cos(dl);
    const z = s0 * Math.sin(f) + c0 * Math.cos(f) * Math.cos(dl);
    return { x: cx + R * x, y: cy - R * y, visible: z >= 0 };
  };
}

/** Линия по глобуса; невидимите части (зад ръба) се пропускат. */
export function globePolyline(points: LatLon[], proj: ReturnType<typeof orthographic>) {
  let d = '';
  let pen = false;
  for (const p of points) {
    const q = proj(p);
    if (!q.visible) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

/** Сушата на глобуса: точките зад ръба се избутват върху ръба, за да остане запълването цяло. */
export function landPathGlobe(lat0: number, lon0: number, cx: number, cy: number, R: number) {
  const proj = orthographic(lat0, lon0, cx, cy, R);
  return LAND.map(ring => {
    let d = '';
    let anyVisible = false;
    for (let i = 0; i < ring.length; i += 2) {
      const q = proj({ lon: ring[i] / 10, lat: ring[i + 1] / 10 });
      let { x, y } = q;
      if (q.visible) anyVisible = true;
      else {
        const k = R / (Math.hypot(x - cx, y - cy) || 1);
        x = cx + (x - cx) * k;
        y = cy + (y - cy) * k;
      }
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return anyVisible ? d + 'Z' : '';
  }).join('');
}

// ---------- Слънцето ----------

/** Деклинация на Слънцето в ден n от годината (приближено, ±1°). */
export const sunDeclination = (dayOfYear: number) => -OBLIQUITY * Math.cos(rad((360 / 365) * (dayOfYear + 10)));

/** Точката, над която Слънцето е в зенита, при UTC в часове (без уравнението на времето). */
export const subsolarPoint = (dayOfYear: number, utcHours: number): LatLon => ({
  lat: sunDeclination(dayOfYear),
  lon: wrapLon(-15 * (utcHours - 12)),
});

/**
 * Нощната страна в равнопромежутъчна проекция: многоъгълник между линията ден–нощ и полюса в тъмнина.
 * Линията: tg φ = −cos(λ − λ☉) / tg δ.
 */
export function nightPathEquirect(sun: LatLon, x0: number, y0: number, w: number, h: number) {
  const proj = equirect(x0, y0, w, h);
  const dec = Math.abs(sun.lat) < 0.05 ? (sun.lat < 0 ? -0.05 : 0.05) : sun.lat;
  let d = '';
  for (let lon = -180; lon <= 180; lon += 2) {
    const lat = deg(Math.atan(-Math.cos(rad(lon - sun.lon)) / Math.tan(rad(dec))));
    const { x, y } = proj({ lat, lon });
    d += `${lon === -180 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  // При лято в северното полукълбо в тъмнина е южният полюс
  const poleY = dec > 0 ? y0 + h : y0;
  return `${d}L${x0 + w} ${poleY}L${x0} ${poleY}Z`;
}

/** Височина на Слънцето над хоризонта в точка p, градуси. */
export function sunAltitude(p: LatLon, sun: LatLon) {
  const c = Math.sin(rad(p.lat)) * Math.sin(rad(sun.lat)) + Math.cos(rad(p.lat)) * Math.cos(rad(sun.lat)) * Math.cos(rad(p.lon - sun.lon));
  return deg(Math.asin(Math.max(-1, Math.min(1, c))));
}

// ---------- Запис ----------

/** 42.698 → „42°42′“. */
export function dms(v: number) {
  const a = Math.abs(v);
  let d = Math.floor(a);
  let m = Math.round((a - d) * 60);
  if (m === 60) {
    d += 1;
    m = 0;
  }
  return `${d}°${String(m).padStart(2, '0')}′`;
}
export const latText = (lat: number) => `${dms(lat)} ${lat >= 0 ? 'с.ш.' : 'ю.ш.'}`;
export const lonText = (lon: number) => `${dms(lon)} ${lon >= 0 ? 'и.д.' : 'з.д.'}`;

/** Часове → „14:05“ (по модул 24). */
export function clock(hours: number) {
  const m = Math.round((((hours % 24) + 24) % 24) * 60) % 1440;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/** Числото с десетична запетая и даден брой знаци след нея. */
export const fmt = (v: number, digits = 0) => v.toLocaleString('bg-BG', { minimumFractionDigits: digits, maximumFractionDigits: digits });
