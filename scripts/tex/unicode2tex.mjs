// Превръща формули, записани с Unicode (x², √D, x₁,₂, −, ·, ⇒, M☉ …), в LaTeX
// и намира кои участъци от българския текст са формули.
// Тестове: node scripts/tex/test.mjs

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')', 'ⁿ': 'n', 'ⁱ': 'i', 'ᵐ': 'm', 'ᵏ': 'k', 'ˣ': 'x', 'ʸ': 'y', 'ᶜ': 'c', 'ᵃ': 'a', 'ᵇ': 'b', 'ᵈ': 'd', 'ᵗ': 't', 'ʰ': 'h', 'ˢ': 's' };
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')', 'ₙ': 'n', 'ₓ': 'x', 'ᵧ': 'y', 'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₚ': 'p', 'ₖ': 'k', 'ₘ': 'm', 'ₜ': 't', 'ᵢ': 'i', 'ⱼ': 'j', 'ₗ': 'l', 'ₛ': 's', 'ₕ': 'h', 'ᵣ': 'r' };
const GREEK = { 'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\varepsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta', 'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu', 'ϑ': '\\vartheta', 'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\varphi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega', 'Δ': '\\Delta', 'Σ': '\\Sigma', 'Ω': '\\Omega', 'Φ': '\\Phi', 'Λ': '\\Lambda', 'Γ': '\\Gamma', 'Θ': '\\Theta', 'Π': '\\Pi' };
// Знаци, които след буква са индекс: M☉ → M_{\odot}, v⊥ → v_{\perp}
const SUBSCRIPTABLE = { '☉': '\\odot', '⊕': '\\oplus', '★': '\\star', '☾': '\\text{☾}', '♈': '\\text{♈}', '♃': '\\text{♃}', '⊥': '\\perp', '∞': '\\infty' };
const VULGAR = { '½': '\\tfrac{1}{2}', '⅓': '\\tfrac{1}{3}', '⅔': '\\tfrac{2}{3}', '¼': '\\tfrac{1}{4}', '¾': '\\tfrac{3}{4}' };
const OPS = { '−': '-', '·': '\\cdot ', '×': '\\times ', '±': '\\pm ', '∓': '\\mp ', '≤': '\\le ', '≥': '\\ge ', '≠': '\\ne ', '≈': '\\approx ', '⇒': '\\Rightarrow ', '⇔': '\\iff ', '→': '\\to ', '∞': '\\infty ', '∠': '\\angle ', '∥': '\\parallel ', '⊥': '\\perp ', '∈': '\\in ', '∉': '\\notin ', '∪': '\\cup ', '∩': '\\cap ', '⊂': '\\subset ', '÷': '\\div ', '∝': '\\propto ', '…': '\\ldots ', '′': "'", '″': "''", '%': '\\%', '~': '\\sim ', '∼': '\\sim ', '≳': '\\gtrsim ', '≲': '\\lesssim ', 'ℝ': '\\mathbb{R}', 'ℳ': '\\mathcal{M}', '↔': '\\leftrightarrow ', '↑': '\\uparrow ', '↓': '\\downarrow ', '⁄': '/', 'µ': '\\mu ', '∑': '\\sum ', '∫': '\\int ', '∂': '\\partial ', '∇': '\\nabla ', '≡': '\\equiv ', '≪': '\\ll ', '≫': '\\gg ', '☉': '\\odot ', '⊕': '\\oplus ', '★': '\\star ', '☾': '\\text{☾}', '♈': '\\text{♈}', '♃': '\\text{♃}' };
const FUNCS = ['arcsin', 'arccos', 'arctg', 'cotg', 'sin', 'cos', 'tan', 'cot', 'tg', 'log', 'lg', 'ln', 'exp', 'lim'];
// Мерни единици: пишат се изправено (по-дългите – първи)
const UNITS = ['km/s/Mpc', 'mol/l', 'km/s', 'km/h', 'm/s²', 'm/s', 'µas', 'mas', 'mag', 'ppm', 'min', 'Gpc', 'Mpc', 'kpc', 'pc', 'Gyr', 'AU', 'ly', 'km', 'cm', 'dm', 'mm', 'nm', 'µm', 'pm', 'ms', 'kg', 'kt', 'mK', 'eV', 'MeV', 'keV', 'GeV', 'Hz', 'kHz', 'MHz', 'GHz', 'MPa', 'kPa', 'Pa', 'rad', 'dB', 'g', 'm', 's', 'h', 'K', 'W', 'J', 'N'];
// Единици и без число пред тях: (g/cm³), (в mol/l)
const STANDALONE_UNITS = ['km/s/Mpc', 'g/cm³', 'kg/m³', 'W/m²', 'km/s', 'km/h', 'm/s²', 'm/s', 'mol/l'];
const CHEM = ['H₂O', 'CO₂', 'CH₄', 'NH₃', 'SO₂', 'CO⁺', 'O₂', 'N₂', 'H₂', 'O₃'];

