import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from '../history/rollouts';
import Chart from '../models/Chart';
import { CENTERED, DATA, gradient, loss, minimum, type Params } from './landscape';
import Relief from './Relief';

const W: [number, number] = [0, 22];
const dec = (v: number, d = 1) => (!Number.isFinite(v) || Math.abs(v) > 1e6 ? '—' : v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−'));

/**
 * Градиентно спускане по релефа на загубата за права.
 * mode="scale": същите данни със и без центриране на признака; mode="batch": пакети с различен размер.
 */
export default function DescentLab({ mode }: { mode: 'scale' | 'batch' }) {
  const [centered, setCentered] = useState(mode === 'batch');
  const [rate, setRate] = useState(mode === 'batch' ? 0.1 : 0.03);
  const [batch, setBatch] = useState(mode === 'batch' ? 1 : 16);
  const data = centered ? CENTERED : DATA;
  const B: [number, number] = centered ? [30, 110] : [0, 80];
  const startOf = (c: boolean): Params => (c ? { w: 2, b: 40 } : { w: 2, b: 70 });
  const [path, setPath] = useState<Params[]>([startOf(mode === 'batch')]);
  const [seed, setSeed] = useState(1);

  const best = minimum(data);
  const p = path[path.length - 1];
  const value = loss(p, data);
  const lost = !Number.isFinite(value) || value > 1e6;
  const maxRate = centered ? 0.6 : 0.08;

  const reset = (c = centered) => {
    setCentered(c);
    setPath([startOf(c)]);
    if (c !== centered) setRate(c ? 0.3 : 0.03);
    setSeed(s => s + 1);
  };

  /** `n` стъпки; всяка гледа случаен пакет от `batch` примера (или всичките). */
  const run = (n: number) => {
    const random = mulberry32(seed * 7919 + path.length);
    const out = [...path];
    for (let i = 0; i < n; i++) {
      const last = out[out.length - 1];
      if (!Number.isFinite(last.w) || Math.abs(last.w) > 1e5) break;
      const part = batch >= data.length ? data : Array.from({ length: batch }, () => data[Math.floor(random() * data.length)]);
      const g = gradient(last, part);
      out.push({ w: last.w - rate * g.w, b: last.b - rate * g.b });
    }
    setPath(out);
  };

  const shown = path.slice(-400);
  const curve = path.map(q => loss(q, data));
  const top = Math.max(...curve.slice(0, 1), 100);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={W} y={B} xTicks={[0, 5, 10, 15, 20]} yTicks={centered ? [30, 50, 70, 90, 110] : [0, 20, 40, 60, 80]} xLabel="тегло w" yLabel="отместване b" height={300}>
        {s => (
          <>
            <Relief s={s} w={W} b={B} data={data} lo={16} hi={6000} />
            <polyline points={shown.map(q => `${s.sx(q.w)},${s.sy(q.b)}`).join(' ')} fill="none" stroke="white" strokeWidth="2" clipPath={s.clip} />
            {shown.length <= 60 && shown.map((q, i) => <circle key={i} cx={s.sx(q.w)} cy={s.sy(q.b)} r={2.5} fill="white" clipPath={s.clip} />)}
            <circle cx={s.sx(best.w)} cy={s.sy(best.b)} r={5} fill="white" stroke="black" strokeWidth="1.5" />
            {!lost && <circle cx={s.sx(p.w)} cy={s.sy(p.b)} r={7} className="fill-fuchsia-500" stroke="white" strokeWidth="2.5" clipPath={s.clip} />}
          </>
        )}
      </Chart>
      <Chart x={[0, Math.max(20, path.length - 1)]} y={[0, top]} xTicks={[0, Math.max(20, path.length - 1)]} yTicks={[0, top / 2, top]} xLabel="стъпки" yLabel="загуба" height={170} tick={v => String(Math.round(v))}>
        {s => <polyline points={curve.map((v, i) => `${s.sx(i)},${s.sy(Math.min(top, v))}`).join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" clipPath={s.clip} />}
      </Chart>
      {mode === 'scale' ? (
        <Buttons>
          <DiagramButton active={!centered} onClick={() => reset(false)}>
            признакът както е
          </DiagramButton>
          <DiagramButton active={centered} onClick={() => reset(true)}>
            центриран признак
          </DiagramButton>
        </Buttons>
      ) : (
        <Buttons>
          {[16, 4, 1].map(n => (
            <DiagramButton key={n} active={batch === n} onClick={() => setBatch(n)}>
              {n === 16 ? 'всичките 16 примера' : `пакет от ${n}`}
            </DiagramButton>
          ))}
        </Buttons>
      )}
      <Sliders>
        <Slider label="η" value={rate} onChange={setRate} min={centered ? 0.02 : 0.005} max={maxRate} step={centered ? 0.02 : 0.005} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => run(1)}>една стъпка</DiagramButton>
        <DiagramButton onClick={() => run(20)}>20 стъпки</DiagramButton>
        <DiagramButton onClick={() => run(500)}>500 стъпки</DiagramButton>
        <DiagramButton onClick={() => reset()}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпки', value: path.length - 1 },
            { label: 'w', value: dec(p.w), tone: 'violet' },
            { label: 'b', value: dec(p.b), tone: 'violet' },
            { label: 'загуба', value: dec(value), tone: 'amber' },
            { label: 'на дъното', value: dec(loss(best, data)), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={lost ? 'rose' : 'gray'}>
        {lost
          ? 'Спускането се разпадна: стъпката е твърде голяма за стръмните стени на долината. Намали η и започни отначало.'
          : mode === 'scale'
            ? centered
              ? 'С центриран признак релефът е почти кръгла купа и спускането върви право към дъното.'
              : 'Долината е дълга и тясна. Спускането бързо стига дъното ѝ, а после пълзи по него към бялата точка – пробвай с 500 стъпки наведнъж.'
            : batch >= 16
              ? 'Всяка стъпка гледа всичките примери – пътят е гладък.'
              : `Всяка стъпка гледа само ${batch === 1 ? 'един случаен пример' : `${batch} случайни примера`} – посоката е приблизителна и пътят криволичи, но върви към дъното.`}
      </Note>
    </div>
  );
}
