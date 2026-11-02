// Данни за Европейския съюз за урока „Европа и Европейският съюз“.
// Население – Евростат (tps00001), към 1 януари 2025 г.; места в Европейския парламент – мандат 2024–2029 (720 места);
// БВП на човек по ППС – Евростат (nama_10r_2gdp), 2024 г., % от средното за ЕС.

export type Country = {
  code: string;
  name: string;
  /** клетка в схематичната карта (колона, ред) */
  c: number;
  r: number;
  /** население към 1.1.2025, млн. */
  pop: number;
  /** година на присъединяване към ЕО/ЕС (null – не е член) */
  eu: number | null;
  /** година на напускане */
  left?: number;
  /** година, от която е изцяло в Шенгенското пространство (без проверки по сухопътните граници) */
  schengen: number | null;
  /** година на приемане на еврото като валута в безналичен вид (1999 г. – първите 11) */
  euro: number | null;
  /** места в Европейския парламент 2024–2029 */
  seats: number;
  /** БВП на човек по ППС, 2024 г., % от средното за ЕС */
  gdp: number | null;
};

export const COUNTRIES: Country[] = [
  { code: 'IS', name: 'Исландия', c: 0, r: 0, pop: 0.39, eu: null, schengen: 2001, euro: null, seats: 0, gdp: null },
  { code: 'NO', name: 'Норвегия', c: 4, r: 0, pop: 5.59, eu: null, schengen: 2001, euro: null, seats: 0, gdp: null },
  { code: 'SE', name: 'Швеция', c: 5, r: 0, pop: 10.59, eu: 1995, schengen: 2001, euro: null, seats: 21, gdp: 111 },
  { code: 'FI', name: 'Финландия', c: 7, r: 0, pop: 5.64, eu: 1995, schengen: 2001, euro: 1999, seats: 15, gdp: 102 },
  { code: 'IE', name: 'Ирландия', c: 1, r: 1, pop: 5.44, eu: 1973, schengen: null, euro: 1999, seats: 14, gdp: 221 },
  { code: 'UK', name: 'Обединеното кралство', c: 2, r: 1, pop: 69.38, eu: 1973, left: 2020, schengen: null, euro: null, seats: 0, gdp: null },
  { code: 'DK', name: 'Дания', c: 4, r: 1, pop: 5.99, eu: 1973, schengen: 2001, euro: null, seats: 15, gdp: 127 },
  { code: 'EE', name: 'Естония', c: 7, r: 1, pop: 1.37, eu: 2004, schengen: 2007, euro: 2011, seats: 7, gdp: 79 },
  { code: 'NL', name: 'Нидерландия', c: 3, r: 2, pop: 18.04, eu: 1958, schengen: 1995, euro: 1999, seats: 31, gdp: 134 },
  { code: 'DE', name: 'Германия', c: 4, r: 2, pop: 83.58, eu: 1958, schengen: 1995, euro: 1999, seats: 96, gdp: 116 },
  { code: 'PL', name: 'Полша', c: 5, r: 2, pop: 36.5, eu: 2004, schengen: 2007, euro: null, seats: 53, gdp: 78 },
  { code: 'LT', name: 'Литва', c: 6, r: 2, pop: 2.89, eu: 2004, schengen: 2007, euro: 2015, seats: 11, gdp: 87 },
  { code: 'LV', name: 'Латвия', c: 7, r: 2, pop: 1.86, eu: 2004, schengen: 2007, euro: 2014, seats: 9, gdp: 68 },
  { code: 'BE', name: 'Белгия', c: 2, r: 3, pop: 11.88, eu: 1958, schengen: 1995, euro: 1999, seats: 22, gdp: 117 },
  { code: 'LU', name: 'Люксембург', c: 3, r: 3, pop: 0.68, eu: 1958, schengen: 1995, euro: 1999, seats: 6, gdp: 245 },
  { code: 'CZ', name: 'Чехия', c: 4, r: 3, pop: 10.91, eu: 2004, schengen: 2007, euro: null, seats: 21, gdp: 91 },
  { code: 'SK', name: 'Словакия', c: 5, r: 3, pop: 5.42, eu: 2004, schengen: 2007, euro: 2009, seats: 15, gdp: 75 },
  { code: 'FR', name: 'Франция', c: 2, r: 4, pop: 68.88, eu: 1958, schengen: 1995, euro: 1999, seats: 81, gdp: 98 },
  { code: 'CH', name: 'Швейцария', c: 3, r: 4, pop: 9.05, eu: null, schengen: 2008, euro: null, seats: 0, gdp: null },
  { code: 'AT', name: 'Австрия', c: 4, r: 4, pop: 9.2, eu: 1995, schengen: 1997, euro: 1999, seats: 20, gdp: 119 },
  { code: 'HU', name: 'Унгария', c: 5, r: 4, pop: 9.54, eu: 2004, schengen: 2007, euro: null, seats: 21, gdp: 76 },
  { code: 'RO', name: 'Румъния', c: 6, r: 4, pop: 19.04, eu: 2007, schengen: 2025, euro: null, seats: 33, gdp: 77 },
  { code: 'PT', name: 'Португалия', c: 0, r: 5, pop: 11.39, eu: 1986, schengen: 1995, euro: 1999, seats: 21, gdp: 82 },
  { code: 'ES', name: 'Испания', c: 1, r: 5, pop: 49.13, eu: 1986, schengen: 1995, euro: 1999, seats: 61, gdp: 91 },
  { code: 'IT', name: 'Италия', c: 3, r: 5, pop: 58.94, eu: 1958, schengen: 1997, euro: 1999, seats: 76, gdp: 98 },
  { code: 'SI', name: 'Словения', c: 4, r: 5, pop: 2.13, eu: 2004, schengen: 2007, euro: 2007, seats: 9, gdp: 90 },
  { code: 'HR', name: 'Хърватия', c: 5, r: 5, pop: 3.87, eu: 2013, schengen: 2023, euro: 2023, seats: 12, gdp: 78 },
  { code: 'BG', name: 'България', c: 6, r: 5, pop: 6.44, eu: 2007, schengen: 2025, euro: 2026, seats: 17, gdp: 66 },
  { code: 'MT', name: 'Малта', c: 3, r: 6, pop: 0.57, eu: 2004, schengen: 2007, euro: 2008, seats: 6, gdp: 110 },
  { code: 'EL', name: 'Гърция', c: 6, r: 6, pop: 10.37, eu: 1981, schengen: 2000, euro: 2001, seats: 21, gdp: 69 },
  { code: 'CY', name: 'Кипър', c: 8, r: 6, pop: 0.98, eu: 2004, schengen: null, euro: 2008, seats: 6, gdp: 99 },
];

