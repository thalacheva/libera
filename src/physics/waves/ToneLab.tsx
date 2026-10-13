import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';
import { nearestNote, useTone } from './audio';

const V = 343; // m/s, въздух при 20 °C

// Логаритмична ос на честотите: от 10 Hz до 200 kHz
const LG = [1, Math.log10(2e5)];
const fx = (f: number) => 20 + ((Math.log10(f) - LG[0]) / (LG[1] - LG[0])) * 440;

// Приблизителни обхвати – при животните данните варират според вида и източника
const RANGES = [
  { name: 'пиано', from: 27.5, to: 4186, cls: 'fill-amber-500' },
  { name: 'човешки глас (основен тон)', from: 85, to: 1100, cls: 'fill-rose-500' },
  { name: 'слух на куче', from: 65, to: 45000, cls: 'fill-blue-500' },
  { name: 'прилеп (ехолокация)', from: 20000, to: 110000, cls: 'fill-violet-500' },
];

const PRESETS = [
  { name: '100 Hz', f: 100 },
  { name: 'до₄ 262 Hz', f: 261.63 },
  { name: 'ла₄ 440 Hz', f: 440 },
  { name: '1 kHz', f: 1000 },
  { name: '10 kHz', f: 10000 },
  { name: '15 kHz', f: 15000 },
];

