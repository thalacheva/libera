import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const RAD = 5; // радиус на молекулата, px
const BOX = { x0: 10, y0: 14, w: 300, h: 200 };
const SIGMA0 = 60; // разсейване на скоростите по една ос при 300 K, px/s
const R_GAS = 8.314;
const T_GRAPH = 60; // s по оста на графиката
const CATALYST = 0.6; // катализаторът понижава енергията на активиране до 60%

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

// 0 – A, 1 – B, 2 – продукт C (от A), 3 – продукт D (от B)
type Mix = { x: number[]; y: number[]; vx: number[]; vy: number[]; kind: number[]; hits: number; good: number; t: number; log: number[] };

const sigma = (T: number) => SIGMA0 * Math.sqrt(T / 300);

/** Начално състояние: молекулите са в клетки на мрежа (без застъпване), скоростите – по Гаус, мащабирани точно към T. */
function initMix(n: number, T: number): Mix {
  const rand = mulberry32(20261019 + n);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const total = 2 * n;
  const cols = 10;
  const rows = 6;
  const cells = Array.from({ length: cols * rows }, (_, i) => i).sort(() => rand() - 0.5);
  const [cw, ch] = [BOX.w / cols, BOX.h / rows];
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < total; i++) {
    const c = cells[i];
    x.push(BOX.x0 + (c % cols) * cw + RAD + 1 + rand() * (cw - 2 * RAD - 2));
    y.push(BOX.y0 + Math.floor(c / cols) * ch + RAD + 1 + rand() * (ch - 2 * RAD - 2));
  }
  const gx = Array.from({ length: total }, gauss);
  const gy = Array.from({ length: total }, gauss);
  const kx = Math.sqrt((total * sigma(T) ** 2) / gx.reduce((a, v) => a + v * v, 0));
  const ky = Math.sqrt((total * sigma(T) ** 2) / gy.reduce((a, v) => a + v * v, 0));
  return {
    x,
    y,
    vx: gx.map(v => v * kx),
    vy: gy.map(v => v * ky),
    kind: Array.from({ length: total }, (_, i) => i % 2),
    hits: 0,
    good: 0,
    t: 0,
    log: [0],
  };
}

const FILL = ['fill-blue-500', 'fill-rose-500', 'fill-emerald-500', 'fill-amber-400'];

// Графиката на броя продукти вдясно
const G = { x0: 352, x1: 470, y0: 30, y1: 190 };

