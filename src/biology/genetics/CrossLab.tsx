import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Gene = 'AA' | 'Aa' | 'aa';
type Mode = 'pea1' | 'mirabilis' | 'pea2';

const MODES: { id: Mode; name: string }[] = [
  { id: 'pea1', name: 'грах: цвят на семето' },
  { id: 'mirabilis', name: 'нощна красавица: цвят на цвета' },
  { id: 'pea2', name: 'грах: цвят и форма' },
];

const LETTERS = ['A', 'B'];
const GENES: Gene[] = ['AA', 'Aa', 'aa'];

const YELLOW = '#facc15';
const GREEN = '#84cc16';
const FLOWER: Record<number, string> = { 2: '#dc2626', 1: '#f9a8d4', 0: '#f8fafc' };

/** Генотип на един ген с дадена буква: 'Aa' → 'Bb' за втория ген. */
const named = (g: Gene, k: number) => g.replace(/A/g, LETTERS[k]).replace(/a/g, LETTERS[k].toLowerCase());

/** Различните гамети на родител – по един алел от всеки ген. */
function gametes(parent: Gene[]): string[] {
  let out = [''];
  parent.forEach((g, k) => {
    const alleles = [...new Set(named(g, k).split(''))];
    out = out.flatMap(prefix => alleles.map(a => prefix + a));
  });
  return out;
}

/** Генотипът на зиготата от две гамети: главната буква е отпред (Aa, не aA). */
function zygote(egg: string, sperm: string) {
  return egg
    .split('')
    .map((a, k) => [a, sperm[k]].sort((x, y) => (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1)).join(''))
    .join('');
}

/** Брой доминантни (главни) алели в k-тия ген на генотип като 'AaBb'. */
const dominantCount = (genotype: string, k: number) => genotype.slice(2 * k, 2 * k + 2).replace(/[a-z]/g, '').length;

function phenotype(mode: Mode, genotype: string) {
  if (mode === 'mirabilis') return ['бели', 'розови', 'червени'][dominantCount(genotype, 0)];
  const color = dominantCount(genotype, 0) > 0 ? 'жълти' : 'зелени';
  if (mode === 'pea1') return color;
  return `${color} ${dominantCount(genotype, 1) > 0 ? 'кръгли' : 'набръчкани'}`;
}

const PHENOTYPE_ORDER = ['жълти', 'зелени', 'червени', 'розови', 'бели', 'жълти кръгли', 'жълти набръчкани', 'зелени кръгли', 'зелени набръчкани'];

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Брои срещанията и ги съкращава до отношение като 9 : 3 : 3 : 1 – двойки [клас, дял]. */
function ratio(items: string[], order: (a: string, b: string) => number): [string, number][] {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1);
  const keys = [...counts.keys()].sort(order);
  const g = keys.reduce((acc, k) => gcd(acc, counts.get(k)!), 0);
  return keys.map(k => [k, counts.get(k)! / g]);
}

function Pea({ x, y, r, color, wrinkled }: { x: number; y: number; r: number; color: string; wrinkled: boolean }) {
  if (!wrinkled) return <circle cx={x} cy={y} r={r} fill={color} stroke="#4d7c0f" strokeWidth={1.2} />;
  // Набръчканото семе – вълнист контур
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    const rr = r * (i % 2 === 0 ? 1 : 0.8);
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  });
  return <polygon points={pts.join(' ')} fill={color} stroke="#4d7c0f" strokeWidth={1.2} strokeLinejoin="round" />;
}

function Flower({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * 2 * Math.PI - Math.PI / 2;
        return <circle key={i} cx={x + r * 0.55 * Math.cos(a)} cy={y + r * 0.55 * Math.sin(a)} r={r * 0.5} fill={color} stroke="#9f1239" strokeWidth={0.8} />;
      })}
      <circle cx={x} cy={y} r={r * 0.25} fill="#fbbf24" />
    </g>
  );
}

