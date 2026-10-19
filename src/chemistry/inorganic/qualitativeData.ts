import { formulaText, molarMass } from '../formula';

// Йони, таблица на разтворимостта и реакции между разтвори на соли – за урока „Йонни реакции и качествен анализ“.

export type Ion = { id: string; f: string; charge: number; text: string };

const SUP: Record<string, string> = { '+': '⁺', '-': '⁻', '1': '', '2': '²', '3': '³' };
const ionText = (f: string, charge: number) => formulaText(f) + SUP[String(Math.abs(charge))] + (charge > 0 ? SUP['+'] : SUP['-']);
const ion = (id: string, f: string, charge: number): Ion => ({ id, f, charge, text: ionText(f, charge) });

export const CATIONS: Ion[] = [
  ion('Na', 'Na', 1),
  ion('K', 'K', 1),
  ion('NH4', 'NH4', 1),
  ion('Ag', 'Ag', 1),
  ion('Ba', 'Ba', 2),
  ion('Ca', 'Ca', 2),
  ion('Mg', 'Mg', 2),
  ion('Zn', 'Zn', 2),
  ion('Cu', 'Cu', 2),
  ion('Fe2', 'Fe', 2),
  ion('Pb', 'Pb', 2),
  ion('Fe3', 'Fe', 3),
  ion('Al', 'Al', 3),
];

export const ANIONS: Ion[] = [
  ion('OH', 'OH', -1),
  ion('Cl', 'Cl', -1),
  ion('Br', 'Br', -1),
  ion('I', 'I', -1),
  ion('NO3', 'NO3', -1),
  ion('SO4', 'SO4', -2),
  ion('CO3', 'CO3', -2),
  ion('PO4', 'PO4', -3),
];

/** р – разтворимо, м – слабо разтворимо, н – неразтворимо, „–“ – не съществува във вода (разлага се или реагира). */
export type Sol = 'р' | 'м' | 'н' | '–';

/** Цвят на утайката: име и цвят за чертежа. */
export type Color = { name: string; fill: string };
const WHITE: Color = { name: 'бяла', fill: '#f8fafc' };
const C = (name: string, fill: string): Color => ({ name, fill });

type Cell = [Sol, Color?];
// Редовете са в реда на CATIONS, колоните – на ANIONS: OH, Cl, Br, I, NO3, SO4, CO3, PO4
const R: Cell = ['р'];
const TABLE: Record<string, Cell[]> = {
  Na: [R, R, R, R, R, R, R, R],
  K: [R, R, R, R, R, R, R, R],
  NH4: [R, R, R, R, R, R, R, R],
  Ag: [['–', C('кафява', '#5b3a1e')], ['н', WHITE], ['н', C('бледожълта', '#f5efc4')], ['н', C('жълта', '#f2e27a')], R, ['м', WHITE], ['н', C('бледожълта', '#f3ecc0')], ['н', C('жълта', '#f2d64b')]],
  Ba: [R, R, R, R, R, ['н', WHITE], ['н', WHITE], ['н', WHITE]],
  Ca: [['м', WHITE], R, R, R, R, ['м', WHITE], ['н', WHITE], ['н', WHITE]],
  Mg: [['н', WHITE], R, R, R, R, R, ['н', WHITE], ['н', WHITE]],
  Zn: [['н', WHITE], R, R, R, R, R, ['н', WHITE], ['н', WHITE]],
  Cu: [['н', C('синя', '#3b82f6')], R, R, ['–', C('бяла в кафяв разтвор', '#d6c3a5')], R, R, ['–', C('синьо-зелена', '#3fae9d')], ['н', C('синьо-зелена', '#5fb3b0')]],
  Fe2: [['н', C('бледозелена', '#a3c9a0')], R, R, R, R, R, ['н', C('белезникава', '#e8eadf')], ['н', C('белезникава', '#e3e8de')]],
  Pb: [['н', WHITE], ['м', WHITE], ['м', WHITE], ['н', C('жълта', '#f5c518')], R, ['н', WHITE], ['н', WHITE], ['н', WHITE]],
  Fe3: [['н', C('червено-кафява', '#8b3a1a')], R, R, ['–'], R, R, ['–', C('червено-кафява', '#8b3a1a')], ['н', C('жълтеникаво-бяла', '#f1ead0')]],
  Al: [['н', WHITE], R, R, R, R, R, ['–', WHITE], ['н', WHITE]],
};

