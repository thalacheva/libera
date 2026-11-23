import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const W = 640;
const H = 300;
const ROOT = { x: 320, y: 44 };
const NODE_X = [112, 320, 528];
const NODE_Y = 136;
const LEAF_Y = 236;
const LEAF_DX = 62;

/** Примерът от урока: три хода на MAX, по три отговора на MIN. */
const CLASSIC = [3, 12, 8, 2, 4, 6, 14, 5, 2];

type Result = {
  /** Стойността на всеки MIN връх (при отсичане – горна граница) */
  node: number[];
  /** Дали върхът е прекъснат преди последното си листо */
  cut: boolean[];
  /** Кои листа са оценени */
  seen: boolean[];
  root: number;
  best: number;
};

/** Минимакс за дърво с дълбочина 2; с `prune` – алфа-бета отсичане отляво надясно. */
function solve(leaves: number[], prune: boolean): Result {
  const node: number[] = [];
  const cut: boolean[] = [];
  const seen = leaves.map(() => false);
  let alpha = -Infinity;
  let best = 0;
  for (let j = 0; j < 3; j++) {
    let v = Infinity;
    let stopped = false;
    for (let k = 0; k < 3; k++) {
      seen[3 * j + k] = true;
      v = Math.min(v, leaves[3 * j + k]);
      // MAX вече има ход със стойност alpha – този връх не може да го надмине
      if (prune && v <= alpha && k < 2) {
        stopped = true;
        break;
      }
    }
    node.push(v);
    cut.push(stopped);
    if (v > alpha) {
      alpha = v;
      best = j;
    }
  }
  return { node, cut, seen, root: alpha, best };
}

const leafX = (i: number) => NODE_X[Math.floor(i / 3)] + ((i % 3) - 1) * LEAF_DX;
const up = (x: number, y: number, r: number) => `${x},${y - r} ${x + r},${y + r * 0.8} ${x - r},${y + r * 0.8}`;
const down = (x: number, y: number, r: number) => `${x},${y + r} ${x + r},${y - r * 0.8} ${x - r},${y - r * 0.8}`;

