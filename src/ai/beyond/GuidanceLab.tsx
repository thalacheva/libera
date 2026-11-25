import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { CATS, DOGS, generate, guidedNoise, KINDS, nearest, PETS, STEPS, withCaption } from './diffusionMath';

const N = 240;
const W = 360;
const H = 264;
const sx = (v: number) => W / 2 + v * 60;
const sy = (v: number) => H / 2 - v * 60;
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/** Насочване без класификатор: заявка „котка“ или „куче“ и сила w – колко точки отговарят на заявката и кои видове оцеляват. */
export default function GuidanceLab() {
  const [cat, setCat] = useState(true);
  const [w, setW] = useState(1);
  const [seed, setSeed] = useState(1);

  const pts = useMemo(() => {
    const wanted = withCaption(cat);
    return generate(N, seed, (p, t) => guidedNoise(p, t, PETS, wanted, w))[STEPS];
  }, [cat, w, seed]);
  const cls = pts.map(p => nearest(p, PETS).i);
  const isCat = cls.map(c => c < 3);
  const ok = isCat.filter(c => c === cat).length;
  const off = cat ? 0 : 3;
  const kinds = [0, 1, 2].map(i => cls.filter(c => c === i + off).length);
  const share = Math.round((ok / N) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300">Заявка:</p>
      <Buttons>
        <DiagramButton active={cat} onClick={() => setCat(true)}>
          „котка“
        </DiagramButton>
        <DiagramButton active={!cat} onClick={() => setCat(false)}>
          „куче“
        </DiagramButton>
        <DiagramButton onClick={() => setSeed(seed + 1)}>🎲 друг шум</DiagramButton>
      </Buttons>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg mx-auto h-auto block select-none mt-3">
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" />
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        {CATS.map((b, i) => (
          <circle key={`c${i}`} cx={sx(b.x)} cy={sy(b.y)} r={2 * b.s * 60} className="fill-fuchsia-200/60 dark:fill-fuchsia-500/20" />
        ))}
        {DOGS.map((b, i) => (
          <circle key={`d${i}`} cx={sx(b.x)} cy={sy(b.y)} r={2 * b.s * 60} className="fill-amber-200/70 dark:fill-amber-500/20" />
        ))}
        <text x={8} y={16} fontSize="12" className="fill-fuchsia-700 dark:fill-fuchsia-300">
          котки
        </text>
        <text x={W - 8} y={16} fontSize="12" textAnchor="end" className="fill-amber-700 dark:fill-amber-300">
          кучета
        </text>
        {pts.map((p, i) => (
          <circle key={i} cx={sx(clamp(p[0], 2.95))} cy={sy(clamp(p[1], 2.15))} r={2.4} className={isCat[i] ? 'fill-fuchsia-600 dark:fill-fuchsia-400' : 'fill-amber-600 dark:fill-amber-400'} opacity={0.8} />
        ))}
      </svg>
      <Sliders>
        <Slider label="сила w" value={w} onChange={setW} min={0} max={8} step={0.5} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'отговарят на заявката', value: `${ok} от ${N} (${share}%)`, tone: 'emerald' },
            ...KINDS.map((name, i) => ({ label: `вид „${name}“`, value: kinds[i], tone: i === 2 ? ('rose' as const) : ('violet' as const) })),
          ]}
        />
      </div>
      <Note tone={w === 0 ? 'gray' : share < 90 ? 'amber' : kinds[2] < 40 ? 'rose' : 'emerald'}>
        {w === 0
          ? 'При w = 0 заявката изобщо не участва: излизат и котки, и кучета, колкото в обучаващите данни.'
          : share < 90
            ? 'Моделът следва заявката само отчасти – надписите в обучаващите данни не са били съвършени.'
            : kinds[2] < 40
              ? 'Всички точки отговарят на заявката, но видът по средата – този, който прилича на другото животно – почти изчезна. Вярност за сметка на разнообразие.'
              : 'Почти всички точки отговарят на заявката и трите вида още са налице.'}
      </Note>
    </div>
  );
}
