import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Pixels, SignedMap } from './Pixels';
import { classifier, drawShape, N, occlude, occlusionMap, score, type Shape, sigmoid } from './vision';

const W = 640;
const H = 250;
const CELL = 16;
const TOP = 30;
const SIZE = 3;
const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;

/** Лепенка 3 × 3, която закрива част от картинката: кои места са важни за отговора на класификатора. */
export default function OcclusionLab() {
  const [kind, setKind] = useState<'clean' | 'tagged'>('clean');
  const [shape, setShape] = useState<Shape>('ring');
  const [tag, setTag] = useState(true);
  const [at, setAt] = useState<{ c: number; r: number } | null>(null);
  const model = useMemo(() => classifier(kind), [kind]);

  const image = drawShape(shape, 0, 0, tag);
  const base = score(model, image);
  const covered = at ? occlude(image, at.c, at.r, SIZE) : image;
  const now = score(model, covered);
  const map = occlusionMap(model, image, SIZE);
  // Червено – закриването отслабва сегашния отговор (мястото е „доказателство“ за него), синьо – засилва го
  const signed = map.map(v => (base > 0 ? v : -v));
  const max = Math.max(1, ...signed.map(Math.abs));
  const answer = (s: number) => (s > 0 ? 'кръгче' : 'квадратче');
  const right = answer(base) === (shape === 'ring' ? 'кръгче' : 'квадратче');
  const x0 = 60;
  const x1 = 390;

  const place = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const c = Math.floor(((e.clientX - box.left) / box.width) * N) - 1;
    const r = Math.floor(((e.clientY - box.top) / box.height) * N) - 1;
    setAt({ c: Math.min(N - SIZE, Math.max(0, c)), r: Math.min(N - SIZE, Math.max(0, r)) });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <Pixels x={x0} y={TOP} cell={CELL} values={covered} title="картинката (докосни, за да сложиш лепенка)" />
        {at && <rect x={x0 + at.c * CELL} y={TOP + at.r * CELL} width={SIZE * CELL} height={SIZE * CELL} fill="none" className="stroke-amber-500" strokeWidth="3" strokeDasharray="5 3" />}
        <rect x={x0} y={TOP} width={N * CELL} height={N * CELL} fill="transparent" className="cursor-pointer touch-none" onPointerDown={place} onPointerMove={e => e.buttons > 0 && place(e)} />
        <SignedMap x={x1} y={TOP} cell={CELL} values={signed} max={max} title="карта: какво става, ако мястото се закрие" />
        <text x={x1 + (N * CELL) / 2} y={TOP + N * CELL + 20} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          червено – отговорът отслабва, синьо – засилва се
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton active={kind === 'clean'} onClick={() => setKind('clean')}>
          модел А
        </DiagramButton>
        <DiagramButton active={kind === 'tagged'} onClick={() => setKind('tagged')}>
          модел Б
        </DiagramButton>
        <DiagramButton active={shape === 'ring'} onClick={() => setShape('ring')}>
          кръгче
        </DiagramButton>
        <DiagramButton active={shape === 'square'} onClick={() => setShape('square')}>
          квадратче
        </DiagramButton>
        <DiagramButton active={tag} onClick={() => setTag(!tag)}>
          етикетче в ъгъла
        </DiagramButton>
        <DiagramButton onClick={() => setAt(null)}>махни лепенката</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'без лепенка: „кръгче“ с', value: pct(sigmoid(base)), tone: right ? 'emerald' : 'rose' },
            { label: 'с лепенка', value: at ? pct(sigmoid(now)) : '–', tone: 'amber' },
            { label: 'отговор', value: `„${answer(now)}“`, tone: answer(now) === (shape === 'ring' ? 'кръгче' : 'квадратче') ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={right ? 'gray' : 'rose'}>
        {kind === 'clean'
          ? 'Модел А е обучен върху кръгчета и квадратчета без нищо друго на картинката. Важните за него места са пръснати по фигурата; етикетчето почти не го интересува.'
          : right
            ? 'Модел Б е обучен върху данни, в които всяко кръгче е имало етикетче в ъгъла, а квадратчетата – не. Виж къде свети картата – и закрий това място.'
            : 'Модел Б греши: той изобщо не е научил формата. Научил е, че „има етикетче в ъгъла“ значи кръгче – пряк път, който е работил безупречно върху обучаващите данни.'}
      </Note>
    </div>
  );
}
