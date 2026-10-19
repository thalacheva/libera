// Цветове на индикаторите и на универсалния индикатор при дадено pH (приблизителни, за илюстрация).

type Stop = [number, string];

const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));

/** Линейна интерполация на цвят между опорни точки [pH, #rrggbb]. */
export function colorAt(stops: Stop[], pH: number) {
  if (pH <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    if (pH <= p1) {
      const [p0, c0] = stops[i - 1];
      const t = (pH - p0) / (p1 - p0);
      const [a, b] = [hex(c0), hex(c1)];
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(',')})`;
    }
  }
  return stops[stops.length - 1][1];
}

export const UNIVERSAL: Stop[] = [
  [0, '#b3141c'],
  [2, '#e8412c'],
  [3, '#f07f2b'],
  [4, '#f5b02e'],
  [5, '#f2d930'],
  [6, '#b9d531'],
  [7, '#3fae49'],
  [8, '#1a9a7a'],
  [9, '#2a77b8'],
  [10, '#3953a4'],
  [11, '#4b3c97'],
  [12, '#5e2a84'],
  [14, '#4a1f6b'],
];

/** „Безцветно“ – почти бяло, за да се вижда в епруветката. */
export const COLORLESS = '#f1f5f9';

export type Indicator = { name: string; lo: number; hi: number; from: string; to: string; stops: Stop[] };

const ind = (name: string, lo: number, hi: number, from: string, to: string, c0: string, c1: string, mid?: string): Indicator => ({
  name,
  lo,
  hi,
  from,
  to,
  stops: mid ? [[lo, c0], [(lo + hi) / 2, mid], [hi, c1]] : [[lo, c0], [hi, c1]],
});

// Интервали на преход – по справочните таблици (закръглени; в различните източници се разминават с 0,1–0,2)
export const METHYL_ORANGE = ind('метилоранж', 3.1, 4.4, 'червен', 'жълт', '#e0312b', '#f6c624', '#f08a2a');
export const METHYL_RED = ind('метилчервено', 4.4, 6.2, 'червен', 'жълт', '#d9283a', '#f3d23a', '#f08a2a');
export const BROMOTHYMOL_BLUE = ind('бромтимолово синьо', 6.0, 7.6, 'жълт', 'син', '#e9d43a', '#2563c9', '#3fa34d');
export const PHENOLPHTHALEIN = ind('фенолфталеин', 8.2, 10.0, 'безцветен', 'малиновочервен', COLORLESS, '#d6198a', '#f29bc9');
export const THYMOLPHTHALEIN = ind('тимолфталеин', 9.3, 10.5, 'безцветен', 'син', COLORLESS, '#2850c8', '#9db4ee');
export const LITMUS = ind('лакмус', 4.5, 8.3, 'червен', 'син', '#d9363e', '#2f6fd0', '#8e44ad');
