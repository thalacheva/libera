import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/**
 * Дял различни позиции p в един ген между човека и друг вид. Данните са условни: получени са
 * с модела на Джукс–Кантор при r = 0,001 замени на позиция за 1 млн. г. по всеки клон и шум ±6 %.
 * T – времето на разделяне по вкаменелости (приблизително).
 */
const CALIBRATION: { name: string; T: number; p: number }[] = [
  { name: 'макак', T: 29, p: 0.055 },
  { name: 'мишка', T: 90, p: 0.154 },
  { name: 'кокошка', T: 320, p: 0.435 },
  { name: 'жаба', T: 352, p: 0.442 },
  { name: 'шаран', T: 432, p: 0.514 },
  { name: 'акула', T: 465, p: 0.529 },
];
const UNKNOWN: { name: string; p: number }[] = [
  { name: 'шимпанзе', p: 0.012 },
  { name: 'орангутан', p: 0.029 },
  { name: 'кенгуру', p: 0.249 },
];

/** Поправка на Джукс–Кантор: истинският брой замени на позиция. */
const jc = (p: number) => -0.75 * Math.log(1 - (4 * p) / 3);
const fmt = (v: number, d: number) => v.toFixed(d).replace('.', ',');

// Чертежът
const X0 = 58;
const X1 = 610;
const Y0 = 290;
const Y1 = 20;

