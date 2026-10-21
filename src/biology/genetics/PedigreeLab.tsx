import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// ---------- Модел ----------

type Sex = 'm' | 'f';
type Mode = 'AD' | 'AR' | 'XD' | 'XR' | 'Y';
/** Генотип: алели 1 = алел на белега/болестта, 0 = нормален. Автозомно – два алела; X при мъж – един; Y – един бит. */
type Genotype = number[];

type Person = { id: string; sex: Sex; affected: boolean; gen: number; x: number };
type Couple = { a: string; b: string; children: string[] };
type Pedigree = { name: string; people: Person[]; couples: Couple[]; likely: Mode; why: string };

const MODES: { id: Mode; name: string; rule: string }[] = [
  { id: 'AD', name: 'автозомно доминантно', rule: 'Болното дете трябва да има поне един болен родител.' },
  { id: 'AR', name: 'автозомно рецесивно', rule: 'Двама болни родители (aa × aa) не могат да имат здраво дете.' },
  { id: 'XD', name: 'X-свързано доминантно', rule: 'Болният баща предава своята X на всички дъщери – те трябва да са болни; синът не получава X от баща си.' },
  { id: 'XR', name: 'X-свързано рецесивно', rule: 'Болната майка (XʰXʰ) дава Xʰ на всеки син – синовете трябва да са болни; болната дъщеря трябва да има болен баща.' },
  { id: 'Y', name: 'Y-свързано', rule: 'Белегът е само при мъже и се предава от баща на всички синове.' },
];

/** Възможните генотипове на човек при даден начин на унаследяване, съвместими с фенотипа му. */
function genotypes(mode: Mode, sex: Sex, affected: boolean): Genotype[] {
  if (mode === 'AD' || mode === 'AR') {
    const all = [[1, 1], [1, 0], [0, 0]];
    return all.filter(([a, b]) => (mode === 'AD' ? (a | b) === 1 : (a & b) === 1) === affected);
  }
  if (mode === 'Y') {
    if (sex === 'f') return affected ? [] : [[0]];
    return [[affected ? 1 : 0]];
  }
  if (sex === 'm') return [[affected ? 1 : 0]];
  const all = [[1, 1], [1, 0], [0, 0]];
  return all.filter(([a, b]) => (mode === 'XD' ? (a | b) === 1 : (a & b) === 1) === affected);
}

/** Може ли детето да получи генотипа си от тези родители? */
function inherits(mode: Mode, child: Genotype, childSex: Sex, father: Genotype, mother: Genotype) {
  if (mode === 'AD' || mode === 'AR') {
    const [c1, c2] = child;
    return (father.includes(c1) && mother.includes(c2)) || (father.includes(c2) && mother.includes(c1));
  }
  if (mode === 'Y') return childSex === 'm' ? child[0] === father[0] : true;
  // X: синът взима X от майката; дъщерята – X на бащата и една от X на майката
  if (childSex === 'm') return mother.includes(child[0]);
  const [c1, c2] = child;
  return (c1 === father[0] && mother.includes(c2)) || (c2 === father[0] && mother.includes(c1));
}

/** Здрав човек, който носи алела (хетерозиготен носител). */
const isCarrier = (mode: Mode, g: Genotype, affected: boolean) => !affected && g.includes(1) && (mode === 'AR' || mode === 'XR');

type Analysis = {
  ok: boolean;
  /** Най-малко здрави носители сред хората, които влизат в семейството отвън (и в първото поколение). */
  cost: number;
  assignment: Map<string, Genotype>;
  conflicts: { child: string; parents: [string, string] }[];
};

