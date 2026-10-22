import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { type LaidNode, type Tree, allNodes, fitch, layout, leaves } from './tree';

const BASE: Tree = ['минога', ['акула', ['шаран', ['жаба', [['мишка', 'човек'], ['гущер', ['крокодил', 'гълъб']]]]]]];

/** Имената на кладите – ключът е списъкът на листата им по азбучен ред. */
const key = (t: Tree) => leaves(t).sort().join('|');
const CLADES: Record<string, string> = {
  [key(BASE)]: 'гръбначни',
  [key(BASE[1])]: 'челюстноусти',
  [key(['шаран', ['жаба', [['мишка', 'човек'], ['гущер', ['крокодил', 'гълъб']]]]])]: 'костни риби и четирикраки',
  [key(['жаба', [['мишка', 'човек'], ['гущер', ['крокодил', 'гълъб']]]])]: 'четирикраки',
  [key([['мишка', 'човек'], ['гущер', ['крокодил', 'гълъб']]])]: 'амниоти',
  [key(['мишка', 'човек'])]: 'бозайници',
  [key(['гущер', ['крокодил', 'гълъб']])]: 'влечуги и птици',
  [key(['крокодил', 'гълъб'])]: 'архозаври',
};

const PRESETS: [string, string[], string][] = [
  ['„Риби“', ['минога', 'акула', 'шаран'], 'Рибите не са клада: общият им прародител е общ и за всички четирикраки.'],
  ['„Влечуги“', ['гущер', 'крокодил'], 'Крокодилът е по-близък роднина на птиците, отколкото на гущера. Влечугите без птиците са парафилетична група.'],
  ['„Топлокръвни“', ['мишка', 'човек', 'гълъб'], 'Птиците и бозайниците са станали топлокръвни поотделно – това е сходство, а не родство.'],
  ['бозайници', ['мишка', 'човек'], 'Бозайниците са истинска клада: прародителят и всичките му потомци.'],
  ['архозаври', ['крокодил', 'гълъб'], 'Крокодилите и птиците са сестрински групи – най-близките си живи роднини.'],
];

const LEAF_X = 400;
const STEP = 46;
const TOP = 26;
const GAP = 32;

/** Прилага завъртанията: възлите в swapped разменят децата си. */
function rotate(t: Tree, swapped: Set<string>): Tree {
  if (typeof t === 'string') return t;
  const a = rotate(t[0], swapped);
  const b = rotate(t[1], swapped);
  return swapped.has(key(t)) ? [b, a] : [a, b];
}

/** Най-малката клада, която съдържа всички избрани листа. */
function mrca(n: LaidNode, sel: Set<string>): LaidNode | null {
  const own = leaves(n.tree);
  if (![...sel].every(s => own.includes(s))) return null;
  for (const c of n.children) {
    const deeper = mrca(c, sel);
    if (deeper) return deeper;
  }
  return n;
}

type Kind = 'mono' | 'para' | 'poly' | 'unclear';

/**
 * Монофилетична – точно потомците на прародителя. Иначе по Фич възстановяваме „членството“
 * в групата: ако прародителят е бил в групата – парафилетична (махнати са някои потомци),
 * ако не е – полифилетична (членовете са събрани от различни клонове).
 */
function classify(anc: LaidNode, sel: Set<string>): Kind {
  const own = leaves(anc.tree);
  if (own.length === sel.size) return 'mono';
  const { set } = fitch(anc.tree, l => (sel.has(l) ? '1' : '0'));
  if (set.size === 2) return 'unclear';
  return set.has('1') ? 'para' : 'poly';
}

const KIND_TEXT: Record<Kind, string> = {
  mono: 'монофилетична (клада)',
  para: 'парафилетична',
  poly: 'полифилетична',
  unclear: 'не е клада',
};

