import { useEffect, useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { GROUPS, PRESETS, type Pop, groupLabel, initialPop, pyramidType, replacementTfr, stats, step } from './demographyModel';

const CX = 200;
const HALF = 150;
const TOP = 30;
const ROW = 14;
const MAXPCT = 10;
const bottom = TOP + GROUPS * ROW;
const yOf = (i: number) => bottom - (i + 1) * ROW;
const w = (pct: number) => (Math.min(pct, MAXPCT) / MAXPCT) * HALF;

// Малката графика на общото население
const GX = 420;
const GW = 200;
const GY0 = 60;
const GY1 = 250;
const STEPS = 20;

const fmtPop = (mln: number) => (mln >= 1000 ? `${fmt(mln / 1000, 2)} млрд.` : mln >= 100 ? `${fmt(mln)} млн.` : `${fmt(mln, 1)} млн.`);

/** Прогноза на възрастовата пирамида по петгодишни групи при зададени плодовитост и продължителност на живота. */
export default function PyramidLab() {
  const [pi, setPi] = useState(2);
  const preset = PRESETS[pi];
  const [tfr, setTfr] = useState(preset.tfr);
  const [e0, setE0] = useState(preset.e0);
  const [history, setHistory] = useState<Pop[]>(() => [initialPop(preset)]);
  const [playing, setPlaying] = useState(false);

  const pop = history[history.length - 1];
  const year = preset.year + 5 * (history.length - 1);
  const s = stats(pop);
  const s0 = stats(history[0]);
  const totals = useMemo(() => history.map(h => stats(h).total), [history]);
  const done = history.length > STEPS;

  useEffect(() => {
    if (!playing) return;
    if (history.length > STEPS) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setHistory(h => [...h, step(h[h.length - 1], tfr, e0)]), 450);
    return () => clearTimeout(id);
  }, [playing, history, tfr, e0]);

  const choose = (i: number) => {
    setPi(i);
    setTfr(PRESETS[i].tfr);
    setE0(PRESETS[i].e0);
    setHistory([initialPop(PRESETS[i])]);
    setPlaying(false);
  };
  const reset = () => {
    setHistory([initialPop(preset)]);
    setPlaying(false);
  };

  const first = history[0];
  const t0 = s0.total;
  const maxT = Math.max(...totals) * 1.1;
  const gx = (k: number) => GX + (k / STEPS) * GW;
  const gy = (v: number) => GY1 - (v / maxT) * (GY1 - GY0);
  const repl = replacementTfr(e0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={CX - HALF / 2} y={TOP - 12} fontSize="12" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400" fontWeight="600">
          мъже
        </text>
        <text x={CX + HALF / 2} y={TOP - 12} fontSize="12" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400" fontWeight="600">
          жени
        </text>
        {pop.m.map((v, i) => {
          const pm = (100 * v) / s.total;
          const pf = (100 * pop.f[i]) / s.total;
          const y = yOf(i);
          return (
            <g key={i}>
              <rect x={CX - 14 - w(pm)} y={y + 1} width={w(pm)} height={ROW - 2} className="fill-sky-500/80" />
              <rect x={CX + 14} y={y + 1} width={w(pf)} height={ROW - 2} className="fill-rose-500/80" />
              {i % 2 === 0 && (
                <text x={CX} y={y + ROW - 3} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                  {i === GROUPS - 1 ? '100+' : 5 * i}
                </text>
              )}
            </g>
          );
        })}
        {/* Началната пирамида – контур за сравнение */}
        {history.length > 1 &&
          first.m.map((v, i) => {
            const y = yOf(i);
            return (
              <g key={`o${i}`} fill="none" className="stroke-gray-800/70 dark:stroke-gray-100/70" strokeWidth="1">
                <rect x={CX - 14 - w((100 * v) / t0)} y={y + 1} width={w((100 * v) / t0)} height={ROW - 2} />
                <rect x={CX + 14} y={y + 1} width={w((100 * first.f[i]) / t0)} height={ROW - 2} />
              </g>
            );
          })}
        {[0, 5, 10].map(p => (
          <g key={p} className="fill-gray-500 dark:fill-gray-400" fontSize="9" textAnchor="middle">
            <text x={CX - 14 - w(p)} y={bottom + 12}>
              {p}%
            </text>
            <text x={CX + 14 + w(p)} y={bottom + 12}>
              {p}%
            </text>
          </g>
        ))}
        <text x={CX} y={bottom + 26} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          дял от населението във всяка петгодишна група
        </text>

        {/* Общото население */}
        <text x={GX + GW / 2} y={GY0 - 26} fontSize="12" textAnchor="middle" fontWeight="600" className="fill-gray-800 dark:fill-gray-100">
          {preset.name}, {year} г.
        </text>
        <text x={GX + GW / 2} y={GY0 - 10} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          население: {fmtPop(s.total)}
        </text>
        <line x1={GX} y1={GY1} x2={GX + GW} y2={GY1} className="stroke-gray-400" />
        <line x1={GX} y1={GY0} x2={GX} y2={GY1} className="stroke-gray-400" />
        <line x1={GX} y1={gy(t0)} x2={GX + GW} y2={gy(t0)} className="stroke-gray-400" strokeDasharray="3 3" />
        <text x={GX - 4} y={gy(t0) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          100%
        </text>
        <polyline
          points={totals.map((v, k) => `${gx(k).toFixed(1)},${gy(v).toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth="2"
        />
        <circle cx={gx(totals.length - 1)} cy={gy(s.total)} r={3.5} className="fill-emerald-600 dark:fill-emerald-400" />
        <text x={GX} y={GY1 + 14} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {preset.year}
        </text>
        <text x={GX + GW} y={GY1 + 14} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {preset.year + 5 * STEPS}
        </text>
        <text x={GX + GW / 2} y={GY1 + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {fmt((100 * s.total) / t0)}% от началното
        </text>
      </LabSvg>
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.name} active={i === pi} onClick={() => choose(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="TFR" value={tfr} onChange={setTfr} min={0.8} max={7} step={0.1} tone="rose" />
        <Slider label="e₀, г." value={e0} onChange={setE0} min={40} max={90} step={1} tone="emerald" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        TFR – колко деца ражда средно една жена; e₀ – средна продължителност на живота. Миграциите не са включени. При e₀ = {e0} години заместването
        изисква TFR ≈ {fmt(repl, 2)}.
      </p>
      <Buttons>
        <DiagramButton onClick={() => (done ? null : setHistory(h => [...h, step(h[h.length - 1], tfr, e0)]))}>+5 години</DiagramButton>
        <DiagramButton active={playing} onClick={() => (done ? null : setPlaying(p => !p))}>
          {playing ? 'Пауза' : 'Пусни'}
        </DiagramButton>
        <DiagramButton onClick={reset}>Отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: '0–14', value: `${fmt(s.young, 1)}%`, tone: 'blue' },
            { label: '65+', value: `${fmt(s.old, 1)}%`, tone: 'rose' },
            { label: 'медиана', value: `${fmt(s.median, 1)} г.`, tone: 'gray' },
            { label: 'зависимост', value: fmt(s.dependency), tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="emerald">
        Тип: {pyramidType(s.young, s.old)}
        {done ? ' – прогнозата стигна 100 години напред' : ''}
      </Note>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Зависимост – колко деца (0–14) и възрастни (65+) се падат на 100 души на 15–64 години. Контурът показва началната пирамида. Началните пирамиди са
        приблизителни (ООН, НСИ), а групите са {groupLabel(0)}, {groupLabel(1)}, … години.
      </p>
    </div>
  );
}
