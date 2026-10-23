// Отбелязва термините от речника в текста на уроците: <Term id="…">…</Term>.
//   node scripts/mark-terms.mjs [--write] [файлове…]   (по подразбиране – всички уроци)
// Без --write само показва кои споменавания би отбелязал.
// Във всеки урок се отбелязва само първото споменаване на термин, обяснен в ДРУГ урок,
// и само в обикновения текст (JSX), не в заглавия, <strong>, връзки, лаборатории, тестове и задачи.
// Термините с auto: false (много общи думи) се отбелязват само на ръка. Проверява и дали всички <Term id> са в речника.
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const args = process.argv.slice(2);
const write = args.includes('--write');
const only = args.filter(a => a !== '--write').map(f => path.normalize(f));

// ---------- речникът ----------
const dataSrc = fs.readFileSync('src/reference/glossaryData.ts', 'utf8');
const js = ts.transpileModule(dataSrc, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { TERMS } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

// ---------- урок → файл (от маршрутите в App.tsx) ----------
const app = fs.readFileSync('src/App.tsx', 'utf8');
const lazyFile = new Map();
for (const m of app.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/([^']+)'\)/g)) lazyFile.set(m[1], `src/${m[2]}.tsx`);
const fileLesson = new Map();
const stack = [];
for (const line of app.split('\n')) {
  const leaf = /<Route path="([^"]+)" element={<(\w+) \/>} \/>/.exec(line);
  const open = /<Route path="([^"]+)">/.exec(line);
  if (leaf) {
    const file = lazyFile.get(leaf[2]);
    if (file) fileLesson.set(path.normalize(file), '/' + [...stack, leaf[1]].join('/'));
  } else if (open) stack.push(open[1]);
  else if (/<\/Route>/.test(line)) stack.pop();
}

const lessons = [...fileLesson].filter(([f, p]) => !p.startsWith('/reference') && !p.startsWith('/progress') && p !== '/astronomy/tonight' && p !== '/math');
const files = only.length ? lessons.filter(([f]) => only.includes(f)) : lessons;