const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const SUPS = Object.keys(SUP).join('');
const SUBS = Object.keys(SUB).join('');
const GREEKS = Object.keys(GREEK).join('');
const SUP_RE = new RegExp(`[${SUPS}]`);
const SUB_RE = new RegExp(`[${SUBS}]`);
const LETTER = new RegExp(`[A-Za-z${GREEKS}]`);
const CYR = /[А-Яа-яЁёЀ-ӿ]/;

// Заместители: дроби, буквална наклонена черта, тесен интервал в число, тире в интервал, „/“ в степен, готови парчета LaTeX
const F_OPEN = '', F_MID = '', F_CLOSE = '', SLASH = '', THIN = '', DASH = '', EXP_SLASH = '', T_OPEN = '', T_CLOSE = '';

// ---------- Операнди на дроби ----------

const ATOM_RE = new RegExp(`[A-Za-z0-9${GREEKS}${SUPS}${SUBS}☉⊕★☾!√∛∜°_*'${THIN}${T_OPEN}${T_CLOSE}]`);
const isAtom = (s, k) =>
  ATOM_RE.test(s[k] ?? '') ||
  (s[k] === ',' && /\d/.test(s[k - 1] ?? '') && /\d/.test(s[k + 1] ?? '')) ||
  // индекс на кирилица: T_Йо, Rп
  (CYR.test(s[k] ?? '') && (/_[А-Яа-яЁё]*$/.test(s.slice(Math.max(0, k - 20), k)) || new RegExp(`(^|[^A-Za-z${GREEKS}А-Яа-яЁё])[A-Za-z${GREEKS}][а-яё]*$`).test(s.slice(Math.max(0, k - 6), k))));
const isSuffix = ch => SUP_RE.test(ch) || SUB_RE.test(ch) || ch === '!' || ch === '′' || ch === '″';

function groupEnd(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '(') depth++;
    else if (s[j] === ')' && --depth === 0) return j + 1;
  }
  return -1;
}
function groupStart(s, end) {
  let depth = 0;
  for (let j = end - 1; j >= 0; j--) {
    if (s[j] === ')') depth++;
    else if (s[j] === '(' && --depth === 0) return j;
  }
  return -1;
}

/** Началото на „единицата“ (атом или група в скоби, с индексите/степените ѝ), която завършва на pos. */
function prevUnit(s, pos) {
  let e = pos;
  while (e > 0 && isSuffix(s[e - 1]) && s[e - 2] !== undefined && (s[e - 2] === ')' || isSuffix(s[e - 2]))) e--;
  if (s[e - 1] === ')') {
    let st = groupStart(s, e);
    if (st < 0) return -1;
    while (st > 0 && /[√∛∜]/.test(s[st - 1])) st--;
    // група в степен: a^(…) – заедно с основата
    if (s[st - 1] === '^') return prevUnit(s, st - 1);
    return st;
  }
  let st = pos;
  while (st > 0 && isAtom(s, st - 1)) st--;
  return st === pos ? -1 : st;
}