/** Членува ли страната в ЕС в края на дадената година. */
export const isMember = (c: Country, year: number) => c.eu !== null && c.eu <= year && (c.left === undefined || c.left > year);

export const EU27 = COUNTRIES.filter(c => isMember(c, 2026));
export const EU_POP = EU27.reduce((s, c) => s + c.pop, 0);

/** Вълните на разширяване */
export const WAVES: [number, string][] = [
  [1958, 'шестте основателки'],
  [1973, 'Дания, Ирландия, Обединеното кралство'],
  [1981, 'Гърция'],
  [1986, 'Испания, Португалия'],
  [1995, 'Австрия, Финландия, Швеция'],
  [2004, 'десет страни от Централна и Източна Европа и Средиземноморието'],
  [2007, 'България, Румъния'],
  [2013, 'Хърватия'],
  [2020, 'Обединеното кралство напуска'],
];

/** Региони от ниво NUTS 2: БВП на човек по ППС, % от средното за ЕС (Евростат). */
export const REGIONS: { code: string; name: string; v: number[] }[] = [
  { code: 'BG41', name: 'Югозападен (BG)', v: [90, 94, 97, 97, 101, 107] },
  { code: 'BG34', name: 'Югоизточен (BG)', v: [42, 40, 46, 58, 54, 57] },
  { code: 'BG33', name: 'Североизточен (BG)', v: [44, 45, 47, 48, 50, 51] },
  { code: 'BG32', name: 'Северен централен (BG)', v: [37, 39, 41, 41, 43, 43] },
  { code: 'BG42', name: 'Южен централен (BG)', v: [39, 42, 39, 42, 41, 43] },
  { code: 'BG31', name: 'Северозападен (BG)', v: [33, 37, 39, 41, 42, 42] },
  { code: 'BG', name: 'България', v: [55, 57, 59, 62, 63, 66] },
  { code: 'RO32', name: 'Букурещ – Илфов (RO)', v: [158, 164, 168, 174, 181, 188] },
  { code: 'RO21', name: 'Североизточен (RO)', v: [44, 47, 45, 43, 47, 48] },
  { code: 'CZ01', name: 'Прага (CZ)', v: [209, 211, 206, 200, 197, 192] },
  { code: 'PL81', name: 'Люблинско (PL)', v: [51, 55, 55, 55, 53, 55] },
  { code: 'EL53', name: 'Западна Македония (EL)', v: [58, 53, 54, 53, 50, 48] },
];
export const REGION_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
