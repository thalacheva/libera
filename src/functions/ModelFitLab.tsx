import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';
import { num, polynomial } from './functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotLine, Slider, Sliders } from './plot';

// Измервания с малък „шум“ – като в истински опит
const noise = [0.18, -0.22, 0.05, 0.27, -0.12, -0.3, 0.2, -0.05, 0.14, -0.2];

const DATASETS = [
  {
    name: '🪀 Пружина',
    x: 'маса, ×100 g',
    y: 'дължина, cm',
    a: 0.8,
    b: 2,
    xs: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    story: 'Окачваме тежести на пружина. Законът на Хук казва, че удължението е пропорционално на силата: L = L₀ + k · m.',
    meaning: (a: number, b: number) => `пружината е дълга ${num(b, 1)} cm без тежест и се удължава с ${num(a, 2)} cm на всеки 100 g`,
  },
  {
    name: '🕯️ Свещ',
    x: 'време, часове',
    y: 'височина, cm',
    a: -1.1,
    b: 9,
    xs: [0, 1, 2, 3, 4, 5, 6, 7],
    story: 'Мерим височината на горяща свещ всеки час. Тя изгаря с постоянна скорост.',
    meaning: (a: number, b: number) => `свещта е висока ${num(b, 1)} cm в началото и изгаря с ${num(-a, 2)} cm на час`,
  },
  {
    name: '🚕 Такси',
    x: 'път, km',
    y: 'цена, €',
    a: 0.8,
    b: 1.2,
    xs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    story: 'Записваме цената на десет курса с такси. Кои са началната такса и цената на километър?',
    meaning: (a: number, b: number) => `началната такса е ${num(b, 2)} €, а километърът струва ${num(a, 2)} €`,
  },
];

export function ModelFitLab() {
  const [di, setDi] = useState(0);
  const [a, setA] = useState(0.3);
  const [b, setB] = useState(4);
  const [showBest, setShowBest] = useState(false);
  const ds = DATASETS[di];
  const pts = ds.xs.map((x, i) => ({ x, y: Math.round((ds.a * x + ds.b + noise[i % noise.length]) * 10) / 10 }));

  // Най-малки квадрати
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const bestA = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const bestB = my - bestA * mx;
  const rms = (A: number, B: number) => Math.sqrt(pts.reduce((s, p) => s + (p.y - (A * p.x + B)) ** 2, 0) / n);
  const err = rms(a, b);
  const bestErr = rms(bestA, bestB);
  const grade = err < bestErr + 0.05 ? 'perfect' : err < 0.6 ? 'good' : err < 1.5 ? 'close' : 'far';

  return (
    <Plot
      x={[-1, 10]}
      y={[-1, 10]}
      hint="Мести a и b, докато правата мине възможно най-близо до всички точки. Пунктирните отсечки показват грешката за всяка точка."
      readout={
        <>
          <Buttons>
            {DATASETS.map((d, i) => (
              <DiagramButton
                key={d.name}
                active={i === di}
                onClick={() => {
                  setDi(i);
                  setShowBest(false);
                }}
              >
                {d.name}
              </DiagramButton>
            ))}
          </Buttons>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{ds.story}</p>
          <Sliders>
            <Slider label="a" value={a} onChange={setA} min={-2} max={2} step={0.05} tone="blue" />
            <Slider label="b" value={b} onChange={setB} min={-1} max={10} step={0.1} tone="emerald" />
          </Sliders>
          <Formula>y = {polynomial([a, b])}</Formula>
          <Readout
            items={[
              { label: 'средна грешка', value: num(err, 2), tone: grade === 'perfect' || grade === 'good' ? 'emerald' : 'rose' },
              { label: 'най-добрата възможна', value: num(bestErr, 2), tone: 'gray' },
            ]}
          />
          <Note tone={grade === 'perfect' ? 'emerald' : grade === 'good' ? 'emerald' : grade === 'close' ? 'amber' : 'rose'}>
            {grade === 'perfect' && '🎯 Уцели! По-добра права няма.'}
            {grade === 'good' && '👍 Много близо – още малко!'}
            {grade === 'close' && 'Топло… промени наклона или началото.'}
            {grade === 'far' && 'Студено – правата е далеч от точките.'}
          </Note>
          <Buttons>
            <DiagramButton onClick={() => setShowBest(v => !v)} active={showBest}>
              {showBest ? 'скрий най-добрата права' : 'покажи най-добрата права'}
            </DiagramButton>
          </Buttons>
          {showBest && (
            <Note tone="violet">
              y ≈ {polynomial([Math.round(bestA * 100) / 100, Math.round(bestB * 100) / 100])}: {ds.meaning(bestA, bestB)}.
            </Note>
          )}
        </>
      }
    >
      {pts.map((p, i) => (
        <PlotLine key={`e${i}`} p={p} q={{ x: p.x, y: a * p.x + b }} tone="rose" width={1.5} dashed />
      ))}
      {showBest && <Curve f={x => bestA * x + bestB} tone="violet" width={2} dashed />}
      <Curve f={x => a * x + b} tone="blue" />
      {pts.map((p, i) => (
        <PlotDot key={i} p={p} tone="amber" />
      ))}
      <PlotLabel p={{ x: 9.6, y: 0.5 }} anchor="end" size={11}>
        {ds.x}
      </PlotLabel>
      <PlotLabel p={{ x: 0.6, y: 9.5 }} anchor="start" size={11}>
        {ds.y}
      </PlotLabel>
    </Plot>
  );
}
