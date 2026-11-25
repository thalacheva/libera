import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { generate, meanDistance, type P, predictNoise, SHAPES, STEPS } from './diffusionMath';

const N = 200;
const W = 320;
const R = 3;
const sx = (v: number) => ((v + R) / (2 * R)) * W;
const sy = (v: number) => ((R - v) / (2 * R)) * W;
const dec = (v: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const GRID: P[] = [];
for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) GRID.push([i * 0.62, j * 0.62]);

/** Обратният процес: 200 точки чист шум се придвижват стъпка по стъпка към формата, която „мрежата“ е научила. */
export default function DenoiseLab() {
  const [shape, setShape] = useState(0);
  const [seed, setSeed] = useState(1);
  const [k, setK] = useState(0);
  const [arrows, setArrows] = useState(false);

  const blobs = SHAPES[shape].blobs;
  const path = useMemo(() => generate(N, seed, (p, t) => predictNoise(p, t, SHAPES[shape].blobs)), [shape, seed]);
  const pts = path[k];
  const t = STEPS - k;
  const dist = meanDistance(pts, blobs);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SHAPES.map((s, i) => (
          <DiagramButton key={s.name} active={shape === i} onClick={() => setShape(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-sm mx-auto h-auto block select-none mt-3">
        <rect x={0.5} y={0.5} width={W - 1} height={W - 1} className="fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" />
        {blobs.map((b, i) => (
          <circle key={i} cx={sx(b.x)} cy={sy(b.y)} r={Math.max(4, ((2 * b.s) / (2 * R)) * W)} className="fill-fuchsia-200/70 dark:fill-fuchsia-500/25" />
        ))}
        {arrows &&
          t >= 1 &&
          GRID.map((g, i) => {
            const e = predictNoise(g, t, blobs);
            const len = Math.hypot(e[0], e[1]);
            const f = Math.min(0.26, 0.2 * len) / (len || 1);
            return (
              <g key={i} className="stroke-sky-600 dark:stroke-sky-300">
                <line x1={sx(g[0])} y1={sy(g[1])} x2={sx(g[0] - f * e[0])} y2={sy(g[1] - f * e[1])} strokeWidth={1.4} />
                <circle cx={sx(g[0] - f * e[0])} cy={sy(g[1] - f * e[1])} r={1.8} className="fill-sky-600 dark:fill-sky-300" stroke="none" />
              </g>
            );
          })}
        {pts.map((p, i) => (
          <circle key={i} cx={sx(Math.max(-R, Math.min(R, p[0])))} cy={sy(Math.max(-R, Math.min(R, p[1])))} r={2.4} className="fill-gray-800 dark:fill-gray-100" opacity={0.75} />
        ))}
      </svg>
      <Sliders>
        <Slider label="стъпки" value={k} onChange={setK} min={0} max={STEPS} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setK(Math.min(STEPS, k + 1))}>една стъпка назад във времето</DiagramButton>
        <DiagramButton onClick={() => setK(0)}>отначало</DiagramButton>
        <DiagramButton
          onClick={() => {
            setSeed(seed + 1);
            setK(0);
          }}
        >
          🎲 друг шум
        </DiagramButton>
        <DiagramButton active={arrows} onClick={() => setArrows(!arrows)}>
          накъде сочи мрежата
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'направени стъпки', value: `${k} от ${STEPS}`, tone: 'violet' },
            { label: 'ниво на шума t', value: t, tone: 'amber' },
            { label: 'средно разстояние до формата', value: dec(dist), tone: 'emerald' },
            ...(shape === 2 ? [{ label: 'вляво : вдясно', value: `${pts.filter(p => p[0] < 0).length} : ${pts.filter(p => p[0] >= 0).length}`, tone: 'blue' as const }] : []),
          ]}
        />
      </div>
      <Note tone={k === 0 ? 'gray' : k < 30 ? 'amber' : k < STEPS ? 'blue' : 'emerald'}>
        {k === 0
          ? 'Чист шум: 200 точки, хвърлени наслуки. Розовите петна са формата от обучаващите данни.'
          : k < 30
            ? 'Точките се местят по малко и облакът още прилича на шум – засега се решава само грубото: коя точка към коя част на формата ще тръгне.'
            : k < STEPS
              ? 'Формата изплува. Последните стъпки изчистват подробностите.'
              : 'Готово: от шума се получиха 200 нови точки върху формата – нито една не е копие на обучаващ пример.'}
      </Note>
    </div>
  );
}
