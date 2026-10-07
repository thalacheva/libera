// Обща физика на светлината за Лекция 9.

export const C = 2.998e8; // m/s
export const H_PLANCK = 6.626e-34; // J·s
export const K_BOLTZMANN = 1.381e-23; // J/K
export const WIEN = 2.898e-3; // m·K
export const EV = 1.602e-19; // J
export const T_SUN = 5772; // K

/** Число с десетична запетая. */
export const dec = (v: number, digits = 1) =>
  v.toLocaleString('bg-BG', { maximumFractionDigits: digits, useGrouping: true });

/** Дължина на вълната в метри → „550 nm“, „2,1 cm“, „3 m“… */
export function formatLength(m: number) {
  const units: [number, string][] = [
    [1e3, 'km'],
    [1, 'm'],
    [1e-2, 'cm'],
    [1e-3, 'mm'],
    [1e-6, 'µm'],
    [1e-9, 'nm'],
    [1e-12, 'pm'],
  ];
  const [factor, unit] = units.find(([f]) => m >= f * 0.999) ?? units[units.length - 1];
  const v = m / factor;
  return `${dec(v, v < 10 ? 2 : v < 100 ? 1 : 0)} ${unit}`;
}

/** Честота в Hz → „545 THz“, „1,4 GHz“… */
export function formatFrequency(hz: number) {
  const units: [number, string][] = [
    [1e18, 'EHz'],
    [1e15, 'PHz'],
    [1e12, 'THz'],
    [1e9, 'GHz'],
    [1e6, 'MHz'],
    [1e3, 'kHz'],
    [1, 'Hz'],
  ];
  const [factor, unit] = units.find(([f]) => hz >= f * 0.999) ?? units[units.length - 1];
  const v = hz / factor;
  return `${dec(v, v < 10 ? 2 : v < 100 ? 1 : 0)} ${unit}`;
}

/** Енергия на фотон в eV → „2,25 eV“, „12 keV“, „5 µeV“… */
export function formatEnergy(ev: number) {
  const units: [number, string][] = [
    [1e6, 'MeV'],
    [1e3, 'keV'],
    [1, 'eV'],
    [1e-3, 'meV'],
    [1e-6, 'µeV'],
    [1e-9, 'neV'],
  ];
  const [factor, unit] = units.find(([f]) => ev >= f * 0.999) ?? units[units.length - 1];
  const v = ev / factor;
  return `${dec(v, v < 10 ? 2 : v < 100 ? 1 : 0)} ${unit}`;
}

/**
 * Приблизителен цвят на монохроматична светлина (алгоритъм на Дан Брутън).
 * Извън видимата област връща тъмен цвят.
 */
export function wavelengthToRGB(nm: number, gamma = 0.8): string {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }
  // Яркостта отслабва към краищата на видимата област
  let f = 0;
  if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm >= 420 && nm <= 700) f = 1;
  else if (nm > 700 && nm <= 780) f = 0.3 + (0.7 * (780 - nm)) / 80;
  const c = (v: number) => Math.round(255 * (v * f) ** gamma);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

export const colorName = (nm: number) => {
  if (nm < 380) return 'ултравиолетово';
  if (nm < 450) return 'виолетово';
  if (nm < 485) return 'синьо';
  if (nm < 500) return 'синьо-зелено';
  if (nm < 565) return 'зелено';
  if (nm < 590) return 'жълто';
  if (nm < 625) return 'оранжево';
  if (nm <= 750) return 'червено';
  return 'инфрачервено';
};

/** Закон на Планк: спектрална плътност на излъчване B(λ, T), W·sr⁻¹·m⁻³. */
export function planck(lambdaM: number, T: number) {
  const a = (2 * H_PLANCK * C * C) / lambdaM ** 5;
  const x = (H_PLANCK * C) / (lambdaM * K_BOLTZMANN * T);
  return a / Math.expm1(x);
}

