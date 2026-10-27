import type { LatLon } from './geo';

export type City = LatLon & {
  name: string;
  /** Поясно (стандартно) време спрямо UTC, часове – без лятното часово време. */
  utc: number;
};

/** Координати (до 0,01°) и стандартно поясно време на градовете в лабораториите. */
export const CITIES: City[] = [
  { name: 'София', lat: 42.7, lon: 23.32, utc: 2 },
  { name: 'Лондон', lat: 51.51, lon: -0.13, utc: 0 },
  { name: 'Мадрид', lat: 40.42, lon: -3.7, utc: 1 },
  { name: 'Москва', lat: 55.76, lon: 37.62, utc: 3 },
  { name: 'Кайро', lat: 30.04, lon: 31.24, utc: 2 },
  { name: 'Кейптаун', lat: -33.92, lon: 18.42, utc: 2 },
  { name: 'Мумбай', lat: 19.08, lon: 72.88, utc: 5.5 },
  { name: 'Пекин', lat: 39.9, lon: 116.41, utc: 8 },
  { name: 'Токио', lat: 35.68, lon: 139.69, utc: 9 },
  { name: 'Сидни', lat: -33.87, lon: 151.21, utc: 10 },
  { name: 'Рейкявик', lat: 64.15, lon: -21.94, utc: 0 },
  { name: 'Ню Йорк', lat: 40.71, lon: -74.01, utc: -5 },
  { name: 'Лос Анджелис', lat: 34.05, lon: -118.24, utc: -8 },
  { name: 'Рио де Жанейро', lat: -22.91, lon: -43.17, utc: -3 },
  { name: 'Окланд', lat: -36.85, lon: 174.76, utc: 12 },
  { name: 'Хонолулу', lat: 21.31, lon: -157.86, utc: -10 },
];

export const cityByName = (name: string) => CITIES.find(c => c.name === name) ?? CITIES[0];