/** Дърво на играта с 9 листа: стойностите се качват нагоре по минимакс; алфа-бета пропуска излишните листа. */
export default function MinimaxTreeLab() {
  const [leaves, setLeaves] = useState(CLASSIC);
  const [prune, setPrune] = useState(false);
  const [selected, setSelected] = useState(0);

  const r = solve(leaves, prune);
  const seenCount = r.seen.filter(Boolean).length;
  // Листото, до което води най-добрата игра и на двамата
  const bestLeaf = 3 * r.best + [0, 1, 2].find(k => leaves[3 * r.best + k] === r.node[r.best])!;

  const setLeaf = (v: number) => setLeaves(leaves.map((x, i) => (i === selected ? v : x)));
  const randomize = () => setLeaves(leaves.map(() => 1 + Math.floor(Math.random() * 15)));
  /** Най-добрият ход първи, а във всеки връх – най-силният отговор първи: така се отсича най-много. */
  const sortBest = () => {
    const groups = [0, 1, 2].map(j => leaves.slice(3 * j, 3 * j + 3).sort((a, b) => a - b));
    groups.sort((a, b) => b[0] - a[0]);
    setLeaves(groups.flat());
    setSelected(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={8} y={ROOT.y + 5} fontSize="13" className="fill-blue-700 dark:fill-blue-300" fontWeight="bold">
          MAX (ти)
        </text>
        <text x={8} y={NODE_Y - 34} fontSize="13" className="fill-rose-600 dark:fill-rose-400" fontWeight="bold">
          MIN (противникът)
        </text>
        <text x={8} y={H - 8} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
          оценки на крайните позиции – докосни листо, за да го промениш
        </text>

        {/* Клони */}
        {NODE_X.map((x, j) => (
          <line
            key={j}
            x1={ROOT.x}
            y1={ROOT.y + 16}
            x2={x}
            y2={NODE_Y - 18}
            className={j === r.best ? 'stroke-fuchsia-600 dark:stroke-fuchsia-400' : 'stroke-gray-400 dark:stroke-gray-500'}
            strokeWidth={j === r.best ? 3.5 : 1.5}
          />
        ))}
        {leaves.map((_, i) => {
          const j = Math.floor(i / 3);
          const onPath = i === bestLeaf;
          return (
            <line
              key={i}
              x1={NODE_X[j]}
              y1={NODE_Y + 18}
              x2={leafX(i)}
              y2={LEAF_Y - 20}
              className={onPath ? 'stroke-fuchsia-600 dark:stroke-fuchsia-400' : 'stroke-gray-400 dark:stroke-gray-500'}
              strokeWidth={onPath ? 3.5 : 1.5}
              strokeDasharray={r.seen[i] ? undefined : '4 4'}
              opacity={r.seen[i] ? 1 : 0.6}
            />
          );
        })}

        {/* Корен */}
        <polygon points={up(ROOT.x, ROOT.y, 26)} className="fill-blue-100 stroke-blue-600 dark:fill-blue-900/60 dark:stroke-blue-400" strokeWidth="2" />
        <text x={ROOT.x} y={ROOT.y + 12} fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-blue-800 dark:fill-blue-200">
          {r.root}
        </text>

        {/* MIN върхове */}
        {NODE_X.map((x, j) => (
          <g key={j}>
            <polygon points={down(x, NODE_Y, 26)} className="fill-rose-100 stroke-rose-600 dark:fill-rose-900/50 dark:stroke-rose-400" strokeWidth="2" />
            <text x={x} y={NODE_Y - 1} fontSize={r.cut[j] ? 13 : 16} fontWeight="bold" textAnchor="middle" className="fill-rose-800 dark:fill-rose-200">
              {r.cut[j] ? `≤ ${r.node[j]}` : r.node[j]}
            </text>
            {r.cut[j] && (
              <text x={x + 34} y={NODE_Y + 22} fontSize="12" className="fill-amber-700 dark:fill-amber-400">
                ✂ отсечено
              </text>
            )}
          </g>
        ))}

        {/* Листа */}
        {leaves.map((v, i) => {
          const x = leafX(i);
          const on = i === selected;
          return (
            <g key={i} onClick={() => setSelected(i)} className="cursor-pointer" opacity={r.seen[i] ? 1 : 0.45}>
              <rect
                x={x - 24}
                y={LEAF_Y - 20}
                width={48}
                height={40}
                rx={8}
                className={
                  on
                    ? 'fill-fuchsia-100 stroke-fuchsia-600 dark:fill-fuchsia-900/60 dark:stroke-fuchsia-400'
                    : 'fill-gray-100 stroke-gray-400 dark:fill-gray-700 dark:stroke-gray-500'
                }
                strokeWidth={on ? 3 : 1.5}
              />
              <text x={x} y={LEAF_Y + 6} fontSize="17" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
                {r.seen[i] ? v : '?'}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="листо" value={leaves[selected]} onChange={setLeaf} min={0} max={15} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={prune} onClick={() => setPrune(p => !p)}>
          алфа-бета отсичане
        </DiagramButton>
        <DiagramButton onClick={randomize}>случайни стойности</DiagramButton>
        <DiagramButton onClick={sortBest}>подреди най-добрите първи</DiagramButton>
        <DiagramButton
          onClick={() => {
            setLeaves(CLASSIC);
            setSelected(0);
          }}
        >
          примерът от урока
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стойност на позицията', value: r.root, tone: 'blue' },
            { label: 'най-добър ход', value: ['левият', 'средният', 'десният'][r.best], tone: 'violet' },
            { label: 'оценени листа', value: `${seenCount} от 9`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={prune && seenCount < 9 ? 'amber' : 'gray'}>
        {prune
          ? seenCount < 9
            ? `Алфа-бета пропуска ${9 - seenCount} ${9 - seenCount === 1 ? 'листо' : 'листа'}, а стойността и най-добрият ход са същите.`
            : 'При тази подредба няма какво да се отсече – опитай „подреди най-добрите първи“.'
          : 'Минимакс оценява всичките 9 листа. Включи отсичането и виж кои не са нужни.'}
      </Note>
    </div>
  );
}