export function solubility(cat: string, an: string): { s: Sol; color?: Color } {
  const [s, color] = TABLE[cat][ANIONS.findIndex(a => a.id === an)];
  return { s, color };
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Формулата на съединението от катион и анион: Ca²⁺ + PO₄³⁻ → Ca3(PO4)2. */
export function saltFormula(cat: Ion, an: Ion): { f: string; a: number; b: number } {
  const g = gcd(cat.charge, -an.charge);
  const a = -an.charge / g;
  const b = cat.charge / g;
  const part = (x: string, k: number, poly: boolean) => (k === 1 ? x : poly ? `(${x})${k}` : `${x}${k}`);
  // Многоатомните йони (NH4, OH, NO3, …) се слагат в скоби, когато са повече от един
  const poly = (x: string) => /[A-Z].*[A-Z]|\d/.test(x);
  return { f: part(cat.f, a, poly(cat.f)) + part(an.f, b, poly(an.f)), a, b };
}

// ---------- Реакции между разтвори на две соли (за лабораторията) ----------

/** Разтвор на сол: катион, анион, брой йони във формулата и цвят на разтвора. */
export type Reagent = { f: string; cat: string; an: string; p: number; q: number; tint?: string };
export const byId = (list: Ion[], id: string) => list.find(i => i.id === id)!;

export const CATION_REAGENTS: Reagent[] = [
  { f: 'AgNO3', cat: 'Ag', an: 'NO3', p: 1, q: 1 },
  { f: 'BaCl2', cat: 'Ba', an: 'Cl', p: 1, q: 2 },
  { f: 'CaCl2', cat: 'Ca', an: 'Cl', p: 1, q: 2 },
  { f: 'MgCl2', cat: 'Mg', an: 'Cl', p: 1, q: 2 },
  { f: 'Pb(NO3)2', cat: 'Pb', an: 'NO3', p: 1, q: 2 },
  { f: 'CuSO4', cat: 'Cu', an: 'SO4', p: 1, q: 1, tint: '#7db7f0' },
  { f: 'FeSO4', cat: 'Fe2', an: 'SO4', p: 1, q: 1, tint: '#d9ecd0' },
  { f: 'FeCl3', cat: 'Fe3', an: 'Cl', p: 1, q: 3, tint: '#e9b949' },
  { f: 'AlCl3', cat: 'Al', an: 'Cl', p: 1, q: 3 },
  { f: 'NH4Cl', cat: 'NH4', an: 'Cl', p: 1, q: 1 },
];

export const ANION_REAGENTS: Reagent[] = [
  { f: 'NaOH', cat: 'Na', an: 'OH', p: 1, q: 1 },
  { f: 'NaCl', cat: 'Na', an: 'Cl', p: 1, q: 1 },
  { f: 'KBr', cat: 'K', an: 'Br', p: 1, q: 1 },
  { f: 'KI', cat: 'K', an: 'I', p: 1, q: 1 },
  { f: 'Na2SO4', cat: 'Na', an: 'SO4', p: 2, q: 1 },
  { f: 'Na2CO3', cat: 'Na', an: 'CO3', p: 2, q: 1 },
  { f: 'Na3PO4', cat: 'Na', an: 'PO4', p: 3, q: 1 },
];

export type Mixing = {
  kind: 'precipitate' | 'maybe' | 'gas' | 'color' | 'none';
  /** Пълното (молекулно) уравнение, net – съкратеното йонно, с Unicode индекси. */
  full?: string;
  net?: string;
  /** Утайката: на a мола катион и b мола анион се получава 1 mol утайка (за масата ѝ). */
  solid?: { f: string; a: number; b: number; M: number };
  color?: Color;
  gas?: boolean;
  solutionTint?: string;
  note: string;
};

const coef = (k: number, f: string) => (k === 1 ? '' : String(k)) + formulaText(f);
const ionsOf = (k: number, i: Ion) => (k === 1 ? '' : String(k)) + i.text;

/** Изравнено молекулно уравнение за обменна реакция с утайка: MpXq + NrYs → MaYb↓ + NX. */
function exchange(r1: Reagent, r2: Reagent, solid: { f: string; a: number; b: number }) {
  const M = byId(CATIONS, r1.cat);
  const X = byId(ANIONS, r1.an);
  const N = byId(CATIONS, r2.cat);
  const Y = byId(ANIONS, r2.an);
  const side = saltFormula(N, X);
  for (let c3 = 1; c3 <= 12; c3++) {
    const c1 = (c3 * solid.a) / r1.p;
    const c2 = (c3 * solid.b) / r2.q;
    const c4 = (c1 * r1.q) / side.b;
    if ([c1, c2, c4].every(Number.isInteger) && c2 * r2.p === c4 * side.a) {
      const full = `${coef(c1, r1.f)} + ${coef(c2, r2.f)} → ${coef(c3, solid.f)}↓ + ${coef(c4, side.f)}`;
      const net = `${ionsOf(solid.a, M)} + ${ionsOf(solid.b, Y)} → ${formulaText(solid.f)}↓`;
      return { full, net };
    }
  }
  throw new Error(`Не мога да изравня ${r1.f} + ${r2.f}`);
}

/** Какво става при смесване на разтвор на сол на катиона с разтвор на сол на аниона. */
export function mix(r1: Reagent, r2: Reagent): Mixing {
  const key = `${r1.cat}+${r2.an}`;
  const special: Record<string, Mixing> = {
    'Ag+OH': {
      kind: 'precipitate',
      full: '2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O',
      net: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O',
      solid: { f: 'Ag2O', a: 2, b: 2, M: molarMass('Ag2O') },
      color: TABLE.Ag[0][1],
      note: 'Сребърният хидроксид не е устойчив – веднага се разпада на кафяв сребърен оксид и вода.',
    },
    'NH4+OH': {
      kind: 'gas',
      full: 'NH₄Cl + NaOH → NaCl + NH₃↑ + H₂O',
      net: 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O',
      gas: true,
      note: 'При затопляне се отделя амоняк – познава се по миризмата и по това, че мокра червена лакмусова хартия над епруветката посинява. Това е реакцията за откриване на NH₄⁺.',
    },
    'Cu+I': {
      kind: 'color',
      full: '2CuSO₄ + 4KI → 2CuI↓ + I₂ + 2K₂SO₄',
      net: '2Cu²⁺ + 4I⁻ → 2CuI↓ + I₂',
      color: TABLE.Cu[3][1],
      solutionTint: '#a86b2c',
      note: 'Това не е обменна, а окислително-редукционна реакция: Cu²⁺ окислява йодида до йод. Бялата утайка CuI се вижда кафеникава заради йода.',
    },
    'Fe3+I': {
      kind: 'color',
      full: '2FeCl₃ + 2KI → 2FeCl₂ + I₂ + 2KCl',
      net: '2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂',
      solutionTint: '#a0522d',
      note: 'Утайка няма, но разтворът потъмнява до кафяво от отделения йод – окислително-редукционна реакция.',
    },
    'Fe3+CO3': {
      kind: 'precipitate',
      full: '2FeCl₃ + 3Na₂CO₃ + 3H₂O → 2Fe(OH)₃↓ + 3CO₂↑ + 6NaCl',
      net: '2Fe³⁺ + 3CO₃²⁻ + 3H₂O → 2Fe(OH)₃↓ + 3CO₂↑',
      solid: { f: 'Fe(OH)3', a: 1, b: 1.5, M: molarMass('Fe(OH)3') },
      color: TABLE.Fe3[0][1],
      gas: true,
      note: 'Железен(III) карбонат във вода не съществува: получава се хидроксид и се отделя CO₂ (хидролиза).',
    },
    'Al+CO3': {
      kind: 'precipitate',
      full: '2AlCl₃ + 3Na₂CO₃ + 3H₂O → 2Al(OH)₃↓ + 3CO₂↑ + 6NaCl',
      net: '2Al³⁺ + 3CO₃²⁻ + 3H₂O → 2Al(OH)₃↓ + 3CO₂↑',
      solid: { f: 'Al(OH)3', a: 1, b: 1.5, M: molarMass('Al(OH)3') },
      color: WHITE,
      gas: true,
      note: 'Алуминиев карбонат във вода не съществува: получава се бял хидроксид и се отделя CO₂.',
    },
    'Cu+CO3': {
      kind: 'precipitate',
      full: '2CuSO₄ + 2Na₂CO₃ + H₂O → (CuOH)₂CO₃↓ + CO₂↑ + 2Na₂SO₄',
      net: '2Cu²⁺ + 2CO₃²⁻ + H₂O → (CuOH)₂CO₃↓ + CO₂↑',
      solid: { f: '(CuOH)2CO3', a: 2, b: 2, M: molarMass('(CuOH)2CO3') },
      color: TABLE.Cu[6][1],
      gas: true,
      note: 'Получава се основен меден карбонат – същото синьо-зелено вещество като малахита и патината по медните покриви.',
    },
  };
  if (special[key]) return special[key];

  const cat = byId(CATIONS, r1.cat);
  const an = byId(ANIONS, r2.an);
  const { s, color } = solubility(r1.cat, r2.an);
  const solid = saltFormula(cat, an);
  if (s === 'р') {
    return { kind: 'none', note: `Видима промяна няма: ${formulaText(solid.f)} е разтворим и всички йони остават в разтвора. Реакция между йоните не протича.` };
  }
  const eq = exchange(r1, r2, solid);
  const amphoteric = (r1.cat === 'Al' || r1.cat === 'Zn') && r2.an === 'OH';
  const notes: Record<string, string> = {
    'Fe2+OH': 'Утайката е бледозелена, но на въздуха бавно потъмнява и покафенява: Fe(OH)₂ се окислява до Fe(OH)₃.',
    'Cu+OH': 'Синята утайка е характерна за Cu²⁺. При нагряване почернява – получава се CuO.',
    'Fe3+OH': 'Червено-кафявата утайка е характерна за Fe³⁺.',
    'Pb+I': 'Ярко жълтата утайка на PbI₂ е една от най-красивите в химията (вж. интересния факт).',
    'Ag+Cl': 'Бялата „сиренеста“ утайка AgCl на светлина бавно потъмнява. Тя не се разтваря в HNO₃, но се разтваря в амоняк.',
    'Ag+Br': 'Бледожълтата утайка AgBr. По цвета ѝ се различава от AgCl (бяла) и AgI (жълта).',
    'Ag+I': 'Жълтата утайка AgI. Тя не се разтваря дори в амоняк – така се различава от AgCl.',
    'Ba+SO4': 'Бялата утайка BaSO₄ не се разтваря в киселини – това е реакцията за откриване на сулфатен йон.',
    'Ba+CO3': 'Бялата утайка BaCO₃ се разтваря в солна киселина с отделяне на CO₂ – така се различава от BaSO₄.',
  };
  return {
    kind: s === 'н' || s === '–' ? 'precipitate' : 'maybe',
    ...eq,
    solid: { ...solid, M: molarMass(solid.f) },
    color,
    note:
      s === 'м'
        ? `${formulaText(solid.f)} е слабо разтворим: утайка се образува само ако разтворите са достатъчно концентрирани (когато произведението на концентрациите на йоните надхвърли Ksp).`
        : amphoteric
          ? `Бялата утайка ${formulaText(solid.f)} се разтваря в излишък от основа – хидроксидът е амфотерен.`
          : (notes[key] ?? `Образува се ${color?.name ?? ''} утайка ${formulaText(solid.f)}.`),
  };
}