// Споменавания в друг смисъл („съпротивление на въздуха“, „напрежение на Хъбъл“…) – не ги отбелязваме
const SKIP = {
  // диафрагмата на микроскопа, не дихателният мускул
  'src/biology/cell/Life.tsx': ['diaphragm'],
  // мицели от жлъчни соли, не мицел на гъбите
  'src/biology/physiology/Digestion.tsx': ['mycelium', 'activity'],
  // реабсорбция в капилярите и съпротивление на съдовете, не в нефрона и не електрично
  'src/biology/physiology/Circulation.tsx': ['tubular-reabsorption', 'resistance'],
  // увеличение на PCO₂, не на микроскопа
  'src/biology/physiology/Breathing.tsx': ['magnification'],
  // точка на кипене, синтез на продукт, плазмен ток през бъбрека
  'src/biology/physiology/Homeostasis.tsx': ['latent-heat-vaporization', 'nuclear-fusion', 'electric-current'],
  // „семената“ на галактиките, не на растенията
  'src/astronomy/Lecture27.tsx': ['seed'],
  // редици от клетки, не числова редица; ендодермата на корена, не зародишният лист
  'src/biology/plants/PlantTransport.tsx': ['sequence', 'germ-layers', 'electric-potential'],
  // колба с „тясно гърло“, не ефектът на тясното гърло
  'src/chemistry/quantities/Solutions.tsx': ['bottleneck-effect'],
  // честотите на алелите, не на трептенията
  'src/biology/evolution/Selection.tsx': ['frequency'],
  // възлите на дървото, не на стоящата вълна
  'src/biology/evolution/Phylogeny.tsx': ['standing-wave'],
  // устойчивост на антибиотици, не на равновесието
  'src/biology/evolution/Microbes.tsx': ['stable-equilibrium'],
  // хордата на хордовите, не на окръжността
  'src/biology/evolution/Classification.tsx': ['chord'],
  // топенето и кипенето като явления (не топлината им) и компонентите на смес
  'src/chemistry/structure/Substances.tsx': ['latent-heat-fusion', 'latent-heat-vaporization', 'vector-components'],
  // енергия на химичната връзка и резонансни структури, не ядрената енергия на връзката и резонансът
  // + кристалната решетка, не дифракционната
  'src/chemistry/structure/Bonding.tsx': ['binding-energy', 'resonance', 'diffraction-grating'],
  'src/chemistry/structure/AtomsTable.tsx': ['electric-charge'],
  // „количеството вещество“ в смисъл на маса, не на мол
  'src/astronomy/Lecture06.tsx': ['amount-of-substance'],
  'src/chemistry/structure/Molecules.tsx': ['latent-heat-fusion', 'latent-heat-vaporization', 'diffraction-grating'],
  'src/analysis/Derivatives.tsx': ['average-speed'],
  // кристалната решетка, не дифракционната
  'src/chemistry/reactions/ReactionEnergy.tsx': ['diffraction-grating'],
  // компонентите на буфера, не на вектор; „провежда слабо ток“
  'src/chemistry/reactions/AcidsBases.tsx': ['vector-components', 'electric-current'],
  // средната скорост на реакцията и синтезът на амоняк, не на движението и ядреният синтез
  'src/chemistry/reactions/Kinetics.tsx': ['average-speed', 'nuclear-fusion'],
  // „от порядъка на“ в разговорен смисъл
  'src/chemistry/reactions/Equilibrium.tsx': ['order-of-magnitude'],
  // редът на активност на металите, не радиоактивността
  'src/chemistry/inorganic/Metals.tsx': ['activity'],
  // синтезът на амоняк, не ядреният синтез
  'src/chemistry/inorganic/Nonmetals.tsx': ['nuclear-fusion'],
  // кипенето като явление, не топлината му
  'src/chemistry/inorganic/QualitativeAnalysis.tsx': ['latent-heat-vaporization'],
  // органичен синтез, кипене/топене като явления, „по-силна киселина“, „производни на амоняка“
  'src/chemistry/organic/FunctionalGroups.tsx': ['nuclear-fusion', 'latent-heat-vaporization', 'strong-acid', 'derivative'],
  // температура на топене/кипене и „дясната ръка“ като образ за хиралност
  'src/chemistry/organic/Biomolecules.tsx': ['latent-heat-fusion', 'latent-heat-vaporization', 'right-hand-rule'],
  // заместване на халоген (не методът), кипене и топене като явления
  'src/chemistry/organic/Hydrocarbons.tsx': ['substitution-method', 'latent-heat-vaporization', 'latent-heat-fusion'],
  // „комбинации“ на условия, химично заместване и синтез на лекарства
  'src/chemistry/organic/Mechanisms.tsx': ['combination', 'substitution-method', 'nuclear-fusion'],
  // „степен на окисление“, не самото окисление
  'src/chemistry/inorganic/CompoundClasses.tsx': ['oxidation'],
  // ядрен магнитен резонанс и ppm на честотата в ЯМР, не механичният резонанс и концентрацията
  'src/chemistry/world/Spectroscopy.tsx': ['resonance', 'ppm'],
  // медицинският ЯМР томограф, не спектроскопията
  'src/physics/electricity/DirectCurrent.tsx': ['nmr-spectroscopy'],
  'src/physics/electricity/MagneticField.tsx': ['nmr-spectroscopy'],
  // законът на Фарадей за електролизата, не за индукцията
  'src/chemistry/reactions/Redox.tsx': ['electromagnetic-induction'],
  // анод и катод на вакуумна фотоклетка, не на електролизна вана
  'src/physics/modern/Photons.tsx': ['anode', 'cathode'],
  // заместване на x в израза и „увеличение“ на графиката, не методът за системи и оптичното увеличение
  'src/analysis/Limits.tsx': ['substitution-method', 'magnification'],
  // лупа и увеличение върху числовата ос, не оптичните
  'src/numbers/NumberSets.tsx': ['magnifier', 'magnification'],
  // хипотезата за пчелната пита е математическа хипотеза (твърдение без доказателство), не научната
  'src/geometry/Polygons.tsx': ['hypothesis'],
  // синтез на белтъци, опит „импулс и гонене“, нуклеинови киселини
  'src/biology/cell/Structure.tsx': ['nuclear-fusion', 'momentum', 'acid', 'atomic-nucleus'],
  // „неполярни молекули“ – обратното на термина
  'src/biology/cell/Membrane.tsx': ['polar-molecule'],
  // „спектър на действие“ е биологичното понятие; „верига от преносители“ на електрони, не мембранни белтъци
  'src/biology/energy/Photosynthesis.tsx': ['spectrum', 'carrier-protein'],
  // „синтез“ на молекули; „ускорение“ на реакцията от ензима; полуразпадане на реакция без ензим
  'src/biology/energy/Enzymes.tsx': ['nuclear-fusion', 'acceleration', 'half-life'],
  'src/biology/energy/Respiration.tsx': ['nuclear-fusion'],
  // „полимеразна верижна реакция“, „устойчивост на антибиотик“, „редица страни“, „честота на местата за рязане“, „логаритмичен мащаб“
  'src/biology/genetics/Biotech.tsx': ['chain-reaction', 'stable-equilibrium', 'sequence', 'frequency', 'scale'],
  // матрична верига на ДНК; решетка на Пънет; хромозомна аномалия
  'src/biology/genetics/Dna.tsx': ['matrix'],
  'src/biology/genetics/Mendel.tsx': ['diffraction-grating'],
  'src/biology/genetics/HumanGenetics.tsx': ['water-anomaly'],
  'src/physics/mechanics/PlaneMotion.tsx': ['resistance'],
  'src/physics/mechanics/StaticsFluids.tsx': ['solar-corona'],
  'src/physics/waves/Oscillations.tsx': ['resistance'],
  'src/physics/waves/Waves.tsx': ['momentum'],
  'src/physics/optics/WaveOptics.tsx': ['refraction'],
  'src/geometry/Vectors.tsx': ['combination'],
  'src/probability/Probability.tsx': ['frequency', 'median-triangle'],
  // „момент на импулса“, неравенството на Бел, квантовите суперпозиция и амплитуди
  'src/physics/modern/Uncertainty.tsx': ['amplitude'],
  // тунелният микроскоп, не оптичният
  'src/physics/modern/ParticleInBox.tsx': ['microscope'],
  'src/physics/modern/QuantumAtom.tsx': ['momentum', 'superposition', 'inequality', 'amplitude'],
  'src/astronomy/Lecture05.tsx': ['activity'],
  'src/astronomy/Lecture08.tsx': ['momentum'],
  'src/astronomy/Lecture10.tsx': ['magnification'],
  'src/astronomy/Lecture12.tsx': ['activity'],
  // орбитален резонанс, не резонанс при трептенията
  'src/astronomy/Lecture13.tsx': ['resonance'],
  'src/astronomy/Lecture14.tsx': ['resonance'],
  'src/astronomy/Lecture15.tsx': ['resonance'],
  'src/astronomy/Lecture17.tsx': ['resonance'],
  // желязната „матрица“ на метеорита, ПЗС матриците на камерите
  'src/astronomy/Lecture16.tsx': ['matrix'],
  'src/astronomy/Lecture32.tsx': ['matrix'],
  'src/astronomy/Lecture24.tsx': ['voltage'],
  'src/astronomy/Lecture28.tsx': ['voltage'],
  'src/astronomy/Lecture29.tsx': ['coma'],
};

