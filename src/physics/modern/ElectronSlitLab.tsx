import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, sig, useSimulation } from '~/physics/sim';

const H = 6.63e-34;
const ME = 9.11e-31;
const QE = 1.6e-19;

/** Малък генератор на псевдослучайни числа с фиксирано семе. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1927);

type Mode = 'two' | 'one' | 'watch';
const MODES: { id: Mode; name: string }[] = [
  { id: 'two', name: 'две цепнатини' },
  { id: 'one', name: 'една цепнатина' },
  { id: 'watch', name: 'две + детектор' },
];

// Екранът: вертикална ивица; Y се мери от средата му в px
const SCR = { x: 316, w: 44, top: 20, bottom: 260 };
const MID = (SCR.top + SCR.bottom) / 2;
const HALF = (SCR.bottom - SCR.top) / 2;
const HIST = { left: 372, right: 468 };
const BINS = 48;
const BIN = (2 * HALF) / BINS;
const MAX_HITS = 5000;

const sinc2 = (x: number) => (Math.abs(x) < 1e-6 ? 1 : (Math.sin(x) / x) ** 2);

/** Разпределение на попаденията (максимум 1 в средата). D – разстояние между ивиците в px. */
function intensity(Y: number, D: number, mode: Mode) {
  const env = sinc2((Math.PI * Y) / (4 * D)); // ширината на цепнатината е 1/4 от разстоянието между тях
  return mode === 'two' ? env * Math.cos((Math.PI * Y) / D) ** 2 : env;
}

type Hit = { y: number; jx: number };

/** Електрони един по един през две цепнатини: всеки удря в една точка, а заедно рисуват ивици. */
export default function ElectronSlitLab() {
  const [U, setU] = useState(100); // V
  const [mode, setMode] = useState<Mode>('two');
  const [fast, setFast] = useState(false);

  const D = 36 * Math.sqrt(100 / U); // px – пропорционално на λ ∝ 1/√U
  const lam = H / Math.sqrt(2 * ME * QE * U); // m
  const v = Math.sqrt((2 * QE * U) / ME);

  const sim = useSimulation<Hit[]>(
    () => [],
    (hits, dt) => {
      if (hits.length >= MAX_HITS) return hits;
      const rate = fast ? 400 : 8;
      let n = Math.floor(rate * dt + rand());
      const next = n > 0 ? [...hits] : hits;
      while (n > 0) {
        const Y = (2 * rand() - 1) * HALF;
        if (rand() < intensity(Y, D, mode)) {
          next.push({ y: Y, jx: rand() });
          n--;
        }
      }
      return next;
    },
    { dt: 1 / 60 },
  );

  const hits = sim.state;
  const counts = Array.from({ length: BINS }, () => 0);
  for (const h of hits) counts[Math.min(BINS - 1, Math.floor((h.y + HALF) / BIN))]++;
  const top = Math.max(1, ...counts);
  const shown = hits.slice(-1500);
  const last = hits.length ? hits[hits.length - 1] : null;

  const theory = Array.from({ length: 121 }, (_, i) => -HALF + (i / 120) * 2 * HALF)
    .map((Y, i) => `${i ? 'L' : 'M'} ${(HIST.left + intensity(Y, D, mode) * (HIST.right - HIST.left)).toFixed(1)} ${(MID + Y).toFixed(1)}`)
    .join(' ');

  const restart = (fn: () => void) => {
    const was = sim.running;
    fn();
    sim.reset();
    if (was) sim.play();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => restart(() => setMode(m.id))}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        {/* Електронна пушка */}
        <rect x={14} y={MID - 14} width={44} height={28} rx={4} className="fill-gray-300 stroke-gray-500 dark:fill-gray-600" strokeWidth="1.5" />
        <Label p={{ x: 36, y: MID + 26 }} size={10}>
          {`${U} V`}
        </Label>
        {/* Сноп към преградата */}
        <polygon points={`58,${MID - 6} 150,${MID - 40} 150,${MID + 40} 58,${MID + 6}`} className="fill-sky-400" opacity={0.15} />
        {/* Преграда с цепнатини */}
        <g className="fill-gray-600 dark:fill-gray-300">
          <rect x={148} y={10} width={6} height={MID - 22 - 10} />
          <rect x={148} y={MID - 14} width={6} height={mode === 'one' ? 36 : 28} />
          <rect x={148} y={MID + 22} width={6} height={270 - MID - 22} />
        </g>
        {mode === 'watch' && (
          <>
            <circle cx={166} cy={MID - 18} r={5} className="fill-amber-400" />
            <circle cx={166} cy={MID + 18} r={5} className="fill-amber-400" />
            <Label p={{ x: 176, y: MID - 34 }} size={10} anchor="start" tone="amber">
              детектор
            </Label>
          </>
        )}
        {/* Сноп към екрана */}
        <polygon points={`154,${MID - 22} ${SCR.x},${SCR.top} ${SCR.x},${SCR.bottom} 154,${MID + 22}`} className="fill-sky-400" opacity={0.06} />
        {/* Екран с попаденията */}
        <rect x={SCR.x} y={SCR.top} width={SCR.w} height={SCR.bottom - SCR.top} className="fill-gray-900" />
        {shown.map((h, i) => (
          <circle key={i} cx={SCR.x + 3 + h.jx * (SCR.w - 6)} cy={MID + h.y} r={1.3} className="fill-emerald-300" />
        ))}
        {last && <circle cx={SCR.x + 3 + last.jx * (SCR.w - 6)} cy={MID + last.y} r={4} className="fill-amber-300" />}
        {/* Хистограма */}
        {counts.map((c, i) => (
          <rect key={i} x={HIST.left} y={SCR.top + i * BIN + 0.5} width={(c / top) * (HIST.right - HIST.left)} height={BIN - 1} className="fill-emerald-500" opacity={0.7} />
        ))}
        {hits.length > 200 && <path d={theory} fill="none" className="stroke-violet-500" strokeWidth="1.5" strokeDasharray="4 3" />}
        <Label p={{ x: SCR.x + SCR.w / 2, y: 272 }} size={10}>
          екран
        </Label>
        <Label p={{ x: (HIST.left + HIST.right) / 2, y: 272 }} size={10}>
          брой
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Buttons>
        <DiagramButton active={!fast} onClick={() => setFast(false)}>
          по един
        </DiagramButton>
        <DiagramButton active={fast} onClick={() => setFast(true)}>
          бързо
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="U, V" value={U} onChange={u => restart(() => setU(u))} min={50} max={2000} step={50} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'λ =', value: `${fmtNum(lam * 1e12, 1)} pm`, tone: 'violet' },
            { label: 'v =', value: `${sig(v, 3)} m/s`, tone: 'blue' },
            { label: 'електрони:', value: String(hits.length), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="violet">
        {hits.length < 30
          ? 'Всеки електрон оставя една-единствена точка – като частица. Пусни и изчакай.'
          : mode === 'two'
            ? 'Точките се трупат на ивици – електроните интерферират като вълни, макар да летят един по един.'
            : mode === 'one'
              ? 'С една цепнатина ивиците изчезват – остава само широко дифракционно петно.'
              : 'Щом проверим през коя цепнатина минава всеки електрон, интерференцията изчезва – получава се сбор от две петна.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 По-голямото ускоряващо напрежение дава по-бързи електрони с по-къса дължина на вълната λ = h/p – ивиците се сгъстяват. Схемата не е в
        мащаб: в истинските опити ивиците са на микрометри една от друга и се увеличават с електронни лещи.
      </p>
    </div>
  );
}
