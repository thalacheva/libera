// Конволюция върху малки картинки: плъзгане на ядро, обединяване, размер на изхода и рецептивно поле.

export type Grid = number[][];

/** Размер на изхода по една посока: ⌊(n − k + 2p) / s⌋ + 1 (0, ако ядрото не се побира). */
export function outSize(n: number, k: number, pad = 0, stride = 1): number {
  const free = n - k + 2 * pad;
  return free < 0 ? 0 : Math.floor(free / stride) + 1;
}

/**
 * Плъзга ядрото по картинката и на всяка позиция събира произведенията „пиксел · тегло“.
 * Ядрото не се обръща – строго погледнато това е кръстосана корелация, както в невронните мрежи.
 * Извън картинката (при допълване) стойностите са нули.
 */
export function conv2d(img: Grid, kernel: Grid, pad = 0, stride = 1): Grid {
  const rows = outSize(img.length, kernel.length, pad, stride);
  const cols = outSize(img[0].length, kernel[0].length, pad, stride);
  const out: Grid = [];
  for (let r = 0; r < rows; r++) {
    const line: number[] = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let i = 0; i < kernel.length; i++)
        for (let j = 0; j < kernel[0].length; j++) sum += (img[r * stride - pad + i]?.[c * stride - pad + j] ?? 0) * kernel[i][j];
      line.push(sum);
    }
    out.push(line);
  }
  return out;
}

/** Обединяване по максимум: най-голямото число във всяко квадратче size × size (непълните квадратчета се изпускат). */
export function maxPool(grid: Grid, size = 2): Grid {
  const rows = Math.floor(grid.length / size);
  const cols = Math.floor(grid[0].length / size);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      let best = -Infinity;
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) best = Math.max(best, grid[r * size + i][c * size + j]);
      return best;
    })
  );
}

/** Един слой, гледан по една посока: ширина на прозореца, стъпка и допълване. */
export type Layer = { k: number; s: number; p: number };

export const CONV3: Layer = { k: 3, s: 1, p: 1 };
export const POOL2: Layer = { k: 2, s: 2, p: 0 };

/** Ширина на рецептивното поле на една клетка след всички слоеве (без да се реже до края на картинката). */
export function receptiveField(layers: Layer[]): number {
  let r = 1;
  let jump = 1;
  for (const l of layers) {
    r += (l.k - 1) * jump;
    jump *= l.s;
  }
  return r;
}

/** От кой до кой входен пиксел (по една посока) зависи изходната клетка `index`; може да излиза извън картинката. */
export function fieldRange(layers: Layer[], index: number): [number, number] {
  let lo = index;
  let hi = index;
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    lo = lo * l.s - l.p;
    hi = hi * l.s - l.p + l.k - 1;
  }
  return [lo, hi];
}

/** Размерът на картата след всички слоеве при вход с ширина n. */
export const sizeAfter = (n: number, layers: Layer[]) => layers.reduce((m, l) => outSize(m, l.k, l.p, l.s), n);

/** Най-голямата стойност в картата и мястото ѝ. */
export function argMax(grid: Grid): { value: number; r: number; c: number } {
  let best = { value: -Infinity, r: 0, c: 0 };
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v > best.value) best = { value: v, r, c };
    })
  );
  return best;
}

/** Картинка от редове с цифри: '0' – тъмно … '9' – светло (стойности от 0 до 1). */
export const fromRows = (rows: string[]): Grid => rows.map(r => r.split('').map(ch => Number(ch) / 9));

/** Поставя малка фигура в празна картинка size × size с горен ляв ъгъл (top, left). */
export function place(shape: Grid, size: number, top: number, left: number): Grid {
  const g: Grid = Array.from({ length: size }, () => Array(size).fill(0));
  shape.forEach((row, i) =>
    row.forEach((v, j) => {
      if (g[top + i]?.[left + j] !== undefined) g[top + i][left + j] = v;
    })
  );
  return g;
}

/** Сбор от произведенията клетка по клетка – това пресмята един неврон, свързан с всички пиксели. */
export const dot = (a: Grid, b: Grid) => a.reduce((s, row, i) => s + row.reduce((t, v, j) => t + v * b[i][j], 0), 0);
