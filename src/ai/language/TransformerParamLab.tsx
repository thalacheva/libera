import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { bigNumber, countParams, type Size } from './transformer';

const SMALL: Size = { vocab: 50000, d: 768, layers: 12 };
const LARGE: Size = { vocab: 50000, d: 4096, layers: 48 };
const same = (a: Size, b: Size) => a.vocab === b.vocab && a.d === b.d && a.layers === b.layers;

/** Брояч на параметрите на трансформър по трите числа, които определят размера му. */
export default function TransformerParamLab() {
  const [size, setSize] = useState<Size>(SMALL);
  const c = countParams(size);
  const share = c.blocks / c.total;
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">къде са параметрите</div>
      <div className="flex h-9 w-full overflow-hidden rounded border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-white">
        <div className="flex items-center justify-center bg-blue-500 overflow-hidden whitespace-nowrap" style={{ width: `${(1 - share) * 100}%` }}>
          {1 - share > 0.25 ? `вграждания ${pct(1 - share)}` : ''}
        </div>
        <div className="flex items-center justify-center bg-fuchsia-600 overflow-hidden whitespace-nowrap" style={{ width: `${share * 100}%` }}>
          {share > 0.2 ? `блокове ${pct(share)}` : ''}
        </div>
      </div>
      <Sliders>
        <Slider label="речник V" value={size.vocab} onChange={vocab => setSize({ ...size, vocab })} min={1000} max={100000} step={1000} tone="blue" />
        <Slider label="ширина d" value={size.d} onChange={d => setSize({ ...size, d })} min={64} max={4096} step={64} tone="violet" />
        <Slider label="блокове" value={size.layers} onChange={layers => setSize({ ...size, layers })} min={1} max={96} step={1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={same(size, SMALL)} onClick={() => setSize(SMALL)}>
          малък модел
        </DiagramButton>
        <DiagramButton active={same(size, LARGE)} onClick={() => setSize(LARGE)}>
          голям модел
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'вграждания V·d', value: bigNumber(c.embedding), tone: 'blue' },
            { label: 'един блок 12d²', value: bigNumber(c.block), tone: 'violet' },
            { label: 'всички блокове', value: bigNumber(c.blocks), tone: 'violet' },
            { label: 'общо', value: bigNumber(c.total), tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">
        Сметката е приблизителна: пропуска отместванията, нормализирането и позициите, които са под един процент. Удвои ширината –
        блоковете стават четири пъти по-тежки, а вгражданията само два.
      </Note>
    </div>
  );
}
