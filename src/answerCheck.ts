// Проверка на числови отговори – за задачите от живота (WordProblems) и задачите за упражнение (Task).

/** Число от текст: „2,5“, „−3“, „3/2“, „1 000“; празно или невалидно – null. */
export function parseNum(s: string) {
  const t = s.trim().replace(/\s/g, '').replace(',', '.').replace(/−/g, '-');
  if (t === '') return null;
  if (t.includes('/')) {
    const [p, q] = t.split('/').map(Number);
    return Number.isNaN(p) || Number.isNaN(q) || q === 0 ? null : p / q;
  }
  const v = Number(t);
  return Number.isNaN(v) ? null : v;
}

/**
 * Достатъчно близо – прощаваме закръгляне до около 0,6% (и до 0,01 при числа като 0,67 за 2/3).
 * При много малки отговори (0,014) абсолютният допуск се свива, за да не минава всичко около нулата.
 */
export const close = (a: number, b: number) => Math.abs(a - b) <= (b === 0 ? 0.011 : Math.max(Math.abs(b) * 0.006, Math.min(0.011, Math.abs(b) * 0.05)));

/** Всички стойности съвпадат с очакваните – поред. */
export const matchesInOrder = (values: (number | null)[], expected: number[]) =>
  values.length === expected.length && values.every((v, i) => v !== null && close(v, expected[i]));

/** Всички стойности съвпадат с очакваните – в произволен ред. */
export function matches(values: (number | null)[], expected: number[]) {
  if (values.some(v => v === null)) return false;
  const left = expected.slice();
  for (const v of values as number[]) {
    const k = left.findIndex(e => close(v, e));
    if (k < 0) return false;
    left.splice(k, 1);
  }
  return true;
}