function Icon({ mode, genotype, x, y, r }: { mode: Mode; genotype: string; x: number; y: number; r: number }) {
  if (mode === 'mirabilis') return <Flower x={x} y={y} r={r} color={FLOWER[dominantCount(genotype, 0)]} />;
  const color = dominantCount(genotype, 0) > 0 ? YELLOW : GREEN;
  const wrinkled = mode === 'pea2' && dominantCount(genotype, 1) === 0;
  return <Pea x={x} y={y} r={r} color={color} wrinkled={wrinkled} />;
}

function noteFor(mode: Mode, mother: Gene[], father: Gene[]) {
  const pair = (k: number) => [mother[k], father[k]].sort().join('×');
  if (mode === 'pea2') {
    if (mother.every(g => g === 'Aa') && father.every(g => g === 'Aa'))
      return 'Дихибридно кръстосване на два хетерозиготи: 16 комбинации, фенотипове 9 : 3 : 3 : 1 – двата гена се разпределят независимо (III закон).';
    if ((mother.every(g => g === 'Aa') && father.every(g => g === 'aa')) || (father.every(g => g === 'Aa') && mother.every(g => g === 'aa')))
      return 'Анализиращо кръстосване: рецесивният родител дава само гамети ab, затова потомството показва направо гаметите на другия – 1 : 1 : 1 : 1.';
    return 'Всеки ген се унаследява поотделно: отношението по цвят и по форма се умножават.';
  }
  const p = pair(0);
  if (p === 'AA×aa') return 'Два чисти родителя с различни признаци: всички потомци в F₁ са еднакви (I закон на Мендел).';
  if (p === 'Aa×Aa')
    return mode === 'mirabilis'
      ? 'Непълно доминиране: хетерозиготата е с междинен признак, затова фенотиповете повтарят генотиповете – 1 : 2 : 1.'
      : 'F₂ от два хетерозиготи: алелите се разделят в гаметите (II закон) – генотипове 1 : 2 : 1, фенотипове 3 : 1.';
  if (p === 'Aa×aa') return 'Анализиращо кръстосване: половината потомци са с рецесивния признак – значи другият родител е хетерозиготен.';
  if (p === 'AA×Aa') return 'Всички потомци имат поне един доминантен алел, но половината са хетерозиготни – по фенотипа не се различават.';
  return 'И двамата родители дават само един вид гамети – всички потомци са еднакви.';
}

