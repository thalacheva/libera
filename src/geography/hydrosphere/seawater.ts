// Морска вода при атмосферно налягане – уравнението на състоянието EOS-80 (UNESCO, 1981) без члена за налягането.

/** Плътност на морската вода, kg/m³; T в °C, S в ‰ (практически единици за соленост). */
export function seawaterDensity(T: number, S: number) {
  const rw = 999.842594 + 6.793952e-2 * T - 9.09529e-3 * T ** 2 + 1.001685e-4 * T ** 3 - 1.120083e-6 * T ** 4 + 6.536332e-9 * T ** 5;
  const A = 8.24493e-1 - 4.0899e-3 * T + 7.6438e-5 * T ** 2 - 8.2467e-7 * T ** 3 + 5.3875e-9 * T ** 4;
  const B = -5.72466e-3 + 1.0227e-4 * T - 1.6546e-6 * T ** 2;
  return rw + A * S + B * S ** 1.5 + 4.8314e-4 * S ** 2;
}

/** Условна плътност σ = ρ − 1000 kg/m³ – така океанолозите пишат плътността. */
export const sigma = (T: number, S: number) => seawaterDensity(T, S) - 1000;

/** Температура на замръзване, °C (приближение на UNESCO при атмосферно налягане). */
export const freezingPoint = (S: number) => -0.0575 * S + 1.710523e-3 * S ** 1.5 - 2.154996e-4 * S ** 2;

/** Солеността, при която водата с температура T има условна плътност sg (σ расте със S). */
export function salinityFor(T: number, sg: number) {
  let lo = 0;
  let hi = 45;
  if (sigma(T, lo) > sg || sigma(T, hi) < sg) return null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (sigma(T, mid) < sg) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