function analyse(p: Pedigree, mode: Mode): Analysis {
  const byId = new Map(p.people.map(q => [q.id, q]));
  const parents = new Map<string, [string, string]>();
  for (const c of p.couples) {
    const [f, m] = byId.get(c.a)!.sex === 'm' ? [c.a, c.b] : [c.b, c.a];
    for (const ch of c.children) parents.set(ch, [f, m]);
  }
  // Родителите преди децата
  const order = [...p.people].sort((u, v) => u.gen - v.gen);

  // Локални противоречия: тройка родители–дете без съвместими генотипове
  const conflicts: Analysis['conflicts'] = [];
  for (const [child, [f, m]] of parents) {
    const C = byId.get(child)!;
    const F = byId.get(f)!;
    const M = byId.get(m)!;
    const ok = genotypes(mode, F.sex, F.affected).some(gf =>
      genotypes(mode, M.sex, M.affected).some(gm => genotypes(mode, C.sex, C.affected).some(gc => inherits(mode, gc, C.sex, gf, gm)))
    );
    if (!ok) conflicts.push({ child, parents: [f, m] });
  }
  for (const q of p.people) if (genotypes(mode, q.sex, q.affected).length === 0) conflicts.push({ child: q.id, parents: ['', ''] });

  // Пълно търсене на генотиповете с най-малко външни носители
  let best = Infinity;
  let bestAssign = new Map<string, Genotype>();
  const cur = new Map<string, Genotype>();
  const go = (i: number, cost: number) => {
    if (cost >= best) return;
    if (i === order.length) {
      best = cost;
      bestAssign = new Map(cur);
      return;
    }
    const q = order[i];
    const par = parents.get(q.id);
    for (const g of genotypes(mode, q.sex, q.affected)) {
      if (par && !inherits(mode, g, q.sex, cur.get(par[0])!, cur.get(par[1])!)) continue;
      cur.set(q.id, g);
      go(i + 1, cost + (!par && isCarrier(mode, g, q.affected) ? 1 : 0));
      cur.delete(q.id);
    }
  };
  go(0, 0);
  return { ok: best < Infinity, cost: best, assignment: bestAssign, conflicts };
}

/** Генотипът като текст: части с горен индекс за X-хромозомите. */
function genotypeParts(mode: Mode, sex: Sex, g: Genotype): [string, string][] {
  if (mode === 'AD') return [[g.map(a => (a ? 'A' : 'a')).sort().join(''), '']];
  if (mode === 'AR') return [[g.map(a => (a ? 'a' : 'A')).sort().join(''), '']];
  if (mode === 'Y') return sex === 'f' ? [['XX', '']] : [['XY', g[0] ? '*' : '']];
  const [big, small] = mode === 'XR' ? ['H', 'h'] : ['D', 'd'];
  // XR: h – алелът на болестта; XD: D – алелът на болестта
  const sym = (a: number) => (mode === 'XR' ? (a ? small : big) : a ? big : small);
  if (sex === 'm') return [['X', sym(g[0])], ['Y', '']];
  const [a, b] = [...g].sort((u, v) => (mode === 'XR' ? u - v : v - u));
  return [['X', sym(a)], ['X', sym(b)]];
}

// ---------- Родословия ----------

const P = (id: string, sex: Sex, affected: boolean, gen: number, x: number): Person => ({ id, sex, affected, gen, x });

