/** Опростени модели за урока „Селско стопанство“. */

export type Variety = { name: string; Ymax: number; aN: number };

/** Традиционен сорт и високодобивен сорт от зелената революция (t/ha, kg N/ha). */
export const VARIETIES: Variety[] = [
  { name: 'Традиционен сорт', Ymax: 3.5, aN: 40 },
  { name: 'Високодобивен сорт', Ymax: 9, aN: 70 },
];

const SOIL_N = 30; // азот, който почвата дава сама, kg/ha
const SOIL_P = 5;
const AP = 12;

/** Крива на Мичерлих: добив при N kg/ha внесен азот. */
export const yieldN = (v: Variety, N: number) => v.Ymax * (1 - Math.exp(-(N + SOIL_N) / v.aN));
/** Добив при P kg/ha внесен фосфор. */
export const yieldP = (v: Variety, P: number) => v.Ymax * (1 - Math.exp(-(P + SOIL_P) / AP));
/** Добив, ограничен от водата (Френч и Шулц): около 20 kg/ha на mm над 110 mm. */
export const yieldW = (W: number) => Math.max(0, 0.02 * (W - 110));

/**
 * Икономически изгодното количество азот: допълнителният килограм N носи точно толкова зърно, колкото струва
 * (ratio kg зърно за 1 kg N). Над тавана cap от другите фактори азотът е безполезен.
 */
export function econOptimumN(v: Variety, ratio: number, cap: number): number | null {
  // dY/dN в kg зърно на kg N = 1000·Ymax/aN·e^{−(N+N₀)/aN}
  const nEcon = -v.aN * Math.log((ratio * v.aN) / (1000 * v.Ymax)) - SOIL_N;
  const nCap = cap >= v.Ymax ? Infinity : -v.aN * Math.log(1 - cap / v.Ymax) - SOIL_N;
  const n = Math.min(nEcon, nCap);
  return n <= 0 ? null : n;
}

/** Колко калории от растения струва една калория от животински продукт (дял на превърнатата енергия). */
export const ANIMALS = [
  { name: 'Говеждо', eff: 0.03 },
  { name: 'Свинско', eff: 0.1 },
  { name: 'Пилешко', eff: 0.13 },
  { name: 'Мляко', eff: 0.24 },
];

export const KCAL_DAY = 2500;
export const KCAL_PER_KG_GRAIN = 3400;
