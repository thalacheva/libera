// Цвят на светлина с дадена дължина на вълната – приближение (по алгоритъма на Д. Брутън).
// Връща компоненти от 0 до 1; извън видимата област (380–750 nm) – черно.

export function wavelengthRgb(nm: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) [r, g, b] = [(440 - nm) / 60, 0, 1];
  else if (nm >= 440 && nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm >= 490 && nm < 510) [r, g, b] = [0, 1, (510 - nm) / 20];
  else if (nm >= 510 && nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm >= 580 && nm < 645) [r, g, b] = [1, (645 - nm) / 65, 0];
  else if (nm >= 645 && nm <= 750) [r, g, b] = [1, 0, 0];
  // Окото е по-слабо чувствително в краищата на спектъра
  const k = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (750 - nm)) / 50 : 1;
  return [r * k, g * k, b * k];
}

/** CSS цвят от компоненти 0–1, умножени по яркост. */
export const rgbCss = ([r, g, b]: [number, number, number], brightness = 1) => {
  const c = (v: number) => Math.round(255 * Math.min(1, Math.max(0, v * brightness)));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
};

/** CSS цвят на светлина с дължина на вълната nm. */
export const wavelengthCss = (nm: number, brightness = 1) => rgbCss(wavelengthRgb(nm), brightness);

/**
 * Цвят на смес от видими дължини на вълната с относителни интензитети weight(λ) от 0 до 1.
 * При weight ≡ 1 се получава бяло (нормираме спрямо бялата светлина).
 */
export function mixColor(weight: (nm: number) => number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let wr = 0;
  let wg = 0;
  let wb = 0;
  for (let nm = 380; nm <= 750; nm += 5) {
    const [cr, cg, cb] = wavelengthRgb(nm);
    const w = weight(nm);
    r += w * cr;
    g += w * cg;
    b += w * cb;
    wr += cr;
    wg += cg;
    wb += cb;
  }
  return [r / wr, g / wg, b / wb];
}
