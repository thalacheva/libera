// Данни за планетите гиганти (NASA Planetary Fact Sheet, закръглени).

export type GiantId = 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export type Giant = {
  id: GiantId;
  name: string;
  symbol: string;
  color: string;
  kind: 'газов' | 'леден';
  radius: number; // екваториален радиус, km
  mass: number; // земни маси
  density: number; // g/cm³
  gravity: number; // m/s² (при 1 bar)
  escape: number; // km/s
  a: number; // AU
  e: number;
  year: number; // земни години
  rotation: number; // сидеричен период в часове, отрицателен при обратно въртене
  tilt: number; // °
  flattening: number; // (R_екв − R_пол) / R_екв
  T1bar: number; // температура при налягане 1 bar, K
  heat: number; // излъчена / погълната слънчева енергия
  atmosphere: string;
  field: string;
  moons: string;
  rings: string;
};

export const GIANTS: Giant[] = [
  {
    id: 'jupiter',
    name: 'Юпитер',
    symbol: '♃',
    color: '#d6a46c',
    kind: 'газов',
    radius: 71492,
    mass: 317.8,
    density: 1.33,
    gravity: 24.79,
    escape: 59.5,
    a: 5.203,
    e: 0.048,
    year: 11.86,
    rotation: 9.925,
    tilt: 3.1,
    flattening: 0.0649,
    T1bar: 165,
    heat: 1.67,
    atmosphere: '~90% H₂, ~10% He (по брой молекули); облаци от NH₃, NH₄SH и H₂O',
    field: '~14 пъти по-силно от земното на повърхността',
    moons: '97 (към 2025 г.)',
    rings: 'тънки, прашни',
  },
  {
    id: 'saturn',
    name: 'Сатурн',
    symbol: '♄',
    color: '#e9d18f',
    kind: 'газов',
    radius: 60268,
    mass: 95.16,
    density: 0.69,
    gravity: 10.44,
    escape: 35.5,
    a: 9.537,
    e: 0.054,
    year: 29.46,
    rotation: 10.66,
    tilt: 26.7,
    flattening: 0.098,
    T1bar: 134,
    heat: 1.78,
    atmosphere: '~96% H₂, ~3% He; облаци от NH₃ под дебела мъгла',
    field: 'колкото земното, оста му съвпада с оста на въртене',
    moons: '274 (към 2025 г.)',
    rings: 'ярки, от воден лед',
  },
  {
    id: 'uranus',
    name: 'Уран',
    symbol: '⛢',
    color: '#9fdde6',
    kind: 'леден',
    radius: 25559,
    mass: 14.54,
    density: 1.27,
    gravity: 8.87,
    escape: 21.3,
    a: 19.19,
    e: 0.047,
    year: 84.0,
    rotation: -17.24,
    tilt: 97.8,
    flattening: 0.0229,
    T1bar: 76,
    heat: 1.1,
    atmosphere: '~83% H₂, ~15% He, ~2% CH₄',
    field: 'наклонено на 59° спрямо оста и изместено от центъра',
    moons: '29 (към 2025 г.)',
    rings: '13 тесни, тъмни',
  },
  {
    id: 'neptune',
    name: 'Нептун',
    symbol: '♆',
    color: '#4f7fe0',
    kind: 'леден',
    radius: 24764,
    mass: 17.15,
    density: 1.64,
    gravity: 11.15,
    escape: 23.5,
    a: 30.07,
    e: 0.009,
    year: 164.8,
    rotation: 16.11,
    tilt: 28.3,
    flattening: 0.0171,
    T1bar: 72,
    heat: 2.6,
    atmosphere: '~80% H₂, ~19% He, ~1,5% CH₄',
    field: 'наклонено на 47° спрямо оста и изместено от центъра',
    moons: '16',
    rings: '5 тесни, тъмни, с „арки“',
  },
];

export const giant = (id: GiantId) => GIANTS.find(p => p.id === id)!;

/** Сидеричен период на въртене като текст: „9 h 55 min“. */
export function rotationText(hours: number) {
  const h = Math.abs(hours);
  const whole = Math.floor(h);
  return `${whole} h ${Math.round((h - whole) * 60)} min`;
}
