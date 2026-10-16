import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Atom = { s: string; x: number; y: number };
type Molecule = { name: string; tex: string; atoms: Atom[]; bonds: [number, number][] };

/** Валентни електрони на елементите, които участват в лабораторията. */
const VALENCE: Record<string, number> = { H: 1, C: 4, N: 5, O: 6, F: 7, Cl: 7 };

const MOLECULES: Molecule[] = [
  { name: 'H₂', tex: 'H2', atoms: [{ s: 'H', x: 190, y: 115 }, { s: 'H', x: 290, y: 115 }], bonds: [[0, 1]] },
  { name: 'Cl₂', tex: 'Cl2', atoms: [{ s: 'Cl', x: 185, y: 115 }, { s: 'Cl', x: 295, y: 115 }], bonds: [[0, 1]] },
  { name: 'HCl', tex: 'HCl', atoms: [{ s: 'H', x: 185, y: 115 }, { s: 'Cl', x: 295, y: 115 }], bonds: [[0, 1]] },
  { name: 'O₂', tex: 'O2', atoms: [{ s: 'O', x: 185, y: 115 }, { s: 'O', x: 295, y: 115 }], bonds: [[0, 1]] },
  { name: 'N₂', tex: 'N2', atoms: [{ s: 'N', x: 185, y: 115 }, { s: 'N', x: 295, y: 115 }], bonds: [[0, 1]] },
  {
    name: 'H₂O',
    tex: 'H2O',
    atoms: [{ s: 'O', x: 240, y: 90 }, { s: 'H', x: 165, y: 160 }, { s: 'H', x: 315, y: 160 }],
    bonds: [[0, 1], [0, 2]],
  },
  {
    name: 'NH₃',
    tex: 'NH3',
    atoms: [{ s: 'N', x: 240, y: 85 }, { s: 'H', x: 155, y: 145 }, { s: 'H', x: 240, y: 185 }, { s: 'H', x: 325, y: 145 }],
    bonds: [[0, 1], [0, 2], [0, 3]],
  },
  {
    name: 'CH₄',
    tex: 'CH4',
    atoms: [{ s: 'C', x: 240, y: 115 }, { s: 'H', x: 240, y: 40 }, { s: 'H', x: 155, y: 115 }, { s: 'H', x: 325, y: 115 }, { s: 'H', x: 240, y: 190 }],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  {
    name: 'CO₂',
    tex: 'CO2',
    atoms: [{ s: 'O', x: 135, y: 115 }, { s: 'C', x: 240, y: 115 }, { s: 'O', x: 345, y: 115 }],
    bonds: [[0, 1], [1, 2]],
  },
  {
    name: 'HCN',
    tex: 'HCN',
    atoms: [{ s: 'H', x: 135, y: 115 }, { s: 'C', x: 240, y: 115 }, { s: 'N', x: 345, y: 115 }],
    bonds: [[0, 1], [1, 2]],
  },
  {
    name: 'C₂H₄',
    tex: 'C2H4',
    atoms: [
      { s: 'C', x: 195, y: 115 },
      { s: 'C', x: 285, y: 115 },
      { s: 'H', x: 130, y: 60 },
      { s: 'H', x: 130, y: 170 },
      { s: 'H', x: 350, y: 60 },
      { s: 'H', x: 350, y: 170 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]],
  },
];

/** Колко електрона са нужни около атома: 2 за водорода (дубле), 8 за останалите (октет). */
const need = (s: string) => (s === 'H' ? 2 : 8);

/**
 * Несвързаните двойки се разпределят както при ръчното рисуване на формула на Люис:
 * първо до октет на крайните атоми, после на централните. Връща двойките за всеки атом
 * и колко двойки са останали без място.
 */
function lonePairs(m: Molecule, orders: number[]) {
  const total = m.atoms.reduce((n, a) => n + VALENCE[a.s], 0);
  const bonding = orders.reduce((n, o) => n + 2 * o, 0);
  const shared = m.atoms.map((_, i) => m.bonds.reduce((n, [a, b], k) => n + (a === i || b === i ? 2 * orders[k] : 0), 0));
  let pairs = Math.max(0, Math.floor((total - bonding) / 2));
  const lone = m.atoms.map(() => 0);
  const degree = m.atoms.map((_, i) => m.bonds.filter(([a, b]) => a === i || b === i).length);
  const order = m.atoms.map((_, i) => i).sort((i, j) => degree[i] - degree[j]);
  for (const i of order) {
    if (m.atoms[i].s === 'H') continue;
    const room = Math.max(0, (need(m.atoms[i].s) - shared[i]) / 2);
    const give = Math.min(room, pairs);
    lone[i] += give;
    pairs -= give;
  }
  return { total, bonding, shared, lone, extra: pairs };
}

/** Ъгъл между две посоки, 0…π. */
const gap = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/**
 * Посоки за несвързаните двойки: от 16 възможни избираме тези, които са възможно най-далеч
 * от връзките и една от друга (при равенство – първите, т.е. хоризонтал и вертикал).
 */
function pairDirections(m: Molecule, i: number, count: number) {
  if (count === 0) return [];
  const a = m.atoms[i];
  const bonds = m.bonds
    .filter(([p, q]) => p === i || q === i)
    .map(([p, q]) => {
      const o = m.atoms[p === i ? q : p];
      return Math.atan2(o.y - a.y, o.x - a.x);
    });
  const steps = [0, 4, 8, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15];
  const cand = steps.map(k => (k * Math.PI) / 8 - (k > 8 ? 2 * Math.PI : 0));
  let best: number[] = [];
  let bestScore = -1;
  const score = (set: number[]) => {
    let min = Math.PI;
    set.forEach((t, j) => {
      bonds.forEach(b => (min = Math.min(min, gap(t, b))));
      set.slice(j + 1).forEach(u => (min = Math.min(min, gap(t, u))));
    });
    return min;
  };
  const search = (start: number, set: number[]) => {
    if (set.length === count) {
      const sc = score(set);
      if (sc > bestScore + 1e-9) [best, bestScore] = [set, sc];
      return;
    }
    for (let k = start; k < cand.length; k++) search(k + 1, [...set, cand[k]]);
  };
  search(0, []);
  return best;
}

/** Начертай формула на Люис: щракни върху връзка, за да я направиш двойна или тройна. */
export default function LewisLab() {
  const [index, setIndex] = useState(5);
  const m = MOLECULES[index];
  const [orders, setOrders] = useState<number[]>(() => m.bonds.map(() => 1));

  const choose = (i: number) => {
    setIndex(i);
    setOrders(MOLECULES[i].bonds.map(() => 1));
  };
  const cycle = (k: number) => setOrders(orders.map((o, j) => (j === k ? (o % 3) + 1 : o)));

  const { total, bonding, shared, lone, extra } = lonePairs(m, orders);
  const tooMany = bonding > total;
  const around = m.atoms.map((_, i) => shared[i] + 2 * lone[i]);
  const ok = m.atoms.map((a, i) => around[i] === need(a.s));
  const done = !tooMany && extra === 0 && ok.every(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MOLECULES.map((mol, i) => (
          <DiagramButton key={mol.tex} active={i === index} onClick={() => choose(i)}>
            {mol.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 230" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {m.bonds.map(([p, q], k) => {
          const a = m.atoms[p];
          const b = m.atoms[q];
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
          const [nx, ny] = [-uy, ux];
          // Линиите започват и свършват извън кръгчетата на атомите
          const [x1, y1, x2, y2] = [a.x + ux * 20, a.y + uy * 20, b.x - ux * 20, b.y - uy * 20];
          const offsets = orders[k] === 1 ? [0] : orders[k] === 2 ? [-4, 4] : [-7, 0, 7];
          return (
            <g key={k} onClick={() => cycle(k)} style={{ cursor: 'pointer' }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="24" />
              {offsets.map(d => (
                <line key={d} x1={x1 + nx * d} y1={y1 + ny * d} x2={x2 + nx * d} y2={y2 + ny * d} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" strokeLinecap="round" />
              ))}
            </g>
          );
        })}
        {m.atoms.map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r={17} className={ok[i] ? 'fill-emerald-50 stroke-emerald-500 dark:fill-emerald-900/40' : 'fill-rose-50 stroke-rose-400 dark:fill-rose-900/40'} strokeWidth="2" />
            <text x={a.x} y={a.y + 6} fontSize="17" fontWeight="700" textAnchor="middle" fill="currentColor">
              {a.s}
            </text>
            {pairDirections(m, i, lone[i]).map(t => {
              const [cx, cy] = [a.x + 27 * Math.cos(t), a.y + 27 * Math.sin(t)];
              const [px, py] = [-Math.sin(t) * 4.5, Math.cos(t) * 4.5];
              return (
                <g key={t} className="fill-sky-600 dark:fill-sky-400">
                  <circle cx={cx + px} cy={cy + py} r={2.8} />
                  <circle cx={cx - px} cy={cy - py} r={2.8} />
                </g>
              );
            })}
          </g>
        ))}
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'валентни e⁻:', value: total, tone: 'blue' },
            { label: 'във връзки:', value: bonding, tone: tooMany ? 'rose' : 'violet' },
            { label: 'несподелени:', value: tooMany ? '—' : total - bonding, tone: 'amber' },
          ]}
        />
        <div className="mt-2">
          <Readout
            items={m.atoms
              .map((a, i) => ({ a, i }))
              .filter(({ a, i }) => m.atoms.findIndex((b, j) => b.s === a.s && around[j] === around[i]) === i)
              .map(({ a, i }) => ({ label: `${a.s}:`, value: `${around[i]} e⁻ ${ok[i] ? '✓' : '✗'}`, tone: ok[i] ? ('emerald' as const) : ('rose' as const) }))}
          />
        </div>
      </div>
      {tooMany ? (
        <Note tone="rose">Връзките използват повече електрони, отколкото имат атомите. Намали кратността на някоя връзка.</Note>
      ) : done ? (
        <Note tone="emerald">✓ Всеки атом има октет (водородът – два електрона). Това е формулата на Люис за {m.name}.</Note>
      ) : extra > 0 ? (
        <Note tone="rose">Останаха несподелени електрони, за които няма място в октетите – провери кратността на връзките.</Note>
      ) : (
        <Note tone="rose">Атомите с червена рамка нямат октет. Опитай с двойна или тройна връзка.</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Щракни върху връзка, за да я смениш: единична → двойна → тройна → единична. Лабораторията сама подрежда останалите електрони като
        несподелени електронни двойки (сините точки) – първо по крайните атоми, после по централния. Под чертежа е броят на електроните около всеки
        атом: електроните на връзката се броят и за двата атома.
      </p>
    </div>
  );
}
