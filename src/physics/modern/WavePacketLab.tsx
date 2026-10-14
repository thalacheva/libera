import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const K0 = 5; // средно вълново число, 1/nm
const N = 41; // брой събрани вълни
const XMAX = 12; // nm – показваме x от −12 до 12
const SAMPLES = 481;

const SPEC = { x0: 40, x1: 460, y0: 18, y1: 86, kMax: 10 };
const WAVE = { x0: 40, x1: 460, mid: 196, amp: 70 };

/**
 * Пакет от N косинусоиди с вълнови числа около K0. Теглата са гаусови: w ∝ exp(−(k − K0)²/(4Δk²)),
 * така че стандартното отклонение на |w|² е точно Δk.
 */
function packet(dk: number) {
  const span = 3 * Math.SQRT2 * dk;
  const ks = Array.from({ length: N }, (_, j) => K0 - span + (2 * span * j) / (N - 1));
  const ws = ks.map(k => Math.exp(-((k - K0) ** 2) / (4 * dk * dk)));
  const total = ws.reduce((s, w) => s + w, 0);
  const xs = Array.from({ length: SAMPLES }, (_, i) => -XMAX + (2 * XMAX * i) / (SAMPLES - 1));
  const re: number[] = [];
  const env: number[] = [];
  for (const x of xs) {
    let c = 0;
    let s = 0;
    for (let j = 0; j < N; j++) {
      c += ws[j] * Math.cos(ks[j] * x);
      s += ws[j] * Math.sin(ks[j] * x);
    }
    re.push(c / total);
    env.push(Math.hypot(c, s) / total);
  }
  // Ширини като стандартни отклонения на |ψ|² и на |w|²
  const p = env.map(e => e * e);
  const sp = p.reduce((a, b) => a + b, 0);
  const dx = Math.sqrt(p.reduce((a, v, i) => a + v * xs[i] ** 2, 0) / sp);
  const w2 = ws.map(w => w * w);
  const sw = w2.reduce((a, b) => a + b, 0);
  const dkNum = Math.sqrt(w2.reduce((a, v, j) => a + v * (ks[j] - K0) ** 2, 0) / sw);
  return { ks, ws, xs, re, env, dx, dk: dkNum };
}

const sx = (x: number) => WAVE.x0 + ((x + XMAX) / (2 * XMAX)) * (WAVE.x1 - WAVE.x0);
const sk = (k: number) => SPEC.x0 + (k / SPEC.kMax) * (SPEC.x1 - SPEC.x0);

/** Вълнов пакет: колкото по-тясно е място на частицата, толкова повече различни импулси са нужни. */
export default function WavePacketLab() {
  const [dk, setDk] = useState(0.4);
  const [parts, setParts] = useState(false);
  const pk = useMemo(() => packet(dk), [dk]);

  const path = (ys: number[], sign = 1) =>
    pk.xs.map((x, i) => `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${(WAVE.mid - sign * ys[i] * WAVE.amp).toFixed(1)}`).join(' ');

  // Пет от събраните вълни – за да се види, че пакетът е сбор от обикновени вълни
  const shown = [0, 10, 20, 30, 40];
  const part = (j: number) =>
    pk.xs
      .map((x, i) => `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${(WAVE.mid - 0.35 * pk.ws[j] * Math.cos(pk.ks[j] * x) * WAVE.amp).toFixed(1)}`)
      .join(' ');

  const product = pk.dx * pk.dk;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 290">
        {/* Спектър: колко от всяка вълна има в пакета */}
        <line x1={SPEC.x0} y1={SPEC.y1} x2={SPEC.x1} y2={SPEC.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        {pk.ks.map((k, j) => (
          <line key={j} x1={sk(k)} y1={SPEC.y1} x2={sk(k)} y2={SPEC.y1 - pk.ws[j] * (SPEC.y1 - SPEC.y0)} className="stroke-amber-500" strokeWidth={2} />
        ))}
        <line x1={sk(K0 - pk.dk)} y1={SPEC.y1 + 6} x2={sk(K0 + pk.dk)} y2={SPEC.y1 + 6} className="stroke-amber-600" strokeWidth={2} />
        {[0, 2, 4, 6, 8, 10].map(k => (
          <Label key={k} p={{ x: sk(k), y: SPEC.y1 + 16 }} size={10} weight={500}>
            {String(k)}
          </Label>
        ))}
        <Label p={{ x: SPEC.x1, y: SPEC.y0 }} size={10} anchor="end" tone="amber">
          вълни в пакета
        </Label>
        <Label p={{ x: SPEC.x1 + 8, y: SPEC.y1 + 16 }} size={10} anchor="end">
          k, 1/nm
        </Label>

        {/* Пакетът в пространството */}
        <line x1={WAVE.x0} y1={WAVE.mid} x2={WAVE.x1} y2={WAVE.mid} className="stroke-gray-300 dark:stroke-gray-600" />
        {parts && shown.map(j => <path key={j} d={part(j)} fill="none" className="stroke-gray-400" strokeWidth={1} opacity={0.6} />)}
        <path d={path(pk.env)} fill="none" className="stroke-violet-300 dark:stroke-violet-700" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={path(pk.env, -1)} fill="none" className="stroke-violet-300 dark:stroke-violet-700" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={path(pk.re)} fill="none" className="stroke-violet-600" strokeWidth={2} />
        <line x1={sx(-pk.dx)} y1={WAVE.mid + WAVE.amp + 8} x2={sx(pk.dx)} y2={WAVE.mid + WAVE.amp + 8} className="stroke-violet-600" strokeWidth={2} />
        <Label p={{ x: sx(pk.dx) + 6, y: WAVE.mid + WAVE.amp + 12 }} size={10} anchor="start" tone="violet">
          2Δx
        </Label>
        {[-10, -5, 0, 5, 10].map(x => (
          <Label key={x} p={{ x: sx(x), y: 284 }} size={10} weight={500}>
            {String(x)}
          </Label>
        ))}
        <Label p={{ x: WAVE.x1 + 8, y: 284 }} size={10} anchor="end">
          x, nm
        </Label>
      </ZoomingSvg>

      <Buttons>
        <DiagramButton active={parts} onClick={() => setParts(!parts)}>
          {parts ? 'скрий отделните вълни' : 'покажи отделните вълни'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="Δk" value={dk} onChange={setDk} min={0.2} max={1.1} step={0.05} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Δk =', value: `${fmtNum(pk.dk, 2)} nm⁻¹`, tone: 'amber' },
            { label: 'Δx =', value: `${fmtNum(pk.dx, 2)} nm`, tone: 'violet' },
            { label: 'Δx · Δk =', value: fmtNum(product, 2) },
          ]}
        />
      </div>
      <Note tone="violet">
        {dk <= 0.25
          ? 'Почти една-единствена вълна: импулсът е определен добре, но пакетът е разлят – частицата може да е навсякъде.'
          : dk >= 1
            ? 'Много различни вълни: пакетът е тесен (мястото е определено добре), но импулсът е силно размит.'
            : 'Сбори повече различни вълни (по-широк спектър) – пакетът става по-тесен. Произведението Δx · Δk остава 0,5.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Горе е колко от всяка вълна (с вълново число k = 2π/λ) участва в пакета, долу – сборът им (плътно) и обвивката |ψ| (пунктир).
        Вълните се подсилват само там, където са в една фаза, а другаде се гасят. Импулсът на всяка вълна е p = ħk, затова Δx · Δp = ħ · Δx ·
        Δk. За гаусов пакет като този произведението е точно ħ/2 – най-малкото възможно. Пакет с друга форма дава повече.
      </p>
    </div>
  );
}
