import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Handle, Note, Readout } from '~/geometry/diagram';
import { area, type Box, CANDIDATES, intersection, iou, nms } from './vision';

const W = 640;
const H = 320;
const TRUTH: Box = { x: 210, y: 60, w: 200, h: 200 };
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Режим 1: вярна и предсказана рамка, сечение и обединение. */
function Overlap() {
  // Предсказаната рамка се задава с два срещуположни ъгъла
  const [a, setA] = useState({ x: 260, y: 100 });
  const [c, setC] = useState({ x: 480, y: 290 });
  const [threshold, setThreshold] = useState(0.5);
  const pred: Box = { x: Math.min(a.x, c.x), y: Math.min(a.y, c.y), w: Math.abs(c.x - a.x), h: Math.abs(c.y - a.y) };
  const inter = intersection(TRUTH, pred);
  const union = area(TRUTH) + area(pred) - inter;
  const value = iou(TRUTH, pred);
  const ix = Math.max(TRUTH.x, pred.x);
  const iy = Math.max(TRUTH.y, pred.y);
  const iw = Math.min(TRUTH.x + TRUTH.w, pred.x + pred.w) - ix;
  const ih = Math.min(TRUTH.y + TRUTH.h, pred.y + pred.h) - iy;
  const hit = value >= threshold;
  const fit = (p: { x: number; y: number }) => ({ x: clamp(Math.round(p.x), 8, W - 8), y: clamp(Math.round(p.y), 8, H - 8) });

  return (
    <>
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={W} height={H} rx={8} className="fill-sky-50 dark:fill-gray-900/50" />
        <text x={TRUTH.x + TRUTH.w / 2} y={TRUTH.y + TRUTH.h / 2 + 55} fontSize="160" textAnchor="middle">
          🐈
        </text>
        <rect x={pred.x} y={pred.y} width={pred.w} height={pred.h} className="fill-violet-500/10" />
        <rect x={TRUTH.x} y={TRUTH.y} width={TRUTH.w} height={TRUTH.h} className="fill-emerald-500/10" />
        {inter > 0 && <rect x={ix} y={iy} width={iw} height={ih} className="fill-amber-400/60" />}
        <rect x={TRUTH.x} y={TRUTH.y} width={TRUTH.w} height={TRUTH.h} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="3" />
        <rect x={pred.x} y={pred.y} width={pred.w} height={pred.h} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="3" strokeDasharray="9 5" />
        <text x={TRUTH.x + 4} y={TRUTH.y - 8} fontSize="14" fontWeight="bold" className="fill-emerald-700 dark:fill-emerald-400">
          вярна рамка
        </text>
        <text x={pred.x + pred.w - 4} y={pred.y + pred.h + 18 > H - 4 ? pred.y - 8 : pred.y + pred.h + 18} fontSize="14" fontWeight="bold" textAnchor="end" className="fill-violet-700 dark:fill-violet-400">
          предсказана
        </text>
        <Handle p={a} onMove={p => setA(fit(p))} name="горен ляв ъгъл на предсказаната рамка" tone="violet" />
        <Handle p={c} onMove={p => setC(fit(p))} name="долен десен ъгъл на предсказаната рамка" tone="violet" />
      </LabSvg>
      <Sliders>
        <Slider label="праг" value={threshold} onChange={setThreshold} min={0.3} max={0.9} step={0.05} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'сечение', value: Math.round(inter / 100), tone: 'amber' },
            { label: 'обединение', value: Math.round(union / 100) },
            { label: 'IoU', value: dec(value), tone: hit ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={hit ? 'emerald' : 'rose'}>
        {value === 0
          ? 'Рамките не се застъпват: IoU = 0, колкото и близо да са една до друга.'
          : hit
            ? `IoU ${dec(value)} ≥ ${dec(threshold)}: откриването се брои за вярно. Влачи двете точки, за да преместиш ъглите на предсказаната рамка.`
            : `IoU ${dec(value)} < ${dec(threshold)}: при този праг откриването се брои за грешно, макар рамката да закача котката.`}
      </Note>
    </>
  );
}