function leftOperand(s, end) {
  let e = end;
  while (e > 0 && s[e - 1] === ' ') e--;
  let st = prevUnit(s, e);
  if (st < 0) return null;
  for (;;) {
    // множители един до друг: n(n − 1), (a − 2)(a + 2), 3x
    if (st > 0 && (s[st - 1] === ')' || isAtom(s, st - 1))) {
      const p = prevUnit(s, st);
      if (p < 0 || p === st) break;
      st = p;
      continue;
    }
    // научен запис и плътни произведения: 6,674·10⁻¹¹·(…)²
    if (s[st - 1] === '·' && st > 1 && s[st - 2] !== ' ') {
      const p = prevUnit(s, st - 1);
      if (p < 0) break;
      st = p;
      continue;
    }
    break;
  }
  // „lg 3“, „sin α“ – функцията е част от операнда
  const before = s.slice(0, st).match(/(?:^|[^A-Za-z])((?:lg|ln|log(?:_[a-z0-9]|[₀-₉]+)?|sin|cos|tg|cotg) )$/);
  if (before) st -= before[1].length;
  return { start: st, end: e };
}

function rightOperand(s, start) {
  let b = start;
  while (s[b] === ' ') b++;
  let e = b;
  if (s[e] === '−' || s[e] === '-') e++;
  const fn = s.slice(e).match(/^(?:lg|ln|log(?:_[a-z0-9]|[₀-₉]+)?|sin|cos|tg|cotg) (?=[A-Za-z0-9α-ω(])/);
  if (fn) e += fn[0].length;
  const begin = e;
  for (;;) {
    if (s[e] === '(') {
      const g = groupEnd(s, e);
      if (g < 0) return null;
      e = g;
    } else if (/[√∛∜]/.test(s[e] ?? '') && s[e + 1] === '(') {
      const g = groupEnd(s, e + 1);
      if (g < 0) return null;
      e = g;
    } else if (isAtom(s, e)) {
      while (isAtom(s, e) && !(/[√∛∜]/.test(s[e]) && s[e + 1] === '(')) e++;
    } else break;
    while (isSuffix(s[e] ?? '')) e++;
    // научен запис: 1,737·10⁶
    if (s[e] === '·' && /^10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(s.slice(e + 1))) {
      e++;
      continue;
    }
    if (s[e] === '(' || isAtom(s, e) || (/[√∛∜]/.test(s[e] ?? '') && s[e + 1] === '(')) continue;
    break;
  }
  if (e === begin) return null;
  return { start: b, end: e };
}

const stripParens = t => {
  t = t.trim();
  if (t.startsWith('(') && groupEnd(t, 0) === t.length) return t.slice(1, -1).trim();
  return t;
};

// ---------- Unicode → LaTeX ----------

/** Превръща една формула от Unicode в LaTeX. tokens – готови парчета LaTeX (единици и др.). */
export function toTex(src, tokens = []) {
  let s = src;
  // „/“ в степен с група остава наклонена черта: L^(1/4)
  s = s.replace(/\^\(/g, (m, offset) => m).replace(/\^\(([^()]*)\)/g, (m, inner) => `^(${inner.replace(/\//g, EXP_SLASH)})`);

  // Дроби a/b → \frac{a}{b} (отдясно наляво, за да работят вложените)
  for (let guard = 0; guard < 40; guard++) {
    let idx = -1;
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i] === '/' && s[i + 1] !== '/' && s[i - 1] !== '/') { idx = i; break; }
    }
    if (idx < 0) break;
    const L = leftOperand(s, idx);
    const R = rightOperand(s, idx + 1);
    const spaced = s[idx - 1] === ' ' && s[idx + 1] === ' ';
    const groupSide = L && R && (/[)⁰¹²³⁴⁵⁶⁷⁸⁹!]$/.test(s.slice(L.start, L.end)) && s.slice(L.start, L.end).includes('(') || s[R.start] === '(');
    if (!L || !R || (spaced && !groupSide)) {
      s = s.slice(0, idx) + SLASH + s.slice(idx + 1);
      continue;
    }
    const num = stripParens(s.slice(L.start, L.end));
    const den = stripParens(s.slice(R.start, R.end));
    s = s.slice(0, L.start) + F_OPEN + num + F_MID + den + F_CLOSE + s.slice(R.end);
  }

  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = s[i - 1] ?? '';
    const next = s[i + 1] ?? '';
    if (c === F_OPEN) { out += '\\frac{'; continue; }
    if (c === F_MID) { out += '}{'; continue; }
    if (c === F_CLOSE) { out += '}'; continue; }
    if (c === SLASH || c === EXP_SLASH) { out += '/'; continue; }
    if (c === THIN) { out += '\\,'; continue; }
    if (c === DASH) { out += '\\text{–}'; continue; }
    if (c === T_OPEN) {
      const k = s.indexOf(T_CLOSE, i);
      out += tokens[+s.slice(i + 1, k)];
      i = k;
      continue;
    }
    if (SUP_RE.test(c)) {
      let j = i;
      let t = '';
      while (j < s.length && (SUP_RE.test(s[j]) || (s[j] === '·' && /\d/.test(SUP[s[j - 1]] ?? '') && /\d/.test(SUP[s[j + 1]] ?? '')))) {
        t += s[j] === '·' ? '{,}' : SUP[s[j]];
        j++;
      }
      if (s[j] === '√') {
        const R = rightOperand(s, j + 1);
        if (R) { out += `\\sqrt[${t}]{${toTex(stripParens(s.slice(R.start, R.end)), tokens)}}`; i = R.end - 1; continue; }
      }
      // звездна величина, часове: 6ᵐ, 12ʰ
      if (/^[mhs]$/.test(t) && /\d/.test(prev)) out += `^{\\mathrm{${t}}}`;
      else out += t.length === 1 ? `^${t}` : `^{${t}}`;
      i = j - 1;
      continue;
    }
    if (SUB_RE.test(c)) {
      let j = i;
      let t = '';
      while (j < s.length && (SUB_RE.test(s[j]) || (s[j] === ',' && SUB_RE.test(s[j + 1] ?? '')))) { t += s[j] === ',' ? ',' : SUB[s[j]]; j++; }
      out += t.length === 1 ? `_${t}` : `_{${t}}`;
      i = j - 1;
      continue;
    }
    if (c === '√' || c === '∛' || c === '∜') {
      const R = rightOperand(s, i + 1);
      const index = c === '∛' ? '[3]' : c === '∜' ? '[4]' : '';
      if (R) { out += `\\sqrt${index}{${toTex(stripParens(s.slice(R.start, R.end)), tokens)}}`; i = R.end - 1; continue; }
      out += '\\sqrt{}';
      continue;
    }
    // M☉, v⊥, ρ☉ – индекс
    if (SUBSCRIPTABLE[c] && LETTER.test(prev)) { out += `_{${SUBSCRIPTABLE[c]}}`; continue; }
    if (VULGAR[c]) { out += VULGAR[c]; continue; }
    if (c === 'Ṁ') { out += '\\dot M'; continue; }
    // буква, последвана направо от дума на кирилица: Rп, λнабл → индекс
    if (LETTER.test(c) && !LETTER.test(prev) && CYR.test(next)) {
      const w = s.slice(i + 1).match(/^[А-Яа-яЁё]+/)[0];
      out += `${GREEK[c] ?? c}_{\\text{${w}}}`;
      i += w.length;
      continue;
    }
    if (GREEK[c]) {
      out += GREEK[c];
      // λmax → λ_{max}
      const w = s.slice(i + 1).match(/^[a-z]{2,}/)?.[0];
      if (w && !FUNCS.includes(w) && !/[A-Za-z]/.test(s[i + 1 + w.length] ?? '')) {
        out += `_{\\mathrm{${w}}}`;
        i += w.length;
      } else if (/[A-Za-z]/.test(next)) out += ' ';
      continue;
    }
    // ′ и ″ след горен индекс: 10⁻⁵″ → 10^{-5}{}''
    if ((c === '′' || c === '″') && out.trimEnd().endsWith('}')) { out = out.trimEnd() + '{}' + OPS[c]; continue; }
    if (OPS[c] !== undefined) { out += OPS[c]; continue; }
    if (c === '°') { out += '^\\circ'; continue; }
    if (c === '_' && CYR.test(next)) {
      const w = s.slice(i + 1).match(/^[А-Яа-яЁё]+/)[0];
      out += `_{\\text{${w}}}`;
      i += w.length;
      continue;
    }
    if (c === '_' && /^[A-Za-z]{2,}/.test(s.slice(i + 1))) {
      const w = s.slice(i + 1).match(/^[A-Za-z]+/)[0];
      out += `_{\\mathrm{${w}}}`;
      i += w.length;
      continue;
    }
    if (c === '^') {
      const R = rightOperand(s, i + 1);
      if (R) { out += `^{${toTex(stripParens(s.slice(R.start, R.end)), tokens)}}`; i = R.end - 1; continue; }
    }
    // десетична запетая (и 0,(6))
    if (c === ',' && /\d/.test(prev) && /[\d(]/.test(next)) { out += '{,}'; continue; }
    if (c === ',' && next === ' ') { out += ',\\ '; i++; continue; }
    // „x = −3; x = 4“ – две равенства: по-голям интервал; „(−2; 3)“ – координати
    if (c === ';' && next === ' ') {
      const after = s.slice(i + 2).split(';')[0];
      const before = s.slice(0, i).split(';').pop();
      out += /[=<>≤≥≈⇒⇔]/.test(after) && /[=<>≤≥≈⇒⇔]/.test(before) ? ';\\quad ' : ';\\ ';
      i++;
      continue;
    }
    if (/[a-z]/.test(c) && !LETTER.test(prev) && prev !== '\\') {
      const f = FUNCS.find(f => s.startsWith(f, i) && !/[a-z]/.test(s[i + f.length] ?? ''));
      if (f) { out += `\\${f} `; i += f.length - 1; continue; }
    }
    out += c;
  }
  return out
    .replace(/ +/g, ' ')
    .replace(/\\(cdot|times|pm|mp|le|ge|ne|approx|Rightarrow|iff|to|infty|angle|parallel|perp|in|notin|cup|cap|subset|div|propto|ldots|sim|odot|oplus|star) (?=[\s)}\]]|$)/g, '\\$1')
    .trim();
}