const PEDIGREES: Pedigree[] = [
  {
    name: 'Родословие 1',
    people: [
      P('a', 'm', true, 1, 230), P('b', 'f', false, 1, 300),
      P('c', 'f', true, 2, 70), P('d', 'm', false, 2, 140), P('e', 'm', true, 2, 300), P('f', 'f', false, 2, 370), P('g', 'f', false, 2, 460),
      P('h', 'm', false, 3, 40), P('i', 'f', true, 3, 105), P('j', 'm', true, 3, 170), P('k', 'm', true, 3, 300), P('l', 'f', false, 3, 370),
    ],
    couples: [
      { a: 'a', b: 'b', children: ['c', 'e', 'g'] },
      { a: 'd', b: 'c', children: ['h', 'i', 'j'] },
      { a: 'e', b: 'f', children: ['k', 'l'] },
    ],
    likely: 'AD',
    why: 'Болестта е във всяко поколение, при мъже и жени, всеки болен има болен родител и има предаване от баща на син – типично автозомно доминантно (например болестта на Хънтингтън).',
  },
  {
    name: 'Родословие 2',
    people: [
      P('a', 'm', false, 1, 220), P('b', 'f', false, 1, 300),
      P('c', 'm', false, 2, 120), P('d', 'f', true, 2, 230), P('e', 'm', false, 2, 340), P('f', 'f', false, 2, 410),
      P('g', 'f', false, 3, 330), P('h', 'm', true, 3, 420),
    ],
    couples: [
      { a: 'a', b: 'b', children: ['c', 'd', 'e'] },
      { a: 'e', b: 'f', children: ['g', 'h'] },
    ],
    likely: 'AR',
    why: 'Здрави родители имат болно дете – белегът е рецесивен. Болна е дъщеря на здрав баща, значи не е X-свързан. Остава автозомно рецесивно (например муковисцидоза).',
  },
  {
    name: 'Родословие 3',
    people: [
      P('a', 'm', false, 1, 260), P('b', 'f', false, 1, 330),
      P('c', 'm', true, 2, 60), P('d', 'f', false, 2, 160), P('e', 'm', false, 2, 230), P('f', 'f', false, 2, 330), P('g', 'm', false, 2, 400), P('h', 'm', false, 2, 470),
      P('i', 'm', true, 3, 140), P('j', 'f', false, 3, 195), P('k', 'm', false, 3, 250), P('l', 'm', true, 3, 340), P('m', 'f', false, 3, 400),
    ],
    couples: [
      { a: 'a', b: 'b', children: ['c', 'd', 'f', 'h'] },
      { a: 'e', b: 'd', children: ['i', 'j', 'k'] },
      { a: 'g', b: 'f', children: ['l', 'm'] },
    ],
    likely: 'XR',
    why: 'Болни са само мъже, родени от здрави майки, а сестрите им предават болестта на своите синове. Автозомно рецесивно е възможно само ако 4 души отвън са случайно носители – X-свързано рецесивно изисква една носителка (например хемофилия).',
  },
  {
    name: 'Родословие 4',
    people: [
      P('a', 'm', true, 1, 230), P('b', 'f', false, 1, 300),
      P('c', 'f', true, 2, 80), P('d', 'm', false, 2, 150), P('e', 'm', false, 2, 280), P('f', 'f', false, 2, 350), P('g', 'f', true, 2, 430),
      P('h', 'm', true, 3, 40), P('i', 'f', false, 3, 90), P('j', 'f', true, 3, 140), P('k', 'm', false, 3, 190), P('l', 'f', false, 3, 290), P('n', 'm', false, 3, 350),
    ],
    couples: [
      { a: 'a', b: 'b', children: ['c', 'e', 'g'] },
      { a: 'd', b: 'c', children: ['h', 'i', 'j', 'k'] },
      { a: 'e', b: 'f', children: ['l', 'n'] },
    ],
    likely: 'XD',
    why: 'Всички дъщери на болния мъж са болни, а синът му е здрав и не предава белега. Болната жена го дава на половината от децата си, и на синове, и на дъщери. Автозомно доминантно също е възможно, но такова разпределение по пол би било случайност – по-вероятно е X-свързано доминантно (например хипофосфатемичен рахит).',
  },
  {
    name: 'Родословие 5',
    people: [
      P('a', 'm', true, 1, 230), P('b', 'f', false, 1, 300),
      P('c', 'm', true, 2, 80), P('d', 'f', false, 2, 150), P('e', 'f', false, 2, 260), P('f', 'm', false, 2, 330), P('g', 'm', true, 2, 440),
      P('h', 'm', true, 3, 80), P('i', 'f', false, 3, 150), P('j', 'm', false, 3, 260), P('k', 'f', false, 3, 330),
    ],
    couples: [
      { a: 'a', b: 'b', children: ['c', 'e', 'g'] },
      { a: 'c', b: 'd', children: ['h', 'i'] },
      { a: 'f', b: 'e', children: ['j', 'k'] },
    ],
    likely: 'Y',
    why: 'Белегът (въображаем) е само при мъже и минава от баща на всички синове, но никога през дъщеря. Автозомно доминантно също е съвместимо, но строгото предаване само по мъжка линия сочи Y-хромозомата.',
  },
];

// ---------- Чертеж ----------

const GEN_Y = [0, 46, 146, 246];
const S = 22;
const ROMAN = ['', 'I', 'II', 'III'];

