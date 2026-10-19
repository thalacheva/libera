// Точно pH на воден разтвор при 25 °C от уравнението за електронеутралност:
// [H⁺] + [Na⁺] = [OH⁻] + [A⁻] + [Cl⁻], където [A⁻] = c·Ka / (Ka + [H⁺]).

export const KW = 1e-14;

/**
 * pH на разтвор със слаба киселина HA (обща концентрация `weak`, константа `Ka`),
 * натриеви йони `na` (от NaOH или от солта NaA) и хлоридни йони `cl` (от HCl). Всичко в mol/L.
 * За силна киселина подай голямо Ka (например 1e6).
 */
export function phOf(weak: number, Ka: number, na = 0, cl = 0) {
  // Лявата страна минус дясната расте с [H⁺] – търсим нулата с разполовяване по lg[H⁺]
  let lo = -16;
  let hi = 2;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    const h = 10 ** m;
    const f = h + na - KW / h - (weak * Ka) / (Ka + h) - cl;
    if (f > 0) hi = m;
    else lo = m;
  }
  return -(lo + hi) / 2;
}

/** Число в научен запис с горни индекси: 0.00012 → „1,2·10⁻⁴“. */
export function sci(v: number, digits = 2) {
  if (v === 0) return '0';
  let e = Math.floor(Math.log10(v));
  let m = Number((v / 10 ** e).toPrecision(digits));
  if (m >= 10) {
    m /= 10;
    e += 1;
  }
  const sup = String(e).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  const ms = m.toFixed(digits - 1).replace('.', ',');
  return e === 0 ? ms : `${ms}·10${sup}`;
}

export const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',').replace(/^-/, '−');
