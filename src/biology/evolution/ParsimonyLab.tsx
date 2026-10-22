import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import { type Tree, allNodes, fitch, layout } from './tree';

/** Условни последователности (12 позиции) – външната група е макакът. */
const SEQS: Record<string, string> = {
  макак: 'АЦГТАЦГАТГЦТ',
  орангутан: 'АЦГТАЦААТГЦТ',
  горила: 'АЦГЦГЦГГЦГЦТ',
  шимпанзе: 'ГТАЦГЦГАЦГЦЦ',
  човек: 'ГТАЦГТГГТГЦЦ',
};
const OUT = 'макак';
const INGROUP = ['човек', 'шимпанзе', 'горила', 'орангутан'];
const LEN = 12;

/** Всички 15 вкоренени дървета на 4 листа: вмъкваме всяко ново листо във всеки клон. */
function insert(t: Tree, x: string): Tree[] {
  if (typeof t === 'string') return [[x, t]];
  return [[x, t], ...insert(t[0], x).map((s): Tree => [s, t[1]]), ...insert(t[1], x).map((s): Tree => [t[0], s])];
}
function allTrees(names: string[]): Tree[] {
  if (names.length === 1) return [names[0]];
  return allTrees(names.slice(1)).flatMap(t => insert(t, names[0]));
}
const TREES: Tree[] = allTrees(INGROUP).map((t): Tree => [OUT, t]);

const stepsOf = (t: Tree) => Array.from({ length: LEN }, (_, i) => fitch(t, leaf => SEQS[leaf][i]).steps);
const LENGTHS = TREES.map(t => stepsOf(t).reduce((a, b) => a + b, 0));
const BEST = Math.min(...LENGTHS);
/** Най-малкият възможен брой промени: (брой различни бази − 1) за всяка позиция. */
const MIN_STEPS = Array.from({ length: LEN }, (_, i) => new Set(Object.values(SEQS).map(s => s[i])).size - 1).reduce((a, b) => a + b, 0);

const BASE_COLOR: Record<string, string> = {
  А: 'fill-emerald-600 dark:fill-emerald-400',
  Т: 'fill-rose-600 dark:fill-rose-400',
  Г: 'fill-amber-600 dark:fill-amber-400',
  Ц: 'fill-sky-600 dark:fill-sky-400',
};

const SEQ_X = 250;
const CELL = 26;
const ROW = 30;
const TOP = 34;

