import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// ---------- Модел ----------

/** Алели на гена за кръвните групи: A = Iᴬ, B = Iᴮ, 0 = i. */
type Allele = 'A' | 'B' | '0';
type Group = 'A' | 'B' | 'AB' | '0';
type Abo = [Allele, Allele];
type Rh = 'DD' | 'Dd' | 'dd';

const ABO: Abo[] = [
  ['A', 'A'],
  ['A', '0'],
  ['B', 'B'],
  ['B', '0'],
  ['A', 'B'],
  ['0', '0'],
];
const RH: Rh[] = ['DD', 'Dd', 'dd'];
const GROUPS: Group[] = ['A', 'B', 'AB', '0'];

const group = (g: Abo): Group => (g.includes('A') && g.includes('B') ? 'AB' : g.includes('A') ? 'A' : g.includes('B') ? 'B' : '0');
const rhPlus = (r: string) => r.includes('D');
const sortAbo = (g: Abo): Abo => [...g].sort((u, v) => 'AB0'.indexOf(u) - 'AB0'.indexOf(v)) as Abo;

const COLOR: Record<Group, string> = {
  A: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  B: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  AB: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200',
  '0': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
};
const BAR: Record<Group, string> = { A: 'bg-sky-500', B: 'bg-amber-500', AB: 'bg-violet-500', '0': 'bg-emerald-500' };