// ---------- Подготовка: единици, химия, ядра, време ----------

/** Единица в LaTeX: m/s² → \mathrm{m/s}^2, W/(m²·K⁴) → \mathrm{W/(m^{2}\cdot K^{4})}. */
function unitTex(u) {
  if (/^[A-Za-zµ/]+²$/.test(u)) return `\\mathrm{${u.slice(0, -1).replace('µ', '\\mu ')}}^2`;
  const body = u
    .replace(/µ/g, '\\mu ')
    .replace(/·/g, '\\cdot ')
    .replace(/[²³⁴⁻¹]+/g, m => `^{${[...m].map(ch => SUP[ch]).join('')}}`);
  return `\\mathrm{${body}}`;
}

/** Готови парчета LaTeX се заменят със заместител; toTex ги връща на мястото им. */
function prepare(core) {
  const tokens = [];
  const tok = tex => `${T_OPEN}${tokens.push(tex) - 1}${T_CLOSE}`;
  let s = core;
  if (UNIT_ALONE.test(s)) return { s: tok(unitTex(s)), tokens };
  s = s.replace(/\bpH\b/g, () => tok('\\mathrm{pH}'));
  s = s.replace(/\bconst\b/g, () => tok('\\mathrm{const}'));
  s = s.replace(new RegExp(`(?<![A-Za-z])(${CHEM.map(esc).join('|')})(?![A-Za-z₀-₉])`, 'g'), m =>
    tok(`\\mathrm{${m.replace(/[₀-₉]/g, d => `_${SUB[d]}`).replace('⁺', '^+')}}`),
  );
  // ядра: ¹H, ⁴He
  s = s.replace(/(^|[\s(+→])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)([A-Z][a-z]?)(?![A-Za-z])/g, (m, pre, n, el) =>
    `${pre}${tok(`{}^{${[...n].map(ch => SUP[ch]).join('')}}\\mathrm{${el}}`)}`,
  );
  // време: 23h 56m 04s
  s = s.replace(/(?<![A-Za-z0-9_^(√])(\d+)h(?: (\d+)m)?(?: (\d+(?:,\d+)?)s)?(?![A-Za-z/)·²³\d])/g, (m, h, mm, ss) =>
    `${h}${tok('^{\\mathrm{h}}')}` + (mm ? `${tok('\\,')}${mm}${tok('^{\\mathrm{m}}')}` : '') + (ss ? `${tok('\\,')}${ss.replace(',', '{,}')}${tok('^{\\mathrm{s}}')}` : ''),
  );
  s = s.replace(/°\/h(?![A-Za-z])/g, () => `°${tok('/\\mathrm{h}')}`);
  // единици след число (или след π, ) ): 9,81 m/s², 3π cm², N·m²/kg²
  const U = `(?:${UNITS.map(esc).join('|')})[²³⁴⁻¹]*`;
  const unitRe = new RegExp(`([\\d⁰¹²³⁴⁵⁶⁷⁸⁹π)])\\s(${U}(?:[·/]\\(?${U}(?:·${U})*\\)?)*)(?![A-Za-z])`, 'g');
  s = s.replace(unitRe, (m, d, u) => `${d}${tok(`\\ ${unitTex(u)}`)}`);
  // единици без число: (g/cm³)
  s = s.replace(new RegExp(`(^|[^A-Za-z])(${STANDALONE_UNITS.map(esc).join('|')})(?![A-Za-z])`, 'g'), (m, pre, u) => `${pre}${tok(unitTex(u))}`);
  // 4 ¹H – тесен интервал пред ядрото (единиците нямат интервал пред заместителя)
  s = s.replace(new RegExp(`(\\d) (?=${T_OPEN})`, 'g'), `$1${THIN}`);
  // 26 L☉ – тесен интервал между число и величина със знак
  s = s.replace(/(\d) (?=[A-Za-z][☉⊕★☾])/g, `$1${THIN}`);
  // хиляди: 130 000
  s = s.replace(/(\d) (?=\d{3}(?!\d))/g, `$1${THIN}`);
  // интервал с тире: 40°–43°, 300–3000
  s = s.replace(/(?<=[\d°′″ᵐʰ])–(?=\d)/g, DASH);
  return { s, tokens };
}

