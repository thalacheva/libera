import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Note } from '~/geometry/diagram';

type Cavity = 'none' | 'pseudo' | 'coelom';
type Phylum = {
  name: string;
  latin: string;
  examples: string;
  layers: 0 | 2 | 3;
  symmetry: 'none' | 'radial' | 'bilateral';
  cavity: Cavity | null;
  mouth: 'proto' | 'deutero' | null;
  segments: boolean;
  jointed: boolean;
  chord: boolean;
};

const PHYLA: Phylum[] = [
  { name: 'Морски гъби', latin: 'Porifera', examples: 'тоалетна гъба', layers: 0, symmetry: 'none', cavity: null, mouth: null, segments: false, jointed: false, chord: false },
  { name: 'Мешести', latin: 'Cnidaria', examples: 'хидра, медуза, корали', layers: 2, symmetry: 'radial', cavity: 'none', mouth: null, segments: false, jointed: false, chord: false },
  { name: 'Плоски червеи', latin: 'Platyhelminthes', examples: 'планария, тения', layers: 3, symmetry: 'bilateral', cavity: 'none', mouth: 'proto', segments: false, jointed: false, chord: false },
  { name: 'Кръгли червеи', latin: 'Nematoda', examples: 'човешка аскарида', layers: 3, symmetry: 'bilateral', cavity: 'pseudo', mouth: 'proto', segments: false, jointed: false, chord: false },
  { name: 'Прешленести червеи', latin: 'Annelida', examples: 'дъждовен червей, пиявица', layers: 3, symmetry: 'bilateral', cavity: 'coelom', mouth: 'proto', segments: true, jointed: false, chord: false },
  { name: 'Мекотели', latin: 'Mollusca', examples: 'охлюв, мида, октопод', layers: 3, symmetry: 'bilateral', cavity: 'coelom', mouth: 'proto', segments: false, jointed: false, chord: false },
  { name: 'Членестоноги', latin: 'Arthropoda', examples: 'насекоми, паяци, раци, стоножки', layers: 3, symmetry: 'bilateral', cavity: 'coelom', mouth: 'proto', segments: true, jointed: true, chord: false },
  { name: 'Бодлокожи', latin: 'Echinodermata', examples: 'морска звезда, морски таралеж', layers: 3, symmetry: 'radial', cavity: 'coelom', mouth: 'deutero', segments: false, jointed: false, chord: false },
  { name: 'Хордови', latin: 'Chordata', examples: 'ланцетник, риби, човек', layers: 3, symmetry: 'bilateral', cavity: 'coelom', mouth: 'deutero', segments: true, jointed: false, chord: true },
];

type Key = 'layers' | 'symmetry' | 'cavity' | 'mouth' | 'segments' | 'jointed' | 'chord';
const FILTERS: { key: Key; label: string; options: [Phylum[Key], string][] }[] = [
  { key: 'layers', label: 'Зародишни листове', options: [[0, 'няма тъкани'], [2, 'два'], [3, 'три']] },
  { key: 'symmetry', label: 'Симетрия на възрастното', options: [['none', 'няма'], ['radial', 'радиална'], ['bilateral', 'двустранна']] },
  { key: 'cavity', label: 'Телесна кухина', options: [['none', 'няма'], ['pseudo', 'първична'], ['coelom', 'целом']] },
  { key: 'mouth', label: 'Първичната уста става', options: [['proto', 'уста'], ['deutero', 'анус']] },
  { key: 'segments', label: 'Сегментирано тяло', options: [[true, 'да'], [false, 'не']] },
  { key: 'jointed', label: 'Членести крайници', options: [[true, 'да'], [false, 'не']] },
  { key: 'chord', label: 'Хорда', options: [[true, 'да'], [false, 'не']] },
];

type Choice = Partial<Record<Key, Phylum[Key]>>;

const LAYER = {
  ecto: 'fill-sky-300 dark:fill-sky-600',
  meso: 'fill-rose-300 dark:fill-rose-600',
  endo: 'fill-amber-300 dark:fill-amber-600',
  space: 'fill-white dark:fill-gray-800',
};