/** Тонът: честота, период, дължина на вълната и най-близката нота; надлъжната вълна във въздуха. */
export default function ToneLab() {
  const [f, setF] = useState(440);
  const [vol, setVol] = useState(50);
  const tone = useTone();
  const partials = (freq: number) => [{ freq, amp: 1 }];

  const changeF = (nf: number) => {
    setF(nf);
    tone.update(partials(nf), vol / 100);
  };
  const changeVol = (nv: number) => {
    setVol(nv);
    tone.update(partials(f), nv / 100);
  };

  const lambda = V / f;
  const note = nearestNote(f);
  const audible = f >= 20 && f <= 20000;

  // Частиците на въздуха: на екрана винаги три дължини на вълната
  const W = { left: 20, right: 460 };
  const lamPx = (W.right - W.left) / 3;
  const amp = 7 * (vol / 100);
  const columns = Array.from({ length: 60 }, (_, i) => W.left + 3 + (i * (W.right - W.left - 6)) / 59);
  const shift = (x: number) => amp * Math.sin((2 * Math.PI * (x - W.left)) / lamPx);
  // Налягането е най-голямо там, където частиците са най-сгъстени: p ∝ −ds/dx
  const pressure = Array.from({ length: 121 }, (_, i) => {
    const x = W.left + (i / 120) * (W.right - W.left);
    const p = -Math.cos((2 * Math.PI * (x - W.left)) / lamPx) * (vol / 100);
    return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${(206 - p * 12).toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 228">
        {/* Обхватът на слуха */}
        <rect x={fx(10)} y={22} width={fx(20) - fx(10)} height={20} className="fill-gray-300/60 dark:fill-gray-600/60" />
        <rect x={fx(20)} y={22} width={fx(20000) - fx(20)} height={20} className="fill-emerald-500/25" />
        <rect x={fx(20000)} y={22} width={fx(2e5) - fx(20000)} height={20} className="fill-violet-500/20" />
        <Label p={{ x: (fx(10) + fx(20)) / 2, y: 12 }} size={10}>
          инфра
        </Label>
        <Label p={{ x: (fx(20) + fx(20000)) / 2, y: 12 }} size={11} tone="emerald">
          чуваме (≈ 20 Hz – 20 kHz)
        </Label>
        <Label p={{ x: (fx(20000) + fx(2e5)) / 2, y: 12 }} size={10} tone="violet">
          ултразвук
        </Label>
        {[10, 100, 1000, 10000, 100000].map(t => (
          <g key={t}>
            <line x1={fx(t)} y1={42} x2={fx(t)} y2={47} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: fx(t), y: 55 }} size={10} weight={500}>
              {t >= 1000 ? `${t / 1000} kHz` : `${t} Hz`}
            </Label>
          </g>
        ))}
        {RANGES.map((r, i) => (
          <g key={r.name}>
            <rect x={fx(r.from)} y={68 + i * 15} width={fx(r.to) - fx(r.from)} height={5} rx={2.5} className={`${r.cls} opacity-70`} />
            <Label p={{ x: r.from > 10000 ? fx(r.from) - 4 : fx(r.to) + 4, y: 70 + i * 15 }} size={10} anchor={r.from > 10000 ? 'end' : 'start'}>
              {r.name}
            </Label>
          </g>
        ))}
        <line x1={fx(f)} y1={18} x2={fx(f)} y2={128} className="stroke-rose-500" strokeWidth="2" />
        <circle cx={fx(f)} cy={32} r={5} className="fill-rose-500" />

        {/* Надлъжната вълна: частиците се сгъстяват и разреждат по посоката на разпространение */}
        {[146, 156, 166, 176].map(y =>
          columns.map((x, i) => <circle key={`${y}-${i}`} cx={x + shift(x)} cy={y} r={1.8} className="fill-gray-500 dark:fill-gray-400" />),
        )}
        <line x1={W.left} y1={206} x2={W.right} y2={206} className="stroke-gray-300 dark:stroke-gray-600" />
        <path d={pressure} fill="none" className="stroke-blue-500" strokeWidth="2" />
        <Label p={{ x: W.left, y: 222 }} size={10} anchor="start" tone="blue">
          налягане
        </Label>
        <line x1={W.left} y1={136} x2={W.left + lamPx} y2={136} className="stroke-amber-500" strokeWidth="2" />
        <Label p={{ x: W.left + lamPx / 2, y: 136 }} size={11} tone="amber">
          {`λ = ${sig(lambda, 3)} m`}
        </Label>
      </ZoomingSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={Math.abs(p.f - f) < 0.5} onClick={() => changeF(p.f)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="lg f" value={Math.round(Math.log10(f) * 100) / 100} onChange={v => changeF(Math.round(10 ** v))} min={1.3} max={4.3} step={0.01} tone="rose" />
        <Slider label="сила, %" value={vol} onChange={changeVol} min={0} max={100} step={5} tone="blue" />
      </Sliders>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => (tone.playing ? tone.stop() : tone.start(partials(f), vol / 100))}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
        >
          {tone.playing ? '■ Спри' : '▶ Пусни звука'}
        </button>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'f =', value: `${sig(f, 3)} Hz`, tone: 'rose' },
            { label: 'T =', value: 1 / f >= 0.001 ? `${sig(1000 / f, 3)} ms` : `${sig(1e6 / f, 3)} µs` },
            { label: 'λ =', value: lambda >= 0.1 ? `${sig(lambda, 3)} m` : `${sig(lambda * 100, 3)} cm`, tone: 'amber' },
            { label: 'нота', value: `${note.name} (${note.latin})${note.cents ? `, ${note.cents > 0 ? '+' : '−'}${Math.abs(note.cents)} цента` : ''}` },
            { label: 'сила', value: vol ? `${fmtNum(20 * Math.log10(vol / 100), 1)} dB` : '—', tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={audible ? 'emerald' : 'violet'}>
        {audible
          ? f > 15000
            ? 'Високите тонове над 15 kHz много възрастни вече не чуват – горната граница на слуха пада с годините.'
            : 'Колкото по-висока е честотата, толкова по-къса е вълната: λ = v/f.'
          : 'Извън обхвата на човешкия слух.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Плъзгачът „lg f“ мести честотата по логаритмична скала: +1 означава 10 пъти по-висок тон. Точките отдолу са частици на въздуха – те
        трептят напред-назад по посоката на вълната и образуват сгъстявания (високо налягане) и разреждания. „Сила“ е амплитудата: 50% е
        −6 dB спрямо 100%. 🔈 Преди да пуснеш звука, намали силата на устройството; със слушалки бъди особено внимателен. Колонките на
        телефон и лаптоп често не възпроизвеждат тонове под 100–200 Hz.
      </p>
    </div>
  );
}