/** Максимална парсимония: преброяваме промените по всяко от 15-те дървета и търсим най-краткото. */
export default function ParsimonyLab() {
  const [i, setI] = useState(14);
  const [col, setCol] = useState<number | null>(null);

  const tree = TREES[i];
  const steps = stepsOf(tree);
  const total = steps.reduce((a, b) => a + b, 0);
  const root = layout(tree, { leafX: 150, step: 30, top: TOP, gap: ROW });
  const nodes = allNodes(root);
  const order = nodes.filter(n => !n.children.length).map(n => n.tree as string);
  const yOf = (name: string) => nodes.find(n => n.tree === name)!.y;
  const informative = (c: number) => {
    const counts = new Map<string, number>();
    Object.values(SEQS).forEach(s => counts.set(s[c], (counts.get(s[c]) ?? 0) + 1));
    return [...counts.values()].filter(v => v >= 2).length >= 2;
  };

  // Стълбчетата: дължината на всяко от 15-те дървета
  const BAR_TOP = TOP + ROW * 5 + 50;
  const BAR_W = 28;
  const BAR_X = 120;
  const barH = (L: number) => (L - 10) * 8;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 580 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Дървото */}
        {nodes
          .filter(n => n.children.length)
          .map(n => (
            <g key={n.path} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth={2.5} fill="none">
              <line x1={n.x} x2={n.x} y1={n.children[0].y} y2={n.children[1].y} />
              {n.children.map(c => (
                <line key={c.path} x1={n.x} x2={c.x} y1={c.y} y2={c.y} />
              ))}
            </g>
          ))}
        {order.map(name => (
          <text key={name} x={158} y={yOf(name) + 5} fontSize="13" fontWeight={name === OUT ? 400 : 600} className={name === OUT ? 'fill-gray-500 dark:fill-gray-400' : 'fill-current'}>
            {name}
          </text>
        ))}
        {/* Последователностите – в реда на листата */}
        {Array.from({ length: LEN }, (_, c) => (
          <g key={c} onClick={() => setCol(col === c ? null : c)} style={{ cursor: 'pointer' }}>
            <rect
              x={SEQ_X + c * CELL - 2}
              y={TOP - 30}
              width={CELL - 2}
              height={ROW * 5 + 46}
              rx={4}
              className={col === c ? 'fill-amber-100 dark:fill-amber-500/20' : informative(c) ? 'fill-gray-50 dark:fill-gray-700/40' : 'fill-transparent'}
            />
            <text x={SEQ_X + c * CELL + 11} y={TOP - 14} fontSize="10" textAnchor="middle" className="fill-gray-400">
              {c + 1}
            </text>
            {order.map(name => (
              <text key={name} x={SEQ_X + c * CELL + 11} y={yOf(name) + 5} fontSize="15" fontWeight="700" textAnchor="middle" className={BASE_COLOR[SEQS[name][c]]}>
                {SEQS[name][c]}
              </text>
            ))}
            <text x={SEQ_X + c * CELL + 11} y={TOP + ROW * 4 + 30} fontSize="13" fontWeight="700" textAnchor="middle" className={steps[c] === 2 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-current'}>
              {steps[c]}
            </text>
          </g>
        ))}
        <text x={SEQ_X - 8} y={TOP + ROW * 4 + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          промени:
        </text>

        {/* Дължините на всички дървета */}
        <text x={14} y={BAR_TOP - 12} fontSize="11.5" fontWeight="700" fill="currentColor">
          Дължина на 15-те дървета (натисни стълбче):
        </text>
        <line x1={BAR_X - 6} x2={BAR_X + 15 * BAR_W} y1={BAR_TOP + 80} y2={BAR_TOP + 80} className="stroke-gray-300 dark:stroke-gray-600" />
        {LENGTHS.map((L, j) => (
          <g key={j} onClick={() => setI(j)} style={{ cursor: 'pointer' }}>
            <rect
              x={BAR_X + j * BAR_W}
              y={BAR_TOP + 80 - barH(L)}
              width={BAR_W - 6}
              height={barH(L)}
              rx={3}
              className={j === i ? 'fill-rose-500' : L === BEST ? 'fill-emerald-400' : 'fill-gray-300 dark:fill-gray-600'}
            />
            <text x={BAR_X + j * BAR_W + (BAR_W - 6) / 2} y={BAR_TOP + 80 - barH(L) - 4} fontSize="10" textAnchor="middle" fill="currentColor">
              {L}
            </text>
          </g>
        ))}
        <text x={BAR_X - 10} y={BAR_TOP + 84} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          10
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={() => setI((i + 14) % 15)}>‹ Предишно</DiagramButton>
        <DiagramButton onClick={() => setI((i + 1) % 15)}>Следващо ›</DiagramButton>
        <DiagramButton active={LENGTHS[i] === BEST} onClick={() => setI(LENGTHS.indexOf(BEST))}>
          Най-краткото
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'дърво', value: `${i + 1} от 15`, tone: 'rose' },
            { label: 'дължина', value: `${total} промени`, tone: 'amber' },
          ]}
        />
      </div>
      <Formula>
        индекс на съгласуваност CI = {MIN_STEPS} / {total} = {(MIN_STEPS / total).toFixed(2).replace('.', ',')}
      </Formula>
      {col !== null && (
        <Note tone="amber">
          Позиция {col + 1}:{' '}
          {informative(col)
            ? `информативна – поне две бази се срещат поне по два пъти. На това дърво иска ${steps[col]} ${steps[col] === 1 ? 'промяна' : 'промени'}.`
            : 'неинформативна – на всяко дърво иска еднакъв брой промени и не помага да изберем.'}
        </Note>
      )}
      <Note tone={total === BEST ? 'emerald' : 'gray'}>
        {total === BEST
          ? 'Това е най-краткото дърво: човекът и шимпанзето са сестрински видове, следва горилата, после орангутанът.'
          : `Има по-кратко дърво – с ${BEST} промени.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Последователностите са условни, но наподобяват истинските: повечето позиции подкрепят двойката човек + шимпанзе, а позиции 8 и 9
        „гласуват“ за други двойки – такива промени са станали повече от веднъж (хомоплазия). Сивите колони са информативните позиции.
        Числото под всяка колона е най-малкият брой замени на базата по това дърво (алгоритъм на Фич).
      </p>
    </div>
  );
}