// ---------- Откриване на формули в текст ----------

const MATH_CHAR = new RegExp(`[A-Za-z0-9${GREEKS}${SUPS}${SUBS}☉⊕★☾♈♃½⅓⅔¼¾Ṁµ≳≲ℝℳ↔⁄∑≡≪≫+\\-−=<>≤≥≠≈±∓·×÷/⇒⇔→√∛∜()\\[\\]|∞∠°′″∥⊥∈∉∪∩⊂!_^*,.:;'%∝…\\s]`);
const STRONG = new RegExp(`[☉⊕★½⅓⅔¼¾∝≳≲≪≫∑=<>≤≥≠≈±∓·×÷/⇒⇔√∛∜∞∠∥⊥∈^_+−${SUPS}${SUBS}]`);
// единица сама по себе си е формула само ако е съставна или със степен: (g/cm³), cm²
const UNIT_ALONE = new RegExp(`^(?:(?:${STANDALONE_UNITS.map(esc).join('|')})|(?:${['km', 'cm', 'mm', 'dm', 'm'].map(esc).join('|')})[²³])$`);

function isFormula(t) {
  if (!t) return false;
  if (/^[+−-]?\d+(,\d+)?%?$/.test(t)) return false;
  // имена, съкращения, каталози: TESS, 3I/ATLAS, PSR B1257+12, CCD / CMOS
  if (/[A-Z]{3,}/.test(t) && !/[=<>≈≤≥∠Δ~∼∝]/.test(t)) return false;
  if (/^[A-Za-z]{3,} ?\/ ?[A-Za-z]{3,}$/.test(t)) return false;
  if (/^\d{4} ?\/ ?\d{4}$/.test(t)) return false;
  // фраза на латиница: Oh Be A Fine Girl/Guy
  if (/[A-Za-z]{2,} [A-Za-z]{2,}/.test(t) && !/[=<>≈≤≥∝]/.test(t) && !/^(lg|ln|log|sin|cos|tg)/.test(t)) return false;
  if (/^f\/\d/.test(t)) return false;
  if (/^[A-Z]\d{3,}/.test(t)) return false;
  // „a : b“, „180 : 20“ – деление/отношение
  if (/\S :\s?\S/.test(t) && /[A-Za-z0-9]/.test(t)) return true;
  if (STRONG.test(t.replace(/^[−-](?=\d)/, ''))) return /[A-Za-z0-9α-ωΑ-Ω]/.test(t);
  // функция с аргумент: lg 7, ln x, sin α
  if (/^(lg|ln|log|sin|cos|tg|cotg)(_[a-z0-9]|[₀-₉]+)? ?[A-Za-z0-9α-ω(]/.test(t)) return true;
  if (/^[A-Za-z]$/.test(t) || new RegExp(`^[${GREEKS}]$`).test(t)) return true;
  if (/^[A-Za-z](, [A-Za-z])+$/.test(t)) return true;
  if (UNIT_ALONE.test(t)) return true;
  return false;
}

/** Кога самотна латинска буква не е променлива: римски цифри, имена (Сириус A, R Северна корона), „V“. */
function letterIsText(core, before, after) {
  if (!/^[A-Z]$/.test(core)) return false;
  if (/^[IVX]$/.test(core) && (/^\s+[А-Яа-яЁё]/.test(after) || /^\./.test(after) || /^[–-]/.test(after))) return true;
  if (/[А-ЯЁ][а-яё]+\s+$/.test(before)) return true; // Сириус A, Алфа Кентавър B
  if (/^\s+[А-ЯЁ][а-яё]/.test(after)) return true; // R Северна корона, T Телец
  if (/[„"«]$/.test(before)) return true; // „V“
  if (/^K$/.test(core) && /(милиона|хиляди|млн\.|хил\.)\s+$/.test(before)) return true;
  return false;
}

/** Къде да отрежем участъка заради скоба без двойка (отворена/затворена в прозата). */
function unmatchedCut(t) {
  const stack = [];
  for (let k = 0; k < t.length; k++) {
    if (t[k] === '(' || t[k] === '[') stack.push(k);
    else if (t[k] === ')' || t[k] === ']') {
      if (!stack.length) return { at: k, kind: 'close' };
      stack.pop();
    }
  }
  return stack.length ? { at: stack[0], kind: 'open' } : null;
}

function trimEnds(run) {
  let a = 0;
  let b = run.length;
  while (a < b && /[\s,.;:?]/.test(run[a])) a++;
  while (b > a && /[\s,.;:?]/.test(run[b - 1])) b--;
  return [a, b];
}

/** Разделя текст на части: { text } или { tex }. */
export function splitMath(text) {
  const parts = [];
  const pushText = t => {
    if (!t) return;
    if (parts.length && parts[parts.length - 1].text !== undefined) parts[parts.length - 1].text += t;
    else parts.push({ text: t });
  };
  const pushOne = core => {
    const { s, tokens } = prepare(core);
    parts.push({ tex: toTex(s, tokens) });
  };
  // „a = 1; b = 2“ – отделни формули, за да може редът да се пренесе между тях
  const pushTex = core => {
    const pieces = [];
    let depth = 0;
    let last = 0;
    for (let k = 0; k < core.length; k++) {
      if ('([{'.includes(core[k])) depth++;
      else if (')]}'.includes(core[k])) depth--;
      else if (core[k] === ';' && core[k + 1] === ' ' && depth === 0) {
        pieces.push(core.slice(last, k));
        last = k + 2;
      }
    }
    pieces.push(core.slice(last));
    const REL = /[=<>≤≥≈⇒⇔∝]/;
    if (pieces.length > 1 && pieces.every(p => REL.test(p))) {
      pieces.forEach((p, k) => {
        if (k) pushText('; ');
        pushOne(p);
      });
    } else pushOne(core);
  };

  let i = 0;
  while (i < text.length) {
    if (!(MATH_CHAR.test(text[i]) && !CYR.test(text[i]))) {
      pushText(text[i]);
      i++;
      continue;
    }
    // докъде стига формулата
    let j = i;
    const inMath = k => {
      const ch = text[k];
      if (MATH_CHAR.test(ch) && !CYR.test(ch)) return true;
      if (ch === '–' && /[\d°′″ᵐʰ]/.test(text[k - 1] ?? '') && /\d/.test(text[k + 1] ?? '')) return true;
      if (CYR.test(ch)) {
        // _Сириус, Rп, λнабл – индекс на кирилица
        if (/_[А-Яа-яЁё]*$/.test(text.slice(i, k))) return true;
        const m = text.slice(i, k).match(new RegExp(`(?:^|[^A-Za-z${GREEKS}А-Яа-яЁё])[A-Za-z${GREEKS}]([а-яё]*)$`));
        const word = text.slice(k).match(/^[а-яё]+/)?.[0] ?? '';
        if (m && m[1].length + word.length <= 5 && /[а-яё]/.test(ch) && !CYR.test(text[k + word.length] ?? '')) return true;
      }
      return false;
    };
    while (j < text.length && inMath(j)) {
      // край на изречение и двоеточие след израз: „…= 3. Нататък“, „Делим на −2: x = 4“
      if ((text[j] === '.' || (text[j] === ':' && text[j - 1] !== ' ')) && /\s/.test(text[j + 1] ?? '')) break;
      j++;
    }
    if (j === i) {
      pushText(text[i]);
      i++;
      continue;
    }
    const run = text.slice(i, j);
    let [a, b] = trimEnds(run);
    // скоба без двойка – режем дотам и продължаваме след нея
    const cut = unmatchedCut(run.slice(a, b));
    if (cut) {
      if (cut.at === 0) {
        pushText(run.slice(0, a + 1));
        i += a + 1;
        continue;
      }
      b = a + cut.at;
      while (b > a && /[\s,.;:?]/.test(run[b - 1])) b--;
      j = i + b;
    }
    let core = run.slice(a, b).replace(/\s+/g, ' ');
    // удивителен знак в края е препинателен (освен при факториел: n!, 5!)
    let bang = '';
    if (core.endsWith('!') && !/(\)|(^|[\s=(·*])[A-Za-z0-9])!$/.test(core)) {
      core = core.slice(0, -1);
      bang = '!';
      b--;
    }
    const before = text.slice(0, i + a);
    const after = text.slice(i + b + bang.length);
    // латинска буква точно до кирилица (напр. „Ox-оста“) не е формула
    const glued = (a === 0 && CYR.test(text[i - 1] ?? '')) || (CYR.test(after[0] ?? '') && !/[А-Яа-яЁё]/.test(core.slice(-1)));
    if (isFormula(core) && !glued && !letterIsText(core, before, after) && !/^\d+$/.test(core)) {
      pushText(run.slice(0, a));
      const lead = core.match(new RegExp(`^([−-]?\\d+(?:,\\d+)?|[A-Za-z${GREEKS}]) \\((.+)\\)$`));
      if (core.startsWith('(') && groupEnd(core, 0) === core.length && isFormula(core.slice(1, -1))) {
        pushText('(');
        pushTex(core.slice(1, -1));
        pushText(')');
      } else if (lead && groupEnd(core, core.indexOf('(')) === core.length && isFormula(lead[2])) {
        // число пред скобата остава текст, буква (променлива) – формула
        if (/\d/.test(lead[1])) pushText(`${lead[1]} (`);
        else {
          pushTex(lead[1]);
          pushText(' (');
        }
        pushTex(lead[2]);
        pushText(')');
      } else if (/^[A-Za-z](, [A-Za-z])+$/.test(core)) {
        core.split(', ').forEach((v, k) => {
          if (k) pushText(', ');
          parts.push({ tex: v });
        });
      } else {
        pushTex(core);
      }
      pushText(bang + run.slice(b + bang.length, j - i));
    } else {
      pushText(run.slice(0, j - i));
    }
    i = j;
  }
  return parts;
}

/** Заменя формулите в низ с $…$. */
export function markMath(text) {
  return splitMath(text)
    .map(p => (p.tex !== undefined ? `$${p.tex}$` : p.text))
    .join('');
}

/** Цял низ като формула (за отговорите в тестовете). */
export function wholeTex(text) {
  const { s, tokens } = prepare(text);
  return toTex(s, tokens);
}
