import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';

/** Верига от еднакви слоеве: колко от „сигнала за грешка“ може най-много да стигне до всеки слой при обратното разпространение. */
export default function VanishLab() {
  const [depth, setDepth] = useState(8);
  const [w, setW] = useState(1);
  const [relu, setRelu] = useState(false);

  // Най-големият възможен множител на един слой: w·f′(z), като f′ е най-много 0,25 за сигмоидата и 1 за изправителя
  const local = Array.from({ length: depth }, () => w * (relu ? 1 : 0.25));
  // Обратна посока: производната на изхода по входа на слой k е произведението на местните производни след него
  const grads: number[] = [];
  let g = 1;
  for (let k = depth - 1; k >= 0; k--) {
    g *= local[k];
    grads[k] = Math.abs(g);
  }
  const logOf = (v: number) => Math.max(-8, Math.min(2, Math.log10(Math.max(v, 1e-12))));
  const first = grads[0];
  const sci = (v: number) => (v === 0 ? '0' : v >= 0.01 && v < 1000 ? v.toLocaleString('bg-BG', { maximumSignificantDigits: 2 }) : `${(v / 10 ** Math.floor(Math.log10(v))).toLocaleString('bg-BG', { maximumFractionDigits: 1 })}·10^${Math.floor(Math.log10(v))}`);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0.4, 12.6]} y={[-8, 2]} xTicks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} yTicks={[-8, -6, -4, -2, 0, 2]} xLabel="слой (1 е най-близо до входа)" yLabel="сигнал, който стига до слоя" height={280} yTick={v => (v === 0 ? '1' : v === 2 ? '100' : `10^${v}`)}>
        {s => (
          <>
            <line x1={s.x0} y1={s.sy(0)} x2={s.x1} y2={s.sy(0)} className="stroke-gray-500" strokeWidth="1.5" />
            {grads.map((v, k) => {
              const top = s.sy(logOf(v));
              const base = s.sy(0);
              return <rect key={k} x={s.sx(k + 1) - 14} y={Math.min(top, base)} width={28} height={Math.max(2, Math.abs(base - top))} className={v < 1e-3 ? 'fill-rose-500' : v > 10 ? 'fill-amber-500' : 'fill-emerald-500'} clipPath={s.clip} />;
            })}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="слоеве" value={depth} onChange={setDepth} min={1} max={12} step={1} tone="violet" />
        <Slider label="тегло w" value={w} onChange={setW} min={0.5} max={5} step={0.1} tone="amber" />
      </Sliders>
      <Buttons>
        <DiagramButton active={!relu} onClick={() => setRelu(false)}>
          сигмоида
        </DiagramButton>
        <DiagramButton active={relu} onClick={() => setRelu(true)}>
          „изправител“ max(0, z)
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'слоеве', value: depth, tone: 'violet' },
            { label: 'най-голям множител на един слой', value: sci(local[0]) },
            { label: 'сигнал до първия слой', value: sci(first), tone: first < 1e-3 ? 'rose' : first > 10 ? 'amber' : 'emerald' },
          ]}
        />
      </div>
      <Note tone={first < 1e-3 ? 'rose' : first > 10 ? 'amber' : 'gray'}>
        {first < 1e-3
          ? 'До първите слоеве стига нищожна част от сигнала: техните тегла почти не се поправят и мрежата не се учи в дълбочина.'
          : first > 10
            ? 'Обратното: сигналът се усилва на всеки слой и стъпките за първите слоеве стават огромни.'
            : 'Всеки стълб показва по колко най-много се умножава сигналът за грешка, докато стигне от изхода до този слой (скалата е логаритмична).'}
      </Note>
    </div>
  );
}