function GenotypeText({ x, y, parts }: { x: number; y: number; parts: [string, string][] }) {
  return (
    <text x={x} y={y} fontSize="10" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300" fontWeight="600">
      {parts.map(([base, sup], i) => (
        <tspan key={i}>
          {base}
          {sup && (
            <tspan dy="-4" fontSize="8">
              {sup}
            </tspan>
          )}
          {sup && <tspan dy="4"> </tspan>}
        </tspan>
      ))}
    </text>
  );
}

/** Анализ на родословие: кои начини на унаследяване са съвместими и кои хора изключват останалите. */
export default function PedigreeLab() {
  const [pi, setPi] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showGeno, setShowGeno] = useState(false);
  const ped = PEDIGREES[pi];

  const results = useMemo(() => new Map(MODES.map(m => [m.id, analyse(ped, m.id)])), [ped]);
  const res = mode ? results.get(mode)! : null;
  const byId = new Map(ped.people.map(q => [q.id, q]));

  // Номера по поколения, отляво надясно: I-1, II-3…
  const labels = new Map<string, string>();
  for (const gen of [1, 2, 3]) {
    ped.people
      .filter(q => q.gen === gen)
      .sort((u, v) => u.x - v.x)
      .forEach((q, i) => labels.set(q.id, `${ROMAN[gen]}-${i + 1}`));
  }

  const hot = new Set<string>();
  if (res && !res.ok) for (const c of res.conflicts) [c.child, ...c.parents].filter(Boolean).forEach(id => hot.add(id));
  const conflictText = [
    ...new Set(
      (res?.conflicts ?? []).map(c =>
        c.parents[0] ? `${labels.get(c.child)} и родителите ${labels.get(c.parents[0])}, ${labels.get(c.parents[1])}` : `${labels.get(c.child)} (жена)`
      )
    ),
  ];

  const select = (i: number) => {
    setPi(i);
    setMode(null);
    setShowAll(false);
    setShowGeno(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PEDIGREES.map((p, i) => (
          <DiagramButton key={p.name} onClick={() => select(i)} active={pi === i}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 520 300" className="w-full h-auto max-w-2xl mx-auto block select-none mt-3 text-gray-800 dark:text-gray-100">
        {[1, 2, 3].map(g => (
          <text key={g} x={6} y={GEN_Y[g] + 4} fontSize="12" fontWeight="700" className="fill-gray-500 dark:fill-gray-400">
            {ROMAN[g]}
          </text>
        ))}

        {/* Бракове и деца */}
        {ped.couples.map(c => {
          const A = byId.get(c.a)!;
          const B = byId.get(c.b)!;
          const y = GEN_Y[A.gen];
          const mx = (A.x + B.x) / 2;
          const kids = c.children.map(id => byId.get(id)!);
          const ky = GEN_Y[kids[0].gen];
          const sibY = ky - S / 2 - 18;
          const xs = [...kids.map(k => k.x), mx];
          return (
            <g key={c.a + c.b} stroke="currentColor" strokeWidth="1.5" fill="none">
              <line x1={Math.min(A.x, B.x) + S / 2} y1={y} x2={Math.max(A.x, B.x) - S / 2} y2={y} />
              <line x1={mx} y1={y} x2={mx} y2={sibY} />
              <line x1={Math.min(...xs)} y1={sibY} x2={Math.max(...xs)} y2={sibY} />
              {kids.map(k => (
                <line key={k.id} x1={k.x} y1={sibY} x2={k.x} y2={ky - S / 2} />
              ))}
            </g>
          );
        })}

        {/* Хора */}
        {ped.people.map(q => {
          const y = GEN_Y[q.gen];
          const fill = q.affected ? 'fill-rose-600 dark:fill-rose-500' : 'fill-white dark:fill-gray-800';
          const stroke = hot.has(q.id) ? 'stroke-amber-500' : 'stroke-gray-700 dark:stroke-gray-200';
          const sw = hot.has(q.id) ? 4 : 1.8;
          const g = res?.ok && showGeno ? res.assignment.get(q.id) : undefined;
          return (
            <g key={q.id}>
              {q.sex === 'm' ? (
                <rect x={q.x - S / 2} y={y - S / 2} width={S} height={S} className={`${fill} ${stroke}`} strokeWidth={sw} />
              ) : (
                <circle cx={q.x} cy={y} r={S / 2} className={`${fill} ${stroke}`} strokeWidth={sw} />
              )}
              {g && mode && isCarrier(mode, g, q.affected) && <circle cx={q.x} cy={y} r={4} className="fill-rose-600 dark:fill-rose-500" />}
              <text x={q.x} y={y + S / 2 + 12} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {labels.get(q.id)}
              </text>
              {g && mode && <GenotypeText x={q.x} y={y + S / 2 + 24} parts={genotypeParts(mode, q.sex, g)} />}
            </g>
          );
        })}

        {/* Легенда */}
        <g fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          <rect x={14} y={283} width={10} height={10} className="fill-white dark:fill-gray-800 stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.2" />
          <text x={28} y={292}>мъж</text>
          <circle cx={64} cy={288} r={5} className="fill-white dark:fill-gray-800 stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.2" />
          <text x={73} y={292}>жена</text>
          <rect x={108} y={283} width={10} height={10} className="fill-rose-600 dark:fill-rose-500" />
          <text x={122} y={292}>с белега</text>
          {showGeno && (mode === 'AR' || mode === 'XR') && (
            <>
              <circle cx={176} cy={288} r={5} className="fill-white dark:fill-gray-800 stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.2" />
              <circle cx={176} cy={288} r={2} className="fill-rose-600" />
              <text x={185} y={292}>здрав носител</text>
            </>
          )}
        </g>
      </LabSvg>

      <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-200 mt-3">Как се унаследява белегът? Избери предположение:</p>
      <Buttons>
        {MODES.map(m => (
          <DiagramButton
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setShowGeno(false);
            }}
            active={mode === m.id}
          >
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>

      {res && mode && (
        <div className="mt-3 text-sm text-center">
          {res.ok ? (
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Съвместимо с родословието
              {res.cost > 0 && (mode === 'AR' || mode === 'XR')
                ? ` – но само ако ${res.cost} ${res.cost === 1 ? 'здрав човек от първото поколение или отвън е носител' : 'здрави души от първото поколение или отвън са носители'}.`
                : '.'}
            </p>
          ) : (
            <div className="text-rose-600 dark:text-rose-400 font-medium">
              <p>✗ Изключено. {MODES.find(m => m.id === mode)!.rule}</p>
              <p className="mt-1 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                Противоречие (оградено в оранжево):{' '}
                {conflictText.slice(0, 3).join('; ')}
                {conflictText.length > 3 ? ' …' : ''}
              </p>
            </div>
          )}
          {res.ok && (
            <Buttons>
              <DiagramButton onClick={() => setShowGeno(!showGeno)} active={showGeno}>
                {showGeno ? 'Скрий генотипите' : 'Покажи възможни генотипове'}
              </DiagramButton>
            </Buttons>
          )}
        </div>
      )}

      <Buttons>
        <DiagramButton onClick={() => setShowAll(!showAll)} active={showAll}>
          {showAll ? 'Скрий отговора' : 'Провери всички начини'}
        </DiagramButton>
      </Buttons>
      {showAll && (
        <div className="mt-3 text-sm">
          <ul className="grid sm:grid-cols-2 gap-1 max-w-xl mx-auto">
            {MODES.map(m => {
              const r = results.get(m.id)!;
              return (
                <li key={m.id} className={r.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 line-through'}>
                  {r.ok ? '✓' : '✗'} {m.name}
                  {r.ok && r.cost > 0 && (m.id === 'AR' || m.id === 'XR') ? ` (носители: ${r.cost})` : ''}
                </li>
              );
            })}
          </ul>
          <Note tone="violet">Най-вероятно: {MODES.find(m => m.id === ped.likely)!.name}. {ped.why}</Note>
        </div>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Програмата пробва всички възможни генотипове на всички хора. Приема, че белегът се проявява винаги, когато генотипът го
        позволява, и че няма нови мутации. „Носители“ – колко здрави хора от първото поколение или от онези, които влизат в семейството
        отвън, трябва случайно да носят рядкия алел. Колкото повече са, толкова по-малко вероятен е този начин.
      </p>
    </div>
  );
}