/** Модел на теорията на ударите: A + B → C + D става само при удар с енергия над енергията на активиране. */
export default function CollisionLab() {
  const [n, setN] = useState(20);
  const [T, setT] = useState(300);
  const [Ea, setEa] = useState(9);
  const [cat, setCat] = useState(false);
  const EaEff = cat ? Ea * CATALYST : Ea;
  // В модела kT отговаря на σ², така Ea/(RT) е същото като в реален газ
  const EaSim = ((EaEff * 1000) / (R_GAS * 300)) * SIGMA0 ** 2;

  const step = (s: Mix, dt: number): Mix => {
    let { hits, good } = s;
    const [left, right, top, bottom] = [BOX.x0 + RAD, BOX.x0 + BOX.w - RAD, BOX.y0 + RAD, BOX.y0 + BOX.h - RAD];
    const N = s.x.length;
    for (let i = 0; i < N; i++) {
      s.x[i] += s.vx[i] * dt;
      s.y[i] += s.vy[i] * dt;
      if (s.x[i] < left || s.x[i] > right) {
        s.x[i] = s.x[i] < left ? 2 * left - s.x[i] : 2 * right - s.x[i];
        s.vx[i] = -s.vx[i];
      }
      if (s.y[i] < top || s.y[i] > bottom) {
        s.y[i] = s.y[i] < top ? 2 * top - s.y[i] : 2 * bottom - s.y[i];
        s.vy[i] = -s.vy[i];
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = s.x[j] - s.x[i];
        const dy = s.y[j] - s.y[i];
        const d2 = dx * dx + dy * dy;
        if (d2 >= 4 * RAD * RAD || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const [nx, ny] = [dx / d, dy / d];
        // Скоростта на сближаване по линията на центровете
        const u = (s.vx[i] - s.vx[j]) * nx + (s.vy[i] - s.vy[j]) * ny;
        if (u <= 0) continue;
        // Еластичен удар на еднакви топчета: разменят компонентите по линията на центровете
        s.vx[i] -= u * nx;
        s.vy[i] -= u * ny;
        s.vx[j] += u * nx;
        s.vy[j] += u * ny;
        if (s.kind[i] + s.kind[j] === 1) {
          hits++;
          // Енергията на удара (m = 1, приведена маса 1/2): E = ½ · ½ · u²
          if (0.25 * u * u >= EaSim) {
            good++;
            s.kind[i] += 2;
            s.kind[j] += 2;
          }
        }
      }
    }
    const t = s.t + dt;
    // Записваме броя на продуктите всяка четвърт секунда
    const log = Math.floor(t * 4) > Math.floor(s.t * 4) && t <= T_GRAPH ? [...s.log, good] : s.log;
    return { ...s, hits, good, t, log };
  };
  const sim = useSimulation<Mix>(() => initMix(n, T), step, { dt: 1 / 240, speed: 1.5 });
  const m = sim.state;

  // Всяка промяна започва опита отначало – иначе броячите смесват различни условия
  const restart = (nn = n, TT = T) => {
    const was = sim.running;
    sim.reset(initMix(nn, TT));
    if (was) sim.play();
  };

  const theory = Math.exp((-EaEff * 1000) / (R_GAS * T));
  const share = m.hits > 0 ? m.good / m.hits : null;
  const gx = (t: number) => G.x0 + (t / T_GRAPH) * (G.x1 - G.x0);
  const gy = (k: number) => G.y1 - (k / n) * (G.y1 - G.y0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 232" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={BOX.x0} y={BOX.y0} width={BOX.w} height={BOX.h} className="fill-sky-50 stroke-gray-500 dark:fill-sky-950/40" strokeWidth="2" />
        {m.x.map((x, i) => (
          <circle key={i} cx={x} cy={m.y[i]} r={RAD} className={FILL[m.kind[i]]} />
        ))}
        <g fontSize="11">
          <circle cx={BOX.x0 + 8} cy={BOX.y0 + BOX.h + 11} r={4} className={FILL[0]} />
          <text x={BOX.x0 + 16} y={BOX.y0 + BOX.h + 15} fill="currentColor">A</text>
          <circle cx={BOX.x0 + 38} cy={BOX.y0 + BOX.h + 11} r={4} className={FILL[1]} />
          <text x={BOX.x0 + 46} y={BOX.y0 + BOX.h + 15} fill="currentColor">B</text>
          <text x={BOX.x0 + 64} y={BOX.y0 + BOX.h + 15} fill="currentColor">→</text>
          <circle cx={BOX.x0 + 86} cy={BOX.y0 + BOX.h + 11} r={4} className={FILL[2]} />
          <text x={BOX.x0 + 94} y={BOX.y0 + BOX.h + 15} fill="currentColor">C</text>
          <circle cx={BOX.x0 + 114} cy={BOX.y0 + BOX.h + 11} r={4} className={FILL[3]} />
          <text x={BOX.x0 + 122} y={BOX.y0 + BOX.h + 15} fill="currentColor">D</text>
        </g>

        {/* Брой получени молекули C с времето */}
        <text x={(G.x0 + G.x1) / 2} y={16} fontSize="11" textAnchor="middle" fill="currentColor">
          получени C
        </text>
        <line x1={G.x0} x2={G.x1} y1={G.y1} y2={G.y1} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={G.x0} x2={G.x0} y1={G.y0} y2={G.y1} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={G.x0} x2={G.x1} y1={G.y0} y2={G.y0} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 3" />
        <text x={G.x0 - 4} y={G.y0 + 4} fontSize="10" textAnchor="end" fill="currentColor">
          {n}
        </text>
        <text x={G.x0 - 4} y={G.y1 + 4} fontSize="10" textAnchor="end" fill="currentColor">
          0
        </text>
        <text x={G.x1} y={G.y1 + 14} fontSize="10" textAnchor="end" fill="currentColor">
          {T_GRAPH} s
        </text>
        <polyline points={m.log.map((k, i) => `${gx(i / 4)},${gy(k)}`).join(' ')} fill="none" className="stroke-emerald-500" strokeWidth="2.5" />
      </LabSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset(initMix(n, T))} time={m.t} />
      <Buttons>
        <DiagramButton active={!cat} onClick={() => {
            setCat(false);
            restart();
          }}>
          без катализатор
        </DiagramButton>
        <DiagramButton active={cat} onClick={() => {
            setCat(true);
            restart();
          }}>
          с катализатор
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="T, K" value={T} onChange={v => {
            setT(v);
            restart(n, v);
          }} min={200} max={600} step={50} tone="rose" />
        <Slider label="A и B" value={n} onChange={v => {
            setN(v);
            restart(v);
          }} min={10} max={30} step={5} tone="blue" />
        <Slider label="Eₐ" value={Ea} onChange={v => {
            setEa(v);
            restart();
          }} min={4} max={14} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'удари A–B:', value: m.hits },
            { label: 'ефективни:', value: m.good, tone: 'emerald' },
            { label: 'дял:', value: share === null ? '…' : `${fmtNum(100 * share, 1)}%` },
            { label: 'теория e^(−Eₐ/RT):', value: `${fmtNum(100 * theory, 1)}%`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={cat ? 'emerald' : 'gray'}>
        {cat
          ? `Катализаторът понижава енергията на активиране от ${Ea} на ${fmtNum(EaEff, 1)} kJ/mol – ефективните удари стават много повече, без молекулите да са по-бързи.`
          : `Енергия на активиране ${Ea} kJ/mol при ${T} K: само малка част от ударите имат достатъчно енергия.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Молекулите A (сини) и B (червени) се удрят непрекъснато, но реагират само ако енергията на удара по линията на центровете е
        поне Eₐ. Сравни дела на ефективните удари с теорията. Повиши температурата – ударите стават малко по-чести, но ефективните растат
        много по-бързо. Увеличи броя на молекулите – по-голямата концентрация дава повече удари за секунда. Моделът е двумерен, а
        енергията на активиране е няколко пъти по-ниска от реалните (обикновено 40–150 kJ/mol) – иначе щяхме да чакаме часове за
        една реакция.
      </p>
    </div>
  );
}
