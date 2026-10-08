export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** Съкратена дроб като текст: 6/8 → 3/4, 4/2 → 2, −3/6 → −1/2. */
export function fracText(n: number, d: number) {
  const g = gcd(n, d) || 1;
  const [p, q] = [n / g, d / g];
  const sign = p * q < 0 ? '−' : '';
  return Math.abs(q) === 1 ? `${sign}${Math.abs(p)}` : `${sign}${Math.abs(p)}/${Math.abs(q)}`;
}

/** Смесено число: 7/3 → 2 1/3 (или null, ако дробта е правилна). */
export function mixed(n: number, d: number) {
  if (Math.abs(n) < Math.abs(d) || n % d === 0) return null;
  const whole = Math.trunc(n / d);
  const rest = Math.abs(n % d);
  const g = gcd(rest, d);
  return `${whole} ${rest / g}/${Math.abs(d) / g}`;
}
