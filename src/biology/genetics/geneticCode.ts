// Стандартният генетичен код. Вътрешно базите са с латински букви (A, C, G, T, U),
// а на екрана се показват с българските означения А, Ц, Г, Т, У.

const ORDER = 'UCAG';
// Аминокиселините в реда UUU, UUC, UUA, … GGG (еднобуквени означения, * – стоп)
const TABLE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';

export const AMINO: Record<string, { abbr: string; name: string }> = {
  F: { abbr: 'Phe', name: 'фенилаланин' },
  L: { abbr: 'Leu', name: 'левцин' },
  I: { abbr: 'Ile', name: 'изолевцин' },
  M: { abbr: 'Met', name: 'метионин' },
  V: { abbr: 'Val', name: 'валин' },
  S: { abbr: 'Ser', name: 'серин' },
  P: { abbr: 'Pro', name: 'пролин' },
  T: { abbr: 'Thr', name: 'треонин' },
  A: { abbr: 'Ala', name: 'аланин' },
  Y: { abbr: 'Tyr', name: 'тирозин' },
  H: { abbr: 'His', name: 'хистидин' },
  Q: { abbr: 'Gln', name: 'глутамин' },
  N: { abbr: 'Asn', name: 'аспарагин' },
  K: { abbr: 'Lys', name: 'лизин' },
  D: { abbr: 'Asp', name: 'аспарагинова киселина' },
  E: { abbr: 'Glu', name: 'глутаминова киселина' },
  C: { abbr: 'Cys', name: 'цистеин' },
  W: { abbr: 'Trp', name: 'триптофан' },
  R: { abbr: 'Arg', name: 'аргинин' },
  G: { abbr: 'Gly', name: 'глицин' },
  '*': { abbr: 'стоп', name: 'стоп кодон' },
};

/** Аминокиселината (еднобуквено) за кодон на иРНК с латински букви, напр. 'AUG' → 'M'. */
export function codonToAmino(codon: string) {
  const i = ORDER.indexOf(codon[0]) * 16 + ORDER.indexOf(codon[1]) * 4 + ORDER.indexOf(codon[2]);
  return TABLE[i];
}

const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G', U: 'A' };
const COMPLEMENT_RNA: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };
const CYRILLIC: Record<string, string> = { A: 'А', T: 'Т', G: 'Г', C: 'Ц', U: 'У' };

/** Комплементарна база в ДНК. */
export const complement = (b: string) => COMPLEMENT[b];
/** База на тРНК (антикодон), сдвоена с база на иРНК. */
export const complementRna = (b: string) => COMPLEMENT_RNA[b];
/** Българското означение на базата: A → А, C → Ц, … */
export const bg = (seq: string) => [...seq].map(b => CYRILLIC[b] ?? b).join('');

/** Транслация на кодиращата верига на ДНК (5′→3′) от началото до стоп кодона или края. */
export function translate(coding: string) {
  const mrna = coding.replace(/T/g, 'U');
  const out: string[] = [];
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const a = codonToAmino(mrna.slice(i, i + 3));
    out.push(a);
    if (a === '*') break;
  }
  return out;
}
