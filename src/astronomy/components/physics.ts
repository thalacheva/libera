export const G = 6.674e-11; // N·m²/kg²

export type Body = {
  id: string;
  name: string;
  icon: string;
  mass: number; // kg
  radius: number; // m
};

export const BODIES: Body[] = [
  {
    id: 'mercury',
    name: 'Меркурий',
    icon: '☿️',
    mass: 3.301e23,
    radius: 2.44e6,
  },
  { id: 'venus', name: 'Венера', icon: '♀️', mass: 4.867e24, radius: 6.052e6 },
  { id: 'earth', name: 'Земя', icon: '🌍', mass: 5.972e24, radius: 6.371e6 },
  { id: 'moon', name: 'Луна', icon: '🌙', mass: 7.342e22, radius: 1.737e6 },
  { id: 'mars', name: 'Марс', icon: '🔴', mass: 6.417e23, radius: 3.39e6 },
  {
    id: 'jupiter',
    name: 'Юпитер',
    icon: '🪐',
    mass: 1.898e27,
    radius: 6.9911e7,
  },
  {
    id: 'saturn',
    name: 'Сатурн',
    icon: '🪐',
    mass: 5.683e26,
    radius: 5.8232e7,
  },
  { id: 'pluto', name: 'Плутон', icon: '🧊', mass: 1.303e22, radius: 1.188e6 },
  { id: 'sun', name: 'Слънце', icon: '☀️', mass: 1.989e30, radius: 6.96e8 },
];

/** Гравитационно ускорение на повърхността: g = GM / R². */
export const surfaceGravity = (body: Body) =>
  (G * body.mass) / body.radius ** 2;

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** Число в научен запис: 1,98 × 10²⁰. */
export function formatScientific(value: number, digits = 2) {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = (value / 10 ** exponent).toFixed(digits).replace('.', ',');
  if (exponent === 0) return mantissa;
  const sup = String(exponent)
    .split('')
    .map(c => SUPERSCRIPT[c])
    .join('');
  return `${mantissa} × 10${sup}`;
}
