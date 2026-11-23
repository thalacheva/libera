// Дървета на решенията за точки с два признака и два класа: ентропия, най-добър въпрос, строене на дърво и гора.

import { mulberry32 } from '../history/rollouts';
import { type Pt } from './classify';

export type Feature = 'x' | 'y';
export type Tree = { leaf: true; ones: number; total: number } | { leaf: false; feature: Feature; t: number; left: Tree; right: Tree; ones: number; total: number };

/** Ентропия в битове на група с дял p на единия клас. */
export const entropy = (p: number) => (p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p));

const ones = (data: Pt[]) => data.reduce((s, p) => s + p.c, 0);
const entropyOf = (data: Pt[]) => (data.length ? entropy(ones(data) / data.length) : 0);

/** Разделя точките с въпроса „признакът ≤ t?“ и връща двете групи и печалбата на информация. */
export function split(data: Pt[], feature: Feature, t: number) {
  const left = data.filter(p => p[feature] <= t);
  const right = data.filter(p => p[feature] > t);
  const after = (left.length * entropyOf(left) + right.length * entropyOf(right)) / data.length;
  return { left, right, before: entropyOf(data), after, gain: entropyOf(data) - after };
}

/** Въпросът с най-голяма печалба на информация; праговете са по средата между съседни стойности. */
export function bestSplit(data: Pt[], features: Feature[] = ['x', 'y']) {
  let best: { feature: Feature; t: number; gain: number } | null = null;
  for (const feature of features) {
    const values = [...new Set(data.map(p => p[feature]))].sort((a, b) => a - b);
    for (let i = 0; i + 1 < values.length; i++) {
      const t = (values[i] + values[i + 1]) / 2;
      const { gain } = split(data, feature, t);
      if (!best || gain > best.gain + 1e-12) best = { feature, t, gain };
    }
  }
  return best;
}

/** Строи дърво „алчно“: на всяка стъпка най-добрият въпрос, докато групата стане чиста или се стигне дълбочината. */
export function buildTree(data: Pt[], maxDepth: number, pickFeatures?: () => Feature[]): Tree {
  const node = { ones: ones(data), total: data.length };
  if (maxDepth === 0 || node.ones === 0 || node.ones === node.total) return { leaf: true, ...node };
  const best = bestSplit(data, pickFeatures?.());
  if (!best || best.gain <= 1e-9) return { leaf: true, ...node };
  const { left, right } = split(data, best.feature, best.t);
  return { leaf: false, feature: best.feature, t: best.t, left: buildTree(left, maxDepth - 1, pickFeatures), right: buildTree(right, maxDepth - 1, pickFeatures), ...node };
}

/** Делът на клас 1 в листото, до което стига точката. */
export function treeProb(tree: Tree, x: number, y: number): number {
  let node = tree;
  while (!node.leaf) node = (node.feature === 'x' ? x : y) <= node.t ? node.left : node.right;
  return node.total ? node.ones / node.total : 0.5;
}

export const leaves = (t: Tree): number => (t.leaf ? 1 : leaves(t.left) + leaves(t.right));
export const depth = (t: Tree): number => (t.leaf ? 0 : 1 + Math.max(depth(t.left), depth(t.right)));

/** Гора: всяко дърво се строи върху случайна извадка с връщане и на всеки възел гледа само един случаен признак. */
export function buildForest(data: Pt[], count: number, seed: number, maxDepth = 8): Tree[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const sample = data.map(() => data[Math.floor(random() * data.length)]);
    return buildTree(sample, maxDepth, () => [random() < 0.5 ? 'x' : 'y']);
  });
}

/** Средното от отговорите на всички дървета. */
export const forestProb = (forest: Tree[], x: number, y: number) => forest.reduce((s, t) => s + (treeProb(t, x, y) > 0.5 ? 1 : 0), 0) / forest.length;