function AlleleText({ a }: { a: Allele }) {
  return a === '0' ? (
    <i>i</i>
  ) : (
    <>
      <i>I</i>
      <sup>{a}</sup>
    </>
  );
}
function AboText({ g }: { g: Abo }) {
  const [a, b] = sortAbo(g);
  return (
    <span className="whitespace-nowrap">
      <AlleleText a={a} />
      <AlleleText a={b} />
    </span>
  );
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const frac = (k: number, n: number) => (k === 0 ? '0' : k === n ? '1' : `${k / gcd(k, n)}/${n / gcd(k, n)}`);

/** Вероятностите за децата: група × Rh, от 16 равновероятни комбинации на алелите. */
function offspring(m: Abo, f: Abo, mr: Rh, fr: Rh) {
  const counts = new Map<string, number>();
  for (const a of m) for (const b of f) for (const x of mr) for (const y of fr) {
    const key = `${group([a, b])} ${rhPlus(x + y) ? 'Rh⁺' : 'Rh⁻'}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// ---------- Загадки за бащинство ----------

type Phen = { g: Group; rh: boolean };
const phenText = (p: Phen) => `${p.g} ${p.rh ? 'Rh⁺' : 'Rh⁻'}`;
const aboOf = (g: Group) => ABO.filter(x => group(x) === g);
const rhOf = (plus: boolean) => RH.filter(r => rhPlus(r) === plus);

/** Може ли мъжът да е баща? Връща причината, ако не може. */
function canBeFather(mother: Phen, child: Phen, father: Phen): string | null {
  const aboOk = aboOf(mother.g).some(m => aboOf(father.g).some(f => m.some(a => f.some(b => group([a, b]) === child.g))));
  const rhOk = rhOf(mother.rh).some(m => rhOf(father.rh).some(f => [...m].some(a => [...f].some(b => rhPlus(a + b) === child.rh))));
  if (!aboOk) return `група ${father.g} не може да даде алела, който детето не е получило от майката`;
  if (!rhOk) return 'по резус-фактора не е възможно';
  return null;
}

const PUZZLES: { mother: Phen; child: Phen; men: Phen[] }[] = [
  { mother: { g: 'A', rh: false }, child: { g: '0', rh: true }, men: [{ g: 'AB', rh: true }, { g: 'B', rh: false }, { g: 'A', rh: true }, { g: '0', rh: true }] },
  { mother: { g: 'B', rh: true }, child: { g: 'A', rh: false }, men: [{ g: 'A', rh: true }, { g: '0', rh: false }, { g: 'AB', rh: false }, { g: 'B', rh: true }] },
  { mother: { g: 'AB', rh: true }, child: { g: 'B', rh: true }, men: [{ g: 'A', rh: false }, { g: '0', rh: false }, { g: 'AB', rh: true }, { g: 'B', rh: true }] },
  { mother: { g: 'A', rh: true }, child: { g: 'AB', rh: false }, men: [{ g: '0', rh: false }, { g: 'B', rh: true }, { g: 'A', rh: false }, { g: 'AB', rh: false }] },
];

// ---------- Части на интерфейса ----------

function ParentPicker({ title, abo, rh, setAbo, setRh }: { title: string; abo: Abo; rh: Rh; setAbo: (g: Abo) => void; setRh: (r: Rh) => void }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <p className="text-sm font-semibold text-center mb-1">
        {title}: <span className={`px-1.5 rounded ${COLOR[group(abo)]}`}>{group(abo)}</span> {rhPlus(rh) ? 'Rh⁺' : 'Rh⁻'}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
        {ABO.map(g => (
          <button
            key={g.join('')}
            onClick={() => setAbo(g)}
            aria-pressed={abo.join('') === g.join('')}
            className={`px-2 py-1 rounded border text-sm ${abo.join('') === g.join('') ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <AboText g={g} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
        {RH.map(r => (
          <button
            key={r}
            onClick={() => setRh(r)}
            aria-pressed={rh === r}
            className={`px-2 py-1 rounded border text-sm italic ${rh === r ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15' : 'border-gray-200 dark:border-gray-700'}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cross() {
  const [m, setM] = useState<Abo>(['A', '0']);
  const [f, setF] = useState<Abo>(['B', '0']);
  const [mr, setMr] = useState<Rh>('dd');
  const [fr, setFr] = useState<Rh>('Dd');
  const counts = offspring(m, f, mr, fr);
  const byGroup = GROUPS.map(g => [g, [...counts].filter(([k]) => k.startsWith(g + ' ')).reduce((s, [, v]) => s + v, 0)] as const);
  const rhPlusCount = [...counts].filter(([k]) => k.endsWith('Rh⁺')).reduce((s, [, v]) => s + v, 0);
  const sm = sortAbo(m);
  const sf = sortAbo(f);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3">
        <ParentPicker title="Майка" abo={m} rh={mr} setAbo={setM} setRh={setMr} />
        <ParentPicker title="Баща" abo={f} rh={fr} setAbo={setF} setRh={setFr} />
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-4 items-start">
        <table className="text-sm border-collapse">
          <tbody>
            <tr>
              <td className="p-1 text-xs text-gray-500 dark:text-gray-400 text-center">♀ \ ♂</td>
              {sf.map((a, i) => (
                <td key={i} className="p-1 text-center font-semibold">
                  <AlleleText a={a} />
                </td>
              ))}
            </tr>
            {sm.map((a, i) => (
              <tr key={i}>
                <td className="p-1 text-center font-semibold">
                  <AlleleText a={a} />
                </td>
                {sf.map((b, j) => (
                  <td key={j} className={`w-16 h-12 text-center border border-white dark:border-gray-800 ${COLOR[group([a, b])]}`}>
                    <AboText g={[a, b]} />
                    <div className="text-xs font-semibold">{group([a, b])}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-56 text-sm">
          {byGroup.map(([g, k]) => (
            <div key={g} className="flex items-center gap-2 mb-1">
              <span className="w-7 font-semibold">{g}</span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded">
                <div className={`h-3 rounded ${BAR[g]}`} style={{ width: `${(k / 16) * 100}%` }} />
              </div>
              <span className="w-9 text-right tabular-nums">{frac(k, 16)}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="w-7 font-semibold">Rh⁺</span>
            <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="h-3 rounded bg-rose-500" style={{ width: `${(rhPlusCount / 16) * 100}%` }} />
            </div>
            <span className="w-9 text-right tabular-nums">{frac(rhPlusCount, 16)}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm mt-3 text-gray-700 dark:text-gray-200">
        Деца:{' '}
        {[...counts]
          .sort((u, v) => v[1] - u[1])
          .map(([k, v]) => `${k} – ${frac(v, 16)}`)
          .join(' · ')}
      </p>
      {!rhPlus(mr) && rhPlusCount > 0 && (
        <Note tone="rose">
          Майката е Rh⁻, а детето може да е Rh⁺ (вероятност {frac(rhPlusCount, 16)}). При раждането кръв на детето може да попадне при
          майката и тя да започне да прави антитела срещу Rh⁺ – опасни за следващо Rh⁺ дете. Затова на майката се дават анти-D антитела.
        </Note>
      )}
    </>
  );
}

function Paternity() {
  const [pi, setPi] = useState(0);
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const pz = PUZZLES[pi];
  const verdict = pz.men.map(man => canBeFather(pz.mother, pz.child, man));
  const right = verdict.every((v, i) => (v === null) === chosen.has(i));

  return (
    <>
      <Buttons>
        {PUZZLES.map((_, i) => (
          <DiagramButton
            key={i}
            active={pi === i}
            onClick={() => {
              setPi(i);
              setChosen(new Set());
              setChecked(false);
            }}
          >
            Случай {i + 1}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm sm:text-base mt-3">
        Майка: <b>{phenText(pz.mother)}</b> · Дете: <b>{phenText(pz.child)}</b>
      </p>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">Кои от мъжете може да са бащата? Избери всички възможни.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 max-w-xl mx-auto">
        {pz.men.map((man, i) => {
          const on = chosen.has(i);
          const ok = verdict[i] === null;
          return (
            <button
              key={i}
              onClick={() => {
                setChecked(false);
                setChosen(prev => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                });
              }}
              aria-pressed={on}
              className={`rounded-lg border-2 p-2 text-sm ${on ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15' : 'border-gray-200 dark:border-gray-700'} ${
                checked ? (ok === on ? 'ring-2 ring-emerald-400' : 'ring-2 ring-amber-400') : ''
              }`}
            >
              <div className="font-semibold">Мъж {i + 1}</div>
              <div>{phenText(man)}</div>
              {checked && <div className={`text-xs mt-1 ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>{ok ? 'може' : verdict[i]}</div>}
            </button>
          );
        })}
      </div>
      <Buttons>
        <DiagramButton onClick={() => setChecked(true)}>Провери</DiagramButton>
      </Buttons>
      {checked && (
        <Note tone={right ? 'emerald' : 'amber'}>
          {right
            ? 'Точно така! Кръвните групи могат само да изключат някого – никога не доказват, че той е бащата.'
            : 'Не съвсем – виж обясненията под всеки мъж (жълто – грешен избор).'}
        </Note>
      )}
    </>
  );
}

/** Кръвни групи AB0 и резус-фактор: кръстоска на родителите и загадки за бащинство. */
export default function BloodTypeLab() {
  const [mode, setMode] = useState<'cross' | 'father'>('cross');
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 text-gray-800 dark:text-gray-100">
      <Buttons>
        <DiagramButton onClick={() => setMode('cross')} active={mode === 'cross'}>
          Родители → деца
        </DiagramButton>
        <DiagramButton onClick={() => setMode('father')} active={mode === 'father'}>
          Кой може да е баща?
        </DiagramButton>
      </Buttons>
      <div className="mt-3">{mode === 'cross' ? <Cross /> : <Paternity />}</div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 <i>I</i>
        <sup>A</sup> и <i>I</i>
        <sup>B</sup> са кодоминантни, <i>i</i> е рецесивен. Резус-факторът се определя от отделен ген: <i>D</i> (Rh⁺) е доминантен над{' '}
        <i>d</i> (Rh⁻). Двата гена се унаследяват независимо, затова вероятностите се умножават.
      </p>
    </div>
  );
}
