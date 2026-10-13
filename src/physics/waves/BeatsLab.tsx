import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { useTone } from './audio';

const X0 = 40;
const X1 = 460;

/** Биене: два близки тона се събират в един, чиято сила пулсира с честота |f₁ − f₂|. */
export default function BeatsLab() {
  const [f1, setF1] = useState(440);
  const [f2, setF2] = useState(443);
  const tone = useTone();
  const partials = (a: number, b: number) => [
    { freq: a, amp: 1 },
    { freq: b, amp: 1 },
  ];
  const df = Math.abs(f1 - f2);

  // Горе: сборът за 1 s – вижда се само обвивката (пулсирането на силата)
  const top = 44;
  const signal = Array.from({ length: 4001 }, (_, i) => {
    const t = i / 4000;
    const y = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) / 2;
    return `${i ? 'L' : 'M'} ${(X0 + t * (X1 - X0)).toFixed(1)} ${(top - 26 * y).toFixed(1)}`;
  }).join(' ');
  const envelope = (sign: number) =>
    Array.from({ length: 401 }, (_, i) => {
      const t = i / 400;
      return `${i ? 'L' : 'M'} ${(X0 + t * (X1 - X0)).toFixed(1)} ${(top - sign * 26 * Math.abs(Math.cos(Math.PI * df * t))).toFixed(1)}`;
    }).join(' ');

  // Долу: два прозореца по 10 ms – когато фазите съвпадат и когато са противоположни
  const zoom = (t0: number, left: number, freq: number, scale: number) =>
    Array.from({ length: 201 }, (_, i) => {
      const t = t0 + (i / 200) * 0.01;
      const y = freq === 0 ? (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) / 2 : Math.sin(2 * Math.PI * freq * t);
      return `${i ? 'L' : 'M'} ${(left + (i / 200) * 190).toFixed(1)} ${(140 - scale * y).toFixed(1)}`;
    }).join(' ');
  const tHalf = df > 0 ? 1 / (2 * df) : 0;

  const changeF1 = (v: number) => {
    setF1(v);
    tone.update(partials(v, f2));
  };
  const changeF2 = (v: number) => {
    setF2(v);
    tone.update(partials(f1, v));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 196">
        <line x1={X0} y1={top} x2={X1} y2={top} className="stroke-gray-200 dark:stroke-gray-700" />
        <path d={signal} fill="none" className="stroke-violet-500" strokeWidth="0.6" />
        {df > 0 && (
          <>
            <path d={envelope(1)} fill="none" className="stroke-amber-500" strokeWidth="2" />
            <path d={envelope(-1)} fill="none" className="stroke-amber-500" strokeWidth="2" />
          </>
        )}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <Label key={t} p={{ x: X0 + t * (X1 - X0), y: 84 }} size={10} weight={500}>
            {fmtNum(t, 2)}
          </Label>
        ))}
        <Label p={{ x: X1, y: 96 }} size={10} anchor="end">
          t, s
        </Label>
        <Label p={{ x: X0, y: 8 }} size={11} anchor="start" tone="amber">
          {df > 0 ? `силата пулсира ${fmtNum(df, 1)} пъти в секунда` : 'еднакви тонове – няма биене'}
        </Label>

        {/* Увеличени прозорци по 10 ms */}
        {[
          { left: 40, t0: 0, title: 'фазите съвпадат – силно' },
          { left: 260, t0: tHalf, title: df > 0 ? 'противоположни фази – тихо' : 'пак съвпадат' },
        ].map(w => (
          <g key={w.left}>
            <rect x={w.left} y={112} width={190} height={56} className="fill-gray-50 dark:fill-gray-900/40" />
            <path d={zoom(w.t0, w.left, f1, 20)} fill="none" className="stroke-blue-500" strokeWidth="1" opacity={0.6} />
            <path d={zoom(w.t0, w.left, f2, 20)} fill="none" className="stroke-rose-500" strokeWidth="1" opacity={0.6} />
            <path d={zoom(w.t0, w.left, 0, 26)} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="2.5" />
            <Label p={{ x: w.left + 95, y: 182 }} size={11}>
              {`${w.title} (10 ms)`}
            </Label>
          </g>
        ))}
      </ZoomingSvg>

      <Sliders>
        <Slider label="f₁, Hz" value={f1} onChange={changeF1} min={430} max={450} step={0.5} tone="blue" />
        <Slider label="f₂, Hz" value={f2} onChange={changeF2} min={430} max={450} step={0.5} tone="rose" />
      </Sliders>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => (tone.playing ? tone.stop() : tone.start(partials(f1, f2)))}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
        >
          {tone.playing ? '■ Спри' : '▶ Пусни двата тона'}
        </button>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'биене f_b =', value: `${fmtNum(df, 1)} Hz`, tone: 'amber' },
            { label: 'период', value: df > 0 ? `${fmtNum(1 / df, 2)} s` : '—' },
            { label: 'чуваме тон', value: `${fmtNum((f1 + f2) / 2, 2)} Hz`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={df === 0 ? 'emerald' : df > 15 ? 'gray' : 'amber'}>
        {df === 0
          ? 'В унисон – така музикантите знаят, че инструментите са настроени.'
          : df > 15
            ? 'При по-голяма разлика пулсирането става толкова бързо, че ухото го възприема като грапав звук или като два отделни тона.'
            : 'Настройвачът върти ключа, докато биенето се забави и изчезне.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Синята и червената крива са двата тона, лилавата – техният сбор. В някои моменти гребените съвпадат и звукът се усилва, а след време
        1/(2f_b) единият тон „изпреварва“ другия с половин трептене и те почти се унищожават. 🔈 Преди да пуснеш звука, намали силата на
        устройството.
      </p>
    </div>
  );
}