/** Решетка на Пънет: избираш генотипа на родителите – виждаш гаметите, комбинациите и отношенията. */
export default function CrossLab() {
  const [mode, setMode] = useState<Mode>('pea1');
  const [mother, setMother] = useState<Gene[]>(['Aa', 'Aa']);
  const [father, setFather] = useState<Gene[]>(['Aa', 'Aa']);

  const geneCount = mode === 'pea2' ? 2 : 1;
  const mom = mother.slice(0, geneCount);
  const dad = father.slice(0, geneCount);
  const eggs = gametes(mom);
  const sperms = gametes(dad);
  const cells = eggs.flatMap(e => sperms.map(s => zygote(e, s)));

  const cs = sperms.length > 2 || eggs.length > 2 ? 70 : 96;
  const head = 54;
  const gridW = head + sperms.length * cs;
  const left = (480 - gridW) / 2;
  const top = 30;
  const height = top + head + eggs.length * cs + 10;

  const genoOrder = (a: string, b: string) => {
    const key = (g: string) => g.split('').map(c => (c === c.toUpperCase() ? '0' : '1')).join('');
    return key(a) < key(b) ? -1 : 1;
  };
  const geno = ratio(cells, genoOrder);
  const pheno = ratio(
    cells.map(c => phenotype(mode, c)),
    (a, b) => PHENOTYPE_ORDER.indexOf(a) - PHENOTYPE_ORDER.indexOf(b)
  );

  const setGene = (who: 'mother' | 'father', k: number, g: Gene) => {
    const set = who === 'mother' ? setMother : setFather;
    set(prev => prev.map((v, i) => (i === k ? g : v)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
        {(['mother', 'father'] as const).map(who => (
          <div key={who} className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2">
            <p className="font-semibold mb-1 text-center">{who === 'mother' ? '♀ майка' : '♂ баща'}</p>
            {Array.from({ length: geneCount }, (_, k) => (
              <div key={k} className="flex justify-center gap-1.5 mb-1">
                {GENES.map(g => {
                  const active = (who === 'mother' ? mother : father)[k] === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setGene(who, k, g)}
                      className={`px-3 py-1 rounded-md border font-serif italic ${
                        active
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {named(g, k)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <LabSvg viewBox={`0 0 480 ${height}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={240} y={18} fontSize="13" textAnchor="middle" fill="currentColor">
          <tspan fontStyle="italic">{mom.map((g, k) => named(g, k)).join('')}</tspan> × <tspan fontStyle="italic">{dad.map((g, k) => named(g, k)).join('')}</tspan>
        </text>
        {/* Ъгълът */}
        <text x={left + head - 6} y={top + 18} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ♂ →
        </text>
        <text x={left + 6} y={top + head - 8} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          ♀ ↓
        </text>
        {/* Гаметите на бащата */}
        {sperms.map((s, j) => (
          <g key={`s${j}`}>
            <circle cx={left + head + j * cs + cs / 2} cy={top + head / 2} r={19} className="fill-sky-50 stroke-sky-500 dark:fill-sky-500/15" strokeWidth={1.5} />
            <text x={left + head + j * cs + cs / 2} y={top + head / 2 + 5} fontSize="14" fontStyle="italic" fontWeight="600" textAnchor="middle" fill="currentColor">
              {s}
            </text>
          </g>
        ))}
        {/* Гаметите на майката */}
        {eggs.map((e, i) => (
          <g key={`e${i}`}>
            <circle cx={left + head / 2} cy={top + head + i * cs + cs / 2} r={19} className="fill-rose-50 stroke-rose-500 dark:fill-rose-500/15" strokeWidth={1.5} />
            <text x={left + head / 2} y={top + head + i * cs + cs / 2 + 5} fontSize="14" fontStyle="italic" fontWeight="600" textAnchor="middle" fill="currentColor">
              {e}
            </text>
          </g>
        ))}
        {/* Клетките */}
        {eggs.map((e, i) =>
          sperms.map((s, j) => {
            const g = zygote(e, s);
            const x = left + head + j * cs;
            const y = top + head + i * cs;
            return (
              <g key={`${i}-${j}`}>
                <rect x={x + 1} y={y + 1} width={cs - 2} height={cs - 2} rx={6} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/50 dark:stroke-gray-600" />
                <Icon mode={mode} genotype={g} x={x + cs / 2} y={y + cs * 0.4} r={cs * 0.2} />
                <text x={x + cs / 2} y={y + cs - 9} fontSize={cs > 80 ? 14 : 12} fontStyle="italic" textAnchor="middle" fill="currentColor">
                  {g}
                </text>
              </g>
            );
          })
        )}
      </LabSvg>

      <div className="mt-3">
        <Readout items={[{ label: 'гамети ♀ × ♂', value: `${eggs.length} × ${sperms.length} = ${cells.length}` }]} />
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">генотипове – {geno.map(([, v]) => v).join(' : ')}</p>
        <Readout items={geno.map(([k, v]) => ({ label: <i className="font-serif">{k}</i>, value: v, tone: 'violet' as const }))} />
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">фенотипове – {pheno.map(([, v]) => v).join(' : ')}</p>
        <Readout items={pheno.map(([k, v]) => ({ label: k, value: v, tone: 'rose' as const }))} />
      </div>
      <Note tone="violet">{noteFor(mode, mom, dad)}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяка клетка на решетката е еднакво вероятна. Ако родителят е хомозиготен, той дава само един вид гамети – затова решетката е по-малка, но отношенията са същите.
        {mode === 'pea2' && ' Гените A (цвят) и B (форма) са на различни хромозоми.'}
      </p>
    </div>
  );
}