/** Режим 2: няколко предложени рамки с оценки и потискане на дублиращите се, стъпка по стъпка. */
function Suppress() {
  const [threshold, setThreshold] = useState(0.5);
  const [done, setDone] = useState(0);
  const steps = nms(CANDIDATES, threshold);
  const shown = steps.slice(0, done);
  const kept = shown.map(s => s.keep);
  const dropped = shown.flatMap(s => s.dropped);
  const finished = done >= steps.length;
  const last = shown[shown.length - 1];
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <>
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={W} height={H} rx={8} className="fill-sky-50 dark:fill-gray-900/50" />
        <text x={130} y={215} fontSize="150" textAnchor="middle">
          🐕
        </text>
        <text x={240} y={220} fontSize="150" textAnchor="middle">
          🐕
        </text>
        <text x={510} y={220} fontSize="115" textAnchor="middle">
          🐈
        </text>
        {CANDIDATES.map((b, i) => {
          const isKept = kept.includes(i);
          const isDropped = dropped.includes(i);
          const cls = isKept ? 'stroke-emerald-600 dark:stroke-emerald-400' : isDropped ? 'stroke-gray-400 dark:stroke-gray-500' : 'stroke-violet-600 dark:stroke-violet-400';
          const label = isKept ? 'fill-emerald-700 dark:fill-emerald-400' : isDropped ? 'fill-gray-500 dark:fill-gray-400' : 'fill-violet-700 dark:fill-violet-400';
          return (
            <g key={i} opacity={isDropped ? 0.45 : 1}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" className={cls} strokeWidth={isKept ? 4 : 2} strokeDasharray={isDropped ? '4 5' : undefined} />
              <text x={b.x + 5} y={b.y - 5} fontSize="13" fontWeight="bold" className={label} textDecoration={isDropped ? 'line-through' : undefined}>
                {pct(b.score)}
              </text>
            </g>
          );
        })}
      </LabSvg>
      <Sliders>
        <Slider
          label="праг"
          value={threshold}
          onChange={v => {
            setThreshold(v);
            setDone(0);
          }}
          min={0.1}
          max={0.9}
          step={0.05}
          tone="amber"
        />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setDone(Math.min(steps.length, done + 1))}>следваща стъпка</DiagramButton>
        <DiagramButton onClick={() => setDone(steps.length)}>до края</DiagramButton>
        <DiagramButton onClick={() => setDone(0)}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'предложени', value: CANDIDATES.length, tone: 'violet' },
            { label: 'оставени', value: kept.length, tone: 'emerald' },
            { label: 'потиснати', value: dropped.length },
            { label: 'предмети на снимката', value: 3 },
          ]}
        />
      </div>
      <Note tone={!finished ? 'gray' : kept.length === 3 ? 'emerald' : 'rose'}>
        {done === 0
          ? 'Детекторът е предложил 7 рамки за 3 животни – всяка с оценка колко е сигурен. Натискай „следваща стъпка“.'
          : !finished
            ? `Оставяме рамката с най-висока оценка сред неразгледаните (${pct(CANDIDATES[last.keep].score)}) и потискаме ${last.dropped.length === 0 ? 'нула рамки – никоя не се застъпва с нея над прага' : `${last.dropped.length === 1 ? 'една рамка' : `${last.dropped.length} рамки`} с IoU над ${dec(threshold)} спрямо нея`}.`
            : kept.length === 3
              ? 'Останаха точно три рамки – по една за всяко животно.'
              : kept.length < 3
                ? 'Прагът е твърде нисък: двете кучета се застъпват и рамката на второто беше потисната като „дубликат“ на първото.'
                : 'Прагът е твърде висок: останаха по няколко рамки за едно и също животно.'}
      </Note>
    </>
  );
}

/** Сечение върху обединение (IoU) за две рамки и потискане на дублиращите се рамки. */
export default function IouLab() {
  const [mode, setMode] = useState<'iou' | 'nms'>('iou');
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        <DiagramButton active={mode === 'iou'} onClick={() => setMode('iou')}>
          две рамки
        </DiagramButton>
        <DiagramButton active={mode === 'nms'} onClick={() => setMode('nms')}>
          много предложения
        </DiagramButton>
      </div>
      {mode === 'iou' ? <Overlap /> : <Suppress />}
    </div>
  );
}
