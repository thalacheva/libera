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

const lessons = [...fileLesson].filter(([f, p]) => !p.startsWith('/reference') && !p.startsWith('/progress') && p !== '/astronomy/tonight');
const files = only.length ? lessons.filter(([f]) => only.includes(f)) : lessons;

// Споменавания в друг смисъл („съпротивление на въздуха“, „напрежение на Хъбъл“…) – не ги отбелязваме
const SKIP = {
  'src/analysis/Derivatives.tsx': ['average-speed'],
  'src/physics/mechanics/PlaneMotion.tsx': ['resistance'],
  'src/physics/mechanics/StaticsFluids.tsx': ['solar-corona'],
  'src/physics/waves/Oscillations.tsx': ['resistance'],
  'src/physics/waves/Waves.tsx': ['momentum'],
  'src/physics/optics/WaveOptics.tsx': ['refraction'],
  'src/geometry/Vectors.tsx': ['combination'],
  'src/probability/Probability.tsx': ['frequency', 'median-triangle'],
  'src/astronomy/Lecture05.tsx': ['activity'],
  'src/astronomy/Lecture08.tsx': ['momentum'],
  'src/astronomy/Lecture10.tsx': ['magnification'],
  'src/astronomy/Lecture12.tsx': ['activity'],
  // орбитален резонанс, не резонанс при трептенията
  'src/astronomy/Lecture13.tsx': ['resonance'],
  'src/astronomy/Lecture14.tsx': ['resonance'],
  'src/astronomy/Lecture15.tsx': ['resonance'],
  'src/astronomy/Lecture17.tsx': ['resonance'],
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
  if (!chosen.length) continue;

  total += chosen.length;
  console.log(`\n${file} (${lesson}) – ${chosen.length}`);
  for (const c of chosen) {
    const line = src.slice(0, c.at).split('\n').length;
    const ctx = `${src.slice(Math.max(0, c.at - 35), c.at)}[${c.text}]${src.slice(c.end, c.end + 25)}`.replace(/\s+/g, ' ');
    console.log(`  ${String(line).padStart(4)}  ${c.t.id.padEnd(26)} ${ctx}`);
  }
  if (write) {
    for (const c of [...chosen].reverse()) {
      src = `${src.slice(0, c.at)}<Term id="${c.t.id}">${src.slice(c.at, c.end)}</Term>${src.slice(c.end)}`;
    }
    if (!/^import Term from '~\/Term';/m.test(src)) {
      const imports = [...src.matchAll(/^import [^;]+;$/gms)];
      const last = imports.at(-1);
      const pos = last.index + last[0].length;
      src = `${src.slice(0, pos)}\nimport Term from '~/Term';${src.slice(pos)}`;
    }
    fs.writeFileSync(file, src);
  }
}
console.log(`\n${total} споменавания в ${files.length} урока${write ? ' – записани' : ''}`);
