// Помощни функции за уроците по теория на числата.

/** Разлагане на прости множители: 360 → [[2, 3], [3, 2], [5, 1]]. */
export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let p = 2; p * p <= n; p++) {
    let e = 0;
    while (n % p === 0) {
      n /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

/** Всички делители на n във възходящ ред. */
export function divisors(n: number) {
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d * d !== n) large.unshift(n / d);
    }
  }
  return [...small, ...large];
}

export function isPrime(n: number) {
  const f = factorize(n);
  return n >= 2 && f.length === 1 && f[0][1] === 1;
}
