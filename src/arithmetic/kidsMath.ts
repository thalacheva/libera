// Помощници за детските игри: случайни числа, похвали, запис на числата.

export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
export const pick = <T,>(xs: readonly T[]) => xs[randInt(0, xs.length - 1)];
export function shuffled<T>(xs: readonly T[]) {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PRAISE = ['Браво!', 'Супер!', 'Точно така!', 'Отлично!', 'Страхотно!', 'Умница!', 'Чудесно!'];
const TRY_AGAIN = ['Опитай пак!', 'Почти! Още веднъж.', 'Не се отказвай!', 'Помисли още малко.'];
export const praise = () => pick(PRAISE);
export const tryAgain = () => pick(TRY_AGAIN);

/** Число с интервал за хилядите, както в учебниците: 12 345. */
export const fmt = (n: number) => (Math.abs(n) >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : String(n));

/** Звезди по брой грешки в един рунд. */
export const starsFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