// ---------- търсене ----------
const SKIP_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'a', 'Link', 'Term', 'button', 'code', 'svg', 'text', 'tspan', 'title',
  'Quiz', 'Task', 'TaskBoard', 'TaskLevel', 'WordProblems', 'Trainer', 'Theorem',
]);
const L = '[\\p{L}\\p{N}]';
const patterns = TERMS.filter(t => t.auto !== false).flatMap(t =>
  (t.forms.length ? t.forms : [t.term.toLowerCase()]).map(form => ({
    t,
    re: new RegExp(`(?<!${L})${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?!${L})`, 'giu'),
  }))
);

const tagName = n => (ts.isJsxElement(n) ? n.openingElement.tagName.getText() : null);

// JSX маха интервал, който е в края на ред преди елемент или в началото на ред след него:
// „от\n<Term>фотосферата</Term>“ се показва като „отфотосферата“. Там слагаме {' '}.
function lostSpaces(src, file) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const at = [];
  const visit = n => {
    if (tagName(n) === 'Term') {
      const kids = n.parent.children ?? [];
      const i = kids.indexOf(n);
      const [prev, next] = [kids[i - 1], kids[i + 1]];
      if (prev && ts.isJsxText(prev) && /\S[ \t]*\n\s*$/.test(prev.text)) at.push(prev.end - /[ \t]*\n\s*$/.exec(prev.text)[0].length);
      if (next && ts.isJsxText(next) && /^\s*\n\s*\S/.test(next.text)) at.push(n.end);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return at;
}

let total = 0;
for (const [file, lesson] of files) {
  let src = fs.readFileSync(file, 'utf8');
  // вече отбелязаните термини не се отбелязват втори път
  const marked = new Set([...src.matchAll(/<Term id="([^"]+)"/g)].map(m => m[1]));
  for (const id of SKIP[file] ?? []) marked.add(id);
  for (const id of marked) if (!TERMS.some(t => t.id === id)) console.log(`!! ${file}: няма термин „${id}“ в речника`);
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const texts = [];
  const visit = (n, skip) => {
    const tag = tagName(n);
    const s = skip || (tag && (SKIP_TAGS.has(tag) || /Lab$/.test(tag)));
    if (ts.isJsxText(n) && !s) texts.push(n);
    ts.forEachChild(n, c => visit(c, s));
  };
  visit(sf, false);

  // първото споменаване на всеки термин (в реда на текста)
  const found = new Map();
  const own = [];
  for (const node of texts) {
    const start = node.getStart(sf);
    const text = src.slice(start, node.end);
    for (const { t, re } of patterns) {
      for (const m of text.matchAll(re)) {
        const at = start + m.index;
        const hit = { t, at, end: at + m[0].length, text: m[0] };
        // термините от самия урок не се отбелязват, но пазят думите си: „показател на пречупване“ не става „показател“
        if (t.lesson === lesson) own.push(hit);
        else if (!marked.has(t.id)) found.set(t.id, [...(found.get(t.id) ?? []), hit]);
      }
    }
  }
  const covered = h => own.some(o => o.at <= h.at && h.end <= o.end && o.end - o.at > h.end - h.at);
  // първото незакрито споменаване; при застъпване – по-дългото
  const picks = [...found.values()]
    .map(hits => hits.filter(h => !covered(h)).sort((a, b) => a.at - b.at)[0])
    .filter(Boolean)
    .sort((a, b) => a.at - b.at || b.end - a.end);
  const chosen = [];
  for (const p of picks) if (!chosen.length || p.at >= chosen.at(-1).end) chosen.push(p);
  total += chosen.length;
  if (chosen.length) {
    console.log(`\n${file} (${lesson}) – ${chosen.length}`);
    for (const c of chosen) {
      const line = src.slice(0, c.at).split('\n').length;
      const ctx = `${src.slice(Math.max(0, c.at - 35), c.at)}[${c.text}]${src.slice(c.end, c.end + 25)}`.replace(/\s+/g, ' ');
      console.log(`  ${String(line).padStart(4)}  ${c.t.id.padEnd(26)} ${ctx}`);
    }
  }
  if (write && chosen.length) {
    for (const c of [...chosen].reverse()) {
      src = `${src.slice(0, c.at)}<Term id="${c.t.id}">${src.slice(c.at, c.end)}</Term>${src.slice(c.end)}`;
    }
    if (!/^import Term from '~\/Term';/m.test(src)) {
      const imports = [...src.matchAll(/^import [^;]+;$/gms)];
      const last = imports.at(-1);
      const pos = last.index + last[0].length;
      src = `${src.slice(0, pos)}\nimport Term from '~/Term';${src.slice(pos)}`;
    }
  }
  const spaces = lostSpaces(src, file);
  if (spaces.length) {
    console.log(`\n${file}: ${spaces.length} изгубени интервала около <Term>${write ? ' – оправени' : ''}`);
    for (const a of spaces) console.log(`  ${String(src.slice(0, a).split('\n').length).padStart(4)}  …${src.slice(Math.max(0, a - 30), a + 30).replace(/\s+/g, ' ')}…`);
    if (write) for (const a of [...spaces].sort((x, y) => y - x)) src = `${src.slice(0, a)}{' '}${src.slice(a)}`;
  }
  if (write && (chosen.length || spaces.length)) fs.writeFileSync(file, src);
}
console.log(`\n${total} споменавания в ${files.length} урока${write ? ' – записани' : ''}`);
