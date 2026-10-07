// Обща математика за слънчевите лаборатории.

export const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Сидерична ъглова скорост на въртене на Слънцето (°/ден) на хелиографска ширина lat. */
export const siderealRate = (lat: number) => {
  const s2 = Math.sin(toRad(lat)) ** 2;
  return 14.713 - 2.396 * s2 - 1.787 * s2 * s2;
};

/** Синодична скорост – както я виждаме от движещата се Земя. */
export const synodicRate = (lat: number) => siderealRate(lat) - 0.9856;

/**
 * Ортографска проекция на точка от слънчевата сфера (ширина lat, дължина lon от централния меридиан).
 * Връща координати спрямо центъра на диска в единици R и дали точката е на видимата страна.
 */
export function project(lat: number, lon: number) {
  const φ = toRad(lat);
  const λ = toRad(lon);
  return {
    x: Math.cos(φ) * Math.sin(λ),
    y: -Math.sin(φ),
    visible: Math.cos(φ) * Math.cos(λ) > 0,
    /** Колко „отвесно“ гледаме към точката – за скъсяване на петната към ръба. */
    mu: Math.cos(φ) * Math.cos(λ),
  };
}
