import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';
import { approxError, stepNet, TARGETS } from './mlp';

const XS = Array.from({ length: 241 }, (_, i) => i / 240);
const dec = (v: number, d = 3) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Един скрит слой от сигмоиди, нареден на ръка: всеки неврон добавя едно „стъпало“, а сборът им следва избраната крива. */
export default function ApproxLab() {
  const [id, setId] = useState(TARGETS[0].id);
  const [n, setN] = useState(3);
  const [sharp, setSharp] = useState(4);

  const target = TARGETS.find(t => t.id === id) ?? TARGETS[0];
  const net = stepNet(target.f, n, sharp);
  const err = approxError(target.f, net.value);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0, 1]} y={[0, 1]} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 0.25, 0.5, 0.75, 1]} xLabel="вход x" yLabel="изход" height={300}>
        {s => (
          <>
            {net.units.map((u, i) => (
              <line key={i} x1={s.sx(u.center)} y1={s.y0} x2={s.sx(u.center)} y2={s.y0 - 10} className="stroke-violet-500" strokeWidth="2" />
            ))}
            <polyline points={XS.map(x => `${s.sx(x)},${s.sy(target.f(x))}`).join(' ')} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2.5" strokeDasharray="6 5" clipPath={s.clip} />
            <polyline points={XS.map(x => `${s.sx(x)},${s.sy(net.value(x))}`).join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" clipPath={s.clip} />
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="неврони" value={n} onChange={setN} min={1} max={40} step={1} tone="violet" />
        <Slider label="стръмност" value={sharp} onChange={setSharp} min={1} max={12} step={1} tone="amber" />
      </Sliders>
      <Buttons>
        {TARGETS.map(t => (
          <DiagramButton key={t.id} active={t.id === id} onClick={() => setId(t.id)}>
            {t.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'скрити неврони', value: n, tone: 'violet' },
            { label: 'параметри', value: 3 * n + 1 },
            { label: 'средна грешка', value: dec(err), tone: err < 0.02 ? 'emerald' : err < 0.08 ? 'amber' : 'rose' },
          ]}
        />
      </div>
      <Note tone={err < 0.02 ? 'emerald' : 'gray'}>
        {err < 0.02
          ? 'Розовата крива почти покрива пунктираната. Нищо тук не е обучавано – теглата са наредени на ръка, по едно стъпало на неврон.'
          : 'Пунктираната крива е целта, розовата – изходът на мрежата. Всяка виолетова чертичка долу е мястото, където един скрит неврон „се включва“ и добавя своето стъпало.'}
      </Note>
    </div>
  );
}
