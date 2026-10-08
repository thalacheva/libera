// Данни за планетите от земен тип (NASA Planetary Fact Sheet, закръглени).

export type PlanetId = 'mercury' | 'venus' | 'earth' | 'mars';

export type Terrestrial = {
  id: PlanetId;
  name: string;
  symbol: string;
  color: string;
  radius: number; // km
  mass: number; // земни маси
  density: number; // g/cm³
  gravity: number; // m/s²
  escape: number; // km/s
  a: number; // AU
  e: number;
  year: number; // земни дни
  rotation: number; // сидеричен период в дни, отрицателен при обратно въртене
  solarDay: string;
  tilt: number; // °
  pressure: string;
  atmosphere: string;
  temperature: string;
  moons: string;
  albedo: number; // сферично албедо (на Бонд)
  meanT: number; // средна температура на повърхността, K
};

export const TERRESTRIAL: Terrestrial[] = [
  {
    id: 'mercury',
    name: 'Меркурий',
    symbol: '☿',
    color: '#a8a29e',
    radius: 2440,
    mass: 0.055,
    density: 5.43,
    gravity: 3.7,
    escape: 4.3,
    a: 0.387,
    e: 0.206,
    year: 87.97,
    rotation: 58.65,
    solarDay: '176 дни',
    tilt: 0.03,
    pressure: '~10⁻¹⁵ bar (екзосфера)',
    atmosphere: 'практически няма: следи от Na, K, He, O',
    temperature: '−173 … +427 °C',
    moons: 'няма',
    albedo: 0.07,
    meanT: 440,
  },
  {
    id: 'venus',
    name: 'Венера',
    symbol: '♀',
    color: '#facc15',
    radius: 6052,
    mass: 0.815,
    density: 5.24,
    gravity: 8.87,
    escape: 10.4,
    a: 0.723,
    e: 0.007,
    year: 224.7,
    rotation: -243.0,
    solarDay: '117 дни',
    tilt: 177.4,
    pressure: '92 bar',
    atmosphere: '96,5% CO₂, 3,5% N₂; облаци от сярна киселина',
    temperature: '+464 °C (денем и нощем)',
    moons: 'няма',
    albedo: 0.76,
    meanT: 737,
  },
  {
    id: 'earth',
    name: 'Земя',
    symbol: '⊕',
    color: '#3b82f6',
    radius: 6371,
    mass: 1,
    density: 5.51,
    gravity: 9.81,
    escape: 11.2,
    a: 1,
    e: 0.017,
    year: 365.26,
    rotation: 0.997,
    solarDay: '24 h',
    tilt: 23.4,
    pressure: '1 bar',
    atmosphere: '78% N₂, 21% O₂, 0,9% Ar, 0,04% CO₂',
    temperature: '−89 … +57 °C, средно +15 °C',
    moons: '1 (Луната)',
    albedo: 0.31,
    meanT: 288,
  },
  {
    id: 'mars',
    name: 'Марс',
    symbol: '♂',
    color: '#ef4444',
    radius: 3390,
    mass: 0.107,
    density: 3.93,
    gravity: 3.71,
    escape: 5.0,
    a: 1.524,
    e: 0.093,
    year: 687,
    rotation: 1.026,
    solarDay: '24 h 40 min',
    tilt: 25.2,
    pressure: '0,006 bar',
    atmosphere: '95% CO₂, 2,8% N₂, 2% Ar',
    temperature: '−140 … +20 °C, средно −63 °C',
    moons: '2 (Фобос и Деймос)',
    albedo: 0.25,
    meanT: 210,
  },
];

export const terrestrial = (id: PlanetId) => TERRESTRIAL.find(p => p.id === id)!;

/** Равновесна температура (K) на бързо въртяща се планета с албедо A на разстояние d AU. */
export const equilibriumT = (d: number, albedo: number) => (278.6 * (1 - albedo) ** 0.25) / Math.sqrt(d);

export const fmt = (v: number, d = 1) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });
