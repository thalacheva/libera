import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const END = 5; // симулацията спира след 5 периода на полуразпадане
const GRID = { x0: 14, y0: 20, size: 200 };
const G = { x0: 262, x1: 466, y0: 20, y1: 220 }; // графиката N(t)

/** Малък генератор на псевдослучайни числа с фиксирано семе – еднакъв на сървъра и в браузъра. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Момент на разпадане на всяко ядро в периоди на полуразпадане: −log₂(u), u – равномерно в (0, 1].
 * Така вероятността ядрото да оцелее до момента s е точно 2^(−s).
 */
function lifetimes(n: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => -Math.log2(1 - rand()));
}

/** Радиоактивно разпадане: всяко ядро се разпада случайно, но броят на оцелелите следва закона N₀·2^(−t/T). */
export default function DecayLab() {
  const [n0, setN0] = useState(400);
  const [T, setT] = useState(3);
  const [seed, setSeed] = useState(20261014);
  const life = useMemo(() => lifetimes(n0, seed), [n0, seed]);
  const sorted = useMemo(() => [...life].sort((a, b) => a - b), [life]);

  // Състоянието е изминалото време в периоди на полуразпадане
  const sim = useSimulation<{ s: number }>(() => ({ s: 0 }), (st, dt) => (st.s >= END ? st : { s: Math.min(END, st.s + dt / T) }), {
    dt: 1 / 120,
  });
  const s = sim.state.s;
  const alive = life.filter(l => l > s).length;
  const theory = n0 * 2 ** -s;

  const restart = (next?: { n?: number; T?: number; seed?: number }) => {
    if (next?.n) setN0(next.n);
    if (next?.T) setT(next.T);
    if (next?.seed) setSeed(next.seed);
    sim.reset({ s: 0 });
  };

  const side = Math.sqrt(n0);
  const cell = GRID.size / side;
  const gx = (v: number) => G.x0 + (v / END) * (G.x1 - G.x0);
  const gy = (v: number) => G.y1 - (v / n0) * (G.y1 - G.y0);

  // Стъпаловидната крива на опита: всяко разпаднало се ядро сваля N с 1
  const steps: string[] = [`${gx(0)},${gy(n0)}`];
  let left = n0;
  for (const l of sorted) {
    if (l > s) break;
    steps.push(`${gx(l).toFixed(1)},${gy(left).toFixed(1)}`);
    left -= 1;
    steps.push(`${gx(l).toFixed(1)},${gy(left).toFixed(1)}`);
  }
  steps.push(`${gx(s).toFixed(1)},${gy(left).toFixed(1)}`);
  const curve = Array.from({ length: 101 }, (_, i) => {
    const v = (i / 100) * END;
    return `${gx(v).toFixed(1)},${gy(n0 * 2 ** -v).toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {[100, 400].map(n => (
          <DiagramButton key={n} active={n0 === n} onClick={() => restart({ n })}>
            {n} ядра
          </DiagramButton>
        ))}
        <DiagramButton onClick={() => restart({ seed: seed + 1 })}>🎲 нова проба</DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 258">
        {/* Ядрата: оранжево – още неразпаднали се, сиво – вече разпаднали се */}
        {life.map((l, i) => {
          const x = GRID.x0 + (i % side) * cell + cell / 2;
          const y = GRID.y0 + Math.floor(i / side) * cell + cell / 2;
          return l > s ? (
            <circle key={i} cx={x} cy={y} r={cell * 0.38} className="fill-amber-500" />
          ) : (
            <circle key={i} cx={x} cy={y} r={cell * 0.22} className="fill-gray-300 dark:fill-gray-600" />
          );
        })}
        <Label p={{ x: GRID.x0 + GRID.size / 2, y: 238 }} size={11}>
          {`неразпаднали се: ${alive} от ${n0}`}
        </Label>

        {/* Графиката N(t) */}
        {[0.5, 0.25, 0.125].map(f => (
          <g key={f}>
            <line x1={G.x0} y1={gy(n0 * f)} x2={G.x1} y2={gy(n0 * f)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 4" />
            <line x1={gx(-Math.log2(f))} y1={G.y0} x2={gx(-Math.log2(f))} y2={G.y1} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 4" />
          </g>
        ))}
        <line x1={G.x0} y1={G.y1} x2={G.x1} y2={G.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        <polyline points={curve} fill="none" className="stroke-blue-500" strokeWidth="2" strokeDasharray="6 4" />
        <polyline points={steps.join(' ')} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
        <circle cx={gx(s)} cy={gy(alive)} r={4} className="fill-amber-500" />
        {[0, 1, 2, 3, 4, 5].map(k => (
          <Label key={k} p={{ x: gx(k), y: G.y1 + 12 }} size={10} weight={500}>
            {k === 0 ? '0' : `${k}T`}
          </Label>
        ))}
        {[1, 0.5, 0.25, 0.125].map(f => (
          <Label key={f} p={{ x: G.x0 - 4, y: gy(n0 * f) }} size={10} weight={500} anchor="end">
            {String(n0 * f)}
          </Label>
        ))}
        <Label p={{ x: G.x0 + 8, y: 10 }} size={11} anchor="start">
          N
        </Label>
        <Label p={{ x: G.x1, y: G.y1 + 28 }} size={11} anchor="end">
          t
        </Label>
        <Label p={{ x: G.x1, y: G.y0 + 10 }} size={10} tone="blue" anchor="end">
          N₀ · 2^(−t/T)
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => restart()} time={s * T} />
      <Sliders>
        <Slider label="T, s" value={T} onChange={v => restart({ T: v })} min={1} max={6} step={0.5} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 't / T =', value: fmtNum(s, 2) },
            { label: 'N (опит) =', value: String(alive), tone: 'amber' },
            { label: 'N₀ · 2^(−t/T) =', value: fmtNum(theory, 1), tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="amber">
        {s >= END
          ? `След 5 периода остава около 1/32 от ядрата – по закона ${fmtNum(n0 / 32, 1)}, в опита ${alive}.`
          : 'Кое ядро ще се разпадне следващо – не може да се предскаже. Колко ще останат – може.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяко ядро има една и съща вероятност да се разпадне за единица време и „не помни“ колко дълго е живяло. Затова за всеки период
        на полуразпадане T се разпадат средно половината от оцелелите ядра. С 400 ядра стъпаловидната крива следва закона по-плътно,
        отколкото със 100 – отклоненията са от порядъка на √N, а относително те намаляват с броя на ядрата. Натисни „нова проба“: кривата
        всеки път е малко различна, но средно е една и съща.
      </p>
    </div>
  );
}
