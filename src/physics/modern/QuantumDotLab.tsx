import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { wavelengthCss } from '~/physics/optics/wavelengthColor';

const HC = 1240; // eV·nm
const EG = 1.74; // ширина на забранената зона на CdSe, eV
// h²/(8R²)·(1/mₑ* + 1/mₕ*) с mₑ* = 0,13mₑ, mₕ* = 0,45mₑ и R = d/2 → 4 · 0,376 · 9,92 / d²
const BOX = 14.9; // eV·nm²

/**
 * Диаметър на точката (nm) по дължината на вълната на първия пик на поглъщане (nm) –
 * емпирична крива за CdSe от измервания (W. W. Yu и сътр., 2003), за около 2–8 nm.
 */
const diameterAt = (l: number) => 1.6122e-9 * l ** 4 - 2.6575e-6 * l ** 3 + 1.6242e-3 * l ** 2 - 0.4277 * l + 41.57;

/** Обратната зависимост – λ по диаметъра, с разполовяване (кривата расте монотонно между 420 и 680 nm). */
function absorptionPeak(d: number) {
  let [lo, hi] = [420, 680];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (diameterAt(mid) < d) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const STOKES = 15; // светенето е малко по-червено от пика на поглъщане, nm
const PRESETS = [2.5, 3, 4, 5, 7];

// Лента на спектъра
const SP = { left: 40, right: 440, y: 214 };
const spx = (nm: number) => SP.left + ((nm - 380) / (720 - 380)) * (SP.right - SP.left);

/** Квантови точки: колкото по-малък е кристалът, толкова по-голяма е енергията и по-синя светлината. */
export default function QuantumDotLab() {
  const [d, setD] = useState(4); // nm

  const lam = absorptionPeak(d);
  const glow = lam + STOKES;
  const Ebox = EG + BOX / (d * d);
  const lamBox = HC / Ebox;
  const r = 10 * d;
  const center = { x: 120, y: 100 };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 246">
        <defs>
          <radialGradient id="qdot-glow">
            <stop offset="0%" stopColor={wavelengthCss(glow)} stopOpacity="0.95" />
            <stop offset="55%" stopColor={wavelengthCss(glow)} stopOpacity="0.55" />
            <stop offset="100%" stopColor={wavelengthCss(glow)} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Точката с ореола на светенето */}
        <circle cx={center.x} cy={center.y} r={r + 34} fill="url(#qdot-glow)" />
        <circle cx={center.x} cy={center.y} r={r} fill={wavelengthCss(glow)} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" />
        <Label p={{ x: center.x, y: center.y + r + 44 }} size={11}>
          {`d = ${fmtNum(d, 1)} nm`}
        </Label>

        {/* Енергетична схема: забранена зона + енергия от „кутията“ */}
        <line x1={270} y1={150} x2={340} y2={150} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        <line x1={270} y1={150 - EG * 30} x2={340} y2={150 - EG * 30} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" strokeDasharray="4 3" />
        <line x1={270} y1={150 - Math.min(Ebox, 4.6) * 30} x2={340} y2={150 - Math.min(Ebox, 4.6) * 30} className="stroke-blue-500" strokeWidth="2" />
        <line x1={305} y1={150} x2={305} y2={150 - Math.min(Ebox, 4.6) * 30} className="stroke-violet-500" strokeWidth="2" markerEnd="url(#qdot-arrow)" />
        <defs>
          <marker id="qdot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-violet-500" />
          </marker>
        </defs>
        <Label p={{ x: 346, y: 150 - EG * 30 }} size={10} anchor="start">
          {`обемен кристал: ${fmtNum(EG, 2)} eV`}
        </Label>
        <Label p={{ x: 346, y: 150 - Math.min(Ebox, 4.6) * 30 }} size={10} anchor="start" tone="blue">
          {`модел на кутия: ${fmtNum(Ebox, 2)} eV`}
        </Label>

        {/* Спектърът */}
        <defs>
          <linearGradient id="qdot-spectrum">
            {Array.from({ length: 15 }, (_, i) => 380 + i * 24.3).map(nm => (
              <stop key={nm} offset={`${((nm - 380) / 340) * 100}%`} stopColor={wavelengthCss(nm)} />
            ))}
          </linearGradient>
        </defs>
        <rect x={SP.left} y={SP.y - 7} width={SP.right - SP.left} height={14} fill="url(#qdot-spectrum)" />
        {[400, 500, 600, 700].map(nm => (
          <Label key={nm} p={{ x: spx(nm), y: SP.y + 18 }} size={9}>
            {`${nm} nm`}
          </Label>
        ))}
        <line x1={spx(glow)} y1={SP.y - 13} x2={spx(glow)} y2={SP.y + 10} className="stroke-gray-900 dark:stroke-white" strokeWidth="3" />
        {lamBox >= 380 ? (
          <line x1={spx(lamBox)} y1={SP.y - 13} x2={spx(lamBox)} y2={SP.y + 10} className="stroke-blue-600" strokeWidth="2" strokeDasharray="3 2" />
        ) : (
          <Label p={{ x: SP.left - 4, y: SP.y - 18 }} size={9} tone="blue" anchor="start">
            ← модел на кутия: УВ
          </Label>
        )}
      </ZoomingSvg>

      <Buttons>
        {PRESETS.map(v => (
          <DiagramButton key={v} active={d === v} onClick={() => setD(v)}>
            {`${fmtNum(v, 1)} nm`}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="d, nm" value={d} onChange={setD} min={2} max={8} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'пик на поглъщане ≈', value: `${fmtNum(lam, 0)} nm`, tone: 'violet' },
            { label: 'светене ≈', value: `${fmtNum(glow, 0)} nm`, tone: 'emerald' },
            { label: 'модел на кутия:', value: `${fmtNum(lamBox, 0)} nm`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="violet">
        {d < 3
          ? 'Малката точка свети синьо-зелено: електронът е „притиснат“ силно и енергията му е голяма.'
          : d > 6
            ? 'Голямата точка свети червено – енергията вече е близо до тази на обемния кристал.'
            : 'Смени размера: по-малка точка – по-голяма енергия – по-къса дължина на вълната.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Цветът е по емпирична крива от измервания на кристали от кадмиев селенид (CdSe) – стойностите са приблизителни. Простият модел на
        кутия (синята пунктирна черта) показва вярната тенденция, но при малките точки силно преувеличава енергията: истинската точка не е
        кутия с безкрайно високи стени, а електронът и дупката се привличат. Затова моделът обяснява защо цветът зависи от размера, но не дава
        точния цвят.
      </p>
    </div>
  );
}
