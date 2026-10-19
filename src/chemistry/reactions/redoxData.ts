import { parseFormula } from '../formula';

// Данни за урока „Окисление-редукция и електрохимия“: частици със степени на окисление,
// реакции за електронния баланс и стандартни електродни потенциали.

/** Частица, в която търсим степента на окисление на един елемент (`el`) по известните степени на останалите. */
export type Species = {
  f: string; // формула за parseFormula
  text: string; // запис с Unicode индекси
  el: string;
  known: Record<string, number>;
  charge?: number;
  note?: string;
};

export const FAMILIES: { el: string; name: string; species: Species[] }[] = [
  {
    el: 'N',
    name: 'азот',
    species: [
      { f: 'NH3', text: 'NH₃', el: 'N', known: { H: 1 } },
      { f: 'NH4', text: 'NH₄⁺', el: 'N', known: { H: 1 }, charge: 1 },
      { f: 'N2H4', text: 'N₂H₄', el: 'N', known: { H: 1 } },
      { f: 'N2', text: 'N₂', el: 'N', known: {} },
      { f: 'N2O', text: 'N₂O', el: 'N', known: { O: -2 } },
      { f: 'NO', text: 'NO', el: 'N', known: { O: -2 } },
      { f: 'HNO2', text: 'HNO₂', el: 'N', known: { H: 1, O: -2 } },
      { f: 'NO2', text: 'NO₂', el: 'N', known: { O: -2 } },
      { f: 'HNO3', text: 'HNO₃', el: 'N', known: { H: 1, O: -2 } },
    ],
  },
  {
    el: 'S',
    name: 'сяра',
    species: [
      { f: 'H2S', text: 'H₂S', el: 'S', known: { H: 1 } },
      { f: 'FeS2', text: 'FeS₂', el: 'S', known: { Fe: 2 }, note: 'В пирита серните атоми са свързани по двойки (дисулфиден йон S₂²⁻), а желязото е +2.' },
      { f: 'S', text: 'S', el: 'S', known: {} },
      { f: 'Na2S2O3', text: 'Na₂S₂O₃', el: 'S', known: { Na: 1, O: -2 }, note: 'Това е средната степен на окисление: двата серни атома в тиосулфата не са еднакви.' },
      { f: 'SO2', text: 'SO₂', el: 'S', known: { O: -2 } },
      { f: 'H2SO3', text: 'H₂SO₃', el: 'S', known: { H: 1, O: -2 } },
      { f: 'SO3', text: 'SO₃', el: 'S', known: { O: -2 } },
      { f: 'H2SO4', text: 'H₂SO₄', el: 'S', known: { H: 1, O: -2 } },
    ],
  },
  {
    el: 'Cl',
    name: 'хлор',
    species: [
      { f: 'HCl', text: 'HCl', el: 'Cl', known: { H: 1 } },
      { f: 'Cl2', text: 'Cl₂', el: 'Cl', known: {} },
      { f: 'NaClO', text: 'NaClO', el: 'Cl', known: { Na: 1, O: -2 } },
      { f: 'NaClO2', text: 'NaClO₂', el: 'Cl', known: { Na: 1, O: -2 } },
      { f: 'ClO2', text: 'ClO₂', el: 'Cl', known: { O: -2 } },
      { f: 'KClO3', text: 'KClO₃', el: 'Cl', known: { K: 1, O: -2 } },
      { f: 'HClO4', text: 'HClO₄', el: 'Cl', known: { H: 1, O: -2 } },
    ],
  },
  {
    el: 'Mn',
    name: 'манган',
    species: [
      { f: 'Mn', text: 'Mn', el: 'Mn', known: {} },
      { f: 'MnCl2', text: 'MnCl₂', el: 'Mn', known: { Cl: -1 } },
      { f: 'Mn2O3', text: 'Mn₂O₃', el: 'Mn', known: { O: -2 } },
      { f: 'MnO2', text: 'MnO₂', el: 'Mn', known: { O: -2 } },
      { f: 'K2MnO4', text: 'K₂MnO₄', el: 'Mn', known: { K: 1, O: -2 } },
      { f: 'KMnO4', text: 'KMnO₄', el: 'Mn', known: { K: 1, O: -2 } },
    ],
  },
  {
    el: 'C',
    name: 'въглерод',
    species: [
      { f: 'CH4', text: 'CH₄', el: 'C', known: { H: 1 } },
      { f: 'CH4O', text: 'CH₃OH', el: 'C', known: { H: 1, O: -2 } },
      { f: 'CH2O', text: 'HCHO', el: 'C', known: { H: 1, O: -2 } },
      { f: 'C', text: 'C', el: 'C', known: {} },
      { f: 'CO', text: 'CO', el: 'C', known: { O: -2 } },
      { f: 'CH2O2', text: 'HCOOH', el: 'C', known: { H: 1, O: -2 } },
      { f: 'CO2', text: 'CO₂', el: 'C', known: { O: -2 } },
    ],
  },
  {
    el: 'Cr',
    name: 'хром',
    species: [
      { f: 'Cr', text: 'Cr', el: 'Cr', known: {} },
      { f: 'CrCl2', text: 'CrCl₂', el: 'Cr', known: { Cl: -1 } },
      { f: 'Cr2O3', text: 'Cr₂O₃', el: 'Cr', known: { O: -2 } },
      { f: 'CrO3', text: 'CrO₃', el: 'Cr', known: { O: -2 } },
      { f: 'K2CrO4', text: 'K₂CrO₄', el: 'Cr', known: { K: 1, O: -2 } },
      { f: 'K2Cr2O7', text: 'K₂Cr₂O₇', el: 'Cr', known: { K: 1, O: -2 } },
    ],
  },
  {
    el: '*',
    name: 'изключения',
    species: [
      { f: 'H2O2', text: 'H₂O₂', el: 'O', known: { H: 1 }, note: 'В пероксидите има връзка O–O и кислородът е −1.' },
      { f: 'NaH', text: 'NaH', el: 'H', known: { Na: 1 }, note: 'В хидридите на металите водородът е −1.' },
      { f: 'OF2', text: 'OF₂', el: 'O', known: { F: -1 }, note: 'Флуорът е по-електроотрицателен от кислорода, затова тук кислородът е положителен.' },
      { f: 'Fe3O4', text: 'Fe₃O₄', el: 'Fe', known: { O: -2 }, note: 'Дробно число е средната степен: в магнетита има един атом Fe⁺² и два атома Fe⁺³.' },
    ],
  },
];

