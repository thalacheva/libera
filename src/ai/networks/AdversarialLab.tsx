import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Pixels, SignedMap } from './Pixels';
import { classifier, drawShape, N, perturb, score, type Shape, sigmoid } from './vision';

const W = 640;
const H = 236;
const CELL = 15;
const TOP = 30;
const pct = (v: number) => `${(v * 100).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%`;
const NAMES: Record<Shape, string> = { ring: 'кръгче', square: 'квадратче' };

/** Измамен пример: към всеки пиксел се добавя ±ε според знака на теглото му и отговорът на линейния класификатор се обръща. */
export default function AdversarialLab() {
  const [shape, setShape] = useState<Shape>('ring');
  // ε в проценти от скалата „бяло – черно“
  const [epsPct, setEpsPct] = useState(0);
  const model = useMemo(() => classifier('clean'), []);
  const eps = epsPct / 100;

  const original = drawShape(shape);
  const before = score(model, original);
  const down = before > 0;
  const changed = perturb(model, original, eps, down);
  const after = score(model, changed);
  const pBefore = sigmoid(before);
  const pAfter = sigmoid(after);
  const answer = (p: number) => (p > 0.5 ? 'кръгче' : 'квадратче');
  const flipped = pAfter > 0.5 !== pBefore > 0.5;
  // Посоката на промяната за всеки пиксел: +1 – по-тъмно, −1 – по-светло
  const direction = model.w.map(w => (down ? -1 : 1) * Math.sign(w));
  const size = N * CELL;
  const xs = [22, 230, 438];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <Pixels x={xs[0]} y={TOP} cell={CELL} values={original} title="оригинал" />
        <SignedMap x={xs[1]} y={TOP} cell={CELL} values={direction} max={1.6} title={`промяна: ±${pct(eps)} на пиксел`} />
        <Pixels x={xs[2]} y={TOP} cell={CELL} values={changed} title="резултат" />
        <text x={(xs[0] + size + xs[1]) / 2} y={TOP + size / 2 + 8} fontSize="26" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          +
        </text>
        <text x={(xs[1] + size + xs[2]) / 2} y={TOP + size / 2 + 8} fontSize="26" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          =
        </text>
        <text x={xs[0] + size / 2} y={TOP + size + 20} fontSize="13" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
          „{answer(pBefore)}“
        </text>
        <text x={xs[1] + size / 2} y={TOP + size + 20} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          червено – по-тъмно, синьо – по-светло
        </text>
        <text x={xs[2] + size / 2} y={TOP + size + 20} fontSize="13" fontWeight="bold" textAnchor="middle" className={flipped ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-900 dark:fill-gray-100'}>
          „{answer(pAfter)}“
        </text>
      </LabSvg>
      <Sliders>
        <Slider label="ε, %" value={epsPct} onChange={setEpsPct} min={0} max={10} step={0.5} tone="rose" />
      </Sliders>
      <Buttons>
        {(['ring', 'square'] as Shape[]).map(s => (
          <DiagramButton key={s} active={shape === s} onClick={() => setShape(s)}>
            {NAMES[s]}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'преди: „кръгче“ с', value: pct(pBefore) },
            { label: 'след: „кръгче“ с', value: pct(pAfter), tone: flipped ? 'rose' : 'emerald' },
            { label: 'промяна на пиксел', value: `±${pct(eps)}`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={flipped ? 'rose' : 'gray'}>
        {eps === 0
          ? 'Класификаторът познава фигурата. Увеличавай ε: всеки от 144-те пиксела се променя съвсем малко – точно в посоката, която най-много вреди на отговора.'
          : flipped
            ? `Отговорът се обърна на „${answer(pAfter)}“, а никой пиксел не се е променил с повече от ${pct(eps)} от скалата между бяло и черно. Сравни лявата и дясната картинка.`
            : 'Увереността пада, макар за окото картинката да е същата. Още малко…'}
      </Note>
    </div>
  );
}