/** Приблизителен цвят на черно тяло с температура T (по Танър Хеланд). */
export function temperatureToRGB(T: number): string {
  const t = T / 100;
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

// ---------- Спектрални линии ----------

export type Line = { nm: number; strength: number };

export type Element = {
  id: string;
  symbol: string;
  name: string;
  lines: Line[];
};

/** Най-ярките линии във видимата област (дължини във въздух, nm). */
export const ELEMENTS: Element[] = [
  {
    id: 'H',
    symbol: 'H',
    name: 'Водород',
    lines: [
      { nm: 656.3, strength: 1 },
      { nm: 486.1, strength: 0.8 },
      { nm: 434.0, strength: 0.6 },
      { nm: 410.2, strength: 0.45 },
      { nm: 397.0, strength: 0.35 },
    ],
  },
  {
    id: 'He',
    symbol: 'He',
    name: 'Хелий',
    lines: [
      { nm: 447.1, strength: 0.6 },
      { nm: 471.3, strength: 0.35 },
      { nm: 492.2, strength: 0.4 },
      { nm: 501.6, strength: 0.6 },
      { nm: 587.6, strength: 1 },
      { nm: 667.8, strength: 0.6 },
      { nm: 706.5, strength: 0.5 },
    ],
  },
  {
    id: 'Na',
    symbol: 'Na',
    name: 'Натрий',
    lines: [
      { nm: 589.0, strength: 1 },
      { nm: 589.6, strength: 0.9 },
      { nm: 568.8, strength: 0.25 },
      { nm: 498.3, strength: 0.15 },
      { nm: 615.4, strength: 0.15 },
    ],
  },
  {
    id: 'Hg',
    symbol: 'Hg',
    name: 'Живак',
    lines: [
      { nm: 404.7, strength: 0.7 },
      { nm: 435.8, strength: 1 },
      { nm: 546.1, strength: 1 },
      { nm: 577.0, strength: 0.6 },
      { nm: 579.1, strength: 0.6 },
    ],
  },
  {
    id: 'Ne',
    symbol: 'Ne',
    name: 'Неон',
    lines: [
      { nm: 540.1, strength: 0.4 },
      { nm: 585.2, strength: 1 },
      { nm: 588.2, strength: 0.6 },
      { nm: 594.5, strength: 0.7 },
      { nm: 603.0, strength: 0.5 },
      { nm: 607.4, strength: 0.6 },
      { nm: 614.3, strength: 0.8 },
      { nm: 616.4, strength: 0.5 },
      { nm: 621.7, strength: 0.5 },
      { nm: 626.6, strength: 0.6 },
      { nm: 633.4, strength: 0.7 },
      { nm: 640.2, strength: 0.9 },
      { nm: 650.7, strength: 0.6 },
      { nm: 659.9, strength: 0.5 },
      { nm: 692.9, strength: 0.6 },
      { nm: 703.2, strength: 0.7 },
    ],
  },
  {
    id: 'Ca',
    symbol: 'Ca⁺',
    name: 'Йонизиран калций',
    lines: [
      { nm: 393.4, strength: 1 },
      { nm: 396.8, strength: 0.9 },
    ],
  },
  {
    id: 'Mg',
    symbol: 'Mg',
    name: 'Магнезий',
    lines: [
      { nm: 516.7, strength: 0.6 },
      { nm: 517.3, strength: 0.8 },
      { nm: 518.4, strength: 1 },
    ],
  },
  {
    id: 'Fe',
    symbol: 'Fe',
    name: 'Желязо',
    lines: [
      { nm: 404.6, strength: 0.6 },
      { nm: 427.2, strength: 0.6 },
      { nm: 438.4, strength: 0.7 },
      { nm: 440.5, strength: 0.5 },
      { nm: 495.8, strength: 0.4 },
      { nm: 527.0, strength: 0.8 },
      { nm: 532.8, strength: 0.5 },
      { nm: 537.1, strength: 0.4 },
    ],
  },
];

export const element = (id: string) => ELEMENTS.find(e => e.id === id)!;

/** Енергия на ниво n във водородния атом, eV. */
export const hydrogenLevel = (n: number) => -13.6 / (n * n);

/** Формула на Ридберг: дължина на вълната (nm, във въздух – като в таблиците) на прехода n₂ → n₁. */
export const rydberg = (n1: number, n2: number) => 1 / (1.0971e-2 * (1 / (n1 * n1) - 1 / (n2 * n2)));
