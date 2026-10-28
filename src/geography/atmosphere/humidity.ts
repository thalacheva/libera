// Влажност на въздуха и издигане на въздушна частица – общи сметки за урока „Водата във въздуха“.

/** Сухоадиабатен градиент, °C/km. */
export const DRY_RATE = 9.8;
/** С толкова пада точката на оросяване в издигащ се ненаситен въздух, °C/km. */
export const DEW_RATE = 1.8;
/** Височина на кондензационното ниво на 1 °C разлика между температурата и точката на оросяване, m. */
export const LCL_PER_DEGREE = 125;

/** Налягане на наситената водна пара над вода, hPa (формулата на Магнус, T в °C). */
export const satVapour = (t: number) => 6.112 * Math.exp((17.62 * t) / (243.12 + t));

/** Абсолютна влажност, g/m³, при парциално налягане на парата e (hPa) и температура t (°C). */
export const absHumidity = (e: number, t: number) => (216.7 * e) / (t + 273.15);

/** Наситена абсолютна влажност, g/m³ – колко пара най-много побира кубичен метър въздух. */
export const satAbsHumidity = (t: number) => absHumidity(satVapour(t), t);

/** Точка на оросяване, °C, по температура (°C) и относителна влажност (%). */
export function dewPoint(t: number, rh: number) {
  const g = Math.log(rh / 100) + (17.62 * t) / (243.12 + t);
  return (243.12 * g) / (17.62 - g);
}

/** Налягане на височина z (m) в стандартната атмосфера, hPa. */
export const pressureAt = (z: number) =>
  z <= 11000 ? 1013.25 * (1 - 2.25577e-5 * z) ** 5.25588 : 226.32 * Math.exp(-(z - 11000) / 6341.6);

/** Отношение на смесване (kg пара на kg сух въздух) при парциално налягане e и налягане p, hPa. */
export const mixingRatio = (e: number, p: number) => (0.622 * e) / (p - e);

/** Влажноадиабатен градиент, °C/km, при температура t (°C) и налягане p (hPa). */
export function moistRate(t: number, p: number) {
  const L = 2.501e6;
  const Rd = 287;
  const cp = 1005;
  const r = mixingRatio(satVapour(t), p);
  const tk = t + 273.15;
  return (9.81 * (1 + (L * r) / (Rd * tk))) / (cp + (L * L * r * 0.622) / (Rd * tk * tk)) * 1000;
}

/** Издига наситен въздух с температура t от височина z0 до z1 (m) по влажната адиабата; връща температурата. */
export function liftMoist(t: number, z0: number, z1: number, dz = 20) {
  let z = z0;
  while (z < z1) {
    const s = Math.min(dz, z1 - z);
    t -= (moistRate(t, pressureAt(z)) * s) / 1000;
    z += s;
  }
  return t;
}