/** Напречен разрез на тялото при трите типа телесна кухина. */
function Section({ cx, kind, active }: { cx: number; kind: Cavity; active: boolean }) {
  const cy = 78;
  const title = kind === 'none' ? 'без кухина' : kind === 'pseudo' ? 'първична кухина' : 'целом';
  const sub = kind === 'none' ? 'плоски червеи' : kind === 'pseudo' ? 'кръгли червеи' : 'прешленести, хордови…';
  return (
    <g opacity={active ? 1 : 0.45}>
      <circle cx={cx} cy={cy} r={60} className={LAYER.ecto} />
      {kind === 'none' && <circle cx={cx} cy={cy} r={52} className={LAYER.meso} />}
      {kind === 'pseudo' && (
        <>
          <circle cx={cx} cy={cy} r={52} className={LAYER.meso} />
          <circle cx={cx} cy={cy} r={45} className={LAYER.space} />
        </>
      )}
      {kind === 'coelom' && (
        <>
          <circle cx={cx} cy={cy} r={52} className={LAYER.meso} />
          <circle cx={cx} cy={cy} r={45} className={LAYER.space} />
          <circle cx={cx} cy={cy} r={27} className={LAYER.meso} />
        </>
      )}
      <circle cx={cx} cy={cy} r={20} className={LAYER.endo} />
      <circle cx={cx} cy={cy} r={12} className="fill-gray-100 dark:fill-gray-900" />
      {kind !== 'none' && (
        <text x={cx} y={cy - 33} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          кухина
        </text>
      )}
      <text x={cx} y={cy + 4} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
        черво
      </text>
      <text x={cx} y={cy + 80} fontSize="12" fontWeight={active ? 700 : 600} textAnchor="middle" fill="currentColor">
        {title}
      </text>
      <text x={cx} y={cy + 95} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
        {sub}
      </text>
    </g>
  );
}

/** Определи типа животно по строежа на тялото. */
export default function AnimalPhylaLab() {
  const [choice, setChoice] = useState<Choice>({});
  const matches = (p: Phylum) => FILTERS.every(f => !(f.key in choice) || p[f.key] === choice[f.key]);
  const left = PHYLA.filter(matches);
  const set = (key: Key, v: Phylum[Key]) =>
    setChoice(c => {
      const next = { ...c };
      if (key in c && c[key] === v) delete next[key];
      else next[key] = v;
      return next;
    });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 180" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {(['none', 'pseudo', 'coelom'] as Cavity[]).map((k, i) => (
          <Section key={k} cx={80 + i * 160} kind={k} active={!('cavity' in choice) || choice.cavity === k} />
        ))}
      </LabSvg>
      <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
        <span><span className="inline-block w-3 h-3 rounded-sm bg-sky-300 dark:bg-sky-600 align-middle mr-1" />ектодерма</span>
        <span><span className="inline-block w-3 h-3 rounded-sm bg-rose-300 dark:bg-rose-600 align-middle mr-1" />мезодерма</span>
        <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-600 align-middle mr-1" />ендодерма</span>
      </div>

      <div className="space-y-2 mt-4">
        {FILTERS.map(f => (
          <div key={f.key} className="flex flex-wrap items-center gap-1.5">
            <span className="w-full sm:w-48 text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}:</span>
            {f.options.map(([v, label]) => {
              const on = f.key in choice && choice[f.key] === v;
              return (
                <button
                  key={label}
                  onClick={() => set(f.key, v)}
                  aria-pressed={on}
                  className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm ${
                    on ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {PHYLA.map(p => {
          const ok = matches(p);
          return (
            <div
              key={p.latin}
              className={`rounded-lg border p-2 text-xs sm:text-sm ${ok ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30' : 'border-gray-200 opacity-40 dark:border-gray-700'}`}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</div>
              <div className="italic text-gray-500 dark:text-gray-400">{p.latin}</div>
              <div className="text-gray-600 dark:text-gray-300">{p.examples}</div>
            </div>
          );
        })}
      </div>

      {left.length === 1 && <Note tone="emerald">Остана един тип: {left[0].name} ({left[0].latin}).</Note>}
      {left.length === 0 && <Note tone="rose">Няма тип с всички тези белези – махни някой от избраните (втори клик).</Note>}
      {left.length > 1 && Object.keys(choice).length > 0 && <Note tone="violet">Подходящи типове: {left.length} от {PHYLA.length}.</Note>}

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери белези – вторият клик маха избора. Морските гъби нямат истински тъкани, затова при тях въпросите за кухината и устата нямат
        смисъл. Бодлокожите са радиални само като възрастни – ларвите им са двустранно симетрични. При членестоногите целомът е силно
        намален, а главната кухина в тялото е пълна с хемолимфа.
      </p>
    </div>
  );
}
