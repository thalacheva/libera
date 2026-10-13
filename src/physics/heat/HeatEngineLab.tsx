import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// Приблизителни стойности: какъв дял от границата на Карно постигат истинските машини
const PRESETS = [
  { name: '🚗 автомобил', th: 2000, tc: 80, q: 0.37 },
  { name: '🏭 ТЕЦ', th: 550, tc: 30, q: 0.65 },
  { name: '♨️ геотермална', th: 150, tc: 30, q: 0.4 },
  { name: '🌊 океанска', th: 26, tc: 5, q: 0.43 },
];

const K = 273.15;

/** Топлинен двигател: от топлината на нагревателя Q₁ част става работа W, а останалото Q₂ отива в хладилника. */
export default function HeatEngineLab() {
  const [th, setTh] = useState(550);
  const [tc, setTc] = useState(30);
  const [q, setQ] = useState(0.65);

  const ok = th > tc;
  const etaC = ok ? 1 - (tc + K) / (th + K) : 0;
  const eta = etaC * q;

  // Енергийният поток: лента с височина H за Q₁, която се разделя на W (вдясно) и Q₂ (надолу)
  const H = 120;
  const hW = Math.max(eta * H, 1.5);
  const hC = H - hW;
  const top = 40;
  const split = 170;
  const right = 440;
  const wTop = top;
  const cTop = top + hW;
  const bottomY = 236;

  const preset = (p: (typeof PRESETS)[number]) => {
    setTh(p.th);
    setTc(p.tc);
    setQ(p.q);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={p.th === th && p.tc === tc && p.q === q} onClick={() => preset(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 260">
        {/* Вход: топлина от нагревателя */}
        <rect x={20} y={top} width={split - 20} height={H} className="fill-rose-400/80" />
        <Label p={{ x: 70, y: top + H / 2 - 9 }} size={13} tone="rose">
          Q₁ = 100%
        </Label>
        <Label p={{ x: 70, y: top + H / 2 + 9 }} size={11}>
          {`от ${fmtNum(th, 0)} °C`}
        </Label>
        {/* Работа – продължава надясно */}
        <rect x={split} y={wTop} width={right - split} height={hW} className="fill-emerald-500/85" />
        <polygon points={`${right},${wTop - 6} ${right + 26},${wTop + hW / 2} ${right},${wTop + hW + 6}`} className="fill-emerald-500/85" />
        <Label p={{ x: (split + right) / 2 + 30, y: wTop - 12 }} size={13} tone="emerald">
          {`W = ${fmtNum(eta * 100, 1)}%`}
        </Label>
        {/* Границата на Карно – пунктир върху лентата */}
        <line x1={split} y1={top + etaC * H} x2={right} y2={top + etaC * H} className="stroke-gray-700 dark:stroke-gray-200" strokeDasharray="5 4" strokeWidth="1.5" />
        <Label p={{ x: right - 4, y: top + etaC * H + 10 }} size={10} anchor="end">
          {`граница на Карно ${fmtNum(etaC * 100, 1)}%`}
        </Label>
        {/* Отдадена топлина – завива надолу */}
        <path
          d={`M ${split} ${cTop} L ${split + 40} ${cTop} Q ${split + 40 + hC} ${cTop} ${split + 40 + hC} ${cTop + hC} L ${split + 40 + hC} ${bottomY - 10} L ${split + 40} ${bottomY - 10} L ${split + 40} ${top + H} L ${split} ${top + H} Z`}
          className="fill-sky-400/75"
        />
        <Label p={{ x: split + 40 + hC + 8, y: bottomY - 22 }} size={13} tone="blue" anchor="start">
          {`Q₂ = ${fmtNum((1 - eta) * 100, 1)}%`}
        </Label>
        <Label p={{ x: split + 40 + hC + 8, y: bottomY - 6 }} size={11} anchor="start">
          {`към ${fmtNum(tc, 0)} °C`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="T₁, °C" value={th} onChange={setTh} min={20} max={2000} step={1} tone="rose" />
        <Slider label="T₂, °C" value={tc} onChange={setTc} min={-20} max={100} step={1} tone="blue" />
        <Slider label="качество" value={q} onChange={setQ} min={0.2} max={1} step={0.01} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'η Карно =', value: `${fmtNum(etaC * 100, 1)}%` },
            { label: 'η =', value: `${fmtNum(eta * 100, 1)}%`, tone: 'emerald' },
            { label: 'от 1000 J:', value: `W = ${fmtNum(eta * 1000, 0)} J`, tone: 'emerald' },
            { label: 'Q₂ =', value: `${fmtNum((1 - eta) * 1000, 0)} J`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={ok ? 'gray' : 'rose'}>
        {ok
          ? `η_max = 1 − T₂/T₁ = 1 − ${fmtNum(tc + K, 0)} K / ${fmtNum(th + K, 0)} K. Температурите са в келвини!`
          : 'Нагревателят трябва да е по-топъл от хладилника – иначе двигател не може да работи.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 „Качество“ е каква част от границата на Карно постига истинската машина (триене, загуби на топлина, бързи процеси). Стойностите в
        бутоните са груби ориентири. Дори идеалната машина не превръща цялата топлина в работа – част винаги отива в по-студеното тяло.
      </p>
    </div>
  );
}