/** Молекулен часовник: калибриране по вкаменелости и оценка на времето на разделяне. */
export default function MolecularClockLab() {
  const [corrected, setCorrected] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [r, setR] = useState(1.2); // ×10⁻³ замени на позиция за 1 млн. г. по един клон
  const [picked, setPicked] = useState(0);

  const y = (p: number) => (corrected ? jc(p) : p);
  const tMax = zoom ? 40 : 500;
  const yMax = zoom ? 0.08 : corrected ? 1 : 0.8;
  const sx = (T: number) => X0 + (T / tMax) * (X1 - X0);
  const sy = (v: number) => Y0 - (v / yMax) * (Y0 - Y1);

  // Най-добрата права през началото: 2r = Σ T·y / Σ T²
  const best = CALIBRATION.reduce((a, c) => a + c.T * y(c.p), 0) / CALIBRATION.reduce((a, c) => a + c.T * c.T, 0) / 2;
  const slope = (2 * r) / 1000;
  const u = UNKNOWN[picked];
  const estimate = y(u.p) / slope;

  const xTicks = zoom ? [0, 10, 20, 30, 40] : [0, 100, 200, 300, 400, 500];
  const yTicks = zoom ? [0, 0.02, 0.04, 0.06, 0.08] : corrected ? [0, 0.2, 0.4, 0.6, 0.8, 1] : [0, 0.2, 0.4, 0.6, 0.8];
  const tEnd = Math.min(tMax, (yMax / slope) * 1.02);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Оси */}
        {xTicks.map(t => (
          <g key={'x' + t}>
            <line x1={sx(t)} x2={sx(t)} y1={Y1} y2={Y0} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={sx(t)} y={Y0 + 16} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {t}
            </text>
          </g>
        ))}
        {yTicks.map(v => (
          <g key={'y' + v}>
            <line x1={X0} x2={X1} y1={sy(v)} y2={sy(v)} className="stroke-gray-100 dark:stroke-gray-700" />
            <text x={X0 - 6} y={sy(v) + 4} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(v, zoom ? 2 : 1)}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="stroke-gray-400" />
        <line x1={X0} x2={X0} y1={Y1} y2={Y0} className="stroke-gray-400" />
        <text x={X1} y={Y0 + 32} fontSize="12" textAnchor="end" fill="currentColor">
          време от разделянето по вкаменелости, млн. г.
        </text>
        <text x={X0 + 6} y={Y1 + 4} fontSize="12" fill="currentColor">
          {corrected ? 'd – замени на позиция (поправени)' : 'p – дял различни позиции'}
        </text>

        {!corrected && !zoom && (
          <g>
            <line x1={X0} x2={X1} y1={sy(0.75)} y2={sy(0.75)} className="stroke-gray-400" strokeDasharray="5 4" />
            <text x={X1 - 4} y={sy(0.75) - 5} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              таван 0,75 – случайни последователности
            </text>
          </g>
        )}

        {/* Часовникът: права през началото */}
        <line x1={sx(0)} y1={sy(0)} x2={sx(tEnd)} y2={sy(slope * tEnd)} stroke="#e11d48" strokeWidth={2.5} />

        {/* Неизвестният вид: от оста y до правата и надолу */}
        {estimate <= tMax && (
          <g stroke="#7c3aed" strokeWidth={1.8} strokeDasharray="5 4">
            <line x1={X0} x2={sx(estimate)} y1={sy(y(u.p))} y2={sy(y(u.p))} />
            <line x1={sx(estimate)} x2={sx(estimate)} y1={sy(y(u.p))} y2={Y0} />
          </g>
        )}
        {UNKNOWN.map(k => (
          <circle key={k.name} cx={X0} cy={sy(y(k.p))} r={k === u ? 5 : 3.5} className={k === u ? 'fill-violet-600' : 'fill-violet-300'} />
        ))}

        {/* Калибриращите точки */}
        {CALIBRATION.filter(c => c.T <= tMax).map(c => (
          <g key={c.name}>
            <circle cx={sx(c.T)} cy={sy(y(c.p))} r={5.5} className="fill-sky-600 stroke-white dark:stroke-gray-800" strokeWidth={1.5} />
            <text x={sx(c.T) + (c.T > 400 ? -8 : 8)} y={sy(y(c.p)) + (c.name === 'жаба' ? 16 : -8)} fontSize="12" textAnchor={c.T > 400 ? 'end' : 'start'} fill="currentColor">
              {c.name}
            </text>
          </g>
        ))}
      </LabSvg>

      <Sliders>
        <Slider label="r, ‰" value={r} onChange={setR} min={0.5} max={2} step={0.01} tone="rose" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setR(Math.round(best * 100000) / 100)}>Най-добра права</DiagramButton>
        <DiagramButton active={corrected} onClick={() => setCorrected(c => !c)}>
          Поправка на Джукс–Кантор
        </DiagramButton>
        <DiagramButton active={zoom} onClick={() => setZoom(z => !z)}>
          Само последните 40 млн. г.
        </DiagramButton>
      </Buttons>
      <Buttons>
        {UNKNOWN.map((k, i) => (
          <DiagramButton key={k.name} active={picked === i} onClick={() => setPicked(i)}>
            човек – {k.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: corrected ? 'd' : 'p', value: fmt(y(u.p), 3), tone: 'violet' },
            { label: 'скорост по клон', value: `${fmt(r, 2)}·10⁻³ / млн. г.`, tone: 'rose' },
            { label: 'оценка', value: `${fmt(estimate, 1)} млн. г.`, tone: 'emerald' },
          ]}
        />
      </div>
      <Formula>
        T = {corrected ? 'd' : 'p'} / 2r = {fmt(y(u.p), 3)} / (2 · {fmt(r / 1000, 5)}) ≈ {fmt(estimate, 1)} млн. г.
      </Formula>
      <Note tone={corrected ? 'emerald' : 'amber'}>
        {corrected
          ? 'С поправката точките лягат на права: часовникът „тиктака“ равномерно. Човек – шимпанзе излиза около 6 млн. г.'
          : 'Без поправка старите точки „падат“ под правата – някои позиции са се сменили по няколко пъти, а p не може да надхвърли 0,75. Най-добрата права е твърде полегата и състарява близките разделяния.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Данните са условни, но реалистични. Сините точки са разделяния с известно време по вкаменелости (калибриране), лилавите – видове,
        за които търсим времето. Разликите се натрупват по двата клона след разделянето, затова d = 2rT. Натисни „Най-добра права“ с и без
        поправката и сравни оценките.
      </p>
    </div>
  );
}