const sup = (s: string) => s.replace(/[0-9+−-]/g, c => ({ '+': '⁺', '−': '⁻', '-': '⁻' })[c] ?? '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);

/** Знак и число: 7 → „+7“, −2 → „−2“, 0 → „0“. */
export const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');
/** Като `signed`, но за горен индекс в текст: Mn⁺⁷. */
export const supSigned = (v: number) => sup(signed(v));

/** Степента на окисление на `el` (може да е дробна) и пресмятането ѝ стъпка по стъпка. */
export function solveOxidation(s: Species) {
  const counts = parseFormula(s.f);
  const n = counts.get(s.el) ?? 1;
  let knownSum = 0;
  const parts: { el: string; count: number; ox: number }[] = [];
  for (const [el, count] of counts) {
    if (el === s.el) continue;
    const ox = s.known[el] ?? 0;
    knownSum += ox * count;
    parts.push({ el, count, ox });
  }
  const charge = s.charge ?? 0;
  return { ox: (charge - knownSum) / n, n, parts, charge, knownSum };
}

// ---------- Реакции за електронния баланс ----------

export type Half = { text: string; e: number }; // e – отдадени/приети електрони на една частица
export type BalanceReaction = {
  name: string;
  scheme: string; // неизравнената схема със степените на окисление
  tex: string; // неизравнената схема в LaTeX
  oxidation: Half & { particle: string }; // редукторът се окислява
  reduction: Half & { particle: string }; // окислителят се редуцира
  reducer: string;
  oxidizer: string;
  final: string;
  finish: string;
  coefs: Record<string, number>; // коефициентите в изравненото уравнение (за тренажора)
};

export const BALANCE: BalanceReaction[] = [
  {
    name: 'Al + O₂',
    tex: '\\mathrm{Al + O_2 \\to Al_2O_3}',
    scheme: 'Al⁰ + O₂⁰ → Al₂⁺³O₃⁻²',
    oxidation: { text: 'Al⁰ − 3e⁻ → Al⁺³', e: 3, particle: 'Al' },
    reduction: { text: 'O₂⁰ + 4e⁻ → 2O⁻²', e: 4, particle: 'O₂' },
    reducer: 'Al',
    oxidizer: 'O₂',
    final: '4Al + 3O₂ → 2Al₂O₃',
    finish: '4 атома Al дават 2 формулни единици Al₂O₃ – кислородът също е изравнен.',
    coefs: { Al: 4, O2: 3, Al2O3: 2 },
  },
  {
    name: 'H₂S + O₂',
    tex: '\\mathrm{H_2S + O_2 \\to SO_2 + H_2O}',
    scheme: 'H₂S⁻² + O₂⁰ → S⁺⁴O₂⁻² + H₂O⁻²',
    oxidation: { text: 'S⁻² − 6e⁻ → S⁺⁴', e: 6, particle: 'S' },
    reduction: { text: 'O₂⁰ + 4e⁻ → 2O⁻²', e: 4, particle: 'O₂' },
    reducer: 'H₂S',
    oxidizer: 'O₂',
    final: '2H₂S + 3O₂ → 2SO₂ + 2H₂O',
    finish: 'Кислородът от 3O₂ (6 атома) отива в 2SO₂ (4 атома) и 2H₂O (2 атома).',
    coefs: { H2S: 2, O2: 3, SO2: 2, H2O: 2 },
  },
  {
    name: 'Fe₂O₃ + CO',
    tex: '\\mathrm{Fe_2O_3 + CO \\to Fe + CO_2}',
    scheme: 'Fe₂⁺³O₃ + C⁺²O → Fe⁰ + C⁺⁴O₂',
    oxidation: { text: 'C⁺² − 2e⁻ → C⁺⁴', e: 2, particle: 'C' },
    reduction: { text: '2Fe⁺³ + 6e⁻ → 2Fe⁰', e: 6, particle: 'Fe₂' },
    reducer: 'CO',
    oxidizer: 'Fe₂O₃',
    final: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂',
    finish: 'Една формулна единица Fe₂O₃ приема 6 електрона – колкото дават 3 молекули CO. Така се получава желязото в доменната пещ.',
    coefs: { Fe2O3: 1, CO: 3, Fe: 2, CO2: 3 },
  },
  {
    name: 'NH₃ + O₂',
    tex: '\\mathrm{NH_3 + O_2 \\to NO + H_2O}',
    scheme: 'N⁻³H₃ + O₂⁰ → N⁺²O⁻² + H₂O⁻²',
    oxidation: { text: 'N⁻³ − 5e⁻ → N⁺²', e: 5, particle: 'N' },
    reduction: { text: 'O₂⁰ + 4e⁻ → 2O⁻²', e: 4, particle: 'O₂' },
    reducer: 'NH₃',
    oxidizer: 'O₂',
    final: '4NH₃ + 5O₂ → 4NO + 6H₂O',
    finish: 'Водородът от 4NH₃ (12 атома) дава 6H₂O; кислородът: 10 атома = 4 в NO + 6 във водата. Това е първата стъпка от производството на азотна киселина (с платинов катализатор).',
    coefs: { NH3: 4, O2: 5, NO: 4, H2O: 6 },
  },
  {
    name: 'Cu + HNO₃ (разредена)',
    tex: '\\mathrm{Cu + HNO_3 \\to Cu(NO_3)_2 + NO + H_2O}',
    scheme: 'Cu⁰ + HN⁺⁵O₃ → Cu⁺²(NO₃)₂ + N⁺²O + H₂O',
    oxidation: { text: 'Cu⁰ − 2e⁻ → Cu⁺²', e: 2, particle: 'Cu' },
    reduction: { text: 'N⁺⁵ + 3e⁻ → N⁺²', e: 3, particle: 'N' },
    reducer: 'Cu',
    oxidizer: 'HNO₃',
    final: '3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O',
    finish: 'Внимание: само 2 молекули HNO₃ са окислител. Още 6 нитратни йона остават непроменени в 3Cu(NO₃)₂ – общо 8 HNO₃, а водородът от тях дава 4H₂O.',
    coefs: { Cu: 3, HNO3: 8, 'Cu(NO3)2': 3, NO: 2, H2O: 4 },
  },
  {
    name: 'KMnO₄ + HCl',
    tex: '\\mathrm{KMnO_4 + HCl \\to KCl + MnCl_2 + Cl_2 + H_2O}',
    scheme: 'KMn⁺⁷O₄ + HCl⁻¹ → KCl + Mn⁺²Cl₂ + Cl₂⁰ + H₂O',
    oxidation: { text: '2Cl⁻¹ − 2e⁻ → Cl₂⁰', e: 2, particle: '2Cl' },
    reduction: { text: 'Mn⁺⁷ + 5e⁻ → Mn⁺²', e: 5, particle: 'Mn' },
    reducer: 'HCl',
    oxidizer: 'KMnO₄',
    final: '2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂ + 8H₂O',
    finish: 'Хлорът: 10 атома в 5Cl₂, 2 в 2KCl и 4 в 2MnCl₂ – общо 16 HCl. Кислородът от 2KMnO₄ (8 атома) дава 8H₂O. Така в лабораторията се получава хлор.',
    coefs: { KMnO4: 2, HCl: 16, KCl: 2, MnCl2: 2, Cl2: 5, H2O: 8 },
  },
];

// ---------- Стандартни електродни потенциали (25 °C, V) ----------

export type Metal = { s: string; name: string; ion: string; z: number; E: number; M: number };
export const METALS: Metal[] = [
  { s: 'Mg', name: 'магнезий', ion: 'Mg²⁺', z: 2, E: -2.37, M: 24 },
  { s: 'Al', name: 'алуминий', ion: 'Al³⁺', z: 3, E: -1.66, M: 27 },
  { s: 'Zn', name: 'цинк', ion: 'Zn²⁺', z: 2, E: -0.76, M: 65 },
  { s: 'Fe', name: 'желязо', ion: 'Fe²⁺', z: 2, E: -0.44, M: 56 },
  { s: 'Ni', name: 'никел', ion: 'Ni²⁺', z: 2, E: -0.26, M: 59 },
  { s: 'Pb', name: 'олово', ion: 'Pb²⁺', z: 2, E: -0.13, M: 207 },
  { s: 'Cu', name: 'мед', ion: 'Cu²⁺', z: 2, E: 0.34, M: 63.5 },
  { s: 'Ag', name: 'сребро', ion: 'Ag⁺', z: 1, E: 0.8, M: 108 },
];

/** Число с десетична запетая и знак минус: −0,76. */
export const volts = (v: number) => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',').replace('-', '−');