/** Четене на филогенетично дърво: завъртане на възлите, общ прародител, клади. */
export default function TreeReadingLab() {
  const [swapped, setSwapped] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<Set<string>>(new Set(['мишка', 'човек']));
  const [note, setNote] = useState(PRESETS[3][2]);
  const [rotations, setRotations] = useState(0);

  const root = layout(rotate(BASE, swapped), { leafX: LEAF_X, step: STEP, top: TOP, gap: GAP });
  const nodes = allNodes(root);
  const anc = sel.size >= 2 ? mrca(root, sel) : null;
  const kind = anc ? classify(anc, sel) : null;
  const ancLeaves = anc ? new Set(leaves(anc.tree)) : new Set<string>();

  const toggleLeaf = (name: string) => {
    setSel(s => {
      const next = new Set(s);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setNote('');
  };
  const rotateNode = (n: LaidNode) => {
    const k = key(n.tree);
    setSwapped(s => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    setRotations(r => r + 1);
  };

  const height = TOP + GAP * 8 + 26;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 560 ${height}`} className="w-full h-auto max-w-2xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Кладата на общия прародител */}
        {anc && (
          <rect
            x={anc.x - 10}
            y={Math.min(...allNodes(anc).map(n => n.y)) - 14}
            width={LEAF_X + 112 - anc.x}
            height={Math.max(...allNodes(anc).map(n => n.y)) - Math.min(...allNodes(anc).map(n => n.y)) + 28}
            rx={8}
            className="fill-amber-50 stroke-amber-300 dark:fill-amber-500/10 dark:stroke-amber-500/40"
          />
        )}
        {/* Клоните */}
        {nodes
          .filter(n => n.children.length)
          .map(n => (
            <g key={'b' + n.path} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth={2.5} fill="none">
              <line x1={n.x} x2={n.x} y1={n.children[0].y} y2={n.children[1].y} />
              {n.children.map(c => (
                <line key={c.path} x1={n.x} x2={c.x} y1={c.y} y2={c.y} />
              ))}
            </g>
          ))}
        <line x1={root.x - 22} x2={root.x} y1={root.y} y2={root.y} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth={2.5} />
        {/* Листата */}
        {nodes
          .filter(n => !n.children.length)
          .map(n => {
            const name = n.tree as string;
            const on = sel.has(name);
            const inClade = ancLeaves.has(name);
            return (
              <g key={name} onClick={() => toggleLeaf(name)} style={{ cursor: 'pointer' }}>
                <rect x={n.x + 4} y={n.y - 12} width={100} height={24} rx={6} className={on ? 'fill-rose-100 dark:fill-rose-500/25' : 'fill-transparent'} />
                <circle cx={n.x} cy={n.y} r={4} className={on ? 'fill-rose-600' : 'fill-gray-400'} />
                <text
                  x={n.x + 12}
                  y={n.y + 5}
                  fontSize="14"
                  fontWeight={on ? 700 : 400}
                  className={on ? 'fill-rose-700 dark:fill-rose-300' : inClade ? 'fill-amber-700 dark:fill-amber-300' : 'fill-current'}
                >
                  {name}
                </text>
              </g>
            );
          })}
        {/* Вътрешните възли – натисни, за да завъртиш */}
        {nodes
          .filter(n => n.children.length)
          .map(n => {
            const isAnc = anc?.path === n.path;
            return (
              <g key={'n' + n.path} onClick={() => rotateNode(n)} style={{ cursor: 'pointer' }}>
                <circle cx={n.x} cy={n.y} r={14} fill="transparent" />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isAnc ? 8 : 6}
                  className={isAnc ? 'fill-amber-500 stroke-white dark:stroke-gray-800' : 'fill-white stroke-gray-500 dark:fill-gray-800 dark:stroke-gray-300'}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        <text x={14} y={height - 8} fontSize="11.5" className="fill-gray-500 dark:fill-gray-400">
          Натисни възел, за да го завъртиш · натисни име, за да го избереш
        </text>
      </LabSvg>

      <Buttons>
        {PRESETS.map(([label, names, text]) => (
          <DiagramButton
            key={label}
            active={sel.size === names.length && names.every(x => sel.has(x))}
            onClick={() => {
              setSel(new Set(names));
              setNote(text);
            }}
          >
            {label}
          </DiagramButton>
        ))}
        <DiagramButton
          onClick={() => {
            setSel(new Set());
            setNote('');
          }}
        >
          Изчисти
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setSwapped(new Set());
            setRotations(0);
          }}
        >
          Върни дървото
        </DiagramButton>
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'избрани', value: sel.size, tone: 'rose' },
            { label: 'общ прародител', value: anc ? (CLADES[key(anc.tree)] ?? '—') : 'избери поне 2', tone: 'amber' },
            { label: 'групата е', value: kind ? KIND_TEXT[kind] : '—', tone: 'violet' },
          ]}
        />
      </div>
      {note && <Note tone="rose">{note}</Note>}
      {rotations > 0 && (
        <Note tone="blue">
          Завъртания: {rotations}. Редът на листата се смени, но всички родства (кой с кого има по-близък общ прародител) са същите – дървото е
          същото.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Жълтата рамка е кладата на най-близкия общ прародител на избраните. Ако в нея няма други листа, групата е монофилетична. Ако
        прародителят е бил „от групата“, но някои потомци са махнати – парафилетична; ако групата е събрана от различни клонове по
        сходство – полифилетична (тук решаваме кое е по-вероятно с най-малко промени, по алгоритъма от раздел 6).
      </p>
    </div>
  );
}
